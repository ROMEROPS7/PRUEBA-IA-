// =============================================================================
// MENTOR AGENT - Observes how humans work and gives real-time advice
// Learns from top performers and coaches the rest of the team
// =============================================================================

const { v4: uuidv4 } = require('uuid');
const { dbRun, dbAll, dbGet } = require('../database/db');

// ---------------------------------------------------------------------------
// Database initialization
// ---------------------------------------------------------------------------
async function initMentorDB() {
  await dbRun(`CREATE TABLE IF NOT EXISTS mentor_observaciones (
    id TEXT PRIMARY KEY,
    empleado_id TEXT,
    empleado_nombre TEXT,
    tipo TEXT NOT NULL,
    observacion TEXT NOT NULL,
    consejo TEXT,
    metrica_referencia TEXT,
    aceptado INTEGER DEFAULT 0,
    fecha TEXT DEFAULT (datetime('now'))
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS mentor_mejores_practicas (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    fuente_empleado TEXT,
    categoria TEXT,
    aplicaciones INTEGER DEFAULT 0,
    fecha TEXT DEFAULT (datetime('now'))
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS mentor_metricas (
    id TEXT PRIMARY KEY,
    empleado_id TEXT NOT NULL,
    empleado_nombre TEXT,
    metrica TEXT NOT NULL,
    valor REAL NOT NULL,
    periodo TEXT DEFAULT 'diario',
    fecha TEXT DEFAULT (datetime('now'))
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS mentor_actividades (
    id TEXT PRIMARY KEY,
    empleado_id TEXT NOT NULL,
    accion TEXT NOT NULL,
    tiempo_ms INTEGER NOT NULL,
    resultado TEXT,
    expediente_id TEXT,
    fecha TEXT DEFAULT (datetime('now'))
  )`);

  await dbRun('CREATE INDEX IF NOT EXISTS idx_mentor_obs_empleado ON mentor_observaciones(empleado_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_mentor_metricas_emp ON mentor_metricas(empleado_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_mentor_actividades_emp ON mentor_actividades(empleado_id)');

  console.log('[MentorAgent] Tablas de mentor inicializadas');
}

// ---------------------------------------------------------------------------
// Benchmarks - Team averages and top performer thresholds
// ---------------------------------------------------------------------------
const BENCHMARKS = {
  revisar_expediente: { promedio_ms: 480000, top_ms: 300000, descripcion: 'Revision de expediente' },
  evaluar_danos: { promedio_ms: 720000, top_ms: 420000, descripcion: 'Evaluacion de danos' },
  llamada_cliente: { promedio_ms: 360000, top_ms: 240000, descripcion: 'Llamada a cliente' },
  redactar_informe: { promedio_ms: 900000, top_ms: 540000, descripcion: 'Redaccion de informe' },
  tramitar_pago: { promedio_ms: 300000, top_ms: 180000, descripcion: 'Tramitacion de pago' },
  verificar_documentacion: { promedio_ms: 600000, top_ms: 360000, descripcion: 'Verificacion de documentacion' },
  consultar_wiki: { promedio_ms: 120000, top_ms: 60000, descripcion: 'Consulta a wiki/base conocimiento' },
  asignar_perito: { promedio_ms: 240000, top_ms: 120000, descripcion: 'Asignacion de perito' },
};

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Records an employee action and compares to benchmarks.
 * Returns advice if there is a better way.
 */
