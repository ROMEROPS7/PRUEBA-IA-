// ============================================================================
// VIGILANTE AGENT - Agente Vigilante de SiniestrosAI
// El guardian incansable que nunca deja caer ningun expediente
// ============================================================================

const { v4: uuidv4 } = require('uuid');

// ---------------------------------------------------------------------------
// Base de datos en memoria de alertas y actividad
// ---------------------------------------------------------------------------

const alertas = [];
const accionesLog = [];
const feedActividad = [];
let monitoringInterval = null;

// ---------------------------------------------------------------------------
// Modelo: AlertaVigilante
// ---------------------------------------------------------------------------

function crearAlerta({ siniestroId, expediente, cliente, tipo_alerta, severidad, descripcion, accion_tomada, resultado }) {
  const alerta = {
    id: uuidv4(),
    siniestroId,
    expediente,
    cliente,
    tipo_alerta,
    severidad, // critica | alta | media | baja
    descripcion,
    accion_tomada: accion_tomada || null,
    resultado: resultado || null,
    fecha_deteccion: new Date().toISOString(),
    fecha_resolucion: null,
    resuelta: false,
  };
  alertas.push(alerta);
  return alerta;
}

// ---------------------------------------------------------------------------
// Helpers de tiempo
// ---------------------------------------------------------------------------

function horasDesde(fechaISO) {
  if (!fechaISO) return Infinity;
  return (Date.now() - new Date(fechaISO).getTime()) / (1000 * 60 * 60);
}

function diasDesde(fechaISO) {
  return horasDesde(fechaISO) / 24;
}

function registrarAccion(expediente, descripcion, tipo) {
  const entrada = {
    id: uuidv4(),
    expediente,
    descripcion,
    tipo,
    fecha: new Date().toISOString(),
  };
  accionesLog.push(entrada);
  return entrada;
}

function registrarFeed(texto) {
  feedActividad.unshift({
    id: uuidv4(),
    texto,
    fecha: new Date().toISOString(),
  });
  // Mantener maximo 100 entradas
  if (feedActividad.length > 100) feedActividad.length = 100;
}

// ---------------------------------------------------------------------------
// 14 Reglas de deteccion
// ---------------------------------------------------------------------------

