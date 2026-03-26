# SegurCaixa Adeslas - Sistema Inteligente de Gestión de Siniestros

Sistema de inteligencia artificial para la gestión automatizada y eficiente de reclamaciones de seguros, con múltiples agentes IA especializados, integración con n8n para orquestación de procesos, y API RESTful con soporte WebSocket en tiempo real.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DEL SISTEMA                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                          FRONTEND (React)                            │  │
│  │                   Dashboard de Gestión de Siniestros                │  │
│  └────────────────────────────────┬─────────────────────────────────────┘  │
│                                    │                                        │
│                    ┌───────────────┴───────────────┐                       │
│                    │       WebSocket / REST        │                       │
│                    │     (HTTP + Tiempo Real)      │                       │
│                    └───────────────┬───────────────┘                       │
│                                    │                                        │
│  ┌────────────────────────────────▼────────────────────────────────────┐  │
│  │                  API FASTAPI (Python)                               │  │
│  │           http://localhost:8000                                     │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ • Rutas: Clientes, Siniestros, Agentes, Dashboard                  │  │
│  │ • WebSocket: /ws/{client_type}/{client_id}                         │  │
│  │ • Health: /health                                                  │  │
│  │ • Docs: /api/docs (Swagger)                                        │  │
│  └────────────────────────────────┬──────────────────────────────────┘  │
│                                    │                                        │
│        ┌──────────────────────────┼──────────────────────────┐             │
│        │                          │                          │             │
│  ┌─────▼──────┐  ┌─────────────┐  │  ┌──────────────┐  ┌────▼──────┐     │
│  │    N8N     │  │  AGENTES IA │  │  │   REDIS      │  │ SQLITE DB │     │
│  │ Workflows  │  │ (6 Agentes) │  │  │   (Cache)    │  │ (Datos)   │     │
│  │ :5678      │  │ Orquestador │  │  │ :6379        │  │           │     │
│  │            │  │             │  │  │              │  │           │     │
│  └─────┬──────┘  │ 1. Voice    │  │  └──────────────┘  └────┬──────┘     │
│        │         │ 2. Chat     │  │                          │            │
│        │         │ 3. Docs     │  │                          │            │
│        │         │ 4. Classify │  │                          │            │
│        │         │ 5. Assign   │  │                          │            │
│        │         │ 6. Orch.    │  │                          │            │
│        │         └─────────────┘  │                          │            │
│        │                          │                          │            │
│        └──────────────────────────┴──────────────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Características Principales

### 🤖 Agentes IA Especializados

| Agente | Función | Descripción |
|--------|---------|-------------|
| **Agente de Voz** | Transcripción & Análisis | Procesa grabaciones de audio, transcribe llamadas y extrae información relevante |
| **Agente de Chat** | Interacción Conversacional | Mantiene conversaciones naturales con clientes y gestores |
| **Agente de Documentos** | Análisis de Archivos | Analiza documentación adjunta (facturas, reportes, etc.) |
| **Agente Clasificador** | Clasificación Automática | Clasifica siniestros por tipo, urgencia y prioridad |
| **Agente de Asignación** | Asignación Inteligente | Asigna casos a gestores según disponibilidad y experiencia |
| **Agente Orquestador** | Coordinación de Flujos | Coordina la ejecución del flujo completo de siniestros |

### 🔌 Integración n8n

- Orquestación de procesos complejos
- Webhooks para eventos de siniestros
- Integraciones con sistemas externos
- Automatización de tareas repetitivas

### 📡 API RESTful + WebSocket

- Endpoints RESTful completos
- Soporte WebSocket para actualizaciones en tiempo real
- Documentación Swagger automática
- Health checks y métricas

### 💾 Persistencia de Datos

- SQLite para desarrollo (fácilmente migrrable a PostgreSQL)
- Redis para cachés y sesiones
- Volúmenes Docker para persistencia

### 🔐 Seguridad & Privacidad

- CORS configurado
- Validación de entrada con Pydantic
- Manejo de errores robusto
- Cumplimiento RGPD (ver sección RGPD)

---

## Inicio Rápido

### Requisitos

- Python 3.10+
- Docker y Docker Compose (para deployment)
- Claves API: Anthropic Claude y/o OpenAI (opcional para desarrollo)

### Opción 1: Desarrollo Local (Recomendado)

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd siniestros-ia

# 2. Instalar dependencias
make install

