// ============================================================
// knowledgeGraphService.js - Knowledge Graph Service
// Discovers hidden relationships between ALL entities in the system
// ============================================================

const { dbRun, dbAll, dbGet } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// ============================================================
// INICIALIZACION DE TABLAS
// ============================================================
async function initKnowledgeGraphTables() {
  await dbRun(`CREATE TABLE IF NOT EXISTS knowledge_graph (
    id TEXT PRIMARY KEY,
    entidad_a_tipo TEXT NOT NULL,
    entidad_a_id TEXT NOT NULL,
    entidad_a_nombre TEXT,
    relacion TEXT NOT NULL,
    entidad_b_tipo TEXT NOT NULL,
    entidad_b_id TEXT NOT NULL,
    entidad_b_nombre TEXT,
    peso REAL DEFAULT 1.0,
    descubierto_en TEXT DEFAULT (datetime('now'))
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS knowledge_insights (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    severidad TEXT DEFAULT 'info',
    entidades_involucradas TEXT,
    creado_en TEXT DEFAULT (datetime('now'))
  )`);

  await dbRun('CREATE INDEX IF NOT EXISTS idx_kg_entidad_a ON knowledge_graph(entidad_a_tipo, entidad_a_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_kg_entidad_b ON knowledge_graph(entidad_b_tipo, entidad_b_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_kg_relacion ON knowledge_graph(relacion)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_kg_peso ON knowledge_graph(peso)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_ki_tipo ON knowledge_insights(tipo)');

  console.log('[KnowledgeGraphService] Tablas de knowledge graph inicializadas');
}

// ============================================================
// HELPERS
// ============================================================

function crearRelacionId(tipoA, idA, relacion, tipoB, idB) {
  return `KG-${tipoA}-${idA}-${relacion}-${tipoB}-${idB}`.replace(/\s+/g, '_');
}

