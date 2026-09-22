-- ==============================================================================
-- SentinelIQ: INICIALIZACIÓN COMPLETA PARA CHIHUAHUA (Esquemas + Migraciones + Seed)
-- Base de Datos: sentineliq_chi (Puerto 5436)
-- Clave INEGI: 08 · UUID Estado: 08080808-0808-0808-0808-080808080808
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
  color_primario VARCHAR(7) DEFAULT '#0055B8',
  nombre_dependencia VARCHAR(200),
  timezone VARCHAR(50) DEFAULT 'America/Chihuahua',
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
  type VARCHAR(30) NOT NULL CHECK (type IN ('telegram','rss','api_federal','social','webhook','gdelt','data365_twitter','data365','twitter')),
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
    clave_entidad INT NOT NULL DEFAULT 8,
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
CREATE INDEX IF NOT EXISTS idx_electoral_geom_chi ON electoral_geometries USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_electoral_seccion_chi ON electoral_geometries(clave_seccion);
CREATE INDEX IF NOT EXISTS idx_electoral_mpio_chi ON electoral_geometries(clave_municipio);
CREATE INDEX IF NOT EXISTS idx_electoral_state_type_chi ON electoral_geometries(state_id, geo_type);

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
    CONSTRAINT uq_result_seccion_year_type_chi UNIQUE (state_id, election_year, election_type, clave_seccion)
);
CREATE INDEX IF NOT EXISTS idx_results_seccion_chi ON electoral_results(clave_seccion);
CREATE INDEX IF NOT EXISTS idx_results_year_type_chi ON electoral_results(election_year, election_type);

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
CREATE INDEX IF NOT EXISTS idx_gis_events_geom_chi ON gis_events USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_gis_events_layer_chi ON gis_events(layer_type, is_active);

-- ==============================================================================
-- 5. SEED DATA PARA CHIHUAHUA (Clave INEGI 08)
-- ==============================================================================

-- 5.1 Registro del Estado
INSERT INTO states (id, name, clave_inegi, polygon, buffer_km, color_primario, nombre_dependencia, timezone, config)
VALUES (
  '08080808-0808-0808-0808-080808080808',
  'Estado Libre y Soberano de Chihuahua',
  '08',
  '{"type": "Polygon", "coordinates": [[[-109.07, 25.56], [-103.30, 25.56], [-103.30, 31.78], [-109.07, 31.78], [-109.07, 25.56]]]}',
  25,
  '#0055B8',
  'Oficina de la Gobernadora Constitucional del Estado de Chihuahua',
  'America/Chihuahua',
  '{"short_name": "Chihuahua", "total_municipios": 67, "platform_subdomain": "chi.sentineliq.com.mx"}'
) ON CONFLICT (clave_inegi) DO UPDATE SET
  name = EXCLUDED.name,
  polygon = EXCLUDED.polygon,
  color_primario = EXCLUDED.color_primario,
  nombre_dependencia = EXCLUDED.nombre_dependencia,
  config = EXCLUDED.config;

-- 5.2 Usuarios Iniciales (Password default: 'sentineliq2026')
INSERT INTO users (id, state_id, email, hashed_pwd, role, name, cargo) VALUES
(
  '08080808-0000-0000-0000-000000000001',
  '08080808-0808-0808-0808-080808080808',
  'admin@sentineliq.com.mx',
  '$2b$12$e8x6s.eYmGkM.OQjL7eO8.k5sD7I8K5d7M3O9Q1S3U5W7Y9a1c3e5',
  'superadmin',
  'Superadministrador Global',
  'Director de Inteligencia y Tecnología'
),
(
  '08080808-0000-0000-0000-000000000002',
  '08080808-0808-0808-0808-080808080808',
  'gobernadora@chihuahua.gob.mx',
  '$2b$12$e8x6s.eYmGkM.OQjL7eO8.k5sD7I8K5d7M3O9Q1S3U5W7Y9a1c3e5',
  'gobernador',
  'María Eugenia Campos Galván',
  'Gobernadora Constitucional del Estado'
),
(
  '08080808-0000-0000-0000-000000000003',
  '08080808-0808-0808-0808-080808080808',
  'seguridad@chihuahua.gob.mx',
  '$2b$12$e8x6s.eYmGkM.OQjL7eO8.k5sD7I8K5d7M3O9Q1S3U5W7Y9a1c3e5',
  'jefe_oficina',
  'Secretario de Seguridad Pública del Estado',
  'Titular de la SSPE Chihuahua'
),
(
  '08080808-0000-0000-0000-000000000004',
  '08080808-0808-0808-0808-080808080808',
  'analista@chihuahua.gob.mx',
  '$2b$12$e8x6s.eYmGkM.OQjL7eO8.k5sD7I8K5d7M3O9Q1S3U5W7Y9a1c3e5',
  'analista',
  'Analista de Inteligencia Territorial',
  'Mesa de Análisis Estratégico Chihuahua'
),
(
  '08080808-0000-0000-0000-000000000005',
  '08080808-0808-0808-0808-080808080808',
  'demo@chihuahua.gob.mx',
  '$2b$12$e8x6s.eYmGkM.OQjL7eO8.k5sD7I8K5d7M3O9Q1S3U5W7Y9a1c3e5',
  'asesor',
  'Invitado Demo Chihuahua',
  'Demostración Institucional / Gabinete'
)
ON CONFLICT (email) DO NOTHING;

