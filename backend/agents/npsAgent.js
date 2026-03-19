const { v4: uuidv4 } = require('uuid');

// ============================================================================
// BASE DE DATOS EN MEMORIA - ENCUESTAS DE SATISFACCIÓN
// ============================================================================

const encuestas = [
  // PROMOTORES (9-10) — ~45%
  { id: 'enc-001', clienteId: 'CLI-001', nombre: 'María López Fernández', expediente: 'EXP-2025-0412', puntuacion: 10, comentario: 'Excelente gestión. Me resolvieron el siniestro en una semana. El perito vino al día siguiente.', fecha: '2026-01-25', tipo_siniestro: 'colision_trasera', tiempo_resolucion: 7 },
  { id: 'enc-002', clienteId: 'CLI-003', nombre: 'Pilar Hernández Ruiz', expediente: 'EXP-2025-0298', puntuacion: 9, comentario: 'Muy contenta con la rapidez. La subrogación se resolvió sin problemas y recuperé todo.', fecha: '2026-01-10', tipo_siniestro: 'colision_lateral', tiempo_resolucion: 12 },
  { id: 'enc-003', clienteId: 'CLI-005', nombre: 'Carmen Rodríguez Blanco', expediente: 'EXP-2026-0041', puntuacion: 10, comentario: 'Increíble servicio. Me llamaron a las 4 AM y a las 9 ya tenía grúa y coche de sustitución.', fecha: '2026-03-08', tipo_siniestro: 'atropello_vehiculo', tiempo_resolucion: 5 },
  { id: 'enc-004', clienteId: 'CLI-012', nombre: 'Javier Moreno Sala', expediente: 'EXP-2026-0067', puntuacion: 9, comentario: 'Muy profesionales. El tramitador me mantuvo informado en todo momento.', fecha: '2026-02-14', tipo_siniestro: 'rotura_lunas', tiempo_resolucion: 3 },
  { id: 'enc-005', clienteId: 'CLI-015', nombre: 'Ana Belén Prieto García', expediente: 'EXP-2026-0089', puntuacion: 10, comentario: 'Reparación perfecta y rápida. El taller fue genial y la aseguradora coordinó todo.', fecha: '2026-02-20', tipo_siniestro: 'colision_aparcamiento', tiempo_resolucion: 8 },
  { id: 'enc-006', clienteId: 'CLI-018', nombre: 'Pedro Sánchez Millán', expediente: 'EXP-2025-0901', puntuacion: 9, comentario: 'Buen servicio en general. Solo tardaron un poco en enviar al perito pero después todo rápido.', fecha: '2025-12-15', tipo_siniestro: 'colision_frontal', tiempo_resolucion: 15 },
  { id: 'enc-007', clienteId: 'CLI-021', nombre: 'Rocío Delgado Martín', expediente: 'EXP-2026-0102', puntuacion: 10, comentario: 'Todo perfecto. La app para seguir el estado del siniestro es muy útil.', fecha: '2026-02-28', tipo_siniestro: 'robo_parcial', tiempo_resolucion: 10 },
  { id: 'enc-008', clienteId: 'CLI-024', nombre: 'Alberto Vázquez López', expediente: 'EXP-2026-0134', puntuacion: 9, comentario: 'Contento con la resolución aunque la franquicia me pareció un poco alta.', fecha: '2026-03-01', tipo_siniestro: 'colision_rotonda', tiempo_resolucion: 11 },
  { id: 'enc-009', clienteId: 'CLI-027', nombre: 'Silvia Romero Ortiz', expediente: 'EXP-2025-0856', puntuacion: 10, comentario: 'De 10. Mejor aseguradora que he tenido. El servicio de asistencia en carretera fue impecable.', fecha: '2025-11-30', tipo_siniestro: 'averia_mecanica', tiempo_resolucion: 1 },
  { id: 'enc-010', clienteId: 'CLI-030', nombre: 'Diego Navarro Campos', expediente: 'EXP-2026-0156', puntuacion: 9, comentario: 'Buena experiencia. Resolución rápida y sin complicaciones.', fecha: '2026-03-10', tipo_siniestro: 'colision_trasera', tiempo_resolucion: 9 },
  { id: 'enc-011', clienteId: 'CLI-033', nombre: 'Laura Jiménez Blanco', expediente: 'EXP-2026-0178', puntuacion: 10, comentario: 'Servicio excepcional. Me facilitaron vehículo de sustitución el mismo día.', fecha: '2026-03-14', tipo_siniestro: 'colision_semaforo', tiempo_resolucion: 6 },
  { id: 'enc-012', clienteId: 'CLI-036', nombre: 'Manuel Torres Iglesias', expediente: 'EXP-2026-0045', puntuacion: 9, comentario: 'Muy satisfecho. Comunicación clara y transparente durante todo el proceso.', fecha: '2026-01-28', tipo_siniestro: 'incendio_vehiculo', tiempo_resolucion: 14 },
  { id: 'enc-013', clienteId: 'CLI-039', nombre: 'Beatriz Ruiz Serrano', expediente: 'EXP-2025-0945', puntuacion: 9, comentario: 'Proceso sencillo y sin papeleos excesivos. Repetiré con esta aseguradora.', fecha: '2025-12-20', tipo_siniestro: 'rotura_lunas', tiempo_resolucion: 2 },

  // NEUTROS (7-8) — ~25%
  { id: 'enc-014', clienteId: 'CLI-002', nombre: 'Antonio García Martín', expediente: 'EXP-2025-0523', puntuacion: 7, comentario: 'El servicio fue correcto pero la negociación con la otra aseguradora se alargó demasiado. Tres meses de espera.', fecha: '2026-02-20', tipo_siniestro: 'colision_frontal', tiempo_resolucion: 45 },
  { id: 'enc-015', clienteId: 'CLI-007', nombre: 'Roberto Jiménez Ortiz', expediente: 'EXP-2026-0098', puntuacion: 8, comentario: 'Bien en general. El perito tardó una semana en venir, lo cual me pareció mucho.', fecha: '2026-02-10', tipo_siniestro: 'colision_semaforo', tiempo_resolucion: 20 },
  { id: 'enc-016', clienteId: 'CLI-010', nombre: 'Cristina Fernández Rojo', expediente: 'EXP-2025-0789', puntuacion: 7, comentario: 'Aceptable. Eché en falta más información durante el proceso. Tuve que llamar yo varias veces.', fecha: '2025-11-15', tipo_siniestro: 'colision_aparcamiento', tiempo_resolucion: 25 },
  { id: 'enc-017', clienteId: 'CLI-013', nombre: 'Raúl Serrano Vidal', expediente: 'EXP-2026-0218', puntuacion: 8, comentario: 'Correcto. La reparación bien pero el tiempo de espera para coche de sustitución fue excesivo.', fecha: '2026-03-18', tipo_siniestro: 'marcha_atras', tiempo_resolucion: 18 },
  { id: 'enc-018', clienteId: 'CLI-016', nombre: 'Marta Gómez Herrera', expediente: 'EXP-2026-0078', puntuacion: 7, comentario: 'Normal. Nada destacable ni para bien ni para mal. Cumplieron con lo esperado.', fecha: '2026-02-05', tipo_siniestro: 'colision_trasera', tiempo_resolucion: 22 },
  { id: 'enc-019', clienteId: 'CLI-019', nombre: 'Óscar Delgado Mora', expediente: 'EXP-2025-0812', puntuacion: 8, comentario: 'Satisfecho con la reparación pero no con los tiempos de respuesta telefónica.', fecha: '2025-11-25', tipo_siniestro: 'colision_lateral', tiempo_resolucion: 19 },
  { id: 'enc-020', clienteId: 'CLI-022', nombre: 'Patricia Iglesias Rojo', expediente: 'EXP-2026-0201', puntuacion: 7, comentario: 'El proceso fue largo. Me dijeron 15 días y tardaron un mes.', fecha: '2026-03-15', tipo_siniestro: 'colision_incorporacion', tiempo_resolucion: 30 },
  { id: 'enc-021', clienteId: 'CLI-025', nombre: 'Gonzalo Martín Flores', expediente: 'EXP-2026-0123', puntuacion: 8, comentario: 'Buena gestión del siniestro. Solo me habría gustado más rapidez en la peritación.', fecha: '2026-02-25', tipo_siniestro: 'colision_rotonda', tiempo_resolucion: 16 },

  // DETRACTORES (0-6) — ~30%
  { id: 'enc-022', clienteId: 'CLI-004', nombre: 'José Manuel Pérez Vega', expediente: 'EXP-2025-0671', puntuacion: 5, comentario: 'Tardaron mucho en resolver. Dos meses para un golpe en aparcamiento es inaceptable. La comunicación fue nula.', fecha: '2026-03-05', tipo_siniestro: 'colision_aparcamiento', tiempo_resolucion: 60 },
  { id: 'enc-023', clienteId: 'CLI-006', nombre: 'Elena Martínez Soler', expediente: 'EXP-2026-0112', puntuacion: 4, comentario: 'Muy mala experiencia. Llevo más de un mes sin coche y la aseguradora contraria no paga. Nadie me da soluciones.', fecha: '2026-03-12', tipo_siniestro: 'colision_rotonda', tiempo_resolucion: null },
  { id: 'enc-024', clienteId: 'CLI-008', nombre: 'Lucía Navarro Campos', expediente: 'EXP-2026-0155', puntuacion: 6, comentario: 'Lesiones graves y todavía no han resuelto la subrogación. El perito fue profesional pero el proceso administrativo es un desastre.', fecha: '2026-03-15', tipo_siniestro: 'colision_multiple', tiempo_resolucion: null },
  { id: 'enc-025', clienteId: 'CLI-009', nombre: 'Andrés Morales Gil', expediente: 'EXP-2025-0189', puntuacion: 2, comentario: 'Pésimo. El tercero se fugó y mi aseguradora no hizo nada por recuperar el dinero. He perdido 3.800€. Cambiaré de compañía.', fecha: '2025-11-10', tipo_siniestro: 'fuga', tiempo_resolucion: null },
  { id: 'enc-026', clienteId: 'CLI-011', nombre: 'Sandra Molina Prieto', expediente: 'EXP-2025-0734', puntuacion: 3, comentario: 'La peritación fue ridícula. Valoraron los daños en la mitad de lo que costó la reparación. Me siento estafada.', fecha: '2025-12-01', tipo_siniestro: 'colision_frontal', tiempo_resolucion: 35 },
  { id: 'enc-027', clienteId: 'CLI-014', nombre: 'David Fernández Navarro', expediente: 'EXP-2025-0667', puntuacion: 5, comentario: 'Regular. La reparación fue aceptable pero el taller que eligieron está lejos de mi casa y tuve problemas de transporte.', fecha: '2025-12-10', tipo_siniestro: 'colision_lateral', tiempo_resolucion: 28 },
  { id: 'enc-028', clienteId: 'CLI-017', nombre: 'Francisco Javier López', expediente: 'EXP-2026-0041B', puntuacion: 1, comentario: 'Horrible experiencia. Me subieron la prima un 40% después del accidente y encima tardaron en pagar. Voy a poner una reclamación.', fecha: '2026-02-01', tipo_siniestro: 'atropello_vehiculo', tiempo_resolucion: 40 },
  { id: 'enc-029', clienteId: 'CLI-020', nombre: 'Isabel Torres Muñoz', expediente: 'EXP-2026-0218B', puntuacion: 6, comentario: 'Aceptable pero mejorable. Sobre todo la comunicación: nadie te informa proactivamente del estado.', fecha: '2026-03-17', tipo_siniestro: 'marcha_atras', tiempo_resolucion: 21 },
  { id: 'enc-030', clienteId: 'CLI-023', nombre: 'Miguel Ángel Torres', expediente: 'EXP-2025-0298B', puntuacion: 4, comentario: 'La experiencia con el call center fue terrible. Esperas de 20 minutos y te pasan de un departamento a otro.', fecha: '2025-12-28', tipo_siniestro: 'colision_lateral', tiempo_resolucion: 32 },
  { id: 'enc-031', clienteId: 'CLI-026', nombre: 'Carlos Ruiz Gómez', expediente: 'EXP-2025-0412B', puntuacion: 6, comentario: 'No me gusta que el perito viniera con prisas y apenas mirase los daños. La reparación estuvo bien al final.', fecha: '2026-01-30', tipo_siniestro: 'colision_trasera', tiempo_resolucion: 17 },
];

