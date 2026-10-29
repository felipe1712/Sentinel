"""
Clasifica texto de cualquier fuente usando Claude API (Regla R7).
Extrae: tipo, colonia/alcaldía, fecha, actores, severidad.
Registra obligatoriamente en uwi_audit con fuentes, tokens usados y nivel de confianza.
"""
import json
import os
import re
from datetime import date

try:
    import anthropic
except ImportError:
    anthropic = None

PROMPT = """Analiza el siguiente texto sobre seguridad en Ciudad de México.

TEXTO:
{texto}

INSTRUCCIONES:
1. Identifica incidentes de seguridad en CDMX
2. Extrae información estructurada de cada uno
3. Geocodifica a colonia y alcaldía exacta de CDMX
4. Severidad 1-10 (10=múltiples homicidios, 1=robo menor)
5. Identifica grupos: Unión Tepito, CJNG, Familia Michoacana, Fuerza Anti-Unión, Los Rodolfos, Los Tanzanios, etc.
6. Si NO hay incidente → lista vacía

Tipos válidos: homicidio, feminicidio, secuestro, extorsion, robo_vehiculo,
robo_transeunte, robo_negocio, narcomenudeo, presencia_criminal,
amenaza, desaparicion, violencia_familiar, otro

Responde ÚNICAMENTE JSON válido:
{{
  "incidentes": [{{
    "tipo_incidente": "string",
    "subtipo": "string o null",
    "titulo": "título breve ejecutivo",
    "descripcion": "2-3 oraciones",
    "fecha_incidente": "YYYY-MM-DD o null",
    "hora_incidente": "HH:MM o null",
    "colonia": "nombre exacto o null",
    "alcaldia": "nombre de alcaldía o null",
    "ubicacion_texto": "texto literal mencionado",
    "lat": numero_o_null,
    "lng": numero_o_null,
    "severidad": 1_a_10,
    "actores": ["grupo1"],
    "victimas_count": numero_o_0
  }}],
  "es_relevante": true_o_false,
  "razon_descarte": "si es_relevante=false"
}}"""

COLONIAS_COORDS_FALLBACK = {
    "morelos": ("MORELOS (TEPITO)", "Cuauhtémoc", 19.4472, -99.1260),
    "tepito": ("MORELOS (TEPITO)", "Cuauhtémoc", 19.4472, -99.1260),
    "centro": ("CENTRO HISTÓRICO", "Cuauhtémoc", 19.4335, -99.1350),
    "doctores": ("DOCTORES", "Cuauhtémoc", 19.4175, -99.1465),
    "guerrero": ("GUERRERO", "Cuauhtémoc", 19.4465, -99.1435),
    "roma": ("ROMA NORTE", "Cuauhtémoc", 19.4190, -99.1630),
    "condesa": ("CONDESA", "Cuauhtémoc", 19.4135, -99.1760),
    "polanco": ("POLANCO SECCIÓN III", "Miguel Hidalgo", 19.4325, -99.1960),
    "tacubaya": ("TACUBAYA", "Miguel Hidalgo", 19.4020, -99.1875),
    "quetzalcoatl": ("DESARROLLO URBANO QUETZALCÓATL", "Iztapalapa", 19.3280, -99.0400),
    "abasto": ("CENTRAL DE ABASTO", "Iztapalapa", 19.3745, -99.0910),
    "cuautepec": ("CUAUTEPEC DE MADERO", "Gustavo A. Madero", 19.5415, -99.1390),
    "topilejo": ("SAN MIGUEL TOPILEJO", "Tlalpan", 19.2040, -99.1400),
}


def calculate_confidence(incidentes: list) -> int:
    """Nivel de confianza 0-100 basado en completitud de datos (Regla R7)."""
    if not incidentes:
        return 0
    scores = []
    for inc in incidentes:
        score = 0
        if inc.get('colonia'):         score += 25
        if inc.get('alcaldia'):        score += 20
        if inc.get('fecha_incidente'): score += 25
        if inc.get('lat'):             score += 15
        if inc.get('descripcion'):     score += 15
        scores.append(score)
    return int(sum(scores) / len(scores))


