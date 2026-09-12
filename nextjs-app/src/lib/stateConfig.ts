export interface MunicipioItem {
  clave: string;
  nombre: string;
  region: string;
  actividad_nivel: "alto" | "medio" | "bajo";
  eventos_24h: number;
  poblacion: string;
  responsable_region: string;
  lat?: number;
  lng?: number;
}

export interface NarrativaItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  trend: "subiendo" | "estable" | "bajando";
  volume_24h: number;
  sentiment: string;
  region: string;
}

export interface PerfilItem {
  id: string;
  name: string;
  cargo: string;
  afiliacion: string;
  risk: "Alto" | "Medio" | "Bajo";
  summary: string;
}

export interface FuenteItem {
  id: string;
  name: string;
  type: string;
  identifier: string;
  credibility: string;
  active: boolean;
}

export interface StateConfig {
  key: string;
  stateId: string;
  name: string;
  shortName: string;
  inegiCode: string;
  governorTitle: string;
  welcomeTitle: string;
  capital: string;
  center: [number, number];
  zoom: number;
  geojsonPath?: string;
  regions: string[];
  totalMunicipios: number;
  coberturaText: string;
  prioridades: {
    tag: string;
    region: string;
    titulo: string;
    descripcion: string;
    border: string;
    badgeBg: string;
  }[];
  sintesisEjecutiva: string;
  narrativas: NarrativaItem[];
  perfiles: PerfilItem[];
  fuentes: FuenteItem[];
  municipios: MunicipioItem[];
}

