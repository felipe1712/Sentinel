import "material-symbols";
import "remixicon/fonts/remixicon.css";
import "react-calendar/dist/Calendar.css";
import "swiper/css";
import "swiper/css/bundle";
import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";

// globals
import "./globals.css";

import LayoutProvider from "@/providers/LayoutProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});
  
export const metadata: Metadata = {
  title: "SentinelIQ | Sistema de Inteligencia Estratégica",
  description: "Plataforma Integral de Análisis Situacional, WebGIS Electoral y Monitoreo de Fuentes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body
        className={`${inter.variable} antialiased bg-[#0b1120] text-white m-0 p-0`}
      >
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}
