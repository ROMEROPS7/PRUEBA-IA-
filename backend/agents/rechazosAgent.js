// =============================================================================
// AGENTE DE RECHAZOS - Gestion completa de rechazos de siniestros
// =============================================================================

const polizasService = require('../services/polizasService');

// ---------------------------------------------------------------------------
// CATALOGO DE MOTIVOS DE RECHAZO
// ---------------------------------------------------------------------------
const motivosRechazo = {
  no_cubierto: {
    codigo: 'RCH-001',
    nombre: 'Siniestro no cubierto',
    descripcion: 'El tipo de siniestro declarado no esta incluido en las coberturas de la poliza contratada',
    gravedad: 'definitivo',
    permite_recurso: true,
  },
  exclusion_poliza: {
    codigo: 'RCH-002',
    nombre: 'Exclusion de poliza',
    descripcion: 'El siniestro se encuentra expresamente excluido en las condiciones particulares o generales de la poliza',
    gravedad: 'definitivo',
    permite_recurso: true,
  },
  poliza_vencida: {
    codigo: 'RCH-003',
    nombre: 'Poliza vencida o no vigente',
    descripcion: 'La poliza no se encontraba en vigor en el momento del siniestro',
    gravedad: 'definitivo',
    permite_recurso: false,
  },
  franquicia_superior: {
    codigo: 'RCH-004',
    nombre: 'Importe inferior a franquicia',
    descripcion: 'El coste del siniestro no supera el importe de la franquicia estipulada en la poliza',
    gravedad: 'parcial',
    permite_recurso: false,
  },
  limite_superado: {
    codigo: 'RCH-005',
    nombre: 'Limite de cobertura superado',
    descripcion: 'Se ha agotado el limite maximo de la cobertura para el periodo asegurado',
    gravedad: 'parcial',
    permite_recurso: true,
  },
  fraude_detectado: {
    codigo: 'RCH-006',
    nombre: 'Indicios de fraude',
    descripcion: 'Se han detectado indicios razonables de fraude en la declaracion del siniestro',
    gravedad: 'definitivo',
    permite_recurso: true,
  },
  documentacion_insuficiente: {
    codigo: 'RCH-007',
    nombre: 'Documentacion insuficiente',
    descripcion: 'No se ha aportado la documentacion necesaria para tramitar el siniestro en el plazo establecido',
    gravedad: 'temporal',
    permite_recurso: true,
  },
  plazo_comunicacion_excedido: {
    codigo: 'RCH-008',
    nombre: 'Plazo de comunicacion excedido',
    descripcion: 'El siniestro no fue comunicado dentro del plazo legal de 7 dias habiles establecido en la poliza',
    gravedad: 'definitivo',
    permite_recurso: true,
  },
  duplicado: {
    codigo: 'RCH-009',
    nombre: 'Siniestro duplicado',
    descripcion: 'Ya existe un siniestro registrado con las mismas caracteristicas y fecha para esta poliza',
    gravedad: 'definitivo',
    permite_recurso: false,
  },
  prexistencia: {
    codigo: 'RCH-010',
    nombre: 'Condicion preexistente',
    descripcion: 'El dano o la condicion existia con anterioridad a la contratacion de la poliza y no fue declarada',
    gravedad: 'definitivo',
    permite_recurso: true,
  },
  uso_indebido: {
    codigo: 'RCH-011',
    nombre: 'Uso indebido del bien asegurado',
    descripcion: 'El bien asegurado estaba siendo utilizado para un fin distinto al declarado en la poliza',
    gravedad: 'definitivo',
    permite_recurso: true,
  },
  negligencia_grave: {
    codigo: 'RCH-012',
    nombre: 'Negligencia grave del asegurado',
    descripcion: 'El siniestro se produjo como consecuencia directa de una negligencia grave del tomador o asegurado',
    gravedad: 'definitivo',
    permite_recurso: true,
  },
};

