// ============================================================
// ML Service - SiniestrosAI
// Servicio de Machine Learning con modelos por tenant
// ============================================================

// Generar 12 semanas de datos de evolucion (de ~72% a ~94%)
function generarEvolucion(seed) {
  const semanas = [];
  const baseFraude = 0.72 + (seed * 0.01);
  const baseClasificacion = 0.70 + (seed * 0.015);
  const baseValoracion = 0.68 + (seed * 0.02);

  for (let i = 0; i < 12; i++) {
    const progreso = i / 11;
    const ruido = () => (Math.sin(seed * 17 + i * 3.7) * 0.008);

    const fraude = Math.min(0.96, baseFraude + progreso * 0.22 + ruido());
    const clasificacion = Math.min(0.95, baseClasificacion + progreso * 0.24 + ruido());
    const valoracion = Math.min(0.93, baseValoracion + progreso * 0.23 + ruido());

    const fecha = new Date('2026-01-05');
    fecha.setDate(fecha.getDate() + i * 7);

    semanas.push({
      semana: i + 1,
      fecha: fecha.toISOString().split('T')[0],
      precision_fraude: parseFloat((fraude * 100).toFixed(1)),
      precision_clasificacion: parseFloat((clasificacion * 100).toFixed(1)),
      precision_valoracion: parseFloat((valoracion * 100).toFixed(1)),
      patrones_detectados: 45 + Math.floor(i * 8.5 + seed * 3),
      muestras_entrenamiento: 1200 + i * 340 + seed * 100,
      falsos_positivos: Math.max(1, 18 - Math.floor(i * 1.3)),
      falsos_negativos: Math.max(0, 12 - Math.floor(i * 0.9))
    });
  }
  return semanas;
}

const tenants = {
  'tenant-001': {
    tenantId: 'tenant-001',
    nombre: 'Seguros Iberia S.A.',
    precision_fraude: 94.2,
    precision_clasificacion: 93.8,
    precision_valoracion: 91.5,
    patrones_detectados: 187,
    semanas_entrenamiento: 12,
    mejora_semanal: 1.8,
    modelo_version: 'v3.2.1',
    ultimo_entrenamiento: '2026-03-17T03:00:00Z',
    total_predicciones: 4523,
    predicciones_correctas: 4261,
    evolucion: generarEvolucion(1)
  },
  'tenant-002': {
    tenantId: 'tenant-002',
    nombre: 'MutualPlus Aseguradora',
    precision_fraude: 93.7,
    precision_clasificacion: 94.1,
    precision_valoracion: 90.8,
    patrones_detectados: 162,
    semanas_entrenamiento: 12,
    mejora_semanal: 1.6,
    modelo_version: 'v3.2.0',
    ultimo_entrenamiento: '2026-03-16T03:00:00Z',
    total_predicciones: 3891,
    predicciones_correctas: 3647,
    evolucion: generarEvolucion(2)
  },
  'tenant-003': {
    tenantId: 'tenant-003',
    nombre: 'Proteccion Nacional Seguros',
    precision_fraude: 94.5,
    precision_clasificacion: 93.2,
    precision_valoracion: 92.1,
    patrones_detectados: 198,
    semanas_entrenamiento: 12,
    mejora_semanal: 2.0,
    modelo_version: 'v3.2.1',
    ultimo_entrenamiento: '2026-03-18T03:00:00Z',
    total_predicciones: 5210,
    predicciones_correctas: 4926,
    evolucion: generarEvolucion(3)
  }
};

