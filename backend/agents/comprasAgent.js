// ============================================================================
// Compras Agent - Departamento Autonomo de Compras y Aprovisionamiento
// Gestion de proveedores, pedidos, licencias, contratos y negociacion
// ============================================================================

/**
 * Devuelve los proveedores de la empresa con evaluacion y datos de contrato
 * @returns {Array} Lista de 15 proveedores con puntuacion y vencimientos
 */
function getProveedoresEmpresa() {
  const proveedores = [
    {
      id: 'PROV-001',
      nombre: 'CloudTech Solutions S.L.',
      categoria: 'tecnologia',
      contrato_anual: 42000,
      puntuacion: 9.2,
      ultimo_pedido: '2026-03-15',
      proximo_vencimiento: '2026-09-30',
      contacto: 'Ricardo Blanco',
      email: 'rblanco@cloudtech.es',
      servicios: ['Hosting AWS', 'Soporte infraestructura', 'DevOps'],
      condiciones_pago: '30 dias',
      evaluacion: { calidad: 9.5, puntualidad: 9.0, precio: 8.8, soporte: 9.5 }
    },
    {
      id: 'PROV-002',
      nombre: 'Seguridad Digital Pro',
      categoria: 'tecnologia',
      contrato_anual: 18000,
      puntuacion: 8.8,
      ultimo_pedido: '2026-03-10',
      proximo_vencimiento: '2026-12-31',
      contacto: 'Marta Jimenez',
      email: 'mjimenez@segdigital.es',
      servicios: ['Auditoria seguridad', 'Pentesting', 'WAF'],
      condiciones_pago: '30 dias',
      evaluacion: { calidad: 9.2, puntualidad: 8.5, precio: 8.5, soporte: 9.0 }
    },
    {
      id: 'PROV-003',
      nombre: 'Telecomunicaciones Avanza',
      categoria: 'tecnologia',
      contrato_anual: 15600,
      puntuacion: 7.5,
      ultimo_pedido: '2026-02-28',
      proximo_vencimiento: '2026-06-30',
      contacto: 'Jorge Navarro',
      email: 'jnavarro@avanza.es',
      servicios: ['Fibra optica', 'VoIP', 'SIP Trunk'],
      condiciones_pago: 'Mensual',
      evaluacion: { calidad: 7.8, puntualidad: 7.0, precio: 7.5, soporte: 7.8 }
    },
    {
      id: 'PROV-004',
      nombre: 'Deloitte Asesores',
      categoria: 'servicios',
      contrato_anual: 36000,
      puntuacion: 9.0,
      ultimo_pedido: '2026-03-01',
      proximo_vencimiento: '2026-12-31',
      contacto: 'Patricia Romero',
      email: 'promero@deloitte.es',
      servicios: ['Auditoria contable', 'Asesoria fiscal', 'Compliance'],
      condiciones_pago: '45 dias',
      evaluacion: { calidad: 9.5, puntualidad: 8.8, precio: 8.2, soporte: 9.5 }
    },
    {
      id: 'PROV-005',
      nombre: 'Bufete Herrera & Asociados',
      categoria: 'servicios',
      contrato_anual: 24000,
      puntuacion: 9.3,
      ultimo_pedido: '2026-03-12',
      proximo_vencimiento: '2027-01-31',
      contacto: 'Antonio Herrera',
      email: 'aherrera@bufeteherrera.es',
      servicios: ['Asesoria legal', 'Contratos', 'Litigios'],
      condiciones_pago: '30 dias',
      evaluacion: { calidad: 9.5, puntualidad: 9.2, precio: 9.0, soporte: 9.5 }
    },
    {
      id: 'PROV-006',
      nombre: 'Limpieza Profesional Madrid',
      categoria: 'mantenimiento',
      contrato_anual: 14400,
      puntuacion: 8.0,
      ultimo_pedido: '2026-03-01',
      proximo_vencimiento: '2026-08-31',
      contacto: 'Rosa Fernandez',
      email: 'rfernandez@limpromad.es',
      servicios: ['Limpieza diaria oficinas', 'Limpieza cristales', 'Desinfeccion'],
      condiciones_pago: 'Mensual',
      evaluacion: { calidad: 8.2, puntualidad: 8.0, precio: 8.0, soporte: 7.8 }
    },
    {
      id: 'PROV-007',
      nombre: 'Mobiliario Ergonomico S.A.',
      categoria: 'oficina',
      contrato_anual: 8500,
      puntuacion: 8.5,
      ultimo_pedido: '2026-02-15',
      proximo_vencimiento: '2026-11-30',
      contacto: 'Luis Ortega',
      email: 'lortega@ergomobi.es',
      servicios: ['Sillas ergonomicas', 'Mesas elevables', 'Accesorios'],
      condiciones_pago: '30 dias',
      evaluacion: { calidad: 9.0, puntualidad: 8.5, precio: 7.8, soporte: 8.8 }
    },
    {
      id: 'PROV-008',
      nombre: 'Suministros Oficina Express',
      categoria: 'oficina',
      contrato_anual: 6200,
      puntuacion: 7.8,
      ultimo_pedido: '2026-03-18',
      proximo_vencimiento: '2026-07-31',
      contacto: 'Carmen Solis',
      email: 'csolis@ofiexpress.es',
      servicios: ['Material de oficina', 'Papel', 'Toners', 'Catering'],
      condiciones_pago: '15 dias',
      evaluacion: { calidad: 7.5, puntualidad: 8.0, precio: 8.2, soporte: 7.5 }
    },
    {
      id: 'PROV-009',
      nombre: 'Mapfre RE (Reaseguros)',
      categoria: 'seguros',
      contrato_anual: 125000,
      puntuacion: 9.5,
      ultimo_pedido: '2026-01-15',
      proximo_vencimiento: '2027-01-14',
      contacto: 'Alberto Marcos',
      email: 'amarcos@mapfre-re.es',
      servicios: ['Reaseguro proporcional', 'Exceso de perdida', 'Catastrofe'],
      condiciones_pago: 'Trimestral',
      evaluacion: { calidad: 9.8, puntualidad: 9.5, precio: 9.0, soporte: 9.8 }
    },
    {
      id: 'PROV-010',
      nombre: 'Swiss Re',
      categoria: 'seguros',
      contrato_anual: 98000,
      puntuacion: 9.4,
      ultimo_pedido: '2026-01-15',
      proximo_vencimiento: '2027-01-14',
      contacto: 'Hans Mueller',
      email: 'hmueller@swissre.com',
      servicios: ['Reaseguro vida', 'Reaseguro no vida', 'Soluciones ILS'],
      condiciones_pago: 'Trimestral',
      evaluacion: { calidad: 9.5, puntualidad: 9.5, precio: 9.2, soporte: 9.5 }
    },
    {
      id: 'PROV-011',
      nombre: 'Mantenimiento Integral 360',
      categoria: 'mantenimiento',
      contrato_anual: 9600,
      puntuacion: 7.2,
      ultimo_pedido: '2026-03-05',
      proximo_vencimiento: '2026-05-31',
      contacto: 'Francisco Ruiz',
      email: 'fruiz@mant360.es',
      servicios: ['Climatizacion', 'Electricidad', 'Fontaneria'],
      condiciones_pago: 'Mensual',
      evaluacion: { calidad: 7.5, puntualidad: 6.8, precio: 7.5, soporte: 7.0 }
    },
    {
      id: 'PROV-012',
      nombre: 'DataCenter Iberia',
      categoria: 'tecnologia',
      contrato_anual: 28800,
      puntuacion: 8.9,
      ultimo_pedido: '2026-03-01',
      proximo_vencimiento: '2026-10-31',
      contacto: 'Sergio Vidal',
      email: 'svidal@dciberia.es',
      servicios: ['Colocation', 'Conectividad', 'DR site'],
      condiciones_pago: 'Mensual',
      evaluacion: { calidad: 9.0, puntualidad: 9.0, precio: 8.5, soporte: 9.2 }
    },
    {
      id: 'PROV-013',
      nombre: 'Formacion Empresarial Plus',
      categoria: 'servicios',
      contrato_anual: 12000,
      puntuacion: 8.3,
      ultimo_pedido: '2026-02-20',
      proximo_vencimiento: '2026-12-31',
      contacto: 'Laura Campos',
      email: 'lcampos@formplus.es',
      servicios: ['Formacion tecnica', 'Liderazgo', 'Cumplimiento normativo'],
      condiciones_pago: '30 dias',
      evaluacion: { calidad: 8.5, puntualidad: 8.2, precio: 8.0, soporte: 8.5 }
    },
    {
      id: 'PROV-014',
      nombre: 'Seguros Generales Peritaje S.L.',
      categoria: 'servicios',
      contrato_anual: 45000,
      puntuacion: 8.7,
      ultimo_pedido: '2026-03-17',
      proximo_vencimiento: '2026-09-30',
      contacto: 'Manuel Delgado',
      email: 'mdelgado@sgperitaje.es',
      servicios: ['Peritajes siniestros', 'Valoraciones', 'Informes tecnicos'],
      condiciones_pago: '30 dias',
      evaluacion: { calidad: 9.0, puntualidad: 8.5, precio: 8.2, soporte: 9.0 }
    },
    {
      id: 'PROV-015',
      nombre: 'Agencia Creativa Pixel',
      categoria: 'servicios',
      contrato_anual: 22000,
      puntuacion: 8.6,
      ultimo_pedido: '2026-03-14',
      proximo_vencimiento: '2026-11-30',
      contacto: 'Natalia Reyes',
      email: 'nreyes@pixelagencia.es',
      servicios: ['Diseno grafico', 'Produccion video', 'Branding'],
      condiciones_pago: '30 dias',
      evaluacion: { calidad: 9.2, puntualidad: 8.0, precio: 8.0, soporte: 9.0 }
    }
  ];

  return proveedores;
}