// ---------------------------------------------------------------------------
// PLANTILLA DE CARTA DE RECHAZO
// ---------------------------------------------------------------------------
const plantillaCarta = `
SEGUROS EJEMPLO S.A.
CIF: A-12345678
Registro DGS: C-0999

{{ciudad}}, {{fecha}}

{{nombre_cliente}}
{{direccion_cliente}}

Ref.: Expediente de Siniestro n.o {{siniestro_id}}
Poliza n.o: {{poliza_id}}
Ramo: {{ramo}}

Estimado/a Sr./Sra. {{apellido_cliente}}:

En relacion con el siniestro comunicado el {{fecha_comunicacion}}, relativo a {{descripcion_siniestro}}, y tras el analisis exhaustivo de la documentacion aportada y las condiciones de su poliza, lamentamos comunicarle que no resulta posible atender su reclamacion por el siguiente motivo:

MOTIVO DEL RECHAZO: {{motivo_nombre}}

{{explicacion_detallada}}

Base legal y contractual:
- Articulo {{articulo_ley}} de la Ley 50/1980, de 8 de octubre, de Contrato de Seguro.
- {{clausula_poliza}} de las Condiciones Generales de su poliza.
- {{condicion_particular}} de las Condiciones Particulares.

{{parrafo_alternativas}}

Le informamos de que, conforme a la legislacion vigente, dispone de los siguientes mecanismos para manifestar su disconformidad con esta decision:

1. Presentar una reclamacion ante el Servicio de Atencion al Cliente de Seguros Ejemplo S.A. en el plazo de 30 dias naturales desde la recepcion de esta comunicacion.
2. Acudir al Defensor del Asegurado, cuya direccion se encuentra en las Condiciones Generales de su poliza.
3. Formular una queja ante el Servicio de Reclamaciones de la Direccion General de Seguros y Fondos de Pensiones (DGSFP).
4. Ejercer las acciones judiciales que estime oportunas.

Quedamos a su disposicion para cualquier aclaracion adicional a traves de nuestro telefono de atencion al cliente 900 123 456 o en nuestras oficinas.

Reciba un cordial saludo,

___________________________
Departamento de Siniestros
Seguros Ejemplo S.A.
`;

