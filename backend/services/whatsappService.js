const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet } = require('../database/db');

// En produccion: const twilio = require('twilio');

const whatsappService = {
  /**
   * Inicializa el cliente de Twilio
   * En produccion descomentar y configurar credenciales
   */
  _getClient() {
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // if (!accountSid || !authToken) throw new Error('Credenciales Twilio no configuradas');
    // return require('twilio')(accountSid, authToken);
    return null; // Modo demo
  },

  /**
   * Envia un mensaje de WhatsApp al cliente
   */
  async enviarMensaje(telefono, contenido, siniestroId, clienteId) {
    try {
      const client = this._getClient();

      if (client) {
        // Produccion: enviar via Twilio
        // const mensaje = await client.messages.create({
        //   from: process.env.TWILIO_WHATSAPP_NUMBER,
        //   to: `whatsapp:+34${telefono.replace(/\s/g, '')}`,
        //   body: contenido,
        // });
        // console.log('WhatsApp enviado:', mensaje.sid);
      }

      // Registrar en base de datos
      const id = uuidv4();
      await dbRun(`INSERT INTO mensajes_whatsapp (id, siniestro_id, cliente_id, telefono, direccion, contenido, estado)
        VALUES (?,?,?,?,?,?,?)`,
        [id, siniestroId, clienteId, telefono, 'saliente', contenido, 'enviado']);

      return { id, estado: 'enviado', contenido };
    } catch (err) {
      console.error('Error enviando WhatsApp:', err);
      throw err;
    }
  },

  /**
   * Procesa un mensaje entrante de WhatsApp
   * Genera respuesta automatica con IA
   */
  async procesarMensajeEntrante(telefono, contenido, mediaUrl) {
    try {
      // Buscar cliente por telefono
      const cliente = await dbGet("SELECT * FROM clientes WHERE telefono = ? OR telefono = ?",
        [telefono, telefono.replace(/\s/g, '')]);

      let respuesta;
      const contenidoLower = contenido.toLowerCase();

      if (!cliente) {
        respuesta = 'Hola, soy el asistente IA de SegurosAI. No hemos encontrado tu numero en nuestro sistema. Por favor, indica tu numero de poliza para ayudarte.';
      } else if (contenidoLower.includes('siniestro') || contenidoLower.includes('accidente') || contenidoLower.includes('robo') || contenidoLower.includes('dano') || contenidoLower.includes('roto')) {
        respuesta = `Hola ${cliente.nombre.split(' ')[0]}, lamento lo ocurrido. He abierto un parte automaticamente. ¿Puedes enviarnos fotos de los danos y tu ubicacion?`;
      } else if (contenidoLower.includes('estado') || contenidoLower.includes('expediente') || contenidoLower.includes('como va')) {
        const ultimoSiniestro = await dbGet('SELECT * FROM siniestros WHERE cliente_id = ? ORDER BY fecha_creacion DESC LIMIT 1', [cliente.id]);
        if (ultimoSiniestro) {
          respuesta = `Tu expediente ${ultimoSiniestro.expediente} esta en estado: ${ultimoSiniestro.estado}. ${ultimoSiniestro.perito_id ? 'Tienes un perito asignado.' : 'Estamos asignando un perito.'} ¿Necesitas algo mas?`;
        } else {
          respuesta = `Hola ${cliente.nombre.split(' ')[0]}, no tienes expedientes abiertos actualmente. ¿En que puedo ayudarte?`;
        }
      } else if (contenidoLower.includes('gracias') || contenidoLower.includes('perfecto') || contenidoLower.includes('ok')) {
        respuesta = 'De nada, estamos aqui 24/7 para ayudarte. ¿Necesitas algo mas?';
      } else if (contenidoLower.includes('hablar') || contenidoLower.includes('persona') || contenidoLower.includes('humano')) {
        respuesta = 'Entiendo, voy a transferirte a un gestor humano. Te contactara en los proximos minutos. ¿Es urgente?';
      } else {
        respuesta = `Hola ${cliente ? cliente.nombre.split(' ')[0] : ''}, soy el asistente IA de SegurosAI. Puedo ayudarte con:\n- Abrir un nuevo siniestro\n- Consultar el estado de tu expediente\n- Enviar documentacion\n¿En que puedo ayudarte?`;
      }

      // Registrar mensaje entrante
      const idEntrante = uuidv4();
      await dbRun(`INSERT INTO mensajes_whatsapp (id, cliente_id, telefono, direccion, contenido, tipo_contenido, respuesta_ia)
        VALUES (?,?,?,?,?,?,?)`,
        [idEntrante, cliente?.id, telefono, 'entrante', contenido, mediaUrl ? 'imagen' : 'texto', respuesta]);

      // Enviar respuesta
      if (cliente) {
        await this.enviarMensaje(telefono, respuesta, null, cliente.id);
      }

      return { mensaje_id: idEntrante, respuesta, cliente: cliente?.nombre };
    } catch (err) {
      console.error('Error procesando WhatsApp entrante:', err);
      throw err;
    }
  },

  /**
   * Enviar notificacion de actualizacion de siniestro
   */
  async notificarActualizacion(siniestroId, mensaje) {
    try {
      const siniestro = await dbGet(`SELECT s.*, c.telefono, c.nombre FROM siniestros s
        JOIN clientes c ON s.cliente_id = c.id WHERE s.id = ?`, [siniestroId]);

      if (!siniestro || !siniestro.telefono) return null;

      const contenido = mensaje || `Hola ${siniestro.nombre.split(' ')[0]}, tu expediente ${siniestro.expediente} ha sido actualizado. Estado actual: ${siniestro.estado}. Accede a tu app para mas detalles.`;

      return await this.enviarMensaje(siniestro.telefono, contenido, siniestroId, siniestro.cliente_id);
    } catch (err) {
      console.error('Error notificando actualizacion:', err);
      throw err;
    }
  },

  /**
   * Webhook handler para Twilio
   */
  async handleWebhook(req, res) {
    try {
      const { From, Body, MediaUrl0 } = req.body;
      const telefono = From?.replace('whatsapp:+34', '').replace('whatsapp:+', '');
      const resultado = await whatsappService.procesarMensajeEntrante(telefono, Body, MediaUrl0);

      // Responder con TwiML
      res.type('text/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${resultado.respuesta}</Message></Response>`);
    } catch (err) {
      console.error('Error en webhook WhatsApp:', err);
      res.status(500).send('<Response><Message>Error procesando tu mensaje. Intenta de nuevo.</Message></Response>');
    }
  },
};

module.exports = whatsappService;
