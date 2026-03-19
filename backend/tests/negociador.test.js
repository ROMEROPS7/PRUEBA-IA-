// ============================================================
// NEGOCIADOR AGENT TEST SUITE
// Tests for negociadorAgent: getProveedores, getRankingProveedores,
// getAhorroTotal, simulateNegotiation
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');

// --------------- Mock negociador agent ---------------
let mockProveedores = [];

function resetData() {
  mockProveedores = [
    { id: 'PROV-001', nombre: 'TallerPro Madrid', tipo: 'taller', zona: 'Madrid', precio_medio: 850, calidad: 4.5, tiempo_medio_dias: 3, negociaciones: 12, descuento_actual: 15, activo: true },
    { id: 'PROV-002', nombre: 'CristaleriaExpress', tipo: 'cristaleria', zona: 'Madrid', precio_medio: 320, calidad: 4.2, tiempo_medio_dias: 1, negociaciones: 8, descuento_actual: 10, activo: true },
    { id: 'PROV-003', nombre: 'Fontaneria Rapida', tipo: 'fontaneria', zona: 'Barcelona', precio_medio: 450, calidad: 4.7, tiempo_medio_dias: 2, negociaciones: 15, descuento_actual: 20, activo: true },
    { id: 'PROV-004', nombre: 'ElectroHogar', tipo: 'electricidad', zona: 'Valencia', precio_medio: 280, calidad: 3.9, tiempo_medio_dias: 2, negociaciones: 5, descuento_actual: 5, activo: false },
    { id: 'PROV-005', nombre: 'PinturaTotal', tipo: 'pintura', zona: 'Madrid', precio_medio: 600, calidad: 4.0, tiempo_medio_dias: 4, negociaciones: 7, descuento_actual: 12, activo: true },
  ];
}

function getProveedores({ tipo, zona, activo } = {}) {
  let results = [...mockProveedores];
  if (tipo) results = results.filter(p => p.tipo === tipo);
  if (zona) results = results.filter(p => p.zona === zona);
  if (activo !== undefined) results = results.filter(p => p.activo === (activo === true || activo === 'true'));
  return { data: results, total: results.length, status: 200 };
}

function getRankingProveedores({ criterio } = {}) {
  const activos = mockProveedores.filter(p => p.activo);
  let sorted;
  switch (criterio) {
    case 'precio': sorted = [...activos].sort((a, b) => a.precio_medio - b.precio_medio); break;
    case 'calidad': sorted = [...activos].sort((a, b) => b.calidad - a.calidad); break;
    case 'tiempo': sorted = [...activos].sort((a, b) => a.tiempo_medio_dias - b.tiempo_medio_dias); break;
    case 'descuento': sorted = [...activos].sort((a, b) => b.descuento_actual - a.descuento_actual); break;
    default: sorted = [...activos].sort((a, b) => (b.calidad * 0.4 + b.descuento_actual * 0.3 + (1 / b.tiempo_medio_dias) * 0.3) - (a.calidad * 0.4 + a.descuento_actual * 0.3 + (1 / a.tiempo_medio_dias) * 0.3));
  }
  return { data: sorted.map((p, i) => ({ ...p, ranking: i + 1 })), status: 200 };
}

function getAhorroTotal() {
  const activos = mockProveedores.filter(p => p.activo);
  const totalSinDescuento = activos.reduce((sum, p) => sum + p.precio_medio * p.negociaciones, 0);
  const totalConDescuento = activos.reduce((sum, p) => sum + p.precio_medio * p.negociaciones * (1 - p.descuento_actual / 100), 0);
  const ahorro = totalSinDescuento - totalConDescuento;

  return {
    data: {
      total_sin_descuento: totalSinDescuento,
      total_con_descuento: Math.round(totalConDescuento),
      ahorro_total: Math.round(ahorro),
      porcentaje_ahorro: ((ahorro / totalSinDescuento) * 100).toFixed(1),
      proveedores_activos: activos.length,
      total_negociaciones: activos.reduce((sum, p) => sum + p.negociaciones, 0),
    },
    status: 200,
  };
}

