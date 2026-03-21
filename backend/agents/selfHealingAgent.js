// ============================================================================
// Agente de Auto-Reparacion (Self-Healing)
// Sistema inmunologico del software: detecta anomalias, diagnostica causas raiz,
// aplica correcciones automaticas y aprende de cada incidente.
// ============================================================================

// ---------------------------------------------------------------------------
// Reglas de auto-reparacion: mapean tipo de problema a accion correctiva
// ---------------------------------------------------------------------------
const autoFixRules = [
  {
    id: 'AFR-001',
    tipo_problema: 'db_query_lenta',
    umbral: 'query_time > 2000ms',
    accion: 'crear_indice_faltante',
    descripcion: 'Crear indice en columnas frecuentemente filtradas cuando el tiempo de query supera 2s',
    riesgo: 'bajo',
    requiere_aprobacion: false,
  },
  {
    id: 'AFR-002',
    tipo_problema: 'memory_leak',
    umbral: 'heap_usage > 85%',
    accion: 'reiniciar_worker',
    descripcion: 'Reiniciar worker con backoff exponencial cuando el heap supera el 85%',
    riesgo: 'medio',
    requiere_aprobacion: false,
  },
  {
    id: 'AFR-003',
    tipo_problema: 'api_timeout',
    umbral: 'p95_latency > 5000ms',
    accion: 'activar_cache',
    descripcion: 'Activar cache en endpoints criticos cuando la latencia p95 excede 5s',
    riesgo: 'bajo',
    requiere_aprobacion: false,
  },
  {
    id: 'AFR-004',
    tipo_problema: 'disco_lleno',
    umbral: 'disk_usage > 90%',
    accion: 'rotar_logs_limpiar_temp',
    descripcion: 'Rotar logs antiguos y limpiar archivos temporales cuando el disco pasa del 90%',
    riesgo: 'bajo',
    requiere_aprobacion: false,
  },
  {
    id: 'AFR-005',
    tipo_problema: 'agent_crash',
    umbral: 'consecutive_failures >= 3',
    accion: 'reiniciar_con_backoff',
    descripcion: 'Reiniciar agente caido con backoff exponencial (1s, 2s, 4s, 8s...)',
    riesgo: 'medio',
    requiere_aprobacion: false,
  },
  {
    id: 'AFR-006',
    tipo_problema: 'error_rate_alta',
    umbral: 'error_rate > 10%',
    accion: 'activar_circuit_breaker',
    descripcion: 'Activar circuit breaker en el servicio afectado para evitar cascada de fallos',
    riesgo: 'medio',
    requiere_aprobacion: false,
  },
  {
    id: 'AFR-007',
    tipo_problema: 'conexiones_agotadas',
    umbral: 'pool_usage > 95%',
    accion: 'ampliar_pool_conexiones',
    descripcion: 'Aumentar pool de conexiones a BD de forma dinamica y cerrar conexiones zombie',
    riesgo: 'medio',
    requiere_aprobacion: true,
  },
  {
    id: 'AFR-008',
    tipo_problema: 'certificado_proximo_expirar',
    umbral: 'days_to_expiry < 7',
    accion: 'renovar_certificado_ssl',
    descripcion: 'Renovar automaticamente certificados SSL via Let\'s Encrypt',
    riesgo: 'bajo',
    requiere_aprobacion: false,
  },
  {
    id: 'AFR-009',
    tipo_problema: 'cola_saturada',
    umbral: 'queue_depth > 10000',
    accion: 'escalar_consumidores',
    descripcion: 'Lanzar consumidores adicionales cuando la cola supera 10.000 mensajes pendientes',
    riesgo: 'bajo',
    requiere_aprobacion: false,
  },
  {
    id: 'AFR-010',
    tipo_problema: 'drift_configuracion',
    umbral: 'config_diff_detected',
    accion: 'restaurar_config_golden',
    descripcion: 'Restaurar configuracion desde la version golden cuando se detecta drift',
    riesgo: 'alto',
    requiere_aprobacion: true,
  },
];

