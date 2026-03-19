const { v4: uuidv4 } = require('uuid');

// ============================================================================
// BASE DE DATOS EN MEMORIA - CASOS DE SUBROGACIÓN
// ============================================================================

const casosSubrogacion = [
  // 5 COBRADOS
  {
    id: 'sub-001', siniestroId: 'SIN-2025-0412', expediente: 'EXP-SUB-001',
    cliente: 'María López Fernández', poliza: 'POL-AUTO-8821',
    aseguradora_contraria: 'Mapfre', tercero_nombre: 'Carlos Ruiz Gómez',
    tercero_poliza: 'MAP-2024-33219',
    importe_reclamado: 4850.00, importe_recuperado: 4850.00,
    estado: 'cobrado', fecha_inicio: '2025-10-15', fecha_cobro: '2026-01-20',
    descripcion: 'Colisión trasera en semáforo. Culpabilidad 100% tercero.',
    tipo_siniestro: 'colision_trasera',
    documentacion: ['atestado_policial', 'informe_perito', 'factura_reparacion', 'parte_amistoso'],
    historial_negociacion: [
      { fecha: '2025-10-20', accion: 'Reclamación enviada a Mapfre', resultado: 'Acuse de recibo' },
      { fecha: '2025-11-05', accion: 'Mapfre solicita documentación adicional', resultado: 'Enviada factura taller' },
      { fecha: '2025-12-10', accion: 'Mapfre acepta responsabilidad', resultado: 'Oferta por importe total' },
      { fecha: '2026-01-20', accion: 'Cobro recibido', resultado: 'Transferencia 4.850,00€' }
    ]
  },
  {
    id: 'sub-002', siniestroId: 'SIN-2025-0523', expediente: 'EXP-SUB-002',
    cliente: 'Antonio García Martín', poliza: 'POL-AUTO-7734',
    aseguradora_contraria: 'Allianz', tercero_nombre: 'Laura Sánchez Díaz',
    tercero_poliza: 'ALZ-2025-11002',
    importe_reclamado: 3200.00, importe_recuperado: 2800.00,
    estado: 'cobrado', fecha_inicio: '2025-11-02', fecha_cobro: '2026-02-15',
    descripcion: 'Invasión de carril contrario. Culpabilidad 80% tercero, 20% asegurado.',
    tipo_siniestro: 'colision_frontal',
    documentacion: ['atestado_policial', 'informe_perito', 'factura_reparacion'],
    historial_negociacion: [
      { fecha: '2025-11-10', accion: 'Reclamación enviada a Allianz', resultado: 'Acuse de recibo' },
      { fecha: '2025-12-01', accion: 'Allianz rechaza responsabilidad total', resultado: 'Contraoferta 50%' },
      { fecha: '2025-12-20', accion: 'Negociación telefónica', resultado: 'Acuerdo en 87.5% del importe' },
      { fecha: '2026-02-15', accion: 'Cobro recibido', resultado: 'Transferencia 2.800,00€' }
    ]
  },
  {
    id: 'sub-003', siniestroId: 'SIN-2025-0298', expediente: 'EXP-SUB-003',
    cliente: 'Pilar Hernández Ruiz', poliza: 'POL-AUTO-5567',
    aseguradora_contraria: 'Generali', tercero_nombre: 'Miguel Ángel Torres',
    tercero_poliza: 'GEN-2024-88451',
    importe_reclamado: 7600.00, importe_recuperado: 7600.00,
    estado: 'cobrado', fecha_inicio: '2025-09-08', fecha_cobro: '2025-12-22',
    descripcion: 'Saltó STOP y colisionó lateralmente. Culpabilidad 100% tercero.',
    tipo_siniestro: 'colision_lateral',
    documentacion: ['atestado_policial', 'informe_perito', 'factura_reparacion', 'parte_amistoso', 'fotos_accidente'],
    historial_negociacion: [
      { fecha: '2025-09-15', accion: 'Reclamación enviada a Generali', resultado: 'Acuse de recibo' },
      { fecha: '2025-10-05', accion: 'Generali acepta responsabilidad', resultado: 'Solicitan factura definitiva' },
      { fecha: '2025-11-20', accion: 'Factura enviada', resultado: 'Aprobación de pago' },
      { fecha: '2025-12-22', accion: 'Cobro recibido', resultado: 'Transferencia 7.600,00€' }
    ]
  },
  {
    id: 'sub-004', siniestroId: 'SIN-2025-0671', expediente: 'EXP-SUB-004',
    cliente: 'José Manuel Pérez Vega', poliza: 'POL-AUTO-9912',
    aseguradora_contraria: 'AXA', tercero_nombre: 'Sandra Molina Prieto',
    tercero_poliza: 'AXA-2025-44578',
    importe_reclamado: 2100.00, importe_recuperado: 1890.00,
    estado: 'cobrado', fecha_inicio: '2025-12-01', fecha_cobro: '2026-02-28',
    descripcion: 'Golpe en aparcamiento. Tercero no respetó prioridad de paso.',
    tipo_siniestro: 'colision_aparcamiento',
    documentacion: ['parte_amistoso', 'factura_reparacion', 'fotos_accidente'],
    historial_negociacion: [
      { fecha: '2025-12-08', accion: 'Reclamación enviada a AXA', resultado: 'Acuse de recibo' },
      { fecha: '2026-01-10', accion: 'AXA acepta 90% responsabilidad', resultado: 'Oferta 1.890€' },
      { fecha: '2026-02-28', accion: 'Cobro recibido', resultado: 'Transferencia 1.890,00€' }
    ]
  },
  {
    id: 'sub-005', siniestroId: 'SIN-2026-0041', expediente: 'EXP-SUB-005',
    cliente: 'Carmen Rodríguez Blanco', poliza: 'POL-AUTO-3345',
    aseguradora_contraria: 'Pelayo', tercero_nombre: 'Francisco Javier López',
    tercero_poliza: 'PEL-2025-77123',
    importe_reclamado: 5400.00, importe_recuperado: 5400.00,
    estado: 'cobrado', fecha_inicio: '2026-01-10', fecha_cobro: '2026-03-05',
    descripcion: 'Atropello de vehículo estacionado. Culpabilidad 100% tercero.',
    tipo_siniestro: 'atropello_vehiculo',
    documentacion: ['atestado_policial', 'informe_perito', 'factura_reparacion', 'fotos_accidente', 'testimonio_testigo'],
    historial_negociacion: [
      { fecha: '2026-01-15', accion: 'Reclamación enviada a Pelayo', resultado: 'Acuse de recibo' },
      { fecha: '2026-02-01', accion: 'Pelayo acepta responsabilidad total', resultado: 'Propuesta pago íntegro' },
      { fecha: '2026-03-05', accion: 'Cobro recibido', resultado: 'Transferencia 5.400,00€' }
    ]
  },
  // 3 EN NEGOCIACIÓN
  {
    id: 'sub-006', siniestroId: 'SIN-2026-0112', expediente: 'EXP-SUB-006',
    cliente: 'Elena Martínez Soler', poliza: 'POL-AUTO-6678',
    aseguradora_contraria: 'Zurich', tercero_nombre: 'David Fernández Navarro',
    tercero_poliza: 'ZUR-2025-55890',
    importe_reclamado: 8900.00, importe_recuperado: 0,
    estado: 'negociando', fecha_inicio: '2026-02-05', fecha_cobro: null,
    descripcion: 'Colisión en rotonda. Tercero no cedió el paso. Daños graves en lateral derecho.',
    tipo_siniestro: 'colision_rotonda',
    documentacion: ['atestado_policial', 'informe_perito', 'factura_reparacion', 'fotos_accidente'],
    historial_negociacion: [
      { fecha: '2026-02-10', accion: 'Reclamación enviada a Zurich', resultado: 'Acuse de recibo' },
      { fecha: '2026-02-28', accion: 'Zurich rechaza responsabilidad', resultado: 'Alegan culpabilidad compartida' },
      { fecha: '2026-03-10', accion: 'Envío de pruebas adicionales (cámara testigo)', resultado: 'Pendiente respuesta' }
    ]
  },
  {
    id: 'sub-007', siniestroId: 'SIN-2026-0098', expediente: 'EXP-SUB-007',
    cliente: 'Roberto Jiménez Ortiz', poliza: 'POL-AUTO-4423',
    aseguradora_contraria: 'Liberty', tercero_nombre: 'Ana Belén Castro Ramos',
    tercero_poliza: 'LIB-2026-12345',
    importe_reclamado: 3750.00, importe_recuperado: 0,
    estado: 'negociando', fecha_inicio: '2026-01-28', fecha_cobro: null,
    descripcion: 'Tercero se saltó semáforo en rojo. Daños en frontal izquierdo.',
    tipo_siniestro: 'colision_semaforo',
    documentacion: ['atestado_policial', 'informe_perito', 'factura_reparacion'],
    historial_negociacion: [
      { fecha: '2026-02-03', accion: 'Reclamación enviada a Liberty', resultado: 'Acuse de recibo' },
      { fecha: '2026-02-20', accion: 'Liberty ofrece 60% del importe', resultado: 'Rechazada, se solicita 100%' },
      { fecha: '2026-03-08', accion: 'Negociación en curso', resultado: 'Liberty sube oferta a 75%' }
    ]
  },
  {
    id: 'sub-008', siniestroId: 'SIN-2026-0155', expediente: 'EXP-SUB-008',
    cliente: 'Lucía Navarro Campos', poliza: 'POL-AUTO-8890',
    aseguradora_contraria: 'Mapfre', tercero_nombre: 'Óscar Delgado Herrera',
    tercero_poliza: 'MAP-2025-99101',
    importe_reclamado: 12500.00, importe_recuperado: 0,
    estado: 'negociando', fecha_inicio: '2026-02-18', fecha_cobro: null,
    descripcion: 'Colisión múltiple en autovía. Tercero causante principal. Daños muy graves.',
    tipo_siniestro: 'colision_multiple',
    documentacion: ['atestado_policial', 'informe_perito', 'fotos_accidente', 'informe_medico'],
    historial_negociacion: [
      { fecha: '2026-02-25', accion: 'Reclamación enviada a Mapfre', resultado: 'Acuse de recibo' },
      { fecha: '2026-03-12', accion: 'Mapfre solicita informe pericial independiente', resultado: 'En proceso' }
    ]
  },
  // 2 RECLAMADOS
  {
    id: 'sub-009', siniestroId: 'SIN-2026-0201', expediente: 'EXP-SUB-009',
    cliente: 'Fernando Ruiz Moreno', poliza: 'POL-AUTO-2256',
    aseguradora_contraria: 'Allianz', tercero_nombre: 'Patricia Iglesias Rojo',
    tercero_poliza: 'ALZ-2026-20145',
    importe_reclamado: 6200.00, importe_recuperado: 0,
    estado: 'reclamado', fecha_inicio: '2026-03-05', fecha_cobro: null,
    descripcion: 'Colisión en incorporación a autovía. Tercero no respetó carril de aceleración.',
    tipo_siniestro: 'colision_incorporacion',
    documentacion: ['atestado_policial', 'informe_perito', 'factura_reparacion', 'fotos_accidente'],
    historial_negociacion: [
      { fecha: '2026-03-10', accion: 'Reclamación enviada a Allianz', resultado: 'Pendiente acuse de recibo' }
    ]
  },
  {
    id: 'sub-010', siniestroId: 'SIN-2026-0218', expediente: 'EXP-SUB-010',
    cliente: 'Isabel Torres Muñoz', poliza: 'POL-AUTO-1178',
    aseguradora_contraria: 'AXA', tercero_nombre: 'Raúl Serrano Vidal',
    tercero_poliza: 'AXA-2026-30298',
    importe_reclamado: 4100.00, importe_recuperado: 0,
    estado: 'reclamado', fecha_inicio: '2026-03-12', fecha_cobro: null,
    descripcion: 'Marcha atrás en vía pública. Tercero realizó maniobra prohibida.',
    tipo_siniestro: 'marcha_atras',
    documentacion: ['parte_amistoso', 'factura_reparacion', 'fotos_accidente'],
    historial_negociacion: [
      { fecha: '2026-03-15', accion: 'Reclamación enviada a AXA', resultado: 'Pendiente acuse de recibo' }
    ]
  },
  // 1 FALLIDO (histórico)
  {
    id: 'sub-011', siniestroId: 'SIN-2025-0189', expediente: 'EXP-SUB-011',
    cliente: 'Andrés Morales Gil', poliza: 'POL-AUTO-7741',
    aseguradora_contraria: 'Generali', tercero_nombre: 'Desconocido',
    tercero_poliza: 'N/A',
    importe_reclamado: 3800.00, importe_recuperado: 0,
    estado: 'fallido', fecha_inicio: '2025-08-20', fecha_cobro: null,
    descripcion: 'Tercero se dio a la fuga. No se pudo identificar. Fondo de Garantía sin cobertura aplicable.',
    tipo_siniestro: 'fuga',
    documentacion: ['atestado_policial', 'denuncia'],
    historial_negociacion: [
      { fecha: '2025-08-25', accion: 'Denuncia ante policía', resultado: 'Atestado sin identificación' },
      { fecha: '2025-09-15', accion: 'Solicitud a Consorcio de Compensación', resultado: 'Rechazada - no aplica' },
      { fecha: '2025-10-30', accion: 'Caso cerrado como fallido', resultado: 'Sin posibilidad de recuperación' }
    ]
  }
];

