/**
 * equipoService.js - Gestión de Equipo SegurCaixa Adeslas
 *
 * Servicio de gestión de personal: roles, permisos, jerarquía,
 * capacidad de aprobación, asignación de casos y organigrama.
 * Persistencia real en SQLite.
 */

const { dbRun, dbAll, dbGet } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// ============================================================
// ROLES Y JERARQUÍA
// ============================================================

const ROLES = {
  director_general: {
    nombre: 'Director General',
    nivel: 1,
    max_aprobacion: 999999999,
    permisos: ['ver_todo', 'aprobar_todo', 'configurar_ia', 'gestionar_equipo', 'ver_informes', 'kill_switch'],
    recibe_escalados: true,
    puede_configurar_reglas: true,
  },
  director_siniestros: {
    nombre: 'Director de Siniestros',
    nivel: 2,
    max_aprobacion: 5000000,
    permisos: ['ver_departamento', 'aprobar_alto', 'gestionar_equipo_dept', 'ver_informes', 'configurar_reglas'],
    recibe_escalados: true,
  },
  jefe_departamento: {
    nombre: 'Jefe de Departamento',
    nivel: 3,
    max_aprobacion: 1000000,
    permisos: ['ver_departamento', 'aprobar_medio', 'asignar_casos', 'ver_informes_dept'],
    recibe_escalados: true,
  },
  coordinador: {
    nombre: 'Coordinador',
    nivel: 4,
    max_aprobacion: 300000,
    permisos: ['ver_equipo', 'aprobar_bajo', 'asignar_casos', 'reasignar'],
    recibe_escalados: false,
  },
  gestor_senior: {
    nombre: 'Gestor Senior',
    nivel: 5,
    max_aprobacion: 100000,
    permisos: ['gestionar_siniestros', 'aprobar_minimo', 'contactar_cliente'],
  },
  gestor: {
    nombre: 'Gestor',
    nivel: 6,
    max_aprobacion: 50000,
    permisos: ['gestionar_siniestros', 'contactar_cliente'],
  },
  auxiliar: {
    nombre: 'Auxiliar',
    nivel: 7,
    max_aprobacion: 0,
    permisos: ['ver_siniestros', 'documentar', 'contactar_cliente'],
  },
};

// ============================================================
// DEPARTAMENTOS
// ============================================================

const DEPARTAMENTOS = {
  siniestros_auto: { nombre: 'Siniestros de Automóvil', codigo: 'siniestros_auto' },
  siniestros_hogar: { nombre: 'Siniestros de Hogar', codigo: 'siniestros_hogar' },
  siniestros_diversos: { nombre: 'Decesos, Vida, Accidentes, RC, Comercio, Comunidades', codigo: 'siniestros_diversos' },
  fraude: { nombre: 'Investigación de Fraude', codigo: 'fraude' },
  atencion_cliente: { nombre: 'Atención al Cliente', codigo: 'atencion_cliente' },
  legal: { nombre: 'Departamento Legal', codigo: 'legal' },
  direccion: { nombre: 'Dirección', codigo: 'direccion' },
};

// ============================================================
// INICIALIZACIÓN DE TABLAS
// ============================================================

let _initialized = false;

async function initTables() {
  if (_initialized) return;

  await dbRun(`CREATE TABLE IF NOT EXISTS equipo (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    departamento TEXT NOT NULL,
    rol TEXT NOT NULL,
    permisos TEXT,
    activo INTEGER DEFAULT 1,
    superior_id TEXT,
    max_aprobacion INTEGER DEFAULT 0,
    productos_asignados TEXT,
    zonas_asignadas TEXT,
    carga_actual INTEGER DEFAULT 0,
    max_carga INTEGER DEFAULT 20,
    creado_en TEXT DEFAULT (datetime('now'))
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS equipo_log (
    id TEXT PRIMARY KEY,
    empleado_id TEXT,
    accion TEXT NOT NULL,
    detalle TEXT,
    fecha TEXT DEFAULT (datetime('now'))
  )`);

  await dbRun('CREATE INDEX IF NOT EXISTS idx_equipo_dept ON equipo(departamento)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_equipo_rol ON equipo(rol)');

  _initialized = true;
}

// ============================================================
// LOGGING INTERNO
// ============================================================

async function logAccion(empleadoId, accion, detalle) {
  try {
    await dbRun(
      'INSERT INTO equipo_log (id, empleado_id, accion, detalle) VALUES (?, ?, ?, ?)',
      [uuidv4(), empleadoId, accion, typeof detalle === 'string' ? detalle : JSON.stringify(detalle)]
    );
  } catch (err) {
    console.error('Error logging accion equipo:', err.message);
  }
}