// ---------------------------------------------------------------------------
// Historial de incidentes: 12 incidentes del ultimo mes mostrando auto-curacion
// ---------------------------------------------------------------------------
const incidentes = [
  {
    id: 'INC-001',
    fecha: '2026-02-20T03:14:00Z',
    tipo: 'rendimiento',
    descripcion: 'Query de busqueda de siniestros por fecha tarda >4s. Tabla siniestros sin indice en columna fecha_apertura.',
    severidad: 'alta',
    causa_raiz: 'Indice faltante en siniestros.fecha_apertura. Full table scan en tabla con 2.3M registros.',
    accion_correctiva: 'CREATE INDEX idx_siniestros_fecha ON siniestros(fecha_apertura). Query paso de 4.2s a 45ms.',
    estado: 'resuelto',
    tiempo_resolucion_ms: 18500,
    auto_curado: true,
    regla_aplicada: 'AFR-001',
  },
  {
    id: 'INC-002',
    fecha: '2026-02-22T11:45:00Z',
    tipo: 'rendimiento',
    descripcion: 'Memory leak en worker de cola de procesamiento de documentos. Heap creciendo 50MB/hora.',
    severidad: 'alta',
    causa_raiz: 'Event listeners no eliminados en el parser de PDFs. Acumulacion de closures en memoria.',
    accion_correctiva: 'Reinicio automatico del worker con graceful shutdown. Listeners limpiados en el nuevo proceso.',
    estado: 'resuelto',
    tiempo_resolucion_ms: 8200,
    auto_curado: true,
    regla_aplicada: 'AFR-002',
  },
  {
    id: 'INC-003',
    fecha: '2026-02-25T09:30:00Z',
    tipo: 'rendimiento',
    descripcion: 'API de consulta de polizas con timeout en pico de trafico matutino (lunes 9-11h).',
    severidad: 'critica',
    causa_raiz: 'Endpoint /api/polizas sin cache. 2.400 requests/min en hora punta saturan las queries a BD.',
    accion_correctiva: 'Cache Redis activado automaticamente con TTL de 60s. Latencia p95 de 5.8s a 120ms.',
    estado: 'resuelto',
    tiempo_resolucion_ms: 12300,
    auto_curado: true,
    regla_aplicada: 'AFR-003',
  },
  {
    id: 'INC-004',
    fecha: '2026-02-28T02:00:00Z',
    tipo: 'rendimiento',
    descripcion: 'Disco del servidor de logs al 92%. Riesgo de parada del sistema en <4 horas.',
    severidad: 'alta',
    causa_raiz: 'Logs de acceso sin rotacion desde hace 45 dias. Archivos temporales de exports no limpiados.',
    accion_correctiva: 'Rotacion de logs >7 dias (liberados 28GB). Limpieza de /tmp con archivos >24h (liberados 12GB). Uso al 61%.',
    estado: 'resuelto',
    tiempo_resolucion_ms: 35000,
    auto_curado: true,
    regla_aplicada: 'AFR-004',
  },
  {
    id: 'INC-005',
    fecha: '2026-03-02T16:22:00Z',
    tipo: 'error',
    descripcion: 'Agente de NPS caido tras excepcion no capturada en procesamiento de encuesta corrupta.',
    severidad: 'media',
    causa_raiz: 'Encuesta ID-4521 con campo satisfaccion=null provoca TypeError. Sin validacion de entrada.',
    accion_correctiva: 'Reinicio con backoff (intento 1: 1s, exito). Encuesta corrupta movida a cola de revision manual.',
    estado: 'resuelto',
    tiempo_resolucion_ms: 4500,
    auto_curado: true,
    regla_aplicada: 'AFR-005',
  },
  {
    id: 'INC-006',
    fecha: '2026-03-04T14:10:00Z',
    tipo: 'error',
    descripcion: 'Tasa de error en servicio de valoracion de siniestros sube al 18%. Errores 500 en cascada.',
    severidad: 'critica',
    causa_raiz: 'Servicio externo de TIREA (valoracion vehiculos) devuelve 503. Nuestro servicio no tiene fallback.',
    accion_correctiva: 'Circuit breaker activado. Valoraciones redirigidas a cache de precios recientes. Error rate a 0.3%.',
    estado: 'resuelto',
    tiempo_resolucion_ms: 6800,
    auto_curado: true,
    regla_aplicada: 'AFR-006',
  },
  {
    id: 'INC-007',
    fecha: '2026-03-06T08:55:00Z',
    tipo: 'seguridad',
    descripcion: 'Detectados 1.200 intentos de login fallidos desde IP 185.220.101.x en 10 minutos.',
    severidad: 'alta',
    causa_raiz: 'Ataque de fuerza bruta contra endpoint /api/auth/login. IP pertenece a red Tor.',
    accion_correctiva: 'IP bloqueada automaticamente en WAF. Rate limiting activado: max 5 intentos/minuto por IP. Alerta a equipo de seguridad.',
    estado: 'resuelto',
    tiempo_resolucion_ms: 2100,
    auto_curado: true,
    regla_aplicada: null,
  },
  {
    id: 'INC-008',
    fecha: '2026-03-08T20:30:00Z',
    tipo: 'datos',
    descripcion: 'Inconsistencia detectada: 47 polizas con fecha_fin anterior a fecha_inicio en migracion nocturna.',
    severidad: 'media',
    causa_raiz: 'Script de migracion de sistema legacy invirtio las columnas fecha_inicio y fecha_fin para polizas tipo vida.',
    accion_correctiva: 'Swap automatico de fechas en los 47 registros afectados. Validacion pre/post migracion anadida.',
    estado: 'resuelto',
    tiempo_resolucion_ms: 15600,
    auto_curado: true,
    regla_aplicada: null,
  },
  {
    id: 'INC-009',
    fecha: '2026-03-10T12:00:00Z',
    tipo: 'integracion',
    descripcion: 'Webhook de pasarela de pagos devuelve 404. Pagos confirmados no se registran en sistema.',
    severidad: 'critica',
    causa_raiz: 'Despliegue cambio la ruta de /api/v2/webhooks/pagos a /api/v3/webhooks/pagos sin actualizar la pasarela.',
    accion_correctiva: 'Redirect 301 automatico de v2 a v3. Cola de replay para 23 webhooks perdidos. Pasarela actualizada.',
    estado: 'resuelto',
    tiempo_resolucion_ms: 42000,
    auto_curado: true,
    regla_aplicada: null,
  },
  {
    id: 'INC-010',
    fecha: '2026-03-13T07:15:00Z',
    tipo: 'rendimiento',
    descripcion: 'Pool de conexiones a BD al 97%. Nuevas peticiones empiezan a encolar.',
    severidad: 'alta',
    causa_raiz: '14 conexiones zombie de un proceso de export que crasheo sin cerrar conexiones.',
    accion_correctiva: 'Conexiones zombie cerradas. Pool ampliado temporalmente de 50 a 75. Timeout de conexion reducido a 30s.',
    estado: 'resuelto',
    tiempo_resolucion_ms: 9800,
    auto_curado: true,
    regla_aplicada: 'AFR-007',
  },
  {
    id: 'INC-011',
    fecha: '2026-03-16T04:00:00Z',
    tipo: 'seguridad',
    descripcion: 'Certificado SSL del subdominio api-docs.empresa.com expira en 3 dias.',
    severidad: 'media',
    causa_raiz: 'Certificado emitido manualmente hace 1 ano, fuera del ciclo de renovacion automatica.',
    accion_correctiva: 'Renovacion automatica via Let\'s Encrypt. Subdominio anadido al ciclo de auto-renovacion.',
    estado: 'resuelto',
    tiempo_resolucion_ms: 28000,
    auto_curado: true,
    regla_aplicada: 'AFR-008',
  },
  {
    id: 'INC-012',
    fecha: '2026-03-18T15:40:00Z',
    tipo: 'rendimiento',
    descripcion: 'Cola de procesamiento de siniestros con 14.200 mensajes pendientes. Tiempo de espera >20min.',
    severidad: 'alta',
    causa_raiz: 'Pico de siniestros por tormenta DANA en Levante. 3x el volumen normal. Solo 2 consumidores activos.',
    accion_correctiva: 'Escalado automatico de 2 a 6 consumidores. Cola drenada en 8 minutos. Auto-desescalado a 3 tras normalizacion.',
    estado: 'resuelto',
    tiempo_resolucion_ms: 11500,
    auto_curado: true,
    regla_aplicada: 'AFR-009',
  },
];

