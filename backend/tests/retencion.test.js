// ============================================================
// RETENCION AGENT TEST SUITE
// Tests for retencionAgent: getClientesRiesgo, getEstadisticas,
// calcularDescuento, aplicarOferta, getHistorial
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');

// --------------- Mock retencion agent ---------------
let mockClientes = [];
let mockOfertas = [];

function resetData() {
  mockOfertas = [];
  mockClientes = [
    { id: 'CLI-001', nombre: 'Maria Garcia', antiguedad_anos: 5, polizas: 3, prima_total: 2500, siniestros_ultimo_ano: 0, score_retencion: 30, riesgo: 'alto', motivo_riesgo: 'Competidor ofrece menor precio' },
    { id: 'CLI-002', nombre: 'Carlos Lopez', antiguedad_anos: 2, polizas: 1, prima_total: 800, siniestros_ultimo_ano: 2, score_retencion: 55, riesgo: 'medio', motivo_riesgo: 'Insatisfaccion servicio' },
    { id: 'CLI-003', nombre: 'Laura Mendez', antiguedad_anos: 8, polizas: 4, prima_total: 4200, siniestros_ultimo_ano: 0, score_retencion: 20, riesgo: 'alto', motivo_riesgo: 'No renueva poliza hogar' },
    { id: 'CLI-004', nombre: 'Pedro Jimenez', antiguedad_anos: 1, polizas: 1, prima_total: 400, siniestros_ultimo_ano: 3, score_retencion: 70, riesgo: 'bajo', motivo_riesgo: null },
    { id: 'CLI-005', nombre: 'Ana Ruiz', antiguedad_anos: 3, polizas: 2, prima_total: 1600, siniestros_ultimo_ano: 1, score_retencion: 45, riesgo: 'medio', motivo_riesgo: 'Revision anual' },
  ];
}

function getClientesRiesgo({ riesgo, min_prima } = {}) {
  let results = [...mockClientes];
  if (riesgo) results = results.filter(c => c.riesgo === riesgo);
  if (min_prima) results = results.filter(c => c.prima_total >= parseInt(min_prima));
  results.sort((a, b) => a.score_retencion - b.score_retencion);
  return { data: results, total: results.length, status: 200 };
}

function getEstadisticas() {
  const total = mockClientes.length;
  const porRiesgo = { alto: 0, medio: 0, bajo: 0 };
  let primaEnRiesgo = 0;
  for (const c of mockClientes) {
    porRiesgo[c.riesgo] = (porRiesgo[c.riesgo] || 0) + 1;
    if (c.riesgo === 'alto') primaEnRiesgo += c.prima_total;
  }
  const scorePromedio = mockClientes.reduce((sum, c) => sum + c.score_retencion, 0) / total;

  return {
    data: {
      total_clientes_monitoreados: total,
      por_riesgo: porRiesgo,
      prima_en_riesgo: primaEnRiesgo,
      score_retencion_promedio: Math.round(scorePromedio),
      ofertas_activas: mockOfertas.filter(o => o.estado === 'pendiente').length,
    },
    status: 200,
  };
}

function calcularDescuento(clienteId) {
  const cliente = mockClientes.find(c => c.id === clienteId);
  if (!cliente) return { error: 'Cliente no encontrado', status: 404 };

  let descuento = 0;
  // Antiguedad: +2% per year, max 15%
  descuento += Math.min(cliente.antiguedad_anos * 2, 15);
  // Multi-poliza: +3% per extra policy
  descuento += Math.min((cliente.polizas - 1) * 3, 12);
  // Sin siniestros: +5%
  if (cliente.siniestros_ultimo_ano === 0) descuento += 5;
  // Alto riesgo bonus: +5%
  if (cliente.riesgo === 'alto') descuento += 5;
  // Cap at 30%
  descuento = Math.min(descuento, 30);

  const ahorro = Math.round(cliente.prima_total * descuento / 100);

  return {
    data: {
      cliente_id: clienteId,
      cliente_nombre: cliente.nombre,
      descuento_porcentaje: descuento,
      prima_actual: cliente.prima_total,
      prima_con_descuento: cliente.prima_total - ahorro,
      ahorro_anual: ahorro,
      factores: {
        antiguedad: Math.min(cliente.antiguedad_anos * 2, 15),
        multi_poliza: Math.min((cliente.polizas - 1) * 3, 12),
        sin_siniestros: cliente.siniestros_ultimo_ano === 0 ? 5 : 0,
        riesgo_alto: cliente.riesgo === 'alto' ? 5 : 0,
      },
    },
    status: 200,
  };
}

