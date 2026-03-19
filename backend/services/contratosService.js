// =============================================================================
// Contratos Service - Generador de Contratos y Documentos Legales
// Propuestas comerciales, contratos SaaS, SLA, DPA y NDA
// con contenido legal realista en espanol y sustitucion de variables
// =============================================================================

const TIPOS_CONTRATO = {
  propuesta_comercial: {
    nombre: 'Propuesta Comercial',
    descripcion: 'Propuesta de servicios con calculadora ROI, planes de precios e hitos de implementacion',
    variables_requeridas: ['empresa', 'contacto', 'email', 'plan', 'num_usuarios', 'duracion_meses']
  },
  contrato_saas: {
    nombre: 'Contrato SaaS',
    descripcion: 'Contrato de Software como Servicio con terminos de uso, SLA y tratamiento de datos',
    variables_requeridas: ['empresa', 'cif', 'representante', 'email', 'plan', 'duracion_meses']
  },
  sla_agreement: {
    nombre: 'Acuerdo de Nivel de Servicio (SLA)',
    descripcion: 'Tiempos de respuesta, garantias de disponibilidad y penalizaciones',
    variables_requeridas: ['empresa', 'plan', 'fecha_inicio']
  },
  dpa: {
    nombre: 'Acuerdo de Tratamiento de Datos (DPA)',
    descripcion: 'Cumplimiento RGPD, tratamiento de datos y medidas de seguridad',
    variables_requeridas: ['empresa', 'cif', 'representante', 'dpo_email']
  },
  nda: {
    nombre: 'Acuerdo de Confidencialidad (NDA)',
    descripcion: 'Terminos de confidencialidad para demostraciones y pilotos',
    variables_requeridas: ['empresa', 'representante', 'duracion_meses']
  }
};

const PLANES_PRECIO = {
  starter: { nombre: 'Starter', precio_usuario_mes: 29, usuarios_min: 5, usuarios_max: 20, soporte: 'Email (48h)', sla_uptime: 99.0 },
  professional: { nombre: 'Professional', precio_usuario_mes: 59, usuarios_min: 10, usuarios_max: 100, soporte: 'Email + Chat (24h)', sla_uptime: 99.5 },
  enterprise: { nombre: 'Enterprise', precio_usuario_mes: 99, usuarios_min: 25, usuarios_max: 500, soporte: 'Dedicado 24/7 (4h)', sla_uptime: 99.9 }
};

let contadorContratos = 8;

