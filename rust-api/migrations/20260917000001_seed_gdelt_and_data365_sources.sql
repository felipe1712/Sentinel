-- ==============================================================================
-- SentinelIQ: Fuentes y Eventos Territoriales Iniciales de GDELT 2.0 y Data365
-- Migración: 20260917000001_seed_gdelt_and_data365_sources.sql
-- Enfoque: 100% Territorial, Seguridad, Gobernabilidad y Protección Civil
-- ==============================================================================

-- 1. FUENTES GDELT Y DATA365 PARA GUANAJUATO (Clave INEGI 11)
INSERT INTO sources (id, state_id, type, identifier, name, credibility, active, config) VALUES
(
  '77777777-7777-7777-7777-777777777718',
  '00000000-0000-0000-0000-000000000011',
  'gdelt',
  '@gdelt_prensa',
  'GDELT 2.0 Prensa y Monitoreo Territorial Bajío',
  'verificado',
  true,
  '{
    "enabled": true,
    "poll_interval_seconds": 360,
    "timespan": "24h",
    "queries": [
      {"id": "gto-1", "query": "Celaya FSPE operativo seguridad", "category": "seguridad", "municipio": "Celaya", "active": true},
      {"id": "gto-2", "query": "León vialidad policía accidente", "category": "seguridad", "municipio": "León", "active": true},
      {"id": "gto-3", "query": "Irapuato seguridad tránsito", "category": "seguridad", "municipio": "Irapuato", "active": true},
      {"id": "gto-4", "query": "Salamanca refinería vialidad", "category": "seguridad", "municipio": "Salamanca", "active": true},
      {"id": "gto-5", "query": "Carretera 45 Celaya Irapuato", "category": "seguridad", "municipio": "Villagrán", "active": true},
      {"id": "gto-6", "query": "San Miguel de Allende turismo seguridad", "category": "seguridad", "municipio": "San Miguel de Allende", "active": true}
    ]
  }'
),
(
  '77777777-7777-7777-7777-777777777719',
  '00000000-0000-0000-0000-000000000011',
  'data365_twitter',
  '@data365_twitter',
  'Data365 Redes Sociales Guanajuato',
  'verificado',
  true,
  '{"enabled": true, "poll_interval_seconds": 300}'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, identifier = EXCLUDED.identifier, type = EXCLUDED.type, config = EXCLUDED.config, active = true;


-- 2. FUENTES GDELT Y DATA365 PARA PUEBLA (Clave INEGI 21)
INSERT INTO sources (id, state_id, type, identifier, name, credibility, active, config) VALUES
(
  '77777777-7777-7777-7777-777777777738',
  '21212121-2121-2121-2121-212121212121',
  'gdelt',
  '@gdelt_prensa',
  'GDELT 2.0 Prensa y Monitoreo Territorial Puebla',
  'verificado',
  true,
  '{
    "enabled": true,
    "poll_interval_seconds": 360,
    "timespan": "24h",
    "queries": [
      {"id": "pue-1", "query": "Puebla Capital policía metropolitana seguridad", "category": "seguridad", "municipio": "Puebla", "active": true},
      {"id": "pue-2", "query": "San Martín Texmelucan autopista México-Puebla", "category": "seguridad", "municipio": "San Martín Texmelucan", "active": true},
      {"id": "pue-3", "query": "Tehuacán operativo protección civil", "category": "proteccion_civil", "municipio": "Tehuacán", "active": true},
      {"id": "pue-4", "query": "San Andrés Cholula conurbada vialidad", "category": "seguridad", "municipio": "San Andrés Cholula", "active": true},
      {"id": "pue-5", "query": "Autopista México-Puebla tráfico accidente", "category": "seguridad", "municipio": "Cuautlancingo", "active": true},
      {"id": "pue-6", "query": "Atlixco seguridad patrullaje", "category": "seguridad", "municipio": "Atlixco", "active": true}
    ]
  }'
),
(
  '77777777-7777-7777-7777-777777777739',
  '21212121-2121-2121-2121-212121212121',
  'data365_twitter',
  '@data365_twitter',
  'Data365 Redes Sociales Puebla',
  'verificado',
  true,
  '{"enabled": true, "poll_interval_seconds": 300}'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, identifier = EXCLUDED.identifier, type = EXCLUDED.type, config = EXCLUDED.config, active = true;


-- 3. FUENTES GDELT Y DATA365 PARA QUERÉTARO (Clave INEGI 22)
INSERT INTO sources (id, state_id, type, identifier, name, credibility, active, config) VALUES
(
  '77777777-7777-7777-7777-777777777728',
  '11111111-1111-1111-1111-111111111111',
  'gdelt',
  '@gdelt_prensa',
  'GDELT 2.0 Prensa y Monitoreo Territorial Querétaro',
  'verificado',
  true,
  '{
    "enabled": true,
    "poll_interval_seconds": 360,
    "timespan": "24h",
    "queries": [
      {"id": "qro-1", "query": "Querétaro seguridad vialidad accidente", "category": "seguridad", "municipio": "Santiago de Querétaro", "active": true},
      {"id": "qro-2", "query": "San Juan del Río autopista 57", "category": "seguridad", "municipio": "San Juan del Río", "active": true},
      {"id": "qro-3", "query": "El Marqués drenes prevención protección civil", "category": "proteccion_civil", "municipio": "El Marqués", "active": true},
      {"id": "qro-4", "query": "Corregidora patrullaje operativo", "category": "seguridad", "municipio": "Corregidora", "active": true},
      {"id": "qro-5", "query": "Paseo 5 de Febrero Querétaro movilidad", "category": "seguridad", "municipio": "Santiago de Querétaro", "active": true},
      {"id": "qro-6", "query": "Colón aeropuerto AIQ industria", "category": "politico", "municipio": "Colón", "active": true}
    ]
  }'
),
(
  '77777777-7777-7777-7777-777777777729',
  '11111111-1111-1111-1111-111111111111',
  'data365_twitter',
  '@data365_twitter',
  'Data365 Redes Sociales Querétaro',
  'verificado',
  true,
  '{"enabled": true, "poll_interval_seconds": 300}'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, identifier = EXCLUDED.identifier, type = EXCLUDED.type, config = EXCLUDED.config, active = true;


-- 4. EVENTOS TERRITORIALES INICIALES GDELT / DATA365 PARA GUANAJUATO
INSERT INTO events (
  id, state_id, source_id, category, severity, title, summary, ai_summary,
  political_relevance, location_text, lat, lng, municipio, entities, dedup_hash, original_url, occurred_at
) VALUES
(
  '88888888-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000011',
  '77777777-7777-7777-7777-777777777718',
  'seguridad',
  'medio',
  '[GDELT] Monitoreo Territorial: Operativo de Seguridad y Vigilancia en Corredor Celaya-Villagrán',
  'Despliegue disuasivo en tramos carreteros y accesos industriales con presencia de corporaciones estatales.',
  'Operatividad regular de contención y patrullaje en el corredor industrial Laja-Bajío.',
  7,
  'Celaya, Guanajuato',
  20.5218,
  -100.8140,
  'Celaya',
  '{"fuente": "gdelt", "dominio": "periodicocorreo.com.mx", "municipio_clave": "007"}',
  'gdelt:gto:celaya:init2026',
  'https://periodicocorreo.com.mx/seguridad/celaya-operativo-vigilancia',
  NOW() - INTERVAL '1 hour 20 minutes'
),
(
  '88888888-0000-0000-0000-000000000022',
  '00000000-0000-0000-0000-000000000011',
  '77777777-7777-7777-7777-777777777718',
  'seguridad',
  'medio',
  '[GDELT] Monitoreo Vial Metropolitano: Supervisión de Tránsito y Despeje en Blvd. Adolfo López Mateos',
  'Agilización de flujo vehicular y coordinación intermunicipal en arteria central de la capital del calzado.',
  'Circulación fluida tras retiro preventivo de obstáculos viales.',
  6,
  'León, Guanajuato',
  21.1221,
  -101.6825,
  'León',
  '{"fuente": "gdelt", "dominio": "heraldo.mx", "municipio_clave": "020"}',
  'gdelt:gto:leon:init2026',
  'https://heraldo.mx/leon-vialidad-supervision',
  NOW() - INTERVAL '3 hours 10 minutes'
),
(
  '88888888-0000-0000-0000-000000000023',
  '00000000-0000-0000-0000-000000000011',
  '77777777-7777-7777-7777-777777777719',
  'seguridad',
  'bajo',
  '[Data365] Tendencia en Redes: Movilidad Fluida en Accesos a Guanajuato Puerto Interior',
  'Monitoreo digital en X/Twitter reporta normalidad en turnos laborales y logística manufacturera.',
  'Conversación digital ciudadana reporta tránsito despejado sin bloqueos.',
  5,
  'Silao, Guanajuato',
  20.9431,
  -101.4272,
  'Silao',
  '{"fuente": "data365_twitter", "platform": "twitter", "municipio_clave": "037"}',
  'data365:gto:silao:init2026',
  'https://twitter.com/Data365Radar/status/gto_silao_01',
  NOW() - INTERVAL '5 hours 45 minutes'
)
ON CONFLICT (dedup_hash) DO NOTHING;


-- 5. EVENTOS TERRITORIALES INICIALES GDELT / DATA365 PARA PUEBLA
INSERT INTO events (
  id, state_id, source_id, category, severity, title, summary, ai_summary,
  political_relevance, location_text, lat, lng, municipio, entities, dedup_hash, original_url, occurred_at
) VALUES
(
  '88888888-0000-0000-0000-000000000031',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777738',
  'seguridad',
  'alto',
  '[GDELT] Monitoreo Territorial: Operativo de Vigilancia Carretera en Caseta México-Puebla',
  'Blindaje preventivo y coordinación en el tramo San Martín Texmelucan para seguridad del transporte logístico.',
  'Atención prioritaria de Secretaría de Gobernación y Seguridad Estatal en el nodo carretero.',
  8,
  'San Martín Texmelucan, Puebla',
  19.2844,
  -98.4342,
  'San Martín Texmelucan',
  '{"fuente": "gdelt", "dominio": "elsoldepuebla.com.mx", "municipio_clave": "132"}',
  'gdelt:pue:texmelucan:init2026',
  'https://elsoldepuebla.com.mx/policiaca/texmelucan-autopista-seguridad',
  NOW() - INTERVAL '1 hour 45 minutes'
),
(
  '88888888-0000-0000-0000-000000000032',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777738',
  'politico',
  'medio',
  '[GDELT] Gobernabilidad y Mediación Social: Avance de Mesas de Trabajo con Sectores en Tehuacán',
  'Instalación pacífica de diálogo técnico sobre gestión del agua y comités ejidales del Valle de Tehuacán.',
  'Canalización institucional temprana que previene cierres viales o manifestaciones.',
  6,
  'Tehuacán, Puebla',
  18.4633,
  -97.3931,
  'Tehuacán',
  '{"fuente": "gdelt", "dominio": "milenio.com", "municipio_clave": "156"}',
  'gdelt:pue:tehuacan:init2026',
  'https://milenio.com/politica/comunidad/tehuacan-mesas-dialogo-puebla',
  NOW() - INTERVAL '4 hours 20 minutes'
),
(
  '88888888-0000-0000-0000-000000000033',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777739',
  'seguridad',
  'bajo',
  '[Data365] Conversación Digital: Patrullaje y Blindaje Turístico en Corredor Atlixco',
  'Reportes en redes sociales constatan tranquilidad y flujo fluido en accesos al corredor de Atlixco.',
  'Monitoreo social reporta percepción favorable sin alertas críticas de seguridad.',
  5,
  'Atlixco, Puebla',
  18.9083,
  -98.4328,
  'Atlixco',
  '{"fuente": "data365_twitter", "platform": "twitter", "municipio_clave": "019"}',
  'data365:pue:atlixco:init2026',
  'https://twitter.com/Data365Radar/status/pue_atlixco_01',
  NOW() - INTERVAL '6 hours 15 minutes'
)
ON CONFLICT (dedup_hash) DO NOTHING;


-- 6. EVENTOS TERRITORIALES INICIALES GDELT / DATA365 PARA QUERÉTARO
INSERT INTO events (
  id, state_id, source_id, category, severity, title, summary, ai_summary,
  political_relevance, location_text, lat, lng, municipio, entities, dedup_hash, original_url, occurred_at
) VALUES
(
  '88888888-0000-0000-0000-000000000041',
  '11111111-1111-1111-1111-111111111111',
  '77777777-7777-7777-7777-777777777728',
  'seguridad',
  'medio',
  '[GDELT] Monitoreo de Movilidad: Avance de Obras y Circulación en Paseo 5 de Febrero',
  'Reporte de prensa regional sobre tiempos de traslado en carriles centrales y laterales de la arteria metropolitana.',
  'Tránsito continuo sin cuellos de botella severos en hora pico matutina.',
  7,
  'Santiago de Querétaro, Querétaro',
  20.5888,
  -100.3899,
  'Santiago de Querétaro',
  '{"fuente": "gdelt", "dominio": "diariodequeretaro.com.mx", "municipio_clave": "014"}',
  'gdelt:qro:5defebrero:init2026',
  'https://diariodequeretaro.com.mx/local/5-de-febrero-movilidad-reporte',
  NOW() - INTERVAL '2 hours 30 minutes'
),
(
  '88888888-0000-0000-0000-000000000042',
  '11111111-1111-1111-1111-111111111111',
  '77777777-7777-7777-7777-777777777729',
  'seguridad',
  'bajo',
  '[Data365] Radar Digital: Monitoreo Preventivo en Libramiento Surponiente',
  'Redes sociales reportan operación coordinada con arcos lectores y patrullaje preventivo de PoEs.',
  'Saldo normal en corredor metropolitano Corregidora - Querétaro.',
  5,
  'Corregidora, Querétaro',
  20.5333,
  -100.4333,
  'Corregidora',
  '{"fuente": "data365_twitter", "platform": "twitter", "municipio_clave": "006"}',
  'data365:qro:corregidora:init2026',
  'https://twitter.com/Data365Radar/status/qro_corregidora_01',
  NOW() - INTERVAL '7 hours 10 minutes'
)
ON CONFLICT (dedup_hash) DO NOTHING;
