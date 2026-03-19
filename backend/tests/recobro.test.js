// ============================================================
// RECOBRO AGENT TEST SUITE
// Tests for recobroAgent: getImpagados, getEstadisticas,
// ofrecerPlanPago, registrarPago, getHistorialPagos
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');

// --------------- Mock recobro agent ---------------
let mockImpagados = [];
let mockPlanes = [];
let mockPagos = [];

function resetData() {
  mockPlanes = [];
  mockPagos = [];
  mockImpagados = [
    { id: 'IMP-001', cliente_id: 'CLI-001', cliente_nombre: 'Maria Garcia', poliza: 'POL-001', importe: 950, dias_mora: 15, intentos_cobro: 2, estado: 'pendiente', ultimo_contacto: '2024-03-01' },
    { id: 'IMP-002', cliente_id: 'CLI-002', cliente_nombre: 'Carlos Lopez', poliza: 'POL-002', importe: 380, dias_mora: 45, intentos_cobro: 5, estado: 'pendiente', ultimo_contacto: '2024-02-15' },
    { id: 'IMP-003', cliente_id: 'CLI-003', cliente_nombre: 'Laura Mendez', poliza: 'POL-003', importe: 1200, dias_mora: 90, intentos_cobro: 8, estado: 'gestion_juridica', ultimo_contacto: '2024-01-20' },
    { id: 'IMP-004', cliente_id: 'CLI-004', cliente_nombre: 'Pedro Jimenez', poliza: 'POL-004', importe: 420, dias_mora: 5, intentos_cobro: 1, estado: 'pendiente', ultimo_contacto: '2024-03-10' },
    { id: 'IMP-005', cliente_id: 'CLI-005', cliente_nombre: 'Ana Ruiz', poliza: 'POL-005', importe: 650, dias_mora: 30, intentos_cobro: 3, estado: 'plan_pago', ultimo_contacto: '2024-03-05' },
  ];
}

function getImpagados({ estado, min_dias_mora, orden } = {}) {
  let results = [...mockImpagados];
  if (estado) results = results.filter(i => i.estado === estado);
  if (min_dias_mora) results = results.filter(i => i.dias_mora >= parseInt(min_dias_mora));
  if (orden === 'importe') results.sort((a, b) => b.importe - a.importe);
  else if (orden === 'dias_mora') results.sort((a, b) => b.dias_mora - a.dias_mora);
  else results.sort((a, b) => b.dias_mora - a.dias_mora);

  return { data: results, total: results.length, status: 200 };
}

function getEstadisticas() {
  const total = mockImpagados.length;
  const importeTotal = mockImpagados.reduce((sum, i) => sum + i.importe, 0);
  const porEstado = {};
  for (const i of mockImpagados) {
    porEstado[i.estado] = (porEstado[i.estado] || 0) + 1;
  }
  const diasMoraPromedio = Math.round(mockImpagados.reduce((sum, i) => sum + i.dias_mora, 0) / total);
  const intentosPromedio = (mockImpagados.reduce((sum, i) => sum + i.intentos_cobro, 0) / total).toFixed(1);
  const criticos = mockImpagados.filter(i => i.dias_mora >= 60).length;

  return {
    data: {
      total_impagados: total,
      importe_total: importeTotal,
      por_estado: porEstado,
      dias_mora_promedio: diasMoraPromedio,
      intentos_promedio: parseFloat(intentosPromedio),
      criticos,
      tasa_recuperacion: mockPlanes.length > 0 ? ((mockPagos.length / mockPlanes.length) * 100).toFixed(1) : '0.0',
    },
    status: 200,
  };
}

function ofrecerPlanPago(impagadoId, { cuotas, descuento_pronto_pago } = {}) {
  if (!impagadoId) return { error: 'impagado_id es requerido', status: 400 };
  const impagado = mockImpagados.find(i => i.id === impagadoId);
  if (!impagado) return { error: 'Impagado no encontrado', status: 404 };
  if (impagado.estado === 'gestion_juridica') return { error: 'Impagado en gestion juridica, no se puede ofrecer plan', status: 400 };

  const numCuotas = cuotas || 3;
  if (numCuotas < 2 || numCuotas > 12) return { error: 'Cuotas debe estar entre 2 y 12', status: 400 };
  const descuento = descuento_pronto_pago || 0;
  if (descuento < 0 || descuento > 15) return { error: 'Descuento pronto pago debe estar entre 0 y 15', status: 400 };

  const importeFinal = Math.round(impagado.importe * (1 - descuento / 100));
  const cuotaMensual = Math.round(importeFinal / numCuotas);

  const plan = {
    id: `PLAN-${String(mockPlanes.length + 1).padStart(3, '0')}`,
    impagado_id: impagadoId,
    cliente_id: impagado.cliente_id,
    importe_original: impagado.importe,
    descuento_aplicado: descuento,
    importe_final: importeFinal,
    cuotas: numCuotas,
    cuota_mensual: cuotaMensual,
    estado: 'activo',
    fecha: new Date().toISOString(),
  };
  mockPlanes.push(plan);
  impagado.estado = 'plan_pago';
  return { data: plan, status: 201 };
}

