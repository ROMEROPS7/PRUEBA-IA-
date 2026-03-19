/**
 * Agente Autonomo Financiero
 * Gestion integral de finanzas: balance, PyL, cashflow, presupuestos, impuestos, inversiones
 */

/**
 * Balance de situacion - Activo y Pasivo
 */
function getBalance() {
  const activo = {
    activo_no_corriente: {
      inmovilizado_material: { descripcion: 'Oficinas, mobiliario, equipos informaticos', valor: 1200000 },
      inmovilizado_intangible: { descripcion: 'Software, licencias, marca', valor: 350000 },
      inversiones_financieras_lp: { descripcion: 'Bonos del estado, depositos a largo plazo', valor: 800000 },
      total: 2350000,
    },
    activo_corriente: {
      tesoreria: { descripcion: 'Cuentas corrientes y caja', valor: 620000 },
      deudores_comerciales: { descripcion: 'Primas pendientes de cobro', valor: 485000 },
      inversiones_financieras_cp: { descripcion: 'Depositos a corto plazo, fondos monetarios', valor: 950000 },
      otros_activos_corrientes: { descripcion: 'Anticipos, periodificaciones', valor: 78000 },
      total: 2133000,
    },
    provisiones_tecnicas_activo: {
      reaseguro_cedido: { descripcion: 'Participacion reaseguradoras en provisiones', valor: 520000 },
      total: 520000,
    },
    total_activo: 5003000,
  };

  const pasivo = {
    patrimonio_neto: {
      capital_social: { descripcion: 'Capital social desembolsado', valor: 1500000 },
      reservas: { descripcion: 'Reservas legales y voluntarias', valor: 850000 },
      resultado_ejercicio: { descripcion: 'Beneficio neto acumulado 2026', valor: 195000 },
      total: 2545000,
    },
    pasivo_no_corriente: {
      provisiones_tecnicas: { descripcion: 'Provision para siniestros pendientes', valor: 1180000 },
      deudas_largo_plazo: { descripcion: 'Prestamo hipotecario oficinas', valor: 320000 },
      total: 1500000,
    },
    pasivo_corriente: {
      acreedores_comerciales: { descripcion: 'Proveedores, comisiones pendientes', valor: 285000 },
      deudas_con_hacienda: { descripcion: 'IVA, IRPF, IS pendientes', valor: 148000 },
      remuneraciones_pendientes: { descripcion: 'Nominas y SS pendientes', valor: 95000 },
      otros_pasivos_corrientes: { descripcion: 'Primas no consumidas, periodificaciones', valor: 430000 },
      total: 958000,
    },
    total_pasivo: 5003000,
  };

  return {
    fecha: new Date().toISOString().split('T')[0],
    divisa: 'EUR',
    activo,
    pasivo,
    cuadre: activo.total_activo === pasivo.total_pasivo,
    ratios: {
      ratio_solvencia: Math.round((activo.total_activo / (pasivo.pasivo_no_corriente.total + pasivo.pasivo_corriente.total)) * 100) / 100,
      ratio_liquidez: Math.round((activo.activo_corriente.total / pasivo.pasivo_corriente.total) * 100) / 100,
      ratio_endeudamiento: Math.round(((pasivo.pasivo_no_corriente.total + pasivo.pasivo_corriente.total) / pasivo.total_pasivo) * 100) / 100,
      fondo_maniobra: activo.activo_corriente.total - pasivo.pasivo_corriente.total,
    },
  };
}

/**
 * Cuenta de Perdidas y Ganancias
 */
