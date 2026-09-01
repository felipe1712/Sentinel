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
  key: "gto" | "qro";
  stateId: string;
  name: string;
  shortName: string;
  inegiCode: string;
  governorTitle: string;
  welcomeTitle: string;
  capital: string;
  center: [number, number];
  zoom: number;
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
    { clave: "11020", nombre: "León", region: "León & Silao", actividad_nivel: "alto", eventos_24h: 18, poblacion: "1,721,215", responsable_region: "FSPE Sector León", lat: 21.1220, lng: -101.6820 },
    { clave: "11017", nombre: "Irapuato", region: "Corredor Laja-Bajío", actividad_nivel: "alto", eventos_24h: 14, poblacion: "592,953", responsable_region: "FSPE Sector Irapuato", lat: 20.6780, lng: -101.3540 },
    { clave: "11007", nombre: "Celaya", region: "Corredor Laja-Bajío", actividad_nivel: "alto", eventos_24h: 15, poblacion: "521,169", responsable_region: "FSPE Sector Celaya", lat: 20.5280, lng: -100.8150 },
    { clave: "11015", nombre: "Guanajuato Capital", region: "Norte & Turismo", actividad_nivel: "medio", eventos_24h: 6, poblacion: "194,500", responsable_region: "FSPE Capital", lat: 21.0190, lng: -101.2574 },
    { clave: "11003", nombre: "San Miguel de Allende", region: "Norte & Turismo", actividad_nivel: "medio", eventos_24h: 5, poblacion: "174,615", responsable_region: "FSPE Zona Turística" },
    { clave: "11037", nombre: "Silao de la Victoria", region: "León & Silao", actividad_nivel: "alto", eventos_24h: 9, poblacion: "203,556", responsable_region: "FSPE Puerto Interior" },
    { clave: "11027", nombre: "Salamanca", region: "Corredor Laja-Bajío", actividad_nivel: "alto", eventos_24h: 11, poblacion: "273,417", responsable_region: "FSPE Sector Refinería" },
    { clave: "11014", nombre: "Dolores Hidalgo C.I.N.", region: "Norte & Turismo", actividad_nivel: "bajo", eventos_24h: 3, poblacion: "163,038", responsable_region: "FSPE Región Norte" },
    { clave: "11031", nombre: "San Francisco del Rincón", region: "León & Silao", actividad_nivel: "medio", eventos_24h: 4, poblacion: "130,825", responsable_region: "FSPE Rincón" },
    { clave: "11025", nombre: "Purísima del Rincón", region: "León & Silao", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "87,794", responsable_region: "FSPE Rincón" },
    { clave: "11002", nombre: "Acámbaro", region: "Sur", actividad_nivel: "medio", eventos_24h: 4, poblacion: "109,030", responsable_region: "FSPE Región Sur" },
    { clave: "11034", nombre: "Salvatierra", region: "Sur", actividad_nivel: "medio", eventos_24h: 5, poblacion: "97,054", responsable_region: "FSPE Región Sur" },
    { clave: "11045", nombre: "Yuriria", region: "Sur", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "68,746", responsable_region: "FSPE Región Sur" },
    { clave: "11041", nombre: "Uriangato", region: "Sur", actividad_nivel: "bajo", eventos_24h: 2, poblacion: "61,494", responsable_region: "FSPE Región Sur" },
    { clave: "11021", nombre: "Moroleón", region: "Sur", actividad_nivel: "bajo", eventos_24h: 1, poblacion: "49,364", responsable_region: "FSPE Región Sur" },
    { clave: "11004", nombre: "Apaseo el Grande", region: "Corredor Laja-Bajío", actividad_nivel: "medio", eventos_24h: 6, poblacion: "117,883", responsable_region: "FSPE Límite Querétaro" },
    { clave: "11005", nombre: "Apaseo el Alto", region: "Corredor Laja-Bajío", actividad_nivel: "medio", eventos_24h: 4, poblacion: "64,433", responsable_region: "FSPE Límite Querétaro" },
    { clave: "11044", nombre: "Villagrán", region: "Corredor Laja-Bajío", actividad_nivel: "medio", eventos_24h: 5, poblacion: "65,791", responsable_region: "FSPE Sector Bajío" },
    { clave: "11011", nombre: "Cortazar", region: "Corredor Laja-Bajío", actividad_nivel: "bajo", eventos_24h: 3, poblacion: "97,928", responsable_region: "FSPE Sector Bajío" },
  ],
};

export function getStateConfig(): StateConfig {
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host.startsWith("gto.") || host.includes("guanajuato") || host.includes(":3005")) {
      return GUANAJUATO_CONFIG;
    }
  }

  const envStateKey = process.env.NEXT_PUBLIC_STATE_KEY || process.env.STATE_KEY;
  if (envStateKey === "gto") {
    return GUANAJUATO_CONFIG;
  }

  return QUERETARO_CONFIG;
}
