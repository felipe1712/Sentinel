-- Habilitar extensión PostGIS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Estados
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

-- Usuarios
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

-- Fuentes de inteligencia
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('telegram','rss','api_federal','social','webhook')),
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

-- Canales de Telegram
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

-- Eventos crudos
CREATE TABLE IF NOT EXISTS raw_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  raw_text TEXT,
  raw_data JSONB,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos procesados
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

-- Narrativas
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

-- Perfiles monitoreados
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

-- Menciones de perfiles en eventos
CREATE TABLE IF NOT EXISTS profile_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  context TEXT NOT NULL,
  sentiment VARCHAR(10) DEFAULT 'neutro' CHECK (sentiment IN ('positivo','neutro','negativo')),
  confidence DOUBLE PRECISION DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlist activa
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Briefings matutinos
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

-- Dossiers ejecutivos
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

-- Vista de gabinete (snapshot)
CREATE TABLE IF NOT EXISTS cabinet_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  semaforos JSONB NOT NULL,
  key_points JSONB NOT NULL,
  alert_level VARCHAR(15) DEFAULT 'NORMAL' CHECK (alert_level IN ('NORMAL','VIGILANCIA','ALERTA','EMERGENCIA')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registros de IP
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

-- Reportes PDF
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('diario','semanal','incidente','ejecutivo','ciberseguridad')),
  period VARCHAR(100),
  pdf_url VARCHAR(500),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_to TEXT[] DEFAULT '{}'
);

-- Scans de SpiderFoot
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
