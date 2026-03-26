"""
Type definitions for ruflo orchestration framework.

Ported from ruflo v3/src/shared/types/index.ts
Adapted for SegurCaixa Adeslas insurance claims processing.

Powered by ruflo (github.com/ruvnet/ruflo) - ported to Python for SegurCaixa Adeslas
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Set
from datetime import datetime
import uuid


# ============================================================================
# Agent Types
# ============================================================================

class AgentStatus(str, Enum):
    """Status of an agent in the swarm."""
    IDLE = "idle"
    BUSY = "busy"
    PROCESSING = "processing"
    PAUSED = "paused"
    TERMINATED = "terminated"
    ERROR = "error"


class AgentRole(str, Enum):
    """Role of an agent in the orchestration."""
    LEADER = "leader"  # Orchestrator
    EXECUTOR = "executor"  # Task executor
    COORDINATOR = "coordinator"  # Swarm coordinator
    VALIDATOR = "validator"  # Validation agent
    REVIEWER = "reviewer"  # Manual reviewer


class AgentType(str, Enum):
    """Type of agent - adapted for insurance claims."""
    CLASSIFIER = "classifier"  # Classify claims
    CHAT = "chat"  # Chat interface for clients
    VOICE = "voice"  # Voice processing
    DOCS = "docs"  # Document processing
    ASSIGNMENT = "assignment"  # Resource assignment
    ORCHESTRATOR = "orchestrator"  # Workflow orchestration


@dataclass
class Agent:
    """Agent configuration and metadata."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    type: AgentType = AgentType.CLASSIFIER
    status: AgentStatus = AgentStatus.IDLE
    role: AgentRole = AgentRole.EXECUTOR
    capabilities: Set[str] = field(default_factory=set)
    parent: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)
    last_active: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self):
        """Validate agent configuration."""
        if not self.id:
            self.id = str(uuid.uuid4())
        if not self.capabilities:
            self.capabilities = set()


# ============================================================================
# Task Types
# ============================================================================

class TaskPriority(str, Enum):
    """Task priority level."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskStatus(str, Enum):
    """Status of a task."""
    PENDING = "pending"
    ASSIGNED = "assigned"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    ROLLED_BACK = "rolled_back"


class TaskType(str, Enum):
    """Type of task - adapted for insurance claims."""
    RECEIVE_CLAIM = "receive_claim"
    CLASSIFY = "classify"
    VALIDATE_DOCS = "validate_docs"
    ASSIGN = "assign"
    NOTIFY = "notify"
    REVIEW = "review"
    PROCESS = "process"
    MANUAL_REVIEW = "manual_review"
    PRIORITY_PROCESS = "priority_process"
    COMPLETE = "complete"
    CUSTOM = "custom"


@dataclass
class Task:
    """Task definition for workflow execution."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    type: TaskType = TaskType.CUSTOM
    name: str = ""
    description: str = ""
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.PENDING
    assigned_to: Optional[str] = None
    depends_on: List[str] = field(default_factory=list)
    parameters: Dict[str, Any] = field(default_factory=dict)
    result: Optional[Any] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_ms: Optional[float] = None
    retry_count: int = 0
    max_retries: int = 3
    metadata: Dict[str, Any] = field(default_factory=dict)
    on_execute: Optional[Callable] = None

    def __post_init__(self):
        """Validate task configuration."""
        if not self.id:
            self.id = str(uuid.uuid4())
        if not self.name:
            self.name = self.type.value

    def get_duration(self) -> float:
        """Get task execution duration in milliseconds."""
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds() * 1000
        return 0.0


# ============================================================================
# Memory Types
# ============================================================================

class MemoryType(str, Enum):
    """Type of memory in the system."""
    TASK = "task"
    CONTEXT = "context"
    EVENT = "event"
    AGENT = "agent"
    WORKFLOW = "workflow"
    CLAIM = "claim"


