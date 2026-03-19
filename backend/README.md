# SiniestrosAI - Backend v2.0

Backend empresarial completo para el sistema autonomo de gestion de siniestros.

## Instalacion rapida

```bash
cd /workspaces/PRUEBA-IA-
chmod +x install.sh && ./install.sh
```

## Instalacion manual

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

El servidor arranca en `http://localhost:3001`

## Arquitectura

```
backend/
├── server.js                    # Express + Socket.IO + todos los servicios
├── package.json
├── .env.example
│
├── database/
│   ├── db.js                    # SQLite + seed (15 registros)
│   └── supabase.js              # Supabase cloud + migracion
│
├── middleware/
│   ├── auth.js                  # JWT + roles (admin, gestor, perito)
│   ├── security.js              # Rate limiting, brute force, sanitizacion, CSP
│   └── tenant.js                # Multitenancy por dominio/header/API key
│
├── routes/
│   ├── auth.js                  # Login, registro, perfil
│   ├── siniestros.js            # CRUD + busqueda
│   ├── clientes.js              # CRUD
│   ├── metricas.js              # Dashboard, ranking, tendencias
│   └── agentes.js               # CRUD peritos/agentes
│
├── controllers/
│   ├── authController.js
│   ├── siniestrosController.js
│   ├── clientesController.js
│   └── metricasController.js
│
├── services/
│   ├── fraudeService.js         # Anti-fraude 8 dimensiones
│   ├── whatsappService.js       # Twilio WhatsApp
│   ├── voiceService.js          # Twilio Voice + ElevenLabs
│   ├── backupService.js         # Backups horarios + diarios comprimidos
│   ├── logService.js            # Logging 5 niveles + rotacion
│   ├── healthService.js         # Health checks + circuit breaker
│   ├── queueService.js          # Cola de tareas con prioridad
│   ├── permissionsService.js    # RBAC granular por modulo
│   ├── webhookService.js        # Webhooks con HMAC-SHA256
│   ├── rulesEngine.js           # Motor de reglas configurable
│   ├── templateService.js       # Plantillas con variables dinamicas
│   ├── slaService.js            # Gestion de SLAs con escalado
│   ├── voiceBiometricService.js # Biometria vocal
│   ├── blockchainService.js     # Auditoria blockchain simulada
│   ├── callQueueService.js      # Cola de llamadas
│   └── learningService.js       # Aprendizaje continuo
│
├── agents/
│   └── mainAgent.js             # Agente IA principal (Claude API ready)
│
├── tests/
│   ├── runner.js                # Test runner con reporte
│   ├── siniestros.test.js       # 21 tests
│   ├── auth.test.js             # 12 tests
│   ├── fraude.test.js           # 10 tests
│   └── agentes.test.js          # 10 tests
│
└── docs/
    └── api.html                 # Documentacion interactiva (41 endpoints)
```

## API Endpoints (70+)

### Core
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/registro` | Registro |
| GET | `/api/auth/perfil` | Perfil (token) |
| GET/POST/PUT/DELETE | `/api/siniestros` | CRUD siniestros |
| GET | `/api/siniestros/buscar?q=` | Busqueda |
| GET/POST/PUT/DELETE | `/api/clientes` | CRUD clientes |
| GET | `/api/metricas/dashboard` | KPIs |
| GET | `/api/metricas/ranking-peritos` | Ranking |
| GET/POST/PUT | `/api/agentes` | CRUD agentes |

### IA y Fraude
| POST | `/api/fraude/analizar/:id` | Analisis anti-fraude |
| POST | `/api/agente/clasificar/:id` | Clasificacion IA |
| POST | `/api/agente/consultar` | Consulta libre IA |
| POST | `/api/agente/chat/:id` | Chat expediente |

### Admin
| GET/POST | `/api/admin/backups` | Backups |
| POST | `/api/admin/backups/restore` | Restaurar backup |
| GET | `/api/admin/logs` | Logs (filtros: level, category, date) |
| GET | `/api/admin/logs/stats` | Estadisticas de logs |
| GET | `/api/admin/queue` | Estado de la cola |
| POST | `/api/admin/queue/enqueue` | Encolar tarea |

### Rules Engine
| GET/POST | `/api/rules` | CRUD reglas |
| PUT/DELETE | `/api/rules/:id` | Actualizar/eliminar regla |
| POST | `/api/rules/:id/test` | Test de regla |

### Templates
| GET/POST | `/api/templates` | CRUD plantillas |
| POST | `/api/templates/:id/preview` | Preview |
| POST | `/api/templates/:id/send` | Enviar |
| GET | `/api/templates/history` | Historial |

### SLA
| GET | `/api/sla` | Lista SLAs |
| GET | `/api/sla/dashboard` | Dashboard SLA |
| GET | `/api/sla/breaches` | Incumplimientos |

### Webhooks
| GET/POST | `/api/webhooks` | CRUD webhooks |
| DELETE | `/api/webhooks/:id` | Eliminar |
| GET | `/api/webhooks/:id/log` | Log de entregas |

### Blockchain Audit
| GET | `/api/audit/chain` | Cadena completa |
| GET | `/api/audit/verify/:id` | Verificar expediente |
| GET | `/api/audit/verify` | Verificar integridad |

### Biometria Vocal
| POST | `/api/biometric/enroll` | Registrar huella vocal |
| POST | `/api/biometric/identify` | Identificar por voz |
| POST | `/api/biometric/verify` | Verificar cliente |

### Learning
| GET | `/api/learning/report` | Informe semanal |
| GET | `/api/learning/evolution` | Evolucion del modelo |
| GET | `/api/learning/patterns` | Patrones detectados |

### Health
| GET | `/api/health` | Health check basico |
| GET | `/api/health/detailed` | Health detallado |

### Otros
| GET | `/api/tenants` | Listar tenants |
| GET | `/api/permissions/:userId` | Permisos usuario |
| GET | `/api/callqueue` | Cola de llamadas |
| GET | `/api/docs` | Documentacion API |

## Scripts

```bash
npm start          # Produccion
npm run dev        # Desarrollo (auto-reload)
npm test           # Ejecutar 53 tests
npm run backup     # Backup manual
npm run health     # Estado del sistema
```

## Servicios activos en background

- **Health Monitor** - Verifica todos los servicios cada 30s
- **Backup Service** - Backup automatico cada hora
- **SLA Monitor** - Verifica cumplimiento cada 60s
- **Queue Processor** - 3 workers paralelos procesando tareas
- **Blockchain** - Registro inmutable de decisiones

## Base de datos

SQLite local (desarrollo) + Supabase (produccion opcional).
8 tablas: usuarios, clientes, siniestros, expedientes, agentes, llamadas, mensajes_whatsapp, documentos.
15 registros de ejemplo realistas en espanol.

## Tests

53 tests automaticos cubriendo: siniestros (21), auth (12), fraude (10), agentes (10).

```bash
npm test
```

## Seguridad

- JWT con roles y permisos granulares (10 modulos x 6 acciones)
- Rate limiting por IP y API key
- Proteccion brute force con lockout
- Sanitizacion de inputs (SQL injection, XSS)
- Security headers (CSP, HSTS, X-Frame-Options)
- HMAC-SHA256 para webhooks
- Blockchain audit trail