export const QUERETARO_CONFIG: StateConfig = {
  key: "qro",
  stateId: "11111111-1111-1111-1111-111111111111",
  name: "Estado de Querétaro",
  shortName: "Querétaro",
  inegiCode: "22",
  governorTitle: "Oficina del Gobernador Constitucional del Estado de Querétaro",
  welcomeTitle: "Bienvenido, Señor Gobernador",
  capital: "Santiago de Querétaro",
  center: [20.5888, -100.3899],
  zoom: 10,
  geojsonPath: "/data/qro_municipios.geojson",
  regions: ["TODOS", "ZMQ", "Semidesierto", "Sierra Gorda", "Sur"],
  totalMunicipios: 18,
  coberturaText: "18 / 18 Cobertura",
  prioridades: [
    {
      tag: "Prioridad 1 · Movilidad",
      region: "ZMQ",
      titulo: "Paseo 5 de Febrero",
      descripcion: "Operativo especial de agilidad vial atendido por PoEs y municipio en nodos estratégicos. Flujo vehicular continuo en horas pico.",
      border: "border-danger",
      badgeBg: "bg-danger text-white",
    },
    {
      tag: "Prioridad 2 · Prevención",
      region: "El Marqués",
      titulo: "Monitoreo Hidrológico",
      descripcion: "Drenes y cauces en niveles de seguridad. Coordinación preventiva de Protección Civil estatal y municipal activa.",
      border: "border-warning",
      badgeBg: "bg-warning text-dark",
    },
    {
      tag: "Prioridad 3 · Agua",
      region: "Federal",
      titulo: "Sistema Batán Agua para Todos",
      descripcion: "Consenso favorable con la CONAGUA y dependencias federales para la viabilidad técnica y financiamiento del proyecto hídrico.",
      border: "border-success",
      badgeBg: "bg-success text-white",
    },
  ],
  sintesisEjecutiva: "Durante las últimas 24 horas, las corporaciones de seguridad y protección civil del Estado de Querétaro mantuvieron una cobertura efectiva en los 18 municipios. La coordinación institucional con la XVII Zona Militar y la Guardia Nacional permanece sin novedad de relevancia.",
  narrativas: [
    {
      id: "n1_qro",
      title: "Movilidad e Intervención Vial Paseo 5 de Febrero",
      summary: "Debate público y reportes sobre flujo vehicular, obras de conexión y operativos PoEs.",
      category: "Infraestructura & Movilidad",
      trend: "subiendo",
      volume_24h: 342,
      sentiment: "Neutral / Exigente",
      region: "ZMQ",
    },
    {
      id: "n2_qro",
      title: "Proyecto Hídrico Batán Agua para Todos",
      summary: "Cobertura mediática sobre el acuerdo con CONAGUA y viabilidad de abastecimiento futuro.",
      category: "Agua & Medio Ambiente",
      trend: "estable",
      volume_24h: 218,
      sentiment: "Favorable",
      region: "Estatal",
    },
    {
      id: "n3_qro",
      title: "Seguridad y Monitoreo en Autopista México - Querétaro (57)",
      summary: "Percepción ciudadana sobre patrullaje de la Guardia Nacional y tiempos de traslado.",
      category: "Seguridad Pública",
      trend: "subiendo",
      volume_24h: 189,
      sentiment: "Atención Requerida",
      region: "San Juan del Río / Sur",
    },
    {
      id: "n4_qro",
      title: "Atracción de Inversión y Data Centers en El Marqués y Colón",
      summary: "Resonancia positiva sobre desarrollo tecnológico y generación de empleo especializado.",
      category: "Desarrollo Económico",
      trend: "subiendo",
      volume_24h: 145,
      sentiment: "Muy Favorable",
      region: "El Marqués / Colón",
    },
  ],
  perfiles: [
    {
      id: "p1_qro",
      name: "Alcalde de Santiago de Querétaro",
      cargo: "Presidente Municipal Constitucional",
      afiliacion: "Gobierno Municipal ZMQ",
      risk: "Medio",
      summary: "Coordinación en operativos viales de Paseo 5 de Febrero y proyectos urbanos.",
    },
    {
      id: "p2_qro",
      name: "Presidente CANACINTRA Querétaro",
      cargo: "Líder del Sector Industrial",
      afiliacion: "Iniciativa Privada / Cámaras",
      risk: "Bajo",
      summary: "Interlocución en mesas de desarrollo económico e inversión en El Marqués.",
    },
    {
      id: "p3_qro",
      name: "Coordinador de Bancada en Congreso Estatal",
      cargo: "Diputado Local",
      afiliacion: "Grupo Parlamentario",
      risk: "Medio",
      summary: "Seguimiento al paquete presupuestal e iniciativa hídrica Batán.",
    },
    {
      id: "p4_qro",
      name: "Delegado Federal CONAGUA Querétaro",
      cargo: "Funcionario Federal",
      afiliacion: "Gobierno Federal",
      risk: "Bajo",
      summary: "Enlace técnico permanente para la viabilidad del proyecto hídrico regional.",
    },
  ],
  fuentes: [
    { id: "s1_qro", name: "Canal Noticias Querétaro ZMQ", type: "Telegram", identifier: "@NoticiasQRO", credibility: "Alta", active: true },
    { id: "s2_qro", name: "Feed Oficial Protección Civil QRO", type: "RSS / API", identifier: "pc.queretaro.gob.mx", credibility: "Oficial", active: true },
    { id: "s3_qro", name: "Alerta Sismológica SSN (MCP)", type: "MCP Tool", identifier: "intel_earthquakes", credibility: "Oficial", active: true },
    { id: "s4_qro", name: "Monitoreo Pluvial GDACS (MCP)", type: "MCP Tool", identifier: "intel_disaster_alerts", credibility: "Oficial", active: true },
    { id: "s5_qro", name: "Reporte Tráfico PoEs Carretera 57", type: "Telegram", identifier: "@PoliciaEstatalQRO", credibility: "Oficial", active: true },
  ],
  municipios: [
    { clave: "22014", nombre: "Santiago de Querétaro", region: "ZMQ", actividad_nivel: "alto", eventos_24h: 12, poblacion: "1,049,777", responsable_region: "PoEs ZMQ Sector 1", lat: 20.5888, lng: -100.3899 },
    { clave: "22011", nombre: "El Marqués", region: "ZMQ", actividad_nivel: "alto", eventos_24h: 7, poblacion: "231,668", responsable_region: "PoEs ZMQ Sector 2", lat: 20.6720, lng: -100.2811 },
    { clave: "22006", nombre: "Corregidora", region: "ZMQ", actividad_nivel: "medio", eventos_24h: 6, poblacion: "212,567", responsable_region: "PoEs ZMQ Sector 3", lat: 20.5367, lng: -100.4439 },
    { clave: "22016", nombre: "San Juan del Río", region: "Sur", actividad_nivel: "medio", eventos_24h: 5, poblacion: "297,804", responsable_region: "Región Valles / Sur", lat: 20.3872, lng: -99.9961 },
    { clave: "22017", nombre: "Tequisquiapan", region: "Semidesierto", actividad_nivel: "medio", eventos_24h: 3, poblacion: "72,201", responsable_region: "Región Semidesierto" },
    { clave: "22008", nombre: "Huimilpan", region: "ZMQ", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "36,808", responsable_region: "PoEs ZMQ Sector 4" },
    { clave: "22012", nombre: "Pedro Escobedo", region: "ZMQ / Sur", actividad_nivel: "medio", eventos_24h: 4, poblacion: "77,404", responsable_region: "Región Valles" },
    { clave: "22004", nombre: "Cadereyta de Montes", region: "Semidesierto", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "69,075", responsable_region: "Región Semidesierto" },
    { clave: "22005", nombre: "Colón", region: "Semidesierto / Aeropuerto", actividad_nivel: "medio", eventos_24h: 3, poblacion: "67,121", responsable_region: "Sector Aeropuerto AIQ" },
    { clave: "22001", nombre: "Amealco de Bonfil", region: "Sur", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "66,841", responsable_region: "Región Sur" },
    { clave: "22007", nombre: "Ezequiel Montes", region: "Semidesierto", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "45,141", responsable_region: "Región Semidesierto" },
    { clave: "22009", nombre: "Jalpan de Serra", region: "Sierra Gorda", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "27,343", responsable_region: "Región Sierra Gorda" },
    { clave: "22015", nombre: "Pinal de Amoles", region: "Sierra Gorda", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "27,093", responsable_region: "Región Sierra Gorda" },
    { clave: "22018", nombre: "Tolimán", region: "Semidesierto", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "27,999", responsable_region: "Región Semidesierto" },
    { clave: "22013", nombre: "Peñamiller", region: "Semidesierto", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "19,141", responsable_region: "Región Semidesierto" },
    { clave: "22003", nombre: "Arroyo Seco", region: "Sierra Gorda", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "13,142", responsable_region: "Región Sierra Gorda" },
    { clave: "22010", nombre: "Landa de Matamoros", region: "Sierra Gorda", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "18,794", responsable_region: "Región Sierra Gorda" },
    { clave: "22002", nombre: "San Joaquín", region: "Sierra Gorda", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "8,359", responsable_region: "Región Sierra Gorda" },
  ],
};

