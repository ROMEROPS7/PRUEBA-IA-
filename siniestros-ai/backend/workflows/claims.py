"""
SiniestrosAI Workflow Definitions
Claim processing pipelines inspired by DeerFlow task decomposition
and Paperclip approval hierarchies.
"""

import asyncio
import time
import random
from dataclasses import dataclass, field
from typing import List, Optional


# ============================================================
# WORKFLOW STEP DEFINITIONS
# ============================================================

@dataclass
class WorkflowStep:
    id: str = ""
    name: str = ""
    agent_id: str = ""
    action: str = ""
    requires_approval: bool = False
    approver: str = ""
    timeout_seconds: int = 300
    status: str = "pending"  # pending, running, completed, failed, skipped
    result: dict = field(default_factory=dict)
    started_at: float = 0
    completed_at: float = 0


@dataclass
class Workflow:
    id: str = ""
    name: str = ""
    siniestro_id: str = ""
    steps: List[WorkflowStep] = field(default_factory=list)
    current_step: int = 0
    status: str = "pending"  # pending, running, completed, failed
    created_at: float = field(default_factory=time.time)


# ============================================================
# WORKFLOW TEMPLATES
# ============================================================

class WorkflowTemplates:
    """Pre-defined workflow templates for different claim types"""

    @staticmethod
    def auto_standard(siniestro_id: str) -> Workflow:
        """Standard auto claim workflow"""
        return Workflow(
            id=f"WF-AUTO-{random.randint(1000,9999)}",
            name="Tramitacion Auto Estandar",
            siniestro_id=siniestro_id,
            steps=[
                WorkflowStep(id="s1", name="Recepcion y registro",
                             agent_id="recepcionista", action="intake"),
                WorkflowStep(id="s2", name="Clasificacion y triaje",
                             agent_id="clasificador", action="classify"),
                WorkflowStep(id="s3", name="Verificacion documental",
                             agent_id="recepcionista", action="verify_docs"),
                WorkflowStep(id="s4", name="Peritaje fotografico",
                             agent_id="perito", action="photo_assessment"),
                WorkflowStep(id="s5", name="Valoracion de danos",
                             agent_id="perito", action="damage_valuation"),
                WorkflowStep(id="s6", name="Calculo indemnizacion",
                             agent_id="liquidador", action="calculate"),
                WorkflowStep(id="s7", name="Aprobacion pago",
                             agent_id="liquidador", action="approve_payment",
                             requires_approval=True, approver="supervisor"),
                WorkflowStep(id="s8", name="Notificacion cliente",
                             agent_id="comunicador", action="notify_client"),
                WorkflowStep(id="s9", name="Actualizacion KPIs",
                             agent_id="analista", action="update_kpis"),
            ]
        )

    @staticmethod
    def auto_fraud_investigation(siniestro_id: str) -> Workflow:
        """Auto claim with fraud suspicion"""
        return Workflow(
            id=f"WF-FRAUD-{random.randint(1000,9999)}",
            name="Investigacion Antifraude",
            siniestro_id=siniestro_id,
            steps=[
                WorkflowStep(id="f1", name="Deteccion patron sospechoso",
                             agent_id="antifraude", action="pattern_detect"),
                WorkflowStep(id="f2", name="Cruce datos DGT/TIREA",
                             agent_id="antifraude", action="cross_reference"),
                WorkflowStep(id="f3", name="Re-peritaje fotos",
                             agent_id="perito", action="re_assess_photos"),
                WorkflowStep(id="f4", name="Analisis metadatos",
                             agent_id="antifraude", action="metadata_analysis"),
                WorkflowStep(id="f5", name="Informe fraude",
                             agent_id="antifraude", action="fraud_report",
                             requires_approval=True, approver="supervisor"),
                WorkflowStep(id="f6", name="Bloqueo pagos",
                             agent_id="liquidador", action="block_payments"),
                WorkflowStep(id="f7", name="Derivacion a legal",
                             agent_id="recuperador", action="legal_referral"),
                WorkflowStep(id="f8", name="Comunicacion al asegurado",
                             agent_id="comunicador", action="notify_fraud"),
            ]
        )

    @staticmethod
    def hogar_standard(siniestro_id: str) -> Workflow:
        """Home insurance claim workflow"""
        return Workflow(
            id=f"WF-HOGAR-{random.randint(1000,9999)}",
            name="Tramitacion Hogar",
            siniestro_id=siniestro_id,
            steps=[
                WorkflowStep(id="h1", name="Recepcion y registro",
                             agent_id="recepcionista", action="intake"),
                WorkflowStep(id="h2", name="Clasificacion",
                             agent_id="clasificador", action="classify"),
                WorkflowStep(id="h3", name="Valoracion fotos/video",
                             agent_id="perito", action="visual_assessment"),
                WorkflowStep(id="h4", name="Presupuesto reparacion",
                             agent_id="perito", action="repair_estimate"),
                WorkflowStep(id="h5", name="Verificacion cobertura",
                             agent_id="clasificador", action="coverage_check"),
                WorkflowStep(id="h6", name="Liquidacion",
                             agent_id="liquidador", action="calculate"),
                WorkflowStep(id="h7", name="Aprobacion",
                             agent_id="liquidador", action="approve_payment",
                             requires_approval=True, approver="supervisor"),
                WorkflowStep(id="h8", name="Notificacion",
                             agent_id="comunicador", action="notify_client"),
            ]
        )

    @staticmethod
    def siniestro_mayor(siniestro_id: str) -> Workflow:
        """Major claim (>\u20ac20,000) with full coordination"""
        return Workflow(
            id=f"WF-MAYOR-{random.randint(1000,9999)}",
            name="Siniestro Mayor - Protocolo Completo",
            siniestro_id=siniestro_id,
            steps=[
                WorkflowStep(id="m1", name="Alerta siniestro mayor",
                             agent_id="coordinador", action="major_alert"),
                WorkflowStep(id="m2", name="Activacion equipo completo",
                             agent_id="coordinador", action="activate_all"),
                WorkflowStep(id="m3", name="Recepcion urgente",
                             agent_id="recepcionista", action="urgent_intake"),
                WorkflowStep(id="m4", name="Clasificacion critica",
                             agent_id="clasificador", action="critical_classify"),
                WorkflowStep(id="m5", name="Peritaje presencial",
                             agent_id="perito", action="onsite_assessment"),
                WorkflowStep(id="m6", name="Scoring de riesgo",
                             agent_id="analista", action="risk_scoring"),
                WorkflowStep(id="m7", name="Investigacion subrogacion",
                             agent_id="recuperador", action="subrogation_check"),
                WorkflowStep(id="m8", name="Calculo complejo",
                             agent_id="liquidador", action="complex_calculation"),
                WorkflowStep(id="m9", name="Aprobacion direccion",
                             agent_id="supervisor", action="director_approval",
                             requires_approval=True, approver="supervisor"),
                WorkflowStep(id="m10", name="Comunicacion integral",
                             agent_id="comunicador", action="full_communication"),
                WorkflowStep(id="m11", name="Informe ejecutivo",
                             agent_id="analista", action="executive_report"),
            ]
        )


