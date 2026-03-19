/**
 * Agente Autonomo Legal
 * Gestion integral del departamento juridico: contratos, litigios, compliance, alertas
 */

const contratos = [
  { id: 'CTR-001', tipo: 'Proveedor IT', contraparte: 'CloudTech Solutions S.L.', importe: 96000, inicio: '2025-01-01', vencimiento: '2026-12-31', estado: 'vigente', renovacion_automatica: true, alertas: ['Vencimiento en 9 meses'] },
  { id: 'CTR-002', tipo: 'Proveedor IT', contraparte: 'Seguridad Digital S.A.', importe: 36000, inicio: '2025-06-01', vencimiento: '2026-05-31', estado: 'vigente', renovacion_automatica: false, alertas: ['Vencimiento en 2 meses', 'Negociar renovacion'] },
  { id: 'CTR-003', tipo: 'Reaseguro', contraparte: 'Munich Re', importe: 420000, inicio: '2026-01-01', vencimiento: '2026-12-31', estado: 'vigente', renovacion_automatica: false, alertas: [] },
  { id: 'CTR-004', tipo: 'Reaseguro', contraparte: 'Swiss Re', importe: 180000, inicio: '2025-07-01', vencimiento: '2026-06-30', estado: 'vigente', renovacion_automatica: false, alertas: ['Vencimiento en 3 meses', 'Iniciar negociacion renovacion'] },
  { id: 'CTR-005', tipo: 'Alquiler oficinas', contraparte: 'Inmobiliaria Centro S.A.', importe: 108000, inicio: '2022-01-01', vencimiento: '2027-12-31', estado: 'vigente', renovacion_automatica: true, alertas: [] },
  { id: 'CTR-006', tipo: 'Servicios profesionales', contraparte: 'Deloitte Auditores', importe: 28000, inicio: '2026-01-01', vencimiento: '2026-12-31', estado: 'vigente', renovacion_automatica: false, alertas: [] },
  { id: 'CTR-007', tipo: 'Agente comercial', contraparte: 'Mediadores Asociados S.L.', importe: 85000, inicio: '2024-03-01', vencimiento: '2026-02-28', estado: 'vencido', renovacion_automatica: false, alertas: ['Contrato vencido - requiere renovacion urgente'] },
  { id: 'CTR-008', tipo: 'Agente comercial', contraparte: 'Correduria Martinez e Hijos', importe: 62000, inicio: '2025-01-01', vencimiento: '2026-12-31', estado: 'vigente', renovacion_automatica: true, alertas: [] },
  { id: 'CTR-009', tipo: 'Empleado directivo', contraparte: 'Javier Lopez Sanchez (CTO)', importe: 58000, inicio: '2017-11-20', vencimiento: null, estado: 'vigente', renovacion_automatica: null, alertas: ['Clausula de no competencia vence en 6 meses post-salida'] },
  { id: 'CTR-010', tipo: 'Mantenimiento', contraparte: 'Servicios Integrales Levante S.L.', importe: 18000, inicio: '2025-04-01', vencimiento: '2026-03-31', estado: 'vigente', renovacion_automatica: true, alertas: ['Vencimiento este mes'] },
  { id: 'CTR-011', tipo: 'Proteccion de datos', contraparte: 'DPO Consulting S.L.', importe: 15000, inicio: '2025-05-15', vencimiento: '2026-05-14', estado: 'vigente', renovacion_automatica: false, alertas: ['Vencimiento en 2 meses'] },
  { id: 'CTR-012', tipo: 'Perito externo', contraparte: 'Peritaciones del Sur S.L.', importe: 42000, inicio: '2025-01-01', vencimiento: '2026-12-31', estado: 'vigente', renovacion_automatica: false, alertas: [] },
];

