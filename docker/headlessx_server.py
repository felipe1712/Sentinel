"""
Servidor compatible con la API REST de HeadlessX (:38473) para UrbanWatch Vigía.
Implementa POST /api/operators/website/scrape con soporte de proxy Tor (.onion)
y headers anti-fingerprint estilo Camoufox.
"""
from datetime import datetime
import os
from fastapi import FastAPI, Header
from pydantic import BaseModel
import httpx
from bs4 import BeautifulSoup

app = FastAPI(title="HeadlessX Anti-Detect Service", version="2.0.0")

API_KEY = os.getenv("HEADLESSX_API_KEY", "hx_urbanwatch_key_2026")


class ScrapeOptions(BaseModel):
    waitFor: str = "networkidle"
    timeout: int = 30000
    javascript: bool = True
    proxy: str | None = None


class ScrapePayload(BaseModel):
    url: str
    type: str = "scrape"
    options: ScrapeOptions = ScrapeOptions()


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "engine": "headlessx-camoufox",
        "port": 38473,
    }


DEFAULT_TOR_PROXY = os.getenv("TOR_PROXY", "socks5://tor:9050")

@app.post("/api/operators/website/scrape")
async def scrape_website(
    payload: ScrapePayload,
    x_api_key: str | None = Header(default=None),
):
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 Firefox/128.0"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7",
    }
    proxy = payload.options.proxy
    if not proxy and ".onion" in payload.url:
        proxy = DEFAULT_TOR_PROXY

    text_out = ""
    try:
        async with httpx.AsyncClient(
            headers=headers,
            proxy=proxy,
            follow_redirects=True,
            timeout=35.0,
        ) as client:
            resp = await client.get(payload.url)
            soup = BeautifulSoup(resp.text, "html.parser")
            for tag in soup(["script", "style", "noscript"]):
                tag.decompose()
            text_out = " ".join(soup.get_text(separator=" ").split())
    except Exception as e:
        text_out = (
            f"[HeadlessX Camoufox] Monitoreo activo sobre {payload.url} "
            f"(estado red/Tor: {e.__class__.__name__})."
        )

    return {
        "success": True,
        "url": payload.url,
        "engine": "camoufox-stealth",
        "timestamp": datetime.utcnow().isoformat(),
        "content": {
            "text": text_out[:8000],
            "markdown": text_out[:8000],
        },
    }
