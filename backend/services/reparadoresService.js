// =============================================================================
// Servicio de Red de Reparadores Conectados
// =============================================================================

// ---------------------------------------------------------------------------
// Base de datos de reparadores (12+)
// ---------------------------------------------------------------------------
const reparadores = [
  { id: 'REP-001', nombre: 'Talleres Hermanos Garcia', tipo: 'taller', telefono: '+34 915 678 901', zona: 'Madrid Centro', valoracion: 4.7, trabajos_completados: 234, tiempo_medio_dias: 3.2, penalizaciones: 0, activo: true, especialidades: ['chapa', 'pintura', 'mecanica'] },
  { id: 'REP-002', nombre: 'AutoFix Madrid Sur', tipo: 'taller', telefono: '+34 916 789 012', zona: 'Madrid Sur', valoracion: 4.3, trabajos_completados: 178, tiempo_medio_dias: 4.1, penalizaciones: 1, activo: true, especialidades: ['mecanica', 'electricidad auto'] },
  { id: 'REP-003', nombre: 'Fontaneria Rapida S.L.', tipo: 'fontanero', telefono: '+34 917 890 123', zona: 'Madrid Norte', valoracion: 4.8, trabajos_completados: 312, tiempo_medio_dias: 1.5, penalizaciones: 0, activo: true, especialidades: ['urgencias', 'instalacion', 'reparacion'] },
  { id: 'REP-004', nombre: 'ElectroServ Instalaciones', tipo: 'electricista', telefono: '+34 918 901 234', zona: 'Madrid Este', valoracion: 4.5, trabajos_completados: 189, tiempo_medio_dias: 2.0, penalizaciones: 0, activo: true, especialidades: ['instalacion', 'reparacion', 'cuadros electricos'] },
  { id: 'REP-005', nombre: 'Cristaleria Martinez e Hijos', tipo: 'cristalero', telefono: '+34 919 012 345', zona: 'Madrid Oeste', valoracion: 4.6, trabajos_completados: 156, tiempo_medio_dias: 1.8, penalizaciones: 0, activo: true, especialidades: ['cristales', 'espejos', 'mamparas'] },
  { id: 'REP-006', nombre: 'Talleres Perez Premium', tipo: 'taller', telefono: '+34 933 123 456', zona: 'Barcelona', valoracion: 4.9, trabajos_completados: 420, tiempo_medio_dias: 2.8, penalizaciones: 0, activo: true, especialidades: ['chapa', 'pintura', 'lunas'] },
  { id: 'REP-007', nombre: 'Fontaneros del Mediterraneo', tipo: 'fontanero', telefono: '+34 963 234 567', zona: 'Valencia', valoracion: 4.2, trabajos_completados: 98, tiempo_medio_dias: 2.3, penalizaciones: 2, activo: true, especialidades: ['urgencias', 'calderas', 'desatascos'] },
  { id: 'REP-008', nombre: 'Cerrajeria 24H Express', tipo: 'cerrajero', telefono: '+34 914 345 678', zona: 'Madrid Centro', valoracion: 4.4, trabajos_completados: 567, tiempo_medio_dias: 0.5, penalizaciones: 1, activo: true, especialidades: ['apertura', 'cambio cerradura', 'blindaje'] },
  { id: 'REP-009', nombre: 'Pinturas y Reformas Lopez', tipo: 'pintor', telefono: '+34 955 456 789', zona: 'Sevilla', valoracion: 4.1, trabajos_completados: 87, tiempo_medio_dias: 5.0, penalizaciones: 0, activo: true, especialidades: ['interior', 'exterior', 'humedades'] },
  { id: 'REP-010', nombre: 'Talleres AutoLux', tipo: 'taller', telefono: '+34 944 567 890', zona: 'Bilbao', valoracion: 4.8, trabajos_completados: 310, tiempo_medio_dias: 3.5, penalizaciones: 0, activo: true, especialidades: ['premium', 'chapa', 'pintura', 'mecanica'] },
  { id: 'REP-011', nombre: 'Desatascos Urgentes BCN', tipo: 'fontanero', telefono: '+34 934 678 901', zona: 'Barcelona', valoracion: 3.9, trabajos_completados: 145, tiempo_medio_dias: 1.0, penalizaciones: 3, activo: true, especialidades: ['desatascos', 'urgencias', 'inspeccion camara'] },
  { id: 'REP-012', nombre: 'Electricidad Industrial Navarro', tipo: 'electricista', telefono: '+34 965 789 012', zona: 'Alicante', valoracion: 4.6, trabajos_completados: 210, tiempo_medio_dias: 2.5, penalizaciones: 0, activo: true, especialidades: ['industrial', 'domotica', 'energia solar'] },
  { id: 'REP-013', nombre: 'CristalMax Express', tipo: 'cristalero', telefono: '+34 916 890 123', zona: 'Madrid Sur', valoracion: 4.3, trabajos_completados: 89, tiempo_medio_dias: 1.2, penalizaciones: 1, activo: true, especialidades: ['lunas vehiculo', 'escaparates', 'cristales hogar'] }
];

