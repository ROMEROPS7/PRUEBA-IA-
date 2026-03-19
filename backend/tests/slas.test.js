// ============================================================
// SLA TEST SUITE
// Tests for slaService: listSLAs, checkSLA, addSLA, getSLADashboard
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');

// --------------- Mock SLA service ---------------
let mockSLAs = [];
let mockSiniestros = [];
let idCounter = 0;

function resetData() {
  idCounter = 0;
  mockSLAs = [
    { id: 'SLA-001', name: 'Respuesta inicial', tipo_siniestro: 'coche', max_hours: 4, escalation_target: 'supervisor', active: true },
    { id: 'SLA-002', name: 'Asignacion perito', tipo_siniestro: 'coche', max_hours: 24, escalation_target: 'manager', active: true },
    { id: 'SLA-003', name: 'Resolucion hogar', tipo_siniestro: 'hogar', max_hours: 72, escalation_target: 'director', active: true },
    { id: 'SLA-004', name: 'Respuesta salud', tipo_siniestro: 'salud', max_hours: 2, escalation_target: 'urgencias', active: false },
  ];
  mockSiniestros = [
    { id: 'SIN-001', tipo: 'coche', estado: 'Abierto', fecha_creacion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), perito_id: null },
    { id: 'SIN-002', tipo: 'coche', estado: 'Abierto', fecha_creacion: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), perito_id: null },
    { id: 'SIN-003', tipo: 'hogar', estado: 'En gestion', fecha_creacion: new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString(), perito_id: 'AGT-001' },
    { id: 'SIN-004', tipo: 'coche', estado: 'Resuelto', fecha_creacion: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), perito_id: 'AGT-002' },
  ];
}

function listSLAs({ tipo_siniestro, active } = {}) {
  let results = [...mockSLAs];
  if (tipo_siniestro) results = results.filter(s => s.tipo_siniestro === tipo_siniestro);
  if (active !== undefined) results = results.filter(s => s.active === (active === true || active === 'true'));
  return { data: results, total: results.length, status: 200 };
}

function checkSLA(siniestroId) {
  const siniestro = mockSiniestros.find(s => s.id === siniestroId);
  if (!siniestro) return { error: 'Siniestro no encontrado', status: 404 };

  const applicableSLAs = mockSLAs.filter(s => s.tipo_siniestro === siniestro.tipo && s.active);
  const hoursElapsed = (Date.now() - new Date(siniestro.fecha_creacion).getTime()) / (1000 * 60 * 60);

  const violations = [];
  const warnings = [];
  for (const sla of applicableSLAs) {
    const remaining = sla.max_hours - hoursElapsed;
    if (remaining < 0) {
      violations.push({ sla_id: sla.id, sla_name: sla.name, exceeded_by_hours: Math.abs(remaining).toFixed(1), escalation_target: sla.escalation_target });
    } else if (remaining < sla.max_hours * 0.2) {
      warnings.push({ sla_id: sla.id, sla_name: sla.name, remaining_hours: remaining.toFixed(1) });
    }
  }

  return {
    data: {
      siniestro_id: siniestroId,
      hours_elapsed: hoursElapsed.toFixed(1),
      violations,
      warnings,
      compliant: violations.length === 0,
    },
    status: 200,
  };
}

function addSLA({ name, tipo_siniestro, max_hours, escalation_target }) {
  if (!name || !tipo_siniestro || !max_hours) {
    return { error: 'name, tipo_siniestro y max_hours son requeridos', status: 400 };
  }
  if (typeof max_hours !== 'number' || max_hours <= 0) {
    return { error: 'max_hours debe ser un numero positivo', status: 400 };
  }
  idCounter++;
  const sla = {
    id: `SLA-${String(100 + idCounter).padStart(3, '0')}`,
    name, tipo_siniestro, max_hours,
    escalation_target: escalation_target || 'supervisor',
    active: true,
  };
  mockSLAs.push(sla);
  return { data: sla, status: 201 };
}

