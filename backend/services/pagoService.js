// ============================================================
// Pago Service - SiniestrosAI
// Gestion de pagos: indemnizaciones, primas y proveedores
// ============================================================

let pagoCounter = 24;

const pagos = [
  // Indemnizaciones
  { id: 'PAG-001', tipo: 'indemnizacion', clienteId: 'CLI-001', siniestroId: 'SIN-2026-0312', importe: 3200.00, estado: 'completado', metodo: 'transferencia', iban: 'ES91 2100 0418 4502 0005 1332', referencia: 'IND-2026-0312-001', fecha: '2026-03-15T14:30:00Z', concepto: 'Indemnizacion por colision frontal - Seat Leon' },
  { id: 'PAG-002', tipo: 'indemnizacion', clienteId: 'CLI-002', siniestroId: 'SIN-2026-0298', importe: 1850.00, estado: 'completado', metodo: 'transferencia', iban: 'ES76 0049 1500 0512 3456 7890', referencia: 'IND-2026-0298-001', fecha: '2026-03-14T11:15:00Z', concepto: 'Indemnizacion por rotura tuberia cocina' },
  { id: 'PAG-003', tipo: 'indemnizacion', clienteId: 'CLI-004', siniestroId: 'SIN-2026-0340', importe: 4750.50, estado: 'completado', metodo: 'transferencia', iban: 'ES12 1234 5678 9012 3456 7890', referencia: 'IND-2026-0340-001', fecha: '2026-03-17T16:00:00Z', concepto: 'Indemnizacion accidente trafico - danos materiales' },
  { id: 'PAG-004', tipo: 'indemnizacion', clienteId: 'CLI-005', siniestroId: 'SIN-2026-0355', importe: 8900.00, estado: 'procesando', metodo: 'transferencia', iban: 'ES45 2038 1234 0600 0000 1234', referencia: 'IND-2026-0355-001', fecha: '2026-03-19T09:00:00Z', concepto: 'Indemnizacion por inundacion vivienda' },
  { id: 'PAG-005', tipo: 'indemnizacion', clienteId: 'CLI-009', siniestroId: 'SIN-2026-0378', importe: 1200.00, estado: 'pendiente', metodo: 'transferencia', iban: 'ES67 0075 0001 0506 0000 1234', referencia: 'IND-2026-0378-001', fecha: '2026-03-19T10:30:00Z', concepto: 'Indemnizacion tratamiento dental cubierto' },
  { id: 'PAG-006', tipo: 'indemnizacion', clienteId: 'CLI-010', siniestroId: 'SIN-2026-0390', importe: 18500.00, estado: 'pendiente', metodo: 'transferencia', iban: 'ES89 0182 0000 4100 0000 5678', referencia: 'IND-2026-0390-001', fecha: '2026-03-19T11:00:00Z', concepto: 'Indemnizacion robo vehiculo' },
  { id: 'PAG-007', tipo: 'indemnizacion', clienteId: 'CLI-003', siniestroId: 'SIN-2026-0401', importe: 650.00, estado: 'rechazado', metodo: 'transferencia', iban: 'ES00 0000 0000 0000 0000 0000', referencia: 'IND-2026-0401-001', fecha: '2026-03-18T13:45:00Z', concepto: 'Indemnizacion danos menores - IBAN invalido' },

  // Primas (cobros)
  { id: 'PAG-008', tipo: 'prima', clienteId: 'CLI-001', siniestroId: null, importe: 485.30, estado: 'completado', metodo: 'domiciliacion', iban: 'ES91 2100 0418 4502 0005 1332', referencia: 'PRM-2026-AUTO-8832-03', fecha: '2026-03-01T06:00:00Z', concepto: 'Prima mensual Poliza Auto POL-AUTO-8832', polizaId: 'POL-AUTO-8832' },
  { id: 'PAG-009', tipo: 'prima', clienteId: 'CLI-002', siniestroId: null, importe: 312.50, estado: 'completado', metodo: 'domiciliacion', iban: 'ES76 0049 1500 0512 3456 7890', referencia: 'PRM-2026-HOG-2241-03', fecha: '2026-03-01T06:00:00Z', concepto: 'Prima mensual Poliza Hogar POL-HOGAR-2241', polizaId: 'POL-HOGAR-2241' },
  { id: 'PAG-010', tipo: 'prima', clienteId: 'CLI-003', siniestroId: null, importe: 520.75, estado: 'completado', metodo: 'domiciliacion', iban: 'ES12 1234 5678 9012 3456 7890', referencia: 'PRM-2026-AUTO-9921-03', fecha: '2026-03-01T06:00:00Z', concepto: 'Prima mensual Poliza Auto POL-AUTO-9921', polizaId: 'POL-AUTO-9921' },
  { id: 'PAG-011', tipo: 'prima', clienteId: 'CLI-006', siniestroId: null, importe: 89.90, estado: 'completado', metodo: 'bizum', iban: null, referencia: 'PRM-2026-SAL-1123-03', fecha: '2026-03-05T10:22:00Z', concepto: 'Prima mensual Poliza Salud POL-SALUD-1123', polizaId: 'POL-SALUD-1123' },
  { id: 'PAG-012', tipo: 'prima', clienteId: 'CLI-007', siniestroId: null, importe: 267.00, estado: 'rechazado', metodo: 'domiciliacion', iban: 'ES34 0081 0200 6100 0012 3456', referencia: 'PRM-2026-HOG-5567-03', fecha: '2026-03-01T06:00:00Z', concepto: 'Prima mensual Poliza Hogar POL-HOGAR-5567 - Fondos insuficientes', polizaId: 'POL-HOGAR-5567' },
  { id: 'PAG-013', tipo: 'prima', clienteId: 'CLI-008', siniestroId: null, importe: 156.40, estado: 'completado', metodo: 'domiciliacion', iban: 'ES55 0128 0001 2700 0000 0001', referencia: 'PRM-2026-AUTO-3344-03', fecha: '2026-03-01T06:00:00Z', concepto: 'Prima mensual Poliza Auto POL-AUTO-3344', polizaId: 'POL-AUTO-3344' },
  { id: 'PAG-014', tipo: 'prima', clienteId: 'CLI-004', siniestroId: null, importe: 445.00, estado: 'pendiente', metodo: 'domiciliacion', iban: 'ES12 1234 5678 9012 3456 7890', referencia: 'PRM-2026-AUTO-7712-04', fecha: '2026-04-01T06:00:00Z', concepto: 'Prima mensual Poliza Auto POL-AUTO-7712 - Abril', polizaId: 'POL-AUTO-7712' },

  // Proveedores
  { id: 'PAG-015', tipo: 'proveedor', clienteId: null, siniestroId: 'SIN-2026-0312', importe: 2850.00, estado: 'completado', metodo: 'transferencia', iban: 'ES22 0073 0100 5500 4412 2233', referencia: 'PROV-TAL-001-0312', fecha: '2026-03-16T10:00:00Z', concepto: 'Reparacion vehiculo - Taller AutoRep Madrid', proveedorId: 'PROV-TAL-001', proveedorNombre: 'AutoRep Madrid S.L.' },
  { id: 'PAG-016', tipo: 'proveedor', clienteId: null, siniestroId: 'SIN-2026-0298', importe: 1430.00, estado: 'completado', metodo: 'transferencia', iban: 'ES88 2085 0001 1003 3100 0001', referencia: 'PROV-FON-003-0298', fecha: '2026-03-15T09:30:00Z', concepto: 'Reparacion fontaneria - Fontaneria Rapida SL', proveedorId: 'PROV-FON-003', proveedorNombre: 'Fontaneria Rapida S.L.' },
  { id: 'PAG-017', tipo: 'proveedor', clienteId: null, siniestroId: 'SIN-2026-0340', importe: 3200.00, estado: 'completado', metodo: 'transferencia', iban: 'ES11 0049 2352 0828 1400 0001', referencia: 'PROV-TAL-005-0340', fecha: '2026-03-18T11:00:00Z', concepto: 'Reparacion carroceria - CarroFix Valencia', proveedorId: 'PROV-TAL-005', proveedorNombre: 'CarroFix Valencia S.L.' },
  { id: 'PAG-018', tipo: 'proveedor', clienteId: null, siniestroId: 'SIN-2026-0355', importe: 5600.00, estado: 'procesando', metodo: 'transferencia', iban: 'ES33 0182 5678 9000 1234 5678', referencia: 'PROV-CON-002-0355', fecha: '2026-03-19T08:00:00Z', concepto: 'Restauracion por inundacion - Reformas Integrales BCN', proveedorId: 'PROV-CON-002', proveedorNombre: 'Reformas Integrales BCN S.L.' },
  { id: 'PAG-019', tipo: 'proveedor', clienteId: null, siniestroId: 'SIN-2026-0378', importe: 980.00, estado: 'pendiente', metodo: 'transferencia', iban: 'ES44 2100 4321 0000 5678 9012', referencia: 'PROV-DEN-001-0378', fecha: '2026-03-19T12:00:00Z', concepto: 'Tratamiento dental - Clinica Dental Madrid Centro', proveedorId: 'PROV-DEN-001', proveedorNombre: 'Clinica Dental Madrid Centro' },
  { id: 'PAG-020', tipo: 'proveedor', clienteId: null, siniestroId: 'SIN-2026-0361', importe: 1890.00, estado: 'pendiente', metodo: 'transferencia', iban: 'ES55 0128 9876 5432 1098 7654', referencia: 'PROV-TAL-008-0361', fecha: '2026-03-19T14:00:00Z', concepto: 'Reparacion vehiculo - TallerPro Valencia', proveedorId: 'PROV-TAL-008', proveedorNombre: 'TallerPro Valencia S.L.' },
  { id: 'PAG-021', tipo: 'proveedor', clienteId: null, siniestroId: 'SIN-2026-0390', importe: 450.00, estado: 'completado', metodo: 'transferencia', iban: 'ES66 0065 0000 1234 5678 9012', referencia: 'PROV-GRU-002-0390', fecha: '2026-03-17T15:30:00Z', concepto: 'Servicio grua - Gruas Express Madrid', proveedorId: 'PROV-GRU-002', proveedorNombre: 'Gruas Express Madrid S.L.' },
  { id: 'PAG-022', tipo: 'proveedor', clienteId: null, siniestroId: 'SIN-2026-0401', importe: 320.00, estado: 'completado', metodo: 'transferencia', iban: 'ES77 2038 0000 9900 0011 2233', referencia: 'PROV-PER-012-0401', fecha: '2026-03-18T16:00:00Z', concepto: 'Honorarios peritaje - Perito Jose Manuel Garcia', proveedorId: 'PROV-PER-012', proveedorNombre: 'Jose Manuel Garcia - Perito' },
  { id: 'PAG-023', tipo: 'indemnizacion', clienteId: 'CLI-011', siniestroId: 'SIN-2026-0415', importe: 2100.00, estado: 'completado', metodo: 'bizum', iban: null, referencia: 'IND-2026-0415-001', fecha: '2026-03-18T10:00:00Z', concepto: 'Indemnizacion danos por granizo - pago rapido Bizum' },
  { id: 'PAG-024', tipo: 'prima', clienteId: 'CLI-011', siniestroId: null, importe: 378.20, estado: 'completado', metodo: 'domiciliacion', iban: 'ES99 0182 1234 5600 0000 9876', referencia: 'PRM-2026-AUTO-4455-03', fecha: '2026-03-01T06:00:00Z', concepto: 'Prima mensual Poliza Auto POL-AUTO-4455', polizaId: 'POL-AUTO-4455' }
];

