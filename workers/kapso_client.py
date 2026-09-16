"""
Kapso WhatsApp Backend Client (SentinelIQ v2)
=============================================
Cliente en Python para envío automático de alertas críticas y briefings ejecutivos
por WhatsApp a través de la pasarela Kapso (Meta Cloud API v24.0).

Endpoint oficial: https://api.kapso.ai/meta/whatsapp/v24.0/{phone_number_id}/messages
Header: X-API-Key: <KAPSO_API_KEY>
"""

import os
import re
import logging
import asyncio
from typing import Dict, Any, Optional, List
import httpx

logger = logging.getLogger("kapso_client")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [Kapso] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.setLevel(logging.INFO)


def normalize_phone(phone: str) -> str:
    """Normaliza un número de teléfono para WhatsApp (formato E.164 sin +, sin espacios)."""
    cleaned = re.sub(r"[^0-9]", "", phone or "")
    if len(cleaned) == 10:
        cleaned = f"52{cleaned}"
    return cleaned


class KapsoClient:
    """Cliente para la API de WhatsApp de Kapso."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        phone_number_id: Optional[str] = None,
        timeout: float = 15.0
    ):
        self.api_key = api_key or os.getenv("KAPSO_API_KEY", "")
        self.phone_number_id = phone_number_id or os.getenv("KAPSO_PHONE_NUMBER_ID", "")
        self.timeout = timeout

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.phone_number_id)

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-API-Key": self.api_key,
        }

    async def send_text_message(
        self,
        to: str,
        body: str,
        preview_url: bool = False
    ) -> Dict[str, Any]:
        """
        Envía un mensaje de texto plano por WhatsApp.
        Nota: Requiere que el usuario haya contactado al bot en las últimas 24h.
        """
        if not self.is_configured:
            logger.warning("Kapso no configurado (KAPSO_API_KEY / KAPSO_PHONE_NUMBER_ID faltantes). Omitiendo envío.")
            return {"success": False, "error": "Credenciales de Kapso no configuradas"}

        clean_to = normalize_phone(to)
        endpoint = f"https://api.kapso.ai/meta/whatsapp/v24.0/{self.phone_number_id}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_to,
            "type": "text",
            "text": {
                "body": body,
                "preview_url": preview_url,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(endpoint, json=payload, headers=self._get_headers())
                if resp.status_code in (200, 201):
                    data = resp.json()
                    logger.info(f"Mensaje WhatsApp enviado con éxito a +{clean_to}: {data.get('messages')}")
                    return {"success": True, "data": data}
                else:
                    err_text = resp.text
                    logger.error(f"Error de Kapso [{resp.status_code}] al enviar a +{clean_to}: {err_text}")
                    return {"success": False, "error": err_text, "status_code": resp.status_code}
        except Exception as exc:
            logger.error(f"Fallo de conexión al enviar WhatsApp vía Kapso: {exc}")
            return {"success": False, "error": str(exc)}

    async def send_document_message(
        self,
        to: str,
        document_url: str,
        filename: str,
        caption: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Envía un documento PDF (ej. Briefing Ejecutivo Matutino) por WhatsApp.
        """
        if not self.is_configured:
            return {"success": False, "error": "Credenciales de Kapso no configuradas"}

        clean_to = normalize_phone(to)
        endpoint = f"https://api.kapso.ai/meta/whatsapp/v24.0/{self.phone_number_id}/messages"
        doc_payload: Dict[str, Any] = {
            "link": document_url,
            "filename": filename,
        }
        if caption:
            doc_payload["caption"] = caption

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_to,
            "type": "document",
            "document": doc_payload,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(endpoint, json=payload, headers=self._get_headers())
                if resp.status_code in (200, 201):
                    data = resp.json()
                    logger.info(f"Documento WhatsApp enviado a +{clean_to}: {filename}")
                    return {"success": True, "data": data}
                else:
                    return {"success": False, "error": resp.text, "status_code": resp.status_code}
        except Exception as exc:
            return {"success": False, "error": str(exc)}

    async def send_template_message(
        self,
        to: str,
        template_name: str,
        language_code: str = "es_MX",
        components: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Envía una plantilla aprobada por Meta para romper la regla de la ventana de 24 horas.
        """
        if not self.is_configured:
            return {"success": False, "error": "Credenciales de Kapso no configuradas"}

        clean_to = normalize_phone(to)
        endpoint = f"https://api.kapso.ai/meta/whatsapp/v24.0/{self.phone_number_id}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_to,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code},
                "components": components or [],
            },
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(endpoint, json=payload, headers=self._get_headers())
                if resp.status_code in (200, 201):
                    return {"success": True, "data": resp.json()}
                else:
                    return {"success": False, "error": resp.text, "status_code": resp.status_code}
        except Exception as exc:
            return {"success": False, "error": str(exc)}
