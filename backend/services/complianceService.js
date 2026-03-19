// ============================================================================
// Servicio de Cumplimiento Normativo - DGSFP (Seguros Espana)
// Normativas: LOSSEAR, RGPD, Ley 20/2015, RD 1060/2015, Directiva Solvencia II
// ============================================================================

const plazosLegales = {
  acuse_recibo: { horas: 24, descripcion: 'Acuse de recibo del siniestro', normativa: 'Art. 18 Ley 50/1980 LCS' },
  comunicacion_cobertura: { dias: 5, descripcion: 'Comunicacion de cobertura o denegacion', normativa: 'Art. 18 Ley 50/1980 LCS' },
  designacion_perito: { dias: 5, descripcion: 'Designacion de perito tasador', normativa: 'Art. 38 Ley 50/1980 LCS' },
  informe_perito: { dias: 30, descripcion: 'Emision de informe pericial', normativa: 'Art. 38 Ley 50/1980 LCS' },
  resolucion: { dias: 40, descripcion: 'Resolucion del expediente de siniestro', normativa: 'Art. 18 Ley 50/1980 LCS' },
  pago_tras_acuerdo: { dias: 5, descripcion: 'Pago una vez alcanzado acuerdo', normativa: 'Art. 18 Ley 50/1980 LCS' },
  respuesta_reclamacion: { dias: 30, descripcion: 'Respuesta a reclamacion del asegurado', normativa: 'Orden ECO/734/2004' },
  comunicacion_dgsfp: { dias: 10, descripcion: 'Comunicacion de incidencias a DGSFP', normativa: 'RD 1060/2015' },
  conservacion_datos: { anios: 6, descripcion: 'Conservacion de documentacion', normativa: 'Art. 30 Codigo de Comercio' },
  notificacion_brecha: { horas: 72, descripcion: 'Notificacion de brecha de datos personales', normativa: 'Art. 33 RGPD' },
  derecho_acceso: { dias: 30, descripcion: 'Respuesta a solicitud de acceso a datos', normativa: 'Art. 15 RGPD' },
  revision_riesgo: { dias: 90, descripcion: 'Revision periodica de valoracion de riesgo', normativa: 'Directiva Solvencia II' },
};

// Expedientes de siniestros simulados
const expedientes = [
  { id: 'SIN-2026-0001', tipo: 'auto', fecha_apertura: '2026-03-01', estado: 'en_tramite', asegurado: 'Maria Garcia Lopez', acuse_enviado: true, fecha_acuse: '2026-03-01', cobertura_comunicada: true, fecha_cobertura: '2026-03-04', perito_asignado: true, fecha_perito: '2026-03-05', informe_perito: false, resuelto: false, pagado: false },
  { id: 'SIN-2026-0002', tipo: 'hogar', fecha_apertura: '2026-02-20', estado: 'pendiente_pago', asegurado: 'Carlos Fernandez Ruiz', acuse_enviado: true, fecha_acuse: '2026-02-20', cobertura_comunicada: true, fecha_cobertura: '2026-02-24', perito_asignado: true, fecha_perito: '2026-02-25', informe_perito: true, fecha_informe: '2026-03-10', resuelto: true, fecha_resolucion: '2026-03-15', pagado: false },
  { id: 'SIN-2026-0003', tipo: 'salud', fecha_apertura: '2026-03-10', estado: 'en_tramite', asegurado: 'Ana Martinez Diaz', acuse_enviado: true, fecha_acuse: '2026-03-11', cobertura_comunicada: false, perito_asignado: false, informe_perito: false, resuelto: false, pagado: false },
  { id: 'SIN-2026-0004', tipo: 'auto', fecha_apertura: '2026-01-15', estado: 'en_tramite', asegurado: 'Pedro Sanchez Moreno', acuse_enviado: true, fecha_acuse: '2026-01-15', cobertura_comunicada: true, fecha_cobertura: '2026-01-18', perito_asignado: true, fecha_perito: '2026-01-20', informe_perito: true, fecha_informe: '2026-02-15', resuelto: false, pagado: false },
  { id: 'SIN-2026-0005', tipo: 'vida', fecha_apertura: '2026-03-05', estado: 'en_tramite', asegurado: 'Laura Gomez Navarro', acuse_enviado: true, fecha_acuse: '2026-03-05', cobertura_comunicada: true, fecha_cobertura: '2026-03-08', perito_asignado: false, informe_perito: false, resuelto: false, pagado: false },
  { id: 'SIN-2026-0006', tipo: 'hogar', fecha_apertura: '2026-02-01', estado: 'resuelto', asegurado: 'Javier Ruiz Torres', acuse_enviado: true, fecha_acuse: '2026-02-01', cobertura_comunicada: true, fecha_cobertura: '2026-02-03', perito_asignado: true, fecha_perito: '2026-02-04', informe_perito: true, fecha_informe: '2026-02-28', resuelto: true, fecha_resolucion: '2026-03-05', pagado: true, fecha_pago: '2026-03-08' },
  { id: 'SIN-2026-0007', tipo: 'auto', fecha_apertura: '2026-03-15', estado: 'nuevo', asegurado: 'Sofia Hernandez Vega', acuse_enviado: false, perito_asignado: false, cobertura_comunicada: false, informe_perito: false, resuelto: false, pagado: false },
  { id: 'SIN-2026-0008', tipo: 'responsabilidad_civil', fecha_apertura: '2026-02-10', estado: 'en_tramite', asegurado: 'Miguel Angel Ramos', acuse_enviado: true, fecha_acuse: '2026-02-10', cobertura_comunicada: true, fecha_cobertura: '2026-02-14', perito_asignado: true, fecha_perito: '2026-02-15', informe_perito: false, resuelto: false, pagado: false },
];

