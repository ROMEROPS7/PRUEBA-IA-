// ============================================================
// POLIZAS TEST SUITE
// Tests for polizasService: getProductos, getPolizasCliente,
// verificarCobertura, verificarVigencia
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');

// --------------- Mock polizas service ---------------
let mockProductos = [];
let mockPolizas = [];

function resetData() {
  mockProductos = [
    { id: 'PROD-001', nombre: 'Auto Basico', tipo: 'auto', prima_base: 400, coberturas: ['responsabilidad_civil', 'asistencia_viaje'], max_cobertura: 50000 },
    { id: 'PROD-002', nombre: 'Auto Premium', tipo: 'auto', prima_base: 900, coberturas: ['responsabilidad_civil', 'asistencia_viaje', 'robo', 'todo_riesgo', 'cristales'], max_cobertura: 150000 },
    { id: 'PROD-003', nombre: 'Hogar Plus', tipo: 'hogar', prima_base: 350, coberturas: ['incendio', 'agua', 'robo', 'responsabilidad_civil'], max_cobertura: 200000 },
    { id: 'PROD-004', nombre: 'Salud Familiar', tipo: 'salud', prima_base: 1200, coberturas: ['hospitalizacion', 'consultas', 'urgencias', 'dental'], max_cobertura: 500000 },
    { id: 'PROD-005', nombre: 'Vida Total', tipo: 'vida', prima_base: 600, coberturas: ['fallecimiento', 'invalidez', 'enfermedad_grave'], max_cobertura: 300000 },
  ];
  mockPolizas = [
    { id: 'POL-001', cliente_id: 'CLI-001', producto_id: 'PROD-002', numero: 'POL-2024-0001', prima: 950, estado: 'activa', fecha_inicio: '2025-01-01', fecha_fin: '2027-01-01', coberturas_extra: ['vehiculo_sustitucion'] },
    { id: 'POL-002', cliente_id: 'CLI-001', producto_id: 'PROD-003', numero: 'POL-2024-0002', prima: 380, estado: 'activa', fecha_inicio: '2025-02-01', fecha_fin: '2027-02-01', coberturas_extra: [] },
    { id: 'POL-003', cliente_id: 'CLI-002', producto_id: 'PROD-001', numero: 'POL-2024-0003', prima: 420, estado: 'activa', fecha_inicio: '2025-03-01', fecha_fin: '2027-03-01', coberturas_extra: [] },
    { id: 'POL-004', cliente_id: 'CLI-002', producto_id: 'PROD-004', numero: 'POL-2023-0001', prima: 1250, estado: 'vencida', fecha_inicio: '2023-01-01', fecha_fin: '2024-01-01', coberturas_extra: ['dental_premium'] },
    { id: 'POL-005', cliente_id: 'CLI-003', producto_id: 'PROD-005', numero: 'POL-2024-0004', prima: 650, estado: 'cancelada', fecha_inicio: '2024-01-01', fecha_fin: '2025-01-01', coberturas_extra: [] },
  ];
}

function getProductos({ tipo } = {}) {
  let results = [...mockProductos];
  if (tipo) results = results.filter(p => p.tipo === tipo);
  return { data: results, total: results.length, status: 200 };
}

function getPolizasCliente(clienteId, { estado } = {}) {
  if (!clienteId) return { error: 'cliente_id es requerido', status: 400 };
  let results = mockPolizas.filter(p => p.cliente_id === clienteId);
  if (estado) results = results.filter(p => p.estado === estado);

  const polizasConProducto = results.map(p => {
    const producto = mockProductos.find(pr => pr.id === p.producto_id);
    return { ...p, producto_nombre: producto ? producto.nombre : 'Desconocido', producto_tipo: producto ? producto.tipo : 'desconocido' };
  });

  return { data: polizasConProducto, total: polizasConProducto.length, status: 200 };
}

function verificarCobertura(polizaId, tipoCobertura) {
  if (!polizaId || !tipoCobertura) return { error: 'poliza_id y tipo_cobertura son requeridos', status: 400 };
  const poliza = mockPolizas.find(p => p.id === polizaId);
  if (!poliza) return { error: 'Poliza no encontrada', status: 404 };
  if (poliza.estado !== 'activa') return { error: 'Poliza no activa', status: 400 };

  const producto = mockProductos.find(p => p.id === poliza.producto_id);
  const todasCoberturas = [...(producto ? producto.coberturas : []), ...poliza.coberturas_extra];
  const cubierto = todasCoberturas.includes(tipoCobertura);

  return {
    data: {
      poliza_id: polizaId,
      tipo_cobertura: tipoCobertura,
      cubierto,
      coberturas_disponibles: todasCoberturas,
      max_cobertura: producto ? producto.max_cobertura : 0,
    },
    status: 200,
  };
}

