// =============================================================================
// security.js - Security Middleware
// =============================================================================

// ---------------------------------------------------------------------------
// In-memory stores (production would use Redis; these work standalone)
// ---------------------------------------------------------------------------
class LRUMap {
  constructor(maxSize = 10000) {
    this.maxSize = maxSize;
    this.map = new Map();
  }
  get(key) {
    const val = this.map.get(key);
    if (val !== undefined) { this.map.delete(key); this.map.set(key, val); }
    return val;
  }
  set(key, val) {
    this.map.delete(key);
    if (this.map.size >= this.maxSize) { const oldest = this.map.keys().next().value; this.map.delete(oldest); }
    this.map.set(key, val);
  }
  delete(key) { return this.map.delete(key); }
  get size() { return this.map.size; }
  forEach(fn) { this.map.forEach(fn); }
}

const rateLimitStore = new LRUMap(10000);   // key -> { count, resetAt }
const bruteForceStore = new LRUMap(5000);  // email -> { attempts, lockedUntil }
const ipBlacklistSet = new Set();
const violationCounts = new LRUMap(5000);  // ip -> count

// Valid API keys (in production load from env / database)
const validApiKeys = new Map();

// Bootstrap from env if available
if (process.env.API_KEYS) {
  process.env.API_KEYS.split(',').forEach((k) => {
    const trimmed = k.trim();
    if (trimmed) validApiKeys.set(trimmed, { createdAt: new Date().toISOString() });
  });
}

// ---------------------------------------------------------------------------
// Utility: periodic cleanup for rate limit entries
// ---------------------------------------------------------------------------
function _startCleanup(store, intervalMs = 60000) {
  const timer = setInterval(() => {
    const now = Date.now();
    const inner = store.map || store;
    for (const [key, entry] of inner.entries()) {
      if (entry.resetAt && entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, intervalMs);
  if (timer.unref) timer.unref();
  return timer;
}

_startCleanup(rateLimitStore);

// ---------------------------------------------------------------------------
// rateLimiter - rate limit by IP
// ---------------------------------------------------------------------------
function rateLimiter(options = {}) {
  const windowMs = options.windowMs || 60000;
  const max = options.max || 100;
  const message = options.message || 'Demasiadas solicitudes. Intente de nuevo mas tarde.';

  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const key = `ip:${ip}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      rateLimitStore.set(key, entry);
    }

    entry.count++;

    // Set rate-limit headers
    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    res.set('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      _recordViolation(ip);
      return res.status(429).json({ error: message });
    }

    next();
  };
}

// ---------------------------------------------------------------------------
// rateLimiterByKey - rate limit by arbitrary key
// ---------------------------------------------------------------------------
function rateLimiterByKey(keyExtractor, options = {}) {
  const windowMs = options.windowMs || 60000;
  const max = options.max || 100;
  const message = options.message || 'Limite de solicitudes excedido.';

  if (typeof keyExtractor !== 'function') {
    throw new TypeError('keyExtractor must be a function');
  }

  return (req, res, next) => {
    const rawKey = keyExtractor(req);
    if (!rawKey) return next(); // no key extracted, let it through

    const key = `custom:${rawKey}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      rateLimitStore.set(key, entry);
    }

    entry.count++;

    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)));

    if (entry.count > max) {
      return res.status(429).json({ error: message });
    }

    next();
  };
}

// ---------------------------------------------------------------------------
// bruteForceProtection
// ---------------------------------------------------------------------------
function bruteForceProtection(options = {}) {
  const maxAttempts = options.maxAttempts || 5;
  const lockoutMs = options.lockoutMs || 900000; // 15 min

  return (req, res, next) => {
    const email = (req.body && (req.body.email || req.body.username)) || '';
    if (!email) return next();

    const now = Date.now();
    let entry = bruteForceStore.get(email);

    if (entry && entry.lockedUntil && entry.lockedUntil > now) {
      const retryAfter = Math.ceil((entry.lockedUntil - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(423).json({
        error: 'Cuenta bloqueada temporalmente por multiples intentos fallidos.',
        retryAfterSeconds: retryAfter,
      });
    }

    // Attach helper to record outcome after authentication logic runs
    res.on('finish', () => {
      if (res.statusCode === 401 || res.statusCode === 403) {
        _recordFailedAttempt(email, maxAttempts, lockoutMs);
      } else if (res.statusCode >= 200 && res.statusCode < 300) {
        // Successful login clears the counter
        bruteForceStore.delete(email);
      }
    });

    next();
  };
}

function _recordFailedAttempt(email, maxAttempts, lockoutMs) {
  let entry = bruteForceStore.get(email) || { attempts: 0, lockedUntil: null };
  entry.attempts++;
  if (entry.attempts >= maxAttempts) {
    entry.lockedUntil = Date.now() + lockoutMs;
  }
  bruteForceStore.set(email, entry);
}

// Expose for manual management
bruteForceProtection.getStatus = (email) => bruteForceStore.get(email) || null;
bruteForceProtection.unlock = (email) => bruteForceStore.delete(email);

// ---------------------------------------------------------------------------
// IP Blacklist
// ---------------------------------------------------------------------------
const VIOLATION_THRESHOLD = 10;

function _recordViolation(ip) {
  const count = (violationCounts.get(ip) || 0) + 1;
  violationCounts.set(ip, count);
  if (count >= VIOLATION_THRESHOLD) {
    ipBlacklistSet.add(ip);
  }
}

const ipBlacklist = {
  middleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      if (ipBlacklistSet.has(ip)) {
        return res.status(403).json({ error: 'Acceso denegado.' });
      }
      next();
    };
  },

  add(ip) {
    ipBlacklistSet.add(ip);
  },

  remove(ip) {
    ipBlacklistSet.delete(ip);
    violationCounts.delete(ip);
  },

  list() {
    return Array.from(ipBlacklistSet);
  },

  has(ip) {
    return ipBlacklistSet.has(ip);
  },
};

