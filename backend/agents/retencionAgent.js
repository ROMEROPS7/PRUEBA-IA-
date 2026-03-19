// =============================================================================
// AGENTE DE RETENCION DE CLIENTES
// Sistema inteligente de deteccion de riesgo de fuga y retencion proactiva
// =============================================================================

const clientes = [
  {
    id: 'CLI-001', nombre: 'Maria Garcia Lopez', poliza: 'POL-AUTO-2024-0012',
    tipo_producto: 'auto', prima_actual: 485.00, dias_para_renovacion: 18,
    antiguedad_anos: 1.2, quejas_recientes: 2, siniestros_rechazados: 1,
    competidor_mas_barato: true, sin_uso_app: true, recibos_impagados: 0,
    telefono: '+34 612 345 678', email: 'maria.garcia@email.com',
    ultimo_contacto: '2026-02-10'
  },
  {
    id: 'CLI-002', nombre: 'Carlos Fernandez Ruiz', poliza: 'POL-HOGAR-2024-0034',
    tipo_producto: 'hogar', prima_actual: 320.00, dias_para_renovacion: 45,
    antiguedad_anos: 0.8, quejas_recientes: 3, siniestros_rechazados: 2,
    competidor_mas_barato: true, sin_uso_app: true, recibos_impagados: 1,
    telefono: '+34 623 456 789', email: 'carlos.fernandez@email.com',
    ultimo_contacto: '2026-01-22'
  },
  {
    id: 'CLI-003', nombre: 'Ana Martinez Diaz', poliza: 'POL-VIDA-2023-0078',
    tipo_producto: 'vida', prima_actual: 245.00, dias_para_renovacion: 90,
    antiguedad_anos: 3.5, quejas_recientes: 0, siniestros_rechazados: 0,
    competidor_mas_barato: false, sin_uso_app: false, recibos_impagados: 0,
    telefono: '+34 634 567 890', email: 'ana.martinez@email.com',
    ultimo_contacto: '2026-03-01'
  },
  {
    id: 'CLI-004', nombre: 'Pedro Sanchez Moreno', poliza: 'POL-AUTO-2024-0056',
    tipo_producto: 'auto', prima_actual: 720.00, dias_para_renovacion: 12,
    antiguedad_anos: 0.5, quejas_recientes: 1, siniestros_rechazados: 1,
    competidor_mas_barato: true, sin_uso_app: true, recibos_impagados: 2,
    telefono: '+34 645 678 901', email: 'pedro.sanchez@email.com',
    ultimo_contacto: '2026-02-28'
  },
  {
    id: 'CLI-005', nombre: 'Laura Jimenez Torres', poliza: 'POL-SALUD-2023-0091',
    tipo_producto: 'salud', prima_actual: 890.00, dias_para_renovacion: 30,
    antiguedad_anos: 2.0, quejas_recientes: 4, siniestros_rechazados: 0,
    competidor_mas_barato: false, sin_uso_app: true, recibos_impagados: 1,
    telefono: '+34 656 789 012', email: 'laura.jimenez@email.com',
    ultimo_contacto: '2026-03-05'
  },
  {
    id: 'CLI-006', nombre: 'Javier Romero Gutierrez', poliza: 'POL-AUTO-2023-0145',
    tipo_producto: 'auto', prima_actual: 550.00, dias_para_renovacion: 60,
    antiguedad_anos: 5.0, quejas_recientes: 0, siniestros_rechazados: 0,
    competidor_mas_barato: true, sin_uso_app: false, recibos_impagados: 0,
    telefono: '+34 667 890 123', email: 'javier.romero@email.com',
    ultimo_contacto: '2026-03-12'
  },
  {
    id: 'CLI-007', nombre: 'Isabel Navarro Perez', poliza: 'POL-HOGAR-2024-0067',
    tipo_producto: 'hogar', prima_actual: 275.00, dias_para_renovacion: 22,
    antiguedad_anos: 0.9, quejas_recientes: 2, siniestros_rechazados: 1,
    competidor_mas_barato: true, sin_uso_app: true, recibos_impagados: 0,
    telefono: '+34 678 901 234', email: 'isabel.navarro@email.com',
    ultimo_contacto: '2026-02-15'
  },
  {
    id: 'CLI-008', nombre: 'Roberto Castillo Vega', poliza: 'POL-VIDA-2024-0023',
    tipo_producto: 'vida', prima_actual: 180.00, dias_para_renovacion: 150,
    antiguedad_anos: 8.0, quejas_recientes: 0, siniestros_rechazados: 0,
    competidor_mas_barato: false, sin_uso_app: false, recibos_impagados: 0,
    telefono: '+34 689 012 345', email: 'roberto.castillo@email.com',
    ultimo_contacto: '2026-03-10'
  },
  {
    id: 'CLI-009', nombre: 'Elena Ruiz Herrera', poliza: 'POL-SALUD-2024-0044',
    tipo_producto: 'salud', prima_actual: 1120.00, dias_para_renovacion: 8,
    antiguedad_anos: 1.5, quejas_recientes: 3, siniestros_rechazados: 1,
    competidor_mas_barato: true, sin_uso_app: true, recibos_impagados: 1,
    telefono: '+34 690 123 456', email: 'elena.ruiz@email.com',
    ultimo_contacto: '2026-01-30'
  },
  {
    id: 'CLI-010', nombre: 'Francisco Morales Gil', poliza: 'POL-AUTO-2023-0189',
    tipo_producto: 'auto', prima_actual: 380.00, dias_para_renovacion: 75,
    antiguedad_anos: 4.0, quejas_recientes: 1, siniestros_rechazados: 0,
    competidor_mas_barato: false, sin_uso_app: true, recibos_impagados: 0,
    telefono: '+34 601 234 567', email: 'francisco.morales@email.com',
    ultimo_contacto: '2026-03-08'
  },
  {
    id: 'CLI-011', nombre: 'Carmen Dominguez Soto', poliza: 'POL-HOGAR-2023-0098',
    tipo_producto: 'hogar', prima_actual: 410.00, dias_para_renovacion: 5,
    antiguedad_anos: 0.6, quejas_recientes: 5, siniestros_rechazados: 2,
    competidor_mas_barato: true, sin_uso_app: true, recibos_impagados: 2,
    telefono: '+34 612 876 543', email: 'carmen.dominguez@email.com',
    ultimo_contacto: '2026-01-15'
  },
  {
    id: 'CLI-012', nombre: 'Antonio Lopez Marin', poliza: 'POL-AUTO-2024-0201',
    tipo_producto: 'auto', prima_actual: 640.00, dias_para_renovacion: 40,
    antiguedad_anos: 2.5, quejas_recientes: 0, siniestros_rechazados: 1,
    competidor_mas_barato: true, sin_uso_app: false, recibos_impagados: 0,
    telefono: '+34 623 765 432', email: 'antonio.lopez@email.com',
    ultimo_contacto: '2026-03-14'
  },
  {
    id: 'CLI-013', nombre: 'Lucia Hernandez Ramos', poliza: 'POL-VIDA-2024-0055',
    tipo_producto: 'vida', prima_actual: 520.00, dias_para_renovacion: 110,
    antiguedad_anos: 6.0, quejas_recientes: 1, siniestros_rechazados: 0,
    competidor_mas_barato: false, sin_uso_app: false, recibos_impagados: 0,
    telefono: '+34 634 654 321', email: 'lucia.hernandez@email.com',
    ultimo_contacto: '2026-03-15'
  },
  {
    id: 'CLI-014', nombre: 'Miguel Torres Blanco', poliza: 'POL-SALUD-2023-0132',
    tipo_producto: 'salud', prima_actual: 980.00, dias_para_renovacion: 15,
    antiguedad_anos: 1.0, quejas_recientes: 2, siniestros_rechazados: 0,
    competidor_mas_barato: true, sin_uso_app: true, recibos_impagados: 1,
    telefono: '+34 645 543 210', email: 'miguel.torres@email.com',
    ultimo_contacto: '2026-02-20'
  },
  {
    id: 'CLI-015', nombre: 'Patricia Vargas Mendez', poliza: 'POL-AUTO-2024-0178',
    tipo_producto: 'auto', prima_actual: 395.00, dias_para_renovacion: 55,
    antiguedad_anos: 3.0, quejas_recientes: 0, siniestros_rechazados: 0,
    competidor_mas_barato: false, sin_uso_app: false, recibos_impagados: 0,
    telefono: '+34 656 432 109', email: 'patricia.vargas@email.com',
    ultimo_contacto: '2026-03-18'
  },
  {
    id: 'CLI-016', nombre: 'Diego Serrano Ortiz', poliza: 'POL-HOGAR-2024-0112',
    tipo_producto: 'hogar', prima_actual: 355.00, dias_para_renovacion: 28,
    antiguedad_anos: 1.8, quejas_recientes: 1, siniestros_rechazados: 0,
    competidor_mas_barato: true, sin_uso_app: true, recibos_impagados: 0,
    telefono: '+34 667 321 098', email: 'diego.serrano@email.com',
    ultimo_contacto: '2026-03-02'
  }
];