// ---------------------------------------------------------------------------
// BASE DE DATOS DE RECHAZOS PRE-POPULADOS
// ---------------------------------------------------------------------------
const historialRechazos = [
  {
    id: 'REC-001',
    siniestroId: 'SIN-2024-0045',
    clienteId: 'CLI-010',
    polizaId: 'POL-2024-011',
    fecha_rechazo: '2024-07-15',
    motivo: 'no_cubierto',
    importe_reclamado: 2500,
    descripcion_siniestro: 'Robo de objetos del interior del vehiculo en parking publico',
    explicacion: 'La poliza basica de automovil no incluye cobertura de robo. Solo las modalidades Completa y Premium cubren este tipo de siniestro.',
    recurso_presentado: false,
  },
  {
    id: 'REC-002',
    siniestroId: 'SIN-2024-0052',
    clienteId: 'CLI-003',
    polizaId: 'POL-2024-004',
    fecha_rechazo: '2024-08-02',
    motivo: 'poliza_vencida',
    importe_reclamado: 200000,
    descripcion_siniestro: 'Reclamacion de capital por invalidez permanente total',
    explicacion: 'La poliza de vida vencio el 01/06/2024 y no fue renovada. El hecho causante se produjo el 20/07/2024, fuera del periodo de cobertura.',
    recurso_presentado: true,
    resultado_recurso: 'desestimado',
  },
  {
    id: 'REC-003',
    siniestroId: 'SIN-2024-0038',
    clienteId: 'CLI-005',
    polizaId: 'POL-2024-006',
    fecha_rechazo: '2024-06-20',
    motivo: 'exclusion_poliza',
    importe_reclamado: 4500,
    descripcion_siniestro: 'Danos por humedad en paredes del salon por condensacion',
    explicacion: 'Las humedades por condensacion o falta de ventilacion estan expresamente excluidas de la cobertura de danos por agua (Clausula 8.3 de las Condiciones Generales).',
    recurso_presentado: false,
  },
  {
    id: 'REC-004',
    siniestroId: 'SIN-2024-0061',
    clienteId: 'CLI-001',
    polizaId: 'POL-2024-001',
    fecha_rechazo: '2024-09-10',
    motivo: 'franquicia_superior',
    importe_reclamado: 120,
    descripcion_siniestro: 'Pequena abolladura en puerta trasera por golpe en aparcamiento',
    explicacion: 'El importe de la reparacion (120 EUR) es inferior a la franquicia de la poliza (150 EUR para el tier Premium). El asegurado debe asumir el coste.',
    recurso_presentado: false,
  },
  {
    id: 'REC-005',
    siniestroId: 'SIN-2024-0070',
    clienteId: 'CLI-009',
    polizaId: 'POL-2024-010',
    fecha_rechazo: '2024-09-25',
    motivo: 'fraude_detectado',
    importe_reclamado: 15000,
    descripcion_siniestro: 'Supuesto robo de caja registradora y mercancia del restaurante',
    explicacion: 'La investigacion del perito ha revelado inconsistencias entre la declaracion del asegurado y las pruebas encontradas. Las camaras de seguridad no registraron intrusion y la cerradura no presenta signos de forzamiento.',
    recurso_presentado: true,
    resultado_recurso: 'en_proceso',
  },
  {
    id: 'REC-006',
    siniestroId: 'SIN-2024-0033',
    clienteId: 'CLI-007',
    polizaId: 'POL-2024-008',
    fecha_rechazo: '2024-07-18',
    motivo: 'plazo_comunicacion_excedido',
    importe_reclamado: 800,
    descripcion_siniestro: 'Perdida de equipaje en vuelo Madrid-Bangkok',
    explicacion: 'El siniestro se produjo el 05/07/2024 pero no fue comunicado hasta el 16/07/2024, excediendo el plazo contractual de 7 dias habiles para la comunicacion del siniestro.',
    recurso_presentado: false,
  },
  {
    id: 'REC-007',
    siniestroId: 'SIN-2024-0078',
    clienteId: 'CLI-014',
    polizaId: 'POL-2024-015',
    fecha_rechazo: '2024-10-05',
    motivo: 'poliza_vencida',
    importe_reclamado: 8500,
    descripcion_siniestro: 'Colision por alcance en la M-30 con danos en paragolpes y maletero',
    explicacion: 'La poliza se encuentra suspendida por impago de las dos ultimas mensualidades. El asegurado fue notificado de la suspension por carta certificada el 15/08/2024.',
    recurso_presentado: true,
    resultado_recurso: 'desestimado',
  },
  {
    id: 'REC-008',
    siniestroId: 'SIN-2024-0085',
    clienteId: 'CLI-013',
    polizaId: 'POL-2024-014',
    fecha_rechazo: '2024-10-12',
    motivo: 'prexistencia',
    importe_reclamado: 3200,
    descripcion_siniestro: 'Tratamiento quirurgico de hernia discal lumbar',
    explicacion: 'La revision del historial clinico revela que el asegurado fue diagnosticado de protusion discal L4-L5 en marzo de 2023, diez meses antes de la contratacion de la poliza, sin haberlo declarado en el cuestionario de salud.',
    recurso_presentado: true,
    resultado_recurso: 'en_proceso',
  },
  {
    id: 'REC-009',
    siniestroId: 'SIN-2024-0091',
    clienteId: 'CLI-008',
    polizaId: 'POL-2024-009',
    fecha_rechazo: '2024-10-20',
    motivo: 'documentacion_insuficiente',
    importe_reclamado: 1800,
    descripcion_siniestro: 'Operacion quirurgica de mascota por ingesta de cuerpo extrano',
    explicacion: 'Se solicito factura del veterinario, informe clinico y pruebas diagnosticas. Transcurrido el plazo de 15 dias habiles no se ha recibido la documentacion requerida.',
    recurso_presentado: false,
  },
  {
    id: 'REC-010',
    siniestroId: 'SIN-2024-0096',
    clienteId: 'CLI-011',
    polizaId: 'POL-2024-012',
    fecha_rechazo: '2024-10-28',
    motivo: 'duplicado',
    importe_reclamado: 6200,
    descripcion_siniestro: 'Robo de bicicletas y herramientas del garaje del chalet',
    explicacion: 'Ya existe el expediente SIN-2024-0089 con identica fecha, lugar y descripcion de los hechos. Se trata de una comunicacion duplicada del mismo siniestro.',
    recurso_presentado: false,
  },
  {
    id: 'REC-011',
    siniestroId: 'SIN-2024-0101',
    clienteId: 'CLI-002',
    polizaId: 'POL-2024-003',
    fecha_rechazo: '2024-11-03',
    motivo: 'negligencia_grave',
    importe_reclamado: 12000,
    descripcion_siniestro: 'Danos por colision contra muro al circular a velocidad excesiva en zona residencial',
    explicacion: 'El atestado policial acredita que el vehiculo circulaba a 95 km/h en una zona limitada a 30 km/h. La negligencia grave del conductor exonera a la aseguradora de la obligacion de indemnizar los danos propios.',
    recurso_presentado: true,
    resultado_recurso: 'desestimado',
  },
  {
    id: 'REC-012',
    siniestroId: 'SIN-2024-0108',
    clienteId: 'CLI-015',
    polizaId: 'POL-2024-016',
    fecha_rechazo: '2024-11-10',
    motivo: 'uso_indebido',
    importe_reclamado: 9500,
    descripcion_siniestro: 'Incendio en zona de almacenamiento de disolventes del taller',
    explicacion: 'La inspeccion revelo que se almacenaban productos quimicos inflamables en una zona no habilitada ni declarada en la poliza, incumpliendo las condiciones de seguridad exigidas por la normativa vigente y las condiciones particulares.',
    recurso_presentado: true,
    resultado_recurso: 'en_proceso',
  },
];

