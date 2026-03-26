"""
SegurCaixa Adeslas Multi-Agent Claims Management System

This package provides a comprehensive multi-agent system for managing insurance claims
with specialized agents for classification, document processing, assignment, and communication.

Agents:
- Orchestrator: Central coordinator for all agents and workflows
- Classifier: Classifies claims by type, urgency, and fraud probability
- Docs Agent: Processes and validates claim documentation
- Assignment Agent: Assigns claims to qualified professionals
- Voice Agent: Handles phone call simulations and TTS preparation
- Chat Agent: Manages WhatsApp, Email, and SMS communications
"""

from .base import BaseAgent, AgentStatus
from .classifier_agent import ClassifierAgent, ClaimType, ClaimSubtype, Urgency
from .docs_agent import DocsAgent, DocumentType
from .assignment_agent import AssignmentAgent, Especialidad
from .voice_agent import VoiceAgent, CallStatus, Intent
from .chat_agent import ChatAgent, Channel, ConversationState
from .registry import AgentRegistry, get_registry
from .orchestrator import Orchestrator, SiniestroState, Canal

__version__ = "1.0.0"

__all__ = [
    # Base
    "BaseAgent",
    "AgentStatus",
    # Classifier
    "ClassifierAgent",
    "ClaimType",
    "ClaimSubtype",
    "Urgency",
    # Docs
    "DocsAgent",
    "DocumentType",
    # Assignment
    "AssignmentAgent",
    "Especialidad",
    # Voice
    "VoiceAgent",
    "CallStatus",
    "Intent",
    # Chat
    "ChatAgent",
    "Channel",
    "ConversationState",
    # Registry
    "AgentRegistry",
    "get_registry",
    # Orchestrator
    "Orchestrator",
    "SiniestroState",
    "Canal",
]
