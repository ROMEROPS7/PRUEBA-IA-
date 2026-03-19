// =============================================================================
// healthService.js - Health Monitoring & Circuit Breaker
// =============================================================================

const EventEmitter = require('events');

// ---------------------------------------------------------------------------
// Circuit Breaker
// ---------------------------------------------------------------------------
const CIRCUIT_STATES = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.threshold = options.threshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextRetryTime = null;
  }

  async execute(fn) {
    if (this.state === CIRCUIT_STATES.OPEN) {
      if (Date.now() >= this.nextRetryTime) {
        this.state = CIRCUIT_STATES.HALF_OPEN;
      } else {
        throw new Error(`CircuitBreaker [${this.name}] is OPEN. Retry after ${new Date(this.nextRetryTime).toISOString()}`);
      }
    }

    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure();
      throw err;
    }
  }

  _onSuccess() {
    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      this.reset();
    }
    this.failureCount = 0;
  }

  _onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.trip();
    }
  }

  trip() {
    this.state = CIRCUIT_STATES.OPEN;
    this.nextRetryTime = Date.now() + this.resetTimeout;
  }

  reset() {
    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextRetryTime = null;
  }

  getState() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextRetryTime: this.nextRetryTime,
    };
  }
}

// ---------------------------------------------------------------------------
// ServiceHealth - tracks a single service
// ---------------------------------------------------------------------------
class ServiceHealth {
  constructor(name) {
    this.name = name;
    this.status = 'healthy';          // healthy | degraded | down
    this.lastCheck = null;
    this.responseTime = 0;            // ms
    this.errors = [];
    this.uptimeStart = Date.now();
    this.downSince = null;
    this.totalChecks = 0;
    this.successfulChecks = 0;
  }

  get uptime() {
    if (this.totalChecks === 0) return 100;
    return parseFloat(((this.successfulChecks / this.totalChecks) * 100).toFixed(2));
  }

  recordSuccess(responseTime) {
    this.lastCheck = new Date().toISOString();
    this.responseTime = responseTime;
    this.totalChecks++;
    this.successfulChecks++;
    this.status = responseTime > 2000 ? 'degraded' : 'healthy';
    this.downSince = null;
  }

  recordFailure(error) {
    this.lastCheck = new Date().toISOString();
    this.totalChecks++;
    this.status = 'down';
    if (!this.downSince) this.downSince = Date.now();
    this.errors.push({
      message: error.message || String(error),
      timestamp: new Date().toISOString(),
    });
    // Keep only last 50 errors
    if (this.errors.length > 50) this.errors = this.errors.slice(-50);
  }

  toJSON() {
    return {
      name: this.name,
      status: this.status,
      lastCheck: this.lastCheck,
      responseTime: this.responseTime,
      uptime: this.uptime,
      errorCount: this.errors.length,
      lastError: this.errors.length ? this.errors[this.errors.length - 1] : null,
    };
  }
}

// ---------------------------------------------------------------------------
// HealthMonitor
// ---------------------------------------------------------------------------
class HealthMonitor extends EventEmitter {
  constructor() {
    super();
    this.services = new Map();
    this.circuitBreakers = new Map();
    this.monitorInterval = null;
    this.activeConnections = 0;
    this.failoverMap = new Map();       // agentName -> backupAgentName
    this.onServiceDownCallback = null;

    // Initialise tracked services
    const serviceNames = [
      'database',
      'websockets',
      'fraudeService',
      'mainAgent',
      'whatsappService',
      'voiceService',
      'queueService',
    ];

    for (const name of serviceNames) {
      this.services.set(name, new ServiceHealth(name));
      this.circuitBreakers.set(name, new CircuitBreaker(name));
    }

    // Custom health-check functions keyed by service name.
    // Each returns a promise that resolves if healthy, rejects if unhealthy.
    this._healthChecks = new Map();
    this._registerDefaultChecks();
  }

  // -- Custom check registration ------------------------------------------------

  registerHealthCheck(serviceName, fn) {
    this._healthChecks.set(serviceName, fn);
  }

  _registerDefaultChecks() {
    // Default checks simply resolve; integrations can override via registerHealthCheck.
    const defaultCheck = () => Promise.resolve(true);

    this.registerHealthCheck('database', async () => {
      // Try to reach the database module if available
      try {
        const db = require('../config/database');
        if (db && typeof db.query === 'function') {
          await db.query('SELECT 1');
          return true;
        }
        if (db && db.pool && typeof db.pool.query === 'function') {
          await db.pool.query('SELECT 1');
          return true;
        }
      } catch (_) {
        // Ignore import errors; database may not be configured yet
      }
      return true;
    });

    this.registerHealthCheck('websockets', defaultCheck);
    this.registerHealthCheck('fraudeService', async () => {
      try {
        const fraude = require('./fraudeService');
        if (fraude && typeof fraude.ping === 'function') return await fraude.ping();
      } catch (_) { /* not loaded */ }
      return true;
    });
    this.registerHealthCheck('mainAgent', defaultCheck);
    this.registerHealthCheck('whatsappService', async () => {
      try {
        const ws = require('./whatsappService');
        if (ws && typeof ws.ping === 'function') return await ws.ping();
      } catch (_) { /* not loaded */ }
      return true;
    });
    this.registerHealthCheck('voiceService', async () => {
      try {
        const vs = require('./voiceService');
        if (vs && typeof vs.ping === 'function') return await vs.ping();
      } catch (_) { /* not loaded */ }
      return true;
    });
    this.registerHealthCheck('queueService', defaultCheck);
  }