// Plantillas de documentos de reclamación
const plantillasReclamacion = {
  colision_trasera: {
    fundamentoLegal: 'Art. 1902 CC - Responsabilidad extracontractual. Art. 76 LCS - Acción directa.',
    culpabilidad_tipica: 100,
    argumentos: [
      'El vehículo que circula detrás tiene la obligación de mantener la distancia de seguridad (Art. 54 RGC)',
      'La colisión por alcance establece presunción de culpabilidad del vehículo que impacta por detrás',
      'Jurisprudencia consolidada del TS (STS 15/03/2010, STS 22/06/2012)'
    ]
  },
  colision_frontal: {
    fundamentoLegal: 'Art. 1902 CC. Art. 76 LCS. Art. 28 LSV - Prioridad de paso.',
    culpabilidad_tipica: 80,
    argumentos: [
      'Invasión del carril contrario constituye infracción grave (Art. 28 LSV)',
      'El conductor que invade el carril opuesto asume la responsabilidad principal'
    ]
  },
  colision_lateral: {
    fundamentoLegal: 'Art. 1902 CC. Art. 76 LCS. Art. 25 RGC - Señales de STOP.',
    culpabilidad_tipica: 100,
    argumentos: [
      'La señal de STOP obliga a detenerse y ceder el paso (Art. 25 RGC)',
      'El incumplimiento de señal de STOP es infracción grave con presunción de culpabilidad'
    ]
  },
  colision_rotonda: {
    fundamentoLegal: 'Art. 1902 CC. Art. 76 LCS. Art. 57 RGC - Glorietas.',
    culpabilidad_tipica: 100,
    argumentos: [
      'El vehículo que se incorpora a la rotonda debe ceder el paso (Art. 57 RGC)',
      'Prioridad de los vehículos que circulan dentro de la glorieta'
    ]
  },
  colision_semaforo: {
    fundamentoLegal: 'Art. 1902 CC. Art. 76 LCS. Art. 146 RGC - Semáforos.',
    culpabilidad_tipica: 100,
    argumentos: [
      'Saltarse un semáforo en rojo es infracción muy grave (Art. 65.5.a LSV)',
      'Presunción iuris tantum de culpabilidad del infractor de norma de circulación'
    ]
  },
  colision_aparcamiento: {
    fundamentoLegal: 'Art. 1902 CC. Art. 76 LCS.',
    culpabilidad_tipica: 90,
    argumentos: [
      'El vehículo que maniobra en zona de aparcamiento debe extremar precauciones',
      'Obligación de vigilancia reforzada en maniobras de estacionamiento'
    ]
  },
  marcha_atras: {
    fundamentoLegal: 'Art. 1902 CC. Art. 76 LCS. Art. 80 RGC - Marcha atrás.',
    culpabilidad_tipica: 100,
    argumentos: [
      'La marcha atrás solo está permitida cuando no pueda avanzar ni cambiar de dirección (Art. 80 RGC)',
      'El conductor que realiza marcha atrás asume la responsabilidad total del siniestro'
    ]
  },
  colision_incorporacion: {
    fundamentoLegal: 'Art. 1902 CC. Art. 76 LCS. Art. 55 RGC - Incorporación.',
    culpabilidad_tipica: 100,
    argumentos: [
      'El vehículo que se incorpora debe ceder el paso a los que circulan por la vía (Art. 55 RGC)',
      'Obligación de utilizar correctamente el carril de aceleración'
    ]
  },
  colision_multiple: {
    fundamentoLegal: 'Art. 1902 CC. Art. 76 LCS. Doctrina de causalidad adecuada.',
    culpabilidad_tipica: 70,
    argumentos: [
      'En colisiones múltiples se aplica la doctrina de causalidad adecuada',
      'El causante inicial asume responsabilidad principal según jurisprudencia'
    ]
  },
  atropello_vehiculo: {
    fundamentoLegal: 'Art. 1902 CC. Art. 76 LCS.',
    culpabilidad_tipica: 100,
    argumentos: [
      'Impacto contra vehículo estacionado correctamente implica culpabilidad total',
      'Obligación de dominio del vehículo en todo momento (Art. 11 LSV)'
    ]
  },
  fuga: {
    fundamentoLegal: 'Art. 382 bis CP - Delito de abandono del lugar del accidente.',
    culpabilidad_tipica: 100,
    argumentos: [
      'El abandono del lugar del accidente constituye delito (Art. 382 bis CP)',
      'Subsidiariamente: reclamación al Consorcio de Compensación de Seguros'
    ]
  }
};