function procesarIndemnizacion(siniestroId, importe, iban) {
  if (!siniestroId || !importe || !iban) {
    return { error: true, mensaje: 'Se requieren siniestroId, importe e IBAN' };
  }

  if (importe <= 0) {
    return { error: true, mensaje: 'El importe debe ser positivo' };
  }

  // Validacion basica IBAN espanol
  const ibanClean = iban.replace(/\s/g, '');
  if (!/^ES\d{22}$/.test(ibanClean)) {
    return { error: true, mensaje: 'IBAN espanol invalido. Formato esperado: ES + 22 digitos' };
  }

  pagoCounter++;
  const pagoId = `PAG-${String(pagoCounter).padStart(3, '0')}`;

  const nuevoPago = {
    id: pagoId,
    tipo: 'indemnizacion',
    clienteId: null,
    siniestroId,
    importe: parseFloat(importe.toFixed(2)),
    estado: 'procesando',
    metodo: 'transferencia',
    iban: ibanClean.replace(/(.{4})/g, '$1 ').trim(),
    referencia: `IND-${siniestroId.replace('SIN-', '')}-${String(pagoCounter).padStart(3, '0')}`,
    fecha: new Date().toISOString(),
    concepto: `Indemnizacion siniestro ${siniestroId}`
  };

  pagos.push(nuevoPago);

  return {
    pago_id: pagoId,
    estado: 'procesando',
    eta_transferencia: '24-48 horas laborables',
    importe: nuevoPago.importe,
    iban: nuevoPago.iban,
    referencia: nuevoPago.referencia,
    mensaje: `Indemnizacion de ${nuevoPago.importe.toLocaleString('es-ES')} EUR procesandose. Transferencia estimada en 24-48h.`
  };
}