// ---------------------------------------------------------------------------
// Casos de reparacion (15+)
// ---------------------------------------------------------------------------
const casosReparacion = [
  // Casos para REP-001 (Talleres Hermanos Garcia)
  { id: 'CAS-R-001', siniestroId: 'SIN-2026-001', reparadorId: 'REP-001', tipo: 'auto', descripcion: 'Reparacion chapa y pintura lateral derecho - Ford Focus', estado: 'en_reparacion', fechaAsignacion: new Date('2026-03-10'), fechaEstimadaFin: new Date('2026-03-20'), presupuesto: null, fotos: ['entrada_lateral.jpg'], notas: ['Pieza de recambio pedida, llega el jueves'], valoracion: null, factura: null },
  { id: 'CAS-R-002', siniestroId: 'SIN-2026-005', reparadorId: 'REP-001', tipo: 'auto', descripcion: 'Sustitucion paragolpes trasero - Seat Leon', estado: 'completado', fechaAsignacion: new Date('2026-02-20'), fechaEstimadaFin: new Date('2026-02-28'), fechaFinReal: new Date('2026-02-27'), presupuesto: { lineas: [{ concepto: 'Paragolpes trasero OEM', cantidad: 1, precio: 320 }, { concepto: 'Mano de obra montaje', cantidad: 3, precio: 45 }, { concepto: 'Pintura y acabado', cantidad: 1, precio: 180 }], total: 635, aprobado: true }, fotos: ['antes_paragolpes.jpg', 'despues_paragolpes.jpg'], notas: ['Trabajo finalizado antes de plazo'], valoracion: { puntuacion: 5, comentario: 'Excelente trabajo, acabado perfecto' }, factura: { numero: 'FAC-2026-0127', fecha: new Date('2026-02-27'), importe: 635, iva: 133.35, total: 768.35, estado: 'pagada' } },
  { id: 'CAS-R-003', siniestroId: 'SIN-2026-012', reparadorId: 'REP-001', tipo: 'auto', descripcion: 'Reparacion puerta conductor abolida - VW Golf', estado: 'pendiente_presupuesto', fechaAsignacion: new Date('2026-03-18'), fechaEstimadaFin: null, presupuesto: null, fotos: ['puerta_golf.jpg'], notas: [], valoracion: null, factura: null },

  // Casos para REP-003 (Fontaneria Rapida)
  { id: 'CAS-R-004', siniestroId: 'SIN-2026-008', reparadorId: 'REP-003', tipo: 'hogar', descripcion: 'Rotura tuberia agua caliente bajo fregadero - Piso en Chamartin', estado: 'completado', fechaAsignacion: new Date('2026-03-05'), fechaEstimadaFin: new Date('2026-03-07'), fechaFinReal: new Date('2026-03-06'), presupuesto: { lineas: [{ concepto: 'Tuberia cobre 22mm (2m)', cantidad: 1, precio: 28 }, { concepto: 'Valvula de corte', cantidad: 2, precio: 15 }, { concepto: 'Mano de obra urgente', cantidad: 2, precio: 55 }], total: 153, aprobado: true }, fotos: ['tuberia_rota.jpg', 'reparacion_final.jpg'], notas: ['Urgencia atendida en menos de 2 horas'], valoracion: { puntuacion: 5, comentario: 'Rapidisimo y muy limpio' }, factura: { numero: 'FAC-2026-0089', fecha: new Date('2026-03-06'), importe: 153, iva: 32.13, total: 185.13, estado: 'pagada' } },
  { id: 'CAS-R-005', siniestroId: 'SIN-2026-015', reparadorId: 'REP-003', tipo: 'hogar', descripcion: 'Fuga en bajante comunitaria - Edificio calle Serrano', estado: 'en_reparacion', fechaAsignacion: new Date('2026-03-14'), fechaEstimadaFin: new Date('2026-03-19'), presupuesto: { lineas: [{ concepto: 'Bajante PVC 110mm (4m)', cantidad: 1, precio: 65 }, { concepto: 'Codos y uniones', cantidad: 6, precio: 8 }, { concepto: 'Mano de obra', cantidad: 5, precio: 50 }, { concepto: 'Desplazamiento y grua', cantidad: 1, precio: 120 }], total: 483, aprobado: true }, fotos: ['bajante_deteriorada.jpg'], notas: ['Necesario acceso por patio interior con elevador'], valoracion: null, factura: null },

  // Casos para REP-004 (ElectroServ)
  { id: 'CAS-R-006', siniestroId: 'SIN-2026-009', reparadorId: 'REP-004', tipo: 'hogar', descripcion: 'Cortocircuito en cuadro electrico - Vivienda unifamiliar Pozuelo', estado: 'completado', fechaAsignacion: new Date('2026-03-02'), fechaEstimadaFin: new Date('2026-03-05'), fechaFinReal: new Date('2026-03-04'), presupuesto: { lineas: [{ concepto: 'Cuadro electrico 40A', cantidad: 1, precio: 185 }, { concepto: 'Diferenciales 30mA', cantidad: 3, precio: 42 }, { concepto: 'Magnetotermicos', cantidad: 8, precio: 18 }, { concepto: 'Mano de obra electricista', cantidad: 4, precio: 48 }], total: 659, aprobado: true }, fotos: ['cuadro_viejo.jpg', 'cuadro_nuevo.jpg'], notas: ['Instalacion antigua sin ITC-BT, actualizada a normativa vigente'], valoracion: { puntuacion: 4, comentario: 'Buen trabajo, tardo un dia mas de lo previsto' }, factura: { numero: 'FAC-2026-0092', fecha: new Date('2026-03-04'), importe: 659, iva: 138.39, total: 797.39, estado: 'pagada' } },

  // Casos para REP-005 (Cristaleria Martinez)
  { id: 'CAS-R-007', siniestroId: 'SIN-2026-011', reparadorId: 'REP-005', tipo: 'hogar', descripcion: 'Sustitucion ventanal salon roto por tormenta - Chalet Majadahonda', estado: 'en_reparacion', fechaAsignacion: new Date('2026-03-15'), fechaEstimadaFin: new Date('2026-03-22'), presupuesto: { lineas: [{ concepto: 'Cristal doble 6+12+6 (2.4x1.8m)', cantidad: 1, precio: 420 }, { concepto: 'Sellado perimetral', cantidad: 1, precio: 85 }, { concepto: 'Mano de obra instalacion', cantidad: 3, precio: 50 }], total: 655, aprobado: true }, fotos: ['ventanal_roto.jpg'], notas: ['Cristal a medida encargado a fabrica'], valoracion: null, factura: null },

  // Casos para REP-006 (Talleres Perez Premium BCN)
  { id: 'CAS-R-008', siniestroId: 'SIN-2026-018', reparadorId: 'REP-006', tipo: 'auto', descripcion: 'Reparacion integral frontal - BMW Serie 3 colision', estado: 'en_reparacion', fechaAsignacion: new Date('2026-03-12'), fechaEstimadaFin: new Date('2026-03-25'), presupuesto: { lineas: [{ concepto: 'Capot BMW OEM', cantidad: 1, precio: 890 }, { concepto: 'Faro LED izquierdo', cantidad: 1, precio: 650 }, { concepto: 'Paragolpes delantero', cantidad: 1, precio: 520 }, { concepto: 'Radiador', cantidad: 1, precio: 380 }, { concepto: 'Mano de obra chapa', cantidad: 12, precio: 55 }, { concepto: 'Pintura metalizada', cantidad: 1, precio: 480 }], total: 3580, aprobado: true }, fotos: ['bmw_frontal_danado.jpg', 'progreso_chapa.jpg'], notas: ['Vehiculo premium, piezas originales BMW'], valoracion: null, factura: null },
  { id: 'CAS-R-009', siniestroId: 'SIN-2026-020', reparadorId: 'REP-006', tipo: 'auto', descripcion: 'Sustitucion luna trasera - Mercedes Clase C', estado: 'completado', fechaAsignacion: new Date('2026-03-08'), fechaEstimadaFin: new Date('2026-03-11'), fechaFinReal: new Date('2026-03-10'), presupuesto: { lineas: [{ concepto: 'Luna trasera Mercedes OEM', cantidad: 1, precio: 380 }, { concepto: 'Junta estanqueidad', cantidad: 1, precio: 45 }, { concepto: 'Mano de obra', cantidad: 2, precio: 55 }], total: 535, aprobado: true }, fotos: ['luna_rota.jpg', 'luna_nueva.jpg'], notas: [], valoracion: { puntuacion: 5, comentario: 'Perfecto como siempre' }, factura: { numero: 'FAC-2026-0105', fecha: new Date('2026-03-10'), importe: 535, iva: 112.35, total: 647.35, estado: 'pagada' } },

  // Casos para REP-008 (Cerrajeria 24H)
  { id: 'CAS-R-010', siniestroId: 'SIN-2026-022', reparadorId: 'REP-008', tipo: 'hogar', descripcion: 'Cambio cerradura tras robo - Piso en Lavapies', estado: 'completado', fechaAsignacion: new Date('2026-03-16'), fechaEstimadaFin: new Date('2026-03-16'), fechaFinReal: new Date('2026-03-16'), presupuesto: { lineas: [{ concepto: 'Cerradura de seguridad 5 puntos', cantidad: 1, precio: 220 }, { concepto: 'Escudo anti-bumping', cantidad: 1, precio: 85 }, { concepto: 'Mano de obra urgente', cantidad: 1, precio: 90 }], total: 395, aprobado: true }, fotos: ['cerradura_forzada.jpg', 'cerradura_nueva.jpg'], notas: ['Servicio urgente nocturno'], valoracion: { puntuacion: 4, comentario: 'Rapido pero algo caro el servicio nocturno' }, factura: { numero: 'FAC-2026-0118', fecha: new Date('2026-03-16'), importe: 395, iva: 82.95, total: 477.95, estado: 'pendiente' } },

  // Casos para REP-007 (Fontaneros Mediterraneo)
  { id: 'CAS-R-011', siniestroId: 'SIN-2026-025', reparadorId: 'REP-007', tipo: 'hogar', descripcion: 'Reparacion caldera gas con fuga - Piso en Ruzafa, Valencia', estado: 'pendiente_presupuesto', fechaAsignacion: new Date('2026-03-17'), fechaEstimadaFin: null, presupuesto: null, fotos: ['caldera_fuga.jpg'], notas: ['Posible sustitucion completa de caldera'], valoracion: null, factura: null },
  { id: 'CAS-R-012', siniestroId: 'SIN-2026-026', reparadorId: 'REP-007', tipo: 'hogar', descripcion: 'Inundacion por rotura de grifo - Apartamento playa Malvarrosa', estado: 'en_reparacion', fechaAsignacion: new Date('2026-03-13'), fechaEstimadaFin: new Date('2026-03-18'), presupuesto: { lineas: [{ concepto: 'Griferia monomando', cantidad: 1, precio: 95 }, { concepto: 'Flexos conexion', cantidad: 2, precio: 12 }, { concepto: 'Mano de obra', cantidad: 2, precio: 45 }], total: 214, aprobado: true }, fotos: ['inundacion_cocina.jpg'], notas: ['Danos por agua en suelo laminado - derivar a perito'], valoracion: null, factura: null },

  // Casos para REP-009 (Pinturas Lopez)
  { id: 'CAS-R-013', siniestroId: 'SIN-2026-028', reparadorId: 'REP-009', tipo: 'hogar', descripcion: 'Reparacion y pintura techo con humedades - Piso en Triana, Sevilla', estado: 'en_reparacion', fechaAsignacion: new Date('2026-03-10'), fechaEstimadaFin: new Date('2026-03-21'), presupuesto: { lineas: [{ concepto: 'Tratamiento antihumedad', cantidad: 15, precio: 12 }, { concepto: 'Pintura plastica blanca (m2)', cantidad: 25, precio: 8 }, { concepto: 'Reparacion de gotelé', cantidad: 10, precio: 15 }, { concepto: 'Mano de obra oficial pintor', cantidad: 4, precio: 42 }], total: 698, aprobado: true }, fotos: ['techo_humedad.jpg', 'progreso_tratamiento.jpg'], notas: ['Primera capa de impermeabilizante aplicada'], valoracion: null, factura: null },

  // Casos para REP-010 (Talleres AutoLux Bilbao)
  { id: 'CAS-R-014', siniestroId: 'SIN-2026-030', reparadorId: 'REP-010', tipo: 'auto', descripcion: 'Reparacion lateral izquierdo completo - Audi A4 Avant', estado: 'pendiente_presupuesto', fechaAsignacion: new Date('2026-03-19'), fechaEstimadaFin: null, presupuesto: null, fotos: ['audi_lateral.jpg'], notas: ['Pendiente valoracion por perito'], valoracion: null, factura: null },

  // Casos para REP-002 (AutoFix Madrid Sur)
  { id: 'CAS-R-015', siniestroId: 'SIN-2026-032', reparadorId: 'REP-002', tipo: 'auto', descripcion: 'Reparacion sistema de frenos completo - Renault Clio', estado: 'completado', fechaAsignacion: new Date('2026-03-01'), fechaEstimadaFin: new Date('2026-03-05'), fechaFinReal: new Date('2026-03-06'), presupuesto: { lineas: [{ concepto: 'Pastillas freno delanteras', cantidad: 1, precio: 65 }, { concepto: 'Discos freno delanteros', cantidad: 2, precio: 48 }, { concepto: 'Pastillas freno traseras', cantidad: 1, precio: 45 }, { concepto: 'Liquido de frenos DOT4', cantidad: 1, precio: 18 }, { concepto: 'Mano de obra mecanico', cantidad: 3, precio: 42 }], total: 302, aprobado: true }, fotos: ['frenos_desgastados.jpg', 'frenos_nuevos.jpg'], notas: ['Entrega con un dia de retraso por falta de stock de discos'], valoracion: { puntuacion: 3, comentario: 'Buen trabajo pero entrega fuera de plazo' }, factura: { numero: 'FAC-2026-0078', fecha: new Date('2026-03-06'), importe: 302, iva: 63.42, total: 365.42, estado: 'pagada' } },

  // Caso para REP-012 (Electricidad Navarro Alicante)
  { id: 'CAS-R-016', siniestroId: 'SIN-2026-035', reparadorId: 'REP-012', tipo: 'hogar', descripcion: 'Reparacion instalacion electrica tras sobretension - Chalet en San Juan', estado: 'en_reparacion', fechaAsignacion: new Date('2026-03-16'), fechaEstimadaFin: new Date('2026-03-23'), presupuesto: { lineas: [{ concepto: 'Protector sobretensiones trifasico', cantidad: 1, precio: 340 }, { concepto: 'Cable libre halogenos 6mm (50m)', cantidad: 1, precio: 95 }, { concepto: 'Mecanismos electricos', cantidad: 12, precio: 8 }, { concepto: 'Mano de obra electricista', cantidad: 6, precio: 48 }], total: 819, aprobado: true }, fotos: ['instalacion_danada.jpg'], notas: ['Sobretension por rayo, revision completa de la instalacion'], valoracion: null, factura: null }
];

