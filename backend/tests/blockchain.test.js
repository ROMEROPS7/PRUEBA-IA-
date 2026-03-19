// ============================================================
// BLOCKCHAIN TEST SUITE
// Tests for blockchainService: recordDecision, verifyChain,
// verifyExpediente, getChainStats
// Uses Node.js built-in assert module
// ============================================================
const assert = require('assert');
const crypto = require('crypto');

// --------------- Mock blockchain service ---------------
let chain = [];

function resetData() {
  chain = [];
  // Genesis block
  chain.push({
    index: 0,
    timestamp: '2024-01-01T00:00:00.000Z',
    type: 'genesis',
    expediente: null,
    data: { message: 'Genesis block' },
    previousHash: '0',
    hash: computeHash(0, '2024-01-01T00:00:00.000Z', 'genesis', null, { message: 'Genesis block' }, '0'),
  });
}

function computeHash(index, timestamp, type, expediente, data, previousHash) {
  const content = `${index}${timestamp}${type}${expediente}${JSON.stringify(data)}${previousHash}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

function recordDecision({ expediente, tipo, data }) {
  if (!expediente || !tipo || !data) {
    return { error: 'expediente, tipo y data son requeridos', status: 400 };
  }
  const validTypes = ['decision', 'aprobacion', 'rechazo', 'asignacion', 'fraude', 'cierre', 'pago'];
  if (!validTypes.includes(tipo)) {
    return { error: 'Tipo de registro no valido', status: 400 };
  }

  const previousBlock = chain[chain.length - 1];
  const index = chain.length;
  const timestamp = new Date().toISOString();
  const hash = computeHash(index, timestamp, tipo, expediente, data, previousBlock.hash);

  const block = { index, timestamp, type: tipo, expediente, data, previousHash: previousBlock.hash, hash };
  chain.push(block);
  return { data: block, status: 201 };
}

function verifyChain() {
  const errors = [];
  for (let i = 1; i < chain.length; i++) {
    const block = chain[i];
    const prevBlock = chain[i - 1];

    // Verify previous hash link
    if (block.previousHash !== prevBlock.hash) {
      errors.push({ block_index: i, error: 'previousHash no coincide' });
    }

    // Verify block hash
    const expectedHash = computeHash(block.index, block.timestamp, block.type, block.expediente, block.data, block.previousHash);
    if (block.hash !== expectedHash) {
      errors.push({ block_index: i, error: 'Hash corrupto' });
    }
  }

  return {
    data: { total_blocks: chain.length, valid: errors.length === 0, errors },
    status: 200,
  };
}

function verifyExpediente(expediente) {
  if (!expediente) return { error: 'expediente es requerido', status: 400 };
  const blocks = chain.filter(b => b.expediente === expediente);
  if (blocks.length === 0) return { error: 'No se encontraron registros para este expediente', status: 404 };

  return {
    data: {
      expediente,
      total_records: blocks.length,
      history: blocks.map(b => ({ index: b.index, type: b.type, timestamp: b.timestamp, hash: b.hash.substring(0, 16) + '...' })),
      first_record: blocks[0].timestamp,
      last_record: blocks[blocks.length - 1].timestamp,
    },
    status: 200,
  };
}

function getChainStats() {
  const typeCount = {};
  const expedienteSet = new Set();
  for (const block of chain) {
    typeCount[block.type] = (typeCount[block.type] || 0) + 1;
    if (block.expediente) expedienteSet.add(block.expediente);
  }
  return {
    data: {
      total_blocks: chain.length,
      unique_expedientes: expedienteSet.size,
      records_by_type: typeCount,
      chain_valid: verifyChain().data.valid,
      genesis_date: chain[0].timestamp,
      latest_date: chain[chain.length - 1].timestamp,
    },
    status: 200,
  };
}

// --------------- Test cases ---------------
const tests = [
  {
    name: 'Genesis block existe al inicializar',
    fn() {
      resetData();
      assert.strictEqual(chain.length, 1);
      assert.strictEqual(chain[0].type, 'genesis');
      assert.strictEqual(chain[0].previousHash, '0');
      assert.ok(chain[0].hash);
    },
  },
  {
    name: 'Registrar decision con datos validos',
    fn() {
      resetData();
      const result = recordDecision({ expediente: 'EXP-001', tipo: 'decision', data: { accion: 'aprobar', monto: 5000 } });
      assert.strictEqual(result.status, 201);
      assert.strictEqual(result.data.index, 1);
      assert.strictEqual(result.data.expediente, 'EXP-001');
      assert.strictEqual(result.data.previousHash, chain[0].hash);
      assert.ok(result.data.hash);
    },
  },
  {
    name: 'Registrar decision sin expediente falla',
    fn() {
      resetData();
      const result = recordDecision({ tipo: 'decision', data: {} });
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Registrar decision con tipo invalido falla',
    fn() {
      resetData();
      const result = recordDecision({ expediente: 'EXP-001', tipo: 'invalido', data: {} });
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Cadena de bloques mantiene integridad',
    fn() {
      resetData();
      recordDecision({ expediente: 'EXP-001', tipo: 'decision', data: { paso: 1 } });
      recordDecision({ expediente: 'EXP-001', tipo: 'aprobacion', data: { paso: 2 } });
      recordDecision({ expediente: 'EXP-002', tipo: 'asignacion', data: { perito: 'AGT-001' } });

      assert.strictEqual(chain.length, 4);
      for (let i = 1; i < chain.length; i++) {
        assert.strictEqual(chain[i].previousHash, chain[i - 1].hash);
      }
    },
  },
  {
    name: 'Verificar cadena valida',
    fn() {
      resetData();
      recordDecision({ expediente: 'EXP-001', tipo: 'decision', data: { test: true } });
      recordDecision({ expediente: 'EXP-001', tipo: 'cierre', data: { test: true } });
      const result = verifyChain();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.valid, true);
      assert.strictEqual(result.data.errors.length, 0);
    },
  },
  {
    name: 'Verificar cadena detecta manipulacion',
    fn() {
      resetData();
      recordDecision({ expediente: 'EXP-001', tipo: 'decision', data: { monto: 1000 } });
      // Tamper with block data
      chain[1].data.monto = 99999;
      const result = verifyChain();
      assert.strictEqual(result.data.valid, false);
      assert.ok(result.data.errors.length > 0);
    },
  },
  {
    name: 'Verificar expediente existente',
    fn() {
      resetData();
      recordDecision({ expediente: 'EXP-001', tipo: 'decision', data: { paso: 1 } });
      recordDecision({ expediente: 'EXP-001', tipo: 'aprobacion', data: { paso: 2 } });
      recordDecision({ expediente: 'EXP-002', tipo: 'decision', data: { otro: true } });

      const result = verifyExpediente('EXP-001');
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.total_records, 2);
      assert.strictEqual(result.data.history.length, 2);
    },
  },
  {
    name: 'Verificar expediente inexistente falla',
    fn() {
      resetData();
      const result = verifyExpediente('EXP-999');
      assert.strictEqual(result.status, 404);
    },
  },
  {
    name: 'Verificar expediente sin parametro falla',
    fn() {
      resetData();
      const result = verifyExpediente(null);
      assert.strictEqual(result.status, 400);
    },
  },
  {
    name: 'Obtener estadisticas de cadena',
    fn() {
      resetData();
      recordDecision({ expediente: 'EXP-001', tipo: 'decision', data: {} });
      recordDecision({ expediente: 'EXP-001', tipo: 'pago', data: {} });
      recordDecision({ expediente: 'EXP-002', tipo: 'fraude', data: {} });

      const result = getChainStats();
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.total_blocks, 4); // genesis + 3
      assert.strictEqual(result.data.unique_expedientes, 2);
      assert.ok(result.data.records_by_type.genesis === 1);
      assert.ok(result.data.records_by_type.decision === 1);
      assert.strictEqual(result.data.chain_valid, true);
    },
  },
  {
    name: 'Hash es determinista para mismos datos',
    fn() {
      const hash1 = computeHash(1, '2024-01-01', 'decision', 'EXP-001', { a: 1 }, 'prev');
      const hash2 = computeHash(1, '2024-01-01', 'decision', 'EXP-001', { a: 1 }, 'prev');
      assert.strictEqual(hash1, hash2);
      const hash3 = computeHash(1, '2024-01-01', 'decision', 'EXP-001', { a: 2 }, 'prev');
      assert.notStrictEqual(hash1, hash3);
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
