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
    model VARCHAR(100) DEFAULT 'claude-3-5-sonnet-20241022',
    temperature NUMERIC(3, 2) DEFAULT 0.20,
    max_tokens INT DEFAULT 2000,
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
  'DIRECTRICES GENERALES DE INTELIGENCIA Y SEGURIDAD:
1. Idioma y Tono: Redactar estrictamente en español formal, sobrio y ejecutivo mexicano, adecuado para la titular del Poder Ejecutivo y el Gabinete Legal y Ampliado.
2. Veracidad y Fuentes: Cero alucinaciones. No inferir nombres, cifras ni acontecimientos que no se encuentren respaldados en el texto extraído por OCR.
3. Descarte Estricto: Omitir de forma taxativa noticias deportivas, notas de espectáculos, farándula, notas de sociales y cartelera cultural no oficial.
4. Enfoque Soberano: Destacar el impacto concreto sobre el Estado de Guanajuato y sus 46 municipios (seguridad, inversión económica, gobernabilidad y obras públicas).',
  'Filtrar cualquier nota sin relevancia de política pública o seguridad. Conservar información verificable.',
  'Formato JSON estándar SentinelIQ con resumen_ejecutivo, puntos_clave (Top 5), temas de seguridad, política, economía y mini_resumen.',
  'claude-3-5-sonnet-20241022',
  0.20,
  2000
),
(
  '00000000-0000-0000-0000-000000000011',
  'primeras_planas_estatal',
  'Eres un analista senior de inteligencia política y seguridad para el Despacho de la Gobernadora de Guanajuato. Tu tarea es procesar el texto extraído por OCR de las Primeras Planas Estatales (AM, Correo, El Sol del Bajío, Zona Franca) y generar una síntesis ejecutiva de alto nivel para toma de decisiones.',
  'Descartar deportes, farándula y notas sociales. Priorizar seguridad física (FSPE, operativos en Celaya, Irapuato, León), inversión económica en Puerto Interior y gobernabilidad.',
  'JSON estructurado con: resumen_ejecutivo (4-5 oraciones), puntos_clave (5 viñetas de impacto), temas_seguridad, temas_politica, temas_economia, relevancia_estatal y mini_resumen (3 líneas).',
  'claude-3-5-sonnet-20241022',
  0.20,
  2000
),
(
  '00000000-0000-0000-0000-000000000011',
  'primeras_planas_nacional',
  'Eres un analista de estrategia federal y prospectiva económica. Analiza las Primeras Planas Nacionales (Reforma, El Universal, Milenio, El Financiero) e identifica el impacto directo que las decisiones federales tienen sobre el Estado de Guanajuato.',
  'Filtrar notas de política federal, tipo de cambio, presupuesto de egresos, seguridad nacional y comercio exterior.',
  'JSON con puntos clave y sección prioritaria de Relevancia Estatal para Guanajuato.',
  'claude-3-5-sonnet-20241022',
  0.20,
  2000
),
(
  '00000000-0000-0000-0000-000000000011',
  'sintesis_estatal',
  'Procesar la Síntesis Estatal Oficial de Guanajuato generada por dependencias públicas. Destacar acuerdos de gobierno, entregas de obra pública, convenios municipales y agenda del Poder Ejecutivo.',
  'Conservar todos los comunicados oficiales y declaraciones institucionales.',
  'Resumen estructurado con agenda del día, acuerdos y prioridades para el gabinete.',
  'claude-3-5-sonnet-20241022',
  0.15,
  2000
),
(
  '00000000-0000-0000-0000-000000000011',
  'columnas_politicas',
  'Analizar las Columnas Políticas de opinión de Guanajuato. Identificar el balance de opinión pública, críticas constructivas hacia dependencias estatales y prospectiva política en los 46 municipios.',
  'Descartar sociales y deportes. Enfocarse en gobernabilidad y acuerdos políticos.',
  'Puntos de opinión clave, análisis de riesgos de reputación y balance cualitativo de medios.',
  'claude-3-5-sonnet-20241022',
  0.25,
  2000
)
ON CONFLICT (state_id, document_type) DO UPDATE
SET system_prompt = EXCLUDED.system_prompt,
    filtering_rules = EXCLUDED.filtering_rules,
    output_format = EXCLUDED.output_format,
    updated_at = NOW();

-- 3. Seed Usuarios Oficiales para Guanajuato
INSERT INTO users (id, state_id, email, hashed_pwd, role, name, cargo, active)
VALUES
(
  'aaaaaaaa-1111-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000011',
  'gobernadora@guanajuato.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W', -- password123
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
