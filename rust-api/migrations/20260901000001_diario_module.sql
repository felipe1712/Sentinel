-- ==============================================================================
-- Migración: Módulo Diario (Prensa OCR + Resumen Ejecutivo + Distribución)
-- ==============================================================================

-- 1. Documentos PDF del Diario recibidos y procesados
CREATE TABLE IF NOT EXISTS diario_documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id          UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  document_type     VARCHAR(30) NOT NULL CHECK (document_type IN (
                    'primeras_planas_nacional',
                    'primeras_planas_estatal',
                    'sintesis_estatal',
                    'columnas_politicas'
                    )),
  fecha             DATE NOT NULL,
  original_filename VARCHAR(500),
  file_path         VARCHAR(1000),
  file_size_kb      INTEGER,
  page_count        INTEGER DEFAULT 0,
  status            VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN (
                    'pendiente','procesando_ocr','ocr_completo',
                    'filtrando','listo','error'
                    )),
  error_message     TEXT,
  uploaded_at       TIMESTAMPTZ DEFAULT NOW(),
  processed_at      TIMESTAMPTZ,
  UNIQUE(state_id, document_type, fecha)
);

CREATE INDEX IF NOT EXISTS idx_diario_documents_state_fecha ON diario_documents(state_id, fecha DESC);

-- 2. Texto extraído por Surya OCR por documento y página
CREATE TABLE IF NOT EXISTS diario_ocr_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES diario_documents(id) ON DELETE CASCADE,
  page_number     INTEGER NOT NULL,
  raw_text        TEXT NOT NULL,
  layout_data     JSONB,
  confidence_avg  DOUBLE PRECISION,
  processed_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diario_ocr_results_doc_page ON diario_ocr_results(document_id, page_number);

-- 3. Items de prensa filtrados y clasificados
CREATE TABLE IF NOT EXISTS diario_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES diario_documents(id) ON DELETE CASCADE,
  state_id        UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  fecha           DATE NOT NULL,
  categoria       VARCHAR(20) NOT NULL CHECK (categoria IN (
                  'politica','economia','finanzas','seguridad','gobierno'
                  )),
  ambito          VARCHAR(10) NOT NULL CHECK (ambito IN ('nacional','estatal')),
  titular         VARCHAR(1000) NOT NULL,
  cuerpo          TEXT,
  fuente_medio    VARCHAR(200),
  pagina          INTEGER,
  relevancia      INTEGER DEFAULT 5 CHECK (relevancia BETWEEN 1 AND 10),
  es_principal    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diario_items_state_fecha ON diario_items(state_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_diario_items_categoria ON diario_items(state_id, categoria, fecha DESC);

-- 4. Resúmenes ejecutivos generados por Claude vía MCP
CREATE TABLE IF NOT EXISTS diario_resumenes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id         UUID NOT NULL REFERENCES diario_documents(id) ON DELETE CASCADE,
  state_id            UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  fecha               DATE NOT NULL,
  document_type       VARCHAR(30) NOT NULL,
  resumen_ejecutivo   TEXT NOT NULL,
  puntos_clave        JSONB NOT NULL DEFAULT '[]',
  temas_seguridad     TEXT,
  temas_politica      TEXT,
  temas_economia      TEXT,
  relevancia_estatal  TEXT,
  mini_resumen        TEXT NOT NULL,
  tokens_usados       INTEGER DEFAULT 0,
  modelo              VARCHAR(100) DEFAULT 'claude-sonnet-4-6',
  generated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id)
);

CREATE INDEX IF NOT EXISTS idx_diario_resumenes_state_fecha ON diario_resumenes(state_id, fecha DESC);

-- 5. Registro de envíos (mensajería y correo)
CREATE TABLE IF NOT EXISTS diario_envios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id        UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  fecha           DATE NOT NULL,
  tipo            VARCHAR(20) NOT NULL CHECK (tipo IN ('email','telegram')),
  destinatario    VARCHAR(500) NOT NULL,
  nombre_destino  VARCHAR(200),
  documento_type  VARCHAR(30),
  resumen_id      UUID REFERENCES diario_resumenes(id),
  status          VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN ('pendiente','enviado','error')),
  error_message   TEXT,
  enviado_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diario_envios_state_fecha ON diario_envios(state_id, fecha DESC);

-- 6. Lista de distribución configurable
CREATE TABLE IF NOT EXISTS diario_lista_distribucion (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id         UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  nombre           VARCHAR(200) NOT NULL,
  email            VARCHAR(300),
  telegram_chat_id VARCHAR(100),
  recibe_email     BOOLEAN DEFAULT true,
  recibe_telegram  BOOLEAN DEFAULT false,
  document_types   TEXT[] DEFAULT '{}',
  activo           BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diario_distribucion_state ON diario_lista_distribucion(state_id, activo);
