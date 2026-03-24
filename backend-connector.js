// ================================================================
// SINIESTROS AI - Backend Connector (v2.0 - Seguro)
// ================================================================
// REQUIERE: config.js y secure-token-manager.js cargados antes
// Usa SiniestrosConfig para URLs y SecureTokenManager para tokens

const API = {
    get baseUrl() {
        return window.SiniestrosConfig?.API_BASE || this._fallbackUrl();
    },

    _fallbackUrl() {
        const h = window.location.hostname;
        const isLocal = h === 'localhost' || h === '127.0.0.1';
        return isLocal ? 'http://localhost:3001/api/v1' : `${window.location.origin}/api/v1`;
    },

    get token() {
        return window.SecureTokenManager?.getAuthToken() || null;
    },

    set token(val) {
        if (val) {
            window.SecureTokenManager?.setAuthToken(val);
        } else {
            window.SecureTokenManager?.removeToken('siniestrosai_token');
        }
    },

    get refreshToken() {
        return window.SecureTokenManager?.getToken('siniestrosai_refresh') || null;
    },

    get usuario() {
        return window.SecureTokenManager?.getUser() || null;
    },

    set usuario(val) {
        if (val) {
            window.SecureTokenManager?.setUser(val);
        }
    },

    // ================== HTTP ===================
    async request(method, endpoint, body = null, options = {}) {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

        const config = { method, headers };
        if (body) config.body = JSON.stringify(body);

        // Timeout configurable
        const timeout = options.timeout || window.SiniestrosConfig?.APP?.requestTimeout || 30000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        config.signal = controller.signal;

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            clearTimeout(timeoutId);

            if (response.status === 401 && !options.isRetry) {
                const refreshed = await this.refreshAuthToken();
                if (refreshed) {
                    return this.request(method, endpoint, body, { ...options, isRetry: true });
                }
                this.logout();
                if (options.showError !== false) this.mostrarError('Sesión expirada. Por favor, inicie sesión nuevamente.');
                throw new Error('Sesión expirada');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (options.showError !== false) this.mostrarError(errorData.message || `Error ${response.status}`);
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                if (options.showError !== false) this.mostrarError('Tiempo de espera agotado. Intente de nuevo.');
                throw new Error('Request timeout');
            }
            throw error;
        }
    },

    // Métodos HTTP helpers
    async get(endpoint, options) { return this.request('GET', endpoint, null, options); },
    async post(endpoint, body, options) { return this.request('POST', endpoint, body, options); },
    async put(endpoint, body, options) { return this.request('PUT', endpoint, body, options); },
    async delete(endpoint, options) { return this.request('DELETE', endpoint, null, options); },

    // ================== AUTH ===================
    async login(email, password) {
        const data = await this.request('POST', '/auth/login', { email, password }, { showError: false });
        if (data.token) {
            this.token = data.token;
            if (data.refreshToken) {
                window.SecureTokenManager?.setToken('siniestrosai_refresh', data.refreshToken, 7 * 24 * 3600000);
            }
            if (data.usuario) this.usuario = data.usuario;
        }
        return data;
    },

    async refreshAuthToken() {
        const refresh = this.refreshToken;
        if (!refresh) return false;
        try {
            const response = await fetch(`${this.baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refresh })
            });
            const data = await response.json();
            if (data.token) {
                this.token = data.token;
                return true;
            }
            return false;
        } catch { return false; }
    },

    logout() {
        window.SecureTokenManager?.clearAll();
        window.location.href = '/index.html';
    },

    // ================== UI HELPERS ===================
    mostrarError(mensaje) {
        // Sanitizar mensaje para prevenir XSS
        const safe = document.createElement('div');
        safe.textContent = mensaje;
        const sanitized = safe.innerHTML;

        const existing = document.querySelector('.api-error-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'api-error-toast';
        toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#e74c3c;color:white;padding:15px 25px;border-radius:8px;z-index:10000;max-width:400px;box-shadow:0 4px 12px rgba(0,0,0,0.3);animation:fadeIn 0.3s';
        toast.innerHTML = `<strong>Error:</strong> ${sanitized}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    },

    mostrarExito(mensaje) {
        const safe = document.createElement('div');
        safe.textContent = mensaje;
        const sanitized = safe.innerHTML;

        const toast = document.createElement('div');
        toast.className = 'api-success-toast';
        toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#27ae60;color:white;padding:15px 25px;border-radius:8px;z-index:10000;max-width:400px;box-shadow:0 4px 12px rgba(0,0,0,0.3);animation:fadeIn 0.3s';
        toast.innerHTML = `<strong>OK:</strong> ${sanitized}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// Health check al cargar
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const health = await fetch(`${API.baseUrl.replace('/api/v1', '')}/api/health`).then(r => r.json());
        if (health.status === 'ok') {
            console.log('Backend SiniestrosAI conectado', health);
        }
    } catch (e) {
        console.warn('Backend no disponible. Algunas funciones no estarán operativas.');
    }
});

// Export global
window.API = API;
