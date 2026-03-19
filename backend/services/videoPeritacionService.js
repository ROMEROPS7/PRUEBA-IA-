// =============================================================================
// Video Peritacion Service - Peritacion Virtual por Video
// Sesiones de valoracion de danos por videoconferencia con IA,
// analisis de frames, guia al cliente y generacion de informes
// =============================================================================

const TIPOS_DANO = {
  abolladura: { min: 200, max: 800, descripcion: 'Deformacion en la carroceria por impacto' },
  aranazo: { min: 100, max: 400, descripcion: 'Dano superficial en la pintura' },
  rotura_cristal: { min: 150, max: 600, descripcion: 'Cristal roto o agrietado' },
  dano_mecanico: { min: 500, max: 3000, descripcion: 'Dano en componentes mecanicos o estructurales' },
  dano_agua: { min: 800, max: 5000, descripcion: 'Danos causados por inundacion o filtracion de agua' },
  quemadura: { min: 1000, max: 8000, descripcion: 'Danos por fuego, calor excesivo o cortocircuito' }
};

const PASOS_GUIA = [
  { paso: 1, instruccion: 'Muestrame el frontal completo del vehiculo a unos 2 metros de distancia.', zona: 'frontal', duracion_estimada_seg: 30 },
  { paso: 2, instruccion: 'Ahora acercate al dano principal para que pueda ver los detalles.', zona: 'detalle_dano', duracion_estimada_seg: 45 },
  { paso: 3, instruccion: 'Muestrame el lateral derecho completo, de delante hacia atras.', zona: 'lateral_derecho', duracion_estimada_seg: 30 },
  { paso: 4, instruccion: 'Ahora el lateral izquierdo, mismo recorrido por favor.', zona: 'lateral_izquierdo', duracion_estimada_seg: 30 },
  { paso: 5, instruccion: 'Muestrame la parte trasera del vehiculo.', zona: 'trasera', duracion_estimada_seg: 25 },
  { paso: 6, instruccion: 'Acercate mas al dano que hemos detectado. Necesito ver la profundidad.', zona: 'detalle_profundidad', duracion_estimada_seg: 40 },
  { paso: 7, instruccion: 'Ahora necesito ver el interior del vehiculo: salpicadero y zona de impacto.', zona: 'interior', duracion_estimada_seg: 35 },
  { paso: 8, instruccion: 'Por ultimo, muestrame el kilometraje en el cuadro de mandos y la documentacion del vehiculo.', zona: 'documentacion', duracion_estimada_seg: 20 }
];

let contadorSesiones = 8;

