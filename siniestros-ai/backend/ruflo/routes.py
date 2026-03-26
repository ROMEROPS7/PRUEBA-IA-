"""
FastAPI routes for ruflo orchestration framework.

Exposes ruflo capabilities via REST API for claims processing.

Powered by ruflo (github.com/ruvnet/ruflo) - ported to Python for SegurCaixa Adeslas
"""

import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field

from .siniestros_workflow import (
    initialize_orchestrator,
    get_orchestrator,
    process_siniestro,
)
from .types import (
    AgentType,
    WorkflowStatus,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ruflo", tags=["ruflo"])


# ============================================================================
# Pydantic Models
# ============================================================================


class ClaimData(BaseModel):
    """Insurance claim data."""

    numero_siniestro: str = Field(..., description="Claim number")
    tipo_siniestro: str = Field(..., description="Type of claim")
    fecha: str = Field(..., description="Claim date")
    monto: float = Field(..., description="Claim amount")
    descripcion: str = Field(..., description="Claim description")
    probabilidad_fraude: float = Field(
        default=0.0, ge=0.0, le=1.0, description="Fraud probability"
    )
    urgencia: str = Field(default="normal", description="Urgency level")
    documentos: List[Dict[str, Any]] = Field(default_factory=list, description="Documents")
    cliente_id: Optional[str] = None
    asegurado_id: Optional[str] = None
    póliza_id: Optional[str] = None


class ProcessClaimRequest(BaseModel):
    """Request to process a claim."""

    claim_data: ClaimData
    async_mode: bool = Field(default=False, description="Execute asynchronously")


class ProcessClaimResponse(BaseModel):
    """Response from claim processing."""

    workflow_id: str
    status: str
    duration_ms: float
    completed_tasks: int
    failed_tasks: int
    output: Dict[str, Any]
    error: Optional[str] = None
    metrics: Dict[str, Any]


class SwarmStateResponse(BaseModel):
    """Response with swarm state."""

    agents_count: int
    active_tasks: int
    topology: str
    total_messages: int
    agents: List[Dict[str, Any]]


class AgentInfo(BaseModel):
    """Information about an agent."""

    id: str
    type: str
    status: str
    capabilities: List[str]
    tasks_executed: int
    tasks_completed: int
    utilization: float


class WorkflowStateResponse(BaseModel):
    """Response with workflow state."""

    workflow_id: str
    status: str
    current_tasks: List[str]
    completed_tasks: List[str]
    failed_tasks: List[str]


class WorkflowMetricsResponse(BaseModel):
    """Response with workflow metrics."""

    total_duration_ms: float
    task_count: int
    completed_tasks: int
    failed_tasks: int
    skipped_tasks: int
    average_task_duration_ms: float
    agent_utilization: Dict[str, float]
    success_rate: float


class WorkflowDebugResponse(BaseModel):
    """Response with workflow debug info."""

    workflow_id: str
    status: str
    duration_ms: float
    task_count: int
    completed_tasks: int
    failed_tasks: int
    tasks: List[Dict[str, Any]]
    execution_trace: List[Dict[str, Any]]
    metrics: Dict[str, Any]


class ScaleAgentsRequest(BaseModel):
    """Request to scale agents."""

    agent_type: str = Field(..., description="Agent type to scale")
    target_count: int = Field(..., ge=1, description="Target agent count")


class ConsensusRequest(BaseModel):
    """Request to reach consensus."""

    decision_id: str = Field(..., description="Decision ID")
    decision: Any = Field(..., description="Decision content")
    agent_ids: Optional[List[str]] = None


# ============================================================================
# Route Handlers
# ============================================================================


@router.post("/process", response_model=ProcessClaimResponse)
async def process_claim_route(request: ProcessClaimRequest) -> Dict[str, Any]:
    """
    Process an insurance claim through the ruflo workflow.

    Args:
        request: ProcessClaimRequest with claim data

    Returns:
        ProcessClaimResponse with workflow results

    Raises:
        HTTPException: If processing fails
    """
    try:
        logger.info(f"Processing claim: {request.claim_data.numero_siniestro}")

        # Convert claim data to dict
        claim_dict = request.claim_data.dict()

        # Process claim
        result = await process_siniestro(claim_dict)

        # Prepare response
        completed = sum(1 for t in result.tasks if t.status.value == "completed")
        failed = sum(1 for t in result.tasks if t.status.value == "failed")

        response = {
            "workflow_id": result.id,
            "status": result.status.value,
            "duration_ms": result.get_duration_ms(),
            "completed_tasks": completed,
            "failed_tasks": failed,
            "output": result.output,
            "error": result.error,
            "metrics": {
                "total_duration_ms": result.metrics.total_duration_ms,
                "average_task_duration_ms": result.metrics.average_task_duration_ms,
                "success_rate": result.metrics.calculate_success_rate(),
                "agent_utilization": result.metrics.agent_utilization,
            },
        }

        logger.info(
            f"Claim processing completed: {result.status.value} "
            f"({result.get_duration_ms():.2f}ms)"
        )

        return response

    except Exception as e:
        logger.error(f"Error processing claim: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/swarm", response_model=SwarmStateResponse)
async def get_swarm_state_route() -> Dict[str, Any]:
    """
    Get the current state of the swarm.

    Returns:
        SwarmStateResponse with swarm information

    Raises:
        HTTPException: If unable to get swarm state
    """
    try:
        orchestrator = await get_orchestrator()
        return orchestrator.get_swarm_state()

    except Exception as e:
        logger.error(f"Error getting swarm state: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/agents", response_model=List[AgentInfo])
async def list_agents_route() -> List[Dict[str, Any]]:
    """
    List all agents in the swarm.

    Returns:
        List of AgentInfo with agent details

    Raises:
        HTTPException: If unable to list agents
    """
    try:
        orchestrator = await get_orchestrator()
        agents = orchestrator.coordinator.list_agents()

        agent_list = []
        for agent in agents:
            metrics = orchestrator.coordinator.get_agent_metrics(agent.id)

            agent_info = {
                "id": agent.id,
                "type": agent.type.value,
                "status": agent.status.value,
                "capabilities": list(agent.capabilities),
                "tasks_executed": metrics.tasks_executed if metrics else 0,
                "tasks_completed": metrics.tasks_completed if metrics else 0,
                "utilization": metrics.get_utilization() if metrics else 0.0,
            }
            agent_list.append(agent_info)

        return agent_list

    except Exception as e:
        logger.error(f"Error listing agents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/workflow/{workflow_id}", response_model=WorkflowStateResponse)
async def get_workflow_state_route(workflow_id: str) -> Dict[str, Any]:
    """
    Get the state of a workflow.

    Args:
        workflow_id: ID of workflow

    Returns:
        WorkflowStateResponse with workflow state

    Raises:
        HTTPException: If workflow not found
    """
    try:
        orchestrator = await get_orchestrator()
        state = orchestrator.workflow_engine.get_workflow_state(workflow_id)

        if not state:
            raise HTTPException(status_code=404, detail="Workflow not found")

        return {
            "workflow_id": workflow_id,
            "status": state.status.value,
            "current_tasks": state.current_tasks,
            "completed_tasks": state.completed_tasks,
            "failed_tasks": state.failed_tasks,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow state: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/workflow/{workflow_id}/metrics", response_model=WorkflowMetricsResponse)
async def get_workflow_metrics_route(workflow_id: str) -> Dict[str, Any]:
    """
    Get metrics for a workflow.

    Args:
        workflow_id: ID of workflow

    Returns:
        WorkflowMetricsResponse with execution metrics

    Raises:
        HTTPException: If workflow not found
    """
    try:
        orchestrator = await get_orchestrator()
        metrics = orchestrator.workflow_engine.get_workflow_metrics(workflow_id)

        if not metrics:
            raise HTTPException(status_code=404, detail="Workflow not found")

        return {
            "total_duration_ms": metrics.total_duration_ms,
            "task_count": metrics.task_count,
            "completed_tasks": metrics.completed_tasks,
            "failed_tasks": metrics.failed_tasks,
            "skipped_tasks": metrics.skipped_tasks,
            "average_task_duration_ms": metrics.average_task_duration_ms,
            "agent_utilization": metrics.agent_utilization,
            "success_rate": metrics.calculate_success_rate(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/workflow/{workflow_id}/debug", response_model=WorkflowDebugResponse)
async def get_workflow_debug_route(workflow_id: str) -> Dict[str, Any]:
    """
    Get detailed debug information for a workflow.

    Args:
        workflow_id: ID of workflow

    Returns:
        WorkflowDebugResponse with execution traces

    Raises:
        HTTPException: If workflow not found
    """
    try:
        orchestrator = await get_orchestrator()
        debug_info = orchestrator.workflow_engine.get_workflow_debug_info(workflow_id)

        if not debug_info:
            raise HTTPException(status_code=404, detail="Workflow not found")

        return debug_info

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow debug info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/agents/scale")
async def scale_agents_route(request: ScaleAgentsRequest) -> Dict[str, Any]:
    """
    Scale agents in the swarm.

    Args:
        request: ScaleAgentsRequest with target configuration

    Returns:
        Response with scaling results

    Raises:
        HTTPException: If scaling fails
    """
    try:
        orchestrator = await get_orchestrator()

        # Map agent type string to enum
        agent_type_map = {
            "classifier": AgentType.CLASSIFIER,
            "chat": AgentType.CHAT,
            "voice": AgentType.VOICE,
            "docs": AgentType.DOCS,
            "assignment": AgentType.ASSIGNMENT,
            "orchestrator": AgentType.ORCHESTRATOR,
        }

        agent_type = agent_type_map.get(request.agent_type)
        if not agent_type:
            raise ValueError(f"Unknown agent type: {request.agent_type}")

        spawned = await orchestrator.coordinator.scale_agents(
            agent_type,
            request.target_count,
        )

        logger.info(f"Scaled {request.agent_type} agents to {request.target_count}")

        return {
            "agent_type": request.agent_type,
            "target_count": request.target_count,
            "spawned_count": len(spawned),
            "spawned_ids": [a.id for a in spawned],
        }

    except Exception as e:
        logger.error(f"Error scaling agents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/consensus")
async def reach_consensus_route(request: ConsensusRequest) -> Dict[str, Any]:
    """
    Reach consensus among agents on a decision.

    Args:
        request: ConsensusRequest with decision information

    Returns:
        Response with consensus result

    Raises:
        HTTPException: If consensus operation fails
    """
    try:
        orchestrator = await get_orchestrator()

        result = await orchestrator.coordinator.reach_consensus(
            request.decision_id,
            request.decision,
            request.agent_ids,
        )

        logger.info(
            f"Consensus reached for decision {request.decision_id}: "
            f"{result.agreement_percentage:.1f}% agreement"
        )

        return {
            "decision_id": result.decision_id,
            "consensus_reached": result.consensus_reached,
            "agreement_percentage": result.agreement_percentage,
            "total_votes": len(result.agent_votes),
            "votes_in_favor": sum(1 for v in result.agent_votes.values() if v),
        }

    except Exception as e:
        logger.error(f"Error reaching consensus: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Health Check Routes
# ============================================================================


@router.get("/health")
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint.

    Returns:
        Health status
    """
    try:
        orchestrator = await get_orchestrator()
        swarm_state = orchestrator.coordinator.get_swarm_state()

        status = "healthy" if len(swarm_state.agents) > 0 else "degraded"

        return {
            "status": status,
            "agents": len(swarm_state.agents),
            "active_tasks": len(swarm_state.active_tasks),
        }

    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}


@router.post("/initialize")
async def initialize_route() -> Dict[str, str]:
    """
    Initialize the ruflo orchestrator.

    Returns:
        Initialization status
    """
    try:
        orchestrator = await initialize_orchestrator()
        logger.info("Orchestrator initialized successfully")

        return {
            "status": "initialized",
            "agents": len(orchestrator._agents),
        }

    except Exception as e:
        logger.error(f"Error initializing orchestrator: {e}")
        raise HTTPException(status_code=500, detail=str(e))
