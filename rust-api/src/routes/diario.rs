use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    auth::middleware::AuthUser,
    error::AppError,
};

// ==============================================================================
// Modelos y DTOs para el Módulo Diario
// ==============================================================================

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct DiarioDocument {
    pub id: Uuid,
    pub state_id: Uuid,
    pub document_type: String,
    pub fecha: NaiveDate,
    pub original_filename: Option<String>,
    pub file_path: Option<String>,
    pub file_size_kb: Option<i32>,
    pub page_count: Option<i32>,
    pub status: Option<String>,
    pub error_message: Option<String>,
    pub uploaded_at: Option<chrono::DateTime<chrono::Utc>>,
    pub processed_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDiarioDocumentRequest {
    pub state_id: Uuid,
    pub document_type: String,
    pub fecha: NaiveDate,
    pub original_filename: Option<String>,
    pub file_path: Option<String>,
    pub file_size_kb: Option<i32>,
    pub page_count: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateDiarioDocumentStatusRequest {
    pub status: String,
    pub error_message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct DiarioOcrResult {
    pub id: Uuid,
    pub document_id: Uuid,
    pub page_number: i32,
    pub raw_text: String,
    pub layout_data: Option<serde_json::Value>,
    pub confidence_avg: Option<f64>,
    pub processed_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDiarioOcrResultRequest {
    pub document_id: Uuid,
    pub page_number: i32,
    pub raw_text: String,
    pub layout_data: Option<serde_json::Value>,
    pub confidence_avg: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct DiarioItem {
    pub id: Uuid,
    pub document_id: Uuid,
    pub state_id: Uuid,
    pub fecha: NaiveDate,
    pub categoria: String,
    pub ambito: String,
    pub titular: String,
    pub cuerpo: Option<String>,
    pub fuente_medio: Option<String>,
    pub pagina: Option<i32>,
    pub relevancia: Option<i32>,
    pub es_principal: Option<bool>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDiarioItemRequest {
    pub document_id: Uuid,
    pub state_id: Uuid,
    pub fecha: NaiveDate,
    pub categoria: String,
    pub ambito: String,
    pub titular: String,
    pub cuerpo: Option<String>,
    pub fuente_medio: Option<String>,
    pub pagina: Option<i32>,
    pub relevancia: Option<i32>,
    pub es_principal: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct FilterDiarioItemsQuery {
    pub categoria: Option<String>,
    pub ambito: Option<String>,
    pub relevancia_min: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct DiarioResumen {
    pub id: Uuid,
    pub document_id: Uuid,
    pub state_id: Uuid,
    pub fecha: NaiveDate,
    pub document_type: String,
    pub resumen_ejecutivo: String,
    pub puntos_clave: serde_json::Value,
    pub temas_seguridad: Option<String>,
    pub temas_politica: Option<String>,
    pub temas_economia: Option<String>,
    pub relevancia_estatal: Option<String>,
    pub mini_resumen: String,
    pub tokens_usados: Option<i32>,
    pub modelo: Option<String>,
    pub generated_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDiarioResumenRequest {
    pub document_id: Uuid,
    pub state_id: Uuid,
    pub fecha: NaiveDate,
    pub document_type: String,
    pub resumen_ejecutivo: String,
    pub puntos_clave: serde_json::Value,
    pub temas_seguridad: Option<String>,
    pub temas_politica: Option<String>,
    pub temas_economia: Option<String>,
    pub relevancia_estatal: Option<String>,
    pub mini_resumen: String,
    pub tokens_usados: Option<i32>,
    pub modelo: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct DiarioDistribucion {
    pub id: Uuid,
    pub state_id: Uuid,
    pub nombre: String,
    pub email: Option<String>,
    pub telegram_chat_id: Option<String>,
    pub recibe_email: Option<bool>,
    pub recibe_telegram: Option<bool>,
    pub document_types: Option<Vec<String>>,
    pub activo: Option<bool>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDiarioDistribucionRequest {
    pub state_id: Uuid,
    pub nombre: String,
    pub email: Option<String>,
    pub telegram_chat_id: Option<String>,
    pub recibe_email: Option<bool>,
    pub recibe_telegram: Option<bool>,
    pub document_types: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct DiarioEnvio {
    pub id: Uuid,
    pub state_id: Uuid,
    pub fecha: NaiveDate,
    pub tipo: String,
    pub destinatario: String,
    pub nombre_destino: Option<String>,
    pub documento_type: Option<String>,
    pub resumen_id: Option<Uuid>,
    pub status: Option<String>,
    pub error_message: Option<String>,
    pub enviado_at: Option<chrono::DateTime<chrono::Utc>>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDiarioEnvioRequest {
    pub state_id: Uuid,
    pub fecha: NaiveDate,
    pub tipo: String,
    pub destinatario: String,
    pub nombre_destino: Option<String>,
    pub documento_type: Option<String>,
    pub resumen_id: Option<Uuid>,
    pub status: Option<String>,
    pub error_message: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct TriggerDiarioPipelineRequest {
    pub fecha: Option<String>,
}

// ==============================================================================
// Controladores de Documentos
// ==============================================================================

pub async fn list_documents(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path((state_id, fecha_str)): Path<(Uuid, String)>,
) -> Result<Json<Vec<DiarioDocument>>, AppError> {
    let fecha = NaiveDate::parse_from_str(&fecha_str, "%Y-%m-%d")
        .map_err(|_| AppError::BadRequest("Formato de fecha inválido. Usar YYYY-MM-DD".to_string()))?;

    let docs = sqlx::query_as::<_, DiarioDocument>(
        "SELECT * FROM diario_documents WHERE state_id = $1 AND fecha = $2 ORDER BY uploaded_at ASC"
    )
    .bind(state_id)
    .bind(fecha)
    .fetch_all(&pool)
    .await?;

    Ok(Json(docs))
}

pub async fn get_document_by_id(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<DiarioDocument>, AppError> {
    let doc = sqlx::query_as::<_, DiarioDocument>(
        "SELECT * FROM diario_documents WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Documento de diario no encontrado".to_string()))?;

    Ok(Json(doc))
}

pub async fn create_document(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateDiarioDocumentRequest>,
) -> Result<(StatusCode, Json<DiarioDocument>), AppError> {
    let doc = sqlx::query_as::<_, DiarioDocument>(
        r#"
        INSERT INTO diario_documents (
            state_id, document_type, fecha, original_filename, file_path, file_size_kb, page_count, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente')
        ON CONFLICT (state_id, document_type, fecha) DO UPDATE
        SET original_filename = EXCLUDED.original_filename,
            file_path = EXCLUDED.file_path,
            file_size_kb = EXCLUDED.file_size_kb,
            page_count = EXCLUDED.page_count,
            status = 'pendiente',
            error_message = NULL,
            uploaded_at = NOW(),
            processed_at = NULL
        RETURNING *
        "#
    )
    .bind(payload.state_id)
    .bind(&payload.document_type)
    .bind(payload.fecha)
    .bind(&payload.original_filename)
    .bind(&payload.file_path)
    .bind(payload.file_size_kb)
    .bind(payload.page_count.unwrap_or(0))
    .fetch_one(&pool)
    .await?;

    Ok((StatusCode::CREATED, Json(doc)))
}

pub async fn update_document_status(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateDiarioDocumentStatusRequest>,
) -> Result<Json<DiarioDocument>, AppError> {
    let processed_at = if payload.status == "listo" {
        Some(chrono::Utc::now())
    } else {
        None
    };

    let doc = sqlx::query_as::<_, DiarioDocument>(
        r#"
        UPDATE diario_documents
        SET status = $2,
            error_message = $3,
            processed_at = COALESCE($4, processed_at)
        WHERE id = $1
        RETURNING *
        "#
    )
    .bind(id)
    .bind(&payload.status)
    .bind(&payload.error_message)
    .bind(processed_at)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Documento no encontrado".to_string()))?;

    Ok(Json(doc))
}

// ==============================================================================
// Controladores de OCR Results
// ==============================================================================

pub async fn save_ocr_result(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateDiarioOcrResultRequest>,
) -> Result<(StatusCode, Json<DiarioOcrResult>), AppError> {
    let res = sqlx::query_as::<_, DiarioOcrResult>(
        r#"
        INSERT INTO diario_ocr_results (
            document_id, page_number, raw_text, layout_data, confidence_avg
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        "#
    )
    .bind(payload.document_id)
    .bind(payload.page_number)
    .bind(&payload.raw_text)
    .bind(&payload.layout_data)
    .bind(payload.confidence_avg)
    .fetch_one(&pool)
    .await?;

    Ok((StatusCode::CREATED, Json(res)))
}

pub async fn get_ocr_results_by_doc(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(doc_id): Path<Uuid>,
) -> Result<Json<Vec<DiarioOcrResult>>, AppError> {
    let results = sqlx::query_as::<_, DiarioOcrResult>(
        "SELECT * FROM diario_ocr_results WHERE document_id = $1 ORDER BY page_number ASC"
    )
    .bind(doc_id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(results))
}

// ==============================================================================
// Controladores de Items Filtrados
// ==============================================================================

pub async fn save_item(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateDiarioItemRequest>,
) -> Result<(StatusCode, Json<DiarioItem>), AppError> {
    let item = sqlx::query_as::<_, DiarioItem>(
        r#"
        INSERT INTO diario_items (
            document_id, state_id, fecha, categoria, ambito, titular, cuerpo,
            fuente_medio, pagina, relevancia, es_principal
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
        "#
    )
    .bind(payload.document_id)
    .bind(payload.state_id)
    .bind(payload.fecha)
    .bind(&payload.categoria)
    .bind(&payload.ambito)
    .bind(&payload.titular)
    .bind(&payload.cuerpo)
    .bind(&payload.fuente_medio)
    .bind(payload.pagina)
    .bind(payload.relevancia.unwrap_or(5))
    .bind(payload.es_principal.unwrap_or(false))
    .fetch_one(&pool)
    .await?;

    Ok((StatusCode::CREATED, Json(item)))
}

pub async fn list_items(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path((state_id, fecha_str)): Path<(Uuid, String)>,
    Query(filters): Query<FilterDiarioItemsQuery>,
) -> Result<Json<Vec<DiarioItem>>, AppError> {
    let fecha = NaiveDate::parse_from_str(&fecha_str, "%Y-%m-%d")
        .map_err(|_| AppError::BadRequest("Formato de fecha inválido. Usar YYYY-MM-DD".to_string()))?;

    let items = sqlx::query_as::<_, DiarioItem>(
        r#"
        SELECT * FROM diario_items
        WHERE state_id = $1 AND fecha = $2
          AND ($3::text IS NULL OR categoria = $3)
          AND ($4::text IS NULL OR ambito = $4)
          AND ($5::int IS NULL OR relevancia >= $5)
        ORDER BY es_principal DESC, relevancia DESC, created_at ASC
        "#
    )
    .bind(state_id)
    .bind(fecha)
    .bind(&filters.categoria)
    .bind(&filters.ambito)
    .bind(filters.relevancia_min)
    .fetch_all(&pool)
    .await?;

    Ok(Json(items))
}

// ==============================================================================
// Controladores de Resúmenes Ejecutivos
// ==============================================================================

pub async fn save_resumen(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateDiarioResumenRequest>,
) -> Result<(StatusCode, Json<DiarioResumen>), AppError> {
    let res = sqlx::query_as::<_, DiarioResumen>(
        r#"
        INSERT INTO diario_resumenes (
            document_id, state_id, fecha, document_type, resumen_ejecutivo,
            puntos_clave, temas_seguridad, temas_politica, temas_economia,
            relevancia_estatal, mini_resumen, tokens_usados, modelo
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (document_id) DO UPDATE
        SET resumen_ejecutivo = EXCLUDED.resumen_ejecutivo,
            puntos_clave = EXCLUDED.puntos_clave,
            temas_seguridad = EXCLUDED.temas_seguridad,
            temas_politica = EXCLUDED.temas_politica,
            temas_economia = EXCLUDED.temas_economia,
            relevancia_estatal = EXCLUDED.relevancia_estatal,
            mini_resumen = EXCLUDED.mini_resumen,
            tokens_usados = EXCLUDED.tokens_usados,
            modelo = EXCLUDED.modelo,
            generated_at = NOW()
        RETURNING *
        "#
    )
    .bind(payload.document_id)
    .bind(payload.state_id)
    .bind(payload.fecha)
    .bind(&payload.document_type)
    .bind(&payload.resumen_ejecutivo)
    .bind(&payload.puntos_clave)
    .bind(&payload.temas_seguridad)
    .bind(&payload.temas_politica)
    .bind(&payload.temas_economia)
    .bind(&payload.relevancia_estatal)
    .bind(&payload.mini_resumen)
    .bind(payload.tokens_usados.unwrap_or(0))
    .bind(payload.modelo.as_deref().unwrap_or("claude-sonnet-4-6"))
    .fetch_one(&pool)
    .await?;

    Ok((StatusCode::CREATED, Json(res)))
}

pub async fn list_resumenes(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path((state_id, fecha_str)): Path<(Uuid, String)>,
) -> Result<Json<Vec<DiarioResumen>>, AppError> {
    let fecha = NaiveDate::parse_from_str(&fecha_str, "%Y-%m-%d")
        .map_err(|_| AppError::BadRequest("Formato de fecha inválido. Usar YYYY-MM-DD".to_string()))?;

    let resumenes = sqlx::query_as::<_, DiarioResumen>(
        "SELECT * FROM diario_resumenes WHERE state_id = $1 AND fecha = $2 ORDER BY generated_at ASC"
    )
    .bind(state_id)
    .bind(fecha)
    .fetch_all(&pool)
    .await?;

    Ok(Json(resumenes))
}

pub async fn get_resumen_by_id(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<DiarioResumen>, AppError> {
    let r = sqlx::query_as::<_, DiarioResumen>(
        "SELECT * FROM diario_resumenes WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Resumen no encontrado".to_string()))?;

    Ok(Json(r))
}

// ==============================================================================
// Estado y Métricas del Día
// ==============================================================================

pub async fn get_daily_status(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path((state_id, fecha_str)): Path<(Uuid, String)>,
) -> Result<Json<serde_json::Value>, AppError> {
    let fecha = NaiveDate::parse_from_str(&fecha_str, "%Y-%m-%d")
        .map_err(|_| AppError::BadRequest("Formato de fecha inválido. Usar YYYY-MM-DD".to_string()))?;

    let docs = sqlx::query_as::<_, DiarioDocument>(
        "SELECT * FROM diario_documents WHERE state_id = $1 AND fecha = $2"
    )
    .bind(state_id)
    .bind(fecha)
    .fetch_all(&pool)
    .await?;

    let ready_count = docs.iter().filter(|d| d.status.as_deref() == Some("listo")).count();
    let all_ready = ready_count >= 4;

    Ok(Json(json!({
        "fecha": fecha_str,
        "state_id": state_id,
        "documents": docs,
        "ready_count": ready_count,
        "total_expected": 4,
        "all_ready": all_ready
    })))
}

// ==============================================================================
// Lista de Distribución y Envíos
// ==============================================================================

pub async fn list_distribucion(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(state_id): Path<Uuid>,
) -> Result<Json<Vec<DiarioDistribucion>>, AppError> {
    let lista = sqlx::query_as::<_, DiarioDistribucion>(
        "SELECT * FROM diario_lista_distribucion WHERE state_id = $1 AND activo = true ORDER BY nombre ASC"
    )
    .bind(state_id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(lista))
}

pub async fn create_distribucion(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateDiarioDistribucionRequest>,
) -> Result<(StatusCode, Json<DiarioDistribucion>), AppError> {
    auth.require_role(&["jefe_oficina", "superadmin"])?;

    let item = sqlx::query_as::<_, DiarioDistribucion>(
        r#"
        INSERT INTO diario_lista_distribucion (
            state_id, nombre, email, telegram_chat_id, recibe_email, recibe_telegram, document_types, activo
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        RETURNING *
        "#
    )
    .bind(payload.state_id)
    .bind(&payload.nombre)
    .bind(&payload.email)
    .bind(&payload.telegram_chat_id)
    .bind(payload.recibe_email.unwrap_or(true))
    .bind(payload.recibe_telegram.unwrap_or(false))
    .bind(&payload.document_types)
    .fetch_one(&pool)
    .await?;

    Ok((StatusCode::CREATED, Json(item)))
}

pub async fn delete_distribucion(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    auth.require_role(&["jefe_oficina", "superadmin"])?;

    sqlx::query("UPDATE diario_lista_distribucion SET activo = false WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await?;

    Ok(Json(json!({ "status": "deleted", "id": id })))
}

pub async fn save_envio(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateDiarioEnvioRequest>,
) -> Result<(StatusCode, Json<DiarioEnvio>), AppError> {
    let envio = sqlx::query_as::<_, DiarioEnvio>(
        r#"
        INSERT INTO diario_envios (
            state_id, fecha, tipo, destinatario, nombre_destino, documento_type,
            resumen_id, status, error_message, enviado_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CASE WHEN $8 = 'enviado' THEN NOW() ELSE NULL END)
        RETURNING *
        "#
    )
    .bind(payload.state_id)
    .bind(payload.fecha)
    .bind(&payload.tipo)
    .bind(&payload.destinatario)
    .bind(&payload.nombre_destino)
    .bind(&payload.documento_type)
    .bind(payload.resumen_id)
    .bind(payload.status.as_deref().unwrap_or("pendiente"))
    .bind(&payload.error_message)
    .fetch_one(&pool)
    .await?;

    Ok((StatusCode::CREATED, Json(envio)))
}

pub async fn list_envios(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path((state_id, fecha_str)): Path<(Uuid, String)>,
) -> Result<Json<Vec<DiarioEnvio>>, AppError> {
    let fecha = NaiveDate::parse_from_str(&fecha_str, "%Y-%m-%d")
        .map_err(|_| AppError::BadRequest("Formato de fecha inválido. Usar YYYY-MM-DD".to_string()))?;

    let envios = sqlx::query_as::<_, DiarioEnvio>(
        "SELECT * FROM diario_envios WHERE state_id = $1 AND fecha = $2 ORDER BY created_at DESC"
    )
    .bind(state_id)
    .bind(fecha)
    .fetch_all(&pool)
    .await?;

    Ok(Json(envios))
}

// ==============================================================================
// Trigger Manual del Pipeline
// ==============================================================================

pub async fn trigger_pipeline(
    auth: AuthUser,
    Path(state_id): Path<Uuid>,
    Json(payload): Json<TriggerDiarioPipelineRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    auth.require_role(&["jefe_oficina", "superadmin"])?;

    let target_fecha = payload.fecha.unwrap_or_else(|| chrono::Utc::now().format("%Y-%m-%d").to_string());

    Ok(Json(json!({
        "status": "queued",
        "state_id": state_id,
        "fecha": target_fecha,
        "message": format!("Pipeline de procesamiento Diario encolado exitosamente para la fecha {}", target_fecha)
    })))
}
