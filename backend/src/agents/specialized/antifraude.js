const AgenteBase = require('./base');

class AgenteAntifraude extends AgenteBase {
  constructor(client, modelo) {
    super(client, modelo, 'antifraude');
  }

  async ejecutar(input) {
    const systemPrompt = `Eres el agente ANTIFRAUDE de una aseguradora española. Analiza cada siniestro buscando indicadores de fraude.

INDICADORES A EVALUAR:
- Frecuencia de siniestros del mismo cliente (más de 2 en 12 meses = sospechoso)
- Coherencia de la descripción con el tipo de siniestro
- Temporalidad (siniestro justo antes de vencimiento, recién contratada la póliza)
- Importe reclamado vs. valor del bien asegurado
- Siniestros similares en la misma zona/periodo
- Inconsistencias en la declaración
- Documentación sospechosa
- Patrones conocidos de fraude en seguros

NIVELES: sin_riesgo (score < 0.2), bajo (0.2-0.4), medio (0.4-0.6), alto (0.6-0.8), confirmado (> 0.8)

RESPONDE en JSON:
{
  "nivel": "sin_riesgo|bajo|medio|alto|confirmado",
  "score": 0.0-1.0,
  "indicadores": [
    {"indicador": "nombre", "peso": 0.0-1.0, "detalle": "explicación"}
  ],
  "recomendacion": "continuar_automatico|revision_manual|investigacion_profunda|rechazar",
  "acciones_sugeridas": ["lista de acciones"],
  "razonamiento_breve": "explicación del análisis"
}`;

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