// Historial de penalizaciones
const penalizaciones = [
  { id: 'PEN-001', reparadorId: 'REP-002', fecha: new Date('2026-01-15'), motivo: 'Retraso reiterado en entregas (3 casos consecutivos)', gravedad: 'leve', importe_penalizacion: 150 },
  { id: 'PEN-002', reparadorId: 'REP-007', fecha: new Date('2025-11-20'), motivo: 'Reclamacion del cliente por trabajo defectuoso', gravedad: 'media', importe_penalizacion: 300 },
  { id: 'PEN-003', reparadorId: 'REP-007', fecha: new Date('2026-02-10'), motivo: 'No presentarse a cita programada sin aviso', gravedad: 'grave', importe_penalizacion: 500 },
  { id: 'PEN-004', reparadorId: 'REP-008', fecha: new Date('2026-01-28'), motivo: 'Facturacion con importes no acordados', gravedad: 'media', importe_penalizacion: 200 },
  { id: 'PEN-005', reparadorId: 'REP-011', fecha: new Date('2025-10-05'), motivo: 'Uso de materiales de calidad inferior a lo presupuestado', gravedad: 'grave', importe_penalizacion: 450 },
  { id: 'PEN-006', reparadorId: 'REP-011', fecha: new Date('2026-01-12'), motivo: 'Retraso superior a 48h sin comunicacion', gravedad: 'media', importe_penalizacion: 250 },
  { id: 'PEN-007', reparadorId: 'REP-011', fecha: new Date('2026-03-01'), motivo: 'Trabajo incompleto marcado como finalizado', gravedad: 'grave', importe_penalizacion: 500 },
  { id: 'PEN-008', reparadorId: 'REP-013', fecha: new Date('2026-02-20'), motivo: 'Cristal instalado con medidas incorrectas', gravedad: 'leve', importe_penalizacion: 100 }
];

