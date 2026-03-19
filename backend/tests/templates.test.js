// ============================================================
// TEMPLATES TEST SUITE
// Tests for templateService: listTemplates, render, createTemplate, preview
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');

// --------------- Mock template service ---------------
let mockTemplates = [];
let idCounter = 0;

function resetData() {
  idCounter = 0;
  mockTemplates = [
    { id: 'TPL-001', name: 'Notificacion siniestro', type: 'email', subject: 'Siniestro {{expediente}} registrado', body: 'Estimado/a {{cliente_nombre}}, su siniestro {{expediente}} ha sido registrado. Estado: {{estado}}.', variables: ['expediente', 'cliente_nombre', 'estado'], active: true },
    { id: 'TPL-002', name: 'Asignacion perito', type: 'email', subject: 'Perito asignado a {{expediente}}', body: 'Se ha asignado al perito {{perito_nombre}} para su siniestro {{expediente}}. Contacto: {{perito_telefono}}.', variables: ['expediente', 'perito_nombre', 'perito_telefono'], active: true },
    { id: 'TPL-003', name: 'SMS urgente', type: 'sms', subject: null, body: 'URGENTE: Siniestro {{expediente}} requiere atencion inmediata. Tipo: {{tipo}}.', variables: ['expediente', 'tipo'], active: true },
    { id: 'TPL-004', name: 'Informe cierre', type: 'pdf', subject: 'Informe de cierre {{expediente}}', body: 'INFORME DE CIERRE\nExpediente: {{expediente}}\nCliente: {{cliente_nombre}}\nResolucion: {{resolucion}}\nImporte: {{importe}}EUR', variables: ['expediente', 'cliente_nombre', 'resolucion', 'importe'], active: false },
  ];
}

function listTemplates({ type, active } = {}) {
  let results = [...mockTemplates];
  if (type) results = results.filter(t => t.type === type);
  if (active !== undefined) results = results.filter(t => t.active === (active === true || active === 'true'));
  return { data: results, total: results.length, status: 200 };
}

function renderTemplate(templateId, data) {
  const template = mockTemplates.find(t => t.id === templateId);
  if (!template) return { error: 'Plantilla no encontrada', status: 404 };
  if (!template.active) return { error: 'Plantilla inactiva', status: 400 };

  const missingVars = template.variables.filter(v => data[v] === undefined || data[v] === null);
  if (missingVars.length > 0) {
    return { error: `Variables faltantes: ${missingVars.join(', ')}`, status: 400 };
  }

  let renderedBody = template.body;
  let renderedSubject = template.subject;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    renderedBody = renderedBody.replace(regex, String(value));
    if (renderedSubject) renderedSubject = renderedSubject.replace(regex, String(value));
  }

  return { data: { subject: renderedSubject, body: renderedBody, type: template.type }, status: 200 };
}

function createTemplate({ name, type, subject, body, variables }) {
  if (!name || !type || !body) {
    return { error: 'name, type y body son requeridos', status: 400 };
  }
  const validTypes = ['email', 'sms', 'pdf', 'push'];
  if (!validTypes.includes(type)) {
    return { error: 'Tipo de plantilla no valido', status: 400 };
  }
  const existing = mockTemplates.find(t => t.name === name);
  if (existing) return { error: 'Ya existe una plantilla con ese nombre', status: 409 };

  // Auto-detect variables from body
  const detectedVars = [];
  const varRegex = /\{\{(\w+)\}\}/g;
  let match;
  while ((match = varRegex.exec(body)) !== null) {
    if (!detectedVars.includes(match[1])) detectedVars.push(match[1]);
  }

  idCounter++;
  const template = {
    id: `TPL-${String(100 + idCounter).padStart(3, '0')}`,
    name, type, subject: subject || null,
    body,
    variables: variables || detectedVars,
    active: true,
  };
  mockTemplates.push(template);
  return { data: template, status: 201 };
}

function previewTemplate(templateId) {
  const template = mockTemplates.find(t => t.id === templateId);
  if (!template) return { error: 'Plantilla no encontrada', status: 404 };

  const sampleData = {};
  template.variables.forEach(v => { sampleData[v] = `[${v}]`; });

  let previewBody = template.body;
  let previewSubject = template.subject;
  for (const [key, value] of Object.entries(sampleData)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    previewBody = previewBody.replace(regex, value);
    if (previewSubject) previewSubject = previewSubject.replace(regex, value);
  }

  return { data: { subject: previewSubject, body: previewBody, variables: template.variables }, status: 200 };
}

