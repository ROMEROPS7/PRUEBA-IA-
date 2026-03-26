# Guía de Deployment - SegurCaixa Adeslas

Documentación completa para desplegar el sistema en diferentes entornos.

## 📋 Índice de Archivos

### Archivos de Deployment (docker/)

1. **Dockerfile** (1.3K)
   - Multi-stage build para imagen Docker optimizada
   - Base: Python 3.12-slim
   - Expone puerto 8000
   - Incluye health checks

2. **docker-compose.yml** (3.9K)
   - Stack completo: API + N8N + Redis
   - Configuración de volúmenes para persistencia
   - Variables de entorno centralizadas
   - Network compartida entre servicios

3. **.env.example** (4.7K)
   - Template con todas las variables de configuración
   - Comentarios en español explicando cada variable
   - Valores por defecto (seguros para desarrollo)
   - Listo para copiar y personalizar

4. **n8n-flows/siniestro_workflow.json** (9.8K)
   - Workflow completo de n8n para gestión de siniestros
   - 11 nodos: trigger, clasificación, decisión, asignación, notificación
   - Integración con API FastAPI
   - Registra timeline en cada paso

### Archivos de Configuración (raíz)

1. **.env** (1.3K)
   - Configuración para desarrollo local
   - Valores por defecto (API_RELOAD=true, LOG_LEVEL=debug)
   - Copia automática de docker/.env.example durante setup

2. **run.py** (4.9K)
   - Script de inicio rápido
   - Validación de Python 3.10+
   - Instalación automática de dependencias
   - Configuración de PYTHONPATH
   - Inicio de uvicorn

3. **Makefile** (8.0K)
   - Comandos para desarrollo y deployment
   - 20+ targets para diferentes tareas
   - Colores y mensajes informativos
   - Gestión completa de Docker

4. **README.md** (20K)
   - Documentación completa en español
   - Arquitectura del sistema
   - Descripción de 6 agentes IA
   - Guía de inicio rápido
   - API documentation
   - RGPD compliance
   - Troubleshooting

5. **QUICK_START.md** (4.5K)
   - Guía de inicio rápido (3 pasos)
   - Comandos más útiles
   - Primeros pasos prácticos
   - Troubleshooting rápido

---

## 🚀 Flujos de Deployment

### Opción 1: Desarrollo Local (Recomendado para Desarrollo)

```bash
# 1. Instalar
make install

# 2. Ejecutar
make run

# ✓ Disponible en http://localhost:8000
```

**Ventajas:**
- Sin Docker (más simple)
- Hot reload automático
- Rápido para desarrollo
- Fácil debugging

**Desventajas:**
- Requiere Python 3.10+
- Menos aislado del sistema

---

### Opción 2: Docker Compose (Recomendado para Producción)

```bash
# 1. Configurar (opcional)
cp docker/.env.example .env
# Editar .env según necesidades

# 2. Iniciar
make docker-up

# ✓ Servicios disponibles:
#   - API: http://localhost:8000
#   - N8N: http://localhost:5678
#   - Redis: localhost:6379
```

**Ventajas:**
- Stack completo reproducible
- Aislamiento total
- Fácil scalability
- Production-ready

**Desventajas:**
- Requiere Docker y Docker Compose
- Ligeramente más lento en desarrollo

---

## 📝 Variables de Entorno Críticas

### Mínimas para Funcionamiento

```env
# Base de datos
DATABASE_URL=sqlite:///./data/siniestros.db

# API
API_PORT=8000
API_HOST=0.0.0.0
```

### Recomendadas para Producción

```env
# Cambiar contraseñas predeterminadas
N8N_PASSWORD=secure-password-here
REDIS_PASSWORD=secure-password-here

# Base de datos PostgreSQL (en lugar de SQLite)
DATABASE_URL=postgresql://user:password@localhost:5432/siniestros

# CORS restringido
ALLOWED_ORIGINS=https://yourdomain.com

# APIs de LLM
ANTHROPIC_API_KEY=sk-...
OPENAI_API_KEY=sk-...
```

Ver **docker/.env.example** para lista completa con descripciones.

---

## 🐳 Comandos Docker Importantes

```bash
# Stack
make docker-up          # Iniciar servicios
make docker-down        # Detener servicios
make docker-build       # Reconstruir imágenes
make docker-logs        # Ver logs en tiempo real
make docker-ps          # Ver estado de contenedores
make docker-shell       # Bash en contenedor

# Limpieza
make docker-clean       # Eliminar volúmenes (⚠️ PIERDE DATOS)
```

---

## 🔧 Estructura de Docker Compose

