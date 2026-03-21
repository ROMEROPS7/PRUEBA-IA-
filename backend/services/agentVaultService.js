// ============================================================================
// AgentVault Service - Sistema multi-agente de gestion del conocimiento
// SiniestrosAI - Inspirado en Obsidian para agentes de IA
// ============================================================================

const { dbRun, dbAll, dbGet } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// ---------------------------------------------------------------------------
// Stopwords en espanol para TF-IDF
// ---------------------------------------------------------------------------
const STOPWORDS = new Set([
  'de', 'la', 'el', 'en', 'y', 'a', 'los', 'las', 'del', 'un', 'una',
  'por', 'con', 'para', 'es', 'al', 'lo', 'como', 'se', 'su', 'que',
  'no', 'mas', 'pero', 'sus', 'le', 'ya', 'o', 'fue', 'ha', 'ser',
  'son', 'esta', 'era', 'muy', 'sin', 'sobre', 'entre', 'cuando', 'todo',
  'ser', 'tambien', 'otro', 'hasta', 'desde', 'cada', 'nos', 'les',
  'ni', 'si', 'mismo', 'ante', 'hacia', 'este', 'ese', 'aquel'
]);

const MAX_TERMS_PER_DOC = 30;

// ============================================================================
// INICIALIZACION DE TABLAS
// ============================================================================

async function initVaultTables() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS agent_notebook (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      tipo TEXT NOT NULL,
      titulo TEXT NOT NULL,
      contenido TEXT NOT NULL,
      contexto TEXT,
      tags TEXT,
      importancia INTEGER DEFAULT 5,
      verificado INTEGER DEFAULT 0,
      fecha TEXT DEFAULT (datetime('now'))
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS hallazgos (
      id TEXT PRIMARY KEY,
      agente_origen TEXT NOT NULL,
      agente_nombre TEXT NOT NULL,
      categoria TEXT NOT NULL,
      fuente TEXT NOT NULL,
      titulo TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      evidencia TEXT,
      nivel_confianza INTEGER NOT NULL,
      impacto TEXT DEFAULT 'medio',
      estado TEXT DEFAULT 'nuevo',
      entidades_relacionadas TEXT,
      votos_utilidad INTEGER DEFAULT 0,
      consultado_por TEXT,
      fecha TEXT DEFAULT (datetime('now')),
      actualizado_en TEXT DEFAULT (datetime('now'))
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS memory_subagents (
      id TEXT PRIMARY KEY,
      parent_agent_id TEXT NOT NULL,
      parent_agent_name TEXT NOT NULL,
      estado TEXT DEFAULT 'activo',
      especialidad TEXT,
      entradas_procesadas INTEGER DEFAULT 0,
      hallazgos_generados INTEGER DEFAULT 0,
      ultimo_ciclo TEXT,
      creado_en TEXT DEFAULT (datetime('now'))
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS vault_search_index (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      termino TEXT NOT NULL,
      tf_idf REAL NOT NULL,
      UNIQUE(source_type, source_id, termino)
    )
  `);

  // Indices para rendimiento
  await dbRun(`CREATE INDEX IF NOT EXISTS idx_notebook_agent ON agent_notebook(agent_id)`);
  await dbRun(`CREATE INDEX IF NOT EXISTS idx_notebook_tipo ON agent_notebook(tipo)`);
  await dbRun(`CREATE INDEX IF NOT EXISTS idx_notebook_fecha ON agent_notebook(fecha)`);
  await dbRun(`CREATE INDEX IF NOT EXISTS idx_hallazgos_categoria ON hallazgos(categoria)`);
  await dbRun(`CREATE INDEX IF NOT EXISTS idx_hallazgos_fuente ON hallazgos(fuente)`);
  await dbRun(`CREATE INDEX IF NOT EXISTS idx_hallazgos_estado ON hallazgos(estado)`);
  await dbRun(`CREATE INDEX IF NOT EXISTS idx_hallazgos_agente ON hallazgos(agente_origen)`);
  await dbRun(`CREATE INDEX IF NOT EXISTS idx_hallazgos_confianza ON hallazgos(nivel_confianza)`);
  await dbRun(`CREATE INDEX IF NOT EXISTS idx_subagents_parent ON memory_subagents(parent_agent_id)`);
  await dbRun(`CREATE INDEX IF NOT EXISTS idx_search_termino ON vault_search_index(termino)`);
  await dbRun(`CREATE INDEX IF NOT EXISTS idx_search_source ON vault_search_index(source_type, source_id)`);

  console.log('[AgentVault] Tablas e indices inicializados correctamente');
}

// ============================================================================
// CUADERNOS DE AGENTES (NOTEBOOKS)
// ============================================================================

/**
 * Escribe una entrada en el cuaderno de trabajo de un agente.
 */
async function escribirCuaderno(agentId, agentName, tipo, titulo, contenido, opts = {}) {
  const id = uuidv4();
  const contexto = opts.contexto ? JSON.stringify(opts.contexto) : null;
  const tags = opts.tags || null;
  const importancia = opts.importancia || 5;

  await dbRun(
    `INSERT INTO agent_notebook (id, agent_id, agent_name, tipo, titulo, contenido, contexto, tags, importancia)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, agentId, agentName, tipo, titulo, contenido, contexto, tags, importancia]
  );

  // Indexar para busqueda semantica
  await indexarDocumento('notebook', id, `${titulo} ${contenido}`);

  return { id, agent_id: agentId, tipo, titulo };
}

/**
 * Lee el cuaderno propio de un agente con filtros opcionales.
 */
async function leerCuaderno(agentId, opts = {}) {
  let sql = 'SELECT * FROM agent_notebook WHERE agent_id = ?';
  const params = [agentId];

  if (opts.tipo) {
    sql += ' AND tipo = ?';
    params.push(opts.tipo);
  }
  if (opts.desde_fecha) {
    sql += ' AND fecha >= ?';
    params.push(opts.desde_fecha);
  }

  sql += ' ORDER BY fecha DESC';

  if (opts.limit) {
    sql += ' LIMIT ?';
    params.push(opts.limit);
  }

  const rows = await dbAll(sql, params);
  return rows.map(r => ({
    ...r,
    contexto: r.contexto ? JSON.parse(r.contexto) : null
  }));
}