function getPyL() {
  const ingresos = {
    primas_emitidas: { descripcion: 'Primas brutas de seguros emitidas', importe: 3850000 },
    primas_cedidas_reaseguro: { descripcion: 'Primas cedidas a reaseguradoras', importe: -420000 },
    primas_netas: { importe: 3430000 },
    comisiones_intermediacion: { descripcion: 'Comisiones por distribucion de productos de terceros', importe: 185000 },
    rendimientos_inversiones: { descripcion: 'Intereses depositos, cupones bonos, dividendos', importe: 92000 },
    otros_ingresos: { descripcion: 'Servicios auxiliares, recobros', importe: 45000 },
    total_ingresos: 3752000,
  };

  const gastos = {
    siniestros_pagados: { descripcion: 'Indemnizaciones y gastos de siniestros', importe: 1920000 },
    variacion_provisiones: { descripcion: 'Incremento provisiones tecnicas', importe: 180000 },
    recuperaciones_reaseguro: { descripcion: 'Participacion reaseguro en siniestros', importe: -310000 },
    siniestralidad_neta: { importe: 1790000 },
    gastos_personal: { descripcion: 'Salarios, SS, formacion', importe: 720000 },
    gastos_operativos: { descripcion: 'Alquiler, suministros, mantenimiento', importe: 210000 },
    gastos_tecnologia: { descripcion: 'Infraestructura IT, licencias, desarrollo', importe: 145000 },
    gastos_marketing: { descripcion: 'Publicidad, eventos, patrocinios', importe: 95000 },
    comisiones_agentes: { descripcion: 'Comisiones a mediadores y agentes', importe: 165000 },
    amortizaciones: { descripcion: 'Amortizacion inmovilizado', importe: 68000 },
    gastos_financieros: { descripcion: 'Intereses prestamo, comisiones bancarias', importe: 18000 },
    otros_gastos: { descripcion: 'Auditoria, asesoria, varios', importe: 42000 },
    total_gastos: 3253000,
  };

  const beneficio_antes_impuestos = ingresos.total_ingresos - gastos.total_gastos;
  const impuesto_sociedades = Math.round(beneficio_antes_impuestos * 0.25);
  const beneficio_neto = beneficio_antes_impuestos - impuesto_sociedades;

  return {
    periodo: 'Enero - Diciembre 2026 (prevision)',
    divisa: 'EUR',
    ingresos,
    gastos,
    beneficio_antes_impuestos,
    impuesto_sociedades,
    beneficio_neto,
    margen_neto: `${Math.round((beneficio_neto / ingresos.total_ingresos) * 10000) / 100}%`,
    ratio_siniestralidad: `${Math.round((gastos.siniestralidad_neta.importe / ingresos.primas_netas.importe) * 10000) / 100}%`,
    ratio_gastos: `${Math.round(((gastos.total_gastos - gastos.siniestralidad_neta.importe) / ingresos.primas_netas.importe) * 10000) / 100}%`,
    ratio_combinado: `${Math.round(((gastos.total_gastos) / ingresos.primas_netas.importe) * 10000) / 100}%`,
  };
}

/**
 * Proyeccion de cashflow a 90 dias con granularidad diaria
 */
