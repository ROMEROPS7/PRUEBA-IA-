"""
Agent registry for the SegurCaixa Adeslas claims management system.

This module provides a centralized registry to manage all agent instances
and provides methods to query agent information and statistics.
"""

import logging
from typing import Any, Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class AgentRegistry:
    """
    Singleton registry that manages all agent instances.

    Provides:
    - Centralized agent management
    - Agent discovery and retrieval
    - Aggregated statistics
    - Agent health monitoring
    """

    _instance: Optional["AgentRegistry"] = None
    _agents: Dict[str, Any] = {}

    def __new__(cls) -> "AgentRegistry":
        """Ensure singleton pattern."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        """Initialize the registry."""
        if not hasattr(self, "_initialized"):
            self._initialized = True
            self._agents = {}
            logger.info("AgentRegistry initialized")

    def register_agent(self, agent: Any) -> None:
        """
        Register an agent in the registry.

        Args:
            agent: Agent instance with agent_id and agent_name attributes
        """
        agent_id = agent.agent_id
        self._agents[agent_id] = agent
        logger.info(f"Registered agent: {agent.agent_name} (ID: {agent_id})")

    def get_agent(self, agent_id: str) -> Optional[Any]:
        """
        Retrieve an agent by ID.

        Args:
            agent_id: ID of the agent

        Returns:
            Agent instance or None if not found
        """
        agent = self._agents.get(agent_id)
        if agent is None:
            logger.warning(f"Agent not found: {agent_id}")
        return agent

    def get_all_agents(self) -> List[Dict[str, Any]]:
        """
        Get information about all registered agents.

        Returns:
            List of agent information dictionaries
        """
        agents_info = []
        for agent_id, agent in self._agents.items():
            agents_info.append(
                {
                    "agent_id": agent.agent_id,
                    "agent_name": agent.agent_name,
                    "agent_role": agent.agent_role,
                    "color": agent.color,
                    "icon": agent.icon,
                    "version": agent.version,
                    "model_type": agent.model_type,
                }
            )
        return agents_info

    async def get_agent_stats(
        self, agent_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get statistics for agents.

        Args:
            agent_id: Optional specific agent ID. If not provided, returns stats for all agents.

        Returns:
            Agent statistics
        """
        if agent_id:
            agent = self.get_agent(agent_id)
            if not agent:
                return {
                    "status": "error",
                    "error": f"Agent not found: {agent_id}",
                }
            return await agent.get_status()

        # Return aggregated stats for all agents
        all_stats = []
        total_processes = 0
        total_errors = 0
        total_processing_time = 0.0

        for agent in self._agents.values():
            stats = await agent.get_status()
            all_stats.append(stats)
            total_processes += agent.process_count
            total_errors += agent.error_count
            total_processing_time += agent.total_processing_time_ms

        avg_processing_time = (
            total_processing_time / total_processes
            if total_processes > 0
            else 0
        )

        return {
            "total_agents": len(self._agents),
            "total_processes": total_processes,
            "total_errors": total_errors,
            "total_processing_time_ms": round(total_processing_time, 2),
            "avg_processing_time_ms": round(avg_processing_time, 2),
            "agents": all_stats,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def get_agent_status(self) -> Dict[str, Any]:
        """
        Get the status of all agents.

        Returns:
            Dictionary with status of all agents
        """
        status_report = {
            "timestamp": datetime.utcnow().isoformat(),
            "total_agents": len(self._agents),
            "agents": {},
        }

        for agent_id, agent in self._agents.items():
            agent_status = await agent.get_status()
            status_report["agents"][agent_id] = agent_status

        return status_report

    def list_agents(self) -> List[str]:
        """
        List all registered agent IDs.

        Returns:
            List of agent IDs
        """
        return list(self._agents.keys())

    def agent_count(self) -> int:
        """
        Get the number of registered agents.

        Returns:
            Number of agents
        """
        return len(self._agents)

    def clear_registry(self) -> None:
        """
        Clear all registered agents (for testing purposes).
        """
        self._agents = {}
        logger.info("Registry cleared")

    async def health_check(self) -> Dict[str, Any]:
        """
        Perform a health check on all agents.

        Returns:
            Health check report
        """
        health_report = {
            "timestamp": datetime.utcnow().isoformat(),
            "total_agents": len(self._agents),
            "healthy_agents": 0,
            "unhealthy_agents": 0,
            "details": {},
        }

        for agent_id, agent in self._agents.items():
            status = await agent.get_status()
            is_healthy = status["status"] in ["idle", "processing"]

            health_report["details"][agent_id] = {
                "name": agent.agent_name,
                "status": status["status"],
                "healthy": is_healthy,
                "process_count": agent.process_count,
                "error_count": agent.error_count,
                "error_rate": (
                    agent.error_count / agent.process_count
                    if agent.process_count > 0
                    else 0
                ),
            }

            if is_healthy:
                health_report["healthy_agents"] += 1
            else:
                health_report["unhealthy_agents"] += 1

        return health_report


# Convenience function to get the global registry instance
def get_registry() -> AgentRegistry:
    """
    Get the global agent registry instance.

    Returns:
        AgentRegistry singleton
    """
    return AgentRegistry()


def init_all_agents() -> AgentRegistry:
    """
    Initialize and register all agents.

    Returns:
        AgentRegistry with all agents registered
    """
    registry = get_registry()
    if registry.agent_count() > 0:
        return registry  # Already initialized

    try:
        from backend.agents.voice_agent import VoiceAgent
        from backend.agents.chat_agent import ChatAgent
        from backend.agents.classifier_agent import ClassifierAgent
        from backend.agents.docs_agent import DocsAgent
        from backend.agents.assignment_agent import AssignmentAgent
        from backend.agents.orchestrator import Orchestrator

        agents = [
            VoiceAgent(),
            ChatAgent(),
            ClassifierAgent(),
            DocsAgent(),
            AssignmentAgent(),
            Orchestrator(),
        ]
        for agent in agents:
            registry.register_agent(agent)

        logger.info(f"All {registry.agent_count()} agents initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing agents: {e}")

    return registry
