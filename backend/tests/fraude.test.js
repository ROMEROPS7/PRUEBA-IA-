// ============================================================
// FRAUDE TEST SUITE
// Tests for fraud score calculation, suspicious keyword detection,
// multiple claims, and score weighting
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');

// --------------- Fraud scoring logic (mirrors fraudeService.js) ---------------
const PESOS = {
  historial_reclamaciones: 0.20,
  coherencia_temporal: 0.15,
  coherencia_geografica: 0.10,
  metadatos_fotos: 0.15,
  red_vinculacion: 0.15,
  valor_reclamacion: 0.10,
  patron_comportamiento: 0.10,
  base_datos_externa: 0.05,
};

function calcularScoreRapido(descripcion, tipo, urgencia) {
  let score = 0;
  const desc = (descripcion || '').toLowerCase();

  const indicadores = {
    'robo': 15, 'desaparecido': 20, 'incendio': 10, 'sin testigos': 25,
    'nadie vio': 20, 'total loss': 15, 'siniestro total': 15,
    'madrugada': 10, 'no recuerdo': 15, 'solo': 5,
  };

  for (const [palabra, puntos] of Object.entries(indicadores)) {
    if (desc.includes(palabra)) score += puntos;
  }

  if (tipo === 'robo') score += 10;
  if (urgencia >= 9) score += 5;

  return Math.min(100, Math.max(0, score));
}

function calcularScorePonderado(dimensiones) {
  let scoreFinal = 0;
  for (const [dim, peso] of Object.entries(PESOS)) {
    scoreFinal += (dimensiones[dim]?.score || 0) * peso;
  }
  return Math.round(Math.min(100, scoreFinal));
}

function determinarNivelRiesgo(score) {
  if (score >= 70) return 'CRITICO';
  if (score >= 50) return 'ALTO';
  if (score >= 25) return 'MEDIO';
  return 'BAJO';
}

function analizarHistorial(numReclamaciones, reclamacionesRecientes) {
  let score = 0;
  const alertas = [];

  if (numReclamaciones >= 5) { score = 90; alertas.push('ALERTA: 5+ reclamaciones del mismo cliente'); }
  else if (numReclamaciones >= 3) { score = 60; alertas.push('Atencion: 3+ reclamaciones del mismo cliente'); }
  else if (numReclamaciones >= 2) score = 30;
  else score = 5;

  if (reclamacionesRecientes >= 3) {
    score = Math.min(100, score + 20);
    alertas.push('Frecuencia alta: 3+ siniestros en 6 meses');
  }

  return { score, alertas };
}

