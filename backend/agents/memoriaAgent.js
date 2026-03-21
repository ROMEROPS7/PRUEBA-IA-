// =============================================================================
// MEMORIA AGENT - Second Brain for Client Interactions
// Remembers EVERYTHING about every client: interactions, emotions, preferences
// =============================================================================

const { v4: uuidv4 } = require('uuid');
const { dbRun, dbAll, dbGet } = require('../database/db');

// ---------------------------------------------------------------------------
// Database initialization
// ---------------------------------------------------------------------------
async function initMemoriaDB() {
  await dbRun(`CREATE TABLE IF NOT EXISTS memoria_cliente (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    contexto_emocional TEXT,
    canal TEXT,
    agente TEXT,
    importancia INTEGER DEFAULT 5,
    fecha TEXT DEFAULT (datetime('now'))
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS memoria_contexto (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    clave TEXT NOT NULL,
    valor TEXT NOT NULL,
    actualizado_en TEXT DEFAULT (datetime('now')),
    UNIQUE(cliente_id, clave)
  )`);

  await dbRun('CREATE INDEX IF NOT EXISTS idx_memoria_cliente ON memoria_cliente(cliente_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_memoria_tipo ON memoria_cliente(tipo)');

  console.log('[MemoriaAgent] Tablas de memoria inicializadas');
}

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Saves a memory associated with a client.
 * @param {string} clienteId
 * @param {string} tipo - interaccion|queja|preferencia|nota_agente|decision|sentimiento
 * @param {string} contenido - Free-text description
 * @param {object} meta - Optional: {contexto_emocional, canal, agente, importancia}
 */