const reglasDeteccion = [
  // ---- REGLA 1: Siniestro abierto +24h sin perito ----
  {
    id: 'R01',
    nombre: 'Siniestro abierto +24h sin perito asignado',
    prioridad: 1,
    timeout: '24 horas desde apertura sin perito',
    condicion: (s) => {
      const abierto = ['Abierto', 'Nuevo', 'Registrado'].includes(s.estado);
      const sinPerito = !s.perito_id && !s.perito_asignado;
      const mas24h = horasDesde(s.fecha_creacion) > 24;
      return abierto && sinPerito && mas24h;
    },
    accion: (s) => {
      const peritosDisponibles = [
        { id: 'PER-001', nombre: 'Carlos Mendez', zona: 'Madrid', especialidad: 'Auto' },
        { id: 'PER-002', nombre: 'Ana Ruiz', zona: 'Barcelona', especialidad: 'Hogar' },
        { id: 'PER-003', nombre: 'Jorge Navarro', zona: 'Valencia', especialidad: 'Auto, Hogar' },
        { id: 'PER-004', nombre: 'Maria Lopez', zona: 'Sevilla', especialidad: 'Todos' },
      ];
      const perito = peritosDisponibles.find(p => p.zona === s.zona) || peritosDisponibles[3];
      s.perito_id = perito.id;
      s.perito_asignado = perito.nombre;
      s.estado = 'Perito asignado';
      const msg = `Auto-asignado perito ${perito.nombre} (${perito.especialidad}, zona ${perito.zona}) al expediente ${s.expediente}. Llevaba ${Math.round(horasDesde(s.fecha_creacion))}h sin perito.`;
      registrarFeed(`Resuelto: ${msg}`);
      return { accion: 'auto_asignar_perito', perito: perito.nombre, mensaje: msg, resuelto: true };
    },
  },

  // ---- REGLA 2: Perito asignado +48h sin visita ----
  {
    id: 'R02',
    nombre: 'Perito asignado +48h sin realizar visita',
    prioridad: 2,
    timeout: '48 horas desde asignacion de perito sin visita registrada',
    condicion: (s) => {
      const tienePerito = !!s.perito_id || !!s.perito_asignado;
      const sinVisita = !s.visita_realizada && !s.fecha_visita_completada;
      const mas48h = horasDesde(s.fecha_asignacion_perito || s.fecha_creacion) > 48;
      return tienePerito && sinVisita && mas48h;
    },
    accion: (s) => {
      const nombrePerito = s.perito_asignado || 'Perito asignado';
      const msg = `Llamada automatica a ${nombrePerito} para expediente ${s.expediente}. Han pasado ${Math.round(horasDesde(s.fecha_asignacion_perito || s.fecha_creacion))}h sin visita. Se solicita visita urgente en las proximas 12h.`;
      registrarFeed(`Accion: Llamando a perito ${nombrePerito} por demora en visita - ${s.expediente}`);
      return { accion: 'llamar_perito', perito: nombrePerito, mensaje: msg, resuelto: false };
    },
  },

  // ---- REGLA 3: Cliente sin documentacion +72h ----
  {
    id: 'R03',
    nombre: 'Cliente sin documentacion completa +72h',
    prioridad: 3,
    timeout: '72 horas sin documentacion requerida',
    condicion: (s) => {
      const documentacionPendiente = s.documentacion_completa === false || s.docs_pendientes > 0;
      const mas72h = horasDesde(s.fecha_creacion) > 72;
      return documentacionPendiente && mas72h && s.estado !== 'Cerrado' && s.estado !== 'Resuelto';
    },
    accion: (s) => {
      const docsFaltantes = s.docs_faltantes || ['DNI', 'Fotos del siniestro', 'Parte amistoso'];
      const msg = `Enviado recordatorio WhatsApp + SMS a ${s.cliente} para expediente ${s.expediente}. Documentos pendientes: ${docsFaltantes.join(', ')}. Han pasado ${Math.round(horasDesde(s.fecha_creacion))}h sin documentacion.`;
      registrarFeed(`Enviado: Recordatorio WhatsApp + SMS a ${s.cliente} - docs pendientes ${s.expediente}`);
      return { accion: 'recordatorio_whatsapp_sms', cliente: s.cliente, docs_pendientes: docsFaltantes, mensaje: msg, resuelto: false };
    },
  },

  // ---- REGLA 4: Profesional sin confirmar ----
  {
    id: 'R04',
    nombre: 'Profesional asignado sin confirmar asistencia',
    prioridad: 2,
    timeout: '12 horas sin confirmacion del profesional',
    condicion: (s) => {
      const profesionalAsignado = !!s.profesional_id || !!s.profesional_asignado;
      const sinConfirmar = !s.profesional_confirmado;
      const mas12h = horasDesde(s.fecha_asignacion_profesional || s.fecha_creacion) > 12;
      return profesionalAsignado && sinConfirmar && mas12h && s.estado !== 'Cerrado';
    },
    accion: (s) => {
      const nombre = s.profesional_asignado || 'Profesional';
      const intentos = s.intentos_contacto_profesional || 0;
      if (intentos >= 2) {
        const nuevoProf = 'Reparaciones Express S.L.';
        s.profesional_asignado = nuevoProf;
        s.profesional_confirmado = false;
        s.intentos_contacto_profesional = 0;
        const msg = `Profesional ${nombre} no responde tras ${intentos} intentos. Reasignado a ${nuevoProf} para ${s.expediente}.`;
        registrarFeed(`Reasignado: Profesional no responde en ${s.expediente} -> ${nuevoProf}`);
        return { accion: 'reasignar_profesional', profesional_anterior: nombre, profesional_nuevo: nuevoProf, mensaje: msg, resuelto: false };
      }
      s.intentos_contacto_profesional = intentos + 1;
      const msg = `Llamada automatica a ${nombre} (intento ${intentos + 1}/2). Si no responde, se reasignara automaticamente.`;
      registrarFeed(`Accion: Llamando a profesional ${nombre} - ${s.expediente} (intento ${intentos + 1})`);
      return { accion: 'llamar_profesional', profesional: nombre, intento: intentos + 1, mensaje: msg, resuelto: false };
    },
  },

  // ---- REGLA 5: Siniestro +7 dias sin resolucion ----
  {
    id: 'R05',
    nombre: 'Siniestro abierto mas de 7 dias sin resolucion',
    prioridad: 1,
    timeout: '7 dias sin resolucion del siniestro',
    condicion: (s) => {
      const noResuelto = !['Cerrado', 'Resuelto', 'Pagado'].includes(s.estado);
      const mas7d = diasDesde(s.fecha_creacion) > 7;
      return noResuelto && mas7d;
    },
    accion: (s) => {
      const diasAbierto = Math.round(diasDesde(s.fecha_creacion));
      const resumen = {
        expediente: s.expediente,
        cliente: s.cliente,
        tipo: s.tipo,
        dias_abierto: diasAbierto,
        estado_actual: s.estado,
        perito: s.perito_asignado || 'Sin asignar',
        documentacion: s.documentacion_completa ? 'Completa' : 'Incompleta',
        ultimo_contacto: s.ultimo_contacto || 'Desconocido',
        presupuesto: s.presupuesto || 'Pendiente',
        incidencias: s.incidencias || 'Ninguna registrada',
      };
      const msg = `ESCALADO A GESTOR HUMANO: Expediente ${s.expediente} lleva ${diasAbierto} dias sin resolver. Resumen completo enviado al responsable. Cliente: ${s.cliente}, Estado: ${s.estado}, Perito: ${resumen.perito}.`;
      registrarFeed(`ESCALADO: ${s.expediente} lleva ${diasAbierto} dias -> Enviado a gestor humano con resumen completo`);
      return { accion: 'escalar_gestor_humano', resumen, mensaje: msg, resuelto: false };
    },
  },

  // ---- REGLA 6: Cliente sin contacto +12h ----
  {
    id: 'R06',
    nombre: 'Cliente sin contacto proactivo en +12h',
    prioridad: 3,
    timeout: '12 horas sin contacto con el cliente',
    condicion: (s) => {
      const activo = !['Cerrado', 'Resuelto', 'Pagado'].includes(s.estado);
      const sinContacto = horasDesde(s.ultimo_contacto_cliente) > 12;
      return activo && sinContacto;
    },
    accion: (s) => {
      const horas = Math.round(horasDesde(s.ultimo_contacto_cliente));
      s.ultimo_contacto_cliente = new Date().toISOString();
      const estadoTexto = {
        'Abierto': 'Hemos recibido su siniestro y lo estamos procesando',
        'Perito asignado': `Se ha asignado al perito ${s.perito_asignado || 'especialista'} que le contactara pronto`,
        'En gestion': 'Su expediente esta siendo gestionado activamente',
        'Pendiente documentacion': 'Necesitamos documentacion adicional para continuar',
        'Presupuesto enviado': 'Tiene un presupuesto pendiente de aprobacion',
      };
      const actualizacion = estadoTexto[s.estado] || `Su expediente esta en estado: ${s.estado}`;
      const msg = `Contacto proactivo a ${s.cliente} (${s.expediente}). Ultima comunicacion hace ${horas}h. Mensaje: "${actualizacion}". Enviado via WhatsApp.`;
      registrarFeed(`Resuelto: Cliente ${s.cliente} contactado proactivamente - ${s.expediente}`);
      return { accion: 'contacto_proactivo', cliente: s.cliente, horas_sin_contacto: horas, mensaje: msg, resuelto: true };
    },
  },

  // ---- REGLA 7: Presupuesto pendiente aprobacion +24h ----
  {
    id: 'R07',
    nombre: 'Presupuesto pendiente de aprobacion +24h',
    prioridad: 2,
    timeout: '24 horas con presupuesto sin aprobar',
    condicion: (s) => {
      const presupuestoPendiente = s.estado === 'Presupuesto enviado' || s.presupuesto_pendiente === true;
      const mas24h = horasDesde(s.fecha_presupuesto) > 24;
      return presupuestoPendiente && mas24h;
    },
    accion: (s) => {
      const horas = Math.round(horasDesde(s.fecha_presupuesto));
      const importe = s.presupuesto_importe || 'N/A';
      const msg = `Recordatorio enviado al gestor: Presupuesto de ${importe} EUR para ${s.expediente} lleva ${horas}h pendiente de aprobacion. Cliente: ${s.cliente}.`;
      registrarFeed(`Recordatorio: Presupuesto pendiente ${s.expediente} (${importe} EUR) -> Notificado gestor`);
      return { accion: 'recordatorio_presupuesto', importe, horas_pendiente: horas, mensaje: msg, resuelto: false };
    },
  },

  // ---- REGLA 8: Documentacion incompleta ----
  {
    id: 'R08',
    nombre: 'Documentacion incompleta - listar faltantes',
    prioridad: 3,
    timeout: 'Deteccion inmediata de documentos faltantes',
    condicion: (s) => {
      return s.documentacion_completa === false && s.estado !== 'Cerrado' && s.estado !== 'Resuelto';
    },
    accion: (s) => {
      const tiposDocs = {
        coche: ['DNI/NIE', 'Permiso de conducir', 'Ficha tecnica vehiculo', 'Parte amistoso', 'Fotos del siniestro', 'Informe policial (si aplica)'],
        hogar: ['DNI/NIE', 'Escritura o contrato alquiler', 'Fotos de los danos', 'Facturas de bienes danados', 'Informe bomberos (si aplica)'],
        salud: ['DNI/NIE', 'Informe medico', 'Recetas', 'Facturas medicas', 'Parte de baja (si aplica)'],
        robo: ['DNI/NIE', 'Denuncia policial', 'Inventario de objetos robados', 'Fotos (si disponibles)', 'Facturas de compra'],
      };
      const docsRequeridos = tiposDocs[s.tipo] || tiposDocs.coche;
      const docsEntregados = s.documentos_entregados || [];
      const docsFaltantes = docsRequeridos.filter(d => !docsEntregados.includes(d));
      s.docs_faltantes = docsFaltantes;
      const msg = `Documentacion incompleta para ${s.expediente}. Faltan ${docsFaltantes.length} documentos: ${docsFaltantes.join(', ')}. Se ha notificado al cliente ${s.cliente}.`;
      registrarFeed(`Detectado: Docs incompletos ${s.expediente} - Faltan: ${docsFaltantes.join(', ')}`);
      return { accion: 'listar_documentos_faltantes', docs_faltantes: docsFaltantes, docs_entregados: docsEntregados, total_requeridos: docsRequeridos.length, mensaje: msg, resuelto: false };
    },
  },

  // ---- REGLA 9: Perito no-show en cita ----
  {
    id: 'R09',
    nombre: 'Perito no acudio a la cita programada',
    prioridad: 1,
    timeout: 'Cita de perito incumplida',
    condicion: (s) => {
      if (!s.fecha_cita_perito) return false;
      const citaPasada = new Date(s.fecha_cita_perito) < new Date();
      const sinVisita = !s.visita_realizada;
      const noShow = s.perito_no_show === true;
      return (citaPasada && sinVisita) || noShow;
    },
    accion: (s) => {
      // Disculpa al cliente y reprogramar
      const nuevaFecha = new Date();
      nuevaFecha.setDate(nuevaFecha.getDate() + 1);
      nuevaFecha.setHours(10, 0, 0, 0);
      s.fecha_cita_perito = nuevaFecha.toISOString();
      s.perito_no_show = false;
      const msg = `Perito no acudio a cita para ${s.expediente}. Disculpa enviada a ${s.cliente} via WhatsApp: "Lamentamos la incidencia. Hemos reprogramado la visita para ${nuevaFecha.toLocaleDateString('es-ES')} a las 10:00. Disculpe las molestias." Nueva cita creada.`;
      registrarFeed(`URGENTE: Perito no-show ${s.expediente} -> Disculpa a cliente + nueva cita ${nuevaFecha.toLocaleDateString('es-ES')}`);
      return { accion: 'perito_noshow_reprogramar', nueva_cita: nuevaFecha.toISOString(), mensaje: msg, resuelto: false };
    },
  },

  // ---- REGLA 10: Proveedor no-show ----
  {
    id: 'R10',
    nombre: 'Proveedor no acudio a la cita programada',
    prioridad: 1,
    timeout: 'Cita de proveedor incumplida',
    condicion: (s) => {
      if (!s.fecha_cita_proveedor) return false;
      const citaPasada = new Date(s.fecha_cita_proveedor) < new Date();
      const sinServicio = !s.servicio_realizado;
      const noShow = s.proveedor_no_show === true;
      return (citaPasada && sinServicio) || noShow;
    },
    accion: (s) => {
      const proveedorOriginal = s.proveedor_asignado || 'Proveedor original';
      const alternativas = [
        'ServiHogar Urgente S.L.',
        'Reparaciones 24h Madrid',
        'TecniExpress Valencia',
        'SoluFix Barcelona',
      ];
      const alternativa = alternativas[Math.floor(Math.random() * alternativas.length)];
      s.proveedor_asignado = alternativa;
      s.proveedor_no_show = false;
      const msg = `Proveedor ${proveedorOriginal} no acudio a ${s.expediente}. Llamada realizada sin exito. Asignado proveedor alternativo: ${alternativa}. Se ha contactado al nuevo proveedor para visita urgente.`;
      registrarFeed(`Resuelto: Proveedor no-show ${s.expediente} -> Reasignado a ${alternativa}`);
      return { accion: 'proveedor_noshow_reasignar', proveedor_anterior: proveedorOriginal, proveedor_nuevo: alternativa, mensaje: msg, resuelto: false };
    },
  },

  // ---- REGLA 11: SLA en riesgo de incumplimiento ----
  {
    id: 'R11',
    nombre: 'SLA en riesgo de incumplimiento inminente',
    prioridad: 1,
    timeout: 'SLA a punto de vencer (< 2 horas)',
    condicion: (s) => {
      if (!s.sla_limite) return false;
      const horasRestantes = (new Date(s.sla_limite).getTime() - Date.now()) / (1000 * 60 * 60);
      return horasRestantes > 0 && horasRestantes < 2 && s.estado !== 'Cerrado' && s.estado !== 'Resuelto';
    },
    accion: (s) => {
      const minutosRestantes = Math.round((new Date(s.sla_limite).getTime() - Date.now()) / (1000 * 60));
      const msg = `ALERTA URGENTE SLA: Expediente ${s.expediente} a ${minutosRestantes} minutos de incumplir SLA. Estado actual: ${s.estado}. Accion inmediata requerida. Se ha notificado a todo el equipo responsable y al supervisor. Escalado automatico activado.`;
      registrarFeed(`CRITICO: SLA ${s.expediente} vence en ${minutosRestantes}min -> Alerta urgente a equipo + supervisor`);
      return { accion: 'alerta_sla_urgente', minutos_restantes: minutosRestantes, mensaje: msg, resuelto: false };
    },
  },

  // ---- REGLA 12: Cliente enfadado detectado ----
  {
    id: 'R12',
    nombre: 'Cliente enfadado detectado - escalar a senior',
    prioridad: 1,
    timeout: 'Deteccion inmediata de insatisfaccion critica',
    condicion: (s) => {
      const enfadado = s.cliente_enfadado === true || s.sentimiento === 'negativo' || s.satisfaccion < 4;
      const quejas = (s.num_quejas || 0) >= 2;
      return (enfadado || quejas) && s.estado !== 'Cerrado';
    },
    accion: (s) => {
      const quejas = s.num_quejas || 0;
      const sat = s.satisfaccion || 'N/A';
      const msg = `ESCALADO A GESTOR SENIOR: Cliente ${s.cliente} (${s.expediente}) muestra alta insatisfaccion. Satisfaccion: ${sat}/10, Quejas: ${quejas}. Motivo: ${s.motivo_queja || 'Demora en la resolucion'}. Se ha asignado al gestor senior para llamada personal inmediata.`;
      registrarFeed(`ESCALADO: Cliente enfadado ${s.cliente} (${s.expediente}) -> Gestor senior asignado`);
      return { accion: 'escalar_gestor_senior', satisfaccion: sat, quejas, mensaje: msg, resuelto: false };
    },
  },

  // ---- REGLA 13: Pago pendiente +5 dias ----
  {
    id: 'R13',
    nombre: 'Pago pendiente mas de 5 dias',
    prioridad: 2,
    timeout: '5 dias con pago pendiente de realizacion',
    condicion: (s) => {
      const pagoPendiente = s.estado === 'Pendiente pago' || s.pago_pendiente === true;
      const mas5d = diasDesde(s.fecha_aprobacion_pago || s.fecha_creacion) > 5;
      return pagoPendiente && mas5d;
    },
    accion: (s) => {
      const dias = Math.round(diasDesde(s.fecha_aprobacion_pago || s.fecha_creacion));
      const importe = s.importe_pago || s.presupuesto_importe || 'N/A';
      s.proceso_pago_activado = true;
      const msg = `Proceso de pago activado para ${s.expediente}. Importe: ${importe} EUR pendiente desde hace ${dias} dias. Se ha generado orden de pago y enviado a tesoreria. Cliente ${s.cliente} sera notificado cuando se efectue la transferencia.`;
      registrarFeed(`Accion: Pago pendiente ${dias} dias ${s.expediente} (${importe} EUR) -> Orden de pago generada`);
      return { accion: 'activar_proceso_pago', importe, dias_pendiente: dias, mensaje: msg, resuelto: false };
    },
  },

  // ---- REGLA 14: Documentos pendientes de firma +48h ----
  {
    id: 'R14',
    nombre: 'Documentos pendientes de firma digital +48h',
    prioridad: 3,
    timeout: '48 horas con documentos sin firmar',
    condicion: (s) => {
      const firmaPendiente = s.firma_pendiente === true || s.documentos_sin_firmar > 0;
      const mas48h = horasDesde(s.fecha_envio_firma) > 48;
      return firmaPendiente && mas48h && s.estado !== 'Cerrado';
    },
    accion: (s) => {
      const docs = s.documentos_sin_firmar || 1;
      const horas = Math.round(horasDesde(s.fecha_envio_firma));
      const enlace = `https://firma.siniestrosai.es/firmar/${s.expediente.replace('EXP-', '')}`;
      s.reenvio_firma = (s.reenvio_firma || 0) + 1;
      const msg = `Reenviado enlace de firma digital a ${s.cliente} (${s.expediente}). ${docs} documento(s) pendiente(s) de firma desde hace ${horas}h. Enlace: ${enlace}. Tambien enviado recordatorio por SMS.`;
      registrarFeed(`Enviado: Reenvio enlace firma ${s.expediente} a ${s.cliente} (${docs} doc(s) pendientes)`);
      return { accion: 'reenviar_enlace_firma', enlace, documentos_pendientes: docs, horas_pendiente: horas, mensaje: msg, resuelto: false };
    },
  },
];

