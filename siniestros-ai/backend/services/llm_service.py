"""
LLM Service for SegurCaixa Adeslas - 100% On-Premise / LOPD Compliant.

This module provides a unified interface to local LLM models via Ollama.
NO data leaves the infrastructure. Compatible with RGPD/LOPD requirements.

Supported backends:
- Ollama (primary): Self-hosted, runs Llama 3.1, Mistral, Qwen, etc.
- Fallback: Rule-based responses when LLM is unavailable.
"""

import logging
import json
from typing import Any, Dict, List, Optional
from enum import Enum

import httpx

logger = logging.getLogger(__name__)


class LLMProvider(str, Enum):
    """Available LLM providers (all on-premise)."""
    OLLAMA = "ollama"
    FALLBACK = "fallback"  # Rule-based, no LLM needed


class LLMRole(str, Enum):
    """Message roles for chat completions."""
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"


class LLMMessage:
    """A single message in a chat conversation."""

    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content

    def to_dict(self) -> Dict[str, str]:
        return {"role": self.role, "content": self.content}


class LLMService:
    """
    Unified LLM service — 100% on-premise.

    Connects to Ollama running locally or in Docker.
    All data stays within the infrastructure.
    LOPD/RGPD compliant by design.
    """

    def __init__(
        self,
        provider: str = "ollama",
        base_url: str = "http://localhost:11434",
        model: str = "llama3.1",
        timeout: float = 60.0,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ):
        """
        Initialize LLM service.

        Args:
            provider: LLM provider ("ollama" or "fallback")
            base_url: Ollama server URL
            model: Model name (e.g., "llama3.1", "mistral", "qwen2.5")
            timeout: Request timeout in seconds
            temperature: Generation temperature (0-1)
            max_tokens: Maximum tokens to generate
        """
        self.provider = LLMProvider(provider)
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout
        self.temperature = temperature
        self.max_tokens = max_tokens
        self._available: Optional[bool] = None

        logger.info(
            f"LLM Service initialized: provider={provider}, "
            f"model={model}, url={base_url}"
        )

    async def is_available(self) -> bool:
        """
        Check if the LLM backend is available.

        Returns:
            True if the LLM server responds
        """
        if self.provider == LLMProvider.FALLBACK:
            return True

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                self._available = response.status_code == 200
                if self._available:
                    data = response.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    logger.info(f"Ollama available. Models: {models}")
                return self._available
        except Exception as e:
            logger.warning(f"Ollama not available: {e}")
            self._available = False
            return False

    async def chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        json_mode: bool = False,
    ) -> Dict[str, Any]:
        """
        Send a chat completion request to the local LLM.

        Args:
            messages: List of message dicts with 'role' and 'content'
            system_prompt: Optional system prompt (prepended to messages)
            temperature: Override default temperature
            max_tokens: Override default max_tokens
            json_mode: If True, request JSON output format

        Returns:
            Dictionary with:
                - content (str): Generated text
                - model (str): Model used
                - provider (str): Provider used
                - tokens_used (int): Approximate tokens used
                - success (bool): Whether generation succeeded
        """
        # Build full message list
        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        # Try Ollama first
        if self.provider == LLMProvider.OLLAMA:
            result = await self._ollama_chat(
                messages=full_messages,
                temperature=temperature or self.temperature,
                max_tokens=max_tokens or self.max_tokens,
                json_mode=json_mode,
            )
            if result["success"]:
                return result
            logger.warning("Ollama failed, falling back to rule-based")

        # Fallback: return empty so agents use their rule-based logic
        return {
            "content": "",
            "model": "fallback",
            "provider": "fallback",
            "tokens_used": 0,
            "success": False,
            "fallback": True,
        }

    async def _ollama_chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int,
        json_mode: bool = False,
    ) -> Dict[str, Any]:
        """
        Call Ollama's chat API (OpenAI-compatible format).

        Args:
            messages: Chat messages
            temperature: Generation temperature
            max_tokens: Max tokens
            json_mode: Request JSON format

        Returns:
            Response dict
        """
        try:
            payload = {
                "model": self.model,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens,
                },
            }

            if json_mode:
                payload["format"] = "json"

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json=payload,
                )

                if response.status_code == 200:
                    data = response.json()
                    content = data.get("message", {}).get("content", "")
                    eval_count = data.get("eval_count", 0)

                    return {
                        "content": content,
                        "model": self.model,
                        "provider": "ollama",
                        "tokens_used": eval_count,
                        "success": True,
                        "fallback": False,
                    }
                else:
                    logger.error(
                        f"Ollama error {response.status_code}: "
                        f"{response.text}"
                    )
                    return {
                        "content": "",
                        "model": self.model,
                        "provider": "ollama",
                        "tokens_used": 0,
                        "success": False,
                        "error": f"HTTP {response.status_code}",
                    }

        except httpx.TimeoutException:
            logger.error("Ollama request timed out")
            return {
                "content": "",
                "model": self.model,
                "provider": "ollama",
                "tokens_used": 0,
                "success": False,
                "error": "timeout",
            }
        except Exception as e:
            logger.error(f"Ollama request failed: {e}")
            return {
                "content": "",
                "model": self.model,
                "provider": "ollama",
                "tokens_used": 0,
                "success": False,
                "error": str(e),
            }

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Simple text generation (wraps chat with a single user message).

        Args:
            prompt: The user prompt
            system_prompt: Optional system instruction
            temperature: Override temperature
            max_tokens: Override max tokens

        Returns:
            Generation result
        """
        messages = [{"role": "user", "content": prompt}]
        return await self.chat(
            messages=messages,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    async def classify_json(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float = 0.3,
    ) -> Dict[str, Any]:
        """
        Generate a JSON classification from the LLM.

        Args:
            prompt: The classification prompt
            system_prompt: System instructions for classification
            temperature: Low temperature for consistent output

        Returns:
            Parsed JSON dict, or empty dict on failure
        """
        result = await self.chat(
            messages=[{"role": "user", "content": prompt}],
            system_prompt=system_prompt,
            temperature=temperature,
            json_mode=True,
        )

        if result["success"] and result["content"]:
            try:
                return json.loads(result["content"])
            except json.JSONDecodeError:
                logger.warning("Failed to parse LLM JSON response")
                return {}

        return {}

    async def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the current model.

        Returns:
            Model information dict
        """
        if self.provider == LLMProvider.FALLBACK:
            return {
                "provider": "fallback",
                "model": "rule-based",
                "status": "active",
            }

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/show",
                    json={"name": self.model},
                )
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "provider": "ollama",
                        "model": self.model,
                        "status": "active",
                        "parameters": data.get("parameters", ""),
                        "size": data.get("size", 0),
                        "family": data.get("details", {}).get("family", ""),
                    }
        except Exception as e:
            logger.warning(f"Could not get model info: {e}")

        return {
            "provider": "ollama",
            "model": self.model,
            "status": "unavailable",
        }


# ── Singleton ────────────────────────────────────────────────────────────────

_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """Get or create the singleton LLM service instance."""
    global _llm_service
    if _llm_service is None:
        from backend.config.settings import settings
        _llm_service = LLMService(
            provider=getattr(settings, "LLM_PROVIDER", "ollama"),
            base_url=getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434"),
            model=getattr(settings, "OLLAMA_MODEL", "llama3.1"),
            timeout=getattr(settings, "LLM_TIMEOUT", 60.0),
            temperature=getattr(settings, "LLM_TEMPERATURE", 0.7),
            max_tokens=getattr(settings, "LLM_MAX_TOKENS", 2048),
        )
    return _llm_service


def reset_llm_service():
    """Reset the singleton (for testing)."""
    global _llm_service
    _llm_service = None
