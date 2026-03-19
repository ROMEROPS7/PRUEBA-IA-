require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const multer = require('multer');

const { initDatabase, seedDatabase } = require('./database/db');
const { tokenOpcional } = require('./middleware/auth');

// Rutas
const authRoutes = require('./routes/auth');
const siniestrosRoutes = require('./routes/siniestros');
const clientesRoutes = require('./routes/clientes');
const metricasRoutes = require('./routes/metricas');
const agentesRoutes = require('./routes/agentes');

// Servicios
const whatsappService = require('./services/whatsappService');
const voiceService = require('./services/voiceService');
const fraudeService = require('./services/fraudeService');
const mainAgent = require('./agents/mainAgent');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Uploads con multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const permitidos = /jpeg|jpg|png|gif|webp|pdf|doc|docx|zip/;
    const ext = permitidos.test(path.extname(file.originalname).toLowerCase());
    const mime = permitidos.test(file.mimetype);
    cb(null, ext || mime);
  },
});

// Hacer io accesible en rutas
app.set('io', io);

// ============================================================
// RUTAS API
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/siniestros', siniestrosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/metricas', metricasRoutes);
app.use('/api/agentes', agentesRoutes);

// Upload de archivos
app.post('/api/upload', tokenOpcional, upload.array('archivos', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No se recibieron archivos' });
  }
  const archivos = req.files.map(f => ({
    nombre: f.originalname,
    ruta: f.filename,
    tamano: `${(f.size / 1024).toFixed(0)} KB`,
    tipo: f.mimetype,
  }));
  res.json({ archivos });
});

// Anti-fraude endpoint
app.post('/api/fraude/analizar/:siniestroId', tokenOpcional, async (req, res) => {
  try {
    const resultado = await fraudeService.analizarSiniestro(req.params.siniestroId);
    io.emit('fraude:analisis', resultado);
    res.json(resultado);
  } catch (err) {
    console.error('Error analisis fraude:', err);
    res.status(500).json({ error: err.message });
  }
});

// Agente IA endpoints
app.post('/api/agente/clasificar/:siniestroId', tokenOpcional, async (req, res) => {
  try {
    const resultado = await mainAgent.clasificarSiniestro(req.params.siniestroId);
    io.emit('agente:clasificacion', resultado);
    res.json(resultado);
  } catch (err) {
    console.error('Error clasificacion IA:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agente/consultar', tokenOpcional, async (req, res) => {
  try {
    const { prompt, contexto } = req.body;
    const respuesta = await mainAgent.consultar(prompt, contexto);
    res.json({ respuesta });
  } catch (err) {
    console.error('Error consulta IA:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agente/resumen/:siniestroId', tokenOpcional, async (req, res) => {
  try {
    const resumen = await mainAgent.generarResumen(req.params.siniestroId);
    res.json(resumen);
  } catch (err) {
    console.error('Error resumen:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agente/chat/:siniestroId', tokenOpcional, async (req, res) => {
  try {
    const { mensaje, usuario } = req.body;
    const respuesta = await mainAgent.procesarChat(req.params.siniestroId, mensaje, usuario || 'Usuario');
    io.emit('chat:respuesta', { siniestroId: req.params.siniestroId, respuesta });
    res.json({ respuesta });
  } catch (err) {
    console.error('Error chat IA:', err);
    res.status(500).json({ error: err.message });
  }
});

// Webhooks Twilio
app.post('/api/whatsapp/webhook', (req, res) => whatsappService.handleWebhook(req, res));
app.post('/api/voz/entrante', (req, res) => voiceService.handleLlamadaEntrante(req, res));
app.post('/api/voz/procesar-input', (req, res) => voiceService.handleProcesarInput(req, res));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    servicios: {
      database: 'conectada',
      websockets: io.engine?.clientsCount || 0,
      agente_ia: 'activo',
      antifraude: 'activo',
    },
  });
});

// Servir frontend (archivos estaticos del directorio padre)
app.use(express.static(path.join(__dirname, '..')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ============================================================
// WEBSOCKETS
// ============================================================
io.on('connection', (socket) => {
  console.log(`[WS] Cliente conectado: ${socket.id}`);

  socket.on('siniestro:nuevo', async (data) => {
    io.emit('siniestro:creado', data);
    io.emit('feed:actividad', {
      agente: 'Recepcionista',
      texto: `Nuevo siniestro registrado: ${data.expediente || 'Procesando...'}`,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('siniestro:actualizar', (data) => {
    io.emit('siniestro:actualizado', data);
  });

  socket.on('chat:mensaje', async (data) => {
    const { siniestroId, mensaje, usuario } = data;
    io.emit('chat:mensaje', data);

    // Respuesta IA automatica
    try {
      const respuesta = await mainAgent.procesarChat(siniestroId, mensaje, usuario);
      io.emit('chat:respuesta', { siniestroId, respuesta, usuario: 'Agente IA' });
    } catch (err) {
      console.error('Error chat WS:', err);
    }
  });

  socket.on('agente:actividad', (data) => {
    io.emit('feed:actividad', data);
  });

  socket.on('disconnect', () => {
    console.log(`[WS] Cliente desconectado: ${socket.id}`);
  });
});

// Simulacion de actividad IA en tiempo real
setInterval(() => {
  const actividades = [
    { agente: 'Anti-Fraude', texto: `Expediente analizado. Score: ${Math.floor(Math.random() * 30)}/100` },
    { agente: 'Recepcionista', texto: 'Llamada atendida automaticamente en 1.2 seg' },
    { agente: 'Clasificador', texto: 'Siniestro auto-clasificado por IA' },
    { agente: 'Documentalista', texto: 'Documentos verificados con OCR' },
    { agente: 'Perito', texto: `Valoracion completada: ${(Math.random() * 5000 + 500).toFixed(0)} EUR` },
    { agente: 'Seguimiento', texto: 'SMS de actualizacion enviado al cliente' },
  ];
  const act = actividades[Math.floor(Math.random() * actividades.length)];
  io.emit('feed:actividad', { ...act, timestamp: new Date().toISOString() });
}, 15000);

// ============================================================
// INICIALIZACION
// ============================================================
const PORT = process.env.PORT || 3001;

async function start() {
  try {
    // Crear directorio de uploads
    const fs = require('fs');
    const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // Inicializar base de datos
    await initDatabase();
    await seedDatabase();

    server.listen(PORT, () => {
      console.log('');
      console.log('============================================');
      console.log('  SiniestrosAI Backend v1.0.0');
      console.log('============================================');
      console.log(`  Servidor:    http://localhost:${PORT}`);
      console.log(`  API:         http://localhost:${PORT}/api`);
      console.log(`  Health:      http://localhost:${PORT}/api/health`);
      console.log(`  WebSockets:  ws://localhost:${PORT}`);
      console.log(`  Entorno:     ${process.env.NODE_ENV || 'development'}`);
      console.log('============================================');
      console.log('');
    });
  } catch (err) {
    console.error('Error iniciando servidor:', err);
    process.exit(1);
  }
}

start();

module.exports = { app, server, io };
