"""
Workflow engine for orchestrating task execution.

Ported from ruflo v3/src/task-execution/application/WorkflowEngine.ts
Handles workflow planning, execution, and rollback.

Powered by ruflo (github.com/ruvnet/ruflo) - ported to Python for SegurCaixa Adeslas
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Set
import asyncio
import uuid

from .types import (
    Task,
    TaskStatus,
    WorkflowDefinition,
    WorkflowMetrics,
    WorkflowResult,
    WorkflowState,
    WorkflowStatus,
)
from .swarm_coordinator import SwarmCoordinator

logger = logging.getLogger(__name__)


class WorkflowEngine:
    """
    Orchestrates the execution of workflows across a swarm of agents.
    Handles dependency resolution, parallel execution, and rollback.
    """

    def __init__(self, coordinator: SwarmCoordinator):
        """
        Initialize the workflow engine.

        Args:
            coordinator: SwarmCoordinator instance
        """
        self.coordinator = coordinator
        self._workflows: Dict[str, WorkflowResult] = {}
        self._running_workflows: Set[str] = set()
        self._lock = asyncio.Lock()

        logger.info("Initialized WorkflowEngine")

    async def execute_workflow(
        self,
        workflow: WorkflowDefinition,
        variables: Optional[Dict[str, Any]] = None,
    ) -> WorkflowResult:
        """
        Execute a workflow to completion.

        Handles dependency resolution, parallel execution, and error handling.

        Args:
            workflow: Workflow definition
            variables: Initial workflow variables

        Returns:
            WorkflowResult with execution metrics and output
        """
        result = WorkflowResult(
            id=str(uuid.uuid4()),
            status=WorkflowStatus.RUNNING,
            started_at=datetime.utcnow(),
        )

        self._workflows[result.id] = result
        self._running_workflows.add(result.id)

        logger.info(f"Starting workflow execution: {result.id}")
        self._log_trace(result, "workflow_started", {"workflow_name": workflow.name})

        try:
            # Copy tasks and reset status
            tasks = [
                Task(
                    id=task.id,
                    type=task.type,
                    name=task.name,
                    description=task.description,
                    priority=task.priority,
                    depends_on=task.depends_on.copy(),
                    parameters={**task.parameters, **(variables or {})},
                    metadata=task.metadata.copy(),
                )
                for task in workflow.tasks
            ]
            result.tasks = tasks

            # Execute workflow
            completed_task_ids: Set[str] = set()
            failed_task_ids: Set[str] = set()

            while len(completed_task_ids) + len(failed_task_ids) < len(tasks):
                # Find executable tasks
                executable_tasks = [
                    t
                    for t in tasks
                    if t.status == TaskStatus.PENDING
                    and all(dep_id in completed_task_ids for dep_id in t.depends_on)
                ]

                if not executable_tasks:
                    # Check for circular dependencies or deadlock
                    remaining = [
                        t
                        for t in tasks
                        if t.status not in [TaskStatus.COMPLETED, TaskStatus.FAILED]
                    ]
                    if remaining:
                        error_msg = "Workflow deadlock: no executable tasks and dependencies unmet"
                        logger.error(error_msg)
                        result.error = error_msg
                        result.status = WorkflowStatus.FAILED
                        break

                # Execute tasks in parallel
                logger.info(f"Executing {len(executable_tasks)} tasks in parallel")
                self._log_trace(
                    result,
                    "parallel_execution_start",
                    {"task_count": len(executable_tasks)},
                )

                executed_tasks = await self.coordinator.execute_tasks_concurrently(
                    executable_tasks,
                    max_concurrent=10,  # Limit concurrent tasks
                )

                # Update results
                for task in executed_tasks:
                    if task.status == TaskStatus.COMPLETED:
                        completed_task_ids.add(task.id)
                        result.output[task.id] = task.result
                    else:
                        failed_task_ids.add(task.id)
                        logger.error(f"Task {task.id} failed: {task.error}")

                # Update task in result
                for i, original_task in enumerate(tasks):
                    for executed_task in executed_tasks:
                        if original_task.id == executed_task.id:
                            tasks[i] = executed_task
                            break

                result.state.completed_tasks.extend(
                    [t.id for t in executed_tasks if t.status == TaskStatus.COMPLETED]
                )
                result.state.failed_tasks.extend(
                    [t.id for t in executed_tasks if t.status == TaskStatus.FAILED]
                )

            # Check final status
            if failed_task_ids:
                logger.error(f"Workflow failed with {len(failed_task_ids)} failed tasks")
                result.status = WorkflowStatus.FAILED
                result.error = f"{len(failed_task_ids)} tasks failed"
                self._log_trace(result, "workflow_failed", {"failed_count": len(failed_task_ids)})
            else:
                logger.info("Workflow completed successfully")
                result.status = WorkflowStatus.COMPLETED
                self._log_trace(result, "workflow_completed", {})

        except asyncio.CancelledError:
            logger.warning(f"Workflow {result.id} cancelled")
            result.status = WorkflowStatus.CANCELLED
            self._log_trace(result, "workflow_cancelled", {})
            await self._rollback_workflow(result)

        except Exception as e:
            logger.error(f"Workflow execution error: {e}")
            result.status = WorkflowStatus.FAILED
            result.error = str(e)
            self._log_trace(result, "workflow_error", {"error": str(e)})
            await self._rollback_workflow(result)

        finally:
            result.completed_at = datetime.utcnow()
            result.metrics = self._calculate_metrics(result)
            self._running_workflows.discard(result.id)

        return result

    async def start_workflow(
        self,
        workflow: WorkflowDefinition,
        variables: Optional[Dict[str, Any]] = None,
    ) -> asyncio.Task:
        """
        Start a workflow asynchronously.

        Args:
            workflow: Workflow definition
            variables: Initial variables

        Returns:
            asyncio.Task that can be awaited
        """
        task = asyncio.create_task(self.execute_workflow(workflow, variables))
        return task

    async def pause_workflow(self, workflow_id: str) -> None:
        """
        Pause a running workflow.

        Args:
            workflow_id: ID of workflow to pause
        """
        if workflow_id not in self._workflows:
            logger.warning(f"Workflow {workflow_id} not found")
            return

        result = self._workflows[workflow_id]
        if result.status == WorkflowStatus.RUNNING:
            result.status = WorkflowStatus.PAUSED
            result.state.paused_at = datetime.utcnow()
            logger.info(f"Workflow {workflow_id} paused")
            self._log_trace(result, "workflow_paused", {})

    async def resume_workflow(self, workflow_id: str) -> None:
        """
        Resume a paused workflow.

        Args:
            workflow_id: ID of workflow to resume
        """
        if workflow_id not in self._workflows:
            logger.warning(f"Workflow {workflow_id} not found")
            return

        result = self._workflows[workflow_id]
        if result.status == WorkflowStatus.PAUSED:
            result.status = WorkflowStatus.RUNNING
            logger.info(f"Workflow {workflow_id} resumed")
            self._log_trace(result, "workflow_resumed", {})

    def get_workflow_state(self, workflow_id: str) -> Optional[WorkflowState]:
        """
        Get the state of a workflow.

        Args:
            workflow_id: ID of workflow

        Returns:
            WorkflowState or None if not found
        """
        if workflow_id not in self._workflows:
            return None
        return self._workflows[workflow_id].state

    def get_workflow_metrics(self, workflow_id: str) -> Optional[WorkflowMetrics]:
        """
        Get metrics for a workflow.

        Args:
            workflow_id: ID of workflow

        Returns:
            WorkflowMetrics or None if not found
        """
        if workflow_id not in self._workflows:
            return None
        return self._workflows[workflow_id].metrics

    async def execute_parallel(self, tasks: List[Task]) -> List[Task]:
        """
        Execute multiple tasks in parallel without dependencies.

        Args:
            tasks: List of independent tasks

        Returns:
            List of completed tasks
        """
        logger.info(f"Executing {len(tasks)} tasks in parallel")
        return await self.coordinator.execute_tasks_concurrently(tasks)

    async def execute_distributed_workflow(
        self,
        workflow: WorkflowDefinition,
        coordinators: List[SwarmCoordinator],
    ) -> WorkflowResult:
        """
        Execute a workflow across multiple coordinators.

        Distributes workflow execution across multiple swarms for large-scale processing.

        Args:
            workflow: Workflow definition
            coordinators: List of SwarmCoordinator instances

        Returns:
            WorkflowResult with execution metrics
        """
        result = WorkflowResult(
            id=str(uuid.uuid4()),
            status=WorkflowStatus.RUNNING,
            started_at=datetime.utcnow(),
        )

        logger.info(
            f"Starting distributed workflow execution across {len(coordinators)} coordinators"
        )

        try:
            # Distribute tasks to coordinators round-robin
            tasks = workflow.tasks.copy()
            coordinator_idx = 0

            for task in tasks:
                coordinator = coordinators[coordinator_idx % len(coordinators)]
                executed_task = await coordinator.distribute_tasks([task])
                coordinator_idx += 1

                if executed_task and executed_task[0].status == TaskStatus.COMPLETED:
                    result.output[task.id] = executed_task[0].result

            result.status = WorkflowStatus.COMPLETED
            logger.info("Distributed workflow completed successfully")

        except Exception as e:
            logger.error(f"Distributed workflow error: {e}")
            result.status = WorkflowStatus.FAILED
            result.error = str(e)

        finally:
            result.completed_at = datetime.utcnow()
            result.metrics = self._calculate_metrics(result)

        return result

    async def _rollback_workflow(self, result: WorkflowResult) -> None:
        """
        Rollback a failed workflow.

        Executes rollback logic for completed tasks in reverse order.

        Args:
            result: WorkflowResult to rollback
        """
        logger.info(f"Rolling back workflow {result.id}")

        completed_tasks = [t for t in result.tasks if t.status == TaskStatus.COMPLETED]

        # Process rollback in reverse order of completion
        for task in reversed(completed_tasks):
            logger.info(f"Rolling back task {task.id}")
            task.status = TaskStatus.ROLLED_BACK
            self._log_trace(result, "task_rolled_back", {"task_id": task.id})

        result.status = WorkflowStatus.ROLLED_BACK
        logger.info(f"Workflow {result.id} rolled back")

    def _calculate_metrics(self, result: WorkflowResult) -> WorkflowMetrics:
        """Calculate metrics for a workflow."""
        metrics = WorkflowMetrics()
        metrics.total_duration_ms = result.get_duration_ms()
        metrics.task_count = len(result.tasks)
        metrics.completed_tasks = sum(
            1 for t in result.tasks if t.status == TaskStatus.COMPLETED
        )
        metrics.failed_tasks = sum(
            1 for t in result.tasks if t.status == TaskStatus.FAILED
        )
        metrics.skipped_tasks = sum(
            1 for t in result.tasks if t.status == TaskStatus.SKIPPED
        )

        # Calculate average task duration
        completed = [t for t in result.tasks if t.duration_ms]
        if completed:
            metrics.average_task_duration_ms = sum(t.duration_ms for t in completed) / len(
                completed
            )

        # Calculate agent utilization
        coordinator_state = self.coordinator.get_swarm_state()
        for agent_id, agent_metrics in coordinator_state.agent_metrics.items():
            if agent_metrics.tasks_executed > 0:
                metrics.agent_utilization[agent_id] = agent_metrics.get_utilization()

        return metrics

    def _log_trace(
        self,
        result: WorkflowResult,
        event: str,
        data: Dict[str, Any],
    ) -> None:
        """Log an execution trace event."""
        trace_entry = {
            "event": event,
            "timestamp": datetime.utcnow().isoformat(),
            **data,
        }
        result.execution_trace.append(trace_entry)

    def get_workflow_result(self, workflow_id: str) -> Optional[WorkflowResult]:
        """Get the result of a workflow."""
        return self._workflows.get(workflow_id)

    def get_workflow_debug_info(self, workflow_id: str) -> Dict[str, Any]:
        """
        Get detailed debug information for a workflow.

        Args:
            workflow_id: ID of workflow

        Returns:
            Dictionary with debug information
        """
        if workflow_id not in self._workflows:
            return {}

        result = self._workflows[workflow_id]

        return {
            "id": result.id,
            "status": result.status.value,
            "duration_ms": result.get_duration_ms(),
            "task_count": len(result.tasks),
            "completed_tasks": len([t for t in result.tasks if t.status == TaskStatus.COMPLETED]),
            "failed_tasks": len([t for t in result.tasks if t.status == TaskStatus.FAILED]),
            "tasks": [
                {
                    "id": t.id,
                    "name": t.name,
                    "type": t.type.value,
                    "status": t.status.value,
                    "duration_ms": t.duration_ms,
                    "error": t.error,
                    "assigned_to": t.assigned_to,
                }
                for t in result.tasks
            ],
            "execution_trace": result.execution_trace,
            "metrics": {
                "total_duration_ms": result.metrics.total_duration_ms,
                "average_task_duration_ms": result.metrics.average_task_duration_ms,
                "success_rate": result.metrics.calculate_success_rate(),
                "agent_utilization": result.metrics.agent_utilization,
            },
        }

    def __repr__(self) -> str:
        """String representation of engine."""
        return (
            f"WorkflowEngine(running_workflows={len(self._running_workflows)}, "
            f"total_workflows={len(self._workflows)})"
        )
