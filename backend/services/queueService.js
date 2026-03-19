// =============================================================================
// queueService.js - In-Memory Priority Task Queue
// =============================================================================

const EventEmitter = require('events');
const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Task statuses
// ---------------------------------------------------------------------------
const STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// ---------------------------------------------------------------------------
// Priority Queue (max-heap by priority, FIFO within same priority)
// ---------------------------------------------------------------------------
class PriorityQueue {
  constructor() {
    this._items = []; // sorted on insert; small queue so linear insert is fine
  }

  enqueue(task) {
    // Insert in sorted position: higher priority first, then earlier createdAt first
    let inserted = false;
    for (let i = 0; i < this._items.length; i++) {
      if (
        task.priority > this._items[i].priority ||
        (task.priority === this._items[i].priority && task.createdAt < this._items[i].createdAt)
      ) {
        this._items.splice(i, 0, task);
        inserted = true;
        break;
      }
    }
    if (!inserted) this._items.push(task);
  }

  dequeue() {
    return this._items.shift() || null;
  }

  peek() {
    return this._items[0] || null;
  }

  remove(id) {
    const idx = this._items.findIndex((t) => t.id === id);
    if (idx !== -1) return this._items.splice(idx, 1)[0];
    return null;
  }

  get length() {
    return this._items.length;
  }

  toArray() {
    return [...this._items];
  }
}

