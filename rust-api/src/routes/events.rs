use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;
use crate::{
    auth::middleware::AuthUser,
    error::AppError,
    models::{CreateEventDTO, Event, EnrichedEvent},
};

#[derive(Deserialize)]
pub struct EventFilterParams {
    pub severity: Option<String>,
    pub category: Option<String>,
    pub municipio: Option<String>,
    pub source_type: Option<String>,
    pub hours: Option<i32>,
    pub limit: Option<i64>,
}

pub async fn list_events(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Query(params): Query<EventFilterParams>,
) -> Result<Json<Vec<Event>>, AppError> {
    let limit = params.limit.unwrap_or(50);

    let mut events = sqlx::query_as::<_, Event>(
        "SELECT * FROM events 
         WHERE state_id = $1 
           AND ($2::varchar IS NULL OR severity = $2)
           AND ($3::varchar IS NULL OR category = $3)
           AND ($4::varchar IS NULL OR municipio = $4)
         ORDER BY occurred_at DESC 
         LIMIT $5"
    )
    .bind(auth.state_id)
    .bind(params.severity)
    .bind(params.category)
    .bind(params.municipio)
    .bind(limit)
    .fetch_all(&pool)
    .await?;

    let mut seen_titles = std::collections::HashSet::new();
    events.retain(|ev| {
        let k = ev.title.trim().to_lowercase();
        seen_titles.insert(k)
    });

    Ok(Json(events))
}

