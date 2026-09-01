"""
Procesa documentos con Surya OCR v2.
Instalar: pip install surya-ocr PyMuPDF pillow

Requisito de hardware:
  - GPU NVIDIA: Docker + NVIDIA Container Toolkit → vllm backend
  - CPU / Apple Silicon: llama.cpp
  - Surya auto-detecta y usa el backend disponible
"""
import os
import re
import logging
from pathlib import Path
from PIL import Image
import httpx

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("diario.surya")

# Mantener servidor arriba entre documentos
os.environ['SURYA_INFERENCE_KEEP_ALIVE'] = '1'

RUST_API = os.getenv('RUST_API_URL', 'http://sentineliq-rust-api:8080')
if RUST_API.endswith('/'):
    RUST_API = RUST_API[:-1]

# Manager compartido — inicializar UNA sola vez al importar el módulo
_manager = None
_recognition_predictor = None
_layout_predictor = None

def get_predictors():
    """Lazy init de predictors para reutilizar el servidor de inferencia"""
    global _manager, _recognition_predictor, _layout_predictor
    if _manager is None:
        try:
            from surya.inference import SuryaInferenceManager
            from surya.recognition import RecognitionPredictor
            from surya.layout import LayoutPredictor

            _manager = SuryaInferenceManager()
            _recognition_predictor = RecognitionPredictor(_manager)
            _layout_predictor = LayoutPredictor(_manager)
        except Exception as e:
            logger.warning(f"Surya OCR no disponible en este entorno, usando fallback: {e}")
            _manager = None
    return _recognition_predictor, _layout_predictor

def pdf_to_images(file_path: str, dpi: int = 150) -> list[Image.Image]:
    """
    Convierte PDF a lista de imágenes PIL.
    DPI 150 es el balance entre velocidad y precisión para periódicos.
    """
    import fitz  # PyMuPDF
    doc = fitz.open(file_path)
    images = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        pix = page.get_pixmap(dpi=dpi)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        images.append(img)
    doc.close()
    return images

def extract_text_in_reading_order(prediction) -> str:
    """
    Extrae texto de un PageOCRResult en orden de lectura.
    Filtra bloques skipped (imágenes, fotos) y bloques con errores.
    """
    text_parts = []
    if hasattr(prediction, 'blocks'):
        for block in prediction.blocks:
            if getattr(block, 'skipped', False) or getattr(block, 'error', False):
                continue
            text = getattr(block, 'html', '') or getattr(block, 'text', '') or ''
            clean_text = re.sub(r'<[^>]+>', ' ', text).strip()
            if clean_text and len(clean_text) > 3:
                text_parts.append(clean_text)
    return '\n'.join(text_parts)

def save_ocr_result(doc_id: str, page_data: dict, headers: dict):
    """Persiste resultado OCR de una página en BD via Rust API"""
    try:
        with httpx.Client() as client:
            client.post(
                f"{RUST_API}/diario/ocr-results",
                json={'document_id': doc_id, **page_data},
                headers=headers,
                timeout=10.0
            )
    except Exception as e:
        logger.error(f"Error guardando OCR result para doc {doc_id} pág {page_data.get('page_number')}: {e}")

def process_document_with_surya(file_path: str, doc_id: str, headers: dict) -> dict | None:
    """
    Extrae texto completo de un PDF/imagen usando Surya OCR v2.
    Guarda resultados en BD via Rust API.
    Retorna dict con full_text y metadata de páginas.
    """
    try:
        path = Path(file_path)
        if not path.exists():
            logger.error(f"Archivo no encontrado: {file_path}")
            return None

        # Convertir PDF a imágenes o cargar imagen
        if path.suffix.lower() == '.pdf':
            images = pdf_to_images(file_path)
        else:
            images = [Image.open(file_path)]

        rec_pred, lay_pred = get_predictors()

        # Si Surya está activo
        if rec_pred and lay_pred:
            layouts = lay_pred(images)
            predictions = rec_pred(images, layouts)

            full_text = ""
            page_results = []

            for page_num, (pred, layout) in enumerate(zip(predictions, layouts)):
                page_text = extract_text_in_reading_order(pred)
                full_text += f"\n\n--- PÁGINA {page_num + 1} ---\n{page_text}"

                confidences = [
                    b.confidence for b in pred.blocks
                    if hasattr(b, 'confidence') and b.confidence is not None
                ]
                avg_confidence = sum(confidences) / len(confidences) if confidences else 0.9

                page_data = {
                    'page_number': page_num + 1,
                    'raw_text': page_text,
                    'layout_data': {
                        'blocks': [
                            {
                                'label': getattr(b, 'label', 'text'),
                                'bbox': getattr(b, 'bbox', []),
                                'confidence': getattr(b, 'confidence', 1.0),
                                'text': getattr(b, 'html', '') or ''
                            }
                            for b in pred.blocks if not getattr(b, 'skipped', False)
                        ]
                    },
                    'confidence_avg': avg_confidence
                }
                page_results.append(page_data)
                save_ocr_result(doc_id, page_data, headers)

            return {
                'full_text': full_text,
                'page_count': len(images),
                'pages': page_results
            }
        else:
            # Fallback usando PyMuPDF directamente si Surya aún no ha descargado pesas
            import fitz
            doc = fitz.open(file_path)
            full_text = ""
            page_results = []
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_text = page.get_text()
                full_text += f"\n\n--- PÁGINA {page_num + 1} ---\n{page_text}"
                page_data = {
                    'page_number': page_num + 1,
                    'raw_text': page_text,
                    'layout_data': {'blocks': []},
                    'confidence_avg': 0.95
                }
                page_results.append(page_data)
                save_ocr_result(doc_id, page_data, headers)
            doc.close()
            return {
                'full_text': full_text,
                'page_count': len(page_results),
                'pages': page_results
            }

    except Exception as e:
        logger.error(f"Error procesando OCR para doc {doc_id}: {e}", exc_info=True)
        return None
