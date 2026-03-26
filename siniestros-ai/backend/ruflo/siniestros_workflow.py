"""
Insurance claims processing workflow using ruflo orchestration.

Ported from ruflo v3 framework and adapted for SegurCaixa Adeslas claims processing.
Creates and executes multi-agent workflow for claim processing.

Powered by ruflo (github.com/ruvnet/ruflo) - ported to Python for SegurCaixa Adeslas
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
import asyncio

from .types import (
    Agent,
    AgentRole,
    AgentType,
    Task,
    TaskPriority,
    TaskStatus,
    TaskType,
    WorkflowDefinition,
    WorkflowResult,
)
from .agent import AgentNode
from .swarm_coordinator import SwarmCoordinator
from .workflow_engine import WorkflowEngine
from .memory import MemoryEntity

logger = logging.getLogger(__name__)


class SiniestrosWorkflowOrchestrator:
    """
    Orchestrator for insurance claims (siniestros) processing.
    Manages multi-agent workflow for claim classification, validation, and resolution.
    """

    def __init__(
        self,
        backend_agents: Optional[Dict[str, Any]] = None,
        memory_backend: Optional[MemoryEntity] = None,
    ):
        """
        Initialize the siniestros workflow orchestrator.

        Args:
            backend_agents: Dictionary mapping agent types to backend agent instances
            memory_backend: Optional MemoryEntity for persistent storage
        """
        self.backend_agents = backend_agents or {}
        self.memory = memory_backend or MemoryEntity(":memory:")

        # Initialize swarm coordinator
        from .types import SwarmConfig, SwarmTopology

        swarm_config = SwarmConfig(
            topology=SwarmTopology.HIERARCHICAL,
            max_agents=10,
            auto_scale=True,
            enable_memory=True,
        )

        self.coordinator = SwarmCoordinator(swarm_config)
        self.workflow_engine = WorkflowEngine(self.coordinator)

        # Initialize agents
        self._agents: Dict[str, AgentNode] = {}
        self._initialized = False

        logger.info("Initialized SiniestrosWorkflowOrchestrator")

    async def initialize(self) -> None:
        """Initialize all agents in the swarm."""
        if self._initialized:
            return

        logger.info("Initializing agents...")

        # Spawn orchestrator agent (leader)
        orchestrator = await self.coordinator.spawn_agent(
            AgentType.ORCHESTRATOR,
            backend_agent=self.backend_agents.get("orchestrator"),
            capabilities={"orchestrator", "coordination"},
            metadata={"role": "leader"},
        )
        self._agents["orchestrator"] = orchestrator
        logger.info(f"Spawned orchestrator agent: {orchestrator.id}")

        # Spawn classifier agent
        classifier = await self.coordinator.spawn_agent(
            AgentType.CLASSIFIER,
            backend_agent=self.backend_agents.get("classifier"),
            capabilities={"classify", "categorize"},
            metadata={"role": "classifier"},
        )
        self._agents["classifier"] = classifier
        logger.info(f"Spawned classifier agent: {classifier.id}")

        # Spawn document agent
        docs_agent = await self.coordinator.spawn_agent(
            AgentType.DOCS,
            backend_agent=self.backend_agents.get("docs"),
            capabilities={"validate_docs", "extract_info", "ocr"},
            metadata={"role": "document_processor"},
        )
        self._agents["docs"] = docs_agent
        logger.info(f"Spawned document agent: {docs_agent.id}")

        # Spawn assignment agent
        assignment = await self.coordinator.spawn_agent(
            AgentType.ASSIGNMENT,
            backend_agent=self.backend_agents.get("assignment"),
            capabilities={"assign", "allocate_resources"},
            metadata={"role": "assignment"},
        )
        self._agents["assignment"] = assignment
        logger.info(f"Spawned assignment agent: {assignment.id}")

        # Spawn chat agent
        chat = await self.coordinator.spawn_agent(
            AgentType.CHAT,
            backend_agent=self.backend_agents.get("chat"),
            capabilities={"notify", "communicate"},
            metadata={"role": "communication"},
        )
        self._agents["chat"] = chat
        logger.info(f"Spawned chat agent: {chat.id}")

        # Spawn voice agent
        voice = await self.coordinator.spawn_agent(
            AgentType.VOICE,
            backend_agent=self.backend_agents.get("voice"),
            capabilities={"voice_processing", "tts"},
            metadata={"role": "voice"},
        )
        self._agents["voice"] = voice
        logger.info(f"Spawned voice agent: {voice.id}")

        self._initialized = True
        logger.info("All agents initialized successfully")

    async def create_workflow(self, claim_data: Dict[str, Any]) -> WorkflowDefinition:
        """
        Create a claims processing workflow.

        Workflow tasks:
        1. receive_claim - Receive and register claim
        2. classify - Classify claim by type
        3. validate_documents - Validate provided documents
        4. assign_resources - Assign handling agent/resources
        5. notify_client - Notify client of claim reception
        6. review_decision - Review handling decision
        7. conditional branching based on fraud/urgency
        8. complete - Complete the workflow

        Args:
            claim_data: Claim data to process

        Returns:
            WorkflowDefinition for the claim
        """
        # Task 1: Receive claim
        receive_task = Task(
            id="receive_claim",
            type=TaskType.RECEIVE_CLAIM,
            name="Recibir siniestro",
            description="Recibir y registrar el siniestro",
            priority=TaskPriority.HIGH,
            parameters={"claim_data": claim_data},
            depends_on=[],
        )

        # Task 2: Classify claim
        classify_task = Task(
            id="classify",
            type=TaskType.CLASSIFY,
            name="Clasificar siniestro",
            description="Clasificar el tipo de siniestro",
            priority=TaskPriority.HIGH,
            parameters={"claim_data": claim_data},
            depends_on=["receive_claim"],
        )

        # Task 3: Validate documents
        validate_task = Task(
            id="validate_documents",
            type=TaskType.VALIDATE_DOCS,
            name="Validar documentos",
            description="Validar documentos proporcionados",
            priority=TaskPriority.HIGH,
            parameters={"claim_data": claim_data},
            depends_on=["classify"],
        )

        # Task 4: Assign resources
        assign_task = Task(
            id="assign_resources",
            type=TaskType.ASSIGN,
            name="Asignar recursos",
            description="Asignar agente y recursos para el handling",
            priority=TaskPriority.MEDIUM,
            parameters={"claim_data": claim_data},
            depends_on=["validate_documents"],
        )

        # Task 5: Notify client
        notify_task = Task(
            id="notify_client",
            type=TaskType.NOTIFY,
            name="Notificar cliente",
            description="Notificar al cliente de la recepción del siniestro",
            priority=TaskPriority.MEDIUM,
            parameters={"claim_data": claim_data},
            depends_on=["assign_resources"],
        )

        # Task 6: Review decision
        review_task = Task(
            id="review_decision",
            type=TaskType.REVIEW,
            name="Revisar decisión",
            description="Revisar la decisión de handling",
            priority=TaskPriority.MEDIUM,
            parameters={"claim_data": claim_data},
            depends_on=["notify_client"],
        )

        # Task 7: Conditional routing based on fraud detection
        fraud_probability = claim_data.get("probabilidad_fraude", 0.0)
        urgency = claim_data.get("urgencia", "normal")

        if fraud_probability > 0.5:
            # Manual review for potential fraud
            process_task = Task(
                id="manual_review",
                type=TaskType.MANUAL_REVIEW,
                name="Revisión manual",
                description="Revisión manual para sospecha de fraude",
                priority=TaskPriority.CRITICAL,
                parameters={"claim_data": claim_data, "reason": "fraud_suspicion"},
                depends_on=["review_decision"],
            )
            logger.warning(
                f"Fraud detected in claim: fraud_probability={fraud_probability:.2f}"
            )
        elif urgency == "critica":
            # Priority processing for critical cases
            process_task = Task(
                id="priority_process",
                type=TaskType.PRIORITY_PROCESS,
                name="Procesamiento prioritario",
                description="Procesamiento prioritario para caso crítico",
                priority=TaskPriority.CRITICAL,
                parameters={"claim_data": claim_data, "reason": "critical_urgency"},
                depends_on=["review_decision"],
            )
            logger.warning(f"Critical urgency detected in claim")
        else:
            # Standard processing
            process_task = Task(
                id="process",
                type=TaskType.PROCESS,
                name="Procesar siniestro",
                description="Procesar siniestro con lógica estándar",
                priority=TaskPriority.MEDIUM,
                parameters={"claim_data": claim_data},
                depends_on=["review_decision"],
            )

        # Task 8: Complete workflow
        complete_task = Task(
            id="complete",
            type=TaskType.COMPLETE,
            name="Completar siniestro",
            description="Completar el procesamiento del siniestro",
            priority=TaskPriority.MEDIUM,
            parameters={"claim_data": claim_data},
            depends_on=[process_task.id],
        )

        # Create workflow definition
        workflow = WorkflowDefinition(
            name=f"Claims Processing Workflow - {claim_data.get('numero_siniestro', 'unknown')}",
            description="Multi-agent workflow for insurance claims processing",
            tasks=[
                receive_task,
                classify_task,
                validate_task,
                assign_task,
                notify_task,
                review_task,
                process_task,
                complete_task,
            ],
            initial_task="receive_claim",
            variables={"claim_data": claim_data},
            version="1.0.0",
        )

        # Store in memory
        workflow_memory = MemoryEntity.create_event_memory(
            "workflow_created",
            {
                "workflow_id": workflow.id,
                "claim_number": claim_data.get("numero_siniestro"),
                "task_count": len(workflow.tasks),
            },
        )
        self.memory.store(workflow_memory)

        logger.info(
            f"Created workflow {workflow.id} for claim {claim_data.get('numero_siniestro')}"
        )
        return workflow

    async def process_siniestro(self, claim_data: Dict[str, Any]) -> WorkflowResult:
        """
        Process a siniestro (insurance claim) through the full workflow.

        Args:
            claim_data: Claim data including:
                - numero_siniestro: Claim number
                - tipo_siniestro: Type of claim
                - fecha: Claim date
                - monto: Claim amount
                - descripcion: Claim description
                - probabilidad_fraude: Fraud probability (0-1)
                - urgencia: Urgency level (normal/alta/critica)
                - documentos: List of documents

        Returns:
            WorkflowResult with execution metrics and output
        """
        # Initialize if needed
        if not self._initialized:
            await self.initialize()

        # Create workflow
        workflow = await self.create_workflow(claim_data)

        # Execute workflow
        logger.info(f"Starting claim processing for {claim_data.get('numero_siniestro')}")
        result = await self.workflow_engine.execute_workflow(workflow)

        # Log claim memory
        claim_memory = MemoryEntity.create_claim_memory(
            claim_id=claim_data.get("numero_siniestro"),
            claim_data=claim_data,
            workflow_result=result,
        )
        self.memory.store(claim_memory)

        logger.info(
            f"Claim processing completed: {result.status.value} "
            f"(duration: {result.get_duration_ms():.2f}ms)"
        )

        return result

    async def shutdown(self) -> None:
        """Shutdown the orchestrator and terminate all agents."""
        logger.info("Shutting down orchestrator...")

        # Terminate all agents
        for agent in self._agents.values():
            await agent.terminate()

        # Close memory
        self.memory.close()

        logger.info("Orchestrator shutdown complete")

    def get_swarm_state(self) -> Dict[str, Any]:
        """Get current swarm state."""
        state = self.coordinator.get_swarm_state()
        return {
            "agents_count": len(state.agents),
            "active_tasks": len(state.active_tasks),
            "topology": state.topology.value,
            "total_messages": state.total_messages,
            "agents": [
                {
                    "id": a.id,
                    "type": a.type.value,
                    "status": a.status.value,
                    "capabilities": list(a.capabilities),
                }
                for a in state.agents
            ],
        }

    def __repr__(self) -> str:
        """String representation of orchestrator."""
        return (
            f"SiniestrosWorkflowOrchestrator("
            f"agents={len(self._agents)}, "
            f"initialized={self._initialized})"
        )


# Global orchestrator instance
_orchestrator: Optional[SiniestrosWorkflowOrchestrator] = None


async def initialize_orchestrator(
    backend_agents: Optional[Dict[str, Any]] = None,
    memory_backend: Optional[MemoryEntity] = None,
) -> SiniestrosWorkflowOrchestrator:
    """
    Initialize the global orchestrator instance.

    Args:
        backend_agents: Backend agent implementations
        memory_backend: Optional memory backend

    Returns:
        Initialized SiniestrosWorkflowOrchestrator
    """
    global _orchestrator

    _orchestrator = SiniestrosWorkflowOrchestrator(backend_agents, memory_backend)
    await _orchestrator.initialize()

    return _orchestrator


async def get_orchestrator() -> SiniestrosWorkflowOrchestrator:
    """Get the global orchestrator instance."""
    global _orchestrator

    if _orchestrator is None:
        _orchestrator = SiniestrosWorkflowOrchestrator()
        await _orchestrator.initialize()

    return _orchestrator


async def create_siniestros_workflow(
    claim_data: Dict[str, Any],
) -> WorkflowDefinition:
    """
    Create a claims processing workflow.

    Args:
        claim_data: Insurance claim data

    Returns:
        WorkflowDefinition
    """
    orchestrator = await get_orchestrator()
    return await orchestrator.create_workflow(claim_data)


async def process_siniestro(claim_data: Dict[str, Any]) -> WorkflowResult:
    """
    Process an insurance claim through the full ruflo workflow.

    Args:
        claim_data: Insurance claim data

    Returns:
        WorkflowResult with full execution metrics
    """
    orchestrator = await get_orchestrator()
    return await orchestrator.process_siniestro(claim_data)


def _extend_memory_entity():
    """Extend MemoryEntity with claim-specific factory methods."""

    @staticmethod
    def create_claim_memory(
        claim_id: str,
        claim_data: Dict[str, Any],
        workflow_result: Optional[WorkflowResult] = None,
    ) -> "Memory":
        """
        Factory method to create claim memory.

        Args:
            claim_id: ID of claim
            claim_data: Claim data
            workflow_result: Optional workflow execution result

        Returns:
            Memory object configured for claims
        """
        from .types import MemoryType, Memory as MemoryObj

        memory_value = {
            "claim_data": claim_data,
            "workflow_status": workflow_result.status.value if workflow_result else None,
            "workflow_duration_ms": (
                workflow_result.get_duration_ms() if workflow_result else None
            ),
            "timestamp": datetime.utcnow().isoformat(),
        }

        return MemoryObj(
            id=claim_id,
            type=MemoryType.CLAIM,
            key=f"claim:{claim_id}",
            value=memory_value,
            metadata={
                "claim_id": claim_id,
                "claim_type": claim_data.get("tipo_siniestro", "unknown"),
                "fraud_probability": claim_data.get("probabilidad_fraude", 0.0),
            },
            ttl_seconds=2592000,  # 30 days
        )

    MemoryEntity.create_claim_memory = create_claim_memory


# Apply extensions
_extend_memory_entity()
