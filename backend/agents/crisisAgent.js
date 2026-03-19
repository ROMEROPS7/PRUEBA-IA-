// =============================================================================
// Crisis Agent - Agente de Gestion de Crisis
// Sistema de IA para deteccion, respuesta y resolucion de crisis empresariales
// =============================================================================

// --- Utilidades ---
function generarId(prefijo = 'crisis') {
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

function horaActual() {
  return new Date().toTimeString().substr(0, 5);
}

// --- Tipos de crisis soportados ---
const TIPOS_CRISIS = [
  'ciberataque',
  'catastrofe_natural',
  'crisis_reputacion',
  'fallo_sistema',
  'fraude_masivo',
  'pandemia',
  'regulatorio'
];

const NIVELES_SEVERIDAD = ['baja', 'media', 'alta', 'critica'];

// --- Protocolos de crisis detallados ---
function getProtocolosCompletos() {
  return {
    ciberataque: {
      tipo: 'ciberataque',
      nombre: 'Protocolo de Ciberataque',
      descripcion: 'Respuesta ante ataques informaticos: ransomware, DDoS, robo de datos, phishing masivo',
      tiempo_activacion: '5 minutos',
      equipo_responsable: ['CTO', 'CISO', 'CLO', 'COO'],
      pasos: [
        { fase: 'detectar', orden: 1, accion: 'Activar alertas del SOC y confirmar el vector de ataque', tiempo_estimado: '10 min', responsable: 'CISO' },
        { fase: 'detectar', orden: 2, accion: 'Identificar sistemas afectados y alcance de la brecha', tiempo_estimado: '30 min', responsable: 'CTO' },
        { fase: 'evaluar', orden: 3, accion: 'Clasificar severidad del incidente (1-4) segun datos comprometidos', tiempo_estimado: '15 min', responsable: 'CISO' },
        { fase: 'evaluar', orden: 4, accion: 'Evaluar impacto en clientes y obligaciones RGPD de notificacion', tiempo_estimado: '20 min', responsable: 'CLO' },
        { fase: 'comunicar', orden: 5, accion: 'Notificar al equipo directivo y activar comite de crisis', tiempo_estimado: '10 min', responsable: 'CEO' },
        { fase: 'comunicar', orden: 6, accion: 'Notificar a AEPD si hay datos personales comprometidos (72h)', tiempo_estimado: '2 h', responsable: 'CLO' },
        { fase: 'responder', orden: 7, accion: 'Aislar sistemas afectados y contener la propagacion', tiempo_estimado: '1 h', responsable: 'CTO' },
        { fase: 'responder', orden: 8, accion: 'Activar sistemas de backup y plan de continuidad', tiempo_estimado: '2 h', responsable: 'COO' },
        { fase: 'resolver', orden: 9, accion: 'Eliminar amenaza, parchear vulnerabilidades y restaurar sistemas', tiempo_estimado: '4-24 h', responsable: 'CTO' },
        { fase: 'resolver', orden: 10, accion: 'Verificar integridad de datos y confirmar erradicacion', tiempo_estimado: '4 h', responsable: 'CISO' },
        { fase: 'aprender', orden: 11, accion: 'Analisis forense completo y documentacion del incidente', tiempo_estimado: '5 dias', responsable: 'CISO' },
        { fase: 'aprender', orden: 12, accion: 'Actualizar politicas y controles de seguridad', tiempo_estimado: '10 dias', responsable: 'CTO' }
      ]
    },
    catastrofe_natural: {
      tipo: 'catastrofe_natural',
      nombre: 'Protocolo de Catastrofe Natural',
      descripcion: 'Respuesta ante DANA, inundaciones, terremotos, incendios forestales, tormentas severas',
      tiempo_activacion: '15 minutos',
      equipo_responsable: ['COO', 'CRO', 'CFO', 'CMO'],
      pasos: [
        { fase: 'detectar', orden: 1, accion: 'Monitorizar alertas meteorologicas AEMET y activar sistema de tracking', tiempo_estimado: '5 min', responsable: 'CRO' },
        { fase: 'detectar', orden: 2, accion: 'Identificar zonas afectadas y polizas expuestas en cartera', tiempo_estimado: '30 min', responsable: 'CRO' },
        { fase: 'evaluar', orden: 3, accion: 'Estimar siniestralidad esperada con modelo catastrofico', tiempo_estimado: '1 h', responsable: 'CRO' },
        { fase: 'evaluar', orden: 4, accion: 'Calcular impacto financiero y necesidad de reaseguro', tiempo_estimado: '2 h', responsable: 'CFO' },
        { fase: 'comunicar', orden: 5, accion: 'Activar canales de comunicacion con asegurados afectados', tiempo_estimado: '1 h', responsable: 'CMO' },
        { fase: 'comunicar', orden: 6, accion: 'Informar a Consorcio de Compensacion de Seguros si procede', tiempo_estimado: '2 h', responsable: 'CLO' },
        { fase: 'responder', orden: 7, accion: 'Desplegar equipos de peritaje de emergencia a zonas afectadas', tiempo_estimado: '4 h', responsable: 'COO' },
        { fase: 'responder', orden: 8, accion: 'Habilitar canal express de apertura de siniestros (telefono, app, web)', tiempo_estimado: '2 h', responsable: 'CTO' },
        { fase: 'resolver', orden: 9, accion: 'Tramitacion acelerada de siniestros con importes menores a 3.000 EUR', tiempo_estimado: '48 h', responsable: 'COO' },
        { fase: 'resolver', orden: 10, accion: 'Coordinar pagos urgentes a asegurados en situacion de emergencia', tiempo_estimado: '72 h', responsable: 'CFO' },
        { fase: 'aprender', orden: 11, accion: 'Revisar modelos de exposicion y adecuacion de reservas', tiempo_estimado: '30 dias', responsable: 'CRO' },
        { fase: 'aprender', orden: 12, accion: 'Actualizar tarificacion y limites por zona geografica', tiempo_estimado: '60 dias', responsable: 'CPO' }
      ]
    },
    crisis_reputacion: {
      tipo: 'crisis_reputacion',
      nombre: 'Protocolo de Crisis Reputacional',
      descripcion: 'Respuesta ante crisis en redes sociales, medios de comunicacion, denuncias publicas',
      tiempo_activacion: '10 minutos',
      equipo_responsable: ['CMO', 'CEO', 'CLO', 'COO'],
      pasos: [
        { fase: 'detectar', orden: 1, accion: 'Detectar tendencia negativa en monitorizacion de redes y medios', tiempo_estimado: '5 min', responsable: 'CMO' },
        { fase: 'detectar', orden: 2, accion: 'Cuantificar alcance: menciones, sentimiento, influencers implicados', tiempo_estimado: '30 min', responsable: 'CMO' },
        { fase: 'evaluar', orden: 3, accion: 'Determinar origen y veracidad de las acusaciones/quejas', tiempo_estimado: '1 h', responsable: 'COO' },
        { fase: 'evaluar', orden: 4, accion: 'Evaluar implicaciones legales y riesgo de litigios', tiempo_estimado: '1 h', responsable: 'CLO' },
        { fase: 'comunicar', orden: 5, accion: 'Preparar posicionamiento oficial y mensajes clave', tiempo_estimado: '2 h', responsable: 'CMO' },
        { fase: 'comunicar', orden: 6, accion: 'Publicar comunicado en canales oficiales y responder en redes', tiempo_estimado: '1 h', responsable: 'CMO' },
        { fase: 'responder', orden: 7, accion: 'Implementar acciones correctivas visibles y medibles', tiempo_estimado: '24 h', responsable: 'COO' },
        { fase: 'responder', orden: 8, accion: 'Contacto directo con clientes afectados para resolucion', tiempo_estimado: '48 h', responsable: 'COO' },
        { fase: 'resolver', orden: 9, accion: 'Monitorizar evolucion del sentimiento y ajustar estrategia', tiempo_estimado: '7 dias', responsable: 'CMO' },
        { fase: 'resolver', orden: 10, accion: 'Campana de contenido positivo y testimonios reales', tiempo_estimado: '14 dias', responsable: 'CMO' },
        { fase: 'aprender', orden: 11, accion: 'Analisis post-crisis: origen, gestion, resultados', tiempo_estimado: '15 dias', responsable: 'CMO' },
        { fase: 'aprender', orden: 12, accion: 'Actualizar protocolos de comunicacion y monitorizacion', tiempo_estimado: '30 dias', responsable: 'CMO' }
      ]
    },
    fallo_sistema: {
      tipo: 'fallo_sistema',
      nombre: 'Protocolo de Fallo de Sistemas',
      descripcion: 'Respuesta ante caida de sistemas criticos: core de seguros, pagos, portal cliente, APP',
      tiempo_activacion: '2 minutos',
      equipo_responsable: ['CTO', 'COO', 'CMO'],
      pasos: [
        { fase: 'detectar', orden: 1, accion: 'Alertas automaticas de monitorizacion detectan caida o degradacion', tiempo_estimado: '1 min', responsable: 'CTO' },
        { fase: 'detectar', orden: 2, accion: 'Confirmar alcance: sistemas afectados, usuarios impactados', tiempo_estimado: '5 min', responsable: 'CTO' },
        { fase: 'evaluar', orden: 3, accion: 'Clasificar incidente: P1 (critico), P2 (alto), P3 (medio)', tiempo_estimado: '5 min', responsable: 'CTO' },
        { fase: 'evaluar', orden: 4, accion: 'Estimar tiempo de recuperacion (RTO) e impacto en negocio', tiempo_estimado: '10 min', responsable: 'CTO' },
        { fase: 'comunicar', orden: 5, accion: 'Notificar a usuarios internos y establecer canal de actualizaciones', tiempo_estimado: '10 min', responsable: 'CTO' },
        { fase: 'comunicar', orden: 6, accion: 'Publicar aviso en portal cliente y redes si afecta a asegurados', tiempo_estimado: '15 min', responsable: 'CMO' },
        { fase: 'responder', orden: 7, accion: 'Activar plan de contingencia y sistemas de respaldo', tiempo_estimado: '15 min', responsable: 'CTO' },
        { fase: 'responder', orden: 8, accion: 'Habilitar canales alternativos para operaciones criticas', tiempo_estimado: '30 min', responsable: 'COO' },
        { fase: 'resolver', orden: 9, accion: 'Restaurar servicios y verificar integridad de datos', tiempo_estimado: '1-4 h', responsable: 'CTO' },
        { fase: 'resolver', orden: 10, accion: 'Confirmar operativa normal y cerrar incidente', tiempo_estimado: '1 h', responsable: 'CTO' },
        { fase: 'aprender', orden: 11, accion: 'Post-mortem: causa raiz, timeline, acciones preventivas', tiempo_estimado: '3 dias', responsable: 'CTO' },
        { fase: 'aprender', orden: 12, accion: 'Implementar mejoras en resiliencia y monitoring', tiempo_estimado: '15 dias', responsable: 'CTO' }
      ]
    },
    fraude_masivo: {
      tipo: 'fraude_masivo',
      nombre: 'Protocolo de Fraude Masivo',
      descripcion: 'Respuesta ante deteccion de redes de fraude organizado o fraude interno',
      tiempo_activacion: '30 minutos',
      equipo_responsable: ['CRO', 'CLO', 'CFO', 'COO'],
      pasos: [
        { fase: 'detectar', orden: 1, accion: 'Modelo de deteccion de anomalias identifica patron sospechoso', tiempo_estimado: '15 min', responsable: 'CRO' },
        { fase: 'detectar', orden: 2, accion: 'Confirmar patron fraudulento con analisis manual de muestras', tiempo_estimado: '2 h', responsable: 'CRO' },
        { fase: 'evaluar', orden: 3, accion: 'Cuantificar alcance: numero de polizas/siniestros y importe afectado', tiempo_estimado: '4 h', responsable: 'CRO' },
        { fase: 'evaluar', orden: 4, accion: 'Determinar si es fraude externo, interno o mixto', tiempo_estimado: '4 h', responsable: 'CRO' },
        { fase: 'comunicar', orden: 5, accion: 'Informar al comite de fraude y direccion general', tiempo_estimado: '1 h', responsable: 'CRO' },
        { fase: 'comunicar', orden: 6, accion: 'Notificar a autoridades si procede (policia, DGSFP)', tiempo_estimado: '24 h', responsable: 'CLO' },
        { fase: 'responder', orden: 7, accion: 'Bloquear polizas y pagos sospechosos de forma preventiva', tiempo_estimado: '2 h', responsable: 'COO' },
        { fase: 'responder', orden: 8, accion: 'Iniciar investigacion interna con equipo forense', tiempo_estimado: '48 h', responsable: 'CRO' },
        { fase: 'resolver', orden: 9, accion: 'Ejercer acciones legales contra los responsables', tiempo_estimado: '30 dias', responsable: 'CLO' },
        { fase: 'resolver', orden: 10, accion: 'Recuperar importes defraudados donde sea posible', tiempo_estimado: '90 dias', responsable: 'CFO' },
        { fase: 'aprender', orden: 11, accion: 'Reforzar controles y modelos de deteccion', tiempo_estimado: '30 dias', responsable: 'CRO' },
        { fase: 'aprender', orden: 12, accion: 'Formacion anti-fraude a equipos de suscripcion y siniestros', tiempo_estimado: '60 dias', responsable: 'CHRO' }
      ]
    },
    pandemia: {
      tipo: 'pandemia',
      nombre: 'Protocolo de Pandemia',
      descripcion: 'Respuesta ante emergencia sanitaria que afecte a empleados, operaciones y cartera',
      tiempo_activacion: '2 horas',
      equipo_responsable: ['CHRO', 'COO', 'CTO', 'CEO'],
      pasos: [
        { fase: 'detectar', orden: 1, accion: 'Monitorizar alertas OMS y Ministerio de Sanidad', tiempo_estimado: '1 h', responsable: 'CHRO' },
        { fase: 'detectar', orden: 2, accion: 'Evaluar riesgo para empleados y operaciones en cada sede', tiempo_estimado: '4 h', responsable: 'CHRO' },
        { fase: 'evaluar', orden: 3, accion: 'Modelar impacto en siniestralidad de salud y vida', tiempo_estimado: '8 h', responsable: 'CRO' },
        { fase: 'evaluar', orden: 4, accion: 'Evaluar capacidad de trabajo remoto y continuidad operativa', tiempo_estimado: '4 h', responsable: 'CTO' },
        { fase: 'comunicar', orden: 5, accion: 'Comunicar medidas preventivas a empleados', tiempo_estimado: '2 h', responsable: 'CHRO' },
        { fase: 'comunicar', orden: 6, accion: 'Informar a clientes sobre continuidad del servicio', tiempo_estimado: '4 h', responsable: 'CMO' },
        { fase: 'responder', orden: 7, accion: 'Activar plan de trabajo remoto masivo', tiempo_estimado: '24 h', responsable: 'CTO' },
        { fase: 'responder', orden: 8, accion: 'Adaptar procesos operativos a modalidad no presencial', tiempo_estimado: '48 h', responsable: 'COO' },
        { fase: 'resolver', orden: 9, accion: 'Estabilizar operaciones en modalidad de emergencia', tiempo_estimado: '7 dias', responsable: 'COO' },
        { fase: 'resolver', orden: 10, accion: 'Ajustar productos y coberturas a nueva situacion', tiempo_estimado: '30 dias', responsable: 'CPO' },
        { fase: 'aprender', orden: 11, accion: 'Evaluar resiliencia organizativa y puntos de mejora', tiempo_estimado: '90 dias', responsable: 'COO' },
        { fase: 'aprender', orden: 12, accion: 'Actualizar BCP con lecciones aprendidas', tiempo_estimado: '120 dias', responsable: 'CTO' }
      ]
    },
    regulatorio: {
      tipo: 'regulatorio',
      nombre: 'Protocolo de Crisis Regulatoria',
      descripcion: 'Respuesta ante sanciones, requerimientos urgentes o cambios normativos disruptivos',
      tiempo_activacion: '1 hora',
      equipo_responsable: ['CLO', 'CFO', 'CEO', 'CRO'],
      pasos: [
        { fase: 'detectar', orden: 1, accion: 'Recepcion de requerimiento o notificacion regulatoria', tiempo_estimado: '15 min', responsable: 'CLO' },
        { fase: 'detectar', orden: 2, accion: 'Analisis preliminar del alcance y plazos', tiempo_estimado: '2 h', responsable: 'CLO' },
        { fase: 'evaluar', orden: 3, accion: 'Evaluar impacto financiero y operativo del requerimiento', tiempo_estimado: '4 h', responsable: 'CFO' },
        { fase: 'evaluar', orden: 4, accion: 'Determinar riesgo de sancion y posibles medidas cautelares', tiempo_estimado: '4 h', responsable: 'CLO' },
        { fase: 'comunicar', orden: 5, accion: 'Informar al consejo de administracion y comite de cumplimiento', tiempo_estimado: '2 h', responsable: 'CEO' },
        { fase: 'comunicar', orden: 6, accion: 'Preparar comunicacion con regulador: tono cooperativo', tiempo_estimado: '8 h', responsable: 'CLO' },
        { fase: 'responder', orden: 7, accion: 'Asignar equipo dedicado y recursos para respuesta', tiempo_estimado: '4 h', responsable: 'CEO' },
        { fase: 'responder', orden: 8, accion: 'Elaborar respuesta tecnica con asesores externos si procede', tiempo_estimado: '5 dias', responsable: 'CLO' },
        { fase: 'resolver', orden: 9, accion: 'Presentar respuesta y plan correctivo al regulador', tiempo_estimado: '10 dias', responsable: 'CLO' },
        { fase: 'resolver', orden: 10, accion: 'Implementar medidas correctivas comprometidas', tiempo_estimado: '30 dias', responsable: 'COO' },
        { fase: 'aprender', orden: 11, accion: 'Auditar procesos para evitar reiteracion', tiempo_estimado: '60 dias', responsable: 'CRO' },
        { fase: 'aprender', orden: 12, accion: 'Reforzar funcion de cumplimiento normativo', tiempo_estimado: '90 dias', responsable: 'CLO' }
      ]
    }
  };
}

// --- Estado de crisis ---
const crisisRegistradas = new Map();

// --- Crisis pre-pobladas ---
function getCrisisBase() {
  return [
    {
      id: 'crisis-activa-001',
      tipo: 'crisis_reputacion',
      titulo: 'Campana negativa en redes #SeguroQueNo',
      severidad: 'baja',
      estado: 'activa',
      fase_actual: 'responder',
      fecha_deteccion: fechaRelativa(1),
      fecha_activacion: fechaRelativa(1),
      fecha_resolucion: null,
      descripcion: 'Campana viral en Twitter/X con el hashtag #SeguroQueNo denunciando tiempos de respuesta lentos en siniestros de hogar tras lluvias torrenciales. Acumula 12.000 menciones con sentimiento negativo del 78%.',
      impacto_estimado: {
        financiero: 'Riesgo de perdida de 200-400 clientes (80K-160K EUR en primas)',
        reputacional: 'Impacto medio en percepcion de marca',
        operativo: 'Incremento de llamadas al call center (+35%)'
      },
      acciones_realizadas: [
        { accion: 'Activado monitoring de redes 24/7', fecha: fechaRelativa(1), responsable: 'CMO' },
        { accion: 'Preparado borrador de comunicado oficial', fecha: fechaHoy(), responsable: 'CMO' },
        { accion: 'Contacto directo con los 50 clientes mas activos en la campana', fecha: fechaHoy(), responsable: 'COO' }
      ],
      equipo_asignado: ['CMO', 'COO', 'CEO'],
      proximos_pasos: [
        'Publicar comunicado oficial con medidas concretas',
        'Lanzar campana de testimonios positivos de clientes',
        'Reforzar equipo de atencion telefonica'
      ]
    },
    {
      id: 'crisis-hist-001',
      tipo: 'catastrofe_natural',
      titulo: 'DANA Comunidad Valenciana - Septiembre 2024',
      severidad: 'critica',
      estado: 'resuelta',
      fase_actual: 'aprender',
      fecha_deteccion: '2024-09-15',
      fecha_activacion: '2024-09-15',
      fecha_resolucion: '2024-12-20',
      descripcion: 'Lluvias torrenciales e inundaciones en la Comunidad Valenciana que afectaron a mas de 2.000 polizas de hogar y 500 de automovil en cartera.',
      impacto_estimado: {
        financiero: '4.2M EUR en siniestros pagados',
        reputacional: 'Positivo - buena gestion percibida',
        operativo: 'Movilizacion de 40 peritos durante 3 meses'
      },
      acciones_realizadas: [
        { accion: 'Activacion protocolo catastrofes en 15 minutos', fecha: '2024-09-15', responsable: 'CRO' },
        { accion: 'Despliegue de 40 peritos en zona', fecha: '2024-09-16', responsable: 'COO' },
        { accion: 'Tramitacion acelerada de 2.500 siniestros', fecha: '2024-09-17', responsable: 'COO' },
        { accion: 'Pago anticipado a asegurados en emergencia', fecha: '2024-09-18', responsable: 'CFO' }
      ],
      leccion_aprendida: 'La respuesta rapida y el pago anticipado generaron fidelizacion excepcional. Tasa de retencion post-catastrofe del 97%.',
      equipo_asignado: ['COO', 'CRO', 'CFO', 'CMO'],
      tiempo_resolucion: '96 dias'
    },
    {
      id: 'crisis-hist-002',
      tipo: 'ciberataque',
      titulo: 'Intento de ransomware en servidores de produccion',
      severidad: 'alta',
      estado: 'resuelta',
      fase_actual: 'aprender',
      fecha_deteccion: '2024-06-03',
      fecha_activacion: '2024-06-03',
      fecha_resolucion: '2024-06-05',
      descripcion: 'Deteccion de ransomware LockBit intentando cifrar servidores del core de seguros. El SOC detecto la amenaza en fase inicial antes de la propagacion.',
      impacto_estimado: {
        financiero: '85K EUR en respuesta y fortificacion',
        reputacional: 'Sin impacto publico - contenido internamente',
        operativo: '4 horas de indisponibilidad parcial'
      },
      acciones_realizadas: [
        { accion: 'Aislamiento de servidores afectados en 8 minutos', fecha: '2024-06-03', responsable: 'CTO' },
        { accion: 'Activacion de backups y sistemas de contingencia', fecha: '2024-06-03', responsable: 'CTO' },
        { accion: 'Analisis forense con INCIBE', fecha: '2024-06-04', responsable: 'CISO' },
        { accion: 'Parcheado de vulnerabilidades y hardening', fecha: '2024-06-05', responsable: 'CTO' }
      ],
      leccion_aprendida: 'La inversion en SOC 24/7 y sistemas de deteccion temprana demostro su valor. Reforzar formacion anti-phishing a empleados.',
      equipo_asignado: ['CTO', 'CISO', 'CLO'],
      tiempo_resolucion: '2 dias'
    },
    {
      id: 'crisis-hist-003',
      tipo: 'fraude_masivo',
      titulo: 'Red de fraude en siniestros de auto fingidos',
      severidad: 'media',
      estado: 'resuelta',
      fase_actual: 'aprender',
      fecha_deteccion: '2024-03-12',
      fecha_activacion: '2024-03-12',
      fecha_resolucion: '2024-05-28',
      descripcion: 'Deteccion de red organizada de fraude con 47 siniestros de auto fingidos en la zona de Levante. Importe total defraudado estimado en 340K EUR.',
      impacto_estimado: {
        financiero: '340K EUR defraudados, 180K EUR recuperados',
        reputacional: 'Sin impacto publico',
        operativo: 'Equipo anti-fraude dedicado durante 2 meses'
      },
      acciones_realizadas: [
        { accion: 'Modelo ML detecto patron anomalo de siniestros', fecha: '2024-03-12', responsable: 'CRO' },
        { accion: 'Investigacion interna confirma red organizada', fecha: '2024-03-18', responsable: 'CRO' },
        { accion: 'Denuncia ante policia y UDEF', fecha: '2024-03-20', responsable: 'CLO' },
        { accion: 'Bloqueo preventivo de polizas vinculadas', fecha: '2024-03-22', responsable: 'COO' },
        { accion: 'Recuperacion parcial via acciones legales', fecha: '2024-05-28', responsable: 'CLO' }
      ],
      leccion_aprendida: 'El modelo de ML es eficaz pero necesita reentrenamiento trimestral. Incorporar variables de geolocalización y redes de vinculacion.',
      equipo_asignado: ['CRO', 'CLO', 'COO'],
      tiempo_resolucion: '77 dias'
    },
    {
      id: 'crisis-hist-004',
      tipo: 'regulatorio',
      titulo: 'Inspeccion DGSFP sobre gobierno de datos',
      severidad: 'media',
      estado: 'resuelta',
      fase_actual: 'aprender',
      fecha_deteccion: '2024-01-15',
      fecha_activacion: '2024-01-15',
      fecha_resolucion: '2024-04-10',
      descripcion: 'Inspeccion in situ de la DGSFP sobre gobierno de datos y calidad de la informacion para Solvencia II. Deteccion de 12 hallazgos de mejora.',
      impacto_estimado: {
        financiero: '120K EUR en consultoria y adaptaciones tecnicas',
        reputacional: 'Riesgo medio ante regulador',
        operativo: 'Dedicacion de equipo de cumplimiento al 80% durante 3 meses'
      },
      acciones_realizadas: [
        { accion: 'Atencion a inspectores con equipo multidisciplinar', fecha: '2024-01-15', responsable: 'CLO' },
        { accion: 'Plan de accion para 12 hallazgos en 90 dias', fecha: '2024-01-30', responsable: 'CLO' },
        { accion: 'Implementacion de mejoras con asesoria Deloitte', fecha: '2024-02-15', responsable: 'CTO' },
        { accion: 'Cierre satisfactorio de la inspeccion', fecha: '2024-04-10', responsable: 'CLO' }
      ],
      leccion_aprendida: 'Mantener documentacion actualizada y realizar autoauditorias semestrales. La proactividad con el regulador es clave.',
      equipo_asignado: ['CLO', 'CTO', 'CFO'],
      tiempo_resolucion: '85 dias'
    }
  ];
}

// --- Funciones principales ---

/**
 * Obtener crisis activas e historicas
 */
function getCrisisActivas() {
  const crisis = getCrisisBase();
  const activas = crisis.filter(c => c.estado === 'activa');
  const historicas = crisis.filter(c => c.estado === 'resuelta');

  // Incluir crisis registradas dinamicamente
  crisisRegistradas.forEach((c) => {
    if (c.estado === 'activa') activas.push(c);
    else historicas.push(c);
  });

  return {
    resumen: {
      activas: activas.length,
      historicas: historicas.length,
      nivel_alerta_global: activas.length > 0 ? (activas.some(c => c.severidad === 'critica') ? 'rojo' : 'amarillo') : 'verde'
    },
    crisis_activas: activas,
    crisis_historicas: historicas.slice(0, 5)
  };
}

/**
 * Activar protocolo de crisis
 * @param {string} tipo - Tipo de crisis
 * @param {string} severidad - Nivel de severidad (baja, media, alta, critica)
 */
function activarProtocolo(tipo, severidad = 'media') {
  if (!tipo) {
    return { exito: false, error: 'Se requiere el tipo de crisis', tipos_validos: TIPOS_CRISIS };
  }

  if (!TIPOS_CRISIS.includes(tipo)) {
    return { exito: false, error: `Tipo de crisis no reconocido: ${tipo}`, tipos_validos: TIPOS_CRISIS };
  }

  if (!NIVELES_SEVERIDAD.includes(severidad)) {
    return { exito: false, error: `Severidad no valida: ${severidad}`, niveles_validos: NIVELES_SEVERIDAD };
  }

  const protocolos = getProtocolosCompletos();
  const protocolo = protocolos[tipo];

  const crisisId = generarId('crisis');
  const tiemposPorFase = {
    detectar: { baja: '30 min', media: '15 min', alta: '10 min', critica: '5 min' },
    evaluar: { baja: '2 h', media: '1 h', alta: '30 min', critica: '15 min' },
    comunicar: { baja: '4 h', media: '2 h', alta: '1 h', critica: '30 min' },
    responder: { baja: '24 h', media: '12 h', alta: '4 h', critica: '1 h' },
    resolver: { baja: '7 dias', media: '3 dias', alta: '24 h', critica: '12 h' },
    aprender: { baja: '30 dias', media: '15 dias', alta: '7 dias', critica: '3 dias' }
  };

  const nuevaCrisis = {
    id: crisisId,
    tipo,
    titulo: `${protocolo.nombre} - Severidad ${severidad.toUpperCase()}`,
    severidad,
    estado: 'activa',
    fase_actual: 'detectar',
    fecha_deteccion: fechaHoy(),
    fecha_activacion: fechaHoy(),
    hora_activacion: horaActual(),
    fecha_resolucion: null,
    descripcion: `Crisis de tipo ${tipo} activada con severidad ${severidad}. Protocolo ${protocolo.nombre} en ejecucion.`,
    impacto_estimado: {
      financiero: severidad === 'critica' ? 'Potencialmente > 1M EUR' : severidad === 'alta' ? '100K-500K EUR' : severidad === 'media' ? '50K-100K EUR' : '< 50K EUR',
      reputacional: severidad === 'critica' ? 'Critico' : severidad === 'alta' ? 'Alto' : 'Moderado',
      operativo: severidad === 'critica' ? 'Interrupcion total posible' : 'Interrupcion parcial'
    },
    equipo_asignado: protocolo.equipo_responsable,
    acciones_realizadas: [],
    proximos_pasos: protocolo.pasos.filter(p => p.fase === 'detectar').map(p => p.accion)
  };

  crisisRegistradas.set(crisisId, nuevaCrisis);

  return {
    exito: true,
    crisis_id: crisisId,
    mensaje: `Protocolo "${protocolo.nombre}" activado con exito. Severidad: ${severidad.toUpperCase()}.`,
    crisis: nuevaCrisis,
    protocolo_activado: {
      nombre: protocolo.nombre,
      fases: ['detectar', 'evaluar', 'comunicar', 'responder', 'resolver', 'aprender'],
      fase_actual: 'detectar',
      timeline: Object.entries(tiemposPorFase).map(([fase, tiempos]) => ({
        fase,
        tiempo_maximo: tiempos[severidad],
        estado: fase === 'detectar' ? 'en_curso' : 'pendiente'
      })),
      pasos_detallados: protocolo.pasos,
      equipo_responsable: protocolo.equipo_responsable
    },
    acciones_inmediatas: protocolo.pasos.filter(p => p.fase === 'detectar').map(p => ({
      accion: p.accion,
      responsable: p.responsable,
      tiempo_estimado: p.tiempo_estimado
    }))
  };
}

/**
 * Historial de crisis con detalles de resolucion
 */
function getHistorial() {
  const crisis = getCrisisBase();
  const historicas = crisis.filter(c => c.estado === 'resuelta');

  // Agregar historicas dinamicas
  crisisRegistradas.forEach((c) => {
    if (c.estado === 'resuelta') historicas.push(c);
  });

  const tiemposMedios = historicas
    .filter(c => c.tiempo_resolucion)
    .map(c => parseInt(c.tiempo_resolucion));

  return {
    total_crisis_historicas: historicas.length,
    tiempo_medio_resolucion: tiemposMedios.length > 0
      ? Math.round(tiemposMedios.reduce((a, b) => a + b, 0) / tiemposMedios.length) + ' dias'
      : 'N/A',
    por_tipo: historicas.reduce((acc, c) => {
      acc[c.tipo] = (acc[c.tipo] || 0) + 1;
      return acc;
    }, {}),
    por_severidad: historicas.reduce((acc, c) => {
      acc[c.severidad] = (acc[c.severidad] || 0) + 1;
      return acc;
    }, {}),
    crisis: historicas.sort((a, b) => b.fecha_deteccion.localeCompare(a.fecha_deteccion))
  };
}

/**
 * Generar comunicado de crisis para una audiencia especifica
 * @param {string} crisisId - ID de la crisis
 * @param {string} audiencia - 'clientes', 'prensa', 'regulador', 'empleados'
 */
function generarComunicado(crisisId, audiencia = 'clientes') {
  const audienciasValidas = ['clientes', 'prensa', 'regulador', 'empleados'];
  if (!audienciasValidas.includes(audiencia)) {
    return { exito: false, error: `Audiencia no valida: ${audiencia}`, audiencias_validas: audienciasValidas };
  }

  // Buscar la crisis
  let crisis = getCrisisBase().find(c => c.id === crisisId);
  if (!crisis && crisisRegistradas.has(crisisId)) {
    crisis = crisisRegistradas.get(crisisId);
  }

  if (!crisis) {
    // Generar comunicado generico si no se encuentra la crisis
    crisis = {
      id: crisisId || 'generico',
      titulo: 'Situacion en gestion',
      tipo: 'general',
      severidad: 'media'
    };
  }

  const comunicados = {
    clientes: {
      audiencia: 'clientes',
      asunto: `Informacion importante sobre ${crisis.titulo}`,
      canal: 'Email, SMS, App, Portal cliente',
      tono: 'Empatico, transparente, resolutivo',
      contenido: `Estimado/a cliente,

Nos dirigimos a usted para informarle sobre la situacion actual relativa a ${crisis.titulo}.

En ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}, hemos detectado una situacion que esta siendo gestionada con la maxima prioridad por nuestro equipo especializado.

Queremos transmitirle que:
1. Su poliza y coberturas siguen plenamente vigentes.
2. Hemos reforzado nuestros equipos para garantizar la atencion en los plazos habituales.
3. Puede contactarnos en cualquier momento a traves de nuestro telefono de atencion 24h: 900 100 200.

La proteccion de nuestros clientes es nuestra maxima prioridad. Seguiremos informandole de cualquier novedad relevante.

Atentamente,
Direccion General`,
      fecha_emision: new Date().toISOString(),
      aprobado_por: 'CMO Virtual',
      revision_legal: true
    },
    prensa: {
      audiencia: 'prensa',
      asunto: `Comunicado oficial - ${crisis.titulo}`,
      canal: 'Nota de prensa, Sala de prensa web',
      tono: 'Institucional, factual, conciso',
      contenido: `COMUNICADO OFICIAL

${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}

En relacion con las informaciones publicadas sobre ${crisis.titulo}, la compania informa:

1. La situacion ha sido detectada y esta siendo gestionada conforme a nuestros protocolos de actuacion establecidos.

2. Se ha constituido un comite de seguimiento con los maximos responsables de las areas implicadas.

3. La compania mantiene su operativa habitual con normalidad, garantizando el servicio a todos sus asegurados.

4. Se esta colaborando activamente con las autoridades competentes en todo lo que sea necesario.

La compania facilitara informacion actualizada a medida que se produzcan novedades relevantes.

Departamento de Comunicacion
Gabinete de Prensa: prensa@seguros.es | 91 XXX XX XX`,
      fecha_emision: new Date().toISOString(),
      aprobado_por: 'CEO Virtual',
      revision_legal: true
    },
    regulador: {
      audiencia: 'regulador',
      asunto: `Notificacion - ${crisis.titulo} - Ref: ${crisis.id}`,
      canal: 'Comunicacion formal via registro DGSFP',
      tono: 'Tecnico, formal, exhaustivo',
      contenido: `Ilmo/a Sr/a Director/a General de Seguros y Fondos de Pensiones,

En cumplimiento de las obligaciones de comunicacion establecidas en la normativa vigente, ponemos en su conocimiento la siguiente situacion:

NATURALEZA DEL INCIDENTE: ${crisis.titulo}
FECHA DE DETECCION: ${crisis.fecha_deteccion || fechaHoy()}
CLASIFICACION DE SEVERIDAD: ${(crisis.severidad || 'media').toUpperCase()}

DESCRIPCION: ${crisis.descripcion || 'Situacion en curso de gestion conforme a protocolos internos.'}

MEDIDAS ADOPTADAS:
- Activacion del protocolo de crisis correspondiente
- Constitucion de comite de seguimiento
- Evaluacion de impacto en curso
- Refuerzo de controles internos

IMPACTO EN ASEGURADOS: Estamos garantizando la continuidad de todos los servicios y coberturas.

PROXIMOS PASOS: Se remitira informe detallado en un plazo de 5 dias habiles.

Quedamos a su disposicion para cualquier aclaracion adicional.

Atentamente,
Director de Cumplimiento Normativo`,
      fecha_emision: new Date().toISOString(),
      aprobado_por: 'CLO Virtual',
      revision_legal: true
    },
    empleados: {
      audiencia: 'empleados',
      asunto: `Informacion interna: ${crisis.titulo}`,
      canal: 'Intranet, Email corporativo, Teams',
      tono: 'Cercano, claro, tranquilizador',
      contenido: `Estimados companeros,

Os informamos de que estamos gestionando una situacion relacionada con ${crisis.titulo}.

Lo que necesitais saber:
- La situacion esta controlada y nuestro equipo de gestion de crisis esta al mando.
- Vuestra colaboracion es esencial: si detectais algo inusual, comunicadlo inmediatamente a vuestro responsable.
- El servicio a clientes debe mantenerse con normalidad. Si recibis consultas sobre este tema, derivadlas al numero de atencion especial: ext. 5500.

Que NO debeis hacer:
- No compartais informacion sobre esta situacion en redes sociales o con medios externos.
- No especuleis sobre las causas o consecuencias.
- No faciliteis datos a terceros sin autorizacion del departamento de comunicacion.

Mantendremos informados a todos los equipos a traves de los canales habituales.

Gracias por vuestra profesionalidad.

Direccion de Personas y Organizacion`,
      fecha_emision: new Date().toISOString(),
      aprobado_por: 'CHRO Virtual',
      revision_legal: true
    }
  };

  return {
    exito: true,
    crisis_id: crisis.id,
    comunicado: comunicados[audiencia],
    instrucciones: {
      antes_de_enviar: 'Requiere aprobacion final del CEO y revision legal',
      canal_difusion: comunicados[audiencia].canal,
      seguimiento: 'Monitorizar respuestas y feedback en las siguientes 24 horas'
    }
  };
}

/**
 * Nivel de alerta global basado en senales
 */
function getNivelAlerta() {
  const crisis = getCrisisBase();
  const activas = crisis.filter(c => c.estado === 'activa');

  // Agregar activas dinamicas
  crisisRegistradas.forEach((c) => {
    if (c.estado === 'activa') activas.push(c);
  });

  const senales = [
    { fuente: 'Redes sociales', nivel: 'amarillo', detalle: 'Hashtag #SeguroQueNo con 12K menciones', peso: 2 },
    { fuente: 'Regulador', nivel: 'naranja', detalle: 'Requerimiento DGSFP sobre reservas tecnicas', peso: 3 },
    { fuente: 'Ciberseguridad', nivel: 'verde', detalle: 'Sin incidentes. Ultimo scan: sin vulnerabilidades criticas', peso: 0 },
    { fuente: 'Mercado', nivel: 'verde', detalle: 'Condiciones de mercado estables', peso: 0 },
    { fuente: 'Operaciones', nivel: 'amarillo', detalle: 'Backlog de siniestros por encima del umbral', peso: 1 },
    { fuente: 'Clima/Catastrofes', nivel: 'verde', detalle: 'Sin alertas meteorologicas AEMET significativas', peso: 0 },
    { fuente: 'Fraude', nivel: 'verde', detalle: 'Modelos de deteccion sin anomalias significativas', peso: 0 },
    { fuente: 'RRHH', nivel: 'amarillo', detalle: 'Rotacion en comercial por encima del objetivo', peso: 1 }
  ];

  const pesoTotal = senales.reduce((sum, s) => sum + s.peso, 0);
  let nivelGlobal = 'verde';
  if (pesoTotal >= 6) nivelGlobal = 'rojo';
  else if (pesoTotal >= 4) nivelGlobal = 'naranja';
  else if (pesoTotal >= 2) nivelGlobal = 'amarillo';

  return {
    nivel_global: nivelGlobal,
    puntuacion_riesgo: pesoTotal,
    escala: '0-10 (0=verde, 3=amarillo, 5=naranja, 7=rojo)',
    crisis_activas: activas.length,
    senales,
    recomendacion: nivelGlobal === 'rojo'
      ? 'ACTIVAR comite de crisis de emergencia inmediatamente'
      : nivelGlobal === 'naranja'
        ? 'Convocar reunion extraordinaria del consejo para evaluar situacion'
        : nivelGlobal === 'amarillo'
          ? 'Mantener vigilancia reforzada y seguimiento diario'
          : 'Operativa normal. Mantener monitorizacion estandar.',
    ultima_evaluacion: new Date().toISOString()
  };
}

/**
 * Obtener todos los protocolos de crisis
 */
function getProtocolos() {
  const protocolos = getProtocolosCompletos();
  const resumen = Object.entries(protocolos).map(([tipo, protocolo]) => ({
    tipo,
    nombre: protocolo.nombre,
    descripcion: protocolo.descripcion,
    tiempo_activacion: protocolo.tiempo_activacion,
    equipo_responsable: protocolo.equipo_responsable,
    total_pasos: protocolo.pasos.length,
    fases: ['detectar', 'evaluar', 'comunicar', 'responder', 'resolver', 'aprender']
  }));

  return {
    total_protocolos: resumen.length,
    tipos_crisis: TIPOS_CRISIS,
    niveles_severidad: NIVELES_SEVERIDAD,
    protocolos: resumen,
    protocolos_detallados: protocolos
  };
}

/**
 * Lecciones aprendidas de crisis pasadas
 */
function getLeccionesAprendidas() {
  const historicas = getCrisisBase().filter(c => c.estado === 'resuelta');

  const lecciones = [
    {
      crisis: 'DANA Comunidad Valenciana',
      tipo: 'catastrofe_natural',
      fecha: '2024-09-15',
      leccion: 'La respuesta rapida y el pago anticipado generaron fidelizacion excepcional. Tasa de retencion post-catastrofe del 97%.',
      acciones_implementadas: [
        'Protocolo de pago anticipado para catastrofes (< 3.000 EUR sin peritaje previo)',
        'Red de peritos de emergencia con acuerdo de movilizacion en 24h',
        'Sistema de tracking geoespacial de polizas expuestas a eventos climaticos'
      ],
      impacto: 'Reduccion tiempo medio de resolucion en catastrofes de 120 a 45 dias'
    },
    {
      crisis: 'Intento de ransomware',
      tipo: 'ciberataque',
      fecha: '2024-06-03',
      leccion: 'La inversion en SOC 24/7 y sistemas de deteccion temprana demostro su valor. El tiempo de deteccion fue de 3 minutos.',
      acciones_implementadas: [
        'Ampliacion del equipo SOC a 24/7 con 3 turnos',
        'Simulaciones de phishing mensuales a todos los empleados',
        'Segmentacion de red reforzada con microsegmentacion',
        'Backups inmutables con regla 3-2-1-1'
      ],
      impacto: 'Tiempo de deteccion reducido a < 5 minutos. Cero brechas de datos en 12 meses.'
    },
    {
      crisis: 'Red de fraude auto Levante',
      tipo: 'fraude_masivo',
      fecha: '2024-03-12',
      leccion: 'El modelo de ML es eficaz pero necesita reentrenamiento trimestral. Las redes de vinculacion entre siniestros son el indicador mas fiable.',
      acciones_implementadas: [
        'Reentrenamiento trimestral del modelo de deteccion de fraude',
        'Incorporacion de analisis de redes sociales de vinculacion',
        'Equipo anti-fraude dedicado con 4 investigadores',
        'Protocolo de colaboracion con UDEF y fiscalia'
      ],
      impacto: 'Incremento del 45% en deteccion temprana de fraude. Ahorro estimado de 600K EUR/ano.'
    },
    {
      crisis: 'Inspeccion DGSFP gobierno de datos',
      tipo: 'regulatorio',
      fecha: '2024-01-15',
      leccion: 'Mantener documentacion actualizada y realizar autoauditorias semestrales. La proactividad con el regulador reduce significativamente el riesgo de sancion.',
      acciones_implementadas: [
        'Autoauditorias semestrales de calidad de datos',
        'Dashboard de cumplimiento normativo en tiempo real',
        'Reuniones trimestrales preventivas con DGSFP',
        'Programa de certificacion interna en Solvencia II'
      ],
      impacto: 'Cierre de inspeccion sin sanciones. Mejora del 30% en calidad de datos reportados.'
    }
  ];

  return {
    total_lecciones: lecciones.length,
    lecciones,
    resumen_general: 'Las crisis gestionadas en los ultimos 18 meses han resultado en mejoras significativas en los protocolos de respuesta, deteccion temprana y resiliencia organizativa. La clave comun: velocidad de respuesta, transparencia y aprendizaje continuo.',
    areas_mejora_continua: [
      'Formacion continua de empleados en ciberseguridad',
      'Actualizacion de modelos predictivos de riesgo',
      'Mejora de tiempos de comunicacion en crisis reputacionales',
      'Refuerzo de relaciones proactivas con reguladores'
    ]
  };
}

/**
 * Estadisticas del agente de crisis
 */
function getEstadisticas() {
  const crisis = getCrisisBase();
  const activas = crisis.filter(c => c.estado === 'activa');
  const resueltas = crisis.filter(c => c.estado === 'resuelta');

  // Contar dinamicas
  let activasDinamicas = 0;
  let resueltasDinamicas = 0;
  crisisRegistradas.forEach((c) => {
    if (c.estado === 'activa') activasDinamicas++;
    else resueltasDinamicas++;
  });

  return {
    crisis_activas: activas.length + activasDinamicas,
    crisis_resueltas: resueltas.length + resueltasDinamicas,
    crisis_totales: crisis.length + crisisRegistradas.size,
    tiempo_medio_resolucion: '65 dias',
    tiempo_medio_deteccion: '12 minutos',
    protocolos_disponibles: TIPOS_CRISIS.length,
    protocolos_activos: activas.length + activasDinamicas,
    comunicados_enviados: 14,
    comunicados_mes: 3,
    eficacia_respuesta: '94.7%',
    nivel_alerta_actual: activas.length > 0 ? 'amarillo' : 'verde',
    por_tipo: crisis.reduce((acc, c) => {
      acc[c.tipo] = (acc[c.tipo] || 0) + 1;
      return acc;
    }, {}),
    por_severidad: crisis.reduce((acc, c) => {
      acc[c.severidad] = (acc[c.severidad] || 0) + 1;
      return acc;
    }, {}),
    equipo_crisis: {
      miembros: 8,
      disponibilidad: '24/7',
      ultimo_simulacro: fechaRelativa(15),
      proximo_simulacro: fechaRelativa(-30)
    },
    agente: {
      estado: 'vigilante',
      monitorizando: ['redes_sociales', 'regulador', 'ciberseguridad', 'mercado', 'clima', 'fraude', 'operaciones', 'rrhh'],
      ultima_evaluacion: new Date().toISOString()
    }
  };
}

// --- Exportaciones ---
module.exports = {
  getCrisisActivas,
  activarProtocolo,
  getHistorial,
  generarComunicado,
  getNivelAlerta,
  getProtocolos,
  getLeccionesAprendidas,
  getEstadisticas
};
