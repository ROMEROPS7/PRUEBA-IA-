"""
Document processing agent for the SegurCaixa Adeslas claims management system.

This module handles document validation, analysis, and extraction of information
from claim-related documents.
"""

import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from enum import Enum

from .base import BaseAgent

logger = logging.getLogger(__name__)


class DocumentType(str, Enum):
    """Types of documents in claim processing."""
    POLIZA = "poliza"
    FACTURA = "factura"
    PRESUPUESTO = "presupuesto"
    FOTO = "foto"
    VIDEO = "video"
    RECIBO = "recibo"
    COMPROBANTE_PAGO = "comprobante_pago"
    DENUNCIA = "denuncia"
    INFORME_MEDICO = "informe_medico"
    OTRO = "otro"


class DocsAgent(BaseAgent):
    """
    Agent responsible for document processing and validation.

    This agent:
    - Validates document completeness for different claim types
    - Analyzes documents (text extraction, validation)
    - Processes images (placeholder for Vision AI integration)
    - Defines required documentation by claim type
    """

    def __init__(self) -> None:
        """Initialize the document processing agent."""
        super().__init__(
            agent_id="docs_agent",
            agent_name="Agente Documental",
            agent_role="Procesa y valida documentación de siniestros",
            color="#27ae60",  # Green
            icon="file-text",
            version="1.0.0",
            model_type="rule-based",
        )

        # Required documents by claim type
        self.required_docs = {
            "hogar": {
                "agua": [
                    "fotos_daño",
                    "presupuesto_reparacion",
                    "factura_anterior",
                ],
                "incendio": [
                    "fotos_daño",
                    "denuncia_policia",
                    "presupuesto_reparacion",
                ],
                "robo": [
                    "denuncia_policia",
                    "fotos_before",
                    "fotos_after",
                    "lista_items",
                ],
                "cristales": [
                    "fotos_daño",
                    "presupuesto_reparacion",
                ],
                "temporal": [
                    "fotos_daño",
                    "presupuesto_reparacion",
                    "factura_anterior",
                ],
            },
            "auto": {
                "colision": [
                    "fotos_daño",
                    "fotos_escena",
                    "dni_implicados",
                    "datos_otros_vehiculos",
                    "presupuesto_taller",
                ],
                "robo": [
                    "denuncia_policia",
                    "fotos_vehiculo",
                    "documentacion_vehiculo",
                ],
                "vandalismo": [
                    "fotos_daño",
                    "denuncia_policia",
                    "presupuesto_reparacion",
                ],
                "incendio": [
                    "fotos_daño",
                    "denuncia_policia",
                    "presupuesto_taller",
                ],
                "terceros": [
                    "fotos_daño_propio",
                    "fotos_daño_tercero",
                    "datos_tercero",
                    "póliza_tercero",
                ],
            },
            "salud": {
                "hospitalizacion": [
                    "informe_hospital",
                    "recibos_medicinas",
                    "analisis_laboratorio",
                ],
                "urgencia": [
                    "informe_urgencia",
                    "recibos",
                ],
                "consulta": [
                    "receta_medica",
                    "factura_consulta",
                ],
                "diagnostico": [
                    "resultados_analisis",
                    "informe_medico",
                ],
            },
        }

        # Document type identifiers
        self.document_type_keywords = {
            "poliza": ["póliza", "certificado", "condiciones"],
            "factura": ["factura", "invoice", "número de factura"],
            "presupuesto": ["presupuesto", "cotización", "quote"],
            "foto": ["imagen", "foto", "photograph"],
            "video": ["vídeo", "video", "grabación"],
            "recibo": ["recibo", "receipt", "comprobante"],
            "comprobante_pago": ["comprobante de pago", "recepción", "pago"],
            "denuncia": ["denuncia", "denuncia policial", "policía"],
            "informe_medico": [
                "informe médico",
                "medical report",
                "certificado médico",
            ],
        }

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process documents for a claim.

        Args:
            input_data: Dictionary containing:
                - operation (str): 'process' or 'validate'
                - file_paths (list, optional): List of document file paths
                - tipo_siniestro (str): Type of claim
                - siniestro_id (str, optional): ID of the claim

        Returns:
            Dictionary with processing results
        """
        operation = input_data.get("operation", "process")
        file_paths = input_data.get("file_paths", [])
        tipo_siniestro = input_data.get("tipo_siniestro", "otros")
        siniestro_id = input_data.get("siniestro_id")

        if operation == "process":
            return await self._process_documents(file_paths, tipo_siniestro)
        elif operation == "validate":
            return await self._validate_documentation(
                siniestro_id, file_paths, tipo_siniestro
            )
        else:
            return {
                "status": "error",
                "error": f"Unknown operation: {operation}",
            }

    async def process_document(
        self, file_path: str, tipo_siniestro: str
    ) -> Dict[str, Any]:
        """
        Process a single document.

        Args:
            file_path: Path to the document file
            tipo_siniestro: Type of claim

        Returns:
            Dictionary with document analysis results
        """
        if not os.path.exists(file_path):
            return {
                "status": "error",
                "error": f"File not found: {file_path}",
            }

        file_ext = Path(file_path).suffix.lower()
        file_name = Path(file_path).name

        # Determine document type
        doc_type = await self._identify_document_type(
            file_name, file_path
        )

        # Extract information based on document type
        extracted_data = await self._extract_document_info(
            file_path, doc_type
        )

        # Validate document
        is_valid = await self._validate_document(
            file_path, doc_type, tipo_siniestro
        )

        return {
            "file_path": file_path,
            "file_name": file_name,
            "file_type": file_ext,
            "document_type": doc_type,
            "extracted_data": extracted_data,
            "is_valid": is_valid,
            "processing_timestamp": datetime.utcnow().isoformat(),
        }

    async def validate_documentation(
        self, siniestro_id: str, docs: List[str], tipo_siniestro: str = None
    ) -> Dict[str, Any]:
        """
        Validate documentation completeness for a claim.

        Args:
            siniestro_id: ID of the claim
            docs: List of document file paths
            tipo_siniestro: Type of claim

        Returns:
            Dictionary with validation results
        """
        return await self._validate_documentation(
            siniestro_id, docs, tipo_siniestro
        )

    async def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """
        Analyze an image document (placeholder for Vision AI).

        Args:
            image_path: Path to the image file

        Returns:
            Dictionary with image analysis results
        """
        if not os.path.exists(image_path):
            return {
                "status": "error",
                "error": f"File not found: {image_path}",
            }

        # Placeholder for Vision AI integration
        # In a real system, this would call Claude Vision or similar
        analysis = {
            "image_path": image_path,
            "file_name": Path(image_path).name,
            "has_damage": True,  # Placeholder
            "damage_severity": "media",  # Placeholder
            "detected_items": [],  # Placeholder
            "text_detected": "",  # Placeholder
            "quality_score": 0.85,  # Placeholder
            "note": "Vision AI integration pending - placeholder data",
            "analysis_timestamp": datetime.utcnow().isoformat(),
        }

        return analysis

    async def _process_documents(
        self, file_paths: List[str], tipo_siniestro: str
    ) -> Dict[str, Any]:
        """
        Process a list of documents.

        Args:
            file_paths: List of document paths
            tipo_siniestro: Type of claim

        Returns:
            Processing results
        """
        results = []
        valid_count = 0
        error_count = 0

        for file_path in file_paths:
            try:
                result = await self.process_document(
                    file_path, tipo_siniestro
                )
                results.append(result)
                if result.get("is_valid"):
                    valid_count += 1
            except Exception as e:
                logger.error(f"Error processing document {file_path}: {e}")
                error_count += 1
                results.append(
                    {
                        "file_path": file_path,
                        "status": "error",
                        "error": str(e),
                    }
                )

        return {
            "documents_processed": len(file_paths),
            "valid_documents": valid_count,
            "error_count": error_count,
            "results": results,
        }

    async def _validate_documentation(
        self,
        siniestro_id: str,
        docs: List[str],
        tipo_siniestro: str = None,
    ) -> Dict[str, Any]:
        """
        Validate if documentation is complete for a claim.

        Args:
            siniestro_id: ID of the claim
            docs: List of document file paths
            tipo_siniestro: Type of claim

        Returns:
            Validation results with completitud score
        """
        if not tipo_siniestro:
            return {
                "siniestro_id": siniestro_id,
                "completitud_score": 0,
                "status": "error",
                "error": "tipo_siniestro required",
            }

        # Get required documents for this claim type
        required = self.required_docs.get(tipo_siniestro, {}).get(
            "otro", []
        )

        if not required:
            required = ["fotos_daño", "presupuesto_reparacion"]

        # Analyze provided documents
        doc_types_provided = []
        for doc_path in docs:
            doc_type = await self._identify_document_type(
                Path(doc_path).name, doc_path
            )
            doc_types_provided.append(doc_type)

        # Calculate completitud (0-100)
        if required:
            matched = sum(
                1
                for req in required
                if any(req in dt for dt in doc_types_provided)
            )
            completitud_score = int((matched / len(required)) * 100)
        else:
            completitud_score = 100

        # Identify missing documents
        missing_docs = [
            req
            for req in required
            if not any(req in dt for dt in doc_types_provided)
        ]

        return {
            "siniestro_id": siniestro_id,
            "tipo_siniestro": tipo_siniestro,
            "total_documents_provided": len(docs),
            "documents_provided": doc_types_provided,
            "required_documents": required,
            "missing_documents": missing_docs,
            "completitud_score": completitud_score,
            "is_complete": completitud_score >= 80,
            "validation_timestamp": datetime.utcnow().isoformat(),
        }

    async def _identify_document_type(
        self, file_name: str, file_path: str
    ) -> str:
        """
        Identify document type from file name and content.

        Args:
            file_name: Name of the file
            file_path: Path to the file

        Returns:
            Document type identifier
        """
        file_name_lower = file_name.lower()

        # Check file extension
        ext_map = {
            ".jpg": "foto",
            ".jpeg": "foto",
            ".png": "foto",
            ".gif": "foto",
            ".pdf": "poliza",
            ".doc": "poliza",
            ".docx": "poliza",
            ".mp4": "video",
            ".avi": "video",
            ".mov": "video",
        }

        file_ext = Path(file_path).suffix.lower()
        if file_ext in ext_map:
            return ext_map[file_ext]

        # Check keywords in filename
        for doc_type, keywords in self.document_type_keywords.items():
            for keyword in keywords:
                if keyword in file_name_lower:
                    return doc_type

        return "otro"

    async def _extract_document_info(
        self, file_path: str, doc_type: str
    ) -> Dict[str, Any]:
        """
        Extract information from a document.

        Args:
            file_path: Path to the document
            doc_type: Type of document

        Returns:
            Extracted data
        """
        # Placeholder for OCR/text extraction
        # In a real system, this would use Tesseract, Claude Vision, etc.
        return {
            "extracted_text": "",
            "extracted_fields": {},
            "language_detected": "es",
            "note": "Text extraction pending - placeholder data",
        }

    async def _validate_document(
        self, file_path: str, doc_type: str, tipo_siniestro: str
    ) -> bool:
        """
        Validate a document for a specific claim type.

        Args:
            file_path: Path to the document
            doc_type: Type of document
            tipo_siniestro: Type of claim

        Returns:
            Whether document is valid
        """
        # Check file exists and is readable
        if not os.path.exists(file_path):
            return False

        if not os.path.getsize(file_path) > 0:
            return False

        # Check file type is supported
        supported_types = [
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png",
            ".doc",
            ".docx",
        ]
        file_ext = Path(file_path).suffix.lower()
        if file_ext not in supported_types:
            return False

        # Document is valid if it matches expected types for this claim
        required = self.required_docs.get(tipo_siniestro, {})
        if doc_type in required:
            return True

        return True  # Allow documents even if not strictly required
