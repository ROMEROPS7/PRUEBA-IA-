/**
 * Granular Permissions Service
 *
 * Role-based access control with per-user custom overrides.
 * All checks run against in-memory Maps for maximum performance.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODULES = [
  'siniestros',
  'clientes',
  'expedientes',
  'agentes',
  'metricas',
  'fraude',
  'reportes',
  'configuracion',
  'admin',
  'facturacion',
];

const ACTIONS = ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'];

// ---------------------------------------------------------------------------
// Role definitions
// ---------------------------------------------------------------------------

/**
 * Build a permission set where every module gets every action.
 */
function allPermissions() {
  const perms = {};
  for (const mod of MODULES) {
    perms[mod] = [...ACTIONS];
  }
  return perms;
}

/**
 * Build a permission set with specific modules/actions.
 * @param {Object} map  { moduleName: [actions] | 'all' }
 */
function buildPerms(map) {
  const perms = {};
  for (const mod of MODULES) {
    if (map[mod] === 'all') {
      perms[mod] = [...ACTIONS];
    } else if (Array.isArray(map[mod])) {
      perms[mod] = [...map[mod]];
    } else {
      perms[mod] = [];
    }
  }
  return perms;
}

const ROLE_PERMISSIONS = {
  superadmin: allPermissions(),

  admin: (() => {
    const perms = allPermissions();
    perms.admin = []; // no access to admin module
    return perms;
  })(),

  gestor: buildPerms({
    siniestros: 'all',
    clientes: ['ver', 'crear', 'editar'],
    expedientes: 'all',
    metricas: ['ver'],
    reportes: ['ver', 'crear'],
  }),

  perito: buildPerms({
    siniestros: ['ver', 'editar'],
    expedientes: ['ver', 'crear'],
    clientes: ['ver'],
  }),

  cliente: buildPerms({
    siniestros: ['ver'],
    expedientes: ['ver'],
  }),
};

// ---------------------------------------------------------------------------
// In-memory stores
// ---------------------------------------------------------------------------

/**
 * userId -> { role: string, tenantId?: string }
 */
const users = new Map();

/**
 * Custom overrides: `${userId}::${module}::${action}` -> boolean
 */
const customOverrides = new Map();

/**
 * Access-denied log entries (kept in memory, last 1000).
 */
const accessDeniedLog = [];
const MAX_LOG_ENTRIES = 1000;

// Seed some demo users
users.set('usr_superadmin_1', { role: 'superadmin', tenantId: 'aseguratech' });
users.set('usr_admin_1', { role: 'admin', tenantId: 'aseguratech' });
users.set('usr_gestor_1', { role: 'gestor', tenantId: 'aseguratech' });
users.set('usr_gestor_2', { role: 'gestor', tenantId: 'mutualsur' });
users.set('usr_perito_1', { role: 'perito', tenantId: 'aseguratech' });
users.set('usr_perito_2', { role: 'perito', tenantId: 'protectoplus' });
users.set('usr_cliente_1', { role: 'cliente', tenantId: 'aseguratech' });
users.set('usr_cliente_2', { role: 'cliente', tenantId: 'mutualsur' });

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Return the default permissions object for a given role name.
 * Returns an empty permissions map for unknown roles.
 */
function getRolePermissions(role) {
  if (ROLE_PERMISSIONS[role]) {
    // Deep-copy so callers cannot mutate the canonical definitions
    const copy = {};
    for (const mod of MODULES) {
      copy[mod] = [...(ROLE_PERMISSIONS[role][mod] || [])];
    }
    return copy;
  }
  return buildPerms({});
}

/**
 * Check whether a user has permission to perform `action` on `module`.
 *
 * Resolution order:
 *   1. If a custom override exists for (userId, module, action) -> use it.
 *   2. Otherwise fall back to the user's role defaults.
 *
 * For the "cliente" role, siniestros and expedientes are implicitly
 * scoped to "own" records; the caller must enforce ownership separately.
 *
 * @returns {boolean}
 */
function hasPermission(userId, module, action) {
  if (!userId || !module || !action) return false;

  // Validate module & action
  if (!MODULES.includes(module) || !ACTIONS.includes(action)) return false;

  // Check custom override first
  const overrideKey = `${userId}::${module}::${action}`;
  if (customOverrides.has(overrideKey)) {
    return customOverrides.get(overrideKey);
  }

  // Fall back to role
  const user = users.get(userId);
  if (!user) return false;

  const rolePerms = ROLE_PERMISSIONS[user.role];
  if (!rolePerms) return false;

  const moduleActions = rolePerms[module];
  if (!moduleActions) return false;

  return moduleActions.includes(action);
}