// ---------------------------------------------------------------------------
// Datos demo: Siniestros abiertos simulados para el monitoreo
// ---------------------------------------------------------------------------

function generarSiniestrosDemo() {
  const ahora = new Date();
  const hace = (horas) => new Date(ahora.getTime() - horas * 60 * 60 * 1000).toISOString();

  return [
    // Disparara R01: abierto +24h sin perito
    { id: 's001', expediente: 'EXP-1001', cliente: 'Juan Garcia Perez', tipo: 'coche', estado: 'Abierto', zona: 'Madrid', fecha_creacion: hace(30), perito_id: null, perito_asignado: null, documentacion_completa: true, ultimo_contacto_cliente: hace(2) },
    // Disparara R02: perito +48h sin visita
    { id: 's002', expediente: 'EXP-1012', cliente: 'Maria Lopez Fernandez', tipo: 'hogar', estado: 'Perito asignado', zona: 'Barcelona', fecha_creacion: hace(72), perito_id: 'PER-002', perito_asignado: 'Ana Ruiz', fecha_asignacion_perito: hace(52), visita_realizada: false, documentacion_completa: true, ultimo_contacto_cliente: hace(6) },
    // Disparara R03: sin docs +72h
    { id: 's003', expediente: 'EXP-1023', cliente: 'Pedro Martinez Diaz', tipo: 'coche', estado: 'Pendiente documentacion', zona: 'Valencia', fecha_creacion: hace(96), perito_id: 'PER-003', perito_asignado: 'Jorge Navarro', documentacion_completa: false, docs_pendientes: 3, documentos_entregados: ['DNI/NIE'], ultimo_contacto_cliente: hace(24) },
    // Disparara R04: profesional sin confirmar
    { id: 's004', expediente: 'EXP-1034', cliente: 'Laura Sanchez Gomez', tipo: 'hogar', estado: 'En gestion', zona: 'Sevilla', fecha_creacion: hace(48), profesional_id: 'PRO-001', profesional_asignado: 'Fontaneria Express S.L.', profesional_confirmado: false, fecha_asignacion_profesional: hace(15), documentacion_completa: true, ultimo_contacto_cliente: hace(4), intentos_contacto_profesional: 0 },
    // Disparara R05: +7 dias sin resolucion
    { id: 's005', expediente: 'EXP-1045', cliente: 'Roberto Fernandez Luna', tipo: 'coche', estado: 'En gestion', zona: 'Madrid', fecha_creacion: hace(192), perito_id: 'PER-001', perito_asignado: 'Carlos Mendez', visita_realizada: true, documentacion_completa: true, ultimo_contacto_cliente: hace(48), presupuesto: '3.450 EUR' },
    // Disparara R06: sin contacto +12h
    { id: 's006', expediente: 'EXP-1056', cliente: 'Ana Moreno Ruiz', tipo: 'hogar', estado: 'En gestion', zona: 'Madrid', fecha_creacion: hace(36), perito_id: 'PER-001', perito_asignado: 'Carlos Mendez', documentacion_completa: true, ultimo_contacto_cliente: hace(18) },
    // Disparara R07: presupuesto pendiente +24h
    { id: 's007', expediente: 'EXP-1067', cliente: 'Carlos Jimenez Torres', tipo: 'coche', estado: 'Presupuesto enviado', zona: 'Valencia', fecha_creacion: hace(120), perito_id: 'PER-003', perito_asignado: 'Jorge Navarro', presupuesto_pendiente: true, fecha_presupuesto: hace(36), presupuesto_importe: '2.780', documentacion_completa: true, ultimo_contacto_cliente: hace(8) },
    // Disparara R08: documentacion incompleta
    { id: 's008', expediente: 'EXP-1078', cliente: 'Elena Rodriguez Blanco', tipo: 'robo', estado: 'Pendiente documentacion', zona: 'Barcelona', fecha_creacion: hace(48), documentacion_completa: false, docs_pendientes: 2, documentos_entregados: ['DNI/NIE', 'Denuncia policial'], ultimo_contacto_cliente: hace(10) },
    // Disparara R09: perito no-show
    { id: 's009', expediente: 'EXP-1089', cliente: 'Miguel Angel Serrano', tipo: 'hogar', estado: 'Perito asignado', zona: 'Sevilla', fecha_creacion: hace(60), perito_id: 'PER-004', perito_asignado: 'Maria Lopez', fecha_cita_perito: hace(3), visita_realizada: false, perito_no_show: true, documentacion_completa: true, ultimo_contacto_cliente: hace(5) },
    // Disparara R10: proveedor no-show
    { id: 's010', expediente: 'EXP-1090', cliente: 'Sofia Navarro Gil', tipo: 'hogar', estado: 'En gestion', zona: 'Madrid', fecha_creacion: hace(84), proveedor_asignado: 'Cristaleria Rapida S.L.', fecha_cita_proveedor: hace(2), servicio_realizado: false, proveedor_no_show: true, documentacion_completa: true, ultimo_contacto_cliente: hace(4) },
    // Disparara R11: SLA inminente
    { id: 's011', expediente: 'EXP-1101', cliente: 'David Herrera Campos', tipo: 'coche', estado: 'En gestion', zona: 'Barcelona', fecha_creacion: hace(46), perito_id: 'PER-002', perito_asignado: 'Ana Ruiz', sla_limite: new Date(ahora.getTime() + 90 * 60 * 1000).toISOString(), documentacion_completa: true, ultimo_contacto_cliente: hace(3) },
    // Disparara R12: cliente enfadado
    { id: 's012', expediente: 'EXP-1112', cliente: 'Carmen Vega Ortiz', tipo: 'coche', estado: 'En gestion', zona: 'Madrid', fecha_creacion: hace(168), perito_id: 'PER-001', perito_asignado: 'Carlos Mendez', cliente_enfadado: true, satisfaccion: 2, num_quejas: 3, motivo_queja: 'Demora excesiva y falta de comunicacion', documentacion_completa: true, ultimo_contacto_cliente: hace(36) },
    // Disparara R13: pago pendiente +5 dias
    { id: 's013', expediente: 'EXP-1123', cliente: 'Alejandro Ruiz Mendez', tipo: 'hogar', estado: 'Pendiente pago', zona: 'Valencia', fecha_creacion: hace(360), pago_pendiente: true, fecha_aprobacion_pago: hace(144), importe_pago: '5.200', documentacion_completa: true, ultimo_contacto_cliente: hace(24) },
    // Disparara R14: firma pendiente +48h
    { id: 's014', expediente: 'EXP-1134', cliente: 'Isabel Torres Navarro', tipo: 'coche', estado: 'En gestion', zona: 'Sevilla', fecha_creacion: hace(96), firma_pendiente: true, documentos_sin_firmar: 2, fecha_envio_firma: hace(60), documentacion_completa: true, ultimo_contacto_cliente: hace(10) },

    // Siniestros normales (sin alertas - semaforo verde)
    { id: 's015', expediente: 'EXP-1145', cliente: 'Pablo Diaz Martin', tipo: 'coche', estado: 'En gestion', zona: 'Madrid', fecha_creacion: hace(12), perito_id: 'PER-001', perito_asignado: 'Carlos Mendez', documentacion_completa: true, ultimo_contacto_cliente: hace(2) },
    { id: 's016', expediente: 'EXP-1156', cliente: 'Lucia Herrera Sanz', tipo: 'hogar', estado: 'Perito asignado', zona: 'Barcelona', fecha_creacion: hace(8), perito_id: 'PER-002', perito_asignado: 'Ana Ruiz', fecha_asignacion_perito: hace(4), documentacion_completa: true, ultimo_contacto_cliente: hace(1) },

    // Mas siniestros para disparo de multiples reglas
    // R01 + R06 combo
    { id: 's017', expediente: 'EXP-1167', cliente: 'Fernando Castillo Rios', tipo: 'robo', estado: 'Abierto', zona: 'Valencia', fecha_creacion: hace(28), perito_id: null, perito_asignado: null, documentacion_completa: false, docs_pendientes: 4, documentos_entregados: [], ultimo_contacto_cliente: hace(20) },
    // R05 + R12 combo
    { id: 's018', expediente: 'EXP-1178', cliente: 'Raquel Prieto Vega', tipo: 'hogar', estado: 'En gestion', zona: 'Sevilla', fecha_creacion: hace(240), perito_id: 'PER-004', perito_asignado: 'Maria Lopez', visita_realizada: true, documentacion_completa: true, cliente_enfadado: true, satisfaccion: 3, num_quejas: 2, motivo_queja: 'Lleva mas de una semana sin solucion', ultimo_contacto_cliente: hace(30) },
    // R02 + R03 combo
    { id: 's019', expediente: 'EXP-1189', cliente: 'Antonio Molina Cruz', tipo: 'coche', estado: 'Perito asignado', zona: 'Madrid', fecha_creacion: hace(100), perito_id: 'PER-001', perito_asignado: 'Carlos Mendez', fecha_asignacion_perito: hace(55), visita_realizada: false, documentacion_completa: false, docs_pendientes: 2, documentos_entregados: ['DNI/NIE', 'Fotos del siniestro'], ultimo_contacto_cliente: hace(15) },
    // Cerrado (no deberia disparar nada)
    { id: 's020', expediente: 'EXP-1190', cliente: 'Marta Iglesias Soto', tipo: 'hogar', estado: 'Cerrado', zona: 'Barcelona', fecha_creacion: hace(300), documentacion_completa: true, ultimo_contacto_cliente: hace(72) },
  ];
}

