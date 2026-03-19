const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken, requiereRol } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/registro', authController.registro);
router.get('/perfil', verificarToken, authController.perfil);
router.put('/password', verificarToken, authController.cambiarPassword);

module.exports = router;
