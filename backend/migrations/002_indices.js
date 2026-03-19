module.exports = {
  version: 2,
  name: 'add_indices',
  async up(dbRun) {
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_siniestros_cliente ON siniestros(cliente_id)',
      'CREATE INDEX IF NOT EXISTS idx_siniestros_estado ON siniestros(estado)',
      'CREATE INDEX IF NOT EXISTS idx_siniestros_tipo ON siniestros(tipo)',
      'CREATE INDEX IF NOT EXISTS idx_siniestros_zona ON siniestros(zona)',
      'CREATE INDEX IF NOT EXISTS idx_siniestros_fraude ON siniestros(score_fraude)',
      'CREATE INDEX IF NOT EXISTS idx_expedientes_siniestro ON expedientes(siniestro_id)',
      'CREATE INDEX IF NOT EXISTS idx_llamadas_siniestro ON llamadas(siniestro_id)',
      'CREATE INDEX IF NOT EXISTS idx_llamadas_cliente ON llamadas(cliente_id)',
      'CREATE INDEX IF NOT EXISTS idx_mensajes_siniestro ON mensajes_whatsapp(siniestro_id)',
      'CREATE INDEX IF NOT EXISTS idx_mensajes_cliente ON mensajes_whatsapp(cliente_id)',
      'CREATE INDEX IF NOT EXISTS idx_documentos_siniestro ON documentos(siniestro_id)',
      'CREATE INDEX IF NOT EXISTS idx_agentes_tipo ON agentes(tipo)',
      'CREATE INDEX IF NOT EXISTS idx_agentes_zona ON agentes(zona)',
      'CREATE INDEX IF NOT EXISTS idx_agentes_disponible ON agentes(disponible)',
    ];
    for (const sql of indices) await dbRun(sql);
  },
  async down(dbRun) {
    const r = await require('../database/db').dbAll("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'");
    for (const i of r) await dbRun(`DROP INDEX IF EXISTS ${i.name}`);
  }
};
