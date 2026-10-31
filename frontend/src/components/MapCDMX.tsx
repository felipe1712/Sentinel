import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { uwApi } from '../services/api';

interface MapCDMXProps {
  fechaInicio: Date;
  fechaFin: Date;
  tipoFiltro: string | null;
  alcaldiaFiltro?: string | null;
  rol?: string;
  onColoniaClick: (coloniaId: string) => void;
  onIncidentesLoaded?: (incidentes: any[]) => void;
  onColoniasLoaded?: (count: number) => void;
}

const FAMILIAS_SENTINEL = [
  { value: '', label: 'Todas las familias prioritarias (46,116)' },
  { value: '1 Extorsión', label: '1 Extorsión (2,313)', color: '#dc2626' },
  { value: '6 Mercado ilegal (narcomenudeo)', label: '6 Narcomenudeo (2,843)', color: '#9333ea' },
  { value: '5 Violencia y armas', label: '5 Violencia y armas (1,530)', color: '#b91c1c' },
  { value: '4 Despojo y allanamiento', label: '4 Despojo y allanamiento (2,469)', color: '#ea580c' },
  { value: '2 Robo a negocio', label: '2 Robo a negocio (7,049)', color: '#d97706' },
  { value: '3 Delincuencia común', label: '3 Delincuencia común (29,912)', color: '#0284c7' },
];

