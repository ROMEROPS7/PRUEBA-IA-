// =============================================================================
// WikiService - Sistema de base de conocimiento interno tipo Obsidian
// Persistencia real en SQLite via dbRun/dbAll/dbGet
// =============================================================================

const { dbRun, dbAll, dbGet } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// Categorias validas del wiki
const CATEGORIAS = [
  'procedimientos',
  'normativa',
  'formacion',
  'casos_resueltos',
  'faq',
  'productos',
  'proveedores',
  'tecnologia',
  'condicionado'
];

// =============================================================================
// INICIALIZACION: Crear tablas al cargar el modulo
// =============================================================================
(async () => {
  try {
    await dbRun(`CREATE TABLE IF NOT EXISTS wiki_notas (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      contenido TEXT NOT NULL,
      categoria TEXT NOT NULL,
      tags TEXT,
      autor TEXT,
      creado_en TEXT DEFAULT (datetime('now')),
      actualizado_en TEXT DEFAULT (datetime('now')),
      visitas INTEGER DEFAULT 0,
      archivada INTEGER DEFAULT 0
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS wiki_links (
      id TEXT PRIMARY KEY,
      nota_origen TEXT NOT NULL,
      nota_destino TEXT NOT NULL,
      tipo TEXT DEFAULT 'referencia',
      creado_en TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(nota_origen) REFERENCES wiki_notas(id),
      FOREIGN KEY(nota_destino) REFERENCES wiki_notas(id)
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS wiki_historial (
      id TEXT PRIMARY KEY,
      nota_id TEXT NOT NULL,
      contenido_anterior TEXT,
      contenido_nuevo TEXT,
      autor TEXT,
      fecha TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(nota_id) REFERENCES wiki_notas(id)
    )`);

    await dbRun('CREATE INDEX IF NOT EXISTS idx_wiki_categoria ON wiki_notas(categoria)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_wiki_links_origen ON wiki_links(nota_origen)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_wiki_links_destino ON wiki_links(nota_destino)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_wiki_archivada ON wiki_notas(archivada)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_wiki_historial_nota ON wiki_historial(nota_id)');

    console.log('Wiki: tablas e indices creados correctamente');

    // Seed initial content
    await seedWiki();
  } catch (err) {
    console.error('Wiki: error inicializando tablas:', err.message);
  }
})();

// =============================================================================
// UTILIDADES INTERNAS
// =============================================================================

/**
 * Extrae referencias [[titulo]] del contenido markdown
 * Retorna array de titulos referenciados
 */
function extraerLinks(contenido) {
  const regex = /\[\[([^\]]+)\]\]/g;
  const links = [];
  let match;
  while ((match = regex.exec(contenido)) !== null) {
    links.push(match[1].trim());
  }
  return [...new Set(links)]; // eliminar duplicados
}

/**
 * Crea registros wiki_links para una nota a partir de su contenido.
 * Primero elimina links existentes de esa nota, luego crea los nuevos.
 */
async function sincronizarLinks(notaId, contenido) {
  // Eliminar links salientes existentes
  await dbRun('DELETE FROM wiki_links WHERE nota_origen = ?', [notaId]);

  const titulosRef = extraerLinks(contenido);
  if (titulosRef.length === 0) return;

  for (const titulo of titulosRef) {
    // Buscar nota destino por titulo (case-insensitive)
    const destino = await dbGet(
      'SELECT id FROM wiki_notas WHERE LOWER(titulo) = LOWER(?) AND archivada = 0',
      [titulo]
    );
    if (destino) {
      await dbRun(
        'INSERT INTO wiki_links (id, nota_origen, nota_destino, tipo) VALUES (?, ?, ?, ?)',
        [uuidv4(), notaId, destino.id, 'referencia']
      );
    }
  }
}

// =============================================================================
// FUNCIONES PRINCIPALES
// =============================================================================

/**
 * Crea una nueva nota en el wiki.
 * Parsea contenido en busca de [[links]] y crea las relaciones.
 */
async function crearNota(datos) {
  const { titulo, contenido, categoria, tags, autor } = datos;

  if (!titulo || !contenido || !categoria) {
    throw new Error('Titulo, contenido y categoria son obligatorios');
  }
  if (!CATEGORIAS.includes(categoria)) {
    throw new Error(`Categoria invalida. Opciones: ${CATEGORIAS.join(', ')}`);
  }

  const id = uuidv4();
  const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || '');
  const autorStr = autor || 'sistema';

  await dbRun(
    `INSERT INTO wiki_notas (id, titulo, contenido, categoria, tags, autor)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, titulo, contenido, categoria, tagsStr, autorStr]
  );

  // Sincronizar links internos
  await sincronizarLinks(id, contenido);

  // Tambien re-sincronizar notas existentes que puedan referenciar esta nueva nota
  const notasExistentes = await dbAll(
    'SELECT id, contenido FROM wiki_notas WHERE id != ? AND archivada = 0 AND contenido LIKE ?',
    [id, `%[[${titulo}]]%`]
  );
  for (const nota of notasExistentes) {
    await sincronizarLinks(nota.id, nota.contenido);
  }

  const notaCreada = await dbGet('SELECT * FROM wiki_notas WHERE id = ?', [id]);
  return notaCreada;
}

/**
 * Obtiene una nota por ID, incrementa visitas,
 * y retorna la nota junto con sus notas enlazadas (entrantes y salientes).
 */
async function obtenerNota(id) {
  const nota = await dbGet(
    'SELECT * FROM wiki_notas WHERE id = ? AND archivada = 0',
    [id]
  );
  if (!nota) return null;

  // Incrementar visitas
  await dbRun('UPDATE wiki_notas SET visitas = visitas + 1 WHERE id = ?', [id]);
  nota.visitas += 1;

  // Links salientes: notas que esta nota referencia
  const linksSalientes = await dbAll(
    `SELECT wl.tipo, wn.id, wn.titulo, wn.categoria
     FROM wiki_links wl
     JOIN wiki_notas wn ON wn.id = wl.nota_destino
     WHERE wl.nota_origen = ? AND wn.archivada = 0`,
    [id]
  );

  // Links entrantes: notas que referencian a esta nota
  const linksEntrantes = await dbAll(
    `SELECT wl.tipo, wn.id, wn.titulo, wn.categoria
     FROM wiki_links wl
     JOIN wiki_notas wn ON wn.id = wl.nota_origen
     WHERE wl.nota_destino = ? AND wn.archivada = 0`,
    [id]
  );

  return {
    ...nota,
    tags: nota.tags ? nota.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    links_salientes: linksSalientes,
    links_entrantes: linksEntrantes,
    total_enlaces: linksSalientes.length + linksEntrantes.length
  };
}

/**
 * Actualiza una nota existente. Guarda version anterior en historial.
 * Re-parsea links y actualiza wiki_links.
 */
async function actualizarNota(id, datos) {
  const notaActual = await dbGet(
    'SELECT * FROM wiki_notas WHERE id = ? AND archivada = 0',
    [id]
  );
  if (!notaActual) {
    throw new Error('Nota no encontrada');
  }

  const { titulo, contenido, categoria, tags, autor } = datos;

  // Guardar version anterior en historial
  await dbRun(
    `INSERT INTO wiki_historial (id, nota_id, contenido_anterior, contenido_nuevo, autor)
     VALUES (?, ?, ?, ?, ?)`,
    [
      uuidv4(),
      id,
      notaActual.contenido,
      contenido || notaActual.contenido,
      autor || notaActual.autor || 'sistema'
    ]
  );

  // Construir update dinamico
  const campos = [];
  const valores = [];

  if (titulo !== undefined) { campos.push('titulo = ?'); valores.push(titulo); }
  if (contenido !== undefined) { campos.push('contenido = ?'); valores.push(contenido); }
  if (categoria !== undefined) {
    if (!CATEGORIAS.includes(categoria)) {
      throw new Error(`Categoria invalida. Opciones: ${CATEGORIAS.join(', ')}`);
    }
    campos.push('categoria = ?');
    valores.push(categoria);
  }
  if (tags !== undefined) {
    const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;
    campos.push('tags = ?');
    valores.push(tagsStr);
  }
  if (autor !== undefined) { campos.push('autor = ?'); valores.push(autor); }

  campos.push("actualizado_en = datetime('now')");
  valores.push(id);

  await dbRun(
    `UPDATE wiki_notas SET ${campos.join(', ')} WHERE id = ?`,
    valores
  );

  // Re-sincronizar links si el contenido cambio
  const contenidoFinal = contenido || notaActual.contenido;
  await sincronizarLinks(id, contenidoFinal);

  const notaActualizada = await dbGet('SELECT * FROM wiki_notas WHERE id = ?', [id]);
  return {
    ...notaActualizada,
    tags: notaActualizada.tags ? notaActualizada.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  };
}

/**
 * Soft delete: marca nota como archivada. Mantiene historial.
 */
async function eliminarNota(id) {
  const nota = await dbGet('SELECT * FROM wiki_notas WHERE id = ? AND archivada = 0', [id]);
  if (!nota) {
    throw new Error('Nota no encontrada');
  }

  await dbRun(
    "UPDATE wiki_notas SET archivada = 1, actualizado_en = datetime('now') WHERE id = ?",
    [id]
  );

  // Guardar en historial la eliminacion
  await dbRun(
    `INSERT INTO wiki_historial (id, nota_id, contenido_anterior, contenido_nuevo, autor)
     VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), id, nota.contenido, '[NOTA ARCHIVADA]', 'sistema']
  );

  // Eliminar links asociados
  await dbRun('DELETE FROM wiki_links WHERE nota_origen = ? OR nota_destino = ?', [id, id]);

  return { mensaje: 'Nota archivada correctamente', id };
}

/**
 * Busqueda full-text en titulo, contenido y tags.
 * Soporta multiples terminos separados por espacios.
 * Ordena por relevancia (numero de coincidencias).
 */
