// =============================================================================
// Servicio de Metricas SaaS para el Panel del Product Owner
// =============================================================================

// ---------------------------------------------------------------------------
// 12 clientes aseguradores con metricas realistas (MRR total ~284K EUR)
// ---------------------------------------------------------------------------
const clientes = [
  { id: 'CLI-001', nombre: 'Seguros Madrid Capital S.A.', plan: 'enterprise', mrr: 45000, siniestros_mes: 1240, agentes_activos: 85, uso_pct: 92, fecha_alta: new Date('2024-03-15'), renovacion: new Date('2027-03-15'), tickets_soporte: 3, crecimiento_pct: 12.5 },
  { id: 'CLI-002', nombre: 'Mutual Catalana de Seguros', plan: 'enterprise', mrr: 38000, siniestros_mes: 980, agentes_activos: 62, uso_pct: 88, fecha_alta: new Date('2024-06-01'), renovacion: new Date('2027-06-01'), tickets_soporte: 5, crecimiento_pct: 8.3 },
  { id: 'CLI-003', nombre: 'Aseguradora del Norte', plan: 'professional', mrr: 28000, siniestros_mes: 720, agentes_activos: 45, uso_pct: 76, fecha_alta: new Date('2024-09-10'), renovacion: new Date('2026-09-10'), tickets_soporte: 8, crecimiento_pct: 15.2 },
  { id: 'CLI-004', nombre: 'Seguros Levante Mediterraneo', plan: 'professional', mrr: 25000, siniestros_mes: 650, agentes_activos: 38, uso_pct: 82, fecha_alta: new Date('2025-01-20'), renovacion: new Date('2027-01-20'), tickets_soporte: 2, crecimiento_pct: 22.1 },
  { id: 'CLI-005', nombre: 'Proteccion Andaluza S.L.', plan: 'professional', mrr: 22000, siniestros_mes: 580, agentes_activos: 34, uso_pct: 71, fecha_alta: new Date('2025-03-05'), renovacion: new Date('2027-03-05'), tickets_soporte: 6, crecimiento_pct: 5.8 },
  { id: 'CLI-006', nombre: 'Covadonga Seguros', plan: 'starter', mrr: 18000, siniestros_mes: 420, agentes_activos: 28, uso_pct: 65, fecha_alta: new Date('2025-04-12'), renovacion: new Date('2026-04-12'), tickets_soporte: 12, crecimiento_pct: -2.3 },
  { id: 'CLI-007', nombre: 'Seguros Baleares Plus', plan: 'professional', mrr: 24000, siniestros_mes: 510, agentes_activos: 30, uso_pct: 85, fecha_alta: new Date('2025-05-18'), renovacion: new Date('2027-05-18'), tickets_soporte: 1, crecimiento_pct: 18.7 },
  { id: 'CLI-008', nombre: 'InsurTech Galicia', plan: 'starter', mrr: 15000, siniestros_mes: 340, agentes_activos: 22, uso_pct: 45, fecha_alta: new Date('2025-07-01'), renovacion: new Date('2026-07-01'), tickets_soporte: 15, crecimiento_pct: -5.1 },
  { id: 'CLI-009', nombre: 'Mutua Castellana', plan: 'enterprise', mrr: 35000, siniestros_mes: 890, agentes_activos: 55, uso_pct: 91, fecha_alta: new Date('2025-08-22'), renovacion: new Date('2026-08-22'), tickets_soporte: 4, crecimiento_pct: 10.4 },
  { id: 'CLI-010', nombre: 'Seguros Express Canarias', plan: 'starter', mrr: 12000, siniestros_mes: 280, agentes_activos: 18, uso_pct: 38, fecha_alta: new Date('2025-10-15'), renovacion: new Date('2026-10-15'), tickets_soporte: 20, crecimiento_pct: -8.2 },
  { id: 'CLI-011', nombre: 'AgroSeguro Extremadura', plan: 'starter', mrr: 10000, siniestros_mes: 190, agentes_activos: 12, uso_pct: 55, fecha_alta: new Date('2025-12-01'), renovacion: new Date('2026-12-01'), tickets_soporte: 7, crecimiento_pct: 3.1 },
  { id: 'CLI-012', nombre: 'Previsora Vasca de Seguros', plan: 'professional', mrr: 12000, siniestros_mes: 310, agentes_activos: 20, uso_pct: 68, fecha_alta: new Date('2026-01-10'), renovacion: new Date('2027-01-10'), tickets_soporte: 9, crecimiento_pct: 0.0 }
];