const litigios = [
  {
    id: 'LIT-001', tipo: 'reclamacion', demandante: 'Juan Carlos Medina Ortiz',
    descripcion: 'Reclamacion por demora en pago de siniestro de hogar. Dano por agua no cubierto segun poliza.',
    importe_reclamado: 18500, probabilidad_exito: 75, estado: 'En tramite',
    abogado_asignado: 'Sofia Navarro Perez', proxima_actuacion: { tipo: 'Vista oral', fecha: '2026-04-15' },
    fecha_inicio: '2025-11-03', provision: 5000, juzgado: 'Juzgado de Primera Instancia 12 de Madrid',
  },
  {
    id: 'LIT-002', tipo: 'demanda', demandante: 'Transportes Rapidos del Norte S.A.',
    descripcion: 'Demanda por cobertura de flota. Discrepancia en valoracion de vehiculos siniestrados.',
    importe_reclamado: 145000, probabilidad_exito: 60, estado: 'En fase probatoria',
    abogado_asignado: 'Fernando Moreno Gil', proxima_actuacion: { tipo: 'Presentacion pericial', fecha: '2026-05-20' },
    fecha_inicio: '2025-06-18', provision: 65000, juzgado: 'Juzgado Mercantil 3 de Barcelona',
  },
  {
    id: 'LIT-003', tipo: 'reclamacion', demandante: 'Maria Dolores Vega Sanz',
    descripcion: 'Reclamacion por lesiones en accidente de trafico. Incapacidad temporal.',
    importe_reclamado: 32000, probabilidad_exito: 80, estado: 'Negociacion',
    abogado_asignado: 'Sofia Navarro Perez', proxima_actuacion: { tipo: 'Reunion de mediacion', fecha: '2026-03-28' },
    fecha_inicio: '2025-09-22', provision: 8000, juzgado: 'Pendiente - en mediacion',
  },
  {
    id: 'LIT-004', tipo: 'arbitraje', demandante: 'Constructora Levantina S.L.',
    descripcion: 'Arbitraje por poliza de responsabilidad civil. Defectos constructivos en promocion.',
    importe_reclamado: 280000, probabilidad_exito: 45, estado: 'En tramite arbitral',
    abogado_asignado: 'Fernando Moreno Gil', proxima_actuacion: { tipo: 'Audiencia arbitral', fecha: '2026-06-10' },
    fecha_inicio: '2025-03-10', provision: 140000, juzgado: 'Corte de Arbitraje de Madrid',
  },
  {
    id: 'LIT-005', tipo: 'reclamacion', demandante: 'Pedro Alonso Ruiz',
    descripcion: 'Reclamacion por robo en vivienda. Discrepancia en inventario de bienes sustraidos.',
    importe_reclamado: 22000, probabilidad_exito: 70, estado: 'Instruccion',
    abogado_asignado: 'Sofia Navarro Perez', proxima_actuacion: { tipo: 'Declaracion testifical', fecha: '2026-04-22' },
    fecha_inicio: '2026-01-08', provision: 8000, juzgado: 'Juzgado de Primera Instancia 5 de Valencia',
  },
  {
    id: 'LIT-006', tipo: 'demanda', demandante: 'Comunidad de Propietarios Edificio Alameda',
    descripcion: 'Demanda colectiva por danos estructurales cubiertos por poliza multirriesgo comunitario.',
    importe_reclamado: 95000, probabilidad_exito: 55, estado: 'En fase de alegaciones',
    abogado_asignado: 'Fernando Moreno Gil', proxima_actuacion: { tipo: 'Escrito de conclusiones', fecha: '2026-05-05' },
    fecha_inicio: '2025-08-14', provision: 45000, juzgado: 'Juzgado de Primera Instancia 8 de Sevilla',
  },
  {
    id: 'LIT-007', tipo: 'reclamacion', demandante: 'Ana Belen Torres Garcia',
    descripcion: 'Reclamacion por accidente laboral. Cuestionamiento de cobertura de poliza de accidentes.',
    importe_reclamado: 55000, probabilidad_exito: 65, estado: 'Mediacion',
    abogado_asignado: 'Sofia Navarro Perez', proxima_actuacion: { tipo: 'Sesion de mediacion', fecha: '2026-04-02' },
    fecha_inicio: '2025-12-01', provision: 20000, juzgado: 'Servicio de Mediacion de Seguros',
  },
  {
    id: 'LIT-008', tipo: 'demanda', demandante: 'Clinica Dental Sonrisa S.L.',
    descripcion: 'Demanda por denegacion de cobertura de RC profesional. Error medico con danos a paciente.',
    importe_reclamado: 120000, probabilidad_exito: 50, estado: 'Pendiente de sentencia',
    abogado_asignado: 'Fernando Moreno Gil', proxima_actuacion: { tipo: 'Notificacion sentencia', fecha: '2026-04-30' },
    fecha_inicio: '2024-11-20', provision: 60000, juzgado: 'Juzgado de Primera Instancia 2 de Bilbao',
  },
];