// Acciones de retencion ya completadas este mes
const accionesCompletadas = [
  {
    id: 'RET-001', clienteId: 'CLI-002', nombre: 'Carlos Fernandez Ruiz',
    fecha: '2026-03-02', tipo: 'llamada_retencion', resultado: 'retenido',
    descuento_aplicado: 15, prima_original: 320.00, prima_nueva: 272.00,
    agente: 'Sistema IA', notas: 'Cliente acepto descuento del 15% y mejora de coberturas sin coste'
  },
  {
    id: 'RET-002', clienteId: 'CLI-005', nombre: 'Laura Jimenez Torres',
    fecha: '2026-03-04', tipo: 'oferta_proactiva', resultado: 'retenido',
    descuento_aplicado: 10, prima_original: 890.00, prima_nueva: 801.00,
    agente: 'Sistema IA', notas: 'Se ofrecio ampliacion dental sin coste adicional y descuento del 10%'
  },
  {
    id: 'RET-003', clienteId: 'CLI-007', nombre: 'Isabel Navarro Perez',
    fecha: '2026-03-06', tipo: 'llamada_retencion', resultado: 'perdido',
    descuento_aplicado: 0, prima_original: 275.00, prima_nueva: 0,
    agente: 'Sistema IA', notas: 'Cliente decidio cambiar a Mutua Madrilena por precio inferior'
  },
  {
    id: 'RET-004', clienteId: 'CLI-010', nombre: 'Francisco Morales Gil',
    fecha: '2026-03-08', tipo: 'email_personalizado', resultado: 'retenido',
    descuento_aplicado: 8, prima_original: 380.00, prima_nueva: 349.60,
    agente: 'Sistema IA', notas: 'Respuesta positiva al email con oferta de fidelidad del 8%'
  },
  {
    id: 'RET-005', clienteId: 'CLI-014', nombre: 'Miguel Torres Blanco',
    fecha: '2026-03-10', tipo: 'llamada_retencion', resultado: 'retenido',
    descuento_aplicado: 12, prima_original: 980.00, prima_nueva: 862.40,
    agente: 'Sistema IA', notas: 'Se nego plan pago trimestral sin recargo y descuento 12%'
  },
  {
    id: 'RET-006', clienteId: 'CLI-006', nombre: 'Javier Romero Gutierrez',
    fecha: '2026-03-12', tipo: 'contraoferta', resultado: 'retenido',
    descuento_aplicado: 7, prima_original: 550.00, prima_nueva: 511.50,
    agente: 'Sistema IA', notas: 'Igualamos precio de la competencia con descuento del 7%'
  },
  {
    id: 'RET-007', clienteId: 'CLI-013', nombre: 'Lucia Hernandez Ramos',
    fecha: '2026-03-14', tipo: 'mejora_coberturas', resultado: 'retenido',
    descuento_aplicado: 0, prima_original: 520.00, prima_nueva: 520.00,
    agente: 'Sistema IA', notas: 'Se amplio capital asegurado un 20% sin incremento de prima por fidelidad'
  },
  {
    id: 'RET-008', clienteId: 'CLI-012', nombre: 'Antonio Lopez Marin',
    fecha: '2026-03-15', tipo: 'llamada_retencion', resultado: 'pendiente',
    descuento_aplicado: 0, prima_original: 640.00, prima_nueva: 640.00,
    agente: 'Sistema IA', notas: 'Cliente solicito tiempo para comparar. Seguimiento programado para 20/03'
  }
];

