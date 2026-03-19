// =============================================================================
// AGENTE DE RECOBRO DE IMPAGADOS
// Gestion inteligente de cobro con negociacion empatica y planes de pago
// =============================================================================

// ---------------------------------------------------------------------------
// Base de datos de recibos impagados
// ---------------------------------------------------------------------------
const impagados = [
  {
    id: 'IMP-001', clienteId: 'CLI-201', nombre: 'Fernando Ruiz Garrido',
    poliza: 'POL-AUTO-2025-0456', importe: 185.00,
    fecha_vencimiento: '2026-02-15', dias_impago: 32,
    fase: 'suspension', intentos: 4, telefono: '+34 612 111 222',
    email: 'fernando.ruiz@email.com', ultimo_contacto: '2026-03-10',
    notas: 'Alega dificultades economicas temporales'
  },
  {
    id: 'IMP-002', clienteId: 'CLI-202', nombre: 'Marta Iglesias Conde',
    poliza: 'POL-HOGAR-2025-0234', importe: 320.00,
    fecha_vencimiento: '2026-03-01', dias_impago: 18,
    fase: 'negociacion', intentos: 2, telefono: '+34 623 222 333',
    email: 'marta.iglesias@email.com', ultimo_contacto: '2026-03-14',
    notas: 'Domiciliacion rechazada, cambio de cuenta pendiente'
  },
  {
    id: 'IMP-003', clienteId: 'CLI-203', nombre: 'Pablo Gutierrez Sanz',
    poliza: 'POL-SALUD-2025-0567', importe: 245.00,
    fecha_vencimiento: '2026-03-05', dias_impago: 14,
    fase: 'llamada', intentos: 1, telefono: '+34 634 333 444',
    email: 'pablo.gutierrez@email.com', ultimo_contacto: '2026-03-12',
    notas: 'No contesta al telefono'
  },
  {
    id: 'IMP-004', clienteId: 'CLI-204', nombre: 'Silvia Moreno Pardo',
    poliza: 'POL-VIDA-2025-0089', importe: 78.50,
    fecha_vencimiento: '2026-03-14', dias_impago: 5,
    fase: 'recordatorio', intentos: 1, telefono: '+34 645 444 555',
    email: 'silvia.moreno@email.com', ultimo_contacto: null,
    notas: 'Primer impago, clienta habitual'
  },
  {
    id: 'IMP-005', clienteId: 'CLI-205', nombre: 'Alberto Delgado Torres',
    poliza: 'POL-AUTO-2025-0678', importe: 425.00,
    fecha_vencimiento: '2026-02-01', dias_impago: 46,
    fase: 'suspension', intentos: 6, telefono: '+34 656 555 666',
    email: 'alberto.delgado@email.com', ultimo_contacto: '2026-03-05',
    notas: 'Poliza suspendida. Cliente quiere pagar pero pide fraccionamiento'
  },
  {
    id: 'IMP-006', clienteId: 'CLI-206', nombre: 'Rosa Perez Jimenez',
    poliza: 'POL-HOGAR-2025-0345', importe: 165.00,
    fecha_vencimiento: '2026-03-10', dias_impago: 9,
    fase: 'llamada', intentos: 1, telefono: '+34 667 666 777',
    email: 'rosa.perez@email.com', ultimo_contacto: '2026-03-15',
    notas: 'Dice que ya ha realizado la transferencia'
  },
  {
    id: 'IMP-007', clienteId: 'CLI-207', nombre: 'Enrique Vidal Castro',
    poliza: 'POL-AUTO-2025-0789', importe: 290.00,
    fecha_vencimiento: '2026-02-20', dias_impago: 27,
    fase: 'negociacion', intentos: 3, telefono: '+34 678 777 888',
    email: 'enrique.vidal@email.com', ultimo_contacto: '2026-03-12',
    notas: 'Solicita plan de pago en 3 cuotas'
  },
  {
    id: 'IMP-008', clienteId: 'CLI-208', nombre: 'Clara Munoz Herrero',
    poliza: 'POL-SALUD-2025-0890', importe: 390.00,
    fecha_vencimiento: '2026-02-10', dias_impago: 37,
    fase: 'suspension', intentos: 5, telefono: '+34 689 888 999',
    email: 'clara.munoz@email.com', ultimo_contacto: '2026-03-08',
    notas: 'En ERTE, solicita aplazamiento hasta abril'
  },
  {
    id: 'IMP-009', clienteId: 'CLI-209', nombre: 'Jorge Ramirez Luna',
    poliza: 'POL-VIDA-2025-0123', importe: 52.00,
    fecha_vencimiento: '2026-03-16', dias_impago: 3,
    fase: 'recordatorio', intentos: 0, telefono: '+34 690 999 000',
    email: 'jorge.ramirez@email.com', ultimo_contacto: null,
    notas: 'Impago reciente, probablemente olvido'
  },
  {
    id: 'IMP-010', clienteId: 'CLI-210', nombre: 'Beatriz Alonso Navarro',
    poliza: 'POL-AUTO-2025-0901', importe: 510.00,
    fecha_vencimiento: '2026-02-05', dias_impago: 42,
    fase: 'suspension', intentos: 5, telefono: '+34 601 000 111',
    email: 'beatriz.alonso@email.com', ultimo_contacto: '2026-03-06',
    notas: 'Cambio de domiciliacion bancaria no procesado. Quiere pagar'
  },
  {
    id: 'IMP-011', clienteId: 'CLI-211', nombre: 'Tomas Garcia Blanco',
    poliza: 'POL-HOGAR-2025-0456', importe: 198.00,
    fecha_vencimiento: '2026-03-08', dias_impago: 11,
    fase: 'llamada', intentos: 2, telefono: '+34 612 112 223',
    email: 'tomas.garcia@email.com', ultimo_contacto: '2026-03-17',
    notas: 'Confirma pago para esta semana'
  },
  {
    id: 'IMP-012', clienteId: 'CLI-212', nombre: 'Lucia Serrano Campos',
    poliza: 'POL-SALUD-2025-0234', importe: 475.00,
    fecha_vencimiento: '2026-02-25', dias_impago: 22,
    fase: 'negociacion', intentos: 3, telefono: '+34 623 223 334',
    email: 'lucia.serrano@email.com', ultimo_contacto: '2026-03-13',
    notas: 'Autonoma con baja facturacion. Pide pago en 4 cuotas'
  },
  {
    id: 'IMP-013', clienteId: 'CLI-213', nombre: 'David Romero Fuentes',
    poliza: 'POL-AUTO-2024-0567', importe: 350.00,
    fecha_vencimiento: '2026-03-12', dias_impago: 7,
    fase: 'recordatorio', intentos: 1, telefono: '+34 634 334 445',
    email: 'david.romero@email.com', ultimo_contacto: '2026-03-18',
    notas: 'Recibio recordatorio por email. Pendiente de respuesta'
  }
];

