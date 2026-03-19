// ============================================================
// SINIESTROS TEST SUITE
// Tests for siniestros CRUD, filtering, search, fraud score, perito assignment
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');

// --------------- In-memory mock DB layer ---------------
let mockSiniestros = [];
let mockClientes = [];
let mockAgentes = [];
let mockExpedientes = [];
let idCounter = 0;

function resetData() {
  idCounter = 0;
  mockClientes = [
    { id: 'CLI-001', nombre: 'Maria Garcia Lopez', telefono: '612345678', email: 'maria@email.com', dni: '12345678A', poliza: 'POL-001', tipo_poliza: 'Todo riesgo' },
    { id: 'CLI-002', nombre: 'Carlos Fernandez', telefono: '634567890', email: 'carlos@email.com', dni: '23456789B', poliza: 'POL-002', tipo_poliza: 'Hogar Plus' },
    { id: 'CLI-003', nombre: 'Laura Mendez', telefono: '678901234', email: 'laura@email.com', dni: '34567890C', poliza: 'POL-003', tipo_poliza: 'Comercio' },
  ];
  mockAgentes = [
    { id: 'AGT-001', nombre: 'Carlos Ruiz', tipo: 'perito', especialidad: 'Auto, Hogar', zona: 'Madrid', disponible: 1, valoracion: 4.9 },
    { id: 'AGT-002', nombre: 'Elena Torres', tipo: 'perito', especialidad: 'Hogar, Salud', zona: 'Barcelona', disponible: 1, valoracion: 4.8 },
    { id: 'AGT-003', nombre: 'Miguel Fernandez', tipo: 'perito', especialidad: 'Auto', zona: 'Sevilla', disponible: 0, valoracion: 4.7 },
  ];
  mockSiniestros = [];
  mockExpedientes = [];
}

// --------------- Business logic (mirrors controller) ---------------
function calcularScoreFraudeBasico(descripcion, urgencia) {
  let score = 0;
  const desc = (descripcion || '').toLowerCase();
  const palabrasSospechosas = ['robo', 'desaparecido', 'incendio nocturno', 'sin testigos', 'total loss', 'siniestro total'];
  for (const p of palabrasSospechosas) {
    if (desc.includes(p)) score += 15;
  }
  if (urgencia >= 9) score += 5;
  return Math.min(score, 100);
}

function crearSiniestro({ cliente_id, tipo, descripcion, urgencia, direccion, zona }) {
  if (!cliente_id || !tipo || !descripcion) {
    return { error: 'cliente_id, tipo y descripcion son requeridos', status: 400 };
  }
  const tiposValidos = ['coche', 'hogar', 'salud', 'robo', 'otro'];
  if (!tiposValidos.includes(tipo)) {
    return { error: 'Tipo no valido', status: 400 };
  }
  const cliente = mockClientes.find(c => c.id === cliente_id);
  if (!cliente) {
    return { error: 'Cliente no encontrado', status: 404 };
  }

  idCounter++;
  const id = `SIN-${String(idCounter).padStart(3, '0')}`;
  const expediente = `EXP-2024-${String(900 + idCounter).padStart(4, '0')}`;
  const scoreFraude = calcularScoreFraudeBasico(descripcion, urgencia || 5);

  const siniestro = {
    id,
    expediente,
    cliente_id,
    tipo,
    descripcion,
    estado: 'Abierto',
    urgencia: urgencia || 5,
    score_fraude: scoreFraude,
    direccion: direccion || null,
    zona: zona || null,
    perito_id: null,
    ia_confianza: scoreFraude > 50 ? 65 : scoreFraude > 25 ? 80 : 95,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
  };
  mockSiniestros.push(siniestro);
  mockExpedientes.push({ id: `EVT-${idCounter}`, siniestro_id: id, tipo_evento: 'creacion', descripcion: 'Siniestro registrado' });
  return { data: siniestro, status: 201 };
}