function verificarVigencia(polizaId) {
  if (!polizaId) return { error: 'poliza_id es requerido', status: 400 };
  const poliza = mockPolizas.find(p => p.id === polizaId);
  if (!poliza) return { error: 'Poliza no encontrada', status: 404 };

  const hoy = new Date();
  const inicio = new Date(poliza.fecha_inicio);
  const fin = new Date(poliza.fecha_fin);
  const vigente = poliza.estado === 'activa' && hoy >= inicio && hoy <= fin;
  const diasRestantes = vigente ? Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24)) : 0;
  const proximaRenovacion = diasRestantes <= 30 && diasRestantes > 0;

  return {
    data: {
      poliza_id: polizaId,
      estado: poliza.estado,
      vigente,
      fecha_inicio: poliza.fecha_inicio,
      fecha_fin: poliza.fecha_fin,
      dias_restantes: diasRestantes,
      proxima_renovacion: proximaRenovacion,
    },
    status: 200,
  };
}

function calcularPrima(productoId, extras = []) {
  const producto = mockProductos.find(p => p.id === productoId);
  if (!producto) return { error: 'Producto no encontrado', status: 404 };
  const extraCost = extras.length * 50;
  const prima = producto.prima_base + extraCost;
  return { data: { producto: producto.nombre, prima_base: producto.prima_base, extras_cost: extraCost, prima_total: prima }, status: 200 };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Obtener todos los productos',
    fn() {
      resetData();
      const result = getProductos();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.total, 5);
    },
  },
  {
    name: 'Filtrar productos por tipo auto',
    fn() {
      resetData();
      const result = getProductos({ tipo: 'auto' });
      assert.strictEqual(result.total, 2);
      result.data.forEach(p => assert.strictEqual(p.tipo, 'auto'));
    },
  },
  {
    name: 'Filtrar productos por tipo inexistente devuelve vacio',
    fn() {
      resetData();
      const result = getProductos({ tipo: 'aviacion' });
      assert.strictEqual(result.total, 0);
    },
  },
  {
    name: 'Obtener polizas de cliente existente',
    fn() {
      resetData();
      const result = getPolizasCliente('CLI-001');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.total, 2);
      result.data.forEach(p => {
        assert.strictEqual(p.cliente_id, 'CLI-001');
        assert.ok(p.producto_nombre);
      });
    },
  },
  {
    name: 'Filtrar polizas de cliente por estado',
    fn() {
      resetData();
      const result = getPolizasCliente('CLI-002', { estado: 'activa' });
      assert.strictEqual(result.total, 1);
      assert.strictEqual(result.data[0].estado, 'activa');
    },
  },
  {
    name: 'Polizas de cliente sin ID falla',
    fn() {
      resetData();
      const result = getPolizasCliente(null);
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Verificar cobertura incluida en poliza',
    fn() {
      resetData();
      const result = verificarCobertura('POL-001', 'robo');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.cubierto, true);
      assert.ok(result.data.max_cobertura > 0);
    },
  },
  {
    name: 'Verificar cobertura NO incluida en poliza',
    fn() {
      resetData();
      const result = verificarCobertura('POL-003', 'robo');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.cubierto, false);
    },
  },
  {
    name: 'Verificar cobertura extra en poliza',
    fn() {
      resetData();
      const result = verificarCobertura('POL-001', 'vehiculo_sustitucion');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.cubierto, true);
    },
  },
  {
    name: 'Verificar cobertura en poliza no activa falla',
    fn() {
      resetData();
      const result = verificarCobertura('POL-004', 'hospitalizacion');
      assert.strictEqual(result.status, 400);
      assert.ok(result.error.includes('no activa'));
    },
  },
  {
    name: 'Verificar cobertura poliza inexistente falla',
    fn() {
      resetData();
      const result = verificarCobertura('POL-999', 'robo');
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Verificar cobertura sin parametros falla',
    fn() {
      resetData();
      const result = verificarCobertura(null, null);
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Verificar vigencia poliza activa',
    fn() {
      resetData();
      const result = verificarVigencia('POL-003');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.vigente, true);
      assert.ok(result.data.dias_restantes > 0);
    },
  },
  {
    name: 'Verificar vigencia poliza vencida',
    fn() {
      resetData();
      const result = verificarVigencia('POL-004');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.vigente, false);
      assert.strictEqual(result.data.dias_restantes, 0);
    },
  },
  {
    name: 'Verificar vigencia poliza inexistente falla',
    fn() {
      resetData();
      const result = verificarVigencia('POL-999');
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Calcular prima con extras',
    fn() {
      resetData();
      const result = calcularPrima('PROD-001', ['asistencia_premium', 'cristales']);
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.prima_base, 400);
      assert.strictEqual(result.data.extras_cost, 100);
      assert.strictEqual(result.data.prima_total, 500);
    },
  },
  {
    name: 'Calcular prima producto inexistente falla',
    fn() {
      resetData();
      const result = calcularPrima('PROD-999');
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
