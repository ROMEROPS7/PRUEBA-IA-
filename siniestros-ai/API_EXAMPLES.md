# API Examples - cURL Commands

Complete collection of cURL commands to test all API endpoints.

## Base URL

```
http://localhost:8000
```

## Health & Status

### Health Check
```bash
curl -X GET http://localhost:8000/health
```

**Response:**
```json
{
    "status": "healthy",
    "timestamp": "2024-03-25T10:30:00.123456",
    "version": "1.0.0",
    "service": "SegurCaixa Adeslas - Sistema IA Siniestros",
    "connections": {
        "total_gestores": 0,
        "total_clientes": 0,
        "total_conexiones_clientes": 0,
        "total_admins": 0
    }
}
```

## Clientes (Clients)

### List All Clients
```bash
curl -X GET "http://localhost:8000/api/clientes?skip=0&limit=10" \
  -H "accept: application/json"
```

### Get Client by ID
```bash
curl -X GET http://localhost:8000/api/clientes/cli_001 \
  -H "accept: application/json"
```

### Get Client by DNI
```bash
curl -X GET http://localhost:8000/api/clientes/dni/12345678A \
  -H "accept: application/json"
```

### Create New Client
```bash
curl -X POST http://localhost:8000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos",
    "apellidos": "Pérez López",
    "dni": "98765432Z",
    "email": "carlos@example.com",
    "telefono": "+34912345679",
    "canal_preferido": "whatsapp"
  }'
```

## Siniestros (Claims) - MAIN RESOURCE

### List All Claims (with filters)
```bash
# List all
curl -X GET "http://localhost:8000/api/siniestros?skip=0&limit=10" \
  -H "accept: application/json"

# Filter by estado
curl -X GET "http://localhost:8000/api/siniestros?estado=en_proceso" \
  -H "accept: application/json"

# Filter by prioridad
curl -X GET "http://localhost:8000/api/siniestros?prioridad=alta" \
  -H "accept: application/json"

# Filter by gestor
curl -X GET "http://localhost:8000/api/siniestros?gestor=gestor_001" \
  -H "accept: application/json"

# Multiple filters
curl -X GET "http://localhost:8000/api/siniestros?estado=abierto&prioridad=critica" \
  -H "accept: application/json"
```

### Get Claim by ID
```bash
curl -X GET http://localhost:8000/api/siniestros/sin_001 \
  -H "accept: application/json"
```

### **CREATE NEW CLAIM (Main Orchestration Endpoint)**

```bash
curl -X POST http://localhost:8000/api/siniestros \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "cli_001",
    "poliza_id": "pol_001",
    "canal": "web",
    "descripcion": "Rotura de cristal en ventana principal del salón",
    "prioridad_sugerida": "media"
  }'
```

**With high priority (triggers gestor notification):**
```bash
curl -X POST http://localhost:8000/api/siniestros \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "cli_001",
    "poliza_id": "pol_001",
    "canal": "whatsapp",
    "descripcion": "Accidente de tráfico - vehículo total loss",
    "prioridad_sugerida": "critica"
  }'
```

**Response:**
```json
{
    "id": "sin_abc123",
    "numero_siniestro": "SIN-2024-000001",
    "cliente_id": "cli_001",
    "poliza_id": "pol_001",
    "canal": "web",
    "descripcion": "Rotura de cristal",
    "estado": "abierto",
    "prioridad": "media",
    "prioridad_sugerida": "media",
    "fecha_creacion": "2024-03-25T10:30:00",
    "fecha_ultima_actualizacion": "2024-03-25T10:30:00",
    "modo_automatico": true,
    "gestor_asignado": null,
    "timeline": [...],
    "documentos": [],
    "comunicaciones": [],
    "porcentaje_completitud": 0
}
```

