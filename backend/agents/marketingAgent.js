// ============================================================================
// Marketing Agent - Departamento Autonomo de Marketing
// Gestion integral de campanas, contenidos, analytics y leads
// ============================================================================

/**
 * Devuelve las campanas activas de marketing en todos los canales
 * @returns {Array} Lista de 8 campanas con metricas detalladas
 */
function getCampanas() {
  const campanas = [
    {
      id: 'MKT-001',
      nombre: 'Seguro Hogar - Primavera 2026',
      canal: 'Google Ads',
      presupuesto: 12000,
      gastado: 8450,
      impresiones: 245000,
      clics: 7350,
      conversiones: 186,
      cpa: 45.43,
      roi: 340,
      estado: 'activa',
      fecha_inicio: '2026-02-01',
      fecha_fin: '2026-04-30'
    },
    {
      id: 'MKT-002',
      nombre: 'Vida Premium - Familias',
      canal: 'Meta',
      presupuesto: 8500,
      gastado: 6120,
      impresiones: 389000,
      clics: 5834,
      conversiones: 98,
      cpa: 62.45,
      roi: 215,
      estado: 'activa',
      fecha_inicio: '2026-01-15',
      fecha_fin: '2026-03-31'
    },
    {
      id: 'MKT-003',
      nombre: 'Seguro Empresarial - B2B',
      canal: 'LinkedIn',
      presupuesto: 15000,
      gastado: 11200,
      impresiones: 78000,
      clics: 2340,
      conversiones: 42,
      cpa: 266.67,
      roi: 280,
      estado: 'activa',
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-06-30'
    },
    {
      id: 'MKT-004',
      nombre: 'Newsletter Mensual - Clientes',
      canal: 'Email',
      presupuesto: 2000,
      gastado: 1650,
      impresiones: 45000,
      clics: 6750,
      conversiones: 312,
      cpa: 5.29,
      roi: 520,
      estado: 'activa',
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-12-31'
    },
    {
      id: 'MKT-005',
      nombre: 'Blog SEO - Seguros para Autonomos',
      canal: 'SEO',
      presupuesto: 4500,
      gastado: 3200,
      impresiones: 156000,
      clics: 18720,
      conversiones: 245,
      cpa: 13.06,
      roi: 890,
      estado: 'activa',
      fecha_inicio: '2025-09-01',
      fecha_fin: '2026-08-31'
    },
    {
      id: 'MKT-006',
      nombre: 'Retargeting - Cotizaciones Abandonadas',
      canal: 'Google Ads',
      presupuesto: 6000,
      gastado: 4780,
      impresiones: 134000,
      clics: 8040,
      conversiones: 201,
      cpa: 23.78,
      roi: 410,
      estado: 'activa',
      fecha_inicio: '2026-02-15',
      fecha_fin: '2026-05-15'
    },
    {
      id: 'MKT-007',
      nombre: 'Video - Testimonios Clientes',
      canal: 'Meta',
      presupuesto: 5000,
      gastado: 2100,
      impresiones: 210000,
      clics: 4200,
      conversiones: 56,
      cpa: 37.50,
      roi: 185,
      estado: 'activa',
      fecha_inicio: '2026-03-01',
      fecha_fin: '2026-04-30'
    },
    {
      id: 'MKT-008',
      nombre: 'Webinar - Ciberseguros PYMES',
      canal: 'LinkedIn',
      presupuesto: 3500,
      gastado: 1890,
      impresiones: 42000,
      clics: 1260,
      conversiones: 34,
      cpa: 55.59,
      roi: 310,
      estado: 'activa',
      fecha_inicio: '2026-03-10',
      fecha_fin: '2026-04-10'
    }
  ];

  return campanas;
}

/**
 * Devuelve el calendario de contenidos planificados y publicados
 * @returns {Array} Lista de 15 piezas de contenido
 */
