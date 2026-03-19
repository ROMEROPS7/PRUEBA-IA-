// ============================================================
// WEBHOOKS TEST SUITE
// Tests for webhookService: register, list, unregister, trigger
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');

// --------------- Mock webhook service ---------------
let mockWebhooks = [];
let mockLogs = [];
let idCounter = 0;

function resetData() {
  idCounter = 0;
  mockWebhooks = [];
  mockLogs = [];
}

function registerWebhook({ url, event, secret, description }) {
  if (!url || !event) {
    return { error: 'url y event son requeridos', status: 400 };
  }
  const urlPattern = /^https?:\/\/.+/;
  if (!urlPattern.test(url)) {
    return { error: 'URL invalida', status: 400 };
  }
  const validEvents = ['siniestro.created', 'siniestro.updated', 'siniestro.closed', 'fraude.detected', 'perito.assigned', 'poliza.expired'];
  if (!validEvents.includes(event)) {
    return { error: 'Evento no soportado', status: 400 };
  }
  const existing = mockWebhooks.find(w => w.url === url && w.event === event);
  if (existing) {
    return { error: 'Webhook ya registrado para este evento', status: 409 };
  }
  idCounter++;
  const webhook = {
    id: `WH-${String(idCounter).padStart(3, '0')}`,
    url,
    event,
    secret: secret || null,
    description: description || '',
    active: true,
    created_at: new Date().toISOString(),
    last_triggered: null,
    failure_count: 0,
  };
  mockWebhooks.push(webhook);
  return { data: webhook, status: 201 };
}

function listWebhooks({ event, active } = {}) {
  let results = [...mockWebhooks];
  if (event) results = results.filter(w => w.event === event);
  if (active !== undefined) results = results.filter(w => w.active === (active === true || active === 'true'));
  return { data: results, total: results.length, status: 200 };
}

function unregisterWebhook(id) {
  const idx = mockWebhooks.findIndex(w => w.id === id);
  if (idx === -1) return { error: 'Webhook no encontrado', status: 404 };
  const removed = mockWebhooks.splice(idx, 1)[0];
  return { data: removed, status: 200 };
}

function triggerWebhook(event, payload) {
  if (!event) return { error: 'event es requerido', status: 400 };
  const targets = mockWebhooks.filter(w => w.event === event && w.active);
  if (targets.length === 0) return { data: { triggered: 0, targets: [] }, status: 200 };
  const results = targets.map(w => {
    w.last_triggered = new Date().toISOString();
    mockLogs.push({ webhook_id: w.id, event, payload, timestamp: w.last_triggered, success: true });
    return { id: w.id, url: w.url, status: 'delivered' };
  });
  return { data: { triggered: results.length, targets: results }, status: 200 };
}

function deactivateWebhook(id) {
  const webhook = mockWebhooks.find(w => w.id === id);
  if (!webhook) return { error: 'Webhook no encontrado', status: 404 };
  webhook.active = false;
  return { data: webhook, status: 200 };
}

