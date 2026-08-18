use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Source {
    pub id: Uuid,
    pub state_id: Uuid,
    pub r#type: String,
    pub identifier: String,
    pub name: String,
    pub credibility: Option<String>,
    pub active: Option<bool>,
    pub keywords: Option<Vec<String>>,
    pub last_checked: Option<DateTime<Utc>>,
    pub message_count: Option<i32>,
    pub config: Option<Value>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct TelegramChannel {
    pub id: Uuid,
    pub source_id: Uuid,
    pub tg_id: i64,
    pub username: Option<String>,
    pub title: Option<String>,
    pub subscribers: Option<i32>,
    pub last_message_id: Option<i64>,
    pub relevance_score: Option<i32>,
    pub category: Option<String>,
    pub session_string_enc: Option<String>,
    pub verified_at: Option<DateTime<Utc>>,
    pub created_at: Option<DateTime<Utc>>,
}