function aplicarOferta(clienteId, descuento, motivo) {
  if (!clienteId || descuento === undefined) return { error: 'cliente_id y descuento son requeridos', status: 400 };
  const cliente = mockClientes.find(c => c.id === clienteId);
  if (!cliente) return { error: 'Cliente no encontrado', status: 404 };
  if (descuento < 0 || descuento > 30) return { error: 'Descuento debe estar entre 0 y 30', status: 400 };

  const oferta = {
    id: `OFR-${String(mockOfertas.length + 1).padStart(3, '0')}`,
    cliente_id: clienteId,
    descuento,
    motivo: motivo || 'Retencion',
    estado: 'pendiente',
    fecha: new Date().toISOString(),
  };
  mockOfertas.push(oferta);
  return { data: oferta, status: 201 };
}

function getHistorial(clienteId) {
  if (!clienteId) return { error: 'cliente_id es requerido', status: 400 };
  const ofertas = mockOfertas.filter(o => o.cliente_id === clienteId);
  return { data: ofertas, total: ofertas.length, status: 200 };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Obtener clientes de alto riesgo',
    fn() {
      resetData();
      const result = getClientesRiesgo({ riesgo: 'alto' });
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.total, 2);
      result.data.forEach(c => assert.strictEqual(c.riesgo, 'alto'));
    },
  },
  {
    name: 'Clientes ordenados por score de retencion ascendente',
    fn() {
      resetData();
      const result = getClientesRiesgo();
      for (let i = 0; i < result.data.length - 1; i++) {
        assert.ok(result.data[i].score_retencion <= result.data[i + 1].score_retencion);
      }
    },
  },
  {
    name: 'Filtrar clientes por prima minima',
    fn() {
      resetData();
      const result = getClientesRiesgo({ min_prima: '2000' });
      result.data.forEach(c => assert.ok(c.prima_total >= 2000));
    },
  },
  {
    name: 'Estadisticas de retencion',
    fn() {
      resetData();
      const result = getEstadisticas();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.total_clientes_monitoreados, 5);
      assert.strictEqual(result.data.por_riesgo.alto, 2);
      assert.strictEqual(result.data.por_riesgo.medio, 2);
      assert.strictEqual(result.data.por_riesgo.bajo, 1);
      assert.ok(result.data.prima_en_riesgo > 0);
    },
  },
  {
    name: 'Calcular descuento cliente antiguo con multi-poliza',
    fn() {
      resetData();
      const result = calcularDescuento('CLI-003');
      assert.strictEqual(result.status, 200);
      assert.ok(result.data.descuento_porcentaje > 0);
      assert.ok(result.data.descuento_porcentaje <= 30);
      assert.ok(result.data.ahorro_anual > 0);
      assert.ok(result.data.factores.antiguedad > 0);
      assert.ok(result.data.factores.multi_poliza > 0);
      assert.strictEqual(result.data.factores.sin_siniestros, 5);
    },
  },
  {
    name: 'Calcular descuento cliente con siniestros no recibe bonus sin-siniestros',
    fn() {
      resetData();
      const result = calcularDescuento('CLI-002');
      assert.strictEqual(result.data.factores.sin_siniestros, 0);
    },
  },
  {
    name: 'Calcular descuento cliente inexistente falla',
    fn() {
      resetData();
      const result = calcularDescuento('CLI-999');
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Aplicar oferta de retencion',
    fn() {
      resetData();
      const result = aplicarOferta('CLI-001', 15, 'Competidor ofrece menos');
      assert.strictEqual(result.status, 201);
      assert.ok(result.data.id.startsWith('OFR-'));
      assert.strictEqual(result.data.estado, 'pendiente');
    },
  },
  {
    name: 'Aplicar oferta con descuento excesivo falla',
    fn() {
      resetData();
      const result = aplicarOferta('CLI-001', 35);
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Aplicar oferta cliente inexistente falla',
    fn() {
      resetData();
      const result = aplicarOferta('CLI-999', 10);
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Obtener historial de ofertas',
    fn() {
      resetData();
      aplicarOferta('CLI-001', 10, 'Primera oferta');
      aplicarOferta('CLI-001', 15, 'Segunda oferta');
      aplicarOferta('CLI-002', 8, 'Otra oferta');
      const result = getHistorial('CLI-001');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.total, 2);
    },
  },
  {
    name: 'Historial sin cliente_id falla',
    fn() {
      resetData();
      const result = getHistorial(null);
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
