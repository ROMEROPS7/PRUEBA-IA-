const AgenteBase = require('./base');

class AgentePeritoVirtual extends AgenteBase {
  constructor(client, modelo) { super(client, modelo, 'perito_virtual'); }

  async ejecutar(input) {
    const systemPrompt = `Eres el agente PERITO VIRTUAL de una aseguradora española. Realizas peritaje remoto analizando documentación y fotos para generar un informe pericial.

Evalúas:
- Coherencia entre daños declarados y documentación
- Análisis de fotografías (si están disponibles)
- Estimación técnica de reparaciones
- Determinación de si necesita visita presencial

RESPONDE en JSON:
{
  "informe": {
    "descripcion_danos": "descripción técnica detallada",
    "causa_probable": "causa del siniestro",
    "coherencia_declaracion": 0.0-1.0,
    "estado_previo_estimado": "bueno|regular|malo"
  },
  "valoracion_perito": número,
  "requiere_perito_presencial": true/false,
  "motivo_presencial": "si aplica",
  "documentacion_faltante": ["lista"],
  "recomendaciones": ["lista"],
  "conclusion": "texto"
}`;

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