// ---------------------------------------------------------------------------
// Calculo del score de riesgo de cancelacion (0-100)
// ---------------------------------------------------------------------------
function calcularScoreRiesgo(cliente) {
  let score = 0;
  const motivos = [];

  // Quejas recientes (0-25 puntos)
  if (cliente.quejas_recientes >= 4) {
    score += 25;
    motivos.push('Multiples quejas recientes (' + cliente.quejas_recientes + ')');
  } else if (cliente.quejas_recientes >= 2) {
    score += 15;
    motivos.push('Quejas recientes (' + cliente.quejas_recientes + ')');
  } else if (cliente.quejas_recientes === 1) {
    score += 7;
    motivos.push('Una queja reciente');
  }

  // Siniestros rechazados (0-20 puntos)
  if (cliente.siniestros_rechazados >= 2) {
    score += 20;
    motivos.push('Varios siniestros rechazados (' + cliente.siniestros_rechazados + ')');
  } else if (cliente.siniestros_rechazados === 1) {
    score += 12;
    motivos.push('Un siniestro rechazado');
  }

  // Competidor mas barato (0-15 puntos)
  if (cliente.competidor_mas_barato) {
    score += 15;
    motivos.push('Competidor ofrece precio inferior');
  }

  // Antiguedad baja (0-15 puntos)
  if (cliente.antiguedad_anos < 1) {
    score += 15;
    motivos.push('Antiguedad inferior a 1 ano');
  } else if (cliente.antiguedad_anos < 2) {
    score += 8;
    motivos.push('Antiguedad inferior a 2 anos');
  }

  // Sin uso de la app (0-10 puntos)
  if (cliente.sin_uso_app) {
    score += 10;
    motivos.push('No utiliza la app movil');
  }

  // Recibos impagados (0-15 puntos)
  if (cliente.recibos_impagados >= 2) {
    score += 15;
    motivos.push('Multiples recibos impagados (' + cliente.recibos_impagados + ')');
  } else if (cliente.recibos_impagados === 1) {
    score += 8;
    motivos.push('Un recibo impagado');
  }

  // Proximidad a renovacion amplifica el riesgo
  if (cliente.dias_para_renovacion <= 15) {
    score = Math.min(100, Math.round(score * 1.2));
    motivos.push('Renovacion muy proxima (' + cliente.dias_para_renovacion + ' dias)');
  } else if (cliente.dias_para_renovacion <= 30) {
    score = Math.min(100, Math.round(score * 1.1));
  }

  return {
    score: Math.min(100, score),
    motivos,
    semaforo: score > 60 ? 'rojo' : score >= 30 ? 'amarillo' : 'verde'
  };
}

