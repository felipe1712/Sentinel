use chrono::{DateTime, NaiveDate, NaiveTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ColoniaRow {
    pub id: Uuid,
    pub cve_colonia: String,
    pub nombre: String,
    pub alcaldia: String,
    pub cve_alcaldia: String,
    pub polygon: Value,
    pub centroid_lat: Option<f64>,
    pub centroid_lng: Option<f64>,
    pub poblacion: Option<i32>,
    pub nivel_riesgo: Option<String>,
    pub incidentes_count: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct IncidenteRow {
    pub id: Uuid,
    pub colonia_id: Option<Uuid>,
    pub colonia_nombre: Option<String>,
    pub alcaldia: String,
    pub tipo_incidente: String,
    pub subtipo: Option<String>,
    pub fuente_tipo: String,
    pub fuente_id: Option<Uuid>,
    pub fuente_nombre: Option<String>,
    pub document_id: Option<Uuid>,
    pub titulo: Option<String>,
    pub descripcion: Option<String>,
    pub fecha_incidente: NaiveDate,
    pub hora_incidente: Option<NaiveTime>,
    pub lat: Option<f64>,
    pub lng: Option<f64>,
    pub ubicacion_texto: Option<String>,
    pub nivel_conf: Option<String>,
    pub severidad: Option<i32>,
    pub verificado: Option<bool>,
    pub actores: Option<Vec<String>>,
    pub victimas_count: Option<i32>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ActorRow {
    pub id: Uuid,
    pub nombre: String,
    pub aliases: Option<Vec<String>>,
    pub tipo: Option<String>,
    pub colonias_activas: Option<Vec<Uuid>>,
    pub nivel_amenaza: Option<i32>,
    pub descripcion: Option<String>,
    pub fuente_primera: Option<String>,
    pub activo: Option<bool>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct EmediosJobRow {
    pub id: Uuid,
    pub fecha_inicio: NaiveDate,
    pub fecha_fin: NaiveDate,
    pub terminos: Vec<String>,
    pub publicaciones: Option<Vec<String>>,
    pub articulos_total: Option<i32>,
    pub articulos_proc: Option<i32>,
    pub articulos_ok: Option<i32>,
    pub articulos_error: Option<i32>,
    pub checkpoint: Option<Value>,
    pub status: Option<String>,
    pub modo_ingesta: Option<String>,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct EmediosArticuloRow {
    pub id: Uuid,
    pub job_id: Option<Uuid>,
    pub emedio_id: Option<String>,
    pub titulo: Option<String>,
    pub publicacion: Option<String>,
    pub fecha_pub: Option<NaiveDate>,
    pub url_original: Option<String>,
    pub contenido_raw: Option<String>,
    pub hash_titulo: String,
    pub procesado: Option<bool>,
    pub incidente_id: Option<Uuid>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct SitioMiraRow {
    pub id: Uuid,
    pub url: String,
    pub tipo: Option<String>,
    pub nombre: Option<String>,
    pub descripcion: Option<String>,
    pub keywords: Option<Vec<String>>,
    pub browser_engine: Option<String>,
    pub frecuencia_hrs: Option<i32>,
    pub ultima_captura: Option<DateTime<Utc>>,
    pub ultimo_cambio: Option<DateTime<Utc>>,
    pub activo: Option<bool>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct CapturaRow {
    pub id: Uuid,
    pub sitio_id: Option<Uuid>,
    pub screenshot_path: Option<String>,
    pub pixelrag_index: Option<String>,
    pub contenido_texto: Option<String>,
    pub diff_pct: Option<f64>,
    pub cambio_detectado: Option<bool>,
    pub cambio_descripcion: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ResumenRow {
    pub id: Uuid,
    pub tipo: Option<String>,
    pub fecha_ref: Option<NaiveDate>,
    pub colonia_id: Option<Uuid>,
    pub alcaldia: Option<String>,
    pub titulo: Option<String>,
    pub resumen: String,
    pub puntos_clave: Option<Value>,
    pub nivel_alerta: Option<String>,
    pub tokens_usados: Option<i32>,
    pub fuentes_count: Option<i32>,
    pub worldmonitor_data: Option<Value>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct AuditRow {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub accion: String,
    pub recurso: Option<String>,
    pub nivel_conf_accedido: Option<String>,
    pub fuentes_json: Option<Value>,
    pub tokens_usados: Option<i32>,
    pub confianza_pct: Option<i32>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct DocumentRow {
    pub id: Uuid,
    pub source_id: Option<Uuid>,
    pub titulo: Option<String>,
    pub file_path: Option<String>,
    pub file_type: Option<String>,
    pub fecha_publicacion: Option<NaiveDate>,
    pub modo_ingesta: Option<String>,
    pub status: Option<String>,
    pub ocr_text: Option<String>,
    pub error_msg: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}
