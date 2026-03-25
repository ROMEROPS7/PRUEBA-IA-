const AgenteBase = require('./base');
const { loadPrompt } = require('../../utils/promptLoader');

class AgenteClasificador extends AgenteBase {
  constructor(client, modelo) {
    super(client, modelo, 'clasificador');
  }

  async ejecutar(input) {
    const systemPrompt = loadPrompt('clasificador');

    const respuesta = await this.llamarIA(systemPrompt, `
SINIESTRO:
- Descripción: ${input.descripcion}
- Tipo declarado por cliente: ${input.tipo_declarado}
- Ramo de la póliza: ${input.poliza?.ramo}
- Subramo: ${input.poliza?.subramo}
- Coberturas: ${JSON.stringify(input.poliza?.coberturas)}
- Datos de recepción: ${JSON.stringify(input.recepcion)}
    `);

    const output = this.parsearJSON(respuesta.texto) || {
      tipo_final: input.tipo_declarado,
      confianza_clasificacion: 0.8,
      prioridad: 'media',
      complejidad: 'moderada',
      agentes_requeridos: ['antifraude', 'valorador', 'legal'],
      estimacion_tiempo_resolucion: '24-48 horas'
    };

    return { output, razonamiento: respuesta.texto, tokens: respuesta.tokens, coste: respuesta.coste };
  }
}

module.exports = AgenteClasificador;
