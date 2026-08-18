use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct State {
    pub id: Uuid,
    pub name: String,
    pub clave_inegi: String,
    pub polygon: Value,
    pub buffer_km: Option<i32>,
    pub logo_url: Option<String>,
    pub color_primario: Option<String>,
    pub nombre_dependencia: Option<String>,
    pub timezone: Option<String>,
    pub active: Option<bool>,
    pub config: Option<Value>,
    pub created_at: Option<DateTime<Utc>>,
}
