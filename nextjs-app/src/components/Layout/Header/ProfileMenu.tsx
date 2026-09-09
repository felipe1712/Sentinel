"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRole, Role } from "@/hooks/useRole";

const roleLabels: Record<Role, { title: string; badge: string; color: string }> = {
  gobernador: { title: "C. Gobernador", badge: "Mando Ejecutivo", color: "bg-amber-500" },
  jefe_oficina: { title: "Jefe de Oficina", badge: "Administración", color: "bg-primary-600" },
  superadmin: { title: "Super Administrador", badge: "Acceso Total", color: "bg-purple-600" },
  asesor: { title: "Asesor Estratégico", badge: "Estrategia", color: "bg-blue-600" },
  analista: { title: "Analista de Inteligencia", badge: "Operación", color: "bg-emerald-600" },
};

const ProfileMenu: React.FC = () => {
  const { role } = useRole();
  const [active, setActive] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentInfo = roleLabels[role] || roleLabels.gobernador;

  const handleDropdownToggle = () => {
    setActive((prev) => !prev);
  };

  const switchRole = (newRole: Role) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sentineliq_user", JSON.stringify({ role: newRole, name: roleLabels[newRole].title }));
      window.location.reload();
    }
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
        <div className={`w-8 h-8 rounded-full ${currentInfo.color} flex items-center justify-center text-white font-bold text-xs shadow-xs`}>
          {currentInfo.title.charAt(0)}
        </div>
        <div className="hidden sm:block text-left">
          <span className="block font-semibold text-xs text-gray-900 dark:text-white leading-tight">
            {currentInfo.title}
          </span>
          <span className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-tight">
            {currentInfo.badge}
          </span>
        </div>
        <i className="ri-arrow-down-s-line text-gray-400 text-sm"></i>
      </button>

      {active && (
        <div className="profile-menu-dropdown bg-white dark:bg-[#0c1427] transition-all shadow-xl dark:shadow-2xl py-3 absolute mt-2 w-56 z-[50] top-full right-0 rounded-xl border border-gray-100 dark:border-[#172036]">
          <div className="px-4 pb-3 border-b border-gray-100 dark:border-[#172036]">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Rol Activo</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{currentInfo.title}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{currentInfo.badge}</p>
          </div>

          <div className="px-4 py-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Cambiar Rol (Demo)
            </span>
            <div className="space-y-1">
              {(["gobernador", "jefe_oficina", "analista"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => switchRole(r)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-all ${
                    role === r
                      ? "bg-primary-50 text-primary-600 dark:bg-[#15203c] dark:text-primary-400 font-bold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#15203c]"
                  }`}
                >
                  <span>{roleLabels[r].title}</span>
                  {role === r && <i className="ri-check-line text-sm"></i>}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-[#172036] mx-3 my-2"></div>

          <div className="px-3">
            <Link
              href="/admin"
              onClick={() => setActive(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#15203c]"
            >
              <i className="ri-settings-3-line text-base text-gray-400"></i>
              <span>Panel de Control</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
