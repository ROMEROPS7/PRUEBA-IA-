/**
 * Multitenancy Middleware
 *
 * Tenant detection via subdomain, X-Tenant-ID header, or API key lookup.
 * Provides tenant isolation, CRUD operations, and validation middleware.
 */

const crypto = require('crypto');

// ---------------------------------------------------------------------------
// In-memory tenant store
// ---------------------------------------------------------------------------

const tenants = new Map();
const apiKeys = new Map(); // apiKey -> tenantId

function seedTenants() {
  const defaults = [
    {
      id: 'aseguratech',
      name: 'AseguraTech',
      plan: 'enterprise',
      active: true,
      apiKey: crypto.randomUUID(),
      createdAt: new Date('2025-01-15T10:00:00Z'),
      updatedAt: new Date('2025-01-15T10:00:00Z'),
      config: {
        maxAgents: 20,
        fraudeThreshold: 50,
        autoEscalado: true,
        timezone: 'Europe/Madrid',
        locale: 'es-ES',
      },
    },
    {
      id: 'mutualsur',
      name: 'MutualSur',
      plan: 'enterprise',
      active: true,
      apiKey: crypto.randomUUID(),
      createdAt: new Date('2025-02-10T08:30:00Z'),
      updatedAt: new Date('2025-02-10T08:30:00Z'),
      config: {
        maxAgents: 15,
        fraudeThreshold: 60,
        autoEscalado: true,
        timezone: 'America/Buenos_Aires',
        locale: 'es-AR',
      },
    },
    {
      id: 'protectoplus',
      name: 'ProtectoPlus',
      plan: 'business',
      active: true,
      apiKey: crypto.randomUUID(),
      createdAt: new Date('2025-03-05T12:00:00Z'),
      updatedAt: new Date('2025-03-05T12:00:00Z'),
      config: {
        maxAgents: 10,
        fraudeThreshold: 45,
        autoEscalado: false,
        timezone: 'Europe/Madrid',
        locale: 'es-ES',
      },
    },
    {
      id: 'segurosdelnorte',
      name: 'Seguros del Norte',
      plan: 'enterprise',
      active: true,
      apiKey: crypto.randomUUID(),
      createdAt: new Date('2025-04-20T09:00:00Z'),
      updatedAt: new Date('2025-04-20T09:00:00Z'),
      config: {
        maxAgents: 25,
        fraudeThreshold: 55,
        autoEscalado: true,
        timezone: 'America/Mexico_City',
        locale: 'es-MX',
      },
    },
    {
      id: 'ibercover',
      name: 'IberCover',
      plan: 'business',
      active: true,
      apiKey: crypto.randomUUID(),
      createdAt: new Date('2025-05-01T14:00:00Z'),
      updatedAt: new Date('2025-05-01T14:00:00Z'),
      config: {
        maxAgents: 8,
        fraudeThreshold: 50,
        autoEscalado: false,
        timezone: 'Europe/Madrid',
        locale: 'es-ES',
      },
    },
    {
      id: 'globalassist',
      name: 'GlobalAssist',
      plan: 'starter',
      active: true,
      apiKey: crypto.randomUUID(),
      createdAt: new Date('2025-06-15T11:00:00Z'),
      updatedAt: new Date('2025-06-15T11:00:00Z'),
      config: {
        maxAgents: 5,
        fraudeThreshold: 70,
        autoEscalado: false,
        timezone: 'America/Bogota',
        locale: 'es-CO',
      },
    },
  ];

  for (const t of defaults) {
    tenants.set(t.id, { ...t });
    apiKeys.set(t.apiKey, t.id);
  }
}

// Seed on module load
seedTenants();

// ---------------------------------------------------------------------------
// Tenant resolution helpers
// ---------------------------------------------------------------------------

/**
 * Extract tenant id from the request subdomain.
 * Expected format: <tenantId>.siniestrosai.com
 */
function resolveTenantFromSubdomain(req) {
  const host = req.hostname || req.headers.host || '';
  // Strip port if present
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');

  // We expect at least 3 parts: tenant.siniestrosai.com
  if (parts.length >= 3) {
    const subdomain = parts[0].toLowerCase();
    // Ignore common non-tenant subdomains
    if (!['www', 'api', 'app', 'mail', 'localhost'].includes(subdomain)) {
      return subdomain;
    }
  }
  return null;
}

/**
 * Extract tenant id from the X-Tenant-ID header.
 */
function resolveTenantFromHeader(req) {
  const header = req.headers['x-tenant-id'];
  return header ? header.trim().toLowerCase() : null;
}

/**
 * Extract tenant id by looking up the Authorization bearer token or
 * X-API-Key header in the apiKeys map.
 */
