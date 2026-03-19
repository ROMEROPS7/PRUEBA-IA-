// ============================================================================
// Agente de Alerta Temprana de Riesgos
// Deteccion proactiva de clientes de alto riesgo, concentracion geografica
// y proyecciones de siniestralidad por zona y tipo
// ============================================================================

// Factores de riesgo y sus pesos en el calculo del score
const PESOS_FACTORES = {
  edad: 0.10,
  zona_riesgo: 0.20,
  historial_siniestros: 0.25,
  tipo_vehiculo_potencia: 0.15,
  antiguedad_vivienda: 0.10,
  condiciones_salud: 0.20,
};

// Base de clientes con datos de riesgo
const clientes = [
  { id: 'CLI-001', nombre: 'Antonio Reyes Molina', edad: 22, zona: 'Madrid Centro', comunidad: 'Madrid', productos: ['auto_todo_riesgo', 'salud_basico'], vehiculo: 'deportivo_alta_potencia', antiguedad_vivienda: null, condiciones_salud: 'ninguna', historial_siniestros: 2, prima_actual: 1850 },
  { id: 'CLI-002', nombre: 'Carmen Delgado Ortiz', edad: 78, zona: 'Sevilla', comunidad: 'Andalucia', productos: ['hogar_premium', 'vida_riesgo', 'salud_completo'], vehiculo: null, antiguedad_vivienda: 45, condiciones_salud: 'cronicas_multiples', historial_siniestros: 1, prima_actual: 2400 },
  { id: 'CLI-003', nombre: 'David Romero Castro', edad: 19, zona: 'Barcelona Eixample', comunidad: 'Cataluna', productos: ['auto_terceros'], vehiculo: 'deportivo_media_potencia', antiguedad_vivienda: null, condiciones_salud: 'ninguna', historial_siniestros: 3, prima_actual: 890 },
  { id: 'CLI-004', nombre: 'Elena Vargas Jimenez', edad: 45, zona: 'Valencia Ruzafa', comunidad: 'Comunidad Valenciana', productos: ['hogar_basico', 'auto_todo_riesgo'], vehiculo: 'suv_alta_potencia', antiguedad_vivienda: 35, condiciones_salud: 'ninguna', historial_siniestros: 4, prima_actual: 1200 },
  { id: 'CLI-005', nombre: 'Francisco Navarro Gil', edad: 67, zona: 'Malaga Costa', comunidad: 'Andalucia', productos: ['hogar_premium', 'salud_completo', 'vida_riesgo'], vehiculo: null, antiguedad_vivienda: 50, condiciones_salud: 'cardiovascular', historial_siniestros: 0, prima_actual: 3100 },
  { id: 'CLI-006', nombre: 'Gloria Mendez Serrano', edad: 28, zona: 'Madrid Sur', comunidad: 'Madrid', productos: ['auto_todo_riesgo', 'hogar_basico'], vehiculo: 'turismo_estandar', antiguedad_vivienda: 8, condiciones_salud: 'ninguna', historial_siniestros: 1, prima_actual: 780 },
  { id: 'CLI-007', nombre: 'Hugo Perez Blanco', edad: 35, zona: 'Bilbao', comunidad: 'Pais Vasco', productos: ['auto_todo_riesgo', 'hogar_premium', 'vida_riesgo'], vehiculo: 'suv_alta_potencia', antiguedad_vivienda: 5, condiciones_salud: 'ninguna', historial_siniestros: 2, prima_actual: 1650 },
  { id: 'CLI-008', nombre: 'Isabel Torres Ramos', edad: 72, zona: 'Murcia', comunidad: 'Region de Murcia', productos: ['hogar_basico', 'salud_completo'], vehiculo: null, antiguedad_vivienda: 40, condiciones_salud: 'diabetes_hipertension', historial_siniestros: 2, prima_actual: 1900 },
  { id: 'CLI-009', nombre: 'Javier Ruiz Caballero', edad: 20, zona: 'Zaragoza', comunidad: 'Aragon', productos: ['auto_terceros'], vehiculo: 'deportivo_alta_potencia', antiguedad_vivienda: null, condiciones_salud: 'ninguna', historial_siniestros: 5, prima_actual: 1100 },
  { id: 'CLI-010', nombre: 'Lucia Herrera Vidal', edad: 55, zona: 'Alicante Costa', comunidad: 'Comunidad Valenciana', productos: ['hogar_premium', 'auto_todo_riesgo', 'salud_basico'], vehiculo: 'turismo_estandar', antiguedad_vivienda: 30, condiciones_salud: 'ninguna', historial_siniestros: 3, prima_actual: 1450 },
  { id: 'CLI-011', nombre: 'Manuel Soto Aguilar', edad: 31, zona: 'Las Palmas', comunidad: 'Canarias', productos: ['auto_todo_riesgo', 'hogar_basico'], vehiculo: 'turismo_estandar', antiguedad_vivienda: 15, condiciones_salud: 'ninguna', historial_siniestros: 1, prima_actual: 850 },
  { id: 'CLI-012', nombre: 'Natalia Cortes Fuentes', edad: 42, zona: 'Madrid Norte', comunidad: 'Madrid', productos: ['hogar_premium', 'auto_todo_riesgo', 'vida_riesgo', 'salud_completo'], vehiculo: 'suv_media_potencia', antiguedad_vivienda: 20, condiciones_salud: 'ninguna', historial_siniestros: 0, prima_actual: 2200 },
  { id: 'CLI-013', nombre: 'Oscar Prieto Luna', edad: 25, zona: 'Granada', comunidad: 'Andalucia', productos: ['auto_terceros', 'salud_basico'], vehiculo: 'deportivo_media_potencia', antiguedad_vivienda: null, condiciones_salud: 'alergias_cronicas', historial_siniestros: 4, prima_actual: 920 },
  { id: 'CLI-014', nombre: 'Patricia Campos Duran', edad: 60, zona: 'Palma de Mallorca', comunidad: 'Islas Baleares', productos: ['hogar_premium', 'salud_completo'], vehiculo: null, antiguedad_vivienda: 55, condiciones_salud: 'cardiovascular', historial_siniestros: 1, prima_actual: 2800 },
  { id: 'CLI-015', nombre: 'Rafael Marin Esteban', edad: 38, zona: 'Cadiz Costa', comunidad: 'Andalucia', productos: ['hogar_basico', 'auto_todo_riesgo'], vehiculo: 'turismo_estandar', antiguedad_vivienda: 25, condiciones_salud: 'ninguna', historial_siniestros: 2, prima_actual: 1050 },
  { id: 'CLI-016', nombre: 'Sandra Lopez Iglesias', edad: 50, zona: 'A Coruna', comunidad: 'Galicia', productos: ['hogar_premium', 'vida_riesgo', 'salud_basico'], vehiculo: null, antiguedad_vivienda: 60, condiciones_salud: 'artritis', historial_siniestros: 3, prima_actual: 1750 },
  { id: 'CLI-017', nombre: 'Tomas Guerrero Pena', edad: 23, zona: 'Tenerife', comunidad: 'Canarias', productos: ['auto_terceros'], vehiculo: 'deportivo_alta_potencia', antiguedad_vivienda: null, condiciones_salud: 'ninguna', historial_siniestros: 3, prima_actual: 950 },
];

