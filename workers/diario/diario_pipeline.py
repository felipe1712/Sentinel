"""
Pipeline principal del módulo Diario.
Orquesta: ingesta → OCR con Surya → filtrado → resumen Claude → notificación
"""
import os
import logging
from datetime import date
from pathlib import Path
import httpx

from .surya_processor import process_document_with_surya
from .content_filter import filter_and_classify
from .claude_summarizer import generate_summary_via_mcp
from .notifier import check_and_notify

logger = logging.getLogger("diario.pipeline")
logging.basicConfig(level=logging.INFO)

RUST_API = os.getenv('RUST_API_URL', 'http://sentineliq-rust-api:8080')
if RUST_API.endswith('/'):
    RUST_API = RUST_API[:-1]

SERVICE_TOKEN = os.getenv('SERVICE_TOKEN', 'sentineliq_internal_service_token_2026')
DIARIO_INPUT_DIR = Path(os.getenv('DIARIO_INPUT_DIR', '/data/diario'))

DOCUMENT_TYPES = [
    'primeras_planas_nacional',
    'primeras_planas_estatal',
    'sintesis_estatal',
    'columnas_politicas',
]

def find_document(directory: Path, doc_type: str) -> Path | None:
    """Busca el archivo del tipo especificado en el directorio"""
    for ext in ['.pdf', '.png', '.jpg', '.jpeg']:
        path = directory / f"{doc_type}{ext}"
        if path.exists():
            return path
    return None

def create_document_record(state_id: str, doc_type: str, file_path: str, fecha: str, headers: dict) -> dict:
    """Registra el documento en la base de datos"""
    size_kb = int(os.path.getsize(file_path) / 1024) if os.path.exists(file_path) else 0
    with httpx.Client() as client:
        resp = client.post(
            f"{RUST_API}/diario/documents",
            json={
                'state_id': state_id,
                'document_type': doc_type,
                'fecha': fecha,
                'original_filename': os.path.basename(file_path),
                'file_path': file_path,
                'file_size_kb': size_kb,
                'page_count': 0
            },
            headers=headers,
            timeout=10.0
        )
        return resp.json()

def update_status(doc_id: str, status: str, headers: dict, error_message: str = None):
    """Actualiza el estado de procesamiento del documento"""
    try:
        with httpx.Client() as client:
            client.patch(
                f"{RUST_API}/diario/documents/{doc_id}/status",
                json={'status': status, 'error_message': error_message},
                headers=headers,
                timeout=10.0
            )
    except Exception as e:
        logger.error(f"Error actualizando status a {status} para doc {doc_id}: {e}")

def process_single_document(state_id: str, doc_type: str, file_path: str, fecha: str):
    """Procesa un documento individual: OCR → filtrado → resumen → notificación"""
    headers = {'Authorization': f'Bearer {SERVICE_TOKEN}'}
    logger.info(f"Iniciando procesamiento de {doc_type} ({file_path}) para fecha {fecha}")

    try:
        # 1. Registrar documento en BD
        doc = create_document_record(state_id, doc_type, file_path, fecha, headers)
        doc_id = doc['id']

        # 2. OCR con Surya
        update_status(doc_id, 'procesando_ocr', headers)
        ocr_results = process_document_with_surya(file_path, doc_id, headers)

        if not ocr_results:
            update_status(doc_id, 'error', headers, 'Surya OCR falló o documento vacío')
            return None

        update_status(doc_id, 'ocr_completo', headers)

        # 3. Filtrar y clasificar contenido
        update_status(doc_id, 'filtrando', headers)
        items = filter_and_classify(
            ocr_text=ocr_results['full_text'],
            doc_type=doc_type,
            doc_id=doc_id,
            state_id=state_id,
            fecha=fecha,
            headers=headers
        )

        # 4. Generar resumen ejecutivo vía Claude MCP
        resumen = generate_summary_via_mcp(
            items=items,
            doc_type=doc_type,
            doc_id=doc_id,
            state_id=state_id,
            fecha=fecha,
            headers=headers
        )

        # 5. Marcar como listo
        update_status(doc_id, 'listo', headers)
        logger.info(f"Documento {doc_type} procesado exitosamente como listo")

        # 6. Notificar si todos están listos
        check_and_notify(state_id, fecha)
        return resumen

    except Exception as e:
        logger.error(f"Falla crítica en pipeline para {doc_type}: {e}", exc_info=True)
        return None

def run_daily_pipeline(state_id: str, fecha: str = None):
    """
    Punto de entrada del pipeline diario. Disparado por Celery beat a las 07:00.
    fecha: YYYY-MM-DD, default = hoy
    """
    today = fecha or date.today().isoformat()
    input_dir = DIARIO_INPUT_DIR / today
    logger.info(f"Ejecutando pipeline diario para state {state_id}, fecha {today}")

    if not input_dir.exists():
        logger.warning(f"Directorio de entrada no encontrado: {input_dir}")
        return

    for doc_type in DOCUMENT_TYPES:
        pdf_path = find_document(input_dir, doc_type)
        if not pdf_path:
            logger.warning(f"Documento {doc_type} no encontrado para {today}")
            continue

        process_single_document(
            state_id=state_id,
            doc_type=doc_type,
            file_path=str(pdf_path),
            fecha=today
        )

if __name__ == "__main__":
    import sys
    test_state_id = sys.argv[1] if len(sys.argv) > 1 else "00000000-0000-0000-0000-000000000001"
    test_date = sys.argv[2] if len(sys.argv) > 2 else date.today().isoformat()
    run_daily_pipeline(test_state_id, test_date)
