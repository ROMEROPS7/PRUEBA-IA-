"""
Example usage of the SegurCaixa Adeslas Multi-Agent Claims System.

This module provides comprehensive examples of how to use each agent
and the orchestrator for various claim processing scenarios.
"""

import asyncio
import logging
from typing import Any, Dict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# Import agents
try:
    from .orchestrator import Orchestrator, Canal
    from .classifier_agent import ClassifierAgent
    from .docs_agent import DocsAgent
    from .assignment_agent import AssignmentAgent
    from .voice_agent import VoiceAgent
    from .chat_agent import ChatAgent
    from .registry import get_registry
except ImportError:
    logger.warning("Agents not available - running examples in mock mode")


async def example_1_new_home_claim():
    """
    Example 1: Process a new home insurance claim (water damage).

    This demonstrates:
    - Creating a new siniestro through the orchestrator
    - Automatic classification
    - Assignment of professionals
    - Channel-specific response generation
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 1: New Home Insurance Claim (Water Damage)")
    print("=" * 70)

    orchestrator = Orchestrator()

    # Client reports water damage via WhatsApp
    cliente_data = {
        "id": "cliente_2024_001",
        "nombre": "María Rodríguez García",
        "tipo_poliza": "hogar",
        "ubicacion": "Madrid Centro",
        "email": "maria@example.com",
        "telefono": "665555555",
    }

    descripcion = (
        "Mi cocina se ha inundado por una tubería rota. El agua ha dañado "
        "los armarios y el suelo. Tengo fotos del daño. Es urgente, "
        "mañana tengo un evento importante en casa."
    )

    result = await orchestrator.process_new_siniestro(
        canal="whatsapp",
        cliente_data=cliente_data,
        descripcion=descripcion,
        db_session=None,
    )

    if result["status"] == "success":
        siniestro = result["siniestro"]
        print(f"\n✅ Siniestro creado: {siniestro['id']}")
        print(f"   Cliente: {siniestro['datos_cliente']['nombre']}")
        print(f"\n📋 Clasificación:")
        print(f"   Tipo: {siniestro['clasificacion']['tipo_siniestro']}")
        print(f"   Subtipo: {siniestro['clasificacion']['subtipo']}")
        print(f"   Urgencia: {siniestro['clasificacion']['urgencia']}")
        print(f"   Score IA: {siniestro['clasificacion']['score_ia']}/100")
        print(f"   Cobertura aplicable: {siniestro['clasificacion']['cobertura_aplicable']}")

        print(f"\n👥 Asignaciones:")
        gestor = siniestro["asignaciones"]["gestor"]
        print(f"   Gestor: {gestor['nombre']}")
        print(f"   Especialidad: {gestor['especialidad']}")
        print(f"   Rating: {gestor['rating']}/5")

        if siniestro["asignaciones"].get("perito"):
            perito = siniestro["asignaciones"]["perito"]
            print(f"   Perito: {perito['nombre']}")
            print(f"   Tipo: {perito['tipo']}")

        print(f"\n📱 Respuesta al cliente (WhatsApp):")
        print(f"   {result['respuesta_cliente']}")

        print(f"\n📅 Timeline:")
        for entry in siniestro["timeline"]:
            print(f"   {entry['timestamp']}: {entry['evento']}")
    else:
        print(f"❌ Error: {result.get('error')}")


async def example_2_voice_call():
    """
    Example 2: Process a phone call with the voice agent.

    This demonstrates:
    - Voice transcription processing
    - Intent extraction
    - Entity extraction
    - TTS-ready response generation
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 2: Voice Call Processing")
    print("=" * 70)

    voice_agent = VoiceAgent()

    # Simulate incoming phone call transcription
    call_1 = await voice_agent.process_call(
        audio_text="Hola, buenos días. Soy Cliente García y tengo un accidente de coche.",
        cliente_id="cliente_auto_001",
    )

    print(f"\n📞 Call 1: Report Accident")
    print(f"   Input: 'Hola, buenos días. Soy Cliente García y tengo un accidente de coche.'")
    print(f"   Intent detected: {call_1['intent']}")
    print(f"   Sara responds: {call_1['response']['text']}")
    print(f"   TTS ready: {call_1['response']['tts_ready']}")
    print(f"   Voice: {call_1['response']['voice']}")

    # Second call - more details
    call_2 = await voice_agent.process_call(
        audio_text="Ocurrió hace una hora. Colisioné con otro vehículo en la autopista. Nadie está herido.",
        cliente_id="cliente_auto_001",
        context=call_1["response"],
    )

    print(f"\n📞 Call 2: Provide Details")
    print(f"   Input: 'Ocurrió hace una hora. Colisioné...'")
    print(f"   Entities extracted: {call_2['entities']}")
    print(f"   Sara responds: {call_2['response']['text']}")


