-- ==============================================================================
-- SentinelIQ: INICIALIZACIÓN COMPLETA PARA PUEBLA (Esquemas + Migraciones + Seed)
-- Base de Datos: sentineliq_pue
-- ==============================================================================

-- 1. Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Esquema Base
CREATE TABLE IF NOT EXISTS states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  clave_inegi CHAR(2) NOT NULL UNIQUE,
  polygon JSONB NOT NULL,
  buffer_km INTEGER DEFAULT 15,
  logo_url VARCHAR(500),
  color_primario VARCHAR(7) DEFAULT '#1a73e8',
  nombre_dependencia VARCHAR(200),
  timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
  active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID REFERENCES states(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  hashed_pwd VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin','jefe_oficina','asesor','analista','gobernador')),
  name VARCHAR(200) NOT NULL,
  cargo VARCHAR(200),
  active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('telegram','rss','api_federal','social','webhook','gdelt','data365_twitter','data365')),
  identifier VARCHAR(500) NOT NULL,
  name VARCHAR(200) NOT NULL,
  credibility VARCHAR(20) DEFAULT 'no_verificado' CHECK (credibility IN ('oficial','verificado','no_verificado')),
  active BOOLEAN DEFAULT true,
  keywords TEXT[] DEFAULT '{}',
  last_checked TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telegram_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  tg_id BIGINT NOT NULL,
  username VARCHAR(200),
  title VARCHAR(500),
  subscribers INTEGER DEFAULT 0,
  last_message_id BIGINT DEFAULT 0,
  relevance_score INTEGER DEFAULT 0 CHECK (relevance_score BETWEEN 0 AND 100),
  category VARCHAR(100),
  session_string_enc TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS raw_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  raw_text TEXT,
  raw_data JSONB,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  raw_event_id UUID REFERENCES raw_events(id) ON DELETE SET NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN
    ('seguridad','proteccion_civil','salud','politico','social','economia','ciberseguridad')),
  severity VARCHAR(15) NOT NULL CHECK (severity IN ('critico','alto','medio','bajo','informativo')),
  title VARCHAR(500) NOT NULL,
  summary TEXT NOT NULL,
  ai_summary TEXT,
  political_relevance INTEGER DEFAULT 0 CHECK (political_relevance BETWEEN 0 AND 10),
  location_text VARCHAR(500),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  municipio VARCHAR(200),
  entities JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'nuevo' CHECK (status IN ('nuevo','revisado','descartado','escalado')),
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_state_severity ON events(state_id, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_state_category ON events(state_id, category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_municipio ON events(state_id, municipio) WHERE municipio IS NOT NULL;

CREATE TABLE IF NOT EXISTS narratives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  trend VARCHAR(10) DEFAULT 'estable' CHECK (trend IN ('subiendo','estable','bajando')),
  volume_24h INTEGER DEFAULT 0,
  volume_7d INTEGER DEFAULT 0,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  event_ids UUID[] DEFAULT '{}',
  category VARCHAR(30),
  ai_analysis TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('persona','organizacion','medio','partido','funcionario')),
  name VARCHAR(300) NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  cargo VARCHAR(300),
  partido VARCHAR(200),
  descripcion TEXT,
  risk_level VARCHAR(10) DEFAULT 'ninguno' CHECK (risk_level IN ('alto','medio','bajo','ninguno')),
  photo_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  context TEXT NOT NULL,
  sentiment VARCHAR(10) DEFAULT 'neutro' CHECK (sentiment IN ('positivo','neutro','negativo')),
  confidence DOUBLE PRECISION DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title VARCHAR(500),
  executive_summary TEXT NOT NULL,
  key_points JSONB NOT NULL DEFAULT '[]',
  heat_map_data JSONB DEFAULT '{}',
  narratives_data JSONB DEFAULT '[]',
  watch_today JSONB DEFAULT '[]',
  political_context TEXT,
  mcp_intel JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  delivered_at TIMESTAMPTZ,
  UNIQUE(state_id, date)
);

