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

export interface StateConfig {
  key: "gto" | "qro";
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
  municipios: MunicipioItem[];
}

export const QUERETARO_CONFIG: StateConfig = {
  key: "qro",
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
      tag: "Prioridad 1 · Movilidad",
      region: "León / Silao",
      titulo: "Eje Metropolitano & Puerto Interior",
      descripcion: "Operativo de agilidad vial FSPE y movilidad municipal en conectores industriales Eje Metropolitano y carretera 45. Flujo ordenado en hora pico.",
      border: "border-danger",
      badgeBg: "bg-danger text-white",
    },
    {
      tag: "Prioridad 2 · Seguridad",
      region: "Corredor Bajío",
      titulo: "Patrullaje Celaya - Irapuato",
      descripcion: "Despliegue coordinado de las Fuerzas de Seguridad Pública del Estado (FSPE) y Guardia Nacional en tramos carreteros estratégicos.",
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

  // Read environment variable if present
  const envStateKey = process.env.NEXT_PUBLIC_STATE_KEY || process.env.STATE_KEY;
  if (envStateKey === "gto") {
    return GUANAJUATO_CONFIG;
  }

  return QUERETARO_CONFIG;
}
