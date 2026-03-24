// ================================================================
// SINIESTROS AI - Configuración Centralizada
// ================================================================
// Este archivo centraliza TODAS las URLs y configuración del proyecto.
// NO hardcodear URLs en otros archivos. Importar siempre desde aquí.

const SiniestrosConfig = (() => {
    'use strict';

    // Detectar entorno automáticamente
    const hostname = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    
    // URLs del backend por entorno
    const BACKEND_URLS = {
        local: 'http://localhost:3001/api/v1',
        render: 'https://siniestrosai-backend.onrender.com/api/v1',
        railway: 'https://prueba-ia-production.up.railway.app/api/v1'
    };

    // Determinar URL del backend
    function getBackendUrl() {
        // 1. Si hay variable de entorno definida en meta tag, usarla
        const metaUrl = document.querySelector('meta[name="api-base-url"]');
        if (metaUrl && metaUrl.content) return metaUrl.content;

        // 2. Si estamos en localhost, usar backend local
        if (isLocal && port !== '3001') return BACKEND_URLS.local;

        // 3. Si estamos en el mismo servidor que el backend
        if (port === '3001') return `${protocol}//${hostname}:${port}/api/v1`;

        // 4. Si estamos en Render
        if (hostname.includes('onrender.com')) return BACKEND_URLS.render;

        // 5. Si estamos en Railway
        if (hostname.includes('railway.app')) return BACKEND_URLS.railway;

        // 6. Fallback: intentar backend en Render
        return BACKEND_URLS.render;
    }

    // Configuración de autenticación segura
    const AUTH_CONFIG = {
        tokenKey: 'siniestrosai_token',
        refreshTokenKey: 'siniestrosai_refresh_token',
        userKey: 'siniestrosai_user',
        tokenExpiry: 3600000, // 1 hora en ms
        useSecureCookies: !isLocal
    };

    // Configuración de la aplicación
    const APP_CONFIG = {
        appName: 'SiniestrosAI',
        version: '7.0.0',
        defaultLanguage: 'es',
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        requestTimeout: 30000, // 30 segundos
        maxRetries: 3
    };

    // API pública
    return {
        API_BASE: getBackendUrl(),
        AUTH: AUTH_CONFIG,
        APP: APP_CONFIG,
        IS_LOCAL: isLocal,
        ENV: isLocal ? 'development' : 'production',
        
        // Helper para construir URLs de API
        apiUrl(path) {
            return `${this.API_BASE}${path.startsWith('/') ? path : '/' + path}`;
        },

        // Log solo en desarrollo
        debug(...args) {
            if (isLocal) console.log('[SiniestrosAI]', ...args);
        }
    };
})();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.SiniestrosConfig = SiniestrosConfig;
}
