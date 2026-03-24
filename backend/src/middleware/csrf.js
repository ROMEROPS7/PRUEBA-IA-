// ================================================================
// Middleware de Protección CSRF
// ================================================================
const crypto = require('crypto');

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

function csrfProtection(options = {}) {
    const { cookieName = '_csrf', headerName = 'x-csrf-token', excludePaths = [] } = options;

    return (req, res, next) => {
        // Excluir rutas de API que usan JWT (no necesitan CSRF)
        if (req.headers.authorization?.startsWith('Bearer ')) {
            return next();
        }

        // Excluir rutas específicas
        if (excludePaths.some(p => req.path.startsWith(p))) {
            return next();
        }

        // GET requests: generar y enviar token
        if (req.method === 'GET') {
            const token = generateToken();
            res.cookie(cookieName, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600000
            });
            res.locals.csrfToken = token;
            return next();
        }

        // POST/PUT/DELETE: verificar token
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            const cookieToken = req.cookies?.[cookieName];
            const headerToken = req.headers[headerName];

            if (!cookieToken || !headerToken || cookieToken !== headerToken) {
                return res.status(403).json({
                    error: 'Token CSRF inválido',
                    mensaje: 'La solicitud no incluye un token CSRF válido'
                });
            }
        }
        next();
    };
}

module.exports = { csrfProtection, generateToken };
