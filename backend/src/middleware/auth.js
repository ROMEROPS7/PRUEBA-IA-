const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Middleware de autenticación JWT
 */
function auth(rolesPermitidos = []) {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization;
      if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticación requerido' });
      }

      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const usuario = await db('usuarios')
        .where('id', decoded.id)
        .where('activo', true)
        .first();

      if (!usuario) {
        return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
      }

      // Verificar bloqueo
      if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
        return res.status(403).json({ error: 'Cuenta temporalmente bloqueada' });
      }

      // Verificar rol
      if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.tipo)) {
        return res.status(403).json({ error: 'No tienes permisos para esta acción' });
      }

      req.usuario = {
        id: usuario.id,
        empresa_id: usuario.empresa_id,
        email: usuario.email,
        nombre: usuario.nombre,
        tipo: usuario.tipo,
        permisos: typeof usuario.permisos === 'string' ? JSON.parse(usuario.permisos) : usuario.permisos
      };

      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token inválido' });
      }
      return res.status(500).json({ error: 'Error de autenticación' });
    }
  };
}

/**
 * Middleware opcional - no falla si no hay token
 */
function authOptional(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return next();
  auth([])(req, res, next);
}

module.exports = { auth, authOptional };
