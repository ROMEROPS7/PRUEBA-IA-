// ============================================================
// canvasService.js - Investigation Canvas for Visual Fraud Investigation
// Like Obsidian Canvas but for insurance fraud analysis
// ============================================================

const { dbRun, dbAll, dbGet } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// ============================================================
// INICIALIZACION DE TABLAS
// ============================================================
async function initCanvasTables() {
  await dbRun(`CREATE TABLE IF NOT EXISTS canvas_boards (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    autor TEXT,
    creado_en TEXT DEFAULT (datetime('now')),
    actualizado_en TEXT DEFAULT (datetime('now'))
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS canvas_nodos (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    referencia_id TEXT,
    titulo TEXT,
    datos TEXT,
    x REAL DEFAULT 0,
    y REAL DEFAULT 0,
    color TEXT,
    FOREIGN KEY(board_id) REFERENCES canvas_boards(id)
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS canvas_conexiones (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL,
    nodo_origen TEXT NOT NULL,
    nodo_destino TEXT NOT NULL,
    tipo TEXT DEFAULT 'relacion',
    etiqueta TEXT,
    sospechoso INTEGER DEFAULT 0,
    FOREIGN KEY(board_id) REFERENCES canvas_boards(id)
  )`);

  await dbRun('CREATE INDEX IF NOT EXISTS idx_canvas_nodos_board ON canvas_nodos(board_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_canvas_nodos_tipo ON canvas_nodos(tipo)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_canvas_conexiones_board ON canvas_conexiones(board_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_canvas_conexiones_origen ON canvas_conexiones(nodo_origen)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_canvas_conexiones_destino ON canvas_conexiones(nodo_destino)');

  console.log('[CanvasService] Tablas de canvas inicializadas');
}