```yaml
services:
  api:                   # FastAPI (puerto 8000)
    - Volumen: siniestros_data
    - Red: segurcaixa_network
    - Healthcheck: /health

  n8n:                   # Workflow engine (puerto 5678)
    - Volumen: n8n_data
    - Red: segurcaixa_network
    - Usuario: admin

  redis:                 # Cache (puerto 6379)
    - Volumen: redis_data
    - Red: segurcaixa_network
    - Persistencia: AOF enabled

networks:
  segurcaixa_network:    # Red privada compartida

volumes:
  siniestros_data:       # Datos de la API
  n8n_data:              # Configuración de n8n
  redis_data:            # Cache persistido
```

---

## 📊 Flujo Completo de un Siniestro

```
1. Webhook → API recibe nuevo siniestro
2. Clasificador → Analiza y categoriza
3. Documentos → Procesa archivos
4. Decisión → Verifica prioridad
5. Asignación → Asigna a gestor
6. N8N → Orquesta procesos complejos
7. Timeline → Registra cada paso
8. WebSocket → Notifica clientes en tiempo real
```

Ver el archivo **docker/n8n-flows/siniestro_workflow.json** para detalles técnicos.

---

## 🔐 Seguridad en Producción

### Checklist Pre-Deployment

- [ ] Cambiar contraseñas por defecto (N8N, Redis)
- [ ] Configurar HTTPS/SSL en reverse proxy
- [ ] Restringir CORS a dominios conocidos
- [ ] Usar base de datos PostgreSQL
- [ ] Configurar backups automáticos
- [ ] Activar logging y monitoreo
- [ ] Implementar rate limiting
- [ ] Configurar firewall/security groups
- [ ] Usar secrets management (no en .env)
- [ ] Validar cumplimiento RGPD

---

## 📈 Escalabilidad

### Desarrollo Local
- 1 proceso Python
- SQLite local
- Suficiente para < 100 usuarios

### Docker Single Instance
- 3 servicios (API, N8N, Redis)
- SQLite o PostgreSQL
- Suficiente para < 1000 usuarios

### Producción Escalable
- Múltiples réplicas de API (load balancer)
- PostgreSQL con replicación
- Redis cluster
- Separar N8N en instancia propia
- CDN para assets estáticos

---

## 🔍 Monitoreo y Logs

### Logs de Desarrollo
```bash
make docker-logs        # Todos los servicios
make docker-logs-api    # Solo API
make docker-logs-n8n    # Solo N8N
make docker-logs-redis  # Solo Redis
```

### Puntos de Monitoreo
- `/health` - Estado del sistema
- `http://localhost:5678` - N8N UI
- Base de datos (`data/siniestros.db`)
- Volúmenes Docker

---

## 🆘 Troubleshooting Common

| Problema | Solución |
|----------|----------|
| Puerto 8000 ocupado | `API_PORT=8001 make run` |
| ModuleNotFoundError | `export PYTHONPATH=$PYTHONPATH:$(pwd)` |
| Timeout en BD | Aumentar `DATABASE_POOL_SIZE` en .env |
| N8N no responde | `make docker-down && make docker-up` |
| Datos perdidos | Usar volúmenes Docker (no sucederá) |

Ver **README.md** para troubleshooting más detallado.

---

## 📚 Documentación Relacionada

- **README.md** - Documentación completa del sistema
- **QUICK_START.md** - Guía de 3 pasos para empezar
- **Dockerfile** - Especificación de imagen Docker
- **docker-compose.yml** - Configuración de stack
- **docker/.env.example** - Variables de entorno
- **backend/main.py** - Código FastAPI
- **http://localhost:8000/api/docs** - API Swagger (cuando esté corriendo)

---

## 💡 Tips y Buenas Prácticas

1. **Desarrollo**: Usa `make run` con Python local
2. **Testing**: Usa `make test` antes de commit
3. **Producción**: Usa `make docker-up` con variables configuradas
4. **Backups**: Respaldas volúmenes Docker regularmente
5. **Updates**: Mantén imágenes Docker actualizadas
6. **Logs**: Revisa logs regularmente para issues
7. **Monitoreo**: Implementa alertas en `/health`
8. **CI/CD**: Automatiza build y deploy

---

## 🎯 Próximos Pasos

1. ✅ Leer este archivo
2. ✅ Leer QUICK_START.md
3. ⬜ Ejecutar `make install` y `make run`
4. ⬜ Verificar en http://localhost:8000/api/docs
5. ⬜ Crear primer cliente/siniestro
6. ⬜ Configurar variables en .env si necesitas LLMs
7. ⬜ Pasar a `make docker-up` para producción

---

**Última actualización**: 2024-03-25
**Versión**: 1.0.0
**Maintainer**: SegurCaixa Adeslas - Equipo de Desarrollo