const sesiones = [
  {
    id: 'VPER-001', siniestroId: 'SIN-2025-0312', clienteId: 'CLI-001', estado: 'completada',
    fecha_inicio: '2025-07-10T10:00:00Z', fecha_fin: '2025-07-10T10:18:00Z',
    danos_detectados: [
      { tipo: 'abolladura', ubicacion: 'Puerta delantera derecha', severidad: 'media', coste_estimado: 520 },
      { tipo: 'aranazo', ubicacion: 'Paragolpes delantero', severidad: 'leve', coste_estimado: 180 }
    ],
    fotos_capturadas: 12, coste_estimado: 700, informe_generado: true, duracion_min: 18, ahorro_vs_fisico: 355
  },
  {
    id: 'VPER-002', siniestroId: 'SIN-2025-0415', clienteId: 'CLI-002', estado: 'completada',
    fecha_inicio: '2025-07-15T14:30:00Z', fecha_fin: '2025-07-15T14:52:00Z',
    danos_detectados: [
      { tipo: 'rotura_cristal', ubicacion: 'Parabrisas delantero', severidad: 'grave', coste_estimado: 480 },
      { tipo: 'abolladura', ubicacion: 'Capo', severidad: 'grave', coste_estimado: 750 },
      { tipo: 'dano_mecanico', ubicacion: 'Sistema de refrigeracion', severidad: 'media', coste_estimado: 1200 }
    ],
    fotos_capturadas: 18, coste_estimado: 2430, informe_generado: true, duracion_min: 22, ahorro_vs_fisico: 355
  },
  {
    id: 'VPER-003', siniestroId: 'SIN-2025-0523', clienteId: 'CLI-003', estado: 'completada',
    fecha_inicio: '2025-08-01T09:15:00Z', fecha_fin: '2025-08-01T09:28:00Z',
    danos_detectados: [
      { tipo: 'aranazo', ubicacion: 'Puerta trasera izquierda', severidad: 'leve', coste_estimado: 150 },
      { tipo: 'aranazo', ubicacion: 'Paso de rueda trasero', severidad: 'leve', coste_estimado: 120 }
    ],
    fotos_capturadas: 8, coste_estimado: 270, informe_generado: true, duracion_min: 13, ahorro_vs_fisico: 355
  },
  {
    id: 'VPER-004', siniestroId: 'SIN-2025-0601', clienteId: 'CLI-004', estado: 'completada',
    fecha_inicio: '2025-08-10T11:00:00Z', fecha_fin: '2025-08-10T11:35:00Z',
    danos_detectados: [
      { tipo: 'dano_agua', ubicacion: 'Interior completo - tapiceria y electronica', severidad: 'grave', coste_estimado: 3800 },
      { tipo: 'dano_mecanico', ubicacion: 'Motor - centralita electronica', severidad: 'grave', coste_estimado: 2200 }
    ],
    fotos_capturadas: 22, coste_estimado: 6000, informe_generado: true, duracion_min: 35, ahorro_vs_fisico: 355
  },
  {
    id: 'VPER-005', siniestroId: 'SIN-2025-0718', clienteId: 'CLI-005', estado: 'completada',
    fecha_inicio: '2025-08-20T16:00:00Z', fecha_fin: '2025-08-20T16:20:00Z',
    danos_detectados: [
      { tipo: 'quemadura', ubicacion: 'Compartimento motor', severidad: 'grave', coste_estimado: 5500 },
      { tipo: 'rotura_cristal', ubicacion: 'Faro delantero izquierdo', severidad: 'media', coste_estimado: 350 }
    ],
    fotos_capturadas: 15, coste_estimado: 5850, informe_generado: true, duracion_min: 20, ahorro_vs_fisico: 355
  },
  {
    id: 'VPER-006', siniestroId: 'SIN-2025-0802', clienteId: 'CLI-006', estado: 'completada',
    fecha_inicio: '2025-09-01T10:30:00Z', fecha_fin: '2025-09-01T10:45:00Z',
    danos_detectados: [
      { tipo: 'abolladura', ubicacion: 'Paragolpes trasero', severidad: 'leve', coste_estimado: 280 },
      { tipo: 'aranazo', ubicacion: 'Portón trasero', severidad: 'leve', coste_estimado: 200 }
    ],
    fotos_capturadas: 10, coste_estimado: 480, informe_generado: true, duracion_min: 15, ahorro_vs_fisico: 355
  },
  {
    id: 'VPER-007', siniestroId: 'SIN-2025-0815', clienteId: 'CLI-007', estado: 'completada',
    fecha_inicio: '2025-09-05T13:00:00Z', fecha_fin: '2025-09-05T13:25:00Z',
    danos_detectados: [
      { tipo: 'dano_mecanico', ubicacion: 'Suspension delantera derecha', severidad: 'grave', coste_estimado: 1800 },
      { tipo: 'abolladura', ubicacion: 'Aleta delantera derecha', severidad: 'media', coste_estimado: 600 },
      { tipo: 'rotura_cristal', ubicacion: 'Retrovisor derecho', severidad: 'media', coste_estimado: 250 }
    ],
    fotos_capturadas: 16, coste_estimado: 2650, informe_generado: true, duracion_min: 25, ahorro_vs_fisico: 355
  },
  {
    id: 'VPER-008', siniestroId: 'SIN-2025-0901', clienteId: 'CLI-008', estado: 'completada',
    fecha_inicio: '2025-09-10T09:00:00Z', fecha_fin: '2025-09-10T09:12:00Z',
    danos_detectados: [
      { tipo: 'aranazo', ubicacion: 'Lateral izquierdo completo', severidad: 'media', coste_estimado: 380 }
    ],
    fotos_capturadas: 7, coste_estimado: 380, informe_generado: true, duracion_min: 12, ahorro_vs_fisico: 355
  }
];

/**
 * Inicia una nueva sesion de video peritacion
 */