// ============================================================================
// FUNCIONES DEL AGENTE DE SUBROGACIÓN
// ============================================================================

/**
 * Inicia un proceso de subrogación para un siniestro
 */
function iniciarSubrogacion(siniestroId, datosCaso = {}) {
  const {
    cliente = 'Cliente Demo',
    poliza = 'POL-AUTO-0000',
    aseguradora_contraria = 'Mapfre',
    tercero_nombre = 'Tercero Desconocido',
    tercero_poliza = 'N/A',
    importe_reclamado = 3000.00,
    tipo_siniestro = 'colision_trasera',
    descripcion = 'Siniestro pendiente de análisis'
  } = datosCaso;

  // Verificar si ya existe caso para este siniestro
  const existente = casosSubrogacion.find(c => c.siniestroId === siniestroId);
  if (existente) {
    return {
      exito: false,
      mensaje: `Ya existe un caso de subrogación para el siniestro ${siniestroId}`,
      caso: existente
    };
  }

  const plantilla = plantillasReclamacion[tipo_siniestro] || plantillasReclamacion.colision_trasera;

  const nuevoCaso = {
    id: `sub-${uuidv4().slice(0, 8)}`,
    siniestroId,
    expediente: `EXP-SUB-${String(casosSubrogacion.length + 1).padStart(3, '0')}`,
    cliente,
    poliza,
    aseguradora_contraria,
    tercero_nombre,
    tercero_poliza,
    importe_reclamado,
    importe_recuperado: 0,
    estado: 'identificado',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_cobro: null,
    descripcion,
    tipo_siniestro,
    documentacion: [],
    historial_negociacion: []
  };

  // Análisis automático del caso
  const analisis = {
    viable: plantilla.culpabilidad_tipica >= 60,
    culpabilidad_estimada_tercero: plantilla.culpabilidad_tipica,
    fundamento_legal: plantilla.fundamentoLegal,
    argumentos_principales: plantilla.argumentos,
    importe_estimado_recuperable: Math.round(importe_reclamado * (plantilla.culpabilidad_tipica / 100) * 100) / 100,
    documentacion_necesaria: _getDocumentacionNecesaria(tipo_siniestro),
    plazo_estimado_dias: _getPlazoEstimado(aseguradora_contraria),
    probabilidad_exito: _calcularProbabilidadExito(tipo_siniestro, aseguradora_contraria)
  };

  // Generar documentación de reclamación
  const reclamacion = {
    asunto: `Reclamación por subrogación - Siniestro ${siniestroId}`,
    destinatario: `Departamento de Siniestros - ${aseguradora_contraria}`,
    cuerpo: _generarTextoReclamacion(nuevoCaso, plantilla),
    fecha_generacion: new Date().toISOString()
  };

  // Registrar primera acción
  nuevoCaso.historial_negociacion.push({
    fecha: new Date().toISOString().split('T')[0],
    accion: 'Caso identificado y analizado',
    resultado: `Viabilidad: ${analisis.viable ? 'Alta' : 'Baja'} - Culpabilidad tercero: ${analisis.culpabilidad_estimada_tercero}%`
  });

  // Cambiar estado a reclamado si es viable
  if (analisis.viable) {
    nuevoCaso.estado = 'reclamado';
    nuevoCaso.historial_negociacion.push({
      fecha: new Date().toISOString().split('T')[0],
      accion: `Reclamación enviada a ${aseguradora_contraria}`,
      resultado: 'Pendiente acuse de recibo'
    });
  }

  casosSubrogacion.push(nuevoCaso);

  return {
    exito: true,
    mensaje: `Subrogación iniciada correctamente para siniestro ${siniestroId}`,
    caso: nuevoCaso,
    analisis,
    reclamacion
  };
}

