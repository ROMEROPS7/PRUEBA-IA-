const AgenteBase = require('./base');

class AgenteClasificador extends AgenteBase {
  constructor(client, modelo) {
    super(client, modelo, 'clasificador');
  }

  async ejecutar(input) {
    const systemPrompt = `Eres el agente CLASIFICADOR de siniestros de una aseguradora española. Tu función es:
1. Determinar el tipo exacto de siniestro según las categorías disponibles
2. Asignar la prioridad correcta
3. Estimar la complejidad del caso
4. Determinar qué agentes necesitan intervenir

TIPOS VÁLIDOS (auto): auto_colision, auto_robo, auto_incendio, auto_cristales, auto_asistencia
TIPOS VÁLIDOS (negocio): negocio_agua, negocio_incendio, negocio_robo, negocio_responsabilidad, negocio_danos_electricos, negocio_perdida_beneficios
PRIORIDADES: baja, media, alta, urgente, critica

RESPONDE en JSON:
{
  "tipo_final": "tipo_siniestro",
  "confianza_clasificacion": 0.0-1.0,
  "prioridad": "baja|media|alta|urgente|critica",
  "complejidad": "simple|moderada|compleja|muy_compleja",
  "agentes_requeridos": ["lista de agentes que deben intervenir"],
  "subcategorias": ["detalles adicionales"],
  "estimacion_tiempo_resolucion": "horas o días estimados",
  "factores_prioridad": ["razones de la prioridad asignada"],
  "riesgo_litigioso": "bajo|medio|alto"
}`;

    const respuesta = await this.llamarIA(systemPrompt, `
SINIESTRO:
- Descripción: ${input.descripcion}
- Tipo declarado por cliente: ${input.tipo_declarado}
- Ramo de la póliza: ${input.poliza?.ramo}
- Subramo: ${input.poliza?.subramo}
- Coberturas: ${JSON.stringify(input.poliza?.coberturas)}
- Datos de recepción: ${JSON.stringify(input.recepcion)}
    `);

    const output = this.parsearJSON(respuesta.texto) || {
      tipo_final: input.tipo_declarado,
      confianza_clasificacion: 0.8,
      prioridad: 'media',
      complejidad: 'moderada',
      agentes_requeridos: ['antifraude', 'valorador', 'legal'],
      estimacion_tiempo_resolucion: '24-48 horas'
    };

    return { output, razonamiento: respuesta.texto, tokens: respuesta.tokens, coste: respuesta.coste };
  }
}

module.exports = AgenteClasificador;