function getSLADashboard() {
  const activeSLAs = mockSLAs.filter(s => s.active);
  const openSiniestros = mockSiniestros.filter(s => s.estado !== 'Resuelto' && s.estado !== 'Cerrado');
  let totalViolations = 0;
  let totalWarnings = 0;
  let totalCompliant = 0;

  for (const sin of openSiniestros) {
    const check = checkSLA(sin.id);
    if (check.data) {
      totalViolations += check.data.violations.length;
      totalWarnings += check.data.warnings.length;
      if (check.data.compliant) totalCompliant++;
    }
  }

  return {
    data: {
      total_slas: activeSLAs.length,
      open_siniestros: openSiniestros.length,
      violations: totalViolations,
      warnings: totalWarnings,
      compliant: totalCompliant,
      compliance_rate: openSiniestros.length > 0 ? ((totalCompliant / openSiniestros.length) * 100).toFixed(1) : '100.0',
    },
    status: 200,
  };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Listar todos los SLAs',
    fn() {
      resetData();
      const result = listSLAs();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.total, 4);
    },
  },
  {
    name: 'Listar SLAs filtrados por tipo',
    fn() {
      resetData();
      const result = listSLAs({ tipo_siniestro: 'coche' });
      assert.strictEqual(result.total, 2);
      result.data.forEach(s => assert.strictEqual(s.tipo_siniestro, 'coche'));
    },
  },
  {
    name: 'Listar solo SLAs activos',
    fn() {
      resetData();
      const result = listSLAs({ active: true });
      assert.strictEqual(result.total, 3);
    },
  },
  {
    name: 'Check SLA siniestro dentro de tiempo',
    fn() {
      resetData();
      const result = checkSLA('SIN-001'); // 2 hours old, SLA is 4h
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.compliant, true);
      assert.strictEqual(result.data.violations.length, 0);
    },
  },
  {
    name: 'Check SLA siniestro con violacion',
    fn() {
      resetData();
      const result = checkSLA('SIN-002'); // 6 hours old, SLA respuesta inicial is 4h
      assert.strictEqual(result.status, 200);
      assert.ok(result.data.violations.length > 0);
      assert.strictEqual(result.data.compliant, false);
    },
  },
  {
    name: 'Check SLA siniestro inexistente falla',
    fn() {
      resetData();
      const result = checkSLA('SIN-999');
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Agregar SLA con datos validos',
    fn() {
      resetData();
      const result = addSLA({ name: 'Resolucion rapida', tipo_siniestro: 'robo', max_hours: 48, escalation_target: 'director' });
      assert.strictEqual(result.status, 201);
      assert.ok(result.data.id.startsWith('SLA-'));
      assert.strictEqual(result.data.active, true);
      assert.strictEqual(result.data.max_hours, 48);
    },
  },
  {
    name: 'Agregar SLA sin nombre falla',
    fn() {
      resetData();
      const result = addSLA({ tipo_siniestro: 'coche', max_hours: 24 });
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Agregar SLA con max_hours negativo falla',
    fn() {
      resetData();
      const result = addSLA({ name: 'Test', tipo_siniestro: 'coche', max_hours: -5 });
      assert.strictEqual(result.status, 400);
      assert.ok(result.error.includes('positivo'));
    },
  },
  {
    name: 'Dashboard SLA devuelve metricas',
    fn() {
      resetData();
      const result = getSLADashboard();
      assert.strictEqual(result.status, 200);
      assert.ok(result.data.total_slas > 0);
      assert.ok(result.data.open_siniestros > 0);
      assert.ok(result.data.compliance_rate !== undefined);
      assert.ok(parseFloat(result.data.compliance_rate) >= 0);
      assert.ok(parseFloat(result.data.compliance_rate) <= 100);
    },
  },
  {
    name: 'Dashboard detecta violaciones existentes',
    fn() {
      resetData();
      const result = getSLADashboard();
      assert.ok(result.data.violations > 0, 'Debe haber al menos una violacion');
    },
  },
  {
    name: 'SLA escalation target por defecto es supervisor',
    fn() {
      resetData();
      const result = addSLA({ name: 'Sin escalation', tipo_siniestro: 'otro', max_hours: 12 });
      assert.strictEqual(result.data.escalation_target, 'supervisor');
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
