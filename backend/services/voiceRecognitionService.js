// =============================================================================
// Voice Recognition Service - Reconocimiento de Voz Avanzado
// Identificacion biometrica, analisis emocional, deteccion de idioma,
// transcripcion en tiempo real y alertas por palabras clave
// =============================================================================

const voicePrints = [
  { clienteId: 'CLI-001', nombre: 'Maria Garcia Lopez', muestra_registrada: '2025-03-10T09:00:00Z', idioma_principal: 'es', emociones_detectadas: ['tranquilo', 'nervioso'], palabras_clave_detectadas: ['poliza', 'cobertura'], confianza_identificacion: 0.97 },
  { clienteId: 'CLI-002', nombre: 'Carlos Martinez Ruiz', muestra_registrada: '2025-04-15T11:30:00Z', idioma_principal: 'es', emociones_detectadas: ['enfadado', 'desesperado'], palabras_clave_detectadas: ['urgente', 'abogado'], confianza_identificacion: 0.94 },
  { clienteId: 'CLI-003', nombre: 'Ana Fernandez Torres', muestra_registrada: '2025-05-20T14:15:00Z', idioma_principal: 'es', emociones_detectadas: ['tranquilo'], palabras_clave_detectadas: ['renovacion'], confianza_identificacion: 0.98 },
  { clienteId: 'CLI-004', nombre: 'Jean-Pierre Dubois', muestra_registrada: '2025-06-01T08:45:00Z', idioma_principal: 'fr', emociones_detectadas: ['nervioso', 'triste'], palabras_clave_detectadas: ['accidente', 'heridos'], confianza_identificacion: 0.91 },
  { clienteId: 'CLI-005', nombre: 'Ahmed Ben Salah', muestra_registrada: '2025-06-12T10:00:00Z', idioma_principal: 'ar', emociones_detectadas: ['tranquilo', 'nervioso'], palabras_clave_detectadas: ['denuncia'], confianza_identificacion: 0.89 },
  { clienteId: 'CLI-006', nombre: 'Laura Sanchez Perez', muestra_registrada: '2025-07-03T16:20:00Z', idioma_principal: 'es', emociones_detectadas: ['desesperado', 'enfadado'], palabras_clave_detectadas: ['robo', 'urgente', 'denuncia'], confianza_identificacion: 0.96 },
  { clienteId: 'CLI-007', nombre: 'Thomas Mueller', muestra_registrada: '2025-07-18T13:00:00Z', idioma_principal: 'de', emociones_detectadas: ['tranquilo'], palabras_clave_detectadas: ['poliza'], confianza_identificacion: 0.93 },
  { clienteId: 'CLI-008', nombre: 'Sofia Romero Diaz', muestra_registrada: '2025-08-05T09:30:00Z', idioma_principal: 'es', emociones_detectadas: ['triste', 'nervioso'], palabras_clave_detectadas: ['heridos', 'accidente'], confianza_identificacion: 0.95 }
];

const registroIdentificaciones = [
  { id: 'RID-001', clienteId: 'CLI-001', timestamp: '2025-09-01T09:12:00Z', confianza: 0.96, exito: true, tiempo_ms: 1230 },
  { id: 'RID-002', clienteId: 'CLI-003', timestamp: '2025-09-01T10:45:00Z', confianza: 0.97, exito: true, tiempo_ms: 980 },
  { id: 'RID-003', clienteId: null, timestamp: '2025-09-02T08:30:00Z', confianza: 0.32, exito: false, tiempo_ms: 2100 },
  { id: 'RID-004', clienteId: 'CLI-002', timestamp: '2025-09-02T11:15:00Z', confianza: 0.93, exito: true, tiempo_ms: 1450 },
  { id: 'RID-005', clienteId: 'CLI-006', timestamp: '2025-09-03T14:00:00Z', confianza: 0.95, exito: true, tiempo_ms: 1100 },
  { id: 'RID-006', clienteId: 'CLI-004', timestamp: '2025-09-03T15:20:00Z', confianza: 0.90, exito: true, tiempo_ms: 1680 },
  { id: 'RID-007', clienteId: null, timestamp: '2025-09-04T09:00:00Z', confianza: 0.28, exito: false, tiempo_ms: 2300 },
  { id: 'RID-008', clienteId: 'CLI-008', timestamp: '2025-09-04T10:30:00Z', confianza: 0.94, exito: true, tiempo_ms: 1050 },
  { id: 'RID-009', clienteId: 'CLI-005', timestamp: '2025-09-05T08:45:00Z', confianza: 0.88, exito: true, tiempo_ms: 1900 },
  { id: 'RID-010', clienteId: 'CLI-007', timestamp: '2025-09-05T12:10:00Z', confianza: 0.92, exito: true, tiempo_ms: 1320 },
  { id: 'RID-011', clienteId: 'CLI-001', timestamp: '2025-09-06T09:05:00Z', confianza: 0.97, exito: true, tiempo_ms: 890 },
  { id: 'RID-012', clienteId: null, timestamp: '2025-09-06T14:30:00Z', confianza: 0.41, exito: false, tiempo_ms: 2050 },
  { id: 'RID-013', clienteId: 'CLI-003', timestamp: '2025-09-07T10:00:00Z', confianza: 0.98, exito: true, tiempo_ms: 920 },
  { id: 'RID-014', clienteId: 'CLI-006', timestamp: '2025-09-07T16:45:00Z', confianza: 0.94, exito: true, tiempo_ms: 1150 },
  { id: 'RID-015', clienteId: 'CLI-002', timestamp: '2025-09-08T11:20:00Z', confianza: 0.91, exito: true, tiempo_ms: 1400 },
  { id: 'RID-016', clienteId: 'CLI-008', timestamp: '2025-09-08T13:55:00Z', confianza: 0.95, exito: true, tiempo_ms: 1020 }
];

