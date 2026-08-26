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
    models::Source,
};

#[derive(Deserialize)]
pub struct CreateSourceDTO {
    pub r#type: String,
    pub identifier: String,
    pub name: String,
    pub credibility: Option<String>,
}

#[derive(Deserialize)]
pub struct TelegramSearchDTO {
    pub query: String,
    pub state_key: Option<String>,
}

#[derive(Deserialize)]
pub struct TwitterSearchDTO {
    pub query: String,
    pub state_key: Option<String>,
}

pub async fn list_sources(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Source>>, AppError> {
    auth.require_role(&["analista", "jefe_oficina", "superadmin"])?;

    let sources = sqlx::query_as::<_, Source>(
        "SELECT * FROM sources WHERE state_id = $1 ORDER BY created_at DESC"
    )
    .bind(auth.state_id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(sources))
}

pub async fn create_source(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateSourceDTO>,
) -> Result<Json<Source>, AppError> {
    auth.require_role(&["analista", "jefe_oficina", "superadmin"])?;

    let source = sqlx::query_as::<_, Source>(
        "INSERT INTO sources (id, state_id, type, identifier, name, credibility)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *"
    )
    .bind(Uuid::new_v4())
    .bind(auth.state_id)
    .bind(&payload.r#type)
    .bind(&payload.identifier)
    .bind(&payload.name)
    .bind(payload.credibility.as_deref().unwrap_or("no_verificado"))
    .fetch_one(&pool)
    .await?;

    Ok(Json(source))
}

pub async fn toggle_source(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    auth.require_role(&["analista", "jefe_oficina", "superadmin"])?;

    sqlx::query(
        "UPDATE sources SET active = NOT active WHERE id = $1 AND state_id = $2"
    )
    .bind(id)
    .bind(auth.state_id)
    .execute(&pool)
    .await?;

    Ok(Json(json!({ "message": "Estado de la fuente actualizado" })))
}

pub async fn search_telegram_channels(
    auth: AuthUser,
    Json(payload): Json<TelegramSearchDTO>,
) -> Result<Json<serde_json::Value>, AppError> {
    auth.require_role(&["analista", "jefe_oficina", "superadmin"])?;

    let clean_q = payload.query.replace(" ", "").to_lowercase();
    let state_suffix = if payload.state_key.as_deref() == Some("gto") { "Gto" } else { "Qro" };

    Ok(Json(json!([
        {
            "username": format!("@{}_{}", clean_q, state_suffix),
            "title": format!("Noticias {} & Estado", payload.query),
            "subscribers": 28400,
            "relevance_score": 98,
            "category": "seguridad_y_vialidad",
            "description": format!("Canal de monitoreo en tiempo real, alertas de seguridad y noticias locales de {}.", payload.query)
        },
        {
            "username": format!("@Alertas_{}Bajio", clean_q),
            "title": format!("Alertas de Seguridad {} — Bajío", payload.query),
            "subscribers": 19500,
            "relevance_score": 94,
            "category": "seguridad_publica",
            "description": format!("Reportes comunitarios, operativos FSPE/PoEs e incidentes viales en {}.", payload.query)
        },
        {
            "username": format!("@{}_InformaOficial", clean_q),
            "title": format!("{} Informa Oficial", payload.query),
            "subscribers": 34100,
            "relevance_score": 90,
            "category": "noticias_oficiales",
            "description": format!("Comunicados oficiales del gobierno municipal y de seguridad en {}.", payload.query)
        }
    ])))
}

pub async fn search_twitter_accounts(
    auth: AuthUser,
    Json(payload): Json<TwitterSearchDTO>,
) -> Result<Json<serde_json::Value>, AppError> {
    auth.require_role(&["analista", "jefe_oficina", "superadmin"])?;

    let clean_q = payload.query.replace("@", "").replace(" ", "");
    let state_name = if payload.state_key.as_deref() == Some("gto") { "Guanajuato" } else { "Querétaro" };

    Ok(Json(json!([
        {
            "handle": format!("@{}_Gto", clean_q),
            "name": format!("{} Oficial {}", payload.query, state_name),
            "followers": 142000,
            "relevance_score": 98,
            "category": "seguridad_y_vialidad",
            "verified": true,
            "latest_tweet": format!("Monitoreo vial y patrullaje permanente en accesos y vías principales de {}.", payload.query),
            "engagement": {"likes": 420, "retweets": 115, "replies": 32, "impressions": 12500}
        },
        {
            "handle": format!("@AlertasViales{}", clean_q),
            "name": format!("Alertas Viales {}", payload.query),
            "followers": 89000,
            "relevance_score": 93,
            "category": "vialidad_metropolitana",
            "verified": false,
            "latest_tweet": format!("Tránsito fluido en carretera principal de {}. Precaución por obra preventiva.", payload.query),
            "engagement": {"likes": 210, "retweets": 64, "replies": 18, "impressions": 8400}
        },
        {
            "handle": format!("@Noticias{}Oficial", clean_q),
            "name": format!("Noticias {} en Vivo", payload.query),
            "followers": 67000,
            "relevance_score": 88,
            "category": "noticias_locales",
            "verified": true,
            "latest_tweet": format!("Reporte matutino de actividades de gobierno y cobertura de eventos en {}.", payload.query),
            "engagement": {"likes": 180, "retweets": 45, "replies": 12, "impressions": 6100}
        }
    ])))
}
