mod auth;
mod config;
mod db;
mod error;
mod geo;
mod models;
mod routes;

use config::Config;
use std::net::SocketAddr;
use std::time::Duration;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info,sentineliq_api=info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Config::from_env();
    tracing::info!("Iniciando SentinelIQ Rust API en puerto :{}", config.port);

    // Bucle de conexión con reintentos para esperar a que PostgreSQL esté listo en Docker
    let mut retry_count = 0;
    let max_retries = 15;
    let pool = loop {
        match db::create_pool(&config.database_url).await {
            Ok(p) => {
                tracing::info!("✅ Conexión exitosa a PostgreSQL establecida.");
                break p;
            }
            Err(e) => {
                retry_count += 1;
                if retry_count >= max_retries {
                    tracing::error!("❌ No se pudo conectar a PostgreSQL tras {} intentos: {:?}", max_retries, e);
                    panic!("PostgreSQL no disponible. Verifique que el contenedor de base de datos esté corriendo.");
                }
                tracing::warn!("⏳ Esperando a que PostgreSQL esté listo (intento {}/{})...", retry_count, max_retries);
                tokio::time::sleep(Duration::from_secs(2)).await;
            }
        }
    };

    let app = routes::create_router(pool);

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("🚀 Servidor Axum escuchando en http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