### Update Claim
```bash
# Change estado
curl -X PATCH http://localhost:8000/api/siniestros/sin_001 \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "en_proceso",
    "modo_automatico": false,
    "gestor_asignado": "gestor_002"
  }'

# Change prioridad
curl -X PATCH http://localhost:8000/api/siniestros/sin_001 \
  -H "Content-Type: application/json" \
  -d '{
    "prioridad": "alta"
  }'
```

### Add Timeline Entry
```bash
curl -X POST http://localhost:8000/api/siniestros/sin_001/timeline \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "documento_requerido",
    "descripcion": "Se solicita factura de reparación",
    "datos_adicionales": {
      "documento_id": "DOC001",
      "fecha_limite": "2024-03-30"
    }
  }'
```

### Upload Document
```bash
curl -X POST http://localhost:8000/api/siniestros/sin_001/documentos \
  -F "file=@/path/to/document.pdf"
```

Or using a sample file:
```bash
# Create a test file
echo "Test document content" > test.txt

# Upload it
curl -X POST http://localhost:8000/api/siniestros/sin_001/documentos \
  -F "file=@test.txt"
```

### Get Communications Log
```bash
curl -X GET http://localhost:8000/api/siniestros/sin_001/comunicaciones \
  -H "accept: application/json"
```

### Approve Claim
```bash
curl -X POST http://localhost:8000/api/siniestros/sin_001/aprobar \
  -H "accept: application/json"
```

### Reject Claim
```bash
curl -X POST http://localhost:8000/api/siniestros/sin_001/rechazar \
  -H "accept: application/json"
```

## Agentes (Agents)

### List All Agents
```bash
curl -X GET http://localhost:8000/api/agentes \
  -H "accept: application/json"
```

### Filter Agents by Type
```bash
curl -X GET "http://localhost:8000/api/agentes?tipo=chat" \
  -H "accept: application/json"
```

### Get Agent Details
```bash
curl -X GET http://localhost:8000/api/agentes/agente_chat \
  -H "accept: application/json"
```

### Get Agent Activity Logs
```bash
curl -X GET "http://localhost:8000/api/agentes/agente_chat/logs?skip=0&limit=20" \
  -H "accept: application/json"
```

### Get Aggregated Stats
```bash
curl -X GET http://localhost:8000/api/agentes/stats \
  -H "accept: application/json"
```

**Response:**
```json
{
    "llamadas_procesadas_hoy": 92,
    "mensajes_procesados": 156,
    "documentos_analizados": 87,
    "tiempo_promedio_respuesta_ms": 3600.5,
    "tasa_exito_promedio": 0.915,
    "agentes_activos": 5,
    "agentes_totales": 5,
    "timestamp": "2024-03-25T10:30:00"
}
```

### Send Message to Chat Agent
```bash
curl -X POST http://localhost:8000/api/agentes/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hola, tengo un problema con mi póliza",
    "canal": "whatsapp",
    "cliente_id": "cli_001",
    "siniestro_id": "sin_001"
  }'
```

### Send Voice Transcription
```bash
curl -X POST http://localhost:8000/api/agentes/voice \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "He tenido un accidente de coche esta mañana en la autopista",
    "cliente_id": "cli_001"
  }'
```

## Dashboard

### Get Manager Dashboard
```bash
curl -X GET http://localhost:8000/api/dashboard/gestor \
  -H "accept: application/json"
```

**Response includes:**
- KPIs (open claims, in progress, resolved today, etc.)
- Pending claims requiring action
- Agent activity
- State/priority distribution

### Get Client Dashboard
```bash
curl -X GET http://localhost:8000/api/dashboard/cliente/cli_001 \
  -H "accept: application/json"
```

## WebSocket Examples

### Connect with wscat (install: `npm install -g wscat`)

```bash
# Connect as manager
wscat -c ws://localhost:8000/ws/gestor/gestor_001

# Connect as client
wscat -c ws://localhost:8000/ws/cliente/cli_001

# Connect as admin
wscat -c ws://localhost:8000/ws/admin/admin_001
```