const acuerdosExtrajudiciales = [
  { id: 'AEJ-001', caso: 'Reclamacion inundacion vivienda - Roberto Sanchez', importe_reclamado: 25000, importe_acordado: 14500, fecha_acuerdo: '2025-10-15', ahorro_vs_juicio: 10500, tiempo_resolucion_dias: 45 },
  { id: 'AEJ-002', caso: 'Accidente multiple A-6 - varios vehiculos', importe_reclamado: 68000, importe_acordado: 52000, fecha_acuerdo: '2025-08-22', ahorro_vs_juicio: 16000, tiempo_resolucion_dias: 90 },
  { id: 'AEJ-003', caso: 'Danos por obras en local comercial - Cafeteria El Rincon', importe_reclamado: 15000, importe_acordado: 9800, fecha_acuerdo: '2025-12-10', ahorro_vs_juicio: 5200, tiempo_resolucion_dias: 30 },
  { id: 'AEJ-004', caso: 'Rotura tuberia comunitaria - Finca Alamos 12', importe_reclamado: 42000, importe_acordado: 31000, fecha_acuerdo: '2026-01-20', ahorro_vs_juicio: 11000, tiempo_resolucion_dias: 60 },
  { id: 'AEJ-005', caso: 'Incendio parcial en nave - Industrias Metalicas Lopez', importe_reclamado: 180000, importe_acordado: 135000, fecha_acuerdo: '2026-02-05', ahorro_vs_juicio: 45000, tiempo_resolucion_dias: 120 },
  { id: 'AEJ-006', caso: 'Lesiones leves accidente trafico - Carmen Perez', importe_reclamado: 12000, importe_acordado: 8500, fecha_acuerdo: '2026-03-01', ahorro_vs_juicio: 3500, tiempo_resolucion_dias: 25 },
];

