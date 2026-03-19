// ============================================================
// Legacy Integration Service - SiniestrosAI
// Integracion con sistemas legacy: Guidewire, DuckCreek, CSV/Excel
// ============================================================

const adaptadores = [
  {
    id: 'guidewire-01',
    nombre: 'Guidewire ClaimCenter',
    tipo: 'REST',
    estado: 'conectado',
    ultimo_sync: '2026-03-19T08:30:00Z',
    registros_sync: 14823,
    errores: 3,
    config: {
      url_base: 'https://guidewire.aseguradora.es/cc/api/v4',
      auth: 'OAuth2',
      timeout_ms: 30000,
      reintentos: 3
    }
  },
  {
    id: 'duckcreek-01',
    nombre: 'DuckCreek Policy Admin',
    tipo: 'SOAP',
    estado: 'conectado',
    ultimo_sync: '2026-03-19T07:15:00Z',
    registros_sync: 9471,
    errores: 7,
    config: {
      wsdl_url: 'https://duckcreek.aseguradora.es/services/PolicyService?wsdl',
      auth: 'WS-Security',
      timeout_ms: 45000,
      reintentos: 2
    }
  },
  {
    id: 'csv-excel-01',
    nombre: 'Importador CSV/Excel Batch',
    tipo: 'FILE',
    estado: 'desconectado',
    ultimo_sync: '2026-03-18T22:00:00Z',
    registros_sync: 3256,
    errores: 12,
    config: {
      directorio_entrada: '/data/imports/batch/',
      formatos_soportados: ['csv', 'xlsx', 'xls'],
      separador_csv: ';',
      encoding: 'UTF-8'
    }
  }
];

// Mapeo de campos entre SiniestrosAI y sistemas legacy
const fieldMappings = {
  guidewire: {
    'ClaimNumber': 'numero_siniestro',
    'LossDate': 'fecha_ocurrencia',
    'ReportedDate': 'fecha_reporte',
    'ClaimStatus': 'estado',
    'PolicyNumber': 'numero_poliza',
    'ClaimantName': 'nombre_asegurado',
    'ClaimantDNI': 'dni_asegurado',
    'LossType': 'tipo_siniestro',
    'LossDescription': 'descripcion',
    'ReserveAmount': 'reserva',
    'PaidAmount': 'importe_pagado',
    'AdjusterCode': 'codigo_perito',
    'BranchCode': 'codigo_sucursal',
    'LossCause': 'causa_siniestro',
    'VehiclePlate': 'matricula'
  },
  duckCreek: {
    'POL_NUMBER': 'numero_poliza',
    'POL_STATUS': 'estado_poliza',
    'POL_EFF_DATE': 'fecha_efecto',
    'POL_EXP_DATE': 'fecha_vencimiento',
    'INSURED_NAME': 'nombre_asegurado',
    'INSURED_ID': 'dni_asegurado',
    'PREMIUM_AMT': 'prima_total',
    'COV_TYPE': 'tipo_cobertura',
    'AGENT_CODE': 'codigo_agente',
    'RISK_ADDRESS': 'direccion_riesgo',
    'BRANCH_CODE': 'codigo_sucursal',
    'PRODUCT_CODE': 'codigo_producto'
  },
  csvExcel: {
    'num_siniestro': 'numero_siniestro',
    'fecha': 'fecha_ocurrencia',
    'asegurado': 'nombre_asegurado',
    'nif': 'dni_asegurado',
    'poliza': 'numero_poliza',
    'tipo': 'tipo_siniestro',
    'desc': 'descripcion',
    'importe': 'reserva',
    'estado': 'estado',
    'perito': 'codigo_perito'
  }
};

// Cola de sincronizacion pendiente
const syncQueue = [
  { id: 'sq-001', adapterId: 'guidewire-01', operacion: 'importar', registros: 45, estado: 'pendiente', creado: '2026-03-19T09:00:00Z' },
  { id: 'sq-002', adapterId: 'duckcreek-01', operacion: 'exportar', registros: 12, estado: 'pendiente', creado: '2026-03-19T09:05:00Z' },
  { id: 'sq-003', adapterId: 'guidewire-01', operacion: 'exportar', registros: 8, estado: 'en_proceso', creado: '2026-03-19T08:50:00Z' },
  { id: 'sq-004', adapterId: 'csv-excel-01', operacion: 'importar', registros: 230, estado: 'pendiente', creado: '2026-03-19T08:45:00Z' },
  { id: 'sq-005', adapterId: 'duckcreek-01', operacion: 'importar', registros: 67, estado: 'pendiente', creado: '2026-03-19T09:10:00Z' }
];

