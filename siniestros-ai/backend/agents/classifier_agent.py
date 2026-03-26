"""
Classifier agent for the SegurCaixa Adeslas claims management system.

This module handles classification of incoming claims by type, urgency,
coverage applicability, and fraud detection.
"""

import logging
from datetime import datetime
from typing import Any, Dict, Optional
from enum import Enum

from .base import BaseAgent
from backend.services.llm_service import get_llm_service

logger = logging.getLogger(__name__)


class ClaimType(str, Enum):
    """Types of insurance claims."""
    HOGAR = "hogar"  # Home insurance
    AUTO = "auto"  # Auto insurance
    SALUD = "salud"  # Health insurance
    VIAJE = "viaje"  # Travel insurance
    OTROS = "otros"  # Other


class ClaimSubtype(str, Enum):
    """Subtypes of claims."""
    # Hogar subtypes
    AGUA = "agua"
    INCENDIO = "incendio"
    ROBO = "robo"
    CRISTALES = "cristales"
    TEMPORAL = "temporal"
    OTRO_HOGAR = "otro"

    # Auto subtypes
    COLISION = "colision"
    VANDALISMO = "vandalismo"
    INCENDIO_AUTO = "incendio"
    ROBO_AUTO = "robo"
    TERCEROS = "terceros"
    OTRO_AUTO = "otro"

    # Salud subtypes
    HOSPITALIZACION = "hospitalizacion"
    URGENCIA = "urgencia"
    CONSULTA = "consulta"
    DIAGNOSTICO = "diagnostico"
    OTRO_SALUD = "otro"

    # Viaje subtypes
    CANCELACION = "cancelacion"
    RETRASO = "retraso"
    EQUIPAJE = "equipaje"
    ASISTENCIA = "asistencia"
    OTRO_VIAJE = "otro"


class Urgency(str, Enum):
    """Urgency levels for claims."""
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"
    CRITICA = "critica"


