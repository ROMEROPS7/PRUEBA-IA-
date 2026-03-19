/**
 * Webhook Service
 *
 * Register, manage, and trigger webhooks with HMAC-SHA256 signatures,
 * retry logic with exponential backoff, and delivery logging.
 */

const crypto = require('crypto');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EVENTS = [
  'siniestro_abierto',
  'siniestro_cerrado',
  'siniestro_actualizado',
  'fraude_detectado',
  'perito_asignado',
  'pago_procesado',
  'documento_recibido',
];

const MAX_RETRIES = 3;
const MAX_DELIVERY_LOG_PER_HOOK = 100;

// ---------------------------------------------------------------------------
// In-memory stores
// ---------------------------------------------------------------------------

/** webhookId -> webhook object */
const webhooks = new Map();

/** webhookId -> [ deliveryLogEntry, ... ] (newest last) */
const deliveryLogs = new Map();

let idCounter = 1000;

function nextId() {
  return `wh_${++idCounter}`;
}

// ---------------------------------------------------------------------------
// Seed demo webhooks
// ---------------------------------------------------------------------------

function seedWebhooks() {
  const demos = [
    {
      tenantId: 'aseguratech',
      url: 'https://aseguratech.example.com/webhooks/siniestros',
      events: ['siniestro_abierto', 'siniestro_cerrado', 'siniestro_actualizado'],
      secret: 'sec_aseguratech_abc123',
    },
    {
      tenantId: 'aseguratech',
      url: 'https://aseguratech.example.com/webhooks/fraude',
      events: ['fraude_detectado'],
      secret: 'sec_aseguratech_fraude456',
    },
    {
      tenantId: 'mutualsur',
      url: 'https://hooks.mutualsur.example.com/intake',
      events: [
        'siniestro_abierto',
        'siniestro_cerrado',
        'fraude_detectado',
        'pago_procesado',
      ],
      secret: 'sec_mutualsur_xyz789',
    },
    {
      tenantId: 'protectoplus',
      url: 'https://protectoplus.example.com/api/events',
      events: ['siniestro_abierto', 'documento_recibido', 'perito_asignado'],
      secret: 'sec_protectoplus_doc321',
    },
  ];

  for (const d of demos) {
    register(d.tenantId, d.url, d.events, d.secret);
  }
}

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Register a new webhook.
 *
 * @param {string}   tenantId
 * @param {string}   url       Target URL (must be http or https)
 * @param {string[]} events    Array of event names to subscribe to
 * @param {string}   secret    Shared secret for HMAC signature
 * @returns {Object} The created webhook object
 */
function register(tenantId, url, events, secret) {
  if (!tenantId) throw new Error('tenantId is required');
  if (!url) throw new Error('url is required');
  if (!events || !Array.isArray(events) || events.length === 0) {
    throw new Error('At least one event is required');
  }

  // Validate URL
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('URL must use http or https protocol');
    }
  } catch (e) {
    if (e.message.includes('protocol')) throw e;
    throw new Error(`Invalid URL: ${url}`);
  }

  // Validate events
  const invalidEvents = events.filter((e) => !EVENTS.includes(e));
  if (invalidEvents.length > 0) {
    throw new Error(`Invalid events: ${invalidEvents.join(', ')}`);
  }

  const id = nextId();
  const webhook = {
    id,
    tenantId,
    url,
    events: [...events],
    secret: secret || crypto.randomBytes(32).toString('hex'),
    active: true,
    createdAt: new Date().toISOString(),
    failCount: 0,
    lastTriggered: null,
    lastStatus: null,
  };

  webhooks.set(id, webhook);
  deliveryLogs.set(id, []);

  return { ...webhook };
}

/**
 * Unregister (remove) a webhook by id.
 *
 * @param {string} webhookId
 * @returns {boolean} true if removed, false if not found
 */
function unregister(webhookId) {
  if (!webhooks.has(webhookId)) return false;
  webhooks.delete(webhookId);
  deliveryLogs.delete(webhookId);
  return true;
}

