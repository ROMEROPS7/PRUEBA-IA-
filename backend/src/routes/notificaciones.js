const router = require('express').Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

router.get('/', auth(), async (req, res) => {
  try {
    const { siniestro_id, limit = 50 } = req.query;
    let query = db('comunicaciones').orderBy('created_at', 'desc').limit(parseInt(limit));
    if (siniestro_id) query = query.where('siniestro_id', siniestro_id);
    if (req.usuario.tipo === 'cliente') query = query.where('usuario_id', req.usuario.id);
    const notificaciones = await query;
    res.json(notificaciones);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

module.exports = router;
