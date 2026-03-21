/**
 * Approval Service - Amount-based approval levels
 *
 * Manages the approval pipeline for claim payments following
 * SegurCaixa Adeslas's authority thresholds:
 *   <= 500 EUR   -> IA auto-approves
 *   500-3000     -> gestor
 *   3000-10000   -> supervisor
 *   10000-50000  -> director
 *   50000+       -> comite
 */

const { dbRun, dbAll, dbGet } = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const { ADESLAS_CONFIG, getReglaAprobacion } = require('../tenants/adeslas');

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
async function initAprobacionesTable() {
  await dbRun(`CREATE TABLE IF NOT EXISTS aprobaciones (
    id TEXT PRIMARY KEY,
    siniestro_id TEXT NOT NULL,
    importe INTEGER NOT NULL,
    nivel_requerido TEXT NOT NULL,
    aprobado_por TEXT,
    estado TEXT DEFAULT 'pendiente',
    motivo TEXT,
    notas TEXT,
    fecha_solicitud TEXT DEFAULT (datetime('now')),
    fecha_resolucion TEXT
  )`);
  await dbRun('CREATE INDEX IF NOT EXISTS idx_aprobaciones_siniestro ON aprobaciones(siniestro_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_aprobaciones_estado ON aprobaciones(estado)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_aprobaciones_nivel ON aprobaciones(nivel_requerido)');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates an approval request. Auto-approves if within IA threshold.
 * Returns { aprobacion_id, nivel_requerido, auto_aprobado, estado }
 */
async function solicitarAprobacion(siniestroId, importe, motivo) {
  await initAprobacionesTable();

  const regla = getReglaAprobacion(importe);
  const id = uuidv4();
  const autoAprobado = regla.nivel === 'ia';

  await dbRun(
    'INSERT INTO aprobaciones (id, siniestro_id, importe, nivel_requerido, aprobado_por, estado, motivo, fecha_resolucion) VALUES (?,?,?,?,?,?,?,?)',
    [
      id,
      siniestroId,
      importe,
      regla.nivel,
      autoAprobado ? 'ia_adeslas' : null,
      autoAprobado ? 'aprobada' : 'pendiente',
      motivo || `Indemnizacion por siniestro ${siniestroId}`,
      autoAprobado ? new Date().toISOString() : null,
    ]
  );

  // Log in timeline
  if (autoAprobado) {
    await dbRun(
      'INSERT OR IGNORE INTO expedientes (id, siniestro_id, tipo_evento, descripcion) VALUES (?,?,?,?)',
      [uuidv4(), siniestroId, 'aprobacion_automatica', `Pago de ${importe} EUR aprobado automaticamente por IA (umbral: ${ADESLAS_CONFIG.aprobaciones.auto_aprobar_hasta} EUR).`]
    );
  } else {
    await dbRun(
      'INSERT OR IGNORE INTO expedientes (id, siniestro_id, tipo_evento, descripcion) VALUES (?,?,?,?)',
      [uuidv4(), siniestroId, 'aprobacion_solicitada', `Aprobacion solicitada para ${importe} EUR. Nivel requerido: ${regla.nivel}. ${regla.descripcion}.`]
    );
  }

  return {
    aprobacion_id: id,
    siniestro_id: siniestroId,
    importe,
    nivel_requerido: regla.nivel,
    descripcion_nivel: regla.descripcion,
    auto_aprobado: autoAprobado,
    estado: autoAprobado ? 'aprobada' : 'pendiente',
  };
}

/**
 * Human approves a pending approval request.
 */
async function aprobar(aprobacionId, aprobadorId, notas) {
  await initAprobacionesTable();

  const aprobacion = await dbGet('SELECT * FROM aprobaciones WHERE id = ?', [aprobacionId]);
  if (!aprobacion) throw new Error(`Aprobacion ${aprobacionId} no encontrada`);
  if (aprobacion.estado !== 'pendiente') throw new Error(`Aprobacion ya esta en estado: ${aprobacion.estado}`);

  await dbRun(
    "UPDATE aprobaciones SET estado = 'aprobada', aprobado_por = ?, notas = ?, fecha_resolucion = datetime('now') WHERE id = ?",
    [aprobadorId, notas || null, aprobacionId]
  );

  await dbRun(
    'INSERT OR IGNORE INTO expedientes (id, siniestro_id, tipo_evento, descripcion) VALUES (?,?,?,?)',
    [uuidv4(), aprobacion.siniestro_id, 'aprobacion_humana', `Pago de ${aprobacion.importe} EUR aprobado por ${aprobadorId}. ${notas || ''}`]
  );

  return {
    aprobacion_id: aprobacionId,
    estado: 'aprobada',
    aprobado_por: aprobadorId,
    importe: aprobacion.importe,
    siniestro_id: aprobacion.siniestro_id,
  };
}

/**
 * Human rejects a pending approval request.
 */
async function rechazar(aprobacionId, aprobadorId, motivo) {
  await initAprobacionesTable();

  const aprobacion = await dbGet('SELECT * FROM aprobaciones WHERE id = ?', [aprobacionId]);
  if (!aprobacion) throw new Error(`Aprobacion ${aprobacionId} no encontrada`);
  if (aprobacion.estado !== 'pendiente') throw new Error(`Aprobacion ya esta en estado: ${aprobacion.estado}`);

  await dbRun(
    "UPDATE aprobaciones SET estado = 'rechazada', aprobado_por = ?, notas = ?, fecha_resolucion = datetime('now') WHERE id = ?",
    [aprobadorId, motivo || null, aprobacionId]
  );

  await dbRun(
    'INSERT OR IGNORE INTO expedientes (id, siniestro_id, tipo_evento, descripcion) VALUES (?,?,?,?)',
    [uuidv4(), aprobacion.siniestro_id, 'aprobacion_rechazada', `Pago de ${aprobacion.importe} EUR RECHAZADO por ${aprobadorId}. Motivo: ${motivo || 'No especificado'}`]
  );

  return {
    aprobacion_id: aprobacionId,
    estado: 'rechazada',
    rechazado_por: aprobadorId,
    motivo,
    importe: aprobacion.importe,
    siniestro_id: aprobacion.siniestro_id,
  };
}

/**
 * Pending approvals filtered by required level.
 * If no level specified, returns all pending.
 */
async function getAprobacionesPendientes(nivel) {
  await initAprobacionesTable();

  let query = `SELECT a.*, s.expediente, s.tipo, s.urgencia, s.descripcion as desc_siniestro,
                      c.nombre as cliente_nombre, c.poliza
               FROM aprobaciones a
               LEFT JOIN siniestros s ON a.siniestro_id = s.id
               LEFT JOIN clientes c ON s.cliente_id = c.id
               WHERE a.estado = 'pendiente'`;
  const params = [];

  if (nivel) {
    query += ' AND a.nivel_requerido = ?';
    params.push(nivel);
  }

  query += ' ORDER BY a.importe DESC, a.fecha_solicitud ASC';

  return dbAll(query, params);
}

/**
 * Comprehensive statistics for the approval pipeline.
 */
async function getEstadisticas() {
  await initAprobacionesTable();

  const pendientes = await dbGet("SELECT COUNT(*) as c FROM aprobaciones WHERE estado = 'pendiente'");
  const aprobadasAuto = await dbGet("SELECT COUNT(*) as c FROM aprobaciones WHERE estado = 'aprobada' AND aprobado_por = 'ia_adeslas'");
  const aprobadasHumano = await dbGet("SELECT COUNT(*) as c FROM aprobaciones WHERE estado = 'aprobada' AND aprobado_por != 'ia_adeslas'");
  const rechazadas = await dbGet("SELECT COUNT(*) as c FROM aprobaciones WHERE estado = 'rechazada'");

  const importeAprobado = await dbGet("SELECT COALESCE(SUM(importe), 0) as total FROM aprobaciones WHERE estado = 'aprobada'");
  const importePendiente = await dbGet("SELECT COALESCE(SUM(importe), 0) as total FROM aprobaciones WHERE estado = 'pendiente'");

  // Average approval time (for human approvals)
  const tiempoMedio = await dbGet(`
    SELECT AVG(
      CAST((julianday(fecha_resolucion) - julianday(fecha_solicitud)) * 24 AS REAL)
    ) as horas
    FROM aprobaciones
    WHERE estado = 'aprobada' AND aprobado_por != 'ia_adeslas' AND fecha_resolucion IS NOT NULL
  `);

  // Breakdown by level
  const porNivel = await dbAll(`
    SELECT nivel_requerido, estado, COUNT(*) as cantidad, COALESCE(SUM(importe), 0) as importe_total
    FROM aprobaciones
    GROUP BY nivel_requerido, estado
    ORDER BY nivel_requerido, estado
  `);

  return {
    pendientes: (pendientes && pendientes.c) || 0,
    aprobadas_auto: (aprobadasAuto && aprobadasAuto.c) || 0,
    aprobadas_humano: (aprobadasHumano && aprobadasHumano.c) || 0,
    rechazadas: (rechazadas && rechazadas.c) || 0,
    importe_total_aprobado: (importeAprobado && importeAprobado.total) || 0,
    importe_total_pendiente: (importePendiente && importePendiente.total) || 0,
    tiempo_medio_aprobacion_horas: tiempoMedio && tiempoMedio.horas ? parseFloat(tiempoMedio.horas.toFixed(1)) : 0,
    desglose_por_nivel: porNivel,
    umbrales: ADESLAS_CONFIG.aprobaciones,
  };
}

/**
 * Returns required approval level for a given amount.
 */
function verificarNivelAprobacion(importe) {
  return getReglaAprobacion(importe);
}

// ---------------------------------------------------------------------------
// Seed: 12 approvals in various states
// ---------------------------------------------------------------------------
async function seedAprobaciones() {
  await initAprobacionesTable();

  const existing = await dbGet('SELECT COUNT(*) as c FROM aprobaciones');
  if (existing && existing.c > 0) {
    console.log('[Aprobaciones] Ya existen registros, omitiendo seed');
    return;
  }

  console.log('[Aprobaciones] Insertando 12 aprobaciones de ejemplo...');

  const now = new Date();

  function horasAtras(h) {
    return new Date(now.getTime() - h * 3600000).toISOString().replace('T', ' ').substring(0, 19);
  }

  const aprobaciones = [
    // 6 auto-approved (IA, <= 500 EUR)
    {
      id: uuidv4(), siniestro_id: 'SIN-007', importe: 180,
      nivel_requerido: 'ia', aprobado_por: 'ia_adeslas', estado: 'aprobada',
      motivo: 'Reparacion paragolpes trasero menor',
      fecha_solicitud: horasAtras(240), fecha_resolucion: horasAtras(240),
    },
    {
      id: uuidv4(), siniestro_id: 'SIN-011', importe: 320,
      nivel_requerido: 'ia', aprobado_por: 'ia_adeslas', estado: 'aprobada',
      motivo: 'Sustitucion cristal salon',
      fecha_solicitud: horasAtras(180), fecha_resolucion: horasAtras(180),
    },
    {
      id: uuidv4(), siniestro_id: 'SIN-015', importe: 450,
      nivel_requerido: 'ia', aprobado_por: 'ia_adeslas', estado: 'aprobada',
      motivo: 'Indemnizacion bicicleta electrica robada',
      fecha_solicitud: horasAtras(120), fecha_resolucion: horasAtras(120),
    },
    {
      id: uuidv4(), siniestro_id: 'SIN-005', importe: 250,
      nivel_requerido: 'ia', aprobado_por: 'ia_adeslas', estado: 'aprobada',
      motivo: 'Reparacion abolladura menor por granizo',
      fecha_solicitud: horasAtras(96), fecha_resolucion: horasAtras(96),
    },
    {
      id: uuidv4(), siniestro_id: 'SIN-013', importe: 380,
      nivel_requerido: 'ia', aprobado_por: 'ia_adeslas', estado: 'aprobada',
      motivo: 'Tratamiento antihumedad pared',
      fecha_solicitud: horasAtras(72), fecha_resolucion: horasAtras(72),
    },
    {
      id: uuidv4(), siniestro_id: 'SIN-012', importe: 490,
      nivel_requerido: 'ia', aprobado_por: 'ia_adeslas', estado: 'aprobada',
      motivo: 'Gastos urgencias fractura muneca',
      fecha_solicitud: horasAtras(48), fecha_resolucion: horasAtras(48),
    },

    // 3 pending (awaiting human approval)
    {
      id: uuidv4(), siniestro_id: 'SIN-002', importe: 4800,
      nivel_requerido: 'supervisor', aprobado_por: null, estado: 'pendiente',
      motivo: 'Reparacion inundacion: parquet + muebles salon',
      fecha_solicitud: horasAtras(24), fecha_resolucion: null,
    },
    {
      id: uuidv4(), siniestro_id: 'SIN-001', importe: 8500,
      nivel_requerido: 'supervisor', aprobado_por: null, estado: 'pendiente',
      motivo: 'Reparacion colision frontal: motor + carroceria',
      fecha_solicitud: horasAtras(12), fecha_resolucion: null,
    },
    {
      id: uuidv4(), siniestro_id: 'SIN-014', importe: 15000,
      nivel_requerido: 'director', aprobado_por: null, estado: 'pendiente',
      motivo: 'Accidente multiple AP-7: danos vehiculo + lesiones',
      fecha_solicitud: horasAtras(6), fecha_resolucion: null,
    },

    // 2 approved by human
    {
      id: uuidv4(), siniestro_id: 'SIN-006', importe: 23500,
      nivel_requerido: 'director', aprobado_por: 'director_garcia', estado: 'aprobada',
      motivo: 'Incendio cocina: reconstruccion completa + mobiliario',
      notas: 'Aprobado tras verificacion pericial. Danos consistentes con cortocircuito.',
      fecha_solicitud: horasAtras(480), fecha_resolucion: horasAtras(456),
    },
    {
      id: uuidv4(), siniestro_id: 'SIN-012', importe: 1700,
      nivel_requerido: 'gestor', aprobado_por: 'gestor_roberto', estado: 'aprobada',
      motivo: 'Intervencion traumatologia + rehabilitacion',
      notas: 'Factura verificada con Hospital Virgen del Rocio.',
      fecha_solicitud: horasAtras(360), fecha_resolucion: horasAtras(348),
    },

    // 1 rejected
    {
      id: uuidv4(), siniestro_id: 'SIN-009', importe: 42000,
      nivel_requerido: 'director', aprobado_por: 'director_garcia', estado: 'rechazada',
      motivo: 'Robo BMW Serie 3 - valor declarado',
      notas: 'RECHAZADO: Score fraude 68/100. Investigacion en curso. Inconsistencias en declaracion.',
      fecha_solicitud: horasAtras(200), fecha_resolucion: horasAtras(168),
    },
  ];

  for (const a of aprobaciones) {
    await dbRun(
      'INSERT INTO aprobaciones (id, siniestro_id, importe, nivel_requerido, aprobado_por, estado, motivo, notas, fecha_solicitud, fecha_resolucion) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [a.id, a.siniestro_id, a.importe, a.nivel_requerido, a.aprobado_por, a.estado, a.motivo, a.notas || null, a.fecha_solicitud, a.fecha_resolucion]
    );
  }

  console.log('[Aprobaciones] 12 aprobaciones de ejemplo insertadas (6 auto, 3 pendientes, 2 humanas, 1 rechazada)');
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  initAprobacionesTable,
  solicitarAprobacion,
  aprobar,
  rechazar,
  getAprobacionesPendientes,
  getEstadisticas,
  verificarNivelAprobacion,
  seedAprobaciones,
};