async function buscar(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const terminos = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  // Construir condiciones LIKE para cada termino
  // Una nota es relevante si alguno de sus campos contiene al menos un termino
  const condiciones = [];
  const params = [];

  for (const termino of terminos) {
    const likeVal = `%${termino}%`;
    condiciones.push('(LOWER(titulo) LIKE ? OR LOWER(contenido) LIKE ? OR LOWER(tags) LIKE ?)');
    params.push(likeVal, likeVal, likeVal);
  }

  const where = condiciones.join(' OR ');

  // Consulta con scoring basico: contar cuantos terminos coinciden
  // Para cada termino que coincide, sumamos 1 punto por titulo (peso 3),
  // 1 por contenido (peso 1), 1 por tags (peso 2)
  let scoreParts = [];
  let scoreParams = [];
  for (const termino of terminos) {
    const likeVal = `%${termino}%`;
    scoreParts.push('(CASE WHEN LOWER(titulo) LIKE ? THEN 3 ELSE 0 END)');
    scoreParams.push(likeVal);
    scoreParts.push('(CASE WHEN LOWER(contenido) LIKE ? THEN 1 ELSE 0 END)');
    scoreParams.push(likeVal);
    scoreParts.push('(CASE WHEN LOWER(tags) LIKE ? THEN 2 ELSE 0 END)');
    scoreParams.push(likeVal);
  }

  const scoreExpr = scoreParts.join(' + ');
  const allParams = [...scoreParams, ...params];

  const resultados = await dbAll(
    `SELECT *, (${scoreExpr}) as relevancia
     FROM wiki_notas
     WHERE archivada = 0 AND (${where})
     ORDER BY relevancia DESC, visitas DESC
     LIMIT 20`,
    allParams
  );

  return resultados.map(r => ({
    ...r,
    tags: r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    extracto: extraerExtracto(r.contenido, terminos)
  }));
}

/**
 * Extrae un fragmento del contenido alrededor del primer termino encontrado
 */
function extraerExtracto(contenido, terminos) {
  const contenidoLower = contenido.toLowerCase();
  let pos = -1;

  for (const termino of terminos) {
    pos = contenidoLower.indexOf(termino);
    if (pos >= 0) break;
  }

  if (pos < 0) pos = 0;

  const inicio = Math.max(0, pos - 80);
  const fin = Math.min(contenido.length, pos + 150);
  let extracto = contenido.substring(inicio, fin);

  if (inicio > 0) extracto = '...' + extracto;
  if (fin < contenido.length) extracto = extracto + '...';

  return extracto;
}

/**
 * Lista notas con filtros: categoria, tag, autor, archivada.
 * Paginacion via limit y offset.
 */