// ---------------------------------------------------------------------------
// Pre-poblar alertas historicas (20+ alertas, mix resueltas y pendientes)
// ---------------------------------------------------------------------------

function inicializarAlertasHistoricas() {
  if (alertas.length > 0) return; // Ya inicializado

  const ahora = new Date();
  const hace = (horas) => new Date(ahora.getTime() - horas * 60 * 60 * 1000).toISOString();

  const alertasIniciales = [
    // --- Resueltas ---
    { siniestroId: 's101', expediente: 'EXP-0901', cliente: 'Jorge Blanco Rios', tipo_alerta: 'R01', severidad: 'alta', descripcion: 'Siniestro abierto 26h sin perito', accion_tomada: 'Auto-asignado perito Carlos Mendez', resultado: 'Perito asignado correctamente, visita programada', fecha_deteccion: hace(72), fecha_resolucion: hace(71), resuelta: true },
    { siniestroId: 's102', expediente: 'EXP-0912', cliente: 'Pilar Vega Santos', tipo_alerta: 'R03', severidad: 'media', descripcion: 'Cliente sin documentacion 80h', accion_tomada: 'Enviado WhatsApp + SMS recordatorio', resultado: 'Cliente envio documentacion 4h despues del recordatorio', fecha_deteccion: hace(68), fecha_resolucion: hace(64), resuelta: true },
    { siniestroId: 's103', expediente: 'EXP-0923', cliente: 'Andres Romero Gil', tipo_alerta: 'R06', severidad: 'baja', descripcion: 'Sin contacto con cliente 14h', accion_tomada: 'Contacto proactivo via WhatsApp con actualizacion', resultado: 'Cliente satisfecho con la comunicacion', fecha_deteccion: hace(60), fecha_resolucion: hace(60), resuelta: true },
    { siniestroId: 's104', expediente: 'EXP-0934', cliente: 'Teresa Gimenez Lara', tipo_alerta: 'R09', severidad: 'critica', descripcion: 'Perito no acudio a cita programada', accion_tomada: 'Disculpa enviada al cliente, cita reprogramada', resultado: 'Nueva cita completada exitosamente al dia siguiente', fecha_deteccion: hace(96), fecha_resolucion: hace(72), resuelta: true },
    { siniestroId: 's105', expediente: 'EXP-0945', cliente: 'Marcos Diaz Pena', tipo_alerta: 'R04', severidad: 'alta', descripcion: 'Profesional sin confirmar 18h', accion_tomada: 'Llamada al profesional, confirmo asistencia', resultado: 'Profesional confirmo y acudio a la cita', fecha_deteccion: hace(48), fecha_resolucion: hace(46), resuelta: true },
    { siniestroId: 's106', expediente: 'EXP-0956', cliente: 'Silvia Campos Ortega', tipo_alerta: 'R14', severidad: 'media', descripcion: 'Documentos sin firmar 52h', accion_tomada: 'Reenviado enlace de firma digital + SMS', resultado: 'Cliente firmo 2h despues del reenvio', fecha_deteccion: hace(52), fecha_resolucion: hace(50), resuelta: true },
    { siniestroId: 's107', expediente: 'EXP-0967', cliente: 'Ricardo Perez Soto', tipo_alerta: 'R13', severidad: 'alta', descripcion: 'Pago pendiente 6 dias', accion_tomada: 'Orden de pago generada y enviada a tesoreria', resultado: 'Transferencia realizada exitosamente', fecha_deteccion: hace(120), fecha_resolucion: hace(96), resuelta: true },
    { siniestroId: 's108', expediente: 'EXP-0978', cliente: 'Beatriz Herrera Martin', tipo_alerta: 'R07', severidad: 'media', descripcion: 'Presupuesto pendiente aprobacion 30h', accion_tomada: 'Recordatorio al gestor con detalles del presupuesto', resultado: 'Gestor aprobo presupuesto en la siguiente hora', fecha_deteccion: hace(40), fecha_resolucion: hace(38), resuelta: true },
    { siniestroId: 's109', expediente: 'EXP-0989', cliente: 'Javier Morales Cruz', tipo_alerta: 'R10', severidad: 'critica', descripcion: 'Proveedor no acudio a cita', accion_tomada: 'Reasignado a proveedor alternativo ServiHogar Urgente', resultado: 'Nuevo proveedor acudio y realizo el servicio', fecha_deteccion: hace(84), fecha_resolucion: hace(72), resuelta: true },
    { siniestroId: 's110', expediente: 'EXP-0990', cliente: 'Natalia Ruiz Vega', tipo_alerta: 'R12', severidad: 'critica', descripcion: 'Cliente enfadada - satisfaccion 1/10', accion_tomada: 'Escalado a gestor senior, llamada personal', resultado: 'Gestor senior resolvio incidencia, satisfaccion subio a 7/10', fecha_deteccion: hace(36), fecha_resolucion: hace(30), resuelta: true },
    { siniestroId: 's111', expediente: 'EXP-0991', cliente: 'Alberto Sanchez Blanco', tipo_alerta: 'R11', severidad: 'critica', descripcion: 'SLA a 45 minutos de vencer', accion_tomada: 'Alerta urgente a equipo + accion inmediata del supervisor', resultado: 'SLA cumplido con 12 minutos de margen', fecha_deteccion: hace(24), fecha_resolucion: hace(23), resuelta: true },
    { siniestroId: 's112', expediente: 'EXP-0992', cliente: 'Cristina Navarro Rios', tipo_alerta: 'R02', severidad: 'alta', descripcion: 'Perito asignado 50h sin visita', accion_tomada: 'Llamada al perito solicitando visita urgente', resultado: 'Perito realizo visita al dia siguiente', fecha_deteccion: hace(50), fecha_resolucion: hace(26), resuelta: true },
    { siniestroId: 's113', expediente: 'EXP-0993', cliente: 'Daniel Torres Mendez', tipo_alerta: 'R05', severidad: 'alta', descripcion: 'Siniestro abierto 9 dias sin resolucion', accion_tomada: 'Escalado a gestor humano con resumen completo', resultado: 'Gestor tomo control y resolvio en 48h', fecha_deteccion: hace(48), fecha_resolucion: hace(20), resuelta: true },

    // --- Pendientes (no resueltas) ---
    { siniestroId: 's012', expediente: 'EXP-1112', cliente: 'Carmen Vega Ortiz', tipo_alerta: 'R12', severidad: 'critica', descripcion: 'Cliente muy enfadada - satisfaccion 2/10, 3 quejas', accion_tomada: 'Escalado a gestor senior', resultado: null, fecha_deteccion: hace(6), fecha_resolucion: null, resuelta: false },
    { siniestroId: 's005', expediente: 'EXP-1045', cliente: 'Roberto Fernandez Luna', tipo_alerta: 'R05', severidad: 'alta', descripcion: 'Siniestro abierto 8 dias sin resolucion', accion_tomada: 'Resumen enviado al gestor humano', resultado: null, fecha_deteccion: hace(4), fecha_resolucion: null, resuelta: false },
    { siniestroId: 's013', expediente: 'EXP-1123', cliente: 'Alejandro Ruiz Mendez', tipo_alerta: 'R13', severidad: 'alta', descripcion: 'Pago pendiente 6 dias', accion_tomada: 'Orden de pago generada', resultado: null, fecha_deteccion: hace(3), fecha_resolucion: null, resuelta: false },
    { siniestroId: 's011', expediente: 'EXP-1101', cliente: 'David Herrera Campos', tipo_alerta: 'R11', severidad: 'critica', descripcion: 'SLA a 90 minutos de vencer', accion_tomada: 'Alerta urgente enviada al equipo', resultado: null, fecha_deteccion: hace(1), fecha_resolucion: null, resuelta: false },
    { siniestroId: 's009', expediente: 'EXP-1089', cliente: 'Miguel Angel Serrano', tipo_alerta: 'R09', severidad: 'critica', descripcion: 'Perito no acudio a la cita', accion_tomada: 'Disculpa enviada, reprogramando cita', resultado: null, fecha_deteccion: hace(2), fecha_resolucion: null, resuelta: false },
    { siniestroId: 's002', expediente: 'EXP-1012', cliente: 'Maria Lopez Fernandez', tipo_alerta: 'R02', severidad: 'alta', descripcion: 'Perito Ana Ruiz asignada hace 52h sin visita', accion_tomada: 'Llamada realizada al perito', resultado: null, fecha_deteccion: hace(4), fecha_resolucion: null, resuelta: false },
    { siniestroId: 's014', expediente: 'EXP-1134', cliente: 'Isabel Torres Navarro', tipo_alerta: 'R14', severidad: 'media', descripcion: '2 documentos pendientes de firma 60h', accion_tomada: 'Enlace de firma reenviado', resultado: null, fecha_deteccion: hace(8), fecha_resolucion: null, resuelta: false },
    { siniestroId: 's018', expediente: 'EXP-1178', cliente: 'Raquel Prieto Vega', tipo_alerta: 'R05', severidad: 'alta', descripcion: 'Siniestro abierto 10 dias, cliente enfadada', accion_tomada: 'Doble escalacion: gestor humano + gestor senior', resultado: null, fecha_deteccion: hace(5), fecha_resolucion: null, resuelta: false },
  ];

  for (const a of alertasIniciales) {
    alertas.push({
      id: uuidv4(),
      siniestroId: a.siniestroId,
      expediente: a.expediente,
      cliente: a.cliente,
      tipo_alerta: a.tipo_alerta,
      severidad: a.severidad,
      descripcion: a.descripcion,
      accion_tomada: a.accion_tomada,
      resultado: a.resultado,
      fecha_deteccion: a.fecha_deteccion,
      fecha_resolucion: a.fecha_resolucion,
      resuelta: a.resuelta,
    });
  }
}