function cobrarPrima(clienteId, polizaId, importe) {
  if (!clienteId || !polizaId || !importe) {
    return { error: true, mensaje: 'Se requieren clienteId, polizaId e importe' };
  }

  if (importe <= 0) {
    return { error: true, mensaje: 'El importe debe ser positivo' };
  }

  pagoCounter++;
  const reciboId = `REC-${String(pagoCounter).padStart(3, '0')}`;

  const nuevoPago = {
    id: `PAG-${String(pagoCounter).padStart(3, '0')}`,
    tipo: 'prima',
    clienteId,
    siniestroId: null,
    importe: parseFloat(importe.toFixed(2)),
    estado: 'procesando',
    metodo: 'domiciliacion',
    iban: null,
    referencia: `PRM-${polizaId}-${new Date().toISOString().slice(0, 7).replace('-', '')}`,
    fecha: new Date().toISOString(),
    concepto: `Cobro prima poliza ${polizaId}`,
    polizaId
  };

  pagos.push(nuevoPago);

  return {
    recibo_id: reciboId,
    pago_id: nuevoPago.id,
    estado: 'procesando',
    importe: nuevoPago.importe,
    metodo: 'domiciliacion',
    poliza: polizaId,
    fecha_cargo: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    mensaje: `Recibo de prima ${nuevoPago.importe.toLocaleString('es-ES')} EUR emitido. Cargo por domiciliacion en 3 dias laborables.`
  };
}

