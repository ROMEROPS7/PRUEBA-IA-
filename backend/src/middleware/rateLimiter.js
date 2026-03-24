'use strict';

/**
 * Rate Limiter simple basado en memoria
 * Para produccion usar redis-based rate limiter
 */
const rateLimitStore = new Map();

function rateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos
    maxRequests = 100,          // max requests por ventana
    message = 'Demasiadas peticiones, intenta de nuevo mas tarde',
    keyGenerator = (req) => req.ip || req.connection.remoteAddress
  } = options;

  // Limpieza periodica
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore) {
      if (now - data.windowStart > windowMs) {
        rateLimitStore.delete(key);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    let record = rateLimitStore.get(key);

    if (!record || (now - record.windowStart > windowMs)) {
      record = { count: 1, windowStart: now };
      rateLimitStore.set(key, record);
    } else {
      record.count++;
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));

    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: message,
        retryAfter: Math.ceil((record.windowStart + windowMs - now) / 1000)
      });
    }

    next();
  };
}

// Rate limiter estricto para auth
const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Demasiados intentos de login, espera 15 minutos'
});

// Rate limiter general para API
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 200
});

module.exports = { rateLimiter, authLimiter, apiLimiter };
