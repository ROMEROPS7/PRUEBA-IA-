// =============================================================================
// importService.js - Real data import service for SiniestrosAI
// Parses Excel/CSV files and inserts into SQLite via database/db.js
// =============================================================================

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const { dbRun, dbAll, dbGet } = require('../database/db');

// In-memory import history log
const importHistory = [];

// =============================================================================
// COLUMN MAPPING SYNONYMS
// =============================================================================
const COLUMN_SYNONYMS = {
  nombre: ['nombre', 'name', 'cliente', 'asegurado', 'titular', 'nombre_cliente', 'nombre_completo', 'razon_social'],
  telefono: ['telefono', 'phone', 'tel', 'movil', 'celular', 'tlf', 'tlfno', 'telefono_contacto', 'mobile'],
  email: ['email', 'correo', 'e-mail', 'mail', 'correo_electronico', 'email_contacto'],
  dni: ['dni', 'nif', 'documento', 'identificacion', 'cif', 'doc_identidad', 'numero_documento', 'id_fiscal'],
  direccion: ['direccion', 'address', 'domicilio', 'calle', 'direccion_postal', 'dir', 'ubicacion'],
  poliza: ['poliza', 'policy', 'numero_poliza', 'n_poliza', 'npoliza', 'num_poliza', 'poliza_numero', 'policy_number'],
  tipo_poliza: ['tipo_poliza', 'producto', 'ramo', 'tipo_seguro', 'modalidad', 'plan', 'cobertura'],
  tipo: ['tipo_siniestro', 'tipo', 'ramo_siniestro', 'categoria', 'class', 'type'],
  descripcion: ['descripcion', 'detalle', 'observaciones', 'comentario', 'notas', 'description', 'detalle_siniestro', 'comentarios'],
  fecha: ['fecha', 'date', 'fecha_siniestro', 'fecha_alta', 'fecha_registro', 'fecha_evento', 'fecha_ocurrencia'],
  urgencia: ['urgencia', 'prioridad', 'priority', 'nivel_urgencia', 'severidad'],
  importe: ['importe', 'cantidad', 'monto', 'amount', 'valor', 'valoracion', 'indemnizacion', 'cuantia', 'coste'],
  estado: ['estado', 'status', 'situacion', 'estado_actual'],
  notas: ['notas', 'nota', 'observacion', 'notes', 'comentario_adicional'],
};