// ============================================================
// SEED DATA
// ============================================================
async function seedCanvasData() {
  const existing = await dbGet('SELECT COUNT(*) as c FROM canvas_boards');
  if (existing && existing.c > 0) {
    console.log('[CanvasService] Canvas ya tiene datos, omitiendo seed');
    return;
  }

  console.log('[CanvasService] Insertando datos de ejemplo de canvas...');

  // ---- Board 1: Red Levante ----
  const board1Id = 'CANVAS-001';
  await dbRun(
    'INSERT INTO canvas_boards (id, titulo, descripcion, autor) VALUES (?, ?, ?, ?)',
    [board1Id, 'Investigacion fraude red Levante', 'Investigacion de posible red organizada de fraude en la zona de Levante. Multiples clientes con misma direccion y proveedor comun.', 'Ana Martinez']
  );

  const nodos1 = [
    { id: 'N1-001', tipo: 'cliente', ref: 'CLI-003', titulo: 'Laura Mendez Torres', datos: JSON.stringify({ dni: '34567890C', poliza: 'POL-2024-00289', zona: 'Valencia' }), x: 100, y: 200, color: '#ef4444' },
    { id: 'N1-002', tipo: 'cliente', ref: 'CLI-011', titulo: 'Elena Torres Vidal', datos: JSON.stringify({ dni: '11234567L', poliza: 'POL-2024-00888', zona: 'Valencia' }), x: 400, y: 100, color: '#ef4444' },
    { id: 'N1-003', tipo: 'cliente', ref: 'CLI-009', titulo: 'Carmen Vega Sanz', datos: JSON.stringify({ dni: '90123456J', poliza: 'POL-2024-00234', zona: 'Madrid' }), x: 400, y: 350, color: '#f97316' },
    { id: 'N1-004', tipo: 'siniestro', ref: 'SIN-003', titulo: 'EXP-2024-0889 - Robo local comercial', datos: JSON.stringify({ score_fraude: 45, estado: 'Perito asignado', tipo: 'robo' }), x: 200, y: 400, color: '#eab308' },
    { id: 'N1-005', tipo: 'siniestro', ref: 'SIN-011', titulo: 'EXP-2024-0881 - Rotura cristal tormenta', datos: JSON.stringify({ score_fraude: 4, estado: 'Perito asignado', tipo: 'hogar' }), x: 600, y: 100, color: '#22c55e' },
    { id: 'N1-006', tipo: 'siniestro', ref: 'SIN-009', titulo: 'EXP-2024-0883 - Robo BMW', datos: JSON.stringify({ score_fraude: 68, estado: 'Abierto', tipo: 'robo' }), x: 600, y: 350, color: '#ef4444' },
    { id: 'N1-007', tipo: 'proveedor', ref: 'PROV-LEV-01', titulo: 'Taller AutoPro Valencia', datos: JSON.stringify({ cif: 'B98765432', direccion: 'Pol. Ind. Fuente del Jarro, Valencia', siniestros_atendidos: 14 }), x: 350, y: 500, color: '#8b5cf6' },
    { id: 'N1-008', tipo: 'perito', ref: 'AGT-004', titulo: 'Laura Sanchez Gil', datos: JSON.stringify({ zona: 'Valencia', especialidad: 'Robo, Hogar', valoracion: 4.6 }), x: 100, y: 500, color: '#3b82f6' },
  ];

  for (const n of nodos1) {
    await dbRun(
      'INSERT INTO canvas_nodos (id, board_id, tipo, referencia_id, titulo, datos, x, y, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [n.id, board1Id, n.tipo, n.ref, n.titulo, n.datos, n.x, n.y, n.color]
    );
  }

  const conexiones1 = [
    { id: 'C1-001', origen: 'N1-001', destino: 'N1-004', tipo: 'tiene_siniestro', etiqueta: 'Titular', sospechoso: 0 },
    { id: 'C1-002', origen: 'N1-002', destino: 'N1-005', tipo: 'tiene_siniestro', etiqueta: 'Titular', sospechoso: 0 },
    { id: 'C1-003', origen: 'N1-003', destino: 'N1-006', tipo: 'tiene_siniestro', etiqueta: 'Titular', sospechoso: 0 },
    { id: 'C1-004', origen: 'N1-004', destino: 'N1-007', tipo: 'reparado_por', etiqueta: 'Mismo taller', sospechoso: 1 },
    { id: 'C1-005', origen: 'N1-006', destino: 'N1-007', tipo: 'reparado_por', etiqueta: 'Mismo taller', sospechoso: 1 },
    { id: 'C1-006', origen: 'N1-001', destino: 'N1-002', tipo: 'misma_direccion', etiqueta: 'Misma zona Valencia', sospechoso: 1 },
    { id: 'C1-007', origen: 'N1-008', destino: 'N1-004', tipo: 'asignado_a', etiqueta: 'Perito asignado', sospechoso: 0 },
    { id: 'C1-008', origen: 'N1-008', destino: 'N1-005', tipo: 'asignado_a', etiqueta: 'Perito asignado', sospechoso: 0 },
    { id: 'C1-009', origen: 'N1-003', destino: 'N1-001', tipo: 'sospechoso', etiqueta: 'Contacto telefonico comun', sospechoso: 1 },
  ];

  for (const c of conexiones1) {
    await dbRun(
      'INSERT INTO canvas_conexiones (id, board_id, nodo_origen, nodo_destino, tipo, etiqueta, sospechoso) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [c.id, board1Id, c.origen, c.destino, c.tipo, c.etiqueta, c.sospechoso]
    );
  }

  // ---- Board 2: Caso BMW ----
  const board2Id = 'CANVAS-002';
  await dbRun(
    'INSERT INTO canvas_boards (id, titulo, descripcion, autor) VALUES (?, ?, ?, ?)',
    [board2Id, 'Caso robo BMW CC La Vaguada', 'Investigacion del robo de BMW Serie 3 en parking del Centro Comercial La Vaguada. Score de fraude alto (68). Posible fraude por simulacion de robo.', 'Roberto Diaz']
  );

  const nodos2 = [
    { id: 'N2-001', tipo: 'cliente', ref: 'CLI-009', titulo: 'Carmen Vega Sanz', datos: JSON.stringify({ dni: '90123456J', poliza: 'POL-2024-00234', direccion: 'Calle Alcala 120, Madrid' }), x: 300, y: 200, color: '#ef4444' },
    { id: 'N2-002', tipo: 'siniestro', ref: 'SIN-009', titulo: 'EXP-2024-0883 - Robo BMW', datos: JSON.stringify({ score_fraude: 68, estado: 'Abierto', valoracion_estimada: 35000 }), x: 300, y: 400, color: '#ef4444' },
    { id: 'N2-003', tipo: 'vehiculo', ref: 'VEH-BMW-001', titulo: 'BMW Serie 3 2023', datos: JSON.stringify({ matricula: '1234-BCD', color: 'Negro', km: 15000, valor: 42000 }), x: 100, y: 300, color: '#06b6d4' },
    { id: 'N2-004', tipo: 'direccion', ref: 'DIR-VAGUADA', titulo: 'CC La Vaguada - Parking P2', datos: JSON.stringify({ direccion: 'Av. Monforte de Lemos 36, Madrid', camaras: 'SI', acceso_controlado: 'SI' }), x: 550, y: 300, color: '#84cc16' },
    { id: 'N2-005', tipo: 'poliza', ref: 'POL-2024-00234', titulo: 'Poliza Todo Riesgo', datos: JSON.stringify({ tipo: 'Todo riesgo', prima_anual: 1200, antiguedad_meses: 3, cobertura_robo: 42000 }), x: 100, y: 100, color: '#f97316' },
  ];

  for (const n of nodos2) {
    await dbRun(
      'INSERT INTO canvas_nodos (id, board_id, tipo, referencia_id, titulo, datos, x, y, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [n.id, board2Id, n.tipo, n.ref, n.titulo, n.datos, n.x, n.y, n.color]
    );
  }

  const conexiones2 = [
    { id: 'C2-001', origen: 'N2-001', destino: 'N2-002', tipo: 'tiene_siniestro', etiqueta: 'Denuncia robo', sospechoso: 0 },
    { id: 'C2-002', origen: 'N2-003', destino: 'N2-002', tipo: 'vehiculo_siniestrado', etiqueta: 'Vehiculo robado', sospechoso: 0 },
    { id: 'C2-003', origen: 'N2-002', destino: 'N2-004', tipo: 'ubicacion', etiqueta: 'Lugar del robo', sospechoso: 0 },
    { id: 'C2-004', origen: 'N2-001', destino: 'N2-005', tipo: 'titular', etiqueta: 'Poliza reciente (3 meses)', sospechoso: 1 },
    { id: 'C2-005', origen: 'N2-005', destino: 'N2-002', tipo: 'cobertura', etiqueta: 'Cobertura total: 42.000 EUR', sospechoso: 1 },
  ];

  for (const c of conexiones2) {
    await dbRun(
      'INSERT INTO canvas_conexiones (id, board_id, nodo_origen, nodo_destino, tipo, etiqueta, sospechoso) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [c.id, board2Id, c.origen, c.destino, c.tipo, c.etiqueta, c.sospechoso]
    );
  }

  console.log('[CanvasService] Seed data insertado: 2 boards, 13 nodos, 14 conexiones');
}

