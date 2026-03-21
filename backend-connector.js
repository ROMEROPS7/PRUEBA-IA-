// ============================================================
// BACKEND CONNECTOR - Conecta el frontend con el backend
// ============================================================

const API_URL = window.location.hostname.includes('app.github.dev')
  ? window.location.origin.replace('-8080.', '-3001.')
  : window.location.port === '3001' ? window.location.origin
  : 'http://localhost:3001';

let socket = null;
let authToken = null;
let backendConectado = false;

// ============================================================
// CONEXION WEBSOCKET
// ============================================================
function initBackendConnection() {
  if (typeof io === 'undefined') {
    console.warn('[Backend] Socket.IO no disponible. Modo offline.');
    return;
  }

  try {
    socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('[Backend] WebSocket conectado:', socket.id);
      backendConectado = true;
      showToast('Backend conectado', 'success');
    });

    socket.on('disconnect', () => {
      console.log('[Backend] WebSocket desconectado');
      backendConectado = false;
    });

    socket.on('connect_error', () => {
      if (backendConectado) {
        console.warn('[Backend] Error de conexion. Modo offline.');
        backendConectado = false;
      }
    });

    // Escuchar eventos del backend
    socket.on('feed:actividad', (data) => {
      if (typeof addFeed === 'function') {
        const f = document.getElementById('aiFeed');
        if (f) {
          const d = document.createElement('div');
          d.className = 'feed-item';
          const t = new Date(data.timestamp || Date.now()).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          d.innerHTML = `<div class="feed-icon"><i class="fas fa-robot"></i></div><div class="feed-text"><strong>${data.agente}:</strong> ${data.texto}</div><span class="feed-time">${t}</span>`;
          f.insertBefore(d, f.firstChild);
          if (f.children.length > 15) f.removeChild(f.lastChild);
        }
      }
    });

    socket.on('siniestro:creado', (data) => {
      console.log('[Backend] Siniestro creado:', data);
      if (typeof updateKPIs === 'function') updateKPIs();
      if (typeof renderDashboardTable === 'function') renderDashboardTable();
      if (typeof renderExpTable === 'function') renderExpTable();
    });

    socket.on('siniestro:actualizado', (data) => {
      console.log('[Backend] Siniestro actualizado:', data);
      if (typeof updateKPIs === 'function') updateKPIs();
    });

    socket.on('chat:respuesta', (data) => {
      console.log('[Backend] Chat IA:', data);
    });

    socket.on('fraude:analisis', (data) => {
      console.log('[Backend] Analisis fraude:', data);
    });
  } catch (err) {
    console.warn('[Backend] No se pudo conectar:', err.message);
  }
}

// ============================================================
// API HELPERS
// ============================================================
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}/api${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  if (authToken) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      console.warn(`[API] Backend no disponible para ${endpoint}. Usando datos locales.`);
      return null;
    }
    throw err;
  }
}

// ============================================================
// AUTH
// ============================================================
async function backendLogin(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data?.token) {
    authToken = data.token;
    localStorage.setItem('siniestrosai_token', data.token);
    return data.usuario;
  }
  return null;
}

function backendLogout() {
  authToken = null;
  localStorage.removeItem('siniestrosai_token');
}

// ============================================================
// SINIESTROS
// ============================================================
async function fetchSiniestros(filtros = {}) {
  const params = new URLSearchParams(filtros).toString();
  return apiRequest(`/siniestros?${params}`);
}

async function fetchSiniestro(id) {
  return apiRequest(`/siniestros/${id}`);
}

async function crearSiniestroBackend(datos) {
  const data = await apiRequest('/siniestros', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
  if (data && socket) {
    socket.emit('siniestro:nuevo', data);
  }
  return data;
}

async function actualizarSiniestroBackend(id, cambios) {
  const data = await apiRequest(`/siniestros/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cambios),
  });
  if (data && socket) {
    socket.emit('siniestro:actualizar', data);
  }
  return data;
}

// ============================================================
// CLIENTES
// ============================================================
async function fetchClientes(buscar) {
  const params = buscar ? `?buscar=${encodeURIComponent(buscar)}` : '';
  return apiRequest(`/clientes${params}`);
}

async function crearClienteBackend(datos) {
  return apiRequest('/clientes', { method: 'POST', body: JSON.stringify(datos) });
}

// ============================================================
// METRICAS
// ============================================================
async function fetchMetricasDashboard() {
  return apiRequest('/metricas/dashboard');
}

async function fetchRankingPeritos() {
  return apiRequest('/metricas/ranking-peritos');
}

async function fetchRendimientoIA() {
  return apiRequest('/metricas/rendimiento-ia');
}

// ============================================================
// AGENTE IA
// ============================================================
async function analizarFraude(siniestroId) {
  return apiRequest(`/fraude/analizar/${siniestroId}`, { method: 'POST' });
}

async function clasificarSiniestro(siniestroId) {
  return apiRequest(`/agente/clasificar/${siniestroId}`, { method: 'POST' });
}

async function consultarAgenteIA(prompt, contexto) {
  return apiRequest('/agente/consultar', {
    method: 'POST',
    body: JSON.stringify({ prompt, contexto }),
  });
}

async function chatExpediente(siniestroId, mensaje, usuario) {
  const data = await apiRequest(`/agente/chat/${siniestroId}`, {
    method: 'POST',
    body: JSON.stringify({ mensaje, usuario }),
  });
  if (socket) {
    socket.emit('chat:mensaje', { siniestroId, mensaje, usuario });
  }
  return data;
}

// ============================================================
// HEALTH CHECK
// ============================================================
async function checkBackendHealth() {
  try {
    const data = await apiRequest('/health');
    return data?.status === 'ok';
  } catch {
    return false;
  }
}

// ============================================================
// INICIALIZACION
// ============================================================
(function initConnector() {
  // Recuperar token guardado
  const savedToken = localStorage.getItem('siniestrosai_token');
  if (savedToken) authToken = savedToken;

  // Conectar WebSocket
  initBackendConnection();

  // Intentar cargar datos del backend
  setTimeout(async () => {
    const healthy = await checkBackendHealth();
    if (healthy) {
      console.log('[Backend] Servidor disponible. Cargando datos...');

      // Cargar metricas reales del backend
      const metricas = await fetchMetricasDashboard();
      if (metricas?.kpis) {
        const el = (id) => document.getElementById(id);
        if (el('kpiAbiertos')) el('kpiAbiertos').textContent = metricas.kpis.abiertos;
        if (el('kpiGestion')) el('kpiGestion').textContent = metricas.kpis.en_gestion;
        if (el('kpiResueltos')) el('kpiResueltos').textContent = metricas.kpis.resueltos;
        if (el('kpiTotal')) el('kpiTotal').textContent = metricas.kpis.total;
      }
    } else {
      console.log('[Backend] Servidor no disponible. Usando datos locales del frontend.');
    }
  }, 1500);
})();
