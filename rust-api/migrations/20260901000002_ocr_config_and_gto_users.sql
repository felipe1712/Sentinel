-- ==============================================================================
-- Migración: Configuración de Parámetros OCR y Prompts Claude + Usuarios GTO
-- ==============================================================================

-- 1. Tabla de Parámetros y Prompts para Procesamiento de OCR con Claude
CREATE TABLE IF NOT EXISTS diario_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    system_prompt TEXT NOT NULL,
    filtering_rules TEXT,
    output_format TEXT,
    model VARCHAR(100) DEFAULT 'claude-3-7-sonnet-20250219',
    temperature NUMERIC(3, 2) DEFAULT 0.20,
    max_tokens INT DEFAULT 2500,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(state_id, document_type)
);

CREATE INDEX IF NOT EXISTS idx_diario_prompts_state ON diario_prompts(state_id);

-- 2. Seed de Prompts Iniciales y Reglas Globales para Guanajuato
INSERT INTO diario_prompts (state_id, document_type, system_prompt, filtering_rules, output_format, model, temperature, max_tokens)
VALUES
(
  '00000000-0000-0000-0000-000000000011',
  'global',
  'DIRECTRICES GENERALES TRANSVERSALES DE INTELIGENCIA:
1. Idioma y Tono: Redactar estrictamente en español formal, sobrio y ejecutivo mexicano, adecuado para la titular del Poder Ejecutivo y el Gabinete Legal y Ampliado.
2. Veracidad y Fuentes: Cero alucinaciones. No inferir nombres, cifras ni acontecimientos que no se encuentren explícitamente en el texto extraído por OCR.
3. Descarte Estricto: Omitir de forma taxativa noticias deportivas, farándula, notas de espectáculos y notas de sociales.
4. Enfoque Soberano: Destacar el impacto concreto sobre el Estado de Guanajuato y sus 46 municipios.',
  '- Filtrar cualquier nota sin relevancia de política pública o seguridad.
- Conservar información verificable con nombre de fuente y página.',
  'JSON estructurado estándar SentinelIQ:
{
  "resumen_ejecutivo": "Texto fluido de 4-5 oraciones en tono memo ejecutivo",
  "puntos_clave": ["Punto 1", "Punto 2", "Punto 3", "Punto 4", "Punto 5"],
  "temas_seguridad": "Párrafo de seguridad y justicia",
  "temas_politica": "Párrafo de gobernabilidad y acuerdos",
  "temas_economia": "Párrafo de economía, finanzas y obra",
  "relevancia_estatal": "Impacto y atención prioritaria para Guanajuato",
  "mini_resumen": "3 líneas para widget y proyector de gabinete",
  "digest_whatsapp_telegram": "Texto con formato móvil (*, •, emojis) listo para difusión"
}',
  'claude-3-7-sonnet-20250219',
  0.20,
  2500
),
(
  '00000000-0000-0000-0000-000000000011',
  'social_delivery',
  'REGLAS EDITORIALES DE CONSOLIDACIÓN PARA WHATSAPP / TELEGRAM (MOMENTO 2):
A partir de los 4 JSONs extraídos en el Momento 1 (Estatales, Nacionales, Síntesis Oficial y Columnas), compila un único briefing matutino institucional optimizado para lectura en móvil (60 segundos).

ESTRUCTURA OBLIGATORIA DEL MENSAJE:
1. Encabezado institucional con fecha y hora (07:15 AM).
2. 📌 PANORAMA ESTATAL: Síntesis de portadas locales y notas prioritarias.
3. 🇲🇽 IMPACTO FEDERAL: Acuerdos nacionales que afectan directamente a Guanajuato.
4. 🔴 SEGURIDAD: Balance de operativos, despliegues y municipios prioritarios.
5. ✍️ PULSO POLÍTICO: Postura general de columnistas y narrativa de medios.
6. 🎯 ATENCIÓN PRIORITARIA: Los 2-3 puntos que requieren acción del despacho hoy.
7. Pie de firma oficial con enlace a SentinelIQ.',
  '1. Usar asteriscos (*) para negritas y guión bajo (_) para cursivas (compatibilidad WhatsApp/Telegram).
2. Mantener extensión total menor a 350 palabras.
3. No incluir texto no verificado.',
  'Texto formateado directo para mensajería instantánea.',
  'claude-3-7-sonnet-20250219',
  0.15,
  1500
),
(
  '00000000-0000-0000-0000-000000000011',
  'primeras_planas_estatal',
  'Eres un analista senior de inteligencia política y seguridad para el Despacho de la Gobernadora de Guanajuato. Tu tarea es procesar el texto extraído por OCR de las Primeras Planas Estatales (AM, Correo, El Sol del Bajío, Zona Franca) y generar una síntesis ejecutiva de alto nivel para toma de decisiones.',
  '1. Descartar deportes, farándula y notas sociales.
2. Priorizar seguridad física (FSPE, operativos en Celaya, Irapuato, León), inversión económica en Puerto Interior y gobernabilidad regional.',
  'JSON estructurado con:
- resumen_ejecutivo: Síntesis fluida de 4-5 oraciones.
- puntos_clave: Arreglo de 5 viñetas con hechos de mayor impacto en Guanajuato.
- temas_seguridad: Párrafo de balance operativo y despliegues.
- temas_politica: Párrafo de gobernabilidad, alcaldías y Congreso.
- temas_economia: Párrafo de inversiones y obras en el estado.
- relevancia_estatal: Recomendación prioritaria para la Gobernadora hoy.
- mini_resumen: Síntesis de 3 líneas para pantalla proyector.
- digest_whatsapp_telegram: Entregable listo para enviar con formato móvil.',
  'claude-3-7-sonnet-20250219',
  0.20,
  2500
),
(
  '00000000-0000-0000-0000-000000000011',
  'primeras_planas_nacional',
  'Eres un analista de estrategia federal y prospectiva económica. Analiza las Primeras Planas Nacionales (Reforma, El Universal, Milenio, El Financiero, El Economista) e identifica el impacto directo que las decisiones federales tienen sobre el Estado de Guanajuato.',
  '1. Filtrar notas de política federal, tipo de cambio, presupuesto de egresos, seguridad nacional y comercio exterior.
2. Evaluar el impacto específico de cada política federal en la región del Bajío.',
  'JSON estructurado con:
- resumen_ejecutivo: Síntesis de 4-5 oraciones con lo más relevante de la prensa nacional.
- puntos_clave: Arreglo de 5 viñetas con temas federales clave.
- temas_seguridad: Estrategia y operativos federales de seguridad.
- temas_politica: Política federal y relación con las entidades.
- temas_economia: Tipo de cambio, presupuesto y comercio exterior.
- relevancia_estatal: Impacto directo y acciones que debe tomar Guanajuato.
- mini_resumen: Síntesis de 3 líneas para monitoreo rápido.
- digest_whatsapp_telegram: Entregable listo para enviar con formato móvil.',
  'claude-3-7-sonnet-20250219',
  0.20,
  2500
),
(
  '00000000-0000-0000-0000-000000000011',
  'sintesis_estatal',
  'Procesar la Síntesis Estatal Oficial de Guanajuato generada por dependencias públicas. Destacar acuerdos de gobierno, entregas de obra pública, convenios municipales y agenda del Poder Ejecutivo.',
  'Conservar todos los comunicados oficiales, convenios interinstitucionales y anuncios de dependencias de gobierno.',
  'JSON estructurado con:
- resumen_ejecutivo: Síntesis de 4-5 oraciones sobre la agenda y acuerdos oficiales del Gobierno del Estado.
- puntos_clave: Arreglo de 5 viñetas con los compromisos y anuncios prioritarios.
- temas_seguridad: Acciones y equipamiento de seguridad del gobierno estatal.
- temas_politica: Agenda política, convenios con alcaldes y gira del Ejecutivo.
- temas_economia: Obra pública, infraestructura y programas de desarrollo.
- relevancia_estatal: Compromisos prioritarios que requieren atención inmediata.
- mini_resumen: Síntesis de 3 líneas para monitoreo rápido.
- digest_whatsapp_telegram: Entregable listo para enviar con formato móvil.',
  'claude-3-5-sonnet-20241022',
  0.15,
  2000
),
(
  '00000000-0000-0000-0000-000000000011',
  'columnas_politicas',
  'Analizar las Columnas Políticas de opinión de Guanajuato. Identificar el balance de opinión pública, críticas constructivas hacia dependencias estatales y prospectiva política en los 46 municipios.',
  'Descartar sociales y deportes. Enfocarse en gobernabilidad, legislatura local y acuerdos políticos.',
  'JSON estructurado con:
- resumen_ejecutivo: Síntesis de 4-5 oraciones sobre la narrativa predominante de los columnistas.
- puntos_clave: Arreglo de 5 viñetas con las opiniones y análisis más trascendentes.
- temas_seguridad: Postura y balance de columnistas sobre seguridad.
- temas_politica: Gobernabilidad, fracciones legislativas y acuerdos.
- temas_economia: Opinión sobre clima de negocios y finanzas públicas.
- relevancia_estatal: Riesgos de reputación o temas que el Despacho debe atender.
- mini_resumen: Síntesis de 3 líneas con el pulso mediático.
- digest_whatsapp_telegram: Entregable listo para enviar con formato móvil.',
  'claude-3-7-sonnet-20250219',
  0.25,
  2500
)
ON CONFLICT (state_id, document_type) DO UPDATE
SET system_prompt = EXCLUDED.system_prompt,
    filtering_rules = EXCLUDED.filtering_rules,
    output_format = EXCLUDED.output_format,
    model = EXCLUDED.model,
    updated_at = NOW();

-- 3. Seed Usuarios Oficiales para Guanajuato
INSERT INTO users (id, state_id, email, hashed_pwd, role, name, cargo, active)
VALUES
(
  'aaaaaaaa-1111-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000011',
  'gobernadora@guanajuato.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'gobernador',
  'Libia Dennise García Muñoz Ledo',
  'Gobernadora Constitucional del Estado de Guanajuato',
  true
),
(
  'aaaaaaaa-1111-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000011',
  'secretario.gobierno@guanajuato.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'jefe_oficina',
  'Mtro. Jorge Daniel Jiménez Lona',
  'Secretario de Gobierno del Estado de Guanajuato',
  true
),
(
  'aaaaaaaa-1111-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000011',
  'seguridad@fspe.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'asesor',
  'Mtro. Mauro González Martínez',
  'Secretario de Seguridad y Paz del Estado de Guanajuato',
  true
),
(
  'aaaaaaaa-1111-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000011',
  'analista.inteligencia@guanajuato.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'analista',
  'Lic. Carlos Mendoza',
  'Director de Inteligencia Situacional y Fuentes',
  true
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    cargo = EXCLUDED.cargo,
    role = EXCLUDED.role,
    state_id = EXCLUDED.state_id,
    active = true;
