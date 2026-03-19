// ============================================================
// AGENTES TEST SUITE
// Tests for listing, filtering, auto-assignment, availability
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');

// --------------- Mock data ---------------
let mockAgentes = [];

function resetData() {
  mockAgentes = [
    { id: 'AGT-001', nombre: 'Carlos Ruiz Martinez', tipo: 'perito', especialidad: 'Auto, Hogar', telefono: '611000001', email: 'cruiz@peritos.com', zona: 'Madrid', disponible: 1, valoracion: 4.9, expedientes_total: 87, tiempo_medio_dias: 3.1 },
    { id: 'AGT-002', nombre: 'Elena Torres Vidal', tipo: 'perito', especialidad: 'Hogar, Salud', telefono: '611000002', email: 'etorres@peritos.com', zona: 'Barcelona', disponible: 1, valoracion: 4.8, expedientes_total: 72, tiempo_medio_dias: 3.4 },
    { id: 'AGT-003', nombre: 'Miguel Angel Fernandez', tipo: 'perito', especialidad: 'Auto', telefono: '611000003', email: 'mfernandez@peritos.com', zona: 'Sevilla', disponible: 0, valoracion: 4.7, expedientes_total: 65, tiempo_medio_dias: 3.8 },
    { id: 'AGT-004', nombre: 'Laura Sanchez Gil', tipo: 'perito', especialidad: 'Robo, Hogar', telefono: '611000004', email: 'lsanchez@peritos.com', zona: 'Valencia', disponible: 1, valoracion: 4.6, expedientes_total: 58, tiempo_medio_dias: 4.0 },
    { id: 'AGT-005', nombre: 'Pedro Jimenez Ruiz', tipo: 'perito', especialidad: 'Todos', telefono: '611000005', email: 'pjimenez@peritos.com', zona: 'Bilbao', disponible: 1, valoracion: 4.5, expedientes_total: 51, tiempo_medio_dias: 4.2 },
    { id: 'AGT-006', nombre: 'Gruas Madrid 24h', tipo: 'grua', especialidad: 'Vehiculos', telefono: '900111222', email: 'gruas@madrid24h.com', zona: 'Madrid', disponible: 1, valoracion: 4.3, expedientes_total: 120, tiempo_medio_dias: 0.1 },
    { id: 'AGT-007', nombre: 'Dr. Alicia Moreno', tipo: 'medico', especialidad: 'Traumatologia', telefono: '611000007', email: 'amoreno@clinica.com', zona: 'Madrid', disponible: 1, valoracion: 4.9, expedientes_total: 40, tiempo_medio_dias: 2.0 },
  ];
}

// --------------- Business logic (mirrors routes/agentes.js) ---------------
function listarAgentes({ tipo, zona, disponible } = {}) {
  let results = [...mockAgentes];
  if (tipo) results = results.filter(a => a.tipo === tipo);
  if (zona) results = results.filter(a => a.zona === zona);
  if (disponible !== undefined) results = results.filter(a => a.disponible === parseInt(disponible));
  results.sort((a, b) => b.valoracion - a.valoracion);
  return results;
}

function autoAsignar(zona, tipoSiniestro) {
  // Map siniestro type to agent specialty keywords
  const especialidadMap = {
    'coche': 'Auto',
    'hogar': 'Hogar',
    'salud': 'Salud',
    'robo': 'Robo',
    'otro': 'Todos',
  };
  const keyword = especialidadMap[tipoSiniestro] || 'Todos';

  let candidatos = mockAgentes.filter(a =>
    a.tipo === 'perito' &&
    a.disponible === 1 &&
    a.zona === zona &&
    (a.especialidad.includes(keyword) || a.especialidad === 'Todos')
  );

  // If no match in zona, search all zones
  if (candidatos.length === 0) {
    candidatos = mockAgentes.filter(a =>
      a.tipo === 'perito' &&
      a.disponible === 1 &&
      (a.especialidad.includes(keyword) || a.especialidad === 'Todos')
    );
  }

  if (candidatos.length === 0) return null;

  // Best by valoracion
  candidatos.sort((a, b) => b.valoracion - a.valoracion);
  return candidatos[0];
}