/**
 * Devuelve los pedidos activos con estado de seguimiento
 * @returns {Array} Lista de 10 pedidos con estado y aprobacion
 */
function getPedidos() {
  const pedidos = [
    {
      id: 'PED-2026-0089',
      proveedor: 'CloudTech Solutions S.L.',
      descripcion: 'Ampliacion capacidad servidor - 2 instancias m5.xlarge adicionales',
      importe: 4800,
      fecha: '2026-03-15',
      fecha_entrega_estimada: '2026-03-20',
      estado: 'enviado',
      aprobado_por: 'Director IT - Carlos Mendez',
      categoria: 'tecnologia',
      urgencia: 'alta',
      notas: 'Necesario por incremento de trafico previsto en Q2'
    },
    {
      id: 'PED-2026-0088',
      proveedor: 'Suministros Oficina Express',
      descripcion: 'Material oficina trimestral: papel, toners, material escritorio',
      importe: 1850,
      fecha: '2026-03-18',
      fecha_entrega_estimada: '2026-03-21',
      estado: 'pendiente',
      aprobado_por: 'Administracion - Elena Santos',
      categoria: 'oficina',
      urgencia: 'normal',
      notas: 'Pedido trimestral recurrente'
    },
    {
      id: 'PED-2026-0087',
      proveedor: 'Mobiliario Ergonomico S.A.',
      descripcion: '5 sillas ergonomicas modelo ErgoMax Pro para nuevo equipo',
      importe: 3750,
      fecha: '2026-03-12',
      fecha_entrega_estimada: '2026-03-25',
      estado: 'enviado',
      aprobado_por: 'RRHH - Sofia Martinez',
      categoria: 'oficina',
      urgencia: 'normal',
      notas: 'Incorporaciones previstas para abril'
    },
    {
      id: 'PED-2026-0086',
      proveedor: 'Seguridad Digital Pro',
      descripcion: 'Auditoria de seguridad trimestral + test de penetracion',
      importe: 6500,
      fecha: '2026-03-10',
      fecha_entrega_estimada: '2026-03-28',
      estado: 'en_proceso',
      aprobado_por: 'Director IT - Carlos Mendez',
      categoria: 'tecnologia',
      urgencia: 'alta',
      notas: 'Incluye informe OWASP Top 10 y simulacion de phishing'
    },
    {
      id: 'PED-2026-0085',
      proveedor: 'Formacion Empresarial Plus',
      descripcion: 'Curso certificacion AWS Solutions Architect - 4 empleados',
      importe: 4800,
      fecha: '2026-03-08',
      fecha_entrega_estimada: '2026-04-15',
      estado: 'pendiente',
      aprobado_por: 'Director IT - Carlos Mendez',
      categoria: 'formacion',
      urgencia: 'normal',
      notas: 'Formacion online + examen certificacion incluido'
    },
    {
      id: 'PED-2026-0084',
      proveedor: 'Agencia Creativa Pixel',
      descripcion: 'Produccion 3 videos testimoniales de clientes',
      importe: 5400,
      fecha: '2026-03-05',
      fecha_entrega_estimada: '2026-03-30',
      estado: 'en_proceso',
      aprobado_por: 'Marketing - Maria Lopez',
      categoria: 'marketing',
      urgencia: 'normal',
      notas: 'Rodaje completado. En fase de postproduccion.'
    },
    {
      id: 'PED-2026-0083',
      proveedor: 'Mantenimiento Integral 360',
      descripcion: 'Revision y mantenimiento sistema climatizacion oficina central',
      importe: 1200,
      fecha: '2026-03-03',
      fecha_entrega_estimada: '2026-03-19',
      estado: 'recibido',
      aprobado_por: 'Administracion - Elena Santos',
      categoria: 'mantenimiento',
      urgencia: 'normal',
      notas: 'Mantenimiento preventivo semestral completado'
    },
    {
      id: 'PED-2026-0082',
      proveedor: 'Seguros Generales Peritaje S.L.',
      descripcion: 'Lote 15 peritajes siniestros hogar pendientes zona norte',
      importe: 7500,
      fecha: '2026-03-01',
      fecha_entrega_estimada: '2026-03-22',
      estado: 'en_proceso',
      aprobado_por: 'Dir. Siniestros - Pablo Ruiz',
      categoria: 'operaciones',
      urgencia: 'alta',
      notas: '12 de 15 peritajes completados. 3 pendientes de visita.'
    },
    {
      id: 'PED-2026-0081',
      proveedor: 'Telecomunicaciones Avanza',
      descripcion: 'Upgrade linea fibra oficina central: 600Mbps a 1Gbps simetrico',
      importe: 0,
      fecha: '2026-02-28',
      fecha_entrega_estimada: '2026-03-15',
      estado: 'recibido',
      aprobado_por: 'Director IT - Carlos Mendez',
      categoria: 'tecnologia',
      urgencia: 'normal',
      notas: 'Sin coste adicional por renegociacion de contrato. Instalado OK.'
    },
    {
      id: 'PED-2026-0080',
      proveedor: 'Deloitte Asesores',
      descripcion: 'Informe de compliance DORA (Digital Operational Resilience Act)',
      importe: 8500,
      fecha: '2026-02-25',
      fecha_entrega_estimada: '2026-03-31',
      estado: 'en_proceso',
      aprobado_por: 'CEO - Alberto Garcia',
      categoria: 'legal',
      urgencia: 'alta',
      notas: 'Informe regulatorio obligatorio. Borrador recibido, en revision.'
    }
  ];

  return pedidos;
}

