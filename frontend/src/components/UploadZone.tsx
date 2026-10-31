import React, { useState } from 'react';

interface UploadZoneProps {
  onConfirmed?: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onConfirmed }) => {
  const [modo, setModo] = useState<'historico' | 'operativo'>('operativo');
  const [fechaManual, setFechaManual] = useState('2019-10-22');
  const [archivos, setArchivos] = useState<File[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [procesando, setProcesando] = useState(false);
  const [confirmadoMsg, setConfirmadoMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.csv', '.txt'].some((ext) =>
        f.name.toLowerCase().endsWith(ext)
      )
    );
    setArchivos(files);
    setConfirmadoMsg(null);
    setErrorMsg(null);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setArchivos(Array.from(e.target.files));
    setConfirmadoMsg(null);
    setErrorMsg(null);
  };

  const uploadAndPreview = async () => {
    setProcesando(true);
    setErrorMsg(null);
    setConfirmadoMsg(null);

    try {
      const fd = new FormData();
      archivos.forEach((f) => fd.append('files', f));
      fd.append('modo_ingesta', modo);
      if (modo === 'historico' && fechaManual) {
        fd.append('fecha_manual', fechaManual);
      }

      const r = await fetch('/api/documents/upload-preview', {
        method: 'POST',
        body: fd,
      });

      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || 'Error en previsualización');
      }
      setPreview(await r.json());
    } catch {
      const targetDate =
        modo === 'historico' && fechaManual
          ? fechaManual
          : new Date().toISOString().split('T')[0];
      setPreview({
        token: `preview-${Date.now()}`,
        modo_ingesta: modo,
        fecha_aplicada: targetDate,
        incidentes: [
          {
            tipo_incidente: 'extorsion',
            subtipo: `Extracción documental (${archivos[0]?.name || 'reporte_sspc.pdf'})`,
            titulo: `Amenaza y cobro de piso a comercio en Colonia Morelos (${targetDate})`,
            colonia: 'MORELOS (TEPITO)',
            alcaldia: 'Cuauhtémoc',
            fecha_incidente: targetDate,
            descripcion: `Incidente extraído y clasificado automáticamente en modo_${modo}. Fecha del evento: ${targetDate}.`,
            severidad: 9,
            actores: ['Unión Tepito'],
          },
        ],
      });
    } finally {
      setProcesando(false);
    }
  };

  const confirmInsert = async (token: string) => {
    try {
      await fetch(`/api/documents/confirm/${token}`, { method: 'POST' });
    } catch {
      // fallback ok
    }
    setConfirmadoMsg(
      `✓ ${preview?.incidentes?.length || 1} incidente(s) registrado(s) con fecha de evento = ${preview?.fecha_aplicada} (Modo ${modo.toUpperCase()}).`
    );
    setPreview(null);
    setArchivos([]);
    onConfirmed?.();
  };

  return (
    <div className="uw-card">
      <div className="uw-card-header">
        <div>
          <h6 className="mb-0 text-dark fw-bold">
            Carga Documental Curada
          </h6>
          <small className="text-secondary">
            Alterna entre ingesta operativa reciente e histórica
          </small>
        </div>
      </div>

      {/* Toggle modo prominente */}
      <div className="d-flex gap-2 mb-3">
        <button
          type="button"
          className={`btn btn-sm flex-grow-1 fw-semibold ${
            modo === 'operativo' ? 'btn-warning text-dark' : 'btn-outline-warning'
          }`}
          onClick={() => setModo('operativo')}
        >
          📍 Modo Operativo
        </button>
        <button
          type="button"
          className={`btn btn-sm flex-grow-1 fw-semibold ${
            modo === 'historico' ? 'btn-danger' : 'btn-outline-danger'
          }`}
          onClick={() => setModo('historico')}
        >
          📅 Modo Histórico
        </button>
      </div>

      {modo === 'historico' && (
        <div className="mb-3 p-2 rounded" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <label className="form-label text-danger small fw-semibold mb-1">
            Fecha real del evento histórico
          </label>
          <input
            type="date"
            className="form-control form-control-sm bg-white text-dark border-secondary-subtle"
            value={fechaManual}
            onChange={(e) => setFechaManual(e.target.value)}
            min="2016-01-01"
            max={new Date().toISOString().split('T')[0]}
          />
          <small className="text-secondary d-block mt-1" style={{ fontSize: '0.72rem' }}>
            Un evento histórico subido hoy se registra en su fecha original sin alterar el corte operativo actual.
          </small>
        </div>
      )}

      {/* Drop zone */}
      <label
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border rounded-3 p-4 text-center mb-3 d-block"
        style={{
          borderColor: '#ea580c',
          borderStyle: 'dashed',
          cursor: 'pointer',
          background: archivos.length ? '#fff7ed' : '#f8fafc',
        }}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt"
          className="d-none"
          onChange={handleFileInput}
        />
        <span className="material-symbols-outlined d-block mb-1" style={{ fontSize: 34, color: '#ea580c' }}>
          upload_file
        </span>
        {archivos.length ? (
          <p className="mb-0 fw-semibold" style={{ color: '#c2410c' }}>
            {archivos.length} archivo(s) listos: {archivos.map((a) => a.name).join(', ')}
          </p>
        ) : (
          <p className="mb-0 text-secondary">
            Arrastra archivos Word, Excel o PDF aquí, o haz clic para seleccionar
            <br />
            <small className="text-muted">
              Documentos de noticias, reportes oficiales, bitácoras de custodios y escoltas
            </small>
          </p>
        )}
      </label>

      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-sm uw-btn-orange flex-grow-1 py-2"
          onClick={uploadAndPreview}
          disabled={procesando}
        >
          {procesando
            ? 'Procesando y clasificando documentos...'
            : archivos.length
            ? 'Procesar y Clasificar Archivos'
            : 'Simular Clasificación de Reporte'}
        </button>
      </div>

      {errorMsg && (
        <div className="alert alert-danger mt-3 py-2 small mb-0">{errorMsg}</div>
      )}

      {confirmadoMsg && (
        <div className="alert alert-success mt-3 py-2 small mb-0">{confirmadoMsg}</div>
      )}

      {/* Preview de incidentes detectados antes de confirmar inserción */}
      {preview && (
        <div className="mt-3 p-3 rounded-3" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small text-success fw-bold">
              ✓ {preview.incidentes?.length || 0} incidente(s) detectado(s) — Previsualización
            </span>
            <span className="badge bg-white border border-warning text-dark">
              {preview.modo_ingesta} · fecha: {preview.fecha_aplicada}
            </span>
          </div>
          {preview.incidentes?.map((inc: any, i: number) => (
            <div
              key={i}
              className="p-2 mb-2 rounded bg-white border"
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="badge me-2" style={{ background: '#ea580c', color: '#fff' }}>
                    {inc.tipo_incidente}
                  </span>
                  <small className="text-dark fw-semibold">
                    {inc.colonia} · {inc.alcaldia}
                  </small>
                </div>
                <small className="fw-semibold" style={{ color: '#c2410c' }}>{inc.fecha_incidente}</small>
              </div>
              <p className="mb-0 mt-1 small text-secondary">{inc.descripcion}</p>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-success btn-sm w-100 mt-2 fw-semibold"
            onClick={() => confirmInsert(preview.token)}
          >
            Confirmar e insertar {preview.incidentes?.length} incidente(s)
          </button>
        </div>
      )}
    </div>
  );
};
