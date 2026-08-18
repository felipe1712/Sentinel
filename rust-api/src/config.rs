use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret: String,
    pub claude_api_key: String,
    pub service_token: String,
    pub port: u16,
}

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        Self {
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "postgres://sentinel:sentinel123@localhost:5432/sentineliq".to_string()),
            jwt_secret: env::var("JWT_SECRET")
                .unwrap_or_else(|_| "sentineliq_secret_key_change_me_in_production_min_256_bits_length_secure_string_key".to_string()),
            claude_api_key: env::var("CLAUDE_API_KEY")
                .unwrap_or_else(|_| "".to_string()),
            service_token: env::var("SERVICE_TOKEN")
                .unwrap_or_else(|_| "sentineliq_internal_service_token_2026".to_string()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .unwrap_or(8080),
        }
    }
}
