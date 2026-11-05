import React, { useEffect, useState } from 'react';
import { uwApi } from '../services/api';

export const Vigia: React.FC = () => {
  const [sitios, setSitios] = useState<any[]>([]);
  const [selectedSitioId, setSelectedSitioId] = useState<string>(
    '55555555-0001-4000-a000-000000000001'
  );
  const [capturas, setCapturas] = useState<any[]>([]);
  const [capturando, setCapturando] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  useEffect(() => {
    uwApi.getVigiaSitios().then((res) => setSitios(res.sitios || []));
  }, []);

  useEffect(() => {
    if (!selectedSitioId) return;
    uwApi.getVigiaCapturas(selectedSitioId).then((res) => setCapturas(res.capturas || []));
  }, [selectedSitioId]);

  const handleTriggerCapture = async (sitioId: string) => {
    setCapturando(true);
    try {
      const r = await fetch(`/api/vigia/sitios/${sitioId}/capture`, { method: 'POST' });
      if (r.ok) {
        const cap = await r.json();
        setCapturas((prev) => [
          {
            id: cap.captura_id,
            sitio_id: sitioId,
            screenshot_path: cap.screenshot_path,
            pixelrag_index: cap.pixelrag_index,
            contenido_texto: cap.contenido_texto || cap.cambio_descripcion,
            diff_pct: cap.diff_pct,
            cambio_detectado: cap.cambio_detectado,
            cambio_descripcion: cap.cambio_descripcion,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch {
      // fallback
    } finally {
      setCapturando(false);
    }
  };

  const sitiosFiltrados = sitios.filter((s) => {
    if (filtroTipo === 'todos') return true;
    return s.tipo === filtroTipo;
  });

  const sitioSeleccionado = sitios.find((s) => s.id === selectedSitioId);

  return (
    <div>
      <div className="uw-card mb-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h5 className="mb-0 text-dark fw-bold">
              Vigía Web Profunda y Monitoreo Territorial
            </h5>
            <small className="text-secondary">
              Seguimiento continuo de portales clandestinos, fuentes abiertas y detección de alteraciones tácticas
            </small>
          </div>
          <span className="badge bg-danger px-3 py-2">
            Nivel de Confidencialidad: RESERVADO
          </span>
        </div>
      </div>

      <div className="row g-3">
        {/* Columna Izquierda: Objetivos en Monitoreo */}
        <div className="col-lg-6">
          <div className="uw-card h-100">
            <div className="uw-card-header">
              <div className="d-flex justify-content-between align-items-center w-100">
                <h6 className="mb-0 text-dark fw-bold">Objetivos en Monitoreo</h6>
                <div className="d-flex gap-1">
                  {['todos', 'onion', 'surface', 'marketplace'].map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      className={`btn btn-sm py-0 px-2 text-capitalize ${
                        filtroTipo === tipo ? 'btn-dark' : 'btn-outline-secondary'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                      onClick={() => setFiltroTipo(tipo)}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {sitiosFiltrados.map((s) => (
              <div
                key={s.id}
                className="p-3 mb-2 rounded-3"
                style={{
                  background: selectedSitioId === s.id ? '#fff7ed' : '#f8fafc',
                  border:
                    selectedSitioId === s.id
                      ? '1px solid #ea580c'
                      : '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedSitioId(s.id)}
              >
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div>
                    <span
                      className="badge me-2 text-uppercase"
                      style={{
                        background:
                          s.tipo === 'onion'
                            ? '#dc2626'
                            : s.tipo === 'marketplace'
                            ? '#b91c1c'
                            : '#2563eb',
                        color: '#fff',
                        fontSize: '0.65rem',
                      }}
                    >
                      {s.tipo}
                    </span>
                    <span className="fw-bold text-dark">{s.nombre}</span>
                  </div>
                </div>
                <div
                  className="small font-monospace mb-1 text-break"
                  style={{ color: '#c2410c', wordBreak: 'break-all', fontSize: '0.74rem' }}
                >
                  {s.url}
                </div>
                <p className="small text-secondary mb-2">{s.descripcion}</p>
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div className="d-flex flex-wrap gap-1">
                    {(s.keywords || []).map((kw: string) => (
                      <span
                        key={kw}
                        className="badge bg-white border text-secondary"
                        style={{ fontSize: '0.67rem' }}
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm uw-btn-orange py-1 px-2 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerCapture(s.id);
                    }}
                    disabled={capturando}
                  >
                    {capturando && selectedSitioId === s.id
                      ? 'Auditando...'
                      : '📸 Capturar Ahora'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna Derecha: Bitácora de Capturas y Cambios Tácticos */}
        <div className="col-lg-6">
          <div className="uw-card h-100">
            <div className="uw-card-header">
              <div>
                <h6 className="mb-0 text-dark fw-bold">
                  Bitácora de Monitoreo: {sitioSeleccionado?.nombre || 'Objetivo'}
                </h6>
                <small className="text-secondary">
                  Registro histórico de alteraciones visuales y telemetría extraída
                </small>
              </div>
            </div>

            {capturas.length === 0 ? (
              <div className="p-4 text-center text-secondary small">
                No hay capturas registradas para este objetivo. Haz clic en "Capturar Ahora" para iniciar la auditoría.
              </div>
            ) : (
              capturas.map((cap) => {
                const diff = cap.diff_pct !== undefined ? cap.diff_pct : 0.0;
                const esAlerta = cap.cambio_detectado || diff > 15.0;

                return (
                  <div
                    key={cap.id}
                    className="p-3 mb-3 rounded-3"
                    style={{
                      background: esAlerta ? '#fef2f2' : '#f8fafc',
                      border: esAlerta ? '1px solid #fecaca' : '1px solid #e2e8f0',
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span
                        className={`badge ${
                          esAlerta ? 'bg-danger' : 'bg-success'
                        }`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {esAlerta
                          ? `🚨 ALERTA DE DIVERGENCIA (${diff}%)`
                          : `✓ SIN CAMBIOS RELEVANTES (${diff}%)`}
                      </span>
                      <small className="text-secondary" style={{ fontSize: '0.72rem' }}>
                        {new Date(cap.created_at).toLocaleString('es-MX')}
                      </small>
                    </div>

                    {/* Resumen del hallazgo */}
                    <div className="mb-2">
                      <small className="text-uppercase fw-bold text-secondary d-block" style={{ fontSize: '0.66rem' }}>
                        Diagnóstico del Detector:
                      </small>
                      <p className="small text-dark fw-semibold mb-0" style={{ fontSize: '0.8rem' }}>
                        {cap.cambio_descripcion}
                      </p>
                    </div>

                    {/* Contenido extraído */}
                    {cap.contenido_texto && (
                      <div className="p-2 rounded bg-white border mb-2">
                        <small className="text-uppercase fw-bold text-secondary d-block mb-1" style={{ fontSize: '0.66rem' }}>
                          Contenido / Telemetría Capturada:
                        </small>
                        <p
                          className="small text-dark mb-0 font-monospace"
                          style={{ fontSize: '0.75rem', lineHeight: '1.4' }}
                        >
                          {cap.contenido_texto}
                        </p>
                      </div>
                    )}

                    {/* Metadatos técnicos discretos */}
                    <div className="d-flex justify-content-between text-secondary pt-1 border-top" style={{ fontSize: '0.67rem' }}>
                      <span>Umbral de alerta: &gt;15.0%</span>
                      <span>Estado: Verificado</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
