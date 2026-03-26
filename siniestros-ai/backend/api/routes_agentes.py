"""
API routes for agents management.
"""

import logging
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Query, status

from backend.schemas import (
    AgenteStats,
    AgenteActivityLog,
    ChatMessage,
    ChatResponse,
    VoiceTranscription,
    VoiceResponse,
)
from backend.api.websocket import manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agentes", tags=["Agentes"])

# Mock agents registry
MOCK_AGENTES = {
    "agente_chat": {
        "id": "agente_chat",
        "nombre": "Chat Agent",
        "tipo": "chat",
        "descripcion": "Agente para interacción por chat (WhatsApp, email, web)",
        "estado": "activo",
        "llamadas_hoy": 23,
        "mensajes_procesados": 156,
        "documentos_analizados": 0,
        "tiempo_promedio_respuesta_ms": 2340,
        "tasa_exito": 0.92,
        "ultima_actividad": datetime.utcnow() - timedelta(minutes=3),
    },
    "agente_voice": {
        "id": "agente_voice",
        "nombre": "Voice Agent",
        "tipo": "voice",
        "descripcion": "Agente para análisis de transcripciones de voz",
        "estado": "activo",
        "llamadas_hoy": 12,
        "mensajes_procesados": 0,
        "documentos_analizados": 0,
        "tiempo_promedio_respuesta_ms": 3100,
        "tasa_exito": 0.88,
        "ultima_actividad": datetime.utcnow() - timedelta(minutes=15),
    },
    "agente_docs": {
        "id": "agente_docs",
        "nombre": "Documents Agent",
        "tipo": "documents",
        "descripcion": "Agente para análisis de documentos (OCR, clasificación, validación)",
        "estado": "activo",
        "llamadas_hoy": 45,
        "mensajes_procesados": 0,
        "documentos_analizados": 87,
        "tiempo_promedio_respuesta_ms": 5600,
        "tasa_exito": 0.95,
        "ultima_actividad": datetime.utcnow() - timedelta(minutes=2),
    },
    "agente_assignment": {
        "id": "agente_assignment",
        "nombre": "Assignment Agent",
        "tipo": "assignment",
        "descripcion": "Agente para asignación automática de gestor",
        "estado": "activo",
        "llamadas_hoy": 18,
        "mensajes_procesados": 0,
        "documentos_analizados": 0,
        "tiempo_promedio_respuesta_ms": 1500,
        "tasa_exito": 0.97,
        "ultima_actividad": datetime.utcnow() - timedelta(minutes=8),
    },
    "agente_orchestrator": {
        "id": "agente_orchestrator",
        "nombre": "Orchestrator Agent",
        "tipo": "orchestrator",
        "descripcion": "Agente coordinador que orquesta el flujo completo de siniestros",
        "estado": "activo",
        "llamadas_hoy": 34,
        "mensajes_procesados": 0,
        "documentos_analizados": 0,
        "tiempo_promedio_respuesta_ms": 4200,
        "tasa_exito": 0.93,
        "ultima_actividad": datetime.utcnow() - timedelta(minutes=1),
    },
}

# Mock activity logs
MOCK_ACTIVITY_LOGS: Dict[str, List[Dict[str, Any]]] = {
    agente_id: [
        {
            "id": f"log_{uuid.uuid4().hex[:6]}",
            "agente_id": agente_id,
            "timestamp": datetime.utcnow() - timedelta(minutes=i),
            "tipo_actividad": "procesamiento",
            "descripcion": f"Procesando solicitud #{i}",
            "resultado": "exitoso",
            "detalles": {"duracion_ms": 2000 + (i * 100)},
        }
        for i in range(5)
    ]
    for agente_id in MOCK_AGENTES.keys()
}


