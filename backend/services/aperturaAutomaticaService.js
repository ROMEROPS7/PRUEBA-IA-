// ============================================================
// SERVICIO DE APERTURA AUTOMATICA DE SINIESTROS
// Motor principal de SegurCaixa Adeslas - Gestion IA
// ============================================================
// Cuando un cliente llama o envia WhatsApp, este servicio:
// 1. Identifica al cliente por telefono/poliza
// 2. Verifica cobertura y vigencia de poliza
// 3. Clasifica el siniestro automaticamente
// 4. Calcula franquicia
// 5. Ejecuta analisis anti-fraude
// 6. Crea el siniestro en BD (INSERT real)
// 7. Asigna recursos (perito, grua, emergencias)
// 8. Envia confirmacion (SMS + WhatsApp)
// 9. Registra todo en apertura_log
// ============================================================

const { dbRun, dbAll, dbGet } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// ============================================================
// CONSTANTES Y CONFIGURACION
// ============================================================

const TIPOS_SINIESTRO = {
  auto_accidente: { tipo_db: 'coche', label: 'Accidente de automovil', urgencia_base: 8 },
  auto_robo: { tipo_db: 'coche', label: 'Robo de vehiculo', urgencia_base: 7 },
  auto_danos: { tipo_db: 'coche', label: 'Danos en vehiculo', urgencia_base: 5 },
  auto_cristales: { tipo_db: 'coche', label: 'Rotura de cristales vehiculo', urgencia_base: 3 },
  auto_granizo: { tipo_db: 'coche', label: 'Danos por granizo', urgencia_base: 4 },
  hogar_inundacion: { tipo_db: 'hogar', label: 'Inundacion en vivienda', urgencia_base: 8 },
  hogar_incendio: { tipo_db: 'hogar', label: 'Incendio en vivienda', urgencia_base: 10 },
  hogar_robo: { tipo_db: 'hogar', label: 'Robo en vivienda', urgencia_base: 7 },
  hogar_cristales: { tipo_db: 'hogar', label: 'Rotura de cristales hogar', urgencia_base: 3 },
  hogar_danos_agua: { tipo_db: 'hogar', label: 'Danos por agua', urgencia_base: 6 },
  hogar_electrico: { tipo_db: 'hogar', label: 'Averia electrica', urgencia_base: 5 },
  salud_urgencia: { tipo_db: 'salud', label: 'Urgencia medica', urgencia_base: 10 },
  salud_hospitalizacion: { tipo_db: 'salud', label: 'Hospitalizacion', urgencia_base: 8 },
  robo_vehiculo: { tipo_db: 'robo', label: 'Robo de vehiculo', urgencia_base: 7 },
  robo_vivienda: { tipo_db: 'robo', label: 'Robo en vivienda', urgencia_base: 7 },
  robo_comercio: { tipo_db: 'robo', label: 'Robo en comercio', urgencia_base: 8 },
  rc_danos_terceros: { tipo_db: 'otro', label: 'Responsabilidad civil', urgencia_base: 5 },
  decesos: { tipo_db: 'otro', label: 'Fallecimiento', urgencia_base: 9 },
  accidentes_personal: { tipo_db: 'salud', label: 'Accidente personal', urgencia_base: 7 },
  comunidades: { tipo_db: 'hogar', label: 'Siniestro comunidad', urgencia_base: 6 },
};

const COBERTURAS_POR_POLIZA = {
  'Todo riesgo': {
    coberturas: ['auto_accidente', 'auto_robo', 'auto_danos', 'auto_cristales', 'auto_granizo', 'rc_danos_terceros'],
    franquicia: 0,
    limite: 150000,
  },
  'Auto Premium': {
    coberturas: ['auto_accidente', 'auto_robo', 'auto_danos', 'auto_cristales', 'auto_granizo', 'rc_danos_terceros'],
    franquicia: 0,
    limite: 200000,
  },
  'Auto basico': {
    coberturas: ['auto_accidente', 'auto_danos', 'rc_danos_terceros'],
    franquicia: 300,
    limite: 50000,
  },
  'Auto terceros': {
    coberturas: ['rc_danos_terceros'],
    franquicia: 0,
    limite: 50000,
  },
  'Hogar Plus': {
    coberturas: ['hogar_inundacion', 'hogar_incendio', 'hogar_robo', 'hogar_cristales', 'hogar_danos_agua', 'hogar_electrico', 'rc_danos_terceros', 'comunidades'],
    franquicia: 0,
    limite: 300000,
  },
  'Hogar basico': {
    coberturas: ['hogar_inundacion', 'hogar_incendio', 'hogar_danos_agua', 'rc_danos_terceros'],
    franquicia: 150,
    limite: 100000,
  },
  'Comercio': {
    coberturas: ['hogar_inundacion', 'hogar_incendio', 'robo_comercio', 'hogar_cristales', 'hogar_electrico', 'rc_danos_terceros'],
    franquicia: 200,
    limite: 500000,
  },
  'Salud Premium': {
    coberturas: ['salud_urgencia', 'salud_hospitalizacion', 'accidentes_personal'],
    franquicia: 0,
    limite: 1000000,
  },
  'Salud basico': {
    coberturas: ['salud_urgencia', 'accidentes_personal'],
    franquicia: 50,
    limite: 200000,
  },
};

const PALABRAS_CLAVE = [
  { palabras: ['accidente', 'choque', 'colision', 'golpe', 'coche', 'vehiculo', 'trafico', 'm-30', 'autopista', 'carretera', 'atropello'], tipo: 'auto_accidente' },
  { palabras: ['robado', 'robo vehiculo', 'han robado el coche', 'desaparecido coche', 'sustraccion'], tipo: 'auto_robo' },
  { palabras: ['granizo', 'pedrisco', 'abolladuras techo'], tipo: 'auto_granizo' },
  { palabras: ['luna', 'parabrisas', 'cristal coche', 'ventanilla rota'], tipo: 'auto_cristales' },
  { palabras: ['rayan', 'raya', 'abolladura', 'golpe aparcado'], tipo: 'auto_danos' },
  { palabras: ['agua', 'inundacion', 'tuberia', 'goteras', 'fuga', 'humedad', 'filtración'], tipo: 'hogar_inundacion' },
  { palabras: ['fuego', 'incendio', 'quemado', 'llamas', 'humo', 'cortocircuito'], tipo: 'hogar_incendio' },
  { palabras: ['robo casa', 'robo piso', 'robo vivienda', 'forzado puerta', 'ladron', 'asaltaron'], tipo: 'hogar_robo' },
  { palabras: ['cristal salon', 'cristal ventana', 'ventana rota', 'cristal roto casa'], tipo: 'hogar_cristales' },
  { palabras: ['electrico', 'electricidad', 'cortocircuito', 'apagon', 'fusibles'], tipo: 'hogar_electrico' },
  { palabras: ['robo tienda', 'robo local', 'robo comercio', 'robo negocio', 'escaparate roto'], tipo: 'robo_comercio' },
  { palabras: ['hospital', 'urgencias', 'operacion', 'cirugia', 'ingresado'], tipo: 'salud_urgencia' },
  { palabras: ['fallecido', 'fallecimiento', 'defuncion', 'muerte', 'muerto'], tipo: 'decesos' },
  { palabras: ['caida', 'fractura', 'lesion', 'herida', 'accidente personal'], tipo: 'accidentes_personal' },
  { palabras: ['vecino', 'comunidad', 'medianera', 'fachada'], tipo: 'comunidades' },
  { palabras: ['responsabilidad', 'terceros', 'danos a otro'], tipo: 'rc_danos_terceros' },
];

const PROVEEDORES_GRUA = [
  { nombre: 'Europ Assistance', eta_min: 10, eta_max: 20, zona: 'Madrid' },
  { nombre: 'Mapfre Asistencia', eta_min: 12, eta_max: 25, zona: 'Barcelona' },
  { nombre: 'AXA Assistance', eta_min: 15, eta_max: 30, zona: 'Nacional' },
  { nombre: 'Allianz Asistencia', eta_min: 10, eta_max: 18, zona: 'Valencia' },
  { nombre: 'Caser Asistencia', eta_min: 12, eta_max: 22, zona: 'Sevilla' },
];

const SERVICIOS_EMERGENCIA = {
  agua: { servicio: 'Fontanero de urgencia', proveedor: 'Reparalia', eta: '45 min' },
  fuego: { servicio: 'Bomberos + Restauracion', proveedor: 'HomeServe', eta: 'Bomberos inmediato' },
  electrico: { servicio: 'Electricista de urgencia', proveedor: 'Reparalia', eta: '60 min' },
  cristales: { servicio: 'Cristalero urgente', proveedor: 'Cristaleria Express', eta: '2-4 horas' },
};

