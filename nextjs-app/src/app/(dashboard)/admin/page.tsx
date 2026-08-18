"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([
    {
      id: "u1",
      name: "Mauricio Kuri González",
      email: "gobernador@queretaro.gob.mx",
      cargo: "Gobernador Constitucional del Estado de Querétaro",
      role: "gobernador",
      active: true,
    },
    {
      id: "u2",
      name: "Mtro. Alejandro Morales",
      email: "jefe.oficina@queretaro.gob.mx",
      cargo: "Jefe de la Oficina de la Gubernatura",
      role: "jefe_oficina",
      active: true,
    },
    {
      id: "u3",
      name: "Lic. Carlos Arredondo",
      email: "asesor.politico@queretaro.gob.mx",
      cargo: "Asesor Principal de Estrategia Política",
      role: "asesor",
      active: true,
    },
    {
      id: "u4",
      name: "Dra. Sofía Hinojosa",
      email: "analista.inteligencia@queretaro.gob.mx",
      cargo: "Directora de Análisis e Inteligencia Situacional",
      role: "analista",
      active: true,
    },
  ]);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get("/admin/users");
        if (resp.data && Array.isArray(resp.data) && resp.data.length > 0) {
          setUsers(resp.data);
        }
      } catch (e) {
        console.warn("Cargando catálogo de usuarios de la gubernatura de Querétaro");
      }
    }
    load();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <span className="badge bg-primary-subtle text-primary text-uppercase px-3 py-1 fs-11 fw-bold mb-1">
            Gubernatura del Estado de Querétaro
          </span>
          <h4 className="fw-bold mb-1">Administración de Estado & Usuarios</h4>
          <p className="text-muted fs-13 mb-0">
            Gestión de roles, permisos y credenciales para la Oficina del Gobernador.
          </p>
        </div>
      </div>

      {/* Menú de Navegación de Administración */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-2">
          <ul className="nav nav-pills nav-custom">
            <li className="nav-item">
              <Link href="/admin" className="nav-link active">
                <i className="ri-user-settings-line me-1"></i> Usuarios & Roles
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/keys" className="nav-link">
                <i className="ri-key-fill me-1"></i> Llaves API & Secretos
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/mcp" className="nav-link">
                <i className="ri-cpu-line me-1"></i> Gestión MCP & Tools
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="card shadow-sm">
        <div className="card-header bg-body-tertiary d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0 fw-bold fs-15">Usuarios Registrados en el Gabinete</h5>
          <span className="badge bg-dark fs-12">4 Usuarios Activos</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Nombre</th>
                  <th>Correo Institucional</th>
                  <th>Cargo Gubernamental</th>
                  <th>Rol SentinelIQ</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-bold text-body">{u.name}</td>
                    <td className="text-muted fs-13">{u.email}</td>
                    <td className="fs-13">{u.cargo}</td>
                    <td>
                      <span className="badge bg-primary text-uppercase px-2 py-1 fs-11">
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success">Activo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