# ============================================================
# WORKFLOW ENGINE
# ============================================================

class WorkflowEngine:
    """Executes workflows step by step, coordinating with AgentEngine"""

    def __init__(self, agent_engine):
        self.agent_engine = agent_engine
        self.active_workflows: dict = {}
        self.completed_workflows: list = []

    def create_workflow(self, siniestro_id: str, tipo: str, amount: float) -> Workflow:
        """Create the right workflow based on claim type and amount"""
        if amount > 20000:
            wf = WorkflowTemplates.siniestro_mayor(siniestro_id)
        elif tipo == "Auto":
            wf = WorkflowTemplates.auto_standard(siniestro_id)
        elif tipo == "Hogar":
            wf = WorkflowTemplates.hogar_standard(siniestro_id)
        else:
            wf = WorkflowTemplates.auto_standard(siniestro_id)  # Default

        self.active_workflows[wf.id] = wf
        return wf

    def get_active_workflows(self) -> list:
        """Get all active workflows as dicts"""
        result = []
        for wf in self.active_workflows.values():
            result.append({
                "id": wf.id,
                "name": wf.name,
                "siniestro_id": wf.siniestro_id,
                "status": wf.status,
                "current_step": wf.current_step,
                "total_steps": len(wf.steps),
                "steps": [{
                    "id": s.id, "name": s.name, "agent_id": s.agent_id,
                    "status": s.status, "requires_approval": s.requires_approval
                } for s in wf.steps]
            })
        return result

    async def execute_step(self, workflow: Workflow) -> bool:
        """Execute the current step of a workflow"""
        if workflow.current_step >= len(workflow.steps):
            workflow.status = "completed"
            return False

        step = workflow.steps[workflow.current_step]
        step.status = "running"
        step.started_at = time.time()

        agent = self.agent_engine.agents.get(step.agent_id)
        if not agent:
            step.status = "failed"
            return False

        # Generate realistic conversation for this step
        conversations = self._generate_step_conversations(step, workflow)
        for sender, receiver, content, mtype in conversations:
            self.agent_engine.send_message(sender, receiver, content, msg_type=mtype)
            await asyncio.sleep(1.0 + random.random() * 1.5)

        # Handle approval steps
        if step.requires_approval:
            self.agent_engine.send_message(
                step.agent_id, step.approver,
                f"Solicito aprobacion para: {step.name} ({workflow.siniestro_id})",
                msg_type="approval"
            )
            await asyncio.sleep(2.0)
            # Auto-approve for demo
            self.agent_engine.send_message(
                step.approver, step.agent_id,
                f"Aprobado: {step.name}. Procede.",
                msg_type="result"
            )

        step.status = "completed"
        step.completed_at = time.time()
        workflow.current_step += 1

        return workflow.current_step < len(workflow.steps)

    def _generate_step_conversations(self, step, workflow):
        """Generate realistic conversations for a workflow step"""
        convs = {
            "intake": [
                (step.agent_id, "clasificador",
                 f"Nuevo siniestro registrado: {workflow.siniestro_id}. Datos verificados.", "task"),
            ],
            "classify": [
                (step.agent_id, "coordinador",
                 f"Clasificacion completada {workflow.siniestro_id}. Prioridad asignada.", "result"),
            ],
            "verify_docs": [
                (step.agent_id, "clasificador",
                 f"Documentacion verificada {workflow.siniestro_id}. Todo en orden.", "result"),
            ],
            "photo_assessment": [
                (step.agent_id, "liquidador",
                 f"Analisis fotografico completado. Danos confirmados.", "result"),
            ],
            "damage_valuation": [
                (step.agent_id, "liquidador",
                 f"Valoracion: Danos estimados calculados.", "result"),
            ],
            "calculate": [
                (step.agent_id, "supervisor",
                 f"Indemnizacion calculada para {workflow.siniestro_id}.", "result"),
            ],
            "approve_payment": [
                (step.agent_id, "supervisor",
                 f"Solicito aprobacion pago {workflow.siniestro_id}.", "approval"),
            ],
            "notify_client": [
                (step.agent_id, "coordinador",
                 f"Cliente notificado via SMS + email. Caso actualizado.", "result"),
            ],
            "update_kpis": [
                (step.agent_id, "supervisor",
                 f"KPIs actualizados. Caso {workflow.siniestro_id} registrado en metricas.", "result"),
            ],
            "pattern_detect": [
                (step.agent_id, "supervisor",
                 f"\u26a0\ufe0f Patron sospechoso detectado en {workflow.siniestro_id}.", "alert"),
            ],
            "cross_reference": [
                (step.agent_id, "coordinador",
                 f"Cruce con bases externas completado. Anomalias encontradas.", "result"),
            ],
            "major_alert": [
                (step.agent_id, "supervisor",
                 f"\ud83d\udea8 ALERTA: Siniestro mayor {workflow.siniestro_id}. Protocolo activado.", "alert"),
            ],
            "risk_scoring": [
                (step.agent_id, "coordinador",
                 f"Scoring de riesgo calculado para {workflow.siniestro_id}.", "result"),
            ],
        }
        return convs.get(step.action, [
            (step.agent_id, "coordinador",
             f"Paso completado: {step.name} para {workflow.siniestro_id}.", "result"),
        ])

    async def run_workflow(self, workflow_id: str):
        """Execute a complete workflow"""
        wf = self.active_workflows.get(workflow_id)
        if not wf:
            return
        wf.status = "running"
        while await self.execute_step(wf):
            await asyncio.sleep(random.uniform(2, 4))
        wf.status = "completed"
        self.completed_workflows.append(wf)
