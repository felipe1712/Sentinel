"use client";

import React, { useEffect } from "react";
import { getStateConfig } from "@/lib/stateConfig";
import { useRole, Role } from "@/hooks/useRole";

interface HeaderProps {
  toggleActive: () => void;
}

const roleLabels: Record<Role, { title: string; badge: string; color: string }> = {
  gobernador: { title: "C. Gobernador", badge: "Mando Ejecutivo", color: "bg-amber-500" },
  jefe_oficina: { title: "Jefe de Oficina", badge: "Administración", color: "bg-primary-600" },
  superadmin: { title: "Super Administrador", badge: "Acceso Total", color: "bg-purple-600" },
  asesor: { title: "Asesor Estratégico", badge: "Estrategia", color: "bg-blue-600" },
  analista: { title: "Analista de Inteligencia", badge: "Operación", color: "bg-emerald-600" },
};

const Header: React.FC<HeaderProps> = ({ toggleActive }) => {
  const stateCfg = getStateConfig();
  const { role } = useRole();
  const currentInfo = roleLabels[role] || roleLabels.gobernador;

  useEffect(() => {
    const elementId = document.getElementById("header");
    const handleScroll = () => {
      if (window.scrollY > 50) {
        elementId?.classList.add("shadow-sm");
      } else {
        elementId?.classList.remove("shadow-sm");
      }
    };

    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      id="header"
      className="header-area bg-white dark:bg-[#0c1427] py-3 px-4 md:px-6 fixed top-0 z-[6] border-b border-gray-100 dark:border-[#172036] transition-all"
    >
      <div className="flex items-center justify-between">
        {/* Left: Sidebar Toggle & State Identity */}
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#15203c] transition-all"
            onClick={toggleActive}
            title="Colapsar menú"
          >
            <i className="ri-menu-2-line text-xl"></i>
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-800">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div>
              <span className="text-base sm:text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight block leading-tight">
                {stateCfg.name}
              </span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block leading-tight mt-0.5">
                SentinelIQ C5i · Sistema de Inteligencia Estratégica
              </span>
            </div>
          </div>
        </div>

        {/* Right: Clean Institutional Badge (Sin botones de configuración) */}
        <div className="flex items-center">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-[#15203c] border border-gray-100 dark:border-gray-800 shadow-xs">
            <div className={`w-7 h-7 rounded-full ${currentInfo.color} flex items-center justify-center text-white font-black text-xs shadow-xs`}>
              {currentInfo.title.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block font-bold text-xs text-gray-900 dark:text-white leading-tight">
                {currentInfo.title}
              </span>
              <span className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-tight">
                {currentInfo.badge}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
