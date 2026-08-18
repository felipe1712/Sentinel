use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Profile {
    pub id: Uuid,
    pub state_id: Uuid,
    pub r#type: String,
    pub name: String,
    pub aliases: Option<Vec<String>>,
    pub cargo: Option<String>,
    pub partido: Option<String>,
    pub descripcion: Option<String>,
    pub risk_level: Option<String>,
    pub photo_url: Option<String>,
    pub active: Option<bool>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ProfileMention {
    pub id: Uuid,
    pub profile_id: Uuid,
    pub event_id: Uuid,
    pub context: String,
    pub sentiment: Option<String>,
    pub confidence: Option<f64>,
    pub created_at: Option<DateTime<Utc>>,
}
