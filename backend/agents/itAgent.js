// ============================================================================
// IT Agent - Departamento Autonomo de Tecnologia e Infraestructura
// Monitoreo de sistemas, incidencias, seguridad y costes
// ============================================================================

/**
 * Devuelve el estado actual de todos los sistemas e infraestructura
 * @returns {Array} Lista de 12 servicios con estado y metricas
 */
function getEstadoSistemas() {
  const ahora = new Date().toISOString();

  const sistemas = [
    {
      id: 'SYS-001',
      nombre: 'API Principal (REST)',
      estado: 'operativo',
      uptime_pct: 99.97,
      latencia_ms: 45,
      ultimo_check: ahora,
      version: 'v3.8.2',
      instancias: 4,
      requests_por_minuto: 2340,
      errores_24h: 3
    },
    {
      id: 'SYS-002',
      nombre: 'Base de Datos PostgreSQL',
      estado: 'operativo',
      uptime_pct: 99.99,
      latencia_ms: 12,
      ultimo_check: ahora,
      version: '15.4',
      conexiones_activas: 87,
      tamano_gb: 234.5,
      queries_por_segundo: 1250
    },
    {
      id: 'SYS-003',
      nombre: 'WebSockets (Tiempo Real)',
      estado: 'operativo',
      uptime_pct: 99.92,
      latencia_ms: 8,
      ultimo_check: ahora,
      conexiones_activas: 1456,
      mensajes_por_minuto: 8900,
      errores_24h: 0
    },
    {
      id: 'SYS-004',
      nombre: 'Almacenamiento S3',
      estado: 'operativo',
      uptime_pct: 99.99,
      latencia_ms: 65,
      ultimo_check: ahora,
      espacio_usado_tb: 4.7,
      espacio_total_tb: 10,
      archivos_totales: 2340000,
      transferencia_diaria_gb: 45.2
    },
    {
      id: 'SYS-005',
      nombre: 'Servicio Email (SMTP)',
      estado: 'operativo',
      uptime_pct: 99.85,
      latencia_ms: 230,
      ultimo_check: ahora,
      emails_enviados_hoy: 12450,
      tasa_entrega: 98.7,
      cola_pendiente: 23
    },
    {
      id: 'SYS-006',
      nombre: 'Servicio SMS',
      estado: 'degradado',
      uptime_pct: 98.50,
      latencia_ms: 890,
      ultimo_check: ahora,
      sms_enviados_hoy: 3420,
      tasa_entrega: 96.2,
      cola_pendiente: 156,
      nota: 'Proveedor con latencia elevada desde las 08:00'
    },
    {
      id: 'SYS-007',
      nombre: 'WhatsApp Business API',
      estado: 'operativo',
      uptime_pct: 99.91,
      latencia_ms: 120,
      ultimo_check: ahora,
      mensajes_enviados_hoy: 5670,
      tasa_entrega: 99.1,
      conversaciones_activas: 234
    },
    {
      id: 'SYS-008',
      nombre: 'Centralita VoIP',
      estado: 'operativo',
      uptime_pct: 99.88,
      latencia_ms: 35,
      ultimo_check: ahora,
      llamadas_activas: 18,
      llamadas_hoy: 456,
      calidad_media_mos: 4.2,
      grabaciones_almacenadas: 89000
    },
    {
      id: 'SYS-009',
      nombre: 'Frontend (SPA)',
      estado: 'operativo',
      uptime_pct: 99.98,
      latencia_ms: 180,
      ultimo_check: ahora,
      version: 'v2.14.1',
      tiempo_carga_p50_ms: 1200,
      tiempo_carga_p95_ms: 2800,
      errores_js_24h: 12
    },
    {
      id: 'SYS-010',
      nombre: 'CDN CloudFront',
      estado: 'operativo',
      uptime_pct: 99.99,
      latencia_ms: 22,
      ultimo_check: ahora,
      cache_hit_rate: 94.5,
      transferencia_diaria_gb: 120.3,
      nodos_activos: 47
    },
    {
      id: 'SYS-011',
      nombre: 'Backup Automatizado',
      estado: 'operativo',
      uptime_pct: 100.00,
      latencia_ms: null,
      ultimo_check: ahora,
      ultimo_backup: '2026-03-19T03:00:00Z',
      tamano_ultimo_backup_gb: 67.8,
      backups_retenidos: 90,
      siguiente_backup: '2026-03-20T03:00:00Z'
    },
    {
      id: 'SYS-012',
      nombre: 'Monitoring (Prometheus + Grafana)',
      estado: 'operativo',
      uptime_pct: 99.95,
      latencia_ms: 55,
      ultimo_check: ahora,
      alertas_activas: 2,
      metricas_recopiladas: 4500,
      dashboards: 18,
      reglas_alerta: 124
    }
  ];

  return sistemas;
}

