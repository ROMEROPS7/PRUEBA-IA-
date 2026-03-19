const { dbAll, dbGet, dbRun } = require('../database/db');
const fraudeService = require('../services/fraudeService');
const whatsappService = require('../services/whatsappService');
const { v4: uuidv4 } = require('uuid');

// En produccion: const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `Eres el agente principal de SiniestrosAI, un sistema autonomo de gestion de siniestros de seguros en Espana.
Tu rol es:
- Analizar y clasificar siniestros entrantes
- Determinar urgencia y prioridad
- Asignar peritos automaticamente segun zona y especialidad
- Detectar posible fraude
- Generar respuestas para clientes via WhatsApp y telefono
- Resumir expedientes y generar informes

Responde siempre en espanol. Se profesional pero cercano. Usa datos concretos cuando sea posible.`;

const mainAgent = {
  /**
   * Inicializa el cliente de Claude API
   */
  _getClient() {
    // En produccion:
    // const Anthropic = require('@anthropic-ai/sdk');
    // return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return null; // Modo demo
  },

  /**
   * Enviar prompt a Claude y obtener respuesta
   */
  async consultar(prompt, contexto = '') {
    const client = this._getClient();

    if (client) {
      // Produccion: usar Claude API
      // const response = await client.messages.create({
      //   model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
      //   max_tokens: 1024,
      //   system: SYSTEM_PROMPT + (contexto ? `\n\nContexto actual:\n${contexto}` : ''),
      //   messages: [{ role: 'user', content: prompt }],
      // });
      // return response.content[0].text;
    }

    // Modo demo: respuestas simuladas inteligentes
    return this._respuestaDemo(prompt);
  },

  /**
   * Clasifica automaticamente un siniestro nuevo
   */
  async clasificarSiniestro(siniestroId) {
    const siniestro = await dbGet(`SELECT s.*, c.nombre, c.poliza FROM siniestros s
      LEFT JOIN clientes c ON s.cliente_id = c.id WHERE s.id = ?`, [siniestroId]);
    if (!siniestro) throw new Error('Siniestro no encontrado');

    // Analisis de fraude
    const analisisFraude = await fraudeService.analizarSiniestro(siniestroId);

    // Determinar confianza IA
    let iaConfianza = 95;
    if (analisisFraude.score_final > 50) iaConfianza = 65;
    else if (analisisFraude.score_final > 25) iaConfianza = 80;

    // Auto-asignar perito si urgencia alta
    let peritoAsignado = null;
    if (siniestro.urgencia >= 7) {
      peritoAsignado = await this._asignarPerito(siniestro.tipo, siniestro.zona);
    }

    // Actualizar siniestro
    const sets = [`ia_confianza = ${iaConfianza}`, `score_fraude = ${analisisFraude.score_final}`];
    if (analisisFraude.score_final > 50) {
      sets.push("ia_gestion = 'partial'");
      sets.push("estado = 'En gestion'");
    }
    if (peritoAsignado) {
      sets.push(`perito_id = '${peritoAsignado.id}'`);
      sets.push("estado = 'Perito asignado'");
    }

    await dbRun(`UPDATE siniestros SET ${sets.join(', ')}, fecha_actualizacion = datetime('now') WHERE id = ?`, [siniestroId]);

    // Registrar en timeline
    await dbRun('INSERT INTO expedientes (id, siniestro_id, tipo_evento, descripcion) VALUES (?,?,?,?)',
      [uuidv4(), siniestroId, 'clasificacion_ia', `IA clasifico siniestro. Confianza: ${iaConfianza}%. Fraude: ${analisisFraude.score_final}/100`]);

    return {
      siniestro_id: siniestroId,
      ia_confianza: iaConfianza,
      score_fraude: analisisFraude.score_final,
      nivel_riesgo: analisisFraude.nivel_riesgo,
      perito_asignado: peritoAsignado?.nombre || null,
      alertas: analisisFraude.alertas,
    };
  },

  /**
   * Asigna perito automaticamente por zona y especialidad
   */
  async _asignarPerito(tipoSiniestro, zona) {
    const especialidadMap = { coche: 'Auto', hogar: 'Hogar', salud: 'Salud', robo: 'Robo', otro: 'Todos' };
    const esp = especialidadMap[tipoSiniestro] || 'Todos';

    // Buscar perito disponible: primero misma zona y especialidad, luego ampliar
    let perito = await dbGet(`SELECT * FROM agentes WHERE tipo = 'perito' AND disponible = 1
      AND zona = ? AND (especialidad LIKE ? OR especialidad LIKE '%Todos%')
      ORDER BY valoracion DESC LIMIT 1`, [zona, `%${esp}%`]);

    if (!perito) {
      perito = await dbGet(`SELECT * FROM agentes WHERE tipo = 'perito' AND disponible = 1
        AND (especialidad LIKE ? OR especialidad LIKE '%Todos%')
        ORDER BY valoracion DESC LIMIT 1`, [`%${esp}%`]);
    }

    if (!perito) {
      perito = await dbGet("SELECT * FROM agentes WHERE tipo = 'perito' AND disponible = 1 ORDER BY valoracion DESC LIMIT 1");
    }

    if (perito) {
      await dbRun('UPDATE agentes SET expedientes_total = expedientes_total + 1 WHERE id = ?', [perito.id]);
    }

    return perito;
  },

  /**
   * Genera resumen ejecutivo de un siniestro
   */
  async generarResumen(siniestroId) {
    const siniestro = await dbGet(`SELECT s.*, c.nombre, c.poliza, a.nombre as perito_nombre
      FROM siniestros s LEFT JOIN clientes c ON s.cliente_id = c.id
      LEFT JOIN agentes a ON s.perito_id = a.id WHERE s.id = ?`, [siniestroId]);

    if (!siniestro) throw new Error('Siniestro no encontrado');

    const timeline = await dbAll('SELECT * FROM expedientes WHERE siniestro_id = ? ORDER BY fecha', [siniestroId]);

    // En produccion usaria Claude API
    const resumen = {
      expediente: siniestro.expediente,
      cliente: siniestro.nombre,
      tipo: siniestro.tipo,
      estado: siniestro.estado,
      urgencia: siniestro.urgencia,
      score_fraude: siniestro.score_fraude,
      ia_confianza: siniestro.ia_confianza,
      perito: siniestro.perito_nombre || 'Sin asignar',
      resumen_texto: `Siniestro de tipo ${siniestro.tipo} reportado por ${siniestro.nombre}. ${siniestro.descripcion}. Estado actual: ${siniestro.estado}. Urgencia: ${siniestro.urgencia}/10. Score fraude: ${siniestro.score_fraude}/100.`,
      eventos: timeline.length,
      recomendacion: siniestro.score_fraude > 50 ? 'Requiere revision humana antes de proceder' : 'Procesamiento automatico recomendado',
    };

    return resumen;
  },

  /**
   * Procesa un mensaje de chat del expediente
   */
  async procesarChat(siniestroId, mensaje, usuarioNombre) {
    const siniestro = await dbGet(`SELECT s.*, c.nombre FROM siniestros s
      LEFT JOIN clientes c ON s.cliente_id = c.id WHERE s.id = ?`, [siniestroId]);

    if (!siniestro) return 'Siniestro no encontrado.';

    // Respuesta IA basada en contexto
    const msgLower = mensaje.toLowerCase();
    let respuesta;

    if (msgLower.includes('perito') || msgLower.includes('asignar')) {
      const perito = await this._asignarPerito(siniestro.tipo, siniestro.zona);
      respuesta = perito ? `He asignado al perito ${perito.nombre} (${perito.especialidad}, zona ${perito.zona}). Valoracion: ${perito.valoracion}/5.` : 'No hay peritos disponibles en este momento.';
    } else if (msgLower.includes('fraude') || msgLower.includes('sospechoso')) {
      const analisis = await fraudeService.analizarSiniestro(siniestroId);
      respuesta = `Analisis anti-fraude completado. Score: ${analisis.score_final}/100 (${analisis.nivel_riesgo}). ${analisis.recomendacion}`;
    } else if (msgLower.includes('estado') || msgLower.includes('resumen')) {
      const resumen = await this.generarResumen(siniestroId);
      respuesta = resumen.resumen_texto;
    } else if (msgLower.includes('cerrar') || msgLower.includes('resolver')) {
      respuesta = `Para cerrar el expediente ${siniestro.expediente}, utilice el boton "Cerrar expediente" en la barra de acciones.`;
    } else {
      respuesta = `Entendido, ${usuarioNombre}. He registrado tu comentario sobre el expediente ${siniestro.expediente}. ¿Necesitas que realice alguna accion automatica?`;
    }

    return respuesta;
  },

  /**
   * Respuestas demo cuando no hay API key configurada
   */
  _respuestaDemo(prompt) {
    const p = prompt.toLowerCase();
    if (p.includes('clasificar') || p.includes('analizar')) {
      return 'Siniestro analizado. Tipo: automovil. Urgencia: alta. Score fraude: bajo (12/100). Recomendacion: procesamiento automatico. Perito asignado automaticamente.';
    }
    if (p.includes('fraude')) {
      return 'Analisis anti-fraude completado. No se detectan indicadores significativos. Score: 15/100. Nivel: BAJO. Proceder con tramitacion normal.';
    }
    if (p.includes('resumen') || p.includes('informe')) {
      return 'Resumen ejecutivo generado. 15 siniestros activos, 4 resueltos esta semana. Ahorro estimado: 47.320 EUR. Satisfaccion media: 8.7/10. Sin incidencias criticas.';
    }
    return 'Soy el agente IA principal de SiniestrosAI. Puedo clasificar siniestros, analizar fraude, asignar peritos y generar informes. ¿Que necesitas?';
  },
};

module.exports = mainAgent;