async function recordar(clienteId, tipo, contenido, meta = {}) {
  const id = `MEM-${uuidv4().slice(0, 8)}`;
  const { contexto_emocional = null, canal = null, agente = null, importancia = 5 } = meta;

  await dbRun(
    `INSERT INTO memoria_cliente (id, cliente_id, tipo, contenido, contexto_emocional, canal, agente, importancia)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, clienteId, tipo, contenido, contexto_emocional, canal, agente, importancia]
  );

  // Auto-update emotional context if provided
  if (contexto_emocional) {
    await actualizarContexto(clienteId, 'ultimo_sentimiento', contexto_emocional);
  }
  await actualizarContexto(clienteId, 'ultima_interaccion_fecha', new Date().toISOString());
  await actualizarContexto(clienteId, 'ultimo_canal', canal || 'desconocido');

  return { id, clienteId, tipo, contenido, importancia, fecha: new Date().toISOString() };
}

/**
 * Returns ALL memories for a client, sorted by date desc and grouped by type.
 */
async function getMemoriaCliente(clienteId) {
  const memorias = await dbAll(
    'SELECT * FROM memoria_cliente WHERE cliente_id = ? ORDER BY fecha DESC',
    [clienteId]
  );

  const agrupadas = {};
  const tiposOrden = ['interaccion', 'queja', 'preferencia', 'nota_agente', 'decision', 'sentimiento'];
  for (const t of tiposOrden) {
    agrupadas[t] = [];
  }

  for (const m of memorias) {
    if (!agrupadas[m.tipo]) agrupadas[m.tipo] = [];
    agrupadas[m.tipo].push(m);
  }

  // Remove empty groups
  for (const key of Object.keys(agrupadas)) {
    if (agrupadas[key].length === 0) delete agrupadas[key];
  }

  return {
    cliente_id: clienteId,
    total_memorias: memorias.length,
    memorias_por_tipo: agrupadas,
    primera_memoria: memorias.length > 0 ? memorias[memorias.length - 1].fecha : null,
    ultima_memoria: memorias.length > 0 ? memorias[0].fecha : null
  };
}

/**
 * Returns the current context summary for a client.
 */
async function getContexto(clienteId) {
  const contextoRows = await dbAll(
    'SELECT clave, valor, actualizado_en FROM memoria_contexto WHERE cliente_id = ? ORDER BY actualizado_en DESC',
    [clienteId]
  );

  const contexto = {};
  for (const row of contextoRows) {
    contexto[row.clave] = { valor: row.valor, actualizado: row.actualizado_en };
  }

  // Gather latest interaction
  const ultimaInteraccion = await dbGet(
    `SELECT * FROM memoria_cliente WHERE cliente_id = ? AND tipo = 'interaccion' ORDER BY fecha DESC LIMIT 1`,
    [clienteId]
  );

  // Gather pending complaints
  const quejasPendientes = await dbAll(
    `SELECT * FROM memoria_cliente WHERE cliente_id = ? AND tipo = 'queja' ORDER BY fecha DESC LIMIT 5`,
    [clienteId]
  );

  // Gather preferences
  const preferencias = await dbAll(
    `SELECT contenido FROM memoria_cliente WHERE cliente_id = ? AND tipo = 'preferencia'`,
    [clienteId]
  );

  // Determine risk level from complaints and emotions
  const quejasRecientes = quejasPendientes.filter(q => {
    const diasDesde = (Date.now() - new Date(q.fecha).getTime()) / (1000 * 60 * 60 * 24);
    return diasDesde < 30;
  });
  let nivelRiesgo = 'bajo';
  if (quejasRecientes.length >= 3) nivelRiesgo = 'alto';
  else if (quejasRecientes.length >= 1) nivelRiesgo = 'medio';

  // Latest emotional state
  const ultimoSentimiento = await dbGet(
    `SELECT * FROM memoria_cliente WHERE cliente_id = ? AND tipo = 'sentimiento' ORDER BY fecha DESC LIMIT 1`,
    [clienteId]
  );

  return {
    cliente_id: clienteId,
    ultima_interaccion: ultimaInteraccion || null,
    estado_emocional: ultimoSentimiento ? ultimoSentimiento.contenido : 'desconocido',
    quejas_pendientes: quejasPendientes.length,
    quejas_recientes: quejasRecientes.length,
    preferencias: preferencias.map(p => p.contenido),
    nivel_riesgo: nivelRiesgo,
    contexto_adicional: contexto
  };
}

/**
 * THE KEY FUNCTION. Generates a briefing for an agent about to call a client.
 */
async function getBriefingLlamada(clienteId) {
  // Get client info from main table
  const cliente = await dbGet('SELECT * FROM clientes WHERE id = ?', [clienteId]);
  if (!cliente) {
    return { error: `Cliente ${clienteId} no encontrado` };
  }

  // Get context
  const ctx = await getContexto(clienteId);

  // Get active siniestros
  const siniestrosActivos = await dbAll(
    `SELECT * FROM siniestros WHERE cliente_id = ? AND estado NOT IN ('Resuelto', 'Cerrado') ORDER BY urgencia DESC`,
    [clienteId]
  );

  // Get resolved siniestros count
  const siniestrosResueltos = await dbGet(
    `SELECT COUNT(*) as total FROM siniestros WHERE cliente_id = ? AND estado IN ('Resuelto', 'Cerrado')`,
    [clienteId]
  );

  // Get all memories sorted by importance desc
  const memoriasImportantes = await dbAll(
    `SELECT * FROM memoria_cliente WHERE cliente_id = ? AND importancia >= 7 ORDER BY importancia DESC, fecha DESC LIMIT 5`,
    [clienteId]
  );

  // Get preferences
  const preferencias = await dbAll(
    `SELECT contenido FROM memoria_cliente WHERE cliente_id = ? AND tipo = 'preferencia'`,
    [clienteId]
  );

  // Get recent interactions for time since last
  const ultimaInteraccion = await dbGet(
    `SELECT * FROM memoria_cliente WHERE cliente_id = ? AND tipo = 'interaccion' ORDER BY fecha DESC LIMIT 1`,
    [clienteId]
  );

  // Determine alert level
  let alerta = 'NORMAL';
  if (ctx.nivel_riesgo === 'alto') alerta = 'ALERTA';
  else if (ctx.nivel_riesgo === 'medio') alerta = 'PRECAUCION';
  if (ctx.estado_emocional && ['enfadado', 'furioso', 'frustrado', 'muy_enfadado'].includes(ctx.estado_emocional.toLowerCase())) {
    alerta = 'PRECAUCION';
  }

  // Time since last interaction
  let tiempoDesdeUltima = 'Sin interacciones previas';
  if (ultimaInteraccion) {
    const diffMs = Date.now() - new Date(ultimaInteraccion.fecha).getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffDias > 0) tiempoDesdeUltima = `hace ${diffDias} dia(s)`;
    else if (diffHoras > 0) tiempoDesdeUltima = `hace ${diffHoras} hora(s)`;
    else tiempoDesdeUltima = 'hace menos de una hora';
  }

  // Build briefing lines
  const lineas = [];
  lineas.push(`${cliente.nombre} (${clienteId}) - ${alerta}`);
  lineas.push('');

  // Last interaction
  if (ultimaInteraccion) {
    const emocion = ultimaInteraccion.contexto_emocional
      ? `, estaba ${ultimaInteraccion.contexto_emocional.toUpperCase()}`
      : '';
    lineas.push(`- Ultima interaccion: ${tiempoDesdeUltima}${emocion}${ultimaInteraccion.contenido ? ' - ' + ultimaInteraccion.contenido : ''}`);
  }

  // Active claims
  if (siniestrosActivos.length > 0) {
    for (const s of siniestrosActivos) {
      const diasAbierto = Math.floor((Date.now() - new Date(s.fecha_creacion).getTime()) / (1000 * 60 * 60 * 24));
      lineas.push(`- Siniestro activo: ${s.expediente} (${s.tipo} - ${s.descripcion.substring(0, 60)}), lleva ${diasAbierto} dias abierto`);
    }
  } else {
    lineas.push('- Sin siniestros activos');
  }

  // Preferences
  if (preferencias.length > 0) {
    for (const p of preferencias) {
      lineas.push(`- Preferencia: ${p.contenido}`);
    }
  }

  // History
  const totalSiniestros = siniestrosActivos.length + (siniestrosResueltos ? siniestrosResueltos.total : 0);
  lineas.push(`- Historial: ${siniestrosResueltos ? siniestrosResueltos.total : 0} siniestros previos resueltos, ${totalSiniestros} total`);

  // Important notes
  for (const m of memoriasImportantes) {
    lineas.push(`- IMPORTANTE: ${m.contenido}`);
  }

  // Recommended tone
  let tono = 'Profesional y cercano';
  if (ctx.estado_emocional === 'enfadado' || ctx.estado_emocional === 'frustrado') {
    tono = 'Empatico y resolutivo. No ser excesivamente formal.';
  } else if (ctx.estado_emocional === 'preocupado' || ctx.estado_emocional === 'ansioso') {
    tono = 'Tranquilizador y claro. Dar plazos concretos.';
  } else if (ctx.estado_emocional === 'satisfecho' || ctx.estado_emocional === 'contento') {
    tono = 'Amigable y eficiente. Agradecer su confianza.';
  }
  lineas.push(`- Tono recomendado: ${tono}`);

  return {
    cliente_id: clienteId,
    nombre: cliente.nombre,
    alerta,
    briefing: lineas.join('\n'),
    datos_cliente: {
      telefono: cliente.telefono,
      email: cliente.email,
      poliza: cliente.poliza,
      tipo_poliza: cliente.tipo_poliza,
      direccion: cliente.direccion
    },
    siniestros_activos: siniestrosActivos.length,
    nivel_riesgo: ctx.nivel_riesgo,
    estado_emocional: ctx.estado_emocional,
    preferencias: preferencias.map(p => p.contenido),
    tono_recomendado: tono
  };
}

/**
 * Updates a context key (preference, state, etc.) for a client.
 */
async function actualizarContexto(clienteId, clave, valor) {
  const id = `CTX-${uuidv4().slice(0, 8)}`;
  await dbRun(
    `INSERT INTO memoria_contexto (id, cliente_id, clave, valor, actualizado_en)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(cliente_id, clave) DO UPDATE SET valor = excluded.valor, actualizado_en = datetime('now')`,
    [id, clienteId, clave, valor]
  );
  return { clienteId, clave, valor, actualizado: true };
}

/**
 * Analyzes memory to find behavioral patterns for a client.
 */
async function getPatronesCliente(clienteId) {
  const memorias = await dbAll(
    'SELECT * FROM memoria_cliente WHERE cliente_id = ? ORDER BY fecha ASC',
    [clienteId]
  );

  if (memorias.length === 0) {
    return { cliente_id: clienteId, patrones: [], mensaje: 'Sin datos suficientes para detectar patrones' };
  }

  const patrones = [];

  // Pattern: day-of-week frequency
  const diasSemana = { 0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miercoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sabado' };
  const contadorDias = {};
  for (const m of memorias) {
    if (m.tipo === 'interaccion') {
      const dia = new Date(m.fecha).getDay();
      contadorDias[dia] = (contadorDias[dia] || 0) + 1;
    }
  }
  const diaMax = Object.entries(contadorDias).sort((a, b) => b[1] - a[1])[0];
  if (diaMax && diaMax[1] >= 2) {
    patrones.push({
      tipo: 'frecuencia_contacto',
      descripcion: `Contacta frecuentemente los ${diasSemana[parseInt(diaMax[0])]}s (${diaMax[1]} veces)`,
      confianza: Math.min(95, 50 + diaMax[1] * 10)
    });
  }

  // Pattern: emotional escalation
  const quejas = memorias.filter(m => m.tipo === 'queja');
  if (quejas.length >= 2) {
    const importancias = quejas.map(q => q.importancia);
    const tendencia = importancias[importancias.length - 1] - importancias[0];
    if (tendencia > 0) {
      patrones.push({
        tipo: 'escalada_emocional',
        descripcion: `Tendencia de escalada: las quejas van en aumento de severidad (${importancias[0]} -> ${importancias[importancias.length - 1]})`,
        confianza: 70
      });
    } else if (tendencia < 0) {
      patrones.push({
        tipo: 'desescalada_emocional',
        descripcion: `Tendencia de desescalada: la insatisfaccion va disminuyendo`,
        confianza: 70
      });
    }
  }

  // Pattern: channel preference
  const canales = {};
  for (const m of memorias) {
    if (m.canal) {
      canales[m.canal] = (canales[m.canal] || 0) + 1;
    }
  }
  const canalPreferido = Object.entries(canales).sort((a, b) => b[1] - a[1])[0];
  if (canalPreferido && canalPreferido[1] >= 2) {
    patrones.push({
      tipo: 'canal_preferido',
      descripcion: `Prefiere comunicarse por ${canalPreferido[0]} (${canalPreferido[1]} interacciones)`,
      confianza: Math.min(90, 40 + canalPreferido[1] * 15)
    });
  }

  // Pattern: response time sensitivity
  const quejasConTiempo = memorias.filter(m =>
    m.tipo === 'queja' && m.contenido && m.contenido.toLowerCase().includes('tard')
  );
  if (quejasConTiempo.length >= 1) {
    patrones.push({
      tipo: 'sensible_tiempos',
      descripcion: `Se enfada cuando las respuestas tardan. ${quejasConTiempo.length} quejas relacionadas con tiempos de espera.`,
      confianza: 80
    });
  }

  // Pattern: agent preference
  const agentes = {};
  for (const m of memorias) {
    if (m.agente) {
      agentes[m.agente] = (agentes[m.agente] || 0) + 1;
    }
  }
  const agentePreferido = Object.entries(agentes).sort((a, b) => b[1] - a[1])[0];
  if (agentePreferido && agentePreferido[1] >= 2) {
    patrones.push({
      tipo: 'agente_preferido',
      descripcion: `Siempre pregunta por el agente ${agentePreferido[0]}`,
      confianza: 75
    });
  }

  // Pattern: overall satisfaction trend
  const sentimientos = memorias.filter(m => m.tipo === 'sentimiento');
  const sentimientosPositivos = sentimientos.filter(s =>
    ['satisfecho', 'contento', 'agradecido', 'tranquilo'].includes(s.contenido.toLowerCase())
  );
  const sentimientosNegativos = sentimientos.filter(s =>
    ['enfadado', 'frustrado', 'furioso', 'molesto', 'decepcionado'].includes(s.contenido.toLowerCase())
  );

  if (sentimientos.length >= 3) {
    const ratio = sentimientosPositivos.length / sentimientos.length;
    if (ratio >= 0.7) {
      patrones.push({
        tipo: 'cliente_satisfecho',
        descripcion: `Cliente generalmente satisfecho (${Math.round(ratio * 100)}% interacciones positivas)`,
        confianza: 85
      });
    } else if (ratio <= 0.3) {
      patrones.push({
        tipo: 'cliente_insatisfecho',
        descripcion: `Cliente frecuentemente insatisfecho (${Math.round((1 - ratio) * 100)}% interacciones negativas)`,
        confianza: 85
      });
    }
  }

  return {
    cliente_id: clienteId,
    total_memorias_analizadas: memorias.length,
    patrones,
    patrones_encontrados: patrones.length
  };
}

/**
 * Search across all memories by text query.
 */
async function buscarMemorias(query) {
  const memorias = await dbAll(
    `SELECT mc.*, c.nombre as cliente_nombre
     FROM memoria_cliente mc
     LEFT JOIN clientes c ON mc.cliente_id = c.id
     WHERE mc.contenido LIKE ? OR mc.contexto_emocional LIKE ? OR mc.tipo LIKE ?
     ORDER BY mc.fecha DESC
     LIMIT 50`,
    [`%${query}%`, `%${query}%`, `%${query}%`]
  );

  return {
    query,
    resultados: memorias.length,
    memorias
  };
}

/**
 * Returns global statistics about the memory system.
 */
async function getEstadisticas() {
  const totalMemorias = await dbGet('SELECT COUNT(*) as total FROM memoria_cliente');
  const clientesConMemoria = await dbGet('SELECT COUNT(DISTINCT cliente_id) as total FROM memoria_cliente');

  const memoriasPorTipo = await dbAll(
    'SELECT tipo, COUNT(*) as cantidad FROM memoria_cliente GROUP BY tipo ORDER BY cantidad DESC'
  );

  const sentimientos = await dbAll(
    `SELECT contenido, COUNT(*) as cantidad
     FROM memoria_cliente WHERE tipo = 'sentimiento'
     GROUP BY contenido ORDER BY cantidad DESC LIMIT 5`
  );

  const alertas = await dbAll(
    `SELECT cliente_id, COUNT(*) as quejas
     FROM memoria_cliente WHERE tipo = 'queja'
     GROUP BY cliente_id HAVING quejas >= 2
     ORDER BY quejas DESC`
  );

  const memoriasPorCanal = await dbAll(
    `SELECT canal, COUNT(*) as cantidad FROM memoria_cliente WHERE canal IS NOT NULL GROUP BY canal ORDER BY cantidad DESC`
  );

  const memoriasRecientes = await dbAll(
    `SELECT * FROM memoria_cliente ORDER BY fecha DESC LIMIT 10`
  );

  return {
    total_memorias: totalMemorias ? totalMemorias.total : 0,
    clientes_con_memoria: clientesConMemoria ? clientesConMemoria.total : 0,
    memorias_por_tipo: memoriasPorTipo,
    sentimiento_predominante: sentimientos.length > 0 ? sentimientos[0].contenido : 'sin datos',
    distribucion_sentimientos: sentimientos,
    alertas_activas: alertas.length,
    clientes_en_alerta: alertas,
    memorias_por_canal: memoriasPorCanal,
    ultimas_memorias: memoriasRecientes
  };
}

// ---------------------------------------------------------------------------
// Seed data - pre-populate memories for 8 clients
// ---------------------------------------------------------------------------
async function seedMemoria() {
  const count = await dbGet('SELECT COUNT(*) as c FROM memoria_cliente');
  if (count && count.c > 0) {
    console.log('[MemoriaAgent] Datos de memoria ya existen, omitiendo seed');
    return;
  }

  console.log('[MemoriaAgent] Insertando datos de memoria de ejemplo...');

  const memorias = [
    // ---- CLI-001 Maria Garcia - Enfadada por perito que no vino ----
    { cli: 'CLI-001', tipo: 'interaccion', contenido: 'Llamada entrante reportando colision frontal en M-30. Airbags activados. Cliente en estado de shock pero ilesa.', emocional: 'asustada', canal: 'telefono', agente: 'Ana Martinez', imp: 8, fecha: '2026-03-10 09:15:00' },
    { cli: 'CLI-001', tipo: 'sentimiento', contenido: 'asustada', emocional: 'asustada', canal: 'telefono', agente: 'Ana Martinez', imp: 6, fecha: '2026-03-10 09:15:00' },
    { cli: 'CLI-001', tipo: 'interaccion', contenido: 'Se confirmo envio de grua. Cliente espero 12 minutos. Se le informo del proceso.', emocional: 'preocupada', canal: 'telefono', agente: 'Ana Martinez', imp: 5, fecha: '2026-03-10 09:30:00' },
    { cli: 'CLI-001', tipo: 'interaccion', contenido: 'WhatsApp: Cliente pregunta cuando viene el perito. Se le indico que en 48h.', emocional: 'impaciente', canal: 'whatsapp', agente: 'Sistema IA', imp: 4, fecha: '2026-03-12 10:00:00' },
    { cli: 'CLI-001', tipo: 'queja', contenido: 'El perito no se presento a la cita programada. Cliente tuvo que reorganizar su dia para nada.', emocional: 'enfadada', canal: 'telefono', agente: 'Roberto Diaz', imp: 9, fecha: '2026-03-14 16:30:00' },
    { cli: 'CLI-001', tipo: 'sentimiento', contenido: 'enfadada', emocional: 'enfadada', canal: 'telefono', agente: 'Roberto Diaz', imp: 8, fecha: '2026-03-14 16:30:00' },
    { cli: 'CLI-001', tipo: 'nota_agente', contenido: 'Disculparse por la no-presentacion del perito antes de cualquier otra cosa. Cliente muy molesta.', emocional: null, canal: null, agente: 'Roberto Diaz', imp: 10, fecha: '2026-03-14 16:45:00' },
    { cli: 'CLI-001', tipo: 'preferencia', contenido: 'Prefiere WhatsApp, no le gusta que la llamen despues de las 20h', emocional: null, canal: null, agente: 'Roberto Diaz', imp: 7, fecha: '2026-03-14 17:00:00' },
    { cli: 'CLI-001', tipo: 'decision', contenido: 'Se priorizo nueva cita con perito para manana a las 10:00. Perito Carlos Ruiz asignado personalmente.', emocional: null, canal: null, agente: 'Ana Martinez', imp: 7, fecha: '2026-03-14 17:10:00' },

    // ---- CLI-002 Carlos Fernandez - Siempre satisfecho ----
    { cli: 'CLI-002', tipo: 'interaccion', contenido: 'WhatsApp reportando inundacion en planta baja. Rotura de tuberia principal.', emocional: 'preocupado', canal: 'whatsapp', agente: 'Sistema IA', imp: 7, fecha: '2026-03-08 14:20:00' },
    { cli: 'CLI-002', tipo: 'sentimiento', contenido: 'preocupado', emocional: 'preocupado', canal: 'whatsapp', agente: 'Sistema IA', imp: 5, fecha: '2026-03-08 14:20:00' },
    { cli: 'CLI-002', tipo: 'interaccion', contenido: 'Envio fotos de los danos por WhatsApp. IA estimo 4200-5800 EUR.', emocional: 'tranquilo', canal: 'whatsapp', agente: 'Sistema IA', imp: 5, fecha: '2026-03-08 14:35:00' },
    { cli: 'CLI-002', tipo: 'sentimiento', contenido: 'tranquilo', emocional: 'tranquilo', canal: 'whatsapp', agente: 'Sistema IA', imp: 4, fecha: '2026-03-08 14:35:00' },
    { cli: 'CLI-002', tipo: 'interaccion', contenido: 'Perito Elena Torres visito. Cliente agradecio la rapidez del servicio.', emocional: 'satisfecho', canal: 'presencial', agente: 'Elena Torres Vidal', imp: 6, fecha: '2026-03-09 11:00:00' },
    { cli: 'CLI-002', tipo: 'sentimiento', contenido: 'satisfecho', emocional: 'satisfecho', canal: 'presencial', agente: 'Elena Torres Vidal', imp: 5, fecha: '2026-03-09 11:00:00' },
    { cli: 'CLI-002', tipo: 'preferencia', contenido: 'Prefiere comunicarse por WhatsApp. Responde rapido por la manana.', emocional: null, canal: null, agente: 'Elena Torres Vidal', imp: 6, fecha: '2026-03-09 11:30:00' },
    { cli: 'CLI-002', tipo: 'nota_agente', contenido: 'Cliente muy colaborador. Siempre facilita documentacion rapido. Buen candidato para NPS positivo.', emocional: null, canal: null, agente: 'Elena Torres Vidal', imp: 5, fecha: '2026-03-09 11:45:00' },

    // ---- CLI-003 Laura Mendez - Sospecha de fraude, nerviosa ----
    { cli: 'CLI-003', tipo: 'interaccion', contenido: 'Llamada reportando robo con fuerza en local comercial. Puerta forzada.', emocional: 'nerviosa', canal: 'telefono', agente: 'Roberto Diaz', imp: 8, fecha: '2026-03-05 08:00:00' },
    { cli: 'CLI-003', tipo: 'sentimiento', contenido: 'nerviosa', emocional: 'nerviosa', canal: 'telefono', agente: 'Roberto Diaz', imp: 6, fecha: '2026-03-05 08:00:00' },
    { cli: 'CLI-003', tipo: 'nota_agente', contenido: 'Inconsistencias en el relato. Dice puerta forzada pero cerrajero indica que se abrio con llave. Score fraude: 45.', emocional: null, canal: null, agente: 'Roberto Diaz', imp: 9, fecha: '2026-03-06 14:00:00' },
    { cli: 'CLI-003', tipo: 'interaccion', contenido: 'Se solicito documentacion adicional: facturas de los articulos robados. Cliente tardo 5 dias en enviarlas.', emocional: 'evasiva', canal: 'email', agente: 'Roberto Diaz', imp: 7, fecha: '2026-03-07 10:00:00' },
    { cli: 'CLI-003', tipo: 'queja', contenido: 'Cliente se quejo de que el proceso tarda mucho y amenaza con ir a la competencia.', emocional: 'enfadada', canal: 'telefono', agente: 'Ana Martinez', imp: 7, fecha: '2026-03-11 09:30:00' },
    { cli: 'CLI-003', tipo: 'decision', contenido: 'Expediente derivado a investigacion por sospecha de fraude. No informar al cliente de la investigacion.', emocional: null, canal: null, agente: 'Ana Martinez', imp: 10, fecha: '2026-03-11 10:00:00' },
    { cli: 'CLI-003', tipo: 'sentimiento', contenido: 'enfadada', emocional: 'enfadada', canal: 'telefono', agente: 'Ana Martinez', imp: 6, fecha: '2026-03-11 09:30:00' },
    { cli: 'CLI-003', tipo: 'preferencia', contenido: 'Insiste en que la llamen al movil, no al fijo del local', emocional: null, canal: null, agente: 'Roberto Diaz', imp: 4, fecha: '2026-03-05 08:10:00' },

    // ---- CLI-004 Pedro Alvarez - Preocupado pero confiado ----
    { cli: 'CLI-004', tipo: 'interaccion', contenido: 'Llamada desde urgencias Hospital La Paz. Apendicitis aguda, intervencion inminente.', emocional: 'asustado', canal: 'telefono', agente: 'Sistema IA', imp: 9, fecha: '2026-03-12 03:15:00' },
    { cli: 'CLI-004', tipo: 'sentimiento', contenido: 'asustado', emocional: 'asustado', canal: 'telefono', agente: 'Sistema IA', imp: 7, fecha: '2026-03-12 03:15:00' },
    { cli: 'CLI-004', tipo: 'decision', contenido: 'Cobertura autorizada inmediatamente. Poliza Salud Premium cubre 100% de la intervencion.', emocional: null, canal: null, agente: 'Sistema IA', imp: 8, fecha: '2026-03-12 03:20:00' },
    { cli: 'CLI-004', tipo: 'interaccion', contenido: 'Llamada de seguimiento post-operatorio. Cliente agradecido, recuperacion favorable.', emocional: 'agradecido', canal: 'telefono', agente: 'Ana Martinez', imp: 5, fecha: '2026-03-14 10:00:00' },
    { cli: 'CLI-004', tipo: 'sentimiento', contenido: 'agradecido', emocional: 'agradecido', canal: 'telefono', agente: 'Ana Martinez', imp: 5, fecha: '2026-03-14 10:00:00' },
    { cli: 'CLI-004', tipo: 'nota_agente', contenido: 'Excelente experiencia del cliente. Valorar enviar encuesta NPS. Posible testimonio para marketing.', emocional: null, canal: null, agente: 'Ana Martinez', imp: 4, fecha: '2026-03-14 10:15:00' },

    // ---- CLI-005 Sofia Rodriguez - Impaciente pero razonable ----
    { cli: 'CLI-005', tipo: 'interaccion', contenido: 'Reporte de danos por granizo en vehiculo. Abolladuras multiples.', emocional: 'molesta', canal: 'telefono', agente: 'Roberto Diaz', imp: 5, fecha: '2026-03-11 16:45:00' },
    { cli: 'CLI-005', tipo: 'sentimiento', contenido: 'molesta', emocional: 'molesta', canal: 'telefono', agente: 'Roberto Diaz', imp: 5, fecha: '2026-03-11 16:45:00' },
    { cli: 'CLI-005', tipo: 'queja', contenido: 'Llama para quejarse de que el perito tarda mas de 3 dias en venir.', emocional: 'impaciente', canal: 'telefono', agente: 'Roberto Diaz', imp: 6, fecha: '2026-03-14 09:00:00' },
    { cli: 'CLI-005', tipo: 'interaccion', contenido: 'Perito Carlos Ruiz visito y evaluo danos. Cliente conforme con la valoracion.', emocional: 'satisfecha', canal: 'presencial', agente: 'Carlos Ruiz Martinez', imp: 5, fecha: '2026-03-15 10:30:00' },
    { cli: 'CLI-005', tipo: 'sentimiento', contenido: 'satisfecha', emocional: 'satisfecha', canal: 'presencial', agente: 'Carlos Ruiz Martinez', imp: 4, fecha: '2026-03-15 10:30:00' },
    { cli: 'CLI-005', tipo: 'preferencia', contenido: 'Prefiere llamadas por la manana entre 9:00 y 12:00. Trabaja por las tardes.', emocional: null, canal: null, agente: 'Roberto Diaz', imp: 6, fecha: '2026-03-11 17:00:00' },

    // ---- CLI-006 Antonio Navarro - Satisfecho, caso resuelto ----
    { cli: 'CLI-006', tipo: 'interaccion', contenido: 'Reporte de incendio en cocina por cortocircuito en campana extractora.', emocional: 'alterado', canal: 'telefono', agente: 'Ana Martinez', imp: 9, fecha: '2026-02-20 19:30:00' },
    { cli: 'CLI-006', tipo: 'sentimiento', contenido: 'alterado', emocional: 'alterado', canal: 'telefono', agente: 'Ana Martinez', imp: 7, fecha: '2026-02-20 19:30:00' },
    { cli: 'CLI-006', tipo: 'interaccion', contenido: 'Perito Miguel Angel evaluo danos. Cocina destruida, danos en pared colindante.', emocional: 'preocupado', canal: 'presencial', agente: 'Miguel Angel Fernandez', imp: 7, fecha: '2026-02-22 10:00:00' },
    { cli: 'CLI-006', tipo: 'decision', contenido: 'Indemnizacion aprobada: 23.500 EUR. Cliente acepto sin negociar.', emocional: null, canal: null, agente: 'Ana Martinez', imp: 8, fecha: '2026-03-01 14:00:00' },
    { cli: 'CLI-006', tipo: 'interaccion', contenido: 'Llamada de cierre. Cliente agradece la gestion y la rapidez. Caso cerrado satisfactoriamente.', emocional: 'satisfecho', canal: 'telefono', agente: 'Ana Martinez', imp: 5, fecha: '2026-03-05 11:00:00' },
    { cli: 'CLI-006', tipo: 'sentimiento', contenido: 'satisfecho', emocional: 'satisfecho', canal: 'telefono', agente: 'Ana Martinez', imp: 4, fecha: '2026-03-05 11:00:00' },
    { cli: 'CLI-006', tipo: 'nota_agente', contenido: 'Cliente fiel, 8 anos de antiguedad. Caso gestionado como referencia de buena practica.', emocional: null, canal: null, agente: 'Ana Martinez', imp: 5, fecha: '2026-03-05 11:15:00' },

    // ---- CLI-007 Isabel Moreno - Siempre contenta ----
    { cli: 'CLI-007', tipo: 'interaccion', contenido: 'Reporte de alcance trasero en semaforo. Danos menores.', emocional: 'tranquila', canal: 'whatsapp', agente: 'Sistema IA', imp: 4, fecha: '2026-03-01 12:00:00' },
    { cli: 'CLI-007', tipo: 'sentimiento', contenido: 'tranquila', emocional: 'tranquila', canal: 'whatsapp', agente: 'Sistema IA', imp: 3, fecha: '2026-03-01 12:00:00' },
    { cli: 'CLI-007', tipo: 'interaccion', contenido: 'Perito evaluo danos. Paragolpes y piloto trasero. Valoracion 1850 EUR.', emocional: 'contenta', canal: 'presencial', agente: 'Carlos Ruiz Martinez', imp: 4, fecha: '2026-03-03 09:00:00' },
    { cli: 'CLI-007', tipo: 'sentimiento', contenido: 'contenta', emocional: 'contenta', canal: 'presencial', agente: 'Carlos Ruiz Martinez', imp: 3, fecha: '2026-03-03 09:00:00' },
    { cli: 'CLI-007', tipo: 'interaccion', contenido: 'Reparacion completada. Cliente satisfecha con el resultado.', emocional: 'satisfecha', canal: 'telefono', agente: 'Roberto Diaz', imp: 4, fecha: '2026-03-10 16:00:00' },
    { cli: 'CLI-007', tipo: 'sentimiento', contenido: 'satisfecha', emocional: 'satisfecha', canal: 'telefono', agente: 'Roberto Diaz', imp: 3, fecha: '2026-03-10 16:00:00' },
    { cli: 'CLI-007', tipo: 'preferencia', contenido: 'Le gusta recibir actualizaciones por WhatsApp. Responde siempre con emojis.', emocional: null, canal: null, agente: 'Roberto Diaz', imp: 3, fecha: '2026-03-10 16:10:00' },
    { cli: 'CLI-007', tipo: 'nota_agente', contenido: 'Cliente ejemplar. Nunca se queja, siempre agradece. Ideal para programa de referidos.', emocional: null, canal: null, agente: 'Roberto Diaz', imp: 4, fecha: '2026-03-10 16:15:00' },

    // ---- CLI-008 Francisco Herrera - Quejica frecuente ----
    { cli: 'CLI-008', tipo: 'interaccion', contenido: 'Llamada reportando filtracion de agua al vecino de abajo. RC profesional.', emocional: 'nervioso', canal: 'telefono', agente: 'Roberto Diaz', imp: 6, fecha: '2026-03-06 08:30:00' },
    { cli: 'CLI-008', tipo: 'sentimiento', contenido: 'nervioso', emocional: 'nervioso', canal: 'telefono', agente: 'Roberto Diaz', imp: 5, fecha: '2026-03-06 08:30:00' },
    { cli: 'CLI-008', tipo: 'queja', contenido: 'Se queja de que nadie le ha llamado en 2 dias. Dice que paga mucho por la poliza.', emocional: 'enfadado', canal: 'telefono', agente: 'Ana Martinez', imp: 7, fecha: '2026-03-08 11:00:00' },
    { cli: 'CLI-008', tipo: 'queja', contenido: 'Llama otra vez. Dice que el vecino le amenaza con demandarle y la aseguradora no hace nada.', emocional: 'furioso', canal: 'telefono', agente: 'Ana Martinez', imp: 8, fecha: '2026-03-10 15:20:00' },
    { cli: 'CLI-008', tipo: 'sentimiento', contenido: 'furioso', emocional: 'furioso', canal: 'telefono', agente: 'Ana Martinez', imp: 8, fecha: '2026-03-10 15:20:00' },
    { cli: 'CLI-008', tipo: 'queja', contenido: 'Tercera queja. Dice que va a cambiar de aseguradora si no se resuelve esta semana.', emocional: 'muy_enfadado', canal: 'telefono', agente: 'Roberto Diaz', imp: 9, fecha: '2026-03-13 09:00:00' },
    { cli: 'CLI-008', tipo: 'sentimiento', contenido: 'muy_enfadado', emocional: 'muy_enfadado', canal: 'telefono', agente: 'Roberto Diaz', imp: 9, fecha: '2026-03-13 09:00:00' },
    { cli: 'CLI-008', tipo: 'nota_agente', contenido: 'Cliente de alto riesgo de fuga. Necesita atencion inmediata y seguimiento diario. Escalar a supervisor.', emocional: null, canal: null, agente: 'Roberto Diaz', imp: 10, fecha: '2026-03-13 09:15:00' },
    { cli: 'CLI-008', tipo: 'preferencia', contenido: 'Solo quiere hablar con supervisores. No acepta respuestas de agentes junior.', emocional: null, canal: null, agente: 'Ana Martinez', imp: 7, fecha: '2026-03-10 15:30:00' },
    { cli: 'CLI-008', tipo: 'decision', contenido: 'Asignado a gestion prioritaria. Perito visitara manana. Llamada de seguimiento diaria hasta resolucion.', emocional: null, canal: null, agente: 'Ana Martinez', imp: 8, fecha: '2026-03-13 10:00:00' },
  ];

  for (const m of memorias) {
    const id = `MEM-${uuidv4().slice(0, 8)}`;
    await dbRun(
      `INSERT INTO memoria_cliente (id, cliente_id, tipo, contenido, contexto_emocional, canal, agente, importancia, fecha)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, m.cli, m.tipo, m.contenido, m.emocional, m.canal, m.agente, m.imp, m.fecha]
    );
  }

  // Seed context data
  const contextos = [
    { cli: 'CLI-001', clave: 'ultimo_sentimiento', valor: 'enfadada' },
    { cli: 'CLI-001', clave: 'ultima_interaccion_fecha', valor: '2026-03-14T17:10:00Z' },
    { cli: 'CLI-001', clave: 'ultimo_canal', valor: 'telefono' },
    { cli: 'CLI-001', clave: 'perito_pendiente', valor: 'Carlos Ruiz Martinez - manana 10:00' },
    { cli: 'CLI-002', clave: 'ultimo_sentimiento', valor: 'satisfecho' },
    { cli: 'CLI-002', clave: 'ultima_interaccion_fecha', valor: '2026-03-09T11:45:00Z' },
    { cli: 'CLI-002', clave: 'ultimo_canal', valor: 'presencial' },
    { cli: 'CLI-003', clave: 'ultimo_sentimiento', valor: 'enfadada' },
    { cli: 'CLI-003', clave: 'investigacion_fraude', valor: 'activa' },
    { cli: 'CLI-003', clave: 'ultimo_canal', valor: 'telefono' },
    { cli: 'CLI-004', clave: 'ultimo_sentimiento', valor: 'agradecido' },
    { cli: 'CLI-004', clave: 'estado_salud', valor: 'recuperacion_favorable' },
    { cli: 'CLI-005', clave: 'ultimo_sentimiento', valor: 'satisfecha' },
    { cli: 'CLI-006', clave: 'ultimo_sentimiento', valor: 'satisfecho' },
    { cli: 'CLI-006', clave: 'caso_referencia', valor: 'buena_practica' },
    { cli: 'CLI-007', clave: 'ultimo_sentimiento', valor: 'satisfecha' },
    { cli: 'CLI-007', clave: 'candidata_referidos', valor: 'si' },
    { cli: 'CLI-008', clave: 'ultimo_sentimiento', valor: 'muy_enfadado' },
    { cli: 'CLI-008', clave: 'riesgo_fuga', valor: 'alto' },
    { cli: 'CLI-008', clave: 'atencion_prioritaria', valor: 'si' },
    { cli: 'CLI-008', clave: 'seguimiento_diario', valor: 'activo' },
  ];

  for (const c of contextos) {
    const id = `CTX-${uuidv4().slice(0, 8)}`;
    await dbRun(
      `INSERT INTO memoria_contexto (id, cliente_id, clave, valor)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(cliente_id, clave) DO UPDATE SET valor = excluded.valor, actualizado_en = datetime('now')`,
      [id, c.cli, c.clave, c.valor]
    );
  }

  console.log('[MemoriaAgent] Datos de memoria insertados: 8 clientes con historiales completos');
}

// ---------------------------------------------------------------------------
// Initialize on load
// ---------------------------------------------------------------------------
(async () => {
  try {
    await initMemoriaDB();
    await seedMemoria();
  } catch (err) {
    console.error('[MemoriaAgent] Error inicializando:', err.message);
  }
})();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  recordar,
  getMemoriaCliente,
  getContexto,
  getBriefingLlamada,
  actualizarContexto,
  getPatronesCliente,
  buscarMemorias,
  getEstadisticas,
  initMemoriaDB,
  seedMemoria
};
