use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{NaiveDate, DateTime, Utc};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Briefing {
    pub id: Uuid,
    pub state_id: Uuid,
    pub date: NaiveDate,
    pub title: Option<String>,
    pub executive_summary: String,
    pub key_points: Value,
    pub heat_map_data: Option<Value>,
    pub narratives_data: Option<Value>,
    pub watch_today: Option<Value>,
    pub political_context: Option<String>,
    pub mcp_intel: Option<Value>,
    pub generated_at: Option<DateTime<Utc>>,
    pub approved_by: Option<Uuid>,
    pub delivered_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Narrative {
    pub id: Uuid,
    pub state_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub trend: Option<String>,
    pub volume_24h: Option<i32>,
    pub volume_7d: Option<i32>,
    pub first_seen: Option<DateTime<Utc>>,
    pub last_seen: Option<DateTime<Utc>>,
    pub event_ids: Option<Vec<Uuid>>,
    pub category: Option<String>,
    pub ai_analysis: Option<String>,
    pub active: Option<bool>,
    pub created_at: Option<DateTime<Utc>>,
}
