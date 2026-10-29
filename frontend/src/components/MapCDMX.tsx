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
}

export const MapCDMX: React.FC<MapCDMXProps> = ({
  fechaInicio,
  fechaFin,
  tipoFiltro,
  alcaldiaFiltro,
  rol = 'jefe_operaciones',
  onColoniaClick,
  onIncidentesLoaded,
}) => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const deck = useRef<MapboxOverlay | null>(null);
  const [incidentes, setIncidentes] = useState<any[]>([]);
  const [coloniasCount, setColoniasCount] = useState<number>(0);

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: divRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-99.1332, 19.4126], // CDMX Centro
      zoom: 11.2,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', async () => {
      const geojson = await uwApi.getColoniasGeoJSON();
      setColoniasCount(geojson.features?.length || 0);

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
            '#1a1a2e',
            '#1a1a2e',
          ],
          'fill-opacity': 0.45,
        },
      });

      map.addLayer({
        id: 'colonias-outline',
        type: 'line',
        source: 'colonias',
        paint: {
          'line-color': '#FF6B35',
          'line-width': 1.1,
          'line-opacity': 0.65,
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

    map.on('mouseenter', 'colonias-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'colonias-fill', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onColoniaClick]);

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
          Polígonos INEGI ({coloniasCount} colonias activas) · Heatmap deck.gl
        </div>
        <div className="d-flex align-items-center gap-3">
          <span>
            <span style={{ color: '#FF0000' }}>■</span> Crítico
          </span>
          <span>
            <span style={{ color: '#FF6B35' }}>■</span> Alto
          </span>
          <span>
            <span style={{ color: '#FFB347' }}>■</span> Medio
          </span>
          <span>
            <span style={{ color: '#3b82f6' }}>■</span> Bajo
          </span>
          <span className="text-secondary">
            | {incidentes.length} eventos en ventana
          </span>
        </div>
      </div>
    </div>
  );
};