// Zonas de riesgo por comunidad autonoma
const zonasRiesgo = {
  'Madrid': { nivel: 'alto', factor_auto: 1.3, factor_hogar: 1.1, factor_salud: 1.0, densidad_siniestros: 8.5, riesgos_naturales: ['inundacion_puntual', 'ola_calor'] },
  'Cataluna': { nivel: 'alto', factor_auto: 1.25, factor_hogar: 1.05, factor_salud: 0.95, densidad_siniestros: 7.8, riesgos_naturales: ['inundacion', 'temporal_mediterraneo'] },
  'Andalucia': { nivel: 'medio', factor_auto: 1.1, factor_hogar: 1.15, factor_salud: 1.05, densidad_siniestros: 6.2, riesgos_naturales: ['sequia', 'incendio_forestal', 'inundacion_costera'] },
  'Comunidad Valenciana': { nivel: 'alto', factor_auto: 1.15, factor_hogar: 1.35, factor_salud: 1.0, densidad_siniestros: 7.5, riesgos_naturales: ['DANA', 'inundacion', 'temporal_mediterraneo'] },
  'Pais Vasco': { nivel: 'medio', factor_auto: 1.05, factor_hogar: 1.0, factor_salud: 0.90, densidad_siniestros: 5.1, riesgos_naturales: ['temporal_atlantico', 'inundacion'] },
  'Galicia': { nivel: 'medio', factor_auto: 1.0, factor_hogar: 1.20, factor_salud: 1.0, densidad_siniestros: 4.8, riesgos_naturales: ['temporal_atlantico', 'incendio_forestal'] },
  'Canarias': { nivel: 'medio', factor_auto: 0.95, factor_hogar: 1.10, factor_salud: 1.0, densidad_siniestros: 4.2, riesgos_naturales: ['volcanismo', 'calima', 'temporal_tropical'] },
  'Aragon': { nivel: 'bajo', factor_auto: 0.95, factor_hogar: 0.95, factor_salud: 1.0, densidad_siniestros: 3.5, riesgos_naturales: ['cierzo', 'granizo', 'helada'] },
  'Region de Murcia': { nivel: 'medio', factor_auto: 1.10, factor_hogar: 1.25, factor_salud: 1.05, densidad_siniestros: 5.8, riesgos_naturales: ['DANA', 'inundacion', 'sequia'] },
  'Islas Baleares': { nivel: 'medio', factor_auto: 1.0, factor_hogar: 1.30, factor_salud: 0.95, densidad_siniestros: 5.0, riesgos_naturales: ['temporal_mediterraneo', 'inundacion_costera'] },
  'Castilla y Leon': { nivel: 'bajo', factor_auto: 0.90, factor_hogar: 0.90, factor_salud: 1.05, densidad_siniestros: 3.0, riesgos_naturales: ['helada', 'nevada', 'incendio_forestal'] },
  'Castilla-La Mancha': { nivel: 'bajo', factor_auto: 0.90, factor_hogar: 0.85, factor_salud: 1.05, densidad_siniestros: 2.8, riesgos_naturales: ['sequia', 'granizo', 'incendio_forestal'] },
  'Extremadura': { nivel: 'bajo', factor_auto: 0.85, factor_hogar: 0.90, factor_salud: 1.10, densidad_siniestros: 2.5, riesgos_naturales: ['incendio_forestal', 'sequia'] },
  'Asturias': { nivel: 'bajo', factor_auto: 0.95, factor_hogar: 1.05, factor_salud: 1.0, densidad_siniestros: 3.8, riesgos_naturales: ['temporal_atlantico', 'deslizamiento'] },
  'Cantabria': { nivel: 'bajo', factor_auto: 0.95, factor_hogar: 1.05, factor_salud: 1.0, densidad_siniestros: 3.6, riesgos_naturales: ['temporal_atlantico', 'inundacion'] },
  'Navarra': { nivel: 'bajo', factor_auto: 0.95, factor_hogar: 0.95, factor_salud: 0.90, densidad_siniestros: 3.2, riesgos_naturales: ['helada', 'granizo', 'inundacion'] },
  'La Rioja': { nivel: 'bajo', factor_auto: 0.90, factor_hogar: 0.90, factor_salud: 0.95, densidad_siniestros: 2.9, riesgos_naturales: ['granizo', 'helada'] },
};

