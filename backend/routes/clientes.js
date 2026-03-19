const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { verificarToken, requiereRol, tokenOpcional } = require('../middleware/auth');

router.get('/', tokenOpcional, clientesController.listar);
router.get('/:id', tokenOpcional, clientesController.obtener);
router.post('/', tokenOpcional, clientesController.crear);
router.put('/:id', tokenOpcional, clientesController.actualizar);
router.delete('/:id', verificarToken, requiereRol('admin'), clientesController.eliminar);

module.exports = router;
