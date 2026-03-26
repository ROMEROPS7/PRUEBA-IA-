"""
Base agent class for the SegurCaixa Adeslas claims management system.

This module provides the abstract base class for all agents in the system,
defining the common interface and logging functionality.
"""

import asyncio
from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from uuid import uuid4
import logging

logger = logging.getLogger(__name__)


class AgentStatus(str, Enum):
    """Agent operational status."""
    IDLE = "idle"
    PROCESSING = "processing"
    ERROR = "error"
    MAINTENANCE = "maintenance"


class BaseAgent(ABC):
    """
    Abstract base class for all agents in the claims management system.

    Attributes:
        agent_id: Unique identifier for the agent
        agent_name: Human-readable name of the agent
        agent_role: Role/responsibility of the agent
        color: UI color representation (hex or named)
        icon: UI icon identifier
        status: Current operational status
        version: Agent version
        model_type: Type of model used (rule-based, ml, llm, etc.)
    """

    def __init__(
        self,
        agent_id: str,
        agent_name: str,
        agent_role: str,
        color: str = "#3498db",
        icon: str = "bot",
        version: str = "1.0.0",
        model_type: str = "rule-based",
    ) -> None:
        """
        Initialize the base agent.

        Args:
            agent_id: Unique identifier for the agent
            agent_name: Human-readable name of the agent
            agent_role: Role/responsibility description
            color: UI color (default: blue)
            icon: UI icon identifier (default: bot)
            version: Agent version (default: 1.0.0)
            model_type: Type of model used (default: rule-based)
        """
        self.agent_id: str = agent_id
        self.agent_name: str = agent_name
        self.agent_role: str = agent_role
        self.color: str = color
        self.icon: str = icon
        self.version: str = version
        self.model_type: str = model_type
        self.status: AgentStatus = AgentStatus.IDLE
        self.start_time: datetime = datetime.utcnow()
        self.process_count: int = 0
        self.error_count: int = 0
        self.total_processing_time_ms: float = 0.0

    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input data and return results.

        This is the main processing method that each agent must implement.

        Args:
            input_data: Input dictionary with agent-specific data

        Returns:
            Dictionary with processing results

        Raises:
            NotImplementedError: Must be implemented by subclass
        """
        raise NotImplementedError(f"Agent {self.agent_id} must implement process()")

    async def log_action(
        self,
        siniestro_id: str,
        action: str,
        input_data: Dict[str, Any],
        output_data: Dict[str, Any],
        duration_ms: float,
        status: str = "success",
        error_message: Optional[str] = None,
        db_session: Optional[Any] = None,
    ) -> str:
        """
        Log an agent action to the database.

        Args:
            siniestro_id: ID of the claim being processed
            action: Action name/description
            input_data: Input data for the action
            output_data: Output data from the action
            duration_ms: Processing duration in milliseconds
            status: Action status (success, error, etc.)
            error_message: Optional error message if status is error
            db_session: SQLAlchemy session for database operations

        Returns:
            ID of the created log entry

        Raises:
            ValueError: If db_session is None
        """
        if db_session is None:
            logger.warning(
                f"Agent {self.agent_id}: log_action called without db_session"
            )
            return str(uuid4())

        try:
            # Import here to avoid circular imports
            from sqlalchemy import text

            log_id = str(uuid4())
            timestamp = datetime.utcnow().isoformat()

            # SQL insert statement for AgentLog table
            insert_query = text("""
                INSERT INTO agent_logs (
                    id, agent_id, agent_name, siniestro_id, action,
                    input_data, output_data, duration_ms, status,
                    error_message, timestamp
                ) VALUES (
                    :id, :agent_id, :agent_name, :siniestro_id, :action,
                    :input_data, :output_data, :duration_ms, :status,
                    :error_message, :timestamp
                )
            """)

            db_session.execute(
                insert_query,
                {
                    "id": log_id,
                    "agent_id": self.agent_id,
                    "agent_name": self.agent_name,
                    "siniestro_id": siniestro_id,
                    "action": action,
                    "input_data": str(input_data),
                    "output_data": str(output_data),
                    "duration_ms": duration_ms,
                    "status": status,
                    "error_message": error_message,
                    "timestamp": timestamp,
                },
            )
            db_session.commit()

            logger.info(
                f"Agent {self.agent_name}: Logged action {action} "
                f"for siniestro {siniestro_id} (duration: {duration_ms}ms)"
            )
            return log_id

        except Exception as e:
            logger.error(
                f"Error logging action for agent {self.agent_id}: {str(e)}"
            )
            return str(uuid4())

    async def update_status(self, new_status: AgentStatus) -> None:
        """
        Update the agent's operational status.

        Args:
            new_status: New status to set
        """
        old_status = self.status
        self.status = new_status
        logger.debug(
            f"Agent {self.agent_name}: Status changed from {old_status} to {new_status}"
        )

    async def get_status(self) -> Dict[str, Any]:
        """
        Get the current status of the agent.

        Returns:
            Dictionary with agent status information
        """
        uptime_seconds = (datetime.utcnow() - self.start_time).total_seconds()
        avg_processing_time = (
            self.total_processing_time_ms / self.process_count
            if self.process_count > 0
            else 0
        )

        return {
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "agent_role": self.agent_role,
            "status": self.status.value,
            "version": self.version,
            "model_type": self.model_type,
            "color": self.color,
            "icon": self.icon,
            "uptime_seconds": round(uptime_seconds, 2),
            "process_count": self.process_count,
            "error_count": self.error_count,
            "total_processing_time_ms": round(self.total_processing_time_ms, 2),
            "avg_processing_time_ms": round(avg_processing_time, 2),
            "started_at": self.start_time.isoformat(),
        }

    async def process_with_logging(
        self,
        input_data: Dict[str, Any],
        siniestro_id: Optional[str] = None,
        action_name: Optional[str] = None,
        db_session: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Process input data with automatic logging and error handling.

        Args:
            input_data: Input data to process
            siniestro_id: Optional claim ID for logging
            action_name: Optional action name for logging
            db_session: Optional database session for logging

        Returns:
            Processing results
        """
        start_time = datetime.utcnow()
        siniestro_id = siniestro_id or "unknown"
        action_name = action_name or self.agent_role

        try:
            await self.update_status(AgentStatus.PROCESSING)
            result = await self.process(input_data)
            result["status"] = "success"

            duration_ms = (datetime.utcnow() - start_time).total_seconds() * 1000
            self.process_count += 1
            self.total_processing_time_ms += duration_ms

            await self.log_action(
                siniestro_id=siniestro_id,
                action=action_name,
                input_data=input_data,
                output_data=result,
                duration_ms=duration_ms,
                status="success",
                db_session=db_session,
            )

            await self.update_status(AgentStatus.IDLE)
            return result

        except Exception as e:
            duration_ms = (datetime.utcnow() - start_time).total_seconds() * 1000
            self.process_count += 1
            self.error_count += 1
            self.total_processing_time_ms += duration_ms

            error_msg = str(e)
            logger.error(
                f"Error in agent {self.agent_name} "
                f"processing siniestro {siniestro_id}: {error_msg}"
            )

            await self.log_action(
                siniestro_id=siniestro_id,
                action=action_name,
                input_data=input_data,
                output_data={"error": error_msg},
                duration_ms=duration_ms,
                status="error",
                error_message=error_msg,
                db_session=db_session,
            )

            await self.update_status(AgentStatus.ERROR)
            return {
                "status": "error",
                "error": error_msg,
                "agent_id": self.agent_id,
            }
