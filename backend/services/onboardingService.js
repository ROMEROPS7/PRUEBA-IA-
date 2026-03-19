// =============================================================================
// Servicio de Onboarding Automatizado para Aseguradoras
// =============================================================================

const PASOS_ONBOARDING = [
  { id: 'registro_empresa', nombre: 'Registro de Empresa', descripcion: 'Datos fiscales, estructura organizativa y configuracion inicial del tenant', tiempo_estimado_horas: 2 },
  { id: 'configuracion_productos', nombre: 'Configuracion de Productos', descripcion: 'Alta de lineas de seguro, coberturas, franquicias y limites de poliza', tiempo_estimado_horas: 8 },
  { id: 'importacion_clientes', nombre: 'Importacion de Clientes', descripcion: 'Carga masiva de asegurados desde CSV/Excel con validacion de datos', tiempo_estimado_horas: 4 },
  { id: 'configuracion_reglas', nombre: 'Configuracion de Reglas', descripcion: 'Definicion de reglas de negocio, SLAs, flujos de aprobacion y alertas', tiempo_estimado_horas: 6 },
  { id: 'integraciones', nombre: 'Integraciones Externas', descripcion: 'Conexion con peritos, talleres, DGT, sistemas de pago y APIs externas', tiempo_estimado_horas: 10 },
  { id: 'formacion_equipo', nombre: 'Formacion del Equipo', descripcion: 'Sesiones de formacion para gestores, supervisores y administradores', tiempo_estimado_horas: 8 },
  { id: 'pruebas', nombre: 'Pruebas y Validacion', descripcion: 'Ejecucion de casos de prueba, simulaciones y validacion end-to-end', tiempo_estimado_horas: 6 },
  { id: 'go_live', nombre: 'Puesta en Produccion', descripcion: 'Migracion final, activacion del entorno productivo y monitorizacion', tiempo_estimado_horas: 4 }
];

const TIEMPO_TOTAL_HORAS = 48;

// Base de datos en memoria de procesos de onboarding
const onboardings = new Map();