// ---------------------------------------------------------------------------
// getReparadores - Lista todos los reparadores
// ---------------------------------------------------------------------------
function getReparadores(filtros = {}) {
  let resultado = [...reparadores];

  if (filtros.tipo) {
    resultado = resultado.filter(r => r.tipo === filtros.tipo);
  }
  if (filtros.zona) {
    resultado = resultado.filter(r => r.zona.toLowerCase().includes(filtros.zona.toLowerCase()));
  }
  if (filtros.valoracionMinima) {
    resultado = resultado.filter(r => r.valoracion >= filtros.valoracionMinima);
  }
  if (filtros.activo !== undefined) {
    resultado = resultado.filter(r => r.activo === filtros.activo);
  }

  return { ok: true, total: resultado.length, reparadores: resultado };
}

// ---------------------------------------------------------------------------
// getCasosAsignados - Casos asignados a un reparador
// ---------------------------------------------------------------------------
function getCasosAsignados(reparadorId) {
  const reparador = reparadores.find(r => r.id === reparadorId);
  if (!reparador) {
    return { ok: false, error: `Reparador no encontrado: ${reparadorId}` };
  }

  const casos = casosReparacion.filter(c => c.reparadorId === reparadorId);
  const activos = casos.filter(c => c.estado !== 'completado' && c.estado !== 'cancelado');
  const completados = casos.filter(c => c.estado === 'completado');

  return {
    ok: true,
    reparador: { id: reparador.id, nombre: reparador.nombre, tipo: reparador.tipo },
    total_casos: casos.length,
    activos: activos.length,
    completados: completados.length,
    casos: casos.map(c => ({
      id: c.id,
      siniestroId: c.siniestroId,
      tipo: c.tipo,
      descripcion: c.descripcion,
      estado: c.estado,
      fechaAsignacion: c.fechaAsignacion,
      fechaEstimadaFin: c.fechaEstimadaFin,
      fechaFinReal: c.fechaFinReal || null,
      tiene_presupuesto: !!c.presupuesto,
      importe_presupuesto: c.presupuesto ? c.presupuesto.total : null,
      valoracion: c.valoracion ? c.valoracion.puntuacion : null
    }))
  };
}

