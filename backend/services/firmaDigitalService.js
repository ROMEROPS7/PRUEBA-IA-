// ============================================================
// Firma Digital Service - SiniestrosAI
// Gestion de firmas digitales, OTP y documentos legales
// ============================================================

let docCounter = 10;
let solicitudCounter = 10;

const documentos = [
  {
    id: 'DOC-001',
    tipo: 'peritaje',
    titulo: 'Informe Pericial - Siniestro Auto SIN-2026-0312',
    contenido_resumen: 'Informe de valoracion de danos en vehiculo Seat Leon tras colision frontal. Danos en parachoques delantero, capo y faro izquierdo.',
    cliente_id: 'CLI-001',
    siniestro_id: 'SIN-2026-0312',
    estado: 'firmado',
    firma_data: { tipo: 'digital', certificado: 'FNMT-RCM', nivel: 'avanzada' },
    otp_code: null,
    timestamp_firma: '2026-03-15T10:23:45Z',
    hash_documento: 'sha256:a3f2b8c91d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    metadatos_legales: { ley_aplicable: 'Ley 6/2020 de servicios electronicos de confianza', prestador: 'ViDSigner', sello_tiempo: true }
  },
  {
    id: 'DOC-002',
    tipo: 'conformidad',
    titulo: 'Conformidad de Indemnizacion - Maria Lopez Garcia',
    contenido_resumen: 'Documento de aceptacion de indemnizacion por importe de 3.200 EUR por siniestro de hogar (rotura tuberia).',
    cliente_id: 'CLI-002',
    siniestro_id: 'SIN-2026-0298',
    estado: 'firmado',
    firma_data: { tipo: 'digital', certificado: 'DNIe', nivel: 'cualificada' },
    otp_code: null,
    timestamp_firma: '2026-03-14T16:45:12Z',
    hash_documento: 'sha256:b4c3d9e02f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
    metadatos_legales: { ley_aplicable: 'Ley 6/2020 de servicios electronicos de confianza', prestador: 'ViDSigner', sello_tiempo: true }
  },
  {
    id: 'DOC-003',
    tipo: 'poliza',
    titulo: 'Contrato Poliza Auto Todo Riesgo - POL-AUTO-8832',
    contenido_resumen: 'Contrato de seguro de automovil todo riesgo con franquicia de 300 EUR. Vehiculo: Volkswagen Golf 2024.',
    cliente_id: 'CLI-003',
    siniestro_id: null,
    estado: 'firmado',
    firma_data: { tipo: 'biometrica', dispositivo: 'tablet-oficina-04', nivel: 'avanzada' },
    otp_code: null,
    timestamp_firma: '2026-02-20T11:30:00Z',
    hash_documento: 'sha256:c5d4e0f13a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    metadatos_legales: { ley_aplicable: 'Ley 50/1980 de Contrato de Seguro', prestador: 'Signaturit', sello_tiempo: true }
  },
  {
    id: 'DOC-004',
    tipo: 'cesion_derechos',
    titulo: 'Cesion de Derechos - Reparacion Taller Asociado',
    contenido_resumen: 'Cesion de derechos de cobro al taller autorizado AutoRep Madrid para reparacion directa del vehiculo.',
    cliente_id: 'CLI-001',
    siniestro_id: 'SIN-2026-0312',
    estado: 'firmado',
    firma_data: { tipo: 'digital', certificado: 'FNMT-RCM', nivel: 'avanzada' },
    otp_code: null,
    timestamp_firma: '2026-03-16T09:12:33Z',
    hash_documento: 'sha256:d6e5f1a24b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
    metadatos_legales: { ley_aplicable: 'Ley 6/2020 de servicios electronicos de confianza', prestador: 'ViDSigner', sello_tiempo: true }
  },
  {
    id: 'DOC-005',
    tipo: 'parte_amistoso',
    titulo: 'Declaracion Amistosa de Accidente - DAA-2026-0087',
    contenido_resumen: 'Parte amistoso de accidente entre dos vehiculos en Calle Gran Via 45, Madrid. Sin heridos. Danos materiales leves.',
    cliente_id: 'CLI-004',
    siniestro_id: 'SIN-2026-0340',
    estado: 'firmado',
    firma_data: { tipo: 'digital', certificado: 'DNIe', nivel: 'cualificada' },
    otp_code: null,
    timestamp_firma: '2026-03-17T14:22:10Z',
    hash_documento: 'sha256:e7f6a2b35c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
    metadatos_legales: { ley_aplicable: 'RD 1507/2008 Reglamento del Seguro Obligatorio', prestador: 'Signaturit', sello_tiempo: true }
  },
  {
    id: 'DOC-006',
    tipo: 'peritaje',
    titulo: 'Informe Pericial - Siniestro Hogar SIN-2026-0355',
    contenido_resumen: 'Valoracion de danos por inundacion en vivienda. Afectado suelo laminado, mobiliario salon y instalacion electrica.',
    cliente_id: 'CLI-005',
    siniestro_id: 'SIN-2026-0355',
    estado: 'firmado',
    firma_data: { tipo: 'digital', certificado: 'FNMT-RCM', nivel: 'avanzada' },
    otp_code: null,
    timestamp_firma: '2026-03-18T11:05:28Z',
    hash_documento: 'sha256:f8a7b3c46d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
    metadatos_legales: { ley_aplicable: 'Ley 6/2020 de servicios electronicos de confianza', prestador: 'ViDSigner', sello_tiempo: true }
  },
  {
    id: 'DOC-007',
    tipo: 'conformidad',
    titulo: 'Conformidad de Reparacion - Pedro Martinez Navarro',
    contenido_resumen: 'Aceptacion de presupuesto de reparacion por 1.890 EUR en taller asociado TallerPro Valencia.',
    cliente_id: 'CLI-006',
    siniestro_id: 'SIN-2026-0361',
    estado: 'pendiente',
    firma_data: null,
    otp_code: null,
    timestamp_firma: null,
    hash_documento: 'sha256:a9b8c4d57e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
    metadatos_legales: { ley_aplicable: 'Ley 6/2020 de servicios electronicos de confianza', prestador: 'ViDSigner', sello_tiempo: false }
  },
  {
    id: 'DOC-008',
    tipo: 'poliza',
    titulo: 'Renovacion Poliza Hogar - POL-HOGAR-5567',
    contenido_resumen: 'Renovacion anual de poliza de hogar con incremento de capital asegurado a 250.000 EUR. Continente y contenido.',
    cliente_id: 'CLI-007',
    siniestro_id: null,
    estado: 'enviado',
    firma_data: null,
    otp_code: '847291',
    timestamp_firma: null,
    hash_documento: 'sha256:b0c9d5e68f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7',
    metadatos_legales: { ley_aplicable: 'Ley 50/1980 de Contrato de Seguro', prestador: 'Signaturit', sello_tiempo: false }
  },
  {
    id: 'DOC-009',
    tipo: 'rgpd',
    titulo: 'Consentimiento Tratamiento Datos - RGPD',
    contenido_resumen: 'Consentimiento informado para el tratamiento de datos personales segun RGPD y LOPDGDD.',
    cliente_id: 'CLI-008',
    siniestro_id: null,
    estado: 'pendiente',
    firma_data: null,
    otp_code: null,
    timestamp_firma: null,
    hash_documento: 'sha256:c1d0e6f79a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
    metadatos_legales: { ley_aplicable: 'Reglamento (UE) 2016/679 - RGPD', prestador: 'ViDSigner', sello_tiempo: false }
  },
  {
    id: 'DOC-010',
    tipo: 'cesion_derechos',
    titulo: 'Cesion de Derechos - Clinica Dental Asociada',
    contenido_resumen: 'Cesion de derechos de cobro a Clinica Dental Madrid Centro para tratamiento dental cubierto por poliza de salud.',
    cliente_id: 'CLI-009',
    siniestro_id: 'SIN-2026-0378',
    estado: 'pendiente',
    firma_data: null,
    otp_code: null,
    timestamp_firma: null,
    hash_documento: 'sha256:d2e1f7a80b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9',
    metadatos_legales: { ley_aplicable: 'Ley 6/2020 de servicios electronicos de confianza', prestador: 'Signaturit', sello_tiempo: false }
  },
  {
    id: 'DOC-011',
    tipo: 'peritaje',
    titulo: 'Informe Pericial Complementario - SIN-2026-0340',
    contenido_resumen: 'Informe complementario con fotografias y valoracion detallada de danos ocultos detectados durante la reparacion.',
    cliente_id: 'CLI-004',
    siniestro_id: 'SIN-2026-0340',
    estado: 'enviado',
    firma_data: null,
    otp_code: '563810',
    timestamp_firma: null,
    hash_documento: 'sha256:e3f2a8b91c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
    metadatos_legales: { ley_aplicable: 'Ley 6/2020 de servicios electronicos de confianza', prestador: 'ViDSigner', sello_tiempo: false }
  }
];

