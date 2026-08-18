use axum::{
    extract::State,
    Json,
};
use serde_json::json;
use sqlx::PgPool;
use crate::{
    auth::middleware::AuthUser,
    error::AppError,
    models::CabinetSnapshot,
};

pub async fn get_cabinet_snapshot(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<CabinetSnapshot>, AppError> {
    let snapshot = sqlx::query_as::<_, CabinetSnapshot>(
        "SELECT * FROM cabinet_snapshots WHERE state_id = $1 ORDER BY created_at DESC LIMIT 1"
    )
    .bind(auth.state_id)
    .fetch_optional(&pool)
    .await?;

    if let Some(s) = snapshot {
        Ok(Json(s))
    } else {
        // Fallback default snapshot
        Ok(Json(CabinetSnapshot {
            id: uuid::Uuid::new_v4(),
            state_id: auth.state_id,
            semaforos: json!({
                "seguridad": {"nivel": "ALERTA", "color": "danger"},
                "proteccion_civil": {"nivel": "NORMAL", "color": "success"},
                "gobernabilidad": {"nivel": "NORMAL", "color": "success"}
            }),
            key_points: json!([
                {"id": 1, "titulo": "Monitoreo de Seguridad Activo", "impacto": "Alto"}
            ]),
            alert_level: Some("VIGILANCIA".to_string()),
            created_at: Some(chrono::Utc::now()),
        }))
    }
}
