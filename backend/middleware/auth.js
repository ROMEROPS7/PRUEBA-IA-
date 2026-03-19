const jwt = require('jsonwebtoken');
const { dbGet } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'siniestros_ai_secret_dev_key';

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

function verificarToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token invalido' });
  }
}

function requiereRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}` });
    }
    next();
  };
}

// Middleware opcional: verifica token si existe, pero no bloquea
function tokenOpcional(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }
  const token = header.split(' ')[1];
  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
  } catch {
    // Token invalido, continuar sin usuario
  }
  next();
}

module.exports = { generarToken, verificarToken, requiereRol, tokenOpcional, JWT_SECRET };