function listarSiniestros({ estado, tipo, urgencia_min, orden, limite, offset } = {}) {
  let results = [...mockSiniestros];
  if (estado) results = results.filter(s => s.estado === estado);
  if (tipo) results = results.filter(s => s.tipo === tipo);
  if (urgencia_min) results = results.filter(s => s.urgencia >= parseInt(urgencia_min));

  switch (orden) {
    case 'fecha-asc': results.sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion)); break;
    case 'urgencia-desc': results.sort((a, b) => b.urgencia - a.urgencia); break;
    case 'fraude-desc': results.sort((a, b) => b.score_fraude - a.score_fraude); break;
    default: results.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
  }

  const l = parseInt(limite) || 50;
  const o = parseInt(offset) || 0;
  return { siniestros: results.slice(o, o + l), total: mockSiniestros.length };
}

function actualizarEstado(id, nuevoEstado) {
  const estadosValidos = ['Abierto', 'En gestion', 'Perito asignado', 'Resuelto', 'Cerrado', 'Fraude'];
  if (!estadosValidos.includes(nuevoEstado)) {
    return { error: 'Estado no valido', status: 400 };
  }
  const siniestro = mockSiniestros.find(s => s.id === id || s.expediente === id);
  if (!siniestro) return { error: 'Siniestro no encontrado', status: 404 };
  siniestro.estado = nuevoEstado;
  siniestro.fecha_actualizacion = new Date().toISOString();
  if (nuevoEstado === 'Resuelto' || nuevoEstado === 'Cerrado') {
    siniestro.fecha_cierre = new Date().toISOString();
  }
  mockExpedientes.push({ id: `EVT-${Date.now()}`, siniestro_id: siniestro.id, tipo_evento: 'cambio_estado', descripcion: `Estado cambiado a: ${nuevoEstado}` });
  return { data: siniestro, status: 200 };
}

function buscarSiniestros(q) {
  if (!q || q.length < 2) return { error: 'Busqueda minimo 2 caracteres', status: 400 };
  const query = q.toLowerCase();
  const results = mockSiniestros.filter(s => {
    const cliente = mockClientes.find(c => c.id === s.cliente_id);
    return s.expediente.toLowerCase().includes(query) ||
      s.descripcion.toLowerCase().includes(query) ||
      (cliente && cliente.nombre.toLowerCase().includes(query)) ||
      (cliente && cliente.poliza.toLowerCase().includes(query));
  });
  return { data: results, status: 200 };
}