// Pre-poblar 3 tenants en diferentes etapas
function inicializarDatos() {
  // Tenant 1: Onboarding completado casi al 100%
  onboardings.set('tenant_seguros_madrid', {
    tenantId: 'tenant_seguros_madrid',
    empresa: {
      nombre: 'Seguros Madrid Capital S.A.',
      cif: 'A28456789',
      direccion: 'Calle Gran Via 45, 28013 Madrid',
      contacto: 'Carlos Mendez',
      email: 'cmendez@segurosmadrid.es',
      telefono: '+34 914 567 890',
      sector: 'Multirriesgo',
      empleados: 120
    },
    fechaInicio: new Date('2026-02-01'),
    fechaEstimadaFin: new Date('2026-02-15'),
    pasos: [
      { id: 'registro_empresa', nombre: 'Registro de Empresa', descripcion: PASOS_ONBOARDING[0].descripcion, completado: true, progreso_pct: 100, tiempo_estimado: '2h', fechaCompletado: new Date('2026-02-01T10:00:00'), notas: 'Documentacion fiscal verificada' },
      { id: 'configuracion_productos', nombre: 'Configuracion de Productos', descripcion: PASOS_ONBOARDING[1].descripcion, completado: true, progreso_pct: 100, tiempo_estimado: '8h', fechaCompletado: new Date('2026-02-03T16:00:00'), notas: '4 lineas de producto configuradas: Hogar, Auto, Vida, Salud' },
      { id: 'importacion_clientes', nombre: 'Importacion de Clientes', descripcion: PASOS_ONBOARDING[2].descripcion, completado: true, progreso_pct: 100, tiempo_estimado: '4h', fechaCompletado: new Date('2026-02-05T12:00:00'), notas: '8.450 clientes importados, 23 errores corregidos' },
      { id: 'configuracion_reglas', nombre: 'Configuracion de Reglas', descripcion: PASOS_ONBOARDING[3].descripcion, completado: true, progreso_pct: 100, tiempo_estimado: '6h', fechaCompletado: new Date('2026-02-07T14:00:00'), notas: '15 reglas de negocio y 3 flujos de aprobacion' },
      { id: 'integraciones', nombre: 'Integraciones Externas', descripcion: PASOS_ONBOARDING[4].descripcion, completado: true, progreso_pct: 100, tiempo_estimado: '10h', fechaCompletado: new Date('2026-02-10T18:00:00'), notas: 'DGT, Tirea, pasarela Redsys conectadas' },
      { id: 'formacion_equipo', nombre: 'Formacion del Equipo', descripcion: PASOS_ONBOARDING[5].descripcion, completado: true, progreso_pct: 100, tiempo_estimado: '8h', fechaCompletado: new Date('2026-02-12T17:00:00'), notas: '35 usuarios formados en 3 sesiones' },
      { id: 'pruebas', nombre: 'Pruebas y Validacion', descripcion: PASOS_ONBOARDING[6].descripcion, completado: true, progreso_pct: 100, tiempo_estimado: '6h', fechaCompletado: new Date('2026-02-13T16:00:00'), notas: '42 casos de prueba superados' },
      { id: 'go_live', nombre: 'Puesta en Produccion', descripcion: PASOS_ONBOARDING[7].descripcion, completado: false, progreso_pct: 60, tiempo_estimado: '4h', notas: 'Pendiente migracion final programada para el lunes' }
    ],
    estado: 'en_progreso',
    importaciones: [
      { tipo: 'clientes', fecha: new Date('2026-02-05'), registros: 8450, errores: 23, warnings: 67 },
      { tipo: 'polizas', fecha: new Date('2026-02-06'), registros: 12300, errores: 5, warnings: 120 }
    ]
  });

  // Tenant 2: A mitad del proceso
  onboardings.set('tenant_mutual_catalana', {
    tenantId: 'tenant_mutual_catalana',
    empresa: {
      nombre: 'Mutual Catalana de Seguros',
      cif: 'V08765432',
      direccion: 'Passeig de Gracia 88, 08008 Barcelona',
      contacto: 'Montserrat Vila',
      email: 'mvila@mutualcatalana.cat',
      telefono: '+34 933 456 789',
      sector: 'Automovil',
      empleados: 85
    },
    fechaInicio: new Date('2026-03-01'),
    fechaEstimadaFin: new Date('2026-03-20'),
    pasos: [
      { id: 'registro_empresa', nombre: 'Registro de Empresa', descripcion: PASOS_ONBOARDING[0].descripcion, completado: true, progreso_pct: 100, tiempo_estimado: '2h', fechaCompletado: new Date('2026-03-01T09:00:00'), notas: 'Alta completada' },
      { id: 'configuracion_productos', nombre: 'Configuracion de Productos', descripcion: PASOS_ONBOARDING[1].descripcion, completado: true, progreso_pct: 100, tiempo_estimado: '8h', fechaCompletado: new Date('2026-03-04T15:00:00'), notas: 'Productos auto: terceros, todo riesgo, franquicia' },
      { id: 'importacion_clientes', nombre: 'Importacion de Clientes', descripcion: PASOS_ONBOARDING[2].descripcion, completado: true, progreso_pct: 100, tiempo_estimado: '4h', fechaCompletado: new Date('2026-03-06T11:00:00'), notas: '3.200 clientes importados' },
      { id: 'configuracion_reglas', nombre: 'Configuracion de Reglas', descripcion: PASOS_ONBOARDING[3].descripcion, completado: false, progreso_pct: 45, tiempo_estimado: '6h', notas: 'En progreso: SLAs definidos, pendiente flujos de aprobacion' },
      { id: 'integraciones', nombre: 'Integraciones Externas', descripcion: PASOS_ONBOARDING[4].descripcion, completado: false, progreso_pct: 0, tiempo_estimado: '10h', notas: '' },
      { id: 'formacion_equipo', nombre: 'Formacion del Equipo', descripcion: PASOS_ONBOARDING[5].descripcion, completado: false, progreso_pct: 0, tiempo_estimado: '8h', notas: '' },
      { id: 'pruebas', nombre: 'Pruebas y Validacion', descripcion: PASOS_ONBOARDING[6].descripcion, completado: false, progreso_pct: 0, tiempo_estimado: '6h', notas: '' },
      { id: 'go_live', nombre: 'Puesta en Produccion', descripcion: PASOS_ONBOARDING[7].descripcion, completado: false, progreso_pct: 0, tiempo_estimado: '4h', notas: '' }
    ],
    estado: 'en_progreso',
    importaciones: [
      { tipo: 'clientes', fecha: new Date('2026-03-06'), registros: 3200, errores: 12, warnings: 45 }
    ]
  });

  // Tenant 3: Recien empezado
  onboardings.set('tenant_seguros_levante', {
    tenantId: 'tenant_seguros_levante',
    empresa: {
      nombre: 'Seguros Levante Mediterraneo S.L.',
      cif: 'B46123456',
      direccion: 'Avenida del Puerto 112, 46023 Valencia',
      contacto: 'Francisco Navarro',
      email: 'fnavarro@seguroslevante.es',
      telefono: '+34 963 234 567',
      sector: 'Hogar y Comunidades',
      empleados: 45
    },
    fechaInicio: new Date('2026-03-15'),
    fechaEstimadaFin: new Date('2026-04-05'),
    pasos: [
      { id: 'registro_empresa', nombre: 'Registro de Empresa', descripcion: PASOS_ONBOARDING[0].descripcion, completado: true, progreso_pct: 100, tiempo_estimado: '2h', fechaCompletado: new Date('2026-03-15T10:00:00'), notas: 'Registro inicial completado' },
      { id: 'configuracion_productos', nombre: 'Configuracion de Productos', descripcion: PASOS_ONBOARDING[1].descripcion, completado: false, progreso_pct: 20, tiempo_estimado: '8h', notas: 'Primera reunion de configuracion realizada' },
      { id: 'importacion_clientes', nombre: 'Importacion de Clientes', descripcion: PASOS_ONBOARDING[2].descripcion, completado: false, progreso_pct: 0, tiempo_estimado: '4h', notas: '' },
      { id: 'configuracion_reglas', nombre: 'Configuracion de Reglas', descripcion: PASOS_ONBOARDING[3].descripcion, completado: false, progreso_pct: 0, tiempo_estimado: '6h', notas: '' },
      { id: 'integraciones', nombre: 'Integraciones Externas', descripcion: PASOS_ONBOARDING[4].descripcion, completado: false, progreso_pct: 0, tiempo_estimado: '10h', notas: '' },
      { id: 'formacion_equipo', nombre: 'Formacion del Equipo', descripcion: PASOS_ONBOARDING[5].descripcion, completado: false, progreso_pct: 0, tiempo_estimado: '8h', notas: '' },
      { id: 'pruebas', nombre: 'Pruebas y Validacion', descripcion: PASOS_ONBOARDING[6].descripcion, completado: false, progreso_pct: 0, tiempo_estimado: '6h', notas: '' },
      { id: 'go_live', nombre: 'Puesta en Produccion', descripcion: PASOS_ONBOARDING[7].descripcion, completado: false, progreso_pct: 0, tiempo_estimado: '4h', notas: '' }
    ],
    estado: 'en_progreso',
    importaciones: []
  });
}

