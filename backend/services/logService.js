/**
 * Logging Service
 *
 * Structured JSON logging with file rotation, filtering, statistics,
 * and Express middleware.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4,
};

const LEVEL_NAMES = Object.fromEntries(
  Object.entries(LEVELS).map(([k, v]) => [v, k])
);

const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '..', 'logs');

// Log file paths – keyed by logical category
const LOG_FILES = {
  app: path.join(LOG_DIR, 'app.log'),       // All log entries
  error: path.join(LOG_DIR, 'error.log'),   // ERROR + CRITICAL only
  access: path.join(LOG_DIR, 'access.log'), // API request logging
  agent: path.join(LOG_DIR, 'agent.log'),   // IA agent actions
  auth: path.join(LOG_DIR, 'auth.log'),     // Authentication events
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_ROTATIONS = 10;

// Minimum level that gets written (configurable via env)
const MIN_LEVEL = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.DEBUG;

// ---------------------------------------------------------------------------
// Initialisation – ensure the logs directory exists
// ---------------------------------------------------------------------------

function _ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

// Run on module load
_ensureLogDir();

// ---------------------------------------------------------------------------
// Core logging
// ---------------------------------------------------------------------------

/**
 * log(level, category, message, meta)
 *
 * Main logging function. Writes a JSON line to the relevant log files.
 *
 * @param {number|string} level    – numeric level or level name (e.g. 'INFO')
 * @param {string}        category – freeform category tag
 * @param {string}        message  – human-readable message
 * @param {object}        [meta={}] – arbitrary metadata
 * @returns {object}       the log entry
 */
function log(level, category, message, meta = {}) {
  // Normalise level
  const numLevel = typeof level === 'string' ? (LEVELS[level.toUpperCase()] ?? LEVELS.INFO) : level;

  if (numLevel < MIN_LEVEL) return null;

  const entry = {
    timestamp: new Date().toISOString(),
    level: LEVEL_NAMES[numLevel] || 'INFO',
    levelNum: numLevel,
    category: category || 'general',
    message,
    meta,
    requestId: meta.requestId || null,
  };

  const line = JSON.stringify(entry) + '\n';

  // Always write to app.log
  _appendSafe(LOG_FILES.app, line);

  // Error-level entries also go to error.log
  if (numLevel >= LEVELS.ERROR) {
    _appendSafe(LOG_FILES.error, line);
  }

  // Category-specific files
  if (category === 'access') {
    _appendSafe(LOG_FILES.access, line);
  } else if (category === 'agent') {
    _appendSafe(LOG_FILES.agent, line);
  } else if (category === 'auth') {
    _appendSafe(LOG_FILES.auth, line);
  }

  // Also print to stdout in development
  if (process.env.NODE_ENV !== 'production') {
    const prefix = `[${entry.level}][${entry.category}]`;
    if (numLevel >= LEVELS.ERROR) {
      console.error(prefix, message, Object.keys(meta).length ? meta : '');
    } else {
      console.log(prefix, message, Object.keys(meta).length ? meta : '');
    }
  }

  return entry;
}

/**
 * Safely appends data to a file. Creates the file if it doesn't exist.
 * Uses synchronous append to avoid interleaving in high-concurrency
 * scenarios (acceptable because log lines are small).
 */
function _appendSafe(filePath, data) {
  try {
    fs.appendFileSync(filePath, data, { encoding: 'utf8' });
  } catch (err) {
    // Last resort – write to stderr so we don't lose the info entirely
    process.stderr.write(`[LogService] Failed to write to ${filePath}: ${err.message}\n`);
  }
}

// ---------------------------------------------------------------------------
// Convenience wrappers
// ---------------------------------------------------------------------------

function debug(category, message, meta) { return log(LEVELS.DEBUG, category, message, meta); }
function info(category, message, meta)  { return log(LEVELS.INFO, category, message, meta); }
function warn(category, message, meta)  { return log(LEVELS.WARN, category, message, meta); }
function error(category, message, meta) { return log(LEVELS.ERROR, category, message, meta); }
function critical(category, message, meta) { return log(LEVELS.CRITICAL, category, message, meta); }

// ---------------------------------------------------------------------------
// Specialised loggers
// ---------------------------------------------------------------------------

/**
 * logAgentAction(agentId, action, details)
 *
 * Records an IA agent action in the agent log.
 */
function logAgentAction(agentId, action, details = {}) {
  return log(LEVELS.INFO, 'agent', `Agent ${agentId}: ${action}`, {
    agentId,
    action,
    ...details,
  });
}

/**
 * logAuth(email, action, success, ip)
 *
 * Records an authentication event (login, logout, token refresh, etc.).
 */
function logAuth(email, action, success, ip) {
  const level = success ? LEVELS.INFO : LEVELS.WARN;
  return log(level, 'auth', `${action} ${success ? 'OK' : 'FAILED'} for ${email}`, {
    email,
    action,
    success,
    ip,
  });
}

// ---------------------------------------------------------------------------
// Express middleware
// ---------------------------------------------------------------------------

/**
 * requestLogger()
 *
 * Returns Express middleware that logs every API request with method, url,
 * status code, response time, and client IP.
 */
function requestLogger() {
  return (req, res, next) => {
    const requestId = uuidv4();
    const start = Date.now();

    // Attach requestId so downstream code can reference it
    req.requestId = requestId;

    // Capture response finish
    res.on('finish', () => {
      const duration = Date.now() - start;
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

      log(LEVELS.INFO, 'access', `${req.method} ${req.originalUrl} ${res.statusCode}`, {
        requestId,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration,
        ip,
        userAgent: req.headers['user-agent'] || '',
        contentLength: res.getHeader('content-length') || 0,
      });
    });

    next();
  };
}

