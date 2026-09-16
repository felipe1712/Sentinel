-- Migration: Event Deduplication, Common Source Types and Territorial Normalization
-- Added on 2026-09-16 for GDELT and Data365 Integration

-- 1. Agregar campos de deduplicación y rastreo original a la tabla events
ALTER TABLE events ADD COLUMN IF NOT EXISTS dedup_hash VARCHAR(64);
ALTER TABLE events ADD COLUMN IF NOT EXISTS original_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS ingested_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Índice único para garantizar idempotencia por hash (evita insertar el mismo evento dos veces)
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_dedup_hash ON events(dedup_hash) WHERE dedup_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_municipio_occurred ON events(state_id, municipio, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_ingested_at ON events(ingested_at DESC);

-- 3. Ampliar el check constraint de tipos de fuente para incluir GDELT y Data365
ALTER TABLE sources DROP CONSTRAINT IF EXISTS sources_type_check;
ALTER TABLE sources ADD CONSTRAINT sources_type_check CHECK (
  type IN ('telegram', 'rss', 'api_federal', 'social', 'webhook', 'gdelt', 'news_feed', 'data365_twitter', 'data365_facebook', 'data365_instagram', 'data365', 'oficial')
);

-- 4. Permitir categorías ampliadas para eventos de vialidad y clima si aplica
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_category_check;
ALTER TABLE events ADD CONSTRAINT events_category_check CHECK (
  category IN ('seguridad', 'proteccion_civil', 'salud', 'politico', 'social', 'economia', 'ciberseguridad', 'vialidad', 'clima', 'medio_ambiente')
);
