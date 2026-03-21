// =============================================================================
// Kill Switch & Supervision Mode Service
// Control de modos de operación IA para tenants (SegurCaixa Adeslas)
// =============================================================================

const { v4: uuidv4 } = require('uuid');
const path = require('path');

// ---------------------------------------------------------------------------
// Database helpers (inline para independencia del módulo)
// ---------------------------------------------------------------------------

let db = null;

function getDb() {
  if (!db) {
    const sqlite3 = require('sqlite3').verbose();
    const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'siniestros.db');
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) console.error('[KillSwitch] Error abriendo DB:', err.message);
    });
    db.run('PRAGMA journal_mode=WAL');
    db.run('PRAGMA foreign_keys=ON');
  }
  return db;
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// ---------------------------------------------------------------------------
// Modos válidos
// ---------------------------------------------------------------------------

const MODOS_VALIDOS = ['automatico', 'supervision', 'asistido', 'desactivado'];

const MODOS_DESCRIPCION = {
  automatico:  'IA trabaja de forma completamente autónoma. Todas las acciones se ejecutan sin intervención humana.',
  supervision: 'IA propone todas las acciones, pero un humano debe aprobar cada una antes de ejecutarse.',
  asistido:    'IA asiste al gestor humano con sugerencias y análisis, pero no actúa por sí sola.',
  desactivado: 'IA completamente desactivada. Todos los procesos son manuales.',
};

// Acciones del sistema y qué modos las permiten
const ACCIONES_PERMITIDAS = {
  'apertura_siniestro':        { automatico: true,  supervision: false, asistido: false, desactivado: false },
  'asignacion_perito':         { automatico: true,  supervision: false, asistido: false, desactivado: false },
  'valoracion_automatica':     { automatico: true,  supervision: false, asistido: false, desactivado: false },
  'envio_comunicacion':        { automatico: true,  supervision: false, asistido: false, desactivado: false },
  'deteccion_fraude':          { automatico: true,  supervision: true,  asistido: true,  desactivado: false },
  'propuesta_indemnizacion':   { automatico: true,  supervision: false, asistido: false, desactivado: false },
  'cierre_expediente':         { automatico: true,  supervision: false, asistido: false, desactivado: false },
  'llamada_automatica':        { automatico: true,  supervision: false, asistido: false, desactivado: false },
  'envio_whatsapp':            { automatico: true,  supervision: false, asistido: false, desactivado: false },
  'solicitud_documentacion':   { automatico: true,  supervision: true,  asistido: false, desactivado: false },
  'escalado_urgencia':         { automatico: true,  supervision: true,  asistido: true,  desactivado: false },
  'analisis_documentos':       { automatico: true,  supervision: true,  asistido: true,  desactivado: false },
  'generacion_informe':        { automatico: true,  supervision: true,  asistido: true,  desactivado: false },
  'peritacion_virtual':        { automatico: true,  supervision: false, asistido: false, desactivado: false },
  'aprobacion_pago':           { automatico: true,  supervision: false, asistido: false, desactivado: false },
};

// ---------------------------------------------------------------------------
// Inicialización de tabla
// ---------------------------------------------------------------------------

let initialized = false;

async function initTable() {
  if (initialized) return;

  await dbRun(`CREATE TABLE IF NOT EXISTS sistema_control (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    clave TEXT NOT NULL,
    valor TEXT NOT NULL,
    modificado_por TEXT,
    fecha TEXT DEFAULT (datetime('now')),
    UNIQUE(tenant_id, clave)
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS sistema_control_historial (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    modo_anterior TEXT,
    modo_nuevo TEXT NOT NULL,
    motivo TEXT,
    usuario TEXT,
    tipo_cambio TEXT DEFAULT 'manual',
    fecha TEXT DEFAULT (datetime('now'))
  )`);

  await dbRun('CREATE INDEX IF NOT EXISTS idx_control_tenant ON sistema_control(tenant_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_control_historial_tenant ON sistema_control_historial(tenant_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_control_historial_fecha ON sistema_control_historial(fecha)');

  initialized = true;
  console.log('[KillSwitch] Tablas de control inicializadas');
}

