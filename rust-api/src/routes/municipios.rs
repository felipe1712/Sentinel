use axum::{
    extract::{Path, State},
    Json,
};
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;
use crate::{
    auth::middleware::AuthUser,
    error::AppError,
    models::Event,
};

pub async fn list_municipios(
    auth: AuthUser,
) -> Result<Json<serde_json::Value>, AppError> {
    let gto_id = Uuid::parse_str("00000000-0000-0000-0000-000000000011").unwrap();

    if auth.state_id == gto_id {
        // Catálogo de Guanajuato (Clave INEGI 11 - 46 Municipios)
        Ok(Json(json!([
            {"clave": "11001", "nombre": "Abasolo", "region": "Corredor Laja-Bajío", "actividad_nivel": "bajo", "eventos_24h": 2, "poblacion": "92,040", "responsable_region": "FSPE Región Suroeste"},
            {"clave": "11002", "nombre": "Acámbaro", "region": "Sur", "actividad_nivel": "medio", "eventos_24h": 4, "poblacion": "109,030", "responsable_region": "FSPE Región Sur"},
            {"clave": "11003", "nombre": "San Miguel de Allende", "region": "Norte & Turismo", "actividad_nivel": "medio", "eventos_24h": 5, "poblacion": "174,615", "responsable_region": "FSPE Zona Turística"},
            {"clave": "11004", "nombre": "Apaseo el Alto", "region": "Corredor Laja-Bajío", "actividad_nivel": "medio", "eventos_24h": 4, "poblacion": "64,433", "responsable_region": "FSPE Límite Querétaro"},
            {"clave": "11005", "nombre": "Apaseo el Grande", "region": "Corredor Laja-Bajío", "actividad_nivel": "medio", "eventos_24h": 6, "poblacion": "117,883", "responsable_region": "FSPE Límite Querétaro"},
            {"clave": "11006", "nombre": "Atarjea", "region": "Norte & Turismo", "actividad_nivel": "bajo", "eventos_24h": 0, "poblacion": "5,296", "responsable_region": "FSPE Sierra Gorda"},
            {"clave": "11007", "nombre": "Celaya", "region": "Corredor Laja-Bajío", "actividad_nivel": "alto", "eventos_24h": 15, "poblacion": "521,169", "responsable_region": "FSPE Sector Celaya"},
            {"clave": "11008", "nombre": "Manuel Doblado", "region": "León & Silao", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "41,240", "responsable_region": "FSPE Sector Oeste"},
            {"clave": "11009", "nombre": "Comonfort", "region": "Corredor Laja-Bajío", "actividad_nivel": "medio", "eventos_24h": 3, "poblacion": "82,221", "responsable_region": "FSPE Sector Laja"},
            {"clave": "11010", "nombre": "Coroneo", "region": "Sur", "actividad_nivel": "bajo", "eventos_24h": 0, "poblacion": "11,083", "responsable_region": "FSPE Límite Michoacán"},
            {"clave": "11011", "nombre": "Cortazar", "region": "Corredor Laja-Bajío", "actividad_nivel": "bajo", "eventos_24h": 3, "poblacion": "97,928", "responsable_region": "FSPE Sector Bajío"},
            {"clave": "11012", "nombre": "Cuerámaro", "region": "Corredor Laja-Bajío", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "30,834", "responsable_region": "FSPE Región Suroeste"},
            {"clave": "11013", "nombre": "Doctor Mora", "region": "Norte & Turismo", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "27,390", "responsable_region": "FSPE Región Noreste"},
            {"clave": "11014", "nombre": "Dolores Hidalgo C.I.N.", "region": "Norte & Turismo", "actividad_nivel": "bajo", "eventos_24h": 3, "poblacion": "163,038", "responsable_region": "FSPE Región Norte"},
            {"clave": "11015", "nombre": "Guanajuato Capital", "region": "Norte & Turismo", "actividad_nivel": "medio", "eventos_24h": 6, "poblacion": "194,500", "responsable_region": "FSPE Capital"},
            {"clave": "11016", "nombre": "Huanímaro", "region": "Corredor Laja-Bajío", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "21,128", "responsable_region": "FSPE Región Suroeste"},
            {"clave": "11017", "nombre": "Irapuato", "region": "Corredor Laja-Bajío", "actividad_nivel": "alto", "eventos_24h": 14, "poblacion": "592,953", "responsable_region": "FSPE Sector Irapuato"},
            {"clave": "11018", "nombre": "Jaral del Progreso", "region": "Corredor Laja-Bajío", "actividad_nivel": "bajo", "eventos_24h": 2, "poblacion": "38,782", "responsable_region": "FSPE Sector Laja"},
            {"clave": "11019", "nombre": "Jerécuaro", "region": "Sur", "actividad_nivel": "bajo", "eventos_24h": 2, "poblacion": "49,517", "responsable_region": "FSPE Región Sur"},
            {"clave": "11020", "nombre": "León", "region": "León & Silao", "actividad_nivel": "alto", "eventos_24h": 18, "poblacion": "1,721,215", "responsable_region": "FSPE Sector León"},
            {"clave": "11021", "nombre": "Moroleón", "region": "Sur", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "49,364", "responsable_region": "FSPE Región Sur"},
            {"clave": "11022", "nombre": "Ocampo", "region": "Norte & Turismo", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "26,383", "responsable_region": "FSPE Región Norte"},
            {"clave": "11023", "nombre": "Pénjamo", "region": "Corredor Laja-Bajío", "actividad_nivel": "medio", "eventos_24h": 5, "poblacion": "154,960", "responsable_region": "FSPE Región Suroeste"},
            {"clave": "11024", "nombre": "Pueblo Nuevo", "region": "Corredor Laja-Bajío", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "12,405", "responsable_region": "FSPE Sector Irapuato"},
            {"clave": "11025", "nombre": "Purísima del Rincón", "region": "León & Silao", "actividad_nivel": "bajo", "eventos_24h": 2, "poblacion": "87,794", "responsable_region": "FSPE Rincón"},
            {"clave": "11026", "nombre": "Romita", "region": "León & Silao", "actividad_nivel": "bajo", "eventos_24h": 2, "poblacion": "65,766", "responsable_region": "FSPE Sector Silao"},
            {"clave": "11027", "nombre": "Salamanca", "region": "Corredor Laja-Bajío", "actividad_nivel": "alto", "eventos_24h": 11, "poblacion": "273,417", "responsable_region": "FSPE Sector Refinería"},
            {"clave": "11028", "nombre": "Salvatierra", "region": "Sur", "actividad_nivel": "medio", "eventos_24h": 5, "poblacion": "97,054", "responsable_region": "FSPE Región Sur"},
            {"clave": "11029", "nombre": "San Diego de la Unión", "region": "Norte & Turismo", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "41,039", "responsable_region": "FSPE Región Norte"},
            {"clave": "11030", "nombre": "San Felipe", "region": "Norte & Turismo", "actividad_nivel": "bajo", "eventos_24h": 2, "poblacion": "119,793", "responsable_region": "FSPE Región Norte"},
            {"clave": "11031", "nombre": "San Francisco del Rincón", "region": "León & Silao", "actividad_nivel": "medio", "eventos_24h": 4, "poblacion": "130,825", "responsable_region": "FSPE Rincón"},
            {"clave": "11032", "nombre": "San José Iturbide", "region": "Norte & Turismo", "actividad_nivel": "medio", "eventos_24h": 3, "poblacion": "89,558", "responsable_region": "FSPE Región Noreste"},
            {"clave": "11033", "nombre": "San Luis de la Paz", "region": "Norte & Turismo", "actividad_nivel": "medio", "eventos_24h": 3, "poblacion": "128,536", "responsable_region": "FSPE Sierra Gorda GTO"},
            {"clave": "11034", "nombre": "Santa Catarina", "region": "Norte & Turismo", "actividad_nivel": "bajo", "eventos_24h": 0, "poblacion": "5,723", "responsable_region": "FSPE Sierra Gorda"},
            {"clave": "11035", "nombre": "Santa Cruz de Juventino Rosas", "region": "Corredor Laja-Bajío", "actividad_nivel": "medio", "eventos_24h": 4, "poblacion": "82,340", "responsable_region": "FSPE Sector Bajío"},
            {"clave": "11036", "nombre": "Santiago Maravatío", "region": "Sur", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "7,050", "responsable_region": "FSPE Región Sur"},
            {"clave": "11037", "nombre": "Silao de la Victoria", "region": "León & Silao", "actividad_nivel": "alto", "eventos_24h": 9, "poblacion": "203,556", "responsable_region": "FSPE Puerto Interior"},
            {"clave": "11038", "nombre": "Tarandacuao", "region": "Sur", "actividad_nivel": "bajo", "eventos_24h": 0, "poblacion": "11,304", "responsable_region": "FSPE Límite Michoacán"},
            {"clave": "11039", "nombre": "Tarimoro", "region": "Sur", "actividad_nivel": "medio", "eventos_24h": 3, "poblacion": "35,905", "responsable_region": "FSPE Región Sur"},
            {"clave": "11040", "nombre": "Tierra Blanca", "region": "Norte & Turismo", "actividad_nivel": "bajo", "eventos_24h": 0, "poblacion": "20,007", "responsable_region": "FSPE Sierra Gorda"},
            {"clave": "11041", "nombre": "Uriangato", "region": "Sur", "actividad_nivel": "bajo", "eventos_24h": 2, "poblacion": "61,494", "responsable_region": "FSPE Región Sur"},
            {"clave": "11042", "nombre": "Valle de Santiago", "region": "Corredor Laja-Bajío", "actividad_nivel": "medio", "eventos_24h": 4, "poblacion": "150,054", "responsable_region": "FSPE Sector Bajío"},
            {"clave": "11043", "nombre": "Victoria", "region": "Norte & Turismo", "actividad_nivel": "bajo", "eventos_24h": 0, "poblacion": "21,253", "responsable_region": "FSPE Sierra Gorda"},
            {"clave": "11044", "nombre": "Villagrán", "region": "Corredor Laja-Bajío", "actividad_nivel": "medio", "eventos_24h": 5, "poblacion": "65,791", "responsable_region": "FSPE Sector Bajío"},
            {"clave": "11045", "nombre": "Xichú", "region": "Norte & Turismo", "actividad_nivel": "bajo", "eventos_24h": 0, "poblacion": "11,143", "responsable_region": "FSPE Sierra Gorda"},
            {"clave": "11046", "nombre": "Yuriria", "region": "Sur", "actividad_nivel": "bajo", "eventos_24h": 2, "poblacion": "68,746", "responsable_region": "FSPE Región Sur"}
        ])))
    } else {
        // Catálogo de Querétaro (Clave INEGI 22)
        Ok(Json(json!([
            {"clave": "22014", "nombre": "Santiago de Querétaro", "region": "ZMQ", "actividad_nivel": "alto", "eventos_24h": 12, "poblacion": "1,049,777", "responsable_region": "PoEs ZMQ Sector 1"},
            {"clave": "22011", "nombre": "El Marqués", "region": "ZMQ", "actividad_nivel": "alto", "eventos_24h": 7, "poblacion": "231,668", "responsable_region": "PoEs ZMQ Sector 2"},
            {"clave": "22006", "nombre": "Corregidora", "region": "ZMQ", "actividad_nivel": "medio", "eventos_24h": 6, "poblacion": "212,567", "responsable_region": "PoEs ZMQ Sector 3"},
            {"clave": "22016", "nombre": "San Juan del Río", "region": "Sur", "actividad_nivel": "medio", "eventos_24h": 5, "poblacion": "297,804", "responsable_region": "Región Valles / Sur"},
            {"clave": "22017", "nombre": "Tequisquiapan", "region": "Semidesierto", "actividad_nivel": "medio", "eventos_24h": 3, "poblacion": "72,201", "responsable_region": "Región Semidesierto"},
            {"clave": "22008", "nombre": "Huimilpan", "region": "ZMQ", "actividad_nivel": "bajo", "eventos_24h": 2, "poblacion": "36,808", "responsable_region": "PoEs ZMQ Sector 4"},
            {"clave": "22012", "nombre": "Pedro Escobedo", "region": "ZMQ / Sur", "actividad_nivel": "medio", "eventos_24h": 4, "poblacion": "77,404", "responsable_region": "Región Valles"},
            {"clave": "22004", "nombre": "Cadereyta de Montes", "region": "Semidesierto", "actividad_nivel": "bajo", "eventos_24h": 2, "poblacion": "69,075", "responsable_region": "Región Semidesierto"},
            {"clave": "22005", "nombre": "Colón", "region": "Semidesierto / Aeropuerto", "actividad_nivel": "medio", "eventos_24h": 3, "poblacion": "67,121", "responsable_region": "Sector Aeropuerto AIQ"},
            {"clave": "22001", "nombre": "Amealco de Bonfil", "region": "Sur", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "66,841", "responsable_region": "Región Sur"},
            {"clave": "22007", "nombre": "Ezequiel Montes", "region": "Semidesierto", "actividad_nivel": "bajo", "eventos_24h": 2, "poblacion": "45,141", "responsable_region": "Región Semidesierto"},
            {"clave": "22009", "nombre": "Jalpan de Serra", "region": "Sierra Gorda", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "27,343", "responsable_region": "Región Sierra Gorda"},
            {"clave": "22015", "nombre": "Pinal de Amoles", "region": "Sierra Gorda", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "27,093", "responsable_region": "Región Sierra Gorda"},
            {"clave": "22018", "nombre": "Tolimán", "region": "Semidesierto", "actividad_nivel": "bajo", "eventos_24h": 1, "poblacion": "27,999", "responsable_region": "Región Semidesierto"},
            {"clave": "22013", "nombre": "Peñamiller", "region": "Semidesierto", "actividad_nivel": "bajo", "eventos_24h": 0, "poblacion": "19,141", "responsable_region": "Región Semidesierto"},
            {"clave": "22003", "nombre": "Arroyo Seco", "region": "Sierra Gorda", "actividad_nivel": "bajo", "eventos_24h": 0, "poblacion": "13,142", "responsable_region": "Región Sierra Gorda"},
            {"clave": "22010", "nombre": "Landa de Matamoros", "region": "Sierra Gorda", "actividad_nivel": "bajo", "eventos_24h": 0, "poblacion": "18,794", "responsable_region": "Región Sierra Gorda"},
            {"clave": "22002", "nombre": "San Joaquín", "region": "Sierra Gorda", "actividad_nivel": "bajo", "eventos_24h": 0, "poblacion": "8,359", "responsable_region": "Región Sierra Gorda"}
        ])))
    }
}

