"""
Main FastAPI application for SegurCaixa Adeslas Claims Management System.

This is the entry point for the backend API with real-time WebSocket support.
The system manages insurance claims (siniestros) with AI-powered agents for:
- Document analysis
- Chat interaction
- Voice transcription analysis
- Automatic assignment
- Full process orchestration
"""

import logging
import os
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from datetime import datetime

# Import routers
from backend.api import (
    routes_orchestrator,
    routes_clientes,
    routes_siniestros,
    routes_agentes,
    routes_dashboard,
)
from backend.auth import routes as auth_routes
from backend.ruflo import routes as ruflo_routes
from backend.api.websocket import manager, ClientType
from backend.schemas import ErrorResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# ==================== Lifespan Events ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""

    # Startup
    logger.info("=" * 60)
    logger.info("SegurCaixa Adeslas - Sistema IA Siniestros")
    logger.info("=" * 60)
    logger.info("Starting up application...")

    # Initialize database
    logger.info("Initializing database...")
    try:
        from backend.db.database import init_db
        await init_db()
        logger.info("Database initialized with seed data")
    except Exception as e:
        logger.warning(f"Database init issue (non-fatal): {e}")

    # Initialize agents registry
    logger.info("Initializing agents registry...")
    try:
        from backend.agents.registry import init_all_agents
        registry = init_all_agents()
        logger.info(f"Agents registered: {[a['agent_name'] for a in registry.get_all_agents()]}")
    except Exception as e:
        logger.warning(f"Agent registry init issue (non-fatal): {e}")

    logger.info("Application startup completed")
    logger.info("Ready to accept connections")

    yield

    # Shutdown
    logger.info("Shutting down application...")
    logger.info("Closing database connections...")
    # TODO: await close_db()
    logger.info("Application shutdown completed")


