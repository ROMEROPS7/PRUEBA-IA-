const express = require('express');
const router = express.Router();
const { verificarToken, requiereRol } = require('../middleware/auth');

// Services
const backupService = require('../services/backupService');
const logService = require('../services/logService');
const { taskProcessor: queueService } = require('../services/queueService');

// All admin endpoints require admin or gestor role
router.use(verificarToken, requiereRol('admin', 'gestor'));

// ============================================================
// BACKUPS
// ============================================================

router.get('/backups', async (req, res) => {
  try {
    res.json(await backupService.listBackups());
  } catch (err) {
    req.app.get('logService')?.log('ERROR', 'api', err.message, { url: req.url });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/backups', async (req, res) => {
  try {
    const result = await backupService.backupNow();
    res.json({ mensaje: 'Backup creado', ...result });
  } catch (err) {
    req.app.get('logService')?.log('ERROR', 'api', err.message, { url: req.url });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/backups/restore', requiereRol('admin'), async (req, res) => {
  try {
    await backupService.restore(req.body.nombre);
    res.json({ mensaje: 'Backup restaurado correctamente' });
  } catch (err) {
    req.app.get('logService')?.log('ERROR', 'api', err.message, { url: req.url });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================
// LOGS
// ============================================================

router.get('/logs', async (req, res) => {
  try {
    res.json(await logService.getLogs(req.query));
  } catch (err) {
    req.app.get('logService')?.log('ERROR', 'api', err.message, { url: req.url });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/logs/stats', async (req, res) => {
  try {
    res.json(await logService.getStats());
  } catch (err) {
    req.app.get('logService')?.log('ERROR', 'api', err.message, { url: req.url });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================
// QUEUE
// ============================================================

router.get('/queue', (req, res) => {
  try {
    res.json({ stats: queueService.getStats(), queue: queueService.getQueue() });
  } catch (err) {
    req.app.get('logService')?.log('ERROR', 'api', err.message, { url: req.url });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/queue/enqueue', (req, res) => {
  try {
    const { type, data, priority } = req.body;
    const taskId = queueService.enqueue(type, data, priority || 5);
    res.json({ taskId });
  } catch (err) {
    req.app.get('logService')?.log('ERROR', 'api', err.message, { url: req.url });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/queue/retry-failed', (req, res) => {
  try {
    const count = queueService.retryFailed();
    res.json({ retriedCount: count });
  } catch (err) {
    req.app.get('logService')?.log('ERROR', 'api', err.message, { url: req.url });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