# 3. Configurar variables de entorno (opcional)
# El archivo .env ya existe con valores por defecto
# Para usar APIs externas, edita .env y agrega tus claves

# 4. Ejecutar servidor
make run

# Servidor disponible en:
# - API: http://localhost:8000
# - Docs: http://localhost:8000/api/docs
# - Health: http://localhost:8000/health
```

### Opción 2: Docker Compose (Recomendado para Producción)

```bash
# 1. Configurar variables de entorno
cp docker/.env.example .env
# Editar .env y agregar claves API si es necesario

# 2. Iniciar stack completo
make docker-up

# Servicios disponibles:
# - API: http://localhost:8000
# - N8N: http://localhost:5678
# - Redis: localhost:6379
# - Docs: http://localhost:8000/api/docs
```

### Opción 3: Ejecución Manual

```bash
# Con Python
python run.py

# O con uvicorn directamente
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Comandos Disponibles (Make)

```bash
# Desarrollo
make run              # Ejecutar servidor con auto-reload
make dev              # Alias para 'run'
make prod             # Modo producción sin reload

# Docker
make docker-up        # Iniciar stack completo
make docker-down      # Detener stack
make docker-logs      # Ver logs en tiempo real
make docker-build     # Reconstruir imágenes

# Base de Datos
make seed             # Cargar datos de prueba
make clean            # Limpiar base de datos
make db-reset         # Reiniciar BD completamente

# Testing & Calidad
make test             # Ejecutar tests
make lint             # Análisis de código
make format           # Formatear código automáticamente
make check            # Tests + linter

# Utilidades
make help             # Mostrar esta ayuda
make info             # Información del proyecto
```

---

## Estructura del Proyecto

```
siniestros-ia/
├── backend/
│   ├── main.py                 # Punto de entrada FastAPI
│   ├── config/
│   │   ├── settings.py         # Configuración del app
│   │   └── __init__.py
│   ├── agents/
│   │   ├── orchestrator.py     # Agente orquestador
│   │   ├── voice_agent.py      # Agente de voz
│   │   ├── chat_agent.py       # Agente de chat
│   │   ├── docs_agent.py       # Agente de documentos
│   │   ├── classifier_agent.py # Agente clasificador
│   │   ├── assignment_agent.py # Agente de asignación
│   │   ├── base.py             # Clase base para agentes
│   │   ├── registry.py         # Registro de agentes
│   │   └── __init__.py
│   ├── api/
│   │   ├── routes_clientes.py      # Endpoints de clientes
│   │   ├── routes_siniestros.py    # Endpoints de siniestros
│   │   ├── routes_agentes.py       # Endpoints de agentes
│   │   ├── routes_dashboard.py     # Endpoints de dashboard
│   │   ├── websocket.py            # Gestor WebSocket
│   │   └── __init__.py
│   ├── db/
│   │   ├── models.py           # Modelos SQLAlchemy
│   │   ├── database.py         # Configuración BD
│   │   └── __init__.py
│   ├── schemas.py              # Esquemas Pydantic
│   ├── requirements.txt        # Dependencias Python
│   └── __init__.py
├── frontend/
│   ├── public/
│   │   ├── index.html          # Página principal SPA
│   │   └── static/             # Archivos estáticos
│   └── src/
│       ├── components/         # Componentes React
│       ├── pages/              # Páginas
│       └── App.jsx             # Componente raíz
├── docker/
│   ├── Dockerfile              # Imagen Docker multi-stage
│   ├── docker-compose.yml      # Stack completo
│   ├── .env.example            # Variables de entorno (ejemplo)
│   └── n8n-flows/              # Workflows de n8n
├── .env                        # Variables de entorno (desarrollo)
├── run.py                      # Script de inicio rápido
├── Makefile                    # Comandos útiles
├── README.md                   # Este archivo
└── .gitignore                  # Archivos ignorados por git
```

---

## Documentación de API

Una vez que el servidor esté corriendo, accede a la documentación interactiva en:

```
http://localhost:8000/api/docs
```

### Endpoints Principales

#### Health & Status
- `GET /health` - Estado del sistema y conexiones activas

#### Clientes
- `GET /api/v1/clientes` - Listar clientes
- `POST /api/v1/clientes` - Crear cliente
- `GET /api/v1/clientes/{cliente_id}` - Obtener cliente

#### Siniestros
- `GET /api/v1/siniestros` - Listar siniestros
- `POST /api/v1/siniestros` - Crear siniestro
- `GET /api/v1/siniestros/{siniestro_id}` - Obtener detalles
- `PUT /api/v1/siniestros/{siniestro_id}` - Actualizar siniestro