function iniciarSesion(siniestroId) {
  if (!siniestroId) {
    return { error: 'Se requiere el ID del siniestro para iniciar la sesion' };
  }

  contadorSesiones++;
  const sesion = {
    id: `VPER-${String(contadorSesiones).padStart(3, '0')}`,
    siniestroId,
    clienteId: null,
    estado: 'iniciada',
    fecha_inicio: new Date().toISOString(),
    fecha_fin: null,
    danos_detectados: [],
    fotos_capturadas: 0,
    coste_estimado: 0,
    informe_generado: false,
    duracion_min: 0,
    ahorro_vs_fisico: 0,
    paso_actual: 1
  };

  sesiones.push(sesion);

  return {
    sesion,
    instrucciones_iniciales: {
      bienvenida: 'Bienvenido a la peritacion virtual. Voy a guiarle paso a paso para valorar los danos de su vehiculo.',
      requisitos: [
        'Asegurese de tener buena iluminacion (preferiblemente luz natural)',
        'Mantenga el telefono estable durante la captura',
        'Siga las instrucciones de encuadre que le ire indicando',
        'El proceso dura aproximadamente 15-20 minutos'
      ],
      primer_paso: PASOS_GUIA[0]
    }
  };
}

/**
 * Analiza un frame/foto de la sesion de video
 */
function analizarFrame(sessionId, imageData) {
  if (!sessionId) {
    return { error: 'Se requiere el ID de la sesion' };
  }

  const sesion = sesiones.find(s => s.id === sessionId);
  if (!sesion) {
    return { error: `Sesion ${sessionId} no encontrada` };
  }

  if (sesion.estado === 'completada') {
    return { error: 'La sesion ya esta completada. No se pueden analizar mas frames.' };
  }

  // Actualizar estado
  if (sesion.estado === 'iniciada') {
    sesion.estado = 'en_curso';
  }

  sesion.fotos_capturadas++;

  // Simular deteccion de danos con probabilidad realista
  const danos_detectados = [];
  const tiposDano = Object.keys(TIPOS_DANO);
  const probabilidadDano = 0.45; // 45% de probabilidad de detectar dano en cada frame

  if (Math.random() < probabilidadDano) {
    const tipoDano = tiposDano[Math.floor(Math.random() * tiposDano.length)];
    const rango = TIPOS_DANO[tipoDano];
    const coste = Math.round(rango.min + Math.random() * (rango.max - rango.min));

    const ubicaciones = [
      'Paragolpes delantero', 'Paragolpes trasero', 'Puerta delantera derecha',
      'Puerta delantera izquierda', 'Puerta trasera derecha', 'Puerta trasera izquierda',
      'Capo', 'Maletero', 'Aleta delantera derecha', 'Aleta delantera izquierda',
      'Techo', 'Lateral derecho', 'Lateral izquierdo', 'Parabrisas',
      'Faro delantero', 'Piloto trasero', 'Retrovisor'
    ];

    const severidades = ['leve', 'media', 'grave'];
    const severidad = severidades[Math.floor(Math.random() * severidades.length)];

    const dano = {
      tipo: tipoDano,
      ubicacion: ubicaciones[Math.floor(Math.random() * ubicaciones.length)],
      severidad,
      coste_estimado: coste,
      descripcion: TIPOS_DANO[tipoDano].descripcion,
      confianza_deteccion: Math.round((Math.random() * 0.2 + 0.78) * 100) / 100
    };

    danos_detectados.push(dano);
    sesion.danos_detectados.push(dano);
    sesion.coste_estimado = sesion.danos_detectados.reduce((sum, d) => sum + d.coste_estimado, 0);
  }

  // Determinar siguiente instruccion
  const pasoActual = sesion.paso_actual || 1;
  const siguientePaso = pasoActual < PASOS_GUIA.length ? PASOS_GUIA[pasoActual] : null;
  if (pasoActual < PASOS_GUIA.length) {
    sesion.paso_actual = pasoActual + 1;
  }

  const confianza = Math.round((Math.random() * 0.15 + 0.82) * 100) / 100;

  return {
    frame_numero: sesion.fotos_capturadas,
    danos_detectados,
    confianza,
    calidad_imagen: confianza > 0.90 ? 'buena' : confianza > 0.85 ? 'aceptable' : 'mejorable',
    instruccion_siguiente: siguientePaso
      ? siguientePaso.instruccion
      : 'Hemos completado el recorrido. Generando informe de valoracion...',
    coste_acumulado: sesion.coste_estimado,
    total_danos_detectados: sesion.danos_detectados.length,
    timestamp: new Date().toISOString()
  };
}

/**
 * Genera el informe completo de la peritacion
 */