function asignarPerito(siniestroId, peritoId) {
  const siniestro = mockSiniestros.find(s => s.id === siniestroId);
  if (!siniestro) return { error: 'Siniestro no encontrado', status: 404 };
  const perito = mockAgentes.find(a => a.id === peritoId);
  if (!perito) return { error: 'Perito no encontrado', status: 404 };
  if (!perito.disponible) return { error: 'Perito no disponible', status: 400 };
  siniestro.perito_id = peritoId;
  siniestro.estado = 'Perito asignado';
  siniestro.fecha_actualizacion = new Date().toISOString();
  mockExpedientes.push({ id: `EVT-${Date.now()}`, siniestro_id: siniestroId, tipo_evento: 'perito', descripcion: `Perito asignado: ${perito.nombre}` });
  return { data: siniestro, status: 200 };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Crear siniestro con datos validos',
    fn() {
      resetData();
      const result = crearSiniestro({ cliente_id: 'CLI-001', tipo: 'coche', descripcion: 'Colision frontal en M-30', urgencia: 9, zona: 'Madrid' });
      assert.strictEqual(result.status, 201);
      assert.ok(result.data.id.startsWith('SIN-'));
      assert.ok(result.data.expediente.startsWith('EXP-2024-'));
      assert.strictEqual(result.data.estado, 'Abierto');
      assert.strictEqual(result.data.tipo, 'coche');
      assert.strictEqual(result.data.urgencia, 9);
      assert.ok(result.data.fecha_creacion);
    },
  },
  {
    name: 'Crear siniestro sin cliente_id falla',
    fn() {
      resetData();
      const result = crearSiniestro({ tipo: 'coche', descripcion: 'Test' });
      assert.strictEqual(result.status, 400);
      assert.ok(result.error.includes('requeridos'));
    },
  },
  {
    name: 'Crear siniestro sin tipo falla',
    fn() {
      resetData();
      const result = crearSiniestro({ cliente_id: 'CLI-001', descripcion: 'Test' });
      assert.strictEqual(result.status, 400);
      assert.ok(result.error.includes('requeridos'));
    },
  },
  {
    name: 'Crear siniestro sin descripcion falla',
    fn() {
      resetData();
      const result = crearSiniestro({ cliente_id: 'CLI-001', tipo: 'coche' });
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Crear siniestro con tipo invalido falla',
    fn() {
      resetData();
      const result = crearSiniestro({ cliente_id: 'CLI-001', tipo: 'avion', descripcion: 'Test' });
      assert.strictEqual(result.status, 400);
      assert.ok(result.error.includes('Tipo'));
    },
  },
  {
    name: 'Crear siniestro con cliente inexistente falla',
    fn() {
      resetData();
      const result = crearSiniestro({ cliente_id: 'CLI-999', tipo: 'coche', descripcion: 'Test' });
      assert.strictEqual(result.status, 404);
      assert.ok(result.error.includes('Cliente'));
    },
  },
  {
    name: 'Listar siniestros con filtro de estado',
    fn() {
      resetData();
      crearSiniestro({ cliente_id: 'CLI-001', tipo: 'coche', descripcion: 'Test 1', urgencia: 5 });
      crearSiniestro({ cliente_id: 'CLI-002', tipo: 'hogar', descripcion: 'Test 2', urgencia: 7 });
      const sin = mockSiniestros[1];
      sin.estado = 'Resuelto';

      const result = listarSiniestros({ estado: 'Abierto' });
      assert.strictEqual(result.siniestros.length, 1);
      assert.strictEqual(result.siniestros[0].estado, 'Abierto');
      assert.strictEqual(result.total, 2);
    },
  },
  {
    name: 'Listar siniestros con filtro de tipo',
    fn() {
      resetData();
      crearSiniestro({ cliente_id: 'CLI-001', tipo: 'coche', descripcion: 'Auto' });
      crearSiniestro({ cliente_id: 'CLI-002', tipo: 'hogar', descripcion: 'Casa' });
      crearSiniestro({ cliente_id: 'CLI-003', tipo: 'coche', descripcion: 'Auto 2' });

      const result = listarSiniestros({ tipo: 'coche' });
      assert.strictEqual(result.siniestros.length, 2);
      result.siniestros.forEach(s => assert.strictEqual(s.tipo, 'coche'));
    },
  },
  {
    name: 'Listar siniestros con filtro de urgencia minima',
    fn() {
      resetData();
      crearSiniestro({ cliente_id: 'CLI-001', tipo: 'coche', descripcion: 'Leve', urgencia: 3 });
      crearSiniestro({ cliente_id: 'CLI-002', tipo: 'hogar', descripcion: 'Grave', urgencia: 8 });
      crearSiniestro({ cliente_id: 'CLI-003', tipo: 'salud', descripcion: 'Critico', urgencia: 10 });

      const result = listarSiniestros({ urgencia_min: '8' });
      assert.strictEqual(result.siniestros.length, 2);
      result.siniestros.forEach(s => assert.ok(s.urgencia >= 8));
    },
  },
  {
    name: 'Actualizar estado de siniestro',
    fn() {
      resetData();
      crearSiniestro({ cliente_id: 'CLI-001', tipo: 'coche', descripcion: 'Test' });
      const id = mockSiniestros[0].id;

      const result = actualizarEstado(id, 'En gestion');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.estado, 'En gestion');

      const result2 = actualizarEstado(id, 'Resuelto');
      assert.strictEqual(result2.data.estado, 'Resuelto');
      assert.ok(result2.data.fecha_cierre);
    },
  },
  {
    name: 'Actualizar estado con estado invalido falla',
    fn() {
      resetData();
      crearSiniestro({ cliente_id: 'CLI-001', tipo: 'coche', descripcion: 'Test' });
      const result = actualizarEstado(mockSiniestros[0].id, 'Inexistente');
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Actualizar siniestro inexistente falla',
    fn() {
      resetData();
      const result = actualizarEstado('SIN-999', 'Abierto');
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Buscar siniestros por query en descripcion',
    fn() {
      resetData();
      crearSiniestro({ cliente_id: 'CLI-001', tipo: 'coche', descripcion: 'Colision frontal en autopista' });
      crearSiniestro({ cliente_id: 'CLI-002', tipo: 'hogar', descripcion: 'Inundacion por tuberia rota' });
      crearSiniestro({ cliente_id: 'CLI-003', tipo: 'coche', descripcion: 'Alcance trasero leve' });

      const result = buscarSiniestros('inundacion');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.length, 1);
      assert.ok(result.data[0].descripcion.toLowerCase().includes('inundacion'));
    },
  },
  {
    name: 'Buscar siniestros por nombre de cliente',
    fn() {
      resetData();
      crearSiniestro({ cliente_id: 'CLI-001', tipo: 'coche', descripcion: 'Test' });
      crearSiniestro({ cliente_id: 'CLI-002', tipo: 'hogar', descripcion: 'Test' });

      const result = buscarSiniestros('Maria');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.length, 1);
    },
  },
  {
    name: 'Buscar con query muy corta falla',
    fn() {
      resetData();
      const result = buscarSiniestros('a');
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Calculo de score de fraude - descripcion normal',
    fn() {
      const score = calcularScoreFraudeBasico('Colision frontal en autopista, testigos presentes', 5);
      assert.ok(score < 15, `Score deberia ser bajo, fue ${score}`);
    },
  },
  {
    name: 'Calculo de score de fraude - descripcion sospechosa',
    fn() {
      const score = calcularScoreFraudeBasico('Robo sin testigos del vehiculo desaparecido', 9);
      // 'robo' +15, 'sin testigos' +15, 'desaparecido' +15, urgencia>=9 +5 = 50
      assert.ok(score >= 45, `Score deberia ser alto, fue ${score}`);
    },
  },
  {
    name: 'Asignacion de perito exitosa',
    fn() {
      resetData();
      crearSiniestro({ cliente_id: 'CLI-001', tipo: 'coche', descripcion: 'Test', zona: 'Madrid' });
      const siniestroId = mockSiniestros[0].id;

      const result = asignarPerito(siniestroId, 'AGT-001');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.perito_id, 'AGT-001');
      assert.strictEqual(result.data.estado, 'Perito asignado');
    },
  },
  {
    name: 'Asignacion de perito no disponible falla',
    fn() {
      resetData();
      crearSiniestro({ cliente_id: 'CLI-001', tipo: 'coche', descripcion: 'Test' });
      const siniestroId = mockSiniestros[0].id;

      const result = asignarPerito(siniestroId, 'AGT-003');
      assert.strictEqual(result.status, 400);
      assert.ok(result.error.includes('no disponible'));
    },
  },
  {
    name: 'Listar con paginacion (limite y offset)',
    fn() {
      resetData();
      for (let i = 0; i < 5; i++) {
        crearSiniestro({ cliente_id: 'CLI-001', tipo: 'coche', descripcion: `Siniestro ${i}` });
      }
      const page1 = listarSiniestros({ limite: '2', offset: '0' });
      assert.strictEqual(page1.siniestros.length, 2);
      assert.strictEqual(page1.total, 5);

      const page2 = listarSiniestros({ limite: '2', offset: '2' });
      assert.strictEqual(page2.siniestros.length, 2);

      const page3 = listarSiniestros({ limite: '2', offset: '4' });
      assert.strictEqual(page3.siniestros.length, 1);
    },
  },
  {
    name: 'Timeline se actualiza al crear y cambiar estado',
    fn() {
      resetData();
      crearSiniestro({ cliente_id: 'CLI-001', tipo: 'coche', descripcion: 'Test' });
      const id = mockSiniestros[0].id;
      assert.strictEqual(mockExpedientes.filter(e => e.siniestro_id === id).length, 1);

      actualizarEstado(id, 'En gestion');
      assert.strictEqual(mockExpedientes.filter(e => e.siniestro_id === id).length, 2);

      actualizarEstado(id, 'Resuelto');
      assert.strictEqual(mockExpedientes.filter(e => e.siniestro_id === id).length, 3);
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
