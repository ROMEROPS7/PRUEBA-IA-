module.exports = {
  version: 1,
  name: 'initial_schema',
  async up(dbRun) {
    await dbRun(`CREATE TABLE IF NOT EXISTS usuarios (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, rol TEXT NOT NULL, activo INTEGER DEFAULT 1, creado_en TEXT DEFAULT (datetime('now')), ultimo_login TEXT)`);
    await dbRun(`CREATE TABLE IF NOT EXISTS clientes (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, telefono TEXT NOT NULL, email TEXT, dni TEXT, direccion TEXT, poliza TEXT UNIQUE, tipo_poliza TEXT, fecha_alta TEXT DEFAULT (datetime('now')), notas TEXT)`);
    await dbRun(`CREATE TABLE IF NOT EXISTS siniestros (id TEXT PRIMARY KEY, expediente TEXT UNIQUE NOT NULL, cliente_id TEXT NOT NULL, tipo TEXT NOT NULL, descripcion TEXT NOT NULL, estado TEXT DEFAULT 'Abierto', urgencia INTEGER DEFAULT 5, score_fraude INTEGER DEFAULT 0, direccion TEXT, lat REAL, lng REAL, zona TEXT, perito_id TEXT, ia_confianza INTEGER DEFAULT 85, ia_gestion TEXT DEFAULT 'full', ia_tiempo TEXT, humano_tiempo TEXT, valoracion REAL, indemnizacion INTEGER, fecha_creacion TEXT DEFAULT (datetime('now')), fecha_actualizacion TEXT DEFAULT (datetime('now')), fecha_cierre TEXT, FOREIGN KEY(cliente_id) REFERENCES clientes(id), FOREIGN KEY(perito_id) REFERENCES agentes(id))`);
    await dbRun(`CREATE TABLE IF NOT EXISTS expedientes (id TEXT PRIMARY KEY, siniestro_id TEXT NOT NULL, tipo_evento TEXT NOT NULL, descripcion TEXT, usuario_id TEXT, datos_extra TEXT, fecha TEXT DEFAULT (datetime('now')), FOREIGN KEY(siniestro_id) REFERENCES siniestros(id))`);
    await dbRun(`CREATE TABLE IF NOT EXISTS agentes (id TEXT PRIMARY KEY, nombre TEXT NOT NULL, tipo TEXT NOT NULL, especialidad TEXT, telefono TEXT, email TEXT, zona TEXT, disponible INTEGER DEFAULT 1, valoracion REAL DEFAULT 4.5, expedientes_total INTEGER DEFAULT 0, tiempo_medio_dias REAL DEFAULT 4.0, creado_en TEXT DEFAULT (datetime('now')))`);
    await dbRun(`CREATE TABLE IF NOT EXISTS llamadas (id TEXT PRIMARY KEY, siniestro_id TEXT, cliente_id TEXT, telefono_origen TEXT, telefono_destino TEXT, duracion_seg INTEGER DEFAULT 0, tipo TEXT, transcripcion TEXT, resumen_ia TEXT, sentimiento TEXT, estado TEXT DEFAULT 'completada', fecha TEXT DEFAULT (datetime('now')), FOREIGN KEY(siniestro_id) REFERENCES siniestros(id), FOREIGN KEY(cliente_id) REFERENCES clientes(id))`);
    await dbRun(`CREATE TABLE IF NOT EXISTS mensajes_whatsapp (id TEXT PRIMARY KEY, siniestro_id TEXT, cliente_id TEXT, telefono TEXT, direccion TEXT, contenido TEXT NOT NULL, tipo_contenido TEXT DEFAULT 'texto', estado TEXT DEFAULT 'enviado', respuesta_ia TEXT, fecha TEXT DEFAULT (datetime('now')), FOREIGN KEY(siniestro_id) REFERENCES siniestros(id), FOREIGN KEY(cliente_id) REFERENCES clientes(id))`);
    await dbRun(`CREATE TABLE IF NOT EXISTS documentos (id TEXT PRIMARY KEY, siniestro_id TEXT NOT NULL, nombre TEXT NOT NULL, tipo TEXT, tamano TEXT, ruta TEXT, analisis_ia TEXT, fecha TEXT DEFAULT (datetime('now')), FOREIGN KEY(siniestro_id) REFERENCES siniestros(id))`);
  },
  async down(dbRun) {
    for (const t of ['documentos','mensajes_whatsapp','llamadas','expedientes','siniestros','agentes','clientes','usuarios']) {
      await dbRun(`DROP TABLE IF EXISTS ${t}`);
    }
  }
};