function generarInforme(sessionId) {
  if (!sessionId) {
    return { error: 'Se requiere el ID de la sesion' };
  }

  const sesion = sesiones.find(s => s.id === sessionId);
  if (!sesion) {
    return { error: `Sesion ${sessionId} no encontrada` };
  }

  // Marcar como completada
  sesion.estado = 'completada';
  sesion.fecha_fin = new Date().toISOString();
  sesion.informe_generado = true;

  // Calcular duracion
  const inicio = new Date(sesion.fecha_inicio);
  const fin = new Date(sesion.fecha_fin);
  sesion.duracion_min = Math.round((fin - inicio) / 60000);

  // Calcular ahorro
  const costePeritacionFisica = 450;
  const costePeritacionVirtual = 95;
  sesion.ahorro_vs_fisico = costePeritacionFisica - costePeritacionVirtual;

  // Agrupar danos por severidad
  const resumenSeveridad = { leve: [], media: [], grave: [] };
  sesion.danos_detectados.forEach(d => {
    if (resumenSeveridad[d.severidad]) {
      resumenSeveridad[d.severidad].push(d);
    }
  });

  return {
    informe: {
      id_informe: `INF-${sessionId}`,
      sesion_id: sesion.id,
      siniestro_id: sesion.siniestroId,
      fecha_generacion: new Date().toISOString(),
      resumen: {
        total_danos: sesion.danos_detectados.length,
        coste_total_estimado: sesion.coste_estimado,
        fotos_analizadas: sesion.fotos_capturadas,
        duracion_sesion_min: sesion.duracion_min,
        danos_leves: resumenSeveridad.leve.length,
        danos_medios: resumenSeveridad.media.length,
        danos_graves: resumenSeveridad.grave.length
      },
      detalle_danos: sesion.danos_detectados.map((d, i) => ({
        numero: i + 1,
        ...d,
        foto_referencia: `foto_${String(i + 1).padStart(2, '0')}.jpg`
      })),
      valoracion_economica: {
        subtotal_reparacion: sesion.coste_estimado,
        iva_21: Math.round(sesion.coste_estimado * 0.21),
        total_con_iva: Math.round(sesion.coste_estimado * 1.21),
        franquicia_aplicable: 300,
        total_a_cargo_aseguradora: Math.max(0, Math.round(sesion.coste_estimado * 1.21) - 300)
      },
      ahorro: {
        coste_peritacion_virtual: costePeritacionVirtual,
        coste_peritacion_fisica: costePeritacionFisica,
        ahorro_por_sesion: sesion.ahorro_vs_fisico,
        porcentaje_ahorro: Math.round((sesion.ahorro_vs_fisico / costePeritacionFisica) * 100)
      },
      recomendaciones: generarRecomendaciones(sesion.danos_detectados),
      firma_digital: `PERITO-IA-${Date.now()}`,
      validez_informe: 'Este informe tiene caracter orientativo. La valoracion definitiva puede requerir inspeccion presencial para danos mecanicos graves.'
    }
  };
}

function generarRecomendaciones(danos) {
  const recomendaciones = [];

  if (danos.some(d => d.severidad === 'grave')) {
    recomendaciones.push('Se recomienda inspeccion presencial complementaria para confirmar danos graves detectados.');
  }
  if (danos.some(d => d.tipo === 'dano_mecanico')) {
    recomendaciones.push('Los danos mecanicos detectados requieren revision en taller autorizado antes de circular.');
  }
  if (danos.some(d => d.tipo === 'rotura_cristal')) {
    recomendaciones.push('La rotura de cristal debe repararse de forma prioritaria por seguridad vial.');
  }
  if (danos.some(d => d.tipo === 'dano_agua')) {
    recomendaciones.push('Los danos por agua pueden agravarse con el tiempo. Se recomienda actuacion inmediata.');
  }
  if (danos.some(d => d.tipo === 'quemadura')) {
    recomendaciones.push('ATENCION: Danos por fuego detectados. Verificar que el vehiculo no presenta riesgo de combustion.');
  }
  if (danos.length === 0) {
    recomendaciones.push('No se han detectado danos visibles en la sesion. Considerar inspeccion presencial si el cliente reporta danos.');
  }
  if (danos.length <= 2 && danos.every(d => d.severidad === 'leve')) {
    recomendaciones.push('Danos menores detectados. Reparacion rapida recomendada en taller de chapa y pintura.');
  }

  return recomendaciones;
}