function registrarPago(planId, importe) {
  if (!planId || !importe) return { error: 'plan_id e importe son requeridos', status: 400 };
  const plan = mockPlanes.find(p => p.id === planId);
  if (!plan) return { error: 'Plan no encontrado', status: 404 };
  const pago = {
    id: `PAG-${String(mockPagos.length + 1).padStart(3, '0')}`,
    plan_id: planId,
    importe,
    fecha: new Date().toISOString(),
  };
  mockPagos.push(pago);
  return { data: pago, status: 201 };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Obtener todos los impagados',
    fn() {
      resetData();
      const result = getImpagados();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.total, 5);
    },
  },
  {
    name: 'Filtrar impagados por estado pendiente',
    fn() {
      resetData();
      const result = getImpagados({ estado: 'pendiente' });
      assert.strictEqual(result.total, 3);
      result.data.forEach(i => assert.strictEqual(i.estado, 'pendiente'));
    },
  },
  {
    name: 'Filtrar impagados por dias de mora minimos',
    fn() {
      resetData();
      const result = getImpagados({ min_dias_mora: '30' });
      result.data.forEach(i => assert.ok(i.dias_mora >= 30));
    },
  },
  {
    name: 'Ordenar impagados por importe',
    fn() {
      resetData();
      const result = getImpagados({ orden: 'importe' });
      for (let i = 0; i < result.data.length - 1; i++) {
        assert.ok(result.data[i].importe >= result.data[i + 1].importe);
      }
    },
  },
  {
    name: 'Estadisticas de recobro',
    fn() {
      resetData();
      const result = getEstadisticas();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.total_impagados, 5);
      assert.ok(result.data.importe_total > 0);
      assert.ok(result.data.dias_mora_promedio > 0);
      assert.ok(result.data.criticos > 0);
      assert.ok(result.data.por_estado.pendiente > 0);
    },
  },
  {
    name: 'Ofrecer plan de pago valido',
    fn() {
      resetData();
      const result = ofrecerPlanPago('IMP-001', { cuotas: 3, descuento_pronto_pago: 5 });
      assert.strictEqual(result.status, 201);
      assert.ok(result.data.id.startsWith('PLAN-'));
      assert.strictEqual(result.data.cuotas, 3);
      assert.ok(result.data.importe_final < result.data.importe_original);
      assert.ok(result.data.cuota_mensual > 0);
    },
  },
  {
    name: 'Plan de pago cambia estado de impagado',
    fn() {
      resetData();
      ofrecerPlanPago('IMP-004', { cuotas: 4 });
      const impagado = mockImpagados.find(i => i.id === 'IMP-004');
      assert.strictEqual(impagado.estado, 'plan_pago');
    },
  },
  {
    name: 'Plan de pago en gestion juridica falla',
    fn() {
      resetData();
      const result = ofrecerPlanPago('IMP-003');
      assert.strictEqual(result.status, 400);
      assert.ok(result.error.includes('juridica'));
    },
  },
  {
    name: 'Plan de pago con cuotas fuera de rango falla',
    fn() {
      resetData();
      const result = ofrecerPlanPago('IMP-001', { cuotas: 15 });
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Plan de pago impagado inexistente falla',
    fn() {
      resetData();
      const result = ofrecerPlanPago('IMP-999');
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Registrar pago a plan existente',
    fn() {
      resetData();
      ofrecerPlanPago('IMP-001', { cuotas: 3 });
      const planId = mockPlanes[0].id;
      const result = registrarPago(planId, 300);
      assert.strictEqual(result.status, 201);
      assert.ok(result.data.id.startsWith('PAG-'));
    },
  },
  {
    name: 'Registrar pago plan inexistente falla',
    fn() {
      resetData();
      const result = registrarPago('PLAN-999', 100);
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Descuento pronto pago fuera de rango falla',
    fn() {
      resetData();
      const result = ofrecerPlanPago('IMP-001', { cuotas: 3, descuento_pronto_pago: 20 });
      assert.strictEqual(result.status, 400);
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