CREATE TABLE IF NOT EXISTS dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('situacional','incidente','perfil','municipal','politico','narrativa')),
  title VARCHAR(500) NOT NULL,
  bluf TEXT NOT NULL,
  content JSONB NOT NULL,
  confidence VARCHAR(10) DEFAULT 'medio' CHECK (confidence IN ('alto','medio','bajo')),
  risk_level VARCHAR(10),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cabinet_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  semaforos JSONB NOT NULL,
  key_points JSONB NOT NULL,
  alert_level VARCHAR(15) DEFAULT 'NORMAL' CHECK (alert_level IN ('NORMAL','VIGILANCIA','ALERTA','EMERGENCIA')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ip_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  ip VARCHAR(45) NOT NULL,
  actor VARCHAR(200),
  hostname VARCHAR(500),
  country CHAR(2),
  source VARCHAR(200),
  seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('diario','semanal','incidente','ejecutivo','ciberseguridad')),
  period VARCHAR(100),
  pdf_url VARCHAR(500),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_to TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS spider_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  target VARCHAR(500) NOT NULL,
  sf_scan_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  findings_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- 3. Query Audit
CREATE TABLE IF NOT EXISTS query_audit (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id         UUID NOT NULL,
  user_id          UUID,
  query_type       VARCHAR(20) NOT NULL CHECK (query_type IN
                   ('briefing','dossier','alerta','osint','narrativa','clasificacion')),
  prompt_text      TEXT NOT NULL,
  model            VARCHAR(100) DEFAULT 'claude-sonnet-4-6',
  tools_used       TEXT[] DEFAULT '{}',
  sources          JSONB NOT NULL DEFAULT '[]',
  confidence_score INTEGER DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
  hallucination_flag    BOOLEAN DEFAULT false,
  hallucination_note    TEXT,
  tokens_used      INTEGER DEFAULT 0,
  latency_ms       INTEGER DEFAULT 0,
  result_summary   TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_query_audit_state ON query_audit(state_id, created_at DESC);

-- 4. GIS Electoral
CREATE TABLE IF NOT EXISTS electoral_geometries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID NOT NULL,
    geo_type VARCHAR(30) NOT NULL,
    clave_entidad INT NOT NULL DEFAULT 21,
    clave_municipio INT NOT NULL,
    nombre_municipio VARCHAR(100),
    distrito_local INT,
    distrito_federal INT,
    clave_seccion INT,
    tipo_seccion VARCHAR(20),
    area_km2 NUMERIC(10, 4),
    properties JSONB DEFAULT '{}'::jsonb,
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_electoral_geom ON electoral_geometries USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_electoral_seccion ON electoral_geometries(clave_seccion);
CREATE INDEX IF NOT EXISTS idx_electoral_mpio ON electoral_geometries(clave_municipio);
CREATE INDEX IF NOT EXISTS idx_electoral_state_type ON electoral_geometries(state_id, geo_type);

CREATE TABLE IF NOT EXISTS electoral_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID NOT NULL,
    election_year INT NOT NULL,
    election_type VARCHAR(50) NOT NULL,
    clave_seccion INT NOT NULL,
    clave_municipio INT NOT NULL,
    lista_nominal INT DEFAULT 0,
    total_votos INT DEFAULT 0,
    participacion_pct NUMERIC(6, 2) DEFAULT 0.0,
    ganador_partido VARCHAR(50),
    ganador_votos INT DEFAULT 0,
    ganador_pct NUMERIC(6, 2) DEFAULT 0.0,
    segundo_partido VARCHAR(50),
    segundo_votos INT DEFAULT 0,
    segundo_pct NUMERIC(6, 2) DEFAULT 0.0,
    margen_victoria_pct NUMERIC(6, 2) DEFAULT 0.0,
    votos_partidos JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_result_seccion_year_type UNIQUE (state_id, election_year, election_type, clave_seccion)
);
CREATE INDEX IF NOT EXISTS idx_results_seccion ON electoral_results(clave_seccion);
CREATE INDEX IF NOT EXISTS idx_results_year_type ON electoral_results(election_year, election_type);

CREATE TABLE IF NOT EXISTS gis_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID NOT NULL,
    layer_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'medio',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    clave_seccion INT,
    clave_municipio INT,
    geom GEOMETRY(Point, 4326),
    source VARCHAR(50) DEFAULT 'manual_csv',
    metadata JSONB DEFAULT '{}'::jsonb,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gis_events_geom ON gis_events USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_gis_events_layer ON gis_events(layer_type, is_active);

-- ==============================================================================
-- 5. SEED DATA PARA PUEBLA (Clave INEGI 21)
-- ==============================================================================

