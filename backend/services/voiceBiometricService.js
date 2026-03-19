// =============================================================================
// Voice Biometric Identification Service
// Simulated voice biometric system for client identification and verification
// =============================================================================

const crypto = require('crypto');

// In-memory store of voice prints
const voicePrints = new Map();

// Match history log
const matchHistory = [];

// ---------------------------------------------------------------------------
// Helper: simulate feature extraction from audio data
// ---------------------------------------------------------------------------
function extractFeatures(audioData) {
  const buffer = Buffer.from(String(audioData));
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');

  // Derive deterministic but varied "features" from the hash
  const segments = [];
  for (let i = 0; i < 64; i += 8) {
    segments.push(parseInt(hash.substring(i, i + 8), 16));
  }

  return {
    pitch: 80 + (segments[0] % 200),                // Hz  (80-280)
    tempo: 60 + (segments[1] % 120),                 // BPM (60-180)
    spectralCentroid: 1000 + (segments[2] % 3000),   // Hz  (1000-4000)
    mfccProfile: Array.from({ length: 13 }, (_, i) => {
      const seed = parseInt(hash.substring((i * 4) % 60, (i * 4) % 60 + 4), 16);
      return parseFloat(((seed % 2000) / 100 - 10).toFixed(2)); // -10 to 10
    }),
  };
}

// ---------------------------------------------------------------------------
// Helper: compute hash for a voice print
// ---------------------------------------------------------------------------
function computeVoiceHash(features) {
  const payload = JSON.stringify(features);
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// ---------------------------------------------------------------------------
// Helper: compare two feature sets, return confidence 0-100
// ---------------------------------------------------------------------------
function compareFeatures(a, b) {
  if (!a || !b) return 0;

  // Pitch similarity (weight 25)
  const pitchDiff = Math.abs(a.pitch - b.pitch);
  const pitchScore = Math.max(0, 25 - (pitchDiff / 200) * 25);

  // Tempo similarity (weight 20)
  const tempoDiff = Math.abs(a.tempo - b.tempo);
  const tempoScore = Math.max(0, 20 - (tempoDiff / 120) * 20);

  // Spectral centroid similarity (weight 25)
  const spectralDiff = Math.abs(a.spectralCentroid - b.spectralCentroid);
  const spectralScore = Math.max(0, 25 - (spectralDiff / 3000) * 25);

  // MFCC profile similarity (weight 30)
  let mfccDistance = 0;
  const len = Math.min(a.mfccProfile.length, b.mfccProfile.length);
  for (let i = 0; i < len; i++) {
    mfccDistance += Math.pow(a.mfccProfile[i] - b.mfccProfile[i], 2);
  }
  mfccDistance = Math.sqrt(mfccDistance);
  const maxMfccDistance = Math.sqrt(len * 400); // max possible distance
  const mfccScore = Math.max(0, 30 - (mfccDistance / maxMfccDistance) * 30);

  return parseFloat((pitchScore + tempoScore + spectralScore + mfccScore).toFixed(2));
}

// ---------------------------------------------------------------------------
// Helper: classify confidence level
// ---------------------------------------------------------------------------
function classifyConfidence(confidence) {
  if (confidence > 85) return 'verified';
  if (confidence >= 60) return 'needs_additional_verification';
  return 'not_matched';
}

// ---------------------------------------------------------------------------
// enrollVoice - creates a voice print from audio data
// ---------------------------------------------------------------------------
function enrollVoice(clienteId, audioData) {
  if (!clienteId || !audioData) {
    throw new Error('clienteId y audioData son requeridos');
  }

  const features = extractFeatures(audioData);
  const hash = computeVoiceHash(features);
  const now = new Date().toISOString();

  const voicePrint = {
    clienteId,
    hash,
    features,
    createdAt: now,
    updatedAt: now,
    matchCount: 0,
  };

  voicePrints.set(clienteId, voicePrint);

  return {
    clienteId,
    enrolled: true,
    hash: hash.substring(0, 16) + '...',
    features: {
      pitch: features.pitch,
      tempo: features.tempo,
      spectralCentroid: features.spectralCentroid,
      mfccCoefficients: features.mfccProfile.length,
    },
    createdAt: now,
  };
}

// ---------------------------------------------------------------------------
// identifyVoice - compares audio against all enrolled voices
// ---------------------------------------------------------------------------
function identifyVoice(audioData) {
  if (!audioData) {
    throw new Error('audioData es requerido');
  }

  const inputFeatures = extractFeatures(audioData);
  let bestMatch = null;
  let bestConfidence = 0;
  const candidates = [];

  for (const [clienteId, print] of voicePrints) {
    const confidence = compareFeatures(inputFeatures, print.features);
    candidates.push({ clienteId, confidence });

    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestMatch = clienteId;
    }
  }

  // Sort candidates by confidence descending
  candidates.sort((a, b) => b.confidence - a.confidence);

  const historyEntry = {
    id: matchHistory.length + 1,
    tipo: 'identification',
    fecha: new Date().toISOString(),
    inputHash: computeVoiceHash(inputFeatures).substring(0, 16),
    resultado: bestMatch,
    confidence: bestConfidence,
    clasificacion: classifyConfidence(bestConfidence),
    candidatos: candidates.slice(0, 3),
  };
  matchHistory.push(historyEntry);

  if (bestConfidence < 60 || !bestMatch) {
    return null;
  }

  // Update match count
  const print = voicePrints.get(bestMatch);
  if (print) {
    print.matchCount += 1;
    print.updatedAt = new Date().toISOString();
  }

  return {
    clienteId: bestMatch,
    confidence: bestConfidence,
    clasificacion: classifyConfidence(bestConfidence),
    matchDetails: {
      topCandidates: candidates.slice(0, 3),
      featuresCompared: ['pitch', 'tempo', 'spectralCentroid', 'mfccProfile'],
      threshold: { verified: 85, additional_verification: 60 },
    },
  };
}