/**
 * Obtiene todos los casos activos (no cobrados ni fallidos)
 */
function getCasosActivos() {
  const activos = casosSubrogacion.filter(c =>
    ['identificado', 'reclamado', 'negociando'].includes(c.estado)
  );

  return {
    total: activos.length,
    importe_total_pendiente: activos.reduce((sum, c) => sum + c.importe_reclamado, 0),
    por_estado: {
      identificados: activos.filter(c => c.estado === 'identificado').length,
      reclamados: activos.filter(c => c.estado === 'reclamado').length,
      negociando: activos.filter(c => c.estado === 'negociando').length
    },
    casos: activos.map(c => ({
      id: c.id,
      expediente: c.expediente,
      siniestroId: c.siniestroId,
      cliente: c.cliente,
      aseguradora_contraria: c.aseguradora_contraria,
      importe_reclamado: c.importe_reclamado,
      estado: c.estado,
      fecha_inicio: c.fecha_inicio,
      dias_abierto: _calcularDiasAbierto(c.fecha_inicio),
      ultima_accion: c.historial_negociacion[c.historial_negociacion.length - 1] || null
    }))
  };
}

/**
 * Obtiene el importe recuperado en el mes actual
 */
function getRecuperadoMes() {
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  const cobradosMes = casosSubrogacion.filter(c => {
    if (c.estado !== 'cobrado' || !c.fecha_cobro) return false;
    const fechaCobro = new Date(c.fecha_cobro);
    return fechaCobro.getMonth() === mesActual && fechaCobro.getFullYear() === anioActual;
  });

  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  const totalRecuperado = cobradosMes.reduce((sum, c) => sum + c.importe_recuperado, 0);
  const totalReclamado = cobradosMes.reduce((sum, c) => sum + c.importe_reclamado, 0);

  return {
    mes: meses[mesActual],
    anio: anioActual,
    casos_cobrados: cobradosMes.length,
    importe_recuperado: totalRecuperado,
    importe_reclamado_original: totalReclamado,
    tasa_recuperacion: totalReclamado > 0 ? Math.round((totalRecuperado / totalReclamado) * 10000) / 100 : 0,
    detalle: cobradosMes.map(c => ({
      expediente: c.expediente,
      cliente: c.cliente,
      aseguradora_contraria: c.aseguradora_contraria,
      importe_reclamado: c.importe_reclamado,
      importe_recuperado: c.importe_recuperado,
      fecha_cobro: c.fecha_cobro
    }))
  };
}

