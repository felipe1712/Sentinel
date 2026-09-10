"use client";

import { useState, useEffect } from "react";

export type Role = "superadmin" | "gabinete" | "gobernador" | "analista";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  cargo: string;
  role: Role;
  state_key: string;
  active: boolean;
  avatar?: string;
  token?: string;
}

export const ROLE_LABELS: Record<Role, { title: string; badge: string; color: string; bgClass: string }> = {
  superadmin: {
    title: "Superadministrador",
    badge: "Control Total del Sistema",
    color: "bg-purple-600",
    bgClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300",
  },
  gobernador: {
    title: "Gobernador",
    badge: "Mando Ejecutivo Estatal",
    color: "bg-amber-600",
    bgClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  },
  gabinete: {
    title: "Personal de Gabinete",
    badge: "Despacho & Gobernabilidad",
    color: "bg-blue-600",
    bgClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
  },
  analista: {
    title: "Analistas",
    badge: "Inteligencia & Fuentes",
    color: "bg-emerald-600",
    bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
};

// Directorio de usuarios autorizados por Estado
export const PREDEFINED_USERS_BY_STATE: Record<string, UserProfile[]> = {
  gto: [
    {
      id: "u_gto_superadmin",
      name: "Ing. Roberto Solís",
      email: "admin.seguridad@guanajuato.gob.mx",
      cargo: "Superadministrador de Sistemas & Ciberseguridad GTO",
      role: "superadmin",
      state_key: "gto",
      active: true,
    },
    {
      id: "u_gto_gobernadora",
      name: "Libia Dennise García Muñoz Ledo",
      email: "gobernadora@guanajuato.gob.mx",
      cargo: "Gobernadora Constitucional del Estado de Guanajuato",
      role: "gobernador",
      state_key: "gto",
      active: true,
    },
    {
      id: "u_gto_gabinete",
      name: "Mtro. Jorge Daniel Jiménez Lona",
      email: "secretario.gobierno@guanajuato.gob.mx",
      cargo: "Secretario de Gobierno / Personal de Gabinete",
      role: "gabinete",
      state_key: "gto",
      active: true,
    },
    {
      id: "u_gto_analista",
      name: "Lic. Carlos Mendoza",
      email: "analista.inteligencia@guanajuato.gob.mx",
      cargo: "Analista de Inteligencia Territorial & OSINT",
      role: "analista",
      state_key: "gto",
      active: true,
    },
  ],
  qro: [
    {
      id: "u_qro_superadmin",
      name: "Ing. Fernando Morales",
      email: "admin.ti@queretaro.gob.mx",
      cargo: "Superadministrador de Plataforma Querétaro",
      role: "superadmin",
      state_key: "qro",
      active: true,
    },
    {
      id: "u_qro_gobernador",
      name: "Mauricio Kuri González",
      email: "gobernador@queretaro.gob.mx",
      cargo: "Gobernador Constitucional del Estado de Querétaro",
      role: "gobernador",
      state_key: "qro",
      active: true,
    },
    {
      id: "u_qro_gabinete",
      name: "Mtro. Alejandro Morales",
      email: "jefe.oficina@queretaro.gob.mx",
      cargo: "Jefe de Oficina / Personal de Gabinete Querétaro",
      role: "gabinete",
      state_key: "qro",
      active: true,
    },
    {
      id: "u_qro_analista",
      name: "Dra. Sofía Hinojosa",
      email: "analista.inteligencia@queretaro.gob.mx",
      cargo: "Analista Senior de Inteligencia Situacional",
      role: "analista",
      state_key: "qro",
      active: true,
    },
  ],
};

// Usuario Superadministrador Global con acceso a todas las entidades
export const GLOBAL_SUPERADMIN_USER: UserProfile = {
  id: "u_global_superadmin",
  name: "Superadministrador Global",
  email: "admin@sentineliq.com.mx",
  cargo: "Dirección de Plataforma SentinelIQ Multi-Estado",
  role: "superadmin",
  state_key: "global",
  active: true,
};

export function getDefaultUsersForState(stateKey: string): UserProfile[] {
  const normalized = stateKey.toLowerCase().trim();
  const list = PREDEFINED_USERS_BY_STATE[normalized] || [];
  // Asegurar que el superadministrador global esté disponible en ambos estados
  return [GLOBAL_SUPERADMIN_USER, ...list];
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const userStr = localStorage.getItem("sentineliq_user");
    if (!userStr) return null;
    return JSON.parse(userStr) as UserProfile;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserProfile | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem("sentineliq_user");
  } else {
    localStorage.setItem("sentineliq_user", JSON.stringify(user));
  }
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("sentineliq_user");
  window.location.href = "/login";
}

export function useRole() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setLoaded(true);

    const handleStorageChange = () => {
      setUser(getStoredUser());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const role: Role | null = user?.role || null;
  const isGlobalSuperAdmin = Boolean(
    user && (user.email?.toLowerCase() === "admin@sentineliq.com.mx" || user.state_key === "global" || user.state_key === "*")
  );

  const switchGlobalState = (targetStateKey: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("sentineliq_active_state", targetStateKey.toLowerCase());
    window.location.reload();
  };

  return {
    user,
    role,
    isSuperAdmin: role === "superadmin",
    isGlobalSuperAdmin,
    isGabinete: role === "gabinete",
    isGobernador: role === "gobernador",
    isAnalista: role === "analista",
    isJefeOficina: role === "superadmin" || role === "gabinete",
    isAuthenticated: Boolean(user && user.id && (user.state_key || isGlobalSuperAdmin)),
    switchGlobalState,
    loaded,
    logout,
  };
}