export const GUANAJUATO_CONFIG: StateConfig = {
  key: "gto",
  stateId: "00000000-0000-0000-0000-000000000011",
  name: "Estado de Guanajuato",
  shortName: "Guanajuato",
  inegiCode: "11",
  governorTitle: "Oficina de la Gobernadora Constitucional del Estado de Guanajuato",
  welcomeTitle: "Bienvenida, Señora Gobernadora",
  capital: "Guanajuato Capital",
  center: [21.0190, -101.2574],
  zoom: 9,
  geojsonPath: "/data/gto_municipios.geojson",
  regions: ["TODOS", "León & Silao", "Corredor Laja-Bajío", "Norte & Turismo", "Sur"],
  totalMunicipios: 46,
  coberturaText: "46 / 46 Cobertura",
  prioridades: [
    {
      tag: "Prioridad 1 · Seguridad",
      region: "Corredor Laja-Bajío",
      titulo: "Estrategia FSPE Celaya - Irapuato",
      descripcion: "Operativo especial de paz y patrullaje reforzado por las Fuerzas de Seguridad Pública del Estado (FSPE) en el corredor Celaya-Irapuato-Salamanca.",
      border: "border-danger",
      badgeBg: "bg-danger text-white",
    },
    {
      tag: "Prioridad 2 · Movilidad",
      region: "León / Silao",
      titulo: "Eje Metropolitano & Puerto Interior",
      descripcion: "Operativo de agilidad vial y seguridad en carretera 45 y accesos al hub industrial de Puerto Interior. Tránsito supervisado en hora pico.",
      border: "border-warning",
      badgeBg: "bg-warning text-dark",
    },
    {
      tag: "Prioridad 3 · Desarrollo",
      region: "Norte / Turismo",
      titulo: "Corredor San Miguel - Guanajuato",
      descripcion: "Monitoreo preventivo y despliegue operativo especial en zonas turísticas y de atracción de inversión tecnológica.",
      border: "border-success",
      badgeBg: "bg-success text-white",
    },
  ],
  sintesisEjecutiva: "Durante las últimas 24 horas, las Fuerzas de Seguridad Pública del Estado (FSPE) y las corporaciones municipales de Guanajuato mantuvieron presencia activa en las 4 regiones del estado. La coordinación con la XII Región Militar permanece en patrullaje continuo.",
  narrativas: [
    {
      id: "n1_gto",
      title: "Estrategia de Seguridad & Coordinación FSPE en Celaya, Irapuato y Bajío",
      summary: "Evaluación pública sobre patrullajes inteligentes de FSPE, operativos interinstitucionales y fortalecimiento municipal.",
      category: "Seguridad Pública",
      trend: "subiendo",
      volume_24h: 482,
      sentiment: "Atención Requerida",
      region: "Corredor Laja-Bajío",
    },
    {
      id: "n2_gto",
      title: "Monitoreo y Agilidad Vial en Eje Metropolitano León - Silao",
      summary: "Reportes sobre flujo vehicular en autopista 45, accesos a Puerto Interior y transporte metropolitano.",
      category: "Infraestructura & Movilidad",
      trend: "estable",
      volume_24h: 310,
      sentiment: "Neutral",
      region: "León / Silao",
    },
    {
      id: "n3_gto",
      title: "Atracción de Inversión Tecnológica y Automotriz en Puerto Interior",
      summary: "Cobertura mediática favorable sobre la llegada de empresas de semiconductores y manufactura de avanzada.",
      category: "Desarrollo Económico",
      trend: "subiendo",
      volume_24h: 245,
      sentiment: "Muy Favorable",
      region: "Silao / Irapuato",
    },
    {
      id: "n4_gto",
      title: "Flujo Turístico e Integración Cultural San Miguel de Allende - Guanajuato",
      summary: "Resonancia internacional de eventos culturales y ocupación hotelera en zonas de patrimonio histórico.",
      category: "Turismo & Cultura",
      trend: "estable",
      volume_24h: 190,
      sentiment: "Favorable",
      region: "Norte & Turismo",
    },
  ],
  perfiles: [
    {
      id: "p1_gto",
      name: "Secretario de Seguridad y Paz del Estado",
      cargo: "Mando Superior de Seguridad",
      afiliacion: "FSPE / Gobierno del Estado de Guanajuato",
      risk: "Alto",
      summary: "Coordinador de los operativos de seguridad interinstitucionales en Celaya, Irapuato y corredor industrial.",
    },
    {
      id: "p2_gto",
      name: "Presidente Municipal de León",
      cargo: "Presidente Municipal Constitucional",
      afiliacion: "Gobierno Municipal León",
      risk: "Medio",
      summary: "Mesa de coordinación en prevención del delito y agilidad vial metropolitana.",
    },
    {
      id: "p3_gto",
      name: "Presidente Municipal de Celaya",
      cargo: "Presidente Municipal Constitucional",
      afiliacion: "Gobierno Municipal Celaya",
      risk: "Alto",
      summary: "Enlace operativo permanente con FSPE y Guardia Nacional para la pacificación del municipio.",
    },
    {
      id: "p4_gto",
      name: "Presidente de la Cámara de Comercio / Puerto Interior",
      cargo: "Líder Industrial & Logístico",
      afiliacion: "Sector Industrial Guanajuato",
      risk: "Bajo",
      summary: "Diálogo constante para la infraestructura logística y seguridad patrimonial en corredores industriales.",
    },
  ],
  fuentes: [
    { id: "s1_gto", name: "Fuerzas de Seguridad Pública (FSPE GTO)", type: "Oficial / API", identifier: "@FSPE_GtoOficial", credibility: "Oficial", active: true },
    { id: "s2_gto", name: "Canal Alertas Seguridad Celaya & Bajío", type: "Telegram", identifier: "@AlertasCelayaBajio", credibility: "Alta", active: true },
    { id: "s3_gto", name: "Noticias León y ZM en Vivo", type: "Telegram", identifier: "@NoticiasLeonGto", credibility: "Alta", active: true },
    { id: "s4_gto", name: "Disturbios & Inestabilidad Social (MCP)", type: "MCP Tool", identifier: "intel_unrest_events", credibility: "Oficial", active: true },
    { id: "s5_gto", name: "Índice Sintético de Riesgo GTO (MCP)", type: "MCP Tool", identifier: "intel_instability_index", credibility: "Oficial", active: true },
  ],
  municipios: [
    { clave: "11001", nombre: "Abasolo", region: "Corredor Laja-Bajío", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "92,040", responsable_region: "FSPE Región Suroeste" },
    { clave: "11002", nombre: "Acámbaro", region: "Sur", actividad_nivel: "medio", eventos_24h: 4, poblacion: "109,030", responsable_region: "FSPE Región Sur" },
    { clave: "11003", nombre: "San Miguel de Allende", region: "Norte & Turismo", actividad_nivel: "medio", eventos_24h: 5, poblacion: "174,615", responsable_region: "FSPE Zona Turística" },
    { clave: "11004", nombre: "Apaseo el Alto", region: "Corredor Laja-Bajío", actividad_nivel: "medio", eventos_24h: 4, poblacion: "64,433", responsable_region: "FSPE Límite Querétaro" },
    { clave: "11005", nombre: "Apaseo el Grande", region: "Corredor Laja-Bajío", actividad_nivel: "medio", eventos_24h: 6, poblacion: "117,883", responsable_region: "FSPE Límite Querétaro" },
    { clave: "11006", nombre: "Atarjea", region: "Norte & Turismo", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "5,296", responsable_region: "FSPE Sierra Gorda" },
    { clave: "11007", nombre: "Celaya", region: "Corredor Laja-Bajío", actividad_nivel: "alto", eventos_24h: 15, poblacion: "521,169", responsable_region: "FSPE Sector Celaya", lat: 20.5280, lng: -100.8150 },
    { clave: "11008", nombre: "Manuel Doblado", region: "León & Silao", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "41,240", responsable_region: "FSPE Sector Oeste" },
    { clave: "11009", nombre: "Comonfort", region: "Corredor Laja-Bajío", actividad_nivel: "medio", eventos_24h: 3, poblacion: "82,221", responsable_region: "FSPE Sector Laja" },
    { clave: "11010", nombre: "Coroneo", region: "Sur", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "11,083", responsable_region: "FSPE Límite Michoacán" },
    { clave: "11011", nombre: "Cortazar", region: "Corredor Laja-Bajío", actividad_nivel: "bajo", eventos_24h: 3, poblacion: "97,928", responsable_region: "FSPE Sector Bajío" },
    { clave: "11012", nombre: "Cuerámaro", region: "Corredor Laja-Bajío", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "30,834", responsable_region: "FSPE Región Suroeste" },
    { clave: "11013", nombre: "Doctor Mora", region: "Norte & Turismo", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "27,390", responsable_region: "FSPE Región Noreste" },
    { clave: "11014", nombre: "Dolores Hidalgo C.I.N.", region: "Norte & Turismo", actividad_nivel: "bajo", eventos_24h: 3, poblacion: "163,038", responsable_region: "FSPE Región Norte" },
    { clave: "11015", nombre: "Guanajuato Capital", region: "Norte & Turismo", actividad_nivel: "medio", eventos_24h: 6, poblacion: "194,500", responsable_region: "FSPE Capital", lat: 21.0190, lng: -101.2574 },
    { clave: "11016", nombre: "Huanímaro", region: "Corredor Laja-Bajío", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "21,128", responsable_region: "FSPE Región Suroeste" },
    { clave: "11017", nombre: "Irapuato", region: "Corredor Laja-Bajío", actividad_nivel: "alto", eventos_24h: 14, poblacion: "592,953", responsable_region: "FSPE Sector Irapuato", lat: 20.6780, lng: -101.3540 },
    { clave: "11018", nombre: "Jaral del Progreso", region: "Corredor Laja-Bajío", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "38,782", responsable_region: "FSPE Sector Laja" },
    { clave: "11019", nombre: "Jerécuaro", region: "Sur", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "49,517", responsable_region: "FSPE Región Sur" },
    { clave: "11020", nombre: "León", region: "León & Silao", actividad_nivel: "alto", eventos_24h: 18, poblacion: "1,721,215", responsable_region: "FSPE Sector León", lat: 21.1220, lng: -101.6820 },
    { clave: "11021", nombre: "Moroleón", region: "Sur", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "49,364", responsable_region: "FSPE Región Sur" },
    { clave: "11022", nombre: "Ocampo", region: "Norte & Turismo", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "26,383", responsable_region: "FSPE Región Norte" },
    { clave: "11023", nombre: "Pénjamo", region: "Corredor Laja-Bajío", actividad_nivel: "medio", eventos_24h: 5, poblacion: "154,960", responsable_region: "FSPE Región Suroeste" },
    { clave: "11024", nombre: "Pueblo Nuevo", region: "Corredor Laja-Bajío", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "12,405", responsable_region: "FSPE Sector Irapuato" },
    { clave: "11025", nombre: "Purísima del Rincón", region: "León & Silao", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "87,794", responsable_region: "FSPE Rincón" },
    { clave: "11026", nombre: "Romita", region: "León & Silao", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "65,766", responsable_region: "FSPE Sector Silao" },
    { clave: "11027", nombre: "Salamanca", region: "Corredor Laja-Bajío", actividad_nivel: "alto", eventos_24h: 11, poblacion: "273,417", responsable_region: "FSPE Sector Refinería" },
    { clave: "11028", nombre: "Salvatierra", region: "Sur", actividad_nivel: "medio", eventos_24h: 5, poblacion: "97,054", responsable_region: "FSPE Región Sur" },
    { clave: "11029", nombre: "San Diego de la Unión", region: "Norte & Turismo", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "41,039", responsable_region: "FSPE Región Norte" },
    { clave: "11030", nombre: "San Felipe", region: "Norte & Turismo", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "119,793", responsable_region: "FSPE Región Norte" },
    { clave: "11031", nombre: "San Francisco del Rincón", region: "León & Silao", actividad_nivel: "medio", eventos_24h: 4, poblacion: "130,825", responsable_region: "FSPE Rincón" },
    { clave: "11032", nombre: "San José Iturbide", region: "Norte & Turismo", actividad_nivel: "medio", eventos_24h: 3, poblacion: "89,558", responsable_region: "FSPE Región Noreste" },
    { clave: "11033", nombre: "San Luis de la Paz", region: "Norte & Turismo", actividad_nivel: "medio", eventos_24h: 3, poblacion: "128,536", responsable_region: "FSPE Sierra Gorda GTO" },
    { clave: "11034", nombre: "Santa Catarina", region: "Norte & Turismo", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "5,723", responsable_region: "FSPE Sierra Gorda" },
    { clave: "11035", nombre: "Santa Cruz de Juventino Rosas", region: "Corredor Laja-Bajío", actividad_nivel: "medio", eventos_24h: 4, poblacion: "82,340", responsable_region: "FSPE Sector Bajío" },
    { clave: "11036", nombre: "Santiago Maravatío", region: "Sur", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "7,050", responsable_region: "FSPE Región Sur" },
    { clave: "11037", nombre: "Silao de la Victoria", region: "León & Silao", actividad_nivel: "alto", eventos_24h: 9, poblacion: "203,556", responsable_region: "FSPE Puerto Interior" },
    { clave: "11038", nombre: "Tarandacuao", region: "Sur", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "11,304", responsable_region: "FSPE Límite Michoacán" },
    { clave: "11039", nombre: "Tarimoro", region: "Sur", actividad_nivel: "medio", eventos_24h: 3, poblacion: "35,905", responsable_region: "FSPE Región Sur" },
    { clave: "11040", nombre: "Tierra Blanca", region: "Norte & Turismo", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "20,007", responsable_region: "FSPE Sierra Gorda" },
    { clave: "11041", nombre: "Uriangato", region: "Sur", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "61,494", responsable_region: "FSPE Región Sur" },
    { clave: "11042", nombre: "Valle de Santiago", region: "Corredor Laja-Bajío", actividad_nivel: "medio", eventos_24h: 4, poblacion: "150,054", responsable_region: "FSPE Sector Bajío" },
    { clave: "11043", nombre: "Victoria", region: "Norte & Turismo", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "21,253", responsable_region: "FSPE Sierra Gorda" },
    { clave: "11044", nombre: "Villagrán", region: "Corredor Laja-Bajío", actividad_nivel: "medio", eventos_24h: 5, poblacion: "65,791", responsable_region: "FSPE Sector Bajío" },
    { clave: "11045", nombre: "Xichú", region: "Norte & Turismo", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "11,143", responsable_region: "FSPE Sierra Gorda" },
    { clave: "11046", nombre: "Yuriria", region: "Sur", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "68,746", responsable_region: "FSPE Región Sur" },
  ],
};

