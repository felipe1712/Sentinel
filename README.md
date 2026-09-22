# 🛡️ SentinelIQ · Plataforma de Inteligencia Situacional & WebGIS Territorial

Plataforma multi-estado de monitoreo estratégico, inteligencia en tiempo real, cartografía político-electoral (INE) y analítica territorial para toma de decisiones a nivel gubernamental.

---

## 🏛️ Entidades Federativas Soportadas

| Estado | Subdominio | Código INEGI | Puerto Local | Jurisdicción |
|---|---|:---:|:---:|---|
| **Querétaro** | `qro.sentineliq.com.mx` | `22` | `:3004` (Web) / `:8085` (API) | 18 Municipios |
| **Guanajuato** | `gto.sentineliq.com.mx` | `11` | `:3005` (Web) / `:8086` (API) | 46 Municipios |
| **Puebla** | `pue.sentineliq.com.mx` | `21` | `:3006` (Web) / `:8087` (API) | 217 Municipios |
| **Chihuahua** | `chi.sentineliq.com.mx` | `08` | `:3007` (Web) / `:8089` (API) | 67 Municipios |

> [!NOTE]
> La instancia de **Puebla (`pue.sentineliq.com.mx`)** está configurada en **modo demostración institucional público** (acceso directo sin requerir credenciales y con módulos administrativos bloqueados para protección del entorno).

---

## 🏗️ Arquitectura del Sistema

El ecosistema opera mediante una arquitectura de microservicios contenerizados:

1. **Frontend (`nextjs-app`):** Next.js 15 (App Router), React 19, Leaflet, ApexCharts, Tailwind CSS 4.
2. **Backend API (`rust-api`):** Motor de alto rendimiento en Rust con Axum 0.7, Tokio, SQLx, geo/geojson, autenticación JWT y roles institucionales.
3. **Base de Datos Espacial:** PostgreSQL 15 + PostGIS 3.3 para procesamiento y consulta geográfica de secciones electorales y municipios.
4. **Caché y Mensajería:** Redis 7 para colas de trabajo y persistencia en memoria.
5. **Vector Database:** Qdrant (v1.7.4) para indexación semántica y recuperación aumentada (RAG).
6. **OSINT Gateway & Workers (`argos-gateway` & `workers`):**
   - Conectores para canales de Telegram y monitoreo de redes en X (Twitter).
   - Ingestores automatizados de cartografía Shapefiles del INE (EPSG:32614 a EPSG:4326).
   - Generación de Briefings Matutinos ejecutivos asistidos por IA (Anthropic Claude API).
   - Auditoría de ciberseguridad con SpiderFoot.

---

## 🗺️ Módulos Principales de la Plataforma

* **Situación Ejecutiva (`/situacion`):** Monitor situacional con mapa interactivo en tiempo real y categorización de eventos (seguridad, protección civil, vialidad, gobernabilidad).
* **WebGIS Electoral (`/gis-electoral`):** Visualizador de secciones electorales, distritos locales/federales, municipios y resultados históricos con mapas coropléticos.
* **Vista Gobernador (`/situacion/ejecutiva`):** Dashboard condensado de alta prioridad para titulares de despacho ejecutivo.
* **Briefing Matutino (`/briefing`):** Reporte diario consolidado de incidencias y análisis de tendencias.
* **Dossiers Estratégicos (`/dossiers`):** Expedientes e información de seguimiento institucional.
* **Narrativas & Trends (`/narrativas`):** Detección de tendencias mediáticas y análisis de sentimiento.
* **Territorio Municipal (`/municipios`):** Indicadores y semáforos por demarcación municipal.
* **Perfiles & Watchlist (`/perfiles`):** Fichas biográficas y mapeo de actores clave.
* **Sala de Gabinete (`/gabinete`):** Modo de visualización panorámica optimizado para proyectores en mesas de seguridad.
* **Fuentes & Monitoreo (`/fuentes`):** Centro de control de feeds RSS, canales de Telegram y monitores de redes sociales.

---

## 🚀 Despliegue en Producción (Docker)

Cada entidad cuenta con su archivo de composición dedicado:

```bash
# Despliegue Puebla
docker compose -f docker-compose.pue.yml up -d --build

# Despliegue Chihuahua
docker compose -f docker-compose.chi.yml up -d --build

# Despliegue Guanajuato
docker compose -f docker-compose.gto.yml up -d --build

# Despliegue Querétaro
docker compose -f docker-compose.prod.yml up -d --build
```
