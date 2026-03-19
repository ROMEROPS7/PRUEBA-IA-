// ============================================================
// VENDEDOR AGENT TEST SUITE
// Tests for vendedorAgent: getPipeline, getVentasMes, getConversion, getRenovaciones
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');

// --------------- Mock vendedor agent ---------------
let mockPipeline = [];
let mockVentas = [];
let mockRenovaciones = [];

function resetData() {
  mockPipeline = [
    { id: 'OPP-001', cliente: 'Maria Garcia', producto: 'Auto Premium', valor: 1200, etapa: 'contacto', probabilidad: 20, fecha: '2024-03-01' },
    { id: 'OPP-002', cliente: 'Carlos Lopez', producto: 'Hogar Plus', valor: 800, etapa: 'propuesta', probabilidad: 60, fecha: '2024-03-05' },
    { id: 'OPP-003', cliente: 'Laura Mendez', producto: 'Vida Total', valor: 2000, etapa: 'negociacion', probabilidad: 80, fecha: '2024-03-10' },
    { id: 'OPP-004', cliente: 'Pedro Jimenez', producto: 'Auto Basico', valor: 600, etapa: 'cerrada_ganada', probabilidad: 100, fecha: '2024-03-12' },
    { id: 'OPP-005', cliente: 'Elena Torres', producto: 'Comercio', valor: 3000, etapa: 'cerrada_perdida', probabilidad: 0, fecha: '2024-03-15' },
    { id: 'OPP-006', cliente: 'Ana Ruiz', producto: 'Salud Familiar', valor: 1500, etapa: 'propuesta', probabilidad: 50, fecha: '2024-03-18' },
  ];
  mockVentas = [
    { mes: '2024-01', total: 15000, polizas: 12, prima_media: 1250 },
    { mes: '2024-02', total: 18000, polizas: 15, prima_media: 1200 },
    { mes: '2024-03', total: 22000, polizas: 18, prima_media: 1222 },
  ];
  mockRenovaciones = [
    { id: 'REN-001', cliente: 'Jose Martinez', poliza: 'POL-100', vencimiento: '2024-04-01', prima_actual: 900, estado: 'pendiente' },
    { id: 'REN-002', cliente: 'Sofia Navarro', poliza: 'POL-101', vencimiento: '2024-04-15', prima_actual: 1100, estado: 'pendiente' },
    { id: 'REN-003', cliente: 'Diego Herrera', poliza: 'POL-102', vencimiento: '2024-03-20', prima_actual: 750, estado: 'renovada' },
    { id: 'REN-004', cliente: 'Carmen Diaz', poliza: 'POL-103', vencimiento: '2024-03-25', prima_actual: 1300, estado: 'perdida' },
    { id: 'REN-005', cliente: 'Luis Moreno', poliza: 'POL-104', vencimiento: '2024-04-30', prima_actual: 650, estado: 'pendiente' },
  ];
}

function getPipeline({ etapa, min_valor } = {}) {
  let results = [...mockPipeline];
  if (etapa) results = results.filter(o => o.etapa === etapa);
  if (min_valor) results = results.filter(o => o.valor >= parseInt(min_valor));
  const valorTotal = results.reduce((sum, o) => sum + o.valor, 0);
  const valorPonderado = results.reduce((sum, o) => sum + o.valor * (o.probabilidad / 100), 0);
  return {
    data: {
      oportunidades: results,
      total: results.length,
      valor_total: valorTotal,
      valor_ponderado: Math.round(valorPonderado),
    },
    status: 200,
  };
}

function getVentasMes(mes) {
  if (!mes) {
    return { data: mockVentas, status: 200 };
  }
  const venta = mockVentas.find(v => v.mes === mes);
  if (!venta) return { error: 'No hay datos para ese mes', status: 404 };
  return { data: venta, status: 200 };
}

function getConversion() {
  const total = mockPipeline.length;
  const ganadas = mockPipeline.filter(o => o.etapa === 'cerrada_ganada').length;
  const perdidas = mockPipeline.filter(o => o.etapa === 'cerrada_perdida').length;
  const abiertas = total - ganadas - perdidas;
  const tasaConversion = total > 0 ? ((ganadas / total) * 100).toFixed(1) : '0.0';

  const etapas = {};
  for (const o of mockPipeline) {
    etapas[o.etapa] = (etapas[o.etapa] || 0) + 1;
  }

  return {
    data: {
      total_oportunidades: total,
      ganadas, perdidas, abiertas,
      tasa_conversion: parseFloat(tasaConversion),
      distribucion_etapas: etapas,
    },
    status: 200,
  };
}