// ---------------------------------------------------------------------------
// Security Headers
// ---------------------------------------------------------------------------
function securityHeaders() {
  return (req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'");
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  };
}

// ---------------------------------------------------------------------------
// Input Sanitization
// ---------------------------------------------------------------------------

// Patterns considered dangerous
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b\s)/i,
  /(--|;|\/\*|\*\/|xp_|sp_)/i,
  /('(\s)*(OR|AND)(\s)*')/i,
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
];

const HTML_TAG_RE = /<[^>]*>/g;

function sanitizeValue(value) {
  if (typeof value === 'string') {
    // Strip HTML tags
    let sanitized = value.replace(HTML_TAG_RE, '');
    // Trim whitespace
    sanitized = sanitized.trim();
    // Neutralise SQL injection patterns by removing dangerous characters
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(sanitized)) {
        // Remove the offending segment rather than rejecting the whole value
        sanitized = sanitized.replace(pattern, ' ');
      }
    }
    // Encode remaining dangerous characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return sanitized;
  }
  return value;
}

function sanitizeInput(obj) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') return sanitizeValue(obj);

  if (Array.isArray(obj)) return obj.map(sanitizeInput);

  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[sanitizeValue(key)] = sanitizeInput(value);
    }
    return cleaned;
  }

  return obj; // numbers, booleans, etc.
}

function sanitizeMiddleware() {
  return (req, _res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeInput(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeInput(req.query);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeInput(req.params);
    }
    next();
  };
}

// ---------------------------------------------------------------------------
// API Key Validation
// ---------------------------------------------------------------------------
function validateApiKey() {
  return (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: 'API key requerida. Incluya el header X-API-Key.' });
    }

    if (!validApiKeys.has(apiKey)) {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      _recordViolation(ip);
      return res.status(403).json({ error: 'API key invalida.' });
    }

    // Attach key metadata to the request for downstream use
    req.apiKeyInfo = validApiKeys.get(apiKey);
    next();
  };
}

// Allow programmatic key management
validateApiKey.addKey = (key, meta = {}) => {
  validApiKeys.set(key, { ...meta, createdAt: new Date().toISOString() });
};

validateApiKey.removeKey = (key) => {
  validApiKeys.delete(key);
};

validateApiKey.listKeys = () => {
  return Array.from(validApiKeys.keys());
};

// ---------------------------------------------------------------------------
// CSRF Protection
// ---------------------------------------------------------------------------
const csrfTokens = new LRUMap(10000);

function generateCsrfToken() {
  const token = require('crypto').randomBytes(32).toString('hex');
  csrfTokens.set(token, Date.now());
  return token;
}

function csrfProtection() {
  return (req, res, next) => {
    // Skip for GET, HEAD, OPTIONS
    if (['GET','HEAD','OPTIONS'].includes(req.method)) {
      res.locals.csrfToken = generateCsrfToken();
      return next();
    }
    const token = req.headers['x-csrf-token'] || req.body?._csrf;
    if (!token || !csrfTokens.get(token)) {
      // In dev mode, allow requests without CSRF for API testing
      if (process.env.NODE_ENV !== 'production') return next();
      return res.status(403).json({ error: 'CSRF token invalido' });
    }
    csrfTokens.delete(token);
    next();
  };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  rateLimiter,
  rateLimiterByKey,
  bruteForceProtection,
  ipBlacklist,
  securityHeaders,
  sanitizeInput,
  sanitizeMiddleware,
  validateApiKey,
  csrfProtection,
  generateCsrfToken,
};
