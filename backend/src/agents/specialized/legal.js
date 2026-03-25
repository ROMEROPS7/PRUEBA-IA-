const AgenteBase = require('./base');
const { loadPrompt } = require('../../utils/promptLoader');

class AgenteLegal extends AgenteBase {
  constructor(client, modelo) { super(client, modelo, 'legal'); }

  async ejecutar(input) {
    const systemPrompt = loadPrompt('legal');

    const respuesta = await this.llamarIA(systemPrompt, `
SINIESTRO: ${JSON.stringify({ tipo: input.clasificacion?.tipo_final, descripcion: input.siniestro?.descripcion, fecha: input.siniestro?.fecha_ocurrencia, fecha_comunicacion: input.siniestro?.created_at })}
PÓLIZA: ${JSON.stringify({ numero: input.poliza?.numero_poliza, ramo: input.poliza?.ramo, inicio: input.poliza?.fecha_inicio, fin: input.poliza?.fecha_fin, coberturas: input.poliza?.coberturas, franquicia: input.poliza?.franquicia, capital: input.poliza?.capital_asegurado, condiciones: input.poliza?.condiciones_especiales })}
    `);

    const output = this.parsearJSON(respuesta.texto) || {
      tiene_cobertura: true,
      poliza_activa_en_fecha: true,
      coberturas_aplicables: input.poliza?.coberturas || [],
      franquicia_aplicable: input.poliza?.franquicia || 0,
      riesgo_litigioso: 'bajo',
      plazo_comunicacion_ok: true
    };
    return { output, razonamiento: respuesta.texto, tokens: respuesta.tokens, coste: respuesta.coste };
  }
}
module.exports = AgenteLegal;
