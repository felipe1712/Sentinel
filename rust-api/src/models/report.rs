use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Report {
    pub id: Uuid,
    pub state_id: Uuid,
    pub r#type: String,
    pub period: Option<String>,
    pub pdf_url: Option<String>,
    pub generated_at: Option<DateTime<Utc>>,
    pub delivered_to: Option<Vec<String>>,
}