const reclamaciones = [
  { id: 'REC-2026-001', siniestro_id: 'SIN-2026-0004', fecha: '2026-03-01', asegurado: 'Pedro Sanchez Moreno', motivo: 'Demora en resolucion', respondida: false },
  { id: 'REC-2026-002', siniestro_id: 'SIN-2026-0002', fecha: '2026-03-16', asegurado: 'Carlos Fernandez Ruiz', motivo: 'Demora en pago tras acuerdo', respondida: false },
  { id: 'REC-2026-003', siniestro_id: null, fecha: '2026-02-25', asegurado: 'Elena Torres Blanco', motivo: 'Solicitud acceso datos personales', respondida: true, fecha_respuesta: '2026-03-10' },
];

function _hoy() {
  return new Date('2026-03-19');
}

function _diffDias(fechaDesde, fechaHasta) {
  const desde = new Date(fechaDesde);
  const hasta = fechaHasta ? new Date(fechaHasta) : _hoy();
  return Math.floor((hasta - desde) / (1000 * 60 * 60 * 24));
}

function _diffHoras(fechaDesde, fechaHasta) {
  const desde = new Date(fechaDesde);
  const hasta = fechaHasta ? new Date(fechaHasta) : _hoy();
  return Math.floor((hasta - desde) / (1000 * 60 * 60));
}