// Predicciones por siniestro (cache simulado)
const prediccionesCache = {
  'SIN-2026-0312': {
    siniestro_id: 'SIN-2026-0312',
    tiempo_resolucion_estimado: '8 dias',
    tiempo_resolucion_dias: 8,
    coste_estimado: 3450.00,
    rango_coste: { min: 2800, max: 4100 },
    probabilidad_fraude: 0.03,
    nivel_fraude: 'bajo',
    perito_recomendado: { id: 'PER-012', nombre: 'Laura Sanchez', especialidad: 'auto', carga_actual: 6, rating: 4.8 },
    confianza: 0.91,
    factores_clave: ['historial_limpio', 'documentacion_completa', 'zona_baja_siniestralidad'],
    clasificacion_automatica: 'auto_colision_frontal',
    prioridad_sugerida: 'media'
  },
  'SIN-2026-0298': {
    siniestro_id: 'SIN-2026-0298',
    tiempo_resolucion_estimado: '5 dias',
    tiempo_resolucion_dias: 5,
    coste_estimado: 1920.00,
    rango_coste: { min: 1500, max: 2400 },
    probabilidad_fraude: 0.02,
    nivel_fraude: 'bajo',
    perito_recomendado: { id: 'PER-008', nombre: 'Miguel Torres', especialidad: 'hogar', carga_actual: 4, rating: 4.6 },
    confianza: 0.94,
    factores_clave: ['dano_tipico', 'poliza_vigente', 'cliente_antiguo'],
    clasificacion_automatica: 'hogar_danos_agua',
    prioridad_sugerida: 'baja'
  },
  'SIN-2026-0340': {
    siniestro_id: 'SIN-2026-0340',
    tiempo_resolucion_estimado: '12 dias',
    tiempo_resolucion_dias: 12,
    coste_estimado: 5200.00,
    rango_coste: { min: 4000, max: 6500 },
    probabilidad_fraude: 0.08,
    nivel_fraude: 'bajo',
    perito_recomendado: { id: 'PER-003', nombre: 'Carlos Mendez', especialidad: 'auto', carga_actual: 8, rating: 4.9 },
    confianza: 0.87,
    factores_clave: ['accidente_multiple', 'testigos_presentes', 'parte_amistoso'],
    clasificacion_automatica: 'auto_colision_multiple',
    prioridad_sugerida: 'alta'
  },
  'SIN-2026-0355': {
    siniestro_id: 'SIN-2026-0355',
    tiempo_resolucion_estimado: '18 dias',
    tiempo_resolucion_dias: 18,
    coste_estimado: 9500.00,
    rango_coste: { min: 7500, max: 12000 },
    probabilidad_fraude: 0.05,
    nivel_fraude: 'bajo',
    perito_recomendado: { id: 'PER-011', nombre: 'Ana Belen Ruiz', especialidad: 'hogar', carga_actual: 5, rating: 4.7 },
    confianza: 0.83,
    factores_clave: ['danos_extensos', 'multiples_estancias', 'requiere_rehabilitacion'],
    clasificacion_automatica: 'hogar_inundacion_grave',
    prioridad_sugerida: 'alta'
  },
  'SIN-2026-0390': {
    siniestro_id: 'SIN-2026-0390',
    tiempo_resolucion_estimado: '25 dias',
    tiempo_resolucion_dias: 25,
    coste_estimado: 18500.00,
    rango_coste: { min: 16000, max: 21000 },
    probabilidad_fraude: 0.42,
    nivel_fraude: 'alto',
    perito_recomendado: { id: 'PER-001', nombre: 'Fernando Diaz', especialidad: 'investigacion_fraude', carga_actual: 3, rating: 4.95 },
    confianza: 0.78,
    factores_clave: ['robo_vehiculo', 'zona_alta_siniestralidad', 'poliza_reciente', 'importe_elevado'],
    clasificacion_automatica: 'auto_robo_vehiculo',
    prioridad_sugerida: 'critica',
    alerta_fraude: 'Se detectan patrones compatibles con fraude: poliza contratada hace 45 dias, vehiculo de alto valor, zona con historico de robos ficticios.'
  }
};

