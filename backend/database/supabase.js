/**
 * Supabase Integration Module
 *
 * Provides a Supabase-backed data layer that mirrors the SQLite db.js API.
 * Runs in demo mode (simulated responses) when SUPABASE_URL / SUPABASE_KEY
 * environment variables are not set.
 */

const path = require('path');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL || null;
const SUPABASE_KEY = process.env.SUPABASE_KEY || null;

let supabase = null;
let demoMode = true;

// ---------------------------------------------------------------------------
// Table mapping  –  SQLite table name -> Supabase table name
// Column names stay the same; adjust here if Supabase uses different names.
// ---------------------------------------------------------------------------
const TABLE_MAP = {
  usuarios: 'usuarios',
  clientes: 'clientes',
  siniestros: 'siniestros',
  expedientes: 'expedientes',
  agentes: 'agentes',
  llamadas: 'llamadas',
  mensajes_whatsapp: 'mensajes_whatsapp',
  documentos: 'documentos',
};

// Column lists per table (used by migration to know what to transfer)
const TABLE_COLUMNS = {
  usuarios: ['id', 'nombre', 'email', 'password', 'rol', 'activo', 'creado_en', 'ultimo_login'],
  clientes: ['id', 'nombre', 'telefono', 'email', 'dni', 'direccion', 'poliza', 'tipo_poliza', 'fecha_alta', 'notas'],
  siniestros: [
    'id', 'expediente', 'cliente_id', 'tipo', 'descripcion', 'estado', 'urgencia',
    'score_fraude', 'direccion', 'lat', 'lng', 'zona', 'perito_id',
    'ia_confianza', 'ia_gestion', 'ia_tiempo', 'humano_tiempo',
    'valoracion', 'indemnizacion', 'fecha_creacion', 'fecha_actualizacion', 'fecha_cierre',
  ],
  expedientes: ['id', 'siniestro_id', 'tipo_evento', 'descripcion', 'usuario_id', 'datos_extra', 'fecha'],
  agentes: [
    'id', 'nombre', 'tipo', 'especialidad', 'telefono', 'email', 'zona',
    'disponible', 'valoracion', 'expedientes_total', 'tiempo_medio_dias', 'creado_en',
  ],
  llamadas: [
    'id', 'siniestro_id', 'cliente_id', 'telefono_origen', 'telefono_destino',
    'duracion_seg', 'tipo', 'transcripcion', 'resumen_ia', 'sentimiento', 'estado', 'fecha',
  ],
  mensajes_whatsapp: [
    'id', 'siniestro_id', 'cliente_id', 'telefono', 'direccion', 'contenido',
    'tipo_contenido', 'estado', 'respuesta_ia', 'fecha',
  ],
  documentos: ['id', 'siniestro_id', 'nombre', 'tipo', 'tamano', 'ruta', 'analisis_ia', 'fecha'],
};

// Migration order respects foreign-key dependencies
const MIGRATION_ORDER = [
  'usuarios',
  'clientes',
  'agentes',
  'siniestros',
  'expedientes',
  'llamadas',
  'mensajes_whatsapp',
  'documentos',
];

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

/**
 * Initialise the Supabase client. Returns the client instance or null when
 * running in demo mode (no credentials).
 */
function connect() {
  if (supabase) return supabase;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('[Supabase] No credentials found (SUPABASE_URL / SUPABASE_KEY). Running in DEMO mode.');
    demoMode = true;
    return null;
  }

  try {
    // Dynamic require so the module is optional at install time
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    demoMode = false;
    console.log('[Supabase] Connected to', SUPABASE_URL);
    return supabase;
  } catch (err) {
    console.error('[Supabase] Failed to connect:', err.message);
    demoMode = true;
    return null;
  }
}

/**
 * Returns the raw Supabase client or null in demo mode.
 */
function getClient() {
  if (!supabase) connect();
  return supabase;
}

// ---------------------------------------------------------------------------
// Demo helpers – return plausible structures that match real Supabase shapes
// ---------------------------------------------------------------------------

function _demoResult(data = [], count = null) {
  return { data, error: null, count, status: 200, statusText: 'OK (demo)' };
}

function _demoError(message) {
  return { data: null, error: { message }, count: null, status: 500, statusText: 'Error (demo)' };
}

// ---------------------------------------------------------------------------
// CRUD functions – mirror the SQLite db.js API style
// ---------------------------------------------------------------------------

/**
 * query(table, options)
 *
 * SELECT rows from a Supabase table.
 *
 * @param {string} table   – logical table name (uses TABLE_MAP)
 * @param {object} options
 * @param {string}  [options.select='*']
 * @param {object}  [options.filters={}]   – key/value equality filters
 * @param {Array}   [options.filterIn]     – [column, [values]]  for `in` filter
 * @param {string}  [options.order]        – column name to order by
 * @param {boolean} [options.ascending=true]
 * @param {number}  [options.limit]
 * @param {number}  [options.offset]
 * @param {string}  [options.search]       – { column, value } for ilike search
 * @returns {Promise<{data, error}>}
 */
