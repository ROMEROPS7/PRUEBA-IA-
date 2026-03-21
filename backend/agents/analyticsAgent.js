// ============================================================================
// Agente de Analitica Profunda (Deep Analytics)
// Analiza TODOS los datos de TODOS los departamentos para encontrar patrones
// ocultos, correlaciones e insights que los agentes individuales no detectan.
// ============================================================================

// ---------------------------------------------------------------------------
// Insights diarios generados por IA
// ---------------------------------------------------------------------------
const insightsDiarios = [
  {
    id: 'INS-001',
    fecha: '2026-03-19',
    categoria: 'siniestros',
    prioridad: 'critica',
    insight: 'Los siniestros de hogar aumentan 340% cuando AEMET emite alerta naranja. Recomendacion: pre-posicionar peritos en zonas de alerta.',
    datos_soporte: { siniestros_normales_dia: 12, siniestros_alerta_naranja: 53, coste_medio_hogar: 4200 },
    impacto_estimado: 'Reduccion de 2.1 dias en tiempo medio de resolucion',
    accionable: true,
    accionado: true,
  },
  {
    id: 'INS-002',
    fecha: '2026-03-19',
    categoria: 'fraude',
    prioridad: 'alta',
    insight: 'Los clientes que tardan >5 dias en enviar documentacion tienen 3x mas probabilidad de fraude. Implementar alerta automatica al dia 4.',
    datos_soporte: { prob_fraude_rapidos: 0.04, prob_fraude_lentos: 0.12, umbral_dias: 5, casos_analizados: 8400 },
    impacto_estimado: 'Deteccion temprana de 15-20 fraudes adicionales al trimestre',
    accionable: true,
    accionado: true,
  },
  {
    id: 'INS-003',
    fecha: '2026-03-18',
    categoria: 'operaciones',
    prioridad: 'alta',
    insight: 'El perito Carlos Ruiz resuelve casos de auto un 22% mas rapido que la media. Analizar su metodo para entrenar a otros.',
    datos_soporte: { tiempo_medio_carlos: 3.1, tiempo_medio_general: 4.0, casos_carlos: 142, satisfaccion_carlos: 4.7 },
    impacto_estimado: 'Si todos los peritos igualan su rendimiento: ahorro de 180h/mes en peritajes',
    accionable: true,
    accionado: false,
  },
  {
    id: 'INS-004',
    fecha: '2026-03-18',
    categoria: 'operaciones',
    prioridad: 'alta',
    insight: 'Los lunes entre 9-11h se concentra el 35% de llamadas semanales. Recomendacion: reforzar agentes IA en ese horario y pre-abrir siniestros del fin de semana.',
    datos_soporte: { llamadas_lunes_9_11: 420, llamadas_media_2h: 120, tasa_abandono_lunes: 0.18, tasa_abandono_normal: 0.05 },
    impacto_estimado: 'Reduccion de tasa de abandono del 18% al 5% en hora punta',
    accionable: true,
    accionado: true,
  },
  {
    id: 'INS-005',
    fecha: '2026-03-17',
    categoria: 'retencion',
    prioridad: 'alta',
    insight: 'Clientes con poliza hogar+auto tienen 67% menos churn que los de poliza unica. Cross-selling reduce churn de 12% a 4%.',
    datos_soporte: { churn_poliza_unica: 0.12, churn_multi_poliza: 0.04, clientes_poliza_unica: 14200, potencial_cross_sell: 8500 },
    impacto_estimado: 'Retencion de 680 clientes adicionales al ano = 1.2M EUR en primas',
    accionable: true,
    accionado: true,
  },
  {
    id: 'INS-006',
    fecha: '2026-03-17',
    categoria: 'pricing',
    prioridad: 'critica',
    insight: 'La zona de Valencia genera 2.3x mas siniestros por poliza que Barcelona. Ajustar prima un 15% para equilibrar siniestralidad.',
    datos_soporte: { siniestros_por_poliza_valencia: 0.34, siniestros_por_poliza_barcelona: 0.15, polizas_valencia: 12400, loss_ratio_valencia: 0.89, loss_ratio_barcelona: 0.62 },
    impacto_estimado: 'Mejora del loss ratio de Valencia de 89% a 76%. Impacto: +840K EUR/ano',
    accionable: true,
    accionado: false,
  },
  {
    id: 'INS-007',
    fecha: '2026-03-16',
    categoria: 'satisfaccion',
    prioridad: 'media',
    insight: 'Los clientes que reciben una llamada proactiva tras un siniestro dan un NPS 32 puntos mayor que los que no la reciben.',
    datos_soporte: { nps_con_llamada: 72, nps_sin_llamada: 40, coste_llamada: 4.5, clientes_sin_llamada_mes: 340 },
    impacto_estimado: 'Coste de 1.530 EUR/mes para mejorar NPS medio en 8 puntos',
    accionable: true,
    accionado: true,
  },
  {
    id: 'INS-008',
    fecha: '2026-03-15',
    categoria: 'eficiencia',
    prioridad: 'media',
    insight: 'El 62% de documentos rechazados por el sistema automatico son por baja calidad de imagen. Un pre-procesador de imagen reduciria rechazos un 45%.',
    datos_soporte: { docs_rechazados_mes: 1840, por_baja_calidad: 1141, re_envios_necesarios: 1141, tiempo_medio_re_envio_dias: 2.3 },
    impacto_estimado: 'Ahorro de 513 re-envios/mes = reduccion de 2.3 dias en ciclo de siniestro',
    accionable: true,
    accionado: false,
  },
  {
    id: 'INS-009',
    fecha: '2026-03-14',
    categoria: 'comercial',
    prioridad: 'alta',
    insight: 'Las renovaciones enviadas 45 dias antes del vencimiento tienen 23% mas conversion que las enviadas a 30 dias. Adelantar el ciclo de renovacion.',
    datos_soporte: { conversion_45d: 0.82, conversion_30d: 0.67, renovaciones_mes: 3200, prima_media: 890 },
    impacto_estimado: 'Retencion de 480 polizas adicionales = 427K EUR en primas',
    accionable: true,
    accionado: true,
  },
  {
    id: 'INS-010',
    fecha: '2026-03-13',
    categoria: 'riesgo',
    prioridad: 'media',
    insight: 'Los vehiculos electricos tienen un 40% menos de siniestros pero un 60% mayor coste por siniestro (baterias). Crear producto especifico con prima ajustada.',
    datos_soporte: { frecuencia_ev: 0.05, frecuencia_ice: 0.08, coste_medio_ev: 6800, coste_medio_ice: 4200, polizas_ev: 2100, crecimiento_ev_anual: 0.35 },
    impacto_estimado: 'Captar segmento de 8.000 polizas EV en 2 anos con producto diferenciado',
    accionable: true,
    accionado: false,
  },
];

