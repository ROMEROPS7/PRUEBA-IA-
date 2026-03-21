const express = require('express');
const router = express.Router();
const { tokenOpcional } = require('../middleware/auth');
const vault = require('../services/agentVaultService');

function handleError(req, res, e) {
  console.error('[Vault API]', e.message);
  res.status(500).json({ error: e.message });
}

// ============================================================
// NOTEBOOKS
// ============================================================

router.post('/notebook/escribir', tokenOpcional, async (req, res) => {
  try {
    const { agent_id, agent_name, tipo, titulo, contenido, contexto, tags, importancia } = req.body;
    if (!agent_id || !tipo || !titulo || !contenido) return res.status(400).json({ error: 'Faltan campos obligatorios' });
    const r = await vault.escribirCuaderno(agent_id, agent_name || agent_id, tipo, titulo, contenido, { contexto, tags, importancia });
    res.status(201).json(r);
  } catch (e) { handleError(req, res, e); }
});

router.get('/notebook/:agentId', tokenOpcional, async (req, res) => {
  try {
    const entries = await vault.leerCuaderno(req.params.agentId, {
      tipo: req.query.tipo, limit: parseInt(req.query.limit) || 50, desde_fecha: req.query.desde_fecha
    });
    res.json({ agent_id: req.params.agentId, entries });
  } catch (e) { handleError(req, res, e); }
});

router.get('/notebook/:agentId/leer/:targetAgentId', tokenOpcional, async (req, res) => {
  try {
    const entries = await vault.leerCuadernoAjeno(req.params.agentId, req.params.targetAgentId, {
      tipo: req.query.tipo, limit: parseInt(req.query.limit) || 50
    });
    res.json({ reader: req.params.agentId, target: req.params.targetAgentId, entries });
  } catch (e) { handleError(req, res, e); }
});

router.get('/notebooks/resumen', tokenOpcional, async (req, res) => {
  try { res.json(await vault.getCuadernosResumen()); } catch (e) { handleError(req, res, e); }
});

// ============================================================
// HALLAZGOS
// ============================================================

router.post('/hallazgos', tokenOpcional, async (req, res) => {
  try {
    const { agente_id, agente_nombre, categoria, fuente, titulo, descripcion, evidencia, nivel_confianza, impacto, entidades_relacionadas } = req.body;
    if (!agente_id || !categoria || !fuente || !titulo || !descripcion) return res.status(400).json({ error: 'Faltan campos obligatorios' });
    const r = await vault.depositarHallazgo(agente_id, agente_nombre || agente_id, categoria, fuente, titulo, descripcion, {
      evidencia, nivel_confianza: nivel_confianza || 50, impacto, entidades_relacionadas
    });
    res.status(201).json(r);
  } catch (e) { handleError(req, res, e); }
});

router.get('/hallazgos', tokenOpcional, async (req, res) => {
  try {
    const r = await vault.getHallazgos({
      categoria: req.query.categoria, fuente: req.query.fuente, impacto: req.query.impacto,
      estado: req.query.estado, agente_origen: req.query.agente_origen,
      min_confianza: req.query.min_confianza ? parseInt(req.query.min_confianza) : undefined,
      limit: parseInt(req.query.limit) || 50, order_by: req.query.order_by
    });
    res.json({ hallazgos: r });
  } catch (e) { handleError(req, res, e); }
});

router.post('/hallazgos/:id/votar', tokenOpcional, async (req, res) => {
  try {
    const r = await vault.votarHallazgo(req.params.id, req.body.agente_id || 'anon');
    res.json(r);
  } catch (e) { handleError(req, res, e); }
});

router.put('/hallazgos/:id/estado', tokenOpcional, async (req, res) => {
  try {
    const r = await vault.actualizarEstadoHallazgo(req.params.id, req.body.estado);
    res.json(r);
  } catch (e) { handleError(req, res, e); }
});

router.get('/hallazgos/relevantes/:agenteId', tokenOpcional, async (req, res) => {
  try {
    const r = await vault.getHallazgosRelevantes(req.params.agenteId, req.query.contexto);
    res.json(r);
  } catch (e) { handleError(req, res, e); }
});