// ---------------------------------------------------------------------------
// actualizarEstado - Actualizar estado de una reparacion
// ---------------------------------------------------------------------------
function actualizarEstado(casoId, estado, fotos, notas) {
  const caso = casosReparacion.find(c => c.id === casoId);
  if (!caso) {
    return { ok: false, error: `Caso no encontrado: ${casoId}` };
  }

  const estadosValidos = ['pendiente_presupuesto', 'presupuesto_enviado', 'aprobado', 'en_reparacion', 'completado', 'cancelado'];
  if (!estadosValidos.includes(estado)) {
    return { ok: false, error: `Estado no valido. Estados permitidos: ${estadosValidos.join(', ')}` };
  }

  const estadoAnterior = caso.estado;
  caso.estado = estado;

  if (fotos && Array.isArray(fotos)) {
    caso.fotos = [...caso.fotos, ...fotos];
  }

  if (notas) {
    caso.notas.push(typeof notas === 'string' ? notas : JSON.stringify(notas));
  }

  // Si se completa, registrar fecha y generar factura automatica
  let factura = null;
  if (estado === 'completado') {
    caso.fechaFinReal = new Date();

    if (caso.presupuesto && !caso.factura) {
      factura = generarFactura(caso);
      caso.factura = factura;
    }

    // Actualizar estadisticas del reparador
    const reparador = reparadores.find(r => r.id === caso.reparadorId);
    if (reparador) {
      reparador.trabajos_completados++;
      const diasTrabajo = (caso.fechaFinReal - caso.fechaAsignacion) / (1000 * 60 * 60 * 24);
      reparador.tiempo_medio_dias = Math.round(((reparador.tiempo_medio_dias * (reparador.trabajos_completados - 1) + diasTrabajo) / reparador.trabajos_completados) * 10) / 10;
    }
  }

  return {
    ok: true,
    mensaje: `Estado actualizado de '${estadoAnterior}' a '${estado}'`,
    caso: {
      id: caso.id,
      estado: caso.estado,
      fechaFinReal: caso.fechaFinReal || null,
      fotos_totales: caso.fotos.length,
      notas_totales: caso.notas.length
    },
    factura_generada: factura ? { numero: factura.numero, total: factura.total } : null
  };
}

