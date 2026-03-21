const { schemas } = require('../../src/middleware/validation');

describe('Validation Schemas', () => {
  describe('login', () => {
    test('acepta datos válidos', () => {
      const { error } = schemas.login.validate({ email: 'test@test.com', password: 'password123' });
      expect(error).toBeUndefined();
    });

    test('rechaza email inválido', () => {
      const { error } = schemas.login.validate({ email: 'not-email', password: 'password123' });
      expect(error).toBeDefined();
    });

    test('rechaza sin password', () => {
      const { error } = schemas.login.validate({ email: 'test@test.com' });
      expect(error).toBeDefined();
    });
  });

  describe('crearSiniestro', () => {
    const valid = {
      tipo: 'auto_colision',
      descripcion: 'Colisión por alcance en la M-30 a la altura de la salida 12',
      fecha_ocurrencia: '2024-06-15T10:30:00Z',
      lugar_ocurrencia: 'M-30, Madrid',
      canal_entrada: 'web'
    };

    test('acepta siniestro válido', () => {
      const { error } = schemas.crearSiniestro.validate(valid);
      expect(error).toBeUndefined();
    });

    test('rechaza tipo inválido', () => {
      const { error } = schemas.crearSiniestro.validate({ ...valid, tipo: 'tipo_inventado' });
      expect(error).toBeDefined();
    });

    test('rechaza descripción demasiado corta', () => {
      const { error } = schemas.crearSiniestro.validate({ ...valid, descripcion: 'corta' });
      expect(error).toBeDefined();
    });

    test('rechaza fecha en el futuro', () => {
      const { error } = schemas.crearSiniestro.validate({ ...valid, fecha_ocurrencia: '2030-01-01T00:00:00Z' });
      expect(error).toBeDefined();
    });

    test('acepta sin campos opcionales', () => {
      const { error } = schemas.crearSiniestro.validate({ tipo: 'negocio_agua', descripcion: 'Rotura de tubería principal en el local' });
      expect(error).toBeUndefined();
    });

    test('acepta todos los tipos de auto', () => {
      const tipos = ['auto_colision', 'auto_robo', 'auto_incendio', 'auto_cristales', 'auto_asistencia'];
      tipos.forEach(tipo => {
        const { error } = schemas.crearSiniestro.validate({ tipo, descripcion: 'Descripción del siniestro válida' });
        expect(error).toBeUndefined();
      });
    });

    test('acepta todos los tipos de negocio', () => {
      const tipos = ['negocio_agua', 'negocio_incendio', 'negocio_robo', 'negocio_responsabilidad', 'negocio_danos_electricos', 'negocio_perdida_beneficios'];
      tipos.forEach(tipo => {
        const { error } = schemas.crearSiniestro.validate({ tipo, descripcion: 'Descripción del siniestro válida' });
        expect(error).toBeUndefined();
      });
    });
  });

  describe('actualizarSiniestro', () => {
    test('acepta cambio de estado válido', () => {
      const { error } = schemas.actualizarSiniestro.validate({ estado: 'aprobado', importe_aprobado: 1500 });
      expect(error).toBeUndefined();
    });

    test('rechaza estado inválido', () => {
      const { error } = schemas.actualizarSiniestro.validate({ estado: 'estado_fake' });
      expect(error).toBeDefined();
    });

    test('rechaza satisfacción fuera de rango', () => {
      const { error } = schemas.actualizarSiniestro.validate({ satisfaccion_cliente: 15 });
      expect(error).toBeDefined();
    });
  });

  describe('registro', () => {
    test('acepta registro válido', () => {
      const { error } = schemas.registro.validate({
        email: 'nuevo@test.com',
        password: 'Password1',
        nombre: 'Juan',
        apellidos: 'García'
      });
      expect(error).toBeUndefined();
    });

    test('rechaza password débil', () => {
      const { error } = schemas.registro.validate({
        email: 'nuevo@test.com',
        password: 'soloMinusculas',
        nombre: 'Juan'
      });
      expect(error).toBeDefined();
    });
  });
});