const contratos = [
  {
    id: 'CTR-001', tipo: 'propuesta_comercial', destinatario: 'Seguros Iberica S.A.',
    estado: 'firmado', fecha_creacion: '2025-06-01T10:00:00Z', fecha_envio: '2025-06-02T09:00:00Z', fecha_firma: '2025-06-10T14:30:00Z',
    variables: { empresa: 'Seguros Iberica S.A.', contacto: 'Roberto Alvarez', email: 'ralvarez@seguroiberica.es', plan: 'enterprise', num_usuarios: 50, duracion_meses: 24 },
    contenido: null
  },
  {
    id: 'CTR-002', tipo: 'contrato_saas', destinatario: 'Seguros Iberica S.A.',
    estado: 'activo', fecha_creacion: '2025-06-12T10:00:00Z', fecha_envio: '2025-06-12T11:00:00Z', fecha_firma: '2025-06-15T16:00:00Z',
    variables: { empresa: 'Seguros Iberica S.A.', cif: 'A28456789', representante: 'Roberto Alvarez', email: 'ralvarez@seguroiberica.es', plan: 'enterprise', duracion_meses: 24 },
    contenido: null
  },
  {
    id: 'CTR-003', tipo: 'nda', destinatario: 'MutualPlus Seguros',
    estado: 'firmado', fecha_creacion: '2025-07-01T09:00:00Z', fecha_envio: '2025-07-01T10:00:00Z', fecha_firma: '2025-07-03T11:00:00Z',
    variables: { empresa: 'MutualPlus Seguros', representante: 'Elena Navarro', duracion_meses: 12 },
    contenido: null
  },
  {
    id: 'CTR-004', tipo: 'propuesta_comercial', destinatario: 'MutualPlus Seguros',
    estado: 'enviado', fecha_creacion: '2025-07-05T14:00:00Z', fecha_envio: '2025-07-06T09:00:00Z', fecha_firma: null,
    variables: { empresa: 'MutualPlus Seguros', contacto: 'Elena Navarro', email: 'enavarro@mutualplus.es', plan: 'professional', num_usuarios: 30, duracion_meses: 12 },
    contenido: null
  },
  {
    id: 'CTR-005', tipo: 'sla_agreement', destinatario: 'Seguros Iberica S.A.',
    estado: 'activo', fecha_creacion: '2025-06-15T10:00:00Z', fecha_envio: '2025-06-15T11:00:00Z', fecha_firma: '2025-06-16T09:00:00Z',
    variables: { empresa: 'Seguros Iberica S.A.', plan: 'enterprise', fecha_inicio: '2025-07-01' },
    contenido: null
  },
  {
    id: 'CTR-006', tipo: 'dpa', destinatario: 'Seguros Iberica S.A.',
    estado: 'activo', fecha_creacion: '2025-06-15T12:00:00Z', fecha_envio: '2025-06-15T13:00:00Z', fecha_firma: '2025-06-16T10:00:00Z',
    variables: { empresa: 'Seguros Iberica S.A.', cif: 'A28456789', representante: 'Roberto Alvarez', dpo_email: 'dpo@seguroiberica.es' },
    contenido: null
  },
  {
    id: 'CTR-007', tipo: 'propuesta_comercial', destinatario: 'AsisteYa Correduria',
    estado: 'borrador', fecha_creacion: '2025-09-01T16:00:00Z', fecha_envio: null, fecha_firma: null,
    variables: { empresa: 'AsisteYa Correduria', contacto: 'Miguel Torres', email: 'mtorres@asisteya.es', plan: 'starter', num_usuarios: 8, duracion_meses: 12 },
    contenido: null
  },
  {
    id: 'CTR-008', tipo: 'nda', destinatario: 'Grupo Asegurador del Norte',
    estado: 'expirado', fecha_creacion: '2024-09-01T10:00:00Z', fecha_envio: '2024-09-01T11:00:00Z', fecha_firma: '2024-09-05T09:00:00Z',
    variables: { empresa: 'Grupo Asegurador del Norte', representante: 'Carmen Ruiz', duracion_meses: 6 },
    contenido: null
  }
];

// Rellenar contenido de los contratos pre-existentes
contratos.forEach(c => { c.contenido = generarContenido(c.tipo, c.variables); });

/**
 * Genera el contenido del documento segun tipo y variables
 */
function generarContenido(tipo, variables) {
  const v = variables || {};
  const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  switch (tipo) {
    case 'propuesta_comercial':
      return generarPropuestaComercial(v, fecha);
    case 'contrato_saas':
      return generarContratoSaaS(v, fecha);
    case 'sla_agreement':
      return generarSLA(v, fecha);
    case 'dpa':
      return generarDPA(v, fecha);
    case 'nda':
      return generarNDA(v, fecha);
    default:
      return { error: `Tipo de contrato no reconocido: ${tipo}` };
  }
}

