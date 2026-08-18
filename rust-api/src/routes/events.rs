use axum::{
    extract::{Path, Query, State},
    response::sse::{Event as SseMessage, Sse},
    Json,
};
use futures::stream::{self, Stream};
use serde::Deserialize;
use serde_json::json;
use sqlx::PgPool;
use std::{convert::Infallible, time::Duration};
use tokio::sync::broadcast::Sender;
use uuid::Uuid;
use crate::{
    auth::middleware::AuthUser,
    error::AppError,
    models::{CreateEventDTO, Event},
};

#[derive(Deserialize)]
pub struct EventFilterParams {
    pub severity: Option<String>,
    pub category: Option<String>,
    pub municipio: Option<String>,
    pub limit: Option<i64>,
}

pub async fn list_events(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Query(params): Query<EventFilterParams>,
) -> Result<Json<Vec<Event>>, AppError> {
    let limit = params.limit.unwrap_or(50);

    let events = sqlx::query_as::<_, Event>(
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

    Ok(Json(events))
}

pub async fn create_event(
    auth: AuthUser,
    State((pool, tx_event)): State<(PgPool, Sender<String>)>,
    Json(payload): Json<CreateEventDTO>,
) -> Result<Json<Event>, AppError> {
    auth.require_role(&["analista", "jefe_oficina", "superadmin"])?;

    let event_id = Uuid::new_v4();
    let occurred_at = payload.occurred_at.unwrap_or_else(chrono::Utc::now);

    let event = sqlx::query_as::<_, Event>(
        "INSERT INTO events 
         (id, state_id, category, severity, title, summary, ai_summary, political_relevance, location_text, lat, lng, municipio, entities, occurred_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *"
    )
    .bind(event_id)
    .bind(auth.state_id)
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
    .bind(occurred_at)
    .fetch_one(&pool)
    .await?;

    // Notificar por SSE broadcast
    if let Ok(event_json) = serde_json::to_string(&event) {
        let _ = tx_event.send(event_json);
    }

    Ok(Json(event))
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
) -> Sse<impl Stream<Item = Result<SseMessage, Infallible>>> {
    let stream = stream::repeat_with(|| {
        SseMessage::default().data(json!({"type": "ping", "time": chrono::Utc::now().to_rfc3339()}).to_string())
    })
    .map(Ok)
    .throttle(Duration::from_secs(15));

    Sse::new(stream)
}
