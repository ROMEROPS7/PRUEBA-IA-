"""
API routes for claims (siniestros) management.
"""

import logging
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, status, Depends

from backend.schemas import (
    SiniestroCreate,
    SiniestroResponse,
    SiniestroListResponse,
    SiniestroUpdate,
    TimelineEntry,
    TimelineEntryCreate,
    DocumentoInfo,
    DocumentoUploadResponse,
    ComunicacionInfo,
    ErrorResponse,
)
from backend.api.websocket import manager
from backend.services.notification import NotificationService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/siniestros", tags=["Siniestros"])

# Mock database
MOCK_SINIESTROS: Dict[str, Dict[str, Any]] = {
    "sin_001": {
        "id": "sin_001",
        "numero_siniestro": "SIN-2024-000001",
        "cliente_id": "cli_001",
        "cliente_nombre": "Juan García López",
        "poliza_id": "pol_001",
        "poliza_numero": "SCA-2024-001",
        "canal": "web",
        "descripcion": "Rotura de cristal en ventana principal",
        "estado": "en_proceso",
        "prioridad": "media",
        "modo_automatico": True,
        "gestor_asignado": None,
        "fecha_creacion": datetime.utcnow() - timedelta(days=5),
        "fecha_ultima_actualizacion": datetime.utcnow() - timedelta(hours=2),
        "timeline": [
            {
                "id": "tl_001",
                "timestamp": datetime.utcnow() - timedelta(days=5),
                "tipo": "creacion",
                "descripcion": "Siniestro creado",
                "usuario": "sistema",
                "datos_adicionales": {"canal": "web"},
            },
            {
                "id": "tl_002",
                "timestamp": datetime.utcnow() - timedelta(hours=2),
                "tipo": "validacion",
                "descripcion": "Documentación validada por agente IA",
                "usuario": "agente_docs",
                "datos_adicionales": {"score_completitud": 0.85},
            },
        ],
        "documentos": [
            {
                "id": "doc_001",
                "nombre": "foto_dano_1.jpg",
                "tipo": "image/jpeg",
                "tamano": 2048000,
                "fecha_subida": datetime.utcnow() - timedelta(days=4, hours=20),
                "url": "/api/siniestros/sin_001/documentos/doc_001",
                "estado_analisis": "procesado",
                "resultado_analisis": {"dano_detectado": True, "tipo_dano": "vidrio"},
            },
        ],
        "comunicaciones": [
            {
                "id": "com_001",
                "timestamp": datetime.utcnow() - timedelta(days=4),
                "tipo": "whatsapp",
                "direccion": "inbound",
                "canal": "whatsapp",
                "contenido": "Hola, he tenido un accidente con la ventana",
                "emisor": "cli_001",
                "receptor": "agente_chat",
                "estado": "leido",
            },
        ],
        "porcentaje_completitud": 85,
    }
}

notification_service = NotificationService()


def generate_numero_siniestro() -> str:
    """Generate a unique siniestro number."""
    count = len(MOCK_SINIESTROS) + 1
    return f"SIN-{datetime.utcnow().year}-{count:06d}"