// ---------------------------------------------------------------------------
// DATOS DE CLIENTES SIMULADOS (para cartas)
// ---------------------------------------------------------------------------
const datosClientes = {
  'CLI-001': { nombre: 'Carlos', apellido: 'Fernandez Ruiz', direccion: 'Calle Gran Via 42, 3o B, 28013 Madrid', ciudad: 'Madrid' },
  'CLI-002': { nombre: 'Maria', apellido: 'Lopez Sanchez', direccion: 'Calle Larios 15, 2o D, 29005 Malaga', ciudad: 'Malaga' },
  'CLI-003': { nombre: 'Antonio', apellido: 'Garcia Moreno', direccion: 'Avda. de la Constitucion 8, 41001 Sevilla', ciudad: 'Sevilla' },
  'CLI-004': { nombre: 'Laura', apellido: 'Martinez Diaz', direccion: 'Paseo de Gracia 55, 4o, 08007 Barcelona', ciudad: 'Barcelona' },
  'CLI-005': { nombre: 'Javier', apellido: 'Rodriguez Perez', direccion: 'Avda. Diagonal 150, 7o A, 08018 Barcelona', ciudad: 'Barcelona' },
  'CLI-006': { nombre: 'Carmen', apellido: 'Hernandez Gil', direccion: 'Calle Mayor 12, 1o, 50001 Zaragoza', ciudad: 'Zaragoza' },
  'CLI-007': { nombre: 'Pablo', apellido: 'Navarro Jimenez', direccion: 'Calle Colon 30, 3o B, 46004 Valencia', ciudad: 'Valencia' },
  'CLI-008': { nombre: 'Elena', apellido: 'Torres Molina', direccion: 'Calle Alcala 200, 5o C, 28028 Madrid', ciudad: 'Madrid' },
  'CLI-009': { nombre: 'Francisco', apellido: 'Romero Vega', direccion: 'Avda. de Andalucia 45, 18003 Granada', ciudad: 'Granada' },
  'CLI-010': { nombre: 'Isabel', apellido: 'Castillo Ortega', direccion: 'Calle San Fernando 22, 41004 Sevilla', ciudad: 'Sevilla' },
  'CLI-011': { nombre: 'Miguel', apellido: 'Delgado Ramos', direccion: 'Calle Sierpes 28, 41004 Sevilla', ciudad: 'Sevilla' },
  'CLI-012': { nombre: 'Ana', apellido: 'Ruiz Torres', direccion: 'Gran Via 78, 2o A, 28013 Madrid', ciudad: 'Madrid' },
  'CLI-013': { nombre: 'Fernando', apellido: 'Diaz Blanco', direccion: 'Calle Princesa 40, 4o D, 28008 Madrid', ciudad: 'Madrid' },
  'CLI-014': { nombre: 'Teresa', apellido: 'Morales Ibarra', direccion: 'Paseo de la Castellana 120, 28046 Madrid', ciudad: 'Madrid' },
  'CLI-015': { nombre: 'Roberto', apellido: 'Gonzalez Serrano', direccion: 'Poligono Industrial Sur, Nave 12, 28500 Arganda del Rey, Madrid', ciudad: 'Arganda del Rey' },
};

// ---------------------------------------------------------------------------
// FUNCIONES DEL AGENTE
// ---------------------------------------------------------------------------

/**
 * Procesa un siniestro y determina si debe ser rechazado.
 * Analiza la poliza, coberturas, vigencia y circunstancias.
 */
