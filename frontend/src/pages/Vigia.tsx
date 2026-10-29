import React, { useEffect, useState } from 'react';
import { uwApi } from '../services/api';

export const Vigia: React.FC = () => {
  const [sitios, setSitios] = useState<any[]>([]);
  const [selectedSitioId, setSelectedSitioId] = useState<string>(
    '55555555-0001-4000-a000-000000000001'
  );
  const [capturas, setCapturas] = useState<any[]>([]);
  const [capturando, setCapturando] = useState(false);

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
            contenido_texto: cap.cambio_descripcion,
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

  return (
    <div>
      <div className="uw-card mb-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h5 className="mb-0 text-light fw-bold">
              Módulo Vigía — Dark Web & Monitoreo Visual (HeadlessX Camoufox + PixelRAG)
            </h5>
            <small className="text-secondary">
              Regla R2: Sitios <code>.onion</code> y foros clandestinos usan{' '}
              <code>browser_engine = 'headlessx'</code> (:38473) · PixelRAG alerta cambios visuales &gt; 15%
            </small>
          </div>
          <span className="badge bg-danger px-3 py-2">
            Nivel Confidencialidad R4: RESERVADO
          </span>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="uw-card h-100">
            <div className="uw-card-header">
              <h6 className="mb-0 text-light fw-bold">Sitios en la Mira (uwi_sitios_mira)</h6>
            </div>
            {sitios.map((s) => (
              <div
                key={s.id}
                className="p-3 mb-2 rounded-3"
                style={{
                  background: selectedSitioId === s.id ? 'rgba(255, 107, 53, 0.1)' : '#11141c',
                  border:
                    selectedSitioId === s.id
                      ? '1px solid #FF6B35'
                      : '1px solid #262c3d',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedSitioId(s.id)}
              >
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div>
                    <span className="badge bg-danger me-2 text-uppercase">{s.tipo}</span>
                    <span className="fw-bold text-light">{s.nombre}</span>
                  </div>
                  <span className="badge bg-dark border border-warning text-warning">
                    {s.browser_engine}
                  </span>
                </div>
                <div className="small text-warning font-monospace mb-1">{s.url}</div>
                <p className="small text-secondary mb-2">{s.descripcion}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex flex-wrap gap-1">
                    {(s.keywords || []).map((kw: string) => (
                      <span
                        key={kw}
                        className="badge bg-dark border border-secondary text-secondary"
                        style={{ fontSize: '0.67rem' }}
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm uw-btn-orange py-0 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerCapture(s.id);
                    }}
                    disabled={capturando}
                  >
                    {capturando ? 'Capturando...' : '📸 Capturar Ahora'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="uw-card h-100">
            <div className="uw-card-header">
              <div>
                <h6 className="mb-0 text-light fw-bold">
                  Capturas Indexadas en PixelRAG (Qwen3-VL-Embedding-2B + FAISS)
                </h6>
                <small className="text-secondary">
                  Detección automática de diferencias visuales entre capturas consecutivas
                </small>
              </div>
            </div>

            {capturas.map((cap) => (
              <div
                key={cap.id}
                className="p-3 mb-3 rounded-3"
                style={{
                  background: '#11141c',
                  border: cap.cambio_detectado
                    ? '1px solid #ef4444'
                    : '1px solid #262c3d',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span
                    className={`badge ${
                      cap.cambio_detectado ? 'bg-danger' : 'bg-success'
                    }`}
                  >
                    {cap.cambio_detectado
                      ? `🚨 ALERTA CAMBIO VISUAL (${cap.diff_pct || 28.6}% > 15%)`
                      : `✓ ESTABLE (${cap.diff_pct || 4.2}% <= 15%)`}
                  </span>
                  <small className="text-secondary">
                    {new Date(cap.created_at).toLocaleString('es-MX')}
                  </small>
                </div>
                <p className="small text-light fw-semibold mb-1">{cap.cambio_descripcion}</p>
                <p className="small text-secondary mb-2">{cap.contenido_texto}</p>
                <div className="d-flex justify-content-between small font-monospace text-warning" style={{ fontSize: '0.7rem' }}>
                  <span>FAISS: {cap.pixelrag_index}</span>
                  <span>PNG: {cap.screenshot_path}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