async function insertarRelacion(tipoA, idA, nombreA, relacion, tipoB, idB, nombreB, peso) {
  const id = crearRelacionId(tipoA, idA, relacion, tipoB, idB);
  try {
    await dbRun(
      `INSERT OR REPLACE INTO knowledge_graph (id, entidad_a_tipo, entidad_a_id, entidad_a_nombre, relacion, entidad_b_tipo, entidad_b_id, entidad_b_nombre, peso, descubierto_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [id, tipoA, idA, nombreA, relacion, tipoB, idB, nombreB, peso || 1.0]
    );
    return true;
  } catch (err) {
    console.error(`[KnowledgeGraphService] Error insertando relacion: ${err.message}`);
    return false;
  }
}

async function insertarInsight(tipo, titulo, descripcion, severidad, entidades) {
  const id = `KI-${uuidv4().slice(0, 8).toUpperCase()}`;
  const entidadesStr = typeof entidades === 'object' ? JSON.stringify(entidades) : (entidades || '[]');
  await dbRun(
    'INSERT INTO knowledge_insights (id, tipo, titulo, descripcion, severidad, entidades_involucradas) VALUES (?, ?, ?, ?, ?, ?)',
    [id, tipo, titulo, descripcion, severidad, entidadesStr]
  );
  return id;
}

function extraerZona(direccion) {
  if (!direccion) return null;
  const zonas = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Zaragoza', 'Malaga', 'Murcia'];
  for (const zona of zonas) {
    if (direccion.toLowerCase().includes(zona.toLowerCase())) return zona;
  }
  return null;
}

// ============================================================
// FUNCIONES PRINCIPALES
// ============================================================

/**
 * Construye el grafo de conocimiento completo - FUNCION CLAVE
 */
async function construirGrafo() {
  console.log('[KnowledgeGraphService] Construyendo grafo de conocimiento...');

  // Limpiar grafo anterior para reconstruir
  await dbRun('DELETE FROM knowledge_graph');

  let totalRelaciones = 0;
  const patronesDescubiertos = [];

  // ------ 1. Relaciones cliente -> siniestro ------
  const siniestros = await dbAll(
    'SELECT s.*, c.nombre as cliente_nombre, c.direccion as cliente_direccion, c.poliza, c.tipo_poliza FROM siniestros s JOIN clientes c ON s.cliente_id = c.id'
  );

  for (const s of siniestros) {
    await insertarRelacion('cliente', s.cliente_id, s.cliente_nombre, 'tiene_siniestro', 'siniestro', s.id, s.expediente, 1.0);
    totalRelaciones++;

    // Relacion siniestro -> zona
    if (s.zona) {
      await insertarRelacion('siniestro', s.id, s.expediente, 'ubicado_en', 'zona', s.zona, s.zona, 1.0);
      totalRelaciones++;

      // Relacion cliente -> zona
      await insertarRelacion('cliente', s.cliente_id, s.cliente_nombre, 'vive_en', 'zona', s.zona, s.zona, 0.8);
      totalRelaciones++;
    }

    // Relacion siniestro -> perito
    if (s.perito_id) {
      const perito = await dbGet('SELECT nombre FROM agentes WHERE id = ?', [s.perito_id]);
      if (perito) {
        await insertarRelacion('siniestro', s.id, s.expediente, 'asignado_a', 'perito', s.perito_id, perito.nombre, 1.0);
        totalRelaciones++;
      }
    }

    // Relacion cliente -> poliza
    if (s.poliza) {
      await insertarRelacion('cliente', s.cliente_id, s.cliente_nombre, 'titular_de', 'poliza', s.poliza, `${s.poliza} (${s.tipo_poliza})`, 1.0);
      totalRelaciones++;
    }
  }

  // ------ 2. Relaciones perito -> zona ------
  const agentes = await dbAll('SELECT * FROM agentes');
  for (const a of agentes) {
    if (a.zona) {
      await insertarRelacion('perito', a.id, a.nombre, 'opera_en', 'zona', a.zona, a.zona, 1.0);
      totalRelaciones++;
    }
  }

  // ------ 3. Descubrir clientes con misma direccion ------
  const clientes = await dbAll('SELECT * FROM clientes');
  const direccionesMap = {};

  for (const c of clientes) {
    if (c.direccion) {
      const zona = extraerZona(c.direccion);
      if (zona) {
        if (!direccionesMap[zona]) direccionesMap[zona] = [];
        direccionesMap[zona].push(c);
      }
    }
  }

  for (const [zona, clientesZona] of Object.entries(direccionesMap)) {
    if (clientesZona.length > 1) {
      for (let i = 0; i < clientesZona.length; i++) {
        for (let j = i + 1; j < clientesZona.length; j++) {
          await insertarRelacion(
            'cliente', clientesZona[i].id, clientesZona[i].nombre,
            'misma_zona', 'cliente', clientesZona[j].id, clientesZona[j].nombre,
            0.5
          );
          totalRelaciones++;
        }
      }

      if (clientesZona.length >= 3) {
        patronesDescubiertos.push({
          tipo: 'cluster_geografico',
          descripcion: `${clientesZona.length} clientes en zona ${zona}`,
          entidades: clientesZona.map(c => ({ tipo: 'cliente', id: c.id, nombre: c.nombre })),
          riesgo: 30,
        });
      }
    }
  }

  // ------ 4. Descubrir mismo perito en multiples siniestros ------
  const peritosSiniestros = {};
  for (const s of siniestros) {
    if (s.perito_id) {
      if (!peritosSiniestros[s.perito_id]) peritosSiniestros[s.perito_id] = [];
      peritosSiniestros[s.perito_id].push(s);
    }
  }

  for (const [peritoId, sinPer] of Object.entries(peritosSiniestros)) {
    if (sinPer.length > 1) {
      for (let i = 0; i < sinPer.length; i++) {
        for (let j = i + 1; j < sinPer.length; j++) {
          await insertarRelacion(
            'siniestro', sinPer[i].id, sinPer[i].expediente,
            'mismo_perito', 'siniestro', sinPer[j].id, sinPer[j].expediente,
            0.7
          );
          totalRelaciones++;
        }
      }

      const perito = await dbGet('SELECT nombre FROM agentes WHERE id = ?', [peritoId]);
      if (sinPer.length >= 3) {
        patronesDescubiertos.push({
          tipo: 'perito_concentrado',
          descripcion: `Perito ${perito?.nombre || peritoId} asignado a ${sinPer.length} siniestros`,
          entidades: sinPer.map(s => ({ tipo: 'siniestro', id: s.id, nombre: s.expediente })),
          riesgo: sinPer.length * 15,
        });
      }
    }
  }

  // ------ 5. Descubrir siniestros sospechosos conectados ------
  const siniestrosFraude = siniestros.filter(s => s.score_fraude >= 30);
  for (let i = 0; i < siniestrosFraude.length; i++) {
    for (let j = i + 1; j < siniestrosFraude.length; j++) {
      const s1 = siniestrosFraude[i];
      const s2 = siniestrosFraude[j];

      // Misma zona y ambos con fraude alto
      if (s1.zona && s1.zona === s2.zona) {
        const pesoFraude = ((s1.score_fraude + s2.score_fraude) / 200).toFixed(2);
        await insertarRelacion(
          'siniestro', s1.id, s1.expediente,
          'sospechoso', 'siniestro', s2.id, s2.expediente,
          parseFloat(pesoFraude)
        );
        totalRelaciones++;
      }

      // Mismo tipo y fraude alto
      if (s1.tipo === s2.tipo && s1.score_fraude >= 40 && s2.score_fraude >= 40) {
        await insertarRelacion(
          'siniestro', s1.id, s1.expediente,
          'patron_similar', 'siniestro', s2.id, s2.expediente,
          0.6
        );
        totalRelaciones++;
      }
    }
  }

  // ------ 6. Relaciones cliente -> cliente por multiples siniestros ------
  const clienteSiniestros = {};
  for (const s of siniestros) {
    if (!clienteSiniestros[s.cliente_id]) clienteSiniestros[s.cliente_id] = [];
    clienteSiniestros[s.cliente_id].push(s);
  }

  const clientesMultiples = Object.entries(clienteSiniestros).filter(([_, sins]) => sins.length > 1);
  for (const [clienteId, sins] of clientesMultiples) {
    const cliente = clientes.find(c => c.id === clienteId);
    patronesDescubiertos.push({
      tipo: 'cliente_recurrente',
      descripcion: `Cliente ${cliente?.nombre || clienteId} tiene ${sins.length} siniestros`,
      entidades: sins.map(s => ({ tipo: 'siniestro', id: s.id, nombre: s.expediente })),
      riesgo: sins.length * 20,
    });
  }

  // ------ 7. Analizar conexiones de llamadas ------
  const llamadas = await dbAll(
    'SELECT l.*, c.nombre as cliente_nombre FROM llamadas l LEFT JOIN clientes c ON l.cliente_id = c.id WHERE l.siniestro_id IS NOT NULL'
  );

  for (const ll of llamadas) {
    if (ll.cliente_id && ll.siniestro_id) {
      await insertarRelacion(
        'cliente', ll.cliente_id, ll.cliente_nombre || 'Desconocido',
        'llamo_por', 'siniestro', ll.siniestro_id, ll.siniestro_id,
        0.3
      );
      totalRelaciones++;
    }
  }

  // ------ 8. Analizar mensajes WhatsApp ------
  const mensajes = await dbAll(
    'SELECT m.*, c.nombre as cliente_nombre FROM mensajes_whatsapp m LEFT JOIN clientes c ON m.cliente_id = c.id WHERE m.siniestro_id IS NOT NULL'
  );

  for (const msg of mensajes) {
    if (msg.cliente_id && msg.siniestro_id) {
      await insertarRelacion(
        'cliente', msg.cliente_id, msg.cliente_nombre || 'Desconocido',
        'contacto_whatsapp', 'siniestro', msg.siniestro_id, msg.siniestro_id,
        0.2
      );
      totalRelaciones++;
    }
  }

  // Contar entidades unicas
  const entidadesUnicas = new Set();
  const relaciones = await dbAll('SELECT * FROM knowledge_graph');
  for (const r of relaciones) {
    entidadesUnicas.add(`${r.entidad_a_tipo}:${r.entidad_a_id}`);
    entidadesUnicas.add(`${r.entidad_b_tipo}:${r.entidad_b_id}`);
  }

  console.log(`[KnowledgeGraphService] Grafo construido: ${entidadesUnicas.size} entidades, ${totalRelaciones} relaciones, ${patronesDescubiertos.length} patrones`);

  return {
    entidades: entidadesUnicas.size,
    relaciones: totalRelaciones,
    patrones_descubiertos: patronesDescubiertos,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Busca todas las relaciones de una entidad especifica
 */
async function buscarRelaciones(entidadTipo, entidadId) {
  const directas = await dbAll(
    'SELECT * FROM knowledge_graph WHERE (entidad_a_tipo = ? AND entidad_a_id = ?) OR (entidad_b_tipo = ? AND entidad_b_id = ?)',
    [entidadTipo, entidadId, entidadTipo, entidadId]
  );

  // Construir grafo centrado en la entidad
  const nodos = new Map();
  const enlaces = [];

  // Nodo central
  let nombreCentral = entidadId;
  if (directas.length > 0) {
    const primera = directas[0];
    if (primera.entidad_a_tipo === entidadTipo && primera.entidad_a_id === entidadId) {
      nombreCentral = primera.entidad_a_nombre || entidadId;
    } else {
      nombreCentral = primera.entidad_b_nombre || entidadId;
    }
  }

  nodos.set(`${entidadTipo}:${entidadId}`, {
    tipo: entidadTipo,
    id: entidadId,
    nombre: nombreCentral,
    central: true,
  });

  for (const rel of directas) {
    let otroTipo, otroId, otroNombre;

    if (rel.entidad_a_tipo === entidadTipo && rel.entidad_a_id === entidadId) {
      otroTipo = rel.entidad_b_tipo;
      otroId = rel.entidad_b_id;
      otroNombre = rel.entidad_b_nombre;
    } else {
      otroTipo = rel.entidad_a_tipo;
      otroId = rel.entidad_a_id;
      otroNombre = rel.entidad_a_nombre;
    }

    const nodoKey = `${otroTipo}:${otroId}`;
    if (!nodos.has(nodoKey)) {
      nodos.set(nodoKey, {
        tipo: otroTipo,
        id: otroId,
        nombre: otroNombre,
        central: false,
      });
    }

    enlaces.push({
      origen: `${rel.entidad_a_tipo}:${rel.entidad_a_id}`,
      destino: `${rel.entidad_b_tipo}:${rel.entidad_b_id}`,
      relacion: rel.relacion,
      peso: rel.peso,
    });
  }

  // Buscar relaciones de segundo nivel (vecinos de vecinos)
  const nodosNivel1 = Array.from(nodos.values()).filter(n => !n.central);
  for (const nodo of nodosNivel1.slice(0, 10)) { // Limitar para rendimiento
    const relNivel2 = await dbAll(
      'SELECT * FROM knowledge_graph WHERE ((entidad_a_tipo = ? AND entidad_a_id = ?) OR (entidad_b_tipo = ? AND entidad_b_id = ?)) AND peso >= 0.5 LIMIT 5',
      [nodo.tipo, nodo.id, nodo.tipo, nodo.id]
    );

    for (const r2 of relNivel2) {
      let t, i, n;
      if (r2.entidad_a_tipo === nodo.tipo && r2.entidad_a_id === nodo.id) {
        t = r2.entidad_b_tipo; i = r2.entidad_b_id; n = r2.entidad_b_nombre;
      } else {
        t = r2.entidad_a_tipo; i = r2.entidad_a_id; n = r2.entidad_a_nombre;
      }

      const key = `${t}:${i}`;
      if (!nodos.has(key)) {
        nodos.set(key, { tipo: t, id: i, nombre: n, central: false, nivel: 2 });
      }

      enlaces.push({
        origen: `${r2.entidad_a_tipo}:${r2.entidad_a_id}`,
        destino: `${r2.entidad_b_tipo}:${r2.entidad_b_id}`,
        relacion: r2.relacion,
        peso: r2.peso,
      });
    }
  }

  return {
    entidad_central: { tipo: entidadTipo, id: entidadId, nombre: nombreCentral },
    nodos: Array.from(nodos.values()),
    enlaces,
    total_relaciones: directas.length,
    total_nodos: nodos.size,
  };
}

/**
 * Detecta redes de fraude en el grafo
 */
async function detectarRedFraude() {
  const relSospechosas = await dbAll(
    "SELECT * FROM knowledge_graph WHERE relacion IN ('sospechoso', 'patron_similar') OR peso >= 0.7 ORDER BY peso DESC"
  );

  // Construir clusters de entidades conectadas sospechosamente
  const unionFind = {};

  function find(x) {
    if (!unionFind[x]) unionFind[x] = x;
    if (unionFind[x] !== x) unionFind[x] = find(unionFind[x]);
    return unionFind[x];
  }

  function union(x, y) {
    const px = find(x);
    const py = find(y);
    if (px !== py) unionFind[px] = py;
  }

  for (const rel of relSospechosas) {
    const keyA = `${rel.entidad_a_tipo}:${rel.entidad_a_id}`;
    const keyB = `${rel.entidad_b_tipo}:${rel.entidad_b_id}`;
    union(keyA, keyB);
  }

  // Agrupar entidades por cluster
  const clusters = {};
  const entidadInfo = {};

  for (const rel of relSospechosas) {
    const keyA = `${rel.entidad_a_tipo}:${rel.entidad_a_id}`;
    const keyB = `${rel.entidad_b_tipo}:${rel.entidad_b_id}`;

    entidadInfo[keyA] = { tipo: rel.entidad_a_tipo, id: rel.entidad_a_id, nombre: rel.entidad_a_nombre };
    entidadInfo[keyB] = { tipo: rel.entidad_b_tipo, id: rel.entidad_b_id, nombre: rel.entidad_b_nombre };

    const root = find(keyA);
    if (!clusters[root]) clusters[root] = new Set();
    clusters[root].add(keyA);
    clusters[root].add(keyB);
  }

  // Filtrar clusters significativos (mas de 2 entidades)
  const redesDetectadas = [];
  const riesgoPorRed = [];
  const recomendaciones = [];

  let redIndex = 0;
  for (const [_, miembros] of Object.entries(clusters)) {
    if (miembros.size < 2) continue;

    redIndex++;
    const entidades = Array.from(miembros).map(key => entidadInfo[key]).filter(Boolean);

    // Calcular riesgo de la red
    const siniestrosEnRed = entidades.filter(e => e.tipo === 'siniestro');
    let riesgoRed = 0;

    for (const sin of siniestrosEnRed) {
      const datos = await dbGet('SELECT score_fraude FROM siniestros WHERE id = ?', [sin.id]);
      if (datos) riesgoRed += datos.score_fraude;
    }

    riesgoRed = siniestrosEnRed.length > 0 ? Math.round(riesgoRed / siniestrosEnRed.length) : 30;

    // Buscar relaciones internas de la red
    const relacionesInternas = relSospechosas.filter(r => {
      const kA = `${r.entidad_a_tipo}:${r.entidad_a_id}`;
      const kB = `${r.entidad_b_tipo}:${r.entidad_b_id}`;
      return miembros.has(kA) && miembros.has(kB);
    });

    redesDetectadas.push({
      id: `RED-${String(redIndex).padStart(3, '0')}`,
      nombre: `Red sospechosa #${redIndex}`,
      entidades,
      total_entidades: miembros.size,
      relaciones: relacionesInternas.map(r => ({
        origen: r.entidad_a_nombre,
        destino: r.entidad_b_nombre,
        tipo: r.relacion,
        peso: r.peso,
      })),
      total_relaciones: relacionesInternas.length,
      riesgo: riesgoRed,
    });

    riesgoPorRed.push({
      red_id: `RED-${String(redIndex).padStart(3, '0')}`,
      riesgo: riesgoRed,
      nivel: riesgoRed >= 60 ? 'critico' : riesgoRed >= 40 ? 'alto' : 'medio',
    });

    if (riesgoRed >= 60) {
      recomendaciones.push(`RED-${String(redIndex).padStart(3, '0')}: Investigacion urgente requerida. ${miembros.size} entidades conectadas con riesgo ${riesgoRed}.`);
    } else if (riesgoRed >= 40) {
      recomendaciones.push(`RED-${String(redIndex).padStart(3, '0')}: Monitorizar de cerca. ${miembros.size} entidades con patron sospechoso.`);
    } else {
      recomendaciones.push(`RED-${String(redIndex).padStart(3, '0')}: Revisar en proxima auditoria rutinaria.`);
    }
  }

  if (redesDetectadas.length === 0) {
    recomendaciones.push('No se detectaron redes de fraude significativas. Sistema limpio.');
  }

  return {
    redes_detectadas: redesDetectadas,
    total_redes: redesDetectadas.length,
    riesgo_por_red: riesgoPorRed,
    riesgo_global: riesgoPorRed.length > 0
      ? Math.round(riesgoPorRed.reduce((a, b) => a + b.riesgo, 0) / riesgoPorRed.length)
      : 0,
    recomendaciones,
    analizado_en: new Date().toISOString(),
  };
}