@router.get("", response_model=List[SiniestroListResponse], tags=["Siniestros"])
async def list_siniestros(
    estado: Optional[str] = Query(None, description="Filter by estado"),
    prioridad: Optional[str] = Query(None, description="Filter by prioridad"),
    tipo: Optional[str] = Query(None, description="Filter by tipo"),
    gestor: Optional[str] = Query(None, description="Filter by assigned gestor"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
) -> List[SiniestroListResponse]:
    """
    List all claims with optional filters.

    **Parameters:**
    - `estado`: Filter by state (abierto, en_proceso, pendiente_info, resuelto, rechazado, cancelado)
    - `prioridad`: Filter by priority (baja, media, alta, critica)
    - `tipo`: Filter by type
    - `gestor`: Filter by assigned manager
    - `skip`: Pagination offset
    - `limit`: Pagination limit (max: 100)

    **Returns:** List of claims matching filters
    """
    logger.info(
        f"Listing siniestros with filters: estado={estado}, prioridad={prioridad}, gestor={gestor}"
    )

    siniestros_list = list(MOCK_SINIESTROS.values())

    # Apply filters
    if estado:
        siniestros_list = [s for s in siniestros_list if s["estado"] == estado]
    if prioridad:
        siniestros_list = [s for s in siniestros_list if s["prioridad"] == prioridad]
    if gestor:
        siniestros_list = [s for s in siniestros_list if s.get("gestor_asignado") == gestor]

    # Pagination
    siniestros_list = siniestros_list[skip : skip + limit]

    return [
        SiniestroListResponse(
            id=s["id"],
            numero_siniestro=s["numero_siniestro"],
            cliente_nombre=s["cliente_nombre"],
            poliza_numero=s["poliza_numero"],
            estado=s["estado"],
            prioridad=s["prioridad"],
            canal=s["canal"],
            fecha_creacion=s["fecha_creacion"],
            fecha_ultima_actualizacion=s["fecha_ultima_actualizacion"],
            gestor_asignado=s.get("gestor_asignado"),
            modo_automatico=s["modo_automatico"],
        )
        for s in siniestros_list
    ]


@router.get("/{siniestro_id}", response_model=SiniestroResponse, tags=["Siniestros"])
async def get_siniestro(siniestro_id: str) -> SiniestroResponse:
    """
    Get a specific claim with full timeline, documents, and communications.

    **Parameters:**
    - `siniestro_id`: Claim identifier

    **Returns:** Complete claim information
    """
    logger.info(f"Getting siniestro: {siniestro_id}")

    if siniestro_id not in MOCK_SINIESTROS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Siniestro {siniestro_id} not found",
        )

    sin = MOCK_SINIESTROS[siniestro_id]
    return SiniestroResponse(
        id=sin["id"],
        numero_siniestro=sin["numero_siniestro"],
        cliente_id=sin["cliente_id"],
        poliza_id=sin["poliza_id"],
        canal=sin["canal"],
        descripcion=sin["descripcion"],
        estado=sin["estado"],
        prioridad=sin["prioridad"],
        prioridad_sugerida=sin["prioridad"],
        fecha_creacion=sin["fecha_creacion"],
        fecha_ultima_actualizacion=sin["fecha_ultima_actualizacion"],
        modo_automatico=sin["modo_automatico"],
        gestor_asignado=sin.get("gestor_asignado"),
        timeline=[TimelineEntry(**t) for t in sin.get("timeline", [])],
        documentos=[DocumentoInfo(**d) for d in sin.get("documentos", [])],
        comunicaciones=[ComunicacionInfo(**c) for c in sin.get("comunicaciones", [])],
        porcentaje_completitud=sin["porcentaje_completitud"],
    )


