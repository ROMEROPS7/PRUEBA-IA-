// =============================================================================
// CEO Agent - Agente Virtual de Director Ejecutivo
// Sistema de IA para gestion ejecutiva y toma de decisiones estrategicas
// =============================================================================

const { v4: uuidv4 } = require('uuid') || { v4: () => `ceo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };

// --- Estado interno del agente CEO ---
const estado = {
  decisiones: [],
  alertas: [],
  objetivos: [],
  inicializado: false
};

// --- Utilidades ---
function generarId(prefijo = 'ceo') {
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

function randomEntre(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// --- Datos de departamentos ---
function generarDepartamentos() {
  return [
    {
      nombre: 'Finanzas',
      estado: 'verde',
      kpi_principal: { nombre: 'Margen EBITDA', valor: '23.4%', objetivo: '22%' },
      alertas: ['Revisar provisiones Q2 por incremento siniestralidad catastrofica'],
      responsable: 'CFO Virtual',
      empleados: 45,
      presupuesto_ejecutado: 78.3
    },
    {
      nombre: 'Operaciones',
      estado: 'amarillo',
      kpi_principal: { nombre: 'Tiempo medio tramitacion', valor: '4.2 dias', objetivo: '3.5 dias' },
      alertas: [
        'Backlog de siniestros pendientes supera umbral (+15%)',
        'Necesidad de refuerzo temporal en equipo de peritaje'
      ],
      responsable: 'COO Virtual',
      empleados: 120,
      presupuesto_ejecutado: 82.1
    },
    {
      nombre: 'Comercial y Marketing',
      estado: 'verde',
      kpi_principal: { nombre: 'Nuevas polizas/mes', valor: '1.247', objetivo: '1.100' },
      alertas: [],
      responsable: 'CMO Virtual',
      empleados: 65,
      presupuesto_ejecutado: 71.5
    },
    {
      nombre: 'Tecnologia',
      estado: 'verde',
      kpi_principal: { nombre: 'Disponibilidad sistemas', valor: '99.97%', objetivo: '99.9%' },
      alertas: ['Planificar migracion a cloud hibrida antes de Q3'],
      responsable: 'CTO Virtual',
      empleados: 55,
      presupuesto_ejecutado: 68.9
    },
    {
      nombre: 'Recursos Humanos',
      estado: 'amarillo',
      kpi_principal: { nombre: 'Rotacion voluntaria', valor: '8.7%', objetivo: '7%' },
      alertas: [
        'Indice de rotacion en departamento comercial por encima del objetivo',
        'Encuesta de clima laboral pendiente de lanzamiento'
      ],
      responsable: 'CHRO Virtual',
      empleados: 25,
      presupuesto_ejecutado: 75.2
    },
    {
      nombre: 'Legal y Cumplimiento',
      estado: 'rojo',
      kpi_principal: { nombre: 'Expedientes regulatorios abiertos', valor: '3', objetivo: '0' },
      alertas: [
        'Requerimiento DGSFP sobre reservas tecnicas - plazo 15 dias',
        'Nueva normativa DORA requiere adaptacion tecnologica urgente',
        'Litigio colectivo por clausulas de exclusion en polizas hogar'
      ],
      responsable: 'CLO Virtual',
      empleados: 30,
      presupuesto_ejecutado: 88.4
    }
  ];
}

// --- Decisiones pre-pobladas ---
function generarDecisionesHoy() {
  return [
    {
      id: generarId('dec'),
      fecha: fechaHoy(),
      hora: '08:15',
      descripcion: 'Aprobar contratacion de 8 peritos adicionales para reducir backlog de siniestros',
      departamento: 'Operaciones',
      tipo: 'recursos_humanos',
      impacto: 'alto',
      justificacion: 'El tiempo medio de tramitacion ha superado el objetivo en un 20%. El analisis de coste-beneficio muestra que la inversion se recupera en 3 meses por reduccion de penalizaciones y mejora en satisfaccion del cliente.',
      resultado: 'aprobada',
      impacto_euros: -192000,
      automatica: true
    },
    {
      id: generarId('dec'),
      fecha: fechaHoy(),
      hora: '09:30',
      descripcion: 'Reasignar presupuesto de marketing digital: incrementar SEM en 25% y reducir display en 15%',
      departamento: 'Comercial y Marketing',
      tipo: 'presupuesto',
      impacto: 'medio',
      justificacion: 'El ROI de campanas SEM es 3.2x superior al display. La reasignacion optimiza el coste por adquisicion manteniendo el volumen de leads.',
      resultado: 'aprobada',
      impacto_euros: 45000,
      automatica: true
    },
    {
      id: generarId('dec'),
      fecha: fechaHoy(),
      hora: '10:45',
      descripcion: 'Activar protocolo de respuesta ante requerimiento DGSFP sobre reservas tecnicas',
      departamento: 'Legal y Cumplimiento',
      tipo: 'regulatorio',
      impacto: 'critico',
      justificacion: 'El incumplimiento del plazo de respuesta conlleva sanciones de hasta 500.000 EUR. Se asigna equipo dedicado y se prioriza sobre otras tareas legales.',
      resultado: 'aprobada',
      impacto_euros: -35000,
      automatica: false
    },
    {
      id: generarId('dec'),
      fecha: fechaHoy(),
      hora: '12:00',
      descripcion: 'Implementar modelo predictivo de churn para cartera de polizas auto',
      departamento: 'Tecnologia',
      tipo: 'tecnologia',
      impacto: 'alto',
      justificacion: 'La tasa de retencion en auto ha caido al 82%. El modelo ML identifica clientes con alta probabilidad de fuga con 30 dias de antelacion, permitiendo acciones preventivas.',
      resultado: 'en_progreso',
      impacto_euros: 320000,
      automatica: true
    },
    {
      id: generarId('dec'),
      fecha: fechaHoy(),
      hora: '14:30',
      descripcion: 'Lanzar programa de bienestar y retencion de talento en departamento comercial',
      departamento: 'Recursos Humanos',
      tipo: 'recursos_humanos',
      impacto: 'medio',
      justificacion: 'La rotacion voluntaria en comercial (12.3%) supera la media del sector (9%). El coste de reemplazo estimado por empleado es de 28.000 EUR. El programa tiene un ROI esperado de 2.1x.',
      resultado: 'aprobada',
      impacto_euros: -85000,
      automatica: true
    }
  ];
}

// --- Historial extendido de decisiones ---
function generarHistorialDecisiones() {
  return [
    ...generarDecisionesHoy(),
    { id: generarId('dec'), fecha: fechaRelativa(1), tipo: 'comercial', descripcion: 'Lanzar promocion de renovacion anticipada con 10% descuento para polizas hogar', departamento: 'Comercial y Marketing', resultado: 'aprobada', impacto_euros: 125000 },
    { id: generarId('dec'), fecha: fechaRelativa(1), tipo: 'operaciones', descripcion: 'Automatizar proceso de apertura de siniestros menores (< 500 EUR)', departamento: 'Operaciones', resultado: 'aprobada', impacto_euros: 210000 },
    { id: generarId('dec'), fecha: fechaRelativa(2), tipo: 'tecnologia', descripcion: 'Migrar base de datos de polizas a PostgreSQL 16 con particionamiento', departamento: 'Tecnologia', resultado: 'completada', impacto_euros: -45000 },
    { id: generarId('dec'), fecha: fechaRelativa(2), tipo: 'financiero', descripcion: 'Ajustar provisiones tecnicas por incremento de siniestralidad en auto', departamento: 'Finanzas', resultado: 'aprobada', impacto_euros: -890000 },
    { id: generarId('dec'), fecha: fechaRelativa(3), tipo: 'regulatorio', descripcion: 'Actualizar politica de proteccion de datos conforme a nueva guia AEPD', departamento: 'Legal y Cumplimiento', resultado: 'completada', impacto_euros: -22000 },
    { id: generarId('dec'), fecha: fechaRelativa(3), tipo: 'recursos_humanos', descripcion: 'Aprobar plan de formacion en IA generativa para 200 empleados', departamento: 'Recursos Humanos', resultado: 'en_progreso', impacto_euros: -156000 },
    { id: generarId('dec'), fecha: fechaRelativa(4), tipo: 'comercial', descripcion: 'Expandir canal de venta digital con nuevo comparador de seguros propio', departamento: 'Comercial y Marketing', resultado: 'en_progreso', impacto_euros: 450000 },
    { id: generarId('dec'), fecha: fechaRelativa(5), tipo: 'operaciones', descripcion: 'Externalizar peritaje de siniestros de baja cuantia a red de colaboradores', departamento: 'Operaciones', resultado: 'aprobada', impacto_euros: 178000 },
    { id: generarId('dec'), fecha: fechaRelativa(5), tipo: 'riesgo', descripcion: 'Reducir exposicion en zona costera mediterranea para polizas hogar', departamento: 'Finanzas', resultado: 'aprobada', impacto_euros: 340000 },
    { id: generarId('dec'), fecha: fechaRelativa(6), tipo: 'producto', descripcion: 'Lanzar seguro ciber para PYMES con coberturas modulares', departamento: 'Comercial y Marketing', resultado: 'aprobada', impacto_euros: 520000 },
    { id: generarId('dec'), fecha: fechaRelativa(7), tipo: 'financiero', descripcion: 'Renegociar contrato de reaseguro con Swiss Re para catastrofes naturales', departamento: 'Finanzas', resultado: 'completada', impacto_euros: 1200000 },
  ];
}

// --- Alertas que requieren intervencion humana ---
function generarAlertasHumanas() {
  return [
    {
      id: generarId('alerta'),
      fecha: fechaHoy(),
      hora: '07:45',
      urgencia: 'critica',
      categoria: 'regulatorio',
      descripcion: 'La DGSFP ha emitido un requerimiento formal sobre la suficiencia de las reservas tecnicas del ramo de auto. El plazo de respuesta es de 15 dias habiles. El incumplimiento puede resultar en sancion de hasta 500.000 EUR y restricciones operativas.',
      accion_requerida: 'Revision y aprobacion por parte del CEO y CFO del informe de reservas tecnicas antes de su envio al regulador. Se requiere firma del actuario jefe y del consejero delegado.',
      departamento: 'Legal y Cumplimiento',
      plazo_limite: fechaRelativa(-15),
      estado: 'pendiente'
    },
    {
      id: generarId('alerta'),
      fecha: fechaHoy(),
      hora: '11:20',
      urgencia: 'alta',
      categoria: 'reputacional',
      descripcion: 'Se ha detectado una campana negativa en redes sociales (Twitter/X) sobre tiempos de respuesta en siniestros de hogar tras las ultimas lluvias torrenciales. El hashtag #SeguroQueNo acumula 12.000 menciones en 24 horas con tendencia creciente.',
      accion_requerida: 'Aprobar comunicado oficial y plan de accion de mejora de tiempos. Valorar aparicion del portavoz oficial en medios. Coordinar con departamento de comunicacion y operaciones.',
      departamento: 'Comercial y Marketing',
      plazo_limite: fechaHoy(),
      estado: 'pendiente'
    }
  ];
}

// --- Funciones principales del agente CEO ---

/**
 * Informe diario ejecutivo consolidando todos los departamentos
 */
function getInformeDiario() {
  const departamentos = generarDepartamentos();
  const decisiones = generarDecisionesHoy();
  const alertas = generarAlertasHumanas();

  const deptosVerdes = departamentos.filter(d => d.estado === 'verde').length;
  const deptosAmarillos = departamentos.filter(d => d.estado === 'amarillo').length;
  const deptosRojos = departamentos.filter(d => d.estado === 'rojo').length;

  return {
    fecha: fechaHoy(),
    hora_generacion: new Date().toISOString(),
    resumen_ejecutivo: `El dia de hoy la compania presenta un estado operativo general ESTABLE con areas de atencion prioritaria. De los 6 departamentos monitorizados, ${deptosVerdes} operan en estado optimo (verde), ${deptosAmarillos} requieren seguimiento (amarillo) y ${deptosRojos} presenta situacion critica (rojo). Los ingresos acumulados del ejercicio ascienden a 47.3M EUR, un 8.2% por encima del presupuesto, mientras que la siniestralidad se situa en el 62.1%, ligeramente por encima del objetivo del 60%.

El departamento de Legal y Cumplimiento se encuentra en estado critico debido al requerimiento formal de la DGSFP sobre reservas tecnicas y la nueva normativa DORA que exige adaptaciones tecnologicas significativas. Se ha activado un equipo de respuesta dedicado con plazo de 15 dias. Operaciones muestra presion en tiempos de tramitacion por el incremento estacional de siniestros, habiendose aprobado la contratacion de 8 peritos adicionales.

En el ambito comercial, los resultados superan expectativas con 1.247 nuevas polizas frente a un objetivo de 1.100. La estrategia digital esta dando frutos con un crecimiento del canal online del 34% interanual. Se han tomado ${decisiones.length} decisiones estrategicas hoy y existen ${alertas.length} alertas que requieren intervencion humana inmediata.`,
    kpis_globales: {
      ingresos: { valor: 47300000, unidad: 'EUR', variacion_ytd: '+8.2%', estado: 'verde' },
      gastos: { valor: 38200000, unidad: 'EUR', variacion_ytd: '+5.1%', estado: 'amarillo' },
      beneficio: { valor: 9100000, unidad: 'EUR', variacion_ytd: '+18.7%', estado: 'verde' },
      siniestralidad: { valor: 62.1, unidad: '%', objetivo: 60, estado: 'amarillo' },
      satisfaccion: { valor: 8.1, unidad: '/10', variacion: '+0.3', estado: 'verde' },
      churn: { valor: 4.8, unidad: '%', objetivo: 5, estado: 'verde' },
      crecimiento: { valor: 12.4, unidad: '%', interanual: true, estado: 'verde' }
    },
    departamentos: departamentos,
    decisiones_tomadas_hoy: decisiones,
    alertas_humanas: alertas,
    metricas_agente: {
      decisiones_automaticas_hoy: decisiones.filter(d => d.automatica).length,
      decisiones_pendientes_aprobacion: 1,
      tiempo_medio_decision: '12 minutos',
      confianza_media_decisiones: 87.3
    }
  };
}

/**
 * Historial de decisiones filtrado por periodo
 * @param {string} periodo - 'hoy', 'semana', 'mes', 'trimestre'
 */
function getDecisiones(periodo = 'semana') {
  const todas = generarHistorialDecisiones();

  const diasFiltro = {
    'hoy': 0,
    'semana': 7,
    'mes': 30,
    'trimestre': 90
  };

  const dias = diasFiltro[periodo] || 7;
  const fechaLimite = fechaRelativa(dias);

  const filtradas = dias === 0
    ? todas.filter(d => d.fecha === fechaHoy())
    : todas.filter(d => d.fecha >= fechaLimite);

  const impactoTotal = filtradas.reduce((sum, d) => sum + (d.impacto_euros || 0), 0);

  return {
    periodo,
    total_decisiones: filtradas.length,
    impacto_neto_euros: impactoTotal,
    decisiones: filtradas,
    resumen: {
      aprobadas: filtradas.filter(d => d.resultado === 'aprobada').length,
      en_progreso: filtradas.filter(d => d.resultado === 'en_progreso').length,
      completadas: filtradas.filter(d => d.resultado === 'completada').length,
      rechazadas: filtradas.filter(d => d.resultado === 'rechazada').length
    },
    por_departamento: filtradas.reduce((acc, d) => {
      acc[d.departamento] = (acc[d.departamento] || 0) + 1;
      return acc;
    }, {})
  };
}

/**
 * Alertas criticas que requieren intervencion humana
 */
function getAlertasCriticas() {
  const alertas = generarAlertasHumanas();
  alertas.push({
    id: generarId('alerta'),
    fecha: fechaRelativa(1),
    hora: '16:00',
    urgencia: 'media',
    categoria: 'operativo',
    descripcion: 'El proveedor principal de peritaje ha notificado un incremento de tarifas del 12% efectivo en 60 dias. Esto impactaria el coste medio de tramitacion de siniestros en aproximadamente 340.000 EUR anuales.',
    accion_requerida: 'Evaluar alternativas de proveedores y autorizar inicio de negociacion o proceso de licitacion. Decisiones de este calibre requieren aprobacion de direccion.',
    departamento: 'Operaciones',
    plazo_limite: fechaRelativa(-60),
    estado: 'pendiente'
  });

  return {
    total: alertas.length,
    por_urgencia: {
      critica: alertas.filter(a => a.urgencia === 'critica').length,
      alta: alertas.filter(a => a.urgencia === 'alta').length,
      media: alertas.filter(a => a.urgencia === 'media').length
    },
    alertas: alertas.sort((a, b) => {
      const prioridad = { critica: 0, alta: 1, media: 2, baja: 3 };
      return prioridad[a.urgencia] - prioridad[b.urgencia];
    })
  };
}

/**
 * Proyecciones de negocio a 3, 6 y 12 meses
 */
function getProyecciones() {
  return {
    fecha_calculo: fechaHoy(),
    modelo: 'Regresion multivariable + ARIMA estacional',
    confianza_modelo: '89.2%',
    proyecciones: [
      {
        horizonte: '3 meses',
        fecha_objetivo: fechaRelativa(-90),
        ingresos: { valor: 18500000, variacion: '+7.8%', confianza: 92 },
        costes: { valor: 14800000, variacion: '+4.2%', confianza: 88 },
        beneficio: { valor: 3700000, variacion: '+15.6%', confianza: 85 },
        headcount: { valor: 348, variacion: '+3', confianza: 95 },
        cuota_mercado: { valor: 6.8, unidad: '%', variacion: '+0.2pp', confianza: 78 },
        siniestralidad_esperada: { valor: 61.5, unidad: '%', confianza: 82 },
        riesgos: ['Incremento estacional de siniestros en verano', 'Presion competitiva en precios de auto']
      },
      {
        horizonte: '6 meses',
        fecha_objetivo: fechaRelativa(-180),
        ingresos: { valor: 38200000, variacion: '+9.1%', confianza: 85 },
        costes: { valor: 30100000, variacion: '+5.8%', confianza: 80 },
        beneficio: { valor: 8100000, variacion: '+18.2%', confianza: 76 },
        headcount: { valor: 355, variacion: '+10', confianza: 88 },
        cuota_mercado: { valor: 7.1, unidad: '%', variacion: '+0.5pp', confianza: 70 },
        siniestralidad_esperada: { valor: 60.8, unidad: '%', confianza: 74 },
        riesgos: ['Impacto regulatorio DORA', 'Posible entrada de insurtech competidor', 'Volatilidad en mercados de reaseguro']
      },
      {
        horizonte: '12 meses',
        fecha_objetivo: fechaRelativa(-365),
        ingresos: { valor: 79500000, variacion: '+12.4%', confianza: 72 },
        costes: { valor: 62300000, variacion: '+7.3%', confianza: 68 },
        beneficio: { valor: 17200000, variacion: '+22.1%', confianza: 62 },
        headcount: { valor: 370, variacion: '+25', confianza: 80 },
        cuota_mercado: { valor: 7.5, unidad: '%', variacion: '+0.9pp', confianza: 58 },
        siniestralidad_esperada: { valor: 59.5, unidad: '%', confianza: 60 },
        riesgos: ['Ciclo economico - posible desaceleracion', 'Cambios regulatorios en Solvencia II', 'Eventos catastroficos (DANA, sequia)', 'Transformacion digital del sector']
      }
    ],
    supuestos: [
      'Crecimiento PIB Espana: 2.1% anual',
      'Inflacion: 2.8% (decreciente)',
      'Sin eventos catastroficos extraordinarios',
      'Mantenimiento de la politica comercial actual',
      'Ejecucion del plan de transformacion digital al 85%'
    ]
  };
}

/**
 * Objetivos anuales con progreso actual
 */
function getObjetivosAnuales() {
  const mesActual = new Date().getMonth() + 1;
  const progresoEsperado = Math.round((mesActual / 12) * 100);

  return {
    ejercicio: new Date().getFullYear(),
    progreso_temporal: `${progresoEsperado}%`,
    objetivos: [
      {
        id: 'obj-001',
        titulo: 'Crecimiento de primas brutas',
        descripcion: 'Alcanzar 80M EUR en primas brutas emitidas',
        departamento: 'Comercial y Marketing',
        target: 80000000,
        actual: 47300000,
        unidad: 'EUR',
        progreso: 59.1,
        estado: progresoEsperado <= 59.1 ? 'en_linea' : 'retrasado',
        tendencia: 'positiva'
      },
      {
        id: 'obj-002',
        titulo: 'Ratio combinado',
        descripcion: 'Mantener ratio combinado por debajo del 95%',
        departamento: 'Finanzas',
        target: 95,
        actual: 93.2,
        unidad: '%',
        progreso: 100,
        estado: 'cumplido',
        tendencia: 'estable'
      },
      {
        id: 'obj-003',
        titulo: 'Satisfaccion del cliente (NPS)',
        descripcion: 'Alcanzar NPS de 45 puntos',
        departamento: 'Operaciones',
        target: 45,
        actual: 41,
        unidad: 'puntos',
        progreso: 91.1,
        estado: 'en_linea',
        tendencia: 'positiva'
      },
      {
        id: 'obj-004',
        titulo: 'Transformacion digital',
        descripcion: 'Digitalizar el 70% de los procesos core',
        departamento: 'Tecnologia',
        target: 70,
        actual: 58,
        unidad: '%',
        progreso: 82.9,
        estado: 'en_linea',
        tendencia: 'positiva'
      },
      {
        id: 'obj-005',
        titulo: 'Reduccion de siniestralidad',
        descripcion: 'Reducir ratio de siniestralidad al 60%',
        departamento: 'Operaciones',
        target: 60,
        actual: 62.1,
        unidad: '%',
        progreso: 78,
        estado: 'retrasado',
        tendencia: 'negativa'
      },
      {
        id: 'obj-006',
        titulo: 'Retencion de clientes',
        descripcion: 'Tasa de retencion superior al 92%',
        departamento: 'Comercial y Marketing',
        target: 92,
        actual: 91.3,
        unidad: '%',
        progreso: 99.2,
        estado: 'en_linea',
        tendencia: 'estable'
      },
      {
        id: 'obj-007',
        titulo: 'Cumplimiento regulatorio',
        descripcion: 'Cero sanciones regulatorias en el ejercicio',
        departamento: 'Legal y Cumplimiento',
        target: 0,
        actual: 0,
        unidad: 'sanciones',
        progreso: 100,
        estado: 'en_riesgo',
        tendencia: 'negativa',
        nota: 'Requerimiento DGSFP en curso podria resultar en sancion'
      },
      {
        id: 'obj-008',
        titulo: 'Clima laboral',
        descripcion: 'Indice de satisfaccion laboral superior a 7.5/10',
        departamento: 'Recursos Humanos',
        target: 7.5,
        actual: 7.2,
        unidad: '/10',
        progreso: 96,
        estado: 'en_linea',
        tendencia: 'positiva'
      }
    ],
    resumen: {
      cumplidos: 1,
      en_linea: 4,
      retrasados: 1,
      en_riesgo: 1,
      total: 8
    }
  };
}

/**
 * Aprueba una decision pendiente
 * @param {string} decisionId - ID de la decision a aprobar
 */
function aprobarDecision(decisionId) {
  if (!decisionId) {
    return { exito: false, error: 'Se requiere el ID de la decision' };
  }

  const decisiones = generarHistorialDecisiones();
  const decision = decisiones.find(d => d.id === decisionId);

  if (!decision) {
    return {
      exito: true,
      mensaje: `Decision ${decisionId} aprobada por el CEO Virtual`,
      fecha_aprobacion: new Date().toISOString(),
      decision_id: decisionId,
      estado_anterior: 'pendiente',
      estado_nuevo: 'aprobada',
      aprobado_por: 'CEO Virtual (Agente IA)',
      nota: 'Decision procesada. Se notifica a los departamentos implicados.'
    };
  }

  return {
    exito: true,
    mensaje: `Decision "${decision.descripcion}" aprobada exitosamente`,
    fecha_aprobacion: new Date().toISOString(),
    decision_id: decisionId,
    estado_anterior: decision.resultado,
    estado_nuevo: 'aprobada',
    aprobado_por: 'CEO Virtual (Agente IA)',
    departamento_notificado: decision.departamento,
    impacto_esperado: decision.impacto_euros
  };
}

/**
 * Estadisticas generales del agente CEO
 */
function getEstadisticas() {
  const decisiones = generarHistorialDecisiones();
  const alertas = generarAlertasHumanas();
  const decisionesHoy = decisiones.filter(d => d.fecha === fechaHoy());

  const ingresosYTD = 47300000;
  const gastosYTD = 38200000;

  return {
    decisiones_hoy: decisionesHoy.length,
    decisiones_semana: decisiones.filter(d => d.fecha >= fechaRelativa(7)).length,
    decisiones_mes: decisiones.length,
    alertas_pendientes: alertas.filter(a => a.estado === 'pendiente').length,
    alertas_resueltas_hoy: 1,
    salud_global: 74,
    salud_detalle: {
      finanzas: 88,
      operaciones: 65,
      comercial: 92,
      tecnologia: 90,
      rrhh: 68,
      legal: 42
    },
    ingresos_ytd: ingresosYTD,
    beneficio_ytd: ingresosYTD - gastosYTD,
    gastos_ytd: gastosYTD,
    ratio_combinado: 93.2,
    siniestralidad: 62.1,
    polizas_activas: 234567,
    agente: {
      estado: 'activo',
      uptime: '99.98%',
      decisiones_automaticas: decisionesHoy.filter(d => d.automatica).length,
      precision_predicciones: '87.3%',
      ultima_actualizacion: new Date().toISOString()
    }
  };
}

// --- Exportaciones ---
module.exports = {
  getInformeDiario,
  getDecisiones,
  getAlertasCriticas,
  getProyecciones,
  getObjetivosAnuales,
  aprobarDecision,
  getEstadisticas
};
