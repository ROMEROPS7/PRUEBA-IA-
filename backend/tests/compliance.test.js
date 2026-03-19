// ============================================================
// COMPLIANCE TEST SUITE
// Tests for complianceService: getAlertasActivas, getEstadisticas,
// getInformeRegulatorio, registrarIncidencia, resolverAlerta
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');

// --------------- Mock compliance service ---------------
let mockAlertas = [];
let mockIncidencias = [];
let mockNormativas = [];

function resetData() {
  mockIncidencias = [];
  mockAlertas = [
    { id: 'COMP-001', tipo: 'gdpr', severidad: 'alta', descripcion: 'Datos personales sin cifrar en backup', fecha: '2024-03-15T10:00:00Z', estado: 'activa', responsable: null, plazo_dias: 7 },
    { id: 'COMP-002', tipo: 'pbc', severidad: 'critica', descripcion: 'Cliente PEP sin documentacion actualizada', fecha: '2024-03-14T09:00:00Z', estado: 'activa', responsable: 'compliance_officer', plazo_dias: 3 },
    { id: 'COMP-003', tipo: 'lopd', severidad: 'media', descripcion: 'Consentimiento de marketing caducado', fecha: '2024-03-10T08:00:00Z', estado: 'resuelta', responsable: 'legal_team', plazo_dias: 30 },
    { id: 'COMP-004', tipo: 'solvencia', severidad: 'alta', descripcion: 'Ratio capital por debajo del minimo', fecha: '2024-03-15T14:00:00Z', estado: 'activa', responsable: null, plazo_dias: 15 },
    { id: 'COMP-005', tipo: 'gdpr', severidad: 'baja', descripcion: 'Solicitud derecho al olvido pendiente', fecha: '2024-03-12T11:00:00Z', estado: 'activa', responsable: 'dpo', plazo_dias: 30 },
  ];
  mockNormativas = [
    { id: 'NORM-001', nombre: 'GDPR', version: '2018', estado: 'vigente', ultima_revision: '2024-01-15', proxima_revision: '2024-07-15' },
    { id: 'NORM-002', nombre: 'LOPD-GDD', version: '2018', estado: 'vigente', ultima_revision: '2024-02-01', proxima_revision: '2024-08-01' },
    { id: 'NORM-003', nombre: 'PBC/FT', version: '2010', estado: 'vigente', ultima_revision: '2023-12-01', proxima_revision: '2024-06-01' },
    { id: 'NORM-004', nombre: 'Solvencia II', version: '2016', estado: 'vigente', ultima_revision: '2024-01-01', proxima_revision: '2024-07-01' },
  ];
}

function getAlertasActivas({ tipo, severidad } = {}) {
  let results = mockAlertas.filter(a => a.estado === 'activa');
  if (tipo) results = results.filter(a => a.tipo === tipo);
  if (severidad) results = results.filter(a => a.severidad === severidad);
  const sevOrder = { critica: 0, alta: 1, media: 2, baja: 3 };
  results.sort((a, b) => (sevOrder[a.severidad] !== undefined ? sevOrder[a.severidad] : 4) - (sevOrder[b.severidad] !== undefined ? sevOrder[b.severidad] : 4));
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
  const sinAsignar = activas.filter(a => !a.responsable).length;
  const vencidas = activas.filter(a => {
    const fecha = new Date(a.fecha);
    const plazo = new Date(fecha.getTime() + a.plazo_dias * 24 * 60 * 60 * 1000);
    return new Date() > plazo;
  }).length;

  return {
    data: {
      total_alertas: mockAlertas.length,
      activas: activas.length,
      resueltas: mockAlertas.length - activas.length,
      sin_asignar: sinAsignar,
      vencidas,
      por_tipo: porTipo,
      por_severidad: porSeveridad,
      incidencias_registradas: mockIncidencias.length,
      normativas_vigentes: mockNormativas.filter(n => n.estado === 'vigente').length,
    },
    status: 200,
  };
}

