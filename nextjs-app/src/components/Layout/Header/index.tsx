"use client";

import React, { useEffect } from "react";
import { getStateConfig, getAllSupportedStates } from "@/lib/stateConfig";
import { useRole } from "@/hooks/useRole";
import ProfileMenu from "./ProfileMenu";

interface HeaderProps {
  toggleActive: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleActive }) => {
  const stateCfg = getStateConfig();
  const { isGlobalSuperAdmin, switchGlobalState } = useRole();
  const allStates = getAllSupportedStates();

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

        {/* Right: State Selector (Para Superadmin Global) & Profile Menu */}
        <div className="flex items-center gap-3">
          {isGlobalSuperAdmin && (
            <div className="flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 rounded-xl px-2.5 py-1.5 shadow-xs">
              <i className="ri-building-4-line text-sky-600 text-sm"></i>
              <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 hidden sm:inline">
                Estado:
              </span>
              <select
                value={stateCfg.key}
                onChange={(e) => switchGlobalState(e.target.value)}
                className="bg-transparent text-xs font-black text-sky-900 dark:text-sky-200 outline-none cursor-pointer"
                title="Cambiar estado para visualizar"
              >
                {allStates.map((s) => (
                  <option key={s.key} value={s.key} className="text-gray-900 bg-white dark:bg-slate-900 dark:text-white">
                    {s.shortName} ({s.key.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}

          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
