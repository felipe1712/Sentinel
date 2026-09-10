"use client";

import React, { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useRole, logout, ROLE_LABELS } from "@/hooks/useRole";
import { getStateConfig, getStateConfigByKey } from "@/lib/stateConfig";

interface StateAccessGuardProps {
  children: ReactNode;
}

export default function StateAccessGuard({ children }: StateAccessGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loaded, isAuthenticated } = useRole();
  const stateCfg = getStateConfig();

  // Rutas exentas de validación de sesión (login y flujos auth)
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/login/" ||
    pathname.startsWith("/authentication/");

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#070b14]">
        <div className="text-center p-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
          <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">
            Verificando credenciales de seguridad...
          </p>
        </div>
      </div>
    );
  }

  // 1. Si no está autenticado y no está en ruta de login -> Redirigir a login
  if (!isAuthenticated && !isAuthRoute) {
    if (typeof window !== "undefined") {
      router.push("/login");
    }
    return null;
  }

  // Si está en ruta de login, permitir renderizar directamente
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // 2. Control de Aislamiento Territorial / Jurisdicción
  // Comprobar si el usuario pertenece al Estado actual de la plataforma
  const userStateKey = user?.state_key?.toLowerCase().trim();
  const currentStateKey = stateCfg.key.toLowerCase().trim();

  if (user && userStateKey && userStateKey !== currentStateKey) {
    const userStateConfig = getStateConfigByKey(userStateKey);
    const userStateName = userStateConfig?.name || `Estado (${userStateKey.toUpperCase()})`;
    const currentStateName = stateCfg.name;

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-white">
        <div className="max-w-lg w-full bg-slate-800 border border-red-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-3xl border border-red-500/30">
            <i className="ri-shield-cross-line"></i>
          </div>

          <span className="inline-block bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
            Acceso Restringido por Jurisdicción Estatal
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
            Discrepancia de Acreditación Territorial
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Su usuario <strong className="text-white">{user.name}</strong> ({ROLE_LABELS[user.role]?.title || user.role}) está dado de alta en la jurisdicción del{" "}
            <strong className="text-amber-400">{userStateName}</strong>. No cuenta con autorización de seguridad para consultar o intervenir en la información clasificada del{" "}
            <strong className="text-sky-400">{currentStateName}</strong>.
          </p>

          <div className="bg-slate-900/80 rounded-xl p-4 mb-6 border border-slate-700 text-left text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span>Jurisdicción de su cuenta:</span>
              <span className="font-bold text-amber-400 uppercase">{userStateKey} ({userStateName})</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Jurisdicción del servidor actual:</span>
              <span className="font-bold text-sky-400 uppercase">{currentStateKey} ({currentStateName})</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Nivel de acceso requerido:</span>
              <span className="font-bold text-white uppercase">Acreditación Estatal Válida</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                logout();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <i className="ri-login-box-line text-base"></i>
              <span>Iniciar con cuenta de {stateCfg.shortName}</span>
            </button>

            <button
              onClick={() => logout()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2"
            >
              <i className="ri-logout-box-r-line text-base"></i>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Control de acceso a la ruta /admin (Exclusivo Superadministrador)
  if (pathname.startsWith("/admin") && role !== "superadmin") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#0c1427] border border-amber-500/30 rounded-2xl p-6 text-center shadow-lg">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center text-2xl">
            <i className="ri-lock-2-line"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Área de Administración Restringida
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
            La sección de administración solo está disponible para usuarios con perfil de{" "}
            <strong className="text-purple-600 font-bold">Superadministrador</strong>. Su rol actual es{" "}
            <strong>{ROLE_LABELS[role as keyof typeof ROLE_LABELS]?.title || role}</strong>.
          </p>
          <button
            onClick={() => router.push("/situacion")}
            className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-all shadow-sm"
          >
            Regresar a Situación Ejecutiva
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
