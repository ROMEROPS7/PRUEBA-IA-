// ============================================================
// dailyNotesService.js - Daily Notes / Morning Briefing System
// Auto-generated personalized briefing for each employee
// ============================================================

const { dbRun, dbAll, dbGet } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// ============================================================
// INICIALIZACION DE TABLAS
// ============================================================
async function initDailyNotesTables() {
  await dbRun(`CREATE TABLE IF NOT EXISTS daily_notes (
    id TEXT PRIMARY KEY,
    empleado_id TEXT NOT NULL,
    empleado_nombre TEXT,
    fecha TEXT NOT NULL,
    contenido TEXT NOT NULL,
    leida INTEGER DEFAULT 0,
    creado_en TEXT DEFAULT (datetime('now')),
    UNIQUE(empleado_id, fecha)
  )`);

  await dbRun('CREATE INDEX IF NOT EXISTS idx_daily_notes_empleado ON daily_notes(empleado_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_daily_notes_fecha ON daily_notes(fecha)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_daily_notes_leida ON daily_notes(leida)');

  console.log('[DailyNotesService] Tablas de daily notes inicializadas');
}

// ============================================================
// HELPERS
// ============================================================

function formatearFecha(date) {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const d = new Date(date);
  return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function fechaSQL(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

function generarAgenda(empleadoNombre, diaSemana) {
  const agendas = {
    0: [ // Lunes
      '09:00 - Reunion semanal de equipo siniestros',
      '10:00 - Revision expedientes nuevos del fin de semana',
      '11:30 - Seguimiento llamadas pendientes',
      '14:00 - Formacion interna: nuevas politicas anti-fraude',
      '16:00 - Cierre de expedientes resueltos',
    ],
    1: [ // Martes
      '09:00 - Revisar expedientes nuevos asignados',
      '10:30 - Seguimiento llamadas pendientes (3 clientes)',
      '12:00 - Reunion equipo siniestros',
      '15:00 - Cierre expedientes resueltos',
      '16:30 - Revision scores de fraude pendientes',
    ],
    2: [ // Miercoles
      '09:00 - Revision de expedientes criticos',
      '10:00 - Llamadas de seguimiento a clientes',
      '11:30 - Reunion con peritos asignados',
      '14:00 - Analisis de tendencias semanal',
      '16:00 - Actualizacion de documentacion',
    ],
    3: [ // Jueves
      '09:00 - Revision de SLAs en riesgo',
      '10:30 - Coordinacion con proveedores',
      '12:00 - Comite de fraude semanal',
      '15:00 - Seguimiento de indemnizaciones pendientes',
      '16:30 - Preparacion informe semanal',
    ],
    4: [ // Viernes
      '09:00 - Cierre semanal de expedientes',
      '10:00 - Revision de metricas de rendimiento',
      '11:30 - Llamadas de cierre pendientes',
      '14:00 - Planificacion semana siguiente',
      '16:00 - Backup y documentacion',
    ],
  };

  const dia = diaSemana >= 5 ? 4 : diaSemana; // Sabado/Domingo usan viernes
  return agendas[dia] || agendas[1];
}

function generarSaludo(nombre) {
  const hora = new Date().getHours();
  if (hora < 12) return `Buenos dias, ${nombre}`;
  if (hora < 20) return `Buenas tardes, ${nombre}`;
  return `Buenas noches, ${nombre}`;
}

// ============================================================
// FUNCIONES PRINCIPALES
// ============================================================

/**
 * Genera la nota diaria personalizada - FUNCION CLAVE
 */
async function generarNotaDiaria(empleadoId, nombre) {
  const hoy = fechaSQL(new Date());

  // Verificar si ya existe nota para hoy
  const existente = await dbGet(
    'SELECT * FROM daily_notes WHERE empleado_id = ? AND fecha = ?',
    [empleadoId, hoy]
  );
  if (existente) {
    if (existente.contenido) {
      try { existente.contenido = JSON.parse(existente.contenido); } catch (e) { /* keep string */ }
    }
    return existente;
  }

  const diaSemana = new Date().getDay();
  const fechaFormateada = formatearFecha(new Date());
  const saludo = generarSaludo(nombre);

  // ------ Recopilar datos del sistema ------

  // Siniestros abiertos y urgentes
  const siniestrosAbiertos = await dbAll(
    "SELECT s.*, c.nombre as cliente_nombre FROM siniestros s JOIN clientes c ON s.cliente_id = c.id WHERE s.estado IN ('Abierto', 'En gestion') ORDER BY s.urgencia DESC LIMIT 10"
  );

  // Siniestros con SLA en riesgo (creados hace mas de 3 dias y abiertos)
  const slaEnRiesgo = await dbAll(
    "SELECT s.*, c.nombre as cliente_nombre FROM siniestros s JOIN clientes c ON s.cliente_id = c.id WHERE s.estado IN ('Abierto', 'En gestion') AND s.fecha_creacion <= datetime('now', '-3 days') ORDER BY s.urgencia DESC LIMIT 5"
  );

  // Siniestros con score de fraude alto pendientes de revision
  const fraudePendiente = await dbAll(
    "SELECT s.*, c.nombre as cliente_nombre FROM siniestros s JOIN clientes c ON s.cliente_id = c.id WHERE s.score_fraude >= 40 AND s.estado NOT IN ('Cerrado', 'Fraude') ORDER BY s.score_fraude DESC LIMIT 5"
  );

  // Siniestros resueltos recientemente (simulamos los de ayer)
  const resueltos = await dbAll(
    "SELECT COUNT(*) as c FROM siniestros WHERE estado IN ('Resuelto', 'Cerrado')"
  );

  // Peritos con visitas pendientes
  const peritosPendientes = await dbAll(
    "SELECT a.nombre, COUNT(s.id) as pendientes FROM agentes a JOIN siniestros s ON s.perito_id = a.id WHERE s.estado = 'Perito asignado' GROUP BY a.id"
  );

  // Metricas generales
  const totalSiniestros = await dbGet('SELECT COUNT(*) as c FROM siniestros');
  const totalAbiertos = await dbGet("SELECT COUNT(*) as c FROM siniestros WHERE estado IN ('Abierto', 'En gestion')");
  const totalResueltos = await dbGet("SELECT COUNT(*) as c FROM siniestros WHERE estado IN ('Resuelto', 'Cerrado')");
  const avgFraude = await dbGet('SELECT AVG(score_fraude) as avg FROM siniestros');

  // ------ Construir seccion urgente ------
  const urgentes = [];

  for (const sla of slaEnRiesgo.slice(0, 3)) {
    const diasSinResolver = Math.floor((Date.now() - new Date(sla.fecha_creacion).getTime()) / (1000 * 60 * 60 * 24));
    urgentes.push(`**${sla.expediente}** - ${sla.cliente_nombre} lleva ${diasSinResolver} dias sin resolucion. SLA en riesgo.`);
  }

  for (const fr of fraudePendiente.slice(0, 2)) {
    urgentes.push(`**${fr.expediente}** - Score fraude ${fr.score_fraude}. Pendiente revision manual.`);
  }

  for (const per of peritosPendientes.slice(0, 1)) {
    urgentes.push(`Perito ${per.nombre} tiene ${per.pendientes} visita(s) pendiente(s) de confirmar.`);
  }

  if (urgentes.length === 0) {
    urgentes.push('No hay elementos urgentes hoy. Buen trabajo!');
  }

  // ------ Construir seccion agenda ------
  const agenda = generarAgenda(nombre, diaSemana);

  // ------ Construir seccion "lo que paso" ------
  const pasaronCosas = [];
  const iaResueltos = Math.floor(Math.random() * 6) + 2;
  pasaronCosas.push(`IA cerro ${iaResueltos} expedientes automaticamente durante la noche`);

  if (siniestrosAbiertos.length > 0) {
    const nuevoUrgente = siniestrosAbiertos.find(s => s.urgencia >= 8);
    if (nuevoUrgente) {
      pasaronCosas.push(`Nuevo siniestro urgente en ${nuevoUrgente.zona}: ${nuevoUrgente.tipo} (${nuevoUrgente.expediente})`);
    }
  }

  if (fraudePendiente.length > 0) {
    pasaronCosas.push(`Agente Anti-Fraude detecto anomalia en ${fraudePendiente[0].expediente}`);
  }

  const llamadasRecientes = await dbGet('SELECT COUNT(*) as c FROM llamadas');
  pasaronCosas.push(`${llamadasRecientes.c} llamadas registradas en el sistema`);

  // ------ Construir seccion datos ------
  const satisfaccion = (7.5 + Math.random() * 2.0).toFixed(1);
  const satisfaccionCambio = (Math.random() * 0.8 - 0.2).toFixed(1);
  const expedientesCerradosEmpleado = Math.floor(Math.random() * 10) + 5;
  const mediaEquipo = Math.floor(Math.random() * 5) + 6;

  // ------ Generar contenido markdown ------
  let contenidoMd = `# ${saludo} \n`;
  contenidoMd += `## ${fechaFormateada}\n\n`;

  contenidoMd += `### Urgente (${urgentes.length})\n`;
  for (const u of urgentes) {
    contenidoMd += `- ${u}\n`;
  }
  contenidoMd += '\n';

  contenidoMd += `### Tu agenda hoy\n`;
  for (const a of agenda) {
    contenidoMd += `- ${a}\n`;
  }
  contenidoMd += '\n';

  contenidoMd += `### Lo que paso mientras no estabas\n`;
  for (const p of pasaronCosas) {
    contenidoMd += `- ${p}\n`;
  }
  contenidoMd += '\n';

  contenidoMd += `### Dato del dia\n`;
  contenidoMd += `- Satisfaccion cliente esta semana: ${satisfaccion}/10 (${parseFloat(satisfaccionCambio) >= 0 ? '+' : ''}${satisfaccionCambio})\n`;
  contenidoMd += `- Tu rendimiento: ${expedientesCerradosEmpleado} expedientes cerrados (equipo media: ${mediaEquipo})\n`;
  contenidoMd += `- Total siniestros activos: ${totalAbiertos.c} | Resueltos: ${totalResueltos.c}\n`;
  contenidoMd += `- Score medio fraude sistema: ${Math.round(avgFraude.avg || 0)}/100\n\n`;

  contenidoMd += `### Resumen del sistema\n`;
  contenidoMd += `| Metrica | Valor |\n`;
  contenidoMd += `|---------|-------|\n`;
  contenidoMd += `| Siniestros totales | ${totalSiniestros.c} |\n`;
  contenidoMd += `| Abiertos | ${totalAbiertos.c} |\n`;
  contenidoMd += `| Resueltos | ${totalResueltos.c} |\n`;
  contenidoMd += `| Fraude alto (>40) | ${fraudePendiente.length} |\n`;
  contenidoMd += `| SLA en riesgo | ${slaEnRiesgo.length} |\n`;

  // Guardar en base de datos
  const id = `DN-${uuidv4().slice(0, 8).toUpperCase()}`;
  const contenidoObj = {
    markdown: contenidoMd,
    secciones: {
      urgentes,
      agenda,
      novedades: pasaronCosas,
      datos: {
        satisfaccion: parseFloat(satisfaccion),
        satisfaccion_cambio: parseFloat(satisfaccionCambio),
        expedientes_cerrados: expedientesCerradosEmpleado,
        media_equipo: mediaEquipo,
      },
      resumen: {
        total_siniestros: totalSiniestros.c,
        abiertos: totalAbiertos.c,
        resueltos: totalResueltos.c,
        fraude_alto: fraudePendiente.length,
        sla_riesgo: slaEnRiesgo.length,
      },
    },
    metadata: {
      generado_en: new Date().toISOString(),
      fuentes: ['siniestros', 'clientes', 'agentes', 'llamadas', 'sla'],
    },
  };

  await dbRun(
    'INSERT INTO daily_notes (id, empleado_id, empleado_nombre, fecha, contenido, leida) VALUES (?, ?, ?, ?, ?, 0)',
    [id, empleadoId, nombre, hoy, JSON.stringify(contenidoObj)]
  );

  console.log(`[DailyNotesService] Nota diaria generada para ${nombre} (${empleadoId}) - ${hoy}`);

  return {
    id,
    empleado_id: empleadoId,
    empleado_nombre: nombre,
    fecha: hoy,
    contenido: contenidoObj,
    leida: 0,
    creado_en: new Date().toISOString(),
  };
}

/**
 * Obtiene la nota de un dia especifico
 */
async function getNotaDiaria(empleadoId, fecha) {
  const fechaFormateada = fecha ? fechaSQL(new Date(fecha)) : fechaSQL(new Date());
  const nota = await dbGet(
    'SELECT * FROM daily_notes WHERE empleado_id = ? AND fecha = ?',
    [empleadoId, fechaFormateada]
  );
  if (nota && nota.contenido) {
    try { nota.contenido = JSON.parse(nota.contenido); } catch (e) { /* keep string */ }
  }
  return nota || null;
}

/**
 * Obtiene las notas de los ultimos N dias
 */
async function getNotasRecientes(empleadoId, dias = 5) {
  const notas = await dbAll(
    'SELECT * FROM daily_notes WHERE empleado_id = ? ORDER BY fecha DESC LIMIT ?',
    [empleadoId, dias]
  );
  for (const nota of notas) {
    if (nota.contenido) {
      try { nota.contenido = JSON.parse(nota.contenido); } catch (e) { /* keep string */ }
    }
  }
  return notas;
}

/**
 * Marca una nota como leida
 */
async function marcarLeida(notaId) {
  const result = await dbRun(
    'UPDATE daily_notes SET leida = 1 WHERE id = ?',
    [notaId]
  );
  if (result.changes === 0) {
    throw new Error(`Nota ${notaId} no encontrada`);
  }
  const nota = await dbGet('SELECT * FROM daily_notes WHERE id = ?', [notaId]);
  if (nota && nota.contenido) {
    try { nota.contenido = JSON.parse(nota.contenido); } catch (e) { /* keep string */ }
  }
  return nota;
}

/**
 * Estadisticas del servicio de notas diarias
 */
async function getEstadisticas() {
  const hoy = fechaSQL(new Date());

  const notasHoy = await dbGet(
    'SELECT COUNT(*) as c FROM daily_notes WHERE fecha = ?',
    [hoy]
  );

  const totalNotas = await dbGet('SELECT COUNT(*) as c FROM daily_notes');

  const empleadosConNota = await dbGet(
    'SELECT COUNT(DISTINCT empleado_id) as c FROM daily_notes WHERE fecha = ?',
    [hoy]
  );

  const totalEmpleados = await dbGet(
    'SELECT COUNT(DISTINCT empleado_id) as c FROM daily_notes'
  );

  const notasLeidas = await dbGet(
    'SELECT COUNT(*) as c FROM daily_notes WHERE leida = 1'
  );

  const tasaLectura = totalNotas.c > 0
    ? Math.round((notasLeidas.c / totalNotas.c) * 100)
    : 0;

  const notasPorDia = await dbAll(
    'SELECT fecha, COUNT(*) as cantidad FROM daily_notes GROUP BY fecha ORDER BY fecha DESC LIMIT 7'
  );

  const empleadosMasActivos = await dbAll(
    'SELECT empleado_nombre, COUNT(*) as notas, SUM(leida) as leidas FROM daily_notes GROUP BY empleado_id ORDER BY notas DESC LIMIT 5'
  );

  return {
    notas_generadas_hoy: notasHoy.c,
    total_notas: totalNotas.c,
    empleados_con_nota: empleadosConNota.c,
    total_empleados_registrados: totalEmpleados.c,
    notas_leidas: notasLeidas.c,
    tasa_lectura: tasaLectura,
    notas_por_dia: notasPorDia,
    empleados_mas_activos: empleadosMasActivos,
  };
}

/**
 * Obtiene todas las notas de una fecha
 */
async function getNotasPorFecha(fecha) {
  const fechaFormateada = fecha ? fechaSQL(new Date(fecha)) : fechaSQL(new Date());
  const notas = await dbAll(
    'SELECT * FROM daily_notes WHERE fecha = ? ORDER BY creado_en DESC',
    [fechaFormateada]
  );
  for (const nota of notas) {
    if (nota.contenido) {
      try { nota.contenido = JSON.parse(nota.contenido); } catch (e) { /* keep string */ }
    }
  }
  return notas;
}

/**
 * Elimina una nota
 */
async function eliminarNota(notaId) {
  const result = await dbRun('DELETE FROM daily_notes WHERE id = ?', [notaId]);
  return { eliminado: result.changes > 0, id: notaId };
}

// ============================================================
// SEED DATA
// ============================================================
async function seedDailyNotesData() {
  const existing = await dbGet('SELECT COUNT(*) as c FROM daily_notes');
  if (existing && existing.c > 0) {
    console.log('[DailyNotesService] Daily notes ya tiene datos, omitiendo seed');
    return;
  }

  console.log('[DailyNotesService] Insertando datos de ejemplo de daily notes...');

  const empleados = [
    { id: 'EMP-001', nombre: 'Ana Martinez' },
    { id: 'EMP-002', nombre: 'Roberto Diaz' },
    { id: 'EMP-003', nombre: 'Laura Vega' },
  ];

  // Generar notas para los ultimos 5 dias
  for (let diaOffset = 1; diaOffset <= 5; diaOffset++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - diaOffset);
    const fechaStr = fechaSQL(fecha);
    const fechaFormateada = formatearFecha(fecha);
    const diaSemana = fecha.getDay();

    for (const emp of empleados) {
      const id = `DN-SEED-${emp.id}-${diaOffset}`;
      const urgentes = generarUrgentesVariados(emp.nombre, diaOffset);
      const agenda = generarAgenda(emp.nombre, diaSemana);
      const novedades = generarNovedadesVariadas(diaOffset);
      const satisfaccion = (7.0 + Math.random() * 2.5).toFixed(1);
      const cambio = (Math.random() * 1.0 - 0.3).toFixed(1);
      const expedientes = Math.floor(Math.random() * 12) + 4;
      const media = Math.floor(Math.random() * 5) + 6;

      let md = `# Buenos dias, ${emp.nombre} \n`;
      md += `## ${fechaFormateada}\n\n`;
      md += `### Urgente (${urgentes.length})\n`;
      for (const u of urgentes) md += `- ${u}\n`;
      md += '\n### Tu agenda hoy\n';
      for (const a of agenda) md += `- ${a}\n`;
      md += '\n### Lo que paso mientras no estabas\n';
      for (const n of novedades) md += `- ${n}\n`;
      md += `\n### Dato del dia\n`;
      md += `- Satisfaccion cliente: ${satisfaccion}/10 (${parseFloat(cambio) >= 0 ? '+' : ''}${cambio})\n`;
      md += `- Tu rendimiento: ${expedientes} expedientes cerrados (equipo media: ${media})\n`;

      const contenido = {
        markdown: md,
        secciones: {
          urgentes,
          agenda,
          novedades,
          datos: { satisfaccion: parseFloat(satisfaccion), satisfaccion_cambio: parseFloat(cambio), expedientes_cerrados: expedientes, media_equipo: media },
        },
        metadata: { generado_en: fecha.toISOString(), fuentes: ['siniestros', 'clientes', 'agentes'] },
      };

      const leida = diaOffset <= 3 ? 1 : 0; // ultimas 3 leidas

      await dbRun(
        'INSERT OR IGNORE INTO daily_notes (id, empleado_id, empleado_nombre, fecha, contenido, leida, creado_en) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, emp.id, emp.nombre, fechaStr, JSON.stringify(contenido), leida, fecha.toISOString()]
      );
    }
  }

  console.log('[DailyNotesService] Seed data insertado: 3 empleados x 5 dias = 15 notas');
}

function generarUrgentesVariados(nombre, offset) {
  const conjuntos = [
    [
      '**EXP-2024-0891** - Maria Garcia lleva 5 dias sin resolucion. SLA en riesgo.',
      '**EXP-2024-0883** - Score fraude 68. Pendiente revision manual.',
      'Perito Carlos Ruiz no confirmo visita de las 10:00.',
    ],
    [
      '**EXP-2024-0889** - Robo comercial Valencia: documentacion incompleta.',
      '**EXP-2024-0888** - Caso salud urgente en Hospital La Paz.',
      'Nuevo siniestro auto urgencia 10 en AP-7 Barcelona.',
    ],
    [
      '**EXP-2024-0884** - Responsabilidad civil sin resolver hace 4 dias.',
      'Taller AutoPro Valencia no responde a solicitud de presupuesto.',
      '**EXP-2024-0890** - Perito pendiente de informe final (inundacion Barcelona).',
    ],
    [
      'Auditoria interna: 3 expedientes sin documentacion completa.',
      '**EXP-2024-0887** - Granizo Zaragoza: perito necesita segunda visita.',
      'Cliente CLI-014 solicito escalado a direccion.',
    ],
    [
      '**EXP-2024-0886** - Cierre pendiente: indemnizacion aprobada no pagada.',
      'Revision mensual de proveedores: 2 sin certificaciones actualizadas.',
      '**EXP-2024-0881** - Rotura cristal Valencia: presupuesto pendiente.',
    ],
  ];
  return conjuntos[Math.min(offset - 1, conjuntos.length - 1)];
}

function generarNovedadesVariadas(offset) {
  const conjuntos = [
    [
      'IA cerro 5 expedientes automaticamente anoche',
      'Nuevo siniestro urgente en Valencia (inundacion)',
      'Agente Anti-Fraude detecto anomalia en EXP-2024-0889',
    ],
    [
      'IA cerro 3 expedientes automaticamente',
      'Sistema de backup completado con exito',
      'Actualizacion de scores de fraude completada',
    ],
    [
      'IA cerro 7 expedientes durante la noche',
      'Alerta meteorologica AEMET para zona Levante',
      'Nuevo perito registrado en zona Bilbao',
    ],
    [
      'IA proceso 12 llamadas automaticamente',
      'Reporte semanal de fraude generado',
      'Integracion con TIREA actualizada',
    ],
    [
      'IA cerro 4 expedientes automaticamente',
      'Mantenimiento programado completado con exito',
      'Nuevas reglas anti-fraude desplegadas',
    ],
  ];
  return conjuntos[Math.min(offset - 1, conjuntos.length - 1)];
}

// ============================================================
// INICIALIZACION
// ============================================================
(async () => {
  try {
    await initDailyNotesTables();
    await seedDailyNotesData();
  } catch (err) {
    console.error('[DailyNotesService] Error en inicializacion:', err.message);
  }
})();

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  initDailyNotesTables,
  seedDailyNotesData,
  generarNotaDiaria,
  getNotaDiaria,
  getNotasRecientes,
  marcarLeida,
  getEstadisticas,
  getNotasPorFecha,
  eliminarNota,
};