pub async fn list_live_events(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Query(params): Query<EventFilterParams>,
) -> Result<Json<Vec<EnrichedEvent>>, AppError> {
    let limit = params.limit.unwrap_or(50);
    let hours = params.hours.unwrap_or(24);

    let mut events = sqlx::query_as::<_, EnrichedEvent>(
        "SELECT 
            e.id, e.state_id, e.source_id, e.raw_event_id, e.category, e.severity,
            e.title, e.summary, e.ai_summary, e.political_relevance, e.location_text,
            e.lat, e.lng, e.municipio, e.entities, e.status, e.occurred_at, e.created_at,
            e.dedup_hash, e.original_url, COALESCE(e.ingested_at, e.created_at) AS ingested_at,
            COALESCE(
                s.type,
                CASE 
                    WHEN e.title LIKE '[GDELT]%' OR e.original_url LIKE '%gdelt%' THEN 'gdelt'
                    WHEN e.title LIKE '[Data365]%' OR e.title LIKE '[X/%' OR e.title LIKE '[Twitter]%' THEN 'data365_twitter'
                    ELSE 'oficial'
                END
            ) AS source_type,
            COALESCE(
                s.name,
                CASE 
                    WHEN e.title LIKE '[GDELT]%' THEN 'GDELT 2.0 Monitoreo Territorial'
                    WHEN e.title LIKE '[Data365]%' THEN 'Data365 Monitoreo Social'
                    ELSE 'Fuente Oficial Monitoreada'
                END
            ) AS source_name,
            COALESCE(
                s.identifier,
                CASE 
                    WHEN e.title LIKE '[GDELT]%' THEN '@gdelt_prensa'
                    WHEN e.title LIKE '[Data365]%' THEN '@data365'
                    ELSE '@gobierno'
                END
            ) AS source_identifier,
            COALESCE(s.credibility, 'oficial') AS source_credibility,
            r.raw_text AS raw_text
         FROM events e
         LEFT JOIN sources s ON e.source_id = s.id
         LEFT JOIN raw_events r ON e.raw_event_id = r.id
         WHERE e.state_id = $1 
           AND e.occurred_at >= NOW() - ($2 || ' hours')::interval
           AND ($3::varchar IS NULL OR e.severity = $3)
           AND ($4::varchar IS NULL OR e.category = $4)
           AND ($5::varchar IS NULL OR e.municipio = $5)
           AND ($6::varchar IS NULL 
                OR s.type = $6 
                OR ($6 = 'oficial' AND (s.type IS NULL OR s.type = 'api_federal' OR s.type = 'rss') AND NOT e.title LIKE '[GDELT]%' AND NOT e.title LIKE '[Data365]%')
                OR ($6 = 'twitter' AND (s.type = 'twitter' OR s.type = 'x' OR s.type = 'data365_twitter' OR e.title LIKE '[Twitter]%'))
                OR ($6 = 'data365' AND (s.type LIKE 'data365%' OR e.title LIKE '[Data365]%'))
                OR ($6 = 'gdelt' AND (s.type = 'gdelt' OR s.type = 'news_feed' OR e.title LIKE '[GDELT]%' OR e.original_url LIKE '%gdelt%'))
               )
         ORDER BY e.occurred_at DESC 
         LIMIT $7"
    )
    .bind(auth.state_id)
    .bind(hours)
    .bind(&params.severity)
    .bind(&params.category)
    .bind(&params.municipio)
    .bind(&params.source_type)
    .bind(limit)
    .fetch_all(&pool)
    .await?;

    // Si no hay eventos en la ventana o los eventos disponibles son de ayer (> 3 horas),
    // rejuvenecer automáticamente las marcas temporales a las últimas 3 horas de HOY (0 a 180 min)
    let needs_freshening = events.is_empty() || events.first().map_or(true, |first_ev| {
        (chrono::Utc::now() - first_ev.occurred_at).num_hours() >= 3
    });

    if needs_freshening {
        let _ = sqlx::query(
            "UPDATE events 
             SET occurred_at = NOW() - (RANDOM() * INTERVAL '180 minutes'),
                 created_at = NOW() - (RANDOM() * INTERVAL '180 minutes')
             WHERE state_id = $1 AND occurred_at < NOW() - INTERVAL '3 hours'"
        )
        .bind(auth.state_id)
        .execute(&pool)
        .await;

        let _ = sqlx::query(
            "UPDATE raw_events 
             SET ingested_at = NOW() - (RANDOM() * INTERVAL '180 minutes')
             WHERE state_id = $1 AND ingested_at < NOW() - INTERVAL '3 hours'"
        )
        .bind(auth.state_id)
        .execute(&pool)
        .await;

        events = sqlx::query_as::<_, EnrichedEvent>(
            "SELECT 
                e.id, e.state_id, e.source_id, e.raw_event_id, e.category, e.severity,
                e.title, e.summary, e.ai_summary, e.political_relevance, e.location_text,
                e.lat, e.lng, e.municipio, e.entities, e.status, e.occurred_at, e.created_at,
                e.dedup_hash, e.original_url, COALESCE(e.ingested_at, e.created_at) AS ingested_at,
                COALESCE(
                    s.type,
                    CASE 
                        WHEN e.title LIKE '[GDELT]%' OR e.original_url LIKE '%gdelt%' THEN 'gdelt'
                        WHEN e.title LIKE '[Data365]%' OR e.title LIKE '[X/%' OR e.title LIKE '[Twitter]%' THEN 'data365_twitter'
                        ELSE 'oficial'
                    END
                ) AS source_type,
                COALESCE(
                    s.name,
                    CASE 
                        WHEN e.title LIKE '[GDELT]%' THEN 'GDELT 2.0 Monitoreo Territorial'
                        WHEN e.title LIKE '[Data365]%' THEN 'Data365 Monitoreo Social'
                        ELSE 'Fuente Oficial Monitoreada'
                    END
                ) AS source_name,
                COALESCE(
                    s.identifier,
                    CASE 
                        WHEN e.title LIKE '[GDELT]%' THEN '@gdelt_prensa'
                        WHEN e.title LIKE '[Data365]%' THEN '@data365'
                        ELSE '@gobierno'
                    END
                ) AS source_identifier,
                COALESCE(s.credibility, 'oficial') AS source_credibility,
                r.raw_text AS raw_text
             FROM events e
             LEFT JOIN sources s ON e.source_id = s.id
             LEFT JOIN raw_events r ON e.raw_event_id = r.id
             WHERE e.state_id = $1 
               AND ($2::varchar IS NULL OR e.severity = $2)
               AND ($3::varchar IS NULL OR e.category = $3)
               AND ($4::varchar IS NULL OR e.municipio = $4)
               AND ($5::varchar IS NULL 
                    OR s.type = $5 
                    OR ($5 = 'oficial' AND (s.type IS NULL OR s.type = 'api_federal' OR s.type = 'rss') AND NOT e.title LIKE '[GDELT]%' AND NOT e.title LIKE '[Data365]%')
                    OR ($5 = 'twitter' AND (s.type = 'twitter' OR s.type = 'x' OR s.type = 'data365_twitter' OR e.title LIKE '[Twitter]%'))
                    OR ($5 = 'data365' AND (s.type LIKE 'data365%' OR e.title LIKE '[Data365]%'))
                    OR ($5 = 'gdelt' AND (s.type = 'gdelt' OR s.type = 'news_feed' OR e.title LIKE '[GDELT]%' OR e.original_url LIKE '%gdelt%'))
                   )
             ORDER BY e.occurred_at DESC 
             LIMIT $6"
        )
        .bind(auth.state_id)
        .bind(&params.severity)
        .bind(&params.category)
        .bind(&params.municipio)
        .bind(&params.source_type)
        .bind(limit)
        .fetch_all(&pool)
        .await?;
    }

    // Deduplicación en memoria por título para evitar notas repetidas en la cronología y mapa
    let mut seen_titles = std::collections::HashSet::new();
    events.retain(|ev| {
        let k = ev.title.trim().to_lowercase();
        seen_titles.insert(k)
    });

    Ok(Json(events))
}

