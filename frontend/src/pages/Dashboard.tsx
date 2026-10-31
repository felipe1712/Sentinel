import React, { useState } from 'react';
import { MapCDMX } from '../components/MapCDMX';
import { TimeSlider } from '../components/TimeSlider';
import { ColoniaPanel } from '../components/ColoniaPanel';
import { IncidenteCard } from '../components/IncidenteCard';
import { AlertaBadge } from '../components/AlertaBadge';
import {
  ESTADISTICAS_DELICTIVOS,
  RESUMEN_FENOMENOS,
  TOP_COLONIAS_SENALES,
} from '../data/delictivosData';

interface DashboardProps {
  rol: string;
}

const TIPOS_DELITO = [
  { value: '', label: 'Todos los tipos de incidente' },
  { value: 'extorsion', label: 'Extorsión / Cobro de piso' },
  { value: 'homicidio', label: 'Homicidio doloso / Arma de fuego' },
  { value: 'robo_vehiculo', label: 'Robo de vehículo / Transporte carga' },
  { value: 'robo_negocio', label: 'Robo a negocio / Intrusión' },
  { value: 'robo_transeunte', label: 'Robo a transeúnte / Pasajero' },
  { value: 'narcomenudeo', label: 'Narcomenudeo / Puntos de venta' },
  { value: 'secuestro', label: 'Secuestro / Privación ilegal' },
  { value: 'presencia_criminal', label: 'Despojo / Allanamiento / Halconeo' },
];

const ALCALDIAS = [
  '',
  'Álvaro Obregón',
  'Azcapotzalco',
  'Benito Juárez',
  'Coyoacán',
  'Cuajimalpa de Morelos',
  'Cuauhtémoc',
  'Gustavo A. Madero',
  'Iztacalco',
  'Iztapalapa',
  'La Magdalena Contreras',
  'Miguel Hidalgo',
  'Milpa Alta',
  'Tláhuac',
  'Tlalpan',
  'Venustiano Carranza',
  'Xochimilco',
];

