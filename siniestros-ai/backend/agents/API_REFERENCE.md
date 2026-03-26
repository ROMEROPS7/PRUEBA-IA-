# SegurCaixa Adeslas - Agent API Reference

Complete API documentation for all agents in the claims management system.

---

## BaseAgent Class

Base class inherited by all agents.

### Methods

#### `async process(input_data: Dict[str, Any]) -> Dict[str, Any]`
Main processing method (abstract - must be implemented by subclasses).

**Parameters:**
- `input_data`: Agent-specific input dictionary

**Returns:**
- Dictionary with processing results

#### `async log_action(siniestro_id, action, input_data, output_data, duration_ms, status, error_message, db_session) -> str`
Log an agent action to the database.

**Parameters:**
- `siniestro_id` (str): Claim ID
- `action` (str): Action name
- `input_data` (dict): Input data
- `output_data` (dict): Output data
- `duration_ms` (float): Processing time
- `status` (str): success/error
- `error_message` (str, optional): Error details
- `db_session` (optional): SQLAlchemy session

**Returns:**
- Log entry ID (str)

#### `async process_with_logging(input_data, siniestro_id, action_name, db_session) -> Dict[str, Any]`
Process with automatic logging and error handling.

**Parameters:**
- `input_data` (dict): Input data
- `siniestro_id` (str, optional): Claim ID
- `action_name` (str, optional): Action name
- `db_session` (optional): Database session

**Returns:**
- Processing results with automatic logging

#### `async update_status(new_status: AgentStatus) -> None`
Update agent operational status.

**Parameters:**
- `new_status` (AgentStatus): New status (IDLE, PROCESSING, ERROR, MAINTENANCE)

#### `async get_status() -> Dict[str, Any]`
Get agent status and metrics.

**Returns:**
```python
{
    "agent_id": "classifier_agent",
    "agent_name": "Agente Clasificador",
    "agent_role": "...",
    "status": "idle",
    "version": "1.0.0",
    "model_type": "rule-based",
    "color": "#e74c3c",
    "icon": "filter",
    "uptime_seconds": 3600.5,
    "process_count": 150,
    "error_count": 2,
    "total_processing_time_ms": 45000.0,
    "avg_processing_time_ms": 300.0,
    "started_at": "2024-03-25T10:00:00"
}
```

---

## Orchestrator

Central coordinator for all agents.

### Initialization

```python
from backend.agents import Orchestrator

orchestrator = Orchestrator(db_session=None)
```

### Methods

#### `async process_new_siniestro(canal, cliente_data, descripcion, db_session) -> Dict[str, Any]`
Process a complete new claim from start to finish.

**Parameters:**
- `canal` (str): "phone", "whatsapp", "email", "app"
- `cliente_data` (dict):
  ```python
  {
      "id": "cliente_001",
      "nombre": "Juan García",
      "tipo_poliza": "hogar|auto|salud|viaje|otros",
      "ubicacion": "Madrid",
      "email": "juan@example.com",
      "telefono": "665555555"
  }
  ```
- `descripcion` (str): Claim description
- `db_session` (optional): Database session

**Returns:**
```python
{
    "status": "success",
    "siniestro_id": "SG202603250A1B2C3D",
    "siniestro": {
        "id": "SG202603250A1B2C3D",
        "cliente_id": "cliente_001",
        "canal": "whatsapp",
        "estado": "assigned",
        "clasificacion": {...},
        "asignaciones": {...},
        "timeline": [...],
        "respuesta_cliente": "..."
    },
    "respuesta_cliente": "✅ Siniestro registrado..."
}
```

#### `async get_agent_status() -> Dict[str, Any]`
Get status of all agents.

**Returns:**
```python
{
    "timestamp": "2024-03-25T15:30:00",
    "total_agents": 6,
    "agents": {
        "orchestrator": {...},
        "classifier_agent": {...},
        "docs_agent": {...},
        ...
    }
}
```

---

## ClassifierAgent

Classifies claims by type, urgency, and fraud probability.

### Methods

#### `async classify(descripcion, tipo_poliza, datos_adicionales=None) -> Dict[str, Any]`
Classify a claim.

**Parameters:**
- `descripcion` (str): Claim description
- `tipo_poliza` (str): Policy type
- `datos_adicionales` (dict, optional): Additional metadata