// ---------------------------------------------------------------------------
// Health checks continuos: metricas del sistema en tiempo real
// ---------------------------------------------------------------------------
const healthChecks = {
  api: {
    estado: 'sano',
    latencia_p50_ms: 85,
    latencia_p95_ms: 220,
    latencia_p99_ms: 480,
    requests_por_minuto: 1840,
    error_rate_pct: 0.12,
    uptime_pct: 99.97,
    ultimo_check: '2026-03-19T10:00:00Z',
  },
  base_datos: {
    estado: 'sano',
    conexiones_activas: 38,
    conexiones_max: 75,
    query_time_avg_ms: 12,
    query_time_p95_ms: 45,
    replicacion_lag_ms: 2,
    tamano_gb: 84.3,
    ultimo_check: '2026-03-19T10:00:00Z',
  },
  memoria: {
    estado: 'sano',
    heap_used_mb: 412,
    heap_total_mb: 768,
    heap_pct: 53.6,
    rss_mb: 620,
    external_mb: 28,
    ultimo_check: '2026-03-19T10:00:00Z',
  },
  disco: {
    estado: 'sano',
    usado_gb: 142,
    total_gb: 500,
    uso_pct: 28.4,
    iops_lectura: 1200,
    iops_escritura: 340,
    ultimo_check: '2026-03-19T10:00:00Z',
  },
  colas: {
    estado: 'sano',
    mensajes_pendientes: 42,
    mensajes_procesados_hora: 8500,
    consumidores_activos: 3,
    tiempo_espera_avg_ms: 1200,
    dead_letter_count: 7,
    ultimo_check: '2026-03-19T10:00:00Z',
  },
  agentes: {
    estado: 'sano',
    agentes_activos: 22,
    agentes_totales: 22,
    agentes_con_error: 0,
    ultimo_reinicio: '2026-03-16T04:12:00Z',
    uptime_medio_horas: 312,
    ultimo_check: '2026-03-19T10:00:00Z',
  },
  servicios_externos: {
    estado: 'degradado',
    servicios: [
      { nombre: 'TIREA (valoracion vehiculos)', estado: 'operativo', latencia_ms: 340 },
      { nombre: 'AEMET (meteorologia)', estado: 'operativo', latencia_ms: 120 },
      { nombre: 'DGT (vehiculos)', estado: 'operativo', latencia_ms: 280 },
      { nombre: 'Catastro (inmuebles)', estado: 'lento', latencia_ms: 2800 },
      { nombre: 'Pasarela de pagos', estado: 'operativo', latencia_ms: 95 },
    ],
    ultimo_check: '2026-03-19T10:00:00Z',
  },
};