# ==================== FastAPI App Initialization ====================
app = FastAPI(
    title="SegurCaixa Adeslas - Sistema IA Siniestros",
    description=(
        "API para gestión inteligente de reclamaciones de seguros con "
        "soporte para múltiples canales y agentes IA"
    ),
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ==================== CORS Configuration ====================
# Import settings for CORS configuration
from backend.config.settings import settings

# Allow all origins in development (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if os.environ.get("ENV") == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)

# ==================== Route Inclusion ====================
# Include all API routers with prefixes
app.include_router(auth_routes.router)
app.include_router(routes_clientes.router)
app.include_router(routes_siniestros.router)
app.include_router(routes_agentes.router)
app.include_router(routes_dashboard.router)
app.include_router(routes_orchestrator.router)
app.include_router(ruflo_routes.router)

# ==================== Health Check Endpoint ====================
@app.get("/health", tags=["Health"])
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint with LLM and agent status.

    **Returns:** Service health status, LLM info, agent count, connections
    """
    # LLM status
    llm_info = {"provider": "unknown", "status": "unknown"}
    try:
        from backend.services.llm_service import get_llm_service
        llm = get_llm_service()
        llm_available = await llm.is_available()
        llm_info = {
            "provider": llm.provider.value,
            "model": llm.model,
            "status": "connected" if llm_available else "fallback (reglas)",
            "base_url": llm.base_url,
            "lopd_compliant": True,
        }
    except Exception:
        llm_info = {"provider": "fallback", "status": "rule-based", "lopd_compliant": True}

    # Agent count
    agent_count = 0
    try:
        from backend.agents.registry import get_registry
        registry = get_registry()
        agent_count = registry.agent_count()
    except Exception:
        pass

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "service": "SegurCaixa Adeslas - Sistema IA Siniestros",
        "llm": llm_info,
        "agents_registered": agent_count,
        "auth": "JWT (HS256)",
        "connections": manager.get_connection_stats(),
    }


# ==================== WebSocket Endpoint ====================
@app.websocket("/ws/{client_type}/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    client_type: str,
    client_id: str,
):
    """
    WebSocket endpoint for real-time updates.

    **Path Parameters:**
    - `client_type`: Type of client (gestor, cliente, admin)
    - `client_id`: Unique identifier for the client

    **Connection Message Types:**
    The client will receive messages with the following types:

    1. **siniestro_update**: When a claim's state changes
       ```json
       {
           "tipo": "siniestro_update",
           "timestamp": "ISO 8601",
           "datos": {
               "siniestro_id": "string",
               "numero_siniestro": "string",
               "estado": "string",
               "prioridad": "string",
               "cambios": {}
           }
       }
       ```

    2. **agent_activity**: When an agent completes an action
       ```json
       {
           "tipo": "agent_activity",
           "timestamp": "ISO 8601",
           "datos": {
               "agente_id": "string",
               "tipo_actividad": "string",
               "descripcion": "string"
           }
       }
       ```

    3. **new_siniestro**: When a new claim is created
       ```json
       {
           "tipo": "new_siniestro",
           "timestamp": "ISO 8601",
           "datos": {
               "siniestro_id": "string",
               "numero_siniestro": "string",
               "cliente_nombre": "string"
           }
       }
       ```

    4. **timeline_update**: When timeline entry is added
       ```json
       {
           "tipo": "timeline_update",
           "timestamp": "ISO 8601",
           "datos": {
               "siniestro_id": "string",
               "tipo": "string",
               "descripcion": "string"
           }
       }
       ```

    5. **chat_message**: When a new chat message is received
       ```json
       {
           "tipo": "chat_message",
           "timestamp": "ISO 8601",
           "datos": {
               "siniestro_id": "string",
               "cliente_id": "string",
               "canal": "string",
               "contenido": "string"
           }
       }
       ```

    6. **connection_acknowledged**: On successful connection
       ```json
       {
           "tipo": "connection_acknowledged",
           "timestamp": "ISO 8601",
           "datos": {
               "mensaje": "Conexión establecida como {client_type}"
           }
       }
       ```

    **Example Client Code (JavaScript):**
    ```javascript
    const ws = new WebSocket('ws://localhost:8000/ws/gestor/gestor_001');

    ws.onopen = (event) => {
        console.log('Conexión abierta');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Mensaje recibido:', data.tipo, data.datos);

        // Handle different message types
        if (data.tipo === 'siniestro_update') {
            console.log('Actualización de siniestro:', data.datos);
        } else if (data.tipo === 'agent_activity') {
            console.log('Actividad de agente:', data.datos);
        }
    };

    ws.onerror = (event) => {
        console.error('Error WebSocket:', event);
    };

    ws.onclose = (event) => {
        console.log('Conexión cerrada');
    };
    ```

    **Example Client Code (Python):**
    ```python
    import asyncio
    import websockets
    import json

    async def connect():
        uri = "ws://localhost:8000/ws/gestor/gestor_001"
        async with websockets.connect(uri) as websocket:
            # Send a test message (optional)
            await websocket.send(json.dumps({"accion": "ping"}))

            # Receive messages
            async for message in websocket:
                data = json.loads(message)
                print(f"Received: {data['tipo']}")

    asyncio.run(connect())
    ```
    """
    # Validate client type
    try:
        ct = ClientType(client_type)
    except ValueError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    logger.info(f"WebSocket connection attempt: {client_type}/{client_id}")

    try:
        # Accept connection and register
        await manager.connect(websocket, ct, client_id)

        # Keep connection open and handle incoming messages
        while True:
            data = await websocket.receive_text()
            logger.debug(f"WebSocket message from {client_id}: {data}")
            # Could implement message routing here if needed

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"WebSocket disconnected: {client_type}/{client_id}")

    except Exception as e:
        logger.error(f"WebSocket error for {client_id}: {e}")
        manager.disconnect(websocket)


# ==================== Static Files & SPA Support ====================
# Serve frontend static files (if frontend is built)
_base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
frontend_static_path = os.path.join(_base_dir, "frontend")

logger.info(f"Frontend path: {frontend_static_path}")


# ==================== Root Endpoint - Serve Frontend ====================
@app.get("/", include_in_schema=False)
async def root():
    """Serve the frontend."""
    index_path = os.path.join(frontend_static_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "message": "SegurCaixa Adeslas - Sistema IA Siniestros",
        "docs": "/api/docs",
        "health": "/health",
    }


@app.get("/app", include_in_schema=False)
async def serve_app():
    """Serve the frontend app."""
    index_path = os.path.join(frontend_static_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse({"detail": "Frontend not available"}, status_code=404)


# ==================== Error Handlers ====================
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle ValueError exceptions."""
    return JSONResponse(
        status_code=400,
        content={
            "detail": str(exc),
            "error_code": "VALUE_ERROR",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle unexpected exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error",
            "error_code": "INTERNAL_ERROR",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


# ==================== Development Server ====================
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
