-- =============================================================================
-- UrbanWatch (uw.sentineliq.com.mx) — Esquema Principal de Base de Datos v1.0
-- Radiografía de seguridad urbana a nivel colonia para la Ciudad de México
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Colonias de CDMX con polígonos INEGI / IECM
CREATE TABLE IF NOT EXISTS uwi_colonias (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cve_colonia      VARCHAR(20) UNIQUE NOT NULL,
  nombre           VARCHAR(200) NOT NULL,
  alcaldia         VARCHAR(100) NOT NULL,
  cve_alcaldia     VARCHAR(10) NOT NULL,
  polygon          JSONB NOT NULL,
  centroid_lat     DOUBLE PRECISION,
  centroid_lng     DOUBLE PRECISION,
  geom             GEOMETRY(GEOMETRY, 4326),
  poblacion        INTEGER DEFAULT 0,
  nivel_riesgo     VARCHAR(10) DEFAULT 'bajo'
    CHECK (nivel_riesgo IN ('bajo','medio','alto','critico')),
  riesgo_updated   TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_uwi_colonias_geom ON uwi_colonias USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_uwi_colonias_alcaldia ON uwi_colonias(alcaldia);
CREATE INDEX IF NOT EXISTS idx_uwi_colonias_riesgo ON uwi_colonias(nivel_riesgo);

-- 2. Fuentes de información registradas (R2: motor según fuente, R4: nivel_conf)
CREATE TABLE IF NOT EXISTS uwi_sources (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           VARCHAR(200) NOT NULL,
  tipo             VARCHAR(20) NOT NULL
    CHECK (tipo IN ('emedios','telegram','darkweb','osint',
                    'manual_word','manual_excel','oficial','social')),
  url              VARCHAR(500),
  browser_engine   VARCHAR(20) DEFAULT 'playwright'
    CHECK (browser_engine IN ('lightpanda','headlessx','playwright','none')),
  nivel_conf       VARCHAR(10) DEFAULT 'publico'
    CHECK (nivel_conf IN ('publico','sensible','reservado')),
  activo           BOOLEAN DEFAULT true,
  config           JSONB DEFAULT '{}',
  last_checked     TIMESTAMPTZ,
  error_count      INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Documentos subidos o descargados (R5: modo_ingesta historico vs operativo)
CREATE TABLE IF NOT EXISTS uwi_documents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id        UUID REFERENCES uwi_sources(id) ON DELETE SET NULL,
  titulo           VARCHAR(500),
  file_path        VARCHAR(1000),
  file_type        VARCHAR(20),
  fecha_publicacion DATE,
  modo_ingesta     VARCHAR(20) DEFAULT 'operativo'
    CHECK (modo_ingesta IN ('historico','operativo')),
  status           VARCHAR(20) DEFAULT 'pendiente'
    CHECK (status IN ('pendiente','procesando','listo','error')),
  ocr_text         TEXT,
  error_msg        TEXT,
  uploaded_by      UUID,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Incidentes de seguridad — unidad central (R3: fecha_incidente != created_at)
CREATE TABLE IF NOT EXISTS uwi_incidentes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colonia_id       UUID REFERENCES uwi_colonias(id) ON DELETE SET NULL,
  alcaldia         VARCHAR(100) NOT NULL,
  tipo_incidente   VARCHAR(50) NOT NULL
    CHECK (tipo_incidente IN (
      'homicidio','feminicidio','secuestro','extorsion',
      'robo_vehiculo','robo_transeunte','robo_negocio',
      'narcomenudeo','presencia_criminal','amenaza',
      'desaparicion','violencia_familiar','otro'
    )),
  subtipo          VARCHAR(100),
  fuente_tipo      VARCHAR(20) NOT NULL,
  fuente_id        UUID REFERENCES uwi_sources(id) ON DELETE SET NULL,
  fuente_nombre    VARCHAR(200),
  document_id      UUID REFERENCES uwi_documents(id) ON DELETE SET NULL,
  titulo           VARCHAR(500),
  descripcion      TEXT,
  fecha_incidente  DATE NOT NULL,
  hora_incidente   TIME,
  lat              DOUBLE PRECISION,
  lng              DOUBLE PRECISION,
  geom             GEOMETRY(POINT, 4326),
  ubicacion_texto  VARCHAR(300),
  nivel_conf       VARCHAR(10) DEFAULT 'publico'
    CHECK (nivel_conf IN ('publico','sensible','reservado')),
  severidad        INTEGER DEFAULT 5 CHECK (severidad BETWEEN 1 AND 10),
  verificado       BOOLEAN DEFAULT false,
  actores          TEXT[] DEFAULT '{}',
  victimas_count   INTEGER DEFAULT 0,
  raw_data         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_uwi_inc_colonia_fecha ON uwi_incidentes(colonia_id, fecha_incidente DESC);
CREATE INDEX IF NOT EXISTS idx_uwi_inc_tipo_fecha    ON uwi_incidentes(tipo_incidente, fecha_incidente DESC);
CREATE INDEX IF NOT EXISTS idx_uwi_inc_fecha         ON uwi_incidentes(fecha_incidente DESC);
CREATE INDEX IF NOT EXISTS idx_uwi_inc_geom          ON uwi_incidentes USING GIST(geom)
  WHERE geom IS NOT NULL;

-- Trigger para mantener geom sincronizado con lat/lng y heredar nivel_conf de uwi_sources (R4)
CREATE OR REPLACE FUNCTION uwi_incidente_geom_sync()
RETURNS TRIGGER AS $$
DECLARE
  src_conf VARCHAR(10);
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  END IF;
  IF NEW.fuente_id IS NOT NULL AND (NEW.nivel_conf IS NULL OR NEW.nivel_conf = '') THEN
    SELECT nivel_conf INTO src_conf FROM uwi_sources WHERE id = NEW.fuente_id;
    IF src_conf IS NOT NULL THEN
      NEW.nivel_conf := src_conf;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_uwi_incidente_geom ON uwi_incidentes;
CREATE TRIGGER trg_uwi_incidente_geom
BEFORE INSERT OR UPDATE ON uwi_incidentes
FOR EACH ROW EXECUTE FUNCTION uwi_incidente_geom_sync();

-- 5. Actores criminales (Grafo Cytoscape.js)
CREATE TABLE IF NOT EXISTS uwi_actores (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           VARCHAR(200) NOT NULL UNIQUE,
  aliases          TEXT[] DEFAULT '{}',
  tipo             VARCHAR(30)
    CHECK (tipo IN ('cartel','banda_local','celula','persona','desconocido')),
  colonias_activas UUID[] DEFAULT '{}',
  nivel_amenaza    INTEGER DEFAULT 5 CHECK (nivel_amenaza BETWEEN 1 AND 10),
  descripcion      TEXT,
  fuente_primera   VARCHAR(200),
  activo           BOOLEAN DEFAULT true,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Jobs del scraper E-Medios (R2: Lightpanda + Playwright fallback)
CREATE TABLE IF NOT EXISTS uwi_emedios_jobs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_inicio     DATE NOT NULL,
  fecha_fin        DATE NOT NULL,
  terminos         TEXT[] NOT NULL,
  publicaciones    TEXT[] DEFAULT '{}',
  articulos_total  INTEGER DEFAULT 0,
  articulos_proc   INTEGER DEFAULT 0,
  articulos_ok     INTEGER DEFAULT 0,
  articulos_error  INTEGER DEFAULT 0,
  checkpoint       JSONB DEFAULT '{}',
  status           VARCHAR(20) DEFAULT 'pendiente'
    CHECK (status IN ('pendiente','corriendo','pausado','completo','error')),
  modo_ingesta     VARCHAR(20) DEFAULT 'operativo'
    CHECK (modo_ingesta IN ('historico','operativo')),
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Artículos de E-Medios procesados (R6: Deduplicación obligatoria por hash_titulo)
CREATE TABLE IF NOT EXISTS uwi_emedios_articulos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id           UUID REFERENCES uwi_emedios_jobs(id) ON DELETE CASCADE,
  emedio_id        VARCHAR(100),
  titulo           VARCHAR(500),
  publicacion      VARCHAR(200),
  fecha_pub        DATE,
  url_original     VARCHAR(1000),
  contenido_raw    TEXT,
  hash_titulo      VARCHAR(64) UNIQUE NOT NULL,
  procesado        BOOLEAN DEFAULT false,
  incidente_id     UUID REFERENCES uwi_incidentes(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_uwi_art_hash      ON uwi_emedios_articulos(hash_titulo);
CREATE INDEX IF NOT EXISTS idx_uwi_art_procesado ON uwi_emedios_articulos(procesado, created_at);

-- 8. Sitios en la mira (Módulo Vigía — HeadlessX Camoufox)
CREATE TABLE IF NOT EXISTS uwi_sitios_mira (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url              VARCHAR(500) NOT NULL,
  tipo             VARCHAR(20)
    CHECK (tipo IN ('onion','foro','marketplace','surface','social')),
  nombre           VARCHAR(200),
  descripcion      TEXT,
  keywords         TEXT[] DEFAULT '{}',
  browser_engine   VARCHAR(20) DEFAULT 'headlessx',
  frecuencia_hrs   INTEGER DEFAULT 24,
  ultima_captura   TIMESTAMPTZ,
  ultimo_cambio    TIMESTAMPTZ,
  activo           BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Capturas visuales (PixelRAG — detección de cambio visual >15%)
CREATE TABLE IF NOT EXISTS uwi_capturas (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitio_id         UUID REFERENCES uwi_sitios_mira(id) ON DELETE CASCADE,
  screenshot_path  VARCHAR(1000),
  pixelrag_index   VARCHAR(200),
  contenido_texto  TEXT,
  diff_pct         DOUBLE PRECISION DEFAULT 0.0,
  cambio_detectado BOOLEAN DEFAULT false,
  cambio_descripcion TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Resúmenes ejecutivos de Claude + WorldMonitor MCP
CREATE TABLE IF NOT EXISTS uwi_resumenes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo             VARCHAR(30)
    CHECK (tipo IN ('diario','semanal','colonia','alcaldia','actor','incidente')),
  fecha_ref        DATE,
  colonia_id       UUID REFERENCES uwi_colonias(id) ON DELETE SET NULL,
  alcaldia         VARCHAR(100),
  titulo           VARCHAR(300),
  resumen          TEXT NOT NULL,
  puntos_clave     JSONB DEFAULT '[]',
  nivel_alerta     VARCHAR(10)
    CHECK (nivel_alerta IN ('normal','vigilancia','alerta','emergencia')),
  tokens_usados    INTEGER DEFAULT 0,
  fuentes_count    INTEGER DEFAULT 0,
  worldmonitor_data JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Audit log (R7: trazabilidad obligatoria con fuentes, tokens y confianza)
CREATE TABLE IF NOT EXISTS uwi_audit (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID,
  accion              VARCHAR(100) NOT NULL,
  recurso             VARCHAR(200),
  ip_addr             INET,
  nivel_conf_accedido VARCHAR(10),
  fuentes_json        JSONB DEFAULT '[]',
  tokens_usados       INTEGER DEFAULT 0,
  confianza_pct       INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_uwi_audit_fecha ON uwi_audit(created_at DESC);

-- 12. Tabla temporal para previews de carga manual antes de confirmar inserción
CREATE TABLE IF NOT EXISTS uwi_upload_previews (
  token            VARCHAR(64) PRIMARY KEY,
  document_id      UUID REFERENCES uwi_documents(id) ON DELETE CASCADE,
  modo_ingesta     VARCHAR(20) NOT NULL,
  fecha_manual     DATE,
  incidentes_json  JSONB NOT NULL DEFAULT '[]',
  confirmed        BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
