const { v4: uuidv4 } = require('uuid');

// ============================================================================
// BASE DE DATOS EN MEMORIA - PROVEEDORES
// ============================================================================

const proveedores = [
  // TALLERES (5)
  {
    id: 'prov-t001', nombre: 'Talleres García Hermanos', tipo: 'taller',
    telefono: '+34 912 345 001', zona: 'Madrid', precio_medio: 1450, calidad: 4.5,
    tiempo_respuesta_horas: 4,
    historial_precios: [
      { fecha: '2025-11-10', precio: 1600, servicio: 'Reparación chapa y pintura' },
      { fecha: '2025-12-05', precio: 1350, servicio: 'Sustitución paragolpes' },
      { fecha: '2026-01-15', precio: 1500, servicio: 'Reparación lateral completo' },
      { fecha: '2026-02-20', precio: 1400, servicio: 'Reparación capó y faros' },
    ]
  },
  {
    id: 'prov-t002', nombre: 'AutoFix Levante S.L.', tipo: 'taller',
    telefono: '+34 963 456 002', zona: 'Valencia', precio_medio: 1280, calidad: 4.0,
    tiempo_respuesta_horas: 6,
    historial_precios: [
      { fecha: '2025-10-20', precio: 1200, servicio: 'Reparación puerta' },
      { fecha: '2025-12-18', precio: 1350, servicio: 'Chapa y pintura integral' },
      { fecha: '2026-01-28', precio: 1100, servicio: 'Sustitución retrovisor y chapa' },
    ]
  },
  {
    id: 'prov-t003', nombre: 'Carrocerías Martínez', tipo: 'taller',
    telefono: '+34 934 567 003', zona: 'Barcelona', precio_medio: 1650, calidad: 4.8,
    tiempo_respuesta_horas: 3,
    historial_precios: [
      { fecha: '2025-11-02', precio: 1800, servicio: 'Reparación integral frontal' },
      { fecha: '2026-01-10', precio: 1500, servicio: 'Pintura completa lateral' },
      { fecha: '2026-02-14', precio: 1700, servicio: 'Sustitución aleta y faro' },
    ]
  },
  {
    id: 'prov-t004', nombre: 'Talleres Rápidos del Sur', tipo: 'taller',
    telefono: '+34 955 678 004', zona: 'Sevilla', precio_medio: 1100, calidad: 3.5,
    tiempo_respuesta_horas: 8,
    historial_precios: [
      { fecha: '2025-12-01', precio: 1050, servicio: 'Reparación menor chapa' },
      { fecha: '2026-01-20', precio: 1200, servicio: 'Pintura parcial' },
      { fecha: '2026-02-28', precio: 950, servicio: 'Sustitución espejo lateral' },
    ]
  },
  {
    id: 'prov-t005', nombre: 'MegaAuto Taller Express', tipo: 'taller',
    telefono: '+34 912 789 005', zona: 'Madrid', precio_medio: 1350, calidad: 3.8,
    tiempo_respuesta_horas: 5,
    historial_precios: [
      { fecha: '2025-11-25', precio: 1400, servicio: 'Reparación paragolpes trasero' },
      { fecha: '2026-01-05', precio: 1250, servicio: 'Chapa lateral derecho' },
      { fecha: '2026-02-15', precio: 1500, servicio: 'Reparación completa frontal' },
    ]
  },

  // FONTANEROS (3)
  {
    id: 'prov-f001', nombre: 'Fontanería Rápida López', tipo: 'fontanero',
    telefono: '+34 912 111 006', zona: 'Madrid', precio_medio: 450, calidad: 4.2,
    tiempo_respuesta_horas: 2,
    historial_precios: [
      { fecha: '2025-11-15', precio: 380, servicio: 'Reparación tubería cocina' },
      { fecha: '2025-12-22', precio: 520, servicio: 'Sustitución calentador' },
      { fecha: '2026-01-30', precio: 450, servicio: 'Reparación fuga baño' },
      { fecha: '2026-02-18', precio: 600, servicio: 'Instalación grifo termostático' },
    ]
  },
  {
    id: 'prov-f002', nombre: 'AquaServicios Mediterráneo', tipo: 'fontanero',
    telefono: '+34 963 222 007', zona: 'Valencia', precio_medio: 380, calidad: 3.9,
    tiempo_respuesta_horas: 3,
    historial_precios: [
      { fecha: '2025-12-10', precio: 350, servicio: 'Desatasco general' },
      { fecha: '2026-01-22', precio: 420, servicio: 'Reparación cisterna' },
      { fecha: '2026-02-05', precio: 300, servicio: 'Cambio de grifería' },
    ]
  },
  {
    id: 'prov-f003', nombre: 'Fontaneros Unidos BCN', tipo: 'fontanero',
    telefono: '+34 934 333 008', zona: 'Barcelona', precio_medio: 520, calidad: 4.6,
    tiempo_respuesta_horas: 2,
    historial_precios: [
      { fecha: '2025-11-08', precio: 480, servicio: 'Reparación bajante' },
      { fecha: '2025-12-30', precio: 550, servicio: 'Sustitución tubería principal' },
      { fecha: '2026-02-12', precio: 620, servicio: 'Reparación urgente inundación' },
    ]
  },

  // ELECTRICISTAS (3)
  {
    id: 'prov-e001', nombre: 'ElectroHogar Madrid', tipo: 'electricista',
    telefono: '+34 912 444 009', zona: 'Madrid', precio_medio: 350, calidad: 4.3,
    tiempo_respuesta_horas: 3,
    historial_precios: [
      { fecha: '2025-11-20', precio: 300, servicio: 'Revisión cuadro eléctrico' },
      { fecha: '2025-12-15', precio: 420, servicio: 'Instalación diferencial' },
      { fecha: '2026-01-25', precio: 280, servicio: 'Reparación cortocircuito' },
      { fecha: '2026-02-22', precio: 500, servicio: 'Cableado nuevo salón' },
    ]
  },
  {
    id: 'prov-e002', nombre: 'Instalaciones Eléctricas Fernández', tipo: 'electricista',
    telefono: '+34 955 555 010', zona: 'Sevilla', precio_medio: 280, calidad: 3.7,
    tiempo_respuesta_horas: 5,
    historial_precios: [
      { fecha: '2025-12-08', precio: 250, servicio: 'Reparación enchufe' },
      { fecha: '2026-01-18', precio: 320, servicio: 'Cambio de luminarias' },
      { fecha: '2026-02-10', precio: 230, servicio: 'Revisión instalación' },
    ]
  },
  {
    id: 'prov-e003', nombre: 'VoltioExpress Catalunya', tipo: 'electricista',
    telefono: '+34 934 666 011', zona: 'Barcelona', precio_medio: 400, calidad: 4.5,
    tiempo_respuesta_horas: 2,
    historial_precios: [
      { fecha: '2025-11-12', precio: 380, servicio: 'Instalación magnetotérmico' },
      { fecha: '2026-01-08', precio: 450, servicio: 'Cableado cocina nueva' },
      { fecha: '2026-02-20', precio: 350, servicio: 'Reparación cuadro general' },
    ]
  },

  // CRISTALEROS (3)
  {
    id: 'prov-c001', nombre: 'Cristalería del Centro', tipo: 'cristalero',
    telefono: '+34 912 777 012', zona: 'Madrid', precio_medio: 250, calidad: 4.1,
    tiempo_respuesta_horas: 4,
    historial_precios: [
      { fecha: '2025-11-18', precio: 220, servicio: 'Sustitución ventana salón' },
      { fecha: '2025-12-28', precio: 300, servicio: 'Cristal doble cámara' },
      { fecha: '2026-01-15', precio: 180, servicio: 'Cristal puerta balcón' },
      { fecha: '2026-02-25', precio: 350, servicio: 'Mampara baño templado' },
    ]
  },
  {
    id: 'prov-c002', nombre: 'VidrioRápido Levante', tipo: 'cristalero',
    telefono: '+34 963 888 013', zona: 'Valencia', precio_medio: 200, calidad: 3.8,
    tiempo_respuesta_horas: 5,
    historial_precios: [
      { fecha: '2025-12-05', precio: 180, servicio: 'Cristal ventana cocina' },
      { fecha: '2026-01-20', precio: 220, servicio: 'Espejo empotrado' },
      { fecha: '2026-02-08', precio: 160, servicio: 'Cristal puerta interior' },
    ]
  },
  {
    id: 'prov-c003', nombre: 'Cristales Mediterráneo BCN', tipo: 'cristalero',
    telefono: '+34 934 999 014', zona: 'Barcelona', precio_medio: 310, calidad: 4.7,
    tiempo_respuesta_horas: 3,
    historial_precios: [
      { fecha: '2025-11-25', precio: 280, servicio: 'Sustitución luna escaparate' },
      { fecha: '2026-01-12', precio: 350, servicio: 'Cristal blindado entrada' },
      { fecha: '2026-02-18', precio: 290, servicio: 'Mampara ducha a medida' },
    ]
  },

  // CERRAJEROS (3)
  {
    id: 'prov-j001', nombre: 'Cerrajería 24h Madrid', tipo: 'cerrajero',
    telefono: '+34 912 100 015', zona: 'Madrid', precio_medio: 150, calidad: 4.0,
    tiempo_respuesta_horas: 1,
    historial_precios: [
      { fecha: '2025-11-10', precio: 120, servicio: 'Apertura puerta blindada' },
      { fecha: '2025-12-20', precio: 180, servicio: 'Cambio cerradura seguridad' },
      { fecha: '2026-01-28', precio: 140, servicio: 'Reparación cerradura' },
      { fecha: '2026-02-15', precio: 200, servicio: 'Instalación cerradura antibumping' },
    ]
  },
  {
    id: 'prov-j002', nombre: 'LlaveExpress Andalucía', tipo: 'cerrajero',
    telefono: '+34 955 200 016', zona: 'Sevilla', precio_medio: 120, calidad: 3.6,
    tiempo_respuesta_horas: 2,
    historial_precios: [
      { fecha: '2025-12-12', precio: 100, servicio: 'Apertura urgente' },
      { fecha: '2026-01-15', precio: 140, servicio: 'Cambio bombín' },
      { fecha: '2026-02-22', precio: 110, servicio: 'Copia llave seguridad' },
    ]
  },
  {
    id: 'prov-j003', nombre: 'Cerrajeros Seguros BCN', tipo: 'cerrajero',
    telefono: '+34 934 300 017', zona: 'Barcelona', precio_medio: 180, calidad: 4.4,
    tiempo_respuesta_horas: 1,
    historial_precios: [
      { fecha: '2025-11-30', precio: 160, servicio: 'Apertura sin daños' },
      { fecha: '2026-01-10', precio: 200, servicio: 'Cerradura multipunto' },
      { fecha: '2026-02-05', precio: 170, servicio: 'Reparación mecanismo' },
    ]
  },

  // PERITOS (3)
  {
    id: 'prov-p001', nombre: 'Peritaciones Rodríguez & Asociados', tipo: 'perito',
    telefono: '+34 912 500 018', zona: 'Madrid', precio_medio: 400, calidad: 4.6,
    tiempo_respuesta_horas: 24,
    historial_precios: [
      { fecha: '2025-11-05', precio: 380, servicio: 'Peritación vehículo' },
      { fecha: '2025-12-15', precio: 450, servicio: 'Peritación hogar daños agua' },
      { fecha: '2026-01-22', precio: 350, servicio: 'Peritación robo' },
      { fecha: '2026-02-10', precio: 420, servicio: 'Peritación incendio parcial' },
    ]
  },
  {
    id: 'prov-p002', nombre: 'ValorPerit Levante', tipo: 'perito',
    telefono: '+34 963 600 019', zona: 'Valencia', precio_medio: 340, calidad: 4.0,
    tiempo_respuesta_horas: 48,
    historial_precios: [
      { fecha: '2025-12-08', precio: 320, servicio: 'Peritación daños menores' },
      { fecha: '2026-01-18', precio: 380, servicio: 'Peritación vehículo colisión' },
      { fecha: '2026-02-28', precio: 300, servicio: 'Peritación electrodomésticos' },
    ]
  },
  {
    id: 'prov-p003', nombre: 'ExpertPerit Catalunya', tipo: 'perito',
    telefono: '+34 934 700 020', zona: 'Barcelona', precio_medio: 480, calidad: 4.9,
    tiempo_respuesta_horas: 12,
    historial_precios: [
      { fecha: '2025-11-18', precio: 450, servicio: 'Peritación integral hogar' },
      { fecha: '2026-01-05', precio: 500, servicio: 'Peritación siniestro total' },
      { fecha: '2026-02-20', precio: 520, servicio: 'Peritación daños estructurales' },
    ]
  },
];