/**
 * Devuelve las incidencias IT activas
 * @returns {Array} Lista de 5 incidencias con detalles
 */
function getIncidencias() {
  const incidencias = [
    {
      id: 'INC-2026-0342',
      severidad: 'P3',
      descripcion: 'Latencia elevada en servicio SMS - tiempos de entrega superiores a 800ms',
      sistema_afectado: 'Servicio SMS',
      inicio: '2026-03-19T08:15:00Z',
      estado: 'en_investigacion',
      tiempo_resolucion_estimado: '4 horas',
      asignado_a: 'Carlos Mendez',
      equipo: 'Infraestructura',
      actualizaciones: [
        { hora: '08:15', mensaje: 'Detectada latencia elevada por monitoring automatico' },
        { hora: '08:30', mensaje: 'Confirmado problema en proveedor SMS. Contactando soporte' },
        { hora: '09:45', mensaje: 'Proveedor confirma degradacion parcial en su plataforma' }
      ],
      impacto: 'Retraso en notificaciones SMS a clientes. No hay perdida de mensajes.'
    },
    {
      id: 'INC-2026-0340',
      severidad: 'P2',
      descripcion: 'Picos de CPU en servidor de base de datos durante consultas de reportes',
      sistema_afectado: 'Base de Datos PostgreSQL',
      inicio: '2026-03-18T14:30:00Z',
      estado: 'en_progreso',
      tiempo_resolucion_estimado: '2 horas',
      asignado_a: 'Ana Garcia',
      equipo: 'Base de Datos',
      actualizaciones: [
        { hora: '14:30', mensaje: 'Alerta de CPU al 92% en nodo primario DB' },
        { hora: '15:00', mensaje: 'Identificadas 3 queries de reportes sin optimizar' },
        { hora: '16:30', mensaje: 'Optimizadas 2 de 3 queries. CPU estabilizado al 65%' },
        { hora: '09:00', mensaje: 'Trabajando en la tercera query. Requiere cambio de indice' }
      ],
      impacto: 'Lentitud temporal en generacion de reportes. Operativa normal no afectada.'
    },
    {
      id: 'INC-2026-0338',
      severidad: 'P4',
      descripcion: 'Error intermitente en carga de imagenes de siniestros en movil',
      sistema_afectado: 'Frontend (SPA)',
      inicio: '2026-03-17T11:00:00Z',
      estado: 'en_progreso',
      tiempo_resolucion_estimado: '1 dia',
      asignado_a: 'David Lopez',
      equipo: 'Frontend',
      actualizaciones: [
        { hora: '11:00', mensaje: 'Reportado por 3 usuarios en dispositivos Android' },
        { hora: '14:00', mensaje: 'Reproducido en Android Chrome 120. Problema de compresion HEIF' },
        { hora: '10:00', mensaje: 'Fix en desarrollo. PR abierto para revision' }
      ],
      impacto: 'Algunos usuarios Android no pueden subir fotos en formato HEIF. Workaround: usar formato JPG.'
    },
    {
      id: 'INC-2026-0336',
      severidad: 'P3',
      descripcion: 'Certificado SSL de subdominio api-staging proximo a expirar',
      sistema_afectado: 'API Staging',
      inicio: '2026-03-16T09:00:00Z',
      estado: 'programado',
      tiempo_resolucion_estimado: 'Renovacion programada 20/03',
      asignado_a: 'Carlos Mendez',
      equipo: 'Infraestructura',
      actualizaciones: [
        { hora: '09:00', mensaje: 'Alerta automatica: certificado expira en 5 dias' },
        { hora: '10:00', mensaje: 'Renovacion automatica programada para el 20/03' }
      ],
      impacto: 'Solo afecta entorno de staging. Produccion no impactado.'
    },
    {
      id: 'INC-2026-0335',
      severidad: 'P4',
      descripcion: 'Dashboard de Grafana muestra datos desactualizados en panel de costes',
      sistema_afectado: 'Monitoring (Prometheus + Grafana)',
      inicio: '2026-03-15T16:00:00Z',
      estado: 'en_cola',
      tiempo_resolucion_estimado: '2 dias',
      asignado_a: 'Sin asignar',
      equipo: 'DevOps',
      actualizaciones: [
        { hora: '16:00', mensaje: 'Reportado por equipo de finanzas' },
        { hora: '17:00', mensaje: 'Confirmado: datasource de billing API desincronizado' }
      ],
      impacto: 'Panel de costes muestra datos con 24h de retraso. Resto de dashboards OK.'
    }
  ];

  return incidencias;
}

