"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  useRole,
  ROLE_LABELS,
  Role,
  setStoredUser,
  getDefaultUsersForState,
  UserProfile,
  logout,
} from "@/hooks/useRole";
import { getStateConfig, getAllSupportedStates } from "@/lib/stateConfig";

const ProfileMenu: React.FC = () => {
  const { user, role, isSuperAdmin } = useRole();
  const [active, setActive] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const stateCfg = getStateConfig();

  const currentRoleInfo = (role && ROLE_LABELS[role]) || ROLE_LABELS.analista;
  const stateUsers = getDefaultUsersForState(stateCfg.key);
  const otherStates = getAllSupportedStates().filter((s) => s.key !== stateCfg.key);

  const handleDropdownToggle = () => {
    setActive((prev) => !prev);
  };

  const switchUser = (targetUser: UserProfile) => {
    setStoredUser(targetUser);
    setActive(false);
    window.location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative profile-menu mx-[8px] md:mx-[10px] lg:mx-[12px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleDropdownToggle}
        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#15203c] transition-all text-black dark:text-white outline-none"
      >
        <div
          className={`w-8 h-8 rounded-full ${currentRoleInfo.color} flex items-center justify-center text-white font-bold text-xs shadow-xs`}
        >
          {user?.name ? user.name.charAt(0) : "U"}
        </div>
        <div className="hidden sm:block text-left">
          <span className="block font-semibold text-xs text-gray-900 dark:text-white leading-tight">
            {user?.name || currentRoleInfo.title}
          </span>
          <span className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-tight">
            {currentRoleInfo.title} · {stateCfg.shortName}
          </span>
        </div>
        <i className="ri-arrow-down-s-line text-gray-400 text-sm"></i>
      </button>

      {active && (
        <div className="profile-menu-dropdown bg-white dark:bg-[#0c1427] transition-all shadow-xl dark:shadow-2xl py-3 absolute mt-2 w-64 z-[50] top-full right-0 rounded-xl border border-gray-100 dark:border-[#172036]">
          {/* Cabecera del Usuario Activo */}
          <div className="px-4 pb-3 border-b border-gray-100 dark:border-[#172036]">
            <span className="inline-block bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 text-[10px] font-bold px-2 py-0.5 rounded-md mb-1.5 uppercase">
              {stateCfg.name}
            </span>
            <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
              {user?.name || "Usuario Activo"}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
              {user?.cargo || currentRoleInfo.badge}
            </p>
            <span
              className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded border ${currentRoleInfo.bgClass}`}
            >
              {currentRoleInfo.title}
            </span>
          </div>

          {/* Cambiar Perfil (Filtrado para el Estado actual) */}
          <div className="px-4 py-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Perfiles de {stateCfg.shortName}
            </span>
            <div className="space-y-1">
              {stateUsers.map((u) => {
                const uRole = ROLE_LABELS[u.role] || ROLE_LABELS.analista;
                const isCurrent = user?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => switchUser(u)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-all ${
                      isCurrent
                        ? "bg-primary-50 text-primary-700 dark:bg-[#15203c] dark:text-primary-300 font-bold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#15203c]"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="block text-xs truncate">{u.name}</span>
                      <span className="block text-[10px] text-gray-400">{uRole.title}</span>
                    </div>
                    {isCurrent && <i className="ri-check-line text-sm text-primary-600"></i>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prueba de Jurisdicción Cruzada */}
          {otherStates.length > 0 && (
            <div className="px-4 py-2 bg-red-50/50 dark:bg-red-950/20 border-t border-b border-red-100 dark:border-red-900/30">
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mb-1">
                Prueba de Aislamiento Territorial
              </span>
              {otherStates.map((os) => {
                const foreignUser = getDefaultUsersForState(os.key)[0];
                if (!foreignUser) return null;
                return (
                  <button
                    key={os.key}
                    type="button"
                    onClick={() => switchUser(foreignUser)}
                    className="w-full text-left px-2 py-1 rounded text-[11px] font-semibold text-red-700 dark:text-red-300 hover:bg-red-100/60 dark:hover:bg-red-900/40 transition-all flex items-center gap-1.5"
                  >
                    <i className="ri-shield-keyhole-line text-xs"></i>
                    <span>Simular usuario de {os.shortName}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Enlace a Administración si es Superadministrador */}
          {isSuperAdmin && (
            <div className="px-3 pt-2">
              <Link
                href="/admin"
                onClick={() => setActive(false)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
              >
                <i className="ri-settings-3-line text-base text-purple-500"></i>
                <span>Panel de Administración</span>
              </Link>
            </div>
          )}

          <div className="border-t border-gray-100 dark:border-[#172036] mx-3 my-2"></div>

          {/* Cerrar Sesión */}
          <div className="px-3">
            <button
              type="button"
              onClick={() => logout()}
              className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
            >
              <i className="ri-logout-box-r-line text-base"></i>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;

