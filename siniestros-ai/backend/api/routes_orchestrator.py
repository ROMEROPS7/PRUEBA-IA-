"""
API routes for the orchestrator flow control.

Provides endpoints to:
- Start processing a siniestro through the complete flow
- Get the status of a flow in progress
- Get the complete flow definition
"""

import logging
from typing import Dict, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, status

from backend.agents.registry import get_registry

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/orchestrator", tags=["Orchestrator"])


def get_orchestrator():
    """Get the orchestrator agent from the registry."""
    registry = get_registry()
    orchestrator = registry.get_agent("orchestrator")
    if not orchestrator:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Orchestrator not available",
        )
    return orchestrator


@router.post("/process", tags=["Orchestrator"])
async def process_siniestro(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Start processing a siniestro through the complete flow.
    
    The flow includes:
    1. Receive claim data
    2. Classify by type, urgency, and fraud probability
    3. Validate documents
    4. Assign gestor and perito
    5. Notify client via appropriate channel
    6. Make routing decision based on risk/urgency
    7. Route to: manual_review, priority_processing, or auto_process
    8. Complete processing
    
    **Request Body:**
    ```json
    {
        "canal": "app",
        "cliente_data": {
            "id": "cli_001",
            "nombre": "Juan García",
            "tipo_poliza": "hogar",
            "ubicacion": "Madrid"
        },
        "descripcion": "Rotura de cristal en ventana"
    }
    ```
    
    **Response:**
    ```json
    {
        "status": "success",
        "siniestro_id": "SG20240325XXXXX",
        "estado": "in_process",
        "resultado": {
            "route": "auto_process",
            "status": "processing"
        },
        "timeline": [
            {
                "timestamp": "2024-03-25T10:30:00",
                "evento": "Siniestro reportado",
                "detalles": {...}
            },
            ...
        ]
    }
    ```
    
    **Routes:**
    - `manual_review`: For claims with fraud_probability > 0.5
    - `priority_processing`: For claims with urgency == "critica"
    - `auto_process`: For normal claims
    
    **Returns:**
    - 200: Success with complete siniestro processing result
    - 400: Invalid request data
    - 503: Orchestrator service unavailable
    """
    try:
        orchestrator = get_orchestrator()
        
        # Extract required fields
        canal = request.get("canal", "app")
        cliente_data = request.get("cliente_data", {})
        descripcion = request.get("descripcion", "")
        
        if not descripcion:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Description (descripcion) is required",
            )
        
        # Prepare siniestro data
        siniestro_data = {
            "canal": canal,
            "cliente_data": cliente_data,
            "descripcion": descripcion,
        }
        
        logger.info(f"Processing siniestro via orchestrator - Canal: {canal}")
        
        # Process through the flow
        result = await orchestrator.process_siniestro(siniestro_data)
        
        if result.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Unknown error during processing"),
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in process_siniestro: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during siniestro processing",
        )


@router.get("/status/{siniestro_id}", tags=["Orchestrator"])
async def get_flow_status(siniestro_id: str) -> Dict[str, Any]:
    """
    Get the current status of a siniestro in the flow.
    
    Returns information about:
    - Current node in the flow
    - Overall flow status (processing, completed, error)
    - Siniestro state
    - Timeline of events
    - Processing result
    
    **Path Parameters:**
    - `siniestro_id`: ID of the siniestro (e.g., "SG20240325XXXXX")
    
    **Response:**
    ```json
    {
        "status": "success",
        "siniestro_id": "SG20240325XXXXX",
        "current_node": "priority_processing",
        "flow_status": "processing",
        "siniestro_state": "in_process",
        "timeline": [
            {
                "timestamp": "2024-03-25T10:30:00",
                "evento": "Siniestro reportado",
                "detalles": {}
            }
        ],
        "resultado": {
            "route": "priority_processing",
            "status": "processing",
            "priority": "high"
        }
    }
    ```
    
    **Flow Nodes (in order):**
    1. receive_claim - Initialize and validate input
    2. classify - Classify by type, urgency, fraud
    3. validate_documents - Check document requirements
    4. assign_resources - Assign gestor and perito
    5. notify_client - Send notification to client
    6. review_decision - Decision node (routes to 7-9)
    7. manual_review - High-risk claims (fraud > 50%)
    8. priority_processing - Critical urgency claims
    9. auto_process - Normal claims
    10. complete - Flow completion
    
    **Returns:**
    - 200: Success with current flow status
    - 404: Siniestro not found
    - 503: Orchestrator service unavailable
    """
    try:
        orchestrator = get_orchestrator()
        result = orchestrator.get_flow_status(siniestro_id)
        
        if result.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.get("error", "Siniestro not found"),
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting flow status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error retrieving flow status",
        )


@router.get("/flow", tags=["Orchestrator"])
async def get_flow_definition() -> Dict[str, Any]:
    """
    Get the complete flow definition with all nodes and edges.
    
    Returns the state graph structure showing:
    - Start and end nodes
    - All processing nodes
    - Edges between nodes (direct and conditional)
    - Node types (start, process, decision, end)
    
    **Response:**
    ```json
    {
        "status": "success",
        "flow": {
            "start_node": "receive_claim",
            "end_nodes": ["complete"],
            "nodes": [
                {
                    "name": "receive_claim",
                    "type": "start",
                    "has_handler": true,
                    "next_nodes": ["classify"]
                },
                {
                    "name": "classify",
                    "type": "process",
                    "has_handler": true,
                    "next_nodes": ["validate_documents"]
                },
                ...
                {
                    "name": "review_decision",
                    "type": "decision",
                    "has_handler": true,
                    "next_nodes": ["manual_review", "priority_processing", "auto_process"]
                }
            ],
            "edges": [
                {"from": "receive_claim", "to": "classify"},
                {"from": "classify", "to": "validate_documents"},
                ...
            ]
        }
    }
    ```
    
    **Flow Summary:**
    The orchestrator implements a 10-node state machine:
    1. **receive_claim** → Initialization node (START)
    2. **classify** → Classifier agent determines type, urgency, fraud
    3. **validate_documents** → DocsAgent checks document completeness
    4. **assign_resources** → AssignmentAgent assigns gestor and perito
    5. **notify_client** → ChatAgent sends notification via channel
    6. **review_decision** → DECISION node:
       - If fraud_probability > 0.5 → manual_review
       - If urgency == "critica" → priority_processing
       - Else → auto_process
    7. **manual_review** → Flags for gestor manual intervention
    8. **priority_processing** → Fast-track for critical claims
    9. **auto_process** → Automatic processing for normal claims
    10. **complete** → Final state (END)
    
    **Returns:**
    - 200: Success with complete flow definition
    - 503: Orchestrator service unavailable
    """
    try:
        orchestrator = get_orchestrator()
        flow_def = orchestrator.get_flow_definition()
        
        return {
            "status": "success",
            "flow": flow_def,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
    except Exception as e:
        logger.error(f"Error getting flow definition: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error retrieving flow definition",
        )