function getCashflow() {
  const hoy = new Date();
  const saldoInicial = 620000;
  const dias = [];
  let saldoAcumulado = saldoInicial;

  for (let i = 0; i < 90; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    const diaSemana = fecha.getDay();
    const diaMes = fecha.getDate();

    // No hay movimientos en fin de semana
    if (diaSemana === 0 || diaSemana === 6) {
      dias.push({
        fecha: fecha.toISOString().split('T')[0],
        dia_semana: ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'][diaSemana],
        ingresos: 0,
        gastos: 0,
        neto: 0,
        saldo_acumulado: Math.round(saldoAcumulado * 100) / 100,
        notas: 'Fin de semana',
      });
      continue;
    }

    // Ingresos: primas diarias (media ~14k/dia laborable, con variaciones)
    const variacionIngreso = 0.7 + Math.sin(i * 0.3) * 0.3 + (diaMes <= 5 ? 0.4 : 0); // Mas cobros a principio de mes
    const ingresos = Math.round(14000 * variacionIngreso);

    // Gastos
    let gastos = 0;
    let notas = [];

    // Gastos diarios operativos (~3k/dia)
    gastos += 3000 + Math.round(Math.sin(i * 0.5) * 500);

    // Siniestros (pagos irregulares, ~7k/dia media)
    const pagoSiniestro = Math.round(7000 * (0.5 + Math.abs(Math.sin(i * 0.7)) * 1.0));
    gastos += pagoSiniestro;
    if (pagoSiniestro > 10000) notas.push('Pago siniestro importante');

    // Nominas: dia 28 de cada mes o ultimo dia laborable
    if (diaMes >= 27 && diaMes <= 30) {
      gastos += 52000; // Nominas (~52k/mes neto total)
      notas.push('Pago de nominas');
    }

    // SS empresa: dia 30
    if (diaMes === 30 || (diaMes >= 28 && i > 25)) {
      if (!notas.includes('Pago Seguridad Social')) {
        gastos += 18000;
        notas.push('Pago Seguridad Social');
      }
    }

    // IVA trimestral: dia 20 de meses 1,4,7,10
    const mes = fecha.getMonth() + 1;
    if (diaMes === 20 && [1,4,7,10].includes(mes)) {
      gastos += 35000;
      notas.push('Liquidacion IVA trimestral');
    }

    // IRPF: dia 20 de cada mes
    if (diaMes === 20) {
      gastos += 12000;
      notas.push('Liquidacion IRPF retenciones');
    }

    // Proveedores: dia 10 y 25
    if (diaMes === 10 || diaMes === 25) {
      gastos += 8500;
      notas.push('Pago a proveedores');
    }

    const neto = ingresos - gastos;
    saldoAcumulado += neto;

    dias.push({
      fecha: fecha.toISOString().split('T')[0],
      dia_semana: ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'][diaSemana],
      ingresos,
      gastos,
      neto,
      saldo_acumulado: Math.round(saldoAcumulado * 100) / 100,
      notas: notas.length > 0 ? notas.join('; ') : null,
    });
  }

  const totalIngresos = dias.reduce((s, d) => s + d.ingresos, 0);
  const totalGastos = dias.reduce((s, d) => s + d.gastos, 0);
  const saldoMinimo = Math.min(...dias.map(d => d.saldo_acumulado));
  const diaMinimo = dias.find(d => d.saldo_acumulado === saldoMinimo);

  return {
    periodo: `${dias[0].fecha} a ${dias[dias.length - 1].fecha}`,
    saldo_inicial: saldoInicial,
    saldo_final: Math.round(saldoAcumulado * 100) / 100,
    total_ingresos: totalIngresos,
    total_gastos: totalGastos,
    flujo_neto: totalIngresos - totalGastos,
    saldo_minimo: { fecha: diaMinimo ? diaMinimo.fecha : null, importe: saldoMinimo },
    alerta_liquidez: saldoMinimo < 100000,
    proyeccion_diaria: dias,
    resumen_semanal: generarResumenSemanal(dias),
  };
}

function generarResumenSemanal(dias) {
  const semanas = [];
  for (let i = 0; i < dias.length; i += 7) {
    const semana = dias.slice(i, i + 7);
    semanas.push({
      semana: semanas.length + 1,
      desde: semana[0].fecha,
      hasta: semana[semana.length - 1].fecha,
      ingresos: semana.reduce((s, d) => s + d.ingresos, 0),
      gastos: semana.reduce((s, d) => s + d.gastos, 0),
      neto: semana.reduce((s, d) => s + d.neto, 0),
      saldo_cierre: semana[semana.length - 1].saldo_acumulado,
    });
  }
  return semanas;
}

/**
 * Presupuestos por departamento
 */
