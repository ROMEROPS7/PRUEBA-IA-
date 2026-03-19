# SiniestrosAI - Backend

Backend completo para el sistema autonomo de gestion de siniestros.

## Requisitos

- Node.js 18+
- npm

## Instalacion

```bash
cd backend
cp .env.example .env    # Configurar variables de entorno
npm install
```

## Ejecucion

```bash
# Desarrollo (con auto-reload)
npm run dev

# Produccion
npm start
```

El servidor arranca en `http://localhost:3001`

## API Endpoints

### Autenticacion
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/auth/login` | Login (email + password) |
| POST | `/api/auth/registro` | Registro nuevo usuario |
| GET | `/api/auth/perfil` | Obtener perfil (requiere token) |
| PUT | `/api/auth/password` | Cambiar password |

**Credenciales de prueba:** `ana@siniestrosai.com` / `admin123`

### Siniestros
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/siniestros` | Listar (filtros: estado, tipo, urgencia_min, orden) |
| GET | `/api/siniestros/buscar?q=texto` | Buscar por expediente, cliente, poliza |
| GET | `/api/siniestros/:id` | Detalle completo con timeline |
| POST | `/api/siniestros` | Crear nuevo |
| PUT | `/api/siniestros/:id` | Actualizar (estado, perito, etc.) |
| DELETE | `/api/siniestros/:id` | Eliminar (solo admin) |

### Clientes
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/clientes` | Listar (filtro: buscar) |
| GET | `/api/clientes/:id` | Detalle con siniestros |
| POST | `/api/clientes` | Crear |
| PUT | `/api/clientes/:id` | Actualizar |
| DELETE | `/api/clientes/:id` | Eliminar (solo admin, sin siniestros) |

### Metricas
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/metricas/dashboard` | KPIs principales |
| GET | `/api/metricas/por-tipo` | Distribucion por tipo |
| GET | `/api/metricas/por-estado` | Distribucion por estado |
| GET | `/api/metricas/por-zona` | Distribucion por zona |
| GET | `/api/metricas/tendencia` | Tendencia mensual |
| GET | `/api/metricas/ranking-peritos` | Ranking de peritos |
| GET | `/api/metricas/rendimiento-ia` | Rendimiento del sistema IA |

### Agentes/Peritos
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/agentes` | Listar (filtros: tipo, zona, disponible) |
| GET | `/api/agentes/:id` | Detalle con siniestros asignados |
| POST | `/api/agentes` | Crear |
| PUT | `/api/agentes/:id` | Actualizar disponibilidad |

### IA y Servicios
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/fraude/analizar/:id` | Analisis anti-fraude completo |
| POST | `/api/agente/clasificar/:id` | Clasificacion IA de siniestro |
| POST | `/api/agente/consultar` | Consulta libre al agente IA |
| GET | `/api/agente/resumen/:id` | Resumen ejecutivo |
| POST | `/api/agente/chat/:id` | Chat IA del expediente |
| POST | `/api/upload` | Subir archivos (multipart) |

### Webhooks
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/whatsapp/webhook` | Webhook Twilio WhatsApp |
| POST | `/api/voz/entrante` | Webhook Twilio Voice |

### Health
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/health` | Estado del servidor |

## WebSockets

Conectar a `ws://localhost:3001` con Socket.IO:

```javascript
const socket = io('http://localhost:3001');

// Eventos que emite el servidor
socket.on('siniestro:creado', data => { });
socket.on('siniestro:actualizado', data => { });
socket.on('feed:actividad', data => { });
socket.on('chat:respuesta', data => { });
socket.on('fraude:analisis', data => { });

// Eventos que acepta
socket.emit('siniestro:nuevo', { ... });
socket.emit('chat:mensaje', { siniestroId, mensaje, usuario });
```

## Estructura

```
backend/
├── server.js              # Servidor Express + Socket.IO
├── package.json
├── .env.example
├── database/
│   └── db.js              # SQLite + seed data (15 registros)
├── middleware/
│   └── auth.js            # JWT + roles (admin, gestor, perito)
├── routes/
│   ├── auth.js
│   ├── siniestros.js
│   ├── clientes.js
│   ├── metricas.js
│   └── agentes.js
├── controllers/
│   ├── authController.js
│   ├── siniestrosController.js
│   ├── clientesController.js
│   └── metricasController.js
├── services/
│   ├── fraudeService.js   # Algoritmo anti-fraude 8 dimensiones
│   ├── whatsappService.js # Twilio WhatsApp
│   └── voiceService.js    # Twilio Voice + ElevenLabs
└── agents/
    └── mainAgent.js       # Agente IA principal (Claude API ready)
```

## Base de datos

SQLite con las tablas: usuarios, clientes, siniestros, expedientes, agentes, llamadas, mensajes_whatsapp, documentos. Incluye 15 registros de ejemplo realistas.
