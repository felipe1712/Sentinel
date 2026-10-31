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
  { value: '', label: 'Todas las familias Sentinel (46,116 pts)' },
  { value: '1 Extorsión', label: '1 Extorsión (2,313)', color: '#EF4444' },
  { value: '6 Mercado ilegal (narcomenudeo)', label: '6 Narcomenudeo (2,843)', color: '#A855F7' },
  { value: '5 Violencia y armas', label: '5 Violencia y armas (1,530)', color: '#DC2626' },
  { value: '4 Despojo y allanamiento', label: '4 Despojo y allanamiento (2,469)', color: '#F97316' },
  { value: '2 Robo a negocio', label: '2 Robo a negocio (7,049)', color: '#F59E0B' },
  { value: '3 Delincuencia común', label: '3 Delincuencia común (29,912)', color: '#38BDF8' },
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
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
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
            '#FF0000',
            'alto',
            '#FF6B35',
            'medio',
            '#FFB347',
            'bajo',
            '#1e3a5f',
            '#1e3a5f',
          ],
          'fill-opacity': 0.42,
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
            '#FF3B30',
            'alto',
            '#FF6B35',
            'medio',
            '#FFB347',
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
          'line-color': '#FFFFFF',
          'line-width': 2.2,
          'line-opacity': 0.95,
        },
      });

      // Capa GeoJSON oficial de 46,116 puntos prioritarios (uw-sf/sentinel_prioritarios.geojson)
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
            1.2,
            12,
            2.4,
            15,
            4.5,
          ],
          'circle-color': [
            'match',
            ['get', 'fam'],
            '1 Extorsión',
            '#EF4444',
            '6 Mercado ilegal (narcomenudeo)',
            '#A855F7',
            '5 Violencia y armas',
            '#DC2626',
            '4 Despojo y allanamiento',
            '#F97316',
            '2 Robo a negocio',
            '#F59E0B',
            '3 Delincuencia común',
            '#38BDF8',
            '#FF6B35',
          ],
          'circle-opacity': 0.68,
          'circle-stroke-width': 0.3,
          'circle-stroke-color': '#0d0d0d',
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

  // Filtrar polígonos y capa prioritarios por alcaldía y familia Sentinel
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

  // Actualizar HeatmapLayer de deck.gl cuando cambian los incidentes
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
          intensity: 1.4,
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
        style={{ minHeight: 510, border: '1px solid #262c3d' }}
      />

      {/* Controles de capa sentinel_prioritarios.geojson en esquina superior derecha (junto a zoom) */}
      <div
        className="position-absolute top-0 end-0 me-5 mt-2 p-2 rounded-3 d-flex align-items-center gap-2"
        style={{
          background: 'rgba(13, 13, 13, 0.90)',
          border: '1px solid #262c3d',
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
          <label className="form-check-label text-light fw-semibold" htmlFor="toggleSentinelPts">
            GeoJSON Prioritarios
          </label>
        </div>
        {showPrioritarios && (
          <select
            className="form-select form-select-sm bg-dark text-light border-secondary py-0"
            style={{ fontSize: '0.72rem', width: 225 }}
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
          className="position-absolute top-0 start-0 m-3 px-3 py-2 rounded-3"
          style={{
            background: 'rgba(13, 13, 13, 0.94)',
            border: '1px solid #FF6B35',
            backdropFilter: 'blur(6px)',
            fontSize: '0.75rem',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <div className="fw-bold text-light">
            {hoveredColonia.nombre}{' '}
            <span className="badge bg-dark border border-secondary text-warning ms-1">
              Prioridad {hoveredColonia.prioridad}
            </span>
          </div>
          <div className="text-secondary mb-1">
            {hoveredColonia.alcaldia} · CVE{' '}
            <span style={{ color: '#FF6B35' }}>{hoveredColonia.cve_colonia}</span> · Riesgo{' '}
            <span className="text-uppercase fw-semibold text-warning">
              {hoveredColonia.nivel_riesgo}
            </span>
          </div>
          <div className="d-flex gap-2 small" style={{ fontSize: '0.7rem' }}>
            <span className="text-light">
              Señales FGJ: <strong style={{ color: '#FF6B35' }}>{hoveredColonia.total_senales}</strong>
            </span>
            <span className="text-secondary">|</span>
            <span className="text-info">Narco: {hoveredColonia.narco_venta}</span>
            <span className="text-danger">Extorsión: {hoveredColonia.extorsion_cobro}</span>
            <span className="text-warning">Armas: {hoveredColonia.armas_violencia}</span>
            <span className="text-light">Despojo/Sec.: {hoveredColonia.secuestro_despojo}</span>
          </div>
        </div>
      )}

      {/* Leyenda superpuesta */}
      <div
        className="position-absolute bottom-0 start-0 m-3 p-2 rounded-3"
        style={{
          background: 'rgba(13, 13, 13, 0.88)',
          border: '1px solid #262c3d',
          backdropFilter: 'blur(6px)',
          fontSize: '0.73rem',
        }}
      >
        <div className="fw-bold mb-1" style={{ color: '#FF6B35' }}>
          Polígonos Oficiales CDMX ({coloniasCount.toLocaleString()} colonias) · Sentinel Prioritarios (46,116 pts)
        </div>
        <div className="d-flex flex-wrap align-items-center gap-3">
          <span>
            <span style={{ color: '#FF0000' }}>■</span> Crítico (26)
          </span>
          <span>
            <span style={{ color: '#FF6B35' }}>■</span> Alto (52)
          </span>
          <span>
            <span style={{ color: '#FFB347' }}>■</span> Medio (270)
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