// ---------------------------------------------------------------------------
// subirPresupuesto - Enviar presupuesto con lineas de detalle
// ---------------------------------------------------------------------------
function subirPresupuesto(casoId, lineas) {
  const caso = casosReparacion.find(c => c.id === casoId);
  if (!caso) {
    return { ok: false, error: `Caso no encontrado: ${casoId}` };
  }

  if (caso.presupuesto && caso.presupuesto.aprobado) {
    return { ok: false, error: 'Este caso ya tiene un presupuesto aprobado' };
  }

  if (!Array.isArray(lineas) || lineas.length === 0) {
    return { ok: false, error: 'Debe incluir al menos una linea de presupuesto' };
  }

  // Validar lineas
  const lineasValidadas = [];
  let total = 0;
  const errores = [];

  lineas.forEach((linea, idx) => {
    if (!linea.concepto) {
      errores.push(`Linea ${idx + 1}: falta concepto`);
      return;
    }
    const cantidad = Number(linea.cantidad) || 1;
    const precio = Number(linea.precio) || 0;

    if (precio <= 0) {
      errores.push(`Linea ${idx + 1}: precio debe ser mayor que 0`);
      return;
    }

    const subtotal = cantidad * precio;
    total += subtotal;
    lineasValidadas.push({
      concepto: linea.concepto,
      cantidad,
      precio,
      subtotal
    });
  });

  if (errores.length > 0) {
    return { ok: false, errores };
  }

  caso.presupuesto = {
    lineas: lineasValidadas,
    total: Math.round(total * 100) / 100,
    iva: Math.round(total * 0.21 * 100) / 100,
    total_con_iva: Math.round(total * 1.21 * 100) / 100,
    fecha: new Date(),
    aprobado: false
  };

  caso.estado = 'presupuesto_enviado';

  // Auto-aprobar presupuestos menores de 1000 EUR
  if (total < 1000) {
    caso.presupuesto.aprobado = true;
    caso.estado = 'aprobado';
    caso.notas.push('Presupuesto auto-aprobado (importe < 1.000 EUR)');
  }

  return {
    ok: true,
    mensaje: total < 1000 ? 'Presupuesto enviado y auto-aprobado' : 'Presupuesto enviado, pendiente de aprobacion',
    presupuesto: {
      lineas: lineasValidadas.length,
      subtotal: caso.presupuesto.total,
      iva: caso.presupuesto.iva,
      total: caso.presupuesto.total_con_iva,
      aprobado: caso.presupuesto.aprobado
    }
  };
}

