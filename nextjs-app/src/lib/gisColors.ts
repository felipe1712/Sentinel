export const PARTY_COLORS: Record<string, string> = {
  PAN: "#0055B8",             // Azul Institucional PAN y Coalición
  MORENA: "#70112C",          // Magenta Quemado / Guinda Intenso Morena y Coalición
  PRI: "#D92128",             // Rojo Institucional PRI
  PVEM: "#50B848",            // Verde Claro Partido Verde
  PRD: "#1B5E20",             // Verde Oscuro PRD (solicitado)
  MC: "#FF8200",              // Naranja Movimiento Ciudadano
  PT: "#E31B23",              // Rojo Partido del Trabajo
  INDEPENDIENTE: "#8B5CF6",   // Púrpura Candidaturas Independientes
  SIN_DATOS: "#94A3B8",       // Gris Slate neutro
};

export function getPartyColor(party?: string | null): string {
  if (!party) return PARTY_COLORS.SIN_DATOS;
  const p = party.toUpperCase().trim().replace(/_/g, "-");

  // 1. PAN y Alianzas encabezadas por PAN (Azul)
  // Ejemplos: PAN, PAN-PRI-PRD, PAN-PRD-MC, PAN-PRI, PAN-PRD, PAN-MC, PAN-ALIANZA
  if (
    p === "PAN" ||
    p.startsWith("PAN-") ||
    p.includes("PAN-ALIANZA") ||
    p.includes("PAN-PRI") ||
    p.includes("PAN-PRD")
  ) {
    return PARTY_COLORS.PAN;
  }

  // 2. MORENA y Alianzas encabezadas por MORENA (Magenta Quemado)
  // Ejemplos: MORENA, MORENA-PT-PVEM, MORENA-PT-PES, PT-MORENA, PVEM-MORENA, OPOSICION-ALIANZA
  if (
    p === "MORENA" ||
    p.startsWith("MORENA-") ||
    p.includes("PT-MORENA") ||
    p.includes("PVEM-MORENA") ||
    p.includes("MORENA-ALIANZA") ||
    p.includes("OPOSICION")
  ) {
    return PARTY_COLORS.MORENA;
  }

  // 3. Movimiento Ciudadano (Naranja)
  if (p === "MC" || p.includes("MOVIMIENTO CIUDADANO")) {
    return PARTY_COLORS.MC;
  }

  // 4. PRI y Alianzas del PRI (sin PAN) (Rojo)
  if (p === "PRI" || p.startsWith("PRI-") || p.includes("PRI-PVEM")) {
    return PARTY_COLORS.PRI;
  }

  // 5. PVEM / Verde Ecologista (Verde Claro)
  if (p === "PVEM" || p === "VERDE" || p.startsWith("PVEM-")) {
    return PARTY_COLORS.PVEM;
  }

  // 6. PRD (Verde Oscuro)
  if (p === "PRD" || p.startsWith("PRD-")) {
    return PARTY_COLORS.PRD;
  }

  // 7. PT (Rojo)
  if (p === "PT" || p.startsWith("PT-")) {
    return PARTY_COLORS.PT;
  }

  // 8. Independientes
  if (p.includes("CAND-IND") || p.includes("INDEPENDIENTE") || p.startsWith("CI")) {
    return PARTY_COLORS.INDEPENDIENTE;
  }

  return PARTY_COLORS[p] || "#64748b";
}

export function getParticipationColor(pct: number): string {
  if (pct >= 65) return "#065f46"; // Verde esmeralda muy alto (>65%)
  if (pct >= 55) return "#10b981"; // Verde medio-alto (55-65%)
  if (pct >= 45) return "#f59e0b"; // Ámbar medio (45-55%)
  if (pct >= 35) return "#f97316"; // Naranja bajo (35-45%)
  return "#ef4444";                 // Rojo muy bajo (<35%)
}

export function getMarginColor(margin: number): string {
  if (margin >= 25) return "#1e3a8a"; // Azul marino (Bastión seguro, >25%)
  if (margin >= 15) return "#2563eb"; // Azul rey (Ventaja amplia, 15-25%)
  if (margin >= 5)  return "#60a5fa"; // Azul claro (Ventaja moderada, 5-15%)
  return "#e11d48";                   // Rosa intenso (Altamente competitiva / Disputada, <5%)
}

export function getSwingColor(alternancia: boolean, swingPct: number): string {
  if (alternancia) return "#9333ea";  // Púrpura vívido (Hubo alternancia partidista)
  if (swingPct > 5)  return "#059669"; // Verde (Creció el partido ganador)
  if (swingPct < -5) return "#e11d48"; // Rojo (Retrocedió el partido ganador)
  return "#94a3b8";                   // Gris neutro (Sin cambio significativo)
}