function generarPropuestaComercial(v, fecha) {
  const plan = PLANES_PRECIO[v.plan] || PLANES_PRECIO.professional;
  const numUsuarios = parseInt(v.num_usuarios) || 20;
  const duracion = parseInt(v.duracion_meses) || 12;
  const precioMensual = plan.precio_usuario_mes * numUsuarios;
  const precioAnual = precioMensual * 12;
  const descuento = duracion >= 24 ? 0.15 : duracion >= 12 ? 0.10 : 0;
  const precioConDescuento = Math.round(precioMensual * (1 - descuento));
  const totalContrato = precioConDescuento * duracion;

  // Calcular ROI
  const costeActualEstimado = precioMensual * 3.2; // Se asume que el coste actual es ~3.2x
  const ahorroMensual = costeActualEstimado - precioConDescuento;
  const roiMeses = Math.ceil(precioConDescuento * 3 / ahorroMensual); // Tiempo para recuperar 3 meses de inversion
  const roiAnual = Math.round((ahorroMensual * 12 / (precioConDescuento * 12)) * 100);

  return {
    titulo: `PROPUESTA COMERCIAL - Plataforma de Gestion de Siniestros IA`,
    destinatario: { empresa: v.empresa, contacto: v.contacto, email: v.email },
    fecha,
    resumen_ejecutivo: `Estimado/a ${v.contacto || 'cliente'},\n\nTenemos el placer de presentarle nuestra propuesta para la implementacion de la Plataforma de Gestion de Siniestros con Inteligencia Artificial en ${v.empresa || 'su organizacion'}. Nuestra solucion permite automatizar hasta el 70% de los procesos de tramitacion de siniestros, reduciendo tiempos de respuesta y mejorando la satisfaccion del cliente.`,
    plan_seleccionado: {
      nombre: plan.nombre,
      usuarios: numUsuarios,
      precio_por_usuario_mes: plan.precio_usuario_mes,
      precio_mensual_sin_descuento: precioMensual,
      descuento_aplicado: `${descuento * 100}%`,
      precio_mensual_final: precioConDescuento,
      duracion_meses: duracion,
      total_contrato: totalContrato,
      soporte_incluido: plan.soporte,
      sla_disponibilidad: `${plan.sla_uptime}%`
    },
    calculadora_roi: {
      coste_actual_estimado_mensual: costeActualEstimado,
      coste_con_plataforma_mensual: precioConDescuento,
      ahorro_mensual: ahorroMensual,
      ahorro_anual: ahorroMensual * 12,
      roi_anual_porcentaje: roiAnual,
      payback_meses: roiMeses,
      beneficios_adicionales: [
        'Reduccion del 60% en tiempo de tramitacion de siniestros',
        'Deteccion automatica de fraude (ahorro estimado: 15% en pagos indebidos)',
        'Mejora del NPS en +25 puntos',
        'Reduccion del 40% en carga de trabajo del equipo'
      ]
    },
    timeline_implementacion: [
      { fase: 'Fase 1: Configuracion y Setup', semanas: '1-2', descripcion: 'Configuracion del entorno, integracion con sistemas existentes y migracion de datos historicos.' },
      { fase: 'Fase 2: Formacion del Equipo', semanas: '3-4', descripcion: 'Formacion presencial y online para todos los usuarios. Documentacion personalizada.' },
      { fase: 'Fase 3: Piloto Controlado', semanas: '5-6', descripcion: 'Puesta en marcha con un equipo reducido. Ajustes y optimizacion basados en feedback.' },
      { fase: 'Fase 4: Despliegue Completo', semanas: '7-8', descripcion: 'Activacion para todos los usuarios. Soporte dedicado durante las primeras 4 semanas.' },
      { fase: 'Fase 5: Optimizacion Continua', semanas: '9-12', descripcion: 'Analisis de metricas, ajuste de modelos IA y revision trimestral de rendimiento.' }
    ],
    condiciones: {
      validez_propuesta: '30 dias naturales desde la fecha de emision',
      forma_pago: 'Facturacion mensual por transferencia bancaria (30 dias)',
      periodo_prueba: '14 dias gratuitos sin compromiso',
      clausula_salida: `Cancelacion con 30 dias de preaviso tras el periodo minimo de ${Math.min(duracion, 6)} meses`
    }
  };
}

