/**
 * SiniestrosAI - Conector Frontend → Backend Real
 * Conecta todos los portales HTML con la API REST
 * v2.0 - Conexión real con agentes IA
 */

const API = {
  baseUrl: window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api/v1' 
    : `${window.location.origin}/api/v1`,
  token: localStorage.getItem('siniestrosai_token'),
  refreshToken: localStorage.getItem('siniestrosai_refresh'),
  usuario: JSON.parse(localStorage.getItem('siniestrosai_usuario') || 'null'),

  // ==================== HTTP ====================
  async request(method, endpoint, body = null, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const config = { method, headers };
    if (body && method !== 'GET') config.body = JSON.stringify(body);

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      // Token expirado → refresh
      if (res.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAuth();
        if (refreshed) return this.request(method, endpoint, body, options);
        this.logout();
        return null;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      return data;
    } catch (err) {
      console.error(`[API] ${method} ${endpoint}:`, err.message);
      if (options.showError !== false) this.mostrarError(err.message);
      throw err;
    }
  },

  get(endpoint) { return this.request('GET', endpoint); },
  post(endpoint, body) { return this.request('POST', endpoint, body); },
  patch(endpoint, body) { return this.request('PATCH', endpoint, body); },
  delete(endpoint) { return this.request('DELETE', endpoint); },

  // ==================== AUTH ====================
  async login(email, password) {
    try {
      const data = await this.request('POST', '/auth/login', { email, password });
      this.token = data.token;
      this.refreshToken = data.refresh_token;
      this.usuario = data.usuario;
      localStorage.setItem('siniestrosai_token', data.token);
      localStorage.setItem('siniestrosai_refresh', data.refresh_token);
      localStorage.setItem('siniestrosai_usuario', JSON.stringify(data.usuario));
      return data;
    } catch (err) {
      throw err;
    }
  },

  async refreshAuth() {
    try {
      const data = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken })
      }).then(r => r.json());
      
      if (data.token) {
        this.token = data.token;
        localStorage.setItem('siniestrosai_token', data.token);
        return true;
      }
      return false;
    } catch { return false; }
  },

  logout() {
    this.token = null;
    this.refreshToken = null;
    this.usuario = null;
    localStorage.removeItem('siniestrosai_token');
    localStorage.removeItem('siniestrosai_refresh');
    localStorage.removeItem('siniestrosai_usuario');
    window.location.href = 'index.html';
  },

  isLoggedIn() { return !!this.token && !!this.usuario; },

  requireAuth(rolesPermitidos = []) {
    if (!this.isLoggedIn()) { window.location.href = 'index.html'; return false; }
    if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(this.usuario.tipo)) {
      this.mostrarError('No tienes permisos para acceder a esta sección');
      return false;
    }
    return true;
  },

  // ==================== SINIESTROS ====================
  async crearSiniestro(datos) {
    return this.post('/siniestros', datos);
  },

  async listarSiniestros(filtros = {}) {
    const params = new URLSearchParams(filtros).toString();
    return this.get(`/siniestros${params ? '?' + params : ''}`);
  },

  async obtenerSiniestro(id) {
    return this.get(`/siniestros/${id}`);
  },

  async actualizarSiniestro(id, datos) {
    return this.patch(`/siniestros/${id}`, datos);
  },

  async reprocesarSiniestro(id) {
    return this.post(`/siniestros/${id}/reprocesar`);
  },

  async timelineSiniestro(id) {
    return this.get(`/siniestros/${id}/timeline`);
  },

  // ==================== PÓLIZAS ====================
  async listarPolizas(filtros = {}) {
    const params = new URLSearchParams(filtros).toString();
    return this.get(`/polizas${params ? '?' + params : ''}`);
  },

  async buscarPoliza(numero) {
    return this.get(`/polizas/numero/${numero}`);
  },

  // ==================== DASHBOARD ====================
  async obtenerDashboard(desde, hasta) {
    const params = new URLSearchParams();
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    return this.get(`/dashboard${params.toString() ? '?' + params : ''}`);
  },

  async rendimientoAgentes() {
    return this.get('/dashboard/rendimiento-agentes');
  },

  // ==================== AGENTES ====================
  async listarAgentes() {
    return this.get('/agentes');
  },

  async configurarAgente(nombre, config) {
    return this.patch(`/agentes/${nombre}`, config);
  },

  // ==================== TALLERES / PERITOS ====================
  async listarTalleres(filtros = {}) {
    const params = new URLSearchParams(filtros).toString();
    return this.get(`/talleres${params ? '?' + params : ''}`);
  },

  async listarPeritos() {
    return this.get('/peritos');
  },

  // ==================== DOCUMENTOS ====================
  async subirDocumento(siniestroId, archivo, categoria) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('siniestro_id', siniestroId);
    formData.append('categoria', categoria);

    const res = await fetch(`${this.baseUrl}/documentos`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.token}` },
      body: formData
    });
    return res.json();
  },

  // ==================== ADMIN ====================
  async listarUsuarios() {
    return this.get('/admin/usuarios');
  },

  async auditLog(filtros = {}) {
    const params = new URLSearchParams(filtros).toString();
    return this.get(`/admin/audit-log${params ? '?' + params : ''}`);
  },

  async statsistema() {
    return this.get('/admin/stats/sistema');
  },

  async exportarRGPD(userId) {
    return this.get(`/admin/rgpd/export/${userId}`);
  },

  // ==================== NOTIFICACIONES ====================
  async listarNotificaciones(siniestroId) {
    const params = siniestroId ? `?siniestro_id=${siniestroId}` : '';
    return this.get(`/notificaciones${params}`);
  },

  // ==================== UI HELPERS ====================
  mostrarError(mensaje) {
    const toast = document.createElement('div');
    toast.className = 'toast-error';
    toast.innerHTML = `<span>❌</span> ${mensaje}`;
    toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#EF4444;color:white;padding:16px 24px;border-radius:12px;font-size:14px;font-weight:500;z-index:10000;animation:slideIn .3s ease;box-shadow:0 4px 20px rgba(239,68,68,.3);max-width:400px;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  },

  mostrarExito(mensaje) {
    const toast = document.createElement('div');
    toast.innerHTML = `<span>✅</span> ${mensaje}`;
    toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#10B981;color:white;padding:16px 24px;border-radius:12px;font-size:14px;font-weight:500;z-index:10000;animation:slideIn .3s ease;box-shadow:0 4px 20px rgba(16,185,129,.3);max-width:400px;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  },

  mostrarCargando(contenedor, mensaje = 'Procesando...') {
    const el = typeof contenedor === 'string' ? document.querySelector(contenedor) : contenedor;
    if (!el) return;
    el.innerHTML = `<div style="text-align:center;padding:40px;"><div class="spinner" style="width:40px;height:40px;border:3px solid rgba(0,102,255,.2);border-top-color:#0066FF;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;"></div><p style="color:#94A3B8;font-size:14px;">${mensaje}</p></div>`;
  },

  // Formatear fecha
  fecha(iso) {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  // Estado con color
  badgeEstado(estado) {
    const colores = {
      recibido: '#3B82F6', clasificando: '#8B5CF6', en_analisis: '#6366F1',
      verificando_fraude: '#F59E0B', peritaje: '#EC4899', valoracion: '#06B6D4',
      negociacion: '#14B8A6', aprobado: '#10B981', rechazado: '#EF4444',
      en_pago: '#F97316', pagado: '#10B981', cerrado: '#6B7280', reabierto: '#F59E0B'
    };
    const color = colores[estado] || '#6B7280';
    const label = estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `<span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;background:${color}22;color:${color};border:1px solid ${color}33;">${label}</span>`;
  },

  // Prioridad con color
  badgePrioridad(prioridad) {
    const colores = { baja: '#10B981', media: '#3B82F6', alta: '#F59E0B', urgente: '#EF4444', critica: '#DC2626' };
    const color = colores[prioridad] || '#6B7280';
    return `<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:${color}22;color:${color};">${(prioridad || '').toUpperCase()}</span>`;
  }
};

// CSS global para animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
`;
document.head.appendChild(style);

// Verificar salud del backend al cargar
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const health = await fetch(`${API.baseUrl.replace('/api/v1', '')}/api/health`).then(r => r.json());
    if (health.status === 'ok') {
      console.log('✅ Backend SiniestrosAI conectado', health);
    }
  } catch (e) {
    console.warn('⚠️ Backend no disponible. Algunas funciones no estarán operativas.');
  }
});

// Export global
window.API = API;