function analizarPalabras(descripcion) {
  const desc = descripcion.toLowerCase();
  let score = 0;
  const alertas = [];
  const palabrasSospechosas = ['sin testigos', 'nadie vio', 'solo', 'madrugada', 'desaparecio', 'no recuerdo', 'total', 'incendio nocturno'];

  for (const p of palabrasSospechosas) {
    if (desc.includes(p)) {
      score += 15;
      alertas.push(`Palabra sospechosa: "${p}"`);
    }
  }

  return { score: Math.min(100, score), alertas };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Score bajo para siniestro normal',
    fn() {
      const score = calcularScoreRapido(
        'Colision frontal en autopista con testigos presentes y policia en el lugar',
        'coche',
        5
      );
      assert.ok(score < 20, `Score deberia ser bajo para siniestro normal, obtuvo ${score}`);
    },
  },
  {
    name: 'Score alto para siniestro sospechoso',
    fn() {
      const score = calcularScoreRapido(
        'Robo del vehiculo sin testigos en madrugada, desaparecido total loss',
        'robo',
        9
      );
      // 'robo' +15, 'sin testigos' +25, 'madrugada' +10, 'desaparecido' +20, 'total loss' +15, tipo robo +10, urgencia>=9 +5 = 100
      assert.ok(score >= 70, `Score deberia ser alto, obtuvo ${score}`);
    },
  },
  {
    name: 'Deteccion de fraude con multiples reclamaciones del mismo cliente',
    fn() {
      // Client with 5+ claims
      const result5 = analizarHistorial(5, 1);
      assert.strictEqual(result5.score, 90);
      assert.ok(result5.alertas.some(a => a.includes('5+')));

      // Client with 3 claims
      const result3 = analizarHistorial(3, 1);
      assert.strictEqual(result3.score, 60);

      // Client with 1 claim
      const result1 = analizarHistorial(1, 0);
      assert.strictEqual(result1.score, 5);
    },
  },
  {
    name: 'Deteccion de fraude con frecuencia alta en 6 meses',
    fn() {
      const result = analizarHistorial(3, 3);
      assert.strictEqual(result.score, 80); // 60 + 20
      assert.ok(result.alertas.some(a => a.includes('Frecuencia alta')));
      assert.ok(result.alertas.some(a => a.includes('3+ reclamaciones')));
    },
  },
  {
    name: 'Deteccion de palabras clave sospechosas',
    fn() {
      const normal = analizarPalabras('Accidente de trafico leve, policia presente');
      assert.strictEqual(normal.score, 0);
      assert.strictEqual(normal.alertas.length, 0);

      const sospechoso = analizarPalabras('Ocurrio en madrugada, nadie vio nada, estaba solo');
      assert.ok(sospechoso.score >= 30, `Score deberia ser >= 30, obtuvo ${sospechoso.score}`);
      assert.ok(sospechoso.alertas.length >= 2);

      const muySospechoso = analizarPalabras('Incendio nocturno sin testigos, no recuerdo nada, desaparecio todo');
      assert.ok(muySospechoso.score >= 45, `Score deberia ser >= 45, obtuvo ${muySospechoso.score}`);
    },
  },
  {
    name: 'Pesos de scoring suman 1.0',
    fn() {
      const totalPesos = Object.values(PESOS).reduce((sum, p) => sum + p, 0);
      assert.ok(Math.abs(totalPesos - 1.0) < 0.001, `Los pesos deben sumar 1.0, suman ${totalPesos}`);
    },
  },
  {
    name: 'Score ponderado respeta pesos de dimensiones',
    fn() {
      // All dimensions at 100 should give 100
      const all100 = {};
      for (const dim of Object.keys(PESOS)) {
        all100[dim] = { score: 100 };
      }
      assert.strictEqual(calcularScorePonderado(all100), 100);

      // All at 0 should give 0
      const all0 = {};
      for (const dim of Object.keys(PESOS)) {
        all0[dim] = { score: 0 };
      }
      assert.strictEqual(calcularScorePonderado(all0), 0);

      // Only historial at 100 (peso 0.20) should give 20
      const soloHistorial = {};
      for (const dim of Object.keys(PESOS)) {
        soloHistorial[dim] = { score: 0 };
      }
      soloHistorial.historial_reclamaciones = { score: 100 };
      assert.strictEqual(calcularScorePonderado(soloHistorial), 20);
    },
  },
  {
    name: 'Nivel de riesgo se calcula correctamente',
    fn() {
      assert.strictEqual(determinarNivelRiesgo(75), 'CRITICO');
      assert.strictEqual(determinarNivelRiesgo(70), 'CRITICO');
      assert.strictEqual(determinarNivelRiesgo(55), 'ALTO');
      assert.strictEqual(determinarNivelRiesgo(50), 'ALTO');
      assert.strictEqual(determinarNivelRiesgo(30), 'MEDIO');
      assert.strictEqual(determinarNivelRiesgo(25), 'MEDIO');
      assert.strictEqual(determinarNivelRiesgo(10), 'BAJO');
      assert.strictEqual(determinarNivelRiesgo(0), 'BAJO');
    },
  },
  {
    name: 'Score nunca excede 100 ni baja de 0',
    fn() {
      const extremo = calcularScoreRapido(
        'robo sin testigos desaparecido incendio nadie vio madrugada total loss siniestro total no recuerdo solo',
        'robo',
        10
      );
      assert.ok(extremo <= 100, `Score no puede exceder 100, obtuvo ${extremo}`);
      assert.ok(extremo >= 0, `Score no puede ser negativo`);

      const vacio = calcularScoreRapido('', 'otro', 1);
      assert.ok(vacio >= 0, `Score no puede ser negativo`);
      assert.ok(vacio <= 100);
    },
  },
  {
    name: 'Tipo robo incrementa score base',
    fn() {
      const scoreRobo = calcularScoreRapido('Danos en propiedad', 'robo', 5);
      const scoreCoche = calcularScoreRapido('Danos en propiedad', 'coche', 5);
      assert.ok(scoreRobo > scoreCoche, `Tipo robo (${scoreRobo}) deberia tener mayor score que coche (${scoreCoche})`);
    },
  },
];

async function runTests() {
  const results = { passed: 0, failed: 0, errors: [] };
  for (const test of tests) {
    const start = Date.now();
    try {
      await test.fn();
      const elapsed = Date.now() - start;
      results.passed++;
      console.log(`  \x1b[32m✓\x1b[0m ${test.name} \x1b[90m(${elapsed}ms)\x1b[0m`);
    } catch (err) {
      const elapsed = Date.now() - start;
      results.failed++;
      results.errors.push({ name: test.name, error: err.message });
      console.log(`  \x1b[31m✗\x1b[0m ${test.name} \x1b[90m(${elapsed}ms)\x1b[0m`);
      console.log(`    \x1b[31m${err.message}\x1b[0m`);
    }
  }
  return results;
}

module.exports = { runTests, tests };
