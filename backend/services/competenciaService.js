// ============================================================================
// Servicio de Inteligencia Competitiva - Mercado Asegurador Espanol
// Competidores principales: Mapfre, Allianz, AXA, Zurich, Generali, Liberty
// ============================================================================

const NUESTRA_EMPRESA = 'Seguros Digitales';

const productos = [
  'auto_terceros',
  'auto_todo_riesgo',
  'hogar_basico',
  'hogar_premium',
  'salud_basico',
  'salud_completo',
  'vida_riesgo',
  'responsabilidad_civil',
];

const nombresProductos = {
  auto_terceros: 'Auto - Terceros',
  auto_todo_riesgo: 'Auto - Todo Riesgo',
  hogar_basico: 'Hogar - Basico',
  hogar_premium: 'Hogar - Premium',
  salud_basico: 'Salud - Cuadro Medico',
  salud_completo: 'Salud - Completo (reembolso)',
  vida_riesgo: 'Vida Riesgo',
  responsabilidad_civil: 'Responsabilidad Civil',
};

// Precios anuales medios en EUR (perfil estandar)
const competidores = {
  [NUESTRA_EMPRESA]: {
    nombre: NUESTRA_EMPRESA,
    cuota_mercado_pct: 2.1,
    fortalezas: ['Atencion digital 24/7', 'Tramitacion rapida', 'Precios competitivos online', 'App movil avanzada'],
    debilidades: ['Red de oficinas limitada', 'Marca menos conocida', 'Sin cobertura internacional amplia'],
    precios: {
      auto_terceros: 285,
      auto_todo_riesgo: 620,
      hogar_basico: 145,
      hogar_premium: 310,
      salud_basico: 48,
      salud_completo: 125,
      vida_riesgo: 95,
      responsabilidad_civil: 180,
    },
    satisfaccion_cliente: 8.2,
    velocidad_tramitacion_dias: 12,
  },
  Mapfre: {
    nombre: 'Mapfre',
    cuota_mercado_pct: 13.5,
    fortalezas: ['Mayor red de oficinas', 'Marca muy reconocida', 'Presencia internacional', 'Amplia gama de productos'],
    debilidades: ['Precios elevados', 'Tramitacion lenta', 'Experiencia digital mejorable'],
    precios: {
      auto_terceros: 310,
      auto_todo_riesgo: 680,
      hogar_basico: 160,
      hogar_premium: 340,
      salud_basico: 55,
      salud_completo: 140,
      vida_riesgo: 105,
      responsabilidad_civil: 195,
    },
    satisfaccion_cliente: 7.1,
    velocidad_tramitacion_dias: 22,
  },
  Allianz: {
    nombre: 'Allianz',
    cuota_mercado_pct: 6.8,
    fortalezas: ['Solidez financiera', 'Productos especializados', 'Buena cobertura internacional', 'Innovacion tecnologica'],
    debilidades: ['Precios altos en auto', 'Atencion al cliente desigual', 'Procesos burocraticos'],
    precios: {
      auto_terceros: 320,
      auto_todo_riesgo: 710,
      hogar_basico: 155,
      hogar_premium: 335,
      salud_basico: 52,
      salud_completo: 135,
      vida_riesgo: 98,
      responsabilidad_civil: 175,
    },
    satisfaccion_cliente: 7.4,
    velocidad_tramitacion_dias: 18,
  },
  AXA: {
    nombre: 'AXA',
    cuota_mercado_pct: 5.2,
    fortalezas: ['Buena experiencia digital', 'Productos de salud competitivos', 'Marca global fuerte'],
    debilidades: ['Red de talleres limitada', 'Precios altos en hogar', 'Tiempos de respuesta variables'],
    precios: {
      auto_terceros: 295,
      auto_todo_riesgo: 650,
      hogar_basico: 170,
      hogar_premium: 355,
      salud_basico: 45,
      salud_completo: 118,
      vida_riesgo: 92,
      responsabilidad_civil: 190,
    },
    satisfaccion_cliente: 7.6,
    velocidad_tramitacion_dias: 16,
  },
  Zurich: {
    nombre: 'Zurich',
    cuota_mercado_pct: 4.1,
    fortalezas: ['Solidez grupo suizo', 'Buenas coberturas de vida', 'Atencion personalizada'],
    debilidades: ['Menor visibilidad de marca', 'Oferta digital basica', 'Precios altos en auto'],
    precios: {
      auto_terceros: 305,
      auto_todo_riesgo: 690,
      hogar_basico: 150,
      hogar_premium: 320,
      salud_basico: 50,
      salud_completo: 130,
      vida_riesgo: 88,
      responsabilidad_civil: 185,
    },
    satisfaccion_cliente: 7.3,
    velocidad_tramitacion_dias: 20,
  },
  Generali: {
    nombre: 'Generali',
    cuota_mercado_pct: 4.6,
    fortalezas: ['Tradicion y experiencia', 'Buena gama de hogar', 'Red de mediadores amplia'],
    debilidades: ['Tecnologia desfasada', 'Procesos lentos', 'Poca visibilidad online'],
    precios: {
      auto_terceros: 290,
      auto_todo_riesgo: 640,
      hogar_basico: 140,
      hogar_premium: 305,
      salud_basico: 53,
      salud_completo: 138,
      vida_riesgo: 100,
      responsabilidad_civil: 200,
    },
    satisfaccion_cliente: 7.0,
    velocidad_tramitacion_dias: 24,
  },
  Liberty: {
    nombre: 'Liberty Seguros',
    cuota_mercado_pct: 3.8,
    fortalezas: ['Precios competitivos en auto', 'Buena app movil', 'Atencion rapida'],
    debilidades: ['Gama de productos limitada', 'Poca presencia en vida', 'Menor red de peritos'],
    precios: {
      auto_terceros: 270,
      auto_todo_riesgo: 595,
      hogar_basico: 155,
      hogar_premium: 330,
      salud_basico: 58,
      salud_completo: 145,
      vida_riesgo: 110,
      responsabilidad_civil: 205,
    },
    satisfaccion_cliente: 7.8,
    velocidad_tramitacion_dias: 14,
  },
};