// =============================================================================
// parseFile - Read .xlsx, .xls, or .csv and return structured data
// =============================================================================
function parseFile(filePath, fileType) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Archivo no encontrado: ${filePath}`);
  }

  const stat = fs.statSync(filePath);
  if (stat.size === 0) {
    throw new Error('El archivo esta vacio');
  }
  if (stat.size > 50 * 1024 * 1024) {
    throw new Error('El archivo excede el limite de 50MB');
  }

  let workbook;
  const ext = (fileType || path.extname(filePath)).toLowerCase().replace('.', '');

  if (ext === 'csv') {
    // Read raw buffer for encoding detection
    const rawBuffer = fs.readFileSync(filePath);
    let content;

    // Try UTF-8 first, fall back to Latin-1
    try {
      content = rawBuffer.toString('utf-8');
      // Check for replacement chars that indicate wrong encoding
      if (content.includes('\ufffd')) {
        content = rawBuffer.toString('latin1');
      }
    } catch {
      content = rawBuffer.toString('latin1');
    }

    // Auto-detect delimiter by counting occurrences in first line
    const firstLine = content.split('\n')[0] || '';
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;

    let delimiter = ',';
    if (semicolonCount > commaCount && semicolonCount >= tabCount) delimiter = ';';
    else if (tabCount > commaCount && tabCount >= semicolonCount) delimiter = '\t';

    workbook = XLSX.read(content, {
      type: 'string',
      FS: delimiter,
      raw: false,
      dateNF: 'yyyy-mm-dd',
    });
  } else {
    // xlsx or xls - read as binary
    const buffer = fs.readFileSync(filePath);
    workbook = XLSX.read(buffer, {
      type: 'buffer',
      raw: false,
      dateNF: 'yyyy-mm-dd',
      cellDates: true,
    });
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('El archivo no contiene hojas de datos');
  }

  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
    dateNF: 'yyyy-mm-dd',
  });

  if (jsonData.length === 0) {
    throw new Error('El archivo no contiene filas de datos');
  }

  // Extract headers from the first row keys
  const headers = Object.keys(jsonData[0]);

  // Clean up row data - trim strings
  const rows = jsonData.map(row => {
    const cleaned = {};
    for (const [key, value] of Object.entries(row)) {
      cleaned[key] = typeof value === 'string' ? value.trim() : value;
    }
    return cleaned;
  });

  const preview = rows.slice(0, 10);

  return {
    headers,
    rows,
    totalRows: rows.length,
    preview,
    sheetName,
    sheetsCount: workbook.SheetNames.length,
  };
}

// =============================================================================
// detectColumnMapping - Smart auto-mapping of column names
// =============================================================================
function detectColumnMapping(headers) {
  const mappings = {};
  const unmapped = [];
  let matchCount = 0;

  function normalize(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  for (const header of headers) {
    const normalizedHeader = normalize(header);

    // Two-pass: first try exact match, then fuzzy
    let bestMatch = null;
    let bestScore = 0; // 2 = exact, 1 = substring

    for (const [field, synonyms] of Object.entries(COLUMN_SYNONYMS)) {
      for (const synonym of synonyms) {
        const normalizedSynonym = normalize(synonym);

        if (normalizedHeader === normalizedSynonym) {
          // Exact match always wins
          if (bestScore < 2) {
            bestMatch = field;
            bestScore = 2;
          }
        } else if (bestScore < 1) {
          // Substring match only if no exact match found yet
          // Only match if the header contains the synonym AND they share significant length
          if (
            normalizedHeader.includes(normalizedSynonym) &&
            normalizedSynonym.length >= 4 &&
            normalizedSynonym.length >= normalizedHeader.length * 0.5
          ) {
            bestMatch = field;
            bestScore = 1;
          }
        }
      }
    }

    if (bestMatch) {
      mappings[header] = bestMatch;
      matchCount++;
    } else {
      unmapped.push(header);
    }
  }

  // Calculate confidence based on ratio of matched columns
  const confidence = headers.length > 0
    ? Math.round((matchCount / headers.length) * 100)
    : 0;

  return {
    mappings,
    unmapped,
    confidence,
    totalHeaders: headers.length,
    matchedHeaders: matchCount,
  };
}

// =============================================================================
// validateRow - Validate a single row against business rules
// =============================================================================
function validateRow(row, mapping, tipo) {
  const errors = [];
  const warnings = [];
  const cleanedData = {};

  // Build reversed mapping: siniestrosAIField -> uploadedColumn
  const reverseMapping = {};
  for (const [uploadedCol, aiField] of Object.entries(mapping)) {
    reverseMapping[aiField] = uploadedCol;
  }

  // Helper to get value from row using mapping
  function getValue(field) {
    const col = reverseMapping[field];
    if (!col) return undefined;
    const val = row[col];
    return val !== undefined && val !== null && String(val).trim() !== '' ? String(val).trim() : undefined;
  }

  // --- NOMBRE ---
  const nombre = getValue('nombre');
  if (tipo === 'clientes' || tipo === 'polizas') {
    if (!nombre) {
      errors.push('Campo "nombre" es obligatorio');
    } else if (nombre.length < 3) {
      errors.push('Campo "nombre" debe tener al menos 3 caracteres');
    } else {
      cleanedData.nombre = nombre;
    }
  } else if (nombre) {
    cleanedData.nombre = nombre;
  }

  // --- TELEFONO ---
  const telefono = getValue('telefono');
  if (tipo === 'clientes') {
    if (!telefono) {
      errors.push('Campo "telefono" es obligatorio');
    } else {
      const digitsOnly = telefono.replace(/[\s\-\+\(\)\.]/g, '');
      if (digitsOnly.length < 9) {
        errors.push('Campo "telefono" debe tener al menos 9 digitos');
      } else {
        // Store cleaned phone
        cleanedData.telefono = digitsOnly.startsWith('34') && digitsOnly.length > 11
          ? digitsOnly.substring(2)
          : digitsOnly;
      }
    }
  } else if (telefono) {
    const digitsOnly = telefono.replace(/[\s\-\+\(\)\.]/g, '');
    cleanedData.telefono = digitsOnly;
  }

  // --- EMAIL ---
  const email = getValue('email');
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      warnings.push(`Email "${email}" no tiene formato valido`);
    } else {
      cleanedData.email = email.toLowerCase();
    }
  }

  // --- DNI ---
  const dni = getValue('dni');
  if (dni) {
    const dniClean = dni.toUpperCase().replace(/[\s\-\.]/g, '');
    // Spanish DNI: 8 digits + letter
    const dniRegex = /^[0-9]{8}[A-Z]$/;
    // NIE: X/Y/Z + 7 digits + letter
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
    // CIF: letter + 8 digits
    const cifRegex = /^[A-HJNPQRSUVW][0-9]{8}$/;

    if (dniRegex.test(dniClean) || nieRegex.test(dniClean) || cifRegex.test(dniClean)) {
      cleanedData.dni = dniClean;
    } else {
      warnings.push(`DNI/NIE/CIF "${dni}" no tiene formato valido espanol`);
      cleanedData.dni = dniClean; // Store anyway, just warn
    }
  }

  // --- DIRECCION ---
  const direccion = getValue('direccion');
  if (direccion) {
    cleanedData.direccion = direccion;
  }

  // --- POLIZA ---
  const poliza = getValue('poliza');
  if (tipo === 'polizas' && !poliza) {
    errors.push('Campo "poliza" es obligatorio para importacion de polizas');
  } else if (poliza) {
    cleanedData.poliza = poliza;
  }

  // --- TIPO_POLIZA ---
  const tipoPoliza = getValue('tipo_poliza');
  if (tipoPoliza) {
    cleanedData.tipo_poliza = tipoPoliza;
  }

  // --- TIPO (siniestro type) ---
  const tipoSiniestro = getValue('tipo');
  if (tipo === 'siniestros') {
    if (!tipoSiniestro) {
      errors.push('Campo "tipo" es obligatorio para siniestros');
    } else {
      const tiposValidos = ['coche', 'hogar', 'salud', 'robo', 'otro'];
      const tipoNorm = tipoSiniestro.toLowerCase().trim();
      // Map common variants
      const tipoMap = {
        auto: 'coche', vehiculo: 'coche', automovil: 'coche', trafico: 'coche', car: 'coche',
        casa: 'hogar', vivienda: 'hogar', home: 'hogar', inmueble: 'hogar',
        medico: 'salud', health: 'salud', sanitario: 'salud',
        hurto: 'robo', theft: 'robo', sustraccion: 'robo',
        otros: 'otro', other: 'otro', misc: 'otro', varios: 'otro',
      };
      const mapped = tipoMap[tipoNorm] || tipoNorm;
      if (tiposValidos.includes(mapped)) {
        cleanedData.tipo = mapped;
      } else {
        warnings.push(`Tipo "${tipoSiniestro}" no reconocido, se asignara "otro"`);
        cleanedData.tipo = 'otro';
      }
    }
  }

  // --- DESCRIPCION ---
  const descripcion = getValue('descripcion');
  if (tipo === 'siniestros') {
    if (!descripcion) {
      errors.push('Campo "descripcion" es obligatorio para siniestros');
    } else {
      cleanedData.descripcion = descripcion;
    }
  } else if (descripcion) {
    cleanedData.descripcion = descripcion;
  }

  // --- FECHA ---
  const fecha = getValue('fecha');
  if (fecha) {
    // Try to parse various date formats
    const parsed = parseDate(fecha);
    if (parsed) {
      cleanedData.fecha = parsed;
    } else {
      warnings.push(`Fecha "${fecha}" no se pudo parsear, se usara fecha actual`);
      cleanedData.fecha = new Date().toISOString().split('T')[0];
    }
  }

  // --- URGENCIA ---
  const urgencia = getValue('urgencia');
  if (urgencia) {
    const urg = parseInt(urgencia, 10);
    if (isNaN(urg) || urg < 1 || urg > 10) {
      warnings.push(`Urgencia "${urgencia}" fuera de rango (1-10), se asignara 5`);
      cleanedData.urgencia = 5;
    } else {
      cleanedData.urgencia = urg;
    }
  }

  // --- IMPORTE ---
  const importe = getValue('importe');
  if (importe) {
    // Handle European number format (1.234,56) and standard (1234.56)
    let importeClean = importe.replace(/[€$\s]/g, '');
    // If has comma as decimal separator (European format)
    if (/^\d{1,3}(\.\d{3})*(,\d{1,2})?$/.test(importeClean)) {
      importeClean = importeClean.replace(/\./g, '').replace(',', '.');
    } else {
      importeClean = importeClean.replace(/,/g, '');
    }
    const num = parseFloat(importeClean);
    if (isNaN(num)) {
      warnings.push(`Importe "${importe}" no es un numero valido`);
    } else {
      cleanedData.importe = Math.round(num * 100) / 100;
    }
  }

  // --- ESTADO ---
  const estado = getValue('estado');
  if (estado) {
    const estadosValidos = ['Abierto', 'En gestion', 'Perito asignado', 'Resuelto', 'Cerrado', 'Fraude'];
    const estadoMap = {
      abierto: 'Abierto', open: 'Abierto', nuevo: 'Abierto',
      'en gestion': 'En gestion', gestion: 'En gestion', 'in progress': 'En gestion', procesando: 'En gestion',
      'perito asignado': 'Perito asignado', peritaje: 'Perito asignado', perito: 'Perito asignado',
      resuelto: 'Resuelto', resolved: 'Resuelto', solucionado: 'Resuelto',
      cerrado: 'Cerrado', closed: 'Cerrado', finalizado: 'Cerrado',
      fraude: 'Fraude', fraud: 'Fraude',
    };
    const mappedEstado = estadoMap[estado.toLowerCase().trim()];
    if (mappedEstado) {
      cleanedData.estado = mappedEstado;
    } else {
      warnings.push(`Estado "${estado}" no reconocido, se asignara "Abierto"`);
      cleanedData.estado = 'Abierto';
    }
  }

  // --- NOTAS ---
  const notas = getValue('notas');
  if (notas) {
    cleanedData.notas = notas;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    cleanedData,
  };
}

// =============================================================================
// Date parsing helper
// =============================================================================
function parseDate(dateStr) {
  if (!dateStr) return null;

  const str = String(dateStr).trim();

  // ISO format: 2024-01-15 or 2024-01-15T10:30:00
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  // DD/MM/YYYY or DD-MM-YYYY (European format)
  const euMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (euMatch) {
    const [, day, month, year] = euMatch;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  // MM/DD/YYYY (US format) - only if month <= 12 and day > 12
  const usMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (usMatch) {
    const [, first, second, year] = usMatch;
    if (parseInt(first) <= 12 && parseInt(second) > 12) {
      const d = new Date(parseInt(year), parseInt(first) - 1, parseInt(second));
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
  }

  // DD/MM/YY
  const shortMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/);
  if (shortMatch) {
    const [, day, month, shortYear] = shortMatch;
    const year = parseInt(shortYear) > 50 ? 1900 + parseInt(shortYear) : 2000 + parseInt(shortYear);
    const d = new Date(year, parseInt(month) - 1, parseInt(day));
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  // Try native Date parse as last resort
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];

  return null;
}

// =============================================================================
// importClientes - Import client records into the clientes table
// =============================================================================
async function importClientes(filePath, mapping, options = {}) {
  const startTime = Date.now();
  const duplicateMode = options.duplicados || 'skip'; // skip | overwrite | merge
  let importados = 0;
  let rechazados = 0;
  let duplicados = 0;
  const errores = [];

  const { rows } = parseFile(filePath);

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // +2 because row 1 is header, data starts at 2
    const row = rows[i];

    const validation = validateRow(row, mapping, 'clientes');

    if (!validation.valid) {
      rechazados++;
      for (const err of validation.errors) {
        errores.push({ fila: rowNum, campo: err.split('"')[1] || 'general', error: err });
      }
      continue;
    }

    const data = validation.cleanedData;

    // Check for duplicate by poliza or DNI
    let existingClient = null;
    if (data.poliza) {
      existingClient = await dbGet('SELECT id FROM clientes WHERE poliza = ?', [data.poliza]);
    }
    if (!existingClient && data.dni) {
      existingClient = await dbGet('SELECT id FROM clientes WHERE dni = ?', [data.dni]);
    }
    if (!existingClient && data.telefono) {
      existingClient = await dbGet('SELECT id FROM clientes WHERE telefono = ?', [data.telefono]);
    }

    if (existingClient) {
      duplicados++;
      if (duplicateMode === 'skip') {
        continue;
      } else if (duplicateMode === 'overwrite') {
        try {
          const setClauses = [];
          const setValues = [];
          for (const [key, val] of Object.entries(data)) {
            if (val !== undefined && val !== null) {
              setClauses.push(`${key} = ?`);
              setValues.push(val);
            }
          }
          if (setClauses.length > 0) {
            setValues.push(existingClient.id);
            await dbRun(
              `UPDATE clientes SET ${setClauses.join(', ')} WHERE id = ?`,
              setValues
            );
            importados++;
          }
        } catch (err) {
          rechazados++;
          errores.push({ fila: rowNum, campo: 'database', error: err.message });
        }
      } else if (duplicateMode === 'merge') {
        // Merge: only update empty fields
        try {
          const existing = await dbGet('SELECT * FROM clientes WHERE id = ?', [existingClient.id]);
          const setClauses = [];
          const setValues = [];
          for (const [key, val] of Object.entries(data)) {
            if (val !== undefined && val !== null && (!existing[key] || existing[key] === '')) {
              setClauses.push(`${key} = ?`);
              setValues.push(val);
            }
          }
          if (setClauses.length > 0) {
            setValues.push(existingClient.id);
            await dbRun(
              `UPDATE clientes SET ${setClauses.join(', ')} WHERE id = ?`,
              setValues
            );
          }
          importados++;
        } catch (err) {
          rechazados++;
          errores.push({ fila: rowNum, campo: 'database', error: err.message });
        }
      }
    } else {
      // Insert new client
      try {
        const id = `CLI-${uuidv4().split('-')[0].toUpperCase()}`;
        await dbRun(
          `INSERT INTO clientes (id, nombre, telefono, email, dni, direccion, poliza, tipo_poliza, notas)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            data.nombre || null,
            data.telefono || null,
            data.email || null,
            data.dni || null,
            data.direccion || null,
            data.poliza || null,
            data.tipo_poliza || null,
            data.notas || null,
          ]
        );
        importados++;
      } catch (err) {
        rechazados++;
        if (err.message.includes('UNIQUE constraint failed')) {
          duplicados++;
          errores.push({ fila: rowNum, campo: 'poliza/dni', error: 'Registro duplicado' });
        } else {
          errores.push({ fila: rowNum, campo: 'database', error: err.message });
        }
      }
    }
  }

  const result = {
    importados,
    rechazados,
    duplicados,
    total: rows.length,
    errores: errores.slice(0, 100), // Limit error list
    tiempo_ms: Date.now() - startTime,
  };

  // Log to history
  importHistory.push({
    id: uuidv4(),
    tipo: 'clientes',
    archivo: path.basename(filePath),
    fecha: new Date().toISOString(),
    resultado: result,
    usuario: options.usuario || 'sistema',
  });

  return result;
}

