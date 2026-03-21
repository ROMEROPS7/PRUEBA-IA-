const router = require('express').Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || './uploads'),
  filename: (req, file, cb) => cb(null, `${uuid()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext || mime);
  }
});

// GET /documentos?siniestro_id=
router.get('/', auth(), async (req, res) => {
  try {
    const { siniestro_id } = req.query;
    if (!siniestro_id) return res.status(400).json({ error: 'siniestro_id requerido' });
    const docs = await db('documentos').where('siniestro_id', siniestro_id).orderBy('created_at', 'desc');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

// POST /documentos - Subir documento
router.post('/', auth(), upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });
    const { siniestro_id, categoria } = req.body;
    if (!siniestro_id) return res.status(400).json({ error: 'siniestro_id requerido' });

    const doc = {
      id: uuid(),
      siniestro_id,
      subido_por: req.usuario.id,
      nombre: req.file.originalname,
      tipo_archivo: req.file.mimetype,
      categoria: categoria || 'otro',
      ruta_archivo: req.file.path,
      tamano_bytes: req.file.size,
      estado: 'recibido'
    };
    await db('documentos').insert(doc);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Error al subir documento' });
  }
});

module.exports = router;
