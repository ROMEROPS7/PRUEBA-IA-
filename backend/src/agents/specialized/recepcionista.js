const AgenteBase = require('./base');
const { loadPrompt } = require('../../utils/promptLoader');

class AgenteRecepcionista extends AgenteBase {
  constructor(client, modelo) {
    super(client, modelo, 'recepcionista');
  }

  async ejecutar(input) {
    const systemPrompt = loadPrompt('recepcionista');

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
