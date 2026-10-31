import React, { useState, useEffect } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cerrar el cajón móvil automáticamente al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="trezo-wrapper">
      {/* Fondo oscuro traslúcido cuando el menú está abierto en móvil / plegable */}
      <div
        className={`trezo-sidebar-backdrop ${mobileOpen ? 'show' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Barra lateral izquierda (fija en escritorio, cajón deslizable en móvil/plegable) */}
      <aside
        className={`trezo-sidebar ${collapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-open' : ''
        }`}
      >
        <div className="trezo-logo-box">
          <Link to="/" className="trezo-logo-brand" onClick={() => setMobileOpen(false)}>
            <div className="trezo-logo-icon">UW</div>
            {(!collapsed || mobileOpen) && (
              <div>
                <div className="fw-bold" style={{ fontSize: '1.02rem', letterSpacing: '-0.4px' }}>
                  Urban<span style={{ color: '#ea580c' }}>Watch</span>
                </div>
                <div className="text-secondary" style={{ fontSize: '0.65rem' }}>
                  uw.sentineliq.com.mx
                </div>
              </div>
            )}
          </Link>

          {/* Botón contraer solo en escritorio */}
          <button
            type="button"
            className="btn btn-sm text-secondary p-1 d-none d-lg-inline-flex"
            onClick={() => setCollapsed(!collapsed)}
            title="Contraer menú"
          >
            <span className="material-symbols-outlined">menu_open</span>
          </button>

          {/* Botón cerrar cajón en móvil / plegable */}
          <button
            type="button"
            className="btn btn-sm text-secondary p-1 d-lg-none"
            onClick={() => setMobileOpen(false)}
            title="Cerrar menú"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-grow-1 overflow-auto py-2">
          {MENU_SECTIONS.map((sec) => (
            <div key={sec.title}>
              {(!collapsed || mobileOpen) && (
                <div className="trezo-section-label">{sec.title}</div>
              )}
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
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        {(!collapsed || mobileOpen) && <span>{item.label}</span>}
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
        {/* Barra superior adaptativa */}
        <header className="trezo-topbar">
          <div className="d-flex align-items-center gap-2 min-w-0">
            {/* Botón hamburguesa para abrir el menú en iPhone / Samsung Fold */}
            <button
              type="button"
              className="btn btn-sm btn-light border d-lg-none p-1 d-flex align-items-center justify-content-center"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <Link
              to="/"
              className="d-flex d-lg-none align-items-center gap-1 text-decoration-none text-dark fw-bold me-1"
              style={{ fontSize: '0.95rem' }}
            >
              Urban<span style={{ color: '#ea580c' }}>Watch</span>
            </Link>

            <span className="fw-semibold text-secondary small d-none d-md-inline text-truncate">
              Radiografía de seguridad urbana para la Ciudad de México
            </span>
          </div>

          {/* Selector de Perfil de Acceso */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            <small className="text-secondary d-none d-xl-inline" style={{ fontSize: '0.76rem' }}>
              Perfil de acceso:
            </small>
            <select
              className="form-select form-select-sm bg-white text-dark border-secondary-subtle"
              style={{ fontSize: '0.78rem', width: 'auto', maxWidth: '100%' }}
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
        </header>

        <main className="trezo-content">{children}</main>
      </div>
    </div>
  );
};
