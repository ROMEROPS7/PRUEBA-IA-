const AgenteBase = require('./base');
const { loadPrompt } = require('../../utils/promptLoader');

class AgenteValorador extends AgenteBase {
  constructor(client, modelo) {
    super(client, modelo, 'valorador');
  }

  async ejecutar(input) {
    const systemPrompt = loadPrompt('valorador');

    const respuesta = await this.llamarIA(systemPrompt, `
SINIESTRO:
- Tipo: ${input.clasificacion?.tipo_final || input.siniestro?.tipo}
- Descripción: ${input.siniestro?.descripcion}
- Fecha: ${input.siniestro?.fecha_ocurrencia}
- Lugar: ${input.siniestro?.lugar_ocurrencia}

PÓLIZA:
- Ramo: ${input.poliza?.ramo}
- Capital asegurado: ${input.poliza?.capital_asegurado}€
- Franquicia: ${input.poliza?.franquicia}€
- Coberturas: ${JSON.stringify(input.poliza?.coberturas)}
- Bien asegurado: ${JSON.stringify(input.poliza?.datos_bien_asegurado)}

DOCUMENTOS ADJUNTOS: ${input.documentos?.length || 0} documentos
${(input.documentos || []).map(d => `- ${d.nombre} (${d.categoria}): ${d.analisis_ia ? 'Analizado por IA' : 'Pendiente'}`).join('\n')}
    `);

    const output = this.parsearJSON(respuesta.texto) || {
      importe_estimado: 0,
      desglose: [],
      confianza_valoracion: 0.5,
      requiere_reparacion: true,
      siniestro_total: false,
      requiere_perito_presencial: true,
      rango_estimacion: { minimo: 0, maximo: 0 }
    };

    return { output, razonamiento: respuesta.texto, tokens: respuesta.tokens, coste: respuesta.coste };
  }
}

module.exports = AgenteValorador;
