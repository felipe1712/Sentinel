use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{header, request::Parts},
};
use uuid::Uuid;
use crate::{auth::validate_jwt, config::Config, error::AppError};

#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: Uuid,
    pub state_id: Uuid,
    pub role: String,
    pub is_service: bool,
}

impl AuthUser {
    pub fn require_role(&self, allowed_roles: &[&str]) -> Result<(), AppError> {
        if self.is_service || self.role == "superadmin" {
            return Ok(());
        }
        if allowed_roles.contains(&self.role.as_str()) {
            Ok(())
        } else {
            Err(AppError::Forbidden)
        }
    }
}

fn resolve_request_state_id(parts: &Parts) -> Uuid {
    // 1. Header directo X-State-ID
    if let Some(id_val) = parts.headers.get("X-State-ID").and_then(|v| v.to_str().ok()) {
        if let Ok(u) = Uuid::parse_str(id_val) {
            return u;
        }
    }

    // 2. Header de clave X-State-Key (gto vs qro)
    if let Some(key_val) = parts.headers.get("X-State-Key").and_then(|v| v.to_str().ok()) {
        if key_val.eq_ignore_ascii_case("gto") || key_val.eq_ignore_ascii_case("guanajuato") {
            return Uuid::parse_str("00000000-0000-0000-0000-000000000011").unwrap();
        } else if key_val.eq_ignore_ascii_case("qro") || key_val.eq_ignore_ascii_case("queretaro") {
            return Uuid::parse_str("11111111-1111-1111-1111-111111111111").unwrap();
        }
    }

    // 3. Variable de entorno del contenedor (STATE_KEY)
    if let Ok(env_key) = std::env::var("STATE_KEY") {
        if env_key.eq_ignore_ascii_case("gto") {
            return Uuid::parse_str("00000000-0000-0000-0000-000000000011").unwrap();
        } else if env_key.eq_ignore_ascii_case("qro") {
            return Uuid::parse_str("11111111-1111-1111-1111-111111111111").unwrap();
        }
    }

    // 4. Hostname de la petición
    if let Some(host) = parts.headers.get(header::HOST).and_then(|v| v.to_str().ok()) {
        if host.contains("gto") {
            return Uuid::parse_str("00000000-0000-0000-0000-000000000011").unwrap();
        }
    }

    // Default fallback (Querétaro)
    Uuid::parse_str("11111111-1111-1111-1111-111111111111").unwrap()
}

#[async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let config = Config::from_env();

        // 1. Check for Service Token in header (X-Service-Token or Bearer service_token)
        if let Some(service_header) = parts.headers.get("X-Service-Token") {
            if let Ok(token_str) = service_header.to_str() {
                if token_str == config.service_token {
                    let state_id = resolve_request_state_id(parts);
                    return Ok(AuthUser {
                        user_id: Uuid::nil(),
                        state_id,
                        role: "superadmin".to_string(),
                        is_service: true,
                    });
                }
            }
        }

        // 2. Check for Bearer JWT token in Authorization header
        let auth_header = parts
            .headers
            .get(header::AUTHORIZATION)
            .and_then(|val| val.to_str().ok())
            .ok_or_else(|| AppError::Auth("Header de autorización faltante".to_string()))?;

        if !auth_header.starts_with("Bearer ") {
            return Err(AppError::Auth("Formato de token inválido. Usar 'Bearer <token>'".to_string()));
        }

        let token = &auth_header[7..];
        
        // Handle service token in Bearer format
        if token == config.service_token {
            let state_id = resolve_request_state_id(parts);
            return Ok(AuthUser {
                user_id: Uuid::nil(),
                state_id,
                role: "superadmin".to_string(),
                is_service: true,
            });
        }

        let claims = validate_jwt(token, &config.jwt_secret)?;

        // Si es superadmin y mandó X-State-ID o X-State-Key para ver otro estado, adoptar ese estado
        let state_id = if claims.role == "superadmin" {
            if let Some(id_val) = parts.headers.get("X-State-ID").and_then(|v| v.to_str().ok()) {
                Uuid::parse_str(id_val).unwrap_or(claims.state_id)
            } else if let Some(key_val) = parts.headers.get("X-State-Key").and_then(|v| v.to_str().ok()) {
                if key_val.eq_ignore_ascii_case("gto") || key_val.eq_ignore_ascii_case("guanajuato") {
                    Uuid::parse_str("00000000-0000-0000-0000-000000000011").unwrap()
                } else if key_val.eq_ignore_ascii_case("qro") || key_val.eq_ignore_ascii_case("queretaro") {
                    Uuid::parse_str("11111111-1111-1111-1111-111111111111").unwrap()
                } else {
                    claims.state_id
                }
            } else {
                claims.state_id
            }
        } else {
            claims.state_id
        };

        Ok(AuthUser {
            user_id: claims.sub,
            state_id,
            role: claims.role,
            is_service: false,
        })
    }
}
