// =============================================================================
// Innovacion Agent - Agente de Innovacion e InsurTech
// Sistema de IA para monitorizacion de tendencias, gestion del roadmap
// de innovacion y benchmarking competitivo global
// =============================================================================

const { v4: uuidv4 } = require('uuid') || { v4: () => `inn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };

// --- Utilidades ---
function generarId(prefijo = 'inn') {
  return `${prefijo}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function fechaHoy() {
  return new Date().toISOString().split('T')[0];
}

// =============================================================================
// DATOS DE TENDENCIAS INSURTECH GLOBALES
// =============================================================================

const tendenciasInsurTech = [
  {
    id: 'TEND-001',
    nombre: 'IA Generativa aplicada a seguros',
    descripcion: 'Uso de modelos de lenguaje avanzados (LLMs) para automatizar la redaccion de polizas, evaluacion de siniestros, atencion al cliente y deteccion de fraude. Transformacion radical de procesos manuales.',
    impacto: 'alto',
    madurez: 'crecimiento',
    aplicabilidad_score: 95,
    ejemplos: ['ChatGPT para atencion al asegurado', 'Generacion automatica de informes periciales', 'Analisis de clausulado con NLP'],
    empresas_referentes: ['Lemonade', 'Tractable', 'Shift Technology'],
    inversion_global_2024: '4.200 millones USD',
    tendencia_crecimiento: 'acelerada'
  },
  {
    id: 'TEND-002',
    nombre: 'Blockchain en seguros',
    descripcion: 'Contratos inteligentes para ejecucion automatica de polizas, trazabilidad de siniestros, prevencion de fraude y reaseguro descentralizado. Reduccion de intermediarios y costes operativos.',
    impacto: 'medio',
    madurez: 'emergente',
    aplicabilidad_score: 62,
    ejemplos: ['Smart contracts para pagos automaticos', 'Registro inmutable de siniestros', 'Tokenizacion de riesgo'],
    empresas_referentes: ['Etherisc', 'B3i', 'RiskStream'],
    inversion_global_2024: '890 millones USD',
    tendencia_crecimiento: 'moderada'
  },
  {
    id: 'TEND-003',
    nombre: 'IoT para seguros conectados',
    descripcion: 'Sensores en hogar, vehiculos e industria que permiten monitorizacion en tiempo real del riesgo, prevencion de siniestros y tarificacion dinamica basada en datos reales.',
    impacto: 'alto',
    madurez: 'crecimiento',
    aplicabilidad_score: 78,
    ejemplos: ['Sensores de agua y humo en hogar', 'Cajas negras vehiculares', 'Wearables para seguros de salud'],
    empresas_referentes: ['Neos', 'Roost', 'Ring (Amazon)'],
    inversion_global_2024: '3.100 millones USD',
    tendencia_crecimiento: 'acelerada'
  },
  {
    id: 'TEND-004',
    nombre: 'Telemetria y seguros por uso',
    descripcion: 'Tarificacion basada en comportamiento real del conductor mediante telematica. Pay-as-you-drive (PAYD) y pay-how-you-drive (PHYD) como modelos disruptivos.',
    impacto: 'alto',
    madurez: 'maduro',
    aplicabilidad_score: 85,
    ejemplos: ['Apps de conduccion con scoring', 'OBD-II para tarificacion', 'Seguros por kilometro'],
    empresas_referentes: ['Root Insurance', 'By Miles', 'Metromile'],
    inversion_global_2024: '2.400 millones USD',
    tendencia_crecimiento: 'estable'
  },
  {
    id: 'TEND-005',
    nombre: 'Seguros parametricos',
    descripcion: 'Polizas que se activan automaticamente al cumplirse parametros objetivos medibles (precipitacion, viento, retrasos de vuelo). Eliminan la necesidad de tramitacion de siniestros.',
    impacto: 'alto',
    madurez: 'crecimiento',
    aplicabilidad_score: 72,
    ejemplos: ['Seguro de cosechas por sequia', 'Seguro de viaje por retraso', 'Seguro catastrofico por terremoto'],
    empresas_referentes: ['FloodFlash', 'Descartes Underwriting', 'Arbol'],
    inversion_global_2024: '1.800 millones USD',
    tendencia_crecimiento: 'acelerada'
  },
  {
    id: 'TEND-006',
    nombre: 'Embedded Insurance',
    descripcion: 'Seguros integrados en el punto de venta de productos y servicios (e-commerce, alquiler de vehiculos, plataformas digitales). Distribucion invisible y contextual.',
    impacto: 'alto',
    madurez: 'crecimiento',
    aplicabilidad_score: 88,
    ejemplos: ['Seguro al comprar un movil', 'Cobertura integrada en Airbnb', 'Seguros en checkout de e-commerce'],
    empresas_referentes: ['Bolttech', 'Cover Genius', 'Qover'],
    inversion_global_2024: '5.200 millones USD',
    tendencia_crecimiento: 'acelerada'
  },
  {
    id: 'TEND-007',
    nombre: 'Micro-seguros digitales',
    descripcion: 'Coberturas de bajo coste y corta duracion distribuidas via movil para segmentos desatendidos. Democratizacion del acceso al seguro en mercados emergentes.',
    impacto: 'medio',
    madurez: 'crecimiento',
    aplicabilidad_score: 68,
    ejemplos: ['Seguro diario para repartidores', 'Cobertura por evento para freelancers', 'Micro-poliza de salud movil'],
    empresas_referentes: ['BIMA', 'MicroEnsure', 'Inclusivity Solutions'],
    inversion_global_2024: '1.200 millones USD',
    tendencia_crecimiento: 'acelerada'
  },
  {
    id: 'TEND-008',
    nombre: 'Seguros peer-to-peer (P2P)',
    descripcion: 'Modelo donde grupos de asegurados comparten riesgo entre ellos, con devolucion de primas no utilizadas. Mayor transparencia y alineacion de incentivos.',
    impacto: 'bajo',
    madurez: 'emergente',
    aplicabilidad_score: 45,
    ejemplos: ['Pools de riesgo entre comunidades', 'Seguro social entre amigos', 'DAOs de seguro descentralizado'],
    empresas_referentes: ['Lemonade (original)', 'Friendsurance', 'TongJuBao'],
    inversion_global_2024: '320 millones USD',
    tendencia_crecimiento: 'lenta'
  },
  {
    id: 'TEND-009',
    nombre: 'Integracion con neobancos',
    descripcion: 'Alianzas estrategicas con neobancos y fintech para distribucion cruzada de seguros a traves de super-apps financieras. Acceso a base de clientes digitales.',
    impacto: 'medio',
    madurez: 'crecimiento',
    aplicabilidad_score: 81,
    ejemplos: ['Seguro integrado en Revolut', 'Oferta de seguros en N26', 'Bundle bancario-asegurador digital'],
    empresas_referentes: ['Revolut Insurance', 'N26 Insurance', 'Nubank Seguros'],
    inversion_global_2024: '2.800 millones USD',
    tendencia_crecimiento: 'acelerada'
  },
  {
    id: 'TEND-010',
    nombre: 'IA para riesgo climatico',
    descripcion: 'Modelos predictivos de inteligencia artificial para evaluacion de riesgo climatico, pricing de catastrofes naturales y adaptacion de carteras al cambio climatico.',
    impacto: 'alto',
    madurez: 'emergente',
    aplicabilidad_score: 74,
    ejemplos: ['Modelizacion de inundaciones con ML', 'Pricing dinamico por riesgo climatico', 'Early warning systems con IA'],
    empresas_referentes: ['Jupiter Intelligence', 'ClimateAi', 'One Concern'],
    inversion_global_2024: '1.500 millones USD',
    tendencia_crecimiento: 'acelerada'
  }
];

// =============================================================================
// ROADMAP DE INNOVACION
// =============================================================================

const roadmapInnovacion = [
  {
    id: 'ROAD-001',
    titulo: 'Motor de IA generativa para informes periciales',
    descripcion: 'Desarrollo de un modelo LLM fine-tuned para generar informes periciales completos a partir de fotos, datos del siniestro y historico. Reduccion del 70% en tiempo de elaboracion.',
    trimestre: 'Q1 2026',
    estado: 'desarrollo',
    impacto_estimado: 'Ahorro de 180.000 EUR/ano',
    coste_estimado: 95000,
    responsable: 'Elena Martinez - CTO',
    progreso: 65,
    tecnologias: ['GPT-4', 'Computer Vision', 'Fine-tuning', 'RAG']
  },
  {
    id: 'ROAD-002',
    titulo: 'Plataforma de seguros parametricos para clima',
    descripcion: 'Sistema automatizado de seguros que se activan al detectar eventos climaticos (granizo, inundacion) mediante datos meteorologicos en tiempo real. Pago instantaneo sin tramitacion.',
    trimestre: 'Q2 2026',
    estado: 'evaluacion',
    impacto_estimado: 'Nuevo vertical de 500.000 EUR/ano',
    coste_estimado: 220000,
    responsable: 'Carlos Ruiz - Director Producto',
    progreso: 25,
    tecnologias: ['APIs meteorologicas', 'Smart Contracts', 'Geolocation', 'Event Processing']
  },
  {
    id: 'ROAD-003',
    titulo: 'SDK de Embedded Insurance para e-commerce',
    descripcion: 'Kit de desarrollo para integrar seguros de SiniestrosAI directamente en plataformas de e-commerce, marketplaces y apps de movilidad. Distribucion en punto de venta digital.',
    trimestre: 'Q1 2026',
    estado: 'desarrollo',
    impacto_estimado: 'Canal de 1.2M EUR/ano en 18 meses',
    coste_estimado: 180000,
    responsable: 'Ana Lopez - Directora Comercial',
    progreso: 45,
    tecnologias: ['REST API', 'Web Components', 'React SDK', 'Webhook Events']
  },
  {
    id: 'ROAD-004',
    titulo: 'Telemetria vehicular con scoring IA',
    descripcion: 'App movil con telemetria avanzada que analiza el comportamiento de conduccion y genera un scoring de riesgo en tiempo real. Base para seguros pay-per-use.',
    trimestre: 'Q3 2026',
    estado: 'idea',
    impacto_estimado: 'Diferenciacion competitiva + 15% mas precision en pricing',
    coste_estimado: 310000,
    responsable: 'Miguel Fernandez - Director IT',
    progreso: 5,
    tecnologias: ['React Native', 'Acelerometro', 'GPS', 'ML Models', 'Edge Computing']
  },
  {
    id: 'ROAD-005',
    titulo: 'Chatbot multilingue para expansion internacional',
    descripcion: 'Asistente virtual con soporte para espanol, portugues, frances, italiano y aleman. Atencion al asegurado 24/7 con comprension contextual del siniestro.',
    trimestre: 'Q2 2026',
    estado: 'desarrollo',
    impacto_estimado: 'Reduccion 40% en costes de atencion al cliente',
    coste_estimado: 145000,
    responsable: 'Elena Martinez - CTO',
    progreso: 55,
    tecnologias: ['LLM Multilingual', 'RAG', 'Voice Synthesis', 'Sentiment Analysis']
  },
  {
    id: 'ROAD-006',
    titulo: 'Blockchain para trazabilidad de siniestros',
    descripcion: 'Registro inmutable de toda la cadena de gestion del siniestro en blockchain privada. Transparencia total para asegurado, aseguradora y regulador.',
    trimestre: 'Q4 2026',
    estado: 'idea',
    impacto_estimado: 'Reduccion 25% en disputas y litigios',
    coste_estimado: 280000,
    responsable: 'Miguel Fernandez - Director IT',
    progreso: 0,
    tecnologias: ['Hyperledger Fabric', 'Smart Contracts', 'DID', 'ZK-Proofs']
  },
  {
    id: 'ROAD-007',
    titulo: 'Computer Vision para valoracion de danos',
    descripcion: 'Sistema de vision por computador que analiza fotografias de vehiculos danados y genera automaticamente un presupuesto de reparacion con precision del 92%.',
    trimestre: 'Q1 2026',
    estado: 'lanzado',
    impacto_estimado: 'Ahorro de 240.000 EUR/ano en peritaciones',
    coste_estimado: 165000,
    responsable: 'Elena Martinez - CTO',
    progreso: 100,
    tecnologias: ['YOLO v8', 'Segment Anything', 'Transfer Learning', 'Cloud GPU']
  },
  {
    id: 'ROAD-008',
    titulo: 'Integracion con neobancos espanoles',
    descripcion: 'Conexion API con Revolut, N26 y Bnext para ofrecer seguros de SiniestrosAI dentro de las apps bancarias. Canal de captacion masivo con conversion estimada del 3.5%.',
    trimestre: 'Q3 2026',
    estado: 'evaluacion',
    impacto_estimado: 'Acceso a 2M usuarios potenciales',
    coste_estimado: 190000,
    responsable: 'Ana Lopez - Directora Comercial',
    progreso: 15,
    tecnologias: ['Open Banking API', 'PSD2', 'OAuth 2.0', 'Webhook Integration']
  }
];

// =============================================================================
// IDEAS EN EVALUACION
// =============================================================================

const ideasEvaluacion = [
  {
    id: 'IDEA-001',
    titulo: 'Seguro de mascotas con wearable IoT',
    descripcion: 'Collar inteligente que monitoriza la salud del animal y activa coberturas automaticamente ante accidentes o enfermedades detectadas.',
    autor: 'Equipo de Producto',
    fecha_propuesta: '2026-01-15',
    viabilidad_score: 72,
    impacto_score: 65,
    coste_score: 55,
    puntuacion_total: 64,
    estado: 'en_evaluacion',
    votos_equipo: 14,
    comentarios: 'Mercado en crecimiento. Requiere alianza con fabricante de wearables.'
  },
  {
    id: 'IDEA-002',
    titulo: 'Micro-seguro para patinetes electricos',
    descripcion: 'Cobertura activable por trayecto via QR code. Seguro de responsabilidad civil y danos propios para usuarios de patinetes compartidos.',
    autor: 'Departamento Comercial',
    fecha_propuesta: '2026-02-03',
    viabilidad_score: 88,
    impacto_score: 74,
    coste_score: 82,
    puntuacion_total: 81,
    estado: 'en_evaluacion',
    votos_equipo: 22,
    comentarios: 'Alta demanda regulatoria. Posible obligatoriedad en 2026. Oportunidad inmediata.'
  },
  {
    id: 'IDEA-003',
    titulo: 'Plataforma de subrogacion colaborativa con IA',
    descripcion: 'Red de aseguradoras que comparten datos de siniestros para agilizar subrogaciones mediante matching automatico con IA.',
    autor: 'Equipo de IA',
    fecha_propuesta: '2026-01-28',
    viabilidad_score: 65,
    impacto_score: 92,
    coste_score: 48,
    puntuacion_total: 68,
    estado: 'en_evaluacion',
    votos_equipo: 18,
    comentarios: 'Gran impacto potencial pero requiere cooperacion entre competidores.'
  },
  {
    id: 'IDEA-004',
    titulo: 'Gamificacion de prevencion de siniestros',
    descripcion: 'App con sistema de puntos, logros y recompensas que incentiva comportamientos preventivos del asegurado. Descuentos en prima por buenas practicas.',
    autor: 'Departamento de Marketing',
    fecha_propuesta: '2026-02-12',
    viabilidad_score: 80,
    impacto_score: 58,
    coste_score: 75,
    puntuacion_total: 71,
    estado: 'en_evaluacion',
    votos_equipo: 16,
    comentarios: 'Diferenciacion competitiva alta. Existen casos de exito en salud (Vitality).'
  },
  {
    id: 'IDEA-005',
    titulo: 'Digital twin de viviendas aseguradas',
    descripcion: 'Replica digital 3D de inmuebles asegurados mediante LIDAR movil. Permite valoracion de danos remota y simulacion de riesgos.',
    autor: 'Equipo de I+D',
    fecha_propuesta: '2026-03-01',
    viabilidad_score: 45,
    impacto_score: 85,
    coste_score: 30,
    puntuacion_total: 53,
    estado: 'en_evaluacion',
    votos_equipo: 11,
    comentarios: 'Tecnologia muy innovadora pero alto coste y baja madurez del mercado.'
  },
  {
    id: 'IDEA-006',
    titulo: 'Asistente de voz para declaracion de siniestros',
    descripcion: 'Sistema de voz con NLP que permite al asegurado declarar un siniestro hablando naturalmente por telefono. Transcripcion y apertura automatica del expediente.',
    autor: 'Departamento IT',
    fecha_propuesta: '2026-02-20',
    viabilidad_score: 82,
    impacto_score: 78,
    coste_score: 70,
    puntuacion_total: 77,
    estado: 'en_evaluacion',
    votos_equipo: 20,
    comentarios: 'Muy alineado con nuestra estrategia. Tecnologia madura. Alta aceptacion esperada.'
  }
];

// =============================================================================
// BENCHMARK COMPETITIVO GLOBAL
// =============================================================================

const competidoresGlobales = [
  { nombre: 'Lemonade', pais: 'EEUU', fundacion: 2015, valoracion: '2.1B USD', modelo: 'IA-first, P2P' },
  { nombre: 'Root Insurance', pais: 'EEUU', fundacion: 2015, valoracion: '900M USD', modelo: 'Telemetria movil' },
  { nombre: 'Hippo', pais: 'EEUU', fundacion: 2015, valoracion: '1.5B USD', modelo: 'Smart home + seguros' },
  { nombre: 'Wefox', pais: 'Alemania', fundacion: 2015, valoracion: '4.5B USD', modelo: 'Plataforma digital B2B2C' },
  { nombre: 'Alan', pais: 'Francia', fundacion: 2016, valoracion: '2.7B USD', modelo: 'Salud digital' },
  { nombre: 'Cuvva', pais: 'Reino Unido', fundacion: 2014, valoracion: '120M USD', modelo: 'Seguros por hora' },
  { nombre: 'Zego', pais: 'Reino Unido', fundacion: 2016, valoracion: '1.1B USD', modelo: 'Seguros comerciales gig economy' },
  { nombre: 'By Miles', pais: 'Reino Unido', fundacion: 2016, valoracion: '85M USD', modelo: 'Pay-per-mile auto' }
];

const matrizFeatures = {
  features: [
    'IA para siniestros',
    'App movil nativa',
    'Contratacion digital 100%',
    'Pago instantaneo',
    'Telemetria vehicular',
    'IoT hogar',
    'Seguros parametricos',
    'Embedded insurance SDK',
    'Chatbot IA 24/7',
    'Computer vision danos',
    'Deteccion fraude IA',
    'API abierta',
    'Multi-idioma',
    'B2B white-label'
  ],
  comparativa: {
    'SiniestrosAI':  [true,  false, true,  true,  false, false, false, true,  true,  true,  true,  true,  true,  true],
    'Lemonade':      [true,  true,  true,  true,  false, false, false, false, true,  true,  true,  true,  false, false],
    'Root Insurance':[false, true,  true,  false, true,  false, false, false, true,  false, true,  false, false, false],
    'Hippo':         [false, true,  true,  true,  false, true,  false, false, true,  false, false, false, false, false],
    'Wefox':         [true,  true,  true,  false, false, false, false, true,  true,  false, true,  true,  true,  true],
    'Alan':          [false, true,  true,  true,  false, false, false, false, true,  false, false, true,  true,  false],
    'Cuvva':         [false, true,  true,  true,  false, false, false, false, true,  false, false, false, false, false],
    'Zego':          [false, true,  true,  true,  true,  false, false, true,  true,  false, true,  true,  false, true],
    'By Miles':      [false, true,  true,  false, true,  false, false, false, false, false, false, false, false, false]
  }
};

// =============================================================================
// FUNCIONES PRINCIPALES DEL AGENTE
// =============================================================================

/**
 * Obtiene todas las tendencias InsurTech monitorizadas
 */
function getTendencias() {
  const tendencias = tendenciasInsurTech
    .map(t => ({ ...t }))
    .sort((a, b) => b.aplicabilidad_score - a.aplicabilidad_score);

  const porImpacto = {
    alto: tendencias.filter(t => t.impacto === 'alto').length,
    medio: tendencias.filter(t => t.impacto === 'medio').length,
    bajo: tendencias.filter(t => t.impacto === 'bajo').length
  };

  const porMadurez = {
    emergente: tendencias.filter(t => t.madurez === 'emergente').length,
    crecimiento: tendencias.filter(t => t.madurez === 'crecimiento').length,
    maduro: tendencias.filter(t => t.madurez === 'maduro').length
  };

  return {
    total_tendencias: tendencias.length,
    tendencias,
    resumen_impacto: porImpacto,
    resumen_madurez: porMadurez,
    score_promedio: Math.round(tendencias.reduce((s, t) => s + t.aplicabilidad_score, 0) / tendencias.length),
    top_3_aplicables: tendencias.slice(0, 3).map(t => t.nombre),
    fecha_actualizacion: fechaHoy()
  };
}

/**
 * Obtiene el roadmap de innovacion completo
 */
function getRoadmap() {
  const items = roadmapInnovacion.map(r => ({ ...r }));

  const porEstado = {
    idea: items.filter(r => r.estado === 'idea').length,
    evaluacion: items.filter(r => r.estado === 'evaluacion').length,
    desarrollo: items.filter(r => r.estado === 'desarrollo').length,
    lanzado: items.filter(r => r.estado === 'lanzado').length
  };

  const inversionTotal = items.reduce((s, r) => s + r.coste_estimado, 0);
  const progresoPromedio = Math.round(items.reduce((s, r) => s + r.progreso, 0) / items.length);

  return {
    total_items: items.length,
    roadmap: items,
    resumen_estado: porEstado,
    inversion_total: inversionTotal,
    inversion_formateada: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(inversionTotal),
    progreso_global: progresoPromedio,
    trimestres_cubiertos: [...new Set(items.map(r => r.trimestre))].sort(),
    proximos_lanzamientos: items.filter(r => r.estado === 'desarrollo').sort((a, b) => b.progreso - a.progreso),
    fecha_actualizacion: fechaHoy()
  };
}

/**
 * Obtiene las ideas en fase de evaluacion
 */
function getIdeas() {
  const ideas = ideasEvaluacion
    .map(i => ({ ...i }))
    .sort((a, b) => b.puntuacion_total - a.puntuacion_total);

  return {
    total_ideas: ideas.length,
    ideas,
    mejor_idea: ideas[0],
    promedio_viabilidad: Math.round(ideas.reduce((s, i) => s + i.viabilidad_score, 0) / ideas.length),
    promedio_impacto: Math.round(ideas.reduce((s, i) => s + i.impacto_score, 0) / ideas.length),
    promedio_coste: Math.round(ideas.reduce((s, i) => s + i.coste_score, 0) / ideas.length),
    votos_totales: ideas.reduce((s, i) => s + i.votos_equipo, 0),
    recomendacion_top_3: ideas.slice(0, 3).map(i => ({
      titulo: i.titulo,
      puntuacion: i.puntuacion_total,
      razon: i.comentarios
    })),
    fecha_evaluacion: fechaHoy()
  };
}

/**
 * Benchmark competitivo con competidores globales
 */
function getBenchmark() {
  const features = matrizFeatures.features;
  const comparativa = matrizFeatures.comparativa;

  const scores = {};
  for (const [empresa, valores] of Object.entries(comparativa)) {
    scores[empresa] = {
      features_totales: valores.filter(Boolean).length,
      porcentaje: Math.round((valores.filter(Boolean).length / features.length) * 100),
      detalle: features.reduce((obj, f, idx) => {
        obj[f] = valores[idx];
        return obj;
      }, {})
    };
  }

  const ranking = Object.entries(scores)
    .sort((a, b) => b[1].features_totales - a[1].features_totales)
    .map(([empresa, data], idx) => ({
      posicion: idx + 1,
      empresa,
      ...data,
      info: competidoresGlobales.find(c => c.nombre === empresa) || (empresa === 'SiniestrosAI' ? { pais: 'Espana', fundacion: 2024, valoracion: 'Pre-seed', modelo: 'IA-first gestion siniestros' } : null)
    }));

  const ventajasCompetitivas = features.filter((f, idx) => {
    const siniestrosAI = comparativa['SiniestrosAI'][idx];
    if (!siniestrosAI) return false;
    const otrosConFeature = Object.entries(comparativa)
      .filter(([emp]) => emp !== 'SiniestrosAI')
      .filter(([, vals]) => vals[idx]).length;
    return otrosConFeature <= 2;
  });

  const brechas = features.filter((f, idx) => {
    const siniestrosAI = comparativa['SiniestrosAI'][idx];
    if (siniestrosAI) return false;
    const otrosConFeature = Object.entries(comparativa)
      .filter(([emp]) => emp !== 'SiniestrosAI')
      .filter(([, vals]) => vals[idx]).length;
    return otrosConFeature >= 4;
  });

  return {
    total_competidores: competidoresGlobales.length,
    total_features: features.length,
    features,
    competidores: competidoresGlobales,
    matriz: comparativa,
    ranking,
    posicion_siniestrosai: ranking.findIndex(r => r.empresa === 'SiniestrosAI') + 1,
    ventajas_competitivas: ventajasCompetitivas,
    brechas_a_cerrar: brechas,
    fecha_benchmark: fechaHoy()
  };
}

/**
 * Estadisticas generales de innovacion
 */
function getEstadisticas() {
  return {
    tendencias_monitorizadas: tendenciasInsurTech.length,
    ideas_en_evaluacion: ideasEvaluacion.length,
    proyectos_activos: roadmapInnovacion.filter(r => r.estado === 'desarrollo' || r.estado === 'evaluacion').length,
    innovaciones_lanzadas: roadmapInnovacion.filter(r => r.estado === 'lanzado').length,
    inversion_innovacion_total: roadmapInnovacion.reduce((s, r) => s + r.coste_estimado, 0),
    inversion_formateada: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
      roadmapInnovacion.reduce((s, r) => s + r.coste_estimado, 0)
    ),
    competidores_analizados: competidoresGlobales.length,
    posicion_competitiva: 'Top 3 en features de IA',
    progreso_roadmap: Math.round(roadmapInnovacion.reduce((s, r) => s + r.progreso, 0) / roadmapInnovacion.length),
    proxima_innovacion: roadmapInnovacion
      .filter(r => r.estado === 'desarrollo')
      .sort((a, b) => b.progreso - a.progreso)[0]?.titulo || 'N/A',
    score_innovacion_global: 82,
    fecha_informe: fechaHoy()
  };
}

// =============================================================================
// EXPORTACIONES
// =============================================================================

module.exports = {
  getTendencias,
  getRoadmap,
  getIdeas,
  getBenchmark,
  getEstadisticas,
  tendenciasInsurTech,
  roadmapInnovacion,
  ideasEvaluacion,
  competidoresGlobales
};
