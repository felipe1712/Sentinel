use axum::{
    extract::{Path, State},
    Json,
};
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;
use crate::{
    auth::middleware::AuthUser,
    error::AppError,
    models::{CreateDossierDTO, Dossier},
};

pub async fn list_dossiers(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Dossier>>, AppError> {
    let dossiers = sqlx::query_as::<_, Dossier>(
        "SELECT * FROM dossiers WHERE state_id = $1 ORDER BY created_at DESC LIMIT 50"
    )
    .bind(auth.state_id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(dossiers))
}

pub async fn create_dossier(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateDossierDTO>,
) -> Result<Json<Dossier>, AppError> {
    auth.require_role(&["asesor", "jefe_oficina", "analista", "superadmin"])?;

    let dossier_id = Uuid::new_v4();

    let dossier = sqlx::query_as::<_, Dossier>(
        "INSERT INTO dossiers 
         (id, state_id, type, title, bluf, content, confidence, risk_level, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *"
    )
    .bind(dossier_id)
    .bind(auth.state_id)
    .bind(&payload.r#type)
    .bind(&payload.title)
    .bind(&payload.bluf)
    .bind(&payload.content)
    .bind(payload.confidence.as_deref().unwrap_or("medio"))
    .bind(payload.risk_level.as_deref().unwrap_or("bajo"))
    .bind(auth.user_id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(dossier))
}

pub async fn get_dossier(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<Dossier>, AppError> {
    let dossier = sqlx::query_as::<_, Dossier>(
        "SELECT * FROM dossiers WHERE id = $1 AND state_id = $2"
    )
    .bind(id)
    .bind(auth.state_id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Dossier no encontrado".to_string()))?;

    Ok(Json(dossier))
}

pub async fn export_dossier_pdf(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let dossier = sqlx::query_as::<_, Dossier>(
        "SELECT * FROM dossiers WHERE id = $1 AND state_id = $2"
    )
    .bind(id)
    .bind(auth.state_id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Dossier no encontrado".to_string()))?;

    Ok(Json(json!({
        "status": "success",
        "dossier_id": dossier.id,
        "pdf_url": format!("/api/reports/pdf/dossier_{}.pdf", dossier.id)
    })))
}