-- 5.1 Registro de Puebla en states
INSERT INTO states (id, name, clave_inegi, polygon, nombre_dependencia, color_primario)
VALUES (
  '21212121-2121-2121-2121-212121212121',
  'Estado de Puebla',
  '21',
  '{"type": "Polygon", "coordinates": [[[-98.7, 18.0], [-96.7, 18.0], [-96.7, 20.8], [-98.7, 20.8], [-98.7, 18.0]]]}',
  'Despacho del Gobernador del Estado de Puebla',
  '#6a1b9a'
) ON CONFLICT (clave_inegi) DO UPDATE
SET name = EXCLUDED.name, nombre_dependencia = EXCLUDED.nombre_dependencia, color_primario = EXCLUDED.color_primario;

-- 5.2 Usuarios Iniciales para Puebla
INSERT INTO users (id, state_id, email, hashed_pwd, role, name, cargo, active) VALUES
(
  '21212121-0000-0000-0000-000000000001',
  '21212121-2121-2121-2121-212121212121',
  'admin.ti@puebla.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'superadmin',
  'Ing. Alejandro Ceballos',
  'Superadministrador de Plataforma Puebla',
  true
),
(
  '21212121-0000-0000-0000-000000000002',
  '21212121-2121-2121-2121-212121212121',
  'gobernador@puebla.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'gobernador',
  'Alejandro Armenta Mier',
  'Gobernador Constitucional del Estado de Puebla',
  true
),
(
  '21212121-0000-0000-0000-000000000003',
  '21212121-2121-2121-2121-212121212121',
  'gobernacion@puebla.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'jefe_oficina',
  'Mtro. Javier Aquino Limón',
  'Secretario de Gobernación del Estado de Puebla',
  true
),
(
  '21212121-0000-0000-0000-000000000004',
  '21212121-2121-2121-2121-212121212121',
  'analista.inteligencia@puebla.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'analista',
  'Lic. Mariana Domínguez',
  'Analista de Monitoreo Territorial Puebla',
  true
)
ON CONFLICT (email) DO UPDATE
SET state_id = EXCLUDED.state_id, role = EXCLUDED.role, name = EXCLUDED.name, cargo = EXCLUDED.cargo;

-- 5.3 Fuentes Vivas para Puebla
INSERT INTO sources (id, state_id, type, identifier, name, credibility, active, last_checked) VALUES
('77777777-7777-7777-7777-777777777731', '21212121-2121-2121-2121-212121212121', 'telegram', '@AlertaPueblaSeguridad', 'Canal Alerta Puebla Seguridad & Vigilancia', 'no_verificado', true, NOW()),
('77777777-7777-7777-7777-777777777732', '21212121-2121-2121-2121-212121212121', 'telegram', '@TraficoPueblaEnVivo', 'Tráfico Puebla y Movilidad Metropolitana', 'verificado', true, NOW()),
('77777777-7777-7777-7777-777777777733', '21212121-2121-2121-2121-212121212121', 'social', '@SSPGobPue', 'Secretaría de Seguridad Pública del Estado de Puebla', 'oficial', true, NOW()),
('77777777-7777-7777-7777-777777777734', '21212121-2121-2121-2121-212121212121', 'social', '@CentralPuebla', 'Periódico Central Puebla — Cobertura Estatal', 'verificado', true, NOW()),
('77777777-7777-7777-7777-777777777735', '21212121-2121-2121-2121-212121212121', 'social', '@ElSoldePuebla', 'El Sol de Puebla — OEM Periodismo Regional', 'verificado', true, NOW()),
('77777777-7777-7777-7777-777777777736', '21212121-2121-2121-2121-212121212121', 'api_federal', 'PC_Estatal_PUE', 'Coordinación General de Protección Civil Puebla', 'oficial', true, NOW()),
('77777777-7777-7777-7777-777777777737', '21212121-2121-2121-2121-212121212121', 'api_federal', 'CONAGUA_Balsas_PUE', 'Organismo de Cuenca Balsas - CONAGUA', 'oficial', true, NOW()),
('77777777-7777-7777-7777-777777777738', '21212121-2121-2121-2121-212121212121', 'gdelt', '@gdelt_prensa', 'GDELT 2.0 Prensa y Monitoreo Territorial Puebla', 'verificado', true, NOW()),
('77777777-7777-7777-7777-777777777739', '21212121-2121-2121-2121-212121212121', 'data365_twitter', '@data365_twitter', 'Data365 Redes Sociales Puebla', 'verificado', true, NOW())
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, identifier = EXCLUDED.identifier, type = EXCLUDED.type, credibility = EXCLUDED.credibility, last_checked = NOW();

