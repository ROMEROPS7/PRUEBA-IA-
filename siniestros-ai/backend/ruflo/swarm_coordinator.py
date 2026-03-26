"""
Swarm coordinator for multi-agent orchestration.

Ported from ruflo v3/src/coordination/application/SwarmCoordinator.ts
Handles agent spawning, task distribution, and swarm topology management.

Powered by ruflo (github.com/ruvnet/ruflo) - ported to Python for SegurCaixa Adeslas
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Set
import asyncio
import uuid
from collections import defaultdict

from .types import (
    Agent,
    AgentMessage,
    AgentMetrics,
    AgentStatus,
    AgentType,
    ConsensusResult,
    MeshConnection,
    SwarmConfig,
    SwarmState,
    SwarmTopology,
    Task,
    TaskPriority,
    TaskStatus,
)
from .agent import AgentNode

logger = logging.getLogger(__name__)


class SwarmCoordinator:
    """
    Coordinates a swarm of agents for distributed task execution.
    Supports hierarchical, mesh, and simple topologies.
    """

    def __init__(self, config: Optional[SwarmConfig] = None):
        """
        Initialize the swarm coordinator.

        Args:
            config: Swarm configuration
        """
        self.config = config or SwarmConfig()
        self.state = SwarmState(topology=self.config.topology)
        self._agents: Dict[str, AgentNode] = {}
        self._message_queue: Dict[str, List[AgentMessage]] = defaultdict(list)
        self._task_assignments: Dict[str, List[str]] = defaultdict(list)
        self._event_handlers: Dict[str, List[Any]] = defaultdict(list)
        self._lock = asyncio.Lock()
        self._running_tasks: Set[asyncio.Task] = set()

        logger.info(f"Initialized SwarmCoordinator with topology: {self.config.topology.value}")

    async def spawn_agent(
        self,
        agent_type: AgentType,
        backend_agent: Optional[Any] = None,
        capabilities: Optional[Set[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AgentNode:
        """
        Spawn a new agent in the swarm.

        Args:
            agent_type: Type of agent to spawn
            backend_agent: Backend agent instance to wrap
            capabilities: Set of capabilities for the agent
            metadata: Additional metadata

        Returns:
            The spawned AgentNode

        Raises:
            RuntimeError: If swarm is at max capacity
        """
        async with self._lock:
            if len(self._agents) >= self.config.max_agents:
                raise RuntimeError(f"Swarm at max capacity ({self.config.max_agents})")

            agent_id = str(uuid.uuid4())
            agent = AgentNode(
                id=agent_id,
                agent_type=agent_type,
                backend_agent=backend_agent,
                capabilities=capabilities or set(),
                metadata=metadata or {},
            )

            self._agents[agent_id] = agent
            self.state.agents.append(agent.config)
            self._task_assignments[agent_id] = []
            self._message_queue[agent_id] = []

            # Initialize metrics
            self.state.agent_metrics[agent_id] = AgentMetrics(agent_id=agent_id)

            # Set as leader if it's an orchestrator and no leader exists
            if agent_type == AgentType.ORCHESTRATOR and not self.config.leader_id:
                self.config.leader_id = agent_id
                agent.config.role = "leader"
                logger.info(f"Agent {agent_id} designated as swarm leader")

            logger.info(f"Spawned agent {agent_id} of type {agent_type.value}")
            self._emit_event("agent_spawned", {"agent_id": agent_id, "type": agent_type.value})

            return agent

    async def terminate_agent(self, agent_id: str) -> None:
        """
        Terminate an agent in the swarm.

        Args:
            agent_id: ID of agent to terminate
        """
        async with self._lock:
            if agent_id not in self._agents:
                logger.warning(f"Agent {agent_id} not found")
                return

            agent = self._agents[agent_id]
            await agent.terminate()

            # Update state
            self.state.agents = [a for a in self.state.agents if a.id != agent_id]
            del self._agents[agent_id]

            logger.info(f"Terminated agent {agent_id}")
            self._emit_event("agent_terminated", {"agent_id": agent_id})

    def list_agents(self) -> List[AgentNode]:
        """List all agents in the swarm."""
        return list(self._agents.values())

    async def distribute_tasks(self, tasks: List[Task]) -> None:
        """
        Distribute tasks to agents based on load balancing.

        Uses lowest-load strategy: assigns to agent with fewest current tasks.

        Args:
            tasks: List of tasks to distribute
        """
        for task in tasks:
            best_agent = self._find_best_agent(task)
            if best_agent:
                await self.execute_task(best_agent.id, task)
            else:
                logger.warning(f"No suitable agent found for task {task.id}")
                task.status = TaskStatus.FAILED
                task.error = "No suitable agent available"

    def _find_best_agent(self, task: Task) -> Optional[AgentNode]:
        """
        Find the best agent to execute a task.

        Prioritizes:
        1. Agent capability to execute task
        2. Lowest current load
        3. IDLE status preferred

        Args:
            task: Task to find agent for

        Returns:
            Best AgentNode or None
        """
        candidates = []

        for agent in self._agents.values():
            if agent.can_execute(task.type.value):
                load = len(self._task_assignments[agent.id])
                candidates.append((agent, load))

        if not candidates:
            return None

        # Sort by load (lowest first), then by status (IDLE first)
        candidates.sort(key=lambda x: (x[1], x[0].status != AgentStatus.IDLE))
        return candidates[0][0]

    async def execute_task(self, agent_id: str, task: Task) -> Task:
        """
        Execute a task on a specific agent.

        Args:
            agent_id: ID of agent
            task: Task to execute

        Returns:
            Completed task
        """
        if agent_id not in self._agents:
            raise ValueError(f"Agent {agent_id} not found")

        agent = self._agents[agent_id]
        self._task_assignments[agent_id].append(task.id)

        # Track execution
        self.state.active_tasks.append(task.id)
        start_time = datetime.utcnow()

        try:
            result_task = await agent.execute_task(task)
        finally:
            # Remove from active tasks
            if task.id in self.state.active_tasks:
                self.state.active_tasks.remove(task.id)
            if task.id in self._task_assignments[agent_id]:
                self._task_assignments[agent_id].remove(task.id)

            # Update metrics
            duration = (datetime.utcnow() - start_time).total_seconds() * 1000
            self._update_agent_metrics(
                agent_id,
                duration,
                result_task.status == TaskStatus.COMPLETED,
            )

        return result_task

    async def execute_tasks_concurrently(
        self,
        tasks: List[Task],
        max_concurrent: Optional[int] = None,
    ) -> List[Task]:
        """
        Execute multiple tasks concurrently.

        Args:
            tasks: List of tasks to execute
            max_concurrent: Maximum concurrent tasks (default: unlimited)

        Returns:
            List of completed tasks
        """
        if max_concurrent:
            # Create semaphore for limiting concurrency
            semaphore = asyncio.Semaphore(max_concurrent)

            async def execute_with_semaphore(task: Task) -> Task:
                async with semaphore:
                    best_agent = self._find_best_agent(task)
                    if best_agent:
                        return await self.execute_task(best_agent.id, task)
                    task.status = TaskStatus.FAILED
                    task.error = "No suitable agent available"
                    return task

            return await asyncio.gather(*[execute_with_semaphore(t) for t in tasks])
        else:
            # Execute all concurrently
            agents_map = {agent.id: agent for agent in self._agents.values()}

            async def execute_task_safe(task: Task) -> Task:
                best_agent = self._find_best_agent(task)
                if best_agent:
                    return await self.execute_task(best_agent.id, task)
                task.status = TaskStatus.FAILED
                task.error = "No suitable agent available"
                return task

            return await asyncio.gather(*[execute_task_safe(t) for t in tasks])

    def send_message(
        self,
        message: AgentMessage,
    ) -> None:
        """
        Send a message between agents.

        Args:
            message: Message to send
        """
        if message.to_agent not in self._agents:
            logger.warning(f"Agent {message.to_agent} not found")
            return

        self._message_queue[message.to_agent].append(message)
        self.state.total_messages += 1

        logger.debug(
            f"Message sent from {message.from_agent} to {message.to_agent}: {message.subject}"
        )
        self._emit_event("message_sent", {"message_id": message.id})

    def get_messages(self, agent_id: str) -> List[AgentMessage]:
        """Get messages for an agent."""
        messages = self._message_queue.get(agent_id, [])
        self._message_queue[agent_id] = []
        return messages

    def get_swarm_state(self) -> SwarmState:
        """Get current swarm state."""
        self.state.last_updated = datetime.utcnow()
        return self.state

    def get_hierarchy(self) -> Dict[str, Any]:
        """
        Get swarm hierarchy (for hierarchical topology).

        Returns:
            Dictionary representing agent hierarchy
        """
        if self.config.topology != SwarmTopology.HIERARCHICAL:
            return {}

        hierarchy = {
            "leader_id": self.config.leader_id,
            "agents": {},
        }

        for agent_id, agent in self._agents.items():
            parent_id = agent.config.parent
            if parent_id not in hierarchy["agents"]:
                hierarchy["agents"][parent_id or "root"] = []
            hierarchy["agents"][parent_id or "root"].append(
                {
                    "id": agent_id,
                    "type": agent.type.value,
                    "status": agent.status.value,
                }
            )

        return hierarchy

    def get_mesh_connections(self) -> List[MeshConnection]:
        """Get mesh connections (for mesh topology)."""
        return self.state.connections

    async def scale_agents(self, agent_type: AgentType, count: int) -> List[AgentNode]:
        """
        Scale the number of agents of a specific type.

        Args:
            agent_type: Type of agents to scale
            count: Target count

        Returns:
            List of spawned agents
        """
        current_count = sum(1 for a in self._agents.values() if a.type == agent_type)
        difference = count - current_count

        spawned = []

        if difference > 0:
            logger.info(f"Scaling up {difference} agents of type {agent_type.value}")
            for _ in range(difference):
                agent = await self.spawn_agent(agent_type)
                spawned.append(agent)
        elif difference < 0:
            logger.info(f"Scaling down {-difference} agents of type {agent_type.value}")
            agents_to_remove = [
                a for a in self._agents.values() if a.type == agent_type
            ][:-difference]
            for agent in agents_to_remove:
                await self.terminate_agent(agent.id)

        self._emit_event("agents_scaled", {"type": agent_type.value, "target_count": count})
        return spawned

    async def reach_consensus(
        self,
        decision_id: str,
        decision: Any,
        agent_ids: Optional[List[str]] = None,
    ) -> ConsensusResult:
        """
        Reach consensus among agents on a decision.

        Args:
            decision_id: ID of decision
            decision: Decision to reach consensus on
            agent_ids: Specific agents to include (default: all)

        Returns:
            ConsensusResult with voting information
        """
        if not agent_ids:
            agent_ids = list(self._agents.keys())

        # Simulate consensus voting
        votes = {}
        for agent_id in agent_ids:
            if agent_id in self._agents:
                # Simple voting: 70% agreement threshold
                votes[agent_id] = True  # In real implementation, would query agent

        total_votes = len(votes)
        agreement = sum(1 for v in votes.values() if v) if total_votes > 0 else 0
        agreement_percentage = (agreement / total_votes * 100) if total_votes > 0 else 0

        result = ConsensusResult(
            decision_id=decision_id,
            decision=decision,
            consensus_reached=agreement_percentage >= 70,
            agreement_percentage=agreement_percentage,
            agent_votes=votes,
        )

        logger.info(
            f"Consensus reached: {result.consensus_reached} "
            f"({result.agreement_percentage:.1f}% agreement)"
        )
        self._emit_event("consensus_reached", result.__dict__)

        return result

    def get_agent_metrics(self, agent_id: str) -> Optional[AgentMetrics]:
        """Get metrics for a specific agent."""
        return self.state.agent_metrics.get(agent_id)

    async def reconfigure(self, topology: SwarmTopology) -> None:
        """
        Reconfigure swarm topology.

        Args:
            topology: New topology
        """
        logger.info(f"Reconfiguring swarm from {self.config.topology.value} to {topology.value}")
        self.config.topology = topology
        self.state.topology = topology

        if topology == SwarmTopology.MESH:
            self._setup_mesh_connections()

        self._emit_event("topology_changed", {"topology": topology.value})

    def _setup_mesh_connections(self) -> None:
        """Set up full mesh connections between all agents."""
        self.state.connections = []
        agents = list(self._agents.keys())

        for i, agent_a in enumerate(agents):
            for agent_b in agents[i + 1 :]:
                connection = MeshConnection(
                    agent_id_a=agent_a,
                    agent_id_b=agent_b,
                    active=True,
                    latency_ms=1.0,
                    bandwidth_mbps=100.0,
                )
                self.state.connections.append(connection)

    def _update_agent_metrics(
        self,
        agent_id: str,
        duration_ms: float,
        success: bool,
    ) -> None:
        """Update metrics for an agent."""
        if agent_id not in self.state.agent_metrics:
            return

        metrics = self.state.agent_metrics[agent_id]
        metrics.tasks_executed += 1

        if success:
            metrics.tasks_completed += 1
        else:
            metrics.tasks_failed += 1

        # Update average duration
        total_duration = metrics.average_task_duration_ms * (metrics.tasks_executed - 1) + duration_ms
        metrics.average_task_duration_ms = total_duration / metrics.tasks_executed
        metrics.last_heartbeat = datetime.utcnow()

    def _emit_event(self, event_type: str, data: Any) -> None:
        """Emit an event to registered handlers."""
        if event_type in self._event_handlers:
            for handler in self._event_handlers[event_type]:
                try:
                    handler(data)
                except Exception as e:
                    logger.error(f"Error in event handler for {event_type}: {e}")

    def on(self, event_type: str, handler: Any) -> None:
        """Register an event handler."""
        self._event_handlers[event_type].append(handler)
        logger.debug(f"Registered handler for event: {event_type}")

    def __repr__(self) -> str:
        """String representation of coordinator."""
        return (
            f"SwarmCoordinator(topology={self.config.topology.value}, "
            f"agents={len(self._agents)}, "
            f"active_tasks={len(self.state.active_tasks)})"
        )