#### Agentes
- `GET /api/v1/agentes` - Listar agentes disponibles
- `POST /api/v1/agentes/{agente_id}/invoke` - Invocar agente
- `GET /api/v1/agentes/{agente_id}/status` - Estado del agente

#### Dashboard
- `GET /api/v1/dashboard/stats` - Estadísticas del sistema
- `GET /api/v1/dashboard/timeline/{siniestro_id}` - Timeline de siniestro

#### WebSocket
- `WS /ws/{client_type}/{client_id}` - Conexión WebSocket para actualizaciones en tiempo real

---

## Variables de Entorno

Copia `docker/.env.example` a `.env` y configura según tus necesidades:

```env
# APIs de LLM
ANTHROPIC_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here

# N8N
N8N_USER=admin
N8N_PASSWORD=your-password
N8N_API_KEY=your-key

# Redis
REDIS_PASSWORD=

# Base de Datos
DATABASE_URL=sqlite:///./data/siniestros.db

# Agentes (todos activados por defecto)
ENABLE_VOICE_AGENT=true
ENABLE_DOCUMENT_AGENT=true
ENABLE_CHAT_AGENT=true
ENABLE_CLASSIFIER_AGENT=true
ENABLE_ASSIGNMENT_AGENT=true
ENABLE_ORCHESTRATOR_AGENT=true
```

Ver `docker/.env.example` para la lista completa de variables con descripciones detalladas.

---

## Deployment con Docker

### Construcción

```bash
# Construir imagen
docker build -f docker/Dockerfile -t segurcaixa-api:latest .

# O usando compose
docker compose -f docker/docker-compose.yml build
```

### Inicio

```bash
# Iniciar stack completo
docker compose -f docker/docker-compose.yml up -d

# Ver logs
docker compose -f docker/docker-compose.yml logs -f

# Detener
docker compose -f docker/docker-compose.yml down
```

### Configuración de Producción

Para producción, edita `.env` con valores seguros:

```env
# Cambiar contraseñas predeterminadas
N8N_PASSWORD=secure-password-here
REDIS_PASSWORD=secure-redis-password

# Configurar base de datos PostgreSQL (recomendado)
DATABASE_URL=postgresql://user:password@postgres:5432/siniestros

# CORS restringido
ALLOWED_ORIGINS=https://yourdomain.com

# Desactivar reload
API_RELOAD=false

# Usar API keys reales
ANTHROPIC_API_KEY=your-production-key
OPENAI_API_KEY=your-production-key
```

---

## Flujo de Ejecución de un Siniestro

```
1. ENTRADA
   ↓ Nuevo siniestro recibido (API, Formulario, Chat, Llamada)

2. CLASIFICACIÓN
   ↓ Agente Clasificador analiza y categoriza

3. DOCUMENTACIÓN
   ↓ Agente de Documentos procesa archivos adjuntos

4. ANÁLISIS DE CHAT/VOZ
   ↓ Agentes de Chat/Voz extraen información adicional

5. ASIGNACIÓN
   ↓ Agente de Asignación asigna a gestor disponible

6. ORQUESTACIÓN
   ↓ Agente Orquestador coordina siguientes pasos

7. N8N WORKFLOWS
   ↓ Procesos complejos ejecutados en n8n

8. NOTIFICACIÓN
   ↓ WebSocket actualiza clientes en tiempo real

9. SEGUIMIENTO
   ↓ Timeline y estado actualizado
```

---

## Integración con n8n