// ---------------------------------------------------------------------------
// checklistSiniestro - Checklist de cumplimiento para un siniestro concreto
// ---------------------------------------------------------------------------
function checklistSiniestro(siniestroId) {
  const exp = expedientes.find(e => e.id === siniestroId);
  if (!exp) {
    return { error: `Siniestro ${siniestroId} no encontrado` };
  }

  const checklist = [];

  // 1. Acuse de recibo (24h)
  const horasDesdeApertura = _diffHoras(exp.fecha_apertura);
  if (exp.acuse_enviado) {
    const horasAcuse = _diffHoras(exp.fecha_apertura, exp.fecha_acuse);
    checklist.push({
      item: 'Acuse de recibo al asegurado',
      cumple: horasAcuse <= 24,
      plazo_legal: '24 horas',
      tiempo_real: `${horasAcuse} horas`,
      dias_restantes: 0,
      normativa: plazosLegales.acuse_recibo.normativa,
      estado: 'completado',
    });
  } else {
    checklist.push({
      item: 'Acuse de recibo al asegurado',
      cumple: horasDesdeApertura <= 24,
      plazo_legal: '24 horas',
      dias_restantes: Math.max(0, 1 - Math.floor(horasDesdeApertura / 24)),
      normativa: plazosLegales.acuse_recibo.normativa,
      estado: horasDesdeApertura > 24 ? 'vencido' : 'pendiente',
    });
  }

  // 2. Comunicacion de cobertura (5 dias)
  const diasDesdeApertura = _diffDias(exp.fecha_apertura);
  if (exp.cobertura_comunicada) {
    const diasCobertura = _diffDias(exp.fecha_apertura, exp.fecha_cobertura);
    checklist.push({
      item: 'Comunicacion de cobertura/denegacion',
      cumple: diasCobertura <= 5,
      plazo_legal: '5 dias',
      tiempo_real: `${diasCobertura} dias`,
      dias_restantes: 0,
      normativa: plazosLegales.comunicacion_cobertura.normativa,
      estado: 'completado',
    });
  } else {
    checklist.push({
      item: 'Comunicacion de cobertura/denegacion',
      cumple: diasDesdeApertura <= 5,
      plazo_legal: '5 dias',
      dias_restantes: Math.max(0, 5 - diasDesdeApertura),
      normativa: plazosLegales.comunicacion_cobertura.normativa,
      estado: diasDesdeApertura > 5 ? 'vencido' : 'pendiente',
    });
  }

  // 3. Designacion de perito (5 dias)
  if (exp.perito_asignado) {
    const diasPerito = _diffDias(exp.fecha_apertura, exp.fecha_perito);
    checklist.push({
      item: 'Designacion de perito tasador',
      cumple: diasPerito <= 5,
      plazo_legal: '5 dias',
      tiempo_real: `${diasPerito} dias`,
      dias_restantes: 0,
      normativa: plazosLegales.designacion_perito.normativa,
      estado: 'completado',
    });
  } else {
    checklist.push({
      item: 'Designacion de perito tasador',
      cumple: diasDesdeApertura <= 5,
      plazo_legal: '5 dias',
      dias_restantes: Math.max(0, 5 - diasDesdeApertura),
      normativa: plazosLegales.designacion_perito.normativa,
      estado: diasDesdeApertura > 5 ? 'vencido' : 'pendiente',
    });
  }

  // 4. Informe pericial (30 dias desde designacion)
  if (exp.perito_asignado) {
    if (exp.informe_perito) {
      const diasInforme = _diffDias(exp.fecha_perito, exp.fecha_informe);
      checklist.push({
        item: 'Informe pericial',
        cumple: diasInforme <= 30,
        plazo_legal: '30 dias desde designacion perito',
        tiempo_real: `${diasInforme} dias`,
        dias_restantes: 0,
        normativa: plazosLegales.informe_perito.normativa,
        estado: 'completado',
      });
    } else {
      const diasDesdePerito = _diffDias(exp.fecha_perito);
      checklist.push({
        item: 'Informe pericial',
        cumple: diasDesdePerito <= 30,
        plazo_legal: '30 dias desde designacion perito',
        dias_restantes: Math.max(0, 30 - diasDesdePerito),
        normativa: plazosLegales.informe_perito.normativa,
        estado: diasDesdePerito > 30 ? 'vencido' : 'pendiente',
      });
    }
  }

  // 5. Resolucion (40 dias)
  if (exp.resuelto) {
    const diasResolucion = _diffDias(exp.fecha_apertura, exp.fecha_resolucion);
    checklist.push({
      item: 'Resolucion del expediente',
      cumple: diasResolucion <= 40,
      plazo_legal: '40 dias',
      tiempo_real: `${diasResolucion} dias`,
      dias_restantes: 0,
      normativa: plazosLegales.resolucion.normativa,
      estado: 'completado',
    });
  } else {
    checklist.push({
      item: 'Resolucion del expediente',
      cumple: diasDesdeApertura <= 40,
      plazo_legal: '40 dias',
      dias_restantes: Math.max(0, 40 - diasDesdeApertura),
      normativa: plazosLegales.resolucion.normativa,
      estado: diasDesdeApertura > 40 ? 'vencido' : 'pendiente',
    });
  }

  // 6. Pago tras acuerdo (5 dias)
  if (exp.resuelto && !exp.pagado) {
    const diasDesdResolucion = _diffDias(exp.fecha_resolucion);
    checklist.push({
      item: 'Pago tras acuerdo',
      cumple: diasDesdResolucion <= 5,
      plazo_legal: '5 dias tras acuerdo',
      dias_restantes: Math.max(0, 5 - diasDesdResolucion),
      normativa: plazosLegales.pago_tras_acuerdo.normativa,
      estado: diasDesdResolucion > 5 ? 'vencido' : 'pendiente',
    });
  } else if (exp.pagado) {
    const diasPago = _diffDias(exp.fecha_resolucion, exp.fecha_pago);
    checklist.push({
      item: 'Pago tras acuerdo',
      cumple: diasPago <= 5,
      plazo_legal: '5 dias tras acuerdo',
      tiempo_real: `${diasPago} dias`,
      dias_restantes: 0,
      normativa: plazosLegales.pago_tras_acuerdo.normativa,
      estado: 'completado',
    });
  }

  const totalItems = checklist.length;
  const cumplidos = checklist.filter(c => c.cumple).length;

  return {
    siniestro_id: siniestroId,
    asegurado: exp.asegurado,
    tipo: exp.tipo,
    estado: exp.estado,
    fecha_apertura: exp.fecha_apertura,
    checklist,
    resumen: {
      total_items: totalItems,
      cumplidos,
      incumplidos: totalItems - cumplidos,
      porcentaje_cumplimiento: Math.round((cumplidos / totalItems) * 100),
    },
  };
}

