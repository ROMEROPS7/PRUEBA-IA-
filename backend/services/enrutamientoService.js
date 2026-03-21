/**
 * enrutamientoService.js - Enrutamiento Inteligente SegurCaixa Adeslas
 *
 * Servicio de enrutamiento automático: dirige cada siniestro, email,
 * llamada y escalado a la persona correcta del equipo.
 * Persistencia real en SQLite.
 */

const { dbRun, dbAll, dbGet } = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const equipoService = require('./equipoService');

// ============================================================
// INICIALIZACIÓN DE TABLAS
// ============================================================

let _initialized = false;

async function initTables() {
  if (_initialized) return;

  await equipoService.initTables();

  await dbRun(`CREATE TABLE IF NOT EXISTS enrutamiento_log (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    origen TEXT,
    destino_id TEXT,
    destino_nombre TEXT,
    departamento TEXT,
    motivo TEXT,
    siniestro_id TEXT,
    fecha TEXT DEFAULT (datetime('now'))
  )`);

  _initialized = true;
}

// ============================================================
// LOGGING DE ENRUTAMIENTO
// ============================================================

async function logEnrutamiento(tipo, origen, destinoId, destinoNombre, departamento, motivo, siniestroId) {
  try {
    await dbRun(
      `INSERT INTO enrutamiento_log (id, tipo, origen, destino_id, destino_nombre, departamento, motivo, siniestro_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), tipo, origen, destinoId, destinoNombre, departamento, motivo, siniestroId || null]
    );
  } catch (err) {
    console.error('Error logging enrutamiento:', err.message);
  }
}

// ============================================================
// MAPEO DE PRODUCTO → DEPARTAMENTO
// ============================================================

function inferirDepartamento(producto) {
  const p = (producto || '').toLowerCase();

  if (p.includes('auto') || p.includes('coche') || p.includes('vehiculo') || p.includes('moto') || p.includes('flota') || p.includes('ciclomotor')) {
    return 'siniestros_auto';
  }
  if (p.includes('hogar') || p.includes('casa') || p.includes('vivienda') || p.includes('agua') || p.includes('incendio') || p.includes('robo') || p.includes('comunidad')) {
    return 'siniestros_hogar';
  }
  if (p.includes('vida') || p.includes('deceso') || p.includes('accidente') || p.includes('responsabilidad') || p.includes('comercio') || p.includes('rc')) {
    return 'siniestros_diversos';
  }

  return 'siniestros_auto'; // default
}

// ============================================================
// FUNCIONES PRINCIPALES
// ============================================================

/**
 * Enrutar un siniestro nuevo al departamento y gestor adecuados.
 *
 * @param {Object} siniestroData - { id, tipo, producto, zona, importe_estimado, descripcion }
 * @returns {Object} { departamento, gestor_asignado, motivo_asignacion }
 */
async function enrutarSiniestro(siniestroData) {
  await initTables();

  const { id, tipo, producto, zona, importe_estimado, descripcion } = siniestroData || {};
  const siniestroId = id || uuidv4();

  // 1. Determinar departamento
  const departamento = inferirDepartamento(producto || tipo || '');

  // 2. Buscar gestores disponibles en ese departamento
  const gestores = await dbAll(
    `SELECT id, nombre, rol, carga_actual, max_carga, zonas_asignadas, productos_asignados
     FROM equipo
     WHERE departamento = ? AND activo = 1
       AND rol IN ('gestor', 'gestor_senior')
       AND carga_actual < max_carga
     ORDER BY carga_actual ASC`,
    [departamento]
  );

  let gestorAsignado = null;
  let motivoAsignacion = '';

  if (gestores.length > 0) {
    // 3. Intentar match por zona
    if (zona) {
      const zonaLower = zona.toLowerCase();
      const matchZona = gestores.find(g => {
        try {
          const zonas = JSON.parse(g.zonas_asignadas || '[]');
          return zonas.some(z => z.toLowerCase().includes(zonaLower) || zonaLower.includes(z.toLowerCase()));
        } catch { return false; }
      });
      if (matchZona) {
        gestorAsignado = matchZona;
        motivoAsignacion = `Match por zona (${zona}) y menor carga`;
      }
    }

    // 4. Si no hay match por zona, asignar al de menor carga
    if (!gestorAsignado) {
      gestorAsignado = gestores[0];
      motivoAsignacion = `Menor carga de trabajo (${gestorAsignado.carga_actual}/${gestorAsignado.max_carga})`;
    }

    // 5. Actualizar carga
    await dbRun('UPDATE equipo SET carga_actual = carga_actual + 1 WHERE id = ?', [gestorAsignado.id]);
  } else {
    // Escalar a coordinador
    const coordinador = await dbGet(
      `SELECT id, nombre, rol, carga_actual, max_carga
       FROM equipo
       WHERE departamento = ? AND activo = 1 AND rol = 'coordinador' AND carga_actual < max_carga
       ORDER BY carga_actual ASC LIMIT 1`,
      [departamento]
    );

    if (coordinador) {
      gestorAsignado = coordinador;
      motivoAsignacion = 'Escalado a coordinador: todos los gestores a plena carga';
      await dbRun('UPDATE equipo SET carga_actual = carga_actual + 1 WHERE id = ?', [coordinador.id]);
    } else {
      // No hay nadie disponible
      await logEnrutamiento('siniestro', producto || tipo, null, null, departamento,
        'SIN ASIGNAR: No hay personal disponible', siniestroId);

      return {
        siniestro_id: siniestroId,
        departamento,
        departamento_nombre: equipoService.DEPARTAMENTOS[departamento]?.nombre || departamento,
        gestor_asignado: null,
        motivo_asignacion: 'No hay personal disponible en el departamento. Requiere asignación manual.',
        estado: 'pendiente_asignacion',
      };
    }
  }

  // 6. Log
  await logEnrutamiento('siniestro', producto || tipo, gestorAsignado.id,
    gestorAsignado.nombre, departamento, motivoAsignacion, siniestroId);

  return {
    siniestro_id: siniestroId,
    departamento,
    departamento_nombre: equipoService.DEPARTAMENTOS[departamento]?.nombre || departamento,
    gestor_asignado: {
      id: gestorAsignado.id,
      nombre: gestorAsignado.nombre,
      rol: gestorAsignado.rol,
      rol_nombre: equipoService.ROLES[gestorAsignado.rol]?.nombre || gestorAsignado.rol,
    },
    motivo_asignacion: motivoAsignacion,
    estado: 'asignado',
  };
}

/**
 * Enrutar un email entrante al destinatario correcto.
 *
 * @param {Object} email - { from, subject, body, siniestro_id }
 * @returns {Object} { departamento, destinatario, tipo_email, accion_recomendada }
 */
async function enrutarEmail(email) {
  await initTables();

  const { from, subject, body, siniestro_id } = email || {};
  const texto = ((subject || '') + ' ' + (body || '')).toLowerCase();

  let departamento = null;
  let destinatario = null;
  let tipoEmail = 'general';
  let accionRecomendada = '';

  // 1. ¿Es documentación para un siniestro existente?
  if (siniestro_id) {
    // Buscar gestor asignado al siniestro en los logs de enrutamiento
    const logExistente = await dbGet(
      `SELECT destino_id, destino_nombre, departamento FROM enrutamiento_log
       WHERE siniestro_id = ? AND tipo = 'siniestro' AND destino_id IS NOT NULL
       ORDER BY fecha DESC LIMIT 1`,
      [siniestro_id]
    );

    if (logExistente) {
      const gestor = await dbGet('SELECT id, nombre, email, rol, departamento FROM equipo WHERE id = ? AND activo = 1', [logExistente.destino_id]);
      if (gestor) {
        departamento = gestor.departamento;
        destinatario = gestor;
        tipoEmail = 'documentacion';
        accionRecomendada = 'Adjuntar documentación al expediente y notificar al gestor asignado';

        await logEnrutamiento('email', from, gestor.id, gestor.nombre, departamento,
          `Documentación para siniestro ${siniestro_id}`, siniestro_id);

        return {
          departamento,
          departamento_nombre: equipoService.DEPARTAMENTOS[departamento]?.nombre || departamento,
          destinatario: { id: gestor.id, nombre: gestor.nombre, email: gestor.email, rol: gestor.rol },
          tipo_email: tipoEmail,
          accion_recomendada: accionRecomendada,
          siniestro_id,
        };
      }
    }
  }

  // 2. Analizar contenido del email
  if (texto.includes('queja') || texto.includes('reclamacion') || texto.includes('disconforme') ||
      texto.includes('denuncia') || texto.includes('insatisf') || texto.includes('defensor')) {
    tipoEmail = 'reclamacion';
    departamento = 'atencion_cliente';
    accionRecomendada = 'Registrar reclamación, notificar al supervisor del gestor asignado y responder en 24h';

    // Buscar supervisor si hay siniestro asociado
    const supervisor = await dbGet(
      `SELECT id, nombre, email, rol, departamento FROM equipo
       WHERE rol IN ('coordinador', 'jefe_departamento') AND activo = 1
       ORDER BY carga_actual ASC LIMIT 1`
    );
    destinatario = supervisor;

  } else if (texto.includes('abogado') || texto.includes('letrado') || texto.includes('demanda') ||
             texto.includes('juzgado') || texto.includes('tribunal') || texto.includes('burofax') ||
             texto.includes('legal') || texto.includes('judicial')) {
    tipoEmail = 'legal';
    departamento = 'legal';
    accionRecomendada = 'Derivar inmediatamente al departamento legal. Prioridad ALTA.';

    const legal = await dbGet(
      `SELECT id, nombre, email, rol, departamento FROM equipo
       WHERE departamento = 'legal' AND activo = 1
       ORDER BY carga_actual ASC LIMIT 1`
    );
    if (legal) {
      destinatario = legal;
    } else {
      // Escalar a dirección
      destinatario = await dbGet(
        `SELECT id, nombre, email, rol, departamento FROM equipo
         WHERE rol = 'director_siniestros' AND activo = 1 LIMIT 1`
      );
    }

  } else if (texto.includes('fraude') || texto.includes('sospech') || texto.includes('irregular') ||
             texto.includes('falso') || texto.includes('estafa')) {
    tipoEmail = 'fraude';
    departamento = 'fraude';
    accionRecomendada = 'Derivar a investigación de fraude. Marcar como confidencial.';

    const fraude = await dbGet(
      `SELECT id, nombre, email, rol, departamento FROM equipo
       WHERE departamento = 'fraude' AND activo = 1
       ORDER BY carga_actual ASC LIMIT 1`
    );
    if (fraude) {
      destinatario = fraude;
    } else {
      destinatario = await dbGet(
        `SELECT id, nombre, email, rol, departamento FROM equipo
         WHERE rol = 'director_siniestros' AND activo = 1 LIMIT 1`
      );
    }

  } else if (texto.includes('nuevo siniestro') || texto.includes('parte de') || texto.includes('accidente') ||
             texto.includes('daño') || texto.includes('averia') || texto.includes('inundacion')) {
    tipoEmail = 'nuevo_siniestro';
    departamento = inferirDepartamento(texto);
    accionRecomendada = 'Aperturar nuevo siniestro y asignar a gestor disponible';

    // Asignar al gestor con menos carga del departamento
    const gestor = await dbGet(
      `SELECT id, nombre, email, rol, departamento FROM equipo
       WHERE departamento = ? AND activo = 1 AND rol IN ('gestor', 'gestor_senior')
         AND carga_actual < max_carga
       ORDER BY carga_actual ASC LIMIT 1`,
      [departamento]
    );
    destinatario = gestor;

  } else {
    // Email genérico
    tipoEmail = 'general';
    departamento = 'atencion_cliente';
    accionRecomendada = 'Clasificar manualmente y derivar al departamento correspondiente';

    destinatario = await dbGet(
      `SELECT id, nombre, email, rol, departamento FROM equipo
       WHERE departamento = 'atencion_cliente' AND activo = 1
       ORDER BY carga_actual ASC LIMIT 1`
    );

    // Si no hay atención al cliente, buscar auxiliar
    if (!destinatario) {
      destinatario = await dbGet(
        `SELECT id, nombre, email, rol, departamento FROM equipo
         WHERE rol = 'auxiliar' AND activo = 1
         ORDER BY carga_actual ASC LIMIT 1`
      );
    }
  }

  // Fallback
  if (!destinatario) {
    destinatario = await dbGet(
      `SELECT id, nombre, email, rol, departamento FROM equipo
       WHERE activo = 1 ORDER BY carga_actual ASC LIMIT 1`
    );
    departamento = destinatario?.departamento || 'atencion_cliente';
  }

  await logEnrutamiento('email', from || 'desconocido',
    destinatario?.id || null, destinatario?.nombre || null,
    departamento, `${tipoEmail}: ${(subject || '').substring(0, 100)}`, siniestro_id || null);

  return {
    departamento,
    departamento_nombre: equipoService.DEPARTAMENTOS[departamento]?.nombre || departamento,
    destinatario: destinatario ? {
      id: destinatario.id,
      nombre: destinatario.nombre,
      email: destinatario.email,
      rol: destinatario.rol,
    } : null,
    tipo_email: tipoEmail,
    accion_recomendada: accionRecomendada,
    siniestro_id: siniestro_id || null,
  };
}

/**
 * Enrutar un escalado al nivel correcto.
 *
 * @param {string} siniestroId
 * @param {string} motivo - 'fraude', 'importe', 'reclamacion', 'legal', 'sla_breach'
 * @param {number} importeAprobacion - en céntimos, solo para motivo 'importe'
 * @returns {Object} { escalado_a, nivel, notificacion_enviada }
 */
async function enrutarEscalado(siniestroId, motivo, importeAprobacion) {
  await initTables();

  let escaladoA = null;
  let nivel = '';
  let departamentoDestino = '';

  switch (motivo) {
    case 'fraude': {
      departamentoDestino = 'fraude';
      nivel = 'investigacion';

      escaladoA = await dbGet(
        `SELECT id, nombre, email, rol, departamento FROM equipo
         WHERE departamento = 'fraude' AND activo = 1
         ORDER BY carga_actual ASC LIMIT 1`
      );

      // Fallback a director si no hay equipo de fraude
      if (!escaladoA) {
        escaladoA = await dbGet(
          `SELECT id, nombre, email, rol, departamento FROM equipo
           WHERE rol = 'director_siniestros' AND activo = 1 LIMIT 1`
        );
      }
      break;
    }

    case 'importe': {
      // Buscar aprobador adecuado por importe
      const logPrevio = await dbGet(
        `SELECT departamento FROM enrutamiento_log
         WHERE siniestro_id = ? AND tipo = 'siniestro'
         ORDER BY fecha DESC LIMIT 1`,
        [siniestroId]
      );
      const dept = logPrevio?.departamento || 'siniestros_auto';
      departamentoDestino = dept;

      const resultado = await equipoService.buscarAprobador(importeAprobacion || 0, dept);
      if (resultado.aprobador) {
        escaladoA = resultado.aprobador;
        nivel = resultado.nivel;
      } else {
        nivel = 'sin_aprobador';
      }
      break;
    }

    case 'reclamacion': {
      // Escalar al supervisor del gestor asignado
      const logGestor = await dbGet(
        `SELECT destino_id FROM enrutamiento_log
         WHERE siniestro_id = ? AND tipo = 'siniestro' AND destino_id IS NOT NULL
         ORDER BY fecha DESC LIMIT 1`,
        [siniestroId]
      );

      if (logGestor?.destino_id) {
        const gestor = await dbGet('SELECT superior_id FROM equipo WHERE id = ?', [logGestor.destino_id]);
        if (gestor?.superior_id) {
          escaladoA = await dbGet(
            'SELECT id, nombre, email, rol, departamento FROM equipo WHERE id = ? AND activo = 1',
            [gestor.superior_id]
          );
          departamentoDestino = escaladoA?.departamento || 'atencion_cliente';
          nivel = 'supervisor';
        }
      }

      if (!escaladoA) {
        escaladoA = await dbGet(
          `SELECT id, nombre, email, rol, departamento FROM equipo
           WHERE rol IN ('coordinador', 'jefe_departamento') AND activo = 1
           ORDER BY carga_actual ASC LIMIT 1`
        );
        departamentoDestino = escaladoA?.departamento || 'atencion_cliente';
        nivel = 'coordinador';
      }
      break;
    }

    case 'legal': {
      departamentoDestino = 'legal';
      nivel = 'legal';

      escaladoA = await dbGet(
        `SELECT id, nombre, email, rol, departamento FROM equipo
         WHERE departamento = 'legal' AND activo = 1
         ORDER BY carga_actual ASC LIMIT 1`
      );

      if (!escaladoA) {
        escaladoA = await dbGet(
          `SELECT id, nombre, email, rol, departamento FROM equipo
           WHERE rol = 'director_siniestros' AND activo = 1 LIMIT 1`
        );
      }
      break;
    }

    case 'sla_breach': {
      // SLA breach → jefe de departamento
      const logDept = await dbGet(
        `SELECT departamento FROM enrutamiento_log
         WHERE siniestro_id = ? AND tipo = 'siniestro'
         ORDER BY fecha DESC LIMIT 1`,
        [siniestroId]
      );
      const deptSla = logDept?.departamento || 'siniestros_auto';
      departamentoDestino = deptSla;
      nivel = 'jefe_departamento';

      escaladoA = await dbGet(
        `SELECT id, nombre, email, rol, departamento FROM equipo
         WHERE departamento = ? AND rol = 'jefe_departamento' AND activo = 1
         LIMIT 1`,
        [deptSla]
      );

      if (!escaladoA) {
        escaladoA = await dbGet(
          `SELECT id, nombre, email, rol, departamento FROM equipo
           WHERE rol = 'director_siniestros' AND activo = 1 LIMIT 1`
        );
      }
      break;
    }

    default: {
      // Motivo desconocido → escalar a coordinador
      departamentoDestino = 'direccion';
      nivel = 'coordinador';
      escaladoA = await dbGet(
        `SELECT id, nombre, email, rol, departamento FROM equipo
         WHERE rol IN ('coordinador', 'jefe_departamento') AND activo = 1
         ORDER BY carga_actual ASC LIMIT 1`
      );
    }
  }

  await logEnrutamiento('escalado', motivo, escaladoA?.id || null,
    escaladoA?.nombre || null, departamentoDestino,
    `Escalado: ${motivo}. Nivel: ${nivel}`, siniestroId);

  return {
    siniestro_id: siniestroId,
    escalado_a: escaladoA ? {
      id: escaladoA.id,
      nombre: escaladoA.nombre,
      email: escaladoA.email,
      rol: escaladoA.rol,
      rol_nombre: equipoService.ROLES[escaladoA.rol]?.nombre || escaladoA.rol,
    } : null,
    nivel,
    motivo,
    departamento: departamentoDestino,
    notificacion_enviada: !!escaladoA,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Enrutar una llamada telefónica entrante.
 *
 * @param {string} telefono - Número del cliente
 * @returns {Object} { destino, empleado, motivo }
 */
async function enrutarLlamada(telefono) {
  await initTables();

  // 1. Buscar si hay un siniestro asociado (mediante enrutamiento previo)
  // En un sistema real, buscaríamos en la tabla de clientes
  let destino = 'atencion_cliente';
  let empleado = null;
  let motivo = '';

  // Intentar encontrar gestor asignado a un siniestro del cliente
  // (Simulamos buscando por teléfono en logs o por último siniestro activo)
  const logReciente = await dbGet(
    `SELECT destino_id, destino_nombre, departamento, siniestro_id
     FROM enrutamiento_log
     WHERE tipo = 'siniestro' AND destino_id IS NOT NULL
     ORDER BY fecha DESC LIMIT 1`
  );

  if (logReciente) {
    const gestor = await dbGet(
      'SELECT id, nombre, email, rol, departamento FROM equipo WHERE id = ? AND activo = 1',
      [logReciente.destino_id]
    );

    if (gestor) {
      destino = gestor.departamento;
      empleado = gestor;
      motivo = `Llamada dirigida al gestor asignado del siniestro ${logReciente.siniestro_id || 'activo'}`;
    }
  }

  // Si no se encontró gestor, ir a atención al cliente
  if (!empleado) {
    empleado = await dbGet(
      `SELECT id, nombre, email, rol, departamento FROM equipo
       WHERE departamento = 'atencion_cliente' AND activo = 1
       ORDER BY carga_actual ASC LIMIT 1`
    );

    if (!empleado) {
      // Fallback: cualquier auxiliar o gestor
      empleado = await dbGet(
        `SELECT id, nombre, email, rol, departamento FROM equipo
         WHERE activo = 1 AND rol IN ('auxiliar', 'gestor')
         ORDER BY carga_actual ASC LIMIT 1`
      );
    }

    destino = empleado?.departamento || 'atencion_cliente';
    motivo = motivo || 'Llamada nueva sin siniestro asociado. Derivar a atención al cliente.';
  }

  await logEnrutamiento('llamada', telefono, empleado?.id || null,
    empleado?.nombre || null, destino, motivo, null);

  return {
    destino,
    destino_nombre: equipoService.DEPARTAMENTOS[destino]?.nombre || destino,
    empleado: empleado ? {
      id: empleado.id,
      nombre: empleado.nombre,
      email: empleado.email,
      rol: empleado.rol,
    } : null,
    motivo,
    telefono,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Obtener historial de enrutamientos con filtros.
 */
async function getEnrutamientos(filtros = {}) {
  await initTables();

  let sql = 'SELECT * FROM enrutamiento_log WHERE 1=1';
  const params = [];

  if (filtros.tipo) {
    sql += ' AND tipo = ?';
    params.push(filtros.tipo);
  }
  if (filtros.departamento) {
    sql += ' AND departamento = ?';
    params.push(filtros.departamento);
  }
  if (filtros.siniestro_id) {
    sql += ' AND siniestro_id = ?';
    params.push(filtros.siniestro_id);
  }
  if (filtros.destino_id) {
    sql += ' AND destino_id = ?';
    params.push(filtros.destino_id);
  }
  if (filtros.desde) {
    sql += ' AND fecha >= ?';
    params.push(filtros.desde);
  }
  if (filtros.hasta) {
    sql += ' AND fecha <= ?';
    params.push(filtros.hasta);
  }

  sql += ' ORDER BY fecha DESC';

  if (filtros.limit) {
    sql += ' LIMIT ?';
    params.push(parseInt(filtros.limit) || 50);
  } else {
    sql += ' LIMIT 100';
  }

  return await dbAll(sql, params);
}

/**
 * Estadísticas de enrutamiento.
 */
async function getEstadisticas() {
  await initTables();

  const hoy = new Date().toISOString().split('T')[0];

  const totalHoy = await dbGet(
    `SELECT COUNT(*) as total FROM enrutamiento_log WHERE fecha >= ?`,
    [hoy]
  );

  const porDepartamento = await dbAll(
    `SELECT departamento, COUNT(*) as total FROM enrutamiento_log
     WHERE fecha >= ? GROUP BY departamento`,
    [hoy]
  );

  const porTipo = await dbAll(
    'SELECT tipo, COUNT(*) as total FROM enrutamiento_log GROUP BY tipo'
  );

  const totalGeneral = await dbGet('SELECT COUNT(*) as total FROM enrutamiento_log');

  const reasignaciones = await dbGet(
    `SELECT COUNT(*) as total FROM enrutamiento_log WHERE tipo = 'reasignacion'`
  );

  const sinAsignar = await dbGet(
    `SELECT COUNT(*) as total FROM enrutamiento_log WHERE destino_id IS NULL`
  );

  return {
    total_enrutados_hoy: totalHoy.total,
    total_historico: totalGeneral.total,
    por_departamento: porDepartamento.map(d => ({
      departamento: d.departamento,
      nombre: equipoService.DEPARTAMENTOS[d.departamento]?.nombre || d.departamento,
      total: d.total,
    })),
    por_tipo: porTipo,
    reasignaciones: reasignaciones.total,
    sin_asignar: sinAsignar.total,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Reasignar manualmente un caso a otro gestor.
 */
async function reasignar(siniestroId, nuevoGestorId, motivo) {
  await initTables();

  // Verificar que el nuevo gestor existe y está activo
  const nuevoGestor = await dbGet(
    'SELECT id, nombre, email, rol, departamento, carga_actual, max_carga FROM equipo WHERE id = ? AND activo = 1',
    [nuevoGestorId]
  );

  if (!nuevoGestor) {
    throw new Error('Gestor destino no encontrado o inactivo');
  }

  if (nuevoGestor.carga_actual >= nuevoGestor.max_carga) {
    throw new Error(`El gestor ${nuevoGestor.nombre} está a plena carga (${nuevoGestor.carga_actual}/${nuevoGestor.max_carga})`);
  }

  // Buscar gestor anterior
  const logAnterior = await dbGet(
    `SELECT destino_id FROM enrutamiento_log
     WHERE siniestro_id = ? AND tipo IN ('siniestro', 'reasignacion') AND destino_id IS NOT NULL
     ORDER BY fecha DESC LIMIT 1`,
    [siniestroId]
  );

  // Decrementar carga del gestor anterior
  if (logAnterior?.destino_id) {
    await dbRun(
      'UPDATE equipo SET carga_actual = MAX(0, carga_actual - 1) WHERE id = ?',
      [logAnterior.destino_id]
    );
  }

  // Incrementar carga del nuevo gestor
  await dbRun('UPDATE equipo SET carga_actual = carga_actual + 1 WHERE id = ?', [nuevoGestorId]);

  // Log de reasignación
  await logEnrutamiento('reasignacion', logAnterior?.destino_id || 'manual',
    nuevoGestor.id, nuevoGestor.nombre, nuevoGestor.departamento,
    motivo || 'Reasignación manual', siniestroId);

  return {
    siniestro_id: siniestroId,
    gestor_anterior_id: logAnterior?.destino_id || null,
    nuevo_gestor: {
      id: nuevoGestor.id,
      nombre: nuevoGestor.nombre,
      email: nuevoGestor.email,
      rol: nuevoGestor.rol,
      departamento: nuevoGestor.departamento,
    },
    motivo: motivo || 'Reasignación manual',
    timestamp: new Date().toISOString(),
  };
}

// ============================================================
// SEED DATA - 20 registros de enrutamiento
// ============================================================

async function seedEnrutamiento() {
  await initTables();

  const existe = await dbGet('SELECT COUNT(*) as total FROM enrutamiento_log');
  if (existe && existe.total > 0) return;

  console.log('  Seeding enrutamiento log...');

  // Obtener empleados para los logs
  const empleados = await dbAll('SELECT id, nombre, departamento, rol FROM equipo WHERE activo = 1');
  if (empleados.length === 0) return;

  const getEmp = (rol) => empleados.find(e => e.rol === rol) || empleados[0];
  const getEmpDept = (dept) => empleados.find(e => e.departamento === dept) || empleados[0];

  const logs = [
    { tipo: 'siniestro', origen: 'auto', destino: getEmpDept('siniestros_auto'), dept: 'siniestros_auto', motivo: 'Nuevo siniestro auto. Asignado por menor carga.', sid: 'SIN-2026-0001' },
    { tipo: 'siniestro', origen: 'auto', destino: getEmpDept('siniestros_auto'), dept: 'siniestros_auto', motivo: 'Colisión múltiple A-6. Match por zona Madrid.', sid: 'SIN-2026-0002' },
    { tipo: 'siniestro', origen: 'hogar', destino: getEmpDept('siniestros_hogar'), dept: 'siniestros_hogar', motivo: 'Daño por agua. Asignado por zona Barcelona.', sid: 'SIN-2026-0003' },
    { tipo: 'siniestro', origen: 'hogar', destino: getEmpDept('siniestros_hogar'), dept: 'siniestros_hogar', motivo: 'Incendio vivienda. Prioridad alta.', sid: 'SIN-2026-0004' },
    { tipo: 'siniestro', origen: 'auto', destino: getEmpDept('siniestros_auto'), dept: 'siniestros_auto', motivo: 'Robo de vehículo. Menor carga.', sid: 'SIN-2026-0005' },
    { tipo: 'email', origen: 'cliente@gmail.com', destino: getEmpDept('siniestros_auto'), dept: 'siniestros_auto', motivo: 'documentacion: Fotos del accidente recibidas', sid: 'SIN-2026-0001' },
    { tipo: 'email', origen: 'abogado@bufete.es', destino: getEmp('director_siniestros'), dept: 'legal', motivo: 'legal: Demanda por responsabilidad civil', sid: 'SIN-2026-0002' },
    { tipo: 'email', origen: 'perito@peritaciones.com', destino: getEmpDept('siniestros_hogar'), dept: 'siniestros_hogar', motivo: 'documentacion: Informe pericial adjunto', sid: 'SIN-2026-0003' },
    { tipo: 'email', origen: 'cliente2@hotmail.com', destino: getEmp('coordinador'), dept: 'atencion_cliente', motivo: 'reclamacion: Queja por tardanza en resolución', sid: 'SIN-2026-0004' },
    { tipo: 'email', origen: 'nuevo@cliente.com', destino: getEmpDept('siniestros_auto'), dept: 'siniestros_auto', motivo: 'nuevo_siniestro: Accidente en parking', sid: null },
    { tipo: 'escalado', origen: 'fraude', destino: getEmp('director_siniestros'), dept: 'fraude', motivo: 'Escalado: fraude. Nivel: investigacion', sid: 'SIN-2026-0005' },
    { tipo: 'escalado', origen: 'importe', destino: getEmp('jefe_departamento'), dept: 'siniestros_auto', motivo: 'Escalado: importe. Nivel: medio-alto. 8500€', sid: 'SIN-2026-0002' },
    { tipo: 'escalado', origen: 'reclamacion', destino: getEmp('coordinador'), dept: 'siniestros_hogar', motivo: 'Escalado: reclamacion. Nivel: supervisor', sid: 'SIN-2026-0004' },
    { tipo: 'escalado', origen: 'sla_breach', destino: getEmp('jefe_departamento'), dept: 'siniestros_auto', motivo: 'Escalado: sla_breach. SLA 48h superado.', sid: 'SIN-2026-0001' },
    { tipo: 'llamada', origen: '+34 612 345 678', destino: getEmpDept('siniestros_auto'), dept: 'siniestros_auto', motivo: 'Llamada dirigida al gestor asignado del siniestro SIN-2026-0001', sid: 'SIN-2026-0001' },
    { tipo: 'llamada', origen: '+34 699 111 222', destino: getEmp('auxiliar'), dept: 'atencion_cliente', motivo: 'Llamada nueva sin siniestro asociado.', sid: null },
    { tipo: 'llamada', origen: '+34 677 333 444', destino: getEmpDept('siniestros_hogar'), dept: 'siniestros_hogar', motivo: 'Llamada sobre estado de siniestro hogar', sid: 'SIN-2026-0003' },
    { tipo: 'reasignacion', origen: 'manual', destino: getEmpDept('siniestros_auto'), dept: 'siniestros_auto', motivo: 'Reasignación por vacaciones del gestor anterior', sid: 'SIN-2026-0002' },
    { tipo: 'siniestro', origen: 'vida', destino: getEmp('gestor_senior'), dept: 'siniestros_diversos', motivo: 'Siniestro de accidentes personales. Asignado a senior.', sid: 'SIN-2026-0006' },
    { tipo: 'siniestro', origen: 'hogar', destino: getEmpDept('siniestros_hogar'), dept: 'siniestros_hogar', motivo: 'Rotura cristales temporal. Zona Valencia.', sid: 'SIN-2026-0007' },
  ];

  for (const log of logs) {
    await dbRun(
      `INSERT INTO enrutamiento_log (id, tipo, origen, destino_id, destino_nombre, departamento, motivo, siniestro_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), log.tipo, log.origen, log.destino.id, log.destino.nombre, log.dept, log.motivo, log.sid]
    );
  }

  console.log(`    ✓ ${logs.length} registros de enrutamiento creados`);
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  initTables,
  seedEnrutamiento,
  enrutarSiniestro,
  enrutarEmail,
  enrutarEscalado,
  enrutarLlamada,
  getEnrutamientos,
  getEstadisticas,
  reasignar,
};