El sistema incluye soporte completo para n8n (http://localhost:5678).

### Workflows Disponibles

Ver `docker/n8n-flows/` para workflows de ejemplo que:
- Escuchan webhooks de nuevos siniestros
- Clasifican automáticamente
- Notifican a gestores
- Integran con sistemas externos

### Crear Nuevo Workflow

1. Acceder a http://localhost:5678
2. Crear nuevo workflow
3. Usar nodos HTTP para llamar API en `http://api:8000`
4. Configurar webhooks para eventos de siniestros

---

## WebSocket - Actualizaciones en Tiempo Real

Conectarse para recibir actualizaciones en tiempo real:

```javascript
// JavaScript
const ws = new WebSocket('ws://localhost:8000/ws/gestor/gestor_001');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.tipo === 'siniestro_update') {
    console.log('Siniestro actualizado:', data.datos);
  } else if (data.tipo === 'agent_activity') {
    console.log('Agente activo:', data.datos);
  }
};
```

```python
# Python
import asyncio
import websockets
import json

async def connect():
    async with websockets.connect('ws://localhost:8000/ws/gestor/gestor_001') as ws:
        async for message in ws:
            data = json.loads(message)
            print(f"Received: {data['tipo']}")

asyncio.run(connect())
```

---

## RGPD y Protección de Datos

### Cumplimiento

✓ **Consentimiento**: Obtención explícita antes de procesar datos personales
✓ **Minimización**: Solo se recopilan datos necesarios
✓ **Seguridad**: Datos almacenados de forma segura
✓ **Derechos**: Implementación de ARCO (Acceso, Rectificación, Cancelación, Oposición)
✓ **Transparencia**: Políticas claras sobre tratamiento de datos

### Características de Seguridad

- **Encriptación**: Datos en tránsito (HTTPS) y en reposo
- **Validación**: Validación rigurosa de entrada
- **Auditoría**: Logs completos de todas las operaciones
- **Acceso**: Control de acceso basado en roles (RBAC)
- **Retención**: Políticas de eliminación automática de datos

### Implementación

```python
# Eliminación de datos personales
DELETE /api/v1/clientes/{cliente_id}/datos-personales

# Obtener datos de una persona (ARCO)
GET /api/v1/clientes/{cliente_id}/mi-datos

# Descargar datos en formato portable
GET /api/v1/clientes/{cliente_id}/exportar
```

---

## Troubleshooting

### Problema: Error "ModuleNotFoundError: No module named 'backend'"

**Solución:**
```bash
# Asegurar que PYTHONPATH está configurado
export PYTHONPATH=$PYTHONPATH:$(pwd)
python run.py

# O usar make
make run
```

### Problema: Puerto 8000 ya en uso

**Solución:**
```bash
# Cambiar puerto
API_PORT=8001 python run.py

# O matar proceso existente
lsof -ti:8000 | xargs kill -9
```

### Problema: Error de conexión a n8n

**Solución:**
```bash
# Verificar que n8n está corriendo
docker compose -f docker/docker-compose.yml ps

# Reiniciar servicios
make docker-down
make docker-up
```

### Problema: Base de datos corrupta

**Solución:**
```bash
# Resetear BD
make clean
make seed

# O con Docker
make docker-clean
make docker-up
```

---

## Testing

```bash
# Ejecutar tests
make test

# Con coverage
pytest tests/ --cov=backend

# Tests específicos
pytest tests/agents/ -v
```

---

## Mejoras Futuras

- [ ] Autenticación JWT
- [ ] Sistema de roles y permisos (RBAC)
- [ ] Integración con sistemas ERP
- [ ] Dashboards avanzados
- [ ] Reportes automáticos
- [ ] Análisis predictivo con ML
- [ ] Multi-idioma
- [ ] Mobile app

---

## Stack Tecnológico

### Backend
- **Framework**: FastAPI 0.109.0
- **Server**: Uvicorn 0.27.0
- **ORM**: SQLAlchemy 2.0.25
- **BD**: SQLite / PostgreSQL
- **Cache**: Redis 7
- **IA/LLM**: LangChain + Claude/GPT-4

### Orchestración
- **n8n**: Orquestación de procesos
- **Docker**: Containerización
- **Docker Compose**: Gestión de servicios

### Frontend
- **Framework**: React (desarrollado por separado)
- **WebSocket**: Soporte para tiempo real

### DevOps
- **CI/CD**: GitHub Actions (recomendado)
- **Contenedores**: Docker + Docker Compose
- **Monitoreo**: Prometheus + Grafana (opcional)

---

## Contribución

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## Licencia

Propietario - SegurCaixa Adeslas

---

## Contacto y Soporte

Para preguntas, reportar bugs o solicitar features:
- Email: desarrollo@segurcaixa.com
- Issues: https://github.com/segurcaixa/siniestros-ia/issues
- Documentación: https://wiki.segurcaixa.com/siniestros-ia

---

## Cambios Recientes

### v1.0.0 (2024-03-25)
- Publicación inicial
- 6 agentes IA funcionales
- Integración n8n
- API RESTful completa
- WebSocket en tiempo real
- Docker deployment
- Cumplimiento RGPD

---

**Última actualización**: 2024-03-25
**Mantenedor**: SegurCaixa Adeslas - Equipo de Desarrollo
