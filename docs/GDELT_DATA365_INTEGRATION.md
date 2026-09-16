# Guía de Integración: GDELT 2.0 & Data365 para Monitoreo Territorial Multi-Estado (Querétaro, Guanajuato y Puebla)

Esta guía documenta la habilitación de **GDELT 2.0** (`intel_gdelt_search`, `intel_news_feed`) y la integración de **Data365** (Twitter/X, Facebook e Instagram) para la plataforma **SentinelIQ v2**, con cobertura territorial y municipal 100% enfocada en **Querétaro (18 municipios)**, **Guanajuato (46 municipios)** y **Puebla (217 municipios)**.

---

## 1. Reglas de Firewall & Red Saliente para GDELT (`api.gdeltproject.org`)

GDELT 2.0 Doc API requiere salida HTTPS directa hacia el dominio `api.gdeltproject.org` en el puerto `443`. Si el servidor Ubuntu tiene políticas restrictivas de egreso (`DEFAULT_OUTPUT_POLICY="DROP"` en UFW o iptables), aplique la siguiente regla:

### Apertura en UFW (Ubuntu Firewall)
```bash
# Permitir salida HTTPS a GDELT
sudo ufw allow out proto tcp to any port 443

# Si se restringe por FQDN/IP en iptables o proxy corporativo:
# Dominio: api.gdeltproject.org
# Puerto: 443 TCP (TLS 1.2 / 1.3)
```

### Verificación de Conectividad en el Servidor Ubuntu
```bash
# Probar resolución DNS y handshake TLS
curl -I -s --connect-timeout 5 "https://api.gdeltproject.org/api/v2/doc/doc?query=mexico&mode=artlist&format=json&maxrecords=1" | head -n 5
```

Si el comando retorna `HTTP/2 200` o `HTTP/1.1 200 OK`, la salida está lista. Si hay bloqueo o latencia excesiva, el **Circuit Breaker** de SentinelIQ pasará automáticamente a estado `OPEN` y activará el generador de contingencia territorial soberana para garantizar que la plataforma nunca se congele.

---

## 2. Verificación de Salud con Circuit Breaker (`intel status`)

El módulo `workers/mcp_client.py` incluye el patrón Circuit Breaker con auto-recuperación y telemetría:

### Ejecutar verificación de estado
```bash
cd /opt/Sentinel/workers
python3 -c "from mcp_client import intel_status; import json; print(json.dumps(intel_status(), indent=2))"
```

### Salida Esperada:
```json
{
  "mcp_server": "world-intel-mcp",
  "version": "2.4.0-sovereign",
  "overall_health": "HEALTHY",
  "tools_total": 134,
  "circuit_breakers": {
    "intel_gdelt_search": {
      "source": "GDELT_2.0_API",
      "state": "CLOSED",
      "healthy": true,
      "failure_count": 0
    },
    "intel_news_feed": {
      "source": "NEWS_FEED_API",
      "state": "CLOSED",
      "healthy": true,
      "failure_count": 0
    }
  },
  "network_requirements": {
    "gdelt_domain": "api.gdeltproject.org",
    "gdelt_port": 443,
    "status": "CONNECTED"
  }
}
```

---

## 3. Configuración de Variables de Entorno en Docker

Las credenciales y endpoints se configuran en el archivo `.env` del servidor o en los archivos Compose:

```bash
# ==============================================================================
# DATA365 & GDELT CREDENTIALS (SENTINELIQ V2)
# ==============================================================================
DATA365_API_KEY="tu_api_key_de_data365"
DATA365_BASE_URL="https://api.data365.co/v1.1"
DATA365_CALLBACK_URL="https://qro.sentineliq.com.mx/api/events/webhook/data365"
DATA365_POLL_INTERVAL_SECONDS=300

GDELT_BASE_URL="https://api.gdeltproject.org/api/v2/doc/doc"
GDELT_TIMEOUT_SECS=8.0
GDELT_POLL_INTERVAL_SECONDS=360
```

> **Nota:** Si `DATA365_API_KEY` no se define o está vacía, el cliente entra automáticamente en **Modo Demostración / Soberano Resiliente**, proveyendo publicaciones simuladas geocodificadas para los municipios de Querétaro, Guanajuato y Puebla sin lanzar errores.

---

## 4. Deduplicación e Idempotencia en Base de Datos