// ============================================================
// FUNCIONES PRINCIPALES
// ============================================================

/**
 * Crea un nuevo tablero de investigacion
 */
async function crearBoard(titulo, descripcion, autor) {
  const id = `CANVAS-${uuidv4().slice(0, 8).toUpperCase()}`;
  const ahora = new Date().toISOString();

  await dbRun(
    'INSERT INTO canvas_boards (id, titulo, descripcion, autor, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?, ?)',
    [id, titulo, descripcion || null, autor || 'Sistema', ahora, ahora]
  );

  const board = await dbGet('SELECT * FROM canvas_boards WHERE id = ?', [id]);
  console.log(`[CanvasService] Board creado: ${id} - ${titulo}`);
  return board;
}

/**
 * Agrega un nodo al canvas
 */
async function agregarNodo(boardId, tipo, referenciaId, titulo, datos, x, y) {
  const board = await dbGet('SELECT id FROM canvas_boards WHERE id = ?', [boardId]);
  if (!board) {
    throw new Error(`Board ${boardId} no encontrado`);
  }

  const tiposValidos = ['cliente', 'siniestro', 'proveedor', 'perito', 'vehiculo', 'direccion', 'telefono', 'poliza'];
  if (!tiposValidos.includes(tipo)) {
    throw new Error(`Tipo de nodo invalido: ${tipo}. Tipos validos: ${tiposValidos.join(', ')}`);
  }

  const id = `N-${uuidv4().slice(0, 8).toUpperCase()}`;
  const datosStr = typeof datos === 'object' ? JSON.stringify(datos) : (datos || '{}');

  // Asignar color por tipo
  const colores = {
    cliente: '#ef4444', siniestro: '#eab308', proveedor: '#8b5cf6',
    perito: '#3b82f6', vehiculo: '#06b6d4', direccion: '#84cc16',
    telefono: '#f97316', poliza: '#ec4899'
  };

  await dbRun(
    'INSERT INTO canvas_nodos (id, board_id, tipo, referencia_id, titulo, datos, x, y, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, boardId, tipo, referenciaId || null, titulo, datosStr, x || 0, y || 0, colores[tipo] || '#6b7280']
  );

  await dbRun('UPDATE canvas_boards SET actualizado_en = datetime("now") WHERE id = ?', [boardId]);

  const nodo = await dbGet('SELECT * FROM canvas_nodos WHERE id = ?', [id]);
  if (nodo && nodo.datos) {
    try { nodo.datos = JSON.parse(nodo.datos); } catch (e) { /* keep as string */ }
  }
  return nodo;
}

