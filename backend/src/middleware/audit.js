const db = require('../config/database');
const { v4: uuid } = require('uuid');

/**
 * Middleware de auditoría - registra todas las acciones relevantes (RGPD compliance)
 */
function auditMiddleware(req, res, next) {
  // Solo auditar mutaciones
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      // Registrar en background (no bloquear respuesta)
      setImmediate(async () => {
        try {
          await db('audit_log').insert({
            id: uuid(),
            usuario_id: req.usuario?.id || null,
            accion: `${req.method} ${req.originalUrl}`,
            recurso: req.originalUrl.split('/')[3] || 'unknown',
            ip: req.ip || req.connection?.remoteAddress,
            user_agent: (req.headers['user-agent'] || '').substring(0, 500)
          });
        } catch (e) { /* silenciar errores de audit */ }
      });
      return originalJson(body);
    };
  }
  next();
}

/**
 * Registrar evento de auditoría específico
 */
async function registrarAudit(usuarioId, accion, recurso, recursoId, datosAnteriores, datosNuevos) {
  try {
    await db('audit_log').insert({
      id: uuid(),
      usuario_id: usuarioId,
      accion,
      recurso,
      recurso_id: recursoId,
      datos_anteriores: datosAnteriores ? JSON.stringify(datosAnteriores) : null,
      datos_nuevos: datosNuevos ? JSON.stringify(datosNuevos) : null
    });
  } catch (e) { /* silenciar */ }
}

module.exports = { auditMiddleware, registrarAudit };
