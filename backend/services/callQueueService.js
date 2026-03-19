// =============================================================================
// Call Queue Management Service
// Manages incoming call queue, agent availability, callbacks, and metrics
// =============================================================================

const crypto = require('crypto');

// ---------------------------------------------------------------------------
// In-memory stores
// ---------------------------------------------------------------------------
const queue = [];
const agents = new Map();
const callLog = []; // historical records for metrics
const callbacks = [];

// ---------------------------------------------------------------------------
// Music-on-hold configuration
// ---------------------------------------------------------------------------
const holdConfig = {
  enabled: true,
  message: 'Gracias por esperar. Su llamada es importante para nosotros. Un agente le atendera en breve.',
  estimatedWaitAnnouncement: true,
  musicTrack: 'classical_hold_01',
  announcePositionInterval: 60, // seconds
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const AVG_HANDLING_TIME_SECONDS = 300; // 5 minutes average per call
const PRIORITY_ORDER = { urgente: 1, alta: 2, normal: 3, baja: 4 };

// ---------------------------------------------------------------------------
// Helper: generate unique ID
// ---------------------------------------------------------------------------
function generateId() {
  return 'CALL-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

// ---------------------------------------------------------------------------
// Helper: sort queue by priority then by wait time (FIFO within priority)
// ---------------------------------------------------------------------------
function sortQueue() {
  queue.sort((a, b) => {
    const prioA = PRIORITY_ORDER[a.prioridad] || 3;
    const prioB = PRIORITY_ORDER[b.prioridad] || 3;
    if (prioA !== prioB) return prioA - prioB;
    return new Date(a.horaIngreso) - new Date(b.horaIngreso);
  });
  updatePositions();
}

// ---------------------------------------------------------------------------
// updatePositions - recalculate queue positions
// ---------------------------------------------------------------------------
function updatePositions() {
  const activeEntries = queue.filter((e) => e.estado === 'en_espera');
  activeEntries.sort((a, b) => {
    const prioA = PRIORITY_ORDER[a.prioridad] || 3;
    const prioB = PRIORITY_ORDER[b.prioridad] || 3;
    if (prioA !== prioB) return prioA - prioB;
    return new Date(a.horaIngreso) - new Date(b.horaIngreso);
  });
  activeEntries.forEach((entry, idx) => {
    entry.posicion = idx + 1;
    entry.tiempoEspera = Math.floor(
      (Date.now() - new Date(entry.horaIngreso).getTime()) / 1000
    );
    entry.estimadoAtencion = getEstimatedWait(entry.posicion);
  });
}

// ---------------------------------------------------------------------------
// addToQueue
// ---------------------------------------------------------------------------
function addToQueue(clienteId, telefono, nombre, tipo, prioridad = 'normal') {
  if (!clienteId || !telefono || !nombre) {
    throw new Error('clienteId, telefono y nombre son requeridos');
  }

  const validTipos = ['consulta', 'siniestro', 'poliza', 'queja', 'emergencia', 'informacion'];
  const validPrioridades = ['urgente', 'alta', 'normal', 'baja'];

  const entry = {
    id: generateId(),
    clienteId,
    telefono,
    nombre,
    tipo: validTipos.includes(tipo) ? tipo : 'consulta',
    prioridad: validPrioridades.includes(prioridad) ? prioridad : 'normal',
    posicion: 0,
    tiempoEspera: 0,
    estimadoAtencion: 0,
    estado: 'en_espera',
    callbackRequested: false,
    horaIngreso: new Date().toISOString(),
    holdConfig: { ...holdConfig },
  };

  queue.push(entry);
  sortQueue();

  return entry;
}

// ---------------------------------------------------------------------------
// removeFromQueue
// ---------------------------------------------------------------------------
function removeFromQueue(id, motivo = 'atendida') {
  const index = queue.findIndex((e) => e.id === id);
  if (index === -1) {
    return { removed: false, error: 'Entrada no encontrada en la cola' };
  }

  const entry = queue[index];
  entry.estado = motivo; // 'atendida', 'abandonada', 'callback'
  entry.horaFin = new Date().toISOString();
  entry.tiempoEspera = Math.floor(
    (new Date(entry.horaFin).getTime() - new Date(entry.horaIngreso).getTime()) / 1000
  );

  // Move to call log
  callLog.push({ ...entry });
  queue.splice(index, 1);
  updatePositions();

  return { removed: true, entry, motivo };
}

// ---------------------------------------------------------------------------
// getNextInQueue - highest priority, longest waiting
// ---------------------------------------------------------------------------
function getNextInQueue() {
  updatePositions();
  const waiting = queue.filter((e) => e.estado === 'en_espera');
  if (waiting.length === 0) return null;

  // Already sorted by priority then FIFO
  waiting.sort((a, b) => {
    const prioA = PRIORITY_ORDER[a.prioridad] || 3;
    const prioB = PRIORITY_ORDER[b.prioridad] || 3;
    if (prioA !== prioB) return prioA - prioB;
    return new Date(a.horaIngreso) - new Date(b.horaIngreso);
  });

  return waiting[0];
}

// ---------------------------------------------------------------------------
// getQueueStatus
// ---------------------------------------------------------------------------
function getQueueStatus() {
  updatePositions();
  const waiting = queue.filter((e) => e.estado === 'en_espera');
  const totalWait = waiting.reduce((sum, e) => sum + e.tiempoEspera, 0);
  const avgWait = waiting.length > 0 ? Math.floor(totalWait / waiting.length) : 0;

  const availableAgents = [];
  for (const [agentId, info] of agents) {
    if (info.available) availableAgents.push(agentId);
  }

  return {
    totalEnCola: waiting.length,
    tiempoEsperaPromedio: avgWait,
    tiempoEsperaPromedioFormato: formatSeconds(avgWait),
    posicionesActualizadas: waiting.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      posicion: e.posicion,
      prioridad: e.prioridad,
      tiempoEspera: e.tiempoEspera,
      estimadoAtencion: e.estimadoAtencion,
    })),
    agentesDisponibles: availableAgents.length,
    agentesTotales: agents.size,
    holdConfig,
  };
}