/**
 * Conecta dos nodos en el canvas
 */
async function conectarNodos(boardId, origenId, destinoId, tipo, etiqueta) {
  const board = await dbGet('SELECT id FROM canvas_boards WHERE id = ?', [boardId]);
  if (!board) throw new Error(`Board ${boardId} no encontrado`);

  const origen = await dbGet('SELECT id FROM canvas_nodos WHERE id = ? AND board_id = ?', [origenId, boardId]);
  if (!origen) throw new Error(`Nodo origen ${origenId} no encontrado en board ${boardId}`);

  const destino = await dbGet('SELECT id FROM canvas_nodos WHERE id = ? AND board_id = ?', [destinoId, boardId]);
  if (!destino) throw new Error(`Nodo destino ${destinoId} no encontrado en board ${boardId}`);

  const id = `C-${uuidv4().slice(0, 8).toUpperCase()}`;

  // Determinar si la conexion es sospechosa segun el tipo
  const tiposSospechosos = ['sospechoso', 'misma_direccion', 'mismo_proveedor', 'fraude', 'anomalia'];
  const esSospechoso = tiposSospechosos.includes(tipo) ? 1 : 0;

  await dbRun(
    'INSERT INTO canvas_conexiones (id, board_id, nodo_origen, nodo_destino, tipo, etiqueta, sospechoso) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, boardId, origenId, destinoId, tipo || 'relacion', etiqueta || null, esSospechoso]
  );

  await dbRun('UPDATE canvas_boards SET actualizado_en = datetime("now") WHERE id = ?', [boardId]);

  return await dbGet('SELECT * FROM canvas_conexiones WHERE id = ?', [id]);
}

/**
 * Obtiene un board completo con todos sus nodos y conexiones
 */
async function getBoard(boardId) {
  const board = await dbGet('SELECT * FROM canvas_boards WHERE id = ?', [boardId]);
  if (!board) return null;

  const nodos = await dbAll('SELECT * FROM canvas_nodos WHERE board_id = ?', [boardId]);
  const conexiones = await dbAll('SELECT * FROM canvas_conexiones WHERE board_id = ?', [boardId]);

  // Parse datos JSON de cada nodo
  for (const nodo of nodos) {
    if (nodo.datos) {
      try { nodo.datos = JSON.parse(nodo.datos); } catch (e) { /* keep as string */ }
    }
  }

  // Calcular metricas del board
  const totalSospechosos = conexiones.filter(c => c.sospechoso === 1).length;
  const tiposNodos = {};
  for (const n of nodos) {
    tiposNodos[n.tipo] = (tiposNodos[n.tipo] || 0) + 1;
  }

  return {
    ...board,
    nodos,
    conexiones,
    metricas: {
      total_nodos: nodos.length,
      total_conexiones: conexiones.length,
      conexiones_sospechosas: totalSospechosos,
      tipos_nodos: tiposNodos,
      densidad: nodos.length > 1 ? (conexiones.length / (nodos.length * (nodos.length - 1) / 2)).toFixed(3) : 0,
    }
  };
}

/**
 * Lista todos los canvases
 */
async function listarBoards() {
  const boards = await dbAll('SELECT * FROM canvas_boards ORDER BY actualizado_en DESC');

  const result = [];
  for (const board of boards) {
    const nodoCount = await dbGet('SELECT COUNT(*) as c FROM canvas_nodos WHERE board_id = ?', [board.id]);
    const conexCount = await dbGet('SELECT COUNT(*) as c FROM canvas_conexiones WHERE board_id = ?', [board.id]);
    const sospechCount = await dbGet('SELECT COUNT(*) as c FROM canvas_conexiones WHERE board_id = ? AND sospechoso = 1', [board.id]);

    result.push({
      ...board,
      total_nodos: nodoCount.c,
      total_conexiones: conexCount.c,
      conexiones_sospechosas: sospechCount.c,
    });
  }
  return result;
}

/**
 * Detecta patrones sospechosos en un board - FUNCION CLAVE
 */