function generarContratoSaaS(v, fecha) {
  const plan = PLANES_PRECIO[v.plan] || PLANES_PRECIO.professional;
  const duracion = parseInt(v.duracion_meses) || 12;

  return {
    titulo: 'CONTRATO DE LICENCIA DE SOFTWARE COMO SERVICIO (SaaS)',
    cabecera: `En Madrid, a ${fecha}`,
    partes: {
      prestador: {
        nombre: 'SiniestrosAI Technologies S.L.',
        cif: 'B12345678',
        domicilio: 'Calle de la Innovacion 42, 28020 Madrid',
        representante: 'Director General'
      },
      cliente: {
        nombre: v.empresa,
        cif: v.cif,
        representante: v.representante,
        email: v.email
      }
    },
    clausulas: [
      {
        numero: 1,
        titulo: 'OBJETO DEL CONTRATO',
        contenido: `El presente contrato tiene por objeto regular las condiciones de acceso y uso de la Plataforma de Gestion de Siniestros con IA (en adelante, "la Plataforma") por parte de ${v.empresa} (en adelante, "el Cliente"), en la modalidad de Software como Servicio (SaaS).`
      },
      {
        numero: 2,
        titulo: 'DURACION Y RENOVACION',
        contenido: `El presente contrato tendra una duracion de ${duracion} meses desde la fecha de activacion del servicio. Se renovara automaticamente por periodos iguales salvo notificacion en contrario con 30 dias de antelacion.`
      },
      {
        numero: 3,
        titulo: 'LICENCIA DE USO',
        contenido: `Se concede al Cliente una licencia no exclusiva, intransferible y revocable para el uso de la Plataforma en el plan ${plan.nombre}. La licencia incluye acceso para los usuarios autorizados, actualizaciones de software y soporte tecnico segun el nivel contratado.`
      },
      {
        numero: 4,
        titulo: 'PRECIO Y FORMA DE PAGO',
        contenido: `El precio del servicio es de ${plan.precio_usuario_mes} EUR/usuario/mes (IVA no incluido). La facturacion sera mensual y el pago se realizara por transferencia bancaria en un plazo de 30 dias desde la fecha de factura. El impago durante 30 dias habilitara la suspension del servicio.`
      },
      {
        numero: 5,
        titulo: 'NIVEL DE SERVICIO (SLA)',
        contenido: `El prestador garantiza una disponibilidad minima del ${plan.sla_uptime}% mensual, excluyendo ventanas de mantenimiento programado (notificadas con 48h de antelacion). El incumplimiento del SLA dara derecho a compensaciones segun el Anexo de SLA adjunto.`
      },
      {
        numero: 6,
        titulo: 'PROTECCION DE DATOS',
        contenido: 'El tratamiento de datos personales se regira por el Acuerdo de Tratamiento de Datos (DPA) adjunto como Anexo, en cumplimiento del Reglamento General de Proteccion de Datos (RGPD) y la Ley Organica 3/2018 de Proteccion de Datos Personales.'
      },
      {
        numero: 7,
        titulo: 'PROPIEDAD INTELECTUAL',
        contenido: 'La Plataforma, incluyendo su codigo fuente, algoritmos, modelos de IA, diseno y documentacion, es propiedad exclusiva del Prestador. El Cliente no adquiere ningun derecho de propiedad intelectual sobre la misma. Los datos introducidos por el Cliente son y seguiran siendo propiedad del Cliente.'
      },
      {
        numero: 8,
        titulo: 'CONFIDENCIALIDAD',
        contenido: 'Ambas partes se comprometen a mantener la confidencialidad de toda informacion tecnica, comercial y financiera intercambiada en el marco de este contrato, durante su vigencia y durante 2 anos tras su finalizacion.'
      },
      {
        numero: 9,
        titulo: 'LIMITACION DE RESPONSABILIDAD',
        contenido: 'La responsabilidad total del Prestador bajo este contrato no excedera el importe total abonado por el Cliente durante los 12 meses anteriores al evento que genere la reclamacion. El Prestador no sera responsable de danos indirectos, lucro cesante o perdida de datos causada por mal uso de la Plataforma.'
      },
      {
        numero: 10,
        titulo: 'RESOLUCION',
        contenido: 'Cualquiera de las partes podra resolver el contrato con 30 dias de preaviso por escrito. En caso de incumplimiento grave, la parte afectada podra resolver de forma inmediata previa notificacion fehaciente. A la finalizacion, el Prestador facilitara la exportacion de datos del Cliente en un plazo de 30 dias.'
      }
    ],
    jurisdiccion: 'Para la resolucion de cualquier controversia derivada del presente contrato, las partes se someten a los Juzgados y Tribunales de Madrid, con renuncia expresa a cualquier otro fuero.'
  };
}

