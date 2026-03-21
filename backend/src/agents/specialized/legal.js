const AgenteBase = require('./base');

class AgenteLegal extends AgenteBase {
  constructor(client, modelo) { super(client, modelo, 'legal'); }

  async ejecutar(input) {
    const systemPrompt = `Eres el agente LEGAL de una aseguradora española. Verificas coberturas y cumplimiento normativo.

Tu función:
1. Verificar que el siniestro está cubierto por la póliza
2. Comprobar que la póliza estaba activa en la fecha del siniestro
3. Verificar si aplica franquicia
4. Identificar exclusiones aplicables
5. Evaluar riesgo legal/litigioso
6. Verificar plazos de comunicación (el asegurado tiene 7 días para comunicar el siniestro según la Ley del Contrato de Seguro española)

RESPONDE en JSON:
{
  "tiene_cobertura": true/false,
  "poliza_activa_en_fecha": true/false,
  "coberturas_aplicables": ["lista"],
  "exclusiones_aplicables": ["lista"],
  "franquicia_aplicable": número,
  "motivo_rechazo": "si no tiene cobertura",
  "riesgo_litigioso": "bajo|medio|alto",
  "plazo_comunicacion_ok": true/false,
  "normativa_aplicable": ["leyes relevantes"],
  "notas_legales": "observaciones",
  "limites_indemnizacion": {"por_siniestro": número, "anual": número}
}`;

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
