const bcrypt = require('bcrypt');
const { dbGet, dbRun } = require('../database/db');
const { generarToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

function validatePassword(password) {
  if (!password || password.length < 12) return 'Password must be at least 12 characters';
  if (!/[A-Z]/.test(password)) return 'Must contain uppercase letter';
  if (!/[0-9]/.test(password)) return 'Must contain a number';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Must contain special character';
  return null;
}

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y password requeridos' });
      }

      const usuario = await dbGet('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email]);
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      const passwordValido = await bcrypt.compare(password, usuario.password);
      if (!passwordValido) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      await dbRun("UPDATE usuarios SET ultimo_login = datetime('now') WHERE id = ?", [usuario.id]);

      const token = generarToken(usuario);
      const refreshToken = require('../middleware/auth').generarRefreshToken(usuario);
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({
        token,
        refreshToken,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      });
    } catch (err) {

      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async registro(req, res) {
    try {
      const { nombre, email, password, rol } = req.body;
      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Nombre, email y password requeridos' });
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        return res.status(400).json({ error: passwordError });
      }

      const existe = await dbGet('SELECT id FROM usuarios WHERE email = ?', [email]);
      if (existe) {
        return res.status(409).json({ error: 'El email ya esta registrado' });
      }

      const hash = await bcrypt.hash(password, 10);
      const id = uuidv4();
      await dbRun('INSERT INTO usuarios (id, nombre, email, password, rol) VALUES (?,?,?,?,?)',
        [id, nombre, email, hash, rol || 'gestor']);

      const token = generarToken({ id, email, rol: rol || 'gestor', nombre });
      res.status(201).json({
        token,
        usuario: { id, nombre, email, rol: rol || 'gestor' },
      });
    } catch (err) {

      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async perfil(req, res) {
    try {
      const usuario = await dbGet('SELECT id, nombre, email, rol, creado_en, ultimo_login FROM usuarios WHERE id = ?', [req.usuario.id]);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json(usuario);
    } catch (err) {

      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async cambiarPassword(req, res) {
    try {
      const { password_actual, password_nuevo } = req.body;
      if (!password_actual || !password_nuevo) {
        return res.status(400).json({ error: 'Passwords actual y nuevo requeridos' });
      }

      const passwordError = validatePassword(password_nuevo);
      if (passwordError) {
        return res.status(400).json({ error: passwordError });
      }

      const usuario = await dbGet('SELECT * FROM usuarios WHERE id = ?', [req.usuario.id]);
      const valido = await bcrypt.compare(password_actual, usuario.password);
      if (!valido) {
        return res.status(401).json({ error: 'Password actual incorrecto' });
      }

      const hash = await bcrypt.hash(password_nuevo, 10);
      await dbRun('UPDATE usuarios SET password = ? WHERE id = ?', [hash, req.usuario.id]);
      res.json({ mensaje: 'Password actualizado correctamente' });
    } catch (err) {

      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },
};

module.exports = authController;
