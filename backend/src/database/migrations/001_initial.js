/**
 * SiniestrosAI - Migración completa de base de datos
 * Esquema para gestión autónoma de siniestros
 */
const db = require('../../config/database');
const { logger } = require('../../utils/logger');

async function migrate() {
  try {
    logger.info('🔄 Iniciando migración de base de datos...');

    // ========== EXTENSIONES ==========
    await db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await db.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // ========== ENUM TYPES ==========
    await db.raw(`
      DO $$ BEGIN
        CREATE TYPE tipo_usuario AS ENUM ('superadmin', 'admin_empresa', 'gestor', 'perito', 'taller', 'reparador', 'cliente', 'api');
        CREATE TYPE estado_siniestro AS ENUM ('recibido', 'clasificando', 'en_analisis', 'verificando_fraude', 'peritaje', 'valoracion', 'negociacion', 'aprobado', 'rechazado', 'en_pago', 'pagado', 'cerrado', 'reabierto');
        CREATE TYPE tipo_siniestro AS ENUM ('auto_colision', 'auto_robo', 'auto_incendio', 'auto_cristales', 'auto_asistencia', 'negocio_agua', 'negocio_incendio', 'negocio_robo', 'negocio_responsabilidad', 'negocio_danos_electricos', 'negocio_perdida_beneficios', 'otro');
        CREATE TYPE prioridad AS ENUM ('baja', 'media', 'alta', 'urgente', 'critica');
        CREATE TYPE nivel_fraude AS ENUM ('sin_riesgo', 'bajo', 'medio', 'alto', 'confirmado');
        CREATE TYPE estado_tarea_agente AS ENUM ('pendiente', 'en_proceso', 'completada', 'fallida', 'escalada');
        CREATE TYPE canal_entrada AS ENUM ('web', 'app_movil', 'whatsapp', 'telefono', 'email', 'api_externa');
        CREATE TYPE estado_documento AS ENUM ('pendiente', 'recibido', 'validado', 'rechazado');
        CREATE TYPE tipo_notificacion AS ENUM ('email', 'sms', 'whatsapp', 'push', 'interna');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // ========== EMPRESAS (multi-tenant) ==========
    await db.schema.createTableIfNotExists('empresas', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.string('nombre', 200).notNullable();
      t.string('cif', 20).unique().notNullable();
      t.string('slug', 100).unique().notNullable();
      t.text('logo_url');
      t.jsonb('config').defaultTo('{}'); // colores, branding, ajustes
      t.jsonb('limites_autonomia').defaultTo('{"auto_aprobacion_max": 3000, "requiere_perito_desde": 5000}');
      t.boolean('activa').defaultTo(true);
      t.string('plan', 50).defaultTo('enterprise');
      t.timestamps(true, true);
    });

    // ========== USUARIOS ==========
    await db.schema.createTableIfNotExists('usuarios', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('empresa_id').references('id').inTable('empresas').onDelete('CASCADE');
      t.string('email', 255).unique().notNullable();
      t.string('password_hash', 255).notNullable();
      t.string('nombre', 150).notNullable();
      t.string('apellidos', 200);
      t.string('telefono', 20);
      t.string('dni_nif', 20);
      t.specificType('tipo', 'tipo_usuario').notNullable().defaultTo('cliente');
      t.jsonb('permisos').defaultTo('[]');
      t.boolean('activo').defaultTo(true);
      t.boolean('mfa_activado').defaultTo(false);
      t.string('mfa_secret', 255);
      t.timestamp('ultimo_login');
      t.integer('intentos_fallidos').defaultTo(0);
      t.timestamp('bloqueado_hasta');
      t.jsonb('preferencias').defaultTo('{"idioma": "es", "notificaciones": true}');
      t.timestamps(true, true);
      t.index(['empresa_id', 'tipo']);
      t.index('email');
    });

    // ========== PÓLIZAS ==========
    await db.schema.createTableIfNotExists('polizas', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('empresa_id').references('id').inTable('empresas').onDelete('CASCADE');
      t.uuid('cliente_id').references('id').inTable('usuarios').onDelete('SET NULL');
      t.string('numero_poliza', 50).unique().notNullable();
      t.string('ramo', 50).notNullable(); // auto, negocio, hogar, salud
      t.string('subramo', 100);
      t.jsonb('coberturas').defaultTo('[]');
      t.decimal('capital_asegurado', 12, 2);
      t.decimal('franquicia', 10, 2).defaultTo(0);
      t.decimal('prima_anual', 10, 2);
      t.date('fecha_inicio').notNullable();
      t.date('fecha_fin').notNullable();
      t.boolean('activa').defaultTo(true);
      t.jsonb('datos_bien_asegurado').defaultTo('{}'); // matrícula, dirección negocio, etc.
      t.jsonb('condiciones_especiales').defaultTo('{}');
      t.timestamps(true, true);
      t.index(['empresa_id', 'numero_poliza']);
      t.index(['cliente_id', 'ramo']);
    });

    // ========== SINIESTROS ==========
    await db.schema.createTableIfNotExists('siniestros', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('empresa_id').references('id').inTable('empresas').onDelete('CASCADE');
      t.uuid('poliza_id').references('id').inTable('polizas').onDelete('SET NULL');
      t.uuid('cliente_id').references('id').inTable('usuarios').onDelete('SET NULL');
      t.uuid('gestor_id').references('id').inTable('usuarios').onDelete('SET NULL');
      t.uuid('perito_id').references('id').inTable('usuarios').onDelete('SET NULL');
      t.string('numero_expediente', 30).unique().notNullable();
      t.specificType('tipo', 'tipo_siniestro').notNullable();
      t.specificType('estado', 'estado_siniestro').notNullable().defaultTo('recibido');
      t.specificType('prioridad', 'prioridad').defaultTo('media');
      t.specificType('canal_entrada', 'canal_entrada').defaultTo('web');
      t.specificType('nivel_fraude', 'nivel_fraude').defaultTo('sin_riesgo');
      // Datos del siniestro
      t.text('descripcion');
      t.timestamp('fecha_ocurrencia');
      t.string('lugar_ocurrencia', 500);
      t.jsonb('coordenadas'); // {lat, lng}
      t.jsonb('datos_adicionales').defaultTo('{}');
      // Valoración
      t.decimal('valoracion_ia', 12, 2);
      t.decimal('valoracion_perito', 12, 2);
      t.decimal('valoracion_final', 12, 2);
      t.decimal('franquicia_aplicada', 10, 2);
      t.decimal('importe_aprobado', 12, 2);
      // Resolución
      t.text('resolucion_motivo');
      t.timestamp('fecha_resolucion');
      t.boolean('auto_resuelto').defaultTo(false); // resuelto por IA sin intervención humana
      // Fraude
      t.decimal('score_fraude', 5, 4); // 0.0000 a 1.0000
      t.jsonb('indicadores_fraude').defaultTo('[]');
      // Métricas
      t.integer('tiempo_resolucion_minutos');
      t.decimal('coste_gestion', 10, 2);
      t.integer('satisfaccion_cliente'); // 1-10
      // IA
      t.jsonb('resumen_ia').defaultTo('{}');
      t.jsonb('agentes_involucrados').defaultTo('[]');
      t.integer('total_interacciones_ia').defaultTo(0);
      // Timestamps
      t.timestamps(true, true);
      t.index(['empresa_id', 'estado']);
      t.index(['empresa_id', 'tipo']);
      t.index(['cliente_id']);
      t.index(['numero_expediente']);
      t.index(['created_at']);
    });

    // ========== TAREAS DE AGENTES IA ==========
    await db.schema.createTableIfNotExists('tareas_agente', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('siniestro_id').references('id').inTable('siniestros').onDelete('CASCADE');
      t.string('agente', 50).notNullable(); // recepcionista, clasificador, antifraude, etc.
      t.string('tarea', 200).notNullable();
      t.specificType('estado', 'estado_tarea_agente').defaultTo('pendiente');
      t.jsonb('input').defaultTo('{}');
      t.jsonb('output').defaultTo('{}');
      t.text('razonamiento'); // chain-of-thought del agente
      t.integer('tokens_usados').defaultTo(0);
      t.integer('duracion_ms');
      t.decimal('coste_api', 8, 6);
      t.integer('orden').defaultTo(0);
      t.string('modelo_ia', 100);
      t.timestamps(true, true);
      t.index(['siniestro_id', 'agente']);
    });

    // ========== DOCUMENTOS ==========
    await db.schema.createTableIfNotExists('documentos', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('siniestro_id').references('id').inTable('siniestros').onDelete('CASCADE');
      t.uuid('subido_por').references('id').inTable('usuarios').onDelete('SET NULL');
      t.string('nombre', 255).notNullable();
      t.string('tipo_archivo', 50);
      t.string('categoria', 100); // foto_danos, parte_amistoso, factura, dni, presupuesto, informe_perito
      t.specificType('estado', 'estado_documento').defaultTo('pendiente');
      t.string('ruta_archivo', 500);
      t.integer('tamano_bytes');
      t.jsonb('analisis_ia').defaultTo('{}'); // resultado del análisis de visión artificial
      t.text('texto_extraido'); // OCR
      t.boolean('validado_ia').defaultTo(false);
      t.timestamps(true, true);
      t.index(['siniestro_id', 'categoria']);
    });

    // ========== PERITOS ==========
    await db.schema.createTableIfNotExists('peritos', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('usuario_id').references('id').inTable('usuarios').onDelete('CASCADE');
      t.string('numero_colegiado', 50);
      t.jsonb('especialidades').defaultTo('[]'); // auto, negocio, hogar
      t.jsonb('zona_cobertura').defaultTo('{}'); // provincias, códigos postales
      t.integer('capacidad_actual').defaultTo(0);
      t.integer('capacidad_maxima').defaultTo(20);
      t.decimal('valoracion_media', 3, 2).defaultTo(0);
      t.integer('siniestros_gestionados').defaultTo(0);
      t.boolean('disponible').defaultTo(true);
      t.timestamps(true, true);
    });

    // ========== TALLERES / REPARADORES ==========
    await db.schema.createTableIfNotExists('talleres', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('empresa_id').references('id').inTable('empresas');
      t.string('nombre', 200).notNullable();
      t.string('cif', 20);
      t.text('direccion');
      t.string('provincia', 100);
      t.string('codigo_postal', 10);
      t.jsonb('coordenadas');
      t.string('telefono', 20);
      t.string('email', 255);
      t.jsonb('especialidades').defaultTo('[]'); // chapa, mecanica, cristales, electricidad
      t.boolean('concertado').defaultTo(false);
      t.decimal('descuento_concertado', 5, 2).defaultTo(0);
      t.decimal('valoracion_media', 3, 2).defaultTo(0);
      t.integer('trabajos_realizados').defaultTo(0);
      t.boolean('activo').defaultTo(true);
      t.timestamps(true, true);
      t.index(['provincia', 'activo']);
    });

    // ========== PRESUPUESTOS ==========
    await db.schema.createTableIfNotExists('presupuestos', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('siniestro_id').references('id').inTable('siniestros').onDelete('CASCADE');
      t.uuid('taller_id').references('id').inTable('talleres');
      t.string('numero_presupuesto', 50);
      t.jsonb('partidas').defaultTo('[]'); // [{concepto, cantidad, precio_unitario, total}]
      t.decimal('subtotal', 12, 2);
      t.decimal('iva', 10, 2);
      t.decimal('total', 12, 2);
      t.string('estado', 30).defaultTo('pendiente'); // pendiente, aprobado, rechazado, negociando
      t.jsonb('negociacion_ia').defaultTo('{}');
      t.timestamps(true, true);
    });

    // ========== PAGOS ==========
    await db.schema.createTableIfNotExists('pagos', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('siniestro_id').references('id').inTable('siniestros').onDelete('CASCADE');
      t.string('concepto', 200);
      t.decimal('importe', 12, 2).notNullable();
      t.string('beneficiario', 200);
      t.string('iban', 34);
      t.string('estado', 30).defaultTo('pendiente'); // pendiente, procesando, completado, fallido
      t.string('referencia_pago', 100);
      t.timestamp('fecha_pago');
      t.timestamps(true, true);
      t.index('siniestro_id');
    });

    // ========== COMUNICACIONES ==========
    await db.schema.createTableIfNotExists('comunicaciones', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('siniestro_id').references('id').inTable('siniestros').onDelete('CASCADE');
      t.uuid('usuario_id').references('id').inTable('usuarios');
      t.specificType('canal', 'tipo_notificacion').notNullable();
      t.string('asunto', 300);
      t.text('contenido');
      t.string('destinatario', 255);
      t.string('estado', 30).defaultTo('enviado');
      t.boolean('generado_por_ia').defaultTo(false);
      t.timestamps(true, true);
      t.index('siniestro_id');
    });

    // ========== HISTORIAL DE ESTADOS ==========
    await db.schema.createTableIfNotExists('historial_estados', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('siniestro_id').references('id').inTable('siniestros').onDelete('CASCADE');
      t.string('estado_anterior', 50);
      t.string('estado_nuevo', 50).notNullable();
      t.string('cambiado_por', 100); // usuario_id o 'agente:nombre'
      t.text('motivo');
      t.timestamp('created_at').defaultTo(db.fn.now());
      t.index('siniestro_id');
    });

    // ========== AUDIT LOG (RGPD) ==========
    await db.schema.createTableIfNotExists('audit_log', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('usuario_id').references('id').inTable('usuarios').onDelete('SET NULL');
      t.string('accion', 100).notNullable();
      t.string('recurso', 100);
      t.uuid('recurso_id');
      t.jsonb('datos_anteriores');
      t.jsonb('datos_nuevos');
      t.string('ip', 45);
      t.string('user_agent', 500);
      t.timestamp('created_at').defaultTo(db.fn.now());
      t.index(['recurso', 'recurso_id']);
      t.index('created_at');
    });

    // ========== CONFIGURACIÓN DE AGENTES ==========
    await db.schema.createTableIfNotExists('config_agentes', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('empresa_id').references('id').inTable('empresas');
      t.string('agente', 50).notNullable();
      t.boolean('activo').defaultTo(true);
      t.jsonb('parametros').defaultTo('{}');
      t.text('prompt_personalizado');
      t.decimal('umbral_confianza', 3, 2).defaultTo(0.85);
      t.timestamps(true, true);
      t.unique(['empresa_id', 'agente']);
    });

    logger.info('✅ Migración completada con éxito');
  } catch (err) {
    logger.error('❌ Error en migración:', err.message);
    throw err;
  } finally {
    await db.destroy();
  }
}

migrate();

module.exports = { migrate };
