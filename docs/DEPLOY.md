# Despliegue Rápido - SiniestrosAI

## Opción 1: Render.com (RECOMENDADO - Gratis)

1. Ve a [render.com](https://render.com) y crea una cuenta
2. Haz clic en **"New +"** → **"Blueprint"**
3. Conecta tu repo de GitHub: `ROMEROPS7/PRUEBA-IA-`
4. Render detectará el `render.yaml` y creará automáticamente:
   - Backend (Node.js)
   - PostgreSQL
   - Frontend (estático)
5. En las variables de entorno, añade tu `ANTHROPIC_API_KEY`
6. Haz clic en **"Apply"**
7. Espera ~5 minutos. ¡Listo!

## Opción 2: Railway.app (Rápido - $5/mes)

1. Ve a [railway.app](https://railway.app)
2. **"New Project"** → **"Deploy from GitHub Repo"**
3. Selecciona `ROMEROPS7/PRUEBA-IA-`
4. Añade un servicio PostgreSQL
5. Configura variables de entorno:
   - `ANTHROPIC_API_KEY=tu-key`
   - `DB_HOST`, `DB_PORT`, etc. (Railway los genera automáticamente)
6. Deploy. Listo en 3 minutos.

## Opción 3: VPS Manual (DigitalOcean, Hetzner)

```bash
# En el servidor:
git clone https://github.com/ROMEROPS7/PRUEBA-IA-.git
cd PRUEBA-IA-/backend
cp .env.example .env
# Editar .env con datos reales
docker compose up -d
docker compose exec backend node src/database/migrate.js
docker compose exec backend node src/database/seed.js
```

## Post-despliegue

Una vez desplegado, ejecuta las migraciones:
```bash
# En Render/Railway, desde la consola del servicio:
node src/database/migrate.js
node src/database/seed.js
```

URL de la demo: `https://tu-servicio.onrender.com`
API docs: `https://tu-servicio.onrender.com/api/docs`