// ---------------------------------------------------------------------------
// Correlaciones ocultas descubiertas entre datasets
// ---------------------------------------------------------------------------
const correlaciones = [
  {
    id: 'COR-001',
    variables: ['temperatura_media_mensual', 'siniestros_hogar_agua'],
    fuerza: 0.87,
    tipo: 'positiva',
    descripcion: 'Meses con temperatura >35C tienen un pico de siniestros por rotura de tuberias. El calor dilata las juntas antiguas.',
    recomendacion: 'Campana preventiva en junio: revision de tuberias para polizas hogar con vivienda >20 anos.',
    p_valor: 0.001,
    datos_analizados: 36,
  },
  {
    id: 'COR-002',
    variables: ['dias_desde_ultimo_contacto', 'probabilidad_churn'],
    fuerza: 0.79,
    tipo: 'positiva',
    descripcion: 'Cada 30 dias sin contacto, la probabilidad de churn sube un 8%. Clientes sin contacto >180 dias tienen 48% de churn.',
    recomendacion: 'Implementar contacto proactivo trimestral para todos los clientes. Priorizar los >90 dias sin contacto.',
    p_valor: 0.003,
    datos_analizados: 24500,
  },
  {
    id: 'COR-003',
    variables: ['hora_del_dia_reporte', 'probabilidad_fraude'],
    fuerza: 0.65,
    tipo: 'positiva',
    descripcion: 'Siniestros reportados entre 2-5 AM tienen 4.2x mas probabilidad de ser fraudulentos que los reportados en horario laboral.',
    recomendacion: 'Flag automatico de revision para siniestros reportados en madrugada. No rechazar, pero priorizar investigacion.',
    p_valor: 0.008,
    datos_analizados: 15800,
  },
  {
    id: 'COR-004',
    variables: ['numero_polizas_cliente', 'satisfaccion_nps'],
    fuerza: 0.72,
    tipo: 'positiva',
    descripcion: 'Clientes con 3+ polizas dan NPS medio de 68, vs 42 de los de poliza unica. La percepcion de valor integral mejora la satisfaccion.',
    recomendacion: 'Incentivos de bundling: descuento del 10% a partir de la 3a poliza. ROI positivo en retencion.',
    p_valor: 0.002,
    datos_analizados: 32100,
  },
  {
    id: 'COR-005',
    variables: ['velocidad_primera_respuesta', 'litigiosidad'],
    fuerza: 0.81,
    tipo: 'negativa',
    descripcion: 'Siniestros con primera respuesta en <2h tienen 75% menos demandas que los que tardan >48h. La rapidez reduce conflictos.',
    recomendacion: 'SLA de primera respuesta <2h para siniestros de severidad alta. Automatizar acuse de recibo inmediato para todos.',
    p_valor: 0.001,
    datos_analizados: 8900,
  },
  {
    id: 'COR-006',
    variables: ['antiguedad_cliente_anos', 'coste_medio_siniestro'],
    fuerza: 0.58,
    tipo: 'negativa',
    descripcion: 'Clientes con >10 anos de antiguedad generan siniestros un 28% mas baratos. Son mas cuidadosos y reportan antes.',
    recomendacion: 'Programa de fidelizacion: reduccion de prima del 2% por ano de antiguedad (cap 20%). Coste compensado por menor siniestralidad.',
    p_valor: 0.012,
    datos_analizados: 18700,
  },
  {
    id: 'COR-007',
    variables: ['uso_app_movil', 'renovacion_poliza'],
    fuerza: 0.74,
    tipo: 'positiva',
    descripcion: 'Clientes que usan la app >3 veces/mes renuevan un 34% mas que los que no la usan. El engagement digital retiene.',
    recomendacion: 'Gamificacion en app: recompensas por login diario, revision de poliza, subida de documentos. Target: 3 usos/mes.',
    p_valor: 0.004,
    datos_analizados: 21300,
  },
  {
    id: 'COR-008',
    variables: ['indice_precio_gasolina', 'siniestros_auto_frecuencia'],
    fuerza: 0.63,
    tipo: 'negativa',
    descripcion: 'Cuando la gasolina sube >10%, los siniestros de auto bajan un 12% al mes siguiente. La gente conduce menos.',
    recomendacion: 'Modelo de pricing dinamico que ajuste la prima auto en base al precio de la gasolina. Pricing mas justo = ventaja competitiva.',
    p_valor: 0.015,
    datos_analizados: 48,
  },
];