// ---------------------------------------------------------------------------
// getAnalisis - Analisis competitivo completo
// ---------------------------------------------------------------------------
function getAnalisis() {
  const nosotros = competidores[NUESTRA_EMPRESA];
  const rivales = Object.values(competidores).filter(c => c.nombre !== NUESTRA_EMPRESA);

  const posicionPorProducto = {};

  for (const prod of productos) {
    const todosPrecios = Object.values(competidores)
      .map(c => ({ empresa: c.nombre, precio: c.precios[prod] }))
      .sort((a, b) => a.precio - b.precio);

    const posNuestra = todosPrecios.findIndex(p => p.empresa === NUESTRA_EMPRESA) + 1;
    const precioMin = todosPrecios[0];
    const precioMax = todosPrecios[todosPrecios.length - 1];
    const precioMedio = Math.round(todosPrecios.reduce((s, p) => s + p.precio, 0) / todosPrecios.length);

    posicionPorProducto[prod] = {
      nombre: nombresProductos[prod],
      nuestro_precio: nosotros.precios[prod],
      posicion: `${posNuestra} de ${todosPrecios.length}`,
      mas_barato: { empresa: precioMin.empresa, precio: precioMin.precio },
      mas_caro: { empresa: precioMax.empresa, precio: precioMax.precio },
      precio_medio_mercado: precioMedio,
      diferencia_vs_media_pct: Math.round(((nosotros.precios[prod] - precioMedio) / precioMedio) * 100),
      ranking: todosPrecios,
    };
  }

  const ventajasCompetitivas = [];
  const desventajas = [];

  for (const prod of productos) {
    const pos = posicionPorProducto[prod];
    if (pos.diferencia_vs_media_pct < -5) {
      ventajasCompetitivas.push(`${nombresProductos[prod]}: ${Math.abs(pos.diferencia_vs_media_pct)}% por debajo de la media`);
    } else if (pos.diferencia_vs_media_pct > 5) {
      desventajas.push(`${nombresProductos[prod]}: ${pos.diferencia_vs_media_pct}% por encima de la media`);
    }
  }

  return {
    fecha_analisis: '2026-03-19',
    empresa: NUESTRA_EMPRESA,
    cuota_mercado_pct: nosotros.cuota_mercado_pct,
    satisfaccion_cliente: nosotros.satisfaccion_cliente,
    velocidad_tramitacion_dias: nosotros.velocidad_tramitacion_dias,
    posicion_por_producto: posicionPorProducto,
    fortalezas: nosotros.fortalezas,
    debilidades: nosotros.debilidades,
    ventajas_competitivas_precio: ventajasCompetitivas,
    desventajas_precio: desventajas,
    competidores: rivales.map(c => ({
      nombre: c.nombre,
      cuota_mercado_pct: c.cuota_mercado_pct,
      satisfaccion_cliente: c.satisfaccion_cliente,
      fortalezas: c.fortalezas,
      debilidades: c.debilidades,
    })),
    resumen: `${NUESTRA_EMPRESA} se posiciona como aseguradora digital con precios competitivos en auto y salud. ` +
      `Principales amenazas: Liberty en auto terceros, Generali en hogar basico, AXA en salud. ` +
      `Cuota de mercado del ${nosotros.cuota_mercado_pct}% con potencial de crecimiento en canal digital.`,
  };
}