@router.post("", response_model=SiniestroResponse, status_code=status.HTTP_201_CREATED, tags=["Siniestros"])
async def create_siniestro(siniestro_data: SiniestroCreate) -> SiniestroResponse:
    """
    Create a new claim. This endpoint orchestrates the full flow with the orchestrator agent.

    **Body:**
    ```json
    {
        "cliente_id": "string",
        "poliza_id": "string",
        "canal": "web|whatsapp|email|phone|oficina",
        "descripcion": "string",
        "prioridad_sugerida": "baja|media|alta|critica" (optional)
    }
    ```

    **Flow:**
    1. Create siniestro in system
    2. Call orchestrator agent to coordinate:
       - Documentation analysis agent
       - Chat agent (if needed)
       - Voice agent (if needed)
       - Assignment agent
    3. Broadcast new_siniestro event via WebSocket
    4. Notify gestor and cliente
    5. Return complete siniestro data

    **Returns:** Created claim with initial state
    """
    logger.info(
        f"Creating new siniestro for cliente {siniestro_data.cliente_id}, poliza {siniestro_data.poliza_id}"
    )

    # Generate unique IDs
    siniestro_id = f"sin_{uuid.uuid4().hex[:8]}"
    numero_siniestro = generate_numero_siniestro()

    # Determine initial priority
    prioridad = siniestro_data.prioridad_sugerida or "media"

    # Create siniestro
    nuevo_siniestro = {
        "id": siniestro_id,
        "numero_siniestro": numero_siniestro,
        "cliente_id": siniestro_data.cliente_id,
        "cliente_nombre": "Cliente Nombre",  # Would come from DB query
        "poliza_id": siniestro_data.poliza_id,
        "poliza_numero": "POL-XXXX",  # Would come from DB query
        "canal": siniestro_data.canal,
        "descripcion": siniestro_data.descripcion,
        "estado": "abierto",
        "prioridad": prioridad,
        "modo_automatico": True,
        "gestor_asignado": None,
        "fecha_creacion": datetime.utcnow(),
        "fecha_ultima_actualizacion": datetime.utcnow(),
        "timeline": [
            {
                "id": f"tl_{uuid.uuid4().hex[:6]}",
                "timestamp": datetime.utcnow(),
                "tipo": "creacion",
                "descripcion": f"Siniestro creado vía {siniestro_data.canal}",
                "usuario": "sistema",
                "datos_adicionales": {"canal": siniestro_data.canal},
            }
        ],
        "documentos": [],
        "comunicaciones": [],
        "porcentaje_completitud": 0,
    }

    MOCK_SINIESTROS[siniestro_id] = nuevo_siniestro

    logger.info(f"Siniestro creado: {numero_siniestro} ({siniestro_id})")

    # ========== ORCHESTRATOR AGENT CALL ==========
    # In production, this would call the orchestrator agent which coordinates:
    # - Documents analysis
    # - Chat agent for initial interaction
    # - Voice agent if voice channel
    # - Assignment of gestor based on priority and load
    logger.info(f"Calling orchestrator agent for siniestro {numero_siniestro}")
    try:
        # TODO: Call actual orchestrator agent
        # orchestrator_response = await call_orchestrator_agent(nuevo_siniestro)
        # The orchestrator would:
        # 1. Analyze initial description
        # 2. Suggest priority refinement
        # 3. Suggest documentation requirements
        # 4. Assign gestor if manual mode needed
        logger.info("Orchestrator agent processing initiated")
    except Exception as e:
        logger.error(f"Error calling orchestrator agent: {e}")
        # Continue anyway, orchestrator failures don't block creation

    # ========== BROADCAST NEW SINIESTRO EVENT ==========
    await manager.broadcast_new_siniestro(
        siniestro_id=siniestro_id,
        numero_siniestro=numero_siniestro,
        cliente_id=siniestro_data.cliente_id,
        cliente_nombre=nuevo_siniestro["cliente_nombre"],
        poliza_numero=nuevo_siniestro["poliza_numero"],
        canal=siniestro_data.canal,
        prioridad=prioridad,
    )

    # ========== NOTIFY GESTOR AND CLIENTE ==========
    try:
        await notification_service.notify_new_siniestro(
            numero_siniestro=numero_siniestro,
            cliente_id=siniestro_data.cliente_id,
            canal=siniestro_data.canal,
            prioridad=prioridad,
        )
    except Exception as e:
        logger.error(f"Error notifying gestor/cliente: {e}")

    return SiniestroResponse(
        id=nuevo_siniestro["id"],
        numero_siniestro=nuevo_siniestro["numero_siniestro"],
        cliente_id=nuevo_siniestro["cliente_id"],
        poliza_id=nuevo_siniestro["poliza_id"],
        canal=nuevo_siniestro["canal"],
        descripcion=nuevo_siniestro["descripcion"],
        estado=nuevo_siniestro["estado"],
        prioridad=nuevo_siniestro["prioridad"],
        prioridad_sugerida=nuevo_siniestro["prioridad"],
        fecha_creacion=nuevo_siniestro["fecha_creacion"],
        fecha_ultima_actualizacion=nuevo_siniestro["fecha_ultima_actualizacion"],
        modo_automatico=nuevo_siniestro["modo_automatico"],
        gestor_asignado=nuevo_siniestro.get("gestor_asignado"),
        timeline=[TimelineEntry(**t) for t in nuevo_siniestro["timeline"]],
        documentos=[DocumentoInfo(**d) for d in nuevo_siniestro["documentos"]],
        comunicaciones=[ComunicacionInfo(**c) for c in nuevo_siniestro["comunicaciones"]],
        porcentaje_completitud=nuevo_siniestro["porcentaje_completitud"],
    )


