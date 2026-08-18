use std::collections::HashMap;

pub fn get_country_coords() -> HashMap<&'static str, (f64, f64)> {
    let mut map = HashMap::new();
    map.insert("MX", (23.6345, -102.5528));
    map.insert("US", (37.0902, -95.7129));
    map.insert("RU", (61.5240, 105.3188));
    map.insert("CN", (35.8617, 104.1954));
    map.insert("BR", (-14.2350, -51.9253));
    map.insert("ES", (40.4637, -3.7492));
    map
}