const alertasLegales = [
  { id: 'AL-001', tipo: 'regulatoria', severidad: 'alta', fecha: '2026-03-15', titulo: 'Nueva directiva DORA - Resiliencia operativa digital', descripcion: 'Entra en vigor la aplicacion completa del Reglamento DORA. Revisar cumplimiento de requisitos de resiliencia operativa digital y continuidad de negocio.', accion_requerida: 'Completar gap analysis y plan de remediacion antes del 30/06/2026', responsable: 'Fernando Moreno Gil' },
  { id: 'AL-002', tipo: 'contractual', severidad: 'alta', fecha: '2026-03-10', titulo: 'Contrato CTR-007 vencido sin renovar', descripcion: 'El contrato con Mediadores Asociados S.L. vencio el 28/02/2026 y no se ha renovado. Riesgo de perdida de canal de distribucion.', accion_requerida: 'Contactar con Mediadores Asociados para negociar renovacion urgente', responsable: 'Fernando Moreno Gil' },
  { id: 'AL-003', tipo: 'fiscal', severidad: 'media', fecha: '2026-03-18', titulo: 'Plazo presentacion Modelo 303 Q1', descripcion: 'La liquidacion trimestral de IVA debe presentarse antes del 20/04/2026. Coordinar con departamento financiero.', accion_requerida: 'Revisar y aprobar liquidacion IVA antes del 15/04/2026', responsable: 'Elena Gil Martin' },
  { id: 'AL-004', tipo: 'litigio', severidad: 'alta', fecha: '2026-03-19', titulo: 'Vista oral LIT-001 en 27 dias', descripcion: 'Vista oral del caso Juan Carlos Medina el 15/04/2026. Preparar documentacion y testigos.', accion_requerida: 'Preparar escrito de conclusiones y convocar peritos', responsable: 'Sofia Navarro Perez' },
  { id: 'AL-005', tipo: 'regulatoria', severidad: 'media', fecha: '2026-03-12', titulo: 'Actualizacion Ley de Contrato de Seguro', descripcion: 'Reforma parcial de la LCS publicada en BOE. Afecta a clausulas de rescision y plazos de comunicacion de siniestros.', accion_requerida: 'Actualizar clausulado de polizas antes del 01/07/2026', responsable: 'Fernando Moreno Gil' },
  { id: 'AL-006', tipo: 'contractual', severidad: 'media', fecha: '2026-03-05', titulo: 'Vencimiento contrato DPO Consulting', descripcion: 'El contrato CTR-011 con DPO Consulting vence el 14/05/2026. Evaluar renovacion o cambio de proveedor.', accion_requerida: 'Solicitar propuestas de renovacion y alternativas', responsable: 'Raul Herrero Blanco' },
  { id: 'AL-007', tipo: 'compliance', severidad: 'alta', fecha: '2026-03-08', titulo: 'Auditoria interna PBC/FT pendiente', descripcion: 'La auditoria anual de Prevencion de Blanqueo de Capitales y Financiacion del Terrorismo debe completarse en Q1 2026.', accion_requerida: 'Programar auditoria interna antes del 31/03/2026', responsable: 'Fernando Moreno Gil' },
  { id: 'AL-008', tipo: 'proteccion_datos', severidad: 'media', fecha: '2026-03-14', titulo: 'Revision anual EIPD', descripcion: 'Evaluacion de Impacto en Proteccion de Datos debe actualizarse anualmente. Ultima revision: marzo 2025.', accion_requerida: 'Iniciar proceso de revision EIPD con DPO', responsable: 'Raul Herrero Blanco' },
  { id: 'AL-009', tipo: 'litigio', severidad: 'media', fecha: '2026-03-16', titulo: 'Sentencia pendiente caso LIT-008', descripcion: 'Caso Clinica Dental Sonrisa - sentencia esperada para finales de abril. Provision constituida: 60.000 EUR.', accion_requerida: 'Preparar escenarios de apelacion segun resultado', responsable: 'Fernando Moreno Gil' },
  { id: 'AL-010', tipo: 'regulatoria', severidad: 'baja', fecha: '2026-03-17', titulo: 'Nuevo baremo de indemnizaciones 2026', descripcion: 'Publicado nuevo baremo de valoracion de danos corporales en accidentes de trafico. Actualizacion de importes.', accion_requerida: 'Actualizar tablas de valoracion en sistema de siniestros', responsable: 'Sofia Navarro Perez' },
  { id: 'AL-011', tipo: 'contractual', severidad: 'baja', fecha: '2026-03-01', titulo: 'Revision clausulas reaseguro Swiss Re', descripcion: 'Contrato CTR-004 con Swiss Re vence en junio. Revisar condiciones de cobertura y exclusiones.', accion_requerida: 'Preparar borrador de nuevas condiciones', responsable: 'Fernando Moreno Gil' },
];

/**
 * Devuelve todos los contratos activos con alertas
 */
function getContratosLegales() {
  const vigentes = contratos.filter(c => c.estado === 'vigente');
  const vencidos = contratos.filter(c => c.estado === 'vencido');
  const conAlertas = contratos.filter(c => c.alertas.length > 0);
  const importeTotal = vigentes.reduce((s, c) => s + c.importe, 0);

  const porTipo = {};
  contratos.forEach(c => {
    if (!porTipo[c.tipo]) porTipo[c.tipo] = { count: 0, importe: 0 };
    porTipo[c.tipo].count++;
    porTipo[c.tipo].importe += c.importe;
  });

  return {
    contratos,
    resumen: {
      total_contratos: contratos.length,
      vigentes: vigentes.length,
      vencidos: vencidos.length,
      con_alertas: conAlertas.length,
      importe_total_vigente: importeTotal,
      distribucion_tipo: Object.entries(porTipo).map(([tipo, data]) => ({
        tipo, contratos: data.count, importe: data.importe,
      })),
    },
    proximos_vencimientos: contratos
      .filter(c => c.vencimiento && c.estado === 'vigente')
      .sort((a, b) => new Date(a.vencimiento) - new Date(b.vencimiento))
      .slice(0, 5)
      .map(c => ({ id: c.id, contraparte: c.contraparte, vencimiento: c.vencimiento, importe: c.importe })),
    alertas_contratos: conAlertas.map(c => ({ id: c.id, contraparte: c.contraparte, alertas: c.alertas })),
  };
}

/**
 * Devuelve todos los litigios activos con analisis
 */
