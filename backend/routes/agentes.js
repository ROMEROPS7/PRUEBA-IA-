const express = require('express');
const router = express.Router();
const { dbAll, dbGet, dbRun } = require('../database/db');
const { verificarToken, requiereRol, tokenOpcional } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Listar agentes
router.get('/', tokenOpcional, async (req, res) => {
  try {
    const { tipo, zona, disponible } = req.query;
    let sql = 'SELECT * FROM agentes WHERE 1=1';
    const params = [];

    if (tipo) { sql += ' AND tipo = ?'; params.push(tipo); }
    if (zona) { sql += ' AND zona = ?'; params.push(zona); }
    if (disponible !== undefined) { sql += ' AND disponible = ?'; params.push(parseInt(disponible)); }

    sql += ' ORDER BY valoracion DESC';
    const agentes = await dbAll(sql, params);
    res.json(agentes);
  } catch (err) {
    console.error('Error listando agentes:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener agente
router.get('/:id', tokenOpcional, async (req, res) => {
  try {
    const agente = await dbGet('SELECT * FROM agentes WHERE id = ?', [req.params.id]);
    if (!agente) return res.status(404).json({ error: 'Agente no encontrado' });

    const siniestrosAsignados = await dbAll('SELECT * FROM siniestros WHERE perito_id = ? ORDER BY fecha_creacion DESC LIMIT 20', [req.params.id]);
    res.json({ ...agente, siniestros_asignados: siniestrosAsignados });
  } catch (err) {
    console.error('Error obteniendo agente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Crear agente
router.post('/', tokenOpcional, async (req, res) => {
  try {
    const { nombre, tipo, especialidad, telefono, email, zona } = req.body;
    if (!nombre || !tipo) return res.status(400).json({ error: 'Nombre y tipo requeridos' });

    const id = 'AGT-' + uuidv4().slice(0, 8).toUpperCase();
    await dbRun('INSERT INTO agentes (id,nombre,tipo,especialidad,telefono,email,zona) VALUES (?,?,?,?,?,?,?)',
      [id, nombre, tipo, especialidad, telefono, email, zona]);

    const agente = await dbGet('SELECT * FROM agentes WHERE id = ?', [id]);
    res.status(201).json(agente);
  } catch (err) {
    console.error('Error creando agente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Actualizar disponibilidad
router.put('/:id', tokenOpcional, async (req, res) => {
  try {
    const { disponible, valoracion, zona } = req.body;
    const agente = await dbGet('SELECT * FROM agentes WHERE id = ?', [req.params.id]);
    if (!agente) return res.status(404).json({ error: 'Agente no encontrado' });

    const sets = [];
    const params = [];
    if (disponible !== undefined) { sets.push('disponible = ?'); params.push(disponible ? 1 : 0); }
    if (valoracion !== undefined) { sets.push('valoracion = ?'); params.push(valoracion); }
    if (zona) { sets.push('zona = ?'); params.push(zona); }

    if (sets.length === 0) return res.status(400).json({ error: 'Nada que actualizar' });

    params.push(req.params.id);
    await dbRun(`UPDATE agentes SET ${sets.join(', ')} WHERE id = ?`, params);

    const actualizado = await dbGet('SELECT * FROM agentes WHERE id = ?', [req.params.id]);
    res.json(actualizado);
  } catch (err) {
    console.error('Error actualizando agente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
