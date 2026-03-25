# SiniestrosAI

**Plataforma de gestion inteligente de siniestros de seguros con 10 agentes de IA especializados.**

## Que es SiniestrosAI?

SiniestrosAI es una plataforma SaaS que automatiza y optimiza la gestion de siniestros en companias de seguros mediante inteligencia artificial. El sistema cuenta con 10 agentes especializados que cubren todo el ciclo de vida de un siniestro.

## Agentes de IA

| Agente | Funcion |
|--------|---------|
| Recepcionista | Recepcion y registro inicial de siniestros |
| Clasificador | Clasificacion automatica por tipo y severidad |
| Antifraude | Deteccion de patrones de fraude |
| Valorador | Valoracion economica del siniestro |
| Perito Virtual | Peritacion remota con IA de vision |
| Negociador | Negociacion automatizada de indemnizaciones |
| Comunicaciones | Gestion de comunicaciones con asegurados |
| Legal | Analisis juridico y cumplimiento normativo |
| Reportero | Generacion de informes y analytics |
| Secretaria | Coordinacion entre agentes y flujos |

## Stack Tecnologico

- **Backend:** Node.js + Express.js
- **Base de datos:** PostgreSQL
- **Frontend:** HTML5 + JavaScript + CSS3
- **IA:** API de Anthropic (Claude)
- **Containerizacion:** Docker + Docker Compose
- **Deploy:** Railway / Render

## Inicio Rapido

\`\`\`bash
# 1. Clonar repositorio
git clone https://github.com/ROMEROPS7/PRUEBA-IA-.git
cd PRUEBA-IA-

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Instalar dependencias del backend
cd backend && npm install && cd ..

# 4. Iniciar con Docker
docker-compose up -d

# 5. O iniciar manualmente
cd backend && npm start
\`\`\`

## Estructura del Proyecto

\`\`\`
PRUEBA-IA-/
  backend/           # API REST (Express.js + PostgreSQL)
    src/
      server.js      # Servidor principal
      middleware/     # Sanitizacion, CSRF, auth
  docs/              # Documentacion y auditorias
  app-movil/         # Aplicacion movil
  js/                # Modulos JavaScript frontend
    modules/         # Modulos separados del frontend
  *.html             # Portales web (cliente, gestor, perito, etc.)
  config.js          # Configuracion centralizada de URLs
  secure-token-manager.js  # Gestion segura de tokens
  backend-connector.js     # Conector API con retry y auth
  docker-compose.yml # Orquestacion Docker
  Dockerfile         # Imagen Docker
\`\`\`

## Portales Disponibles

- **Portal Cliente** - Seguimiento de siniestros para asegurados
- **Portal Gestor** - Panel de gestion para tramitadores
- **Portal Perito** - Herramientas de peritacion virtual
- **Portal Taller** - Gestion para talleres de reparacion
- **Portal Reparador** - Interfaz para reparadores
- **Panel SaaS** - Administracion multi-tenant
- **SuperAdmin** - Control total del sistema
- **Panel Empresa** - Dashboard empresarial

## Configuracion de Prompts de IA

Los prompts de los agentes IA son privados y no se incluyen en el repositorio.
Debes configurarlos como variables de entorno antes de arrancar el backend.

**Pasos:**

1. Consulta `prompts/prompts.example.json` para ver la estructura esperada de cada prompt.
2. En tu archivo `.env` (backend) define cada prompt con el prefijo `PROMPT_`:

```env
PROMPT_RECEPCIONISTA=Eres el agente RECEPCIONISTA...
PROMPT_CLASIFICADOR=Eres el agente CLASIFICADOR...
PROMPT_ANTIFRAUDE=Eres el agente ANTIFRAUDE...
PROMPT_VALORADOR=Eres el agente VALORADOR...
PROMPT_PERITO_VIRTUAL=Eres el agente PERITO VIRTUAL...
PROMPT_NEGOCIADOR=Eres el agente NEGOCIADOR...
PROMPT_COMUNICACIONES=Eres el agente de COMUNICACIONES...
PROMPT_LEGAL=Eres el agente LEGAL...
PROMPT_PAGOS=Eres el agente de PAGOS...
```

3. El sistema lanzara un error explicito si falta alguna variable al iniciar un agente.

## Seguridad

- Tokens JWT con gestion segura (SecureTokenManager)
- Proteccion CSRF en formularios
- Sanitizacion de inputs en backend
- Configuracion centralizada de URLs por entorno
- Proteccion de rama main (requiere PR + aprobacion)

## Licencia

Propietario / Privado - Ver [LICENSE](LICENSE) para mas detalles.
