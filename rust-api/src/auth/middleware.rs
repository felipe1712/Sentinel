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
                    // Default service user for workers
                    return Ok(AuthUser {
                        user_id: Uuid::nil(),
                        state_id: Uuid::parse_str("11111111-1111-1111-1111-111111111111").unwrap(),
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
            return Ok(AuthUser {
                user_id: Uuid::nil(),
                state_id: Uuid::parse_str("11111111-1111-1111-1111-111111111111").unwrap(),
                role: "superadmin".to_string(),
                is_service: true,
            });
        }

        let claims = validate_jwt(token, &config.jwt_secret)?;

        Ok(AuthUser {
            user_id: claims.sub,
            state_id: claims.state_id,
            role: claims.role,
            is_service: false,
        })
    }
}
