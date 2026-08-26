"use client";

import React, { useState } from "react";
import { ElectoralResult } from "@/lib/electoralTypes";

interface CsvUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (results: ElectoralResult[]) => void;
}

export const CsvUploaderModal: React.FC<CsvUploaderModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
}) => {
  const [csvContent, setCsvContent] = useState("");
  const [parsedRows, setParsedRows] = useState<ElectoralResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvContent(text);
      processCsvText(text);
    };
    reader.readAsText(file);
  };

  const processCsvText = (text: string) => {
    setErrorMsg(null);
    try {
      const lines = text.trim().split("\n");
      if (lines.length < 2) {
        setErrorMsg("El archivo CSV debe contener al menos un encabezado y una fila de datos.");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
      const required = ["año", "clave_seccion", "clave_municipio", "lista_nominal", "total_votos"];
      const missing = required.filter(
        (r) => !headers.includes(r) && !headers.includes(r.replace("clave_", "")) && !headers.includes(r.replace("año", "anio"))
      );

      if (missing.length > 0) {
        setErrorMsg(`Columnas faltantes en el CSV: ${missing.join(", ")}`);
        return;
      }

      const results: ElectoralResult[] = [];
      const excludedKeys = new Set(["año", "anio", "year", "tipo_eleccion", "eleccion", "clave_seccion", "seccion", "clave_municipio", "municipio", "lista_nominal", "total_votos"]);

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(",").map((v) => v.trim().replace(/['"]/g, ""));
        const rowObj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || "";
        });

        const year = parseInt(rowObj["año"] || rowObj["anio"] || rowObj["year"] || "2024");
        const electionType = rowObj["tipo_eleccion"] || rowObj["eleccion"] || "Gobernador";
        const seccion = parseInt(rowObj["clave_seccion"] || rowObj["seccion"] || "0");
        const municipio = parseInt(rowObj["clave_municipio"] || rowObj["municipio"] || "0");
        const listaNominal = parseInt(rowObj["lista_nominal"] || "0");
        let totalVotos = parseInt(rowObj["total_votos"] || "0");

        if (!seccion) continue;

        const partyVotes: Record<string, number> = {};
        Object.entries(rowObj).forEach(([k, v]) => {
          if (!excludedKeys.has(k) && v !== "") {
            const num = parseInt(v) || 0;
            partyVotes[k.toUpperCase()] = num;
          }
        });

        if (totalVotos === 0 && Object.keys(partyVotes).length > 0) {
          totalVotos = Object.values(partyVotes).reduce((a, b) => a + b, 0);
        }

        const sorted = Object.entries(partyVotes).sort(([, a], [, b]) => b - a);
        const ganadorPartido = sorted[0]?.[0] || "SIN_DATOS";
        const ganadorVotos = sorted[0]?.[1] || 0;
        const ganadorPct = totalVotos > 0 ? Number(((ganadorVotos / totalVotos) * 100).toFixed(2)) : 0;

        const segundoPartido = sorted[1]?.[0] || null;
        const segundoVotos = sorted[1]?.[1] || 0;
        const segundoPct = totalVotos > 0 ? Number(((segundoVotos / totalVotos) * 100).toFixed(2)) : 0;

        const margenVictoria = Number((ganadorPct - segundoPct).toFixed(2));
        const participacion = listaNominal > 0 ? Number(((totalVotos / listaNominal) * 100).toFixed(2)) : 0;

        results.push({
          election_year: year,
          election_type: electionType,
          clave_seccion: seccion,
          clave_municipio: municipio,
          lista_nominal: listaNominal,
          total_votos: totalVotos,
          participacion_pct: participacion,
          ganador_partido: ganadorPartido,
          ganador_votos: ganadorVotos,
          ganador_pct: ganadorPct,
          segundo_partido: segundoPartido,
          segundo_votos: segundoVotos,
          segundo_pct: segundoPct,
          margen_victoria_pct: margenVictoria,
          votos_partidos: partyVotes,
        });
      }

      setParsedRows(results);
    } catch (e: any) {
      setErrorMsg(`Error procesando CSV: ${e.message}`);
    }
  };

  const handleApply = () => {
    if (parsedRows.length === 0) return;
    onDataLoaded(parsedRows);
    onClose();
  };

  const downloadSampleTemplate = () => {
    const sample = `año,tipo_eleccion,clave_seccion,clave_municipio,lista_nominal,total_votos,pan,morena,pri,mc,pvem,pt,prd,otros,nulos
2024,Gobernador,1,1,2150,1380,680,450,110,40,30,20,10,15,25
2024,Gobernador,2,1,1980,1210,590,410,95,35,25,18,8,12,17
2024,Gobernador,3,1,2400,1520,780,510,120,45,25,15,10,15,0`;
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_resultados_electorales.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content bg-white border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-primary text-white p-4">
            <div>
              <span className="badge bg-white text-primary fw-bold text-uppercase fs-11 mb-1">
                Ingesta de Datos Electorales
              </span>
              <h5 className="modal-title fw-extrabold text-white mb-0">Carga de Resultados Electorales (CSV)</h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <p className="text-dark fs-13 mb-0 fw-semibold" style={{ color: "#334155" }}>
                Selecciona un archivo CSV con resultados electorales por sección o descarga la plantilla oficial.
              </p>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm fw-bold text-nowrap"
                onClick={downloadSampleTemplate}
              >
                <i className="ri-download-line me-1"></i> Descargar Plantilla CSV
              </button>
            </div>

            {/* Input de archivo */}
            <div className="mb-3">
              <input
                type="file"
                accept=".csv"
                className="form-control bg-white text-dark fw-bold border-gray-300 fs-13"
                onChange={handleFileUpload}
              />
            </div>

            {/* Mensaje de Error */}
            {errorMsg && (
              <div className="alert alert-danger d-flex align-items-center mb-3 rounded-3" role="alert">
                <i className="ri-error-warning-fill fs-20 me-2 text-danger"></i>
                <span className="fs-13 fw-bold">{errorMsg}</span>
              </div>
            )}

            {/* Vista Previa de Filas Parseadas */}
            {parsedRows.length > 0 && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong className="fs-13 text-dark">
                    ✅ {parsedRows.length} Secciones Validadas para Carga
                  </strong>
                  <span className="badge bg-success text-white fw-bold">Estructura Correcta</span>
                </div>

                <div className="table-responsive" style={{ maxHeight: "200px" }}>
                  <table className="table table-sm table-hover align-middle mb-0 fs-12 border">
                    <thead className="bg-light">
                      <tr>
                        <th>Año</th>
                        <th>Sección</th>
                        <th>Mpio</th>
                        <th>Lista Nom.</th>
                        <th>Total Votos</th>
                        <th>Ganador</th>
                        <th>% Ganador</th>
                        <th>Participación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 10).map((r, idx) => (
                        <tr key={idx}>
                          <td className="fw-bold">{r.election_year}</td>
                          <td className="fw-bold text-primary">{r.clave_seccion}</td>
                          <td>{r.clave_municipio}</td>
                          <td>{r.lista_nominal.toLocaleString()}</td>
                          <td>{r.total_votos.toLocaleString()}</td>
                          <td>
                            <span className="badge bg-primary text-white fw-bold">{r.ganador_partido}</span>
                          </td>
                          <td className="fw-bold">{r.ganador_pct}%</td>
                          <td className="fw-bold text-success">{r.participacion_pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedRows.length > 10 && (
                  <small className="text-muted d-block mt-1">
                    ... y {parsedRows.length - 10} secciones más listas para procesar.
                  </small>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer bg-light p-3">
            <button type="button" className="btn btn-outline-secondary btn-sm fw-bold" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm fw-bold shadow-sm"
              disabled={parsedRows.length === 0}
              onClick={handleApply}
            >
              <i className="ri-check-double-line me-1"></i> Aplicar al Mapa WebGIS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvUploaderModal;