async function listarNotas(filtros = {}) {
  const { categoria, tag, autor, limit = 50, offset = 0, archivada = false } = filtros;

  const condiciones = [];
  const params = [];

  condiciones.push('archivada = ?');
  params.push(archivada ? 1 : 0);

  if (categoria) {
    condiciones.push('categoria = ?');
    params.push(categoria);
  }

  if (tag) {
    condiciones.push('LOWER(tags) LIKE ?');
    params.push(`%${tag.toLowerCase()}%`);
  }

  if (autor) {
    condiciones.push('LOWER(autor) LIKE ?');
    params.push(`%${autor.toLowerCase()}%`);
  }

  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const total = await dbGet(
    `SELECT COUNT(*) as total FROM wiki_notas ${where}`,
    params
  );

  const notas = await dbAll(
    `SELECT id, titulo, categoria, tags, autor, creado_en, actualizado_en, visitas
     FROM wiki_notas ${where}
     ORDER BY actualizado_en DESC
     LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), parseInt(offset)]
  );

  return {
    notas: notas.map(n => ({
      ...n,
      tags: n.tags ? n.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    })),
    total: total.total,
    limit: parseInt(limit),
    offset: parseInt(offset),
    paginas: Math.ceil(total.total / parseInt(limit))
  };
}

/**
 * Retorna datos del grafo para visualizacion estilo Obsidian.
 * Nodos = notas, Enlaces = wiki_links.
 */
async function getGrafo() {
  const nodos = await dbAll(
    `SELECT id, titulo, categoria, visitas
     FROM wiki_notas
     WHERE archivada = 0
     ORDER BY visitas DESC`
  );

  const enlaces = await dbAll(
    `SELECT wl.nota_origen as origen, wl.nota_destino as destino, wl.tipo
     FROM wiki_links wl
     JOIN wiki_notas n1 ON n1.id = wl.nota_origen AND n1.archivada = 0
     JOIN wiki_notas n2 ON n2.id = wl.nota_destino AND n2.archivada = 0`
  );

  return {
    nodos: nodos.map(n => ({
      id: n.id,
      titulo: n.titulo,
      categoria: n.categoria,
      visitas: n.visitas,
      // Tamaño relativo basado en visitas para la visualizacion
      peso: Math.min(Math.max(n.visitas, 1), 100)
    })),
    enlaces: enlaces.map(e => ({
      origen: e.origen,
      destino: e.destino,
      tipo: e.tipo
    })),
    total_nodos: nodos.length,
    total_enlaces: enlaces.length
  };
}

/**
 * Historial de versiones de una nota.
 */
async function getHistorial(notaId) {
  const nota = await dbGet('SELECT id, titulo FROM wiki_notas WHERE id = ?', [notaId]);
  if (!nota) {
    throw new Error('Nota no encontrada');
  }

  const historial = await dbAll(
    `SELECT id, contenido_anterior, contenido_nuevo, autor, fecha
     FROM wiki_historial
     WHERE nota_id = ?
     ORDER BY fecha DESC`,
    [notaId]
  );

  return {
    nota_id: notaId,
    titulo: nota.titulo,
    versiones: historial.length,
    historial
  };
}

/**
 * Estadisticas generales del wiki.
 */
async function getEstadisticas() {
  const totalNotas = await dbGet(
    'SELECT COUNT(*) as total FROM wiki_notas WHERE archivada = 0'
  );

  const porCategoria = await dbAll(
    `SELECT categoria, COUNT(*) as total
     FROM wiki_notas WHERE archivada = 0
     GROUP BY categoria
     ORDER BY total DESC`
  );

  const masVisitadas = await dbAll(
    `SELECT id, titulo, categoria, visitas
     FROM wiki_notas WHERE archivada = 0
     ORDER BY visitas DESC LIMIT 10`
  );

  const masEnlazadas = await dbAll(
    `SELECT wn.id, wn.titulo, wn.categoria,
            COUNT(DISTINCT wl1.id) as enlaces_entrantes,
            COUNT(DISTINCT wl2.id) as enlaces_salientes,
            COUNT(DISTINCT wl1.id) + COUNT(DISTINCT wl2.id) as total_enlaces
     FROM wiki_notas wn
     LEFT JOIN wiki_links wl1 ON wl1.nota_destino = wn.id
     LEFT JOIN wiki_links wl2 ON wl2.nota_origen = wn.id
     WHERE wn.archivada = 0
     GROUP BY wn.id
     ORDER BY total_enlaces DESC
     LIMIT 10`
  );

  const actualizacionesRecientes = await dbAll(
    `SELECT id, titulo, categoria, autor, actualizado_en
     FROM wiki_notas WHERE archivada = 0
     ORDER BY actualizado_en DESC LIMIT 10`
  );

  const autoresActivos = await dbAll(
    `SELECT autor, COUNT(*) as notas, MAX(actualizado_en) as ultima_actividad
     FROM wiki_notas WHERE archivada = 0 AND autor IS NOT NULL
     GROUP BY autor
     ORDER BY notas DESC`
  );

  const totalVersiones = await dbGet(
    'SELECT COUNT(*) as total FROM wiki_historial'
  );

  const totalEnlaces = await dbGet(
    'SELECT COUNT(*) as total FROM wiki_links'
  );

  const porCategoriaObj = {};
  for (const c of porCategoria) {
    porCategoriaObj[c.categoria] = c.total;
  }

  return {
    total_notas: totalNotas.total,
    total_versiones: totalVersiones.total,
    total_enlaces: totalEnlaces.total,
    por_categoria: porCategoriaObj,
    notas_mas_visitadas: masVisitadas,
    notas_mas_enlazadas: masEnlazadas,
    actualizaciones_recientes: actualizacionesRecientes,
    autores_activos: autoresActivos
  };
}

/**
 * Funcion clave para agentes IA. Busca en el wiki conocimiento relevante
 * y genera un resumen accionable.
 */
async function consultarParaAgente(query, contexto = {}) {
  if (!query || query.trim().length === 0) {
    return { notas_relevantes: [], conocimiento_aplicable: '', confianza: 0 };
  }

  const { tipo_siniestro, zona, categoria_preferida } = contexto;

  // Busqueda principal por query
  const resultadosQuery = await buscar(query);

  // Busqueda adicional por contexto
  let resultadosContexto = [];
  if (tipo_siniestro) {
    const porTipo = await buscar(tipo_siniestro);
    resultadosContexto = resultadosContexto.concat(porTipo);
  }
  if (zona) {
    const porZona = await buscar(zona);
    resultadosContexto = resultadosContexto.concat(porZona);
  }

  // Si hay categoria preferida, filtrar
  if (categoria_preferida) {
    const porCat = await dbAll(
      `SELECT * FROM wiki_notas
       WHERE archivada = 0 AND categoria = ?
       AND (LOWER(contenido) LIKE ? OR LOWER(titulo) LIKE ?)
       ORDER BY visitas DESC LIMIT 5`,
      [categoria_preferida, `%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`]
    );
    resultadosContexto = resultadosContexto.concat(porCat);
  }

  // Combinar y deduplicar resultados
  const todosResultados = [...resultadosQuery, ...resultadosContexto];
  const vistos = new Set();
  const notasUnicas = [];
  for (const nota of todosResultados) {
    if (!vistos.has(nota.id)) {
      vistos.add(nota.id);
      notasUnicas.push(nota);
    }
  }

  // Limitar a las 8 mas relevantes
  const notasRelevantes = notasUnicas.slice(0, 8);

  // Construir conocimiento aplicable: resumen combinado
  let conocimiento = '';
  if (notasRelevantes.length > 0) {
    const partes = [];
    for (const nota of notasRelevantes) {
      const contenido = nota.contenido || '';
      // Extraer los primeros 300 caracteres como resumen
      const resumen = contenido.substring(0, 300).replace(/\n+/g, ' ').trim();
      partes.push(`[${nota.categoria.toUpperCase()}] ${nota.titulo}: ${resumen}`);
    }
    conocimiento = partes.join('\n\n');
  }

  // Calcular confianza basada en numero y relevancia de resultados
  let confianza = 0;
  if (notasRelevantes.length >= 5) confianza = 90;
  else if (notasRelevantes.length >= 3) confianza = 75;
  else if (notasRelevantes.length >= 1) confianza = 50;
  else confianza = 10;

  // Ajustar confianza si hay coincidencia exacta en titulo
  const coincidenciaExacta = notasRelevantes.some(
    n => n.titulo && n.titulo.toLowerCase().includes(query.toLowerCase())
  );
  if (coincidenciaExacta) confianza = Math.min(confianza + 15, 100);

  return {
    notas_relevantes: notasRelevantes.map(n => ({
      id: n.id,
      titulo: n.titulo,
      categoria: n.categoria,
      extracto: n.extracto || (n.contenido ? n.contenido.substring(0, 200) : ''),
      visitas: n.visitas
    })),
    conocimiento_aplicable: conocimiento,
    confianza,
    total_resultados: notasRelevantes.length,
    query_original: query,
    contexto_usado: contexto
  };
}

/**
 * Auto-genera una nota wiki a partir de un siniestro resuelto.
 * Obtiene datos del siniestro de la BD y crea una nota estructurada.
 */
async function generarNotaDesdeSiniestro(siniestroId) {
  // Obtener datos del siniestro
  const siniestro = await dbGet(
    `SELECT s.*, c.nombre as cliente_nombre, c.tipo_poliza,
            a.nombre as perito_nombre
     FROM siniestros s
     LEFT JOIN clientes c ON c.id = s.cliente_id
     LEFT JOIN agentes a ON a.id = s.perito_id
     WHERE s.id = ?`,
    [siniestroId]
  );

  if (!siniestro) {
    throw new Error('Siniestro no encontrado');
  }

  // Obtener timeline de eventos
  const eventos = await dbAll(
    'SELECT tipo_evento, descripcion, fecha FROM expedientes WHERE siniestro_id = ? ORDER BY fecha',
    [siniestroId]
  );

  // Determinar categoria segun el tipo de siniestro
  const categoriaMap = {
    'coche': 'casos_resueltos',
    'hogar': 'casos_resueltos',
    'salud': 'casos_resueltos',
    'robo': 'casos_resueltos',
    'otro': 'casos_resueltos'
  };

  // Construir titulo
  const tipoLabel = {
    'coche': 'Vehiculo',
    'hogar': 'Hogar',
    'salud': 'Salud',
    'robo': 'Robo',
    'otro': 'Otro'
  };
  const titulo = `Caso ${siniestro.expediente} - ${tipoLabel[siniestro.tipo] || siniestro.tipo} ${siniestro.zona || ''}`.trim();

  // Construir contenido en markdown
  let contenido = `# ${titulo}\n\n`;
  contenido += `## Datos del Caso\n`;
  contenido += `- **Expediente:** ${siniestro.expediente}\n`;
  contenido += `- **Tipo:** ${siniestro.tipo}\n`;
  contenido += `- **Estado:** ${siniestro.estado}\n`;
  contenido += `- **Zona:** ${siniestro.zona || 'No especificada'}\n`;
  contenido += `- **Urgencia:** ${siniestro.urgencia}/10\n`;
  contenido += `- **Poliza:** ${siniestro.tipo_poliza || 'No especificada'}\n`;
  contenido += `- **Fecha:** ${siniestro.fecha_creacion}\n\n`;

  contenido += `## Que Ocurrio\n`;
  contenido += `${siniestro.descripcion}\n\n`;

  if (siniestro.perito_nombre) {
    contenido += `## Perito Asignado\n`;
    contenido += `${siniestro.perito_nombre} - Valoracion realizada en zona ${siniestro.zona || 'N/A'}.\n\n`;
  }

  if (siniestro.indemnizacion) {
    contenido += `## Resolucion Economica\n`;
    contenido += `- **Indemnizacion:** ${siniestro.indemnizacion.toLocaleString('es-ES')} EUR\n`;
    contenido += `- **Score fraude:** ${siniestro.score_fraude}/100\n`;
    contenido += `- **Confianza IA:** ${siniestro.ia_confianza}%\n\n`;
  }

  if (eventos.length > 0) {
    contenido += `## Cronologia\n`;
    for (const ev of eventos) {
      contenido += `- **${ev.tipo_evento}** (${ev.fecha}): ${ev.descripcion}\n`;
    }
    contenido += '\n';
  }

  contenido += `## Tiempos de Gestion\n`;
  contenido += `- **Tiempo IA:** ${siniestro.ia_tiempo || 'N/A'}\n`;
  contenido += `- **Tiempo humano equivalente:** ${siniestro.humano_tiempo || 'N/A'}\n`;
  contenido += `- **Modo gestion:** ${siniestro.ia_gestion || 'N/A'}\n\n`;

  contenido += `## Lecciones Aprendidas\n`;
  if (siniestro.score_fraude > 40) {
    contenido += `- **Alerta de fraude:** Score elevado (${siniestro.score_fraude}/100). Requirio verificacion adicional.\n`;
    contenido += `- Consultar procedimiento [[Deteccion de fraude en robo de vehiculos]] para casos similares.\n`;
  }
  if (siniestro.tipo === 'hogar' && siniestro.zona === 'Valencia') {
    contenido += `- Siniestro en zona Valencia. Consultar [[Protocolo DANA Valencia]] para contexto meteorologico.\n`;
    contenido += `- Peritos disponibles en [[Peritos zona Valencia]].\n`;
  }
  if (siniestro.tipo === 'coche') {
    contenido += `- Para calculo de indemnizaciones similares ver [[Calculo de indemnizacion vehiculos]].\n`;
  }
  if (siniestro.urgencia >= 8) {
    contenido += `- Caso de alta urgencia (${siniestro.urgencia}/10). Se activo protocolo express.\n`;
  }
  contenido += `- Caso gestionado con modo IA "${siniestro.ia_gestion}" y confianza ${siniestro.ia_confianza}%.\n`;

  // Tags basados en el caso
  const tags = [siniestro.tipo, siniestro.zona, siniestro.estado, 'auto-generada'].filter(Boolean);

  // Crear la nota
  const notaCreada = await crearNota({
    titulo,
    contenido,
    categoria: categoriaMap[siniestro.tipo] || 'casos_resueltos',
    tags,
    autor: 'agente-ia'
  });

  return notaCreada;
}

// =============================================================================
// SEED: Datos iniciales del wiki
// =============================================================================
async function seedWiki() {
  const count = await dbGet('SELECT COUNT(*) as c FROM wiki_notas');
  if (count && count.c > 0) {
    console.log('Wiki: datos ya existen, omitiendo seed');
    return;
  }

  console.log('Wiki: insertando datos de ejemplo...');

  const notas = [
    // 1. Protocolo DANA Valencia
    {
      titulo: 'Protocolo DANA Valencia',
      categoria: 'procedimientos',
      tags: 'DANA,Valencia,catastrofe,inundacion,protocolo',
      autor: 'ana.martinez',
      contenido: `# Protocolo de Actuacion DANA Valencia

## Activacion del Protocolo
Este protocolo se activa automaticamente cuando AEMET emite alerta roja o naranja por fenomeno DANA en la Comunidad Valenciana. La activacion la autoriza el Director de Operaciones o, en su ausencia, el responsable de guardia.

## Fases de Actuacion

### Fase 1: Pre-alerta (24-48h antes)
- Revisar stock de peritos disponibles en zona Levante
- Contactar red de proveedores de emergencia: gruas, limpiezas, bomberos
- Preparar centralita para pico de llamadas (x5 capacidad normal)
- Activar agente IA en modo catastrofe

### Fase 2: Durante el evento
- Todas las llamadas de la zona afectada se clasifican automaticamente como urgencia 8+
- Asignacion automatica de expedientes por geolocalizacion
- Envio masivo de SMS a asegurados de la zona con instrucciones
- Documentacion fotografica obligatoria antes de cualquier limpieza

### Fase 3: Post-evento (primeras 72h)
- Desplegar peritos de refuerzo desde Madrid, Barcelona y Sevilla
- Aplicar baremo especial por catastrofe segun [[Normativa DGSFP catastrofes]]
- Coordinacion con Consorcio de Compensacion de Seguros
- Priorizar viviendas habitables vs. no habitables
- Consultar [[Peritos zona Valencia]] para asignaciones

### Fase 4: Resolucion (hasta 6 meses)
- Seguimiento semanal de cada expediente
- Informe mensual al CCS
- Provision economica especial

## Indicadores KPI
- Tiempo medio de primera respuesta: <2 horas
- Peritacion completada: <72 horas desde asignacion
- Resolucion total: <30 dias para danos menores, <90 dias para danos graves

## Lecciones de eventos anteriores
En la DANA de noviembre 2024 se procesaron 3.247 siniestros en la provincia de Valencia. El cuello de botella principal fue la disponibilidad de peritos en las primeras 48 horas. Ver [[Guia peritacion hogar por inundacion]] para procedimiento detallado.`
    },

    // 2. Deteccion de fraude en robo de vehiculos
    {
      titulo: 'Deteccion de fraude en robo de vehiculos',
      categoria: 'procedimientos',
      tags: 'fraude,robo,vehiculo,deteccion,investigacion',
      autor: 'roberto.diaz',
      contenido: `# Deteccion de Fraude en Robo de Vehiculos

## Indicadores de Alerta (Red Flags)

### Nivel 1 - Sospecha Baja (score 20-40)
- Vehiculo de mas de 10 anos con cobertura de robo reciente
- Declaracion del robo mas de 48h despues del supuesto evento
- Unica llave entregada (alegando perdida de la segunda)

### Nivel 2 - Sospecha Media (score 40-65)
- Poliza contratada o ampliada en los 3 meses previos al robo
- Vehiculo con financiacion pendiente superior al valor de mercado
- Cliente con antecedentes de siniestros previos en otras companias
- Zona de robo con baja incidencia estadistica

### Nivel 3 - Sospecha Alta (score 65-100)
- Coincidencia con patrones de la [[Red de fraude Levante 2024]]
- Vehiculo localizado en desguace irregular
- Testigos inconsistentes o inexistentes
- Documentacion DGT con anomalias - verificar con [[Verificacion DGT]]
- GPS del vehiculo muestra recorrido sospechoso previo al robo

## Protocolo de Investigacion
1. Verificar titularidad y cargas en DGT
2. Solicitar informe de uso de llaves al concesionario
3. Comprobar camaras de seguridad de la zona
4. Entrevista al asegurado con grabacion autorizada
5. Consultar base de datos TIREA para siniestros cruzados
6. Analizar redes sociales del asegurado (OSINT basico)

## Acciones segun Score
- **20-40:** Tramitacion normal con seguimiento
- **40-65:** Investigacion interna obligatoria, perito antifraude
- **65-100:** Derivar a departamento juridico, posible denuncia

## Casos de Referencia
Ver caso documentado en [[Red de fraude Levante 2024]] donde se desmantelaron 23 reclamaciones fraudulentas coordinadas.`
    },

    // 3. Red de fraude Levante 2024
    {
      titulo: 'Red de fraude Levante 2024',
      categoria: 'casos_resueltos',
      tags: 'fraude,red,levante,caso,2024,investigacion',
      autor: 'roberto.diaz',
      contenido: `# Caso: Red de Fraude Levante 2024

## Resumen Ejecutivo
Entre marzo y septiembre de 2024 se detecto una red organizada de fraude en seguros de vehiculos que operaba en las provincias de Valencia, Alicante y Murcia. Se identificaron 23 reclamaciones fraudulentas por un importe total de 412.000 EUR.

## Como se Detecto
El sistema de scoring antifraude detecto un patron inusual: 8 robos de vehiculos BMW y Mercedes en un radio de 15km en Elche/Alicante en un periodo de 6 semanas. Todos los vehiculos tenian entre 3 y 5 anos, y las polizas habian sido ampliadas a todo riesgo en los 2-4 meses previos.

## Modus Operandi
1. Captacion de propietarios con deudas pendientes
2. Ampliacion de poliza a todo riesgo con la aseguradora victima
3. Simulacion de robo (vehiculo trasladado a nave industrial)
4. Denuncia policial coordinada (misma comisaria)
5. Despiece del vehiculo y venta de piezas online
6. Cobro de indemnizacion y reparto de beneficios

## Indicadores Clave Detectados
- Patron geografico concentrado
- Temporalidad de contratacion/siniestro
- Coincidencia de talleres en historial ITV
- Relaciones familiares entre asegurados (2 primos, 1 cunado)

## Resultado
- 23 reclamaciones denegadas (412.000 EUR ahorrados)
- 5 denuncias penales presentadas
- 3 detenidos, 2 en busca y captura
- Procedimiento actualizado en [[Deteccion de fraude en robo de vehiculos]]

## Lecciones Aprendidas
- Importar datos de contratacion reciente al motor antifraude
- Cruzar automaticamente geolocalizacion de siniestros
- Revisar relaciones familiares entre asegurados de una misma zona`
    },

    // 4. Normativa DGSFP catastrofes
    {
      titulo: 'Normativa DGSFP catastrofes',
      categoria: 'normativa',
      tags: 'DGSFP,normativa,catastrofe,CCS,regulacion',
      autor: 'ana.martinez',
      contenido: `# Normativa DGSFP para Eventos Catastroficos

## Marco Legal
- Ley 50/1980, de 8 de octubre, de Contrato de Seguro (arts. 44-45)
- Real Decreto Legislativo 7/2004, Estatuto del Consorcio de Compensacion de Seguros
- Circular DGSFP 1/2023 sobre comunicacion de siniestros catastroficos

## Obligaciones de la Aseguradora

### Comunicacion al CCS
- Plazo maximo: 7 dias habiles desde la declaracion de zona catastrofica
- Formato: via plataforma SICA del Consorcio
- Datos obligatorios: numero de poliza, datos del asegurado, descripcion de danos, estimacion preliminar

### Plazos de Resolucion
- Primera visita pericial: maximo 15 dias naturales
- Informe pericial: maximo 30 dias desde la visita
- Oferta de indemnizacion: maximo 40 dias desde el informe
- Pago: maximo 5 dias desde la aceptacion

### Baremo Especial Catastrofes
El CCS aplica baremos propios para:
- Viviendas: valor de reposicion, no valor de mercado
- Vehiculos: valor venal + 30% en caso de siniestro total
- Enseres domesticos: tablas actualizadas anualmente

## Documentacion Requerida
1. Parte de siniestro firmado por el asegurado
2. Fotografias de los danos (minimo 10 fotos)
3. Informe pericial con croquis y mediciones
4. Facturas o presupuestos de reparacion (3 minimo)
5. Certificado de empadronamiento (para vivienda habitual)

## Coordinacion con el [[Protocolo DANA Valencia]]
En eventos DANA, se activa el convenio especial con el CCS que permite anticipos de hasta el 50% de la estimacion preliminar.`
    },

    // 5. Calculo de indemnizacion vehiculos
    {
      titulo: 'Calculo de indemnizacion vehiculos',
      categoria: 'procedimientos',
      tags: 'indemnizacion,vehiculo,calculo,baremo,valoracion',
      autor: 'laura.vega',
      contenido: `# Calculo de Indemnizacion para Vehiculos

## Metodologia General

### Siniestro Parcial (reparable)
1. Solicitar 2-3 presupuestos de talleres concertados
2. Verificar precios de repuestos en base de datos GT Motive
3. Aplicar baremo de mano de obra segun zona geografica
4. Descuento por mejora (piezas nuevas en vehiculo usado): tabla por antiguedad
5. IVA incluido si el asegurado no es profesional

### Siniestro Total
Se aplica el mayor de estos valores:
- **Valor venal:** Precio de mercado segun tablas Ganvam/Eurotax
- **Valor de reposicion:** Coste de adquirir vehiculo equivalente
- **Valor convenido:** Si consta en poliza (poco frecuente)

Formula: Indemnizacion = MAX(Valor_Venal, Valor_Reposicion) - Franquicia - Valor_Restos

### Tabla de Depreciacion
| Antiguedad | Depreciacion |
|-----------|-------------|
| 0-1 ano   | 0-15%       |
| 1-2 anos  | 15-25%      |
| 2-3 anos  | 25-35%      |
| 3-5 anos  | 35-50%      |
| 5-8 anos  | 50-65%      |
| 8+ anos   | 65-80%      |

## Casos Especiales
- **Vehiculos clasicos:** Tasacion especial por perito especializado
- **Vehiculos electricos:** Bateria se valora por separado (30-40% del valor)
- **Leasing/Renting:** Indemnizacion al propietario (financiera), no al usuario

## Productos Relacionados
Ver coberturas en [[Producto Auto Todo Riesgo]] y [[Producto Auto Terceros Ampliado]].`
    },

    // 6. Guia peritacion hogar por inundacion
    {
      titulo: 'Guia peritacion hogar por inundacion',
      categoria: 'formacion',
      tags: 'peritacion,hogar,inundacion,formacion,guia',
      autor: 'laura.vega',
      contenido: `# Guia de Peritacion: Hogar por Inundacion

## Preparacion de la Visita
- Verificar que el inmueble es accesible y seguro
- Llevar equipo: medidor de humedad, camara, cinta metrica, nivel laser
- Solicitar planos del inmueble si estan disponibles
- Revisar cobertura de la poliza antes de la visita

## Protocolo de Inspeccion

### 1. Evaluacion Exterior (15 min)
- Nivel de agua alcanzado en fachada (marcar con cinta)
- Estado de accesos: portal, garaje, escaleras
- Danos estructurales visibles: grietas, desplazamientos
- Fotografiar entorno: calle, desagues, bajantes

### 2. Evaluacion Interior - Planta por Planta (45-60 min)
- Medir nivel de agua alcanzado en cada estancia
- Documentar danos en suelos: parquet, ceramica, moqueta
- Documentar danos en paredes: pintura, yeso, aislamiento
- Documentar danos en mobiliario: lista detallada con fotos
- Verificar cuadro electrico y toma de tierra
- Comprobar estado de electrodomesticos sumergidos

### 3. Instalaciones (20 min)
- Fontaneria: verificar presion y posibles contaminaciones
- Electricidad: NUNCA energizar sin revision profesional
- Gas: comprobar con detector de fugas
- Calefaccion/AA: verificar unidades exteriores e interiores

## Clasificacion de Danos
- **Nivel 1 (Leve):** Solo limpieza y secado. <5cm de agua. Coste estimado: 500-2.000 EUR
- **Nivel 2 (Moderado):** Sustitucion de suelos y parte baja de paredes. 5-30cm. Coste: 2.000-15.000 EUR
- **Nivel 3 (Grave):** Rehabilitacion completa de planta afectada. 30-100cm. Coste: 15.000-50.000 EUR
- **Nivel 4 (Muy grave):** Danos estructurales, posible inhabitabilidad. >100cm. Coste: >50.000 EUR

## Documentacion a Generar
Consultar plantilla en sistema y procedimientos de zona en [[Peritos zona Valencia]].
Para normativa aplicable ver [[Normativa DGSFP catastrofes]].`
    },

    // 7. Peritos zona Valencia
    {
      titulo: 'Peritos zona Valencia',
      categoria: 'proveedores',
      tags: 'peritos,Valencia,proveedores,red,contactos',
      autor: 'ana.martinez',
      contenido: `# Red de Peritos - Zona Valencia

## Peritos Titulares

### Laura Sanchez Gil (AGT-004)
- **Especialidad:** Robo, Hogar
- **Zona:** Valencia capital, L'Horta
- **Telefono:** 611000004
- **Email:** lsanchez@peritos.com
- **Valoracion:** 4.6/5 (58 expedientes)
- **Tiempo medio:** 4.0 dias
- **Disponibilidad:** L-V 8:00-18:00, guardias fines de semana

### Antonio Perez Navarro
- **Especialidad:** Hogar, Comunidades
- **Zona:** Valencia sur, Ribera
- **Telefono:** 611000010
- **Email:** aperez@peritos.com
- **Valoracion:** 4.4/5 (42 expedientes)
- **Tiempo medio:** 4.5 dias

### Maria Jose Campos
- **Especialidad:** Auto, Hogar
- **Zona:** Alicante norte, Marina Alta
- **Telefono:** 611000011
- **Email:** mjcampos@peritos.com
- **Valoracion:** 4.7/5 (63 expedientes)
- **Tiempo medio:** 3.5 dias

## Peritos de Refuerzo (disponibles para DANA/catastrofe)
- Carlos Ruiz Martinez (Madrid) - AGT-001 - Auto/Hogar - 4.9/5
- Miguel Angel Fernandez (Sevilla) - AGT-003 - Auto - 4.7/5

## Talleres Concertados Valencia
- Talleres Mediterraneo SL - Calle Industria 45 - Tel: 963001122
- AutoReparacion Express - Av. del Puerto 120 - Tel: 963003344
- CarroVal Chapa y Pintura - Pol. Ind. Fuente del Jarro - Tel: 961887766

## Protocolo de Asignacion
1. Asignar perito por proximidad geografica y especialidad
2. Si no hay disponibilidad en 24h, escalar a perito de refuerzo
3. En situacion de catastrofe, seguir [[Protocolo DANA Valencia]]
4. Peritaciones de hogar por inundacion segun [[Guia peritacion hogar por inundacion]]`
    },

    // 8. FAQ Clientes - Plazos de resolucion
    {
      titulo: 'FAQ Clientes - Plazos de resolucion',
      categoria: 'faq',
      tags: 'FAQ,plazos,clientes,resolucion,tiempos',
      autor: 'roberto.diaz',
      contenido: `# FAQ: Plazos de Resolucion de Siniestros

## Preguntas Frecuentes

### Cuanto tarda en resolverse mi siniestro?
Los plazos dependen del tipo de siniestro:
- **Auto - danos propios:** 15-30 dias laborables
- **Auto - terceros:** 20-45 dias (depende de contrario)
- **Hogar - averia:** 7-15 dias
- **Hogar - inundacion/incendio:** 30-60 dias
- **Robo:** 30-45 dias (requiere denuncia policial)
- **Salud:** 5-10 dias para reembolsos

### Cuando recibire el pago?
Una vez aceptada la oferta de indemnizacion, el pago se realiza en un maximo de 5 dias habiles por transferencia bancaria.

### Puedo elegir mi propio taller/reparador?
Si, siempre puede elegir. Sin embargo, con talleres concertados:
- No paga franquicia (en muchas polizas)
- Garantia de reparacion de 2 anos
- Vehiculo de sustitucion incluido

### Que pasa si no estoy de acuerdo con la valoracion?
1. Puede solicitar revision por segundo perito
2. Si persiste desacuerdo: perito tercero independiente
3. Ultimo recurso: mediacion/arbitraje de consumo
4. Via judicial (no recomendado por tiempos y costes)

### Necesito denuncia policial?
- **Robo:** SI, obligatoria en las primeras 24 horas
- **Accidente con heridos:** SI, obligatoria
- **Accidente sin heridos:** Parte amistoso europeo es suficiente
- **Hogar:** NO, salvo vandalismo o robo

### Como sigo el estado de mi expediente?
- **App SiniestrosAI:** Seguimiento en tiempo real
- **WhatsApp:** Envie un mensaje con su numero de poliza
- **Telefono:** 900 100 200 (24h, atendido por IA)
- **Email:** siniestros@siniestrosai.com

Para informacion sobre productos ver [[Producto Auto Todo Riesgo]].`
    },

    // 9. Producto Auto Todo Riesgo
    {
      titulo: 'Producto Auto Todo Riesgo',
      categoria: 'productos',
      tags: 'auto,todo-riesgo,producto,cobertura,poliza',
      autor: 'ana.martinez',
      contenido: `# Producto: Auto Todo Riesgo

## Coberturas Incluidas

### Coberturas Obligatorias
- Responsabilidad Civil obligatoria (hasta 70M EUR danos personales)
- Responsabilidad Civil voluntaria (hasta 50M EUR)
- Defensa juridica y reclamacion de danos
- Asistencia en viaje 24h (Peninsula + Europa)

### Coberturas de Danos Propios
- Choque, vuelco y atropello
- Incendio y explosion
- Robo y expoliacion (total y parcial)
- Rotura de lunas (sin franquicia)
- Fenomenos meteorologicos (granizo, inundacion, viento)
- Danos por animales
- Actos vandalicos

### Coberturas Adicionales
- Vehiculo de sustitucion (hasta 30 dias)
- Accidentes del conductor (hasta 300.000 EUR)
- Equipajes (hasta 3.000 EUR)
- Llaves y documentacion (hasta 500 EUR)
- Asistencia en viaje desde km 0

## Franquicias
- **Opcion A:** Sin franquicia - Prima +20%
- **Opcion B:** 150 EUR franquicia - Prima estandar
- **Opcion C:** 300 EUR franquicia - Prima -10%
- **Opcion D:** 600 EUR franquicia - Prima -20%

## Exclusiones Principales
- Conduccion bajo efectos de alcohol/drogas
- Uso del vehiculo para competicion
- Danos intencionados
- Desgaste natural y averia mecanica

## Calculo de Prima
Ver procedimiento en [[Calculo de indemnizacion vehiculos]] para valoraciones.
Para la version basica ver [[Producto Auto Terceros Ampliado]].`
    },

    // 10. Verificacion DGT
    {
      titulo: 'Verificacion DGT',
      categoria: 'tecnologia',
      tags: 'DGT,verificacion,API,vehiculo,matricula',
      autor: 'roberto.diaz',
      contenido: `# Integracion y Verificacion con DGT

## Servicios Disponibles

### Consulta de Titularidad
- **Endpoint:** API DGT v2 /vehiculos/{matricula}/titular
- **Datos obtenidos:** Nombre titular, DNI, domicilio fiscal, fecha de transferencia
- **Uso:** Verificar que el denunciante es el titular real del vehiculo
- **Coste:** 0.50 EUR/consulta (tarifa convenio aseguradoras)

### Historial de Vehiculo
- **Endpoint:** API DGT v2 /vehiculos/{matricula}/historial
- **Datos:** ITV vigente, transferencias previas, bajas temporales, cargas
- **Uso:** Detectar vehiculos dados de baja antes de supuesto robo

### Verificacion de Documentacion
Comparar datos de permiso de circulacion con ficha tecnica:
- Numero de bastidor (VIN) coincide
- Fecha de matriculacion coherente
- Potencia y cilindrada coinciden con modelo declarado

## Indicadores de Fraude via DGT
- Vehiculo con baja temporal reciente (posible simulacion)
- ITV caducada o con defectos graves no declarados
- Multiples transferencias en periodo corto
- Cargas financieras no declaradas por el asegurado

## Integracion Tecnica
- Autenticacion: Certificado digital de la aseguradora
- Rate limit: 100 consultas/minuto
- Tiempo de respuesta: <2 segundos
- Disponibilidad: 99.5% SLA (L-S 7:00-22:00)

Para uso en investigaciones de fraude ver [[Deteccion de fraude en robo de vehiculos]].`
    },

    // 11. Producto Auto Terceros Ampliado
    {
      titulo: 'Producto Auto Terceros Ampliado',
      categoria: 'productos',
      tags: 'auto,terceros,ampliado,producto,cobertura',
      autor: 'ana.martinez',
      contenido: `# Producto: Auto Terceros Ampliado

## Coberturas Incluidas

### Base (Terceros Basico)
- Responsabilidad Civil obligatoria
- Responsabilidad Civil voluntaria (hasta 30M EUR)
- Defensa juridica basica
- Asistencia en viaje (a partir de km 25)

### Ampliaciones Incluidas
- Robo e incendio del vehiculo
- Rotura de lunas (con franquicia de 50 EUR)
- Fenomenos meteorologicos (solo granizo)
- Accidentes del conductor (hasta 150.000 EUR)

### No Incluido (disponible como extra)
- Danos propios por choque o vuelco
- Vehiculo de sustitucion
- Asistencia desde km 0
- Actos vandalicos

## Perfil del Cliente Tipo
- Vehiculos de mas de 5 anos
- Conductores con historial limpio que buscan precio competitivo
- Segundo vehiculo familiar
- Kilometraje anual inferior a 10.000 km

## Prima Orientativa
- Conductor >30 anos, sin siniestros: desde 280 EUR/ano
- Conductor 25-30 anos: desde 380 EUR/ano
- Conductor <25 anos: desde 520 EUR/ano

## Upgrade a Todo Riesgo
Para clientes que quieran ampliar cobertura, ver [[Producto Auto Todo Riesgo]].
Para el calculo de indemnizaciones ver [[Calculo de indemnizacion vehiculos]].`
    },

    // 12. Protocolo atencion telefonica IA
    {
      titulo: 'Protocolo atencion telefonica IA',
      categoria: 'procedimientos',
      tags: 'telefonia,IA,atencion,protocolo,llamadas',
      autor: 'roberto.diaz',
      contenido: `# Protocolo de Atencion Telefonica con IA

## Flujo de Llamada Entrante

### Paso 1: Identificacion (0-15 seg)
- Saludo estandar: "Bienvenido a SiniestrosAI, soy su asistente virtual"
- Solicitar numero de poliza o DNI
- Verificar identidad con pregunta de seguridad (fecha nacimiento o codigo postal)

### Paso 2: Clasificacion (15-30 seg)
La IA clasifica automaticamente el motivo de la llamada:
- **Nuevo siniestro:** Derivar a flujo de apertura
- **Seguimiento:** Consultar estado y comunicar
- **Reclamacion:** Escalar a gestor humano
- **Informacion general:** Resolver automaticamente

### Paso 3: Gestion del Siniestro Nuevo (30-120 seg)
1. Recopilar datos del evento: que, cuando, donde, como
2. Evaluar urgencia automaticamente
3. Asignar expediente y comunicar numero
4. Informar de proximos pasos y plazos
5. Enviar resumen por SMS/WhatsApp

### Paso 4: Cierre (10-15 seg)
- Confirmar datos registrados
- Ofrecer canal alternativo (WhatsApp, App)
- Despedida y encuesta de satisfaccion (1-5)

## Escalado a Humano
Se escala automaticamente cuando:
- Cliente solicita hablar con persona
- Sentimiento detectado: enfado alto o llanto
- Siniestro con score fraude >50
- Caso legal o con heridos graves
- Mas de 2 minutos sin resolver la consulta

## Metricas Objetivo
- Tasa de resolucion IA: >75%
- Tiempo medio de llamada: <2 minutos
- Satisfaccion: >4.2/5
- Tiempo de espera: <5 segundos

Para consultas frecuentes de clientes ver [[FAQ Clientes - Plazos de resolucion]].`
    },

    // 13. Manual onboarding gestores
    {
      titulo: 'Manual onboarding gestores',
      categoria: 'formacion',
      tags: 'onboarding,gestores,formacion,manual,nuevos',
      autor: 'ana.martinez',
      contenido: `# Manual de Onboarding para Nuevos Gestores

## Semana 1: Fundamentos

### Dia 1-2: Plataforma SiniestrosAI
- Acceso al sistema y configuracion de perfil
- Navegacion por el dashboard principal
- Consulta de expedientes y estados
- Uso del wiki interno (esta herramienta)

### Dia 3-4: Tipos de Siniestros
- Auto: colisiones, robos, danos propios - ver [[Producto Auto Todo Riesgo]]
- Hogar: inundaciones, incendios, robos - ver [[Producto Hogar Plus]]
- Salud: hospitalizaciones, consultas, reembolsos
- Clasificacion y urgencias

### Dia 5: Herramientas IA
- Como funciona el agente IA de SiniestrosAI
- Cuando la IA gestiona sola vs. cuando escala
- Como revisar y aprobar decisiones de la IA
- Uso del chat interno con el agente

## Semana 2: Procedimientos

### Apertura de Siniestros
- Recepcion por telefono, WhatsApp, email, app
- Verificacion de cobertura
- Asignacion de perito segun zona y tipo

### Gestion del Expediente
- Timeline de eventos
- Comunicacion con el cliente
- Coordinacion con peritos y proveedores
- Documentacion requerida

### Cierre y Resolucion
- Calculo de indemnizacion - ver [[Calculo de indemnizacion vehiculos]]
- Oferta al cliente
- Pago y cierre administrativo

## Semana 3: Casos Especiales
- Fraude: [[Deteccion de fraude en robo de vehiculos]]
- Catastrofes: [[Protocolo DANA Valencia]]
- Reclamaciones y quejas

## Evaluacion
Test teorico (>80% para aprobar) + 5 expedientes supervisados.`
    },

    // 14. Producto Hogar Plus
    {
      titulo: 'Producto Hogar Plus',
      categoria: 'productos',
      tags: 'hogar,plus,producto,cobertura,poliza',
      autor: 'ana.martinez',
      contenido: `# Producto: Hogar Plus

## Coberturas Incluidas

### Continente (la estructura)
- Incendio, explosion y caida de rayo
- Danos por agua (roturas, filtraciones, inundaciones)
- Fenomenos atmosfericos (viento, granizo, nieve)
- Robo y expoliacion
- Actos vandalicos
- Danos electricos
- Rotura de cristales
- Capital asegurado: hasta 300.000 EUR

### Contenido (bienes muebles)
- Mobiliario y enseres domesticos
- Electrodomesticos y electronica
- Ropa y objetos personales
- Objetos de valor (joyas, arte): hasta 6.000 EUR
- Capital asegurado: hasta 50.000 EUR

### Responsabilidad Civil
- RC familiar: hasta 600.000 EUR
- RC inmueble: hasta 300.000 EUR
- Defensa juridica: incluida

### Servicios Adicionales
- Asistencia hogar 24h: fontanero, electricista, cerrajero
- Alojamiento alternativo (hasta 90 dias si inhabitable)
- Mudanza y guardamuebles (hasta 3.000 EUR)
- Limpieza post-siniestro

## Exclusiones
- Danos por falta de mantenimiento
- Humedades por condensacion
- Danos esteticos sin funcionalidad afectada
- Piscinas y elementos exteriores (requiere extension)

## Peritacion de Siniestros Hogar
Para guia detallada de peritacion ver [[Guia peritacion hogar por inundacion]].
Para red de peritos disponibles ver [[Peritos zona Valencia]] y equivalentes por zona.`
    },

    // 15. Arquitectura tecnica SiniestrosAI
    {
      titulo: 'Arquitectura tecnica SiniestrosAI',
      categoria: 'tecnologia',
      tags: 'arquitectura,tecnica,sistema,API,backend',
      autor: 'roberto.diaz',
      contenido: `# Arquitectura Tecnica de SiniestrosAI

## Stack Tecnologico
- **Backend:** Node.js + Express
- **Base de datos:** SQLite (WAL mode) con migracion planificada a PostgreSQL
- **Frontend:** HTML5 + CSS3 + JavaScript vanilla
- **Tiempo real:** Socket.IO para WebSockets
- **IA:** Motor de reglas propio + integracion con LLMs

## Modulos Principales

### Core
- Gestion de siniestros (CRUD + workflow)
- Gestion de clientes y polizas
- Sistema de expedientes con timeline
- Autenticacion JWT con refresh tokens

### Agentes IA
- **Agente Principal:** Orquestacion de decisiones
- **Agente Antifraude:** Scoring y deteccion de patrones
- **Agente Vigilante:** Monitoreo proactivo de anomalias
- Motor de reglas de negocio configurable

### Comunicaciones
- WhatsApp Business API (via webhook)
- Centralita telefonica IA - ver [[Protocolo atencion telefonica IA]]
- Email transaccional
- SMS para notificaciones urgentes

### Integraciones
- DGT para verificacion vehicular - ver [[Verificacion DGT]]
- AEMET para datos meteorologicos
- Consorcio de Compensacion de Seguros
- Blockchain para auditoria inmutable

## API REST
- 50+ endpoints documentados
- Autenticacion Bearer JWT
- Rate limiting: 200 req/min
- Compresion gzip
- Cache con ETags

## Seguridad
- Headers de seguridad (Helmet)
- Sanitizacion de inputs
- CORS configurado por entorno
- RGPD compliance integrado`
    },

    // 16. Procedimiento valoracion de danos por incendio
    {
      titulo: 'Procedimiento valoracion danos por incendio',
      categoria: 'procedimientos',
      tags: 'incendio,valoracion,danos,procedimiento,peritacion',
      autor: 'laura.vega',
      contenido: `# Procedimiento de Valoracion de Danos por Incendio

## Fase Inicial: Seguridad
- NUNCA entrar hasta que bomberos confirmen seguridad estructural
- Verificar ausencia de gases toxicos
- Utilizar EPIs: mascarilla FFP3, guantes, botas de seguridad

## Evaluacion de Danos

### Danos por Fuego Directo
- Paredes y techos: ennegrecimiento, calcinacion, derrumbe
- Suelos: deformacion, carbonizacion
- Instalaciones: cableado fundido, tuberias deformadas

### Danos por Humo
- Impregnacion en textiles y mobiliario
- Depositos de hollin en superficies
- Contaminacion de alimentos y productos

### Danos por Agua (extincion)
- Encharcamiento de plantas inferiores
- Danos en electronica y electrodomesticos
- Humedad residual en paredes

## Calculo de Indemnizacion
- Contenido: inventario pieza por pieza con depreciacion
- Continente: presupuesto de reconstruccion por m2
- Lucro cesante (si aplica): facturacion media ultimos 12 meses
- Gastos de realojamiento: segun [[Producto Hogar Plus]]

## Investigacion de Causa
- Solicitar informe de bomberos
- Verificar cuadro electrico y posible cortocircuito
- Comprobar cumplimiento de normativa de instalaciones
- Si hay indicios de intencionalidad: activar protocolo antifraude`
    },

    // 17. Caso resuelto: Incendio cocina Sevilla
    {
      titulo: 'Caso resuelto incendio cocina Sevilla',
      categoria: 'casos_resueltos',
      tags: 'incendio,cocina,Sevilla,caso,hogar',
      autor: 'laura.vega',
      contenido: `# Caso Resuelto: Incendio en Cocina - Sevilla

## Datos del Caso
- **Expediente:** EXP-2024-0886
- **Cliente:** Antonio Navarro Gil (CLI-006)
- **Tipo:** Hogar - Incendio
- **Zona:** Sevilla
- **Fecha:** Octubre 2024

## Descripcion del Siniestro
Incendio originado en la campana extractora de la cocina por cortocircuito electrico. El fuego se propago al mueble superior y al falso techo de la cocina. Los bomberos intervinieron en 8 minutos. Danos graves en cocina y danos por humo en salon contiguo.

## Gestion
1. **Apertura:** Parte recibido via llamada IA a las 14:22h
2. **Perito asignado:** Miguel Angel Fernandez (AGT-003), visita a las 48h
3. **Informe pericial:** Danos valorados en 23.500 EUR
4. **Causa:** Cortocircuito en motor de campana extractora (>15 anos, sin revision)

## Resolucion
- **Indemnizacion:** 23.500 EUR
- **Desglose:** Cocina completa (18.000) + danos humo salon (3.500) + limpieza (2.000)
- **Tiempo total:** 22 dias desde apertura hasta pago
- **Modo IA:** Full - gestion automatizada

## Lecciones Aprendidas
- La campana extractora tenia mas de 15 anos sin revision
- Importancia de verificar antigueedad de electrodomesticos en peritaciones
- Ver procedimiento completo en [[Procedimiento valoracion danos por incendio]]
- Score fraude bajo (15/100), caso limpio`
    },

    // 18. Normativa RGPD seguros
    {
      titulo: 'Normativa RGPD aplicada a seguros',
      categoria: 'normativa',
      tags: 'RGPD,normativa,proteccion-datos,privacidad,legal',
      autor: 'ana.martinez',
      contenido: `# Normativa RGPD Aplicada al Sector Asegurador

## Bases Legales para Tratamiento de Datos
1. **Ejecucion de contrato:** Datos necesarios para la poliza y gestion de siniestros
2. **Obligacion legal:** Prevencion de blanqueo, comunicaciones a DGSFP
3. **Interes legitimo:** Prevencion de fraude (requiere evaluacion de impacto)
4. **Consentimiento:** Marketing, comunicaciones comerciales, perfilado

## Datos Tratados en SiniestrosAI
- **Identificativos:** Nombre, DNI, direccion, telefono, email
- **Economicos:** Datos bancarios, historial de pagos
- **Salud:** Solo en seguros de salud, con consentimiento explicito
- **Geolocalizacion:** Para asignacion de peritos y verificacion de siniestros
- **Grabaciones:** Llamadas telefonicas (con aviso previo)

## Derechos del Asegurado (ARCO+)
- **Acceso:** Proporcionar copia de todos sus datos en 30 dias
- **Rectificacion:** Corregir datos inexactos
- **Supresion:** Eliminar datos no necesarios (respetar plazos legales)
- **Portabilidad:** Exportar datos en formato estandar
- **Oposicion:** Al perfilado automatizado y marketing

## Plazos de Conservacion
- Datos de poliza: vigencia + 5 anos
- Datos de siniestros: cierre + 5 anos
- Grabaciones telefonicas: 2 anos
- Datos de fraude: 10 anos

## Evaluacion de Impacto (EIPD)
Obligatoria para:
- Uso de IA en decisiones automatizadas
- Tratamiento de datos de salud
- Videovigilancia y biometria
- Perfilado de clientes

Para implementacion tecnica ver [[Arquitectura tecnica SiniestrosAI]].`
    },

    // 19. Proveedores de reparacion Madrid
    {
      titulo: 'Proveedores de reparacion Madrid',
      categoria: 'proveedores',
      tags: 'proveedores,Madrid,talleres,reparacion,red',
      autor: 'roberto.diaz',
      contenido: `# Red de Proveedores de Reparacion - Madrid

## Talleres de Automocion

### Talleres Premium (para vehiculos <5 anos)
- **AutoPremium Madrid Centro** - C/ Serrano 200 - Tel: 915001122 - Val: 4.8/5
- **Carrocerias Castellana** - Paseo Castellana 180 - Tel: 915003344 - Val: 4.7/5

### Talleres Concertados (generalistas)
- **TallerRapido Getafe** - Pol. Los Angeles - Tel: 916001122 - Val: 4.5/5
- **AutoFix Vallecas** - Av. Albufera 320 - Tel: 917001122 - Val: 4.3/5
- **MadridMotor Alcobendas** - C/ Industria 15 - Tel: 916501122 - Val: 4.4/5

## Servicios de Grua
- **Gruas Madrid 24h (AGT-006)** - Tel: 900111222 - Tiempo medio: 15 min - Val: 4.3/5
- **EuroGruas Centro** - Tel: 900222333 - Tiempo medio: 20 min - Val: 4.1/5

## Servicios Hogar
- **FontaMadrid** - Fontaneria urgencias - Tel: 900333444 - Val: 4.6/5
- **ElectroFix** - Electricidad - Tel: 900444555 - Val: 4.4/5
- **CerrajeroYA** - Cerrajeria 24h - Tel: 900555666 - Val: 4.2/5
- **LimpiezasExpress** - Post-siniestro - Tel: 900666777 - Val: 4.5/5

## Criterios de Seleccion de Proveedores
- Valoracion minima: 4.0/5
- Tiempo de respuesta maximo: 30 minutos (gruas), 2 horas (hogar)
- Facturacion segun baremo concertado
- Garantia minima: 2 anos en reparaciones

## Revision Trimestral
Se revisan valoraciones y tiempos cada trimestre. Proveedores con valoracion <3.5 o mas de 3 reclamaciones son dados de baja de la red concertada.`
    },

    // 20. Caso resuelto: Fraude seguro salud
    {
      titulo: 'Caso resuelto fraude seguro salud',
      categoria: 'casos_resueltos',
      tags: 'fraude,salud,caso,investigacion,facturas',
      autor: 'roberto.diaz',
      contenido: `# Caso Resuelto: Fraude en Seguro de Salud

## Datos del Caso
- **Expediente:** EXP-2024-0750
- **Tipo:** Salud - Reembolso fraudulento
- **Importe reclamado:** 12.800 EUR
- **Resultado:** Reclamacion denegada, denuncia presentada

## Descripcion
Un asegurado presento facturas de una clinica dental por 12.800 EUR correspondientes a implantes y tratamientos ortodoncicos. Las facturas parecian legitimas pero el sistema de scoring detecto anomalias.

## Indicadores Detectados
1. Clinica dental no registrada en el Colegio de Odontologos de la provincia
2. Numero de colegiado del dentista correspondia a profesional jubilado
3. Precios un 40% superiores al mercado para los tratamientos declarados
4. Mismo NIF de clinica aparecio en 4 reclamaciones de distintas aseguradoras (base TIREA)
5. Fotografias radiologicas inconsistentes con los tratamientos facturados

## Acciones Tomadas
1. Solicitud de historial clinico completo al asegurado
2. Inspeccion presencial de la supuesta clinica (no existia)
3. Verificacion en Colegio de Odontologos (negativo)
4. Cruce con base TIREA: 4 reclamaciones similares detectadas
5. Denuncia penal por estafa y falsificacion de documentos

## Resultado Final
- Reclamacion denegada por documentacion fraudulenta
- Poliza cancelada por incumplimiento grave
- Denuncia penal interpuesta
- Alerta emitida a UNESPA para sector

## Aprendizajes
- Verificar siempre numero de colegiado de profesionales sanitarios
- Cruzar facturas con precios medios de mercado
- Consultar base TIREA para patrones multi-compania`
    },

    // 21. Gestion de siniestros masivos
    {
      titulo: 'Gestion de siniestros masivos',
      categoria: 'procedimientos',
      tags: 'masivos,catastrofe,gestion,protocolo,escalado',
      autor: 'ana.martinez',
      contenido: `# Protocolo de Gestion de Siniestros Masivos

## Definicion
Se considera evento masivo cuando se reciben mas de 50 partes en 24 horas de una misma zona geografica o causa comun.

## Activacion
1. El sistema detecta automaticamente el patron de volumen
2. Notificacion al Director de Operaciones
3. Activacion del Comite de Crisis (Director + 2 responsables)
4. Comunicacion interna a todo el equipo

## Protocolo de Actuacion

### Fase 1: Contencion (0-4 horas)
- Duplicar capacidad del call center (agentes IA + refuerzo humano)
- Activar formulario web simplificado para partes
- Enviar SMS masivo a asegurados de la zona afectada
- Bloquear vacaciones y permisos del equipo

### Fase 2: Triaje (4-24 horas)
- Clasificar siniestros por gravedad automaticamente
- Prioridad 1: Personas heridas o viviendas inhabitables
- Prioridad 2: Vehiculos inmovilizados o negocios parados
- Prioridad 3: Danos materiales sin urgencia vital

### Fase 3: Gestion Masiva (1-7 dias)
- Asignar peritos por zonas geograficas (no por expediente individual)
- Peritaciones grupales en edificios afectados
- Aplicar baremos simplificados para danos menores (<3.000 EUR)
- Pagos anticipados para casos claros

### Fase 4: Normalizacion (1-4 semanas)
- Transicion a gestion individualizada
- Seguimiento de expedientes complejos
- Informe post-evento y lecciones aprendidas

## Recursos de Referencia
- Para eventos DANA: [[Protocolo DANA Valencia]]
- Para peritaciones: [[Guia peritacion hogar por inundacion]]
- Normativa aplicable: [[Normativa DGSFP catastrofes]]`
    },

    // 22. Integracion AEMET meteorologia
    {
      titulo: 'Integracion AEMET meteorologia',
      categoria: 'tecnologia',
      tags: 'AEMET,meteorologia,API,integracion,alertas',
      autor: 'roberto.diaz',
      contenido: `# Integracion con AEMET - Servicio Meteorologico

## Proposito
Verificar automaticamente condiciones meteorologicas en la fecha y zona del siniestro para:
- Validar coherencia de la declaracion del asegurado
- Detectar posible fraude (declarar dano por granizo sin evento meteorologico)
- Activar protocolos preventivos ante alertas

## API AEMET OpenData

### Endpoints Utilizados
- **/prediccion/especifica/municipio/{codigo}** - Prediccion por municipio
- **/observacion/convencional/datos/estacion/{id}** - Datos observados
- **/avisos/cap/ultimoelaborado/area/{area}** - Avisos y alertas activas

### Configuracion
- API Key: Configurada en variables de entorno (AEMET_API_KEY)
- Rate limit: 100 peticiones/hora
- Cache: 30 minutos para predicciones, 1 hora para observaciones

## Uso en Validacion de Siniestros
1. Al recibir un parte, obtener coordenadas del siniestro
2. Consultar estacion AEMET mas cercana
3. Obtener datos meteorologicos de la fecha del evento
4. Comparar con la declaracion del asegurado
5. Si hay discrepancia, incrementar score de fraude en +15 puntos

## Alertas Proactivas
- El sistema consulta alertas AEMET cada 15 minutos
- Si detecta alerta naranja/roja: notificar al equipo de guardia
- Si la alerta afecta a zona con >1000 polizas: pre-activar protocolo masivo
- Historico de alertas almacenado para correlacion post-evento

## Referencia
Para protocolos de catastrofes ver [[Gestion de siniestros masivos]] y [[Protocolo DANA Valencia]].`
    },

    // 23. FAQ Agentes - Uso del sistema IA
    {
      titulo: 'FAQ Agentes - Uso del sistema IA',
      categoria: 'faq',
      tags: 'FAQ,agentes,IA,sistema,uso,interno',
      autor: 'ana.martinez',
      contenido: `# FAQ para Agentes: Uso del Sistema de IA

## Preguntas Frecuentes del Equipo Interno

### Como funciona el scoring de fraude?
El sistema asigna un score de 0 a 100 basado en:
- Patrones historicos del asegurado
- Coherencia de la declaracion con datos externos (DGT, AEMET)
- Anomalias en documentacion presentada
- Cruce con base TIREA (multi-compania)
Ver detalles en [[Deteccion de fraude en robo de vehiculos]].

### Puedo modificar una decision de la IA?
Si. La IA propone pero el gestor decide:
- En modo "full": la IA gestiona y el gestor supervisa
- En modo "partial": la IA prepara y el gestor ejecuta
- En modo "manual": la IA solo aconseja
Cualquier decision de la IA puede ser revertida por un gestor o admin.

### Que hago si la IA se equivoca?
1. Documentar el error en el expediente (boton "Reportar error IA")
2. Corregir la accion manualmente
3. El sistema aprende del feedback para mejorar
4. Casos repetitivos se escalan al equipo de tecnologia

### Como consulto el wiki de conocimiento?
- Acceder desde el menu lateral: "Base de Conocimiento"
- Buscar por titulo, contenido o etiquetas
- Las notas estan enlazadas entre si como en Obsidian
- Puedes crear nuevas notas con tus aprendizajes

### Donde veo las metricas de mi rendimiento?
- Dashboard personal: expedientes gestionados, tiempo medio, satisfaccion
- Comparativa con equipo (anonimizada)
- Objetivo: >85% resolucion en plazo SLA

### Como funciona la asignacion de peritos?
1. El sistema busca peritos disponibles por zona y especialidad
2. Prioriza por valoracion y tiempo medio de respuesta
3. Si no hay disponibles, amplia radio de busqueda
4. En catastrofes, se activan peritos de refuerzo
Ver red de peritos: [[Peritos zona Valencia]], [[Proveedores de reparacion Madrid]].`
    },

    // 24. Normativa anti-blanqueo seguros
    {
      titulo: 'Normativa anti-blanqueo seguros',
      categoria: 'normativa',
      tags: 'blanqueo,normativa,PBC,SEPBLAC,legal',
      autor: 'ana.martinez',
      contenido: `# Normativa de Prevencion de Blanqueo de Capitales en Seguros

## Marco Legal
- Ley 10/2010 de PBC y FT (Prevencion del Blanqueo de Capitales y Financiacion del Terrorismo)
- Real Decreto 304/2014 - Reglamento de desarrollo
- Directiva (UE) 2015/849 (4a Directiva AML)

## Obligaciones de la Aseguradora

### Identificacion del Cliente (KYC)
- **Personas fisicas:** DNI/NIE + comprobacion de identidad
- **Personas juridicas:** CIF + escrituras + identificacion del titular real
- **PEPs (Personas Expuestas Politicamente):** Diligencia reforzada obligatoria

### Operaciones Sospechosas
Indicadores de alerta en el ambito asegurador:
- Contratacion de polizas con primas desproporcionadas al perfil
- Solicitud de rescate inmediato de seguros de vida
- Cambio frecuente de beneficiarios
- Pago de primas en efectivo por importes elevados
- Siniestros con indemnizaciones a terceros no justificados

### Comunicacion al SEPBLAC
- Comunicacion por indicio: cuando se detecta operacion sospechosa
- Comunicacion sistematica: operaciones >30.000 EUR
- Plazo: inmediato tras deteccion, maximo 24 horas

## Responsabilidades del Gestor
1. Verificar identidad del cliente en CADA interaccion relevante
2. Documentar fuente de fondos en primas elevadas
3. Reportar comportamientos inusuales al OCI (Organo de Control Interno)
4. Completar formacion anual obligatoria en PBC

## Complemento
Ver proteccion de datos en [[Normativa RGPD aplicada a seguros]].`
    },

    // 25. Caso resuelto accidente multiple AP7
    {
      titulo: 'Caso resuelto accidente multiple AP7',
      categoria: 'casos_resueltos',
      tags: 'accidente,multiple,AP7,Barcelona,vehiculos',
      autor: 'laura.vega',
      contenido: `# Caso: Accidente Multiple AP-7 Barcelona

## Datos del Caso
- **Expediente:** EXP-2024-0878
- **Tipo:** Auto - Colision multiple
- **Vehiculos implicados:** 3
- **Zona:** AP-7 km 150, Barcelona
- **Urgencia:** 10/10

## Descripcion
Colision en cadena en la autopista AP-7 a la altura de Barcelona. Un vehiculo freno bruscamente por un objeto en la calzada, provocando el alcance trasero de dos vehiculos mas. Resultado: 1 herido leve (cervicalgia), 3 vehiculos con danos de diversa consideracion.

## Gestion del Caso
1. **Minuto 0:** Parte recibido por llamada del primer conductor
2. **Minuto 2:** IA abre expediente con urgencia maxima, solicita servicios de emergencia
3. **Minuto 5:** Grua solicitada para 2 vehiculos (1 podia circular)
4. **Minuto 15:** Perito telefonica para evaluacion preliminar
5. **Dia 2:** Peritacion presencial de los 3 vehiculos
6. **Dia 5:** Acuerdo entre companias via CICOS
7. **Dia 12:** Indemnizaciones pagadas

## Valoracion de Danos
- **Vehiculo 1 (nuestro asegurado):** Paragolpes trasero + chasis - 4.800 EUR
- **Vehiculo 2:** Paragolpes delantero + trasero - 3.200 EUR (compania contraria)
- **Vehiculo 3:** Solo paragolpes delantero - 1.100 EUR (compania contraria)
- **Lesiones:** Cervicalgia vehiculo 2 - pendiente valoracion medica

## Lecciones
- La gestion via CICOS (convenio entre companias) acelero la resolucion
- Importancia de fotos inmediatas antes de mover vehiculos
- Ver calculo de danos en [[Calculo de indemnizacion vehiculos]]
- Protocolo de atencion detallado en [[Protocolo atencion telefonica IA]]`
    },

    // 26. Proceso de renovacion de polizas
    {
      titulo: 'Proceso de renovacion de polizas',
      categoria: 'procedimientos',
      tags: 'renovacion,polizas,proceso,vencimiento,retencion',
      autor: 'ana.martinez',
      contenido: `# Proceso de Renovacion de Polizas

## Timeline de Renovacion

### 60 dias antes del vencimiento
- Sistema genera lista de polizas proximas a vencer
- Analisis automatico de rentabilidad por poliza
- Identificacion de clientes en riesgo de fuga (score de retencion)

### 45 dias antes
- Envio de comunicacion informativa al cliente (email + app)
- Si score de retencion <60: contacto proactivo del gestor
- Propuesta de mejora de coberturas si aplica

### 30 dias antes
- Calculo de nueva prima con actualizacion de riesgos
- Si siniestralidad del cliente >70%: recargo o modificacion de condiciones
- Si siniestralidad <30%: bonificacion automatica
- Envio de propuesta formal de renovacion

### 15 dias antes
- Recordatorio si no hay respuesta
- Canal preferido del cliente (WhatsApp, email, telefono)
- Oferta especial de retencion si es cliente antiguo (>3 anos)

### Dia de vencimiento
- Renovacion automatica salvo comunicacion en contra
- Cobro de primera cuota
- Envio de nueva documentacion

## Metricas de Renovacion
- Tasa de renovacion objetivo: >88%
- Tiempo medio de gestion: <5 minutos por poliza
- Satisfaccion en renovacion: >4.0/5

## Productos Renovables
- [[Producto Auto Todo Riesgo]]
- [[Producto Auto Terceros Ampliado]]
- [[Producto Hogar Plus]]

## Casos Especiales
- Fallecimiento del titular: transferencia a heredero
- Cambio de vehiculo: sustitucion en poliza existente
- Mudanza: actualizacion de riesgo y posible cambio de prima`
    },

    // 27. Guia comunicacion con clientes
    {
      titulo: 'Guia comunicacion con clientes',
      categoria: 'formacion',
      tags: 'comunicacion,clientes,formacion,buenas-practicas,empatia',
      autor: 'roberto.diaz',
      contenido: `# Guia de Comunicacion con Clientes

## Principios Fundamentales
1. **Empatia primero:** El cliente esta pasando un mal momento
2. **Claridad:** Evitar jerga tecnica y legal
3. **Proactividad:** Informar antes de que pregunten
4. **Honestidad:** No prometer lo que no podemos cumplir

## Comunicacion por Canal

### Telefono
- Tono calido y profesional
- Escuchar activamente antes de hablar
- Resumir lo entendido: "Si le he entendido bien..."
- Dar siempre un numero de referencia y plazo de respuesta
- Ver protocolo detallado en [[Protocolo atencion telefonica IA]]

### WhatsApp
- Responder en <5 minutos (horario laboral)
- Usar mensajes cortos y claros
- Confirmar recepcion de fotos/documentos
- No usar abreviaturas ni emojis informales

### Email
- Asunto descriptivo con numero de expediente
- Estructura: saludo + resumen + accion + plazos + despedida
- Adjuntar siempre documento de referencia relevante

## Situaciones Dificiles

### Cliente enfadado
1. Dejar que se exprese sin interrumpir
2. Validar su frustacion: "Entiendo su malestar"
3. Enfocarse en la solucion, no en la causa
4. Ofrecer accion concreta con plazo

### Denegacion de cobertura
1. Explicar la razon con referencia a la poliza
2. Ofrecer alternativas si las hay
3. Informar del derecho a reclamar
4. Derivar a [[FAQ Clientes - Plazos de resolucion]] si aplica

### Comunicacion de indemnizacion
1. Presentar de forma clara el desglose
2. Explicar cada concepto
3. Dar plazo de aceptacion razonable (15 dias)
4. Informar del proceso si no esta de acuerdo`
    }
  ];

  // Insertar todas las notas
  for (const nota of notas) {
    const id = uuidv4();
    await dbRun(
      `INSERT INTO wiki_notas (id, titulo, contenido, categoria, tags, autor)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, nota.titulo, nota.contenido, nota.categoria, nota.tags, nota.autor]
    );
  }

  console.log(`Wiki: ${notas.length} notas de ejemplo insertadas`);

  // Ahora sincronizar todos los links
  const todasLasNotas = await dbAll('SELECT id, contenido FROM wiki_notas');
  for (const nota of todasLasNotas) {
    await sincronizarLinks(nota.id, nota.contenido);
  }

  const totalLinks = await dbGet('SELECT COUNT(*) as c FROM wiki_links');
  console.log(`Wiki: ${totalLinks.c} enlaces internos creados`);
}

// =============================================================================
// EXPORTS
// =============================================================================
module.exports = {
  crearNota,
  obtenerNota,
  actualizarNota,
  eliminarNota,
  buscar,
  listarNotas,
  getGrafo,
  getHistorial,
  getEstadisticas,
  consultarParaAgente,
  generarNotaDesdeSiniestro,
  seedWiki,
  CATEGORIAS
};
