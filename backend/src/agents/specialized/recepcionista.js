const AgenteBase = require('./base');

class AgenteRecepcionista extends AgenteBase {
  constructor(client, modelo) {
    super(client, modelo, 'recepcionista');
  }

  async ejecutar(input) {
    const systemPrompt = `Eres el agente RECEPCIONISTA de una aseguradora española. Tu función es:
1. Verificar que el cliente tiene una póliza activa
2. Extraer los datos clave del siniestro de la descripción
3. Verificar que la fecha y lugar son coherentes
4. Identificar la urgencia inicial
5. Generar un resumen estructurado

RESPONDE SIEMPRE en JSON con esta estructura:
{
  "poliza_verificada": true/false,
  "datos_extraidos": {
    "que_paso": "resumen breve",
    "cuando": "fecha/hora aproximada",
    "donde": "lugar",
    "danos_declarados": ["lista de daños"],
    "terceros_implicados": true/false,
    "lesionados": true/false,
    "servicios_emergencia": true/false
  },
  "urgencia": "baja|media|alta|urgente",
  "documentos_necesarios": ["lista de documentos que necesitamos"],
  "mensaje_cliente": "Mensaje empático y profesional para el cliente confirmando la recepción",
  "alertas": ["cualquier inconsistencia o dato faltante"]
}`;

    const respuesta = await this.llamarIA(systemPrompt, `
DATOS DEL SINIESTRO:
- Descripción: ${input.descripcion}
- Canal de entrada: ${input.canal}
- Cliente: ${input.cliente?.nombre} ${input.cliente?.apellidos} (DNI: ${input.cliente?.dni_nif})
- Póliza: ${input.poliza?.numero_poliza} (Ramo: ${input.poliza?.ramo}, Activa: ${input.poliza?.activa})
- Coberturas: ${JSON.stringify(input.poliza?.coberturas)}
- Bien asegurado: ${JSON.stringify(input.poliza?.datos_bien_asegurado)}
    `);

    const output = this.parsearJSON(respuesta.texto) || {
      poliza_verificada: !!input.poliza?.activa,
      datos_extraidos: { que_paso: input.descripcion },
      urgencia: 'media',
      documentos_necesarios: ['fotografías de daños', 'parte amistoso'],
      mensaje_cliente: 'Hemos recibido su parte de siniestro. Un gestor se pondrá en contacto con usted.',
      alertas: []
    };

    return { output, razonamiento: respuesta.texto, tokens: respuesta.tokens, coste: respuesta.coste };
  }
}

module.exports = AgenteRecepcionista;
