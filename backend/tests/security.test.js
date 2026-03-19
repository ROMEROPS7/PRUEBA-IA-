// ============================================================
// SECURITY TEST SUITE
// Tests for security middleware: rateLimiter, sanitizeInput,
// bruteForceProtection, securityHeaders, validateToken, CORS
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');

// --------------- Mock security middleware ---------------
const rateLimitStore = {};
const bruteForceStore = {};

function resetData() {
  Object.keys(rateLimitStore).forEach(k => delete rateLimitStore[k]);
  Object.keys(bruteForceStore).forEach(k => delete bruteForceStore[k]);
}

function rateLimiter(ip, { maxRequests = 100, windowMs = 60000 } = {}) {
  const now = Date.now();
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = { count: 1, windowStart: now };
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }
  const entry = rateLimitStore[ip];
  if (now - entry.windowStart > windowMs) {
    entry.count = 1;
    entry.windowStart = now;
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }
  entry.count++;
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.windowStart + windowMs, retryAfter: Math.ceil((entry.windowStart + windowMs - now) / 1000) };
  }
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.windowStart + windowMs };
}

function sanitizeInput(input) {
  if (input === null || input === undefined) return '';
  if (typeof input === 'number') return input;
  if (typeof input === 'boolean') return input;
  if (typeof input !== 'string') return String(input);

  let sanitized = input;
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove event handlers
  sanitized = sanitized.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
  // Escape HTML entities
  sanitized = sanitized.replace(/&/g, '&amp;');
  sanitized = sanitized.replace(/</g, '&lt;');
  sanitized = sanitized.replace(/>/g, '&gt;');
  sanitized = sanitized.replace(/"/g, '&quot;');
  // Remove SQL injection patterns
  sanitized = sanitized.replace(/(['";])\s*(OR|AND|DROP|DELETE|INSERT|UPDATE|SELECT)\s/gi, '$1 ');
  return sanitized;
}

function bruteForceProtection(identifier, { maxAttempts = 5, lockoutMs = 900000 } = {}) {
  const now = Date.now();
  if (!bruteForceStore[identifier]) {
    bruteForceStore[identifier] = { attempts: 1, firstAttempt: now, lockedUntil: null };
    return { locked: false, attempts: 1, remaining: maxAttempts - 1 };
  }
  const entry = bruteForceStore[identifier];
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { locked: true, attempts: entry.attempts, unlockAt: entry.lockedUntil, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  if (entry.lockedUntil && now >= entry.lockedUntil) {
    entry.attempts = 1;
    entry.lockedUntil = null;
    entry.firstAttempt = now;
    return { locked: false, attempts: 1, remaining: maxAttempts - 1 };
  }
  entry.attempts++;
  if (entry.attempts >= maxAttempts) {
    entry.lockedUntil = now + lockoutMs;
    return { locked: true, attempts: entry.attempts, unlockAt: entry.lockedUntil, retryAfter: Math.ceil(lockoutMs / 1000) };
  }
  return { locked: false, attempts: entry.attempts, remaining: maxAttempts - entry.attempts };
}

function resetBruteForce(identifier) {
  if (bruteForceStore[identifier]) {
    delete bruteForceStore[identifier];
    return { reset: true };
  }
  return { reset: false };
}

function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

function validateToken(token) {
  if (!token) return { valid: false, error: 'Token requerido' };
  if (typeof token !== 'string') return { valid: false, error: 'Token debe ser string' };
  if (token.length < 20) return { valid: false, error: 'Token demasiado corto' };
  // Mock: tokens starting with 'valid_' are valid
  if (token.startsWith('valid_')) return { valid: true, user: { id: 'USR-001', role: 'admin' } };
  if (token.startsWith('expired_')) return { valid: false, error: 'Token expirado' };
  return { valid: false, error: 'Token invalido' };
}

function validateCORS(origin, allowedOrigins) {
  if (!origin) return { allowed: false, error: 'Origin requerido' };
  if (!allowedOrigins || !Array.isArray(allowedOrigins)) return { allowed: false, error: 'allowedOrigins invalido' };
  const allowed = allowedOrigins.includes(origin) || allowedOrigins.includes('*');
  return { allowed, origin };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Rate limiter permite peticiones dentro del limite',
    fn() {
      resetData();
      const result = rateLimiter('192.168.1.1', { maxRequests: 5 });
      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.remaining, 4);
    },
  },
  {
    name: 'Rate limiter bloquea al exceder limite',
    fn() {
      resetData();
      for (let i = 0; i < 5; i++) {
        rateLimiter('192.168.1.2', { maxRequests: 5 });
      }
      const result = rateLimiter('192.168.1.2', { maxRequests: 5 });
      assert.strictEqual(result.allowed, false);
      assert.strictEqual(result.remaining, 0);
      assert.ok(result.retryAfter > 0);
    },
  },
  {
    name: 'Rate limiter es independiente por IP',
    fn() {
      resetData();
      for (let i = 0; i < 5; i++) {
        rateLimiter('10.0.0.1', { maxRequests: 5 });
      }
      const blocked = rateLimiter('10.0.0.1', { maxRequests: 5 });
      const allowed = rateLimiter('10.0.0.2', { maxRequests: 5 });
      assert.strictEqual(blocked.allowed, false);
      assert.strictEqual(allowed.allowed, true);
    },
  },
  {
    name: 'Sanitize input elimina script tags',
    fn() {
      const result = sanitizeInput('Hola <script>alert("xss")</script> mundo');
      assert.ok(!result.includes('<script>'));
      assert.ok(!result.includes('alert'));
    },
  },
  {
    name: 'Sanitize input escapa caracteres HTML',
    fn() {
      const result = sanitizeInput('<div class="test">texto</div>');
      assert.ok(!result.includes('<div'));
      assert.ok(result.includes('&lt;'));
      assert.ok(result.includes('&gt;'));
    },
  },
  {
    name: 'Sanitize input maneja null y undefined',
    fn() {
      assert.strictEqual(sanitizeInput(null), '');
      assert.strictEqual(sanitizeInput(undefined), '');
    },
  },
  {
    name: 'Sanitize input preserva numeros y booleanos',
    fn() {
      assert.strictEqual(sanitizeInput(42), 42);
      assert.strictEqual(sanitizeInput(true), true);
    },
  },
  {
    name: 'Sanitize input elimina event handlers',
    fn() {
      const result = sanitizeInput('texto onclick="doSomething()" texto');
      assert.ok(!result.includes('onclick'));
      assert.ok(!result.includes('doSomething'));
    },
  },
  {
    name: 'Brute force protection permite intentos iniciales',
    fn() {
      resetData();
      const result = bruteForceProtection('user@test.com', { maxAttempts: 3 });
      assert.strictEqual(result.locked, false);
      assert.strictEqual(result.attempts, 1);
      assert.strictEqual(result.remaining, 2);
    },
  },
  {
    name: 'Brute force bloquea tras maxAttempts',
    fn() {
      resetData();
      for (let i = 0; i < 4; i++) {
        bruteForceProtection('hacker@test.com', { maxAttempts: 5 });
      }
      const result = bruteForceProtection('hacker@test.com', { maxAttempts: 5 });
      assert.strictEqual(result.locked, true);
      assert.ok(result.retryAfter > 0);
    },
  },
  {
    name: 'Brute force reset libera bloqueo',
    fn() {
      resetData();
      for (let i = 0; i < 5; i++) {
        bruteForceProtection('locked@test.com', { maxAttempts: 5 });
      }
      const locked = bruteForceProtection('locked@test.com', { maxAttempts: 5 });
      assert.strictEqual(locked.locked, true);
      resetBruteForce('locked@test.com');
      const unlocked = bruteForceProtection('locked@test.com', { maxAttempts: 5 });
      assert.strictEqual(unlocked.locked, false);
    },
  },
  {
    name: 'Security headers contienen todos los headers requeridos',
    fn() {
      const headers = getSecurityHeaders();
      assert.strictEqual(headers['X-Content-Type-Options'], 'nosniff');
      assert.strictEqual(headers['X-Frame-Options'], 'DENY');
      assert.ok(headers['Strict-Transport-Security'].includes('max-age'));
      assert.ok(headers['Content-Security-Policy']);
      assert.ok(headers['Referrer-Policy']);
      assert.ok(headers['Permissions-Policy']);
    },
  },
  {
    name: 'Validar token valido',
    fn() {
      const result = validateToken('valid_abc123xyz789012345');
      assert.strictEqual(result.valid, true);
      assert.ok(result.user);
    },
  },
  {
    name: 'Validar token expirado',
    fn() {
      const result = validateToken('expired_token_12345678901');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('expirado'));
    },
  },
  {
    name: 'Validar token vacio falla',
    fn() {
      const result = validateToken('');
      assert.strictEqual(result.valid, false);
    },
  },
  {
    name: 'Validar token corto falla',
    fn() {
      const result = validateToken('short');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('corto'));
    },
  },
  {
    name: 'CORS permite origin valido',
    fn() {
      const result = validateCORS('https://app.example.com', ['https://app.example.com', 'https://admin.example.com']);
      assert.strictEqual(result.allowed, true);
    },
  },
  {
    name: 'CORS bloquea origin no permitido',
    fn() {
      const result = validateCORS('https://evil.com', ['https://app.example.com']);
      assert.strictEqual(result.allowed, false);
    },
  },
  {
    name: 'CORS permite wildcard',
    fn() {
      const result = validateCORS('https://anything.com', ['*']);
      assert.strictEqual(result.allowed, true);
    },
  },
  {
    name: 'CORS sin origin falla',
    fn() {
      const result = validateCORS(null, ['https://app.example.com']);
      assert.strictEqual(result.allowed, false);
    },
  },
];

async function runTests() {
  const results = { passed: 0, failed: 0, errors: [] };
  for (const test of tests) {
    const start = Date.now();
    try {
      await test.fn();
      const elapsed = Date.now() - start;
      results.passed++;
      console.log(`  \x1b[32m✓\x1b[0m ${test.name} \x1b[90m(${elapsed}ms)\x1b[0m`);
    } catch (err) {
      const elapsed = Date.now() - start;
      results.failed++;
      results.errors.push({ name: test.name, error: err.message });
      console.log(`  \x1b[31m✗\x1b[0m ${test.name} \x1b[90m(${elapsed}ms)\x1b[0m`);
      console.log(`    \x1b[31m${err.message}\x1b[0m`);
    }
  }
  return results;
}

module.exports = { runTests, tests };
