"""
Database models for SegurCaixa Adeslas claims management system.
"""

from datetime import datetime
from typing import Optional
from enum import Enum

from sqlalchemy import (
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Text,
    JSON,
    ForeignKey,
    Enum as SQLEnum,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, relationship, Mapped, mapped_column

Base = declarative_base()


class TipoPoliza(str, Enum):
    """Policy type enumeration."""
    HOGAR = "hogar"
    AUTO = "auto"
    SALUD = "salud"
    VIDA = "vida"


class EstadoPoliza(str, Enum):
    """Policy status enumeration."""
    ACTIVA = "activa"
    VENCIDA = "vencida"
    CANCELADA = "cancelada"


class TipoSiniestro(str, Enum):
    """Claim type enumeration."""
    HOGAR = "hogar"
    AUTO = "auto"
    SALUD = "salud"


class EstadoSiniestro(str, Enum):
    """Claim status enumeration."""
    ABIERTO = "abierto"
    EN_GESTION = "en_gestion"
    PENDIENTE_DOCS = "pendiente_docs"
    PENDIENTE_PERITO = "pendiente_perito"
    RESUELTO = "resuelto"
    RECHAZADO = "rechazado"
    AUTO_GESTIONADO = "auto_gestionado"


class PrioridadSiniestro(str, Enum):
    """Claim priority enumeration."""
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"
    CRITICA = "critica"


class CanalApertura(str, Enum):
    """Channel through which claim was opened."""
    TELEFONO = "telefono"
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    APP = "app"


class TipoEventoTimeline(str, Enum):
    """Timeline event type enumeration."""
    ACCION = "accion"
    NOTA = "nota"
    HALLAZGO = "hallazgo"
    SISTEMA = "sistema"
    COMUNICACION = "comunicacion"


class DireccionComunicacion(str, Enum):
    """Communication direction enumeration."""
    ENTRANTE = "entrante"
    SALIENTE = "saliente"


class EstadoAgentLog(str, Enum):
    """Agent action status enumeration."""
    SUCCESS = "success"
    ERROR = "error"
    TIMEOUT = "timeout"


class Cliente(Base):
    """Client/Customer model."""
    __tablename__ = "clientes"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(255))
    dni: Mapped[str] = mapped_column(String(20), unique=True)
    email: Mapped[str] = mapped_column(String(255))
    telefono: Mapped[str] = mapped_column(String(20))
    direccion: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    pólizas: Mapped[list["Poliza"]] = relationship(
        "Poliza", back_populates="cliente", cascade="all, delete-orphan"
    )
    siniestros: Mapped[list["Siniestro"]] = relationship(
        "Siniestro", back_populates="cliente", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Cliente(id={self.id}, nombre={self.nombre}, dni={self.dni})>"


class Poliza(Base):
    """Insurance policy model."""
    __tablename__ = "polizas"

    id: Mapped[int] = mapped_column(primary_key=True)
    cliente_id: Mapped[int] = mapped_column(ForeignKey("clientes.id"))
    tipo: Mapped[str] = mapped_column(SQLEnum(TipoPoliza))
    numero_poliza: Mapped[str] = mapped_column(String(100), unique=True)
    estado: Mapped[str] = mapped_column(SQLEnum(EstadoPoliza))
    cobertura: Mapped[str] = mapped_column(String(500))
    prima: Mapped[float] = mapped_column(Float)
    fecha_inicio: Mapped[datetime] = mapped_column(DateTime)
    fecha_vencimiento: Mapped[datetime] = mapped_column(DateTime)
    detalles: Mapped[dict] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    cliente: Mapped["Cliente"] = relationship("Cliente", back_populates="pólizas")
    siniestros: Mapped[list["Siniestro"]] = relationship(
        "Siniestro", back_populates="poliza", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Poliza(id={self.id}, numero={self.numero_poliza}, estado={self.estado})>"


class Siniestro(Base):
    """Insurance claim model."""
    __tablename__ = "siniestros"
    __table_args__ = (UniqueConstraint("numero_siniestro", name="uq_numero_siniestro"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    poliza_id: Mapped[int] = mapped_column(ForeignKey("polizas.id"))
    cliente_id: Mapped[int] = mapped_column(ForeignKey("clientes.id"))
    numero_siniestro: Mapped[str] = mapped_column(String(100), unique=True)
    tipo: Mapped[str] = mapped_column(SQLEnum(TipoSiniestro))
    descripcion: Mapped[str] = mapped_column(Text)
    estado: Mapped[str] = mapped_column(SQLEnum(EstadoSiniestro), default=EstadoSiniestro.ABIERTO)
    prioridad: Mapped[str] = mapped_column(SQLEnum(PrioridadSiniestro), default=PrioridadSiniestro.MEDIA)
    canal_apertura: Mapped[str] = mapped_column(SQLEnum(CanalApertura))
    ia_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    estimacion_coste_min: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    estimacion_coste_max: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fraude_detectado: Mapped[bool] = mapped_column(Boolean, default=False)
    gestor_asignado: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    perito_asignado: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    modo_automatico: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    poliza: Mapped["Poliza"] = relationship("Poliza", back_populates="siniestros")
    cliente: Mapped["Cliente"] = relationship("Cliente", back_populates="siniestros")
    timeline: Mapped[list["SiniestroTimeline"]] = relationship(
        "SiniestroTimeline", back_populates="siniestro", cascade="all, delete-orphan"
    )
    documentos: Mapped[list["Documento"]] = relationship(
        "Documento", back_populates="siniestro", cascade="all, delete-orphan"
    )
    agent_logs: Mapped[list["AgentLog"]] = relationship(
        "AgentLog", back_populates="siniestro", cascade="all, delete-orphan"
    )
    comunicaciones: Mapped[list["ComunicacionLog"]] = relationship(
        "ComunicacionLog", back_populates="siniestro", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Siniestro(id={self.id}, numero={self.numero_siniestro}, estado={self.estado})>"


class SiniestroTimeline(Base):
    """Timeline of claim events and actions."""
    __tablename__ = "siniestro_timeline"

    id: Mapped[int] = mapped_column(primary_key=True)
    siniestro_id: Mapped[int] = mapped_column(ForeignKey("siniestros.id"))
    agente_id: Mapped[str] = mapped_column(String(255))
    evento: Mapped[str] = mapped_column(Text)
    tipo: Mapped[str] = mapped_column(SQLEnum(TipoEventoTimeline))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    siniestro: Mapped["Siniestro"] = relationship("Siniestro", back_populates="timeline")

    def __repr__(self) -> str:
        return f"<SiniestroTimeline(id={self.id}, siniestro_id={self.siniestro_id}, tipo={self.tipo})>"


class Documento(Base):
    """Document associated with a claim."""
    __tablename__ = "documentos"

    id: Mapped[int] = mapped_column(primary_key=True)
    siniestro_id: Mapped[int] = mapped_column(ForeignKey("siniestros.id"))
    nombre_archivo: Mapped[str] = mapped_column(String(255))
    tipo_archivo: Mapped[str] = mapped_column(String(50))
    ruta: Mapped[str] = mapped_column(String(500))
    analisis_ia: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    validado: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    siniestro: Mapped["Siniestro"] = relationship("Siniestro", back_populates="documentos")

    def __repr__(self) -> str:
        return f"<Documento(id={self.id}, nombre={self.nombre_archivo}, tipo={self.tipo_archivo})>"


class AgentLog(Base):
    """Log of agent actions and decisions."""
    __tablename__ = "agent_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    siniestro_id: Mapped[Optional[int]] = mapped_column(ForeignKey("siniestros.id"), nullable=True)
    agent_name: Mapped[str] = mapped_column(String(255))
    action: Mapped[str] = mapped_column(String(255))
    input_data: Mapped[dict] = mapped_column(JSON)
    output_data: Mapped[dict] = mapped_column(JSON)
    duration_ms: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(SQLEnum(EstadoAgentLog))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    siniestro: Mapped[Optional["Siniestro"]] = relationship("Siniestro", back_populates="agent_logs")

    def __repr__(self) -> str:
        return f"<AgentLog(id={self.id}, agent={self.agent_name}, action={self.action}, status={self.status})>"


class ComunicacionLog(Base):
    """Log of communications (calls, messages, emails)."""
    __tablename__ = "comunicacion_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    siniestro_id: Mapped[int] = mapped_column(ForeignKey("siniestros.id"))
    canal: Mapped[str] = mapped_column(String(50))
    direccion: Mapped[str] = mapped_column(SQLEnum(DireccionComunicacion))
    contenido: Mapped[str] = mapped_column(Text)
    transcripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duracion_segundos: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    siniestro: Mapped["Siniestro"] = relationship("Siniestro", back_populates="comunicaciones")

    def __repr__(self) -> str:
        return f"<ComunicacionLog(id={self.id}, siniestro_id={self.siniestro_id}, canal={self.canal})>"


__all__ = [
    "Base",
    "Cliente",
    "Poliza",
    "Siniestro",
    "SiniestroTimeline",
    "Documento",
    "AgentLog",
    "ComunicacionLog",
    "TipoPoliza",
    "EstadoPoliza",
    "TipoSiniestro",
    "EstadoSiniestro",
    "PrioridadSiniestro",
    "CanalApertura",
    "TipoEventoTimeline",
    "DireccionComunicacion",
    "EstadoAgentLog",
]
