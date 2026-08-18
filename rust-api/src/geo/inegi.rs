use geo::{Contains, Coord, Point, Polygon};

pub struct MunicipioBoundary {
    pub clave: String,
    pub nombre: String,
    pub polygon: Polygon<f64>,
}

pub struct InegiGeoEngine {
    pub municipios: Vec<MunicipioBoundary>,
}

impl InegiGeoEngine {
    pub fn new() -> Self {
        // Pre-carga de polígonos clave del Estado de Querétaro (Clave INEGI 22)
        let qro_poly = Polygon::new(
            geo::LineString::from(vec![
                Coord { x: -100.48, y: 20.52 },
                Coord { x: -100.32, y: 20.52 },
                Coord { x: -100.32, y: 20.70 },
                Coord { x: -100.48, y: 20.70 },
                Coord { x: -100.48, y: 20.52 },
            ]),
            vec![],
        );

        let corregidora_poly = Polygon::new(
            geo::LineString::from(vec![
                Coord { x: -100.48, y: 20.45 },
                Coord { x: -100.38, y: 20.45 },
                Coord { x: -100.38, y: 20.56 },
                Coord { x: -100.48, y: 20.56 },
                Coord { x: -100.48, y: 20.45 },
            ]),
            vec![],
        );

        let el_marques_poly = Polygon::new(
            geo::LineString::from(vec![
                Coord { x: -100.35, y: 20.55 },
                Coord { x: -100.18, y: 20.55 },
                Coord { x: -100.18, y: 20.75 },
                Coord { x: -100.35, y: 20.75 },
                Coord { x: -100.35, y: 20.55 },
            ]),
            vec![],
        );

        let san_juan_poly = Polygon::new(
            geo::LineString::from(vec![
                Coord { x: -100.08, y: 20.30 },
                Coord { x: -99.90, y: 20.30 },
                Coord { x: -99.90, y: 20.48 },
                Coord { x: -100.08, y: 20.48 },
                Coord { x: -100.08, y: 20.30 },
            ]),
            vec![],
        );

        Self {
            municipios: vec![
                MunicipioBoundary {
                    clave: "22014".to_string(),
                    nombre: "Santiago de Querétaro".to_string(),
                    polygon: qro_poly,
                },
                MunicipioBoundary {
                    clave: "22006".to_string(),
                    nombre: "Corregidora".to_string(),
                    polygon: corregidora_poly,
                },
                MunicipioBoundary {
                    clave: "22011".to_string(),
                    nombre: "El Marqués".to_string(),
                    polygon: el_marques_poly,
                },
                MunicipioBoundary {
                    clave: "22016".to_string(),
                    nombre: "San Juan del Río".to_string(),
                    polygon: san_juan_poly,
                },
            ],
        }
    }

    pub fn find_municipio(&self, lat: f64, lng: f64) -> Option<&MunicipioBoundary> {
        let pt = Point::new(lng, lat);
        self.municipios.iter().find(|m| m.polygon.contains(&pt))
    }
}
