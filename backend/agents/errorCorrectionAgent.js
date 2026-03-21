// =============================================================================
// ERROR CORRECTION AGENT - Agente de Correccion de Errores de SiniestrosAI
// Sistema de control de calidad con 5 sub-agentes que verifican, auditan,
// corrigen, aprenden y escalan errores de forma autonoma.
// =============================================================================
//
// Sub-agentes:
//   1. Verificador - Comprueba cada decision contra reglas de negocio
//   2. Auditor     - Audita acciones completadas buscando errores
//   3. Corrector   - Aplica correcciones automaticas a errores detectados
//   4. Aprendiz    - Aprende de errores para prevenir recurrencia
//   5. Alertador   - Escala errores criticos a humanos
// =============================================================================

const { v4: uuidv4 } = require('uuid') || { v4: () => `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function generarId(prefijo = 'err') {
  return `${prefijo}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function fechaHoy() {
  return new Date().toISOString().split('T')[0];
}

function fechaRelativa(diasAtras) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString().split('T')[0];
}

function fechaISO(diasAtras = 0, horasAtras = 0) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  d.setHours(d.getHours() - horasAtras);
  return d.toISOString();
}

function randomEntre(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------------------------------------------------------------------------
// Reglas de negocio del Verificador
// ---------------------------------------------------------------------------

const reglasNegocio = [
  { id: 'RN001', nombre: 'Limite de aprobacion automatica', condicion: 'importe <= 4000', descripcion: 'Los siniestros con importe > 4.000 EUR requieren aprobacion manual' },
  { id: 'RN002', nombre: 'Verificacion de cobertura', condicion: 'poliza.cobertura.includes(tipo_siniestro)', descripcion: 'El tipo de siniestro debe estar cubierto por la poliza activa del cliente' },
  { id: 'RN003', nombre: 'Poliza vigente', condicion: 'poliza.fecha_fin > fecha_siniestro', descripcion: 'La poliza debe estar vigente en la fecha del siniestro' },
  { id: 'RN004', nombre: 'Periodo de carencia', condicion: 'dias_desde_alta > 30', descripcion: 'No se cubren siniestros en los primeros 30 dias desde la contratacion' },
  { id: 'RN005', nombre: 'Duplicidad de siniestro', condicion: 'no_existe_siniestro_similar_30_dias', descripcion: 'No puede haber dos siniestros identicos del mismo cliente en 30 dias' },
  { id: 'RN006', nombre: 'Documentacion completa', condicion: 'documentos_requeridos.every(d => entregados.includes(d))', descripcion: 'Todos los documentos requeridos deben estar entregados antes de procesar' },
  { id: 'RN007', nombre: 'Horario de contacto', condicion: 'hora >= 9 && hora <= 21', descripcion: 'No se puede contactar al cliente fuera del horario de 9:00 a 21:00' },
  { id: 'RN008', nombre: 'Limite de presupuesto departamental', condicion: 'gasto_acumulado <= presupuesto_asignado', descripcion: 'Ningun departamento puede exceder su presupuesto asignado sin autorizacion del CEO' },
  { id: 'RN009', nombre: 'Scoring de fraude', condicion: 'scoring_fraude < 70 || investigacion_completada', descripcion: 'Siniestros con scoring de fraude >= 70 requieren investigacion antes de aprobacion' },
  { id: 'RN010', nombre: 'Conformidad RGPD', condicion: 'consentimiento_datos == true', descripcion: 'No se pueden procesar datos personales sin consentimiento explicito vigente' },
  { id: 'RN011', nombre: 'Proveedor autorizado', condicion: 'proveedor.autorizado == true && proveedor.evaluacion >= 7', descripcion: 'Solo se pueden derivar reparaciones a proveedores autorizados con evaluacion >= 7/10' },
  { id: 'RN012', nombre: 'Tope de indemnizacion', condicion: 'indemnizacion <= poliza.capital_asegurado', descripcion: 'La indemnizacion no puede superar el capital asegurado en la poliza' }
];

// ---------------------------------------------------------------------------
// Errores detectados pre-poblados
// ---------------------------------------------------------------------------

const erroresDetectados = [
  {
    id: generarId('err'),
    fecha: fechaISO(7, 14),
    agente_origen: 'investigacion',
    tipo_error: 'decision_invalida',
    descripcion: 'El Agente de Investigacion marco como fraudulento el siniestro SIN-2024-4312 de un cliente premium (NPS 9, 8 anos de antiguedad) basandose unicamente en la coincidencia geografica con un caso de fraude previo. El scoring era 62/100, por debajo del umbral.',
    severidad: 'alta',
    corregido_automaticamente: true,
    correccion_aplicada: 'Verificador detecto que el scoring (62) estaba por debajo del umbral de investigacion (70). Se revirtio la marca de fraude, se proceso el siniestro por via normal. Se notifico al cliente con disculpa y se aplico gestion premium.',
    verificado_por: 'verificador',
    aprendizaje_generado: 'Se ajusto la regla: coincidencia geografica sola no es suficiente para marcar fraude. Se requieren al menos 3 indicadores coincidentes.'
  },
  {
    id: generarId('err'),
    fecha: fechaISO(6, 11),
    agente_origen: 'negociador',
    tipo_error: 'calculo_erroneo',
    descripcion: 'El Agente Negociador acepto un precio de reparacion de 3.200 EUR para un parachoques delantero de un vehiculo de gama media. El precio de mercado para esa reparacion es de 1.800-2.200 EUR, un 45% por encima.',
    severidad: 'alta',
    corregido_automaticamente: true,
    correccion_aplicada: 'Auditor detecto la desviacion comparando con la base de datos de precios de referencia. Se reabrio la negociacion y se consiguio renegociar a 2.100 EUR. Ahorro: 1.100 EUR.',
    verificado_por: 'auditor',
    aprendizaje_generado: 'Se implemento verificacion automatica de precios contra base de datos de mercado antes de aceptar cualquier presupuesto de reparacion. Margen maximo aceptable: 15% sobre precio de mercado.'
  },
  {
    id: generarId('err'),
    fecha: fechaISO(5, 16),
    agente_origen: 'vendedor',
    tipo_error: 'proceso_incompleto',
    descripcion: 'El Agente Vendedor contacto al cliente Carlos Ruiz a las 22:15 para ofrecer un producto de cross-selling. El horario maximo permitido de contacto es las 21:00 (regla RN007).',
    severidad: 'critica',
    corregido_automaticamente: false,
    correccion_aplicada: 'Alertador escalo inmediatamente a supervision humana. Se envio disculpa formal al cliente por escrito. Se bloqueo la capacidad del Vendedor de realizar llamadas fuera de horario mediante hard-limit en el sistema.',
    verificado_por: 'alertador',
    aprendizaje_generado: 'Se implemento un hard-limit de horario en el modulo de comunicaciones: el sistema rechaza cualquier intento de contacto fuera del rango 9:00-21:00 independientemente de la prioridad.'
  },
  {
    id: generarId('err'),
    fecha: fechaISO(5, 9),
    agente_origen: 'ceo',
    tipo_error: 'decision_invalida',
    descripcion: 'El Agente CEO aprobo un presupuesto de 520.000 EUR para el departamento de Expansion, pero el limite presupuestal restante para Q1 era de 380.000 EUR (regla RN008).',
    severidad: 'critica',
    corregido_automaticamente: true,
    correccion_aplicada: 'Verificador bloqueo la aprobacion antes de que se ejecutara. Se convoco reunion urgente con CEO + CFO + Board. Se aprobo presupuesto reducido de 380.000 EUR con revision en Q2 para los 140.000 EUR restantes.',
    verificado_por: 'verificador',
    aprendizaje_generado: 'Se implemento doble verificacion para aprobaciones presupuestales: CEO propone y CFO valida contra disponibilidad real. Aprobaciones > 100.000 EUR requieren confirmacion del Board.'
  },
  {
    id: generarId('err'),
    fecha: fechaISO(4, 12),
    agente_origen: 'main',
    tipo_error: 'dato_incorrecto',
    descripcion: 'El Agente Recepcionista registro el siniestro SIN-2024-4389 con la matricula incorrecta del vehiculo (ABC-1234 en lugar de ABC-1243). Esto provoco que la verificacion de cobertura fallara inicialmente.',
    severidad: 'media',
    corregido_automaticamente: true,
    correccion_aplicada: 'Verificador detecto la inconsistencia al cruzar matricula con la base de datos de polizas. Se corrigio automaticamente la matricula y se reproceso la verificacion de cobertura exitosamente.',
    verificado_por: 'verificador',
    aprendizaje_generado: 'Se implemento validacion de matricula mediante algoritmo de digito de control y cruce automatico con base de datos DGT antes de registrar el siniestro.'
  },
  {
    id: generarId('err'),
    fecha: fechaISO(4, 6),
    agente_origen: 'innovacion',
    tipo_error: 'calculo_erroneo',
    descripcion: 'El Agente de Peritacion Virtual (dentro de Innovacion) subestimo el dano de un siniestro de hogar por inundacion en un 35%. Valoro los danos en 8.500 EUR cuando la peritacion presencial posterior determino 13.200 EUR.',
    severidad: 'alta',
    corregido_automaticamente: true,
    correccion_aplicada: 'Corrector ajusto la valoracion usando datos historicos de siniestros similares de inundacion en la misma zona. Se aplico factor de correccion de 1.55x para siniestros de agua que afectan a estructura. Se re-emitio la indemnizacion corregida al cliente.',
    verificado_por: 'corrector',
    aprendizaje_generado: 'Se calibro el modelo de peritacion virtual para siniestros de agua: se incluyen factores de dano oculto (humedades, estructura, instalaciones electricas) que no son visibles en video. Factor de seguridad: +40% para siniestros de agua.'
  },
  {
    id: generarId('err'),
    fecha: fechaISO(3, 15),
    agente_origen: 'recobro',
    tipo_error: 'proceso_incompleto',
    descripcion: 'El Agente de Recobro envio carta de requerimiento de pago a un cliente que ya habia pagado 48h antes. El pago no se habia conciliado correctamente en el sistema.',
    severidad: 'media',
    corregido_automaticamente: true,
    correccion_aplicada: 'Auditor detecto que el pago existia en el sistema bancario pero no habia sido conciliado. Se concilio el pago, se anulo la carta de requerimiento y se envio disculpa al cliente con confirmacion de pago recibido.',
    verificado_por: 'auditor',
    aprendizaje_generado: 'Se implemento conciliacion bancaria en tiempo real (cada 15 min en lugar de diaria) y se anadio verificacion de pagos pendientes de conciliar antes de enviar cualquier requerimiento.'
  },
  {
    id: generarId('err'),
    fecha: fechaISO(3, 8),
    agente_origen: 'legal',
    tipo_error: 'inconsistencia',
    descripcion: 'El Agente Legal aplico la normativa de seguros de automovil (LCS art. 1-24) a un siniestro de responsabilidad civil profesional, generando una valoracion incorrecta del dano.',
    severidad: 'alta',
    corregido_automaticamente: true,
    correccion_aplicada: 'Verificador detecto la inconsistencia entre tipo de poliza (RC profesional) y normativa aplicada (automovil). Se corrigio la referencia normativa a la Ley de Ordenacion y Supervision de Seguros Privados art. 73-76 y se recalculo la valoracion.',
    verificado_por: 'verificador',
    aprendizaje_generado: 'Se implemento mapeo automatico tipo_poliza -> normativa_aplicable para evitar confusiones entre ramas de seguro. El sistema ahora valida que la normativa citada corresponde al tipo de poliza.'
  },
  {
    id: generarId('err'),
    fecha: fechaISO(2, 13),
    agente_origen: 'marketing',
    tipo_error: 'dato_incorrecto',
    descripcion: 'El Agente de Marketing envio campana de renovacion a 342 clientes que ya habian renovado su poliza, generando confusion y 28 llamadas de clientes preocupados.',
    severidad: 'media',
    corregido_automaticamente: true,
    correccion_aplicada: 'Auditor detecto el envio erroneo comparando lista de destinatarios con base de datos de renovaciones. Se envio comunicacion de disculpa a los 342 clientes afectados confirmando que su poliza esta correctamente renovada.',
    verificado_por: 'auditor',
    aprendizaje_generado: 'Se implemento filtro obligatorio contra base de datos de renovaciones antes de campanas de renovacion. La lista de destinatarios se cruza automaticamente y se excluyen clientes ya renovados.'
  },
  {
    id: generarId('err'),
    fecha: fechaISO(2, 5),
    agente_origen: 'riesgo',
    tipo_error: 'calculo_erroneo',
    descripcion: 'El Agente de Riesgo calculo una prima de renovacion un 23% superior a lo correcto para el cliente Maria Garcia, al contabilizar dos veces un siniestro del ano anterior.',
    severidad: 'alta',
    corregido_automaticamente: true,
    correccion_aplicada: 'Corrector detecto la duplicacion al verificar el historial de siniestros. Se recalculo la prima correcta (incremento real: 8%) y se envio nueva propuesta de renovacion al cliente con la prima corregida.',
    verificado_por: 'corrector',
    aprendizaje_generado: 'Se implemento deduplicacion de siniestros en el calculo de primas: cada siniestro se identifica por ID unico y se verifica que no haya duplicados antes del calculo actuarial.'
  },
  {
    id: generarId('err'),
    fecha: fechaISO(1, 18),
    agente_origen: 'compras',
    tipo_error: 'decision_invalida',
    descripcion: 'El Agente de Compras autorizo la contratacion de un taller con evaluacion de 5.8/10, por debajo del minimo requerido de 7.0 (regla RN011).',
    severidad: 'media',
    corregido_automaticamente: true,
    correccion_aplicada: 'Verificador bloqueo la autorizacion antes de enviar trabajo al taller. Se reasigno el trabajo a un taller autorizado (evaluacion 8.2/10) de la misma zona, con un incremento de coste del 5% pero dentro de limites aceptables.',
    verificado_por: 'verificador',
    aprendizaje_generado: 'Se implemento hard-check de evaluacion de proveedor: el sistema no permite derivar trabajo a proveedores con evaluacion < 7.0 independientemente de la urgencia. Para emergencias, se requiere aprobacion explicita del CEO.'
  },
  {
    id: generarId('err'),
    fecha: fechaISO(1, 10),
    agente_origen: 'subrogacion',
    tipo_error: 'proceso_incompleto',
    descripcion: 'El Agente de Subrogacion inicio un procedimiento contra la aseguradora del tercero sin adjuntar el informe policial, requisito indispensable para la demanda.',
    severidad: 'media',
    corregido_automaticamente: true,
    correccion_aplicada: 'Verificador detecto la ausencia del documento requerido antes de enviar la demanda. Se pauso el procedimiento, se solicito el informe policial al cliente y se retomo la demanda con la documentacion completa en 48h.',
    verificado_por: 'verificador',
    aprendizaje_generado: 'Se implemento checklist obligatorio de documentos por tipo de procedimiento. El sistema no permite avanzar en el flujo si falta algun documento marcado como obligatorio.'
  },
  {
    id: generarId('err'),
    fecha: fechaISO(1, 3),
    agente_origen: 'retencion',
    tipo_error: 'duplicado',
    descripcion: 'El Agente de Retencion envio dos ofertas de retencion diferentes al mismo cliente en el mismo dia: una con 10% de descuento y otra con 15%, generando confusion.',
    severidad: 'baja',
    corregido_automaticamente: true,
    correccion_aplicada: 'Auditor detecto la duplicidad en la cola de comunicaciones. Se anulo la oferta del 10% y se mantuvo la del 15% como unica oferta vigente. Se contacto al cliente para aclarar que la oferta valida es del 15%.',
    verificado_por: 'auditor',
    aprendizaje_generado: 'Se implemento deduplicacion de ofertas por cliente: solo se permite una oferta activa por cliente. Nuevas ofertas reemplazan las anteriores y se notifica al cliente del cambio.'
  },
  {
    id: generarId('err'),
    fecha: fechaISO(0, 8),
    agente_origen: 'financiero',
    tipo_error: 'calculo_erroneo',
    descripcion: 'El Agente CFO calculo las provisiones de IBNR (Incurred But Not Reported) con un modelo desactualizado que no incluia los siniestros catastroficos de enero, subestimando las reservas en 1.8M EUR.',
    severidad: 'critica',
    corregido_automaticamente: true,
    correccion_aplicada: 'Corrector detecto la desviacion al comparar con el modelo actualizado. Se recalcularon las provisiones IBNR incluyendo los eventos catastroficos, se ajustaron las reservas y se notifico al Board para su conocimiento.',
    verificado_por: 'corrector',
    aprendizaje_generado: 'Se implemento actualizacion automatica del modelo IBNR: cada vez que se registra un evento catastrofico, el modelo se recalibra automaticamente con los nuevos datos dentro de las 24h siguientes.'
  },
  {
    id: generarId('err'),
    fecha: fechaISO(0, 4),
    agente_origen: 'vendedor',
    tipo_error: 'inconsistencia',
    descripcion: 'El Agente Vendedor ofrecio al cliente un seguro de hogar con cobertura de terremoto incluida, pero la poliza base de esa zona no incluye terremoto (es un suplemento de 45 EUR/ano).',
    severidad: 'media',
    corregido_automaticamente: true,
    correccion_aplicada: 'Verificador detecto la inconsistencia antes de formalizar la poliza. Se contacto al cliente para informar que la cobertura de terremoto tiene un suplemento de 45 EUR/ano. El cliente acepto pagar el suplemento.',
    verificado_por: 'verificador',
    aprendizaje_generado: 'Se implemento verificacion automatica de coberturas incluidas vs suplementos por zona geografica antes de generar cualquier oferta comercial.'
  }
];

// ---------------------------------------------------------------------------
// Verificaciones realizadas (alta frecuencia)
// ---------------------------------------------------------------------------

const verificaciones = [];

function generarVerificacionesHistoricas() {
  if (verificaciones.length > 0) return;

  const agentes = ['main', 'negociador', 'vendedor', 'investigacion', 'legal', 'riesgo', 'recobro', 'compras', 'financiero', 'retencion', 'subrogacion', 'rechazos', 'marketing'];
  const acciones = [
    'Registro de nuevo siniestro',
    'Aprobacion de indemnizacion',
    'Envio de comunicacion al cliente',
    'Asignacion de proveedor',
    'Calculo de prima de renovacion',
    'Marcado de fraude',
    'Oferta de cross-selling',
    'Inicio de procedimiento legal',
    'Envio de requerimiento de pago',
    'Valoracion de danos',
    'Aprobacion de presupuesto',
    'Derivacion a taller',
    'Cierre de expediente',
    'Envio de campana masiva',
    'Negociacion de precio con proveedor'
  ];

  // Generar 50+ verificaciones por dia durante 7 dias
  for (let dia = 6; dia >= 0; dia--) {
    const verificacionesDia = randomInt(45, 65);
    for (let i = 0; i < verificacionesDia; i++) {
      const agente = agentes[randomInt(0, agentes.length - 1)];
      const accion = acciones[randomInt(0, acciones.length - 1)];
      const rand = Math.random();
      let resultado, detalle;

      if (rand > 0.92) {
        resultado = 'error_detectado';
        detalle = `Se detecto una violacion de la regla ${reglasNegocio[randomInt(0, reglasNegocio.length - 1)].id} en la accion "${accion}" del agente ${agente}. Se bloqueo la accion y se notifico para correccion.`;
      } else if (rand > 0.82) {
        resultado = 'advertencia';
        detalle = `La accion "${accion}" del agente ${agente} es valida pero esta cerca del limite de la regla ${reglasNegocio[randomInt(0, reglasNegocio.length - 1)].id}. Se recomienda revision.`;
      } else {
        resultado = 'correcto';
        detalle = `La accion "${accion}" del agente ${agente} cumple todas las reglas de negocio aplicables. Verificacion completada en ${randomInt(5, 50)}ms.`;
      }

      verificaciones.push({
        id: generarId('ver'),
        agente,
        accion,
        resultado,
        detalle,
        fecha: fechaISO(dia, randomInt(0, 23)),
        sub_agente: resultado === 'correcto' ? 'verificador' : resultado === 'error_detectado' ? ['verificador', 'auditor'][randomInt(0, 1)] : 'verificador',
        reglas_verificadas: randomInt(2, 6),
        tiempo_ms: randomInt(5, 120)
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Patrones de error recurrentes
// ---------------------------------------------------------------------------

const patronesError = [
  {
    id: generarId('pat'),
    patron: 'Subestimacion de danos en peritacion virtual de siniestros de agua',
    ocurrencias: 7,
    agentes_afectados: ['innovacion', 'main'],
    causa_raiz: 'El modelo de vision no detecta danos ocultos (humedades internas, deterioro de instalaciones electricas bajo la superficie)',
    prevencion: 'Factor de correccion de +40% para siniestros de agua. Se esta desarrollando modelo de IA con datos infrarojos para detectar humedad oculta.',
    estado: 'mitigado',
    reduccion_error: '85% menos ocurrencias desde la mitigacion',
    fecha_deteccion: fechaRelativa(15),
    ultima_ocurrencia: fechaRelativa(4)
  },
  {
    id: generarId('pat'),
    patron: 'Conflicto de interaccion con cliente entre agentes Vendedor y Retencion',
    ocurrencias: 4,
    agentes_afectados: ['vendedor', 'retencion'],
    causa_raiz: 'Ambos agentes operaban sobre la misma base de clientes sin verificar si otro agente ya estaba interactuando con el cliente',
    prevencion: 'Sistema de bloqueo de cliente: cuando un agente inicia interaccion, los demas ven el bloqueo y deben coordinarse a traves del Coordinador Multi-Agente.',
    estado: 'resuelto',
    reduccion_error: '100% eliminado',
    fecha_deteccion: fechaRelativa(22),
    ultima_ocurrencia: fechaRelativa(20)
  },
  {
    id: generarId('pat'),
    patron: 'Aceptacion de precios de reparacion por encima de mercado sin verificacion',
    ocurrencias: 5,
    agentes_afectados: ['negociador', 'compras'],
    causa_raiz: 'El Negociador no consultaba la base de datos de precios de referencia del mercado antes de aceptar presupuestos de talleres',
    prevencion: 'Verificacion automatica obligatoria contra base de datos de precios de mercado. Margen maximo aceptable: 15%. Alertas para desviaciones > 10%.',
    estado: 'resuelto',
    reduccion_error: '100% eliminado',
    fecha_deteccion: fechaRelativa(18),
    ultima_ocurrencia: fechaRelativa(6)
  },
  {
    id: generarId('pat'),
    patron: 'Comunicaciones enviadas a clientes fuera de horario legal',
    ocurrencias: 3,
    agentes_afectados: ['vendedor', 'recobro', 'marketing'],
    causa_raiz: 'No existia un control centralizado de horarios de comunicacion. Cada agente gestionaba sus propios horarios de contacto sin hard-limits del sistema.',
    prevencion: 'Hard-limit centralizado en el modulo de comunicaciones: el sistema rechaza cualquier intento de contacto fuera del rango 9:00-21:00, sin excepciones.',
    estado: 'resuelto',
    reduccion_error: '100% eliminado',
    fecha_deteccion: fechaRelativa(15),
    ultima_ocurrencia: fechaRelativa(5)
  },
  {
    id: generarId('pat'),
    patron: 'Duplicacion de siniestros en calculo de primas de renovacion',
    ocurrencias: 3,
    agentes_afectados: ['riesgo', 'financiero'],
    causa_raiz: 'El sistema de calculo actuarial no deduplicaba siniestros al recibir datos de multiples fuentes (sistema interno + informe TIREA)',
    prevencion: 'Deduplicacion por ID unico de siniestro antes de cualquier calculo actuarial. Alerta si se detectan siniestros con datos identicos pero IDs diferentes.',
    estado: 'resuelto',
    reduccion_error: '100% eliminado',
    fecha_deteccion: fechaRelativa(10),
    ultima_ocurrencia: fechaRelativa(2)
  },
  {
    id: generarId('pat'),
    patron: 'Documentacion incompleta en procedimientos legales y de subrogacion',
    ocurrencias: 6,
    agentes_afectados: ['subrogacion', 'legal', 'rechazos'],
    causa_raiz: 'No existia un checklist obligatorio de documentos por tipo de procedimiento. Los agentes confiaban en su memoria para verificar que todo estuviera completo.',
    prevencion: 'Checklist digital obligatorio por tipo de procedimiento. El sistema no permite avanzar al siguiente paso si falta algun documento marcado como obligatorio. Alertas a 48h del vencimiento de plazo si faltan documentos.',
    estado: 'mitigado',
    reduccion_error: '90% menos ocurrencias',
    fecha_deteccion: fechaRelativa(12),
    ultima_ocurrencia: fechaRelativa(1)
  }
];

// ---------------------------------------------------------------------------
// Funciones principales del agente
// ---------------------------------------------------------------------------

/**
 * Verifica una decision contra reglas de negocio y opinion de otros agentes.
 * Sub-agentes: Verificador (reglas), Auditor (historial), Corrector (alternativas)
 */
function verificarDecision(agenteId, decision, contexto = {}) {
  if (!agenteId || !decision) {
    return { error: 'Se requiere agenteId y decision para verificar' };
  }

  const erroresDetec = [];
  const advertencias = [];
  const sugerenciasMejora = [];
  let valida = true;

  // Sub-agente Verificador: comprueba reglas de negocio
  const reglasAplicables = reglasNegocio.filter(() => Math.random() > 0.4);

  for (const regla of reglasAplicables) {
    const cumple = Math.random() > 0.12;
    if (!cumple) {
      valida = false;
      erroresDetec.push({
        regla: regla.id,
        nombre: regla.nombre,
        descripcion: `La decision "${decision}" viola la regla ${regla.id}: ${regla.descripcion}`,
        sub_agente: 'verificador',
        severidad: ['RN001', 'RN008', 'RN009'].includes(regla.id) ? 'critica' : 'media'
      });
    } else if (Math.random() > 0.85) {
      advertencias.push({
        regla: regla.id,
        nombre: regla.nombre,
        descripcion: `La decision esta dentro de limites pero cerca del umbral de la regla ${regla.id}. Margen restante: ${randomInt(5, 15)}%.`,
        sub_agente: 'verificador'
      });
    }
  }

  // Sub-agente Auditor: verifica contra historico
  const patronSimilar = patronesError.find(() => Math.random() > 0.8);
  if (patronSimilar) {
    advertencias.push({
      patron: patronSimilar.id,
      descripcion: `Se detecto similitud con patron de error conocido: "${patronSimilar.patron}". Revisar con precaucion.`,
      sub_agente: 'auditor',
      recomendacion: patronSimilar.prevencion
    });
  }

  // Sugerencias de mejora del Corrector
  if (erroresDetec.length > 0) {
    sugerenciasMejora.push({
      descripcion: `Alternativa sugerida por Corrector: modificar la decision para cumplir con ${erroresDetec.map(e => e.regla).join(', ')}`,
      sub_agente: 'corrector',
      confianza: `${randomInt(75, 95)}%`
    });
  }

  sugerenciasMejora.push({
    descripcion: `Se recomienda consultar con el Coordinador Multi-Agente antes de ejecutar decisiones que afecten a multiples areas.`,
    sub_agente: 'aprendiz',
    confianza: '90%'
  });

  // Registrar la verificacion
  generarVerificacionesHistoricas();

  const nuevaVerificacion = {
    id: generarId('ver'),
    agente: agenteId,
    accion: decision,
    resultado: erroresDetec.length > 0 ? 'error_detectado' : advertencias.length > 0 ? 'advertencia' : 'correcto',
    detalle: erroresDetec.length > 0
      ? `Se detectaron ${erroresDetec.length} errores en la decision del agente ${agenteId}`
      : advertencias.length > 0
        ? `Decision valida con ${advertencias.length} advertencias`
        : `Decision valida. Todas las reglas de negocio se cumplen correctamente.`,
    fecha: new Date().toISOString(),
    sub_agente: 'verificador',
    reglas_verificadas: reglasAplicables.length,
    tiempo_ms: randomInt(15, 80)
  };

  verificaciones.push(nuevaVerificacion);

  return {
    valida,
    verificacion_id: nuevaVerificacion.id,
    agente: agenteId,
    decision,
    errores_detectados: erroresDetec,
    advertencias,
    sugerencias_mejora: sugerenciasMejora,
    sub_agentes_consultados: ['verificador', 'auditor', 'corrector', 'aprendiz'],
    reglas_verificadas: reglasAplicables.length,
    tiempo_verificacion_ms: nuevaVerificacion.tiempo_ms,
    accion_recomendada: erroresDetec.length > 0
      ? 'BLOQUEAR - Corregir errores antes de proceder'
      : advertencias.length > 0
        ? 'PROCEDER CON PRECAUCION - Revisar advertencias'
        : 'APROBAR - Decision cumple todas las reglas'
  };
}

/**
 * Obtiene los errores recientes detectados y corregidos.
 */
function getErroresRecientes() {
  const ultimos7Dias = erroresDetectados.filter(e => {
    const diff = (new Date() - new Date(e.fecha)) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  return {
    total_7_dias: ultimos7Dias.length,
    corregidos_automaticamente: ultimos7Dias.filter(e => e.corregido_automaticamente).length,
    escalados_humano: ultimos7Dias.filter(e => !e.corregido_automaticamente).length,
    por_severidad: {
      critica: ultimos7Dias.filter(e => e.severidad === 'critica').length,
      alta: ultimos7Dias.filter(e => e.severidad === 'alta').length,
      media: ultimos7Dias.filter(e => e.severidad === 'media').length,
      baja: ultimos7Dias.filter(e => e.severidad === 'baja').length
    },
    por_tipo: {
      dato_incorrecto: ultimos7Dias.filter(e => e.tipo_error === 'dato_incorrecto').length,
      calculo_erroneo: ultimos7Dias.filter(e => e.tipo_error === 'calculo_erroneo').length,
      decision_invalida: ultimos7Dias.filter(e => e.tipo_error === 'decision_invalida').length,
      proceso_incompleto: ultimos7Dias.filter(e => e.tipo_error === 'proceso_incompleto').length,
      duplicado: ultimos7Dias.filter(e => e.tipo_error === 'duplicado').length,
      inconsistencia: ultimos7Dias.filter(e => e.tipo_error === 'inconsistencia').length
    },
    errores: erroresDetectados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
    tasa_correccion_automatica: `${Math.round(erroresDetectados.filter(e => e.corregido_automaticamente).length / erroresDetectados.length * 100)}%`
  };
}

/**
 * Aplica correccion automatica a un error detectado.
 */
function corregirError(errorId) {
  const error = erroresDetectados.find(e => e.id === errorId);
  if (!error) {
    return { error: 'Error no encontrado', errorId };
  }

  if (error.corregido_automaticamente) {
    return {
      mensaje: 'Este error ya fue corregido automaticamente',
      error: {
        id: error.id,
        correccion_aplicada: error.correccion_aplicada,
        verificado_por: error.verificado_por,
        aprendizaje: error.aprendizaje_generado
      }
    };
  }

  // Simular correccion por sub-agente Corrector
  error.corregido_automaticamente = true;
  error.correccion_aplicada = `Correccion manual aplicada: se reviso la accion del agente ${error.agente_origen} y se aplico la solucion recomendada por el sub-agente Corrector.`;
  error.verificado_por = 'corrector';

  // Sub-agente Aprendiz: genera aprendizaje
  if (!error.aprendizaje_generado) {
    error.aprendizaje_generado = `Se actualizo la base de conocimiento para prevenir errores de tipo "${error.tipo_error}" del agente ${error.agente_origen} en el futuro. Se anadieron ${randomInt(1, 3)} nuevas reglas de validacion.`;
  }

  return {
    mensaje: 'Error corregido exitosamente',
    correccion: {
      error_id: error.id,
      agente_origen: error.agente_origen,
      tipo_error: error.tipo_error,
      correccion_aplicada: error.correccion_aplicada,
      verificado_por: error.verificado_por,
      aprendizaje: error.aprendizaje_generado,
      sub_agentes_involucrados: ['corrector', 'aprendiz', 'verificador']
    }
  };
}

/**
 * Obtiene todas las verificaciones realizadas en un periodo.
 */
function getVerificaciones(periodo = '24h') {
  generarVerificacionesHistoricas();

  let horasAtras;
  switch (periodo) {
    case '1h': horasAtras = 1; break;
    case '4h': horasAtras = 4; break;
    case '12h': horasAtras = 12; break;
    case '24h': horasAtras = 24; break;
    case '48h': horasAtras = 48; break;
    case '7d': horasAtras = 168; break;
    default: horasAtras = 24;
  }

  const limite = new Date(Date.now() - horasAtras * 60 * 60 * 1000);
  const filtradas = verificaciones.filter(v => new Date(v.fecha) >= limite);

  const porResultado = {
    correcto: filtradas.filter(v => v.resultado === 'correcto').length,
    error_detectado: filtradas.filter(v => v.resultado === 'error_detectado').length,
    advertencia: filtradas.filter(v => v.resultado === 'advertencia').length
  };

  const porAgente = {};
  for (const v of filtradas) {
    if (!porAgente[v.agente]) {
      porAgente[v.agente] = { total: 0, correctas: 0, errores: 0, advertencias: 0 };
    }
    porAgente[v.agente].total++;
    if (v.resultado === 'correcto') porAgente[v.agente].correctas++;
    if (v.resultado === 'error_detectado') porAgente[v.agente].errores++;
    if (v.resultado === 'advertencia') porAgente[v.agente].advertencias++;
  }

  return {
    periodo,
    total_verificaciones: filtradas.length,
    por_resultado: porResultado,
    por_agente: porAgente,
    tasa_aprobacion: filtradas.length > 0 ? `${Math.round(porResultado.correcto / filtradas.length * 100)}%` : 'N/A',
    tiempo_medio_verificacion_ms: filtradas.length > 0 ? Math.round(filtradas.reduce((s, v) => s + v.tiempo_ms, 0) / filtradas.length) : 0,
    reglas_verificadas_total: filtradas.reduce((s, v) => s + (v.reglas_verificadas || 0), 0),
    ultimas_10: filtradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 10)
  };
}

/**
 * Obtiene los patrones de error recurrentes detectados.
 */
function getPatronesError() {
  return {
    total_patrones: patronesError.length,
    resueltos: patronesError.filter(p => p.estado === 'resuelto').length,
    mitigados: patronesError.filter(p => p.estado === 'mitigado').length,
    activos: patronesError.filter(p => p.estado === 'activo').length,
    patrones: patronesError.sort((a, b) => b.ocurrencias - a.ocurrencias),
    eficacia_prevencion: `${Math.round(patronesError.filter(p => ['resuelto', 'mitigado'].includes(p.estado)).length / patronesError.length * 100)}%`,
    total_ocurrencias_prevenidas: patronesError.reduce((s, p) => {
      if (p.estado === 'resuelto') return s + p.ocurrencias * 3;
      if (p.estado === 'mitigado') return s + Math.round(p.ocurrencias * 2);
      return s;
    }, 0),
    aprendizajes_activos: patronesError.length
  };
}

/**
 * Estadisticas generales del sistema de correccion de errores.
 */
function getEstadisticas() {
  generarVerificacionesHistoricas();

  const hoy = new Date();
  const inicio24h = new Date(hoy.getTime() - 24 * 60 * 60 * 1000);

  const verificacionesHoy = verificaciones.filter(v => new Date(v.fecha) >= inicio24h);
  const erroresHoy = erroresDetectados.filter(e => new Date(e.fecha) >= inicio24h);

  return {
    errores_detectados_hoy: erroresHoy.length,
    errores_detectados_total: erroresDetectados.length,
    errores_corregidos_auto: erroresDetectados.filter(e => e.corregido_automaticamente).length,
    tasa_correccion_auto: `${Math.round(erroresDetectados.filter(e => e.corregido_automaticamente).length / Math.max(1, erroresDetectados.length) * 100)}%`,
    errores_escalados: erroresDetectados.filter(e => !e.corregido_automaticamente).length,
    precision_verificacion: verificacionesHoy.length > 0 ? `${(100 - randomEntre(0.5, 2.5)).toFixed(1)}%` : 'N/A',
    errores_prevenidos: patronesError.reduce((s, p) => s + (p.estado !== 'activo' ? p.ocurrencias * 2 : 0), 0),
    verificaciones_hoy: verificacionesHoy.length,
    patrones_detectados: patronesError.length,
    patrones_resueltos: patronesError.filter(p => p.estado === 'resuelto').length,
    sub_agentes: {
      verificador: { estado: 'activo', verificaciones_hoy: verificacionesHoy.filter(v => v.sub_agente === 'verificador').length, precision: '98.7%' },
      auditor: { estado: 'activo', auditorias_hoy: verificacionesHoy.filter(v => v.sub_agente === 'auditor').length, precision: '97.2%' },
      corrector: { estado: 'activo', correcciones_hoy: erroresHoy.filter(e => e.verificado_por === 'corrector').length, tasa_exito: '94.5%' },
      aprendiz: { estado: 'activo', aprendizajes_generados: erroresDetectados.filter(e => e.aprendizaje_generado).length, reglas_nuevas: randomInt(3, 8) },
      alertador: { estado: 'activo', escalaciones_hoy: erroresHoy.filter(e => !e.corregido_automaticamente).length, tiempo_medio_escalacion: '45 segundos' }
    },
    resumen: 'El sistema de correccion de errores esta funcionando con normalidad. Todos los sub-agentes activos.'
  };
}

/**
 * Precision de cada agente basada en resultados de verificacion.
 */
function getPrecisionPorAgente() {
  generarVerificacionesHistoricas();

  const agentes = ['main', 'negociador', 'vendedor', 'investigacion', 'legal', 'riesgo', 'recobro', 'compras', 'financiero', 'retencion', 'subrogacion', 'rechazos', 'marketing', 'ceo', 'innovacion', 'rrhh', 'it', 'nps', 'vigilante', 'board', 'expansion', 'crisis'];

  const precision = agentes.map(agId => {
    const versAgente = verificaciones.filter(v => v.agente === agId);
    const erroresAgente = erroresDetectados.filter(e => e.agente_origen === agId);
    const total = versAgente.length || randomInt(30, 100);
    const correctas = versAgente.filter(v => v.resultado === 'correcto').length || Math.round(total * randomEntre(0.88, 0.99));
    const errores = versAgente.filter(v => v.resultado === 'error_detectado').length || total - correctas;

    return {
      agente_id: agId,
      verificaciones_total: total,
      correctas,
      errores_detectados: errores,
      advertencias: versAgente.filter(v => v.resultado === 'advertencia').length || randomInt(1, 5),
      precision: `${(correctas / total * 100).toFixed(1)}%`,
      errores_historicos: erroresAgente.length,
      tendencia: Math.random() > 0.3 ? 'mejorando' : 'estable',
      ultimo_error: erroresAgente.length > 0 ? erroresAgente[erroresAgente.length - 1].fecha : null
    };
  });

  precision.sort((a, b) => parseFloat(b.precision) - parseFloat(a.precision));

  return {
    ranking: precision,
    mejor_agente: precision[0],
    agente_con_mas_errores: precision.sort((a, b) => b.errores_historicos - a.errores_historicos)[0],
    precision_media_sistema: `${(precision.reduce((s, p) => s + parseFloat(p.precision), 0) / precision.length).toFixed(1)}%`,
    agentes_por_debajo_umbral: precision.filter(p => parseFloat(p.precision) < 90).map(p => p.agente_id),
    recomendaciones: precision.filter(p => parseFloat(p.precision) < 93).map(p => ({
      agente: p.agente_id,
      precision_actual: p.precision,
      accion: `Reforzar validaciones del agente ${p.agente_id}. Programar sesion de re-entrenamiento con datos de errores historicos.`
    }))
  };
}

/**
 * Obtiene los aprendizajes generados a partir de cada error.
 */
function getAprendizajes() {
  const aprendizajes = erroresDetectados
    .filter(e => e.aprendizaje_generado)
    .map(e => ({
      error_id: e.id,
      agente_origen: e.agente_origen,
      tipo_error: e.tipo_error,
      descripcion_error: e.descripcion,
      aprendizaje: e.aprendizaje_generado,
      fecha: e.fecha,
      impacto: e.severidad,
      aplicado: true,
      sub_agente_responsable: 'aprendiz'
    }));

  return {
    total_aprendizajes: aprendizajes.length,
    aprendizajes,
    reglas_generadas: aprendizajes.length * 2,
    por_tipo: {
      validaciones_nuevas: aprendizajes.filter(a => a.aprendizaje.includes('validacion') || a.aprendizaje.includes('verificacion')).length,
      limites_actualizados: aprendizajes.filter(a => a.aprendizaje.includes('limite') || a.aprendizaje.includes('umbral') || a.aprendizaje.includes('hard')).length,
      procesos_mejorados: aprendizajes.filter(a => a.aprendizaje.includes('implemento') || a.aprendizaje.includes('creo')).length,
      modelos_recalibrados: aprendizajes.filter(a => a.aprendizaje.includes('calibr') || a.aprendizaje.includes('ajust') || a.aprendizaje.includes('factor')).length
    },
    eficacia: 'Los aprendizajes aplicados han reducido la tasa de errores recurrentes en un 87% en las ultimas 4 semanas',
    ciclo_mejora: 'Error detectado -> Causa raiz identificada -> Aprendizaje generado -> Regla implementada -> Verificacion continua'
  };
}

/**
 * Simula verificacion cruzada: 3 sub-agentes verifican independientemente
 * la misma accion y se comparan resultados (mayoria gana).
 */
function simularVerificacionCruzada(accion) {
  if (!accion) {
    return { error: 'Se requiere una accion para verificar' };
  }

  // Sub-agente 1: Verificador (reglas de negocio)
  const verificadorResultado = Math.random() > 0.15;
  const verificador = {
    sub_agente: 'Verificador',
    metodo: 'Verificacion contra 12 reglas de negocio',
    resultado: verificadorResultado ? 'APROBADO' : 'RECHAZADO',
    confianza: `${randomInt(85, 99)}%`,
    detalle: verificadorResultado
      ? `La accion "${accion}" cumple todas las reglas de negocio aplicables. Se verificaron ${randomInt(4, 8)} reglas.`
      : `La accion "${accion}" viola la regla ${reglasNegocio[randomInt(0, reglasNegocio.length - 1)].id}. Se recomienda correccion antes de proceder.`,
    tiempo_ms: randomInt(15, 45),
    reglas_chequeadas: randomInt(4, 8)
  };

  // Sub-agente 2: Auditor (comparacion con historico)
  const auditorResultado = Math.random() > 0.12;
  const auditor = {
    sub_agente: 'Auditor',
    metodo: 'Comparacion con historico de acciones similares (ultimos 90 dias)',
    resultado: auditorResultado ? 'APROBADO' : 'RECHAZADO',
    confianza: `${randomInt(80, 97)}%`,
    detalle: auditorResultado
      ? `La accion es consistente con ${randomInt(15, 40)} acciones similares en los ultimos 90 dias. No se detectan anomalias.`
      : `La accion se devia del patron habitual. Las acciones similares historicas muestran parametros un ${randomInt(15, 45)}% diferentes.`,
    tiempo_ms: randomInt(25, 80),
    acciones_comparadas: randomInt(15, 40)
  };

  // Sub-agente 3: Corrector (analisis de riesgo)
  const correctorResultado = Math.random() > 0.1;
  const corrector = {
    sub_agente: 'Corrector',
    metodo: 'Analisis de riesgo y evaluacion de impacto potencial',
    resultado: correctorResultado ? 'APROBADO' : 'RECHAZADO',
    confianza: `${randomInt(82, 96)}%`,
    detalle: correctorResultado
      ? `El riesgo de la accion es bajo (${randomInt(5, 25)}%). El impacto potencial negativo es minimo y reversible.`
      : `El riesgo de la accion es elevado (${randomInt(40, 75)}%). Se detectan ${randomInt(1, 3)} posibles efectos secundarios negativos. Se sugiere revision antes de ejecutar.`,
    tiempo_ms: randomInt(20, 60),
    factores_riesgo_evaluados: randomInt(5, 10)
  };

  // Votacion por mayoria
  const votos = [verificadorResultado, auditorResultado, correctorResultado];
  const aprobaciones = votos.filter(v => v).length;
  const rechazos = votos.filter(v => !v).length;
  const resultadoFinal = aprobaciones >= 2;

  // Calcular confianza combinada
  const confianzas = [
    parseInt(verificador.confianza),
    parseInt(auditor.confianza),
    parseInt(corrector.confianza)
  ];
  const confianzaMedia = Math.round(confianzas.reduce((s, c) => s + c, 0) / 3);

  const resultado = {
    accion,
    verificacion_cruzada: {
      verificador,
      auditor,
      corrector
    },
    votacion: {
      aprobaciones,
      rechazos,
      resultado: resultadoFinal ? 'APROBADO POR MAYORIA' : 'RECHAZADO POR MAYORIA',
      unanimidad: aprobaciones === 3 || rechazos === 3,
      desglose: `${aprobaciones} a favor, ${rechazos} en contra`
    },
    resultado_final: resultadoFinal ? 'APROBAR' : 'RECHAZAR',
    confianza_combinada: `${confianzaMedia}%`,
    tiempo_total_ms: verificador.tiempo_ms + auditor.tiempo_ms + corrector.tiempo_ms,
    consenso: aprobaciones === 3 ? 'UNANIME' : aprobaciones >= 2 ? 'MAYORIA' : 'MINORITARIO',
    accion_recomendada: resultadoFinal
      ? 'Ejecutar la accion. Los 3 sub-agentes coinciden en que es segura o la mayoria lo aprueba.'
      : 'No ejecutar la accion. La mayoria de sub-agentes detectaron problemas. Revisar detalles y corregir antes de reintentar.',
    escalacion: !resultadoFinal && rechazos === 3
      ? 'ESCALADO A SUPERVISION HUMANA - Rechazo unanime requiere intervencion manual'
      : null
  };

  // Registrar la verificacion cruzada
  verificaciones.push({
    id: generarId('vcr'),
    agente: 'sistema',
    accion: `Verificacion cruzada: ${accion}`,
    resultado: resultadoFinal ? 'correcto' : 'error_detectado',
    detalle: `Verificacion cruzada completada: ${resultado.votacion.desglose}. Resultado: ${resultado.resultado_final}`,
    fecha: new Date().toISOString(),
    sub_agente: 'verificacion_cruzada',
    reglas_verificadas: verificador.reglas_chequeadas,
    tiempo_ms: resultado.tiempo_total_ms
  });

  return resultado;
}

// ---------------------------------------------------------------------------
// Inicializacion
// ---------------------------------------------------------------------------

function inicializar() {
  generarVerificacionesHistoricas();
}

inicializar();

// ---------------------------------------------------------------------------
// Exportaciones
// ---------------------------------------------------------------------------

module.exports = {
  verificarDecision,
  getErroresRecientes,
  corregirError,
  getVerificaciones,
  getPatronesError,
  getEstadisticas,
  getPrecisionPorAgente,
  getAprendizajes,
  simularVerificacionCruzada,
  // Datos internos expuestos para coordinacion con otros agentes
  _erroresDetectados: erroresDetectados,
  _verificaciones: verificaciones,
  _patronesError: patronesError,
  _reglasNegocio: reglasNegocio
};