function procesarRechazo(siniestroId) {
  // Buscar si ya existe un rechazo previo para este siniestro
  const rechazoExistente = historialRechazos.find(r => r.siniestroId === siniestroId);
  if (rechazoExistente) {
    const motivo = motivosRechazo[rechazoExistente.motivo];
    const cliente = datosClientes[rechazoExistente.clienteId] || {};

    return {
      rechazado: true,
      siniestroId,
      motivo: rechazoExistente.motivo,
      motivo_detalle: motivo,
      explicacion_cliente: _generarExplicacionEmpatica(rechazoExistente.motivo, rechazoExistente),
      carta_rechazo: generarCartaRechazo(siniestroId, rechazoExistente.motivo),
      alternativas: _generarAlternativas(rechazoExistente.motivo, rechazoExistente),
      estadisticas: getEstadisticas(),
      datos_rechazo: rechazoExistente,
    };
  }

  // Si no existe, simular el analisis de un siniestro nuevo
  // En produccion, esto consultaria la base de datos de siniestros
  return {
    rechazado: false,
    siniestroId,
    motivo: null,
    explicacion_cliente: 'El siniestro ha sido analizado y no se han encontrado motivos de rechazo. Procede su tramitacion normal.',
    carta_rechazo: null,
    alternativas: [],
    estadisticas: getEstadisticas(),
    mensaje: 'Siniestro aceptado para tramitacion. No se han detectado motivos de rechazo.',
  };
}

/**
 * Genera una explicacion empatica para el cliente sobre el motivo del rechazo.
 */
function _generarExplicacionEmpatica(motivoClave, rechazo) {
  const explicaciones = {
    no_cubierto: `Entendemos lo frustrante que puede resultar esta situacion. Lamentablemente, tras revisar detenidamente su poliza (modalidad ${rechazo.polizaId}), hemos comprobado que el tipo de siniestro que nos ha comunicado no se encuentra entre las coberturas contratadas. Queremos ayudarle a encontrar la mejor solucion: le recomendamos revisar las opciones de ampliacion de su poliza para que en el futuro este protegido ante este tipo de incidencias.`,

    exclusion_poliza: `Lamentamos comunicarle que, tras un analisis detallado de su caso, hemos identificado que las circunstancias de su siniestro coinciden con una de las exclusiones recogidas en las condiciones de su poliza. Sabemos que esta no es la respuesta que esperaba y comprendemos su decepcion. Nuestro equipo esta a su disposicion para explicarle en detalle los terminos de su contrato y explorar alternativas.`,

    poliza_vencida: `Sentimos mucho tener que comunicarle que su poliza no se encontraba vigente en el momento en que se produjo el siniestro. Esto impide que podamos atender su reclamacion. Le animamos a ponerse en contacto con nosotros para regularizar su situacion y recuperar su proteccion lo antes posible.`,

    franquicia_superior: `Le informamos de que el importe del siniestro comunicado (${rechazo.importe_reclamado} EUR) no alcanza el umbral de la franquicia establecida en su poliza. Esto significa que este tipo de gastos menores quedan a cargo del asegurado segun las condiciones contratadas. Si lo desea, podemos estudiar opciones con franquicia reducida o sin franquicia para su proxima renovacion.`,

    limite_superado: `Entendemos la dificultad de su situacion. El limite de cobertura para este tipo de siniestro ha sido alcanzado o superado durante el periodo de vigencia actual de su poliza. Estamos comprometidos a ayudarle y podemos estudiar opciones de ampliacion de limites para futuras renovaciones.`,

    fraude_detectado: `Tras la investigacion realizada por nuestro departamento de peritacion, se han detectado inconsistencias significativas en la declaracion del siniestro que nos impiden proceder con la indemnizacion. Le recordamos que la declaracion inexacta de las circunstancias del siniestro puede tener consecuencias legales. No obstante, si considera que ha habido un error, tiene derecho a presentar alegaciones.`,

    documentacion_insuficiente: `Necesitamos su colaboracion para poder tramitar su siniestro. Lamentablemente, la documentacion aportada hasta la fecha resulta insuficiente para completar la valoracion. Le animamos a reunir la documentacion solicitada y presentarla lo antes posible para que podamos reabrir su expediente y continuar con la tramitacion.`,

    plazo_comunicacion_excedido: `Comprendemos que en momentos dificiles no siempre es facil actuar con la celeridad necesaria. Sin embargo, su poliza establece un plazo maximo de 7 dias habiles para comunicar el siniestro, y en este caso se ha superado dicho plazo. Esta condicion tiene por objeto facilitar una investigacion efectiva de los hechos. Le recomendamos que en futuras ocasiones nos comunique cualquier incidencia lo antes posible.`,

    duplicado: `Hemos detectado que ya existe un expediente abierto con las mismas caracteristicas en nuestro sistema. Para evitar duplicidades y agilizar la gestion, mantendremos activo el expediente original. Si tiene informacion adicional que aportar, puede hacerlo referenciando el numero de expediente existente.`,

    prexistencia: `Tras la revision de la documentacion clinica, se ha determinado que la patologia por la que reclama existia con anterioridad a la fecha de contratacion de la poliza y no fue declarada en el cuestionario de salud. La transparencia en la declaracion de antecedentes es fundamental para el correcto funcionamiento del seguro. Si discrepa de esta valoracion, puede solicitar una revision aportando documentacion medica adicional.`,

    uso_indebido: `La investigacion ha puesto de manifiesto que el bien asegurado estaba siendo utilizado de forma distinta a la declarada en la poliza. Las condiciones del seguro estan disenadas en base al uso declarado y el riesgo asociado. Le invitamos a contactar con su mediador para actualizar las condiciones de su poliza y ajustarlas a la realidad de uso.`,

    negligencia_grave: `Tras analizar las circunstancias del siniestro, se ha determinado que los danos se produjeron como consecuencia de una conducta gravemente negligente. La Ley de Contrato de Seguro exonera al asegurador de su obligacion cuando el siniestro ha sido causado por mala fe o negligencia grave del asegurado. Comprendemos que esta decision es dificil de aceptar, y tiene derecho a presentar las alegaciones que estime oportunas.`,
  };

  return explicaciones[motivoClave] || `Lamentamos comunicarle que su reclamacion no ha podido ser atendida. Nuestro equipo esta a su disposicion para ofrecerle mas informacion sobre las razones de esta decision.`;
}

