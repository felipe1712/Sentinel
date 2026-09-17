"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStateConfig } from "@/lib/stateConfig";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const cfg = getStateConfig();
    const token = typeof window !== "undefined"
      ? localStorage.getItem("sentinel_token") || localStorage.getItem("sentineliq_token")
      : null;

    if (token) {
      router.replace(cfg.key === "pue" ? "/situacion" : "/gabinete");
    } else if (cfg.key === "pue") {
      router.replace("/situacion");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1120] text-white">
      <div className="text-center p-6">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-3"></div>
        <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">
          Iniciando SentinelIQ...
        </p>
      </div>
    </div>
  );
}