// ---------------------------------------------------------------------------
// getClientesRiesgo - Devuelve clientes ordenados por score de riesgo
// ---------------------------------------------------------------------------
function getClientesRiesgo() {
  const resultado = clientes.map(c => {
    const { score, motivos, semaforo } = calcularScoreRiesgo(c);
    const descuentoMax = calcularDescuentoInterno(c, score);

    return {
      id: c.id,
      nombre: c.nombre,
      poliza: c.poliza,
      tipo_producto: c.tipo_producto,
      score,
      semaforo,
      motivo_riesgo: motivos,
      dias_para_renovacion: c.dias_para_renovacion,
      prima_actual: c.prima_actual,
      descuento_maximo_aplicable: descuentoMax,
      prima_minima: Math.round(c.prima_actual * (1 - descuentoMax / 100) * 100) / 100,
      telefono: c.telefono,
      ultimo_contacto: c.ultimo_contacto
    };
  });

  resultado.sort((a, b) => b.score - a.score);
  return resultado;
}

// ---------------------------------------------------------------------------
// Calculo interno de descuento maximo sin perder rentabilidad
// ---------------------------------------------------------------------------
function calcularDescuentoInterno(cliente, score) {
  let descuentoBase = 5;

  // A mayor score de riesgo, mas margen para retener
  if (score > 60) {
    descuentoBase = 15;
  } else if (score >= 30) {
    descuentoBase = 10;
  }

  // Primas altas permiten mayor descuento
  if (cliente.prima_actual > 800) {
    descuentoBase += 5;
  } else if (cliente.prima_actual > 500) {
    descuentoBase += 3;
  }

  // Antiguedad alta justifica mayor esfuerzo
  if (cliente.antiguedad_anos >= 5) {
    descuentoBase += 5;
  } else if (cliente.antiguedad_anos >= 3) {
    descuentoBase += 2;
  }

  return Math.min(25, Math.max(5, descuentoBase));
}

