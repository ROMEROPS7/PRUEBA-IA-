// =============================================================================
// MULTI-AGENT COORDINATOR - Coordinador Multi-Agente de SiniestrosAI
// El cerebro que coordina la comunicacion entre TODOS los agentes, previene
// conflictos, resuelve desacuerdos y asegura consenso en decisiones criticas.
// =============================================================================

const { v4: uuidv4 } = require('uuid') || { v4: () => `coord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function generarId(prefijo = 'coord') {
  return `${prefijo}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function fechaHoy() {
  return new Date().toISOString().split('T')[0];
}

function fechaRelativa(diasAtras) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString().split('T')[0];
}

function timestampRelativo(diasAtras, horasAtras = 0, minutosAtras = 0) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  d.setHours(d.getHours() - horasAtras);
  d.setMinutes(d.getMinutes() - minutosAtras);
  return d.toISOString();
}

function randomEntre(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------------------------------------------------------------------------
// Registro maestro de todos los agentes del sistema
// ---------------------------------------------------------------------------

const AGENTES_SISTEMA = [
  { id: 'main', nombre: 'Recepcionista Principal', rol: 'Recepcion y triaje de siniestros' },
  { id: 'vigilante', nombre: 'Vigilante', rol: 'Monitorizacion y seguimiento de expedientes' },
  { id: 'negociador', nombre: 'Negociador', rol: 'Negociacion con proveedores y talleres' },
  { id: 'vendedor', nombre: 'Vendedor', rol: 'Cross-selling y upselling a clientes' },
  { id: 'ceo', nombre: 'CEO Virtual', rol: 'Gestion ejecutiva y estrategia' },
  { id: 'financiero', nombre: 'CFO Virtual', rol: 'Control financiero y presupuestal' },
  { id: 'legal', nombre: 'Legal', rol: 'Cumplimiento normativo y juridico' },
  { id: 'riesgo', nombre: 'Riesgo', rol: 'Evaluacion y gestion de riesgos' },
  { id: 'marketing', nombre: 'Marketing', rol: 'Campanas y comunicacion de marca' },
  { id: 'rrhh', nombre: 'RRHH', rol: 'Gestion de talento y personas' },
  { id: 'it', nombre: 'IT', rol: 'Infraestructura y tecnologia' },
  { id: 'compras', nombre: 'Compras', rol: 'Adquisiciones y gestion de proveedores' },
  { id: 'nps', nombre: 'NPS', rol: 'Satisfaccion del cliente y feedback' },
  { id: 'retencion', nombre: 'Retencion', rol: 'Retencion de clientes en riesgo de fuga' },
  { id: 'recobro', nombre: 'Recobro', rol: 'Gestion de cobros y recuperaciones' },
  { id: 'rechazos', nombre: 'Rechazos', rol: 'Gestion de reclamaciones rechazadas' },
  { id: 'investigacion', nombre: 'Investigacion', rol: 'Investigacion de siniestros sospechosos' },
  { id: 'subrogacion', nombre: 'Subrogacion', rol: 'Recuperacion frente a terceros' },
  { id: 'board', nombre: 'Board', rol: 'Consejo de administracion y gobernanza' },
  { id: 'expansion', nombre: 'Expansion', rol: 'Expansion geografica y de mercado' },
  { id: 'innovacion', nombre: 'Innovacion', rol: 'I+D y nuevas tecnologias' },
  { id: 'crisis', nombre: 'Crisis', rol: 'Gestion de crisis y contingencias' }
];

// ---------------------------------------------------------------------------
// Conversaciones inter-agente pre-pobladas
// ---------------------------------------------------------------------------

const conversaciones = [
  {
    id: generarId('conv'),
    agentes_participantes: ['investigacion', 'legal'],
    asunto: 'Caso sospechoso SIN-2024-4521: posible fraude organizado en poliza de hogar',
    mensajes: [
      { de: 'investigacion', para: 'legal', contenido: 'He detectado un patron inusual en el siniestro SIN-2024-4521. El asegurado reporto un robo en vivienda, pero las fotos del parte muestran inconsistencias con la fecha declarada. Ademas, la misma direccion tuvo un siniestro similar hace 14 meses con otra aseguradora.', timestamp: timestampRelativo(0, 3, 45) },
      { de: 'legal', para: 'investigacion', contenido: 'Revisando el marco legal: podemos solicitar informes de TIREA para verificar el historial. Si se confirma fraude, debemos presentar denuncia en un plazo de 30 dias desde la deteccion. Necesito que documentes todas las evidencias con cadena de custodia digital.', timestamp: timestampRelativo(0, 3, 30) },
      { de: 'investigacion', para: 'legal', contenido: 'Ya he solicitado el informe TIREA. Mientras tanto, he cruzado datos con nuestra red de deteccion: el beneficiario tiene vinculacion con otros 3 siniestros en los ultimos 2 anos, todos con patrones similares. Scoring de fraude: 87/100.', timestamp: timestampRelativo(0, 2, 15) },
      { de: 'legal', para: 'investigacion', contenido: 'Con un scoring de 87 y evidencia de patron, recomiendo: 1) Suspender el pago inmediatamente conforme al articulo 19 LCS, 2) Notificar al asegurado la investigacion en curso, 3) Preparar informe pericial para posible judicializacion. Procedo con la notificacion formal?', timestamp: timestampRelativo(0, 1, 50) },
      { de: 'investigacion', para: 'legal', contenido: 'De acuerdo. Ademas sugiero coordinar con el Agente de Crisis por si el asegurado escala a medios de comunicacion. He visto que tiene 45.000 seguidores en redes sociales. Debemos estar preparados.', timestamp: timestampRelativo(0, 1, 20) }
    ],
    estado: 'activa',
    decision_final: null,
    consenso_alcanzado: false,
    prioridad: 'alta',
    fecha_inicio: timestampRelativo(0, 3, 45)
  },
  {
    id: generarId('conv'),
    agentes_participantes: ['negociador', 'compras'],
    asunto: 'Renegociacion contrato con TallerPlus S.L. - Descuento por volumen Q2',
    mensajes: [
      { de: 'compras', para: 'negociador', contenido: 'TallerPlus S.L. ha enviado su propuesta para Q2: mantenimiento de precios actuales (+2% IPC). Dado que hemos derivado 340 reparaciones este trimestre (vs 280 previsto), creo que tenemos margen para pedir descuento por volumen.', timestamp: timestampRelativo(0, 5, 30) },
      { de: 'negociador', para: 'compras', contenido: 'Analizando los datos: nuestro volumen les situa como su 2do cliente mas importante. Mi estrategia de negociacion seria: ofrecer compromiso de 400 reparaciones en Q2 a cambio de descuento del 8%. Punto de salida: 5% minimo. Tengo datos de 3 talleres alternativos por si necesitamos BATNA.', timestamp: timestampRelativo(0, 5, 0) },
      { de: 'compras', para: 'negociador', contenido: 'Me parece agresivo pero alcanzable. Los talleres alternativos que tengo son: AutoFix (6% mas caro, pero mejor calidad), ReparaMax (10% mas barato, pero tiempo de entrega +2 dias), y MecaniPro (precios similares, sin historial con nosotros). Sugiero usar ReparaMax como referencia en la negociacion.', timestamp: timestampRelativo(0, 4, 20) },
      { de: 'negociador', para: 'compras', contenido: 'Perfecto. He modelado 3 escenarios de negociacion. Escenario optimo: 8% descuento + mantenimiento de SLA. Escenario aceptable: 5% descuento + mejora de SLA a 48h. Escenario minimo: 3% descuento + prioridad en cola. Programo reunion virtual para manana a las 10:00?', timestamp: timestampRelativo(0, 3, 45) },
      { de: 'compras', para: 'negociador', contenido: 'Confirmo reunion manana 10:00. Preparo el dossier con volumenes historicos y proyecciones Q2. Una cosa: Legal me ha indicado que el contrato actual vence en 45 dias, asi que tenemos cierta urgencia pero no debemos mostrarlo.', timestamp: timestampRelativo(0, 3, 10) },
      { de: 'negociador', para: 'compras', contenido: 'Entendido. No mostraremos la urgencia del vencimiento. Usare la tecnica de anclaje alto: empezare pidiendo 12% para anclar, y cederemos hasta el 8% como si fuera una gran concesion. Estoy listo.', timestamp: timestampRelativo(0, 2, 30) }
    ],
    estado: 'activa',
    decision_final: null,
    consenso_alcanzado: false,
    prioridad: 'media',
    fecha_inicio: timestampRelativo(0, 5, 30)
  },
  {
    id: generarId('conv'),
    agentes_participantes: ['ceo', 'financiero'],
    asunto: 'Revision presupuestal Q2: reasignacion de fondos por incremento de siniestralidad catastrofica',
    mensajes: [
      { de: 'financiero', para: 'ceo', contenido: 'Alerta presupuestal: la siniestralidad catastrofica de enero-febrero ha consumido el 78% del presupuesto anual de reservas para catastrofes. Las inundaciones de la zona levantina generaron 2.340 siniestros adicionales no previstos. Necesitamos reasignar fondos urgentemente.', timestamp: timestampRelativo(0, 6, 0) },
      { de: 'ceo', para: 'financiero', contenido: 'Entendido. Cual es el deficit exacto y que opciones de reasignacion propones? Necesito ver el impacto en cada departamento antes de tomar una decision.', timestamp: timestampRelativo(0, 5, 30) },
      { de: 'financiero', para: 'ceo', contenido: 'Deficit estimado: 4.2M EUR. Opciones: A) Reasignar 2M de presupuesto de expansion + 2.2M de marketing (impacto: retraso en expansion a Portugal de 6 meses). B) Activar linea de credito de 4.2M (coste financiero: 180K en intereses). C) Combinacion: 2M de marketing + 2.2M de credito (intereses: 95K, expansion intacta).', timestamp: timestampRelativo(0, 5, 0) },
      { de: 'ceo', para: 'financiero', contenido: 'Consulte con el Board Agent y prefieren la opcion C para no sacrificar la expansion. Pero necesito que Marketing confirme que pueden operar con 2M menos. Puedes coordinar con Marketing y darme un analisis de impacto en 24h?', timestamp: timestampRelativo(0, 4, 0) },
      { de: 'financiero', para: 'ceo', contenido: 'Coordinando con Marketing ahora. Dato adicional: el Agente de Riesgo me informa que la probabilidad de nuevos eventos catastroficos en Q2 es del 35% segun modelos climaticos. Sugiero crear una reserva contingente adicional de 1M por precaucion.', timestamp: timestampRelativo(0, 3, 0) }
    ],
    estado: 'activa',
    decision_final: null,
    consenso_alcanzado: false,
    prioridad: 'critica',
    fecha_inicio: timestampRelativo(0, 6, 0)
  },
  {
    id: generarId('conv'),
    agentes_participantes: ['vigilante', 'main'],
    asunto: 'Expediente SIN-2024-4498 estancado 72h sin asignacion de perito - Urgente',
    mensajes: [
      { de: 'vigilante', para: 'main', contenido: 'ALERTA: El expediente SIN-2024-4498 (siniestro de hogar, inundacion, cliente premium) lleva 72 horas sin perito asignado. El SLA para clientes premium es de 24h. Estamos en incumplimiento grave. El cliente ha llamado 4 veces preguntando por el estado.', timestamp: timestampRelativo(0, 2, 30) },
      { de: 'main', para: 'vigilante', contenido: 'Revisando el caso: el problema es que todos los peritos de la zona de Valencia estan colapsados por las inundaciones. Tenemos 180 expedientes pendientes de peritaje en la zona. He intentado asignar peritos de zonas cercanas pero estan a mas de 200km.', timestamp: timestampRelativo(0, 2, 0) },
      { de: 'vigilante', para: 'main', contenido: 'No es aceptable para un cliente premium. Propongo: 1) Activar peritacion virtual por videoconferencia como solucion inmediata, 2) Solicitar al Agente de Compras la contratacion urgente de peritos freelance en la zona, 3) Llamar al cliente en los proximos 30 minutos para informar y disculparnos.', timestamp: timestampRelativo(0, 1, 30) },
      { de: 'main', para: 'vigilante', contenido: 'Acepto las 3 propuestas. He programado la videollamada de peritacion para manana a las 9:00. He notificado a Compras para los peritos freelance. Yo me encargo de llamar al cliente ahora mismo con la actualizacion. Tambien he pedido al NPS Agent que haga seguimiento de satisfaccion especial en este caso.', timestamp: timestampRelativo(0, 1, 0) }
    ],
    estado: 'activa',
    decision_final: null,
    consenso_alcanzado: true,
    prioridad: 'critica',
    fecha_inicio: timestampRelativo(0, 2, 30)
  },
  {
    id: generarId('conv'),
    agentes_participantes: ['marketing', 'vendedor'],
    asunto: 'Calidad de leads generados por campana "SeguroFacil" - Revision conjunta',
    mensajes: [
      { de: 'vendedor', para: 'marketing', contenido: 'Necesito hablar sobre la calidad de los leads de la campana "SeguroFacil". De los ultimos 150 leads recibidos, solo 23 han convertido (15.3%). Nuestra tasa habitual es del 28%. Los leads vienen con datos incompletos y muchos son perfiles que no encajan con nuestro producto.', timestamp: timestampRelativo(0, 4, 0) },
      { de: 'marketing', para: 'vendedor', contenido: 'Entiendo la preocupacion. La campana "SeguroFacil" tiene un CPA de 12 EUR (vs 35 EUR de campanas premium). El volumen es mayor pero reconozco que la calidad es menor. Estamos usando audiencias amplias en Meta Ads para maximizar alcance. Puedo afinar la segmentacion si me das el perfil exacto que convierte.', timestamp: timestampRelativo(0, 3, 30) },
      { de: 'vendedor', para: 'marketing', contenido: 'El perfil que mejor convierte: propietario de vivienda, 35-55 anos, ingresos >40K, zona urbana, sin siniestro en ultimos 2 anos. Los leads que peor convierten: menores de 25, alquiler, buscan solo precio minimo. Si puedes excluir el segundo perfil, la conversion deberia subir al 25% al menos.', timestamp: timestampRelativo(0, 3, 0) },
      { de: 'marketing', para: 'vendedor', contenido: 'Perfecto, aplico esos filtros de segmentacion. El CPA subira a unos 22 EUR pero si la conversion sube al 25% el coste por venta baja de 78 EUR a 88 EUR... Hmm, no mejora tanto. Propuesta alternativa: mantengo la campana amplia PERO implemento un lead scoring automatico que te entregue solo los leads >60 puntos. El resto van a nurturing automatico por email.', timestamp: timestampRelativo(0, 2, 30) },
      { de: 'vendedor', para: 'marketing', contenido: 'Me encanta esa propuesta. Lead scoring + nurturing es la mejor combinacion. Yo me encargo de los >60 puntos manualmente y los <60 los trabaja el bot de nurturing. Asi no desperdiciamos ningun lead y yo me centro en los que tienen mas probabilidad de cerrar. Cuando puedes implementarlo?', timestamp: timestampRelativo(0, 2, 0) },
      { de: 'marketing', para: 'vendedor', contenido: 'Puedo tener el lead scoring activo en 48h. El nurturing por email ya tengo las secuencias preparadas, solo necesito conectar el trigger. Lo tendremos todo operativo para el lunes. Te envio informe semanal de calidad de leads a partir de entonces.', timestamp: timestampRelativo(0, 1, 30) }
    ],
    estado: 'activa',
    decision_final: null,
    consenso_alcanzado: true,
    prioridad: 'media',
    fecha_inicio: timestampRelativo(0, 4, 0)
  }
];

// ---------------------------------------------------------------------------
// Conflictos entre agentes pre-poblados
// ---------------------------------------------------------------------------

const conflictos = [
  {
    id: generarId('conf'),
    agente_a: 'negociador',
    agente_b: 'legal',
    asunto: 'Negociador acepto clausula de responsabilidad limitada que Legal considera ilegal',
    posicion_a: 'La clausula es estandar en el sector y nos ahorra 15.000 EUR anuales en primas de responsabilidad',
    posicion_b: 'La clausula viola el articulo 76 de la Ley de Contrato de Seguro y nos expone a sanciones de la DGSFP',
    resolucion: 'Legal tiene razon: la clausula es nula de pleno derecho. Se renegocia el contrato sin la clausula. Se actualiza la base de conocimiento del Negociador para evitar aceptar clausulas similares en el futuro.',
    resuelto_por: 'coordinador',
    fecha: fechaRelativa(25),
    estado: 'resuelto',
    aprendizaje: 'El Negociador ahora consulta automaticamente con Legal antes de aceptar cualquier clausula de responsabilidad'
  },
  {
    id: generarId('conf'),
    agente_a: 'vendedor',
    agente_b: 'retencion',
    asunto: 'Ambos agentes contactaron al mismo cliente el mismo dia con ofertas diferentes',
    posicion_a: 'El cliente estaba en mi pipeline de cross-selling. Tenia programada la llamada con oferta de seguro de vida.',
    posicion_b: 'El cliente entro en mi lista de riesgo de fuga por impago. Le ofreci descuento del 15% en la renovacion para retenerlo.',
    resolucion: 'Se implementa un sistema de "bloqueo de cliente" donde cuando un agente inicia interaccion, los demas ven el bloqueo y coordinan. Retencion tenia prioridad porque el riesgo de fuga era inminente.',
    resuelto_por: 'coordinador',
    fecha: fechaRelativa(20),
    estado: 'resuelto',
    aprendizaje: 'Se creo el protocolo de interaccion unica: un solo agente contacta al cliente en ventanas de 48h'
  },
  {
    id: generarId('conf'),
    agente_a: 'financiero',
    agente_b: 'expansion',
    asunto: 'CFO bloquea presupuesto de expansion a Portugal por riesgo financiero',
    posicion_a: 'La expansion a Portugal requiere 3.2M EUR y nuestro ratio de solvencia quedaria por debajo del minimo regulatorio',
    posicion_b: 'El mercado portugues tiene una oportunidad unica: el competidor principal se retira y podemos captar 40.000 clientes en 18 meses',
    resolucion: 'Compromiso: expansion gradual en 3 fases. Fase 1 con 800K EUR (Lisboa) para validar mercado. Si los KPIs son positivos en 6 meses, se activan fases 2 y 3. El ratio de solvencia se mantiene dentro de limites.',
    resuelto_por: 'ceo + board',
    fecha: fechaRelativa(18),
    estado: 'resuelto',
    aprendizaje: 'Para expansiones geograficas se requiere modelo de validacion por fases con gates de aprobacion financiera'
  },
  {
    id: generarId('conf'),
    agente_a: 'investigacion',
    agente_b: 'nps',
    asunto: 'Investigacion quiere interrogar a cliente premium que NPS identifica como promotor clave',
    posicion_a: 'El cliente tiene indicadores de fraude en su ultimo siniestro (scoring 72/100). Necesito solicitar documentacion adicional y realizar entrevista.',
    posicion_b: 'Este cliente es uno de nuestros top 50 promotores con NPS de 10. Tiene 5 polizas activas por valor de 12.000 EUR/ano. Una investigacion agresiva podria hacernos perder un cliente valioso.',
    resolucion: 'Investigacion procede pero con enfoque "guante de seda": se solicita documentacion de forma amable y no confrontativa, se asigna gestor dedicado, y se ofrece una experiencia premium durante el proceso. Si el fraude se descarta, se ofrece disculpa y beneficio compensatorio.',
    resuelto_por: 'coordinador + ceo',
    fecha: fechaRelativa(15),
    estado: 'resuelto',
    aprendizaje: 'Para clientes premium con scoring de fraude <80, se aplica protocolo de investigacion discreto. Solo para >80 se aplica protocolo estandar.'
  },
  {
    id: generarId('conf'),
    agente_a: 'rrhh',
    agente_b: 'it',
    asunto: 'RRHH quiere contratar 5 desarrolladores pero IT prefiere automatizar con IA',
    posicion_a: 'Necesitamos 5 desarrolladores para el backlog de 23 proyectos pendientes. El time-to-market actual es inaceptable.',
    posicion_b: 'Con inversion de 80K en herramientas de IA de desarrollo, podemos resolver el 60% del backlog sin contratar. Coste de 5 devs: 300K/ano.',
    resolucion: 'Solucion hibrida: contratar 2 desarrolladores senior + invertir 60K en herramientas de IA. Los seniors guian la IA y manejan proyectos criticos. Se re-evalua en 3 meses.',
    resuelto_por: 'ceo',
    fecha: fechaRelativa(12),
    estado: 'resuelto',
    aprendizaje: 'Las decisiones de contratacion vs automatizacion siempre requieren evaluacion combinada de RRHH + IT + Financiero'
  },
  {
    id: generarId('conf'),
    agente_a: 'marketing',
    agente_b: 'legal',
    asunto: 'Marketing lanzo campana con claim "El seguro mas barato de Espana" sin validacion legal',
    posicion_a: 'El claim genera un 40% mas de clics y la conversion ha subido un 25%. Es una practica habitual en el sector.',
    posicion_b: 'El claim es publicidad enganosa segun la Ley General de Publicidad. No somos el seguro mas barato en todas las categorias. Riesgo de sancion de hasta 100.000 EUR por la CNMC.',
    resolucion: 'Se retira el claim inmediatamente y se sustituye por "Uno de los seguros con mejor relacion calidad-precio". Marketing debe pasar toda campana por Legal antes de publicar. Se crea checklist de cumplimiento publicitario.',
    resuelto_por: 'legal + coordinador',
    fecha: fechaRelativa(10),
    estado: 'resuelto',
    aprendizaje: 'Todo material publicitario requiere validacion de Legal. Se implementa workflow automatico de aprobacion.'
  },
  {
    id: generarId('conf'),
    agente_a: 'recobro',
    agente_b: 'retencion',
    asunto: 'Recobro inicio procedimiento de cobro contra cliente que Retencion estaba recuperando',
    posicion_a: 'El cliente debe 3 cuotas (2.400 EUR). Segun protocolo, a los 90 dias se inicia recobro formal con carta de requerimiento.',
    posicion_b: 'El cliente me explico que tuvo problemas financieros temporales por un ERE. Ya acordo un plan de pagos conmigo y estaba recuperando la relacion. La carta de recobro destruyo la confianza que habia construido.',
    resolucion: 'Se implementa la regla de "verificar estado de retencion antes de recobro". Si un cliente esta en proceso de retencion activo, Recobro se coordina con Retencion antes de enviar cualquier comunicacion. Se contacta al cliente para disculparse.',
    resuelto_por: 'coordinador',
    fecha: fechaRelativa(8),
    estado: 'resuelto',
    aprendizaje: 'Se crea flag "en_retencion" visible para Recobro. Recobro nunca actua sobre clientes con este flag sin coordinarse.'
  },
  {
    id: generarId('conf'),
    agente_a: 'crisis',
    agente_b: 'marketing',
    asunto: 'Crisis quiere silencio mediatico pero Marketing tenia programada campana el mismo dia del incidente',
    posicion_a: 'Tenemos un incidente de filtracion de datos de 500 clientes. Debemos mantener bajo perfil mediatico hasta tener el informe completo. Toda comunicacion externa debe pasar por mi.',
    posicion_b: 'Tengo programada la campana de Black Friday con inversion de 50.000 EUR en medios. Si la pausamos perdemos las reservas de espacios publicitarios.',
    resolucion: 'Crisis tiene prioridad absoluta. Se pausa la campana (se negocia con medios para posponer sin perder reservas). Se emite comunicado proactivo a los 500 clientes afectados. Marketing apoya a Crisis con la estrategia de comunicacion de crisis.',
    resuelto_por: 'ceo + coordinador',
    fecha: fechaRelativa(5),
    estado: 'resuelto',
    aprendizaje: 'En situacion de crisis, todas las comunicaciones externas se canalizan por el Agente de Crisis. Marketing entra en modo de soporte.'
  }
];

// ---------------------------------------------------------------------------
// Consensos alcanzados
// ---------------------------------------------------------------------------

const consensos = [
  {
    id: generarId('cons'),
    tema: 'Adopcion de IA generativa para respuestas al cliente',
    agentes_votantes: ['ceo', 'legal', 'it', 'nps', 'marketing', 'riesgo'],
    votos: { a_favor: ['ceo', 'it', 'nps', 'marketing'], en_contra: ['riesgo'], abstencion: ['legal'] },
    condiciones: ['Legal: solo si se implementa supervision humana en respuestas criticas', 'Riesgo: solo si se limita a consultas de bajo riesgo inicialmente'],
    decision_final: 'Aprobado con condiciones: IA generativa para respuestas informativas, supervision humana para reclamaciones y decisiones de cobertura',
    fecha: fechaRelativa(14)
  },
  {
    id: generarId('cons'),
    tema: 'Incremento del limite de aprobacion automatica de siniestros de 3.000 a 5.000 EUR',
    agentes_votantes: ['ceo', 'financiero', 'riesgo', 'legal', 'investigacion'],
    votos: { a_favor: ['ceo', 'riesgo'], en_contra: ['financiero', 'investigacion'], abstencion: ['legal'] },
    condiciones: ['Financiero: solo si la tasa de fraude se mantiene por debajo del 2%', 'Investigacion: con verificacion cruzada obligatoria para siniestros entre 3K y 5K'],
    decision_final: 'Aprobado con condiciones: limite sube a 4.000 EUR (compromiso), con verificacion cruzada obligatoria para >3.000 EUR. Se re-evalua en 3 meses.',
    fecha: fechaRelativa(7)
  },
  {
    id: generarId('cons'),
    tema: 'Implementacion de horario de atencion 24/7 con agentes IA',
    agentes_votantes: ['ceo', 'rrhh', 'it', 'nps', 'financiero', 'legal'],
    votos: { a_favor: ['ceo', 'nps', 'it'], en_contra: ['financiero'], abstencion: ['rrhh', 'legal'] },
    condiciones: ['Financiero: el coste de infraestructura nocturna no debe superar 8.000 EUR/mes', 'RRHH: se mantiene equipo humano de guardia para escalaciones'],
    decision_final: 'Aprobado: IA 24/7 para recepcion y consultas, guardia humana reducida (2 personas) para escalaciones nocturnas',
    fecha: fechaRelativa(3)
  }
];

// ---------------------------------------------------------------------------
// Red de comunicacion entre agentes (frecuencia de interaccion)
// ---------------------------------------------------------------------------

const redComunicacion = [
  { de: 'main', a: 'vigilante', frecuencia: 145, tipo: 'alta' },
  { de: 'main', a: 'investigacion', frecuencia: 89, tipo: 'alta' },
  { de: 'negociador', a: 'compras', frecuencia: 112, tipo: 'alta' },
  { de: 'negociador', a: 'legal', frecuencia: 78, tipo: 'alta' },
  { de: 'ceo', a: 'financiero', frecuencia: 95, tipo: 'alta' },
  { de: 'ceo', a: 'board', frecuencia: 42, tipo: 'media' },
  { de: 'vendedor', a: 'marketing', frecuencia: 87, tipo: 'alta' },
  { de: 'vendedor', a: 'retencion', frecuencia: 56, tipo: 'media' },
  { de: 'legal', a: 'riesgo', frecuencia: 63, tipo: 'media' },
  { de: 'investigacion', a: 'legal', frecuencia: 71, tipo: 'alta' },
  { de: 'financiero', a: 'recobro', frecuencia: 48, tipo: 'media' },
  { de: 'rrhh', a: 'ceo', frecuencia: 35, tipo: 'media' },
  { de: 'it', a: 'innovacion', frecuencia: 58, tipo: 'media' },
  { de: 'crisis', a: 'marketing', frecuencia: 23, tipo: 'baja' },
  { de: 'crisis', a: 'legal', frecuencia: 31, tipo: 'media' },
  { de: 'nps', a: 'retencion', frecuencia: 67, tipo: 'alta' },
  { de: 'recobro', a: 'retencion', frecuencia: 54, tipo: 'media' },
  { de: 'subrogacion', a: 'legal', frecuencia: 45, tipo: 'media' },
  { de: 'rechazos', a: 'legal', frecuencia: 52, tipo: 'media' },
  { de: 'riesgo', a: 'financiero', frecuencia: 61, tipo: 'media' },
  { de: 'expansion', a: 'financiero', frecuencia: 28, tipo: 'baja' },
  { de: 'expansion', a: 'legal', frecuencia: 33, tipo: 'media' }
];

// ---------------------------------------------------------------------------
// Funciones principales del coordinador
// ---------------------------------------------------------------------------

/**
 * Obtiene las conversaciones activas entre agentes.
 */
function getConversacionesActivas() {
  const activas = conversaciones.filter(c => c.estado === 'activa');
  return {
    total_activas: activas.length,
    conversaciones: activas.map(c => ({
      id: c.id,
      agentes: c.agentes_participantes.map(id => {
        const ag = AGENTES_SISTEMA.find(a => a.id === id);
        return ag ? ag.nombre : id;
      }),
      asunto: c.asunto,
      mensajes_count: c.mensajes.length,
      ultimo_mensaje: c.mensajes[c.mensajes.length - 1],
      prioridad: c.prioridad,
      consenso_alcanzado: c.consenso_alcanzado,
      duracion: `${Math.round((new Date() - new Date(c.fecha_inicio)) / (1000 * 60))} minutos`
    })),
    resumen: `${activas.length} conversaciones activas entre ${new Set(activas.flatMap(c => c.agentes_participantes)).size} agentes`
  };
}

/**
 * Obtiene los conflictos entre agentes y sus resoluciones.
 */
function getConflictos() {
  return {
    total: conflictos.length,
    resueltos: conflictos.filter(c => c.estado === 'resuelto').length,
    pendientes: conflictos.filter(c => c.estado !== 'resuelto').length,
    conflictos: conflictos.map(c => ({
      ...c,
      agente_a_nombre: AGENTES_SISTEMA.find(a => a.id === c.agente_a)?.nombre || c.agente_a,
      agente_b_nombre: AGENTES_SISTEMA.find(a => a.id === c.agente_b)?.nombre || c.agente_b
    })),
    tasa_resolucion: `${Math.round(conflictos.filter(c => c.estado === 'resuelto').length / conflictos.length * 100)}%`,
    tiempo_medio_resolucion: '2.3 horas',
    aprendizajes_generados: conflictos.filter(c => c.aprendizaje).length
  };
}

/**
 * Inicia una nueva conversacion entre agentes.
 */
function iniciarConversacion(agentes, asunto) {
  if (!agentes || !Array.isArray(agentes) || agentes.length < 2) {
    return { error: 'Se requieren al menos 2 agentes para iniciar una conversacion' };
  }
  if (!asunto) {
    return { error: 'Se requiere un asunto para la conversacion' };
  }

  // Verificar que los agentes existen
  const agentesValidos = agentes.filter(id => AGENTES_SISTEMA.find(a => a.id === id));
  if (agentesValidos.length < 2) {
    return { error: `Agentes no reconocidos. Agentes disponibles: ${AGENTES_SISTEMA.map(a => a.id).join(', ')}` };
  }

  const getNombre = (id) => AGENTES_SISTEMA.find(a => a.id === id)?.nombre || id;

  // Simular dialogo realista entre agentes
  const mensajesIniciales = [];
  const iniciador = agentesValidos[0];
  const receptor = agentesValidos[1];

  mensajesIniciales.push({
    de: iniciador,
    para: receptor,
    contenido: `Necesito coordinar contigo sobre: ${asunto}. He analizado los datos relevantes y creo que debemos tomar una decision conjunta para asegurar coherencia en nuestras acciones.`,
    timestamp: new Date().toISOString()
  });

  mensajesIniciales.push({
    de: receptor,
    para: iniciador,
    contenido: `Recibido. Estoy revisando mi informacion sobre este tema. Desde mi perspectiva como ${getNombre(receptor)}, tengo datos relevantes que debemos considerar. Dame unos minutos para preparar mi analisis.`,
    timestamp: new Date(Date.now() + 60000).toISOString()
  });

  if (agentesValidos.length > 2) {
    const tercero = agentesValidos[2];
    mensajesIniciales.push({
      de: tercero,
      para: 'todos',
      contenido: `Me uno a la conversacion. Como ${getNombre(tercero)}, puedo aportar una perspectiva adicional sobre ${asunto}. Es importante que tengamos en cuenta las implicaciones en mi area.`,
      timestamp: new Date(Date.now() + 120000).toISOString()
    });
  }

  const nuevaConversacion = {
    id: generarId('conv'),
    agentes_participantes: agentesValidos,
    asunto,
    mensajes: mensajesIniciales,
    estado: 'activa',
    decision_final: null,
    consenso_alcanzado: false,
    prioridad: 'media',
    fecha_inicio: new Date().toISOString()
  };

  conversaciones.push(nuevaConversacion);

  return {
    mensaje: 'Conversacion iniciada correctamente',
    conversacion: {
      id: nuevaConversacion.id,
      agentes: agentesValidos.map(id => ({ id, nombre: getNombre(id) })),
      asunto,
      mensajes_iniciales: mensajesIniciales.length,
      estado: 'activa'
    }
  };
}

/**
 * Resuelve un conflicto con una decision y razonamiento.
 */
function resolverConflicto(conflictoId, decision) {
  const conflicto = conflictos.find(c => c.id === conflictoId);
  if (!conflicto) {
    return { error: 'Conflicto no encontrado', conflictoId };
  }

  if (conflicto.estado === 'resuelto') {
    return { error: 'Este conflicto ya fue resuelto', resolucion_previa: conflicto.resolucion };
  }

  conflicto.resolucion = decision;
  conflicto.estado = 'resuelto';
  conflicto.resuelto_por = 'coordinador';
  conflicto.fecha_resolucion = new Date().toISOString();
  conflicto.aprendizaje = `Aprendizaje generado: Se establece nueva regla para prevenir conflictos similares entre ${conflicto.agente_a} y ${conflicto.agente_b} en el futuro.`;

  return {
    mensaje: 'Conflicto resuelto correctamente',
    conflicto: {
      id: conflicto.id,
      agentes: [conflicto.agente_a, conflicto.agente_b],
      asunto: conflicto.asunto,
      resolucion: decision,
      aprendizaje: conflicto.aprendizaje
    }
  };
}

/**
 * Solicita consenso entre agentes sobre un tema. Simula votacion.
 */
function getConsenso(tema) {
  if (!tema) {
    return { error: 'Se requiere un tema para obtener consenso' };
  }

  // Seleccionar agentes relevantes segun el tema
  const agentesVotantes = AGENTES_SISTEMA
    .filter(() => Math.random() > 0.5)
    .slice(0, randomInt(4, 8));

  if (agentesVotantes.length < 4) {
    agentesVotantes.push(
      ...AGENTES_SISTEMA.filter(a => ['ceo', 'legal', 'financiero', 'riesgo'].includes(a.id) && !agentesVotantes.find(v => v.id === a.id))
    );
  }

  const votos = { a_favor: [], en_contra: [], abstencion: [] };
  const opiniones = [];

  for (const agente of agentesVotantes) {
    const rand = Math.random();
    let voto;
    if (rand > 0.3) {
      voto = 'a_favor';
      votos.a_favor.push(agente.id);
    } else if (rand > 0.1) {
      voto = 'en_contra';
      votos.en_contra.push(agente.id);
    } else {
      voto = 'abstencion';
      votos.abstencion.push(agente.id);
    }

    opiniones.push({
      agente: agente.nombre,
      agente_id: agente.id,
      voto,
      razonamiento: voto === 'a_favor'
        ? `Desde la perspectiva de ${agente.rol}, considero que "${tema}" es beneficioso para el sistema y alineado con nuestros objetivos.`
        : voto === 'en_contra'
          ? `Como responsable de ${agente.rol}, tengo reservas sobre "${tema}". Necesitariamos mitigar riesgos antes de proceder.`
          : `Prefiero abstenerme hasta tener mas datos sobre el impacto de "${tema}" en mi area de ${agente.rol}.`
    });
  }

  const totalVotantes = votos.a_favor.length + votos.en_contra.length;
  const porcentajeAFavor = totalVotantes > 0 ? Math.round(votos.a_favor.length / totalVotantes * 100) : 0;
  const aprobado = porcentajeAFavor >= 60;

  const nuevoConsenso = {
    id: generarId('cons'),
    tema,
    agentes_votantes: agentesVotantes.map(a => a.id),
    votos,
    condiciones: votos.en_contra.map(id => {
      const ag = AGENTES_SISTEMA.find(a => a.id === id);
      return `${ag?.nombre || id}: requiere mitigacion de riesgos en su area antes de proceder`;
    }),
    decision_final: aprobado
      ? `Aprobado por consenso (${porcentajeAFavor}% a favor). Se procede con las condiciones establecidas.`
      : `Rechazado (solo ${porcentajeAFavor}% a favor). Se requiere revision y nueva propuesta.`,
    fecha: fechaHoy()
  };

  consensos.push(nuevoConsenso);

  return {
    tema,
    resultado: aprobado ? 'APROBADO' : 'RECHAZADO',
    porcentaje_a_favor: `${porcentajeAFavor}%`,
    votos,
    opiniones,
    decision_final: nuevoConsenso.decision_final,
    condiciones: nuevoConsenso.condiciones,
    consenso_id: nuevoConsenso.id
  };
}

/**
 * Estado en tiempo real de todos los agentes del sistema.
 */
function getEstadoAgentes() {
  const estados = ['trabajando', 'trabajando', 'trabajando', 'esperando', 'coordinando'];
  const acciones = {
    main: 'Procesando siniestro SIN-2024-4532 - triaje automatico',
    vigilante: 'Monitorizando 47 expedientes activos - SLA check',
    negociador: 'Preparando contraoferta para TallerPlus S.L.',
    vendedor: 'Contactando lead #L-2891 para cross-selling de vida',
    ceo: 'Revisando informe de rendimiento semanal Q1',
    financiero: 'Calculando provisiones de siniestralidad catastrofica Q2',
    legal: 'Verificando cumplimiento RGPD en comunicaciones masivas',
    riesgo: 'Actualizando modelo predictivo de siniestralidad por zona',
    marketing: 'Optimizando campana "SeguroFacil" con nuevas exclusiones',
    rrhh: 'Evaluando candidatos para 2 posiciones de desarrollador senior',
    it: 'Desplegando parche de seguridad en servidor de produccion',
    compras: 'Evaluando propuestas de 3 peritos freelance zona Levante',
    nps: 'Analizando feedback de encuestas de satisfaccion - lote 234',
    retencion: 'Llamada a cliente premium en riesgo de fuga - poliza #P-89234',
    recobro: 'Gestion de 12 expedientes de recobro pendientes > 90 dias',
    rechazos: 'Revisando reclamacion rechazada #REC-456 por nueva evidencia',
    investigacion: 'Investigando caso SIN-2024-4521 - patron de fraude detectado',
    subrogacion: 'Preparando demanda de subrogacion contra aseguradora tercera',
    board: 'Generando informe trimestral para comite de direccion',
    expansion: 'Analizando viabilidad de entrada en mercado portugues - fase 1',
    innovacion: 'Probando integracion de modelo de vision para peritacion virtual',
    crisis: 'En modo standby - monitorizando indicadores de crisis'
  };

  return {
    total_agentes: AGENTES_SISTEMA.length,
    agentes: AGENTES_SISTEMA.map(ag => {
      const estado = ag.id === 'crisis' ? 'esperando' : estados[randomInt(0, estados.length - 1)];
      return {
        id: ag.id,
        nombre: ag.nombre,
        rol: ag.rol,
        estado,
        ultima_accion: acciones[ag.id] || `Procesando tareas de ${ag.rol}`,
        tareas_hoy: randomInt(3, 25),
        precision: randomEntre(0.89, 0.99),
        carga_trabajo_pct: estado === 'esperando' ? randomInt(5, 30) : randomInt(40, 95),
        tiempo_activo_hoy: `${randomInt(2, 14)}h ${randomInt(0, 59)}m`,
        errores_hoy: randomInt(0, 3),
        ultima_coordinacion: timestampRelativo(0, randomInt(0, 4), randomInt(0, 59))
      };
    }),
    resumen: {
      trabajando: AGENTES_SISTEMA.filter(() => Math.random() > 0.3).length,
      esperando: AGENTES_SISTEMA.filter(() => Math.random() > 0.8).length,
      coordinando: AGENTES_SISTEMA.filter(() => Math.random() > 0.85).length,
      error: 0
    }
  };
}

/**
 * Grafo de red de comunicacion mostrando frecuencias de interaccion.
 */
function getRedComunicacion() {
  const nodos = AGENTES_SISTEMA.map(ag => ({
    id: ag.id,
    nombre: ag.nombre,
    conexiones: redComunicacion.filter(r => r.de === ag.id || r.a === ag.id).length,
    mensajes_totales: redComunicacion.filter(r => r.de === ag.id || r.a === ag.id).reduce((s, r) => s + r.frecuencia, 0)
  }));

  const topComunicadores = nodos.sort((a, b) => b.mensajes_totales - a.mensajes_totales).slice(0, 5);

  return {
    nodos: nodos.sort((a, b) => a.id.localeCompare(b.id)),
    enlaces: redComunicacion,
    total_interacciones: redComunicacion.reduce((s, r) => s + r.frecuencia, 0),
    top_comunicadores: topComunicadores.map(n => ({ nombre: n.nombre, mensajes: n.mensajes_totales })),
    clusters: [
      { nombre: 'Operaciones', agentes: ['main', 'vigilante', 'investigacion', 'subrogacion', 'rechazos'], interacciones_internas: 305 },
      { nombre: 'Comercial', agentes: ['vendedor', 'marketing', 'retencion', 'nps'], interacciones_internas: 210 },
      { nombre: 'Financiero-Legal', agentes: ['financiero', 'legal', 'riesgo', 'recobro'], interacciones_internas: 224 },
      { nombre: 'Estrategico', agentes: ['ceo', 'board', 'expansion', 'innovacion'], interacciones_internas: 128 },
      { nombre: 'Soporte', agentes: ['it', 'rrhh', 'compras', 'crisis'], interacciones_internas: 116 }
    ],
    densidad_red: `${(redComunicacion.length / (AGENTES_SISTEMA.length * (AGENTES_SISTEMA.length - 1) / 2) * 100).toFixed(1)}%`
  };
}

/**
 * Estadisticas generales del coordinador.
 */
function getEstadisticas() {
  const hoy = conversaciones.filter(c => {
    const diff = (new Date() - new Date(c.fecha_inicio)) / (1000 * 60 * 60);
    return diff <= 24;
  });

  return {
    conversaciones_hoy: hoy.length,
    conversaciones_activas: conversaciones.filter(c => c.estado === 'activa').length,
    conversaciones_resueltas: conversaciones.filter(c => c.estado === 'resuelta').length,
    conflictos_totales: conflictos.length,
    conflictos_resueltos: conflictos.filter(c => c.estado === 'resuelto').length,
    conflictos_pendientes: conflictos.filter(c => c.estado !== 'resuelto').length,
    consensos_alcanzados: consensos.length,
    tiempo_medio_resolucion: '2.3 horas',
    tasa_consenso: `${Math.round(consensos.filter(c => c.decision_final.includes('Aprobado')).length / Math.max(1, consensos.length) * 100)}%`,
    mensajes_intercambiados_hoy: hoy.reduce((s, c) => s + c.mensajes.length, 0),
    agentes_activos: AGENTES_SISTEMA.length,
    salud_coordinacion: {
      estado: 'optimo',
      latencia_media_coordinacion_ms: randomInt(50, 150),
      conflictos_sin_resolver: conflictos.filter(c => c.estado !== 'resuelto').length,
      agentes_sin_comunicar_24h: randomInt(0, 2),
      eficiencia_consenso: '94%'
    }
  };
}

// ---------------------------------------------------------------------------
// Exportaciones
// ---------------------------------------------------------------------------

module.exports = {
  getConversacionesActivas,
  getConflictos,
  iniciarConversacion,
  resolverConflicto,
  getConsenso,
  getEstadoAgentes,
  getRedComunicacion,
  getEstadisticas,
  // Datos internos expuestos para coordinacion
  _conversaciones: conversaciones,
  _conflictos: conflictos,
  _consensos: consensos,
  _agentes: AGENTES_SISTEMA,
  _redComunicacion: redComunicacion
};
