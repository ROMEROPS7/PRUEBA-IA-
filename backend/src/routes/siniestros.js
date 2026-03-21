const router = require('express').Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const { schemas, validar } = require('../middleware/validation');
const { generarNumeroExpediente, respuestaPaginada } = require('../utils/helpers');
const { registrarAudit } = require('../middleware/audit');
const { logger } = require('../utils/logger');
const orquestador = require('../agents/orchestrator');
const { v4: uuid } = require('uuid');

// GET /siniestros - Listar siniestros (con filtros)
router.get('/', auth(), async (req, res) => {
  try {
    const { page = 1, limit = 20, estado, tipo, prioridad, desde, hasta, buscar } = req.query;

    let query = db('siniestros as s')
      .select(
        's.*',
        'c.nombre as cliente_nombre', 'c.apellidos as cliente_apellidos', 'c.email as cliente_email',
        'g.nombre as gestor_nombre', 'g.apellidos as gestor_apellidos',
        'p.numero_poliza'
      )
      .leftJoin('usuarios as c', 's.cliente_id', 'c.id')
      .leftJoin('usuarios as g', 's.gestor_id', 'g.id')
      .leftJoin('polizas as p', 's.poliza_id', 'p.id')
      .where('s.empresa_id', req.usuario.empresa_id);

    // Filtros por rol
    if (req.usuario.tipo === 'cliente') {
      query = query.where('s.cliente_id', req.usuario.id);
    } else if (req.usuario.tipo === 'perito') {
      query = query.where('s.perito_id', req.usuario.id);
    }

    // Filtros opcionales
    if (estado) query = query.where('s.estado', estado);
    if (tipo) query = query.where('s.tipo', tipo);
    if (prioridad) query = query.where('s.prioridad', prioridad);
    if (desde) query = query.where('s.created_at', '>=', desde);
    if (hasta) query = query.where('s.created_at', '<=', hasta);
    if (buscar) {
      query = query.where(function () {
        this.where('s.numero_expediente', 'ilike', `%${buscar}%`)
          .orWhere('s.descripcion', 'ilike', `%${buscar}%`)
          .orWhere('c.nombre', 'ilike', `%${buscar}%`)
          .orWhere('c.apellidos', 'ilike', `%${buscar}%`);
      });
    }

    // Contar total
    const [{ count }] = await query.clone().clearSelect().count('s.id as count');

    // Paginar y ordenar
    const siniestros = await query
      .orderBy('s.created_at', 'desc')
      .limit(parseInt(limit))
      .offset((Math.max(1, parseInt(page)) - 1) * parseInt(limit));

    res.json(respuestaPaginada(siniestros, parseInt(count), page, limit));
  } catch (err) {
    logger.error('Error listando siniestros:', err);
    res.status(500).json({ error: 'Error al obtener siniestros' });
  }
});

// GET /siniestros/:id - Detalle completo
router.get('/:id', auth(), async (req, res) => {
  try {
    const siniestro = await db('siniestros as s')
      .select('s.*',
        'c.nombre as cliente_nombre', 'c.apellidos as cliente_apellidos', 'c.email as cliente_email', 'c.telefono as cliente_telefono',
        'g.nombre as gestor_nombre', 'g.apellidos as gestor_apellidos',
        'pe.nombre as perito_nombre', 'pe.apellidos as perito_apellidos',
        'p.numero_poliza', 'p.ramo', 'p.subramo', 'p.coberturas', 'p.capital_asegurado', 'p.franquicia', 'p.datos_bien_asegurado'
      )
      .leftJoin('usuarios as c', 's.cliente_id', 'c.id')
      .leftJoin('usuarios as g', 's.gestor_id', 'g.id')
      .leftJoin('usuarios as pe', 's.perito_id', 'pe.id')
      .leftJoin('polizas as p', 's.poliza_id', 'p.id')
      .where('s.id', req.params.id)
      .where('s.empresa_id', req.usuario.empresa_id)
      .first();

    if (!siniestro) return res.status(404).json({ error: 'Siniestro no encontrado' });

    // Cargar datos relacionados
    const [tareas, documentos, historial, comunicaciones, presupuestos, pagos] = await Promise.all([
      db('tareas_agente').where('siniestro_id', req.params.id).orderBy('created_at', 'asc'),
      db('documentos').where('siniestro_id', req.params.id).orderBy('created_at', 'desc'),
      db('historial_estados').where('siniestro_id', req.params.id).orderBy('created_at', 'asc'),
      db('comunicaciones').where('siniestro_id', req.params.id).orderBy('created_at', 'desc'),
      db('presupuestos').where('siniestro_id', req.params.id),
      db('pagos').where('siniestro_id', req.params.id)
    ]);

    res.json({
      ...siniestro,
      tareas_agente: tareas,
      documentos,
      historial_estados: historial,
      comunicaciones,
      presupuestos,
      pagos
    });
  } catch (err) {
    logger.error('Error obteniendo siniestro:', err);
    res.status(500).json({ error: 'Error al obtener el siniestro' });
  }
});

