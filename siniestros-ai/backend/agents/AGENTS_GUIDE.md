# SegurCaixa Adeslas Multi-Agent Claims System

## Overview

This is a comprehensive multi-agent AI system for managing insurance claims (siniestros) at SegurCaixa Adeslas. The system coordinates multiple specialized agents to handle the complete lifecycle of a claim from initial report to resolution.

## Architecture

### Agent Components

#### 1. **Orchestrator** (`orchestrator.py`)
- **Role**: Central coordinator of all agents
- **Responsibilities**:
  - Routes incoming claims to appropriate agents
  - Manages siniestro state machine lifecycle
  - Coordinates multi-agent workflows
  - Maintains claim timeline and history
  - Handles escalations

**Key Methods**:
```python
async def process_new_siniestro(canal, cliente_data, descripcion, db_session)
async def get_agent_status()
```

**Claim Lifecycle States**:
- REPORTED → CLASSIFIED → DOCUMENTS_PENDING → ASSIGNED → IN_PROCESS → CLOSED
- Alternative flows: escalations, pending info, etc.

#### 2. **Classifier Agent** (`classifier_agent.py`)
- **Role**: Analyzes and categorizes incoming claims
- **Responsibilities**:
  - Determines claim type (hogar, auto, salud, viaje, otros)
  - Calculates urgency level (baja, media, alta, critica)
  - Detects fraud probability using heuristics
  - Estimates cost ranges
  - Assigns overall IA confidence score

**Key Methods**:
```python
async def classify(descripcion, tipo_poliza, datos_adicionales)
```

**Returns**:
```python
{
    "tipo_siniestro": "hogar",
    "subtipo": "agua",
    "urgencia": "alta",
    "cobertura_aplicable": True,
    "probabilidad_fraude": 0.15,
    "score_ia": 85,
    "estimacion_coste_min": 500,
    "estimacion_coste_max": 5000
}
```

#### 3. **Document Agent** (`docs_agent.py`)
- **Role**: Manages documentation workflow
- **Responsibilities**:
  - Validates document completeness per claim type
  - Analyzes documents (text extraction, validation)
  - Processes images (placeholder for Vision AI)
  - Tracks document receipt and status
  - Defines required docs by claim type

**Key Methods**:
```python
async def process_document(file_path, tipo_siniestro)
async def validate_documentation(siniestro_id, docs, tipo_siniestro)
async def analyze_image(image_path)
```

**Required Docs by Type**:
- **Hogar (Agua)**: fotos_daño, presupuesto_reparacion, factura_anterior
- **Hogar (Incendio)**: fotos_daño, denuncia_policia, presupuesto_reparacion
- **Auto (Colisión)**: fotos_daño, fotos_escena, dni_implicados, presupuesto_taller
- **Salud (Hospitalización)**: informe_hospital, recibos_medicinas, análisis_laboratorio

#### 4. **Assignment Agent** (`assignment_agent.py`)
- **Role**: Assigns claims to qualified professionals
- **Responsibilities**:
  - Matches claims to gestores (claims adjusters)
  - Assigns peritos (expert assessors) for complex cases
  - Assigns specialized professionals (mechanics, doctors, etc.)
  - Considers availability, specialization, and location

**Key Methods**:
```python
async def assign(tipo_siniestro, subtipo, prioridad, ubicacion)
```

**Returns**:
```python
{
    "gestor": {
        "id": "ges_001",
        "nombre": "María García López",
        "especialidad": "hogar",
        "rating": 4.8
    },
    "perito": {
        "id": "per_001",
        "nombre": "Dr. Rafael García Martínez",
        "tipo": "tasador_inmuebles"
    },
    "profesionales": [...]
}
```

#### 5. **Voice Agent** (`voice_agent.py`)
- **Role**: Handles phone call communications
- **Responsibilities**:
  - Processes transcribed audio
  - Extracts intent and entities from speech
  - Generates natural responses
  - Prepares text for TTS (ElevenLabs ready)
  - Simulates voice conversations

**Key Methods**:
```python
async def process_call(audio_text, cliente_id, context)
async def generate_response(context)
```

**Voice Characteristics**:
- Name: "Sara"
- Professional, warm tone
- Spanish (es-ES)
- Ready for ElevenLabs integration

#### 6. **Chat Agent** (`chat_agent.py`)
- **Role**: Manages text-based communications
- **Responsibilities**:
  - Processes WhatsApp, Email, SMS messages
  - Manages conversation state
  - Requests documents from clients
  - Provides professional, warm responses
  - Handles attachments

**Key Methods**:
```python
async def process_message(message, canal, cliente_id, conversation_id, attachments)
async def generate_response(context)
async def request_documents(siniestro_id, tipo_siniestro, canal)
```

**Supported Channels**: WhatsApp, Email, SMS, Web Chat

#### 7. **Agent Registry** (`registry.py`)
- **Role**: Central agent management
- **Responsibilities**:
  - Registers and manages agent instances
  - Provides agent discovery
  - Aggregates system statistics
  - Performs health checks

**Key Methods**:
```python
def get_agent(agent_id)
def get_all_agents()
async def get_agent_stats(agent_id)
async def health_check()
```

## Base Agent Class

All agents inherit from `BaseAgent` which provides:

```python
class BaseAgent(ABC):
    # Core attributes
    agent_id: str
    agent_name: str
    agent_role: str
    color: str          # UI color representation
    icon: str           # UI icon identifier
    status: AgentStatus # IDLE, PROCESSING, ERROR, MAINTENANCE

    # Core methods
    async def process(input_data: Dict) -> Dict
    async def log_action(siniestro_id, action, input_data, output_data, duration_ms, status)
    async def process_with_logging(input_data, siniestro_id, action_name, db_session)
    async def get_status() -> Dict
```

