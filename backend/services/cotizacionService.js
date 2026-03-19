// =============================================================================
// SERVICIO DE COTIZACION Y SUSCRIPCION AUTOMATICA
// Calculo actuarial, emision de polizas y gestion de productos
// =============================================================================

// ---------------------------------------------------------------------------
// Catalogo de productos con 3 niveles cada uno
// ---------------------------------------------------------------------------
const productos = {
  auto: {
    nombre: 'Seguro de Automovil',
    codigo: 'AUTO',
    tiers: {
      basica: {
        nombre: 'Terceros Basico',
        coberturas: ['Responsabilidad civil obligatoria', 'Defensa juridica', 'Asistencia en carretera basica'],
        precio_base: 280,
        precio_max: 550
      },
      completa: {
        nombre: 'Terceros Ampliado',
        coberturas: ['Responsabilidad civil obligatoria', 'Defensa juridica', 'Asistencia en carretera 24h',
          'Robo e incendio', 'Lunas', 'Danos propios parciales'],
        precio_base: 450,
        precio_max: 850
      },
      premium: {
        nombre: 'Todo Riesgo',
        coberturas: ['Responsabilidad civil obligatoria', 'Defensa juridica', 'Asistencia en carretera premium',
          'Robo e incendio', 'Lunas', 'Danos propios totales', 'Vehiculo de sustitucion',
          'Conductor asegurado 100.000 EUR', 'Accidentes sin franquicia'],
        precio_base: 650,
        precio_max: 1200
      }
    },
    factores: ['edad_conductor', 'anos_carnet', 'zona', 'valor_vehiculo', 'tipo_vehiculo', 'historial_siniestros']
  },
  hogar: {
    nombre: 'Seguro de Hogar',
    codigo: 'HOGAR',
    tiers: {
      basica: {
        nombre: 'Hogar Esencial',
        coberturas: ['Incendio', 'Agua', 'Responsabilidad civil', 'Robo basico'],
        precio_base: 180,
        precio_max: 320
      },
      completa: {
        nombre: 'Hogar Confort',
        coberturas: ['Incendio', 'Agua', 'Responsabilidad civil', 'Robo ampliado',
          'Danos electricos', 'Cristales', 'Asistencia hogar 24h', 'Defensa juridica'],
        precio_base: 300,
        precio_max: 480
      },
      premium: {
        nombre: 'Hogar Premium',
        coberturas: ['Incendio', 'Agua', 'Responsabilidad civil ampliada', 'Robo total',
          'Danos electricos', 'Cristales', 'Asistencia hogar premium', 'Defensa juridica',
          'Alimentos congelados', 'Jardin y piscina', 'Objetos de valor', 'Inhabilitabilidad'],
        precio_base: 420,
        precio_max: 600
      }
    },
    factores: ['zona', 'metros_cuadrados', 'valor_contenido', 'valor_continente', 'planta', 'alarma']
  },
  vida: {
    nombre: 'Seguro de Vida',
    codigo: 'VIDA',
    tiers: {
      basica: {
        nombre: 'Vida Basico',
        coberturas: ['Fallecimiento por cualquier causa', 'Capital 50.000 EUR'],
        precio_base: 120,
        precio_max: 350
      },
      completa: {
        nombre: 'Vida Proteccion',
        coberturas: ['Fallecimiento por cualquier causa', 'Invalidez absoluta y permanente',
          'Invalidez parcial', 'Capital hasta 150.000 EUR'],
        precio_base: 280,
        precio_max: 550
      },
      premium: {
        nombre: 'Vida Total',
        coberturas: ['Fallecimiento por cualquier causa', 'Invalidez absoluta y permanente',
          'Invalidez parcial', 'Enfermedades graves', 'Doble capital por accidente',
          'Capital hasta 300.000 EUR', 'Anticipo por enfermedad terminal'],
        precio_base: 450,
        precio_max: 800
      }
    },
    factores: ['edad', 'fumador', 'profesion_riesgo', 'capital_asegurado', 'historial_medico']
  },
  salud: {
    nombre: 'Seguro de Salud',
    codigo: 'SALUD',
    tiers: {
      basica: {
        nombre: 'Salud Esencial',
        coberturas: ['Medicina general', 'Urgencias', 'Hospitalizacion basica', 'Especialistas con copago'],
        precio_base: 350,
        precio_max: 650
      },
      completa: {
        nombre: 'Salud Completo',
        coberturas: ['Medicina general', 'Urgencias', 'Hospitalizacion', 'Especialistas sin copago',
          'Pruebas diagnosticas', 'Rehabilitacion', 'Salud mental basica'],
        precio_base: 650,
        precio_max: 1050
      },
      premium: {
        nombre: 'Salud Premium',
        coberturas: ['Medicina general', 'Urgencias', 'Hospitalizacion habitacion individual',
          'Especialistas sin copago', 'Pruebas diagnosticas avanzadas', 'Rehabilitacion completa',
          'Salud mental completa', 'Dental basico', 'Segunda opinion medica internacional',
          'Telemedicina 24h', 'Medicina preventiva'],
        precio_base: 950,
        precio_max: 1500
      }
    },
    factores: ['edad', 'numero_asegurados', 'historial_medico', 'zona']
  }
};

