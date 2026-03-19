// =============================================================================
// Rules Engine - Motor de reglas configurable para gestion de siniestros
// =============================================================================

const { v4: uuidv4 } = require('uuid') || { v4: () => `rule_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` };

function generateId() {
  try {
    const { v4 } = require('uuid');
    return v4();
  } catch {
    return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

// -----------------------------------------------------------------------------
// Estado interno
// -----------------------------------------------------------------------------

const rules = new Map();
const ruleStats = new Map(); // ruleId -> { triggers, successes, failures, lastTriggered }
const executionLog = [];

// -----------------------------------------------------------------------------
// Operadores de condicion
// -----------------------------------------------------------------------------

const OPERATORS = {
  eq:       (fieldVal, value) => fieldVal === value,
  neq:      (fieldVal, value) => fieldVal !== value,
  gt:       (fieldVal, value) => Number(fieldVal) > Number(value),
  gte:      (fieldVal, value) => Number(fieldVal) >= Number(value),
  lt:       (fieldVal, value) => Number(fieldVal) < Number(value),
  lte:      (fieldVal, value) => Number(fieldVal) <= Number(value),
  contains: (fieldVal, value) => {
    if (Array.isArray(fieldVal)) return fieldVal.includes(value);
    return String(fieldVal).toLowerCase().includes(String(value).toLowerCase());
  },
  in: (fieldVal, value) => {
    const list = Array.isArray(value) ? value : String(value).split(',').map(v => v.trim());
    return list.includes(String(fieldVal));
  },
  between: (fieldVal, value) => {
    const [min, max] = Array.isArray(value) ? value : String(value).split(',').map(v => Number(v.trim()));
    const num = Number(fieldVal);
    return num >= Number(min) && num <= Number(max);
  },
};

// -----------------------------------------------------------------------------
// Tipos de accion
// -----------------------------------------------------------------------------

const ACTION_HANDLERS = {
  asignar_perito: (params, context) => {
    const tiempoLimite = params.tiempo_limite_minutos || 60;
    const especialidad = params.especialidad || 'general';
    const resultado = {
      tipo: 'asignar_perito',
      siniestroId: context.siniestroId || context.id,
      peritoAsignado: params.perito_id || `perito_auto_${Date.now()}`,
      especialidad,
      tiempoLimite,
      fechaAsignacion: new Date().toISOString(),
      fechaLimite: new Date(Date.now() + tiempoLimite * 60000).toISOString(),
      mensaje: `Perito de especialidad '${especialidad}' asignado. Tiempo limite: ${tiempoLimite} minutos.`,
    };
    console.log(`[ACCION] Perito asignado al siniestro ${resultado.siniestroId} - Limite: ${tiempoLimite}min`);
    return resultado;
  },

  cambiar_estado: (params, context) => {
    const nuevoEstado = params.estado || 'en_revision';
    const resultado = {
      tipo: 'cambiar_estado',
      siniestroId: context.siniestroId || context.id,
      estadoAnterior: context.estado || 'desconocido',
      estadoNuevo: nuevoEstado,
      fechaCambio: new Date().toISOString(),
      mensaje: `Estado cambiado de '${context.estado || 'desconocido'}' a '${nuevoEstado}'.`,
    };
    console.log(`[ACCION] Estado cambiado: ${resultado.estadoAnterior} -> ${nuevoEstado}`);
    return resultado;
  },

  enviar_notificacion: (params, context) => {
    const destinatarios = params.destinatarios || ['responsable'];
    const canal = params.canal || 'email';
    const prioridad = params.prioridad || 'normal';
    const resultado = {
      tipo: 'enviar_notificacion',
      siniestroId: context.siniestroId || context.id,
      destinatarios,
      canal,
      prioridad,
      asunto: params.asunto || `Notificacion automatica - Siniestro ${context.siniestroId || context.id}`,
      cuerpo: params.cuerpo || `Se ha activado una regla automatica para el siniestro ${context.siniestroId || context.id}.`,
      fechaEnvio: new Date().toISOString(),
      mensaje: `Notificacion enviada via ${canal} a ${destinatarios.join(', ')} con prioridad ${prioridad}.`,
    };
    console.log(`[ACCION] Notificacion enviada: ${canal} -> ${destinatarios.join(', ')}`);
    return resultado;
  },

  escalar: (params, context) => {
    const nivelEscalado = params.nivel || 'supervisor';
    const motivo = params.motivo || 'Escalado automatico por regla del motor';
    const resultado = {
      tipo: 'escalar',
      siniestroId: context.siniestroId || context.id,
      nivelEscalado,
      motivo,
      escaladoA: params.persona || `${nivelEscalado}_turno`,
      fechaEscalado: new Date().toISOString(),
      urgente: params.urgente || false,
      mensaje: `Siniestro escalado a ${nivelEscalado}. Motivo: ${motivo}`,
    };
    console.log(`[ACCION] Escalado a ${nivelEscalado}: ${motivo}`);
    return resultado;
  },

  bloquear: (params, context) => {
    const motivo = params.motivo || 'Bloqueo automatico por sospecha';
    const resultado = {
      tipo: 'bloquear',
      siniestroId: context.siniestroId || context.id,
      motivo,
      bloqueadoPor: 'sistema_reglas',
      requiereAprobacion: params.requiere_aprobacion !== false,
      nivelAprobacion: params.nivel_aprobacion || 'director',
      fechaBloqueo: new Date().toISOString(),
      mensaje: `Expediente bloqueado. Motivo: ${motivo}. Requiere aprobacion de ${params.nivel_aprobacion || 'director'}.`,
    };
    console.log(`[ACCION] Expediente bloqueado: ${motivo}`);
    return resultado;
  },

  aprobar_auto: (params, context) => {
    const importeMaximo = params.importe_maximo || 500;
    const resultado = {
      tipo: 'aprobar_auto',
      siniestroId: context.siniestroId || context.id,
      importeAprobado: context.indemnizacion || context.importe || 0,
      importeMaximoPermitido: importeMaximo,
      aprobadoPor: 'sistema_automatico',
      fechaAprobacion: new Date().toISOString(),
      referencia: `AUTO_${Date.now()}`,
      mensaje: `Indemnizacion de ${context.indemnizacion || context.importe || 0}EUR aprobada automaticamente (limite: ${importeMaximo}EUR).`,
    };
    console.log(`[ACCION] Aprobacion automatica: ${resultado.importeAprobado}EUR`);
    return resultado;
  },

  generar_informe: (params, context) => {
    const tipoInforme = params.tipo_informe || 'estandar';
    const resultado = {
      tipo: 'generar_informe',
      siniestroId: context.siniestroId || context.id,
      tipoInforme,
      formato: params.formato || 'pdf',
      contenido: {
        titulo: `Informe ${tipoInforme} - Siniestro ${context.siniestroId || context.id}`,
        fecha: new Date().toISOString(),
        datos: {
          tipo: context.tipo || 'no_especificado',
          urgencia: context.urgencia || 0,
          estado: context.estado || 'desconocido',
          importe: context.indemnizacion || context.importe || 0,
        },
        secciones: params.secciones || ['resumen', 'cronologia', 'valoracion'],
      },
      fechaGeneracion: new Date().toISOString(),
      mensaje: `Informe '${tipoInforme}' generado en formato ${params.formato || 'pdf'}.`,
    };
    console.log(`[ACCION] Informe generado: ${tipoInforme}`);
    return resultado;
  },
};

// -----------------------------------------------------------------------------
// Reglas pre-cargadas
// -----------------------------------------------------------------------------

const DEFAULT_RULES = [
  {
    id: 'rule_001',
    name: 'Urgencia alta coche - Perito urgente',
    description: 'Si urgencia > 8 Y tipo = coche, asignar perito en 30min y enviar notificacion',
    active: true,
    priority: 1,
    conditions: [
      { field: 'urgencia', operator: 'gt', value: 8 },
      { field: 'tipo', operator: 'eq', value: 'coche' },
    ],
    actions: [
      { type: 'asignar_perito', params: { tiempo_limite_minutos: 30, especialidad: 'automovil' } },
      { type: 'enviar_notificacion', params: { destinatarios: ['perito', 'supervisor'], canal: 'sms', prioridad: 'alta', asunto: 'Perito requerido urgente - Siniestro auto' } },
    ],
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-01-15T08:00:00.000Z',
    triggerCount: 0,
  },
  {
    id: 'rule_002',
    name: 'Fraude detectado - Bloqueo',
    description: 'Si score_fraude > 70, bloquear expediente y alertar equipo legal',
    active: true,
    priority: 1,
    conditions: [
      { field: 'score_fraude', operator: 'gt', value: 70 },
    ],
    actions: [
      { type: 'bloquear', params: { motivo: 'Score de fraude superior al umbral (>70)', nivel_aprobacion: 'director', requiere_aprobacion: true } },
      { type: 'cambiar_estado', params: { estado: 'bloqueado_fraude' } },
      { type: 'enviar_notificacion', params: { destinatarios: ['equipo_legal', 'director_fraude'], canal: 'email', prioridad: 'urgente', asunto: 'ALERTA: Posible fraude detectado' } },
      { type: 'generar_informe', params: { tipo_informe: 'fraude', secciones: ['resumen', 'indicadores_fraude', 'historial_cliente', 'recomendacion'] } },
    ],
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-01-15T08:00:00.000Z',
    triggerCount: 0,
  },
  {
    id: 'rule_003',
    name: 'Indemnizacion baja - Aprobacion automatica',
    description: 'Si indemnizacion < 500, aprobar automaticamente',
    active: true,
    priority: 3,
    conditions: [
      { field: 'indemnizacion', operator: 'lt', value: 500 },
      { field: 'score_fraude', operator: 'lte', value: 30 },
    ],
    actions: [
      { type: 'aprobar_auto', params: { importe_maximo: 500 } },
      { type: 'cambiar_estado', params: { estado: 'aprobado' } },
      { type: 'enviar_notificacion', params: { destinatarios: ['cliente'], canal: 'email', asunto: 'Su reclamacion ha sido aprobada' } },
    ],
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-01-15T08:00:00.000Z',
    triggerCount: 0,
  },
  {
    id: 'rule_004',
    name: 'Salud critica - Escalado inmediato',
    description: 'Si tipo = salud Y urgencia = 10, escalado inmediato a director',
    active: true,
    priority: 1,
    conditions: [
      { field: 'tipo', operator: 'eq', value: 'salud' },
      { field: 'urgencia', operator: 'gte', value: 10 },
    ],
    actions: [
      { type: 'escalar', params: { nivel: 'director', motivo: 'Siniestro de salud con urgencia maxima', persona: 'director_medico', urgente: true } },
      { type: 'enviar_notificacion', params: { destinatarios: ['director_medico', 'coordinador_salud'], canal: 'sms', prioridad: 'urgente', asunto: 'URGENTE: Siniestro salud critico' } },
      { type: 'cambiar_estado', params: { estado: 'escalado_urgente' } },
    ],
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-01-15T08:00:00.000Z',
    triggerCount: 0,
  },
  {
    id: 'rule_005',
    name: 'Valencia hogar - Verificar AEMET',
    description: 'Si zona = Valencia Y tipo = hogar, verificar alerta AEMET y generar informe',
    active: true,
    priority: 2,
    conditions: [
      { field: 'zona', operator: 'eq', value: 'Valencia' },
      { field: 'tipo', operator: 'eq', value: 'hogar' },
    ],
    actions: [
      { type: 'generar_informe', params: { tipo_informe: 'verificacion_meteorologica', secciones: ['alerta_aemet', 'datos_climaticos', 'zona_afectada', 'valoracion_danios'] } },
      { type: 'asignar_perito', params: { especialidad: 'danios_climaticos', tiempo_limite_minutos: 120 } },
      { type: 'enviar_notificacion', params: { destinatarios: ['perito', 'coordinador_hogar'], canal: 'email', asunto: 'Siniestro hogar Valencia - Verificar alertas AEMET' } },
    ],
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-01-15T08:00:00.000Z',
    triggerCount: 0,
  },
  {
    id: 'rule_006',
    name: 'Indemnizacion alta - Revision obligatoria',
    description: 'Si indemnizacion > 10000, requiere revision de director y generar informe detallado',
    active: true,
    priority: 2,
    conditions: [
      { field: 'indemnizacion', operator: 'gt', value: 10000 },
    ],
    actions: [
      { type: 'escalar', params: { nivel: 'director', motivo: 'Indemnizacion superior a 10.000EUR requiere aprobacion directiva' } },
      { type: 'cambiar_estado', params: { estado: 'pendiente_aprobacion_direccion' } },
      { type: 'generar_informe', params: { tipo_informe: 'valoracion_detallada', secciones: ['resumen', 'valoracion', 'documentacion', 'historial', 'recomendacion'] } },
      { type: 'enviar_notificacion', params: { destinatarios: ['director_area', 'controller'], canal: 'email', prioridad: 'alta', asunto: 'Aprobacion requerida: indemnizacion superior a 10.000EUR' } },
    ],
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-01-15T08:00:00.000Z',
    triggerCount: 0,
  },
  {
    id: 'rule_007',
    name: 'Siniestro recurrente - Investigacion',
    description: 'Si reclamaciones_previas > 3 Y misma zona, abrir investigacion',
    active: true,
    priority: 2,
    conditions: [
      { field: 'reclamaciones_previas', operator: 'gt', value: 3 },
    ],
    actions: [
      { type: 'generar_informe', params: { tipo_informe: 'investigacion_recurrencia', secciones: ['historial_reclamaciones', 'patron_deteccion', 'analisis_riesgo'] } },
      { type: 'enviar_notificacion', params: { destinatarios: ['investigador', 'supervisor'], canal: 'email', prioridad: 'alta', asunto: 'Patron de reclamaciones recurrentes detectado' } },
      { type: 'cambiar_estado', params: { estado: 'en_investigacion' } },
    ],
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-01-15T08:00:00.000Z',
    triggerCount: 0,
  },
  {
    id: 'rule_008',
    name: 'Robo vehiculo - Protocolo especial',
    description: 'Si tipo = robo Y objeto = vehiculo, activar protocolo de robo con denuncia policial',
    active: true,
    priority: 1,
    conditions: [
      { field: 'tipo', operator: 'eq', value: 'robo' },
      { field: 'objeto', operator: 'eq', value: 'vehiculo' },
    ],
    actions: [
      { type: 'cambiar_estado', params: { estado: 'protocolo_robo' } },
      { type: 'enviar_notificacion', params: { destinatarios: ['cliente'], canal: 'sms', prioridad: 'alta', asunto: 'Instrucciones urgentes - Robo de vehiculo', cuerpo: 'Presente denuncia policial en 24h y envie copia a su gestor.' } },
      { type: 'enviar_notificacion', params: { destinatarios: ['investigador_fraude', 'legal'], canal: 'email', prioridad: 'alta', asunto: 'Nuevo siniestro de robo de vehiculo' } },
      { type: 'generar_informe', params: { tipo_informe: 'robo_vehiculo', secciones: ['datos_vehiculo', 'circunstancias', 'documentacion_requerida', 'verificaciones'] } },
    ],
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-01-15T08:00:00.000Z',
    triggerCount: 0,
  },
  {
    id: 'rule_009',
    name: 'Catastrofe natural - Activacion masiva',
    description: 'Si tipo = catastrofe Y afectados > 10, activar protocolo de catastrofe',
    active: true,
    priority: 1,
    conditions: [
      { field: 'tipo', operator: 'eq', value: 'catastrofe' },
      { field: 'afectados', operator: 'gt', value: 10 },
    ],
    actions: [
      { type: 'escalar', params: { nivel: 'comite_crisis', motivo: 'Catastrofe natural con multiples afectados', urgente: true } },
      { type: 'enviar_notificacion', params: { destinatarios: ['comite_crisis', 'director_general', 'comunicacion'], canal: 'sms', prioridad: 'urgente', asunto: 'ACTIVACION PROTOCOLO CATASTROFE' } },
      { type: 'generar_informe', params: { tipo_informe: 'catastrofe', secciones: ['extension_danios', 'afectados', 'recursos_necesarios', 'estimacion_costes'] } },
    ],
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-01-15T08:00:00.000Z',
    triggerCount: 0,
  },
  {
    id: 'rule_010',
    name: 'Seguimiento automatico 48h',
    description: 'Si estado = abierto Y dias_sin_actividad > 2, enviar recordatorio',
    active: true,
    priority: 5,
    conditions: [
      { field: 'estado', operator: 'eq', value: 'abierto' },
      { field: 'dias_sin_actividad', operator: 'gt', value: 2 },
    ],
    actions: [
      { type: 'enviar_notificacion', params: { destinatarios: ['gestor_asignado'], canal: 'email', prioridad: 'normal', asunto: 'Recordatorio: siniestro pendiente de gestion' } },
      { type: 'enviar_notificacion', params: { destinatarios: ['cliente'], canal: 'sms', cuerpo: 'Estamos trabajando en su siniestro. Le mantendremos informado.' } },
    ],
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-01-15T08:00:00.000Z',
    triggerCount: 0,
  },
];

// Cargar reglas por defecto
DEFAULT_RULES.forEach(rule => {
  rules.set(rule.id, { ...rule });
  ruleStats.set(rule.id, { triggers: 0, successes: 0, failures: 0, lastTriggered: null });
});

// -----------------------------------------------------------------------------
// Funciones de utilidad
// -----------------------------------------------------------------------------

function getNestedValue(obj, fieldPath) {
  return fieldPath.split('.').reduce((current, key) => {
    return current !== undefined && current !== null ? current[key] : undefined;
  }, obj);
}

// -----------------------------------------------------------------------------
// Funciones del motor
// -----------------------------------------------------------------------------

/**
 * Evalua un conjunto de condiciones contra un objeto de datos.
 * Todas las condiciones deben cumplirse (logica AND).
 */
function evaluateConditions(conditions, data) {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every(condition => {
    const { field, operator, value } = condition;
    const fieldValue = getNestedValue(data, field);

    if (fieldValue === undefined || fieldValue === null) return false;

    const op = OPERATORS[operator];
    if (!op) {
      console.warn(`[RULES] Operador desconocido: ${operator}`);
      return false;
    }

    try {
      return op(fieldValue, value);
    } catch (err) {
      console.error(`[RULES] Error evaluando condicion ${field} ${operator} ${value}:`, err.message);
      return false;
    }
  });
}

/**
 * Evalua una regla contra datos. Si las condiciones se cumplen, ejecuta las acciones.
 * @returns {{ matched: boolean, results: Array }} resultado de la evaluacion
 */
function evaluateRule(rule, data) {
  if (!rule || !rule.active) {
    return { matched: false, results: [], reason: 'Regla inactiva o no encontrada' };
  }

  const matched = evaluateConditions(rule.conditions, data);

  if (!matched) {
    return { matched: false, results: [], reason: 'Condiciones no cumplidas' };
  }

  // Actualizar estadisticas
  const stats = ruleStats.get(rule.id);
  if (stats) {
    stats.triggers++;
    stats.lastTriggered = new Date().toISOString();
  }

  // Actualizar contador en la regla
  const storedRule = rules.get(rule.id);
  if (storedRule) {
    storedRule.triggerCount = (storedRule.triggerCount || 0) + 1;
  }

  const context = { ...data };
  const results = [];

  for (const action of rule.actions) {
    try {
      const result = executeAction(action, context);
      results.push({ action: action.type, success: true, result });
      if (stats) stats.successes++;
    } catch (err) {
      results.push({ action: action.type, success: false, error: err.message });
      if (stats) stats.failures++;
      console.error(`[RULES] Error ejecutando accion ${action.type}:`, err.message);
    }
  }

  executionLog.push({
    ruleId: rule.id,
    ruleName: rule.name,
    data: { ...data },
    matched: true,
    results,
    timestamp: new Date().toISOString(),
  });

  return { matched: true, results };
}

/**
 * Ejecuta una accion individual.
 */
function executeAction(action, context) {
  const handler = ACTION_HANDLERS[action.type];
  if (!handler) {
    throw new Error(`Tipo de accion desconocido: ${action.type}`);
  }
  return handler(action.params || {}, context);
}

/**
 * Procesa todas las reglas activas contra los datos, ordenadas por prioridad.
 * @returns {Array} resultados de todas las reglas evaluadas
 */
function processRules(data) {
  const activeRules = Array.from(rules.values())
    .filter(r => r.active)
    .sort((a, b) => a.priority - b.priority);

  const results = [];

  for (const rule of activeRules) {
    const result = evaluateRule(rule, data);
    if (result.matched) {
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        priority: rule.priority,
        ...result,
      });
    }
  }

  return {
    totalRulesEvaluated: activeRules.length,
    rulesMatched: results.length,
    results,
    timestamp: new Date().toISOString(),
  };
}

