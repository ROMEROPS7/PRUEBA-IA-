const AgenteBase = require('./base');
const db = require('../../config/database');
const { v4: uuid } = require('uuid');

class AgentePagos extends AgenteBase {
  constructor(client, modelo) { super(client, modelo, 'pagos'); }

  async ejecutar(input) {
    const systemPrompt = `Eres el agente de PAGOS de una aseguradora española. Tu función es:
1. Verificar que el importe es correcto y está dentro de los límites
2. Determinar el método de pago más adecuado
3. Generar la orden de pago
4. Verificar datos bancarios (formato IBAN español)

RESPONDE en JSON:
{
  "procesado": true/false,
  "importe_a_pagar": número,
  "beneficiario": "nombre",
  "metodo_pago": "transferencia|cheque|compensacion_taller",
  "referencia": "código único",
  "plazo_pago": "días",
  "verificaciones": {
    "importe_correcto": true/false,
    "dentro_limites": true/false,
    "datos_bancarios_ok": true/false
  },
  "notas": "observaciones"
}`;

    const respuesta = await this.llamarIA(systemPrompt, JSON.stringify({
      importe: input.importe,
      cliente: { nombre: input.cliente?.nombre, apellidos: input.cliente?.apellidos },
      tipo_siniestro: input.siniestro?.tipo
    }));

    const output = this.parsearJSON(respuesta.texto) || {
      procesado: true,
      importe_a_pagar: input.importe,
      beneficiario: `${input.cliente?.nombre} ${input.cliente?.apellidos}`,
      metodo_pago: 'transferencia',
      referencia: `PAG-${Date.now()}`,
      plazo_pago: '3-5 días laborables'
    };

    // Registrar pago en DB
    if (output.procesado) {
      await db('pagos').insert({
        id: uuid(),
        siniestro_id: input.siniestro?.id,
        concepto: `Indemnización siniestro ${input.siniestro?.numero_expediente || ''}`,
        importe: output.importe_a_pagar,
        beneficiario: output.beneficiario,
        estado: 'procesando',
        referencia_pago: output.referencia
      });
    }

    return { output, razonamiento: respuesta.texto, tokens: respuesta.tokens, coste: respuesta.coste };
  }
}
module.exports = AgentePagos;
