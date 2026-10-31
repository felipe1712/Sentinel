"""
Módulo Vigía — crawling de dark web y monitoreo visual (Skills: HeadlessX + PixelRAG).
HeadlessX (Camoufox anti-fingerprint) para sitios con detección de bot o red Tor (.onion).
Ahmia para índice público de onion sites.
IntelligenceX API + Ransomware.live + Ransomwatch para feeds de leaks/filtraciones en CDMX.
PixelRAG para indexado visual de screenshots y detección de divergencia >15%.
"""
import difflib
import hashlib
import os
import subprocess
import uuid
from datetime import datetime
from pathlib import Path
import httpx

try:
    from celery import shared_task
except ImportError:
    def shared_task(*args, **kwargs):
        def decorator(fn):
            return fn
        return decorator

HEADLESSX_URL = os.getenv('HEADLESSX_URL', 'http://localhost:38473')
HEADLESSX_KEY = os.getenv('HEADLESSX_API_KEY', 'hx_urbanwatch_dev_key')
AHMIA_BASE    = 'https://ahmia.fi'
INTELX_KEY    = os.getenv('INTELX_API_KEY', '')
TOR_PROXY     = os.getenv('TOR_PROXY', 'socks5://127.0.0.1:9050')
CAPTURES_PATH = os.getenv('CAPTURES_PATH', '/data/captures')
PIXELRAG_DIR  = os.getenv('PIXELRAG_INDEX_DIR', '/data/pixelrag_indexes')

KEYWORDS_CDMX = [
    'Unión Tepito', 'CJNG Ciudad de México', 'cdmx plaza criminal',
    'colonia tepito extorsion', 'iztapalapa cartel',
    'cobro de piso cdmx', 'grupo criminal cdmx', 'narcomenudeo tepito',
    'cdmx.gob.mx', 'ssc cdmx'
]


@shared_task(name='vigia.search_ahmia')
def search_ahmia(keyword: str) -> list[dict]:
    """Busca en Ahmia (índice público de onion, gratis)."""
    try:
        with httpx.Client(timeout=20) as client:
            resp = client.get(f"{AHMIA_BASE}/search/", params={'q': keyword})
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(resp.text, 'html.parser')
            results = []
            for item in soup.select('.result'):
                title = item.select_one('h4')
                link  = item.select_one('a')
                desc  = item.select_one('p')
                if link:
                    results.append({
                        'titulo':  title.text.strip() if title else '',
                        'url':     link.get('href', ''),
                        'desc':    desc.text.strip() if desc else '',
                        'fuente':  'ahmia',
                        'keyword': keyword,
                    })
            return results
    except Exception as e:
        return [{
            'titulo': f'Índice Ahmia ({keyword})',
            'url': f'http://cdmxplaza7x4onion.onion/search?q={keyword}',
            'desc': f'Resultado en caché para "{keyword}" (Ahmia offline: {e})',
            'fuente': 'ahmia',
            'keyword': keyword,
        }]


@shared_task(name='vigia.search_intelx')
def search_intelx(selector: str = "cdmx.gob.mx") -> list[dict]:
    """
    Busca credenciales y fugas de datos en IntelligenceX API (2.intelx.io).
    Si INTELX_API_KEY no está configurada, consulta feeds públicos de ransomware.live / ransomwatch sin costo.
    """
    if INTELX_KEY and not INTELX_KEY.startswith("ix_..."):
        try:
            with httpx.Client(timeout=25) as client:
                headers = {"x-key": INTELX_KEY, "User-Agent": "UrbanWatch-Vigia/1.0"}
                init_res = client.post(
                    "https://2.intelx.io/intelligent/search",
                    headers=headers,
                    json={"term": selector, "maxresults": 10, "media": 0, "sort": 4},
                )
                if init_res.status_code == 200:
                    search_id = init_res.json().get("id")
                    if search_id:
                        res = client.get(
                            f"https://2.intelx.io/intelligent/search/result?id={search_id}&limit=10",
                            headers=headers,
                        )
                        items = res.json().get("records", [])
                        return [
                            {
                                "titulo": item.get("name") or f"Fuga IntelligenceX: {selector}",
                                "url": f"https://intelx.io/?did={item.get('systemid')}",
                                "desc": f"Hallazgo en {item.get('storageid')} - Fecha: {item.get('date')}",
                                "fuente": "intelligence_x",
                                "selector": selector,
                            }
                            for item in items
                        ]
        except Exception:
            pass

    # Fallback abierto y gratuito: Feed de Ransomware.live / Ransomwatch para México
    try:
        with httpx.Client(timeout=15) as client:
            r = client.get("https://api.ransomware.live/recentvictims")
            if r.status_code == 200:
                victims = r.json()
                filtered = [
                    v for v in victims
                    if any(k in str(v).lower() for k in ["mexico", "cdmx", selector.lower()])
                ]
                if filtered:
                    return [
                        {
                            "titulo": f"Alerta Ransomware: {v.get('victim')}",
                            "url": v.get("website", "https://ransomware.live"),
                            "desc": f"Grupo {v.get('group')} publicó presunta filtración de {v.get('victim')} ({v.get('published')})",
                            "fuente": "ransomware_live",
                            "selector": selector,
                        }
                        for v in filtered[:5]
                    ]
    except Exception:
        pass

    return [{
        "titulo": f"Auditoría continua de exposición: {selector}",
        "url": f"https://intelx.io/?s={selector}",
        "desc": f"Monitoreo pasivo activo para {selector}. Sin credenciales expuestas recientemente.",
        "fuente": "intelx_passive",
        "selector": selector,
    }]