function getPresupuesto() {
  const departamentos = [
    { departamento: 'Siniestros', presupuesto: 2200000, real: 1920000, partidas: [
      { concepto: 'Indemnizaciones', presupuesto: 1800000, real: 1620000 },
      { concepto: 'Peritos externos', presupuesto: 250000, real: 195000 },
      { concepto: 'Gastos tramitacion', presupuesto: 150000, real: 105000 },
    ]},
    { departamento: 'Tecnologia', presupuesto: 280000, real: 265000, partidas: [
      { concepto: 'Infraestructura cloud', presupuesto: 96000, real: 102000 },
      { concepto: 'Licencias software', presupuesto: 64000, real: 58000 },
      { concepto: 'Desarrollo proyectos', presupuesto: 80000, real: 72000 },
      { concepto: 'Ciberseguridad', presupuesto: 40000, real: 33000 },
    ]},
    { departamento: 'Comercial', presupuesto: 310000, real: 295000, partidas: [
      { concepto: 'Comisiones agentes', presupuesto: 165000, real: 165000 },
      { concepto: 'Marketing digital', presupuesto: 55000, real: 48000 },
      { concepto: 'Eventos y ferias', presupuesto: 40000, real: 38000 },
      { concepto: 'Material comercial', presupuesto: 50000, real: 44000 },
    ]},
    { departamento: 'Legal', presupuesto: 180000, real: 172000, partidas: [
      { concepto: 'Abogados externos', presupuesto: 85000, real: 78000 },
      { concepto: 'Costas judiciales', presupuesto: 45000, real: 52000 },
      { concepto: 'Compliance y auditoria', presupuesto: 30000, real: 27000 },
      { concepto: 'Bases de datos juridicas', presupuesto: 20000, real: 15000 },
    ]},
    { departamento: 'Administracion', presupuesto: 250000, real: 238000, partidas: [
      { concepto: 'Alquiler oficinas', presupuesto: 108000, real: 108000 },
      { concepto: 'Suministros', presupuesto: 36000, real: 33000 },
      { concepto: 'Material oficina', presupuesto: 18000, real: 15000 },
      { concepto: 'Seguros y mantenimiento', presupuesto: 48000, real: 46000 },
      { concepto: 'Servicios profesionales', presupuesto: 40000, real: 36000 },
    ]},
    { departamento: 'RRHH / Personal', presupuesto: 780000, real: 720000, partidas: [
      { concepto: 'Salarios brutos', presupuesto: 540000, real: 510000 },
      { concepto: 'Seguridad Social empresa', presupuesto: 165000, real: 153000 },
      { concepto: 'Formacion', presupuesto: 35000, real: 28000 },
      { concepto: 'Beneficios sociales', presupuesto: 40000, real: 29000 },
    ]},
  ];

  const conDesviacion = departamentos.map(d => ({
    ...d,
    desviacion: d.real - d.presupuesto,
    desviacion_pct: `${Math.round(((d.real - d.presupuesto) / d.presupuesto) * 10000) / 100}%`,
    estado: d.real <= d.presupuesto ? 'Dentro de presupuesto' : 'Desviacion positiva',
    partidas: d.partidas.map(p => ({
      ...p,
      desviacion: p.real - p.presupuesto,
      desviacion_pct: `${Math.round(((p.real - p.presupuesto) / p.presupuesto) * 10000) / 100}%`,
    })),
  }));

  const totalPresupuesto = departamentos.reduce((s, d) => s + d.presupuesto, 0);
  const totalReal = departamentos.reduce((s, d) => s + d.real, 0);

  return {
    ejercicio: 2026,
    periodo: 'Acumulado Enero - Marzo',
    departamentos: conDesviacion,
    resumen: {
      presupuesto_total: totalPresupuesto,
      gasto_real_total: totalReal,
      desviacion_total: totalReal - totalPresupuesto,
      desviacion_pct: `${Math.round(((totalReal - totalPresupuesto) / totalPresupuesto) * 10000) / 100}%`,
      departamentos_desviados: conDesviacion.filter(d => d.real > d.presupuesto).map(d => d.departamento),
    },
  };
}

/**
 * Obligaciones fiscales proximas
 */