-- 5.3 Fuentes de Información OSINT y Oficiales
INSERT INTO sources (id, state_id, type, identifier, name, credibility, active) VALUES
('08080808-7777-7777-7777-000000000001', '08080808-0808-0808-0808-080808080808', 'social', '@SSPE_Chihuahua', 'Secretaría de Seguridad Pública del Estado (SSPE)', 'oficial', true),
('08080808-7777-7777-7777-000000000002', '08080808-0808-0808-0808-080808080808', 'social', '@FGE_Chihuahua', 'Fiscalía General del Estado de Chihuahua', 'oficial', true),
('08080808-7777-7777-7777-000000000003', '08080808-0808-0808-0808-080808080808', 'social', '@PC_Chihuahua', 'Coordinación Estatal de Protección Civil Chihuahua', 'oficial', true),
('08080808-7777-7777-7777-000000000004', '08080808-0808-0808-0808-080808080808', 'social', '@ElHeraldoChih', 'El Heraldo de Chihuahua', 'verificado', true),
('08080808-7777-7777-7777-000000000005', '08080808-0808-0808-0808-080808080808', 'social', '@DiarioJuarez', 'El Diario de Juárez', 'verificado', true),
('08080808-7777-7777-7777-000000000006', '08080808-0808-0808-0808-080808080808', 'social', '@PuenteLibre', 'Puente Libre MX - Información Digital', 'verificado', true),
('08080808-7777-7777-7777-000000000007', '08080808-0808-0808-0808-080808080808', 'gdelt', '@gdelt_prensa_chi', 'GDELT 2.0 Prensa y Monitoreo Chihuahua', 'verificado', true),
('08080808-7777-7777-7777-000000000008', '08080808-0808-0808-0808-080808080808', 'data365_twitter', '@data365_twitter_chi', 'Data365 Redes Sociales Chihuahua', 'verificado', true)
ON CONFLICT (id) DO NOTHING;