// Historial de recobros completados este mes
const recobrosCompletados = [
  {
    id: 'REC-001', clienteId: 'CLI-220', nombre: 'Ana Prieto Exposito',
    importe_original: 280.00, importe_cobrado: 280.00,
    fecha_cobro: '2026-03-02', metodo: 'transferencia', tipo: 'pago_unico'
  },
  {
    id: 'REC-002', clienteId: 'CLI-221', nombre: 'Carlos Diaz Millan',
    importe_original: 195.00, importe_cobrado: 195.00,
    fecha_cobro: '2026-03-05', metodo: 'domiciliacion', tipo: 'pago_unico'
  },
  {
    id: 'REC-003', clienteId: 'CLI-222', nombre: 'Eva Santos Rios',
    importe_original: 420.00, importe_cobrado: 140.00,
    fecha_cobro: '2026-03-08', metodo: 'transferencia', tipo: 'plan_pago_cuota_1_de_3'
  },
  {
    id: 'REC-004', clienteId: 'CLI-223', nombre: 'Miguel Flores Duran',
    importe_original: 155.00, importe_cobrado: 155.00,
    fecha_cobro: '2026-03-11', metodo: 'bizum', tipo: 'pago_unico'
  },
  {
    id: 'REC-005', clienteId: 'CLI-224', nombre: 'Laura Reyes Medina',
    importe_original: 340.00, importe_cobrado: 170.00,
    fecha_cobro: '2026-03-14', metodo: 'transferencia', tipo: 'plan_pago_cuota_1_de_2'
  }
];