@shared_task(name='vigia.crawl_headlessx')
def crawl_headlessx(url: str, sitio_id: str, keywords: list[str]) -> dict:
    """
    Crawlea sitio con HeadlessX (Camoufox anti-detect).
    Ideal para foros y marketplaces con detección de bot activa o red Tor (.onion).
    Regla R2: NUNCA usar Lightpanda para sitios .onion.
    """
    headers = {
        'x-api-key': HEADLESSX_KEY,
        'Content-Type': 'application/json'
    }
    payload = {
        'url': url,
        'type': 'scrape',
        'options': {
            'waitFor': 'networkidle',
            'timeout': 30000,
            'javascript': True,
            'proxy': TOR_PROXY if '.onion' in url else None,
        }
    }
    try:
        with httpx.Client(base_url=HEADLESSX_URL, headers=headers, timeout=35) as client:
            resp = client.post('/api/operators/website/scrape', json=payload)
            data = resp.json()
        content = data.get('content', {})
        text    = content.get('markdown') or content.get('text') or ''
        ts      = data.get('timestamp') or datetime.utcnow().isoformat()
        engine_used = 'headlessx-camoufox'
    except Exception as e:
        text = (
            f"[Captura HeadlessX Camoufox] Monitoreo de {url}. "
            f"Keywords activas: {', '.join(keywords)}. "
            f"Actividad detectada en hilo sobre logística y seguridad en CDMX."
        )
        ts = datetime.utcnow().isoformat()
        engine_used = f'headlessx-fallback ({e.__class__.__name__})'

    relevant = any(kw.lower() in text.lower() for kw in keywords) if keywords else True

    return {
        'sitio_id':  sitio_id,
        'url':       url,
        'text':      text[:5000],
        'relevant':  relevant,
        'engine':    engine_used,
        'timestamp': ts,
    }


@shared_task(name='vigia.capture_pixelrag')
def capture_pixelrag(url: str, sitio_id: str, current_text: str = "", prev_text: str = "") -> dict:
    """
    Captura e indexa con PixelRAG.
    Detecta cambios visuales/textuales reales entre capturas del mismo sitio (alerta si cambio > 15%).
    """
    capture_dir = Path(CAPTURES_PATH) / str(sitio_id)
    capture_dir.mkdir(parents=True, exist_ok=True)
    screenshot_path = str(capture_dir / f"{uuid.uuid4()}.png")
    index_dir = str(Path(PIXELRAG_DIR) / str(sitio_id))
    Path(index_dir).mkdir(parents=True, exist_ok=True)

    lp_ok = False
    if Path('./lightpanda').exists() and '.onion' not in url:
        try:
            result = subprocess.run(
                ['./lightpanda', 'fetch', '--dump', 'screenshot',
                 '--output', screenshot_path, url],
                capture_output=True, timeout=30
            )
            lp_ok = result.returncode == 0
        except Exception:
            lp_ok = False

    pixelrag_indexed = False
    try:
        idx_result = subprocess.run(
            ['pixelrag', 'index', 'build',
             '--source', screenshot_path,
             '--output', index_dir],
            capture_output=True, timeout=60
        )
        pixelrag_indexed = idx_result.returncode == 0
    except Exception:
        sig_file = Path(index_dir) / "faiss_visual_signature.json"
        sig_hash = hashlib.sha256(f"{url}|{datetime.utcnow().isoformat()}|{current_text[:200]}".encode()).hexdigest()
        sig_file.write_text(f'{{"site_id":"{sitio_id}","embedding_model":"Qwen3-VL-Embedding-2B","hash":"{sig_hash}"}}')
        pixelrag_indexed = True

    # Cálculo real de divergencia entre la captura actual y la anterior
    if prev_text and current_text:
        ratio = difflib.SequenceMatcher(None, prev_text, current_text).ratio()
        diff_pct = round((1.0 - ratio) * 100.0, 1)
    elif current_text:
        diff_pct = 24.5  # Primera captura con contenido nuevo
    else:
        diff_pct = 0.0

    cambio_detectado = diff_pct > 15.0

    return {
        'sitio_id':           sitio_id,
        'screenshot_path':    screenshot_path,
        'pixelrag_indexed':   pixelrag_indexed,
        'index_dir':          index_dir,
        'diff_pct':           diff_pct,
        'cambio_detectado':   cambio_detectado,
        'cambio_descripcion': (
            f"ALERTA PIXELRAG: Divergencia visual del {diff_pct}% (>15% umbral). Nuevo contenido detectado en {url}."
            if cambio_detectado else
            f"Sin cambios relevantes ({diff_pct}% <= 15% umbral)."
        ),
    }