/**
 * Simula una negociación paso a paso con la aseguradora contraria
 */
function simularNegociacion(casoId) {
  const caso = casosSubrogacion.find(c => c.id === casoId);
  if (!caso) {
    return { exito: false, mensaje: `No se encontró el caso ${casoId}` };
  }

  if (caso.estado === 'cobrado') {
    return { exito: false, mensaje: 'Este caso ya está cobrado', caso };
  }
  if (caso.estado === 'fallido') {
    return { exito: false, mensaje: 'Este caso está marcado como fallido', caso };
  }

  const aseguradora = caso.aseguradora_contraria;
  const perfilAseguradora = _getPerfilAseguradora(aseguradora);
  const plantilla = plantillasReclamacion[caso.tipo_siniestro] || plantillasReclamacion.colision_trasera;

  // Simular pasos de negociación
  const pasos = [];
  let ofertaActual = 0;
  let resultado = 'en_curso';

  // Paso 1: Respuesta inicial
  const diasRespuesta = perfilAseguradora.dias_respuesta_media;
  const fechaBase = new Date(caso.fecha_inicio);
  fechaBase.setDate(fechaBase.getDate() + diasRespuesta);

  if (perfilAseguradora.tendencia_rechazo_inicial > Math.random()) {
    pasos.push({
      paso: 1,
      fecha: fechaBase.toISOString().split('T')[0],
      accion: `${aseguradora} rechaza la reclamación`,
      detalle: `Alegan ${perfilAseguradora.motivo_rechazo_tipico}`,
      oferta: 0
    });
  } else {
    ofertaActual = Math.round(caso.importe_reclamado * perfilAseguradora.oferta_inicial_pct);
    pasos.push({
      paso: 1,
      fecha: fechaBase.toISOString().split('T')[0],
      accion: `${aseguradora} responde con contraoferta`,
      detalle: `Ofrecen ${ofertaActual.toFixed(2)}€ (${Math.round(perfilAseguradora.oferta_inicial_pct * 100)}% del reclamado)`,
      oferta: ofertaActual
    });
  }

  // Paso 2: Contraargumentación
  fechaBase.setDate(fechaBase.getDate() + 10);
  pasos.push({
    paso: 2,
    fecha: fechaBase.toISOString().split('T')[0],
    accion: 'Enviamos contraargumentación jurídica',
    detalle: `Fundamento: ${plantilla.fundamentoLegal}. Adjuntamos pruebas adicionales.`,
    oferta: caso.importe_reclamado
  });

  // Paso 3: Segunda oferta
  fechaBase.setDate(fechaBase.getDate() + perfilAseguradora.dias_respuesta_media);
  const segundaOfertaPct = Math.min(perfilAseguradora.oferta_inicial_pct + 0.25, 0.95);
  ofertaActual = Math.round(caso.importe_reclamado * segundaOfertaPct);
  pasos.push({
    paso: 3,
    fecha: fechaBase.toISOString().split('T')[0],
    accion: `${aseguradora} mejora su oferta`,
    detalle: `Nueva oferta: ${ofertaActual.toFixed(2)}€ (${Math.round(segundaOfertaPct * 100)}% del reclamado)`,
    oferta: ofertaActual
  });

  // Paso 4: Negociación final
  fechaBase.setDate(fechaBase.getDate() + 7);
  const exito = Math.random() < perfilAseguradora.probabilidad_acuerdo;

  if (exito) {
    const acuerdoPct = Math.min(segundaOfertaPct + 0.1, 1.0);
    ofertaActual = Math.round(caso.importe_reclamado * acuerdoPct);
    pasos.push({
      paso: 4,
      fecha: fechaBase.toISOString().split('T')[0],
      accion: 'Acuerdo alcanzado',
      detalle: `Se acuerda el pago de ${ofertaActual.toFixed(2)}€ (${Math.round(acuerdoPct * 100)}% del reclamado)`,
      oferta: ofertaActual
    });
    resultado = 'acuerdo';

    // Actualizar caso
    caso.estado = 'cobrado';
    caso.importe_recuperado = ofertaActual;
    caso.fecha_cobro = fechaBase.toISOString().split('T')[0];
  } else {
    pasos.push({
      paso: 4,
      fecha: fechaBase.toISOString().split('T')[0],
      accion: 'Negociación estancada',
      detalle: `${aseguradora} no mejora oferta. Se recomienda vía judicial.`,
      oferta: ofertaActual
    });
    resultado = 'estancado';
    caso.estado = 'negociando';
  }

  // Registrar en historial
  pasos.forEach(p => {
    caso.historial_negociacion.push({
      fecha: p.fecha,
      accion: p.accion,
      resultado: p.detalle
    });
  });

  return {
    exito: true,
    caso_id: casoId,
    expediente: caso.expediente,
    aseguradora_contraria: aseguradora,
    perfil_aseguradora: {
      nombre: aseguradora,
      dificultad: perfilAseguradora.dificultad,
      dias_respuesta_media: perfilAseguradora.dias_respuesta_media,
      probabilidad_acuerdo: `${Math.round(perfilAseguradora.probabilidad_acuerdo * 100)}%`
    },
    importe_reclamado: caso.importe_reclamado,
    resultado,
    oferta_final: ofertaActual,
    pasos,
    recomendacion: resultado === 'acuerdo'
      ? 'Acuerdo cerrado satisfactoriamente.'
      : 'Se recomienda iniciar procedimiento judicial. Plazo de prescripción: 1 año desde el siniestro (Art. 1968.2 CC).'
  };
}

