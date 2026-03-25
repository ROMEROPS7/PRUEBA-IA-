"""
SiniestrosAI API Server
HTTP + WebSocket server using Python stdlib only.
Serves agent engine state and streams real-time conversations.
"""

import asyncio
import json
import hashlib
import struct
import time
import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn
import threading

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agents.engine import AgentEngine


# ============================================================
# WEBSOCKET IMPLEMENTATION (stdlib only, RFC 6455)
# ============================================================

class WebSocketConnection:
    """Minimal WebSocket implementation per RFC 6455"""

    def __init__(self, rfile, wfile):
        self.rfile = rfile
        self.wfile = wfile
        self.closed = False

    def send(self, data: str):
        """Send a text frame"""
        if self.closed:
            return
        try:
            payload = data.encode("utf-8")
            frame = bytearray()
            frame.append(0x81)  # FIN + text opcode
            length = len(payload)
            if length < 126:
                frame.append(length)
            elif length < 65536:
                frame.append(126)
                frame.extend(struct.pack(">H", length))
            else:
                frame.append(127)
                frame.extend(struct.pack(">Q", length))
            frame.extend(payload)
            self.wfile.write(bytes(frame))
            self.wfile.flush()
        except Exception:
            self.closed = True

    def recv(self) -> str:
        """Receive a text frame (blocking)"""
        if self.closed:
            return None
        try:
            b1 = self.rfile.read(1)
            if not b1:
                self.closed = True
                return None
            opcode = b1[0] & 0x0F
            if opcode == 0x8:  # Close frame
                self.closed = True
                return None

            b2 = self.rfile.read(1)
            if not b2:
                self.closed = True
                return None
            masked = b2[0] & 0x80
            length = b2[0] & 0x7F

            if length == 126:
                length = struct.unpack(">H", self.rfile.read(2))[0]
            elif length == 127:
                length = struct.unpack(">Q", self.rfile.read(8))[0]

            if masked:
                mask_key = self.rfile.read(4)
                data = bytearray(self.rfile.read(length))
                for i in range(length):
                    data[i] ^= mask_key[i % 4]
            else:
                data = self.rfile.read(length)

            if opcode == 0x9:  # Ping
                self._send_pong(data)
                return self.recv()

            return bytes(data).decode("utf-8")
        except Exception:
            self.closed = True
            return None

    def _send_pong(self, data):
        """Respond to ping with pong"""
        try:
            frame = bytearray([0x8A, len(data)])
            frame.extend(data)
            self.wfile.write(bytes(frame))
            self.wfile.flush()
        except Exception:
            self.closed = True

    def close(self):
        """Send close frame"""
        if not self.closed:
            try:
                self.wfile.write(bytes([0x88, 0x00]))
                self.wfile.flush()
            except Exception:
                pass
            self.closed = True


def do_websocket_handshake(handler):
    """Perform WebSocket upgrade handshake"""
    key = handler.headers.get("Sec-WebSocket-Key", "")
    GUID = "258EAFA5-E914-47DA-95CA-5AB5DC11E5A5"
    accept = hashlib.sha1((key + GUID).encode()).digest()
    import base64
    accept_b64 = base64.b64encode(accept).decode()

    handler.send_response(101)
    handler.send_header("Upgrade", "websocket")
    handler.send_header("Connection", "Upgrade")
    handler.send_header("Sec-WebSocket-Accept", accept_b64)
    handler.end_headers()


# ============================================================
# HTTP/WS REQUEST HANDLER
# ============================================================