/**
 * Devuelve los gastos mensuales por categoria con comparacion de presupuesto
 * @param {string} [mes='2026-03'] - Mes en formato YYYY-MM
 * @returns {Object} Gastos desglosados por categoria vs presupuesto
 */
function getGastos(mes) {
  const mesConsulta = mes || '2026-03';

  const gastos = {
    periodo: mesConsulta,
    total_gastado: 187450,
    total_presupuestado: 205000,
    diferencia: 17550,
    estado: 'bajo_presupuesto',
    categorias: [
      {
        categoria: 'Personal',
        presupuestado: 95000,
        gastado: 93200,
        diferencia: 1800,
        porcentaje_usado: 98.1,
        estado: 'en_linea',
        subcategorias: [
          { nombre: 'Salarios', importe: 78000 },
          { nombre: 'Seguridad Social', importe: 11700 },
          { nombre: 'Bonus/Variables', importe: 2500 },
          { nombre: 'Dietas y desplazamientos', importe: 1000 }
        ]
      },
      {
        categoria: 'Tecnologia',
        presupuestado: 35000,
        gastado: 32800,
        diferencia: 2200,
        porcentaje_usado: 93.7,
        estado: 'en_linea',
        subcategorias: [
          { nombre: 'Infraestructura cloud', importe: 8450 },
          { nombre: 'Licencias software', importe: 12350 },
          { nombre: 'Telecomunicaciones', importe: 4200 },
          { nombre: 'Hardware/Equipos', importe: 3800 },
          { nombre: 'Seguridad IT', importe: 4000 }
        ]
      },
      {
        categoria: 'Oficina',
        presupuestado: 12000,
        gastado: 10250,
        diferencia: 1750,
        porcentaje_usado: 85.4,
        estado: 'bajo_previsto',
        subcategorias: [
          { nombre: 'Alquiler oficina', importe: 6500 },
          { nombre: 'Suministros (luz, agua, gas)', importe: 1800 },
          { nombre: 'Material oficina', importe: 650 },
          { nombre: 'Limpieza', importe: 1200 },
          { nombre: 'Varios', importe: 100 }
        ]
      },
      {
        categoria: 'Marketing',
        presupuestado: 20000,
        gastado: 18900,
        diferencia: 1100,
        porcentaje_usado: 94.5,
        estado: 'en_linea',
        subcategorias: [
          { nombre: 'Publicidad digital', importe: 13230 },
          { nombre: 'Contenidos y creatividad', importe: 3200 },
          { nombre: 'Eventos y sponsoring', importe: 1500 },
          { nombre: 'Herramientas marketing', importe: 970 }
        ]
      },
      {
        categoria: 'Legal',
        presupuestado: 15000,
        gastado: 14200,
        diferencia: 800,
        porcentaje_usado: 94.7,
        estado: 'en_linea',
        subcategorias: [
          { nombre: 'Asesoria legal', importe: 6000 },
          { nombre: 'Compliance y regulatorio', importe: 5200 },
          { nombre: 'Registro y patentes', importe: 1500 },
          { nombre: 'Litigios', importe: 1500 }
        ]
      },
      {
        categoria: 'Seguros',
        presupuestado: 22000,
        gastado: 14500,
        diferencia: 7500,
        porcentaje_usado: 65.9,
        estado: 'bajo_previsto',
        subcategorias: [
          { nombre: 'Reaseguros', importe: 10500 },
          { nombre: 'RC profesional', importe: 2500 },
          { nombre: 'Seguro oficina', importe: 800 },
          { nombre: 'Cyber seguro', importe: 700 }
        ]
      },
      {
        categoria: 'Viajes',
        presupuestado: 6000,
        gastado: 3600,
        diferencia: 2400,
        porcentaje_usado: 60.0,
        estado: 'bajo_previsto',
        subcategorias: [
          { nombre: 'Transporte', importe: 1800 },
          { nombre: 'Alojamiento', importe: 1200 },
          { nombre: 'Manutención', importe: 600 }
        ]
      }
    ],
    tendencia_trimestral: [
      { mes: 'Enero 2026', gastado: 178900, presupuestado: 205000 },
      { mes: 'Febrero 2026', gastado: 182300, presupuestado: 205000 },
      { mes: 'Marzo 2026', gastado: 187450, presupuestado: 205000 }
    ]
  };

  return gastos;
}

