// ================================================================
// Middleware de Sanitización de Inputs
// ================================================================
// Previene XSS, SQL injection y otros ataques de inyección

function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/[<>]/g, '')           // Eliminar tags HTML
        .replace(/javascript:/gi, '')    // Eliminar javascript: URIs
        .replace(/on\w+\s*=/gi, '')     // Eliminar event handlers
        .replace(/['";]/g, (m) => `\\${m}`)  // Escapar quotes
        .trim();
}

function sanitizeObject(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return sanitizeString(obj);
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        const safeKey = sanitizeString(key);
        sanitized[safeKey] = sanitizeObject(value);
    }
    return sanitized;
}

// Middleware principal
function sanitizeInputs(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
    }
    next();
}

// Validar que IDs son formatos esperados (UUID o numérico)
function validateId(paramName = 'id') {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!id) return next();
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const isNumeric = /^\d+$/.test(id);
        
        if (!isUUID && !isNumeric) {
            return res.status(400).json({
                error: 'ID inválido',
                mensaje: `El parámetro ${paramName} debe ser un UUID o número válido`
            });
        }
        next();
    };
}

// Limitar tamaño de body
function limitBodySize(maxBytes = 1048576) { // 1MB default
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        if (contentLength > maxBytes) {
            return res.status(413).json({
                error: 'Payload demasiado grande',
                mensaje: `El cuerpo de la petición excede el límite de ${Math.round(maxBytes/1024)}KB`
            });
        }
        next();
    };
}

module.exports = { sanitizeInputs, sanitizeObject, validateId, limitBodySize };