// Histórico de NPS mensual (para evolución)
const historicoNPS = [
  { mes: '2025-06', nps: 35, promotores: 40, neutros: 28, detractores: 32, total_encuestas: 45 },
  { mes: '2025-07', nps: 38, promotores: 42, neutros: 26, detractores: 32, total_encuestas: 52 },
  { mes: '2025-08', nps: 33, promotores: 38, neutros: 30, detractores: 32, total_encuestas: 48 },
  { mes: '2025-09', nps: 40, promotores: 45, neutros: 25, detractores: 30, total_encuestas: 55 },
  { mes: '2025-10', nps: 37, promotores: 43, neutros: 27, detractores: 30, total_encuestas: 50 },
  { mes: '2025-11', nps: 39, promotores: 44, neutros: 26, detractores: 30, total_encuestas: 58 },
  { mes: '2025-12', nps: 36, promotores: 41, neutros: 28, detractores: 31, total_encuestas: 62 },
  { mes: '2026-01', nps: 44, promotores: 48, neutros: 24, detractores: 28, total_encuestas: 55 },
  { mes: '2026-02', nps: 42, promotores: 46, neutros: 26, detractores: 28, total_encuestas: 60 },
  { mes: '2026-03', nps: 42, promotores: 45, neutros: 26, detractores: 29, total_encuestas: 31 }
];