@router.patch("/{siniestro_id}", response_model=SiniestroResponse, tags=["Siniestros"])
async def update_siniestro(
    siniestro_id: str,
    update_data: SiniestroUpdate,
) -> SiniestroResponse:
    """
    Update a claim's state and properties.

    **Parameters:**
    - `siniestro_id`: Claim identifier

    **Body:**
    ```json
    {
        "estado": "abierto|en_proceso|pendiente_info|resuelto|rechazado|cancelado",
        "modo_automatico": true|false,
        "gestor_asignado": "string|null",
        "prioridad": "baja|media|alta|critica",
        "notas_internas": "string"
    }
    ```

    **Returns:** Updated claim information
    """
    logger.info(f"Updating siniestro: {siniestro_id}")

    if siniestro_id not in MOCK_SINIESTROS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Siniestro {siniestro_id} not found",
        )

    sin = MOCK_SINIESTROS[siniestro_id]
    cambios = {}

    # Update fields
    if update_data.estado is not None:
        cambios["estado"] = {"antes": sin["estado"], "despues": update_data.estado}
        sin["estado"] = update_data.estado

    if update_data.prioridad is not None:
        cambios["prioridad"] = {"antes": sin["prioridad"], "despues": update_data.prioridad}
        sin["prioridad"] = update_data.prioridad

    if update_data.modo_automatico is not None:
        cambios["modo_automatico"] = {
            "antes": sin["modo_automatico"],
            "despues": update_data.modo_automatico,
        }
        sin["modo_automatico"] = update_data.modo_automatico

    if update_data.gestor_asignado is not None:
        cambios["gestor_asignado"] = {
            "antes": sin.get("gestor_asignado"),
            "despues": update_data.gestor_asignado,
        }
        sin["gestor_asignado"] = update_data.gestor_asignado

    sin["fecha_ultima_actualizacion"] = datetime.utcnow()

    # Broadcast update if changes were made
    if cambios:
        await manager.broadcast_siniestro_update(
            siniestro_id=sin["id"],
            numero_siniestro=sin["numero_siniestro"],
            cliente_id=sin["cliente_id"],
            estado=sin["estado"],
            prioridad=sin["prioridad"],
            cambios=cambios,
        )

    return SiniestroResponse(
        id=sin["id"],
        numero_siniestro=sin["numero_siniestro"],
        cliente_id=sin["cliente_id"],
        poliza_id=sin["poliza_id"],
        canal=sin["canal"],
        descripcion=sin["descripcion"],
        estado=sin["estado"],
        prioridad=sin["prioridad"],
        prioridad_sugerida=sin["prioridad"],
        fecha_creacion=sin["fecha_creacion"],
        fecha_ultima_actualizacion=sin["fecha_ultima_actualizacion"],
        modo_automatico=sin["modo_automatico"],
        gestor_asignado=sin.get("gestor_asignado"),
        timeline=[TimelineEntry(**t) for t in sin.get("timeline", [])],
        documentos=[DocumentoInfo(**d) for d in sin.get("documentos", [])],
        comunicaciones=[ComunicacionInfo(**c) for c in sin.get("comunicaciones", [])],
        porcentaje_completitud=sin["porcentaje_completitud"],
    )