// ---------------------------------------------------------------------------
// calcularDescuento - Descuento maximo para un cliente concreto
// ---------------------------------------------------------------------------
function calcularDescuento(clienteId) {
  const cliente = clientes.find(c => c.id === clienteId);
  if (!cliente) {
    return { error: true, mensaje: 'Cliente no encontrado: ' + clienteId };
  }

  const { score, motivos, semaforo } = calcularScoreRiesgo(cliente);
  const descuento = calcularDescuentoInterno(cliente, score);
  const primaConDescuento = Math.round(cliente.prima_actual * (1 - descuento / 100) * 100) / 100;
  const ahorroAnual = Math.round((cliente.prima_actual - primaConDescuento) * 100) / 100;

  return {
    clienteId: cliente.id,
    nombre: cliente.nombre,
    poliza: cliente.poliza,
    score_riesgo: score,
    semaforo,
    prima_actual: cliente.prima_actual,
    descuento_maximo_pct: descuento,
    prima_con_descuento: primaConDescuento,
    ahorro_anual_cliente: ahorroAnual,
    rentabilidad_estimada: descuento <= 15 ? 'positiva' : 'marginal',
    justificacion: motivos,
    recomendacion: descuento >= 15
      ? 'Aplicar descuento maximo junto con mejora de coberturas para maximizar percepcion de valor'
      : 'Aplicar descuento estandar y reforzar servicio postventa'
  };
}

