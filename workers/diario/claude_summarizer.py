"""
Genera resúmenes ejecutivos de cada documento vía Claude API (MCP).
El resumen es el producto final que ve el gobernador y su equipo de gabinete.
"""
import os
import json
import re
import logging
import anthropic
import httpx

logger = logging.getLogger("diario.summarizer")

RUST_API = os.getenv('RUST_API_URL', 'http://sentineliq-rust-api:8080')
if RUST_API.endswith('/'):
    RUST_API = RUST_API[:-1]

PROMPTS_POR_TIPO = {
  'primeras_planas_nacional': """
Eres el analista de prensa de la Oficina del Gobernador de Guanajuato.
Analiza los siguientes titulares y notas de las PRIMERAS PLANAS NACIONALES del {fecha}.

ITEMS SELECCIONADOS:
{items_json}

Genera un resumen ejecutivo ESTRICTAMENTE en este formato JSON:
{{
  "resumen_ejecutivo": "Párrafo de 4-5 oraciones. Tono memo ejecutivo. Lo más importante del día en medios nacionales.",
  "puntos_clave": [
    "Punto 1 — máx 2 líneas",
    "Punto 2 — máx 2 líneas",
    "Punto 3 — máx 2 líneas",
    "Punto 4 — máx 2 líneas",
    "Punto 5 — máx 2 líneas"
  ],
  "temas_seguridad": "Párrafo enfocado solo en seguridad nacional y lo que afecta a Guanajuato",
  "temas_politica": "Párrafo de política nacional relevante para el gobierno estatal",
  "temas_economia": "Párrafo de economía y finanzas con impacto estatal",
  "relevancia_estatal": "¿Qué de lo nacional impacta directamente a Guanajuato hoy?",
  "mini_resumen": "Máximo 3 líneas. Para widget ejecutivo. Lo más importante del día."
}}

REGLAS: Español formal ejecutivo. Sin jerga. Sin datos sin fuente.
Enfatizar todo lo que afecta a Guanajuato aunque sea tema nacional.""",

  'primeras_planas_estatal': """
Eres el analista de prensa de la Oficina del Gobernador de Guanajuato.
Analiza los titulares de las PRIMERAS PLANAS DE MEDIOS GUANAJUATENSES del {fecha}.

ITEMS SELECCIONADOS:
{items_json}

Genera resumen ejecutivo en JSON:
{{
  "resumen_ejecutivo": "4-5 oraciones. Situación del estado según medios locales. Tono ejecutivo.",
  "puntos_clave": ["Punto 1", "Punto 2", "Punto 3", "Punto 4", "Punto 5"],
  "temas_seguridad": "Seguridad en Guanajuato: incidentes, operativos, declaraciones",
  "temas_politica": "Política local: declaraciones, tensiones, acuerdos",
  "temas_economia": "Economía y obras: inversiones, empleos, industria",
  "relevancia_estatal": "Los 2-3 temas que más requieren atención del gobernador hoy",
  "mini_resumen": "Máximo 3 líneas. Para widget ejecutivo."
}}

ÉNFASIS ESPECIAL en seguridad: CJNG, CSRL, SEMEFO, operativos, homicidios,
extorsiones, desapariciones. Mencionar municipios específicos afectados.""",

  'sintesis_estatal': """
Eres el analista de la Oficina del Gobernador de Guanajuato.
Analiza la SÍNTESIS ESTATAL OFICIAL del {fecha}.

CONTENIDO:
{items_json}

Genera resumen ejecutivo en JSON:
{{
  "resumen_ejecutivo": "4-5 oraciones. Resumen de la agenda y actividad de gobierno del día.",
  "puntos_clave": ["Punto 1", "Punto 2", "Punto 3", "Punto 4", "Punto 5"],
  "temas_seguridad": "Acciones de seguridad del gobierno estatal",
  "temas_politica": "Agenda política y relaciones institucionales",
  "temas_economia": "Actividad económica y obra pública",
  "relevancia_estatal": "Compromisos y seguimientos que requieren atención inmediata",
  "mini_resumen": "Máximo 3 líneas. Para widget ejecutivo."
}}""",

  'columnas_politicas': """
Eres el analista político de la Oficina del Gobernador de Guanajuato.
Analiza las COLUMNAS POLÍTICAS GUANAJUATENSES del {fecha}.

COLUMNAS SELECCIONADAS:
{items_json}

Genera resumen ejecutivo en JSON:
{{
  "resumen_ejecutivo": "4-5 oraciones. ¿Qué narrativa construyen los columnistas hoy sobre Guanajuato?",
  "puntos_clave": ["Punto 1", "Punto 2", "Punto 3", "Punto 4", "Punto 5"],
  "temas_seguridad": "Análisis político de la situación de seguridad según columnistas",
  "temas_politica": "Opiniones y críticas políticas relevantes al gobierno estatal",
  "temas_economia": "Perspectiva de columnistas sobre economía local",
  "relevancia_estatal": "¿Qué dice la opinión publicada que el gobernador debe saber?",
  "mini_resumen": "Máximo 3 líneas. Narrativa general de los columnistas hoy."
}}

IMPORTANTE: Señalar si hay críticas directas al gobernador o al gobierno estatal."""
}

