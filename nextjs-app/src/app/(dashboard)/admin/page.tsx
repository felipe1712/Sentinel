"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get("/admin/users");
        setUsers(resp.data);
      } catch (e) {
        console.error("Error cargando usuarios:", e);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Administración de Estado & Usuarios</h4>
          <p className="text-muted fs-13 mb-0">
            Gestión de roles y accesos para el Despacho del Gobernador del Estado de Querétaro.
          </p>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-body-tertiary">
          <h5 className="card-title mb-0 fw-bold">Usuarios del Estado de Querétaro</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Nombre</th>
                  <th>Correo Electrónico</th>
                  <th>Cargo</th>
                  <th>Rol SentinelIQ</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-bold">{u.name}</td>
                    <td className="text-muted">{u.email}</td>
                    <td className="fs-13">{u.cargo}</td>
                    <td>
                      <span className="badge bg-primary text-uppercase">{u.role}</span>
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