// ---------------------------------------------------------------------------
// Pre-poblar feed de actividad (15+ entradas)
// ---------------------------------------------------------------------------

function inicializarFeedActividad() {
  if (feedActividad.length > 0) return;

  const ahora = new Date();
  const hace = (minutos) => new Date(ahora.getTime() - minutos * 60 * 1000).toISOString();

  const entradas = [
    { texto: 'Detectado: Perito sin confirmar EXP-1034 -> Llamando a Fontaneria Express S.L...', fecha: hace(5) },
    { texto: 'Resuelto: Cliente contactado proactivamente EXP-1056 - Ana Moreno Ruiz informada del estado', fecha: hace(12) },
    { texto: 'CRITICO: SLA EXP-1101 vence en 90min -> Alerta urgente a equipo + supervisor', fecha: hace(18) },
    { texto: 'Accion: Pago pendiente 6 dias EXP-1123 (5.200 EUR) -> Orden de pago generada', fecha: hace(25) },
    { texto: 'ESCALADO: Cliente enfadado Carmen Vega Ortiz (EXP-1112) -> Gestor senior asignado', fecha: hace(35) },
    { texto: 'URGENTE: Perito no-show EXP-1089 -> Disculpa a cliente + nueva cita programada', fecha: hace(42) },
    { texto: 'Enviado: Reenvio enlace firma EXP-1134 a Isabel Torres Navarro (2 docs pendientes)', fecha: hace(55) },
    { texto: 'Resuelto: Auto-asignado perito Carlos Mendez a EXP-0901. Visita programada manana 09:00', fecha: hace(70) },
    { texto: 'Detectado: Docs incompletos EXP-1078 - Faltan: Inventario de objetos robados, Fotos, Facturas', fecha: hace(85) },
    { texto: 'Resuelto: Proveedor no-show EXP-1090 -> Reasignado a ServiHogar Urgente S.L.', fecha: hace(98) },
    { texto: 'Accion: Llamando a perito Ana Ruiz por demora en visita - EXP-1012 (52h sin visita)', fecha: hace(110) },
    { texto: 'Enviado: Recordatorio WhatsApp + SMS a Pedro Martinez Diaz - docs pendientes EXP-1023', fecha: hace(130) },
    { texto: 'Recordatorio: Presupuesto pendiente EXP-1067 (2.780 EUR) -> Notificado gestor', fecha: hace(150) },
    { texto: 'ESCALADO: EXP-1045 lleva 8 dias -> Enviado a gestor humano con resumen completo', fecha: hace(180) },
    { texto: 'Resuelto: Cliente Natalia Ruiz Vega (EXP-0990) - Gestor senior resolvio, satisfaccion 1->7/10', fecha: hace(210) },
    { texto: 'Resuelto: SLA EXP-0991 cumplido con 12 minutos de margen tras intervencion urgente', fecha: hace(240) },
    { texto: 'Monitoreo ciclico completado: 20 siniestros revisados, 8 alertas nuevas, 3 resueltas auto', fecha: hace(300) },
  ];

  for (const e of entradas) {
    feedActividad.push({
      id: uuidv4(),
      texto: e.texto,
      fecha: e.fecha,
    });
  }
}

