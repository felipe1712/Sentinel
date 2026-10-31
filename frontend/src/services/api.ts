import {
  FALLBACK_COLONIAS_GEOJSON,
  FALLBACK_GRAPH,
  FALLBACK_INCIDENTES,
} from '../data/fallbackData';
import { PRESENCIA_GRUPOS_ALCALDIA } from '../data/delictivosData';

const rawEnvUrl = import.meta.env.VITE_API_URL || '';
const API_BASE =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? ''
    : rawEnvUrl.includes('localhost')
    ? ''
    : rawEnvUrl;

async function safeFetch<T>(path: string, init?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    if (fallback !== undefined) return fallback;
    throw new Error(`No se pudo conectar con ${path}`);
  }
}

let cachedColoniasGeoJSON: typeof FALLBACK_COLONIAS_GEOJSON | null = null;

function hasSquareGeometries(features: any[]): boolean {
  if (!features || features.length === 0) return true;
  const sample = features.slice(0, Math.min(20, features.length));
  const squareCount = sample.filter((f) => {
    const ring = f?.geometry?.coordinates?.[0];
    return Array.isArray(ring) && ring.length <= 5;
  }).length;
  return squareCount > sample.length / 2;
}

async function loadStaticColoniasGeoJSON(): Promise<typeof FALLBACK_COLONIAS_GEOJSON> {
  if (cachedColoniasGeoJSON && cachedColoniasGeoJSON.features.length > 100) {
    return cachedColoniasGeoJSON;
  }
  try {
    const res = await fetch('/colonias_cdmx.geojson');
    if (res.ok) {
      const data = await res.json();
      if (data?.features?.length) {
        cachedColoniasGeoJSON = data;
        return data;
      }
    }
  } catch {
    // Fallback al dataset embebido de 26 colonias con polígonos reales
  }
  cachedColoniasGeoJSON = FALLBACK_COLONIAS_GEOJSON;
  return FALLBACK_COLONIAS_GEOJSON;
}