-- 5.4 Raw Events para Puebla (Con horas dinámicas de HOY)
INSERT INTO raw_events (id, source_id, state_id, raw_text, ingested_at) VALUES
(
  '99999999-0000-0000-0000-000000000031',
  '77777777-7777-7777-7777-777777777731',
  '21212121-2121-2121-2121-212121212121',
  '⚠️ #ALERTA_TEXMELUCAN [Telegram @AlertaPueblaSeguridad] Reportan operativo preventivo coordinado sobre la Autopista México-Puebla altura caseta de San Martín Texmelucan. Guardia Nacional y Policía Estatal inspeccionan transportes de carga. Circulación con reducción de carril lateral, avance fluido.',
  NOW() - INTERVAL '35 minutes'
),
(
  '99999999-0000-0000-0000-000000000032',
  '77777777-7777-7777-7777-777777777733',
  '21212121-2121-2121-2121-212121212121',
  '🚨 COMUNICADO OFICIAL [@SSPGobPue en X]: Concluye con saldo blanco el despliegue metropolitano Angelópolis en Puebla Capital, San Pedro Cholula y San Andrés Cholula. Se reforzó el patrullaje preventivo en centros comerciales, plazas y corredores turísticos.',
  NOW() - INTERVAL '1 hour 15 minutes'
),
(
  '99999999-0000-0000-0000-000000000033',
  '77777777-7777-7777-7777-777777777732',
  '21212121-2121-2121-2121-212121212121',
  '🚗 #TraficoPuebla [Telegram @TraficoPueblaEnVivo] Cierre preventivo por obras de modernización en Periférico Ecológico a la altura de Cuautlancingo. Vías alternas habilitadas sobre Recta a Cholula y Forjadores. Tráfico moderado.',
  NOW() - INTERVAL '3 hours 10 minutes'
),
(
  '99999999-0000-0000-0000-000000000034',
  '77777777-7777-7777-7777-777777777736',
  '21212121-2121-2121-2121-212121212121',
  '🌋 MONITOREO VOLCÁNICO [PC_Estatal_PUE]: Coordinación General de Protección Civil informa semáforo volcánico del Popocatépetl se mantiene en Amarillo Fase 2. Emisiones leves de vapor y ceniza con dispersión hacia el noreste sin afectación a la zona metropolitana de Puebla.',
  NOW() - INTERVAL '5 hours 40 minutes'
),
(
  '99999999-0000-0000-0000-000000000035',
  '77777777-7777-7777-7777-777777777734',
  '21212121-2121-2121-2121-212121212121',
  '📰 NOTA CENTRAL [@CentralPuebla]: Mesa de diálogo pacífica en Tehuacán: Gobierno del Estado atiende peticiones de comités de agua y agricultores del Valle de Tehuacán. Se pacta mesa técnica para el próximo lunes con Conagua y Gobernación.',
  NOW() - INTERVAL '11 hours 20 minutes'
),
(
  '99999999-0000-0000-0000-000000000036',
  '77777777-7777-7777-7777-777777777735',
  '21212121-2121-2121-2121-212121212121',
  '📈 ECONOMÍA REGIONAL [@ElSoldePuebla]: Reportan ocupación hotelera del 82% en Atlixco y Pueblos Mágicos de la Sierra Norte (Zacatlán y Chignahuapan) de cara a la temporada turística. Alta derrama económica.',
  NOW() - INTERVAL '15 hours'
),
(
  '99999999-0000-0000-0000-000000000037',
  '77777777-7777-7777-7777-777777777731',
  '21212121-2121-2121-2121-212121212121',
  '🌲 REPORTE SIERRA NORTE [Telegram @AlertaPueblaSeguridad]: Tránsito fluido y supervisión carretera en el tramo Huauchinango - Xicotepec. Brigadas de Protección Civil retiran escombros menores tras lluvia matutina sin mayores incidentes.',
  NOW() - INTERVAL '18 hours'
),
(
  '99999999-0000-0000-0000-000000000038',
  '77777777-7777-7777-7777-777777777737',
  '21212121-2121-2121-2121-212121212121',
  '💧 BALANCE HÍDRICO PUEBLA [CONAGUA_Balsas_PUE]: Presas del sistema Necaxa y Valsequillo mantienen niveles óptimos con 72% y 76% de almacenamiento. Abasto garantizado para distritos de riego en Tecamachalco y Tepeaca.',
  NOW() - INTERVAL '21 hours'
)
ON CONFLICT (id) DO UPDATE 
SET raw_text = EXCLUDED.raw_text, ingested_at = EXCLUDED.ingested_at;