// ---------------------------------------------------------------------------
// Funciones principales
// ---------------------------------------------------------------------------

/**
 * monitorear() - Funcion principal. Revisa TODOS los siniestros abiertos
 * contra las 14 reglas. Retorna array de alertas detectadas con acciones.
 */
function monitorear() {
  inicializarAlertasHistoricas();
  inicializarFeedActividad();

  const siniestros = generarSiniestrosDemo();
  const alertasDetectadas = [];

  for (const siniestro of siniestros) {
    for (const regla of reglasDeteccion) {
      try {
        if (regla.condicion(siniestro)) {
          const resultado = regla.accion(siniestro);

          const severidadMap = {
            1: 'critica',
            2: 'alta',
            3: 'media',
          };

          const alerta = crearAlerta({
            siniestroId: siniestro.id,
            expediente: siniestro.expediente,
            cliente: siniestro.cliente,
            tipo_alerta: regla.id,
            severidad: severidadMap[regla.prioridad] || 'baja',
            descripcion: resultado.mensaje,
            accion_tomada: resultado.accion,
            resultado: resultado.resuelto ? 'Resuelto automaticamente' : 'Pendiente de seguimiento',
          });

          if (resultado.resuelto) {
            alerta.resuelta = true;
            alerta.fecha_resolucion = new Date().toISOString();
          }

          registrarAccion(siniestro.expediente, resultado.mensaje, resultado.accion);

          alertasDetectadas.push({
            alerta_id: alerta.id,
            regla: regla.id,
            regla_nombre: regla.nombre,
            expediente: siniestro.expediente,
            cliente: siniestro.cliente,
            severidad: alerta.severidad,
            accion: resultado.accion,
            mensaje: resultado.mensaje,
            resuelto_auto: resultado.resuelto,
          });
        }
      } catch (err) {
        console.error(`[Vigilante] Error evaluando regla ${regla.id} en ${siniestro.expediente}:`, err.message);
      }
    }
  }

  // Registrar resumen en feed
  const criticas = alertasDetectadas.filter(a => a.severidad === 'critica').length;
  const resueltas = alertasDetectadas.filter(a => a.resuelto_auto).length;
  registrarFeed(`Monitoreo ciclico completado: ${siniestros.length} siniestros revisados, ${alertasDetectadas.length} alertas nuevas (${criticas} criticas), ${resueltas} resueltas automaticamente`);

  return {
    fecha_monitoreo: new Date().toISOString(),
    total_siniestros_revisados: siniestros.length,
    alertas_detectadas: alertasDetectadas.length,
    alertas_criticas: criticas,
    resueltas_automaticamente: resueltas,
    pendientes_accion: alertasDetectadas.length - resueltas,
    detalle: alertasDetectadas,
  };
}