**Returns:**
```python
{
    "tipo_siniestro": "hogar",           # hogar, auto, salud, viaje, otros
    "subtipo": "agua",                   # Type-specific subtype
    "urgencia": "alta",                  # baja, media, alta, critica
    "cobertura_aplicable": True,         # Boolean
    "probabilidad_fraude": 0.15,         # 0.0 to 1.0
    "score_ia": 85,                      # 0 to 100
    "estimacion_coste_min": 500,         # EUR
    "estimacion_coste_max": 5000,        # EUR
    "clasificacion_timestamp": "2024-03-25T15:30:00"
}
```

### Supported Claim Types

**Hogar (Home Insurance)**
- agua: Water damage
- incendio: Fire
- robo: Theft
- cristales: Broken glass
- temporal: Storm damage
- otro: Other

**Auto (Auto Insurance)**
- colision: Collision
- robo: Theft
- vandalismo: Vandalism
- incendio: Fire
- terceros: Third-party
- otro: Other

**Salud (Health Insurance)**
- hospitalizacion: Hospitalization
- urgencia: Emergency
- consulta: Consultation
- diagnostico: Diagnosis
- otro: Other

---

## DocsAgent

Document validation and analysis.

### Methods

#### `async process_document(file_path, tipo_siniestro) -> Dict[str, Any]`
Process a single document.

**Parameters:**
- `file_path` (str): Path to document
- `tipo_siniestro` (str): Claim type

**Returns:**
```python
{
    "file_path": "/path/to/doc.pdf",
    "file_name": "doc.pdf",
    "file_type": ".pdf",
    "document_type": "presupuesto",
    "extracted_data": {...},
    "is_valid": True,
    "processing_timestamp": "2024-03-25T15:30:00"
}
```

#### `async validate_documentation(siniestro_id, docs, tipo_siniestro) -> Dict[str, Any]`
Validate documentation completeness.

**Parameters:**
- `siniestro_id` (str): Claim ID
- `docs` (list): List of document file paths
- `tipo_siniestro` (str): Claim type

**Returns:**
```python
{
    "siniestro_id": "SG202603250A1B2C3D",
    "tipo_siniestro": "hogar",
    "total_documents_provided": 2,
    "documents_provided": ["foto", "presupuesto"],
    "required_documents": ["fotos_daño", "presupuesto_reparacion", "factura_anterior"],
    "missing_documents": ["factura_anterior"],
    "completitud_score": 67,             # 0-100
    "is_complete": False,                # >= 80 = complete
    "validation_timestamp": "2024-03-25T15:30:00"
}
```

#### `async analyze_image(image_path) -> Dict[str, Any]`
Analyze an image (placeholder for Vision AI).

**Parameters:**
- `image_path` (str): Path to image

**Returns:**
```python
{
    "image_path": "/path/to/image.jpg",
    "file_name": "image.jpg",
    "has_damage": True,
    "damage_severity": "media",
    "detected_items": [],
    "text_detected": "",
    "quality_score": 0.85,
    "analysis_timestamp": "2024-03-25T15:30:00"
}
```

---

## AssignmentAgent

Assigns claims to qualified professionals.

### Methods

#### `async assign(tipo_siniestro, subtipo="otro", prioridad="media", ubicacion=None) -> Dict[str, Any]`
Assign claim to professionals.

**Parameters:**
- `tipo_siniestro` (str): Claim type
- `subtipo` (str): Subtype
- `prioridad` (str): Priority (baja, media, alta, critica)
- `ubicacion` (str): Location/zone

**Returns:**
```python
{
    "gestor": {
        "id": "ges_001",
        "nombre": "María García López",
        "especialidad": "hogar",
        "zona": "Madrid Centro",
        "carga_actual": 12,
        "capacidad_maxima": 20,
        "rating": 4.8,
        "experiencia_años": 8
    },
    "perito": {
        "id": "per_001",
        "nombre": "Dr. Rafael García Martínez",
        "tipo": "tasador_inmuebles",
        "zona": "Madrid",
        "disponibilidad": True,
        "rating": 4.9,
        "tiempo_medio_dias": 3
    },
    "profesionales": [
        {
            "id": "prof_001",
            "nombre": "Taller Autorizado SegurCaixa",
            "tipo": "taller_mecanico",
            "zona": "Madrid",
            "distancia_km": 2.5,
            "disponibilidad": True,
            "rating": 4.7
        }
    ],
    "assignment_timestamp": "2024-03-25T15:30:00"
}
```