/**
 * Retorna el grafo completo para visualizacion
 */
async function getGrafoCompleto() {
  const relaciones = await dbAll('SELECT * FROM knowledge_graph ORDER BY peso DESC');

  const nodos = new Map();
  const enlaces = [];

  for (const rel of relaciones) {
    const keyA = `${rel.entidad_a_tipo}:${rel.entidad_a_id}`;
    const keyB = `${rel.entidad_b_tipo}:${rel.entidad_b_id}`;

    if (!nodos.has(keyA)) {
      nodos.set(keyA, {
        id: keyA,
        tipo: rel.entidad_a_tipo,
        entidad_id: rel.entidad_a_id,
        nombre: rel.entidad_a_nombre,
        conexiones: 0,
      });
    }
    nodos.get(keyA).conexiones++;

    if (!nodos.has(keyB)) {
      nodos.set(keyB, {
        id: keyB,
        tipo: rel.entidad_b_tipo,
        entidad_id: rel.entidad_b_id,
        nombre: rel.entidad_b_nombre,
        conexiones: 0,
      });
    }
    nodos.get(keyB).conexiones++;

    enlaces.push({
      id: rel.id,
      origen: keyA,
      destino: keyB,
      relacion: rel.relacion,
      peso: rel.peso,
      descubierto_en: rel.descubierto_en,
    });
  }

  // Calcular grados y hubs (nodos con muchas conexiones)
  const nodosArr = Array.from(nodos.values());
  const hubs = nodosArr.filter(n => n.conexiones >= 3).sort((a, b) => b.conexiones - a.conexiones);

  // Distribucion por tipo de entidad
  const distribucionEntidades = {};
  for (const n of nodosArr) {
    distribucionEntidades[n.tipo] = (distribucionEntidades[n.tipo] || 0) + 1;
  }

  // Distribucion por tipo de relacion
  const distribucionRelaciones = {};
  for (const e of enlaces) {
    distribucionRelaciones[e.relacion] = (distribucionRelaciones[e.relacion] || 0) + 1;
  }

  return {
    nodos: nodosArr,
    enlaces,
    total_nodos: nodosArr.length,
    total_enlaces: enlaces.length,
    hubs,
    distribucion_entidades: distribucionEntidades,
    distribucion_relaciones: distribucionRelaciones,
    densidad: nodosArr.length > 1 ? (enlaces.length / (nodosArr.length * (nodosArr.length - 1) / 2)).toFixed(4) : 0,
  };
}

