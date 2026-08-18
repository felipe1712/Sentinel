use axum::{
    extract::{Path, State},
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;
use crate::{
    auth::middleware::AuthUser,
    error::AppError,
    models::Narrative,
};

pub async fn list_narratives(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Narrative>>, AppError> {
    let narratives = sqlx::query_as::<_, Narrative>(
        "SELECT * FROM narratives WHERE state_id = $1 AND active = true ORDER BY volume_24h DESC"
    )
    .bind(auth.state_id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(narratives))
}

pub async fn get_narrative(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<Narrative>, AppError> {
    let narrative = sqlx::query_as::<_, Narrative>(
        "SELECT * FROM narratives WHERE id = $1 AND state_id = $2"
    )
    .bind(id)
    .bind(auth.state_id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Narrativa no encontrada".to_string()))?;

    Ok(Json(narrative))
}