// ---------------------------------------------------------------------------
// Log rotation
// ---------------------------------------------------------------------------

/**
 * rotateLogs()
 *
 * Checks each log file and rotates it if it exceeds MAX_FILE_SIZE.
 * Rotation scheme: app.log -> app.log.1 -> app.log.2 ... -> app.log.10 (deleted)
 *
 * @returns {Promise<string[]>} list of rotated file names
 */
async function rotateLogs() {
  _ensureLogDir();
  const rotated = [];

  for (const [key, filePath] of Object.entries(LOG_FILES)) {
    if (!fs.existsSync(filePath)) continue;

    let stats;
    try {
      stats = await fs.promises.stat(filePath);
    } catch {
      continue;
    }

    if (stats.size < MAX_FILE_SIZE) continue;

    // Shift existing rotations: .9 -> .10, .8 -> .9, etc.
    for (let i = MAX_ROTATIONS; i >= 1; i--) {
      const older = `${filePath}.${i}`;
      const newer = i === 1 ? filePath : `${filePath}.${i - 1}`;

      if (i === MAX_ROTATIONS && fs.existsSync(older)) {
        await fs.promises.unlink(older);
      }

      if (fs.existsSync(newer) && i > 1) {
        await fs.promises.rename(newer, older);
      }
    }

    // Move current file to .1
    await fs.promises.rename(filePath, `${filePath}.1`);

    // Create a fresh empty file
    await fs.promises.writeFile(filePath, '', 'utf8');

    rotated.push(key);
    console.log(`[LogService] Rotated ${key} log (was ${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  }

  return rotated;
}

// ---------------------------------------------------------------------------
// Log reading / querying
// ---------------------------------------------------------------------------

/**
 * getLogs(filters)
 *
 * Reads and filters log entries from the files on disk.
 *
 * @param {object} filters
 * @param {string} [filters.level]      – minimum level name (e.g. 'WARN')
 * @param {string} [filters.category]   – exact category match
 * @param {string} [filters.dateFrom]   – ISO date string lower bound
 * @param {string} [filters.dateTo]     – ISO date string upper bound
 * @param {string} [filters.search]     – substring search in message
 * @param {number} [filters.limit=100]  – max entries to return
 * @param {number} [filters.offset=0]   – entries to skip
 * @param {string} [filters.file]       – which log file to read (app|error|access|agent|auth)
 * @returns {Promise<{entries: object[], total: number}>}
 */
async function getLogs(filters = {}) {
  const {
    level,
    category,
    dateFrom,
    dateTo,
    search,
    limit = 100,
    offset = 0,
    file = 'app',
  } = filters;

  const filePath = LOG_FILES[file] || LOG_FILES.app;

  if (!fs.existsSync(filePath)) {
    return { entries: [], total: 0 };
  }

  const minLevel = level ? (LEVELS[level.toUpperCase()] ?? 0) : 0;
  const fromTs = dateFrom ? new Date(dateFrom).getTime() : 0;
  const toTs = dateTo ? new Date(dateTo).getTime() : Infinity;
  const searchLower = search ? search.toLowerCase() : null;

  let content;
  try {
    content = await fs.promises.readFile(filePath, 'utf8');
  } catch (err) {
    return { entries: [], total: 0 };
  }

  const lines = content.split('\n').filter(Boolean);

  const matched = [];
  for (let i = lines.length - 1; i >= 0; i--) {
    let entry;
    try {
      entry = JSON.parse(lines[i]);
    } catch {
      continue;
    }

    // Level filter
    if ((entry.levelNum ?? 0) < minLevel) continue;

    // Category filter
    if (category && entry.category !== category) continue;

    // Date range filter
    const ts = new Date(entry.timestamp).getTime();
    if (ts < fromTs || ts > toTs) continue;

    // Substring search
    if (searchLower) {
      const haystack = (entry.message || '').toLowerCase();
      if (!haystack.includes(searchLower)) continue;
    }

    matched.push(entry);
  }

  const total = matched.length;
  const entries = matched.slice(offset, offset + limit);

  return { entries, total };
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

/**
 * getStats()
 *
 * Returns aggregated counts by level and category from the app log.
 *
 * @returns {Promise<{byLevel: object, byCategory: object, total: number}>}
 */
async function getStats() {
  const filePath = LOG_FILES.app;
  const byLevel = { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, CRITICAL: 0 };
  const byCategory = {};
  let total = 0;

  if (!fs.existsSync(filePath)) {
    return { byLevel, byCategory, total };
  }

  let content;
  try {
    content = await fs.promises.readFile(filePath, 'utf8');
  } catch {
    return { byLevel, byCategory, total };
  }

  const lines = content.split('\n').filter(Boolean);

  for (const line of lines) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }

    total++;

    const lvl = entry.level || 'INFO';
    if (byLevel[lvl] !== undefined) {
      byLevel[lvl]++;
    }

    const cat = entry.category || 'general';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  }

  return { byLevel, byCategory, total };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  // Constants
  LEVELS,
  LEVEL_NAMES,
  LOG_FILES,

  // Core
  log,
  debug,
  info,
  warn,
  error,
  critical,

  // Specialised
  logAgentAction,
  logAuth,

  // Middleware
  requestLogger,

  // Rotation & querying
  rotateLogs,
  getLogs,
  getStats,
};