function pagarProveedor(proveedorId, casoId, importe) {
  if (!proveedorId || !casoId || !importe) {
    return { error: true, mensaje: 'Se requieren proveedorId, casoId e importe' };
  }

  if (importe <= 0) {
    return { error: true, mensaje: 'El importe debe ser positivo' };
  }

  pagoCounter++;
  const pagoId = `PAG-${String(pagoCounter).padStart(3, '0')}`;

  const nuevoPago = {
    id: pagoId,
    tipo: 'proveedor',
    clienteId: null,
    siniestroId: casoId,
    importe: parseFloat(importe.toFixed(2)),
    estado: 'pendiente',
    metodo: 'transferencia',
    iban: null,
    referencia: `PROV-${proveedorId}-${casoId.replace('SIN-', '')}`,
    fecha: new Date().toISOString(),
    concepto: `Pago proveedor ${proveedorId} - caso ${casoId}`,
    proveedorId,
    proveedorNombre: proveedorId
  };

  pagos.push(nuevoPago);

  return {
    pago_id: pagoId,
    estado: 'pendiente',
    importe: nuevoPago.importe,
    proveedor: proveedorId,
    referencia: nuevoPago.referencia,
    eta_pago: '3-5 dias laborables',
    mensaje: `Pago de ${nuevoPago.importe.toLocaleString('es-ES')} EUR al proveedor ${proveedorId} registrado. Pendiente de aprobacion.`
  };
}

