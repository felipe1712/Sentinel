use axum::{
    extract::{Path, State},
    Json,
};
use serde_json::json;
use sqlx::PgPool;
use crate::{
    auth::middleware::AuthUser,
    error::AppError,
    models::IpRecord,
};

pub async fn get_ip_geojson(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<serde_json::Value>, AppError> {
    let records = sqlx::query_as::<_, IpRecord>(
        "SELECT * FROM ip_records WHERE state_id = $1 ORDER BY seen_at DESC LIMIT 100"
    )
    .bind(auth.state_id)
    .fetch_all(&pool)
    .await?;

    let features: Vec<serde_json::Value> = records
        .into_iter()
        .map(|r| {
            json!({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [-103.3440, 20.6736]
                },
                "properties": {
                    "ip": r.ip,
                    "actor": r.actor,
                    "hostname": r.hostname,
                    "country": r.country
                }
            })
        })
        .collect();

    Ok(Json(json!({
        "type": "FeatureCollection",
        "features": features
    })))
}

pub async fn get_ip_detail(
    _auth: AuthUser,
    Path(ip): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    Ok(Json(json!({
        "ip": ip,
        "country": "MX",
        "actor": "Infraestructura Estatal Reconocida",
        "hostname": format!("host-{}.jalisco.gob.mx", ip.replace(".", "-")),
        "open_ports": [80, 443],
        "reputation": "limpia"
    })))
}