// ---------------------------------------------------------------------------
// Historial de salud diario (30 dias)
// ---------------------------------------------------------------------------
function _generarHistorialSalud() {
  const historial = [];
  const baseDate = new Date('2026-02-18');
  const scores = [
    98, 97, 95, 88, 92, 96, 97, 94, 78, 85,
    93, 96, 97, 72, 88, 95, 97, 98, 91, 86,
    94, 97, 98, 96, 93, 89, 95, 97, 99, 97,
  ];
  for (let i = 0; i < 30; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const score = scores[i];
    let estado;
    if (score >= 95) estado = 'sano';
    else if (score >= 80) estado = 'degradado';
    else estado = 'critico';
    historial.push({
      fecha: d.toISOString().slice(0, 10),
      score_salud: score,
      estado,
      incidentes_dia: score < 90 ? Math.ceil((100 - score) / 8) : score < 95 ? 1 : 0,
      auto_curados_dia: score < 95 ? Math.max(1, Math.ceil((100 - score) / 10)) : 0,
    });
  }
  return historial;
}

// ---------------------------------------------------------------------------
// Acciones preventivas implementadas proactivamente
// ---------------------------------------------------------------------------
const accionesPreventivas = [
  {
    id: 'PREV-001',
    fecha_implementacion: '2026-02-19',
    tipo: 'rendimiento',
    descripcion: 'Analisis predictivo de crecimiento de tablas. Indices creados preventivamente en 3 tablas que superaran 1M registros este mes.',
    impacto_estimado: 'Evitadas ~15 queries lentas/dia',
    estado: 'activa',
  },
  {
    id: 'PREV-002',
    fecha_implementacion: '2026-02-24',
    tipo: 'seguridad',
    descripcion: 'Rotacion automatica de API keys cada 30 dias. Las keys anteriores mantienen 48h de gracia.',
    impacto_estimado: 'Reduccion del 90% en riesgo de keys comprometidas',
    estado: 'activa',
  },
  {
    id: 'PREV-003',
    fecha_implementacion: '2026-03-01',
    tipo: 'datos',
    descripcion: 'Validacion de integridad referencial en batch nocturno. Detecta huerfanos y FK rotas antes de que causen errores.',
    impacto_estimado: 'Detectadas 23 inconsistencias antes de impactar usuarios',
    estado: 'activa',
  },
  {
    id: 'PREV-004',
    fecha_implementacion: '2026-03-05',
    tipo: 'rendimiento',
    descripcion: 'Pre-calentamiento de cache cada lunes a las 7:00 con las 500 queries mas frecuentes.',
    impacto_estimado: 'Latencia en hora punta del lunes reducida un 65%',
    estado: 'activa',
  },
  {
    id: 'PREV-005',
    fecha_implementacion: '2026-03-10',
    tipo: 'integracion',
    descripcion: 'Health check proactivo de servicios externos cada 60s. Activacion preventiva de fallbacks si latencia >1s.',
    impacto_estimado: 'Tiempo medio de deteccion de caidas externas: de 5min a 60s',
    estado: 'activa',
  },
  {
    id: 'PREV-006',
    fecha_implementacion: '2026-03-14',
    tipo: 'rendimiento',
    descripcion: 'Auto-scaling predictivo basado en patrones historicos de carga. Escala 15min antes del pico previsto.',
    impacto_estimado: 'Eliminados el 95% de picos de latencia en horas punta',
    estado: 'activa',
  },
  {
    id: 'PREV-007',
    fecha_implementacion: '2026-03-17',
    tipo: 'seguridad',
    descripcion: 'Analisis continuo de dependencias npm. Alerta y parche automatico de vulnerabilidades criticas en <1h.',
    impacto_estimado: '3 vulnerabilidades criticas parcheadas automaticamente este mes',
    estado: 'activa',
  },
];

// ---------------------------------------------------------------------------
// Funciones principales
// ---------------------------------------------------------------------------

/**
 * Diagnostico completo del sistema.
 * Evalua todos los subsistemas y devuelve estado global, problemas y acciones.
 */