// ---------------------------------------------------------------------------
// Seed de datos para Adeslas
// ---------------------------------------------------------------------------

async function seedAdeslas() {
  await initTable();

  const existing = await dbGet(
    'SELECT COUNT(*) as c FROM sistema_control WHERE tenant_id = ?',
    ['adeslas']
  );

  if (existing && existing.c > 0) {
    console.log('[KillSwitch] Datos Adeslas ya existen, omitiendo seed');
    return;
  }

  // Estado actual: automático
  await dbRun(
    `INSERT OR REPLACE INTO sistema_control (id, tenant_id, clave, valor, modificado_por)
     VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), 'adeslas', 'modo_ia', 'automatico', 'sistema']
  );

  await dbRun(
    `INSERT OR REPLACE INTO sistema_control (id, tenant_id, clave, valor, modificado_por)
     VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), 'adeslas', 'agentes_activos', '27', 'sistema']
  );

  await dbRun(
    `INSERT OR REPLACE INTO sistema_control (id, tenant_id, clave, valor, modificado_por)
     VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), 'adeslas', 'umbral_fraude', '65', 'sistema']
  );

  await dbRun(
    `INSERT OR REPLACE INTO sistema_control (id, tenant_id, clave, valor, modificado_por)
     VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), 'adeslas', 'auto_aprobacion_hasta', '500', 'sistema']
  );

  await dbRun(
    `INSERT OR REPLACE INTO sistema_control (id, tenant_id, clave, valor, modificado_por)
     VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), 'adeslas', 'gestor_aprobacion_hasta', '3000', 'sistema']
  );

  await dbRun(
    `INSERT OR REPLACE INTO sistema_control (id, tenant_id, clave, valor, modificado_por)
     VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), 'adeslas', 'supervisor_aprobacion_hasta', '10000', 'sistema']
  );

  // 5 cambios históricos de modo
  const historial = [
    {
      modo_anterior: null,
      modo_nuevo: 'automatico',
      motivo: 'Configuración inicial del sistema SiniestrosAI para Adeslas',
      usuario: 'sistema',
      tipo: 'instalacion',
      fecha: '2025-11-15 09:00:00',
    },
    {
      modo_anterior: 'automatico',
      modo_nuevo: 'supervision',
      motivo: 'Pruebas de supervisión previas al lanzamiento piloto',
      usuario: 'Carlos Mendoza (Director TI)',
      tipo: 'manual',
      fecha: '2025-12-02 10:30:00',
    },
    {
      modo_anterior: 'supervision',
      modo_nuevo: 'automatico',
      motivo: 'Piloto aprobado. Activación modo automático completo',
      usuario: 'Elena Ríos (Directora Operaciones)',
      tipo: 'manual',
      fecha: '2025-12-16 08:00:00',
    },
    {
      modo_anterior: 'automatico',
      modo_nuevo: 'desactivado',
      motivo: 'Mantenimiento programado del sistema - actualización v2.4',
      usuario: 'sistema',
      tipo: 'mantenimiento',
      fecha: '2026-01-20 02:00:00',
    },
    {
      modo_anterior: 'desactivado',
      modo_nuevo: 'automatico',
      motivo: 'Mantenimiento completado. Sistema reactivado con nuevas mejoras',
      usuario: 'Carlos Mendoza (Director TI)',
      tipo: 'reactivacion',
      fecha: '2026-01-20 06:15:00',
    },
  ];

  for (const h of historial) {
    await dbRun(
      `INSERT INTO sistema_control_historial (id, tenant_id, modo_anterior, modo_nuevo, motivo, usuario, tipo_cambio, fecha)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), 'adeslas', h.modo_anterior, h.modo_nuevo, h.motivo, h.usuario, h.tipo, h.fecha]
    );
  }

  console.log('[KillSwitch] Datos Adeslas sembrados: modo automático + 5 registros históricos');
}

// ---------------------------------------------------------------------------
// Funciones principales
// ---------------------------------------------------------------------------

/**
 * Obtiene el modo actual de IA para un tenant.
 * @param {string} tenantId
 * @returns {Promise<string>} Modo actual ('automatico' por defecto)
 */
async function getModo(tenantId) {
  await initTable();
  const row = await dbGet(
    'SELECT valor FROM sistema_control WHERE tenant_id = ? AND clave = ?',
    [tenantId, 'modo_ia']
  );
  return row ? row.valor : 'automatico';
}

/**
 * Establece el modo de operación de IA.
 * @param {string} tenantId
 * @param {string} modo - Uno de: automatico, supervision, asistido, desactivado
 * @param {string} motivo - Razón del cambio
 * @param {string} usuario - Quién realiza el cambio
 * @returns {Promise<object>} Resultado con modo anterior y nuevo
 */
async function setModo(tenantId, modo, motivo, usuario) {
  await initTable();

  if (!MODOS_VALIDOS.includes(modo)) {
    throw new Error(`Modo inválido: "${modo}". Modos válidos: ${MODOS_VALIDOS.join(', ')}`);
  }

  const modoAnterior = await getModo(tenantId);

  if (modoAnterior === modo) {
    return {
      cambiado: false,
      modo_actual: modo,
      mensaje: `El sistema ya está en modo "${modo}"`,
    };
  }

  // Actualizar o insertar el modo actual
  const existing = await dbGet(
    'SELECT id FROM sistema_control WHERE tenant_id = ? AND clave = ?',
    [tenantId, 'modo_ia']
  );

  if (existing) {
    await dbRun(
      `UPDATE sistema_control SET valor = ?, modificado_por = ?, fecha = datetime('now')
       WHERE tenant_id = ? AND clave = ?`,
      [modo, usuario, tenantId, 'modo_ia']
    );
  } else {
    await dbRun(
      `INSERT INTO sistema_control (id, tenant_id, clave, valor, modificado_por)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), tenantId, 'modo_ia', modo, usuario]
    );
  }

  // Registrar en historial
  await dbRun(
    `INSERT INTO sistema_control_historial (id, tenant_id, modo_anterior, modo_nuevo, motivo, usuario, tipo_cambio)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uuidv4(), tenantId, modoAnterior, modo, motivo, usuario, 'manual']
  );

  console.log(`[KillSwitch] Modo cambiado: ${modoAnterior} -> ${modo} por ${usuario}. Motivo: ${motivo}`);

  return {
    cambiado: true,
    modo_anterior: modoAnterior,
    modo_nuevo: modo,
    descripcion: MODOS_DESCRIPCION[modo],
    usuario,
    motivo,
    fecha: new Date().toISOString(),
  };
}

/**
 * KILL SWITCH DE EMERGENCIA.
 * Desactiva inmediatamente toda la IA para el tenant.
 * @param {string} tenantId
 * @param {string} usuario - Quién activa el kill switch
 * @returns {Promise<object>}
 */
async function killSwitch(tenantId, usuario) {
  await initTable();

  const modoAnterior = await getModo(tenantId);
  const timestamp = new Date().toISOString();

  // Forzar desactivación
  const existing = await dbGet(
    'SELECT id FROM sistema_control WHERE tenant_id = ? AND clave = ?',
    [tenantId, 'modo_ia']
  );

  if (existing) {
    await dbRun(
      `UPDATE sistema_control SET valor = 'desactivado', modificado_por = ?, fecha = datetime('now')
       WHERE tenant_id = ? AND clave = ?`,
      [usuario, tenantId, 'modo_ia']
    );
  } else {
    await dbRun(
      `INSERT INTO sistema_control (id, tenant_id, clave, valor, modificado_por)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), tenantId, 'modo_ia', 'desactivado', usuario]
    );
  }

  // Registrar en historial como emergencia
  const motivo = `KILL SWITCH ACTIVADO - Desactivación de emergencia a las ${timestamp}`;
  await dbRun(
    `INSERT INTO sistema_control_historial (id, tenant_id, modo_anterior, modo_nuevo, motivo, usuario, tipo_cambio)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uuidv4(), tenantId, modoAnterior, 'desactivado', motivo, usuario, 'emergencia']
  );

  console.error(`[KILL SWITCH] IA DESACTIVADA para tenant "${tenantId}" por ${usuario} a las ${timestamp}`);

  return {
    activado: true,
    modo_anterior: modoAnterior,
    modo_nuevo: 'desactivado',
    usuario,
    motivo,
    timestamp,
    mensaje: 'KILL SWITCH ACTIVADO. Toda la IA ha sido desactivada inmediatamente. Todos los procesos son ahora manuales.',
    acciones_suspendidas: Object.keys(ACCIONES_PERMITIDAS),
  };
}

/**
 * Reactiva el sistema después de un kill switch.
 * @param {string} tenantId
 * @param {string} modo - Modo al que reactivar (por defecto 'automatico')
 * @param {string} usuario - Quién reactiva
 * @returns {Promise<object>}
 */
async function reactivar(tenantId, modo = 'automatico', usuario) {
  await initTable();

  if (!MODOS_VALIDOS.includes(modo)) {
    throw new Error(`Modo inválido: "${modo}". Modos válidos: ${MODOS_VALIDOS.join(', ')}`);
  }

  if (modo === 'desactivado') {
    throw new Error('No se puede reactivar en modo "desactivado". Use un modo operativo.');
  }

  const modoActual = await getModo(tenantId);

  if (modoActual !== 'desactivado') {
    return {
      reactivado: false,
      modo_actual: modoActual,
      mensaje: `El sistema no está desactivado. Modo actual: "${modoActual}". Use setModo() para cambiar el modo.`,
    };
  }

  // Reactivar
  await dbRun(
    `UPDATE sistema_control SET valor = ?, modificado_por = ?, fecha = datetime('now')
     WHERE tenant_id = ? AND clave = ?`,
    [modo, usuario, tenantId, 'modo_ia']
  );

  const motivo = `Sistema reactivado en modo "${modo}" tras desactivación`;
  await dbRun(
    `INSERT INTO sistema_control_historial (id, tenant_id, modo_anterior, modo_nuevo, motivo, usuario, tipo_cambio)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uuidv4(), tenantId, 'desactivado', modo, motivo, usuario, 'reactivacion']
  );

  console.log(`[KillSwitch] Sistema REACTIVADO para "${tenantId}" en modo "${modo}" por ${usuario}`);

  return {
    reactivado: true,
    modo_anterior: 'desactivado',
    modo_nuevo: modo,
    descripcion: MODOS_DESCRIPCION[modo],
    usuario,
    fecha: new Date().toISOString(),
    mensaje: `Sistema reactivado exitosamente en modo "${modo}".`,
  };
}