/**
 * Devuelve los contratos de compras activos con fechas de renovacion
 * @returns {Array} Lista de 8 contratos con detalles de renovacion
 */
function getContratosCompras() {
  const contratos = [
    {
      id: 'CTR-001',
      proveedor: 'CloudTech Solutions S.L.',
      descripcion: 'Servicios cloud AWS managed + soporte 24/7',
      importe_anual: 42000,
      fecha_inicio: '2025-10-01',
      fecha_fin: '2026-09-30',
      auto_renovacion: true,
      preaviso_cancelacion_dias: 90,
      estado: 'activo',
      tipo: 'servicios_recurrentes',
      sla_incluido: true,
      satisfaccion: 9.2
    },
    {
      id: 'CTR-002',
      proveedor: 'Mapfre RE (Reaseguros)',
      descripcion: 'Contrato marco de reaseguro proporcional y exceso de perdida',
      importe_anual: 125000,
      fecha_inicio: '2026-01-15',
      fecha_fin: '2027-01-14',
      auto_renovacion: false,
      preaviso_cancelacion_dias: 180,
      estado: 'activo',
      tipo: 'estrategico',
      sla_incluido: true,
      satisfaccion: 9.5
    },
    {
      id: 'CTR-003',
      proveedor: 'Deloitte Asesores',
      descripcion: 'Servicios de auditoria, fiscalidad y compliance',
      importe_anual: 36000,
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-12-31',
      auto_renovacion: true,
      preaviso_cancelacion_dias: 60,
      estado: 'activo',
      tipo: 'servicios_profesionales',
      sla_incluido: false,
      satisfaccion: 9.0
    },
    {
      id: 'CTR-004',
      proveedor: 'Telecomunicaciones Avanza',
      descripcion: 'Fibra 1Gbps + centralita VoIP 25 extensiones',
      importe_anual: 15600,
      fecha_inicio: '2025-07-01',
      fecha_fin: '2026-06-30',
      auto_renovacion: true,
      preaviso_cancelacion_dias: 30,
      estado: 'activo',
      tipo: 'servicios_recurrentes',
      sla_incluido: true,
      satisfaccion: 7.5,
      alerta: 'Vencimiento en 3 meses. Evaluar alternativas.'
    },
    {
      id: 'CTR-005',
      proveedor: 'Mantenimiento Integral 360',
      descripcion: 'Mantenimiento integral oficina (clima, electricidad, fontaneria)',
      importe_anual: 9600,
      fecha_inicio: '2025-06-01',
      fecha_fin: '2026-05-31',
      auto_renovacion: false,
      preaviso_cancelacion_dias: 30,
      estado: 'activo',
      tipo: 'servicios_recurrentes',
      sla_incluido: false,
      satisfaccion: 7.2,
      alerta: 'Vence en 2 meses. Puntuacion baja. Solicitar ofertas alternativas.'
    },
    {
      id: 'CTR-006',
      proveedor: 'Seguros Generales Peritaje S.L.',
      descripcion: 'Servicios de peritaje para siniestros hogar, auto y empresarial',
      importe_anual: 45000,
      fecha_inicio: '2025-10-01',
      fecha_fin: '2026-09-30',
      auto_renovacion: true,
      preaviso_cancelacion_dias: 60,
      estado: 'activo',
      tipo: 'operativo',
      sla_incluido: true,
      satisfaccion: 8.7
    },
    {
      id: 'CTR-007',
      proveedor: 'Limpieza Profesional Madrid',
      descripcion: 'Servicio diario de limpieza oficina central (500m2)',
      importe_anual: 14400,
      fecha_inicio: '2025-09-01',
      fecha_fin: '2026-08-31',
      auto_renovacion: true,
      preaviso_cancelacion_dias: 30,
      estado: 'activo',
      tipo: 'servicios_recurrentes',
      sla_incluido: false,
      satisfaccion: 8.0
    },
    {
      id: 'CTR-008',
      proveedor: 'Agencia Creativa Pixel',
      descripcion: 'Servicios de diseno, branding y produccion audiovisual',
      importe_anual: 22000,
      fecha_inicio: '2025-12-01',
      fecha_fin: '2026-11-30',
      auto_renovacion: true,
      preaviso_cancelacion_dias: 60,
      estado: 'activo',
      tipo: 'servicios_profesionales',
      sla_incluido: false,
      satisfaccion: 8.6
    }
  ];

  return contratos;
}