// ---------------------------------------------------------------------------
// Anomalias estadisticas detectadas
// ---------------------------------------------------------------------------
const anomalias = [
  {
    id: 'ANO-001',
    fecha_deteccion: '2026-03-18',
    tipo: 'volumen',
    descripcion: 'Pico anormal de siniestros de responsabilidad civil en zona de Tarragona. 8x la media semanal.',
    z_score: 4.2,
    valor_observado: 24,
    valor_esperado: 3,
    estado_investigacion: 'investigando',
    hipotesis: 'Posible evento masivo (accidente industrial) o fraude organizado. Verificando con medios locales y fuerzas de seguridad.',
    accion_tomada: 'Alerta al equipo de fraude. Siniestros bloqueados para revision manual.',
  },
  {
    id: 'ANO-002',
    fecha_deteccion: '2026-03-16',
    tipo: 'patron',
    descripcion: '5 siniestros de robo en vivienda en la misma urbanizacion de Pozuelo en 10 dias. Patron de reclamacion similar.',
    z_score: 3.8,
    valor_observado: 5,
    valor_esperado: 0.3,
    estado_investigacion: 'confirmada_fraude',
    hipotesis: 'Red de fraude organizado. Denuncias policiales identicas, perito sospechoso vinculado a los 5 casos.',
    accion_tomada: 'Casos derivados a departamento legal. Perito suspendido. Ahorro estimado: 85.000 EUR.',
  },
  {
    id: 'ANO-003',
    fecha_deteccion: '2026-03-14',
    tipo: 'tendencia',
    descripcion: 'Caida del 28% en nuevas polizas de auto en Catalunya en las ultimas 3 semanas vs misma epoca ano anterior.',
    z_score: 2.9,
    valor_observado: 145,
    valor_esperado: 201,
    estado_investigacion: 'investigando',
    hipotesis: 'Competidor lanzando campana agresiva de pricing en la zona. Verificar con equipo comercial.',
    accion_tomada: 'Analisis competitivo urgente. Propuesta de campana de contraoferta en preparacion.',
  },
  {
    id: 'ANO-004',
    fecha_deteccion: '2026-03-12',
    tipo: 'coste',
    descripcion: 'Coste medio de siniestros de salud sube un 45% en marzo vs febrero. Sin aumento proporcional de frecuencia.',
    z_score: 3.1,
    valor_observado: 2850,
    valor_esperado: 1965,
    estado_investigacion: 'resuelta',
    hipotesis: 'Clinica concertada Salud Plus ha subido tarifas un 40% sin notificacion. 3 procedimientos especificos afectados.',
    accion_tomada: 'Negociacion con clinica: reversion parcial de tarifas. Contrato renegociado con tope de incremento anual del 5%.',
  },
  {
    id: 'ANO-005',
    fecha_deteccion: '2026-03-10',
    tipo: 'comportamiento',
    descripcion: 'Cliente VIP CLI-012 (3 polizas, 12 anos) ha consultado condiciones de cancelacion 4 veces en 1 semana.',
    z_score: 2.6,
    valor_observado: 4,
    valor_esperado: 0.1,
    estado_investigacion: 'resuelta',
    hipotesis: 'Cliente insatisfecho o con oferta de competidor. Alto riesgo de churn.',
    accion_tomada: 'Llamada proactiva del agente de retencion. Ofrecido descuento del 12% y mejora de coberturas. Cliente retenido.',
  },
];