async function detectarPatrones(boardId) {
  const board = await getBoard(boardId);
  if (!board) throw new Error(`Board ${boardId} no encontrado`);

  const patrones = [];
  let riesgoTotal = 0;
  const recomendaciones = [];

  // --- Patron 1: Misma direccion en multiples siniestros ---
  const nodosCliente = board.nodos.filter(n => n.tipo === 'cliente');
  const nodosDireccion = board.nodos.filter(n => n.tipo === 'direccion');
  const nodosSiniestro = board.nodos.filter(n => n.tipo === 'siniestro');

  // Buscar clientes que comparten zona o direccion
  const direccionesVistas = {};
  for (const cli of nodosCliente) {
    const dir = cli.datos?.direccion || cli.datos?.zona || cli.titulo;
    if (!direccionesVistas[dir]) direccionesVistas[dir] = [];
    direccionesVistas[dir].push(cli);
  }

  for (const [dir, clientes] of Object.entries(direccionesVistas)) {
    if (clientes.length > 1) {
      patrones.push({
        tipo: 'misma_direccion',
        severidad: 'alta',
        descripcion: `${clientes.length} clientes comparten direccion/zona: "${dir}"`,
        entidades: clientes.map(c => ({ id: c.id, nombre: c.titulo })),
        riesgo: 75,
      });
      riesgoTotal += 75;
    }
  }

  // --- Patron 2: Mismo proveedor en muchos casos ---
  const nodosProveedor = board.nodos.filter(n => n.tipo === 'proveedor');
  for (const prov of nodosProveedor) {
    const conexionesProv = board.conexiones.filter(
      c => c.nodo_origen === prov.id || c.nodo_destino === prov.id
    );
    const siniestrosRelacionados = conexionesProv.filter(c => {
      const otroNodoId = c.nodo_origen === prov.id ? c.nodo_destino : c.nodo_origen;
      return board.nodos.find(n => n.id === otroNodoId && n.tipo === 'siniestro');
    });

    if (siniestrosRelacionados.length >= 2) {
      patrones.push({
        tipo: 'proveedor_recurrente',
        severidad: 'media',
        descripcion: `Proveedor "${prov.titulo}" aparece en ${siniestrosRelacionados.length} siniestros del board`,
        entidades: [{ id: prov.id, nombre: prov.titulo }],
        riesgo: 50 + (siniestrosRelacionados.length * 10),
      });
      riesgoTotal += 50 + (siniestrosRelacionados.length * 10);
      recomendaciones.push(`Verificar independencia del proveedor "${prov.titulo}". Aparece en multiples casos.`);
    }
  }

  // --- Patron 3: Cliente conectado a red de fraude ---
  for (const cli of nodosCliente) {
    const conexSospechosas = board.conexiones.filter(
      c => (c.nodo_origen === cli.id || c.nodo_destino === cli.id) && c.sospechoso === 1
    );
    if (conexSospechosas.length >= 2) {
      patrones.push({
        tipo: 'red_fraude',
        severidad: 'critica',
        descripcion: `Cliente "${cli.titulo}" tiene ${conexSospechosas.length} conexiones sospechosas`,
        entidades: [{ id: cli.id, nombre: cli.titulo }],
        riesgo: 85,
      });
      riesgoTotal += 85;
      recomendaciones.push(`Investigacion profunda requerida para cliente "${cli.titulo}". Posible participacion en red de fraude.`);
    }
  }

  // --- Patron 4: Conexiones circulares (A->B->C->A) ---
  const adjList = {};
  for (const c of board.conexiones) {
    if (!adjList[c.nodo_origen]) adjList[c.nodo_origen] = [];
    adjList[c.nodo_origen].push(c.nodo_destino);
  }

  const ciclosDetectados = [];
  const visitados = new Set();

  function detectarCiclo(nodo, camino, visitadosLocal) {
    if (visitadosLocal.has(nodo)) {
      const inicio = camino.indexOf(nodo);
      if (inicio !== -1) {
        const ciclo = camino.slice(inicio).concat(nodo);
        const cicloKey = [...ciclo].sort().join('-');
        if (!ciclosDetectados.includes(cicloKey)) {
          ciclosDetectados.push(cicloKey);
          const nombresNodos = ciclo.map(id => {
            const n = board.nodos.find(nd => nd.id === id);
            return n ? n.titulo : id;
          });
          patrones.push({
            tipo: 'conexion_circular',
            severidad: 'alta',
            descripcion: `Conexion circular detectada: ${nombresNodos.join(' -> ')}`,
            entidades: ciclo.map(id => ({ id, nombre: board.nodos.find(n => n.id === id)?.titulo || id })),
            riesgo: 90,
          });
          riesgoTotal += 90;
        }
      }
      return;
    }
    visitadosLocal.add(nodo);
    camino.push(nodo);
    const vecinos = adjList[nodo] || [];
    for (const vecino of vecinos) {
      detectarCiclo(vecino, [...camino], new Set(visitadosLocal));
    }
  }

  for (const nodoId of Object.keys(adjList)) {
    if (!visitados.has(nodoId)) {
      detectarCiclo(nodoId, [], new Set());
      visitados.add(nodoId);
    }
  }

  // --- Patron 5: Siniestros con score de fraude alto ---
  for (const sin of nodosSiniestro) {
    const scoreFraude = sin.datos?.score_fraude || 0;
    if (scoreFraude >= 50) {
      patrones.push({
        tipo: 'score_fraude_alto',
        severidad: scoreFraude >= 70 ? 'critica' : 'alta',
        descripcion: `Siniestro "${sin.titulo}" tiene score de fraude ${scoreFraude}/100`,
        entidades: [{ id: sin.id, nombre: sin.titulo }],
        riesgo: scoreFraude,
      });
      riesgoTotal += scoreFraude;
    }
  }

  // Calcular riesgo global normalizado
  const numPatrones = patrones.length || 1;
  const riesgoGlobal = Math.min(100, Math.round(riesgoTotal / numPatrones));

  // Generar recomendaciones adicionales
  if (riesgoGlobal >= 70) {
    recomendaciones.push('URGENTE: Derivar caso completo al departamento de investigacion especial.');
    recomendaciones.push('Solicitar informes de antecedentes de todos los implicados.');
  }
  if (riesgoGlobal >= 50) {
    recomendaciones.push('Realizar verificacion cruzada con bases de datos externas (TIREA, UNESPA).');
  }
  if (patrones.some(p => p.tipo === 'proveedor_recurrente')) {
    recomendaciones.push('Auditar al proveedor recurrente: verificar licencias, precios y relacion con asegurados.');
  }
  if (patrones.length === 0) {
    recomendaciones.push('No se detectaron patrones sospechosos. El caso parece limpio.');
  }

  return {
    board_id: boardId,
    titulo_board: board.titulo,
    fecha_analisis: new Date().toISOString(),
    patrones_detectados: patrones,
    total_patrones: patrones.length,
    riesgo_global: riesgoGlobal,
    distribucion_severidad: {
      critica: patrones.filter(p => p.severidad === 'critica').length,
      alta: patrones.filter(p => p.severidad === 'alta').length,
      media: patrones.filter(p => p.severidad === 'media').length,
    },
    recomendaciones,
  };
}

