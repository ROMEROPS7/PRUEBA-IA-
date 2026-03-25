const AgenteBase = require('./base');
const { loadPrompt } = require('../../utils/promptLoader');

class AgenteAntifraude extends AgenteBase {
  constructor(client, modelo) {
    super(client, modelo, 'antifraude');
  }

  async ejecutar(input) {
    const systemPrompt = loadPrompt('antifraude');

    const historialResumen = (input.historial || []).map(s => ({
      fecha: s.created_at,
      tipo: s.tipo,
      importe: s.valoracion_final,
      estado: s.estado
    }));

    const respuesta = await this.llamarIA(systemPrompt, `
SINIESTRO ACTUAL:
- Descripción: ${input.siniestro?.descripcion}
- Tipo: ${input.clasificacion?.tipo_final || input.siniestro?.tipo}
- Fecha ocurrencia: ${input.siniestro?.fecha_ocurrencia}
- Canal entrada: ${input.siniestro?.canal_entrada}

PÓLIZA:
- Número: ${input.poliza?.numero_poliza}
- Fecha inicio: ${input.poliza?.fecha_inicio}
- Fecha fin: ${input.poliza?.fecha_fin}
- Capital asegurado: ${input.poliza?.capital_asegurado}€
- Prima anual: ${input.poliza?.prima_anual}€

CLIENTE:
- Nombre: ${input.cliente?.nombre} ${input.cliente?.apellidos}
- Fecha alta: ${input.cliente?.created_at}

HISTORIAL DE SINIESTROS DEL CLIENTE (últimos 10):
${historialResumen.length > 0 ? JSON.stringify(historialResumen) : 'Sin siniestros previos'}
    `);

    const output = this.parsearJSON(respuesta.texto) || {
      nivel: 'sin_riesgo',
      score: 0.1,
      indicadores: [],
      recomendacion: 'continuar_automatico',
      acciones_sugeridas: [],
      razonamiento_breve: 'No se detectan indicadores de fraude significativos.'
    };

    return { output, razonamiento: respuesta.texto, tokens: respuesta.tokens, coste: respuesta.coste };
  }
}

module.exports = AgenteAntifraude;
