const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { logger } = require('../../utils/logger');

async function seed() {
  try {
    logger.info('🌱 Sembrando datos de demo...');

    // ========== EMPRESA ==========
    const empresaId = uuid();
    await db('empresas').insert({
      id: empresaId,
      nombre: 'SegurCaixa Adeslas',
      cif: 'A08169294',
      slug: 'segurcaixa-adeslas',
      config: JSON.stringify({
        color_primario: '#00A651',
        color_secundario: '#003B71',
        nombre_corto: 'SegurCaixa'
      }),
      limites_autonomia: JSON.stringify({
        auto_aprobacion_max: 5000,
        requiere_perito_desde: 8000,
        requiere_supervisor_desde: 15000,
        max_auto_pago: 3000
      })
    });

    // ========== USUARIOS ==========
    const hash = await bcrypt.hash('Demo2024!', 12);
    
    const adminId = uuid();
    const gestorId = uuid();
    const peritoId = uuid();
    const tallerId = uuid();
    const clienteIds = [uuid(), uuid(), uuid(), uuid(), uuid()];

    const usuarios = [
      { id: adminId, empresa_id: empresaId, email: 'admin@segurcaixa.demo', password_hash: hash, nombre: 'Carlos', apellidos: 'Martínez López', tipo: 'admin_empresa', telefono: '+34600000001' },
      { id: gestorId, empresa_id: empresaId, email: 'gestor@segurcaixa.demo', password_hash: hash, nombre: 'Ana', apellidos: 'García Fernández', tipo: 'gestor', telefono: '+34600000002' },
      { id: peritoId, empresa_id: empresaId, email: 'perito@segurcaixa.demo', password_hash: hash, nombre: 'Miguel', apellidos: 'Rodríguez Sánchez', tipo: 'perito', telefono: '+34600000003' },
      { id: tallerId, empresa_id: empresaId, email: 'taller@segurcaixa.demo', password_hash: hash, nombre: 'Pedro', apellidos: 'Talleres López', tipo: 'taller', telefono: '+34600000004' },
      { id: clienteIds[0], empresa_id: empresaId, email: 'maria.lopez@demo.com', password_hash: hash, nombre: 'María', apellidos: 'López Hernández', tipo: 'cliente', telefono: '+34612345678', dni_nif: '12345678A' },
      { id: clienteIds[1], empresa_id: empresaId, email: 'juan.garcia@demo.com', password_hash: hash, nombre: 'Juan', apellidos: 'García Ruiz', tipo: 'cliente', telefono: '+34623456789', dni_nif: '23456789B' },
      { id: clienteIds[2], empresa_id: empresaId, email: 'laura.martinez@demo.com', password_hash: hash, nombre: 'Laura', apellidos: 'Martínez Torres', tipo: 'cliente', telefono: '+34634567890', dni_nif: '34567890C' },
      { id: clienteIds[3], empresa_id: empresaId, email: 'antonio.sanchez@demo.com', password_hash: hash, nombre: 'Antonio', apellidos: 'Sánchez Moreno', tipo: 'cliente', telefono: '+34645678901', dni_nif: '45678901D' },
      { id: clienteIds[4], empresa_id: empresaId, email: 'carmen.rodriguez@demo.com', password_hash: hash, nombre: 'Carmen', apellidos: 'Rodríguez Díaz', tipo: 'cliente', telefono: '+34656789012', dni_nif: '56789012E' }
    ];
    await db('usuarios').insert(usuarios);

    // ========== PÓLIZAS ==========
    const polizaIds = [uuid(), uuid(), uuid(), uuid(), uuid(), uuid()];
    const polizas = [
      {
        id: polizaIds[0], empresa_id: empresaId, cliente_id: clienteIds[0],
        numero_poliza: 'AUT-2024-001234', ramo: 'auto', subramo: 'todo_riesgo',
        coberturas: JSON.stringify(['responsabilidad_civil', 'danos_propios', 'robo', 'cristales', 'asistencia_viaje', 'vehiculo_sustitucion']),
        capital_asegurado: 25000, franquicia: 150, prima_anual: 680,
        fecha_inicio: '2024-01-01', fecha_fin: '2025-01-01',
        datos_bien_asegurado: JSON.stringify({ matricula: '1234 ABC', marca: 'Seat', modelo: 'León', anio: 2022, color: 'Gris', bastidor: 'VSSZZZ5FZPR000001' })
      },
      {
        id: polizaIds[1], empresa_id: empresaId, cliente_id: clienteIds[1],
        numero_poliza: 'AUT-2024-005678', ramo: 'auto', subramo: 'terceros_ampliado',
        coberturas: JSON.stringify(['responsabilidad_civil', 'robo', 'cristales', 'asistencia_viaje']),
        capital_asegurado: 18000, franquicia: 300, prima_anual: 420,
        fecha_inicio: '2024-03-15', fecha_fin: '2025-03-15',
        datos_bien_asegurado: JSON.stringify({ matricula: '5678 DEF', marca: 'Volkswagen', modelo: 'Golf', anio: 2020, color: 'Blanco', bastidor: 'WVWZZZ1KZXW000002' })
      },
      {
        id: polizaIds[2], empresa_id: empresaId, cliente_id: clienteIds[2],
        numero_poliza: 'NEG-2024-002345', ramo: 'negocio', subramo: 'comercio',
        coberturas: JSON.stringify(['incendio', 'agua', 'robo', 'responsabilidad_civil', 'danos_electricos', 'perdida_beneficios', 'cristales']),
        capital_asegurado: 150000, franquicia: 500, prima_anual: 1200,
        fecha_inicio: '2024-02-01', fecha_fin: '2025-02-01',
        datos_bien_asegurado: JSON.stringify({ tipo_negocio: 'Restaurante', nombre_comercial: 'La Buena Mesa', direccion: 'Calle Mayor 15, Madrid', superficie_m2: 120, num_empleados: 8 })
      },
      {
        id: polizaIds[3], empresa_id: empresaId, cliente_id: clienteIds[3],
        numero_poliza: 'NEG-2024-003456', ramo: 'negocio', subramo: 'oficinas',
        coberturas: JSON.stringify(['incendio', 'agua', 'robo', 'responsabilidad_civil', 'danos_electricos', 'equipos_electronicos']),
        capital_asegurado: 80000, franquicia: 300, prima_anual: 890,
        fecha_inicio: '2024-05-01', fecha_fin: '2025-05-01',
        datos_bien_asegurado: JSON.stringify({ tipo_negocio: 'Consultoría IT', nombre_comercial: 'TechSoluciones SL', direccion: 'Av. Diagonal 456, Barcelona', superficie_m2: 85, num_empleados: 12 })
      },
      {
        id: polizaIds[4], empresa_id: empresaId, cliente_id: clienteIds[4],
        numero_poliza: 'AUT-2024-009012', ramo: 'auto', subramo: 'todo_riesgo',
        coberturas: JSON.stringify(['responsabilidad_civil', 'danos_propios', 'robo', 'cristales', 'asistencia_viaje']),
        capital_asegurado: 35000, franquicia: 200, prima_anual: 780,
        fecha_inicio: '2024-06-01', fecha_fin: '2025-06-01',
        datos_bien_asegurado: JSON.stringify({ matricula: '9012 GHI', marca: 'BMW', modelo: 'Serie 3', anio: 2023, color: 'Negro', bastidor: 'WBA8E9C50JK000003' })
      },
      {
        id: polizaIds[5], empresa_id: empresaId, cliente_id: clienteIds[0],
        numero_poliza: 'NEG-2024-007890', ramo: 'negocio', subramo: 'comercio',
        coberturas: JSON.stringify(['incendio', 'agua', 'robo', 'responsabilidad_civil', 'cristales']),
        capital_asegurado: 60000, franquicia: 250, prima_anual: 650,
        fecha_inicio: '2024-04-01', fecha_fin: '2025-04-01',
        datos_bien_asegurado: JSON.stringify({ tipo_negocio: 'Peluquería', nombre_comercial: 'Estilo María', direccion: 'Calle Goya 28, Madrid', superficie_m2: 50, num_empleados: 3 })
      }
    ];
    await db('polizas').insert(polizas);

    // ========== TALLERES ==========
    const taller1Id = uuid();
    const taller2Id = uuid();
    await db('talleres').insert([
      { id: taller1Id, empresa_id: empresaId, nombre: 'Talleres López', cif: 'B12345678', direccion: 'Polígono Industrial Norte, Nave 12, Madrid', provincia: 'Madrid', codigo_postal: '28001', telefono: '+34911234567', email: 'info@tallereslopez.demo', especialidades: JSON.stringify(['chapa', 'pintura', 'mecanica']), concertado: true, descuento_concertado: 15, valoracion_media: 4.5, trabajos_realizados: 234 },
      { id: taller2Id, empresa_id: empresaId, nombre: 'AutoReparaciones BCN', cif: 'B87654321', direccion: 'Calle Industria 45, Barcelona', provincia: 'Barcelona', codigo_postal: '08001', telefono: '+34932345678', email: 'info@autoreparaciones.demo', especialidades: JSON.stringify(['chapa', 'pintura', 'electricidad', 'cristales']), concertado: true, descuento_concertado: 12, valoracion_media: 4.3, trabajos_realizados: 189 }
    ]);

    // ========== PERITOS ==========
    await db('peritos').insert({
      id: uuid(), usuario_id: peritoId,
      numero_colegiado: 'PER-28-1234',
      especialidades: JSON.stringify(['auto', 'negocio']),
      zona_cobertura: JSON.stringify({ provincias: ['Madrid', 'Toledo', 'Guadalajara'] }),
      capacidad_maxima: 25, valoracion_media: 4.7, siniestros_gestionados: 456
    });

    // ========== CONFIGURACIÓN DE AGENTES ==========
    const agentes = [
      { agente: 'recepcionista', parametros: JSON.stringify({ max_espera_seg: 5, idiomas: ['es', 'ca', 'en'] }) },
      { agente: 'clasificador', parametros: JSON.stringify({ modelo_clasificacion: 'v2', umbral: 0.9 }) },
      { agente: 'antifraude', parametros: JSON.stringify({ umbral_alerta: 0.6, verificar_historico: true, cruce_bases_datos: true }) },
      { agente: 'valorador', parametros: JSON.stringify({ usar_vision_artificial: true, comparar_precios_mercado: true }) },
      { agente: 'perito_virtual', parametros: JSON.stringify({ analisis_fotos: true, generacion_informe: true }) },
      { agente: 'negociador', parametros: JSON.stringify({ margen_negociacion_max: 15, priorizar_concertados: true }) },
      { agente: 'comunicaciones', parametros: JSON.stringify({ tono: 'profesional_cercano', personalizar: true }) },
      { agente: 'legal', parametros: JSON.stringify({ verificar_coberturas: true, normativa: 'espanola' }) },
      { agente: 'pagos', parametros: JSON.stringify({ auto_pago_hasta: 3000, verificar_iban: true }) },
      { agente: 'calidad', parametros: JSON.stringify({ encuesta_automatica: true, seguimiento_dias: 7 }) }
    ];
    for (const a of agentes) {
      await db('config_agentes').insert({ id: uuid(), empresa_id: empresaId, ...a, umbral_confianza: 0.85 });
    }

    logger.info('✅ Datos de demo sembrados correctamente');
    logger.info('');
    logger.info('📧 Credenciales de acceso:');
    logger.info('   Admin:   admin@segurcaixa.demo / Demo2024!');
    logger.info('   Gestor:  gestor@segurcaixa.demo / Demo2024!');
    logger.info('   Perito:  perito@segurcaixa.demo / Demo2024!');
    logger.info('   Cliente: maria.lopez@demo.com / Demo2024!');
    
  } catch (err) {
    logger.error('❌ Error en seed:', err.message);
    throw err;
  } finally {
    await db.destroy();
  }
}

seed();
module.exports = { seed };