export const PUEBLA_CONFIG: StateConfig = {
  key: "pue",
  stateId: "21212121-2121-2121-2121-212121212121",
  name: "Estado de Puebla",
  shortName: "Puebla",
  inegiCode: "21",
  governorTitle: "Oficina del Gobernador Constitucional del Estado de Puebla",
  welcomeTitle: "Bienvenido, Señor Gobernador",
  capital: "Heroica Puebla de Zaragoza",
  center: [19.0414, -98.2063],
  zoom: 8,
  geojsonPath: "/data/pue_municipios.geojson",
  regions: [
    "TODOS",
    "Metropolitana de Puebla",
    "Sierra Norte",
    "Sierra Nororiental",
    "Tehuacán y Sierra Negra",
    "Valle de Serdán",
    "Angelópolis",
    "Mixteca",
  ],
  totalMunicipios: 217,
  coberturaText: "217 / 217 Cobertura",
  prioridades: [
    {
      tag: "Prioridad 1 · Seguridad",
      region: "Metropolitana de Puebla",
      titulo: "Operativo de Paz Metropolitano",
      descripcion: "Despliegue coordinado entre Policía Estatal, Guardia Nacional y corporaciones de Puebla Capital, San Pedro y San Andrés Cholula.",
      border: "border-danger",
      badgeBg: "bg-danger text-white",
    },
    {
      tag: "Prioridad 2 · Autopistas",
      region: "San Martín Texmelucan",
      titulo: "Blindaje Logístico e Industrial",
      descripcion: "Monitoreo permanente de transportes de carga y vigilancia tecnológica en accesos del arco poniente y autopista México-Puebla.",
      border: "border-warning",
      badgeBg: "bg-warning text-dark",
    },
    {
      tag: "Prioridad 3 · Gobernabilidad",
      region: "Tehuacán y Sierra Negra",
      titulo: "Supervisión Hídrica y Enlace Comunitario",
      descripcion: "Reunión de concertación con comités agrarios y atención a demandas comunitarias en la región sur y Tehuacán.",
      border: "border-primary",
      badgeBg: "bg-primary text-white",
    },
  ],
  sintesisEjecutiva: "El Estado de Puebla mantiene estabilidad institucional y gobernabilidad plena en sus 217 municipios. Continúa el operativo metropolitano de seguridad y vigilancia estratégica en el corredor industrial Puebla-Tlaxcala y la autopista México-Puebla.",
  narrativas: [
    { id: "nar-pue-1", title: "Operativo Metropolitano de Seguridad Ciudadana", summary: "Refuerzo coordinado de patrullajes en Puebla Capital y zona conurbada.", category: "Seguridad", trend: "subiendo", volume_24h: 310, sentiment: "Positivo", region: "Metropolitana de Puebla" },
    { id: "nar-pue-2", title: "Plan Estatal de Infraestructura Hídrica y Carretera", summary: "Inversión histórica en redes hidráulicas y caminos de la Sierra Norte y Mixteca.", category: "Infraestructura", trend: "estable", volume_24h: 185, sentiment: "Positivo", region: "Sierra Norte" },
    { id: "nar-pue-3", title: "Monitoreo de Movilidad y Rutas de Abasto", summary: "Flujo vehicular regular en autopista México-Puebla y casetas principales.", category: "Movilidad", trend: "estable", volume_24h: 140, sentiment: "Neutral", region: "Valle de Serdán" },
  ],
  perfiles: [
    { id: "p-pue-1", name: "Mtro. Francisco Sánchez González", cargo: "Secretario de Seguridad Pública del Estado", afiliacion: "Gabinete Estatal Puebla", risk: "Bajo", summary: "Mando al frente del operativo de pacificación y coordinación interinstitucional." },
    { id: "p-pue-2", name: "Mtro. Javier Aquino Limón", cargo: "Secretario de Gobernación del Estado", afiliacion: "Gabinete Estatal Puebla", risk: "Bajo", summary: "Encargado de la política interna y diálogo permanente con los 217 presidentes municipales." },
  ],
  fuentes: [
    { id: "f-pue-1", name: "Secretaría de Seguridad Pública Puebla", type: "Oficial", identifier: "@SSPGobPue", credibility: "Alta", active: true },
    { id: "f-pue-2", name: "Periódico Central Puebla", type: "Prensa Digital", identifier: "periodico_central_pue", credibility: "Media-Alta", active: true },
    { id: "f-pue-3", name: "El Sol de Puebla", type: "Prensa Escrita", identifier: "elsoldepuebla", credibility: "Alta", active: true },
    { id: "f-pue-4", name: "Alerta Vial y Noticias Puebla", type: "Telegram OSINT", identifier: "alerta_puebla_seguridad", credibility: "Media", active: true },
    { id: "f-pue-5", name: "Tribuna Noticias Puebla", type: "Radio & Digital", identifier: "tribuna_puebla", credibility: "Media-Alta", active: true },
  ],
  municipios: [
    { clave: "21114", nombre: "Puebla Capital", region: "Metropolitana de Puebla", actividad_nivel: "alto", eventos_24h: 19, poblacion: "1,692,181", responsable_region: "Policía Estatal Metropolitana", lat: 19.0414, lng: -98.2063 },
    { clave: "21156", nombre: "Tehuacán", region: "Tehuacán y Sierra Negra", actividad_nivel: "alto", eventos_24h: 12, poblacion: "327,312", responsable_region: "Sector Tehuacán", lat: 18.4633, lng: -97.3917 },
    { clave: "21132", nombre: "San Martín Texmelucan", region: "Metropolitana de Puebla", actividad_nivel: "alto", eventos_24h: 15, poblacion: "155,738", responsable_region: "Sector Texmelucan", lat: 19.2844, lng: -98.4344 },
    { clave: "21019", nombre: "Atlixco", region: "Angelópolis", actividad_nivel: "medio", eventos_24h: 7, poblacion: "141,793", responsable_region: "Sector Atlixco", lat: 18.9083, lng: -98.4322 },
    { clave: "21140", nombre: "San Pedro Cholula", region: "Metropolitana de Puebla", actividad_nivel: "medio", eventos_24h: 6, poblacion: "138,433", responsable_region: "Sector Cholula", lat: 19.0606, lng: -98.3075 },
    { clave: "21119", nombre: "San Andrés Cholula", region: "Metropolitana de Puebla", actividad_nivel: "medio", eventos_24h: 8, poblacion: "154,448", responsable_region: "Sector Cholula", lat: 19.0494, lng: -98.2978 },
    { clave: "21015", nombre: "Amozoc", region: "Metropolitana de Puebla", actividad_nivel: "medio", eventos_24h: 7, poblacion: "125,876", responsable_region: "Sector Amozoc", lat: 19.0436, lng: -98.0436 },
    { clave: "21071", nombre: "Huauchinango", region: "Sierra Norte", actividad_nivel: "medio", eventos_24h: 5, poblacion: "103,946", responsable_region: "Sector Huauchinango", lat: 20.1764, lng: -98.0531 },
    { clave: "21186", nombre: "Teziutlán", region: "Sierra Nororiental", actividad_nivel: "medio", eventos_24h: 4, poblacion: "103,583", responsable_region: "Sector Teziutlán", lat: 19.8167, lng: -97.3600 },
    { clave: "21085", nombre: "Izúcar de Matamoros", region: "Mixteca", actividad_nivel: "medio", eventos_24h: 5, poblacion: "82,809", responsable_region: "Sector Mixteca", lat: 18.6014, lng: -98.4636 },
    { clave: "21041", nombre: "Cuautlancingo", region: "Metropolitana de Puebla", actividad_nivel: "medio", eventos_24h: 6, poblacion: "137,435", responsable_region: "Sector Metropolitano" },
    { clave: "21164", nombre: "Tepeaca", region: "Valle de Serdán", actividad_nivel: "medio", eventos_24h: 6, poblacion: "84,270", responsable_region: "Sector Tepeaca" },
    { clave: "21208", nombre: "Zacatlán", region: "Sierra Norte", actividad_nivel: "bajo", eventos_24h: 3, poblacion: "87,637", responsable_region: "Sector Sierra Norte" },
    { clave: "21053", nombre: "Chignahuapan", region: "Sierra Norte", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "66,483", responsable_region: "Sector Sierra Norte" },
    { clave: "21003", nombre: "Acatlán de Osorio", region: "Mixteca", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "37,955", responsable_region: "Sector Mixteca Sur" },
    { clave: "21154", nombre: "Tecamachalco", region: "Valle de Serdán", actividad_nivel: "medio", eventos_24h: 5, poblacion: "80,771", responsable_region: "Sector Tecamachalco" },
    { clave: "21094", nombre: "Libres", region: "Valle de Serdán", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "37,257", responsable_region: "Sector Libres" },
    { clave: "21197", nombre: "Xicotepec", region: "Sierra Norte", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "81,455", responsable_region: "Sector Xicotepec" },
    { clave: "21001", nombre: "Acajete", region: "Valle de Serdán", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "72,894", responsable_region: "Sector Serdán" },
    { clave: "21002", nombre: "Acateno", region: "Sierra Nororiental", actividad_nivel: "bajo", eventos_24h: 0, poblacion: "8,916", responsable_region: "Sector Teziutlán" },
  ],
};

