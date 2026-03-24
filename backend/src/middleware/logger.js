'use strict';

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'];

function formatDate() {
  return new Date().toISOString();
}

const logger = {
  error(msg, meta = {}) {
    if (currentLevel >= LOG_LEVELS.error) {
      console.error(JSON.stringify({ level: 'error', timestamp: formatDate(), message: msg, ...meta }));
    }
  },
  warn(msg, meta = {}) {
    if (currentLevel >= LOG_LEVELS.warn) {
      console.warn(JSON.stringify({ level: 'warn', timestamp: formatDate(), message: msg, ...meta }));
    }
  },
  info(msg, meta = {}) {
    if (currentLevel >= LOG_LEVELS.info) {
      console.log(JSON.stringify({ level: 'info', timestamp: formatDate(), message: msg, ...meta }));
    }
  },
  debug(msg, meta = {}) {
    if (currentLevel >= LOG_LEVELS.debug) {
      console.log(JSON.stringify({ level: 'debug', timestamp: formatDate(), message: msg, ...meta }));
    }
  }
};

// Request logging middleware
function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, url, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    logger[level]('HTTP Request', { method, url, statusCode, duration: duration + 'ms', ip });
  });

  next();
}

module.exports = { logger, requestLogger };