function getWebhookLogs(webhookId) {
  const webhook = mockWebhooks.find(w => w.id === webhookId);
  if (!webhook) return { error: 'Webhook no encontrado', status: 404 };
  const logs = mockLogs.filter(l => l.webhook_id === webhookId);
  return { data: logs, status: 200 };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Registrar webhook con datos validos',
    fn() {
      resetData();
      const result = registerWebhook({ url: 'https://example.com/hook', event: 'siniestro.created', secret: 'abc123' });
      assert.strictEqual(result.status, 201);
      assert.ok(result.data.id.startsWith('WH-'));
      assert.strictEqual(result.data.url, 'https://example.com/hook');
      assert.strictEqual(result.data.event, 'siniestro.created');
      assert.strictEqual(result.data.active, true);
      assert.strictEqual(result.data.failure_count, 0);
    },
  },
  {
    name: 'Registrar webhook sin URL falla',
    fn() {
      resetData();
      const result = registerWebhook({ event: 'siniestro.created' });
      assert.strictEqual(result.status, 400);
      assert.ok(result.error.includes('requeridos'));
    },
  },
  {
    name: 'Registrar webhook sin evento falla',
    fn() {
      resetData();
      const result = registerWebhook({ url: 'https://example.com/hook' });
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Registrar webhook con URL invalida falla',
    fn() {
      resetData();
      const result = registerWebhook({ url: 'not-a-url', event: 'siniestro.created' });
      assert.strictEqual(result.status, 400);
      assert.ok(result.error.includes('URL'));
    },
  },
  {
    name: 'Registrar webhook con evento no soportado falla',
    fn() {
      resetData();
      const result = registerWebhook({ url: 'https://example.com/hook', event: 'invalid.event' });
      assert.strictEqual(result.status, 400);
      assert.ok(result.error.includes('no soportado'));
    },
  },
  {
    name: 'Registrar webhook duplicado falla',
    fn() {
      resetData();
      registerWebhook({ url: 'https://example.com/hook', event: 'siniestro.created' });
      const result = registerWebhook({ url: 'https://example.com/hook', event: 'siniestro.created' });
      assert.strictEqual(result.status, 409);
    },
  },
  {
    name: 'Listar webhooks devuelve todos',
    fn() {
      resetData();
      registerWebhook({ url: 'https://a.com/hook', event: 'siniestro.created' });
      registerWebhook({ url: 'https://b.com/hook', event: 'fraude.detected' });
      registerWebhook({ url: 'https://c.com/hook', event: 'siniestro.created' });
      const result = listWebhooks();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.total, 3);
    },
  },
  {
    name: 'Listar webhooks filtrados por evento',
    fn() {
      resetData();
      registerWebhook({ url: 'https://a.com/hook', event: 'siniestro.created' });
      registerWebhook({ url: 'https://b.com/hook', event: 'fraude.detected' });
      registerWebhook({ url: 'https://c.com/hook', event: 'siniestro.created' });
      const result = listWebhooks({ event: 'siniestro.created' });
      assert.strictEqual(result.total, 2);
    },
  },
  {
    name: 'Unregister webhook exitoso',
    fn() {
      resetData();
      registerWebhook({ url: 'https://a.com/hook', event: 'siniestro.created' });
      const id = mockWebhooks[0].id;
      const result = unregisterWebhook(id);
      assert.strictEqual(result.status, 200);
      assert.strictEqual(mockWebhooks.length, 0);
    },
  },
  {
    name: 'Unregister webhook inexistente falla',
    fn() {
      resetData();
      const result = unregisterWebhook('WH-999');
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Trigger webhook envia a targets activos',
    fn() {
      resetData();
      registerWebhook({ url: 'https://a.com/hook', event: 'siniestro.created' });
      registerWebhook({ url: 'https://b.com/hook', event: 'siniestro.created' });
      registerWebhook({ url: 'https://c.com/hook', event: 'fraude.detected' });
      const result = triggerWebhook('siniestro.created', { id: 'SIN-001' });
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.triggered, 2);
    },
  },
  {
    name: 'Trigger webhook sin targets devuelve triggered 0',
    fn() {
      resetData();
      const result = triggerWebhook('siniestro.created', { id: 'SIN-001' });
      assert.strictEqual(result.data.triggered, 0);
    },
  },
  {
    name: 'Trigger webhook sin evento falla',
    fn() {
      resetData();
      const result = triggerWebhook(null, {});
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Deactivar webhook excluye de triggers',
    fn() {
      resetData();
      registerWebhook({ url: 'https://a.com/hook', event: 'siniestro.created' });
      const id = mockWebhooks[0].id;
      deactivateWebhook(id);
      const result = triggerWebhook('siniestro.created', { id: 'SIN-001' });
      assert.strictEqual(result.data.triggered, 0);
    },
  },
  {
    name: 'Obtener logs de webhook',
    fn() {
      resetData();
      registerWebhook({ url: 'https://a.com/hook', event: 'siniestro.created' });
      const id = mockWebhooks[0].id;
      triggerWebhook('siniestro.created', { id: 'SIN-001' });
      triggerWebhook('siniestro.created', { id: 'SIN-002' });
      const result = getWebhookLogs(id);
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.length, 2);
    },
  },
  {
    name: 'Logs de webhook inexistente falla',
    fn() {
      resetData();
      const result = getWebhookLogs('WH-999');
      assert.strictEqual(result.status, 404);
    },
  },
];

async function runTests() {
  const results = { passed: 0, failed: 0, errors: [] };
  for (const test of tests) {
    const start = Date.now();
    try {
      await test.fn();
      const elapsed = Date.now() - start;
      results.passed++;
      console.log(`  \x1b[32m✓\x1b[0m ${test.name} \x1b[90m(${elapsed}ms)\x1b[0m`);
    } catch (err) {
      const elapsed = Date.now() - start;
      results.failed++;
      results.errors.push({ name: test.name, error: err.message });
      console.log(`  \x1b[31m✗\x1b[0m ${test.name} \x1b[90m(${elapsed}ms)\x1b[0m`);
      console.log(`    \x1b[31m${err.message}\x1b[0m`);
    }
  }
  return results;
}

module.exports = { runTests, tests };