@router.post("/{siniestro_id}/timeline", response_model=TimelineEntry, tags=["Siniestros"])
async def add_timeline_entry(
    siniestro_id: str,
    entry_data: TimelineEntryCreate,
) -> TimelineEntry:
    """
    Add an entry to the claim's timeline.

    **Parameters:**
    - `siniestro_id`: Claim identifier

    **Body:**
    ```json
    {
        "tipo": "string",
        "descripcion": "string",
        "datos_adicionales": {}
    }
    ```

    **Returns:** Created timeline entry
    """
    logger.info(f"Adding timeline entry to siniestro: {siniestro_id}")

    if siniestro_id not in MOCK_SINIESTROS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Siniestro {siniestro_id} not found",
        )

    sin = MOCK_SINIESTROS[siniestro_id]

    entry_id = f"tl_{uuid.uuid4().hex[:6]}"
    nueva_entrada = {
        "id": entry_id,
        "timestamp": datetime.utcnow(),
        "tipo": entry_data.tipo,
        "descripcion": entry_data.descripcion,
        "usuario": "sistema",
        "datos_adicionales": entry_data.datos_adicionales,
    }

    sin["timeline"].append(nueva_entrada)
    sin["fecha_ultima_actualizacion"] = datetime.utcnow()

    # Broadcast timeline update
    await manager.broadcast_timeline_update(
        siniestro_id=sin["id"],
        numero_siniestro=sin["numero_siniestro"],
        cliente_id=sin["cliente_id"],
        tipo=entry_data.tipo,
        descripcion=entry_data.descripcion,
    )

    return TimelineEntry(**nueva_entrada)


@router.post("/{siniestro_id}/documentos", response_model=DocumentoUploadResponse, tags=["Siniestros"])
async def upload_documento(
    siniestro_id: str,
    file: UploadFile = File(...),
) -> DocumentoUploadResponse:
    """
    Upload a document to a claim. Triggers the document analysis agent.

    **Parameters:**
    - `siniestro_id`: Claim identifier
    - `file`: Document file to upload

    **Process:**
    1. Save document
    2. Call documents analysis agent for:
       - Document type detection
       - OCR/text extraction
       - Validation
       - Completeness assessment
    3. Update siniestro with analysis results
    4. Broadcast document_uploaded event
    5. Adjust completeness percentage

    **Returns:** Upload confirmation with document metadata
    """
    logger.info(f"Uploading documento to siniestro: {siniestro_id}")

    if siniestro_id not in MOCK_SINIESTROS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Siniestro {siniestro_id} not found",
        )

    sin = MOCK_SINIESTROS[siniestro_id]

    # Mock file handling
    documento_id = f"doc_{uuid.uuid4().hex[:6]}"
    tamano = len(await file.read()) if file.file else 0
    await file.seek(0)  # Reset file pointer

    nuevo_documento = {
        "id": documento_id,
        "nombre": file.filename,
        "tipo": file.content_type or "application/octet-stream",
        "tamano": tamano,
        "fecha_subida": datetime.utcnow(),
        "url": f"/api/siniestros/{siniestro_id}/documentos/{documento_id}",
        "estado_analisis": "pendiente",
        "resultado_analisis": None,
    }

    sin["documentos"].append(nuevo_documento)
    sin["fecha_ultima_actualizacion"] = datetime.utcnow()

    logger.info(f"Document uploaded: {documento_id}. Calling documents analysis agent...")

    # ========== DOCUMENTS ANALYSIS AGENT CALL ==========
    # In production, this would call the documents analysis agent which would:
    # 1. Analyze document type
    # 2. Extract text via OCR
    # 3. Validate against document requirements
    # 4. Update completeness score
    try:
        # TODO: Call actual documents analysis agent
        # analysis_result = await call_documents_agent(nuevo_documento, sin)
        # nuevo_documento["estado_analisis"] = "procesado"
        # nuevo_documento["resultado_analisis"] = analysis_result
        logger.info("Documents analysis agent processing initiated")
    except Exception as e:
        logger.error(f"Error calling documents agent: {e}")

    # Broadcast document upload
    await manager.broadcast_agent_activity(
        agente_id="agente_docs",
        tipo_actividad="documento_subido",
        descripcion=f"Documento {file.filename} subido a siniestro {sin['numero_siniestro']}",
        siniestro_id=siniestro_id,
        cliente_id=sin["cliente_id"],
        detalles={
            "documento_id": documento_id,
            "nombre_archivo": file.filename,
            "tamano": tamano,
        },
    )

    return DocumentoUploadResponse(
        id=nuevo_documento["id"],
        nombre=nuevo_documento["nombre"],
        tipo=nuevo_documento["tipo"],
        tamano=nuevo_documento["tamano"],
        fecha_subida=nuevo_documento["fecha_subida"],
        url=nuevo_documento["url"],
        mensaje=f"Documento subido correctamente. Análisis iniciado.",
    )


