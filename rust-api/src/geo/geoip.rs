use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct IpLookupResult {
    pub ip: String,
    pub country: String,
    pub region: String,
    pub city: String,
    pub lat: f64,
    pub lng: f64,
    pub org: String,
    pub actor: Option<String>,
}