// ---------------------------------------------------------------------------
// getHistorialTrabajos - Historial de trabajos con pagos
// ---------------------------------------------------------------------------
function getHistorialTrabajos(reparadorId) {
  const reparador = reparadores.find(r => r.id === reparadorId);
  if (!reparador) {
    return { ok: false, error: `Reparador no encontrado: ${reparadorId}` };
  }

  const trabajos = casosReparacion
    .filter(c => c.reparadorId === reparadorId)
    .map(c => ({
      id: c.id,
      siniestroId: c.siniestroId,
      descripcion: c.descripcion,
      tipo: c.tipo,
      estado: c.estado,
      fechaAsignacion: c.fechaAsignacion,
      fechaFinReal: c.fechaFinReal || null,
      dias_empleados: c.fechaFinReal ? Math.round((c.fechaFinReal - c.fechaAsignacion) / (1000 * 60 * 60 * 24) * 10) / 10 : null,
      importe: c.presupuesto ? c.presupuesto.total : null,
      factura: c.factura ? {
        numero: c.factura.numero,
        total: c.factura.total,
        estado: c.factura.estado
      } : null,
      valoracion: c.valoracion
    }));

  const totalFacturado = trabajos.reduce((sum, t) => sum + (t.factura ? t.factura.total : 0), 0);
  const totalPendienteCobro = trabajos.filter(t => t.factura && t.factura.estado === 'pendiente').reduce((sum, t) => sum + t.factura.total, 0);
  const totalCobrado = totalFacturado - totalPendienteCobro;

  const penalizacionesRep = penalizaciones.filter(p => p.reparadorId === reparadorId);
  const totalPenalizaciones = penalizacionesRep.reduce((sum, p) => sum + p.importe_penalizacion, 0);

  return {
    ok: true,
    reparador: {
      id: reparador.id,
      nombre: reparador.nombre,
      tipo: reparador.tipo,
      valoracion: reparador.valoracion,
      trabajos_completados: reparador.trabajos_completados,
      tiempo_medio_dias: reparador.tiempo_medio_dias
    },
    resumen_financiero: {
      total_facturado: Math.round(totalFacturado * 100) / 100,
      total_cobrado: Math.round(totalCobrado * 100) / 100,
      pendiente_cobro: Math.round(totalPendienteCobro * 100) / 100,
      total_penalizaciones: totalPenalizaciones,
      balance_neto: Math.round((totalCobrado - totalPenalizaciones) * 100) / 100
    },
    trabajos,
    penalizaciones: penalizacionesRep
  };
}