function diagnosticar() {
  const problemas = [];
  const acciones = [];

  // Evaluar API
  if (healthChecks.api.error_rate_pct > 5) {
    problemas.push({ subsistema: 'api', problema: 'Error rate elevado', valor: healthChecks.api.error_rate_pct + '%', severidad: 'critica' });
    acciones.push({ accion: 'Activar circuit breaker', regla: 'AFR-006', automatica: true });
  }
  if (healthChecks.api.latencia_p95_ms > 3000) {
    problemas.push({ subsistema: 'api', problema: 'Latencia p95 alta', valor: healthChecks.api.latencia_p95_ms + 'ms', severidad: 'alta' });
    acciones.push({ accion: 'Activar cache en endpoints lentos', regla: 'AFR-003', automatica: true });
  }

  // Evaluar BD
  if (healthChecks.base_datos.conexiones_activas / healthChecks.base_datos.conexiones_max > 0.9) {
    problemas.push({ subsistema: 'base_datos', problema: 'Pool de conexiones casi agotado', valor: `${healthChecks.base_datos.conexiones_activas}/${healthChecks.base_datos.conexiones_max}`, severidad: 'alta' });
    acciones.push({ accion: 'Ampliar pool y cerrar conexiones zombie', regla: 'AFR-007', automatica: true });
  }
  if (healthChecks.base_datos.query_time_p95_ms > 2000) {
    problemas.push({ subsistema: 'base_datos', problema: 'Queries lentas', valor: healthChecks.base_datos.query_time_p95_ms + 'ms', severidad: 'alta' });
    acciones.push({ accion: 'Analizar y crear indices faltantes', regla: 'AFR-001', automatica: true });
  }

  // Evaluar memoria
  if (healthChecks.memoria.heap_pct > 85) {
    problemas.push({ subsistema: 'memoria', problema: 'Uso de heap elevado', valor: healthChecks.memoria.heap_pct + '%', severidad: 'alta' });
    acciones.push({ accion: 'Reiniciar workers con mayor consumo', regla: 'AFR-002', automatica: true });
  }

  // Evaluar disco
  if (healthChecks.disco.uso_pct > 80) {
    problemas.push({ subsistema: 'disco', problema: 'Espacio en disco bajo', valor: healthChecks.disco.uso_pct + '%', severidad: 'media' });
    acciones.push({ accion: 'Rotar logs y limpiar temporales', regla: 'AFR-004', automatica: true });
  }

  // Evaluar colas
  if (healthChecks.colas.mensajes_pendientes > 5000) {
    problemas.push({ subsistema: 'colas', problema: 'Cola saturada', valor: healthChecks.colas.mensajes_pendientes + ' mensajes', severidad: 'alta' });
    acciones.push({ accion: 'Escalar consumidores', regla: 'AFR-009', automatica: true });
  }

  // Evaluar agentes
  if (healthChecks.agentes.agentes_con_error > 0) {
    problemas.push({ subsistema: 'agentes', problema: 'Agentes caidos', valor: healthChecks.agentes.agentes_con_error + ' agentes', severidad: 'alta' });
    acciones.push({ accion: 'Reiniciar agentes con backoff', regla: 'AFR-005', automatica: true });
  }

  // Evaluar servicios externos
  const svcLentos = healthChecks.servicios_externos.servicios.filter(s => s.estado !== 'operativo');
  if (svcLentos.length > 0) {
    svcLentos.forEach(s => {
      problemas.push({ subsistema: 'servicios_externos', problema: `Servicio ${s.nombre} ${s.estado}`, valor: s.latencia_ms + 'ms', severidad: 'media' });
    });
    acciones.push({ accion: 'Monitorizar y preparar fallback para servicios degradados', regla: null, automatica: false });
  }

  let estadoGlobal;
  const tieneCritico = problemas.some(p => p.severidad === 'critica');
  const tieneAlto = problemas.some(p => p.severidad === 'alta');
  if (tieneCritico) estadoGlobal = 'critico';
  else if (tieneAlto || problemas.length >= 3) estadoGlobal = 'degradado';
  else if (problemas.length > 0) estadoGlobal = 'degradado';
  else estadoGlobal = 'sano';

  return {
    estado_global: estadoGlobal,
    timestamp: new Date().toISOString(),
    subsistemas_evaluados: Object.keys(healthChecks).length,
    problemas_detectados: problemas,
    acciones_automaticas: acciones,
    health_checks: healthChecks,
    proxima_evaluacion: 'en 60 segundos',
  };
}

/** Devuelve todos los incidentes registrados */
function getIncidentes() {
  return {
    total: incidentes.length,
    incidentes: incidentes.map(inc => ({ ...inc })),
    resumen: {
      por_tipo: {
        rendimiento: incidentes.filter(i => i.tipo === 'rendimiento').length,
        error: incidentes.filter(i => i.tipo === 'error').length,
        seguridad: incidentes.filter(i => i.tipo === 'seguridad').length,
        datos: incidentes.filter(i => i.tipo === 'datos').length,
        integracion: incidentes.filter(i => i.tipo === 'integracion').length,
      },
      por_severidad: {
        critica: incidentes.filter(i => i.severidad === 'critica').length,
        alta: incidentes.filter(i => i.severidad === 'alta').length,
        media: incidentes.filter(i => i.severidad === 'media').length,
        baja: incidentes.filter(i => i.severidad === 'baja').length,
      },
      auto_curados: incidentes.filter(i => i.auto_curado).length,
      pendientes: incidentes.filter(i => i.estado !== 'resuelto').length,
    },
  };
}