async def example_3_whatsapp_conversation():
    """
    Example 3: WhatsApp chat conversation flow.

    This demonstrates:
    - Message processing
    - Conversation state management
    - Document requests
    - Multiple turns in conversation
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 3: WhatsApp Conversation Flow")
    print("=" * 70)

    chat_agent = ChatAgent()

    # User initiates conversation
    msg_1 = await chat_agent.process_message(
        message="Hola, necesito reportar un robo en mi casa",
        canal="whatsapp",
        cliente_id="cliente_hogar_002",
    )

    print(f"\n💬 Message 1: Initial Contact")
    print(f"   User: 'Hola, necesito reportar un robo en mi casa'")
    print(f"   Intent: {msg_1['response']['intent']}")
    print(f"   Assistant: {msg_1['response']['text']}")
    print(f"   Conversation ID: {msg_1['conversation_id']}")

    # User provides description
    msg_2 = await chat_agent.process_message(
        message="Entraron por la ventana del dormitorio. Me robaron joyas y dinero.",
        canal="whatsapp",
        cliente_id="cliente_hogar_002",
        conversation_id=msg_1["conversation_id"],
    )

    print(f"\n💬 Message 2: Details")
    print(f"   User: 'Entraron por la ventana...'")
    print(f"   Assistant: {msg_2['response']['text']}")

    # User sends documents
    msg_3 = await chat_agent.process_message(
        message="Aquí están las fotos del daño",
        canal="whatsapp",
        cliente_id="cliente_hogar_002",
        conversation_id=msg_1["conversation_id"],
        attachments=[
            "/documents/ventana_rota.jpg",
            "/documents/habitacion_desordenada.jpg",
        ],
    )

    print(f"\n💬 Message 3: Send Documents")
    print(f"   Documents processed: {msg_3['documents_processed']}")
    print(f"   Assistant: {msg_3['response']['text']}")


async def example_4_classification_variations():
    """
    Example 4: Test classifier with various claim types.

    This demonstrates:
    - Different claim type classifications
    - Urgency determination
    - Fraud probability calculation
    - Cost estimation
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 4: Classification Variations")
    print("=" * 70)

    classifier = ClassifierAgent()

    test_cases = [
        {
            "descripcion": "Incendio en el salón de mi casa. Mucho humo y llamas. Necesito ayuda urgentemente.",
            "tipo_poliza": "hogar",
            "title": "Home Fire (Critical)",
        },
        {
            "descripcion": "Me robaron el coche hace dos días. Está en el garaje con cristales rotos.",
            "tipo_poliza": "auto",
            "title": "Auto Theft",
        },
        {
            "descripcion": "Necesito me reembolsen una consulta al dentista. Pagué 150 euros.",
            "tipo_poliza": "salud",
            "title": "Dental Consultation (Low Cost)",
        },
        {
            "descripcion": "Siniestro",
            "tipo_poliza": "otros",
            "title": "Vague Description (High Fraud Risk)",
        },
    ]

    for test_case in test_cases:
        result = await classifier.classify(
            descripcion=test_case["descripcion"],
            tipo_poliza=test_case["tipo_poliza"],
        )

        print(f"\n📊 {test_case['title']}")
        print(f"   Tipo: {result['tipo_siniestro']} / {result['subtipo']}")
        print(f"   Urgencia: {result['urgencia']}")
        print(f"   Fraude: {result['probabilidad_fraude']:.1%}")
        print(f"   Score IA: {result['score_ia']}/100")
        print(
            f"   Coste estimado: €{result['estimacion_coste_min']:.0f} - €{result['estimacion_coste_max']:.0f}"
        )


