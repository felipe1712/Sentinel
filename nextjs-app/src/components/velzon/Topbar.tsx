"use client";

import React, { useState, useEffect } from "react";
import { useRole, getStoredUser } from "@/hooks/useRole";

export const Topbar: React.FC = () => {
  const { role } = useRole();
  const [user, setUser] = useState<any>(null);
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    setUser(getStoredUser() || { name: "Usuario Demo", cargo: "Despacho del Gobernador" });
  }, []);

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-bs-theme", nextTheme);
  };

  return (
    <header id="page-topbar" className="border-bottom border-dark px-3 py-2 bg-body">
      <div className="layout-width">
        <div className="navbar-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <span className="badge bg-primary-subtle text-primary px-3 py-2 fs-12 fw-bold text-uppercase me-3">
              Querétaro · Soberana
            </span>
            <h5 className="mb-0 fw-semibold fs-15 text-body d-none d-md-block">
              Oficina del Gobernador Constitucional del Estado de Querétaro
            </h5>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
              title="Cambiar Modo Claro/Oscuro"
            >
              <i className={`ri-${isDark ? "sun" : "moon"}-line fs-20`}></i>
            </button>

            {/* Notification Bell */}
            <div className="dropdown topbar-head-dropdown header-item">
              <button
                type="button"
                className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle position-relative"
              >
                <i className="ri-notification-3-line fs-20"></i>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  3<span className="visually-hidden">Alertas no leídas</span>
                </span>
              </button>
            </div>

            {/* User Profile */}
            <div className="d-flex align-items-center border-start ps-3 ms-2">
              <div className="text-end me-2 d-none d-sm-block">
                <span className="d-block fw-semibold text-body fs-13">{user?.name || "Gobernador"}</span>
                <span className="d-block fs-11 text-muted text-uppercase">{role}</span>
              </div>
              <div className="avatar-xs">
                <span className="avatar-title rounded-circle bg-primary text-white fw-bold fs-14">
                  {(user?.name || "Q")[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
