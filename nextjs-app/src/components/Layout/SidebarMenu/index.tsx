"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import { getStateConfig } from "@/lib/stateConfig";

interface SidebarMenuProps {
  toggleActive: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ toggleActive }) => {
  const pathname = usePathname();
  const { isGobernador, isJefeOficina } = useRole();
  const stateCfg = getStateConfig();

  const isActive = (path: string) => {
    if (path === "/gis-electoral") return pathname === "/gis-electoral";
    if (path === "/situacion") return pathname === "/situacion";
    return pathname?.startsWith(path);
  };

  const linkClass = (path: string) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-lg font-medium text-[13px] no-underline transition-all ${
      isActive(path)
        ? "bg-primary-50 text-primary-600 dark:bg-[#15203c] dark:text-primary-400 font-semibold"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#15203c] hover:text-black dark:hover:text-white"
    }`;

  return (
    <div className="sidebar-area bg-white dark:bg-[#0c1427] fixed z-[7] top-0 h-screen transition-all rounded-r-md border-r border-gray-100 dark:border-[#172036]">
      {/* Brand Header */}
      <div className="logo bg-white dark:bg-[#0c1427] border-b border-gray-100 dark:border-[#172036] px-5 py-4 flex items-center justify-between">
        <Link href="/gis-electoral" className="flex items-center gap-2.5 outline-none no-underline">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-black text-xl shadow-sm">
            S
          </div>
          <div>
            <span className="font-black text-black dark:text-white text-lg tracking-tight block leading-none">
              Sentinel<span className="text-primary-600">IQ</span>
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-1">
              {stateCfg.shortName} · WebGIS
            </span>
          </div>
        </Link>

        <button
          type="button"
          className="burger-menu inline-block text-gray-400 hover:text-primary-500 transition-all xl:hidden"
          onClick={toggleActive}
        >
          <i className="ri-close-line text-2xl"></i>
        </button>
      </div>

      {/* Navigation List */}
      <div className="pt-4 px-3 pb-8 h-[calc(100vh-72px)] overflow-y-auto sidebar-custom-scrollbar">
        {/* SECCION: ESTRATEGICO */}
        <span className="block font-bold uppercase text-gray-400 dark:text-gray-500 px-3 mb-2 text-[11px] tracking-wider">
          Estratégico
        </span>
        <nav className="space-y-1 mb-6">
          <Link href="/situacion" className={linkClass("/situacion")}>
            <span className="flex items-center gap-2.5">
              <i className="ri-dashboard-line text-[18px]"></i>
              <span>Situación Ejecutiva</span>
            </span>
          </Link>

          <Link href="/gis-electoral" className={linkClass("/gis-electoral")}>
            <span className="flex items-center gap-2.5">
              <i className="ri-map-2-line text-[18px] text-primary-500"></i>
              <span>WebGIS Electoral</span>
            </span>
            <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
              INE GIS
            </span>
          </Link>

          {isGobernador && (
            <Link href="/situacion/ejecutiva" className={linkClass("/situacion/ejecutiva")}>
              <span className="flex items-center gap-2.5">
                <i className="ri-user-star-line text-[18px] text-amber-500"></i>
                <span>Vista Gobernador</span>
              </span>
            </Link>
          )}

          <Link href="/briefing" className={linkClass("/briefing")}>
            <span className="flex items-center gap-2.5">
              <i className="ri-file-list-3-line text-[18px]"></i>
              <span>Briefing Matutino</span>
            </span>
            <span className="bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
              05:30 AM
            </span>
          </Link>

          <Link href="/dossiers" className={linkClass("/dossiers")}>
            <span className="flex items-center gap-2.5">
              <i className="ri-book-read-line text-[18px]"></i>
              <span>Dossiers Ejecutivos</span>
            </span>
          </Link>

          <Link href="/narrativas" className={linkClass("/narrativas")}>
            <span className="flex items-center gap-2.5">
              <i className="ri-chat-voice-line text-[18px]"></i>
              <span>Narrativas & Trend</span>
            </span>
          </Link>

          <Link href="/municipios" className={linkClass("/municipios")}>
            <span className="flex items-center gap-2.5">
              <i className="ri-map-pin-2-line text-[18px]"></i>
              <span>Inteligencia Municipal</span>
            </span>
          </Link>

          <Link href="/perfiles" className={linkClass("/perfiles")}>
            <span className="flex items-center gap-2.5">
              <i className="ri-user-search-line text-[18px]"></i>
              <span>Perfiles & Watchlist</span>
            </span>
          </Link>

          <Link href="/gabinete" className={linkClass("/gabinete")}>
            <span className="flex items-center gap-2.5">
              <i className="ri-tv-2-line text-[18px]"></i>
              <span>Sala de Gabinete</span>
            </span>
            <span className="bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
              Proyector
            </span>
          </Link>
        </nav>

        {/* SECCION: OPERACION & FUENTES */}
        {!isGobernador && (
          <>
            <span className="block font-bold uppercase text-gray-400 dark:text-gray-500 px-3 mb-2 text-[11px] tracking-wider">
              Operación & Fuentes
            </span>
            <nav className="space-y-1 mb-6">
              <Link href="/fuentes" className={linkClass("/fuentes")}>
                <span className="flex items-center gap-2.5">
                  <i className="ri-rss-line text-[18px]"></i>
                  <span>Source Manager & ARGOS</span>
                </span>
              </Link>

              <Link href="/fuentes/telegram" className={linkClass("/fuentes/telegram")}>
                <span className="flex items-center gap-2.5">
                  <i className="ri-telegram-line text-[18px] text-[#229ED9]"></i>
                  <span>Canales Telegram</span>
                </span>
              </Link>

              <Link href="/fuentes/twitter" className={linkClass("/fuentes/twitter")}>
                <span className="flex items-center gap-2.5">
                  <i className="ri-twitter-x-line text-[18px]"></i>
                  <span>Monitor X / Twitter</span>
                </span>
              </Link>

              <Link href="/ciberseguridad" className={linkClass("/ciberseguridad")}>
                <span className="flex items-center gap-2.5">
                  <i className="ri-shield-keyhole-line text-[18px]"></i>
                  <span>Audit SpiderFoot</span>
                </span>
              </Link>

              <Link href="/reportes" className={linkClass("/reportes")}>
                <span className="flex items-center gap-2.5">
                  <i className="ri-printer-line text-[18px]"></i>
                  <span>Reportes PDF</span>
                </span>
              </Link>
            </nav>
          </>
        )}

        {/* SECCION: ADMINISTRACION */}
        {isJefeOficina && (
          <>
            <span className="block font-bold uppercase text-gray-400 dark:text-gray-500 px-3 mb-2 text-[11px] tracking-wider">
              Administración
            </span>
            <nav className="space-y-1">
              <Link href="/admin" className={linkClass("/admin")}>
                <span className="flex items-center gap-2.5">
                  <i className="ri-user-settings-line text-[18px]"></i>
                  <span>Usuarios & Roles</span>
                </span>
              </Link>

              <Link href="/admin/auditoria" className={linkClass("/admin/auditoria")}>
                <span className="flex items-center gap-2.5">
                  <i className="ri-shield-check-line text-[18px]"></i>
                  <span>Auditoría & Trazas</span>
                </span>
              </Link>

              <Link href="/admin/keys" className={linkClass("/admin/keys")}>
                <span className="flex items-center gap-2.5">
                  <i className="ri-key-fill text-[18px]"></i>
                  <span>Llaves API & Secretos</span>
                </span>
              </Link>

              <Link href="/admin/mcp" className={linkClass("/admin/mcp")}>
                <span className="flex items-center gap-2.5">
                  <i className="ri-cpu-line text-[18px]"></i>
                  <span>Gestión Servidores MCP</span>
                </span>
              </Link>
            </nav>
          </>
        )}
      </div>
    </div>
  );
};

export default SidebarMenu;
