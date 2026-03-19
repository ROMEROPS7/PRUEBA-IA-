// =============================================================================
// SERVICIO DE PERITACION VIRTUAL - Evaluacion automatizada de siniestros
// =============================================================================

// ---------------------------------------------------------------------------
// CATALOGO DE TIPOS DE DANO Y RANGOS DE COSTE
// ---------------------------------------------------------------------------
const tiposDano = {
  abolladuras: {
    nombre: 'Abolladuras',
    descripcion: 'Deformaciones en la carroceria del vehiculo por impacto',
    coste_min: 200,
    coste_max: 800,
    tiempo_reparacion_dias: 2,
    proveedor_tipo: 'chapa_y_pintura',
  },
  rotura_cristal: {
    nombre: 'Rotura de cristal o luna',
    descripcion: 'Rotura, fisura o astillamiento de lunas, parabrisas o cristales laterales',
    coste_min: 150,
    coste_max: 400,
    tiempo_reparacion_dias: 1,
    proveedor_tipo: 'cristaleria_auto',
  },
  pintura: {
    nombre: 'Danos en pintura',
    descripcion: 'Rayaduras, desconchones, decoloracion o dano por impacto en la pintura',
    coste_min: 300,
    coste_max: 1200,
    tiempo_reparacion_dias: 3,
    proveedor_tipo: 'chapa_y_pintura',
  },
  mecanica: {
    nombre: 'Averia mecanica',
    descripcion: 'Danos en motor, transmision, suspension u otros componentes mecanicos',
    coste_min: 500,
    coste_max: 3000,
    tiempo_reparacion_dias: 5,
    proveedor_tipo: 'taller_mecanico',
  },
  agua: {
    nombre: 'Danos por agua',
    descripcion: 'Filtraciones, inundaciones, roturas de tuberias y danos derivados por humedad',
    coste_min: 800,
    coste_max: 5000,
    tiempo_reparacion_dias: 7,
    proveedor_tipo: 'reparacion_hogar',
  },
  fuego: {
    nombre: 'Danos por fuego',
    descripcion: 'Incendio, explosion, humo o carbonizacion de bienes muebles e inmuebles',
    coste_min: 2000,
    coste_max: 15000,
    tiempo_reparacion_dias: 30,
    proveedor_tipo: 'restauracion_siniestros',
  },
  robo_contenido: {
    nombre: 'Robo de contenido',
    descripcion: 'Sustraccion de bienes muebles, electronica, joyas u objetos de valor',
    coste_min: 500,
    coste_max: 8000,
    tiempo_reparacion_dias: 0,
    proveedor_tipo: 'no_aplica',
  },
  electrico: {
    nombre: 'Dano electrico',
    descripcion: 'Sobretension, cortocircuito o fallo en la instalacion electrica',
    coste_min: 300,
    coste_max: 2500,
    tiempo_reparacion_dias: 3,
    proveedor_tipo: 'electricista',
  },
  estructural: {
    nombre: 'Dano estructural',
    descripcion: 'Grietas, fisuras o danos en elementos portantes del edificio',
    coste_min: 1500,
    coste_max: 12000,
    tiempo_reparacion_dias: 20,
    proveedor_tipo: 'obra_civil',
  },
};

// ---------------------------------------------------------------------------
// UMBRALES DE DECISION AUTOMATICA
// ---------------------------------------------------------------------------
const UMBRAL_COSTE_APROBACION_AUTO = 3000;
const UMBRAL_CONFIANZA_APROBACION_AUTO = 85;
const COSTE_PERITACION_VIRTUAL = 180;
const COSTE_PERITACION_FISICA = 450;

