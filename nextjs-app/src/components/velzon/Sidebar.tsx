"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/hooks/useRole";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isGobernador, isAnalista, isJefeOficina } = useRole();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  return (
    <div className="app-menu navbar-menu">
      <div className="navbar-brand-box py-3 px-4 border-bottom border-dark">
        <Link href="/situacion" className="logo logo-dark">
          <span className="logo-lg text-white fw-bold fs-18 letter-spacing-1">
            SENTINEL<span className="text-primary">IQ</span>
          </span>
        </Link>
        <div className="text-muted fs-11 text-uppercase fw-semibold mt-1">
          Inteligencia Ejecutiva · Querétaro
        </div>
      </div>

      <div id="scrollbar" className="p-3">
        <ul className="navbar-nav id=navbar-nav">
          <li className="menu-title"><span data-key="t-menu">Estratégico</span></li>

          <li className="nav-item">
            <Link href="/situacion" className={`nav-link ${isActive("/situacion") ? "active" : ""}`}>
              <i className="ri-dashboard-line me-2"></i> <span>Situación Ejecutiva</span>
            </Link>
          </li>

          {isGobernador && (
            <li className="nav-item">
              <Link href="/situacion/ejecutiva" className={`nav-link ${isActive("/situacion/ejecutiva") ? "active" : ""}`}>
                <i className="ri-user-star-line me-2"></i> <span>Vista Gobernador</span>
              </Link>
            </li>
          )}

          <li className="nav-item">
            <Link href="/briefing" className={`nav-link ${isActive("/briefing") ? "active" : ""}`}>
              <i className="ri-file-list-3-line me-2"></i> 
              <span>Briefing Matutino</span>
              <span className="badge bg-danger-subtle text-danger ms-auto fs-10">05:30 AM</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/dossiers" className={`nav-link ${isActive("/dossiers") ? "active" : ""}`}>
              <i className="ri-book-read-line me-2"></i> <span>Dossiers Ejecutivos</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/narrativas" className={`nav-link ${isActive("/narrativas") ? "active" : ""}`}>
              <i className="ri-chat-voice-line me-2"></i> <span>Narrativas & Trend</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/municipios" className={`nav-link ${isActive("/municipios") ? "active" : ""}`}>
              <i className="ri-map-pin-2-line me-2"></i> <span>Inteligencia Municipal</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/perfiles" className={`nav-link ${isActive("/perfiles") ? "active" : ""}`}>
              <i className="ri-user-search-line me-2"></i> <span>Perfiles & Watchlist</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link href="/gabinete" className={`nav-link ${isActive("/gabinete") ? "active" : ""}`}>
              <i className="ri-tv-2-line me-2"></i> 
              <span>Sala de Gabinete</span>
              <span className="badge bg-primary ms-auto fs-10">Proyector</span>
            </Link>
          </li>

          {/* Opciones exclusivas para Operaciones/Analistas/Jefe Oficina */}
          {!isGobernador && (
            <>
              <li className="menu-title mt-3"><span data-key="t-pages">Operación & Fuentes</span></li>

              <li className="nav-item">
                <Link href="/fuentes" className={`nav-link ${isActive("/fuentes") ? "active" : ""}`}>
                  <i className="ri-rss-line me-2"></i> <span>Source Manager</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/fuentes/telegram" className={`nav-link ${isActive("/fuentes/telegram") ? "active" : ""}`}>
                  <i className="ri-telegram-line me-2"></i> <span>Canales Telegram</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/ciberseguridad" className={`nav-link ${isActive("/ciberseguridad") ? "active" : ""}`}>
                  <i className="ri-shield-keyhole-line me-2"></i> <span>Audit SpiderFoot</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link href="/reportes" className={`nav-link ${isActive("/reportes") ? "active" : ""}`}>
                  <i className="ri-printer-line me-2"></i> <span>Reportes PDF</span>
                </Link>
              </li>
            </>
          )}

          {isJefeOficina && (
            <li className="nav-item">
              <Link href="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>
                <i className="ri-settings-4-line me-2"></i> <span>Administración</span>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