// ============================================================================
// BASE DE DATOS EN MEMORIA - NEGOCIACIONES COMPLETADAS (15+ pre-pobladas)
// ============================================================================

const negociacionesCompletadas = [
  {
    id: 'neg-001', siniestro_id: 'SIN-2026-001', fecha: '2026-01-08',
    tipo_servicio: 'taller', zona: 'Madrid', proveedor_id: 'prov-t001',
    proveedor_nombre: 'Talleres García Hermanos',
    precio_inicial: 1600, precio_final: 1220, ahorro: 380,
    porcentaje_ahorro: 23.75, pasos: 10, estado: 'completada'
  },
  {
    id: 'neg-002', siniestro_id: 'SIN-2026-002', fecha: '2026-01-12',
    tipo_servicio: 'fontanero', zona: 'Madrid', proveedor_id: 'prov-f001',
    proveedor_nombre: 'Fontanería Rápida López',
    precio_inicial: 520, precio_final: 385, ahorro: 135,
    porcentaje_ahorro: 25.96, pasos: 9, estado: 'completada'
  },
  {
    id: 'neg-003', siniestro_id: 'SIN-2026-003', fecha: '2026-01-15',
    tipo_servicio: 'electricista', zona: 'Barcelona', proveedor_id: 'prov-e003',
    proveedor_nombre: 'VoltioExpress Catalunya',
    precio_inicial: 450, precio_final: 340, ahorro: 110,
    porcentaje_ahorro: 24.44, pasos: 8, estado: 'completada'
  },
  {
    id: 'neg-004', siniestro_id: 'SIN-2026-004', fecha: '2026-01-20',
    tipo_servicio: 'cristalero', zona: 'Valencia', proveedor_id: 'prov-c002',
    proveedor_nombre: 'VidrioRápido Levante',
    precio_inicial: 240, precio_final: 165, ahorro: 75,
    porcentaje_ahorro: 31.25, pasos: 8, estado: 'completada'
  },
  {
    id: 'neg-005', siniestro_id: 'SIN-2026-005', fecha: '2026-01-25',
    tipo_servicio: 'cerrajero', zona: 'Madrid', proveedor_id: 'prov-j001',
    proveedor_nombre: 'Cerrajería 24h Madrid',
    precio_inicial: 190, precio_final: 135, ahorro: 55,
    porcentaje_ahorro: 28.95, pasos: 7, estado: 'completada'
  },
  {
    id: 'neg-006', siniestro_id: 'SIN-2026-006', fecha: '2026-01-28',
    tipo_servicio: 'taller', zona: 'Valencia', proveedor_id: 'prov-t002',
    proveedor_nombre: 'AutoFix Levante S.L.',
    precio_inicial: 1350, precio_final: 1050, ahorro: 300,
    porcentaje_ahorro: 22.22, pasos: 11, estado: 'completada'
  },
  {
    id: 'neg-007', siniestro_id: 'SIN-2026-007', fecha: '2026-02-02',
    tipo_servicio: 'fontanero', zona: 'Barcelona', proveedor_id: 'prov-f003',
    proveedor_nombre: 'Fontaneros Unidos BCN',
    precio_inicial: 580, precio_final: 420, ahorro: 160,
    porcentaje_ahorro: 27.59, pasos: 9, estado: 'completada'
  },
  {
    id: 'neg-008', siniestro_id: 'SIN-2026-008', fecha: '2026-02-05',
    tipo_servicio: 'perito', zona: 'Madrid', proveedor_id: 'prov-p001',
    proveedor_nombre: 'Peritaciones Rodríguez & Asociados',
    precio_inicial: 450, precio_final: 320, ahorro: 130,
    porcentaje_ahorro: 28.89, pasos: 10, estado: 'completada'
  },
  {
    id: 'neg-009', siniestro_id: 'SIN-2026-009', fecha: '2026-02-10',
    tipo_servicio: 'taller', zona: 'Barcelona', proveedor_id: 'prov-t003',
    proveedor_nombre: 'Carrocerías Martínez',
    precio_inicial: 1800, precio_final: 1380, ahorro: 420,
    porcentaje_ahorro: 23.33, pasos: 12, estado: 'completada'
  },
  {
    id: 'neg-010', siniestro_id: 'SIN-2026-010', fecha: '2026-02-14',
    tipo_servicio: 'electricista', zona: 'Sevilla', proveedor_id: 'prov-e002',
    proveedor_nombre: 'Instalaciones Eléctricas Fernández',
    precio_inicial: 320, precio_final: 225, ahorro: 95,
    porcentaje_ahorro: 29.69, pasos: 8, estado: 'completada'
  },
  {
    id: 'neg-011', siniestro_id: 'SIN-2026-011', fecha: '2026-02-18',
    tipo_servicio: 'cristalero', zona: 'Madrid', proveedor_id: 'prov-c001',
    proveedor_nombre: 'Cristalería del Centro',
    precio_inicial: 300, precio_final: 210, ahorro: 90,
    porcentaje_ahorro: 30.0, pasos: 9, estado: 'completada'
  },
  {
    id: 'neg-012', siniestro_id: 'SIN-2026-012', fecha: '2026-02-22',
    tipo_servicio: 'cerrajero', zona: 'Barcelona', proveedor_id: 'prov-j003',
    proveedor_nombre: 'Cerrajeros Seguros BCN',
    precio_inicial: 200, precio_final: 148, ahorro: 52,
    porcentaje_ahorro: 26.0, pasos: 8, estado: 'completada'
  },
  {
    id: 'neg-013', siniestro_id: 'SIN-2026-013', fecha: '2026-03-01',
    tipo_servicio: 'taller', zona: 'Sevilla', proveedor_id: 'prov-t004',
    proveedor_nombre: 'Talleres Rápidos del Sur',
    precio_inicial: 1200, precio_final: 880, ahorro: 320,
    porcentaje_ahorro: 26.67, pasos: 10, estado: 'completada'
  },
  {
    id: 'neg-014', siniestro_id: 'SIN-2026-014', fecha: '2026-03-05',
    tipo_servicio: 'fontanero', zona: 'Valencia', proveedor_id: 'prov-f002',
    proveedor_nombre: 'AquaServicios Mediterráneo',
    precio_inicial: 420, precio_final: 295, ahorro: 125,
    porcentaje_ahorro: 29.76, pasos: 9, estado: 'completada'
  },
  {
    id: 'neg-015', siniestro_id: 'SIN-2026-015', fecha: '2026-03-10',
    tipo_servicio: 'perito', zona: 'Valencia', proveedor_id: 'prov-p002',
    proveedor_nombre: 'ValorPerit Levante',
    precio_inicial: 380, precio_final: 270, ahorro: 110,
    porcentaje_ahorro: 28.95, pasos: 8, estado: 'completada'
  },
  {
    id: 'neg-016', siniestro_id: 'SIN-2026-016', fecha: '2026-03-12',
    tipo_servicio: 'taller', zona: 'Madrid', proveedor_id: 'prov-t005',
    proveedor_nombre: 'MegaAuto Taller Express',
    precio_inicial: 1500, precio_final: 1100, ahorro: 400,
    porcentaje_ahorro: 26.67, pasos: 11, estado: 'completada'
  },
  {
    id: 'neg-017', siniestro_id: 'SIN-2026-017', fecha: '2026-03-15',
    tipo_servicio: 'electricista', zona: 'Madrid', proveedor_id: 'prov-e001',
    proveedor_nombre: 'ElectroHogar Madrid',
    precio_inicial: 500, precio_final: 365, ahorro: 135,
    porcentaje_ahorro: 27.0, pasos: 9, estado: 'completada'
  },
];