function generarSLA(v, fecha) {
  const plan = PLANES_PRECIO[v.plan] || PLANES_PRECIO.professional;

  return {
    titulo: 'ACUERDO DE NIVEL DE SERVICIO (SLA)',
    fecha,
    cliente: v.empresa,
    fecha_inicio: v.fecha_inicio || fecha,
    plan: plan.nombre,
    niveles_servicio: {
      disponibilidad: {
        garantia: `${plan.sla_uptime}%`,
        medicion: 'Mensual, calculada como (tiempo_total - tiempo_inactivo) / tiempo_total * 100',
        exclusiones: ['Mantenimiento programado (max 4h/mes, notificado con 48h)', 'Fuerza mayor', 'Problemas de conectividad del cliente']
      },
      tiempos_respuesta: {
        critico: { descripcion: 'Servicio inoperativo para todos los usuarios', tiempo_respuesta: plan.nombre === 'Enterprise' ? '30 minutos' : '2 horas', tiempo_resolucion: plan.nombre === 'Enterprise' ? '4 horas' : '8 horas' },
        alto: { descripcion: 'Funcionalidad principal degradada o inoperativa', tiempo_respuesta: plan.nombre === 'Enterprise' ? '1 hora' : '4 horas', tiempo_resolucion: plan.nombre === 'Enterprise' ? '8 horas' : '24 horas' },
        medio: { descripcion: 'Funcionalidad secundaria afectada con workaround disponible', tiempo_respuesta: plan.nombre === 'Enterprise' ? '4 horas' : '8 horas', tiempo_resolucion: '48 horas' },
        bajo: { descripcion: 'Consulta general o solicitud de mejora', tiempo_respuesta: plan.nombre === 'Enterprise' ? '8 horas' : '24 horas', tiempo_resolucion: '5 dias laborables' }
      },
      soporte: plan.soporte
    },
    penalizaciones: {
      nivel_1: { rango: `Disponibilidad entre ${plan.sla_uptime - 0.5}% y ${plan.sla_uptime}%`, compensacion: '5% de la cuota mensual' },
      nivel_2: { rango: `Disponibilidad entre ${plan.sla_uptime - 1.5}% y ${plan.sla_uptime - 0.5}%`, compensacion: '10% de la cuota mensual' },
      nivel_3: { rango: `Disponibilidad inferior al ${plan.sla_uptime - 1.5}%`, compensacion: '25% de la cuota mensual' },
      limite: 'La compensacion maxima mensual no excedera el 25% de la cuota mensual del servicio',
      procedimiento: 'El cliente debera solicitar la compensacion por escrito en un plazo de 30 dias desde el incumplimiento.'
    },
    metricas_rendimiento: {
      tiempo_carga_pagina: '< 2 segundos (P95)',
      tiempo_procesamiento_ia: '< 5 segundos para analisis estandar',
      capacidad_concurrente: `${plan.nombre === 'Enterprise' ? 500 : plan.nombre === 'Professional' ? 100 : 20} usuarios simultaneos`,
      backup: 'Backups automaticos cada 6 horas. Retencion de 30 dias.',
      rpo: '6 horas (Recovery Point Objective)',
      rto: plan.nombre === 'Enterprise' ? '1 hora' : '4 horas'
    },
    revisiones: 'Este SLA sera revisado trimestralmente. Cualquier modificacion requerira acuerdo escrito de ambas partes.'
  };
}