// ---------------------------------------------------------------------------
// getAlertas - Alertas cuando un competidor es mas barato
// ---------------------------------------------------------------------------
function getAlertas() {
  const nosotros = competidores[NUESTRA_EMPRESA];
  const alertas = [];

  for (const prod of productos) {
    const nuestroPrecio = nosotros.precios[prod];
    for (const [nombre, comp] of Object.entries(competidores)) {
      if (nombre === NUESTRA_EMPRESA) continue;
      const preciComp = comp.precios[prod];
      const diferencia = nuestroPrecio - preciComp;
      const diferenciaPct = Math.round((diferencia / nuestroPrecio) * 100);

      if (diferencia > 0 && diferenciaPct >= 3) {
        alertas.push({
          id: `ALC-${nombre.substring(0, 3).toUpperCase()}-${prod}`,
          tipo: 'competidor_mas_barato',
          severidad: diferenciaPct >= 10 ? 'alta' : diferenciaPct >= 5 ? 'media' : 'baja',
          producto: nombresProductos[prod],
          competidor: nombre,
          nuestro_precio: nuestroPrecio,
          precio_competidor: preciComp,
          diferencia_eur: diferencia,
          diferencia_pct: diferenciaPct,
          descripcion: `${nombre} ofrece ${nombresProductos[prod]} un ${diferenciaPct}% mas barato (${preciComp} EUR vs ${nuestroPrecio} EUR)`,
          fecha_deteccion: '2026-03-19',
          impacto_estimado: diferenciaPct >= 10 ? 'Riesgo alto de fuga de clientes' : 'Riesgo moderado en captacion',
        });
      }
    }
  }

  // Alertas de movimientos de mercado
  alertas.push(
    {
      id: 'ALC-MOV-001',
      tipo: 'movimiento_mercado',
      severidad: 'alta',
      competidor: 'Liberty Seguros',
      descripcion: 'Liberty ha lanzado campana agresiva "Auto desde 22 EUR/mes" con descuento del 15% para nuevos clientes online',
      fecha_deteccion: '2026-03-15',
      impacto_estimado: 'Posible captacion de clientes sensibles al precio en canal digital',
    },
    {
      id: 'ALC-MOV-002',
      tipo: 'nuevo_producto',
      severidad: 'media',
      competidor: 'AXA',
      descripcion: 'AXA lanza seguro de salud digital con teleconsulta incluida por 39 EUR/mes',
      fecha_deteccion: '2026-03-10',
      impacto_estimado: 'Competencia directa en segmento salud digital',
    },
    {
      id: 'ALC-MOV-003',
      tipo: 'alianza_estrategica',
      severidad: 'media',
      competidor: 'Mapfre',
      descripcion: 'Mapfre firma acuerdo con concesionarios Volkswagen para seguro auto integrado',
      fecha_deteccion: '2026-03-08',
      impacto_estimado: 'Posible reduccion de flujo de clientes en auto nuevo',
    }
  );

  return alertas.sort((a, b) => {
    const prioridad = { alta: 0, media: 1, baja: 2 };
    return (prioridad[a.severidad] || 2) - (prioridad[b.severidad] || 2);
  });
}