// Historial de facturacion (ultimos 6 meses)
const historialFacturacion = [
  { mes: '2025-10', mrr: 248000, clientes_activos: 10, nuevos: 1, bajas: 0, ingresos_extra: 12000, total: 260000 },
  { mes: '2025-11', mrr: 255000, clientes_activos: 10, nuevos: 0, bajas: 0, ingresos_extra: 8500, total: 263500 },
  { mes: '2025-12', mrr: 262000, clientes_activos: 11, nuevos: 1, bajas: 0, ingresos_extra: 15000, total: 277000 },
  { mes: '2026-01', mrr: 274000, clientes_activos: 12, nuevos: 1, bajas: 0, ingresos_extra: 9200, total: 283200 },
  { mes: '2026-02', mrr: 280000, clientes_activos: 12, nuevos: 0, bajas: 0, ingresos_extra: 11000, total: 291000 },
  { mes: '2026-03', mrr: 284000, clientes_activos: 12, nuevos: 0, bajas: 0, ingresos_extra: 7800, total: 291800 }
];

// ---------------------------------------------------------------------------
// getMRR - MRR total con desglose
// ---------------------------------------------------------------------------
function getMRR() {
  const mrrTotal = clientes.reduce((sum, c) => sum + c.mrr, 0);
  const porPlan = {};

  clientes.forEach(c => {
    if (!porPlan[c.plan]) {
      porPlan[c.plan] = { clientes: 0, mrr: 0 };
    }
    porPlan[c.plan].clientes++;
    porPlan[c.plan].mrr += c.mrr;
  });

  const arr = mrrTotal * 12;

  // Calcular variacion respecto al mes anterior
  const mrrAnterior = historialFacturacion.length >= 2
    ? historialFacturacion[historialFacturacion.length - 2].mrr
    : mrrTotal;
  const variacionPct = Math.round((mrrTotal - mrrAnterior) / mrrAnterior * 100 * 10) / 10;

  return {
    ok: true,
    mrr_total: mrrTotal,
    arr: arr,
    variacion_mensual_pct: variacionPct,
    desglose_por_plan: porPlan,
    ticket_medio: Math.round(mrrTotal / clientes.length),
    clientes_totales: clientes.length,
    top_5_clientes: clientes
      .sort((a, b) => b.mrr - a.mrr)
      .slice(0, 5)
      .map(c => ({ nombre: c.nombre, plan: c.plan, mrr: c.mrr }))
  };
}

// ---------------------------------------------------------------------------
// getUsoPorCliente - Metricas de uso por cliente
// ---------------------------------------------------------------------------
function getUsoPorCliente() {
  const metricas = clientes.map(c => {
    let nivel_uso = 'alto';
    if (c.uso_pct < 50) nivel_uso = 'bajo';
    else if (c.uso_pct < 75) nivel_uso = 'medio';

    const coste_por_siniestro = c.siniestros_mes > 0
      ? Math.round(c.mrr / c.siniestros_mes * 100) / 100
      : 0;

    return {
      id: c.id,
      nombre: c.nombre,
      plan: c.plan,
      agentes_activos: c.agentes_activos,
      siniestros_mes: c.siniestros_mes,
      uso_pct: c.uso_pct,
      nivel_uso,
      coste_por_siniestro,
      crecimiento_pct: c.crecimiento_pct,
      tickets_soporte: c.tickets_soporte
    };
  });

  const usoMedio = Math.round(clientes.reduce((sum, c) => sum + c.uso_pct, 0) / clientes.length);
  const agentesTotales = clientes.reduce((sum, c) => sum + c.agentes_activos, 0);
  const siniestrosTotalesMes = clientes.reduce((sum, c) => sum + c.siniestros_mes, 0);

  return {
    ok: true,
    resumen: {
      uso_medio_pct: usoMedio,
      agentes_totales: agentesTotales,
      siniestros_totales_mes: siniestrosTotalesMes,
      clientes_uso_alto: metricas.filter(m => m.nivel_uso === 'alto').length,
      clientes_uso_medio: metricas.filter(m => m.nivel_uso === 'medio').length,
      clientes_uso_bajo: metricas.filter(m => m.nivel_uso === 'bajo').length
    },
    clientes: metricas
  };
}

