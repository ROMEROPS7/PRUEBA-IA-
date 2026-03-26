# Quick Start Guide - Backend

Get the SegurCaixa Adeslas API running in 5 minutes.

## Prerequisites

- Python 3.9+
- pip

## 1. Install Dependencies

```bash
pip install -r requirements.txt
```

## 2. Start the Server

```bash
python backend/main.py
```

You should see:

```
============================================================
SegurCaixa Adeslas - Sistema IA Siniestros
============================================================
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## 3. Access the API

### Swagger UI (Interactive Docs)
Open browser: **http://localhost:8000/api/docs**

### API Health Check
```bash
curl http://localhost:8000/health
```

## 4. Try Basic Endpoints

### List Clients
```bash
curl http://localhost:8000/api/clientes
```

### Create a New Claim
```bash
curl -X POST http://localhost:8000/api/siniestros \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "cli_001",
    "poliza_id": "pol_001",
    "canal": "web",
    "descripcion": "Rotura de cristal",
    "prioridad_sugerida": "media"
  }'
```

### Get Claim Details
```bash
curl http://localhost:8000/api/siniestros/sin_001
```

### Get Dashboard Data
```bash
curl http://localhost:8000/api/dashboard/gestor
```

### List Agents
```bash
curl http://localhost:8000/api/agentes
```

## 5. Connect WebSocket (Real-time Updates)

### JavaScript
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/gestor/gestor_001');

ws.onopen = () => console.log('Connected');

ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log(`Got: ${msg.tipo}`, msg.datos);
};

ws.onerror = (err) => console.error(err);
```

### Python
```python
import asyncio
import json
import websockets

async def connect():
    uri = "ws://localhost:8000/ws/gestor/gestor_001"
    async with websockets.connect(uri) as ws:
        while True:
            msg = json.loads(await ws.recv())
            print(f"Got: {msg['tipo']}")

asyncio.run(connect())
```

## 6. Test with Postman

1. Open Postman
2. Import endpoints:
   - `GET http://localhost:8000/api/clientes`
   - `POST http://localhost:8000/api/siniestros`
   - `GET http://localhost:8000/api/siniestros/{id}`
   - `PATCH http://localhost:8000/api/siniestros/{id}`
   - `POST http://localhost:8000/api/siniestros/{id}/aprobar`

## Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` for your setup (databases, API keys, etc.)

## Available Clients & Claims (Mock Data)

### Clients
- `cli_001` - Juan García López (2 claims)
- `cli_002` - María Martínez González (0 claims)

### Claims
- `sin_001` - SIN-2024-000001 (en_proceso, media)

## Full API Overview

### Clients
- `GET /api/clientes` - List all
- `POST /api/clientes` - Create
- `GET /api/clientes/{id}` - Get one
- `GET /api/clientes/dni/{dni}` - Find by DNI

### Claims (Main Resource)
- `GET /api/siniestros` - List (with filters)
- `POST /api/siniestros` - **Create (orchestrates flow)**
- `GET /api/siniestros/{id}` - Get details
- `PATCH /api/siniestros/{id}` - Update
- `POST /api/siniestros/{id}/timeline` - Add entry
- `POST /api/siniestros/{id}/documentos` - Upload doc
- `GET /api/siniestros/{id}/comunicaciones` - Get messages
- `POST /api/siniestros/{id}/aprobar` - Approve
- `POST /api/siniestros/{id}/rechazar` - Reject

### Agents
- `GET /api/agentes` - List agents
- `GET /api/agentes/{id}` - Get agent details
- `GET /api/agentes/{id}/logs` - Activity logs
- `GET /api/agentes/stats` - Aggregated stats
- `POST /api/agentes/chat` - Chat with agent
- `POST /api/agentes/voice` - Voice transcription

### Dashboard
- `GET /api/dashboard/gestor` - Manager view
- `GET /api/dashboard/cliente/{id}` - Client view
- `GET /api/dashboard/health` - Service health

### WebSocket
- `ws://localhost:8000/ws/gestor/{id}` - Manager events
- `ws://localhost:8000/ws/cliente/{id}` - Client events
- `ws://localhost:8000/ws/admin/{id}` - Admin events

## Next Steps

1. **Read** `/BACKEND_README.md` for detailed documentation
2. **Configure** `.env` with your settings
3. **Connect** frontend to WebSocket
4. **Integrate** with actual agents and databases
5. **Deploy** using Docker or cloud platform

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=8001
python backend/main.py
```

### CORS Issues
Add origin to `CORS_ORIGINS` in `config.py`

### Database Connection
Edit `DATABASE_URL` in `.env`:
- SQLite: `sqlite:///./db.db`
- PostgreSQL: `postgresql://user:pass@localhost/db`

### Debug Mode
```bash
DEBUG=True LOG_LEVEL=debug python backend/main.py
```

## Production Deployment

```bash
# Install gunicorn
pip install gunicorn

# Run with 4 workers
gunicorn backend.main:app --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

## Documentation

- **API Docs**: http://localhost:8000/api/docs
- **OpenAPI**: http://localhost:8000/api/openapi.json
- **Backend Guide**: See `BACKEND_README.md`

---

**Happy claiming! 🎉**
