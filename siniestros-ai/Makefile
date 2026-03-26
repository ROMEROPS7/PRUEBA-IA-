.PHONY: help install run docker-up docker-down docker-logs docker-build \
        seed clean test lint format check-env dev prod

# Variables
PYTHON := python3
DOCKER_COMPOSE := docker-compose
PROJECT_NAME := segurcaixa
PORT_API := 8000
PORT_N8N := 5678
REDIS_PORT := 6379

# Colores para output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Mostrar esta ayuda
	@echo "$(GREEN)SegurCaixa Adeslas - Sistema IA de Siniestros$(NC)"
	@echo ""
	@echo "$(YELLOW)Comandos disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Ejemplos:$(NC)"
	@echo "  make install           # Instalar dependencias"
	@echo "  make run               # Ejecutar servidor local"
	@echo "  make docker-up         # Iniciar stack completo con Docker"
	@echo "  make seed              # Recargar datos de prueba"
	@echo ""

# ============================================================================
# Instalación y Configuración
# ============================================================================

check-env: ## Verificar archivo .env
	@if [ ! -f .env ]; then \
		echo "$(RED)❌ Error: archivo .env no encontrado$(NC)"; \
		echo "$(YELLOW)Creando .env desde .env.example...$(NC)"; \
		cp docker/.env.example .env; \
		echo "$(GREEN)✓ Archivo .env creado. Por favor, configura las claves API.$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✓ Archivo .env encontrado$(NC)"

install: check-env ## Instalar dependencias Python
	@echo "$(YELLOW)📦 Instalando dependencias...$(NC)"
	$(PYTHON) -m pip install --upgrade pip setuptools wheel
	$(PYTHON) -m pip install -r backend/requirements.txt
	@echo "$(GREEN)✓ Dependencias instaladas$(NC)"

# ============================================================================
# Desarrollo Local
# ============================================================================

run: install ## Ejecutar servidor local con auto-reload
	@echo "$(GREEN)🚀 Iniciando servidor de desarrollo...$(NC)"
	@echo "   API: http://localhost:$(PORT_API)"
	@echo "   Docs: http://localhost:$(PORT_API)/api/docs"
	@echo "   Health: http://localhost:$(PORT_API)/health"
	$(PYTHON) run.py

dev: install ## Alias para 'run'
	$(MAKE) run

prod: ## Ejecutar servidor en modo producción (sin reload)
	@echo "$(GREEN)🚀 Iniciando servidor de producción...$(NC)"
	API_RELOAD=false $(PYTHON) run.py

shell: install ## Abrir shell interactiva de Python
	@echo "$(YELLOW)Iniciando shell de Python...$(NC)"
	$(PYTHON) -i -c "from backend.db.database import init_db; print('Base de datos disponible')"

# ============================================================================
# Docker
# ============================================================================

docker-build: ## Construir imagen Docker
	@echo "$(YELLOW)🔨 Construyendo imagen Docker...$(NC)"
	$(DOCKER_COMPOSE) -f docker/docker-compose.yml build
	@echo "$(GREEN)✓ Imagen construida$(NC)"

docker-up: check-env docker-build ## Iniciar stack completo (API + N8N + Redis)
	@echo "$(GREEN)🚀 Iniciando stack con Docker Compose...$(NC)"
	$(DOCKER_COMPOSE) -f docker/docker-compose.yml up -d
	@echo ""
	@echo "$(GREEN)✓ Stack iniciado$(NC)"
	@echo ""
	@echo "Servicios disponibles:"
	@echo "  $(YELLOW)API FastAPI:$(NC)        http://localhost:$(PORT_API)"
	@echo "  $(YELLOW)API Docs:$(NC)           http://localhost:$(PORT_API)/api/docs"
	@echo "  $(YELLOW)N8N Workflows:$(NC)      http://localhost:$(PORT_N8N)"
	@echo "  $(YELLOW)Redis:$(NC)              localhost:$(REDIS_PORT)"
	@echo ""
	@echo "$(YELLOW)Para ver logs:$(NC) make docker-logs"
	@echo "$(YELLOW)Para detener:$(NC)  make docker-down"

docker-down: ## Detener stack (mantiene volúmenes de datos)
	@echo "$(YELLOW)⏹  Deteniendo stack...$(NC)"
	$(DOCKER_COMPOSE) -f docker/docker-compose.yml down
	@echo "$(GREEN)✓ Stack detenido$(NC)"

docker-logs: ## Ver logs de todos los servicios
	@echo "$(YELLOW)📋 Logs en tiempo real (Ctrl+C para salir)...$(NC)"
	$(DOCKER_COMPOSE) -f docker/docker-compose.yml logs -f

