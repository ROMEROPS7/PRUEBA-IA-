// =============================================================================
// Expansion Agent - Agente de Expansion Internacional
// Sistema de IA para analisis de mercados internacionales y planificacion
// de expansion global de SiniestrosAI
// =============================================================================

const { v4: uuidv4 } = require('uuid') || { v4: () => `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };

// --- Utilidades ---
function generarId(prefijo = 'exp') {
  return `${prefijo}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function fechaHoy() {
  return new Date().toISOString().split('T')[0];
}

// --- Datos de mercados internacionales ---
const mercadosObjetivo = [
  {
    pais: 'Portugal',
    codigo: 'PT',
    idioma: 'Portugues',
    poblacion_millones: 10.3,
    mercado_seguros_billones: 12.8,
    competidores_principales: ['Fidelidade', 'Ageas Portugal', 'Allianz PT', 'Tranquilidade', 'Generali PT'],
    regulador: 'Autoridade de Supervisao de Seguros e Fundos de Pensoes (ASF)',
    oportunidad_score: 88,
    estado: 'planificacion',
    inversion_requerida: 420000,
    roi_estimado_12m: 2.4,
    moneda: 'EUR',
    barrera_entrada: 'baja',
    proximidad_cultural: 'alta',
    acuerdos_comerciales: ['UE', 'Mercado Unico Digital', 'Espacio Schengen'],
    penetracion_digital: 72,
    crecimiento_insurtech: 18.5
  },
  {
    pais: 'Francia',
    codigo: 'FR',
    idioma: 'Frances',
    poblacion_millones: 67.8,
    mercado_seguros_billones: 245.3,
    competidores_principales: ['AXA', 'BNP Paribas Cardif', 'CNP Assurances', 'Credit Agricole Assurances', 'Covea', 'Groupama'],
    regulador: 'Autorite de Controle Prudentiel et de Resolution (ACPR)',
    oportunidad_score: 82,
    estado: 'analisis',
    inversion_requerida: 1850000,
    roi_estimado_12m: 1.8,
    moneda: 'EUR',
    barrera_entrada: 'media',
    proximidad_cultural: 'media',
    acuerdos_comerciales: ['UE', 'Mercado Unico Digital', 'Espacio Schengen'],
    penetracion_digital: 78,
    crecimiento_insurtech: 22.1
  },
  {
    pais: 'Italia',
    codigo: 'IT',
    idioma: 'Italiano',
    poblacion_millones: 59.1,
    mercado_seguros_billones: 164.7,
    competidores_principales: ['Generali', 'Intesa Sanpaolo Vita', 'Unipol', 'Poste Vita', 'Allianz Italia', 'Cattolica'],
    regulador: 'Istituto per la Vigilanza sulle Assicurazioni (IVASS)',
    oportunidad_score: 76,
    estado: 'analisis',
    inversion_requerida: 1200000,
    roi_estimado_12m: 1.6,
    moneda: 'EUR',
    barrera_entrada: 'media',
    proximidad_cultural: 'alta',
    acuerdos_comerciales: ['UE', 'Mercado Unico Digital', 'Espacio Schengen'],
    penetracion_digital: 65,
    crecimiento_insurtech: 15.3
  },
  {
    pais: 'Alemania',
    codigo: 'DE',
    idioma: 'Aleman',
    poblacion_millones: 83.2,
    mercado_seguros_billones: 298.6,
    competidores_principales: ['Allianz', 'Munich Re', 'Talanx', 'R+V Versicherung', 'Debeka', 'HUK-Coburg', 'ERGO'],
    regulador: 'Bundesanstalt fur Finanzdienstleistungsaufsicht (BaFin)',
    oportunidad_score: 71,
    estado: 'analisis',
    inversion_requerida: 2400000,
    roi_estimado_12m: 1.4,
    moneda: 'EUR',
    barrera_entrada: 'alta',
    proximidad_cultural: 'baja',
    acuerdos_comerciales: ['UE', 'Mercado Unico Digital', 'Espacio Schengen'],
    penetracion_digital: 82,
    crecimiento_insurtech: 24.7
  },
  {
    pais: 'Mexico',
    codigo: 'MX',
    idioma: 'Espanol',
    poblacion_millones: 128.9,
    mercado_seguros_billones: 32.4,
    competidores_principales: ['GNP Seguros', 'Qualitas', 'AXA Mexico', 'Mapfre Mexico', 'Chubb Mexico', 'HDI Seguros'],
    regulador: 'Comision Nacional de Seguros y Fianzas (CNSF)',
    oportunidad_score: 85,
    estado: 'planificacion',
    inversion_requerida: 680000,
    roi_estimado_12m: 2.8,
    moneda: 'MXN',
    barrera_entrada: 'media',
    proximidad_cultural: 'alta',
    acuerdos_comerciales: ['T-MEC', 'Alianza del Pacifico', 'TLCUEM'],
    penetracion_digital: 58,
    crecimiento_insurtech: 31.2
  },
  {
    pais: 'Colombia',
    codigo: 'CO',
    idioma: 'Espanol',
    poblacion_millones: 51.9,
    mercado_seguros_billones: 14.2,
    competidores_principales: ['Suramericana', 'Bolivar', 'Mapfre Colombia', 'Allianz Colombia', 'Liberty Seguros', 'AXA Colpatria'],
    regulador: 'Superintendencia Financiera de Colombia (SFC)',
    oportunidad_score: 79,
    estado: 'analisis',
    inversion_requerida: 520000,
    roi_estimado_12m: 2.1,
    moneda: 'COP',
    barrera_entrada: 'media',
    proximidad_cultural: 'alta',
    acuerdos_comerciales: ['Alianza del Pacifico', 'CAN', 'Acuerdo Comercial UE-Colombia'],
    penetracion_digital: 52,
    crecimiento_insurtech: 27.8
  }
];

// --- Planes de expansion por pais ---
const planesExpansion = {
  Portugal: [
    { fase: 1, descripcion: 'Estudio de mercado y due diligence regulatoria', duracion_semanas: 4, coste: 35000, responsable: 'Dept. Estrategia', estado: 'completado' },
    { fase: 2, descripcion: 'Constitucion de filial y registro ante ASF', duracion_semanas: 8, coste: 65000, responsable: 'Dept. Legal', estado: 'en_progreso' },
    { fase: 3, descripcion: 'Adaptacion del producto al mercado portugues', duracion_semanas: 6, coste: 85000, responsable: 'Dept. Producto', estado: 'pendiente' },
    { fase: 4, descripcion: 'Contratacion equipo local (5 personas)', duracion_semanas: 6, coste: 45000, responsable: 'Dept. RRHH', estado: 'pendiente' },
    { fase: 5, descripcion: 'Integraciones con aseguradoras locales (Fidelidade, Ageas)', duracion_semanas: 10, coste: 95000, responsable: 'Dept. IT', estado: 'pendiente' },
    { fase: 6, descripcion: 'Campana de lanzamiento y marketing digital', duracion_semanas: 4, coste: 55000, responsable: 'Dept. Marketing', estado: 'pendiente' },
    { fase: 7, descripcion: 'Programa piloto con 3 corredores de seguros', duracion_semanas: 8, coste: 25000, responsable: 'Dept. Ventas', estado: 'pendiente' },
    { fase: 8, descripcion: 'Escalado comercial y optimizacion operativa', duracion_semanas: 12, coste: 15000, responsable: 'Direccion General', estado: 'pendiente' }
  ],
  Francia: [
    { fase: 1, descripcion: 'Analisis regulatorio ACPR y requisitos de licencia', duracion_semanas: 6, coste: 75000, responsable: 'Dept. Legal', estado: 'en_progreso' },
    { fase: 2, descripcion: 'Partnership estrategico con broker frances', duracion_semanas: 8, coste: 120000, responsable: 'Dept. Estrategia', estado: 'pendiente' },
    { fase: 3, descripcion: 'Localizacion completa del producto al frances', duracion_semanas: 10, coste: 180000, responsable: 'Dept. Producto', estado: 'pendiente' },
    { fase: 4, descripcion: 'Apertura oficina Paris y contratacion (12 personas)', duracion_semanas: 8, coste: 350000, responsable: 'Dept. RRHH', estado: 'pendiente' },
    { fase: 5, descripcion: 'Certificacion y cumplimiento normativo RGPD reforzado', duracion_semanas: 6, coste: 95000, responsable: 'Dept. Legal', estado: 'pendiente' },
    { fase: 6, descripcion: 'Integraciones con sistemas aseguradores franceses', duracion_semanas: 14, coste: 280000, responsable: 'Dept. IT', estado: 'pendiente' },
    { fase: 7, descripcion: 'Lanzamiento piloto en region Ile-de-France', duracion_semanas: 8, coste: 150000, responsable: 'Dept. Ventas', estado: 'pendiente' },
    { fase: 8, descripcion: 'Expansion nacional y consolidacion', duracion_semanas: 16, coste: 600000, responsable: 'Direccion General', estado: 'pendiente' }
  ],
  Mexico: [
    { fase: 1, descripcion: 'Estudio regulatorio CNSF y estructura societaria', duracion_semanas: 5, coste: 45000, responsable: 'Dept. Legal', estado: 'completado' },
    { fase: 2, descripcion: 'Alianza con corredor mexicano de seguros', duracion_semanas: 6, coste: 80000, responsable: 'Dept. Estrategia', estado: 'en_progreso' },
    { fase: 3, descripcion: 'Adaptacion producto a normativa mexicana (NOM)', duracion_semanas: 8, coste: 120000, responsable: 'Dept. Producto', estado: 'pendiente' },
    { fase: 4, descripcion: 'Contratacion equipo CDMX (8 personas)', duracion_semanas: 6, coste: 55000, responsable: 'Dept. RRHH', estado: 'pendiente' },
    { fase: 5, descripcion: 'Integracion con GNP Seguros y Qualitas', duracion_semanas: 10, coste: 140000, responsable: 'Dept. IT', estado: 'pendiente' },
    { fase: 6, descripcion: 'Campana de marketing digital y presencial', duracion_semanas: 4, coste: 75000, responsable: 'Dept. Marketing', estado: 'pendiente' },
    { fase: 7, descripcion: 'Piloto comercial en CDMX y Monterrey', duracion_semanas: 8, coste: 65000, responsable: 'Dept. Ventas', estado: 'pendiente' },
    { fase: 8, descripcion: 'Expansion a Guadalajara, Puebla y consolidacion', duracion_semanas: 14, coste: 100000, responsable: 'Direccion General', estado: 'pendiente' }
  ]
};

// --- Analisis detallado por pais ---
const analisisDetallado = {
  Portugal: {
    resumen: 'Mercado altamente atractivo por proximidad geografica, cultural e idiomatica similar. Sector seguros en plena transformacion digital con baja competencia insurtech.',
    tamano_mercado: '12.800 millones EUR en primas anuales',
    crecimiento_anual: '4.2%',
    segmento_objetivo: 'Seguros de auto y hogar - gestion de siniestros',
    regulaciones_clave: [
      'Directiva Solvencia II (transposicion nacional)',
      'Regime Juridico do Contrato de Seguro (RJCS)',
      'Regulamento RGPD aplicado a datos de seguros',
      'Normas tecnicas de la ASF sobre digitalizacion'
    ],
    barreras: ['Adaptacion linguistica al portugues', 'Certificacion ASF obligatoria', 'Red de peritos locales necesaria'],
    ventajas: ['Proximidad geografica (frontera directa)', 'Mercado UE sin barreras aduaneras', 'Baja competencia en insurtech', 'Cultura empresarial compatible'],
    timeline_entrada: '6-9 meses',
    contactos_clave: 3,
    riesgo_politico: 'bajo',
    estabilidad_economica: 'estable'
  },
  Francia: {
    resumen: 'Mayor mercado de seguros de Europa continental. Alta competencia pero enorme potencial de crecimiento en digitalizacion de siniestros.',
    tamano_mercado: '245.300 millones EUR en primas anuales',
    crecimiento_anual: '3.1%',
    segmento_objetivo: 'Gestion digital de siniestros auto y multirriesgo hogar',
    regulaciones_clave: [
      'Code des Assurances (Codigo de Seguros)',
      'Reglamentos ACPR sobre distribucion digital',
      'Loi Hamon (resiliacion de contratos)',
      'RGPD y normativa CNIL especifica',
      'IDD - Insurance Distribution Directive'
    ],
    barreras: ['Regulacion estricta ACPR', 'Alta competencia incumbente', 'Barrera idiomatica fuerte', 'Costes operativos elevados Paris'],
    ventajas: ['Mayor mercado de la eurozona', 'Alto grado de digitalizacion', 'Apetito por innovacion insurtech', 'Acceso a talento tech'],
    timeline_entrada: '12-18 meses',
    contactos_clave: 1,
    riesgo_politico: 'bajo',
    estabilidad_economica: 'estable'
  },
  Italia: {
    resumen: 'Tercer mercado de seguros de la UE con fuerte tradicion en auto. Oportunidad en modernizacion de procesos de siniestros aun muy manuales.',
    tamano_mercado: '164.700 millones EUR en primas anuales',
    crecimiento_anual: '2.8%',
    segmento_objetivo: 'RC Auto y siniestros hogar - automatizacion',
    regulaciones_clave: [
      'Codice delle Assicurazioni Private',
      'Regolamenti IVASS sobre intermediacion digital',
      'Normativa antifrode seguros auto',
      'GDPR implementacion italiana',
      'Direttiva IDD transpuesta'
    ],
    barreras: ['Burocracia administrativa elevada', 'Fragmentacion regional del mercado', 'Cultura empresarial conservadora', 'Sistema judicial lento'],
    ventajas: ['Mercado auto muy grande', 'Baja penetracion de insurtech', 'Proximidad cultural latina', 'Interes creciente en digitalizacion'],
    timeline_entrada: '10-14 meses',
    contactos_clave: 2,
    riesgo_politico: 'medio',
    estabilidad_economica: 'estable'
  },
  Alemania: {
    resumen: 'Mayor economia de la UE y mercado de seguros mas sofisticado. Exige maxima calidad y cumplimiento normativo pero ofrece el mayor potencial.',
    tamano_mercado: '298.600 millones EUR en primas anuales',
    crecimiento_anual: '2.4%',
    segmento_objetivo: 'Kfz-Versicherung (seguros auto) y Wohngebaude (hogar)',
    regulaciones_clave: [
      'Versicherungsvertragsgesetz (VVG)',
      'Regulacion BaFin estricta sobre insurtech',
      'Datenschutz-Grundverordnung (DSGVO)',
      'IT-Sicherheitsgesetz 2.0',
      'Mindestanforderungen an die Geschaeftsorganisation (MaGo)'
    ],
    barreras: ['Regulacion BaFin muy estricta', 'Barrera idiomatica total', 'Competencia de gigantes (Allianz, Munich Re)', 'Altos costes de entrada', 'Cultura empresarial exigente'],
    ventajas: ['Mayor mercado de seguros de la UE', 'Alta disposicion a pagar', 'Infraestructura digital excelente', 'Ecosistema insurtech maduro'],
    timeline_entrada: '18-24 meses',
    contactos_clave: 0,
    riesgo_politico: 'bajo',
    estabilidad_economica: 'muy estable'
  },
  Mexico: {
    resumen: 'Mayor mercado hispanohablante con bajo nivel de penetracion de seguros. Enorme oportunidad de crecimiento en clase media emergente.',
    tamano_mercado: '32.400 millones USD en primas anuales',
    crecimiento_anual: '7.8%',
    segmento_objetivo: 'Seguros de auto obligatorio y voluntario - siniestros',
    regulaciones_clave: [
      'Ley de Instituciones de Seguros y Fianzas (LISF)',
      'Circular Unica de Seguros y Fianzas (CUSF)',
      'Normativa CNSF sobre insurtech',
      'Ley Federal de Proteccion de Datos Personales (LFPDPPP)',
      'NOM sobre seguros obligatorios de auto'
    ],
    barreras: ['Normativa CNSF especifica', 'Infraestructura de telecomunicaciones desigual', 'Competencia de incumbentes fuertes', 'Tipo de cambio volatil'],
    ventajas: ['Mismo idioma', 'Mercado en alto crecimiento', 'Baja penetracion de seguros', 'Poblacion joven y digitalizada', 'T-MEC como ventaja comercial'],
    timeline_entrada: '8-12 meses',
    contactos_clave: 2,
    riesgo_politico: 'medio',
    estabilidad_economica: 'estable'
  },
  Colombia: {
    resumen: 'Mercado asegurador en rapida expansion con fuerte impulso regulatorio hacia la digitalizacion. Puerta de entrada a region andina.',
    tamano_mercado: '14.200 millones USD en primas anuales',
    crecimiento_anual: '9.2%',
    segmento_objetivo: 'Seguros obligatorios SOAT y voluntarios auto/hogar',
    regulaciones_clave: [
      'Estatuto Organico del Sistema Financiero (EOSF)',
      'Decretos SFC sobre innovacion financiera',
      'Sandbox regulatorio de la SFC',
      'Ley 1581 de Proteccion de Datos Personales',
      'Normativa SOAT (seguro obligatorio auto)'
    ],
    barreras: ['Infraestructura tecnologica en desarrollo', 'Complejidad tributaria regional', 'Seguridad juridica variable', 'Desafios de conectividad en zonas rurales'],
    ventajas: ['Mismo idioma y cultura cercana', 'Sandbox regulatorio favorable', 'Alto crecimiento del mercado', 'Gobierno pro-innovacion', 'Puerta a mercado andino'],
    timeline_entrada: '8-12 meses',
    contactos_clave: 1,
    riesgo_politico: 'medio',
    estabilidad_economica: 'estable'
  }
};

// =============================================================================
// FUNCIONES PRINCIPALES DEL AGENTE
// =============================================================================

/**
 * Obtiene todas las oportunidades de mercado ordenadas por puntuacion
 */
function getOportunidades() {
  const oportunidades = mercadosObjetivo
    .map(m => ({
      ...m,
      analisis_disponible: !!analisisDetallado[m.pais],
      plan_disponible: !!planesExpansion[m.pais],
      fecha_actualizacion: fechaHoy()
    }))
    .sort((a, b) => b.oportunidad_score - a.oportunidad_score);

  return {
    total_mercados: oportunidades.length,
    inversion_total_estimada: oportunidades.reduce((sum, m) => sum + m.inversion_requerida, 0),
    mercado_potencial_total: oportunidades.reduce((sum, m) => sum + m.mercado_seguros_billones, 0).toFixed(1) + ' billones EUR',
    poblacion_total_accesible: oportunidades.reduce((sum, m) => sum + m.poblacion_millones, 0).toFixed(1) + ' millones',
    oportunidades,
    fecha_consulta: fechaHoy()
  };
}

/**
 * Analisis detallado de un pais especifico
 */
function getAnalisisPais(pais) {
  const mercado = mercadosObjetivo.find(m => m.pais.toLowerCase() === pais.toLowerCase());
  if (!mercado) {
    return { error: `Pais '${pais}' no encontrado en mercados objetivo`, paises_disponibles: mercadosObjetivo.map(m => m.pais) };
  }

  const analisis = analisisDetallado[mercado.pais] || {};
  return {
    mercado,
    analisis_detallado: analisis,
    competidores_detalle: mercado.competidores_principales.map((c, i) => ({
      nombre: c,
      posicion_mercado: i + 1,
      tipo: i === 0 ? 'Lider' : i < 3 ? 'Challenger' : 'Seguidor',
      fortaleza_digital: ['alta', 'media', 'alta', 'baja', 'media', 'media'][i] || 'media'
    })),
    indicadores: {
      atractivo_mercado: mercado.oportunidad_score,
      facilidad_entrada: mercado.barrera_entrada === 'baja' ? 85 : mercado.barrera_entrada === 'media' ? 60 : 35,
      compatibilidad_producto: mercado.proximidad_cultural === 'alta' ? 90 : mercado.proximidad_cultural === 'media' ? 65 : 40,
      potencial_crecimiento: mercado.crecimiento_insurtech
    },
    recomendacion: mercado.oportunidad_score >= 80 ? 'Prioridad alta - Proceder con planificacion inmediata' :
                   mercado.oportunidad_score >= 70 ? 'Prioridad media - Profundizar analisis antes de decidir' :
                   'Prioridad baja - Monitorizar y reevaluar en 6 meses',
    fecha_analisis: fechaHoy()
  };
}

/**
 * Plan de expansion para un pais especifico
 */
function getPlanExpansion(pais) {
  const mercado = mercadosObjetivo.find(m => m.pais.toLowerCase() === pais.toLowerCase());
  if (!mercado) {
    return { error: `Pais '${pais}' no encontrado`, paises_disponibles: mercadosObjetivo.map(m => m.pais) };
  }

  const plan = planesExpansion[mercado.pais];
  if (!plan) {
    return {
      pais: mercado.pais,
      estado: 'Sin plan definido',
      mensaje: `El mercado de ${mercado.pais} esta en fase de analisis. Se requiere completar el analisis antes de generar un plan de expansion.`,
      oportunidad_score: mercado.oportunidad_score
    };
  }

  const costeTotal = plan.reduce((sum, f) => sum + f.coste, 0);
  const duracionTotal = plan.reduce((sum, f) => sum + f.duracion_semanas, 0);
  const fasesCompletadas = plan.filter(f => f.estado === 'completado').length;

  return {
    pais: mercado.pais,
    codigo: mercado.codigo,
    estado_expansion: mercado.estado,
    plan_detallado: plan,
    resumen: {
      total_fases: plan.length,
      fases_completadas: fasesCompletadas,
      fases_en_progreso: plan.filter(f => f.estado === 'en_progreso').length,
      fases_pendientes: plan.filter(f => f.estado === 'pendiente').length,
      progreso_porcentaje: Math.round((fasesCompletadas / plan.length) * 100),
      coste_total: costeTotal,
      coste_ejecutado: plan.filter(f => f.estado === 'completado').reduce((s, f) => s + f.coste, 0),
      duracion_total_semanas: duracionTotal,
      duracion_total_meses: Math.round(duracionTotal / 4.33),
      roi_estimado: mercado.roi_estimado_12m
    },
    equipo_necesario: [...new Set(plan.map(f => f.responsable))],
    proximo_hito: plan.find(f => f.estado === 'en_progreso') || plan.find(f => f.estado === 'pendiente'),
    fecha_consulta: fechaHoy()
  };
}

/**
 * Datos para visualizacion de mapa mundial
 */
function getMapaMundial() {
  const colores = {
    operativo: '#10b981',
    entrada: '#3b82f6',
    planificacion: '#f59e0b',
    analisis: '#8b5cf6'
  };

  return {
    pais_origen: {
      pais: 'Espana',
      codigo: 'ES',
      estado: 'operativo',
      color: colores.operativo,
      coordenadas: { lat: 40.4168, lng: -3.7038 },
      descripcion: 'Sede central - Madrid'
    },
    mercados_objetivo: mercadosObjetivo.map(m => ({
      pais: m.pais,
      codigo: m.codigo,
      estado: m.estado,
      color: colores[m.estado] || '#64748b',
      oportunidad_score: m.oportunidad_score,
      inversion: m.inversion_requerida,
      coordenadas: {
        PT: { lat: 38.7223, lng: -9.1393 },
        FR: { lat: 48.8566, lng: 2.3522 },
        IT: { lat: 41.9028, lng: 12.4964 },
        DE: { lat: 52.5200, lng: 13.4050 },
        MX: { lat: 19.4326, lng: -99.1332 },
        CO: { lat: 4.7110, lng: -74.0721 }
      }[m.codigo]
    })),
    leyenda: Object.entries(colores).map(([estado, color]) => ({ estado, color })),
    fecha_actualizacion: fechaHoy()
  };
}

/**
 * Estadisticas generales del programa de expansion
 */
function getEstadisticas() {
  const mercados = mercadosObjetivo;
  const inversionTotal = mercados.reduce((sum, m) => sum + m.inversion_requerida, 0);
  const roiPromedio = mercados.reduce((sum, m) => sum + m.roi_estimado_12m, 0) / mercados.length;

  return {
    mercados_analizados: mercados.length,
    en_proceso: mercados.filter(m => m.estado === 'planificacion' || m.estado === 'entrada').length,
    operativos: mercados.filter(m => m.estado === 'operativo').length,
    en_analisis: mercados.filter(m => m.estado === 'analisis').length,
    en_planificacion: mercados.filter(m => m.estado === 'planificacion').length,
    inversion_total: inversionTotal,
    inversion_total_formateado: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(inversionTotal),
    roi_global: parseFloat(roiPromedio.toFixed(2)),
    mercado_potencial_total_billones: parseFloat(mercados.reduce((sum, m) => sum + m.mercado_seguros_billones, 0).toFixed(1)),
    poblacion_accesible_millones: parseFloat(mercados.reduce((sum, m) => sum + m.poblacion_millones, 0).toFixed(1)),
    score_promedio_oportunidad: Math.round(mercados.reduce((sum, m) => sum + m.oportunidad_score, 0) / mercados.length),
    mejor_oportunidad: mercados.reduce((best, m) => m.oportunidad_score > best.oportunidad_score ? m : best).pais,
    mercados_por_estado: {
      analisis: mercados.filter(m => m.estado === 'analisis').map(m => m.pais),
      planificacion: mercados.filter(m => m.estado === 'planificacion').map(m => m.pais),
      entrada: mercados.filter(m => m.estado === 'entrada').map(m => m.pais),
      operativo: mercados.filter(m => m.estado === 'operativo').map(m => m.pais)
    },
    planes_definidos: Object.keys(planesExpansion).length,
    fecha_informe: fechaHoy()
  };
}

// =============================================================================
// EXPORTACIONES
// =============================================================================

module.exports = {
  getOportunidades,
  getAnalisisPais,
  getPlanExpansion,
  getMapaMundial,
  getEstadisticas,
  mercadosObjetivo
};