const solicitudesFirma = [];

function generarOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generarHash() {
  const chars = '0123456789abcdef';
  let hash = 'sha256:';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function solicitarFirma(documentoId, clienteId) {
  const doc = documentos.find(d => d.id === documentoId);
  if (!doc) {
    return { error: true, mensaje: `Documento ${documentoId} no encontrado` };
  }

  if (doc.estado === 'firmado' || doc.estado === 'verificado') {
    return { error: true, mensaje: `El documento ${documentoId} ya esta firmado` };
  }

  solicitudCounter++;
  const otp = generarOTP();
  const solicitudId = `SOL-${String(solicitudCounter).padStart(3, '0')}`;

  doc.estado = 'enviado';
  doc.otp_code = otp;

  const solicitud = {
    id: solicitudId,
    documento_id: documentoId,
    cliente_id: clienteId,
    otp_code: otp,
    link_firma: `https://firma.siniestrosai.es/firmar/${solicitudId}?token=${Buffer.from(`${documentoId}:${clienteId}`).toString('base64')}`,
    estado: 'pendiente',
    creado: new Date().toISOString(),
    expira: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    canal_envio: 'sms_email',
    intentos_otp: 0
  };
  solicitudesFirma.push(solicitud);

  return {
    solicitud_id: solicitudId,
    link_firma: solicitud.link_firma,
    otp_enviado: true,
    canal: 'SMS y Email',
    expiracion: solicitud.expira,
    documento_titulo: doc.titulo,
    mensaje: `Solicitud de firma enviada. OTP enviado al movil y email del cliente ${clienteId}.`
  };
}

function verificarFirma(firmaId) {
  // firmaId puede ser el ID del documento
  const doc = documentos.find(d => d.id === firmaId);
  if (!doc) {
    return { error: true, mensaje: `Documento ${firmaId} no encontrado` };
  }

  if (doc.estado !== 'firmado' && doc.estado !== 'verificado') {
    return {
      valido: false,
      mensaje: 'El documento no ha sido firmado todavia',
      estado: doc.estado
    };
  }

  doc.estado = 'verificado';

  return {
    valido: true,
    firmante: doc.cliente_id,
    fecha: doc.timestamp_firma,
    hash: doc.hash_documento,
    tipo_firma: doc.firma_data?.tipo || 'digital',
    nivel_firma: doc.firma_data?.nivel || 'avanzada',
    certificado: doc.firma_data?.certificado || 'FNMT-RCM',
    sello_tiempo: doc.metadatos_legales?.sello_tiempo || false,
    prestador_confianza: doc.metadatos_legales?.prestador || 'ViDSigner',
    ley_aplicable: doc.metadatos_legales?.ley_aplicable || 'Ley 6/2020',
    integridad: 'verificada',
    cadena_custodia: 'completa'
  };
}

function getDocumentos(clienteId) {
  if (!clienteId) {
    return documentos.map(d => ({
      id: d.id,
      tipo: d.tipo,
      titulo: d.titulo,
      contenido_resumen: d.contenido_resumen,
      cliente_id: d.cliente_id,
      siniestro_id: d.siniestro_id,
      estado: d.estado,
      timestamp_firma: d.timestamp_firma,
      hash_documento: d.hash_documento
    }));
  }

  const docs = documentos.filter(d => d.cliente_id === clienteId);
  return {
    cliente_id: clienteId,
    total_documentos: docs.length,
    firmados: docs.filter(d => d.estado === 'firmado' || d.estado === 'verificado').length,
    pendientes: docs.filter(d => d.estado === 'pendiente').length,
    enviados: docs.filter(d => d.estado === 'enviado').length,
    documentos: docs.map(d => ({
      id: d.id,
      tipo: d.tipo,
      titulo: d.titulo,
      contenido_resumen: d.contenido_resumen,
      siniestro_id: d.siniestro_id,
      estado: d.estado,
      timestamp_firma: d.timestamp_firma
    }))
  };
}

function firmarDocumento(solicitudId, firmaData, otpCode) {
  const solicitud = solicitudesFirma.find(s => s.id === solicitudId);

  // Si no hay solicitud en memoria, buscar documento directamente por OTP
  let doc;
  if (solicitud) {
    if (solicitud.estado === 'completada') {
      return { error: true, mensaje: 'Esta solicitud ya fue completada' };
    }
    if (new Date(solicitud.expira) < new Date()) {
      return { error: true, mensaje: 'La solicitud de firma ha expirado' };
    }
    doc = documentos.find(d => d.id === solicitud.documento_id);
    solicitud.intentos_otp++;

    if (solicitud.otp_code !== otpCode) {
      if (solicitud.intentos_otp >= 3) {
        solicitud.estado = 'bloqueada';
        return { error: true, mensaje: 'Solicitud bloqueada por exceso de intentos OTP' };
      }
      return { error: true, mensaje: 'Codigo OTP incorrecto', intentos_restantes: 3 - solicitud.intentos_otp };
    }
  } else {
    // Buscar por OTP en documentos
    doc = documentos.find(d => d.otp_code === otpCode && d.estado === 'enviado');
    if (!doc) {
      return { error: true, mensaje: 'Solicitud no encontrada o codigo OTP incorrecto' };
    }
  }

  if (!doc) {
    return { error: true, mensaje: 'Documento asociado no encontrado' };
  }

  const now = new Date().toISOString();
  doc.estado = 'firmado';
  doc.firma_data = {
    tipo: firmaData?.tipo || 'digital',
    certificado: firmaData?.certificado || 'FNMT-RCM',
    nivel: firmaData?.nivel || 'avanzada',
    ip_firmante: firmaData?.ip || '83.42.128.45',
    user_agent: firmaData?.user_agent || 'Mozilla/5.0'
  };
  doc.otp_code = null;
  doc.timestamp_firma = now;
  doc.hash_documento = generarHash();
  doc.metadatos_legales.sello_tiempo = true;

  if (solicitud) {
    solicitud.estado = 'completada';
  }

  return {
    firmado: true,
    documento_id: doc.id,
    titulo: doc.titulo,
    timestamp_firma: now,
    hash: doc.hash_documento,
    tipo_firma: doc.firma_data.tipo,
    nivel_firma: doc.firma_data.nivel,
    certificado: doc.firma_data.certificado,
    sello_tiempo: true,
    prestador: doc.metadatos_legales.prestador,
    mensaje: `Documento "${doc.titulo}" firmado correctamente con firma ${doc.firma_data.nivel}.`
  };
}

function getEstadisticas() {
  const total = documentos.length;
  const firmados = documentos.filter(d => d.estado === 'firmado' || d.estado === 'verificado').length;
  const pendientes = documentos.filter(d => d.estado === 'pendiente').length;
  const enviados = documentos.filter(d => d.estado === 'enviado').length;

  return {
    total_documentos: total,
    total_firmados: firmados,
    pendientes,
    enviados,
    tasa_firma_digital: total > 0 ? Math.round((firmados / total) * 100) : 0,
    ahorro_vs_papel: {
      documentos_digitales: firmados,
      coste_papel_por_documento: 4.50,
      coste_digital_por_documento: 0.35,
      ahorro_por_documento: 4.15,
      ahorro_total: parseFloat((firmados * 4.15).toFixed(2)),
      tiempo_medio_firma_digital: '2.3 minutos',
      tiempo_medio_firma_papel: '3.2 dias',
      reduccion_tiempo: '99.9%',
      huella_carbono_evitada_kg: parseFloat((firmados * 0.08).toFixed(2))
    },
    por_tipo: {
      peritaje: documentos.filter(d => d.tipo === 'peritaje').length,
      conformidad: documentos.filter(d => d.tipo === 'conformidad').length,
      poliza: documentos.filter(d => d.tipo === 'poliza').length,
      cesion_derechos: documentos.filter(d => d.tipo === 'cesion_derechos').length,
      parte_amistoso: documentos.filter(d => d.tipo === 'parte_amistoso').length,
      rgpd: documentos.filter(d => d.tipo === 'rgpd').length
    },
    nivel_firma: {
      cualificada: documentos.filter(d => d.firma_data?.nivel === 'cualificada').length,
      avanzada: documentos.filter(d => d.firma_data?.nivel === 'avanzada').length,
      biometrica: documentos.filter(d => d.firma_data?.tipo === 'biometrica').length
    }
  };
}

module.exports = {
  solicitarFirma,
  verificarFirma,
  getDocumentos,
  firmarDocumento,
  getEstadisticas
};
