// ============================================================
// RULES ENGINE TEST SUITE
// Tests for rulesEngine: listRules, addRule, evaluateConditions,
// testRule, processRules, deleteRule, toggleRule
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');

// --------------- Mock rules engine ---------------
let mockRules = [];
let mockAuditLog = [];
let idCounter = 0;

function resetData() {
  idCounter = 0;
  mockAuditLog = [];
  mockRules = [
    { id: 'RULE-001', name: 'Fraude alto auto-escalar', event: 'siniestro.created', conditions: [{ field: 'score_fraude', operator: '>=', value: 70 }], actions: [{ type: 'escalate', target: 'supervisor' }], active: true, priority: 1 },
    { id: 'RULE-002', name: 'Urgencia critica notificar', event: 'siniestro.created', conditions: [{ field: 'urgencia', operator: '>=', value: 9 }], actions: [{ type: 'notify', target: 'manager' }], active: true, priority: 2 },
    { id: 'RULE-003', name: 'Auto-asignar perito hogar', event: 'siniestro.created', conditions: [{ field: 'tipo', operator: '==', value: 'hogar' }], actions: [{ type: 'auto_assign', target: 'perito_hogar' }], active: false, priority: 3 },
  ];
}

function listRules({ event, active } = {}) {
  let results = [...mockRules];
  if (event) results = results.filter(r => r.event === event);
  if (active !== undefined) results = results.filter(r => r.active === (active === true || active === 'true'));
  results.sort((a, b) => a.priority - b.priority);
  return { data: results, total: results.length, status: 200 };
}

function addRule({ name, event, conditions, actions, priority }) {
  if (!name || !event || !conditions || !actions) {
    return { error: 'name, event, conditions y actions son requeridos', status: 400 };
  }
  if (!Array.isArray(conditions) || conditions.length === 0) {
    return { error: 'conditions debe ser un array no vacio', status: 400 };
  }
  if (!Array.isArray(actions) || actions.length === 0) {
    return { error: 'actions debe ser un array no vacio', status: 400 };
  }
  const validOperators = ['==', '!=', '>=', '<=', '>', '<', 'contains', 'not_contains'];
  for (const c of conditions) {
    if (!c.field || !c.operator || c.value === undefined) {
      return { error: 'Cada condicion necesita field, operator y value', status: 400 };
    }
    if (!validOperators.includes(c.operator)) {
      return { error: `Operador invalido: ${c.operator}`, status: 400 };
    }
  }
  idCounter++;
  const rule = {
    id: `RULE-${String(100 + idCounter).padStart(3, '0')}`,
    name, event, conditions, actions,
    active: true,
    priority: priority || mockRules.length + 1,
  };
  mockRules.push(rule);
  return { data: rule, status: 201 };
}

function evaluateConditions(conditions, data) {
  return conditions.every(c => {
    const val = data[c.field];
    switch (c.operator) {
      case '==': return val === c.value;
      case '!=': return val !== c.value;
      case '>=': return val >= c.value;
      case '<=': return val <= c.value;
      case '>': return val > c.value;
      case '<': return val < c.value;
      case 'contains': return String(val).includes(String(c.value));
      case 'not_contains': return !String(val).includes(String(c.value));
      default: return false;
    }
  });
}

function testRule(ruleId, testData) {
  const rule = mockRules.find(r => r.id === ruleId);
  if (!rule) return { error: 'Regla no encontrada', status: 404 };
  const matches = evaluateConditions(rule.conditions, testData);
  return { data: { rule_id: ruleId, matches, actions_would_fire: matches ? rule.actions : [] }, status: 200 };
}

function processRules(event, data) {
  const activeRules = mockRules.filter(r => r.event === event && r.active);
  activeRules.sort((a, b) => a.priority - b.priority);
  const firedActions = [];
  for (const rule of activeRules) {
    if (evaluateConditions(rule.conditions, data)) {
      firedActions.push(...rule.actions.map(a => ({ rule_id: rule.id, rule_name: rule.name, ...a })));
      mockAuditLog.push({ rule_id: rule.id, event, timestamp: new Date().toISOString(), data_snapshot: data });
    }
  }
  return { data: { event, rules_evaluated: activeRules.length, actions_fired: firedActions }, status: 200 };
}

function deleteRule(id) {
  const idx = mockRules.findIndex(r => r.id === id);
  if (idx === -1) return { error: 'Regla no encontrada', status: 404 };
  mockRules.splice(idx, 1);
  return { data: { deleted: true }, status: 200 };
}