/**
 * Devuelve resultados del escaneo de seguridad y vulnerabilidades
 * @returns {Array} Lista de 8 vulnerabilidades detectadas
 */
function getVulnerabilidades() {
  const vulnerabilidades = [
    {
      id: 'VUL-001',
      severidad: 'critica',
      descripcion: 'CVE-2026-1234: Vulnerabilidad de inyeccion SQL en libreria pg-query v2.3.1',
      sistema: 'API Principal',
      componente: 'pg-query',
      version_afectada: '2.3.1',
      version_parcheada: '2.3.5',
      parcheado: true,
      fecha_deteccion: '2026-03-10',
      fecha_parcheo: '2026-03-10',
      cvss_score: 9.8,
      responsable: 'Ana Garcia'
    },
    {
      id: 'VUL-002',
      severidad: 'alta',
      descripcion: 'CVE-2026-2567: XSS almacenado en campo de comentarios de siniestros',
      sistema: 'Frontend (SPA)',
      componente: 'react-rich-editor',
      version_afectada: '4.1.0',
      version_parcheada: '4.1.3',
      parcheado: true,
      fecha_deteccion: '2026-03-08',
      fecha_parcheo: '2026-03-12',
      cvss_score: 7.5,
      responsable: 'David Lopez'
    },
    {
      id: 'VUL-003',
      severidad: 'alta',
      descripcion: 'Credenciales de API de SMS hardcodeadas en archivo de configuracion',
      sistema: 'Servicio SMS',
      componente: 'config/sms.js',
      version_afectada: 'N/A',
      version_parcheada: 'N/A',
      parcheado: false,
      fecha_deteccion: '2026-03-15',
      fecha_parcheo: null,
      cvss_score: 7.2,
      responsable: 'Carlos Mendez',
      plan_remediacion: 'Migrar a AWS Secrets Manager. PR en revision.'
    },
    {
      id: 'VUL-004',
      severidad: 'media',
      descripcion: 'Version desactualizada de Node.js (18.x) en contenedores de produccion',
      sistema: 'API Principal',
      componente: 'Docker base image',
      version_afectada: '18.19.0',
      version_parcheada: '20.12.0',
      parcheado: false,
      fecha_deteccion: '2026-03-05',
      fecha_parcheo: null,
      cvss_score: 5.3,
      responsable: 'Carlos Mendez',
      plan_remediacion: 'Actualizacion planificada para ventana de mantenimiento del 22/03'
    },
    {
      id: 'VUL-005',
      severidad: 'media',
      descripcion: 'Headers de seguridad faltantes: X-Content-Type-Options, X-Frame-Options',
      sistema: 'Frontend (SPA)',
      componente: 'nginx.conf',
      version_afectada: 'N/A',
      version_parcheada: 'N/A',
      parcheado: false,
      fecha_deteccion: '2026-03-12',
      fecha_parcheo: null,
      cvss_score: 4.7,
      responsable: 'David Lopez',
      plan_remediacion: 'Configuracion de headers en nginx. Merge previsto esta semana.'
    },
    {
      id: 'VUL-006',
      severidad: 'baja',
      descripcion: 'Cookies de sesion sin flag SameSite en entorno de staging',
      sistema: 'API Staging',
      componente: 'express-session',
      version_afectada: '1.17.3',
      version_parcheada: '1.18.0',
      parcheado: false,
      fecha_deteccion: '2026-03-14',
      fecha_parcheo: null,
      cvss_score: 3.1,
      responsable: 'Ana Garcia'
    },
    {
      id: 'VUL-007',
      severidad: 'baja',
      descripcion: 'Informacion de version del servidor expuesta en headers HTTP',
      sistema: 'CDN CloudFront',
      componente: 'Configuracion CDN',
      version_afectada: 'N/A',
      version_parcheada: 'N/A',
      parcheado: true,
      fecha_deteccion: '2026-03-06',
      fecha_parcheo: '2026-03-07',
      cvss_score: 2.6,
      responsable: 'Carlos Mendez'
    },
    {
      id: 'VUL-008',
      severidad: 'media',
      descripcion: 'Politica de contrasenas debil en panel de administracion interno',
      sistema: 'Frontend (SPA)',
      componente: 'auth-module',
      version_afectada: 'N/A',
      version_parcheada: 'N/A',
      parcheado: false,
      fecha_deteccion: '2026-03-11',
      fecha_parcheo: null,
      cvss_score: 5.9,
      responsable: 'David Lopez',
      plan_remediacion: 'Implementar requisitos: min 12 chars, mayusculas, numeros, especiales. Sprint actual.'
    }
  ];

  return vulnerabilidades;
}

