-- =============================================================================
-- MIGRACIÓN POSTGIS: MÓDULO DE ANÁLISIS POLÍTICO-ELECTORAL (gis-electoral)
-- =============================================================================

-- 1. Habilitar extensiones PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Capa base de geometrías electorales (Secciones, Municipios, Distritos)
CREATE TABLE IF NOT EXISTS electoral_geometries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID NOT NULL,
    geo_type VARCHAR(30) NOT NULL, -- 'seccion', 'municipio', 'distrito_local', 'distrito_federal'
    clave_entidad INT NOT NULL DEFAULT 11,
    clave_municipio INT NOT NULL,
    nombre_municipio VARCHAR(100),
    distrito_local INT,
    distrito_federal INT,
    clave_seccion INT, -- Null para municipios/distritos
    tipo_seccion VARCHAR(20), -- 'Urbana', 'Rural', 'Mixta'
    area_km2 NUMERIC(10, 4),
    properties JSONB DEFAULT '{}'::jsonb,
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_electoral_geom ON electoral_geometries USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_electoral_seccion ON electoral_geometries(clave_seccion);
CREATE INDEX IF NOT EXISTS idx_electoral_mpio ON electoral_geometries(clave_municipio);
CREATE INDEX IF NOT EXISTS idx_electoral_dtto_l ON electoral_geometries(distrito_local);
CREATE INDEX IF NOT EXISTS idx_electoral_dtto_f ON electoral_geometries(distrito_federal);
CREATE INDEX IF NOT EXISTS idx_electoral_state_type ON electoral_geometries(state_id, geo_type);

-- 3. Resultados Electorales Históricos Relacionales
CREATE TABLE IF NOT EXISTS electoral_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID NOT NULL,
    election_year INT NOT NULL, -- 2018, 2021, 2024, etc.
    election_type VARCHAR(50) NOT NULL, -- 'Gobernador', 'Alcaldia', 'Diputado_Local', 'Diputado_Federal', 'Presidencia'
    clave_seccion INT NOT NULL,
    clave_municipio INT NOT NULL,
    lista_nominal INT DEFAULT 0,
    total_votos INT DEFAULT 0,
    participacion_pct NUMERIC(6, 2) DEFAULT 0.0,
    ganador_partido VARCHAR(50), -- 'PAN', 'MORENA', 'PRI', 'MC', 'PVEM', etc.
    ganador_votos INT DEFAULT 0,
    ganador_pct NUMERIC(6, 2) DEFAULT 0.0,
    segundo_partido VARCHAR(50),
    segundo_votos INT DEFAULT 0,
    segundo_pct NUMERIC(6, 2) DEFAULT 0.0,
    margen_victoria_pct NUMERIC(6, 2) DEFAULT 0.0,
    votos_partidos JSONB NOT NULL DEFAULT '{}'::jsonb, -- {"PAN": 540, "MORENA": 420, ...}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_result_seccion_year_type UNIQUE (state_id, election_year, election_type, clave_seccion)
);

CREATE INDEX IF NOT EXISTS idx_results_seccion ON electoral_results(clave_seccion);
CREATE INDEX IF NOT EXISTS idx_results_year_type ON electoral_results(election_year, election_type);
CREATE INDEX IF NOT EXISTS idx_results_ganador ON electoral_results(ganador_partido);
CREATE INDEX IF NOT EXISTS idx_results_mpio ON electoral_results(clave_municipio);

-- 4. Capas de Información y Eventos en Tiempo Real
CREATE TABLE IF NOT EXISTS gis_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID NOT NULL,
    layer_type VARCHAR(50) NOT NULL, -- 'seguridad', 'proteccion_civil', 'vialidad', 'agenda_politica'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'medio', -- 'critico', 'alto', 'medio', 'bajo', 'informativo'
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    clave_seccion INT, -- Vinculación automática espacial o manual
    clave_municipio INT,
    geom GEOMETRY(Point, 4326),
    source VARCHAR(50) DEFAULT 'manual_csv', -- 'argos', 'c4', 'manual_csv', 'webhook'
    metadata JSONB DEFAULT '{}'::jsonb,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gis_events_geom ON gis_events USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_gis_events_layer ON gis_events(layer_type, is_active);
CREATE INDEX IF NOT EXISTS idx_gis_events_seccion ON gis_events(clave_seccion);
CREATE INDEX IF NOT EXISTS idx_gis_events_state ON gis_events(state_id);