function getContenidos() {
  const contenidos = [
    {
      id: 'CNT-001',
      titulo: '5 errores al contratar seguro de hogar',
      tipo: 'articulo_blog',
      canal: 'Blog / SEO',
      autor: 'Maria Lopez',
      fecha_publicacion: '2026-03-01',
      estado: 'publicado',
      engagement: { vistas: 3420, compartidos: 89, comentarios: 23, tiempo_lectura_avg: '4:32' }
    },
    {
      id: 'CNT-002',
      titulo: 'Guia completa de ciberseguros para PYMES',
      tipo: 'ebook',
      canal: 'Landing Page',
      autor: 'Carlos Ruiz',
      fecha_publicacion: '2026-03-05',
      estado: 'publicado',
      engagement: { descargas: 567, leads_generados: 234, compartidos: 45, tiempo_lectura_avg: '12:15' }
    },
    {
      id: 'CNT-003',
      titulo: 'Testimonio: Como nos salvo el seguro empresarial',
      tipo: 'video',
      canal: 'YouTube / Meta',
      autor: 'Equipo Audiovisual',
      fecha_publicacion: '2026-03-08',
      estado: 'publicado',
      engagement: { reproducciones: 12400, likes: 890, compartidos: 156, comentarios: 67 }
    },
    {
      id: 'CNT-004',
      titulo: 'Infografia: Tipos de seguros para autonomos',
      tipo: 'infografia',
      canal: 'Instagram / LinkedIn',
      autor: 'Ana Martinez',
      fecha_publicacion: '2026-03-10',
      estado: 'publicado',
      engagement: { impresiones: 18900, likes: 1230, guardados: 345, compartidos: 210 }
    },
    {
      id: 'CNT-005',
      titulo: 'Newsletter Marzo - Novedades y consejos',
      tipo: 'newsletter',
      canal: 'Email',
      autor: 'Maria Lopez',
      fecha_publicacion: '2026-03-12',
      estado: 'publicado',
      engagement: { enviados: 45000, abiertos: 14850, clics: 3240, bajas: 12 }
    },
    {
      id: 'CNT-006',
      titulo: 'Post: Dia del consumidor - Descuentos especiales',
      tipo: 'post_social',
      canal: 'Instagram / Facebook / X',
      autor: 'Ana Martinez',
      fecha_publicacion: '2026-03-15',
      estado: 'publicado',
      engagement: { impresiones: 34500, likes: 2100, comentarios: 89, compartidos: 312 }
    },
    {
      id: 'CNT-007',
      titulo: 'Comparativa: Seguro a todo riesgo vs terceros',
      tipo: 'articulo_blog',
      canal: 'Blog / SEO',
      autor: 'Carlos Ruiz',
      fecha_publicacion: '2026-03-18',
      estado: 'publicado',
      engagement: { vistas: 1890, compartidos: 45, comentarios: 12, tiempo_lectura_avg: '5:10' }
    },
    {
      id: 'CNT-008',
      titulo: 'Caso de exito: Siniestro resuelto en 48h',
      tipo: 'post_social',
      canal: 'LinkedIn',
      autor: 'Maria Lopez',
      fecha_publicacion: '2026-03-19',
      estado: 'publicado',
      engagement: { impresiones: 8900, likes: 567, comentarios: 34, compartidos: 89 }
    },
    {
      id: 'CNT-009',
      titulo: 'Webinar: Protege tu negocio digital',
      tipo: 'webinar',
      canal: 'Zoom / LinkedIn Live',
      autor: 'Carlos Ruiz',
      fecha_publicacion: '2026-03-22',
      estado: 'planificado',
      engagement: { registrados: 234, asistentes_estimados: 140, leads_objetivo: 50 }
    },
    {
      id: 'CNT-010',
      titulo: 'Video corto: 3 tips para reducir prima de seguro',
      tipo: 'reel',
      canal: 'Instagram / TikTok',
      autor: 'Equipo Audiovisual',
      fecha_publicacion: '2026-03-24',
      estado: 'planificado',
      engagement: { reproducciones_estimadas: 25000, likes_objetivo: 1500 }
    },
    {
      id: 'CNT-011',
      titulo: 'Articulo: Novedades legislativas seguros 2026',
      tipo: 'articulo_blog',
      canal: 'Blog / SEO',
      autor: 'Maria Lopez',
      fecha_publicacion: '2026-03-26',
      estado: 'en_revision',
      engagement: { vistas_estimadas: 2500, leads_objetivo: 30 }
    },
    {
      id: 'CNT-012',
      titulo: 'Email: Promocion seguros de salud familiar',
      tipo: 'email_campana',
      canal: 'Email',
      autor: 'Ana Martinez',
      fecha_publicacion: '2026-03-28',
      estado: 'en_diseno',
      engagement: { audiencia_objetivo: 32000, apertura_estimada: 33 }
    },
    {
      id: 'CNT-013',
      titulo: 'Podcast: Entrevista con perito experto',
      tipo: 'podcast',
      canal: 'Spotify / Apple Podcasts',
      autor: 'Carlos Ruiz',
      fecha_publicacion: '2026-03-30',
      estado: 'en_produccion',
      engagement: { escuchas_estimadas: 3500, suscriptores_objetivo: 150 }
    },
    {
      id: 'CNT-014',
      titulo: 'Carrusel: Preguntas frecuentes seguros auto',
      tipo: 'carrusel',
      canal: 'Instagram / LinkedIn',
      autor: 'Ana Martinez',
      fecha_publicacion: '2026-04-01',
      estado: 'planificado',
      engagement: { impresiones_estimadas: 15000, guardados_objetivo: 400 }
    },
    {
      id: 'CNT-015',
      titulo: 'Newsletter Abril - Especial primavera',
      tipo: 'newsletter',
      canal: 'Email',
      autor: 'Maria Lopez',
      fecha_publicacion: '2026-04-05',
      estado: 'planificado',
      engagement: { audiencia_objetivo: 46000, apertura_estimada: 34 }
    }
  ];

  return contenidos;
}