class ClassifierAgent(BaseAgent):
    """
    Agent responsible for classifying incoming claims.

    This agent analyzes claim descriptions and metadata to determine:
    - Claim type and subtype
    - Urgency level
    - Coverage applicability
    - Fraud probability
    - Cost estimation range
    """

    def __init__(self) -> None:
        """Initialize the classifier agent."""
        super().__init__(
            agent_id="classifier_agent",
            agent_name="Agente Clasificador",
            agent_role="Clasifica siniestros por tipo, urgencia y cobertura",
            color="#e74c3c",  # Red
            icon="filter",
            version="1.0.0",
            model_type="rule-based",
        )

        # Keywords for classification (Spanish)
        self.hogar_keywords = {
            "agua": [
                "agua",
                "tuberías",
                "inundación",
                "humedad",
                "filtración",
                "fuga",
                "goteras",
            ],
            "incendio": [
                "incendio",
                "fuego",
                "quemada",
                "quemado",
                "llamas",
                "ardera",
            ],
            "robo": [
                "robo",
                "robado",
                "ladrón",
                "hurto",
                "allanamiento",
                "entrada",
            ],
            "cristales": [
                "cristal",
                "cristales",
                "ventana",
                "cristalera",
                "espejo",
                "vidrio",
                "rotura",
            ],
            "temporal": [
                "temporal",
                "tormenta",
                "granizo",
                "nieve",
                "viento",
                "lluvia",
                "huracán",
            ],
        }

        self.auto_keywords = {
            "colision": [
                "colisión",
                "choque",
                "impacto",
                "accidente",
                "vehículo",
                "coche",
            ],
            "robo": [
                "robo",
                "robado",
                "robaron",
                "hurto",
                "vehículo desaparecido",
            ],
            "vandalismo": [
                "vandalismo",
                "daño",
                "destrozado",
                "rayado",
                "golpeado",
                "raspado",
            ],
            "incendio": [
                "incendio",
                "fuego",
                "quemazón",
                "ardió",
                "arder",
            ],
            "terceros": [
                "tercero",
                "responsabilidad",
                "tercera persona",
                "otro vehículo",
            ],
        }

        self.salud_keywords = {
            "hospitalizacion": [
                "hospitalización",
                "hospital",
                "internado",
                "ingreso",
                "operación",
                "cirugía",
            ],
            "urgencia": [
                "urgencia",
                "emergencia",
                "urgente",
                "accidente",
                "herida",
                "lesión",
            ],
            "consulta": [
                "consulta",
                "médico",
                "doctor",
                "dentista",
                "examen",
                "revisión",
            ],
            "diagnostico": [
                "diagnóstico",
                "análisis",
                "prueba",
                "screening",
                "exploración",
            ],
        }

        # Cost ranges by claim type (in EUR)
        self.cost_ranges = {
            "hogar": {
                "agua": (500, 5000),
                "incendio": (2000, 50000),
                "robo": (1000, 30000),
                "cristales": (200, 2000),
                "temporal": (500, 10000),
            },
            "auto": {
                "colision": (1000, 40000),
                "robo": (5000, 80000),
                "vandalismo": (500, 10000),
                "incendio": (3000, 60000),
                "terceros": (1000, 100000),
            },
            "salud": {
                "hospitalizacion": (1000, 50000),
                "urgencia": (300, 5000),
                "consulta": (50, 500),
                "diagnostico": (100, 2000),
            },
        }

    # ── System prompt for LLM classification ──
    CLASSIFICATION_SYSTEM_PROMPT = """Eres un clasificador de siniestros de SegurCaixa Adeslas.
Analiza la descripción del siniestro y devuelve un JSON con la clasificación.

TIPOS válidos: hogar, auto, salud, viaje, otros
SUBTIPOS por tipo:
- hogar: agua, incendio, robo, cristales, temporal, otro
- auto: colision, vandalismo, incendio, robo, terceros, otro
- salud: hospitalizacion, urgencia, consulta, diagnostico, otro
- viaje: cancelacion, retraso, equipaje, asistencia, otro

URGENCIA: baja, media, alta, critica

Responde SOLO con JSON válido, sin texto adicional:
{
  "tipo_siniestro": "...",
  "subtipo": "...",
  "urgencia": "...",
  "probabilidad_fraude": 0.0-1.0,
  "razon_clasificacion": "explicación breve",
  "indicadores_fraude": ["lista de indicadores si los hay"],
  "score_ia": 0-100
}"""

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classify an incoming claim using LLM (Ollama on-premise)
        with fallback to rule-based classification.

        Args:
            input_data: Dictionary containing:
                - descripcion (str): Claim description
                - tipo_poliza (str): Type of policy
                - datos_adicionales (dict, optional): Additional metadata

        Returns:
            Classification results dict
        """
        descripcion = input_data.get("descripcion", "").lower()
        tipo_poliza = input_data.get("tipo_poliza", "otros").lower()
        datos_adicionales = input_data.get("datos_adicionales", {})

        # ── Try LLM classification first ──
        llm_result = await self._classify_with_llm(descripcion, tipo_poliza, datos_adicionales)

        if llm_result:
            # Enrich LLM result with cost estimation and coverage check
            tipo = llm_result.get("tipo_siniestro", tipo_poliza)
            subtipo = llm_result.get("subtipo", "otro")
            urgencia = llm_result.get("urgencia", "media")

            cobertura_aplicable = await self._check_coverage(
                tipo, subtipo, datos_adicionales
            )
            cost_min, cost_max = await self._estimate_costs(tipo, subtipo)

            return {
                "tipo_siniestro": tipo,
                "subtipo": subtipo,
                "urgencia": urgencia,
                "cobertura_aplicable": cobertura_aplicable,
                "probabilidad_fraude": round(
                    llm_result.get("probabilidad_fraude", 0.1), 3
                ),
                "score_ia": llm_result.get("score_ia", 75),
                "estimacion_coste_min": cost_min,
                "estimacion_coste_max": cost_max,
                "razon_clasificacion": llm_result.get("razon_clasificacion", ""),
                "llm_powered": True,
                "clasificacion_timestamp": datetime.utcnow().isoformat(),
            }

        # ── Fallback: rule-based classification ──
        logger.info("Using rule-based fallback for classification")

        tipo_siniestro, subtipo = await self._classify_type(
            descripcion, tipo_poliza
        )
        urgencia = await self._determine_urgency(descripcion, subtipo)
        cobertura_aplicable = await self._check_coverage(
            tipo_siniestro, subtipo, datos_adicionales
        )
        probabilidad_fraude = await self._calculate_fraud_probability(
            descripcion, datos_adicionales, subtipo
        )
        cost_min, cost_max = await self._estimate_costs(
            tipo_siniestro, subtipo
        )
        score_ia = await self._calculate_score(
            tipo_siniestro, subtipo, urgencia,
            cobertura_aplicable, probabilidad_fraude,
        )

        return {
            "tipo_siniestro": tipo_siniestro,
            "subtipo": subtipo,
            "urgencia": urgencia,
            "cobertura_aplicable": cobertura_aplicable,
            "probabilidad_fraude": round(probabilidad_fraude, 3),
            "score_ia": score_ia,
            "estimacion_coste_min": cost_min,
            "estimacion_coste_max": cost_max,
            "llm_powered": False,
            "clasificacion_timestamp": datetime.utcnow().isoformat(),
        }

    async def _classify_with_llm(
        self,
        descripcion: str,
        tipo_poliza: str,
        datos_adicionales: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """
        Classify using the local LLM (Ollama).

        Returns parsed classification dict, or None if LLM unavailable.
        """
        try:
            llm = get_llm_service()

            prompt = (
                f"Clasifica este siniestro:\n"
                f"Tipo de póliza: {tipo_poliza}\n"
                f"Descripción: {descripcion}\n"
            )
            if datos_adicionales:
                prompt += f"Datos adicionales: {datos_adicionales}\n"

            result = await llm.classify_json(
                prompt=prompt,
                system_prompt=self.CLASSIFICATION_SYSTEM_PROMPT,
                temperature=0.3,
            )

            if result and "tipo_siniestro" in result:
                # Validate the LLM output
                valid_types = ["hogar", "auto", "salud", "viaje", "otros"]
                if result["tipo_siniestro"] not in valid_types:
                    result["tipo_siniestro"] = tipo_poliza

                valid_urgency = ["baja", "media", "alta", "critica"]
                if result.get("urgencia") not in valid_urgency:
                    result["urgencia"] = "media"

                logger.info(
                    f"LLM classification: {result['tipo_siniestro']}/{result.get('subtipo', 'otro')} "
                    f"urgencia={result.get('urgencia')}"
                )
                return result

            return None

        except Exception as e:
            logger.warning(f"LLM classification failed: {e}")
            return None

    async def classify(
        self,
        descripcion: str,
        tipo_poliza: str,
        datos_adicionales: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Convenience method to classify a claim.

        Args:
            descripcion: Claim description
            tipo_poliza: Type of policy
            datos_adicionales: Optional additional data

        Returns:
            Classification results
        """
        input_data = {
            "descripcion": descripcion,
            "tipo_poliza": tipo_poliza,
            "datos_adicionales": datos_adicionales or {},
        }
        return await self.process(input_data)

    async def _classify_type(
        self, descripcion: str, tipo_poliza: str
    ) -> tuple[str, str]:
        """
        Classify claim type and subtype based on keywords.

        Args:
            descripcion: Claim description
            tipo_poliza: Type of policy

        Returns:
            Tuple of (tipo_siniestro, subtipo)
        """
        # Select keywords based on policy type
        keywords_map = {
            "hogar": (self.hogar_keywords, "hogar"),
            "auto": (self.auto_keywords, "auto"),
            "salud": (self.salud_keywords, "salud"),
            "viaje": ({}, "viaje"),
            "otros": ({}, "otros"),
        }

        tipo_siniestro = tipo_poliza if tipo_poliza in keywords_map else "otros"
        keywords, _ = keywords_map.get(tipo_siniestro, ({}, "otros"))

        # Find matching subtypes
        scores = {}
        for subtipo, words in keywords.items():
            score = sum(
                1 for word in words if word in descripcion
            )
            if score > 0:
                scores[subtipo] = score

        # Select highest scoring subtype
        if scores:
            best_subtipo = max(scores, key=scores.get)
        else:
            best_subtipo = "otro"

        return tipo_siniestro, best_subtipo

    async def _determine_urgency(
        self, descripcion: str, subtipo: str
    ) -> str:
        """
        Determine urgency level based on keywords and subtype.

        Args:
            descripcion: Claim description
            subtipo: Claim subtype

        Returns:
            Urgency level (baja, media, alta, critica)
        """
        # Critical keywords
        critical_words = [
            "urgencia",
            "emergencia",
            "herida",
            "sangre",
            "inconsciente",
            "grave",
            "severo",
            "crítico",
            "muerte",
        ]

        # High priority keywords
        high_words = [
            "incendio",
            "robo",
            "accidente",
            "hospital",
            "cirugía",
            "allanamiento",
        ]

        # Critical subtypes
        critical_subtypes = [
            "hospitalizacion",
            "urgencia",
            "incendio",
            "incendio_auto",
        ]

        # Check for critical keywords
        if any(word in descripcion for word in critical_words):
            return Urgency.CRITICA.value

        if subtipo in critical_subtypes:
            return Urgency.ALTA.value

        # Check for high priority keywords
        if any(word in descripcion for word in high_words):
            return Urgency.ALTA.value

        # Check description length (longer = more detailed = lower urgency)
        if len(descripcion) > 500:
            return Urgency.BAJA.value

        return Urgency.MEDIA.value

    async def _check_coverage(
        self,
        tipo_siniestro: str,
        subtipo: str,
        datos_adicionales: Dict[str, Any],
    ) -> bool:
        """
        Check if the claim is covered by the policy.

        Args:
            tipo_siniestro: Type of claim
            subtipo: Subtype of claim
            datos_adicionales: Additional metadata

        Returns:
            Whether coverage applies
        """
        # Basic coverage logic - all standard claims are covered
        # In a real system, this would check specific policy exclusions
        excluded_subtypes = ["otros", "otro"]

        if subtipo in excluded_subtypes:
            return False

        # Check for fraud indicators that might void coverage
        fraude_indicadores = datos_adicionales.get("fraude_indicadores", [])
        if "sin_pagar_prima" in fraude_indicadores:
            return False

        return True

    async def _calculate_fraud_probability(
        self,
        descripcion: str,
        datos_adicionales: Dict[str, Any],
        subtipo: str,
    ) -> float:
        """
        Calculate fraud probability based on heuristics.

        Args:
            descripcion: Claim description
            datos_adicionales: Additional metadata
            subtipo: Claim subtype

        Returns:
            Fraud probability (0-1)
        """
        fraud_score = 0.0

        # Vague descriptions increase fraud likelihood
        if len(descripcion) < 20:
            fraud_score += 0.15

        # Generic descriptions
        generic_words = ["siniestro", "daño", "problema", "cuestión"]
        generic_count = sum(1 for word in generic_words if word in descripcion)
        fraud_score += generic_count * 0.05

        # Known fraud indicators
        fraud_indicators = datos_adicionales.get("fraude_indicadores", [])
        fraud_indicator_weights = {
            "antecedentes_fraude": 0.3,
            "multiples_siniestros": 0.2,
            "beneficiario_cambio_reciente": 0.15,
            "sin_pagar_prima": 0.25,
            "cobertura_vencida": 0.1,
        }

        for indicator, weight in fraud_indicator_weights.items():
            if indicator in fraud_indicators:
                fraud_score += weight

        # Subtypes with higher fraud rates
        high_fraud_subtypes = ["robo", "robo_auto", "cristales"]
        if subtipo in high_fraud_subtypes:
            fraud_score += 0.1

        # Cap at 1.0
        return min(fraud_score, 1.0)

    async def _estimate_costs(
        self, tipo_siniestro: str, subtipo: str
    ) -> tuple[float, float]:
        """
        Estimate cost range for the claim.

        Args:
            tipo_siniestro: Type of claim
            subtipo: Subtype of claim

        Returns:
            Tuple of (min_cost, max_cost) in EUR
        """
        ranges = self.cost_ranges.get(tipo_siniestro, {})
        cost_range = ranges.get(subtipo, (500, 10000))
        return cost_range

    async def _calculate_score(
        self,
        tipo_siniestro: str,
        subtipo: str,
        urgencia: str,
        cobertura_aplicable: bool,
        probabilidad_fraude: float,
    ) -> int:
        """
        Calculate overall IA score for the claim.

        Args:
            tipo_siniestro: Type of claim
            subtipo: Subtype of claim
            urgencia: Urgency level
            cobertura_aplicable: Coverage applicability
            probabilidad_fraude: Fraud probability

        Returns:
            Overall score (0-100)
        """
        score = 70  # Base score

        # Coverage adjustment
        if not cobertura_aplicable:
            score -= 30

        # Urgency adjustment
        urgency_scores = {
            "baja": 5,
            "media": 10,
            "alta": 20,
            "critica": 30,
        }
        score += urgency_scores.get(urgencia, 0)

        # Fraud adjustment
        fraud_deduction = int(probabilidad_fraude * 20)
        score -= fraud_deduction

        # Known subtype adjustment (known subtypes get higher scores)
        known_subtypes = list(self.hogar_keywords.keys()) + list(
            self.auto_keywords.keys()
        ) + list(self.salud_keywords.keys())
        if subtipo not in known_subtypes:
            score -= 10

        # Ensure score is between 0-100
        return max(0, min(score, 100))