async function observarActividad(empleadoId, accion, tiempoMs, resultado) {
  const id = `ACT-${uuidv4().slice(0, 8)}`;

  // Get employee name
  const empleado = await dbGet(
    `SELECT nombre FROM usuarios WHERE id = ? OR email LIKE ?`,
    [empleadoId, `%${empleadoId}%`]
  );
  const empleadoNombre = empleado ? empleado.nombre : empleadoId;

  // Save activity
  await dbRun(
    `INSERT INTO mentor_actividades (id, empleado_id, accion, tiempo_ms, resultado)
     VALUES (?, ?, ?, ?, ?)`,
    [id, empleadoId, accion, tiempoMs, resultado || 'completado']
  );

  // Compare with benchmarks
  const benchmark = BENCHMARKS[accion];
  let consejo = null;
  let observacion = null;
  let tipoObs = 'neutral';

  if (benchmark) {
    const tiempoSeg = Math.round(tiempoMs / 1000);
    const promedioSeg = Math.round(benchmark.promedio_ms / 1000);
    const topSeg = Math.round(benchmark.top_ms / 1000);

    if (tiempoMs > benchmark.promedio_ms * 1.5) {
      tipoObs = 'mejora_necesaria';
      observacion = `${benchmark.descripcion} tomo ${tiempoSeg}s, muy por encima del promedio de ${promedioSeg}s.`;
      consejo = `El top performer completa esta accion en ${topSeg}s. Revisa las mejores practicas para "${accion}".`;
    } else if (tiempoMs > benchmark.promedio_ms) {
      tipoObs = 'mejora_posible';
      observacion = `${benchmark.descripcion} tomo ${tiempoSeg}s, ligeramente por encima del promedio (${promedioSeg}s).`;
      consejo = `Intenta consultar la wiki antes de empezar. El top performer lo hace en ${topSeg}s.`;
    } else if (tiempoMs <= benchmark.top_ms) {
      tipoObs = 'excelente';
      observacion = `Excelente: ${benchmark.descripcion} completada en ${tiempoSeg}s, al nivel del top performer (${topSeg}s).`;
      consejo = null;
    } else {
      tipoObs = 'bien';
      observacion = `${benchmark.descripcion} completada en ${tiempoSeg}s. Dentro del promedio (${promedioSeg}s).`;
      consejo = null;
    }

    // Save observation if noteworthy
    if (observacion) {
      const obsId = `OBS-${uuidv4().slice(0, 8)}`;
      await dbRun(
        `INSERT INTO mentor_observaciones (id, empleado_id, empleado_nombre, tipo, observacion, consejo, metrica_referencia)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [obsId, empleadoId, empleadoNombre, tipoObs, observacion, consejo, JSON.stringify(benchmark)]
      );
    }

    // Save metric
    const metId = `MET-${uuidv4().slice(0, 8)}`;
    await dbRun(
      `INSERT INTO mentor_metricas (id, empleado_id, empleado_nombre, metrica, valor, periodo)
       VALUES (?, ?, ?, ?, ?, 'diario')`,
      [metId, empleadoId, empleadoNombre, `tiempo_${accion}`, tiempoMs]
    );
  } else {
    observacion = `Actividad "${accion}" registrada. Tiempo: ${Math.round(tiempoMs / 1000)}s. Sin benchmark de referencia.`;
  }

  return {
    actividad_id: id,
    empleado_id: empleadoId,
    accion,
    tiempo_ms: tiempoMs,
    resultado: resultado || 'completado',
    tipo_evaluacion: tipoObs,
    observacion,
    consejo,
    benchmark: benchmark || null
  };
}

/**
 * Returns current real-time tips for an employee based on their recent activity.
 */
async function getConsejosTiempoReal(empleadoId) {
  const consejos = [];

  // 1. Check current activity duration
  const actividadReciente = await dbGet(
    `SELECT * FROM mentor_actividades WHERE empleado_id = ? ORDER BY fecha DESC LIMIT 1`,
    [empleadoId]
  );

  if (actividadReciente) {
    const tiempoTranscurrido = Date.now() - new Date(actividadReciente.fecha).getTime();
    const benchmark = BENCHMARKS[actividadReciente.accion];

    if (benchmark && tiempoTranscurrido > benchmark.promedio_ms) {
      const minutos = Math.round(tiempoTranscurrido / 60000);
      const topMin = Math.round(benchmark.top_ms / 60000);
      const topPerformer = await _getTopPerformer(actividadReciente.accion);
      consejos.push({
        tipo: 'tiempo_excedido',
        urgencia: 'alta',
        mensaje: `Llevas ${minutos} minutos en "${benchmark.descripcion}". En casos similares, ${topPerformer} lo resuelve en ${topMin} min consultando primero la wiki.`,
        accion_sugerida: 'Consultar wiki o pedir ayuda a un companero'
      });
    }
  }

  // 2. Check for clients with complaint history that need briefing
  const expedientesPendientes = await dbAll(
    `SELECT s.expediente, s.cliente_id, c.nombre as cliente_nombre
     FROM siniestros s
     JOIN clientes c ON s.cliente_id = c.id
     WHERE s.estado IN ('Abierto', 'En gestion')
     ORDER BY s.urgencia DESC LIMIT 5`
  );

  for (const exp of expedientesPendientes) {
    const quejas = await dbGet(
      `SELECT COUNT(*) as total FROM memoria_cliente WHERE cliente_id = ? AND tipo = 'queja'`,
      [exp.cliente_id]
    );
    if (quejas && quejas.total >= 2) {
      consejos.push({
        tipo: 'cliente_riesgo',
        urgencia: 'media',
        mensaje: `${exp.cliente_nombre} (${exp.expediente}) tiene ${quejas.total} quejas. Consulta su briefing antes de contactar.`,
        accion_sugerida: `Ejecutar getBriefingLlamada('${exp.cliente_id}')`
      });
    }
  }

  // 3. Check for urgent unattended expedientes
  const urgentes = await dbAll(
    `SELECT expediente, tipo, urgencia, descripcion
     FROM siniestros
     WHERE estado = 'Abierto' AND urgencia >= 8
     ORDER BY urgencia DESC LIMIT 3`
  );

  if (urgentes.length > 0) {
    const listado = urgentes.map(u => u.expediente).join(', ');
    consejos.push({
      tipo: 'expedientes_urgentes',
      urgencia: 'alta',
      mensaje: `Hay ${urgentes.length} expedientes urgentes sin atender. Prioriza ${listado}.`,
      accion_sugerida: 'Atender expedientes por orden de urgencia',
      expedientes: urgentes
    });
  }

  // 4. Check unaccepted previous advice
  const consejosNoAceptados = await dbAll(
    `SELECT * FROM mentor_observaciones
     WHERE empleado_id = ? AND aceptado = 0 AND consejo IS NOT NULL
     ORDER BY fecha DESC LIMIT 3`,
    [empleadoId]
  );

  for (const obs of consejosNoAceptados) {
    consejos.push({
      tipo: 'consejo_pendiente',
      urgencia: 'baja',
      mensaje: obs.consejo,
      observacion_id: obs.id,
      accion_sugerida: 'Revisar y aplicar el consejo'
    });
  }

  // 5. Productivity check - compare today's output
  const hoy = new Date().toISOString().slice(0, 10);
  const actividadesHoy = await dbGet(
    `SELECT COUNT(*) as total FROM mentor_actividades WHERE empleado_id = ? AND fecha LIKE ?`,
    [empleadoId, `${hoy}%`]
  );

  const promedioEquipo = await dbGet(
    `SELECT AVG(cnt) as promedio FROM (
      SELECT empleado_id, COUNT(*) as cnt FROM mentor_actividades
      WHERE fecha LIKE ? GROUP BY empleado_id
    )`,
    [`${hoy}%`]
  );

  if (actividadesHoy && promedioEquipo && promedioEquipo.promedio) {
    if (actividadesHoy.total < promedioEquipo.promedio * 0.5) {
      consejos.push({
        tipo: 'productividad',
        urgencia: 'media',
        mensaje: `Has completado ${actividadesHoy.total} acciones hoy vs promedio del equipo de ${Math.round(promedioEquipo.promedio)}. Revisa si hay bloqueos.`,
        accion_sugerida: 'Revisar cola de trabajo'
      });
    }
  }

  return {
    empleado_id: empleadoId,
    timestamp: new Date().toISOString(),
    total_consejos: consejos.length,
    consejos: consejos.sort((a, b) => {
      const prioridad = { alta: 0, media: 1, baja: 2 };
      return (prioridad[a.urgencia] || 2) - (prioridad[b.urgencia] || 2);
    })
  };
}

/**
 * Helper: get top performer name for an action.
 */
async function _getTopPerformer(accion) {
  const top = await dbGet(
    `SELECT empleado_nombre, AVG(valor) as promedio
     FROM mentor_metricas
     WHERE metrica = ?
     GROUP BY empleado_id
     ORDER BY promedio ASC LIMIT 1`,
    [`tiempo_${accion}`]
  );
  return top ? top.empleado_nombre : 'el top performer';
}

/**
 * Returns best practices learned from top performers.
 */
async function getMejoresPracticas() {
  const practicas = await dbAll(
    'SELECT * FROM mentor_mejores_practicas ORDER BY aplicaciones DESC, fecha DESC'
  );
  return {
    total: practicas.length,
    mejores_practicas: practicas
  };
}

/**
 * Compare employee vs team average vs best performer.
 */
async function getRendimientoComparativo(empleadoId) {
  // Get employee name
  const empleado = await dbGet(
    `SELECT DISTINCT empleado_nombre FROM mentor_metricas WHERE empleado_id = ? LIMIT 1`,
    [empleadoId]
  );

  // Metrics to compare
  const metricas = [
    'tiempo_medio_expediente',
    'satisfaccion_cliente',
    'expedientes_dia',
    'tasa_error'
  ];

  const comparativas = [];

  for (const metrica of metricas) {
    // Employee value
    const empMetrica = await dbGet(
      `SELECT AVG(valor) as valor FROM mentor_metricas WHERE empleado_id = ? AND metrica = ?`,
      [empleadoId, metrica]
    );

    // Team average
    const teamAvg = await dbGet(
      `SELECT AVG(valor) as valor FROM mentor_metricas WHERE metrica = ?`,
      [metrica]
    );

    // Best performer
    const best = await dbGet(
      `SELECT empleado_id, empleado_nombre, AVG(valor) as valor
       FROM mentor_metricas WHERE metrica = ?
       GROUP BY empleado_id
       ORDER BY ${metrica === 'tasa_error' ? 'valor ASC' : (metrica === 'satisfaccion_cliente' || metrica === 'expedientes_dia' ? 'valor DESC' : 'valor ASC')}
       LIMIT 1`,
      [metrica]
    );

    comparativas.push({
      metrica,
      empleado_valor: empMetrica ? Math.round(empMetrica.valor * 100) / 100 : null,
      equipo_promedio: teamAvg ? Math.round(teamAvg.valor * 100) / 100 : null,
      mejor_performer: best ? {
        nombre: best.empleado_nombre,
        valor: Math.round(best.valor * 100) / 100
      } : null,
      diferencia_vs_promedio: (empMetrica && teamAvg)
        ? Math.round((empMetrica.valor - teamAvg.valor) * 100) / 100
        : null
    });
  }

  // Overall assessment
  let evaluacion = 'promedio';
  const mejorQuePromedio = comparativas.filter(c =>
    c.empleado_valor !== null && c.equipo_promedio !== null && (
      (c.metrica === 'tasa_error' && c.empleado_valor < c.equipo_promedio) ||
      (c.metrica !== 'tasa_error' && c.metrica !== 'tiempo_medio_expediente' && c.empleado_valor > c.equipo_promedio) ||
      (c.metrica === 'tiempo_medio_expediente' && c.empleado_valor < c.equipo_promedio)
    )
  );

  if (mejorQuePromedio.length >= 3) evaluacion = 'sobresaliente';
  else if (mejorQuePromedio.length >= 2) evaluacion = 'por_encima_promedio';
  else if (mejorQuePromedio.length <= 0) evaluacion = 'necesita_mejora';

  return {
    empleado_id: empleadoId,
    empleado_nombre: empleado ? empleado.empleado_nombre : empleadoId,
    evaluacion_global: evaluacion,
    metricas: comparativas,
    fecha: new Date().toISOString()
  };
}

/**
 * Returns observation history and advice for an employee.
 */
async function getObservaciones(empleadoId) {
  const observaciones = await dbAll(
    'SELECT * FROM mentor_observaciones WHERE empleado_id = ? ORDER BY fecha DESC',
    [empleadoId]
  );

  const aceptados = observaciones.filter(o => o.aceptado === 1).length;
  const conConsejo = observaciones.filter(o => o.consejo !== null).length;

  const porTipo = {};
  for (const obs of observaciones) {
    porTipo[obs.tipo] = (porTipo[obs.tipo] || 0) + 1;
  }

  return {
    empleado_id: empleadoId,
    total_observaciones: observaciones.length,
    consejos_aceptados: aceptados,
    consejos_dados: conConsejo,
    tasa_aceptacion: conConsejo > 0 ? Math.round((aceptados / conConsejo) * 100) : 0,
    por_tipo: porTipo,
    observaciones
  };
}

/**
 * Detects improvement opportunities for an employee.
 */
async function detectarOportunidadMejora(empleadoId) {
  const oportunidades = [];

  // 1. Compare expedientes closed per day
  const empExpDia = await dbGet(
    `SELECT AVG(valor) as val FROM mentor_metricas WHERE empleado_id = ? AND metrica = 'expedientes_dia'`,
    [empleadoId]
  );
  const topExpDia = await dbGet(
    `SELECT empleado_nombre, AVG(valor) as val FROM mentor_metricas
     WHERE metrica = 'expedientes_dia' GROUP BY empleado_id ORDER BY val DESC LIMIT 1`
  );

  if (empExpDia && empExpDia.val && topExpDia && topExpDia.val && empExpDia.val < topExpDia.val * 0.7) {
    oportunidades.push({
      area: 'productividad',
      descripcion: `Cierras ${Math.round(empExpDia.val)} expedientes/dia pero el top performer (${topExpDia.empleado_nombre}) cierra ${Math.round(topExpDia.val)}. La diferencia principal es que consulta la wiki antes de cada caso.`,
      impacto: 'alto',
      sugerencia: 'Adoptar flujo de trabajo del top performer: wiki -> revision -> accion -> cierre',
      mejora_estimada: `+${Math.round(topExpDia.val - empExpDia.val)} expedientes/dia`
    });
  }

  // 2. Check error rate
  const empErrores = await dbGet(
    `SELECT AVG(valor) as val FROM mentor_metricas WHERE empleado_id = ? AND metrica = 'tasa_error'`,
    [empleadoId]
  );
  const teamErrores = await dbGet(
    `SELECT AVG(valor) as val FROM mentor_metricas WHERE metrica = 'tasa_error'`
  );

  if (empErrores && empErrores.val && teamErrores && teamErrores.val && empErrores.val > teamErrores.val * 1.3) {
    oportunidades.push({
      area: 'calidad',
      descripcion: `Tu tasa de error (${Math.round(empErrores.val)}%) esta por encima del promedio del equipo (${Math.round(teamErrores.val)}%).`,
      impacto: 'medio',
      sugerencia: 'Revisa el checklist de verificacion antes de cerrar cada expediente. Usa la plantilla estandar.',
      mejora_estimada: `-${Math.round(empErrores.val - teamErrores.val)}% en tasa de error`
    });
  }

  // 3. Check time per expediente
  const empTiempo = await dbGet(
    `SELECT AVG(valor) as val FROM mentor_metricas WHERE empleado_id = ? AND metrica = 'tiempo_medio_expediente'`,
    [empleadoId]
  );
  const topTiempo = await dbGet(
    `SELECT empleado_nombre, AVG(valor) as val FROM mentor_metricas
     WHERE metrica = 'tiempo_medio_expediente' GROUP BY empleado_id ORDER BY val ASC LIMIT 1`
  );

  if (empTiempo && empTiempo.val && topTiempo && topTiempo.val && empTiempo.val > topTiempo.val * 1.5) {
    oportunidades.push({
      area: 'eficiencia',
      descripcion: `Tu tiempo medio por expediente (${Math.round(empTiempo.val)} min) es ${Math.round(empTiempo.val / topTiempo.val * 100 - 100)}% mas alto que el de ${topTiempo.empleado_nombre} (${Math.round(topTiempo.val)} min).`,
      impacto: 'alto',
      sugerencia: 'Automatiza pasos repetitivos. Usa atajos de teclado y plantillas predefinidas.',
      mejora_estimada: `-${Math.round(empTiempo.val - topTiempo.val)} min por expediente`
    });
  }

  // 4. Check satisfaction
  const empSat = await dbGet(
    `SELECT AVG(valor) as val FROM mentor_metricas WHERE empleado_id = ? AND metrica = 'satisfaccion_cliente'`,
    [empleadoId]
  );
  const teamSat = await dbGet(
    `SELECT AVG(valor) as val FROM mentor_metricas WHERE metrica = 'satisfaccion_cliente'`
  );

  if (empSat && empSat.val && teamSat && teamSat.val && empSat.val < teamSat.val * 0.9) {
    oportunidades.push({
      area: 'satisfaccion_cliente',
      descripcion: `Tu satisfaccion de cliente (${empSat.val.toFixed(1)}/10) esta por debajo del promedio (${teamSat.val.toFixed(1)}/10).`,
      impacto: 'alto',
      sugerencia: 'Consulta el briefing del cliente antes de cada llamada. Personaliza la conversacion con datos de su historial.',
      mejora_estimada: `+${(teamSat.val - empSat.val).toFixed(1)} puntos de satisfaccion`
    });
  }

  // 5. Check if they use best practices
  const practicasAplicadas = await dbGet(
    `SELECT COUNT(*) as total FROM mentor_observaciones WHERE empleado_id = ? AND tipo = 'excelente'`,
    [empleadoId]
  );
  const totalObs = await dbGet(
    `SELECT COUNT(*) as total FROM mentor_observaciones WHERE empleado_id = ?`,
    [empleadoId]
  );

  if (totalObs && totalObs.total > 0 && practicasAplicadas) {
    const ratio = practicasAplicadas.total / totalObs.total;
    if (ratio < 0.3) {
      oportunidades.push({
        area: 'mejores_practicas',
        descripcion: `Solo el ${Math.round(ratio * 100)}% de tus acciones estan al nivel de excelencia.`,
        impacto: 'medio',
        sugerencia: 'Revisa las 10 mejores practicas del equipo y aplica al menos 3 esta semana.',
        mejora_estimada: 'Mejora general en productividad y calidad'
      });
    }
  }

  return {
    empleado_id: empleadoId,
    oportunidades_detectadas: oportunidades.length,
    oportunidades,
    fecha: new Date().toISOString()
  };
}

/**
 * Returns global statistics about the mentor system.
 */
async function getEstadisticas() {
  const hoy = new Date().toISOString().slice(0, 10);

  const observacionesHoy = await dbGet(
    `SELECT COUNT(*) as total FROM mentor_observaciones WHERE fecha LIKE ?`,
    [`${hoy}%`]
  );

  const consejosAceptados = await dbGet(
    `SELECT COUNT(*) as total FROM mentor_observaciones WHERE aceptado = 1`
  );

  const totalConsejos = await dbGet(
    `SELECT COUNT(*) as total FROM mentor_observaciones WHERE consejo IS NOT NULL`
  );

  const mejoresPracticasActivas = await dbGet(
    `SELECT COUNT(*) as total FROM mentor_mejores_practicas`
  );

  // Improvement trend: compare first half vs second half of observations
  const totalObs = await dbGet('SELECT COUNT(*) as total FROM mentor_observaciones');
  let mejoraMedia = 0;
  if (totalObs && totalObs.total > 4) {
    const mitad = Math.floor(totalObs.total / 2);
    const primerasMejoras = await dbGet(
      `SELECT COUNT(*) as total FROM (
        SELECT tipo FROM mentor_observaciones ORDER BY fecha ASC LIMIT ?
      ) WHERE tipo IN ('excelente', 'bien')`,
      [mitad]
    );
    const ultimasMejoras = await dbGet(
      `SELECT COUNT(*) as total FROM (
        SELECT tipo FROM mentor_observaciones ORDER BY fecha DESC LIMIT ?
      ) WHERE tipo IN ('excelente', 'bien')`,
      [mitad]
    );
    if (primerasMejoras && ultimasMejoras && mitad > 0) {
      mejoraMedia = Math.round(((ultimasMejoras.total - primerasMejoras.total) / mitad) * 100);
    }
  }

  const empleadosActivos = await dbGet(
    `SELECT COUNT(DISTINCT empleado_id) as total FROM mentor_observaciones`
  );

  const distribucionTipos = await dbAll(
    `SELECT tipo, COUNT(*) as cantidad FROM mentor_observaciones GROUP BY tipo ORDER BY cantidad DESC`
  );

  return {
    observaciones_hoy: observacionesHoy ? observacionesHoy.total : 0,
    consejos_aceptados: consejosAceptados ? consejosAceptados.total : 0,
    total_consejos: totalConsejos ? totalConsejos.total : 0,
    tasa_aceptacion: totalConsejos && totalConsejos.total > 0
      ? Math.round((consejosAceptados.total / totalConsejos.total) * 100) : 0,
    mejora_media_equipo: `${mejoraMedia}%`,
    mejores_practicas_activas: mejoresPracticasActivas ? mejoresPracticasActivas.total : 0,
    empleados_activos: empleadosActivos ? empleadosActivos.total : 0,
    distribucion_tipos: distribucionTipos,
    fecha: new Date().toISOString()
  };
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
async function seedMentor() {
  const count = await dbGet('SELECT COUNT(*) as c FROM mentor_observaciones');
  if (count && count.c > 0) {
    console.log('[MentorAgent] Datos de mentor ya existen, omitiendo seed');
    return;
  }

  console.log('[MentorAgent] Insertando datos de mentor de ejemplo...');

  // 5 employees
  const empleados = [
    { id: 'EMP-001', nombre: 'Carlos Lopez' },
    { id: 'EMP-002', nombre: 'Maria Santos' },
    { id: 'EMP-003', nombre: 'Javier Ruiz' },
    { id: 'EMP-004', nombre: 'Ana Gutierrez' },
    { id: 'EMP-005', nombre: 'Pedro Navarro' },
  ];

  // Observations for each employee
  const observaciones = [
    // Carlos Lopez - Top performer
    { emp: 'EMP-001', nombre: 'Carlos Lopez', tipo: 'excelente', obs: 'Revision de expediente completada en 4 min, al nivel del top performer.', consejo: null, fecha: '2026-03-01 09:30:00' },
    { emp: 'EMP-001', nombre: 'Carlos Lopez', tipo: 'excelente', obs: 'Evaluacion de danos en 6 min. Consulto wiki antes de empezar.', consejo: null, fecha: '2026-03-03 10:15:00' },
    { emp: 'EMP-001', nombre: 'Carlos Lopez', tipo: 'bien', obs: 'Llamada a cliente en 5 min. Dentro del promedio.', consejo: null, fecha: '2026-03-05 11:00:00' },
    { emp: 'EMP-001', nombre: 'Carlos Lopez', tipo: 'excelente', obs: 'Tramitacion de pago en 2.5 min. Uso plantilla estandar.', consejo: null, fecha: '2026-03-07 14:20:00' },
    { emp: 'EMP-001', nombre: 'Carlos Lopez', tipo: 'excelente', obs: 'Redaccion de informe en 7 min. Reutilizo secciones de informes previos.', consejo: null, fecha: '2026-03-10 09:45:00' },
    { emp: 'EMP-001', nombre: 'Carlos Lopez', tipo: 'bien', obs: 'Asignacion de perito en 3 min.', consejo: null, fecha: '2026-03-12 15:30:00' },

    // Maria Santos - Good, improving
    { emp: 'EMP-002', nombre: 'Maria Santos', tipo: 'mejora_posible', obs: 'Revision de expediente tomo 9 min, por encima del promedio (8 min).', consejo: 'Intenta consultar la wiki antes de empezar. Carlos lo hace en 5 min.', fecha: '2026-03-01 10:00:00' },
    { emp: 'EMP-002', nombre: 'Maria Santos', tipo: 'bien', obs: 'Evaluacion de danos en 11 min. Dentro del promedio.', consejo: null, fecha: '2026-03-03 11:30:00' },
    { emp: 'EMP-002', nombre: 'Maria Santos', tipo: 'excelente', obs: 'Llamada a cliente en 3 min. Excelente uso del briefing previo.', consejo: null, aceptado: 1, fecha: '2026-03-05 14:00:00' },
    { emp: 'EMP-002', nombre: 'Maria Santos', tipo: 'bien', obs: 'Tramitacion de pago en 4 min. Mejora respecto a la semana pasada.', consejo: null, fecha: '2026-03-08 09:15:00' },
    { emp: 'EMP-002', nombre: 'Maria Santos', tipo: 'excelente', obs: 'Verificacion de documentacion en 5 min. Aplico checklist nuevo.', consejo: null, aceptado: 1, fecha: '2026-03-12 10:00:00' },

    // Javier Ruiz - Average, needs tips
    { emp: 'EMP-003', nombre: 'Javier Ruiz', tipo: 'mejora_necesaria', obs: 'Revision de expediente tomo 15 min, muy por encima del promedio.', consejo: 'El top performer completa esta accion en 5 min. Revisa las mejores practicas.', fecha: '2026-03-02 09:00:00' },
    { emp: 'EMP-003', nombre: 'Javier Ruiz', tipo: 'mejora_posible', obs: 'Evaluacion de danos en 14 min.', consejo: 'Usa la plantilla de evaluacion rapida. Ahorra 5 min en media.', fecha: '2026-03-04 10:30:00' },
    { emp: 'EMP-003', nombre: 'Javier Ruiz', tipo: 'mejora_necesaria', obs: 'Llamada a cliente tomo 12 min. No consulto el briefing.', consejo: 'Consulta el briefing del cliente antes de llamar. Reduce el tiempo un 40%.', fecha: '2026-03-06 15:00:00' },
    { emp: 'EMP-003', nombre: 'Javier Ruiz', tipo: 'bien', obs: 'Tramitacion de pago en 4.5 min. Mejorando.', consejo: null, fecha: '2026-03-09 11:00:00' },
    { emp: 'EMP-003', nombre: 'Javier Ruiz', tipo: 'mejora_posible', obs: 'Redaccion de informe en 18 min.', consejo: 'Reutiliza secciones de informes previos como hace Carlos.', fecha: '2026-03-11 14:00:00' },

    // Ana Gutierrez - Strong at client relations
    { emp: 'EMP-004', nombre: 'Ana Gutierrez', tipo: 'excelente', obs: 'Llamada a cliente en 3.5 min con satisfaccion 9.5/10.', consejo: null, fecha: '2026-03-01 11:00:00' },
    { emp: 'EMP-004', nombre: 'Ana Gutierrez', tipo: 'bien', obs: 'Revision de expediente en 7 min.', consejo: null, fecha: '2026-03-03 09:30:00' },
    { emp: 'EMP-004', nombre: 'Ana Gutierrez', tipo: 'excelente', obs: 'Gestion de queja resuelta con NPS 9. Cliente paso de furioso a satisfecho.', consejo: null, fecha: '2026-03-06 10:15:00' },
    { emp: 'EMP-004', nombre: 'Ana Gutierrez', tipo: 'mejora_posible', obs: 'Tramitacion de pago en 6 min.', consejo: 'Usa la plantilla estandar de tramitacion. Reduce 2 min.', fecha: '2026-03-08 14:00:00' },
    { emp: 'EMP-004', nombre: 'Ana Gutierrez', tipo: 'excelente', obs: 'Mediacion con vecinos por filtracion resuelta en una sola llamada.', consejo: null, fecha: '2026-03-11 11:30:00' },

    // Pedro Navarro - New, learning
    { emp: 'EMP-005', nombre: 'Pedro Navarro', tipo: 'mejora_necesaria', obs: 'Revision de expediente tomo 20 min.', consejo: 'Como nuevo empleado, te recomiendo seguir el flujo de trabajo de Carlos: wiki -> revision -> accion.', fecha: '2026-03-05 09:00:00' },
    { emp: 'EMP-005', nombre: 'Pedro Navarro', tipo: 'mejora_necesaria', obs: 'Evaluacion de danos en 22 min. Necesita formacion adicional.', consejo: 'Agenda una sesion de shadowing con Carlos o Ana esta semana.', fecha: '2026-03-07 10:00:00' },
    { emp: 'EMP-005', nombre: 'Pedro Navarro', tipo: 'mejora_posible', obs: 'Llamada a cliente en 8 min. Mejorando.', consejo: 'Buen progreso. Sigue usando el briefing antes de cada llamada.', fecha: '2026-03-10 11:00:00' },
    { emp: 'EMP-005', nombre: 'Pedro Navarro', tipo: 'bien', obs: 'Verificacion de documentacion en 9 min. Dentro del rango aceptable.', consejo: null, fecha: '2026-03-12 14:30:00' },
    { emp: 'EMP-005', nombre: 'Pedro Navarro', tipo: 'bien', obs: 'Tramitacion de pago en 5 min. Progreso notable en 2 semanas.', consejo: null, fecha: '2026-03-14 09:30:00' },
  ];

  for (const obs of observaciones) {
    const id = `OBS-${uuidv4().slice(0, 8)}`;
    await dbRun(
      `INSERT INTO mentor_observaciones (id, empleado_id, empleado_nombre, tipo, observacion, consejo, aceptado, fecha)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, obs.emp, obs.nombre, obs.tipo, obs.obs, obs.consejo || null, obs.aceptado || 0, obs.fecha]
    );
  }

  // 10 Best practices
  const practicas = [
    { titulo: 'Consultar wiki antes de cada expediente', desc: 'Leer el protocolo relevante en la wiki interna antes de abrir un expediente nuevo. Reduce el tiempo medio un 35%.', fuente: 'Carlos Lopez', cat: 'productividad', apps: 45 },
    { titulo: 'Briefing de cliente obligatorio', desc: 'Siempre ejecutar getBriefingLlamada() antes de contactar a un cliente. Mejora la satisfaccion un 28%.', fuente: 'Ana Gutierrez', cat: 'satisfaccion', apps: 38 },
    { titulo: 'Plantilla estandar de informe', desc: 'Usar la plantilla estandar y reutilizar secciones de informes previos similares. Ahorra 5-8 min por informe.', fuente: 'Carlos Lopez', cat: 'productividad', apps: 52 },
    { titulo: 'Checklist de cierre de expediente', desc: 'Verificar 7 puntos clave antes de cerrar: documentacion, pagos, firma, NPS, seguimiento, archivo, notificacion.', fuente: 'Maria Santos', cat: 'calidad', apps: 33 },
    { titulo: 'Llamada de seguimiento a las 48h', desc: 'Llamar al cliente 48h despues de resolver su siniestro. Aumenta NPS en 1.2 puntos de media.', fuente: 'Ana Gutierrez', cat: 'satisfaccion', apps: 27 },
    { titulo: 'Priorizar por urgencia, no por orden de llegada', desc: 'Ordenar la cola de trabajo por urgencia descendente. Los expedientes criticos no deben esperar mas de 2h.', fuente: 'Carlos Lopez', cat: 'productividad', apps: 41 },
    { titulo: 'Fotografia estandarizada de danos', desc: 'Pedir al cliente 5 fotos especificas: general, detalle, numero de serie, contexto y documento. Acelera la evaluacion un 40%.', fuente: 'Maria Santos', cat: 'calidad', apps: 29 },
    { titulo: 'Escucha activa en quejas', desc: 'En quejas: dejar hablar 30 seg sin interrumpir, resumir, disculparse, proponer solucion. Tasa de resolucion en primera llamada: 78%.', fuente: 'Ana Gutierrez', cat: 'satisfaccion', apps: 35 },
    { titulo: 'Validacion cruzada anti-fraude', desc: 'En siniestros con score >30: verificar fecha de poliza, historial de reclamaciones, coherencia del relato, y datos del tercero.', fuente: 'Javier Ruiz', cat: 'calidad', apps: 18 },
    { titulo: 'Automatizar notificaciones de estado', desc: 'Configurar notificaciones automaticas al cliente en cada cambio de estado del expediente. Reduce llamadas de seguimiento un 60%.', fuente: 'Carlos Lopez', cat: 'productividad', apps: 44 },
  ];

  for (const p of practicas) {
    const id = `BP-${uuidv4().slice(0, 8)}`;
    await dbRun(
      `INSERT INTO mentor_mejores_practicas (id, titulo, descripcion, fuente_empleado, categoria, aplicaciones)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, p.titulo, p.desc, p.fuente, p.cat, p.apps]
    );
  }

  // Metrics for comparative data showing improvement over time
  const metricasSeed = [
    // Carlos Lopez - Top performer
    { emp: 'EMP-001', nombre: 'Carlos Lopez', metrica: 'tiempo_medio_expediente', valor: 5, fecha: '2026-03-01' },
    { emp: 'EMP-001', nombre: 'Carlos Lopez', metrica: 'satisfaccion_cliente', valor: 9.2, fecha: '2026-03-01' },
    { emp: 'EMP-001', nombre: 'Carlos Lopez', metrica: 'expedientes_dia', valor: 8, fecha: '2026-03-01' },
    { emp: 'EMP-001', nombre: 'Carlos Lopez', metrica: 'tasa_error', valor: 2, fecha: '2026-03-01' },
    { emp: 'EMP-001', nombre: 'Carlos Lopez', metrica: 'tiempo_medio_expediente', valor: 4.8, fecha: '2026-03-08' },
    { emp: 'EMP-001', nombre: 'Carlos Lopez', metrica: 'satisfaccion_cliente', valor: 9.4, fecha: '2026-03-08' },
    { emp: 'EMP-001', nombre: 'Carlos Lopez', metrica: 'expedientes_dia', valor: 9, fecha: '2026-03-08' },
    { emp: 'EMP-001', nombre: 'Carlos Lopez', metrica: 'tasa_error', valor: 1.5, fecha: '2026-03-08' },

    // Maria Santos - Good, improving
    { emp: 'EMP-002', nombre: 'Maria Santos', metrica: 'tiempo_medio_expediente', valor: 9, fecha: '2026-03-01' },
    { emp: 'EMP-002', nombre: 'Maria Santos', metrica: 'satisfaccion_cliente', valor: 8.1, fecha: '2026-03-01' },
    { emp: 'EMP-002', nombre: 'Maria Santos', metrica: 'expedientes_dia', valor: 5, fecha: '2026-03-01' },
    { emp: 'EMP-002', nombre: 'Maria Santos', metrica: 'tasa_error', valor: 5, fecha: '2026-03-01' },
    { emp: 'EMP-002', nombre: 'Maria Santos', metrica: 'tiempo_medio_expediente', valor: 7.5, fecha: '2026-03-08' },
    { emp: 'EMP-002', nombre: 'Maria Santos', metrica: 'satisfaccion_cliente', valor: 8.5, fecha: '2026-03-08' },
    { emp: 'EMP-002', nombre: 'Maria Santos', metrica: 'expedientes_dia', valor: 6, fecha: '2026-03-08' },
    { emp: 'EMP-002', nombre: 'Maria Santos', metrica: 'tasa_error', valor: 4, fecha: '2026-03-08' },

    // Javier Ruiz - Average
    { emp: 'EMP-003', nombre: 'Javier Ruiz', metrica: 'tiempo_medio_expediente', valor: 14, fecha: '2026-03-01' },
    { emp: 'EMP-003', nombre: 'Javier Ruiz', metrica: 'satisfaccion_cliente', valor: 7.0, fecha: '2026-03-01' },
    { emp: 'EMP-003', nombre: 'Javier Ruiz', metrica: 'expedientes_dia', valor: 3, fecha: '2026-03-01' },
    { emp: 'EMP-003', nombre: 'Javier Ruiz', metrica: 'tasa_error', valor: 8, fecha: '2026-03-01' },
    { emp: 'EMP-003', nombre: 'Javier Ruiz', metrica: 'tiempo_medio_expediente', valor: 12, fecha: '2026-03-08' },
    { emp: 'EMP-003', nombre: 'Javier Ruiz', metrica: 'satisfaccion_cliente', valor: 7.3, fecha: '2026-03-08' },
    { emp: 'EMP-003', nombre: 'Javier Ruiz', metrica: 'expedientes_dia', valor: 4, fecha: '2026-03-08' },
    { emp: 'EMP-003', nombre: 'Javier Ruiz', metrica: 'tasa_error', valor: 6, fecha: '2026-03-08' },

    // Ana Gutierrez - Strong at client relations
    { emp: 'EMP-004', nombre: 'Ana Gutierrez', metrica: 'tiempo_medio_expediente', valor: 7, fecha: '2026-03-01' },
    { emp: 'EMP-004', nombre: 'Ana Gutierrez', metrica: 'satisfaccion_cliente', valor: 9.5, fecha: '2026-03-01' },
    { emp: 'EMP-004', nombre: 'Ana Gutierrez', metrica: 'expedientes_dia', valor: 6, fecha: '2026-03-01' },
    { emp: 'EMP-004', nombre: 'Ana Gutierrez', metrica: 'tasa_error', valor: 3, fecha: '2026-03-01' },
    { emp: 'EMP-004', nombre: 'Ana Gutierrez', metrica: 'tiempo_medio_expediente', valor: 6.5, fecha: '2026-03-08' },
    { emp: 'EMP-004', nombre: 'Ana Gutierrez', metrica: 'satisfaccion_cliente', valor: 9.6, fecha: '2026-03-08' },
    { emp: 'EMP-004', nombre: 'Ana Gutierrez', metrica: 'expedientes_dia', valor: 7, fecha: '2026-03-08' },
    { emp: 'EMP-004', nombre: 'Ana Gutierrez', metrica: 'tasa_error', valor: 2.5, fecha: '2026-03-08' },

    // Pedro Navarro - New employee, learning fast
    { emp: 'EMP-005', nombre: 'Pedro Navarro', metrica: 'tiempo_medio_expediente', valor: 20, fecha: '2026-03-01' },
    { emp: 'EMP-005', nombre: 'Pedro Navarro', metrica: 'satisfaccion_cliente', valor: 6.5, fecha: '2026-03-01' },
    { emp: 'EMP-005', nombre: 'Pedro Navarro', metrica: 'expedientes_dia', valor: 2, fecha: '2026-03-01' },
    { emp: 'EMP-005', nombre: 'Pedro Navarro', metrica: 'tasa_error', valor: 12, fecha: '2026-03-01' },
    { emp: 'EMP-005', nombre: 'Pedro Navarro', metrica: 'tiempo_medio_expediente', valor: 14, fecha: '2026-03-08' },
    { emp: 'EMP-005', nombre: 'Pedro Navarro', metrica: 'satisfaccion_cliente', valor: 7.2, fecha: '2026-03-08' },
    { emp: 'EMP-005', nombre: 'Pedro Navarro', metrica: 'expedientes_dia', valor: 3, fecha: '2026-03-08' },
    { emp: 'EMP-005', nombre: 'Pedro Navarro', metrica: 'tasa_error', valor: 8, fecha: '2026-03-08' },
    { emp: 'EMP-005', nombre: 'Pedro Navarro', metrica: 'tiempo_medio_expediente', valor: 10, fecha: '2026-03-15' },
    { emp: 'EMP-005', nombre: 'Pedro Navarro', metrica: 'satisfaccion_cliente', valor: 7.8, fecha: '2026-03-15' },
    { emp: 'EMP-005', nombre: 'Pedro Navarro', metrica: 'expedientes_dia', valor: 5, fecha: '2026-03-15' },
    { emp: 'EMP-005', nombre: 'Pedro Navarro', metrica: 'tasa_error', valor: 5, fecha: '2026-03-15' },
  ];

  for (const m of metricasSeed) {
    const id = `MET-${uuidv4().slice(0, 8)}`;
    await dbRun(
      `INSERT INTO mentor_metricas (id, empleado_id, empleado_nombre, metrica, valor, periodo, fecha)
       VALUES (?, ?, ?, ?, ?, 'semanal', ?)`,
      [id, m.emp, m.nombre, m.metrica, m.valor, m.fecha]
    );
  }

  // Seed activities
  const actividadesSeed = [
    { emp: 'EMP-001', accion: 'revisar_expediente', tiempo: 240000, resultado: 'completado', fecha: '2026-03-10 09:30:00' },
    { emp: 'EMP-001', accion: 'evaluar_danos', tiempo: 360000, resultado: 'completado', fecha: '2026-03-10 10:15:00' },
    { emp: 'EMP-001', accion: 'llamada_cliente', tiempo: 210000, resultado: 'completado', fecha: '2026-03-10 11:00:00' },
    { emp: 'EMP-001', accion: 'redactar_informe', tiempo: 420000, resultado: 'completado', fecha: '2026-03-10 14:00:00' },
    { emp: 'EMP-002', accion: 'revisar_expediente', tiempo: 540000, resultado: 'completado', fecha: '2026-03-10 09:00:00' },
    { emp: 'EMP-002', accion: 'llamada_cliente', tiempo: 180000, resultado: 'completado', fecha: '2026-03-10 10:30:00' },
    { emp: 'EMP-002', accion: 'verificar_documentacion', tiempo: 300000, resultado: 'completado', fecha: '2026-03-10 11:30:00' },
    { emp: 'EMP-003', accion: 'revisar_expediente', tiempo: 900000, resultado: 'completado', fecha: '2026-03-10 09:00:00' },
    { emp: 'EMP-003', accion: 'evaluar_danos', tiempo: 840000, resultado: 'completado', fecha: '2026-03-10 10:30:00' },
    { emp: 'EMP-004', accion: 'llamada_cliente', tiempo: 210000, resultado: 'completado', fecha: '2026-03-10 09:15:00' },
    { emp: 'EMP-004', accion: 'revisar_expediente', tiempo: 420000, resultado: 'completado', fecha: '2026-03-10 10:00:00' },
    { emp: 'EMP-004', accion: 'tramitar_pago', tiempo: 360000, resultado: 'completado', fecha: '2026-03-10 14:30:00' },
    { emp: 'EMP-005', accion: 'revisar_expediente', tiempo: 1200000, resultado: 'completado', fecha: '2026-03-10 09:00:00' },
    { emp: 'EMP-005', accion: 'verificar_documentacion', tiempo: 540000, resultado: 'completado', fecha: '2026-03-10 11:00:00' },
    { emp: 'EMP-005', accion: 'tramitar_pago', tiempo: 300000, resultado: 'completado', fecha: '2026-03-10 14:00:00' },
  ];

  for (const a of actividadesSeed) {
    const id = `ACT-${uuidv4().slice(0, 8)}`;
    await dbRun(
      `INSERT INTO mentor_actividades (id, empleado_id, accion, tiempo_ms, resultado, fecha)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, a.emp, a.accion, a.tiempo, a.resultado, a.fecha]
    );
  }

  console.log('[MentorAgent] Datos de mentor insertados: 5 empleados, 10 mejores practicas, metricas comparativas');
}

// ---------------------------------------------------------------------------
// Initialize on load
// ---------------------------------------------------------------------------
(async () => {
  try {
    await initMentorDB();
    await seedMentor();
  } catch (err) {
    console.error('[MentorAgent] Error inicializando:', err.message);
  }
})();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  observarActividad,
  getConsejosTiempoReal,
  getMejoresPracticas,
  getRendimientoComparativo,
  getObservaciones,
  detectarOportunidadMejora,
  getEstadisticas,
  initMentorDB,
  seedMentor
};