// ---------------------------------------------------------------------------
// PERITACIONES PRE-POPULADAS
// ---------------------------------------------------------------------------
const peritaciones = [
  {
    id: 'PER-V-001',
    siniestroId: 'SIN-2024-0015',
    clienteId: 'CLI-001',
    tipo_dano: 'abolladuras',
    fecha: '2024-03-15',
    estado: 'completada',
    coste_estimado: 450,
    confianza: 92,
    aprobado_auto: true,
    duracion_minutos: 12,
    resultado: 'Abolladura lateral en puerta delantera derecha de 15x8 cm. Sin afectacion de pintura profunda. Reparacion PDR (Paintless Dent Repair) recomendada.',
  },
  {
    id: 'PER-V-002',
    siniestroId: 'SIN-2024-0022',
    clienteId: 'CLI-002',
    tipo_dano: 'agua',
    fecha: '2024-04-20',
    estado: 'completada',
    coste_estimado: 2800,
    confianza: 88,
    aprobado_auto: true,
    duracion_minutos: 25,
    resultado: 'Filtracion en bano principal por junta deteriorada en la banadera. Danos en suelo de tarima (6 m2), rodapie y pared contigua. Requiere fontanero, solador y pintor.',
  },
  {
    id: 'PER-V-003',
    siniestroId: 'SIN-2024-0028',
    clienteId: 'CLI-005',
    tipo_dano: 'rotura_cristal',
    fecha: '2024-05-10',
    estado: 'completada',
    coste_estimado: 320,
    confianza: 96,
    aprobado_auto: true,
    duracion_minutos: 8,
    resultado: 'Parabrisas delantero con impacto de piedra. Fisura de 25 cm desde el punto de impacto. Sustitucion completa necesaria. Luna original con sensor de lluvia.',
  },
  {
    id: 'PER-V-004',
    siniestroId: 'SIN-2024-0035',
    clienteId: 'CLI-009',
    tipo_dano: 'fuego',
    fecha: '2024-06-05',
    estado: 'completada',
    coste_estimado: 8500,
    confianza: 78,
    aprobado_auto: false,
    duracion_minutos: 35,
    resultado: 'Conato de incendio en cocina del restaurante. Danos en campana extractora, techo (12 m2), pintura de paredes y sistema electrico de iluminacion. Requiere peritacion fisica complementaria por la complejidad de los danos.',
  },
  {
    id: 'PER-V-005',
    siniestroId: 'SIN-2024-0042',
    clienteId: 'CLI-011',
    tipo_dano: 'robo_contenido',
    fecha: '2024-07-12',
    estado: 'completada',
    coste_estimado: 3500,
    confianza: 72,
    aprobado_auto: false,
    duracion_minutos: 20,
    resultado: 'Robo en garaje del chalet. Dos bicicletas de montana (valoradas en 1.200 EUR y 900 EUR), herramientas electricas (800 EUR) y equipo de jardineria (600 EUR). Signos de forzamiento en cerradura lateral. Confianza limitada por imposibilidad de verificar precios declarados.',
  },
  {
    id: 'PER-V-006',
    siniestroId: 'SIN-2024-0048',
    clienteId: 'CLI-001',
    tipo_dano: 'pintura',
    fecha: '2024-07-25',
    estado: 'completada',
    coste_estimado: 680,
    confianza: 91,
    aprobado_auto: true,
    duracion_minutos: 10,
    resultado: 'Rayaduras profundas en lateral izquierdo (puerta delantera y trasera) causadas por llave o objeto punzante. Longitud total 85 cm. Requiere lijado, aparejo y repintado de ambas puertas.',
  },
  {
    id: 'PER-V-007',
    siniestroId: 'SIN-2024-0055',
    clienteId: 'CLI-004',
    tipo_dano: 'electrico',
    fecha: '2024-08-08',
    estado: 'completada',
    coste_estimado: 1200,
    confianza: 87,
    aprobado_auto: true,
    duracion_minutos: 18,
    resultado: 'Sobretension por caida de rayo. Danos en televisor Samsung 55" (inutilizado), router, base de enchufe multiple y sistema domotico del salon. La instalacion electrica general no presenta danos.',
  },
  {
    id: 'PER-V-008',
    siniestroId: 'SIN-2024-0062',
    clienteId: 'CLI-002',
    tipo_dano: 'mecanica',
    fecha: '2024-08-22',
    estado: 'completada',
    coste_estimado: 1850,
    confianza: 83,
    aprobado_auto: false,
    duracion_minutos: 22,
    resultado: 'Rotura de suspension delantera derecha (amortiguador y muelle) y deformacion del brazo de direccion tras caida en bache profundo. Las fotos del bache corroboran la declaracion. No obstante, confianza por debajo del umbral para aprobacion automatica.',
  },
  {
    id: 'PER-V-009',
    siniestroId: 'SIN-2024-0068',
    clienteId: 'CLI-015',
    tipo_dano: 'agua',
    fecha: '2024-09-05',
    estado: 'completada',
    coste_estimado: 4200,
    confianza: 90,
    aprobado_auto: false,
    duracion_minutos: 30,
    resultado: 'Inundacion en zona de foso del taller mecanico por rotura de tuberia de agua general. Danos en suelo, herramientas sumergidas, cuadro electrico secundario y stock de aceites. Importe supera umbral de aprobacion automatica.',
  },
  {
    id: 'PER-V-010',
    siniestroId: 'SIN-2024-0075',
    clienteId: 'CLI-010',
    tipo_dano: 'abolladuras',
    fecha: '2024-09-18',
    estado: 'completada',
    coste_estimado: 350,
    confianza: 94,
    aprobado_auto: true,
    duracion_minutos: 9,
    resultado: 'Abolladura en paragolpes trasero por alcance a baja velocidad en semaforo. Dano localizado de 20x12 cm sin rotura del plastico. Reparacion por calor y traccion.',
  },
  {
    id: 'PER-V-011',
    siniestroId: 'SIN-2024-0082',
    clienteId: 'CLI-006',
    tipo_dano: 'estructural',
    fecha: '2024-10-02',
    estado: 'en_curso',
    coste_estimado: null,
    confianza: null,
    aprobado_auto: null,
    duracion_minutos: null,
    resultado: null,
  },
  {
    id: 'PER-V-012',
    siniestroId: 'SIN-2024-0088',
    clienteId: 'CLI-008',
    tipo_dano: 'robo_contenido',
    fecha: '2024-10-10',
    estado: 'completada',
    coste_estimado: 950,
    confianza: 89,
    aprobado_auto: true,
    duracion_minutos: 15,
    resultado: 'Robo de telefono movil iPhone 15 Pro y cartera con documentacion en transporte publico. Denuncia policial aportada. Valor de mercado del terminal verificado en 1.199 EUR, aplicando depreciacion por uso (6 meses): 950 EUR.',
  },
];

