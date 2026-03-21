const AgenteBase = require('../../src/agents/specialized/base');

describe('AgenteBase', () => {
  let agente;

  beforeEach(() => {
    agente = new AgenteBase(null, 'claude-sonnet-4-20250514', 'test');
  });

  describe('parsearJSON', () => {
    test('parsea JSON directo', () => {
      const result = agente.parsearJSON('{"clave": "valor"}');
      expect(result).toEqual({ clave: 'valor' });
    });

    test('extrae JSON de bloques markdown', () => {
      const result = agente.parsearJSON('Aquí va mi análisis:\n```json\n{"nivel": "bajo", "score": 0.2}\n```\nEso es todo.');
      expect(result).toEqual({ nivel: 'bajo', score: 0.2 });
    });

    test('extrae JSON embebido en texto', () => {
      const result = agente.parsearJSON('El resultado es: {"estado": "ok", "valor": 42} fin.');
      expect(result).toEqual({ estado: 'ok', valor: 42 });
    });

    test('devuelve null para texto sin JSON', () => {
      const result = agente.parsearJSON('Esto no tiene JSON en absoluto');
      expect(result).toBeNull();
    });

    test('maneja JSON complejo anidado', () => {
      const json = {
        valoracion: { importe: 1500, desglose: [{ concepto: 'chapa', importe: 800 }] },
        confianza: 0.9
      };
      const result = agente.parsearJSON(JSON.stringify(json));
      expect(result).toEqual(json);
    });
  });

  describe('_calcularCoste', () => {
    test('calcula coste correctamente', () => {
      const coste = agente._calcularCoste({ input_tokens: 1000, output_tokens: 500 });
      expect(coste).toBeGreaterThan(0);
      expect(typeof coste).toBe('number');
    });

    test('devuelve 0 sin usage', () => {
      expect(agente._calcularCoste(null)).toBe(0);
      expect(agente._calcularCoste(undefined)).toBe(0);
    });
  });
});
