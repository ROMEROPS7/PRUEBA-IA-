"""
SiniestrosAI Agent Engine
Inspired by: Ruflo (orchestration), DeerFlow (task decomposition),
Paperclip (org structure), Browser-Use (automation)

Core agent system with:
- Agent-to-agent real-time messaging
- Task decomposition and parallel execution
- Organizational hierarchy with approval workflows
- Event-driven architecture with pub/sub
"""

import asyncio
import json
import time
import random
import uuid
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Callable
from enum import Enum

class AgentState(Enum):
    IDLE = "idle"
    WORKING = "working"
    WALKING = "walking"
    TALKING = "talking"
    BREAK = "break"

class Priority(Enum):
    LOW = "baja"
    MEDIUM = "media"
    HIGH = "alta"
    CRITICAL = "critica"

@dataclass
class Message:
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    sender: str = ""
    receiver: str = ""
    content: str = ""
    msg_type: str = "chat"
    timestamp: float = field(default_factory=time.time)
    data: dict = field(default_factory=dict)

@dataclass
class Task:
    id: str = field(default_factory=lambda: f"TSK-{random.randint(1000,9999)}")
    title: str = ""
    description: str = ""
    assigned_to: str = ""
    created_by: str = ""
    priority: str = "media"
    status: str = "pending"
    siniestro_id: str = ""
    result: dict = field(default_factory=dict)
    created_at: float = field(default_factory=time.time)

@dataclass
class Agent:
    id: str = ""
    name: str = ""
    role: str = ""
    emoji: str = ""
    color: str = ""
    department: str = ""
    state: AgentState = AgentState.IDLE
    current_task: Optional[Task] = None
    message_queue: List[Message] = field(default_factory=list)
    skills: List[str] = field(default_factory=list)
    stats: dict = field(default_factory=lambda: {"tasks_completed": 0, "messages_sent": 0, "accuracy": 0.95})
    position: dict = field(default_factory=lambda: {"room": 0, "x": 0, "y": 0})
    bubble_text: str = ""

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "role": self.role,
            "emoji": self.emoji, "color": self.color, "department": self.department,
            "state": self.state.value, "bubble_text": self.bubble_text,
            "current_task": asdict(self.current_task) if self.current_task else None,
            "stats": self.stats, "position": self.position
        }

@dataclass
class Siniestro:
    id: str = ""
    client: str = ""
    tipo: str = ""
    description: str = ""
    priority: str = "media"
    status: str = "abierto"
    amount: float = 0
    docs: List[str] = field(default_factory=list)
    timeline: List[dict] = field(default_factory=list)
    assigned_agents: List[str] = field(default_factory=list)
    fraud_score: float = 0
    created_at: float = field(default_factory=time.time)

