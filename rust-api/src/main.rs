mod auth;
mod config;
mod db;
mod error;
mod geo;
mod models;
mod routes;

use config::Config;
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info,sentineliq_api=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Config::from_env();
    tracing::info!("Iniciando SentinelIQ Rust API en puerto :{}", config.port);

    let pool = match db::create_pool(&config.database_url).await {
        Ok(p) => {
            tracing::info!("Conexión exitosa a PostgreSQL");
            p
        }
        Err(e) => {
            tracing::warn!("No se pudo conectar a PostgreSQL (posible desarrollo offline): {:?}", e);
            // Creamos un pool dummy si fuera necesario o propagamos
            db::create_pool(&config.database_url).await.unwrap_or_else(|_| {
                panic!("PostgreSQL no disponible. Inicie la base de datos con Docker Compose.");
            })
        }
    };

    let app = routes::create_router(pool);

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("Servidor Axum escuchando en http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
