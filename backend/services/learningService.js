// =============================================================================
// Continuous Learning Service
// Tracks prediction outcomes, detects patterns, and suggests improvements
// =============================================================================

const crypto = require('crypto');

// ---------------------------------------------------------------------------
// In-memory stores
// ---------------------------------------------------------------------------
const learningEvents = [];
const outcomeRecords = [];

// ---------------------------------------------------------------------------
// Model metrics
// ---------------------------------------------------------------------------
const modelMetrics = {
  fraudeAccuracy: 0,
  clasificacionAccuracy: 0,
  valoracionAccuracy: 0,
  tiempoPrediccionAccuracy: 0,
  lastUpdated: null,
};

// ---------------------------------------------------------------------------
// Helper: generate unique ID
// ---------------------------------------------------------------------------
function generateId() {
  return 'LE-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

// ---------------------------------------------------------------------------
// recordOutcome - records a prediction vs actual result
// ---------------------------------------------------------------------------
function recordOutcome(siniestroId, prediccion, resultadoReal) {
  if (!siniestroId || prediccion === undefined || resultadoReal === undefined) {
    throw new Error('siniestroId, prediccion y resultadoReal son requeridos');
  }

  const tipo = prediccion.tipo || 'general';
  const acierto = evaluateAccuracy(prediccion, resultadoReal);

  // Get previous accuracy for this type
  const prevAccuracy = calculateAccuracy(tipo, 'all');

  const record = {
    id: generateId(),
    siniestroId,
    tipo,
    prediccion,
    resultadoReal,
    acierto,
    fecha: new Date().toISOString(),
  };
  outcomeRecords.push(record);

  // Record as learning event
  const newAccuracy = calculateAccuracy(tipo, 'all');

  const event = {
    id: generateId(),
    tipo,
    datos: {
      siniestroId,
      prediccion,
      resultadoReal,
    },
    resultado: acierto ? 'correcto' : 'incorrecto',
    precision_antes: prevAccuracy,
    precision_despues: newAccuracy,
    fecha: new Date().toISOString(),
  };
  learningEvents.push(event);

  return {
    recorded: true,
    event,
    accuracyChange: parseFloat((newAccuracy - prevAccuracy).toFixed(2)),
  };
}

// ---------------------------------------------------------------------------
// Helper: evaluate if prediction matches result
// ---------------------------------------------------------------------------
function evaluateAccuracy(prediccion, resultadoReal) {
  if (typeof prediccion === 'object' && typeof resultadoReal === 'object') {
    // Compare key fields
    if (prediccion.decision !== undefined && resultadoReal.decision !== undefined) {
      return prediccion.decision === resultadoReal.decision;
    }
    if (prediccion.valor !== undefined && resultadoReal.valor !== undefined) {
      const tolerance = resultadoReal.valor * 0.15; // 15% tolerance
      return Math.abs(prediccion.valor - resultadoReal.valor) <= tolerance;
    }
    if (prediccion.fraude !== undefined && resultadoReal.fraude !== undefined) {
      return prediccion.fraude === resultadoReal.fraude;
    }
    if (prediccion.categoria !== undefined && resultadoReal.categoria !== undefined) {
      return prediccion.categoria === resultadoReal.categoria;
    }
  }

  return prediccion === resultadoReal;
}

// ---------------------------------------------------------------------------
// calculateAccuracy - accuracy for a type over a period
// ---------------------------------------------------------------------------
function calculateAccuracy(tipo, periodo = 'all') {
  let records = outcomeRecords;

  if (tipo && tipo !== 'all') {
    records = records.filter((r) => r.tipo === tipo);
  }

  if (periodo !== 'all') {
    const now = Date.now();
    let cutoff;
    switch (periodo) {
      case 'day':
        cutoff = now - 86400000;
        break;
      case 'week':
        cutoff = now - 7 * 86400000;
        break;
      case 'month':
        cutoff = now - 30 * 86400000;
        break;
      case 'quarter':
        cutoff = now - 90 * 86400000;
        break;
      default:
        cutoff = 0;
    }
    records = records.filter((r) => new Date(r.fecha).getTime() >= cutoff);
  }

  if (records.length === 0) return 0;

  const correct = records.filter((r) => r.acierto).length;
  return parseFloat(((correct / records.length) * 100).toFixed(2));
}

// ---------------------------------------------------------------------------
// detectPatterns - analyze outcomes to find new patterns
// ---------------------------------------------------------------------------
function detectPatterns() {
  const patterns = [];

  // Pattern 1: Fraud detection patterns - false positives by category
  const fraudRecords = outcomeRecords.filter((r) => r.tipo === 'fraude');
  if (fraudRecords.length >= 3) {
    const falsePositives = fraudRecords.filter(
      (r) => r.prediccion.fraude === true && r.resultadoReal.fraude === false
    );
    if (falsePositives.length > 0) {
      const rate = (falsePositives.length / fraudRecords.length) * 100;
      patterns.push({
        pattern: 'alta_tasa_falsos_positivos_fraude',
        confidence: Math.min(95, 50 + fraudRecords.length * 2),
        occurrences: falsePositives.length,
        total: fraudRecords.length,
        rate: parseFloat(rate.toFixed(2)),
        suggestion: `Reducir sensibilidad de deteccion de fraude. Tasa de falsos positivos: ${rate.toFixed(1)}%`,
      });
    }
  }

  // Pattern 2: Valuation accuracy trend
  const valorRecords = outcomeRecords.filter((r) => r.tipo === 'valoracion');
  if (valorRecords.length >= 3) {
    const overEstimates = valorRecords.filter(
      (r) =>
        r.prediccion.valor !== undefined &&
        r.resultadoReal.valor !== undefined &&
        r.prediccion.valor > r.resultadoReal.valor * 1.1
    );
    if (overEstimates.length > valorRecords.length * 0.4) {
      patterns.push({
        pattern: 'sobrevaloracion_sistematica',
        confidence: Math.min(90, 55 + overEstimates.length * 3),
        occurrences: overEstimates.length,
        total: valorRecords.length,
        suggestion: 'El modelo tiende a sobrevalorar siniestros. Recalibrar coeficientes de valoracion a la baja.',
      });
    }

    const underEstimates = valorRecords.filter(
      (r) =>
        r.prediccion.valor !== undefined &&
        r.resultadoReal.valor !== undefined &&
        r.prediccion.valor < r.resultadoReal.valor * 0.9
    );
    if (underEstimates.length > valorRecords.length * 0.4) {
      patterns.push({
        pattern: 'subvaloracion_sistematica',
        confidence: Math.min(90, 55 + underEstimates.length * 3),
        occurrences: underEstimates.length,
        total: valorRecords.length,
        suggestion: 'El modelo tiende a infravalorar siniestros. Recalibrar coeficientes de valoracion al alza.',
      });
    }
  }

  // Pattern 3: Classification accuracy by category
  const clasifRecords = outcomeRecords.filter((r) => r.tipo === 'clasificacion');
  if (clasifRecords.length >= 3) {
    const misclassified = clasifRecords.filter((r) => !r.acierto);
    const categories = {};
    for (const mc of misclassified) {
      const cat = mc.resultadoReal.categoria || 'desconocido';
      categories[cat] = (categories[cat] || 0) + 1;
    }

    for (const [cat, count] of Object.entries(categories)) {
      if (count >= 2) {
        patterns.push({
          pattern: `clasificacion_erronea_${cat}`,
          confidence: Math.min(85, 45 + count * 5),
          occurrences: count,
          total: clasifRecords.length,
          suggestion: `La categoria "${cat}" se clasifica incorrectamente con frecuencia. Revisar reglas de clasificacion para esta categoria.`,
        });
      }
    }
  }

  // Pattern 4: Time-based accuracy degradation
  if (outcomeRecords.length >= 10) {
    const half = Math.floor(outcomeRecords.length / 2);
    const firstHalf = outcomeRecords.slice(0, half);
    const secondHalf = outcomeRecords.slice(half);

    const firstAccuracy =
      firstHalf.filter((r) => r.acierto).length / firstHalf.length;
    const secondAccuracy =
      secondHalf.filter((r) => r.acierto).length / secondHalf.length;

    if (secondAccuracy < firstAccuracy - 0.1) {
      patterns.push({
        pattern: 'degradacion_precision_temporal',
        confidence: Math.min(88, 60 + outcomeRecords.length),
        occurrences: outcomeRecords.length,
        firstHalfAccuracy: parseFloat((firstAccuracy * 100).toFixed(2)),
        secondHalfAccuracy: parseFloat((secondAccuracy * 100).toFixed(2)),
        suggestion:
          'La precision del modelo esta decreciendo con el tiempo. Se recomienda reentrenar el modelo con datos recientes.',
      });
    }
  }

  // Pattern 5: Recurring specific errors
  const recentErrors = outcomeRecords
    .filter((r) => !r.acierto)
    .slice(-20);

  const errorSignatures = {};
  for (const err of recentErrors) {
    const sig = `${err.tipo}:${JSON.stringify(err.prediccion)}`;
    errorSignatures[sig] = (errorSignatures[sig] || 0) + 1;
  }

  for (const [sig, count] of Object.entries(errorSignatures)) {
    if (count >= 3) {
      const [tipo] = sig.split(':');
      patterns.push({
        pattern: 'error_recurrente',
        confidence: Math.min(92, 50 + count * 8),
        occurrences: count,
        tipo,
        suggestion: `Error recurrente detectado en predicciones de tipo "${tipo}". Patron especifico se repite ${count} veces.`,
      });
    }
  }

  return patterns;
}

// ---------------------------------------------------------------------------
// suggestRuleImprovements - suggest changes based on patterns
// ---------------------------------------------------------------------------
function suggestRuleImprovements() {
  const patterns = detectPatterns();
  const suggestions = [];

  for (const pattern of patterns) {
    const suggestion = {
      id: generateId(),
      basedOnPattern: pattern.pattern,
      confidence: pattern.confidence,
      suggestion: pattern.suggestion,
      priority: pattern.confidence > 80 ? 'alta' : pattern.confidence > 60 ? 'media' : 'baja',
      impactoEstimado: estimateImpact(pattern),
      fecha: new Date().toISOString(),
    };
    suggestions.push(suggestion);
  }

  // Add general suggestions based on overall metrics
  updateMetrics();

  if (modelMetrics.fraudeAccuracy > 0 && modelMetrics.fraudeAccuracy < 75) {
    suggestions.push({
      id: generateId(),
      basedOnPattern: 'low_fraud_accuracy',
      confidence: 70,
      suggestion: `Precision de deteccion de fraude es ${modelMetrics.fraudeAccuracy}%. Considerar incorporar nuevas variables predictivas.`,
      priority: 'alta',
      impactoEstimado: 'Mejora potencial del 10-15% en deteccion de fraude',
      fecha: new Date().toISOString(),
    });
  }

  if (modelMetrics.valoracionAccuracy > 0 && modelMetrics.valoracionAccuracy < 70) {
    suggestions.push({
      id: generateId(),
      basedOnPattern: 'low_valuation_accuracy',
      confidence: 65,
      suggestion: `Precision de valoracion es ${modelMetrics.valoracionAccuracy}%. Actualizar tablas de costes de referencia.`,
      priority: 'media',
      impactoEstimado: 'Mejora potencial del 8-12% en precision de valoracion',
      fecha: new Date().toISOString(),
    });
  }

  return suggestions;
}

// ---------------------------------------------------------------------------
// Helper: estimate impact of a pattern fix
// ---------------------------------------------------------------------------
function estimateImpact(pattern) {
  if (pattern.confidence > 85) {
    return 'Impacto alto: mejora significativa esperada al aplicar la correccion';
  }
  if (pattern.confidence > 70) {
    return 'Impacto medio: mejora moderada esperada';
  }
  return 'Impacto bajo: mejora menor pero positiva';
}

// ---------------------------------------------------------------------------
// getWeeklyReport
// ---------------------------------------------------------------------------
function getWeeklyReport() {
  const weekAgo = new Date(Date.now() - 7 * 86400000);

  const weekEvents = learningEvents.filter(
    (e) => new Date(e.fecha) >= weekAgo
  );
  const weekOutcomes = outcomeRecords.filter(
    (r) => new Date(r.fecha) >= weekAgo
  );

  const totalWeek = weekOutcomes.length;
  const correctWeek = weekOutcomes.filter((r) => r.acierto).length;
  const weekAccuracy = totalWeek > 0 ? parseFloat(((correctWeek / totalWeek) * 100).toFixed(2)) : 0;

  // Previous week for comparison
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000);
  const prevWeekOutcomes = outcomeRecords.filter(
    (r) => new Date(r.fecha) >= twoWeeksAgo && new Date(r.fecha) < weekAgo
  );
  const prevTotal = prevWeekOutcomes.length;
  const prevCorrect = prevWeekOutcomes.filter((r) => r.acierto).length;
  const prevAccuracy = prevTotal > 0 ? parseFloat(((prevCorrect / prevTotal) * 100).toFixed(2)) : 0;

  const patterns = detectPatterns();
  const improvements = suggestRuleImprovements();

  // Anomalies in this week's data
  const weekValues = weekOutcomes
    .filter((r) => r.prediccion?.valor !== undefined)
    .map((r) => r.prediccion.valor);
  const anomalies = weekValues.length > 0 ? anomalyDetection(weekValues) : { anomalies: [] };

  return {
    periodo: {
      desde: weekAgo.toISOString(),
      hasta: new Date().toISOString(),
    },
    resumen: {
      totalEventos: weekEvents.length,
      totalPredicciones: totalWeek,
      prediccionesCorrectas: correctWeek,
      prediccionesIncorrectas: totalWeek - correctWeek,
      precisionSemana: weekAccuracy,
      precisionSemanaAnterior: prevAccuracy,
      tendencia: weekAccuracy > prevAccuracy ? 'mejorando' : weekAccuracy < prevAccuracy ? 'empeorando' : 'estable',
      cambio: parseFloat((weekAccuracy - prevAccuracy).toFixed(2)),
    },
    precisionPorTipo: {
      fraude: calculateAccuracy('fraude', 'week'),
      clasificacion: calculateAccuracy('clasificacion', 'week'),
      valoracion: calculateAccuracy('valoracion', 'week'),
      tiempo: calculateAccuracy('tiempo', 'week'),
    },
    patronesDetectados: patterns.length,
    patrones: patterns,
    mejoras: improvements,
    anomalias: anomalies.anomalies,
    generadoEn: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// getAccuracyHistory - accuracy over time for charting
// ---------------------------------------------------------------------------
function getAccuracyHistory() {
  if (outcomeRecords.length === 0) {
    return { history: [], totalRecords: 0 };
  }

  // Group by day
  const dayBuckets = {};
  for (const record of outcomeRecords) {
    const day = record.fecha.substring(0, 10); // YYYY-MM-DD
    if (!dayBuckets[day]) {
      dayBuckets[day] = { total: 0, correct: 0 };
    }
    dayBuckets[day].total++;
    if (record.acierto) dayBuckets[day].correct++;
  }

  const history = Object.entries(dayBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      fecha: date,
      precision: parseFloat(((data.correct / data.total) * 100).toFixed(2)),
      total: data.total,
      correctas: data.correct,
    }));

  // Cumulative accuracy
  let cumTotal = 0;
  let cumCorrect = 0;
  for (const entry of history) {
    cumTotal += entry.total;
    cumCorrect += entry.correctas;
    entry.precisionAcumulada = parseFloat(((cumCorrect / cumTotal) * 100).toFixed(2));
  }

  return { history, totalRecords: outcomeRecords.length };
}