// ---------------------------------------------------------------------------
// contactarCliente - Simula llamada de retencion personalizada
// ---------------------------------------------------------------------------
function contactarCliente(clienteId) {
  const cliente = clientes.find(c => c.id === clienteId);
  if (!cliente) {
    return { error: true, mensaje: 'Cliente no encontrado: ' + clienteId };
  }

  const { score, motivos, semaforo } = calcularScoreRiesgo(cliente);
  const descuento = calcularDescuentoInterno(cliente, score);
  const primaOferta = Math.round(cliente.prima_actual * (1 - descuento / 100) * 100) / 100;

  const argumentosPersonalizados = [];

  if (cliente.competidor_mas_barato) {
    argumentosPersonalizados.push(
      'Entendemos que ha encontrado precios mas competitivos. Podemos ofrecerle una prima de ' +
      primaOferta.toFixed(2) + ' EUR/ano, un ' + descuento + '% menos que su tarifa actual.'
    );
  }
  if (cliente.quejas_recientes > 0) {
    argumentosPersonalizados.push(
      'Lamentamos las incidencias que ha experimentado. Hemos asignado un gestor personal dedicado ' +
      'para garantizar una atencion prioritaria en adelante.'
    );
  }
  if (cliente.siniestros_rechazados > 0) {
    argumentosPersonalizados.push(
      'Hemos revisado su expediente y queremos ofrecerle una cobertura ampliada que cubra supuestos ' +
      'similares a los que fueron declinados anteriormente, sin coste adicional.'
    );
  }
  if (cliente.sin_uso_app) {
    argumentosPersonalizados.push(
      'Le ofrecemos asistencia personalizada para configurar nuestra app movil, donde podra ' +
      'gestionar sus polizas, declarar siniestros y acceder a descuentos exclusivos.'
    );
  }
  if (cliente.recibos_impagados > 0) {
    argumentosPersonalizados.push(
      'Podemos reestructurar su forma de pago. Le ofrecemos fraccionamiento trimestral sin ' +
      'recargo para facilitar la gestion de sus pagos.'
    );
  }
  if (cliente.antiguedad_anos >= 3) {
    argumentosPersonalizados.push(
      'Como cliente fiel de ' + cliente.antiguedad_anos.toFixed(1) + ' anos, tiene acceso a ' +
      'nuestro programa de fidelidad con ventajas exclusivas.'
    );
  }

  if (argumentosPersonalizados.length === 0) {
    argumentosPersonalizados.push(
      'Le ofrecemos renovar su poliza con condiciones mejoradas y acceso a nuestro programa de ventajas.'
    );
  }

  const timestamp = new Date().toISOString();

  const conversacion = [
    {
      paso: 1,
      momento: timestamp,
      emisor: 'agente',
      mensaje: 'Buenos dias, ' + cliente.nombre.split(' ')[0] +
        '. Le llamo de SegurosIA en relacion con su poliza ' + cliente.poliza +
        '. ¿Tiene un momento para hablar?'
    },
    {
      paso: 2,
      momento: timestamp,
      emisor: 'cliente',
      mensaje: score > 60
        ? 'La verdad es que estaba pensando en no renovar. No estoy del todo contento con el servicio.'
        : score >= 30
          ? 'Si, digame. Estaba esperando noticias sobre mi renovacion.'
          : 'Si, claro. ¿De que se trata?'
    },
    {
      paso: 3,
      momento: timestamp,
      emisor: 'agente',
      mensaje: 'Entiendo perfectamente, ' + cliente.nombre.split(' ')[0] +
        '. Precisamente le llamo porque queremos asegurarnos de que esta satisfecho. ' +
        argumentosPersonalizados[0]
    }
  ];

  if (argumentosPersonalizados.length > 1) {
    conversacion.push({
      paso: 4,
      momento: timestamp,
      emisor: 'agente',
      mensaje: 'Ademas, ' + argumentosPersonalizados[1]
    });
  }

  const respuestaCliente = score > 70
    ? 'Bueno, eso suena interesante pero necesito pensarlo. ¿Me puede enviar la oferta por escrito?'
    : score > 40
      ? 'Me parece una buena propuesta. ¿Eso seria a partir de la proxima renovacion?'
      : 'Perfecto, me parece bien. Pueden proceder con la renovacion.';

  conversacion.push({
    paso: conversacion.length + 1,
    momento: timestamp,
    emisor: 'cliente',
    mensaje: respuestaCliente
  });

  const cierreAgente = score > 70
    ? 'Por supuesto. Le envio ahora mismo un email a ' + cliente.email +
      ' con todos los detalles. Le llamare en 48 horas para resolver cualquier duda. ' +
      'Recuerde que su renovacion es en ' + cliente.dias_para_renovacion + ' dias.'
    : 'Perfecto, procedemos con la renovacion en las nuevas condiciones. ' +
      'Recibira la documentacion actualizada en su email ' + cliente.email +
      ' en las proximas 24 horas.';

  conversacion.push({
    paso: conversacion.length + 1,
    momento: timestamp,
    emisor: 'agente',
    mensaje: cierreAgente
  });

  const resultadoPreliminar = score > 70 ? 'pendiente' : 'retenido';

  return {
    clienteId: cliente.id,
    nombre: cliente.nombre,
    poliza: cliente.poliza,
    score_riesgo: score,
    semaforo,
    resultado_preliminar: resultadoPreliminar,
    descuento_ofrecido: descuento,
    prima_ofertada: primaOferta,
    argumentos_utilizados: argumentosPersonalizados,
    conversacion,
    siguiente_accion: resultadoPreliminar === 'pendiente'
      ? 'Seguimiento telefonico en 48 horas'
      : 'Emitir documentacion de renovacion',
    fecha_contacto: new Date().toISOString().split('T')[0]
  };
}