// -----------------------------------------------------------------------------
// CRUD de reglas
// -----------------------------------------------------------------------------

function addRule(ruleData) {
  const id = ruleData.id || generateId();
  const now = new Date().toISOString();

  const rule = {
    id,
    name: ruleData.name || 'Regla sin nombre',
    description: ruleData.description || '',
    active: ruleData.active !== undefined ? ruleData.active : true,
    priority: ruleData.priority || 5,
    conditions: ruleData.conditions || [],
    actions: ruleData.actions || [],
    createdAt: now,
    updatedAt: now,
    triggerCount: 0,
  };

  // Validar condiciones
  for (const cond of rule.conditions) {
    if (!cond.field || !cond.operator) {
      throw new Error('Cada condicion debe tener field y operator');
    }
    if (!OPERATORS[cond.operator]) {
      throw new Error(`Operador no valido: ${cond.operator}. Validos: ${Object.keys(OPERATORS).join(', ')}`);
    }
  }

  // Validar acciones
  for (const action of rule.actions) {
    if (!action.type) {
      throw new Error('Cada accion debe tener un tipo');
    }
    if (!ACTION_HANDLERS[action.type]) {
      throw new Error(`Tipo de accion no valido: ${action.type}. Validos: ${Object.keys(ACTION_HANDLERS).join(', ')}`);
    }
  }

  rules.set(id, rule);
  ruleStats.set(id, { triggers: 0, successes: 0, failures: 0, lastTriggered: null });

  return rule;
}

