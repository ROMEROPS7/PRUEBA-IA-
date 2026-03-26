"""
Test script to demonstrate the orchestrator flow.

This script shows how to use the orchestrator's StateGraph
to process a claim end-to-end.

Run with: python -m pytest backend/agents/test_orchestrator_flow.py -v
Or: python -c "import asyncio; from backend.agents.test_orchestrator_flow import *; asyncio.run(test_complete_flow())"
"""

import asyncio
import json
from datetime import datetime
from backend.agents.orchestrator import Orchestrator


async def test_complete_flow():
    """Test the complete orchestrator flow."""
    
    print("\n" + "="*80)
    print("SegurCaixa Adeslas - Orchestrator Flow Test")
    print("="*80 + "\n")
    
    # Initialize orchestrator
    orchestrator = Orchestrator()
    
    # Test data
    siniestro_data = {
        "canal": "whatsapp",
        "cliente_data": {
            "id": "cli_001",
            "nombre": "Juan García López",
            "tipo_poliza": "hogar",
            "ubicacion": "Madrid",
        },
        "descripcion": "Rotura de cristal en ventana principal debido a accidente doméstico",
    }
    
    print("1. Starting claim processing...")
    print(f"   Canal: {siniestro_data['canal']}")
    print(f"   Cliente: {siniestro_data['cliente_data']['nombre']}")
    print(f"   Descripción: {siniestro_data['descripcion']}\n")
    
    # Process through the flow
    result = await orchestrator.process_siniestro(siniestro_data)
    
    if result.get("status") != "success":
        print(f"ERROR: {result.get('error')}")
        return
    
    siniestro_id = result.get("siniestro_id")
    print(f"✓ Siniestro created: {siniestro_id}\n")
    
    # Get flow status
    status = orchestrator.get_flow_status(siniestro_id)
    
    print("2. Flow Execution Summary")
    print(f"   Current Node: {status['current_node']}")
    print(f"   Flow Status: {status['flow_status']}")
    print(f"   Siniestro Estado: {status['siniestro_state']}")
    print(f"   Route Decision: {status['resultado'].get('route', 'N/A')}\n")
    
    print("3. Timeline Events")
    for idx, event in enumerate(status['timeline'], 1):
        timestamp = event.get('timestamp', '?')
        evento = event.get('evento', 'Unknown')
        detalles = event.get('detalles', {})
        print(f"   [{idx}] {timestamp}")
        print(f"       {evento}")
        if detalles:
            for key, value in detalles.items():
                if isinstance(value, (dict, list)):
                    print(f"           {key}: {json.dumps(value, indent=16)}")
                else:
                    print(f"           {key}: {value}")
    
    print("\n4. Flow Definition")
    flow_def = orchestrator.get_flow_definition()
    print(f"   Start Node: {flow_def['start_node']}")
    print(f"   End Nodes: {flow_def['end_nodes']}")
    print(f"   Total Nodes: {len(flow_def['nodes'])}")
    print(f"   Total Edges: {len(flow_def['edges'])}\n")
    
    print("   Nodes:")
    for node in flow_def['nodes']:
        node_type = f"[{node['type'].upper()}]"
        print(f"      {node_type} {node['name']:<30} → {node['next_nodes']}")
    
    print("\n5. Claim Details")
    siniestro = orchestrator.siniestros.get(siniestro_id, {})
    if siniestro:
        classification = siniestro.get('clasificacion', {})
        asignaciones = siniestro.get('asignaciones', {})
        
        if classification:
            print(f"   Classification:")
            print(f"      Type: {classification.get('tipo_siniestro')}")
            print(f"      Urgency: {classification.get('urgencia')}")
            print(f"      Fraud Probability: {classification.get('fraud_probability', 0.0):.2%}")
        
        if asignaciones:
            print(f"   Assignment:")
            gestor = asignaciones.get('gestor', {})
            perito = asignaciones.get('perito', {})
            if gestor:
                print(f"      Gestor: {gestor.get('nombre')} ({gestor.get('id')})")
            if perito:
                print(f"      Perito: {perito.get('nombre')} ({perito.get('id')})")
    
    print("\n" + "="*80)
    print("Test completed successfully!")
    print("="*80 + "\n")


async def test_high_fraud_claim():
    """Test a claim that triggers manual review due to fraud probability."""
    
    print("\n" + "="*80)
    print("Test: High Fraud Probability Claim")
    print("="*80 + "\n")
    
    orchestrator = Orchestrator()
    
    siniestro_data = {
        "canal": "phone",
        "cliente_data": {
            "nombre": "María Rodríguez",
            "tipo_poliza": "hogar",
            "ubicacion": "Barcelona",
        },
        "descripcion": "Daños totales por incendio en toda la vivienda",
    }
    
    print("Processing suspicious claim...")
    result = await orchestrator.process_siniestro(siniestro_data)
    
    if result.get("status") == "success":
        siniestro_id = result.get("siniestro_id")
        status = orchestrator.get_flow_status(siniestro_id)
        
        route = status['resultado'].get('route')
        print(f"✓ Claim routed to: {route}")
        
        if route == "manual_review":
            print("✓ High fraud probability triggered manual review!")
        else:
            print(f"  (Route: {route})")


async def test_critical_urgency_claim():
    """Test a claim that triggers priority processing due to critical urgency."""
    
    print("\n" + "="*80)
    print("Test: Critical Urgency Claim")
    print("="*80 + "\n")
    
    orchestrator = Orchestrator()
    
    siniestro_data = {
        "canal": "email",
        "cliente_data": {
            "nombre": "Carlos Martínez",
            "tipo_poliza": "automovil",
            "ubicacion": "Valencia",
        },
        "descripcion": "Accidente grave con heridos, ambulancia en camino",
    }
    
    print("Processing critical claim...")
    result = await orchestrator.process_siniestro(siniestro_data)
    
    if result.get("status") == "success":
        siniestro_id = result.get("siniestro_id")
        status = orchestrator.get_flow_status(siniestro_id)
        
        route = status['resultado'].get('route')
        print(f"✓ Claim routed to: {route}")
        
        if route == "priority_processing":
            print("✓ Critical urgency triggered priority processing!")
        else:
            print(f"  (Route: {route})")


if __name__ == "__main__":
    # Run all tests
    asyncio.run(test_complete_flow())
    asyncio.run(test_high_fraud_claim())
    asyncio.run(test_critical_urgency_claim())
