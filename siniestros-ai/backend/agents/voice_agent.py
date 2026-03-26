"""
Voice agent for the SegurCaixa Adeslas claims management system.

This module handles phone call simulations, voice transcription processing,
and text-to-speech preparation (ready for ElevenLabs integration).
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from enum import Enum

from .base import BaseAgent
from backend.services.llm_service import get_llm_service

logger = logging.getLogger(__name__)


class CallStatus(str, Enum):
    """Status of a phone call."""
    INITIATED = "initiated"
    IN_PROGRESS = "in_progress"
    TRANSFERRED = "transferred"
    ENDED = "ended"
    FAILED = "failed"


class Intent(str, Enum):
    """Intent types detected in voice calls."""
    REPORT_CLAIM = "report_claim"
    CLAIM_STATUS = "claim_status"
    DOCUMENT_REQUEST = "document_request"
    APPOINTMENT = "appointment"
    GENERAL_INFO = "general_info"
    ESCALATION = "escalation"
    UNKNOWN = "unknown"


class VoiceAgent(BaseAgent):
    """
    Agent responsible for handling voice communications (phone calls).

    This agent:
    - Processes transcribed audio
    - Extracts intent and entities
    - Generates appropriate responses
    - Simulates voice conversations
    - Prepares text for TTS (ElevenLabs ready)
    """

    def __init__(self) -> None:
        """Initialize the voice agent."""
        super().__init__(
            agent_id="voice_agent",
            agent_name="Sara",
            agent_role="Agente de voz para llamadas telefónicas",
            color="#3498db",  # Blue
            icon="phone",
            version="1.0.0",
            model_type="rule-based",
        )

        # Conversation templates
        self.templates = {
            "greeting": "Hola, bienvenido a SegurCaixa Adeslas. Soy Sara. ¿Cómo puedo ayudarte hoy?",
            "claim_intake_start": "Entendido que deseas reportar un siniestro. Te ayudaré a través de este proceso. Primero, ¿cuál es el tipo de siniestro que reportas?",
            "claim_intake_location": "¿En qué ubicación ocurrió el siniestro?",
            "claim_intake_description": "Cuéntame con detalle qué sucedió.",
            "claim_intake_documents": "¿Tienes documentos o fotos del siniestro?",
            "claim_status_intro": "De acuerdo. Voy a buscar tu siniestro. Por favor, proporciona el número de tu reclamación.",
            "appointment_intro": "Entendido. Puedo ayudarte a agendar una cita con nuestro gestor. ¿Cuál es tu disponibilidad?",
            "escalation": "Veo que necesitas hablar con un especialista. Te transferiré con nuestro equipo de atención especializada.",
            "document_request": "Para procesar tu reclamación, necesitaré que cargues algunos documentos. ¿Puedes compartir fotos o documentos del siniestro?",
            "closing_success": "Gracias por confiar en SegurCaixa Adeslas. Tu reclamación ha sido registrada. Nuestro gestor se contactará contigo pronto.",
            "closing_escalation": "Te hemos transferido con nuestro equipo especializado. Gracias por tu paciencia.",
        }

        # Intent keywords
        self.intent_keywords = {
            Intent.REPORT_CLAIM: [
                "reportar",
                "siniestro",
                "reclamo",
                "reclamación",
                "accidente",
                "daño",
                "problema",
                "ocurrió",
                "sucedió",
            ],
            Intent.CLAIM_STATUS: [
                "estado",
                "estatus",
                "progreso",
                "avance",
                "dónde está",
                "cuándo",
                "información",
                "sobre mi",
            ],
            Intent.DOCUMENT_REQUEST: [
                "documento",
                "foto",
                "imagen",
                "archivo",
                "compartir",
                "adjuntar",
                "enviar",
                "subir",
            ],
            Intent.APPOINTMENT: [
                "cita",
                "reunión",
                "agendar",
                "agendar",
                "programar",
                "horario",
                "disponible",
            ],
            Intent.ESCALATION: [
                "supervisor",
                "especialista",
                "experto",
                "gerente",
                "hablar con",
                "quiero",
                "necesito",
                "insisto",
            ],
        }

        # Entity extraction patterns
        self.entity_patterns = {
            "phone": r"\d{9,}",
            "email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
            "claim_id": r"[A-Z]{2}\d{8}",
            "date": r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}",
        }

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a voice call transcription.

        Args:
            input_data: Dictionary containing:
                - audio_text (str): Transcribed audio content
                - cliente_id (str, optional): Client ID
                - call_id (str, optional): Call ID
                - context (dict, optional): Previous conversation context

        Returns:
            Dictionary with processing results
        """
        audio_text = input_data.get("audio_text", "")
        cliente_id = input_data.get("cliente_id", "unknown")
        call_id = input_data.get("call_id")
        context = input_data.get("context", {})

        result = await self.process_call(audio_text, cliente_id, context)
        result["call_id"] = call_id
        return result

    async def process_call(
        self,
        audio_text: str,
        cliente_id: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Process a phone call transcription.

        Args:
            audio_text: Transcribed call content
            cliente_id: Client ID
            context: Optional previous conversation context

        Returns:
            Dictionary with call processing results
        """
        if not audio_text:
            return {
                "status": "error",
                "error": "Empty audio transcription",
            }

        context = context or {}
        audio_lower = audio_text.lower()

        # Extract intent
        intent = await self._extract_intent(audio_lower)

        # Extract entities
        entities = await self._extract_entities(audio_text)

        # Generate response
        response = await self.generate_response(
            {
                "intent": intent,
                "entities": entities,
                "cliente_id": cliente_id,
                "context": context,
                "original_text": audio_text,
            }
        )

        return {
            "status": "success",
            "cliente_id": cliente_id,
            "input_text": audio_text,
            "intent": intent,
            "entities": entities,
            "response": response,
            "response_tts_ready": True,
            "timestamp": datetime.utcnow().isoformat(),
        }

    # ── System prompt for voice LLM ──
    VOICE_SYSTEM_PROMPT = """Eres Sara, la agente telefónica de SegurCaixa Adeslas.
Estás atendiendo una llamada telefónica de un cliente.

REGLAS CRÍTICAS:
- Habla SIEMPRE en español de España
- Sé natural, profesional y cálida — como una persona real al teléfono
- Usa frases cortas y claras (máximo 2-3 frases por respuesta)
- NO uses emojis ni formato — esto se va a leer en voz alta por TTS
- NO uses asteriscos, negritas ni viñetas
- Si el cliente reporta un siniestro, recoge tipo, descripción, fecha y ubicación
- Si pregunta por estado, pide el número de referencia
- Si está frustrado, muestra empatía y ofrece transferir a un especialista
- Responde como si estuvieras hablando por teléfono, con naturalidad

Intent detectado: {intent}
Entidades extraídas: {entities}"""

    async def generate_response(
        self, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a voice response using LLM (Ollama on-premise)
        with fallback to templates.

        Args:
            context: Call context dict

        Returns:
            Dictionary with response data (ready for TTS)
        """
        intent = context.get("intent", Intent.UNKNOWN.value)
        entities = context.get("entities", {})
        original_text = context.get("original_text", "")

        # ── Try LLM first ──
        llm_text = await self._generate_voice_llm(
            original_text, intent, entities
        )

        if llm_text:
            next_action = self._get_next_action(intent)
            suggestions = self._get_suggestions(intent)

            return {
                "text": llm_text,
                "next_action": next_action,
                "suggestions": suggestions,
                "entities": entities,
                "tts_ready": True,
                "language": "es-ES",
                "voice": "Sara",
                "speed": 1.0,
                "emotion": "professional",
                "llm_powered": True,
            }

        # ── Fallback: templates ──
        logger.info("Using template fallback for voice response")
        response_text = ""
        next_action = ""
        suggestions = []

        if intent == Intent.REPORT_CLAIM.value:
            response_text = self.templates["claim_intake_start"]
            next_action = "collect_claim_type"
            suggestions = ["Hogar", "Auto", "Salud"]

        elif intent == Intent.CLAIM_STATUS.value:
            response_text = self.templates["claim_status_intro"]
            next_action = "request_claim_id"

        elif intent == Intent.DOCUMENT_REQUEST.value:
            response_text = self.templates["document_request"]
            next_action = "wait_for_documents"
            suggestions = ["Enviar fotos", "Subir documentos", "Continuar después"]

        elif intent == Intent.APPOINTMENT.value:
            response_text = self.templates["appointment_intro"]
            next_action = "collect_availability"
            suggestions = ["Hoy", "Mañana", "Próxima semana"]

        elif intent == Intent.ESCALATION.value:
            response_text = self.templates["escalation"]
            next_action = "escalate_to_specialist"

        else:
            response_text = "Perdona, no entendí bien. ¿Podrías repetir por favor?"
            next_action = "repeat_request"
            suggestions = [
                "Reportar siniestro",
                "Estado de reclamación",
                "Hablar con especialista",
            ]

        return {
            "text": response_text,
            "next_action": next_action,
            "suggestions": suggestions,
            "entities": entities,
            "tts_ready": True,
            "language": "es-ES",
            "voice": "Sara",
            "speed": 1.0,
            "emotion": "professional",
            "llm_powered": False,
        }

    async def _generate_voice_llm(
        self, original_text: str, intent: str, entities: Dict
    ) -> Optional[str]:
        """
        Generate voice response via local LLM.

        Returns response text or None.
        """
        try:
            llm = get_llm_service()

            system_prompt = self.VOICE_SYSTEM_PROMPT.format(
                intent=intent,
                entities=entities,
            )

            result = await llm.chat(
                messages=[{"role": "user", "content": original_text}],
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=256,  # Keep voice responses short
            )

            if result["success"] and result["content"]:
                logger.info(f"Voice LLM response generated ({result['tokens_used']} tokens)")
                return result["content"]

            return None

        except Exception as e:
            logger.warning(f"Voice LLM failed: {e}")
            return None

    def _get_next_action(self, intent: str) -> str:
        """Map intent to next action."""
        return {
            Intent.REPORT_CLAIM.value: "collect_claim_type",
            Intent.CLAIM_STATUS.value: "request_claim_id",
            Intent.DOCUMENT_REQUEST.value: "wait_for_documents",
            Intent.APPOINTMENT.value: "collect_availability",
            Intent.ESCALATION.value: "escalate_to_specialist",
        }.get(intent, "repeat_request")

    def _get_suggestions(self, intent: str) -> List[str]:
        """Map intent to suggested actions."""
        return {
            Intent.REPORT_CLAIM.value: ["Hogar", "Auto", "Salud"],
            Intent.DOCUMENT_REQUEST.value: ["Enviar fotos", "Subir documentos"],
            Intent.APPOINTMENT.value: ["Hoy", "Mañana", "Próxima semana"],
            Intent.UNKNOWN.value: ["Reportar siniestro", "Estado de reclamación", "Hablar con especialista"],
        }.get(intent, [])

    async def _extract_intent(self, audio_lower: str) -> str:
        """
        Extract intent from transcribed audio.

        Args:
            audio_lower: Lowercase transcription

        Returns:
            Intent type
        """
        # Score each intent based on keyword matches
        intent_scores = {}

        for intent, keywords in self.intent_keywords.items():
            score = sum(1 for keyword in keywords if keyword in audio_lower)
            if score > 0:
                intent_scores[intent] = score

        # Return highest scoring intent
        if intent_scores:
            best_intent = max(intent_scores, key=intent_scores.get)
            return best_intent.value

        return Intent.UNKNOWN.value

    async def _extract_entities(self, audio_text: str) -> Dict[str, Any]:
        """
        Extract entities from transcribed audio.

        Args:
            audio_text: Transcription text

        Returns:
            Dictionary of extracted entities
        """
        import re

        entities = {}

        # Extract phone number
        phone_match = re.search(self.entity_patterns["phone"], audio_text)
        if phone_match:
            entities["phone"] = phone_match.group()

        # Extract email
        email_match = re.search(self.entity_patterns["email"], audio_text)
        if email_match:
            entities["email"] = email_match.group()

        # Extract claim ID
        claim_match = re.search(self.entity_patterns["claim_id"], audio_text)
        if claim_match:
            entities["claim_id"] = claim_match.group()

        # Extract date
        date_match = re.search(self.entity_patterns["date"], audio_text)
        if date_match:
            entities["date"] = date_match.group()

        # Extract claim type if mentioned
        claim_types = ["hogar", "auto", "salud", "viaje"]
        for claim_type in claim_types:
            if claim_type in audio_text.lower():
                entities["claim_type"] = claim_type
                break

        return entities

    async def get_conversation_template(self, template_key: str) -> str:
        """
        Get a conversation template.

        Args:
            template_key: Key of the template

        Returns:
            Template text
        """
        return self.templates.get(template_key, "")

    async def simulate_voice_call(
        self,
        messages: List[Dict[str, str]],
        cliente_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Simulate a complete voice call conversation.

        Args:
            messages: List of messages with 'role' and 'content'
            cliente_id: Client ID

        Returns:
            List of processed messages with responses
        """
        results = []
        context = {}

        for message in messages:
            if message["role"] == "user":
                call_result = await self.process_call(
                    message["content"],
                    cliente_id,
                    context,
                )
                results.append(
                    {
                        "role": "user",
                        "content": message["content"],
                        "processing": call_result,
                    }
                )
                # Update context for next iteration
                context = call_result.get("response", {})

            elif message["role"] == "assistant":
                results.append(
                    {
                        "role": "assistant",
                        "content": message["content"],
                    }
                )

        return results
