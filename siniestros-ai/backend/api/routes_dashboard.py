"""
API routes for dashboard data.
"""

import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status

from backend.schemas import (
    GestorDashboard,
    ClienteDashboard,
    KPIDashboard,
    SiniestrosPendientes,
    SiniestroListResponse,
    AgenteStats,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

# Mock data for dashboard
MOCK_GESTORES_DASHBOARD = {
    "gestor_001": {
        "nombre": "Carlos Rodríguez",
        "email": "carlos.rodriguez@segurcaixa.es",
    },
    "gestor_002": {
        "nombre": "Isabel Martínez",
        "email": "isabel.martinez@segurcaixa.es",
    },
}

MOCK_SINIESTROS_PENDIENTES = [
    {
        "id": "sin_001",
        "numero_siniestro": "SIN-2024-000001",
        "cliente_nombre": "Juan García López",
        "estado": "en_proceso",
        "prioridad": "media",
        "dias_abierto": 5,
        "tarea_pendiente": "Aguardando documentación del cliente",
    },
    {
        "id": "sin_002",
        "numero_siniestro": "SIN-2024-000002",
        "cliente_nombre": "María Sánchez López",
        "estado": "pendiente_info",
        "prioridad": "alta",
        "dias_abierto": 3,
        "tarea_pendiente": "Validación de poliza",
    },
    {
        "id": "sin_003",
        "numero_siniestro": "SIN-2024-000003",
        "cliente_nombre": "Pedro Núñez García",
        "estado": "abierto",
        "prioridad": "critica",
        "dias_abierto": 1,
        "tarea_pendiente": "Asignación de gestor",
    },
]

MOCK_SINIESTROS_LISTA = [
    {
        "id": "sin_001",
        "numero_siniestro": "SIN-2024-000001",
        "cliente_nombre": "Juan García López",
        "poliza_numero": "SCA-2024-001",
        "estado": "resuelto",
        "prioridad": "media",
        "canal": "web",
        "fecha_creacion": datetime.utcnow() - timedelta(days=10),
        "fecha_ultima_actualizacion": datetime.utcnow() - timedelta(days=2),
        "gestor_asignado": "gestor_001",
        "modo_automatico": False,
    },
    {
        "id": "sin_002",
        "numero_siniestro": "SIN-2024-000002",
        "cliente_nombre": "María Sánchez López",
        "poliza_numero": "SCA-2023-045",
        "estado": "resuelto",
        "prioridad": "alta",
        "canal": "whatsapp",
        "fecha_creacion": datetime.utcnow() - timedelta(days=8),
        "fecha_ultima_actualizacion": datetime.utcnow() - timedelta(days=1),
        "gestor_asignado": "gestor_002",
        "modo_automatico": True,
    },
]

MOCK_AGENTES_STATS = [
    {
        "agente_id": "agente_chat",
        "nombre": "Chat Agent",
        "tipo": "chat",
        "estado": "activo",
        "llamadas_hoy": 23,
        "mensajes_procesados": 156,
        "documentos_analizados": 0,
        "tiempo_promedio_respuesta_ms": 2340.5,
        "tasa_exito": 0.92,
        "ultima_actividad": datetime.utcnow() - timedelta(minutes=3),
    },
    {
        "agente_id": "agente_docs",
        "nombre": "Documents Agent",
        "tipo": "documents",
        "estado": "activo",
        "llamadas_hoy": 45,
        "mensajes_procesados": 0,
        "documentos_analizados": 87,
        "tiempo_promedio_respuesta_ms": 5600.25,
        "tasa_exito": 0.95,
        "ultima_actividad": datetime.utcnow() - timedelta(minutes=2),
    },
    {
        "agente_id": "agente_voice",
        "nombre": "Voice Agent",
        "tipo": "voice",
        "estado": "activo",
        "llamadas_hoy": 12,
        "mensajes_procesados": 0,
        "documentos_analizados": 0,
        "tiempo_promedio_respuesta_ms": 3100.75,
        "tasa_exito": 0.88,
        "ultima_actividad": datetime.utcnow() - timedelta(minutes=15),
    },
]


@router.get("/gestor", response_model=GestorDashboard, tags=["Dashboard"])
async def get_gestor_dashboard() -> GestorDashboard:
    """
    Get manager dashboard data with KPIs and pending claims.

    **Returns:**
    - Key Performance Indicators (KPIs)
    - Pending claims requiring action
    - Agent activity summary
    - State distribution
    - Priority distribution
    """
    logger.info("Fetching gestor dashboard data")

    # Calculate KPIs
    siniestros_abiertos = 3
    siniestros_en_proceso = 2
    siniestros_resueltos_hoy = 1
    siniestros_rechazados_hoy = 0
    tiempo_promedio_resolucion_horas = 24.5
    tasa_automatizacion = 0.65

    kpis = KPIDashboard(
        siniestros_abiertos=siniestros_abiertos,
        siniestros_en_proceso=siniestros_en_proceso,
        siniestros_resueltos_hoy=siniestros_resueltos_hoy,
        siniestros_rechazados_hoy=siniestros_rechazados_hoy,
        tiempo_promedio_resolucion_horas=tiempo_promedio_resolucion_horas,
        tasa_automatizacion=tasa_automatizacion,
    )

    # Pending claims
    siniestros_pendientes = [
        SiniestrosPendientes(**s) for s in MOCK_SINIESTROS_PENDIENTES
    ]

    # Agent activity
    agentes_stats = [AgenteStats(**a) for a in MOCK_AGENTES_STATS]

    # Distribution by state
    distribucion_estado = {
        "abierto": 3,
        "en_proceso": 2,
        "pendiente_info": 1,
        "resuelto": 5,
        "rechazado": 1,
        "cancelado": 0,
    }

    # Distribution by priority
    distribucion_prioridad = {
        "baja": 1,
        "media": 5,
        "alta": 3,
        "critica": 1,
    }

    return GestorDashboard(
        kpis=kpis,
        siniestros_pendientes=siniestros_pendientes,
        actividad_agentes=agentes_stats,
        distribucion_estado=distribucion_estado,
        distribucion_prioridad=distribucion_prioridad,
    )


@router.get("/cliente/{cliente_id}", response_model=ClienteDashboard, tags=["Dashboard"])
async def get_cliente_dashboard(cliente_id: str) -> ClienteDashboard:
    """
    Get client dashboard data showing their active and resolved claims.

    **Parameters:**
    - `cliente_id`: Client identifier

    **Returns:**
    - Active claims
    - Recently resolved claims
    - Unread messages count
    - Pending documents count
    """
    logger.info(f"Fetching cliente dashboard for: {cliente_id}")

    # Mock data for demonstration
    # In production, this would query the database

    if cliente_id == "cli_001":
        siniestros_activos = [
            SiniestroListResponse(
                id="sin_001",
                numero_siniestro="SIN-2024-000001",
                cliente_nombre="Juan García López",
                poliza_numero="SCA-2024-001",
                estado="en_proceso",
                prioridad="media",
                canal="web",
                fecha_creacion=datetime.utcnow() - timedelta(days=5),
                fecha_ultima_actualizacion=datetime.utcnow() - timedelta(hours=2),
                gestor_asignado=None,
                modo_automatico=True,
            ),
        ]

        siniestros_resueltos_recientes = [
            SiniestroListResponse(
                id="sin_002",
                numero_siniestro="SIN-2024-000002",
                cliente_nombre="Juan García López",
                poliza_numero="SCA-2024-001",
                estado="resuelto",
                prioridad="baja",
                canal="web",
                fecha_creacion=datetime.utcnow() - timedelta(days=30),
                fecha_ultima_actualizacion=datetime.utcnow() - timedelta(days=25),
                gestor_asignado="gestor_001",
                modo_automatico=False,
            ),
        ]

        return ClienteDashboard(
            siniestros_activos=siniestros_activos,
            siniestros_resueltos_recientes=siniestros_resueltos_recientes,
            mensajes_sin_leer=2,
            documentos_pendientes=1,
        )

    elif cliente_id == "cli_002":
        return ClienteDashboard(
            siniestros_activos=[],
            siniestros_resueltos_recientes=MOCK_SINIESTROS_LISTA,
            mensajes_sin_leer=0,
            documentos_pendientes=0,
        )

    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente {cliente_id} not found",
        )


@router.get("/health", tags=["Dashboard"])
async def dashboard_health() -> Dict[str, Any]:
    """
    Health check endpoint for dashboard service.

    **Returns:** Service health status
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
    }