// ---------------------------------------------------------------------------
// getRecomendaciones - Recomendaciones IA de ajuste de precios
// ---------------------------------------------------------------------------
function getRecomendaciones() {
  const nosotros = competidores[NUESTRA_EMPRESA];

  return [
    {
      id: 'REC-001',
      producto: 'Auto - Todo Riesgo',
      tipo: 'reduccion_precio',
      prioridad: 'alta',
      precio_actual: nosotros.precios.auto_todo_riesgo,
      precio_recomendado: 589,
      ajuste_pct: -5,
      justificacion: 'Liberty y Generali ofrecen precios significativamente menores. Reducir para mantener competitividad en segmento clave.',
      impacto_estimado: {
        nuevos_clientes_mes: 45,
        retencion_mejora_pct: 3,
        impacto_ingresos_mensual: -1860,
        roi_estimado_6_meses: '+8.2%',
      },
      competidores_referencia: ['Liberty (595 EUR)', 'Generali (640 EUR)'],
    },
    {
      id: 'REC-002',
      producto: 'Salud - Cuadro Medico',
      tipo: 'mantener_precio',
      prioridad: 'media',
      precio_actual: nosotros.precios.salud_basico,
      precio_recomendado: 48,
      ajuste_pct: 0,
      justificacion: 'Precio competitivo (2do mas barato tras AXA). Mantener y potenciar diferenciacion por servicio digital.',
      impacto_estimado: {
        nuevos_clientes_mes: 0,
        retencion_mejora_pct: 0,
        impacto_ingresos_mensual: 0,
        roi_estimado_6_meses: 'neutral',
      },
      competidores_referencia: ['AXA (45 EUR)', 'Zurich (50 EUR)'],
    },
    {
      id: 'REC-003',
      producto: 'Hogar - Premium',
      tipo: 'subida_precio',
      prioridad: 'baja',
      precio_actual: nosotros.precios.hogar_premium,
      precio_recomendado: 325,
      ajuste_pct: +5,
      justificacion: 'Somos los 2os mas baratos con buen servicio. Margen para subida sin perder competitividad, mejorando rentabilidad.',
      impacto_estimado: {
        perdida_clientes_mes: 5,
        impacto_ingresos_mensual: +2100,
        roi_estimado_6_meses: '+4.5%',
      },
      competidores_referencia: ['Generali (305 EUR)', 'Zurich (320 EUR)'],
    },
    {
      id: 'REC-004',
      producto: 'Vida Riesgo',
      tipo: 'reduccion_precio',
      prioridad: 'media',
      precio_actual: nosotros.precios.vida_riesgo,
      precio_recomendado: 89,
      ajuste_pct: -6,
      justificacion: 'Zurich lidera con 88 EUR. Acercarnos para ganar cuota en producto de alta fidelizacion y venta cruzada.',
      impacto_estimado: {
        nuevos_clientes_mes: 20,
        retencion_mejora_pct: 2,
        impacto_ingresos_mensual: -540,
        roi_estimado_6_meses: '+5.8%',
      },
      competidores_referencia: ['Zurich (88 EUR)', 'AXA (92 EUR)'],
    },
    {
      id: 'REC-005',
      producto: 'Auto - Terceros',
      tipo: 'reduccion_precio',
      prioridad: 'alta',
      precio_actual: nosotros.precios.auto_terceros,
      precio_recomendado: 275,
      ajuste_pct: -3.5,
      justificacion: 'Liberty ofrece 270 EUR con buena experiencia digital. Necesitamos acercarnos para no perder cliente tipo "solo precio".',
      impacto_estimado: {
        nuevos_clientes_mes: 60,
        retencion_mejora_pct: 4,
        impacto_ingresos_mensual: -1500,
        roi_estimado_6_meses: '+11.3%',
      },
      competidores_referencia: ['Liberty (270 EUR)', 'Generali (290 EUR)'],
    },
    {
      id: 'REC-006',
      producto: 'Responsabilidad Civil',
      tipo: 'mantener_precio',
      prioridad: 'baja',
      precio_actual: nosotros.precios.responsabilidad_civil,
      precio_recomendado: 180,
      ajuste_pct: 0,
      justificacion: 'Posicion competitiva adecuada, 2do mas barato. Producto de bajo volumen, no justifica ajuste.',
      impacto_estimado: {
        nuevos_clientes_mes: 0,
        impacto_ingresos_mensual: 0,
        roi_estimado_6_meses: 'neutral',
      },
      competidores_referencia: ['Allianz (175 EUR)', 'Zurich (185 EUR)'],
    },
  ];
}