// ---------------------------------------------------------------------------
// getAlertasActivas - Alertas de plazos en riesgo y vencidos
// ---------------------------------------------------------------------------
function getAlertasActivas() {
  const alertas = [];

  // Alertas generadas dinamicamente desde expedientes
  for (const exp of expedientes) {
    const diasDesdeApertura = _diffDias(exp.fecha_apertura);

    // Acuse no enviado
    if (!exp.acuse_enviado) {
      const horasDesdeApertura = _diffHoras(exp.fecha_apertura);
      alertas.push({
        id: `ALR-ACU-${exp.id}`,
        tipo: 'plazo_vencido',
        severidad: horasDesdeApertura > 24 ? 'critica' : 'alta',
        siniestro_id: exp.id,
        asegurado: exp.asegurado,
        descripcion: `Acuse de recibo pendiente - ${horasDesdeApertura}h transcurridas (plazo: 24h)`,
        normativa: plazosLegales.acuse_recibo.normativa,
        accion_requerida: 'Enviar acuse de recibo inmediatamente',
        fecha_deteccion: '2026-03-19',
      });
    }

    // Cobertura no comunicada fuera de plazo
    if (!exp.cobertura_comunicada && diasDesdeApertura > 3) {
      alertas.push({
        id: `ALR-COB-${exp.id}`,
        tipo: diasDesdeApertura > 5 ? 'plazo_vencido' : 'plazo_proximo',
        severidad: diasDesdeApertura > 5 ? 'critica' : 'alta',
        siniestro_id: exp.id,
        asegurado: exp.asegurado,
        descripcion: `Comunicacion de cobertura pendiente - ${diasDesdeApertura} dias (plazo: 5 dias)`,
        normativa: plazosLegales.comunicacion_cobertura.normativa,
        accion_requerida: 'Comunicar decision de cobertura al asegurado',
        fecha_deteccion: '2026-03-19',
      });
    }

    // Resolucion proxima a vencer o vencida
    if (!exp.resuelto && diasDesdeApertura > 30) {
      alertas.push({
        id: `ALR-RES-${exp.id}`,
        tipo: diasDesdeApertura > 40 ? 'plazo_vencido' : 'plazo_proximo',
        severidad: diasDesdeApertura > 40 ? 'critica' : 'media',
        siniestro_id: exp.id,
        asegurado: exp.asegurado,
        descripcion: `Resolucion pendiente - ${diasDesdeApertura} dias (plazo: 40 dias). ${diasDesdeApertura > 40 ? 'PLAZO EXCEDIDO' : `Quedan ${40 - diasDesdeApertura} dias`}`,
        normativa: plazosLegales.resolucion.normativa,
        accion_requerida: diasDesdeApertura > 40 ? 'Resolver expediente con URGENCIA - posible sancion DGSFP' : 'Acelerar tramitacion del expediente',
        fecha_deteccion: '2026-03-19',
      });
    }

    // Pago pendiente tras resolucion
    if (exp.resuelto && !exp.pagado) {
      const diasDesdResolucion = _diffDias(exp.fecha_resolucion);
      if (diasDesdResolucion > 3) {
        alertas.push({
          id: `ALR-PAG-${exp.id}`,
          tipo: diasDesdResolucion > 5 ? 'plazo_vencido' : 'plazo_proximo',
          severidad: diasDesdResolucion > 5 ? 'critica' : 'alta',
          siniestro_id: exp.id,
          asegurado: exp.asegurado,
          descripcion: `Pago pendiente tras acuerdo - ${diasDesdResolucion} dias (plazo: 5 dias)`,
          normativa: plazosLegales.pago_tras_acuerdo.normativa,
          accion_requerida: 'Procesar pago al asegurado',
          fecha_deteccion: '2026-03-19',
        });
      }
    }

    // Informe pericial pendiente
    if (exp.perito_asignado && !exp.informe_perito) {
      const diasDesdePerito = _diffDias(exp.fecha_perito);
      if (diasDesdePerito > 20) {
        alertas.push({
          id: `ALR-INF-${exp.id}`,
          tipo: diasDesdePerito > 30 ? 'plazo_vencido' : 'plazo_proximo',
          severidad: diasDesdePerito > 30 ? 'alta' : 'media',
          siniestro_id: exp.id,
          asegurado: exp.asegurado,
          descripcion: `Informe pericial pendiente - ${diasDesdePerito} dias desde designacion (plazo: 30 dias)`,
          normativa: plazosLegales.informe_perito.normativa,
          accion_requerida: 'Requerir informe al perito designado',
          fecha_deteccion: '2026-03-19',
        });
      }
    }
  }

  // Alertas por reclamaciones sin responder
  for (const rec of reclamaciones) {
    if (!rec.respondida) {
      const diasDesdeReclamacion = _diffDias(rec.fecha);
      if (diasDesdeReclamacion > 15) {
        alertas.push({
          id: `ALR-REC-${rec.id}`,
          tipo: diasDesdeReclamacion > 30 ? 'plazo_vencido' : 'plazo_proximo',
          severidad: diasDesdeReclamacion > 30 ? 'critica' : 'alta',
          siniestro_id: rec.siniestro_id,
          asegurado: rec.asegurado,
          descripcion: `Reclamacion sin responder - ${diasDesdeReclamacion} dias (plazo: 30 dias). Motivo: ${rec.motivo}`,
          normativa: plazosLegales.respuesta_reclamacion.normativa,
          accion_requerida: 'Responder reclamacion del asegurado',
          fecha_deteccion: '2026-03-19',
        });
      }
    }
  }

  // Alertas estaticas adicionales de cumplimiento general
  alertas.push(
    {
      id: 'ALR-RGPD-001',
      tipo: 'proteccion_datos',
      severidad: 'media',
      siniestro_id: null,
      descripcion: 'Revision trimestral de politica de proteccion de datos pendiente (Q1 2026)',
      normativa: 'Art. 24 RGPD - Responsabilidad proactiva',
      accion_requerida: 'Completar auditoria interna de tratamiento de datos',
      fecha_deteccion: '2026-03-15',
    },
    {
      id: 'ALR-SOL-001',
      tipo: 'solvencia',
      severidad: 'baja',
      siniestro_id: null,
      descripcion: 'Informe trimestral de solvencia SCR pendiente de envio a DGSFP',
      normativa: 'Directiva Solvencia II - Art. 35',
      accion_requerida: 'Preparar y enviar informe RSR/SFCR trimestral',
      fecha_deteccion: '2026-03-18',
    },
    {
      id: 'ALR-PBC-001',
      tipo: 'prevencion_blanqueo',
      severidad: 'alta',
      siniestro_id: null,
      descripcion: 'Actualizacion de procedimientos PBC/FT requerida por nueva circular SEPBLAC',
      normativa: 'Ley 10/2010 PBC/FT',
      accion_requerida: 'Actualizar manual de prevencion de blanqueo de capitales',
      fecha_deteccion: '2026-03-10',
    }
  );

  return alertas.sort((a, b) => {
    const prioridad = { critica: 0, alta: 1, media: 2, baja: 3 };
    return (prioridad[a.severidad] || 3) - (prioridad[b.severidad] || 3);
  });
}

