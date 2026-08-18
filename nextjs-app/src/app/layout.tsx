import ClientProviders from "@/components/ClientProviders";
import { Metadata } from "next";
import React from "react";
import "./globals.css";
import "../assets/scss/themes.scss";
import "apexcharts/dist/apexcharts.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const metadata: Metadata = {
  title: "SentinelIQ · Estado de Querétaro | Inteligencia Ejecutiva",
  description: "Plataforma de inteligencia procesada, narrativa y accionable para la Oficina del Gobernador.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning data-layout-mode="light" data-topbar="light" data-sidebar="light" data-bs-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body suppressHydrationWarning={true} className="bg-light text-dark">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
