"""
Pydantic schemas for request/response validation.
"""

from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from pydantic import BaseModel, Field


# ==================== Cliente Models ====================
class ClienteBase(BaseModel):
    nombre: str
    apellidos: str
    dni: str
    email: Optional[str] = None
    telefono: Optional[str] = None
    canal_preferido: Literal["email", "whatsapp", "sms", "phone"] = "email"


class ClienteCreate(ClienteBase):
    pass


class PolizaInfo(BaseModel):
    id: str
    numero_poliza: str
    producto: str
    vigente: bool
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None

    class Config:
        from_attributes = True


class ClienteResponse(ClienteBase):
    id: str
    fecha_registro: datetime
    activo: bool
    polizas: List[PolizaInfo] = []
    num_siniestros: int = 0

    class Config:
        from_attributes = True


# ==================== Siniestro Models ====================
class TimelineEntry(BaseModel):
    id: str
    timestamp: datetime
    tipo: str
    descripcion: str
    usuario: Optional[str] = None
    datos_adicionales: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class DocumentoInfo(BaseModel):
    id: str
    nombre: str
    tipo: str
    tamano: int
    fecha_subida: datetime
    url: str
    estado_analisis: Optional[str] = None
    resultado_analisis: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class ComunicacionInfo(BaseModel):
    id: str
    timestamp: datetime
    tipo: str  # whatsapp, email, sms, call
    direccion: str  # inbound, outbound
    canal: str
    contenido: str
    emisor: str
    receptor: str
    estado: str

    class Config:
        from_attributes = True


class SiniestroBase(BaseModel):
    cliente_id: str
    poliza_id: str
    canal: Literal["web", "whatsapp", "email", "phone", "oficina"]
    descripcion: str
    prioridad_sugerida: Optional[Literal["baja", "media", "alta", "critica"]] = "media"


class SiniestroCreate(SiniestroBase):
    pass


class SiniestroUpdate(BaseModel):
    estado: Optional[Literal["abierto", "en_proceso", "pendiente_info", "resuelto", "rechazado", "cancelado"]] = None
    modo_automatico: Optional[bool] = None
    gestor_asignado: Optional[str] = None
    prioridad: Optional[Literal["baja", "media", "alta", "critica"]] = None
    notas_internas: Optional[str] = None


class SiniestroResponse(SiniestroBase):
    id: str
    numero_siniestro: str
    estado: str
    prioridad: str
    fecha_creacion: datetime
    fecha_ultima_actualizacion: datetime
    modo_automatico: bool
    gestor_asignado: Optional[str] = None
    cliente_info: Optional[Dict[str, Any]] = None
    timeline: List[TimelineEntry] = []
    documentos: List[DocumentoInfo] = []
    comunicaciones: List[ComunicacionInfo] = []
    porcentaje_completitud: int = 0

    class Config:
        from_attributes = True


class SiniestroListResponse(BaseModel):
    id: str
    numero_siniestro: str
    cliente_nombre: str
    poliza_numero: str
    estado: str
    prioridad: str
    canal: str
    fecha_creacion: datetime
    fecha_ultima_actualizacion: datetime
    gestor_asignado: Optional[str] = None
    modo_automatico: bool


# ==================== Timeline Models ====================
class TimelineEntryCreate(BaseModel):
    tipo: str
    descripcion: str
    datos_adicionales: Optional[Dict[str, Any]] = None


# ==================== Documento Models ====================
class DocumentoUploadResponse(BaseModel):
    id: str
    nombre: str
    tipo: str
    tamano: int
    fecha_subida: datetime
    url: str
    mensaje: str


# ==================== Agente Models ====================
class AgenteStats(BaseModel):
    id: Optional[str] = None
    agente_id: Optional[str] = None
    nombre: str
    tipo: str
    estado: Literal["activo", "inactivo", "en_mantenimiento"] = "activo"
    llamadas_hoy: int = 0
    mensajes_procesados: int = 0
    documentos_analizados: int = 0
    tiempo_promedio_respuesta_ms: float = 0
    tasa_exito: float = 0
    ultima_actividad: Optional[datetime] = None
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True


class AgenteActivityLog(BaseModel):
    id: str
    agente_id: str
    timestamp: datetime
    tipo_actividad: str
    descripcion: str
    resultado: str
    detalles: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class ChatMessage(BaseModel):
    message: str
    canal: Literal["whatsapp", "email", "web"]
    cliente_id: Optional[str] = None
    siniestro_id: Optional[str] = None


class ChatResponse(BaseModel):
    respuesta: str
    confianza: float
    acciones_sugeridas: List[str] = []
    necesita_escalacion: bool = False


class VoiceTranscription(BaseModel):
    transcription: str
    cliente_id: Optional[str] = None


class VoiceResponse(BaseModel):
    resumen: str
    clasificacion: str
    acciones_sugeridas: List[str] = []
    necesita_escalacion: bool = False


# ==================== Dashboard Models ====================
class KPIDashboard(BaseModel):
    siniestros_abiertos: int
    siniestros_en_proceso: int
    siniestros_resueltos_hoy: int
    siniestros_rechazados_hoy: int
    tiempo_promedio_resolucion_horas: float
    tasa_automatizacion: float


class SiniestrosPendientes(BaseModel):
    id: str
    numero_siniestro: str
    cliente_nombre: str
    estado: str
    prioridad: str
    dias_abierto: int
    tarea_pendiente: str


class GestorDashboard(BaseModel):
    kpis: KPIDashboard
    siniestros_pendientes: List[SiniestrosPendientes]
    actividad_agentes: List[AgenteStats]
    distribucion_estado: Dict[str, int]
    distribucion_prioridad: Dict[str, int]


class ClienteDashboard(BaseModel):
    siniestros_activos: List[SiniestroListResponse]
    siniestros_resueltos_recientes: List[SiniestroListResponse]
    mensajes_sin_leer: int
    documentos_pendientes: int


# ==================== WebSocket Models ====================
class WSMessage(BaseModel):
    tipo: Literal[
        "siniestro_update",
        "agent_activity",
        "new_siniestro",
        "timeline_update",
        "chat_message",
        "connection_acknowledged",
        "error",
    ]
    timestamp: datetime
    datos: Dict[str, Any]


# ==================== Error Models ====================
class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
    timestamp: datetime