@router.get("/{siniestro_id}/comunicaciones", response_model=List[ComunicacionInfo], tags=["Siniestros"])
async def get_comunicaciones(siniestro_id: str) -> List[ComunicacionInfo]:
    """
    Get the communication log for a claim.

    **Parameters:**
    - `siniestro_id`: Claim identifier

    **Returns:** List of all communications (WhatsApp, email, SMS, calls)
    """
    logger.info(f"Getting comunicaciones for siniestro: {siniestro_id}")

    if siniestro_id not in MOCK_SINIESTROS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Siniestro {siniestro_id} not found",
        )

    sin = MOCK_SINIESTROS[siniestro_id]
    return [ComunicacionInfo(**c) for c in sin.get("comunicaciones", [])]


@router.post("/{siniestro_id}/aprobar", response_model=SiniestroResponse, tags=["Siniestros"])
async def aprobar_siniestro(siniestro_id: str) -> SiniestroResponse:
    """
    Approve a claim (gestor action).

    **Parameters:**
    - `siniestro_id`: Claim identifier

    **Process:**
    1. Validate siniestro can be approved
    2. Update estado to "resuelto"
    3. Broadcast approval event
    4. Notify cliente
    5. Trigger payment/settlement workflow

    **Returns:** Updated claim in approved state
    """
    logger.info(f"Approving siniestro: {siniestro_id}")

    if siniestro_id not in MOCK_SINIESTROS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Siniestro {siniestro_id} not found",
        )

    sin = MOCK_SINIESTROS[siniestro_id]

    if sin["estado"] == "resuelto":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Claim is already approved",
        )

    old_estado = sin["estado"]
    sin["estado"] = "resuelto"
    sin["fecha_ultima_actualizacion"] = datetime.utcnow()

    # Add timeline entry
    entrada = {
        "id": f"tl_{uuid.uuid4().hex[:6]}",
        "timestamp": datetime.utcnow(),
        "tipo": "aprobacion",
        "descripcion": "Siniestro aprobado por gestor",
        "usuario": "gestor",
        "datos_adicionales": {"transicion": f"{old_estado} -> resuelto"},
    }
    sin["timeline"].append(entrada)

    # Broadcast update
    await manager.broadcast_siniestro_update(
        siniestro_id=sin["id"],
        numero_siniestro=sin["numero_siniestro"],
        cliente_id=sin["cliente_id"],
        estado=sin["estado"],
        prioridad=sin["prioridad"],
        cambios={"estado": {"antes": old_estado, "despues": "resuelto"}},
    )

    # Notify cliente
    await notification_service.notify_siniestro_approved(
        numero_siniestro=sin["numero_siniestro"],
        cliente_id=sin["cliente_id"],
    )

    return SiniestroResponse(
        id=sin["id"],
        numero_siniestro=sin["numero_siniestro"],
        cliente_id=sin["cliente_id"],
        poliza_id=sin["poliza_id"],
        canal=sin["canal"],
        descripcion=sin["descripcion"],
        estado=sin["estado"],
        prioridad=sin["prioridad"],
        prioridad_sugerida=sin["prioridad"],
        fecha_creacion=sin["fecha_creacion"],
        fecha_ultima_actualizacion=sin["fecha_ultima_actualizacion"],
        modo_automatico=sin["modo_automatico"],
        gestor_asignado=sin.get("gestor_asignado"),
        timeline=[TimelineEntry(**t) for t in sin.get("timeline", [])],
        documentos=[DocumentoInfo(**d) for d in sin.get("documentos", [])],
        comunicaciones=[ComunicacionInfo(**c) for c in sin.get("comunicaciones", [])],
        porcentaje_completitud=sin["porcentaje_completitud"],
    )