// ============================================================
// FUNCIONES PRINCIPALES
// ============================================================

/**
 * Registrar un nuevo empleado en el sistema.
 */
async function registrarEmpleado(datos) {
  await initTables();

  const { nombre, email, telefono, departamento, rol, superior_id, productos_asignados, zonas_asignadas } = datos;

  if (!nombre || !email || !departamento || !rol) {
    throw new Error('Campos obligatorios: nombre, email, departamento, rol');
  }

  if (!ROLES[rol]) {
    throw new Error(`Rol inválido: ${rol}. Roles válidos: ${Object.keys(ROLES).join(', ')}`);
  }

  if (!DEPARTAMENTOS[departamento]) {
    throw new Error(`Departamento inválido: ${departamento}. Departamentos válidos: ${Object.keys(DEPARTAMENTOS).join(', ')}`);
  }

  // Verificar email único
  const existente = await dbGet('SELECT id FROM equipo WHERE email = ?', [email]);
  if (existente) {
    throw new Error(`Ya existe un empleado con el email: ${email}`);
  }

  const id = uuidv4();
  const rolConfig = ROLES[rol];
  const permisosStr = JSON.stringify(rolConfig.permisos);
  const productosStr = productos_asignados ? JSON.stringify(productos_asignados) : null;
  const zonasStr = zonas_asignadas ? JSON.stringify(zonas_asignadas) : null;

  await dbRun(
    `INSERT INTO equipo (id, nombre, email, telefono, departamento, rol, permisos, superior_id, max_aprobacion, productos_asignados, zonas_asignadas)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, nombre, email, telefono || null, departamento, rol, permisosStr, superior_id || null, rolConfig.max_aprobacion, productosStr, zonasStr]
  );

  await logAccion(id, 'registro', { nombre, email, departamento, rol });

  const empleado = await dbGet('SELECT * FROM equipo WHERE id = ?', [id]);
  return formatEmpleado(empleado);
}

/**
 * Listar equipo con filtros opcionales.
 */
async function getEquipo(filtros = {}) {
  await initTables();

  let sql = `
    SELECT e.*, s.nombre as superior_nombre
    FROM equipo e
    LEFT JOIN equipo s ON e.superior_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (filtros.departamento) {
    sql += ' AND e.departamento = ?';
    params.push(filtros.departamento);
  }

  if (filtros.rol) {
    sql += ' AND e.rol = ?';
    params.push(filtros.rol);
  }

  if (filtros.activo !== undefined) {
    sql += ' AND e.activo = ?';
    params.push(filtros.activo ? 1 : 0);
  } else {
    // Por defecto solo activos
    sql += ' AND e.activo = 1';
  }

  sql += ' ORDER BY e.departamento, e.rol, e.nombre';

  const rows = await dbAll(sql, params);
  return rows.map(formatEmpleado);
}

/**
 * Obtener detalle de un empleado por ID.
 */
async function getEmpleado(id) {
  await initTables();

  const empleado = await dbGet(`
    SELECT e.*, s.nombre as superior_nombre
    FROM equipo e
    LEFT JOIN equipo s ON e.superior_id = s.id
    WHERE e.id = ?
  `, [id]);

  if (!empleado) {
    throw new Error(`Empleado no encontrado: ${id}`);
  }

  const formatted = formatEmpleado(empleado);

  // Historial de acciones
  const historial = await dbAll(
    'SELECT * FROM equipo_log WHERE empleado_id = ? ORDER BY fecha DESC LIMIT 50',
    [id]
  );
  formatted.historial = historial;

  // Subordinados
  const subordinados = await dbAll(
    'SELECT id, nombre, rol, departamento, carga_actual FROM equipo WHERE superior_id = ? AND activo = 1',
    [id]
  );
  formatted.subordinados = subordinados;

  // Info del rol
  const rolConfig = ROLES[empleado.rol];
  if (rolConfig) {
    formatted.rol_info = {
      nombre_completo: rolConfig.nombre,
      nivel: rolConfig.nivel,
      max_aprobacion_euros: (rolConfig.max_aprobacion / 100).toFixed(2),
      recibe_escalados: rolConfig.recibe_escalados || false,
    };
  }

  return formatted;
}

/**
 * Actualizar datos de un empleado.
 */
async function actualizarEmpleado(id, cambios) {
  await initTables();

  const empleado = await dbGet('SELECT * FROM equipo WHERE id = ?', [id]);
  if (!empleado) {
    throw new Error(`Empleado no encontrado: ${id}`);
  }

  const camposPermitidos = [
    'nombre', 'telefono', 'departamento', 'rol', 'superior_id',
    'productos_asignados', 'zonas_asignadas', 'max_carga', 'activo'
  ];

  const updates = [];
  const params = [];

  for (const campo of camposPermitidos) {
    if (cambios[campo] !== undefined) {
      let valor = cambios[campo];

      // Validar rol si se cambia
      if (campo === 'rol') {
        if (!ROLES[valor]) {
          throw new Error(`Rol inválido: ${valor}`);
        }
        // Actualizar permisos y max_aprobacion según nuevo rol
        const rolConfig = ROLES[valor];
        updates.push('permisos = ?');
        params.push(JSON.stringify(rolConfig.permisos));
        updates.push('max_aprobacion = ?');
        params.push(rolConfig.max_aprobacion);
      }

      // Validar departamento si se cambia
      if (campo === 'departamento' && !DEPARTAMENTOS[valor]) {
        throw new Error(`Departamento inválido: ${valor}`);
      }

      // Serializar arrays
      if (campo === 'productos_asignados' || campo === 'zonas_asignadas') {
        valor = Array.isArray(valor) ? JSON.stringify(valor) : valor;
      }

      updates.push(`${campo} = ?`);
      params.push(valor);
    }
  }

  if (updates.length === 0) {
    throw new Error('No se proporcionaron cambios válidos');
  }

  params.push(id);
  await dbRun(`UPDATE equipo SET ${updates.join(', ')} WHERE id = ?`, params);

  await logAccion(id, 'actualizacion', cambios);

  return await getEmpleado(id);
}

/**
 * Desactivar empleado (soft delete) y reasignar sus casos.
 */
async function desactivarEmpleado(id) {
  await initTables();

  const empleado = await dbGet('SELECT * FROM equipo WHERE id = ?', [id]);
  if (!empleado) {
    throw new Error(`Empleado no encontrado: ${id}`);
  }

  if (!empleado.activo) {
    throw new Error('El empleado ya está desactivado');
  }

  // Desactivar
  await dbRun('UPDATE equipo SET activo = 0 WHERE id = ?', [id]);

  // Reasignar carga a compañeros del mismo departamento y rol (o superior)
  let reasignados = 0;
  if (empleado.carga_actual > 0) {
    const companeros = await dbAll(
      `SELECT id, carga_actual, max_carga FROM equipo
       WHERE departamento = ? AND activo = 1 AND id != ?
       AND (rol = ? OR rol IN ('gestor_senior', 'coordinador'))
       ORDER BY carga_actual ASC`,
      [empleado.departamento, id, empleado.rol]
    );

    if (companeros.length > 0) {
      // Distribuir la carga equitativamente
      let cargaPendiente = empleado.carga_actual;
      let idx = 0;
      while (cargaPendiente > 0 && idx < companeros.length) {
        const comp = companeros[idx];
        if (comp.carga_actual < comp.max_carga) {
          await dbRun('UPDATE equipo SET carga_actual = carga_actual + 1 WHERE id = ?', [comp.id]);
          cargaPendiente--;
          reasignados++;
        }
        idx++;
        if (idx >= companeros.length) idx = 0;
        // Safety break
        if (reasignados > 100) break;
      }
    }

    // Poner su carga a 0
    await dbRun('UPDATE equipo SET carga_actual = 0 WHERE id = ?', [id]);
  }

  await logAccion(id, 'desactivacion', { casos_reasignados: reasignados });

  return {
    mensaje: `Empleado ${empleado.nombre} desactivado`,
    casos_reasignados: reasignados,
  };
}

/**
 * Obtener organigrama jerárquico.
 */
async function getOrganigrama() {
  await initTables();

  const empleados = await dbAll(
    'SELECT id, nombre, rol, departamento, superior_id, carga_actual, activo FROM equipo WHERE activo = 1 ORDER BY rol'
  );

  // Construir árbol
  function buildTree(superiorId) {
    return empleados
      .filter(e => e.superior_id === superiorId)
      .map(e => ({
        id: e.id,
        nombre: e.nombre,
        rol: e.rol,
        rol_nombre: ROLES[e.rol]?.nombre || e.rol,
        departamento: e.departamento,
        departamento_nombre: DEPARTAMENTOS[e.departamento]?.nombre || e.departamento,
        carga_actual: e.carga_actual,
        subordinados: buildTree(e.id),
      }));
  }

  // Raíces: empleados sin superior
  const raices = empleados
    .filter(e => !e.superior_id)
    .map(e => ({
      id: e.id,
      nombre: e.nombre,
      rol: e.rol,
      rol_nombre: ROLES[e.rol]?.nombre || e.rol,
      departamento: e.departamento,
      departamento_nombre: DEPARTAMENTOS[e.departamento]?.nombre || e.departamento,
      carga_actual: e.carga_actual,
      subordinados: buildTree(e.id),
    }));

  return raices;
}

/**
 * Obtener todos los roles disponibles con descripción.
 */
function getRoles() {
  return Object.entries(ROLES).map(([key, val]) => ({
    codigo: key,
    nombre: val.nombre,
    nivel: val.nivel,
    max_aprobacion_cents: val.max_aprobacion,
    max_aprobacion_euros: (val.max_aprobacion / 100).toFixed(2),
    permisos: val.permisos,
    recibe_escalados: val.recibe_escalados || false,
    puede_configurar_reglas: val.puede_configurar_reglas || false,
  }));
}

/**
 * Verificar si un empleado tiene un permiso específico.
 */
async function tienePermiso(empleadoId, permiso) {
  await initTables();

  const empleado = await dbGet('SELECT permisos, rol FROM equipo WHERE id = ? AND activo = 1', [empleadoId]);
  if (!empleado) return false;

  // Director general tiene todos los permisos
  if (empleado.rol === 'director_general') return true;

  let permisos = [];
  try {
    permisos = JSON.parse(empleado.permisos || '[]');
  } catch {
    permisos = [];
  }

  return permisos.includes(permiso) || permisos.includes('ver_todo') || permisos.includes('aprobar_todo');
}

/**
 * Verificar si un empleado puede aprobar un importe dado (en céntimos).
 */
async function puedeAprobar(empleadoId, importe) {
  await initTables();

  const empleado = await dbGet('SELECT max_aprobacion, rol, nombre FROM equipo WHERE id = ? AND activo = 1', [empleadoId]);
  if (!empleado) return { puede: false, motivo: 'Empleado no encontrado o inactivo' };

  if (empleado.max_aprobacion >= importe) {
    return {
      puede: true,
      empleado: { id: empleadoId, nombre: empleado.nombre, rol: empleado.rol },
      importe_solicitado: importe,
      max_aprobacion: empleado.max_aprobacion,
    };
  }

  return {
    puede: false,
    motivo: `El importe (${(importe / 100).toFixed(2)}€) supera el límite de aprobación del empleado (${(empleado.max_aprobacion / 100).toFixed(2)}€)`,
    empleado: { id: empleadoId, nombre: empleado.nombre, rol: empleado.rol },
    importe_solicitado: importe,
    max_aprobacion: empleado.max_aprobacion,
  };
}

/**
 * Buscar el aprobador adecuado para un importe y departamento.
 *
 * Rangos:
 *   < 500€ (50000 cents)     → Gestor asignado al caso
 *   500-1000€                → Gestor Senior del departamento
 *   1000-3000€               → Coordinador
 *   3000-10000€              → Jefe de departamento
 *   10000-50000€             → Director de Siniestros
 *   > 50000€                 → Director General
 */
async function buscarAprobador(importe, departamento) {
  await initTables();

  let rolNecesario;
  let nivel;

  if (importe < 50000) {
    rolNecesario = 'gestor';
    nivel = 'bajo';
  } else if (importe < 100000) {
    rolNecesario = 'gestor_senior';
    nivel = 'medio-bajo';
  } else if (importe < 300000) {
    rolNecesario = 'coordinador';
    nivel = 'medio';
  } else if (importe < 1000000) {
    rolNecesario = 'jefe_departamento';
    nivel = 'medio-alto';
  } else if (importe < 5000000) {
    rolNecesario = 'director_siniestros';
    nivel = 'alto';
  } else {
    rolNecesario = 'director_general';
    nivel = 'critico';
  }

  // Buscar aprobador: primero en el departamento, luego escalando
  let aprobador = null;

  if (['gestor', 'gestor_senior', 'coordinador', 'jefe_departamento'].includes(rolNecesario)) {
    aprobador = await dbGet(
      `SELECT id, nombre, email, rol, departamento FROM equipo
       WHERE rol = ? AND departamento = ? AND activo = 1
       ORDER BY carga_actual ASC LIMIT 1`,
      [rolNecesario, departamento]
    );
  }

  // Si no hay en el departamento o es rol de dirección, buscar globalmente
  if (!aprobador) {
    aprobador = await dbGet(
      `SELECT id, nombre, email, rol, departamento FROM equipo
       WHERE rol = ? AND activo = 1
       ORDER BY carga_actual ASC LIMIT 1`,
      [rolNecesario]
    );
  }

  // Escalado: si no se encuentra, buscar el siguiente nivel superior
  if (!aprobador) {
    const rolesOrden = ['gestor', 'gestor_senior', 'coordinador', 'jefe_departamento', 'director_siniestros', 'director_general'];
    const idx = rolesOrden.indexOf(rolNecesario);
    for (let i = idx + 1; i < rolesOrden.length; i++) {
      aprobador = await dbGet(
        `SELECT id, nombre, email, rol, departamento FROM equipo
         WHERE rol = ? AND activo = 1
         ORDER BY carga_actual ASC LIMIT 1`,
        [rolesOrden[i]]
      );
      if (aprobador) break;
    }
  }

  if (!aprobador) {
    return {
      error: 'No se encontró un aprobador disponible',
      importe_euros: (importe / 100).toFixed(2),
      departamento,
      nivel,
    };
  }

  await logAccion(aprobador.id, 'busqueda_aprobador', {
    importe_cents: importe,
    importe_euros: (importe / 100).toFixed(2),
    departamento,
    nivel,
  });

  return {
    aprobador: {
      id: aprobador.id,
      nombre: aprobador.nombre,
      email: aprobador.email,
      rol: aprobador.rol,
      rol_nombre: ROLES[aprobador.rol]?.nombre || aprobador.rol,
    },
    nivel,
    importe_euros: (importe / 100).toFixed(2),
    departamento,
    notificar_por: 'email',
  };
}

/**
 * Asignar un caso automáticamente al gestor más adecuado.
 * Criterios: departamento, carga actual, zona, especialización.
 */
async function asignarCaso(siniestroId, departamento, tipo) {
  await initTables();

  if (!departamento || !DEPARTAMENTOS[departamento]) {
    // Inferir departamento por tipo
    if (tipo) {
      const tipoLower = (tipo || '').toLowerCase();
      if (tipoLower.includes('auto') || tipoLower.includes('coche') || tipoLower.includes('vehiculo')) {
        departamento = 'siniestros_auto';
      } else if (tipoLower.includes('hogar') || tipoLower.includes('casa') || tipoLower.includes('vivienda') || tipoLower.includes('agua') || tipoLower.includes('incendio')) {
        departamento = 'siniestros_hogar';
      } else {
        departamento = 'siniestros_diversos';
      }
    } else {
      departamento = 'siniestros_auto';
    }
  }

  // Buscar gestores activos del departamento, no sobrecargados, ordenados por carga
  const gestores = await dbAll(
    `SELECT id, nombre, rol, carga_actual, max_carga, zonas_asignadas, productos_asignados
     FROM equipo
     WHERE departamento = ? AND activo = 1
       AND rol IN ('gestor', 'gestor_senior')
       AND carga_actual < max_carga
     ORDER BY carga_actual ASC`,
    [departamento]
  );

  if (gestores.length === 0) {
    // Intentar con coordinadores
    const coordinadores = await dbAll(
      `SELECT id, nombre, rol, carga_actual, max_carga, zonas_asignadas
       FROM equipo
       WHERE departamento = ? AND activo = 1
         AND rol = 'coordinador'
         AND carga_actual < max_carga
       ORDER BY carga_actual ASC`,
      [departamento]
    );

    if (coordinadores.length === 0) {
      return {
        error: 'No hay gestores disponibles en el departamento',
        departamento,
        tipo,
        siniestro_id: siniestroId,
      };
    }

    // Asignar al coordinador con menos carga
    const asignado = coordinadores[0];
    await dbRun('UPDATE equipo SET carga_actual = carga_actual + 1 WHERE id = ?', [asignado.id]);

    await logAccion(asignado.id, 'asignacion_caso', {
      siniestro_id: siniestroId,
      departamento,
      tipo,
      motivo: 'No hay gestores disponibles, asignado a coordinador',
    });

    return {
      gestor_asignado: { id: asignado.id, nombre: asignado.nombre, rol: asignado.rol },
      departamento,
      tipo,
      siniestro_id: siniestroId,
      motivo_asignacion: 'Asignado a coordinador por falta de gestores disponibles',
    };
  }

  // Seleccionar el gestor con menor carga
  const asignado = gestores[0];

  await dbRun('UPDATE equipo SET carga_actual = carga_actual + 1 WHERE id = ?', [asignado.id]);

  await logAccion(asignado.id, 'asignacion_caso', {
    siniestro_id: siniestroId,
    departamento,
    tipo,
    motivo: 'Menor carga de trabajo',
  });

  return {
    gestor_asignado: { id: asignado.id, nombre: asignado.nombre, rol: asignado.rol },
    departamento,
    departamento_nombre: DEPARTAMENTOS[departamento]?.nombre || departamento,
    tipo,
    siniestro_id: siniestroId,
    motivo_asignacion: `Asignado por menor carga de trabajo (${asignado.carga_actual}/${asignado.max_carga} casos)`,
  };
}

/**
 * Estadísticas del equipo.
 */
async function getEstadisticas() {
  await initTables();

  const total = await dbGet('SELECT COUNT(*) as total FROM equipo WHERE activo = 1');

  const porDepartamento = await dbAll(
    'SELECT departamento, COUNT(*) as total FROM equipo WHERE activo = 1 GROUP BY departamento'
  );

  const porRol = await dbAll(
    'SELECT rol, COUNT(*) as total FROM equipo WHERE activo = 1 GROUP BY rol'
  );

  const cargaMedia = await dbGet(
    'SELECT AVG(carga_actual) as media, MAX(carga_actual) as max_carga, MIN(carga_actual) as min_carga FROM equipo WHERE activo = 1'
  );

  const sobrecargados = await dbAll(
    `SELECT id, nombre, rol, departamento, carga_actual, max_carga
     FROM equipo
     WHERE activo = 1 AND carga_actual >= max_carga * 0.8
     ORDER BY carga_actual DESC`
  );

  const inactivos = await dbGet('SELECT COUNT(*) as total FROM equipo WHERE activo = 0');

  return {
    total_empleados: total.total,
    empleados_inactivos: inactivos.total,
    por_departamento: porDepartamento.map(d => ({
      departamento: d.departamento,
      nombre: DEPARTAMENTOS[d.departamento]?.nombre || d.departamento,
      total: d.total,
    })),
    por_rol: porRol.map(r => ({
      rol: r.rol,
      nombre: ROLES[r.rol]?.nombre || r.rol,
      total: r.total,
    })),
    carga_media: parseFloat((cargaMedia.media || 0).toFixed(1)),
    carga_maxima: cargaMedia.max_carga || 0,
    carga_minima: cargaMedia.min_carga || 0,
    empleados_sobrecargados: sobrecargados,
  };
}

// ============================================================
// SEED DATA - Equipo realista SegurCaixa Adeslas
// ============================================================

async function seedEquipo() {
  await initTables();

  const existe = await dbGet('SELECT COUNT(*) as total FROM equipo');
  if (existe && existe.total > 0) return;

  console.log('  Seeding equipo SegurCaixa Adeslas...');

  // IDs fijos para relaciones jerárquicas
  const IDS = {
    manuel: uuidv4(),
    carmen: uuidv4(),
    pablo: uuidv4(),
    laura: uuidv4(),
    ana: uuidv4(),
    roberto: uuidv4(),
    carlos: uuidv4(),
    elena: uuidv4(),
    miguel: uuidv4(),
    isabel: uuidv4(),
    javier: uuidv4(),
    sofia: uuidv4(),
    pedro: uuidv4(),
    lucia: uuidv4(),
    raquel: uuidv4(),
  };

  const empleados = [
    // Director General
    {
      id: IDS.manuel, nombre: 'Manuel Rodríguez', email: 'manuel.rodriguez@segurcaixa.es',
      telefono: '+34 911 000 001', departamento: 'direccion', rol: 'director_general',
      superior_id: null,
      productos_asignados: JSON.stringify(['todos']),
      zonas_asignadas: JSON.stringify(['nacional']),
      carga_actual: 2, max_carga: 10,
    },
    // Director de Siniestros
    {
      id: IDS.carmen, nombre: 'Carmen López', email: 'carmen.lopez@segurcaixa.es',
      telefono: '+34 911 000 002', departamento: 'direccion', rol: 'director_siniestros',
      superior_id: IDS.manuel,
      productos_asignados: JSON.stringify(['auto', 'hogar', 'vida', 'accidentes']),
      zonas_asignadas: JSON.stringify(['nacional']),
      carga_actual: 5, max_carga: 15,
    },
    // Jefes de Departamento
    {
      id: IDS.pablo, nombre: 'Pablo García', email: 'pablo.garcia@segurcaixa.es',
      telefono: '+34 911 000 003', departamento: 'siniestros_auto', rol: 'jefe_departamento',
      superior_id: IDS.carmen,
      productos_asignados: JSON.stringify(['auto', 'moto', 'flota']),
      zonas_asignadas: JSON.stringify(['madrid', 'centro', 'norte']),
      carga_actual: 8, max_carga: 15,
    },
    {
      id: IDS.laura, nombre: 'Laura Sánchez', email: 'laura.sanchez@segurcaixa.es',
      telefono: '+34 911 000 004', departamento: 'siniestros_hogar', rol: 'jefe_departamento',
      superior_id: IDS.carmen,
      productos_asignados: JSON.stringify(['hogar', 'comunidades', 'comercio']),
      zonas_asignadas: JSON.stringify(['barcelona', 'levante', 'sur']),
      carga_actual: 7, max_carga: 15,
    },
    // Coordinadores
    {
      id: IDS.ana, nombre: 'Ana Martínez', email: 'ana.martinez@segurcaixa.es',
      telefono: '+34 911 000 005', departamento: 'siniestros_auto', rol: 'coordinador',
      superior_id: IDS.pablo,
      productos_asignados: JSON.stringify(['auto', 'moto']),
      zonas_asignadas: JSON.stringify(['madrid', 'centro']),
      carga_actual: 12, max_carga: 20,
    },
    {
      id: IDS.roberto, nombre: 'Roberto Díaz', email: 'roberto.diaz@segurcaixa.es',
      telefono: '+34 911 000 006', departamento: 'siniestros_hogar', rol: 'coordinador',
      superior_id: IDS.laura,
      productos_asignados: JSON.stringify(['hogar', 'comunidades']),
      zonas_asignadas: JSON.stringify(['barcelona', 'levante']),
      carga_actual: 10, max_carga: 20,
    },
    // Gestores Senior
    {
      id: IDS.carlos, nombre: 'Carlos Ruiz', email: 'carlos.ruiz@segurcaixa.es',
      telefono: '+34 911 000 007', departamento: 'siniestros_auto', rol: 'gestor_senior',
      superior_id: IDS.ana,
      productos_asignados: JSON.stringify(['auto']),
      zonas_asignadas: JSON.stringify(['madrid', 'toledo', 'guadalajara']),
      carga_actual: 15, max_carga: 20,
    },
    {
      id: IDS.elena, nombre: 'Elena Torres', email: 'elena.torres@segurcaixa.es',
      telefono: '+34 911 000 008', departamento: 'siniestros_auto', rol: 'gestor_senior',
      superior_id: IDS.ana,
      productos_asignados: JSON.stringify(['auto', 'moto']),
      zonas_asignadas: JSON.stringify(['valladolid', 'leon', 'burgos']),
      carga_actual: 13, max_carga: 20,
    },
    {
      id: IDS.miguel, nombre: 'Miguel Fernández', email: 'miguel.fernandez@segurcaixa.es',
      telefono: '+34 911 000 009', departamento: 'siniestros_hogar', rol: 'gestor_senior',
      superior_id: IDS.roberto,
      productos_asignados: JSON.stringify(['hogar']),
      zonas_asignadas: JSON.stringify(['barcelona', 'tarragona', 'girona']),
      carga_actual: 14, max_carga: 20,
    },
    {
      id: IDS.isabel, nombre: 'Isabel Moreno', email: 'isabel.moreno@segurcaixa.es',
      telefono: '+34 911 000 010', departamento: 'siniestros_hogar', rol: 'gestor_senior',
      superior_id: IDS.roberto,
      productos_asignados: JSON.stringify(['hogar', 'comunidades']),
      zonas_asignadas: JSON.stringify(['valencia', 'alicante', 'castellon']),
      carga_actual: 11, max_carga: 20,
    },
    // Gestores
    {
      id: IDS.javier, nombre: 'Javier Romero', email: 'javier.romero@segurcaixa.es',
      telefono: '+34 911 000 011', departamento: 'siniestros_auto', rol: 'gestor',
      superior_id: IDS.ana,
      productos_asignados: JSON.stringify(['auto']),
      zonas_asignadas: JSON.stringify(['madrid', 'segovia']),
      carga_actual: 16, max_carga: 20,
    },
    {
      id: IDS.sofia, nombre: 'Sofía Rodríguez', email: 'sofia.rodriguez@segurcaixa.es',
      telefono: '+34 911 000 012', departamento: 'siniestros_auto', rol: 'gestor',
      superior_id: IDS.ana,
      productos_asignados: JSON.stringify(['auto', 'flota']),
      zonas_asignadas: JSON.stringify(['avila', 'salamanca']),
      carga_actual: 10, max_carga: 20,
    },
    {
      id: IDS.pedro, nombre: 'Pedro Álvarez', email: 'pedro.alvarez@segurcaixa.es',
      telefono: '+34 911 000 013', departamento: 'siniestros_hogar', rol: 'gestor',
      superior_id: IDS.roberto,
      productos_asignados: JSON.stringify(['hogar']),
      zonas_asignadas: JSON.stringify(['murcia', 'almeria']),
      carga_actual: 9, max_carga: 20,
    },
    // Auxiliares
    {
      id: IDS.lucia, nombre: 'Lucía Fernández', email: 'lucia.fernandez@segurcaixa.es',
      telefono: '+34 911 000 014', departamento: 'siniestros_auto', rol: 'auxiliar',
      superior_id: IDS.ana,
      productos_asignados: JSON.stringify(['auto']),
      zonas_asignadas: JSON.stringify(['madrid']),
      carga_actual: 5, max_carga: 25,
    },
    {
      id: IDS.raquel, nombre: 'Raquel Giménez', email: 'raquel.gimenez@segurcaixa.es',
      telefono: '+34 911 000 015', departamento: 'siniestros_hogar', rol: 'auxiliar',
      superior_id: IDS.roberto,
      productos_asignados: JSON.stringify(['hogar']),
      zonas_asignadas: JSON.stringify(['barcelona']),
      carga_actual: 4, max_carga: 25,
    },
  ];

  for (const emp of empleados) {
    const rolConfig = ROLES[emp.rol];
    await dbRun(
      `INSERT INTO equipo (id, nombre, email, telefono, departamento, rol, permisos, superior_id, max_aprobacion, productos_asignados, zonas_asignadas, carga_actual, max_carga)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        emp.id, emp.nombre, emp.email, emp.telefono,
        emp.departamento, emp.rol, JSON.stringify(rolConfig.permisos),
        emp.superior_id, rolConfig.max_aprobacion,
        emp.productos_asignados, emp.zonas_asignadas,
        emp.carga_actual, emp.max_carga,
      ]
    );
  }

  // Log de seed
  await logAccion('SYSTEM', 'seed', { total_empleados: empleados.length, descripcion: 'Equipo inicial SegurCaixa Adeslas' });

  console.log(`    ✓ ${empleados.length} empleados creados`);
}

// ============================================================
// UTILIDADES
// ============================================================

function formatEmpleado(row) {
  if (!row) return null;

  let permisos = [];
  try { permisos = JSON.parse(row.permisos || '[]'); } catch { permisos = []; }

  let productos = [];
  try { productos = JSON.parse(row.productos_asignados || '[]'); } catch { productos = []; }

  let zonas = [];
  try { zonas = JSON.parse(row.zonas_asignadas || '[]'); } catch { zonas = []; }

  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    telefono: row.telefono,
    departamento: row.departamento,
    departamento_nombre: DEPARTAMENTOS[row.departamento]?.nombre || row.departamento,
    rol: row.rol,
    rol_nombre: ROLES[row.rol]?.nombre || row.rol,
    permisos,
    activo: !!row.activo,
    superior_id: row.superior_id,
    superior_nombre: row.superior_nombre || null,
    max_aprobacion: row.max_aprobacion,
    max_aprobacion_euros: (row.max_aprobacion / 100).toFixed(2),
    productos_asignados: productos,
    zonas_asignadas: zonas,
    carga_actual: row.carga_actual,
    max_carga: row.max_carga,
    carga_porcentaje: row.max_carga > 0 ? Math.round((row.carga_actual / row.max_carga) * 100) : 0,
    creado_en: row.creado_en,
  };
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Constantes
  ROLES,
  DEPARTAMENTOS,
  // Init
  initTables,
  seedEquipo,
  // CRUD
  registrarEmpleado,
  getEquipo,
  getEmpleado,
  actualizarEmpleado,
  desactivarEmpleado,
  // Organigrama y roles
  getOrganigrama,
  getRoles,
  // Permisos y aprobaciones
  tienePermiso,
  puedeAprobar,
  buscarAprobador,
  // Asignación
  asignarCaso,
  // Estadísticas
  getEstadisticas,
};
