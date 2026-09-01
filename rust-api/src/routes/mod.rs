use axum::{
    routing::{delete, get, patch, post},
    Router,
};
use sqlx::PgPool;
use tower_http::cors::{Any, CorsLayer};

pub mod admin;
pub mod auth;
pub mod briefings;
pub mod cabinet;
pub mod cybersecurity;
pub mod diario;
pub mod dossiers;
pub mod events;
pub mod gis;
pub mod intelligence;
pub mod municipalities;
pub mod narratives;
pub mod profiles;
pub mod reports;
pub mod sources;

pub fn create_router(pool: PgPool) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        // Health Check
        .route("/health", get(|| async { "OK - SentinelIQ Rust API" }))
        // Auth
        .route("/auth/login", post(auth::login))
        .route("/auth/me", get(auth::me))
        .route("/auth/refresh", post(auth::refresh_token))
        // Sources & Telegram MTProto & ARGOS Gateway Proxy
        .route("/sources", get(sources::list_sources).post(sources::create_source))
        .route("/sources/stats", get(sources::get_stats))
        .route("/sources/telegram/config", get(sources::get_telegram_config).post(sources::save_telegram_config))
        .route("/sources/telegram/channels", get(sources::list_telegram_channels))
        .route("/sources/telegram/channels/:id/connect", post(sources::connect_telegram_channel))
        .route("/sources/telegram/channels/:id/disconnect", post(sources::disconnect_telegram_channel))
        .route("/sources/telegram/channels/:id/posts", get(sources::get_channel_posts))
        .route("/sources/twitter/config", get(sources::get_twitter_config).post(sources::save_twitter_config))
        .route("/sources/twitter/tweets", get(sources::get_recent_tweets))
        .route("/sources/argos/status", get(sources::get_argos_gateway_status))
        // Cabinet & Executive Monitoring
        .route("/cabinet/snapshot", get(cabinet::get_cabinet_snapshot))
        .route("/cabinet/semaphores", get(cabinet::get_semaphores))
        .route("/cabinet/executive-summary", get(cabinet::get_executive_summary))
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
        .route("/diario/lista-distribucion/:state_id", get(diario::list_distribucion))
        .route("/diario/lista-distribucion", post(diario::create_distribucion))
        .route("/diario/lista-distribucion/:id", delete(diario::delete_distribucion))
        .route("/diario/envios", post(diario::save_envio))
        .route("/diario/envios/:state_id/:fecha", get(diario::list_envios))
        .route("/diario/trigger/:state_id", post(diario::trigger_pipeline))
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
        // Municipalities
        .route("/municipalities", get(municipalities::list_municipalities))
        .route("/municipalities/:clave", get(municipalities::get_municipality_detail))
        // Cybersecurity & SpiderFoot Audit
        .route("/cybersecurity/target", get(cybersecurity::get_target_info))
        .route("/cybersecurity/scans", get(cybersecurity::list_scans).post(cybersecurity::trigger_scan))
        .route("/cybersecurity/findings", get(cybersecurity::list_findings))
        .route("/cybersecurity/graph", get(cybersecurity::get_threat_graph))
        // Reports
        .route("/reports/catalog", get(reports::list_reports))
        .route("/reports/generate", post(reports::generate_report))
        .route("/reports/:id/download", get(reports::download_report_pdf))
        // Admin
        .route("/admin/users", get(admin::list_users).post(admin::create_user))
        .route("/admin/audit-logs", get(admin::list_audit_logs))
        .route("/admin/api-keys", get(admin::list_api_keys).post(admin::save_api_key))
        .route("/admin/mcp/tools", get(admin::list_mcp_tools).post(admin::execute_mcp_tool))
        .layer(cors)
        .with_state(pool)
}
