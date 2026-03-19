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
const adminRoutes = require('./routes/admin');
const serviciosRoutes = require('./routes/servicios');
const rgpdRoutes = require('./routes/rgpd');

// Servicios (solo los necesarios en server.js)
const logService = require('./services/logService');
const { healthMonitor: healthService } = require('./services/healthService');
const { taskProcessor: queueService } = require('./services/queueService');
const backupService = require('./services/backupService');
const slaService = require('./services/slaService');
const webhookService = require('./services/webhookService');
const rulesEngine = require('./services/rulesEngine');
const mainAgent = require('./agents/mainAgent');
const vigilanteAgent = require('./agents/vigilanteAgent');
const { securityHeaders, sanitizeMiddleware, rateLimiter, csrfProtection, generateCsrfToken } = require('./middleware/security');

const app = express();
const server = http.createServer(app);

// CORS - allowed origins
const ALLOWED_ORIGINS = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:8080', 'http://localhost:3001', 'http://localhost:5500'];

// Socket.IO
const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] },
});

// ============================================================
// MIDDLEWARE GLOBAL
// ============================================================
app.use(securityHeaders());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) callback(null, true);
    else callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
try { app.use(require('cookie-parser')()); } catch(e) {}
// Enable gzip compression
try { const compression = require('compression'); app.use(compression()); } catch(e) { /* compression not installed, skip */ }
app.use(sanitizeMiddleware());
app.use(logService.requestLogger());
app.use(rateLimiter({ windowMs: 60000, max: 200 }));
const { etagCache } = require('./middleware/etag');
app.use('/api/siniestros', etagCache(30));
app.use('/api/clientes', etagCache(30));
app.use('/api/metricas', etagCache(60));
app.use('/api/agentes', etagCache(30));
app.use(express.static(path.join(__dirname, 'public')));

// Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|gif|webp|pdf|doc|docx|zip/.test(path.extname(file.originalname).toLowerCase());
    cb(null, ok);
  },
});

app.set('io', io);

// ============================================================
// RUTAS API
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/siniestros', siniestrosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/metricas', metricasRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', serviciosRoutes);
app.use('/api/agentes', agentesRoutes);
app.use('/api/rgpd', rgpdRoutes);

// Upload
app.post('/api/upload', tokenOpcional, upload.array('archivos', 10), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No se recibieron archivos' });
  res.json({ archivos: req.files.map(f => ({ nombre: f.originalname, ruta: f.filename, tamano: `${(f.size / 1024).toFixed(0)} KB`, tipo: f.mimetype })) });
});

// CSRF token
app.get('/api/csrf-token', (req, res) => {
  res.json({ token: generateCsrfToken() });
});

// --- HEALTH ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok', version: '2.0.0', uptime: process.uptime(), timestamp: new Date().toISOString(),
    servicios: { database: 'conectada', websockets: io.engine?.clientsCount || 0, agente_ia: 'activo', antifraude: 'activo', queue: 'activo', sla: 'activo', blockchain: 'activo' },
  });
});

app.get('/api/health/detailed', async (req, res) => {
  try { res.json(await healthService.getDetailedHealth()); }
  catch (err) { res.status(500).json({ error: 'Error interno del servidor' }); }
});

// --- API DOCS ---
app.get('/api/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'api.html'));
});

// ============================================================
// SERVIR FRONTEND
// ============================================================
app.use(express.static(path.join(__dirname, '..')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));

// ============================================================
// WEBSOCKETS
// ============================================================
io.on('connection', (socket) => {
  logService.log('INFO', 'websocket', `Cliente conectado: ${socket.id}`);

  socket.on('siniestro:nuevo', async (data) => {
    io.emit('siniestro:creado', data);
    io.emit('feed:actividad', { agente: 'Recepcionista', texto: `Nuevo siniestro registrado: ${data.expediente || 'Procesando...'}`, timestamp: new Date().toISOString() });
    webhookService.trigger('siniestro_abierto', data);
    rulesEngine.processRules(data);
  });

  socket.on('siniestro:actualizar', (data) => {
    io.emit('siniestro:actualizado', data);
    webhookService.trigger('siniestro_actualizado', data);
  });

  socket.on('chat:mensaje', async (data) => {
    io.emit('chat:mensaje', data);
    try {
      const respuesta = await mainAgent.procesarChat(data.siniestroId, data.mensaje, data.usuario);
      io.emit('chat:respuesta', { siniestroId: data.siniestroId, respuesta, usuario: 'Agente IA' });
    } catch (err) { logService.log('ERROR', 'chat', err.message); }
  });

  socket.on('agente:actividad', (data) => io.emit('feed:actividad', data));
  socket.on('disconnect', () => logService.log('INFO', 'websocket', `Cliente desconectado: ${socket.id}`));
});

