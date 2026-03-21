// =============================================================================
// Rutas API - Wiki / Base de Conocimiento Interna
// =============================================================================

const express = require('express');
const router = express.Router();
const { tokenOpcional, verificarToken } = require('../middleware/auth');
const wikiService = require('../services/wikiService');

// GET /api/wiki/notas - Listar notas con filtros
router.get('/notas', tokenOpcional, async (req, res) => {
  try {
    const filtros = {
      categoria: req.query.categoria || undefined,
      tag: req.query.tag || undefined,
      autor: req.query.autor || undefined,
      limit: req.query.limit || 50,
      offset: req.query.offset || 0,
      archivada: req.query.archivada === 'true'
    };
    const resultado = await wikiService.listarNotas(filtros);
    res.json(resultado);
  } catch (err) {
    console.error('Wiki GET /notas error:', err.message);
    res.status(500).json({ error: 'Error al listar notas' });
  }
});

// GET /api/wiki/notas/:id - Obtener nota por ID
router.get('/notas/:id', tokenOpcional, async (req, res) => {
  try {
    const nota = await wikiService.obtenerNota(req.params.id);
    if (!nota) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }
    res.json(nota);
  } catch (err) {
    console.error('Wiki GET /notas/:id error:', err.message);
    res.status(500).json({ error: 'Error al obtener nota' });
  }
});

// POST /api/wiki/notas - Crear nueva nota
router.post('/notas', verificarToken, async (req, res) => {
  try {
    const datos = {
      titulo: req.body.titulo,
      contenido: req.body.contenido,
      categoria: req.body.categoria,
      tags: req.body.tags,
      autor: req.usuario ? req.usuario.nombre : req.body.autor
    };
    const nota = await wikiService.crearNota(datos);
    res.status(201).json(nota);
  } catch (err) {
    console.error('Wiki POST /notas error:', err.message);
    const status = err.message.includes('obligatorio') || err.message.includes('invalida') ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

// PUT /api/wiki/notas/:id - Actualizar nota
router.put('/notas/:id', verificarToken, async (req, res) => {
  try {
    const datos = {
      titulo: req.body.titulo,
      contenido: req.body.contenido,
      categoria: req.body.categoria,
      tags: req.body.tags,
      autor: req.usuario ? req.usuario.nombre : req.body.autor
    };
    const nota = await wikiService.actualizarNota(req.params.id, datos);
    res.json(nota);
  } catch (err) {
    console.error('Wiki PUT /notas/:id error:', err.message);
    const status = err.message.includes('no encontrada') ? 404 :
                   err.message.includes('invalida') ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

// DELETE /api/wiki/notas/:id - Soft delete (archivar)
router.delete('/notas/:id', verificarToken, async (req, res) => {
  try {
    const resultado = await wikiService.eliminarNota(req.params.id);
    res.json(resultado);
  } catch (err) {
    console.error('Wiki DELETE /notas/:id error:', err.message);
    const status = err.message.includes('no encontrada') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

// GET /api/wiki/buscar?q=... - Busqueda full-text
router.get('/buscar', tokenOpcional, async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query.trim()) {
      return res.json({ resultados: [], total: 0 });
    }
    const resultados = await wikiService.buscar(query);
    res.json({ resultados, total: resultados.length, query });
  } catch (err) {
    console.error('Wiki GET /buscar error:', err.message);
    res.status(500).json({ error: 'Error en la busqueda' });
  }
});

// GET /api/wiki/grafo - Datos del grafo para visualizacion
router.get('/grafo', tokenOpcional, async (req, res) => {
  try {
    const grafo = await wikiService.getGrafo();
    res.json(grafo);
  } catch (err) {
    console.error('Wiki GET /grafo error:', err.message);
    res.status(500).json({ error: 'Error al obtener grafo' });
  }
});

// GET /api/wiki/historial/:notaId - Historial de versiones
router.get('/historial/:notaId', tokenOpcional, async (req, res) => {
  try {
    const historial = await wikiService.getHistorial(req.params.notaId);
    res.json(historial);
  } catch (err) {
    console.error('Wiki GET /historial/:notaId error:', err.message);
    const status = err.message.includes('no encontrada') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

// GET /api/wiki/estadisticas - Estadisticas del wiki
router.get('/estadisticas', tokenOpcional, async (req, res) => {
  try {
    const stats = await wikiService.getEstadisticas();
    res.json(stats);
  } catch (err) {
    console.error('Wiki GET /estadisticas error:', err.message);
    res.status(500).json({ error: 'Error al obtener estadisticas' });
  }
});

// POST /api/wiki/consultar - Consulta para agentes IA
router.post('/consultar', tokenOpcional, async (req, res) => {
  try {
    const { query, contexto } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'El campo query es obligatorio' });
    }
    const resultado = await wikiService.consultarParaAgente(query, contexto || {});
    res.json(resultado);
  } catch (err) {
    console.error('Wiki POST /consultar error:', err.message);
    res.status(500).json({ error: 'Error al consultar base de conocimiento' });
  }
});

// POST /api/wiki/generar-desde-siniestro/:siniestroId - Generar nota desde siniestro
router.post('/generar-desde-siniestro/:siniestroId', verificarToken, async (req, res) => {
  try {
    const nota = await wikiService.generarNotaDesdeSiniestro(req.params.siniestroId);
    res.status(201).json(nota);
  } catch (err) {
    console.error('Wiki POST /generar-desde-siniestro error:', err.message);
    const status = err.message.includes('no encontrado') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

module.exports = router;