/**
 * Devuelve las licencias de software gestionadas
 * @returns {Array} Lista de 10 licencias con costes y renovacion
 */
function getLicencias() {
  const licencias = [
    {
      id: 'LIC-001',
      software: 'Microsoft 365 Business Premium',
      proveedor: 'Microsoft',
      coste_mensual: 1650,
      coste_anual: 19800,
      usuarios: 75,
      coste_por_usuario: 22.00,
      fecha_renovacion: '2026-07-01',
      auto_renovacion: true,
      tipo: 'suscripcion',
      incluye: ['Office apps', 'Teams', 'Exchange', 'OneDrive 1TB', 'Intune']
    },
    {
      id: 'LIC-002',
      software: 'Slack Business+',
      proveedor: 'Salesforce',
      coste_mensual: 900,
      coste_anual: 10800,
      usuarios: 75,
      coste_por_usuario: 12.00,
      fecha_renovacion: '2026-09-15',
      auto_renovacion: true,
      tipo: 'suscripcion',
      incluye: ['Mensajeria ilimitada', 'Canales', 'Integraciones', 'SSO']
    },
    {
      id: 'LIC-003',
      software: 'Jira + Confluence Cloud Premium',
      proveedor: 'Atlassian',
      coste_mensual: 580,
      coste_anual: 6960,
      usuarios: 40,
      coste_por_usuario: 14.50,
      fecha_renovacion: '2026-05-01',
      auto_renovacion: true,
      tipo: 'suscripcion',
      incluye: ['Jira Software', 'Confluence', 'Automation', 'Advanced Roadmaps']
    },
    {
      id: 'LIC-004',
      software: 'AWS (Amazon Web Services)',
      proveedor: 'Amazon',
      coste_mensual: 8450,
      coste_anual: 101400,
      usuarios: null,
      coste_por_usuario: null,
      fecha_renovacion: null,
      auto_renovacion: true,
      tipo: 'consumo',
      incluye: ['EC2', 'RDS', 'S3', 'CloudFront', 'Lambda', 'SES'],
      nota: 'Pago por consumo. Sin contrato fijo.'
    },
    {
      id: 'LIC-005',
      software: 'Salesforce Sales Cloud',
      proveedor: 'Salesforce',
      coste_mensual: 2250,
      coste_anual: 27000,
      usuarios: 30,
      coste_por_usuario: 75.00,
      fecha_renovacion: '2026-10-01',
      auto_renovacion: false,
      tipo: 'suscripcion',
      incluye: ['CRM', 'Pipeline', 'Reports', 'Einstein Analytics']
    },
    {
      id: 'LIC-006',
      software: 'HubSpot Marketing Hub Pro',
      proveedor: 'HubSpot',
      coste_mensual: 740,
      coste_anual: 8880,
      usuarios: 10,
      coste_por_usuario: 74.00,
      fecha_renovacion: '2026-08-15',
      auto_renovacion: true,
      tipo: 'suscripcion',
      incluye: ['Email marketing', 'Automation', 'Landing pages', 'Analytics']
    },
    {
      id: 'LIC-007',
      software: 'Figma Organization',
      proveedor: 'Figma',
      coste_mensual: 375,
      coste_anual: 4500,
      usuarios: 15,
      coste_por_usuario: 25.00,
      fecha_renovacion: '2026-06-01',
      auto_renovacion: true,
      tipo: 'suscripcion',
      incluye: ['Editor ilimitado', 'Librerias', 'Branching', 'Dev mode']
    },
    {
      id: 'LIC-008',
      software: 'Datadog Pro',
      proveedor: 'Datadog',
      coste_mensual: 450,
      coste_anual: 5400,
      usuarios: null,
      coste_por_usuario: null,
      fecha_renovacion: '2026-11-01',
      auto_renovacion: true,
      tipo: 'consumo',
      incluye: ['Infrastructure monitoring', 'APM', 'Logs', 'Synthetics'],
      nota: '12 hosts monitorizados'
    },
    {
      id: 'LIC-009',
      software: 'Adobe Creative Cloud for Teams',
      proveedor: 'Adobe',
      coste_mensual: 420,
      coste_anual: 5040,
      usuarios: 6,
      coste_por_usuario: 70.00,
      fecha_renovacion: '2026-04-15',
      auto_renovacion: true,
      tipo: 'suscripcion',
      incluye: ['Photoshop', 'Illustrator', 'Premiere', 'After Effects', '100GB cloud']
    },
    {
      id: 'LIC-010',
      software: 'GitHub Enterprise Cloud',
      proveedor: 'GitHub (Microsoft)',
      coste_mensual: 315,
      coste_anual: 3780,
      usuarios: 15,
      coste_por_usuario: 21.00,
      fecha_renovacion: '2026-07-01',
      auto_renovacion: true,
      tipo: 'suscripcion',
      incluye: ['Repos privados ilimitados', 'Actions', 'Packages', 'Copilot', 'Advanced Security']
    }
  ];

  return licencias;
}