inicializarDatos();

// ---------------------------------------------------------------------------
// iniciarOnboarding - Crea un nuevo proceso de onboarding
// ---------------------------------------------------------------------------
function iniciarOnboarding(datos) {
  const { nombre, cif, direccion, contacto, email, telefono, sector, empleados } = datos;

  if (!nombre || !cif || !email) {
    return { ok: false, error: 'Campos obligatorios: nombre, cif, email' };
  }

  // Verificar CIF duplicado
  for (const [, ob] of onboardings) {
    if (ob.empresa.cif === cif) {
      return { ok: false, error: `Ya existe un onboarding para el CIF ${cif}` };
    }
  }

  const tenantId = 'tenant_' + nombre.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').substring(0, 30);
  const ahora = new Date();

  const proceso = {
    tenantId,
    empresa: {
      nombre: nombre || '',
      cif: cif || '',
      direccion: direccion || '',
      contacto: contacto || '',
      email: email || '',
      telefono: telefono || '',
      sector: sector || 'General',
      empleados: empleados || 0
    },
    fechaInicio: ahora,
    fechaEstimadaFin: new Date(ahora.getTime() + TIEMPO_TOTAL_HORAS * 3600 * 1000 * 1.5), // factor 1.5 para dias laborables
    pasos: PASOS_ONBOARDING.map(p => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      completado: false,
      progreso_pct: 0,
      tiempo_estimado: p.tiempo_estimado_horas + 'h',
      notas: ''
    })),
    estado: 'pendiente',
    importaciones: []
  };

  onboardings.set(tenantId, proceso);

  return {
    ok: true,
    tenantId,
    mensaje: `Onboarding iniciado para ${nombre}`,
    tiempo_estimado_total: TIEMPO_TOTAL_HORAS + ' horas',
    pasos_totales: PASOS_ONBOARDING.length,
    fecha_estimada_fin: proceso.fechaEstimadaFin
  };
}

