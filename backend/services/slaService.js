// =============================================================================
// SLA Service - Gestion de acuerdos de nivel de servicio para siniestros
// =============================================================================

function generateId() {
  try {
    const { v4 } = require('uuid');
    return v4();
  } catch {
    return `sla_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

// -----------------------------------------------------------------------------
// Estado interno
// -----------------------------------------------------------------------------

const slas = new Map();
const breaches = [];
const escalationLog = [];
let monitoringInterval = null;
let siniestrosProvider = null; // funcion externa para obtener siniestros abiertos

// -----------------------------------------------------------------------------
// SLAs pre-cargados
// -----------------------------------------------------------------------------

const DEFAULT_SLAS = [
  {
    id: 'sla_001',
    name: 'Auto urgencia alta (8+)',
    tipo_siniestro: 'coche',
    urgencia_min: 8,
    urgencia_max: 10,
    tiempo_maximo_horas: 4,
    escalado_a: 'director',
    nivel_escalado: 'director_siniestros',
    activo: true,
    descripcion: 'Siniestros de automovil con urgencia 8 o superior deben resolverse en 4 horas',
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'sla_002',
    name: 'Auto urgencia media (5-7)',
    tipo_siniestro: 'coche',
    urgencia_min: 5,
    urgencia_max: 7,
    tiempo_maximo_horas: 24,
    escalado_a: 'supervisor',
    nivel_escalado: 'supervisor_auto',
    activo: true,
    descripcion: 'Siniestros de automovil con urgencia 5-7 deben gestionarse en 24 horas',
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'sla_003',
    name: 'Auto urgencia baja (1-4)',
    tipo_siniestro: 'coche',
    urgencia_min: 1,
    urgencia_max: 4,
    tiempo_maximo_horas: 72,
    escalado_a: 'email_recordatorio',
    nivel_escalado: 'gestor',
    activo: true,
    descripcion: 'Siniestros de automovil con urgencia baja, recordatorio tras 72 horas',
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'sla_004',
    name: 'Hogar urgencia alta (8+)',
    tipo_siniestro: 'hogar',
    urgencia_min: 8,
    urgencia_max: 10,
    tiempo_maximo_horas: 6,
    escalado_a: 'director',
    nivel_escalado: 'director_hogar',
    activo: true,
    descripcion: 'Siniestros de hogar con urgencia alta, resolucion en 6 horas',
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'sla_005',
    name: 'Salud urgencia critica (9+)',
    tipo_siniestro: 'salud',
    urgencia_min: 9,
    urgencia_max: 10,
    tiempo_maximo_horas: 2,
    escalado_a: 'escalado_inmediato',
    nivel_escalado: 'director_medico',
    activo: true,
    descripcion: 'Siniestros de salud criticos requieren atencion en 2 horas',
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'sla_006',
    name: 'Robo - Protocolo rapido',
    tipo_siniestro: 'robo',
    urgencia_min: 1,
    urgencia_max: 10,
    tiempo_maximo_horas: 12,
    escalado_a: 'legal',
    nivel_escalado: 'departamento_legal',
    activo: true,
    descripcion: 'Siniestros de robo deben escalarse a legal en 12 horas',
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'sla_007',
    name: 'Hogar urgencia media (5-7)',
    tipo_siniestro: 'hogar',
    urgencia_min: 5,
    urgencia_max: 7,
    tiempo_maximo_horas: 24,
    escalado_a: 'supervisor',
    nivel_escalado: 'supervisor_hogar',
    activo: true,
    descripcion: 'Siniestros de hogar con urgencia media en 24 horas',
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'sla_008',
    name: 'Catastrofe natural',
    tipo_siniestro: 'catastrofe',
    urgencia_min: 1,
    urgencia_max: 10,
    tiempo_maximo_horas: 1,
    escalado_a: 'comite_crisis',
    nivel_escalado: 'comite_crisis',
    activo: true,
    descripcion: 'Catastrofes naturales requieren activacion del comite en 1 hora',
    createdAt: '2025-01-10T08:00:00.000Z',
  },
];

// Cargar SLAs por defecto
DEFAULT_SLAS.forEach(sla => {
  slas.set(sla.id, { ...sla });
});

// -----------------------------------------------------------------------------
// Funciones principales
// -----------------------------------------------------------------------------

/**
 * Encuentra el SLA aplicable a un siniestro.
 */
function findApplicableSLA(siniestro) {
  const tipo = siniestro.tipo || siniestro.tipo_siniestro;
  const urgencia = siniestro.urgencia || 1;

  // Buscar SLAs que aplican, ordenados por urgencia_min descendente (mas restrictivo primero)
  const applicable = Array.from(slas.values())
    .filter(sla => {
      if (!sla.activo) return false;
      if (sla.tipo_siniestro !== tipo) return false;
      const minOk = urgencia >= sla.urgencia_min;
      const maxOk = sla.urgencia_max ? urgencia <= sla.urgencia_max : true;
      return minOk && maxOk;
    })
    .sort((a, b) => b.urgencia_min - a.urgencia_min);

  return applicable.length > 0 ? applicable[0] : null;
}

/**
 * Comprueba si un siniestro cumple su SLA.
 * @param {Object} siniestro - debe tener: id, tipo, urgencia, fecha_apertura (o createdAt), estado
 * @returns {Object} resultado del chequeo
 */
function checkSLA(siniestro) {
  const sla = findApplicableSLA(siniestro);

  if (!sla) {
    return {
      siniestroId: siniestro.id,
      slaAplicable: null,
      cumple: true,
      mensaje: 'No hay SLA definido para este tipo de siniestro y urgencia',
    };
  }

  const fechaApertura = new Date(siniestro.fecha_apertura || siniestro.createdAt || siniestro.fechaCreacion);
  const ahora = new Date();
  const tiempoTranscurridoMs = ahora - fechaApertura;
  const tiempoTranscurridoHoras = tiempoTranscurridoMs / (1000 * 60 * 60);
  const tiempoMaximoMs = sla.tiempo_maximo_horas * 60 * 60 * 1000;
  const tiempoRestanteMs = tiempoMaximoMs - tiempoTranscurridoMs;
  const tiempoRestanteHoras = tiempoRestanteMs / (1000 * 60 * 60);
  const porcentaje = Math.min(100, (tiempoTranscurridoMs / tiempoMaximoMs) * 100);

  let nivel;
  if (porcentaje >= 100) {
    nivel = 'incumplido';
  } else if (porcentaje >= 80) {
    nivel = 'en_riesgo';
  } else if (porcentaje >= 50) {
    nivel = 'en_progreso';
  } else {
    nivel = 'dentro_de_tiempo';
  }

  const cumple = porcentaje < 100;

  return {
    siniestroId: siniestro.id,
    slaId: sla.id,
    slaNombre: sla.name,
    cumple,
    nivel,
    tiempoMaximoHoras: sla.tiempo_maximo_horas,
    tiempoTranscurrido: {
      horas: Math.round(tiempoTranscurridoHoras * 100) / 100,
      minutos: Math.round((tiempoTranscurridoMs / 60000) * 100) / 100,
      texto: formatDuration(tiempoTranscurridoMs),
    },
    tiempoRestante: {
      horas: Math.max(0, Math.round(tiempoRestanteHoras * 100) / 100),
      minutos: Math.max(0, Math.round((tiempoRestanteMs / 60000) * 100) / 100),
      texto: tiempoRestanteMs > 0 ? formatDuration(tiempoRestanteMs) : 'Excedido',
    },
    porcentaje: Math.round(porcentaje * 10) / 10,
    escaladoA: sla.escalado_a,
    nivelEscalado: sla.nivel_escalado,
    fechaApertura: fechaApertura.toISOString(),
    fechaLimite: new Date(fechaApertura.getTime() + tiempoMaximoMs).toISOString(),
    verificadoEn: ahora.toISOString(),
  };
}

/**
 * Comprueba todos los siniestros abiertos contra sus SLAs.
 * @param {Array} siniestrosAbiertos - lista de siniestros abiertos (opcional si hay provider)
 */
function checkAllSLAs(siniestrosAbiertos) {
  const siniestros = siniestrosAbiertos || (siniestrosProvider ? siniestrosProvider() : []);

  const resultados = siniestros
    .filter(s => {
      const estado = (s.estado || '').toLowerCase();
      return estado !== 'cerrado' && estado !== 'cancelado' && estado !== 'finalizado';
    })
    .map(s => checkSLA(s));

  // Registrar nuevos incumplimientos
  const nuevosIncumplimientos = resultados.filter(r => !r.cumple && r.slaId);
  for (const incumplimiento of nuevosIncumplimientos) {
    const yaRegistrado = breaches.find(
      b => b.siniestroId === incumplimiento.siniestroId && b.slaId === incumplimiento.slaId && !b.resuelto
    );
    if (!yaRegistrado) {
      breaches.push({
        id: generateId(),
        siniestroId: incumplimiento.siniestroId,
        slaId: incumplimiento.slaId,
        slaNombre: incumplimiento.slaNombre,
        exceso: incumplimiento.tiempoTranscurrido.texto,
        escaladoA: incumplimiento.escaladoA,
        detectadoEn: new Date().toISOString(),
        resuelto: false,
        resueltaEn: null,
      });
    }
  }

  return {
    totalVerificados: resultados.length,
    cumpliendo: resultados.filter(r => r.cumple && r.nivel !== 'en_riesgo').length,
    enRiesgo: resultados.filter(r => r.nivel === 'en_riesgo').length,
    incumplidos: resultados.filter(r => !r.cumple).length,
    detalle: resultados,
    verificadoEn: new Date().toISOString(),
  };
}

/**
 * Devuelve todos los incumplimientos de SLA actuales.
 */
function getBreaches(soloActivos = true) {
  if (soloActivos) {
    return breaches.filter(b => !b.resuelto);
  }
  return [...breaches];
}

/**
 * Resuelve un incumplimiento.
 */
function resolveBreach(breachId) {
  const breach = breaches.find(b => b.id === breachId);
  if (!breach) throw new Error(`Incumplimiento no encontrado: ${breachId}`);
  breach.resuelto = true;
  breach.resueltaEn = new Date().toISOString();
  return breach;
}

/**
 * Realiza la accion de escalado para un siniestro.
 */
function escalate(siniestroId, slaId) {
  const sla = slas.get(slaId);
  if (!sla) throw new Error(`SLA no encontrado: ${slaId}`);

  const entry = {
    id: generateId(),
    siniestroId,
    slaId,
    slaNombre: sla.name,
    escaladoA: sla.escalado_a,
    nivelEscalado: sla.nivel_escalado,
    accionRealizada: getEscalationAction(sla.escalado_a),
    fechaEscalado: new Date().toISOString(),
  };

  escalationLog.push(entry);
  console.log(`[SLA] Escalado: siniestro ${siniestroId} -> ${sla.escalado_a} (${sla.nivel_escalado})`);

  return entry;
}

function getEscalationAction(tipo) {
  const acciones = {
    director: 'Notificacion urgente al director del area con solicitud de intervencion directa',
    supervisor: 'Alerta al supervisor para reasignacion y seguimiento prioritario',
    email_recordatorio: 'Email de recordatorio al gestor asignado con copia a supervisor',
    legal: 'Derivacion al departamento legal para revision y actuacion',
    escalado_inmediato: 'Activacion del protocolo de emergencia con notificacion a toda la cadena de mando',
    comite_crisis: 'Convocatoria inmediata del comite de crisis con todos los miembros',
  };
  return acciones[tipo] || `Escalado generico a ${tipo}`;
}

/**
 * Dashboard de SLAs con estado actual.
 */
function getSLADashboard(siniestrosAbiertos) {
  const resultado = checkAllSLAs(siniestrosAbiertos);
  const breachesActivos = getBreaches(true);

  return {
    resumen: {
      totalMonitorizados: resultado.totalVerificados,
      cumpliendo: resultado.cumpliendo,
      enRiesgo: resultado.enRiesgo,
      incumplidos: resultado.incumplidos,
      tasaCumplimiento: resultado.totalVerificados > 0
        ? Math.round(((resultado.cumpliendo / resultado.totalVerificados) * 100) * 10) / 10
        : 100,
    },
    incumplimientosActivos: breachesActivos.length,
    incumplimientos: breachesActivos.slice(0, 10),
    escaladosHoy: escalationLog.filter(e => {
      const hoy = new Date().toISOString().split('T')[0];
      return e.fechaEscalado.startsWith(hoy);
    }).length,
    slasActivos: Array.from(slas.values()).filter(s => s.activo).length,
    detallePorTipo: groupByTipo(resultado.detalle),
    verificadoEn: resultado.verificadoEn,
  };
}

function groupByTipo(detalles) {
  const grupos = {};
  for (const d of detalles) {
    const slaName = d.slaNombre || 'Sin SLA';
    if (!grupos[slaName]) {
      grupos[slaName] = { cumpliendo: 0, enRiesgo: 0, incumplidos: 0, total: 0 };
    }
    grupos[slaName].total++;
    if (!d.cumple) {
      grupos[slaName].incumplidos++;
    } else if (d.nivel === 'en_riesgo') {
      grupos[slaName].enRiesgo++;
    } else {
      grupos[slaName].cumpliendo++;
    }
  }
  return grupos;
}

// -----------------------------------------------------------------------------
// CRUD de SLAs
// -----------------------------------------------------------------------------

function addSLA(data) {
  if (!data.name) throw new Error('El nombre del SLA es obligatorio');
  if (!data.tipo_siniestro) throw new Error('El tipo de siniestro es obligatorio');
  if (!data.tiempo_maximo_horas || data.tiempo_maximo_horas <= 0) {
    throw new Error('El tiempo maximo debe ser mayor que 0');
  }

  const id = data.id || generateId();

  const sla = {
    id,
    name: data.name,
    tipo_siniestro: data.tipo_siniestro,
    urgencia_min: data.urgencia_min || 1,
    urgencia_max: data.urgencia_max || 10,
    tiempo_maximo_horas: data.tiempo_maximo_horas,
    escalado_a: data.escalado_a || 'supervisor',
    nivel_escalado: data.nivel_escalado || 'supervisor',
    activo: data.activo !== undefined ? data.activo : true,
    descripcion: data.descripcion || '',
    createdAt: new Date().toISOString(),
  };

  slas.set(id, sla);
  return sla;
}

function updateSLA(id, data) {
  const sla = slas.get(id);
  if (!sla) throw new Error(`SLA no encontrado: ${id}`);

  const updated = {
    ...sla,
    ...data,
    id, // no se puede cambiar
  };

  slas.set(id, updated);
  return updated;
}

function deleteSLA(id) {
  const sla = slas.get(id);
  if (!sla) throw new Error(`SLA no encontrado: ${id}`);

  slas.delete(id);
  return { deleted: true, id, name: sla.name };
}

function listSLAs() {
  return Array.from(slas.values());
}

function getSLA(id) {
  const sla = slas.get(id);
  if (!sla) throw new Error(`SLA no encontrado: ${id}`);
  return sla;
}

// -----------------------------------------------------------------------------
// Monitorizacion
// -----------------------------------------------------------------------------

/**
 * Inicia la monitorizacion periodica de SLAs.
 * @param {number} intervalMs - intervalo en milisegundos (default: 60000 = 1 minuto)
 */
function startMonitoring(intervalMs = 60000) {
  if (monitoringInterval) {
    console.log('[SLA] Monitorizacion ya activa. Deteniendo la anterior...');
    stopMonitoring();
  }

  console.log(`[SLA] Iniciando monitorizacion cada ${intervalMs / 1000} segundos`);

  monitoringInterval = setInterval(() => {
    try {
      const siniestros = siniestrosProvider ? siniestrosProvider() : [];
      if (siniestros.length === 0) return;

      const resultado = checkAllSLAs(siniestros);

      // Auto-escalar los incumplidos
      for (const detalle of resultado.detalle) {
        if (!detalle.cumple && detalle.slaId) {
          const yaEscalado = escalationLog.find(
            e => e.siniestroId === detalle.siniestroId && e.slaId === detalle.slaId
          );
          if (!yaEscalado) {
            escalate(detalle.siniestroId, detalle.slaId);
          }
        }
      }

      if (resultado.incumplidos > 0 || resultado.enRiesgo > 0) {
        console.log(`[SLA] Alerta: ${resultado.incumplidos} incumplidos, ${resultado.enRiesgo} en riesgo de ${resultado.totalVerificados} monitorizados`);
      }
    } catch (err) {
      console.error('[SLA] Error en monitorizacion:', err.message);
    }
  }, intervalMs);

  return { active: true, intervalMs, message: `Monitorizacion iniciada cada ${intervalMs / 1000}s` };
}

/**
 * Detiene la monitorizacion.
 */
function stopMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log('[SLA] Monitorizacion detenida');
    return { active: false, message: 'Monitorizacion detenida' };
  }
  return { active: false, message: 'No habia monitorizacion activa' };
}

/**
 * Registra un proveedor de siniestros para la monitorizacion automatica.
 */
function setSiniestrosProvider(providerFn) {
  if (typeof providerFn !== 'function') {
    throw new Error('El proveedor debe ser una funcion que devuelva un array de siniestros');
  }
  siniestrosProvider = providerFn;
}

// -----------------------------------------------------------------------------
// Reportes
// -----------------------------------------------------------------------------

/**
 * Genera un informe de cumplimiento de SLAs para un periodo.
 */
function getSLAReport(dateFrom, dateTo) {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  const breachesEnPeriodo = breaches.filter(b => {
    const fecha = new Date(b.detectadoEn);
    return fecha >= from && fecha <= to;
  });

  const escaladosEnPeriodo = escalationLog.filter(e => {
    const fecha = new Date(e.fechaEscalado);
    return fecha >= from && fecha <= to;
  });

  // Agrupar breaches por SLA
  const breachesPorSLA = {};
  for (const b of breachesEnPeriodo) {
    const key = b.slaNombre || b.slaId;
    if (!breachesPorSLA[key]) {
      breachesPorSLA[key] = { total: 0, resueltos: 0, pendientes: 0 };
    }
    breachesPorSLA[key].total++;
    if (b.resuelto) {
      breachesPorSLA[key].resueltos++;
    } else {
      breachesPorSLA[key].pendientes++;
    }
  }

  // Agrupar escalados por tipo
  const escaladosPorTipo = {};
  for (const e of escaladosEnPeriodo) {
    escaladosPorTipo[e.escaladoA] = (escaladosPorTipo[e.escaladoA] || 0) + 1;
  }

  return {
    periodo: {
      desde: from.toISOString(),
      hasta: to.toISOString(),
      dias: Math.ceil((to - from) / (1000 * 60 * 60 * 24)),
    },
    resumen: {
      totalIncumplimientos: breachesEnPeriodo.length,
      incumplimientosResueltos: breachesEnPeriodo.filter(b => b.resuelto).length,
      incumplimientosPendientes: breachesEnPeriodo.filter(b => !b.resuelto).length,
      totalEscalados: escaladosEnPeriodo.length,
      tasaResolucion: breachesEnPeriodo.length > 0
        ? Math.round((breachesEnPeriodo.filter(b => b.resuelto).length / breachesEnPeriodo.length) * 100 * 10) / 10
        : 100,
    },
    desglosePorSLA: breachesPorSLA,
    escaladosPorTipo,
    slasDefinidos: Array.from(slas.values()).map(s => ({
      id: s.id,
      nombre: s.name,
      tipo: s.tipo_siniestro,
      tiempoMaximo: `${s.tiempo_maximo_horas}h`,
      activo: s.activo,
    })),
    generadoEn: new Date().toISOString(),
  };
}

// -----------------------------------------------------------------------------
// Utilidades
// -----------------------------------------------------------------------------

function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}min`;
  return `${hours}h ${minutes}min`;
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
  checkSLA,
  checkAllSLAs,
  getBreaches,
  resolveBreach,
  escalate,
  getSLADashboard,
  addSLA,
  updateSLA,
  deleteSLA,
  listSLAs,
  getSLA,
  findApplicableSLA,
  startMonitoring,
  stopMonitoring,
  setSiniestrosProvider,
  getSLAReport,
  getEscalationLog: () => [...escalationLog],
};
