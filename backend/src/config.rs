use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub database_url: String,
    pub database_max_connections: u32,
    pub workers_url: String,
    pub lightpanda_cdp_url: String,
    pub headlessx_url: String,
    pub documents_path: String,
    pub captures_path: String,
    pub pixelrag_index_dir: String,
}

impl Config {
    pub fn from_env() -> Self {
        let _ = dotenvy::dotenv();
        Self {
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: env::var("PORT")
                .ok()
                .and_then(|p| p.parse().ok())
                .unwrap_or(8100),
            database_url: env::var("DATABASE_URL").unwrap_or_else(|_| {
                "postgresql://urbanwatch:password@localhost:5433/urbanwatch_db".to_string()
            }),
            database_max_connections: env::var("DB_MAX_CONNECTIONS")
                .ok()
                .and_then(|c| c.parse().ok())
                .unwrap_or(15),
            workers_url: env::var("WORKERS_URL")
                .unwrap_or_else(|_| "http://localhost:8001".to_string()),
            lightpanda_cdp_url: env::var("LIGHTPANDA_CDP_URL")
                .unwrap_or_else(|_| "ws://localhost:9222".to_string()),
            headlessx_url: env::var("HEADLESSX_URL")
                .unwrap_or_else(|_| "http://localhost:38473".to_string()),
            documents_path: env::var("DOCUMENTS_PATH")
                .unwrap_or_else(|_| "/data/documents".to_string()),
            captures_path: env::var("CAPTURES_PATH")
                .unwrap_or_else(|_| "/data/captures".to_string()),
            pixelrag_index_dir: env::var("PIXELRAG_INDEX_DIR")
                .unwrap_or_else(|_| "/data/pixelrag_indexes".to_string()),
        }
    }
}