---

## VoiceAgent

Phone call processing and TTS preparation.

### Methods

#### `async process_call(audio_text, cliente_id, context=None) -> Dict[str, Any]`
Process a phone call transcription.

**Parameters:**
- `audio_text` (str): Transcribed audio
- `cliente_id` (str): Client ID
- `context` (dict, optional): Previous conversation context

**Returns:**
```python
{
    "status": "success",
    "cliente_id": "cliente_001",
    "input_text": "Hola, tengo un accidente",
    "intent": "report_claim",
    "entities": {
        "phone": "665555555",
        "email": "juan@example.com",
        "claim_id": "SG202603250A1B2C3D",
        "date": "25/03/2024",
        "claim_type": "auto"
    },
    "response": {
        "text": "Entendido. Voy a recopilar información sobre tu accidente...",
        "next_action": "collect_claim_type",
        "suggestions": ["Hogar", "Auto", "Salud"],
        "entities": {...},
        "tts_ready": True,
        "language": "es-ES",
        "voice": "Sara",
        "speed": 1.0,
        "emotion": "professional"
    },
    "timestamp": "2024-03-25T15:30:00"
}
```

#### `async generate_response(context) -> Dict[str, Any]`
Generate response for voice conversation.

**Parameters:**
- `context` (dict): Conversation context

**Returns:**
- Response dictionary with TTS-ready fields

### Intent Types

- `report_claim`: Customer reporting a new claim
- `claim_status`: Checking claim status
- `document_request`: Providing documents
- `appointment`: Scheduling appointment
- `general_info`: General information request
- `escalation`: Request for specialist
- `unknown`: Could not determine intent

---

## ChatAgent

Text-based communications (WhatsApp, Email, SMS).

### Methods

#### `async process_message(message, canal, cliente_id, conversation_id=None, attachments=None) -> Dict[str, Any]`
Process a chat message.

**Parameters:**
- `message` (str): Message content
- `canal` (str): "whatsapp", "email", "sms", "web_chat"
- `cliente_id` (str): Client ID
- `conversation_id` (str, optional): Conversation ID
- `attachments` (list, optional): File paths

**Returns:**
```python
{
    "status": "success",
    "conversation_id": "cliente_001_1234567890",
    "cliente_id": "cliente_001",
    "canal": "whatsapp",
    "message_received": "Necesito reportar un siniestro",
    "documents_processed": 0,
    "response": {
        "text": "✅ Entendido. Cuéntame qué sucedió...",
        "canal": "whatsapp",
        "intent": "report_claim",
        "next_state": "gathering_info",
        "suggested_actions": ["Enviar descripción detallada"],
        "requires_tts": False,
        "timestamp": "2024-03-25T15:30:00"
    },
    "timestamp": "2024-03-25T15:30:00"
}
```

#### `async generate_response(context) -> Dict[str, Any]`
Generate response for chat message.

**Parameters:**
- `context` (dict): Message context

**Returns:**
- Response dictionary

#### `async request_documents(siniestro_id, tipo_siniestro, canal="whatsapp", documentos_requeridos=None) -> Dict[str, Any]`
Request documents from client.

**Parameters:**
- `siniestro_id` (str): Claim ID
- `tipo_siniestro` (str): Claim type
- `canal` (str): Channel
- `documentos_requeridos` (list, optional): Specific documents

**Returns:**
```python
{
    "siniestro_id": "SG202603250A1B2C3D",
    "canal": "whatsapp",
    "message": "📄 Necesitamos algunos documentos...",
    "required_documents": ["Fotos del daño", "Presupuesto de reparación"],
    "timestamp": "2024-03-25T15:30:00"
}
```

### Supported Channels

- `whatsapp`: WhatsApp messages
- `email`: Email communications
- `sms`: SMS text messages
- `web_chat`: Web chat interface

### Conversation States

- `initiated`: Conversation started
- `gathering_info`: Collecting claim information
- `awaiting_documents`: Waiting for document upload
- `processing`: Processing claim
- `completed`: Claim processed
- `escalated`: Escalated to specialist

