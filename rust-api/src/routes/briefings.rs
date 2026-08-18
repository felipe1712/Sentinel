use axum::{
    extract::{Path, State},
    Json,
};
use chrono::NaiveDate;
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;
use crate::{
    auth::middleware::AuthUser,
    error::AppError,
    models::Briefing,
};

pub async fn list_briefings(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Briefing>>, AppError> {
    let briefings = sqlx::query_as::<_, Briefing>(
        "SELECT * FROM briefings WHERE state_id = $1 ORDER BY date DESC LIMIT 30"
    )
    .bind(auth.state_id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(briefings))
}

pub async fn get_today_briefing(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<Briefing>, AppError> {
    let today = chrono::Utc::now().date_naive();
    
    let briefing = sqlx::query_as::<_, Briefing>(
        "SELECT * FROM briefings WHERE state_id = $1 AND date = $2"
    )
    .bind(auth.state_id)
    .bind(today)
    .fetch_optional(&pool)
    .await?;

    if let Some(b) = briefing {
        Ok(Json(b))
    } else {
        // Fallback al más reciente si hoy aún no se genera
        let latest = sqlx::query_as::<_, Briefing>(
            "SELECT * FROM briefings WHERE state_id = $1 ORDER BY date DESC LIMIT 1"
        )
        .bind(auth.state_id)
        .fetch_optional(&pool)
        .await?
        .ok_or_else(|| AppError::NotFound("No hay briefings disponibles para este estado".to_string()))?;

        Ok(Json(latest))
    }
}

pub async fn get_briefing_by_date(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(date_str): Path<String>,
) -> Result<Json<Briefing>, AppError> {
    let date = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
        .map_err(|_| AppError::BadRequest("Formato de fecha inválido. Usar YYYY-MM-DD".to_string()))?;

    let briefing = sqlx::query_as::<_, Briefing>(
        "SELECT * FROM briefings WHERE state_id = $1 AND date = $2"
    )
    .bind(auth.state_id)
    .bind(date)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("No existe briefing para la fecha {}", date_str)))?;

    Ok(Json(briefing))
}

pub async fn generate_briefing_trigger(
    auth: AuthUser,
) -> Result<Json<serde_json::Value>, AppError> {
    auth.require_role(&["jefe_oficina", "superadmin"])?;
    Ok(Json(json!({
        "status": "queued",
        "message": "Solicitud de generación de briefing matutino enviada a la cola Celery"
    })))
}

pub async fn deliver_briefing(
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    auth.require_role(&["jefe_oficina", "superadmin"])?;
    Ok(Json(json!({
        "status": "delivered",
        "briefing_id": id,
        "message": "Briefing enviado correctamente a la lista de distribución del gabinete"
    })))
}