@router.get("", response_model=List[AgenteStats], tags=["Agentes"])
async def list_agentes(
    tipo: Optional[str] = Query(None, description="Filter by agent type"),
) -> List[AgenteStats]:
    """
    List all agents with their current status and statistics.

    **Parameters:**
    - `tipo`: Filter by agent type (chat, voice, documents, assignment, orchestrator)

    **Returns:** List of agents with real-time stats
    """
    logger.info(f"Listing agentes with tipo filter: {tipo}")

    agentes_list = list(MOCK_AGENTES.values())

    if tipo:
        agentes_list = [a for a in agentes_list if a["tipo"] == tipo]

    return [AgenteStats(**agente) for agente in agentes_list]


@router.get("/stats", response_model=Dict[str, Any], tags=["Agentes"])
async def get_agentes_stats() -> Dict[str, Any]:
    """
    Get aggregated statistics for all agents.

    **Returns:**
    - Calls processed today
    - Messages processed
    - Documents analyzed
    - Average response time
    - Success rate
    - Active agents count
    """
    logger.info("Getting aggregated agents stats")

    total_llamadas = sum(a["llamadas_hoy"] for a in MOCK_AGENTES.values())
    total_mensajes = sum(a["mensajes_procesados"] for a in MOCK_AGENTES.values())
    total_documentos = sum(a["documentos_analizados"] for a in MOCK_AGENTES.values())
    agentes_activos = sum(1 for a in MOCK_AGENTES.values() if a["estado"] == "activo")

    # Calculate weighted average response time
    total_peso = sum(
        a["llamadas_hoy"] + a["mensajes_procesados"] + a["documentos_analizados"]
        for a in MOCK_AGENTES.values()
    )
    avg_response_time = (
        sum(
            (a["llamadas_hoy"] + a["mensajes_procesados"] + a["documentos_analizados"])
            * a["tiempo_promedio_respuesta_ms"]
            for a in MOCK_AGENTES.values()
        )
        / total_peso
        if total_peso > 0
        else 0
    )

    # Calculate weighted average success rate
    avg_success_rate = (
        sum(a["tasa_exito"] for a in MOCK_AGENTES.values()) / len(MOCK_AGENTES)
    )

    return {
        "llamadas_procesadas_hoy": total_llamadas,
        "mensajes_procesados": total_mensajes,
        "documentos_analizados": total_documentos,
        "tiempo_promedio_respuesta_ms": round(avg_response_time, 2),
        "tasa_exito_promedio": round(avg_success_rate, 4),
        "agentes_activos": agentes_activos,
        "agentes_totales": len(MOCK_AGENTES),
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/{agente_id}/logs", response_model=List[AgenteActivityLog], tags=["Agentes"])
async def get_agente_logs(
    agente_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> List[AgenteActivityLog]:
    """
    Get activity logs for a specific agent.

    **Parameters:**
    - `agente_id`: Agent identifier
    - `skip`: Pagination offset
    - `limit`: Pagination limit

    **Returns:** List of agent activity logs
    """
    logger.info(f"Getting logs for agente: {agente_id}")

    if agente_id not in MOCK_AGENTES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agente {agente_id} not found",
        )

    logs = MOCK_ACTIVITY_LOGS.get(agente_id, [])
    logs = logs[skip : skip + limit]

    return [AgenteActivityLog(**log) for log in logs]


@router.post("/chat", response_model=ChatResponse, tags=["Agentes"])
async def chat_with_agent(chat_msg: ChatMessage) -> ChatResponse:
    """
    Send a message to the chat agent and get a response.

    **Body:**
    ```json
    {
        "message": "string",
        "canal": "whatsapp|email|web",
        "cliente_id": "string (optional)",
        "siniestro_id": "string (optional)"
    }
    ```

    **Process:**
    1. Validate message
    2. Send to chat agent for processing
    3. Agent applies NLP to understand intent
    4. Agent determines if escalation needed
    5. Return response with confidence score
    6. Broadcast chat message via WebSocket

    **Returns:** Agent response with confidence and suggested actions
    """
    logger.info(
        f"Chat message received via {chat_msg.canal} for cliente {chat_msg.cliente_id}"
    )

    if not chat_msg.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty",
        )

    logger.info("Processing message with chat agent...")

    # ========== CHAT AGENT CALL ==========
    # In production, this would call the chat agent which would:
    # 1. Process natural language
    # 2. Extract intent and entities
    # 3. Determine if escalation is needed
    # 4. Generate contextual response
    try:
        # TODO: Call actual chat agent
        # chat_response = await call_chat_agent(chat_msg)
        logger.info("Chat agent processing initiated")
    except Exception as e:
        logger.error(f"Error calling chat agent: {e}")

    # Mock response
    respuesta = (
        f"He recibido tu mensaje: '{chat_msg.message}'. "
        f"Estamos procesando tu solicitud. Un agente se pondrá en contacto pronto."
    )

    # Broadcast message
    if chat_msg.siniestro_id and chat_msg.cliente_id:
        await manager.broadcast_chat_message(
            siniestro_id=chat_msg.siniestro_id,
            cliente_id=chat_msg.cliente_id,
            canal=chat_msg.canal,
            contenido=chat_msg.message,
            direccion="inbound",
            emisor=chat_msg.cliente_id,
        )

    # Broadcast agent response
    if chat_msg.cliente_id:
        await manager.broadcast_chat_message(
            siniestro_id=chat_msg.siniestro_id,
            cliente_id=chat_msg.cliente_id,
            canal=chat_msg.canal,
            contenido=respuesta,
            direccion="outbound",
            emisor="agente_chat",
        )

    return ChatResponse(
        respuesta=respuesta,
        confianza=0.87,
        acciones_sugeridas=["crear_siniestro", "solicitar_documentos"],
        necesita_escalacion=False,
    )


