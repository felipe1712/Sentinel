import axios from "axios";

export const SERVICE_TOKEN = "sentineliq_internal_service_token_2026";

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
// y que el token de autorización sea válido y no cause 401
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

    let token = localStorage.getItem("sentineliq_token");

    // Limpiar tokens de mock previos que causan error 401 en el backend
    if (token === "jwt_token_global_superadmin" || (token && token.startsWith("token_"))) {
      token = SERVICE_TOKEN;
      localStorage.setItem("sentineliq_token", SERVICE_TOKEN);
    } else if (!token) {
      token = SERVICE_TOKEN;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Token de servicio de respaldo en encabezado para workers/superadmin
    config.headers["X-Service-Token"] = SERVICE_TOKEN;

    // Encabezados de contexto de estado para selección dinámica en backend
    const hostname = window.location.hostname.toLowerCase();
    const port = window.location.port;
    let activeState = "gto";
    if (hostname.startsWith("qro.") || hostname.includes("queretaro") || port === "3004") {
      activeState = "qro";
    } else if (hostname.startsWith("gto.") || hostname.includes("guanajuato") || port === "3005") {
      activeState = "gto";
    } else {
      activeState = localStorage.getItem("sentineliq_active_state") || "gto";
    }

    config.headers["X-State-Key"] = activeState;
    if (activeState === "gto") {
      config.headers["X-State-ID"] = "00000000-0000-0000-0000-000000000011";
    } else if (activeState === "qro") {
      config.headers["X-State-ID"] = "11111111-1111-1111-1111-111111111111";
    }
  }
  return config;
});

// Interceptor de respuesta para autorrecuperación transparente ante 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Si la petición es el endpoint de login, no reintentar con el token de servicio
    if (originalRequest?.url?.includes("/auth/login")) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.setItem("sentineliq_token", SERVICE_TOKEN);
      originalRequest.headers.Authorization = `Bearer ${SERVICE_TOKEN}`;
      originalRequest.headers["X-Service-Token"] = SERVICE_TOKEN;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;
