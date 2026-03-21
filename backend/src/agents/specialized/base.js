/**
 * Clase base para todos los agentes IA
 */
class AgenteBase {
  constructor(client, modelo, nombre) {
    this.client = client;
    this.modelo = modelo;
    this.nombre = nombre;
  }

  async llamarIA(systemPrompt, userMessage, tools = []) {
    const params = {
      model: this.modelo,
      max_tokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: typeof userMessage === 'string' ? userMessage : JSON.stringify(userMessage) }]
    };
    if (tools.length > 0) params.tools = tools;

    const response = await this.client.messages.create(params);

    let textoRespuesta = '';
    let toolUseResults = [];

    for (const block of response.content) {
      if (block.type === 'text') textoRespuesta += block.text;
      if (block.type === 'tool_use') toolUseResults.push(block);
    }

    return {
      texto: textoRespuesta,
      tools: toolUseResults,
      tokens: response.usage?.input_tokens + response.usage?.output_tokens || 0,
      coste: this._calcularCoste(response.usage)
    };
  }

  /**
   * Parsear JSON desde respuesta de IA (robusto)
   */
  parsearJSON(texto) {
    // Intentar extraer JSON de bloques ```json
    const jsonMatch = texto.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[1]); } catch (e) {}
    }
    // Intentar parsear directamente
    try { return JSON.parse(texto); } catch (e) {}
    // Buscar primer { hasta último }
    const start = texto.indexOf('{');
    const end = texto.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      try { return JSON.parse(texto.substring(start, end + 1)); } catch (e) {}
    }
    return null;
  }

  _calcularCoste(usage) {
    if (!usage) return 0;
    // Precios aproximados de Claude Sonnet 4
    const inputCost = (usage.input_tokens || 0) * 0.000003;
    const outputCost = (usage.output_tokens || 0) * 0.000015;
    return parseFloat((inputCost + outputCost).toFixed(6));
  }
}

module.exports = AgenteBase;