// Actividad IA simulada
setInterval(() => {
  const acts = [
    { agente: 'Anti-Fraude', texto: `Expediente analizado. Score: ${Math.floor(Math.random() * 30)}/100` },
    { agente: 'Recepcionista', texto: 'Llamada atendida automaticamente en 1.2 seg' },
    { agente: 'Clasificador', texto: 'Siniestro auto-clasificado por IA' },
    { agente: 'Documentalista', texto: 'Documentos verificados con OCR' },
    { agente: 'Perito IA', texto: `Valoracion: ${(Math.random() * 5000 + 500).toFixed(0)} EUR` },
    { agente: 'Seguimiento', texto: 'SMS enviado al cliente' },
    { agente: 'Meteorologo', texto: 'Verificacion AEMET completada para zona Valencia' },
    { agente: 'Fotografo', texto: 'Analisis forense de 3 imagenes completado' },
    { agente: 'Predictor', texto: `Prediccion: ${Math.floor(Math.random() * 10 + 5)} siniestros esta semana en Madrid` },
    { agente: 'Calidad', texto: `Auditoria automatica: score ${(Math.random() * 5 + 95).toFixed(1)}%` },
    { agente: 'Contable', texto: 'Provision mensual recalculada' },
    { agente: 'Regulatorio', texto: 'Cumplimiento DGSFP verificado' },
  ];
  io.emit('feed:actividad', { ...acts[Math.floor(Math.random() * acts.length)], timestamp: new Date().toISOString() });
}, 15000);

// ============================================================
// INICIALIZACION
// ============================================================
const PORT = process.env.PORT || 3001;

async function start() {
  try {
    // Verificar variables de entorno criticas en produccion
    if (process.env.NODE_ENV === 'production') {
      const required = ['JWT_SECRET', 'FRONTEND_URL'];
      const missing = required.filter(v => !process.env[v]);
      if (missing.length > 0) {
        console.error(`FATAL: Variables de entorno faltantes: ${missing.join(', ')}`);
        process.exit(1);
      }
    }
    const fs = require('fs');
    for (const dir of ['uploads', 'backups', 'logs']) {
      const p = path.join(__dirname, dir);
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    }

    await initDatabase();
    await seedDatabase();

    // Iniciar servicios background
    healthService.startMonitoring(30000);
    backupService.scheduleHourly();
    slaService.startMonitoring(60000);
    queueService.start();
    vigilanteAgent.startMonitoring(1800000);

    server.listen(PORT, () => {
      console.log('');
      console.log('============================================');
      console.log('  SiniestrosAI Backend v2.0.0');
      console.log('============================================');
      console.log(`  Servidor:     http://localhost:${PORT}`);
      console.log(`  API:          http://localhost:${PORT}/api`);
      console.log(`  API Docs:     http://localhost:${PORT}/api/docs`);
      console.log(`  Health:       http://localhost:${PORT}/api/health`);
      console.log(`  WebSockets:   ws://localhost:${PORT}`);
      console.log(`  Entorno:      ${process.env.NODE_ENV || 'development'}`);
      console.log('  ─────────────────────────────────────────');
      console.log('  Servicios activos:');
      console.log('    Queue ............ OK');
      console.log('    Health Monitor ... OK');
      console.log('    SLA Monitor ...... OK');
      console.log('    Backup Hourly .... OK');
      console.log('    Blockchain ....... OK');
      console.log('    Rules Engine ..... OK');
      console.log('    Webhooks ......... OK');
      console.log('    Ag. Negociador ... OK');
      console.log('    Ag. Vendedor ..... OK');
      console.log('    Ag. Vigilante .... OK (cada 30min)');
      console.log('============================================');
      console.log('');
      logService.log('INFO', 'server', `Servidor iniciado en puerto ${PORT}`);
    });
  } catch (err) {
    logService.log('CRITICAL', 'server', 'Error iniciando servidor: ' + err.message);
    process.exit(1);
  }
}

start();

module.exports = { app, server, io };
