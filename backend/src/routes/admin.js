const router = require('express').Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

// GET /admin/usuarios
router.get('/usuarios', auth(['superadmin', 'admin_empresa']), async (req, res) => {
  try {
    const usuarios = await db('usuarios')
      .select('id', 'email', 'nombre', 'apellidos', 'tipo', 'activo', 'ultimo_login', 'created_at')
      .where('empresa_id', req.usuario.empresa_id)
      .orderBy('created_at', 'desc');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// GET /admin/audit-log
router.get('/audit-log', auth(['superadmin', 'admin_empresa']), async (req, res) => {
  try {
    const { page = 1, limit = 50, accion, desde, hasta } = req.query;
    let query = db('audit_log as a')
      .select('a.*', 'u.nombre as usuario_nombre', 'u.email as usuario_email')
      .leftJoin('usuarios as u', 'a.usuario_id', 'u.id')
      .whereIn('a.usuario_id', db('usuarios').select('id').where('empresa_id', req.usuario.empresa_id));

    if (accion) query = query.where('a.accion', 'ilike', `%${accion}%`);
    if (desde) query = query.where('a.created_at', '>=', desde);
    if (hasta) query = query.where('a.created_at', '<=', hasta);

    const logs = await query.orderBy('a.created_at', 'desc').limit(parseInt(limit)).offset((parseInt(page) - 1) * parseInt(limit));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener audit log' });
  }
});

// GET /admin/stats/sistema
router.get('/stats/sistema', auth(['superadmin', 'admin_empresa']), async (req, res) => {
  try {
    const [usuarios, polizas, siniestros, tareas] = await Promise.all([
      db('usuarios').where('empresa_id', req.usuario.empresa_id).count('id as count').first(),
      db('polizas').where('empresa_id', req.usuario.empresa_id).count('id as count').first(),
      db('siniestros').where('empresa_id', req.usuario.empresa_id).count('id as count').first(),
      db('tareas_agente').whereIn('siniestro_id', db('siniestros').select('id').where('empresa_id', req.usuario.empresa_id)).count('id as count').first()
    ]);
    res.json({
      total_usuarios: parseInt(usuarios.count),
      total_polizas: parseInt(polizas.count),
      total_siniestros: parseInt(siniestros.count),
      total_tareas_ia: parseInt(tareas.count)
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener stats' });
  }
});

// GET /admin/rgpd/export/:userId - Exportación RGPD
router.get('/rgpd/export/:userId', auth(['superadmin', 'admin_empresa']), async (req, res) => {
  try {
    const usuario = await db('usuarios').where('id', req.params.userId).where('empresa_id', req.usuario.empresa_id).first();
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const [polizas, siniestros, audit] = await Promise.all([
      db('polizas').where('cliente_id', req.params.userId),
      db('siniestros').where('cliente_id', req.params.userId),
      db('audit_log').where('usuario_id', req.params.userId).orderBy('created_at', 'desc').limit(100)
    ]);

    // Eliminar datos sensibles
    delete usuario.password_hash;
    delete usuario.mfa_secret;

    res.json({
      exportacion_rgpd: true,
      fecha_exportacion: new Date().toISOString(),
      datos_personales: usuario,
      polizas,
      siniestros,
      registro_actividad: audit
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en exportación RGPD' });
  }
});

module.exports = router;
