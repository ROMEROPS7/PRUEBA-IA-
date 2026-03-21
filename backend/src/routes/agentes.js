const router = require('express').Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

// GET /agentes - Estado de todos los agentes
router.get('/', auth(['superadmin', 'admin_empresa', 'gestor']), async (req, res) => {
  try {
    const configs = await db('config_agentes').where('empresa_id', req.usuario.empresa_id);
    
    // Stats por agente
    const stats = await db('tareas_agente as t')
      .select('t.agente')
      .count('t.id as total_tareas')
      .avg('t.duracion_ms as duracion_media_ms')
      .sum('t.tokens_usados as total_tokens')
      .sum('t.coste_api as coste_total')
      .where('t.estado', 'completada')
      .whereIn('t.siniestro_id', db('siniestros').select('id').where('empresa_id', req.usuario.empresa_id))
      .groupBy('t.agente');

    const statsMap = {};
    stats.forEach(s => { statsMap[s.agente] = s; });

    const agentes = configs.map(c => ({
      ...c,
      parametros: typeof c.parametros === 'string' ? JSON.parse(c.parametros) : c.parametros,
      estadisticas: statsMap[c.agente] || { total_tareas: 0, duracion_media_ms: 0, total_tokens: 0, coste_total: 0 }
    }));

    res.json(agentes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener agentes' });
  }
});

// GET /agentes/:nombre/tareas - Tareas de un agente
router.get('/:nombre/tareas', auth(['superadmin', 'admin_empresa', 'gestor']), async (req, res) => {
  try {
    const tareas = await db('tareas_agente')
      .where('agente', req.params.nombre)
      .whereIn('siniestro_id', db('siniestros').select('id').where('empresa_id', req.usuario.empresa_id))
      .orderBy('created_at', 'desc')
      .limit(50);
    res.json(tareas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// PATCH /agentes/:nombre - Actualizar config de un agente
router.patch('/:nombre', auth(['superadmin', 'admin_empresa']), async (req, res) => {
  try {
    const { activo, parametros, umbral_confianza } = req.body;
    const update = {};
    if (activo !== undefined) update.activo = activo;
    if (parametros) update.parametros = JSON.stringify(parametros);
    if (umbral_confianza) update.umbral_confianza = umbral_confianza;

    await db('config_agentes').where('empresa_id', req.usuario.empresa_id).where('agente', req.params.nombre).update(update);
    res.json({ mensaje: `Agente ${req.params.nombre} actualizado` });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar agente' });
  }
});

module.exports = router;