// ---------------------------------------------------------------------------
// requestCallback
// ---------------------------------------------------------------------------
function requestCallback(id) {
  const entry = queue.find((e) => e.id === id);
  if (!entry) {
    return { success: false, error: 'Entrada no encontrada' };
  }

  entry.callbackRequested = true;
  entry.estado = 'callback_pendiente';

  callbacks.push({
    id: entry.id,
    clienteId: entry.clienteId,
    telefono: entry.telefono,
    nombre: entry.nombre,
    tipo: entry.tipo,
    solicitadoEn: new Date().toISOString(),
    estado: 'pendiente',
  });

  return {
    success: true,
    message: `Callback registrado para ${entry.nombre}. Le llamaremos al ${entry.telefono}`,
    callbackInfo: callbacks[callbacks.length - 1],
  };
}

// ---------------------------------------------------------------------------
// processCallbacks - trigger pending callbacks
// ---------------------------------------------------------------------------
function processCallbacks() {
  const pending = callbacks.filter((cb) => cb.estado === 'pendiente');
  const availableAgentsList = [];
  for (const [agentId, info] of agents) {
    if (info.available) availableAgentsList.push(agentId);
  }

  const processed = [];

  for (const cb of pending) {
    if (availableAgentsList.length === 0) break;

    const agentId = availableAgentsList.shift();
    cb.estado = 'en_proceso';
    cb.agenteAsignado = agentId;
    cb.procesadoEn = new Date().toISOString();

    // Mark agent as busy
    const agentInfo = agents.get(agentId);
    if (agentInfo) agentInfo.available = false;

    // Remove from queue if still there
    const queueIdx = queue.findIndex((e) => e.id === cb.id);
    if (queueIdx !== -1) {
      queue[queueIdx].estado = 'callback_en_proceso';
    }

    processed.push(cb);
  }

  updatePositions();

  return {
    processed: processed.length,
    pendingRemaining: callbacks.filter((cb) => cb.estado === 'pendiente').length,
    details: processed,
  };
}