function generarDPA(v, fecha) {
  return {
    titulo: 'ACUERDO DE TRATAMIENTO DE DATOS PERSONALES (DPA)',
    subtitulo: 'En cumplimiento del Reglamento (UE) 2016/679 (RGPD)',
    fecha,
    partes: {
      responsable: { nombre: v.empresa, cif: v.cif, representante: v.representante, dpo: v.dpo_email },
      encargado: { nombre: 'SiniestrosAI Technologies S.L.', cif: 'B12345678', dpo: 'dpo@siniestrosai.es' }
    },
    clausulas: [
      {
        numero: 1,
        titulo: 'OBJETO Y FINALIDAD DEL TRATAMIENTO',
        contenido: 'El Encargado tratara los datos personales por cuenta del Responsable unicamente para la prestacion de los servicios de gestion de siniestros mediante la Plataforma SaaS. Los datos seran tratados exclusivamente conforme a las instrucciones documentadas del Responsable.'
      },
      {
        numero: 2,
        titulo: 'CATEGORIAS DE DATOS TRATADOS',
        contenido: 'Datos identificativos (nombre, DNI/NIE, direccion), datos de contacto (telefono, email), datos del vehiculo (matricula, marca, modelo), datos de siniestros (circunstancias, partes implicados, fotografias), datos de salud (solo en caso de lesiones corporales, con consentimiento explicito), datos de voz (biometria vocal para identificacion, con consentimiento explicito).'
      },
      {
        numero: 3,
        titulo: 'MEDIDAS DE SEGURIDAD',
        contenido: 'El Encargado implementara las siguientes medidas tecnicas y organizativas:',
        medidas: [
          'Cifrado AES-256 de datos en reposo y TLS 1.3 en transito',
          'Control de acceso basado en roles (RBAC) con autenticacion multifactor',
          'Registros de auditoria de todos los accesos a datos personales',
          'Evaluaciones de vulnerabilidades trimestrales y tests de penetracion anuales',
          'Plan de continuidad de negocio y recuperacion ante desastres',
          'Formacion obligatoria en proteccion de datos para todo el personal',
          'Pseudonimizacion de datos en entornos de desarrollo y pruebas',
          'Segregacion logica de datos entre clientes (multi-tenancy seguro)'
        ]
      },
      {
        numero: 4,
        titulo: 'SUBENCARGADOS',
        contenido: 'El Encargado podra recurrir a subencargados previa autorizacion general del Responsable. Los subencargados actuales son: Amazon Web Services (alojamiento, region EU-West-1 Irlanda), Twilio (comunicaciones). El Encargado informara de cualquier cambio con 30 dias de antelacion.'
      },
      {
        numero: 5,
        titulo: 'TRANSFERENCIAS INTERNACIONALES',
        contenido: 'Todos los datos se almacenan y procesan dentro del Espacio Economico Europeo (EEE). En caso de que fuera necesaria una transferencia fuera del EEE, se aplicaran las Clausulas Contractuales Tipo aprobadas por la Comision Europea o mecanismos equivalentes.'
      },
      {
        numero: 6,
        titulo: 'DERECHOS DE LOS INTERESADOS',
        contenido: 'El Encargado asistira al Responsable en la atencion de los derechos de acceso, rectificacion, supresion, portabilidad, limitacion y oposicion de los interesados, respondiendo en un plazo maximo de 48 horas habiles a cualquier solicitud redirigida por el Responsable.'
      },
      {
        numero: 7,
        titulo: 'NOTIFICACION DE BRECHAS',
        contenido: 'El Encargado notificara al Responsable cualquier brecha de seguridad que afecte a datos personales en un plazo maximo de 24 horas desde su deteccion, proporcionando: naturaleza de la brecha, categorias y numero de interesados afectados, consecuencias probables y medidas adoptadas.'
      },
      {
        numero: 8,
        titulo: 'DEVOLUCION Y SUPRESION DE DATOS',
        contenido: 'A la finalizacion del contrato, el Encargado devolvera todos los datos personales al Responsable en formato estandar (CSV/JSON) y procedera a su supresion segura en un plazo de 30 dias, emitiendo certificado de destruccion. Se exceptuan los datos que deban conservarse por obligacion legal.'
      }
    ],
    auditoria: 'El Responsable podra realizar auditorias anuales del cumplimiento de este DPA, con 15 dias de preaviso, durante horario laboral y sin interferir en la operativa normal.',
    vigencia: 'Este DPA estara vigente mientras dure el contrato principal de prestacion de servicios.'
  };
}

function generarNDA(v, fecha) {
  const duracion = parseInt(v.duracion_meses) || 12;

  return {
    titulo: 'ACUERDO DE CONFIDENCIALIDAD (NDA)',
    subtitulo: 'Acuerdo Bilateral de No Divulgacion',
    fecha,
    partes: {
      parte_a: { nombre: 'SiniestrosAI Technologies S.L.', representante: 'Director Comercial' },
      parte_b: { nombre: v.empresa, representante: v.representante }
    },
    clausulas: [
      {
        numero: 1,
        titulo: 'DEFINICION DE INFORMACION CONFIDENCIAL',
        contenido: 'Se considerara Informacion Confidencial toda informacion tecnica, comercial, financiera, estrategica o de cualquier otra naturaleza que sea revelada por una parte a la otra, ya sea de forma oral, escrita, electronica o por cualquier otro medio, incluyendo pero no limitado a: especificaciones tecnicas, algoritmos, modelos de IA, datos de rendimiento, planes de negocio, listados de clientes, precios y condiciones comerciales, asi como cualquier material proporcionado durante demostraciones y periodos de prueba.'
      },
      {
        numero: 2,
        titulo: 'OBLIGACIONES DE CONFIDENCIALIDAD',
        contenido: 'Las partes se comprometen a: (a) No divulgar la Informacion Confidencial a terceros sin consentimiento previo por escrito. (b) Utilizar la Informacion Confidencial unicamente para evaluar la posible relacion comercial. (c) Limitar el acceso a la Informacion Confidencial a aquellos empleados que necesiten conocerla. (d) Proteger la Informacion Confidencial con al menos el mismo grado de cuidado con que protegen su propia informacion confidencial.'
      },
      {
        numero: 3,
        titulo: 'EXCLUSIONES',
        contenido: 'No se considerara Informacion Confidencial aquella que: (a) Sea o pase a ser de dominio publico sin incumplimiento de este acuerdo. (b) Estuviera en posesion de la parte receptora antes de su revelacion. (c) Sea recibida legitimamente de un tercero sin restricciones de confidencialidad. (d) Sea desarrollada independientemente sin uso de la Informacion Confidencial.'
      },
      {
        numero: 4,
        titulo: 'DURACION',
        contenido: `Este acuerdo tendra una duracion de ${duracion} meses desde su firma. Las obligaciones de confidencialidad se mantendran durante 2 anos adicionales tras su finalizacion.`
      },
      {
        numero: 5,
        titulo: 'DEVOLUCION DE MATERIALES',
        contenido: 'A la finalizacion de este acuerdo o a solicitud de la parte reveladora, la parte receptora devolvera o destruira toda la Informacion Confidencial recibida, incluyendo copias, en un plazo de 15 dias.'
      },
      {
        numero: 6,
        titulo: 'INCUMPLIMIENTO',
        contenido: 'El incumplimiento de este acuerdo dara derecho a la parte perjudicada a exigir indemnizacion por danos y perjuicios, asi como a solicitar medidas cautelares para prevenir futuras divulgaciones.'
      }
    ],
    jurisdiccion: 'Las partes se someten a los Juzgados y Tribunales de Madrid para la resolucion de cualquier controversia derivada de este acuerdo.',
    firmas: {
      parte_a: { nombre: 'SiniestrosAI Technologies S.L.', cargo: 'Director Comercial', fecha: '' },
      parte_b: { nombre: v.empresa, cargo: v.representante, fecha: '' }
    }
  };
}

