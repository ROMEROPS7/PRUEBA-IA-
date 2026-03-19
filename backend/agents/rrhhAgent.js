/**
 * Agente Autonomo de RRHH
 * Gestion integral de recursos humanos: nominas, evaluaciones, vacaciones, formacion
 */

const empleados = [
  { id: 1, nombre: 'Maria Garcia Lopez', puesto: 'Directora de Siniestros', departamento: 'Siniestros', salario_bruto: 52000, fecha_alta: '2018-03-15', rendimiento_score: 9.1, vacaciones_disponibles: 22, vacaciones_usadas: 8, formaciones_completadas: ['RGPD', 'Anti-fraude', 'Liderazgo'], estado: 'activo' },
  { id: 2, nombre: 'Carlos Rodriguez Fernandez', puesto: 'Perito Senior', departamento: 'Siniestros', salario_bruto: 38000, fecha_alta: '2019-07-01', rendimiento_score: 7.8, vacaciones_disponibles: 22, vacaciones_usadas: 12, formaciones_completadas: ['RGPD', 'Anti-fraude'], estado: 'activo' },
  { id: 3, nombre: 'Ana Martinez Ruiz', puesto: 'Tramitadora de Siniestros', departamento: 'Siniestros', salario_bruto: 28000, fecha_alta: '2021-01-10', rendimiento_score: 8.2, vacaciones_disponibles: 22, vacaciones_usadas: 5, formaciones_completadas: ['RGPD', 'Atencion cliente'], estado: 'activo' },
  { id: 4, nombre: 'Javier Lopez Sanchez', puesto: 'CTO', departamento: 'Tecnologia', salario_bruto: 58000, fecha_alta: '2017-11-20', rendimiento_score: 9.4, vacaciones_disponibles: 22, vacaciones_usadas: 10, formaciones_completadas: ['RGPD', 'IA aplicada', 'Liderazgo'], estado: 'activo' },
  { id: 5, nombre: 'Laura Fernandez Diaz', puesto: 'Desarrolladora Full Stack', departamento: 'Tecnologia', salario_bruto: 42000, fecha_alta: '2020-04-15', rendimiento_score: 8.7, vacaciones_disponibles: 22, vacaciones_usadas: 14, formaciones_completadas: ['RGPD', 'IA aplicada', 'Excel avanzado'], estado: 'vacaciones' },
  { id: 6, nombre: 'Pedro Sanchez Gomez', puesto: 'Administrador de Sistemas', departamento: 'Tecnologia', salario_bruto: 36000, fecha_alta: '2021-09-01', rendimiento_score: 7.5, vacaciones_disponibles: 22, vacaciones_usadas: 6, formaciones_completadas: ['RGPD'], estado: 'activo' },
  { id: 7, nombre: 'Isabel Torres Navarro', puesto: 'Directora Comercial', departamento: 'Comercial', salario_bruto: 50000, fecha_alta: '2018-06-01', rendimiento_score: 8.9, vacaciones_disponibles: 22, vacaciones_usadas: 11, formaciones_completadas: ['RGPD', 'Atencion cliente', 'Liderazgo', 'Ingles B2'], estado: 'activo' },
  { id: 8, nombre: 'Miguel Angel Ruiz Moreno', puesto: 'Comercial Senior', departamento: 'Comercial', salario_bruto: 32000, fecha_alta: '2019-02-14', rendimiento_score: 7.2, vacaciones_disponibles: 22, vacaciones_usadas: 18, formaciones_completadas: ['RGPD', 'Atencion cliente'], estado: 'activo' },
  { id: 9, nombre: 'Carmen Diaz Herrero', puesto: 'Comercial Junior', departamento: 'Comercial', salario_bruto: 24000, fecha_alta: '2023-05-02', rendimiento_score: 6.8, vacaciones_disponibles: 22, vacaciones_usadas: 3, formaciones_completadas: ['RGPD'], estado: 'activo' },
  { id: 10, nombre: 'Fernando Moreno Gil', puesto: 'Director Legal', departamento: 'Legal', salario_bruto: 55000, fecha_alta: '2017-04-10', rendimiento_score: 9.0, vacaciones_disponibles: 22, vacaciones_usadas: 9, formaciones_completadas: ['RGPD', 'Anti-fraude', 'Liderazgo', 'Ingles B2'], estado: 'activo' },
  { id: 11, nombre: 'Sofia Navarro Perez', puesto: 'Abogada', departamento: 'Legal', salario_bruto: 40000, fecha_alta: '2020-10-01', rendimiento_score: 8.5, vacaciones_disponibles: 22, vacaciones_usadas: 7, formaciones_completadas: ['RGPD', 'Anti-fraude'], estado: 'activo' },
  { id: 12, nombre: 'Raul Herrero Blanco', puesto: 'Paralegal', departamento: 'Legal', salario_bruto: 26000, fecha_alta: '2022-03-15', rendimiento_score: 7.0, vacaciones_disponibles: 22, vacaciones_usadas: 4, formaciones_completadas: ['RGPD'], estado: 'activo' },
  { id: 13, nombre: 'Elena Gil Martin', puesto: 'Directora Financiera', departamento: 'Administracion', salario_bruto: 54000, fecha_alta: '2018-01-08', rendimiento_score: 9.2, vacaciones_disponibles: 22, vacaciones_usadas: 13, formaciones_completadas: ['RGPD', 'Excel avanzado', 'Liderazgo'], estado: 'activo' },
  { id: 14, nombre: 'Antonio Perez Romero', puesto: 'Contable', departamento: 'Administracion', salario_bruto: 30000, fecha_alta: '2020-06-20', rendimiento_score: 7.9, vacaciones_disponibles: 22, vacaciones_usadas: 16, formaciones_completadas: ['RGPD', 'Excel avanzado'], estado: 'baja' },
  { id: 15, nombre: 'Lucia Blanco Castro', puesto: 'Auxiliar Administrativo', departamento: 'Administracion', salario_bruto: 22000, fecha_alta: '2023-09-01', rendimiento_score: 7.3, vacaciones_disponibles: 22, vacaciones_usadas: 2, formaciones_completadas: ['RGPD', 'Primeros auxilios'], estado: 'activo' },
];

