use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Event {
    pub id: Uuid,
    pub state_id: Uuid,
    pub source_id: Option<Uuid>,
    pub raw_event_id: Option<Uuid>,
    pub category: String,
    pub severity: String,
    pub title: String,
    pub summary: String,
    pub ai_summary: Option<String>,
    pub political_relevance: Option<i32>,
    pub location_text: Option<String>,
    pub lat: Option<f64>,
    pub lng: Option<f64>,
    pub municipio: Option<String>,
    pub entities: Option<Value>,
    pub status: Option<String>,
    pub occurred_at: DateTime<Utc>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateEventDTO {
    pub category: String,
    pub severity: String,
    pub title: String,
    pub summary: String,
    pub ai_summary: Option<String>,
    pub political_relevance: Option<i32>,
    pub location_text: Option<String>,
    pub lat: Option<f64>,
    pub lng: Option<f64>,
    pub municipio: Option<String>,
    pub entities: Option<Value>,
    pub occurred_at: Option<DateTime<Utc>>,
}
