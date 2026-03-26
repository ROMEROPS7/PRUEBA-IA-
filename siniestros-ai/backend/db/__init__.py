"""
Database module for SegurCaixa Adeslas claims management system.
"""

from backend.db.models import (
    Base,
    Cliente,
    Poliza,
    Siniestro,
    SiniestroTimeline,
    Documento,
    AgentLog,
    ComunicacionLog,
    TipoPoliza,
    EstadoPoliza,
    TipoSiniestro,
    EstadoSiniestro,
    PrioridadSiniestro,
    CanalApertura,
    TipoEventoTimeline,
    DireccionComunicacion,
    EstadoAgentLog,
)

from backend.db.database import (
    engine,
    SessionLocal,
    get_db,
    init_db,
    close_db,
)

__all__ = [
    # Models
    "Base",
    "Cliente",
    "Poliza",
    "Siniestro",
    "SiniestroTimeline",
    "Documento",
    "AgentLog",
    "ComunicacionLog",
    # Enums
    "TipoPoliza",
    "EstadoPoliza",
    "TipoSiniestro",
    "EstadoSiniestro",
    "PrioridadSiniestro",
    "CanalApertura",
    "TipoEventoTimeline",
    "DireccionComunicacion",
    "EstadoAgentLog",
    # Database utilities
    "engine",
    "SessionLocal",
    "get_db",
    "init_db",
    "close_db",
]
