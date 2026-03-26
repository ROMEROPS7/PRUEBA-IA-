#!/usr/bin/env python3
"""
SegurCaixa Adeslas - Sistema IA de Siniestros - Script de Inicio Rápido

Este script maneja:
- Validación de la versión de Python
- Instalación automática de dependencias
- Configuración del entorno
- Inicio del servidor FastAPI con uvicorn
"""

import subprocess
import sys
import os
import platform
from pathlib import Path


def check_python_version():
    """Verifica que la versión de Python sea 3.10 o superior."""
    if sys.version_info < (3, 10):
        print(f"❌ Error: Python 3.10+ requerido. Tienes Python {sys.version_info.major}.{sys.version_info.minor}")
        sys.exit(1)
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor} detectado")


def check_and_install_requirements():
    """Verifica e instala las dependencias necesarias."""
    requirements_file = Path(__file__).parent / "backend" / "requirements.txt"

    if not requirements_file.exists():
        print(f"❌ Error: {requirements_file} no encontrado")
        sys.exit(1)

    print("Verificando dependencias...")

    # Verificar si se necesita instalar
    try:
        import fastapi
        import uvicorn
        print("✓ Dependencias ya instaladas")
        return
    except ImportError:
        pass

    print("📦 Instalando dependencias desde requirements.txt...")
    result = subprocess.run(
        [sys.executable, "-m", "pip", "install", "-r", str(requirements_file)],
        cwd=Path(__file__).parent,
    )

    if result.returncode != 0:
        print("❌ Error al instalar dependencias")
        sys.exit(1)

    print("✓ Dependencias instaladas exitosamente")


def setup_environment():
    """Configura las variables de entorno."""
    project_root = Path(__file__).parent.absolute()

    # Agregar project root al PYTHONPATH
    pythonpath = os.environ.get("PYTHONPATH", "")
    if str(project_root) not in pythonpath:
        os.environ["PYTHONPATH"] = f"{project_root}:{pythonpath}".rstrip(":")

    # Configurar variables por defecto si no existen
    defaults = {
        "PYTHONUNBUFFERED": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "LOG_LEVEL": "info",
    }

    for key, value in defaults.items():
        if key not in os.environ:
            os.environ[key] = value

    print(f"✓ Entorno configurado - PYTHONPATH: {os.environ['PYTHONPATH']}")


def create_data_directory():
    """Crea el directorio de datos si no existe."""
    data_dir = Path(__file__).parent / "data"
    data_dir.mkdir(exist_ok=True)
    print(f"✓ Directorio de datos: {data_dir}")


def load_env_file():
    """Carga el archivo .env si existe."""
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        from dotenv import load_dotenv
        load_dotenv(env_file)
        print(f"✓ Archivo .env cargado desde {env_file}")
    else:
        print(f"ℹ  Archivo .env no encontrado. Usando variables de entorno del sistema.")


def start_server(reload=False, port=8000, host="0.0.0.0"):
    """Inicia el servidor FastAPI con uvicorn."""
    print("\n" + "=" * 70)
    print("SegurCaixa Adeslas - Sistema IA de Siniestros")
    print("=" * 70)
    print(f"\n🚀 Iniciando servidor FastAPI")
    print(f"   Host: {host}")
    print(f"   Puerto: {port}")
    print(f"   Reload: {'Activado (desarrollo)' if reload else 'Desactivado (producción)'}")
    print(f"\n📚 Documentación de API: http://localhost:{port}/api/docs")
    print(f"🏥 Health Check: http://localhost:{port}/health")
    print(f"📡 WebSocket: ws://localhost:{port}/ws/{{client_type}}/{{client_id}}")
    print("\nPresiona CTRL+C para detener el servidor\n")
    print("=" * 70 + "\n")

    cmd = [
        sys.executable,
        "-m", "uvicorn",
        "backend.main:app",
        "--host", host,
        "--port", str(port),
        "--log-level", os.environ.get("LOG_LEVEL", "info").lower(),
    ]

    if reload:
        cmd.append("--reload")

    try:
        subprocess.run(cmd, cwd=Path(__file__).parent)
    except KeyboardInterrupt:
        print("\n\n✓ Servidor detenido correctamente")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error al iniciar el servidor: {e}")
        sys.exit(1)


def main():
    """Función principal."""
    print("\n" + "=" * 70)
    print("SegurCaixa Adeslas - Sistema IA de Siniestros")
    print("Script de Inicio Rápido")
    print("=" * 70 + "\n")

    # Validaciones previas
    check_python_version()

    # Cargar .env primero
    load_env_file()

    # Setup
    check_and_install_requirements()
    setup_environment()
    create_data_directory()

    # Detectar si está en modo desarrollo
    reload = os.environ.get("API_RELOAD", "false").lower() == "true"
    port = int(os.environ.get("API_PORT", "8000"))
    host = os.environ.get("API_HOST", "0.0.0.0")

    # Iniciar servidor
    start_server(reload=reload, port=port, host=host)


if __name__ == "__main__":
    main()