/**
 * Auto-genera un canvas a partir de un siniestro existente
 */
async function autoGenerarCanvas(siniestroId) {
  // Obtener datos del siniestro
  const siniestro = await dbGet('SELECT * FROM siniestros WHERE id = ?', [siniestroId]);
  if (!siniestro) throw new Error(`Siniestro ${siniestroId} no encontrado`);

  // Obtener cliente
  const cliente = await dbGet('SELECT * FROM clientes WHERE id = ?', [siniestro.cliente_id]);
  if (!cliente) throw new Error(`Cliente ${siniestro.cliente_id} no encontrado`);

  // Crear el board
  const board = await crearBoard(
    `Investigacion auto: ${siniestro.expediente}`,
    `Canvas auto-generado para investigacion del siniestro ${siniestro.expediente}. Cliente: ${cliente.nombre}.`,
    'Sistema IA'
  );
  const boardId = board.id;

  // Nodo del siniestro principal
  const nodoSiniestro = await agregarNodo(boardId, 'siniestro', siniestro.id, `${siniestro.expediente} - ${siniestro.descripcion.substring(0, 50)}...`, {
    score_fraude: siniestro.score_fraude,
    estado: siniestro.estado,
    tipo: siniestro.tipo,
    urgencia: siniestro.urgencia,
    valoracion: siniestro.valoracion,
    zona: siniestro.zona,
  }, 400, 300);

  // Nodo del cliente
  const nodoCliente = await agregarNodo(boardId, 'cliente', cliente.id, cliente.nombre, {
    dni: cliente.dni,
    poliza: cliente.poliza,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
  }, 100, 200);

  // Conexion cliente -> siniestro
  await conectarNodos(boardId, nodoCliente.id, nodoSiniestro.id, 'tiene_siniestro', 'Titular del siniestro');

  // Nodo de poliza
  const nodoPoliza = await agregarNodo(boardId, 'poliza', cliente.poliza, `Poliza: ${cliente.poliza}`, {
    tipo_poliza: cliente.tipo_poliza,
    titular: cliente.nombre,
  }, 100, 50);
  await conectarNodos(boardId, nodoCliente.id, nodoPoliza.id, 'titular', 'Titular de poliza');

  // Nodo de direccion
  if (siniestro.direccion) {
    const nodoDir = await agregarNodo(boardId, 'direccion', null, siniestro.direccion, {
      lat: siniestro.lat,
      lng: siniestro.lng,
      zona: siniestro.zona,
    }, 650, 200);
    await conectarNodos(boardId, nodoSiniestro.id, nodoDir.id, 'ubicacion', 'Lugar del siniestro');
  }

  // Buscar perito asignado
  if (siniestro.perito_id) {
    const perito = await dbGet('SELECT * FROM agentes WHERE id = ?', [siniestro.perito_id]);
    if (perito) {
      const nodoPerito = await agregarNodo(boardId, 'perito', perito.id, perito.nombre, {
        especialidad: perito.especialidad,
        zona: perito.zona,
        valoracion: perito.valoracion,
      }, 400, 550);
      await conectarNodos(boardId, nodoPerito.id, nodoSiniestro.id, 'asignado_a', 'Perito asignado');
    }
  }

  // Buscar otros siniestros del mismo cliente
  const otrosSiniestros = await dbAll(
    'SELECT * FROM siniestros WHERE cliente_id = ? AND id != ?',
    [cliente.id, siniestroId]
  );

  let offsetX = 650;
  for (const otro of otrosSiniestros) {
    const nodoOtro = await agregarNodo(boardId, 'siniestro', otro.id, `${otro.expediente} - ${otro.tipo}`, {
      score_fraude: otro.score_fraude,
      estado: otro.estado,
      tipo: otro.tipo,
    }, offsetX, 450);
    await conectarNodos(boardId, nodoCliente.id, nodoOtro.id, 'tiene_siniestro', 'Otro siniestro');
    // Si el otro siniestro tiene score alto, marcar como sospechoso
    if (otro.score_fraude >= 40) {
      await conectarNodos(boardId, nodoSiniestro.id, nodoOtro.id, 'sospechoso', `Score fraude: ${otro.score_fraude}`);
    }
    offsetX += 200;
  }

  // Buscar siniestros en la misma zona de otros clientes
  if (siniestro.zona) {
    const siniestrosZona = await dbAll(
      'SELECT s.*, c.nombre as cliente_nombre FROM siniestros s JOIN clientes c ON s.cliente_id = c.id WHERE s.zona = ? AND s.cliente_id != ? AND s.score_fraude >= 30 LIMIT 5',
      [siniestro.zona, cliente.id]
    );

    let yOffset = 100;
    for (const sz of siniestrosZona) {
      const nodoSZ = await agregarNodo(boardId, 'siniestro', sz.id, `${sz.expediente} (${sz.cliente_nombre})`, {
        score_fraude: sz.score_fraude,
        estado: sz.estado,
        tipo: sz.tipo,
        cliente: sz.cliente_nombre,
      }, 800, yOffset);
      await conectarNodos(boardId, nodoSiniestro.id, nodoSZ.id, 'misma_zona', `Misma zona: ${siniestro.zona}`);
      yOffset += 120;
    }
  }

  // Buscar siniestros con el mismo perito (posible connivencia)
  if (siniestro.perito_id) {
    const siniestrosPerito = await dbAll(
      'SELECT s.*, c.nombre as cliente_nombre FROM siniestros s JOIN clientes c ON s.cliente_id = c.id WHERE s.perito_id = ? AND s.id != ? AND s.score_fraude >= 25 LIMIT 3',
      [siniestro.perito_id, siniestroId]
    );

    let pyOffset = 600;
    for (const sp of siniestrosPerito) {
      const nodoSP = await agregarNodo(boardId, 'siniestro', sp.id, `${sp.expediente} (mismo perito)`, {
        score_fraude: sp.score_fraude,
        cliente: sp.cliente_nombre,
      }, 200, pyOffset);
      await conectarNodos(boardId, nodoSiniestro.id, nodoSP.id, 'mismo_perito', 'Mismo perito asignado');
      pyOffset += 100;
    }
  }

  // Obtener el board completo para retornar
  const boardCompleto = await getBoard(boardId);

  // Ejecutar deteccion de patrones
  const analisis = await detectarPatrones(boardId);

  return {
    board: boardCompleto,
    analisis_automatico: analisis,
    generado_en: new Date().toISOString(),
    mensaje: `Canvas auto-generado para ${siniestro.expediente} con ${boardCompleto.metricas.total_nodos} nodos y ${boardCompleto.metricas.total_conexiones} conexiones.`,
  };
}