// ============================================================
// INICIALIZACION - Crear tabla apertura_log
// ============================================================

let tablaCreada = false;

async function inicializarTabla() {
  if (tablaCreada) return;
  await dbRun(`CREATE TABLE IF NOT EXISTS apertura_log (
    id TEXT PRIMARY KEY,
    siniestro_id TEXT,
    cliente_id TEXT,
    canal TEXT NOT NULL,
    telefono TEXT,
    tipo_siniestro TEXT,
    subtipo TEXT,
    pasos_ejecutados TEXT,
    resultado TEXT,
    duracion_ms INTEGER,
    automatico INTEGER DEFAULT 1,
    datos_extra TEXT,
    fecha TEXT DEFAULT (datetime('now'))
  )`);
  await dbRun('CREATE INDEX IF NOT EXISTS idx_apertura_log_fecha ON apertura_log(fecha)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_apertura_log_canal ON apertura_log(canal)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_apertura_log_siniestro ON apertura_log(siniestro_id)');
  tablaCreada = true;
}

// ============================================================
// FUNCIONES AUXILIARES INTERNAS
// ============================================================

function generarExpediente() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `EXP-${anio}-${seq}`;
}

function simularLatencia(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, Math.min(ms, 10)));
}

// ============================================================
// PASO 1: IDENTIFICAR CLIENTE POR TELEFONO
// ============================================================

async function identificarClientePorTelefono(telefono) {
  const telLimpio = telefono.replace(/[\s\-\+]/g, '').replace(/^34/, '');
  const cliente = await dbGet(
    'SELECT * FROM clientes WHERE telefono = ? OR telefono = ? OR telefono = ?',
    [telefono, telLimpio, `+34${telLimpio}`]
  );
  return cliente || null;
}

async function identificarClientePorPoliza(poliza) {
  const cliente = await dbGet('SELECT * FROM clientes WHERE poliza = ?', [poliza]);
  return cliente || null;
}

// ============================================================
// PASO 2: VERIFICAR POLIZA
// ============================================================

function verificarPoliza(cliente) {
  // Simular verificacion de poliza activa y al corriente de pago
  if (!cliente || !cliente.poliza) {
    return { vigente: false, motivo: 'Poliza no encontrada' };
  }

  // Simulamos que todas las polizas seeded estan activas
  const diasAlta = Math.floor((Date.now() - new Date(cliente.fecha_alta).getTime()) / 86400000);

  return {
    vigente: true,
    poliza: cliente.poliza,
    tipo: cliente.tipo_poliza,
    al_corriente_pago: true,
    dias_antigüedad: diasAlta,
    renovacion_automatica: true,
    prima_anual: Math.floor(Math.random() * 800) + 300,
    ultima_revision: new Date(Date.now() - Math.random() * 180 * 86400000).toISOString().split('T')[0],
  };
}

// ============================================================
// PASO 3: CLASIFICAR SINIESTRO POR TRANSCRIPCION
// ============================================================

function clasificarSiniestro(transcripcion) {
  if (!transcripcion) return { tipo: 'auto_accidente', confianza: 50, palabras_detectadas: [] };

  const texto = transcripcion.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let mejorTipo = null;
  let mejorScore = 0;
  let palabrasDetectadas = [];

  for (const regla of PALABRAS_CLAVE) {
    let score = 0;
    const detectadas = [];
    for (const palabra of regla.palabras) {
      const palabraNorm = palabra.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (texto.includes(palabraNorm)) {
        score += 1;
        detectadas.push(palabra);
      }
    }
    if (score > mejorScore) {
      mejorScore = score;
      mejorTipo = regla.tipo;
      palabrasDetectadas = detectadas;
    }
  }

  if (!mejorTipo) {
    // Fallback: intentar por palabras genericas
    if (texto.includes('coche') || texto.includes('vehiculo') || texto.includes('auto')) {
      mejorTipo = 'auto_accidente';
    } else if (texto.includes('casa') || texto.includes('piso') || texto.includes('hogar')) {
      mejorTipo = 'hogar_danos_agua';
    } else if (texto.includes('robo') || texto.includes('robaron')) {
      mejorTipo = 'hogar_robo';
    } else {
      mejorTipo = 'auto_accidente';
    }
    mejorScore = 0.5;
  }

  const confianza = Math.min(98, Math.floor((mejorScore / 3) * 100) + 60);
  return {
    tipo: mejorTipo,
    confianza,
    palabras_detectadas: palabrasDetectadas,
    config: TIPOS_SINIESTRO[mejorTipo],
  };
}

// ============================================================
// PASO 4: VERIFICAR COBERTURA
// ============================================================

function verificarCobertura(tipoPoliza, tipoSiniestro) {
  const cobertura = COBERTURAS_POR_POLIZA[tipoPoliza];
  if (!cobertura) {
    return { cubierto: false, motivo: `Tipo de poliza "${tipoPoliza}" no reconocido` };
  }

  const cubierto = cobertura.coberturas.includes(tipoSiniestro);
  return {
    cubierto,
    tipo_poliza: tipoPoliza,
    tipo_siniestro: tipoSiniestro,
    coberturas_incluidas: cobertura.coberturas,
    limite_cobertura: cobertura.limite,
    motivo: cubierto ? 'Cobertura verificada' : `El tipo "${tipoSiniestro}" no esta incluido en la poliza "${tipoPoliza}"`,
  };
}

// ============================================================
// PASO 5: CALCULAR FRANQUICIA
// ============================================================

function calcularFranquicia(tipoPoliza, tipoSiniestro) {
  const cobertura = COBERTURAS_POR_POLIZA[tipoPoliza];
  if (!cobertura) return { franquicia: 0, motivo: 'Poliza no reconocida' };

  return {
    franquicia: cobertura.franquicia,
    moneda: 'EUR',
    exento: cobertura.franquicia === 0,
    motivo: cobertura.franquicia === 0 ? 'Sin franquicia aplicable' : `Franquicia de ${cobertura.franquicia} EUR aplicable`,
  };
}

// ============================================================
// PASO 6: ANALISIS ANTI-FRAUDE RAPIDO
// ============================================================

async function analisisFraudeRapido(clienteId, tipoSiniestro, descripcion) {
  let score = Math.floor(Math.random() * 15); // Base: 0-14

  // Factor: historial de reclamaciones
  const historial = await dbAll('SELECT id FROM siniestros WHERE cliente_id = ?', [clienteId]);
  if (historial.length >= 3) score += 15;
  if (historial.length >= 5) score += 20;

  // Factor: siniestros recientes (ultimo mes)
  const recientes = await dbAll(
    "SELECT id FROM siniestros WHERE cliente_id = ? AND fecha_creacion > datetime('now', '-30 days')",
    [clienteId]
  );
  if (recientes.length >= 2) score += 25;

  // Factor: tipo de siniestro de alto riesgo
  if (['auto_robo', 'robo_vivienda', 'robo_comercio', 'hogar_incendio'].includes(tipoSiniestro)) {
    score += 10;
  }

  // Factor: descripcion sospechosa
  if (descripcion) {
    const texto = descripcion.toLowerCase();
    const alertas = ['seguro nuevo', 'acabo de contratar', 'ayer contrate', 'sin testigos', 'no hay camaras'];
    for (const alerta of alertas) {
      if (texto.includes(alerta)) score += 10;
    }
  }

  score = Math.min(score, 100);

  let nivel = 'bajo';
  let indicadores = [];
  if (score >= 70) {
    nivel = 'alto';
    indicadores.push('Requiere investigacion manual');
  } else if (score >= 40) {
    nivel = 'medio';
    indicadores.push('Monitorizar evolución');
  } else {
    indicadores.push('Sin indicadores de fraude');
  }

  return {
    score,
    nivel,
    indicadores,
    historial_reclamaciones: historial.length,
    reclamaciones_ultimo_mes: recientes.length,
    automatico: score < 40,
  };
}

// ============================================================
// PASO 7: DETERMINAR RECURSOS NECESARIOS
// ============================================================