// ---------------------------------------------------------------------------
// getInformeRegulatorio - Informe trimestral para DGSFP
// ---------------------------------------------------------------------------
function getInformeRegulatorio() {
  const totalExpedientes = expedientes.length;
  const resueltos = expedientes.filter(e => e.resuelto).length;
  const enTramite = expedientes.filter(e => e.estado === 'en_tramite').length;
  const pagados = expedientes.filter(e => e.pagado).length;

  let cumplimientoPlazos = 0;
  let totalVerificaciones = 0;

  for (const exp of expedientes) {
    if (exp.acuse_enviado) {
      totalVerificaciones++;
      if (_diffHoras(exp.fecha_apertura, exp.fecha_acuse) <= 24) cumplimientoPlazos++;
    }
    if (exp.cobertura_comunicada) {
      totalVerificaciones++;
      if (_diffDias(exp.fecha_apertura, exp.fecha_cobertura) <= 5) cumplimientoPlazos++;
    }
    if (exp.resuelto) {
      totalVerificaciones++;
      if (_diffDias(exp.fecha_apertura, exp.fecha_resolucion) <= 40) cumplimientoPlazos++;
    }
    if (exp.pagado) {
      totalVerificaciones++;
      if (_diffDias(exp.fecha_resolucion, exp.fecha_pago) <= 5) cumplimientoPlazos++;
    }
  }

  const pctCumplimiento = totalVerificaciones > 0
    ? Math.round((cumplimientoPlazos / totalVerificaciones) * 100)
    : 100;

  return {
    titulo: 'Informe Regulatorio Trimestral - Q1 2026',
    entidad: 'Seguros Digitales S.A.',
    codigo_dgsfp: 'C-0999',
    periodo: { desde: '2026-01-01', hasta: '2026-03-31' },
    fecha_generacion: '2026-03-19',
    resumen_ejecutivo: {
      total_siniestros: totalExpedientes,
      resueltos,
      en_tramite: enTramite,
      pendientes_pago: resueltos - pagados,
      pagados,
      porcentaje_cumplimiento_plazos: pctCumplimiento,
      reclamaciones_recibidas: reclamaciones.length,
      reclamaciones_resueltas: reclamaciones.filter(r => r.respondida).length,
    },
    desglose_por_ramo: {
      auto: { siniestros: expedientes.filter(e => e.tipo === 'auto').length, importe_medio: 3450 },
      hogar: { siniestros: expedientes.filter(e => e.tipo === 'hogar').length, importe_medio: 5200 },
      salud: { siniestros: expedientes.filter(e => e.tipo === 'salud').length, importe_medio: 1800 },
      vida: { siniestros: expedientes.filter(e => e.tipo === 'vida').length, importe_medio: 25000 },
      responsabilidad_civil: { siniestros: expedientes.filter(e => e.tipo === 'responsabilidad_civil').length, importe_medio: 8900 },
    },
    indicadores_clave: {
      tiempo_medio_resolucion_dias: 28,
      tiempo_medio_primer_contacto_horas: 8,
      ratio_denegacion_pct: 12,
      indice_satisfaccion: 7.8,
      tasa_reclamacion_pct: Math.round((reclamaciones.length / totalExpedientes) * 100),
    },
    cumplimiento_normativo: {
      LOSSEAR: { estado: 'cumple', ultima_revision: '2026-02-15' },
      RGPD: { estado: 'cumple_parcial', ultima_revision: '2026-01-20', observaciones: 'Pendiente revision trimestral Q1' },
      'Solvencia_II': { estado: 'cumple', ultima_revision: '2026-03-01' },
      'PBC_FT': { estado: 'en_revision', ultima_revision: '2025-12-15', observaciones: 'Actualizacion en curso' },
      'Ley_50_1980_LCS': { estado: 'cumple', porcentaje_plazos: pctCumplimiento },
    },
    alertas_activas: getAlertasActivas().length,
    observaciones: [
      'Se recomienda reforzar el equipo de tramitacion para reducir tiempos de resolucion en ramo auto.',
      'Pendiente actualizacion del manual PBC/FT conforme a nueva circular SEPBLAC.',
      'El ratio de cumplimiento de plazos se mantiene por encima del objetivo (85%).',
    ],
  };
}

