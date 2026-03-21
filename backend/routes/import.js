// =============================================================================
// routes/import.js - Express router for data import endpoints
// =============================================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verificarToken } = require('../middleware/auth');
const importService = require('../services/importService');

// Ensure uploads/imports directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'imports');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls', '.csv'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no soportado. Use .xlsx, .xls o .csv'), false);
    }
  },
});

// =============================================================================
// POST /api/import/preview - Upload and preview file (don't import yet)
// =============================================================================
router.post('/preview', verificarToken, upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibio ningun archivo' });
    }

    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase();

    // Parse the file
    const parsed = importService.parseFile(filePath, fileType);

    // Auto-detect column mapping
    const mapping = importService.detectColumnMapping(parsed.headers);

    // Validate first few rows as preview
    const tipo = req.body.tipo || 'clientes';
    const previewValidation = parsed.preview.map((row, idx) => {
      const result = importService.validateRow(row, mapping.mappings, tipo);
      return {
        fila: idx + 2,
        ...result,
      };
    });

    const validCount = previewValidation.filter(v => v.valid).length;

    res.json({
      archivo: {
        nombre: req.file.originalname,
        tamano: `${(req.file.size / 1024).toFixed(1)} KB`,
        tipo: fileType.replace('.', ''),
        hoja: parsed.sheetName,
        totalHojas: parsed.sheetsCount,
      },
      datos: {
        totalFilas: parsed.totalRows,
        columnas: parsed.headers,
        preview: parsed.preview,
      },
      mapping: {
        auto: mapping.mappings,
        sinMapear: mapping.unmapped,
        confianza: mapping.confidence,
      },
      validacion: {
        preview: previewValidation,
        validasEnPreview: validCount,
        totalPreview: previewValidation.length,
      },
      // Return the temp file path so the execute endpoint can use it
      _tempPath: filePath,
    });
  } catch (err) {
    // Clean up temp file on error
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    res.status(400).json({ error: err.message });
  }
});

// =============================================================================
// POST /api/import/ejecutar - Execute import after preview confirmed
// =============================================================================
router.post('/ejecutar', verificarToken, upload.single('archivo'), async (req, res) => {
  let filePath = null;

  try {
    const tipo = req.body.tipo;
    if (!tipo || !['clientes', 'siniestros', 'polizas'].includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo de importacion invalido. Use: clientes, siniestros, polizas',
      });
    }

    // Use uploaded file or tempPath from preview
    if (req.file) {
      filePath = req.file.path;
    } else if (req.body.tempPath && fs.existsSync(req.body.tempPath)) {
      filePath = req.body.tempPath;
    } else {
      return res.status(400).json({ error: 'No se recibio archivo para importar' });
    }

    const fileType = req.file
      ? path.extname(req.file.originalname).toLowerCase()
      : undefined;

    // Parse mapping from request body or auto-detect
    let mapping;
    if (req.body.mapping) {
      try {
        mapping = typeof req.body.mapping === 'string'
          ? JSON.parse(req.body.mapping)
          : req.body.mapping;
      } catch {
        return res.status(400).json({ error: 'Mapping JSON invalido' });
      }
    } else {
      const parsed = importService.parseFile(filePath, fileType);
      const detected = importService.detectColumnMapping(parsed.headers);
      mapping = detected.mappings;
    }

    const options = {
      duplicados: req.body.duplicados || 'skip',
      usuario: req.usuario ? req.usuario.nombre || req.usuario.email : 'sistema',
    };

    let result;
    switch (tipo) {
      case 'clientes':
        result = await importService.importClientes(filePath, mapping, options);
        break;
      case 'siniestros':
        result = await importService.importSiniestros(filePath, mapping, options);
        break;
      case 'polizas':
        result = await importService.importPolizas(filePath, mapping, options);
        break;
    }

    // Clean up temp file after import
    try { fs.unlinkSync(filePath); } catch {}

    res.json({
      exito: true,
      tipo,
      resultado: result,
    });
  } catch (err) {
    // Clean up temp file on error
    if (filePath) {
      try { fs.unlinkSync(filePath); } catch {}
    }
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// GET /api/import/plantilla/:tipo - Download sample Excel template
// =============================================================================
router.get('/plantilla/:tipo', (req, res) => {
  try {
    const tipo = req.params.tipo;
    if (!['clientes', 'siniestros', 'polizas'].includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo invalido. Use: clientes, siniestros, polizas',
      });
    }

    const buffer = importService.generateSampleExcel(tipo);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=plantilla_${tipo}.xlsx`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// GET /api/import/historial - Import history
// =============================================================================
router.get('/historial', verificarToken, (req, res) => {
  try {
    const history = importService.getImportHistory();
    res.json({
      total: history.length,
      historial: history,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// Error handler for multer
// =============================================================================
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo excede el limite de 50MB' });
    }
    return res.status(400).json({ error: `Error de subida: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