const formaciones = [
  { id: 'RGPD', nombre: 'Proteccion de Datos (RGPD)', duracion_horas: 8, obligatoria: true, fecha_limite: '2026-06-30' },
  { id: 'Anti-fraude', nombre: 'Prevencion del Fraude en Seguros', duracion_horas: 12, obligatoria: true, fecha_limite: '2026-09-30' },
  { id: 'Atencion cliente', nombre: 'Excelencia en Atencion al Cliente', duracion_horas: 6, obligatoria: false, fecha_limite: null },
  { id: 'Excel avanzado', nombre: 'Excel Avanzado y Power BI', duracion_horas: 16, obligatoria: false, fecha_limite: null },
  { id: 'IA aplicada', nombre: 'Inteligencia Artificial Aplicada a Seguros', duracion_horas: 20, obligatoria: false, fecha_limite: null },
  { id: 'Liderazgo', nombre: 'Programa de Liderazgo y Gestion de Equipos', duracion_horas: 24, obligatoria: false, fecha_limite: null },
  { id: 'Primeros auxilios', nombre: 'Primeros Auxilios y PRL', duracion_horas: 10, obligatoria: true, fecha_limite: '2026-12-31' },
  { id: 'Ingles B2', nombre: 'Ingles Profesional Nivel B2', duracion_horas: 60, obligatoria: false, fecha_limite: null },
];