/**
 * Genera alternativas y recomendaciones para el cliente tras un rechazo.
 */
function _generarAlternativas(motivoClave, rechazo) {
  const alternativasBase = {
    no_cubierto: [
      'Ampliar su poliza actual a un tier superior que incluya esta cobertura',
      'Contratar una poliza complementaria especifica para este tipo de riesgo',
      'Solicitar un presupuesto personalizado incluyendo las coberturas deseadas',
    ],
    exclusion_poliza: [
      'Solicitar una revision de las exclusiones de su poliza con su mediador',
      'Contratar coberturas adicionales mediante clausulas especiales',
      'Consultar productos alternativos que no incluyan esta exclusion',
    ],
    poliza_vencida: [
      'Renovar la poliza inmediatamente para recuperar las coberturas',
      'Activar la renovacion automatica para evitar lapsos de cobertura',
      'Consultar la posibilidad de efecto retroactivo (sujeto a estudio)',
    ],
    franquicia_superior: [
      'Contratar una modalidad sin franquicia o con franquicia reducida',
      'Acumular este importe con futuros siniestros si su poliza lo permite',
      'Valorar si la reduccion de franquicia compensa el incremento de prima',
    ],
    limite_superado: [
      'Ampliar el limite de cobertura en la proxima renovacion',
      'Contratar un seguro complementario de exceso de perdidas',
      'Revisar los sublimites de cobertura con su mediador',
    ],
    fraude_detectado: [
      'Presentar alegaciones formales con documentacion acreditativa',
      'Solicitar una segunda valoracion por perito independiente',
      'Acudir al Defensor del Asegurado si considera injusta la decision',
    ],
    documentacion_insuficiente: [
      'Aportar la documentacion pendiente para reabrir el expediente',
      'Contactar con el tramitador asignado para conocer los documentos necesarios',
      'Solicitar una prorroga del plazo de aportacion documental',
    ],
    plazo_comunicacion_excedido: [
      'Activar las notificaciones de la app para comunicar siniestros al instante',
      'Guardar el numero de atencion de siniestros 24h: 900 123 456',
      'En caso de duda, comunicar siempre el siniestro aunque no este seguro de la cobertura',
    ],
    duplicado: [
      'Consultar el estado del expediente original ya registrado',
      'Aportar documentacion adicional al expediente existente si es necesario',
    ],
    prexistencia: [
      'Actualizar el cuestionario de salud para incluir condiciones preexistentes',
      'Solicitar una poliza que cubra enfermedades preexistentes con recargo',
      'Consultar la cobertura a partir del siguiente periodo de carencia',
    ],
    uso_indebido: [
      'Actualizar la declaracion de uso del bien asegurado en su poliza',
      'Solicitar un presupuesto ajustado al uso real del bien',
      'Revisar las condiciones particulares con su mediador de seguros',
    ],
    negligencia_grave: [
      'Presentar alegaciones aportando pruebas que contradigan la calificacion de negligencia',
      'Solicitar mediacion a traves del Defensor del Asegurado',
      'Consultar con un abogado especializado en derecho de seguros',
    ],
  };

  return alternativasBase[motivoClave] || [
    'Contactar con el servicio de atencion al cliente para mas informacion',
    'Solicitar una revision de su expediente',
  ];
}