// Historial de sincronizaciones
const syncLog = [
  { id: 'sl-001', adapterId: 'guidewire-01', tipo: 'importar', fecha: '2026-03-19T08:30:00Z', registros_importados: 128, registros_exportados: 0, errores: 0, duracion_ms: 4520, estado: 'completado' },
  { id: 'sl-002', adapterId: 'guidewire-01', tipo: 'exportar', fecha: '2026-03-19T08:00:00Z', registros_importados: 0, registros_exportados: 34, errores: 1, duracion_ms: 2310, estado: 'completado_con_errores' },
  { id: 'sl-003', adapterId: 'duckcreek-01', tipo: 'importar', fecha: '2026-03-19T07:15:00Z', registros_importados: 89, registros_exportados: 0, errores: 2, duracion_ms: 8740, estado: 'completado_con_errores' },
  { id: 'sl-004', adapterId: 'csv-excel-01', tipo: 'importar', fecha: '2026-03-18T22:00:00Z', registros_importados: 456, registros_exportados: 0, errores: 12, duracion_ms: 15200, estado: 'completado_con_errores' },
  { id: 'sl-005', adapterId: 'guidewire-01', tipo: 'importar', fecha: '2026-03-18T20:30:00Z', registros_importados: 67, registros_exportados: 0, errores: 0, duracion_ms: 3100, estado: 'completado' },
  { id: 'sl-006', adapterId: 'duckcreek-01', tipo: 'exportar', fecha: '2026-03-18T19:00:00Z', registros_importados: 0, registros_exportados: 23, errores: 0, duracion_ms: 5670, estado: 'completado' },
  { id: 'sl-007', adapterId: 'guidewire-01', tipo: 'importar', fecha: '2026-03-18T14:30:00Z', registros_importados: 210, registros_exportados: 0, errores: 1, duracion_ms: 6200, estado: 'completado_con_errores' },
  { id: 'sl-008', adapterId: 'csv-excel-01', tipo: 'importar', fecha: '2026-03-18T10:00:00Z', registros_importados: 1200, registros_exportados: 0, errores: 5, duracion_ms: 42000, estado: 'completado_con_errores' },
  { id: 'sl-009', adapterId: 'duckcreek-01', tipo: 'importar', fecha: '2026-03-18T08:15:00Z', registros_importados: 134, registros_exportados: 0, errores: 0, duracion_ms: 9800, estado: 'completado' },
  { id: 'sl-010', adapterId: 'guidewire-01', tipo: 'exportar', fecha: '2026-03-17T18:00:00Z', registros_importados: 0, registros_exportados: 56, errores: 2, duracion_ms: 3400, estado: 'completado_con_errores' },
  { id: 'sl-011', adapterId: 'guidewire-01', tipo: 'importar', fecha: '2026-03-17T14:00:00Z', registros_importados: 95, registros_exportados: 0, errores: 0, duracion_ms: 4100, estado: 'completado' },
  { id: 'sl-012', adapterId: 'duckcreek-01', tipo: 'exportar', fecha: '2026-03-17T12:30:00Z', registros_importados: 0, registros_exportados: 41, errores: 1, duracion_ms: 6700, estado: 'completado_con_errores' },
  { id: 'sl-013', adapterId: 'csv-excel-01', tipo: 'importar', fecha: '2026-03-17T09:00:00Z', registros_importados: 800, registros_exportados: 0, errores: 3, duracion_ms: 28000, estado: 'completado_con_errores' },
  { id: 'sl-014', adapterId: 'guidewire-01', tipo: 'importar', fecha: '2026-03-16T20:00:00Z', registros_importados: 178, registros_exportados: 0, errores: 0, duracion_ms: 5600, estado: 'completado' },
  { id: 'sl-015', adapterId: 'duckcreek-01', tipo: 'importar', fecha: '2026-03-16T16:00:00Z', registros_importados: 56, registros_exportados: 0, errores: 0, duracion_ms: 7200, estado: 'completado' },
  { id: 'sl-016', adapterId: 'guidewire-01', tipo: 'exportar', fecha: '2026-03-16T10:00:00Z', registros_importados: 0, registros_exportados: 29, errores: 0, duracion_ms: 1900, estado: 'completado' }
];

