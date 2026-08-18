pub mod admin;
pub mod auth;
pub mod briefings;
pub mod cabinet;
pub mod dossiers;
pub mod events;
pub mod intel;
pub mod municipios;
pub mod narratives;
pub mod profiles;
pub mod reports;
pub mod sources;
pub mod spiderfoot;

use axum::{
    extract::FromRef,
    routing::{get, patch, post},
    Router,
};
use sqlx::PgPool;
use tokio::sync::broadcast::{self, Sender};
use tower_http::cors::{Any, CorsLayer};

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub tx_event: Sender<String>,
}

impl FromRef<AppState> for PgPool {
    fn from_ref(app_state: &AppState) -> Self {
        app_state.pool.clone()
    }
}

impl FromRef<AppState> for Sender<String> {
    fn from_ref(app_state: &AppState) -> Self {
        app_state.tx_event.clone()
    }
}

pub fn create_router(pool: PgPool) -> Router {
    let (tx_event, _) = broadcast::channel::<String>(100);
    let state = AppState { pool, tx_event };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        // Auth
        .route("/auth/login", post(auth::login))
        .route("/auth/refresh", post(auth::refresh))
        .route("/auth/logout", post(auth::logout))
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
        .route("/profiles/:id/mentions", get(profiles::get_profile_mentions))
        .route("/profiles/:id/timeline", get(profiles::get_profile_timeline))
        .route("/profiles/:id/map", get(profiles::get_profile_map))
        // Sources
        .route("/sources", get(sources::list_sources).post(sources::create_source))
        .route("/sources/:id/toggle", patch(sources::toggle_source))
        .route("/sources/telegram/search", post(sources::search_telegram_channels))
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
        .layer(cors)
        .with_state(state)
}