/**
 * Set (or remove) a custom permission override for a specific user.
 *
 * @param {string}  userId
 * @param {string}  module
 * @param {string}  action
 * @param {boolean|null} allowed  - true/false to override, null to remove override
 */
function setCustomPermission(userId, module, action, allowed) {
  if (!userId || !module || !action) {
    throw new Error('userId, module and action are required');
  }
  if (!MODULES.includes(module)) {
    throw new Error(`Invalid module: ${module}`);
  }
  if (!ACTIONS.includes(action)) {
    throw new Error(`Invalid action: ${action}`);
  }

  const key = `${userId}::${module}::${action}`;

  if (allowed === null || allowed === undefined) {
    customOverrides.delete(key);
  } else {
    customOverrides.set(key, Boolean(allowed));
  }

  return { userId, module, action, allowed: allowed === null ? 'role_default' : Boolean(allowed) };
}

/**
 * Return the full permission matrix for a user, merging role defaults
 * with any custom overrides.
 *
 * @returns {Object} { role, permissions: { module: { action: boolean } } }
 */
function getPermissions(userId) {
  const user = users.get(userId);
  if (!user) {
    return { role: null, permissions: {} };
  }

  const rolePerms = getRolePermissions(user.role);
  const permissions = {};

  for (const mod of MODULES) {
    permissions[mod] = {};
    for (const act of ACTIONS) {
      const overrideKey = `${userId}::${mod}::${act}`;
      if (customOverrides.has(overrideKey)) {
        permissions[mod][act] = customOverrides.get(overrideKey);
      } else {
        permissions[mod][act] = (rolePerms[mod] || []).includes(act);
      }
    }
  }

  return { role: user.role, tenantId: user.tenantId, permissions };
}

/**
 * Log a denied access attempt.
 */
function logAccessDenied(userId, module, action, ip) {
  const entry = {
    timestamp: new Date().toISOString(),
    userId: userId || 'anonymous',
    module,
    action,
    ip: ip || 'unknown',
  };

  accessDeniedLog.push(entry);

  // Keep bounded
  if (accessDeniedLog.length > MAX_LOG_ENTRIES) {
    accessDeniedLog.splice(0, accessDeniedLog.length - MAX_LOG_ENTRIES);
  }

  // Also emit to stderr for operational monitoring
  console.warn(
    `[ACCESS DENIED] user=${entry.userId} module=${module} action=${action} ip=${entry.ip}`
  );

  return entry;
}

/**
 * Express middleware factory.
 *
 * Returns a middleware that checks whether the authenticated user
 * (req.user.id) has the requested permission. Responds with 403 if not.
 *
 * @param {string} module
 * @param {string} action
 */
function checkPermission(module, action) {
  return (req, res, next) => {
    const userId = req.user && (req.user.id || req.user.userId);

    if (!userId) {
      logAccessDenied('anonymous', module, action, req.ip);
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debe iniciar sesion para acceder a este recurso.',
      });
    }

    if (!hasPermission(userId, module, action)) {
      logAccessDenied(userId, module, action, req.ip);
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `No tiene permiso para "${action}" en el modulo "${module}".`,
        module,
        action,
      });
    }

    next();
  };
}

// ---------------------------------------------------------------------------
// User management helpers (needed for permission checks to work)
// ---------------------------------------------------------------------------

/**
 * Register or update a user's role mapping.
 */
function setUserRole(userId, role, tenantId) {
  if (!userId || !role) throw new Error('userId and role are required');
  if (!ROLE_PERMISSIONS[role]) throw new Error(`Unknown role: ${role}`);
  users.set(userId, { role, tenantId: tenantId || null });
  return { userId, role, tenantId };
}

/**
 * Get a user's role info.
 */
function getUserRole(userId) {
  return users.get(userId) || null;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  // Constants
  MODULES,
  ACTIONS,

  // Core permission functions
  hasPermission,
  setCustomPermission,
  getPermissions,
  getRolePermissions,
  checkPermission,
  logAccessDenied,

  // User helpers
  setUserRole,
  getUserRole,

  // Internals for testing
  _users: users,
  _customOverrides: customOverrides,
  _accessDeniedLog: accessDeniedLog,
};