// ---------------------------------------------------------------------------
// verificarDecision - Verifica si una decision cumple la normativa
// ---------------------------------------------------------------------------
function verificarDecision(tipo, datos) {
  const resultado = {
    tipo_decision: tipo,
    fecha_verificacion: '2026-03-19',
    verificaciones: [],
    cumple_global: true,
  };

  switch (tipo) {
    case 'denegacion_cobertura': {
      resultado.verificaciones.push({
        normativa: 'Art. 18 Ley 50/1980 LCS',
        requisito: 'Denegacion debe comunicarse en plazo de 5 dias con causa justificada',
        cumple: datos.dias_desde_apertura <= 5,
        detalle: datos.dias_desde_apertura <= 5
          ? 'Dentro de plazo legal'
          : `Fuera de plazo: ${datos.dias_desde_apertura} dias (maximo 5)`,
      });
      resultado.verificaciones.push({
        normativa: 'Art. 3 Ley 50/1980 LCS',
        requisito: 'Debe indicarse la clausula contractual que justifica la denegacion',
        cumple: !!datos.clausula_aplicable,
        detalle: datos.clausula_aplicable
          ? `Clausula: ${datos.clausula_aplicable}`
          : 'No se ha indicado clausula contractual',
      });
      resultado.verificaciones.push({
        normativa: 'Orden ECO/734/2004',
        requisito: 'Informar al asegurado de su derecho a reclamar',
        cumple: !!datos.informado_derecho_reclamacion,
        detalle: datos.informado_derecho_reclamacion
          ? 'Asegurado informado de vias de reclamacion'
          : 'OBLIGATORIO informar de derecho a reclamar ante DGSFP',
      });
      break;
    }

    case 'tratamiento_datos': {
      resultado.verificaciones.push({
        normativa: 'Art. 6 RGPD',
        requisito: 'Base juridica para el tratamiento de datos',
        cumple: !!datos.base_juridica,
        detalle: datos.base_juridica || 'No se ha especificado base juridica',
      });
      resultado.verificaciones.push({
        normativa: 'Art. 13 RGPD',
        requisito: 'Informacion proporcionada al interesado',
        cumple: !!datos.interesado_informado,
        detalle: datos.interesado_informado
          ? 'Clausula informativa proporcionada'
          : 'Se requiere informar al interesado sobre el tratamiento',
      });
      resultado.verificaciones.push({
        normativa: 'Art. 5 RGPD',
        requisito: 'Principio de minimizacion de datos',
        cumple: datos.datos_minimos !== false,
        detalle: datos.datos_minimos !== false
          ? 'Se recogen solo datos necesarios'
          : 'Se recogen datos excesivos para la finalidad',
      });
      resultado.verificaciones.push({
        normativa: 'Art. 32 RGPD',
        requisito: 'Medidas de seguridad adecuadas',
        cumple: !!datos.medidas_seguridad,
        detalle: datos.medidas_seguridad
          ? 'Medidas tecnicas y organizativas implementadas'
          : 'Deben implementarse medidas de seguridad',
      });
      break;
    }

    case 'indemnizacion': {
      resultado.verificaciones.push({
        normativa: 'Art. 18 Ley 50/1980 LCS',
        requisito: 'Pago minimo de lo no discutido en 40 dias',
        cumple: datos.dias_desde_apertura <= 40 || !!datos.pago_parcial_realizado,
        detalle: datos.dias_desde_apertura <= 40
          ? `Dentro de plazo (dia ${datos.dias_desde_apertura} de 40)`
          : datos.pago_parcial_realizado
            ? 'Pago parcial de cantidad no discutida realizado'
            : 'INCUMPLIMIENTO: Obligatorio pagar cantidad no discutida',
      });
      resultado.verificaciones.push({
        normativa: 'Art. 20 Ley 50/1980 LCS',
        requisito: 'Intereses de demora si hay retraso injustificado',
        cumple: datos.dias_desde_apertura <= 40 || !!datos.intereses_calculados,
        detalle: datos.dias_desde_apertura > 40 && !datos.intereses_calculados
          ? 'RIESGO: Deben calcularse intereses de demora (interes legal + 50%)'
          : 'Sin obligacion de intereses de demora',
      });
      resultado.verificaciones.push({
        normativa: 'Art. 38 Ley 50/1980 LCS',
        requisito: 'Valoracion pericial contradictoria ofrecida',
        cumple: !!datos.pericial_contradictoria_ofrecida,
        detalle: datos.pericial_contradictoria_ofrecida
          ? 'Asegurado informado de su derecho a perito contradictorio'
          : 'Informar al asegurado de su derecho a designar perito',
      });
      break;
    }

    case 'cesion_datos_terceros': {
      resultado.verificaciones.push({
        normativa: 'Art. 6.1 RGPD',
        requisito: 'Consentimiento o base juridica para cesion',
        cumple: !!datos.consentimiento || !!datos.base_juridica_cesion,
        detalle: datos.consentimiento
          ? 'Consentimiento explicito obtenido'
          : datos.base_juridica_cesion || 'Se requiere consentimiento o base juridica',
      });
      resultado.verificaciones.push({
        normativa: 'Art. 28 RGPD',
        requisito: 'Contrato de encargado de tratamiento',
        cumple: !!datos.contrato_encargado,
        detalle: datos.contrato_encargado
          ? 'Contrato de encargado vigente'
          : 'Debe formalizarse contrato con el encargado del tratamiento',
      });
      break;
    }

    default:
      resultado.verificaciones.push({
        normativa: 'General',
        requisito: `Tipo de decision '${tipo}' no catalogado`,
        cumple: false,
        detalle: 'Consultar con el departamento juridico',
      });
  }

  resultado.cumple_global = resultado.verificaciones.every(v => v.cumple);
  resultado.resumen = resultado.cumple_global
    ? 'La decision CUMPLE con todos los requisitos normativos verificados'
    : `La decision NO CUMPLE: ${resultado.verificaciones.filter(v => !v.cumple).length} requisito(s) incumplido(s)`;

  return resultado;
}