/**
 * Obtiene estadisticas globales de canvas
 */
async function getEstadisticas() {
  const boardsCreados = await dbGet('SELECT COUNT(*) as c FROM canvas_boards');
  const nodosTotales = await dbGet('SELECT COUNT(*) as c FROM canvas_nodos');
  const conexionesTotales = await dbGet('SELECT COUNT(*) as c FROM canvas_conexiones');
  const conexionesSospechosas = await dbGet('SELECT COUNT(*) as c FROM canvas_conexiones WHERE sospechoso = 1');

  const tiposNodos = await dbAll('SELECT tipo, COUNT(*) as cantidad FROM canvas_nodos GROUP BY tipo ORDER BY cantidad DESC');
  const tiposConexiones = await dbAll('SELECT tipo, COUNT(*) as cantidad FROM canvas_conexiones GROUP BY tipo ORDER BY cantidad DESC');

  const boardReciente = await dbGet('SELECT * FROM canvas_boards ORDER BY actualizado_en DESC LIMIT 1');

  // Contar investigaciones activas (boards actualizados en los ultimos 7 dias)
  const investigacionesActivas = await dbGet(
    "SELECT COUNT(*) as c FROM canvas_boards WHERE actualizado_en >= datetime('now', '-7 days')"
  );

  // Calcular patrones detectados en todos los boards
  let totalPatrones = 0;
  const boards = await dbAll('SELECT id FROM canvas_boards');
  for (const b of boards) {
    try {
      const analisis = await detectarPatrones(b.id);
      totalPatrones += analisis.total_patrones;
    } catch (e) { /* skip */ }
  }

  return {
    boards_creados: boardsCreados.c,
    nodos_totales: nodosTotales.c,
    conexiones_totales: conexionesTotales.c,
    conexiones_sospechosas: conexionesSospechosas.c,
    patrones_detectados: totalPatrones,
    investigaciones_activas: investigacionesActivas.c,
    tipos_nodos: tiposNodos,
    tipos_conexiones: tiposConexiones,
    ultimo_board: boardReciente ? { id: boardReciente.id, titulo: boardReciente.titulo, actualizado: boardReciente.actualizado_en } : null,
  };
}