// Catálogo extensible de Estados registrados en SentinelIQ
export const STATE_CATALOG: Record<string, StateConfig> = {
  gto: GUANAJUATO_CONFIG,
  qro: QUERETARO_CONFIG,
  pue: PUEBLA_CONFIG,
};

export function getAllSupportedStates(): StateConfig[] {
  return Object.values(STATE_CATALOG);
}

export function getStateConfigByKey(stateKey?: string): StateConfig | null {
  if (!stateKey) return null;
  const normalized = stateKey.toLowerCase().trim();
  return STATE_CATALOG[normalized] || null;
}

export function getStateConfig(overrideKey?: string): StateConfig {
  if (overrideKey && STATE_CATALOG[overrideKey.toLowerCase()]) {
    return STATE_CATALOG[overrideKey.toLowerCase()];
  }

  if (typeof window !== "undefined") {
    // 0. Detección prioritaria por Hostname / Puerto (subdominios explícitos)
    const host = window.location.hostname.toLowerCase();
    const port = window.location.port;

    if (host.startsWith("qro.") || host.includes("queretaro") || port === "3004") {
      return QUERETARO_CONFIG;
    }
    if (host.startsWith("gto.") || host.includes("guanajuato") || port === "3005") {
      return GUANAJUATO_CONFIG;
    }
    if (host.startsWith("pue.") || host.includes("puebla") || port === "3006") {
      return PUEBLA_CONFIG;
    }

    // 1. Si el Superadministrador Global seleccionó un estado activo en dominio genérico o localhost
    try {
      const activeState = localStorage.getItem("sentineliq_active_state");
      if (activeState && STATE_CATALOG[activeState.toLowerCase()]) {
        return STATE_CATALOG[activeState.toLowerCase()];
      }
    } catch (e) {
      // ignore
    }

    // 2. Verificar si hay un usuario logueado con state_key
    try {
      const userStr = localStorage.getItem("sentineliq_user");
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u?.state_key && STATE_CATALOG[u.state_key.toLowerCase()]) {
          return STATE_CATALOG[u.state_key.toLowerCase()];
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // 3. Detección por Variable de Entorno
  const envStateKey = (process.env.NEXT_PUBLIC_STATE_KEY || process.env.STATE_KEY || "").toLowerCase();
  if (envStateKey && STATE_CATALOG[envStateKey]) {
    return STATE_CATALOG[envStateKey];
  }

  // Por defecto Guanajuato (o Querétaro según configuración base)
  return GUANAJUATO_CONFIG;
}