// ---------------------------------------------------------------------------
// Determinar fase segun dias de impago
// ---------------------------------------------------------------------------
function determinarFase(diasImpago) {
  if (diasImpago <= 7) return { fase: 'recordatorio', descripcion: 'Recordatorio suave por email/SMS' };
  if (diasImpago <= 15) return { fase: 'llamada', descripcion: 'Llamada telefonica de cobro amable' };
  if (diasImpago <= 30) return { fase: 'negociacion', descripcion: 'Negociacion y oferta de plan de pago' };
  return { fase: 'suspension', descripcion: 'Suspension de garantias y ultimo aviso' };
}

// ---------------------------------------------------------------------------
// getImpagados - Lista de impagados ordenados por dias de impago
// ---------------------------------------------------------------------------
function getImpagados() {
  const resultado = impagados.map(imp => {
    const faseActual = determinarFase(imp.dias_impago);
    return {
      id: imp.id,
      clienteId: imp.clienteId,
      nombre: imp.nombre,
      poliza: imp.poliza,
      importe: imp.importe,
      fecha_vencimiento: imp.fecha_vencimiento,
      dias_impago: imp.dias_impago,
      fase: faseActual.fase,
      fase_descripcion: faseActual.descripcion,
      intentos: imp.intentos,
      ultimo_contacto: imp.ultimo_contacto,
      notas: imp.notas,
      urgencia: imp.dias_impago > 30 ? 'critica' : imp.dias_impago > 15 ? 'alta' : imp.dias_impago > 7 ? 'media' : 'baja'
    };
  });

  resultado.sort((a, b) => b.dias_impago - a.dias_impago);
  return resultado;
}