// ---------------------------------------------------------------------------
// FUNCIONES INTERNAS
// ---------------------------------------------------------------------------

/**
 * Genera un coste aleatorio dentro del rango de un tipo de dano.
 */
function _generarCosteEstimado(tipoDano) {
  const tipo = tiposDano[tipoDano];
  if (!tipo) return 1000;
  return Math.round(tipo.coste_min + Math.random() * (tipo.coste_max - tipo.coste_min));
}

/**
 * Genera un nivel de confianza basado en el tipo de dano.
 * Los danos visibles (abolladuras, cristal, pintura) tienen mayor confianza.
 * Los danos ocultos (mecanica, fuego, robo) tienen menor confianza.
 */
function _generarConfianza(tipoDano) {
  const baseConfianza = {
    abolladuras: 90,
    rotura_cristal: 93,
    pintura: 89,
    mecanica: 78,
    agua: 82,
    fuego: 72,
    robo_contenido: 68,
    electrico: 80,
    estructural: 65,
  };
  const base = baseConfianza[tipoDano] || 75;
  const variacion = Math.floor(Math.random() * 10) - 3; // -3 a +7
  return Math.min(99, Math.max(50, base + variacion));
}

/**
 * Genera los pasos detallados de una peritacion virtual.
 */
function _generarPasos(siniestroId, tipoDano, costeEstimado, confianza) {
  const tipo = tiposDano[tipoDano] || tiposDano.abolladuras;

  const pasos = [
    {
      paso: 1,
      accion: 'Verificacion de identidad',
      descripcion: 'Comprobacion de la identidad del asegurado mediante videollamada y DNI electronico',
      resultado: 'Identidad verificada correctamente. Coincide con los datos del asegurado en poliza.',
      confianza: 99,
      duracion_segundos: 45,
    },
    {
      paso: 2,
      accion: 'Recepcion y analisis de fotografias',
      descripcion: 'El asegurado aporta fotografias del siniestro desde multiples angulos via la aplicacion movil',
      resultado: `Se han recibido y analizado ${Math.floor(Math.random() * 6) + 4} fotografias del siniestro. Calidad de imagen: ${confianza > 85 ? 'buena' : 'aceptable'}. Metadatos GPS y temporales verificados.`,
      confianza: Math.min(99, confianza + 3),
      duracion_segundos: 120,
    },
    {
      paso: 3,
      accion: 'Deteccion automatizada de danos',
      descripcion: 'Algoritmo de vision artificial analiza las imagenes para identificar y clasificar los danos',
      resultado: `Tipo de dano detectado: ${tipo.nombre}. ${_generarDescripcionDano(tipoDano)}. El algoritmo ha identificado el dano con un ${confianza}% de confianza.`,
      confianza,
      duracion_segundos: 30,
    },
    {
      paso: 4,
      accion: 'Estimacion de costes',
      descripcion: 'Calculo del coste de reparacion basado en base de datos de precios de mercado y proveedores homologados',
      resultado: `Coste estimado de reparacion: ${costeEstimado} EUR. Basado en ${Math.floor(Math.random() * 5) + 3} presupuestos de talleres/proveedores de la zona. Proveedor recomendado: ${_generarProveedor(tipoDano)}.`,
      confianza: Math.min(99, confianza + 2),
      duracion_segundos: 15,
    },
    {
      paso: 5,
      accion: 'Comparacion con precios de mercado',
      descripcion: 'Verificacion del coste estimado frente a precios medios de mercado para este tipo de dano',
      resultado: _generarComparacionMercado(tipoDano, costeEstimado),
      confianza: Math.min(99, confianza + 1),
      duracion_segundos: 10,
    },
    {
      paso: 6,
      accion: 'Generacion de informe pericial',
      descripcion: 'Compilacion automatica del informe de peritacion con todos los hallazgos y valoraciones',
      resultado: `Informe pericial generado con referencia PER-V-${siniestroId}. Incluye ${Math.floor(Math.random() * 6) + 4} fotografias anotadas, valoracion economica y recomendacion de actuacion.`,
      confianza: confianza,
      duracion_segundos: 20,
    },
    {
      paso: 7,
      accion: 'Decision automatica',
      descripcion: `Evaluacion contra umbrales de aprobacion: coste < ${UMBRAL_COSTE_APROBACION_AUTO} EUR y confianza > ${UMBRAL_CONFIANZA_APROBACION_AUTO}%`,
      resultado: _generarDecisionAutomatica(costeEstimado, confianza),
      confianza: confianza,
      duracion_segundos: 5,
    },
  ];

  return pasos;
}