/**
 * Genera una carta formal de rechazo en espanol con validez legal.
 */
function generarCartaRechazo(siniestroId, motivo) {
  const rechazo = historialRechazos.find(r => r.siniestroId === siniestroId);
  if (!rechazo) {
    return { error: true, mensaje: `No se encontro un rechazo para el siniestro ${siniestroId}` };
  }

  const cliente = datosClientes[rechazo.clienteId] || {
    nombre: 'Asegurado/a',
    apellido: 'Desconocido',
    direccion: 'Direccion no registrada',
    ciudad: 'Madrid',
  };

  const motivoDetalle = motivosRechazo[motivo] || motivosRechazo[rechazo.motivo];
  if (!motivoDetalle) {
    return { error: true, mensaje: `Motivo de rechazo desconocido: ${motivo}` };
  }

  // Determinar articulos legales segun motivo
  const articulosLey = {
    no_cubierto: '1 y 3',
    exclusion_poliza: '3 y 8',
    poliza_vencida: '15 y 16',
    franquicia_superior: '26',
    limite_superado: '27',
    fraude_detectado: '10 y 16',
    documentacion_insuficiente: '16 y 38',
    plazo_comunicacion_excedido: '16',
    duplicado: '3',
    prexistencia: '10',
    uso_indebido: '10 y 12',
    negligencia_grave: '19',
  };

  const clausulasPoliza = {
    no_cubierto: 'Articulo 3 (Objeto del Seguro)',
    exclusion_poliza: 'Articulo 8 (Exclusiones)',
    poliza_vencida: 'Articulo 5 (Vigencia y Duracion)',
    franquicia_superior: 'Articulo 12 (Franquicias)',
    limite_superado: 'Articulo 11 (Limites de Indemnizacion)',
    fraude_detectado: 'Articulo 9 (Declaracion del Siniestro)',
    documentacion_insuficiente: 'Articulo 16 (Obligaciones del Asegurado)',
    plazo_comunicacion_excedido: 'Articulo 15 (Comunicacion del Siniestro)',
    duplicado: 'Articulo 9 (Declaracion del Siniestro)',
    prexistencia: 'Articulo 10 (Deber de Declaracion)',
    uso_indebido: 'Articulo 7 (Agravacion del Riesgo)',
    negligencia_grave: 'Articulo 19 (Culpa del Asegurado)',
  };

  const hoy = new Date();
  const fechaFormateada = hoy.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Generar parrafo de alternativas
  const alternativas = _generarAlternativas(motivo || rechazo.motivo, rechazo);
  const parrafoAlternativas = alternativas.length > 0
    ? `No obstante, queremos ofrecerle las siguientes alternativas:\n${alternativas.map((a, i) => `  ${i + 1}. ${a}`).join('\n')}`
    : '';

  // Rellenar plantilla
  let carta = plantillaCarta
    .replace('{{ciudad}}', cliente.ciudad)
    .replace('{{fecha}}', fechaFormateada)
    .replace('{{nombre_cliente}}', `${cliente.nombre} ${cliente.apellido}`)
    .replace('{{direccion_cliente}}', cliente.direccion)
    .replace('{{siniestro_id}}', siniestroId)
    .replace('{{poliza_id}}', rechazo.polizaId)
    .replace('{{ramo}}', _obtenerRamo(rechazo.polizaId))
    .replace('{{apellido_cliente}}', cliente.apellido)
    .replace('{{fecha_comunicacion}}', rechazo.fecha_rechazo)
    .replace('{{descripcion_siniestro}}', rechazo.descripcion_siniestro.toLowerCase())
    .replace('{{motivo_nombre}}', motivoDetalle.nombre.toUpperCase())
    .replace('{{explicacion_detallada}}', rechazo.explicacion)
    .replace('{{articulo_ley}}', articulosLey[motivo || rechazo.motivo] || '3')
    .replace('{{clausula_poliza}}', clausulasPoliza[motivo || rechazo.motivo] || 'Articulo 3')
    .replace('{{condicion_particular}}', `Condicion Particular ${Math.floor(Math.random() * 8) + 1}a`)
    .replace('{{parrafo_alternativas}}', parrafoAlternativas);

  return carta.trim();
}

