#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('\n=== SiniestrosAI Pre-Production Check ===\n');
let errors = 0;
let warnings = 0;

function check(condition, msg, isWarning = false) {
  if (condition) { console.log(`  \u2713 ${msg}`); }
  else { console.log(`  ${isWarning ? '\u26A0' : '\u2717'} ${msg}`); isWarning ? warnings++ : errors++; }
}

// Environment
console.log('Environment:');
check(process.env.JWT_SECRET, 'JWT_SECRET is set');
check(process.env.JWT_SECRET?.length >= 32, 'JWT_SECRET is at least 32 chars', true);
check(process.env.FRONTEND_URL, 'FRONTEND_URL is set');
check(process.env.NODE_ENV === 'production', 'NODE_ENV is production', true);

// Files
console.log('\nFiles:');
const requiredFiles = ['server.js', 'database/db.js', 'middleware/auth.js', 'middleware/security.js', 'routes/admin.js', 'routes/servicios.js', 'routes/rgpd.js'];
requiredFiles.forEach(f => check(fs.existsSync(path.join(__dirname, f)), `${f} exists`));

// Dependencies
console.log('\nDependencies:');
check(fs.existsSync(path.join(__dirname, 'node_modules')), 'node_modules exists');
const pkg = require('./package.json');
Object.keys(pkg.dependencies).forEach(dep => {
  check(fs.existsSync(path.join(__dirname, 'node_modules', dep)), `${dep} installed`);
});

// Database
console.log('\nDatabase:');
const dbPath = process.env.DB_PATH || path.join(__dirname, 'database', 'siniestros.db');
check(fs.existsSync(dbPath), 'Database file exists', true);

// Security
console.log('\nSecurity:');
const serverCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
check(!serverCode.includes("origin: '*'"), 'No CORS wildcard');
check(serverCode.includes('compression'), 'Compression enabled');
check(serverCode.includes('securityHeaders'), 'Security headers enabled');
check(serverCode.includes('sanitizeMiddleware'), 'Input sanitization enabled');
check(serverCode.includes('rateLimiter'), 'Rate limiting enabled');

const authCode = fs.readFileSync(path.join(__dirname, 'middleware/auth.js'), 'utf8');
check(!authCode.includes('siniestros_ai_secret'), 'No hardcoded JWT secret');

console.log(`\n=== Results: ${errors} errors, ${warnings} warnings ===`);
if (errors > 0) { console.log('\n\u2717 NOT READY FOR PRODUCTION'); process.exit(1); }
else if (warnings > 0) { console.log('\n\u26A0 Ready with warnings'); }
else { console.log('\n\u2713 READY FOR PRODUCTION'); }