/**
 * Devuelve las actualizaciones pendientes del sistema
 * @returns {Array} Lista de 10 paquetes/sistemas con actualizaciones disponibles
 */
function getActualizaciones() {
  const actualizaciones = [
    { id: 'UPD-001', componente: 'Node.js Runtime', tipo: 'runtime', version_actual: '18.19.0', version_disponible: '20.12.0', severidad: 'importante', fecha_disponible: '2026-02-15', estado: 'planificada', ventana_mantenimiento: '2026-03-22T02:00:00Z' },
    { id: 'UPD-002', componente: 'PostgreSQL', tipo: 'base_datos', version_actual: '15.4', version_disponible: '15.6', severidad: 'recomendada', fecha_disponible: '2026-03-01', estado: 'planificada', ventana_mantenimiento: '2026-03-22T02:00:00Z' },
    { id: 'UPD-003', componente: 'React', tipo: 'framework', version_actual: '18.2.0', version_disponible: '19.1.0', severidad: 'opcional', fecha_disponible: '2026-02-20', estado: 'evaluando', notas: 'Requiere migracion de APIs legacy' },
    { id: 'UPD-004', componente: 'Express.js', tipo: 'framework', version_actual: '4.18.2', version_disponible: '4.19.1', severidad: 'recomendada', fecha_disponible: '2026-03-05', estado: 'pendiente', notas: 'Incluye parches de seguridad' },
    { id: 'UPD-005', componente: 'nginx', tipo: 'servidor', version_actual: '1.24.0', version_disponible: '1.26.0', severidad: 'recomendada', fecha_disponible: '2026-02-28', estado: 'planificada', ventana_mantenimiento: '2026-03-22T02:00:00Z' },
    { id: 'UPD-006', componente: 'Docker Engine', tipo: 'contenedor', version_actual: '24.0.7', version_disponible: '25.0.3', severidad: 'importante', fecha_disponible: '2026-01-20', estado: 'en_pruebas', notas: 'Testing en staging completado al 80%' },
    { id: 'UPD-007', componente: 'Redis', tipo: 'cache', version_actual: '7.0.12', version_disponible: '7.2.4', severidad: 'opcional', fecha_disponible: '2026-03-10', estado: 'pendiente', notas: 'Mejoras de rendimiento en pub/sub' },
    { id: 'UPD-008', componente: 'Terraform', tipo: 'iac', version_actual: '1.6.4', version_disponible: '1.7.2', severidad: 'recomendada', fecha_disponible: '2026-02-10', estado: 'pendiente', notas: 'Nuevos providers disponibles' },
    { id: 'UPD-009', componente: 'Grafana', tipo: 'monitoring', version_actual: '10.2.0', version_disponible: '10.4.1', severidad: 'opcional', fecha_disponible: '2026-03-08', estado: 'evaluando', notas: 'Nuevos paneles de visualizacion' },
    { id: 'UPD-010', componente: 'Kubernetes', tipo: 'orquestacion', version_actual: '1.28.4', version_disponible: '1.29.2', severidad: 'importante', fecha_disponible: '2026-02-25', estado: 'planificada', ventana_mantenimiento: '2026-03-29T02:00:00Z' }
  ];

  return actualizaciones;
}

/**
 * Devuelve metricas de sistema: CPU, RAM, disco y red con patrones realistas
 * @returns {Object} Metricas de rendimiento del sistema
 */