// ---------------------------------------------------------------------------
// Funciones internas de calculo de riesgo
// ---------------------------------------------------------------------------
function _calcularScoreEdad(edad) {
  if (edad < 25) return 80 + (25 - edad) * 2;  // Joven: alto riesgo
  if (edad > 70) return 60 + (edad - 70) * 2;   // Mayor: riesgo creciente
  if (edad > 60) return 40 + (edad - 60);
  return 20; // 25-60: bajo riesgo
}

function _calcularScoreZona(comunidad) {
  const zona = zonasRiesgo[comunidad];
  if (!zona) return 30;
  const niveles = { alto: 80, medio: 50, bajo: 20 };
  return niveles[zona.nivel] || 30;
}

function _calcularScoreHistorial(numSiniestros) {
  if (numSiniestros === 0) return 5;
  if (numSiniestros === 1) return 25;
  if (numSiniestros === 2) return 50;
  if (numSiniestros === 3) return 70;
  return Math.min(100, 70 + (numSiniestros - 3) * 15);
}

function _calcularScoreVehiculo(tipo) {
  const scores = {
    deportivo_alta_potencia: 95,
    deportivo_media_potencia: 70,
    suv_alta_potencia: 60,
    suv_media_potencia: 40,
    turismo_estandar: 20,
  };
  return scores[tipo] || 0;
}

