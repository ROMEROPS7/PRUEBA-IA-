const { logger } = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    usuario: req.usuario?.id
  });

  if (err.isJoi) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      detalles: err.details?.map(d => d.message)
    });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Ruta ${req.method} ${req.originalUrl} no encontrada` });
}

module.exports = { errorHandler, notFoundHandler };