-- 5.5 Eventos Procesados para Puebla
INSERT INTO events (
  id, state_id, source_id, raw_event_id, category, severity, title, summary,
  ai_summary, political_relevance, location_text, lat, lng, municipio, status, occurred_at, created_at
) VALUES
(
  '88888888-0000-0000-0000-000000000031',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777731',
  '99999999-0000-0000-0000-000000000031',
  'seguridad',
  'alto',
  'Blindaje Logístico en Caseta Autopista México-Puebla (San Martín Texmelucan)',
  'Inspección y patrullaje conjunto de Guardia Nacional y SSP en acceso industrial de Texmelucan.',
  'Detección temprana y supervisión permanente sin afectación al transporte de carga pesada.',
  8,
  'Caseta de Peaje San Martín Texmelucan km 92',
  19.2840,
  -98.4340,
  'San Martín Texmelucan',
  'revisado',
  NOW() - INTERVAL '35 minutes',
  NOW() - INTERVAL '35 minutes'
),
(
  '88888888-0000-0000-0000-000000000032',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777733',
  '99999999-0000-0000-0000-000000000032',
  'seguridad',
  'medio',
  'Conclusión con Saldo Blanco en Despliegue Metropolitano Angelópolis',
  'SSP Puebla reporta patrullajes preventivos coordinados en Puebla Capital, San Andrés y San Pedro Cholula.',
  'Operatividad regular y cobertura disuasiva en centros comerciales y zonas turísticas.',
  7,
  'Zona Comercial Angelópolis y Vía Atlixcáyotl',
  19.0414,
  -98.2063,
  'Puebla',
  'revisado',
  NOW() - INTERVAL '1 hour 15 minutes',
  NOW() - INTERVAL '1 hour 15 minutes'
),
(
  '88888888-0000-0000-0000-000000000033',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777732',
  '99999999-0000-0000-0000-000000000033',
  'proteccion_civil',
  'medio',
  'Cierre Preventivo por Obras en Periférico Ecológico (Cuautlancingo)',
  'Canal de vialidad en vivo alerta de reducción de carriles y desvíos hacia Forjadores y Recta a Cholula.',
  'Impacto moderado en movilidad metropolitana. Se canaliza tráfico con auxilio vial del estado.',
  6,
  'Periférico Ecológico entronque Forjadores',
  19.0833,
  -98.2833,
  'Cuautlancingo',
  'revisado',
  NOW() - INTERVAL '3 hours 10 minutes',
  NOW() - INTERVAL '3 hours 10 minutes'
),
(
  '88888888-0000-0000-0000-000000000034',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777736',
  '99999999-0000-0000-0000-000000000034',
  'proteccion_civil',
  'medio',
  'Vigilancia Permanente Popocatépetl en Amarillo Fase 2',
  'Monitoreo sismológico y de emisiones volcánicas; sin caída de ceniza en zona urbana.',
  'Protocolo estatal de Protección Civil activo para comunidades aledañas al coloso.',
  7,
  'Sector Paso de Cortés y Faldas del Popocatépetl',
  19.0228,
  -98.6278,
  'Atlixco',
  'revisado',
  NOW() - INTERVAL '5 hours 40 minutes',
  NOW() - INTERVAL '5 hours 40 minutes'
),
(
  '88888888-0000-0000-0000-000000000035',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777734',
  '99999999-0000-0000-0000-000000000035',
  'politico',
  'medio',
  'Acuerdos de Gobernabilidad y Diálogo Social en Tehuacán',
  'Instalación de mesa de trabajo pacífica con sectores productivos y comités ejidales.',
  'Contención anticipada de inconformidades agrarias gracias a mediación de Segob Puebla.',
  6,
  'Palacio Municipal de Tehuacán',
  18.4633,
  -97.3917,
  'Tehuacán',
  'revisado',
  NOW() - INTERVAL '11 hours 20 minutes',
  NOW() - INTERVAL '11 hours 20 minutes'
),
(
  '88888888-0000-0000-0000-000000000036',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777735',
  '99999999-0000-0000-0000-000000000036',
  'economia',
  'informativo',
  'Dinamismo Turístico y Repunte Hotelero en Pueblos Mágicos de Puebla',
  'Cifras positivas de ocupación en Atlixco, Zacatlán y Chignahuapan.',
  'Impacto favorable en empleo y reactivación de servicios en la Sierra Norte.',
  4,
  'Corredor Turístico Zacatlán - Chignahuapan',
  19.9322,
  -97.9606,
  'Zacatlán',
  'revisado',
  NOW() - INTERVAL '15 hours',
  NOW() - INTERVAL '15 hours'
),
(
  '88888888-0000-0000-0000-000000000037',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777731',
  '99999999-0000-0000-0000-000000000037',
  'proteccion_civil',
  'medio',
  'Mantenimiento y Despeje Preventivo Carretero en Sierra Norte (Huauchinango)',
  'Retiro ágil de desprendimientos menores en carretera federal México-Tuxpan.',
  'Mantenimiento preventivo que preserva conectividad intermunicipal en la sierra.',
  5,
  'Tramo Carretero Huauchinango - Xicotepec',
  20.1764,
  -98.0531,
  'Huauchinango',
  'revisado',
  NOW() - INTERVAL '18 hours',
  NOW() - INTERVAL '18 hours'
),
(
  '88888888-0000-0000-0000-000000000038',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777737',
  '99999999-0000-0000-0000-000000000038',
  'economia',
  'informativo',
  'Almacenamiento Óptimo en Presas del Sistema Necaxa y Valsequillo',
  'Reporte federal de Conagua garantiza agua de riego para Serdán y Tepeaca.',
  'Seguridad hídrica consolidada para el ciclo agropecuario del valle poblano.',
  4,
  'Presa Manuel Ávila Camacho (Valsequillo)',
  18.9167,
  -98.1833,
  'Tepeaca',
  'revisado',
  NOW() - INTERVAL '21 hours',
  NOW() - INTERVAL '21 hours'
)
ON CONFLICT (id) DO UPDATE 
SET state_id = EXCLUDED.state_id,
  source_id = EXCLUDED.source_id,
  raw_event_id = EXCLUDED.raw_event_id,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  ai_summary = EXCLUDED.ai_summary,
  category = EXCLUDED.category,
  severity = EXCLUDED.severity,
  political_relevance = EXCLUDED.political_relevance,
  location_text = EXCLUDED.location_text,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  municipio = EXCLUDED.municipio,
  status = EXCLUDED.status,
  occurred_at = EXCLUDED.occurred_at,
  created_at = EXCLUDED.created_at;