/**
 * List all webhooks for a given tenant.
 *
 * @param {string} tenantId
 * @returns {Object[]}
 */
function list(tenantId) {
  const results = [];
  for (const wh of webhooks.values()) {
    if (wh.tenantId === tenantId) {
      results.push({ ...wh });
    }
  }
  return results;
}

/**
 * Get a single webhook by id.
 *
 * @param {string} webhookId
 * @returns {Object|null}
 */
function getById(webhookId) {
  const wh = webhooks.get(webhookId);
  return wh ? { ...wh } : null;
}

// ---------------------------------------------------------------------------
// Signature
// ---------------------------------------------------------------------------

/**
 * Compute HMAC-SHA256 signature of a payload using the webhook's secret.
 *
 * @param {string} payload  JSON string
 * @param {string} secret
 * @returns {string}  hex-encoded signature
 */
function computeSignature(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

// ---------------------------------------------------------------------------
// HTTP delivery
// ---------------------------------------------------------------------------

/**
 * Send an HTTP POST request with the webhook payload.
 * Returns a promise that resolves with { statusCode, responseTime } or
 * rejects with an Error.
 */
function sendPayload(url, body, signature) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const transport = parsed.protocol === 'https:' ? https : http;

    const payload = typeof body === 'string' ? body : JSON.stringify(body);

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'X-Webhook-Signature': signature,
        'User-Agent': 'SiniestrosAI-Webhook/1.0',
      },
      timeout: 10000,
    };

    const startTime = Date.now();

    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          responseTime,
          body: data.slice(0, 500), // store first 500 chars only
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out after 10s'));
    });

    req.write(payload);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Delivery log
// ---------------------------------------------------------------------------

/**
 * Append an entry to the delivery log for a webhook.
 */
function appendDeliveryLog(webhookId, entry) {
  let log = deliveryLogs.get(webhookId);
  if (!log) {
    log = [];
    deliveryLogs.set(webhookId, log);
  }
  log.push(entry);

  // Keep bounded
  if (log.length > MAX_DELIVERY_LOG_PER_HOOK) {
    log.splice(0, log.length - MAX_DELIVERY_LOG_PER_HOOK);
  }
}

/**
 * Get the delivery log for a webhook.
 *
 * @param {string} webhookId
 * @returns {Object[]}
 */
function getDeliveryLog(webhookId) {
  const log = deliveryLogs.get(webhookId);
  return log ? [...log] : [];
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

/**
 * Deliver a single webhook with retry logic.
 * Up to MAX_RETRIES retries with exponential backoff (1s, 2s, 4s).
 */
async function deliverWithRetry(webhook, payloadStr, signature) {
  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // Exponential backoff: wait before retries (not before first attempt)
    if (attempt > 0) {
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, delay));
    }

    const logEntry = {
      webhookId: webhook.id,
      attempt: attempt + 1,
      timestamp: new Date().toISOString(),
      event: null, // filled by caller context or from payload
      url: webhook.url,
      status: 'pending',
      statusCode: null,
      responseTime: null,
      error: null,
    };

    try {
      const result = await sendPayload(webhook.url, payloadStr, signature);
      logEntry.statusCode = result.statusCode;
      logEntry.responseTime = result.responseTime;

      if (result.statusCode >= 200 && result.statusCode < 300) {
        logEntry.status = 'success';
        appendDeliveryLog(webhook.id, logEntry);

        // Update webhook state
        const wh = webhooks.get(webhook.id);
        if (wh) {
          wh.lastTriggered = new Date().toISOString();
          wh.lastStatus = result.statusCode;
          wh.failCount = 0;
        }

        return { success: true, statusCode: result.statusCode, attempts: attempt + 1 };
      }

      // Non-2xx: treat as failure for retry purposes
      logEntry.status = 'failed';
      logEntry.error = `HTTP ${result.statusCode}`;
      appendDeliveryLog(webhook.id, logEntry);
      lastError = new Error(`HTTP ${result.statusCode}`);
    } catch (err) {
      logEntry.status = 'failed';
      logEntry.error = err.message;
      appendDeliveryLog(webhook.id, logEntry);
      lastError = err;
    }
  }

  // All retries exhausted
  const wh = webhooks.get(webhook.id);
  if (wh) {
    wh.failCount += 1;
    wh.lastTriggered = new Date().toISOString();
    wh.lastStatus = 'failed';

    // Auto-disable after 10 consecutive failures
    if (wh.failCount >= 10) {
      wh.active = false;
      console.warn(`[WEBHOOK] Auto-disabled webhook ${wh.id} after ${wh.failCount} consecutive failures`);
    }
  }

  return {
    success: false,
    error: lastError ? lastError.message : 'Unknown error',
    attempts: MAX_RETRIES + 1,
  };
}

