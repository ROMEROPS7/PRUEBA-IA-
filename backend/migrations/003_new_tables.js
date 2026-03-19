module.exports = {
  version: 3,
  name: 'persistence_tables',
  async up(dbRun) {
    await dbRun(`CREATE TABLE IF NOT EXISTS alertas_vigilante (id TEXT PRIMARY KEY, siniestro_id TEXT, expediente TEXT, cliente TEXT, tipo_alerta TEXT NOT NULL, severidad TEXT DEFAULT 'media', descripcion TEXT, accion_tomada TEXT, resultado TEXT, resuelta INTEGER DEFAULT 0, fecha_deteccion TEXT DEFAULT (datetime('now')), fecha_resolucion TEXT)`);
    await dbRun(`CREATE TABLE IF NOT EXISTS tenants (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, plan TEXT DEFAULT 'starter', activo INTEGER DEFAULT 1, config TEXT, api_key TEXT UNIQUE, creado_en TEXT DEFAULT (datetime('now')))`);
    await dbRun(`CREATE TABLE IF NOT EXISTS audit_blockchain (id TEXT PRIMARY KEY, indice INTEGER NOT NULL, timestamp TEXT NOT NULL, tipo TEXT NOT NULL, datos TEXT NOT NULL, usuario_id TEXT, expediente_id TEXT, hash_anterior TEXT, hash TEXT NOT NULL, nonce INTEGER DEFAULT 0)`);
    await dbRun(`CREATE TABLE IF NOT EXISTS reglas_negocio (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, descripcion TEXT, condiciones TEXT NOT NULL, acciones TEXT NOT NULL, prioridad INTEGER DEFAULT 5, activo INTEGER DEFAULT 1, trigger_count INTEGER DEFAULT 0, creado_en TEXT DEFAULT (datetime('now')))`);
    await dbRun(`CREATE TABLE IF NOT EXISTS plantillas (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, tipo TEXT NOT NULL, canal TEXT NOT NULL, asunto TEXT, cuerpo TEXT NOT NULL, variables TEXT, activo INTEGER DEFAULT 1, creado_en TEXT DEFAULT (datetime('now')))`);
    await dbRun(`CREATE TABLE IF NOT EXISTS sla_definiciones (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, tipo_siniestro TEXT, urgencia_min INTEGER, tiempo_maximo_horas INTEGER NOT NULL, escalado_a TEXT, activo INTEGER DEFAULT 1, creado_en TEXT DEFAULT (datetime('now')))`);
    await dbRun(`CREATE TABLE IF NOT EXISTS permisos_usuario (id TEXT PRIMARY KEY, usuario_id TEXT NOT NULL, modulo TEXT NOT NULL, accion TEXT NOT NULL, permitido INTEGER DEFAULT 1, UNIQUE(usuario_id, modulo, accion))`);
    await dbRun(`CREATE TABLE IF NOT EXISTS webhooks_registro (id TEXT PRIMARY KEY, tenant_id TEXT, url TEXT NOT NULL, events TEXT NOT NULL, secret TEXT, activo INTEGER DEFAULT 1, fail_count INTEGER DEFAULT 0, creado_en TEXT DEFAULT (datetime('now')))`);
    await dbRun(`CREATE TABLE IF NOT EXISTS consentimientos (id TEXT PRIMARY KEY, cliente_id TEXT NOT NULL, tipo TEXT NOT NULL, aceptado INTEGER NOT NULL, ip TEXT, fecha TEXT DEFAULT (datetime('now')), FOREIGN KEY(cliente_id) REFERENCES clientes(id))`);
  },
  async down(dbRun) {
    for (const t of ['consentimientos','webhooks_registro','permisos_usuario','sla_definiciones','plantillas','reglas_negocio','audit_blockchain','tenants','alertas_vigilante']) {
      await dbRun(`DROP TABLE IF EXISTS ${t}`);
    }
  }
};
