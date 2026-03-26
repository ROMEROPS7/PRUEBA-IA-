"""
Configuration and settings for SegurCaixa Adeslas claims management system.
"""

import os
from typing import Optional, List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings using Pydantic BaseSettings.
    """

    # Database Configuration
    DATABASE_URL: str = "sqlite+aiosqlite:///./siniestros.db"

    # ── LLM Local (Ollama) ── LOPD/RGPD Compliant ──
    # NO se envían datos a APIs externas. Todo se procesa on-premise.
    LLM_PROVIDER: str = "ollama"  # "ollama" o "fallback" (reglas sin LLM)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1"  # Opciones: llama3.1, mistral, qwen2.5, mixtral
    LLM_TIMEOUT: float = 60.0
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 2048

    # API Keys (SOLO para desarrollo local, NO para producción)
    # En producción, todo va por Ollama on-premise
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    ELEVENLABS_API_KEY: Optional[str] = None

    # Twilio Configuration (SMS/Voice)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE: Optional[str] = None

    # WhatsApp Configuration
    WHATSAPP_API_TOKEN: Optional[str] = None

    # N8N Webhook Configuration
    N8N_WEBHOOK_URL: str = "http://localhost:5678"

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    # Server Configuration
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    # Authentication Configuration
    AUTH_REQUIRED: bool = False  # Set to False for backward compatibility
    JWT_SECRET_KEY: str = os.environ.get("JWT_SECRET_KEY", "segurcaixa-adeslas-jwt-secret-2024-dev-only")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    # Logging Configuration
    LOG_LEVEL: str = "INFO"

    class Config:
        """Pydantic config."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"


settings = Settings()

__all__ = ["Settings", "settings"]
