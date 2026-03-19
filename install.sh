#!/bin/bash
# ============================================
# SiniestrosAI - Script de Instalacion v2.0
# ============================================
set -e

echo ""
echo "============================================"
echo "  SiniestrosAI - Instalacion Completa"
echo "============================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

step() { echo -e "${BLUE}[PASO]${NC} $1"; }
ok() { echo -e "${GREEN}  [OK]${NC} $1"; }
warn() { echo -e "${YELLOW}  [!]${NC} $1"; }

# Verificar Node.js
step "Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    ok "Node.js $NODE_VERSION encontrado"
else
    echo "ERROR: Node.js no encontrado. Instala Node.js 18+ primero."
    exit 1
fi

# Verificar npm
step "Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    ok "npm $NPM_VERSION encontrado"
else
    echo "ERROR: npm no encontrado."
    exit 1
fi

# Crear directorios necesarios
step "Creando directorios..."
mkdir -p backend/uploads
mkdir -p backend/backups
mkdir -p backend/logs
mkdir -p backend/database
ok "Directorios creados: uploads, backups, logs, database"

# Instalar dependencias del backend
step "Instalando dependencias del backend..."
cd backend
npm install 2>&1 | tail -3
ok "Dependencias instaladas"

# Configurar .env si no existe
step "Configurando variables de entorno..."
if [ ! -f .env ]; then
    cp .env.example .env
    ok ".env creado desde .env.example"
    warn "Edita backend/.env con tus credenciales reales"
else
    ok ".env ya existe, no se sobreescribe"
fi

# Inicializar base de datos
step "Inicializando base de datos SQLite..."
node -e "
const {initDatabase, seedDatabase} = require('./database/db');
(async () => {
    await initDatabase();
    await seedDatabase();
    console.log('  [OK] Base de datos inicializada con datos de ejemplo');
    process.exit(0);
})();
" 2>&1

# Ejecutar tests
step "Ejecutando tests..."
if [ -f tests/runner.js ]; then
    node tests/runner.js 2>&1 || warn "Algunos tests fallaron - revisar"
else
    warn "Tests no encontrados, omitiendo"
fi

# Crear backup inicial
step "Creando backup inicial..."
node -e "
const backup = require('./services/backupService');
backup.backupNow().then(r => {
    console.log('  [OK] Backup inicial creado:', r.nombre || 'OK');
    process.exit(0);
}).catch(e => {
    console.log('  [!] No se pudo crear backup:', e.message);
    process.exit(0);
});
" 2>&1

cd ..

echo ""
echo "============================================"
echo -e "  ${GREEN}Instalacion completada${NC}"
echo "============================================"
echo ""
echo "  Para iniciar el backend:"
echo "    cd backend && npm run dev"
echo ""
echo "  Para iniciar el frontend:"
echo "    python3 -m http.server 8080"
echo ""
echo "  URLs:"
echo "    Frontend:  http://localhost:8080"
echo "    Backend:   http://localhost:3001"
echo "    API Docs:  http://localhost:3001/api/docs"
echo "    Health:    http://localhost:3001/api/health"
echo ""
echo "  Credenciales de prueba:"
echo "    Email:     ana@siniestrosai.com"
echo "    Password:  admin123"
echo ""
echo "  Scripts utiles:"
echo "    npm test          - Ejecutar tests"
echo "    npm run backup    - Crear backup manual"
echo "    npm run health    - Ver estado del sistema"
echo ""
echo "============================================"
