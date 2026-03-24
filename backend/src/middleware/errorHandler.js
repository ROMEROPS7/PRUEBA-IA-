'use strict';

const { logger } = require('./logger');

/**
 * Middleware de manejo centralizado de errores
 */
function errorHandler(err, req, res, next) {
  // Log del error
  logger.error(err.message, {
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    ip: req.ip
  });

  // Determinar status code
  const statusCode = err.statusCode || err.status || 500;

  // No exponer detalles internos en produccion
  const isProduction = process.env.NODE_ENV === 'production';

  const response = {
    error: {
      message: isProduction && statusCode === 500
        ? 'Error interno del servidor'
        : err.message,
      code: err.code || 'INTERNAL_ERROR'
    }
  };

  if (!isProduction) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * Middleware para rutas no encontradas
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: 'Ruta no encontrada: ' + req.method + ' ' + req.url,
      code: 'NOT_FOUND'
    }
  });
}

/**
 * Wrapper para async handlers (evita try-catch repetitivo)
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, notFoundHandler, asyncHandler };
