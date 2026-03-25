const AgenteBase = require('./base');
const { loadPrompt } = require('../../utils/promptLoader');

class AgentePeritoVirtual extends AgenteBase {
  constructor(client, modelo) { super(client, modelo, 'perito_virtual'); }

  async ejecutar(input) {
    const systemPrompt = loadPrompt('perito_virtual');

    const respuesta = await this.llamarIA(systemPrompt, JSON.stringify(input));
    const output = this.parsearJSON(respuesta.texto) || {
      informe: { descripcion_danos: input.siniestro?.descripcion, coherencia_declaracion: 0.7 },
      requiere_perito_presencial: true,
      motivo_presencial: 'Documentación insuficiente para valoración remota completa'
    };
    return { output, razonamiento: respuesta.texto, tokens: respuesta.tokens, coste: respuesta.coste };
  }
}
module.exports = AgentePeritoVirtual;