/**
 * Genera un nuevo contrato/documento
 */
function generar(tipo, datos) {
  if (!tipo || !TIPOS_CONTRATO[tipo]) {
    return {
      error: `Tipo de contrato no valido. Tipos disponibles: ${Object.keys(TIPOS_CONTRATO).join(', ')}`,
      tipos_disponibles: Object.keys(TIPOS_CONTRATO).map(k => ({ tipo: k, ...TIPOS_CONTRATO[k] }))
    };
  }

  const definicion = TIPOS_CONTRATO[tipo];
  const variablesFaltantes = definicion.variables_requeridas.filter(v => !datos || !datos[v]);

  if (variablesFaltantes.length > 0) {
    return {
      error: 'Faltan variables requeridas para generar el documento',
      variables_faltantes: variablesFaltantes,
      variables_requeridas: definicion.variables_requeridas
    };
  }

  contadorContratos++;
  const contrato = {
    id: `CTR-${String(contadorContratos).padStart(3, '0')}`,
    tipo,
    destinatario: datos.empresa,
    estado: 'borrador',
    fecha_creacion: new Date().toISOString(),
    fecha_envio: null,
    fecha_firma: null,
    variables: { ...datos },
    contenido: generarContenido(tipo, datos)
  };

  contratos.push(contrato);

  return {
    contrato,
    mensaje: `Documento "${definicion.nombre}" generado correctamente para ${datos.empresa}.`,
    acciones_disponibles: ['enviar', 'editar', 'descargar_pdf', 'eliminar']
  };
}

/**
 * Obtiene el estado de un contrato
 */
function getEstado(contratoId) {
  if (!contratoId) {
    return { error: 'Se requiere el ID del contrato' };
  }

  const contrato = contratos.find(c => c.id === contratoId);
  if (!contrato) {
    return { error: `Contrato ${contratoId} no encontrado` };
  }

  const tipoInfo = TIPOS_CONTRATO[contrato.tipo];
  const diasDesdeCreacion = Math.floor((Date.now() - new Date(contrato.fecha_creacion).getTime()) / (1000 * 60 * 60 * 24));

  return {
    id: contrato.id,
    tipo: contrato.tipo,
    tipo_nombre: tipoInfo ? tipoInfo.nombre : contrato.tipo,
    destinatario: contrato.destinatario,
    estado: contrato.estado,
    fecha_creacion: contrato.fecha_creacion,
    fecha_envio: contrato.fecha_envio,
    fecha_firma: contrato.fecha_firma,
    dias_desde_creacion: diasDesdeCreacion,
    pendiente_accion: contrato.estado === 'borrador' ? 'Revisar y enviar' : contrato.estado === 'enviado' ? 'Pendiente de firma del cliente' : null,
    historial: [
      { accion: 'Creado', fecha: contrato.fecha_creacion },
      contrato.fecha_envio ? { accion: 'Enviado', fecha: contrato.fecha_envio } : null,
      contrato.fecha_firma ? { accion: 'Firmado', fecha: contrato.fecha_firma } : null
    ].filter(Boolean)
  };
}