function _calcularScoreVivienda(antiguedad) {
  if (antiguedad === null || antiguedad === undefined) return 0;
  if (antiguedad > 50) return 85;
  if (antiguedad > 30) return 60;
  if (antiguedad > 15) return 35;
  return 15;
}

function _calcularScoreSalud(condiciones) {
  const scores = {
    ninguna: 5,
    alergias_cronicas: 30,
    artritis: 45,
    diabetes_hipertension: 70,
    cardiovascular: 80,
    cronicas_multiples: 95,
  };
  return scores[condiciones] || 10;
}

function _calcularRiesgoCliente(cliente) {
  const factores = {
    edad: { score: _calcularScoreEdad(cliente.edad), peso: PESOS_FACTORES.edad },
    zona_riesgo: { score: _calcularScoreZona(cliente.comunidad), peso: PESOS_FACTORES.zona_riesgo },
    historial_siniestros: { score: _calcularScoreHistorial(cliente.historial_siniestros), peso: PESOS_FACTORES.historial_siniestros },
    tipo_vehiculo_potencia: { score: _calcularScoreVehiculo(cliente.vehiculo), peso: PESOS_FACTORES.tipo_vehiculo_potencia },
    antiguedad_vivienda: { score: _calcularScoreVivienda(cliente.antiguedad_vivienda), peso: PESOS_FACTORES.antiguedad_vivienda },
    condiciones_salud: { score: _calcularScoreSalud(cliente.condiciones_salud), peso: PESOS_FACTORES.condiciones_salud },
  };

  const scoreTotal = Math.round(
    Object.values(factores).reduce((sum, f) => sum + f.score * f.peso, 0)
  );

  let nivel;
  if (scoreTotal >= 70) nivel = 'muy_alto';
  else if (scoreTotal >= 55) nivel = 'alto';
  else if (scoreTotal >= 40) nivel = 'medio';
  else if (scoreTotal >= 25) nivel = 'bajo';
  else nivel = 'muy_bajo';

  return { scoreTotal, nivel, factores };
}

// ---------------------------------------------------------------------------
// getClientesAltoRiesgo - Clientes ordenados por score de riesgo
// ---------------------------------------------------------------------------
function getClientesAltoRiesgo() {
  const resultados = clientes.map(cliente => {
    const { scoreTotal, nivel, factores } = _calcularRiesgoCliente(cliente);

    const factoresDetalle = Object.entries(factores).map(([nombre, data]) => ({
      factor: nombre,
      score: data.score,
      peso: data.peso,
      contribucion: Math.round(data.score * data.peso),
    })).sort((a, b) => b.contribucion - a.contribucion);

    const factorPrincipal = factoresDetalle[0];

    return {
      id: cliente.id,
      nombre: cliente.nombre,
      edad: cliente.edad,
      zona: cliente.zona,
      comunidad: cliente.comunidad,
      productos: cliente.productos,
      prima_actual: cliente.prima_actual,
      historial_siniestros: cliente.historial_siniestros,
      score_riesgo: scoreTotal,
      nivel_riesgo: nivel,
      factores: factoresDetalle,
      factor_principal: `${factorPrincipal.factor} (score: ${factorPrincipal.score}, contribucion: ${factorPrincipal.contribucion})`,
      probabilidad_siniestro_6m: Math.min(95, Math.round(scoreTotal * 0.8 + Math.random() * 10)) + '%',
    };
  });

  return resultados.sort((a, b) => b.score_riesgo - a.score_riesgo);
}

