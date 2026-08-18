use axum::{
    extract::{Path, State},
    Json,
};
use serde::Deserialize;
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;
use crate::{
    auth::middleware::AuthUser,
    error::AppError,
    models::{Profile, ProfileMention},
};

#[derive(Deserialize)]
pub struct CreateProfileDTO {
    pub r#type: String,
    pub name: String,
    pub aliases: Option<Vec<String>>,
    pub cargo: Option<String>,
    pub partido: Option<String>,
    pub descripcion: Option<String>,
    pub risk_level: Option<String>,
}

pub async fn list_profiles(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Profile>>, AppError> {
    let profiles = sqlx::query_as::<_, Profile>(
        "SELECT * FROM profiles WHERE state_id = $1 AND active = true ORDER BY name ASC"
    )
    .bind(auth.state_id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(profiles))
}

pub async fn create_profile(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateProfileDTO>,
) -> Result<Json<Profile>, AppError> {
    auth.require_role(&["analista", "asesor", "jefe_oficina", "superadmin"])?;

    let profile = sqlx::query_as::<_, Profile>(
        "INSERT INTO profiles (id, state_id, type, name, aliases, cargo, partido, descripcion, risk_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *"
    )
    .bind(Uuid::new_v4())
    .bind(auth.state_id)
    .bind(&payload.r#type)
    .bind(&payload.name)
    .bind(&payload.aliases)
    .bind(&payload.cargo)
    .bind(&payload.partido)
    .bind(&payload.descripcion)
    .bind(payload.risk_level.as_deref().unwrap_or("ninguno"))
    .fetch_one(&pool)
    .await?;

    Ok(Json(profile))
}

pub async fn get_profile(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<Profile>, AppError> {
    let profile = sqlx::query_as::<_, Profile>(
        "SELECT * FROM profiles WHERE id = $1 AND state_id = $2"
    )
    .bind(id)
    .bind(auth.state_id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Perfil no encontrado".to_string()))?;

    Ok(Json(profile))
}

pub async fn get_profile_mentions(
    _auth: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<ProfileMention>>, AppError> {
    let mentions = sqlx::query_as::<_, ProfileMention>(
        "SELECT * FROM profile_mentions WHERE profile_id = $1 ORDER BY created_at DESC LIMIT 50"
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(mentions))
}

pub async fn get_profile_timeline(
    _auth: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    Ok(Json(json!({
        "profile_id": id,
        "timeline": [
            {"date": "2026-08-18", "event": "Mención en declaración legislativa", "sentiment": "negativo"},
            {"date": "2026-08-15", "event": "Publicación en medios locales sobre presupuesto", "sentiment": "neutro"}
        ]
    })))
}

pub async fn get_profile_map(
    _auth: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    Ok(Json(json!({
        "profile_id": id,
        "locations": [
            {"lat": 20.6736, "lng": -103.3440, "municipio": "Guadalajara", "count": 12},
            {"lat": 20.7200, "lng": -103.3900, "municipio": "Zapopan", "count": 5}
        ]
    })))
}
