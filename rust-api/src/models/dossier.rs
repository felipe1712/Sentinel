use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Dossier {
    pub id: Uuid,
    pub state_id: Uuid,
    pub r#type: String,
    pub title: String,
    pub bluf: String,
    pub content: Value,
    pub confidence: Option<String>,
    pub risk_level: Option<String>,
    pub created_by: Option<Uuid>,
    pub created_at: Option<DateTime<Utc>>,
    pub approved_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDossierDTO {
    pub r#type: String,
    pub title: String,
    pub bluf: String,
    pub content: Value,
    pub confidence: Option<String>,
    pub risk_level: Option<String>,
}