/**
 * Elimina un nodo y todas sus conexiones
 */
async function eliminarNodo(boardId, nodoId) {
  await dbRun('DELETE FROM canvas_conexiones WHERE board_id = ? AND (nodo_origen = ? OR nodo_destino = ?)', [boardId, nodoId, nodoId]);
  await dbRun('DELETE FROM canvas_nodos WHERE id = ? AND board_id = ?', [nodoId, boardId]);
  await dbRun('UPDATE canvas_boards SET actualizado_en = datetime("now") WHERE id = ?', [boardId]);
  return { eliminado: true, nodo_id: nodoId };
}

/**
 * Elimina una conexion
 */
async function eliminarConexion(boardId, conexionId) {
  await dbRun('DELETE FROM canvas_conexiones WHERE id = ? AND board_id = ?', [conexionId, boardId]);
  await dbRun('UPDATE canvas_boards SET actualizado_en = datetime("now") WHERE id = ?', [boardId]);
  return { eliminado: true, conexion_id: conexionId };
}

/**
 * Actualiza la posicion de un nodo (drag & drop)
 */
async function moverNodo(boardId, nodoId, x, y) {
  await dbRun('UPDATE canvas_nodos SET x = ?, y = ? WHERE id = ? AND board_id = ?', [x, y, nodoId, boardId]);
  await dbRun('UPDATE canvas_boards SET actualizado_en = datetime("now") WHERE id = ?', [boardId]);
  return { movido: true, nodo_id: nodoId, x, y };
}

/**
 * Elimina un board completo
 */
async function eliminarBoard(boardId) {
  await dbRun('DELETE FROM canvas_conexiones WHERE board_id = ?', [boardId]);
  await dbRun('DELETE FROM canvas_nodos WHERE board_id = ?', [boardId]);
  await dbRun('DELETE FROM canvas_boards WHERE id = ?', [boardId]);
  return { eliminado: true, board_id: boardId };
}

// ============================================================
// INICIALIZACION
// ============================================================
(async () => {
  try {
    await initCanvasTables();
    await seedCanvasData();
  } catch (err) {
    console.error('[CanvasService] Error en inicializacion:', err.message);
  }
})();

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  initCanvasTables,
  seedCanvasData,
  crearBoard,
  agregarNodo,
  conectarNodos,
  getBoard,
  listarBoards,
  detectarPatrones,
  autoGenerarCanvas,
  getEstadisticas,
  eliminarNodo,
  eliminarConexion,
  moverNodo,
  eliminarBoard,
};