### Python WebSocket Client

```python
import asyncio
import json
import websockets

async def listen_to_updates():
    uri = "ws://localhost:8000/ws/gestor/gestor_001"
    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket")

        # Receive messages
        async for message in websocket:
            data = json.loads(message)
            print(f"\n📨 New Message: {data['tipo']}")
            print(f"Data: {json.dumps(data['datos'], indent=2)}")

asyncio.run(listen_to_updates())
```

### JavaScript WebSocket Client

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/gestor/gestor_001');

ws.onopen = () => {
    console.log('✅ Connected to WebSocket');
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log(`\n📨 ${message.tipo}`);
    console.log(message.datos);

    // Handle specific message types
    if (message.tipo === 'siniestro_update') {
        console.log(`Siniestro ${message.datos.numero_siniestro} updated!`);
        console.log(`New state: ${message.datos.estado}`);
    } else if (message.tipo === 'new_siniestro') {
        console.log(`New claim: ${message.datos.numero_siniestro}`);
    } else if (message.tipo === 'agent_activity') {
        console.log(`Agent ${message.datos.agente_id} activity`);
    }
};

ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
};

ws.onclose = () => {
    console.log('❌ WebSocket disconnected');
};
```

## Scripted Workflow Example

Test a complete workflow with a bash script:

```bash
#!/bin/bash

API="http://localhost:8000"

echo "1️⃣  Creating new claim..."
CLAIM=$(curl -s -X POST $API/api/siniestros \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "cli_001",
    "poliza_id": "pol_001",
    "canal": "web",
    "descripcion": "Test claim",
    "prioridad_sugerida": "media"
  }')

CLAIM_ID=$(echo $CLAIM | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Created claim: $CLAIM_ID"

echo -e "\n2️⃣  Getting claim details..."
curl -s -X GET $API/api/siniestros/$CLAIM_ID | jq '.'

echo -e "\n3️⃣  Updating claim..."
curl -s -X PATCH $API/api/siniestros/$CLAIM_ID \
  -H "Content-Type: application/json" \
  -d '{"estado": "en_proceso"}' | jq '.estado'

echo -e "\n4️⃣  Adding timeline entry..."
curl -s -X POST $API/api/siniestros/$CLAIM_ID/timeline \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "validacion",
    "descripcion": "Validación inicial completada"
  }' | jq '.tipo'

echo -e "\n5️⃣  Approving claim..."
curl -s -X POST $API/api/siniestros/$CLAIM_ID/aprobar | jq '.estado'

echo -e "\n✅ Workflow completed!"
```

## Batch Operations

### Create Multiple Claims
```bash
for i in {1..3}; do
  curl -X POST http://localhost:8000/api/siniestros \
    -H "Content-Type: application/json" \
    -d "{
      \"cliente_id\": \"cli_001\",
      \"poliza_id\": \"pol_001\",
      \"canal\": \"web\",
      \"descripcion\": \"Claim #$i\",
      \"prioridad_sugerida\": \"media\"
    }"
  echo "\n"
done
```

## Error Examples

### 404 - Not Found
```bash
curl -X GET http://localhost:8000/api/siniestros/sin_nonexistent
```

**Response:**
```json
{
    "detail": "Siniestro sin_nonexistent not found"
}
```

### 400 - Bad Request
```bash
curl -X POST http://localhost:8000/api/siniestros \
  -H "Content-Type: application/json" \
  -d '{"cliente_id": ""}'
```

## Performance Testing

### Load Testing with Apache Bench
```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:8000/api/siniestros

# With POST data
ab -n 100 -c 10 -T application/json \
  -p request.json http://localhost:8000/api/siniestros
```

### Load Testing with wrk
```bash
wrk -t4 -c100 -d30s http://localhost:8000/api/siniestros
```

---

**Save these commands for testing! Use `/api/docs` for interactive testing in Swagger UI.**