/**
 * Obtiene el ramo de una poliza a partir de su ID.
 */
function _obtenerRamo(polizaId) {
  const poliza = polizasService.polizas.find(p => p.id === polizaId);
  if (!poliza) return 'Multirriesgo';
  const ramos = {
    coche: 'Automoviles',
    hogar: 'Multirriesgo Hogar',
    vida: 'Vida Riesgo',
    salud: 'Asistencia Sanitaria',
    decesos: 'Decesos',
    viaje: 'Asistencia en Viaje',
    mascotas: 'Responsabilidad Civil Animal',
    negocio: 'Multirriesgo Comercio',
  };
  return ramos[poliza.producto] || 'Multirriesgo';
}

/**
 * Devuelve el historial completo de rechazos.
 */
function getHistorial() {
  return historialRechazos.map(r => ({
    ...r,
    motivo_detalle: motivosRechazo[r.motivo] || null,
    cliente: datosClientes[r.clienteId] || null,
  }));
}

/**
 * Calcula estadisticas de rechazos.
 */
function getEstadisticas() {
  const total = historialRechazos.length;

  // Contar por motivo
  const porMotivo = {};
  for (const r of historialRechazos) {
    const motivoNombre = motivosRechazo[r.motivo]?.nombre || r.motivo;
    porMotivo[motivoNombre] = (porMotivo[motivoNombre] || 0) + 1;
  }

  // Tasa de recurso
  const conRecurso = historialRechazos.filter(r => r.recurso_presentado).length;
  const recursosDesestimados = historialRechazos.filter(r => r.resultado_recurso === 'desestimado').length;
  const recursosEnProceso = historialRechazos.filter(r => r.resultado_recurso === 'en_proceso').length;

  // Importe total rechazado
  const importeTotalRechazado = historialRechazos.reduce((sum, r) => sum + r.importe_reclamado, 0);

  // Motivo mas frecuente
  const motivoMasFrecuente = Object.entries(porMotivo).sort((a, b) => b[1] - a[1])[0];

  // Rechazos por mes (simulado)
  const porMes = {};
  for (const r of historialRechazos) {
    const mes = r.fecha_rechazo.substring(0, 7);
    porMes[mes] = (porMes[mes] || 0) + 1;
  }

  // Tasa de rechazo estimada (sobre un total hipotetico de siniestros)
  const totalSiniestrosEstimado = 85;
  const tasaRechazo = Math.round((total / totalSiniestrosEstimado) * 10000) / 100;

  // Conversion a mejora de poliza (clientes que mejoraron su poliza tras un rechazo)
  const conversionMejoraPoliza = 3; // 3 de 12 mejoraron su poliza

  return {
    total_rechazados: total,
    por_motivo: porMotivo,
    motivo_mas_frecuente: motivoMasFrecuente ? { motivo: motivoMasFrecuente[0], cantidad: motivoMasFrecuente[1] } : null,
    importe_total_rechazado: importeTotalRechazado,
    importe_medio_rechazado: Math.round(importeTotalRechazado / total * 100) / 100,
    tasa_rechazo: `${tasaRechazo}%`,
    total_siniestros_tramitados: totalSiniestrosEstimado,
    recursos: {
      presentados: conRecurso,
      desestimados: recursosDesestimados,
      en_proceso: recursosEnProceso,
      tasa_recurso: `${Math.round((conRecurso / total) * 10000) / 100}%`,
    },
    conversion_mejora_poliza: {
      clientes_mejoraron: conversionMejoraPoliza,
      total_rechazados: total,
      tasa_conversion: `${Math.round((conversionMejoraPoliza / total) * 10000) / 100}%`,
    },
    por_mes: porMes,
    gravedad: {
      definitivos: historialRechazos.filter(r => motivosRechazo[r.motivo]?.gravedad === 'definitivo').length,
      parciales: historialRechazos.filter(r => motivosRechazo[r.motivo]?.gravedad === 'parcial').length,
      temporales: historialRechazos.filter(r => motivosRechazo[r.motivo]?.gravedad === 'temporal').length,
    },
  };
}

// ---------------------------------------------------------------------------
// EXPORTACIONES
// ---------------------------------------------------------------------------
module.exports = {
  procesarRechazo,
  generarCartaRechazo,
  getHistorial,
  getEstadisticas,
  motivosRechazo,
  historialRechazos,
  datosClientes,
};