// =============================================================================
// importSiniestros - Import claims into the siniestros table
// =============================================================================
async function importSiniestros(filePath, mapping, options = {}) {
  const startTime = Date.now();
  const duplicateMode = options.duplicados || 'skip';
  let importados = 0;
  let rechazados = 0;
  let duplicados = 0;
  const errores = [];

  const { rows } = parseFile(filePath);

  // Get the next expediente number
  const lastExp = await dbGet(
    "SELECT expediente FROM siniestros ORDER BY fecha_creacion DESC LIMIT 1"
  );
  let expCounter = 1;
  if (lastExp && lastExp.expediente) {
    const match = lastExp.expediente.match(/(\d+)$/);
    if (match) expCounter = parseInt(match[1]) + 1;
  }

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2;
    const row = rows[i];

    const validation = validateRow(row, mapping, 'siniestros');

    if (!validation.valid) {
      rechazados++;
      for (const err of validation.errors) {
        errores.push({ fila: rowNum, campo: err.split('"')[1] || 'general', error: err });
      }
      continue;
    }

    const data = validation.cleanedData;

    // Try to link to existing client by poliza or DNI
    let clienteId = null;
    if (data.poliza) {
      const cli = await dbGet('SELECT id FROM clientes WHERE poliza = ?', [data.poliza]);
      if (cli) clienteId = cli.id;
    }
    if (!clienteId && data.dni) {
      const cli = await dbGet('SELECT id FROM clientes WHERE dni = ?', [data.dni]);
      if (cli) clienteId = cli.id;
    }
    if (!clienteId && data.nombre) {
      const cli = await dbGet('SELECT id FROM clientes WHERE nombre = ?', [data.nombre]);
      if (cli) clienteId = cli.id;
    }

    if (!clienteId) {
      // Create a placeholder client if we have enough info
      if (data.nombre && data.telefono) {
        clienteId = `CLI-${uuidv4().split('-')[0].toUpperCase()}`;
        try {
          await dbRun(
            `INSERT INTO clientes (id, nombre, telefono, email, dni, poliza, tipo_poliza)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [clienteId, data.nombre, data.telefono, data.email || null,
             data.dni || null, data.poliza || null, data.tipo_poliza || null]
          );
        } catch {
          // If client insert fails (e.g. duplicate poliza), try to find again
          if (data.poliza) {
            const cli = await dbGet('SELECT id FROM clientes WHERE poliza = ?', [data.poliza]);
            if (cli) clienteId = cli.id;
          }
          if (!clienteId) {
            rechazados++;
            errores.push({ fila: rowNum, campo: 'cliente', error: 'No se pudo vincular o crear cliente' });
            continue;
          }
        }
      } else {
        rechazados++;
        errores.push({
          fila: rowNum,
          campo: 'cliente',
          error: 'No se encontro cliente vinculado. Proporcione poliza, DNI, o nombre+telefono',
        });
        continue;
      }
    }

    // Generate expediente number
    const expediente = `EXP-${new Date().getFullYear()}-${String(expCounter).padStart(4, '0')}`;
    expCounter++;

    const siniestroId = `SIN-${uuidv4().split('-')[0].toUpperCase()}`;

    try {
      await dbRun(
        `INSERT INTO siniestros (id, expediente, cliente_id, tipo, descripcion, estado, urgencia,
         direccion, valoracion, indemnizacion, fecha_creacion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          siniestroId,
          expediente,
          clienteId,
          data.tipo || 'otro',
          data.descripcion || 'Importado desde archivo',
          data.estado || 'Abierto',
          data.urgencia || 5,
          data.direccion || null,
          data.importe || null,
          data.importe || null,
          data.fecha || new Date().toISOString(),
        ]
      );

      // Create timeline entry
      await dbRun(
        `INSERT INTO expedientes (id, siniestro_id, tipo_evento, descripcion)
         VALUES (?, ?, ?, ?)`,
        [uuidv4(), siniestroId, 'creacion', `Siniestro importado desde archivo: ${path.basename(filePath)}`]
      );

      importados++;
    } catch (err) {
      rechazados++;
      if (err.message.includes('UNIQUE constraint failed')) {
        duplicados++;
        errores.push({ fila: rowNum, campo: 'expediente', error: 'Expediente duplicado' });
      } else {
        errores.push({ fila: rowNum, campo: 'database', error: err.message });
      }
    }
  }

  const result = {
    importados,
    rechazados,
    duplicados,
    total: rows.length,
    errores: errores.slice(0, 100),
    tiempo_ms: Date.now() - startTime,
  };

  importHistory.push({
    id: uuidv4(),
    tipo: 'siniestros',
    archivo: path.basename(filePath),
    fecha: new Date().toISOString(),
    resultado: result,
    usuario: options.usuario || 'sistema',
  });

  return result;
}

// =============================================================================
// importPolizas - Import policy data, linking to existing clients
// =============================================================================
async function importPolizas(filePath, mapping, options = {}) {
  const startTime = Date.now();
  const duplicateMode = options.duplicados || 'skip';
  let importados = 0;
  let rechazados = 0;
  let duplicados = 0;
  const errores = [];

  const { rows } = parseFile(filePath);

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2;
    const row = rows[i];

    const validation = validateRow(row, mapping, 'polizas');

    if (!validation.valid) {
      rechazados++;
      for (const err of validation.errors) {
        errores.push({ fila: rowNum, campo: err.split('"')[1] || 'general', error: err });
      }
      continue;
    }

    const data = validation.cleanedData;

    // Check if client already exists by DNI or name+phone
    let existingClient = null;
    if (data.dni) {
      existingClient = await dbGet('SELECT id, poliza FROM clientes WHERE dni = ?', [data.dni]);
    }
    if (!existingClient && data.telefono) {
      existingClient = await dbGet('SELECT id, poliza FROM clientes WHERE telefono = ?', [data.telefono]);
    }
    if (!existingClient && data.nombre) {
      existingClient = await dbGet('SELECT id, poliza FROM clientes WHERE nombre = ?', [data.nombre]);
    }

    // Check for duplicate poliza
    const existingPoliza = await dbGet('SELECT id FROM clientes WHERE poliza = ?', [data.poliza]);
    if (existingPoliza) {
      duplicados++;
      if (duplicateMode === 'skip') {
        continue;
      } else if (duplicateMode === 'overwrite') {
        try {
          const setClauses = [];
          const setValues = [];
          for (const [key, val] of Object.entries(data)) {
            if (val !== undefined && val !== null) {
              setClauses.push(`${key} = ?`);
              setValues.push(val);
            }
          }
          if (setClauses.length > 0) {
            setValues.push(existingPoliza.id);
            await dbRun(`UPDATE clientes SET ${setClauses.join(', ')} WHERE id = ?`, setValues);
            importados++;
          }
        } catch (err) {
          rechazados++;
          errores.push({ fila: rowNum, campo: 'database', error: err.message });
        }
        continue;
      }
    }

    if (existingClient) {
      // Update existing client with poliza info
      try {
        const setClauses = ['poliza = ?'];
        const setValues = [data.poliza];
        if (data.tipo_poliza) {
          setClauses.push('tipo_poliza = ?');
          setValues.push(data.tipo_poliza);
        }
        if (data.direccion && !existingClient.direccion) {
          setClauses.push('direccion = ?');
          setValues.push(data.direccion);
        }
        setValues.push(existingClient.id);
        await dbRun(`UPDATE clientes SET ${setClauses.join(', ')} WHERE id = ?`, setValues);
        importados++;
      } catch (err) {
        rechazados++;
        errores.push({ fila: rowNum, campo: 'database', error: err.message });
      }
    } else {
      // Create new client with poliza
      try {
        const id = `CLI-${uuidv4().split('-')[0].toUpperCase()}`;
        await dbRun(
          `INSERT INTO clientes (id, nombre, telefono, email, dni, direccion, poliza, tipo_poliza)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            data.nombre || null,
            data.telefono || null,
            data.email || null,
            data.dni || null,
            data.direccion || null,
            data.poliza,
            data.tipo_poliza || null,
          ]
        );
        importados++;
      } catch (err) {
        rechazados++;
        if (err.message.includes('UNIQUE constraint failed')) {
          duplicados++;
          errores.push({ fila: rowNum, campo: 'poliza', error: 'Poliza duplicada' });
        } else {
          errores.push({ fila: rowNum, campo: 'database', error: err.message });
        }
      }
    }
  }

  const result = {
    importados,
    rechazados,
    duplicados,
    total: rows.length,
    errores: errores.slice(0, 100),
    tiempo_ms: Date.now() - startTime,
  };

  importHistory.push({
    id: uuidv4(),
    tipo: 'polizas',
    archivo: path.basename(filePath),
    fecha: new Date().toISOString(),
    resultado: result,
    usuario: options.usuario || 'sistema',
  });

  return result;
}

// =============================================================================
// getImportHistory - Return history of all imports
// =============================================================================
function getImportHistory() {
  return importHistory.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

// =============================================================================
// generateSampleExcel - Create downloadable template Excel files
// =============================================================================
function generateSampleExcel(tipo) {
  let headers;
  let sampleRows;

  switch (tipo) {
    case 'clientes':
      headers = ['nombre', 'telefono', 'email', 'dni', 'direccion', 'poliza', 'tipo_poliza', 'notas'];
      sampleRows = [
        ['Maria Garcia Lopez', '612345678', 'maria@email.com', '12345678A', 'Calle Gran Via 42, Madrid', 'POL-2024-00100', 'Todo riesgo', 'Cliente VIP'],
        ['Carlos Fernandez Ruiz', '634567890', 'carlos@email.com', '23456789B', 'Calle Aragon 234, Barcelona', 'POL-2024-00101', 'Hogar Plus', ''],
        ['Laura Mendez Torres', '678901234', 'laura@email.com', '34567890C', 'Av. del Puerto 89, Valencia', 'POL-2024-00102', 'Comercio', 'Empresa'],
      ];
      break;

    case 'siniestros':
      headers = ['poliza', 'tipo', 'descripcion', 'urgencia', 'fecha', 'direccion', 'importe', 'estado'];
      sampleRows = [
        ['POL-2024-00100', 'coche', 'Colision frontal en autovia. Airbags activados.', '8', '2024-03-15', 'M-30 km 7, Madrid', '5200.50', 'Abierto'],
        ['POL-2024-00101', 'hogar', 'Inundacion por rotura de tuberia principal.', '7', '2024-03-16', 'Calle Aragon 234, Barcelona', '3800', 'En gestion'],
        ['POL-2024-00102', 'robo', 'Robo con fuerza en local comercial.', '9', '2024-03-17', 'Av. del Puerto 89, Valencia', '12000', 'Abierto'],
      ];
      break;

    case 'polizas':
      headers = ['nombre', 'telefono', 'email', 'dni', 'direccion', 'poliza', 'tipo_poliza'];
      sampleRows = [
        ['Maria Garcia Lopez', '612345678', 'maria@email.com', '12345678A', 'Calle Gran Via 42, Madrid', 'POL-2024-00200', 'Todo riesgo'],
        ['Carlos Fernandez Ruiz', '634567890', 'carlos@email.com', '23456789B', 'Calle Aragon 234, Barcelona', 'POL-2024-00201', 'Hogar Plus'],
        ['Ana Martinez Diaz', '645678901', 'ana@email.com', '45678901D', 'Calle Serrano 15, Madrid', 'POL-2024-00202', 'Salud Premium'],
      ];
      break;

    default:
      throw new Error(`Tipo de plantilla no valido: ${tipo}. Use: clientes, siniestros, polizas`);
  }

  const wsData = [headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 5, 15) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Plantilla_${tipo}`);

  // Write to buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

// =============================================================================
// EXPORTS
// =============================================================================
module.exports = {
  parseFile,
  detectColumnMapping,
  validateRow,
  importClientes,
  importSiniestros,
  importPolizas,
  getImportHistory,
  generateSampleExcel,
};