// ---------------------------------------------------------------------------
// Predicciones avanzadas cross-departamento
// ---------------------------------------------------------------------------
function getPrediccionesAvanzadas() {
  return {
    timestamp: new Date().toISOString(),
    horizonte: 'Q2 2026 (abril-junio)',
    predicciones: {
      churn_por_segmento: {
        descripcion: 'Probabilidad de churn por segmento en Q2 2026',
        segmentos: [
          { segmento: 'Particulares - poliza unica', clientes: 14200, churn_predicho_pct: 11.5, churn_actual_pct: 12.0, tendencia: 'mejorando' },
          { segmento: 'Particulares - multi-poliza', clientes: 8900, churn_predicho_pct: 3.8, churn_actual_pct: 4.2, tendencia: 'mejorando' },
          { segmento: 'Autonomos', clientes: 3400, churn_predicho_pct: 8.2, churn_actual_pct: 7.5, tendencia: 'empeorando' },
          { segmento: 'PYMES', clientes: 1200, churn_predicho_pct: 5.1, churn_actual_pct: 5.4, tendencia: 'estable' },
          { segmento: 'Grandes cuentas', clientes: 85, churn_predicho_pct: 2.0, churn_actual_pct: 1.8, tendencia: 'estable' },
        ],
        clientes_en_riesgo_total: 2180,
        valor_en_riesgo_eur: 3_450_000,
        acciones_recomendadas: [
          'Campana de cross-selling para polizas unicas: target 3.000 clientes con mayor propension',
          'Revision de pricing para autonomos: competidor ha bajado primas un 8%',
          'Programa VIP reforzado para grandes cuentas con renovacion en Q2',
        ],
      },
      forecast_ingresos: {
        descripcion: 'Prevision de ingresos ajustada por factores externos',
        base_eur: 12_800_000,
        ajustes: [
          { factor: 'Prevision meteorologica AEMET (DANA en mayo)', impacto_eur: -420_000, confianza: 0.65 },
          { factor: 'Crecimiento economico PIB +2.1%', impacto_eur: 180_000, confianza: 0.80 },
          { factor: 'Competidor nuevo en mercado auto', impacto_eur: -250_000, confianza: 0.55 },
          { factor: 'Campana cross-selling planificada', impacto_eur: 340_000, confianza: 0.70 },
          { factor: 'Incremento regulatorio Solvencia II', impacto_eur: -90_000, confianza: 0.90 },
        ],
        forecast_ajustado_eur: 12_560_000,
        rango_confianza: { minimo: 11_900_000, maximo: 13_200_000, nivel_confianza: 0.90 },
      },
      necesidades_personal: {
        descripcion: 'Necesidades de personal basadas en volumen de siniestros previsto',
        prediccion_siniestros_q2: 4800,
        siniestros_q1_real: 4200,
        incremento_pct: 14.3,
        recursos_actuales: {
          peritos_auto: 12,
          peritos_hogar: 8,
          gestores_siniestros: 15,
          agentes_atencion: 10,
        },
        recursos_necesarios: {
          peritos_auto: 14,
          peritos_hogar: 11,
          gestores_siniestros: 17,
          agentes_atencion: 12,
        },
        contrataciones_recomendadas: [
          { rol: 'Perito de auto', cantidad: 2, urgencia: 'media', coste_mensual: 3200 },
          { rol: 'Perito de hogar', cantidad: 3, urgencia: 'alta', coste_mensual: 3400 },
          { rol: 'Gestor de siniestros', cantidad: 2, urgencia: 'media', coste_mensual: 2800 },
          { rol: 'Agente de atencion', cantidad: 2, urgencia: 'baja', coste_mensual: 2200 },
        ],
        alternativa_ia: 'Ampliar capacidad de agentes IA puede cubrir el equivalente a 3 gestores humanos. Coste: 1.200 EUR/mes vs 8.400 EUR/mes.',
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Oportunidades de negocio detectadas desde los datos
// ---------------------------------------------------------------------------
const oportunidades = [
  {
    id: 'OPO-001',
    fecha_deteccion: '2026-03-18',
    titulo: 'Producto de seguro para vehiculos electricos',
    descripcion: 'El parque de EV crece un 35% anual. Ningun competidor tiene producto especifico. Prima ajustada a menor frecuencia pero mayor coste por siniestro.',
    roi_estimado: { inversion_eur: 45_000, retorno_anual_eur: 520_000, payback_meses: 1 },
    prioridad: 'alta',
    departamentos_implicados: ['producto', 'pricing', 'marketing', 'legal'],
    estado: 'en_evaluacion',
  },
  {
    id: 'OPO-002',
    fecha_deteccion: '2026-03-16',
    titulo: 'Seguro parametrico por DANA para empresas agricolas',
    descripcion: 'Las DANAs recurrentes en Levante permiten crear un seguro parametrico que pague automaticamente al activarse alerta roja AEMET. Sin peritaje.',
    roi_estimado: { inversion_eur: 80_000, retorno_anual_eur: 380_000, payback_meses: 3 },
    prioridad: 'alta',
    departamentos_implicados: ['producto', 'pricing', 'tecnologia', 'legal'],
    estado: 'prototipo',
  },
  {
    id: 'OPO-003',
    fecha_deteccion: '2026-03-14',
    titulo: 'Cross-selling automatizado por eventos de vida',
    descripcion: 'Detectar eventos de vida (nacimiento, compra vivienda, jubilacion) via datos del cliente y ofrecer producto relevante en <24h. Conversion estimada 18%.',
    roi_estimado: { inversion_eur: 35_000, retorno_anual_eur: 890_000, payback_meses: 0.5 },
    prioridad: 'critica',
    departamentos_implicados: ['marketing', 'tecnologia', 'comercial'],
    estado: 'implementando',
  },
  {
    id: 'OPO-004',
    fecha_deteccion: '2026-03-12',
    titulo: 'Alianza con talleres concertados para reducir coste de siniestros auto',
    descripcion: 'Red de 45 talleres ofrece 22% de descuento por volumen garantizado. Ahorro de 1.2M EUR/ano en costes de reparacion.',
    roi_estimado: { inversion_eur: 15_000, retorno_anual_eur: 1_200_000, payback_meses: 0.2 },
    prioridad: 'critica',
    departamentos_implicados: ['compras', 'siniestros', 'legal'],
    estado: 'negociando',
  },
  {
    id: 'OPO-005',
    fecha_deteccion: '2026-03-10',
    titulo: 'Micro-seguros on-demand para economia gig',
    descripcion: 'Riders, conductores VTC y freelancers necesitan coberturas por horas/dias. Mercado de 120.000 potenciales clientes en Espana.',
    roi_estimado: { inversion_eur: 120_000, retorno_anual_eur: 960_000, payback_meses: 1.5 },
    prioridad: 'alta',
    departamentos_implicados: ['producto', 'tecnologia', 'pricing', 'legal', 'marketing'],
    estado: 'investigacion',
  },
  {
    id: 'OPO-006',
    fecha_deteccion: '2026-03-08',
    titulo: 'Monetizacion de datos anonimizados para sector inmobiliario',
    descripcion: 'Datos anonimizados de siniestros de hogar (zonas de riesgo, tipos de danio) tienen alto valor para constructoras e inmobiliarias.',
    roi_estimado: { inversion_eur: 60_000, retorno_anual_eur: 240_000, payback_meses: 3 },
    prioridad: 'media',
    departamentos_implicados: ['legal', 'tecnologia', 'comercial'],
    estado: 'evaluacion_legal',
  },
];

// ---------------------------------------------------------------------------
// Funciones principales
// ---------------------------------------------------------------------------

/** Devuelve los insights diarios generados por IA con priorizacion */
function getInsightsDiarios() {
  const hoy = insightsDiarios.filter(i => i.fecha === '2026-03-19');
  const recientes = insightsDiarios.filter(i => i.fecha !== '2026-03-19');
  return {
    fecha: '2026-03-19',
    insights_hoy: hoy,
    insights_recientes: recientes,
    total: insightsDiarios.length,
    accionados: insightsDiarios.filter(i => i.accionado).length,
    pendientes_accion: insightsDiarios.filter(i => i.accionable && !i.accionado).length,
    categorias: [...new Set(insightsDiarios.map(i => i.categoria))],
    nota: 'Los insights se generan diariamente cruzando datos de todos los agentes del sistema.',
  };
}

/** Devuelve las correlaciones ocultas descubiertas entre datasets */
function getCorrelaciones() {
  return {
    total: correlaciones.length,
    correlaciones: correlaciones.sort((a, b) => b.fuerza - a.fuerza),
    resumen: {
      correlacion_mas_fuerte: correlaciones.reduce((max, c) => c.fuerza > max.fuerza ? c : max),
      positivas: correlaciones.filter(c => c.tipo === 'positiva').length,
      negativas: correlaciones.filter(c => c.tipo === 'negativa').length,
      fuerza_media: Math.round(correlaciones.reduce((sum, c) => sum + c.fuerza, 0) / correlaciones.length * 100) / 100,
      significativas_p005: correlaciones.filter(c => c.p_valor < 0.05).length,
    },
    metodologia: 'Analisis de correlacion de Pearson/Spearman sobre datasets de los ultimos 12 meses. Solo se muestran correlaciones con p-valor < 0.05.',
  };
}

/** Devuelve las anomalias estadisticas detectadas */
function getAnomalias() {
  return {
    total: anomalias.length,
    anomalias: anomalias.sort((a, b) => b.z_score - a.z_score),
    resumen: {
      investigando: anomalias.filter(a => a.estado_investigacion === 'investigando').length,
      confirmadas: anomalias.filter(a => a.estado_investigacion === 'confirmada_fraude').length,
      resueltas: anomalias.filter(a => a.estado_investigacion === 'resuelta').length,
      z_score_medio: Math.round(anomalias.reduce((sum, a) => sum + a.z_score, 0) / anomalias.length * 10) / 10,
    },
    umbral_deteccion: 'z-score > 2.5 (probabilidad < 0.6% de ser aleatorio)',
    metodologia: 'Deteccion de anomalias via Isolation Forest + z-score sobre series temporales de 12 meses.',
  };
}

/** Predicciones avanzadas que trascienden los agentes individuales */
// (definida arriba como funcion completa)

/** Devuelve las oportunidades de negocio detectadas desde los datos */
function getOportunidades() {
  const totalROI = oportunidades.reduce((sum, o) => sum + o.roi_estimado.retorno_anual_eur, 0);
  const totalInversion = oportunidades.reduce((sum, o) => sum + o.roi_estimado.inversion_eur, 0);
  return {
    total: oportunidades.length,
    oportunidades: oportunidades.sort((a, b) => {
      const prioridadOrden = { critica: 0, alta: 1, media: 2, baja: 3 };
      return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
    }),
    resumen: {
      por_prioridad: {
        critica: oportunidades.filter(o => o.prioridad === 'critica').length,
        alta: oportunidades.filter(o => o.prioridad === 'alta').length,
        media: oportunidades.filter(o => o.prioridad === 'media').length,
      },
      por_estado: {
        investigacion: oportunidades.filter(o => o.estado === 'investigacion').length,
        en_evaluacion: oportunidades.filter(o => o.estado === 'en_evaluacion').length,
        prototipo: oportunidades.filter(o => o.estado === 'prototipo').length,
        implementando: oportunidades.filter(o => o.estado === 'implementando').length,
        negociando: oportunidades.filter(o => o.estado === 'negociando').length,
        evaluacion_legal: oportunidades.filter(o => o.estado === 'evaluacion_legal').length,
      },
      roi_total_potencial_eur: totalROI,
      inversion_total_requerida_eur: totalInversion,
      ratio_retorno: Math.round(totalROI / totalInversion * 10) / 10,
    },
  };
}

/** Dashboard inteligente: solo muestra lo que importa HOY */
function getDashboardInteligente() {
  const insightsCriticos = insightsDiarios.filter(i => i.prioridad === 'critica' && !i.accionado);
  const insightsAltos = insightsDiarios.filter(i => i.prioridad === 'alta' && !i.accionado);
  const anomaliasActivas = anomalias.filter(a => a.estado_investigacion === 'investigando');
  const oportunidadesCriticas = oportunidades.filter(o => o.prioridad === 'critica');

  return {
    fecha: '2026-03-19',
    titulo: 'Dashboard Inteligente - Solo lo que importa hoy',
    relevancia_calculada_por: 'IA analitica basada en urgencia, impacto economico y ventana de accion',
    secciones: {
      atencion_inmediata: {
        titulo: 'Requiere atencion inmediata',
        items: [
          ...insightsCriticos.map(i => ({
            tipo: 'insight_critico',
            mensaje: i.insight,
            impacto: i.impacto_estimado,
            accion: 'Revisar y accionar hoy',
          })),
          ...anomaliasActivas.map(a => ({
            tipo: 'anomalia',
            mensaje: a.descripcion,
            z_score: a.z_score,
            accion: a.accion_tomada,
          })),
        ],
      },
      oportunidades_top: {
        titulo: 'Oportunidades de mayor impacto',
        items: oportunidadesCriticas.map(o => ({
          titulo: o.titulo,
          roi: `${o.roi_estimado.retorno_anual_eur.toLocaleString('es-ES')} EUR/ano`,
          estado: o.estado,
          payback: `${o.roi_estimado.payback_meses} meses`,
        })),
      },
      insights_pendientes: {
        titulo: 'Insights de alta prioridad sin accionar',
        items: insightsAltos.map(i => ({
          insight: i.insight,
          categoria: i.categoria,
          impacto: i.impacto_estimado,
        })),
      },
      metricas_clave_hoy: {
        titulo: 'KPIs del dia',
        kpis: {
          siniestros_abiertos_hoy: 18,
          siniestros_cerrados_hoy: 22,
          nps_tiempo_real: 64,
          loss_ratio_mes: 0.71,
          tasa_retencion_mes: 0.96,
          fraudes_detectados_semana: 3,
          ahorro_fraude_semana_eur: 127_000,
          satisfaccion_agentes_ia: 4.3,
        },
      },
      tendencias: {
        titulo: 'Tendencias a vigilar',
        items: [
          { metrica: 'Churn autonomos', direccion: 'subiendo', valor_actual: '8.2%', valor_anterior: '7.5%', alerta: true },
          { metrica: 'Loss ratio Valencia', direccion: 'estable_alto', valor_actual: '89%', valor_anterior: '87%', alerta: true },
          { metrica: 'NPS general', direccion: 'subiendo', valor_actual: '64', valor_anterior: '58', alerta: false },
          { metrica: 'Tiempo resolucion siniestros', direccion: 'bajando', valor_actual: '3.8 dias', valor_anterior: '4.2 dias', alerta: false },
          { metrica: 'Nuevas polizas Catalunya', direccion: 'bajando', valor_actual: '-28%', valor_anterior: '+5%', alerta: true },
        ],
      },
    },
    actualizado: new Date().toISOString(),
    proxima_actualizacion: 'en 15 minutos',
  };
}

/** Estadisticas del agente de analitica */
function getEstadisticas() {
  return {
    periodo: 'Marzo 2026',
    insights_generados_mes: 47,
    insights_accionados: 31,
    insights_accionados_pct: 66,
    correlaciones_descubiertas: correlaciones.length,
    correlaciones_nuevas_mes: 3,
    anomalias_detectadas_mes: anomalias.length,
    anomalias_confirmadas: anomalias.filter(a => a.estado_investigacion !== 'investigando').length,
    predicciones_realizadas: 28,
    predicciones_acertadas_pct: 84,
    oportunidades_identificadas: oportunidades.length,
    oportunidades_en_implementacion: oportunidades.filter(o => o.estado === 'implementando' || o.estado === 'negociando').length,
    valor_generado_por_insights: {
      ahorro_fraude_eur: 425_000,
      mejora_retencion_eur: 890_000,
      optimizacion_operativa_eur: 320_000,
      nuevos_ingresos_eur: 210_000,
      total_eur: 1_845_000,
    },
    precision_modelos: {
      prediccion_churn: 0.87,
      deteccion_fraude: 0.92,
      prediccion_siniestralidad: 0.81,
      prediccion_nps: 0.78,
      media: 0.845,
    },
    datos_procesados: {
      registros_analizados: 2_340_000,
      fuentes_datos: 22,
      features_extraidas: 487,
      modelos_activos: 14,
      tiempo_procesamiento_medio_ms: 4200,
    },
    comparativa_sin_analytics: {
      fraudes_no_detectados_estimados: 12,
      valor_fraudes_no_detectados_eur: 340_000,
      oportunidades_perdidas_eur: 1_500_000,
      decisiones_basadas_en_datos_pct: { con_analytics: 89, sin_analytics: 23 },
    },
  };
}

// ============================================================================
// Exports
// ============================================================================
module.exports = {
  getInsightsDiarios,
  getCorrelaciones,
  getAnomalias,
  getPrediccionesAvanzadas,
  getOportunidades,
  getDashboardInteligente,
  getEstadisticas,
};