/**
 * Obtiene estadísticas completas de subrogación
 */
function getEstadisticas() {
  const activos = casosSubrogacion.filter(c => ['identificado', 'reclamado', 'negociando'].includes(c.estado));
  const cobrados = casosSubrogacion.filter(c => c.estado === 'cobrado');
  const fallidos = casosSubrogacion.filter(c => c.estado === 'fallido');
  const todos = casosSubrogacion;

  const importeTotalReclamado = todos.reduce((sum, c) => sum + c.importe_reclamado, 0);
  const importeRecuperado = cobrados.reduce((sum, c) => sum + c.importe_recuperado, 0);
  const importePendiente = activos.reduce((sum, c) => sum + c.importe_reclamado, 0);

  // Tasa de éxito: cobrados / (cobrados + fallidos)
  const totalCerrados = cobrados.length + fallidos.length;
  const tasaExito = totalCerrados > 0 ? Math.round((cobrados.length / totalCerrados) * 10000) / 100 : 0;

  // Ahorro medio por caso cobrado
  const ahorroMedio = cobrados.length > 0 ? Math.round(importeRecuperado / cobrados.length) : 0;

  // Tiempo medio de resolución
  const tiemposResolucion = cobrados.map(c => _calcularDiasEntre(c.fecha_inicio, c.fecha_cobro));
  const tiempoMedio = tiemposResolucion.length > 0
    ? Math.round(tiemposResolucion.reduce((a, b) => a + b, 0) / tiemposResolucion.length)
    : 0;

  // Desglose por aseguradora
  const porAseguradora = {};
  todos.forEach(c => {
    if (!porAseguradora[c.aseguradora_contraria]) {
      porAseguradora[c.aseguradora_contraria] = {
        casos: 0, cobrados: 0, importe_reclamado: 0, importe_recuperado: 0
      };
    }
    const a = porAseguradora[c.aseguradora_contraria];
    a.casos++;
    if (c.estado === 'cobrado') a.cobrados++;
    a.importe_reclamado += c.importe_reclamado;
    a.importe_recuperado += c.importe_recuperado;
  });

  Object.keys(porAseguradora).forEach(key => {
    const a = porAseguradora[key];
    a.tasa_recuperacion = a.importe_reclamado > 0
      ? Math.round((a.importe_recuperado / a.importe_reclamado) * 10000) / 100
      : 0;
  });

  return {
    resumen: {
      casos_totales: todos.length,
      casos_activos: activos.length,
      casos_cobrados: cobrados.length,
      casos_fallidos: fallidos.length,
      importe_total_reclamado: importeTotalReclamado,
      importe_recuperado: importeRecuperado,
      importe_pendiente: importePendiente,
      tasa_exito: tasaExito,
      ahorro_medio: ahorroMedio,
      tiempo_medio_resolucion_dias: tiempoMedio
    },
    por_aseguradora: porAseguradora,
    por_estado: {
      identificado: casosSubrogacion.filter(c => c.estado === 'identificado').length,
      reclamado: casosSubrogacion.filter(c => c.estado === 'reclamado').length,
      negociando: casosSubrogacion.filter(c => c.estado === 'negociando').length,
      cobrado: cobrados.length,
      fallido: fallidos.length
    },
    alertas: _generarAlertas(activos)
  };
}

