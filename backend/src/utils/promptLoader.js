/**
 * Cargador de prompts para agentes IA
 *
 * Los prompts se cargan desde variables de entorno con el formato:
 *   PROMPT_<AGENTE_EN_MAYUSCULAS>
 *
 * Si la variable de entorno no está definida, se lanza un error para
 * evitar que el agente opere sin su prompt configurado.
 *
 * Para configurar localmente, copia prompts/prompts.example.json y
 * establece cada prompt en tu archivo .env como PROMPT_RECEPCIONISTA, etc.
 */

/**
 * Devuelve el prompt del agente indicado leyendo la variable de entorno correspondiente.
 * @param {string} agentName - Nombre del agente (e.g. 'recepcionista', 'clasificador')
 * @returns {string} El texto del system prompt
 * @throws {Error} Si la variable de entorno no está definida
 */
function loadPrompt(agentName) {
  const envKey = `PROMPT_${agentName.toUpperCase()}`;
  const prompt = process.env[envKey];
  if (!prompt) {
    throw new Error(
      `Falta la variable de entorno "${envKey}" para el agente "${agentName}". ` +
      'Consulta prompts/prompts.example.json para ver la estructura esperada.'
    );
  }
  return prompt;
}

module.exports = { loadPrompt };