// ---------------------------------------------------------------------------
// compararProducto - Comparativa detallada de un producto
// ---------------------------------------------------------------------------
function compararProducto(producto, perfil) {
  if (!productos.includes(producto)) {
    return { error: `Producto '${producto}' no encontrado. Productos disponibles: ${productos.join(', ')}` };
  }

  const perfilDesc = perfil || 'estandar';

  // Factores de ajuste por perfil
  const factoresPerfl = {
    joven: { auto_terceros: 1.45, auto_todo_riesgo: 1.50, hogar_basico: 0.95, hogar_premium: 0.95, salud_basico: 0.85, salud_completo: 0.85, vida_riesgo: 0.70, responsabilidad_civil: 1.10 },
    senior: { auto_terceros: 0.90, auto_todo_riesgo: 0.85, hogar_basico: 1.0, hogar_premium: 1.0, salud_basico: 1.40, salud_completo: 1.45, vida_riesgo: 1.60, responsabilidad_civil: 0.95 },
    familia: { auto_terceros: 1.0, auto_todo_riesgo: 1.05, hogar_basico: 1.10, hogar_premium: 1.10, salud_basico: 1.20, salud_completo: 1.15, vida_riesgo: 1.10, responsabilidad_civil: 1.05 },
    estandar: { auto_terceros: 1.0, auto_todo_riesgo: 1.0, hogar_basico: 1.0, hogar_premium: 1.0, salud_basico: 1.0, salud_completo: 1.0, vida_riesgo: 1.0, responsabilidad_civil: 1.0 },
  };

  const factor = (factoresPerfl[perfilDesc] || factoresPerfl.estandar)[producto] || 1.0;

  const comparativa = Object.values(competidores).map(comp => {
    const precioBase = comp.precios[producto];
    const precioAjustado = Math.round(precioBase * factor);
    return {
      empresa: comp.nombre,
      precio_base: precioBase,
      precio_perfil: precioAjustado,
      precio_mensual: +(precioAjustado / 12).toFixed(2),
      satisfaccion: comp.satisfaccion_cliente,
      velocidad_tramitacion_dias: comp.velocidad_tramitacion_dias,
      cuota_mercado_pct: comp.cuota_mercado_pct,
      es_nosotros: comp.nombre === NUESTRA_EMPRESA,
    };
  }).sort((a, b) => a.precio_perfil - b.precio_perfil);

  const nuestro = comparativa.find(c => c.es_nosotros);
  const masBrato = comparativa[0];
  const masCaro = comparativa[comparativa.length - 1];

  return {
    producto: nombresProductos[producto],
    perfil: perfilDesc,
    fecha_comparativa: '2026-03-19',
    comparativa,
    nuestro_precio: nuestro.precio_perfil,
    nuestra_posicion: comparativa.indexOf(nuestro) + 1,
    total_competidores: comparativa.length,
    mas_barato: { empresa: masBrato.empresa, precio: masBrato.precio_perfil },
    mas_caro: { empresa: masCaro.empresa, precio: masCaro.precio_perfil },
    precio_medio: Math.round(comparativa.reduce((s, c) => s + c.precio_perfil, 0) / comparativa.length),
    mejor_relacion_calidad_precio: comparativa
      .map(c => ({ empresa: c.empresa, score: +(c.satisfaccion / (c.precio_perfil / 100)).toFixed(2) }))
      .sort((a, b) => b.score - a.score)[0],
  };
}

