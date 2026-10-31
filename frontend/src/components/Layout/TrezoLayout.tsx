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
      { path: '/historico', icon: 'history', label: 'Evolución Histórica' },
      { path: '/colonia/11111111-0001-4000-a000-000000000001', icon: 'location_city', label: 'Análisis por Colonia' },
      { path: '/actores', icon: 'hub', label: 'Grafo de Actores' },
      { path: '/resumenes', icon: 'auto_awesome', label: 'Resúmenes Ejecutivos' },
    ],
  },
  {
    title: 'INGESTA E INTELIGENCIA',
    items: [
      { path: '/documentos', icon: 'upload_file', label: 'Carga Documental' },
      { path: '/admin/emedios', icon: 'newspaper', label: 'Monitoreo de Medios' },
      { path: '/admin/vigia', icon: 'visibility', label: 'Vigía Web Profunda' },
      { path: '/admin/skills', icon: 'verified_user', label: 'Auditoría y Estado' },
    ],
  },
];

export const TrezoLayout: React.FC<TrezoLayoutProps> = ({ children, rol, onRolChange }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="trezo-wrapper">
      {/* Barra lateral izquierda */}
      <aside className={`trezo-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="trezo-logo-box">
          <Link to="/" className="trezo-logo-brand">
            <div className="trezo-logo-icon">UW</div>
            {!collapsed && (
              <div>
                <div className="fw-bold" style={{ fontSize: '1.05rem', letterSpacing: '-0.4px' }}>
                  Urban<span style={{ color: '#ea580c' }}>Watch</span>
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
      </aside>

      {/* Área Principal */}
      <div className="trezo-main">
        {/* Barra superior limpia */}
        <header className="trezo-topbar">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold text-secondary small">
              Radiografía de seguridad urbana para la Ciudad de México
            </span>
          </div>

          {/* Selector de Perfil de Acceso */}
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <small className="text-secondary d-none d-md-inline" style={{ fontSize: '0.76rem' }}>
                Perfil de acceso:
              </small>
              <select
                className="form-select form-select-sm bg-white text-dark border-secondary-subtle"
                style={{ fontSize: '0.78rem', minWidth: 200 }}
                value={rol}
                onChange={(e) => onRolChange(e.target.value)}
              >
                <option value="jefe_operaciones">
                  🛡️ Jefe de Operaciones
                </option>
                <option value="analista">
                  🔎 Analista de Inteligencia
                </option>
                <option value="secretario">
                  📊 Vista Ejecutiva
                </option>
                <option value="superadmin">
                  ⚡ Administrador General
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