// ---------------------------------------------------------------------------
// iniciarProceso - Simula llamada de recobro con negociacion empatica
// ---------------------------------------------------------------------------
function iniciarProceso(clienteId) {
  const impago = impagados.find(i => i.clienteId === clienteId);
  if (!impago) {
    return { error: true, mensaje: 'Cliente no encontrado en lista de impagados: ' + clienteId };
  }

  const faseActual = determinarFase(impago.dias_impago);
  const timestamp = new Date().toISOString();
  const nombrePila = impago.nombre.split(' ')[0];

  // Construir conversacion segun fase
  const conversacion = [];

  // Saludo adaptado a la fase
  if (faseActual.fase === 'recordatorio') {
    conversacion.push({
      paso: 1, momento: timestamp, emisor: 'agente',
      mensaje: 'Buenos dias, ' + nombrePila + '. Le llamo de SegurosIA. Le contacto brevemente ' +
        'porque hemos detectado que el recibo de su poliza ' + impago.poliza + ' por importe de ' +
        impago.importe.toFixed(2) + ' EUR esta pendiente de cobro. ¿Es posible que haya habido ' +
        'algun problema con la domiciliacion?'
    });
    conversacion.push({
      paso: 2, momento: timestamp, emisor: 'cliente',
      mensaje: 'Ah, si, es verdad. Se me habia pasado. Creo que no tenia saldo suficiente ese dia.'
    });
    conversacion.push({
      paso: 3, momento: timestamp, emisor: 'agente',
      mensaje: 'No se preocupe, es algo que ocurre con frecuencia. Puedo volver a pasar el recibo ' +
        'manana si le viene bien, o si lo prefiere puede realizar una transferencia o pago por Bizum.'
    });
    conversacion.push({
      paso: 4, momento: timestamp, emisor: 'cliente',
      mensaje: 'Si, paselo manana que ya tendre fondos.'
    });
    conversacion.push({
      paso: 5, momento: timestamp, emisor: 'agente',
      mensaje: 'Perfecto, programamos el cobro para manana. Le recuerdo que asi su poliza mantiene ' +
        'todas sus coberturas activas sin interrupcion. ¿Puedo ayudarle en algo mas?'
    });
  } else if (faseActual.fase === 'llamada') {
    conversacion.push({
      paso: 1, momento: timestamp, emisor: 'agente',
      mensaje: 'Buenos dias, ' + nombrePila + '. Soy del departamento de atencion al cliente de ' +
        'SegurosIA. Le llamo en relacion con el recibo pendiente de su poliza ' + impago.poliza +
        ' por ' + impago.importe.toFixed(2) + ' EUR, vencido el ' + impago.fecha_vencimiento +
        '. Llevamos ' + impago.dias_impago + ' dias sin poder realizar el cobro. ' +
        '¿Ha tenido alguna dificultad?'
    });
    conversacion.push({
      paso: 2, momento: timestamp, emisor: 'cliente',
      mensaje: 'Si, la verdad es que este mes ha sido complicado. He tenido gastos imprevistos.'
    });
    conversacion.push({
      paso: 3, momento: timestamp, emisor: 'agente',
      mensaje: 'Lo entiendo perfectamente, ' + nombrePila + '. Queremos ayudarle a mantener su ' +
        'poliza activa. ¿Le vendria bien que fraccionemos el pago? Podriamos dividirlo en 2 cuotas ' +
        'de ' + (impago.importe / 2).toFixed(2) + ' EUR sin ningun recargo adicional.'
    });
    conversacion.push({
      paso: 4, momento: timestamp, emisor: 'cliente',
      mensaje: 'Eso me vendria mucho mejor, si. ¿Cuando seria la primera cuota?'
    });
    conversacion.push({
      paso: 5, momento: timestamp, emisor: 'agente',
      mensaje: 'La primera cuota la pasariamos este viernes y la segunda dentro de 15 dias. ' +
        'Asi mantiene su poliza activa y con todas las coberturas. ¿Le parece bien?'
    });
    conversacion.push({
      paso: 6, momento: timestamp, emisor: 'cliente',
      mensaje: 'Si, perfecto. Muchas gracias por la facilidad.'
    });
  } else if (faseActual.fase === 'negociacion') {
    conversacion.push({
      paso: 1, momento: timestamp, emisor: 'agente',
      mensaje: 'Buenos dias, ' + nombrePila + '. Le llamo de SegurosIA respecto a su recibo ' +
        'pendiente de ' + impago.importe.toFixed(2) + ' EUR de la poliza ' + impago.poliza + '. ' +
        'Llevamos ' + impago.dias_impago + ' dias intentando resolver esta situacion. ' +
        'Es importante que lo solucionemos pronto para evitar la suspension de sus coberturas.'
    });
    conversacion.push({
      paso: 2, momento: timestamp, emisor: 'cliente',
      mensaje: 'Ya lo se, pero ahora mismo no puedo pagar todo de golpe. Estoy pasando una mala racha.'
    });
    conversacion.push({
      paso: 3, momento: timestamp, emisor: 'agente',
      mensaje: 'Entiendo su situacion, ' + nombrePila + ', y precisamente por eso le llamo. ' +
        'Quiero ofrecerle un plan de pago adaptado. Podemos dividir los ' +
        impago.importe.toFixed(2) + ' EUR en 3 cuotas mensuales de ' +
        (Math.ceil(impago.importe / 3 * 100) / 100).toFixed(2) + ' EUR cada una, ' +
        'sin intereses ni recargos. La primera seria la proxima semana.'
    });
    conversacion.push({
      paso: 4, momento: timestamp, emisor: 'cliente',
      mensaje: '¿De verdad sin recargos? Eso si que me vendria bien.'
    });
    conversacion.push({
      paso: 5, momento: timestamp, emisor: 'agente',
      mensaje: 'Asi es, sin ningun recargo. Solo necesitamos que confirme sus datos bancarios ' +
        'y le enviaremos el plan de pago por email para que lo revise y acepte. ' +
        '¿Su cuenta sigue siendo la terminada en la que tenemos registrada?'
    });
    conversacion.push({
      paso: 6, momento: timestamp, emisor: 'cliente',
      mensaje: 'Si, la misma cuenta. Acepto el plan de pago.'
    });
    conversacion.push({
      paso: 7, momento: timestamp, emisor: 'agente',
      mensaje: 'Perfecto. Le envio ahora mismo la propuesta a ' + impago.email + '. ' +
        'Mientras se ejecuta el plan de pago, su poliza se mantendra activa. ' +
        'Gracias por su confianza, ' + nombrePila + '.'
    });
  } else {
    // suspension
    conversacion.push({
      paso: 1, momento: timestamp, emisor: 'agente',
      mensaje: 'Buenos dias, ' + nombrePila + '. Le llamo con caracter urgente de SegurosIA. ' +
        'Su poliza ' + impago.poliza + ' se encuentra actualmente suspendida por impago del recibo ' +
        'de ' + impago.importe.toFixed(2) + ' EUR, vencido hace ' + impago.dias_impago + ' dias. ' +
        'Esto significa que en este momento no tiene coberturas activas.'
    });
    conversacion.push({
      paso: 2, momento: timestamp, emisor: 'cliente',
      mensaje: 'Lo se, lo se... Es que no he podido hacer frente al pago. ¿Se puede hacer algo todavia?'
    });
    conversacion.push({
      paso: 3, momento: timestamp, emisor: 'agente',
      mensaje: 'Si, todavia estamos a tiempo. Puedo ofrecerle una ultima oportunidad antes de la ' +
        'anulacion definitiva. Le propongo un plan de pago en 4 cuotas de ' +
        (Math.ceil(impago.importe / 4 * 100) / 100).toFixed(2) + ' EUR. La primera ' +
        'deberia ser inmediata para reactivar las coberturas hoy mismo.'
    });
    conversacion.push({
      paso: 4, momento: timestamp, emisor: 'cliente',
      mensaje: 'Puedo hacer un Bizum ahora mismo con la primera cuota. ¿Eso reactivaria la poliza?'
    });
    conversacion.push({
      paso: 5, momento: timestamp, emisor: 'agente',
      mensaje: 'Exacto. En cuanto recibamos el primer pago, reactivamos sus coberturas de forma ' +
        'inmediata. El Bizum puede realizarlo al numero que le envio por SMS. Las tres cuotas ' +
        'restantes se pasarian los dias 1 de cada mes. ¿Procedemos?'
    });
    conversacion.push({
      paso: 6, momento: timestamp, emisor: 'cliente',
      mensaje: 'Si, hago el Bizum ahora mismo. Muchas gracias por darme esta opcion.'
    });
    conversacion.push({
      paso: 7, momento: timestamp, emisor: 'agente',
      mensaje: 'Gracias a usted, ' + nombrePila + '. Le envio el plan de pago completo a ' +
        impago.email + '. En cuanto confirmemos el primer pago le notifico la reactivacion. ' +
        '¿Puedo ayudarle en algo mas?'
    });
  }

  // Actualizar intentos
  impago.intentos++;
  impago.ultimo_contacto = new Date().toISOString().split('T')[0];

  const cuotasSugeridas = impago.dias_impago > 30 ? 4 : impago.dias_impago > 15 ? 3 : 2;

  return {
    clienteId: impago.clienteId,
    nombre: impago.nombre,
    poliza: impago.poliza,
    importe_pendiente: impago.importe,
    dias_impago: impago.dias_impago,
    fase: faseActual.fase,
    fase_descripcion: faseActual.descripcion,
    intentos_totales: impago.intentos,
    conversacion,
    resultado: 'plan_pago_aceptado',
    plan_pago_propuesto: {
      cuotas: cuotasSugeridas,
      importe_cuota: Math.ceil(impago.importe / cuotasSugeridas * 100) / 100,
      sin_recargo: true,
      primera_cuota: 'inmediata'
    },
    siguiente_accion: faseActual.fase === 'suspension'
      ? 'Verificar recepcion del primer pago y reactivar poliza'
      : 'Confirmar cobro de primera cuota y programar seguimiento'
  };
}