// ---------------------------------------------------------------------------
// getQueueMetrics
// ---------------------------------------------------------------------------
function getQueueMetrics() {
  const allCalls = [...callLog];
  const totalCalls = allCalls.length;

  const waitTimes = allCalls
    .filter((c) => c.tiempoEspera != null)
    .map((c) => c.tiempoEspera);

  const avgWaitTime =
    waitTimes.length > 0
      ? Math.floor(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
      : 0;

  const maxWaitTime = waitTimes.length > 0 ? Math.max(...waitTimes) : 0;

  const abandoned = allCalls.filter((c) => c.estado === 'abandonada').length;
  const abandonmentRate =
    totalCalls > 0 ? parseFloat(((abandoned / totalCalls) * 100).toFixed(2)) : 0;

  // Calls per hour (last hour from current entries)
  const oneHourAgo = new Date(Date.now() - 3600000);
  const recentCalls = allCalls.filter(
    (c) => new Date(c.horaIngreso) >= oneHourAgo
  ).length;
  const currentQueueSize = queue.filter((e) => e.estado === 'en_espera').length;

  return {
    totalCallsProcessed: totalCalls,
    currentQueueSize,
    avgWaitTime,
    avgWaitTimeFormato: formatSeconds(avgWaitTime),
    maxWaitTime,
    maxWaitTimeFormato: formatSeconds(maxWaitTime),
    abandonmentRate,
    callsLastHour: recentCalls,
    callbacksPending: callbacks.filter((cb) => cb.estado === 'pendiente').length,
    callbacksProcessed: callbacks.filter((cb) => cb.estado === 'en_proceso').length,
    agentMetrics: getAgentMetrics(),
  };
}

// ---------------------------------------------------------------------------
// Agent management
// ---------------------------------------------------------------------------
function setAgentAvailability(agentId, available) {
  if (!agentId) {
    throw new Error('agentId es requerido');
  }

  const existing = agents.get(agentId);
  if (existing) {
    existing.available = available;
    existing.updatedAt = new Date().toISOString();
  } else {
    agents.set(agentId, {
      agentId,
      available,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      callsHandled: 0,
    });
  }

  return {
    agentId,
    available,
    totalAgents: agents.size,
    availableCount: [...agents.values()].filter((a) => a.available).length,
  };
}

function getAgentMetrics() {
  const agentList = [];
  for (const [agentId, info] of agents) {
    agentList.push({
      agentId,
      available: info.available,
      callsHandled: info.callsHandled,
    });
  }
  return agentList;
}

// ---------------------------------------------------------------------------
// getEstimatedWait - calculate ETA based on position
// ---------------------------------------------------------------------------
function getEstimatedWait(position) {
  if (position <= 0) return 0;

  const availableCount = [...agents.values()].filter((a) => a.available).length;
  const effectiveAgents = Math.max(availableCount, 1);
  const estimatedSeconds = Math.ceil((position / effectiveAgents) * AVG_HANDLING_TIME_SECONDS);

  return estimatedSeconds;
}

// ---------------------------------------------------------------------------
// Helper: format seconds to mm:ss
// ---------------------------------------------------------------------------
function formatSeconds(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// getHoldConfig / updateHoldConfig
// ---------------------------------------------------------------------------
function getHoldConfig() {
  return { ...holdConfig };
}

function updateHoldConfig(config) {
  Object.assign(holdConfig, config);
  return { ...holdConfig };
}

// ---------------------------------------------------------------------------
// Pre-populate demo data
// ---------------------------------------------------------------------------
function initDemoData() {
  // Register agents
  const demoAgents = [
    { id: 'AGT-001', name: 'Sofia Ruiz', available: true },
    { id: 'AGT-002', name: 'Pedro Castillo', available: true },
    { id: 'AGT-003', name: 'Isabel Torres', available: false },
    { id: 'AGT-004', name: 'Miguel Herrera', available: true },
  ];

  for (const agent of demoAgents) {
    agents.set(agent.id, {
      agentId: agent.id,
      nombre: agent.name,
      available: agent.available,
      createdAt: '2025-06-01T08:00:00.000Z',
      updatedAt: new Date().toISOString(),
      callsHandled: Math.floor(Math.random() * 50) + 10,
    });
  }

  // Demo queue entries
  const demoEntries = [
    {
      clienteId: 'CLI-001',
      telefono: '+34 612 345 678',
      nombre: 'Maria Garcia',
      tipo: 'siniestro',
      prioridad: 'alta',
      minutesAgo: 12,
    },
    {
      clienteId: 'CLI-010',
      telefono: '+34 623 456 789',
      nombre: 'Fernando Diaz',
      tipo: 'emergencia',
      prioridad: 'urgente',
      minutesAgo: 3,
    },
    {
      clienteId: 'CLI-015',
      telefono: '+34 634 567 890',
      nombre: 'Carmen Ortega',
      tipo: 'consulta',
      prioridad: 'normal',
      minutesAgo: 20,
    },
    {
      clienteId: 'CLI-020',
      telefono: '+34 645 678 901',
      nombre: 'Luis Morales',
      tipo: 'poliza',
      prioridad: 'normal',
      minutesAgo: 8,
    },
    {
      clienteId: 'CLI-025',
      telefono: '+34 656 789 012',
      nombre: 'Patricia Vega',
      tipo: 'queja',
      prioridad: 'alta',
      minutesAgo: 15,
    },
  ];

  for (const demo of demoEntries) {
    const entry = {
      id: generateId(),
      clienteId: demo.clienteId,
      telefono: demo.telefono,
      nombre: demo.nombre,
      tipo: demo.tipo,
      prioridad: demo.prioridad,
      posicion: 0,
      tiempoEspera: demo.minutesAgo * 60,
      estimadoAtencion: 0,
      estado: 'en_espera',
      callbackRequested: false,
      horaIngreso: new Date(Date.now() - demo.minutesAgo * 60 * 1000).toISOString(),
      holdConfig: { ...holdConfig },
    };
    queue.push(entry);
  }

  sortQueue();

  // Add some historical calls for metrics
  const historicalCalls = [
    { estado: 'atendida', tiempoEspera: 120 },
    { estado: 'atendida', tiempoEspera: 45 },
    { estado: 'abandonada', tiempoEspera: 600 },
    { estado: 'atendida', tiempoEspera: 200 },
    { estado: 'atendida', tiempoEspera: 90 },
    { estado: 'atendida', tiempoEspera: 150 },
    { estado: 'abandonada', tiempoEspera: 480 },
    { estado: 'atendida', tiempoEspera: 60 },
    { estado: 'callback', tiempoEspera: 300 },
    { estado: 'atendida', tiempoEspera: 180 },
  ];

  for (const call of historicalCalls) {
    callLog.push({
      id: generateId(),
      clienteId: 'CLI-HIST-' + callLog.length,
      estado: call.estado,
      tiempoEspera: call.tiempoEspera,
      horaIngreso: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      horaFin: new Date().toISOString(),
    });
  }
}

initDemoData();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  addToQueue,
  removeFromQueue,
  getNextInQueue,
  getQueueStatus,
  updatePositions,
  requestCallback,
  processCallbacks,
  getQueueMetrics,
  setAgentAvailability,
  getEstimatedWait,
  getHoldConfig,
  updateHoldConfig,
};