// ---------------------------------------------------------------------------
// getAlertas - Alertas de negocio
// ---------------------------------------------------------------------------
function getAlertas() {
  const ahora = new Date();
  const alertas = [];

  clientes.forEach(c => {
    // Clientes con bajo uso (posible churn)
    if (c.uso_pct < 50) {
      alertas.push({
        tipo: 'bajo_uso',
        severidad: 'alta',
        cliente: c.nombre,
        clienteId: c.id,
        mensaje: `${c.nombre} tiene un uso del ${c.uso_pct}%. Riesgo de churn.`,
        metrica: c.uso_pct,
        accion_sugerida: 'Programar reunion de re-engagement con el customer success manager'
      });
    }

    // Renovacion proxima (menos de 90 dias)
    const diasParaRenovacion = Math.round((c.renovacion - ahora) / (1000 * 60 * 60 * 24));
    if (diasParaRenovacion > 0 && diasParaRenovacion <= 90) {
      alertas.push({
        tipo: 'renovacion_proxima',
        severidad: diasParaRenovacion <= 30 ? 'alta' : 'media',
        cliente: c.nombre,
        clienteId: c.id,
        mensaje: `Renovacion de ${c.nombre} en ${diasParaRenovacion} dias (${c.renovacion.toISOString().split('T')[0]})`,
        metrica: diasParaRenovacion,
        accion_sugerida: 'Iniciar conversacion de renovacion y preparar propuesta de upsell'
      });
    }

    // Crecimiento negativo
    if (c.crecimiento_pct < 0) {
      alertas.push({
        tipo: 'crecimiento_negativo',
        severidad: c.crecimiento_pct < -5 ? 'alta' : 'media',
        cliente: c.nombre,
        clienteId: c.id,
        mensaje: `${c.nombre} muestra decrecimiento del ${c.crecimiento_pct}%`,
        metrica: c.crecimiento_pct,
        accion_sugerida: 'Analizar causas y ofrecer sesion de optimizacion'
      });
    }

    // Oportunidades de crecimiento (uso alto + crecimiento positivo)
    if (c.uso_pct > 85 && c.crecimiento_pct > 10 && c.plan !== 'enterprise') {
      alertas.push({
        tipo: 'oportunidad_upsell',
        severidad: 'baja',
        cliente: c.nombre,
        clienteId: c.id,
        mensaje: `${c.nombre} esta al ${c.uso_pct}% de uso con crecimiento del ${c.crecimiento_pct}%. Candidato para upgrade a ${c.plan === 'starter' ? 'professional' : 'enterprise'}.`,
        metrica: c.crecimiento_pct,
        accion_sugerida: `Proponer upgrade de plan ${c.plan} a ${c.plan === 'starter' ? 'professional' : 'enterprise'}`
      });
    }

    // Muchos tickets de soporte
    if (c.tickets_soporte >= 10) {
      alertas.push({
        tipo: 'soporte_excesivo',
        severidad: c.tickets_soporte >= 15 ? 'alta' : 'media',
        cliente: c.nombre,
        clienteId: c.id,
        mensaje: `${c.nombre} tiene ${c.tickets_soporte} tickets de soporte abiertos este mes`,
        metrica: c.tickets_soporte,
        accion_sugerida: 'Revisar tickets y asignar cuenta a soporte dedicado'
      });
    }
  });

  // Ordenar por severidad
  const ordenSeveridad = { alta: 0, media: 1, baja: 2 };
  alertas.sort((a, b) => ordenSeveridad[a.severidad] - ordenSeveridad[b.severidad]);

  return {
    ok: true,
    total_alertas: alertas.length,
    por_severidad: {
      alta: alertas.filter(a => a.severidad === 'alta').length,
      media: alertas.filter(a => a.severidad === 'media').length,
      baja: alertas.filter(a => a.severidad === 'baja').length
    },
    alertas
  };
}

