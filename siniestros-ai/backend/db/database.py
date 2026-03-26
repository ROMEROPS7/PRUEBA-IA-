"""
Database setup and session management for SegurCaixa Adeslas.
"""

from datetime import datetime, timedelta
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from backend.config.settings import settings
from backend.db.models import (
    Base,
    Cliente,
    Poliza,
    Siniestro,
    SiniestroTimeline,
    Documento,
    AgentLog,
    ComunicacionLog,
    TipoPoliza,
    EstadoPoliza,
    TipoSiniestro,
    EstadoSiniestro,
    PrioridadSiniestro,
    CanalApertura,
    TipoEventoTimeline,
    DireccionComunicacion,
    EstadoAgentLog,
)

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
)

# Session factory
SessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for FastAPI to get database session.
    """
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """
    Initialize database with schema and seed demo data.
    """
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed demo data
    async with SessionLocal() as session:
        # Check if demo data already exists
        stmt = select(Cliente)
        result = await session.execute(stmt)
        existing_clients = result.scalars().all()

        if len(existing_clients) == 0:
            # Define realistic client data with Spanish names and details
            clients_data = [
                {
                    "nombre": "María García López",
                    "dni": "12345678A",
                    "email": "maria.garcia@gmail.com",
                    "telefono": "612345678",
                    "ciudad": "Madrid",
                    "direccion": "Calle Mayor 42, 28001 Madrid"
                },
                {
                    "nombre": "Antonio Martínez Ruiz",
                    "dni": "23456789B",
                    "email": "antonio.martinez@gmail.com",
                    "telefono": "623456789",
                    "ciudad": "Barcelona",
                    "direccion": "Passeig de Gràcia 15, 08007 Barcelona"
                },
                {
                    "nombre": "Carmen Fernández Díaz",
                    "dni": "34567890C",
                    "email": "carmen.fernandez@hotmail.com",
                    "telefono": "634567890",
                    "ciudad": "Valencia",
                    "direccion": "Calle Colón 25, 46004 Valencia"
                },
                {
                    "nombre": "José Luis Sánchez García",
                    "dni": "45678901D",
                    "email": "jlsanchez@outlook.com",
                    "telefono": "645678901",
                    "ciudad": "Sevilla",
                    "direccion": "Avenida de la Constitución 5, 41001 Sevilla"
                },
                {
                    "nombre": "Isabel Rodríguez Martín",
                    "dni": "56789012E",
                    "email": "isabel.rodriguez@gmail.com",
                    "telefono": "656789012",
                    "ciudad": "Bilbao",
                    "direccion": "Gran Vía 28, 48001 Bilbao"
                },
                {
                    "nombre": "Francisco Pérez López",
                    "dni": "67890123F",
                    "email": "f.perez@gmail.com",
                    "telefono": "667890123",
                    "ciudad": "Zaragoza",
                    "direccion": "Calle Alfonso I 15, 50001 Zaragoza"
                },
                {
                    "nombre": "Ana Jiménez Flores",
                    "dni": "78901234G",
                    "email": "ana.jimenez@gmail.com",
                    "telefono": "678901234",
                    "ciudad": "Málaga",
                    "direccion": "Paseo de la Farola 32, 29016 Málaga"
                },
                {
                    "nombre": "Manuel Gómez Ortega",
                    "dni": "89012345H",
                    "email": "manuel.gomez@hotmail.com",
                    "telefono": "689012345",
                    "ciudad": "Alicante",
                    "direccion": "Calle Mayor 18, 03001 Alicante"
                },
                {
                    "nombre": "Rosa López Muñoz",
                    "dni": "90123456I",
                    "email": "rosa.lopez@gmail.com",
                    "telefono": "690123456",
                    "ciudad": "Córdoba",
                    "direccion": "Avenida Gran Capitán 22, 14005 Córdoba"
                },
                {
                    "nombre": "David Romero Silva",
                    "dni": "01234567J",
                    "email": "david.romero@gmail.com",
                    "telefono": "701234567",
                    "ciudad": "Valladolid",
                    "direccion": "Calle María de Molina 8, 47001 Valladolid"
                },
            ]

            # Create clients and their policies
            clientes_dict = {}
            polizas_dict = {}
            siniestro_counter = 1

            for idx, client_data in enumerate(clients_data):
                cliente = Cliente(
                    nombre=client_data["nombre"],
                    dni=client_data["dni"],
                    email=client_data["email"],
                    telefono=client_data["telefono"],
                    direccion=client_data["direccion"],
                    created_at=datetime.utcnow() - timedelta(days=180 - idx * 10),
                )
                session.add(cliente)
                await session.flush()
                clientes_dict[idx] = cliente

                # Create 5 policies per type for each client
                policy_types = [
                    (TipoPoliza.HOGAR, "POL-HOG-2024", 45.50, 500),
                    (TipoPoliza.AUTO, "POL-AUT-2024", 78.90, 1000),
                    (TipoPoliza.SALUD, "POL-SAL-2024", 125.00, 2000),
                ]

                for p_idx, (tipo, prefix, prima_base, cobertura) in enumerate(policy_types):
                    for p_num in range(1, 6):
                        pol_num = f"{prefix}-{idx:02d}{p_num:02d}"
                        estado = EstadoPoliza.ACTIVA if p_num <= 4 else EstadoPoliza.VENCIDA
                        fecha_inicio = datetime(2023 - p_num, 1, 1) if tipo == TipoPoliza.HOGAR else \
                                      datetime(2023 - p_num, 6, 15) if tipo == TipoPoliza.AUTO else \
                                      datetime(2024 - p_num, 1, 10)
                        fecha_vencimiento = fecha_inicio + timedelta(days=365 * (3 if estado == EstadoPoliza.ACTIVA else 1))

                        poliza = Poliza(
                            cliente_id=cliente.id,
                            tipo=tipo,
                            numero_poliza=pol_num,
                            estado=estado,
                            cobertura=f"Cobertura {tipo.value} hasta {cobertura}€",
                            prima=prima_base * (1.1 if p_num > 3 else 1.0),
                            fecha_inicio=fecha_inicio,
                            fecha_vencimiento=fecha_vencimiento,
                            detalles={"franquicia": f"{100 * p_num}€", "asistencia": "24/7"},
                            created_at=datetime.utcnow() - timedelta(days=150 - idx * 10),
                        )
                        session.add(poliza)
                        await session.flush()
                        polizas_dict[f"{cliente.id}_{tipo.value}_{p_num}"] = poliza

            await session.flush()

            # Create 30 realistic siniestros
            siniestro_descriptions = [
                # Hogar - Agua
                ("Rotura de tubería en baño principal causa inundación parcial. Afecta baño y dormitorio. Agua proviene de conexión defectuosa bajo pila.", EstadoSiniestro.RESUELTO, 2500, 4800),
                ("Fuga de agua en cocina por manguera desgastada. Dañadas encimeras y parte del suelo. Requiere reemplazo de tuberías y reparación estructura.", EstadoSiniestro.AUTO_GESTIONADO, 1800, 3200),
                ("Inundación por escape en tubería de calefacción. Afecta sótano y almacén adyacente. Daño importante en estructura de hormigón y contenidos.", EstadoSiniestro.EN_GESTION, 4500, 8000),
                ("Entrada de agua por deficiencia en sellado de ventana. Moja pared completa y suelo laminado. Requiere reemplazo de ventana y reparación interior.", EstadoSiniestro.PENDIENTE_DOCS, 800, 2000),
                ("Rotura de cisterna de agua en azotea. Vierte agua en habitación superior del edificio. Afecta a vecino también. Responsabilidad compartida.", EstadoSiniestro.EN_GESTION, 3000, 5500),

                # Hogar - Robo/Hurto
                ("Robo de televisor de 55 pulgadas y joyas diversas en dormitorio principal. Entrada por ventana forzada. Daño en cerrajería. Se reportó a policía.", EstadoSiniestro.RESUELTO, 2000, 4500),
                ("Hurto de bicicleta eléctrica del garaje compartido. Sin signos evidentes de fuerza. Cámara de vigilancia sin grabación. Requiere investigación.", EstadoSiniestro.RECHAZADO, 1500, 3000),
                ("Robo a mano armada en vivienda. Asaltantes ingresaron por puerta trasera. Llevaron dinero, anillos y reloj de oro. Tres testigos disponibles.", EstadoSiniestro.EN_GESTION, 8000, 15000),

                # Hogar - Incendio
                ("Incendio parcial en cocina por fugas de gas. Daños en muebles, paredes y artefactos. Sin lesionados. Bomberos actuaron rápido conteniendo fuego.", EstadoSiniestro.RESUELTO, 5000, 12000),
                ("Pequeño fuego en habitación por cigarro mal apagado. Daño leve en cortinas y parquet. Extinguido con extintor de casa. Sin daño estructural.", EstadoSiniestro.AUTO_GESTIONADO, 600, 1500),

                # Auto - Accidentes
                ("Colisión frontal con vehículo tercero en semáforo rojo. Peugeot 308 vs BMW Serie 5. Daño en parachoques y faro delantero. Responsabilidad tercero.", EstadoSiniestro.EN_GESTION, 8000, 14500),
                ("Choque lateral con taxi en rotonda. Afecta lado derecho completo. Puerta delantera derecha deformada. Sin lesionados. Hay testigos.", EstadoSiniestro.PENDIENTE_PERITO, 6500, 11000),
                ("Accidente por aquaplaning en lluvia fuerte. Vehículo se salió de carril. Golpea contra barrera de seguridad. Daño trasero moderado.", EstadoSiniestro.RESUELTO, 4000, 7500),
                ("Colisión trasera en caravana de tráfico. Vehículo tercero no mantenía distancia. Daño en parachoques trasero y estructura de maletero.", EstadoSiniestro.RESUELTO, 3500, 6800),
                ("Choque con poste de alumbrado al girar esquina. Daño lateral izquierdo importante. Cristal roto. Conductor responsable (no tercero).", EstadoSiniestro.EN_GESTION, 5000, 9000),

                # Auto - Robo/Vandalismo
                ("Robo total del vehículo. Hyundai i30 desaparece de aparcamiento vigilado durante noche. No se recuperó. Documentación enviada.", EstadoSiniestro.RESUELTO, 15000, 25000),
                ("Vandalismo: cristales rotos, pintura rayada y espejos arrancados. Ocurrió en aparcamiento público. Sin testigos. Reportado a policía.", EstadoSiniestro.PENDIENTE_DOCS, 1200, 3000),
                ("Robo de accesorios: neumáticos y llantas sustraídos del vehículo estacionado. Sin forzamiento visible. Investigación en curso.", EstadoSiniestro.EN_GESTION, 2000, 4500),

                # Salud - Consulta/Tratamiento
                ("Tratamiento dental completo: limpieza, extracción y endodoncia. Realizado por dentista especializado. Requiere validación de facturas.", EstadoSiniestro.PENDIENTE_DOCS, 800, 1800),
                ("Hospitalización por apendicitis. Cirugía de urgencia realizada. Ingreso 3 días. Incluye medicamentos y follow-up. Presupuesto incluido.", EstadoSiniestro.RESUELTO, 3500, 6000),
                ("Fractura de brazo: radiografía, yeso y seguimiento. Tres consultas de control. Fisioterapia recomendada. Documentos completos.", EstadoSiniestro.AUTO_GESTIONADO, 1200, 2500),
                ("Revisión oftalmológica anual y compra de gafas graduadas nuevas. Prescripción enviada. Necesita validación de centro certificado.", EstadoSiniestro.PENDIENTE_DOCS, 350, 900),
                ("Resonancia magnética de columna vertebral por dolor crónico. Estudio especializado. Referencia médica incluida. Requiere pre-autorización.", EstadoSiniestro.EN_GESTION, 600, 1500),

                # Salud - Emergencia/Urgencia
                ("Accidente deportivo: esguince de tobillo grado 2. Atendido en urgencias. Radiografía, vendaje funcional y medicamentos. Documentos validados.", EstadoSiniestro.RESUELTO, 450, 1200),
                ("Intoxicación alimentaria: internamiento en urgencias por 4 horas. Análisis de sangre y solución intravenosa. Histórico médico verificado.", EstadoSiniestro.AUTO_GESTIONADO, 600, 1500),
                ("Dolor agudo de espalda: visita a urgencias, tomografía y inyección antiinflamatoria. Medicamentos recetados. Sin complicaciones.", EstadoSiniestro.RESUELTO, 350, 950),

                # Mixtos/Complejos
                ("Incendio en vivienda con lesiones menores a ocupantes. Daño estructural importante. Requiere peritaje tanto de inmueble como de daño corporal.", EstadoSiniestro.EN_GESTION, 15000, 30000),
                ("Accidente automovilístico con lesiones. Vehículo requerirá reparación completa. Ocupantes requieren seguimiento médico prolongado. Caso complejo.", EstadoSiniestro.PENDIENTE_PERITO, 12000, 25000),
            ]

            # Create siniestros distributed across clients and policies
            siniestro_id = 1
            for s_idx, (desc, estado, min_cost, max_cost) in enumerate(siniestro_descriptions):
                cliente_idx = s_idx % 10
                # Determine type based on description
                if any(word in desc for word in ["agua", "rotura", "fuga", "inundación", "tubería"]):
                    tipo = TipoSiniestro.HOGAR
                    policy_key = f"{clientes_dict[cliente_idx].id}_hogar_1"
                elif any(word in desc for word in ["robo", "hurto", "incendio", "fuego"]):
                    tipo = TipoSiniestro.HOGAR
                    policy_key = f"{clientes_dict[cliente_idx].id}_hogar_2"
                elif any(word in desc for word in ["vehículo", "coche", "colisión", "accidente auto", "vandalismo"]):
                    tipo = TipoSiniestro.AUTO
                    policy_key = f"{clientes_dict[cliente_idx].id}_auto_1"
                else:
                    tipo = TipoSiniestro.SALUD
                    policy_key = f"{clientes_dict[cliente_idx].id}_salud_1"

                # Find valid policy
                valid_policy = None
                for key, policy in polizas_dict.items():
                    if policy.cliente_id == clientes_dict[cliente_idx].id and policy.tipo.value == tipo.value:
                        valid_policy = policy
                        break

                if valid_policy is None:
                    continue

                prioridad = [PrioridadSiniestro.BAJA, PrioridadSiniestro.MEDIA, PrioridadSiniestro.ALTA, PrioridadSiniestro.CRITICA][s_idx % 4]
                canal = [CanalApertura.TELEFONO, CanalApertura.WHATSAPP, CanalApertura.EMAIL, CanalApertura.APP][s_idx % 4]
                ia_score = 65 + (s_idx % 35)
                days_ago = 90 - (s_idx % 90)

                siniestro = Siniestro(
                    poliza_id=valid_policy.id,
                    cliente_id=clientes_dict[cliente_idx].id,
                    numero_siniestro=f"SIN-2026-{siniestro_id:06d}",
                    tipo=tipo,
                    descripcion=desc,
                    estado=estado,
                    prioridad=prioridad,
                    canal_apertura=canal,
                    ia_score=ia_score,
                    estimacion_coste_min=float(min_cost),
                    estimacion_coste_max=float(max_cost),
                    fraude_detectado=s_idx % 15 == 0,  # 1 in 15 has fraud
                    gestor_asignado=["Carlos López Martínez", "Isabel Sánchez García", "Juan Rodríguez Pérez", None][s_idx % 4],
                    perito_asignado=["Juan Pérez Moreno", "María López Gutiérrez", None][s_idx % 3] if estado == EstadoSiniestro.PENDIENTE_PERITO else None,
                    modo_automatico=estado in [EstadoSiniestro.AUTO_GESTIONADO, EstadoSiniestro.RESUELTO],
                    created_at=datetime.utcnow() - timedelta(days=days_ago),
                    updated_at=datetime.utcnow() - timedelta(days=max(0, days_ago - 5)),
                )
                session.add(siniestro)
                await session.flush()

                # Add timeline events
                timeline_events = []

                # Event 1: Registro
                timeline_events.append(SiniestroTimeline(
                    siniestro_id=siniestro.id,
                    agente_id="SISTEMA",
                    evento=f"Siniestro registrado por el cliente vía {canal.value}",
                    tipo=TipoEventoTimeline.SISTEMA,
                    created_at=datetime.utcnow() - timedelta(days=days_ago),
                ))

                # Event 2: Clasificación IA
                timeline_events.append(SiniestroTimeline(
                    siniestro_id=siniestro.id,
                    agente_id="CLASSIFIER_IA",
                    evento=f"Clasificado automáticamente por IA: tipo {tipo.value}, urgencia {prioridad.value}, score {ia_score}%",
                    tipo=TipoEventoTimeline.HALLAZGO,
                    created_at=datetime.utcnow() - timedelta(days=days_ago - 1),
                ))

                # Event 3: Asignación gestor (if applicable)
                if siniestro.gestor_asignado:
                    timeline_events.append(SiniestroTimeline(
                        siniestro_id=siniestro.id,
                        agente_id="CASE_MANAGER",
                        evento=f"Gestor asignado: {siniestro.gestor_asignado}",
                        tipo=TipoEventoTimeline.ACCION,
                        created_at=datetime.utcnow() - timedelta(days=days_ago - 2),
                    ))

                # Event 4: Documentación
                if estado in [EstadoSiniestro.PENDIENTE_DOCS, EstadoSiniestro.EN_GESTION, EstadoSiniestro.RESUELTO]:
                    timeline_events.append(SiniestroTimeline(
                        siniestro_id=siniestro.id,
                        agente_id="DOC_PROCESSOR",
                        evento="Documentación solicitada y/o procesada del cliente",
                        tipo=TipoEventoTimeline.ACCION,
                        created_at=datetime.utcnow() - timedelta(days=days_ago - 3),
                    ))

                # Event 5: Perito (if applicable)
                if siniestro.perito_asignado:
                    timeline_events.append(SiniestroTimeline(
                        siniestro_id=siniestro.id,
                        agente_id="PERITAJE",
                        evento=f"Perito asignado: {siniestro.perito_asignado}. Visita programada.",
                        tipo=TipoEventoTimeline.ACCION,
                        created_at=datetime.utcnow() - timedelta(days=days_ago - 4),
                    ))

                # Event 6: Resolución (if applicable)
                if estado == EstadoSiniestro.RESUELTO:
                    payout = (max_cost + min_cost) / 2
                    timeline_events.append(SiniestroTimeline(
                        siniestro_id=siniestro.id,
                        agente_id="RESOLVER",
                        evento=f"Siniestro resuelto: Aprobado. Pago de {payout:.0f}€ procesado.",
                        tipo=TipoEventoTimeline.ACCION,
                        created_at=datetime.utcnow() - timedelta(days=max(0, days_ago - 7)),
                    ))
                elif estado == EstadoSiniestro.RECHAZADO:
                    timeline_events.append(SiniestroTimeline(
                        siniestro_id=siniestro.id,
                        agente_id="RESOLVER",
                        evento="Siniestro rechazado: No cumple condiciones de cobertura según análisis de documentación.",
                        tipo=TipoEventoTimeline.ACCION,
                        created_at=datetime.utcnow() - timedelta(days=max(0, days_ago - 7)),
                    ))

                for event in timeline_events:
                    session.add(event)

                siniestro_id += 1

            await session.flush()

            # Commit all changes
            await session.commit()

    print("Database initialized successfully with comprehensive demo data!")


async def close_db():
    """
    Close database connections.
    """
    await engine.dispose()


__all__ = [
    "engine",
    "SessionLocal",
    "get_db",
    "init_db",
    "close_db",
]