/**
 * Calcula el ahorro de la peritacion virtual vs fisica
 */
function getAhorro() {
  const completadas = sesiones.filter(s => s.estado === 'completada');
  const totalSesiones = completadas.length;

  const costePromedioVirtual = 95;
  const costePromedioFisico = 450;
  const ahorroPorSesion = costePromedioFisico - costePromedioVirtual;
  const ahorroTotal = ahorroPorSesion * totalSesiones;

  const duraciones = completadas.map(s => s.duracion_min).filter(d => d > 0);
  const duracionPromedio = duraciones.length > 0 ? Math.round(duraciones.reduce((a, b) => a + b, 0) / duraciones.length) : 0;

  return {
    coste_promedio_virtual: costePromedioVirtual,
    coste_promedio_fisico: costePromedioFisico,
    ahorro_por_sesion: ahorroPorSesion,
    porcentaje_ahorro: Math.round((ahorroPorSesion / costePromedioFisico) * 100),
    total_sesiones_completadas: totalSesiones,
    ahorro_total_acumulado: ahorroTotal,
    tiempo_promedio_virtual_min: duracionPromedio,
    tiempo_promedio_fisico_min: 120,
    ahorro_tiempo_min: 120 - duracionPromedio,
    satisfaccion_cliente: 4.6,
    precision_valoracion: 94.2,
    moneda: 'EUR'
  };
}

/**
 * Proporciona instrucciones guiadas por IA al cliente durante la sesion
 */
function guiarCliente(sessionId, paso) {
  if (!sessionId) {
    return { error: 'Se requiere el ID de la sesion' };
  }

  const sesion = sesiones.find(s => s.id === sessionId);
  if (!sesion) {
    return { error: `Sesion ${sessionId} no encontrada` };
  }

  const numeroPaso = parseInt(paso) || sesion.paso_actual || 1;

  if (numeroPaso < 1 || numeroPaso > PASOS_GUIA.length) {
    return {
      error: `Paso invalido. Los pasos disponibles van del 1 al ${PASOS_GUIA.length}.`,
      total_pasos: PASOS_GUIA.length
    };
  }

  const pasoActual = PASOS_GUIA[numeroPaso - 1];
  const progreso = Math.round((numeroPaso / PASOS_GUIA.length) * 100);

  // Consejos contextuales segun la zona
  const consejosZona = {
    frontal: 'Intente capturar ambos faros y la matricula en el encuadre.',
    detalle_dano: 'Acerquese a unos 30cm del dano. La IA necesita ver la textura y profundidad.',
    lateral_derecho: 'Camine lentamente de delante hacia atras manteniendo el telefono a la altura de la cintura.',
    lateral_izquierdo: 'Mismo recorrido que el lateral derecho. Preste atencion a posibles danos ocultos.',
    trasera: 'Capture los pilotos traseros, la matricula y el paragolpes.',
    detalle_profundidad: 'Si es posible, coloque una moneda junto al dano para referencia de tamano.',
    interior: 'Muestre el salpicadero, los asientos y cualquier zona afectada por el siniestro.',
    documentacion: 'Necesitamos ver el kilometraje actual y la fecha de la ultima ITV.'
  };

  sesion.paso_actual = numeroPaso;

  return {
    sesion_id: sessionId,
    paso: numeroPaso,
    total_pasos: PASOS_GUIA.length,
    progreso_porcentaje: progreso,
    instruccion: pasoActual.instruccion,
    zona: pasoActual.zona,
    duracion_estimada_seg: pasoActual.duracion_estimada_seg,
    consejo: consejosZona[pasoActual.zona] || '',
    siguiente_paso: numeroPaso < PASOS_GUIA.length ? PASOS_GUIA[numeroPaso].instruccion : null,
    es_ultimo_paso: numeroPaso === PASOS_GUIA.length,
    mensaje_progreso: numeroPaso === PASOS_GUIA.length
      ? 'Ultimo paso. Tras completarlo, generaremos su informe de valoracion.'
      : `Paso ${numeroPaso} de ${PASOS_GUIA.length}. Vamos muy bien, continue asi.`
  };
}

module.exports = {
  iniciarSesion,
  analizarFrame,
  generarInforme,
  getAhorro,
  guiarCliente,
  sesiones,
  TIPOS_DANO,
  PASOS_GUIA
};
