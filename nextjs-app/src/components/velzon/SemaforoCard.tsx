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
  const getBgClass = () => {
    switch (color) {
      case "danger":
        return "border-danger bg-danger-subtle";
      case "warning":
        return "border-warning bg-warning-subtle";
      case "success":
        return "border-success bg-success-subtle";
      default:
        return "border-primary";
    }
  };

  return (
    <div className={`card border-start border-4 ${getBgClass()} shadow-sm mb-3`}>
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h6 className="text-uppercase fw-bold text-muted mb-1 fs-11">{area}</h6>
            <h5 className="mb-0 fw-semibold">{nivel}</h5>
          </div>
          {tendencia && (
            <span className="badge bg-dark-subtle text-body fs-12 fw-medium">
              Tendencia {tendencia}
            </span>
          )}
        </div>
        <p className="card-text mt-2 text-muted fs-13 mb-0">{mensaje}</p>
      </div>
    </div>
  );
};

export default SemaforoCard;