// ---------------------------------------------------------------------------
// Polizas ya emitidas este mes
// ---------------------------------------------------------------------------
const polizasEmitidas = [
  {
    numero_poliza: 'POL-AUTO-2026-0301', tipo: 'auto', tier: 'completa',
    tomador: 'Raul Mendez Garcia', dni: '12345678A',
    prima_anual: 520.00, fecha_emision: '2026-03-01', fecha_efecto: '2026-03-15',
    estado: 'vigente', forma_pago: 'anual'
  },
  {
    numero_poliza: 'POL-HOGAR-2026-0302', tipo: 'hogar', tier: 'premium',
    tomador: 'Sofia Blanco Reyes', dni: '23456789B',
    prima_anual: 485.00, fecha_emision: '2026-03-03', fecha_efecto: '2026-03-03',
    estado: 'vigente', forma_pago: 'semestral'
  },
  {
    numero_poliza: 'POL-VIDA-2026-0303', tipo: 'vida', tier: 'completa',
    tomador: 'Manuel Ortiz Prieto', dni: '34567890C',
    prima_anual: 345.00, fecha_emision: '2026-03-05', fecha_efecto: '2026-04-01',
    estado: 'vigente', forma_pago: 'anual'
  },
  {
    numero_poliza: 'POL-SALUD-2026-0304', tipo: 'salud', tier: 'completa',
    tomador: 'Cristina Vega Molina', dni: '45678901D',
    prima_anual: 780.00, fecha_emision: '2026-03-07', fecha_efecto: '2026-03-07',
    estado: 'vigente', forma_pago: 'trimestral'
  },
  {
    numero_poliza: 'POL-AUTO-2026-0305', tipo: 'auto', tier: 'premium',
    tomador: 'Alejandro Ruiz Santos', dni: '56789012E',
    prima_anual: 890.00, fecha_emision: '2026-03-10', fecha_efecto: '2026-03-10',
    estado: 'vigente', forma_pago: 'anual'
  },
  {
    numero_poliza: 'POL-HOGAR-2026-0306', tipo: 'hogar', tier: 'basica',
    tomador: 'Beatriz Lopez Fernandez', dni: '67890123F',
    prima_anual: 215.00, fecha_emision: '2026-03-12', fecha_efecto: '2026-03-15',
    estado: 'vigente', forma_pago: 'anual'
  },
  {
    numero_poliza: 'POL-SALUD-2026-0307', tipo: 'salud', tier: 'premium',
    tomador: 'Gonzalo Martin Diaz', dni: '78901234G',
    prima_anual: 1250.00, fecha_emision: '2026-03-14', fecha_efecto: '2026-04-01',
    estado: 'vigente', forma_pago: 'mensual'
  },
  {
    numero_poliza: 'POL-VIDA-2026-0308', tipo: 'vida', tier: 'basica',
    tomador: 'Teresa Sanchez Gil', dni: '89012345H',
    prima_anual: 155.00, fecha_emision: '2026-03-17', fecha_efecto: '2026-03-17',
    estado: 'vigente', forma_pago: 'anual'
  },
  {
    numero_poliza: 'POL-AUTO-2026-0309', tipo: 'auto', tier: 'basica',
    tomador: 'Victor Navarro Cruz', dni: '90123456J',
    prima_anual: 310.00, fecha_emision: '2026-03-18', fecha_efecto: '2026-03-18',
    estado: 'vigente', forma_pago: 'semestral'
  }
];

