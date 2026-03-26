"""
Central orchestrator for the SegurCaixa Adeslas claims management system.

This module coordinates all agents and manages the complete claim processing workflow
using a LangGraph-style StateGraph flow for end-to-end claims processing.

The flow provides:
1. Receive claim data
2. Classify claim by type and urgency
3. Validate documents
4. Assign resources (gestor and perito)
5. Notify client
6. Route to appropriate processing path based on risk/urgency
7. Process and complete

LangGraph Alternative: This implementation provides a fallback state machine
that mimics LangGraph's StateGraph pattern without the dependency.
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Callable, Tuple
from enum import Enum
from uuid import uuid4
from typing import TypedDict

from .base import BaseAgent, AgentStatus
from .registry import get_registry
from .classifier_agent import ClassifierAgent
from .docs_agent import DocsAgent
from .assignment_agent import AssignmentAgent
from .voice_agent import VoiceAgent
from .chat_agent import ChatAgent

logger = logging.getLogger(__name__)


class SiniestroState(str, Enum):
    """States of a claim in the system."""
    REPORTED = "reported"
    CLASSIFIED = "classified"
    DOCUMENTS_PENDING = "documents_pending"
    DOCUMENTS_RECEIVED = "documents_received"
    ASSIGNED = "assigned"
    IN_PROCESS = "in_process"
    PENDING_INFO = "pending_info"
    CLOSED = "closed"
    ESCALATED = "escalated"


class Canal(str, Enum):
    """Communication channels."""
    PHONE = "phone"
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    APP = "app"


class FlowNodeType(str, Enum):
    """Types of nodes in the StateGraph."""
    START = "start"
    PROCESS = "process"
    DECISION = "decision"
    END = "end"


class SiniestroFlowState(TypedDict, total=False):
    """Complete state for a siniestro in the flow."""
    # Identifiers
    siniestro_id: str
    canal: str
    
    # Input data
    cliente_data: Dict[str, Any]
    descripcion: str
    
    # Classification results
    clasificacion: Dict[str, Any]
    tipo_siniestro: str
    urgencia: str
    fraud_probability: float
    
    # Document handling
    documentos_requeridos: List[str]
    documentos_validados: bool
    
    # Assignment results
    asignaciones: Dict[str, Any]
    gestor: Dict[str, Any]
    perito: Dict[str, Any]
    
    # Notification
    cliente_notificado: bool
    canal_respuesta: str
    
    # Processing decisions
    route_decision: str  # "manual_review", "priority_processing", "auto_process"
    
    # Timeline and tracking
    timeline: List[Dict[str, Any]]
    estado: str
    
    # Final results
    resultado: Dict[str, Any]
    error: Optional[str]


class FlowNodeDefinition:
    """Definition of a node in the StateGraph."""
    
    def __init__(
        self,
        name: str,
        node_type: FlowNodeType,
        handler: Optional[Callable] = None,
        next_nodes: Optional[List[str]] = None,
    ):
        self.name = name
        self.node_type = node_type
        self.handler = handler
        self.next_nodes = next_nodes or []
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "type": self.node_type.value,
            "has_handler": self.handler is not None,
            "next_nodes": self.next_nodes,
        }


class StateGraph:
    """
    A LangGraph-style StateGraph implementation for claims processing.
    
    This provides a clean state machine pattern with typed state transitions,
    decision nodes, and end-to-end flow management.
    """
    
    def __init__(self, state_schema: type):
        self.state_schema = state_schema
        self.nodes: Dict[str, FlowNodeDefinition] = {}
        self.edges: List[Tuple[str, str]] = []
        self.start_node: Optional[str] = None
        self.end_nodes: List[str] = []
        self.conditional_edges: Dict[str, Callable] = {}
    
    def add_node(
        self,
        name: str,
        handler: Optional[Callable],
        node_type: FlowNodeType = FlowNodeType.PROCESS,
    ) -> None:
        """Add a node to the graph."""
        self.nodes[name] = FlowNodeDefinition(name, node_type, handler)
        logger.debug(f"Added node: {name} ({node_type.value})")
    
    def set_entry_point(self, node_name: str) -> None:
        """Set the entry point of the graph."""
        self.start_node = node_name
        logger.debug(f"Set entry point: {node_name}")
    
    def add_edge(self, from_node: str, to_node: str) -> None:
        """Add a direct edge between two nodes."""
        self.edges.append((from_node, to_node))
        if from_node in self.nodes:
            self.nodes[from_node].next_nodes.append(to_node)
        logger.debug(f"Added edge: {from_node} -> {to_node}")
    
    def add_conditional_edges(
        self,
        source: str,
        condition_fn: Callable[[SiniestroFlowState], str],
        mapping: Dict[str, str],
    ) -> None:
        """
        Add conditional edges based on state.
        
        Args:
            source: Source node name
            condition_fn: Function that takes state and returns next node name
            mapping: Mapping of condition results to node names
        """
        self.conditional_edges[source] = (condition_fn, mapping)
        if source in self.nodes:
            self.nodes[source].next_nodes = list(mapping.values())
        logger.debug(f"Added conditional edges from: {source}")
    
    def set_finish_point(self, node_name: str) -> None:
        """Mark a node as an end point."""
        self.end_nodes.append(node_name)
        if node_name in self.nodes:
            self.nodes[node_name].node_type = FlowNodeType.END
        logger.debug(f"Set finish point: {node_name}")
    
    async def invoke(self, initial_state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the flow from start to end.
        
        Args:
            initial_state: Initial state for the flow
            
        Returns:
            Final state after flow execution
        """
        if not self.start_node:
            raise ValueError("No entry point set for the graph")
        
        current_state = initial_state.copy()
        current_node = self.start_node
        visited_nodes = set()
        
        logger.info(f"Starting flow for siniestro: {current_state.get('siniestro_id')}")
        
        while current_node not in self.end_nodes:
            if current_node in visited_nodes and len(visited_nodes) > 10:
                logger.warning(f"Cycle detected at node: {current_node}")
                break
            
            visited_nodes.add(current_node)
            
            if current_node not in self.nodes:
                raise ValueError(f"Unknown node: {current_node}")
            
            node = self.nodes[current_node]
            logger.info(f"Processing node: {current_node}")
            
            # Execute the node handler if it exists
            if node.handler:
                try:
                    current_state = await node.handler(current_state)
                    if not isinstance(current_state, dict):
                        logger.error(f"Handler {current_node} returned non-dict: {type(current_state)}")
                        current_state = {"error": f"Handler {current_node} returned invalid state"}
                        break
                except Exception as e:
                    logger.error(f"Error in node {current_node}: {e}")
                    current_state["error"] = str(e)
                    break
            
            # Determine next node
            next_node = None
            if current_node in self.conditional_edges:
                condition_fn, mapping = self.conditional_edges[current_node]
                condition_result = condition_fn(current_state)
                next_node = mapping.get(condition_result)
                logger.debug(f"Conditional result: {condition_result} -> {next_node}")
            elif node.next_nodes:
                next_node = node.next_nodes[0]
            
            if not next_node:
                logger.info(f"No next node found, ending at: {current_node}")
                self.set_finish_point(current_node)
                break
            
            current_node = next_node
        
        logger.info(f"Flow completed for siniestro: {current_state.get('siniestro_id')}")
        return current_state
    
    def get_definition(self) -> Dict[str, Any]:
        """Get the flow definition (nodes and edges)."""
        return {
            "start_node": self.start_node,
            "end_nodes": self.end_nodes,
            "nodes": [node.to_dict() for node in self.nodes.values()],
            "edges": [{"from": f, "to": t} for f, t in self.edges],
        }


