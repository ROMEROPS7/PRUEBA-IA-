// ================================================================
// SINIESTROS AI - Gestión Segura de Tokens
// ================================================================
// Reemplaza el uso directo de localStorage por un sistema más seguro
// con encriptación básica, expiración automática y sanitización.

const SecureTokenManager = (() => {
    'use strict';

    // Clave de ofuscación (NO es encriptación real, pero dificulta lectura directa)
    const OBFUSCATION_KEY = 'SiniestrosAI_2026';

    function obfuscate(str) {
        try {
            return btoa(encodeURIComponent(str).split('').map((c, i) =>
                String.fromCharCode(c.charCodeAt(0) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length))
            ).join(''));
        } catch { return btoa(str); }
    }

    function deobfuscate(str) {
        try {
            const decoded = atob(str);
            return decodeURIComponent(decoded.split('').map((c, i) =>
                String.fromCharCode(c.charCodeAt(0) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length))
            ).join(''));
        } catch { try { return atob(str); } catch { return null; } }
    }

    function setToken(key, value, ttlMs) {
        const item = {
            value: obfuscate(typeof value === 'string' ? value : JSON.stringify(value)),
            expiry: ttlMs ? Date.now() + ttlMs : null,
            created: Date.now()
        };
        try {
            sessionStorage.setItem(key, JSON.stringify(item));
        } catch {
            // Fallback a localStorage si sessionStorage no disponible
            localStorage.setItem(key, JSON.stringify(item));
        }
    }

    function getToken(key) {
        let raw;
        try {
            raw = sessionStorage.getItem(key) || localStorage.getItem(key);
        } catch {
            raw = localStorage.getItem(key);
        }
        if (!raw) return null;

        try {
            const item = JSON.parse(raw);
            // Verificar expiración
            if (item.expiry && Date.now() > item.expiry) {
                removeToken(key);
                return null;
            }
            return deobfuscate(item.value);
        } catch {
            // Formato antiguo (migración de localStorage directo)
            return raw;
        }
    }

    function removeToken(key) {
        try { sessionStorage.removeItem(key); } catch {}
        try { localStorage.removeItem(key); } catch {}
    }

    function clearAll() {
        const config = window.SiniestrosConfig?.AUTH || {};
        removeToken(config.tokenKey || 'siniestrosai_token');
        removeToken(config.refreshTokenKey || 'siniestrosai_refresh_token');
        removeToken(config.userKey || 'siniestrosai_user');
    }

    // Migrar tokens antiguos de localStorage plano
    function migrateOldTokens() {
        const oldToken = localStorage.getItem('siniestrosai_token');
        if (oldToken && !oldToken.startsWith('{')) {
            // Token antiguo sin wrapper, migrarlo
            const config = window.SiniestrosConfig?.AUTH || {};
            setToken(config.tokenKey || 'siniestrosai_token', oldToken, config.tokenExpiry || 3600000);
            localStorage.removeItem('siniestrosai_token');
            console.log('[SecureTokenManager] Tokens migrados al nuevo formato seguro');
        }
    }

    return {
        setToken,
        getToken,
        removeToken,
        clearAll,
        migrateOldTokens,

        // Helpers específicos
        setAuthToken(token) {
            const config = window.SiniestrosConfig?.AUTH || {};
            setToken(config.tokenKey || 'siniestrosai_token', token, config.tokenExpiry || 3600000);
        },
        getAuthToken() {
            const config = window.SiniestrosConfig?.AUTH || {};
            return getToken(config.tokenKey || 'siniestrosai_token');
        },
        setUser(user) {
            const config = window.SiniestrosConfig?.AUTH || {};
            setToken(config.userKey || 'siniestrosai_user', user, config.tokenExpiry || 3600000);
        },
        getUser() {
            const config = window.SiniestrosConfig?.AUTH || {};
            const raw = getToken(config.userKey || 'siniestrosai_user');
            try { return JSON.parse(raw); } catch { return raw; }
        },
        isAuthenticated() {
            return !!this.getAuthToken();
        }
    };
})();

if (typeof window !== 'undefined') {
    window.SecureTokenManager = SecureTokenManager;
    // Auto-migrar tokens antiguos
    SecureTokenManager.migrateOldTokens();
}