function _generarDescripcionDano(tipoDano) {
  const descripciones = {
    abolladuras: 'Se observa deformacion en la superficie metalica sin fractura del material. La pintura muestra estres pero no se ha desprendido en su totalidad',
    rotura_cristal: 'Impacto puntual con patron de rotura radial tipico de proyeccion de objeto. La luna presenta perdida de integridad estructural',
    pintura: 'Se detectan marcas lineales con profundidad variable. Algunas alcanzan la capa de imprimacion, exponiendo el metal base',
    mecanica: 'Las imagenes del compartimento motor muestran componentes desalineados. Se detecta posible fuga de fluido en la zona afectada',
    agua: 'Se aprecia oscurecimiento en paredes y suelo compatible con absorcion de agua. Las manchas de humedad sugieren filtracion activa o reciente',
    fuego: 'Se observan marcas de carbonizacion, hollín y deformacion termica en los materiales afectados. El patron de danos sugiere origen localizado',
    robo_contenido: 'Las fotografias muestran signos de forzamiento en los puntos de acceso y el espacio vacio correspondiente a los bienes sustraidos',
    electrico: 'Se aprecian marcas de sobrecarga en enchufes y cuadro electrico. Los aparatos afectados muestran signos de quemadura interna',
    estructural: 'Grietas visibles en elementos de carga con patron de propagacion activo. Requiere valoracion profesional presencial',
  };
  return descripciones[tipoDano] || 'Se han detectado danos visibles compatibles con el siniestro declarado';
}