function getLitigios() {
  const totalReclamado = litigios.reduce((s, l) => s + l.importe_reclamado, 0);
  const totalProvision = litigios.reduce((s, l) => s + l.provision, 0);
  const probExitoMedia = Math.round((litigios.reduce((s, l) => s + l.probabilidad_exito, 0) / litigios.length) * 10) / 10;

  const porTipo = {};
  litigios.forEach(l => {
    if (!porTipo[l.tipo]) porTipo[l.tipo] = { count: 0, importe: 0 };
    porTipo[l.tipo].count++;
    porTipo[l.tipo].importe += l.importe_reclamado;
  });

  const porAbogado = {};
  litigios.forEach(l => {
    if (!porAbogado[l.abogado_asignado]) porAbogado[l.abogado_asignado] = { count: 0, importe: 0 };
    porAbogado[l.abogado_asignado].count++;
    porAbogado[l.abogado_asignado].importe += l.importe_reclamado;
  });

  return {
    litigios,
    resumen: {
      total_litigios: litigios.length,
      importe_total_reclamado: totalReclamado,
      provision_total: totalProvision,
      exposicion_neta: totalReclamado - totalProvision,
      probabilidad_exito_media: probExitoMedia,
      distribucion_tipo: Object.entries(porTipo).map(([tipo, data]) => ({
        tipo, casos: data.count, importe: data.importe,
      })),
      carga_por_abogado: Object.entries(porAbogado).map(([abogado, data]) => ({
        abogado, casos: data.count, importe_total: data.importe,
      })),
    },
    proximas_actuaciones: litigios
      .map(l => ({ id: l.id, demandante: l.demandante, ...l.proxima_actuacion, importe_reclamado: l.importe_reclamado }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha)),
    casos_alto_riesgo: litigios
      .filter(l => l.importe_reclamado > 100000 || l.probabilidad_exito < 50)
      .map(l => ({ id: l.id, demandante: l.demandante, importe: l.importe_reclamado, prob_exito: l.probabilidad_exito, motivo_riesgo: l.importe_reclamado > 100000 ? 'Importe elevado' : 'Baja probabilidad de exito' })),
  };
}

/**
 * Alertas legales activas
 */
function getAlertasLegales() {
  const porSeveridad = { alta: [], media: [], baja: [] };
  alertasLegales.forEach(a => porSeveridad[a.severidad].push(a));

  const porTipo = {};
  alertasLegales.forEach(a => {
    if (!porTipo[a.tipo]) porTipo[a.tipo] = 0;
    porTipo[a.tipo]++;
  });

  return {
    alertas: alertasLegales.sort((a, b) => {
      const sev = { alta: 0, media: 1, baja: 2 };
      return sev[a.severidad] - sev[b.severidad];
    }),
    resumen: {
      total_alertas: alertasLegales.length,
      por_severidad: { alta: porSeveridad.alta.length, media: porSeveridad.media.length, baja: porSeveridad.baja.length },
      por_tipo: porTipo,
    },
    urgentes: porSeveridad.alta.map(a => ({ id: a.id, titulo: a.titulo, accion: a.accion_requerida, responsable: a.responsable })),
  };
}

/**
 * Acuerdos extrajudiciales alcanzados
 */
function getAcuerdosExtrajudiciales() {
  const totalReclamado = acuerdosExtrajudiciales.reduce((s, a) => s + a.importe_reclamado, 0);
  const totalAcordado = acuerdosExtrajudiciales.reduce((s, a) => s + a.importe_acordado, 0);
  const totalAhorro = acuerdosExtrajudiciales.reduce((s, a) => s + a.ahorro_vs_juicio, 0);
  const tiempoMedio = Math.round(acuerdosExtrajudiciales.reduce((s, a) => s + a.tiempo_resolucion_dias, 0) / acuerdosExtrajudiciales.length);

  // Estimar coste judicial evitado (abogados, procuradores, tasas, tiempo)
  const costeJudicialEvitado = acuerdosExtrajudiciales.length * 4500; // ~4500 EUR medio por juicio

  return {
    acuerdos: acuerdosExtrajudiciales,
    resumen: {
      total_acuerdos: acuerdosExtrajudiciales.length,
      total_reclamado: totalReclamado,
      total_acordado: totalAcordado,
      ahorro_total: totalAhorro,
      ahorro_porcentaje: `${Math.round((totalAhorro / totalReclamado) * 10000) / 100}%`,
      coste_judicial_evitado: costeJudicialEvitado,
      ahorro_total_incluyendo_costas: totalAhorro + costeJudicialEvitado,
      tiempo_medio_resolucion_dias: tiempoMedio,
      ratio_acuerdo_medio: `${Math.round((totalAcordado / totalReclamado) * 10000) / 100}%`,
    },
    analisis: 'La estrategia de acuerdos extrajudiciales ha permitido un ahorro significativo respecto a la via judicial. Se recomienda mantener la politica de mediacion como primera opcion.',
  };
}