const evaluaciones = [
  { empleado_id: 1, nombre: 'Maria Garcia Lopez', departamento: 'Siniestros', score: 9.1, comentario: 'Liderazgo excepcional. Ha reducido el tiempo medio de resolucion de siniestros en un 18%. Muy valorada por el equipo.', objetivos_cumplidos: 95, recomendacion: 'Promocion a Subdirectora General' },
  { empleado_id: 2, nombre: 'Carlos Rodriguez Fernandez', departamento: 'Siniestros', score: 7.8, comentario: 'Buen perito con amplia experiencia. Necesita mejorar en documentacion digital. Puntual y fiable.', objetivos_cumplidos: 78, recomendacion: 'Formacion en herramientas digitales' },
  { empleado_id: 3, nombre: 'Ana Martinez Ruiz', departamento: 'Siniestros', score: 8.2, comentario: 'Gran capacidad de tramitacion, se adapta bien a los cambios. Destaca en trato al cliente.', objetivos_cumplidos: 84, recomendacion: 'Mentorizacion para ascenso a perito junior' },
  { empleado_id: 4, nombre: 'Javier Lopez Sanchez', departamento: 'Tecnologia', score: 9.4, comentario: 'Vision estrategica excelente. Ha liderado la transformacion digital con exito. Referente tecnico.', objetivos_cumplidos: 97, recomendacion: 'Bonus por objetivos estrategicos' },
  { empleado_id: 5, nombre: 'Laura Fernandez Diaz', departamento: 'Tecnologia', score: 8.7, comentario: 'Desarrolladora muy competente. Entrega con calidad y a tiempo. Proactiva en proponer mejoras.', objetivos_cumplidos: 89, recomendacion: 'Ascenso a Lead Developer' },
  { empleado_id: 6, nombre: 'Pedro Sanchez Gomez', departamento: 'Tecnologia', score: 7.5, comentario: 'Buen rendimiento en mantenimiento de sistemas. Necesita mas proactividad en automatizacion.', objetivos_cumplidos: 72, recomendacion: 'Formacion en cloud y DevOps' },
  { empleado_id: 7, nombre: 'Isabel Torres Navarro', departamento: 'Comercial', score: 8.9, comentario: 'Ha superado objetivos de captacion en un 12%. Excelente gestion de grandes cuentas.', objetivos_cumplidos: 92, recomendacion: 'Ampliacion de equipo comercial bajo su direccion' },
  { empleado_id: 8, nombre: 'Miguel Angel Ruiz Moreno', departamento: 'Comercial', score: 7.2, comentario: 'Cumple con los objetivos minimos. Buena relacion con clientes existentes pero baja captacion nueva.', objetivos_cumplidos: 68, recomendacion: 'Plan de mejora en captacion con seguimiento mensual' },
  { empleado_id: 9, nombre: 'Carmen Diaz Herrero', departamento: 'Comercial', score: 6.8, comentario: 'En periodo de aprendizaje. Muestra entusiasmo pero necesita consolidar conocimiento de productos.', objetivos_cumplidos: 60, recomendacion: 'Asignar mentor senior, formacion intensiva en productos' },
  { empleado_id: 10, nombre: 'Fernando Moreno Gil', departamento: 'Legal', score: 9.0, comentario: 'Gestion impecable del departamento legal. Ha logrado reducir costes judiciales un 22%.', objetivos_cumplidos: 93, recomendacion: 'Incluir en comite de direccion' },
  { empleado_id: 11, nombre: 'Sofia Navarro Perez', departamento: 'Legal', score: 8.5, comentario: 'Excelente en litigios. Ha ganado 4 de 5 juicios este ano. Muy analitica y rigurosa.', objetivos_cumplidos: 86, recomendacion: 'Especializacion en derecho digital y ciberriesgos' },
  { empleado_id: 12, nombre: 'Raul Herrero Blanco', departamento: 'Legal', score: 7.0, comentario: 'Cumple correctamente con las tareas asignadas. Podria tomar mas iniciativa en investigacion.', objetivos_cumplidos: 70, recomendacion: 'Formacion juridica avanzada' },
  { empleado_id: 13, nombre: 'Elena Gil Martin', departamento: 'Administracion', score: 9.2, comentario: 'Control financiero excelente. Ha implementado nuevo sistema de reporting que ahorra 15h/mes.', objetivos_cumplidos: 96, recomendacion: 'Bonus por eficiencia operativa' },
  { empleado_id: 14, nombre: 'Antonio Perez Romero', departamento: 'Administracion', score: 7.9, comentario: 'Contable fiable y meticuloso. Actualmente de baja, se espera reincorporacion pronta.', objetivos_cumplidos: 80, recomendacion: 'Plan de reincorporacion gradual' },
  { empleado_id: 15, nombre: 'Lucia Blanco Castro', departamento: 'Administracion', score: 7.3, comentario: 'Buena actitud y ganas de aprender. Maneja bien las tareas rutinarias. Potencial de crecimiento.', objetivos_cumplidos: 74, recomendacion: 'Ampliar responsabilidades progresivamente' },
];