function getImpuestos() {
  return {
    proximas_obligaciones: [
      {
        impuesto: 'IRPF - Retenciones trabajadores',
        modelo: 'Modelo 111',
        periodicidad: 'Mensual',
        periodo_liquidacion: 'Marzo 2026',
        fecha_limite: '2026-04-20',
        importe_estimado: 12450,
        estado: 'Pendiente de presentar',
        dias_restantes: Math.max(0, Math.ceil((new Date('2026-04-20') - new Date()) / (1000 * 60 * 60 * 24))),
      },
      {
        impuesto: 'IVA Trimestral',
        modelo: 'Modelo 303',
        periodicidad: 'Trimestral',
        periodo_liquidacion: 'Q1 2026 (Enero-Marzo)',
        fecha_limite: '2026-04-20',
        importe_estimado: 38200,
        estado: 'En preparacion',
        dias_restantes: Math.max(0, Math.ceil((new Date('2026-04-20') - new Date()) / (1000 * 60 * 60 * 24))),
        detalle: { iva_repercutido: 52800, iva_soportado: 14600, diferencia: 38200 },
      },
      {
        impuesto: 'Pago fraccionado Impuesto de Sociedades',
        modelo: 'Modelo 202',
        periodicidad: 'Trimestral',
        periodo_liquidacion: 'Q1 2026',
        fecha_limite: '2026-04-20',
        importe_estimado: 31200,
        estado: 'Pendiente de calculo',
        dias_restantes: Math.max(0, Math.ceil((new Date('2026-04-20') - new Date()) / (1000 * 60 * 60 * 24))),
      },
      {
        impuesto: 'Impuesto de Sociedades - Declaracion Anual',
        modelo: 'Modelo 200',
        periodicidad: 'Anual',
        periodo_liquidacion: 'Ejercicio 2025',
        fecha_limite: '2026-07-25',
        importe_estimado: 124750,
        estado: 'Pendiente - en auditoria',
        dias_restantes: Math.max(0, Math.ceil((new Date('2026-07-25') - new Date()) / (1000 * 60 * 60 * 24))),
      },
      {
        impuesto: 'Resumen anual IVA',
        modelo: 'Modelo 390',
        periodicidad: 'Anual',
        periodo_liquidacion: 'Ejercicio 2025',
        fecha_limite: '2026-01-30',
        importe_estimado: 0,
        estado: 'Presentado',
        dias_restantes: 0,
      },
      {
        impuesto: 'Impuesto sobre Primas de Seguros',
        modelo: 'Modelo 430',
        periodicidad: 'Mensual',
        periodo_liquidacion: 'Febrero 2026',
        fecha_limite: '2026-03-20',
        importe_estimado: 24500,
        estado: 'Presentado y pagado',
        dias_restantes: 0,
      },
    ],
    resumen: {
      total_pendiente: 12450 + 38200 + 31200 + 124750,
      proxima_fecha_critica: '2026-04-20',
      obligaciones_pendientes: 4,
      obligaciones_presentadas: 2,
    },
    calendario_fiscal_anual: [
      { mes: 'Enero', obligaciones: ['Modelo 390 (IVA anual)', 'Modelo 190 (IRPF anual)'] },
      { mes: 'Abril', obligaciones: ['Modelo 303 (IVA Q1)', 'Modelo 111 (IRPF marzo)', 'Modelo 202 (IS Q1)'] },
      { mes: 'Julio', obligaciones: ['Modelo 303 (IVA Q2)', 'Modelo 200 (IS anual)', 'Modelo 202 (IS Q2)'] },
      { mes: 'Octubre', obligaciones: ['Modelo 303 (IVA Q3)', 'Modelo 202 (IS Q3)'] },
      { mes: 'Mensual', obligaciones: ['Modelo 111 (IRPF retenciones)', 'Modelo 430 (Primas seguros)'] },
    ],
  };
}

/**
 * Cartera de inversiones del fondo de reservas
 */
