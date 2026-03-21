/**
 * SegurCaixa Adeslas - Tenant Configuration
 *
 * Defines the complete operational configuration for SegurCaixa Adeslas:
 * products, coverages, approval rules, SLAs, automation levels,
 * IA behavior, and preferred provider networks.
 *
 * This is the single source of truth for how SiniestrosAI behaves
 * when operating under the Adeslas tenant.
 */

const { dbRun, dbAll, dbGet } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// ---------------------------------------------------------------------------
// Schema: tenant_config
// ---------------------------------------------------------------------------
async function initTenantConfigTable() {
  await dbRun(`CREATE TABLE IF NOT EXISTS tenant_config (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    clave TEXT NOT NULL,
    valor TEXT NOT NULL,
    categoria TEXT,
    actualizado_en TEXT DEFAULT (datetime('now')),
    UNIQUE(tenant_id, clave)
  )`);
  await dbRun('CREATE INDEX IF NOT EXISTS idx_tenant_config_tenant ON tenant_config(tenant_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_tenant_config_clave ON tenant_config(clave)');
}

// ---------------------------------------------------------------------------
// Adeslas Master Configuration
// ---------------------------------------------------------------------------
const ADESLAS_CONFIG = {
  tenant_id: 'segurcaixa-adeslas',
  nombre_comercial: 'SegurCaixa Adeslas',
  nombre_sistema: 'SegurCaixa Adeslas - Gestion Inteligente',
  logo_url: '/assets/adeslas-logo.png',
  colores: {
    primario: '#00529B',
    secundario: '#E30613',
    acento: '#009FE3',
    fondo: '#F5F7FA',
  },

  // -------------------------------------------------------------------------
  // PRODUCTOS  (everything except salud)
  // -------------------------------------------------------------------------
  productos: {
    auto: {
      nombre: 'Seguro de Automovil',
      coberturas: {
        terceros_basico: {
          nombre: 'Terceros Basico',
          prima_desde: 280,
          franquicia: 0,
          limite: 50000000,
        },
        terceros_ampliado: {
          nombre: 'Terceros Ampliado',
          prima_desde: 380,
          franquicia: 150,
          limite: 50000000,
          incluye: ['lunas', 'robo', 'incendio'],
        },
        todo_riesgo_franquicia: {
          nombre: 'Todo Riesgo con Franquicia',
          prima_desde: 520,
          franquicia: 300,
          limite: 50000000,
          incluye: ['lunas', 'robo', 'incendio', 'danos_propios'],
        },
        todo_riesgo: {
          nombre: 'Todo Riesgo sin Franquicia',
          prima_desde: 720,
          franquicia: 0,
          limite: 50000000,
          incluye: ['lunas', 'robo', 'incendio', 'danos_propios', 'vehiculo_sustitucion'],
        },
      },
      exclusiones: [
        'conduccion_bajo_influencia',
        'uso_profesional_sin_declarar',
        'participacion_carreras',
        'danos_intencionados',
      ],
      documentacion_requerida: [
        'parte_amistoso_o_atestado',
        'fotos_danos',
        'permiso_conducir',
        'carnet_identidad',
      ],
    },

    hogar: {
      nombre: 'Seguro de Hogar',
      coberturas: {
        basico: {
          nombre: 'Hogar Basico',
          prima_desde: 150,
          franquicia: 100,
          continente: 100000,
          contenido: 20000,
        },
        plus: {
          nombre: 'Hogar Plus',
          prima_desde: 280,
          franquicia: 50,
          continente: 200000,
          contenido: 50000,
          incluye: ['robo', 'agua', 'cristales', 'rc_familiar'],
        },
        premium: {
          nombre: 'Hogar Premium',
          prima_desde: 450,
          franquicia: 0,
          continente: 400000,
          contenido: 100000,
          incluye: ['robo', 'agua', 'cristales', 'rc_familiar', 'asistencia_hogar_24h', 'defensa_juridica'],
        },
      },
      exclusiones: [
        'desgaste_natural',
        'reformas_sin_comunicar',
        'vivienda_deshabitada_30dias',
        'actos_vandalicos_asegurado',
      ],
      documentacion_requerida: [
        'fotos_danos',
        'factura_reparacion_o_presupuesto',
        'denuncia_policial_si_robo',
      ],
    },

    decesos: {
      nombre: 'Seguro de Decesos',
      coberturas: {
        esencial: {
          nombre: 'Decesos Esencial',
          prima_desde: 40,
          capital: 4000,
        },
        completo: {
          nombre: 'Decesos Completo',
          prima_desde: 65,
          capital: 6000,
          incluye: ['repatriacion', 'tramites_herencia', 'asistencia_psicologica'],
        },
        premium: {
          nombre: 'Decesos Premium',
          prima_desde: 95,
          capital: 10000,
          incluye: ['repatriacion', 'tramites_herencia', 'asistencia_psicologica', 'capital_adicional', 'servicio_internacional'],
        },
      },
    },

    vida: {
      nombre: 'Seguro de Vida',
      coberturas: {
        fallecimiento: {
          nombre: 'Vida Fallecimiento',
          prima_desde: 80,
          capital_desde: 50000,
        },
        vida_completo: {
          nombre: 'Vida Completo',
          prima_desde: 150,
          capital_desde: 100000,
          incluye: ['invalidez_permanente', 'invalidez_absoluta', 'gran_invalidez'],
        },
      },
    },

    accidentes: {
      nombre: 'Seguro de Accidentes',
      coberturas: {
        basico: {
          nombre: 'Accidentes Basico',
          prima_desde: 60,
          capital_fallecimiento: 30000,
          capital_invalidez: 30000,
        },
        plus: {
          nombre: 'Accidentes Plus',
          prima_desde: 120,
          capital_fallecimiento: 60000,
          capital_invalidez: 60000,
          incluye: ['gastos_medicos', 'hospitalizacion_diaria'],
        },
      },
    },

    comercio: {
      nombre: 'Seguro de Comercio/PYME',
      coberturas: {
        basico: {
          nombre: 'Comercio Basico',
          prima_desde: 350,
          continente: 150000,
          contenido: 30000,
          rc: 300000,
        },
        integral: {
          nombre: 'Comercio Integral',
          prima_desde: 650,
          continente: 300000,
          contenido: 80000,
          rc: 600000,
          incluye: ['robo', 'rotura_cristales', 'averia_maquinaria', 'perdida_beneficios'],
        },
      },
    },

    comunidades: {
      nombre: 'Seguro de Comunidades',
      coberturas: {
        basico: {
          nombre: 'Comunidades Basico',
          prima_desde: 800,
          rc: 600000,
        },
        completo: {
          nombre: 'Comunidades Completo',
          prima_desde: 1500,
          rc: 1500000,
          incluye: ['danos_agua', 'incendio', 'responsabilidad_civil_inmueble', 'defensa_juridica'],
        },
      },
    },

    rc: {
      nombre: 'Responsabilidad Civil',
      coberturas: {
        profesional: {
          nombre: 'RC Profesional',
          prima_desde: 200,
          limite: 300000,
        },
        general: {
          nombre: 'RC General',
          prima_desde: 350,
          limite: 600000,
        },
      },
    },
  },

  // -------------------------------------------------------------------------
  // REGLAS DE APROBACION  (the most critical table for automation)
  // -------------------------------------------------------------------------
  aprobaciones: {
    auto_aprobar_hasta: 500,         // IA aprueba sola
    gestor_aprueba_hasta: 3000,      // 500-3000  -> gestor
    supervisor_aprueba_hasta: 10000, // 3000-10000 -> supervisor
    director_aprueba_hasta: 50000,   // 10000-50000 -> director
    comite_aprueba_desde: 50000,     // +50000 -> comite
  },

  // -------------------------------------------------------------------------
  // PLAZOS / SLA internos
  // -------------------------------------------------------------------------
  plazos: {
    acuse_recibo_horas: 2,
    primera_respuesta_horas: 24,
    asignacion_perito_auto_horas: 4,
    asignacion_perito_hogar_horas: 8,
    informe_perito_dias: 5,
    oferta_indemnizacion_dias: 15,
    pago_tras_acuerdo_dias: 5,
    resolucion_maxima_dias: 30,
  },

  // -------------------------------------------------------------------------
  // AUTOMATIZACION  - what the IA does alone vs what needs a human
  // -------------------------------------------------------------------------
  automatizacion: {
    apertura_siniestro: 'automatico',
    verificacion_cobertura: 'automatico',
    asignacion_perito: 'automatico',
    solicitud_documentacion: 'automatico',
    seguimiento_cliente: 'automatico',
    deteccion_fraude: 'automatico',
    valoracion_danos_menores: 'automatico',     // < 500 EUR
    valoracion_danos_mayores: 'supervision',     // > 500 EUR
    aprobacion_pago: 'segun_importe',
    cierre_expediente: 'supervision',
    reclamacion_cliente: 'humano',
    demanda_judicial: 'humano',
  },

  // -------------------------------------------------------------------------
  // IA CONFIG
  // -------------------------------------------------------------------------
  ia: {
    nombre_agente: 'Asistente Adeslas',
    tono: 'profesional_cercano',
    idiomas: ['es', 'ca', 'en'],
    horario_llamadas: { inicio: '09:00', fin: '21:00' },
    max_intentos_contacto: 3,
    intervalo_reintento_horas: 4,
    escalado_automatico_tras_dias: 3,
    fraude_umbral_bloqueo: 65,
    fraude_umbral_revision: 40,
  },

  // -------------------------------------------------------------------------
  // PROVEEDORES PREFERENTES
  // -------------------------------------------------------------------------
  proveedores_preferentes: {
    talleres: ['Talleres Adeslas Madrid', 'Red Cesvimap', 'Talleres Concertados Adeslas'],
    peritos: ['Red Pericial Adeslas', 'Cunningham Lindsey', 'Sedgwick'],
    gruas: ['Europ Assistance', 'RACE', 'ADA Asistencia'],
    fontaneros: ['Reparalia', 'HomeServe'],
    cerrajeros: ['Reparalia', 'HomeServe'],
    cristaleros: ['Carglass', 'Glassdrive'],
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the full configuration object for a tenant.
 * Defaults to Adeslas if no tenantId is given.
 */
async function getConfig(tenantId) {
  tenantId = tenantId || 'segurcaixa-adeslas';
  // Try loading an override from the DB first
  const dbConfig = await cargarConfigDeDB(tenantId);
  if (dbConfig && Object.keys(dbConfig).length > 0) {
    // Merge: DB overrides win, but fallback to hardcoded for missing keys
    return { ...ADESLAS_CONFIG, ...dbConfig, tenant_id: tenantId };
  }
  return { ...ADESLAS_CONFIG };
}

/**
 * Returns products and their coverages for a tenant.
 */
async function getProductos(tenantId) {
  const cfg = await getConfig(tenantId);
  return cfg.productos;
}

/**
 * Returns who must approve a given amount.
 */
function getReglaAprobacion(importe) {
  const reglas = ADESLAS_CONFIG.aprobaciones;
  if (importe <= reglas.auto_aprobar_hasta) {
    return { nivel: 'ia', descripcion: 'Aprobacion automatica por IA', importe, limite: reglas.auto_aprobar_hasta };
  }
  if (importe <= reglas.gestor_aprueba_hasta) {
    return { nivel: 'gestor', descripcion: 'Requiere aprobacion de gestor', importe, limite: reglas.gestor_aprueba_hasta };
  }
  if (importe <= reglas.supervisor_aprueba_hasta) {
    return { nivel: 'supervisor', descripcion: 'Requiere aprobacion de supervisor', importe, limite: reglas.supervisor_aprueba_hasta };
  }
  if (importe <= reglas.director_aprueba_hasta) {
    return { nivel: 'director', descripcion: 'Requiere aprobacion de director', importe, limite: reglas.director_aprueba_hasta };
  }
  return { nivel: 'comite', descripcion: 'Requiere aprobacion del comite de direccion', importe, limite: null };
}

/**
 * Returns SLA deadlines.
 */
async function getPlazos(tenantId) {
  const cfg = await getConfig(tenantId);
  return cfg.plazos;
}

/**
 * Returns the full automation map.
 */
async function getAutomatizacion(tenantId) {
  const cfg = await getConfig(tenantId);
  return cfg.automatizacion;
}

/**
 * Returns the automation level for a specific action.
 * @returns {'automatico'|'supervision'|'humano'|'segun_importe'|null}
 */
function getNivelAutomatizacion(accion) {
  return ADESLAS_CONFIG.automatizacion[accion] || null;
}

/**
 * Updates a single config value (persists to SQLite).
 */
async function actualizarConfig(tenantId, clave, valor, categoria) {
  tenantId = tenantId || 'segurcaixa-adeslas';
  const valorStr = typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
  const existing = await dbGet(
    'SELECT id FROM tenant_config WHERE tenant_id = ? AND clave = ?',
    [tenantId, clave]
  );
  if (existing) {
    await dbRun(
      `UPDATE tenant_config SET valor = ?, categoria = ?, actualizado_en = datetime('now') WHERE tenant_id = ? AND clave = ?`,
      [valorStr, categoria || null, tenantId, clave]
    );
    return { actualizado: true, clave, tenant_id: tenantId };
  }
  const id = uuidv4();
  await dbRun(
    'INSERT INTO tenant_config (id, tenant_id, clave, valor, categoria) VALUES (?, ?, ?, ?, ?)',
    [id, tenantId, clave, valorStr, categoria || null]
  );
  return { creado: true, id, clave, tenant_id: tenantId };
}

/**
 * Returns preferred providers by type (talleres, peritos, gruas, ...).
 */
function getProveedoresPreferentes(tipo) {
  const proveedores = ADESLAS_CONFIG.proveedores_preferentes;
  if (tipo) {
    return proveedores[tipo] || [];
  }
  return proveedores;
}

/**
 * Saves the entire hardcoded config to SQLite so it can be overridden later.
 * Idempotent: skips keys that already exist.
 */
async function guardarConfigEnDB(tenantId) {
  tenantId = tenantId || 'segurcaixa-adeslas';
  await initTenantConfigTable();

  const flatEntries = _flattenConfig(ADESLAS_CONFIG);
  let inserted = 0;
  let skipped = 0;

  for (const { clave, valor, categoria } of flatEntries) {
    const existing = await dbGet(
      'SELECT id FROM tenant_config WHERE tenant_id = ? AND clave = ?',
      [tenantId, clave]
    );
    if (existing) {
      skipped++;
      continue;
    }
    const id = uuidv4();
    const valorStr = typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
    await dbRun(
      'INSERT INTO tenant_config (id, tenant_id, clave, valor, categoria) VALUES (?, ?, ?, ?, ?)',
      [id, tenantId, clave, valorStr, categoria]
    );
    inserted++;
  }

  console.log(`[Adeslas] Config guardada en DB: ${inserted} nuevas, ${skipped} ya existian`);
  return { inserted, skipped, total: inserted + skipped };
}

/**
 * Loads config overrides from SQLite.  Returns a plain object whose keys
 * are the dot-separated config paths and values are parsed JSON where possible.
 * Falls back to the hardcoded ADESLAS_CONFIG for anything not in DB.
 */
async function cargarConfigDeDB(tenantId) {
  tenantId = tenantId || 'segurcaixa-adeslas';
  try {
    const rows = await dbAll(
      'SELECT clave, valor, categoria FROM tenant_config WHERE tenant_id = ?',
      [tenantId]
    );
    if (!rows || rows.length === 0) return {};

    const result = {};
    for (const row of rows) {
      let parsed;
      try {
        parsed = JSON.parse(row.valor);
      } catch {
        parsed = row.valor;
      }
      _setNested(result, row.clave, parsed);
    }
    return result;
  } catch (err) {
    // Table might not exist yet on very first load
    console.warn('[Adeslas] No se pudo cargar config de DB, usando hardcoded:', err.message);
    return {};
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Flattens a nested object into an array of { clave, valor, categoria } entries
 * using dot notation for keys.
 */
function _flattenConfig(obj, prefix, categoria) {
  const entries = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    // Determine category from top-level key
    const cat = categoria || key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      entries.push(..._flattenConfig(value, fullKey, cat));
    } else {
      entries.push({ clave: fullKey, valor: value, categoria: cat });
    }
  }
  return entries;
}

/**
 * Sets a nested value on an object using a dot-separated key path.
 */
function _setNested(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

// ---------------------------------------------------------------------------
// Auto-initialise: save Adeslas config to DB on first require (idempotent)
// ---------------------------------------------------------------------------
let _initPromise = null;

function ensureInitialised() {
  if (!_initPromise) {
    _initPromise = (async () => {
      try {
        await initTenantConfigTable();
        await guardarConfigEnDB('segurcaixa-adeslas');
        console.log('[Adeslas] Tenant inicializado correctamente');
      } catch (err) {
        console.error('[Adeslas] Error inicializando tenant:', err.message);
        _initPromise = null; // allow retry
      }
    })();
  }
  return _initPromise;
}

// Kick off on load (non-blocking)
ensureInitialised();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  ADESLAS_CONFIG,
  initTenantConfigTable,
  getConfig,
  getProductos,
  getReglaAprobacion,
  getPlazos,
  getAutomatizacion,
  getNivelAutomatizacion,
  actualizarConfig,
  getProveedoresPreferentes,
  guardarConfigEnDB,
  cargarConfigDeDB,
  ensureInitialised,
};