// Vacaciones programadas (mes 1-12, dias del mes)
const vacacionesProgramadas = [
  { empleado_id: 1, periodos: [{ mes: 7, dias: [15,16,17,18,19,20,21,22,23,24,25] }, { mes: 12, dias: [23,24,26,27,28,29,30,31] }] },
  { empleado_id: 2, periodos: [{ mes: 6, dias: [1,2,3,4,5,8,9,10,11,12] }, { mes: 8, dias: [3,4,5,6,7] }] },
  { empleado_id: 3, periodos: [{ mes: 8, dias: [1,2,3,4,5,8,9,10,11,12] }] },
  { empleado_id: 4, periodos: [{ mes: 4, dias: [7,8,9,10,11] }, { mes: 8, dias: [11,12,13,14,15,18,19,20,21,22] }] },
  { empleado_id: 5, periodos: [{ mes: 3, dias: [17,18,19,20,21,24,25,26,27,28] }, { mes: 7, dias: [1,2,3,4] }] },
  { empleado_id: 6, periodos: [{ mes: 9, dias: [1,2,3,4,5,8,9,10,11,12] }] },
  { empleado_id: 7, periodos: [{ mes: 7, dias: [21,22,23,24,25,28,29,30,31] }, { mes: 12, dias: [23,24] }] },
  { empleado_id: 8, periodos: [{ mes: 5, dias: [5,6,7,8,9,12,13,14,15,16] }, { mes: 8, dias: [4,5,6,7,8,11,12,13,14,15,18,19,20,21,22] }] },
  { empleado_id: 9, periodos: [{ mes: 9, dias: [15,16,17] }] },
  { empleado_id: 10, periodos: [{ mes: 6, dias: [16,17,18,19,20,23,24,25,26,27] }] },
  { empleado_id: 11, periodos: [{ mes: 7, dias: [7,8,9,10,11,14,15,16,17,18] }] },
  { empleado_id: 12, periodos: [{ mes: 8, dias: [18,19,20,21,22] }] },
  { empleado_id: 13, periodos: [{ mes: 7, dias: [14,15,16,17,18,21,22,23,24,25,28,29,30,31] }] },
  { empleado_id: 14, periodos: [] }, // De baja
  { empleado_id: 15, periodos: [{ mes: 12, dias: [23,24,26,27] }] },
];

/**
 * Calcula IRPF aproximado segun tramos espanoles 2026
 */
function calcularIRPF(salarioBrutoAnual) {
  let cuota = 0;
  const tramos = [
    { hasta: 12450, tipo: 0.19 },
    { hasta: 20200, tipo: 0.24 },
    { hasta: 35200, tipo: 0.30 },
    { hasta: 60000, tipo: 0.37 },
    { hasta: Infinity, tipo: 0.45 },
  ];
  let base = salarioBrutoAnual;
  let anterior = 0;
  for (const tramo of tramos) {
    if (base <= 0) break;
    const tramo_base = Math.min(base, tramo.hasta - anterior);
    cuota += tramo_base * tramo.tipo;
    base -= tramo_base;
    anterior = tramo.hasta;
  }
  const tipoEfectivo = cuota / salarioBrutoAnual;
  return { cuota_anual: Math.round(cuota * 100) / 100, tipo_efectivo: Math.round(tipoEfectivo * 10000) / 10000 };
}

/**
 * Calcula nominas mensuales para todos los empleados
 */
