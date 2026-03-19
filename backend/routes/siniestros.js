const express = require('express');
const router = express.Router();
const siniestrosController = require('../controllers/siniestrosController');
const { verificarToken, requiereRol, tokenOpcional } = require('../middleware/auth');

router.get('/', tokenOpcional, siniestrosController.listar);
router.get('/buscar', tokenOpcional, siniestrosController.buscar);
router.get('/:id', tokenOpcional, siniestrosController.obtener);
router.post('/', tokenOpcional, siniestrosController.crear);
router.put('/:id', tokenOpcional, siniestrosController.actualizar);
router.delete('/:id', verificarToken, requiereRol('admin'), siniestrosController.eliminar);

module.exports = router;