export const MapCDMX: React.FC<MapCDMXProps> = ({
  fechaInicio,
  fechaFin,
  tipoFiltro,
  alcaldiaFiltro,
  rol = 'jefe_operaciones',
  onColoniaClick,
  onIncidentesLoaded,
  onColoniasLoaded,
}) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const deck = useRef<MapboxOverlay | null>(null);
  const [incidentes, setIncidentes] = useState<any[]>([]);
  const [coloniasCount, setColoniasCount] = useState<number>(0);
  const [showPrioritarios, setShowPrioritarios] = useState<boolean>(true);
  const [familiaSentinel, setFamiliaSentinel] = useState<string>('');
  const [hoveredColonia, setHoveredColonia] = useState<{
    nombre: string;
    alcaldia: string;
    cve_colonia: string;
    nivel_riesgo: string;
    total_senales: number;
    narco_venta: number;
    extorsion_cobro: number;
    armas_violencia: number;
    secuestro_despojo: number;
    prioridad: string;
  } | null>(null);

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: divRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [-99.1332, 19.385],
      zoom: 10.6,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', async () => {
      const geojson = await uwApi.getColoniasGeoJSON();
      const count = geojson.features?.length || 0;
      setColoniasCount(count);
      onColoniasLoaded?.(count);

      map.addSource('colonias', {
        type: 'geojson',
        data: geojson as any,
      });

      map.addLayer({
        id: 'colonias-fill',
        type: 'fill',
        source: 'colonias',
        paint: {
          'fill-color': [
            'match',
            ['get', 'nivel_riesgo'],
            'critico',
            '#dc2626',
            'alto',
            '#ea580c',
            'medio',
            '#f59e0b',
            'bajo',
            '#93c5fd',
            '#93c5fd',
          ],
          'fill-opacity': 0.34,
        },
      });

      map.addLayer({
        id: 'colonias-outline',
        type: 'line',
        source: 'colonias',
        paint: {
          'line-color': [
            'match',
            ['get', 'nivel_riesgo'],
            'critico',
            '#b91c1c',
            'alto',
            '#c2410c',
            'medio',
            '#d97706',
            '#3b82f6',
          ],
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9,
            0.4,
            12,
            1.0,
            15,
            1.8,
          ],
          'line-opacity': 0.72,
        },
      });

      map.addLayer({
        id: 'colonias-hover',
        type: 'line',
        source: 'colonias',
        filter: ['==', ['get', 'cve_colonia'], ''],
        paint: {
          'line-color': '#0f172a',
          'line-width': 2.4,
          'line-opacity': 0.95,
        },
      });

      // Capa GeoJSON oficial de 46,116 puntos prioritarios
      map.addSource('sentinel-prioritarios', {
        type: 'geojson',
        data: '/sentinel_prioritarios.geojson',
      });

      map.addLayer({
        id: 'sentinel-prioritarios-pts',
        type: 'circle',
        source: 'sentinel-prioritarios',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9,
            1.3,
            12,
            2.5,
            15,
            4.5,
          ],
          'circle-color': [
            'match',
            ['get', 'fam'],
            '1 Extorsión',
            '#dc2626',
            '6 Mercado ilegal (narcomenudeo)',
            '#9333ea',
            '5 Violencia y armas',
            '#b91c1c',
            '4 Despojo y allanamiento',
            '#ea580c',
            '2 Robo a negocio',
            '#d97706',
            '3 Delincuencia común',
            '#0284c7',
            '#ea580c',
          ],
          'circle-opacity': 0.72,
          'circle-stroke-width': 0.4,
          'circle-stroke-color': '#ffffff',
        },
      });

      deck.current = new MapboxOverlay({ layers: [] });
      map.addControl(deck.current as any);
    });

    map.on('click', 'colonias-fill', (e) => {
      const props = e.features?.[0]?.properties;
      if (props?.id) {
        onColoniaClick(String(props.id));
      }
    });

    map.on('mousemove', 'colonias-fill', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const props = e.features?.[0]?.properties;
      if (props) {
        setHoveredColonia({
          nombre: String(props.nombre || ''),
          alcaldia: String(props.alcaldia || ''),
          cve_colonia: String(props.cve_colonia || ''),
          nivel_riesgo: String(props.nivel_riesgo || 'bajo'),
          total_senales: Number(props.total_senales ?? props.incidentes_count ?? 0),
          narco_venta: Number(props.narco_venta ?? 0),
          extorsion_cobro: Number(props.extorsion_cobro ?? 0),
          armas_violencia: Number(props.armas_violencia ?? 0),
          secuestro_despojo: Number(props.secuestro_despojo ?? 0),
          prioridad: String(props.prioridad || 'Baja'),
        });
        if (map.getLayer('colonias-hover')) {
          map.setFilter('colonias-hover', [
            '==',
            ['get', 'cve_colonia'],
            String(props.cve_colonia || ''),
          ]);
        }
      }
    });

    map.on('mouseleave', 'colonias-fill', () => {
      map.getCanvas().style.cursor = '';
      setHoveredColonia(null);
      if (map.getLayer('colonias-hover')) {
        map.setFilter('colonias-hover', ['==', ['get', 'cve_colonia'], '']);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onColoniaClick, onColoniasLoaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const colFilter = alcaldiaFiltro
      ? (['==', ['get', 'alcaldia'], alcaldiaFiltro] as any)
      : null;
    if (map.getLayer('colonias-fill')) {
      map.setFilter('colonias-fill', colFilter);
    }
    if (map.getLayer('colonias-outline')) {
      map.setFilter('colonias-outline', colFilter);
    }

    if (map.getLayer('sentinel-prioritarios-pts')) {
      map.setLayoutProperty(
        'sentinel-prioritarios-pts',
        'visibility',
        showPrioritarios ? 'visible' : 'none'
      );
      const ptsFilters: any[] = ['all'];
      if (familiaSentinel) {
        ptsFilters.push(['==', ['get', 'fam'], familiaSentinel]);
      }
      if (alcaldiaFiltro) {
        const alcUpper = alcaldiaFiltro
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase();
        ptsFilters.push(['==', ['get', 'alc'], alcUpper]);
      }
      map.setFilter(
        'sentinel-prioritarios-pts',
        ptsFilters.length > 1 ? (ptsFilters as any) : null
      );
    }
  }, [alcaldiaFiltro, showPrioritarios, familiaSentinel]);

  useEffect(() => {
    if (!deck.current) return;
    deck.current.setProps({
      layers: [
        new HeatmapLayer({
          id: 'heatmap',
          data: incidentes,
          getPosition: (d: any) => [Number(d.lng), Number(d.lat)],
          getWeight: (d: any) => Number(d.severidad || 5),
          radiusPixels: 42,
          intensity: 1.3,
          threshold: 0.08,
        }),
      ],
    });
  }, [incidentes]);

  const loadData = useCallback(async () => {
    const data = await uwApi.getIncidentesGeo({
      fecha_inicio: fechaInicio.toISOString().split('T')[0],
      fecha_fin: fechaFin.toISOString().split('T')[0],
      tipo: tipoFiltro,
      alcaldia: alcaldiaFiltro,
      rol,
    });
    const list = data.incidentes ?? [];
    setIncidentes(list);
    onIncidentesLoaded?.(list);
  }, [fechaInicio, fechaFin, tipoFiltro, alcaldiaFiltro, rol, onIncidentesLoaded]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="position-relative w-100 h-100" style={{ minHeight: 510 }}>
      <div
        ref={divRef}
        className="w-100 h-100 rounded-3 overflow-hidden"
        style={{ minHeight: 510, border: '1px solid #cbd5e1' }}
      />

      {/* Controles de capa prioritarios en esquina superior derecha */}
      <div
        className="position-absolute top-0 end-0 me-5 mt-2 p-2 rounded-3 d-flex align-items-center gap-2 shadow-sm"
        style={{
          background: 'rgba(255, 255, 255, 0.94)',
          border: '1px solid #cbd5e1',
          backdropFilter: 'blur(6px)',
          fontSize: '0.73rem',
          zIndex: 4,
        }}
      >
        <div className="form-check form-switch mb-0">
          <input
            className="form-check-input"
            type="checkbox"
            id="toggleSentinelPts"
            checked={showPrioritarios}
            onChange={(e) => setShowPrioritarios(e.target.checked)}
          />
          <label className="form-check-label text-dark fw-semibold" htmlFor="toggleSentinelPts">
            Puntos Prioritarios
          </label>
        </div>
        {showPrioritarios && (
          <select
            className="form-select form-select-sm bg-white text-dark border-secondary-subtle py-0"
            style={{ fontSize: '0.72rem', width: 220 }}
            value={familiaSentinel}
            onChange={(e) => setFamiliaSentinel(e.target.value)}
          >
            {FAMILIAS_SENTINEL.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tooltip superior al pasar el cursor sobre cualquier polígono real */}
      {hoveredColonia && (
        <div
          className="position-absolute top-0 start-0 m-3 px-3 py-2 rounded-3 shadow-sm"
          style={{
            background: 'rgba(255, 255, 255, 0.96)',
            border: '1px solid #ea580c',
            backdropFilter: 'blur(6px)',
            fontSize: '0.75rem',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <div className="fw-bold text-dark">
            {hoveredColonia.nombre}{' '}
            <span className="badge bg-warning-subtle text-dark border border-warning ms-1">
              Prioridad {hoveredColonia.prioridad}
            </span>
          </div>
          <div className="text-secondary mb-1">
            {hoveredColonia.alcaldia} · CVE{' '}
            <span style={{ color: '#ea580c' }}>{hoveredColonia.cve_colonia}</span> · Riesgo{' '}
            <span className="text-uppercase fw-semibold" style={{ color: '#c2410c' }}>
              {hoveredColonia.nivel_riesgo}
            </span>
          </div>
          <div className="d-flex gap-2 small" style={{ fontSize: '0.7rem' }}>
            <span className="text-dark">
              Señales FGJ: <strong style={{ color: '#ea580c' }}>{hoveredColonia.total_senales}</strong>
            </span>
            <span className="text-secondary">|</span>
            <span className="text-primary fw-semibold">Narco: {hoveredColonia.narco_venta}</span>
            <span className="text-danger fw-semibold">Extorsión: {hoveredColonia.extorsion_cobro}</span>
            <span style={{ color: '#d97706' }} className="fw-semibold">
              Armas: {hoveredColonia.armas_violencia}
            </span>
            <span className="text-dark">Despojo/Sec.: {hoveredColonia.secuestro_despojo}</span>
          </div>
        </div>
      )}

      {/* Leyenda superpuesta */}
      <div
        className="position-absolute bottom-0 start-0 m-3 p-2 rounded-3 shadow-sm"
        style={{
          background: 'rgba(255, 255, 255, 0.94)',
          border: '1px solid #cbd5e1',
          backdropFilter: 'blur(6px)',
          fontSize: '0.73rem',
        }}
      >
        <div className="fw-bold mb-1" style={{ color: '#ea580c' }}>
          Polígonos Oficiales CDMX ({coloniasCount.toLocaleString()} colonias) · Puntos Prioritarios (46,116)
        </div>
        <div className="d-flex flex-wrap align-items-center gap-3 text-dark">
          <span>
            <span style={{ color: '#dc2626' }}>■</span> Crítico (26)
          </span>
          <span>
            <span style={{ color: '#ea580c' }}>■</span> Alto (52)
          </span>
          <span>
            <span style={{ color: '#f59e0b' }}>■</span> Medio (270)
          </span>
          <span>
            <span style={{ color: '#3b82f6' }}>■</span> Bajo (1,195)
          </span>
          <span className="text-secondary">
            | {incidentes.length} eventos en bitácora
          </span>
        </div>
      </div>
    </div>
  );
};
