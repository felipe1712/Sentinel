use axum::{
    extract::{Path, Query, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;
use crate::{
    auth::middleware::AuthUser,
    error::AppError,
    models::{State as StateModel, UserDTO},
};

pub async fn list_states(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<StateModel>>, AppError> {
    auth.require_role(&["superadmin"])?;

    let states = sqlx::query_as::<_, StateModel>("SELECT * FROM states ORDER BY name ASC")
        .fetch_all(&pool)
        .await?;

    Ok(Json(states))
}

pub async fn list_users(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<UserDTO>>, AppError> {
    auth.require_role(&["jefe_oficina", "superadmin"])?;

    let users = sqlx::query_as::<_, UserDTO>(
        "SELECT id, state_id, email, role, name, cargo, active, last_login FROM users WHERE state_id = $1 ORDER BY name ASC"
    )
    .bind(auth.state_id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(users))
}

// -----------------------------------------------------------------------------
// QUERY AUDIT ENDPOINTS
// -----------------------------------------------------------------------------

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct QueryAuditRecord {
    pub id: Uuid,
    pub state_id: Uuid,
    pub user_id: Option<Uuid>,
    pub query_type: String,
    pub prompt_text: String,
    pub model: Option<String>,
    pub tools_used: Option<Vec<String>>,
    pub sources: serde_json::Value,
    pub confidence_score: Option<i32>,
    pub hallucination_flag: Option<bool>,
    pub hallucination_note: Option<String>,
    pub tokens_used: Option<i32>,
    pub latency_ms: Option<i32>,
    pub result_summary: Option<String>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateQueryAuditDTO {
    pub state_id: Uuid,
    pub user_id: Option<Uuid>,
    pub query_type: String,
    pub prompt_text: String,
    pub model: Option<String>,
    pub tools_used: Option<Vec<String>>,
    pub sources: serde_json::Value,
    pub confidence_score: Option<i32>,
    pub hallucination_flag: Option<bool>,
    pub hallucination_note: Option<String>,
    pub tokens_used: Option<i32>,
    pub latency_ms: Option<i32>,
    pub result_summary: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct AuditFilterParams {
    pub query_type: Option<String>,
    pub hallucination_flag: Option<bool>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct AuditStatsDTO {
    pub total_hoy: i64,
    pub verificadas: i64,
    pub con_advertencia: i64,
    pub sin_fuente: i64,
    pub confianza_promedio: f64,
    pub tokens_totales_hoy: i64,
    pub alertas_alucinacion_hoy: i64,
}

#[derive(sqlx::FromRow)]
struct RawAuditStats {
    pub total_hoy: Option<i64>,
    pub verificadas: Option<i64>,
    pub con_advertencia: Option<i64>,
    pub sin_fuente: Option<i64>,
    pub confianza_promedio: Option<f64>,
    pub tokens_totales: Option<i64>,
    pub alertas_alucinacion: Option<i64>,
}

pub async fn create_query_audit(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateQueryAuditDTO>,
) -> Result<StatusCode, AppError> {
    let service_token = headers.get("X-Service-Token")
        .or_else(|| headers.get("Authorization"))
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    if !service_token.contains("sentineliq_internal_service_token") && !service_token.contains("Bearer") {
        return Err(AppError::Auth("Token de servicio no autorizado".to_string()));
    }

    sqlx::query(
        r#"
        INSERT INTO query_audit 
        (state_id, user_id, query_type, prompt_text, model, tools_used, sources, confidence_score, hallucination_flag, hallucination_note, tokens_used, latency_ms, result_summary)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        "#
    )
    .bind(payload.state_id)
    .bind(payload.user_id)
    .bind(&payload.query_type)
    .bind(&payload.prompt_text)
    .bind(payload.model.as_deref().unwrap_or("claude-sonnet-4-6"))
    .bind(&payload.tools_used.unwrap_or_default()[..])
    .bind(&payload.sources)
    .bind(payload.confidence_score.unwrap_or(0))
    .bind(payload.hallucination_flag.unwrap_or(false))
    .bind(&payload.hallucination_note)
    .bind(payload.tokens_used.unwrap_or(0))
    .bind(payload.latency_ms.unwrap_or(0))
    .bind(&payload.result_summary)
    .execute(&pool)
    .await?;

    Ok(StatusCode::CREATED)
}

pub async fn list_query_audits(
    auth: AuthUser,
    Query(params): Query<AuditFilterParams>,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<QueryAuditRecord>>, AppError> {
    auth.require_role(&["jefe_oficina", "superadmin"])?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * per_page;

    let records = sqlx::query_as::<_, QueryAuditRecord>(
        r#"
        SELECT id, state_id, user_id, query_type, prompt_text, model, tools_used, sources, confidence_score, hallucination_flag, hallucination_note, tokens_used, latency_ms, result_summary, created_at
        FROM query_audit
        WHERE state_id = $1
          AND ($2::text IS NULL OR query_type = $2)
          AND ($3::boolean IS NULL OR hallucination_flag = $3)
        ORDER BY created_at DESC
        LIMIT $4 OFFSET $5
        "#
    )
    .bind(auth.state_id)
    .bind(params.query_type)
    .bind(params.hallucination_flag)
    .bind(per_page)
    .bind(offset)
    .fetch_all(&pool)
    .await?;

    Ok(Json(records))
}

pub async fn get_query_audit_stats(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<AuditStatsDTO>, AppError> {
    auth.require_role(&["jefe_oficina", "superadmin"])?;

    let row = sqlx::query_as::<_, RawAuditStats>(
        r#"
        SELECT 
            COUNT(*) as total_hoy,
            COUNT(*) FILTER (WHERE confidence_score >= 75) as verificadas,
            COUNT(*) FILTER (WHERE confidence_score BETWEEN 50 AND 74) as con_advertencia,
            COUNT(*) FILTER (WHERE jsonb_array_length(sources) = 0) as sin_fuente,
            COALESCE(AVG(confidence_score), 0)::float8 as confianza_promedio,
            COALESCE(SUM(tokens_used), 0)::int8 as tokens_totales,
            COUNT(*) FILTER (WHERE hallucination_flag = true) as alertas_alucinacion
        FROM query_audit
        WHERE state_id = $1 AND created_at >= NOW() - INTERVAL '24 hours'
        "#
    )
    .bind(auth.state_id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(AuditStatsDTO {
        total_hoy: row.total_hoy.unwrap_or(0),
        verificadas: row.verificadas.unwrap_or(0),
        con_advertencia: row.con_advertencia.unwrap_or(0),
        sin_fuente: row.sin_fuente.unwrap_or(0),
        confianza_promedio: row.confianza_promedio.unwrap_or(0.0),
        tokens_totales_hoy: row.tokens_totales.unwrap_or(0),
        alertas_alucinacion_hoy: row.alertas_alucinacion.unwrap_or(0),
    }))
}

pub async fn get_query_audit_by_id(
    auth: AuthUser,
    Path(id): Path<Uuid>,
    State(pool): State<PgPool>,
) -> Result<Json<QueryAuditRecord>, AppError> {
    auth.require_role(&["jefe_oficina", "superadmin"])?;

    let record = sqlx::query_as::<_, QueryAuditRecord>(
        r#"
        SELECT id, state_id, user_id, query_type, prompt_text, model, tools_used, sources, confidence_score, hallucination_flag, hallucination_note, tokens_used, latency_ms, result_summary, created_at
        FROM query_audit
        WHERE id = $1 AND state_id = $2
        "#
    )
    .bind(id)
    .bind(auth.state_id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(record))
}