// ---------------------------------------------------------------------------
// getProgreso - Retorna el progreso actual con detalle por paso
// ---------------------------------------------------------------------------
function getProgreso(tenantId) {
  const ob = onboardings.get(tenantId);
  if (!ob) {
    return { ok: false, error: `No se encontro onboarding para tenant: ${tenantId}` };
  }

  const pasosCompletados = ob.pasos.filter(p => p.completado).length;
  const progresoTotal = ob.pasos.reduce((sum, p) => sum + p.progreso_pct, 0) / ob.pasos.length;

  const horasEstimadasRestantes = ob.pasos
    .filter(p => !p.completado)
    .reduce((sum, p) => {
      const horas = parseInt(p.tiempo_estimado);
      const fraccionRestante = (100 - p.progreso_pct) / 100;
      return sum + (horas * fraccionRestante);
    }, 0);

  return {
    ok: true,
    tenantId,
    empresa: ob.empresa.nombre,
    estado: ob.estado,
    progreso_global_pct: Math.round(progresoTotal * 100) / 100,
    pasos_completados: pasosCompletados,
    pasos_totales: ob.pasos.length,
    horas_restantes_estimadas: Math.round(horasEstimadasRestantes * 10) / 10,
    fecha_inicio: ob.fechaInicio,
    fecha_estimada_fin: ob.fechaEstimadaFin,
    paso_actual: ob.pasos.find(p => !p.completado) || null,
    detalle_pasos: ob.pasos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      completado: p.completado,
      progreso_pct: p.progreso_pct,
      tiempo_estimado: p.tiempo_estimado,
      fechaCompletado: p.fechaCompletado || null,
      notas: p.notas
    }))
  };
}

// ---------------------------------------------------------------------------
// completarPaso - Marca un paso como completado
// ---------------------------------------------------------------------------
function completarPaso(tenantId, pasoId) {
  const ob = onboardings.get(tenantId);
  if (!ob) {
    return { ok: false, error: `No se encontro onboarding para tenant: ${tenantId}` };
  }

  const paso = ob.pasos.find(p => p.id === pasoId);
  if (!paso) {
    return { ok: false, error: `Paso no encontrado: ${pasoId}` };
  }

  if (paso.completado) {
    return { ok: false, error: `El paso '${paso.nombre}' ya esta completado` };
  }

  // Verificar que los pasos anteriores estan completados (orden secuencial)
  const indice = ob.pasos.findIndex(p => p.id === pasoId);
  for (let i = 0; i < indice; i++) {
    if (!ob.pasos[i].completado) {
      return {
        ok: false,
        error: `Debe completar primero el paso '${ob.pasos[i].nombre}' antes de '${paso.nombre}'`
      };
    }
  }

  paso.completado = true;
  paso.progreso_pct = 100;
  paso.fechaCompletado = new Date();

  // Verificar si todos los pasos estan completos
  const todosCompletos = ob.pasos.every(p => p.completado);
  if (todosCompletos) {
    ob.estado = 'completado';
    ob.fechaFinReal = new Date();
  } else {
    ob.estado = 'en_progreso';
  }

  const siguientePaso = ob.pasos.find(p => !p.completado);

  return {
    ok: true,
    mensaje: `Paso '${paso.nombre}' completado exitosamente`,
    paso_completado: { id: paso.id, nombre: paso.nombre },
    siguiente_paso: siguientePaso ? { id: siguientePaso.id, nombre: siguientePaso.nombre } : null,
    onboarding_completado: todosCompletos,
    progreso_global_pct: Math.round(ob.pasos.reduce((s, p) => s + p.progreso_pct, 0) / ob.pasos.length)
  };
}

