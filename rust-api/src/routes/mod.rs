pub mod admin;
pub mod auth;
pub mod briefings;
pub mod cabinet;
pub mod diario;
pub mod dossiers;
pub mod events;
pub mod gis;
pub mod intel;
pub mod municipios;
pub mod narratives;
pub mod profiles;
pub mod reports;
pub mod sources;
pub mod spiderfoot;

use axum::{
    routing::{delete, get, patch, post},
    Router,
};
use sqlx::PgPool;
use tower_http::cors::{Any, CorsLayer};

pub fn create_router(pool: PgPool) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        // Health
        .route("/health", get(|| async { "OK - SentinelIQ Rust API" }))
        // Auth
        .route("/auth/login", post(auth::login))
        // Briefings
        .route("/briefings", get(briefings::list_briefings))
        .route("/briefings/today", get(briefings::get_today_briefing))
        .route("/briefings/:date", get(briefings::get_briefing_by_date))
        .route("/briefings/generate", post(briefings::generate_briefing_trigger))
        .route("/briefings/:id/deliver", post(briefings::deliver_briefing))
        // Events
        .route("/events", get(events::list_events).post(events::create_event))
        .route("/events/stream", get(events::sse_events_stream))
        .route("/events/:id", get(events::get_event))
        // WebGIS Electoral Routes
        .route("/gis/results", get(gis::list_electoral_results))
        .route("/gis/comparison", get(gis::get_swing_comparison))
        .route("/gis/events", get(gis::list_gis_events).post(gis::create_gis_event))
        // Módulo Diario (Prensa OCR + Resumen Ejecutivo + Distribución)
        .route("/diario/documents/:state_id/:fecha", get(diario::list_documents))
        .route("/diario/documents/:id", get(diario::get_document_by_id))
        .route("/diario/documents", post(diario::create_document))
        .route("/diario/documents/:id/status", patch(diario::update_document_status))
        .route("/diario/ocr-results", post(diario::save_ocr_result))
        .route("/diario/ocr-results/:doc_id", get(diario::get_ocr_results_by_doc))
        .route("/diario/ocr-raw/:state_id/:fecha/:document_type", get(diario::get_raw_ocr_by_type))
        .route("/diario/items", post(diario::save_item))
        .route("/diario/items/:state_id/:fecha", get(diario::list_items))
        .route("/diario/resumenes", post(diario::save_resumen))
        .route("/diario/resumenes/:state_id/:fecha", get(diario::list_resumenes))
        .route("/diario/resumenes/:id", get(diario::get_resumen_by_id))
        .route("/diario/status/:state_id/:fecha", get(diario::get_daily_status))
        .route("/diario/lista-distribucion", post(diario::create_distribucion))
        .route("/diario/lista-distribucion/:id", get(diario::list_distribucion).delete(diario::delete_distribucion))
        .route("/diario/envios", post(diario::save_envio))
        .route("/diario/envios/:state_id/:fecha", get(diario::list_envios))
        .route("/diario/trigger/:state_id", post(diario::trigger_pipeline))
        .route("/diario/upload", post(diario::upload_document))
        // Dossiers
        .route("/dossiers", get(dossiers::list_dossiers).post(dossiers::create_dossier))
        .route("/dossiers/:id", get(dossiers::get_dossier))
        .route("/dossiers/:id/pdf", get(dossiers::export_dossier_pdf))
        // Narratives
        .route("/narratives", get(narratives::list_narratives))
        .route("/narratives/:id", get(narratives::get_narrative))
        // Profiles
        .route("/profiles", get(profiles::list_profiles).post(profiles::create_profile))
        .route("/profiles/:id", get(profiles::get_profile))
        // Sources
        .route("/sources", get(sources::list_sources).post(sources::create_source))
        .route("/sources/:id/toggle", patch(sources::toggle_source))
        .route("/sources/telegram/search", post(sources::search_telegram_channels))
        .route("/sources/twitter/search", post(sources::search_twitter_accounts))
        // Municipios
        .route("/municipios", get(municipios::list_municipios))
        .route("/municipios/:clave", get(municipios::get_municipio_detail))
        // Reports
        .route("/reports", get(reports::list_reports))
        .route("/reports/generate", post(reports::generate_report))
        .route("/reports/:id/download", get(reports::download_report))
        // Intel & SpiderFoot
        .route("/spiderfoot/scan", post(spiderfoot::start_spider_scan))
        .route("/spiderfoot/scan/:id", get(spiderfoot::get_spider_scan))
        .route("/intel/ip-geo", get(intel::get_ip_geojson))
        .route("/intel/ip-detail/:ip", get(intel::get_ip_detail))
        // Cabinet & Admin
        .route("/cabinet/snapshot", get(cabinet::get_cabinet_snapshot))
        .route("/admin/states", get(admin::list_states))
        .route("/admin/users", get(admin::list_users))
        .route("/admin/ocr-prompts/:state_id", get(admin::list_ocr_prompts))
        .route("/admin/ocr-prompts", post(admin::save_ocr_prompt))
        .route("/admin/ocr-audit/:state_id/:fecha", get(admin::get_ocr_audit_dump))
        // Query Audit Routes
        .route("/admin/query-audit", get(admin::list_query_audits).post(admin::create_query_audit))
        .route("/admin/query-audit/stats", get(admin::get_query_audit_stats))
        .route("/admin/query-audit/:id", get(admin::get_query_audit_by_id))
        .layer(axum::extract::DefaultBodyLimit::max(100 * 1024 * 1024))
        .layer(cors)
        .with_state(pool)
}