function getHistorial(clienteId) {
  if (!clienteId) {
    return { error: true, mensaje: 'Se requiere clienteId' };
  }

  const pagosCliente = pagos.filter(p => p.clienteId === clienteId);

  const totalPagado = pagosCliente
    .filter(p => p.tipo === 'indemnizacion' && p.estado === 'completado')
    .reduce((sum, p) => sum + p.importe, 0);

  const totalPrimas = pagosCliente
    .filter(p => p.tipo === 'prima' && p.estado === 'completado')
    .reduce((sum, p) => sum + p.importe, 0);

  return {
    cliente_id: clienteId,
    total_operaciones: pagosCliente.length,
    total_indemnizaciones_recibidas: parseFloat(totalPagado.toFixed(2)),
    total_primas_pagadas: parseFloat(totalPrimas.toFixed(2)),
    pagos: pagosCliente.map(p => ({
      id: p.id,
      tipo: p.tipo,
      importe: p.importe,
      estado: p.estado,
      metodo: p.metodo,
      referencia: p.referencia,
      fecha: p.fecha,
      concepto: p.concepto
    })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  };
}

function getDashboardTesoreria() {
  const hoy = '2026-03-19';
  const inicioMes = '2026-03-01';

  const pagosHoy = pagos.filter(p => p.fecha.startsWith(hoy));
  const pagosMes = pagos.filter(p => p.fecha >= `${inicioMes}T00:00:00Z`);
  const pendientes = pagos.filter(p => p.estado === 'pendiente');
  const procesando = pagos.filter(p => p.estado === 'procesando');
  const rechazados = pagos.filter(p => p.estado === 'rechazado');
  const completados = pagos.filter(p => p.estado === 'completado');

  const entradas = pagosMes.filter(p => p.tipo === 'prima' && p.estado === 'completado');
  const salidas = pagosMes.filter(p => (p.tipo === 'indemnizacion' || p.tipo === 'proveedor') && p.estado === 'completado');

  const totalEntradas = entradas.reduce((sum, p) => sum + p.importe, 0);
  const totalSalidas = salidas.reduce((sum, p) => sum + p.importe, 0);

  return {
    pagos_pendientes: {
      cantidad: pendientes.length,
      importe_total: parseFloat(pendientes.reduce((sum, p) => sum + p.importe, 0).toFixed(2))
    },
    pagos_procesando: {
      cantidad: procesando.length,
      importe_total: parseFloat(procesando.reduce((sum, p) => sum + p.importe, 0).toFixed(2))
    },
    pagos_hoy: {
      cantidad: pagosHoy.length,
      importe_total: parseFloat(pagosHoy.reduce((sum, p) => sum + p.importe, 0).toFixed(2)),
      detalle: pagosHoy.map(p => ({ id: p.id, tipo: p.tipo, importe: p.importe, estado: p.estado }))
    },
    pagos_mes: {
      cantidad: pagosMes.length,
      importe_total: parseFloat(pagosMes.reduce((sum, p) => sum + p.importe, 0).toFixed(2))
    },
    rechazados: {
      cantidad: rechazados.length,
      importe_total: parseFloat(rechazados.reduce((sum, p) => sum + p.importe, 0).toFixed(2)),
      motivos: rechazados.map(p => ({ id: p.id, importe: p.importe, concepto: p.concepto }))
    },
    cash_flow: {
      entradas_mes: parseFloat(totalEntradas.toFixed(2)),
      salidas_mes: parseFloat(totalSalidas.toFixed(2)),
      balance_neto: parseFloat((totalEntradas - totalSalidas).toFixed(2)),
      ratio_siniestralidad: totalEntradas > 0 ? parseFloat((totalSalidas / totalEntradas * 100).toFixed(1)) : 0
    },
    conciliacion: {
      total_operaciones: pagos.length,
      conciliadas: completados.length,
      pendientes_conciliar: pendientes.length + procesando.length,
      porcentaje_conciliacion: parseFloat((completados.length / pagos.length * 100).toFixed(1)),
      ultima_conciliacion: '2026-03-19T08:00:00Z'
    },
    por_tipo: {
      indemnizaciones: {
        cantidad: pagos.filter(p => p.tipo === 'indemnizacion').length,
        importe_total: parseFloat(pagos.filter(p => p.tipo === 'indemnizacion').reduce((s, p) => s + p.importe, 0).toFixed(2))
      },
      primas: {
        cantidad: pagos.filter(p => p.tipo === 'prima').length,
        importe_total: parseFloat(pagos.filter(p => p.tipo === 'prima').reduce((s, p) => s + p.importe, 0).toFixed(2))
      },
      proveedores: {
        cantidad: pagos.filter(p => p.tipo === 'proveedor').length,
        importe_total: parseFloat(pagos.filter(p => p.tipo === 'proveedor').reduce((s, p) => s + p.importe, 0).toFixed(2))
      }
    },
    por_metodo: {
      transferencia: pagos.filter(p => p.metodo === 'transferencia').length,
      domiciliacion: pagos.filter(p => p.metodo === 'domiciliacion').length,
      bizum: pagos.filter(p => p.metodo === 'bizum').length
    }
  };
}

module.exports = {
  procesarIndemnizacion,
  cobrarPrima,
  pagarProveedor,
  getHistorial,
  getDashboardTesoreria
};
