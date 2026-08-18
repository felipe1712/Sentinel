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
    models::Report,
};

#[derive(Deserialize)]
pub struct GenerateReportDTO {
    pub r#type: String, // diario | semanal | incidente | ejecutivo | ciberseguridad
}

pub async fn list_reports(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Report>>, AppError> {
    let reports = sqlx::query_as::<_, Report>(
        "SELECT * FROM reports WHERE state_id = $1 ORDER BY generated_at DESC LIMIT 30"
    )
    .bind(auth.state_id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(reports))
}

pub async fn generate_report(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(payload): Json<GenerateReportDTO>,
) -> Result<Json<Report>, AppError> {
    auth.require_role(&["asesor", "jefe_oficina", "analista", "superadmin"])?;

    let report_id = Uuid::new_v4();
    let pdf_url = format!("/reports/{}_{}.pdf", payload.r#type, report_id);

    let report = sqlx::query_as::<_, Report>(
        "INSERT INTO reports (id, state_id, type, period, pdf_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *"
    )
    .bind(report_id)
    .bind(auth.state_id)
    .bind(&payload.r#type)
    .bind(format!("Período {}", chrono::Utc::now().format("%Y-%m-%d")))
    .bind(&pdf_url)
    .fetch_one(&pool)
    .await?;

    Ok(Json(report))
}

pub async fn download_report(
    _auth: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    Ok(Json(json!({
        "status": "ready",
        "download_url": format!("/downloads/report_{}.pdf", id)
    })))
}
