"""
API routes for client management.
"""

import logging
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, status

from backend.schemas import ClienteResponse, ClienteCreate, ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/clientes", tags=["Clientes"])

# Mock database - in production this would use actual DB queries
MOCK_CLIENTES = {
    "cli_001": {
        "id": "cli_001",
        "nombre": "Juan",
        "apellidos": "García López",
        "dni": "12345678A",
        "email": "juan@example.com",
        "telefono": "+34912345678",
        "canal_preferido": "email",
        "fecha_registro": datetime.utcnow(),
        "activo": True,
        "polizas": [
            {
                "id": "pol_001",
                "numero_poliza": "SCA-2024-001",
                "producto": "Hogar Completo",
                "vigente": True,
                "fecha_inicio": datetime(2023, 1, 1),
                "fecha_fin": datetime(2025, 12, 31),
            }
        ],
    },
    "cli_002": {
        "id": "cli_002",
        "nombre": "María",
        "apellidos": "Martínez González",
        "dni": "87654321B",
        "email": "maria@example.com",
        "telefono": "+34912345679",
        "canal_preferido": "whatsapp",
        "fecha_registro": datetime.utcnow(),
        "activo": True,
        "polizas": [
            {
                "id": "pol_002",
                "numero_poliza": "SCA-2023-045",
                "producto": "Auto Premium",
                "vigente": True,
                "fecha_inicio": datetime(2022, 6, 1),
                "fecha_fin": datetime(2025, 5, 31),
            }
        ],
    },
}


@router.get("", response_model=List[ClienteResponse], tags=["Clientes"])
async def list_clientes(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
) -> List[ClienteResponse]:
    """
    List all clients with pagination.

    **Parameters:**
    - `skip`: Number of records to skip (default: 0)
    - `limit`: Maximum number of records to return (default: 10, max: 100)

    **Returns:** List of ClienteResponse objects
    """
    logger.info(f"Listing clientes with skip={skip}, limit={limit}")

    clientes_list = list(MOCK_CLIENTES.values())
    clientes_list = clientes_list[skip : skip + limit]

    return [
        ClienteResponse(
            **{
                **cliente,
                "num_siniestros": 2 if cliente["id"] == "cli_001" else 0,
            }
        )
        for cliente in clientes_list
    ]


@router.get("/{cliente_id}", response_model=ClienteResponse, tags=["Clientes"])
async def get_cliente(cliente_id: str) -> ClienteResponse:
    """
    Get a specific client with all their policies and claims.

    **Parameters:**
    - `cliente_id`: Client identifier

    **Returns:** Complete client information including policies and claims
    """
    logger.info(f"Getting cliente: {cliente_id}")

    if cliente_id not in MOCK_CLIENTES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente {cliente_id} not found",
        )

    cliente = MOCK_CLIENTES[cliente_id]
    return ClienteResponse(
        **{
            **cliente,
            "num_siniestros": 2 if cliente_id == "cli_001" else 0,
        }
    )


@router.get("/dni/{dni}", response_model=ClienteResponse, tags=["Clientes"])
async def get_cliente_by_dni(dni: str) -> ClienteResponse:
    """
    Find a client by their DNI (Spanish national ID).

    **Parameters:**
    - `dni`: Client DNI number

    **Returns:** Client information if found
    """
    logger.info(f"Looking up cliente by DNI: {dni}")

    for cliente in MOCK_CLIENTES.values():
        if cliente["dni"].upper() == dni.upper():
            return ClienteResponse(
                **{
                    **cliente,
                    "num_siniestros": 2 if cliente["id"] == "cli_001" else 0,
                }
            )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Cliente with DNI {dni} not found",
    )


@router.post("", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED, tags=["Clientes"])
async def create_cliente(cliente_data: ClienteCreate) -> ClienteResponse:
    """
    Create a new client.

    **Body:**
    ```json
    {
        "nombre": "string",
        "apellidos": "string",
        "dni": "string",
        "email": "string",
        "telefono": "string",
        "canal_preferido": "email|whatsapp|sms|phone"
    }
    ```

    **Returns:** Created client information
    """
    logger.info(f"Creating new cliente: {cliente_data.nombre} {cliente_data.apellidos}")

    # Check if DNI already exists
    for cliente in MOCK_CLIENTES.values():
        if cliente["dni"].upper() == cliente_data.dni.upper():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cliente with DNI {cliente_data.dni} already exists",
            )

    cliente_id = f"cli_{len(MOCK_CLIENTES) + 1:03d}"
    nuevo_cliente = {
        "id": cliente_id,
        **cliente_data.model_dump(),
        "fecha_registro": datetime.utcnow(),
        "activo": True,
        "polizas": [],
    }

    MOCK_CLIENTES[cliente_id] = nuevo_cliente
    logger.info(f"Cliente creado: {cliente_id}")

    return ClienteResponse(**{**nuevo_cliente, "num_siniestros": 0})
