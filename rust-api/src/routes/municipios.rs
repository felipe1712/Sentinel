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
        {"clave": "22014", "nombre": "Santiago de Querétaro", "region": "ZMQ", "actividad_nivel": "alto", "eventos_24h": 12, "poblacion": "1,049,777", "responsable_region": "PoEs ZMQ Sector 1"},
        {"clave": "22011", "nombre": "El Marqués", "region": "ZMQ", "actividad_nivel": "alto", "eventos_24h": 7, "poblacion": "231,668", "responsable_region": "PoEs ZMQ Sector 2"},
        {"clave": "22006", "nombre": "Corregidora", "region": "ZMQ", "actividad_nivel": "medio", "eventos_24h": 6, "poblacion": "212,567", "responsable_region": "PoEs ZMQ Sector 3"},
        {"clave": "22016", "nombre": "San Juan del Río", "region": "Sur", "actividad_nivel": "medio", "eventos_24h": 5, "poblacion": "297,804", "responsable_region": "Región Valles / Sur"},
        {"clave": "22017", "nombre": "Tequisquiapan", "region": "Semidesierto", "actividad_nivel": "medio", "eventos_24h": 3, "poblacion": "72,201", "responsable_region": "Región Semidesierto"},
        {"clave": "22008", "nombre": "Huimilpan", "region": "ZMQ", "actividad_nivel": "bajo", "eventos_24h": 2, "poblacion": "36,808", "responsable_region": "PoEs ZMQ Sector 4"},
        {"clave": "22012", "nombre": "Pedro Escobedo", "region": "ZMQ / Sur", "actividad_nivel": "medio", "eventos_24h": 4, "poblacion": "77,404", "responsable_region": "Región Valles"},
        {"clave": "22004", "nombre": "Cadereyta de Montes", "region": "Semidesierto", "actividad_nivel": "bajo", "eventos_24h": 2, "poblacion": "69,075", "responsable_region": "Región Semidesierto"},
        {"clave": "22005", "nombre": "Colón", "region": "Semidesierto / Aeropuerto", "actividad_nivel": "medio", "eventos_24h": 3, "poblacion": "67,121", "responsable_region": "Sector Aeropuerto AIQ"},
        {"clave": "22001", "nombre": "Amealco de Bonfil", "region": "Sur", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "66,841", "responsable_region": "Región Sur"},
        {"clave": "22007", "nombre": "Ezequiel Montes", "region": "Semidesierto", "actividad_nivel": "bajo", "eventos_24h": 2, "poblacion": "45,141", "responsable_region": "Región Semidesierto"},
        {"clave": "22009", "nombre": "Jalpan de Serra", "region": "Sierra Gorda", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "27,343", "responsable_region": "Región Sierra Gorda"},
        {"clave": "22015", "nombre": "Pinal de Amoles", "region": "Sierra Gorda", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "27,093", "responsable_region": "Región Sierra Gorda"},
        {"clave": "22018", "nombre": "Tolimán", "region": "Semidesierto", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "27,999", "responsable_region": "Región Semidesierto"},
        {"clave": "22013", "nombre": "Peñamiller", "region": "Semidesierto", "actividad_nivel": "bajo", "eventos_24h": 0, "poblacion": "19,141", "responsable_region": "Región Semidesierto"},
        {"clave": "22003", "nombre": "Arroyo Seco", "region": "Sierra Gorda", "actividad_nivel": "bajo", "eventos_24h": 0, "poblacion": "13,142", "responsable_region": "Región Sierra Gorda"},
        {"clave": "22010", "nombre": "Landa de Matamoros", "region": "Sierra Gorda", "actividad_nivel": "bajo", "eventos_24h": 0, "poblacion": "18,794", "responsable_region": "Región Sierra Gorda"},
        {"clave": "22002", "nombre": "San Joaquín", "region": "Sierra Gorda", "actividad_nivel": "bajo", "eventos_24h": 0, "poblacion": "8,359", "responsable_region": "Región Sierra Gorda"}
    ])))
}

pub async fn get_municipio_detail(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(clave): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let municipio_nombre = match clave.as_str() {
        "22014" => "Santiago de Querétaro",
        "22011" => "El Marqués",
        "22006" => "Corregidora",
        "22016" => "San Juan del Río",
        "22017" => "Tequisquiapan",
        "22008" => "Huimilpan",
        "22012" => "Pedro Escobedo",
        "22004" => "Cadereyta de Montes",
        "22005" => "Colón",
        "22001" => "Amealco de Bonfil",
        "22007" => "Ezequiel Montes",
        "22009" => "Jalpan de Serra",
        "22015" => "Pinal de Amoles",
        "22018" => "Tolimán",
        "22013" => "Peñamiller",
        "22003" => "Arroyo Seco",
        "22010" => "Landa de Matamoros",
        "22002" => "San Joaquín",
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
        "resumen": format!("Municipio de {} con monitoreo territorial activo de paz social, infraestructura y programas de gobierno.", municipio_nombre),
        "eventos_recientes": events,
        "narrativas_locales": [
            {"id": "n1", "titulo": format!("Atención institucional y desarrollo en {}", municipio_nombre), "trend": "estable"}
        ]
    })))
}