/**
 * Desglose de costes legales mensuales
 */
function getCosteLegal() {
  const costes = {
    mes: 'Marzo 2026',
    partidas: [
      { concepto: 'Salarios departamento legal (3 personas)', importe: 10083, tipo: 'fijo' },
      { concepto: 'Seguridad Social empresa', importe: 3035, tipo: 'fijo' },
      { concepto: 'Abogados externos - Caso LIT-002', importe: 3500, tipo: 'variable' },
      { concepto: 'Abogados externos - Caso LIT-004', importe: 4200, tipo: 'variable' },
      { concepto: 'Procuradores', importe: 1800, tipo: 'variable' },
      { concepto: 'Tasas judiciales', importe: 650, tipo: 'variable' },
      { concepto: 'Informes periciales', importe: 2100, tipo: 'variable' },
      { concepto: 'Bases de datos juridicas (Aranzadi, vLex)', importe: 450, tipo: 'fijo' },
      { concepto: 'DPO externo', importe: 1250, tipo: 'fijo' },
      { concepto: 'Formacion juridica continua', importe: 380, tipo: 'variable' },
    ],
    indemnizaciones_pagadas: [
      { caso: 'AEJ-006 - Carmen Perez', importe: 8500, fecha: '2026-03-01' },
    ],
  };

  const totalPartidas = costes.partidas.reduce((s, p) => s + p.importe, 0);
  const totalIndemnizaciones = costes.indemnizaciones_pagadas.reduce((s, i) => s + i.importe, 0);
  const costosFijos = costes.partidas.filter(p => p.tipo === 'fijo').reduce((s, p) => s + p.importe, 0);
  const costosVariables = costes.partidas.filter(p => p.tipo === 'variable').reduce((s, p) => s + p.importe, 0);

  return {
    ...costes,
    resumen: {
      total_gastos_operativos: totalPartidas,
      costes_fijos: costosFijos,
      costes_variables: costosVariables,
      indemnizaciones_mes: totalIndemnizaciones,
      coste_total_mes: totalPartidas + totalIndemnizaciones,
      coste_por_litigio_activo: Math.round(totalPartidas / litigios.length),
    },
    historico_trimestral: [
      { mes: 'Enero 2026', operativo: 26800, indemnizaciones: 31000, total: 57800 },
      { mes: 'Febrero 2026', operativo: 25400, indemnizaciones: 135000, total: 160400 },
      { mes: 'Marzo 2026', operativo: totalPartidas, indemnizaciones: totalIndemnizaciones, total: totalPartidas + totalIndemnizaciones },
    ],
    prevision_q2: {
      operativo_estimado: 82000,
      indemnizaciones_estimadas: 95000,
      total_estimado: 177000,
      nota: 'Se espera sentencia caso LIT-008 (provision 60.000 EUR) y posible acuerdo caso LIT-003',
    },
  };
}

/**
 * Simula negociacion extrajudicial para un litigio
 */
