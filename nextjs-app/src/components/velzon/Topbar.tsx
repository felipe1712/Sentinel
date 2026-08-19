"use client";

import React, { useState, useEffect } from "react";
import { useRole, getStoredUser } from "@/hooks/useRole";

export const Topbar: React.FC = () => {
  const { role } = useRole();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser() || { name: "Usuario Demo", cargo: "Despacho del Gobernador" });
  }, []);

  return (
    <header id="page-topbar" className="border-bottom border-gray-200 px-3 py-2 bg-white shadow-sm">
      <div className="layout-width">
        <div className="navbar-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <span className="badge bg-primary text-white px-3 py-2 fs-12 fw-bold text-uppercase me-3 shadow-sm">
              Querétaro · Soberana
            </span>
            <h5 className="mb-0 fw-bold fs-15 text-dark d-none d-md-block" style={{ color: "#0f172a" }}>
              Oficina del Gobernador Constitucional del Estado de Querétaro
            </h5>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Notification Bell */}
            <div className="dropdown topbar-head-dropdown header-item">
              <button
                type="button"
                className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle position-relative text-dark"
              >
                <i className="ri-notification-3-line fs-20 text-dark"></i>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  3<span className="visually-hidden">Alertas no leídas</span>
                </span>
              </button>
            </div>

            {/* User Profile */}
            <div className="d-flex align-items-center border-start border-gray-200 ps-3 ms-2">
              <div className="text-end me-2 d-none d-sm-block">
                <span className="d-block fw-bold text-dark fs-13" style={{ color: "#0f172a" }}>{user?.name || "Gobernador"}</span>
                <span className="d-block fs-11 text-primary fw-bold text-uppercase">{role || "GOBERNADOR"}</span>
              </div>
              <div className="avatar-xs">
                <span className="avatar-title rounded-circle bg-primary text-white fw-bold fs-14 shadow-sm">
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
