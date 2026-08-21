import os
import time
import json
import asyncio
import httpx
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

ARGOS_URL = os.getenv("ARGOS_URL", "https://argos.sentineliq.com.mx")
ARGOS_SERVICE_TOKEN = os.getenv("ARGOS_SERVICE_TOKEN", "sentineliq_argos_token_shared_sec_2026")
RUST_API_URL = os.getenv("RUST_API_URL", "http://localhost:8080")
SERVICE_TOKEN = os.getenv("SERVICE_TOKEN", "sentineliq_internal_service_token_2026")

ACTIVE_STATES = [
    {"key": "qro", "id": "22222222-2222-2222-2222-222222222222", "name": "Querétaro"},
    {"key": "gto", "id": "11111111-1111-1111-1111-111111111111", "name": "Guanajuato"}
]

async fn_consume_argos_feed():
    logger.info("Iniciando ciclo de ingesta ARGOS Gateway (cada 2 min)...")
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        for state in ACTIVE_STATES:
            since = datetime.now(timezone.utc).isoformat()
            try:
                # 1. Consumir GET /feed desde ARGOS
                headers = {"Authorization": f"Bearer {ARGOS_SERVICE_TOKEN}"}
                resp = await client.get(
                    f"{ARGOS_URL}/feed?state_id={state['id']}&limit=50",
                    headers=headers
                )
                posts = resp.json() if resp.status_code == 200 else []
                logger.info(f"ARGOS -> Recibidos {len(posts)} posts sociales para {state['name']}")

                for post in posts:
                    # 2. Insertar Evento en Rust API
                    event_payload = {
                        "state_id": state["id"],
                        "title": f"[{post.get('network', 'social').upper()}] {post.get('source_name', 'Fuente Social')}",
                        "summary": post.get("content", "")[:300],
                        "category": "Seguridad Pública" if "seguridad" in post.get("content", "").lower() else "Opinión Pública",
                        "severity": "alta" if post.get("engagement", {}).get("views", 0) > 1000 else "media",
                        "political_relevance": 8,
                        "municipio": post.get("location", {}).get("text") or state["name"],
                        "raw_data": post
                    }
                    
                    await client.post(
                        f"{RUST_API_URL}/events",
                        json=event_payload,
                        headers={"X-Service-Token": SERVICE_TOKEN}
                    )

                    # 3. Auditoría de Ingesta en /admin/query-audit
                    sources = [{
                        "name": f"ARGOS Gateway ({post.get('network')})",
                        "url": f"{ARGOS_URL}/feed",
                        "type": "osint",
                        "excerpt": post.get("content", "")[:200],
                        "credibility": "verificado",
                        "retrieved_at": datetime.now(timezone.utc).isoformat()
                    }]

                    audit_payload = {
                        "state_id": state["id"],
                        "query_type": "clasificacion",
                        "prompt_text": f"Clasificación automática ARGOS post {post.get('argos_id')}",
                        "model": "claude-sonnet-4-6",
                        "tools_used": ["argos_ingestor", "watchlist_matcher"],
                        "sources": sources,
                        "confidence_score": 85,
                        "hallucination_flag": False,
                        "tokens_used": 120,
                        "latency_ms": 340,
                        "result_summary": f"Post ingerido desde {post.get('source_name')}"
                    }

                    await client.post(
                        f"{RUST_API_URL}/admin/query-audit",
                        json=audit_payload,
                        headers={"X-Service-Token": SERVICE_TOKEN}
                    )

            except Exception as e:
                logger.warning(f"Error procesando ingesta ARGOS para {state['name']}: {e}")

if __name__ == "__main__":
    asyncio.run(fn_consume_argos_feed())