// ---------------------------------------------------------------------------
// importarDatos - Simula importacion CSV/Excel con validacion
// ---------------------------------------------------------------------------
function importarDatos(tenantId, tipo, datos) {
  const ob = onboardings.get(tenantId);
  if (!ob) {
    return { ok: false, error: `No se encontro onboarding para tenant: ${tenantId}` };
  }

  const tiposValidos = ['clientes', 'polizas', 'siniestros', 'agentes', 'peritos'];
  if (!tiposValidos.includes(tipo)) {
    return { ok: false, error: `Tipo de importacion no valido. Tipos permitidos: ${tiposValidos.join(', ')}` };
  }

  if (!Array.isArray(datos) || datos.length === 0) {
    return { ok: false, error: 'Los datos deben ser un array no vacio' };
  }

  // Simulacion de validacion
  const totalRegistros = datos.length;
  const errores = [];
  const warnings = [];
  let importados = 0;

  const validaciones = {
    clientes: { campos: ['nombre', 'dni', 'email'], nombre: 'cliente' },
    polizas: { campos: ['numero', 'tipo', 'titular'], nombre: 'poliza' },
    siniestros: { campos: ['numero', 'fecha', 'tipo'], nombre: 'siniestro' },
    agentes: { campos: ['nombre', 'codigo', 'email'], nombre: 'agente' },
    peritos: { campos: ['nombre', 'especialidad', 'zona'], nombre: 'perito' }
  };

  const validacion = validaciones[tipo];

  datos.forEach((registro, idx) => {
    const fila = idx + 1;
    let valido = true;

    // Verificar campos obligatorios
    for (const campo of validacion.campos) {
      if (!registro[campo] || String(registro[campo]).trim() === '') {
        errores.push({ fila, campo, mensaje: `Campo '${campo}' obligatorio vacio en ${validacion.nombre} fila ${fila}` });
        valido = false;
      }
    }

    // Validaciones especificas
    if (tipo === 'clientes' && registro.dni) {
      const dniRegex = /^[0-9]{8}[A-Z]$/;
      if (!dniRegex.test(registro.dni)) {
        warnings.push({ fila, campo: 'dni', mensaje: `DNI con formato sospechoso en fila ${fila}: ${registro.dni}` });
      }
    }

    if (tipo === 'clientes' && registro.email) {
      if (!registro.email.includes('@')) {
        errores.push({ fila, campo: 'email', mensaje: `Email invalido en fila ${fila}: ${registro.email}` });
        valido = false;
      }
    }

    if (registro.telefono && !/^\+?[0-9\s]{9,15}$/.test(registro.telefono)) {
      warnings.push({ fila, campo: 'telefono', mensaje: `Telefono con formato inusual en fila ${fila}` });
    }

    if (valido) {
      importados++;
    }
  });

  // Si no se pasan datos reales, simular resultados realistas
  if (totalRegistros <= 3) {
    // Simular una importacion mas grande
    const simulados = Math.floor(Math.random() * 3000) + 500;
    const erroresSimulados = Math.floor(simulados * 0.003);
    const warningsSimulados = Math.floor(simulados * 0.015);

    const resultado = {
      ok: true,
      tipo,
      total_registros: simulados,
      importados: simulados - erroresSimulados,
      errores: erroresSimulados,
      warnings: warningsSimulados,
      detalle_errores: errores.length > 0 ? errores : [
        { fila: 234, campo: 'email', mensaje: 'Email duplicado detectado' },
        { fila: 891, campo: 'dni', mensaje: 'DNI ya existe en el sistema' }
      ],
      detalle_warnings: warnings.length > 0 ? warnings : [
        { fila: 56, campo: 'telefono', mensaje: 'Telefono con formato internacional no estandar' },
        { fila: 1205, campo: 'direccion', mensaje: 'Codigo postal no coincide con provincia' }
      ],
      tiempo_proceso: (simulados * 0.002).toFixed(1) + 's',
      fecha: new Date()
    };

    ob.importaciones.push({
      tipo,
      fecha: new Date(),
      registros: resultado.importados,
      errores: resultado.errores,
      warnings: resultado.warnings
    });

    return resultado;
  }

  const resultado = {
    ok: true,
    tipo,
    total_registros: totalRegistros,
    importados,
    errores: errores.length,
    warnings: warnings.length,
    detalle_errores: errores.slice(0, 20),
    detalle_warnings: warnings.slice(0, 20),
    tiempo_proceso: (totalRegistros * 0.002).toFixed(1) + 's',
    fecha: new Date()
  };

  ob.importaciones.push({
    tipo,
    fecha: new Date(),
    registros: importados,
    errores: errores.length,
    warnings: warnings.length
  });

  return resultado;
}