function getNominas(mes) {
  const mesNum = mes || new Date().getMonth() + 1;
  const mesNombre = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][mesNum - 1];
  const pagas = 14; // 12 meses + 2 pagas extra

  const nominas = empleados.filter(e => e.estado !== 'baja').map(emp => {
    const bruto_mensual = Math.round((emp.salario_bruto / pagas) * 100) / 100;
    const irpfData = calcularIRPF(emp.salario_bruto);
    const irpf_mensual = Math.round((irpfData.cuota_anual / 12) * 100) / 100;
    const ss_empleado = Math.round(bruto_mensual * 0.0635 * 100) / 100; // 6.35% contingencias comunes + desempleo + FP
    const ss_empresa = Math.round(bruto_mensual * 0.3010 * 100) / 100; // ~30.1% coste empresa SS
    const neto = Math.round((bruto_mensual - irpf_mensual - ss_empleado) * 100) / 100;

    // Extras en junio y diciembre
    const esPagaExtra = (mesNum === 6 || mesNum === 12);
    const paga_extra = esPagaExtra ? bruto_mensual : 0;

    return {
      empleado_id: emp.id,
      empleado: emp.nombre,
      puesto: emp.puesto,
      departamento: emp.departamento,
      mes: mesNombre,
      salario_bruto: bruto_mensual,
      irpf: irpf_mensual,
      irpf_porcentaje: `${(irpfData.tipo_efectivo * 100).toFixed(1)}%`,
      ss_empleado,
      ss_empresa,
      neto,
      paga_extra,
      neto_total: Math.round((neto + paga_extra) * 100) / 100,
    };
  });

  const totalBruto = nominas.reduce((s, n) => s + n.salario_bruto, 0);
  const totalNeto = nominas.reduce((s, n) => s + n.neto_total, 0);
  const totalCosteEmpresa = nominas.reduce((s, n) => s + n.salario_bruto + n.ss_empresa, 0);

  return {
    mes: mesNombre,
    anyo: 2026,
    nominas,
    resumen: {
      total_empleados_pagados: nominas.length,
      total_bruto: Math.round(totalBruto * 100) / 100,
      total_neto: Math.round(totalNeto * 100) / 100,
      total_coste_empresa: Math.round(totalCosteEmpresa * 100) / 100,
      total_ss_empresa: Math.round(nominas.reduce((s, n) => s + n.ss_empresa, 0) * 100) / 100,
      total_irpf: Math.round(nominas.reduce((s, n) => s + n.irpf, 0) * 100) / 100,
    },
  };
}

/**
 * Evaluaciones de rendimiento de todos los empleados
 */
function getEvaluaciones() {
  const porDepartamento = {};
  evaluaciones.forEach(ev => {
    if (!porDepartamento[ev.departamento]) porDepartamento[ev.departamento] = [];
    porDepartamento[ev.departamento].push(ev);
  });

  const resumenDepartamento = Object.entries(porDepartamento).map(([dept, evals]) => ({
    departamento: dept,
    media_score: Math.round((evals.reduce((s, e) => s + e.score, 0) / evals.length) * 10) / 10,
    empleados: evals.length,
    mejor_rendimiento: evals.sort((a, b) => b.score - a.score)[0].nombre,
  }));

  return {
    periodo: 'Q1 2026',
    evaluaciones,
    resumen_departamento: resumenDepartamento,
    media_global: Math.round((evaluaciones.reduce((s, e) => s + e.score, 0) / evaluaciones.length) * 10) / 10,
    empleados_destacados: evaluaciones.filter(e => e.score >= 9.0).map(e => e.nombre),
    empleados_plan_mejora: evaluaciones.filter(e => e.score < 7.0).map(e => ({ nombre: e.nombre, score: e.score, recomendacion: e.recomendacion })),
  };
}

/**
 * Calendario de vacaciones para un mes dado
 */