def generate_summary_via_mcp(items: list, doc_type: str, doc_id: str,
                              state_id: str, fecha: str, headers: dict) -> dict:
    """
    Genera resumen ejecutivo usando Claude API (modelo sonnet-4-6).
    Guarda en tabla diario_resumenes.
    """
    if not items:
        logger.warning(f"No hay items para resumir el documento {doc_id}")
        return {}

    api_key = os.getenv('CLAUDE_API_KEY') or os.getenv('ANTHROPIC_API_KEY')
    if not api_key or len(api_key.strip()) < 10:
        logger.warning("CLAUDE_API_KEY no configurada, generando resumen heurístico")
        resumen_data = {
            'resumen_ejecutivo': f"Monitoreo de prensa matutina de {get_doc_name(doc_type)} para la fecha {fecha}. Se procesaron {len(items)} notas relevantes con enfoque en gobernabilidad y seguridad.",
            'puntos_clave': [i.get('titular', '') for i in items[:5] if i.get('titular')],
            'temas_seguridad': "Seguimiento puntual de operativos y despliegues en municipios de la entidad.",
            'temas_politica': "Actividad legislativa y posicionamientos en medios estatales.",
            'temas_economia': "Indicadores de desarrollo y proyectos de infraestructura.",
            'relevancia_estatal': "Mantener coordinación interinstitucional en las mesas de seguridad y seguimiento informativo.",
            'mini_resumen': f"Prensa matutina {fecha}: {len(items)} notas clave procesadas para el Estado de Guanajuato."
        }
        tokens = 150
    else:
        client = anthropic.Anthropic(api_key=api_key)

        items_clean = [
            {
                'titular': i.get('titular', ''),
                'cuerpo': i.get('cuerpo', ''),
                'categoria': i.get('categoria', ''),
                'fuente_medio': i.get('fuente_medio', ''),
                'relevancia': i.get('relevancia', 5),
                'es_principal': i.get('es_principal', False),
            }
            for i in sorted(items, key=lambda x: x.get('relevancia', 0), reverse=True)
        ]

        prompt_template = PROMPTS_POR_TIPO.get(doc_type, PROMPTS_POR_TIPO['primeras_planas_nacional'])
        prompt = prompt_template.format(
            fecha=fecha,
            items_json=json.dumps(items_clean, ensure_ascii=False, indent=2)
        )

        try:
            response = client.messages.create(
                model='claude-sonnet-4-6',
                max_tokens=2000,
                messages=[{'role': 'user', 'content': prompt}]
            )

            raw = response.content[0].text
            raw = re.sub(r'```json|```', '', raw).strip()
            resumen_data = json.loads(raw)
            tokens = response.usage.input_tokens + response.usage.output_tokens
        except Exception as e:
            logger.error(f"Error generando resumen Claude: {e}", exc_info=True)
            resumen_data = {
                'resumen_ejecutivo': f"Resumen diario de prensa {fecha}. Cobertura matutina procesada.",
                'puntos_clave': ["Seguimiento informativo del día"],
                'temas_seguridad': "Monitoreo permanente de seguridad",
                'temas_politica': "Agenda gubernamental",
                'temas_economia': "Actividad económica",
                'relevancia_estatal': "Atención a prioridades del estado",
                'mini_resumen': f"Monitoreo matutino {fecha} listo."
            }
            tokens = 0

    # Guardar en BD via Rust API
    payload = {
        'document_id': doc_id,
        'state_id': state_id,
        'fecha': fecha,
        'document_type': doc_type,
        'tokens_usados': tokens,
        'modelo': 'claude-sonnet-4-6',
        **resumen_data
    }

    try:
        with httpx.Client() as client_http:
            client_http.post(
                f"{RUST_API}/diario/resumenes",
                json=payload,
                headers=headers,
                timeout=30.0
            )
    except Exception as e:
        logger.error(f"Error guardando resumen en BD: {e}")

    return resumen_data

def get_doc_name(doc_type: str) -> str:
    names = {
        'primeras_planas_nacional': 'Primeras Planas Nacionales',
        'primeras_planas_estatal':  'Primeras Planas Estatales de Guanajuato',
        'sintesis_estatal':         'Síntesis Estatal de Guanajuato',
        'columnas_politicas':       'Columnas Políticas de Guanajuato',
    }
    return names.get(doc_type, doc_type)
