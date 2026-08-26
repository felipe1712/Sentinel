export interface ElectoralSectionProperties {
  id?: number;
  entidad: number;
  municipio: number;
  distrito_l: number;
  distrito_f: number;
  seccion: number;
  tipo: number;
  control?: number;
}

export interface ElectoralResult {
  election_year: number;
  election_type: string;
  clave_seccion: number;
  clave_municipio: number;
  lista_nominal: number;
  total_votos: number;
  participacion_pct: number;
  ganador_partido: string;
  ganador_votos: number;
  ganador_pct: number;
  segundo_partido: string | null;
  segundo_votos: number;
  segundo_pct: number;
  margen_victoria_pct: number;
  votos_partidos: Record<string, number>;
}

export interface SwingComparisonItem {
  clave_seccion: number;
  clave_municipio: number;
  ganador_año1: string;
  ganador_pct_año1: number;
  ganador_año2: string;
  ganador_pct_año2: number;
  swing_pct: number;
  alternancia: boolean;
}

export interface GisEventItem {
  id: string;
  layer_type: "seguridad" | "proteccion_civil" | "vialidad" | "agenda_politica" | string;
  title: string;
  description?: string;
  severity: "critico" | "alto" | "medio" | "bajo" | "informativo";
  latitude?: number;
  longitude?: number;
  clave_seccion?: number;
  clave_municipio?: number;
  source?: string;
  event_timestamp?: string;
  expires_at?: string;
  is_active?: boolean;
}

export type ChoroplethMode =
  | "ganador"
  | "porcentaje_ganador"
  | "participacion"
  | "margen_victoria"
  | "swing";

export type BaseLayerType = "secciones" | "municipios" | "distritos_locales" | "distritos_federales";