function getEstadisticas(tenantId) {
  const tenant = tenants[tenantId];
  if (!tenant) {
    return { error: true, mensaje: `Tenant ${tenantId} no encontrado` };
  }

  const ultimaSemana = tenant.evolucion[tenant.evolucion.length - 1];

  return {
    tenantId: tenant.tenantId,
    nombre: tenant.nombre,
    modelo_version: tenant.modelo_version,
    ultimo_entrenamiento: tenant.ultimo_entrenamiento,
    metricas: {
      precision_fraude: tenant.precision_fraude,
      precision_clasificacion: tenant.precision_clasificacion,
      precision_valoracion: tenant.precision_valoracion,
      precision_global: parseFloat(((tenant.precision_fraude + tenant.precision_clasificacion + tenant.precision_valoracion) / 3).toFixed(1))
    },
    rendimiento: {
      total_predicciones: tenant.total_predicciones,
      predicciones_correctas: tenant.predicciones_correctas,
      tasa_acierto: parseFloat((tenant.predicciones_correctas / tenant.total_predicciones * 100).toFixed(1)),
      patrones_detectados: tenant.patrones_detectados,
      falsos_positivos: ultimaSemana.falsos_positivos,
      falsos_negativos: ultimaSemana.falsos_negativos
    },
    entrenamiento: {
      semanas_entrenamiento: tenant.semanas_entrenamiento,
      mejora_semanal: tenant.mejora_semanal,
      muestras_totales: ultimaSemana.muestras_entrenamiento,
      proximo_entrenamiento: new Date(new Date(tenant.ultimo_entrenamiento).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  };
}

function entrenar(tenantId) {
  const tenant = tenants[tenantId];
  if (!tenant) {
    return { error: true, mensaje: `Tenant ${tenantId} no encontrado` };
  }

  const metricas_antes = {
    precision_fraude: tenant.precision_fraude,
    precision_clasificacion: tenant.precision_clasificacion,
    precision_valoracion: tenant.precision_valoracion
  };

  // Mejorar metricas ligeramente (con techo)
  const mejora = () => parseFloat((Math.random() * 0.8 + 0.2).toFixed(1));
  tenant.precision_fraude = Math.min(97.0, parseFloat((tenant.precision_fraude + mejora()).toFixed(1)));
  tenant.precision_clasificacion = Math.min(96.5, parseFloat((tenant.precision_clasificacion + mejora()).toFixed(1)));
  tenant.precision_valoracion = Math.min(95.0, parseFloat((tenant.precision_valoracion + mejora()).toFixed(1)));

  const patronesNuevos = Math.floor(Math.random() * 8) + 3;
  tenant.patrones_detectados += patronesNuevos;
  tenant.semanas_entrenamiento++;
  tenant.ultimo_entrenamiento = new Date().toISOString();

  // Incrementar version
  const vParts = tenant.modelo_version.replace('v', '').split('.');
  vParts[2] = parseInt(vParts[2]) + 1;
  tenant.modelo_version = `v${vParts.join('.')}`;

  // Agregar semana a evolucion
  const ultimaSemana = tenant.evolucion[tenant.evolucion.length - 1];
  tenant.evolucion.push({
    semana: tenant.semanas_entrenamiento,
    fecha: new Date().toISOString().split('T')[0],
    precision_fraude: tenant.precision_fraude,
    precision_clasificacion: tenant.precision_clasificacion,
    precision_valoracion: tenant.precision_valoracion,
    patrones_detectados: tenant.patrones_detectados,
    muestras_entrenamiento: ultimaSemana.muestras_entrenamiento + Math.floor(Math.random() * 200) + 200,
    falsos_positivos: Math.max(0, ultimaSemana.falsos_positivos - Math.floor(Math.random() * 2)),
    falsos_negativos: Math.max(0, ultimaSemana.falsos_negativos - Math.floor(Math.random() * 2))
  });

  const duracion_ms = Math.floor(Math.random() * 120000) + 60000;

  return {
    tenant: tenant.nombre,
    modelo_version: tenant.modelo_version,
    metricas_antes,
    metricas_despues: {
      precision_fraude: tenant.precision_fraude,
      precision_clasificacion: tenant.precision_clasificacion,
      precision_valoracion: tenant.precision_valoracion
    },
    mejora: {
      fraude: parseFloat((tenant.precision_fraude - metricas_antes.precision_fraude).toFixed(1)),
      clasificacion: parseFloat((tenant.precision_clasificacion - metricas_antes.precision_clasificacion).toFixed(1)),
      valoracion: parseFloat((tenant.precision_valoracion - metricas_antes.precision_valoracion).toFixed(1))
    },
    patrones_nuevos: patronesNuevos,
    patrones_totales: tenant.patrones_detectados,
    duracion: `${(duracion_ms / 1000).toFixed(0)}s`,
    duracion_ms,
    muestras_procesadas: tenant.evolucion[tenant.evolucion.length - 1].muestras_entrenamiento,
    mensaje: `Entrenamiento completado para ${tenant.nombre}. Modelo actualizado a ${tenant.modelo_version}.`
  };
}

function getPredicciones(siniestroId) {
  // Devolver prediccion en cache si existe
  if (prediccionesCache[siniestroId]) {
    return { ...prediccionesCache[siniestroId], generado: new Date().toISOString(), fuente: 'modelo_v3.2' };
  }

  // Generar prediccion dinamica para siniestros desconocidos
  const hash = siniestroId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const probabilidadFraude = parseFloat(((hash % 50) / 100).toFixed(2));
  const costeBase = 1000 + (hash % 15) * 1000;

  const peritos = [
    { id: 'PER-001', nombre: 'Fernando Diaz', especialidad: 'investigacion_fraude', carga_actual: 3, rating: 4.95 },
    { id: 'PER-003', nombre: 'Carlos Mendez', especialidad: 'auto', carga_actual: 8, rating: 4.9 },
    { id: 'PER-008', nombre: 'Miguel Torres', especialidad: 'hogar', carga_actual: 4, rating: 4.6 },
    { id: 'PER-011', nombre: 'Ana Belen Ruiz', especialidad: 'hogar', carga_actual: 5, rating: 4.7 },
    { id: 'PER-012', nombre: 'Laura Sanchez', especialidad: 'auto', carga_actual: 6, rating: 4.8 }
  ];

  const prediccion = {
    siniestro_id: siniestroId,
    tiempo_resolucion_estimado: `${7 + (hash % 20)} dias`,
    tiempo_resolucion_dias: 7 + (hash % 20),
    coste_estimado: costeBase,
    rango_coste: { min: Math.floor(costeBase * 0.8), max: Math.floor(costeBase * 1.3) },
    probabilidad_fraude: probabilidadFraude,
    nivel_fraude: probabilidadFraude > 0.3 ? 'alto' : probabilidadFraude > 0.15 ? 'medio' : 'bajo',
    perito_recomendado: peritos[hash % peritos.length],
    confianza: parseFloat((0.75 + (hash % 20) / 100).toFixed(2)),
    factores_clave: ['analisis_automatico', 'datos_historicos', 'patron_tipico'],
    clasificacion_automatica: 'pendiente_revision',
    prioridad_sugerida: probabilidadFraude > 0.3 ? 'critica' : probabilidadFraude > 0.15 ? 'alta' : 'media',
    generado: new Date().toISOString(),
    fuente: 'modelo_v3.2'
  };

  // Cachear para futuras consultas
  prediccionesCache[siniestroId] = prediccion;

  return prediccion;
}

function getEvolucion(tenantId) {
  const tenant = tenants[tenantId];
  if (!tenant) {
    return { error: true, mensaje: `Tenant ${tenantId} no encontrado` };
  }

  return {
    tenantId: tenant.tenantId,
    nombre: tenant.nombre,
    modelo_version: tenant.modelo_version,
    semanas_totales: tenant.evolucion.length,
    resumen: {
      precision_inicial: {
        fraude: tenant.evolucion[0].precision_fraude,
        clasificacion: tenant.evolucion[0].precision_clasificacion,
        valoracion: tenant.evolucion[0].precision_valoracion
      },
      precision_actual: {
        fraude: tenant.evolucion[tenant.evolucion.length - 1].precision_fraude,
        clasificacion: tenant.evolucion[tenant.evolucion.length - 1].precision_clasificacion,
        valoracion: tenant.evolucion[tenant.evolucion.length - 1].precision_valoracion
      },
      mejora_total: {
        fraude: parseFloat((tenant.evolucion[tenant.evolucion.length - 1].precision_fraude - tenant.evolucion[0].precision_fraude).toFixed(1)),
        clasificacion: parseFloat((tenant.evolucion[tenant.evolucion.length - 1].precision_clasificacion - tenant.evolucion[0].precision_clasificacion).toFixed(1)),
        valoracion: parseFloat((tenant.evolucion[tenant.evolucion.length - 1].precision_valoracion - tenant.evolucion[0].precision_valoracion).toFixed(1))
      }
    },
    evolucion: tenant.evolucion
  };
}

function compararIAvsHumano(tenantId) {
  const tenant = tenants[tenantId];
  if (!tenant) {
    return { error: true, mensaje: `Tenant ${tenantId} no encontrado` };
  }

  return {
    tenantId: tenant.tenantId,
    nombre: tenant.nombre,
    periodo: 'Ultimo trimestre (Enero-Marzo 2026)',
    deteccion_fraude: {
      ia: {
        casos_analizados: 1245,
        fraudes_detectados: 47,
        falsos_positivos: 3,
        falsos_negativos: 1,
        precision: tenant.precision_fraude,
        tiempo_medio_analisis: '2.3 segundos'
      },
      humano: {
        casos_analizados: 1245,
        fraudes_detectados: 38,
        falsos_positivos: 8,
        falsos_negativos: 9,
        precision: 78.4,
        tiempo_medio_analisis: '45 minutos'
      },
      ventaja_ia: '+15.8% precision, 1174x mas rapido'
    },
    clasificacion_siniestros: {
      ia: {
        siniestros_clasificados: 3420,
        clasificaciones_correctas: 3208,
        precision: tenant.precision_clasificacion,
        tiempo_medio: '0.8 segundos'
      },
      humano: {
        siniestros_clasificados: 3420,
        clasificaciones_correctas: 2872,
        precision: 83.9,
        tiempo_medio: '12 minutos'
      },
      ventaja_ia: '+9.9% precision, 900x mas rapido'
    },
    valoracion_danos: {
      ia: {
        valoraciones: 2180,
        desviacion_media: '4.2%',
        precision: tenant.precision_valoracion,
        tiempo_medio: '1.5 segundos'
      },
      humano: {
        valoraciones: 2180,
        desviacion_media: '11.8%',
        precision: 82.3,
        tiempo_medio: '2.5 horas'
      },
      ventaja_ia: '+9.2% precision, 6000x mas rapido'
    },
    impacto_negocio: {
      ahorro_horas_mes: 1240,
      ahorro_costes_mes: 186000,
      reduccion_fraude_no_detectado: '89%',
      mejora_satisfaccion_cliente: '+18 puntos NPS',
      reduccion_tiempo_resolucion: '62%',
      roi_modelo_ml: '340%'
    },
    conclusion: 'El modelo de IA supera consistentemente al analisis humano en velocidad y precision. La combinacion IA + supervision humana ofrece los mejores resultados, con la IA filtrando el 92% de casos rutinarios y derivando solo los complejos a revision manual.'
  };
}

module.exports = {
  getEstadisticas,
  entrenar,
  getPredicciones,
  getEvolucion,
  compararIAvsHumano
};
