const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet } = require('../database/db');

// En produccion:
// const twilio = require('twilio');
// const fetch = require('node-fetch'); // o globalThis.fetch en Node 18+

const voiceService = {
  /**
   * Genera audio con voz sintetica via ElevenLabs
   * En produccion: conecta a la API real
   */
  async generarVoz(texto, opciones = {}) {
    const { idioma = 'es', velocidad = 1.0, voz } = opciones;

    // En produccion: llamar a ElevenLabs API
    // const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'xi-api-key': process.env.ELEVENLABS_API_KEY,
    //   },
    //   body: JSON.stringify({
    //     text: texto,
    //     model_id: 'eleven_multilingual_v2',
    //     voice_settings: { stability: 0.75, similarity_boost: 0.85, speed: velocidad },
    //   }),
    // });
    // return response.buffer(); // Audio MP3

    console.log(`[VoiceService] Generando voz para: "${texto.substring(0, 50)}..."`);
    return { texto, idioma, generado: true, timestamp: new Date().toISOString() };
  },

  /**
   * Procesa una llamada entrante con IA
   * Genera TwiML para Twilio
   */
  generarRespuestaLlamada(mensaje, opciones = {}) {
    const { recoger_input = false, timeout = 5, num_digitos } = opciones;

    // TwiML para Twilio
    let twiml = '<?xml version="1.0" encoding="UTF-8"?><Response>';
    twiml += `<Say language="es-ES" voice="Polly.Lucia">${mensaje}</Say>`;

    if (recoger_input) {
      twiml += `<Gather input="speech dtmf" timeout="${timeout}" language="es-ES"`;
      if (num_digitos) twiml += ` numDigits="${num_digitos}"`;
      twiml += ` action="/api/voz/procesar-input">`;
      twiml += `<Say language="es-ES" voice="Polly.Lucia">Por favor, hable despues del tono o pulse una opcion.</Say>`;
      twiml += '</Gather>';
    }

    twiml += '</Response>';
    return twiml;
  },

  /**
   * Script de llamada automatica IA para atencion de siniestros
   */
  getScriptLlamada() {
    return [
      { paso: 1, tipo: 'saludo', mensaje: 'Buenos dias, soy el asistente de inteligencia artificial de SegurosAI. ¿En que puedo ayudarle?', accion: 'escuchar' },
      { paso: 2, tipo: 'identificacion', mensaje: '¿Puede indicarme su nombre completo o numero de poliza para localizarle en el sistema?', accion: 'escuchar' },
      { paso: 3, tipo: 'tipo_siniestro', mensaje: '¿Que tipo de incidencia ha tenido? ¿Es un accidente de trafico, un problema en su hogar, un tema de salud u otro tipo de siniestro?', accion: 'escuchar' },
      { paso: 4, tipo: 'detalles', mensaje: '¿Puede describir brevemente lo que ha ocurrido? ¿Hay heridos o situacion de emergencia?', accion: 'escuchar' },
      { paso: 5, tipo: 'ubicacion', mensaje: '¿Donde se encuentra ahora mismo? Necesito la direccion o ubicacion aproximada.', accion: 'escuchar' },
      { paso: 6, tipo: 'confirmacion', mensaje: 'Perfecto, he registrado toda la informacion. He abierto un expediente automaticamente. Un perito le contactara en las proximas 2 horas. ¿Necesita asistencia inmediata como una grua?', accion: 'escuchar' },
      { paso: 7, tipo: 'cierre', mensaje: 'Le envio un SMS con el numero de expediente y los datos del perito asignado. ¿Puedo ayudarle en algo mas?', accion: 'escuchar' },
      { paso: 8, tipo: 'despedida', mensaje: 'Muchas gracias por llamar. Que se mejore. Hasta luego.', accion: 'colgar' },
    ];
  },

  /**
   * Registra una llamada en base de datos
   */
  async registrarLlamada(datos) {
    const { siniestroId, clienteId, telefonoOrigen, duracion, tipo, transcripcion, resumenIA, sentimiento } = datos;
    const id = uuidv4();

    await dbRun(`INSERT INTO llamadas (id, siniestro_id, cliente_id, telefono_origen, telefono_destino, duracion_seg, tipo, transcripcion, resumen_ia, sentimiento)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [id, siniestroId, clienteId, telefonoOrigen, process.env.TWILIO_PHONE_NUMBER || '+34900100200', duracion, tipo || 'ia', transcripcion, resumenIA, sentimiento]);

    return { id, registrada: true };
  },

  /**
   * Webhook para Twilio Voice
   */
  async handleLlamadaEntrante(req, res) {
    const { From, CallSid } = req.body || {};
    console.log(`[VoiceService] Llamada entrante: ${From} (${CallSid})`);

    const script = voiceService.getScriptLlamada();
    const twiml = voiceService.generarRespuestaLlamada(script[0].mensaje, { recoger_input: true });

    res.type('text/xml');
    res.send(twiml);
  },

  /**
   * Procesa input de voz/DTMF del cliente
   */
  async handleProcesarInput(req, res) {
    const { SpeechResult, Digits } = req.body || {};
    const input = SpeechResult || Digits || '';
    console.log(`[VoiceService] Input recibido: "${input}"`);

    // En produccion: enviar a Claude para procesamiento NLU
    let respuesta = 'Entendido. He registrado su informacion. Le enviare los datos por SMS.';

    if (input.toLowerCase().includes('grua') || input.toLowerCase().includes('ayuda')) {
      respuesta = 'Entendido, envio una grua a su ubicacion inmediatamente. Llegara en aproximadamente 15 minutos.';
    }

    const twiml = voiceService.generarRespuestaLlamada(respuesta);
    res.type('text/xml');
    res.send(twiml);
  },
};

module.exports = voiceService;