function toggleRule(id) {
  const rule = mockRules.find(r => r.id === id);
  if (!rule) return { error: 'Regla no encontrada', status: 404 };
  rule.active = !rule.active;
  return { data: rule, status: 200 };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Listar todas las reglas',
    fn() {
      resetData();
      const result = listRules();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.total, 3);
      // Should be sorted by priority
      for (let i = 0; i < result.data.length - 1; i++) {
        assert.ok(result.data[i].priority <= result.data[i + 1].priority);
      }
    },
  },
  {
    name: 'Listar reglas filtradas por evento',
    fn() {
      resetData();
      const result = listRules({ event: 'siniestro.created' });
      assert.strictEqual(result.total, 3);
    },
  },
  {
    name: 'Listar solo reglas activas',
    fn() {
      resetData();
      const result = listRules({ active: true });
      assert.strictEqual(result.total, 2);
      result.data.forEach(r => assert.strictEqual(r.active, true));
    },
  },
  {
    name: 'Agregar regla con datos validos',
    fn() {
      resetData();
      const result = addRule({
        name: 'Nueva regla test',
        event: 'siniestro.updated',
        conditions: [{ field: 'estado', operator: '==', value: 'Cerrado' }],
        actions: [{ type: 'notify', target: 'admin' }],
      });
      assert.strictEqual(result.status, 201);
      assert.ok(result.data.id.startsWith('RULE-'));
      assert.strictEqual(result.data.active, true);
    },
  },
  {
    name: 'Agregar regla sin nombre falla',
    fn() {
      resetData();
      const result = addRule({ event: 'siniestro.created', conditions: [{ field: 'x', operator: '==', value: 1 }], actions: [{ type: 'notify' }] });
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Agregar regla con condiciones vacias falla',
    fn() {
      resetData();
      const result = addRule({ name: 'Test', event: 'siniestro.created', conditions: [], actions: [{ type: 'notify' }] });
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Agregar regla con operador invalido falla',
    fn() {
      resetData();
      const result = addRule({
        name: 'Test', event: 'siniestro.created',
        conditions: [{ field: 'x', operator: 'LIKE', value: 1 }],
        actions: [{ type: 'notify' }],
      });
      assert.strictEqual(result.status, 400);
      assert.ok(result.error.includes('Operador invalido'));
    },
  },
  {
    name: 'Evaluar condiciones == true',
    fn() {
      const result = evaluateConditions([{ field: 'tipo', operator: '==', value: 'coche' }], { tipo: 'coche' });
      assert.strictEqual(result, true);
    },
  },
  {
    name: 'Evaluar condiciones >= true',
    fn() {
      const result = evaluateConditions([{ field: 'urgencia', operator: '>=', value: 8 }], { urgencia: 9 });
      assert.strictEqual(result, true);
    },
  },
  {
    name: 'Evaluar condiciones multiples AND',
    fn() {
      const result = evaluateConditions([
        { field: 'tipo', operator: '==', value: 'coche' },
        { field: 'urgencia', operator: '>=', value: 8 },
      ], { tipo: 'coche', urgencia: 7 });
      assert.strictEqual(result, false);
    },
  },
  {
    name: 'Evaluar condicion contains',
    fn() {
      const result = evaluateConditions([{ field: 'descripcion', operator: 'contains', value: 'robo' }], { descripcion: 'Posible robo de vehiculo' });
      assert.strictEqual(result, true);
    },
  },
  {
    name: 'Test rule que coincide',
    fn() {
      resetData();
      const result = testRule('RULE-001', { score_fraude: 80 });
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.matches, true);
      assert.strictEqual(result.data.actions_would_fire.length, 1);
    },
  },
  {
    name: 'Test rule que no coincide',
    fn() {
      resetData();
      const result = testRule('RULE-001', { score_fraude: 30 });
      assert.strictEqual(result.data.matches, false);
      assert.strictEqual(result.data.actions_would_fire.length, 0);
    },
  },
  {
    name: 'Test rule inexistente falla',
    fn() {
      resetData();
      const result = testRule('RULE-999', {});
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'ProcessRules dispara acciones correctas',
    fn() {
      resetData();
      const result = processRules('siniestro.created', { score_fraude: 80, urgencia: 10, tipo: 'coche' });
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.rules_evaluated, 2); // only active rules
      assert.ok(result.data.actions_fired.length >= 2);
    },
  },
  {
    name: 'ProcessRules no dispara reglas inactivas',
    fn() {
      resetData();
      const result = processRules('siniestro.created', { tipo: 'hogar', score_fraude: 10, urgencia: 3 });
      // RULE-003 matches tipo==hogar but is inactive
      const hogarActions = result.data.actions_fired.filter(a => a.type === 'auto_assign');
      assert.strictEqual(hogarActions.length, 0);
    },
  },
  {
    name: 'Eliminar regla existente',
    fn() {
      resetData();
      const result = deleteRule('RULE-001');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(mockRules.length, 2);
    },
  },
  {
    name: 'Eliminar regla inexistente falla',
    fn() {
      resetData();
      const result = deleteRule('RULE-999');
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Toggle regla cambia estado',
    fn() {
      resetData();
      assert.strictEqual(mockRules.find(r => r.id === 'RULE-003').active, false);
      const result = toggleRule('RULE-003');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.active, true);
      const result2 = toggleRule('RULE-003');
      assert.strictEqual(result2.data.active, false);
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
