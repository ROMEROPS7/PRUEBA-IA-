const { dbAll, dbGet, dbRun } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const siniestrosController = {
  async listar(req, res) {
    try {
      const { estado, tipo, urgencia_min, orden, limite, offset } = req.query;
      let sql = `SELECT s.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono,
                  c.poliza as cliente_poliza, a.nombre as perito_nombre
                 FROM siniestros s
                 LEFT JOIN clientes c ON s.cliente_id = c.id
                 LEFT JOIN agentes a ON s.perito_id = a.id WHERE 1=1`;
      const params = [];

      if (estado) { sql += ' AND s.estado = ?'; params.push(estado); }
      if (tipo) { sql += ' AND s.tipo = ?'; params.push(tipo); }
      if (urgencia_min) { sql += ' AND s.urgencia >= ?'; params.push(parseInt(urgencia_min)); }

      switch (orden) {
        case 'fecha-asc': sql += ' ORDER BY s.fecha_creacion ASC'; break;
        case 'urgencia-desc': sql += ' ORDER BY s.urgencia DESC'; break;
        case 'fraude-desc': sql += ' ORDER BY s.score_fraude DESC'; break;
        default: sql += ' ORDER BY s.fecha_creacion DESC';
      }

      sql += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(limite) || 50, parseInt(offset) || 0);

      const siniestros = await dbAll(sql, params);
      const total = await dbGet('SELECT COUNT(*) as total FROM siniestros');
      res.json({ siniestros, total: total.total });
    } catch (err) {
      console.error('Error listando siniestros:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  },

  async obtener(req, res) {
    try {
      const { id } = req.params;
      const siniestro = await dbGet(`SELECT s.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono,
        c.email as cliente_email, c.poliza as cliente_poliza, c.dni as cliente_dni,
        a.nombre as perito_nombre, a.telefono as perito_telefono
        FROM siniestros s
        LEFT JOIN clientes c ON s.cliente_id = c.id
        LEFT JOIN agentes a ON s.perito_id = a.id
        WHERE s.id = ? OR s.expediente = ?`, [id, id]);

      if (!siniestro) {
        return res.status(404).json({ error: 'Siniestro no encontrado' });
      }

      const timeline = await dbAll('SELECT * FROM expedientes WHERE siniestro_id = ? ORDER BY fecha ASC', [siniestro.id]);
      const documentos = await dbAll('SELECT * FROM documentos WHERE siniestro_id = ? ORDER BY fecha DESC', [siniestro.id]);
      const llamadas = await dbAll('SELECT * FROM llamadas WHERE siniestro_id = ? ORDER BY fecha DESC', [siniestro.id]);
      const mensajes = await dbAll('SELECT * FROM mensajes_whatsapp WHERE siniestro_id = ? ORDER BY fecha ASC', [siniestro.id]);

      res.json({ ...siniestro, timeline, documentos, llamadas, mensajes });
    } catch (err) {
      console.error('Error obteniendo siniestro:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  },

  async crear(req, res) {
    try {
      const { cliente_id, tipo, descripcion, urgencia, direccion, lat, lng, zona } = req.body;
      if (!cliente_id || !tipo || !descripcion) {
        return res.status(400).json({ error: 'cliente_id, tipo y descripcion son requeridos' });
      }

      const cliente = await dbGet('SELECT * FROM clientes WHERE id = ?', [cliente_id]);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      const id = 'SIN-' + uuidv4().slice(0, 8).toUpperCase();
      const numExp = await dbGet('SELECT COUNT(*) as c FROM siniestros');
      const expediente = `EXP-2024-${String(900 + (numExp?.c || 0)).padStart(4, '0')}`;

      // Score de fraude basico automatico
      const scoreFraude = calcularScoreFraudeBasico(descripcion, urgencia);
      const iaConfianza = scoreFraude > 50 ? 65 : scoreFraude > 25 ? 80 : 95;

      await dbRun(`INSERT INTO siniestros (id, expediente, cliente_id, tipo, descripcion, urgencia, score_fraude, direccion, lat, lng, zona, ia_confianza, ia_gestion, ia_tiempo, humano_tiempo)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, expediente, cliente_id, tipo, descripcion, urgencia || 5, scoreFraude, direccion, lat, lng, zona, iaConfianza, scoreFraude > 40 ? 'partial' : 'full', (Math.random() * 2 + 0.5).toFixed(1) + ' min', Math.floor(Math.random() * 15 + 10) + ' min']);

      await dbRun('INSERT INTO expedientes (id, siniestro_id, tipo_evento, descripcion) VALUES (?,?,?,?)',
        [uuidv4(), id, 'creacion', 'Siniestro registrado automaticamente por IA']);

      const siniestro = await dbGet('SELECT * FROM siniestros WHERE id = ?', [id]);
      res.status(201).json(siniestro);
    } catch (err) {
      console.error('Error creando siniestro:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const campos = req.body;
      const siniestro = await dbGet('SELECT * FROM siniestros WHERE id = ? OR expediente = ?', [id, id]);
      if (!siniestro) {
        return res.status(404).json({ error: 'Siniestro no encontrado' });
      }

      const actualizables = ['estado', 'urgencia', 'descripcion', 'perito_id', 'direccion', 'score_fraude', 'valoracion', 'indemnizacion'];
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

      sets.push("fecha_actualizacion = datetime('now')");
      if (campos.estado === 'Resuelto' || campos.estado === 'Cerrado') {
        sets.push("fecha_cierre = datetime('now')");
      }

      params.push(siniestro.id);
      await dbRun(`UPDATE siniestros SET ${sets.join(', ')} WHERE id = ?`, params);

      // Registrar en timeline
      if (campos.estado) {
        await dbRun('INSERT INTO expedientes (id, siniestro_id, tipo_evento, descripcion) VALUES (?,?,?,?)',
          [uuidv4(), siniestro.id, 'cambio_estado', `Estado cambiado a: ${campos.estado}`]);
      }
      if (campos.perito_id) {
        const perito = await dbGet('SELECT nombre FROM agentes WHERE id = ?', [campos.perito_id]);
        await dbRun('INSERT INTO expedientes (id, siniestro_id, tipo_evento, descripcion) VALUES (?,?,?,?)',
          [uuidv4(), siniestro.id, 'perito', `Perito asignado: ${perito?.nombre || campos.perito_id}`]);
      }

      const actualizado = await dbGet('SELECT * FROM siniestros WHERE id = ?', [siniestro.id]);
      res.json(actualizado);
    } catch (err) {
      console.error('Error actualizando siniestro:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const result = await dbRun('DELETE FROM siniestros WHERE id = ? OR expediente = ?', [id, id]);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Siniestro no encontrado' });
      }
      res.json({ mensaje: 'Siniestro eliminado' });
    } catch (err) {
      console.error('Error eliminando siniestro:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  },

  async buscar(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.length < 2) {
        return res.status(400).json({ error: 'Busqueda minimo 2 caracteres' });
      }
      const resultados = await dbAll(`SELECT s.*, c.nombre as cliente_nombre
        FROM siniestros s LEFT JOIN clientes c ON s.cliente_id = c.id
        WHERE s.expediente LIKE ? OR c.nombre LIKE ? OR s.descripcion LIKE ? OR c.poliza LIKE ?
        ORDER BY s.fecha_creacion DESC LIMIT 20`,
        [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]);
      res.json(resultados);
    } catch (err) {
      console.error('Error buscando:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  },
};

function calcularScoreFraudeBasico(descripcion, urgencia) {
  let score = 0;
  const desc = (descripcion || '').toLowerCase();
  const palabrasSospechosas = ['robo', 'desaparecido', 'incendio nocturno', 'sin testigos', 'total loss', 'siniestro total'];
  for (const p of palabrasSospechosas) {
    if (desc.includes(p)) score += 15;
  }
  if (urgencia >= 9) score += 5;
  score += Math.floor(Math.random() * 10);
  return Math.min(score, 100);
}

module.exports = siniestrosController;