let contadorPolizas = 310;

// ---------------------------------------------------------------------------
// Tablas de factores actuariales
// ---------------------------------------------------------------------------
const factoresZona = {
  madrid: 1.15, barcelona: 1.12, valencia: 1.05, sevilla: 1.03,
  bilbao: 1.08, malaga: 1.04, zaragoza: 0.98, rural: 0.85, otro: 1.00
};

const factoresEdad = {
  auto: (edad) => {
    if (edad < 25) return 1.45;
    if (edad < 30) return 1.20;
    if (edad < 45) return 1.00;
    if (edad < 60) return 0.95;
    if (edad < 70) return 1.10;
    return 1.25;
  },
  vida: (edad) => {
    if (edad < 30) return 0.70;
    if (edad < 40) return 0.85;
    if (edad < 50) return 1.00;
    if (edad < 60) return 1.35;
    if (edad < 70) return 1.80;
    return 2.50;
  },
  salud: (edad) => {
    if (edad < 30) return 0.80;
    if (edad < 40) return 0.90;
    if (edad < 50) return 1.00;
    if (edad < 60) return 1.25;
    if (edad < 70) return 1.60;
    return 2.00;
  }
};

const factoresTipoVehiculo = {
  turismo: 1.00, suv: 1.10, deportivo: 1.40, furgoneta: 1.15,
  monovolumen: 1.05, electrico: 0.90, hibrido: 0.95
};

