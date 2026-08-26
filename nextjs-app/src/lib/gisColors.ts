export const PARTY_COLORS: Record<string, string> = {
  PAN: "#0055A5", // Azul PAN Oficial
  MORENA: "#8B181B", // Guinda Morena Oficial
  PRI: "#009540", // Verde Tricolor PRI
  MC: "#FF8200", // Naranja Movimiento Ciudadano
  PVEM: "#50B848", // Verde Ecologista
  PT: "#E31B23", // Rojo Partido del Trabajo
  PRD: "#FFCC00", // Amarillo PRD
  INDEPENDIENTE: "#800080", // Púrpura
  SIN_DATOS: "#94a3b8", // Gris Slate
};

export function getPartyColor(party?: string | null): string {
  if (!party) return PARTY_COLORS.SIN_DATOS;
  const p = party.toUpperCase().trim();
  return PARTY_COLORS[p] || "#64748b";
}

export function getParticipationColor(pct: number): string {
  if (pct >= 65) return "#065f46"; // Verde muy alto
  if (pct >= 55) return "#10b981"; // Verde alto
  if (pct >= 45) return "#fbbf24"; // Amarillo medio
  if (pct >= 35) return "#f97316"; // Naranja bajo
  return "#ef4444"; // Rojo muy bajo
}

export function getMarginColor(margin: number): string {
  if (margin >= 25) return "#1e3a8a"; // Bastión fuerte (>25% margen)
  if (margin >= 15) return "#3b82f6"; // Ventaja cómoda (15-25%)
  if (margin >= 5) return "#93c5fd"; // Ventaja moderada (5-15%)
  return "#f43f5e"; // Altamente disputada / Muy cerrada (<5%)
}

export function getSwingColor(alternancia: boolean, swingPct: number): string {
  if (alternancia) return "#a855f7"; // Púrpura brillante (Hubo alternancia partidista)
  if (swingPct > 5) return "#10b981"; // Creció el partido ganador
  if (swingPct < -5) return "#f43f5e"; // Cayó el partido ganador
  return "#94a3b8"; // Sin cambio significativo
}