function _generarProveedor(tipoDano) {
  const proveedores = {
    abolladuras: 'Talleres Martinez - Chapa y Pintura (homologado)',
    rotura_cristal: 'Carglass / Cristaleria Express (servicio urgente)',
    pintura: 'Talleres Martinez - Chapa y Pintura (homologado)',
    mecanica: 'Euromaster Servicio Integral (convenio aseguradora)',
    agua: 'Reparaciones Hogar 24h S.L. (red propia)',
    fuego: 'Restauralia Siniestros S.A. (especialista)',
    robo_contenido: 'No aplica - indemnizacion directa',
    electrico: 'Instalaciones Electricas Gonzalez (homologado)',
    estructural: 'Ingenieria y Obras Peninsular S.L. (certificado)',
  };
  return proveedores[tipoDano] || 'Proveedor homologado de la zona';
}

function _generarComparacionMercado(tipoDano, costeEstimado) {
  const tipo = tiposDano[tipoDano];
  if (!tipo) return 'Comparacion no disponible para este tipo de dano.';

  const media = Math.round((tipo.coste_min + tipo.coste_max) / 2);
  const diferencia = costeEstimado - media;
  const porcentaje = Math.round((diferencia / media) * 100);

  if (Math.abs(porcentaje) <= 10) {
    return `El coste estimado (${costeEstimado} EUR) esta dentro del rango medio de mercado (${media} EUR +/-10%). Valoracion coherente con los precios habituales.`;
  } else if (porcentaje > 10) {
    return `El coste estimado (${costeEstimado} EUR) es un ${porcentaje}% superior a la media de mercado (${media} EUR). Se recomienda solicitar presupuesto alternativo para optimizar costes.`;
  } else {
    return `El coste estimado (${costeEstimado} EUR) es un ${Math.abs(porcentaje)}% inferior a la media de mercado (${media} EUR). Precio competitivo confirmado.`;
  }
}

function _generarDecisionAutomatica(costeEstimado, confianza) {
  if (costeEstimado <= UMBRAL_COSTE_APROBACION_AUTO && confianza >= UMBRAL_CONFIANZA_APROBACION_AUTO) {
    return `APROBACION AUTOMATICA. El siniestro cumple los criterios: coste (${costeEstimado} EUR <= ${UMBRAL_COSTE_APROBACION_AUTO} EUR) y confianza (${confianza}% >= ${UMBRAL_CONFIANZA_APROBACION_AUTO}%). Se procede al pago de la indemnizacion sin intervencion de perito fisico.`;
  }

  const motivos = [];
  if (costeEstimado > UMBRAL_COSTE_APROBACION_AUTO) {
    motivos.push(`coste (${costeEstimado} EUR) supera el umbral de ${UMBRAL_COSTE_APROBACION_AUTO} EUR`);
  }
  if (confianza < UMBRAL_CONFIANZA_APROBACION_AUTO) {
    motivos.push(`confianza (${confianza}%) por debajo del umbral minimo de ${UMBRAL_CONFIANZA_APROBACION_AUTO}%`);
  }
  return `REQUIERE REVISION MANUAL. Motivo: ${motivos.join(' y ')}. El expediente sera derivado a un perito colegiado para valoracion presencial.`;
}

// ---------------------------------------------------------------------------
// FUNCIONES PUBLICAS
// ---------------------------------------------------------------------------

/**
 * Inicia una peritacion virtual para un siniestro.
 * Simula el flujo completo de analisis por videollamada.
 */
