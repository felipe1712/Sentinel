"""
Filtra y clasifica el texto OCR extraído.
Usa Claude vía MCP para identificar y descartar contenido irrelevante (farándula, deportes, espectáculos).
"""
import os
import json
import re
import logging
import anthropic
import httpx

logger = logging.getLogger("diario.filter")

RUST_API = os.getenv('RUST_API_URL', 'http://sentineliq-rust-api:8080')
if RUST_API.endswith('/'):
    RUST_API = RUST_API[:-1]

ALLOWED_CATEGORIES = {
    'primeras_planas_nacional': ['politica', 'economia', 'finanzas', 'seguridad'],
    'primeras_planas_estatal':  ['politica', 'economia', 'seguridad', 'gobierno'],
    'sintesis_estatal':         ['politica', 'economia', 'seguridad', 'gobierno'],
    'columnas_politicas':       ['politica', 'gobierno'],
}

DISCARD_KEYWORDS = [
    'futbol', 'beisbol', 'basketball', 'deporte', 'liga', 'campeon',
    'partido', 'gol', 'torneo', 'atletismo', 'boxeo', 'pelea',
    'concierto', 'cantante', 'artista', 'actor', 'actriz', 'pelicula',
    'serie', 'estreno', 'farandula', 'espectaculo', 'show', 'reality',
    'boda', 'divorcio', 'romance', 'novio', 'novia', 'celebrity',
    'festival', 'teatro', 'exposicion', 'museo', 'danza'
]

def get_doc_name(doc_type: str) -> str:
    names = {
        'primeras_planas_nacional': 'Primeras Planas Nacionales',
        'primeras_planas_estatal':  'Primeras Planas Estatales de Guanajuato',
        'sintesis_estatal':         'Síntesis Estatal de Guanajuato',
        'columnas_politicas':       'Columnas Políticas de Guanajuato',
    }
    return names.get(doc_type, doc_type)

def save_item(doc_id: str, state_id: str, fecha: str, item: dict, headers: dict):
    try:
        with httpx.Client() as client:
            client.post(
                f"{RUST_API}/diario/items",
                json={
                    'document_id': doc_id,
                    'state_id': state_id,
                    'fecha': fecha,
                    'categoria': item.get('categoria', 'politica'),
                    'ambito': item.get('ambito', 'estatal'),
                    'titular': item.get('titular', 'Sin titular'),
                    'cuerpo': item.get('cuerpo'),
                    'fuente_medio': item.get('fuente_medio'),
                    'pagina': item.get('pagina'),
                    'relevancia': item.get('relevancia', 5),
                    'es_principal': item.get('es_principal', False)
                },
                headers=headers,
                timeout=10.0
            )
    except Exception as e:
        logger.error(f"Error guardando item clasificado en BD: {e}")

def filter_and_classify(ocr_text: str, doc_type: str, doc_id: str,
                         state_id: str, fecha: str, headers: dict) -> list[dict]:
    """
    Filtra el texto OCR y extrae items relevantes clasificados.
    Retorna lista de items para pasar al summarizer.
    """
    api_key = os.getenv('CLAUDE_API_KEY') or os.getenv('ANTHROPIC_API_KEY')
    if not api_key or len(api_key.strip()) < 10:
        logger.warning("CLAUDE_API_KEY no configurada, realizando extracción heurística de titulares.")
        # Extracción básica de fallback
        lines = [l.strip() for l in ocr_text.split('\n') if len(l.strip()) > 20]
        items = []
        for idx, line in enumerate(lines[:10]):
            # Descarte de keywords
            if any(k in line.lower() for k in DISCARD_KEYWORDS):
                continue
            cat = 'seguridad' if any(w in line.lower() for w in ['policia', 'seguridad', 'detienen', 'armas', 'homicidio']) else 'politica'
            item = {
                'categoria': cat,
                'ambito': 'estatal' if 'estatal' in doc_type else 'nacional',
                'titular': line[:200],
                'cuerpo': line,
                'fuente_medio': 'Prensa General',
                'pagina': 1,
                'relevancia': 8 if idx < 3 else 5,
                'es_principal': idx == 0
            }
            items.append(item)
            save_item(doc_id, state_id, fecha, item, headers)
        return items

    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""Analiza el siguiente texto extraído por OCR de {get_doc_name(doc_type)}.

FECHA: {fecha}
TIPO DE DOCUMENTO: {get_doc_name(doc_type)}

TEXTO OCR:
{ocr_text[:15000]}

INSTRUCCIONES:
1. Identifica todas las notas, titulares y artículos del texto
2. Clasifica cada uno en: politica, economia, finanzas, seguridad, gobierno
3. DESCARTA completamente: deportes, farándula, cultura, espectáculos, sociales, entretenimiento, música, cine, teatro, celebridades
4. Para documentos estatales: marca como es_principal=true los 3 items más relevantes para el Gobernador de Guanajuato
5. Extrae el nombre del medio/periódico si es identificable (AM, Correo, El Sol de León, Reforma, El Universal, etc.)
6. Asigna relevancia del 1 al 10 (10 = crítico para el gobernador)

REGLAS ESTRICTAS:
- Si un titular es ambiguo entre política y deportes → DESCARTAR
- Si el tema principal es un personaje de entretenimiento → DESCARTAR
- Si el tema es violencia en contexto policial/seguridad → INCLUIR en seguridad
- Guanajuato, SEMEFO, CJNG, CSRL, Policía, Ejército → siempre INCLUIR

Responde ÚNICAMENTE con JSON válido, sin markdown, sin explicaciones:
{{
  "items": [
    {{
      "categoria": "politica",
      "ambito": "nacional",
      "titular": "titular exacto o reconstruido",
      "cuerpo": "resumen del cuerpo de la nota en 2-3 oraciones",
      "fuente_medio": "nombre del periódico o null",
      "pagina": 1,
      "relevancia": 8,
      "es_principal": true
    }}
  ],
  "total_encontrados": 5,
  "total_descartados": 2,
  "razon_descartes": "Se descartaron notas de deportes y farándula"
}}"""

    try:
        response = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=4096,
            messages=[{'role': 'user', 'content': prompt}]
        )

        raw = response.content[0].text
        raw = re.sub(r'```json|```', '', raw).strip()
        data = json.loads(raw)
        items = data.get('items', [])

        for item in items:
            save_item(doc_id, state_id, fecha, item, headers)

        return items
    except Exception as e:
        logger.error(f"Error en filter_and_classify con Claude: {e}", exc_info=True)
        return []