function getMetricasSistema() {
  // Generar datos de las ultimas 24 horas con patrones realistas
  const horas = [];
  const baseHora = new Date();
  baseHora.setMinutes(0, 0, 0);

  for (let i = 23; i >= 0; i--) {
    const hora = new Date(baseHora.getTime() - i * 3600000);
    const h = hora.getHours();

    // Patron realista: bajo de noche, pico por la manana y tarde
    let factorCarga;
    if (h >= 0 && h < 6) factorCarga = 0.15 + Math.random() * 0.1;
    else if (h >= 6 && h < 9) factorCarga = 0.3 + Math.random() * 0.2;
    else if (h >= 9 && h < 13) factorCarga = 0.6 + Math.random() * 0.2;
    else if (h >= 13 && h < 15) factorCarga = 0.5 + Math.random() * 0.15;
    else if (h >= 15 && h < 19) factorCarga = 0.65 + Math.random() * 0.2;
    else if (h >= 19 && h < 22) factorCarga = 0.4 + Math.random() * 0.15;
    else factorCarga = 0.2 + Math.random() * 0.1;

    horas.push({
      timestamp: hora.toISOString(),
      hora: `${String(h).padStart(2, '0')}:00`,
      cpu_porcentaje: Math.round(factorCarga * 80 + Math.random() * 10),
      ram_porcentaje: Math.round(55 + factorCarga * 30 + Math.random() * 5),
      disco_porcentaje: Math.round(62 + Math.random() * 2),
      red_entrada_mbps: Math.round(factorCarga * 450 + Math.random() * 50),
      red_salida_mbps: Math.round(factorCarga * 320 + Math.random() * 40),
      conexiones_activas: Math.round(factorCarga * 2000 + Math.random() * 200),
      requests_por_segundo: Math.round(factorCarga * 850 + Math.random() * 100)
    });
  }

  const metricas = {
    periodo: 'ultimas_24h',
    resumen: {
      cpu_promedio: Math.round(horas.reduce((s, h) => s + h.cpu_porcentaje, 0) / horas.length),
      cpu_maximo: Math.max(...horas.map(h => h.cpu_porcentaje)),
      ram_promedio: Math.round(horas.reduce((s, h) => s + h.ram_porcentaje, 0) / horas.length),
      ram_maximo: Math.max(...horas.map(h => h.ram_porcentaje)),
      disco_usado_gb: 620,
      disco_total_gb: 1000,
      red_total_entrada_gb: Math.round(horas.reduce((s, h) => s + h.red_entrada_mbps, 0) * 3.6 / 8000),
      red_total_salida_gb: Math.round(horas.reduce((s, h) => s + h.red_salida_mbps, 0) * 3.6 / 8000)
    },
    series: horas,
    alertas_rendimiento: [
      { tipo: 'warning', mensaje: 'CPU supero 85% a las 11:23 durante 8 minutos', timestamp: '2026-03-19T11:23:00Z' },
      { tipo: 'info', mensaje: 'Pico de conexiones: 2,340 simultaneas a las 10:45', timestamp: '2026-03-19T10:45:00Z' }
    ]
  };

  return metricas;
}

/**
 * Devuelve mapa de calor de carga del servidor (24h x 7d)
 * @returns {Object} Matriz de carga con valores 0-100
 */
function getCargaServidor() {
  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  const heatmap = {};

  dias.forEach((dia, diaIdx) => {
    heatmap[dia] = [];
    for (let h = 0; h < 24; h++) {
      let base;
      const esFinDeSemana = diaIdx >= 5;

      if (h >= 0 && h < 6) base = esFinDeSemana ? 5 : 10;
      else if (h >= 6 && h < 9) base = esFinDeSemana ? 15 : 35;
      else if (h >= 9 && h < 13) base = esFinDeSemana ? 25 : 72;
      else if (h >= 13 && h < 15) base = esFinDeSemana ? 20 : 55;
      else if (h >= 15 && h < 19) base = esFinDeSemana ? 22 : 68;
      else if (h >= 19 && h < 22) base = esFinDeSemana ? 18 : 40;
      else base = esFinDeSemana ? 8 : 18;

      // Agregar variacion aleatoria determinista basada en dia y hora
      const variacion = ((diaIdx * 24 + h) * 7 + 13) % 15 - 7;
      heatmap[dia].push(Math.max(0, Math.min(100, base + variacion)));
    }
  });

  return {
    descripcion: 'Mapa de calor de carga del servidor (% CPU promedio)',
    horas: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
    dias: dias,
    datos: heatmap,
    pico_maximo: { dia: 'Miercoles', hora: '11:00', carga: 85 },
    valle_minimo: { dia: 'Domingo', hora: '03:00', carga: 3 }
  };
}

/**
 * Devuelve los costes de infraestructura desglosados por servicio
 * @returns {Object} Costes mensuales con desglose y tendencia
 */