let logCounter = 16;

function translateFields(data, adapterType, direction) {
  const mapping = fieldMappings[adapterType];
  if (!mapping) return data;

  const translated = {};
  if (direction === 'import') {
    for (const [legacyField, aiField] of Object.entries(mapping)) {
      if (data[legacyField] !== undefined) {
        translated[aiField] = data[legacyField];
      }
    }
  } else {
    const reverseMapping = {};
    for (const [legacyField, aiField] of Object.entries(mapping)) {
      reverseMapping[aiField] = legacyField;
    }
    for (const [aiField, legacyField] of Object.entries(reverseMapping)) {
      if (data[aiField] !== undefined) {
        translated[legacyField] = data[aiField];
      }
    }
  }
  return translated;
}

function sincronizar(adapterId) {
  const adapter = adaptadores.find(a => a.id === adapterId);
  if (!adapter) {
    return { error: true, mensaje: `Adaptador ${adapterId} no encontrado` };
  }

  const prevEstado = adapter.estado;
  adapter.estado = 'sincronizando';

  const registros_importados = Math.floor(Math.random() * 150) + 20;
  const registros_exportados = Math.floor(Math.random() * 40) + 5;
  const errores = Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0;
  const duracion_ms = Math.floor(Math.random() * 10000) + 2000;

  adapter.registros_sync += registros_importados + registros_exportados;
  adapter.errores += errores;
  adapter.ultimo_sync = new Date().toISOString();
  adapter.estado = 'conectado';

  logCounter++;
  const logEntry = {
    id: `sl-${String(logCounter).padStart(3, '0')}`,
    adapterId,
    tipo: 'completa',
    fecha: new Date().toISOString(),
    registros_importados,
    registros_exportados,
    errores,
    duracion_ms,
    estado: errores > 0 ? 'completado_con_errores' : 'completado'
  };
  syncLog.unshift(logEntry);

  // Limpiar operaciones pendientes de este adaptador
  const pendientes = syncQueue.filter(sq => sq.adapterId === adapterId && sq.estado === 'pendiente');
  pendientes.forEach(sq => { sq.estado = 'completado'; });

  return {
    registros_importados,
    registros_exportados,
    errores,
    duracion: `${(duracion_ms / 1000).toFixed(1)}s`,
    duracion_ms,
    adapter_nombre: adapter.nombre,
    adapter_estado: adapter.estado,
    detalles_errores: errores > 0
      ? Array.from({ length: errores }, (_, i) => ({
          campo: ['nombre_asegurado', 'numero_poliza', 'fecha_ocurrencia', 'reserva', 'matricula'][i % 5],
          tipo_error: ['formato_invalido', 'campo_requerido', 'valor_fuera_rango', 'duplicado'][i % 4],
          registro: Math.floor(Math.random() * registros_importados) + 1
        }))
      : []
  };
}

function getEstado() {
  return {
    adaptadores: adaptadores.map(a => ({
      id: a.id,
      nombre: a.nombre,
      tipo: a.tipo,
      estado: a.estado,
      ultimo_sync: a.ultimo_sync,
      registros_sync: a.registros_sync,
      errores: a.errores
    })),
    cola_pendiente: syncQueue.filter(sq => sq.estado === 'pendiente').length,
    total_registros_sincronizados: adaptadores.reduce((sum, a) => sum + a.registros_sync, 0),
    total_errores: adaptadores.reduce((sum, a) => sum + a.errores, 0),
    ultima_sincronizacion: adaptadores.reduce((latest, a) => {
      return a.ultimo_sync > latest ? a.ultimo_sync : latest;
    }, '1970-01-01T00:00:00Z')
  };
}