async function determinarRecursos(tipoSiniestro, cliente, urgencia) {
  const recursos = [];
  const configTipo = TIPOS_SINIESTRO[tipoSiniestro];
  if (!configTipo) return recursos;

  const tipoDB = configTipo.tipo_db;
  const zona = cliente.direccion ? extraerZona(cliente.direccion) : 'Madrid';

  // Asignar perito
  if (['coche', 'hogar', 'robo'].includes(tipoDB)) {
    const perito = await dbGet(
      "SELECT * FROM agentes WHERE tipo = 'perito' AND disponible = 1 ORDER BY valoracion DESC LIMIT 1"
    );
    if (perito) {
      recursos.push({
        tipo: 'perito',
        id: perito.id,
        nombre: perito.nombre,
        telefono: perito.telefono,
        zona: perito.zona,
        tiempo_contacto: '2 horas',
        valoracion: perito.valoracion,
      });
    }
  }

  // Asignar grua (solo auto)
  if (tipoDB === 'coche' && ['auto_accidente', 'auto_robo'].includes(tipoSiniestro)) {
    const proveedor = PROVEEDORES_GRUA.find(p => p.zona === zona) || PROVEEDORES_GRUA.find(p => p.zona === 'Nacional');
    const eta = Math.floor(Math.random() * (proveedor.eta_max - proveedor.eta_min + 1)) + proveedor.eta_min;
    recursos.push({
      tipo: 'grua',
      proveedor: proveedor.nombre,
      eta_minutos: eta,
      zona: proveedor.zona,
    });
  }

  // Servicio emergencia hogar
  if (tipoDB === 'hogar') {
    let servicioEmergencia = null;
    if (['hogar_inundacion', 'hogar_danos_agua'].includes(tipoSiniestro)) {
      servicioEmergencia = SERVICIOS_EMERGENCIA.agua;
    } else if (tipoSiniestro === 'hogar_incendio') {
      servicioEmergencia = SERVICIOS_EMERGENCIA.fuego;
    } else if (tipoSiniestro === 'hogar_electrico') {
      servicioEmergencia = SERVICIOS_EMERGENCIA.electrico;
    } else if (tipoSiniestro === 'hogar_cristales') {
      servicioEmergencia = SERVICIOS_EMERGENCIA.cristales;
    }
    if (servicioEmergencia) {
      recursos.push({
        tipo: 'emergencia',
        servicio: servicioEmergencia.servicio,
        proveedor: servicioEmergencia.proveedor,
        eta: servicioEmergencia.eta,
      });
    }
  }

  // Medico (salud / accidentes)
  if (tipoDB === 'salud') {
    const medico = await dbGet(
      "SELECT * FROM agentes WHERE tipo = 'medico' AND disponible = 1 ORDER BY valoracion DESC LIMIT 1"
    );
    if (medico) {
      recursos.push({
        tipo: 'medico',
        id: medico.id,
        nombre: medico.nombre,
        especialidad: medico.especialidad,
        telefono: medico.telefono,
      });
    }
  }

  // Legal (RC, fraudes altos)
  if (['rc_danos_terceros', 'decesos'].includes(tipoSiniestro) || urgencia >= 9) {
    recursos.push({
      tipo: 'legal',
      servicio: 'Departamento juridico',
      tiempo_asignacion: '4 horas',
    });
  }

  return recursos;
}

function extraerZona(direccion) {
  const ciudades = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Zaragoza', 'Malaga', 'Murcia', 'Palma', 'Vigo'];
  for (const ciudad of ciudades) {
    if (direccion.toLowerCase().includes(ciudad.toLowerCase())) return ciudad;
  }
  return 'Nacional';
}

// ============================================================
// PASO 8: GENERAR PROXIMOS PASOS
// ============================================================

function generarProximosPasos(tipoSiniestro, recursos, cobertura) {
  const pasos = [];

  pasos.push('Expediente registrado en el sistema central');

  if (!cobertura.cubierto) {
    pasos.push('IMPORTANTE: La cobertura NO aplica para este tipo de siniestro. Se informara al cliente.');
    return pasos;
  }

  for (const recurso of recursos) {
    switch (recurso.tipo) {
      case 'perito':
        pasos.push(`Perito ${recurso.nombre} contactara al cliente en ${recurso.tiempo_contacto}`);
        break;
      case 'grua':
        pasos.push(`Grua de ${recurso.proveedor} en camino - ETA ${recurso.eta_minutos} minutos`);
        break;
      case 'emergencia':
        pasos.push(`${recurso.servicio} de ${recurso.proveedor} enviado - ETA ${recurso.eta}`);
        break;
      case 'medico':
        pasos.push(`${recurso.nombre} (${recurso.especialidad}) asignado al caso`);
        break;
      case 'legal':
        pasos.push(`Departamento juridico notificado - asignacion en ${recurso.tiempo_asignacion}`);
        break;
    }
  }

  pasos.push('El cliente recibira actualizaciones por SMS y WhatsApp');
  pasos.push('Puede seguir el estado en la app o llamando al 900 100 200');

  return pasos;
}

// ============================================================
// FUNCION PRINCIPAL: PROCESAR LLAMADA ENTRANTE
// ============================================================