@router.post("/{siniestro_id}/rechazar", response_model=SiniestroResponse, tags=["Siniestros"])
async def rechazar_siniestro(siniestro_id: str) -> SiniestroResponse:
    """
    Reject a claim (gestor action).

    **Parameters:**
    - `siniestro_id`: Claim identifier

    **Returns:** Updated claim in rejected state
    """
    logger.info(f"Rejecting siniestro: {siniestro_id}")

    if siniestro_id not in MOCK_SINIESTROS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Siniestro {siniestro_id} not found",
        )

    sin = MOCK_SINIESTROS[siniestro_id]

    if sin["estado"] == "rechazado":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Claim is already rejected",
        )

    old_estado = sin["estado"]
    sin["estado"] = "rechazado"
    sin["fecha_ultima_actualizacion"] = datetime.utcnow()

    # Add timeline entry
    entrada = {
        "id": f"tl_{uuid.uuid4().hex[:6]}",
        "timestamp": datetime.utcnow(),
        "tipo": "rechazo",
        "descripcion": "Siniestro rechazado por gestor",
        "usuario": "gestor",
        "datos_adicionales": {"transicion": f"{old_estado} -> rechazado"},
    }
    sin["timeline"].append(entrada)

    # Broadcast update
    await manager.broadcast_siniestro_update(
        siniestro_id=sin["id"],
        numero_siniestro=sin["numero_siniestro"],
        cliente_id=sin["cliente_id"],
        estado=sin["estado"],
        prioridad=sin["prioridad"],
        cambios={"estado": {"antes": old_estado, "despues": "rechazado"}},
    )

    # Notify cliente
    await notification_service.notify_siniestro_rejected(
        numero_siniestro=sin["numero_siniestro"],
        cliente_id=sin["cliente_id"],
    )

    return SiniestroResponse(
        id=sin["id"],
        numero_siniestro=sin["numero_siniestro"],
        cliente_id=sin["cliente_id"],
        poliza_id=sin["poliza_id"],
        canal=sin["canal"],
        descripcion=sin["descripcion"],
        estado=sin["estado"],
        prioridad=sin["prioridad"],
        prioridad_sugerida=sin["prioridad"],
        fecha_creacion=sin["fecha_creacion"],
        fecha_ultima_actualizacion=sin["fecha_ultima_actualizacion"],
        modo_automatico=sin["modo_automatico"],
        gestor_asignado=sin.get("gestor_asignado"),
        timeline=[TimelineEntry(**t) for t in sin.get("timeline", [])],
        documentos=[DocumentoInfo(**d) for d in sin.get("documentos", [])],
        comunicaciones=[ComunicacionInfo(**c) for c in sin.get("comunicaciones", [])],
        porcentaje_completitud=sin["porcentaje_completitud"],
    )
