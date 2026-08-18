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
    models::Source,
};

#[derive(Deserialize)]
pub struct CreateSourceDTO {
    pub r#type: String,
    pub identifier: String,
    pub name: String,
    pub credibility: Option<String>,
}

#[derive(Deserialize)]
pub struct TelegramSearchDTO {
    pub query: String,
}

pub async fn list_sources(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Source>>, AppError> {
    auth.require_role(&["analista", "jefe_oficina", "superadmin"])?;

    let sources = sqlx::query_as::<_, Source>(
        "SELECT * FROM sources WHERE state_id = $1 ORDER BY created_at DESC"
    )
    .bind(auth.state_id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(sources))
}

pub async fn create_source(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateSourceDTO>,
) -> Result<Json<Source>, AppError> {
    auth.require_role(&["analista", "jefe_oficina", "superadmin"])?;

    let source = sqlx::query_as::<_, Source>(
        "INSERT INTO sources (id, state_id, type, identifier, name, credibility)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *"
    )
    .bind(Uuid::new_v4())
    .bind(auth.state_id)
    .bind(&payload.r#type)
    .bind(&payload.identifier)
    .bind(&payload.name)
    .bind(payload.credibility.as_deref().unwrap_or("no_verificado"))
    .fetch_one(&pool)
    .await?;

    Ok(Json(source))
}

pub async fn toggle_source(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    auth.require_role(&["analista", "jefe_oficina", "superadmin"])?;

    sqlx::query(
        "UPDATE sources SET active = NOT active WHERE id = $1 AND state_id = $2"
    )
    .bind(id)
    .bind(auth.state_id)
    .execute(&pool)
    .await?;

    Ok(Json(json!({ "message": "Estado de la fuente actualizado" })))
}

pub async fn search_telegram_channels(
    auth: AuthUser,
    Json(payload): Json<TelegramSearchDTO>,
) -> Result<Json<serde_json::Value>, AppError> {
    auth.require_role(&["analista", "jefe_oficina", "superadmin"])?;

    // Simulación de respuesta de descubrimiento de canales
    Ok(Json(json!([
        {
            "username": format!("@{}", payload.query.replace(" ", "")),
            "title": format!("Canal {}", payload.query),
            "subscribers": 14200,
            "relevance_score": 88,
            "category": "noticias_locales"
        },
        {
            "username": format!("@{}_Alerta", payload.query.replace(" ", "")),
            "title": format!("Alertas {}", payload.query),
            "subscribers": 8500,
            "relevance_score": 75,
            "category": "seguridad"
        }
    ])))
}
