use std::{net::SocketAddr, sync::Arc};
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod db;
mod handlers;
mod models;
mod routes;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "urbanwatch_backend=info,tower_http=info,axum=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("Iniciando UrbanWatch Backend (Rust + Axum 0.7 + PostGIS) — uw.sentineliq.com.mx...");

    let config = Arc::new(config::Config::from_env());
    let pool = db::init_pool(&config.database_url, config.database_max_connections).await?;

    let app = routes::create_router(pool, config.clone());

    let addr = format!("{}:{}", config.host, config.port).parse::<SocketAddr>()?;
    info!("🚀 UrbanWatch API escuchando en http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