// ---------------------------------------------------------------------------
// getMapaRiesgo - Mapa de riesgo por comunidad autonoma
// ---------------------------------------------------------------------------
function getMapaRiesgo() {
  const mapa = {};

  for (const [comunidad, zona] of Object.entries(zonasRiesgo)) {
    const clientesComunidad = clientes.filter(c => c.comunidad === comunidad);
    const polizasTotales = clientesComunidad.reduce((sum, c) => sum + c.productos.length, 0);
    const siniestrosTotales = clientesComunidad.reduce((sum, c) => sum + c.historial_siniestros, 0);
    const primaMedia = clientesComunidad.length > 0
      ? Math.round(clientesComunidad.reduce((sum, c) => sum + c.prima_actual, 0) / clientesComunidad.length)
      : 0;

    mapa[comunidad] = {
      nivel_riesgo: zona.nivel,
      densidad_siniestros: zona.densidad_siniestros,
      factor_auto: zona.factor_auto,
      factor_hogar: zona.factor_hogar,
      factor_salud: zona.factor_salud,
      riesgos_naturales: zona.riesgos_naturales,
      clientes_en_cartera: clientesComunidad.length,
      polizas_activas: polizasTotales,
      siniestros_acumulados: siniestrosTotales,
      prima_media_cliente: primaMedia,
      ratio_siniestralidad: polizasTotales > 0 ? +(siniestrosTotales / polizasTotales).toFixed(2) : 0,
    };
  }

  return {
    fecha: '2026-03-19',
    total_comunidades: Object.keys(mapa).length,
    comunidades_alto_riesgo: Object.entries(mapa).filter(([, v]) => v.nivel_riesgo === 'alto').map(([k]) => k),
    comunidades_medio_riesgo: Object.entries(mapa).filter(([, v]) => v.nivel_riesgo === 'medio').map(([k]) => k),
    comunidades_bajo_riesgo: Object.entries(mapa).filter(([, v]) => v.nivel_riesgo === 'bajo').map(([k]) => k),
    mapa,
  };
}

// ---------------------------------------------------------------------------
// getRecomendaciones - Sugerencias de ajuste de prima para alto riesgo
// ---------------------------------------------------------------------------
function getRecomendaciones() {
  const clientesRiesgo = getClientesAltoRiesgo();

  return clientesRiesgo
    .filter(c => c.score_riesgo >= 40)
    .map(cliente => {
      let ajustePct;
      let accion;
      let urgencia;

      if (cliente.score_riesgo >= 70) {
        ajustePct = Math.round(15 + (cliente.score_riesgo - 70) * 0.5);
        accion = 'revision_urgente';
        urgencia = 'critica';
      } else if (cliente.score_riesgo >= 55) {
        ajustePct = Math.round(8 + (cliente.score_riesgo - 55) * 0.4);
        accion = 'ajuste_prima';
        urgencia = 'alta';
      } else {
        ajustePct = Math.round(3 + (cliente.score_riesgo - 40) * 0.3);
        accion = 'monitorizacion';
        urgencia = 'media';
      }

      const primaRecomendada = Math.round(cliente.prima_actual * (1 + ajustePct / 100));
      const clienteOriginal = clientes.find(c => c.id === cliente.id);

      const medidas = [];
      if (cliente.historial_siniestros >= 3) {
        medidas.push('Aplicar clausula de frecuencia siniestral');
      }
      if (clienteOriginal.vehiculo && clienteOriginal.vehiculo.includes('deportivo')) {
        medidas.push('Solicitar instalacion de dispositivo telematico');
      }
      if (clienteOriginal.antiguedad_vivienda && clienteOriginal.antiguedad_vivienda > 40) {
        medidas.push('Requerir inspeccion del estado del inmueble');
      }
      if (clienteOriginal.condiciones_salud !== 'ninguna') {
        medidas.push('Actualizar cuestionario de salud');
      }
      if (cliente.score_riesgo >= 70) {
        medidas.push('Considerar exclusiones adicionales o franquicia mayor');
      }
      if (medidas.length === 0) {
        medidas.push('Monitorizacion periodica trimestral');
      }

      return {
        cliente_id: cliente.id,
        nombre: cliente.nombre,
        score_riesgo: cliente.score_riesgo,
        nivel_riesgo: cliente.nivel_riesgo,
        accion,
        urgencia,
        prima_actual: cliente.prima_actual,
        ajuste_recomendado_pct: ajustePct,
        prima_recomendada: primaRecomendada,
        incremento_eur: primaRecomendada - cliente.prima_actual,
        factor_principal: cliente.factor_principal,
        medidas_adicionales: medidas,
        justificacion: `Score de riesgo ${cliente.score_riesgo}/100 (${cliente.nivel_riesgo}). ` +
          `Factor principal: ${cliente.factor_principal}. ` +
          `Historial: ${cliente.historial_siniestros} siniestros previos.`,
      };
    });
}