// ---------------------------------------------------------------------------
// updateMetrics - recalculate all model metrics
// ---------------------------------------------------------------------------
function updateMetrics() {
  modelMetrics.fraudeAccuracy = calculateAccuracy('fraude', 'all');
  modelMetrics.clasificacionAccuracy = calculateAccuracy('clasificacion', 'all');
  modelMetrics.valoracionAccuracy = calculateAccuracy('valoracion', 'all');
  modelMetrics.tiempoPrediccionAccuracy = calculateAccuracy('tiempo', 'all');
  modelMetrics.lastUpdated = new Date().toISOString();

  return { ...modelMetrics };
}

// ---------------------------------------------------------------------------
// getEvolutionData - data for evolution chart (accuracy over weeks)
// ---------------------------------------------------------------------------
function getEvolutionData() {
  if (outcomeRecords.length === 0) {
    return { weeks: [], tipos: ['fraude', 'clasificacion', 'valoracion', 'tiempo'] };
  }

  // Group by ISO week
  const weekBuckets = {};
  for (const record of outcomeRecords) {
    const d = new Date(record.fecha);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const weekKey = weekStart.toISOString().substring(0, 10);

    if (!weekBuckets[weekKey]) {
      weekBuckets[weekKey] = {
        fraude: { total: 0, correct: 0 },
        clasificacion: { total: 0, correct: 0 },
        valoracion: { total: 0, correct: 0 },
        tiempo: { total: 0, correct: 0 },
        general: { total: 0, correct: 0 },
      };
    }

    const tipo = record.tipo || 'general';
    const bucket = weekBuckets[weekKey][tipo] || weekBuckets[weekKey].general;
    bucket.total++;
    if (record.acierto) bucket.correct++;

    weekBuckets[weekKey].general.total++;
    if (record.acierto) weekBuckets[weekKey].general.correct++;
  }

  const weeks = Object.entries(weekBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, data]) => {
      const result = { semana: weekStart };
      for (const tipo of ['fraude', 'clasificacion', 'valoracion', 'tiempo', 'general']) {
        result[tipo] =
          data[tipo].total > 0
            ? parseFloat(((data[tipo].correct / data[tipo].total) * 100).toFixed(2))
            : null;
        result[`${tipo}_total`] = data[tipo].total;
      }
      return result;
    });

  return {
    weeks,
    tipos: ['fraude', 'clasificacion', 'valoracion', 'tiempo', 'general'],
  };
}