/**
 * Genera insights del analisis del grafo
 */
async function getInsights() {
  // Obtener insights almacenados
  const insightsDB = await dbAll('SELECT * FROM knowledge_insights ORDER BY creado_en DESC');

  for (const ins of insightsDB) {
    if (ins.entidades_involucradas) {
      try { ins.entidades_involucradas = JSON.parse(ins.entidades_involucradas); } catch (e) { /* keep */ }
    }
  }

  // Generar insights dinamicos basados en el grafo actual
  const insightsDinamicos = [];

  // Insight: peritos con alta concentracion
  const peritosCarga = await dbAll(
    "SELECT entidad_b_nombre as perito, COUNT(*) as siniestros FROM knowledge_graph WHERE relacion = 'asignado_a' GROUP BY entidad_b_id HAVING siniestros >= 2 ORDER BY siniestros DESC"
  );
  for (const pc of peritosCarga) {
    insightsDinamicos.push({
      tipo: 'concentracion_perito',
      titulo: `Alta carga para perito ${pc.perito}`,
      descripcion: `El perito ${pc.perito} esta asignado a ${pc.siniestros} siniestros activos. Verificar que no hay sobrecarga o conflicto de intereses.`,
      severidad: pc.siniestros >= 3 ? 'alta' : 'media',
    });
  }

  // Insight: zonas con muchos siniestros
  const zonasCalientes = await dbAll(
    "SELECT entidad_b_nombre as zona, COUNT(*) as siniestros FROM knowledge_graph WHERE relacion = 'ubicado_en' GROUP BY entidad_b_id HAVING siniestros >= 3 ORDER BY siniestros DESC"
  );
  for (const zc of zonasCalientes) {
    insightsDinamicos.push({
      tipo: 'zona_caliente',
      titulo: `Zona caliente: ${zc.zona}`,
      descripcion: `${zc.siniestros} siniestros registrados en ${zc.zona}. Posible cluster geografico que requiere atencion.`,
      severidad: zc.siniestros >= 5 ? 'alta' : 'media',
    });
  }

  // Insight: relaciones sospechosas de alto peso
  const relSospechosas = await dbAll(
    "SELECT * FROM knowledge_graph WHERE relacion IN ('sospechoso', 'patron_similar') AND peso >= 0.5 ORDER BY peso DESC LIMIT 5"
  );
  for (const rs of relSospechosas) {
    insightsDinamicos.push({
      tipo: 'relacion_sospechosa',
      titulo: `Relacion sospechosa detectada`,
      descripcion: `${rs.entidad_a_nombre} y ${rs.entidad_b_nombre} tienen una relacion sospechosa (peso: ${rs.peso}). Tipo: ${rs.relacion}.`,
      severidad: rs.peso >= 0.7 ? 'critica' : 'alta',
    });
  }

  // Insight: clientes en misma zona con siniestros
  const clientesMismaZona = await dbAll(
    "SELECT entidad_a_nombre as cliente1, entidad_b_nombre as cliente2 FROM knowledge_graph WHERE relacion = 'misma_zona' LIMIT 5"
  );
  for (const cmz of clientesMismaZona) {
    insightsDinamicos.push({
      tipo: 'misma_zona',
      titulo: `Clientes en misma zona`,
      descripcion: `${cmz.cliente1} y ${cmz.cliente2} se encuentran en la misma zona geografica. Verificar si hay relacion entre sus siniestros.`,
      severidad: 'info',
    });
  }

  return {
    insights_almacenados: insightsDB,
    insights_dinamicos: insightsDinamicos,
    total: insightsDB.length + insightsDinamicos.length,
    generado_en: new Date().toISOString(),
  };
}