// ---------------------------------------------------------------------------
// calcularPrima - Calculo actuarial con multiples factores
// ---------------------------------------------------------------------------
function calcularPrima(datos) {
  const { tipo_producto, tier, edad, zona, historial_siniestros } = datos;

  if (!productos[tipo_producto]) {
    return { error: true, mensaje: 'Producto no valido. Disponibles: auto, hogar, vida, salud' };
  }
  const producto = productos[tipo_producto];
  const nivel = producto.tiers[tier || 'basica'];
  if (!nivel) {
    return { error: true, mensaje: 'Nivel no valido. Disponibles: basica, completa, premium' };
  }

  let prima = nivel.precio_base;
  const desglose = [];

  // Factor zona
  const zonaKey = (zona || 'otro').toLowerCase();
  const fZona = factoresZona[zonaKey] || 1.00;
  prima *= fZona;
  desglose.push({ factor: 'Zona (' + (zona || 'otro') + ')', multiplicador: fZona });

  // Factor edad (segun producto)
  if (edad && factoresEdad[tipo_producto]) {
    const fEdad = factoresEdad[tipo_producto](edad);
    prima *= fEdad;
    desglose.push({ factor: 'Edad (' + edad + ' anos)', multiplicador: fEdad });
  }

  // Historial de siniestros
  const siniestros = historial_siniestros || 0;
  if (siniestros > 0) {
    const fHistorial = 1 + (siniestros * 0.12);
    prima *= fHistorial;
    desglose.push({ factor: 'Historial (' + siniestros + ' siniestros)', multiplicador: fHistorial });
  }

  // Factores especificos por producto
  if (tipo_producto === 'auto') {
    const tipoVeh = (datos.tipo_vehiculo || 'turismo').toLowerCase();
    const fVehiculo = factoresTipoVehiculo[tipoVeh] || 1.00;
    prima *= fVehiculo;
    desglose.push({ factor: 'Tipo vehiculo (' + tipoVeh + ')', multiplicador: fVehiculo });

    if (datos.valor_vehiculo) {
      const fValor = datos.valor_vehiculo > 40000 ? 1.30
        : datos.valor_vehiculo > 25000 ? 1.15
        : datos.valor_vehiculo > 15000 ? 1.05
        : 0.95;
      prima *= fValor;
      desglose.push({ factor: 'Valor vehiculo (' + datos.valor_vehiculo + ' EUR)', multiplicador: fValor });
    }

    if (datos.anos_carnet && datos.anos_carnet < 3) {
      prima *= 1.25;
      desglose.push({ factor: 'Conductor novel (' + datos.anos_carnet + ' anos carnet)', multiplicador: 1.25 });
    }
  }

  if (tipo_producto === 'hogar') {
    if (datos.metros_cuadrados) {
      const fMetros = datos.metros_cuadrados > 150 ? 1.25
        : datos.metros_cuadrados > 100 ? 1.10
        : datos.metros_cuadrados > 60 ? 1.00
        : 0.90;
      prima *= fMetros;
      desglose.push({ factor: 'Superficie (' + datos.metros_cuadrados + ' m2)', multiplicador: fMetros });
    }
    if (datos.alarma) {
      prima *= 0.90;
      desglose.push({ factor: 'Sistema de alarma', multiplicador: 0.90 });
    }
    if (datos.valor_contenido && datos.valor_contenido > 30000) {
      const fContenido = 1 + ((datos.valor_contenido - 30000) / 100000) * 0.30;
      prima *= fContenido;
      desglose.push({ factor: 'Valor contenido (' + datos.valor_contenido + ' EUR)', multiplicador: Math.round(fContenido * 100) / 100 });
    }
  }

  if (tipo_producto === 'vida') {
    if (datos.fumador) {
      prima *= 1.40;
      desglose.push({ factor: 'Fumador', multiplicador: 1.40 });
    }
    if (datos.profesion_riesgo) {
      prima *= 1.35;
      desglose.push({ factor: 'Profesion de riesgo', multiplicador: 1.35 });
    }
    if (datos.capital_asegurado) {
      const fCapital = datos.capital_asegurado / 50000;
      prima *= fCapital;
      desglose.push({ factor: 'Capital (' + datos.capital_asegurado + ' EUR)', multiplicador: Math.round(fCapital * 100) / 100 });
    }
  }

  if (tipo_producto === 'salud') {
    if (datos.numero_asegurados && datos.numero_asegurados > 1) {
      const fFamilia = 1 + ((datos.numero_asegurados - 1) * 0.65);
      prima *= fFamilia;
      desglose.push({ factor: 'Asegurados (' + datos.numero_asegurados + ' personas)', multiplicador: Math.round(fFamilia * 100) / 100 });
    }
  }

  // Aplicar limites del tier
  prima = Math.max(nivel.precio_base, Math.min(nivel.precio_max, Math.round(prima * 100) / 100));

  const primaMensual = Math.round((prima / 12) * 100) / 100;
  const primaTrimestral = Math.round((prima / 4) * 100) / 100;
  const primaSemestral = Math.round((prima / 2) * 100) / 100;

  return {
    producto: producto.nombre,
    tier: tier || 'basica',
    tier_nombre: nivel.nombre,
    coberturas: nivel.coberturas,
    prima_anual: prima,
    prima_semestral: primaSemestral,
    prima_trimestral: primaTrimestral,
    prima_mensual: primaMensual,
    desglose_factores: desglose,
    impuestos_incluidos: false,
    prima_anual_con_ips: Math.round(prima * 1.0804 * 100) / 100,  // IPS 8.04% seguros no vida
    moneda: 'EUR',
    valida_hasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
}

// ---------------------------------------------------------------------------
// getProductosDisponibles - Catalogo completo
// ---------------------------------------------------------------------------
function getProductosDisponibles() {
  const catalogo = [];
  for (const [key, prod] of Object.entries(productos)) {
    const tiers = [];
    for (const [tierKey, tierData] of Object.entries(prod.tiers)) {
      tiers.push({
        nivel: tierKey,
        nombre: tierData.nombre,
        coberturas: tierData.coberturas,
        rango_precios: tierData.precio_base + ' - ' + tierData.precio_max + ' EUR/ano',
        desde_mensual: Math.round((tierData.precio_base / 12) * 100) / 100 + ' EUR/mes'
      });
    }
    catalogo.push({
      codigo: prod.codigo,
      tipo: key,
      nombre: prod.nombre,
      niveles: tiers,
      factores_aplicables: prod.factores
    });
  }
  return catalogo;
}

// ---------------------------------------------------------------------------
// getPreguntas - Preguntas dinamicas segun tipo de producto
// ---------------------------------------------------------------------------
function getPreguntas(tipoProducto) {
  const preguntasBase = [
    { id: 'nombre', texto: '¿Cual es su nombre completo?', tipo: 'texto', obligatoria: true },
    { id: 'dni', texto: '¿Cual es su DNI/NIE?', tipo: 'texto', obligatoria: true },
    { id: 'email', texto: '¿Cual es su correo electronico?', tipo: 'email', obligatoria: true },
    { id: 'telefono', texto: '¿Cual es su numero de telefono?', tipo: 'telefono', obligatoria: true },
    { id: 'zona', texto: '¿En que ciudad reside?', tipo: 'seleccion', opciones: Object.keys(factoresZona), obligatoria: true },
    { id: 'fecha_efecto', texto: '¿Desde que fecha desea que tenga efecto la poliza?', tipo: 'fecha', obligatoria: true }
  ];

  const preguntasEspecificas = {
    auto: [
      { id: 'edad', texto: '¿Cual es la edad del conductor principal?', tipo: 'numero', obligatoria: true, min: 18, max: 85 },
      { id: 'anos_carnet', texto: '¿Cuantos anos de carnet tiene?', tipo: 'numero', obligatoria: true, min: 0 },
      { id: 'tipo_vehiculo', texto: '¿Que tipo de vehiculo es?', tipo: 'seleccion', opciones: Object.keys(factoresTipoVehiculo), obligatoria: true },
      { id: 'valor_vehiculo', texto: '¿Cual es el valor del vehiculo en EUR?', tipo: 'numero', obligatoria: true, min: 1000 },
      { id: 'matricula', texto: '¿Cual es la matricula?', tipo: 'texto', obligatoria: true },
      { id: 'marca_modelo', texto: '¿Marca y modelo del vehiculo?', tipo: 'texto', obligatoria: true },
      { id: 'historial_siniestros', texto: '¿Cuantos siniestros ha tenido en los ultimos 5 anos?', tipo: 'numero', obligatoria: true, min: 0 },
      { id: 'tier', texto: '¿Que nivel de cobertura desea?', tipo: 'seleccion', opciones: ['basica', 'completa', 'premium'], obligatoria: true }
    ],
    hogar: [
      { id: 'direccion', texto: '¿Cual es la direccion de la vivienda?', tipo: 'texto', obligatoria: true },
      { id: 'metros_cuadrados', texto: '¿Cuantos metros cuadrados tiene la vivienda?', tipo: 'numero', obligatoria: true, min: 20 },
      { id: 'valor_contenido', texto: '¿Cual es el valor estimado del contenido en EUR?', tipo: 'numero', obligatoria: true },
      { id: 'valor_continente', texto: '¿Cual es el valor del inmueble en EUR?', tipo: 'numero', obligatoria: true },
      { id: 'planta', texto: '¿En que planta se encuentra?', tipo: 'numero', obligatoria: false },
      { id: 'alarma', texto: '¿Dispone de sistema de alarma?', tipo: 'booleano', obligatoria: true },
      { id: 'historial_siniestros', texto: '¿Ha tenido algun siniestro en el hogar en los ultimos 5 anos?', tipo: 'numero', obligatoria: true, min: 0 },
      { id: 'tier', texto: '¿Que nivel de cobertura desea?', tipo: 'seleccion', opciones: ['basica', 'completa', 'premium'], obligatoria: true }
    ],
    vida: [
      { id: 'edad', texto: '¿Cual es su edad?', tipo: 'numero', obligatoria: true, min: 18, max: 75 },
      { id: 'capital_asegurado', texto: '¿Que capital desea asegurar en EUR?', tipo: 'numero', obligatoria: true, min: 10000, max: 300000 },
      { id: 'fumador', texto: '¿Es fumador?', tipo: 'booleano', obligatoria: true },
      { id: 'profesion_riesgo', texto: '¿Su profesion implica riesgo elevado?', tipo: 'booleano', obligatoria: true },
      { id: 'historial_medico', texto: '¿Tiene alguna enfermedad preexistente relevante?', tipo: 'texto', obligatoria: false },
      { id: 'beneficiarios', texto: '¿Quien sera el beneficiario?', tipo: 'texto', obligatoria: true },
      { id: 'tier', texto: '¿Que nivel de cobertura desea?', tipo: 'seleccion', opciones: ['basica', 'completa', 'premium'], obligatoria: true }
    ],
    salud: [
      { id: 'edad', texto: '¿Cual es la edad del asegurado principal?', tipo: 'numero', obligatoria: true, min: 0, max: 85 },
      { id: 'numero_asegurados', texto: '¿Cuantas personas desea asegurar?', tipo: 'numero', obligatoria: true, min: 1, max: 8 },
      { id: 'historial_medico', texto: '¿Alguno de los asegurados tiene enfermedades preexistentes?', tipo: 'texto', obligatoria: false },
      { id: 'medico_habitual', texto: '¿Tiene algun medico o centro de preferencia?', tipo: 'texto', obligatoria: false },
      { id: 'tier', texto: '¿Que nivel de cobertura desea?', tipo: 'seleccion', opciones: ['basica', 'completa', 'premium'], obligatoria: true }
    ]
  };

  if (!preguntasEspecificas[tipoProducto]) {
    return { error: true, mensaje: 'Tipo de producto no valido. Disponibles: auto, hogar, vida, salud' };
  }

  return {
    tipo_producto: tipoProducto,
    producto: productos[tipoProducto].nombre,
    preguntas: [...preguntasBase, ...preguntasEspecificas[tipoProducto]],
    total_preguntas: preguntasBase.length + preguntasEspecificas[tipoProducto].length
  };
}

// ---------------------------------------------------------------------------
// emitirPoliza - Emision automatica de poliza
// ---------------------------------------------------------------------------
function emitirPoliza(datos) {
  const { tipo_producto, tier, nombre, dni, email, telefono, zona, fecha_efecto } = datos;

  if (!tipo_producto || !nombre || !dni) {
    return { error: true, mensaje: 'Datos obligatorios: tipo_producto, nombre, dni' };
  }

  // Calcular prima
  const cotizacion = calcularPrima(datos);
  if (cotizacion.error) return cotizacion;

  // Generar numero de poliza
  contadorPolizas++;
  const codigoProducto = (productos[tipo_producto] && productos[tipo_producto].codigo) || 'GEN';
  const numeroPoliza = 'POL-' + codigoProducto + '-2026-0' + contadorPolizas;

  const formaPago = datos.forma_pago || 'anual';
  const primaSegunPago = {
    anual: cotizacion.prima_anual,
    semestral: cotizacion.prima_semestral,
    trimestral: cotizacion.prima_trimestral,
    mensual: cotizacion.prima_mensual
  };

  const fechaEfecto = fecha_efecto || new Date().toISOString().split('T')[0];
  const fechaVencimiento = new Date(new Date(fechaEfecto).getTime() + 365 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  const poliza = {
    numero_poliza: numeroPoliza,
    tipo: tipo_producto,
    tier: tier || 'basica',
    tier_nombre: cotizacion.tier_nombre,
    tomador: nombre,
    dni,
    email: email || '',
    telefono: telefono || '',
    coberturas: cotizacion.coberturas,
    prima_anual: cotizacion.prima_anual,
    prima_anual_con_ips: cotizacion.prima_anual_con_ips,
    forma_pago: formaPago,
    importe_recibo: primaSegunPago[formaPago] || cotizacion.prima_anual,
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_efecto: fechaEfecto,
    fecha_vencimiento: fechaVencimiento,
    estado: 'vigente',
    documentacion: [
      { tipo: 'poliza', nombre: 'Condiciones Particulares - ' + numeroPoliza + '.pdf', generado: true },
      { tipo: 'condiciones', nombre: 'Condiciones Generales ' + codigoProducto + '.pdf', generado: true },
      { tipo: 'recibo', nombre: 'Recibo Prima - ' + numeroPoliza + '.pdf', generado: true },
      { tipo: 'tarjeta', nombre: 'Tarjeta Asegurado - ' + numeroPoliza + '.pdf', generado: true }
    ]
  };

  // Almacenar
  polizasEmitidas.push(poliza);

  return {
    exito: true,
    mensaje: 'Poliza emitida correctamente',
    poliza,
    siguiente_pasos: [
      'Documentacion enviada a ' + (email || 'email del tomador'),
      'Primer recibo domiciliado para ' + fechaEfecto,
      'Puede descargar su tarjeta de asegurado desde la app'
    ]
  };
}

// ---------------------------------------------------------------------------
// getEstadisticas - Metricas de cotizacion y emision
// ---------------------------------------------------------------------------
function getEstadisticas() {
  const hoy = new Date().toISOString().split('T')[0];
  const polizasHoy = polizasEmitidas.filter(p => p.fecha_emision === hoy);
  const primaTotal = polizasEmitidas.reduce((sum, p) => sum + p.prima_anual, 0);
  const ticketMedio = polizasEmitidas.length > 0 ? Math.round(primaTotal / polizasEmitidas.length * 100) / 100 : 0;

  const porProducto = {};
  for (const p of polizasEmitidas) {
    if (!porProducto[p.tipo]) {
      porProducto[p.tipo] = { cantidad: 0, prima_total: 0 };
    }
    porProducto[p.tipo].cantidad++;
    porProducto[p.tipo].prima_total = Math.round((porProducto[p.tipo].prima_total + p.prima_anual) * 100) / 100;
  }

  const porTier = {};
  for (const p of polizasEmitidas) {
    if (!porTier[p.tier]) {
      porTier[p.tier] = { cantidad: 0, prima_total: 0 };
    }
    porTier[p.tier].cantidad++;
    porTier[p.tier].prima_total = Math.round((porTier[p.tier].prima_total + p.prima_anual) * 100) / 100;
  }

  return {
    polizas_emitidas_hoy: polizasHoy.length,
    polizas_emitidas_mes: polizasEmitidas.length,
    prima_total_mes: Math.round(primaTotal * 100) / 100,
    ticket_medio: ticketMedio,
    desglose_por_producto: porProducto,
    desglose_por_tier: porTier,
    ultima_poliza: polizasEmitidas.length > 0 ? polizasEmitidas[polizasEmitidas.length - 1] : null,
    polizas_recientes: polizasEmitidas.slice(-5).reverse()
  };
}

module.exports = {
  calcularPrima,
  getProductosDisponibles,
  getPreguntas,
  emitirPoliza,
  getEstadisticas
};
