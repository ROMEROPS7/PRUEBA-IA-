const AgenteBase = require('./base');
const { loadPrompt } = require('../../utils/promptLoader');

class AgenteNegociador extends AgenteBase {
  constructor(client, modelo) { super(client, modelo, 'negociador'); }

  async ejecutar(input) {
    const systemPrompt = loadPrompt('negociador');

    const talleres = (input.talleres || []).map(t => ({
      id: t.id, nombre: t.nombre, provincia: t.provincia,
      concertado: t.concertado, descuento: t.descuento_concertado,
      valoracion: t.valoracion_media, especialidades: t.especialidades
    }));

    const respuesta = await this.llamarIA(systemPrompt, `
VALORACIÓN DEL SINIESTRO: ${input.valoracion?.importe_estimado}€
DESGLOSE: ${JSON.stringify(input.valoracion?.desglose)}
TALLERES DISPONIBLES: ${JSON.stringify(talleres)}
TIPO SINIESTRO: ${input.siniestro?.tipo}
    `);

    const output = this.parsearJSON(respuesta.texto) || {
      taller_seleccionado: talleres[0] ? { id: talleres[0].id, nombre: talleres[0].nombre } : null,
      importe_negociado: input.valoracion?.importe_estimado || 0,
      descuento_aplicado: 0
    };
    return { output, razonamiento: respuesta.texto, tokens: respuesta.tokens, coste: respuesta.coste };
  }
}
module.exports = AgenteNegociador;
