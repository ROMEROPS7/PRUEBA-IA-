const router = require('express').Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

router.get('/', auth(), async (req, res) => {
  try {
    const { provincia, concertado, especialidad } = req.query;
    let query = db('talleres').where('activo', true);
    if (provincia) query = query.where('provincia', 'ilike', `%${provincia}%`);
    if (concertado === 'true') query = query.where('concertado', true);
    if (especialidad) query = query.whereRaw(`especialidades @> '["${especialidad}"]'`);
    const talleres = await query.orderByRaw('concertado DESC, valoracion_media DESC');
    res.json(talleres);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener talleres' });
  }
});

router.get('/:id', auth(), async (req, res) => {
  try {
    const taller = await db('talleres').where('id', req.params.id).first();
    if (!taller) return res.status(404).json({ error: 'Taller no encontrado' });
    res.json(taller);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener taller' });
  }
});

module.exports = router;
