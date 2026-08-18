"use client";

import React from "react";

interface SeverityBadgeProps {
  severity: "critico" | "alto" | "medio" | "bajo" | "informativo" | string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const getBadgeClass = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "critico":
        return "bg-danger text-uppercase badge-border";
      case "alto":
        return "bg-warning text-dark text-uppercase";
      case "medio":
        return "bg-info text-uppercase";
      case "bajo":
        return "bg-secondary text-uppercase";
      default:
        return "bg-light text-dark text-uppercase";
    }
  };

  return (
    <span className={`badge ${getBadgeClass(severity)} px-2 py-1 fs-12 fw-semibold`}>
      {severity}
    </span>
  );
};

export default SeverityBadge;