// ---------------------------------------------------------------------------
// anomalyDetection - z-score based anomaly detection
// ---------------------------------------------------------------------------
function anomalyDetection(data) {
  if (!Array.isArray(data) || data.length < 3) {
    return {
      anomalies: [],
      message: 'Se necesitan al menos 3 puntos de datos para detectar anomalias',
    };
  }

  const numericData = data.filter((d) => typeof d === 'number' && !isNaN(d));
  if (numericData.length < 3) {
    return { anomalies: [], message: 'Datos numericos insuficientes' };
  }

  // Calculate mean
  const mean = numericData.reduce((sum, v) => sum + v, 0) / numericData.length;

  // Calculate standard deviation
  const squaredDiffs = numericData.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / numericData.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return {
      anomalies: [],
      stats: { mean, stdDev: 0, dataPoints: numericData.length },
      message: 'Desviacion estandar es cero, todos los valores son iguales',
    };
  }

  const ZSCORE_THRESHOLD = 2.0;

  const anomalies = [];
  for (let i = 0; i < numericData.length; i++) {
    const zScore = (numericData[i] - mean) / stdDev;
    if (Math.abs(zScore) > ZSCORE_THRESHOLD) {
      anomalies.push({
        index: i,
        value: numericData[i],
        zScore: parseFloat(zScore.toFixed(3)),
        severity: Math.abs(zScore) > 3 ? 'alta' : 'media',
        direction: zScore > 0 ? 'por_encima' : 'por_debajo',
      });
    }
  }

  return {
    anomalies,
    stats: {
      mean: parseFloat(mean.toFixed(2)),
      stdDev: parseFloat(stdDev.toFixed(2)),
      dataPoints: numericData.length,
      threshold: ZSCORE_THRESHOLD,
    },
    totalAnomalies: anomalies.length,
  };
}