class Orchestrator(BaseAgent):
    """
    Central orchestrator that coordinates all agents in the claims system.

    This orchestrator implements a complete LangGraph-style StateGraph for
    end-to-end claims processing with:
    - 10 processing nodes (receive, classify, validate, assign, notify, review, etc.)
    - Conditional routing based on fraud probability and urgency
    - Full state tracking and timeline management
    - Integration with all specialized agents
    - Flow status tracking and retrieval
    """

    def __init__(self, db_session: Optional[Any] = None) -> None:
        """
        Initialize the orchestrator.

        Args:
            db_session: Optional database session for persistence
        """
        super().__init__(
            agent_id="orchestrator",
            agent_name="Orquestador Central",
            agent_role="Coordina todos los agentes del sistema de siniestros",
            color="#e74c3c",  # Red
            icon="layers",
            version="2.0.0",
            model_type="rule-based",
        )

        self.db_session = db_session
        self.registry = get_registry()

        # Initialize specialized agents
        self.classifier = ClassifierAgent()
        self.docs_agent = DocsAgent()
        self.assignment_agent = AssignmentAgent()
        self.voice_agent = VoiceAgent()
        self.chat_agent = ChatAgent()

        # Register all agents
        self.registry.register_agent(self)
        self.registry.register_agent(self.classifier)
        self.registry.register_agent(self.docs_agent)
        self.registry.register_agent(self.assignment_agent)
        self.registry.register_agent(self.voice_agent)
        self.registry.register_agent(self.chat_agent)

        # In-memory store for claim data
        self.siniestros = {}
        self.flow_states = {}  # Track flow states by siniestro_id
        
        # Build the StateGraph
        self.flow = self._build_flow_graph()

        # State machine definition (for backward compatibility)
        self.state_transitions = {
            SiniestroState.REPORTED: [
                SiniestroState.CLASSIFIED,
                SiniestroState.ESCALATED,
            ],
            SiniestroState.CLASSIFIED: [
                SiniestroState.DOCUMENTS_PENDING,
                SiniestroState.ASSIGNED,
                SiniestroState.ESCALATED,
            ],
            SiniestroState.DOCUMENTS_PENDING: [
                SiniestroState.DOCUMENTS_RECEIVED,
                SiniestroState.ESCALATED,
            ],
            SiniestroState.DOCUMENTS_RECEIVED: [
                SiniestroState.ASSIGNED,
                SiniestroState.ESCALATED,
            ],
            SiniestroState.ASSIGNED: [
                SiniestroState.IN_PROCESS,
                SiniestroState.PENDING_INFO,
                SiniestroState.ESCALATED,
            ],
            SiniestroState.IN_PROCESS: [
                SiniestroState.CLOSED,
                SiniestroState.PENDING_INFO,
                SiniestroState.ESCALATED,
            ],
            SiniestroState.PENDING_INFO: [
                SiniestroState.IN_PROCESS,
                SiniestroState.ESCALATED,
            ],
            SiniestroState.CLOSED: [],
            SiniestroState.ESCALATED: [
                SiniestroState.IN_PROCESS,
                SiniestroState.CLOSED,
            ],
        }

    def _build_flow_graph(self) -> StateGraph:
        """
        Build the complete StateGraph for claim processing.
        
        Flow:
        1. receive_claim → Initial state
        2. classify → Classify by type and urgency
        3. validate_documents → Check document completeness
        4. assign_resources → Assign gestor and perito
        5. notify_client → Send notification to client
        6. review_decision → Decision node
           - If fraud_probability > 0.5 → manual_review
           - If urgency == "critica" → priority_processing
           - Else → auto_process
        7. manual_review → Flag for gestor intervention
        8. priority_processing → Fast-track processing
        9. auto_process → Automatic processing
        10. complete → Final state
        
        Returns:
            Configured StateGraph
        """
        graph = StateGraph(SiniestroFlowState)
        
        # Add all nodes
        graph.add_node("receive_claim", self._node_receive_claim, FlowNodeType.START)
        graph.add_node("classify", self._node_classify)
        graph.add_node("validate_documents", self._node_validate_documents)
        graph.add_node("assign_resources", self._node_assign_resources)
        graph.add_node("notify_client", self._node_notify_client)
        graph.add_node("review_decision", self._node_review_decision, FlowNodeType.DECISION)
        graph.add_node("manual_review", self._node_manual_review)
        graph.add_node("priority_processing", self._node_priority_processing)
        graph.add_node("auto_process", self._node_auto_process)
        graph.add_node("complete", self._node_complete, FlowNodeType.END)
        
        # Set entry and finish points
        graph.set_entry_point("receive_claim")
        graph.set_finish_point("complete")
        
        # Add direct edges
        graph.add_edge("receive_claim", "classify")
        graph.add_edge("classify", "validate_documents")
        graph.add_edge("validate_documents", "assign_resources")
        graph.add_edge("assign_resources", "notify_client")
        graph.add_edge("notify_client", "review_decision")
        
        # Add conditional edges from review_decision
        graph.add_conditional_edges(
            "review_decision",
            self._route_decision,
            {
                "manual_review": "manual_review",
                "priority_processing": "priority_processing",
                "auto_process": "auto_process",
            },
        )
        
        # All processing paths lead to complete
        graph.add_edge("manual_review", "complete")
        graph.add_edge("priority_processing", "complete")
        graph.add_edge("auto_process", "complete")
        
        logger.info("Flow graph built with 10 nodes")
        return graph

    async def _node_receive_claim(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Node 1: Receive and initialize claim."""
        logger.info(f"[receive_claim] Processing siniestro: {state.get('siniestro_id')}")
        
        siniestro_id = state.get("siniestro_id") or f"SG{datetime.utcnow().strftime('%Y%m%d')}{str(uuid4())[:8].upper()}"
        
        state.update({
            "siniestro_id": siniestro_id,
            "estado": SiniestroState.REPORTED.value,
            "timeline": [
                {
                    "timestamp": datetime.utcnow().isoformat(),
                    "evento": "Siniestro reportado",
                    "canal": state.get("canal", "unknown"),
                    "detalles": {"descripcion": state.get("descripcion", "")[:100]},
                }
            ],
            "error": None,
        })
        
        self.siniestros[siniestro_id] = state.copy()
        self.flow_states[siniestro_id] = {"current_node": "receive_claim", "status": "processing"}
        
        logger.info(f"[receive_claim] Initialized siniestro: {siniestro_id}")
        return state

    async def _node_classify(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Node 2: Classify the claim."""
        siniestro_id = state.get("siniestro_id")
        logger.info(f"[classify] Classifying siniestro: {siniestro_id}")
        
        try:
            result = await self.classifier.process_with_logging(
                input_data={
                    "descripcion": state.get("descripcion", ""),
                    "tipo_poliza": state.get("cliente_data", {}).get("tipo_poliza", "otros"),
                    "datos_adicionales": {},
                },
                siniestro_id=siniestro_id,
                action_name="classification",
                db_session=self.db_session,
            )
            
            state.update({
                "clasificacion": result,
                "tipo_siniestro": result.get("tipo_siniestro", "otros"),
                "urgencia": result.get("urgencia", "media"),
                "fraud_probability": result.get("probabilidad_fraude", 0.0),
                "estado": SiniestroState.CLASSIFIED.value,
            })
            
            state["timeline"].append({
                "timestamp": datetime.utcnow().isoformat(),
                "evento": "Siniestro clasificado",
                "detalles": {
                    "tipo": state.get("tipo_siniestro"),
                    "urgencia": state.get("urgencia"),
                    "fraud_prob": state.get("fraud_probability"),
                },
            })
            
            logger.info(f"[classify] Classified as {state.get('tipo_siniestro')} (urgency: {state.get('urgencia')})")
        except Exception as e:
            logger.error(f"[classify] Error: {e}")
            state["error"] = str(e)
        
        self.flow_states[siniestro_id]["current_node"] = "classify"
        return state

    async def _node_validate_documents(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Node 3: Validate documents."""
        siniestro_id = state.get("siniestro_id")
        logger.info(f"[validate_documents] Validating documents for: {siniestro_id}")
        
        try:
            tipo_siniestro = state.get("tipo_siniestro", "otros")
            subtipo = state.get("clasificacion", {}).get("subtipo", "general")
            
            required_docs = self.docs_agent.required_docs.get(tipo_siniestro, {}).get(subtipo, [])
            documentos_requeridos = required_docs[:3]
            
            state.update({
                "documentos_requeridos": documentos_requeridos,
                "documentos_validados": len(documentos_requeridos) == 0,
            })
            
            if documentos_requeridos:
                state["estado"] = SiniestroState.DOCUMENTS_PENDING.value
            else:
                state["estado"] = SiniestroState.DOCUMENTS_RECEIVED.value
            
            state["timeline"].append({
                "timestamp": datetime.utcnow().isoformat(),
                "evento": "Documentación validada" if not documentos_requeridos else "Documentación pendiente",
                "detalles": {"documentos_requeridos": documentos_requeridos},
            })
            
            logger.info(f"[validate_documents] Required docs: {documentos_requeridos}")
        except Exception as e:
            logger.error(f"[validate_documents] Error: {e}")
            state["error"] = str(e)
        
        self.flow_states[siniestro_id]["current_node"] = "validate_documents"
        return state

    async def _node_assign_resources(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Node 4: Assign gestor and perito."""
        siniestro_id = state.get("siniestro_id")
        logger.info(f"[assign_resources] Assigning resources for: {siniestro_id}")
        
        try:
            result = await self.assignment_agent.process_with_logging(
                input_data={
                    "tipo_siniestro": state.get("tipo_siniestro", "otros"),
                    "subtipo": state.get("clasificacion", {}).get("subtipo", "general"),
                    "urgencia": state.get("urgencia", "normal"),
                    "ubicacion": state.get("cliente_data", {}).get("ubicacion", "Madrid"),
                },
                siniestro_id=siniestro_id,
                action_name="assignment",
                db_session=self.db_session,
            )
            
            state.update({
                "asignaciones": result,
                "gestor": result.get("gestor", {}),
                "perito": result.get("perito", {}),
                "estado": SiniestroState.ASSIGNED.value,
            })
            
            state["timeline"].append({
                "timestamp": datetime.utcnow().isoformat(),
                "evento": "Recursos asignados",
                "detalles": {
                    "gestor": state.get("gestor", {}).get("nombre"),
                    "perito": state.get("perito", {}).get("nombre"),
                },
            })
            
            logger.info(f"[assign_resources] Assigned to {state.get('gestor', {}).get('nombre')}")
        except Exception as e:
            logger.error(f"[assign_resources] Error: {e}")
            state["error"] = str(e)
        
        self.flow_states[siniestro_id]["current_node"] = "assign_resources"
        return state

    async def _node_notify_client(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Node 5: Notify client via appropriate channel."""
        siniestro_id = state.get("siniestro_id")
        logger.info(f"[notify_client] Notifying client for: {siniestro_id}")
        
        try:
            canal = state.get("canal", "app")
            respuesta = self._generate_channel_response(
                canal=canal,
                siniestro_id=siniestro_id,
                tipo_siniestro=state.get("tipo_siniestro", "otros"),
                urgencia=state.get("urgencia", "normal"),
                gestor_nombre=state.get("gestor", {}).get("nombre", "nuestro gestor"),
                documentos_requeridos=state.get("documentos_requeridos", []),
            )
            
            state.update({
                "cliente_notificado": True,
                "canal_respuesta": respuesta,
            })
            
            state["timeline"].append({
                "timestamp": datetime.utcnow().isoformat(),
                "evento": "Cliente notificado",
                "detalles": {"canal": canal, "respuesta_enviada": True},
            })
            
            logger.info(f"[notify_client] Client notified via {canal}")
        except Exception as e:
            logger.error(f"[notify_client] Error: {e}")
            state["error"] = str(e)
        
        self.flow_states[siniestro_id]["current_node"] = "notify_client"
        return state

    def _route_decision(self, state: Dict[str, Any]) -> str:
        """Decision function: Route to appropriate processing path."""
        fraud_prob = state.get("fraud_probability", 0.0)
        urgencia = state.get("urgencia", "media")
        
        if fraud_prob > 0.5:
            logger.info(f"[review_decision] High fraud probability ({fraud_prob}) -> manual_review")
            state["route_decision"] = "manual_review"
            return "manual_review"
        elif urgencia == "critica":
            logger.info(f"[review_decision] Critical urgency -> priority_processing")
            state["route_decision"] = "priority_processing"
            return "priority_processing"
        else:
            logger.info(f"[review_decision] Normal -> auto_process")
            state["route_decision"] = "auto_process"
            return "auto_process"

    async def _node_review_decision(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Node 6: Decision node for routing."""
        siniestro_id = state.get("siniestro_id")
        logger.info(f"[review_decision] Making routing decision for: {siniestro_id}")
        
        state["timeline"].append({
            "timestamp": datetime.utcnow().isoformat(),
            "evento": "Revisión de decisión",
            "detalles": {
                "fraud_prob": state.get("fraud_probability"),
                "urgencia": state.get("urgencia"),
            },
        })
        
        self.flow_states[siniestro_id]["current_node"] = "review_decision"
        return state

    async def _node_manual_review(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Node 7: Manual review for high-risk claims."""
        siniestro_id = state.get("siniestro_id")
        logger.info(f"[manual_review] Flagging for manual review: {siniestro_id}")
        
        state.update({
            "estado": SiniestroState.ESCALATED.value,
            "resultado": {"route": "manual_review", "status": "awaiting_gestor_review"},
        })
        
        state["timeline"].append({
            "timestamp": datetime.utcnow().isoformat(),
            "evento": "Escalado a revisión manual",
            "detalles": {"razon": "Sospecha de fraude"},
        })
        
        self.flow_states[siniestro_id]["current_node"] = "manual_review"
        return state

    async def _node_priority_processing(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Node 8: Priority/fast-track processing."""
        siniestro_id = state.get("siniestro_id")
        logger.info(f"[priority_processing] Fast-tracking critical claim: {siniestro_id}")
        
        state.update({
            "estado": SiniestroState.IN_PROCESS.value,
            "resultado": {"route": "priority_processing", "status": "processing", "priority": "high"},
        })
        
        state["timeline"].append({
            "timestamp": datetime.utcnow().isoformat(),
            "evento": "Procesamiento prioritario activado",
            "detalles": {"prioridad": "alta", "urgencia": "critica"},
        })
        
        self.flow_states[siniestro_id]["current_node"] = "priority_processing"
        return state

    async def _node_auto_process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Node 9: Automatic processing."""
        siniestro_id = state.get("siniestro_id")
        logger.info(f"[auto_process] Processing claim automatically: {siniestro_id}")
        
        state.update({
            "estado": SiniestroState.IN_PROCESS.value,
            "resultado": {"route": "auto_process", "status": "processing", "automatic": True},
        })
        
        state["timeline"].append({
            "timestamp": datetime.utcnow().isoformat(),
            "evento": "Procesamiento automático iniciado",
            "detalles": {"automatico": True},
        })
        
        self.flow_states[siniestro_id]["current_node"] = "auto_process"
        return state

    async def _node_complete(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Node 10: Complete the flow."""
        siniestro_id = state.get("siniestro_id")
        logger.info(f"[complete] Finalizing claim: {siniestro_id}")
        
        state.update({
            "estado": SiniestroState.CLOSED.value if state.get("route_decision") == "auto_process" else state.get("estado"),
        })
        
        state["timeline"].append({
            "timestamp": datetime.utcnow().isoformat(),
            "evento": "Flujo completado",
            "detalles": {"resultado": state.get("resultado")},
        })
        
        self.siniestros[siniestro_id] = state.copy()
        self.flow_states[siniestro_id]["current_node"] = "complete"
        self.flow_states[siniestro_id]["status"] = "completed"
        
        logger.info(f"[complete] Claim processing completed: {siniestro_id}")
        return state

    def _generate_channel_response(
        self,
        canal: str,
        siniestro_id: str,
        tipo_siniestro: str,
        urgencia: str,
        gestor_nombre: str,
        documentos_requeridos: List[str],
    ) -> str:
        """Generate an appropriate response based on communication channel."""
        if canal == Canal.PHONE.value:
            msg = f"Hemos registrado tu siniestro {siniestro_id}. {gestor_nombre} se pondrá en contacto contigo pronto."
        elif canal == Canal.WHATSAPP.value:
            msg = f"✅ Siniestro registrado: {siniestro_id}\n"
            msg += f"📋 Tipo: {tipo_siniestro}\n"
            msg += f"⚡ Urgencia: {urgencia}\n"
            if documentos_requeridos:
                msg += f"📄 Necesitamos: {', '.join(documentos_requeridos[:2])}\n"
            msg += f"\n👤 {gestor_nombre} se contactará pronto."
        elif canal == Canal.EMAIL.value:
            msg = (
                f"Estimado cliente,\n\n"
                f"Hemos recibido su reclamación: {siniestro_id}\n"
                f"Tipo: {tipo_siniestro}\n"
                f"Urgencia: {urgencia}\n\n"
                f"Su gestor asignado, {gestor_nombre}, le contactará pronto.\n\n"
                f"Saludos,\nSegurCaixa Adeslas"
            )
        else:  # APP
            msg = (
                f"Tu siniestro {siniestro_id} ha sido registrado y clasificado. "
                f"Gestor asignado: {gestor_nombre}."
            )

        return msg

    async def process_siniestro(self, siniestro_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a siniestro through the complete flow.
        
        Args:
            siniestro_data: Dictionary with siniestro information
            
        Returns:
            Final siniestro state after flow completion
        """
        try:
            # Initialize state
            initial_state = {
                "siniestro_id": siniestro_data.get("siniestro_id"),
                "canal": siniestro_data.get("canal", "app"),
                "cliente_data": siniestro_data.get("cliente_data", {}),
                "descripcion": siniestro_data.get("descripcion", ""),
                "timeline": [],
                "estado": SiniestroState.REPORTED.value,
            }
            
            # Run the flow
            final_state = await self.flow.invoke(initial_state)
            
            return {
                "status": "success",
                "siniestro_id": final_state.get("siniestro_id"),
                "estado": final_state.get("estado"),
                "resultado": final_state.get("resultado"),
                "timeline": final_state.get("timeline"),
                "error": final_state.get("error"),
            }
        except Exception as e:
            logger.error(f"Error processing siniestro: {e}")
            return {
                "status": "error",
                "error": str(e),
            }

    def get_flow_status(self, siniestro_id: str) -> Dict[str, Any]:
        """
        Get the flow status of a siniestro.
        
        Args:
            siniestro_id: ID of the siniestro
            
        Returns:
            Flow status information
        """
        if siniestro_id not in self.flow_states:
            return {
                "status": "error",
                "error": f"Siniestro not found: {siniestro_id}",
            }
        
        flow_info = self.flow_states[siniestro_id]
        siniestro = self.siniestros.get(siniestro_id, {})
        
        return {
            "status": "success",
            "siniestro_id": siniestro_id,
            "current_node": flow_info.get("current_node"),
            "flow_status": flow_info.get("status"),
            "siniestro_state": siniestro.get("estado"),
            "timeline": siniestro.get("timeline", []),
            "resultado": siniestro.get("resultado"),
        }

    def get_flow_definition(self) -> Dict[str, Any]:
        """Get the complete flow definition."""
        return self.flow.get_definition()

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a request through the orchestrator.

        Args:
            input_data: Dictionary containing:
                - operation (str): 'new_siniestro', 'update_siniestro', 'query', etc.
                - data (dict): Operation-specific data

        Returns:
            Processing results
        """
        operation = input_data.get("operation", "unknown")
        data = input_data.get("data", {})

        if operation == "new_siniestro":
            return await self.process_siniestro(data)
        elif operation == "get_flow_status":
            return self.get_flow_status(data.get("siniestro_id"))
        elif operation == "get_flow_definition":
            return {"status": "success", "flow": self.get_flow_definition()}
        elif operation == "agent_status":
            return await self.get_agent_status()
        else:
            return {
                "status": "error",
                "error": f"Unknown operation: {operation}",
            }

    async def get_agent_status(self) -> Dict[str, Any]:
        """Get the status of all agents in the system."""
        return await self.registry.get_agent_status()
