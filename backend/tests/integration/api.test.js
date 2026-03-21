/**
 * Tests de integración para la API
 * Requiere PostgreSQL corriendo con la BD configurada
 * Ejecutar: npm run test:integration
 */

const request = require('supertest');

// Nota: Para ejecutar estos tests necesitas:
// 1. PostgreSQL corriendo
// 2. Variables de entorno configuradas
// 3. Migración y seed ejecutados

describe('API Integration Tests', () => {
  const BASE_URL = process.env.API_URL || 'http://localhost:3001';
  let token = null;
  let siniestroId = null;

  describe('Health Check', () => {
    test('GET /api/health responde correctamente', async () => {
      const res = await request(BASE_URL).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.services).toBeDefined();
    });
  });

  describe('Autenticación', () => {
    test('POST /api/v1/auth/login - login exitoso', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@segurcaixa.demo', password: 'Demo2024!' });
      
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.usuario).toBeDefined();
      expect(res.body.usuario.tipo).toBe('admin_empresa');
      token = res.body.token;
    });

    test('POST /api/v1/auth/login - credenciales incorrectas', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@segurcaixa.demo', password: 'wrongpassword' });
      
      expect(res.status).toBe(401);
    });

    test('GET /api/v1/auth/me - obtener perfil', async () => {
      const res = await request(BASE_URL)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('admin@segurcaixa.demo');
      expect(res.body.empresa).toBeDefined();
    });

    test('rutas protegidas sin token devuelven 401', async () => {
      const res = await request(BASE_URL).get('/api/v1/siniestros');
      expect(res.status).toBe(401);
    });
  });

  describe('Siniestros', () => {
    test('POST /api/v1/siniestros - crear siniestro auto', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/siniestros')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tipo: 'auto_colision',
          descripcion: 'Colisión por alcance en la M-30 a la altura de la salida 12. El vehículo de delante frenó bruscamente y no pude evitar el impacto. Daños en paragolpes delantero y capó.',
          numero_poliza: 'AUT-2024-001234',
          fecha_ocurrencia: '2024-06-15T10:30:00Z',
          lugar_ocurrencia: 'M-30, Madrid, salida 12',
          canal_entrada: 'web'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.numero_expediente).toMatch(/^SIN-\d{4}-AUT-\d{5}$/);
      expect(res.body.estado).toBe('recibido');
      siniestroId = res.body.id;
    });

    test('POST /api/v1/siniestros - crear siniestro negocio', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/siniestros')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tipo: 'negocio_agua',
          descripcion: 'Rotura de tubería principal en el baño del restaurante. El agua ha dañado el suelo, muebles de baño y parte del almacén contiguo. Se ha cortado el suministro de agua.',
          numero_poliza: 'NEG-2024-002345',
          fecha_ocurrencia: '2024-06-20T08:00:00Z',
          lugar_ocurrencia: 'Calle Mayor 15, Madrid',
          canal_entrada: 'telefono'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.numero_expediente).toMatch(/^SIN-\d{4}-NEG-\d{5}$/);
    });

    test('GET /api/v1/siniestros - listar siniestros', async () => {
      const res = await request(BASE_URL)
        .get('/api/v1/siniestros')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.pagination).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET /api/v1/siniestros - filtrar por estado', async () => {
      const res = await request(BASE_URL)
        .get('/api/v1/siniestros?estado=recibido')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      res.body.data.forEach(s => {
        expect(s.estado).toBe('recibido');
      });
    });

    test('GET /api/v1/siniestros/:id - detalle completo', async () => {
      if (!siniestroId) return;
      const res = await request(BASE_URL)
        .get(`/api/v1/siniestros/${siniestroId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(siniestroId);
      expect(res.body.tareas_agente).toBeDefined();
      expect(res.body.documentos).toBeDefined();
      expect(res.body.historial_estados).toBeDefined();
    });

    test('GET /api/v1/siniestros/:id/timeline - timeline', async () => {
      if (!siniestroId) return;
      const res = await request(BASE_URL)
        .get(`/api/v1/siniestros/${siniestroId}/timeline`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('validación rechaza datos inválidos', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/siniestros')
        .set('Authorization', `Bearer ${token}`)
        .send({ tipo: 'tipo_inventado', descripcion: 'corta' });
      
      expect(res.status).toBe(400);
      expect(res.body.detalles).toBeDefined();
    });
  });

  describe('Pólizas', () => {
    test('GET /api/v1/polizas - listar pólizas', async () => {
      const res = await request(BASE_URL)
        .get('/api/v1/polizas')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    test('GET /api/v1/polizas/numero/:numero - buscar por número', async () => {
      const res = await request(BASE_URL)
        .get('/api/v1/polizas/numero/AUT-2024-001234')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.numero_poliza).toBe('AUT-2024-001234');
    });
  });

  describe('Dashboard', () => {
    test('GET /api/v1/dashboard - KPIs', async () => {
      const res = await request(BASE_URL)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.kpis).toBeDefined();
      expect(res.body.distribucion).toBeDefined();
      expect(typeof res.body.kpis.total_siniestros).toBe('number');
    });
  });

  describe('Agentes IA', () => {
    test('GET /api/v1/agentes - estado de agentes', async () => {
      const res = await request(BASE_URL)
        .get('/api/v1/agentes')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].agente).toBeDefined();
    });
  });

  describe('Admin', () => {
    test('GET /api/v1/admin/usuarios - listar usuarios', async () => {
      const res = await request(BASE_URL)
        .get('/api/v1/admin/usuarios')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/v1/admin/audit-log - audit log RGPD', async () => {
      const res = await request(BASE_URL)
        .get('/api/v1/admin/audit-log')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/v1/admin/stats/sistema - stats del sistema', async () => {
      const res = await request(BASE_URL)
        .get('/api/v1/admin/stats/sistema')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.total_usuarios).toBeDefined();
      expect(res.body.total_polizas).toBeDefined();
    });
  });
});