function iniciarPeritacion(siniestroId, tipoDano) {
  // Verificar si ya existe una peritacion para este siniestro
  const existente = peritaciones.find(p => p.siniestroId === siniestroId);
  if (existente && existente.estado === 'completada') {
    return {
      ya_existente: true,
      peritacion: existente,
      mensaje: `Ya existe una peritacion virtual completada para el siniestro ${siniestroId}`,
      informe: generarInforme(siniestroId),
    };
  }

  // Determinar tipo de dano (usar el proporcionado o uno por defecto)
  const tipoDanoFinal = tipoDano || 'abolladuras';
  if (!tiposDano[tipoDanoFinal]) {
    return {
      error: true,
      mensaje: `Tipo de dano desconocido: ${tipoDanoFinal}`,
      tipos_validos: Object.keys(tiposDano),
    };
  }

  // Generar datos de la peritacion
  const costeEstimado = _generarCosteEstimado(tipoDanoFinal);
  const confianza = _generarConfianza(tipoDanoFinal);
  const aprobadoAuto = costeEstimado <= UMBRAL_COSTE_APROBACION_AUTO && confianza >= UMBRAL_CONFIANZA_APROBACION_AUTO;

  // Generar pasos detallados
  const pasos = _generarPasos(siniestroId, tipoDanoFinal, costeEstimado, confianza);
  const duracionTotal = pasos.reduce((sum, p) => sum + p.duracion_segundos, 0);

  // Calcular ahorro
  const ahorro = COSTE_PERITACION_FISICA - COSTE_PERITACION_VIRTUAL;
  const porcentajeAhorro = Math.round((ahorro / COSTE_PERITACION_FISICA) * 100);

  // Crear registro de peritacion
  const nuevaPeritacion = {
    id: `PER-V-${String(peritaciones.length + 1).padStart(3, '0')}`,
    siniestroId,
    tipo_dano: tipoDanoFinal,
    fecha: new Date().toISOString().split('T')[0],
    estado: 'completada',
    coste_estimado: costeEstimado,
    confianza,
    aprobado_auto: aprobadoAuto,
    duracion_minutos: Math.ceil(duracionTotal / 60),
    resultado: pasos[2].resultado,
  };

  peritaciones.push(nuevaPeritacion);

  return {
    peritacion_id: nuevaPeritacion.id,
    siniestroId,
    tipo_dano: tipoDanoFinal,
    pasos,
    informe: {
      resumen: `Peritacion virtual completada para siniestro ${siniestroId}. Tipo de dano: ${tiposDano[tipoDanoFinal].nombre}. Coste estimado: ${costeEstimado} EUR. Nivel de confianza: ${confianza}%.`,
      coste_estimado: costeEstimado,
      confianza_porcentaje: confianza,
      tiempo_reparacion_estimado: `${tiposDano[tipoDanoFinal].tiempo_reparacion_dias} dias laborables`,
      proveedor_recomendado: _generarProveedor(tipoDanoFinal),
    },
    estimacion_coste: costeEstimado,
    aprobado_auto: aprobadoAuto,
    motivo_decision: aprobadoAuto
      ? `Aprobado automaticamente: coste (${costeEstimado} EUR) < ${UMBRAL_COSTE_APROBACION_AUTO} EUR y confianza (${confianza}%) > ${UMBRAL_CONFIANZA_APROBACION_AUTO}%`
      : `Requiere revision manual: ${costeEstimado > UMBRAL_COSTE_APROBACION_AUTO ? 'coste supera umbral' : ''}${costeEstimado > UMBRAL_COSTE_APROBACION_AUTO && confianza < UMBRAL_CONFIANZA_APROBACION_AUTO ? ' y ' : ''}${confianza < UMBRAL_CONFIANZA_APROBACION_AUTO ? 'confianza insuficiente' : ''}`,
    ahorro_vs_fisico: {
      coste_peritacion_virtual: COSTE_PERITACION_VIRTUAL,
      coste_peritacion_fisica: COSTE_PERITACION_FISICA,
      ahorro_euros: ahorro,
      ahorro_porcentaje: `${porcentajeAhorro}%`,
      tiempo_virtual: `${Math.ceil(duracionTotal / 60)} minutos`,
      tiempo_fisico_estimado: '3-5 dias laborables',
    },
    duracion_total_segundos: duracionTotal,
    duracion_total_minutos: Math.ceil(duracionTotal / 60),
  };
}

/**
 * Genera un informe completo de peritacion para un siniestro.
 */