/**
 * Devuelve analytics de rendimiento por canal y datos de funnel
 * @returns {Object} Datos de rendimiento y embudo de conversion
 */
function getAnalytics() {
  const analytics = {
    rendimiento_por_canal: [
      {
        canal: 'Google Ads',
        visitas: 15390,
        leads: 387,
        conversiones: 186,
        tasa_conversion: 1.21,
        coste: 13230,
        coste_por_lead: 34.19,
        ingresos_generados: 58200
      },
      {
        canal: 'Meta (Facebook/Instagram)',
        visitas: 28900,
        leads: 312,
        conversiones: 154,
        tasa_conversion: 0.53,
        coste: 8220,
        coste_por_lead: 26.35,
        ingresos_generados: 32800
      },
      {
        canal: 'LinkedIn',
        visitas: 3600,
        leads: 198,
        conversiones: 76,
        tasa_conversion: 2.11,
        coste: 13090,
        coste_por_lead: 66.11,
        ingresos_generados: 49700
      },
      {
        canal: 'Email Marketing',
        visitas: 9990,
        leads: 456,
        conversiones: 312,
        tasa_conversion: 3.12,
        coste: 1650,
        coste_por_lead: 3.62,
        ingresos_generados: 10230
      },
      {
        canal: 'SEO / Organico',
        visitas: 42300,
        leads: 634,
        conversiones: 245,
        tasa_conversion: 0.58,
        coste: 3200,
        coste_por_lead: 5.05,
        ingresos_generados: 31680
      },
      {
        canal: 'Referidos',
        visitas: 5200,
        leads: 289,
        conversiones: 156,
        tasa_conversion: 3.00,
        coste: 0,
        coste_por_lead: 0,
        ingresos_generados: 42300
      }
    ],
    funnel: {
      visitantes: 105380,
      leads: 2276,
      leads_cualificados: 1245,
      demos_solicitadas: 567,
      cotizaciones: 412,
      clientes_nuevos: 189,
      tasa_visitante_lead: 2.16,
      tasa_lead_cliente: 8.30,
      tasa_demo_cliente: 33.33,
      valor_medio_cliente: 1850
    },
    tendencia_mensual: [
      { mes: 'Octubre 2025', visitas: 78200, leads: 1456, clientes: 98 },
      { mes: 'Noviembre 2025', visitas: 82400, leads: 1678, clientes: 112 },
      { mes: 'Diciembre 2025', visitas: 71300, leads: 1234, clientes: 89 },
      { mes: 'Enero 2026', visitas: 89100, leads: 1890, clientes: 134 },
      { mes: 'Febrero 2026', visitas: 95600, leads: 2050, clientes: 156 },
      { mes: 'Marzo 2026', visitas: 105380, leads: 2276, clientes: 189 }
    ]
  };

  return analytics;
}