function negociarAcuerdo(litigioId) {
  const litigio = litigios.find(l => l.id === litigioId);
  if (!litigio) {
    return { error: true, mensaje: `Litigio ${litigioId} no encontrado` };
  }

  // Simulacion de negociacion en pasos
  const importeInicial = litigio.importe_reclamado;
  const factorNegociacion = 0.4 + (litigio.probabilidad_exito / 100) * 0.35; // A mayor prob exito nuestra, menos pagamos
  const ofertaInicial = Math.round(importeInicial * (1 - factorNegociacion));
  const contraoferta = Math.round(importeInicial * 0.85);
  const ofertaFinal = Math.round((ofertaInicial + contraoferta) / 2);
  const aceptado = litigio.probabilidad_exito >= 55; // Si tenemos buenas opciones en juicio, la otra parte tiene incentivo para aceptar

  const pasos = [
    { paso: 1, accion: 'Contacto inicial con la parte demandante', detalle: `Se contacta con ${litigio.demandante} para explorar vias de resolucion amistosa.`, dia: 1 },
    { paso: 2, accion: 'Analisis interno de posicion', detalle: `Probabilidad de exito en juicio: ${litigio.probabilidad_exito}%. Provision constituida: ${litigio.provision} EUR. Coste estimado de juicio: ${Math.round(importeInicial * 0.08)} EUR en costas.`, dia: 3 },
    { paso: 3, accion: 'Primera oferta', detalle: `Se ofrece ${ofertaInicial.toLocaleString('es-ES')} EUR (${Math.round(ofertaInicial/importeInicial*100)}% de lo reclamado) como compensacion total.`, dia: 7 },
    { paso: 4, accion: 'Contraoferta de la parte demandante', detalle: `${litigio.demandante} contraoferta con ${contraoferta.toLocaleString('es-ES')} EUR (${Math.round(contraoferta/importeInicial*100)}% de lo reclamado).`, dia: 14 },
    { paso: 5, accion: 'Negociacion intermedia', detalle: `Reunion de mediacion. Se discuten los puntos fuertes y debiles de ambas posiciones. Se exploran alternativas creativas.`, dia: 21 },
    { paso: 6, accion: 'Oferta final', detalle: `Se presenta oferta final de ${ofertaFinal.toLocaleString('es-ES')} EUR con pago en 30 dias naturales.`, dia: 28 },
  ];

  if (aceptado) {
    pasos.push({
      paso: 7, accion: 'Acuerdo alcanzado', detalle: `${litigio.demandante} acepta la oferta de ${ofertaFinal.toLocaleString('es-ES')} EUR. Se procede a redactar acuerdo transaccional.`, dia: 30,
    });
  } else {
    pasos.push({
      paso: 7, accion: 'Negociacion fallida', detalle: `No se alcanza acuerdo. ${litigio.demandante} mantiene su posicion. El caso continua por via judicial.`, dia: 30,
    });
  }

  return {
    litigio_id: litigio.id,
    demandante: litigio.demandante,
    importe_reclamado: importeInicial,
    pasos_negociacion: pasos,
    resultado: {
      acuerdo_alcanzado: aceptado,
      importe_acordado: aceptado ? ofertaFinal : null,
      ahorro_vs_reclamacion: aceptado ? importeInicial - ofertaFinal : 0,
      ahorro_costas_judiciales: aceptado ? Math.round(importeInicial * 0.08) : 0,
      dias_negociacion: aceptado ? 30 : 30,
      proximos_pasos: aceptado
        ? 'Redactar acuerdo transaccional, firmar ante notario, ejecutar pago'
        : 'Continuar preparacion del caso para juicio. Reforzar estrategia procesal.',
    },
  };
}

/**
 * Estado de cumplimiento normativo (compliance)
 */
