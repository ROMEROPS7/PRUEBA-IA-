const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const { schemas, validar } = require('../middleware/validation');
const { logger } = require('../utils/logger');

// POST /auth/login
router.post('/login', validar(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await db('usuarios').where('email', email).first();

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Verificar bloqueo
    if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
      return res.status(403).json({ error: 'Cuenta bloqueada temporalmente. Inténtalo más tarde.' });
    }

    const valid = await bcrypt.compare(password, usuario.password_hash);
    if (!valid) {
      // Incrementar intentos fallidos
      const intentos = (usuario.intentos_fallidos || 0) + 1;
      const update = { intentos_fallidos: intentos };
      if (intentos >= 5) {
        update.bloqueado_hasta = new Date(Date.now() + 30 * 60 * 1000); // 30 min
      }
      await db('usuarios').where('id', usuario.id).update(update);
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Resetear intentos y actualizar último login
    await db('usuarios').where('id', usuario.id).update({
      intentos_fallidos: 0,
      bloqueado_hasta: null,
      ultimo_login: new Date()
    });

    const token = jwt.sign(
      { id: usuario.id, empresa_id: usuario.empresa_id, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    const refreshToken = jwt.sign(
      { id: usuario.id, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Cargar empresa
    const empresa = await db('empresas').where('id', usuario.empresa_id).first();

    res.json({
      token,
      refresh_token: refreshToken,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        tipo: usuario.tipo,
        empresa: empresa ? { id: empresa.id, nombre: empresa.nombre, slug: empresa.slug, config: empresa.config } : null
      }
    });
  } catch (err) {
    logger.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'Refresh token requerido' });

    const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') return res.status(401).json({ error: 'Token inválido' });

    const usuario = await db('usuarios').where('id', decoded.id).where('activo', true).first();
    if (!usuario) return res.status(401).json({ error: 'Usuario no encontrado' });

    const token = jwt.sign(
      { id: usuario.id, empresa_id: usuario.empresa_id, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: 'Refresh token inválido o expirado' });
  }
});

// GET /auth/me
router.get('/me', auth(), async (req, res) => {
  const usuario = await db('usuarios')
    .select('id', 'email', 'nombre', 'apellidos', 'tipo', 'telefono', 'empresa_id', 'preferencias', 'created_at')
    .where('id', req.usuario.id)
    .first();
  const empresa = await db('empresas').where('id', usuario.empresa_id).first();
  res.json({ ...usuario, empresa: { id: empresa?.id, nombre: empresa?.nombre, slug: empresa?.slug, config: empresa?.config } });
});

// POST /auth/register (solo admin puede crear usuarios)
router.post('/register', auth(['superadmin', 'admin_empresa']), validar(schemas.registro), async (req, res) => {
  try {
    const { email, password, nombre, apellidos, telefono, dni_nif } = req.body;

    const existe = await db('usuarios').where('email', email).first();
    if (existe) return res.status(409).json({ error: 'El email ya está registrado' });

    const hash = await bcrypt.hash(password, 12);
    const [usuario] = await db('usuarios').insert({
      empresa_id: req.usuario.empresa_id,
      email, password_hash: hash, nombre, apellidos, telefono, dni_nif,
      tipo: req.body.tipo || 'cliente'
    }).returning(['id', 'email', 'nombre', 'tipo']);

    res.status(201).json(usuario);
  } catch (err) {
    logger.error('Error en registro:', err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

module.exports = router;
