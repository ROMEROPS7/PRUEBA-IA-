const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { dbAll, dbGet, dbRun } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// Derecho al olvido - anonimiza datos del cliente
router.delete('/clientes/:id/derecho-olvido', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await dbGet('SELECT * FROM clientes WHERE id = ?', [id]);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    // Anonimizar datos personales
    await dbRun(`UPDATE clientes SET
      nombre = 'ANONIMIZADO', telefono = '000000000', email = 'anonimizado@deleted.com',
      dni = 'XXXXXXXXX', direccion = 'ANONIMIZADO', notas = NULL
      WHERE id = ?`, [id]);

    // Anonimizar en llamadas y mensajes
    await dbRun(`UPDATE llamadas SET telefono_origen = '000000000', transcripcion = 'ANONIMIZADO', resumen_ia = 'ANONIMIZADO' WHERE cliente_id = ?`, [id]);
    await dbRun(`UPDATE mensajes_whatsapp SET telefono = '000000000', contenido = 'ANONIMIZADO', respuesta_ia = 'ANONIMIZADO' WHERE cliente_id = ?`, [id]);

    // Registrar la accion
    await dbRun(`INSERT INTO audit_blockchain (id, indice, timestamp, tipo, datos, usuario_id, hash_anterior, hash, nonce) VALUES (?,?,?,?,?,?,'','',0)`,
      [uuidv4(), 0, new Date().toISOString(), 'derecho_olvido', JSON.stringify({clienteId: id}), req.usuario.id]);

    res.json({ mensaje: 'Datos del cliente anonimizados correctamente', clienteId: id });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Exportar todos los datos del cliente
router.get('/clientes/:id/exportar-datos', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await dbGet('SELECT * FROM clientes WHERE id = ?', [id]);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    const siniestros = await dbAll('SELECT * FROM siniestros WHERE cliente_id = ?', [id]);
    const llamadas = await dbAll('SELECT * FROM llamadas WHERE cliente_id = ?', [id]);
    const mensajes = await dbAll('SELECT * FROM mensajes_whatsapp WHERE cliente_id = ?', [id]);
    const expedientes = await dbAll(`SELECT e.* FROM expedientes e JOIN siniestros s ON e.siniestro_id = s.id WHERE s.cliente_id = ?`, [id]);

    res.json({
      exportado_en: new Date().toISOString(),
      cliente,
      siniestros,
      llamadas,
      mensajes,
      expedientes,
      nota: 'Exportacion completa de datos personales segun RGPD Art. 20'
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Registrar consentimiento
router.post('/clientes/:id/consentimiento', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, aceptado } = req.body;
    if (!tipo) return res.status(400).json({ error: 'Tipo de consentimiento requerido' });

    // Create consentimientos table if not exists
    await dbRun(`CREATE TABLE IF NOT EXISTS consentimientos (
      id TEXT PRIMARY KEY, cliente_id TEXT NOT NULL, tipo TEXT NOT NULL,
      aceptado INTEGER NOT NULL, ip TEXT, fecha TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(cliente_id) REFERENCES clientes(id)
    )`);

    await dbRun('INSERT INTO consentimientos (id, cliente_id, tipo, aceptado, ip) VALUES (?,?,?,?,?)',
      [uuidv4(), id, tipo, aceptado ? 1 : 0, req.ip]);

    res.json({ registrado: true, tipo, aceptado: !!aceptado, fecha: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Historial de consentimientos
router.get('/clientes/:id/consentimientos', verificarToken, async (req, res) => {
  try {
    await dbRun(`CREATE TABLE IF NOT EXISTS consentimientos (
      id TEXT PRIMARY KEY, cliente_id TEXT NOT NULL, tipo TEXT NOT NULL,
      aceptado INTEGER NOT NULL, ip TEXT, fecha TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(cliente_id) REFERENCES clientes(id)
    )`);
    const consentimientos = await dbAll('SELECT * FROM consentimientos WHERE cliente_id = ? ORDER BY fecha DESC', [req.params.id]);
    res.json(consentimientos);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