/**
 * Lista contratos con filtros opcionales
 */
function listar(filtros) {
  let resultado = [...contratos];

  if (filtros) {
    if (filtros.tipo) {
      resultado = resultado.filter(c => c.tipo === filtros.tipo);
    }
    if (filtros.estado) {
      resultado = resultado.filter(c => c.estado === filtros.estado);
    }
    if (filtros.destinatario) {
      const busqueda = filtros.destinatario.toLowerCase();
      resultado = resultado.filter(c => c.destinatario.toLowerCase().includes(busqueda));
    }
    if (filtros.desde) {
      const desde = new Date(filtros.desde);
      resultado = resultado.filter(c => new Date(c.fecha_creacion) >= desde);
    }
    if (filtros.hasta) {
      const hasta = new Date(filtros.hasta);
      resultado = resultado.filter(c => new Date(c.fecha_creacion) <= hasta);
    }
  }

  // Ordenar por fecha de creacion descendente
  resultado.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));

  return {
    contratos: resultado.map(c => ({
      id: c.id,
      tipo: c.tipo,
      tipo_nombre: TIPOS_CONTRATO[c.tipo] ? TIPOS_CONTRATO[c.tipo].nombre : c.tipo,
      destinatario: c.destinatario,
      estado: c.estado,
      fecha_creacion: c.fecha_creacion,
      fecha_firma: c.fecha_firma
    })),
    total: resultado.length,
    filtros_aplicados: filtros || {}
  };
}

/**
 * Obtiene estadisticas de contratos
 */
function getEstadisticas() {
  const total_generados = contratos.length;
  const porEstado = {};
  contratos.forEach(c => {
    porEstado[c.estado] = (porEstado[c.estado] || 0) + 1;
  });

  const firmados = contratos.filter(c => c.estado === 'firmado' || c.estado === 'activo').length;
  const pendientes_firma = contratos.filter(c => c.estado === 'enviado').length;
  const borradores = contratos.filter(c => c.estado === 'borrador').length;
  const expirados = contratos.filter(c => c.estado === 'expirado').length;

  // Tasa de conversion: firmados/activos sobre el total de enviados+firmados+activos
  const totalEnviadosOFirmados = contratos.filter(c => ['enviado', 'firmado', 'activo'].includes(c.estado)).length;
  const tasa_conversion = totalEnviadosOFirmados > 0 ? Math.round((firmados / totalEnviadosOFirmados) * 100) : 0;

  // Distribucion por tipo
  const porTipo = {};
  contratos.forEach(c => {
    const nombre = TIPOS_CONTRATO[c.tipo] ? TIPOS_CONTRATO[c.tipo].nombre : c.tipo;
    porTipo[nombre] = (porTipo[nombre] || 0) + 1;
  });

  // Tiempo promedio hasta firma
  const contratosConFirma = contratos.filter(c => c.fecha_envio && c.fecha_firma);
  let tiempo_promedio_firma_dias = 0;
  if (contratosConFirma.length > 0) {
    const totalDias = contratosConFirma.reduce((sum, c) => {
      return sum + (new Date(c.fecha_firma) - new Date(c.fecha_envio)) / (1000 * 60 * 60 * 24);
    }, 0);
    tiempo_promedio_firma_dias = Math.round(totalDias / contratosConFirma.length * 10) / 10;
  }

  // Clientes unicos
  const clientesUnicos = [...new Set(contratos.map(c => c.destinatario))];

  return {
    total_generados,
    pendientes_firma,
    firmados,
    borradores,
    expirados,
    tasa_conversion,
    distribucion_por_estado: porEstado,
    distribucion_por_tipo: porTipo,
    tiempo_promedio_firma_dias,
    clientes_unicos: clientesUnicos.length,
    clientes: clientesUnicos,
    tipos_disponibles: Object.keys(TIPOS_CONTRATO).map(k => ({ tipo: k, nombre: TIPOS_CONTRATO[k].nombre })),
    ultima_actualizacion: new Date().toISOString()
  };
}

module.exports = {
  generar,
  getEstado,
  listar,
  getEstadisticas,
  contratos,
  TIPOS_CONTRATO,
  PLANES_PRECIO
};