/**
 * Devuelve el ahorro conseguido por auto-negociacion con proveedores
 * @returns {Object} Historial de 12 negociaciones con ahorros obtenidos
 */
function getAhorroNegociacion() {
  const negociaciones = {
    total_ahorro_anual: 47850,
    numero_negociaciones: 12,
    ahorro_medio_porcentaje: 14.3,
    detalle: [
      {
        id: 'NEG-001',
        proveedor: 'CloudTech Solutions S.L.',
        concepto: 'Renegociacion contrato hosting anual',
        precio_anterior: 48000,
        precio_negociado: 42000,
        ahorro: 6000,
        ahorro_porcentaje: 12.5,
        fecha: '2025-09-15',
        metodo: 'Comparativa de mercado + compromiso 2 anos'
      },
      {
        id: 'NEG-002',
        proveedor: 'Telecomunicaciones Avanza',
        concepto: 'Upgrade fibra sin coste adicional',
        precio_anterior: 18000,
        precio_negociado: 15600,
        ahorro: 2400,
        ahorro_porcentaje: 13.3,
        fecha: '2025-06-20',
        metodo: 'Amenaza de cambio a competidor + bundle VoIP'
      },
      {
        id: 'NEG-003',
        proveedor: 'Microsoft',
        concepto: 'Descuento volumen licencias M365',
        precio_anterior: 23400,
        precio_negociado: 19800,
        ahorro: 3600,
        ahorro_porcentaje: 15.4,
        fecha: '2025-06-15',
        metodo: 'Negociacion Enterprise Agreement + 3 anos'
      },
      {
        id: 'NEG-004',
        proveedor: 'Salesforce',
        concepto: 'Reduccion precio por usuario Slack',
        precio_anterior: 13500,
        precio_negociado: 10800,
        ahorro: 2700,
        ahorro_porcentaje: 20.0,
        fecha: '2025-09-01',
        metodo: 'Bundle con Sales Cloud + compromiso anual'
      },
      {
        id: 'NEG-005',
        proveedor: 'Suministros Oficina Express',
        concepto: 'Contrato marco con precios fijos anuales',
        precio_anterior: 7800,
        precio_negociado: 6200,
        ahorro: 1600,
        ahorro_porcentaje: 20.5,
        fecha: '2025-07-10',
        metodo: 'Consolidacion proveedores + pedido minimo trimestral'
      },
      {
        id: 'NEG-006',
        proveedor: 'Mapfre RE',
        concepto: 'Mejora condiciones reaseguro por siniestralidad baja',
        precio_anterior: 140000,
        precio_negociado: 125000,
        ahorro: 15000,
        ahorro_porcentaje: 10.7,
        fecha: '2025-12-20',
        metodo: 'Historial de siniestralidad favorable + multi-ramo'
      },
      {
        id: 'NEG-007',
        proveedor: 'Limpieza Profesional Madrid',
        concepto: 'Inclusion desinfeccion sin sobrecoste',
        precio_anterior: 16800,
        precio_negociado: 14400,
        ahorro: 2400,
        ahorro_porcentaje: 14.3,
        fecha: '2025-08-15',
        metodo: 'Compromiso 2 anos + referencia a otro cliente'
      },
      {
        id: 'NEG-008',
        proveedor: 'Adobe',
        concepto: 'Reduccion licencias a usuarios reales',
        precio_anterior: 7560,
        precio_negociado: 5040,
        ahorro: 2520,
        ahorro_porcentaje: 33.3,
        fecha: '2026-01-10',
        metodo: 'Auditoria de uso real - eliminacion licencias sin usar'
      },
      {
        id: 'NEG-009',
        proveedor: 'Seguridad Digital Pro',
        concepto: 'Pack anual auditorias en lugar de puntuales',
        precio_anterior: 24000,
        precio_negociado: 18000,
        ahorro: 6000,
        ahorro_porcentaje: 25.0,
        fecha: '2025-12-01',
        metodo: 'Contrato anual 4 auditorias vs precio unitario'
      },
      {
        id: 'NEG-010',
        proveedor: 'Seguros Generales Peritaje S.L.',
        concepto: 'Tarifa plana peritajes por volumen',
        precio_anterior: 52000,
        precio_negociado: 45000,
        ahorro: 7000,
        ahorro_porcentaje: 13.5,
        fecha: '2025-09-20',
        metodo: 'Volumen garantizado 200+ peritajes/ano'
      },
      {
        id: 'NEG-011',
        proveedor: 'Formacion Empresarial Plus',
        concepto: 'Tarifa corporativa formacion con minimo anual',
        precio_anterior: 15000,
        precio_negociado: 12000,
        ahorro: 3000,
        ahorro_porcentaje: 20.0,
        fecha: '2025-11-15',
        metodo: 'Compromiso 50 plazas/ano minimo'
      },
      {
        id: 'NEG-012',
        proveedor: 'Mobiliario Ergonomico S.A.',
        concepto: 'Descuento por pedido recurrente trimestral',
        precio_anterior: 10200,
        precio_negociado: 8500,
        ahorro: 1700,
        ahorro_porcentaje: 16.7,
        fecha: '2025-11-01',
        metodo: 'Proveedor preferente + pedidos minimos trimestrales'
      }
    ]
  };

  return negociaciones;
}