// ---------------------------------------------------------------------------
// ofrecerPlanPago - Genera propuesta formal de plan de pago
// ---------------------------------------------------------------------------
function ofrecerPlanPago(clienteId, cuotas) {
  const impago = impagados.find(i => i.clienteId === clienteId);
  if (!impago) {
    return { error: true, mensaje: 'Cliente no encontrado en lista de impagados: ' + clienteId };
  }

  const numCuotas = cuotas || (impago.dias_impago > 30 ? 4 : impago.dias_impago > 15 ? 3 : 2);

  if (numCuotas < 2 || numCuotas > 6) {
    return { error: true, mensaje: 'El numero de cuotas debe estar entre 2 y 6' };
  }

  const importeCuota = Math.ceil(impago.importe / numCuotas * 100) / 100;
  const ultimaCuota = Math.round((impago.importe - importeCuota * (numCuotas - 1)) * 100) / 100;

  const hoy = new Date();
  const calendario = [];
  for (let i = 0; i < numCuotas; i++) {
    const fechaCuota = new Date(hoy);
    if (i === 0) {
      // Primera cuota inmediata o en 3 dias
      fechaCuota.setDate(fechaCuota.getDate() + 3);
    } else {
      // Resto el dia 1 de cada mes siguiente
      fechaCuota.setMonth(fechaCuota.getMonth() + i);
      fechaCuota.setDate(1);
    }

    calendario.push({
      cuota: i + 1,
      importe: i === numCuotas - 1 ? ultimaCuota : importeCuota,
      fecha_cobro: fechaCuota.toISOString().split('T')[0],
      estado: 'pendiente'
    });
  }

  return {
    propuesta_id: 'PP-' + Date.now().toString(36).toUpperCase(),
    clienteId: impago.clienteId,
    nombre: impago.nombre,
    poliza: impago.poliza,
    deuda_total: impago.importe,
    dias_impago: impago.dias_impago,
    plan: {
      numero_cuotas: numCuotas,
      importe_por_cuota: importeCuota,
      recargo: 0,
      interes: 0,
      total_a_pagar: impago.importe,
      calendario
    },
    condiciones: [
      'Sin intereses ni recargos por fraccionamiento',
      'El impago de una cuota anula el plan y reactiva la deuda total',
      'La poliza se mantiene activa mientras se cumpla el calendario',
      'Pago mediante domiciliacion bancaria o transferencia'
    ],
    metodos_pago_aceptados: ['domiciliacion', 'transferencia', 'bizum', 'tarjeta'],
    validez_propuesta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 'pendiente_aceptacion'
  };
}