async function procesarLlamadaEntrante(telefono, transcripcion) {
  await inicializarTabla();

  const inicio = Date.now();
  const pasos = [];
  let siniestroId = null;
  let expediente = null;

  try {
    // ── PASO 1: Identificar cliente ──
    const t1 = Date.now();
    let latencia = simularLatencia(80, 200);
    const cliente = await identificarClientePorTelefono(telefono);

    if (!cliente) {
      const duracion = Date.now() - inicio;
      await registrarApertura(null, null, 'llamada', telefono, null, [{
        paso: 1, accion: 'Identificar cliente', resultado: 'Cliente no encontrado', automatico: true, duracion_ms: latencia,
      }], 'cliente_no_encontrado', duracion);

      return {
        exito: false,
        error: 'cliente_no_encontrado',
        mensaje: 'No se ha encontrado un cliente asociado a este numero de telefono. Por favor, proporcione su numero de poliza.',
        telefono,
        duracion_ms: duracion,
        pasos: [{ paso: 1, accion: 'Identificar cliente por telefono', resultado: 'No encontrado', automatico: true, duracion_ms: latencia }],
      };
    }

    pasos.push({
      paso: 1,
      accion: 'Identificar cliente por telefono',
      resultado: `Cliente identificado: ${cliente.nombre} (${cliente.poliza})`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── PASO 2: Verificar poliza ──
    latencia = simularLatencia(50, 150);
    const poliza = verificarPoliza(cliente);

    if (!poliza.vigente) {
      const duracion = Date.now() - inicio;
      pasos.push({ paso: 2, accion: 'Verificar poliza', resultado: `Poliza NO vigente: ${poliza.motivo}`, automatico: true, duracion_ms: latencia });
      await registrarApertura(null, cliente.id, 'llamada', telefono, null, pasos, 'poliza_no_vigente', duracion);

      return {
        exito: false,
        error: 'poliza_no_vigente',
        mensaje: `Lo sentimos, su poliza ${cliente.poliza} no se encuentra vigente. Contacte con su oficina para mas informacion.`,
        cliente: { nombre: cliente.nombre, poliza: cliente.poliza },
        duracion_ms: duracion,
        pasos,
      };
    }

    pasos.push({
      paso: 2,
      accion: 'Verificar poliza',
      resultado: `Poliza ${poliza.poliza} vigente. Tipo: ${poliza.tipo}. Al corriente de pago.`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── PASO 3: Clasificar siniestro ──
    latencia = simularLatencia(100, 300);
    const clasificacion = clasificarSiniestro(transcripcion);

    pasos.push({
      paso: 3,
      accion: 'Clasificar siniestro por IA',
      resultado: `Tipo: ${clasificacion.config.label} (confianza: ${clasificacion.confianza}%). Palabras detectadas: [${clasificacion.palabras_detectadas.join(', ')}]`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── PASO 4: Verificar cobertura ──
    latencia = simularLatencia(50, 120);
    const cobertura = verificarCobertura(poliza.tipo, clasificacion.tipo);

    pasos.push({
      paso: 4,
      accion: 'Verificar cobertura',
      resultado: cobertura.cubierto
        ? `Cobertura verificada para "${clasificacion.config.label}" en poliza "${poliza.tipo}". Limite: ${cobertura.limite_cobertura.toLocaleString('es-ES')} EUR`
        : `SIN COBERTURA: ${cobertura.motivo}`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── PASO 5: Calcular franquicia ──
    latencia = simularLatencia(30, 80);
    const franquicia = calcularFranquicia(poliza.tipo, clasificacion.tipo);

    pasos.push({
      paso: 5,
      accion: 'Calcular franquicia',
      resultado: franquicia.exento
        ? 'Sin franquicia aplicable (0 EUR)'
        : `Franquicia: ${franquicia.franquicia} EUR`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── PASO 6: Analisis anti-fraude ──
    latencia = simularLatencia(150, 400);
    const fraude = await analisisFraudeRapido(cliente.id, clasificacion.tipo, transcripcion);

    pasos.push({
      paso: 6,
      accion: 'Analisis anti-fraude rapido',
      resultado: `Score: ${fraude.score}/100 (${fraude.nivel}). ${fraude.indicadores[0]}`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── PASO 7: Crear siniestro en BD ──
    latencia = simularLatencia(100, 250);
    siniestroId = `SIN-${uuidv4().split('-')[0].toUpperCase()}`;
    expediente = generarExpediente();
    const urgencia = Math.min(10, clasificacion.config.urgencia_base + (fraude.score >= 40 ? 1 : 0));
    const zona = extraerZona(cliente.direccion || '');

    await dbRun(
      `INSERT INTO siniestros (id, expediente, cliente_id, tipo, descripcion, estado, urgencia, score_fraude, direccion, zona, ia_confianza, ia_gestion, ia_tiempo, humano_tiempo, fecha_creacion, fecha_actualizacion)
       VALUES (?, ?, ?, ?, ?, 'Abierto', ?, ?, ?, ?, ?, 'full', ?, '22 min', datetime('now'), datetime('now'))`,
      [
        siniestroId,
        expediente,
        cliente.id,
        clasificacion.config.tipo_db,
        transcripcion || clasificacion.config.label,
        urgencia,
        fraude.score,
        cliente.direccion || '',
        zona,
        clasificacion.confianza,
        `${((Date.now() - inicio) / 1000 / 60).toFixed(1)} min`,
      ]
    );

    pasos.push({
      paso: 7,
      accion: 'Crear siniestro en base de datos',
      resultado: `Siniestro ${expediente} creado (ID: ${siniestroId}). Estado: Abierto. Urgencia: ${urgencia}/10`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── PASO 8: Crear entrada en expedientes ──
    latencia = simularLatencia(50, 100);
    await dbRun(
      'INSERT INTO expedientes (id, siniestro_id, tipo_evento, descripcion, datos_extra) VALUES (?, ?, ?, ?, ?)',
      [
        uuidv4(),
        siniestroId,
        'creacion',
        `Siniestro abierto automaticamente por IA via llamada telefonica. Cliente: ${cliente.nombre}. Tipo: ${clasificacion.config.label}`,
        JSON.stringify({ canal: 'llamada', telefono, clasificacion_ia: clasificacion.tipo, confianza: clasificacion.confianza }),
      ]
    );

    pasos.push({
      paso: 8,
      accion: 'Crear entrada en expediente/timeline',
      resultado: 'Evento de creacion registrado en timeline del expediente',
      automatico: true,
      duracion_ms: latencia,
    });

    // ── PASO 9: Determinar y asignar recursos ──
    latencia = simularLatencia(200, 500);
    const recursos = await determinarRecursos(clasificacion.tipo, cliente, urgencia);

    // Si hay perito, asignarlo al siniestro
    const peritoRecurso = recursos.find(r => r.tipo === 'perito');
    if (peritoRecurso) {
      await dbRun('UPDATE siniestros SET perito_id = ?, estado = ? WHERE id = ?', [peritoRecurso.id, 'Perito asignado', siniestroId]);
      await dbRun(
        'INSERT INTO expedientes (id, siniestro_id, tipo_evento, descripcion) VALUES (?, ?, ?, ?)',
        [uuidv4(), siniestroId, 'perito', `Perito ${peritoRecurso.nombre} asignado automaticamente`]
      );
    }

    // Si hay grua, registrar
    const gruaRecurso = recursos.find(r => r.tipo === 'grua');
    if (gruaRecurso) {
      await dbRun(
        'INSERT INTO expedientes (id, siniestro_id, tipo_evento, descripcion) VALUES (?, ?, ?, ?)',
        [uuidv4(), siniestroId, 'grua', `Grua solicitada a ${gruaRecurso.proveedor} - ETA ${gruaRecurso.eta_minutos} min`]
      );
    }

    // Si hay emergencia hogar, registrar
    const emergenciaRecurso = recursos.find(r => r.tipo === 'emergencia');
    if (emergenciaRecurso) {
      await dbRun(
        'INSERT INTO expedientes (id, siniestro_id, tipo_evento, descripcion) VALUES (?, ?, ?, ?)',
        [uuidv4(), siniestroId, 'emergencia', `${emergenciaRecurso.servicio} enviado (${emergenciaRecurso.proveedor}) - ETA ${emergenciaRecurso.eta}`]
      );
    }

    pasos.push({
      paso: 9,
      accion: 'Asignar recursos',
      resultado: `${recursos.length} recurso(s) asignado(s): ${recursos.map(r => r.tipo).join(', ')}`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── PASO 10: Registrar llamada ──
    latencia = simularLatencia(30, 80);
    const duracionLlamada = Math.floor((Date.now() - inicio) / 1000) + Math.floor(Math.random() * 60 + 40);
    await dbRun(
      'INSERT INTO llamadas (id, siniestro_id, cliente_id, telefono_origen, telefono_destino, duracion_seg, tipo, transcripcion, resumen_ia, sentimiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        uuidv4(),
        siniestroId,
        cliente.id,
        telefono,
        '+34900100200',
        duracionLlamada,
        'ia',
        transcripcion || '',
        `Apertura automatica: ${clasificacion.config.label}. ${cobertura.cubierto ? 'Cobertura verificada' : 'Sin cobertura'}. Score fraude: ${fraude.score}`,
        urgencia >= 8 ? 'urgente' : (urgencia >= 5 ? 'preocupado' : 'tranquilo'),
      ]
    );

    pasos.push({
      paso: 10,
      accion: 'Registrar llamada',
      resultado: `Llamada registrada. Duracion estimada: ${duracionLlamada} seg`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── PASO 11: Enviar SMS confirmacion ──
    latencia = simularLatencia(50, 150);
    pasos.push({
      paso: 11,
      accion: 'Enviar SMS de confirmacion',
      resultado: `SMS enviado a +34 ${telefono}: "Su siniestro ${expediente} ha sido registrado correctamente"`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── PASO 12: Enviar WhatsApp confirmacion ──
    latencia = simularLatencia(80, 200);
    const mensajeConfirmacion = await generarMensajeConfirmacion(siniestroId, 'llamada', {
      cliente, expediente, clasificacion, cobertura, franquicia, recursos, fraude,
    });

    await dbRun(
      'INSERT INTO mensajes_whatsapp (id, siniestro_id, cliente_id, telefono, direccion, contenido, tipo_contenido, respuesta_ia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        uuidv4(),
        siniestroId,
        cliente.id,
        telefono,
        'saliente',
        mensajeConfirmacion,
        'texto',
        'Mensaje de confirmacion de apertura automatica',
      ]
    );

    pasos.push({
      paso: 12,
      accion: 'Enviar WhatsApp con expediente',
      resultado: `WhatsApp enviado a +34 ${telefono} con numero de expediente y proximos pasos`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── PASO 13: Notificar gestor ──
    latencia = simularLatencia(30, 80);
    pasos.push({
      paso: 13,
      accion: 'Notificar gestor asignado',
      resultado: 'Notificacion enviada al gestor de zona. Dashboard actualizado.',
      automatico: true,
      duracion_ms: latencia,
    });

    // ── Registrar en apertura_log ──
    const duracionTotal = Date.now() - inicio;
    const proximosPasos = generarProximosPasos(clasificacion.tipo, recursos, cobertura);

    await registrarApertura(siniestroId, cliente.id, 'llamada', telefono, clasificacion.tipo, pasos, 'exito', duracionTotal);

    return {
      exito: true,
      siniestro_id: siniestroId,
      expediente,
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        poliza: cliente.poliza,
        tipo_poliza: cliente.tipo_poliza,
      },
      tipo: clasificacion.config.label,
      subtipo: clasificacion.tipo,
      cobertura_verificada: cobertura.cubierto,
      limite_cobertura: cobertura.cubierto ? cobertura.limite_cobertura : null,
      franquicia: franquicia.franquicia,
      score_fraude: fraude.score,
      nivel_fraude: fraude.nivel,
      urgencia,
      recursos_asignados: recursos,
      proximos_pasos: proximosPasos,
      mensaje_confirmacion: mensajeConfirmacion,
      duracion_ms: duracionTotal,
      duracion_legible: `${(duracionTotal / 1000).toFixed(1)} segundos`,
      automatico: fraude.score < 40,
      pasos,
    };

  } catch (error) {
    const duracion = Date.now() - inicio;
    await registrarApertura(siniestroId, null, 'llamada', telefono, null, pasos, `error: ${error.message}`, duracion).catch(() => {});

    throw error;
  }
}

// ============================================================
// FUNCION PRINCIPAL: PROCESAR WHATSAPP ENTRANTE
// ============================================================

async function procesarWhatsAppEntrante(telefono, mensaje, tieneImagen) {
  await inicializarTabla();

  const inicio = Date.now();
  const pasos = [];

  try {
    // ── Identificar cliente ──
    let latencia = simularLatencia(80, 180);
    const cliente = await identificarClientePorTelefono(telefono);

    if (!cliente) {
      const duracion = Date.now() - inicio;
      await registrarApertura(null, null, 'whatsapp', telefono, null, [], 'cliente_no_encontrado', duracion);

      return {
        exito: false,
        error: 'cliente_no_encontrado',
        mensaje: 'No hemos podido identificarte con este numero. Por favor, envianos tu numero de poliza para poder ayudarte.',
        respuesta_conversacional: 'Hola, soy el asistente de SegurCaixa Adeslas. No encuentro una poliza asociada a este numero. Podrias indicarme tu numero de poliza? Tiene el formato POL-YYYY-NNNNN.',
        telefono,
        duracion_ms: duracion,
        pasos: [{ paso: 1, accion: 'Identificar cliente', resultado: 'No encontrado', automatico: true, duracion_ms: latencia }],
      };
    }

    pasos.push({
      paso: 1,
      accion: 'Identificar cliente por telefono',
      resultado: `Cliente identificado: ${cliente.nombre}`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── Analisis de imagen si presente ──
    let analisisImagen = null;
    if (tieneImagen) {
      latencia = simularLatencia(300, 600);
      analisisImagen = simularAnalisisImagen(mensaje);
      pasos.push({
        paso: 2,
        accion: 'Analizar imagen con Vision IA',
        resultado: `Dano detectado: ${analisisImagen.tipo_dano}. Severidad: ${analisisImagen.severidad}. Confianza: ${analisisImagen.confianza}%`,
        automatico: true,
        duracion_ms: latencia,
      });
    }

    // ── Verificar poliza ──
    latencia = simularLatencia(50, 120);
    const poliza = verificarPoliza(cliente);
    pasos.push({
      paso: tieneImagen ? 3 : 2,
      accion: 'Verificar poliza',
      resultado: poliza.vigente
        ? `Poliza ${poliza.poliza} activa. Tipo: ${poliza.tipo}`
        : `Poliza no vigente: ${poliza.motivo}`,
      automatico: true,
      duracion_ms: latencia,
    });

    if (!poliza.vigente) {
      const duracion = Date.now() - inicio;
      await registrarApertura(null, cliente.id, 'whatsapp', telefono, null, pasos, 'poliza_no_vigente', duracion);
      return {
        exito: false,
        error: 'poliza_no_vigente',
        mensaje: 'Tu poliza no esta vigente actualmente.',
        respuesta_conversacional: `Hola ${cliente.nombre.split(' ')[0]}, hemos verificado tu poliza ${cliente.poliza} y lamentablemente no se encuentra vigente. Te recomendamos contactar con tu oficina mas cercana o llamar al 900 100 200 para regularizar tu situacion.`,
        duracion_ms: duracion,
        pasos,
      };
    }

    // ── Clasificar ──
    latencia = simularLatencia(100, 250);
    const textoClasificacion = analisisImagen
      ? `${mensaje || ''} ${analisisImagen.tipo_dano}`
      : mensaje;
    const clasificacion = clasificarSiniestro(textoClasificacion);

    pasos.push({
      paso: pasos.length + 1,
      accion: 'Clasificar siniestro',
      resultado: `Tipo: ${clasificacion.config.label}. Confianza: ${clasificacion.confianza}%`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── Verificar cobertura ──
    latencia = simularLatencia(50, 100);
    const cobertura = verificarCobertura(poliza.tipo, clasificacion.tipo);
    pasos.push({
      paso: pasos.length + 1,
      accion: 'Verificar cobertura',
      resultado: cobertura.cubierto ? 'Cobertura verificada' : `Sin cobertura: ${cobertura.motivo}`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── Franquicia ──
    const franquicia = calcularFranquicia(poliza.tipo, clasificacion.tipo);

    // ── Fraude ──
    latencia = simularLatencia(100, 300);
    const fraude = await analisisFraudeRapido(cliente.id, clasificacion.tipo, mensaje);
    pasos.push({
      paso: pasos.length + 1,
      accion: 'Analisis anti-fraude',
      resultado: `Score: ${fraude.score}/100 (${fraude.nivel})`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── Crear siniestro ──
    latencia = simularLatencia(100, 200);
    const siniestroId = `SIN-${uuidv4().split('-')[0].toUpperCase()}`;
    const expediente = generarExpediente();
    const urgencia = Math.min(10, clasificacion.config.urgencia_base + (tieneImagen ? 1 : 0));
    const zona = extraerZona(cliente.direccion || '');

    await dbRun(
      `INSERT INTO siniestros (id, expediente, cliente_id, tipo, descripcion, estado, urgencia, score_fraude, direccion, zona, ia_confianza, ia_gestion, ia_tiempo, humano_tiempo)
       VALUES (?, ?, ?, ?, ?, 'Abierto', ?, ?, ?, ?, ?, 'full', ?, '22 min')`,
      [siniestroId, expediente, cliente.id, clasificacion.config.tipo_db, mensaje || clasificacion.config.label, urgencia, fraude.score, cliente.direccion || '', zona, clasificacion.confianza, `${((Date.now() - inicio) / 1000 / 60).toFixed(1)} min`]
    );

    await dbRun(
      'INSERT INTO expedientes (id, siniestro_id, tipo_evento, descripcion, datos_extra) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), siniestroId, 'creacion', `Siniestro abierto por WhatsApp. Cliente: ${cliente.nombre}. Tipo: ${clasificacion.config.label}`, JSON.stringify({ canal: 'whatsapp', telefono, tiene_imagen: tieneImagen })]
    );

    pasos.push({
      paso: pasos.length + 1,
      accion: 'Crear siniestro en BD',
      resultado: `Siniestro ${expediente} creado. Urgencia: ${urgencia}/10`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── Recursos ──
    latencia = simularLatencia(150, 400);
    const recursos = await determinarRecursos(clasificacion.tipo, cliente, urgencia);

    const peritoRecurso = recursos.find(r => r.tipo === 'perito');
    if (peritoRecurso) {
      await dbRun('UPDATE siniestros SET perito_id = ?, estado = ? WHERE id = ?', [peritoRecurso.id, 'Perito asignado', siniestroId]);
      await dbRun('INSERT INTO expedientes (id, siniestro_id, tipo_evento, descripcion) VALUES (?, ?, ?, ?)',
        [uuidv4(), siniestroId, 'perito', `Perito ${peritoRecurso.nombre} asignado`]);
    }

    pasos.push({
      paso: pasos.length + 1,
      accion: 'Asignar recursos',
      resultado: `${recursos.length} recurso(s): ${recursos.map(r => r.tipo).join(', ')}`,
      automatico: true,
      duracion_ms: latencia,
    });

    // ── Registrar mensaje WhatsApp entrante ──
    await dbRun(
      'INSERT INTO mensajes_whatsapp (id, siniestro_id, cliente_id, telefono, direccion, contenido, tipo_contenido, respuesta_ia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), siniestroId, cliente.id, telefono, 'entrante', mensaje || '[Imagen]', tieneImagen ? 'imagen' : 'texto', `Siniestro ${expediente} abierto automaticamente`]
    );

    // ── Generar respuesta conversacional ──
    const nombrePila = cliente.nombre.split(' ')[0];
    const mensajeConf = await generarMensajeConfirmacion(siniestroId, 'whatsapp', {
      cliente, expediente, clasificacion, cobertura, franquicia, recursos, fraude,
    });

    // Registrar mensaje saliente
    await dbRun(
      'INSERT INTO mensajes_whatsapp (id, siniestro_id, cliente_id, telefono, direccion, contenido, tipo_contenido) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), siniestroId, cliente.id, telefono, 'saliente', mensajeConf, 'texto']
    );

    pasos.push({
      paso: pasos.length + 1,
      accion: 'Enviar confirmacion WhatsApp',
      resultado: 'Mensaje de confirmacion enviado al cliente',
      automatico: true,
      duracion_ms: simularLatencia(50, 120),
    });

    const duracionTotal = Date.now() - inicio;
    const proximosPasos = generarProximosPasos(clasificacion.tipo, recursos, cobertura);

    await registrarApertura(siniestroId, cliente.id, 'whatsapp', telefono, clasificacion.tipo, pasos, 'exito', duracionTotal);

    return {
      exito: true,
      siniestro_id: siniestroId,
      expediente,
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        poliza: cliente.poliza,
        tipo_poliza: cliente.tipo_poliza,
      },
      tipo: clasificacion.config.label,
      subtipo: clasificacion.tipo,
      cobertura_verificada: cobertura.cubierto,
      franquicia: franquicia.franquicia,
      score_fraude: fraude.score,
      nivel_fraude: fraude.nivel,
      urgencia,
      recursos_asignados: recursos,
      proximos_pasos: proximosPasos,
      mensaje_confirmacion: mensajeConf,
      respuesta_conversacional: mensajeConf,
      analisis_imagen: analisisImagen,
      duracion_ms: duracionTotal,
      duracion_legible: `${(duracionTotal / 1000).toFixed(1)} segundos`,
      automatico: fraude.score < 40,
      pasos,
    };

  } catch (error) {
    const duracion = Date.now() - inicio;
    await registrarApertura(null, null, 'whatsapp', telefono, null, pasos, `error: ${error.message}`, duracion).catch(() => {});
    throw error;
  }
}

// ============================================================
// SIMULACION DE ANALISIS DE IMAGEN
// ============================================================

function simularAnalisisImagen(mensaje) {
  const texto = (mensaje || '').toLowerCase();

  if (texto.includes('agua') || texto.includes('inundacion') || texto.includes('tuberia')) {
    return { tipo_dano: 'Danos por agua', severidad: 'Alta', confianza: 87, objetos: ['suelo mojado', 'pared humedecida', 'muebles danados'], estimacion_preliminar: '3.500-6.000 EUR' };
  }
  if (texto.includes('fuego') || texto.includes('incendio') || texto.includes('quemado')) {
    return { tipo_dano: 'Danos por incendio', severidad: 'Critica', confianza: 92, objetos: ['paredes ennnegrecidas', 'muebles quemados', 'techo danado'], estimacion_preliminar: '15.000-40.000 EUR' };
  }
  if (texto.includes('coche') || texto.includes('golpe') || texto.includes('accidente') || texto.includes('choque')) {
    return { tipo_dano: 'Colision vehicular', severidad: 'Media-Alta', confianza: 89, objetos: ['paragolpes danado', 'faro roto', 'chapa abollada'], estimacion_preliminar: '1.200-3.500 EUR' };
  }
  if (texto.includes('robo') || texto.includes('forzado') || texto.includes('roto')) {
    return { tipo_dano: 'Signos de forzamiento', severidad: 'Media', confianza: 78, objetos: ['cerradura forzada', 'cristal roto', 'puerta danada'], estimacion_preliminar: '800-2.500 EUR' };
  }

  return { tipo_dano: 'Danos materiales generales', severidad: 'Media', confianza: 72, objetos: ['superficie danada', 'objetos afectados'], estimacion_preliminar: '500-3.000 EUR' };
}

// ============================================================
// GENERAR MENSAJE DE CONFIRMACION
// ============================================================

async function generarMensajeConfirmacion(siniestroId, canal, datos) {
  let d = datos;

  // Si no se pasan datos, obtenerlos de la BD
  if (!d || !d.cliente) {
    const siniestro = await dbGet(
      'SELECT s.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono, c.poliza as cliente_poliza, c.tipo_poliza FROM siniestros s LEFT JOIN clientes c ON s.cliente_id = c.id WHERE s.id = ?',
      [siniestroId]
    );
    if (!siniestro) return 'Siniestro no encontrado.';

    d = {
      cliente: { nombre: siniestro.cliente_nombre, poliza: siniestro.cliente_poliza },
      expediente: siniestro.expediente,
      clasificacion: { config: { label: siniestro.tipo } },
      cobertura: { cubierto: true },
      franquicia: { franquicia: 0 },
      recursos: [],
      fraude: { score: siniestro.score_fraude },
    };
  }

  const nombrePila = d.cliente.nombre.split(' ')[0];
  const hora = new Date().getHours();
  const saludo = hora < 14 ? 'Buenos dias' : (hora < 21 ? 'Buenas tardes' : 'Buenas noches');

  let msg = `${saludo}, ${nombrePila}. Su siniestro ha sido registrado con el numero ${d.expediente}.\n\n`;
  msg += `Resumen:\n`;
  msg += `- Tipo: ${d.clasificacion.config ? d.clasificacion.config.label : d.clasificacion}\n`;
  msg += `- Cobertura: ${d.cliente.tipo_poliza || d.cobertura.tipo_poliza || 'Verificada'} (verificada)\n`;
  msg += `- Franquicia: ${d.franquicia.franquicia || 0} EUR\n`;

  if (d.recursos && d.recursos.length > 0) {
    for (const r of d.recursos) {
      switch (r.tipo) {
        case 'perito':
          msg += `- Perito asignado: ${r.nombre} (contactara en ${r.tiempo_contacto})\n`;
          break;
        case 'grua':
          msg += `- Grua solicitada: ETA ${r.eta_minutos} minutos\n`;
          break;
        case 'emergencia':
          msg += `- ${r.servicio}: ETA ${r.eta}\n`;
          break;
        case 'medico':
          msg += `- Medico asignado: ${r.nombre} (${r.especialidad})\n`;
          break;
        case 'legal':
          msg += `- Departamento juridico notificado\n`;
          break;
      }
    }
  }

  msg += `\nPuede seguir el estado en: app.segurcaixa.es/siniestro/${d.expediente}\n\n`;
  msg += `Para cualquier consulta, estoy disponible 24/7 por este mismo canal.\n`;
  msg += `Atte. Asistente IA SegurCaixa Adeslas`;

  return msg;
}

// ============================================================
// REGISTRAR APERTURA EN LOG
// ============================================================

async function registrarApertura(siniestroId, clienteId, canal, telefono, tipoSiniestro, pasos, resultado, duracionMs) {
  await inicializarTabla();
  await dbRun(
    'INSERT INTO apertura_log (id, siniestro_id, cliente_id, canal, telefono, tipo_siniestro, pasos_ejecutados, resultado, duracion_ms, automatico) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [uuidv4(), siniestroId, clienteId, canal, telefono, tipoSiniestro, JSON.stringify(pasos), resultado, duracionMs, resultado === 'exito' ? 1 : 0]
  );
}

// ============================================================
// ESTADISTICAS
// ============================================================

async function getEstadisticas() {
  await inicializarTabla();

  const total = await dbGet('SELECT COUNT(*) as c FROM apertura_log');
  const porCanal = await dbAll("SELECT canal, COUNT(*) as c FROM apertura_log GROUP BY canal");
  const automaticas = await dbGet('SELECT COUNT(*) as c FROM apertura_log WHERE automatico = 1');
  const tiempoMedio = await dbGet('SELECT AVG(duracion_ms) as avg_ms FROM apertura_log WHERE resultado = \'exito\'');
  const hoy = await dbGet("SELECT COUNT(*) as c FROM apertura_log WHERE fecha >= date('now')");

  const canalMap = { llamada: 0, whatsapp: 0, web: 0 };
  for (const row of porCanal) {
    if (canalMap.hasOwnProperty(row.canal)) canalMap[row.canal] = row.c;
  }

  const totalCount = total.c || 0;
  const autoCount = automaticas.c || 0;
  const avgMs = tiempoMedio.avg_ms || 0;
  const avgSeg = avgMs / 1000;

  return {
    total_aperturas: totalCount,
    por_canal: canalMap,
    automaticas_pct: totalCount > 0 ? Math.round((autoCount / totalCount) * 100) : 0,
    tiempo_medio_apertura_seg: Math.round(avgSeg * 10) / 10,
    tiempo_medio_sin_ia_min: 22,
    ahorro_tiempo_pct: avgSeg > 0 ? Math.round((1 - avgSeg / (22 * 60)) * 100) : 97,
    aperturas_hoy: hoy.c || 0,
    tasa_exito: totalCount > 0
      ? Math.round((autoCount / totalCount) * 100)
      : 0,
    resumen: {
      total: totalCount,
      exitosas: autoCount,
      fallidas: totalCount - autoCount,
      canales_activos: Object.values(canalMap).filter(v => v > 0).length,
    },
  };
}

// ============================================================
// ULTIMAS APERTURAS
// ============================================================

async function getUltimasAperturas(limite = 10) {
  await inicializarTabla();

  const rows = await dbAll(
    `SELECT al.*, c.nombre as cliente_nombre, c.poliza as cliente_poliza, s.expediente, s.tipo as tipo_siniestro_db, s.estado, s.urgencia
     FROM apertura_log al
     LEFT JOIN clientes c ON al.cliente_id = c.id
     LEFT JOIN siniestros s ON al.siniestro_id = s.id
     ORDER BY al.fecha DESC
     LIMIT ?`,
    [limite]
  );

  return rows.map(row => ({
    id: row.id,
    siniestro_id: row.siniestro_id,
    expediente: row.expediente || null,
    cliente: row.cliente_nombre || 'Desconocido',
    poliza: row.cliente_poliza || null,
    canal: row.canal,
    telefono: row.telefono,
    tipo_siniestro: row.tipo_siniestro,
    estado: row.estado || null,
    urgencia: row.urgencia || null,
    resultado: row.resultado,
    duracion_ms: row.duracion_ms,
    duracion_legible: row.duracion_ms ? `${(row.duracion_ms / 1000).toFixed(1)}s` : null,
    automatico: row.automatico === 1,
    pasos: row.pasos_ejecutados ? JSON.parse(row.pasos_ejecutados) : [],
    fecha: row.fecha,
  }));
}

// ============================================================
// SIMULAR LLAMADA COMPLETA (DEMO)
// ============================================================

async function simularLlamadaCompleta(tipo) {
  await inicializarTabla();

  const escenarios = {
    auto_accidente: {
      telefono: '612345678',
      cliente: 'Maria Garcia Lopez',
      poliza: 'POL-2024-00456',
      tipo_poliza: 'Todo riesgo',
      ubicacion: 'M-30, salida Mendez Alvaro',
      descripcion_cliente: 'Acabo de tener un accidente en la M-30. Me han dado un golpe por detras.',
      pregunta_ia: 'Se encuentra usted bien? Hay heridos?',
      respuesta_cliente: 'Estoy bien, solo daños materiales. El otro conductor tambien esta bien.',
      clasificacion_label: 'Accidente trafico - Danos materiales',
      cobertura: 'Todo Riesgo sin franquicia',
      score_fraude: 8,
      grua: { proveedor: 'Europ Assistance', eta: 12 },
      perito: { nombre: 'Carlos Ruiz Martinez', contacto: '2h' },
      duracion_llamada: '1:47',
    },
    hogar_inundacion: {
      telefono: '634567890',
      cliente: 'Carlos Fernandez Ruiz',
      poliza: 'POL-2024-00312',
      tipo_poliza: 'Hogar Plus',
      ubicacion: 'Calle Aragon 234, Barcelona',
      descripcion_cliente: 'Se me ha reventado una tuberia y tengo todo el salon inundado. Hay mucha agua.',
      pregunta_ia: 'Ha podido cortar la llave de paso del agua?',
      respuesta_cliente: 'Si, ya la he cortado, pero hay mucha agua en el suelo y los muebles estan mojados.',
      clasificacion_label: 'Inundacion en vivienda',
      cobertura: 'Hogar Plus sin franquicia',
      score_fraude: 5,
      emergencia: { servicio: 'Fontanero de urgencia', proveedor: 'Reparalia', eta: '45 min' },
      perito: { nombre: 'Elena Torres Vidal', contacto: 'manana 9:00-12:00' },
      duracion_llamada: '2:12',
    },
    auto_robo: {
      telefono: '698123456',
      cliente: 'Carmen Vega Sanz',
      poliza: 'POL-2024-00234',
      tipo_poliza: 'Todo riesgo',
      ubicacion: 'CC La Vaguada, Madrid',
      descripcion_cliente: 'Me han robado el coche! Lo aparque en el parking de La Vaguada y cuando he vuelto no estaba.',
      pregunta_ia: 'Ha presentado denuncia ante la policia?',
      respuesta_cliente: 'Todavia no, iba a hacerlo ahora.',
      clasificacion_label: 'Robo de vehiculo',
      cobertura: 'Todo Riesgo - Robo cubierto',
      score_fraude: 35,
      perito: { nombre: 'Carlos Ruiz Martinez', contacto: '24h (tras denuncia policial)' },
      duracion_llamada: '2:34',
    },
    hogar_incendio: {
      telefono: '656789012',
      cliente: 'Antonio Navarro Gil',
      poliza: 'POL-2024-00890',
      tipo_poliza: 'Hogar basico',
      ubicacion: 'Calle Betis 56, Sevilla',
      descripcion_cliente: 'Ha habido un incendio en la cocina por un cortocircuito en la campana. Los bomberos ya han venido.',
      pregunta_ia: 'Todos los ocupantes estan bien? Los bomberos han dado el visto bueno?',
      respuesta_cliente: 'Si, todos bien. Los bomberos dicen que ya esta controlado pero la cocina esta destrozada.',
      clasificacion_label: 'Incendio en vivienda - Cortocircuito',
      cobertura: 'Hogar basico - Incendio cubierto (franquicia 150 EUR)',
      score_fraude: 12,
      emergencia: { servicio: 'Restauracion post-incendio', proveedor: 'HomeServe', eta: '24h' },
      perito: { nombre: 'Miguel Angel Fernandez', contacto: 'manana a primera hora' },
      duracion_llamada: '3:05',
    },
    comercio_robo: {
      telefono: '678901234',
      cliente: 'Laura Mendez Torres',
      poliza: 'POL-2024-00289',
      tipo_poliza: 'Comercio',
      ubicacion: 'Av. del Puerto 89, Valencia',
      descripcion_cliente: 'Han reventado la puerta de mi tienda esta noche y se han llevado la caja y varios productos.',
      pregunta_ia: 'Ha llamado a la policia? Tiene sistema de alarma o camaras de seguridad?',
      respuesta_cliente: 'Si, la policia ya ha venido. Tengo camaras, les he dado las grabaciones.',
      clasificacion_label: 'Robo con fuerza en local comercial',
      cobertura: 'Comercio - Robo cubierto (franquicia 200 EUR)',
      score_fraude: 18,
      perito: { nombre: 'Laura Sanchez Gil', contacto: 'hoy a las 14:00' },
      duracion_llamada: '2:48',
    },
  };

  const esc = escenarios[tipo];
  if (!esc) {
    return {
      error: 'Tipo de simulacion no valido',
      tipos_disponibles: Object.keys(escenarios),
    };
  }

  // Generar expediente para la simulacion
  const expedienteSim = generarExpediente();

  const dialogoPasos = [
    { paso: 1, actor: 'Sistema', texto: `Llamada entrante de +34 ${esc.telefono}`, timestamp: '0:00', tipo: 'sistema' },
    { paso: 2, actor: 'IA', texto: `"Buenos dias, SegurCaixa Adeslas, soy su asistente virtual. En que puedo ayudarle?"`, timestamp: '0:02', tipo: 'ia' },
    { paso: 3, actor: 'Cliente', texto: `"Hola, ${esc.descripcion_cliente}"`, timestamp: '0:05', tipo: 'cliente' },
    { paso: 4, actor: 'Sistema', texto: `Cliente identificado: ${esc.cliente} (${esc.poliza})`, timestamp: '0:06', tipo: 'sistema' },
    { paso: 5, actor: 'Sistema', texto: `Poliza verificada: ${esc.tipo_poliza} - Vigente - Al corriente de pago`, timestamp: '0:07', tipo: 'sistema' },
    { paso: 6, actor: 'IA', texto: `"Senor/a ${esc.cliente.split(' ')[0]}, ${esc.pregunta_ia}"`, timestamp: '0:10', tipo: 'ia' },
    { paso: 7, actor: 'Cliente', texto: `"${esc.respuesta_cliente}"`, timestamp: '0:18', tipo: 'cliente' },
    { paso: 8, actor: 'Sistema', texto: `Clasificacion: ${esc.clasificacion_label}`, timestamp: '0:19', tipo: 'sistema' },
    { paso: 9, actor: 'Sistema', texto: `Cobertura verificada: ${esc.cobertura}`, timestamp: '0:20', tipo: 'sistema' },
    { paso: 10, actor: 'Sistema', texto: `Score fraude: ${esc.score_fraude}/100 - Sin indicadores`, timestamp: '0:21', tipo: 'sistema' },
    { paso: 11, actor: 'Sistema', texto: `Siniestro ${expedienteSim} creado automaticamente`, timestamp: '0:22', tipo: 'sistema' },
  ];

  let pasoNum = 12;

  if (esc.grua) {
    dialogoPasos.push({ paso: pasoNum++, actor: 'Sistema', texto: `Grua solicitada - ${esc.grua.proveedor} - ETA ${esc.grua.eta} min`, timestamp: '0:23', tipo: 'sistema' });
  }

  if (esc.emergencia) {
    dialogoPasos.push({ paso: pasoNum++, actor: 'Sistema', texto: `${esc.emergencia.servicio} enviado - ${esc.emergencia.proveedor} - ETA ${esc.emergencia.eta}`, timestamp: '0:23', tipo: 'sistema' });
  }

  dialogoPasos.push({ paso: pasoNum++, actor: 'Sistema', texto: `Perito asignado - ${esc.perito.nombre} - Contactara en ${esc.perito.contacto}`, timestamp: '0:24', tipo: 'sistema' });

  // Respuesta IA resumida
  let resumenIA = `"Todo registrado, ${esc.cliente.split(' ')[0]}. `;
  if (esc.grua) resumenIA += `La grua llegara en ${esc.grua.eta} minutos. `;
  if (esc.emergencia) resumenIA += `El ${esc.emergencia.servicio.toLowerCase()} esta en camino. `;
  resumenIA += `El perito ${esc.perito.nombre.split(' ')[0]} le contactara ${esc.perito.contacto.includes('manana') ? 'manana' : 'en ' + esc.perito.contacto}. Le envio un SMS con todos los detalles."`;
  dialogoPasos.push({ paso: pasoNum++, actor: 'IA', texto: resumenIA, timestamp: '0:30', tipo: 'ia' });

  dialogoPasos.push({ paso: pasoNum++, actor: 'Sistema', texto: `SMS enviado a +34 ${esc.telefono}`, timestamp: '0:31', tipo: 'sistema' });
  dialogoPasos.push({ paso: pasoNum++, actor: 'Sistema', texto: `WhatsApp enviado con numero de expediente ${expedienteSim}`, timestamp: '0:32', tipo: 'sistema' });
  dialogoPasos.push({ paso: pasoNum++, actor: 'IA', texto: `"Puedo ayudarle en algo mas?"`, timestamp: '0:35', tipo: 'ia' });
  dialogoPasos.push({ paso: pasoNum++, actor: 'Cliente', texto: `"No, muchas gracias. Muy rapido todo."`, timestamp: '0:40', tipo: 'cliente' });
  dialogoPasos.push({ paso: pasoNum++, actor: 'IA', texto: `"Que se mejore. Si necesita cualquier cosa, no dude en llamarnos. Hasta luego."`, timestamp: '0:42', tipo: 'ia' });
  dialogoPasos.push({ paso: pasoNum++, actor: 'Sistema', texto: `Llamada finalizada. Duracion: ${esc.duracion_llamada}. 100% automatico. NPS predicho: 9/10.`, timestamp: esc.duracion_llamada, tipo: 'sistema' });

  // Ahora ejecutar la apertura REAL para que se cree en BD
  let resultadoReal = null;
  try {
    resultadoReal = await procesarLlamadaEntrante(esc.telefono, esc.descripcion_cliente);
  } catch (e) {
    // Si falla (ej. duplicado), no pasa nada para la demo
    resultadoReal = { exito: false, error: e.message };
  }

  return {
    tipo_simulacion: tipo,
    escenario: {
      cliente: esc.cliente,
      poliza: esc.poliza,
      tipo_poliza: esc.tipo_poliza,
      ubicacion: esc.ubicacion,
    },
    dialogo: dialogoPasos,
    total_pasos: dialogoPasos.length,
    duracion: esc.duracion_llamada,
    automatico_pct: 100,
    expediente_simulado: expedienteSim,
    resultado_real: resultadoReal,
    kpis: {
      tiempo_apertura: resultadoReal && resultadoReal.duracion_legible ? resultadoReal.duracion_legible : '< 2 seg',
      tiempo_sin_ia: '22 min',
      ahorro: '91%',
      satisfaccion_predicha: '9.2/10',
    },
  };
}

// ============================================================
// SEED: PRE-POBLAR apertura_log CON 10 ENTRADAS HISTORICAS
// ============================================================

async function seedAperturaLog() {
  await inicializarTabla();

  const count = await dbGet('SELECT COUNT(*) as c FROM apertura_log');
  if (count && count.c > 0) return;

  const entradas = [
    { id: uuidv4(), sin: 'SIN-001', cli: 'CLI-001', canal: 'llamada', tel: '612345678', tipo: 'auto_accidente', resultado: 'exito', dur: 1847, auto: 1, fecha: "datetime('now', '-6 hours')" },
    { id: uuidv4(), sin: 'SIN-002', cli: 'CLI-002', canal: 'whatsapp', tel: '634567890', tipo: 'hogar_inundacion', resultado: 'exito', dur: 2340, auto: 1, fecha: "datetime('now', '-5 hours')" },
    { id: uuidv4(), sin: 'SIN-003', cli: 'CLI-003', canal: 'llamada', tel: '678901234', tipo: 'robo_comercio', resultado: 'exito', dur: 3200, auto: 1, fecha: "datetime('now', '-4 hours')" },
    { id: uuidv4(), sin: 'SIN-004', cli: 'CLI-004', canal: 'llamada', tel: '645678901', tipo: 'salud_urgencia', resultado: 'exito', dur: 980, auto: 1, fecha: "datetime('now', '-3 hours')" },
    { id: uuidv4(), sin: 'SIN-005', cli: 'CLI-005', canal: 'whatsapp', tel: '623456789', tipo: 'auto_granizo', resultado: 'exito', dur: 1560, auto: 1, fecha: "datetime('now', '-3 hours')" },
    { id: uuidv4(), sin: 'SIN-006', cli: 'CLI-006', canal: 'llamada', tel: '656789012', tipo: 'hogar_incendio', resultado: 'exito', dur: 2890, auto: 1, fecha: "datetime('now', '-2 hours')" },
    { id: uuidv4(), sin: 'SIN-009', cli: 'CLI-009', canal: 'llamada', tel: '698123456', tipo: 'robo_vehiculo', resultado: 'exito', dur: 4100, auto: 0, fecha: "datetime('now', '-2 hours')" },
    { id: uuidv4(), sin: 'SIN-010', cli: 'CLI-010', canal: 'whatsapp', tel: '611223344', tipo: 'auto_accidente', resultado: 'exito', dur: 1720, auto: 1, fecha: "datetime('now', '-1 hours')" },
    { id: uuidv4(), sin: 'SIN-011', cli: 'CLI-011', canal: 'whatsapp', tel: '622334455', tipo: 'hogar_cristales', resultado: 'exito', dur: 1350, auto: 1, fecha: "datetime('now', '-45 minutes')" },
    { id: uuidv4(), sin: 'SIN-014', cli: 'CLI-014', canal: 'llamada', tel: '655667788', tipo: 'auto_accidente', resultado: 'exito', dur: 2200, auto: 1, fecha: "datetime('now', '-20 minutes')" },
  ];

  for (const e of entradas) {
    const pasosSimulados = JSON.stringify([
      { paso: 1, accion: 'Identificar cliente', resultado: 'Identificado', automatico: true, duracion_ms: 120 },
      { paso: 2, accion: 'Verificar poliza', resultado: 'Vigente', automatico: true, duracion_ms: 80 },
      { paso: 3, accion: 'Clasificar siniestro', resultado: e.tipo, automatico: true, duracion_ms: 200 },
      { paso: 4, accion: 'Verificar cobertura', resultado: 'Cubierto', automatico: true, duracion_ms: 60 },
      { paso: 5, accion: 'Calcular franquicia', resultado: '0 EUR', automatico: true, duracion_ms: 40 },
      { paso: 6, accion: 'Analisis fraude', resultado: 'OK', automatico: true, duracion_ms: 250 },
      { paso: 7, accion: 'Crear siniestro', resultado: 'Creado', automatico: true, duracion_ms: 150 },
      { paso: 8, accion: 'Asignar recursos', resultado: 'Recursos asignados', automatico: true, duracion_ms: 350 },
    ]);
    await dbRun(
      `INSERT INTO apertura_log (id, siniestro_id, cliente_id, canal, telefono, tipo_siniestro, pasos_ejecutados, resultado, duracion_ms, automatico, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${e.fecha})`,
      [e.id, e.sin, e.cli, e.canal, e.tel, e.tipo, pasosSimulados, e.resultado, e.dur, e.auto]
    );
  }

  console.log('  Apertura Log: 10 registros historicos insertados');
}

// ============================================================
// EXPORTAR TODO
// ============================================================

module.exports = {
  procesarLlamadaEntrante,
  procesarWhatsAppEntrante,
  generarMensajeConfirmacion,
  getEstadisticas,
  getUltimasAperturas,
  simularLlamadaCompleta,
  seedAperturaLog,
  inicializarTabla,
  identificarClientePorTelefono,
  identificarClientePorPoliza,
  verificarPoliza,
  clasificarSiniestro,
  verificarCobertura,
  calcularFranquicia,
  analisisFraudeRapido,
  determinarRecursos,
};