class AgentEngine:
    def __init__(self):
        self.agents = {}
        self.siniestros = {}
        self.message_log = []
        self.event_listeners = {}
        self.conversation_queue = []
        self.running = False
        self._init_agents()
        self._init_sample_siniestros()

    def _init_agents(self):
        agent_defs = [
            ("recepcionista","Recepcionista","Recepcion y primer contacto","📞","#0F77AE","RECEPCION",["intake","verification","routing"],0),
            ("clasificador","Clasificador","Clasificacion y triaje","🏷️","#6F42C1","CLASIFICACION",["classification","priority","routing"],1),
            ("perito","Perito Virtual","Peritacion y valoracion","🔍","#FD7E14","PERITAJE",["photo_analysis","damage_assessment","valuation"],2),
            ("liquidador","Liquidador","Calculo y pago","💰","#28A745","LIQUIDACIONES",["calculation","payment","authorization"],3),
            ("antifraude","Antifraude","Deteccion de fraude","🛡️","#DC3545","ANTIFRAUDE",["pattern_detection","cross_reference","alert"],4),
            ("comunicador","Comunicador","Comunicaciones al cliente","✉️","#17A2B8","COMUNICACIONES",["sms","email","whatsapp","push"],5),
            ("coordinador","Coordinador","Coordinacion de agentes","🔄","#20C997","SALA REUNIONES",["orchestration","sync","pipeline"],6),
            ("analista","Analista","Analisis y KPIs","📊","#E83E8C","ANALISIS",["risk_scoring","kpi","reporting"],7),
            ("recuperador","Recuperador","Subrogacion y recobro","🔁","#6610F2","ARCHIVO / SERVIDORES",["subrogation","recovery","legal"],9),
            ("supervisor","Supervisor","Supervision del sistema","👁️","#64748B","SUPERVISION",["monitoring","approval","escalation"],10),
        ]
        for aid,name,role,emoji,color,dept,skills,room in agent_defs:
            self.agents[aid] = Agent(id=aid,name=name,role=role,emoji=emoji,color=color,department=dept,skills=skills,position={"room":room,"x":random.randint(3,10),"y":random.randint(3,7)},bubble_text="Listo para trabajar")

    def _init_sample_siniestros(self):
        samples = [
            ("SIN-2024-00147","Maria Lopez Garcia","Auto","Colision trasera en M-30","alta",8450,["Parte_amistoso.pdf","Foto_dano_1.jpg","Foto_dano_2.jpg"]),
            ("SIN-2024-00146","Juan Rodriguez","Hogar","Rotura tuberia en cocina","media",3200,["Fotos_cocina.zip","Presupuesto.pdf"]),
            ("SIN-2024-00144","Pedro Gomez","Auto","Reclamacion robo total BMW X3","alta",15800,["Denuncia.pdf","Fotos_vehiculo.jpg"]),
            ("SIN-2024-00143","Laura Fernandez","Negocio","Incendio en local comercial","alta",45000,["Informe_bomberos.pdf","Inventario.xlsx"]),
        ]
        for sid,client,tipo,desc,prio,amount,docs in samples:
            self.siniestros[sid] = Siniestro(id=sid,client=client,tipo=tipo,description=desc,priority=prio,amount=amount,docs=docs,status="abierto")

    def on(self, event, callback):
        if event not in self.event_listeners: self.event_listeners[event] = []
        self.event_listeners[event].append(callback)

    def emit(self, event, data):
        for cb in self.event_listeners.get(event, []):
            try: cb(data)
            except Exception as e: print(f"Event handler error: {e}")

    def send_message(self, sender_id, receiver_id, content, msg_type="chat", data=None):
        msg = Message(sender=sender_id, receiver=receiver_id, content=content, msg_type=msg_type, data=data or {})
        self.message_log.append(msg)
        if receiver_id in self.agents: self.agents[receiver_id].message_queue.append(msg)
        sender = self.agents.get(sender_id)
        receiver = self.agents.get(receiver_id)
        if sender:
            sender.stats["messages_sent"] += 1
            sender.bubble_text = content[:60]
            sender.state = AgentState.TALKING
        conv = {"type":"agent_conversation","sender":{"id":sender_id,"name":sender.name if sender else sender_id,"emoji":sender.emoji if sender else "🤖"},"receiver":{"id":receiver_id,"name":receiver.name if receiver else receiver_id,"emoji":receiver.emoji if receiver else "🤖"},"content":content,"msg_type":msg_type,"timestamp":time.time()}
        self.conversation_queue.append(conv)
        self.emit("message", conv)
        return msg

    def get_conversations(self, since=0):
        return [c for c in self.conversation_queue if c["timestamp"] > since][-20:]

    def process_siniestro(self, siniestro_id):
        sin = self.siniestros.get(siniestro_id)
        if not sin: return
        self.send_message("coordinador","recepcionista",f"Nuevo siniestro {sin.id}: {sin.description}. Inicia recepcion.",msg_type="task",data={"siniestro_id":sin.id})
        tasks = [
            Task(title="Recepcion y verificacion",assigned_to="recepcionista",created_by="coordinador",siniestro_id=sin.id,priority=sin.priority),
            Task(title="Clasificacion del siniestro",assigned_to="clasificador",created_by="coordinador",siniestro_id=sin.id,priority=sin.priority),
        ]
        if sin.tipo == "Auto":
            tasks.append(Task(title="Peritaje fotografico vehiculo",assigned_to="perito",created_by="coordinador",siniestro_id=sin.id,priority=sin.priority))
        if sin.amount > 5000:
            tasks.append(Task(title="Analisis antifraude",assigned_to="antifraude",created_by="coordinador",siniestro_id=sin.id,priority=sin.priority))
        tasks.extend([
            Task(title="Calculo indemnizacion",assigned_to="liquidador",created_by="coordinador",siniestro_id=sin.id,priority=sin.priority),
            Task(title="Notificacion al cliente",assigned_to="comunicador",created_by="coordinador",siniestro_id=sin.id,priority=sin.priority),
            Task(title="Actualizacion KPIs",assigned_to="analista",created_by="coordinador",siniestro_id=sin.id,priority=sin.priority),
        ])
        for task in tasks:
            agent = self.agents.get(task.assigned_to)
            if agent:
                agent.current_task = task
                agent.state = AgentState.WORKING
                sin.assigned_agents.append(task.assigned_to)
        return tasks

    def generate_conversation_scenario(self):
        scenarios = [
            [("recepcionista","clasificador","Te paso SIN-00147. Accidente auto en M-30.","task"),("clasificador","perito","Peritaje urgente SIN-00147. 3 fotos.","task"),("perito","liquidador","Peritaje OK. Valoracion: 3200 EUR.","result"),("liquidador","supervisor","Solicito aprobacion pago 3200 EUR.","approval"),("supervisor","liquidador","Aprobado. Procesa el pago.","result"),("liquidador","comunicador","Pago aprobado. Notifica a Maria Lopez.","task")],
            [("antifraude","supervisor","ALERTA: Patron sospechoso SIN-00144.","alert"),("supervisor","antifraude","Investiga a fondo. Cruza datos DGT.","task"),("antifraude","coordinador","Re-analisis fotos SIN-00144.","task"),("perito","antifraude","Metadatos no coinciden. Fraude.","result"),("supervisor","liquidador","BLOQUEA pagos SIN-00144.","task")],
            [("recepcionista","coordinador","Siniestro mayor: incendio. 45000 EUR.","alert"),("coordinador","clasificador","Prioridad maxima SIN-00143.","task"),("coordinador","perito","Peritaje presencial necesario.","task"),("analista","coordinador","Scoring 72%. Tramitacion rapida.","result"),("coordinador","recuperador","Subrogacion si hay terceros.","task")],
            [("analista","supervisor","KPI: 87 NPS, 73% auto, 4.2h media.","result"),("comunicador","coordinador","342 llamadas. 98% satisfaccion.","result"),("coordinador","supervisor","12 nuevos, 8 resueltos por IA.","result"),("recuperador","liquidador","Recobro 12400 EUR exitoso.","result")],
        ]
        return random.choice(scenarios)

    async def run_simulation(self):
        self.running = True
        scenario_interval = 8
        last_scenario = time.time()
        while self.running:
            now = time.time()
            if now - last_scenario > scenario_interval:
                scenario = self.generate_conversation_scenario()
                for sender,receiver,content,mtype in scenario:
                    await asyncio.sleep(1.5 + random.random())
                    if not self.running: break
                    self.send_message(sender, receiver, content, msg_type=mtype)
                last_scenario = now
                scenario_interval = random.randint(6, 12)
            for agent in self.agents.values():
                if random.random() < 0.02:
                    if agent.state == AgentState.IDLE:
                        agent.state = random.choice([AgentState.WALKING, AgentState.BREAK])
                    elif agent.state in (AgentState.WALKING, AgentState.BREAK):
                        agent.state = AgentState.WORKING
                        agent.bubble_text = random.choice(["Procesando...","Analizando...","Verificando...","Actualizando..."])
            await asyncio.sleep(0.5)

    def stop(self):
        self.running = False

    def get_state(self):
        return {
            "agents": {k: v.to_dict() for k, v in self.agents.items()},
            "siniestros": {k: asdict(v) for k, v in self.siniestros.items()},
            "recent_conversations": self.get_conversations(time.time() - 60),
            "stats": {
                "total_messages": len(self.message_log),
                "active_agents": sum(1 for a in self.agents.values() if a.state != AgentState.IDLE),
                "open_siniestros": sum(1 for s in self.siniestros.values() if s.status == "abierto"),
            }
        }