function generarInforme(siniestroId) {
  const peritacion = peritaciones.find(p => p.siniestroId === siniestroId);
  if (!peritacion) {
    return { error: true, mensaje: `No se encontro peritacion para el siniestro ${siniestroId}` };
  }

  if (peritacion.estado !== 'completada') {
    return {
      error: true,
      mensaje: `La peritacion ${peritacion.id} esta en estado "${peritacion.estado}" y no puede generar informe todavia`,
    };
  }

  const tipo = tiposDano[peritacion.tipo_dano] || {};
  const hoy = new Date();

  return {
    encabezado: {
      titulo: 'INFORME DE PERITACION VIRTUAL',
      referencia: peritacion.id,
      siniestro: peritacion.siniestroId,
      fecha_peritacion: peritacion.fecha,
      fecha_informe: hoy.toISOString().split('T')[0],
      perito_virtual: 'Sistema Automatizado de Peritacion v3.2',
    },
    datos_siniestro: {
      tipo_dano: tipo.nombre || peritacion.tipo_dano,
      descripcion_tipo: tipo.descripcion || 'Sin descripcion disponible',
    },
    valoracion: {
      descripcion_danos: peritacion.resultado,
      coste_estimado_reparacion: peritacion.coste_estimado,
      confianza_valoracion: `${peritacion.confianza}%`,
      tiempo_reparacion_estimado: tipo.tiempo_reparacion_dias
        ? `${tipo.tiempo_reparacion_dias} dias laborables`
        : 'Por determinar',
      proveedor_recomendado: _generarProveedor(peritacion.tipo_dano),
    },
    decision: {
      aprobacion_automatica: peritacion.aprobado_auto,
      motivo: peritacion.aprobado_auto
        ? 'El siniestro cumple los criterios de importe y confianza para aprobacion automatica'
        : 'El siniestro requiere revision manual por un perito colegiado',
      umbral_coste: `${UMBRAL_COSTE_APROBACION_AUTO} EUR`,
      umbral_confianza: `${UMBRAL_CONFIANZA_APROBACION_AUTO}%`,
    },
    metricas: {
      duracion_peritacion: `${peritacion.duracion_minutos} minutos`,
      num_fotografias_analizadas: Math.floor(Math.random() * 6) + 4,
      coste_peritacion: `${COSTE_PERITACION_VIRTUAL} EUR`,
      ahorro_vs_presencial: `${COSTE_PERITACION_FISICA - COSTE_PERITACION_VIRTUAL} EUR`,
    },
    notas: peritacion.aprobado_auto
      ? 'Peritacion virtual completada satisfactoriamente. No se requiere intervencion adicional.'
      : 'Se recomienda programar visita presencial de perito colegiado para completar la valoracion. Los datos de esta peritacion virtual sirven como referencia inicial.',
    disclaimer: 'Este informe ha sido generado de forma automatizada mediante analisis de inteligencia artificial. Los importes son estimaciones basadas en precios de mercado y pueden variar en la valoracion definitiva. No constituye un dictamen pericial oficial a efectos legales.',
  };
}

/**
 * Calcula estadisticas de ahorro de la peritacion virtual frente a la fisica.
 */