async def example_5_document_validation():
    """
    Example 5: Document validation for different claim types.

    This demonstrates:
    - Requirement definition per claim type
    - Document completeness scoring
    - Missing document identification
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 5: Document Validation")
    print("=" * 70)

    docs_agent = DocsAgent()

    # Scenario 1: Home claim with partial documents
    result_1 = await docs_agent.validate_documentation(
        siniestro_id="SG202603250A1B2C3D",
        docs=[
            "/documents/damage_photo.jpg",
            "/documents/damage_photo_2.jpg",
        ],
        tipo_siniestro="hogar",
    )

    print(f"\n📄 Home Claim Documentation (Water Damage)")
    print(f"   Total documents provided: {result_1['total_documents_provided']}")
    print(f"   Completitud score: {result_1['completitud_score']}%")
    print(f"   Is complete (≥80%): {result_1['is_complete']}")
    print(f"   Required documents: {result_1['required_documents'][:2]}")
    print(f"   Missing documents: {result_1['missing_documents']}")

    # Scenario 2: Auto claim with all documents
    result_2 = await docs_agent.validate_documentation(
        siniestro_id="SG202603250X1Y2Z3W",
        docs=[
            "/documents/car_damage_1.jpg",
            "/documents/car_damage_2.jpg",
            "/documents/scene_photo.jpg",
            "/documents/id_card.pdf",
            "/documents/quote.pdf",
        ],
        tipo_siniestro="auto",
    )

    print(f"\n📄 Auto Claim Documentation (Collision)")
    print(f"   Total documents provided: {result_2['total_documents_provided']}")
    print(f"   Completitud score: {result_2['completitud_score']}%")
    print(f"   Is complete (≥80%): {result_2['is_complete']}")


async def example_6_assignment_logic():
    """
    Example 6: Assignment of professionals to claims.

    This demonstrates:
    - Gestor (claims adjuster) assignment
    - Perito (expert assessor) assignment
    - Specialist professional assignment
    - Load balancing and location matching
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 6: Professional Assignment")
    print("=" * 70)

    assignment_agent = AssignmentAgent()

    # Home claim requiring expert assessment
    result_1 = await assignment_agent.assign(
        tipo_siniestro="hogar",
        subtipo="incendio",
        prioridad="critica",
        ubicacion="Madrid",
    )

    print(f"\n👥 Home Incendio (Critical)")
    print(f"   Gestor: {result_1['gestor']['nombre']}")
    print(f"     • Especialidad: {result_1['gestor']['especialidad']}")
    print(f"     • Rating: {result_1['gestor']['rating']}/5")
    print(f"     • Carga: {result_1['gestor']['carga_actual']}/{result_1['gestor']['capacidad_maxima']}")

    if result_1.get("perito"):
        print(f"   Perito: {result_1['perito']['nombre']}")
        print(f"     • Tipo: {result_1['perito']['tipo']}")
        print(f"     • Disponible: {result_1['perito']['disponibilidad']}")

    if result_1.get("profesionales"):
        print(f"   Profesionales especializados: {len(result_1['profesionales'])}")
        for prof in result_1["profesionales"]:
            print(f"     • {prof['nombre']} ({prof['tipo']})")

    # Auto claim with specialists
    result_2 = await assignment_agent.assign(
        tipo_siniestro="auto",
        subtipo="colision",
        prioridad="alta",
        ubicacion="Barcelona",
    )

    print(f"\n👥 Auto Colision (High Priority)")
    print(f"   Gestor: {result_2['gestor']['nombre']}")
    print(f"   Profesionales: {len(result_2.get('profesionales', []))}")
    for prof in result_2.get("profesionales", []):
        print(f"     • {prof['nombre']} - {prof['distancia_km']} km away")