/**
 * Devuelve alertas activas del departamento de compras
 * @returns {Array} Alertas sobre contratos, precios y presupuestos
 */
function getAlertasCompras() {
  const alertas = [
    {
      id: 'ALR-001',
      tipo: 'contrato_vencimiento',
      severidad: 'alta',
      titulo: 'Contrato Mantenimiento Integral 360 vence en 73 dias',
      descripcion: 'El contrato CTR-005 con Mantenimiento Integral 360 vence el 31/05/2026. Puntuacion del proveedor (7.2) por debajo del umbral minimo (8.0). Se recomienda solicitar ofertas alternativas.',
      fecha: '2026-03-19',
      accion_requerida: 'Solicitar 3 ofertas alternativas antes del 15/04',
      responsable: 'Departamento Compras',
      estado: 'pendiente'
    },
    {
      id: 'ALR-002',
      tipo: 'contrato_vencimiento',
      severidad: 'media',
      titulo: 'Contrato Telecomunicaciones Avanza vence en 103 dias',
      descripcion: 'El contrato CTR-004 de telecomunicaciones vence el 30/06/2026. Auto-renovable pero conviene evaluar ofertas de fibra del mercado.',
      fecha: '2026-03-19',
      accion_requerida: 'Comparar tarifas con Movistar, Vodafone y Digi antes del 01/05',
      responsable: 'Departamento Compras',
      estado: 'pendiente'
    },
    {
      id: 'ALR-003',
      tipo: 'precio_sobre_mercado',
      severidad: 'media',
      titulo: 'Salesforce Sales Cloud un 18% sobre precio de mercado',
      descripcion: 'El coste por usuario de Salesforce (75 EUR/usuario) esta un 18% por encima de alternativas comparables (HubSpot CRM Enterprise a 62 EUR/usuario, Zoho CRM Plus a 45 EUR/usuario).',
      fecha: '2026-03-15',
      accion_requerida: 'Negociar descuento en renovacion de octubre o evaluar migracion',
      responsable: 'IT + Compras',
      estado: 'en_evaluacion'
    },
    {
      id: 'ALR-004',
      tipo: 'licencia_renovacion',
      severidad: 'media',
      titulo: 'Adobe Creative Cloud se renueva en 27 dias',
      descripcion: 'Renovacion automatica el 15/04/2026. Auditoria muestra que solo 4 de 6 licencias tienen uso activo.',
      fecha: '2026-03-19',
      accion_requerida: 'Reducir a 4 licencias antes de renovacion. Ahorro: 1,680 EUR/ano',
      responsable: 'Departamento Compras',
      estado: 'pendiente'
    },
    {
      id: 'ALR-005',
      tipo: 'presupuesto',
      severidad: 'baja',
      titulo: 'Categoria Viajes al 60% del presupuesto',
      descripcion: 'El gasto en viajes esta significativamente por debajo del presupuesto (60%). Posible reasignacion de 2,400 EUR a Marketing o Tecnologia.',
      fecha: '2026-03-19',
      accion_requerida: 'Proponer reasignacion presupuestaria en reunion mensual',
      responsable: 'Direccion Financiera',
      estado: 'informativo'
    },
    {
      id: 'ALR-006',
      tipo: 'licencia_infrautilizada',
      severidad: 'media',
      titulo: 'Jira: 12 licencias sin actividad en 30 dias',
      descripcion: '12 de 40 usuarios de Jira no han accedido en los ultimos 30 dias. Coste innecesario: 174 EUR/mes.',
      fecha: '2026-03-17',
      accion_requerida: 'Verificar con RRHH si son empleados activos. Desactivar licencias innecesarias.',
      responsable: 'IT + Compras',
      estado: 'en_evaluacion'
    },
    {
      id: 'ALR-007',
      tipo: 'precio_sobre_mercado',
      severidad: 'baja',
      titulo: 'Coste de toners un 12% sobre precio online',
      descripcion: 'Los toners pedidos a Suministros Oficina Express cuestan un 12% mas que los precios disponibles en Amazon Business.',
      fecha: '2026-03-18',
      accion_requerida: 'Renegociar precios de consumibles en proximo pedido trimestral',
      responsable: 'Departamento Compras',
      estado: 'pendiente'
    },
    {
      id: 'ALR-008',
      tipo: 'contrato_vencimiento',
      severidad: 'baja',
      titulo: 'Licencia Atlassian (Jira/Confluence) se renueva en 43 dias',
      descripcion: 'Renovacion el 01/05/2026. Considerar reduccion de usuarios (ver ALR-006) antes de la renovacion.',
      fecha: '2026-03-19',
      accion_requerida: 'Optimizar licencias y solicitar cotizacion con usuarios reducidos',
      responsable: 'Departamento Compras',
      estado: 'pendiente'
    }
  ];

  return alertas;
}

