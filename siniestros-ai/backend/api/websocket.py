"""
WebSocket connection manager for real-time updates.
"""

import json
import logging
from typing import Dict, Set, List, Optional
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
from enum import Enum


logger = logging.getLogger(__name__)


class ClientType(str, Enum):
    GESTOR = "gestor"
    CLIENTE = "cliente"
    ADMIN = "admin"


class ConnectionManager:
    """Manages WebSocket connections and broadcasts messages."""

    def __init__(self):
        # Conexiones de gestores: {gestor_id: websocket}
        self.gestores: Dict[str, WebSocket] = {}
        # Conexiones de clientes: {cliente_id: [websockets]}
        self.clientes: Dict[str, List[WebSocket]] = {}
        # Conexiones de admin: {admin_id: websocket}
        self.admins: Dict[str, WebSocket] = {}
        # Seguimiento de tipos de conexión: {websocket: (tipo, id)}
        self.conexion_tipos: Dict[WebSocket, tuple[ClientType, str]] = {}

    async def connect(
        self,
        websocket: WebSocket,
        client_type: ClientType,
        client_id: str,
    ):
        """Accept a WebSocket connection and register it."""
        await websocket.accept()
        self.conexion_tipos[websocket] = (client_type, client_id)

        if client_type == ClientType.GESTOR:
            self.gestores[client_id] = websocket
            logger.info(f"Gestor conectado: {client_id}")
        elif client_type == ClientType.CLIENTE:
            if client_id not in self.clientes:
                self.clientes[client_id] = []
            self.clientes[client_id].append(websocket)
            logger.info(f"Cliente conectado: {client_id}")
        elif client_type == ClientType.ADMIN:
            self.admins[client_id] = websocket
            logger.info(f"Admin conectado: {client_id}")

        # Enviar confirmación de conexión
        await websocket.send_json(
            {
                "tipo": "connection_acknowledged",
                "timestamp": datetime.utcnow().isoformat(),
                "datos": {"mensaje": f"Conexión establecida como {client_type}"},
            }
        )

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        if websocket not in self.conexion_tipos:
            return

        client_type, client_id = self.conexion_tipos.pop(websocket)

        if client_type == ClientType.GESTOR:
            self.gestores.pop(client_id, None)
            logger.info(f"Gestor desconectado: {client_id}")
        elif client_type == ClientType.CLIENTE:
            if client_id in self.clientes:
                self.clientes[client_id] = [
                    ws for ws in self.clientes[client_id] if ws != websocket
                ]
                if not self.clientes[client_id]:
                    del self.clientes[client_id]
            logger.info(f"Cliente desconectado: {client_id}")
        elif client_type == ClientType.ADMIN:
            self.admins.pop(client_id, None)
            logger.info(f"Admin desconectado: {client_id}")

    async def broadcast_to_gestores(self, message: dict):
        """Broadcast message to all connected gestores."""
        mensaje_ws = {
            "timestamp": datetime.utcnow().isoformat(),
            **message,
        }
        desconectar = []
        for gestor_id, websocket in list(self.gestores.items()):
            try:
                await websocket.send_json(mensaje_ws)
            except Exception as e:
                logger.error(f"Error enviando a gestor {gestor_id}: {e}")
                desconectar.append((ClientType.GESTOR, gestor_id, websocket))

        for client_type, client_id, ws in desconectar:
            self.disconnect(ws)

    async def broadcast_to_cliente(self, cliente_id: str, message: dict):
        """Broadcast message to specific cliente."""
        if cliente_id not in self.clientes:
            logger.warning(f"Cliente {cliente_id} no conectado")
            return

        mensaje_ws = {
            "timestamp": datetime.utcnow().isoformat(),
            **message,
        }
        desconectar = []
        for websocket in list(self.clientes[cliente_id]):
            try:
                await websocket.send_json(mensaje_ws)
            except Exception as e:
                logger.error(f"Error enviando a cliente {cliente_id}: {e}")
                desconectar.append((ClientType.CLIENTE, cliente_id, websocket))

        for client_type, client_id, ws in desconectar:
            self.disconnect(ws)

    async def broadcast_to_admins(self, message: dict):
        """Broadcast message to all connected admins."""
        mensaje_ws = {
            "timestamp": datetime.utcnow().isoformat(),
            **message,
        }
        desconectar = []
        for admin_id, websocket in list(self.admins.items()):
            try:
                await websocket.send_json(mensaje_ws)
            except Exception as e:
                logger.error(f"Error enviando a admin {admin_id}: {e}")
                desconectar.append((ClientType.ADMIN, admin_id, websocket))

        for client_type, client_id, ws in desconectar:
            self.disconnect(ws)

    async def broadcast_siniestro_update(
        self,
        siniestro_id: str,
        numero_siniestro: str,
        cliente_id: str,
        estado: str,
        prioridad: str,
        cambios: dict,
    ):
        """Broadcast siniestro update to relevant parties."""
        mensaje = {
            "tipo": "siniestro_update",
            "datos": {
                "siniestro_id": siniestro_id,
                "numero_siniestro": numero_siniestro,
                "cliente_id": cliente_id,
                "estado": estado,
                "prioridad": prioridad,
                "cambios": cambios,
            },
        }

        # Enviar a gestores
        await self.broadcast_to_gestores(mensaje)
        # Enviar a cliente específico
        await self.broadcast_to_cliente(cliente_id, mensaje)
        # Enviar a admins
        await self.broadcast_to_admins(mensaje)

    async def broadcast_agent_activity(
        self,
        agente_id: str,
        tipo_actividad: str,
        descripcion: str,
        siniestro_id: Optional[str] = None,
        cliente_id: Optional[str] = None,
        detalles: Optional[dict] = None,
    ):
        """Broadcast agent activity to all gestores and admins."""
        mensaje = {
            "tipo": "agent_activity",
            "datos": {
                "agente_id": agente_id,
                "tipo_actividad": tipo_actividad,
                "descripcion": descripcion,
                "siniestro_id": siniestro_id,
                "cliente_id": cliente_id,
                "detalles": detalles or {},
            },
        }

        # Enviar a todos los gestores
        await self.broadcast_to_gestores(mensaje)
        # Enviar a admins
        await self.broadcast_to_admins(mensaje)
        # Si hay cliente_id, también notificar al cliente
        if cliente_id:
            await self.broadcast_to_cliente(cliente_id, mensaje)

    async def broadcast_new_siniestro(
        self,
        siniestro_id: str,
        numero_siniestro: str,
        cliente_id: str,
        cliente_nombre: str,
        poliza_numero: str,
        canal: str,
        prioridad: str,
    ):
        """Broadcast new siniestro creation."""
        mensaje = {
            "tipo": "new_siniestro",
            "datos": {
                "siniestro_id": siniestro_id,
                "numero_siniestro": numero_siniestro,
                "cliente_id": cliente_id,
                "cliente_nombre": cliente_nombre,
                "poliza_numero": poliza_numero,
                "canal": canal,
                "prioridad": prioridad,
            },
        }

        await self.broadcast_to_gestores(mensaje)
        await self.broadcast_to_admins(mensaje)

    async def broadcast_timeline_update(
        self,
        siniestro_id: str,
        numero_siniestro: str,
        cliente_id: str,
        tipo: str,
        descripcion: str,
        usuario: Optional[str] = None,
    ):
        """Broadcast timeline update."""
        mensaje = {
            "tipo": "timeline_update",
            "datos": {
                "siniestro_id": siniestro_id,
                "numero_siniestro": numero_siniestro,
                "cliente_id": cliente_id,
                "tipo": tipo,
                "descripcion": descripcion,
                "usuario": usuario,
            },
        }

        await self.broadcast_to_gestores(mensaje)
        await self.broadcast_to_cliente(cliente_id, mensaje)
        await self.broadcast_to_admins(mensaje)

    async def broadcast_chat_message(
        self,
        siniestro_id: Optional[str],
        cliente_id: str,
        canal: str,
        contenido: str,
        direccion: str,
        emisor: str,
    ):
        """Broadcast new chat message."""
        mensaje = {
            "tipo": "chat_message",
            "datos": {
                "siniestro_id": siniestro_id,
                "cliente_id": cliente_id,
                "canal": canal,
                "contenido": contenido,
                "direccion": direccion,
                "emisor": emisor,
            },
        }

        await self.broadcast_to_gestores(mensaje)
        await self.broadcast_to_cliente(cliente_id, mensaje)
        await self.broadcast_to_admins(mensaje)

    def get_connection_stats(self) -> dict:
        """Get connection statistics."""
        return {
            "total_gestores": len(self.gestores),
            "total_clientes": len(self.clientes),
            "total_conexiones_clientes": sum(len(ws_list) for ws_list in self.clientes.values()),
            "total_admins": len(self.admins),
        }


# Global connection manager instance
manager = ConnectionManager()