## Usage Examples

### Example 1: Process New Claim

```python
from backend.agents import Orchestrator

# Initialize orchestrator
orchestrator = Orchestrator(db_session=db)

# Process new claim
result = await orchestrator.process_new_siniestro(
    canal="whatsapp",
    cliente_data={
        "id": "cliente_001",
        "nombre": "Juan García",
        "tipo_poliza": "hogar",
        "ubicacion": "Madrid"
    },
    descripcion="Se ha inundado la cocina por una tubería rota",
    db_session=db
)

# Response
print(result["siniestro_id"])      # SG202603250A1B2C3D
print(result["siniestro"]["clasificacion"])  # Classification results
print(result["siniestro"]["asignaciones"])   # Assigned professionals
```

### Example 2: Voice Call Processing

```python
from backend.agents import VoiceAgent

voice_agent = VoiceAgent()

# Process call transcription
result = await voice_agent.process_call(
    audio_text="Hola, tengo un accidente de coche",
    cliente_id="cliente_001"
)

print(result["intent"])     # "report_claim"
print(result["response"]["text"])  # AI response
print(result["response"]["tts_ready"])  # True (ready for ElevenLabs)
```

### Example 3: Chat Message Processing

```python
from backend.agents import ChatAgent

chat_agent = ChatAgent()

# Process WhatsApp message
result = await chat_agent.process_message(
    message="Necesito reportar un siniestro de robo",
    canal="whatsapp",
    cliente_id="cliente_001"
)

print(result["response"]["text"])  # Professional response
print(result["response"]["suggested_actions"])  # Next steps
```

### Example 4: Document Validation

```python
from backend.agents import DocsAgent

docs_agent = DocsAgent()

# Validate documentation
result = await docs_agent.validate_documentation(
    siniestro_id="SG202603250A1B2C3D",
    docs=["/path/to/foto_daño.jpg", "/path/to/presupuesto.pdf"],
    tipo_siniestro="hogar"
)

print(result["completitud_score"])    # 67 (out of 100)
print(result["missing_documents"])    # List of missing docs
```

### Example 5: Get Agent Status

```python
from backend.agents import get_registry

registry = get_registry()

# Get status of all agents
status = await registry.get_agent_status()

# Get stats
stats = await registry.get_agent_stats()

# Health check
health = await registry.health_check()
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/segurcaixa

# Logging
LOG_LEVEL=INFO

# Optional: LLM Integration (future)
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=sk-...

# Optional: Storage
AWS_S3_BUCKET=segurcaixa-claims
AWS_REGION=eu-west-1
```

### Database Schema Requirements

The system expects these tables:

```sql
-- Agent logs
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
    timestamp DATETIME
);

-- Siniestros (would be in production DB)
CREATE TABLE siniestros (
    id VARCHAR(50) PRIMARY KEY,
    cliente_id VARCHAR(50),
    canal VARCHAR(20),
    estado VARCHAR(30),
    descripcion TEXT,
    clasificacion JSON,
    asignaciones JSON,
    documentos JSON,
    fecha_reporte DATETIME,
    timeline JSON
);
```

## Features

### ✅ Implemented
- Rule-based classification with fraud detection
- Multi-channel communication (Phone, WhatsApp, Email, App)
- Document requirement tracking and validation
- Professional assignment algorithm (by specialty, load, location)
- Comprehensive logging and audit trail
- State machine for claim lifecycle
- Voice agent with TTS preparation
- Chat agent with conversation management
- Health monitoring and statistics

### 🚀 Ready for Integration
- **LLM Integration**: All agents have hooks for LLM integration (Claude, GPT-4, etc.)
- **Vision AI**: Document analysis supports Claude Vision, Tesseract, etc.
- **TTS Integration**: Voice responses ready for ElevenLabs or similar
- **Database**: In-memory storage in MVP, easy to swap with SQLAlchemy ORM

### 📋 Future Enhancements
- Machine learning-based fraud detection
- Advanced NLP for intent extraction
- Real-time video call support
- Blockchain for document verification
- Advanced analytics and reporting
- Integration with external databases
- Claims recommendation engine

## Security & Privacy

- All agent actions are logged with timestamps
- Sensitive data handling ready for encryption
- GDPR-compliant data management structure
- Role-based access control for agents
- Audit trail for all changes
- Error handling without sensitive data exposure

## Performance

- **Processing Speed**: Agents designed for ~500ms per operation
- **Concurrency**: Full async/await support for parallel processing
- **Scalability**: Registry pattern enables horizontal scaling
- **Memory**: In-memory caching with option for Redis integration

## Monitoring & Debugging

```python
# Get agent statistics
stats = await registry.get_agent_stats()

# Health check all agents
health = await registry.health_check()

# Get specific agent status
agent_status = await agent.get_status()

# All actions logged to database with:
# - Input/output data
# - Processing duration
# - Status (success/error)
# - Timestamp
```

## File Structure

```
backend/agents/
├── __init__.py                 # Package initialization
├── base.py                     # Abstract base agent class
├── classifier_agent.py         # Classification logic
├── docs_agent.py              # Document processing
├── assignment_agent.py        # Professional assignment
├── voice_agent.py             # Phone communications
├── chat_agent.py              # Text communications
├── orchestrator.py            # Central coordinator
├── registry.py                # Agent management
└── AGENTS_GUIDE.md           # This file
```

## Contributing

When adding new agents:
1. Inherit from `BaseAgent`
2. Implement `process()` method
3. Register with `get_registry()`
4. Add comprehensive logging
5. Include type hints
6. Write docstrings
7. Test with `process_with_logging()`

## License

SegurCaixa Adeslas - Siniestros IA System