---

## AgentRegistry

Centralized agent management.

### Methods

#### `register_agent(agent) -> None`
Register an agent.

**Parameters:**
- `agent`: Agent instance

#### `get_agent(agent_id) -> Optional[Any]`
Retrieve agent by ID.

**Parameters:**
- `agent_id` (str): Agent ID

**Returns:**
- Agent instance or None

#### `get_all_agents() -> List[Dict[str, Any]]`
Get information about all agents.

**Returns:**
```python
[
    {
        "agent_id": "classifier_agent",
        "agent_name": "Agente Clasificador",
        "agent_role": "Clasifica siniestros...",
        "color": "#e74c3c",
        "icon": "filter",
        "version": "1.0.0",
        "model_type": "rule-based"
    },
    ...
]
```

#### `async get_agent_stats(agent_id=None) -> Dict[str, Any]`
Get agent statistics.

**Parameters:**
- `agent_id` (str, optional): Specific agent, or all if None

**Returns:**
- Statistics dictionary

#### `async health_check() -> Dict[str, Any]`
Perform health check on all agents.

**Returns:**
```python
{
    "timestamp": "2024-03-25T15:30:00",
    "total_agents": 6,
    "healthy_agents": 6,
    "unhealthy_agents": 0,
    "details": {
        "orchestrator": {
            "name": "Orquestador Central",
            "status": "idle",
            "healthy": True,
            "process_count": 150,
            "error_count": 0,
            "error_rate": 0.0
        },
        ...
    }
}
```

#### `agent_count() -> int`
Get number of registered agents.

#### `list_agents() -> List[str]`
List all agent IDs.

---

## Global Registry Access

```python
from backend.agents import get_registry

registry = get_registry()  # Get singleton instance
```

---

## Enum Types

### SiniestroState
```python
REPORTED = "reported"
CLASSIFIED = "classified"
DOCUMENTS_PENDING = "documents_pending"
DOCUMENTS_RECEIVED = "documents_received"
ASSIGNED = "assigned"
IN_PROCESS = "in_process"
PENDING_INFO = "pending_info"
CLOSED = "closed"
ESCALATED = "escalated"
```

### Canal
```python
PHONE = "phone"
WHATSAPP = "whatsapp"
EMAIL = "email"
APP = "app"
```

### AgentStatus
```python
IDLE = "idle"
PROCESSING = "processing"
ERROR = "error"
MAINTENANCE = "maintenance"
```

### Intent (Voice)
```python
REPORT_CLAIM = "report_claim"
CLAIM_STATUS = "claim_status"
DOCUMENT_REQUEST = "document_request"
APPOINTMENT = "appointment"
GENERAL_INFO = "general_info"
ESCALATION = "escalation"
UNKNOWN = "unknown"
```

### ConversationState (Chat)
```python
INITIATED = "initiated"
GATHERING_INFO = "gathering_info"
AWAITING_DOCUMENTS = "awaiting_documents"
PROCESSING = "processing"
COMPLETED = "completed"
ESCALATED = "escalated"
```

---

## Error Handling

All agents return error responses with this format:

```python
{
    "status": "error",
    "error": "Error message",
    "agent_id": "agent_identifier"
}
```

Database operations and external calls wrap in try-except and return appropriate error responses.

---

## Database Schema

Required tables if using database logging:

```sql
CREATE TABLE agent_logs (
    id VARCHAR(36) PRIMARY KEY,
    agent_id VARCHAR(50),
    agent_name VARCHAR(100),
    siniestro_id VARCHAR(50),
    action VARCHAR(100),
    input_data TEXT,
    output_data TEXT,
    duration_ms FLOAT,
    status VARCHAR(20),
    error_message TEXT,
    timestamp DATETIME,
    INDEX idx_siniestro (siniestro_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_agent (agent_id)
);
```

---

## Notes

- All methods are `async` and require `await`
- Type hints provided for all parameters and returns
- No external API keys required for MVP (rule-based)
- Ready for LLM, Vision AI, and TTS integration
- Full error handling with automatic logging
- Comprehensive docstrings in source code

---

**API Reference v1.0.0 - SegurCaixa Adeslas Siniestros IA**