function getVacaciones(mes) {
  const mesNum = mes || new Date().getMonth() + 1;
  const mesNombre = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][mesNum - 1];

  const calendario = [];
  const conflictos = [];

  vacacionesProgramadas.forEach(vac => {
    const emp = empleados.find(e => e.id === vac.empleado_id);
    vac.periodos.forEach(p => {
      if (p.mes === mesNum) {
        calendario.push({
          empleado_id: emp.id,
          empleado: emp.nombre,
          departamento: emp.departamento,
          dias: p.dias,
          dias_totales: p.dias.length,
        });
      }
    });
  });

  // Detectar conflictos: mas de 2 personas del mismo departamento de vacaciones el mismo dia
  const departamentos = [...new Set(empleados.map(e => e.departamento))];
  departamentos.forEach(dept => {
    const vacsDept = calendario.filter(c => c.departamento === dept);
    if (vacsDept.length < 2) return;
    const diasMap = {};
    vacsDept.forEach(v => {
      v.dias.forEach(d => {
        if (!diasMap[d]) diasMap[d] = [];
        diasMap[d].push(v.empleado);
      });
    });
    Object.entries(diasMap).forEach(([dia, personas]) => {
      if (personas.length > 2) {
        conflictos.push({
          departamento: dept,
          dia: parseInt(dia),
          personas,
          alerta: `Mas de 2 personas de ${dept} de vacaciones el dia ${dia} de ${mesNombre}`,
        });
      }
    });
  });

  const resumenEmpleados = empleados.map(emp => ({
    empleado: emp.nombre,
    vacaciones_disponibles: emp.vacaciones_disponibles,
    vacaciones_usadas: emp.vacaciones_usadas,
    vacaciones_pendientes: emp.vacaciones_disponibles - emp.vacaciones_usadas,
  }));

  return {
    mes: mesNombre,
    anyo: 2026,
    calendario,
    conflictos,
    hay_conflictos: conflictos.length > 0,
    resumen_empleados: resumenEmpleados,
    total_dias_vacaciones_mes: calendario.reduce((s, c) => s + c.dias_totales, 0),
  };
}

/**
 * Formaciones asignadas y completadas
 */
function getFormaciones() {
  const estadoFormaciones = empleados.map(emp => {
    const completadas = emp.formaciones_completadas;
    const pendientes = formaciones.filter(f => !completadas.includes(f.id));
    const obligatoriasPendientes = pendientes.filter(f => f.obligatoria);
    return {
      empleado_id: emp.id,
      empleado: emp.nombre,
      departamento: emp.departamento,
      completadas: completadas.map(fc => {
        const f = formaciones.find(x => x.id === fc);
        return f ? { id: f.id, nombre: f.nombre, duracion_horas: f.duracion_horas } : null;
      }).filter(Boolean),
      pendientes: pendientes.map(f => ({ id: f.id, nombre: f.nombre, obligatoria: f.obligatoria, fecha_limite: f.fecha_limite })),
      obligatorias_pendientes: obligatoriasPendientes.length,
      total_horas_formacion: completadas.reduce((s, fc) => {
        const f = formaciones.find(x => x.id === fc);
        return s + (f ? f.duracion_horas : 0);
      }, 0),
    };
  });

  const totalCompletadas = estadoFormaciones.reduce((s, e) => s + e.completadas.length, 0);
  const totalPosibles = empleados.length * formaciones.length;

  return {
    catalogo: formaciones,
    estado_por_empleado: estadoFormaciones,
    resumen: {
      total_formaciones_catalogo: formaciones.length,
      completadas_total: totalCompletadas,
      posibles_total: totalPosibles,
      porcentaje_completado: Math.round((totalCompletadas / totalPosibles) * 1000) / 10,
      empleados_con_obligatorias_pendientes: estadoFormaciones.filter(e => e.obligatorias_pendientes > 0).map(e => ({
        empleado: e.empleado,
        pendientes: e.pendientes.filter(p => p.obligatoria).map(p => p.nombre),
      })),
      horas_formacion_total: estadoFormaciones.reduce((s, e) => s + e.total_horas_formacion, 0),
    },
  };
}

/**
 * Detecta necesidades de RRHH automaticamente
 */
