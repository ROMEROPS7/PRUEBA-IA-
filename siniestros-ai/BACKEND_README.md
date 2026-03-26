# SegurCaixa Adeslas - Backend API

FastAPI-based backend for the Claims Management System (Sistema IA Siniestros) with real-time WebSocket support and AI agent orchestration.

## Features

- **RESTful API** for claims (siniestros), clients, and agents management
- **Real-time WebSocket** support for live updates
- **AI Agents** for documents analysis, chat, voice processing, and automatic assignment
- **Multi-channel** support (WhatsApp, Email, SMS, Voice, Web)
- **Notifications** via SMS, Email, and WhatsApp
- **Pydantic** models for request/response validation
- **CORS** middleware for frontend integration
- **Comprehensive logging** and error handling

## Project Structure

```
backend/
├── api/
│   ├── routes_clientes.py      # Client management endpoints
│   ├── routes_siniestros.py    # Claims management endpoints (KEY)
│   ├── routes_agentes.py       # Agents endpoints
│   ├── routes_dashboard.py     # Dashboard endpoints
│   ├── websocket.py            # WebSocket connection manager
│   └── __init__.py
├── services/
│   ├── notification.py         # SMS, Email, WhatsApp notifications
│   └── __init__.py
├── schemas.py                  # Pydantic models for all entities
├── config.py                   # Configuration management
├── main.py                     # FastAPI application entry point
└── __init__.py
```

## Installation

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

## Running the Server

### Development

```bash
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Or simply:

```bash
python backend/main.py
```

### Production

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

## API Endpoints

### Clients (`/api/clientes`)

- `GET /api/clientes` - List all clients
- `GET /api/clientes/{cliente_id}` - Get client details with policies
- `GET /api/clientes/dni/{dni}` - Find client by DNI
- `POST /api/clientes` - Create new client

### Claims (`/api/siniestros`)

- `GET /api/siniestros` - List claims (with filters)
- `GET /api/siniestros/{siniestro_id}` - Get claim details
- `POST /api/siniestros` - **Create new claim** (orchestrates full flow)
- `PATCH /api/siniestros/{siniestro_id}` - Update claim
- `POST /api/siniestros/{siniestro_id}/timeline` - Add timeline entry
- `POST /api/siniestros/{siniestro_id}/documentos` - Upload document
- `GET /api/siniestros/{siniestro_id}/comunicaciones` - Get communications
- `POST /api/siniestros/{siniestro_id}/aprobar` - Approve claim
- `POST /api/siniestros/{siniestro_id}/rechazar` - Reject claim

### Agents (`/api/agentes`)

- `GET /api/agentes` - List all agents with stats
- `GET /api/agentes/{agente_id}` - Get agent details
- `GET /api/agentes/{agente_id}/logs` - Get agent activity logs
- `GET /api/agentes/stats` - Get aggregated statistics
- `POST /api/agentes/chat` - Send message to chat agent
- `POST /api/agentes/voice` - Send voice transcription

### Dashboard (`/api/dashboard`)

- `GET /api/dashboard/gestor` - Manager dashboard with KPIs
- `GET /api/dashboard/cliente/{cliente_id}` - Client dashboard
- `GET /api/dashboard/health` - Health check

## WebSocket

**Endpoint**: `ws://localhost:8000/ws/{client_type}/{client_id}`

**Client Types**: `gestor`, `cliente`, `admin`

### Example Connection (JavaScript)

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/gestor/gestor_001');

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log(message.tipo); // siniestro_update, agent_activity, etc.
};
```

### Message Types

1. **siniestro_update** - When claim state changes
2. **agent_activity** - When agent completes action
3. **new_siniestro** - New claim created
4. **timeline_update** - Timeline entry added
5. **chat_message** - New chat message
6. **connection_acknowledged** - Connection established

## Create Claim Flow (POST /api/siniestros)

The POST endpoint orchestrates the full claim lifecycle:

```
1. Create siniestro in system
   ↓
2. Call ORCHESTRATOR AGENT which coordinates:
   - Documents analysis agent
   - Chat agent (if needed)
   - Voice agent (if needed)
   - Assignment agent
   ↓
3. Broadcast new_siniestro event via WebSocket
   ↓
4. Notify gestor and cliente
   ↓
