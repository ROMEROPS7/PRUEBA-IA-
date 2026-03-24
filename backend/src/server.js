require('dotenv').config();

// Verificar variables de entorno críticas
const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Variable de entorno ${envVar} no configurada`);
    process.exit(1);
  }
}
const express = require('express');
// const cors = require('cors'); // Replaced with manual CORS
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const crypto = require('crypto');
const { logger } = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { auditMiddleware } = require('./middleware/audit');
const db = require('./config/database');
const OllamaClient = require('./utils/ollama-client');

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

// Manual CORS middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID, X-CSRF-Token');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Sanitización de inputs
const { sanitizeInputs } = require('./middleware/sanitize');
app.use(sanitizeInputs);

// CSRF Protection
app.use((req, res, next) => {
  let csrfToken = req.cookies['csrf-token'];
  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf-token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }
  req.csrfToken = csrfToken;
  next();
});

app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
    if (!csrfToken || csrfToken !== req.csrfToken) {
      return res.status(403).json({ error: 'Token CSRF inválido' });
    }
  }
  next();
});

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

// ============================================
// RUTAS v2 - RuFlo + Paperclip
// ============================================
app.use(`${API_PREFIX}/organizacion`, require('./routes/organizacion'));
app.use(`${API_PREFIX}/presupuestos-ia`, require('./routes/presupuestos-ia'));
app.use(`${API_PREFIX}/gobernanza`, require('./routes/gobernanza'));
app.use(`${API_PREFIX}/memoria`, require('./routes/memoria'));
app.use(`${API_PREFIX}/seguridad`, require('./routes/seguridad'));
app.use(`${API_PREFIX}/routing`, require('./routes/routing'));
app.use(`${API_PREFIX}/swarm`, require('./routes/swarm'));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({
      status: 'ok',
      version: '2.0.0',
      codename: 'RuFlo+Paperclip',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        ai_engine: await this._checkOllamaHealth() ? 'configured' : 'missing_ollama',
        email: process.env.SMTP_HOST ? 'configured' : 'not_configured',
        swarm_orchestrator: 'active',
        routing_inteligente: 'active',
        budget_manager: 'active',
        governance_engine: 'active',
        memory_engine: 'active',
        security_engine: 'active'
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

// Verificar estado de Ollama
async function _checkOllamaHealth() {
  try {
    const client = new OllamaClient();
    return await client.checkHealth();
  } catch (error) {
    logger.warn('Ollama no disponible:', error.message);
    return false;
  }
}

async function start() {
  try {
    // Verificar conexión a DB
    await db.raw('SELECT 1');
    logger.info('✅ Base de datos conectada');

    app.listen(PORT, () => {
      logger.info(`🚀 SiniestrosAI Backend v2.0.0 (RuFlo+Paperclip) corriendo en puerto ${PORT}`);
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