function detectarNecesidades() {
  const alertas = [];

  // Picos de carga: departamentos con personal de baja o vacaciones
  const deptActivos = {};
  const deptTotal = {};
  empleados.forEach(emp => {
    if (!deptTotal[emp.departamento]) deptTotal[emp.departamento] = 0;
    if (!deptActivos[emp.departamento]) deptActivos[emp.departamento] = 0;
    deptTotal[emp.departamento]++;
    if (emp.estado === 'activo') deptActivos[emp.departamento]++;
  });
  Object.entries(deptTotal).forEach(([dept, total]) => {
    const activos = deptActivos[dept] || 0;
    const ratio = activos / total;
    if (ratio < 0.7) {
      alertas.push({
        tipo: 'pico_carga',
        severidad: 'alta',
        departamento: dept,
        mensaje: `${dept}: solo ${activos} de ${total} empleados activos (${Math.round(ratio * 100)}%). Riesgo de sobrecarga.`,
        accion_recomendada: 'Redistribuir tareas o contratar temporal',
      });
    }
  });

  // Brechas formativas: obligatorias pendientes
  const formData = getFormaciones();
  formData.resumen.empleados_con_obligatorias_pendientes.forEach(emp => {
    alertas.push({
      tipo: 'formacion_obligatoria',
      severidad: 'media',
      empleado: emp.empleado,
      mensaje: `${emp.empleado} tiene formaciones obligatorias pendientes: ${emp.pendientes.join(', ')}`,
      accion_recomendada: 'Programar formacion antes de la fecha limite',
    });
  });

  // Vacaciones sin cobertura proximos 3 meses
  const mesActual = new Date().getMonth() + 1;
  for (let m = mesActual; m <= Math.min(mesActual + 2, 12); m++) {
    const vacData = getVacaciones(m);
    if (vacData.conflictos.length > 0) {
      vacData.conflictos.forEach(c => {
        alertas.push({
          tipo: 'conflicto_vacaciones',
          severidad: 'alta',
          departamento: c.departamento,
          mensaje: c.alerta,
          accion_recomendada: 'Renegociar fechas de vacaciones con los empleados afectados',
        });
      });
    }
  }

  // Bajo rendimiento
  evaluaciones.filter(e => e.score < 7.0).forEach(ev => {
    alertas.push({
      tipo: 'bajo_rendimiento',
      severidad: 'media',
      empleado: ev.nombre,
      mensaje: `${ev.nombre} tiene un score de ${ev.score}/10. Por debajo del umbral minimo.`,
      accion_recomendada: ev.recomendacion,
    });
  });

  // Vacaciones acumuladas
  empleados.filter(e => e.estado === 'activo' && (e.vacaciones_disponibles - e.vacaciones_usadas) > 15).forEach(emp => {
    alertas.push({
      tipo: 'vacaciones_acumuladas',
      severidad: 'baja',
      empleado: emp.nombre,
      mensaje: `${emp.nombre} tiene ${emp.vacaciones_disponibles - emp.vacaciones_usadas} dias de vacaciones pendientes.`,
      accion_recomendada: 'Planificar vacaciones antes de fin de ano',
    });
  });

  return {
    fecha_analisis: new Date().toISOString().split('T')[0],
    total_alertas: alertas.length,
    alertas_por_severidad: {
      alta: alertas.filter(a => a.severidad === 'alta').length,
      media: alertas.filter(a => a.severidad === 'media').length,
      baja: alertas.filter(a => a.severidad === 'baja').length,
    },
    alertas,
  };
}

/**
 * Organigrama de la empresa
 */
function getOrganigrama() {
  return {
    empresa: 'SegurosCloud S.A.',
    ceo: 'Director General (vacante - en seleccion)',
    departamentos: [
      {
        nombre: 'Siniestros',
        responsable: 'Maria Garcia Lopez',
        equipo: empleados.filter(e => e.departamento === 'Siniestros').map(e => ({ nombre: e.nombre, puesto: e.puesto, estado: e.estado })),
        total: empleados.filter(e => e.departamento === 'Siniestros').length,
      },
      {
        nombre: 'Tecnologia',
        responsable: 'Javier Lopez Sanchez',
        equipo: empleados.filter(e => e.departamento === 'Tecnologia').map(e => ({ nombre: e.nombre, puesto: e.puesto, estado: e.estado })),
        total: empleados.filter(e => e.departamento === 'Tecnologia').length,
      },
      {
        nombre: 'Comercial',
        responsable: 'Isabel Torres Navarro',
        equipo: empleados.filter(e => e.departamento === 'Comercial').map(e => ({ nombre: e.nombre, puesto: e.puesto, estado: e.estado })),
        total: empleados.filter(e => e.departamento === 'Comercial').length,
      },
      {
        nombre: 'Legal',
        responsable: 'Fernando Moreno Gil',
        equipo: empleados.filter(e => e.departamento === 'Legal').map(e => ({ nombre: e.nombre, puesto: e.puesto, estado: e.estado })),
        total: empleados.filter(e => e.departamento === 'Legal').length,
      },
      {
        nombre: 'Administracion',
        responsable: 'Elena Gil Martin',
        equipo: empleados.filter(e => e.departamento === 'Administracion').map(e => ({ nombre: e.nombre, puesto: e.puesto, estado: e.estado })),
        total: empleados.filter(e => e.departamento === 'Administracion').length,
      },
    ],
    total_empleados: empleados.length,
  };
}