function getInversiones() {
  const inversiones = [
    { id: 1, tipo: 'Deposito a plazo', entidad: 'CaixaBank', importe: 300000, tae: 3.10, vencimiento: '2026-09-15', estado: 'Vigente', rendimiento_acumulado: 4650 },
    { id: 2, tipo: 'Deposito a plazo', entidad: 'Santander', importe: 250000, tae: 2.85, vencimiento: '2026-12-01', estado: 'Vigente', rendimiento_acumulado: 2968 },
    { id: 3, tipo: 'Bonos del Estado', entidad: 'Tesoro Publico', importe: 400000, tae: 3.45, vencimiento: '2028-06-30', estado: 'Vigente', rendimiento_acumulado: 11500 },
    { id: 4, tipo: 'Bonos del Estado', entidad: 'Tesoro Publico', importe: 200000, tae: 3.20, vencimiento: '2027-03-15', estado: 'Vigente', rendimiento_acumulado: 6400 },
    { id: 5, tipo: 'Fondo monetario', entidad: 'BBVA Asset Management', importe: 350000, tae: 2.95, vencimiento: null, estado: 'Disponible', rendimiento_acumulado: 3412 },
    { id: 6, tipo: 'Fondo renta fija', entidad: 'Bankinter Gestion', importe: 150000, tae: 4.10, vencimiento: null, estado: 'Disponible', rendimiento_acumulado: 2050 },
    { id: 7, tipo: 'Letras del Tesoro', entidad: 'Tesoro Publico', importe: 100000, tae: 3.05, vencimiento: '2026-06-20', estado: 'Vigente', rendimiento_acumulado: 1525 },
  ];

  const totalInvertido = inversiones.reduce((s, i) => s + i.importe, 0);
  const totalRendimiento = inversiones.reduce((s, i) => s + i.rendimiento_acumulado, 0);
  const taeMedia = Math.round((inversiones.reduce((s, i) => s + i.tae * i.importe, 0) / totalInvertido) * 100) / 100;

  const porTipo = {};
  inversiones.forEach(inv => {
    if (!porTipo[inv.tipo]) porTipo[inv.tipo] = { importe: 0, count: 0 };
    porTipo[inv.tipo].importe += inv.importe;
    porTipo[inv.tipo].count++;
  });

  return {
    cartera: inversiones,
    resumen: {
      total_invertido: totalInvertido,
      rendimiento_acumulado: totalRendimiento,
      tae_media_ponderada: taeMedia,
      numero_posiciones: inversiones.length,
      disponible_inmediato: inversiones.filter(i => i.estado === 'Disponible').reduce((s, i) => s + i.importe, 0),
    },
    distribucion_por_tipo: Object.entries(porTipo).map(([tipo, data]) => ({
      tipo,
      importe: data.importe,
      porcentaje: `${Math.round((data.importe / totalInvertido) * 10000) / 100}%`,
      posiciones: data.count,
    })),
    proximos_vencimientos: inversiones
      .filter(i => i.vencimiento)
      .sort((a, b) => new Date(a.vencimiento) - new Date(b.vencimiento))
      .map(i => ({ tipo: i.tipo, entidad: i.entidad, importe: i.importe, vencimiento: i.vencimiento })),
    politica_inversion: 'Conservadora - Maximo 60% renta fija publica, maximo 30% depositos, maximo 10% fondos. Sin renta variable.',
  };
}

/**
 * Simula proceso de cierre contable mensual
 */