/**
 * Lee el cuaderno de otro agente. Registra el acceso en el cuaderno propio.
 */
async function leerCuadernoAjeno(agentId, targetAgentId, opts = {}) {
  // Registrar el acceso como observacion en el cuaderno del agente que consulta
  const agentRow = await dbGet('SELECT agent_name FROM agent_notebook WHERE agent_id = ? LIMIT 1', [agentId]);
  const agentName = agentRow ? agentRow.agent_name : agentId;

  const targetRow = await dbGet('SELECT agent_name FROM agent_notebook WHERE agent_id = ? LIMIT 1', [targetAgentId]);
  const targetName = targetRow ? targetRow.agent_name : targetAgentId;

  await escribirCuaderno(
    agentId,
    agentName,
    'observacion',
    `Consulta al cuaderno de ${targetName}`,
    `Acceso de lectura al cuaderno del agente ${targetName} (${targetAgentId})`,
    { contexto: { accion: 'lectura_cuaderno_ajeno', target_agent: targetAgentId }, importancia: 2 }
  );

  // Devolver las entradas del cuaderno objetivo
  return await leerCuaderno(targetAgentId, opts);
}

/**
 * Resumen de todos los cuadernos: entradas por agente, ultima fecha.
 */
async function getCuadernosResumen() {
  const resumen = await dbAll(`
    SELECT
      agent_id,
      agent_name,
      COUNT(*) as total_entradas,
      SUM(CASE WHEN tipo = 'observacion' THEN 1 ELSE 0 END) as observaciones,
      SUM(CASE WHEN tipo = 'decision' THEN 1 ELSE 0 END) as decisiones,
      SUM(CASE WHEN tipo = 'aprendizaje' THEN 1 ELSE 0 END) as aprendizajes,
      SUM(CASE WHEN tipo = 'hipotesis' THEN 1 ELSE 0 END) as hipotesis,
      SUM(CASE WHEN tipo = 'alerta' THEN 1 ELSE 0 END) as alertas,
      SUM(CASE WHEN tipo = 'reflexion' THEN 1 ELSE 0 END) as reflexiones,
      MAX(fecha) as ultima_entrada,
      ROUND(AVG(importancia), 1) as importancia_media
    FROM agent_notebook
    GROUP BY agent_id, agent_name
    ORDER BY total_entradas DESC
  `);
  return resumen;
}

// ============================================================================
// ALMACEN DE HALLAZGOS
// ============================================================================

/**
 * Deposita un hallazgo en el almacen central.
 */