router.get('/hallazgos/estadisticas', tokenOpcional, async (req, res) => {
  try { res.json(await vault.getEstadisticasHallazgos()); } catch (e) { handleError(req, res, e); }
});

// ============================================================
// MEMORY SUB-AGENTS
// ============================================================

router.post('/subagents/spawn', tokenOpcional, async (req, res) => {
  try {
    const { parent_agent_id, parent_agent_name, especialidad } = req.body;
    if (!parent_agent_id || !especialidad) return res.status(400).json({ error: 'Faltan campos' });
    const r = await vault.spawnMemorySubagent(parent_agent_id, parent_agent_name || parent_agent_id, especialidad);
    res.status(201).json(r);
  } catch (e) { handleError(req, res, e); }
});

router.get('/subagents/:parentAgentId', tokenOpcional, async (req, res) => {
  try { res.json(await vault.getSubagents(req.params.parentAgentId)); } catch (e) { handleError(req, res, e); }
});

router.post('/subagents/:id/ciclo', tokenOpcional, async (req, res) => {
  try { res.json(await vault.cicloMemoria(req.params.id)); } catch (e) { handleError(req, res, e); }
});

router.delete('/subagents/:id', tokenOpcional, async (req, res) => {
  try { res.json(await vault.terminateSubagent(req.params.id)); } catch (e) { handleError(req, res, e); }
});

// ============================================================
// SEARCH
// ============================================================

router.get('/buscar', tokenOpcional, async (req, res) => {
  try {
    if (!req.query.q) return res.status(400).json({ error: 'Parametro q requerido' });
    const r = await vault.busquedaSemantica(req.query.q, {
      source_type: req.query.source_type, limit: parseInt(req.query.limit) || 20, min_score: parseFloat(req.query.min_score) || 0
    });
    res.json(r);
  } catch (e) { handleError(req, res, e); }
});

router.post('/reindexar', tokenOpcional, async (req, res) => {
  try { res.json(await vault.reindexarVault()); } catch (e) { handleError(req, res, e); }
});

// ============================================================
// DASHBOARD
// ============================================================

router.get('/dashboard', tokenOpcional, async (req, res) => {
  try {
    const { dbAll, dbGet } = require('../database/db');

    // Notebooks summary
    const nbTotal = await dbGet('SELECT COUNT(*) as c FROM agent_notebook');
    const nbPerAgent = await dbAll('SELECT agent_id, agent_name, COUNT(*) as entries, MAX(fecha) as last_entry FROM agent_notebook GROUP BY agent_id ORDER BY entries DESC');
    const nbRecent = await dbAll('SELECT * FROM agent_notebook ORDER BY fecha DESC LIMIT 10');

    // Hallazgos
    const hTotal = await dbGet('SELECT COUNT(*) as c FROM hallazgos');
    const hAvgConf = await dbGet('SELECT AVG(nivel_confianza) as avg FROM hallazgos');
    const hByCategory = await dbAll('SELECT categoria, COUNT(*) as cantidad FROM hallazgos GROUP BY categoria ORDER BY cantidad DESC');
    const hBySource = await dbAll('SELECT fuente, COUNT(*) as cantidad FROM hallazgos GROUP BY fuente ORDER BY cantidad DESC');
    const hByImpact = await dbAll('SELECT impacto, COUNT(*) as cantidad FROM hallazgos GROUP BY impacto ORDER BY cantidad DESC');

    // Sub-agents
    const saList = await dbAll("SELECT * FROM memory_subagents WHERE estado = 'activo' ORDER BY creado_en DESC");

    res.json({
      timestamp: new Date().toISOString(),
      notebooks: {
        total_entries: nbTotal ? nbTotal.c : 0,
        per_agent: nbPerAgent || [],
        recent: nbRecent || []
      },
      hallazgos: {
        total: hTotal ? hTotal.c : 0,
        avg_confianza: hAvgConf ? hAvgConf.avg : 0,
        by_category: hByCategory || [],
        by_source: hBySource || [],
        by_impact: hByImpact || []
      },
      subagents: {
        total_active: saList ? saList.length : 0,
        list: saList || []
      }
    });
  } catch (e) { handleError(req, res, e); }
});

module.exports = router;