// ---------------------------------------------------------------------------
// getLearningEvents
// ---------------------------------------------------------------------------
function getLearningEvents(limit = 50) {
  return learningEvents.slice(-limit);
}

// ---------------------------------------------------------------------------
// getModelMetrics
// ---------------------------------------------------------------------------
function getModelMetrics() {
  return updateMetrics();
}

// ---------------------------------------------------------------------------
// Pre-populate demo data: 30+ learning events showing improvement
// ---------------------------------------------------------------------------
function initDemoData() {
  const baseDate = new Date('2025-04-01T00:00:00.000Z');

  const demoOutcomes = [
    // Week 1 - lower accuracy (learning phase)
    { day: 0, tipo: 'fraude', prediccion: { tipo: 'fraude', fraude: true }, resultado: { fraude: false } },
    { day: 0, tipo: 'fraude', prediccion: { tipo: 'fraude', fraude: true }, resultado: { fraude: true } },
    { day: 1, tipo: 'clasificacion', prediccion: { tipo: 'clasificacion', categoria: 'vehiculo' }, resultado: { categoria: 'hogar' } },
    { day: 1, tipo: 'valoracion', prediccion: { tipo: 'valoracion', valor: 12000 }, resultado: { valor: 8000 } },
    { day: 2, tipo: 'fraude', prediccion: { tipo: 'fraude', fraude: false }, resultado: { fraude: false } },
    { day: 2, tipo: 'clasificacion', prediccion: { tipo: 'clasificacion', categoria: 'salud' }, resultado: { categoria: 'salud' } },
    { day: 3, tipo: 'valoracion', prediccion: { tipo: 'valoracion', valor: 5000 }, resultado: { valor: 5500 } },
    { day: 3, tipo: 'tiempo', prediccion: { tipo: 'tiempo', dias: 15 }, resultado: { dias: 22 } },

    // Week 2 - improving
    { day: 7, tipo: 'fraude', prediccion: { tipo: 'fraude', fraude: true }, resultado: { fraude: true } },
    { day: 7, tipo: 'fraude', prediccion: { tipo: 'fraude', fraude: false }, resultado: { fraude: false } },
    { day: 8, tipo: 'clasificacion', prediccion: { tipo: 'clasificacion', categoria: 'vehiculo' }, resultado: { categoria: 'vehiculo' } },
    { day: 8, tipo: 'valoracion', prediccion: { tipo: 'valoracion', valor: 9000 }, resultado: { valor: 8500 } },
    { day: 9, tipo: 'clasificacion', prediccion: { tipo: 'clasificacion', categoria: 'hogar' }, resultado: { categoria: 'hogar' } },
    { day: 9, tipo: 'tiempo', prediccion: { tipo: 'tiempo', dias: 10 }, resultado: { dias: 12 } },
    { day: 10, tipo: 'fraude', prediccion: { tipo: 'fraude', fraude: true }, resultado: { fraude: true } },
    { day: 10, tipo: 'valoracion', prediccion: { tipo: 'valoracion', valor: 3000 }, resultado: { valor: 3200 } },

    // Week 3 - good accuracy
    { day: 14, tipo: 'fraude', prediccion: { tipo: 'fraude', fraude: false }, resultado: { fraude: false } },
    { day: 14, tipo: 'clasificacion', prediccion: { tipo: 'clasificacion', categoria: 'vida' }, resultado: { categoria: 'vida' } },
    { day: 15, tipo: 'valoracion', prediccion: { tipo: 'valoracion', valor: 20000 }, resultado: { valor: 19500 } },
    { day: 15, tipo: 'fraude', prediccion: { tipo: 'fraude', fraude: true }, resultado: { fraude: true } },
    { day: 16, tipo: 'clasificacion', prediccion: { tipo: 'clasificacion', categoria: 'vehiculo' }, resultado: { categoria: 'vehiculo' } },
    { day: 16, tipo: 'tiempo', prediccion: { tipo: 'tiempo', dias: 7 }, resultado: { dias: 8 } },
    { day: 17, tipo: 'valoracion', prediccion: { tipo: 'valoracion', valor: 6000 }, resultado: { valor: 6100 } },
    { day: 17, tipo: 'fraude', prediccion: { tipo: 'fraude', fraude: false }, resultado: { fraude: false } },

    // Week 4 - high accuracy
    { day: 21, tipo: 'fraude', prediccion: { tipo: 'fraude', fraude: true }, resultado: { fraude: true } },
    { day: 21, tipo: 'clasificacion', prediccion: { tipo: 'clasificacion', categoria: 'salud' }, resultado: { categoria: 'salud' } },
    { day: 22, tipo: 'valoracion', prediccion: { tipo: 'valoracion', valor: 15000 }, resultado: { valor: 14800 } },
    { day: 22, tipo: 'tiempo', prediccion: { tipo: 'tiempo', dias: 5 }, resultado: { dias: 5 } },
    { day: 23, tipo: 'fraude', prediccion: { tipo: 'fraude', fraude: false }, resultado: { fraude: false } },
    { day: 23, tipo: 'clasificacion', prediccion: { tipo: 'clasificacion', categoria: 'hogar' }, resultado: { categoria: 'hogar' } },
    { day: 24, tipo: 'valoracion', prediccion: { tipo: 'valoracion', valor: 4500 }, resultado: { valor: 4600 } },
    { day: 24, tipo: 'fraude', prediccion: { tipo: 'fraude', fraude: true }, resultado: { fraude: true } },
    { day: 25, tipo: 'clasificacion', prediccion: { tipo: 'clasificacion', categoria: 'vehiculo' }, resultado: { categoria: 'vehiculo' } },
    { day: 25, tipo: 'tiempo', prediccion: { tipo: 'tiempo', dias: 12 }, resultado: { dias: 11 } },
  ];

  for (const demo of demoOutcomes) {
    const fecha = new Date(baseDate.getTime() + demo.day * 86400000);

    const acierto = evaluateAccuracy(demo.prediccion, demo.resultado);

    outcomeRecords.push({
      id: generateId(),
      siniestroId: `SIN-DEMO-${outcomeRecords.length + 1}`,
      tipo: demo.tipo,
      prediccion: demo.prediccion,
      resultadoReal: demo.resultado,
      acierto,
      fecha: fecha.toISOString(),
    });

    learningEvents.push({
      id: generateId(),
      tipo: demo.tipo,
      datos: {
        siniestroId: `SIN-DEMO-${learningEvents.length + 1}`,
        prediccion: demo.prediccion,
        resultadoReal: demo.resultado,
      },
      resultado: acierto ? 'correcto' : 'incorrecto',
      precision_antes: 0,
      precision_despues: 0,
      fecha: fecha.toISOString(),
    });
  }

  // Backfill precision_antes / precision_despues in learning events
  for (let i = 0; i < learningEvents.length; i++) {
    const event = learningEvents[i];
    const tipo = event.tipo;
    const priorRecords = outcomeRecords
      .slice(0, i)
      .filter((r) => r.tipo === tipo);
    const currentRecords = outcomeRecords
      .slice(0, i + 1)
      .filter((r) => r.tipo === tipo);

    event.precision_antes =
      priorRecords.length > 0
        ? parseFloat(
            (
              (priorRecords.filter((r) => r.acierto).length / priorRecords.length) *
              100
            ).toFixed(2)
          )
        : 0;

    event.precision_despues =
      currentRecords.length > 0
        ? parseFloat(
            (
              (currentRecords.filter((r) => r.acierto).length / currentRecords.length) *
              100
            ).toFixed(2)
          )
        : 0;
  }

  updateMetrics();
}

initDemoData();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  recordOutcome,
  calculateAccuracy,
  detectPatterns,
  suggestRuleImprovements,
  getWeeklyReport,
  getAccuracyHistory,
  updateMetrics,
  getModelMetrics,
  getEvolutionData,
  anomalyDetection,
  getLearningEvents,
};