docker-logs-api: ## Ver logs solo de la API
	$(DOCKER_COMPOSE) -f docker/docker-compose.yml logs -f api

docker-logs-n8n: ## Ver logs solo de N8N
	$(DOCKER_COMPOSE) -f docker/docker-compose.yml logs -f n8n

docker-logs-redis: ## Ver logs solo de Redis
	$(DOCKER_COMPOSE) -f docker/docker-compose.yml logs -f redis

docker-ps: ## Ver estado de contenedores
	@$(DOCKER_COMPOSE) -f docker/docker-compose.yml ps

docker-clean: ## Limpiar volúmenes y contenedores (⚠️ ELIMINA DATOS)
	@echo "$(RED)⚠️  Esto eliminará todos los volúmenes y datos$(NC)"
	@read -p "¿Continuar? (s/n) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Ss]$$ ]]; then \
		$(DOCKER_COMPOSE) -f docker/docker-compose.yml down -v; \
		echo "$(GREEN)✓ Stack y volúmenes eliminados$(NC)"; \
	fi

docker-shell: ## Ejecutar bash en contenedor de la API
	$(DOCKER_COMPOSE) -f docker/docker-compose.yml exec api /bin/bash

# ============================================================================
# Base de Datos
# ============================================================================

seed: ## Recargar datos de prueba en la base de datos
	@echo "$(YELLOW)🌱 Sembrando base de datos con datos de prueba...$(NC)"
	@if [ -f backend/scripts/seed_db.py ]; then \
		$(PYTHON) backend/scripts/seed_db.py; \
		echo "$(GREEN)✓ Base de datos sembrada$(NC)"; \
	else \
		echo "$(RED)⚠️  Script seed_db.py no encontrado$(NC)"; \
	fi

clean: ## Eliminar archivo de base de datos local (sqlite)
	@echo "$(RED)⚠️  Eliminando base de datos local...$(NC)"
	@rm -f data/siniestros.db
	@echo "$(GREEN)✓ Base de datos eliminada$(NC)"

db-reset: clean seed ## Reiniciar completamente la base de datos
	@echo "$(GREEN)✓ Base de datos reiniciada$(NC)"

# ============================================================================
# Testing y Calidad
# ============================================================================

test: install ## Ejecutar tests con pytest
	@if command -v pytest &> /dev/null; then \
		echo "$(YELLOW)🧪 Ejecutando tests...$(NC)"; \
		pytest tests/ -v --tb=short; \
	else \
		echo "$(YELLOW)📦 Instalando pytest...$(NC)"; \
		$(PYTHON) -m pip install pytest pytest-asyncio; \
		pytest tests/ -v --tb=short; \
	fi

lint: install ## Ejecutar linter (flake8)
	@if command -v flake8 &> /dev/null; then \
		echo "$(YELLOW)🔍 Ejecutando linter...$(NC)"; \
		flake8 backend/ --max-line-length=120 --extend-ignore=E203,W503; \
	else \
		echo "$(YELLOW)📦 Instalando flake8...$(NC)"; \
		$(PYTHON) -m pip install flake8; \
		flake8 backend/ --max-line-length=120 --extend-ignore=E203,W503; \
	fi

format: install ## Formatear código con black
	@if command -v black &> /dev/null; then \
		echo "$(YELLOW)✨ Formateando código...$(NC)"; \
		black backend/ --line-length=120; \
	else \
		echo "$(YELLOW)📦 Instalando black...$(NC)"; \
		$(PYTHON) -m pip install black; \
		black backend/ --line-length=120; \
	fi

check: lint test ## Ejecutar linter y tests

# ============================================================================
# Utilidades
# ============================================================================

version: ## Mostrar versión del proyecto
	@grep -E 'version.*=' backend/main.py | head -1

info: ## Mostrar información del proyecto
	@echo "$(GREEN)SegurCaixa Adeslas - Sistema IA de Siniestros$(NC)"
	@echo ""
	@echo "Información:"
	@echo "  Version: 1.0.0"
	@echo "  Python: $(PYTHON)"
	@echo "  Raíz del proyecto: $(PWD)"
	@echo "  API Port: $(PORT_API)"
	@echo "  N8N Port: $(PORT_N8N)"
	@echo "  Redis Port: $(REDIS_PORT)"
	@echo ""
	@echo "Estado de archivos de configuración:"
	@if [ -f .env ]; then echo "  ✓ .env encontrado"; else echo "  ✗ .env no encontrado"; fi
	@if [ -f backend/requirements.txt ]; then echo "  ✓ requirements.txt encontrado"; else echo "  ✗ requirements.txt no encontrado"; fi
	@if [ -d docker ]; then echo "  ✓ Directorio docker encontrado"; else echo "  ✗ Directorio docker no encontrado"; fi

.DEFAULT_GOAL := help