function updateRule(id, changes) {
  const rule = rules.get(id);
  if (!rule) throw new Error(`Regla no encontrada: ${id}`);

  const updatedRule = {
    ...rule,
    ...changes,
    id, // no se puede cambiar el id
    updatedAt: new Date().toISOString(),
  };

  rules.set(id, updatedRule);
  return updatedRule;
}

function deleteRule(id) {
  const rule = rules.get(id);
  if (!rule) throw new Error(`Regla no encontrada: ${id}`);

  rules.delete(id);
  ruleStats.delete(id);
  return { deleted: true, id, name: rule.name };
}

function toggleRule(id) {
  const rule = rules.get(id);
  if (!rule) throw new Error(`Regla no encontrada: ${id}`);

  rule.active = !rule.active;
  rule.updatedAt = new Date().toISOString();

  return { id, name: rule.name, active: rule.active };
}

// -----------------------------------------------------------------------------
// Consulta y testing
// -----------------------------------------------------------------------------

/**
 * Prueba una regla contra datos de prueba sin ejecutar las acciones.
 */
function testRule(ruleId, testData) {
  const rule = rules.get(ruleId);
  if (!rule) throw new Error(`Regla no encontrada: ${ruleId}`);

  const conditionsResult = rule.conditions.map(cond => {
    const fieldValue = getNestedValue(testData, cond.field);
    const op = OPERATORS[cond.operator];
    let passed = false;

    try {
      passed = fieldValue !== undefined && fieldValue !== null && op ? op(fieldValue, cond.value) : false;
    } catch {
      passed = false;
    }

    return {
      field: cond.field,
      operator: cond.operator,
      expectedValue: cond.value,
      actualValue: fieldValue,
      passed,
    };
  });

  const allPassed = conditionsResult.every(c => c.passed);

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    allConditionsMet: allPassed,
    conditionsDetail: conditionsResult,
    actionsWouldExecute: allPassed ? rule.actions.map(a => ({ type: a.type, params: a.params })) : [],
    testedAt: new Date().toISOString(),
  };
}