// ---------------------------------------------------------------------------
// getEstadisticas - Estadisticas generales de cumplimiento
// ---------------------------------------------------------------------------
function getEstadisticas() {
  const alertas = getAlertasActivas();
  const alertasActivas = alertas.length;

  let enPlazo = 0;
  let fueraPlazo = 0;
  let totalVerificados = 0;

  for (const exp of expedientes) {
    const diasDesdeApertura = _diffDias(exp.fecha_apertura);

    if (exp.resuelto) {
      totalVerificados++;
      const diasResolucion = _diffDias(exp.fecha_apertura, exp.fecha_resolucion);
      if (diasResolucion <= 40) enPlazo++;
      else fueraPlazo++;
    } else {
      totalVerificados++;
      if (diasDesdeApertura <= 40) enPlazo++;
      else fueraPlazo++;
    }
  }

  const cumplimientoGeneral = totalVerificados > 0
    ? Math.round((enPlazo / totalVerificados) * 100)
    : 100;

  return {
    fecha: '2026-03-19',
    cumplimiento_general_pct: cumplimientoGeneral,
    alertas_activas: alertasActivas,
    expedientes_en_plazo: enPlazo,
    expedientes_fuera_plazo: fueraPlazo,
    desglose_alertas: {
      criticas: alertas.filter(a => a.severidad === 'critica').length,
      altas: alertas.filter(a => a.severidad === 'alta').length,
      medias: alertas.filter(a => a.severidad === 'media').length,
      bajas: alertas.filter(a => a.severidad === 'baja').length,
    },
    tendencia_mensual: [
      { mes: 'Enero 2026', cumplimiento_pct: 92, alertas: 4 },
      { mes: 'Febrero 2026', cumplimiento_pct: 88, alertas: 7 },
      { mes: 'Marzo 2026', cumplimiento_pct: cumplimientoGeneral, alertas: alertasActivas },
    ],
    proximas_obligaciones: [
      { fecha_limite: '2026-03-31', descripcion: 'Informe trimestral DGSFP Q1', estado: 'pendiente' },
      { fecha_limite: '2026-03-31', descripcion: 'Declaracion estadistico-contable', estado: 'pendiente' },
      { fecha_limite: '2026-04-15', descripcion: 'Revision politica RGPD', estado: 'planificado' },
      { fecha_limite: '2026-06-30', descripcion: 'Informe RSR Solvencia II', estado: 'planificado' },
    ],
  };
}

module.exports = {
  plazosLegales,
  checklistSiniestro,
  getAlertasActivas,
  getInformeRegulatorio,
  verificarDecision,
  getEstadisticas,
};
