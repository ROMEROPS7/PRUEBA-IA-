"""
Agent node implementation for ruflo orchestration.

Ported from ruflo v3/src/agent-lifecycle/domain/Agent.ts
Wraps backend agents for orchestration in swarm coordination.

Powered by ruflo (github.com/ruvnet/ruflo) - ported to Python for SegurCaixa Adeslas
"""

import logging
from datetime import datetime
from typing import Any, Dict, Optional, Set
import asyncio

from .types import Agent, AgentStatus, AgentType, Task, TaskStatus

logger = logging.getLogger(__name__)


class AgentNode:
    """
    Agent node in the ruflo orchestration framework.
    Wraps a backend agent instance for coordination.
    """

    def __init__(
        self,
        id: str,
        agent_type: AgentType,
        backend_agent: Any = None,
        capabilities: Optional[Set[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """
        Initialize an agent node.

        Args:
            id: Unique agent identifier
            agent_type: Type of agent (classifier, chat, voice, docs, assignment, orchestrator)
            backend_agent: Backend agent instance to wrap
            capabilities: Set of task types this agent can execute
            metadata: Additional metadata
        """
        self.config = Agent(
            id=id,
            type=agent_type,
            capabilities=capabilities or set(),
            metadata=metadata or {},
        )
        self.backend_agent = backend_agent
        self._task_queue: list[Task] = []
        self._executing_task: Optional[Task] = None
        self._execute_lock = asyncio.Lock()

        logger.info(
            f"Initialized agent {id} of type {agent_type.value} with capabilities: {self.config.capabilities}"
        )

    @property
    def id(self) -> str:
        """Get agent ID."""
        return self.config.id

    @property
    def type(self) -> AgentType:
        """Get agent type."""
        return self.config.type

    @property
    def status(self) -> AgentStatus:
        """Get agent status."""
        return self.config.status

    @property
    def capabilities(self) -> Set[str]:
        """Get agent capabilities."""
        return self.config.capabilities

    def set_status(self, status: AgentStatus) -> None:
        """Set agent status."""
        old_status = self.config.status
        self.config.status = status
        self.config.last_active = datetime.utcnow()
        logger.debug(f"Agent {self.id} status changed from {old_status.value} to {status.value}")

    def add_capability(self, capability: str) -> None:
        """Add a capability to this agent."""
        self.config.capabilities.add(capability)
        logger.debug(f"Added capability '{capability}' to agent {self.id}")

    def has_capability(self, capability: str) -> bool:
        """Check if agent has a capability."""
        return capability in self.config.capabilities

    def can_execute(self, task_type: str) -> bool:
        """
        Check if agent can execute a specific task type.

        Args:
            task_type: Type of task to check

        Returns:
            True if agent can execute the task type
        """
        if self.status == AgentStatus.TERMINATED:
            return False
        return self.has_capability(task_type)

    async def execute_task(self, task: Task) -> Task:
        """
        Execute a task with this agent.

        Args:
            task: Task to execute

        Returns:
            Completed task with result and status

        Raises:
            RuntimeError: If task cannot be executed
            Exception: If task execution fails
        """
        async with self._execute_lock:
            if not self.can_execute(task.type.value):
                error_msg = f"Agent {self.id} cannot execute task type {task.type.value}"
                logger.error(error_msg)
                task.status = TaskStatus.FAILED
                task.error = error_msg
                return task

            if self.status == AgentStatus.TERMINATED:
                error_msg = f"Agent {self.id} is terminated"
                logger.error(error_msg)
                task.status = TaskStatus.FAILED
                task.error = error_msg
                return task

            task.assigned_to = self.id
            task.status = TaskStatus.EXECUTING
            task.started_at = datetime.utcnow()
            self._executing_task = task

            try:
                self.set_status(AgentStatus.PROCESSING)

                # Execute via backend agent if available
                if self.backend_agent and hasattr(self.backend_agent, "execute"):
                    logger.info(f"Executing task {task.id} ({task.type.value}) via backend agent {self.id}")
                    if asyncio.iscoroutinefunction(self.backend_agent.execute):
                        task.result = await self.backend_agent.execute(task.parameters)
                    else:
                        task.result = self.backend_agent.execute(task.parameters)
                else:
                    logger.info(f"Executing task {task.id} ({task.type.value}) on agent {self.id}")
                    # Simulate execution if no backend agent
                    await asyncio.sleep(0.1)
                    task.result = {"status": "executed", "agent_id": self.id}

                task.status = TaskStatus.COMPLETED
                task.error = None
                logger.info(f"Task {task.id} completed successfully on agent {self.id}")

            except asyncio.CancelledError:
                logger.warning(f"Task {task.id} cancelled on agent {self.id}")
                task.status = TaskStatus.FAILED
                task.error = "Task cancelled"
                raise

            except Exception as e:
                error_msg = str(e)
                logger.error(f"Task {task.id} failed on agent {self.id}: {error_msg}")
                task.status = TaskStatus.FAILED
                task.error = error_msg
                task.retry_count += 1

            finally:
                task.completed_at = datetime.utcnow()
                task.duration_ms = task.get_duration()
                self._executing_task = None
                self.set_status(AgentStatus.IDLE)

            return task

    async def terminate(self) -> None:
        """
        Terminate this agent gracefully.

        Cancels any executing task and marks agent as terminated.
        """
        logger.info(f"Terminating agent {self.id}")

        # Cancel executing task
        if self._executing_task:
            logger.warning(f"Cancelling executing task {self._executing_task.id} on agent {self.id}")
            self._executing_task.status = TaskStatus.FAILED
            self._executing_task.error = "Agent terminated"
            self._executing_task = None

        # Terminate backend agent if it has a terminate method
        if self.backend_agent and hasattr(self.backend_agent, "terminate"):
            if asyncio.iscoroutinefunction(self.backend_agent.terminate):
                await self.backend_agent.terminate()
            else:
                self.backend_agent.terminate()

        self.set_status(AgentStatus.TERMINATED)
        logger.info(f"Agent {self.id} terminated")

    def get_config(self) -> Agent:
        """Get agent configuration."""
        return self.config

    def get_metadata(self) -> Dict[str, Any]:
        """Get agent metadata."""
        return self.config.metadata

    def set_metadata(self, key: str, value: Any) -> None:
        """Set metadata value."""
        self.config.metadata[key] = value

    def get_queue_length(self) -> int:
        """Get number of queued tasks."""
        return len(self._task_queue)

    def is_executing(self) -> bool:
        """Check if agent is currently executing a task."""
        return self._executing_task is not None

    def __repr__(self) -> str:
        """String representation of agent."""
        return (
            f"AgentNode(id={self.id}, type={self.type.value}, "
            f"status={self.status.value}, capabilities={self.capabilities})"
        )