function cierreContable(mes) {
  const mesNum = mes || new Date().getMonth() + 1;
  const mesNombre = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][mesNum - 1];

  const pasos = [
    { paso: 1, nombre: 'Conciliacion bancaria', estado: 'completado', detalle: 'Saldo bancario conciliado con contabilidad. Diferencia: 0.00 EUR', tiempo_min: 45 },
    { paso: 2, nombre: 'Revision facturas pendientes', estado: 'completado', detalle: '3 facturas pendientes de registro por importe total de 4.250 EUR', tiempo_min: 30 },
    { paso: 3, nombre: 'Calculo amortizaciones', estado: 'completado', detalle: 'Amortizacion mensual registrada: 5.666,67 EUR', tiempo_min: 15 },
    { paso: 4, nombre: 'Provision siniestros', estado: 'completado', detalle: 'Provision actualizada segun informe actuarial. Variacion: +12.500 EUR', tiempo_min: 60 },
    { paso: 5, nombre: 'Periodificacion ingresos', estado: 'completado', detalle: 'Primas periodificadas correctamente. Primas no consumidas: 430.000 EUR', tiempo_min: 40 },
    { paso: 6, nombre: 'Registro nominas', estado: 'completado', detalle: 'Nominas del mes registradas. Coste total empresa: 62.340 EUR', tiempo_min: 20 },
    { paso: 7, nombre: 'Calculo impuestos', estado: 'completado', detalle: 'IRPF retenciones: 12.450 EUR, IPS: 24.500 EUR', tiempo_min: 25 },
    { paso: 8, nombre: 'Revision cuentas intercompanias', estado: 'completado', detalle: 'Sin saldos intercompanias pendientes', tiempo_min: 10 },
    { paso: 9, nombre: 'Generacion balance de comprobacion', estado: 'completado', detalle: 'Balance cuadrado. Total debe = Total haber', tiempo_min: 15 },
    { paso: 10, nombre: 'Revision y aprobacion', estado: 'completado', detalle: 'Aprobado por Directora Financiera - Elena Gil Martin', tiempo_min: 30 },
  ];

  return {
    mes: mesNombre,
    anyo: 2026,
    fecha_cierre: `2026-${String(mesNum).padStart(2, '0')}-28`,
    estado: 'Completado',
    pasos,
    tiempo_total_minutos: pasos.reduce((s, p) => s + p.tiempo_min, 0),
    resultado: {
      ingresos_mes: 312600,
      gastos_mes: 271100,
      resultado_mes: 41500,
      resultado_acumulado: 41500 * mesNum,
    },
    responsable: 'Elena Gil Martin - Directora Financiera',
    observaciones: 'Cierre realizado sin incidencias significativas. Pendiente revision de 3 facturas menores.',
  };
}

/**
 * Semaforo de salud financiera
 */
