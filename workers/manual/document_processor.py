"""
Procesa Word, Excel, PDF y CSV subidos manualmente.
Surya OCR para PDFs escaneados o de imagen (Tarea 7).
"""
import csv
import os
import re
from pathlib import Path
from PIL import Image

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    import openpyxl
except ImportError:
    openpyxl = None

try:
    from docx import Document as DocxDocument
except ImportError:
    DocxDocument = None


async def process_document(file_path: str) -> str:
    ext = Path(file_path).suffix.lower()
    if ext in ['.docx', '.doc']:
        return extract_word(file_path)
    elif ext in ['.xlsx', '.xls']:
        return extract_excel(file_path)
    elif ext == '.csv':
        return extract_csv(file_path)
    elif ext == '.pdf':
        text = extract_pdf_direct(file_path)
        if len(text.strip()) > 200:
            return text
        return await extract_pdf_surya(file_path)
    elif ext in ['.txt', '.md']:
        return Path(file_path).read_text(encoding='utf-8', errors='ignore')
    return ''


def extract_word(path: str) -> str:
    if not DocxDocument:
        return Path(path).read_text(encoding='utf-8', errors='ignore')
    doc = DocxDocument(path)
    return '\n'.join(p.text for p in doc.paragraphs if p.text.strip())


def extract_excel(path: str) -> str:
    if not openpyxl:
        return ''
    wb = openpyxl.load_workbook(path, read_only=True)
    lines = []
    for sheet in wb.worksheets:
        lines.append(f"=== {sheet.title} ===")
        for row in sheet.iter_rows(values_only=True):
            line = ' | '.join(str(c) for c in row if c is not None)
            if line.strip():
                lines.append(line)
    return '\n'.join(lines)


def extract_csv(path: str) -> str:
    lines = []
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f)
        for row in reader:
            line = ' | '.join(c.strip() for c in row if c and c.strip())
            if line:
                lines.append(line)
    return '\n'.join(lines)


def extract_pdf_direct(path: str) -> str:
    if not fitz:
        return ''
    doc = fitz.open(path)
    return '\n'.join(page.get_text() for page in doc)


async def extract_pdf_surya(path: str) -> str:
    """Surya OCR para PDFs escaneados."""
    try:
        from surya.inference import SuryaInferenceManager
        from surya.recognition import RecognitionPredictor

        os.environ['SURYA_INFERENCE_KEEP_ALIVE'] = '1'
        mgr  = SuryaInferenceManager()
        pred = RecognitionPredictor(mgr)

        doc    = fitz.open(path)
        images = [
            Image.frombytes('RGB', [p.width, p.height], p.samples)
            for p in (page.get_pixmap(dpi=150) for page in doc)
        ]
        predictions = pred(images)
        texts = []
        for prediction in predictions:
            for block in prediction.blocks:
                if not block.skipped and block.html:
                    text = re.sub(r'<[^>]+>', ' ', block.html).strip()
                    if text:
                        texts.append(text)
        return '\n'.join(texts)
    except Exception as e:
        return f"[Surya OCR fallback: {e}] Documento PDF escaneado procesado: {Path(path).name}"
