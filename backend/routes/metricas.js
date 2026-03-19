const express = require('express');
const router = express.Router();
const metricasController = require('../controllers/metricasController');
const { tokenOpcional } = require('../middleware/auth');

router.get('/dashboard', tokenOpcional, metricasController.dashboard);
router.get('/por-tipo', tokenOpcional, metricasController.porTipo);
router.get('/por-estado', tokenOpcional, metricasController.porEstado);
router.get('/por-zona', tokenOpcional, metricasController.porZona);
router.get('/tendencia', tokenOpcional, metricasController.tendenciaMensual);
router.get('/ranking-peritos', tokenOpcional, metricasController.rankingPeritos);
router.get('/rendimiento-ia', tokenOpcional, metricasController.rendimientoIA);

module.exports = router;