// ============================================================================
// FUNCIONES DEL AGENTE NPS
// ============================================================================

/**
 * Obtiene todas las puntuaciones con detalle
 */
function getPuntuaciones() {
  const promotores = encuestas.filter(e => e.puntuacion >= 9);
  const neutros = encuestas.filter(e => e.puntuacion >= 7 && e.puntuacion <= 8);
  const detractores = encuestas.filter(e => e.puntuacion <= 6);

  const nps = Math.round(((promotores.length - detractores.length) / encuestas.length) * 100);

  return {
    nps_actual: nps,
    total_encuestas: encuestas.length,
    distribucion: {
      promotores: { cantidad: promotores.length, porcentaje: Math.round((promotores.length / encuestas.length) * 100) },
      neutros: { cantidad: neutros.length, porcentaje: Math.round((neutros.length / encuestas.length) * 100) },
      detractores: { cantidad: detractores.length, porcentaje: Math.round((detractores.length / encuestas.length) * 100) }
    },
    puntuacion_media: Math.round((encuestas.reduce((sum, e) => sum + e.puntuacion, 0) / encuestas.length) * 100) / 100,
    encuestas: encuestas.map(e => ({
      id: e.id,
      nombre: e.nombre,
      expediente: e.expediente,
      puntuacion: e.puntuacion,
      categoria: e.puntuacion >= 9 ? 'promotor' : e.puntuacion >= 7 ? 'neutro' : 'detractor',
      comentario: e.comentario,
      fecha: e.fecha,
      tipo_siniestro: e.tipo_siniestro,
      tiempo_resolucion: e.tiempo_resolucion
    }))
  };
}