// POST /siniestros - Crear siniestro nuevo (y lanzar procesamiento IA)
router.post('/', auth(), validar(schemas.crearSiniestro), async (req, res) => {
  try {
    const { tipo, descripcion, fecha_ocurrencia, lugar_ocurrencia, coordenadas, canal_entrada, datos_adicionales, poliza_id, numero_poliza } = req.body;

    // Buscar póliza
    let poliza = null;
    if (poliza_id) {
      poliza = await db('polizas').where('id', poliza_id).where('empresa_id', req.usuario.empresa_id).first();
    } else if (numero_poliza) {
      poliza = await db('polizas').where('numero_poliza', numero_poliza).where('empresa_id', req.usuario.empresa_id).first();
    }

    // Determinar cliente
    const clienteId = req.usuario.tipo === 'cliente' ? req.usuario.id : (poliza?.cliente_id || null);

    const siniestroId = uuid();
    const numExpediente = generarNumeroExpediente(tipo);

    await db('siniestros').insert({
      id: siniestroId,
      empresa_id: req.usuario.empresa_id,
      poliza_id: poliza?.id || null,
      cliente_id: clienteId,
      numero_expediente: numExpediente,
      tipo,
      estado: 'recibido',
      canal_entrada: canal_entrada || 'web',
      descripcion,
      fecha_ocurrencia: fecha_ocurrencia || new Date(),
      lugar_ocurrencia,
      coordenadas: coordenadas ? JSON.stringify(coordenadas) : null,
      datos_adicionales: datos_adicionales ? JSON.stringify(datos_adicionales) : '{}'
    });

    // Registrar estado inicial
    await db('historial_estados').insert({
      id: uuid(),
      siniestro_id: siniestroId,
      estado_nuevo: 'recibido',
      cambiado_por: req.usuario.id,
      motivo: `Siniestro reportado por ${canal_entrada || 'web'}`
    });

    await registrarAudit(req.usuario.id, 'crear_siniestro', 'siniestros', siniestroId, null, { tipo, numExpediente });

    // Responder inmediatamente al cliente
    res.status(201).json({
      id: siniestroId,
      numero_expediente: numExpediente,
      estado: 'recibido',
      mensaje: `Su siniestro ha sido registrado con el expediente ${numExpediente}. Nuestro sistema de IA lo está procesando.`
    });

    // Lanzar procesamiento IA en background
    setImmediate(async () => {
      try {
        logger.info(`🚀 Lanzando procesamiento IA para siniestro ${numExpediente}`);
        const resultado = await orquestador.procesarSiniestro(siniestroId, req.usuario.empresa_id);
        logger.info(`✅ Procesamiento completado: ${resultado.estado} (${resultado.tiempo_total_ms}ms, ${resultado.agentes_ejecutados} agentes)`);
      } catch (err) {
        logger.error(`❌ Error en procesamiento IA del siniestro ${siniestroId}:`, err);
      }
    });

  } catch (err) {
    logger.error('Error creando siniestro:', err);
    res.status(500).json({ error: 'Error al crear el siniestro' });
  }
});

// PATCH /siniestros/:id - Actualizar (gestor/admin)
router.patch('/:id', auth(['superadmin', 'admin_empresa', 'gestor', 'perito']), validar(schemas.actualizarSiniestro), async (req, res) => {
  try {
    const siniestro = await db('siniestros').where('id', req.params.id).where('empresa_id', req.usuario.empresa_id).first();
    if (!siniestro) return res.status(404).json({ error: 'Siniestro no encontrado' });

    const updates = { ...req.body, updated_at: new Date() };

    // Registrar cambio de estado
    if (req.body.estado && req.body.estado !== siniestro.estado) {
      await db('historial_estados').insert({
        id: uuid(),
        siniestro_id: req.params.id,
        estado_anterior: siniestro.estado,
        estado_nuevo: req.body.estado,
        cambiado_por: req.usuario.id,
        motivo: req.body.resolucion_motivo || 'Actualización manual'
      });

      if (['aprobado', 'rechazado', 'cerrado'].includes(req.body.estado) && !siniestro.fecha_resolucion) {
        updates.fecha_resolucion = new Date();
        updates.tiempo_resolucion_minutos = Math.round((Date.now() - new Date(siniestro.created_at).getTime()) / 60000);
      }
    }

    await db('siniestros').where('id', req.params.id).update(updates);
    await registrarAudit(req.usuario.id, 'actualizar_siniestro', 'siniestros', req.params.id, siniestro, updates);

    const actualizado = await db('siniestros').where('id', req.params.id).first();
    res.json(actualizado);
  } catch (err) {
    logger.error('Error actualizando siniestro:', err);
    res.status(500).json({ error: 'Error al actualizar el siniestro' });
  }
});

// POST /siniestros/:id/reprocesar - Relanzar IA
router.post('/:id/reprocesar', auth(['superadmin', 'admin_empresa', 'gestor']), async (req, res) => {
  try {
    const siniestro = await db('siniestros').where('id', req.params.id).where('empresa_id', req.usuario.empresa_id).first();
    if (!siniestro) return res.status(404).json({ error: 'Siniestro no encontrado' });

    res.json({ mensaje: 'Reprocesamiento IA iniciado', siniestro_id: req.params.id });

    setImmediate(async () => {
      try {
        await orquestador.procesarSiniestro(req.params.id, req.usuario.empresa_id);
      } catch (err) {
        logger.error(`Error reprocesando siniestro ${req.params.id}:`, err);
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al reprocesar' });
  }
});

// GET /siniestros/:id/timeline - Timeline del siniestro
router.get('/:id/timeline', auth(), async (req, res) => {
  try {
    const [historial, tareas] = await Promise.all([
      db('historial_estados').where('siniestro_id', req.params.id).orderBy('created_at', 'asc'),
      db('tareas_agente').where('siniestro_id', req.params.id).orderBy('created_at', 'asc')
    ]);

    const timeline = [
      ...historial.map(h => ({ tipo: 'estado', timestamp: h.created_at, estado: h.estado_nuevo, anterior: h.estado_anterior, por: h.cambiado_por, motivo: h.motivo })),
      ...tareas.map(t => ({ tipo: 'agente', timestamp: t.created_at, agente: t.agente, estado: t.estado, duracion_ms: t.duracion_ms, tarea: t.tarea }))
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json(timeline);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener timeline' });
  }
});

module.exports = router;
