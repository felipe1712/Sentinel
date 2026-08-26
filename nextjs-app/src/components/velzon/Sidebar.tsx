"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import { getStateConfig, StateConfig } from "@/lib/stateConfig";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isGobernador, isJefeOficina } = useRole();
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());

  useEffect(() => {
    setStateCfg(getStateConfig());
  }, []);

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  return (
    <div className="app-menu navbar-menu bg-white border-end border-gray-200">
      <div className="navbar-brand-box py-3 px-4 border-bottom border-gray-200 bg-white">
        <Link href="/situacion" className="logo logo-dark">
          <span className="logo-lg text-dark fw-extrabold fs-20 letter-spacing-1" style={{ color: "#0f172a" }}>
            SENTINEL<span className="text-primary">IQ</span>
          </span>
        </Link>
        <div className="text-primary fw-bold fs-11 text-uppercase mt-1">
          Inteligencia Ejecutiva · {stateCfg.shortName}
        </div>
      </div>

      <div id="scrollbar" className="p-3">
        <ul className="navbar-nav id=navbar-nav">
          <li className="menu-title"><span data-key="t-menu" className="text-primary fw-bold">Estratégico</span></li>

          <li className="nav-item">
            <Link href="/situacion" className={`nav-link ${isActive("/situacion") ? "active fw-bold text-primary" : "text-dark"}`}>
              <i className="ri-dashboard-line me-2"></i> <span>Situación Ejecutiva</span>
            </Link>
          </li>

          {isGobernador && (
            <li className="nav-item">
              <Link href="/situacion/ejecutiva" className={`nav-link ${isActive("/situacion/ejecutiva") ? "active fw-bold text-primary" : "text-dark"}`}>
                <i className="ri-user-star-line me-2"></i> <span>Vista Gobernador</span>
              </Link>
            </li>
          )}

          <li className="nav-item">
            <Link href="/briefing" className={`nav-link ${isActive("/briefing") ? "active fw-bold text-primary" : "text-dark"}`}>
              <i className="ri-file-list-3-line me-2"></i> 
              <span>Briefing Matutino</span>
              <span className="badge bg-danger-subtle text-danger ms-auto fs-10">05:30 AM</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/dossiers" className={`nav-link ${isActive("/dossiers") ? "active fw-bold text-primary" : "text-dark"}`}>
              <i className="ri-book-read-line me-2"></i> <span>Dossiers Ejecutivos</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/narrativas" className={`nav-link ${isActive("/narrativas") ? "active fw-bold text-primary" : "text-dark"}`}>
              <i className="ri-chat-voice-line me-2"></i> <span>Narrativas & Trend</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/municipios" className={`nav-link ${isActive("/municipios") ? "active fw-bold text-primary" : "text-dark"}`}>
              <i className="ri-map-pin-2-line me-2"></i> <span>Inteligencia Municipal</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/perfiles" className={`nav-link ${isActive("/perfiles") ? "active fw-bold text-primary" : "text-dark"}`}>
              <i className="ri-user-search-line me-2"></i> <span>Perfiles & Watchlist</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/gabinete" className={`nav-link ${isActive("/gabinete") ? "active fw-bold text-primary" : "text-dark"}`}>
              <i className="ri-tv-2-line me-2"></i> 
              <span>Sala de Gabinete</span>
              <span className="badge bg-primary text-white ms-auto fs-10">Proyector</span>
            </Link>
          </li>

          {!isGobernador && (
            <>
              <li className="menu-title mt-3"><span data-key="t-pages" className="text-primary fw-bold">Operación & Fuentes</span></li>

              <li className="nav-item">
                <Link href="/fuentes" className={`nav-link ${isActive("/fuentes") && !pathname?.includes("/telegram") && !pathname?.includes("/twitter") ? "active fw-bold text-primary" : "text-dark"}`}>
                  <i className="ri-rss-line me-2"></i> <span>Source Manager & ARGOS</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/fuentes/telegram" className={`nav-link ${isActive("/fuentes/telegram") ? "active fw-bold text-primary" : "text-dark"}`}>
                  <i className="ri-telegram-line me-2"></i> <span>Canales Telegram</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/fuentes/twitter" className={`nav-link ${isActive("/fuentes/twitter") ? "active fw-bold text-primary" : "text-dark"}`}>
                  <i className="ri-twitter-x-line me-2"></i> <span>Monitor X / Twitter</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/ciberseguridad" className={`nav-link ${isActive("/ciberseguridad") ? "active fw-bold text-primary" : "text-dark"}`}>
                  <i className="ri-shield-keyhole-line me-2"></i> <span>Audit SpiderFoot</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/reportes" className={`nav-link ${isActive("/reportes") ? "active fw-bold text-primary" : "text-dark"}`}>
                  <i className="ri-printer-line me-2"></i> <span>Reportes PDF</span>
                </Link>
              </li>
            </>
          )}

          {isJefeOficina && (
            <>
              <li className="menu-title mt-3"><span data-key="t-admin" className="text-primary fw-bold">Administración Soberana</span></li>

              <li className="nav-item">
                <Link href="/admin" className={`nav-link ${pathname === "/admin" ? "active fw-bold text-primary" : "text-dark"}`}>
                  <i className="ri-user-settings-line me-2"></i> <span>Usuarios & Roles</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/admin/auditoria" className={`nav-link ${isActive("/admin/auditoria") ? "active fw-bold text-primary" : "text-dark"}`}>
                  <i className="ri-shield-flash-line me-2"></i> 
                  <span>Auditoría de Consultas</span>
                  <span className="badge bg-warning text-dark ms-auto fs-10 fw-bold">1 Alerta</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/admin/keys" className={`nav-link ${isActive("/admin/keys") ? "active fw-bold text-primary" : "text-dark"}`}>
                  <i className="ri-key-fill me-2"></i> 
                  <span>Llaves API & Secretos</span>
                  <span className="badge bg-primary-subtle text-primary ms-auto fs-10">Keys</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/admin/mcp" className={`nav-link ${isActive("/admin/mcp") ? "active fw-bold text-primary" : "text-dark"}`}>
                  <i className="ri-cpu-line me-2"></i> 
                  <span>Gestión MCP</span>
                  <span className="badge bg-info-subtle text-info ms-auto fs-10">Tools</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