/**
 * Trigger all webhooks subscribed to the given event.
 *
 * @param {string} event  Event name (e.g. 'siniestro_abierto')
 * @param {Object} data   Event payload data
 * @returns {Promise<Object[]>}  Array of delivery results
 */
async function trigger(event, data) {
  if (!EVENTS.includes(event)) {
    throw new Error(`Unknown event: ${event}. Valid events: ${EVENTS.join(', ')}`);
  }

  const matchingHooks = [];
  for (const wh of webhooks.values()) {
    if (wh.active && wh.events.includes(event)) {
      matchingHooks.push(wh);
    }
  }

  if (matchingHooks.length === 0) {
    return [];
  }

  const results = [];

  // Fire all deliveries concurrently
  const promises = matchingHooks.map(async (wh) => {
    const body = {
      event,
      data: data || {},
      timestamp: new Date().toISOString(),
      webhookId: wh.id,
    };

    const payloadStr = JSON.stringify(body);
    const signature = computeSignature(payloadStr, wh.secret);
    body.signature = signature;
    const signedPayloadStr = JSON.stringify(body);

    const result = await deliverWithRetry(wh, signedPayloadStr, signature);
    return {
      webhookId: wh.id,
      tenantId: wh.tenantId,
      url: wh.url,
      event,
      ...result,
    };
  });

  const settled = await Promise.allSettled(promises);
  for (const s of settled) {
    if (s.status === 'fulfilled') {
      results.push(s.value);
    } else {
      results.push({
        webhookId: 'unknown',
        event,
        success: false,
        error: s.reason ? s.reason.message : 'Promise rejected',
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Management helpers
// ---------------------------------------------------------------------------

/**
 * Enable or disable a webhook.
 */
function setActive(webhookId, active) {
  const wh = webhooks.get(webhookId);
  if (!wh) return null;
  wh.active = Boolean(active);
  return { ...wh };
}

/**
 * Update the events a webhook subscribes to.
 */
function updateEvents(webhookId, events) {
  const wh = webhooks.get(webhookId);
  if (!wh) return null;

  const invalid = events.filter((e) => !EVENTS.includes(e));
  if (invalid.length > 0) {
    throw new Error(`Invalid events: ${invalid.join(', ')}`);
  }

  wh.events = [...events];
  return { ...wh };
}

/**
 * Reset the fail counter for a webhook (e.g. after fixing the endpoint).
 */
function resetFailCount(webhookId) {
  const wh = webhooks.get(webhookId);
  if (!wh) return null;
  wh.failCount = 0;
  wh.active = true;
  return { ...wh };
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

seedWebhooks();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  // Constants
  EVENTS,

  // Core CRUD
  register,
  unregister,
  list,
  getById,

  // Triggering
  trigger,
  computeSignature,

  // Delivery log
  getDeliveryLog,

  // Management
  setActive,
  updateEvents,
  resetFailCount,

  // Internals for testing
  _webhooks: webhooks,
  _deliveryLogs: deliveryLogs,
};