function getSaludFinanciera() {
  const balance = getBalance();

  const indicadores = [
    {
      indicador: 'Solvencia',
      valor: balance.ratios.ratio_solvencia,
      umbral_verde: 1.5,
      umbral_amarillo: 1.2,
      semaforo: balance.ratios.ratio_solvencia >= 1.5 ? 'verde' : balance.ratios.ratio_solvencia >= 1.2 ? 'amarillo' : 'rojo',
      descripcion: 'Capacidad de cubrir todas las deudas con activos',
      detalle: `Ratio ${balance.ratios.ratio_solvencia}. La empresa tiene activos suficientes para cubrir ${Math.round(balance.ratios.ratio_solvencia * 100) / 100}x sus deudas totales.`,
    },
    {
      indicador: 'Liquidez',
      valor: balance.ratios.ratio_liquidez,
      umbral_verde: 1.5,
      umbral_amarillo: 1.0,
      semaforo: balance.ratios.ratio_liquidez >= 1.5 ? 'verde' : balance.ratios.ratio_liquidez >= 1.0 ? 'amarillo' : 'rojo',
      descripcion: 'Capacidad de pago a corto plazo',
      detalle: `Ratio ${balance.ratios.ratio_liquidez}. Fondo de maniobra positivo de ${balance.ratios.fondo_maniobra} EUR.`,
    },
    {
      indicador: 'Rentabilidad',
      valor: 13.3,
      umbral_verde: 10,
      umbral_amarillo: 5,
      semaforo: 'verde',
      descripcion: 'Margen neto sobre ingresos',
      detalle: 'Beneficio neto del 13.3% sobre ingresos totales. Por encima de la media del sector (10%).',
    },
    {
      indicador: 'Morosidad',
      valor: 3.2,
      umbral_verde: 5,
      umbral_amarillo: 8,
      semaforo: 'verde',
      descripcion: 'Porcentaje de primas impagadas sobre emitidas',
      detalle: 'Tasa de morosidad del 3.2%. Dentro de parametros normales. 485.000 EUR en deudores comerciales.',
    },
    {
      indicador: 'Ratio Combinado',
      valor: 94.8,
      umbral_verde: 95,
      umbral_amarillo: 100,
      semaforo: 'verde',
      descripcion: 'Siniestralidad + gastos sobre primas (debe ser < 100)',
      detalle: 'Ratio combinado del 94.8%. La actividad aseguradora es rentable por si misma.',
    },
    {
      indicador: 'Cobertura Provisiones',
      valor: 115,
      umbral_verde: 100,
      umbral_amarillo: 90,
      semaforo: 'verde',
      descripcion: 'Provisiones tecnicas vs siniestros esperados',
      detalle: 'Provisiones tecnicas cubren el 115% de los siniestros esperados. Margen de seguridad adecuado.',
    },
  ];

  const semaforos = indicadores.reduce((acc, i) => { acc[i.semaforo] = (acc[i.semaforo] || 0) + 1; return acc; }, {});

  return {
    fecha_analisis: new Date().toISOString().split('T')[0],
    salud_global: semaforos.rojo > 0 ? 'rojo' : semaforos.amarillo > 1 ? 'amarillo' : 'verde',
    resumen: semaforos.rojo > 0
      ? 'Situacion financiera con alertas criticas que requieren atencion inmediata.'
      : semaforos.amarillo > 0
        ? 'Situacion financiera estable con algunos indicadores a vigilar.'
        : 'Situacion financiera saludable. Todos los indicadores en parametros optimos.',
    indicadores,
    distribucion_semaforos: semaforos,
    recomendaciones: [
      'Mantener politica conservadora de inversiones dado el entorno de tipos',
      'Vigilar evolucion de la siniestralidad en Q2, historicamente sube en verano',
      'Considerar amortizacion parcial del prestamo hipotecario para reducir gastos financieros',
    ],
  };
}

/**
 * Estadisticas financieras resumen
 */
function getEstadisticas() {
  const pyl = getPyL();
  const balance = getBalance();
  const mesActual = new Date().getMonth() + 1;

  // Prorratear al mes actual
  const ingresosMes = Math.round(pyl.ingresos.total_ingresos / 12);
  const gastosMes = Math.round(pyl.gastos.total_gastos / 12);

  return {
    ingresos_mes: ingresosMes,
    gastos_mes: gastosMes,
    beneficio_mes: ingresosMes - gastosMes,
    ingresos_acumulado: ingresosMes * mesActual,
    gastos_acumulado: gastosMes * mesActual,
    beneficio_acumulado: (ingresosMes - gastosMes) * mesActual,
    ratio_siniestralidad: pyl.ratio_siniestralidad,
    ratio_gastos: pyl.ratio_gastos,
    ratio_combinado: pyl.ratio_combinado,
    margen_neto: pyl.margen_neto,
    tesoreria: balance.activo.activo_corriente.tesoreria.valor,
    ratio_liquidez: balance.ratios.ratio_liquidez,
    ratio_solvencia: balance.ratios.ratio_solvencia,
    fondo_maniobra: balance.ratios.fondo_maniobra,
    total_activo: balance.activo.total_activo,
    total_pasivo: balance.pasivo.total_pasivo,
    patrimonio_neto: balance.pasivo.patrimonio_neto.total,
  };
}

module.exports = {
  getBalance,
  getPyL,
  getCashflow,
  getPresupuesto,
  getImpuestos,
  getInversiones,
  cierreContable,
  getSaludFinanciera,
  getEstadisticas,
};