// ---------------------------------------------------------------------------
// getEstadisticas - Metricas del proceso de recobro
// ---------------------------------------------------------------------------
function getEstadisticas() {
  const totalImpagado = impagados.reduce((sum, i) => sum + i.importe, 0);
  const recobradoMes = recobrosCompletados.reduce((sum, r) => sum + r.importe_cobrado, 0);

  const porFase = {};
  for (const imp of impagados) {
    const faseKey = determinarFase(imp.dias_impago).fase;
    if (!porFase[faseKey]) {
      porFase[faseKey] = { cantidad: 0, importe: 0 };
    }
    porFase[faseKey].cantidad++;
    porFase[faseKey].importe = Math.round((porFase[faseKey].importe + imp.importe) * 100) / 100;
  }

  const suspendidos = impagados.filter(i => determinarFase(i.dias_impago).fase === 'suspension');
  const enProceso = impagados.filter(i => i.intentos > 0);
  const sinContactar = impagados.filter(i => i.intentos === 0);

  const importeMedioImpago = impagados.length > 0
    ? Math.round(totalImpagado / impagados.length * 100) / 100
    : 0;

  const diasImpagoMedio = impagados.length > 0
    ? Math.round(impagados.reduce((sum, i) => sum + i.dias_impago, 0) / impagados.length)
    : 0;

  // Tasa de recobro: recobrado / (recobrado + pendiente) * 100
  const tasaRecobro = Math.round(recobradoMes / (recobradoMes + totalImpagado) * 10000) / 100;

  return {
    resumen: {
      total_recibos_impagados: impagados.length,
      total_importe_impagado: Math.round(totalImpagado * 100) / 100,
      importe_medio_impago: importeMedioImpago,
      dias_impago_medio: diasImpagoMedio
    },
    recobro_mes: {
      recobrado_este_mes: Math.round(recobradoMes * 100) / 100,
      operaciones_recobro: recobrosCompletados.length,
      tasa_recobro: tasaRecobro + '%'
    },
    estado_gestiones: {
      en_proceso: enProceso.length,
      sin_contactar: sinContactar.length,
      suspendidos: suspendidos.length
    },
    desglose_por_fase: porFase,
    urgentes: impagados
      .filter(i => i.dias_impago > 25)
      .sort((a, b) => b.dias_impago - a.dias_impago)
      .map(i => ({
        id: i.id,
        nombre: i.nombre,
        importe: i.importe,
        dias_impago: i.dias_impago,
        fase: determinarFase(i.dias_impago).fase
      })),
    recobros_recientes: recobrosCompletados.slice(-5).reverse()
  };
}

module.exports = {
  getImpagados,
  iniciarProceso,
  getEstadisticas,
  ofrecerPlanPago
};
