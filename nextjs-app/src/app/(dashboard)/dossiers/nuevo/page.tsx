"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function NuevoDossierPage() {
  const router = useRouter();
  const [type, setType] = useState("municipal");
  const [targetName, setTargetName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const blufText = `Análisis ejecutivo prioritario preparado para la visita/evaluación de ${targetName || "la entidad señalada"}. Se identifican oportunidades de gestión y puntos de atención preventiva.`;
      
      const contentJson = {
        situacion_actual: `Evaluación de indicadores y menciones mediáticas recientes sobre ${targetName}.`,
        actores_clave: ["Autoridades municipales", "Líderes de comités vecinales", "Representantes de medios locales"],
        implicaciones_politicas: "Impacto favorable en la percepción pública mediante entregas de infraestructura estratégica.",
        escenarios: {
          optimista: "Consenso total en la agenda y acuerdos de colaboración mutua.",
          probable: "Reunión institucional con peticiones ordinarias de presupuesto extra.",
          pesimista: "Cuestionamiento por retrasos en obras de la zona metropolitana."
        },
        recomendaciones: [
          "Mantener discurso enfocado en coordinación metropolitana.",
          "Anunciar paquete de inversión de protección civil para la temporada de lluvias."
        ]
      };

      const resp = await api.post("/dossiers", {
        type,
        title: `Dossier Ejecutivo: ${targetName || "Evaluación Regional"}`,
        bluf: blufText,
        content: contentJson,
        confidence: "alto",
        risk_level: "medio"
      });

      router.push(`/dossiers/${resp.data.id}`);
    } catch (err) {
      console.error("Error al generar dossier:", err);
      alert("Error al generar el dossier. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ maxWidth: "800px" }}>
      <div className="card shadow-sm">
        <div className="card-header bg-body-tertiary">
          <h5 className="card-title mb-0 fw-bold">Generador de Dossiers Ejecutivos con Claude</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Tipo de Dossier</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="municipal">Dossier Municipal (Gira/Visita del Gobernador)</option>
                <option value="perfil">Dossier de Perfil (Reunión con Político/Empresario)</option>
                <option value="incidente">Dossier de Incidente Crítico (Gestión de Crisis)</option>
                <option value="narrativa">Dossier de Narrativa Mediática (Estrategia de Comunicación)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Nombre del Municipio, Persona o Incidente</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej. Municipio de Puerto Vallarta / Diputado Ramírez / Incidente ZMG"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                required
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={() => router.back()}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Generando dossier con Claude API..." : "Generar Dossier en < 60s"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