/**
 * getAlertasActivas() - Retorna alertas no resueltas
 */
function getAlertasActivas() {
  inicializarAlertasHistoricas();
  return alertas
    .filter(a => !a.resuelta)
    .sort((a, b) => {
      const sevOrden = { critica: 0, alta: 1, media: 2, baja: 3 };
      return (sevOrden[a.severidad] || 4) - (sevOrden[b.severidad] || 4);
    });
}

/**
 * getAccionesHoy() - Retorna todas las acciones realizadas hoy
 */
function getAccionesHoy() {
  inicializarAlertasHistoricas();
  const hoyInicio = new Date();
  hoyInicio.setHours(0, 0, 0, 0);
  const hoyStr = hoyInicio.toISOString();

  // Incluir acciones del log y alertas de hoy
  const accionesDelDia = accionesLog.filter(a => a.fecha >= hoyStr);
  const alertasHoy = alertas.filter(a => a.fecha_deteccion >= hoyStr);

  return {
    fecha: new Date().toISOString().split('T')[0],
    total_acciones: accionesDelDia.length + alertasHoy.length,
    acciones: accionesDelDia,
    alertas_generadas_hoy: alertasHoy.map(a => ({
      id: a.id,
      expediente: a.expediente,
      tipo: a.tipo_alerta,
      severidad: a.severidad,
      descripcion: a.descripcion,
      resuelta: a.resuelta,
    })),
  };
}

/**
 * resolverAlerta(alertaId, accion) - Resolver manualmente una alerta
 */
function resolverAlerta(alertaId, accion) {
  const alerta = alertas.find(a => a.id === alertaId);
  if (!alerta) {
    return { error: true, mensaje: `Alerta ${alertaId} no encontrada` };
  }
  if (alerta.resuelta) {
    return { error: true, mensaje: `Alerta ${alertaId} ya estaba resuelta desde ${alerta.fecha_resolucion}` };
  }

  alerta.resuelta = true;
  alerta.fecha_resolucion = new Date().toISOString();
  alerta.resultado = accion || 'Resuelta manualmente por operador';

  registrarAccion(alerta.expediente, `Alerta ${alerta.tipo_alerta} resuelta manualmente: ${accion}`, 'resolucion_manual');
  registrarFeed(`Resuelto manual: ${alerta.expediente} - ${alerta.tipo_alerta} - ${accion}`);

  return {
    error: false,
    mensaje: `Alerta resuelta correctamente`,
    alerta: {
      id: alerta.id,
      expediente: alerta.expediente,
      tipo_alerta: alerta.tipo_alerta,
      resultado: alerta.resultado,
      fecha_resolucion: alerta.fecha_resolucion,
    },
  };
}

/**
 * getEstadisticas() - Estadisticas generales del vigilante
 */