const PALABRAS_CLAVE_ALERTA = ['abogado', 'denuncia', 'robo', 'urgente', 'heridos'];

const EMOCIONES = ['tranquilo', 'nervioso', 'enfadado', 'triste', 'desesperado'];

const RECOMENDACIONES_TONO = {
  tranquilo: 'Mantener tono profesional y cordial. El cliente esta calmado, aprovechar para ofrecer informacion detallada.',
  nervioso: 'Usar tono pausado y tranquilizador. Confirmar que se esta gestionando su caso. Evitar tecnicismos.',
  enfadado: 'Mantener la calma. Escuchar activamente sin interrumpir. Mostrar empatia y ofrecer soluciones concretas. Evitar frases como "segun la politica..."',
  triste: 'Tono empatico y comprensivo. Transmitir cercania. Asegurar que se le va a ayudar en todo el proceso.',
  desesperado: 'PRIORIDAD ALTA: Tono calmado pero firme. Transmitir control de la situacion. Ofrecer soluciones inmediatas. Considerar escalar a supervisor si es necesario.'
};

const IDIOMAS_SOPORTADOS = [
  { codigo: 'es', nombre: 'Espanol' },
  { codigo: 'en', nombre: 'Ingles' },
  { codigo: 'fr', nombre: 'Frances' },
  { codigo: 'de', nombre: 'Aleman' },
  { codigo: 'ar', nombre: 'Arabe' }
];

let contadorIdentificaciones = registroIdentificaciones.length;

/**
 * Identifica a un cliente por su huella vocal
 */
function identificarPorVoz(audioData) {
  const inicio = Date.now();

  if (!audioData || (typeof audioData === 'object' && !audioData.buffer && !audioData.samples)) {
    return {
      identificado: false,
      clienteId: null,
      nombre: null,
      confianza: 0,
      tiempo_ms: Date.now() - inicio,
      error: 'Datos de audio invalidos o vacios'
    };
  }

  // Simular comparacion biometrica contra todas las huellas registradas
  const resultados = voicePrints.map(vp => {
    // Generar confianza simulada basada en la calidad del registro original
    const variacion = (Math.random() * 0.12) - 0.06; // +/- 6%
    const confianza = Math.min(1, Math.max(0, vp.confianza_identificacion + variacion));
    return { ...vp, confianza_actual: confianza };
  });

  // Ordenar por confianza descendente
  resultados.sort((a, b) => b.confianza_actual - a.confianza_actual);
  const mejor = resultados[0];
  const umbral = 0.80;
  const identificado = mejor.confianza_actual >= umbral;
  const tiempo_ms = Date.now() - inicio + Math.floor(Math.random() * 800) + 800; // 800-1600ms simulado

  contadorIdentificaciones++;
  const registro = {
    id: `RID-${String(contadorIdentificaciones).padStart(3, '0')}`,
    clienteId: identificado ? mejor.clienteId : null,
    timestamp: new Date().toISOString(),
    confianza: Math.round(mejor.confianza_actual * 100) / 100,
    exito: identificado,
    tiempo_ms
  };
  registroIdentificaciones.push(registro);

  return {
    identificado,
    clienteId: identificado ? mejor.clienteId : null,
    nombre: identificado ? mejor.nombre : null,
    confianza: Math.round(mejor.confianza_actual * 100) / 100,
    tiempo_ms,
    idioma_detectado: identificado ? mejor.idioma_principal : null,
    candidatos_cercanos: identificado ? [] : resultados.slice(0, 3).map(r => ({
      clienteId: r.clienteId,
      nombre: r.nombre,
      confianza: Math.round(r.confianza_actual * 100) / 100
    }))
  };
}

