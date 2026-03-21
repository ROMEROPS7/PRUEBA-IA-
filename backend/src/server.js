require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { logger } = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { auditMiddleware } = require('./middleware/audit');
const db = require('./config/database');

const app = express();

// ============================================
// SEGURIDAD
// ============================================
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

app.use(cors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:8080').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: 'Demasiadas peticiones. Inténtalo en unos minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// ============================================
// MIDDLEWARE GENERAL
// ============================================
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use(auditMiddleware);

// Archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ============================================
// RUTAS API
// ============================================
const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;

app.use(`${API_PREFIX}/auth`, require('./routes/auth'));
app.use(`${API_PREFIX}/siniestros`, require('./routes/siniestros'));
app.use(`${API_PREFIX}/polizas`, require('./routes/polizas'));
app.use(`${API_PREFIX}/agentes`, require('./routes/agentes'));
app.use(`${API_PREFIX}/peritos`, require('./routes/peritos'));
app.use(`${API_PREFIX}/talleres`, require('./routes/talleres'));
app.use(`${API_PREFIX}/documentos`, require('./routes/documentos'));
app.use(`${API_PREFIX}/notificaciones`, require('./routes/notificaciones'));
app.use(`${API_PREFIX}/dashboard`, require('./routes/dashboard'));
app.use(`${API_PREFIX}/admin`, require('./routes/admin'));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        ai_engine: process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing_key',
        email: process.env.SMTP_HOST ? 'configured' : 'not_configured'
      }
    });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// Documentación API (Swagger)
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const apiDocs = require('../docs/swagger.json');
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(apiDocs, {
    customSiteTitle: 'SiniestrosAI API',
    customCss: '.swagger-ui .topbar { display: none }'
  }));
}

// ============================================
// ERROR HANDLING
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 3001;

async function start() {
  try {
    // Verificar conexión a DB
    await db.raw('SELECT 1');
    logger.info('✅ Base de datos conectada');

    app.listen(PORT, () => {
      logger.info(`🚀 SiniestrosAI Backend v1.0.0 corriendo en puerto ${PORT}`);
      logger.info(`📋 API: http://localhost:${PORT}/api/v1`);
      logger.info(`❤️  Health: http://localhost:${PORT}/api/health`);
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`📖 Docs: http://localhost:${PORT}/api/docs`);
      }
    });
  } catch (err) {
    logger.error('❌ Error al iniciar:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;