-- 5.4 Eventos Iniciales Demostrativos (Situación Territorial en Vivo)
INSERT INTO events (
  id, state_id, source_id, category, severity, title, summary, ai_summary,
  political_relevance, location_text, lat, lng, municipio, status, occurred_at, created_at
) VALUES
(
  '08080808-8888-8888-8888-000000000001',
  '08080808-0808-0808-0808-080808080808',
  '08080808-7777-7777-7777-000000000001',
  'seguridad',
  'medio',
  'Operativo Fronterizo y Vigilancia Tecnológica en Ciudad Juárez',
  'Despliegue coordinado entre SSPE, Guardia Nacional y corporaciones municipales en accesos a puentes internacionales.',
  'Tránsito continuo y vigilancia preventiva activa en corredor fronterizo con tecnología Centinela.',
  8,
  'Puente Internacional Zaragoza / Boulevard Cuatro Siglos',
  31.7000,
  -106.3800,
  'Juárez',
  'revisado',
  NOW() - INTERVAL '45 minutes',
  NOW() - INTERVAL '45 minutes'
),
(
  '08080808-8888-8888-8888-000000000002',
  '08080808-0808-0808-0808-080808080808',
  '08080808-7777-7777-7777-000000000001',
  'seguridad',
  'bajo',
  'Patrullaje Preventivo y Monitoreo C7-IA en Chihuahua Capital',
  'Recorridos de seguridad y agilidad vial en Periférico de la Juventud y accesos industriales.',
  'Flujo regular supervisado con monitoreo por cámaras y cero bloqueos viales.',
  6,
  'Periférico de la Juventud y Av. Cantera',
  28.6400,
  -106.1200,
  'Chihuahua',
  'revisado',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
),
(
  '08080808-8888-8888-8888-000000000003',
  '08080808-0808-0808-0808-080808080808',
  '08080808-7777-7777-7777-000000000003',
  'proteccion_civil',
  'medio',
  'Monitoreo Hídrico y Niveles de Seguridad en Cuenca del Conchos',
  'Coordinación de Protección Civil y Conagua supervisando presas La Boquilla y Las Vírgenes.',
  'Gestión hídrica regular con supervisión de compuertas y abasto garantizado para distritos de riego.',
  7,
  'Presa La Boquilla / San Francisco de Conchos',
  27.5300,
  -105.4100,
  'Delicias',
  'revisado',
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '4 hours'
),
(
  '08080808-8888-8888-8888-000000000004',
  '08080808-0808-0808-0808-080808080808',
  '08080808-7777-7777-7777-000000000003',
  'proteccion_civil',
  'informativo',
  'Operativo de Auxilio Turístico y Vial en Sierra Tarahumara (Creel - Guachochi)',
  'Recorridos preventivos de auxilio vial y monitoreo de temperaturas en tramos serranos.',
  'Condiciones viales óptimas para traslado de visitantes y residentes locales.',
  5,
  'Carretera Creel - Guachochi / Cañón del Cobre',
  27.7500,
  -107.6300,
  'Guachochi',
  'revisado',
  NOW() - INTERVAL '7 hours',
  NOW() - INTERVAL '7 hours'
),
(
  '08080808-8888-8888-8888-000000000005',
  '08080808-0808-0808-0808-080808080808',
  '08080808-7777-7777-7777-000000000004',
  'economia',
  'informativo',
  'Atracción de Inversión y Fortalecimiento Logístico en Corredor Cuauhtémoc',
  'Reunión de cámaras empresariales y agroindustriales sobre exportación y manufactura especializada.',
  'Perspectiva favorable de inversión privada y generación de empleo en la zona centro-oeste.',
  6,
  'Parque Industrial Cuauhtémoc',
  28.4000,
  -106.8600,
  'Cuauhtémoc',
  'revisado',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '12 hours'
)
ON CONFLICT (id) DO UPDATE SET
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

-- 5.5 Snapshot de Gabinete para Chihuahua
INSERT INTO cabinet_snapshots (state_id, semaforos, key_points, alert_level, created_at) VALUES (
  '08080808-0808-0808-0808-080808080808',
  '{
    "seguridad": {"nivel": "OPERACIÓN CONTINUA", "color": "success", "tendencia": "estable", "mensaje": "Despliegue Centinela en Juárez y Chihuahua Capital sin bloqueos; coordinación plena con SEDENA y GN."},
    "proteccion_civil": {"nivel": "VIGILANCIA", "color": "warning", "tendencia": "estable", "mensaje": "Monitoreo permanente de presas en cuenca del Conchos y operativo invernal en Sierra Tarahumara."},
    "gobernabilidad": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Estabilidad institucional y diálogo permanente con los 67 presidentes municipales."},
    "salud": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Red hospitalaria estatal y centros de salud regionales con abastecimiento del 96%."},
    "finanzas": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Disciplina financiera y captación fiscal alineada con las metas presupuestales 2026."}
  }',
  '[
    {"id": 1, "titulo": "Operativo Fronterizo & Blindaje Tecnológico", "impacto": "Alto", "atencion": "Inmediata", "descripcion": "Vigilancia tecnológica en accesos fronterizos e industriales de Ciudad Juárez."},
    {"id": 2, "titulo": "Seguimiento al Plan Hídrico Conchos - Delicias", "impacto": "Alto", "atencion": "Programada", "descripcion": "Mesas de concertación técnica con módulos de riego y autoridades federales de CONAGUA."},
    {"id": 3, "titulo": "Operativo de Paz y Cobertura Sierra Tarahumara", "impacto": "Medio", "atencion": "Estratégica", "descripcion": "Presencia preventiva de SSPE en Bocoyna, Guachochi, Balleza y Guadalupe y Calvo."}
  ]',
  'NORMAL',
  NOW()
) ON CONFLICT DO NOTHING;

SELECT '✅ Base de datos de Chihuahua (sentineliq_chi) inicializada y sembrada con éxito.' AS resultado;