// ---------------------------------------------------------------------------
// getFacturacion - Historial de facturacion simulado
// ---------------------------------------------------------------------------
function getFacturacion() {
  const mrrActual = clientes.reduce((sum, c) => sum + c.mrr, 0);

  const facturacionPorCliente = clientes.map(c => {
    const mesesActivo = Math.max(1, Math.round((new Date() - c.fecha_alta) / (1000 * 60 * 60 * 24 * 30)));
    return {
      id: c.id,
      nombre: c.nombre,
      plan: c.plan,
      mrr: c.mrr,
      meses_activo: mesesActivo,
      facturado_total: c.mrr * mesesActivo,
      ltv_estimado: Math.round(c.mrr * 36 * (1 + c.crecimiento_pct / 100)), // LTV a 3 anos
      estado_pago: Math.random() > 0.1 ? 'al_dia' : 'retraso_pago'
    };
  });

  const totalFacturadoHistorico = historialFacturacion.reduce((sum, h) => sum + h.total, 0);

  return {
    ok: true,
    mrr_actual: mrrActual,
    arr_actual: mrrActual * 12,
    facturado_ultimos_6_meses: totalFacturadoHistorico,
    historial_mensual: historialFacturacion,
    facturacion_por_cliente: facturacionPorCliente,
    metricas: {
      ticket_medio_mensual: Math.round(mrrActual / clientes.length),
      ltv_medio: Math.round(facturacionPorCliente.reduce((sum, c) => sum + c.ltv_estimado, 0) / clientes.length),
      clientes_al_dia: facturacionPorCliente.filter(c => c.estado_pago === 'al_dia').length,
      clientes_retraso: facturacionPorCliente.filter(c => c.estado_pago === 'retraso_pago').length
    }
  };
}

// ---------------------------------------------------------------------------
// getProyeccion - Proyeccion de ingresos a 12 meses
// ---------------------------------------------------------------------------
function getProyeccion() {
  const mrrActual = clientes.reduce((sum, c) => sum + c.mrr, 0);
  const crecimientoMedioMensual = clientes.reduce((sum, c) => sum + c.crecimiento_pct, 0) / clientes.length / 12; // mensualizar

  const proyeccion = [];
  let mrrProyectado = mrrActual;
  const ahora = new Date();

  for (let i = 1; i <= 12; i++) {
    const mes = new Date(ahora.getFullYear(), ahora.getMonth() + i, 1);
    const mesStr = `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`;

    // Factores de crecimiento
    const crecimientoOrganico = mrrProyectado * (crecimientoMedioMensual / 100);
    const nuevosClientes = i % 3 === 0 ? 15000 : (i % 2 === 0 ? 8000 : 0); // Nuevos clientes cada 2-3 meses
    const churnEstimado = mrrProyectado * 0.005; // 0.5% churn mensual

    mrrProyectado = Math.round(mrrProyectado + crecimientoOrganico + nuevosClientes - churnEstimado);

    proyeccion.push({
      mes: mesStr,
      mrr_proyectado: mrrProyectado,
      arr_proyectado: mrrProyectado * 12,
      crecimiento_organico: Math.round(crecimientoOrganico),
      nuevos_clientes_mrr: nuevosClientes,
      churn_estimado: Math.round(churnEstimado),
      clientes_estimados: clientes.length + Math.floor(i / 2.5)
    });
  }

  const mrrFinal = proyeccion[proyeccion.length - 1].mrr_proyectado;
  const crecimientoTotal = Math.round((mrrFinal - mrrActual) / mrrActual * 100 * 10) / 10;

  return {
    ok: true,
    mrr_actual: mrrActual,
    mrr_proyectado_12m: mrrFinal,
    arr_proyectado_12m: mrrFinal * 12,
    crecimiento_proyectado_pct: crecimientoTotal,
    ingresos_acumulados_12m: proyeccion.reduce((sum, p) => sum + p.mrr_proyectado, 0),
    supuestos: {
      crecimiento_organico_medio_mensual_pct: Math.round(crecimientoMedioMensual * 100) / 100,
      churn_mensual_estimado_pct: 0.5,
      nuevos_clientes_por_trimestre: 1
    },
    proyeccion_mensual: proyeccion
  };
}

