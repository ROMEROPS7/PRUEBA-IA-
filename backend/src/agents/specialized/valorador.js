const AgenteBase = require('./base');

class AgenteValorador extends AgenteBase {
  constructor(client, modelo) {
    super(client, modelo, 'valorador');
  }

  async ejecutar(input) {
    const systemPrompt = `Eres el agente VALORADOR de siniestros de una aseguradora española. Tu función es estimar el coste de los daños.

Para SINIESTROS DE AUTO evalúas:
- Daños en carrocería (chapa, pintura, piezas)
- Daños mecánicos
- Cristales
- Electrónica
- Siniestro total vs reparable (si reparación > 75% valor = siniestro total)
- Valor venal del vehículo

Para SINIESTROS DE NEGOCIO evalúas:
- Daños materiales al local/edificio
- Daños al contenido/mercancía/maquinaria
- Pérdida de beneficios (días de cierre × facturación diaria media)
- Responsabilidad civil frente a terceros
- Costes de limpieza/rehabilitación

Usa precios de mercado español actualizados. Sé preciso y justifica cada partida.

RESPONDE en JSON:
{
  "importe_estimado": número,
  "desglose": [
    {"concepto": "nombre", "importe": número, "justificacion": "texto"}
  ],
  "confianza_valoracion": 0.0-1.0,
  "requiere_reparacion": true/false,
  "siniestro_total": true/false,
  "requiere_perito_presencial": true/false,
  "motivo_perito": "si aplica",
  "rango_estimacion": {"minimo": número, "maximo": número},
  "notas": "observaciones adicionales"
}`;

    const respuesta = await this.llamarIA(systemPrompt, `
SINIESTRO:
- Tipo: ${input.clasificacion?.tipo_final || input.siniestro?.tipo}
- Descripción: ${input.siniestro?.descripcion}
- Fecha: ${input.siniestro?.fecha_ocurrencia}
- Lugar: ${input.siniestro?.lugar_ocurrencia}

PÓLIZA:
- Ramo: ${input.poliza?.ramo}
- Capital asegurado: ${input.poliza?.capital_asegurado}€
- Franquicia: ${input.poliza?.franquicia}€
- Coberturas: ${JSON.stringify(input.poliza?.coberturas)}
- Bien asegurado: ${JSON.stringify(input.poliza?.datos_bien_asegurado)}

DOCUMENTOS ADJUNTOS: ${input.documentos?.length || 0} documentos
${(input.documentos || []).map(d => `- ${d.nombre} (${d.categoria}): ${d.analisis_ia ? 'Analizado por IA' : 'Pendiente'}`).join('\n')}
    `);

    const output = this.parsearJSON(respuesta.texto) || {
      importe_estimado: 0,
      desglose: [],
      confianza_valoracion: 0.5,
      requiere_reparacion: true,
      siniestro_total: false,
      requiere_perito_presencial: true,
      rango_estimacion: { minimo: 0, maximo: 0 }
    };

    return { output, razonamiento: respuesta.texto, tokens: respuesta.tokens, coste: respuesta.coste };
  }
}

module.exports = AgenteValorador;