function getRenovaciones({ estado, orden } = {}) {
  let results = [...mockRenovaciones];
  if (estado) results = results.filter(r => r.estado === estado);
  if (orden === 'vencimiento') results.sort((a, b) => new Date(a.vencimiento) - new Date(b.vencimiento));
  else if (orden === 'prima') results.sort((a, b) => b.prima_actual - a.prima_actual);

  const pendientes = mockRenovaciones.filter(r => r.estado === 'pendiente');
  const renovadas = mockRenovaciones.filter(r => r.estado === 'renovada');
  const perdidas = mockRenovaciones.filter(r => r.estado === 'perdida');
  const tasaRetencion = (renovadas.length + pendientes.length) > 0
    ? ((renovadas.length / (renovadas.length + perdidas.length)) * 100).toFixed(1) : '0.0';

  return {
    data: {
      renovaciones: results,
      total: results.length,
      pendientes: pendientes.length,
      renovadas: renovadas.length,
      perdidas: perdidas.length,
      tasa_retencion: parseFloat(tasaRetencion),
      prima_en_riesgo: pendientes.reduce((sum, r) => sum + r.prima_actual, 0),
    },
    status: 200,
  };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Obtener pipeline completo',
    fn() {
      resetData();
      const result = getPipeline();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.total, 6);
      assert.ok(result.data.valor_total > 0);
      assert.ok(result.data.valor_ponderado > 0);
      assert.ok(result.data.valor_ponderado <= result.data.valor_total);
    },
  },
  {
    name: 'Filtrar pipeline por etapa',
    fn() {
      resetData();
      const result = getPipeline({ etapa: 'propuesta' });
      assert.strictEqual(result.data.total, 2);
      result.data.oportunidades.forEach(o => assert.strictEqual(o.etapa, 'propuesta'));
    },
  },
  {
    name: 'Filtrar pipeline por valor minimo',
    fn() {
      resetData();
      const result = getPipeline({ min_valor: '1500' });
      result.data.oportunidades.forEach(o => assert.ok(o.valor >= 1500));
    },
  },
  {
    name: 'Obtener todas las ventas mensuales',
    fn() {
      resetData();
      const result = getVentasMes();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.length, 3);
    },
  },
  {
    name: 'Obtener ventas de un mes especifico',
    fn() {
      resetData();
      const result = getVentasMes('2024-03');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.total, 22000);
      assert.strictEqual(result.data.polizas, 18);
    },
  },
  {
    name: 'Ventas de mes inexistente falla',
    fn() {
      resetData();
      const result = getVentasMes('2024-12');
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Calcular tasa de conversion',
    fn() {
      resetData();
      const result = getConversion();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.total_oportunidades, 6);
      assert.strictEqual(result.data.ganadas, 1);
      assert.strictEqual(result.data.perdidas, 1);
      assert.strictEqual(result.data.abiertas, 4);
      assert.ok(result.data.tasa_conversion > 0);
      assert.ok(result.data.tasa_conversion < 100);
    },
  },
  {
    name: 'Distribucion de etapas en conversion',
    fn() {
      resetData();
      const result = getConversion();
      const dist = result.data.distribucion_etapas;
      assert.strictEqual(dist.contacto, 1);
      assert.strictEqual(dist.propuesta, 2);
      assert.strictEqual(dist.negociacion, 1);
      assert.strictEqual(dist.cerrada_ganada, 1);
      assert.strictEqual(dist.cerrada_perdida, 1);
    },
  },
  {
    name: 'Obtener todas las renovaciones',
    fn() {
      resetData();
      const result = getRenovaciones();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.total, 5);
      assert.strictEqual(result.data.pendientes, 3);
      assert.strictEqual(result.data.renovadas, 1);
      assert.strictEqual(result.data.perdidas, 1);
      assert.ok(result.data.prima_en_riesgo > 0);
    },
  },
  {
    name: 'Filtrar renovaciones pendientes',
    fn() {
      resetData();
      const result = getRenovaciones({ estado: 'pendiente' });
      assert.strictEqual(result.data.total, 3);
      result.data.renovaciones.forEach(r => assert.strictEqual(r.estado, 'pendiente'));
    },
  },
  {
    name: 'Ordenar renovaciones por vencimiento',
    fn() {
      resetData();
      const result = getRenovaciones({ orden: 'vencimiento' });
      for (let i = 0; i < result.data.renovaciones.length - 1; i++) {
        assert.ok(new Date(result.data.renovaciones[i].vencimiento) <= new Date(result.data.renovaciones[i + 1].vencimiento));
      }
    },
  },
  {
    name: 'Tasa de retencion calculada correctamente',
    fn() {
      resetData();
      const result = getRenovaciones();
      assert.ok(result.data.tasa_retencion > 0);
      assert.ok(result.data.tasa_retencion <= 100);
      // 1 renovada / (1 renovada + 1 perdida) = 50%
      assert.strictEqual(result.data.tasa_retencion, 50.0);
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
