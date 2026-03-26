# Guía Rápida de Inicio - SegurCaixa Adeslas

## 3 Pasos para Empezar

### 1️⃣ Instalación de Dependencias

```bash
# Opción A: Con Make (recomendado)
make install

# Opción B: Manual
python3 -m pip install -r backend/requirements.txt
```

### 2️⃣ Ejecutar el Servidor

```bash
# Opción A: Con Make (development mode con reload automático)
make run

# Opción B: Script directo
python3 run.py

# Opción C: Uvicorn directo
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 3️⃣ Acceder a la Aplicación

- **API Docs (Swagger)**: http://localhost:8000/api/docs
- **Health Check**: http://localhost:8000/health
- **Frontend**: http://localhost:3000 (si está corriendo)

---

## Docker Compose (Recomendado para Producción)

```bash
# Configurar variables (opcional - ya tienen valores por defecto)
# cp docker/.env.example .env

# Iniciar todo (API + N8N + Redis)
make docker-up

# Ver logs
make docker-logs

# Detener
make docker-down
```

**Servicios disponibles:**
- API: http://localhost:8000
- N8N: http://localhost:5678
- Redis: localhost:6379
- Docs: http://localhost:8000/api/docs

---

## Estructura Básica

```
├── backend/                    # Código Python
│   ├── main.py                # Entrada de FastAPI
│   ├── agents/                # 6 Agentes IA
│   ├── api/                   # Endpoints REST
│   ├── db/                    # Base de datos
│   └── requirements.txt       # Dependencias
├── docker/                     # Deployment
│   ├── Dockerfile             # Imagen Docker
│   ├── docker-compose.yml     # Stack completo
│   ├── .env.example           # Variables
│   └── n8n-flows/             # Workflows n8n
├── frontend/                   # Aplicación React (aparte)
├── run.py                      # Script de inicio
├── Makefile                    # Comandos útiles
└── README.md                   # Documentación completa
```

---

## Comandos Más Útiles

```bash
# Desarrollo
make run              # Iniciar con reload automático
make docker-up        # Stack completo
make docker-logs      # Ver logs en vivo
make clean            # Limpiar base de datos

# Testing
make test             # Ejecutar tests
make lint             # Verificar código
make format           # Formatear automáticamente

# Información
make help             # Ver todos los comandos
make info             # Información del proyecto
```

---

## Variables de Entorno Importantes

```env
# APIs de IA (opcional - agentes funcionan sin estas)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Base de datos (por defecto SQLite local)
DATABASE_URL=sqlite:///./data/siniestros.db

# N8N (si usas docker-compose)
N8N_USER=admin
N8N_PASSWORD=password
```

Ver `docker/.env.example` para lista completa.

---

## Primeros Pasos

### 1. Crear un Cliente
```bash
curl -X POST "http://localhost:8000/api/v1/clientes" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan García",
    "email": "juan@example.com",
    "telefono": "+34666777888"
  }'
```

### 2. Crear un Siniestro
```bash
curl -X POST "http://localhost:8000/api/v1/siniestros" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "1",
    "numero_siniestro": "SIN-2024-001",
    "descripcion": "Accidente de tráfico",
    "tipo_reclamacion": "auto"
  }'
```

### 3. Ver Documentación Interactiva
Abre en navegador: http://localhost:8000/api/docs

---

## Troubleshooting Rápido

**Puerto 8000 ocupado:**
```bash
# Cambiar puerto
API_PORT=8001 make run

# O matar proceso
lsof -ti:8000 | xargs kill -9
```

**Error de módulo Python:**
```bash
export PYTHONPATH=$PYTHONPATH:$(pwd)
python3 run.py
```

**Base de datos corrupta:**
```bash
make clean           # Elimina BD
make seed            # Recarga datos de prueba
```

**Problemas con Docker:**
```bash
# Reiniciar servicios
make docker-down
make docker-up

# Limpiar volúmenes (⚠️ pierde datos)
make docker-clean
```

---

## Próximos Pasos

1. Lee **README.md** para documentación completa
2. Explora **http://localhost:8000/api/docs** para todos los endpoints
3. Configura claves API en `.env` si quieres usar LLMs
4. Accede a **http://localhost:5678** para configurar workflows n8n
5. Conecta el frontend React en el puerto 3000

---

## Ayuda Rápida

```bash
make help    # Ver todos los comandos disponibles
make info    # Información del proyecto
```

¡Listo! Ya puedes empezar a usar el sistema. 🚀
