#!/usr/bin/env python3
"""
SiniestrosAI — Main Entry Point
Starts the agent engine, workflow engine, API server, and WebSocket broadcast.

Usage:
    python main.py [--port 8765] [--host 0.0.0.0]
"""

import asyncio
import sys
import os
import signal
import argparse

# Add this directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.engine import AgentEngine
from workflows.claims import WorkflowEngine
from api.server import start_server, broadcast_loop


def parse_args():
    parser = argparse.ArgumentParser(description="SiniestrosAI Backend Server")
    parser.add_argument("--port", type=int, default=8765, help="Server port (default: 8765)")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Server host (default: 0.0.0.0)")
    return parser.parse_args()


async def run_demo_workflows(workflow_engine: WorkflowEngine, agent_engine: AgentEngine):
    """Periodically launch demo workflows to show the system in action"""
    await asyncio.sleep(5)  # Let the system start up

    siniestro_ids = list(agent_engine.siniestros.keys())
    idx = 0

    while True:
        if siniestro_ids:
            sid = siniestro_ids[idx % len(siniestro_ids)]
            sin = agent_engine.siniestros[sid]
            wf = workflow_engine.create_workflow(sid, sin.tipo, sin.amount)
            print(f"[Workflow] Starting: {wf.name} for {sid}")
            await workflow_engine.run_workflow(wf.id)
            print(f"[Workflow] Completed: {wf.name} for {sid}")
            idx += 1
        await asyncio.sleep(30)  # New workflow every 30s


async def main():
    args = parse_args()

    print("=" * 60)
    print("  SiniestrosAI — Plataforma IA para SegurCaixa Adeslas")
    print("=" * 60)
    print()

    # Initialize engines
    agent_engine = AgentEngine()
    workflow_engine = WorkflowEngine(agent_engine)

    print(f"[Init] {len(agent_engine.agents)} agentes inicializados")
    print(f"[Init] {len(agent_engine.siniestros)} siniestros de demo cargados")

    # Start HTTP + WebSocket server
    frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
    server = start_server(agent_engine, host=args.host, port=args.port, frontend_dir=frontend_dir)

    print()
    print(f"  Frontend:  http://localhost:{args.port}")
    print(f"  API:       http://localhost:{args.port}/api/state")
    print(f"  WebSocket: ws://localhost:{args.port}")
    print()
    print("  Ctrl+C para detener")
    print("=" * 60)

    # Run all async tasks concurrently
    try:
        await asyncio.gather(
            agent_engine.run_simulation(),
            broadcast_loop(agent_engine),
            run_demo_workflows(workflow_engine, agent_engine),
        )
    except asyncio.CancelledError:
        pass
    finally:
        agent_engine.stop()
        server.shutdown()
        print("\n[SiniestrosAI] Servidor detenido.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[SiniestrosAI] Adios!")