class SiniestrosHandler(SimpleHTTPRequestHandler):
    """Handles HTTP API requests and WebSocket upgrades"""

    engine: AgentEngine = None
    ws_clients: list = []
    frontend_dir: str = ""

    def log_message(self, format, *args):
        """Suppress default logging noise"""
        pass

    def do_GET(self):
        # CORS preflight
        if self.path == "/":
            self._serve_frontend()
            return

        # WebSocket upgrade
        if self.headers.get("Upgrade", "").lower() == "websocket":
            self._handle_websocket()
            return

        # API routes
        if self.path.startswith("/api/"):
            self._handle_api()
            return

        # Serve static frontend files
        self._serve_frontend()

    def do_OPTIONS(self):
        self._cors_headers()
        self.send_response(200)
        self.end_headers()

    def _cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json_response(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._cors_headers()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _handle_api(self):
        path = self.path.rstrip("/")

        if path == "/api/state":
            self._json_response(self.engine.get_state())

        elif path == "/api/agents":
            agents = {k: v.to_dict() for k, v in self.engine.agents.items()}
            self._json_response(agents)

        elif path == "/api/siniestros":
            from dataclasses import asdict
            sins = {k: asdict(v) for k, v in self.engine.siniestros.items()}
            self._json_response(sins)

        elif path.startswith("/api/conversations"):
            since = 0
            if "?" in self.path:
                params = dict(p.split("=") for p in self.path.split("?")[1].split("&") if "=" in p)
                since = float(params.get("since", 0))
            convs = self.engine.get_conversations(since)
            self._json_response(convs)

        elif path == "/api/stats":
            state = self.engine.get_state()
            self._json_response(state["stats"])

        elif path == "/api/health":
            self._json_response({"status": "ok", "uptime": time.time(), "agents": len(self.engine.agents)})

        else:
            self._json_response({"error": "Not found"}, 404)

    def _handle_websocket(self):
        """Upgrade to WebSocket and stream agent conversations"""
        do_websocket_handshake(self)

        ws = WebSocketConnection(self.rfile, self.wfile)
        SiniestrosHandler.ws_clients.append(ws)

        # Send initial state
        ws.send(json.dumps({
            "type": "init",
            "data": self.engine.get_state()
        }, ensure_ascii=False))

        try:
            while not ws.closed:
                msg = ws.recv()
                if msg is None:
                    break
                try:
                    parsed = json.loads(msg)
                    self._handle_ws_message(ws, parsed)
                except json.JSONDecodeError:
                    pass
        except Exception:
            pass
        finally:
            ws.closed = True
            if ws in SiniestrosHandler.ws_clients:
                SiniestrosHandler.ws_clients.remove(ws)

    def _handle_ws_message(self, ws, msg):
        """Handle incoming WebSocket messages from frontend"""
        action = msg.get("action", "")

        if action == "get_state":
            ws.send(json.dumps({
                "type": "state",
                "data": self.engine.get_state()
            }, ensure_ascii=False))

        elif action == "process_siniestro":
            sid = msg.get("siniestro_id", "")
            tasks = self.engine.process_siniestro(sid)
            ws.send(json.dumps({
                "type": "tasks_created",
                "siniestro_id": sid,
                "tasks": len(tasks) if tasks else 0
            }, ensure_ascii=False))

        elif action == "send_message":
            self.engine.send_message(
                msg.get("sender", "coordinador"),
                msg.get("receiver", "supervisor"),
                msg.get("content", ""),
                msg.get("msg_type", "chat")
            )

    def _serve_frontend(self):
        """Serve the frontend HTML"""
        frontend_path = os.path.join(SiniestrosHandler.frontend_dir, "index.html")
        if os.path.exists(frontend_path):
            with open(frontend_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        else:
            self._json_response({"error": "Frontend not found", "path": frontend_path}, 404)


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle requests in a separate thread"""
    allow_reuse_address = True
    daemon_threads = True


# ============================================================
# BROADCAST LOOP — pushes engine events to all WS clients
# ============================================================

async def broadcast_loop(engine: AgentEngine):
    """Continuously broadcast agent state to all WebSocket clients"""
    last_conv_time = time.time()

    while True:
        await asyncio.sleep(1.0)

        # Get new conversations since last check
        new_convs = engine.get_conversations(last_conv_time)
        if new_convs:
            last_conv_time = time.time()

        # Build update payload
        payload = json.dumps({
            "type": "update",
            "data": {
                "agents": {k: v.to_dict() for k, v in engine.agents.items()},
                "new_conversations": new_convs,
                "stats": engine.get_state()["stats"],
                "timestamp": time.time()
            }
        }, ensure_ascii=False)

        # Send to all connected clients
        dead = []
        for ws in SiniestrosHandler.ws_clients:
            if ws.closed:
                dead.append(ws)
                continue
            try:
                ws.send(payload)
            except Exception:
                ws.closed = True
                dead.append(ws)

        for ws in dead:
            if ws in SiniestrosHandler.ws_clients:
                SiniestrosHandler.ws_clients.remove(ws)


# ============================================================
# SERVER START
# ============================================================

def start_server(engine: AgentEngine, host="0.0.0.0", port=8765,
                 frontend_dir=None):
    """Start the HTTP + WebSocket server"""
    SiniestrosHandler.engine = engine
    SiniestrosHandler.ws_clients = []
    SiniestrosHandler.frontend_dir = frontend_dir or os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "frontend"
    )

    server = ThreadedHTTPServer((host, port), SiniestrosHandler)
    print(f"[SiniestrosAI] Server running on http://{host}:{port}")
    print(f"[SiniestrosAI] Frontend dir: {SiniestrosHandler.frontend_dir}")
    print(f"[SiniestrosAI] WebSocket: ws://{host}:{port}")
    print(f"[SiniestrosAI] API: http://{host}:{port}/api/state")

    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()

    return server


if __name__ == "__main__":
    engine = AgentEngine()
    server = start_server(engine)

    loop = asyncio.new_event_loop()

    async def run_all():
        await asyncio.gather(
            engine.run_simulation(),
            broadcast_loop(engine)
        )

    try:
        loop.run_until_complete(run_all())
    except KeyboardInterrupt:
        engine.stop()
        server.shutdown()
