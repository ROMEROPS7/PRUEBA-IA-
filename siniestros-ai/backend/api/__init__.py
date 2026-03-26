"""API routes package for SegurCaixa Adeslas Claims Management System."""

from . import (
    routes_clientes,
    routes_siniestros,
    routes_agentes,
    routes_dashboard,
    routes_orchestrator,
    websocket,
)

__all__ = [
    "routes_clientes",
    "routes_siniestros",
    "routes_agentes",
    "routes_dashboard",
    "routes_orchestrator",
    "websocket",
]