/**
 * Obtiene el historial completo de cambios de modo.
 * @param {string} tenantId
 * @param {number} limite - Número máximo de registros (default 50)
 * @returns {Promise<Array>}
 */
async function getHistorial(tenantId, limite = 50) {
  await initTable();

  const rows = await dbAll(
    `SELECT id, tenant_id, modo_anterior, modo_nuevo, motivo, usuario, tipo_cambio, fecha
     FROM sistema_control_historial
     WHERE tenant_id = ?
     ORDER BY fecha DESC
     LIMIT ?`,
    [tenantId, limite]
  );

  return rows.map(row => ({
    ...row,
    descripcion_modo: MODOS_DESCRIPCION[row.modo_nuevo] || 'Desconocido',
  }));
}

/**
 * Obtiene el estado detallado de la IA para un tenant.
 * @param {string} tenantId
 * @returns {Promise<object>}
 */
async function getEstadoIA(tenantId) {
  await initTable();

  const modo = await getModo(tenantId);

  // Obtener último cambio
  const ultimoCambio = await dbGet(
    `SELECT modo_anterior, modo_nuevo, motivo, usuario, tipo_cambio, fecha
     FROM sistema_control_historial
     WHERE tenant_id = ?
     ORDER BY fecha DESC
     LIMIT 1`,
    [tenantId]
  );

  // Obtener agentes activos
  const agentesRow = await dbGet(
    'SELECT valor FROM sistema_control WHERE tenant_id = ? AND clave = ?',
    [tenantId, 'agentes_activos']
  );
  const agentesActivos = agentesRow ? parseInt(agentesRow.valor) : 0;

  // Obtener umbral de fraude
  const umbralRow = await dbGet(
    'SELECT valor FROM sistema_control WHERE tenant_id = ? AND clave = ?',
    [tenantId, 'umbral_fraude']
  );
  const umbralFraude = umbralRow ? parseInt(umbralRow.valor) : 65;

  // Contar cambios totales
  const totalCambios = await dbGet(
    'SELECT COUNT(*) as c FROM sistema_control_historial WHERE tenant_id = ?',
    [tenantId]
  );

  // Contar emergencias
  const totalEmergencias = await dbGet(
    `SELECT COUNT(*) as c FROM sistema_control_historial
     WHERE tenant_id = ? AND tipo_cambio = 'emergencia'`,
    [tenantId]
  );

  return {
    tenant_id: tenantId,
    modo,
    activo: modo !== 'desactivado',
    descripcion: MODOS_DESCRIPCION[modo],
    agentes_activos: agentesActivos,
    umbral_fraude: umbralFraude,
    ultimo_cambio: ultimoCambio || null,
    motivo: ultimoCambio ? ultimoCambio.motivo : null,
    estadisticas: {
      total_cambios_modo: totalCambios ? totalCambios.c : 0,
      total_emergencias: totalEmergencias ? totalEmergencias.c : 0,
    },
    acciones: Object.entries(ACCIONES_PERMITIDAS).map(([accion, permisos]) => ({
      accion,
      permitida: permisos[modo] || false,
    })),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Comprueba si una acción específica está permitida en el modo actual.
 * @param {string} tenantId
 * @param {string} accion - Nombre de la acción a verificar
 * @returns {Promise<object>} {permitida, motivo, modo_actual}
 */
async function isAccionPermitida(tenantId, accion) {
  await initTable();

  const modo = await getModo(tenantId);

  // Si la acción no está definida, denegar por seguridad
  if (!ACCIONES_PERMITIDAS[accion]) {
    return {
      permitida: false,
      motivo: `Acción "${accion}" no reconocida por el sistema de control`,
      modo_actual: modo,
      accion,
    };
  }

  const permitida = ACCIONES_PERMITIDAS[accion][modo] || false;

  let motivo;
  if (permitida) {
    motivo = `Acción "${accion}" permitida en modo "${modo}"`;
  } else if (modo === 'desactivado') {
    motivo = `IA desactivada (kill switch). Ninguna acción automática permitida.`;
  } else if (modo === 'supervision') {
    motivo = `Modo supervisión: la acción "${accion}" requiere aprobación humana previa.`;
  } else if (modo === 'asistido') {
    motivo = `Modo asistido: la acción "${accion}" debe ser ejecutada por un humano. La IA solo asesora.`;
  } else {
    motivo = `Acción "${accion}" no permitida en modo "${modo}"`;
  }

  return {
    permitida,
    motivo,
    modo_actual: modo,
    accion,
    descripcion_modo: MODOS_DESCRIPCION[modo],
  };
}

// ---------------------------------------------------------------------------
// Exportaciones
// ---------------------------------------------------------------------------

module.exports = {
  // Funciones principales
  getModo,
  setModo,
  killSwitch,
  reactivar,
  getHistorial,
  getEstadoIA,
  isAccionPermitida,

  // Inicialización y seed
  initTable,
  seedAdeslas,

  // Constantes exportadas para uso externo
  MODOS_VALIDOS,
  MODOS_DESCRIPCION,
  ACCIONES_PERMITIDAS,
};