function resolveTenantFromApiKey(req) {
  let key = req.headers['x-api-key'];
  if (!key) {
    const auth = req.headers.authorization || '';
    if (auth.startsWith('Bearer ')) {
      key = auth.slice(7).trim();
    }
  }
  if (key && apiKeys.has(key)) {
    return apiKeys.get(key);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Return the full tenant configuration for the given tenantId.
 * Returns null when the tenant does not exist.
 */
function getTenantConfig(tenantId) {
  if (!tenantId) return null;
  const tenant = tenants.get(tenantId.toLowerCase());
  return tenant ? { ...tenant } : null;
}

/**
 * Create a new tenant. Returns the created tenant object.
 * Throws on duplicate id or missing required fields.
 */
function createTenant(data) {
  if (!data || !data.id || !data.name) {
    throw new Error('Tenant id and name are required');
  }

  const id = data.id.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (tenants.has(id)) {
    throw new Error(`Tenant "${id}" already exists`);
  }

  const validPlans = ['starter', 'business', 'enterprise'];
  const plan = validPlans.includes(data.plan) ? data.plan : 'starter';

  const planDefaults = {
    starter: { maxAgents: 5, fraudeThreshold: 70, autoEscalado: false },
    business: { maxAgents: 10, fraudeThreshold: 50, autoEscalado: false },
    enterprise: { maxAgents: 25, fraudeThreshold: 50, autoEscalado: true },
  };

  const newApiKey = crypto.randomUUID();
  const tenant = {
    id,
    name: data.name,
    plan,
    active: data.active !== undefined ? Boolean(data.active) : true,
    apiKey: newApiKey,
    createdAt: new Date(),
    updatedAt: new Date(),
    config: {
      ...planDefaults[plan],
      timezone: 'Europe/Madrid',
      locale: 'es-ES',
      ...(data.config || {}),
    },
  };

  tenants.set(id, tenant);
  apiKeys.set(newApiKey, id);
  return { ...tenant };
}

/**
 * Update an existing tenant. Merges provided data into the tenant object.
 * Returns the updated tenant or null if not found.
 */
function updateTenant(id, data) {
  if (!id) return null;
  const key = id.toLowerCase();
  const existing = tenants.get(key);
  if (!existing) return null;

  // Fields that can be updated
  if (data.name !== undefined) existing.name = data.name;
  if (data.plan !== undefined) {
    const validPlans = ['starter', 'business', 'enterprise'];
    if (validPlans.includes(data.plan)) existing.plan = data.plan;
  }
  if (data.active !== undefined) existing.active = Boolean(data.active);
  if (data.config && typeof data.config === 'object') {
    existing.config = { ...existing.config, ...data.config };
  }
  existing.updatedAt = new Date();

  tenants.set(key, existing);
  return { ...existing };
}

/**
 * Delete a tenant by id. Returns true if deleted, false if not found.
 */
function deleteTenant(id) {
  if (!id) return false;
  const key = id.toLowerCase();
  const existing = tenants.get(key);
  if (!existing) return false;

  // Remove the associated API key
  apiKeys.delete(existing.apiKey);
  tenants.delete(key);
  return true;
}

/**
 * Return an array of all tenants.
 */
function listTenants() {
  return Array.from(tenants.values()).map((t) => ({ ...t }));
}

// ---------------------------------------------------------------------------
// Tenant isolation helper
// ---------------------------------------------------------------------------

/**
 * Wraps a query-building function so that every call automatically adds
 * a tenant_id filter. Returns a proxy object whose methods append the
 * tenant constraint.
 *
 * Usage example:
 *   const scoped = withTenantScope('aseguratech');
 *   const rows = scoped.filter(allSiniestros); // only this tenant's data
 */
function withTenantScope(tenantId) {
  return {
    /**
     * Filter an array of records, keeping only those whose tenant_id (or
     * tenantId) field matches the given tenant.
     */
    filter(records) {
      if (!Array.isArray(records)) return [];
      return records.filter(
        (r) => r.tenant_id === tenantId || r.tenantId === tenantId
      );
    },

    /**
     * Append a WHERE clause fragment for SQL-style queries.
     * Returns an object { clause, params } to be merged into a query builder.
     */
    whereClause(existingParams = []) {
      return {
        clause: 'tenant_id = ?',
        params: [...existingParams, tenantId],
      };
    },

    /**
     * Stamp a new record with the current tenantId before insert.
     */
    stamp(record) {
      return { ...record, tenant_id: tenantId, tenantId };
    },
  };
}

// ---------------------------------------------------------------------------
// Express middleware
// ---------------------------------------------------------------------------

/**
 * Express middleware that resolves the current tenant from the request and
 * attaches it as req.tenant. Resolution order:
 *   1. Subdomain
 *   2. X-Tenant-ID header
 *   3. API key lookup (X-API-Key or Authorization: Bearer <key>)
 *
 * If no tenant can be resolved, req.tenant is set to null (the request is
 * not rejected -- use validateTenant() for that).
 */
function tenantMiddleware() {
  return (req, _res, next) => {
    let tenantId =
      resolveTenantFromSubdomain(req) ||
      resolveTenantFromHeader(req) ||
      resolveTenantFromApiKey(req);

    if (tenantId) {
      const tenant = getTenantConfig(tenantId);
      req.tenant = tenant; // may be null if id is invalid
      req.tenantId = tenant ? tenant.id : null;
      req.tenantScope = tenant ? withTenantScope(tenant.id) : null;
    } else {
      req.tenant = null;
      req.tenantId = null;
      req.tenantScope = null;
    }

    next();
  };
}

/**
 * Express middleware that ensures a valid, active tenant has been resolved.
 * Should be used after tenantMiddleware(). Returns 401 / 403 on failure.
 */
function validateTenant() {
  return (req, res, next) => {
    if (!req.tenant) {
      return res.status(401).json({
        error: 'Tenant no identificado',
        message:
          'Proporcione un subdominio valido, la cabecera X-Tenant-ID o una API key valida.',
      });
    }

    if (!req.tenant.active) {
      return res.status(403).json({
        error: 'Tenant inactivo',
        message: `El tenant "${req.tenant.name}" esta desactivado. Contacte con soporte.`,
      });
    }

    next();
  };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  tenantMiddleware,
  validateTenant,
  getTenantConfig,
  createTenant,
  updateTenant,
  deleteTenant,
  listTenants,
  withTenantScope,
  // Expose maps for testing / advanced usage
  _tenants: tenants,
  _apiKeys: apiKeys,
};