// ---------------------------------------------------------------------------
// getEstadisticas - Metricas del programa de retencion
// ---------------------------------------------------------------------------
function getEstadisticas() {
  const clientesConRiesgo = clientes.map(c => {
    const { score, semaforo } = calcularScoreRiesgo(c);
    return { ...c, score, semaforo };
  });

  const enRiesgo = clientesConRiesgo.filter(c => c.score >= 30);
  const rojos = clientesConRiesgo.filter(c => c.semaforo === 'rojo');
  const amarillos = clientesConRiesgo.filter(c => c.semaforo === 'amarillo');
  const verdes = clientesConRiesgo.filter(c => c.semaforo === 'verde');

  const retenidos = accionesCompletadas.filter(a => a.resultado === 'retenido');
  const perdidos = accionesCompletadas.filter(a => a.resultado === 'perdido');
  const pendientes = accionesCompletadas.filter(a => a.resultado === 'pendiente');

  const valorCarteraRiesgo = enRiesgo.reduce((sum, c) => sum + c.prima_actual, 0);
  const valorRetenido = retenidos.reduce((sum, a) => sum + a.prima_nueva, 0);
  const valorPerdido = perdidos.reduce((sum, a) => sum + a.prima_original, 0);
  const ahorroDescuentos = retenidos.reduce((sum, a) => sum + (a.prima_original - a.prima_nueva), 0);

  return {
    resumen: {
      total_clientes_cartera: clientes.length,
      clientes_en_riesgo: enRiesgo.length,
      distribucion_semaforo: {
        rojo: rojos.length,
        amarillo: amarillos.length,
        verde: verdes.length
      }
    },
    acciones_mes: {
      total_acciones: accionesCompletadas.length,
      retenidos_este_mes: retenidos.length,
      perdidos_este_mes: perdidos.length,
      pendientes: pendientes.length,
      tasa_retencion: accionesCompletadas.length > 0
        ? Math.round((retenidos.length / (retenidos.length + perdidos.length)) * 100) + '%'
        : '0%'
    },
    valor_economico: {
      valor_cartera_riesgo: Math.round(valorCarteraRiesgo * 100) / 100,
      valor_retenido: Math.round(valorRetenido * 100) / 100,
      valor_perdido: Math.round(valorPerdido * 100) / 100,
      coste_descuentos_aplicados: Math.round(ahorroDescuentos * 100) / 100,
      roi_programa: Math.round(valorRetenido / (ahorroDescuentos || 1) * 100) / 100
    },
    alertas_urgentes: rojos
      .filter(c => c.dias_para_renovacion <= 15)
      .map(c => ({
        id: c.id,
        nombre: c.nombre,
        dias_para_renovacion: c.dias_para_renovacion,
        score: c.score,
        prima: c.prima_actual
      })),
    acciones_completadas: accionesCompletadas
  };
}

module.exports = {
  getClientesRiesgo,
  contactarCliente,
  calcularDescuento,
  getEstadisticas,
  calcularScoreRiesgo
};