async function query(table, options = {}) {
  const mapped = TABLE_MAP[table] || table;
  const {
    select = '*',
    filters = {},
    filterIn,
    order,
    ascending = true,
    limit,
    offset,
    search,
  } = options;

  if (demoMode) {
    console.log(`[Supabase-DEMO] query ${mapped}`, JSON.stringify(options));
    return _demoResult([]);
  }

  try {
    let q = supabase.from(mapped).select(select, { count: 'exact' });

    // Equality filters
    for (const [col, val] of Object.entries(filters)) {
      q = q.eq(col, val);
    }

    // IN filter
    if (filterIn && Array.isArray(filterIn) && filterIn.length === 2) {
      q = q.in(filterIn[0], filterIn[1]);
    }

    // ilike search
    if (search && search.column && search.value) {
      q = q.ilike(search.column, `%${search.value}%`);
    }

    if (order) {
      q = q.order(order, { ascending });
    }

    if (typeof limit === 'number') {
      q = q.limit(limit);
    }

    if (typeof offset === 'number') {
      q = q.range(offset, offset + (limit || 100) - 1);
    }

    const result = await q;
    return result;
  } catch (err) {
    console.error('[Supabase] query error:', err.message);
    return _demoError(err.message);
  }
}

/**
 * insert(table, rows)
 *
 * INSERT one or many rows.
 *
 * @param {string}       table
 * @param {object|Array} rows – single row object or array of row objects
 * @returns {Promise<{data, error}>}
 */
async function insert(table, rows) {
  const mapped = TABLE_MAP[table] || table;
  const payload = Array.isArray(rows) ? rows : [rows];

  if (demoMode) {
    console.log(`[Supabase-DEMO] insert ${mapped}: ${payload.length} rows`);
    return _demoResult(payload.map((r, i) => ({ ...r, _demo_id: i })));
  }

  try {
    const result = await supabase.from(mapped).insert(payload).select();
    return result;
  } catch (err) {
    console.error('[Supabase] insert error:', err.message);
    return _demoError(err.message);
  }
}

/**
 * update(table, filters, updates)
 *
 * UPDATE rows matching equality filters.
 *
 * @param {string} table
 * @param {object} filters – key/value equality conditions
 * @param {object} updates – columns to set
 * @returns {Promise<{data, error}>}
 */
async function update(table, filters, updates) {
  const mapped = TABLE_MAP[table] || table;

  if (demoMode) {
    console.log(`[Supabase-DEMO] update ${mapped}`, JSON.stringify(filters), JSON.stringify(updates));
    return _demoResult([{ ...filters, ...updates }]);
  }

  try {
    let q = supabase.from(mapped).update(updates);
    for (const [col, val] of Object.entries(filters)) {
      q = q.eq(col, val);
    }
    const result = await q.select();
    return result;
  } catch (err) {
    console.error('[Supabase] update error:', err.message);
    return _demoError(err.message);
  }
}

/**
 * del(table, filters)
 *
 * DELETE rows matching equality filters.
 *
 * @param {string} table
 * @param {object} filters – key/value equality conditions
 * @returns {Promise<{data, error}>}
 */
async function del(table, filters) {
  const mapped = TABLE_MAP[table] || table;

  if (demoMode) {
    console.log(`[Supabase-DEMO] delete ${mapped}`, JSON.stringify(filters));
    return _demoResult([]);
  }

  try {
    let q = supabase.from(mapped).delete();
    for (const [col, val] of Object.entries(filters)) {
      q = q.eq(col, val);
    }
    const result = await q.select();
    return result;
  } catch (err) {
    console.error('[Supabase] delete error:', err.message);
    return _demoError(err.message);
  }
}

// ---------------------------------------------------------------------------
// Migration – read all SQLite data and push into Supabase
// ---------------------------------------------------------------------------

/**
 * migrateFromSQLite(sqliteDb)
 *
 * Reads every row from every table in the SQLite database and upserts them
 * into the corresponding Supabase table. Designed to be called once.
 *
 * @param {object} [sqliteDb] – optional reference to the db.js module;
 *                              defaults to requiring ../database/db
 * @returns {Promise<object>} – per-table migration counts
 */
