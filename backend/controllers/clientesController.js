const { dbAll, dbGet, dbRun } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const clientesController = {
  async listar(req, res) {
    try {
      const { buscar, limite, offset } = req.query;
      let sql = 'SELECT * FROM clientes WHERE 1=1';
      const params = [];

      if (buscar) {
        sql += ' AND (nombre LIKE ? OR poliza LIKE ? OR telefono LIKE ? OR email LIKE ?)';
        params.push(`%${buscar}%`, `%${buscar}%`, `%${buscar}%`, `%${buscar}%`);
      }

      sql += ' ORDER BY fecha_alta DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limite) || 50, parseInt(offset) || 0);

      const clientes = await dbAll(sql, params);
      const total = await dbGet('SELECT COUNT(*) as total FROM clientes');
      res.json({ clientes, total: total.total });
    } catch (err) {

      res.status(500).json({ error: 'Error interno' });
    }
  },

  async obtener(req, res) {
    try {
      const { id } = req.params;
      const cliente = await dbGet('SELECT * FROM clientes WHERE id = ? OR poliza = ?', [id, id]);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      const siniestros = await dbAll('SELECT * FROM siniestros WHERE cliente_id = ? ORDER BY fecha_creacion DESC', [cliente.id]);
      const llamadas = await dbAll('SELECT * FROM llamadas WHERE cliente_id = ? ORDER BY fecha DESC LIMIT 10', [cliente.id]);
      const mensajes = await dbAll('SELECT * FROM mensajes_whatsapp WHERE cliente_id = ? ORDER BY fecha DESC LIMIT 20', [cliente.id]);

      res.json({ ...cliente, siniestros, llamadas, mensajes });
    } catch (err) {

      res.status(500).json({ error: 'Error interno' });
    }
  },

  async crear(req, res) {
    try {
      const { nombre, telefono, email, dni, direccion, poliza, tipo_poliza } = req.body;
      if (!nombre || !telefono) {
        return res.status(400).json({ error: 'Nombre y telefono son requeridos' });
      }

      if (poliza) {
        const existe = await dbGet('SELECT id FROM clientes WHERE poliza = ?', [poliza]);
        if (existe) {
          return res.status(409).json({ error: 'La poliza ya existe' });
        }
      }

      const id = 'CLI-' + uuidv4().slice(0, 8).toUpperCase();
      await dbRun('INSERT INTO clientes (id, nombre, telefono, email, dni, direccion, poliza, tipo_poliza) VALUES (?,?,?,?,?,?,?,?)',
        [id, nombre, telefono, email, dni, direccion, poliza, tipo_poliza]);

      const cliente = await dbGet('SELECT * FROM clientes WHERE id = ?', [id]);
      res.status(201).json(cliente);
    } catch (err) {

      res.status(500).json({ error: 'Error interno' });
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const campos = req.body;
      const cliente = await dbGet('SELECT * FROM clientes WHERE id = ?', [id]);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      const actualizables = ['nombre', 'telefono', 'email', 'dni', 'direccion', 'poliza', 'tipo_poliza', 'notas'];
      const sets = [];
      const params = [];

      for (const campo of actualizables) {
        if (campos[campo] !== undefined) {
          sets.push(`${campo} = ?`);
          params.push(campos[campo]);
        }
      }

      if (sets.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      params.push(id);
      await dbRun(`UPDATE clientes SET ${sets.join(', ')} WHERE id = ?`, params);

      const actualizado = await dbGet('SELECT * FROM clientes WHERE id = ?', [id]);
      res.json(actualizado);
    } catch (err) {

      res.status(500).json({ error: 'Error interno' });
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const sinConSiniestros = await dbGet('SELECT COUNT(*) as c FROM siniestros WHERE cliente_id = ?', [id]);
      if (sinConSiniestros && sinConSiniestros.c > 0) {
        return res.status(409).json({ error: 'No se puede eliminar un cliente con siniestros asociados' });
      }

      const result = await dbRun('DELETE FROM clientes WHERE id = ?', [id]);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      res.json({ mensaje: 'Cliente eliminado' });
    } catch (err) {

      res.status(500).json({ error: 'Error interno' });
    }
  },
};

module.exports = clientesController;