async def example_7_agent_registry():
    """
    Example 7: Using the agent registry for monitoring.

    This demonstrates:
    - Agent discovery
    - Status monitoring
    - Statistics gathering
    - Health checks
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 7: Agent Registry & Monitoring")
    print("=" * 70)

    registry = get_registry()

    # Get all agents
    agents = registry.get_all_agents()
    print(f"\n🤖 Registered Agents ({len(agents)} total):")
    for agent in agents:
        print(f"   • {agent['agent_name']}")
        print(f"     - Role: {agent['agent_role']}")
        print(f"     - Type: {agent['model_type']}")
        print(f"     - Color: {agent['color']}")

    # Get system stats
    print(f"\n📊 System Statistics:")
    print(f"   Total agents: {registry.agent_count()}")

    # Health check
    health = await registry.health_check()
    print(f"\n💚 Health Check:")
    print(f"   Healthy agents: {health['healthy_agents']}/{health['total_agents']}")
    for agent_id, details in health["details"].items():
        status_icon = "✅" if details["healthy"] else "❌"
        print(f"   {status_icon} {details['name']}")
        print(f"      Status: {details['status']}")
        print(f"      Processes: {details['process_count']}")
        print(f"      Errors: {details['error_count']}")


async def example_8_complete_workflow():
    """
    Example 8: Complete end-to-end workflow.

    This demonstrates:
    - Customer initiates claim via WhatsApp
    - Automatic processing through orchestrator
    - Professional assignment
    - Status tracking
    """
    print("\n" + "=" * 70)
    print("EXAMPLE 8: Complete End-to-End Workflow")
    print("=" * 70)

    orchestrator = Orchestrator()

    # Step 1: Customer reports claim
    print("\n📱 Step 1: Customer reports via WhatsApp")
    cliente_data = {
        "id": "cliente_final_demo",
        "nombre": "Pedro Sánchez López",
        "tipo_poliza": "auto",
        "ubicacion": "Valencia",
        "telefono": "655000123",
    }

    descripcion = (
        "Tuve un accidente esta mañana. Colisioné con otro coche en una rotonda. "
        "Mi vehículo tiene daños en la parte delantera. El otro conductor tiene datos. "
        "Fotos disponibles."
    )

    result = await orchestrator.process_new_siniestro(
        canal="whatsapp",
        cliente_data=cliente_data,
        descripcion=descripcion,
    )

    if result["status"] == "success":
        siniestro = result["siniestro"]
        siniestro_id = siniestro["id"]

        print(f"   ✅ Siniestro created: {siniestro_id}")

        # Step 2: View classification
        print(f"\n📋 Step 2: Automatic Classification")
        clasificacion = siniestro["clasificacion"]
        print(f"   Type: {clasificacion['tipo_siniestro']}/{clasificacion['subtipo']}")
        print(f"   Urgency: {clasificacion['urgencia']}")
        print(f"   Fraud probability: {clasificacion['probabilidad_fraude']:.1%}")
        print(f"   IA Score: {clasificacion['score_ia']}/100")

        # Step 3: View assignments
        print(f"\n👥 Step 3: Professional Assignments")
        asignaciones = siniestro["asignaciones"]
        print(f"   Gestor: {asignaciones['gestor']['nombre']}")
        if asignaciones.get("perito"):
            print(f"   Perito: {asignaciones['perito']['nombre']}")

        # Step 4: View timeline
        print(f"\n📅 Step 4: Claim Timeline")
        for event in siniestro["timeline"]:
            print(f"   {event['evento']}")

        # Step 5: View customer response
        print(f"\n📲 Step 5: Response to Customer")
        print(f"   {result['respuesta_cliente']}")

        # Step 6: Check system status
        print(f"\n🤖 Step 6: System Status")
        status = await orchestrator.get_agent_status()
        print(f"   Total agents: {status['total_agents']}")
        for agent_id, agent_status in status["agents"].items():
            print(f"   • {agent_status['agent_name']}: {agent_status['status']}")


async def main():
    """Run all examples."""
    print("\n" + "=" * 70)
    print("SegurCaixa Adeslas Multi-Agent Claims System - Examples")
    print("=" * 70)

    try:
        await example_1_new_home_claim()
        await example_2_voice_call()
        await example_3_whatsapp_conversation()
        await example_4_classification_variations()
        await example_5_document_validation()
        await example_6_assignment_logic()
        await example_7_agent_registry()
        await example_8_complete_workflow()

        print("\n" + "=" * 70)
        print("✅ All examples completed successfully!")
        print("=" * 70)

    except Exception as e:
        logger.error(f"Error running examples: {e}", exc_info=True)
        print(f"\n❌ Error: {e}")


if __name__ == "__main__":
    asyncio.run(main())
