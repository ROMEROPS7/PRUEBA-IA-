const AgenteBase = require('./base');
const db = require('../../config/database');
const { v4: uuid } = require('uuid');
const { loadPrompt } = require('../../utils/promptLoader');

class AgenteComunicaciones extends AgenteBase {
  constructor(client, modelo) { super(client, modelo, 'comunicaciones'); }

  async ejecutar(input) {
    const systemPrompt = loadPrompt('comunicaciones');

    const respuesta = await this.llamarIA(systemPrompt, `
TIPO COMUNICACIÓN: ${input.tipo}
CLIENTE: ${input.cliente?.nombre} ${input.cliente?.apellidos}
DATOS ADICIONALES: ${JSON.stringify({
      importe: input.importe,
      franquicia: input.franquicia,
      motivo: input.motivo,
      detalles: input.detalles
    })}
    `);

    const output = this.parsearJSON(respuesta.texto) || {
      asunto: 'Actualización de su siniestro - SegurCaixa Adeslas',
      mensaje_email: `Estimado/a ${input.cliente?.nombre}, le informamos sobre la actualización de su siniestro.`,
      mensaje_sms: `SegurCaixa: Actualización de su siniestro. Revise su email para más detalles.`,
      canales_recomendados: ['email']
    };

    return { output, razonamiento: respuesta.texto, tokens: respuesta.tokens, coste: respuesta.coste };
  }

  /**
   * Notificar al gestor asignado (método directo, sin IA)
   */
  async notificarGestor(siniestroId, datos) {
    try {
      const siniestro = await db('siniestros').where('id', siniestroId).first();
      await db('comunicaciones').insert({
        id: uuid(),
        siniestro_id: siniestroId,
        canal: 'interna',
        asunto: `[${datos.tipo}] Siniestro ${siniestro?.numero_expediente}`,
        contenido: JSON.stringify(datos),
        destinatario: siniestro?.gestor_id || 'gestores',
        generado_por_ia: true
      });
    } catch (err) {
      // No fallar por notificación
    }
  }
}
module.exports = AgenteComunicaciones;