  // -- Individual service check -------------------------------------------------

  async checkService(name) {
    const svc = this.services.get(name);
    if (!svc) throw new Error(`Unknown service: ${name}`);

    const cb = this.circuitBreakers.get(name);
    const checkFn = this._healthChecks.get(name) || (() => Promise.resolve(true));
    const start = Date.now();

    try {
      await cb.execute(async () => {
        await checkFn();
      });
      const elapsed = Date.now() - start;
      svc.recordSuccess(elapsed);
    } catch (err) {
      const elapsed = Date.now() - start;
      svc.responseTime = elapsed;
      svc.recordFailure(err);
      this._handleServiceDown(name, err);
    }

    return svc.toJSON();
  }

  // -- Check all services -------------------------------------------------------

  async checkAll() {
    const results = {};
    const promises = [];

    for (const name of this.services.keys()) {
      promises.push(
        this.checkService(name).then((r) => {
          results[name] = r;
        })
      );
    }

    await Promise.allSettled(promises);
    return results;
  }

  // -- Periodic monitoring ------------------------------------------------------

  startMonitoring(intervalMs = 30000) {
    if (this.monitorInterval) clearInterval(this.monitorInterval);

    // Run an initial check immediately
    this.checkAll().catch(() => {});

    this.monitorInterval = setInterval(() => {
      this.checkAll().catch(() => {});
    }, intervalMs);

    // Allow Node to exit even if the interval is running
    if (this.monitorInterval.unref) this.monitorInterval.unref();
  }

  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }

  // -- Service-down handling ----------------------------------------------------

  onServiceDown(callback) {
    this.onServiceDownCallback = callback;
  }

  _handleServiceDown(name, error) {
    this.emit('service:down', { service: name, error: error.message, timestamp: new Date().toISOString() });

    if (typeof this.onServiceDownCallback === 'function') {
      try {
        this.onServiceDownCallback(name, error);
      } catch (_) { /* swallow callback errors */ }
    }
  }

  // -- Failover tracking --------------------------------------------------------

  recordFailover(downAgent, backupAgent) {
    this.failoverMap.set(downAgent, {
      backup: backupAgent,
      since: new Date().toISOString(),
    });
    this.emit('failover', { downAgent, backupAgent });
  }

  clearFailover(agentName) {
    this.failoverMap.delete(agentName);
  }

  getFailovers() {
    const out = {};
    for (const [agent, info] of this.failoverMap.entries()) {
      out[agent] = info;
    }
    return out;
  }

  // -- Active connections tracking (set externally) ----------------------------

  setActiveConnections(count) {
    this.activeConnections = count;
  }

  // -- Detailed health report ---------------------------------------------------

  async getDetailedHealth() {
    const serviceReports = await this.checkAll();

    const mem = process.memoryUsage();

    // CPU usage approximation (percent since process start)
    const cpuUsage = process.cpuUsage();
    const cpuPercent = parseFloat(
      (((cpuUsage.user + cpuUsage.system) / 1e6) / process.uptime() * 100).toFixed(2)
    );

    return {
      status: this._overallStatus(serviceReports),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: {
        rss: mem.rss,
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        external: mem.external,
        rssMB: parseFloat((mem.rss / 1024 / 1024).toFixed(2)),
        heapUsedMB: parseFloat((mem.heapUsed / 1024 / 1024).toFixed(2)),
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        percent: cpuPercent,
      },
      activeConnections: this.activeConnections,
      services: serviceReports,
      circuitBreakers: this._allCircuitBreakerStates(),
      failovers: this.getFailovers(),
    };
  }

  _overallStatus(serviceReports) {
    const statuses = Object.values(serviceReports).map((s) => s.status);
    if (statuses.includes('down')) return 'degraded';
    if (statuses.includes('degraded')) return 'degraded';
    return 'healthy';
  }

  _allCircuitBreakerStates() {
    const out = {};
    for (const [name, cb] of this.circuitBreakers.entries()) {
      out[name] = cb.getState();
    }
    return out;
  }
}

// ---------------------------------------------------------------------------
// retryWithBackoff
// ---------------------------------------------------------------------------
async function retryWithBackoff(fn, options = {}) {
  const maxRetries = options.maxRetries ?? 3;
  const baseDelay = options.baseDelay ?? 1000;
  const maxDelay = options.maxDelay ?? 30000;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const jitter = Math.random() * 200;
        const delay = Math.min(baseDelay * Math.pow(2, attempt) + jitter, maxDelay);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// Singleton instance
// ---------------------------------------------------------------------------
const healthMonitor = new HealthMonitor();

module.exports = {
  healthMonitor,
  HealthMonitor,
  ServiceHealth,
  CircuitBreaker,
  retryWithBackoff,
};