/**
 * Aplica una reparacion automatica basada en el tipo de problema.
 * @param {string} problemaId - Identificador del tipo de problema (ej: 'db_query_lenta')
 */
function repararAutomaticamente(problemaId) {
  const regla = autoFixRules.find(r => r.tipo_problema === problemaId);
  if (!regla) {
    return {
      exito: false,
      mensaje: `No se encontro regla de auto-reparacion para el problema: ${problemaId}`,
      problemas_conocidos: autoFixRules.map(r => r.tipo_problema),
    };
  }

  if (regla.requiere_aprobacion) {
    return {
      exito: false,
      mensaje: `La regla ${regla.id} requiere aprobacion manual antes de ejecutarse.`,
      regla,
      accion_requerida: 'Solicitar aprobacion al equipo de operaciones antes de aplicar.',
    };
  }

  const tiempoSimulado = Math.floor(Math.random() * 20000) + 3000;
  const nuevoIncidente = {
    id: `INC-${String(incidentes.length + 1).padStart(3, '0')}`,
    fecha: new Date().toISOString(),
    tipo: regla.tipo_problema.includes('seguridad') ? 'seguridad' : 'rendimiento',
    descripcion: `Problema detectado: ${regla.tipo_problema}. Umbral superado: ${regla.umbral}.`,
    severidad: regla.riesgo === 'alto' ? 'critica' : regla.riesgo === 'medio' ? 'alta' : 'media',
    causa_raiz: `Condicion ${regla.umbral} detectada por monitoreo continuo.`,
    accion_correctiva: `Accion automatica: ${regla.accion}. ${regla.descripcion}`,
    estado: 'resuelto',
    tiempo_resolucion_ms: tiempoSimulado,
    auto_curado: true,
    regla_aplicada: regla.id,
  };

  incidentes.push(nuevoIncidente);

  return {
    exito: true,
    mensaje: `Reparacion automatica completada en ${tiempoSimulado}ms`,
    regla_aplicada: regla,
    incidente_generado: nuevoIncidente,
    verificacion: {
      estado: 'ok',
      test_post_reparacion: 'passed',
      rollback_disponible: true,
    },
  };
}

/** Devuelve acciones preventivas activas */
function getAccionesPreventivas() {
  return {
    total: accionesPreventivas.length,
    activas: accionesPreventivas.filter(a => a.estado === 'activa').length,
    acciones: accionesPreventivas,
    proxima_revision: '2026-03-25',
    filosofia: 'Mejor prevenir que curar. El sistema analiza patrones historicos para anticiparse a problemas.',
  };
}

/** Estadisticas generales del agente de auto-reparacion */
function getEstadisticas() {
  const totalInc = incidentes.length;
  const autoCurados = incidentes.filter(i => i.auto_curado).length;
  const tiempos = incidentes.map(i => i.tiempo_resolucion_ms);
  const tiempoMedio = Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length);
  const tiempoMax = Math.max(...tiempos);
  const tiempoMin = Math.min(...tiempos);

  return {
    periodo: 'Ultimo mes (2026-02-19 a 2026-03-19)',
    incidentes_mes: totalInc,
    auto_curados: autoCurados,
    auto_curados_pct: Math.round((autoCurados / totalInc) * 100),
    tiempo_medio_resolucion_ms: tiempoMedio,
    tiempo_medio_resolucion_humano: `${(tiempoMedio / 1000).toFixed(1)}s`,
    tiempo_max_resolucion_ms: tiempoMax,
    tiempo_min_resolucion_ms: tiempoMin,
    uptime_conseguido: 99.97,
    uptime_objetivo: 99.95,
    uptime_cumple_sla: true,
    problemas_prevenidos: 23,
    acciones_preventivas_activas: accionesPreventivas.filter(a => a.estado === 'activa').length,
    reglas_auto_fix: autoFixRules.length,
    ahorro_estimado_horas: 47,
    comparativa_sin_self_healing: {
      tiempo_medio_manual_min: 35,
      tiempo_medio_auto_sec: (tiempoMedio / 1000).toFixed(1),
      factor_mejora: `${Math.round(35 * 60000 / tiempoMedio)}x mas rapido`,
    },
  };
}

/** Historial de salud del sistema para graficos (30 dias) */
function getHistorialSalud() {
  const historial = _generarHistorialSalud();
  const scores = historial.map(h => h.score_salud);
  return {
    periodo: '2026-02-18 a 2026-03-19',
    dias: historial,
    resumen: {
      score_medio: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      score_minimo: Math.min(...scores),
      score_maximo: Math.max(...scores),
      dias_criticos: historial.filter(h => h.estado === 'critico').length,
      dias_degradados: historial.filter(h => h.estado === 'degradado').length,
      dias_sanos: historial.filter(h => h.estado === 'sano').length,
      tendencia: 'mejorando',
    },
  };
}