/**
 * Estadisticas del grafo de conocimiento
 */
async function getEstadisticas() {
  const totalRelaciones = await dbGet('SELECT COUNT(*) as c FROM knowledge_graph');
  const totalInsights = await dbGet('SELECT COUNT(*) as c FROM knowledge_insights');

  // Contar entidades unicas
  const entidadesA = await dbAll('SELECT DISTINCT entidad_a_tipo, entidad_a_id FROM knowledge_graph');
  const entidadesB = await dbAll('SELECT DISTINCT entidad_b_tipo, entidad_b_id FROM knowledge_graph');
  const entidadesSet = new Set();
  for (const e of entidadesA) entidadesSet.add(`${e.entidad_a_tipo}:${e.entidad_a_id}`);
  for (const e of entidadesB) entidadesSet.add(`${e.entidad_b_tipo}:${e.entidad_b_id}`);

  // Distribucion de relaciones
  const tiposRelacion = await dbAll(
    'SELECT relacion, COUNT(*) as cantidad FROM knowledge_graph GROUP BY relacion ORDER BY cantidad DESC'
  );

  // Distribucion de entidades
  const tiposEntidad = await dbAll(
    "SELECT entidad_a_tipo as tipo, COUNT(*) as cantidad FROM knowledge_graph GROUP BY entidad_a_tipo UNION SELECT entidad_b_tipo as tipo, COUNT(*) as cantidad FROM knowledge_graph GROUP BY entidad_b_tipo"
  );

  // Redes de fraude
  const redesFraude = await detectarRedFraude();

  // Peso promedio
  const pesoPromedio = await dbGet('SELECT AVG(peso) as avg FROM knowledge_graph');

  // Relaciones de alto peso
  const altoPeso = await dbGet('SELECT COUNT(*) as c FROM knowledge_graph WHERE peso >= 0.7');

  return {
    entidades_totales: entidadesSet.size,
    relaciones_totales: totalRelaciones.c,
    redes_fraude_detectadas: redesFraude.total_redes,
    insights_generados: totalInsights.c,
    peso_promedio: pesoPromedio.avg ? parseFloat(pesoPromedio.avg.toFixed(3)) : 0,
    relaciones_alto_peso: altoPeso.c,
    tipos_relacion: tiposRelacion,
    riesgo_global: redesFraude.riesgo_global,
    ultima_construccion: new Date().toISOString(),
  };
}

