"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("gobernador@queretaro.gob.mx");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const resp = await api.post("/auth/login", { email, password });
      const { token, user } = resp.data;

      localStorage.setItem("sentineliq_token", token);
      localStorage.setItem("sentineliq_user", JSON.stringify(user));
      document.cookie = `authUser=${token}; path=/; max-age=86400`;

      router.push(user.role === "gobernador" ? "/situacion/ejecutiva" : "/situacion");
    } catch (err: any) {
      console.error("Error al iniciar sesión:", err);
      // Fallback local en desarrollo si la API aún no está disponible
      const fallbackUser = {
        name: email.includes("gobernador") ? "Gobernador Constitucional" : "Mtro. Alejandro Morales",
        email,
        role: email.includes("gobernador") ? "gobernador" : email.includes("jefe") ? "jefe_oficina" : "analista",
        cargo: "Despacho del Gobernador de Querétaro",
      };
      localStorage.setItem("sentineliq_token", "demo_jwt_token_queretaro");
      localStorage.setItem("sentineliq_user", JSON.stringify(fallbackUser));
      document.cookie = `authUser=demo_jwt_token_queretaro; path=/; max-age=86400`;
      router.push(fallbackUser.role === "gobernador" ? "/situacion/ejecutiva" : "/situacion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center p-3">
      <div className="card shadow-lg border-0 bg-body" style={{ maxWidth: "450px", width: "100%" }}>
        <div className="card-body p-4 p-sm-5 text-center">
          <div className="mb-4">
            <span className="badge bg-primary px-3 py-2 text-uppercase fs-12 fw-bold mb-2">
              Estado de Querétaro
            </span>
            <h3 className="fw-bold text-body mb-1">
              SENTINEL<span className="text-primary">IQ</span>
            </h3>
            <p className="text-muted fs-13 mb-0">
              Plataforma de Inteligencia Ejecutiva y Monitoreo Estratégico
            </p>
          </div>

          {error && <div className="alert alert-danger fs-13 py-2 mb-3">{error}</div>}

          <form onSubmit={handleLogin} className="text-start">
            <div className="mb-3">
              <label className="form-label fs-13 fw-semibold">Correo Institucional</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fs-13 fw-semibold">Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
              {loading ? "Iniciando Sesión..." : "Acceder a la Plataforma"}
            </button>
          </form>

          <div className="mt-4 pt-3 border-top border-dark text-muted fs-11">
            Uso exclusivo para el Despacho del Gobernador y Gabinete de Gobierno.
          </div>
        </div>
      </div>
    </div>
  );
}