// ---------------------------------------------------------------------------
// getProyeccion - Proyeccion de siniestros a 6 meses
// ---------------------------------------------------------------------------
function getProyeccion() {
  const meses = ['Abril 2026', 'Mayo 2026', 'Junio 2026', 'Julio 2026', 'Agosto 2026', 'Septiembre 2026'];

  // Factores estacionales por tipo
  const estacionalidad = {
    auto: [1.0, 1.05, 1.15, 1.25, 1.30, 1.10],       // Verano mas accidentes
    hogar: [0.95, 0.90, 0.85, 0.80, 0.85, 1.20],      // Septiembre DANA
    salud: [1.0, 0.95, 0.90, 0.85, 0.80, 0.95],       // Verano menos consultas
    vida: [1.0, 1.0, 1.0, 1.05, 1.05, 1.0],           // Estable
    responsabilidad_civil: [1.0, 1.05, 1.10, 1.15, 1.10, 1.05],
  };

  // Siniestros base mensuales
  const basesMensuales = { auto: 45, hogar: 18, salud: 65, vida: 3, responsabilidad_civil: 8 };

  // Costes medios
  const costesMedios = { auto: 3200, hogar: 4800, salud: 1200, vida: 28000, responsabilidad_civil: 7500 };

  const proyeccion = meses.map((mes, i) => {
    const desglose = {};
    let totalSiniestros = 0;
    let totalCoste = 0;

    for (const [tipo, base] of Object.entries(basesMensuales)) {
      const factor = estacionalidad[tipo][i];
      const siniestrosEstimados = Math.round(base * factor);
      const costeEstimado = siniestrosEstimados * costesMedios[tipo];

      desglose[tipo] = {
        siniestros_estimados: siniestrosEstimados,
        factor_estacional: factor,
        coste_estimado: costeEstimado,
      };

      totalSiniestros += siniestrosEstimados;
      totalCoste += costeEstimado;
    }

    return {
      mes,
      total_siniestros_estimados: totalSiniestros,
      coste_total_estimado: totalCoste,
      desglose,
    };
  });

  // Proyeccion por zonas de riesgo
  const proyeccionZonas = {};
  const zonasAltas = Object.entries(zonasRiesgo).filter(([, z]) => z.nivel === 'alto');

  for (const [comunidad, zona] of zonasAltas) {
    proyeccionZonas[comunidad] = {
      nivel_riesgo: zona.nivel,
      riesgos_estacionales: [],
    };

    // Riesgos estacionales especificos
    if (zona.riesgos_naturales.includes('DANA')) {
      proyeccionZonas[comunidad].riesgos_estacionales.push({
        periodo: 'Septiembre 2026',
        riesgo: 'DANA / gota fria',
        probabilidad: '65%',
        impacto_estimado: 'Alto - posibles inundaciones e incremento siniestros hogar x3',
      });
    }
    if (zona.riesgos_naturales.includes('inundacion')) {
      proyeccionZonas[comunidad].riesgos_estacionales.push({
        periodo: 'Agosto-Septiembre 2026',
        riesgo: 'Inundaciones por lluvias torrenciales',
        probabilidad: '45%',
        impacto_estimado: 'Medio-Alto - danos en viviendas y vehiculos',
      });
    }
  }

  const totalSiniestros6m = proyeccion.reduce((s, m) => s + m.total_siniestros_estimados, 0);
  const totalCoste6m = proyeccion.reduce((s, m) => s + m.coste_total_estimado, 0);

  return {
    fecha_proyeccion: '2026-03-19',
    horizonte: '6 meses (Abril - Septiembre 2026)',
    total_siniestros_estimados: totalSiniestros6m,
    coste_total_estimado: totalCoste6m,
    coste_medio_mensual: Math.round(totalCoste6m / 6),
    proyeccion_mensual: proyeccion,
    zonas_atencion_especial: proyeccionZonas,
    advertencias: [
      'DANA: probabilidad elevada en sept. en Comunidad Valenciana y Region de Murcia. Considerar refuerzo de reservas.',
      'Verano: incremento esperado del 25-30% en siniestros de auto por mayor movilidad.',
      'Ola de calor julio-agosto: posible aumento de reclamaciones de salud en poblacion mayor.',
    ],
  };
}

