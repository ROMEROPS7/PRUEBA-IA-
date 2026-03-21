# SiniestrosAI — Backend

Motor de gestión autónoma de siniestros con inteligencia artificial para aseguradoras.

## Arquitectura

```
Cliente → API REST → Orquestador → Agentes IA (Claude) → Resolución automática
                         ↓
                    PostgreSQL (persistencia)
```

### Agentes IA Especializados

| Agente | Función |
|--------|---------|
| **Recepcionista** | Recibe el siniestro, verifica póliza, extrae datos clave |
| **Clasificador** | Determina tipo, prioridad y complejidad |
| **Antifraude** | Analiza indicadores de fraude y score de riesgo |
| **Legal** | Verifica coberturas, exclusiones y normativa |
| **Valorador** | Estima el coste de los daños con desglose |
| **Perito Virtual** | Peritaje remoto con análisis de documentación |
| **Negociador** | Selecciona taller y negocia precios |
| **Comunicaciones** | Genera mensajes personalizados para el cliente |
| **Pagos** | Procesa y verifica la orden de pago |
| **Calidad** | Programa encuestas y mide satisfacción |

### Flujo de procesamiento

1. Cliente reporta siniestro (web, app, WhatsApp, teléfono, email)
2. **Recepcionista** verifica póliza y extrae datos
3. **Clasificador** categoriza y prioriza
4. **Legal** + **Antifraude** analizan en paralelo
5. **Valorador** estima daños
6. **Perito Virtual** evalúa si necesita perito presencial
7. **Negociador** negocia con talleres (auto)
8. Si importe < límite de autonomía → **auto-aprobación + pago**
9. Si importe > límite → escalado a gestor humano
10. **Comunicaciones** informa al cliente en cada paso
11. **Calidad** programa encuesta post-resolución

## Inicio rápido

### Requisitos

- Node.js 18+
- PostgreSQL 16+
- API key de Anthropic (Claude)

### Con Docker (recomendado)

```bash
# 1. Clonar y configurar
cp .env.example .env
# Editar .env con tu ANTHROPIC_API_KEY

# 2. Levantar todo
docker compose up -d

# 3. Migrar y sembrar datos
docker compose exec backend node src/database/migrate.js
docker compose exec backend node src/database/seed.js
```

### Sin Docker

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar
cp .env.example .env
# Editar .env (DB, JWT_SECRET, ANTHROPIC_API_KEY)

# 3. Crear base de datos PostgreSQL
createdb siniestrosai

# 4. Migrar y sembrar
npm run setup

# 5. Arrancar
npm start       # producción
npm run dev     # desarrollo (con nodemon)
```

### Credenciales de demo

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@segurcaixa.demo | Demo2024! |
| Gestor | gestor@segurcaixa.demo | Demo2024! |
| Perito | perito@segurcaixa.demo | Demo2024! |
| Cliente | maria.lopez@demo.com | Demo2024! |

## API

Base URL: `http://localhost:3001/api/v1`

Documentación Swagger: `http://localhost:3001/api/docs` (solo en desarrollo)

### Endpoints principales

**Autenticación**
- `POST /auth/login` — Iniciar sesión
- `POST /auth/refresh` — Renovar token
- `GET /auth/me` — Perfil actual

**Siniestros**
- `GET /siniestros` — Listar (con filtros y paginación)
- `POST /siniestros` — Crear (activa procesamiento IA automático)
- `GET /siniestros/:id` — Detalle completo (con tareas IA, docs, historial)
- `PATCH /siniestros/:id` — Actualizar (gestor/admin)
- `POST /siniestros/:id/reprocesar` — Relanzar IA
- `GET /siniestros/:id/timeline` — Timeline cronológico

**Pólizas**
- `GET /polizas` — Listar
- `GET /polizas/:id` — Detalle con siniestros
- `GET /polizas/numero/:numero` — Buscar por número

**Agentes IA**
- `GET /agentes` — Estado y estadísticas
- `GET /agentes/:nombre/tareas` — Tareas de un agente
- `PATCH /agentes/:nombre` — Configurar agente

**Dashboard**
- `GET /dashboard` — KPIs (tasa automatización, tiempo medio, costes, fraude)
- `GET /dashboard/rendimiento-agentes` — Rendimiento por agente

**Admin**
- `GET /admin/usuarios` — Gestión de usuarios
- `GET /admin/audit-log` — Registro de auditoría RGPD
- `GET /admin/rgpd/export/:userId` — Exportación RGPD
- `GET /admin/stats/sistema` — Estadísticas del sistema

### Ejemplo: Crear siniestro

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria.lopez@demo.com","password":"Demo2024!"}' \
  | jq -r '.token')

# 2. Crear siniestro (la IA lo procesa automáticamente)
curl -X POST http://localhost:3001/api/v1/siniestros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tipo": "auto_colision",
    "descripcion": "Colisión por alcance en la M-30. Frené pero el coche de atrás me golpeó. Daños en paragolpes trasero y maletero. Sin heridos.",
    "numero_poliza": "AUT-2024-001234",
    "fecha_ocurrencia": "2024-06-15T10:30:00Z",
    "lugar_ocurrencia": "M-30, Madrid, km 12",
    "canal_entrada": "app_movil"
  }'
```

## Seguridad

- JWT con expiración configurable + refresh tokens
- Bcrypt (12 rounds) para passwords
- Rate limiting (100 req/15min por IP)
- Helmet (headers de seguridad)
- Validación estricta con Joi en todos los inputs
- CORS configurado por dominio
- Bloqueo de cuenta tras 5 intentos fallidos (30 min)
- Audit log completo (RGPD compliance)
- Encriptación AES-256-CBC para datos sensibles
- Exportación RGPD de datos del usuario

## Tests

```bash
npm test              # Todos los tests + coverage
npm run test:unit     # Solo unitarios
npm run test:integration  # Solo integración (requiere DB)
```

## Variables de entorno

Ver `.env.example` para la lista completa. Las mínimas necesarias:

| Variable | Descripción |
|----------|-------------|
| `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL |
| `JWT_SECRET` | Secret para JWT (min 64 chars) |
| `ANTHROPIC_API_KEY` | API key de Claude |

## Tipos de siniestros soportados

**Auto:** colisión, robo, incendio, cristales, asistencia
**Negocio:** agua, incendio, robo, responsabilidad civil, daños eléctricos, pérdida de beneficios

## Licencia

Propietario — © 2024 SiniestrosAI
