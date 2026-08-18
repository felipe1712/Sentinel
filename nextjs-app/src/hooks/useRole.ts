export type Role = "superadmin" | "jefe_oficina" | "asesor" | "analista" | "gobernador";

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("sentineliq_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function useRole(): { role: Role; isGobernador: boolean; isJefeOficina: boolean; isAnalista: boolean } {
  const user = getStoredUser();
  const role: Role = user?.role || "gobernador";

  return {
    role,
    isGobernador: role === "gobernador",
    isJefeOficina: role === "jefe_oficina" || role === "superadmin",
    isAnalista: role === "analista",
  };
}