Para evitar eventos duplicados en reintentos o ejecuciones continuas:

1. **Migración SQL aplicada:** `rust-api/migrations/20260916000001_event_dedup_and_sources.sql`
   - Agrega columna `dedup_hash VARCHAR(64)` e índice único:
     ```sql
     CREATE UNIQUE INDEX IF NOT EXISTS idx_events_dedup_hash ON events(dedup_hash);
     ```
2. **Fórmula de Hash SHA-256:**
   ```
   SHA256(fuente + ":" + (url_original || id_nativo))
   ```
3. **Manejo en Rust API (`rust-api/src/routes/events.rs`):**
   - Al recibir una solicitud `POST /events`, si el `dedup_hash` ya existe en la base de datos, Axum retorna de inmediato el registro existente con código `200 OK` sin duplicar filas ni lanzar excepciones.

---

## 5. Auditoría Automática de Consultas (`/admin/query-audit`)

Tanto `data365_scheduler.py` como `gdelt_scheduler.py` auditan cada consulta realizada en la tabla `query_audit` de la base de datos de SentinelIQ:

- `state_id`: UUID del estado consultado (`qro`, `gto` o `pue`).
- `query_type`: `territorial_data365` o `territorial_gdelt`.
- `prompt_text`: Texto de la búsqueda territorial y municipio/corredor consultado.
- `model`: Identificador del modelo o agente despachador.
- `tools_used`: `["data365_search", "territorial_geocoder", "event_deduplicator"]`.
- `sources`: `["data365_twitter"]`, `["data365_facebook"]`, `["data365_instagram"]`, `["gdelt"]`.
- `latency_ms`: Milisegundos que tomó la consulta.
- `confidence_score`: Nivel de confianza según el circuit breaker.
- `result_summary`: Cantidad de publicaciones nuevas normalizadas vs duplicados descartados.

---

## 6. Visualización en Vistas de Querétaro, Guanajuato y Puebla

1. **Situación Ejecutiva (`/situacion`):**
   - El mapa situacional (`SituacionalMap.tsx`) renderiza los polígonos de alerta por municipio y círculos de eventos geolocalizados con coordenadas de GDELT y Data365.
   - El feed en vivo (`RealtimeLiveFeed.tsx`) incluye pestañas dedicadas para **Data365 Social** y **GDELT 2.0 Prensa**, con enlaces directos a las fuentes originales.
2. **Vista de Gobernador (`/situacion/ejecutiva`):**
   - Semáforos de paz pública actualizados en tiempo real por el volumen de incidentes en los municipios de cada entidad.
3. **Sala de Gabinete (`/gabinete`):**
   - Al hacer clic en cualquier municipio del mapa o del selector, el panel de drill-down despliega los incidentes de GDELT y Data365 asociados a esa demarcación en la línea de tiempo.
4. **Panel MCP (`/admin/mcp`):**
   - Permite probar interactivamente `intel_gdelt_search` e `intel_news_feed` observando el estado del circuit breaker y el target de red.

---

## 7. Instrucciones para Actualizar en el Servidor Ubuntu de Producción

Conéctese a su servidor Ubuntu y ejecute los siguientes comandos:

```bash
# 1. Ir a la carpeta del proyecto
cd /opt/Sentinel

# 2. Obtener los últimos cambios de la rama sentineliq-v2
git pull origin sentineliq-v2

# 3. Aplicar la migración de deduplicación en la base de datos
docker exec -i sentineliq_postgres psql -U sentinel -d sentineliq < rust-api/migrations/20260916000001_event_dedup_and_sources.sql

# Si tiene bases de datos dedicadas por estado (GTO y PUE):
docker exec -i sentineliq_gto_postgres psql -U sentineliq -d sentineliq_gto < rust-api/migrations/20260916000001_event_dedup_and_sources.sql
docker exec -i sentineliq_pue_postgres psql -U sentineliq -d sentineliq_pue < rust-api/migrations/20260916000001_event_dedup_and_sources.sql

# 4. Recompilar e iniciar contenedores con la nueva configuración
docker compose -f docker-compose.prod.yml up -d --build

# Para las instancias adicionales de GTO y PUE:
docker compose -f docker-compose.gto.yml up -d --build
docker compose -f docker-compose.pue.yml up -d --build

# 5. Verificar logs de los nuevos workers
docker logs -f sentineliq_workers --tail=50
```
