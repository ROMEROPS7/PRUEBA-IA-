"""
Assignment agent for the SegurCaixa Adeslas claims management system.

This module handles assignment of claims to qualified gestores (claims adjusters),
peritos (expert assessors), and specialized professionals (mechanics, doctors, etc.).
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from enum import Enum

from .base import BaseAgent

logger = logging.getLogger(__name__)


class Especialidad(str, Enum):
    """Specialties of claims adjusters."""
    HOGAR = "hogar"
    AUTO = "auto"
    SALUD = "salud"
    VIAJE = "viaje"
    GENERAL = "general"


class AssignmentAgent(BaseAgent):
    """
    Agent responsible for assigning claims to qualified professionals.

    This agent:
    - Assigns claims to gestores (claims adjusters)
    - Assigns peritos (expert assessors) when needed
    - Assigns specialists (mechanics, doctors, etc.)
    - Uses availability, specialization, and geographic proximity
    """

    def __init__(self) -> None:
        """Initialize the assignment agent."""
        super().__init__(
            agent_id="assignment_agent",
            agent_name="Agente de Asignación",
            agent_role="Asigna siniestros a gestores, peritos y profesionales",
            color="#9b59b6",  # Purple
            icon="user-check",
            version="1.0.0",
            model_type="rule-based",
        )

        # Mock data for gestores (claims adjusters)
        self.gestores = [
            {
                "id": "ges_001",
                "nombre": "María García López",
                "especialidad": "hogar",
                "zona": "Madrid Centro",
                "carga_actual": 12,
                "capacidad_maxima": 20,
                "rating": 4.8,
                "experiencia_años": 8,
                "idiomas": ["es", "en"],
            },
            {
                "id": "ges_002",
                "nombre": "Carlos Rodríguez Martín",
                "especialidad": "auto",
                "zona": "Madrid Sur",
                "carga_actual": 18,
                "capacidad_maxima": 20,
                "rating": 4.6,
                "experiencia_años": 6,
                "idiomas": ["es", "en"],
            },
            {
                "id": "ges_003",
                "nombre": "Ana Fernández López",
                "especialidad": "salud",
                "zona": "Barcelona Centro",
                "carga_actual": 8,
                "capacidad_maxima": 15,
                "rating": 4.9,
                "experiencia_años": 10,
                "idiomas": ["es", "ca", "en"],
            },
            {
                "id": "ges_004",
                "nombre": "Juan Martínez Ruiz",
                "especialidad": "hogar",
                "zona": "Barcelona Nord",
                "carga_actual": 14,
                "capacidad_maxima": 20,
                "rating": 4.5,
                "experiencia_años": 5,
                "idiomas": ["es", "ca"],
            },
            {
                "id": "ges_005",
                "nombre": "Isabel Sánchez García",
                "especialidad": "general",
                "zona": "Valencia",
                "carga_actual": 10,
                "capacidad_maxima": 20,
                "rating": 4.7,
                "experiencia_años": 7,
                "idiomas": ["es", "en"],
            },
        ]

        # Mock data for peritos (expert assessors)
        self.peritos = [
            {
                "id": "per_001",
                "nombre": "Dr. Rafael García Martínez",
                "tipo": "tasador_inmuebles",
                "zona": "Madrid",
                "disponibilidad": True,
                "rating": 4.9,
                "tiempo_medio_dias": 3,
            },
            {
                "id": "per_002",
                "nombre": "Ing. Pablo López Fernández",
                "tipo": "perito_vehiculos",
                "zona": "Madrid",
                "disponibilidad": True,
                "rating": 4.8,
                "tiempo_medio_dias": 2,
            },
            {
                "id": "per_003",
                "nombre": "Dra. Elena Ruiz Sánchez",
                "tipo": "perito_medico",
                "zona": "Barcelona",
                "disponibilidad": True,
                "rating": 4.9,
                "tiempo_medio_dias": 4,
            },
            {
                "id": "per_004",
                "nombre": "Ing. David López García",
                "tipo": "tasador_contenido",
                "zona": "Valencia",
                "disponibilidad": False,
                "rating": 4.7,
                "tiempo_medio_dias": 5,
            },
            {
                "id": "per_005",
                "nombre": "Dr. Miguel Fernández López",
                "tipo": "perito_medico",
                "zona": "Madrid",
                "disponibilidad": True,
                "rating": 4.6,
                "tiempo_medio_dias": 3,
            },
        ]

        # Mock data for specialized professionals
        self.profesionales = [
            {
                "id": "prof_001",
                "nombre": "Taller Autorizado SegurCaixa - Madrid",
                "tipo": "taller_mecanico",
                "zona": "Madrid",
                "distancia_km": 2.5,
                "disponibilidad": True,
                "rating": 4.7,
            },
            {
                "id": "prof_002",
                "nombre": "Clínica Dental Sonrisa Plus",
                "tipo": "odontologia",
                "zona": "Madrid",
                "distancia_km": 1.2,
                "disponibilidad": True,
                "rating": 4.8,
            },
            {
                "id": "prof_003",
                "nombre": "Hospital Quirónsalud Madrid",
                "tipo": "hospital",
                "zona": "Madrid",
                "distancia_km": 5.0,
                "disponibilidad": True,
                "rating": 4.9,
            },
            {
                "id": "prof_004",
                "nombre": "Taller Autorizado SegurCaixa - Barcelona",
                "tipo": "taller_mecanico",
                "zona": "Barcelona",
                "distancia_km": 3.0,
                "disponibilidad": True,
                "rating": 4.6,
            },
            {
                "id": "prof_005",
                "nombre": "Cristalería Rápida Valencia",
                "tipo": "cristaleria",
                "zona": "Valencia",
                "distancia_km": 2.0,
                "disponibilidad": True,
                "rating": 4.5,
            },
        ]

        # Mapping of claim types to required professions
        self.tipo_siniestro_to_profesiones = {
            "hogar": {
                "agua": ["tasador_inmuebles"],
                "incendio": ["tasador_inmuebles"],
                "robo": ["tasador_contenido"],
                "cristales": ["cristaleria"],
                "temporal": ["tasador_inmuebles"],
            },
            "auto": {
                "colision": ["perito_vehiculos", "taller_mecanico"],
                "robo": ["perito_vehiculos"],
                "vandalismo": ["taller_mecanico"],
                "incendio": ["perito_vehiculos"],
                "terceros": ["perito_vehiculos"],
            },
            "salud": {
                "hospitalizacion": ["hospital"],
                "urgencia": ["hospital"],
                "consulta": ["odontologia"],
                "diagnostico": ["perito_medico"],
            },
        }

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assign a claim to appropriate professionals.

        Args:
            input_data: Dictionary containing:
                - tipo_siniestro (str): Type of claim
                - subtipo (str): Subtype of claim
                - urgencia (str): Urgency level
                - ubicacion (str, optional): Location/zone
                - cliente_id (str, optional): Client ID
                - probabilidad_fraude (float, optional): Fraud probability

        Returns:
            Dictionary with assignment results
        """
        tipo_siniestro = input_data.get("tipo_siniestro", "otros")
        subtipo = input_data.get("subtipo", "otro")
        urgencia = input_data.get("urgencia", "media")
        ubicacion = input_data.get("ubicacion", "Madrid")
        probabilidad_fraude = input_data.get("probabilidad_fraude", 0.0)

        result = await self.assign(
            tipo_siniestro=tipo_siniestro,
            subtipo=subtipo,
            prioridad=urgencia,
            ubicacion=ubicacion,
        )

        # Add metadata
        result["probabilidad_fraude"] = probabilidad_fraude
        result["assignment_timestamp"] = datetime.utcnow().isoformat()

        return result

    async def assign(
        self,
        tipo_siniestro: str,
        subtipo: str = "otro",
        prioridad: str = "media",
        ubicacion: str = None,
    ) -> Dict[str, Any]:
        """
        Assign a claim to professionals.

        Args:
            tipo_siniestro: Type of claim
            subtipo: Subtype of claim
            prioridad: Priority level
            ubicacion: Location/zone

        Returns:
            Dictionary with assigned professionals:
                - gestor: Assigned claims adjuster
                - perito: Assigned expert assessor (if needed)
                - profesional: Assigned specialist (if needed)
        """
        # Assign gestor
        gestor = await self._assign_gestor(tipo_siniestro, ubicacion)

        # Assign perito if needed
        perito = None
        if await self._needs_perito(tipo_siniestro, subtipo):
            perito = await self._assign_perito(tipo_siniestro, subtipo, ubicacion)

        # Assign specialist professionals if needed
        profesionales = []
        required_professions = self.tipo_siniestro_to_profesiones.get(
            tipo_siniestro, {}
        ).get(subtipo, [])

        for profession in required_professions:
            prof = await self._assign_profesional(
                profession, ubicacion, prioridad
            )
            if prof:
                profesionales.append(prof)

        return {
            "gestor": gestor,
            "perito": perito,
            "profesionales": profesionales,
        }

    async def _assign_gestor(
        self, tipo_siniestro: str, ubicacion: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Assign a claims adjuster (gestor).

        Args:
            tipo_siniestro: Type of claim
            ubicacion: Preferred location

        Returns:
            Assigned gestor information
        """
        # Filter by specialization
        candidates = [
            g
            for g in self.gestores
            if g["especialidad"] == tipo_siniestro
            or g["especialidad"] == "general"
        ]

        # Filter by availability (carga actual < capacidad)
        available = [
            g for g in candidates
            if g["carga_actual"] < g["capacidad_maxima"]
        ]

        if not available:
            available = candidates  # Fallback to any candidate

        # Sort by load and rating
        sorted_gestores = sorted(
            available,
            key=lambda x: (
                x["carga_actual"] / x["capacidad_maxima"],
                -x["rating"],
            ),
        )

        if sorted_gestores:
            gestor = sorted_gestores[0]
            return {
                "id": gestor["id"],
                "nombre": gestor["nombre"],
                "especialidad": gestor["especialidad"],
                "zona": gestor["zona"],
                "carga_actual": gestor["carga_actual"],
                "capacidad_maxima": gestor["capacidad_maxima"],
                "rating": gestor["rating"],
                "experiencia_años": gestor["experiencia_años"],
            }

        return {}

    async def _assign_perito(
        self,
        tipo_siniestro: str,
        subtipo: str,
        ubicacion: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Assign an expert assessor (perito).

        Args:
            tipo_siniestro: Type of claim
            subtipo: Subtype of claim
            ubicacion: Preferred location

        Returns:
            Assigned perito information
        """
        # Determine required perito type
        perito_type_map = {
            "hogar": "tasador_inmuebles",
            "auto": "perito_vehiculos",
            "salud": "perito_medico",
        }

        required_type = perito_type_map.get(tipo_siniestro, "tasador_inmuebles")

        # Filter available peritos
        candidates = [
            p for p in self.peritos
            if p["tipo"] == required_type and p["disponibilidad"]
        ]

        if not candidates:
            candidates = [
                p for p in self.peritos
                if p["tipo"] == required_type
            ]

        if not candidates:
            return None

        # Sort by rating
        sorted_peritos = sorted(
            candidates, key=lambda x: -x["rating"]
        )

        perito = sorted_peritos[0]
        return {
            "id": perito["id"],
            "nombre": perito["nombre"],
            "tipo": perito["tipo"],
            "zona": perito["zona"],
            "disponibilidad": perito["disponibilidad"],
            "rating": perito["rating"],
            "tiempo_medio_dias": perito["tiempo_medio_dias"],
        }

    async def _assign_profesional(
        self,
        profession_type: str,
        ubicacion: Optional[str] = None,
        prioridad: str = "media",
    ) -> Optional[Dict[str, Any]]:
        """
        Assign a specialized professional.

        Args:
            profession_type: Type of profession
            ubicacion: Preferred location
            prioridad: Priority level

        Returns:
            Assigned professional information or None
        """
        # Filter by profession type and availability
        candidates = [
            p for p in self.profesionales
            if p["tipo"] == profession_type and p["disponibilidad"]
        ]

        if not candidates:
            candidates = [
                p for p in self.profesionales
                if p["tipo"] == profession_type
            ]

        if not candidates:
            return None

        # Sort by distance and rating
        sorted_profesionales = sorted(
            candidates,
            key=lambda x: (x["distancia_km"], -x["rating"]),
        )

        prof = sorted_profesionales[0]
        return {
            "id": prof["id"],
            "nombre": prof["nombre"],
            "tipo": prof["tipo"],
            "zona": prof["zona"],
            "distancia_km": prof["distancia_km"],
            "disponibilidad": prof["disponibilidad"],
            "rating": prof["rating"],
        }

    async def _needs_perito(
        self, tipo_siniestro: str, subtipo: str
    ) -> bool:
        """
        Determine if a claim needs an expert assessor.

        Args:
            tipo_siniestro: Type of claim
            subtipo: Subtype of claim

        Returns:
            Whether a perito is needed
        """
        # High-value or complex claims need peritos
        high_value_types = {
            "hogar": ["incendio", "robo"],
            "auto": ["colision", "robo", "incendio"],
            "salud": ["hospitalizacion"],
        }

        return subtipo in high_value_types.get(tipo_siniestro, [])