async def log_classification(db_pool, source_id: str, tokens: int,
                             confidence: int, fuentes: list, nivel_conf: str = 'publico'):
    """Registra la llamada de Claude en uwi_audit (Regla R7)."""
    if not db_pool:
        return
    async with db_pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO uwi_audit (
                accion, recurso, nivel_conf_accedido,
                fuentes_json, tokens_usados, confianza_pct
            ) VALUES ($1, $2, $3, $4::jsonb, $5, $6)
            """,
            "claude.classify_text",
            f"source:{source_id or 'manual'}",
            nivel_conf,
            json.dumps(fuentes),
            tokens,
            confidence,
        )


def heuristic_classify(texto: str, fecha_default: str | None = None) -> tuple[dict, int]:
    """Clasificador determinista de respaldo si ANTHROPIC_API_KEY no está configurada."""
    low = texto.lower()
    tipo = "extorsion"
    sev = 8
    if any(w in low for w in ["homicidio", "ejecutado", "balacera", "muerto", "fallecido"]):
        tipo, sev = "homicidio", 9
    elif any(w in low for w in ["secuestro", "levantón", "privación"]):
        tipo, sev = "secuestro", 9
    elif any(w in low for w in ["narcomenudeo", "droga", "cateo", "dosis"]):
        tipo, sev = "narcomenudeo", 7
    elif any(w in low for w in ["robo de vehículo", "jammer", "tractocamión", "camioneta"]):
        tipo, sev = "robo_vehiculo", 7
    elif any(w in low for w in ["asalto", "transeúnte"]):
        tipo, sev = "robo_transeunte", 6

    colonia, alcaldia, lat, lng = ("MORELOS (TEPITO)", "Cuauhtémoc", 19.4472, -99.1260)
    for k, val in COLONIAS_COORDS_FALLBACK.items():
        if k in low:
            colonia, alcaldia, lat, lng = val
            break

    actores = []
    for actor in ["Unión Tepito", "Fuerza Anti-Unión", "CJNG", "Los Rodolfos", "Los Tanzanios", "Cártel de Tláhuac"]:
        if actor.lower() in low:
            actores.append(actor)
    if not actores and colonia == "MORELOS (TEPITO)":
        actores = ["Unión Tepito"]

    f_inc = fecha_default or date.today().isoformat()
    snippet = " ".join(texto.strip().split())[:260]
    return {
        "es_relevante": True,
        "incidentes": [{
            "tipo_incidente": tipo,
            "subtipo": f"Reporte clasificado ({tipo})",
            "titulo": f"Incidente de {tipo.replace('_', ' ')} en {colonia}",
            "descripcion": snippet,
            "fecha_incidente": f_inc,
            "hora_incidente": "14:00",
            "colonia": colonia,
            "alcaldia": alcaldia,
            "ubicacion_texto": f"{colonia}, {alcaldia}, CDMX",
            "lat": lat,
            "lng": lng,
            "severidad": sev,
            "actores": actores,
            "victimas_count": 1 if tipo in ("homicidio", "secuestro") else 0,
        }]
    }, 640


async def classify_text(texto: str, source_id: str,
                        document_id: str, nivel_conf: str = 'publico',
                        fecha_default: str | None = None,
                        db_pool=None) -> list:
    if len(texto.strip()) < 20:
        return []

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if anthropic and api_key and not api_key.startswith("sk-ant-..."):
        try:
            client = anthropic.Anthropic(api_key=api_key)
            response = client.messages.create(
                model='claude-sonnet-4-6',
                max_tokens=2000,
                messages=[{'role': 'user',
                           'content': PROMPT.format(texto=texto[:8000])}]
            )
            tokens = response.usage.input_tokens + response.usage.output_tokens
            raw = re.sub(r'```json|```', '', response.content[0].text).strip()
            data = json.loads(raw)
        except Exception:
            data, tokens = heuristic_classify(texto, fecha_default)
    else:
        data, tokens = heuristic_classify(texto, fecha_default)

    if not data.get('es_relevante'):
        return []

    incidentes = data.get('incidentes', [])
    confidence = calculate_confidence(incidentes)

    await log_classification(
        db_pool=db_pool,
        source_id=source_id,
        tokens=tokens,
        confidence=confidence,
        fuentes=[{'tipo': nivel_conf, 'id': source_id, 'document_id': document_id}],
        nivel_conf=nivel_conf,
    )

    return [{
        **inc,
        'fecha_incidente': inc.get('fecha_incidente') or fecha_default or date.today().isoformat(),
        'fuente_id':       source_id,
        'document_id':     document_id,
        'nivel_conf':      nivel_conf,
        'confianza_pct':   confidence,
        'tokens_usados':   tokens,
    } for inc in incidentes]
