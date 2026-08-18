use axum::{
    extract::{Path, State},
    Json,
};
use serde_json::json;
use sqlx::PgPool;
use crate::{
    auth::middleware::AuthUser,
    error::AppError,
    models::Event,
};

pub async fn list_municipios(
    _auth: AuthUser,
) -> Result<Json<serde_json::Value>, AppError> {
    Ok(Json(json!([
        {"clave": "22014", "nombre": "Santiago de Querétaro", "actividad_nivel": "alto", "eventos_24h": 12},
        {"clave": "22006", "nombre": "Corregidora", "actividad_nivel": "medio", "eventos_24h": 6},
        {"clave": "22011", "nombre": "El Marqués", "actividad_nivel": "medio", "eventos_24h": 7},
        {"clave": "22016", "nombre": "San Juan del Río", "actividad_nivel": "medio", "eventos_24h": 5},
        {"clave": "22017", "nombre": "Tequisquiapan", "actividad_nivel": "bajo", "eventos_24h": 2}
    ])))
}

pub async fn get_municipio_detail(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(clave): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let municipio_nombre = match clave.as_str() {
        "22014" => "Santiago de Querétaro",
        "22006" => "Corregidora",
        "22011" => "El Marqués",
        "22016" => "San Juan del Río",
        _ => "Santiago de Querétaro",
    };

    let events = sqlx::query_as::<_, Event>(
        "SELECT * FROM events WHERE state_id = $1 AND municipio = $2 ORDER BY occurred_at DESC LIMIT 10"
    )
    .bind(auth.state_id)
    .bind(municipio_nombre)
    .fetch_all(&pool)
    .await?;

    Ok(Json(json!({
        "clave": clave,
        "nombre": municipio_nombre,
        "resumen": format!("Municipio de {} con monitoreo activo de seguridad, agua e infraestructura.", municipio_nombre),
        "eventos_recientes": events,
        "narrativas_locales": [
            {"id": "n1", "titulo": format!("Atención ciudadana y movilidad en {}", municipio_nombre), "trend": "estable"}
        ]
    })))
}