@dataclass
class Memory:
    """Memory entity for storing agent/task/workflow data."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    type: MemoryType = MemoryType.TASK
    key: str = ""
    value: Any = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    ttl_seconds: Optional[int] = None

    def is_expired(self) -> bool:
        """Check if memory entry has expired."""
        if not self.ttl_seconds:
            return False
        elapsed = (datetime.utcnow() - self.created_at).total_seconds()
        return elapsed > self.ttl_seconds


@dataclass
class MemoryQuery:
    """Query for retrieving memory."""
    type: Optional[MemoryType] = None
    key: Optional[str] = None
    pattern: Optional[str] = None  # Regex pattern matching
    metadata_filters: Dict[str, Any] = field(default_factory=dict)
    limit: int = 100
    offset: int = 0


# ============================================================================
# Workflow Types
# ============================================================================

class WorkflowStatus(str, Enum):
    """Status of a workflow execution."""
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"
    CANCELLED = "cancelled"


@dataclass
class WorkflowMetrics:
    """Metrics for workflow execution."""
    total_duration_ms: float = 0.0
    task_count: int = 0
    completed_tasks: int = 0
    failed_tasks: int = 0
    skipped_tasks: int = 0
    average_task_duration_ms: float = 0.0
    parallel_executions: int = 0
    agent_utilization: Dict[str, float] = field(default_factory=dict)

    def calculate_success_rate(self) -> float:
        """Calculate task success rate."""
        if self.task_count == 0:
            return 0.0
        return (self.completed_tasks / self.task_count) * 100


@dataclass
class WorkflowState:
    """Current state of a workflow execution."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    status: WorkflowStatus = WorkflowStatus.PENDING
    current_tasks: List[str] = field(default_factory=list)
    completed_tasks: List[str] = field(default_factory=list)
    failed_tasks: List[str] = field(default_factory=list)
    paused_at: Optional[datetime] = None
    task_states: Dict[str, TaskStatus] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class WorkflowResult:
    """Result of workflow execution."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    status: WorkflowStatus = WorkflowStatus.COMPLETED
    tasks: List[Task] = field(default_factory=list)
    output: Dict[str, Any] = field(default_factory=dict)
    metrics: WorkflowMetrics = field(default_factory=WorkflowMetrics)
    state: WorkflowState = field(default_factory=WorkflowState)
    error: Optional[str] = None
    started_at: datetime = field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    execution_trace: List[Dict[str, Any]] = field(default_factory=list)

    def get_duration_ms(self) -> float:
        """Get total workflow duration in milliseconds."""
        end_time = self.completed_at or datetime.utcnow()
        return (end_time - self.started_at).total_seconds() * 1000


@dataclass
class WorkflowDefinition:
    """Definition of a workflow."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    tasks: List[Task] = field(default_factory=list)
    initial_task: Optional[str] = None
    variables: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)
    version: str = "1.0.0"
    created_at: datetime = field(default_factory=datetime.utcnow)

    def get_task(self, task_id: str) -> Optional[Task]:
        """Get task by ID."""
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None

    def get_executable_tasks(self, completed_task_ids: Set[str]) -> List[Task]:
        """Get tasks that are ready to execute based on dependencies."""
        executable = []
        for task in self.tasks:
            if task.status in [TaskStatus.PENDING, TaskStatus.ASSIGNED]:
                if all(dep_id in completed_task_ids for dep_id in task.depends_on):
                    executable.append(task)
        return executable


# ============================================================================
# Swarm Types
# ============================================================================

class SwarmTopology(str, Enum):
    """Swarm topology configuration."""
    HIERARCHICAL = "hierarchical"  # Tree-based with leader
    MESH = "mesh"  # Fully connected mesh
    SIMPLE = "simple"  # Flat topology


@dataclass
class MeshConnection:
    """Connection in mesh topology."""
    agent_id_a: str
    agent_id_b: str
    active: bool = True
    latency_ms: float = 0.0
    bandwidth_mbps: float = 100.0


@dataclass
class AgentMetrics:
    """Metrics for an agent."""
    agent_id: str
    status: AgentStatus = AgentStatus.IDLE
    tasks_executed: int = 0
    tasks_completed: int = 0
    tasks_failed: int = 0
    average_task_duration_ms: float = 0.0
    cpu_usage_percent: float = 0.0
    memory_usage_mb: float = 0.0
    messages_sent: int = 0
    messages_received: int = 0
    uptime_ms: float = 0.0
    last_heartbeat: datetime = field(default_factory=datetime.utcnow)

    def get_utilization(self) -> float:
        """Calculate agent utilization percentage."""
        if self.tasks_executed == 0:
            return 0.0
        return (self.tasks_completed / self.tasks_executed) * 100


@dataclass
class AgentMessage:
    """Message between agents."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    from_agent: str = ""
    to_agent: str = ""
    subject: str = ""
    content: Any = None
    priority: TaskPriority = TaskPriority.MEDIUM
    timestamp: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)
    correlation_id: Optional[str] = None


@dataclass
class ConsensusResult:
    """Result of consensus operation."""
    decision_id: str
    decision: Any
    consensus_reached: bool
    agreement_percentage: float
    agent_votes: Dict[str, bool] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class SwarmConfig:
    """Configuration for swarm coordinator."""
    topology: SwarmTopology = SwarmTopology.HIERARCHICAL
    max_agents: int = 100
    leader_id: Optional[str] = None
    auto_scale: bool = True
    max_load_per_agent: int = 10
    heartbeat_interval_ms: int = 1000
    message_timeout_ms: int = 5000
    enable_memory: bool = True
    memory_backend: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SwarmState:
    """Current state of the swarm."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    agents: List[Agent] = field(default_factory=list)
    topology: SwarmTopology = SwarmTopology.HIERARCHICAL
    connections: List[MeshConnection] = field(default_factory=list)
    active_tasks: List[str] = field(default_factory=list)
    agent_metrics: Dict[str, AgentMetrics] = field(default_factory=dict)
    total_messages: int = 0
    last_updated: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Get agent by ID."""
        for agent in self.agents:
            if agent.id == agent_id:
                return agent
        return None

    def get_available_agents(self) -> List[Agent]:
        """Get agents that are not busy."""
        return [a for a in self.agents if a.status in [AgentStatus.IDLE, AgentStatus.PAUSED]]

    def get_agent_load(self, agent_id: str) -> int:
        """Get current task load for an agent."""
        return len([t for t in self.active_tasks if t.startswith(agent_id)])