function deleteTemplate(id) {
  const idx = mockTemplates.findIndex(t => t.id === id);
  if (idx === -1) return { error: 'Plantilla no encontrada', status: 404 };
  mockTemplates.splice(idx, 1);
  return { data: { deleted: true }, status: 200 };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Listar todas las plantillas',
    fn() {
      resetData();
      const result = listTemplates();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.total, 4);
    },
  },
  {
    name: 'Listar plantillas filtradas por tipo email',
    fn() {
      resetData();
      const result = listTemplates({ type: 'email' });
      assert.strictEqual(result.total, 2);
      result.data.forEach(t => assert.strictEqual(t.type, 'email'));
    },
  },
  {
    name: 'Listar solo plantillas activas',
    fn() {
      resetData();
      const result = listTemplates({ active: true });
      assert.strictEqual(result.total, 3);
    },
  },
  {
    name: 'Renderizar plantilla con todas las variables',
    fn() {
      resetData();
      const result = renderTemplate('TPL-001', { expediente: 'EXP-2024-0001', cliente_nombre: 'Maria Garcia', estado: 'Abierto' });
      assert.strictEqual(result.status, 200);
      assert.ok(result.data.body.includes('Maria Garcia'));
      assert.ok(result.data.body.includes('EXP-2024-0001'));
      assert.ok(result.data.subject.includes('EXP-2024-0001'));
      assert.ok(!result.data.body.includes('{{'));
    },
  },
  {
    name: 'Renderizar plantilla con variables faltantes falla',
    fn() {
      resetData();
      const result = renderTemplate('TPL-001', { expediente: 'EXP-001' });
      assert.strictEqual(result.status, 400);
      assert.ok(result.error.includes('Variables faltantes'));
      assert.ok(result.error.includes('cliente_nombre'));
    },
  },
  {
    name: 'Renderizar plantilla inexistente falla',
    fn() {
      resetData();
      const result = renderTemplate('TPL-999', {});
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Renderizar plantilla inactiva falla',
    fn() {
      resetData();
      const result = renderTemplate('TPL-004', { expediente: 'E', cliente_nombre: 'C', resolucion: 'R', importe: '100' });
      assert.strictEqual(result.status, 400);
      assert.ok(result.error.includes('inactiva'));
    },
  },
  {
    name: 'Crear plantilla con datos validos',
    fn() {
      resetData();
      const result = createTemplate({
        name: 'Bienvenida',
        type: 'email',
        subject: 'Bienvenido {{nombre}}',
        body: 'Hola {{nombre}}, tu poliza {{poliza}} esta activa.',
      });
      assert.strictEqual(result.status, 201);
      assert.ok(result.data.id.startsWith('TPL-'));
      assert.deepStrictEqual(result.data.variables, ['nombre', 'poliza']);
    },
  },
  {
    name: 'Crear plantilla sin nombre falla',
    fn() {
      resetData();
      const result = createTemplate({ type: 'email', body: 'Test' });
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Crear plantilla con tipo invalido falla',
    fn() {
      resetData();
      const result = createTemplate({ name: 'Test', type: 'fax', body: 'Test' });
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Crear plantilla duplicada falla',
    fn() {
      resetData();
      const result = createTemplate({ name: 'Notificacion siniestro', type: 'email', body: 'Test' });
      assert.strictEqual(result.status, 409);
    },
  },
  {
    name: 'Preview de plantilla genera muestra',
    fn() {
      resetData();
      const result = previewTemplate('TPL-001');
      assert.strictEqual(result.status, 200);
      assert.ok(result.data.body.includes('[expediente]'));
      assert.ok(result.data.body.includes('[cliente_nombre]'));
      assert.ok(!result.data.body.includes('{{'));
    },
  },
  {
    name: 'Preview de plantilla inexistente falla',
    fn() {
      resetData();
      const result = previewTemplate('TPL-999');
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Eliminar plantilla existente',
    fn() {
      resetData();
      const result = deleteTemplate('TPL-001');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(mockTemplates.length, 3);
    },
  },
  {
    name: 'Eliminar plantilla inexistente falla',
    fn() {
      resetData();
      const result = deleteTemplate('TPL-999');
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