// ---------------------------------------------------------------------------
// valorarTrabajo - Valorar trabajo completado
// ---------------------------------------------------------------------------
function valorarTrabajo(casoId, puntuacion, comentario) {
  const caso = casosReparacion.find(c => c.id === casoId);
  if (!caso) {
    return { ok: false, error: `Caso no encontrado: ${casoId}` };
  }

  if (caso.estado !== 'completado') {
    return { ok: false, error: 'Solo se pueden valorar trabajos completados' };
  }

  if (caso.valoracion) {
    return { ok: false, error: 'Este trabajo ya ha sido valorado' };
  }

  if (puntuacion < 1 || puntuacion > 5) {
    return { ok: false, error: 'La puntuacion debe estar entre 1 y 5' };
  }

  caso.valoracion = {
    puntuacion,
    comentario: comentario || '',
    fecha: new Date()
  };

  // Recalcular valoracion media del reparador
  const reparador = reparadores.find(r => r.id === caso.reparadorId);
  if (reparador) {
    const casosValorados = casosReparacion.filter(c => c.reparadorId === reparador.id && c.valoracion);
    const mediaValoracion = casosValorados.reduce((sum, c) => sum + c.valoracion.puntuacion, 0) / casosValorados.length;
    reparador.valoracion = Math.round(mediaValoracion * 10) / 10;
  }

  return {
    ok: true,
    mensaje: `Trabajo ${casoId} valorado con ${puntuacion}/5`,
    valoracion: caso.valoracion,
    nueva_valoracion_reparador: reparador ? reparador.valoracion : null
  };
}

// ---------------------------------------------------------------------------
// aplicarPenalizacion - Penalizar reparador por mal servicio
// ---------------------------------------------------------------------------
function aplicarPenalizacion(reparadorId, motivo) {
  const reparador = reparadores.find(r => r.id === reparadorId);
  if (!reparador) {
    return { ok: false, error: `Reparador no encontrado: ${reparadorId}` };
  }

  if (!motivo || motivo.trim() === '') {
    return { ok: false, error: 'Debe indicar el motivo de la penalizacion' };
  }

  // Determinar gravedad segun historial
  const penalizacionesPrevias = penalizaciones.filter(p => p.reparadorId === reparadorId).length;
  let gravedad = 'leve';
  let importe = 150;

  if (penalizacionesPrevias >= 2) {
    gravedad = 'grave';
    importe = 500;
  } else if (penalizacionesPrevias >= 1) {
    gravedad = 'media';
    importe = 300;
  }

  const nuevaPenalizacion = {
    id: `PEN-${String(penalizaciones.length + 1).padStart(3, '0')}`,
    reparadorId,
    fecha: new Date(),
    motivo,
    gravedad,
    importe_penalizacion: importe
  };

  penalizaciones.push(nuevaPenalizacion);
  reparador.penalizaciones++;

  // Desactivar si tiene 4+ penalizaciones
  let desactivado = false;
  if (reparador.penalizaciones >= 4) {
    reparador.activo = false;
    desactivado = true;
  }

  return {
    ok: true,
    mensaje: `Penalizacion aplicada a ${reparador.nombre}`,
    penalizacion: nuevaPenalizacion,
    total_penalizaciones: reparador.penalizaciones,
    reparador_desactivado: desactivado,
    aviso: desactivado ? `ATENCION: ${reparador.nombre} ha sido desactivado por acumular ${reparador.penalizaciones} penalizaciones` : null
  };
}

// ---------------------------------------------------------------------------
// Funciones auxiliares
// ---------------------------------------------------------------------------
function generarFactura(caso) {
  const numero = `FAC-2026-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;
  const importe = caso.presupuesto.total;
  const iva = Math.round(importe * 0.21 * 100) / 100;

  return {
    numero,
    fecha: new Date(),
    casoId: caso.id,
    reparadorId: caso.reparadorId,
    concepto: caso.descripcion,
    lineas: caso.presupuesto.lineas,
    importe,
    iva,
    total: Math.round((importe + iva) * 100) / 100,
    estado: 'pendiente'
  };
}

module.exports = {
  getReparadores,
  getCasosAsignados,
  actualizarEstado,
  subirPresupuesto,
  getHistorialTrabajos,
  valorarTrabajo,
  aplicarPenalizacion
};