// ============================================================================
// RANGOS DE PRECIOS POR TIPO DE SERVICIO
// ============================================================================

const rangosPrecios = {
  taller:       { min: 800, max: 3000 },
  fontanero:    { min: 200, max: 800 },
  electricista: { min: 150, max: 600 },
  cristalero:   { min: 100, max: 400 },
  cerrajero:    { min: 80, max: 250 },
  perito:       { min: 250, max: 600 },
};

const servicioDescripciones = {
  taller:       'reparación de vehículo',
  fontanero:    'reparación de fontanería',
  electricista: 'reparación eléctrica',
  cristalero:   'sustitución de cristales',
  cerrajero:    'servicio de cerrajería',
  perito:       'peritación de siniestro',
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Calcula el score compuesto de un proveedor (menor = mejor).
 * Pondera precio (60%) y calidad invertida (40%).
 */
function calcularScore(proveedor, mediaPrecios) {
  const precioNorm = proveedor.precio_medio / mediaPrecios;
  const calidadNorm = (5 - proveedor.calidad) / 5; // invertimos: más calidad = menor valor
  return precioNorm * 0.6 + calidadNorm * 0.4;
}

/**
 * Calcula la media de mercado para un tipo de servicio y zona.
 */
function calcularMediaMercado(tipo, zona) {
  const relevantes = proveedores.filter(p =>
    p.tipo === tipo && (zona === 'todas' || p.zona === zona || !zona)
  );
  if (relevantes.length === 0) {
    const rango = rangosPrecios[tipo];
    return rango ? (rango.min + rango.max) / 2 : 500;
  }
  return relevantes.reduce((sum, p) => sum + p.precio_medio, 0) / relevantes.length;
}

/**
 * Simula la respuesta del proveedor ante una oferta.
 * Tiene en cuenta cuánto se aleja de su precio medio y el paso de negociación.
 */
function simularRespuestaProveedor(proveedor, precioOfrecido, paso, mejorPrecioCompetencia) {
  const ratio = precioOfrecido / proveedor.precio_medio;
  const margenMinimo = proveedor.precio_medio * 0.68; // no baja de aquí

  if (precioOfrecido < margenMinimo) {
    // Rechaza si está muy por debajo de su mínimo
    return {
      aceptado: false,
      contraoferta: Math.round(margenMinimo + (proveedor.precio_medio - margenMinimo) * 0.3),
      motivo: 'Por debajo de nuestro coste mínimo'
    };
  }

  // Probabilidad de aceptar: crece con el ratio y con los pasos (presión temporal)
  const probBase = (ratio - 0.68) / 0.32; // 0 en 68%, 1 en 100%
  const bonusPaso = Math.min(paso * 0.05, 0.25); // hasta +25% por presión
  const bonusCompetencia = mejorPrecioCompetencia && mejorPrecioCompetencia < proveedor.precio_medio ? 0.15 : 0;
  const probFinal = Math.min(probBase + bonusPaso + bonusCompetencia, 0.95);

  // Decisión determinista basada en umbrales para reproducibilidad en demo
  if (ratio >= 0.85 || (ratio >= 0.78 && paso >= 3) || (ratio >= 0.72 && paso >= 5)) {
    return { aceptado: true, contraoferta: null, motivo: null };
  }

  // Contraoferta: punto medio entre oferta y su precio actual
  const contraoferta = Math.round((precioOfrecido + proveedor.precio_medio) / 2);
  return {
    aceptado: false,
    contraoferta: Math.max(contraoferta, Math.round(margenMinimo)),
    motivo: ratio < 0.75
      ? 'Ese precio no cubre nuestros costes de material'
      : 'Podríamos ajustar pero no tanto'
  };
}

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Obtiene proveedores filtrados por tipo y zona.
 */
function getProveedores(tipo, zona) {
  let resultado = [...proveedores];
  if (tipo) resultado = resultado.filter(p => p.tipo === tipo);
  if (zona) resultado = resultado.filter(p => p.zona === zona);
  return resultado;
}

/**
 * Ranking de proveedores ordenados por score (mejor primero).
 */
function getRankingProveedores(tipo) {
  let lista = tipo ? proveedores.filter(p => p.tipo === tipo) : [...proveedores];
  const media = lista.reduce((s, p) => s + p.precio_medio, 0) / lista.length || 1;

  return lista.map(p => ({
    id: p.id,
    nombre: p.nombre,
    tipo: p.tipo,
    zona: p.zona,
    precio_medio: p.precio_medio,
    calidad: p.calidad,
    tiempo_respuesta_horas: p.tiempo_respuesta_horas,
    score: Math.round(calcularScore(p, media) * 1000) / 1000,
  })).sort((a, b) => a.score - b.score);
}

/**
 * Detecta subidas de precio sospechosas en un proveedor (>10% sobre media histórica).
 */
function detectarSubidaPrecios(proveedorId) {
  const prov = proveedores.find(p => p.id === proveedorId);
  if (!prov) return { error: 'Proveedor no encontrado' };

  const historial = prov.historial_precios;
  if (historial.length < 2) return { alerta: false, mensaje: 'Historial insuficiente para análisis' };

  const mediaHistorica = historial.reduce((s, h) => s + h.precio, 0) / historial.length;
  const ultimoPrecio = historial[historial.length - 1].precio;
  const variacion = ((ultimoPrecio - mediaHistorica) / mediaHistorica) * 100;

  const alerta = variacion > 10;

  return {
    proveedor_id: prov.id,
    proveedor_nombre: prov.nombre,
    precio_medio_historico: Math.round(mediaHistorica * 100) / 100,
    ultimo_precio: ultimoPrecio,
    ultimo_servicio: historial[historial.length - 1].servicio,
    ultima_fecha: historial[historial.length - 1].fecha,
    variacion_porcentaje: Math.round(variacion * 100) / 100,
    alerta,
    nivel_alerta: alerta ? (variacion > 20 ? 'ALTA' : 'MEDIA') : 'NINGUNA',
    mensaje: alerta
      ? `ALERTA: ${prov.nombre} ha subido sus precios un ${Math.round(variacion)}% respecto a su media histórica (${Math.round(mediaHistorica)}€ → ${ultimoPrecio}€). Se recomienda renegociar condiciones o buscar alternativas.`
      : `Sin alertas. Variación del ${Math.round(variacion)}% dentro de rango normal.`,
  };
}

/**
 * Registra una negociación completada en memoria.
 */
function registrarNegociacion(data) {
  const negociacion = {
    id: data.id || uuidv4(),
    siniestro_id: data.siniestro_id,
    fecha: data.fecha || new Date().toISOString().split('T')[0],
    tipo_servicio: data.tipo_servicio,
    zona: data.zona,
    proveedor_id: data.proveedor_id,
    proveedor_nombre: data.proveedor_nombre,
    precio_inicial: data.precio_inicial,
    precio_final: data.precio_final,
    ahorro: data.precio_inicial - data.precio_final,
    porcentaje_ahorro: Math.round(((data.precio_inicial - data.precio_final) / data.precio_inicial) * 10000) / 100,
    pasos: data.pasos || 0,
    estado: data.estado || 'completada',
  };

  negociacionesCompletadas.push(negociacion);
  return negociacion;
}

/**
 * Devuelve todas las negociaciones realizadas.
 */
function getHistorialNegociaciones() {
  return negociacionesCompletadas.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/**
 * Calcula el ahorro total acumulado (mensual y anual).
 */
function getAhorroTotal() {
  const hoy = new Date();
  const mesActual = hoy.toISOString().slice(0, 7); // YYYY-MM
  const anioActual = hoy.getFullYear().toString();

  const negsMes = negociacionesCompletadas.filter(n => n.fecha.startsWith(mesActual));
  const negsAnio = negociacionesCompletadas.filter(n => n.fecha.startsWith(anioActual));
  const todas = negociacionesCompletadas;

  const ahorroMes = negsMes.reduce((s, n) => s + n.ahorro, 0);
  const ahorroAnio = negsAnio.reduce((s, n) => s + n.ahorro, 0);
  const ahorroTotal = todas.reduce((s, n) => s + n.ahorro, 0);

  const porcentajeMedioAnio = negsAnio.length > 0
    ? Math.round(negsAnio.reduce((s, n) => s + n.porcentaje_ahorro, 0) / negsAnio.length * 100) / 100
    : 0;

  return {
    mes_actual: {
      periodo: mesActual,
      negociaciones: negsMes.length,
      ahorro_total: ahorroMes,
      ahorro_medio_por_negociacion: negsMes.length > 0 ? Math.round(ahorroMes / negsMes.length) : 0,
    },
    anio_actual: {
      periodo: anioActual,
      negociaciones: negsAnio.length,
      ahorro_total: ahorroAnio,
      ahorro_medio_por_negociacion: negsAnio.length > 0 ? Math.round(ahorroAnio / negsAnio.length) : 0,
      porcentaje_ahorro_medio: porcentajeMedioAnio,
    },
    historico: {
      negociaciones_totales: todas.length,
      ahorro_acumulado: ahorroTotal,
      ahorro_medio_por_negociacion: todas.length > 0 ? Math.round(ahorroTotal / todas.length) : 0,
    },
  };
}

// ============================================================================
// SIMULACION DE NEGOCIACION COMPLETA
// ============================================================================

/**
 * Simula una negociación completa paso a paso con uno o más proveedores.
 *
 * @param {string} siniestroId - ID del siniestro
 * @param {string} tipoServicio - Tipo de proveedor requerido
 * @param {string} zona - Zona geográfica
 * @returns {object} Resultado completo de la negociación con log de pasos
 */
function simulateNegotiation(siniestroId, tipoServicio, zona) {
  // 1. Buscar proveedores relevantes
  let candidatos = proveedores.filter(p => p.tipo === tipoServicio);
  const candidatosZona = candidatos.filter(p => p.zona === zona);

  // Priorizar zona pero incluir otros si hay pocos
  if (candidatosZona.length >= 2) {
    candidatos = candidatosZona;
  }

  if (candidatos.length === 0) {
    return {
      error: true,
      mensaje: `No se encontraron proveedores de tipo "${tipoServicio}" disponibles`,
    };
  }

  // 2. Calcular media de mercado y precio objetivo
  const mediaMercado = calcularMediaMercado(tipoServicio, zona);
  const precioObjetivo = Math.round(mediaMercado * 0.75);
  const descripcionServicio = servicioDescripciones[tipoServicio] || tipoServicio;

  // 3. Ordenar candidatos por score
  candidatos.sort((a, b) => calcularScore(a, mediaMercado) - calcularScore(b, mediaMercado));

  // 4. Negociación paso a paso
  const pasos = [];
  let pasoNum = 0;
  let mejorPrecioConseguido = null;
  let mejorProveedorFinal = null;
  let mejorProveedorNombre = null;
  const cotizacionesObtenidas = {};

  // --- PASO 1: Inicio de la negociación ---
  pasoNum++;
  pasos.push({
    paso: pasoNum,
    proveedor: 'Sistema IA',
    accion: 'Inicio de negociación',
    mensaje_ia: `Iniciando proceso de negociación para ${descripcionServicio}. Siniestro: ${siniestroId}. Zona: ${zona}. He identificado ${candidatos.length} proveedor(es) candidatos. Media de mercado: ${mediaMercado}€. Precio objetivo: ${precioObjetivo}€ (75% de la media). Procedo a contactar proveedores ordenados por relación calidad-precio.`,
    respuesta_proveedor: null,
    precio_ofrecido: null,
    precio_conseguido: null,
    aceptado: null,
  });

  // --- ITERAR SOBRE CADA PROVEEDOR ---
  for (let i = 0; i < candidatos.length; i++) {
    const prov = candidatos[i];

    // Generar cotización inicial (variación sobre precio medio)
    const variacion = 0.95 + Math.random() * 0.15; // entre -5% y +10%
    const cotizacionInicial = Math.round(prov.precio_medio * variacion);

    // --- Contacto inicial ---
    pasoNum++;
    pasos.push({
      paso: pasoNum,
      proveedor: prov.nombre,
      accion: 'Contacto inicial - Solicitud de presupuesto',
      mensaje_ia: `Buenos días, le contacto desde SiniestrosAI en nombre de nuestra aseguradora. Necesitamos un servicio de ${descripcionServicio} en la zona de ${zona} para el expediente ${siniestroId}. ¿Podrían facilitarnos un presupuesto?`,
      respuesta_proveedor: `Buenos días. Sí, por supuesto. Para un servicio de ${descripcionServicio} en ${zona}, nuestro presupuesto sería de ${cotizacionInicial}€, IVA incluido. El tiempo estimado de ejecución es de ${prov.tiempo_respuesta_horas} horas.`,
      precio_ofrecido: null,
      precio_conseguido: cotizacionInicial,
      aceptado: null,
    });

    cotizacionesObtenidas[prov.id] = cotizacionInicial;

    // --- Primera contraoferta de IA ---
    let ofertaIA;
    if (mejorPrecioConseguido && mejorPrecioConseguido < cotizacionInicial) {
      // Usar precio de competencia como palanca
      ofertaIA = Math.round(mejorPrecioConseguido * 0.92);
    } else {
      ofertaIA = precioObjetivo;
    }

    pasoNum++;
    let mensajeNegociacion;
    if (mejorPrecioConseguido) {
      mensajeNegociacion = `Gracias por el presupuesto. Le informo de que ya hemos recibido una oferta de ${mejorPrecioConseguido}€ de otro proveedor de la zona para el mismo servicio. Dado nuestro volumen de siniestros (gestionamos más de 200 expedientes mensuales), ¿podrían ajustar su precio a ${ofertaIA}€? Podríamos establecer una relación comercial continuada.`;
    } else {
      mensajeNegociacion = `Gracias por el presupuesto. Hemos analizado los precios de mercado para ${descripcionServicio} en ${zona} y la media se sitúa en torno a ${mediaMercado}€. Dado que gestionamos un volumen elevado de siniestros y podemos garantizar continuidad en la colaboración, ¿sería posible ajustar el precio a ${ofertaIA}€?`;
    }

    const resp1 = simularRespuestaProveedor(prov, ofertaIA, 1, mejorPrecioConseguido);

    if (resp1.aceptado) {
      pasos.push({
        paso: pasoNum,
        proveedor: prov.nombre,
        accion: 'Contraoferta IA - Aceptada',
        mensaje_ia: mensajeNegociacion,
        respuesta_proveedor: `De acuerdo, aceptamos el precio de ${ofertaIA}€. Dado el volumen que manejan, nos interesa mantener la colaboración. Podemos empezar mañana.`,
        precio_ofrecido: ofertaIA,
        precio_conseguido: ofertaIA,
        aceptado: true,
      });

      if (!mejorPrecioConseguido || ofertaIA < mejorPrecioConseguido) {
        mejorPrecioConseguido = ofertaIA;
        mejorProveedorFinal = prov.id;
        mejorProveedorNombre = prov.nombre;
      }
    } else {
      pasos.push({
        paso: pasoNum,
        proveedor: prov.nombre,
        accion: 'Contraoferta IA - Rechazada',
        mensaje_ia: mensajeNegociacion,
        respuesta_proveedor: `${resp1.motivo}. Lo mínimo que podríamos ofrecer es ${resp1.contraoferta}€. Trabajamos con materiales de primera calidad y nuestra garantía es de 2 años.`,
        precio_ofrecido: ofertaIA,
        precio_conseguido: null,
        aceptado: false,
      });

      // --- Segunda ronda: IA insiste ---
      const ofertaIA2 = Math.round((ofertaIA + resp1.contraoferta) / 2);

      pasoNum++;
      const resp2 = simularRespuestaProveedor(prov, ofertaIA2, 3, mejorPrecioConseguido);

      if (resp2.aceptado) {
        pasos.push({
          paso: pasoNum,
          proveedor: prov.nombre,
          accion: 'Segunda oferta IA - Aceptada',
          mensaje_ia: `Entiendo su posición. Valoramos la calidad de su trabajo y la garantía que ofrecen. ¿Podríamos llegar a un acuerdo en ${ofertaIA2}€? Además, les incluiríamos en nuestro panel de proveedores preferentes, lo que les garantizaría un flujo constante de encargos.`,
          respuesta_proveedor: `Bueno, es un precio ajustado pero por entrar en su panel de preferentes, aceptamos ${ofertaIA2}€. Necesitaremos confirmación por escrito.`,
          precio_ofrecido: ofertaIA2,
          precio_conseguido: ofertaIA2,
          aceptado: true,
        });

        if (!mejorPrecioConseguido || ofertaIA2 < mejorPrecioConseguido) {
          mejorPrecioConseguido = ofertaIA2;
          mejorProveedorFinal = prov.id;
          mejorProveedorNombre = prov.nombre;
        }
      } else {
        pasos.push({
          paso: pasoNum,
          proveedor: prov.nombre,
          accion: 'Segunda oferta IA - Rechazada',
          mensaje_ia: `Entiendo su posición. Valoramos la calidad de su trabajo. ¿Podríamos cerrar en ${ofertaIA2}€? Les incluiríamos en nuestro panel de proveedores preferentes con encargos regulares.`,
          respuesta_proveedor: `Lo sentimos, pero ${resp2.contraoferta}€ es realmente nuestro precio mínimo. ${resp2.motivo}. Estamos dispuestos a cerrar a ese precio con las condiciones de panel preferente.`,
          precio_ofrecido: ofertaIA2,
          precio_conseguido: null,
          aceptado: false,
        });

        // --- Tercera ronda: Presión final ---
        const ofertaIA3 = Math.round((ofertaIA2 + resp2.contraoferta) / 2);

        pasoNum++;
        const resp3 = simularRespuestaProveedor(prov, ofertaIA3, 5, mejorPrecioConseguido);

        if (resp3.aceptado) {
          pasos.push({
            paso: pasoNum,
            proveedor: prov.nombre,
            accion: 'Tercera oferta IA - Aceptada',
            mensaje_ia: `Vamos a buscar un punto intermedio. Mi propuesta final es ${ofertaIA3}€, que incluye el panel preferente más prioridad en asignación de siniestros de su zona. Nuestro siguiente proveedor en la lista también ha mostrado interés, así que necesitaría una respuesta ahora.`,
            respuesta_proveedor: `De acuerdo, acepto ${ofertaIA3}€ con las condiciones de panel preferente y prioridad de zona. Cerramos el acuerdo.`,
            precio_ofrecido: ofertaIA3,
            precio_conseguido: ofertaIA3,
            aceptado: true,
          });

          if (!mejorPrecioConseguido || ofertaIA3 < mejorPrecioConseguido) {
            mejorPrecioConseguido = ofertaIA3;
            mejorProveedorFinal = prov.id;
            mejorProveedorNombre = prov.nombre;
          }
        } else {
          // Acepta la contraoferta del proveedor como último recurso si es razonable
          const precioFinalProv = resp3.contraoferta || resp2.contraoferta;

          if (precioFinalProv <= cotizacionInicial * 0.88) {
            pasos.push({
              paso: pasoNum,
              proveedor: prov.nombre,
              accion: 'Aceptación de contraoferta del proveedor',
              mensaje_ia: `Entendemos su posición y valoramos la transparencia. Aceptamos su precio de ${precioFinalProv}€. Es un precio justo considerando la calidad de su servicio. Procedemos a formalizar la asignación.`,
              respuesta_proveedor: `Perfecto, cerramos en ${precioFinalProv}€. Le envío confirmación de disponibilidad y plazo de ejecución.`,
              precio_ofrecido: ofertaIA3,
              precio_conseguido: precioFinalProv,
              aceptado: true,
            });

            if (!mejorPrecioConseguido || precioFinalProv < mejorPrecioConseguido) {
              mejorPrecioConseguido = precioFinalProv;
              mejorProveedorFinal = prov.id;
              mejorProveedorNombre = prov.nombre;
            }
          } else {
            pasos.push({
              paso: pasoNum,
              proveedor: prov.nombre,
              accion: 'Negociación sin acuerdo',
              mensaje_ia: `Agradecemos su tiempo y sus presupuestos. En este momento el precio de ${precioFinalProv}€ queda por encima de nuestro rango para este siniestro. Les mantendremos en nuestra base para futuras colaboraciones. Gracias.`,
              respuesta_proveedor: `Entendido, quedamos a su disposición para futuros servicios. Un saludo.`,
              precio_ofrecido: ofertaIA3,
              precio_conseguido: null,
              aceptado: false,
            });
          }
        }
      }
    }
  }

  // --- PASO FINAL: Resumen y decisión ---
  pasoNum++;

  const cotInicial = Object.values(cotizacionesObtenidas);
  const mejorCotInicial = cotInicial.length > 0 ? Math.min(...cotInicial) : 0;

  if (mejorPrecioConseguido) {
    const ahorro = mejorCotInicial - mejorPrecioConseguido;
    const porcentajeAhorro = mejorCotInicial > 0
      ? Math.round((ahorro / mejorCotInicial) * 10000) / 100
      : 0;

    pasos.push({
      paso: pasoNum,
      proveedor: 'Sistema IA',
      accion: 'Cierre de negociación - Proveedor seleccionado',
      mensaje_ia: `Negociación completada para siniestro ${siniestroId}. Proveedor seleccionado: ${mejorProveedorNombre}. Precio inicial mejor cotización: ${mejorCotInicial}€. Precio negociado final: ${mejorPrecioConseguido}€. Ahorro conseguido: ${ahorro}€ (${porcentajeAhorro}%). Se procede a la asignación formal y notificación al asegurado.`,
      respuesta_proveedor: null,
      precio_ofrecido: null,
      precio_conseguido: mejorPrecioConseguido,
      aceptado: true,
    });

    // Registrar la negociación
    registrarNegociacion({
      siniestro_id: siniestroId,
      tipo_servicio: tipoServicio,
      zona: zona,
      proveedor_id: mejorProveedorFinal,
      proveedor_nombre: mejorProveedorNombre,
      precio_inicial: mejorCotInicial,
      precio_final: mejorPrecioConseguido,
      pasos: pasoNum,
      estado: 'completada',
    });

    return {
      exito: true,
      siniestro_id: siniestroId,
      tipo_servicio: tipoServicio,
      zona: zona,
      proveedores_contactados: candidatos.length,
      proveedor_seleccionado: {
        id: mejorProveedorFinal,
        nombre: mejorProveedorNombre,
      },
      precio_mercado: mediaMercado,
      precio_objetivo: precioObjetivo,
      mejor_cotizacion_inicial: mejorCotInicial,
      precio_final_negociado: mejorPrecioConseguido,
      ahorro: ahorro,
      porcentaje_ahorro: porcentajeAhorro,
      total_pasos: pasoNum,
      log_negociacion: pasos,
    };
  } else {
    pasos.push({
      paso: pasoNum,
      proveedor: 'Sistema IA',
      accion: 'Cierre de negociación - Sin acuerdo',
      mensaje_ia: `No se ha podido alcanzar un acuerdo satisfactorio con ninguno de los ${candidatos.length} proveedores contactados. Se recomienda ampliar la búsqueda a zonas adyacentes o revisar el precio objetivo. Mejor cotización recibida: ${mejorCotInicial}€ (objetivo era ${precioObjetivo}€).`,
      respuesta_proveedor: null,
      precio_ofrecido: null,
      precio_conseguido: null,
      aceptado: false,
    });

    return {
      exito: false,
      siniestro_id: siniestroId,
      tipo_servicio: tipoServicio,
      zona: zona,
      proveedores_contactados: candidatos.length,
      proveedor_seleccionado: null,
      precio_mercado: mediaMercado,
      precio_objetivo: precioObjetivo,
      mejor_cotizacion_inicial: mejorCotInicial,
      precio_final_negociado: null,
      ahorro: 0,
      porcentaje_ahorro: 0,
      total_pasos: pasoNum,
      log_negociacion: pasos,
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  simulateNegotiation,
  getProveedores,
  getHistorialNegociaciones,
  getAhorroTotal,
  getRankingProveedores,
  detectarSubidaPrecios,
  registrarNegociacion,
};
