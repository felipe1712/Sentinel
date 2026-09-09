"use client";

import React from "react";
import { getStateConfig } from "@/lib/stateConfig";

const Footer: React.FC = () => {
  const stateCfg = getStateConfig();
  const year = new Date().getFullYear();

  return (
    <>
      <div className="grow"></div>
      <footer className="bg-white dark:bg-[#0c1427] border-t border-gray-100 dark:border-[#172036] px-5 py-3 text-center text-xs text-gray-400">
        <p>
          © {year} <span className="font-bold text-gray-700 dark:text-gray-200">SentinelIQ</span> · {stateCfg.name} · Sistema de Inteligencia Estratégica y Vigilancia Situacional
        </p>
      </footer>
    </>
  );
};

export default Footer;
