use axum::{
    routing::{get, patch, post},
    Router,
};
use sqlx::PgPool;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

use crate::{config::Config, handlers};

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub config: Arc<Config>,
}

pub fn create_router(pool: PgPool, config: Arc<Config>) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let state = AppState { pool, config };

    Router::new()
        // Health
        .route("/api/health", get(handlers::health))
        // Colonias
        .route("/api/colonias", get(handlers::list_colonias))
        .route("/api/colonias/geojson", get(handlers::colonias_geojson))
        .route("/api/colonias/:colonia_id", get(handlers::colonia_detalle))
        // Incidentes (Regla R3: fecha_incidente, Regla R4: niveles confidencialidad)
        .route("/api/incidentes/geo", get(handlers::incidentes_geo))
        .route("/api/incidentes/heatmap-temporal", get(handlers::heatmap_temporal))
        .route("/api/incidentes/:inc_id", get(handlers::incidente_detalle))
        .route("/api/incidentes", post(handlers::crear_incidente))
        // Actores criminales y grafo Cytoscape.js
        .route("/api/actores", get(handlers::list_actores))
        .route("/api/actores/graph", get(handlers::actores_graph))
        // Documentos / Carga manual (Regla R5: modo_ingesta)
        .route("/api/documents", get(handlers::list_documents))
        .route("/api/documents/upload-preview", post(handlers::upload_preview))
        .route("/api/documents/confirm/:token", post(handlers::confirm_insert))
        // E-Medios Jobs (Reglas R2 y R6)
        .route("/api/emedios/jobs", get(handlers::list_jobs).post(handlers::create_job))
        .route("/api/emedios/jobs/:job_id/pause", patch(handlers::pause_job))
        .route("/api/emedios/jobs/:job_id/resume", patch(handlers::resume_job))
        .route("/api/emedios/articulos", get(handlers::list_articulos))
        // Módulo Vigía (HeadlessX + PixelRAG)
        .route("/api/vigia/sitios", get(handlers::list_sitios).post(handlers::add_sitio))
        .route("/api/vigia/sitios/:sitio_id/capture", post(handlers::trigger_capture))
        .route("/api/vigia/capturas/:sitio_id", get(handlers::list_capturas))
        // Resúmenes ejecutivos Claude + WorldMonitor MCP
        .route("/api/resumenes", get(handlers::list_resumenes))
        .route("/api/resumenes/generar", post(handlers::generar_resumen))
        .route("/api/resumenes/:tipo/:ref_id", get(handlers::get_resumen))
        // Admin
        .route("/api/admin/skills-status", get(handlers::skills_status))
        .route("/api/admin/cobertura-historica", get(handlers::cobertura_historica))
        .route("/api/admin/audit", get(handlers::list_audit))
        .layer(cors)
        .with_state(state)
}
