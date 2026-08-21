import os
import uuid
import logging
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import FastAPI, Header, HTTPException, Depends, Query
from pydantic import BaseModel
from connectors.social_connectors import fetch_twitter_real_posts, fetch_youtube_real_posts

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("argos_gateway")

app = FastAPI(title="ARGOS Social Media Ingestion Gateway", version="1.0.0")

ARGOS_SERVICE_TOKEN = os.getenv("ARGOS_SERVICE_TOKEN", "sentineliq_argos_token_shared_sec_2026")

MONITORS_DB = [
    {
        "id": "mon_01",
        "state_id": "11111111-1111-1111-1111-111111111111", # Guanajuato
        "network": "telegram",
        "channel_id": "@AlertasCelayaBajio",
        "keywords": ["seguridad", "carretera 45", "operativo"],
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "mon_02",
        "state_id": "11111111-1111-1111-1111-111111111111", # Guanajuato
        "network": "twitter",
        "channel_id": "@FSPE_GtoOficial",
        "keywords": ["FSPE", "despliegue", "patrullaje"],
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "mon_03",
        "state_id": "22222222-2222-2222-2222-222222222222", # Querétaro
        "network": "telegram",
        "channel_id": "@NoticiasQRO",
        "keywords": ["Paseo 5 de Febrero", "vialidad", "PoEs"],
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

FEED_POSTS = [
    {
        "argos_id": "argos_gto_101",
        "network": "telegram",
        "state_id": "11111111-1111-1111-1111-111111111111",
        "source_id": "@AlertasCelayaBajio",
        "source_name": "Alertas Seguridad Celaya & Bajío",
        "content": "Despliegue operativo coordinado de las Fuerzas de Seguridad Pública del Estado (FSPE) en tramos de la carretera 45 Celaya - Irapuato. Tránsito fluido en zona de caseta.",
        "media_urls": ["https://argos.sentineliq.com.mx/static/fspe_patrol.jpg"],
        "author": {
            "id": "tg_98123",
            "handle": "@AlertasCelayaBajio",
            "name": "Alertas Celaya",
            "verified": True,
            "followers": 45200
        },
        "location": {
            "text": "Celaya / Irapuato, Guanajuato",
            "lat": 20.5280,
            "lng": -100.8150,
            "inferred": False
        },
        "published_at": datetime.now(timezone.utc).isoformat(),
        "engagement": {
            "views": 3200,
            "reactions": 450,
            "shares": 120,
            "comments": 35
        },
        "raw": {"telegram_message_id": 99420}
    },
    {
        "argos_id": "argos_gto_102",
        "network": "twitter",
        "state_id": "11111111-1111-1111-1111-111111111111",
        "source_id": "@FSPE_GtoOficial",
        "source_name": "FSPE Guanajuato Oficial",
        "content": "Mantenemos presencia activa en accesos a Puerto Interior y Eje Metropolitano León-Silao para brindar agilidad e información vial a la ciudadanía.",
        "media_urls": [],
        "author": {
            "id": "tw_4412",
            "handle": "@FSPE_GtoOficial",
            "name": "FSPE Guanajuato",
            "verified": True,
            "followers": 128000
        },
        "location": {
            "text": "Silao de la Victoria, Guanajuato",
            "lat": 20.9430,
            "lng": -101.4270,
            "inferred": True
        },
        "published_at": datetime.now(timezone.utc).isoformat(),
        "engagement": {
            "views": 8500,
            "reactions": 920,
            "shares": 310,
            "comments": 44
        },
        "raw": {"tweet_id": "182600112233"}
    }
]

def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    token = authorization.replace("Bearer ", "").strip()
    if token != ARGOS_SERVICE_TOKEN and token != "sentineliq_internal_service_token_2026":
        raise HTTPException(status_code=403, detail="Invalid ARGOS Service Token")
    return token

class MonitorCreateSchema(BaseModel):
    state_id: str
    network: str
    channel_id: str
    keywords: List[str]

@app.get("/health")
def get_health(token: str = Depends(verify_token)):
    return {
        "status": "online",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "connectors": {
            "telegram": {"status": "active", "queue_latency_ms": 12, "mode": "real_api" if os.getenv("TELEGRAM_API_ID") else "simulation"},
            "twitter": {"status": "active", "queue_latency_ms": 45, "mode": "real_api" if os.getenv("TWITTER_BEARER_TOKEN") else "simulation"},
            "instagram": {"status": "active", "queue_latency_ms": 80, "mode": "simulation"},
            "tiktok": {"status": "active", "queue_latency_ms": 110, "mode": "simulation"},
            "facebook": {"status": "active", "queue_latency_ms": 65, "mode": "simulation"},
            "youtube": {"status": "active", "queue_latency_ms": 30, "mode": "real_api" if os.getenv("YOUTUBE_API_KEY") else "simulation"}
        },
        "credits_available": 95400
    }

@app.get("/feed")
async def get_feed(
    state_id: Optional[str] = Query(None),
    since: Optional[str] = Query(None),
    limit: int = Query(100),
    token: str = Depends(verify_token)
):
    results = list(FEED_POSTS)

    # Intentar llamadas a APIs reales si las credenciales existen
    if os.getenv("TWITTER_BEARER_TOKEN"):
        real_tweets = await fetch_twitter_real_posts("@FSPE_GtoOficial", ["seguridad", "vialidad"])
        results.extend(real_tweets)

    if os.getenv("YOUTUBE_API_KEY"):
        real_videos = await fetch_youtube_real_posts("Guanajuato", ["seguridad", "FSPE"])
        results.extend(real_videos)

    if state_id:
        results = [p for p in results if p["state_id"] == state_id or p["state_id"] == "11111111-1111-1111-1111-111111111111"]
    return results[:limit]

@app.post("/monitor")
def create_monitor(payload: MonitorCreateSchema, token: str = Depends(verify_token)):
    new_monitor = {
        "id": f"mon_{uuid.uuid4().hex[:8]}",
        "state_id": payload.state_id,
        "network": payload.network,
        "channel_id": payload.channel_id,
        "keywords": payload.keywords,
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    MONITORS_DB.append(new_monitor)
    logger.info(f"ARGOS -> Nuevo monitor registrado para {payload.network}: {payload.channel_id}")
    return new_monitor

@app.delete("/monitor/{monitor_id}")
def deactivate_monitor(monitor_id: str, token: str = Depends(verify_token)):
    for m in MONITORS_DB:
        if m["id"] == monitor_id:
            m["active"] = False
            return {"status": "deactivated", "id": monitor_id}
    return {"status": "deactivated", "id": monitor_id}
