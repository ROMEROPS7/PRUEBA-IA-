const router = require('express').Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const { respuestaPaginada } = require('../utils/helpers');

router.get('/', auth(), async (req, res) => {
  try {
    const { page = 1, limit = 20, ramo, activa, buscar } = req.query;
    let query = db('polizas as p')
      .select('p.*', 'u.nombre as cliente_nombre', 'u.apellidos as cliente_apellidos', 'u.email as cliente_email')
      .leftJoin('usuarios as u', 'p.cliente_id', 'u.id')
      .where('p.empresa_id', req.usuario.empresa_id);

    if (req.usuario.tipo === 'cliente') query = query.where('p.cliente_id', req.usuario.id);
    if (ramo) query = query.where('p.ramo', ramo);
    if (activa !== undefined) query = query.where('p.activa', activa === 'true');
    if (buscar) {
      query = query.where(function () {
        this.where('p.numero_poliza', 'ilike', `%${buscar}%`)
          .orWhere('u.nombre', 'ilike', `%${buscar}%`);
      });
    }

    const [{ count }] = await query.clone().clearSelect().count('p.id as count');
    const polizas = await query.orderBy('p.created_at', 'desc').limit(parseInt(limit)).offset((parseInt(page) - 1) * parseInt(limit));
    res.json(respuestaPaginada(polizas, parseInt(count), page, limit));
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pólizas' });
  }
});

router.get('/:id', auth(), async (req, res) => {
  try {
    const poliza = await db('polizas as p')
      .select('p.*', 'u.nombre as cliente_nombre', 'u.apellidos as cliente_apellidos')
      .leftJoin('usuarios as u', 'p.cliente_id', 'u.id')
      .where('p.id', req.params.id).where('p.empresa_id', req.usuario.empresa_id).first();
    if (!poliza) return res.status(404).json({ error: 'Póliza no encontrada' });

    const siniestros = await db('siniestros').where('poliza_id', req.params.id).orderBy('created_at', 'desc');
    res.json({ ...poliza, siniestros });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener póliza' });
  }
});

router.get('/numero/:numero', auth(), async (req, res) => {
  try {
    const poliza = await db('polizas').where('numero_poliza', req.params.numero).where('empresa_id', req.usuario.empresa_id).first();
    if (!poliza) return res.status(404).json({ error: 'Póliza no encontrada' });
    res.json(poliza);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar póliza' });
  }
});

module.exports = router;