/**
 * Devuelve los leads cualificados de marketing (MQLs)
 * @returns {Array} Lista de 12 leads con scoring y estado
 */
function getLeadsMarketing() {
  const leads = [
    { id: 'LMK-001', nombre: 'Transportes Ibericos S.L.', contacto: 'Pedro Navarro', email: 'pnavarro@transibericos.es', fuente: 'Google Ads', score: 92, etapa: 'SQL', interes: 'Seguro flota vehiculos', fecha_captacion: '2026-03-02', ultima_interaccion: '2026-03-18', interacciones: 8 },
    { id: 'LMK-002', nombre: 'Clinica Dental Sonrisa', contacto: 'Laura Vega', email: 'lvega@sonrisa.es', fuente: 'SEO', score: 87, etapa: 'MQL', interes: 'Seguro responsabilidad civil', fecha_captacion: '2026-03-05', ultima_interaccion: '2026-03-17', interacciones: 5 },
    { id: 'LMK-003', nombre: 'Constructora Del Sur', contacto: 'Miguel Torres', email: 'mtorres@constdelsur.es', fuente: 'LinkedIn', score: 85, etapa: 'SQL', interes: 'Seguro obra y maquinaria', fecha_captacion: '2026-02-28', ultima_interaccion: '2026-03-19', interacciones: 12 },
    { id: 'LMK-004', nombre: 'Restaurante El Olivo', contacto: 'Carmen Diaz', email: 'cdiaz@elolivo.es', fuente: 'Meta', score: 78, etapa: 'MQL', interes: 'Seguro multirriesgo negocio', fecha_captacion: '2026-03-08', ultima_interaccion: '2026-03-16', interacciones: 4 },
    { id: 'LMK-005', nombre: 'Tech Solutions Madrid', contacto: 'Alejandro Ramos', email: 'aramos@techsol.es', fuente: 'Webinar', score: 94, etapa: 'Oportunidad', interes: 'Ciberseguro empresarial', fecha_captacion: '2026-03-10', ultima_interaccion: '2026-03-19', interacciones: 9 },
    { id: 'LMK-006', nombre: 'Farmacia Central', contacto: 'Isabel Moreno', email: 'imoreno@farmcentral.es', fuente: 'Email', score: 71, etapa: 'MQL', interes: 'Seguro comercio', fecha_captacion: '2026-03-12', ultima_interaccion: '2026-03-15', interacciones: 3 },
    { id: 'LMK-007', nombre: 'Abogados & Partners', contacto: 'Fernando Gil', email: 'fgil@abogadospartners.es', fuente: 'LinkedIn', score: 88, etapa: 'SQL', interes: 'Seguro RC profesional', fecha_captacion: '2026-02-20', ultima_interaccion: '2026-03-18', interacciones: 7 },
    { id: 'LMK-008', nombre: 'Eventos Estrella S.A.', contacto: 'Patricia Ruiz', email: 'pruiz@eventosestrella.es', fuente: 'Google Ads', score: 65, etapa: 'Lead', interes: 'Seguro eventos', fecha_captacion: '2026-03-14', ultima_interaccion: '2026-03-17', interacciones: 2 },
    { id: 'LMK-009', nombre: 'Logistica Express', contacto: 'Roberto Sanchez', email: 'rsanchez@logexpress.es', fuente: 'Referido', score: 96, etapa: 'Oportunidad', interes: 'Seguro mercancia transporte', fecha_captacion: '2026-03-01', ultima_interaccion: '2026-03-19', interacciones: 11 },
    { id: 'LMK-010', nombre: 'Academia Formacion Plus', contacto: 'Silvia Hernandez', email: 'shernandez@formplus.es', fuente: 'SEO', score: 73, etapa: 'MQL', interes: 'Seguro accidentes alumnos', fecha_captacion: '2026-03-09', ultima_interaccion: '2026-03-14', interacciones: 3 },
    { id: 'LMK-011', nombre: 'Gimnasio FitZone', contacto: 'David Perez', email: 'dperez@fitzone.es', fuente: 'Meta', score: 81, etapa: 'SQL', interes: 'Seguro RC deportiva', fecha_captacion: '2026-03-06', ultima_interaccion: '2026-03-18', interacciones: 6 },
    { id: 'LMK-012', nombre: 'Inmobiliaria Costa Blanca', contacto: 'Elena Castro', email: 'ecastro@costablanca.es', fuente: 'Email', score: 90, etapa: 'Oportunidad', interes: 'Seguro multirriesgo comunidades', fecha_captacion: '2026-02-25', ultima_interaccion: '2026-03-19', interacciones: 10 }
  ];

  return leads;
}