export const Dashboard: React.FC<DashboardProps> = ({ rol }) => {
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date(2016, 0, 1));
  const [fechaFin, setFechaFin] = useState<Date>(new Date());
  const [tipoFiltro, setTipoFiltro] = useState<string | null>(null);
  const [alcaldiaFiltro, setAlcaldiaFiltro] = useState<string | null>(null);
  const [selectedColoniaId, setSelectedColoniaId] = useState<string | null>(
    '11111111-0001-4000-a000-000000000001'
  );
  const [incidentesEnVentana, setIncidentesEnVentana] = useState<any[]>([]);
  const [coloniasCount, setColoniasCount] = useState<number>(
    ESTADISTICAS_DELICTIVOS.total_colonias_cdmx
  );

  // Agrupar resumen_fenomenos por familia
  const familiasMap = RESUMEN_FENOMENOS.reduce<
    Record<string, { total: number; items: typeof RESUMEN_FENOMENOS }>
  >((acc, cur) => {
    if (!acc[cur.familia]) {
      acc[cur.familia] = { total: 0, items: [] };
    }
    acc[cur.familia].total += cur.carpetas;
    acc[cur.familia].items.push(cur);
    return acc;
  }, {});

  return (
    <div>
      {/* KPIs ejecutivos */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="uw-kpi-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-secondary fw-semibold">POLÍGONOS OFICIALES CDMX</small>
              <span className="material-symbols-outlined" style={{ color: '#ea580c' }}>
                map
              </span>
            </div>
            <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2">
              <h3 className="mb-0 fw-bold text-dark">{coloniasCount.toLocaleString()}</h3>
              <span className="badge bg-light border text-secondary">
                16 Alcaldías
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="uw-kpi-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-secondary fw-semibold">COLONIAS PRIORIDAD ALTA</small>
              <span className="material-symbols-outlined text-danger">warning</span>
            </div>
            <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2">
              <h3 className="mb-0 fw-bold text-danger">
                {ESTADISTICAS_DELICTIVOS.colonias_prioridad_alta}{' '}
                <small className="fs-6 text-secondary fw-normal">
                  ({ESTADISTICAS_DELICTIVOS.colonias_riesgo_critico} críticas)
                </small>
              </h3>
              <AlertaBadge nivel="critico" />
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="uw-kpi-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-secondary fw-semibold">DELITOS ALTO IMPACTO</small>
              <span className="material-symbols-outlined" style={{ color: '#ea580c' }}>
                analytics
              </span>
            </div>
            <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2">
              <h3 className="mb-0 fw-bold" style={{ color: '#ea580c' }}>
                {ESTADISTICAS_DELICTIVOS.total_alto_impacto_2024_2026.toLocaleString()}
              </h3>
              <small className="text-secondary">
                Carpetas FGJ · {incidentesEnVentana.length} en vista
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="uw-kpi-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-secondary fw-semibold">PUNTOS PRIORITARIOS</small>
              <span className="material-symbols-outlined text-primary">crisis_alert</span>
            </div>
            <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2">
              <h3 className="mb-0 fw-bold text-dark">
                {ESTADISTICAS_DELICTIVOS.total_sentinel_prioritarios_geojson.toLocaleString()}
              </h3>
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                {ESTADISTICAS_DELICTIVOS.total_senales_indice.toLocaleString()} señales índice
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de filtros + Línea de Tiempo */}
      <div className="row g-3 mb-3">
        <div className="col-lg-7">
          <TimeSlider
            onChange={(ini, fin) => {
              setFechaInicio(ini);
              setFechaFin(fin);
            }}
          />
        </div>
        <div className="col-lg-5">
          <div className="uw-card h-100 d-flex flex-column justify-content-center">
            <div className="row g-2">
              <div className="col-sm-6">
                <label className="form-label small text-secondary mb-1">
                  Filtrar por Delito
                </label>
                <select
                  className="form-select form-select-sm bg-white text-dark border-secondary-subtle"
                  value={tipoFiltro || ''}
                  onChange={(e) => setTipoFiltro(e.target.value || null)}
                >
                  {TIPOS_DELITO.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-sm-6">
                <label className="form-label small text-secondary mb-1">
                  Filtrar por Alcaldía
                </label>
                <select
                  className="form-select form-select-sm bg-white text-dark border-secondary-subtle"
                  value={alcaldiaFiltro || ''}
                  onChange={(e) => setAlcaldiaFiltro(e.target.value || null)}
                >
                  <option value="">Todas las Alcaldías</option>
                  {ALCALDIAS.filter(Boolean).map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa principal y Panel Lateral de Colonia */}
      <div className="row g-3 mb-4">
        <div className="col-xl-8">
          <div className="uw-card p-2" style={{ height: 575 }}>
            <MapCDMX
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              tipoFiltro={tipoFiltro}
              alcaldiaFiltro={alcaldiaFiltro}
              rol={rol}
              onColoniaClick={(id) => setSelectedColoniaId(id)}
              onIncidentesLoaded={setIncidentesEnVentana}
              onColoniasLoaded={setColoniasCount}
            />
          </div>
        </div>
        <div className="col-xl-4">
          <ColoniaPanel coloniaId={selectedColoniaId} height={575} />
        </div>
      </div>

      {/* Paneles de Inteligencia Delictiva */}
      <div className="row g-3 mb-4">
        <div className="col-xl-7">
          <div className="uw-card h-100">
            <div className="uw-card-header">
              <div>
                <h6 className="mb-0 text-dark fw-bold">
                  Top Colonias por Índice de Señales Delictivas FGJ
                </h6>
                <small className="text-secondary">
                  Haz clic en cualquier colonia para consultar su radiografía operativa en el panel
                </small>
              </div>
            </div>
            <div className="table-responsive" style={{ maxHeight: 340 }}>
              <table className="table table-hover table-sm align-middle mb-0" style={{ fontSize: '0.76rem', minWidth: 620 }}>
                <thead className="table-light">
                  <tr className="text-secondary">
                    <th>#</th>
                    <th>Colonia</th>
                    <th>Alcaldía</th>
                    <th className="text-end text-primary">Narco</th>
                    <th className="text-end text-danger">Extorsión</th>
                    <th className="text-end" style={{ color: '#d97706' }}>Armas</th>
                    <th className="text-end">Despojo/Sec.</th>
                    <th className="text-end" style={{ color: '#ea580c' }}>Total</th>
                    <th>Prioridad</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_COLONIAS_SENALES.slice(0, 20).map((col, idx) => (
                    <tr
                      key={`${col.alcaldia}-${col.colonia}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedColoniaId(col.colonia)}
                    >
                      <td className="text-secondary">{idx + 1}</td>
                      <td className="fw-bold text-dark">{col.colonia}</td>
                      <td className="text-secondary">{col.alcaldia}</td>
                      <td className="text-end text-primary fw-semibold">{col.narco_venta}</td>
                      <td className="text-end text-danger fw-semibold">{col.extorsion_cobro}</td>
                      <td className="text-end fw-semibold" style={{ color: '#d97706' }}>{col.armas_violencia}</td>
                      <td className="text-end text-dark">{col.secuestro_despojo}</td>
                      <td className="text-end fw-bold" style={{ color: '#ea580c' }}>
                        {col.total_senales}
                      </td>
                      <td>
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                          {col.prioridad}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-xl-5">
          <div className="uw-card h-100">
            <div className="uw-card-header">
              <div>
                <h6 className="mb-0 text-dark fw-bold">
                  Resumen de Fenómenos Delictivos FGJ
                </h6>
                <small className="text-secondary">
                  Distribución en 8 familias delictivas y 20 categorías operativas
                </small>
              </div>
            </div>
            <div className="overflow-auto pe-1" style={{ maxHeight: 340 }}>
              {Object.entries(familiasMap).map(([famName, famData]) => (
                <div
                  key={famName}
                  className="p-2 rounded-3 mb-2"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-dark small">{famName}</span>
                    <span className="badge" style={{ background: '#ea580c', color: '#fff' }}>
                      {famData.total.toLocaleString()} carpetas
                    </span>
                  </div>
                  {famData.items.map((cat) => (
                    <div
                      key={cat.categoria}
                      className="d-flex justify-content-between small text-secondary"
                      style={{ fontSize: '0.73rem' }}
                    >
                      <span>• {cat.categoria}</span>
                      <span className="text-dark fw-semibold">
                        {cat.carpetas.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feed de incidentes */}
      <div className="uw-card">
        <div className="uw-card-header">
          <div>
            <h6 className="mb-0 text-dark fw-bold">
              Bitácora Georreferenciada de Alto Impacto ({incidentesEnVentana.length})
            </h6>
            <small className="text-secondary">
              Eventos filtrados por fecha del incidente y nivel de acceso autorizado
            </small>
          </div>
        </div>
        <div className="row g-2">
          {incidentesEnVentana.slice(0, 30).map((inc) => (
            <div key={inc.id} className="col-md-6">
              <IncidenteCard
                incidente={inc}
                onSelectColonia={(cid) => setSelectedColoniaId(cid)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