@router.post("/voice", response_model=VoiceResponse, tags=["Agentes"])
async def process_voice_transcription(voice_data: VoiceTranscription) -> VoiceResponse:
    """
    Send a voice transcription to the voice agent for processing.

    **Body:**
    ```json
    {
        "transcription": "string",
        "cliente_id": "string (optional)"
    }
    ```

    **Process:**
    1. Receive transcription
    2. Send to voice agent for analysis
    3. Agent extracts key information
    4. Agent classifies issue type
    5. Agent determines priority
    6. Return structured summary

    **Returns:** Voice analysis with classification and suggested actions
    """
    logger.info(f"Voice transcription received for cliente {voice_data.cliente_id}")

    if not voice_data.transcription.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transcription cannot be empty",
        )

    logger.info("Processing transcription with voice agent...")

    # ========== VOICE AGENT CALL ==========
    # In production, this would call the voice agent which would:
    # 1. Perform sentiment analysis
    # 2. Extract intent
    # 3. Classify issue type
    # 4. Determine urgency
    try:
        # TODO: Call actual voice agent
        # voice_response = await call_voice_agent(voice_data)
        logger.info("Voice agent processing initiated")
    except Exception as e:
        logger.error(f"Error calling voice agent: {e}")

    # Mock response
    resumen = (
        f"Análisis de llamada: El cliente reporta un problema "
        f"relacionado con su póliza. Sentimiento general: neutral. "
        f"Se requiere crear un nuevo siniestro."
    )

    return VoiceResponse(
        resumen=resumen,
        clasificacion="reclamacion_nueva",
        acciones_sugeridas=["crear_siniestro", "asignar_gestor", "solicitar_documentos"],
        necesita_escalacion=False,
    )


@router.get("/{agente_id}", response_model=AgenteStats, tags=["Agentes"])
async def get_agente_details(agente_id: str) -> AgenteStats:
    """
    Get detailed information about a specific agent.

    **Parameters:**
    - `agente_id`: Agent identifier

    **Returns:** Complete agent statistics and status
    """
    logger.info(f"Getting details for agente: {agente_id}")

    if agente_id not in MOCK_AGENTES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agente {agente_id} not found",
        )

    return AgenteStats(**MOCK_AGENTES[agente_id])
