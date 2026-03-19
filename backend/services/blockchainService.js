// =============================================================================
// Blockchain Audit Trail Service
// Immutable, hash-linked audit chain for insurance operations
// =============================================================================

const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Block structure & hashing
// ---------------------------------------------------------------------------
function calculateHash(index, timestamp, data, previousHash, nonce) {
  const payload = `${index}${timestamp}${JSON.stringify(data)}${previousHash}${nonce}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// ---------------------------------------------------------------------------
// AuditChain class
// ---------------------------------------------------------------------------
class AuditChain {
  constructor() {
    this.chain = [];
    this._createGenesisBlock();
    this._populateDemoEntries();
  }

  // -------------------------------------------------------------------------
  // Genesis block
  // -------------------------------------------------------------------------
  _createGenesisBlock() {
    const timestamp = '2025-01-01T00:00:00.000Z';
    const data = {
      type: 'genesis',
      details: 'Bloque genesis - Inicio de la cadena de auditoria de siniestros',
      userId: 'SYSTEM',
    };
    const hash = calculateHash(0, timestamp, data, '0', 0);

    this.chain.push({
      index: 0,
      timestamp,
      data,
      previousHash: '0',
      hash,
      nonce: 0,
    });
  }

  // -------------------------------------------------------------------------
  // createBlock - low level
  // -------------------------------------------------------------------------
  createBlock(data) {
    const previousBlock = this.chain[this.chain.length - 1];
    const index = previousBlock.index + 1;
    const timestamp = new Date().toISOString();
    const previousHash = previousBlock.hash;

    // Simple proof-of-work: find nonce that produces hash starting with '00'
    let nonce = 0;
    let hash = '';
    do {
      hash = calculateHash(index, timestamp, data, previousHash, nonce);
      nonce++;
    } while (!hash.startsWith('00'));
    nonce--; // last increment was after finding the valid hash

    const block = { index, timestamp, data, previousHash, hash, nonce };
    this.chain.push(block);
    return block;
  }

  // -------------------------------------------------------------------------
  // recordDecision - main interface for audit events
  // -------------------------------------------------------------------------
  recordDecision(type, details, userId) {
    const validTypes = [
      'aprobacion_siniestro',
      'rechazo_siniestro',
      'asignacion_perito',
      'deteccion_fraude',
      'pago_indemnizacion',
      'cambio_estado',
    ];

    if (!validTypes.includes(type)) {
      throw new Error(
        `Tipo de decision invalido: "${type}". Tipos validos: ${validTypes.join(', ')}`
      );
    }

    if (!details || !userId) {
      throw new Error('details y userId son requeridos');
    }

    const data = {
      type,
      details: typeof details === 'string' ? { descripcion: details } : details,
      userId,
      recordedAt: new Date().toISOString(),
    };

    return this.createBlock(data);
  }

  // -------------------------------------------------------------------------
  // verifyChain - validate full chain integrity
  // -------------------------------------------------------------------------
  verifyChain() {
    const errors = [];

    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // Verify previousHash link
      if (current.previousHash !== previous.hash) {
        errors.push({
          blockIndex: i,
          error: 'previousHash no coincide con el hash del bloque anterior',
          expected: previous.hash,
          actual: current.previousHash,
        });
      }

      // Verify block's own hash
      const recalculated = calculateHash(
        current.index,
        current.timestamp,
        current.data,
        current.previousHash,
        current.nonce
      );
      if (current.hash !== recalculated) {
        errors.push({
          blockIndex: i,
          error: 'El hash del bloque no coincide con el contenido',
          expected: recalculated,
          actual: current.hash,
        });
      }
    }

    return {
      valid: errors.length === 0,
      totalBlocks: this.chain.length,
      errorsFound: errors.length,
      errors,
      verifiedAt: new Date().toISOString(),
    };
  }

  // -------------------------------------------------------------------------
  // verifyExpediente - all audit entries for an expediente
  // -------------------------------------------------------------------------
  verifyExpediente(expedienteId) {
    if (!expedienteId) {
      throw new Error('expedienteId es requerido');
    }

    const entries = this.chain.filter((block) => {
      if (!block.data || !block.data.details) return false;
      const details = block.data.details;
      return (
        details.expedienteId === expedienteId ||
        details.siniestroId === expedienteId
      );
    });

    // Verify integrity of the sub-chain
    const chainVerification = this.verifyChain();

    return {
      expedienteId,
      totalEntries: entries.length,
      entries: entries.map((block) => ({
        index: block.index,
        timestamp: block.timestamp,
        type: block.data.type,
        details: block.data.details,
        userId: block.data.userId,
        hash: block.hash,
      })),
      integrityStatus: chainVerification.valid ? 'integra' : 'comprometida',
      chainValid: chainVerification.valid,
      verifiedAt: new Date().toISOString(),
    };
  }

  // -------------------------------------------------------------------------
  // getChain - paginated
  // -------------------------------------------------------------------------
  getChain(limit = 10, offset = 0) {
    const total = this.chain.length;
    const paginated = this.chain.slice(offset, offset + limit);

    return {
      total,
      limit,
      offset,
      blocks: paginated,
      hasMore: offset + limit < total,
    };
  }

  // -------------------------------------------------------------------------
  // getChainStats
  // -------------------------------------------------------------------------
  getChainStats() {
    const verification = this.verifyChain();
    const firstBlock = this.chain[0];
    const lastBlock = this.chain[this.chain.length - 1];

    // Count by type
    const typeCounts = {};
    for (const block of this.chain) {
      const type = block.data?.type || 'unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }

    return {
      totalBlocks: this.chain.length,
      firstBlockDate: firstBlock.timestamp,
      lastBlockDate: lastBlock.timestamp,
      integrityStatus: verification.valid ? 'integra' : 'comprometida',
      chainValid: verification.valid,
      blocksByType: typeCounts,
      averageNonce:
        this.chain.length > 0
          ? parseFloat(
              (
                this.chain.reduce((sum, b) => sum + b.nonce, 0) / this.chain.length
              ).toFixed(2)
            )
          : 0,
    };
  }

  // -------------------------------------------------------------------------
  // exportChain - export full audit trail as JSON
  // -------------------------------------------------------------------------
  exportChain(expedienteId) {
    let blocks;
    if (expedienteId) {
      blocks = this.chain.filter((block) => {
        const details = block.data?.details;
        return (
          details &&
          (details.expedienteId === expedienteId || details.siniestroId === expedienteId)
        );
      });
    } else {
      blocks = [...this.chain];
    }

    return {
      exportDate: new Date().toISOString(),
      expedienteId: expedienteId || 'ALL',
      totalBlocks: blocks.length,
      chainIntegrity: this.verifyChain().valid ? 'integra' : 'comprometida',
      blocks: blocks.map((b) => ({
        index: b.index,
        timestamp: b.timestamp,
        type: b.data?.type,
        details: b.data?.details,
        userId: b.data?.userId,
        previousHash: b.previousHash,
        hash: b.hash,
        nonce: b.nonce,
      })),
    };
  }

  // -------------------------------------------------------------------------
  // searchChain - search by filters
  // -------------------------------------------------------------------------
  searchChain(filters = {}) {
    let results = this.chain.slice(1); // skip genesis

    if (filters.type) {
      results = results.filter((b) => b.data?.type === filters.type);
    }

    if (filters.userId) {
      results = results.filter((b) => b.data?.userId === filters.userId);
    }

    if (filters.expedienteId) {
      results = results.filter((b) => {
        const details = b.data?.details;
        return (
          details &&
          (details.expedienteId === filters.expedienteId ||
            details.siniestroId === filters.expedienteId)
        );
      });
    }

    if (filters.fechaDesde) {
      const desde = new Date(filters.fechaDesde);
      results = results.filter((b) => new Date(b.timestamp) >= desde);
    }

    if (filters.fechaHasta) {
      const hasta = new Date(filters.fechaHasta);
      results = results.filter((b) => new Date(b.timestamp) <= hasta);
    }

    return {
      filters,
      totalResults: results.length,
      results: results.map((b) => ({
        index: b.index,
        timestamp: b.timestamp,
        type: b.data?.type,
        details: b.data?.details,
        userId: b.data?.userId,
        hash: b.hash,
      })),
    };
  }

  // -------------------------------------------------------------------------
  // Pre-populate demo data
  // -------------------------------------------------------------------------
  _populateDemoEntries() {
    const demoEntries = [
      {
        type: 'cambio_estado',
        details: {
          expedienteId: 'EXP-2025-001',
          siniestroId: 'SIN-001',
          estadoAnterior: 'nuevo',
          estadoNuevo: 'en_proceso',
          descripcion: 'Siniestro registrado y abierto para investigacion',
        },
        userId: 'USR-ADMIN-01',
        timestamp: '2025-06-01T09:00:00.000Z',
      },
      {
        type: 'asignacion_perito',
        details: {
          expedienteId: 'EXP-2025-001',
          siniestroId: 'SIN-001',
          peritoId: 'PER-001',
          peritoNombre: 'Roberto Sanchez',
          descripcion: 'Perito asignado para evaluacion de danos en vehiculo',
        },
        userId: 'USR-ADMIN-01',
        timestamp: '2025-06-01T10:30:00.000Z',
      },
      {
        type: 'aprobacion_siniestro',
        details: {
          expedienteId: 'EXP-2025-001',
          siniestroId: 'SIN-001',
          montoAprobado: 15000,
          moneda: 'EUR',
          descripcion: 'Siniestro aprobado tras evaluacion del perito',
        },
        userId: 'USR-SUPER-01',
        timestamp: '2025-06-03T14:00:00.000Z',
      },
      {
        type: 'pago_indemnizacion',
        details: {
          expedienteId: 'EXP-2025-001',
          siniestroId: 'SIN-001',
          monto: 15000,
          moneda: 'EUR',
          metodoPago: 'transferencia_bancaria',
          descripcion: 'Pago de indemnizacion procesado',
        },
        userId: 'USR-FINANCE-01',
        timestamp: '2025-06-05T11:00:00.000Z',
      },
      {
        type: 'cambio_estado',
        details: {
          expedienteId: 'EXP-2025-002',
          siniestroId: 'SIN-002',
          estadoAnterior: 'nuevo',
          estadoNuevo: 'en_investigacion',
          descripcion: 'Siniestro de incendio abierto para investigacion',
        },
        userId: 'USR-ADMIN-01',
        timestamp: '2025-06-10T08:30:00.000Z',
      },
      {
        type: 'deteccion_fraude',
        details: {
          expedienteId: 'EXP-2025-002',
          siniestroId: 'SIN-002',
          nivelRiesgo: 'alto',
          indicadores: ['inconsistencia_temporal', 'poliza_reciente', 'monto_elevado'],
          descripcion: 'Sistema IA detecto posible fraude en reclamacion de incendio',
        },
        userId: 'SYSTEM-AI',
        timestamp: '2025-06-10T09:15:00.000Z',
      },
      {
        type: 'asignacion_perito',
        details: {
          expedienteId: 'EXP-2025-002',
          siniestroId: 'SIN-002',
          peritoId: 'PER-002',
          peritoNombre: 'Elena Vidal',
          descripcion: 'Perito especialista en fraude asignado',
        },
        userId: 'USR-ADMIN-02',
        timestamp: '2025-06-11T10:00:00.000Z',
      },
      {
        type: 'rechazo_siniestro',
        details: {
          expedienteId: 'EXP-2025-002',
          siniestroId: 'SIN-002',
          motivo: 'fraude_confirmado',
          descripcion: 'Siniestro rechazado por fraude confirmado tras investigacion',
        },
        userId: 'USR-SUPER-01',
        timestamp: '2025-06-15T16:00:00.000Z',
      },
      {
        type: 'cambio_estado',
        details: {
          expedienteId: 'EXP-2025-003',
          siniestroId: 'SIN-003',
          estadoAnterior: 'nuevo',
          estadoNuevo: 'en_proceso',
          descripcion: 'Siniestro por danos de agua registrado',
        },
        userId: 'USR-ADMIN-01',
        timestamp: '2025-06-20T07:45:00.000Z',
      },
      {
        type: 'aprobacion_siniestro',
        details: {
          expedienteId: 'EXP-2025-003',
          siniestroId: 'SIN-003',
          montoAprobado: 8500,
          moneda: 'EUR',
          descripcion: 'Aprobacion rapida por monto menor al umbral automatico',
        },
        userId: 'SYSTEM-AI',
        timestamp: '2025-06-20T08:00:00.000Z',
      },
      {
        type: 'pago_indemnizacion',
        details: {
          expedienteId: 'EXP-2025-003',
          siniestroId: 'SIN-003',
          monto: 8500,
          moneda: 'EUR',
          metodoPago: 'transferencia_bancaria',
          descripcion: 'Pago express procesado',
        },
        userId: 'USR-FINANCE-01',
        timestamp: '2025-06-21T09:30:00.000Z',
      },
      {
        type: 'cambio_estado',
        details: {
          expedienteId: 'EXP-2025-004',
          siniestroId: 'SIN-004',
          estadoAnterior: 'nuevo',
          estadoNuevo: 'en_proceso',
          descripcion: 'Accidente de trafico multiple registrado',
        },
        userId: 'USR-ADMIN-02',
        timestamp: '2025-07-01T12:00:00.000Z',
      },
    ];

    for (const entry of demoEntries) {
      const data = {
        type: entry.type,
        details: entry.details,
        userId: entry.userId,
        recordedAt: entry.timestamp,
      };

      const previousBlock = this.chain[this.chain.length - 1];
      const index = previousBlock.index + 1;
      const timestamp = entry.timestamp;
      const previousHash = previousBlock.hash;

      let nonce = 0;
      let hash = '';
      do {
        hash = calculateHash(index, timestamp, data, previousHash, nonce);
        nonce++;
      } while (!hash.startsWith('00'));
      nonce--;

      this.chain.push({ index, timestamp, data, previousHash, hash, nonce });
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton instance
// ---------------------------------------------------------------------------
const auditChain = new AuditChain();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  recordDecision: (type, details, userId) => auditChain.recordDecision(type, details, userId),
  verifyChain: () => auditChain.verifyChain(),
  verifyExpediente: (expedienteId) => auditChain.verifyExpediente(expedienteId),
  getChain: (limit, offset) => auditChain.getChain(limit, offset),
  getChainStats: () => auditChain.getChainStats(),
  exportChain: (expedienteId) => auditChain.exportChain(expedienteId),
  searchChain: (filters) => auditChain.searchChain(filters),
  createBlock: (data) => auditChain.createBlock(data),
  AuditChain,
};
