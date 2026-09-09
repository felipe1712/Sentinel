"use client";

import React, { useEffect } from "react";
import DarkMode from "./DarkMode";
import Fullscreen from "./Fullscreen";
import ProfileMenu from "./ProfileMenu";
import { getStateConfig } from "@/lib/stateConfig";

interface HeaderProps {
  toggleActive: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleActive }) => {
  const stateCfg = getStateConfig();

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
      className="header-area bg-white dark:bg-[#0c1427] py-2.5 px-4 md:px-6 fixed top-0 z-[6] border-b border-gray-100 dark:border-[#172036] transition-all"
    >
      <div className="flex items-center justify-between">
        {/* Left: Sidebar Toggle & State Identity */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#15203c] transition-all"
            onClick={toggleActive}
            title="Colapsar menú"
          >
            <i className="ri-menu-2-line text-lg"></i>
          </button>

          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-gray-200 dark:border-gray-800">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div>
              <span className="text-xs font-bold text-gray-900 dark:text-white tracking-tight block leading-tight">
                {stateCfg.name}
              </span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest block leading-tight">
                SentinelIQ C5i · Sistema Operativo
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions: Dark Mode, Fullscreen, Profile */}
        <div className="flex items-center gap-1.5">
          <DarkMode />
          <Fullscreen />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
