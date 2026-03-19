// =============================================================================
// Board Agent - Consejo de Direccion Virtual con 8 Directivos C-Level
// Sistema de IA para gobierno corporativo y toma de decisiones colegiada
// =============================================================================

// --- Utilidades ---
function generarId(prefijo = 'board') {
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

// --- Estado de votaciones activas ---
const votacionesActivas = new Map();
const votosRegistrados = new Map();

// --- Definicion de los 8 directivos ---
function getDirectoresBase() {
  return [
    {
      id: 'cfo',
      cargo: 'CFO',
      nombre: 'Ana Belen Martinez Ruiz',
      area: 'Finanzas',
      estado: 'analizando',
      ultima_accion: 'Revisando proyecciones Q2 y provisiones tecnicas',
      fecha_ultima_accion: fechaHoy(),
      metricas_rendimiento: {
        decisiones_acertadas: 94.2,
        tiempo_respuesta_medio: '8 min',
        reportes_generados_mes: 47,
        alertas_detectadas: 12
      },
      especialidades: ['Control financiero', 'Reaseguro', 'Solvencia II', 'Inversiones']
    },
    {
      id: 'coo',
      cargo: 'COO',
      nombre: 'Carlos Jimenez Fernandez',
      area: 'Operaciones',
      estado: 'decidiendo',
      ultima_accion: 'Aprobando plan de refuerzo temporal de peritos para siniestros',
      fecha_ultima_accion: fechaHoy(),
      metricas_rendimiento: {
        decisiones_acertadas: 91.8,
        tiempo_respuesta_medio: '5 min',
        reportes_generados_mes: 62,
        alertas_detectadas: 23
      },
      especialidades: ['Gestion de siniestros', 'Procesos operativos', 'Calidad', 'Proveedores']
    },
    {
      id: 'cmo',
      cargo: 'CMO',
      nombre: 'Laura Sanchez Delgado',
      area: 'Marketing y Comercial',
      estado: 'reportando',
      ultima_accion: 'Presentando resultados de campana de captacion digital Q1',
      fecha_ultima_accion: fechaHoy(),
      metricas_rendimiento: {
        decisiones_acertadas: 88.5,
        tiempo_respuesta_medio: '11 min',
        reportes_generados_mes: 38,
        alertas_detectadas: 8
      },
      especialidades: ['Marketing digital', 'Captacion', 'Branding', 'Canales de distribucion']
    },
    {
      id: 'cto',
      cargo: 'CTO',
      nombre: 'Miguel Angel Torres Navarro',
      area: 'Tecnologia',
      estado: 'analizando',
      ultima_accion: 'Evaluando arquitectura para migracion cloud hibrida',
      fecha_ultima_accion: fechaHoy(),
      metricas_rendimiento: {
        decisiones_acertadas: 96.1,
        tiempo_respuesta_medio: '7 min',
        reportes_generados_mes: 41,
        alertas_detectadas: 15
      },
      especialidades: ['Arquitectura cloud', 'Ciberseguridad', 'IA/ML', 'Integraciones']
    },
    {
      id: 'clo',
      cargo: 'CLO',
      nombre: 'Patricia Gomez Herrero',
      area: 'Legal y Cumplimiento',
      estado: 'decidiendo',
      ultima_accion: 'Preparando respuesta a requerimiento DGSFP sobre reservas tecnicas',
      fecha_ultima_accion: fechaHoy(),
      metricas_rendimiento: {
        decisiones_acertadas: 97.3,
        tiempo_respuesta_medio: '15 min',
        reportes_generados_mes: 29,
        alertas_detectadas: 19
      },
      especialidades: ['Regulacion DGSFP', 'DORA', 'Proteccion de datos', 'Litigios']
    },
    {
      id: 'chro',
      cargo: 'CHRO',
      nombre: 'Roberto Diaz Moreno',
      area: 'Recursos Humanos',
      estado: 'reportando',
      ultima_accion: 'Presentando plan de retencion de talento comercial',
      fecha_ultima_accion: fechaHoy(),
      metricas_rendimiento: {
        decisiones_acertadas: 89.7,
        tiempo_respuesta_medio: '9 min',
        reportes_generados_mes: 33,
        alertas_detectadas: 7
      },
      especialidades: ['Gestion del talento', 'Clima laboral', 'Formacion', 'Compensacion']
    },
    {
      id: 'cro',
      cargo: 'CRO',
      nombre: 'Elena Vidal Castillo',
      area: 'Riesgos',
      estado: 'analizando',
      ultima_accion: 'Modelando impacto de exposicion catastrofica en cartera hogar',
      fecha_ultima_accion: fechaHoy(),
      metricas_rendimiento: {
        decisiones_acertadas: 93.6,
        tiempo_respuesta_medio: '13 min',
        reportes_generados_mes: 36,
        alertas_detectadas: 28
      },
      especialidades: ['Riesgo actuarial', 'Riesgo operacional', 'Catastrofes', 'Fraude']
    },
    {
      id: 'cpo',
      cargo: 'CPO',
      nombre: 'Javier Ruiz Alonso',
      area: 'Producto',
      estado: 'esperando',
      ultima_accion: 'Esperando resultados de test A/B del nuevo seguro ciber PYMES',
      fecha_ultima_accion: fechaHoy(),
      metricas_rendimiento: {
        decisiones_acertadas: 90.4,
        tiempo_respuesta_medio: '10 min',
        reportes_generados_mes: 28,
        alertas_detectadas: 5
      },
      especialidades: ['Diseno de producto', 'Pricing', 'Innovacion', 'UX seguros']
    }
  ];
}

// --- Reunion diaria del consejo ---
function getReunionDiaria() {
  const directores = getDirectoresBase();

  const reportes = [
    {
      director: 'CFO - Ana Belen Martinez',
      area: 'Finanzas',
      estado: 'verde',
      resumen: 'Resultados financieros por encima de presupuesto. Margen EBITDA en 23.4%. Atencion a provisiones tecnicas por requerimiento DGSFP.',
      kpis: [
        { nombre: 'Ingresos YTD', valor: '47.3M EUR', tendencia: 'alza', vs_objetivo: '+8.2%' },
        { nombre: 'Ratio combinado', valor: '93.2%', tendencia: 'estable', vs_objetivo: 'OK' },
        { nombre: 'ROE', valor: '14.8%', tendencia: 'alza', vs_objetivo: '+1.2pp' },
        { nombre: 'Solvencia II ratio', valor: '187%', tendencia: 'estable', vs_objetivo: 'OK' }
      ],
      alertas: ['Provisiones tecnicas bajo escrutinio regulatorio'],
      recomendaciones: ['Constituir provision adicional de 2M EUR por prudencia ante requerimiento DGSFP']
    },
    {
      director: 'COO - Carlos Jimenez',
      area: 'Operaciones',
      estado: 'amarillo',
      resumen: 'Presion operativa por incremento de siniestros estacionales. Backlog creciente en peritaje. Plan de refuerzo en marcha.',
      kpis: [
        { nombre: 'Tiempo medio tramitacion', valor: '4.2 dias', tendencia: 'alza', vs_objetivo: '+0.7 dias' },
        { nombre: 'Siniestros abiertos', valor: '3.247', tendencia: 'alza', vs_objetivo: '+15%' },
        { nombre: 'Tasa resolucion primer contacto', valor: '67%', tendencia: 'baja', vs_objetivo: '-3pp' },
        { nombre: 'Coste medio siniestro', valor: '2.340 EUR', tendencia: 'estable', vs_objetivo: 'OK' }
      ],
      alertas: ['Backlog de peritaje en 487 expedientes', 'SLA en riesgo para siniestros hogar'],
      recomendaciones: ['Aprobar contratacion urgente de 8 peritos', 'Activar red de colaboradores externos']
    },
    {
      director: 'CMO - Laura Sanchez',
      area: 'Marketing y Comercial',
      estado: 'verde',
      resumen: 'Resultados comerciales excelentes. Canal digital en crecimiento sostenido. Gestion de crisis reputacional en redes por hashtag #SeguroQueNo.',
      kpis: [
        { nombre: 'Nuevas polizas/mes', valor: '1.247', tendencia: 'alza', vs_objetivo: '+13.4%' },
        { nombre: 'CAC', valor: '187 EUR', tendencia: 'baja', vs_objetivo: '-12%' },
        { nombre: 'Canal digital', valor: '34% del total', tendencia: 'alza', vs_objetivo: '+8pp' },
        { nombre: 'Brand awareness', valor: '42%', tendencia: 'estable', vs_objetivo: 'OK' }
      ],
      alertas: ['Crisis reputacional en redes sociales - #SeguroQueNo trending'],
      recomendaciones: ['Emitir comunicado oficial sobre mejora de tiempos', 'Lanzar campana de testimonios positivos']
    },
    {
      director: 'CTO - Miguel Angel Torres',
      area: 'Tecnologia',
      estado: 'verde',
      resumen: 'Sistemas estables con disponibilidad del 99.97%. Avance en modelo predictivo de churn. Planificacion de migracion cloud en curso.',
      kpis: [
        { nombre: 'Disponibilidad', valor: '99.97%', tendencia: 'estable', vs_objetivo: 'OK' },
        { nombre: 'Incidencias criticas', valor: '0', tendencia: 'estable', vs_objetivo: 'OK' },
        { nombre: 'Deuda tecnica', valor: '12%', tendencia: 'baja', vs_objetivo: '-3pp' },
        { nombre: 'Velocidad despliegue', valor: '4.2 deploys/dia', tendencia: 'alza', vs_objetivo: '+40%' }
      ],
      alertas: ['Adaptacion DORA requiere inversiones en ciberseguridad'],
      recomendaciones: ['Iniciar POC de cloud hibrida en Q2', 'Contratar 2 especialistas en ciberseguridad']
    },
    {
      director: 'CLO - Patricia Gomez',
      area: 'Legal y Cumplimiento',
      estado: 'rojo',
      resumen: 'Situacion critica por requerimiento DGSFP. Nuevo marco DORA exige adaptaciones. Litigio colectivo en curso.',
      kpis: [
        { nombre: 'Expedientes regulatorios', valor: '3', tendencia: 'alza', vs_objetivo: 'CRITICO' },
        { nombre: 'Cumplimiento normativo', valor: '91%', tendencia: 'baja', vs_objetivo: '-4pp' },
        { nombre: 'Litigios activos', valor: '12', tendencia: 'alza', vs_objetivo: '+3' },
        { nombre: 'Tiempo respuesta regulador', valor: '15 dias', tendencia: 'critico', vs_objetivo: 'URGENTE' }
      ],
      alertas: ['Requerimiento DGSFP - plazo 15 dias', 'Normativa DORA - adaptacion obligatoria', 'Litigio colectivo clausulas hogar'],
      recomendaciones: ['Priorizar respuesta DGSFP sobre todas las demas tareas', 'Contratar asesoria externa especializada en DORA']
    },
    {
      director: 'CHRO - Roberto Diaz',
      area: 'Recursos Humanos',
      estado: 'amarillo',
      resumen: 'Rotacion en comercial por encima del objetivo. Plan de retencion en diseno. Formacion en IA avanzando bien.',
      kpis: [
        { nombre: 'Rotacion voluntaria', valor: '8.7%', tendencia: 'alza', vs_objetivo: '+1.7pp' },
        { nombre: 'Satisfaccion laboral', valor: '7.2/10', tendencia: 'estable', vs_objetivo: '-0.3' },
        { nombre: 'Formacion completada', valor: '78%', tendencia: 'alza', vs_objetivo: 'OK' },
        { nombre: 'Tiempo medio contratacion', valor: '32 dias', tendencia: 'baja', vs_objetivo: '-5 dias' }
      ],
      alertas: ['Rotacion critica en equipo comercial (12.3%)', 'Encuesta de clima laboral pendiente'],
      recomendaciones: ['Implementar programa de retencion con componente variable', 'Lanzar encuesta de clima antes de fin de mes']
    },
    {
      director: 'CRO - Elena Vidal',
      area: 'Riesgos',
      estado: 'amarillo',
      resumen: 'Siniestralidad por encima del objetivo. Exposicion catastrofica en zona costera bajo revision. Modelo de fraude detectando anomalias.',
      kpis: [
        { nombre: 'Siniestralidad', valor: '62.1%', tendencia: 'alza', vs_objetivo: '+2.1pp' },
        { nombre: 'VaR 99.5%', valor: '45M EUR', tendencia: 'estable', vs_objetivo: 'OK' },
        { nombre: 'Fraudes detectados/mes', valor: '23', tendencia: 'alza', vs_objetivo: '+15%' },
        { nombre: 'Exposicion catastrofica', valor: '12M EUR', tendencia: 'estable', vs_objetivo: 'REVISAR' }
      ],
      alertas: ['Siniestralidad auto por encima del objetivo', 'Modelo catastrofico requiere recalibracion'],
      recomendaciones: ['Revisar tarificacion en auto para nuevos riesgos', 'Reducir limites en zona costera mediterranea']
    },
    {
      director: 'CPO - Javier Ruiz',
      area: 'Producto',
      estado: 'verde',
      resumen: 'Seguro ciber PYMES en fase de test con resultados prometedores. Nuevas coberturas de movilidad sostenible en diseno.',
      kpis: [
        { nombre: 'Productos activos', valor: '24', tendencia: 'estable', vs_objetivo: 'OK' },
        { nombre: 'Time to market', valor: '45 dias', tendencia: 'baja', vs_objetivo: '-15 dias' },
        { nombre: 'Rentabilidad media producto', valor: '18.3%', tendencia: 'alza', vs_objetivo: '+2.3pp' },
        { nombre: 'NPS por producto', valor: '42', tendencia: 'alza', vs_objetivo: '+5' }
      ],
      alertas: [],
      recomendaciones: ['Lanzar seguro ciber PYMES en Q2', 'Explorar seguro de movilidad electrica']
    }
  ];

  return {
    fecha: fechaHoy(),
    hora_inicio: '09:00',
    hora_fin: '10:30',
    tipo: 'reunion_diaria',
    asistentes: directores.map(d => `${d.cargo} - ${d.nombre}`),
    estado_general: 'operativo_con_alertas',
    reportes,
    conclusiones: [
      'Prioridad maxima: respuesta al requerimiento DGSFP en plazo',
      'Aprobar contratacion de 8 peritos para resolver backlog operativo',
      'Gestionar crisis reputacional en redes con comunicado oficial',
      'Continuar monitorizando siniestralidad auto y exposicion catastrofica'
    ],
    proxima_reunion: fechaRelativa(-1) + ' 09:00'
  };
}

// --- Decisiones del consejo ---
function getDecisiones() {
  const decisiones = [
    { id: generarId('vot'), titulo: 'Aprobacion plan de refuerzo operativo', propuesta_por: 'COO', votos_favor: 7, votos_contra: 1, aprobada: true, fecha: fechaHoy(), impacto: 'Contratacion de 8 peritos temporales - 192K EUR', unanime: false },
    { id: generarId('vot'), titulo: 'Reasignacion presupuesto marketing digital', propuesta_por: 'CMO', votos_favor: 8, votos_contra: 0, aprobada: true, fecha: fechaHoy(), impacto: 'Optimizacion ROI campanas +45K EUR', unanime: true },
    { id: generarId('vot'), titulo: 'Activacion protocolo respuesta DGSFP', propuesta_por: 'CLO', votos_favor: 8, votos_contra: 0, aprobada: true, fecha: fechaHoy(), impacto: 'Evitar sancion potencial de hasta 500K EUR', unanime: true },
    { id: generarId('vot'), titulo: 'Modelo predictivo de churn para auto', propuesta_por: 'CTO', votos_favor: 6, votos_contra: 2, aprobada: true, fecha: fechaRelativa(1), impacto: 'Reduccion churn esperada del 15% - 320K EUR', unanime: false },
    { id: generarId('vot'), titulo: 'Programa bienestar y retencion comercial', propuesta_por: 'CHRO', votos_favor: 7, votos_contra: 1, aprobada: true, fecha: fechaRelativa(1), impacto: 'Reduccion rotacion esperada del 30% - 85K EUR', unanime: false },
    { id: generarId('vot'), titulo: 'Reduccion exposicion costera mediterranea', propuesta_por: 'CRO', votos_favor: 5, votos_contra: 3, aprobada: true, fecha: fechaRelativa(2), impacto: 'Mitigacion riesgo catastrofico - ahorro 340K EUR', unanime: false },
    { id: generarId('vot'), titulo: 'Lanzamiento seguro ciber PYMES', propuesta_por: 'CPO', votos_favor: 6, votos_contra: 2, aprobada: true, fecha: fechaRelativa(3), impacto: 'Nuevo producto - ingresos estimados 520K EUR/ano', unanime: false },
    { id: generarId('vot'), titulo: 'Provision adicional por prudencia regulatoria', propuesta_por: 'CFO', votos_favor: 8, votos_contra: 0, aprobada: true, fecha: fechaRelativa(3), impacto: 'Provision de 2M EUR - proteccion ante requerimiento', unanime: true },
    { id: generarId('vot'), titulo: 'Plan formacion IA generativa', propuesta_por: 'CHRO', votos_favor: 7, votos_contra: 1, aprobada: true, fecha: fechaRelativa(4), impacto: 'Capacitacion 200 empleados - 156K EUR', unanime: false },
    { id: generarId('vot'), titulo: 'Renegociacion reaseguro Swiss Re', propuesta_por: 'CFO', votos_favor: 8, votos_contra: 0, aprobada: true, fecha: fechaRelativa(5), impacto: 'Mejora condiciones - ahorro 1.2M EUR', unanime: true },
    { id: generarId('vot'), titulo: 'Expansion comparador digital propio', propuesta_por: 'CMO', votos_favor: 5, votos_contra: 3, aprobada: true, fecha: fechaRelativa(6), impacto: 'Nuevo canal venta - ingresos 450K EUR', unanime: false },
    { id: generarId('vot'), titulo: 'Externalizacion peritaje baja cuantia', propuesta_por: 'COO', votos_favor: 4, votos_contra: 4, aprobada: false, fecha: fechaRelativa(7), impacto: 'Rechazada por falta de mayoria - requiere revision', unanime: false }
  ];

  return {
    total: decisiones.length,
    aprobadas: decisiones.filter(d => d.aprobada).length,
    rechazadas: decisiones.filter(d => !d.aprobada).length,
    unanimes: decisiones.filter(d => d.unanime).length,
    decisiones
  };
}

// --- Actas de reuniones ---
function getActas() {
  return {
    total: 5,
    actas: [
      {
        id: generarId('acta'),
        fecha: fechaHoy(),
        tipo: 'Reunion diaria del Consejo',
        hora_inicio: '09:00',
        hora_fin: '10:30',
        asistentes: ['CFO', 'COO', 'CMO', 'CTO', 'CLO', 'CHRO', 'CRO', 'CPO'],
        temas_tratados: [
          'Revision KPIs diarios por departamento',
          'Crisis reputacional en redes sociales',
          'Requerimiento DGSFP - plan de accion',
          'Plan de refuerzo operativo de peritos'
        ],
        decisiones_tomadas: [
          'Aprobada contratacion de 8 peritos temporales',
          'Aprobada reasignacion presupuesto marketing',
          'Activado protocolo respuesta regulatoria DGSFP'
        ],
        acciones_pendientes: [
          { responsable: 'CLO', accion: 'Preparar borrador respuesta DGSFP', plazo: fechaRelativa(-3) },
          { responsable: 'CMO', accion: 'Redactar comunicado oficial sobre tiempos siniestros', plazo: fechaHoy() },
          { responsable: 'COO', accion: 'Iniciar proceso seleccion peritos', plazo: fechaRelativa(-2) }
        ],
        notas: 'Reunion con tono de urgencia por situacion regulatoria. Consenso generalizado en priorizar respuesta DGSFP.'
      },
      {
        id: generarId('acta'),
        fecha: fechaRelativa(1),
        tipo: 'Reunion diaria del Consejo',
        hora_inicio: '09:00',
        hora_fin: '10:00',
        asistentes: ['CFO', 'COO', 'CMO', 'CTO', 'CLO', 'CHRO', 'CRO', 'CPO'],
        temas_tratados: [
          'Resultados campana captacion digital Q1',
          'Modelo predictivo de churn - presentacion CTO',
          'Plan de retencion talento comercial'
        ],
        decisiones_tomadas: [
          'Aprobado desarrollo modelo predictivo churn',
          'Aprobado programa de bienestar y retencion'
        ],
        acciones_pendientes: [
          { responsable: 'CTO', accion: 'Definir roadmap modelo churn', plazo: fechaRelativa(-5) },
          { responsable: 'CHRO', accion: 'Detallar programa retencion con presupuesto', plazo: fechaRelativa(-3) }
        ],
        notas: 'Buena dinamica de equipo. Debate constructivo sobre prioridades de inversion tecnologica.'
      },
      {
        id: generarId('acta'),
        fecha: fechaRelativa(3),
        tipo: 'Reunion extraordinaria - Estrategia de producto',
        hora_inicio: '14:00',
        hora_fin: '16:00',
        asistentes: ['CFO', 'CMO', 'CTO', 'CRO', 'CPO'],
        temas_tratados: [
          'Viabilidad seguro ciber para PYMES',
          'Analisis de riesgo nuevas coberturas ciber',
          'Estrategia de pricing y posicionamiento'
        ],
        decisiones_tomadas: [
          'Aprobado lanzamiento seguro ciber PYMES',
          'Aprobada provision adicional por prudencia regulatoria'
        ],
        acciones_pendientes: [
          { responsable: 'CPO', accion: 'Finalizar condicionado del producto ciber', plazo: fechaRelativa(-15) },
          { responsable: 'CRO', accion: 'Validar modelo de riesgo ciber con reasegurador', plazo: fechaRelativa(-10) }
        ],
        notas: 'Sesion productiva enfocada en innovacion. CRO expresa reservas sobre suscripcion ciber sin historico de siniestralidad.'
      },
      {
        id: generarId('acta'),
        fecha: fechaRelativa(5),
        tipo: 'Reunion diaria del Consejo',
        hora_inicio: '09:00',
        hora_fin: '10:15',
        asistentes: ['CFO', 'COO', 'CMO', 'CTO', 'CLO', 'CHRO', 'CRO', 'CPO'],
        temas_tratados: [
          'Renegociacion reaseguro con Swiss Re',
          'Actualizacion normativa DORA',
          'Revision de exposicion catastrofica'
        ],
        decisiones_tomadas: [
          'Aprobadas nuevas condiciones reaseguro Swiss Re',
          'Iniciado plan de adaptacion DORA'
        ],
        acciones_pendientes: [
          { responsable: 'CFO', accion: 'Firmar nuevo contrato reaseguro', plazo: fechaRelativa(-2) },
          { responsable: 'CTO', accion: 'Evaluar gaps tecnologicos DORA', plazo: fechaRelativa(-10) }
        ],
        notas: 'Excelente resultado en negociacion de reaseguro. Ahorro significativo de 1.2M EUR.'
      },
      {
        id: generarId('acta'),
        fecha: fechaRelativa(7),
        tipo: 'Reunion diaria del Consejo',
        hora_inicio: '09:00',
        hora_fin: '10:45',
        asistentes: ['CFO', 'COO', 'CMO', 'CTO', 'CLO', 'CHRO', 'CRO', 'CPO'],
        temas_tratados: [
          'Propuesta externalizacion peritaje baja cuantia',
          'Expansion canal comparador digital',
          'Plan formacion IA generativa'
        ],
        decisiones_tomadas: [
          'Rechazada externalizacion peritaje por empate 4-4',
          'Aprobada expansion comparador digital',
          'Aprobado plan formacion IA'
        ],
        acciones_pendientes: [
          { responsable: 'COO', accion: 'Reformular propuesta externalizacion con garantias de calidad', plazo: fechaRelativa(-5) },
          { responsable: 'CMO', accion: 'Definir roadmap comparador digital', plazo: fechaRelativa(-10) }
        ],
        notas: 'Debate intenso sobre externalizacion. COO y CMO a favor, CRO y CLO en contra por riesgos de calidad y cumplimiento.'
      }
    ]
  };
}

// --- Votacion ---
function votar(decisionId, directorId, voto) {
  if (!decisionId || !directorId || voto === undefined) {
    return { exito: false, error: 'Se requieren decisionId, directorId y voto (true/false)' };
  }

  const directoresValidos = ['cfo', 'coo', 'cmo', 'cto', 'clo', 'chro', 'cro', 'cpo'];
  if (!directoresValidos.includes(directorId.toLowerCase())) {
    return { exito: false, error: `Director no valido. Directores: ${directoresValidos.join(', ')}` };
  }

  // Inicializar votacion si no existe
  if (!votacionesActivas.has(decisionId)) {
    votacionesActivas.set(decisionId, {
      id: decisionId,
      votos_favor: 0,
      votos_contra: 0,
      votantes: [],
      estado: 'abierta',
      fecha_apertura: new Date().toISOString()
    });
  }

  const votacion = votacionesActivas.get(decisionId);

  // Verificar si ya voto
  if (votacion.votantes.includes(directorId.toLowerCase())) {
    return { exito: false, error: `El director ${directorId} ya ha votado en esta decision` };
  }

  // Registrar voto
  if (voto === true || voto === 'favor' || voto === 'si') {
    votacion.votos_favor++;
  } else {
    votacion.votos_contra++;
  }
  votacion.votantes.push(directorId.toLowerCase());

  const totalVotos = votacion.votos_favor + votacion.votos_contra;
  let resultado = 'pendiente';
  let aprobada = null;

  // Verificar si hay mayoria (5/8)
  if (votacion.votos_favor >= 5) {
    resultado = 'aprobada';
    aprobada = true;
    votacion.estado = 'cerrada';
  } else if (votacion.votos_contra >= 4) {
    resultado = 'rechazada';
    aprobada = false;
    votacion.estado = 'cerrada';
  } else if (totalVotos === 8) {
    resultado = votacion.votos_favor > votacion.votos_contra ? 'aprobada' : 'rechazada';
    aprobada = votacion.votos_favor > votacion.votos_contra;
    votacion.estado = 'cerrada';
  }

  votacionesActivas.set(decisionId, votacion);

  return {
    exito: true,
    decision_id: decisionId,
    director: directorId,
    voto: voto === true || voto === 'favor' || voto === 'si' ? 'favor' : 'contra',
    votos_favor: votacion.votos_favor,
    votos_contra: votacion.votos_contra,
    votos_restantes: 8 - totalVotos,
    mayoria_necesaria: 5,
    resultado,
    aprobada,
    estado_votacion: votacion.estado,
    mensaje: resultado === 'pendiente'
      ? `Voto registrado. Faltan ${8 - totalVotos} votos. Se necesitan ${5 - votacion.votos_favor} votos mas a favor para aprobar.`
      : `Votacion cerrada: ${resultado.toUpperCase()}. Resultado: ${votacion.votos_favor} a favor, ${votacion.votos_contra} en contra.`
  };
}

// --- Directivos con estado actual ---
function getDirectivos() {
  const directores = getDirectoresBase();

  return {
    total: directores.length,
    estados: {
      analizando: directores.filter(d => d.estado === 'analizando').length,
      reportando: directores.filter(d => d.estado === 'reportando').length,
      decidiendo: directores.filter(d => d.estado === 'decidiendo').length,
      esperando: directores.filter(d => d.estado === 'esperando').length
    },
    directivos: directores
  };
}

// --- Votaciones activas ---
function getVotacionesActivas() {
  // Generar votaciones de ejemplo si no hay ninguna
  const votacionesDemo = [
    {
      id: generarId('vot-activa'),
      titulo: 'Incrementar limite de suscripcion automatica a 50.000 EUR',
      propuesta_por: 'CRO',
      fecha_apertura: fechaHoy(),
      votos_favor: 3,
      votos_contra: 1,
      votantes: ['cfo', 'coo', 'cro', 'clo'],
      votos_pendientes: ['cmo', 'cto', 'chro', 'cpo'],
      estado: 'abierta',
      plazo: fechaRelativa(-2),
      descripcion: 'Elevar el umbral de suscripcion automatica de 30K a 50K EUR para polizas estandar, reduciendo tiempos de emision en un 25%.'
    },
    {
      id: generarId('vot-activa'),
      titulo: 'Apertura de oficina comercial en Lisboa',
      propuesta_por: 'CMO',
      fecha_apertura: fechaRelativa(1),
      votos_favor: 2,
      votos_contra: 2,
      votantes: ['cmo', 'cfo', 'clo', 'cro'],
      votos_pendientes: ['coo', 'cto', 'chro', 'cpo'],
      estado: 'abierta',
      plazo: fechaRelativa(-5),
      descripcion: 'Expansion internacional con oficina en Portugal. Inversion estimada 800K EUR. ROI esperado en 24 meses.'
    }
  ];

  // Combinar con votaciones reales registradas
  const activas = [];
  votacionesActivas.forEach((v, id) => {
    if (v.estado === 'abierta') {
      activas.push(v);
    }
  });

  const todasActivas = [...votacionesDemo, ...activas];

  return {
    total: todasActivas.length,
    votaciones: todasActivas,
    quorum_necesario: 5,
    total_directivos: 8
  };
}

// --- Estadisticas del consejo ---
function getEstadisticas() {
  const decisiones = getDecisiones();

  return {
    reuniones_mes: 22,
    reuniones_extraordinarias_mes: 3,
    decisiones_tomadas: decisiones.total,
    decisiones_aprobadas: decisiones.aprobadas,
    decisiones_rechazadas: decisiones.rechazadas,
    tasa_consenso: Math.round((decisiones.unanimes / decisiones.total) * 100 * 10) / 10,
    tasa_aprobacion: Math.round((decisiones.aprobadas / decisiones.total) * 100 * 10) / 10,
    tiempo_medio_decision: '23 minutos',
    participacion_media: '100%',
    directivos_activos: 8,
    votaciones_pendientes: 2,
    proxima_reunion: fechaRelativa(-1) + ' 09:00',
    rendimiento_global: {
      eficiencia: 92.4,
      cohesion: 87.1,
      velocidad_decision: 94.3,
      calidad_decisiones: 89.8
    }
  };
}

// --- Exportaciones ---
module.exports = {
  getReunionDiaria,
  getDecisiones,
  getActas,
  votar,
  getDirectivos,
  getVotacionesActivas,
  getEstadisticas
};