// ---------------------------------------------------------------------------
// getChecklist - Checklist completo con estado
// ---------------------------------------------------------------------------
function getChecklist(tenantId) {
  const ob = onboardings.get(tenantId);
  if (!ob) {
    return { ok: false, error: `No se encontro onboarding para tenant: ${tenantId}` };
  }

  const checklist = ob.pasos.map((paso, idx) => {
    let estado = 'pendiente';
    if (paso.completado) {
      estado = 'completado';
    } else if (paso.progreso_pct > 0) {
      estado = 'en_progreso';
    } else if (idx > 0 && ob.pasos[idx - 1].completado) {
      estado = 'disponible';
    }

    // Sub-tareas por cada paso
    const subTareas = generarSubTareas(paso.id, paso.completado, paso.progreso_pct);

    return {
      orden: idx + 1,
      id: paso.id,
      nombre: paso.nombre,
      descripcion: paso.descripcion,
      estado,
      progreso_pct: paso.progreso_pct,
      tiempo_estimado: paso.tiempo_estimado,
      fechaCompletado: paso.fechaCompletado || null,
      notas: paso.notas,
      sub_tareas: subTareas
    };
  });

  const progreso = Math.round(ob.pasos.reduce((s, p) => s + p.progreso_pct, 0) / ob.pasos.length);

  return {
    ok: true,
    tenantId,
    empresa: ob.empresa.nombre,
    estado: ob.estado,
    progreso_global_pct: progreso,
    fecha_inicio: ob.fechaInicio,
    fecha_estimada_fin: ob.fechaEstimadaFin,
    checklist,
    importaciones_realizadas: ob.importaciones,
    resumen: {
      completados: ob.pasos.filter(p => p.completado).length,
      en_progreso: ob.pasos.filter(p => !p.completado && p.progreso_pct > 0).length,
      pendientes: ob.pasos.filter(p => !p.completado && p.progreso_pct === 0).length,
      total: ob.pasos.length
    }
  };
}

function generarSubTareas(pasoId, completado, progreso) {
  const subTareasPorPaso = {
    registro_empresa: [
      'Datos fiscales (CIF, razon social)',
      'Direccion y datos de contacto',
      'Logo y personalizacion de marca',
      'Configuracion de usuarios administradores'
    ],
    configuracion_productos: [
      'Definir lineas de seguro activas',
      'Configurar coberturas por producto',
      'Establecer franquicias y limites',
      'Configurar primas y tarifas base'
    ],
    importacion_clientes: [
      'Preparar plantilla CSV/Excel',
      'Mapear campos de datos',
      'Ejecutar importacion masiva',
      'Revisar y corregir errores'
    ],
    configuracion_reglas: [
      'Definir SLAs por tipo de siniestro',
      'Configurar flujos de aprobacion',
      'Establecer alertas y notificaciones',
      'Reglas de asignacion automatica'
    ],
    integraciones: [
      'Conectar con DGT / registros oficiales',
      'Configurar red de talleres y peritos',
      'Integrar pasarela de pagos',
      'Configurar APIs de terceros'
    ],
    formacion_equipo: [
      'Sesion para administradores',
      'Sesion para gestores de siniestros',
      'Sesion para supervisores',
      'Material de referencia y documentacion'
    ],
    pruebas: [
      'Casos de prueba de alta de siniestro',
      'Pruebas de flujo completo',
      'Pruebas de integraciones',
      'Validacion de informes y reportes'
    ],
    go_live: [
      'Migracion de datos finales',
      'Activacion del entorno productivo',
      'Verificacion post-activacion',
      'Monitorizacion primeras 24h'
    ]
  };

  const tareas = subTareasPorPaso[pasoId] || [];
  return tareas.map((tarea, idx) => {
    let subtareaCompletada = false;
    if (completado) {
      subtareaCompletada = true;
    } else if (progreso > 0) {
      subtareaCompletada = ((idx + 1) / tareas.length * 100) <= progreso;
    }
    return { descripcion: tarea, completado: subtareaCompletada };
  });
}

// ---------------------------------------------------------------------------
// Listar todos los onboardings (utilidad)
// ---------------------------------------------------------------------------
function listarOnboardings() {
  const lista = [];
  for (const [tenantId, ob] of onboardings) {
    const progreso = Math.round(ob.pasos.reduce((s, p) => s + p.progreso_pct, 0) / ob.pasos.length);
    lista.push({
      tenantId,
      empresa: ob.empresa.nombre,
      estado: ob.estado,
      progreso_global_pct: progreso,
      pasos_completados: ob.pasos.filter(p => p.completado).length,
      pasos_totales: ob.pasos.length,
      fecha_inicio: ob.fechaInicio
    });
  }
  return { ok: true, total: lista.length, onboardings: lista };
}

module.exports = {
  iniciarOnboarding,
  getProgreso,
  completarPaso,
  importarDatos,
  getChecklist,
  listarOnboardings,
  PASOS_ONBOARDING,
  TIEMPO_TOTAL_HORAS
};
