import React, { useState } from 'react';
import { AlertaBadge } from '../components/AlertaBadge';

export const Resumenes: React.FC = () => {
  const [resumenes] = useState([
    {
      id: '66666666-0001-4000-a000-000000000001',
      tipo: 'colonia',
      alcaldia: 'Cuauhtémoc',
      titulo:
        'Radiografía Ejecutiva: Colonia Morelos (Tepito) — Persistencia de Extorsión y Riesgo Logístico',
      resumen:
        'El análisis longitudinal (2016–2026) y la telemetría de las últimas 72 horas confirman a la Colonia Morelos como el nodo de mayor densidad de riesgo para operaciones de custodia y logística comercial en la Ciudad de México. Se observa una convergencia entre intimidación presencial a bodegas textiles en calle Aztecas (E-Medios) y la publicación de horarios de carga en foros Tor monitoreados por Vigía (HeadlessX/PixelRAG diff 28.6%).',
      puntos_clave: [
        'Incremento de exigencias de cuota extraordinaria en el cuadrante Eje 1 Norte - Aztecas - Peralvillo',
        'Correlación directa con amenazas detectadas en Dark Web (nivel reservado) sobre horarios de carga',
        'Disputa activa en el borde poniente con Colonia Guerrero (Fuerza Anti-Unión) eleva riesgo nocturno',
        'Recomendación para seguridad privada: escolta doble en traslados de mercancía y rotación de rutas',
      ],
      nivel_alerta: 'emergencia',
      tokens_usados: 1840,
      fuentes_count: 12,
      worldmonitor_data: {
        cii_mexico: 64.2,
        tools_invoked: ['brief_area', 'search_telemetry', 'search_news'],
        national_context:
          'Incremento del 14% en extorsión a corredores logísticos metropolitanos (CDMX-Edomex-Puebla)',
      },
    },
    {
      id: '66666666-0002-4000-a000-000000000002',
      tipo: 'colonia',
      alcaldia: 'Miguel Hidalgo',
      titulo:
        'Radiografía Ejecutiva: Polanco Sección III — Inteligencia Preventiva para Escoltas y Retail de Lujo',
      resumen:
        'Polanco mantiene un nivel de riesgo global Medio, pero presenta alertas focalizadas de alto impacto para servicios de protección ejecutiva y comercios de lujo en Av. Presidente Masaryk y Ejército Nacional. El módulo Vigía detectó un cambio visual del 28.6% en un foro oscuro con croquis de relevos de guardias privados.',
      puntos_clave: [
        'Vigilancia hostil detectada sobre horarios de relevo de seguridad privada en corredor Masaryk',
        'Riesgo focalizado de robo de relojes de alta gama y seguimiento en motocicleta hacia Circuito Interior',
        'Recomendación: desfasar horarios de cambio de turno ±25 minutos y verificar placas en perímetro',
      ],
      nivel_alerta: 'alerta',
      tokens_usados: 1520,
      fuentes_count: 8,
      worldmonitor_data: {
        cii_mexico: 64.2,
        tools_invoked: ['brief_area', 'entities_near'],
        national_context: 'Patrón focalizado en zonas corporativas de alto poder adquisitivo',
      },
    },
  ]);

  return (
    <div>
      <div className="uw-card mb-3">
        <h5 className="mb-1 text-light fw-bold">
          Resúmenes Ejecutivos Claude Sonnet 4.6 + WorldMonitor MCP
        </h5>
        <small className="text-secondary">
          Cada síntesis integra incidentes locales por colonia con telemetría nacional de WorldMonitor MCP
          (máximo 3–5 llamadas por análisis) y registra trazabilidad en <code>uwi_audit</code> (Regla R7).
        </small>
      </div>

      <div className="row g-3">
        {resumenes.map((r) => (
          <div key={r.id} className="col-lg-6">
            <div className="uw-card h-100">
              <div className="uw-card-header">
                <span className="badge bg-dark border border-warning text-warning text-uppercase">
                  {r.tipo} · {r.alcaldia}
                </span>
                <AlertaBadge nivel={r.nivel_alerta} size="md" />
              </div>

              <h5 className="text-light fw-bold mb-2">{r.titulo}</h5>
              <p className="small text-secondary mb-3">{r.resumen}</p>

              <h6 className="small text-uppercase fw-bold" style={{ color: '#FF6B35' }}>
                Puntos Clave & Recomendaciones Operativas
              </h6>
              <ul className="small text-light ps-3 mb-3">
                {r.puntos_clave.map((pt, i) => (
                  <li key={i} className="mb-1">
                    {pt}
                  </li>
                ))}
              </ul>

              <div
                className="p-3 rounded-3"
                style={{ background: '#11141c', border: '1px solid #262c3d' }}
              >
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-warning fw-bold">
                    🌐 WorldMonitor MCP (CII México: {r.worldmonitor_data.cii_mexico})
                  </span>
                  <span className="text-secondary">
                    Audit R7: {r.tokens_usados} tokens · {r.fuentes_count} fuentes
                  </span>
                </div>
                <div className="small text-secondary mb-1">
                  {r.worldmonitor_data.national_context}
                </div>
                <div className="d-flex gap-1 flex-wrap">
                  {r.worldmonitor_data.tools_invoked.map((t) => (
                    <span key={t} className="badge bg-dark border border-secondary text-info">
                      tool: {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
