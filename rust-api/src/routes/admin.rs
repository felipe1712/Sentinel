use axum::{
    extract::State,
    Json,
};
use sqlx::PgPool;
use crate::{
    auth::middleware::AuthUser,
    error::AppError,
    models::{State as StateModel, UserDTO},
};

pub async fn list_states(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<StateModel>>, AppError> {
    auth.require_role(&["superadmin"])?;

    let states = sqlx::query_as::<_, StateModel>("SELECT * FROM states ORDER BY name ASC")
        .fetch_all(&pool)
        .await?;

    Ok(Json(states))
}

pub async fn list_users(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<UserDTO>>, AppError> {
    auth.require_role(&["jefe_oficina", "superadmin"])?;

    let users = sqlx::query_as::<_, UserDTO>(
        "SELECT id, state_id, email, role, name, cargo, active, last_login FROM users WHERE state_id = $1 ORDER BY name ASC"
    )
    .bind(auth.state_id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(users))
}
