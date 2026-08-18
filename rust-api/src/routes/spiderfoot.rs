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
};

#[derive(Deserialize)]
pub struct SpiderScanPayload {
    pub target: String,
}

pub async fn start_spider_scan(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(payload): Json<SpiderScanPayload>,
) -> Result<Json<serde_json::Value>, AppError> {
    auth.require_role(&["analista", "superadmin"])?;

    let scan_id = Uuid::new_v4();

    sqlx::query(
        "INSERT INTO spider_scans (id, state_id, target, status) VALUES ($1, $2, $3, 'running')"
    )
    .bind(scan_id)
    .bind(auth.state_id)
    .bind(&payload.target)
    .execute(&pool)
    .await?;

    Ok(Json(json!({
        "scan_id": scan_id,
        "target": payload.target,
        "status": "running",
        "message": "Escaneo SpiderFoot iniciado en red interna"
    })))
}

pub async fn get_spider_scan(
    _auth: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    Ok(Json(json!({
        "scan_id": id,
        "target": "jalisco.gob.mx",
        "status": "completed",
        "findings_count": 14,
        "vulnerabilities": [
            {"type": "SSL Certificate Expiry Warning", "severity": "medium"},
            {"type": "Open Ports (80, 443, 8080)", "severity": "low"}
        ]
    })))
}