function getEstadisticas() {
  inicializarAlertasHistoricas();

  const hoyInicio = new Date();
  hoyInicio.setHours(0, 0, 0, 0);
  const hoyStr = hoyInicio.toISOString();

  const siniestros = generarSiniestrosDemo();
  const activos = siniestros.filter(s => !['Cerrado', 'Resuelto', 'Pagado'].includes(s.estado));

  const alertasHoy = alertas.filter(a => a.fecha_deteccion >= hoyStr);
  const resueltasAuto = alertas.filter(a => a.resuelta && a.resultado && a.resultado.includes('automaticamente'));
  const pendientes = alertas.filter(a => !a.resuelta);

  // Tiempo medio abierto de siniestros activos
  const tiemposAbiertos = activos.map(s => horasDesde(s.fecha_creacion));
  const tiempoMedio = tiemposAbiertos.length > 0
    ? Math.round(tiemposAbiertos.reduce((sum, t) => sum + t, 0) / tiemposAbiertos.length)
    : 0;

  // Expedientes rescatados = alertas criticas resueltas
  const rescatados = alertas.filter(a => a.resuelta && (a.severidad === 'critica' || a.severidad === 'alta')).length;

  // Desglose por tipo de alerta
  const desglosePorTipo = {};
  for (const regla of reglasDeteccion) {
    const del_tipo = alertas.filter(a => a.tipo_alerta === regla.id);
    desglosePorTipo[regla.id] = {
      nombre: regla.nombre,
      total: del_tipo.length,
      resueltas: del_tipo.filter(a => a.resuelta).length,
      pendientes: del_tipo.filter(a => !a.resuelta).length,
    };
  }

  // Desglose por severidad
  const desgloseSeveridad = {
    critica: alertas.filter(a => a.severidad === 'critica').length,
    alta: alertas.filter(a => a.severidad === 'alta').length,
    media: alertas.filter(a => a.severidad === 'media').length,
    baja: alertas.filter(a => a.severidad === 'baja').length,
  };

  return {
    fecha: new Date().toISOString(),
    total_monitoreados: activos.length,
    alertas_detectadas_hoy: alertasHoy.length,
    alertas_resueltas_auto: resueltasAuto.length,
    alertas_pendientes: pendientes.length,
    expedientes_rescatados: rescatados,
    tiempo_medio_abiertos: `${tiempoMedio}h (${Math.round(tiempoMedio / 24)} dias)`,
    total_alertas_historicas: alertas.length,
    tasa_resolucion: alertas.length > 0
      ? `${Math.round((alertas.filter(a => a.resuelta).length / alertas.length) * 100)}%`
      : '0%',
    desglose_por_tipo: desglosePorTipo,
    desglose_severidad: desgloseSeveridad,
  };
}

/**
 * getSemaforoSiniestros() - Semaforo de estado para cada siniestro abierto
 * verde: todo en orden
 * amarillo: necesita atencion pronto
 * rojo: accion inmediata requerida
 * negro: bloqueado, agente interviniendo
 */
function getSemaforoSiniestros() {
  inicializarAlertasHistoricas();
  const siniestros = generarSiniestrosDemo();

  return siniestros
    .filter(s => s.estado !== 'Cerrado' && s.estado !== 'Resuelto' && s.estado !== 'Pagado')
    .map(s => {
      const alertasExp = alertas.filter(a => a.expediente === s.expediente && !a.resuelta);
      const severidades = alertasExp.map(a => a.severidad);

      let semaforo, motivo;

      if (severidades.includes('critica')) {
        // Verificar si hay intervencion activa (negro)
        const intervencionActiva = alertasExp.some(a =>
          a.accion_tomada && (
            a.accion_tomada.includes('escalar') ||
            a.accion_tomada.includes('noshow') ||
            a.accion_tomada.includes('sla')
          )
        );
        if (intervencionActiva) {
          semaforo = 'negro';
          motivo = 'Bloqueado - Agente interviniendo activamente';
        } else {
          semaforo = 'rojo';
          motivo = 'Accion inmediata requerida';
        }
      } else if (severidades.includes('alta')) {
        semaforo = 'rojo';
        motivo = 'Problemas detectados que requieren atencion urgente';
      } else if (severidades.includes('media')) {
        semaforo = 'amarillo';
        motivo = 'Necesita atencion pronto';
      } else if (alertasExp.length > 0) {
        semaforo = 'amarillo';
        motivo = 'Alertas menores pendientes';
      } else {
        // Sin alertas, pero verificar tiempos
        const horasAbierto = horasDesde(s.fecha_creacion);
        if (horasAbierto > 120) { // +5 dias
          semaforo = 'amarillo';
          motivo = `Abierto hace ${Math.round(horasAbierto / 24)} dias, vigilar de cerca`;
        } else {
          semaforo = 'verde';
          motivo = 'Todo en orden, sin incidencias';
        }
      }

      return {
        expediente: s.expediente,
        cliente: s.cliente,
        tipo: s.tipo,
        estado: s.estado,
        semaforo,
        motivo,
        alertas_activas: alertasExp.length,
        detalle_alertas: alertasExp.map(a => ({
          tipo: a.tipo_alerta,
          severidad: a.severidad,
          descripcion: a.descripcion,
        })),
        horas_abierto: Math.round(horasDesde(s.fecha_creacion)),
        dias_abierto: Math.round(diasDesde(s.fecha_creacion)),
      };
    })
    .sort((a, b) => {
      const orden = { negro: 0, rojo: 1, amarillo: 2, verde: 3 };
      return (orden[a.semaforo] || 4) - (orden[b.semaforo] || 4);
    });
}

/**
 * startMonitoring(intervalMs) - Inicia monitoreo periodico
 */
function startMonitoring(intervalMs = 1800000) {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
  }

  console.log(`[Vigilante] Monitoreo periodico iniciado. Intervalo: ${intervalMs / 1000}s (${intervalMs / 60000} minutos)`);
  registrarFeed(`Sistema: Monitoreo periodico activado cada ${intervalMs / 60000} minutos`);

  // Ejecutar inmediatamente la primera vez
  const resultadoInicial = monitorear();
  console.log(`[Vigilante] Monitoreo inicial: ${resultadoInicial.alertas_detectadas} alertas detectadas`);

  // Programar ejecucion periodica
  monitoringInterval = setInterval(() => {
    try {
      const resultado = monitorear();
      console.log(`[Vigilante] Ciclo monitoreo: ${resultado.alertas_detectadas} alertas, ${resultado.alertas_criticas} criticas, ${resultado.resueltas_automaticamente} resueltas auto`);
    } catch (err) {
      console.error('[Vigilante] Error en ciclo de monitoreo:', err.message);
    }
  }, intervalMs);

  return {
    mensaje: 'Monitoreo periodico activado',
    intervalo: `${intervalMs / 60000} minutos`,
    primer_resultado: resultadoInicial,
  };
}

/**
 * stopMonitoring() - Detiene el monitoreo periodico
 */
function stopMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    registrarFeed('Sistema: Monitoreo periodico detenido');
    return { mensaje: 'Monitoreo periodico detenido' };
  }
  return { mensaje: 'No habia monitoreo activo' };
}

// ---------------------------------------------------------------------------
// Inicializar datos al cargar el modulo
// ---------------------------------------------------------------------------
inicializarAlertasHistoricas();
inicializarFeedActividad();

// ---------------------------------------------------------------------------
// Exportaciones
// ---------------------------------------------------------------------------

module.exports = {
  // Funciones principales
  monitorear,
  getAlertasActivas,
  getAccionesHoy,
  resolverAlerta,
  getEstadisticas,
  getSemaforoSiniestros,
  startMonitoring,
  stopMonitoring,

  // Datos accesibles
  reglasDeteccion,
  alertas,
  accionesLog,
  feedActividad,

  // Helpers (para testing/integracion)
  crearAlerta,
  registrarAccion,
  registrarFeed,
  generarSiniestrosDemo,
};
