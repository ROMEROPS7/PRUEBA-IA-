// ============================================================
// VIGILANTE AGENT TEST SUITE
// Tests for vigilanteAgent: getAlertasActivas, getEstadisticas,
// getSemaforoSiniestros, monitorear
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');

// --------------- Mock vigilante agent ---------------
let mockAlertas = [];
let mockSiniestros = [];

function resetData() {
  mockAlertas = [
    { id: 'ALR-001', tipo: 'fraude', severidad: 'alta', mensaje: 'Score fraude > 70 en SIN-001', siniestro_id: 'SIN-001', fecha: '2024-03-15T10:00:00Z', estado: 'activa', asignado: null },
    { id: 'ALR-002', tipo: 'sla', severidad: 'media', mensaje: 'SLA respuesta excedido en SIN-002', siniestro_id: 'SIN-002', fecha: '2024-03-15T11:00:00Z', estado: 'activa', asignado: null },
    { id: 'ALR-003', tipo: 'anomalia', severidad: 'baja', mensaje: 'Patron inusual detectado', siniestro_id: 'SIN-003', fecha: '2024-03-14T09:00:00Z', estado: 'resuelta', asignado: 'supervisor1' },
    { id: 'ALR-004', tipo: 'fraude', severidad: 'critica', mensaje: 'Multiples siniestros mismo DNI en 30 dias', siniestro_id: 'SIN-004', fecha: '2024-03-15T14:00:00Z', estado: 'activa', asignado: null },
    { id: 'ALR-005', tipo: 'sla', severidad: 'alta', mensaje: 'SLA resolucion excedido en SIN-005', siniestro_id: 'SIN-005', fecha: '2024-03-15T08:00:00Z', estado: 'activa', asignado: 'manager1' },
  ];
  mockSiniestros = [
    { id: 'SIN-001', estado: 'Abierto', score_fraude: 75, urgencia: 9, tipo: 'coche', dias_abierto: 1 },
    { id: 'SIN-002', estado: 'Abierto', score_fraude: 20, urgencia: 5, tipo: 'hogar', dias_abierto: 3 },
    { id: 'SIN-003', estado: 'En gestion', score_fraude: 10, urgencia: 4, tipo: 'salud', dias_abierto: 5 },
    { id: 'SIN-004', estado: 'Abierto', score_fraude: 90, urgencia: 10, tipo: 'coche', dias_abierto: 0 },
    { id: 'SIN-005', estado: 'En gestion', score_fraude: 30, urgencia: 7, tipo: 'hogar', dias_abierto: 10 },
    { id: 'SIN-006', estado: 'Resuelto', score_fraude: 5, urgencia: 3, tipo: 'salud', dias_abierto: 2 },
  ];
}

function getAlertasActivas({ tipo, severidad } = {}) {
  let results = mockAlertas.filter(a => a.estado === 'activa');
  if (tipo) results = results.filter(a => a.tipo === tipo);
  if (severidad) results = results.filter(a => a.severidad === severidad);
  results.sort((a, b) => {
    const sevOrder = { critica: 0, alta: 1, media: 2, baja: 3 };
    return (sevOrder[a.severidad] !== undefined ? sevOrder[a.severidad] : 4) - (sevOrder[b.severidad] !== undefined ? sevOrder[b.severidad] : 4);
  });
  return { data: results, total: results.length, status: 200 };
}

function getEstadisticas() {
  const activas = mockAlertas.filter(a => a.estado === 'activa');
  const porTipo = {};
  const porSeveridad = {};
  for (const a of mockAlertas) {
    porTipo[a.tipo] = (porTipo[a.tipo] || 0) + 1;
    porSeveridad[a.severidad] = (porSeveridad[a.severidad] || 0) + 1;
  }
  const sinAsignar = activas.filter(a => !a.asignado).length;
  return {
    data: {
      total_alertas: mockAlertas.length,
      activas: activas.length,
      resueltas: mockAlertas.length - activas.length,
      sin_asignar: sinAsignar,
      por_tipo: porTipo,
      por_severidad: porSeveridad,
    },
    status: 200,
  };
}

function getSemaforoSiniestros() {
  const abiertos = mockSiniestros.filter(s => s.estado !== 'Resuelto' && s.estado !== 'Cerrado');
  const rojo = abiertos.filter(s => s.score_fraude >= 70 || s.urgencia >= 9 || s.dias_abierto >= 7);
  const amarillo = abiertos.filter(s => !rojo.includes(s) && (s.score_fraude >= 40 || s.urgencia >= 6 || s.dias_abierto >= 3));
  const verde = abiertos.filter(s => !rojo.includes(s) && !amarillo.includes(s));

  return {
    data: {
      rojo: { count: rojo.length, siniestros: rojo.map(s => s.id) },
      amarillo: { count: amarillo.length, siniestros: amarillo.map(s => s.id) },
      verde: { count: verde.length, siniestros: verde.map(s => s.id) },
      total_monitoreados: abiertos.length,
    },
    status: 200,
  };
}

