"""
Ruflo Orchestration Framework - Python Port for SegurCaixa Adeslas

Powered by ruflo (github.com/ruvnet/ruflo) - ported to Python for SegurCaixa Adeslas
Insurance claims processing orchestration with multi-agent coordination.
"""

from .types import (
    # Agent types
    AgentStatus,
    AgentRole,
    AgentType,
    Agent,
    # Task types
    TaskPriority,
    TaskStatus,
    TaskType,
    Task,
    # Memory types
    MemoryType,
    Memory,
    MemoryQuery,
    # Workflow types
    WorkflowStatus,
    WorkflowDefinition,
    WorkflowState,
    WorkflowResult,
    WorkflowMetrics,
    # Swarm types
    SwarmTopology,
    SwarmConfig,
    SwarmState,
    MeshConnection,
    AgentMessage,
    AgentMetrics,
    ConsensusResult,
)

from .agent import AgentNode

from .swarm_coordinator import SwarmCoordinator

from .workflow_engine import WorkflowEngine

from .memory import MemoryEntity

from .siniestros_workflow import (
    create_siniestros_workflow,
    process_siniestro,
)

__version__ = "1.0.0"
__author__ = "SegurCaixa Adeslas"

__all__ = [
    # Types
    "AgentStatus",
    "AgentRole",
    "AgentType",
    "Agent",
    "TaskPriority",
    "TaskStatus",
    "TaskType",
    "Task",
    "MemoryType",
    "Memory",
    "MemoryQuery",
    "WorkflowStatus",
    "WorkflowDefinition",
    "WorkflowState",
    "WorkflowResult",
    "WorkflowMetrics",
    "SwarmTopology",
    "SwarmConfig",
    "SwarmState",
    "MeshConnection",
    "AgentMessage",
    "AgentMetrics",
    "ConsensusResult",
    # Core classes
    "AgentNode",
    "SwarmCoordinator",
    "WorkflowEngine",
    "MemoryEntity",
    # Workflow functions
    "create_siniestros_workflow",
    "process_siniestro",
]
