const Joi = require('joi');

const schemas = {
  // Auth
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  registro: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
      .messages({ 'string.pattern.base': 'La contraseña debe tener mayúsculas, minúsculas y números' }),
    nombre: Joi.string().min(2).max(150).required(),
    apellidos: Joi.string().max(200),
    telefono: Joi.string().pattern(/^\+?[0-9]{9,15}$/),
    dni_nif: Joi.string().max(20)
  }),

  // Siniestros
  crearSiniestro: Joi.object({
    poliza_id: Joi.string().uuid(),
    numero_poliza: Joi.string().max(50),
    tipo: Joi.string().valid(
      'auto_colision', 'auto_robo', 'auto_incendio', 'auto_cristales', 'auto_asistencia',
      'negocio_agua', 'negocio_incendio', 'negocio_robo', 'negocio_responsabilidad',
      'negocio_danos_electricos', 'negocio_perdida_beneficios', 'otro'
    ).required(),
    descripcion: Joi.string().min(10).max(5000).required(),
    fecha_ocurrencia: Joi.date().iso().max('now'),
    lugar_ocurrencia: Joi.string().max(500),
    coordenadas: Joi.object({ lat: Joi.number(), lng: Joi.number() }),
    canal_entrada: Joi.string().valid('web', 'app_movil', 'whatsapp', 'telefono', 'email', 'api_externa').default('web'),
    datos_adicionales: Joi.object()
  }),

  actualizarSiniestro: Joi.object({
    estado: Joi.string().valid(
      'recibido', 'clasificando', 'en_analisis', 'verificando_fraude', 'peritaje',
      'valoracion', 'negociacion', 'aprobado', 'rechazado', 'en_pago', 'pagado', 'cerrado', 'reabierto'
    ),
    prioridad: Joi.string().valid('baja', 'media', 'alta', 'urgente', 'critica'),
    gestor_id: Joi.string().uuid(),
    perito_id: Joi.string().uuid(),
    valoracion_perito: Joi.number().min(0),
    valoracion_final: Joi.number().min(0),
    importe_aprobado: Joi.number().min(0),
    resolucion_motivo: Joi.string().max(2000),
    satisfaccion_cliente: Joi.number().integer().min(1).max(10)
  }),

  // Pólizas
  crearPoliza: Joi.object({
    cliente_id: Joi.string().uuid().required(),
    numero_poliza: Joi.string().max(50).required(),
    ramo: Joi.string().valid('auto', 'negocio', 'hogar', 'salud').required(),
    subramo: Joi.string().max(100),
    coberturas: Joi.array().items(Joi.string()),
    capital_asegurado: Joi.number().min(0).required(),
    franquicia: Joi.number().min(0).default(0),
    prima_anual: Joi.number().min(0),
    fecha_inicio: Joi.date().iso().required(),
    fecha_fin: Joi.date().iso().greater(Joi.ref('fecha_inicio')).required(),
    datos_bien_asegurado: Joi.object()
  }),

  // Paginación
  paginacion: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().max(50).default('created_at'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  })
};

/**
 * Middleware de validación
 */
function validar(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        detalles: error.details.map(d => ({ campo: d.path.join('.'), mensaje: d.message }))
      });
    }
    req[source] = value;
    next();
  };
}

module.exports = { schemas, validar };