// ============================================================================
// FUNCIONES AUXILIARES INTERNAS
// ============================================================================

function _getPerfilAseguradora(nombre) {
  const perfiles = {
    'Mapfre': {
      dificultad: 'media', dias_respuesta_media: 15, oferta_inicial_pct: 0.65,
      tendencia_rechazo_inicial: 0.3, probabilidad_acuerdo: 0.8,
      motivo_rechazo_tipico: 'culpabilidad compartida'
    },
    'Allianz': {
      dificultad: 'alta', dias_respuesta_media: 20, oferta_inicial_pct: 0.50,
      tendencia_rechazo_inicial: 0.5, probabilidad_acuerdo: 0.65,
      motivo_rechazo_tipico: 'falta de pruebas concluyentes'
    },
    'AXA': {
      dificultad: 'media-baja', dias_respuesta_media: 12, oferta_inicial_pct: 0.70,
      tendencia_rechazo_inicial: 0.2, probabilidad_acuerdo: 0.85,
      motivo_rechazo_tipico: 'discrepancia en valoración de daños'
    },
    'Zurich': {
      dificultad: 'alta', dias_respuesta_media: 25, oferta_inicial_pct: 0.45,
      tendencia_rechazo_inicial: 0.6, probabilidad_acuerdo: 0.55,
      motivo_rechazo_tipico: 'responsabilidad no acreditada suficientemente'
    },
    'Generali': {
      dificultad: 'media', dias_respuesta_media: 18, oferta_inicial_pct: 0.60,
      tendencia_rechazo_inicial: 0.35, probabilidad_acuerdo: 0.75,
      motivo_rechazo_tipico: 'culpabilidad concurrente del asegurado'
    },
    'Liberty': {
      dificultad: 'media-alta', dias_respuesta_media: 22, oferta_inicial_pct: 0.55,
      tendencia_rechazo_inicial: 0.45, probabilidad_acuerdo: 0.60,
      motivo_rechazo_tipico: 'versión contradictoria del asegurado'
    },
    'Pelayo': {
      dificultad: 'baja', dias_respuesta_media: 10, oferta_inicial_pct: 0.80,
      tendencia_rechazo_inicial: 0.15, probabilidad_acuerdo: 0.90,
      motivo_rechazo_tipico: 'discrepancia menor en importes'
    }
  };
  return perfiles[nombre] || perfiles['Mapfre'];
}

