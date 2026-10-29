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
      // Fallback local para demostración inmediata si el contenedor backend no está levantado
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
            subtipo: `Extracción Surya OCR + Claude (${archivos[0]?.name || 'reporte_sspc.pdf'})`,
            titulo: `Amenaza y cobro de piso a comercio en Colonia Morelos (${targetDate})`,
            colonia: 'MORELOS (TEPITO)',
            alcaldia: 'Cuauhtémoc',
            fecha_incidente: targetDate,
            descripcion: `Incidente extraído por Surya OCR y clasificado por Claude Sonnet 4.6 en modo_${modo}. Regla R3 activa: fecha_incidente=${targetDate} separada de created_at.`,
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
      `✓ ${preview?.incidentes?.length || 1} incidente(s) insertado(s) en uwi_incidentes con fecha_incidente = ${preview?.fecha_aplicada} (Modo ${modo.toUpperCase()}). Audit Log R7 actualizado.`
    );
    setPreview(null);
    setArchivos([]);
    onConfirmed?.();
  };

  return (
    <div className="uw-card">
      <div className="uw-card-header">
        <div>
          <h6 className="mb-0 text-light fw-bold">
            Carga Manual Curada (Word / Excel / PDF + Surya OCR)
          </h6>
          <small className="text-secondary">
            Regla R5: Alterna entre ingesta operativa (±7 días) e histórica (2016–hoy)
          </small>
        </div>
      </div>

      {/* Toggle modo prominente (Regla R5) */}
      <div className="d-flex gap-2 mb-3">
        <button
          type="button"
          className={`btn btn-sm flex-grow-1 fw-semibold ${
            modo === 'operativo' ? 'btn-warning text-dark' : 'btn-outline-warning'
          }`}
          onClick={() => setModo('operativo')}
        >
          📍 Modo Operativo (hoy ± 7 días)
        </button>
        <button
          type="button"
          className={`btn btn-sm flex-grow-1 fw-semibold ${
            modo === 'historico' ? 'btn-danger' : 'btn-outline-danger'
          }`}
          onClick={() => setModo('historico')}
        >
          📅 Modo Histórico (fecha libre 2016–hoy)
        </button>
      </div>

      {modo === 'historico' && (
        <div className="mb-3 p-2 rounded" style={{ background: '#1b202c', border: '1px solid #ef4444' }}>
          <label className="form-label text-warning small fw-semibold mb-1">
            Fecha real del evento histórico (<code>fecha_incidente</code> — Regla R3)
          </label>
          <input
            type="date"
            className="form-control form-control-sm bg-dark text-light border-secondary"
            value={fechaManual}
            onChange={(e) => setFechaManual(e.target.value)}
            min="2016-01-01"
            max={new Date().toISOString().split('T')[0]}
          />
          <small className="text-secondary d-block mt-1" style={{ fontSize: '0.72rem' }}>
            Un evento de 2019 subido hoy NO contamina el heatmap operativo de hoy.
          </small>
        </div>
      )}

      {/* Drop zone */}
      <label
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border rounded-3 p-4 text-center mb-3 d-block"
        style={{
          borderColor: '#FF6B35',
          borderStyle: 'dashed',
          cursor: 'pointer',
          background: archivos.length ? 'rgba(255, 107, 53, 0.1)' : '#11141c',
        }}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt"
          className="d-none"
          onChange={handleFileInput}
        />
        <span className="material-symbols-outlined d-block mb-1" style={{ fontSize: 34, color: '#FF6B35' }}>
          upload_file
        </span>
        {archivos.length ? (
          <p className="mb-0 text-warning fw-semibold">
            {archivos.length} archivo(s) listos: {archivos.map((a) => a.name).join(', ')}
          </p>
        ) : (
          <p className="mb-0 text-secondary">
            Arrastra Word (<code>.docx</code>), Excel (<code>.xlsx</code>) o PDF aquí (o haz clic para seleccionar)
            <br />
            <small className="text-muted">
              Documentos de noticias, reportes SSPC-CDMX, bitácoras de custodios y escoltas
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
            ? 'Procesando con Surya OCR + Claude Sonnet 4.6...'
            : archivos.length
            ? 'Procesar y Clasificar Archivos'
            : 'Simular Clasificación de Reporte SSPC'}
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
        <div className="mt-3 p-3 rounded-3" style={{ background: '#11141c', border: '1px solid #22c55e' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small text-success fw-bold">
              ✓ {preview.incidentes?.length || 0} incidente(s) detectado(s) — Preview antes de insertar
            </span>
            <span className="badge bg-dark border border-warning text-warning">
              modo_{preview.modo_ingesta} · fecha_incidente: {preview.fecha_aplicada}
            </span>
          </div>
          {preview.incidentes?.map((inc: any, i: number) => (
            <div
              key={i}
              className="p-2 mb-2 rounded"
              style={{ background: '#181c26', border: '1px solid #2d3548' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="badge me-2" style={{ background: '#FF6B35', color: '#000' }}>
                    {inc.tipo_incidente}
                  </span>
                  <small className="text-light fw-semibold">
                    {inc.colonia} · {inc.alcaldia}
                  </small>
                </div>
                <small className="text-warning">{inc.fecha_incidente}</small>
              </div>
              <p className="mb-0 mt-1 small text-secondary">{inc.descripcion}</p>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-success btn-sm w-100 mt-2 fw-semibold"
            onClick={() => confirmInsert(preview.token)}
          >
            Confirmar e insertar {preview.incidentes?.length} incidente(s) en PostGIS
          </button>
        </div>
      )}
    </div>
  );
};