5. Return complete siniestro data
```

### Request Body

```json
{
    "cliente_id": "cli_001",
    "poliza_id": "pol_001",
    "canal": "web",
    "descripcion": "Rotura de cristal en ventana",
    "prioridad_sugerida": "media"
}
```

### Response

```json
{
    "id": "sin_abc123",
    "numero_siniestro": "SIN-2024-000001",
    "cliente_id": "cli_001",
    "estado": "abierto",
    "prioridad": "media",
    "modo_automatico": true,
    "fecha_creacion": "2024-03-25T10:30:00",
    "timeline": [...],
    "documentos": [...],
    "comunicaciones": [...]
}
```

## AI Agents

The system coordinates five specialized agents:

### 1. Chat Agent
- Handles WhatsApp, Email, Web chat
- NLP for intent extraction
- Determines escalation needs
- Returns confidence scores

### 2. Documents Agent
- Analyzes uploaded documents
- OCR text extraction
- Document type detection
- Validates against requirements
- Calculates completeness

### 3. Voice Agent
- Processes call transcriptions
- Sentiment analysis
- Issue classification
- Urgency determination

### 4. Assignment Agent
- Automatically assigns to gestor
- Considers workload and expertise
- Priority-based routing
- Escalation triggers

### 5. Orchestrator Agent
- Coordinates other agents
- Manages claim workflow
- Ensures data consistency
- Handles error recovery

## Notifications

### SMS (Twilio/AWS SNS)

```python
await notification_service.send_sms("+34912345678", "Tu mensaje")
```

### Email (SendGrid/AWS SES)

```python
await notification_service.send_email(
    to="cliente@example.com",
    subject="Subject",
    body="<p>HTML content</p>"
)
```

### WhatsApp

```python
await notification_service.send_whatsapp("+34912345678", "Tu mensaje")
```

## Configuration

Edit `.env` file to configure:

- **Database**: PostgreSQL, SQLite, etc.
- **Notifications**: SMS, Email, WhatsApp providers
- **Agents**: AI models (GPT-4, etc.)
- **Security**: API keys, tokens
- **Features**: Feature flags for experimentation

See `.env.example` for all available options.

## Development

### Run Tests

```bash
pytest
pytest -v  # Verbose
pytest --asyncio-mode=auto  # For async tests
```

### Code Quality

```bash
# Format code
black .

# Lint
flake8 backend/

# Type checking
mypy backend/
```

### Logging

Set log level in `.env`:

```
LOG_LEVEL=debug  # debug, info, warning, error
```

## Production Deployment

### Docker

```bash
docker build -t segurcaixa-api .
docker run -p 8000:8000 -e DATABASE_URL=postgresql://... segurcaixa-api
```

### Uvicorn with Gunicorn

```bash
gunicorn backend.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

### Environment Variables

Always set in production:
- `DEBUG=False`
- `ENVIRONMENT=production`
- `SECRET_KEY=<strong-random-key>`
- `REQUIRE_HTTPS=True`
- Database credentials
- API keys for services

## Health Check

```bash
curl http://localhost:8000/health
```

Response:

```json
{
    "status": "healthy",
    "timestamp": "2024-03-25T10:30:00",
    "version": "1.0.0",
    "connections": {
        "total_gestores": 3,
        "total_clientes": 12,
        "total_admins": 1
    }
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
    "detail": "Error description",
    "error_code": "ERROR_CODE",
    "timestamp": "2024-03-25T10:30:00"
}
```

## WebSocket Connection Example (Python)

```python
import asyncio
import json
import websockets

async def connect():
    uri = "ws://localhost:8000/ws/gestor/gestor_001"
    async with websockets.connect(uri) as websocket:
        # Receive messages
        async for message in websocket:
            data = json.loads(message)
            print(f"Received: {data['tipo']}")
            print(f"Data: {data['datos']}")

asyncio.run(connect())
```

## Monitoring & Logging

All requests and WebSocket events are logged:

```
2024-03-25 10:30:45 - backend.api.routes_siniestros - INFO - Creating new siniestro
2024-03-25 10:30:46 - backend.api.websocket - INFO - Gestor conectado: gestor_001
2024-03-25 10:30:47 - backend.api.routes_siniestros - INFO - Siniestro creado: SIN-2024-000001
```

## Support

For issues or questions:
1. Check logs: `LOG_LEVEL=debug`
2. Review API docs: `/api/docs`
3. Test endpoints with cURL or Postman

## License

Proprietary - SegurCaixa Adeslas