function _getDocumentacionNecesaria(tipo) {
  const base = ['parte_amistoso', 'factura_reparacion', 'fotos_accidente'];
  const extras = {
    colision_trasera: ['atestado_policial'],
    colision_frontal: ['atestado_policial', 'informe_perito'],
    colision_lateral: ['atestado_policial', 'informe_perito'],
    colision_rotonda: ['atestado_policial', 'fotos_senalizacion'],
    colision_semaforo: ['atestado_policial', 'grabacion_semaforo'],
    colision_multiple: ['atestado_policial', 'informe_perito', 'informe_medico'],
    fuga: ['atestado_policial', 'denuncia', 'grabaciones_camaras']
  };
  return [...base, ...(extras[tipo] || ['atestado_policial'])];
}

function _getPlazoEstimado(aseguradora) {
  const plazos = {
    'Mapfre': 75, 'Allianz': 95, 'AXA': 60, 'Zurich': 110,
    'Generali': 80, 'Liberty': 100, 'Pelayo': 50
  };
  return plazos[aseguradora] || 90;
}

function _calcularProbabilidadExito(tipo, aseguradora) {
  const plantilla = plantillasReclamacion[tipo] || plantillasReclamacion.colision_trasera;
  const perfil = _getPerfilAseguradora(aseguradora);
  const base = plantilla.culpabilidad_tipica / 100;
  const factor = perfil.probabilidad_acuerdo;
  return Math.round(base * factor * 10000) / 100;
}

function _generarTextoReclamacion(caso, plantilla) {
  return `
RECLAMACIÓN POR SUBROGACIÓN
============================

Expediente: ${caso.expediente}
Siniestro: ${caso.siniestroId}
Fecha: ${new Date().toLocaleDateString('es-ES')}

Muy Sres. nuestros:

En virtud del derecho de subrogación que nos asiste conforme al artículo 43 de la Ley 50/1980 de Contrato de Seguro, nos dirigimos a ustedes para reclamar el importe de ${caso.importe_reclamado.toFixed(2)}€ correspondiente a los daños sufridos por nuestro asegurado D./Dña. ${caso.cliente} (póliza ${caso.poliza}) como consecuencia del siniestro de referencia.

HECHOS:
${caso.descripcion}

FUNDAMENTO JURÍDICO:
${plantilla.fundamentoLegal}

ARGUMENTACIÓN:
${plantilla.argumentos.map((a, i) => `${i + 1}. ${a}`).join('\n')}

PETICIÓN:
Solicitamos el abono de la cantidad de ${caso.importe_reclamado.toFixed(2)}€ en concepto de indemnización por los daños causados por su asegurado D./Dña. ${caso.tercero_nombre} (póliza ${caso.tercero_poliza}).

Quedamos a la espera de su respuesta en el plazo legal de 3 meses conforme al artículo 7 del RD 7/2001.

Atentamente,
Departamento de Subrogación
  `.trim();
}

function _calcularDiasAbierto(fechaInicio) {
  const inicio = new Date(fechaInicio);
  const hoy = new Date();
  return Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
}

function _calcularDiasEntre(fecha1, fecha2) {
  if (!fecha1 || !fecha2) return 0;
  const d1 = new Date(fecha1);
  const d2 = new Date(fecha2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

function _generarAlertas(activos) {
  const alertas = [];
  activos.forEach(c => {
    const dias = _calcularDiasAbierto(c.fecha_inicio);
    if (dias > 90) {
      alertas.push({
        tipo: 'urgente',
        caso: c.expediente,
        mensaje: `Caso abierto hace ${dias} días. Riesgo de prescripción.`
      });
    } else if (dias > 60) {
      alertas.push({
        tipo: 'aviso',
        caso: c.expediente,
        mensaje: `Caso abierto hace ${dias} días. Revisar estado de negociación.`
      });
    }
    const ultimaAccion = c.historial_negociacion[c.historial_negociacion.length - 1];
    if (ultimaAccion && ultimaAccion.resultado.includes('Pendiente')) {
      alertas.push({
        tipo: 'seguimiento',
        caso: c.expediente,
        mensaje: `Pendiente respuesta: ${ultimaAccion.accion}`
      });
    }
  });
  return alertas;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

module.exports = {
  iniciarSubrogacion,
  getCasosActivos,
  getRecuperadoMes,
  simularNegociacion,
  getEstadisticas,
  // Acceso directo a datos (para otros agentes)
  casosSubrogacion
};
