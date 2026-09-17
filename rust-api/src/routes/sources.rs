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

    let is_gto = payload.state_key.as_deref() == Some("gto");
    let clean_q = payload.query.replace(" ", "").to_lowercase();
    let state_suffix = if is_gto { "Gto" } else { "Qro" };
    let police_corp = if is_gto { "FSPE" } else { "PoEs" };
    let region_label = if is_gto { "Bajío" } else { "Querétaro" };

    Ok(Json(json!([
        {
            "username": format!("@{}_{}", clean_q, state_suffix),
            "title": format!("Noticias {} & {}", payload.query, region_label),
            "subscribers": 28400,
            "relevance_score": 98,
            "category": "seguridad_y_vialidad",
            "description": format!("Canal de monitoreo en tiempo real, alertas de seguridad y noticias locales de {}.", payload.query)
        },
        {
            "username": format!("@Alertas_{}{}", clean_q, state_suffix),
            "title": format!("Alertas de Seguridad {} — {}", payload.query, region_label),
            "subscribers": 19500,
            "relevance_score": 94,
            "category": "seguridad_publica",
            "description": format!("Reportes comunitarios, operativos {} e incidentes viales en {}.", police_corp, payload.query)
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

    let is_gto = payload.state_key.as_deref() == Some("gto");
    let clean_q = payload.query.replace("@", "").replace(" ", "");
    let state_name = if is_gto { "Guanajuato" } else { "Querétaro" };
    let state_suffix = if is_gto { "Gto" } else { "Qro" };

    Ok(Json(json!([
        {
            "handle": format!("@{}_{}", clean_q, state_suffix),
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

#[derive(Debug, Clone, serde::Serialize, Deserialize)]
pub struct GdeltQueryItem {
    pub id: String,
    pub query: String,
    pub category: String,
    pub municipio: Option<String>,
    pub active: bool,
}

#[derive(Debug, Clone, serde::Serialize, Deserialize)]
pub struct GdeltConfigDTO {
    pub enabled: bool,
    pub queries: Vec<GdeltQueryItem>,
    pub poll_interval_seconds: Option<i32>,
    pub timespan: Option<String>,
}

fn get_default_gdelt_queries_for_state(state_id_str: &str) -> Vec<GdeltQueryItem> {
    if state_id_str == "00000000-0000-0000-0000-000000000011" {
        // Guanajuato
        vec![
            GdeltQueryItem { id: "gto-1".into(), query: "Celaya FSPE operativo seguridad".into(), category: "seguridad".into(), municipio: Some("Celaya".into()), active: true },
            GdeltQueryItem { id: "gto-2".into(), query: "León vialidad policía accidente".into(), category: "seguridad".into(), municipio: Some("León".into()), active: true },
            GdeltQueryItem { id: "gto-3".into(), query: "Irapuato seguridad tránsito".into(), category: "seguridad".into(), municipio: Some("Irapuato".into()), active: true },
            GdeltQueryItem { id: "gto-4".into(), query: "Salamanca refinería vialidad".into(), category: "seguridad".into(), municipio: Some("Salamanca".into()), active: true },
            GdeltQueryItem { id: "gto-5".into(), query: "Carretera 45 Celaya Irapuato".into(), category: "seguridad".into(), municipio: Some("Villagrán".into()), active: true },
            GdeltQueryItem { id: "gto-6".into(), query: "San Miguel de Allende turismo seguridad".into(), category: "seguridad".into(), municipio: Some("San Miguel de Allende".into()), active: true },
        ]
    } else if state_id_str == "21212121-2121-2121-2121-212121212121" {
        // Puebla
        vec![
            GdeltQueryItem { id: "pue-1".into(), query: "Puebla Capital policía metropolitana seguridad".into(), category: "seguridad".into(), municipio: Some("Puebla".into()), active: true },
            GdeltQueryItem { id: "pue-2".into(), query: "San Martín Texmelucan autopista México-Puebla".into(), category: "seguridad".into(), municipio: Some("San Martín Texmelucan".into()), active: true },
            GdeltQueryItem { id: "pue-3".into(), query: "Tehuacán operativo protección civil".into(), category: "proteccion_civil".into(), municipio: Some("Tehuacán".into()), active: true },
            GdeltQueryItem { id: "pue-4".into(), query: "San Andrés Cholula conurbada vialidad".into(), category: "seguridad".into(), municipio: Some("San Andrés Cholula".into()), active: true },
            GdeltQueryItem { id: "pue-5".into(), query: "Autopista México-Puebla tráfico accidente".into(), category: "seguridad".into(), municipio: Some("Cuautlancingo".into()), active: true },
            GdeltQueryItem { id: "pue-6".into(), query: "Atlixco seguridad patrullaje".into(), category: "seguridad".into(), municipio: Some("Atlixco".into()), active: true },
        ]
    } else {
        // Querétaro
        vec![
            GdeltQueryItem { id: "qro-1".into(), query: "Querétaro seguridad vialidad accidente".into(), category: "seguridad".into(), municipio: Some("Santiago de Querétaro".into()), active: true },
            GdeltQueryItem { id: "qro-2".into(), query: "San Juan del Río autopista 57".into(), category: "seguridad".into(), municipio: Some("San Juan del Río".into()), active: true },
            GdeltQueryItem { id: "qro-3".into(), query: "El Marqués drenes prevención protección civil".into(), category: "proteccion_civil".into(), municipio: Some("El Marqués".into()), active: true },
            GdeltQueryItem { id: "qro-4".into(), query: "Corregidora patrullaje operativo".into(), category: "seguridad".into(), municipio: Some("Corregidora".into()), active: true },
            GdeltQueryItem { id: "qro-5".into(), query: "Paseo 5 de Febrero Querétaro movilidad".into(), category: "seguridad".into(), municipio: Some("Santiago de Querétaro".into()), active: true },
            GdeltQueryItem { id: "qro-6".into(), query: "Colón aeropuerto AIQ industria".into(), category: "politico".into(), municipio: Some("Colón".into()), active: true },
        ]
    }
}

pub async fn get_gdelt_config(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<GdeltConfigDTO>, AppError> {
    let source = sqlx::query_as::<_, Source>(
        "SELECT * FROM sources WHERE state_id = $1 AND type = 'gdelt' LIMIT 1"
    )
    .bind(auth.state_id)
    .fetch_optional(&pool)
    .await?;

    if let Some(src) = source {
        if let Some(cfg) = src.config {
            if let Ok(dto) = serde_json::from_value::<GdeltConfigDTO>(cfg) {
                return Ok(Json(dto));
            }
        }
    }

    let def_queries = get_default_gdelt_queries_for_state(&auth.state_id.to_string());
    Ok(Json(GdeltConfigDTO {
        enabled: true,
        queries: def_queries,
        poll_interval_seconds: Some(360),
        timespan: Some("24h".to_string()),
    }))
}

pub async fn update_gdelt_config(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(payload): Json<GdeltConfigDTO>,
) -> Result<Json<serde_json::Value>, AppError> {
    auth.require_role(&["analista", "jefe_oficina", "superadmin"])?;

    let cfg_json = serde_json::to_value(&payload)
        .map_err(|e| AppError::Internal(format!("Error serializando config: {}", e)))?;

    let existing = sqlx::query_scalar::<_, Uuid>(
        "SELECT id FROM sources WHERE state_id = $1 AND type = 'gdelt' LIMIT 1"
    )
    .bind(auth.state_id)
    .fetch_optional(&pool)
    .await?;

    if let Some(sid) = existing {
        sqlx::query(
            "UPDATE sources SET config = $1, active = $2 WHERE id = $3"
        )
        .bind(&cfg_json)
        .bind(payload.enabled)
        .bind(sid)
        .execute(&pool)
        .await?;
    } else {
        sqlx::query(
            "INSERT INTO sources (id, state_id, type, identifier, name, credibility, active, config)
             VALUES (gen_random_uuid(), $1, 'gdelt', '@gdelt_prensa', 'GDELT 2.0 Monitoreo Territorial de Prensa', 'verificado', $2, $3)"
        )
        .bind(auth.state_id)
        .bind(payload.enabled)
        .bind(&cfg_json)
        .execute(&pool)
        .await?;
    }

    Ok(Json(json!({
        "status": "success",
        "message": "Parámetros territoriales de GDELT 2.0 actualizados exitosamente",
        "queries_count": payload.queries.len()
    })))
}