async function migrateFromSQLite(sqliteDb) {
  if (demoMode) {
    console.warn('[Supabase] Cannot migrate in demo mode. Set SUPABASE_URL and SUPABASE_KEY.');
    return { error: 'demo_mode', migrated: {} };
  }

  const db = sqliteDb || require('./db');
  const counts = {};

  for (const table of MIGRATION_ORDER) {
    const mapped = TABLE_MAP[table] || table;
    const columns = TABLE_COLUMNS[table];

    if (!columns) {
      console.warn(`[Supabase] No column definition for table "${table}", skipping.`);
      continue;
    }

    try {
      // Fetch all rows from SQLite
      const rows = await db.dbAll(`SELECT ${columns.join(', ')} FROM ${table}`);

      if (!rows || rows.length === 0) {
        counts[table] = 0;
        console.log(`[Supabase] ${table}: 0 rows (empty)`);
        continue;
      }

      // Upsert in batches of 500
      const BATCH = 500;
      let migrated = 0;
      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH);
        const { error } = await supabase
          .from(mapped)
          .upsert(batch, { onConflict: 'id', ignoreDuplicates: false });

        if (error) {
          console.error(`[Supabase] Error migrating ${table} batch ${i}:`, error.message);
        } else {
          migrated += batch.length;
        }
      }

      counts[table] = migrated;
      console.log(`[Supabase] ${table}: ${migrated}/${rows.length} rows migrated`);
    } catch (err) {
      console.error(`[Supabase] Migration error on "${table}":`, err.message);
      counts[table] = { error: err.message };
    }
  }

  return { error: null, migrated: counts };
}

// ---------------------------------------------------------------------------
// Real-time sync – push individual changes from SQLite to Supabase
// ---------------------------------------------------------------------------

// Track sync interval reference so it can be stopped
let _syncInterval = null;

/**
 * syncToSupabase(table, operation, data)
 *
 * Synchronise a single change to Supabase in real-time. Intended to be
 * called right after a local SQLite write so Supabase stays in sync.
 *
 * @param {string} table     – logical table name
 * @param {string} operation – 'insert' | 'update' | 'delete'
 * @param {object} data      – row data (must include `id` for update/delete)
 * @returns {Promise<{data, error}>}
 */
async function syncToSupabase(table, operation, data) {
  if (demoMode) {
    console.log(`[Supabase-DEMO] sync ${operation} ${table}`, data && data.id);
    return _demoResult([data]);
  }

  const mapped = TABLE_MAP[table] || table;

  try {
    switch (operation) {
      case 'insert': {
        const result = await supabase.from(mapped).upsert(data, { onConflict: 'id' }).select();
        return result;
      }
      case 'update': {
        if (!data || !data.id) {
          return _demoError('update requires data.id');
        }
        const { id, ...updates } = data;
        const result = await supabase.from(mapped).update(updates).eq('id', id).select();
        return result;
      }
      case 'delete': {
        if (!data || !data.id) {
          return _demoError('delete requires data.id');
        }
        const result = await supabase.from(mapped).delete().eq('id', data.id).select();
        return result;
      }
      default:
        return _demoError(`Unknown operation: ${operation}`);
    }
  } catch (err) {
    console.error(`[Supabase] sync error (${operation} ${table}):`, err.message);
    return _demoError(err.message);
  }
}

/**
 * startPeriodicSync(sqliteDb, intervalMs)
 *
 * Kicks off a periodic full-table sync from SQLite to Supabase.
 * Useful as a safety net alongside real-time syncToSupabase() calls.
 *
 * @param {object} [sqliteDb]    – db.js module reference
 * @param {number} [intervalMs]  – sync interval, default 5 minutes
 */
function startPeriodicSync(sqliteDb, intervalMs = 5 * 60 * 1000) {
  if (demoMode) {
    console.log('[Supabase-DEMO] Periodic sync skipped (demo mode).');
    return;
  }

  if (_syncInterval) clearInterval(_syncInterval);

  _syncInterval = setInterval(async () => {
    console.log('[Supabase] Periodic sync starting...');
    try {
      await migrateFromSQLite(sqliteDb);
      console.log('[Supabase] Periodic sync completed.');
    } catch (err) {
      console.error('[Supabase] Periodic sync failed:', err.message);
    }
  }, intervalMs);

  // Do not block process exit
  if (_syncInterval.unref) _syncInterval.unref();

  console.log(`[Supabase] Periodic sync scheduled every ${intervalMs / 1000}s`);
}

/**
 * stopPeriodicSync()
 */
function stopPeriodicSync() {
  if (_syncInterval) {
    clearInterval(_syncInterval);
    _syncInterval = null;
    console.log('[Supabase] Periodic sync stopped.');
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  connect,
  getClient,
  query,
  insert,
  update,
  delete: del,
  migrateFromSQLite,
  syncToSupabase,
  startPeriodicSync,
  stopPeriodicSync,
  TABLE_MAP,
  TABLE_COLUMNS,
  MIGRATION_ORDER,
};
