const { generarNumeroExpediente, sanitizar, respuestaPaginada, encriptarDato, desencriptarDato } = require('../../src/utils/helpers');

describe('Helpers', () => {
  describe('generarNumeroExpediente', () => {
    test('genera formato correcto para auto', () => {
      const num = generarNumeroExpediente('auto_colision');
      expect(num).toMatch(/^SIN-\d{4}-AUT-\d{5}$/);
    });

    test('genera formato correcto para negocio', () => {
      const num = generarNumeroExpediente('negocio_agua');
      expect(num).toMatch(/^SIN-\d{4}-NEG-\d{5}$/);
    });

    test('genera formato genérico para tipo desconocido', () => {
      const num = generarNumeroExpediente('otro');
      expect(num).toMatch(/^SIN-\d{4}-GEN-\d{5}$/);
    });

    test('genera números únicos', () => {
      const nums = new Set(Array.from({ length: 100 }, () => generarNumeroExpediente('auto_colision')));
      expect(nums.size).toBeGreaterThan(90); // Alta probabilidad de unicidad
    });
  });

  describe('sanitizar', () => {
    test('escapa caracteres HTML', () => {
      expect(sanitizar('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    test('devuelve non-strings sin cambiar', () => {
      expect(sanitizar(123)).toBe(123);
      expect(sanitizar(null)).toBe(null);
    });

    test('texto normal no cambia', () => {
      expect(sanitizar('Hola mundo')).toBe('Hola mundo');
    });
  });

  describe('respuestaPaginada', () => {
    test('calcula paginación correctamente', () => {
      const result = respuestaPaginada([1, 2, 3], 50, 1, 20);
      expect(result.pagination.total).toBe(50);
      expect(result.pagination.total_pages).toBe(3);
      expect(result.pagination.has_next).toBe(true);
      expect(result.pagination.has_prev).toBe(false);
    });

    test('última página no tiene next', () => {
      const result = respuestaPaginada([1], 50, 3, 20);
      expect(result.pagination.has_next).toBe(false);
      expect(result.pagination.has_prev).toBe(true);
    });
  });

  describe('encriptación', () => {
    beforeAll(() => {
      process.env.ENCRYPTION_KEY = 'test-key-32-characters-long!!!!';
    });

    test('encripta y desencripta correctamente', () => {
      const original = 'ES1234567890123456789012';
      const encrypted = encriptarDato(original);
      expect(encrypted).not.toBe(original);
      expect(encrypted).toContain(':');
      const decrypted = desencriptarDato(encrypted);
      expect(decrypted).toBe(original);
    });

    test('devuelve null/undefined sin cambiar', () => {
      expect(encriptarDato(null)).toBeNull();
      expect(encriptarDato(undefined)).toBeUndefined();
    });
  });
});