/**
 * Estadisticas globales de RRHH
 */
function getEstadisticas() {
  const activos = empleados.filter(e => e.estado === 'activo');
  const nominasData = getNominas();
  const totalVacacionesPendientes = empleados.reduce((s, e) => s + (e.vacaciones_disponibles - e.vacaciones_usadas), 0);
  const formData = getFormaciones();

  return {
    total_empleados: empleados.length,
    empleados_activos: activos.length,
    empleados_baja: empleados.filter(e => e.estado === 'baja').length,
    empleados_vacaciones: empleados.filter(e => e.estado === 'vacaciones').length,
    coste_mensual: nominasData.resumen.total_coste_empresa,
    coste_anual_estimado: Math.round(nominasData.resumen.total_coste_empresa * 14 * 100) / 100,
    salario_medio: Math.round((empleados.reduce((s, e) => s + e.salario_bruto, 0) / empleados.length) * 100) / 100,
    rendimiento_medio: Math.round((empleados.reduce((s, e) => s + e.rendimiento_score, 0) / empleados.length) * 10) / 10,
    vacaciones_pendientes_total: totalVacacionesPendientes,
    vacaciones_pendientes_media: Math.round((totalVacacionesPendientes / empleados.length) * 10) / 10,
    formacion_completada_pct: formData.resumen.porcentaje_completado,
    antiguedad_media_anios: Math.round((empleados.reduce((s, e) => {
      const diff = new Date() - new Date(e.fecha_alta);
      return s + diff / (1000 * 60 * 60 * 24 * 365.25);
    }, 0) / empleados.length) * 10) / 10,
    distribucion_departamentos: Object.entries(
      empleados.reduce((acc, e) => { acc[e.departamento] = (acc[e.departamento] || 0) + 1; return acc; }, {})
    ).map(([dept, count]) => ({ departamento: dept, empleados: count })),
  };
}

/**
 * Analisis de coste vs productividad por empleado
 */
function getCosteVsProductividad() {
  const pagas = 14;
  const analisis = empleados.map(emp => {
    const costeMensual = Math.round(((emp.salario_bruto / pagas) * 1.301) * 100) / 100; // bruto + SS empresa
    const costeAnual = Math.round(emp.salario_bruto * 1.301 * 100) / 100;
    const productividad = emp.rendimiento_score;
    const ratio = Math.round((productividad / (costeAnual / 10000)) * 100) / 100; // score por cada 10k de coste

    return {
      empleado_id: emp.id,
      empleado: emp.nombre,
      departamento: emp.departamento,
      puesto: emp.puesto,
      coste_mensual: costeMensual,
      coste_anual: costeAnual,
      rendimiento: productividad,
      ratio_productividad_coste: ratio,
      clasificacion: ratio > 1.5 ? 'Alta rentabilidad' : ratio > 1.0 ? 'Rentabilidad media' : 'Bajo rendimiento relativo',
    };
  });

  analisis.sort((a, b) => b.ratio_productividad_coste - a.ratio_productividad_coste);

  return {
    analisis,
    mejor_ratio: analisis[0],
    peor_ratio: analisis[analisis.length - 1],
    coste_total_anual: Math.round(analisis.reduce((s, a) => s + a.coste_anual, 0) * 100) / 100,
    rendimiento_medio: Math.round((analisis.reduce((s, a) => s + a.rendimiento, 0) / analisis.length) * 10) / 10,
    ratio_medio: Math.round((analisis.reduce((s, a) => s + a.ratio_productividad_coste, 0) / analisis.length) * 100) / 100,
  };
}

module.exports = {
  getNominas,
  getEvaluaciones,
  getVacaciones,
  getFormaciones,
  detectarNecesidades,
  getOrganigrama,
  getEstadisticas,
  getCosteVsProductividad,
  empleados,
};