function simulateNegotiation({ proveedor_id, descuento_propuesto, volumen }) {
  if (!proveedor_id || descuento_propuesto === undefined) {
    return { error: 'proveedor_id y descuento_propuesto son requeridos', status: 400 };
  }
  const proveedor = mockProveedores.find(p => p.id === proveedor_id);
  if (!proveedor) return { error: 'Proveedor no encontrado', status: 404 };
  if (!proveedor.activo) return { error: 'Proveedor inactivo', status: 400 };
  if (descuento_propuesto < 0 || descuento_propuesto > 50) {
    return { error: 'Descuento debe estar entre 0 y 50', status: 400 };
  }

  // Simulate acceptance probability
  const diff = descuento_propuesto - proveedor.descuento_actual;
  let probabilidad;
  if (diff <= 0) probabilidad = 95;
  else if (diff <= 5) probabilidad = 80;
  else if (diff <= 10) probabilidad = 50;
  else if (diff <= 15) probabilidad = 25;
  else probabilidad = 10;

  if (volumen && volumen > 10) probabilidad = Math.min(probabilidad + 10, 99);

  const precioOriginal = proveedor.precio_medio * (volumen || 1);
  const precioNegociado = precioOriginal * (1 - descuento_propuesto / 100);

  return {
    data: {
      proveedor: proveedor.nombre,
      descuento_actual: proveedor.descuento_actual,
      descuento_propuesto: descuento_propuesto,
      probabilidad_aceptacion: probabilidad,
      precio_original: precioOriginal,
      precio_negociado: Math.round(precioNegociado),
      ahorro_estimado: Math.round(precioOriginal - precioNegociado),
    },
    status: 200,
  };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Obtener todos los proveedores',
    fn() {
      resetData();
      const result = getProveedores();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.total, 5);
    },
  },
  {
    name: 'Filtrar proveedores por tipo',
    fn() {
      resetData();
      const result = getProveedores({ tipo: 'taller' });
      assert.strictEqual(result.total, 1);
      assert.strictEqual(result.data[0].nombre, 'TallerPro Madrid');
    },
  },
  {
    name: 'Filtrar proveedores por zona',
    fn() {
      resetData();
      const result = getProveedores({ zona: 'Madrid' });
      assert.strictEqual(result.total, 3);
    },
  },
  {
    name: 'Filtrar proveedores activos',
    fn() {
      resetData();
      const result = getProveedores({ activo: true });
      assert.strictEqual(result.total, 4);
    },
  },
  {
    name: 'Ranking por precio ascendente',
    fn() {
      resetData();
      const result = getRankingProveedores({ criterio: 'precio' });
      assert.strictEqual(result.status, 200);
      for (let i = 0; i < result.data.length - 1; i++) {
        assert.ok(result.data[i].precio_medio <= result.data[i + 1].precio_medio);
      }
      assert.strictEqual(result.data[0].ranking, 1);
    },
  },
  {
    name: 'Ranking por calidad descendente',
    fn() {
      resetData();
      const result = getRankingProveedores({ criterio: 'calidad' });
      for (let i = 0; i < result.data.length - 1; i++) {
        assert.ok(result.data[i].calidad >= result.data[i + 1].calidad);
      }
    },
  },
  {
    name: 'Ranking excluye proveedores inactivos',
    fn() {
      resetData();
      const result = getRankingProveedores();
      assert.strictEqual(result.data.length, 4);
      result.data.forEach(p => assert.strictEqual(p.activo, true));
    },
  },
  {
    name: 'Ahorro total calculado correctamente',
    fn() {
      resetData();
      const result = getAhorroTotal();
      assert.strictEqual(result.status, 200);
      assert.ok(result.data.ahorro_total > 0);
      assert.ok(result.data.total_sin_descuento > result.data.total_con_descuento);
      assert.ok(parseFloat(result.data.porcentaje_ahorro) > 0);
      assert.strictEqual(result.data.proveedores_activos, 4);
    },
  },
  {
    name: 'Simulacion negociacion con descuento menor al actual',
    fn() {
      resetData();
      const result = simulateNegotiation({ proveedor_id: 'PROV-001', descuento_propuesto: 10 });
      assert.strictEqual(result.status, 200);
      assert.ok(result.data.probabilidad_aceptacion >= 90);
    },
  },
  {
    name: 'Simulacion negociacion con descuento alto tiene baja probabilidad',
    fn() {
      resetData();
      const result = simulateNegotiation({ proveedor_id: 'PROV-001', descuento_propuesto: 45 });
      assert.strictEqual(result.status, 200);
      assert.ok(result.data.probabilidad_aceptacion <= 25);
    },
  },
  {
    name: 'Simulacion con volumen alto mejora probabilidad',
    fn() {
      resetData();
      const sinVolumen = simulateNegotiation({ proveedor_id: 'PROV-001', descuento_propuesto: 25 });
      const conVolumen = simulateNegotiation({ proveedor_id: 'PROV-001', descuento_propuesto: 25, volumen: 20 });
      assert.ok(conVolumen.data.probabilidad_aceptacion >= sinVolumen.data.probabilidad_aceptacion);
    },
  },
  {
    name: 'Simulacion proveedor inexistente falla',
    fn() {
      resetData();
      const result = simulateNegotiation({ proveedor_id: 'PROV-999', descuento_propuesto: 10 });
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Simulacion proveedor inactivo falla',
    fn() {
      resetData();
      const result = simulateNegotiation({ proveedor_id: 'PROV-004', descuento_propuesto: 10 });
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Simulacion descuento fuera de rango falla',
    fn() {
      resetData();
      const result = simulateNegotiation({ proveedor_id: 'PROV-001', descuento_propuesto: 60 });
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