function getAhorro() {
  const completadas = peritaciones.filter(p => p.estado === 'completada');
  const totalPeritaciones = completadas.length;

  if (totalPeritaciones === 0) {
    return { mensaje: 'No hay peritaciones completadas para calcular ahorros' };
  }

  const costeVirtualTotal = totalPeritaciones * COSTE_PERITACION_VIRTUAL;
  const costeFisicoTotal = totalPeritaciones * COSTE_PERITACION_FISICA;
  const ahorroTotal = costeFisicoTotal - costeVirtualTotal;

  const aprobadosAuto = completadas.filter(p => p.aprobado_auto).length;
  const requierenRevision = completadas.filter(p => !p.aprobado_auto).length;

  const duracionMedia = completadas.reduce((sum, p) => sum + (p.duracion_minutos || 0), 0) / totalPeritaciones;
  const confianzaMedia = completadas.reduce((sum, p) => sum + (p.confianza || 0), 0) / totalPeritaciones;
  const costeEstimadoMedio = completadas.reduce((sum, p) => sum + (p.coste_estimado || 0), 0) / totalPeritaciones;

  // Distribucion por tipo de dano
  const porTipoDano = {};
  for (const p of completadas) {
    const nombre = tiposDano[p.tipo_dano]?.nombre || p.tipo_dano;
    if (!porTipoDano[nombre]) {
      porTipoDano[nombre] = { cantidad: 0, coste_total: 0, confianza_media: 0 };
    }
    porTipoDano[nombre].cantidad++;
    porTipoDano[nombre].coste_total += p.coste_estimado || 0;
    porTipoDano[nombre].confianza_media += p.confianza || 0;
  }
  for (const key of Object.keys(porTipoDano)) {
    porTipoDano[key].coste_medio = Math.round(porTipoDano[key].coste_total / porTipoDano[key].cantidad);
    porTipoDano[key].confianza_media = Math.round(porTipoDano[key].confianza_media / porTipoDano[key].cantidad);
  }

  return {
    resumen: {
      total_peritaciones_virtuales: totalPeritaciones,
      peritaciones_en_curso: peritaciones.filter(p => p.estado === 'en_curso').length,
    },
    costes: {
      coste_medio_virtual: COSTE_PERITACION_VIRTUAL,
      coste_medio_fisico: COSTE_PERITACION_FISICA,
      coste_total_virtual: costeVirtualTotal,
      coste_total_fisico_equivalente: costeFisicoTotal,
      ahorro_total: ahorroTotal,
      ahorro_por_peritacion: COSTE_PERITACION_FISICA - COSTE_PERITACION_VIRTUAL,
      ahorro_porcentaje: `${Math.round(((COSTE_PERITACION_FISICA - COSTE_PERITACION_VIRTUAL) / COSTE_PERITACION_FISICA) * 100)}%`,
    },
    eficiencia: {
      aprobaciones_automaticas: aprobadosAuto,
      requieren_revision_manual: requierenRevision,
      tasa_aprobacion_automatica: `${Math.round((aprobadosAuto / totalPeritaciones) * 100)}%`,
      duracion_media_minutos: Math.round(duracionMedia),
      confianza_media_porcentaje: Math.round(confianzaMedia),
      coste_estimado_medio_siniestros: Math.round(costeEstimadoMedio),
    },
    tiempos: {
      tiempo_medio_virtual: `${Math.round(duracionMedia)} minutos`,
      tiempo_medio_fisico: '3-5 dias laborables',
      reduccion_tiempo: 'De dias a minutos',
    },
    distribucion_por_tipo_dano: porTipoDano,
    umbrales: {
      coste_aprobacion_auto: `${UMBRAL_COSTE_APROBACION_AUTO} EUR`,
      confianza_aprobacion_auto: `${UMBRAL_CONFIANZA_APROBACION_AUTO}%`,
    },
  };
}

/**
 * Obtiene todas las peritaciones registradas.
 */
function getPeritaciones() {
  return peritaciones.map(p => ({
    ...p,
    tipo_dano_detalle: tiposDano[p.tipo_dano] || null,
  }));
}

/**
 * Obtiene una peritacion por su ID de siniestro.
 */
function getPeritacionPorSiniestro(siniestroId) {
  const peritacion = peritaciones.find(p => p.siniestroId === siniestroId);
  if (!peritacion) {
    return { error: true, mensaje: `No se encontro peritacion para el siniestro ${siniestroId}` };
  }
  return {
    ...peritacion,
    tipo_dano_detalle: tiposDano[peritacion.tipo_dano] || null,
  };
}

// ---------------------------------------------------------------------------
// EXPORTACIONES
// ---------------------------------------------------------------------------
module.exports = {
  iniciarPeritacion,
  generarInforme,
  getAhorro,
  getPeritaciones,
  getPeritacionPorSiniestro,
  tiposDano,
  peritaciones,
  UMBRAL_COSTE_APROBACION_AUTO,
  UMBRAL_CONFIANZA_APROBACION_AUTO,
  COSTE_PERITACION_VIRTUAL,
  COSTE_PERITACION_FISICA,
};
