const router = require('express').Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

// GET /dashboard - KPIs principales
router.get('/', auth(['superadmin', 'admin_empresa', 'gestor']), async (req, res) => {
  try {
    const empresaId = req.usuario.empresa_id;
    const { desde, hasta } = req.query;
    const fechaDesde = desde || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const fechaHasta = hasta || new Date().toISOString();

    const baseQuery = () => db('siniestros').where('empresa_id', empresaId).whereBetween('created_at', [fechaDesde, fechaHasta]);

    const [
      totalSiniestros,
      porEstado,
      porTipo,
      autoResueltos,
      tiempoMedio,
      costeMedio,
      satisfaccionMedia,
      fraudeDetectado,
      importeTotal
    ] = await Promise.all([
      baseQuery().count('id as count').first(),
      baseQuery().select('estado').count('id as count').groupBy('estado'),
      baseQuery().select('tipo').count('id as count').groupBy('tipo'),
      baseQuery().where('auto_resuelto', true).count('id as count').first(),
      baseQuery().whereNotNull('tiempo_resolucion_minutos').avg('tiempo_resolucion_minutos as media').first(),
      baseQuery().whereNotNull('coste_gestion').avg('coste_gestion as media').first(),
      baseQuery().whereNotNull('satisfaccion_cliente').avg('satisfaccion_cliente as media').first(),
      baseQuery().where('nivel_fraude', 'in', ['alto', 'confirmado']).count('id as count').first(),
      baseQuery().whereNotNull('importe_aprobado').sum('importe_aprobado as total').first()
    ]);

    // Costes IA
    const costesIA = await db('tareas_agente')
      .whereIn('siniestro_id', db('siniestros').select('id').where('empresa_id', empresaId))
      .sum('coste_api as total')
      .count('id as total_llamadas')
      .first();

    // Siniestros por día (últimos 30 días)
    const porDia = await baseQuery()
      .select(db.raw("DATE(created_at) as fecha"))
      .count('id as count')
      .groupByRaw('DATE(created_at)')
      .orderBy('fecha', 'asc');

    const total = parseInt(totalSiniestros?.count || 0);
    const autoCount = parseInt(autoResueltos?.count || 0);

    res.json({
      periodo: { desde: fechaDesde, hasta: fechaHasta },
      kpis: {
        total_siniestros: total,
        tasa_automatizacion: total > 0 ? Math.round((autoCount / total) * 100) : 0,
        tiempo_medio_resolucion_min: Math.round(parseFloat(tiempoMedio?.media || 0)),
        coste_medio_gestion: parseFloat(costeMedio?.media || 0).toFixed(2),
        satisfaccion_media: parseFloat(satisfaccionMedia?.media || 0).toFixed(1),
        fraudes_detectados: parseInt(fraudeDetectado?.count || 0),
        importe_total_aprobado: parseFloat(importeTotal?.total || 0).toFixed(2),
        coste_ia_total: parseFloat(costesIA?.total || 0).toFixed(4),
        llamadas_ia_total: parseInt(costesIA?.total_llamadas || 0)
      },
      distribucion: {
        por_estado: porEstado.reduce((acc, r) => { acc[r.estado] = parseInt(r.count); return acc; }, {}),
        por_tipo: porTipo.reduce((acc, r) => { acc[r.tipo] = parseInt(r.count); return acc; }, {}),
        por_dia: porDia.map(d => ({ fecha: d.fecha, count: parseInt(d.count) }))
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
});

// GET /dashboard/rendimiento-agentes
router.get('/rendimiento-agentes', auth(['superadmin', 'admin_empresa']), async (req, res) => {
  try {
    const rendimiento = await db('tareas_agente as t')
      .select('t.agente')
      .count('t.id as total')
      .countDistinct(db.raw("CASE WHEN t.estado = 'completada' THEN t.id END as completadas"))
      .countDistinct(db.raw("CASE WHEN t.estado = 'fallida' THEN t.id END as fallidas"))
      .avg('t.duracion_ms as duracion_media')
      .sum('t.tokens_usados as tokens_total')
      .sum('t.coste_api as coste_total')
      .whereIn('t.siniestro_id', db('siniestros').select('id').where('empresa_id', req.usuario.empresa_id))
      .groupBy('t.agente')
      .orderBy('total', 'desc');

    res.json(rendimiento);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener rendimiento' });
  }
});

module.exports = router;