/**
 * Estadisticas de todas las reglas.
 */
function getRuleStats() {
  const stats = {};
  for (const [id, stat] of ruleStats.entries()) {
    const rule = rules.get(id);
    stats[id] = {
      name: rule ? rule.name : 'Eliminada',
      active: rule ? rule.active : false,
      ...stat,
      successRate: stat.triggers > 0 ? ((stat.successes / (stat.successes + stat.failures)) * 100).toFixed(1) + '%' : 'N/A',
    };
  }
  return stats;
}

/**
 * Lista todas las reglas.
 */
function listRules() {
  return Array.from(rules.values()).sort((a, b) => a.priority - b.priority);
}

/**
 * Obtiene una regla por ID.
 */
function getRule(id) {
  const rule = rules.get(id);
  if (!rule) throw new Error(`Regla no encontrada: ${id}`);
  return rule;
}

/**
 * Devuelve el log de ejecuciones.
 */
function getExecutionLog(limit = 50) {
  return executionLog.slice(-limit);
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
  evaluateConditions,
  evaluateRule,
  executeAction,
  processRules,
  addRule,
  updateRule,
  deleteRule,
  toggleRule,
  testRule,
  getRuleStats,
  listRules,
  getRule,
  getExecutionLog,
  OPERATORS: Object.keys(OPERATORS),
  ACTION_TYPES: Object.keys(ACTION_HANDLERS),
};