export const uwApi = {
  getColoniasGeoJSON: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/colonias/geojson`);
      if (res.ok) {
        const apiGeo = await res.json();
        const apiFeatures = apiGeo?.features || [];
        // Si el backend ya tiene los 1,543 polígonos reales cargados, usarlos directamente
        if (apiFeatures.length >= 1000 && !hasSquareGeometries(apiFeatures)) {
          cachedColoniasGeoJSON = apiGeo;
          return apiGeo;
        }
        // Si el backend aún tenía cuadrados o solo las 26 colonias semilla, combinar con los 1,543 polígonos reales del shapefile
        const staticGeo = await loadStaticColoniasGeoJSON();
        const byId = new Map<string, any>();
        const byCve = new Map<string, any>();
        for (const f of apiFeatures) {
          if (f?.properties?.id) byId.set(String(f.properties.id), f.properties);
          if (f?.properties?.cve_colonia) byCve.set(String(f.properties.cve_colonia), f.properties);
        }
        const mergedFeatures = staticGeo.features.map((sf) => {
          const match =
            byId.get(String(sf.properties.id)) ||
            byCve.get(String(sf.properties.cve_colonia));
          return match
            ? {
                ...sf,
                properties: {
                  ...sf.properties,
                  id: match.id || sf.properties.id,
                  nivel_riesgo: match.nivel_riesgo || sf.properties.nivel_riesgo,
                  incidentes_count:
                    match.incidentes_count ?? sf.properties.incidentes_count,
                  poblacion: match.poblacion || sf.properties.poblacion,
                },
              }
            : sf;
        });
        const merged = {
          type: 'FeatureCollection' as const,
          features: mergedFeatures,
        };
        cachedColoniasGeoJSON = merged;
        return merged;
      }
    } catch {
      // Backend offline -> cargar GeoJSON estático generado de uw-sf/colonias
    }
    return loadStaticColoniasGeoJSON();
  },

  getColoniaDetalle: async (coloniaId: string) => {
    const pool = cachedColoniasGeoJSON?.features || FALLBACK_COLONIAS_GEOJSON.features;
    const feature =
      pool.find(
        (f) =>
          f.properties.id === coloniaId ||
          f.properties.cve_colonia === coloniaId ||
          f.properties.nombre?.toUpperCase() === coloniaId.toUpperCase()
      ) ||
      FALLBACK_COLONIAS_GEOJSON.features.find((f) => f.properties.id === coloniaId) ||
      FALLBACK_COLONIAS_GEOJSON.features[0];
    const props = feature.properties;
    const incs = FALLBACK_INCIDENTES.filter(
      (i) => i.colonia_id === props.id || i.colonia_nombre === props.nombre
    );
    const alcNorm = (props.alcaldia || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
    const grupoInfo = PRESENCIA_GRUPOS_ALCALDIA.find(
      (g) =>
        g.alcaldia
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase() === alcNorm
    );
    const gruposLocales = props.grupos_locales?.length
      ? props.grupos_locales
      : grupoInfo?.grupos_locales || ['Unión Tepito'];
    const cartelesMedios = props.carteles_medios?.length
      ? props.carteles_medios
      : grupoInfo?.carteles_medios || ['CJNG'];

    const actoresActivos = [
      ...gruposLocales.map((gName, idx) => ({
        id: `fgj-loc-${idx}`,
        nombre: gName,
        tipo: gName.toLowerCase().includes('unión') || gName.toLowerCase().includes('tláhuac') ? 'cartel' : 'banda_local',
        nivel_amenaza: gName.toLowerCase().includes('unión') ? 10 : 8,
        aliases: ['Reconocido FGJ (Transparencia 2024)'],
        descripcion: grupoInfo?.fuente_1 || 'Grupo local reconocido por FGJ-CDMX vía transparencia.',
      })),
      ...cartelesMedios.map((cName, idx) => ({
        id: `med-car-${idx}`,
        nombre: cName,
        tipo: 'cartel',
        nivel_amenaza: 9,
        aliases: ['Atribuido Sedena/Semar/CNI/DEA'],
        descripcion: grupoInfo?.fuente_2 || 'Cártel con presencia atribuida por informes federales en medios.',
      })),
    ];

    const fallback = {
      colonia: {
        ...props,
        fuente_grupos_fgj: grupoInfo?.fuente_1,
        fuente_carteles_medios: grupoInfo?.fuente_2,
        confianza_grupos: grupoInfo?.confianza,
        extorsion_alcaldia_2024: grupoInfo?.extorsion_cobro_carpetas_2024 ?? 0,
        narco_alcaldia_2024: grupoInfo?.narcomenudeo_venta_carpetas_2024 ?? 0,
      },
      incidentes: incs.length ? incs : FALLBACK_INCIDENTES.slice(0, 6),
      estadisticas_por_tipo: [
        { tipo: 'narcomenudeo', count: props.narco_venta ?? 12 },
        { tipo: 'secuestro_despojo', count: props.secuestro_despojo ?? 8 },
        { tipo: 'extorsion', count: props.extorsion_cobro ?? 6 },
        { tipo: 'armas_violencia', count: props.armas_violencia ?? 5 },
      ],
      actores_activos: actoresActivos,
      ultimo_resumen: {
        id: '66666666-0001-4000-a000-000000000001',
        titulo: `Radiografía Ejecutiva FGJ + Sentinel: ${props.nombre} (${props.alcaldia})`,
        resumen: `Colonia clasificada con prioridad ${props.prioridad || 'Media'} en el Índice de Señales Delictivas FGJ-CDMX (${props.total_senales ?? 0} señales acumuladas en ${props.familias_presentes ?? 0} familias: ${props.narco_venta ?? 0} narcomenudeo, ${props.extorsion_cobro ?? 0} extorsión/cobro de piso, ${props.armas_violencia ?? 0} armas/violencia letal y ${props.secuestro_despojo ?? 0} secuestro/despojo). Presencia en alcaldía ${props.alcaldia} de: ${gruposLocales.join(', ')}.`,
        nivel_alerta:
          props.nivel_riesgo === 'critico'
            ? 'emergencia'
            : props.nivel_riesgo === 'alto'
            ? 'alerta'
            : 'vigilancia',
        tokens_usados: 1840,
        fuentes_count: 14,
        puntos_clave: [
          `Índice de Señales FGJ en colonia: ${props.total_senales ?? 0} carpetas prioritarias (Prioridad ${props.prioridad || 'Baja'})`,
          `Grupos reconocidos por FGJ en ${props.alcaldia}: ${gruposLocales.join(', ')}`,
          `Cárteles atribuidos por fuentes federales/medios: ${cartelesMedios.join(', ')}`,
          `Contexto alcaldía 2024: ${grupoInfo?.extorsion_cobro_carpetas_2024 ?? 0} carpetas de extorsión y ${grupoInfo?.narcomenudeo_venta_carpetas_2024 ?? 0} de narcomenudeo`,
        ],
        worldmonitor_data: {
          cii_mexico: 64.2,
          tools_invoked: ['brief_area', 'search_telemetry', 'search_news'],
        },
      },
    };
    const res: any = await safeFetch(`/api/colonias/${coloniaId}`, undefined, fallback);
    if (res?.colonia && res.colonia.total_senales === undefined) {
      res.colonia = { ...fallback.colonia, ...res.colonia };
    }
    return res;
  },

  getIncidentesGeo: async (params: {
    fecha_inicio: string;
    fecha_fin: string;
    tipo?: string | null;
    alcaldia?: string | null;
    rol?: string;
  }) => {
    const q = new URLSearchParams({
      fecha_inicio: params.fecha_inicio,
      fecha_fin: params.fecha_fin,
      ...(params.tipo ? { tipo: params.tipo } : {}),
      ...(params.alcaldia ? { alcaldia: params.alcaldia } : {}),
      ...(params.rol ? { rol: params.rol } : {}),
    });

    const filteredFallback = FALLBACK_INCIDENTES.filter((inc) => {
      const f = inc.fecha_incidente;
      const inDate = f >= params.fecha_inicio && f <= params.fecha_fin;
      const inTipo = !params.tipo || params.tipo === 'todos' || inc.tipo_incidente === params.tipo;
      const inAlc = !params.alcaldia || params.alcaldia === 'todas' || inc.alcaldia === params.alcaldia;
      const inRol =
        params.rol === 'secretario'
          ? inc.nivel_conf === 'publico'
          : params.rol === 'analista'
          ? inc.nivel_conf !== 'reservado'
          : true;
      return inDate && inTipo && inAlc && inRol;
    });

    return safeFetch(
      `/api/incidentes/geo?${q.toString()}`,
      undefined,
      {
        fecha_inicio: params.fecha_inicio,
        fecha_fin: params.fecha_fin,
        rol_activo: params.rol || 'jefe_operaciones',
        total: filteredFallback.length,
        incidentes: filteredFallback,
      }
    );
  },

  getActorGraph: () => safeFetch('/api/actores/graph', undefined, FALLBACK_GRAPH),

  getEmediosJobs: () =>
    safeFetch('/api/emedios/jobs', undefined, {
      jobs: [
        {
          id: '44444444-0001-4000-a000-000000000001',
          fecha_inicio: '2024-01-01',
          fecha_fin: '2024-01-31',
          terminos: ['homicidio', 'extorsión', 'cobro de piso', 'Unión Tepito', 'balacera'],
          publicaciones: ['El Universal', 'La Jornada', 'Milenio', 'Reforma'],
          articulos_total: 142,
          articulos_proc: 142,
          articulos_ok: 139,
          articulos_error: 3,
          checkpoint: { current_month: '2024-01-31', engine: 'lightpanda', ram_mb: 118 },
          status: 'completo',
          modo_ingesta: 'historico',
        },
        {
          id: '44444444-0002-4000-a000-000000000002',
          fecha_inicio: '2026-10-26',
          fecha_fin: '2026-10-28',
          terminos: ['extorsión', 'robo de vehículo', 'narcomenudeo', 'secuestro', 'CJNG'],
          publicaciones: ['El Universal', 'Milenio', 'Crónica', 'La Prensa'],
          articulos_total: 48,
          articulos_proc: 36,
          articulos_ok: 36,
          articulos_error: 0,
          checkpoint: { current_month: '2026-10', engine: 'lightpanda', ram_mb: 121 },
          status: 'corriendo',
          modo_ingesta: 'operativo',
        },
      ],
    }),

  getVigiaSitios: () =>
    safeFetch('/api/vigia/sitios', undefined, {
      sitios: [
        {
          id: '55555555-0001-4000-a000-000000000001',
          url: 'http://cdmxplaza7x4onion.onion/threads/logistica-centro',
          tipo: 'onion',
          nombre: 'Foro Clandestino Logística & Mercados CDMX',
          descripcion: 'Monitoreo Tor con HeadlessX Camoufox + Tor SOCKS5 proxy.',
          keywords: ['Unión Tepito', 'cobro de piso cdmx', 'Masaryk', 'Eje 1 Norte', 'jammer'],
          browser_engine: 'headlessx',
          frecuencia_hrs: 6,
          ultima_captura: new Date(Date.now() - 45 * 60000).toISOString(),
          ultimo_cambio: new Date(Date.now() - 45 * 60000).toISOString(),
          activo: true,
        },
        {
          id: '55555555-0002-4000-a000-000000000002',
          url: 'https://ahmia.fi/search/?q=cdmx+extorsion+plaza',
          tipo: 'surface',
          nombre: 'Monitor Ahmia — Índice Tor CDMX',
          descripcion: 'Rastreo continuo de nuevos dominios .onion vinculados a CDMX.',
          keywords: ['Unión Tepito', 'CJNG Ciudad de México', 'iztapalapa cartel'],
          browser_engine: 'headlessx',
          frecuencia_hrs: 12,
          ultima_captura: new Date(Date.now() - 120 * 60000).toISOString(),
          ultimo_cambio: new Date(Date.now() - 1500 * 60000).toISOString(),
          activo: true,
        },
        {
          id: '55555555-0003-4000-a000-000000000003',
          url: 'http://mexmarket3v9onion.onion/listings/cdmx-credenciales',
          tipo: 'marketplace',
          nombre: 'DarkMarket Credenciales & Accesos .cdmx.gob.mx',
          descripcion: 'Auditoría continua de exposición de infraestructura y jammers.',
          keywords: ['cdmx.gob.mx', 'c5 cdmx', 'padron vehicular', 'escoltas'],
          browser_engine: 'headlessx',
          frecuencia_hrs: 12,
          ultima_captura: new Date(Date.now() - 60 * 60000).toISOString(),
          ultimo_cambio: new Date(Date.now() - 60 * 60000).toISOString(),
          activo: true,
        },
      ],
    }),

  getVigiaCapturas: (sitioId: string) =>
    safeFetch(`/api/vigia/capturas/${sitioId}`, undefined, {
      capturas: [
        {
          id: 'cap-1',
          sitio_id: sitioId,
          screenshot_path: `/data/captures/${sitioId}/cap_latest.png`,
          pixelrag_index: `/data/pixelrag_indexes/${sitioId}`,
          contenido_texto:
            'ALERTA: Nuevo hilo publicado con fotografías de fachadas y croquis de relevo de guardias privados en Av. Presidente Masaryk (Polanco) y bodegas de Morelos.',
          diff_pct: 28.6,
          cambio_detectado: true,
          cambio_descripcion:
            'ALERTA PIXELRAG: Divergencia visual del 28.6% (>15% umbral). Se detectó nuevo bloque de imágenes (croquis de vigilancia en Polanco y listado de placas).',
          created_at: new Date(Date.now() - 45 * 60000).toISOString(),
        },
        {
          id: 'cap-2',
          sitio_id: sitioId,
          screenshot_path: `/data/captures/${sitioId}/cap_prev.png`,
          pixelrag_index: `/data/pixelrag_indexes/${sitioId}`,
          contenido_texto:
            'Thread #402: Horarios de descarga nocturna en Eje 1 Norte y calle Aztecas. Sin nuevos adjuntos.',
          diff_pct: 4.2,
          cambio_detectado: false,
          cambio_descripcion: 'Cambio visual menor (4.2% <= 15% umbral).',
          created_at: new Date(Date.now() - 360 * 60000).toISOString(),
        },
      ],
    }),

  getSkillsStatus: () =>
    safeFetch('/api/admin/skills-status', undefined, {
      environment: 'development',
      all_installed: true,
      skills: [
        {
          id: 'headlessx',
          name: 'HeadlessX (Camoufox Anti-Detect)',
          status: 'active',
          endpoint: 'http://localhost:38473',
          rule: "R2: uwi_sources.browser_engine = 'headlessx' (Dark web / .onion / Cloudflare)",
          version: 'Camoufox C++ Patched / MCP :38473',
        },
        {
          id: 'claude-osint',
          name: 'Claude-OSINT Suite (5 Skills)',
          status: 'active',
          modules: [
            'osint-methodology',
            'offensive-osint',
            'continuous-exposure-monitoring',
            'org-attack-surface',
            'cloud-saas-exposure',
          ],
          rule: 'R4: Niveles de confidencialidad (publico, sensible, reservado) y perfilamiento de actores',
          path: '~/.claude/skills/',
        },
        {
          id: 'lightpanda',
          name: 'Lightpanda Zig Headless Browser',
          status: 'active',
          endpoint: 'ws://localhost:9222',
          rule: "R2: uwi_sources.browser_engine = 'lightpanda' (E-Medios batch nocturno, 120MB RAM)",
          fallback: 'Playwright Chromium',
        },
        {
          id: 'worldmonitor-mcp',
          name: 'WorldMonitor MCP (Global Intelligence)',
          status: 'active',
          endpoint: 'https://worldmonitor.app/mcp',
          tools: ['search_telemetry', 'search_news', 'brief_area', 'entities_near'],
          rule: 'Máximo 3-5 llamadas por resumen ejecutivo Claude',
        },
        {
          id: 'pixelrag',
          name: 'PixelRAG (Qwen3-VL-Embedding-2B + FAISS)',
          status: 'active',
          index_dir: '/data/pixelrag_indexes',
          rule: 'Alerta automática cuando divergencia visual entre capturas > 15%',
        },
      ],
    }),

  getCoberturaHistorica: () =>
    safeFetch('/api/admin/cobertura-historica', undefined, {
      rango: '2016-2026',
      anios: [
        { anio: 2016, incidentes_count: 168, meses_cubiertos: 12, cobertura_pct: 92 },
        { anio: 2017, incidentes_count: 194, meses_cubiertos: 12, cobertura_pct: 94 },
        { anio: 2018, incidentes_count: 235, meses_cubiertos: 12, cobertura_pct: 96 },
        { anio: 2019, incidentes_count: 280, meses_cubiertos: 12, cobertura_pct: 98 },
        { anio: 2020, incidentes_count: 242, meses_cubiertos: 12, cobertura_pct: 95 },
        { anio: 2021, incidentes_count: 265, meses_cubiertos: 12, cobertura_pct: 96 },
        { anio: 2022, incidentes_count: 310, meses_cubiertos: 12, cobertura_pct: 98 },
        { anio: 2023, incidentes_count: 348, meses_cubiertos: 12, cobertura_pct: 99 },
        { anio: 2024, incidentes_count: 59192, meses_cubiertos: 12, cobertura_pct: 100 },
        { anio: 2025, incidentes_count: 20802, meses_cubiertos: 12, cobertura_pct: 100 },
        { anio: 2026, incidentes_count: 14191, meses_cubiertos: 10, cobertura_pct: 100 },
      ],
    }),

  getAuditLogs: () =>
    safeFetch('/api/admin/audit', undefined, {
      audit_logs: [
        {
          id: 'aud-1',
          accion: 'claude.generar_resumen_worldmonitor',
          recurso: 'uwi_colonias:MORELOS (TEPITO)',
          nivel_conf_accedido: 'reservado',
          tokens_usados: 1840,
          confianza_pct: 95,
          fuentes_json: [
            { tipo: 'publico', nombre: 'E-Medios Monitoreo CDMX' },
            { tipo: 'sensible', nombre: 'Telegram ARGOS CDMX' },
            { tipo: 'reservado', nombre: 'Vigía DarkWeb HeadlessX' },
            { tipo: 'worldmonitor_mcp', tools: ['brief_area', 'search_telemetry', 'search_news'] },
          ],
          created_at: new Date(Date.now() - 15 * 60000).toISOString(),
        },
        {
          id: 'aud-2',
          accion: 'claude.classify_text',
          recurso: 'uwi_sitios_mira:Foro Clandestino Logística & Mercados CDMX',
          nivel_conf_accedido: 'reservado',
          tokens_usados: 1180,
          confianza_pct: 88,
          fuentes_json: [{ tipo: 'reservado', nombre: 'HeadlessX Camoufox + Tor' }],
          created_at: new Date(Date.now() - 45 * 60000).toISOString(),
        },
        {
          id: 'aud-3',
          accion: 'claude.classify_text',
          recurso: 'uwi_emedios_articulos:EM-20261026-09',
          nivel_conf_accedido: 'publico',
          tokens_usados: 945,
          confianza_pct: 92,
          fuentes_json: [{ tipo: 'publico', nombre: 'E-Medios Lightpanda Batch' }],
          created_at: new Date(Date.now() - 120 * 60000).toISOString(),
        },
      ],
    }),
};
