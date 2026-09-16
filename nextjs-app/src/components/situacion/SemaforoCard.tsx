"use client";

import React from "react";

interface SemaforoProps {
  area: string;
  nivel: string; // ALERTA | VIGILANCIA | NORMAL
  color: "danger" | "warning" | "success";
  mensaje: string;
  tendencia?: string;
}

export const SemaforoCard: React.FC<SemaforoProps> = ({ area, nivel, color, mensaje, tendencia }) => {
  const getBadgeStyle = () => {
    switch (color) {
      case "danger":
        return "bg-danger text-white";
      case "warning":
        return "bg-warning text-dark fw-bold";
      case "success":
        return "bg-success text-white";
      default:
        return "bg-primary text-white";
    }
  };

  const getBorderStyle = () => {
    switch (color) {
      case "danger":
        return "border-danger";
      case "warning":
        return "border-warning";
      case "success":
        return "border-success";
      default:
        return "border-primary";
    }
  };

  return (
    <div className={`card bg-white border-start border-4 ${getBorderStyle()} shadow-sm mb-3 rounded-3`}>
      <div className="card-body p-4 bg-white">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div>
            <span className="text-uppercase fw-extrabold text-primary mb-1 fs-11" style={{ color: "#1e40af" }}>
              {area}
            </span>
            <div className="mt-1">
              <span className={`badge ${getBadgeStyle()} fs-12 px-3 py-1 fw-bold shadow-sm`}>
                {nivel}
              </span>
            </div>
          </div>
          {tendencia && (
            <span className="badge bg-secondary-subtle text-dark fs-12 fw-bold px-3 py-1" style={{ color: "#0f172a" }}>
              Tendencia {tendencia}
            </span>
          )}
        </div>
        <p className="card-text mt-2 text-dark fs-14 fw-semibold mb-0" style={{ color: "#0f172a" }}>
          {mensaje}
        </p>
      </div>
    </div>
  );
};

export default SemaforoCard;