// ---------------------------------------------------------------------------
// verifyVoice - verifies a specific client's voice
// ---------------------------------------------------------------------------
function verifyVoice(clienteId, audioData) {
  if (!clienteId || !audioData) {
    throw new Error('clienteId y audioData son requeridos');
  }

  const print = voicePrints.get(clienteId);
  if (!print) {
    return {
      verified: false,
      confidence: 0,
      error: 'No se encontro huella de voz para el cliente',
      clasificacion: 'not_matched',
    };
  }

  const inputFeatures = extractFeatures(audioData);
  const confidence = compareFeatures(inputFeatures, print.features);
  const verified = confidence > 85;

  // Update match count on successful verification
  if (verified) {
    print.matchCount += 1;
    print.updatedAt = new Date().toISOString();
  }

  const historyEntry = {
    id: matchHistory.length + 1,
    tipo: 'verification',
    clienteId,
    fecha: new Date().toISOString(),
    confidence,
    verified,
    clasificacion: classifyConfidence(confidence),
  };
  matchHistory.push(historyEntry);

  return {
    verified,
    confidence,
    clasificacion: classifyConfidence(confidence),
    detalles: {
      pitchMatch: Math.abs(inputFeatures.pitch - print.features.pitch) < 40,
      tempoMatch: Math.abs(inputFeatures.tempo - print.features.tempo) < 25,
      spectralMatch: Math.abs(inputFeatures.spectralCentroid - print.features.spectralCentroid) < 600,
      mfccCorrelation: confidence > 60 ? 'alta' : confidence > 40 ? 'media' : 'baja',
    },
  };
}

// ---------------------------------------------------------------------------
// getEnrolledClients - list all enrolled voice prints
// ---------------------------------------------------------------------------
function getEnrolledClients() {
  const clients = [];
  for (const [clienteId, print] of voicePrints) {
    clients.push({
      clienteId,
      hashPreview: print.hash.substring(0, 16) + '...',
      features: {
        pitch: print.features.pitch,
        tempo: print.features.tempo,
        spectralCentroid: print.features.spectralCentroid,
      },
      createdAt: print.createdAt,
      updatedAt: print.updatedAt,
      matchCount: print.matchCount,
    });
  }
  return clients;
}

// ---------------------------------------------------------------------------
// deleteVoicePrint
// ---------------------------------------------------------------------------
function deleteVoicePrint(clienteId) {
  if (!voicePrints.has(clienteId)) {
    return { deleted: false, error: 'Huella de voz no encontrada' };
  }
  voicePrints.delete(clienteId);
  return { deleted: true, clienteId };
}

// ---------------------------------------------------------------------------
// getMatchHistory
// ---------------------------------------------------------------------------
function getMatchHistory(clienteId) {
  if (clienteId) {
    return matchHistory.filter(
      (entry) => entry.clienteId === clienteId || entry.resultado === clienteId
    );
  }
  return [...matchHistory];
}

// ---------------------------------------------------------------------------
// Pre-enrolled demo voices
// ---------------------------------------------------------------------------
function initDemoVoices() {
  const demoClients = [
    { id: 'CLI-001', name: 'Maria Garcia', audio: 'maria-garcia-voice-sample-enrollment-2025' },
    { id: 'CLI-002', name: 'Carlos Rodriguez', audio: 'carlos-rodriguez-voice-sample-enrollment-2025' },
    { id: 'CLI-003', name: 'Ana Martinez', audio: 'ana-martinez-voice-sample-enrollment-2025' },
    { id: 'CLI-004', name: 'Juan Lopez', audio: 'juan-lopez-voice-sample-enrollment-2025' },
    { id: 'CLI-005', name: 'Laura Fernandez', audio: 'laura-fernandez-voice-sample-enrollment-2025' },
  ];

  for (const client of demoClients) {
    enrollVoice(client.id, client.audio);
    // Reset timestamps for demo consistency
    const print = voicePrints.get(client.id);
    if (print) {
      print.createdAt = '2025-06-01T10:00:00.000Z';
      print.updatedAt = '2025-06-01T10:00:00.000Z';
      print.matchCount = Math.floor(Math.random() * 20) + 1;
    }
  }
}

// Initialize demo data on module load
initDemoVoices();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  enrollVoice,
  identifyVoice,
  verifyVoice,
  getEnrolledClients,
  deleteVoicePrint,
  getMatchHistory,
  extractFeatures,
  compareFeatures,
  classifyConfidence,
};