-- 5.6 Snapshot de Gabinete para Puebla
INSERT INTO cabinet_snapshots (state_id, semaforos, key_points, alert_level, created_at) VALUES (
  '21212121-2121-2121-2121-212121212121',
  '{
    "seguridad": {"nivel": "OPERACIÓN NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Blindaje logístico en México-Puebla; patrullaje metropolitano Angelópolis sin incidentes."},
    "proteccion_civil": {"nivel": "VIGILANCIA", "color": "warning", "tendencia": "estable", "mensaje": "Popocatépetl en Amarillo Fase 2; presas Valsequillo y Necaxa con 74% de almacenamiento."},
    "gobernabilidad": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Mesa de diálogo pacífica en Tehuacán; coordinación efectiva con los 217 municipios."},
    "salud": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Red de hospitales del sector salud Puebla con abasto regular y atención en 97%."},
    "finanzas": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Plan estatal de inversión en infraestructura hídrica y carreteras dentro de calendario."}
  }',
  '[
    {"id": 1, "titulo": "Operativo de Paz Metropolitano", "impacto": "Alto", "atencion": "Inmediata", "descripcion": "Vigilancia reforzada y filtros de seguridad en corredores industriales y turísticos."},
    {"id": 2, "titulo": "Inspección Logística México - Puebla", "impacto": "Alto", "atencion": "Programada", "descripcion": "Monitoreo preventivo del transporte de carga en tramo Texmelucan con Guardia Nacional."},
    {"id": 3, "titulo": "Seguimiento a Mesas de Diálogo Comunitario", "impacto": "Medio", "atencion": "Estratégica", "descripcion": "Atención directa de Segob a comités agrarios en Tehuacán y Serdán."}
  ]',
  'NORMAL',
  NOW()
) ON CONFLICT DO NOTHING;

SELECT '✅ Base de datos de Puebla inicializada y sembrada con éxito.' AS resultado;
