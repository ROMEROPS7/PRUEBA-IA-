const AgenteBase = require('./base');
const db = require('../../config/database');
const { v4: uuid } = require('uuid');

class AgenteComunicaciones extends AgenteBase {
  constructor(client, modelo) { super(client, modelo, 'comunicaciones'); }

  async ejecutar(input) {
    const systemPrompt = `Eres el agente de COMUNICACIONES de una aseguradora española (SegurCaixa Adeslas). 
Generas mensajes empáticos, profesionales y claros para los clientes.

Tono: Cercano pero profesional. En español. Usa "usted" salvo en WhatsApp donde puedes tutear.
Incluye siempre el número de expediente si está disponible.
Sé transparente sobre plazos y próximos pasos.

TIPOS DE COMUNICACIÓN:
- recepcion_siniestro: Confirmar que hemos recibido el parte
- solicitud_documentacion: Pedir fotos/documentos faltantes
- asignacion_perito: Informar de la asignación de un perito
- resolucion_aprobada: Comunicar aprobación y pago
- rechazo_cobertura: Comunicar rechazo con motivo claro
- actualizacion_estado: Informar de cambio de estado
- encuesta_satisfaccion: Enviar enlace a encuesta

RESPONDE en JSON:
{
  "asunto": "asunto del email",
  "mensaje_email": "contenido HTML del email",
  "mensaje_sms": "versión corta para SMS (max 160 chars)",
  "mensaje_whatsapp": "versión para WhatsApp",
  "mensaje_push": "versión para notificación push (max 100 chars)",
  "canales_recomendados": ["email", "push"]
}`;

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