// ---------------------------------------------------------------------------
// getPosicionamiento - Datos para grafico radar de posicionamiento
// ---------------------------------------------------------------------------
function getPosicionamiento() {
  const dimensiones = ['precio', 'servicio_cliente', 'digital', 'cobertura', 'velocidad', 'marca'];

  // Puntuaciones 1-10 por dimension
  const puntuaciones = {
    [NUESTRA_EMPRESA]: { precio: 8.5, servicio_cliente: 8.2, digital: 9.0, cobertura: 6.5, velocidad: 8.5, marca: 5.0 },
    Mapfre: { precio: 5.0, servicio_cliente: 7.0, digital: 6.0, cobertura: 9.0, velocidad: 5.0, marca: 9.5 },
    Allianz: { precio: 4.5, servicio_cliente: 7.5, digital: 7.0, cobertura: 8.5, velocidad: 6.5, marca: 8.5 },
    AXA: { precio: 6.5, servicio_cliente: 7.5, digital: 8.0, cobertura: 7.5, velocidad: 7.0, marca: 8.0 },
    Zurich: { precio: 6.0, servicio_cliente: 7.0, digital: 5.5, cobertura: 7.5, velocidad: 5.5, marca: 7.0 },
    Generali: { precio: 7.5, servicio_cliente: 6.5, digital: 4.5, cobertura: 7.0, velocidad: 4.5, marca: 7.5 },
    Liberty: { precio: 8.0, servicio_cliente: 7.8, digital: 7.5, cobertura: 6.0, velocidad: 8.0, marca: 6.5 },
  };

  const empresas = Object.keys(puntuaciones);

  return {
    fecha: '2026-03-19',
    dimensiones,
    datos_radar: empresas.map(emp => ({
      empresa: emp,
      es_nosotros: emp === NUESTRA_EMPRESA,
      puntuaciones: puntuaciones[emp],
      media: +(Object.values(puntuaciones[emp]).reduce((s, v) => s + v, 0) / dimensiones.length).toFixed(1),
    })).sort((a, b) => b.media - a.media),
    ranking_global: empresas
      .map(emp => ({
        empresa: emp,
        media: +(Object.values(puntuaciones[emp]).reduce((s, v) => s + v, 0) / dimensiones.length).toFixed(1),
      }))
      .sort((a, b) => b.media - a.media)
      .map((e, i) => ({ ...e, posicion: i + 1 })),
    insight: `${NUESTRA_EMPRESA} lidera en dimension digital (9.0) y velocidad (8.5), ` +
      `pero necesita mejorar en cobertura (6.5) y reconocimiento de marca (5.0). ` +
      `Principal rival directo: Liberty Seguros por perfil similar (digital + precio).`,
  };
}

module.exports = {
  getAnalisis,
  getAlertas,
  getRecomendaciones,
  compararProducto,
  getPosicionamiento,
  competidores,
  productos,
  nombresProductos,
};