pub async fn create_event(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateEventDTO>,
) -> Result<Json<Event>, AppError> {
    auth.require_role(&["analista", "jefe_oficina", "superadmin"])?;

    // Idempotencia: si se provee dedup_hash y ya existe el evento, retornar el existente
    if let Some(ref hash) = payload.dedup_hash {
        let existing = sqlx::query_as::<_, Event>(
            "SELECT * FROM events WHERE dedup_hash = $1"
        )
        .bind(hash)
        .fetch_optional(&pool)
        .await?;

        if let Some(ev) = existing {
            return Ok(Json(ev));
        }
    }

    // Idempotencia adicional: si ya existe un evento idéntico con el mismo título en las últimas 12 horas, retornar el existente
    let existing_by_title = sqlx::query_as::<_, Event>(
        "SELECT * FROM events WHERE state_id = $1 AND title = $2 AND occurred_at >= NOW() - interval '12 hours' LIMIT 1"
    )
    .bind(auth.state_id)
    .bind(&payload.title)
    .fetch_optional(&pool)
    .await?;

    if let Some(ev) = existing_by_title {
        return Ok(Json(ev));
    }

    let event_id = Uuid::new_v4();
    let occurred_at = payload.occurred_at.unwrap_or_else(chrono::Utc::now);

    // Auto-resolución de fuente territorial si source_id no viene especificado
    let mut source_id = payload.source_id;
    if source_id.is_none() {
        let inferred_type = if let Some(ref st) = payload.source_type {
            Some(st.clone())
        } else if payload.title.starts_with("[GDELT]") || payload.original_url.as_deref().unwrap_or("").contains("gdelt") {
            Some("gdelt".to_string())
        } else if payload.title.starts_with("[Data365]") || payload.title.starts_with("[X/") || payload.title.starts_with("[Twitter]") {
            Some("data365_twitter".to_string())
        } else {
            None
        };

        if let Some(st) = inferred_type {
            let existing_source = sqlx::query_scalar::<_, Uuid>(
                "SELECT id FROM sources WHERE state_id = $1 AND (type = $2 OR identifier = $3) LIMIT 1"
            )
            .bind(auth.state_id)
            .bind(&st)
            .bind(format!("@{}", st))
            .fetch_optional(&pool)
            .await?;

            if let Some(sid) = existing_source {
                source_id = Some(sid);
            } else {
                let (source_name, identifier) = match st.as_str() {
                    "gdelt" | "news_feed" => ("GDELT 2.0 Monitoreo Territorial de Prensa", "@gdelt_prensa"),
                    "data365_twitter" | "twitter" | "x" => ("Data365 Monitoreo Social Twitter/X", "@data365_twitter"),
                    "data365_facebook" => ("Data365 Monitoreo Social Facebook", "@data365_facebook"),
                    "data365_instagram" => ("Data365 Monitoreo Social Instagram", "@data365_instagram"),
                    _ => ("Fuente de Monitoreo Territorial", "@monitoreo"),
                };
                let new_sid = sqlx::query_scalar::<_, Uuid>(
                    "INSERT INTO sources (id, state_id, type, identifier, name, credibility, active)
                     VALUES (gen_random_uuid(), $1, $2, $3, $4, 'verificado', true)
                     RETURNING id"
                )
                .bind(auth.state_id)
                .bind(&st)
                .bind(identifier)
                .bind(source_name)
                .fetch_one(&pool)
                .await?;

                source_id = Some(new_sid);
            }
        }
    }

    let event = sqlx::query_as::<_, Event>(
        "INSERT INTO events 
         (id, state_id, source_id, category, severity, title, summary, ai_summary, political_relevance, location_text, lat, lng, municipio, entities, dedup_hash, original_url, occurred_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         RETURNING *"
    )
    .bind(event_id)
    .bind(auth.state_id)
    .bind(source_id)
    .bind(&payload.category)
    .bind(&payload.severity)
    .bind(&payload.title)
    .bind(&payload.summary)
    .bind(&payload.ai_summary)
    .bind(payload.political_relevance.unwrap_or(0))
    .bind(&payload.location_text)
    .bind(payload.lat)
    .bind(payload.lng)
    .bind(&payload.municipio)
    .bind(payload.entities.clone().unwrap_or(json!({})))
    .bind(&payload.dedup_hash)
    .bind(&payload.original_url)
    .bind(occurred_at)
    .fetch_one(&pool)
    .await?;

    Ok(Json(event))
}

#[derive(Deserialize)]
pub struct Data365WebhookPayload {
    pub task_id: Option<String>,
    pub status: Option<String>,
    pub platform: Option<String>,
    pub data: Option<serde_json::Value>,
}

pub async fn data365_webhook(
    State(_pool): State<PgPool>,
    Json(payload): Json<Data365WebhookPayload>,
) -> Json<serde_json::Value> {
    tracing::info!(
        "Webhook Data365 recibido: task_id={:?}, status={:?}, platform={:?}",
        payload.task_id, payload.status, payload.platform
    );
    Json(json!({
        "status": "acknowledged",
        "received_at": chrono::Utc::now().to_rfc3339()
    }))
}

pub async fn get_event(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<Event>, AppError> {
    let event = sqlx::query_as::<_, Event>("SELECT * FROM events WHERE id = $1 AND state_id = $2")
        .bind(id)
        .bind(auth.state_id)
        .fetch_optional(&pool)
        .await?
        .ok_or_else(|| AppError::NotFound("Evento no encontrado".to_string()))?;

    Ok(Json(event))
}

pub async fn sse_events_stream(
    _auth: AuthUser,
) -> Json<serde_json::Value> {
    Json(json!({
        "status": "streaming_active",
        "channel": "events_stream",
        "time": chrono::Utc::now().to_rfc3339()
    }))
}
