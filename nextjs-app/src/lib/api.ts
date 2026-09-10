import axios from "axios";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    // Si la variable de entorno está definida y no es localhost, usarla
    if (envUrl && !envUrl.includes("localhost:8080")) {
      return envUrl;
    }

    // En navegador en producción (*.sentineliq.com.mx o dominio remoto):
    const hostname = window.location.hostname;
    if (hostname.includes("sentineliq.com.mx") || (hostname !== "localhost" && hostname !== "127.0.0.1")) {
      return `${window.location.origin}/api`;
    }

    // En desarrollo local (si corre en puerto 3005 para Guanajuato o 3004 para QRO):
    if (window.location.port === "3005") {
      return "http://localhost:8086";
    }
    if (window.location.port === "3004" || window.location.port === "3000") {
      return "http://localhost:8085";
    }

    return "/api";
  }

  // En SSR (servidor Node.js interno)
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor dinámico para asegurar que en el cliente nunca se intente llamar a localhost:8080
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Si baseURL contiene localhost:8080 (por compilación previa), corregir en caliente al origen actual
    if (!config.baseURL || config.baseURL.includes("localhost:8080")) {
      const hostname = window.location.hostname;
      if (hostname.includes("sentineliq.com.mx") || (hostname !== "localhost" && hostname !== "127.0.0.1")) {
        config.baseURL = `${window.location.origin}/api`;
      } else if (window.location.port === "3005") {
        config.baseURL = "http://localhost:8086";
      } else {
        config.baseURL = "/api";
      }
    }

    const token = localStorage.getItem("sentineliq_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
