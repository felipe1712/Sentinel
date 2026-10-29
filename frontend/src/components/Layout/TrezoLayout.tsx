import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface TrezoLayoutProps {
  children: React.ReactNode;
  rol: string;
  onRolChange: (newRol: string) => void;
}

const MENU_SECTIONS = [
  {
    title: 'RADIOGRAFÍA URBANA CDMX',
    items: [
      { path: '/', icon: 'radar', label: 'Dashboard Operativo' },
      { path: '/historico', icon: 'history', label: 'Time Slider (2016–Hoy)' },
      { path: '/colonia/11111111-0001-4000-a000-000000000001', icon: 'location_city', label: 'Drill-Down por Colonia' },
      { path: '/actores', icon: 'hub', label: 'Grafo de Actores (Cytoscape)' },
      { path: '/resumenes', icon: 'auto_awesome', label: 'Resúmenes Claude + WorldMonitor' },
    ],
  },
  {
    title: 'INGESTA & INTELIGENCIA (ADMIN)',
    items: [
      { path: '/documentos', icon: 'upload_file', label: 'Carga Manual (Surya OCR)' },
      { path: '/admin/emedios', icon: 'newspaper', label: 'Scraper E-Medios (Lightpanda)' },
      { path: '/admin/vigia', icon: 'visibility', label: 'Vigía Dark Web (HeadlessX + PixelRAG)' },
      { path: '/admin/skills', icon: 'verified_user', label: 'Skills & Auditoría R7' },
    ],
  },
];

export const TrezoLayout: React.FC<TrezoLayoutProps> = ({ children, rol, onRolChange }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="trezo-wrapper">
      {/* Left Sidebar estilo CronosOne (Plantilla Trezo) */}
      <aside className={`trezo-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="trezo-logo-box">
          <Link to="/" className="trezo-logo-brand">
            <div className="trezo-logo-icon">UW</div>
            {!collapsed && (
              <div>
                <div className="fw-bold" style={{ fontSize: '1.05rem', letterSpacing: '-0.4px' }}>
                  Urban<span style={{ color: '#FF6B35' }}>Watch</span>
                </div>
                <div className="text-secondary" style={{ fontSize: '0.66rem' }}>
                  uw.sentineliq.com.mx
                </div>
              </div>
            )}
          </Link>
          <button
            type="button"
            className="btn btn-sm text-secondary p-1"
            onClick={() => setCollapsed(!collapsed)}
            title="Contraer menú"
          >
            <span className="material-symbols-outlined">menu_open</span>
          </button>
        </div>

        <div className="flex-grow-1 overflow-auto py-2">
          {MENU_SECTIONS.map((sec) => (
            <div key={sec.title}>
              {!collapsed && <div className="trezo-section-label">{sec.title}</div>}
              <ul className="trezo-nav-list">
                {sec.items.map((item) => {
                  const isActive =
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path.split('/1111')[0]);
                  return (
                    <li key={item.path} className="trezo-nav-item">
                      <Link
                        to={item.path}
                        className={`trezo-nav-link ${isActive ? 'active' : ''}`}
                      >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {!collapsed && (
          <div className="p-3 m-3 rounded-3" style={{ background: '#161a24', border: '1px solid #252b3b' }}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="fw-bold" style={{ color: '#FF6B35', fontSize: '0.72rem' }}>
                COBERTURA CDMX
              </small>
              <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>
                PostGIS
              </span>
            </div>
            <div className="small text-light fw-semibold">~1,812 Colonias INEGI</div>
            <div className="small text-secondary" style={{ fontSize: '0.72rem' }}>
              Sin módulo electoral · Seguridad privada e inteligencia urbana
            </div>
          </div>
        )}
      </aside>

      {/* Área Principal */}
      <div className="trezo-main">
        {/* TopNavbar estilo CronosOne (Plantilla Trezo) */}
        <header className="trezo-topbar">
          <div className="d-flex align-items-center gap-3">
            <span
              className="badge rounded-pill px-3 py-2"
              style={{
                background: 'rgba(255, 107, 53, 0.14)',
                color: '#FF6B35',
                border: '1px solid rgba(255, 107, 53, 0.4)',
                fontWeight: 600,
              }}
            >
              📍 Unidad Geo: Colonia (~1,800 colonias CDMX)
            </span>
            <span className="text-secondary small d-none d-lg-inline">
              Radiografía de seguridad urbana para la Ciudad de México
            </span>
          </div>

          {/* Selector de Rol y Nivel de Confidencialidad (Regla R4 — Claude-OSINT) */}
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <small className="text-secondary d-none d-md-inline" style={{ fontSize: '0.76rem' }}>
                Rol / Acceso (R4):
              </small>
              <select
                className="form-select form-select-sm bg-dark text-light border-secondary"
                style={{ fontSize: '0.78rem', minWidth: 215 }}
                value={rol}
                onChange={(e) => onRolChange(e.target.value)}
              >
                <option value="jefe_operaciones">
                  🛡️ Jefe Operaciones (público + sensible + reservado)
                </option>
                <option value="analista">
                  🔎 Analista OSINT (público + sensible)
                </option>
                <option value="secretario">
                  📊 Ejecutivo / Cliente (solo vista ejecutiva)
                </option>
                <option value="superadmin">
                  ⚡ Superadmin (acceso total + auditoría)
                </option>
              </select>
            </div>
          </div>
        </header>

        <main className="trezo-content">{children}</main>
      </div>
    </div>
  );
};