/**
 * Analiza la emocion detectada en el audio
 */
function analizarEmocion(audioData) {
  if (!audioData) {
    return { error: 'Datos de audio requeridos', emocion_principal: null, intensidad: 0, recomendacion_tono: null };
  }

  // Simular analisis emocional con distribucion realista
  const pesos = { tranquilo: 0.30, nervioso: 0.30, enfadado: 0.20, triste: 0.10, desesperado: 0.10 };
  const rand = Math.random();
  let acumulado = 0;
  let emocionSeleccionada = 'tranquilo';

  for (const [emocion, peso] of Object.entries(pesos)) {
    acumulado += peso;
    if (rand <= acumulado) {
      emocionSeleccionada = emocion;
      break;
    }
  }

  // Intensidad basada en la emocion
  const rangosIntensidad = {
    tranquilo: { min: 10, max: 40 },
    nervioso: { min: 35, max: 75 },
    enfadado: { min: 50, max: 90 },
    triste: { min: 30, max: 70 },
    desesperado: { min: 65, max: 100 }
  };

  const rango = rangosIntensidad[emocionSeleccionada];
  const intensidad = Math.floor(Math.random() * (rango.max - rango.min + 1)) + rango.min;

  // Emociones secundarias
  const emocionesFiltradas = EMOCIONES.filter(e => e !== emocionSeleccionada);
  const secundarias = emocionesFiltradas
    .map(e => ({ emocion: e, intensidad: Math.floor(Math.random() * 30) + 5 }))
    .sort((a, b) => b.intensidad - a.intensidad)
    .slice(0, 2);

  return {
    emocion_principal: emocionSeleccionada,
    intensidad,
    emociones_secundarias: secundarias,
    recomendacion_tono: RECOMENDACIONES_TONO[emocionSeleccionada],
    indicadores: {
      velocidad_habla: emocionSeleccionada === 'nervioso' || emocionSeleccionada === 'desesperado' ? 'rapida' : emocionSeleccionada === 'triste' ? 'lenta' : 'normal',
      volumen: emocionSeleccionada === 'enfadado' || emocionSeleccionada === 'desesperado' ? 'alto' : emocionSeleccionada === 'triste' ? 'bajo' : 'normal',
      pausas_frecuentes: emocionSeleccionada === 'nervioso' || emocionSeleccionada === 'triste',
      tono_voz: emocionSeleccionada === 'enfadado' ? 'agudo' : emocionSeleccionada === 'triste' ? 'grave' : 'medio'
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Detecta el idioma del audio
 */
function detectarIdioma(audioData) {
  if (!audioData) {
    return { error: 'Datos de audio requeridos', idioma: null, confianza: 0 };
  }

  // Simular deteccion con preferencia hacia espanol (70%)
  const distribucion = [
    { codigo: 'es', nombre: 'Espanol', peso: 0.70 },
    { codigo: 'en', nombre: 'Ingles', peso: 0.10 },
    { codigo: 'fr', nombre: 'Frances', peso: 0.08 },
    { codigo: 'de', nombre: 'Aleman', peso: 0.07 },
    { codigo: 'ar', nombre: 'Arabe', peso: 0.05 }
  ];

  const rand = Math.random();
  let acumulado = 0;
  let idiomaDetectado = distribucion[0];

  for (const idioma of distribucion) {
    acumulado += idioma.peso;
    if (rand <= acumulado) {
      idiomaDetectado = idioma;
      break;
    }
  }

  const confianza = Math.round((Math.random() * 0.15 + 0.82) * 100) / 100; // 0.82 - 0.97

  // Alternativas con confianzas menores
  const alternativas = distribucion
    .filter(i => i.codigo !== idiomaDetectado.codigo)
    .map(i => ({
      codigo: i.codigo,
      nombre: i.nombre,
      confianza: Math.round((Math.random() * 0.15 + 0.05) * 100) / 100
    }))
    .sort((a, b) => b.confianza - a.confianza);

  return {
    idioma: idiomaDetectado.codigo,
    nombre_idioma: idiomaDetectado.nombre,
    confianza,
    alternativas,
    timestamp: new Date().toISOString()
  };
}

/**
 * Transcribe audio en tiempo real
 */
function transcribirEnTiempoReal(audioData) {
  if (!audioData) {
    return { error: 'Datos de audio requeridos', texto: null };
  }

  const frasesCliente = [
    'Buenos dias, llamo porque he tenido un accidente de trafico esta manana.',
    'El otro vehiculo se salto un semaforo en rojo y me golpeo en el lateral derecho.',
    'Si, tengo fotos del accidente y el parte amigable firmado por ambas partes.',
    'Necesito saber si mi poliza cubre los danos del vehiculo y los gastos medicos.',
    'Los heridos ya fueron atendidos en el hospital, pero necesito que vengan a valorar los danos.',
    'Es urgente porque necesito el coche para trabajar, no tengo otro medio de transporte.',
    'Mi numero de poliza es el 4587-2023-AUTO, esta a nombre de Garcia Lopez.',
    'Quiero poner una denuncia tambien porque el otro conductor se dio a la fuga inicialmente.',
    'He hablado con un abogado y me ha dicho que contacte con ustedes primero.',
    'El robo fue en el parking del centro comercial, hay camaras de seguridad.',
    'Estoy muy preocupada porque el perito aun no ha venido a ver los danos.',
    'Necesito un coche de sustitucion mientras reparan el mio, esta en mi poliza.'
  ];

  const frasesAgente = [
    'Buenos dias, soy Laura del departamento de siniestros. En que puedo ayudarle?',
    'Entiendo su situacion. Voy a abrir un expediente ahora mismo para gestionar su caso.',
    'Me puede indicar su numero de poliza para verificar sus coberturas?',
    'Perfecto, veo que tiene cobertura a todo riesgo con franquicia de 300 euros.',
    'Vamos a enviar un perito en las proximas 24 horas para valorar los danos.',
    'Tiene derecho a vehiculo de sustitucion durante 15 dias segun su poliza.',
    'Le confirmo que queda registrado el siniestro con referencia SIN-2025-0847.',
    'Si necesita asistencia legal, tambien esta incluida en su cobertura.'
  ];

  const esCliente = Math.random() > 0.4;
  const frases = esCliente ? frasesCliente : frasesAgente;
  const texto = frases[Math.floor(Math.random() * frases.length)];
  const hablante = esCliente ? 'cliente' : 'agente';

  // Detectar palabras clave en el texto
  const textoLower = texto.toLowerCase();
  const palabras_clave_detectadas = PALABRAS_CLAVE_ALERTA.filter(kw => textoLower.includes(kw));

  return {
    texto,
    hablante,
    timestamp: new Date().toISOString(),
    palabras_clave_detectadas,
    duracion_segmento_ms: Math.floor(Math.random() * 5000) + 2000,
    confianza_transcripcion: Math.round((Math.random() * 0.08 + 0.91) * 100) / 100,
    idioma_detectado: 'es'
  };
}

/**
 * Verifica si un texto contiene palabras clave que requieren alerta
 */
function alertasPorPalabraClave(texto) {
  if (!texto || typeof texto !== 'string') {
    return { alertas: [], texto_analizado: '', total_alertas: 0 };
  }

  const textoLower = texto.toLowerCase();

  const definicionesAlerta = {
    abogado: {
      nivel: 'alto',
      categoria: 'legal',
      accion_requerida: 'Escalar a departamento juridico. El cliente ha mencionado representacion legal.',
      protocolo: 'Protocolo L-001: No hacer declaraciones vinculantes. Informar al supervisor.'
    },
    denuncia: {
      nivel: 'alto',
      categoria: 'legal',
      accion_requerida: 'Registrar intencion de denuncia. Verificar si ya existe denuncia policial asociada.',
      protocolo: 'Protocolo L-002: Solicitar numero de atestado policial. Derivar a siniestros graves.'
    },
    robo: {
      nivel: 'critico',
      categoria: 'seguridad',
      accion_requerida: 'Activar protocolo anti-fraude. Verificar denuncia policial obligatoria.',
      protocolo: 'Protocolo S-001: Exigir denuncia policial. Activar investigacion SIU si importe > 3000 EUR.'
    },
    urgente: {
      nivel: 'medio',
      categoria: 'prioridad',
      accion_requerida: 'Priorizar gestion del caso. Evaluar si requiere atencion inmediata.',
      protocolo: 'Protocolo P-001: Respuesta en menos de 2 horas. Asignar gestor dedicado.'
    },
    heridos: {
      nivel: 'critico',
      categoria: 'salud',
      accion_requerida: 'PRIORIDAD MAXIMA. Verificar estado de los heridos. Activar cobertura sanitaria inmediata.',
      protocolo: 'Protocolo M-001: Confirmar asistencia medica. Activar seguro de responsabilidad civil. Notificar a direccion.'
    }
  };

  const alertas = [];

  for (const [palabra, definicion] of Object.entries(definicionesAlerta)) {
    if (textoLower.includes(palabra)) {
      // Encontrar posicion en el texto
      const posicion = textoLower.indexOf(palabra);
      const contexto = texto.substring(Math.max(0, posicion - 30), Math.min(texto.length, posicion + palabra.length + 30));

      alertas.push({
        palabra_clave: palabra,
        nivel: definicion.nivel,
        categoria: definicion.categoria,
        accion_requerida: definicion.accion_requerida,
        protocolo: definicion.protocolo,
        contexto: `...${contexto}...`,
        posicion_en_texto: posicion,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Ordenar por nivel de severidad
  const ordenNivel = { critico: 0, alto: 1, medio: 2 };
  alertas.sort((a, b) => (ordenNivel[a.nivel] || 99) - (ordenNivel[b.nivel] || 99));

  return {
    alertas,
    texto_analizado: texto,
    total_alertas: alertas.length,
    tiene_alertas_criticas: alertas.some(a => a.nivel === 'critico'),
    requiere_escalado: alertas.some(a => a.nivel === 'critico' || a.nivel === 'alto'),
    timestamp: new Date().toISOString()
  };
}

/**
 * Obtiene estadisticas generales del servicio de reconocimiento de voz
 */
function getEstadisticas() {
  const total_identificaciones = registroIdentificaciones.length;
  const exitosas = registroIdentificaciones.filter(r => r.exito).length;
  const fallidas = total_identificaciones - exitosas;
  const precision = total_identificaciones > 0 ? Math.round((exitosas / total_identificaciones) * 10000) / 100 : 0;

  const tiempos = registroIdentificaciones.map(r => r.tiempo_ms);
  const tiempo_promedio_ms = tiempos.length > 0 ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;
  const tiempo_min_ms = tiempos.length > 0 ? Math.min(...tiempos) : 0;
  const tiempo_max_ms = tiempos.length > 0 ? Math.max(...tiempos) : 0;

  // Idiomas detectados
  const idiomasMap = {};
  voicePrints.forEach(vp => {
    const idioma = IDIOMAS_SOPORTADOS.find(i => i.codigo === vp.idioma_principal);
    const nombre = idioma ? idioma.nombre : vp.idioma_principal;
    idiomasMap[nombre] = (idiomasMap[nombre] || 0) + 1;
  });
  const idiomas_detectados = Object.entries(idiomasMap).map(([idioma, cantidad]) => ({ idioma, cantidad })).sort((a, b) => b.cantidad - a.cantidad);

  // Emociones frecuentes
  const emocionesMap = {};
  voicePrints.forEach(vp => {
    vp.emociones_detectadas.forEach(e => {
      emocionesMap[e] = (emocionesMap[e] || 0) + 1;
    });
  });
  const emociones_frecuentes = Object.entries(emocionesMap).map(([emocion, frecuencia]) => ({ emocion, frecuencia })).sort((a, b) => b.frecuencia - a.frecuencia);

  // Palabras clave mas detectadas
  const palabrasMap = {};
  voicePrints.forEach(vp => {
    vp.palabras_clave_detectadas.forEach(p => {
      palabrasMap[p] = (palabrasMap[p] || 0) + 1;
    });
  });
  const palabras_clave_frecuentes = Object.entries(palabrasMap).map(([palabra, frecuencia]) => ({ palabra, frecuencia })).sort((a, b) => b.frecuencia - a.frecuencia);

  return {
    total_identificaciones,
    identificaciones_exitosas: exitosas,
    identificaciones_fallidas: fallidas,
    precision,
    tiempo_promedio_ms,
    tiempo_min_ms,
    tiempo_max_ms,
    total_huellas_registradas: voicePrints.length,
    idiomas_detectados,
    emociones_frecuentes,
    palabras_clave_frecuentes,
    idiomas_soportados: IDIOMAS_SOPORTADOS,
    ultima_actualizacion: new Date().toISOString()
  };
}

module.exports = {
  identificarPorVoz,
  analizarEmocion,
  detectarIdioma,
  transcribirEnTiempoReal,
  alertasPorPalabraClave,
  getEstadisticas,
  voicePrints,
  registroIdentificaciones
};
