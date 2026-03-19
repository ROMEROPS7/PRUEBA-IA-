// ============================================================
// AUTH TEST SUITE
// Tests for login, registration, JWT, roles, password change
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');
const crypto = require('crypto');

// --------------- Minimal bcrypt-like mock ---------------
function hashSync(password) {
  return crypto.createHash('sha256').update(password + '__salt__').digest('hex');
}
function compareSync(password, hash) {
  return hashSync(password) === hash;
}

// --------------- Minimal JWT mock ---------------
const JWT_SECRET = 'siniestros_ai_secret_test_key';

function signToken(payload, expiresInMs) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Date.now();
  const exp = now + (expiresInMs || 86400000); // default 24h
  const body = Buffer.from(JSON.stringify({ ...payload, iat: now, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Token invalido');
  const [header, body, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (signature !== expectedSig) throw new Error('Token invalido');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (payload.exp && payload.exp < Date.now()) {
    const err = new Error('Token expirado');
    err.name = 'TokenExpiredError';
    throw err;
  }
  return payload;
}

// --------------- Mock user store ---------------
let usuarios = [];

function resetData() {
  usuarios = [
    { id: 'USR-001', nombre: 'Ana Martinez', email: 'ana@siniestrosai.com', password: hashSync('admin123'), rol: 'admin', activo: 1 },
    { id: 'USR-002', nombre: 'Roberto Diaz', email: 'roberto@siniestrosai.com', password: hashSync('admin123'), rol: 'gestor', activo: 1 },
    { id: 'USR-003', nombre: 'Laura Vega', email: 'laura@siniestrosai.com', password: hashSync('admin123'), rol: 'perito', activo: 1 },
  ];
}

// --------------- Auth business logic ---------------
function login(email, password) {
  if (!email || !password) return { error: 'Email y password requeridos', status: 400 };
  const usuario = usuarios.find(u => u.email === email && u.activo === 1);
  if (!usuario) return { error: 'Credenciales incorrectas', status: 401 };
  if (!compareSync(password, usuario.password)) return { error: 'Credenciales incorrectas', status: 401 };
  const token = signToken({ id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre });
  return {
    status: 200,
    data: {
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    },
  };
}

function registro(nombre, email, password, rol) {
  if (!nombre || !email || !password) return { error: 'Nombre, email y password requeridos', status: 400 };
  if (usuarios.find(u => u.email === email)) return { error: 'El email ya esta registrado', status: 409 };
  const id = 'USR-' + crypto.randomUUID().slice(0, 8).toUpperCase();
  const hash = hashSync(password);
  const user = { id, nombre, email, password: hash, rol: rol || 'gestor', activo: 1 };
  usuarios.push(user);
  const token = signToken({ id, email, rol: user.rol, nombre });
  return { status: 201, data: { token, usuario: { id, nombre, email, rol: user.rol } } };
}

function cambiarPassword(userId, passwordActual, passwordNuevo) {
  if (!passwordActual || !passwordNuevo) return { error: 'Passwords actual y nuevo requeridos', status: 400 };
  const usuario = usuarios.find(u => u.id === userId);
  if (!usuario) return { error: 'Usuario no encontrado', status: 404 };
  if (!compareSync(passwordActual, usuario.password)) return { error: 'Password actual incorrecto', status: 401 };
  usuario.password = hashSync(passwordNuevo);
  return { status: 200, data: { mensaje: 'Password actualizado correctamente' } };
}

function checkAccess(token, requiredRoles) {
  try {
    const payload = verifyToken(token);
    if (requiredRoles && !requiredRoles.includes(payload.rol)) {
      return { error: `Acceso denegado. Se requiere rol: ${requiredRoles.join(' o ')}`, status: 403 };
    }
    return { status: 200, data: payload };
  } catch (err) {
    if (err.name === 'TokenExpiredError') return { error: 'Token expirado', status: 401 };
    return { error: 'Token invalido', status: 401 };
  }
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Login con credenciales validas',
    fn() {
      resetData();
      const result = login('ana@siniestrosai.com', 'admin123');
      assert.strictEqual(result.status, 200);
      assert.ok(result.data.token);
      assert.strictEqual(result.data.usuario.email, 'ana@siniestrosai.com');
      assert.strictEqual(result.data.usuario.rol, 'admin');
      assert.ok(!result.data.usuario.password, 'Password no debe ser devuelto');
    },
  },
  {
    name: 'Login con password incorrecto',
    fn() {
      resetData();
      const result = login('ana@siniestrosai.com', 'wrongpassword');
      assert.strictEqual(result.status, 401);
      assert.strictEqual(result.error, 'Credenciales incorrectas');
    },
  },
  {
    name: 'Login con email inexistente',
    fn() {
      resetData();
      const result = login('noexiste@email.com', 'admin123');
      assert.strictEqual(result.status, 401);
      assert.strictEqual(result.error, 'Credenciales incorrectas');
    },
  },
  {
    name: 'Token JWT se genera y verifica correctamente',
    fn() {
      resetData();
      const result = login('ana@siniestrosai.com', 'admin123');
      assert.strictEqual(result.status, 200);
      const token = result.data.token;

      const payload = verifyToken(token);
      assert.strictEqual(payload.email, 'ana@siniestrosai.com');
      assert.strictEqual(payload.rol, 'admin');
      assert.ok(payload.iat);
      assert.ok(payload.exp);
      assert.ok(payload.exp > payload.iat);
    },
  },
  {
    name: 'Token expirado es rechazado',
    fn() {
      resetData();
      // Create a token that expired 1 second ago
      const token = signToken({ id: 'USR-001', email: 'ana@siniestrosai.com', rol: 'admin' }, -1000);

      const result = checkAccess(token, ['admin']);
      assert.strictEqual(result.status, 401);
      assert.strictEqual(result.error, 'Token expirado');
    },
  },
  {
    name: 'Acceso basado en rol - admin puede eliminar',
    fn() {
      resetData();
      const loginResult = login('ana@siniestrosai.com', 'admin123');
      const result = checkAccess(loginResult.data.token, ['admin']);
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.rol, 'admin');
    },
  },
  {
    name: 'Acceso basado en rol - gestor NO puede eliminar',
    fn() {
      resetData();
      const loginResult = login('roberto@siniestrosai.com', 'admin123');
      const result = checkAccess(loginResult.data.token, ['admin']);
      assert.strictEqual(result.status, 403);
      assert.ok(result.error.includes('Acceso denegado'));
    },
  },
  {
    name: 'Registro con email duplicado falla',
    fn() {
      resetData();
      const result = registro('Nuevo Usuario', 'ana@siniestrosai.com', 'pass123');
      assert.strictEqual(result.status, 409);
      assert.ok(result.error.includes('ya esta registrado'));
    },
  },
  {
    name: 'Registro exitoso con email nuevo',
    fn() {
      resetData();
      const result = registro('Nuevo Usuario', 'nuevo@email.com', 'pass123');
      assert.strictEqual(result.status, 201);
      assert.ok(result.data.token);
      assert.strictEqual(result.data.usuario.email, 'nuevo@email.com');
      assert.strictEqual(result.data.usuario.rol, 'gestor'); // default role

      // Verify can login with new credentials
      const loginResult = login('nuevo@email.com', 'pass123');
      assert.strictEqual(loginResult.status, 200);
    },
  },
  {
    name: 'Cambio de password exitoso',
    fn() {
      resetData();
      const result = cambiarPassword('USR-001', 'admin123', 'newpass456');
      assert.strictEqual(result.status, 200);

      // Old password should fail now
      const loginOld = login('ana@siniestrosai.com', 'admin123');
      assert.strictEqual(loginOld.status, 401);

      // New password should work
      const loginNew = login('ana@siniestrosai.com', 'newpass456');
      assert.strictEqual(loginNew.status, 200);
    },
  },
  {
    name: 'Cambio de password con password actual incorrecto falla',
    fn() {
      resetData();
      const result = cambiarPassword('USR-001', 'wrongcurrent', 'newpass');
      assert.strictEqual(result.status, 401);
      assert.ok(result.error.includes('incorrecto'));
    },
  },
  {
    name: 'Token con firma manipulada es rechazado',
    fn() {
      resetData();
      const loginResult = login('ana@siniestrosai.com', 'admin123');
      const token = loginResult.data.token;
      // Tamper with the signature
      const tampered = token.slice(0, -5) + 'XXXXX';
      const result = checkAccess(tampered, ['admin']);
      assert.strictEqual(result.status, 401);
      assert.strictEqual(result.error, 'Token invalido');
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
