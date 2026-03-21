const router = require('express').Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

router.get('/', auth(['superadmin', 'admin_empresa', 'gestor']), async (req, res) => {
  try {
    const peritos = await db('peritos as p')
      .select('p.*', 'u.nombre', 'u.apellidos', 'u.email', 'u.telefono')
      .leftJoin('usuarios as u', 'p.usuario_id', 'u.id');
    res.json(peritos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener peritos' });
  }
});

router.get('/:id/siniestros', auth(), async (req, res) => {
  try {
    const siniestros = await db('siniestros').where('perito_id', req.params.id).orderBy('created_at', 'desc').limit(50);
    res.json(siniestros);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener siniestros del perito' });
  }
});

module.exports = router;
