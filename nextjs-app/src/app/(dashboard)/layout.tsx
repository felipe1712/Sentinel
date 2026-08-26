"use client";

import React, { useEffect } from "react";
import Sidebar from "@/components/velzon/Sidebar";
import Topbar from "@/components/velzon/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Modo claro por defecto para gabinete y vistas operativas
    document.documentElement.setAttribute("data-bs-theme", "light");
    document.documentElement.setAttribute("data-layout", "vertical");
  }, []);

  return (
    <div id="layout-wrapper" className="d-flex">
      <Sidebar />
      <div className="main-content flex-grow-1 min-vh-100 bg-body-tertiary">
        <Topbar />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