/**
 * Devuelve las estadisticas resumen del departamento de compras
 * @returns {Object} KPIs principales de compras y aprovisionamiento
 */
function getEstadisticas() {
  const estadisticas = {
    gasto_mes: 187450,
    ahorro_mes: 3980,
    ahorro_acumulado_ano: 47850,
    contratos_activos: 8,
    contratos_por_vencer_90d: 2,
    proveedores_activos: 15,
    puntuacion_media_proveedores: 8.58,
    licencias_gestionadas: 10,
    licencias_infrautilizadas: 2,
    coste_licencias_mes: 16130,
    pedidos_activos: 10,
    pedidos_pendientes: 2,
    presupuesto_mensual: 205000,
    porcentaje_ejecutado: 91.4,
    alertas_activas: 8,
    alertas_alta_prioridad: 1,
    negociaciones_exitosas_ano: 12,
    ahorro_medio_negociacion: 14.3,
    proveedores_bajo_umbral: 1,
    proxima_renovacion: { proveedor: 'Adobe Creative Cloud', fecha: '2026-04-15' }
  };

  return estadisticas;
}

// ============================================================================
// Exportaciones
// ============================================================================
module.exports = {
  getProveedoresEmpresa,
  getPedidos,
  getGastos,
  getContratosCompras,
  getLicencias,
  getAhorroNegociacion,
  getAlertasCompras,
  getEstadisticas
};