function getComplianceStatus() {
  const requisitos = [
    { id: 'CMP-001', normativa: 'RGPD / LOPDGDD', area: 'Proteccion de datos', estado: 'cumplido', ultima_revision: '2025-11-15', proxima_revision: '2026-05-15', responsable: 'DPO Consulting S.L.', observaciones: 'Registro de actividades actualizado. EIPD pendiente de revision anual.' },
    { id: 'CMP-002', normativa: 'Ley 10/2010 PBC/FT', area: 'Prevencion blanqueo', estado: 'en_revision', ultima_revision: '2025-03-20', proxima_revision: '2026-03-31', responsable: 'Fernando Moreno Gil', observaciones: 'Auditoria interna anual pendiente de completar. Plazo: 31/03/2026.' },
    { id: 'CMP-003', normativa: 'LOSSEAR / Solvencia II', area: 'Solvencia aseguradora', estado: 'cumplido', ultima_revision: '2025-12-31', proxima_revision: '2026-06-30', responsable: 'Elena Gil Martin', observaciones: 'Ratio de solvencia: 185%. Muy por encima del minimo regulatorio.' },
    { id: 'CMP-004', normativa: 'DORA', area: 'Resiliencia digital', estado: 'en_progreso', ultima_revision: null, proxima_revision: '2026-06-30', responsable: 'Javier Lopez Sanchez', observaciones: 'Gap analysis completado al 60%. Plan de remediacion en desarrollo.' },
    { id: 'CMP-005', normativa: 'Ley de Contrato de Seguro', area: 'Clausulado polizas', estado: 'requiere_actualizacion', ultima_revision: '2025-06-01', proxima_revision: '2026-07-01', responsable: 'Fernando Moreno Gil', observaciones: 'Reforma parcial LCS publicada. Clausulado debe actualizarse antes de julio 2026.' },
    { id: 'CMP-006', normativa: 'Codigo de conducta UNESPA', area: 'Etica empresarial', estado: 'cumplido', ultima_revision: '2025-09-01', proxima_revision: '2026-09-01', responsable: 'Fernando Moreno Gil', observaciones: 'Canal de denuncias operativo. 0 denuncias recibidas en 2025.' },
    { id: 'CMP-007', normativa: 'Ley de Igualdad', area: 'Plan de igualdad', estado: 'cumplido', ultima_revision: '2025-07-15', proxima_revision: '2026-07-15', responsable: 'RRHH', observaciones: 'Plan de igualdad registrado. Brecha salarial: 2.3% (dentro de parametros).' },
    { id: 'CMP-008', normativa: 'PRL', area: 'Prevencion riesgos laborales', estado: 'cumplido', ultima_revision: '2025-10-01', proxima_revision: '2026-10-01', responsable: 'Servicio de Prevencion Ajeno', observaciones: 'Evaluacion de riesgos actualizada. Plan de emergencia revisado.' },
  ];

  const cumplidos = requisitos.filter(r => r.estado === 'cumplido').length;
  const enRevision = requisitos.filter(r => r.estado === 'en_revision' || r.estado === 'en_progreso').length;
  const requierenAccion = requisitos.filter(r => r.estado === 'requiere_actualizacion').length;

  return {
    fecha_informe: new Date().toISOString().split('T')[0],
    requisitos,
    resumen: {
      total_requisitos: requisitos.length,
      cumplidos,
      en_revision: enRevision,
      requieren_actualizacion: requierenAccion,
      porcentaje_cumplimiento: `${Math.round((cumplidos / requisitos.length) * 10000) / 100}%`,
      nivel_riesgo_global: requierenAccion > 2 ? 'alto' : requierenAccion > 0 ? 'medio' : 'bajo',
    },
    acciones_prioritarias: requisitos
      .filter(r => r.estado !== 'cumplido')
      .map(r => ({
        normativa: r.normativa,
        estado: r.estado,
        accion: r.observaciones,
        fecha_limite: r.proxima_revision,
        responsable: r.responsable,
      }))
      .sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite)),
  };
}

/**
 * Estadisticas del departamento legal
 */
function getEstadisticas() {
  const acuerdosData = getAcuerdosExtrajudiciales();
  const costeLegalData = getCosteLegal();
  const complianceData = getComplianceStatus();

  const totalProvision = litigios.reduce((s, l) => s + l.provision, 0);
  const casosGanados = acuerdosExtrajudiciales.length; // Simplificacion: acuerdos = exito
  const casosTotales = acuerdosExtrajudiciales.length + litigios.length;

  return {
    litigios_activos: litigios.length,
    contratos_vigentes: contratos.filter(c => c.estado === 'vigente').length,
    contratos_con_alertas: contratos.filter(c => c.alertas.length > 0).length,
    importe_total_litigios: litigios.reduce((s, l) => s + l.importe_reclamado, 0),
    provision_total: totalProvision,
    coste_legal_mes: costeLegalData.resumen.coste_total_mes,
    coste_legal_trimestre: costeLegalData.historico_trimestral.reduce((s, m) => s + m.total, 0),
    ahorro_extrajudicial: acuerdosData.resumen.ahorro_total_incluyendo_costas,
    tasa_exito: `${Math.round((casosGanados / casosTotales) * 10000) / 100}%`,
    compliance_pct: complianceData.resumen.porcentaje_cumplimiento,
    alertas_activas: alertasLegales.length,
    alertas_alta_prioridad: alertasLegales.filter(a => a.severidad === 'alta').length,
    proxima_actuacion_judicial: litigios
      .map(l => l.proxima_actuacion)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0],
  };
}

module.exports = {
  getContratosLegales,
  getLitigios,
  getAlertasLegales,
  getAcuerdosExtrajudiciales,
  getCosteLegal,
  negociarAcuerdo,
  getComplianceStatus,
  getEstadisticas,
};