function monitorear(siniestroId) {
  if (!siniestroId) return { error: 'siniestro_id es requerido', status: 400 };
  const siniestro = mockSiniestros.find(s => s.id === siniestroId);
  if (!siniestro) return { error: 'Siniestro no encontrado', status: 404 };

  const alertas = mockAlertas.filter(a => a.siniestro_id === siniestroId && a.estado === 'activa');
  const riesgos = [];
  if (siniestro.score_fraude >= 70) riesgos.push('Alto riesgo de fraude');
  if (siniestro.urgencia >= 9) riesgos.push('Urgencia critica');
  if (siniestro.dias_abierto >= 7) riesgos.push('Demasiado tiempo sin resolver');

  let semaforo = 'verde';
  if (riesgos.length > 0) semaforo = 'rojo';
  else if (siniestro.score_fraude >= 40 || siniestro.urgencia >= 6 || siniestro.dias_abierto >= 3) semaforo = 'amarillo';

  return {
    data: {
      siniestro_id: siniestroId,
      estado: siniestro.estado,
      semaforo,
      riesgos,
      alertas_activas: alertas.length,
      score_fraude: siniestro.score_fraude,
      dias_abierto: siniestro.dias_abierto,
    },
    status: 200,
  };
}

function acknowledgeAlerta(alertaId, asignado) {
  const alerta = mockAlertas.find(a => a.id === alertaId);
  if (!alerta) return { error: 'Alerta no encontrada', status: 404 };
  if (alerta.estado !== 'activa') return { error: 'Alerta ya resuelta', status: 400 };
  alerta.asignado = asignado;
  return { data: alerta, status: 200 };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Obtener alertas activas',
    fn() {
      resetData();
      const result = getAlertasActivas();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.total, 4);
      result.data.forEach(a => assert.strictEqual(a.estado, 'activa'));
    },
  },
  {
    name: 'Alertas ordenadas por severidad',
    fn() {
      resetData();
      const result = getAlertasActivas();
      const sevOrder = { critica: 0, alta: 1, media: 2, baja: 3 };
      for (let i = 0; i < result.data.length - 1; i++) {
        assert.ok(sevOrder[result.data[i].severidad] <= sevOrder[result.data[i + 1].severidad]);
      }
    },
  },
  {
    name: 'Filtrar alertas por tipo fraude',
    fn() {
      resetData();
      const result = getAlertasActivas({ tipo: 'fraude' });
      assert.strictEqual(result.total, 2);
      result.data.forEach(a => assert.strictEqual(a.tipo, 'fraude'));
    },
  },
  {
    name: 'Filtrar alertas por severidad alta',
    fn() {
      resetData();
      const result = getAlertasActivas({ severidad: 'alta' });
      result.data.forEach(a => assert.strictEqual(a.severidad, 'alta'));
    },
  },
  {
    name: 'Obtener estadisticas de alertas',
    fn() {
      resetData();
      const result = getEstadisticas();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.total_alertas, 5);
      assert.strictEqual(result.data.activas, 4);
      assert.strictEqual(result.data.resueltas, 1);
      assert.ok(result.data.sin_asignar > 0);
      assert.ok(result.data.por_tipo.fraude > 0);
      assert.ok(result.data.por_severidad.alta > 0);
    },
  },
  {
    name: 'Semaforo siniestros clasifica correctamente',
    fn() {
      resetData();
      const result = getSemaforoSiniestros();
      assert.strictEqual(result.status, 200);
      assert.ok(result.data.rojo.count > 0);
      // SIN-001 (fraude 75, urgencia 9) and SIN-004 (fraude 90) should be red
      assert.ok(result.data.rojo.siniestros.includes('SIN-001'));
      assert.ok(result.data.rojo.siniestros.includes('SIN-004'));
    },
  },
  {
    name: 'Semaforo total monitoreados excluye resueltos',
    fn() {
      resetData();
      const result = getSemaforoSiniestros();
      assert.strictEqual(result.data.total_monitoreados, 5); // 6 - 1 resuelto
      assert.ok(!result.data.rojo.siniestros.includes('SIN-006'));
      assert.ok(!result.data.amarillo.siniestros.includes('SIN-006'));
      assert.ok(!result.data.verde.siniestros.includes('SIN-006'));
    },
  },
  {
    name: 'Monitorear siniestro de alto riesgo',
    fn() {
      resetData();
      const result = monitorear('SIN-001');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.semaforo, 'rojo');
      assert.ok(result.data.riesgos.length > 0);
      assert.strictEqual(result.data.score_fraude, 75);
    },
  },
  {
    name: 'Monitorear siniestro de bajo riesgo',
    fn() {
      resetData();
      const result = monitorear('SIN-003');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.semaforo, 'amarillo');
    },
  },
  {
    name: 'Monitorear siniestro inexistente falla',
    fn() {
      resetData();
      const result = monitorear('SIN-999');
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Monitorear sin ID falla',
    fn() {
      resetData();
      const result = monitorear(null);
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Acknowledge alerta asigna responsable',
    fn() {
      resetData();
      const result = acknowledgeAlerta('ALR-001', 'supervisor2');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.asignado, 'supervisor2');
    },
  },
  {
    name: 'Acknowledge alerta ya resuelta falla',
    fn() {
      resetData();
      const result = acknowledgeAlerta('ALR-003', 'otro');
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Acknowledge alerta inexistente falla',
    fn() {
      resetData();
      const result = acknowledgeAlerta('ALR-999', 'nadie');
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
