// =============================================================================
// Template Service - Sistema de plantillas de comunicaciones para siniestros
// =============================================================================

function generateId() {
  try {
    const { v4 } = require('uuid');
    return v4();
  } catch {
    return `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

// -----------------------------------------------------------------------------
// Estado interno
// -----------------------------------------------------------------------------

const templates = new Map();
const sendHistory = [];

// -----------------------------------------------------------------------------
// Constantes
// -----------------------------------------------------------------------------

const TEMPLATE_TYPES = [
  'aceptacion',
  'rechazo',
  'propuesta_indemnizacion',
  'apertura_parte',
  'seguimiento',
  'cierre',
  'solicitud_docs',
];

const CHANNELS = ['email', 'sms', 'whatsapp', 'carta'];

// -----------------------------------------------------------------------------
// Plantillas pre-cargadas
// -----------------------------------------------------------------------------

const DEFAULT_TEMPLATES = [
  {
    id: 'tpl_001',
    name: 'Apertura de parte',
    type: 'apertura_parte',
    channel: 'email',
    subject: 'Confirmacion de apertura de parte - Expediente {{numero_expediente}}',
    body: `Estimado/a {{nombre_cliente}},

Le confirmamos que hemos recibido su comunicacion de siniestro y hemos procedido a la apertura del expediente con numero de referencia {{numero_expediente}}.

Datos del siniestro:
- Tipo: {{tipo_siniestro}}
- Fecha del siniestro: {{fecha_siniestro}}
- Numero de poliza: {{numero_poliza}}
- Descripcion: {{descripcion}}

Un gestor de siniestros se pondra en contacto con usted en las proximas {{plazo_contacto}} horas para informarle de los siguientes pasos.

Si necesita comunicarse con nosotros, puede hacerlo a traves de:
- Telefono: 900 123 456
- Email: siniestros@aseguradora.es
- Referencia: {{numero_expediente}}

Atentamente,
Departamento de Siniestros
{{nombre_aseguradora}}`,
    variables: ['nombre_cliente', 'numero_expediente', 'tipo_siniestro', 'fecha_siniestro', 'numero_poliza', 'descripcion', 'plazo_contacto', 'nombre_aseguradora'],
    active: true,
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'tpl_002',
    name: 'Asignacion de perito',
    type: 'seguimiento',
    channel: 'sms',
    subject: 'Perito asignado - Exp. {{numero_expediente}}',
    body: `{{nombre_cliente}}, le informamos que el perito {{nombre_perito}} (tel: {{telefono_perito}}) ha sido asignado a su siniestro {{numero_expediente}}. Se pondra en contacto con usted antes del {{fecha_limite}} para coordinar la visita. Gracias.`,
    variables: ['nombre_cliente', 'nombre_perito', 'telefono_perito', 'numero_expediente', 'fecha_limite'],
    active: true,
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'tpl_003',
    name: 'Solicitud de documentacion',
    type: 'solicitud_docs',
    channel: 'email',
    subject: 'Documentacion necesaria - Expediente {{numero_expediente}}',
    body: `Estimado/a {{nombre_cliente}},

En relacion a su siniestro con numero de expediente {{numero_expediente}}, necesitamos que nos facilite la siguiente documentacion para poder continuar con la tramitacion:

{{lista_documentos}}

Le rogamos que nos envie dicha documentacion antes del {{fecha_limite}} a traves de alguno de estos medios:
- Email: documentacion@aseguradora.es (indicando en el asunto su numero de expediente)
- A traves de nuestra app movil, en la seccion "Mis siniestros"
- En cualquiera de nuestras oficinas

Le recordamos que la falta de documentacion puede retrasar la resolucion de su expediente.

Si tiene cualquier duda sobre la documentacion solicitada, no dude en contactar con su gestor {{nombre_gestor}} en el telefono {{telefono_gestor}}.

Atentamente,
Departamento de Siniestros
{{nombre_aseguradora}}`,
    variables: ['nombre_cliente', 'numero_expediente', 'lista_documentos', 'fecha_limite', 'nombre_gestor', 'telefono_gestor', 'nombre_aseguradora'],
    active: true,
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'tpl_004',
    name: 'Propuesta de indemnizacion',
    type: 'propuesta_indemnizacion',
    channel: 'carta',
    subject: 'Propuesta de indemnizacion - Expediente {{numero_expediente}}',
    body: `{{nombre_aseguradora}}
Departamento de Siniestros
{{direccion_aseguradora}}

{{ciudad}}, a {{fecha}}

Estimado/a {{nombre_cliente}}
{{direccion_cliente}}

Ref: Expediente {{numero_expediente}}
Poliza: {{numero_poliza}}

Estimado/a Sr./Sra. {{apellido_cliente}},

Tras el estudio y valoracion de su siniestro de tipo {{tipo_siniestro}} ocurrido el {{fecha_siniestro}}, y una vez analizados los informes periciales y la documentacion aportada, le comunicamos nuestra propuesta de indemnizacion:

CONCEPTO DE INDEMNIZACION:
{{desglose_conceptos}}

IMPORTE TOTAL: {{importe}} EUR

Esta propuesta se ha calculado conforme a las condiciones establecidas en su poliza {{numero_poliza}} y de acuerdo con la normativa vigente.

Tiene un plazo de 30 dias naturales desde la recepcion de esta carta para aceptar o rechazar la presente propuesta. En caso de aceptacion, el abono se realizara en un plazo maximo de 5 dias habiles mediante transferencia a la cuenta bancaria que nos facilite.

En caso de disconformidad, puede presentar sus alegaciones por escrito indicando los motivos. Le asiste el derecho a reclamar ante el Servicio de Atencion al Cliente o ante la Direccion General de Seguros.

Quedamos a su disposicion para cualquier aclaracion.

Atentamente,

{{nombre_gestor}}
Director/a de Siniestros
{{nombre_aseguradora}}`,
    variables: ['nombre_aseguradora', 'direccion_aseguradora', 'ciudad', 'fecha', 'nombre_cliente', 'direccion_cliente', 'apellido_cliente', 'numero_expediente', 'numero_poliza', 'tipo_siniestro', 'fecha_siniestro', 'desglose_conceptos', 'importe', 'nombre_gestor'],
    active: true,
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'tpl_005',
    name: 'Aceptacion de siniestro',
    type: 'aceptacion',
    channel: 'email',
    subject: 'Su siniestro ha sido aceptado - Expediente {{numero_expediente}}',
    body: `Estimado/a {{nombre_cliente}},

Nos complace comunicarle que, tras la revision y valoracion de su siniestro, hemos procedido a la ACEPTACION de su reclamacion con los siguientes datos:

- Expediente: {{numero_expediente}}
- Poliza: {{numero_poliza}}
- Tipo de siniestro: {{tipo_siniestro}}
- Fecha del siniestro: {{fecha_siniestro}}
- Importe aprobado: {{importe}} EUR

Forma de pago:
El importe de {{importe}} EUR sera abonado mediante transferencia bancaria a la cuenta que nos facilito (terminada en {{cuenta_ultimos_digitos}}) en un plazo maximo de 5 dias habiles a partir de la fecha de esta comunicacion.

Si los datos de pago no son correctos o desea modificar la cuenta de abono, por favor contacte con nosotros a la mayor brevedad.

Le informamos que con el abono de esta indemnizacion, el expediente {{numero_expediente}} quedara cerrado salvo nuevas circunstancias.

Gracias por confiar en {{nombre_aseguradora}}.

Atentamente,
{{nombre_gestor}}
Departamento de Siniestros
{{nombre_aseguradora}}`,
    variables: ['nombre_cliente', 'numero_expediente', 'numero_poliza', 'tipo_siniestro', 'fecha_siniestro', 'importe', 'cuenta_ultimos_digitos', 'nombre_gestor', 'nombre_aseguradora'],
    active: true,
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'tpl_006',
    name: 'Rechazo de siniestro',
    type: 'rechazo',
    channel: 'email',
    subject: 'Resolucion de su siniestro - Expediente {{numero_expediente}}',
    body: `Estimado/a {{nombre_cliente}},

En relacion con el siniestro comunicado con numero de expediente {{numero_expediente}}, y tras un exhaustivo analisis de la documentacion aportada, los informes periciales y las condiciones de su poliza {{numero_poliza}}, lamentamos comunicarle que no podemos proceder a la aceptacion de su reclamacion.

Motivos del rechazo:
{{motivos_rechazo}}

Base contractual:
La decision se fundamenta en {{clausulas_aplicables}} de las Condiciones Generales y Particulares de su poliza.

Vias de reclamacion:
Si no esta conforme con esta resolucion, tiene a su disposicion las siguientes opciones:
1. Presentar alegaciones por escrito en un plazo de 30 dias a: reclamaciones@aseguradora.es
2. Dirigirse al Servicio de Atencion al Cliente de {{nombre_aseguradora}}
3. Acudir al Defensor del Asegurado
4. Presentar reclamacion ante la Direccion General de Seguros y Fondos de Pensiones

Adjuntamos el informe pericial completo para su conocimiento.

Quedamos a su disposicion para cualquier aclaracion adicional.

Atentamente,
{{nombre_gestor}}
Departamento de Siniestros
{{nombre_aseguradora}}`,
    variables: ['nombre_cliente', 'numero_expediente', 'numero_poliza', 'motivos_rechazo', 'clausulas_aplicables', 'nombre_gestor', 'nombre_aseguradora'],
    active: true,
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'tpl_007',
    name: 'Seguimiento de siniestro',
    type: 'seguimiento',
    channel: 'sms',
    subject: 'Actualizacion siniestro {{numero_expediente}}',
    body: `{{nombre_cliente}}, le informamos sobre su siniestro {{numero_expediente}}: {{mensaje_estado}}. Estado actual: {{estado}}. Proximo paso: {{proximo_paso}}. Info: 900 123 456.`,
    variables: ['nombre_cliente', 'numero_expediente', 'mensaje_estado', 'estado', 'proximo_paso'],
    active: true,
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'tpl_008',
    name: 'Cierre de expediente',
    type: 'cierre',
    channel: 'email',
    subject: 'Cierre de expediente - {{numero_expediente}}',
    body: `Estimado/a {{nombre_cliente}},

Le comunicamos que el expediente {{numero_expediente}} correspondiente a su siniestro de tipo {{tipo_siniestro}} ha sido CERRADO con fecha {{fecha_cierre}}.

Resumen del expediente:
- Fecha de apertura: {{fecha_apertura}}
- Fecha de cierre: {{fecha_cierre}}
- Resolucion: {{resolucion}}
- Importe indemnizado: {{importe}} EUR
- Perito asignado: {{nombre_perito}}

{{#if importe_pagado}}
El importe de {{importe}} EUR fue abonado en su cuenta con fecha {{fecha_pago}}.
{{/if}}

Le recordamos que conservamos toda la documentacion del expediente durante 5 anios conforme a la legislacion vigente. Si necesita alguna copia o aclaracion futura, puede solicitar la reapertura del expediente citando la referencia {{numero_expediente}}.

Encuesta de satisfaccion:
Nos gustaria conocer su experiencia. Puede completar nuestra breve encuesta en: {{enlace_encuesta}}

Gracias por su confianza en {{nombre_aseguradora}}.

Atentamente,
{{nombre_gestor}}
Departamento de Siniestros
{{nombre_aseguradora}}`,
    variables: ['nombre_cliente', 'numero_expediente', 'tipo_siniestro', 'fecha_cierre', 'fecha_apertura', 'resolucion', 'importe', 'nombre_perito', 'importe_pagado', 'fecha_pago', 'enlace_encuesta', 'nombre_gestor', 'nombre_aseguradora'],
    active: true,
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'tpl_009',
    name: 'Solicitud de documentacion WhatsApp',
    type: 'solicitud_docs',
    channel: 'whatsapp',
    subject: 'Documentacion pendiente',
    body: `Hola {{nombre_cliente}}, somos {{nombre_aseguradora}}. Para avanzar con su siniestro {{numero_expediente}} necesitamos que nos envie: {{lista_documentos}}. Puede enviar fotos o documentos por este mismo chat o a documentacion@aseguradora.es. Fecha limite: {{fecha_limite}}. Gracias.`,
    variables: ['nombre_cliente', 'nombre_aseguradora', 'numero_expediente', 'lista_documentos', 'fecha_limite'],
    active: true,
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'tpl_010',
    name: 'Propuesta indemnizacion WhatsApp',
    type: 'propuesta_indemnizacion',
    channel: 'whatsapp',
    subject: 'Propuesta de indemnizacion',
    body: `Hola {{nombre_cliente}}, le informamos que hemos valorado su siniestro {{numero_expediente}}. La propuesta de indemnizacion es de {{importe}} EUR. Puede aceptar respondiendo SI a este mensaje o llamando al 900 123 456. Tiene 30 dias para responder. {{nombre_aseguradora}}.`,
    variables: ['nombre_cliente', 'numero_expediente', 'importe', 'nombre_aseguradora'],
    active: true,
    createdAt: '2025-01-10T08:00:00.000Z',
  },
];

// Cargar plantillas por defecto
DEFAULT_TEMPLATES.forEach(tpl => {
  templates.set(tpl.id, { ...tpl });
});

// -----------------------------------------------------------------------------
// Funciones principales
// -----------------------------------------------------------------------------

/**
 * Renderiza una plantilla reemplazando {{variables}} con datos reales.
 */
function render(templateId, data) {
  const template = templates.get(templateId);
  if (!template) throw new Error(`Plantilla no encontrada: ${templateId}`);
  if (!template.active) throw new Error(`Plantilla inactiva: ${templateId}`);

  let renderedSubject = template.subject || '';
  let renderedBody = template.body || '';

  // Reemplazar variables simples {{variable}}
  const variablePattern = /\{\{(\w+)\}\}/g;

  renderedSubject = renderedSubject.replace(variablePattern, (match, varName) => {
    return data[varName] !== undefined && data[varName] !== null ? String(data[varName]) : match;
  });

  renderedBody = renderedBody.replace(variablePattern, (match, varName) => {
    return data[varName] !== undefined && data[varName] !== null ? String(data[varName]) : match;
  });

  // Procesar bloques condicionales simples {{#if var}}...{{/if}}
  const conditionalPattern = /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  renderedBody = renderedBody.replace(conditionalPattern, (match, varName, content) => {
    return data[varName] ? content : '';
  });

  return {
    templateId: template.id,
    templateName: template.name,
    channel: template.channel,
    type: template.type,
    subject: renderedSubject,
    body: renderedBody,
    renderedAt: new Date().toISOString(),
    missingVariables: template.variables.filter(v => data[v] === undefined || data[v] === null),
  };
}

/**
 * Renderiza con datos de ejemplo para previsualizacion.
 */
function preview(templateId, sampleData) {
  const template = templates.get(templateId);
  if (!template) throw new Error(`Plantilla no encontrada: ${templateId}`);

  const defaultSampleData = {
    nombre_cliente: 'Juan Garcia Lopez',
    apellido_cliente: 'Garcia Lopez',
    numero_expediente: 'SIN-2025-001234',
    numero_poliza: 'POL-AUT-987654',
    tipo_siniestro: 'Accidente de trafico',
    fecha_siniestro: '15/03/2025',
    fecha: '20/03/2025',
    fecha_limite: '25/03/2025',
    fecha_apertura: '15/03/2025',
    fecha_cierre: '20/04/2025',
    fecha_pago: '22/04/2025',
    descripcion: 'Colision frontal en interseccion con semaforo',
    importe: '3.250,00',
    importe_pagado: true,
    nombre_perito: 'Maria Rodriguez Fernandez',
    telefono_perito: '612 345 678',
    nombre_gestor: 'Carlos Martinez',
    telefono_gestor: '900 123 457',
    nombre_aseguradora: 'Seguros Ejemplo S.A.',
    direccion_aseguradora: 'Calle Gran Via 28, 28013 Madrid',
    direccion_cliente: 'Avenida de la Constitucion 45, 3B, 46001 Valencia',
    ciudad: 'Madrid',
    plazo_contacto: '24',
    cuenta_ultimos_digitos: '4567',
    lista_documentos: '1) DNI en vigor, 2) Atestado policial, 3) Fotografias de los danios',
    motivos_rechazo: 'Segun el informe pericial, los danios no son compatibles con la descripcion del siniestro declarado.',
    clausulas_aplicables: 'el articulo 16 y la exclusion 3.2.a',
    desglose_conceptos: '- Reparacion de vehiculo: 2.800,00 EUR\n- Vehiculo de sustitucion: 350,00 EUR\n- Asistencia en carretera: 100,00 EUR',
    mensaje_estado: 'El perito ha completado la valoracion',
    estado: 'En valoracion',
    proximo_paso: 'Recibira propuesta de indemnizacion en 48h',
    resolucion: 'Aprobado - Indemnizacion abonada',
    enlace_encuesta: 'https://encuesta.aseguradora.es/s/abc123',
  };

  const mergedData = { ...defaultSampleData, ...(sampleData || {}) };

  // Temporarily enable inactive templates for preview
  const wasActive = template.active;
  template.active = true;
  const result = render(templateId, mergedData);
  template.active = wasActive;

  return {
    ...result,
    isPreview: true,
    sampleDataUsed: mergedData,
  };
}

// -----------------------------------------------------------------------------
// CRUD de plantillas
// -----------------------------------------------------------------------------

function createTemplate(data) {
  if (!data.name) throw new Error('El nombre de la plantilla es obligatorio');
  if (!data.type || !TEMPLATE_TYPES.includes(data.type)) {
    throw new Error(`Tipo no valido. Tipos permitidos: ${TEMPLATE_TYPES.join(', ')}`);
  }
  if (!data.channel || !CHANNELS.includes(data.channel)) {
    throw new Error(`Canal no valido. Canales permitidos: ${CHANNELS.join(', ')}`);
  }
  if (!data.body) throw new Error('El cuerpo de la plantilla es obligatorio');

  const id = data.id || generateId();

  // Extraer variables del body y subject
  const allText = (data.subject || '') + ' ' + data.body;
  const detectedVars = new Set();
  const varPattern = /\{\{(\w+)\}\}/g;
  let match;
  while ((match = varPattern.exec(allText)) !== null) {
    detectedVars.add(match[1]);
  }

  const template = {
    id,
    name: data.name,
    type: data.type,
    channel: data.channel,
    subject: data.subject || '',
    body: data.body,
    variables: data.variables || Array.from(detectedVars),
    active: data.active !== undefined ? data.active : true,
    createdAt: new Date().toISOString(),
  };

  templates.set(id, template);
  return template;
}

function updateTemplate(id, data) {
  const template = templates.get(id);
  if (!template) throw new Error(`Plantilla no encontrada: ${id}`);

  if (data.type && !TEMPLATE_TYPES.includes(data.type)) {
    throw new Error(`Tipo no valido. Tipos permitidos: ${TEMPLATE_TYPES.join(', ')}`);
  }
  if (data.channel && !CHANNELS.includes(data.channel)) {
    throw new Error(`Canal no valido. Canales permitidos: ${CHANNELS.join(', ')}`);
  }

  const updated = {
    ...template,
    ...data,
    id, // no se puede cambiar el id
  };

  // Re-detectar variables si cambia body o subject
  if (data.body || data.subject) {
    const allText = (updated.subject || '') + ' ' + updated.body;
    const detectedVars = new Set();
    const varPattern = /\{\{(\w+)\}\}/g;
    let match;
    while ((match = varPattern.exec(allText)) !== null) {
      detectedVars.add(match[1]);
    }
    updated.variables = Array.from(detectedVars);
  }

  templates.set(id, updated);
  return updated;
}

function deleteTemplate(id) {
  const template = templates.get(id);
  if (!template) throw new Error(`Plantilla no encontrada: ${id}`);

  templates.delete(id);
  return { deleted: true, id, name: template.name };
}

function getTemplate(id) {
  const template = templates.get(id);
  if (!template) throw new Error(`Plantilla no encontrada: ${id}`);
  return template;
}

function listTemplates(filters = {}) {
  let result = Array.from(templates.values());

  if (filters.type) {
    result = result.filter(t => t.type === filters.type);
  }
  if (filters.channel) {
    result = result.filter(t => t.channel === filters.channel);
  }
  if (filters.active !== undefined) {
    result = result.filter(t => t.active === filters.active);
  }
  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(t =>
      t.name.toLowerCase().includes(search) ||
      t.body.toLowerCase().includes(search) ||
      (t.subject && t.subject.toLowerCase().includes(search))
    );
  }

  return result;
}

// -----------------------------------------------------------------------------
// Historial de envios
// -----------------------------------------------------------------------------

/**
 * Registra un envio de comunicacion.
 */
function logSend(templateId, recipientId, channel, renderedContent) {
  const template = templates.get(templateId);

  const entry = {
    id: generateId(),
    templateId,
    templateName: template ? template.name : 'Desconocida',
    templateType: template ? template.type : 'desconocido',
    recipientId,
    channel,
    subject: renderedContent.subject || '',
    bodyPreview: renderedContent.body ? renderedContent.body.substring(0, 200) + '...' : '',
    fullBody: renderedContent.body || '',
    sentAt: new Date().toISOString(),
    status: 'enviado',
  };

  sendHistory.push(entry);
  return entry;
}

/**
 * Obtiene el historial filtrado.
 */
function getHistory(filters = {}) {
  let result = [...sendHistory];

  if (filters.templateId) {
    result = result.filter(h => h.templateId === filters.templateId);
  }
  if (filters.recipientId) {
    result = result.filter(h => h.recipientId === filters.recipientId);
  }
  if (filters.channel) {
    result = result.filter(h => h.channel === filters.channel);
  }
  if (filters.type) {
    result = result.filter(h => h.templateType === filters.type);
  }
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    result = result.filter(h => new Date(h.sentAt) >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    result = result.filter(h => new Date(h.sentAt) <= to);
  }

  // Ordenar por fecha mas reciente primero
  result.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

  if (filters.limit) {
    result = result.slice(0, filters.limit);
  }

  return result;
}

/**
 * Estadisticas del historial de envios.
 */
function getHistoryStats() {
  const stats = {
    totalEnvios: sendHistory.length,
    porCanal: {},
    porTipo: {},
    porPlantilla: {},
    ultimoEnvio: sendHistory.length > 0 ? sendHistory[sendHistory.length - 1].sentAt : null,
  };

  for (const entry of sendHistory) {
    stats.porCanal[entry.channel] = (stats.porCanal[entry.channel] || 0) + 1;
    stats.porTipo[entry.templateType] = (stats.porTipo[entry.templateType] || 0) + 1;
    stats.porPlantilla[entry.templateName] = (stats.porPlantilla[entry.templateName] || 0) + 1;
  }

  return stats;
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
  render,
  preview,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplate,
  listTemplates,
  logSend,
  getHistory,
  getHistoryStats,
  TEMPLATE_TYPES,
  CHANNELS,
};
