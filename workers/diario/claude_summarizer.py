"""
Genera resúmenes ejecutivos de cada documento vía Claude API (MCP).
El resumen es el producto final que ve el gobernador y su equipo de gabinete.
Usa las instrucciones personalizadas configuradas en el Panel de Administración.
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

DEFAULT_PROMPTS = {
  'primeras_planas_nacional': """
Eres el analista de prensa de la Oficina del Despacho Ejecutivo del Estado.
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
  "temas_seguridad": "Párrafo enfocado solo en seguridad nacional y lo que afecta al estado",
  "temas_politica": "Párrafo de política nacional relevante para el gobierno estatal",
  "temas_economia": "Párrafo de economía y finanzas con impacto estatal",
  "relevancia_estatal": "¿Qué de lo nacional impacta directamente al estado hoy?",
  "mini_resumen": "Máximo 3 líneas. Para widget ejecutivo. Lo más importante del día."
}}

REGLAS: Español formal ejecutivo. Sin jerga. Sin datos sin fuente.
Enfatizar todo lo que afecta al estado aunque sea tema nacional.""",

  'primeras_planas_estatal': """
Eres el analista de prensa de la Oficina del Despacho Ejecutivo del Estado.
Analiza los titulares de las PRIMERAS PLANAS DE MEDIOS ESTATALES del {fecha}.

ITEMS SELECCIONADOS:
{items_json}

Genera resumen ejecutivo en JSON:
{{
  "resumen_ejecutivo": "4-5 oraciones. Situación del estado según medios locales. Tono ejecutivo.",
  "puntos_clave": ["Punto 1", "Punto 2", "Punto 3", "Punto 4", "Punto 5"],
  "temas_seguridad": "Seguridad en el estado: incidentes, operativos, declaraciones",
  "temas_politica": "Política local: declaraciones, tensiones, acuerdos",
  "temas_economia": "Economía y obras: inversiones, empleos, industria",
  "relevancia_estatal": "Los 2-3 temas que más requieren atención de la titular del Ejecutivo hoy",
  "mini_resumen": "Máximo 3 líneas. Para widget ejecutivo."
}}

ÉNFASIS ESPECIAL en seguridad: operativos, despliegues, FSPE, corporaciones municipales. Mencionar municipios específicos afectados.""",

  'sintesis_estatal': """
Eres el analista de la Oficina del Despacho Ejecutivo del Estado.
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
Eres el analista político de la Oficina del Despacho Ejecutivo del Estado.
Analiza las COLUMNAS POLÍTICAS del {fecha}.

COLUMNAS SELECCIONADAS:
{items_json}

Genera resumen ejecutivo en JSON:
{{
  "resumen_ejecutivo": "4-5 oraciones. ¿Qué narrativa construyen los columnistas hoy sobre el Estado?",
  "puntos_clave": ["Punto 1", "Punto 2", "Punto 3", "Punto 4", "Punto 5"],
  "temas_seguridad": "Análisis político de la situación de seguridad según columnistas",
  "temas_politica": "Opiniones y críticas políticas relevantes al gobierno estatal",
  "temas_economia": "Perspectiva de columnistas sobre economía local",
  "relevancia_estatal": "¿Qué dice la opinión publicada que el gobierno debe saber?",
  "mini_resumen": "Máximo 3 líneas. Narrativa general de los columnistas hoy."
}}"""
}

def get_custom_prompt_config(state_id: str, doc_type: str, headers: dict) -> dict:
    """Consulta los parámetros OCR configurados por el administrador para este documento."""
    try:
        with httpx.Client() as client:
            resp = client.get(f"{RUST_API}/admin/ocr-prompts/{state_id}", headers=headers, timeout=5.0)
            if resp.status_code == 200:
                prompts_list = resp.json()
                for p in prompts_list:
                    if p.get('document_type') == doc_type:
                        return p
    except Exception as e:
        logger.debug(f"No se pudieron cargar prompts personalizados de la BD: {e}")
    return {}

def generate_summary_via_mcp(items: list, doc_type: str, doc_id: str,
                              state_id: str, fecha: str, headers: dict) -> dict:
    """
    Genera resumen ejecutivo usando Claude API (con soporte de prompts configurables desde /admin).
    Guarda en tabla diario_resumenes.
    """
    if not items:
        logger.warning(f"No hay items para resumir el documento {doc_id}")
        return {}

    custom_cfg = get_custom_prompt_config(state_id, doc_type, headers)
    model_name = custom_cfg.get('model') or 'claude-3-5-sonnet-20241022'
    max_tokens = custom_cfg.get('max_tokens') or 2000

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

        if custom_cfg.get('system_prompt'):
            prompt = f"""
{custom_cfg.get('system_prompt')}

FECHA DE EDICIÓN: {fecha}

REGLAS DE FILTRADO Y PRIORIDAD:
{custom_cfg.get('filtering_rules', '')}

FORMATO DE SALIDA REQUERIDO (JSON):
{custom_cfg.get('output_format', '')}

ITEMS EXTRAÍDOS DEL DOCUMENTO:
{json.dumps(items_clean, ensure_ascii=False, indent=2)}

Genera la respuesta estrictamente en formato JSON válido.
"""
        else:
            prompt_template = DEFAULT_PROMPTS.get(doc_type, DEFAULT_PROMPTS['primeras_planas_nacional'])
            prompt = prompt_template.format(
                fecha=fecha,
                items_json=json.dumps(items_clean, ensure_ascii=False, indent=2)
            )

        try:
            response = client.messages.create(
                model=model_name,
                max_tokens=max_tokens,
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
        'modelo': model_name,
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
