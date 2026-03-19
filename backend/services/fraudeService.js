const { dbAll, dbGet } = require('../database/db');

const PESOS = {
  historial_reclamaciones: 0.20,
  coherencia_temporal: 0.15,
  coherencia_geografica: 0.10,
  metadatos_fotos: 0.15,
  red_vinculacion: 0.15,
  valor_reclamacion: 0.10,
  patron_comportamiento: 0.10,
  base_datos_externa: 0.05,
};

const fraudeService = {
  /**
   * Analisis anti-fraude completo de un siniestro
   * Retorna score 0-100 y desglose por dimension
   */
  async analizarSiniestro(siniestroId) {
    const siniestro = await dbGet('SELECT s.*, c.nombre, c.dni, c.poliza FROM siniestros s LEFT JOIN clientes c ON s.cliente_id = c.id WHERE s.id = ?', [siniestroId]);
    if (!siniestro) throw new Error('Siniestro no encontrado');

    const resultados = {};
    const alertas = [];

    // 1. Historial de reclamaciones del cliente
    const historial = await dbAll('SELECT * FROM siniestros WHERE cliente_id = ?', [siniestro.cliente_id]);
    const numReclamaciones = historial.length;
    let scoreHistorial = 0;
    if (numReclamaciones >= 5) { scoreHistorial = 90; alertas.push('ALERTA: 5+ reclamaciones del mismo cliente'); }
    else if (numReclamaciones >= 3) { scoreHistorial = 60; alertas.push('Atencion: 3+ reclamaciones del mismo cliente'); }
    else if (numReclamaciones >= 2) scoreHistorial = 30;
    else scoreHistorial = 5;

    // Frecuencia: reclamaciones en los ultimos 6 meses
    const recientes = historial.filter(s => {
      const diff = (Date.now() - new Date(s.fecha_creacion).getTime()) / (1000 * 60 * 60 * 24);
      return diff < 180;
    });
    if (recientes.length >= 3) { scoreHistorial = Math.min(100, scoreHistorial + 20); alertas.push('Frecuencia alta: 3+ siniestros en 6 meses'); }

    resultados.historial_reclamaciones = { score: scoreHistorial, detalle: `${numReclamaciones} reclamaciones totales, ${recientes.length} en 6 meses` };

    // 2. Coherencia temporal
    let scoreTemporal = 0;
    const fechaCreacion = new Date(siniestro.fecha_creacion);
    const hora = fechaCreacion.getHours();
    const diaSemana = fechaCreacion.getDay();

    if (hora >= 0 && hora <= 5) { scoreTemporal += 25; alertas.push('Siniestro reportado en horario nocturno (00:00-05:00)'); }
    if (diaSemana === 0 || diaSemana === 6) scoreTemporal += 10;

    // Verificar si fue reportado mucho despues del supuesto evento
    const desc = siniestro.descripcion.toLowerCase();
    if (desc.includes('ayer') || desc.includes('hace dias') || desc.includes('la semana pasada')) {
      scoreTemporal += 30;
      alertas.push('Reporte tardio detectado en la descripcion');
    }
    resultados.coherencia_temporal = { score: Math.min(100, scoreTemporal), detalle: `Hora: ${hora}:00, Dia: ${['Dom','Lun','Mar','Mie','Jue','Vie','Sab'][diaSemana]}` };

    // 3. Coherencia geografica
    let scoreGeo = 0;
    if (siniestro.lat && siniestro.lng) {
      // Verificar si la ubicacion es coherente con la direccion del cliente
      const siniestrosZona = await dbAll('SELECT COUNT(*) as c FROM siniestros WHERE zona = ? AND score_fraude > 40', [siniestro.zona]);
      if (siniestrosZona[0]?.c >= 3) { scoreGeo = 40; alertas.push(`Zona con alta incidencia de fraude: ${siniestro.zona}`); }
    }
    // Verificar siniestros en la misma ubicacion exacta
    const mismaUbicacion = await dbAll('SELECT COUNT(*) as c FROM siniestros WHERE direccion = ? AND id != ?', [siniestro.direccion, siniestro.id]);
    if (mismaUbicacion[0]?.c > 0) { scoreGeo += 30; alertas.push('Misma direccion que otro siniestro'); }
    resultados.coherencia_geografica = { score: Math.min(100, scoreGeo), detalle: `Zona: ${siniestro.zona}, Dir: ${siniestro.direccion}` };

    // 4. Metadatos de fotos (simulado - en produccion analizaria EXIF)
    let scoreFotos = 0;
    const docs = await dbAll("SELECT * FROM documentos WHERE siniestro_id = ? AND tipo LIKE '%image%'", [siniestro.id]);
    if (docs.length === 0 && siniestro.tipo !== 'salud') { scoreFotos = 20; alertas.push('No hay fotos adjuntas'); }
    // Simulacion: analisis EXIF detectaria discrepancias de fecha/ubicacion
    resultados.metadatos_fotos = { score: scoreFotos, detalle: `${docs.length} fotos analizadas` };

    // 5. Red de vinculacion
    let scoreRed = 0;
    // Buscar siniestros con misma direccion o telefono de otros clientes
    const vinculados = await dbAll(`SELECT DISTINCT s.cliente_id FROM siniestros s
      JOIN clientes c ON s.cliente_id = c.id
      WHERE s.cliente_id != ? AND (s.direccion = ? OR c.telefono IN (
        SELECT telefono FROM clientes WHERE id = ?
      ))`, [siniestro.cliente_id, siniestro.direccion, siniestro.cliente_id]);

    if (vinculados.length >= 3) { scoreRed = 80; alertas.push(`ALERTA: Vinculado a ${vinculados.length} clientes diferentes`); }
    else if (vinculados.length >= 1) { scoreRed = 30; alertas.push(`Vinculacion detectada con ${vinculados.length} cliente(s)`); }
    resultados.red_vinculacion = { score: scoreRed, detalle: `${vinculados.length} vinculaciones encontradas` };

    // 6. Valor de reclamacion
    let scoreValor = 0;
    const indemnizacionMedia = { coche: 3500, hogar: 5000, salud: 2500, robo: 4000, otro: 3000 };
    if (siniestro.indemnizacion) {
      const media = indemnizacionMedia[siniestro.tipo] || 3000;
      const ratio = siniestro.indemnizacion / media;
      if (ratio > 3) { scoreValor = 70; alertas.push('Indemnizacion 3x superior a la media del tipo'); }
      else if (ratio > 2) { scoreValor = 40; alertas.push('Indemnizacion 2x superior a la media'); }
      else if (ratio > 1.5) scoreValor = 15;
    }
    // Urgencia alta + tipo sospechoso
    if (siniestro.urgencia >= 9 && siniestro.tipo === 'robo') scoreValor += 15;
    resultados.valor_reclamacion = { score: Math.min(100, scoreValor), detalle: `Tipo: ${siniestro.tipo}, Urgencia: ${siniestro.urgencia}` };

    // 7. Patron de comportamiento
    let scorePatron = 0;
    // Palabras clave sospechosas en descripcion
    const palabrasSospechosas = ['sin testigos', 'nadie vio', 'solo', 'madrugada', 'desaparecio', 'no recuerdo', 'total', 'incendio nocturno'];
    for (const p of palabrasSospechosas) {
      if (desc.includes(p)) { scorePatron += 15; alertas.push(`Palabra sospechosa en descripcion: "${p}"`); }
    }
    // Tipo robo es inherentemente mas sospechoso
    if (siniestro.tipo === 'robo') scorePatron += 10;
    resultados.patron_comportamiento = { score: Math.min(100, scorePatron), detalle: `Analisis textual de descripcion` };

    // 8. Base de datos externa (simulado)
    let scoreExterno = 0;
    // En produccion conectaria a TIREA, BDNF, etc.
    resultados.base_datos_externa = { score: scoreExterno, detalle: 'Sin coincidencias en BDNF (simulado)' };

    // Calcular score final ponderado
    let scoreFinal = 0;
    for (const [dim, peso] of Object.entries(PESOS)) {
      scoreFinal += (resultados[dim]?.score || 0) * peso;
    }
    scoreFinal = Math.round(Math.min(100, scoreFinal));

    // Determinar nivel de riesgo
    let nivelRiesgo, recomendacion;
    if (scoreFinal >= 70) {
      nivelRiesgo = 'CRITICO';
      recomendacion = 'Congelar expediente inmediatamente. Asignar investigador de fraude. No proceder con indemnizacion.';
    } else if (scoreFinal >= 50) {
      nivelRiesgo = 'ALTO';
      recomendacion = 'Requiere investigacion adicional antes de proceder. Solicitar documentacion extra.';
    } else if (scoreFinal >= 25) {
      nivelRiesgo = 'MEDIO';
      recomendacion = 'Proceder con cautela. Verificar documentacion de forma exhaustiva.';
    } else {
      nivelRiesgo = 'BAJO';
      recomendacion = 'Procesar normalmente. Sin indicadores significativos de fraude.';
    }

    return {
      siniestro_id: siniestroId,
      expediente: siniestro.expediente,
      cliente: siniestro.nombre,
      score_final: scoreFinal,
      nivel_riesgo: nivelRiesgo,
      recomendacion,
      dimensiones: resultados,
      alertas,
      fecha_analisis: new Date().toISOString(),
    };
  },

  /**
   * Score rapido para asignacion automatica
   */
  calcularScoreRapido(descripcion, tipo, urgencia) {
    let score = 0;
    const desc = (descripcion || '').toLowerCase();

    const indicadores = {
      'robo': 15, 'desaparecido': 20, 'incendio': 10, 'sin testigos': 25,
      'nadie vio': 20, 'total loss': 15, 'siniestro total': 15,
      'madrugada': 10, 'no recuerdo': 15, 'solo': 5,
    };

    for (const [palabra, puntos] of Object.entries(indicadores)) {
      if (desc.includes(palabra)) score += puntos;
    }

    if (tipo === 'robo') score += 10;
    if (urgencia >= 9) score += 5;

    return Math.min(100, Math.max(0, score + Math.floor(Math.random() * 8)));
  },
};

module.exports = fraudeService;
