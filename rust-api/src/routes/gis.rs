use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;
use crate::{
    auth::middleware::AuthUser,
    error::AppError,
};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct ElectoralResultDTO {
    pub id: Uuid,
    pub state_id: Uuid,
    pub election_year: i32,
    pub election_type: String,
    pub clave_seccion: i32,
    pub clave_municipio: i32,
    pub lista_nominal: Option<i32>,
    pub total_votos: Option<i32>,
    pub participacion_pct: Option<f64>,
    pub ganador_partido: Option<String>,
    pub ganador_votos: Option<i32>,
    pub ganador_pct: Option<f64>,
    pub segundo_partido: Option<String>,
    pub segundo_votos: Option<i32>,
    pub segundo_pct: Option<f64>,
    pub margen_victoria_pct: Option<f64>,
    pub votos_partidos: serde_json::Value,
}

#[derive(Debug, Deserialize)]
pub struct ResultsFilterParams {
    pub year: Option<i32>,
    pub election_type: Option<String>,
    pub municipio: Option<i32>,
    pub seccion: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct ComparisonParams {
    pub year1: i32,
    pub year2: i32,
    pub election_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct GisEventDTO {
    pub id: Uuid,
    pub state_id: Uuid,
    pub layer_type: String,
    pub title: String,
    pub description: Option<String>,
    pub severity: Option<String>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub clave_seccion: Option<i32>,
    pub clave_municipio: Option<i32>,
    pub source: Option<String>,
    pub metadata: serde_json::Value,
    pub event_timestamp: Option<chrono::DateTime<chrono::Utc>>,
    pub expires_at: Option<chrono::DateTime<chrono::Utc>>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct CreateGisEventDTO {
    pub layer_type: String,
    pub title: String,
    pub description: Option<String>,
    pub severity: Option<String>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub clave_seccion: Option<i32>,
    pub clave_municipio: Option<i32>,
    pub source: Option<String>,
    pub metadata: Option<serde_json::Value>,
    pub expires_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct GisEventsFilterParams {
    pub layer_type: Option<String>,
    pub severity: Option<String>,
    pub clave_seccion: Option<i32>,
}

// -----------------------------------------------------------------------------
// ENDPOINTS
// -----------------------------------------------------------------------------

pub async fn list_electoral_results(
    auth: AuthUser,
    Query(params): Query<ResultsFilterParams>,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<ElectoralResultDTO>>, AppError> {
    let year = params.year.unwrap_or(2024);
    let election_type = params.election_type.unwrap_or_else(|| "Gobernador".to_string());

    let results = sqlx::query_as::<_, ElectoralResultDTO>(
        r#"
        SELECT id, state_id, election_year, election_type, clave_seccion, clave_municipio,
               lista_nominal, total_votos, 
               participacion_pct::float8 as participacion_pct,
               ganador_partido, ganador_votos,
               ganador_pct::float8 as ganador_pct,
               segundo_partido, segundo_votos,
               segundo_pct::float8 as segundo_pct,
               margen_victoria_pct::float8 as margen_victoria_pct,
               votos_partidos
        FROM electoral_results
        WHERE state_id = $1
          AND election_year = $2
          AND election_type = $3
          AND ($4::int IS NULL OR clave_municipio = $4)
          AND ($5::int IS NULL OR clave_seccion = $5)
        ORDER BY clave_seccion ASC
        "#
    )
    .bind(auth.state_id)
    .bind(year)
    .bind(election_type)
    .bind(params.municipio)
    .bind(params.seccion)
    .fetch_all(&pool)
    .await?;

    Ok(Json(results))
}

pub async fn get_swing_comparison(
    auth: AuthUser,
    Query(params): Query<ComparisonParams>,
    State(pool): State<PgPool>,
) -> Result<Json<serde_json::Value>, AppError> {
    let election_type = params.election_type.unwrap_or_else(|| "Gobernador".to_string());

    let comparison = sqlx::query(
        r#"
        SELECT 
            r1.clave_seccion,
            r1.clave_municipio,
            r1.ganador_partido as ganador_año1,
            r1.ganador_pct::float8 as ganador_pct_año1,
            r2.ganador_partido as ganador_año2,
            r2.ganador_pct::float8 as ganador_pct_año2,
            (r2.ganador_pct - r1.ganador_pct)::float8 as swing_pct,
            (r1.ganador_partido != r2.ganador_partido) as alternancia
        FROM electoral_results r1
        JOIN electoral_results r2 
          ON r1.state_id = r2.state_id 
         AND r1.clave_seccion = r2.clave_seccion 
         AND r1.election_type = r2.election_type
        WHERE r1.state_id = $1
          AND r1.election_year = $2
          AND r2.election_year = $3
          AND r1.election_type = $4
        "#
    )
    .bind(auth.state_id)
    .bind(params.year1)
    .bind(params.year2)
    .bind(election_type)
    .fetch_all(&pool)
    .await?;

    let mut rows = Vec::new();
    for row in comparison {
        use sqlx::Row;
        rows.push(json!({
            "clave_seccion": row.get::<i32, _>("clave_seccion"),
            "clave_municipio": row.get::<i32, _>("clave_municipio"),
            "ganador_año1": row.get::<Option<String>, _>("ganador_año1"),
            "ganador_pct_año1": row.get::<Option<f64>, _>("ganador_pct_año1"),
            "ganador_año2": row.get::<Option<String>, _>("ganador_año2"),
            "ganador_pct_año2": row.get::<Option<f64>, _>("ganador_pct_año2"),
            "swing_pct": row.get::<Option<f64>, _>("swing_pct"),
            "alternancia": row.get::<Option<bool>, _>("alternancia"),
        }));
    }

    Ok(Json(json!(rows)))
}

pub async fn list_gis_events(
    auth: AuthUser,
    Query(params): Query<GisEventsFilterParams>,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<GisEventDTO>>, AppError> {
    let events = sqlx::query_as::<_, GisEventDTO>(
        r#"
        SELECT id, state_id, layer_type, title, description, severity,
               latitude::float8 as latitude, 
               longitude::float8 as longitude,
               clave_seccion, clave_municipio, source, metadata,
               event_timestamp, expires_at, is_active
        FROM gis_events
        WHERE state_id = $1
          AND is_active = TRUE
          AND ($2::text IS NULL OR layer_type = $2)
          AND ($3::text IS NULL OR severity = $3)
          AND ($4::int IS NULL OR clave_seccion = $4)
        ORDER BY event_timestamp DESC
        LIMIT 100
        "#
    )
    .bind(auth.state_id)
    .bind(params.layer_type)
    .bind(params.severity)
    .bind(params.clave_seccion)
    .fetch_all(&pool)
    .await?;

    Ok(Json(events))
}

pub async fn create_gis_event(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateGisEventDTO>,
) -> Result<Json<GisEventDTO>, AppError> {
    auth.require_role(&["analista", "jefe_oficina", "superadmin"])?;

    let event = sqlx::query_as::<_, GisEventDTO>(
        r#"
        INSERT INTO gis_events 
        (state_id, layer_type, title, description, severity, latitude, longitude, clave_seccion, clave_municipio, source, metadata, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, state_id, layer_type, title, description, severity,
                  latitude::float8 as latitude, longitude::float8 as longitude,
                  clave_seccion, clave_municipio, source, metadata,
                  event_timestamp, expires_at, is_active
        "#
    )
    .bind(auth.state_id)
    .bind(&payload.layer_type)
    .bind(&payload.title)
    .bind(&payload.description)
    .bind(payload.severity.as_deref().unwrap_or("medio"))
    .bind(payload.latitude)
    .bind(payload.longitude)
    .bind(payload.clave_seccion)
    .bind(payload.clave_municipio)
    .bind(payload.source.as_deref().unwrap_or("manual_csv"))
    .bind(payload.metadata.unwrap_or_else(|| json!({})))
    .bind(payload.expires_at)
    .fetch_one(&pool)
    .await?;

    Ok(Json(event))
}