function importarExcel(datos) {
  if (!datos || !Array.isArray(datos)) {
    // Simular datos de ejemplo si no se pasan
    datos = [
      { num_siniestro: 'SIN-2026-0451', fecha: '2026-03-10', asegurado: 'Maria Lopez Garcia', nif: '12345678A', poliza: 'POL-AUTO-8832', tipo: 'auto', desc: 'Colision trasera en rotonda', importe: 3200, estado: 'abierto', perito: 'PER-012' },
      { num_siniestro: 'SIN-2026-0452', fecha: '2026-03-11', asegurado: 'Carlos Ruiz Mendez', nif: '87654321B', poliza: 'POL-HOGAR-2241', tipo: 'hogar', desc: 'Rotura tuberia cocina', importe: 1850, estado: 'abierto', perito: 'PER-008' },
      { num_siniestro: 'SIN-2026-0453', fecha: '2026-03-12', asegurado: '', nif: '11223344C', poliza: 'POL-AUTO-9921', tipo: 'auto', desc: 'Robo de vehiculo', importe: 18500, estado: 'abierto', perito: 'PER-003' },
      { num_siniestro: '', fecha: '2026-03-13', asegurado: 'Ana Fernandez Diaz', nif: '55667788D', poliza: 'POL-SALUD-1123', tipo: 'salud', desc: 'Hospitalizacion urgente', importe: 4200, estado: 'abierto', perito: 'PER-015' },
      { num_siniestro: 'SIN-2026-0455', fecha: 'fecha-invalida', asegurado: 'Pedro Martin Sanz', nif: '99887766E', poliza: 'POL-AUTO-3344', tipo: 'auto', desc: 'Granizo danos carroceria', importe: 2100, estado: 'abierto', perito: 'PER-007' },
      { num_siniestro: 'SIN-2026-0456', fecha: '2026-03-14', asegurado: 'Laura Gomez Torres', nif: '44556677F', poliza: 'POL-HOGAR-5567', tipo: 'hogar', desc: 'Incendio cocina menor', importe: 6700, estado: 'abierto', perito: 'PER-011' }
    ];
  }

  const camposRequeridos = ['num_siniestro', 'fecha', 'asegurado', 'nif', 'poliza'];
  const importados = [];
  const rechazados = [];
  const errores = [];

  datos.forEach((fila, index) => {
    const erroresFila = [];

    // Validar campos requeridos
    camposRequeridos.forEach(campo => {
      if (!fila[campo] || String(fila[campo]).trim() === '') {
        erroresFila.push({ campo, error: 'Campo requerido vacio', fila: index + 1 });
      }
    });

    // Validar formato fecha
    if (fila.fecha && isNaN(Date.parse(fila.fecha))) {
      erroresFila.push({ campo: 'fecha', error: 'Formato de fecha invalido', fila: index + 1 });
    }

    // Validar importe numerico
    if (fila.importe !== undefined && (isNaN(fila.importe) || fila.importe < 0)) {
      erroresFila.push({ campo: 'importe', error: 'Importe debe ser numerico positivo', fila: index + 1 });
    }

    // Validar NIF formato basico
    if (fila.nif && !/^[0-9]{8}[A-Z]$/.test(fila.nif)) {
      erroresFila.push({ campo: 'nif', error: 'Formato de NIF invalido', fila: index + 1 });
    }

    if (erroresFila.length > 0) {
      rechazados.push({ fila: index + 1, datos: fila, errores: erroresFila });
      errores.push(...erroresFila);
    } else {
      const translated = translateFields(fila, 'csvExcel', 'import');
      translated.id = `IMP-${Date.now()}-${index}`;
      translated.origen = 'csv-excel-01';
      translated.fecha_importacion = new Date().toISOString();
      importados.push(translated);
    }
  });

  // Actualizar adaptador CSV
  const csvAdapter = adaptadores.find(a => a.id === 'csv-excel-01');
  if (csvAdapter) {
    csvAdapter.registros_sync += importados.length;
    csvAdapter.errores += rechazados.length;
    csvAdapter.ultimo_sync = new Date().toISOString();
  }

  return {
    total_procesados: datos.length,
    importados: importados.length,
    rechazados: rechazados.length,
    registros_importados: importados,
    registros_rechazados: rechazados,
    errores,
    resumen: `Se importaron ${importados.length} de ${datos.length} registros. ${rechazados.length} rechazados por errores de validacion.`
  };
}

function getSyncLog() {
  return syncLog.slice(0, 20).map(entry => ({
    ...entry,
    adapter_nombre: adaptadores.find(a => a.id === entry.adapterId)?.nombre || 'Desconocido'
  }));
}

function getFieldMappings(adapterType) {
  return fieldMappings[adapterType] || null;
}

function getSyncQueue() {
  return syncQueue.map(sq => ({
    ...sq,
    adapter_nombre: adaptadores.find(a => a.id === sq.adapterId)?.nombre || 'Desconocido'
  }));
}

module.exports = {
  sincronizar,
  getEstado,
  importarExcel,
  getSyncLog,
  getFieldMappings,
  getSyncQueue,
  translateFields
};