// ---------------------------------------------------------------------------
// alertaConcentracion - Detecta concentracion geografica de riesgo
// ---------------------------------------------------------------------------
function alertaConcentracion() {
  const concentracion = {};

  for (const cliente of clientes) {
    if (!concentracion[cliente.comunidad]) {
      concentracion[cliente.comunidad] = {
        clientes: [],
        polizas: 0,
        prima_total: 0,
        siniestros_total: 0,
      };
    }
    concentracion[cliente.comunidad].clientes.push(cliente.id);
    concentracion[cliente.comunidad].polizas += cliente.productos.length;
    concentracion[cliente.comunidad].prima_total += cliente.prima_actual;
    concentracion[cliente.comunidad].siniestros_total += cliente.historial_siniestros;
  }

  const alertas = [];

  for (const [comunidad, datos] of Object.entries(concentracion)) {
    const zona = zonasRiesgo[comunidad];
    if (!zona) continue;

    // Alerta si hay concentracion en zona de alto riesgo
    if (zona.nivel === 'alto' && datos.polizas >= 3) {
      alertas.push({
        tipo: 'concentracion_alto_riesgo',
        severidad: 'alta',
        comunidad,
        nivel_riesgo_zona: zona.nivel,
        clientes_afectados: datos.clientes.length,
        polizas_expuestas: datos.polizas,
        prima_expuesta: datos.prima_total,
        siniestros_historicos: datos.siniestros_total,
        riesgos_naturales: zona.riesgos_naturales,
        descripcion: `Concentracion de ${datos.polizas} polizas en ${comunidad} (zona riesgo ${zona.nivel}). ` +
          `Prima expuesta: ${datos.prima_total} EUR. Riesgos naturales: ${zona.riesgos_naturales.join(', ')}.`,
        recomendacion: 'Diversificar cartera o contratar reaseguro proporcional para esta zona.',
      });
    }

    // Alerta si ratio siniestralidad es alta
    if (datos.polizas > 0 && (datos.siniestros_total / datos.polizas) > 0.6) {
      alertas.push({
        tipo: 'alta_siniestralidad',
        severidad: 'media',
        comunidad,
        ratio_siniestralidad: +(datos.siniestros_total / datos.polizas).toFixed(2),
        descripcion: `Ratio siniestralidad elevada en ${comunidad}: ${(datos.siniestros_total / datos.polizas).toFixed(2)} siniestros por poliza.`,
        recomendacion: 'Revisar tarificacion y condiciones de suscripcion en esta zona.',
      });
    }

    // Alerta especifica para zonas con riesgo de DANA
    if (zona.riesgos_naturales.includes('DANA') && datos.polizas >= 2) {
      alertas.push({
        tipo: 'riesgo_catastrofico',
        severidad: 'alta',
        comunidad,
        evento: 'DANA / gota fria',
        periodo_riesgo: 'Septiembre - Noviembre',
        polizas_expuestas: datos.polizas,
        prima_expuesta: datos.prima_total,
        descripcion: `${datos.polizas} polizas expuestas a riesgo de DANA en ${comunidad}. Temporada de riesgo: sept-nov.`,
        recomendacion: 'Verificar coberturas de Consorcio de Compensacion de Seguros. Reforzar provisiones tecncias.',
      });
    }
  }

  // Alerta global de diversificacion
  const totalPolizas = Object.values(concentracion).reduce((s, d) => s + d.polizas, 0);
  const maxConcentracion = Object.entries(concentracion)
    .map(([com, d]) => ({ comunidad: com, pct: Math.round((d.polizas / totalPolizas) * 100) }))
    .sort((a, b) => b.pct - a.pct);

  if (maxConcentracion[0] && maxConcentracion[0].pct > 30) {
    alertas.push({
      tipo: 'sobreconcentracion_cartera',
      severidad: 'media',
      comunidad: maxConcentracion[0].comunidad,
      porcentaje_cartera: maxConcentracion[0].pct,
      descripcion: `El ${maxConcentracion[0].pct}% de la cartera se concentra en ${maxConcentracion[0].comunidad}. Riesgo de acumulacion.`,
      recomendacion: 'Potenciar crecimiento comercial en otras zonas para diversificar riesgo.',
      distribucion_actual: maxConcentracion,
    });
  }

  return {
    fecha: '2026-03-19',
    total_alertas: alertas.length,
    alertas: alertas.sort((a, b) => {
      const prioridad = { alta: 0, media: 1, baja: 2 };
      return (prioridad[a.severidad] || 2) - (prioridad[b.severidad] || 2);
    }),
  };
}

module.exports = {
  getClientesAltoRiesgo,
  getMapaRiesgo,
  getRecomendaciones,
  getProyeccion,
  alertaConcentracion,
  PESOS_FACTORES,
  zonasRiesgo,
};