// ---------------------------------------------------------------------------
// TaskProcessor
// ---------------------------------------------------------------------------
class TaskProcessor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.concurrency = options.concurrency || 3;
    this.queue = new PriorityQueue();
    this.handlers = new Map();
    this.processing = new Map();   // id -> task
    this.completed = [];
    this.failed = [];
    this.running = false;
    this.paused = false;
    this._loopTimer = null;
    this._totalProcessingTime = 0;
    this._processedCount = 0;

    // Pre-register default handlers
    this._registerDefaultHandlers();
  }

  // -- Handler registration ---------------------------------------------------

  registerHandler(taskType, handlerFn) {
    this.handlers.set(taskType, handlerFn);
  }

  _registerDefaultHandlers() {
    this.registerHandler('clasificar_siniestro', async (data) => {
      const tipos = ['auto', 'hogar', 'vida', 'salud', 'comercial'];
      const severidades = ['baja', 'media', 'alta', 'critica'];

      const descripcion = (data.descripcion || '').toLowerCase();
      let tipo = data.tipo || tipos[Math.floor(Math.random() * tipos.length)];
      let severidad = 'media';

      if (descripcion.includes('incendio') || descripcion.includes('explosion')) severidad = 'critica';
      else if (descripcion.includes('robo') || descripcion.includes('colision')) severidad = 'alta';
      else if (descripcion.includes('rasguño') || descripcion.includes('menor')) severidad = 'baja';

      const montoEstimado = data.montoEstimado || Math.round(Math.random() * 50000 + 1000);

      return {
        siniestroId: data.siniestroId || crypto.randomUUID(),
        tipo,
        severidad,
        montoEstimado,
        requierePerito: severidad === 'alta' || severidad === 'critica',
        clasificadoEn: new Date().toISOString(),
      };
    });

    this.registerHandler('analizar_fraude', async (data) => {
      await _sleep(50); // simulate analysis time
      const indicadores = [];
      let score = 0;

      if (data.montoReclamado && data.montoReclamado > 100000) {
        indicadores.push('monto_elevado');
        score += 25;
      }
      if (data.reclamacionesPrevias && data.reclamacionesPrevias > 3) {
        indicadores.push('multiples_reclamaciones');
        score += 30;
      }
      if (data.diasDesdePoliza && data.diasDesdePoliza < 30) {
        indicadores.push('poliza_reciente');
        score += 20;
      }
      if (data.inconsistencias) {
        indicadores.push('inconsistencias_declaracion');
        score += 35;
      }

      score = Math.min(score, 100);
      const riesgo = score >= 70 ? 'alto' : score >= 40 ? 'medio' : 'bajo';

      return {
        siniestroId: data.siniestroId,
        scoreFraude: score,
        riesgo,
        indicadores,
        requiereInvestigacion: riesgo === 'alto',
        analizadoEn: new Date().toISOString(),
      };
    });

    this.registerHandler('asignar_perito', async (data) => {
      const peritos = [
        { id: 'P001', nombre: 'Carlos Martinez', especialidad: 'auto', carga: 3 },
        { id: 'P002', nombre: 'Ana Garcia', especialidad: 'hogar', carga: 5 },
        { id: 'P003', nombre: 'Luis Fernandez', especialidad: 'comercial', carga: 2 },
        { id: 'P004', nombre: 'Maria Lopez', especialidad: 'vida', carga: 4 },
        { id: 'P005', nombre: 'Jorge Ruiz', especialidad: 'auto', carga: 1 },
      ];

      const tipo = data.tipo || 'auto';
      // Prefer a specialist with lowest workload
      const candidatos = peritos
        .filter((p) => p.especialidad === tipo)
        .sort((a, b) => a.carga - b.carga);

      const asignado = candidatos.length > 0
        ? candidatos[0]
        : peritos.sort((a, b) => a.carga - b.carga)[0];

      return {
        siniestroId: data.siniestroId,
        perito: asignado,
        fechaAsignacion: new Date().toISOString(),
        fechaEstimadaVisita: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      };
    });

    this.registerHandler('enviar_notificacion', async (data) => {
      const canal = data.canal || 'email';
      const destinatario = data.destinatario || data.email || 'cliente@ejemplo.com';
      const asunto = data.asunto || 'Actualización de su siniestro';
      const mensaje = data.mensaje || `Su siniestro ${data.siniestroId || 'N/A'} ha sido actualizado.`;

      return {
        notificacionId: crypto.randomUUID(),
        canal,
        destinatario,
        asunto,
        mensaje,
        estado: 'enviado',
        enviadoEn: new Date().toISOString(),
      };
    });

    this.registerHandler('generar_informe', async (data) => {
      await _sleep(80); // simulate report generation
      const secciones = [
        'resumen_ejecutivo',
        'datos_poliza',
        'descripcion_siniestro',
        'evaluacion_danos',
        'documentacion_adjunta',
        'conclusion',
      ];

      return {
        informeId: crypto.randomUUID(),
        siniestroId: data.siniestroId,
        tipo: data.tipoInforme || 'completo',
        secciones,
        paginas: Math.floor(Math.random() * 10) + 5,
        formato: data.formato || 'pdf',
        generadoEn: new Date().toISOString(),
        url: `/informes/${data.siniestroId || 'draft'}_informe.pdf`,
      };
    });
  }

  // -- Enqueue ----------------------------------------------------------------

  enqueue(type, data = {}, priority = 5, options = {}) {
    const id = crypto.randomUUID();
    const task = {
      id,
      type,
      data,
      priority: Math.max(1, Math.min(10, priority)),
      status: STATUS.PENDING,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      error: null,
      result: null,
    };

    this.queue.enqueue(task);
    this.emit('task:enqueued', task);
    this._scheduleProcess();
    return id;
  }

  // -- Processing loop --------------------------------------------------------

  _scheduleProcess() {
    if (this._loopTimer || !this.running || this.paused) return;
    this._loopTimer = setImmediate(() => {
      this._loopTimer = null;
      this._processNext();
    });
  }

  async _processNext() {
    if (!this.running || this.paused) return;
    if (this.processing.size >= this.concurrency) return;

    const task = this.queue.dequeue();
    if (!task) return;

    task.status = STATUS.PROCESSING;
    task.startedAt = new Date().toISOString();
    task.attempts++;
    this.processing.set(task.id, task);

    // Try to pick up more tasks concurrently
    this._scheduleProcess();

    const handler = this.handlers.get(task.type);

    if (!handler) {
      task.status = STATUS.FAILED;
      task.error = `No handler registered for task type: ${task.type}`;
      task.completedAt = new Date().toISOString();
      this.processing.delete(task.id);
      this.failed.push(task);
      this.emit('task:failed', task);
      this._scheduleProcess();
      return;
    }

    const startTime = Date.now();

    try {
      const result = await handler(task.data);
      const elapsed = Date.now() - startTime;

      task.status = STATUS.COMPLETED;
      task.result = result;
      task.completedAt = new Date().toISOString();
      this.processing.delete(task.id);
      this.completed.push(task);
      this._totalProcessingTime += elapsed;
      this._processedCount++;
      this.emit('task:completed', task);
    } catch (err) {
      const elapsed = Date.now() - startTime;
      this._totalProcessingTime += elapsed;
      this._processedCount++;
      this.processing.delete(task.id);

      if (task.attempts < task.maxAttempts) {
        // Re-enqueue for retry
        task.status = STATUS.PENDING;
        task.error = err.message || String(err);
        this.queue.enqueue(task);
      } else {
        task.status = STATUS.FAILED;
        task.error = err.message || String(err);
        task.completedAt = new Date().toISOString();
        this.failed.push(task);
        this.emit('task:failed', task);
      }
    }

    this._scheduleProcess();
  }

  // -- Start / Stop -----------------------------------------------------------

  start() {
    this.running = true;
    this.paused = false;
    this._scheduleProcess();
  }

  stop() {
    this.running = false;
    if (this._loopTimer) {
      clearImmediate(this._loopTimer);
      this._loopTimer = null;
    }
  }

  pauseQueue() {
    this.paused = true;
  }

  resumeQueue() {
    this.paused = false;
    this._scheduleProcess();
  }

  // -- Retry failed -----------------------------------------------------------

  retryFailed() {
    const toRetry = [...this.failed];
    this.failed = [];
    let count = 0;

    for (const task of toRetry) {
      task.status = STATUS.PENDING;
      task.attempts = 0;
      task.error = null;
      task.result = null;
      task.completedAt = null;
      task.startedAt = null;
      this.queue.enqueue(task);
      this.emit('task:enqueued', task);
      count++;
    }

    this._scheduleProcess();
    return count;
  }

  // -- Stats / State ----------------------------------------------------------

  getStats() {
    return {
      pending: this.queue.length,
      processing: this.processing.size,
      completed: this.completed.length,
      failed: this.failed.length,
      avgProcessingTime: this._processedCount > 0
        ? parseFloat((this._totalProcessingTime / this._processedCount).toFixed(2))
        : 0,
      totalProcessed: this._processedCount,
      isPaused: this.paused,
      isRunning: this.running,
      concurrency: this.concurrency,
    };
  }

  getQueue() {
    return {
      pending: this.queue.toArray(),
      processing: Array.from(this.processing.values()),
      recentCompleted: this.completed.slice(-20),
      recentFailed: this.failed.slice(-20),
    };
  }

  getTask(id) {
    // Search everywhere
    const inQueue = this.queue.toArray().find((t) => t.id === id);
    if (inQueue) return inQueue;
    const inProc = this.processing.get(id);
    if (inProc) return inProc;
    const inComp = this.completed.find((t) => t.id === id);
    if (inComp) return inComp;
    const inFail = this.failed.find((t) => t.id === id);
    if (inFail) return inFail;
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function _sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------
const taskProcessor = new TaskProcessor();

module.exports = {
  taskProcessor,
  TaskProcessor,
  PriorityQueue,
  STATUS,
};