async function depositarHallazgo(agenteId, agenteName, categoria, fuente, titulo, descripcion, opts = {}) {
  const id = uuidv4();
  const evidencia = opts.evidencia ? JSON.stringify(opts.evidencia) : null;
  const nivelConfianza = opts.nivel_confianza || 50;
  const impacto = opts.impacto || 'medio';
  const entidadesRelacionadas = opts.entidades_relacionadas ? JSON.stringify(opts.entidades_relacionadas) : null;

  await dbRun(
    `INSERT INTO hallazgos (id, agente_origen, agente_nombre, categoria, fuente, titulo, descripcion, evidencia, nivel_confianza, impacto, entidades_relacionadas)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, agenteId, agenteName, categoria, fuente, titulo, descripcion, evidencia, nivelConfianza, impacto, entidadesRelacionadas]
  );

  // Indexar para busqueda semantica
  await indexarDocumento('hallazgo', id, `${titulo} ${descripcion}`);

  return { id, categoria, fuente, titulo, nivel_confianza: nivelConfianza };
}

/**
 * Lista hallazgos con filtros multiples.
 */
async function getHallazgos(opts = {}) {
  let sql = 'SELECT * FROM hallazgos WHERE 1=1';
  const params = [];

  if (opts.categoria) {
    sql += ' AND categoria = ?';
    params.push(opts.categoria);
  }
  if (opts.fuente) {
    sql += ' AND fuente = ?';
    params.push(opts.fuente);
  }
  if (opts.impacto) {
    sql += ' AND impacto = ?';
    params.push(opts.impacto);
  }
  if (opts.estado) {
    sql += ' AND estado = ?';
    params.push(opts.estado);
  }
  if (opts.agente_origen) {
    sql += ' AND agente_origen = ?';
    params.push(opts.agente_origen);
  }
  if (opts.min_confianza) {
    sql += ' AND nivel_confianza >= ?';
    params.push(opts.min_confianza);
  }

  const orderBy = opts.order_by || 'fecha DESC';
  sql += ` ORDER BY ${orderBy}`;

  if (opts.limit) {
    sql += ' LIMIT ?';
    params.push(opts.limit);
  }

  const rows = await dbAll(sql, params);
  return rows.map(r => ({
    ...r,
    evidencia: r.evidencia ? JSON.parse(r.evidencia) : null,
    entidades_relacionadas: r.entidades_relacionadas ? JSON.parse(r.entidades_relacionadas) : null,
    consultado_por: r.consultado_por ? JSON.parse(r.consultado_por) : []
  }));
}

/**
 * Vota la utilidad de un hallazgo y registra quien lo consulto.
 */
async function votarHallazgo(hallazgoId, agenteId) {
  const hallazgo = await dbGet('SELECT consultado_por, votos_utilidad FROM hallazgos WHERE id = ?', [hallazgoId]);
  if (!hallazgo) throw new Error(`Hallazgo ${hallazgoId} no encontrado`);

  let consultadoPor = hallazgo.consultado_por ? JSON.parse(hallazgo.consultado_por) : [];
  if (!consultadoPor.includes(agenteId)) {
    consultadoPor.push(agenteId);
  }

  await dbRun(
    `UPDATE hallazgos SET votos_utilidad = votos_utilidad + 1, consultado_por = ?, actualizado_en = datetime('now') WHERE id = ?`,
    [JSON.stringify(consultadoPor), hallazgoId]
  );

  return { hallazgoId, votos_utilidad: hallazgo.votos_utilidad + 1, consultado_por: consultadoPor };
}

/**
 * Actualiza el estado de un hallazgo.
 */
async function actualizarEstadoHallazgo(hallazgoId, nuevoEstado) {
  const estadosValidos = ['nuevo', 'verificado', 'aplicado', 'descartado', 'archivado'];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error(`Estado invalido: ${nuevoEstado}. Validos: ${estadosValidos.join(', ')}`);
  }

  await dbRun(
    `UPDATE hallazgos SET estado = ?, actualizado_en = datetime('now') WHERE id = ?`,
    [nuevoEstado, hallazgoId]
  );

  return { hallazgoId, estado: nuevoEstado };
}

/**
 * Obtiene hallazgos mas relevantes para el trabajo actual de un agente.
 * Prioriza por confianza, impacto y recencia.
 */
async function getHallazgosRelevantes(agenteId, contexto = {}) {
  const impactoPeso = { critico: 4, alto: 3, medio: 2, bajo: 1 };

  let sql = `
    SELECT *,
      (nivel_confianza * 0.01) *
      (CASE impacto
        WHEN 'critico' THEN 4
        WHEN 'alto' THEN 3
        WHEN 'medio' THEN 2
        WHEN 'bajo' THEN 1
        ELSE 2
      END) *
      (1.0 / (1 + (julianday('now') - julianday(fecha)))) AS relevancia_score
    FROM hallazgos
    WHERE estado IN ('nuevo', 'verificado')
      AND agente_origen != ?
  `;
  const params = [agenteId];

  if (contexto.categoria) {
    sql += ' AND categoria = ?';
    params.push(contexto.categoria);
  }
  if (contexto.min_confianza) {
    sql += ' AND nivel_confianza >= ?';
    params.push(contexto.min_confianza);
  }

  sql += ' ORDER BY relevancia_score DESC LIMIT 20';

  const rows = await dbAll(sql, params);
  return rows.map(r => ({
    ...r,
    evidencia: r.evidencia ? JSON.parse(r.evidencia) : null,
    entidades_relacionadas: r.entidades_relacionadas ? JSON.parse(r.entidades_relacionadas) : null,
    consultado_por: r.consultado_por ? JSON.parse(r.consultado_por) : []
  }));
}

/**
 * Estadisticas globales de hallazgos.
 */
async function getEstadisticasHallazgos() {
  const porCategoria = await dbAll(`
    SELECT categoria, COUNT(*) as total, ROUND(AVG(nivel_confianza), 1) as confianza_media
    FROM hallazgos GROUP BY categoria ORDER BY total DESC
  `);

  const porFuente = await dbAll(`
    SELECT fuente, COUNT(*) as total, ROUND(AVG(nivel_confianza), 1) as confianza_media
    FROM hallazgos GROUP BY fuente ORDER BY total DESC
  `);

  const porImpacto = await dbAll(`
    SELECT impacto, COUNT(*) as total FROM hallazgos GROUP BY impacto
  `);

  const porEstado = await dbAll(`
    SELECT estado, COUNT(*) as total FROM hallazgos GROUP BY estado
  `);

  const porAgente = await dbAll(`
    SELECT agente_origen, agente_nombre, COUNT(*) as total,
      ROUND(AVG(nivel_confianza), 1) as confianza_media,
      SUM(votos_utilidad) as votos_totales
    FROM hallazgos GROUP BY agente_origen, agente_nombre ORDER BY total DESC
  `);

  const general = await dbGet(`
    SELECT COUNT(*) as total,
      ROUND(AVG(nivel_confianza), 1) as confianza_media,
      SUM(votos_utilidad) as votos_totales,
      MIN(fecha) as primer_hallazgo,
      MAX(fecha) as ultimo_hallazgo
    FROM hallazgos
  `);

  return {
    general,
    por_categoria: porCategoria,
    por_fuente: porFuente,
    por_impacto: porImpacto,
    por_estado: porEstado,
    por_agente: porAgente
  };
}

// ============================================================================
// SUB-AGENTES DE MEMORIA
// ============================================================================

/**
 * Crea un sub-agente de memoria dedicado para un agente padre.
 */
async function spawnMemorySubagent(parentAgentId, parentAgentName, especialidad) {
  const id = uuidv4();

  await dbRun(
    `INSERT INTO memory_subagents (id, parent_agent_id, parent_agent_name, especialidad)
     VALUES (?, ?, ?, ?)`,
    [id, parentAgentId, parentAgentName, especialidad]
  );

  console.log(`[AgentVault] Sub-agente de memoria creado: ${id} para ${parentAgentName} (${especialidad})`);
  return { id, parent_agent_id: parentAgentId, especialidad, estado: 'activo' };
}

/**
 * Lista los sub-agentes de memoria de un agente padre.
 */
async function getSubagents(parentAgentId) {
  return await dbAll(
    'SELECT * FROM memory_subagents WHERE parent_agent_id = ? ORDER BY creado_en DESC',
    [parentAgentId]
  );
}

/**
 * Ejecuta un ciclo de memoria: escanea entradas recientes del cuaderno del agente padre,
 * cruza con hallazgos de otros agentes, genera nuevos insights y actualiza el indice.
 */
async function cicloMemoria(subagentId) {
  const subagent = await dbGet('SELECT * FROM memory_subagents WHERE id = ?', [subagentId]);
  if (!subagent) throw new Error(`Sub-agente ${subagentId} no encontrado`);
  if (subagent.estado !== 'activo') throw new Error(`Sub-agente ${subagentId} no esta activo (estado: ${subagent.estado})`);

  const parentId = subagent.parent_agent_id;
  const parentName = subagent.parent_agent_name;

  // 1. Escanear entradas recientes del cuaderno padre (ultimas 24h o desde ultimo ciclo)
  const desdeFecha = subagent.ultimo_ciclo || new Date(Date.now() - 86400000).toISOString();
  const entradasRecientes = await dbAll(
    `SELECT * FROM agent_notebook WHERE agent_id = ? AND fecha >= ? ORDER BY fecha DESC`,
    [parentId, desdeFecha]
  );

  // 2. Obtener hallazgos recientes de otros agentes
  const hallazgosOtros = await dbAll(
    `SELECT * FROM hallazgos WHERE agente_origen != ? AND estado IN ('nuevo', 'verificado') AND fecha >= ? ORDER BY nivel_confianza DESC LIMIT 50`,
    [parentId, desdeFecha]
  );

  // 3. Buscar correlaciones entre entradas propias y hallazgos ajenos
  let hallazgosGenerados = 0;

  for (const entrada of entradasRecientes) {
    const textoEntrada = `${entrada.titulo} ${entrada.contenido}`.toLowerCase();
    const terminosEntrada = tokenizar(textoEntrada);

    for (const hallazgo of hallazgosOtros) {
      const textoHallazgo = `${hallazgo.titulo} ${hallazgo.descripcion}`.toLowerCase();
      const terminosHallazgo = tokenizar(textoHallazgo);

      // Calcular solapamiento de terminos
      const interseccion = terminosEntrada.filter(t => terminosHallazgo.includes(t));
      const union = new Set([...terminosEntrada, ...terminosHallazgo]);
      const similitud = union.size > 0 ? interseccion.length / union.size : 0;

      // Si hay correlacion significativa, generar un hallazgo de tipo correlacion
      if (similitud > 0.15 && interseccion.length >= 3) {
        await depositarHallazgo(
          parentId,
          parentName,
          'correlacion',
          'cruce_expedientes',
          `Correlacion detectada: ${entrada.titulo} <-> ${hallazgo.titulo}`,
          `El sub-agente de memoria detecto una correlacion (similitud: ${(similitud * 100).toFixed(1)}%) entre una entrada del cuaderno de ${parentName} y un hallazgo de ${hallazgo.agente_nombre}. Terminos comunes: ${interseccion.slice(0, 10).join(', ')}`,
          {
            nivel_confianza: Math.round(similitud * 100),
            impacto: similitud > 0.3 ? 'alto' : 'medio',
            evidencia: [
              { tipo: 'entrada_cuaderno', id: entrada.id, titulo: entrada.titulo },
              { tipo: 'hallazgo', id: hallazgo.id, titulo: hallazgo.titulo }
            ],
            entidades_relacionadas: [parentId, hallazgo.agente_origen]
          }
        );
        hallazgosGenerados++;
      }
    }
  }

  // 4. Reindexar entradas recientes que no estuvieran indexadas
  for (const entrada of entradasRecientes) {
    await indexarDocumento('notebook', entrada.id, `${entrada.titulo} ${entrada.contenido}`);
  }

  // 5. Actualizar estado del sub-agente
  await dbRun(
    `UPDATE memory_subagents
     SET entradas_procesadas = entradas_procesadas + ?,
         hallazgos_generados = hallazgos_generados + ?,
         ultimo_ciclo = datetime('now')
     WHERE id = ?`,
    [entradasRecientes.length, hallazgosGenerados, subagentId]
  );

  return {
    subagent_id: subagentId,
    entradas_escaneadas: entradasRecientes.length,
    hallazgos_cruzados: hallazgosOtros.length,
    hallazgos_generados: hallazgosGenerados,
    ciclo_completado: new Date().toISOString()
  };
}

/**
 * Termina un sub-agente de memoria.
 */
async function terminateSubagent(subagentId) {
  await dbRun(
    `UPDATE memory_subagents SET estado = 'terminado' WHERE id = ?`,
    [subagentId]
  );
  return { subagent_id: subagentId, estado: 'terminado' };
}

// ============================================================================
// BUSQUEDA SEMANTICA (TF-IDF)
// ============================================================================

/**
 * Tokeniza texto en espanol: minusculas, split en no-alfanumericos, elimina stopwords.
 */
function tokenizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos para normalizacion
    .split(/[^a-z0-9]+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
}

/**
 * Indexa un documento (notebook o hallazgo) calculando TF-IDF y almacenando los top N terminos.
 */
async function indexarDocumento(sourceType, sourceId, texto) {
  const terminos = tokenizar(texto);
  if (terminos.length === 0) return;

  // Calcular TF (frecuencia de termino)
  const conteo = {};
  for (const t of terminos) {
    conteo[t] = (conteo[t] || 0) + 1;
  }

  const totalTerminos = terminos.length;

  // Obtener total de documentos para IDF
  const countNotebook = await dbGet('SELECT COUNT(*) as c FROM agent_notebook');
  const countHallazgos = await dbGet('SELECT COUNT(*) as c FROM hallazgos');
  const totalDocs = (countNotebook ? countNotebook.c : 0) + (countHallazgos ? countHallazgos.c : 0);

  // Calcular TF-IDF para cada termino
  const scores = [];
  for (const [termino, count] of Object.entries(conteo)) {
    const tf = count / totalTerminos;

    // IDF: documentos que contienen este termino (aproximacion via indice existente)
    const docsConTermino = await dbGet(
      'SELECT COUNT(DISTINCT source_id) as c FROM vault_search_index WHERE termino = ?',
      [termino]
    );
    const docFreq = docsConTermino ? docsConTermino.c : 0;
    const idf = Math.log((totalDocs + 1) / (docFreq + 1)) + 1; // Suavizado

    scores.push({ termino, tf_idf: tf * idf });
  }

  // Ordenar por TF-IDF y quedarse con los top N
  scores.sort((a, b) => b.tf_idf - a.tf_idf);
  const topScores = scores.slice(0, MAX_TERMS_PER_DOC);

  // Eliminar entradas previas de este documento
  await dbRun(
    'DELETE FROM vault_search_index WHERE source_type = ? AND source_id = ?',
    [sourceType, sourceId]
  );

  // Insertar nuevos scores
  for (const s of topScores) {
    await dbRun(
      `INSERT OR REPLACE INTO vault_search_index (source_type, source_id, termino, tf_idf)
       VALUES (?, ?, ?, ?)`,
      [sourceType, sourceId, s.termino, s.tf_idf]
    );
  }
}

/**
 * Busqueda semantica en el vault usando TF-IDF.
 * Devuelve documentos ordenados por relevancia.
 */
async function busquedaSemantica(query, opts = {}) {
  const terminosQuery = tokenizar(query);
  if (terminosQuery.length === 0) return [];

  const limit = opts.limit || 20;
  const minScore = opts.min_score || 0.01;

  // Buscar documentos que contengan cualquiera de los terminos de la query
  const placeholders = terminosQuery.map(() => '?').join(',');
  let sql = `
    SELECT source_type, source_id, SUM(tf_idf) as score
    FROM vault_search_index
    WHERE termino IN (${placeholders})
  `;
  const params = [...terminosQuery];

  if (opts.source_type) {
    sql += ' AND source_type = ?';
    params.push(opts.source_type);
  }

  sql += ` GROUP BY source_type, source_id HAVING score >= ? ORDER BY score DESC LIMIT ?`;
  params.push(minScore, limit);

  const resultados = await dbAll(sql, params);

  // Enriquecer resultados con datos completos del documento
  const enriquecidos = [];
  for (const r of resultados) {
    let documento = null;
    if (r.source_type === 'notebook') {
      documento = await dbGet('SELECT * FROM agent_notebook WHERE id = ?', [r.source_id]);
      if (documento && documento.contexto) {
        documento.contexto = JSON.parse(documento.contexto);
      }
    } else if (r.source_type === 'hallazgo') {
      documento = await dbGet('SELECT * FROM hallazgos WHERE id = ?', [r.source_id]);
      if (documento) {
        if (documento.evidencia) documento.evidencia = JSON.parse(documento.evidencia);
        if (documento.entidades_relacionadas) documento.entidades_relacionadas = JSON.parse(documento.entidades_relacionadas);
        if (documento.consultado_por) documento.consultado_por = JSON.parse(documento.consultado_por);
      }
    }

    if (documento) {
      enriquecidos.push({
        source_type: r.source_type,
        source_id: r.source_id,
        score: r.score,
        documento
      });
    }
  }

  return enriquecidos;
}

/**
 * Reconstruye todo el indice de busqueda desde cero.
 */
async function reindexarVault() {
  console.log('[AgentVault] Reindexando vault completo...');

  // Limpiar indice
  await dbRun('DELETE FROM vault_search_index');

  // Reindexar notebooks
  const notebooks = await dbAll('SELECT id, titulo, contenido FROM agent_notebook');
  for (const n of notebooks) {
    await indexarDocumento('notebook', n.id, `${n.titulo} ${n.contenido}`);
  }

  // Reindexar hallazgos
  const hallazgos = await dbAll('SELECT id, titulo, descripcion FROM hallazgos');
  for (const h of hallazgos) {
    await indexarDocumento('hallazgo', h.id, `${h.titulo} ${h.descripcion}`);
  }

  console.log(`[AgentVault] Reindexacion completa: ${notebooks.length} notebooks, ${hallazgos.length} hallazgos`);
  return { notebooks_indexados: notebooks.length, hallazgos_indexados: hallazgos.length };
}

// ============================================================================
// SEED DATA
// ============================================================================

async function seedVaultData() {
  // Verificar si ya hay datos
  const existente = await dbGet('SELECT COUNT(*) as c FROM agent_notebook');
  if (existente && existente.c > 0) {
    console.log('[AgentVault] Datos ya existentes, omitiendo seed');
    return;
  }

  console.log('[AgentVault] Generando datos de ejemplo...');

  // Definir agentes
  const agentes = {
    recepcionista: { id: 'agent-recepcionista-001', nombre: 'Recepcionista IA' },
    antifraude: { id: 'agent-antifraude-002', nombre: 'Anti-Fraude IA' },
    negociador: { id: 'agent-negociador-003', nombre: 'Negociador IA' },
    perito: { id: 'agent-perito-004', nombre: 'Perito Virtual IA' },
    vigilante: { id: 'agent-vigilante-005', nombre: 'Vigilante SLA IA' },
    legal: { id: 'agent-legal-006', nombre: 'Asesor Legal IA' }
  };

  // --- CUADERNOS DE AGENTES ---

  // Recepcionista
  await escribirCuaderno(agentes.recepcionista.id, agentes.recepcionista.nombre, 'observacion',
    'Pico de siniestros zona costera',
    'Se ha detectado un incremento del 340% en apertura de siniestros de hogar en las provincias costeras de Tarragona y Castellon durante las ultimas 48 horas. Coincide con alerta AEMET por temporal mediterraneo. Recomiendo activar protocolo de catastrofe para agilizar tramitacion.',
    { contexto: { zona: 'costa_mediterranea', tipo_siniestro: 'hogar' }, tags: 'temporal,catastrofe,hogar,costa', importancia: 9 }
  );

  await escribirCuaderno(agentes.recepcionista.id, agentes.recepcionista.nombre, 'decision',
    'Activacion de protocolo express para danios por agua',
    'Ante la avalancha de reclamaciones por inundaciones, he activado el canal express de tramitacion. Los siniestros de danio por agua con cuantia estimada inferior a 3.000 EUR se procesan automaticamente sin peritacion presencial. Notificado al equipo de peritos virtuales.',
    { contexto: { protocolo: 'express_agua', umbral: 3000 }, tags: 'protocolo,express,inundacion', importancia: 8 }
  );

  await escribirCuaderno(agentes.recepcionista.id, agentes.recepcionista.nombre, 'aprendizaje',
    'Patron de llamadas duplicadas en temporales',
    'Durante eventos meteorologicos, el 23% de los asegurados realizan multiples llamadas en las primeras 24 horas. Implementar sistema de tracking por NIF para evitar duplicidades y ofrecer seguimiento proactivo reduce la carga en un 35%.',
    { contexto: { metrica: 'duplicidad_llamadas', reduccion: 35 }, tags: 'duplicidad,llamadas,temporal,mejora', importancia: 7 }
  );

  // Anti-Fraude
  await escribirCuaderno(agentes.antifraude.id, agentes.antifraude.nombre, 'alerta',
    'Red de talleres sospechosa en Barcelona',
    'Detectada correlacion anomala entre 4 talleres del area metropolitana de Barcelona que comparten el mismo patron de facturacion. Los importes se agrupan sistematicamente en torno a 2.450 EUR (justo por debajo del umbral de revision de 2.500 EUR). Patrones de facturacion identicos con variaciones cosmeticas. Se han identificado 47 expedientes potencialmente vinculados en los ultimos 6 meses.',
    { contexto: { talleres: ['T-BCN-112', 'T-BCN-089', 'T-BCN-201', 'T-BCN-177'], umbral: 2500, expedientes: 47 }, tags: 'fraude,talleres,barcelona,red,facturacion', importancia: 10 }
  );

  await escribirCuaderno(agentes.antifraude.id, agentes.antifraude.nombre, 'hipotesis',
    'Posible fraude estacional en robos de vehiculos',
    'Los datos de los ultimos 3 anios muestran un incremento del 180% en denuncias de robo de vehiculo en los meses de julio y agosto en zonas turisticas. Hipotesis: parte de estos siniestros son simulados para obtener indemnizacion y cubrir gastos vacacionales. Correlaciona con un 40% de polizas contratadas en los 90 dias previos al siniestro.',
    { contexto: { meses: ['julio', 'agosto'], incremento: 180, polizas_recientes: 40 }, tags: 'fraude,robo,vehiculo,estacional,hipotesis', importancia: 8 }
  );

  await escribirCuaderno(agentes.antifraude.id, agentes.antifraude.nombre, 'observacion',
    'Evolucion del fraude digital en reclamaciones medicas',
    'Aumento del 65% en reclamaciones con documentacion medica digitalizada que presenta inconsistencias de metadatos. Informes PDF con fechas de creacion posteriores a la supuesta emision, imagenes de resonancias con EXIF de dispositivos moviles en lugar de equipos medicos. Nuevo vector de fraude emergente.',
    { contexto: { incremento_fraude_digital: 65, tipo: 'documentacion_medica' }, tags: 'fraude,digital,documentacion,medica,metadatos', importancia: 9 }
  );

  // Negociador
  await escribirCuaderno(agentes.negociador.id, agentes.negociador.nombre, 'decision',
    'Ajuste de estrategia de negociacion para siniestros de hogar',
    'Basandome en el analisis de 1.200 negociaciones cerradas en el ultimo trimestre, la oferta inicial optima para siniestros de hogar por danio de agua se situa en el 72% de la tasacion pericial. Este punto de partida maximiza la satisfaccion del cliente (NPS > 7) y minimiza el coste medio de resolucion en un 12% respecto al trimestre anterior.',
    { contexto: { muestra: 1200, oferta_optima: 72, mejora_coste: 12 }, tags: 'negociacion,hogar,agua,estrategia,NPS', importancia: 8 }
  );

  await escribirCuaderno(agentes.negociador.id, agentes.negociador.nombre, 'reflexion',
    'Impacto emocional en las negociaciones de siniestros graves',
    'Las negociaciones de siniestros con lesiones personales requieren un enfoque radicalmente diferente. El analisis de sentimiento en las transcripciones revela que una respuesta empatica en los primeros 30 segundos reduce el tiempo de negociacion en un 45% y la probabilidad de reclamacion judicial en un 60%. Debo calibrar mejor el tono inicial.',
    { contexto: { reduccion_tiempo: 45, reduccion_judicial: 60 }, tags: 'negociacion,empatia,lesiones,sentimiento,mejora', importancia: 7 }
  );

  // Perito
  await escribirCuaderno(agentes.perito.id, agentes.perito.nombre, 'observacion',
    'Precision de valoracion por vision artificial mejorada',
    'Tras el reentrenamiento del modelo de vision con 15.000 nuevas imagenes de danios en vehiculos, la precision de la valoracion automatica ha pasado del 78% al 91%. Los mayores avances se concentran en danios de chapa y pintura. Los danios estructurales siguen requiriendo peritacion humana con precision del 67%.',
    { contexto: { precision_anterior: 78, precision_nueva: 91, imagenes_entrenamiento: 15000 }, tags: 'vision,IA,precision,vehiculos,peritacion', importancia: 8 }
  );

  await escribirCuaderno(agentes.perito.id, agentes.perito.nombre, 'aprendizaje',
    'Correlacion entre antigueedad del vehiculo y discrepancia en tasacion',
    'Vehiculos con mas de 10 anios de antigueedad presentan una discrepancia media del 34% entre el valor de mercado y el valor de reparacion. Para estos casos, la opcion de indemnizacion por siniestro total resulta un 28% mas economica. Recomiendo ajustar el umbral de siniestro total automatico.',
    { contexto: { antiguedad_umbral: 10, discrepancia: 34, ahorro: 28 }, tags: 'peritacion,vehiculo,antigueedad,siniestro_total,valoracion', importancia: 7 }
  );

  // Vigilante SLA
  await escribirCuaderno(agentes.vigilante.id, agentes.vigilante.nombre, 'alerta',
    'Degradacion critica del SLA en siniestros de salud',
    'El tiempo medio de respuesta en siniestros del ramo de salud ha superado las 72 horas en la ultima semana, frente al SLA comprometido de 24 horas. La causa principal es un cuello de botella en la validacion de autorizaciones medicas. 156 expedientes afectados. Riesgo de penalizacion regulatoria.',
    { contexto: { sla_actual: 72, sla_objetivo: 24, expedientes_afectados: 156 }, tags: 'SLA,salud,degradacion,autorizaciones,regulacion', importancia: 10 }
  );

  await escribirCuaderno(agentes.vigilante.id, agentes.vigilante.nombre, 'observacion',
    'Tendencia positiva en resolucion de siniestros auto',
    'El tiempo medio de resolucion de siniestros de automovil ha descendido un 18% en el ultimo mes gracias a la implementacion del peritaje virtual. Los siniestros de menor cuantia (<1.500 EUR) se resuelven en una media de 3.2 dias habiles, cumpliendo el SLA del 95%.',
    { contexto: { mejora: 18, umbral_cuantia: 1500, tiempo_medio: 3.2, cumplimiento_sla: 95 }, tags: 'SLA,auto,mejora,peritaje_virtual,resolucion', importancia: 6 }
  );

  // Legal
  await escribirCuaderno(agentes.legal.id, agentes.legal.nombre, 'decision',
    'Actualizacion de clausulas de exclusion por catastrofes naturales',
    'Tras la sentencia del Tribunal Supremo 2847/2024 sobre responsabilidad en danios por DANA, es necesario actualizar las clausulas de exclusion en las polizas multirriesgo hogar. La nueva jurisprudencia establece que los danios por inundacion derivados de infraestructura municipal deficiente no son excluibles como catastrofe natural. Impacto estimado: 2.3M EUR en reservas adicionales.',
    { contexto: { sentencia: 'TS-2847/2024', impacto_reservas: 2300000, tipo_poliza: 'multirriesgo_hogar' }, tags: 'legal,sentencia,DANA,exclusion,catastrofe,jurisprudencia', importancia: 9 }
  );

  await escribirCuaderno(agentes.legal.id, agentes.legal.nombre, 'aprendizaje',
    'Efectividad de la mediacion frente a litigio en reclamaciones de salud',
    'Analisis de 340 casos del ultimo anio: la mediacion resolvio el 78% de las reclamaciones de salud con un coste medio de 1.200 EUR, frente a los 8.500 EUR de coste medio del litigio judicial. El tiempo de resolucion se redujo de 14 meses a 45 dias. Priorizar derivacion a mediacion para todas las reclamaciones de salud inferiores a 15.000 EUR.',
    { contexto: { casos_analizados: 340, coste_mediacion: 1200, coste_litigio: 8500, tiempo_mediacion: 45, umbral: 15000 }, tags: 'legal,mediacion,litigio,salud,coste,eficiencia', importancia: 8 }
  );

  // --- HALLAZGOS ---

  await depositarHallazgo(agentes.antifraude.id, agentes.antifraude.nombre, 'fraude', 'analisis_datos',
    'Red de fraude organizado en talleres de Barcelona',
    'Identificada red de 4 talleres con patron de facturacion coordinado. 47 expedientes vinculados con importes sistematicamente inferiores a 2.500 EUR para evadir controles. Perdida estimada: 115.000 EUR.',
    { nivel_confianza: 87, impacto: 'critico', evidencia: [
      { tipo: 'patron_facturacion', descripcion: 'Agrupacion de importes en rango 2.300-2.490 EUR' },
      { tipo: 'vinculacion_talleres', descripcion: '4 talleres con CIF vinculados a misma estructura societaria' },
      { tipo: 'temporal', descripcion: 'Expedientes concentrados en ultimos 6 meses' }
    ], entidades_relacionadas: ['T-BCN-112', 'T-BCN-089', 'T-BCN-201', 'T-BCN-177'] }
  );

  await depositarHallazgo(agentes.antifraude.id, agentes.antifraude.nombre, 'fraude', 'cruce_expedientes',
    'Fraude por documentacion medica manipulada digitalmente',
    'Nuevo vector de fraude emergente: documentos medicos digitalizados con inconsistencias en metadatos. Aumento del 65% en el ultimo trimestre. Los informes PDF muestran fechas de creacion posteriores a la emision declarada.',
    { nivel_confianza: 73, impacto: 'alto', evidencia: [
      { tipo: 'metadatos_pdf', descripcion: 'Fechas de creacion incoherentes con fecha de emision medica' },
      { tipo: 'exif_imagenes', descripcion: 'Resonancias con EXIF de dispositivos moviles' }
    ], entidades_relacionadas: ['dept-salud', 'dept-peritacion'] }
  );

  await depositarHallazgo(agentes.perito.id, agentes.perito.nombre, 'mejora_proceso', 'revision_perito',
    'Peritacion virtual reduce tiempos en 60% para siniestros menores',
    'La implementacion del sistema de peritacion por videollamada y vision artificial ha reducido el tiempo medio de peritacion de 5 dias a 2 dias para siniestros de automovil con cuantia inferior a 1.500 EUR. Tasa de satisfaccion del asegurado: 8.2/10.',
    { nivel_confianza: 95, impacto: 'alto', evidencia: [
      { tipo: 'metrica', descripcion: 'Reduccion de 5 a 2 dias en tiempo de peritacion' },
      { tipo: 'satisfaccion', descripcion: 'NPS 8.2 sobre 10 en peritacion virtual' }
    ], entidades_relacionadas: ['dept-peritacion', 'dept-auto'] }
  );

  await depositarHallazgo(agentes.vigilante.id, agentes.vigilante.nombre, 'riesgo', 'monitor_sla',
    'Cuello de botella critico en autorizaciones medicas',
    'El proceso de validacion de autorizaciones medicas genera un retraso medio de 48 horas adicionales en la tramitacion de siniestros de salud. 156 expedientes en cola. Riesgo de penalizacion por incumplimiento de SLA regulatorio (24h).',
    { nivel_confianza: 92, impacto: 'critico', evidencia: [
      { tipo: 'cola_expedientes', descripcion: '156 expedientes pendientes de autorizacion' },
      { tipo: 'sla_breach', descripcion: 'SLA actual: 72h vs objetivo: 24h' }
    ], entidades_relacionadas: ['dept-salud', 'autorizaciones-medicas'] }
  );

  await depositarHallazgo(agentes.negociador.id, agentes.negociador.nombre, 'patron', 'interaccion_cliente',
    'Empatia inicial reduce litigiosidad en 60%',
    'Analisis de 2.400 transcripciones de negociacion revela que una respuesta empatica en los primeros 30 segundos de interaccion reduce la probabilidad de reclamacion judicial en un 60% y el tiempo de negociacion en un 45%. Patron aplicable a todos los ramos.',
    { nivel_confianza: 81, impacto: 'alto', evidencia: [
      { tipo: 'analisis_sentimiento', descripcion: '2.400 transcripciones analizadas' },
      { tipo: 'correlacion', descripcion: 'r=0.73 entre empatia inicial y resolucion amistosa' }
    ], entidades_relacionadas: ['dept-atencion-cliente', 'dept-legal'] }
  );

  await depositarHallazgo(agentes.legal.id, agentes.legal.nombre, 'riesgo', 'auditoria',
    'Nueva jurisprudencia sobre exclusiones por DANA requiere actualizacion de polizas',
    'La sentencia TS-2847/2024 invalida las clausulas de exclusion por catastrofe natural en caso de danios derivados de infraestructura municipal deficiente. Impacto estimado en reservas: 2.3M EUR. Afecta a todas las polizas multirriesgo hogar vigentes.',
    { nivel_confianza: 96, impacto: 'critico', evidencia: [
      { tipo: 'sentencia', descripcion: 'TS-2847/2024 sobre responsabilidad DANA' },
      { tipo: 'impacto_financiero', descripcion: '2.3M EUR en reservas adicionales' }
    ], entidades_relacionadas: ['dept-legal', 'dept-actuariado', 'polizas-hogar'] }
  );

  await depositarHallazgo(agentes.recepcionista.id, agentes.recepcionista.nombre, 'patron', 'interaccion_cliente',
    'Llamadas duplicadas en temporales representan 23% del volumen',
    'Durante eventos meteorologicos adversos, el 23% de las llamadas son seguimientos del mismo asegurado en las primeras 24 horas. Implementar tracking por NIF y seguimiento proactivo reduce la carga telefonica en un 35%.',
    { nivel_confianza: 88, impacto: 'medio', evidencia: [
      { tipo: 'estadistica', descripcion: '23% de duplicidad en temporales' },
      { tipo: 'mejora_implementada', descripcion: '35% reduccion con tracking NIF' }
    ], entidades_relacionadas: ['dept-call-center', 'dept-hogar'] }
  );

  await depositarHallazgo(agentes.perito.id, agentes.perito.nombre, 'anomalia', 'revision_perito',
    'Discrepancia sistematica en tasaciones de vehiculos antiguos',
    'Vehiculos con mas de 10 anios presentan discrepancia media del 34% entre valor de mercado y coste de reparacion. La indemnizacion por siniestro total resulta un 28% mas economica que la reparacion en estos casos.',
    { nivel_confianza: 85, impacto: 'medio', evidencia: [
      { tipo: 'analisis_valoraciones', descripcion: 'Muestra de 3.200 peritaciones de vehiculos' },
      { tipo: 'ahorro_potencial', descripcion: '28% ahorro aplicando siniestro total automatico' }
    ], entidades_relacionadas: ['dept-peritacion', 'dept-auto', 'dept-actuariado'] }
  );

  await depositarHallazgo(agentes.legal.id, agentes.legal.nombre, 'oportunidad', 'auditoria',
    'Mediacion reduce coste de reclamaciones de salud en 85%',
    'Analisis de 340 casos demuestra que la mediacion resuelve el 78% de reclamaciones de salud con coste medio de 1.200 EUR frente a 8.500 EUR del litigio. Tiempo de resolucion: 45 dias vs 14 meses. Priorizar mediacion para reclamaciones < 15.000 EUR.',
    { nivel_confianza: 91, impacto: 'alto', evidencia: [
      { tipo: 'analisis_coste', descripcion: '85% ahorro mediacion vs litigio (1.200 vs 8.500 EUR)' },
      { tipo: 'analisis_tiempo', descripcion: '90% reduccion tiempo (45 dias vs 14 meses)' }
    ], entidades_relacionadas: ['dept-legal', 'dept-salud'] }
  );

  await depositarHallazgo(agentes.antifraude.id, agentes.antifraude.nombre, 'fraude', 'analisis_datos',
    'Patron estacional de fraude en robos de vehiculos vacacionales',
    'Incremento del 180% en denuncias de robo vehicular en julio-agosto en zonas turisticas. El 40% de las polizas implicadas fueron contratadas en los 90 dias previos al siniestro. Alta probabilidad de fraude organizado estacional.',
    { nivel_confianza: 68, impacto: 'alto', evidencia: [
      { tipo: 'patron_temporal', descripcion: '180% incremento julio-agosto' },
      { tipo: 'polizas_recientes', descripcion: '40% polizas contratadas <90 dias antes' },
      { tipo: 'geolocalizacion', descripcion: 'Concentracion en zonas turisticas costeras' }
    ], entidades_relacionadas: ['dept-auto', 'dept-suscripcion'] }
  );

  await depositarHallazgo(agentes.vigilante.id, agentes.vigilante.nombre, 'mejora_proceso', 'monitor_sla',
    'Automatizacion de asignacion de peritos mejora SLA en 40%',
    'La asignacion automatica de peritos basada en proximidad geografica y especialidad ha reducido el tiempo de primera visita de 4.5 a 2.7 dias. El algoritmo de matching optimiza carga de trabajo y reduce desplazamientos innecesarios.',
    { nivel_confianza: 89, impacto: 'medio', evidencia: [
      { tipo: 'metrica', descripcion: 'Reduccion de 4.5 a 2.7 dias en primera visita' },
      { tipo: 'optimizacion', descripcion: 'Matching por proximidad y especialidad' }
    ], entidades_relacionadas: ['dept-peritacion', 'dept-operaciones'] }
  );

  // --- SUB-AGENTES DE MEMORIA ---

  await spawnMemorySubagent(agentes.antifraude.id, agentes.antifraude.nombre, 'deteccion_patrones_fraude');
  await spawnMemorySubagent(agentes.vigilante.id, agentes.vigilante.nombre, 'monitorizacion_sla_continua');
  await spawnMemorySubagent(agentes.perito.id, agentes.perito.nombre, 'calibracion_valoraciones');

  console.log('[AgentVault] Seed data generado correctamente');
}

// ============================================================================
// INICIALIZACION
// ============================================================================

(async () => {
  try {
    await initVaultTables();
    await seedVaultData();
  } catch (err) {
    console.error('[AgentVault] Error inicializando:', err.message);
  }
})();

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Inicializacion
  initVaultTables,
  seedVaultData,

  // Cuadernos
  escribirCuaderno,
  leerCuaderno,
  leerCuadernoAjeno,
  getCuadernosResumen,

  // Hallazgos
  depositarHallazgo,
  getHallazgos,
  votarHallazgo,
  actualizarEstadoHallazgo,
  getHallazgosRelevantes,
  getEstadisticasHallazgos,

  // Sub-agentes de memoria
  spawnMemorySubagent,
  getSubagents,
  cicloMemoria,
  terminateSubagent,

  // Busqueda semantica
  indexarDocumento,
  busquedaSemantica,
  reindexarVault,

  // Utilidades (exportadas para testing)
  tokenizar
};
