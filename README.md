# UrbanWatch — Sistema de Inteligencia de Seguridad Urbana para CDMX

**Dominio**: `uw.sentineliq.com.mx`  
**Unidad Geográfica**: Colonia (`~1,812 colonias CDMX` con polígonos INEGI/PostGIS)  
**Plantilla Visual**: Trezo Dark Executive (CronosOne) + paleta `#0d0d0d` y naranja `#FF6B35` (Tipografía `Inter`)

## Arquitectura del Sistema (R1–R7)

- **Frontend (`frontend/`)**: React 18 + TypeScript + Bootstrap 5 + Vite (`:3100`) replicando el diseño ejecutivo Trezo de CronosOne, con MapLibre GL JS + `deck.gl` (`HeatmapLayer`), `TimeSlider` histórico (`2016–hoy`) y grafo de redes criminales `Cytoscape.js`.
- **Backend API (`backend/`)**: Rust (`Axum 0.7` + `SQLx` + `PostGIS`) en `:8100`.
- **Workers (`workers/`)**: Python 3.11 (`FastAPI` + `Celery 5` + `Redis 7` + `Surya OCR` + `Claude Sonnet 4.6` + `Lightpanda CDP` + `HeadlessX Camoufox` + `PixelRAG` + `WorldMonitor MCP`) en `:8001`.
- **Base de Datos (`migrations/`)**: PostgreSQL 15 + PostGIS (`uwi_colonias`, `uwi_sources`, `uwi_documents`, `uwi_incidentes`, `uwi_actores`, `uwi_emedios_jobs`, `uwi_emedios_articulos`, `uwi_sitios_mira`, `uwi_capturas`, `uwi_resumenes`, `uwi_audit`).

## Reglas Operativas Implementadas

1. **R1 (Stack separado)**: Frontend en Vite + React 18 + TypeScript + Bootstrap 5; API en Rust Axum + Workers Python.
2. **R2 (Selección de motor de navegador)**:
   - `lightpanda` (`ws://localhost:9222`) para E-Medios y prensa abierta (~120MB RAM) con fallback automático a Playwright.
   - `headlessx` (`http://localhost:38473` Camoufox C++ anti-fingerprint + Tor proxy) para `.onion`, foros clandestinos y sitios con Cloudflare.
3. **R3 (`fecha_incidente` separada de `created_at`)**: Todas las consultas analíticas, heatmaps y el Time Slider filtran exclusivamente por `fecha_incidente`.
4. **R4 (Niveles de confidencialidad Claude-OSINT)**: `publico`, `sensible`, `reservado` controlados por rol (`analista`, `jefe_operaciones`, `secretario`, `superadmin`).
5. **R5 (Modo de ingesta Histórico vs Operativo)**: Toggle prominente en carga manual; `modo_operativo` valida `hoy ± 7 días` y `modo_historico` permite `2016–hoy`.
6. **R6 (Deduplicación E-Medios)**: `SHA-256(titulo.lower().strip() + "|" + fecha_pub)` con `ON CONFLICT (hash_titulo) DO NOTHING`.
7. **R7 (Auditoría Claude)**: Toda clasificación o resumen registra en `uwi_audit` fuentes, tokens usados y porcentaje de confianza.