/**
 * Genera informe mensual de NPS
 */
function getInformeMensual(mes = null) {
  const ahora = new Date();
  const mesTarget = mes || `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;

  const encuestasMes = encuestas.filter(e => e.fecha.startsWith(mesTarget));

  if (encuestasMes.length === 0) {
    // Usar datos del histórico si no hay encuestas directas
    const historico = historicoNPS.find(h => h.mes === mesTarget);
    if (historico) {
      return {
        mes: mesTarget,
        fuente: 'historico',
        nps_score: historico.nps,
        total_encuestas: historico.total_encuestas,
        promotores_pct: historico.promotores,
        neutros_pct: historico.neutros,
        detractores_pct: historico.detractores,
        tendencia: _calcularTendencia(mesTarget),
        motivos_insatisfaccion: _getMotivosInsatisfaccionGenerales(),
        top_comentarios: []
      };
    }
    return { mes: mesTarget, mensaje: 'No hay datos disponibles para este mes' };
  }

  const promotores = encuestasMes.filter(e => e.puntuacion >= 9);
  const neutros = encuestasMes.filter(e => e.puntuacion >= 7 && e.puntuacion <= 8);
  const detractores = encuestasMes.filter(e => e.puntuacion <= 6);
  const total = encuestasMes.length;

  const nps = Math.round(((promotores.length - detractores.length) / total) * 100);

  // Analizar motivos de insatisfacción
  const motivosInsatisfaccion = _analizarMotivosInsatisfaccion(detractores);

  // Top comentarios (mejores y peores)
  const topComentarios = [
    ...encuestasMes.sort((a, b) => b.puntuacion - a.puntuacion).slice(0, 3).map(e => ({
      tipo: 'positivo', nombre: e.nombre, puntuacion: e.puntuacion, comentario: e.comentario
    })),
    ...encuestasMes.sort((a, b) => a.puntuacion - b.puntuacion).slice(0, 3).map(e => ({
      tipo: 'negativo', nombre: e.nombre, puntuacion: e.puntuacion, comentario: e.comentario
    }))
  ];

  // Tiempo medio de resolución
  const conResolucion = encuestasMes.filter(e => e.tiempo_resolucion != null);
  const tiempoMedio = conResolucion.length > 0
    ? Math.round(conResolucion.reduce((sum, e) => sum + e.tiempo_resolucion, 0) / conResolucion.length)
    : null;

  return {
    mes: mesTarget,
    fuente: 'encuestas_directas',
    nps_score: nps,
    total_encuestas: total,
    promotores_pct: Math.round((promotores.length / total) * 100),
    neutros_pct: Math.round((neutros.length / total) * 100),
    detractores_pct: Math.round((detractores.length / total) * 100),
    puntuacion_media: Math.round((encuestasMes.reduce((s, e) => s + e.puntuacion, 0) / total) * 100) / 100,
    tiempo_resolucion_medio_dias: tiempoMedio,
    tendencia: _calcularTendencia(mesTarget),
    motivos_insatisfaccion: motivosInsatisfaccion,
    top_comentarios: topComentarios,
    correlacion_tiempo_satisfaccion: _calcularCorrelacion(encuestasMes)
  };
}

/**
 * Obtiene detractores con plan de acción
 */
function getClientesInsatisfechos() {
  const detractores = encuestas
    .filter(e => e.puntuacion <= 6)
    .sort((a, b) => a.puntuacion - b.puntuacion);

  return {
    total_detractores: detractores.length,
    porcentaje_total: Math.round((detractores.length / encuestas.length) * 100),
    riesgo_fuga: detractores.filter(e => e.puntuacion <= 3).length,
    detractores: detractores.map(e => ({
      id: e.id,
      clienteId: e.clienteId,
      nombre: e.nombre,
      expediente: e.expediente,
      puntuacion: e.puntuacion,
      comentario: e.comentario,
      fecha: e.fecha,
      tipo_siniestro: e.tipo_siniestro,
      tiempo_resolucion: e.tiempo_resolucion,
      nivel_urgencia: e.puntuacion <= 2 ? 'critico' : e.puntuacion <= 4 ? 'alto' : 'medio',
      plan_accion: _generarPlanAccion(e),
      probabilidad_fuga: e.puntuacion <= 3 ? 'muy_alta' : e.puntuacion <= 5 ? 'alta' : 'media'
    }))
  };
}

/**
 * Simula el envío de una encuesta y la obtención de respuesta
 */
function enviarEncuesta(siniestroId, datosCliente = {}) {
  const {
    nombre = 'Cliente Encuestado',
    clienteId = `CLI-${String(encuestas.length + 1).padStart(3, '0')}`,
    tipo_siniestro = 'colision_trasera',
    tiempo_resolucion = Math.floor(Math.random() * 30) + 5
  } = datosCliente;

  // Simular puntuación basada en tiempo de resolución
  let puntuacionBase;
  if (tiempo_resolucion <= 7) {
    puntuacionBase = 9 + Math.floor(Math.random() * 2); // 9-10
  } else if (tiempo_resolucion <= 15) {
    puntuacionBase = 7 + Math.floor(Math.random() * 2); // 7-8
  } else if (tiempo_resolucion <= 30) {
    puntuacionBase = 5 + Math.floor(Math.random() * 3); // 5-7
  } else {
    puntuacionBase = 1 + Math.floor(Math.random() * 5); // 1-5
  }

  const puntuacion = Math.min(10, Math.max(0, puntuacionBase));

  // Generar comentario según puntuación
  const comentario = _generarComentarioSimulado(puntuacion, tiempo_resolucion, tipo_siniestro);

  const nuevaEncuesta = {
    id: `enc-${uuidv4().slice(0, 8)}`,
    clienteId,
    nombre,
    expediente: siniestroId,
    puntuacion,
    comentario,
    fecha: new Date().toISOString().split('T')[0],
    tipo_siniestro,
    tiempo_resolucion
  };

  encuestas.push(nuevaEncuesta);

  const categoria = puntuacion >= 9 ? 'promotor' : puntuacion >= 7 ? 'neutro' : 'detractor';

  return {
    exito: true,
    mensaje: `Encuesta enviada y respondida por ${nombre}`,
    resultado: {
      ...nuevaEncuesta,
      categoria,
      accion_requerida: categoria === 'detractor' ? _generarPlanAccion(nuevaEncuesta) : null
    },
    nps_actualizado: _calcularNPSActual()
  };
}

/**
 * Obtiene la evolución del NPS para gráficos
 */
function getEvolucion() {
  // Calcular NPS actual con las encuestas reales del mes
  const ahora = new Date();
  const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;

  const evolucion = historicoNPS.map(h => {
    let datos;
    if (h.mes === mesActual) {
      // Para el mes actual, calcular con encuestas reales
      const encuestasMes = encuestas.filter(e => e.fecha.startsWith(mesActual));
      if (encuestasMes.length > 0) {
        const prom = encuestasMes.filter(e => e.puntuacion >= 9).length;
        const det = encuestasMes.filter(e => e.puntuacion <= 6).length;
        const total = encuestasMes.length;
        datos = {
          mes: h.mes,
          nps: Math.round(((prom - det) / total) * 100),
          promotores_pct: Math.round((prom / total) * 100),
          neutros_pct: Math.round(((total - prom - det) / total) * 100),
          detractores_pct: Math.round((det / total) * 100),
          total_encuestas: total
        };
      } else {
        datos = { ...h, promotores_pct: h.promotores, neutros_pct: h.neutros, detractores_pct: h.detractores };
      }
    } else {
      datos = { ...h, promotores_pct: h.promotores, neutros_pct: h.neutros, detractores_pct: h.detractores };
    }
    return datos;
  });

  // Calcular tendencia general
  const primeros3 = evolucion.slice(0, 3);
  const ultimos3 = evolucion.slice(-3);
  const mediaPrimeros = primeros3.reduce((s, e) => s + e.nps, 0) / primeros3.length;
  const mediaUltimos = ultimos3.reduce((s, e) => s + e.nps, 0) / ultimos3.length;
  const tendenciaGeneral = mediaUltimos - mediaPrimeros;

  return {
    periodo: `${evolucion[0].mes} a ${evolucion[evolucion.length - 1].mes}`,
    tendencia_general: tendenciaGeneral > 2 ? 'ascendente' : tendenciaGeneral < -2 ? 'descendente' : 'estable',
    variacion_puntos: Math.round(tendenciaGeneral * 10) / 10,
    mejor_mes: evolucion.reduce((best, e) => e.nps > best.nps ? e : best),
    peor_mes: evolucion.reduce((worst, e) => e.nps < worst.nps ? e : worst),
    datos: evolucion,
    benchmark_sector: {
      nps_medio_seguros_espana: 38,
      posicion: _calcularNPSActual() > 38 ? 'por_encima_del_sector' : 'por_debajo_del_sector',
      diferencia: _calcularNPSActual() - 38
    }
  };
}

// ============================================================================
// FUNCIONES INTERNAS
// ============================================================================

function _calcularNPSActual() {
  const promotores = encuestas.filter(e => e.puntuacion >= 9).length;
  const detractores = encuestas.filter(e => e.puntuacion <= 6).length;
  return Math.round(((promotores - detractores) / encuestas.length) * 100);
}

function _calcularTendencia(mesActual) {
  const idx = historicoNPS.findIndex(h => h.mes === mesActual);
  if (idx <= 0) return { direccion: 'sin_datos', variacion: 0 };

  const actual = historicoNPS[idx];
  const anterior = historicoNPS[idx - 1];
  const variacion = actual.nps - anterior.nps;

  return {
    direccion: variacion > 2 ? 'subiendo' : variacion < -2 ? 'bajando' : 'estable',
    variacion,
    nps_mes_anterior: anterior.nps,
    nps_mes_actual: actual.nps
  };
}

function _analizarMotivosInsatisfaccion(detractores) {
  const motivos = {};

  detractores.forEach(e => {
    const comentario = e.comentario.toLowerCase();
    if (comentario.includes('tard') || comentario.includes('tiempo') || comentario.includes('lento') || comentario.includes('espera') || comentario.includes('meses') || comentario.includes('mes')) {
      motivos['tiempos_de_resolucion'] = (motivos['tiempos_de_resolucion'] || 0) + 1;
    }
    if (comentario.includes('comunic') || comentario.includes('inform') || comentario.includes('llam') || comentario.includes('nadie')) {
      motivos['falta_de_comunicacion'] = (motivos['falta_de_comunicacion'] || 0) + 1;
    }
    if (comentario.includes('perit') || comentario.includes('valor')) {
      motivos['peritacion_insatisfactoria'] = (motivos['peritacion_insatisfactoria'] || 0) + 1;
    }
    if (comentario.includes('prima') || comentario.includes('precio') || comentario.includes('caro') || comentario.includes('estafa')) {
      motivos['precio_prima'] = (motivos['precio_prima'] || 0) + 1;
    }
    if (comentario.includes('call center') || comentario.includes('telefon') || comentario.includes('departamento')) {
      motivos['atencion_telefonica'] = (motivos['atencion_telefonica'] || 0) + 1;
    }
    if (comentario.includes('taller') || comentario.includes('reparaci')) {
      motivos['calidad_reparacion'] = (motivos['calidad_reparacion'] || 0) + 1;
    }
  });

  // Ordenar por frecuencia
  return Object.entries(motivos)
    .sort((a, b) => b[1] - a[1])
    .map(([motivo, cantidad]) => ({
      motivo: motivo.replace(/_/g, ' '),
      menciones: cantidad,
      porcentaje_detractores: Math.round((cantidad / detractores.length) * 100),
      accion_sugerida: _getSugerenciaMotivo(motivo)
    }));
}

function _getMotivosInsatisfaccionGenerales() {
  return [
    { motivo: 'tiempos de resolucion', menciones: 6, accion_sugerida: 'Reducir SLA de resolución a 15 días máximo' },
    { motivo: 'falta de comunicacion', menciones: 4, accion_sugerida: 'Implementar notificaciones automáticas de estado' },
    { motivo: 'peritacion insatisfactoria', menciones: 3, accion_sugerida: 'Revisar criterios de valoración y formar a peritos' },
    { motivo: 'precio prima', menciones: 2, accion_sugerida: 'Revisar política de bonificación/penalización' }
  ];
}

function _getSugerenciaMotivo(motivo) {
  const sugerencias = {
    tiempos_de_resolucion: 'Reducir SLA de resolución. Implementar fast-track para siniestros menores de 3.000€.',
    falta_de_comunicacion: 'Implementar sistema de notificaciones automáticas por SMS/email con cada cambio de estado.',
    peritacion_insatisfactoria: 'Revisar criterios de valoración. Ofrecer segunda peritación si el cliente no está conforme.',
    precio_prima: 'Revisar política de bonificación/penalización. Comunicar mejor el motivo de cambios de prima.',
    atencion_telefonica: 'Reducir tiempos de espera en call center. Implementar callback automático.',
    calidad_reparacion: 'Ampliar red de talleres concertados. Implementar encuesta post-reparación.'
  };
  return sugerencias[motivo] || 'Analizar caso individualmente y contactar al cliente.';
}

function _generarPlanAccion(encuesta) {
  const acciones = [];
  const p = encuesta.puntuacion;

  // Acción inmediata para casos críticos
  if (p <= 3) {
    acciones.push({
      prioridad: 'inmediata',
      accion: 'Llamada personal del responsable de atención al cliente',
      plazo: '24 horas',
      responsable: 'Responsable de Experiencia de Cliente'
    });
    acciones.push({
      prioridad: 'inmediata',
      accion: 'Ofrecer compensación: descuento en prima o servicio adicional gratuito',
      plazo: '48 horas',
      responsable: 'Dirección Comercial'
    });
  }

  // Resolución del problema
  if (encuesta.tiempo_resolucion === null || encuesta.tiempo_resolucion > 30) {
    acciones.push({
      prioridad: 'alta',
      accion: 'Acelerar resolución del expediente si sigue abierto',
      plazo: '72 horas',
      responsable: 'Jefe de Siniestros'
    });
  }

  // Seguimiento
  acciones.push({
    prioridad: 'media',
    accion: 'Contacto de seguimiento para verificar satisfacción con las medidas tomadas',
    plazo: '7 días',
    responsable: 'Tramitador asignado'
  });

  // Retención
  if (p <= 4) {
    acciones.push({
      prioridad: 'alta',
      accion: 'Incluir en programa de retención: oferta personalizada de renovación',
      plazo: '30 días antes de renovación',
      responsable: 'Departamento Comercial'
    });
  }

  return acciones;
}

function _generarComentarioSimulado(puntuacion, tiempo, tipo) {
  if (puntuacion >= 9) {
    const positivos = [
      `Muy contento con la gestión de mi siniestro de ${tipo.replace(/_/g, ' ')}. Resuelto en ${tiempo} días.`,
      `Excelente servicio. Rápido y profesional. Totalmente recomendable.`,
      `Todo perfecto. Me informaron en cada paso y la reparación quedó impecable.`,
      `Gran experiencia. El tramitador fue muy amable y resolutivo.`
    ];
    return positivos[Math.floor(Math.random() * positivos.length)];
  } else if (puntuacion >= 7) {
    const neutros = [
      `Servicio correcto. ${tiempo} días de resolución me parece aceptable pero mejorable.`,
      `Bien en general. Algunos tiempos de espera mejorables.`,
      `Normal. Cumplieron con lo pactado aunque sin destacar especialmente.`
    ];
    return neutros[Math.floor(Math.random() * neutros.length)];
  } else {
    const negativos = [
      `Mal servicio. ${tiempo} días para resolver un siniestro simple es demasiado.`,
      `Insatisfecho. La comunicación ha sido nula durante todo el proceso.`,
      `Decepcionante. Esperaba mucho más de mi aseguradora. Estoy valorando cambiar.`,
      `Pésima experiencia. Ni informan ni resuelven. Pondré una reclamación.`
    ];
    return negativos[Math.floor(Math.random() * negativos.length)];
  }
}

function _calcularCorrelacion(encuestasMes) {
  const conResolucion = encuestasMes.filter(e => e.tiempo_resolucion != null);
  if (conResolucion.length < 3) return { correlacion: 'insuficientes_datos' };

  // Correlación simple: tiempo vs puntuación
  const rapidos = conResolucion.filter(e => e.tiempo_resolucion <= 10);
  const medios = conResolucion.filter(e => e.tiempo_resolucion > 10 && e.tiempo_resolucion <= 25);
  const lentos = conResolucion.filter(e => e.tiempo_resolucion > 25);

  const mediaRapidos = rapidos.length > 0 ? Math.round((rapidos.reduce((s, e) => s + e.puntuacion, 0) / rapidos.length) * 10) / 10 : null;
  const mediaMedios = medios.length > 0 ? Math.round((medios.reduce((s, e) => s + e.puntuacion, 0) / medios.length) * 10) / 10 : null;
  const mediaLentos = lentos.length > 0 ? Math.round((lentos.reduce((s, e) => s + e.puntuacion, 0) / lentos.length) * 10) / 10 : null;

  return {
    correlacion: 'negativa_fuerte',
    interpretacion: 'A mayor tiempo de resolución, menor satisfacción del cliente',
    datos: {
      rapidos_0_10_dias: { cantidad: rapidos.length, puntuacion_media: mediaRapidos },
      medios_11_25_dias: { cantidad: medios.length, puntuacion_media: mediaMedios },
      lentos_mas_25_dias: { cantidad: lentos.length, puntuacion_media: mediaLentos }
    }
  };
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

module.exports = {
  getPuntuaciones,
  getInformeMensual,
  getClientesInsatisfechos,
  enviarEncuesta,
  getEvolucion,
  // Acceso directo a datos
  encuestas,
  historicoNPS
};
