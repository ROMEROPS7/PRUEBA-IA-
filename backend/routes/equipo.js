/**
 * routes/equipo.js - Rutas de Equipo y Enrutamiento
 *
 * Endpoints para gestión de personal y enrutamiento inteligente
 * de siniestros, emails, llamadas y escalados.
 */

const express = require('express');
const router = express.Router();
const { verificarToken, tokenOpcional } = require('../middleware/auth');
const equipoService = require('../services/equipoService');
const enrutamientoService = require('../services/enrutamientoService');

// ============================================================
// EQUIPO
// ============================================================

/**
 * GET /api/equipo/organigrama
 * Organigrama jerárquico del equipo.
 */
router.get('/equipo/organigrama', async (req, res) => {
  try {
    const organigrama = await equipoService.getOrganigrama();
    res.json({ organigrama });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/equipo/roles
 * Roles disponibles con permisos.
 */
router.get('/equipo/roles', (req, res) => {
  try {
    const roles = equipoService.getRoles();
    res.json({ roles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/equipo/buscar-aprobador
 * Buscar aprobador para un importe.
 * Query: importe (en céntimos), departamento
 */
router.get('/equipo/buscar-aprobador', async (req, res) => {
  try {
    const importe = parseInt(req.query.importe) || 0;
    const departamento = req.query.departamento || 'siniestros_auto';

    if (importe <= 0) {
      return res.status(400).json({ error: 'Importe debe ser mayor que 0 (en céntimos)' });
    }

    const resultado = await equipoService.buscarAprobador(importe, departamento);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/equipo/estadisticas
 * Estadísticas del equipo.
 */
router.get('/equipo/estadisticas', async (req, res) => {
  try {
    const stats = await equipoService.getEstadisticas();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/equipo/:id
 * Detalle de un empleado.
 */
router.get('/equipo/:id', async (req, res) => {
  try {
    const empleado = await equipoService.getEmpleado(req.params.id);
    res.json(empleado);
  } catch (err) {
    res.status(err.message.includes('no encontrado') ? 404 : 500).json({ error: err.message });
  }
});

/**
 * GET /api/equipo
 * Listar equipo con filtros.
 * Query: departamento, rol, activo
 */
router.get('/equipo', async (req, res) => {
  try {
    const filtros = {};
    if (req.query.departamento) filtros.departamento = req.query.departamento;
    if (req.query.rol) filtros.rol = req.query.rol;
    if (req.query.activo !== undefined) filtros.activo = req.query.activo === 'true' || req.query.activo === '1';

    const equipo = await equipoService.getEquipo(filtros);
    res.json({ total: equipo.length, equipo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/equipo
 * Registrar un nuevo empleado. Requiere autenticación.
 */
router.post('/equipo', verificarToken, async (req, res) => {
  try {
    const empleado = await equipoService.registrarEmpleado(req.body);
    res.status(201).json(empleado);
  } catch (err) {
    const status = err.message.includes('obligatorio') || err.message.includes('inválid') ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * PUT /api/equipo/:id
 * Actualizar empleado. Requiere autenticación.
 */
router.put('/equipo/:id', verificarToken, async (req, res) => {
  try {
    const empleado = await equipoService.actualizarEmpleado(req.params.id, req.body);
    res.json(empleado);
  } catch (err) {
    const status = err.message.includes('no encontrado') ? 404 :
                   err.message.includes('inválid') ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

/**
 * DELETE /api/equipo/:id
 * Desactivar empleado (soft delete). Requiere autenticación.
 */
router.delete('/equipo/:id', verificarToken, async (req, res) => {
  try {
    const resultado = await equipoService.desactivarEmpleado(req.params.id);
    res.json(resultado);
  } catch (err) {
    const status = err.message.includes('no encontrado') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

// ============================================================
// ENRUTAMIENTO
// ============================================================

/**
 * POST /api/enrutamiento/siniestro
 * Enrutar un siniestro nuevo.
 * Body: { id, tipo, producto, zona, importe_estimado, descripcion }
 */
router.post('/enrutamiento/siniestro', async (req, res) => {
  try {
    const resultado = await enrutamientoService.enrutarSiniestro(req.body);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/enrutamiento/email
 * Enrutar un email entrante.
 * Body: { from, subject, body, siniestro_id }
 */
router.post('/enrutamiento/email', async (req, res) => {
  try {
    const resultado = await enrutamientoService.enrutarEmail(req.body);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/enrutamiento/escalado
 * Enrutar un escalado.
 * Body: { siniestro_id, motivo, importe_aprobacion }
 */
router.post('/enrutamiento/escalado', async (req, res) => {
  try {
    const { siniestro_id, motivo, importe_aprobacion } = req.body;
    if (!siniestro_id || !motivo) {
      return res.status(400).json({ error: 'siniestro_id y motivo son obligatorios' });
    }
    const resultado = await enrutamientoService.enrutarEscalado(siniestro_id, motivo, importe_aprobacion);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/enrutamiento/llamada
 * Enrutar una llamada entrante.
 * Body: { telefono }
 */
router.post('/enrutamiento/llamada', async (req, res) => {
  try {
    const { telefono } = req.body;
    if (!telefono) {
      return res.status(400).json({ error: 'telefono es obligatorio' });
    }
    const resultado = await enrutamientoService.enrutarLlamada(telefono);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/enrutamiento/reasignar
 * Reasignar un caso manualmente.
 * Body: { siniestro_id, nuevo_gestor_id, motivo }
 */
router.post('/enrutamiento/reasignar', verificarToken, async (req, res) => {
  try {
    const { siniestro_id, nuevo_gestor_id, motivo } = req.body;
    if (!siniestro_id || !nuevo_gestor_id) {
      return res.status(400).json({ error: 'siniestro_id y nuevo_gestor_id son obligatorios' });
    }
    const resultado = await enrutamientoService.reasignar(siniestro_id, nuevo_gestor_id, motivo);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/enrutamiento/historial
 * Historial de enrutamientos.
 * Query: tipo, departamento, siniestro_id, desde, hasta, limit
 */
router.get('/enrutamiento/historial', async (req, res) => {
  try {
    const filtros = {};
    if (req.query.tipo) filtros.tipo = req.query.tipo;
    if (req.query.departamento) filtros.departamento = req.query.departamento;
    if (req.query.siniestro_id) filtros.siniestro_id = req.query.siniestro_id;
    if (req.query.desde) filtros.desde = req.query.desde;
    if (req.query.hasta) filtros.hasta = req.query.hasta;
    if (req.query.limit) filtros.limit = req.query.limit;

    const enrutamientos = await enrutamientoService.getEnrutamientos(filtros);
    res.json({ total: enrutamientos.length, enrutamientos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/enrutamiento/estadisticas
 * Estadísticas de enrutamiento.
 */
router.get('/enrutamiento/estadisticas', async (req, res) => {
  try {
    const stats = await enrutamientoService.getEstadisticas();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