function getCostesInfra() {
  const costes = {
    periodo: 'Marzo 2026',
    total_mensual: 8450,
    presupuesto_mensual: 9000,
    ahorro_vs_presupuesto: 550,
    desglose: [
      { servicio: 'AWS EC2 (Computacion)', coste: 2800, porcentaje: 33.14, tendencia: 'estable', detalle: '4 instancias m5.xlarge + 2 t3.medium' },
      { servicio: 'AWS RDS (Base de Datos)', coste: 1650, porcentaje: 19.53, tendencia: 'subiendo', detalle: 'PostgreSQL Multi-AZ db.r5.xlarge' },
      { servicio: 'AWS S3 (Almacenamiento)', coste: 420, porcentaje: 4.97, tendencia: 'subiendo', detalle: '4.7TB almacenados + transferencia' },
      { servicio: 'AWS CloudFront (CDN)', coste: 380, porcentaje: 4.50, tendencia: 'estable', detalle: '120GB/dia transferencia media' },
      { servicio: 'AWS Lambda (Serverless)', coste: 290, porcentaje: 3.43, tendencia: 'bajando', detalle: '2.3M invocaciones/mes' },
      { servicio: 'Twilio (SMS + WhatsApp)', coste: 890, porcentaje: 10.53, tendencia: 'subiendo', detalle: '~9,000 mensajes/dia' },
      { servicio: 'SendGrid (Email)', coste: 320, porcentaje: 3.79, tendencia: 'estable', detalle: 'Plan Pro 100K emails/mes' },
      { servicio: 'Datadog (Monitoring)', coste: 450, porcentaje: 5.33, tendencia: 'estable', detalle: '12 hosts monitorizados' },
      { servicio: 'GitHub Enterprise', coste: 210, porcentaje: 2.49, tendencia: 'estable', detalle: '15 licencias developer' },
      { servicio: 'Cloudflare (WAF + DNS)', coste: 200, porcentaje: 2.37, tendencia: 'estable', detalle: 'Plan Business' },
      { servicio: 'VoIP Centralita', coste: 340, porcentaje: 4.02, tendencia: 'estable', detalle: '25 extensiones + grabacion' },
      { servicio: 'Otros (backup, certs, misc)', coste: 500, porcentaje: 5.92, tendencia: 'estable', detalle: 'Backups, certificados SSL, DNS' }
    ],
    comparativa_mensual: [
      { mes: 'Octubre 2025', coste: 7890 },
      { mes: 'Noviembre 2025', coste: 7950 },
      { mes: 'Diciembre 2025', coste: 8100 },
      { mes: 'Enero 2026', coste: 8200 },
      { mes: 'Febrero 2026', coste: 8350 },
      { mes: 'Marzo 2026', coste: 8450 }
    ],
    recomendaciones_ahorro: [
      { accion: 'Reservar instancias EC2 (1 ano)', ahorro_estimado: 840, nota: 'Ahorro del 30% vs on-demand' },
      { accion: 'Migrar almacenamiento frio a S3 Glacier', ahorro_estimado: 120, nota: '1.2TB de documentos antiguos elegibles' },
      { accion: 'Optimizar queries pesadas de reportes', ahorro_estimado: 200, nota: 'Podria permitir reducir tamano de RDS' }
    ]
  };

  return costes;
}

/**
 * Devuelve las estadisticas resumen del departamento IT
 * @returns {Object} KPIs principales de IT
 */
function getEstadisticas() {
  const estadisticas = {
    uptime_global: 99.91,
    incidencias_mes: 14,
    incidencias_activas: 5,
    incidencias_resueltas_mes: 9,
    tiempo_medio_resolucion: '3.2 horas',
    vulnerabilidades_abiertas: 5,
    vulnerabilidades_criticas_abiertas: 0,
    vulnerabilidades_resueltas_mes: 3,
    coste_infra_mes: 8450,
    presupuesto_infra_mes: 9000,
    actualizaciones_pendientes: 10,
    actualizaciones_criticas: 2,
    sistemas_operativos: 11,
    sistemas_degradados: 1,
    sistemas_caidos: 0,
    backups_exitosos_semana: 7,
    ultimo_backup: '2026-03-19T03:00:00Z',
    certificados_por_renovar: 1,
    deployments_mes: 23,
    rollbacks_mes: 1,
    mttr_horas: 3.2,
    mttf_horas: 168,
    sla_cumplimiento: 99.91
  };

  return estadisticas;
}

// ============================================================================
// Exportaciones
// ============================================================================
module.exports = {
  getEstadoSistemas,
  getIncidencias,
  getVulnerabilidades,
  getActualizaciones,
  getMetricasSistema,
  getCargaServidor,
  getCostesInfra,
  getEstadisticas
};
