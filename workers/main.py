"""
Servicio HTTP FastAPI de Workers UrbanWatch (:8001).
Recibe despachos del Backend Rust (Axum :8100) para:
  - Extracción OCR (Surya OCR / PyMuPDF / python-docx / openpyxl)
  - Clasificación de incidentes con Claude Sonnet + registro en uwi_audit (R7)
  - Ejecución de jobs E-Medios con Lightpanda CDP + Playwright fallback (R2, R6)
  - Capturas Dark Web con HeadlessX Camoufox + PixelRAG visual diff >15%
  - Contexto global WorldMonitor MCP
"""
import asyncio
import os
from datetime import date, datetime
from fastapi import FastAPI
from pydantic import BaseModel
import asyncpg

from workers.classifier.incident_classifier import classify_text
from workers.manual.document_processor import process_document
from workers.emedios.emedia_scraper import run_emedios_job
from workers.vigia.dark_web_worker import crawl_headlessx, capture_pixelrag, search_ahmia
from workers.worldmonitor.mcp_client import fetch_worldmonitor_context

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://urbanwatch:password@postgres:5432/urbanwatch_db"
)

app = FastAPI(title="UrbanWatch Python Workers", version="1.0.0")
db_pool: asyncpg.Pool | None = None


@app.on_event("startup")
async def startup():
    global db_pool
    try:
        db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
    except Exception as e:
        print(f"Aviso conexión BD en workers: {e}")


@app.on_event("shutdown")
async def shutdown():
    if db_pool:
        await db_pool.close()


class ClassifyRequest(BaseModel):
    texto: str
    source_id: str = ""
    document_id: str = ""
    nivel_conf: str = "publico"
    fecha_default: str | None = None


class DocumentRequest(BaseModel):
    file_path: str
    source_id: str = ""
    document_id: str = ""
    modo_ingesta: str = "operativo"
    fecha_manual: str | None = None


class EmediosJobRequest(BaseModel):
    job_id: str
    fecha_inicio: str
    fecha_fin: str
    terminos: list[str]
    modo_ingesta: str = "operativo"


class VigiaCaptureRequest(BaseModel):
    sitio_id: str
    url: str
    keywords: list[str] = []


@app.get("/health")
async def health():
    return {"status": "ok", "service": "urbanwatch-workers"}


@app.post("/workers/classify")
async def api_classify(req: ClassifyRequest):
    incidentes = await classify_text(
        texto=req.texto,
        source_id=req.source_id,
        document_id=req.document_id,
        nivel_conf=req.nivel_conf,
        fecha_default=req.fecha_default,
        db_pool=db_pool,
    )
    return {"incidentes": incidentes}


@app.post("/workers/process-document")
async def api_process_document(req: DocumentRequest):
    text = await process_document(req.file_path)
    incidentes = await classify_text(
        texto=text,
        source_id=req.source_id,
        document_id=req.document_id,
        nivel_conf="publico",
        fecha_default=req.fecha_manual,
        db_pool=db_pool,
    )
    return {"ocr_text": text[:4000], "incidentes": incidentes}


@app.post("/workers/emedios/start")
async def api_start_emedios(req: EmediosJobRequest):
    f_ini = datetime.strptime(req.fecha_inicio[:10], "%Y-%m-%d").date()
    f_fin = datetime.strptime(req.fecha_fin[:10], "%Y-%m-%d").date()
    asyncio.create_task(
        run_emedios_job(req.job_id, f_ini, f_fin, req.terminos, req.modo_ingesta, db_pool)
    )
    return {"status": "enqueued", "job_id": req.job_id, "engine": "lightpanda"}


@app.post("/workers/vigia/capture")
async def api_vigia_capture(req: VigiaCaptureRequest):
    crawl = crawl_headlessx(req.url, req.sitio_id, req.keywords)
    pixel = capture_pixelrag(req.url, req.sitio_id, crawl.get("text", ""))
    return {"crawl": crawl, "pixelrag": pixel}


@app.get("/workers/vigia/ahmia")
async def api_ahmia(q: str = "cdmx"):
    return {"results": search_ahmia(q)}


@app.get("/workers/worldmonitor")
async def api_worldmonitor(target: str = "Morelos", alcaldia: str = "Cuauhtémoc"):
    return await fetch_worldmonitor_context(target, alcaldia)