// ---------------------------------------------------------------------------
// getChurn - Analisis de riesgo de churn
// ---------------------------------------------------------------------------
function getChurn() {
  const analisis = clientes.map(c => {
    // Calcular puntuacion de riesgo (0-100, mayor = mas riesgo)
    let riesgo = 0;
    const factores = [];

    // Uso bajo = riesgo alto
    if (c.uso_pct < 40) {
      riesgo += 35;
      factores.push({ factor: 'Uso muy bajo', impacto: 35, detalle: `Solo ${c.uso_pct}% de uso` });
    } else if (c.uso_pct < 60) {
      riesgo += 20;
      factores.push({ factor: 'Uso bajo', impacto: 20, detalle: `${c.uso_pct}% de uso` });
    }

    // Crecimiento negativo
    if (c.crecimiento_pct < -5) {
      riesgo += 25;
      factores.push({ factor: 'Decrecimiento significativo', impacto: 25, detalle: `${c.crecimiento_pct}%` });
    } else if (c.crecimiento_pct < 0) {
      riesgo += 15;
      factores.push({ factor: 'Decrecimiento leve', impacto: 15, detalle: `${c.crecimiento_pct}%` });
    }

    // Muchos tickets de soporte (insatisfaccion)
    if (c.tickets_soporte >= 15) {
      riesgo += 20;
      factores.push({ factor: 'Alto volumen de soporte', impacto: 20, detalle: `${c.tickets_soporte} tickets` });
    } else if (c.tickets_soporte >= 8) {
      riesgo += 10;
      factores.push({ factor: 'Soporte frecuente', impacto: 10, detalle: `${c.tickets_soporte} tickets` });
    }

    // Renovacion cercana con malas metricas
    const diasRenovacion = Math.round((c.renovacion - new Date()) / (1000 * 60 * 60 * 24));
    if (diasRenovacion <= 90 && (c.uso_pct < 70 || c.crecimiento_pct < 0)) {
      riesgo += 20;
      factores.push({ factor: 'Renovacion proxima con metricas debiles', impacto: 20, detalle: `Renovacion en ${diasRenovacion} dias` });
    }

    let nivel = 'bajo';
    if (riesgo >= 50) nivel = 'critico';
    else if (riesgo >= 30) nivel = 'alto';
    else if (riesgo >= 15) nivel = 'medio';

    return {
      id: c.id,
      nombre: c.nombre,
      plan: c.plan,
      mrr: c.mrr,
      riesgo_pct: Math.min(riesgo, 100),
      nivel_riesgo: nivel,
      factores_riesgo: factores,
      dias_para_renovacion: diasRenovacion,
      acciones_recomendadas: generarAccionesChurn(nivel, c)
    };
  });

  // Ordenar por riesgo descendente
  analisis.sort((a, b) => b.riesgo_pct - a.riesgo_pct);

  const mrrEnRiesgo = analisis
    .filter(a => a.nivel_riesgo === 'critico' || a.nivel_riesgo === 'alto')
    .reduce((sum, a) => sum + a.mrr, 0);

  return {
    ok: true,
    resumen: {
      clientes_riesgo_critico: analisis.filter(a => a.nivel_riesgo === 'critico').length,
      clientes_riesgo_alto: analisis.filter(a => a.nivel_riesgo === 'alto').length,
      clientes_riesgo_medio: analisis.filter(a => a.nivel_riesgo === 'medio').length,
      clientes_riesgo_bajo: analisis.filter(a => a.nivel_riesgo === 'bajo').length,
      mrr_en_riesgo: mrrEnRiesgo,
      pct_mrr_en_riesgo: Math.round(mrrEnRiesgo / clientes.reduce((s, c) => s + c.mrr, 0) * 100 * 10) / 10,
      tasa_churn_estimada_mensual_pct: 0.5,
      tasa_churn_estimada_anual_pct: 5.8
    },
    analisis_por_cliente: analisis
  };
}

function generarAccionesChurn(nivel, cliente) {
  const acciones = [];

  if (nivel === 'critico') {
    acciones.push('Llamada urgente del CEO o VP de Customer Success');
    acciones.push('Ofrecer descuento de renovacion del 15-20%');
    acciones.push('Asignar customer success manager dedicado');
    acciones.push('Sesion de optimizacion gratuita');
  } else if (nivel === 'alto') {
    acciones.push('Reunion con el customer success manager');
    acciones.push('Revision de uso y propuesta de valor personalizada');
    if (cliente.tickets_soporte >= 10) {
      acciones.push('Escalar y resolver tickets pendientes prioritariamente');
    }
  } else if (nivel === 'medio') {
    acciones.push('Email de seguimiento con mejores practicas');
    acciones.push('Webinar personalizado de funcionalidades avanzadas');
  }

  return acciones;
}

module.exports = {
  getMRR,
  getUsoPorCliente,
  getAlertas,
  getFacturacion,
  getProyeccion,
  getChurn
};