function toggleDisponibilidad(id) {
  const agente = mockAgentes.find(a => a.id === id);
  if (!agente) return { error: 'Agente no encontrado', status: 404 };
  agente.disponible = agente.disponible === 1 ? 0 : 1;
  return { data: agente, status: 200 };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Listar todos los agentes',
    fn() {
      resetData();
      const agentes = listarAgentes();
      assert.strictEqual(agentes.length, 7);
      // Should be sorted by valoracion DESC
      for (let i = 0; i < agentes.length - 1; i++) {
        assert.ok(agentes[i].valoracion >= agentes[i + 1].valoracion,
          `Agentes deben estar ordenados por valoracion DESC`);
      }
    },
  },
  {
    name: 'Filtrar agentes por tipo',
    fn() {
      resetData();
      const peritos = listarAgentes({ tipo: 'perito' });
      assert.strictEqual(peritos.length, 5);
      peritos.forEach(a => assert.strictEqual(a.tipo, 'perito'));

      const gruas = listarAgentes({ tipo: 'grua' });
      assert.strictEqual(gruas.length, 1);
      assert.strictEqual(gruas[0].nombre, 'Gruas Madrid 24h');

      const medicos = listarAgentes({ tipo: 'medico' });
      assert.strictEqual(medicos.length, 1);
    },
  },
  {
    name: 'Filtrar agentes por zona',
    fn() {
      resetData();
      const madrid = listarAgentes({ zona: 'Madrid' });
      assert.strictEqual(madrid.length, 3); // AGT-001, AGT-006, AGT-007
      madrid.forEach(a => assert.strictEqual(a.zona, 'Madrid'));

      const barcelona = listarAgentes({ zona: 'Barcelona' });
      assert.strictEqual(barcelona.length, 1);

      const noExiste = listarAgentes({ zona: 'Murcia' });
      assert.strictEqual(noExiste.length, 0);
    },
  },
  {
    name: 'Filtrar agentes por tipo y zona combinados',
    fn() {
      resetData();
      const peritosMadrid = listarAgentes({ tipo: 'perito', zona: 'Madrid' });
      assert.strictEqual(peritosMadrid.length, 1);
      assert.strictEqual(peritosMadrid[0].id, 'AGT-001');
    },
  },
  {
    name: 'Auto-asignacion por zona y especialidad',
    fn() {
      resetData();
      // Auto siniestro in Madrid -> should get AGT-001 (perito, Auto, Madrid, available)
      const autoMadrid = autoAsignar('Madrid', 'coche');
      assert.ok(autoMadrid);
      assert.strictEqual(autoMadrid.id, 'AGT-001');
      assert.strictEqual(autoMadrid.zona, 'Madrid');

      // Hogar siniestro in Barcelona -> AGT-002
      const hogarBcn = autoAsignar('Barcelona', 'hogar');
      assert.ok(hogarBcn);
      assert.strictEqual(hogarBcn.id, 'AGT-002');

      // Robo in Valencia -> AGT-004
      const roboVal = autoAsignar('Valencia', 'robo');
      assert.ok(roboVal);
      assert.strictEqual(roboVal.id, 'AGT-004');
    },
  },
  {
    name: 'Auto-asignacion busca en otras zonas si no hay match local',
    fn() {
      resetData();
      // Hogar in Sevilla -> AGT-003 is perito Auto in Sevilla but unavailable
      // Should fall back to other zones: AGT-001 (Auto,Hogar Madrid), AGT-002 (Hogar,Salud Barcelona), etc.
      const hogarSevilla = autoAsignar('Sevilla', 'hogar');
      assert.ok(hogarSevilla, 'Debe encontrar perito en otra zona');
      assert.ok(hogarSevilla.especialidad.includes('Hogar') || hogarSevilla.especialidad === 'Todos');
    },
  },
  {
    name: 'Auto-asignacion retorna null si no hay candidatos',
    fn() {
      resetData();
      // Make all agents unavailable
      mockAgentes.forEach(a => a.disponible = 0);
      const result = autoAsignar('Madrid', 'coche');
      assert.strictEqual(result, null);
    },
  },
  {
    name: 'Toggle de disponibilidad',
    fn() {
      resetData();
      assert.strictEqual(mockAgentes.find(a => a.id === 'AGT-001').disponible, 1);

      const result1 = toggleDisponibilidad('AGT-001');
      assert.strictEqual(result1.status, 200);
      assert.strictEqual(result1.data.disponible, 0);

      const result2 = toggleDisponibilidad('AGT-001');
      assert.strictEqual(result2.status, 200);
      assert.strictEqual(result2.data.disponible, 1);
    },
  },
  {
    name: 'Toggle de agente inexistente falla',
    fn() {
      resetData();
      const result = toggleDisponibilidad('AGT-999');
      assert.strictEqual(result.status, 404);
      assert.ok(result.error.includes('no encontrado'));
    },
  },
  {
    name: 'Filtrar solo agentes disponibles',
    fn() {
      resetData();
      const disponibles = listarAgentes({ disponible: '1' });
      assert.strictEqual(disponibles.length, 6); // All except AGT-003
      disponibles.forEach(a => assert.strictEqual(a.disponible, 1));

      const noDisponibles = listarAgentes({ disponible: '0' });
      assert.strictEqual(noDisponibles.length, 1);
      assert.strictEqual(noDisponibles[0].id, 'AGT-003');
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