function getInformeRegulatorio(normativaId) {
  if (!normativaId) {
    return {
      data: {
        normativas: mockNormativas,
        total_alertas_activas: mockAlertas.filter(a => a.estado === 'activa').length,
        resumen: 'Informe general de cumplimiento regulatorio',
      },
      status: 200,
    };
  }
  const normativa = mockNormativas.find(n => n.id === normativaId);
  if (!normativa) return { error: 'Normativa no encontrada', status: 404 };

  const tipoMap = { 'GDPR': 'gdpr', 'LOPD-GDD': 'lopd', 'PBC/FT': 'pbc', 'Solvencia II': 'solvencia' };
  const tipo = tipoMap[normativa.nombre] || normativa.nombre.toLowerCase();
  const alertas = mockAlertas.filter(a => a.tipo === tipo);

  return {
    data: {
      normativa,
      alertas_relacionadas: alertas.length,
      alertas_activas: alertas.filter(a => a.estado === 'activa').length,
      cumplimiento: alertas.filter(a => a.estado === 'activa').length === 0 ? 'cumple' : 'incumplimiento',
    },
    status: 200,
  };
}

function registrarIncidencia({ tipo, descripcion, severidad }) {
  if (!tipo || !descripcion) return { error: 'tipo y descripcion son requeridos', status: 400 };
  const incidencia = {
    id: `INC-${String(mockIncidencias.length + 1).padStart(3, '0')}`,
    tipo, descripcion, severidad: severidad || 'media',
    estado: 'abierta',
    fecha: new Date().toISOString(),
  };
  mockIncidencias.push(incidencia);
  return { data: incidencia, status: 201 };
}

function resolverAlerta(alertaId) {
  const alerta = mockAlertas.find(a => a.id === alertaId);
  if (!alerta) return { error: 'Alerta no encontrada', status: 404 };
  if (alerta.estado !== 'activa') return { error: 'Alerta ya resuelta', status: 400 };
  alerta.estado = 'resuelta';
  return { data: alerta, status: 200 };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Obtener alertas compliance activas',
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
    name: 'Filtrar alertas por tipo gdpr',
    fn() {
      resetData();
      const result = getAlertasActivas({ tipo: 'gdpr' });
      result.data.forEach(a => assert.strictEqual(a.tipo, 'gdpr'));
    },
  },
  {
    name: 'Estadisticas de compliance',
    fn() {
      resetData();
      const result = getEstadisticas();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.total_alertas, 5);
      assert.strictEqual(result.data.activas, 4);
      assert.strictEqual(result.data.resueltas, 1);
      assert.ok(result.data.sin_asignar > 0);
      assert.ok(result.data.normativas_vigentes > 0);
    },
  },
  {
    name: 'Informe regulatorio general',
    fn() {
      resetData();
      const result = getInformeRegulatorio();
      assert.strictEqual(result.status, 200);
      assert.ok(result.data.normativas.length > 0);
      assert.ok(result.data.total_alertas_activas > 0);
    },
  },
  {
    name: 'Informe regulatorio de normativa especifica',
    fn() {
      resetData();
      const result = getInformeRegulatorio('NORM-001');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.normativa.nombre, 'GDPR');
      assert.ok(result.data.alertas_relacionadas > 0);
    },
  },
  {
    name: 'Informe regulatorio normativa inexistente falla',
    fn() {
      resetData();
      const result = getInformeRegulatorio('NORM-999');
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Registrar incidencia compliance',
    fn() {
      resetData();
      const result = registrarIncidencia({ tipo: 'gdpr', descripcion: 'Brecha de datos detectada', severidad: 'critica' });
      assert.strictEqual(result.status, 201);
      assert.ok(result.data.id.startsWith('INC-'));
      assert.strictEqual(result.data.estado, 'abierta');
    },
  },
  {
    name: 'Registrar incidencia sin datos falla',
    fn() {
      resetData();
      const result = registrarIncidencia({ tipo: 'gdpr' });
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Resolver alerta activa',
    fn() {
      resetData();
      const result = resolverAlerta('COMP-001');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.estado, 'resuelta');
    },
  },
  {
    name: 'Resolver alerta ya resuelta falla',
    fn() {
      resetData();
      const result = resolverAlerta('COMP-003');
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Resolver alerta inexistente falla',
    fn() {
      resetData();
      const result = resolverAlerta('COMP-999');
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
