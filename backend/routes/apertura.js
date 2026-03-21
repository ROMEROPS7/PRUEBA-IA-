// ============================================================
// RUTAS - APERTURA AUTOMATICA DE SINIESTROS
// ============================================================
// POST /api/apertura/llamada     - Simular llamada entrante
// POST /api/apertura/whatsapp    - Simular WhatsApp entrante
// POST /api/apertura/simular/:tipo - Demo completa con dialogo
// GET  /api/apertura/estadisticas - KPIs del sistema
// GET  /api/apertura/recientes   - Ultimas aperturas
// ============================================================

const express = require('express');
const router = express.Router();
const { tokenOpcional } = require('../middleware/auth');
const aperturaService = require('../services/aperturaAutomaticaService');

// ─── Simular llamada entrante ───
router.post('/llamada', tokenOpcional, async (req, res) => {
  try {
    const { telefono, transcripcion, descripcion } = req.body;
    if (!telefono) {
      return res.status(400).json({ error: 'El campo "telefono" es obligatorio' });
    }

    const resultado = await aperturaService.procesarLlamadaEntrante(telefono, transcripcion || descripcion);

    // Emitir evento WebSocket si disponible
    const io = req.app.get('io');
    if (io && resultado.exito) {
      io.emit('feed:actividad', {
        agente: 'Recepcionista',
        texto: `Siniestro ${resultado.expediente} abierto automaticamente por llamada de ${resultado.cliente.nombre}`,
        timestamp: new Date().toISOString(),
      });
      io.emit('siniestro:creado', {
        id: resultado.siniestro_id,
        expediente: resultado.expediente,
        tipo: resultado.subtipo,
        cliente: resultado.cliente.nombre,
        canal: 'llamada',
      });
    }

    res.json(resultado);
  } catch (e) {
    console.error('Error en apertura por llamada:', e.message);
    res.status(500).json({ error: 'Error interno del servidor', detalle: e.message });
  }
});

// ─── Simular WhatsApp entrante ───
router.post('/whatsapp', tokenOpcional, async (req, res) => {
  try {
    const { telefono, mensaje, tieneImagen } = req.body;
    if (!telefono) {
      return res.status(400).json({ error: 'El campo "telefono" es obligatorio' });
    }
    if (!mensaje && !tieneImagen) {
      return res.status(400).json({ error: 'Se requiere "mensaje" o "tieneImagen"' });
    }

    const resultado = await aperturaService.procesarWhatsAppEntrante(telefono, mensaje, tieneImagen);

    const io = req.app.get('io');
    if (io && resultado.exito) {
      io.emit('feed:actividad', {
        agente: 'Recepcionista',
        texto: `Siniestro ${resultado.expediente} abierto por WhatsApp de ${resultado.cliente.nombre}`,
        timestamp: new Date().toISOString(),
      });
      io.emit('siniestro:creado', {
        id: resultado.siniestro_id,
        expediente: resultado.expediente,
        tipo: resultado.subtipo,
        cliente: resultado.cliente.nombre,
        canal: 'whatsapp',
      });
    }

    res.json(resultado);
  } catch (e) {
    console.error('Error en apertura por WhatsApp:', e.message);
    res.status(500).json({ error: 'Error interno del servidor', detalle: e.message });
  }
});

// ─── Demo: simular llamada completa con dialogo ───
router.post('/simular/:tipo', tokenOpcional, async (req, res) => {
  try {
    const resultado = await aperturaService.simularLlamadaCompleta(req.params.tipo);
    if (resultado.error) {
      return res.status(400).json(resultado);
    }
    res.json(resultado);
  } catch (e) {
    console.error('Error en simulacion:', e.message);
    res.status(500).json({ error: 'Error interno del servidor', detalle: e.message });
  }
});

// ─── Estadisticas del sistema de apertura ───
router.get('/estadisticas', tokenOpcional, async (req, res) => {
  try {
    res.json(await aperturaService.getEstadisticas());
  } catch (e) {
    console.error('Error obteniendo estadisticas de apertura:', e.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── Ultimas aperturas con detalle ───
router.get('/recientes', tokenOpcional, async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;
    res.json(await aperturaService.getUltimasAperturas(limite));
  } catch (e) {
    console.error('Error obteniendo aperturas recientes:', e.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── Tipos de simulacion disponibles ───
router.get('/tipos-simulacion', tokenOpcional, (req, res) => {
  res.json({
    tipos: [
      { id: 'auto_accidente', label: 'Accidente de automovil', descripcion: 'Colision en M-30, danos materiales' },
      { id: 'hogar_inundacion', label: 'Inundacion en vivienda', descripcion: 'Rotura de tuberia, salon inundado' },
      { id: 'auto_robo', label: 'Robo de vehiculo', descripcion: 'Vehiculo sustraido en parking' },
      { id: 'hogar_incendio', label: 'Incendio en vivienda', descripcion: 'Cortocircuito en cocina' },
      { id: 'comercio_robo', label: 'Robo en comercio', descripcion: 'Robo con fuerza en local' },
    ],
  });
});

module.exports = router;
