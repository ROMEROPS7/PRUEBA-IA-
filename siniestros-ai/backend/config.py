"""
Configuration settings for the SegurCaixa Adeslas Claims Management System.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings from environment variables."""

    # ==================== Application ====================
    APP_NAME: str = "SegurCaixa Adeslas - Sistema IA Siniestros"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # ==================== Server ====================
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    RELOAD: bool = os.getenv("RELOAD", "True").lower() == "true"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")

    # ==================== Database ====================
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./segurcaixa_siniestros.db",
    )
    # PostgreSQL example:
    # DATABASE_URL: str = os.getenv(
    #     "DATABASE_URL",
    #     "postgresql://user:password@localhost:5432/segurcaixa",
    # )
    DATABASE_ECHO: bool = os.getenv("DATABASE_ECHO", "False").lower() == "true"

    # ==================== CORS ====================
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["*"]
    CORS_ALLOW_HEADERS: list = ["*"]

    # ==================== WebSocket ====================
    WS_HEARTBEAT_INTERVAL: int = 30  # seconds
    WS_TIMEOUT: int = 60  # seconds

    # ==================== Notification Services ====================
    # SMS Configuration (Twilio / AWS SNS)
    SMS_PROVIDER: str = os.getenv("SMS_PROVIDER", "twilio")  # twilio, aws_sns, dummy
    TWILIO_ACCOUNT_SID: Optional[str] = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: Optional[str] = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_PHONE_NUMBER: Optional[str] = os.getenv("TWILIO_PHONE_NUMBER")

    AWS_REGION: str = os.getenv("AWS_REGION", "eu-west-1")
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")

    # Email Configuration (SendGrid / AWS SES)
    EMAIL_PROVIDER: str = os.getenv("EMAIL_PROVIDER", "sendgrid")  # sendgrid, ses, dummy
    SENDGRID_API_KEY: Optional[str] = os.getenv("SENDGRID_API_KEY")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@segurcaixa.es")
    EMAIL_FROM_NAME: str = os.getenv("EMAIL_FROM_NAME", "SegurCaixa Adeslas")

    # WhatsApp Configuration
    WHATSAPP_PROVIDER: str = os.getenv("WHATSAPP_PROVIDER", "twilio")  # twilio, meta, dummy
    WHATSAPP_BUSINESS_ACCOUNT_ID: Optional[str] = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID")
    WHATSAPP_API_KEY: Optional[str] = os.getenv("WHATSAPP_API_KEY")

    # ==================== Agents Configuration ====================
    AGENTS_ENABLED: bool = os.getenv("AGENTS_ENABLED", "True").lower() == "true"

    # Chat Agent
    CHAT_AGENT_ENABLED: bool = True
    CHAT_AGENT_MODEL: str = os.getenv("CHAT_AGENT_MODEL", "gpt-4")
    CHAT_AGENT_TIMEOUT: int = 30  # seconds

    # Documents Agent
    DOCS_AGENT_ENABLED: bool = True
    DOCS_AGENT_MODEL: str = os.getenv("DOCS_AGENT_MODEL", "gpt-4-vision")
    DOCS_AGENT_TIMEOUT: int = 60  # seconds

    # Voice Agent
    VOICE_AGENT_ENABLED: bool = True
    VOICE_AGENT_MODEL: str = os.getenv("VOICE_AGENT_MODEL", "gpt-4")
    VOICE_AGENT_TIMEOUT: int = 45  # seconds

    # Assignment Agent
    ASSIGNMENT_AGENT_ENABLED: bool = True
    ASSIGNMENT_AGENT_MODEL: str = os.getenv("ASSIGNMENT_AGENT_MODEL", "gpt-4")
    ASSIGNMENT_AGENT_TIMEOUT: int = 15  # seconds

    # Orchestrator Agent
    ORCHESTRATOR_AGENT_ENABLED: bool = True
    ORCHESTRATOR_AGENT_MODEL: str = os.getenv("ORCHESTRATOR_AGENT_MODEL", "gpt-4")
    ORCHESTRATOR_AGENT_TIMEOUT: int = 120  # seconds

    # ==================== File Storage ====================
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", str(50 * 1024 * 1024)))  # 50 MB
    ALLOWED_FILE_TYPES: list = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/tiff",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    # ==================== Security ====================
    REQUIRE_HTTPS: bool = os.getenv("REQUIRE_HTTPS", "False").lower() == "true"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ==================== Logging ====================
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: Optional[str] = os.getenv("LOG_FILE")

    # ==================== Feature Flags ====================
    ENABLE_AUTOMATIC_ASSIGNMENT: bool = True
    ENABLE_AUTO_APPROVAL: bool = False  # Careful with this!
    ENABLE_MULTI_LANGUAGE: bool = True
    ENABLE_ANALYTICS: bool = True

    # ==================== Rate Limiting ====================
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