/**
 * Devuelve el ROI desglosado por canal de marketing
 * @returns {Array} ROI por canal con metricas financieras
 */
function getROIPorCanal() {
  const roi = [
    {
      canal: 'Google Ads',
      inversion: 13230,
      ingresos_generados: 58200,
      beneficio_neto: 44970,
      roi_porcentaje: 340,
      numero_clientes: 52,
      ltv_medio_cliente: 2850,
      tendencia: 'subiendo'
    },
    {
      canal: 'LinkedIn',
      inversion: 13090,
      ingresos_generados: 49700,
      beneficio_neto: 36610,
      roi_porcentaje: 280,
      numero_clientes: 18,
      ltv_medio_cliente: 4200,
      tendencia: 'estable'
    },
    {
      canal: 'Meta (Facebook/Instagram)',
      inversion: 8220,
      ingresos_generados: 32800,
      beneficio_neto: 24580,
      roi_porcentaje: 299,
      numero_clientes: 41,
      ltv_medio_cliente: 1650,
      tendencia: 'subiendo'
    },
    {
      canal: 'Email Marketing',
      inversion: 1650,
      ingresos_generados: 10230,
      beneficio_neto: 8580,
      roi_porcentaje: 520,
      numero_clientes: 67,
      ltv_medio_cliente: 2100,
      tendencia: 'subiendo'
    },
    {
      canal: 'SEO / Organico',
      inversion: 3200,
      ingresos_generados: 31680,
      beneficio_neto: 28480,
      roi_porcentaje: 890,
      numero_clientes: 48,
      ltv_medio_cliente: 1980,
      tendencia: 'subiendo'
    },
    {
      canal: 'Referidos',
      inversion: 0,
      ingresos_generados: 42300,
      beneficio_neto: 42300,
      roi_porcentaje: null,
      numero_clientes: 34,
      ltv_medio_cliente: 3200,
      tendencia: 'estable',
      nota: 'Canal sin coste directo - ROI infinito'
    }
  ];

  return roi;
}

/**
 * Devuelve el presupuesto asignado vs gasto real por canal
 * @returns {Object} Comparacion presupuesto planificado vs real
 */
function getPresupuestoVsReal() {
  const presupuesto = {
    periodo: 'Q1 2026 (Enero - Marzo)',
    total_asignado: 56500,
    total_gastado: 39390,
    porcentaje_ejecutado: 69.72,
    restante: 17110,
    desglose: [
      { canal: 'Google Ads', asignado: 18000, gastado: 13230, porcentaje: 73.50, estado: 'en_linea' },
      { canal: 'Meta', asignado: 13500, gastado: 8220, porcentaje: 60.89, estado: 'bajo_previsto' },
      { canal: 'LinkedIn', asignado: 18500, gastado: 13090, porcentaje: 70.76, estado: 'en_linea' },
      { canal: 'Email Marketing', asignado: 2000, gastado: 1650, porcentaje: 82.50, estado: 'en_linea' },
      { canal: 'SEO / Contenidos', asignado: 4500, gastado: 3200, porcentaje: 71.11, estado: 'en_linea' }
    ],
    alertas: [
      { tipo: 'info', mensaje: 'Meta esta un 9% por debajo del ritmo de gasto previsto. Considerar reasignar a Google Ads.' },
      { tipo: 'exito', mensaje: 'Email Marketing tiene el mejor ROI (520%) con el menor presupuesto. Potencial de escalado.' },
      { tipo: 'info', mensaje: 'SEO muestra ROI de 890%. Incremento recomendado para Q2.' }
    ]
  };

  return presupuesto;
}