pub async fn get_municipio_detail(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(clave): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let municipio_nombre = match clave.as_str() {
        // Guanajuato (Clave 11)
        "11001" => "Abasolo",
        "11002" => "Acámbaro",
        "11003" => "San Miguel de Allende",
        "11004" => "Apaseo el Alto",
        "11005" => "Apaseo el Grande",
        "11006" => "Atarjea",
        "11007" => "Celaya",
        "11008" => "Manuel Doblado",
        "11009" => "Comonfort",
        "11010" => "Coroneo",
        "11011" => "Cortazar",
        "11012" => "Cuerámaro",
        "11013" => "Doctor Mora",
        "11014" => "Dolores Hidalgo C.I.N.",
        "11015" => "Guanajuato Capital",
        "11016" => "Huanímaro",
        "11017" => "Irapuato",
        "11018" => "Jaral del Progreso",
        "11019" => "Jerécuaro",
        "11020" => "León",
        "11021" => "Moroleón",
        "11022" => "Ocampo",
        "11023" => "Pénjamo",
        "11024" => "Pueblo Nuevo",
        "11025" => "Purísima del Rincón",
        "11026" => "Romita",
        "11027" => "Salamanca",
        "11028" => "Salvatierra",
        "11029" => "San Diego de la Unión",
        "11030" => "San Felipe",
        "11031" => "San Francisco del Rincón",
        "11032" => "San José Iturbide",
        "11033" => "San Luis de la Paz",
        "11034" => "Santa Catarina",
        "11035" => "Santa Cruz de Juventino Rosas",
        "11036" => "Santiago Maravatío",
        "11037" => "Silao de la Victoria",
        "11038" => "Tarandacuao",
        "11039" => "Tarimoro",
        "11040" => "Tierra Blanca",
        "11041" => "Uriangato",
        "11042" => "Valle de Santiago",
        "11043" => "Victoria",
        "11044" => "Villagrán",
        "11045" => "Xichú",
        "11046" => "Yuriria",
        // Querétaro
        "22014" => "Santiago de Querétaro",
        "22011" => "El Marqués",
        "22006" => "Corregidora",
        "22016" => "San Juan del Río",
        "22017" => "Tequisquiapan",
        "22008" => "Huimilpan",
        "22012" => "Pedro Escobedo",
        "22004" => "Cadereyta de Montes",
        "22005" => "Colón",
        "22001" => "Amealco de Bonfil",
        "22007" => "Ezequiel Montes",
        "22009" => "Jalpan de Serra",
        "22015" => "Pinal de Amoles",
        "22018" => "Tolimán",
        "22013" => "Peñamiller",
        "22003" => "Arroyo Seco",
        "22010" => "Landa de Matamoros",
        "22002" => "San Joaquín",
        _ => "Municipio del Estado",
    };

    let events = sqlx::query_as::<_, Event>(
        "SELECT * FROM events WHERE state_id = $1 AND municipio ILIKE $2 ORDER BY occurred_at DESC LIMIT 10"
    )
    .bind(auth.state_id)
    .bind(format!("%{}%", municipio_nombre))
    .fetch_all(&pool)
    .await?;

    Ok(Json(json!({
        "clave": clave,
        "nombre": municipio_nombre,
        "resumen": format!("Municipio de {} con monitoreo territorial activo de paz social, infraestructura y programas de gobierno.", municipio_nombre),
        "eventos_recientes": events,
        "narrativas_locales": [
            {"id": "n1", "titulo": format!("Atención institucional y desarrollo en {}", municipio_nombre), "trend": "estable"}
        ]
    })))
}
