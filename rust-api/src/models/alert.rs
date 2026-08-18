use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CabinetSnapshot {
    pub id: Uuid,
    pub state_id: Uuid,
    pub semaforos: Value,
    pub key_points: Value,
    pub alert_level: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct IpRecord {
    pub id: Uuid,
    pub state_id: Uuid,
    pub ip: String,
    pub actor: Option<String>,
    pub hostname: Option<String>,
    pub country: Option<String>,
    pub source: Option<String>,
    pub seen_at: Option<DateTime<Utc>>,
}