/**
 * Devuelve comparacion en redes sociales frente a 3 competidores
 * @returns {Object} Metricas comparativas de social media
 */
function getCompetenciaSocial() {
  const competencia = {
    fecha_analisis: '2026-03-19',
    nuestra_marca: 'SegurPro',
    plataformas: {
      instagram: {
        nuestra_marca: { seguidores: 34500, engagement_rate: 3.8, publicaciones_mes: 22, crecimiento_mensual: 4.2 },
        competidor_1: { nombre: 'AseguraTodo', seguidores: 52000, engagement_rate: 2.9, publicaciones_mes: 18, crecimiento_mensual: 2.1 },
        competidor_2: { nombre: 'ProtecSegur', seguidores: 28000, engagement_rate: 3.2, publicaciones_mes: 15, crecimiento_mensual: 3.5 },
        competidor_3: { nombre: 'VidaSegura', seguidores: 41000, engagement_rate: 2.5, publicaciones_mes: 20, crecimiento_mensual: 1.8 }
      },
      linkedin: {
        nuestra_marca: { seguidores: 18200, engagement_rate: 4.5, publicaciones_mes: 16, crecimiento_mensual: 6.8 },
        competidor_1: { nombre: 'AseguraTodo', seguidores: 31000, engagement_rate: 3.1, publicaciones_mes: 12, crecimiento_mensual: 3.2 },
        competidor_2: { nombre: 'ProtecSegur', seguidores: 14500, engagement_rate: 3.8, publicaciones_mes: 10, crecimiento_mensual: 4.1 },
        competidor_3: { nombre: 'VidaSegura', seguidores: 22000, engagement_rate: 2.9, publicaciones_mes: 14, crecimiento_mensual: 2.5 }
      },
      x_twitter: {
        nuestra_marca: { seguidores: 12800, engagement_rate: 2.1, publicaciones_mes: 30, crecimiento_mensual: 3.5 },
        competidor_1: { nombre: 'AseguraTodo', seguidores: 19500, engagement_rate: 1.8, publicaciones_mes: 25, crecimiento_mensual: 1.2 },
        competidor_2: { nombre: 'ProtecSegur', seguidores: 8900, engagement_rate: 2.4, publicaciones_mes: 18, crecimiento_mensual: 2.8 },
        competidor_3: { nombre: 'VidaSegura', seguidores: 15200, engagement_rate: 1.5, publicaciones_mes: 22, crecimiento_mensual: 0.9 }
      }
    },
    share_of_voice: {
      nuestra_marca: 24.5,
      AseguraTodo: 32.1,
      ProtecSegur: 18.7,
      VidaSegura: 24.7
    },
    sentimiento: {
      nuestra_marca: { positivo: 72, neutro: 22, negativo: 6 },
      AseguraTodo: { positivo: 61, neutro: 28, negativo: 11 },
      ProtecSegur: { positivo: 68, neutro: 24, negativo: 8 },
      VidaSegura: { positivo: 58, neutro: 30, negativo: 12 }
    }
  };

  return competencia;
}

/**
 * Devuelve las estadisticas resumen del departamento de marketing
 * @returns {Object} KPIs principales de marketing
 */
function getEstadisticas() {
  const estadisticas = {
    leads_mes: 2276,
    coste_por_lead: 17.31,
    tasa_conversion: 8.30,
    roi_global: 387,
    presupuesto_restante: 17110,
    presupuesto_total: 56500,
    clientes_nuevos_mes: 189,
    valor_pipeline: 348500,
    engagement_rate_medio: 3.47,
    nps_campanas: 72,
    contenidos_publicados_mes: 8,
    visitas_web_mes: 105380,
    mejor_canal: 'SEO / Organico',
    peor_canal: 'Meta (Facebook/Instagram)',
    tendencia_leads: 'creciente',
    objetivo_leads_mes: 2500,
    cumplimiento_objetivo: 91.04
  };

  return estadisticas;
}

// ============================================================================
// Exportaciones
// ============================================================================
module.exports = {
  getCampanas,
  getContenidos,
  getAnalytics,
  getLeadsMarketing,
  getROIPorCanal,
  getPresupuestoVsReal,
  getCompetenciaSocial,
  getEstadisticas
};
