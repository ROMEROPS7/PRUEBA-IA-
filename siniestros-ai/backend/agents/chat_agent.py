"""
Chat agent for the SegurCaixa Adeslas claims management system.

This module handles WhatsApp and Email communications with clients,
managing conversation state and requesting documents.
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from enum import Enum

from .base import BaseAgent
from backend.services.llm_service import get_llm_service

logger = logging.getLogger(__name__)


class Channel(str, Enum):
    """Communication channels."""
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    SMS = "sms"
    WEB_CHAT = "web_chat"


class ConversationState(str, Enum):
    """States of a chat conversation."""
    INITIATED = "initiated"
    GATHERING_INFO = "gathering_info"
    AWAITING_DOCUMENTS = "awaiting_documents"
    PROCESSING = "processing"
    COMPLETED = "completed"
    ESCALATED = "escalated"


class ChatAgent(BaseAgent):
    """
    Agent responsible for chat communications (WhatsApp, Email, SMS).

    This agent:
    - Processes text messages from multiple channels
    - Manages conversation state
    - Requests documents from clients
    - Provides professional, warm responses in Spanish
    - Handles document attachments
    """

    def __init__(self) -> None:
        """Initialize the chat agent."""
        super().__init__(
            agent_id="chat_agent",
            agent_name="Asistente SegurCaixa",
            agent_role="Agente de chat para WhatsApp, Email y SMS",
            color="#27ae60",  # Green
            icon="message-square",
            version="1.0.0",
            model_type="rule-based",
        )

        # Response templates
        self.templates = {
            "greeting_whatsapp": "¡Hola! 👋 Bienvenido a SegurCaixa Adeslas. Estamos aquí para ayudarte con tu siniestro. ¿Cómo podemos asistirte?",
            "greeting_email": "Estimado cliente,\n\nGracias por contactarnos. Somos SegurCaixa Adeslas y estamos aquí para ayudarte con tu reclamación.",
            "claim_intake_question": "Entendemos que deseas reportar un siniestro. Para ayudarte mejor, por favor cuéntanos:",
            "request_description": "¿Podrías describir con detalle qué sucedió?",
            "request_documents": "Para procesar tu reclamación, necesitamos documentos. ¿Puedes compartir fotos del daño y cualquier comprobante relevante?",
            "document_received": "✅ Hemos recibido tus documentos. Gracias.",
            "processing_info": "Estamos procesando tu información. Un gestor se pondrá en contacto contigo pronto.",
            "gesture_empathy": "Entendemos lo difícil que puede ser esta situación. Estamos aquí para ayudarte.",
            "follow_up": "¿Hay algo más en lo que podamos asistirte?",
            "closing": "Gracias por confiar en SegurCaixa Adeslas. ¡Que tengas un excelente día!",
            "escalation": "Tu caso requiere atención especializada. Transferimos con nuestro equipo experto.",
        }

        # Document request templates by channel
        self.document_request_templates = {
            Channel.WHATSAPP.value: {
                "intro": "📄 Necesitamos algunos documentos para tu reclamación:",
                "item_format": "• {tipo_doc}",
                "closing": "¿Puedes compartir estos documentos conmigo?",
            },
            Channel.EMAIL.value: {
                "intro": "Adjuntos encontrará una lista de documentos necesarios para procesar su reclamación:",
                "item_format": "- {tipo_doc}",
                "closing": "Por favor, envíe estos documentos como respuesta a este correo.",
            },
            Channel.SMS.value: {
                "intro": "Necesitamos: ",
                "item_format": "{tipo_doc}, ",
                "closing": "Puedes enviarlos por WhatsApp.",
            },
        }

        # Conversation state data structure
        self.conversations = {}

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a chat message.

        Args:
            input_data: Dictionary containing:
                - message (str): The message content
                - canal (str): Channel (whatsapp, email, sms, web_chat)
                - cliente_id (str): Client ID
                - conversation_id (str, optional): Conversation ID
                - attachments (list, optional): List of attached files

        Returns:
            Dictionary with processing results
        """
        message = input_data.get("message", "")
        canal = input_data.get("canal", "web_chat")
        cliente_id = input_data.get("cliente_id", "unknown")
        conversation_id = input_data.get("conversation_id")
        attachments = input_data.get("attachments", [])

        result = await self.process_message(
            message=message,
            canal=canal,
            cliente_id=cliente_id,
            conversation_id=conversation_id,
            attachments=attachments,
        )

        return result

    async def process_message(
        self,
        message: str,
        canal: str,
        cliente_id: str = "unknown",
        conversation_id: Optional[str] = None,
        attachments: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Process a chat message from a client.

        Args:
            message: Message content
            canal: Communication channel
            cliente_id: Client ID
            conversation_id: Optional conversation ID
            attachments: Optional list of attached file paths

        Returns:
            Processing results
        """
        if not message:
            return {
                "status": "error",
                "error": "Empty message",
            }

        # Ensure conversation exists
        if not conversation_id:
            conversation_id = f"{cliente_id}_{datetime.utcnow().timestamp()}"

        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = {
                "cliente_id": cliente_id,
                "canal": canal,
                "state": ConversationState.INITIATED.value,
                "messages": [],
                "documents": [],
                "created_at": datetime.utcnow().isoformat(),
            }

        # Process attachments
        document_info = []
        if attachments:
            for attachment in attachments:
                doc_info = await self._process_attachment(attachment)
                document_info.append(doc_info)
                self.conversations[conversation_id]["documents"].append(
                    doc_info
                )

        # Analyze message and generate response
        message_analysis = await self._analyze_message(
            message, canal, cliente_id
        )
        response = await self.generate_response(
            {
                "message": message,
                "canal": canal,
                "cliente_id": cliente_id,
                "conversation_id": conversation_id,
                "analysis": message_analysis,
                "attachments_count": len(attachments or []),
            }
        )

        # Update conversation
        self.conversations[conversation_id]["messages"].append(
            {
                "role": "user",
                "content": message,
                "timestamp": datetime.utcnow().isoformat(),
                "attachments": attachments,
            }
        )
        self.conversations[conversation_id]["messages"].append(
            {
                "role": "assistant",
                "content": response["text"],
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
        self.conversations[conversation_id]["state"] = response.get(
            "next_state", self.conversations[conversation_id]["state"]
        )

        return {
            "status": "success",
            "conversation_id": conversation_id,
            "cliente_id": cliente_id,
            "canal": canal,
            "message_received": message,
            "documents_processed": len(document_info),
            "response": response,
            "timestamp": datetime.utcnow().isoformat(),
        }

    # ── System prompt for LLM ──────────────────────────────────────────────
    SYSTEM_PROMPT = """Eres el asistente virtual de SegurCaixa Adeslas, la compañía aseguradora.
Tu nombre es Asistente SegurCaixa. Tu rol es atender a clientes que necesitan ayuda con siniestros.

REGLAS IMPORTANTES:
- Responde SIEMPRE en español de España
- Sé profesional, cálido y empático
- No inventes datos de pólizas ni números de siniestro
- Si el cliente reporta un siniestro, recoge: tipo (hogar/auto/salud), descripción detallada, fecha y ubicación
- Si el cliente pregunta por el estado de un siniestro, pide su número de referencia
- Si el cliente está frustrado, muestra empatía y ofrece escalar a un especialista
- Mantén las respuestas concisas (máximo 3-4 frases)
- NUNCA compartas información personal de otros clientes
- NUNCA proporciones asesoramiento legal o médico

CANAL: {canal}
CONTEXTO: Intent detectado = {intent}, Sentimiento = {sentiment}
{conversation_context}"""

    async def generate_response(
        self, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate an appropriate response using LLM (Ollama on-premise)
        with fallback to rule-based templates.

        Args:
            context: Dictionary containing message, canal, analysis, etc.

        Returns:
            Response data
        """
        canal = context.get("canal", "web_chat")
        message = context.get("message", "").lower()
        analysis = context.get("analysis", {})
        conversation_id = context.get("conversation_id")
        attachments_count = context.get("attachments_count", 0)

        intent = analysis.get("intent", "unknown")
        sentiment = analysis.get("sentiment", "neutral")
        requires_docs = analysis.get("requires_documents", False)

        # ── Try LLM first ──
        llm = get_llm_service()
        llm_response = await self._generate_llm_response(
            message=context.get("message", ""),
            canal=canal,
            intent=intent,
            sentiment=sentiment,
            conversation_id=conversation_id,
        )

        if llm_response:
            # LLM succeeded — use its response
            next_state = self._determine_next_state(intent, attachments_count, requires_docs, sentiment)
            suggested_actions = self._get_suggested_actions(intent)

            return {
                "text": llm_response,
                "canal": canal,
                "intent": intent,
                "next_state": next_state,
                "suggested_actions": suggested_actions,
                "requires_tts": False,
                "llm_powered": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

        # ── Fallback: rule-based templates ──
        logger.info("Using rule-based fallback for chat response")
        response_text = ""
        next_state = ConversationState.GATHERING_INFO.value
        suggested_actions = []

        if intent == "greeting":
            if canal == Channel.WHATSAPP.value:
                response_text = self.templates["greeting_whatsapp"]
            elif canal == Channel.EMAIL.value:
                response_text = self.templates["greeting_email"]
            else:
                response_text = self.templates["greeting_whatsapp"]
            suggested_actions = [
                "Reportar siniestro",
                "Consultar estado",
                "Solicitar información",
            ]

        elif intent == "report_claim":
            response_text = (
                self.templates["claim_intake_question"]
                + "\n\n"
                + self.templates["request_description"]
            )
            next_state = ConversationState.GATHERING_INFO.value
            suggested_actions = ["Enviar descripción detallada"]

        elif intent == "claim_status":
            response_text = "Para consultar el estado de tu reclamación, necesito tu número de siniestro. ¿Cuál es?"
            next_state = ConversationState.GATHERING_INFO.value
            suggested_actions = ["Proporcionar número de siniestro"]

        elif intent == "document_upload":
            if attachments_count > 0:
                response_text = (
                    self.templates["document_received"]
                    + "\n"
                    + self.templates["processing_info"]
                )
                next_state = ConversationState.PROCESSING.value
            else:
                response_text = "Entendido que deseas enviar documentos. Por favor, adjunta los archivos a este mensaje."
                next_state = ConversationState.AWAITING_DOCUMENTS.value

        elif requires_docs:
            response_text = await self._build_document_request(
                "siniestro", canal
            )
            next_state = ConversationState.AWAITING_DOCUMENTS.value

        elif sentiment == "negative" or "escalación" in intent:
            response_text = (
                self.templates["gesture_empathy"]
                + "\n"
                + self.templates["escalation"]
            )
            next_state = ConversationState.ESCALATED.value
            suggested_actions = ["Conectar con especialista"]

        else:
            response_text = (
                self.templates["follow_up"]
                if intent == "follow_up"
                else f"Entiendo. {self.templates['processing_info']}"
            )

        return {
            "text": response_text,
            "canal": canal,
            "intent": intent,
            "next_state": next_state,
            "suggested_actions": suggested_actions,
            "requires_tts": False,
            "llm_powered": False,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def _generate_llm_response(
        self,
        message: str,
        canal: str,
        intent: str,
        sentiment: str,
        conversation_id: Optional[str] = None,
    ) -> Optional[str]:
        """
        Generate a response using the local LLM (Ollama).

        Returns the generated text, or None if LLM is unavailable.
        """
        try:
            llm = get_llm_service()

            # Build conversation context from history
            conversation_context = ""
            if conversation_id and conversation_id in self.conversations:
                conv = self.conversations[conversation_id]
                recent = conv.get("messages", [])[-6:]  # Last 6 messages
                if recent:
                    conversation_context = "Historial reciente:\n"
                    for msg in recent:
                        role = "Cliente" if msg["role"] == "user" else "Asistente"
                        conversation_context += f"  {role}: {msg['content'][:200]}\n"

            system_prompt = self.SYSTEM_PROMPT.format(
                canal=canal,
                intent=intent,
                sentiment=sentiment,
                conversation_context=conversation_context,
            )

            result = await llm.chat(
                messages=[{"role": "user", "content": message}],
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=512,
            )

            if result["success"] and result["content"]:
                logger.info(
                    f"LLM response generated ({result['provider']}, "
                    f"{result['tokens_used']} tokens)"
                )
                return result["content"]

            return None

        except Exception as e:
            logger.warning(f"LLM generation failed: {e}")
            return None

    def _determine_next_state(
        self, intent: str, attachments_count: int,
        requires_docs: bool, sentiment: str
    ) -> str:
        """Determine next conversation state based on intent."""
        if intent == "document_upload" and attachments_count > 0:
            return ConversationState.PROCESSING.value
        if intent == "document_upload":
            return ConversationState.AWAITING_DOCUMENTS.value
        if requires_docs:
            return ConversationState.AWAITING_DOCUMENTS.value
        if sentiment == "negative" or intent == "escalation":
            return ConversationState.ESCALATED.value
        return ConversationState.GATHERING_INFO.value

    def _get_suggested_actions(self, intent: str) -> List[str]:
        """Get suggested actions based on intent."""
        actions_map = {
            "greeting": ["Reportar siniestro", "Consultar estado", "Solicitar información"],
            "report_claim": ["Enviar descripción detallada"],
            "claim_status": ["Proporcionar número de siniestro"],
            "escalation": ["Conectar con especialista"],
        }
        return actions_map.get(intent, [])

    async def request_documents(
        self,
        siniestro_id: str,
        tipo_siniestro: str,
        canal: str = "whatsapp",
        documentos_requeridos: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Request documents from client.

        Args:
            siniestro_id: Claim ID
            tipo_siniestro: Type of claim
            canal: Channel for request
            documentos_requeridos: Optional list of specific required documents

        Returns:
            Document request
        """
        if not documentos_requeridos:
            # Default required documents by type
            documentos_requeridos = {
                "hogar": [
                    "Fotos del daño",
                    "Presupuesto de reparación",
                    "Documentos de propiedad",
                ],
                "auto": [
                    "Fotos del vehículo dañado",
                    "Presupuesto del taller",
                    "Documentación del vehículo",
                ],
                "salud": [
                    "Recibos médicos",
                    "Informes hospitalarios",
                    "Prescripciones",
                ],
            }.get(tipo_siniestro, ["Fotos del daño", "Documentos relevantes"])

        request_message = await self._build_document_request(
            documentos_requeridos, canal
        )

        return {
            "siniestro_id": siniestro_id,
            "canal": canal,
            "message": request_message,
            "required_documents": documentos_requeridos,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def get_conversation(
        self, conversation_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve a conversation by ID.

        Args:
            conversation_id: ID of the conversation

        Returns:
            Conversation data or None
        """
        return self.conversations.get(conversation_id)

    async def _analyze_message(
        self, message: str, canal: str, cliente_id: str
    ) -> Dict[str, Any]:
        """
        Analyze a message to determine intent and sentiment.

        Args:
            message: Message content
            canal: Channel
            cliente_id: Client ID

        Returns:
            Analysis results
        """
        message_lower = message.lower()

        # Determine intent
        intent = "unknown"
        intent_keywords = {
            "greeting": ["hola", "buenos", "hoy", "buenos días"],
            "report_claim": [
                "siniestro",
                "reclamación",
                "reportar",
                "sucedió",
                "ocurrió",
            ],
            "claim_status": [
                "estado",
                "dónde",
                "cuándo",
                "progreso",
                "avance",
            ],
            "document_upload": ["documento", "foto", "adjunto", "archivo"],
            "escalation": [
                "especialista",
                "supervisor",
                "gerente",
                "insisto",
            ],
        }

        for potential_intent, keywords in intent_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                intent = potential_intent
                break

        # Determine sentiment
        sentiment = "neutral"
        negative_words = [
            "no",
            "mal",
            "problema",
            "error",
            "frustrado",
            "molesto",
        ]
        positive_words = ["gracias", "bien", "excelente", "rápido", "bueno"]

        neg_count = sum(1 for word in negative_words if word in message_lower)
        pos_count = sum(1 for word in positive_words if word in message_lower)

        if neg_count > pos_count:
            sentiment = "negative"
        elif pos_count > neg_count:
            sentiment = "positive"

        # Determine if documents are needed
        requires_documents = intent == "report_claim" or "documento" in message_lower

        return {
            "intent": intent,
            "sentiment": sentiment,
            "requires_documents": requires_documents,
        }

    async def _process_attachment(self, attachment_path: str) -> Dict[str, Any]:
        """
        Process an attachment.

        Args:
            attachment_path: Path to the attachment

        Returns:
            Attachment information
        """
        return {
            "path": attachment_path,
            "filename": attachment_path.split("/")[-1],
            "received_at": datetime.utcnow().isoformat(),
            "status": "received",
        }

    async def _build_document_request(
        self,
        documentos: List[str],
        canal: str,
    ) -> str:
        """
        Build a document request message.

        Args:
            documentos: List of required documents
            canal: Channel for request

        Returns:
            Formatted document request message
        """
        template = self.document_request_templates.get(
            canal,
            self.document_request_templates[Channel.WHATSAPP.value],
        )

        message = template["intro"] + "\n"
        for doc in documentos:
            message += template["item_format"].format(tipo_doc=doc) + "\n"
        message += "\n" + template["closing"]

        return message
