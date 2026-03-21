const AgenteBase = require('./base');

class AgenteNegociador extends AgenteBase {
  constructor(client, modelo) { super(client, modelo, 'negociador'); }

  async ejecutar(input) {
    const systemPrompt = `Eres el agente NEGOCIADOR de una aseguradora española. Tu función es:
1. Seleccionar el mejor taller/reparador para el siniestro
2. Negociar el mejor precio considerando calidad y descuentos por concertación
3. Priorizar talleres concertados (tienen descuento negociado)
4. Optimizar el coste sin comprometer la calidad

RESPONDE en JSON:
{
  "taller_seleccionado": {"id": "uuid", "nombre": "nombre", "motivo": "razón de selección"},
  "importe_negociado": número,
  "descuento_aplicado": porcentaje,
  "ahorro_vs_valoracion": número,
  "partidas_negociadas": [{"concepto": "x", "original": n, "negociado": n}],
  "alternativas": [{"taller": "nombre", "importe": n}],
  "plazo_reparacion_estimado": "días"
}`;

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
