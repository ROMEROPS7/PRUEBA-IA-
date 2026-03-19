const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken, requiereRol } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/registro', authController.registro);
router.get('/perfil', verificarToken, authController.perfil);
router.put('/password', verificarToken, authController.cambiarPassword);

router.post('/refresh', (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token requerido' });
  try {
    const decoded = require('jsonwebtoken').verify(refreshToken, require('../middleware/auth').JWT_SECRET);
    if (decoded.type !== 'refresh') return res.status(401).json({ error: 'Token invalido' });
    const { generarToken } = require('../middleware/auth');
    const token = generarToken({ id: decoded.id, email: decoded.email || '', rol: decoded.rol || 'gestor', nombre: decoded.nombre || '' });
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: 'Refresh token expirado o invalido' });
  }
});

module.exports = router;
