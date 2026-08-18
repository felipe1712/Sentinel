use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, sqlx::Type)]
#[sqlx(type_name = "varchar", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum Role {
    Superadmin,
    JefeOficina,
    Asesor,
    Analista,
    Gobernador,
}

impl Role {
    pub fn from_str(s: &str) -> Self {
        match s {
            "superadmin" => Role::Superadmin,
            "jefe_oficina" => Role::JefeOficina,
            "asesor" => Role::Asesor,
            "analista" => Role::Analista,
            "gobernador" => Role::Gobernador,
            _ => Role::Analista,
        }
    }

    pub fn to_str(&self) -> &'static str {
        match self {
            Role::Superadmin => "superadmin",
            Role::JefeOficina => "jefe_oficina",
            Role::Asesor => "asesor",
            Role::Analista => "analista",
            Role::Gobernador => "gobernador",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub state_id: Option<Uuid>,
    pub email: String,
    #[serde(skip_serializing)]
    pub hashed_pwd: String,
    pub role: String,
    pub name: String,
    pub cargo: Option<String>,
    pub active: Option<bool>,
    pub last_login: Option<DateTime<Utc>>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserDTO {
    pub id: Uuid,
    pub state_id: Option<Uuid>,
    pub email: String,
    pub role: String,
    pub name: String,
    pub cargo: Option<String>,
    pub active: Option<bool>,
    pub last_login: Option<DateTime<Utc>>,
}