/**
 * Agrega una relacion manual al grafo
 */
async function agregarRelacion(tipoA, idA, nombreA, relacion, tipoB, idB, nombreB, peso) {
  await insertarRelacion(tipoA, idA, nombreA, relacion, tipoB, idB, nombreB, peso || 1.0);
  return {
    agregado: true,
    relacion: { tipoA, idA, nombreA, relacion, tipoB, idB, nombreB, peso: peso || 1.0 },
  };
}

/**
 * Elimina una relacion del grafo
 */
async function eliminarRelacion(relacionId) {
  const result = await dbRun('DELETE FROM knowledge_graph WHERE id = ?', [relacionId]);
  return { eliminado: result.changes > 0, id: relacionId };
}

// ============================================================
// SEED DATA
// ============================================================
async function seedKnowledgeGraphData() {
  const existing = await dbGet('SELECT COUNT(*) as c FROM knowledge_insights');
  if (existing && existing.c > 0) {
    console.log('[KnowledgeGraphService] Knowledge graph ya tiene datos, omitiendo seed');
    return;
  }

  console.log('[KnowledgeGraphService] Insertando insights de ejemplo...');

  const insights = [
    {
      tipo: 'perito_proveedor',
      titulo: 'Perito y taller con alta correlacion',
      descripcion: 'El perito Carlos Ruiz Martinez y el taller AutoPro Valencia aparecen juntos en el 80% de los casos de Madrid. Verificar independencia entre perito y proveedor.',
      severidad: 'alta',
      entidades: [
        { tipo: 'perito', id: 'AGT-001', nombre: 'Carlos Ruiz Martinez' },
        { tipo: 'proveedor', id: 'PROV-LEV-01', nombre: 'Taller AutoPro Valencia' },
      ],
    },
    {
      tipo: 'direccion_compartida',
      titulo: 'Clientes con misma direccion',
      descripcion: '3 clientes en la misma direccion de Valencia han reportado siniestros similares en los ultimos 2 meses. Patron consistente con fraude organizado.',
      severidad: 'critica',
      entidades: [
        { tipo: 'cliente', id: 'CLI-003', nombre: 'Laura Mendez Torres' },
        { tipo: 'cliente', id: 'CLI-011', nombre: 'Elena Torres Vidal' },
      ],
    },
    {
      tipo: 'poliza_reciente',
      titulo: 'Poliza contratada justo antes del siniestro',
      descripcion: 'Carmen Vega Sanz contrato poliza Todo Riesgo hace solo 3 meses y ya reporta robo de BMW valorado en 42.000 EUR. Patron clasico de fraude por simulacion.',
      severidad: 'critica',
      entidades: [
        { tipo: 'cliente', id: 'CLI-009', nombre: 'Carmen Vega Sanz' },
        { tipo: 'siniestro', id: 'SIN-009', nombre: 'EXP-2024-0883' },
      ],
    },
    {
      tipo: 'zona_anomala',
      titulo: 'Cluster anomalo en zona Valencia',
      descripcion: 'La zona de Valencia muestra un 40% mas de siniestros tipo robo que la media nacional. Se recomienda reforzar investigacion en la zona.',
      severidad: 'alta',
      entidades: [
        { tipo: 'zona', id: 'Valencia', nombre: 'Valencia' },
      ],
    },
    {
      tipo: 'rendimiento',
      titulo: 'Perito con tiempos excelentes',
      descripcion: 'Carlos Ruiz Martinez resuelve casos un 22% mas rapido que la media. Sin embargo, su alta concentracion de casos en Madrid requiere verificacion de calidad.',
      severidad: 'info',
      entidades: [
        { tipo: 'perito', id: 'AGT-001', nombre: 'Carlos Ruiz Martinez' },
      ],
    },
  ];

  for (const ins of insights) {
    await insertarInsight(ins.tipo, ins.titulo, ins.descripcion, ins.severidad, ins.entidades);
  }

  // Construir grafo inicial
  try {
    await construirGrafo();
  } catch (err) {
    console.error('[KnowledgeGraphService] Error construyendo grafo inicial:', err.message);
  }

  console.log('[KnowledgeGraphService] Seed data insertado: 5 insights, grafo construido');
}

// ============================================================
// INICIALIZACION
// ============================================================
(async () => {
  try {
    await initKnowledgeGraphTables();
    await seedKnowledgeGraphData();
  } catch (err) {
    console.error('[KnowledgeGraphService] Error en inicializacion:', err.message);
  }
})();

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  initKnowledgeGraphTables,
  seedKnowledgeGraphData,
  construirGrafo,
  buscarRelaciones,
  detectarRedFraude,
  getGrafoCompleto,
  getInsights,
  getEstadisticas,
  agregarRelacion,
  eliminarRelacion,
};