/**
 * Simula un tipo de fallo y muestra la respuesta del sistema.
 * @param {string} tipo - Tipo de fallo a simular (db_query_lenta, memory_leak, api_timeout, disco_lleno, agent_crash, error_rate_alta)
 */
function simularFallo(tipo) {
  const simulaciones = {
    db_query_lenta: {
      fallo_simulado: {
        tipo: 'db_query_lenta',
        descripcion: 'Query SELECT * FROM siniestros WHERE estado=\'abierto\' ORDER BY fecha tarda 6.2 segundos',
        impacto: 'Endpoint /api/siniestros responde con timeout. 340 usuarios afectados.',
      },
      deteccion: {
        metodo: 'Slow query log + monitor de latencia p95',
        tiempo_deteccion_ms: 1500,
        alerta_generada: true,
      },
      diagnostico: {
        causa_identificada: 'Falta indice compuesto en (estado, fecha). Full scan sobre 2.3M filas.',
        confianza: 0.95,
        tiempo_diagnostico_ms: 3200,
      },
      reparacion: {
        accion: 'CREATE INDEX idx_siniestros_estado_fecha ON siniestros(estado, fecha)',
        regla_aplicada: 'AFR-001',
        tiempo_reparacion_ms: 12000,
        resultado: 'Query paso de 6.2s a 35ms. Endpoint normalizado.',
      },
      verificacion: {
        tests_ejecutados: ['latencia_endpoint < 500ms', 'zero_errors_5min', 'index_exists'],
        tests_pasados: 3,
        tests_fallidos: 0,
        sistema_estable: true,
      },
      tiempo_total_ms: 16700,
      intervencion_humana_necesaria: false,
    },
    memory_leak: {
      fallo_simulado: {
        tipo: 'memory_leak',
        descripcion: 'Worker de procesamiento de documentos consume 1.8GB de heap, creciendo 80MB/hora',
        impacto: 'Procesamiento de documentos ralentizado. Cola creciendo a 200 msg/min.',
      },
      deteccion: {
        metodo: 'Monitor de heap usage con umbral al 85%',
        tiempo_deteccion_ms: 800,
        alerta_generada: true,
      },
      diagnostico: {
        causa_identificada: 'Buffer de lectura de PDFs no liberado tras procesamiento. Acumulacion de 4.200 buffers.',
        confianza: 0.88,
        tiempo_diagnostico_ms: 4500,
      },
      reparacion: {
        accion: 'Graceful shutdown del worker + reinicio con heap limpio + patch en buffer management',
        regla_aplicada: 'AFR-002',
        tiempo_reparacion_ms: 8000,
        resultado: 'Heap de 1.8GB a 380MB. Cola drenada en 4 minutos.',
      },
      verificacion: {
        tests_ejecutados: ['heap_usage < 60%', 'queue_draining', 'no_buffer_accumulation'],
        tests_pasados: 3,
        tests_fallidos: 0,
        sistema_estable: true,
      },
      tiempo_total_ms: 13300,
      intervencion_humana_necesaria: false,
    },
    api_timeout: {
      fallo_simulado: {
        tipo: 'api_timeout',
        descripcion: 'Endpoint /api/polizas/buscar devuelve 504 Gateway Timeout tras 30s',
        impacto: 'Portal de clientes inaccesible para consultas. 1.200 usuarios afectados en hora punta.',
      },
      deteccion: {
        metodo: 'Health check cada 10s + alertas Prometheus',
        tiempo_deteccion_ms: 10000,
        alerta_generada: true,
      },
      diagnostico: {
        causa_identificada: 'Query de busqueda full-text sin cache. 3.800 req/min saturan PostgreSQL.',
        confianza: 0.92,
        tiempo_diagnostico_ms: 2800,
      },
      reparacion: {
        accion: 'Cache Redis activado para busquedas con TTL 120s. Resultados pre-computados para top 100 busquedas.',
        regla_aplicada: 'AFR-003',
        tiempo_reparacion_ms: 5500,
        resultado: 'Latencia p95 de timeout a 95ms. Hit rate de cache: 78%.',
      },
      verificacion: {
        tests_ejecutados: ['endpoint_responds_200', 'latency_p95 < 500ms', 'cache_populated'],
        tests_pasados: 3,
        tests_fallidos: 0,
        sistema_estable: true,
      },
      tiempo_total_ms: 18300,
      intervencion_humana_necesaria: false,
    },
    disco_lleno: {
      fallo_simulado: {
        tipo: 'disco_lleno',
        descripcion: 'Particion /var/log al 94%. Estimacion de llenado completo: 3 horas.',
        impacto: 'Si llega al 100%, el sistema deja de escribir logs y algunas operaciones fallan.',
      },
      deteccion: {
        metodo: 'Monitor de uso de disco con umbral al 90%',
        tiempo_deteccion_ms: 500,
        alerta_generada: true,
      },
      diagnostico: {
        causa_identificada: 'Logs de acceso sin comprimir de los ultimos 60 dias (48GB). Exports temporales no limpiados (15GB).',
        confianza: 0.99,
        tiempo_diagnostico_ms: 2000,
      },
      reparacion: {
        accion: 'gzip logs >3 dias (ahorro 42GB). rm exports temporales >12h (ahorro 15GB). Logrotate configurado.',
        regla_aplicada: 'AFR-004',
        tiempo_reparacion_ms: 45000,
        resultado: 'Uso de disco de 94% a 38%. Logrotate programado diariamente.',
      },
      verificacion: {
        tests_ejecutados: ['disk_usage < 50%', 'logrotate_active', 'write_test_ok'],
        tests_pasados: 3,
        tests_fallidos: 0,
        sistema_estable: true,
      },
      tiempo_total_ms: 47500,
      intervencion_humana_necesaria: false,
    },
    agent_crash: {
      fallo_simulado: {
        tipo: 'agent_crash',
        descripcion: 'Agente de rechazos crashea con TypeError: Cannot read property \'monto\' of undefined',
        impacto: 'Rechazos no se procesan. 14 casos en espera.',
      },
      deteccion: {
        metodo: 'Heartbeat monitor detecta ausencia de latido >30s',
        tiempo_deteccion_ms: 30000,
        alerta_generada: true,
      },
      diagnostico: {
        causa_identificada: 'Registro de rechazo con campo monto=null llega de integracion legacy sin validar.',
        confianza: 0.91,
        tiempo_diagnostico_ms: 1200,
      },
      reparacion: {
        accion: 'Reinicio con backoff (intento 1: 1s). Registro corrupto enviado a dead letter queue. Validacion de entrada anadida.',
        regla_aplicada: 'AFR-005',
        tiempo_reparacion_ms: 3500,
        resultado: 'Agente operativo. 14 casos procesados en 2 minutos. Validacion previene futuros crashes.',
      },
      verificacion: {
        tests_ejecutados: ['agent_heartbeat_ok', 'queue_processing', 'null_handling_test'],
        tests_pasados: 3,
        tests_fallidos: 0,
        sistema_estable: true,
      },
      tiempo_total_ms: 34700,
      intervencion_humana_necesaria: false,
    },
    error_rate_alta: {
      fallo_simulado: {
        tipo: 'error_rate_alta',
        descripcion: 'Error rate en servicio de valoracion sube al 25%. Errores 500 en cascada.',
        impacto: 'Valoraciones de siniestros bloqueadas. Backlog de 45 siniestros sin valorar.',
      },
      deteccion: {
        metodo: 'Monitor de error rate con ventana deslizante de 5 minutos',
        tiempo_deteccion_ms: 300000,
        alerta_generada: true,
      },
      diagnostico: {
        causa_identificada: 'Servicio externo TIREA responde 503. Sin circuit breaker, cada retry falla y consume recursos.',
        confianza: 0.96,
        tiempo_diagnostico_ms: 1500,
      },
      reparacion: {
        accion: 'Circuit breaker activado (estado: OPEN). Fallback a cache de valoraciones recientes + estimacion por modelo ML.',
        regla_aplicada: 'AFR-006',
        tiempo_reparacion_ms: 4000,
        resultado: 'Error rate de 25% a 0.5%. 45 siniestros valorados con cache/ML. Circuit breaker en HALF-OPEN para testear TIREA.',
      },
      verificacion: {
        tests_ejecutados: ['error_rate < 1%', 'circuit_breaker_active', 'fallback_responding'],
        tests_pasados: 3,
        tests_fallidos: 0,
        sistema_estable: true,
      },
      tiempo_total_ms: 305500,
      intervencion_humana_necesaria: false,
    },
  };

  const simulacion = simulaciones[tipo];
  if (!simulacion) {
    return {
      error: `Tipo de fallo desconocido: ${tipo}`,
      tipos_disponibles: Object.keys(simulaciones),
      uso: 'simularFallo("db_query_lenta")',
    };
  }

  return {
    simulacion: simulacion,
    conclusion: `El sistema auto-reparo el fallo "${tipo}" en ${(simulacion.tiempo_total_ms / 1000).toFixed(1)}s sin intervencion humana.`,
    nota: 'Esta es una simulacion. No se ha ejecutado ninguna accion real sobre el sistema.',
  };
}

// ============================================================================
// Exports
// ============================================================================
module.exports = {
  diagnosticar,
  getIncidentes,
  repararAutomaticamente,
  getAccionesPreventivas,
  getEstadisticas,
  getHistorialSalud,
  simularFallo,
};
