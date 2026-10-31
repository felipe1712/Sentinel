import React, { useEffect, useState } from 'react';
import { SkillsStatus } from '../components/SkillsStatus';
import { uwApi } from '../services/api';

export const Admin: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    uwApi.getAuditLogs().then((res) => setAuditLogs(res.audit_logs || []));
  }, []);

  return (
    <div>
      <div className="mb-4">
        <SkillsStatus />
      </div>

      {/* Bitácora de Auditoría */}
      <div className="uw-card">
        <div className="uw-card-header">
          <div>
            <h6 className="mb-0 text-dark fw-bold">
              Bitácora de Auditoría y Trazabilidad de Inteligencia
            </h6>
            <small className="text-secondary">
              Registro inmutable de fuentes consultadas, nivel de confianza y perfil de confidencialidad accedido
            </small>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle small mb-0">
            <thead className="table-light">
              <tr className="text-secondary">
                <th>Acción</th>
                <th>Recurso</th>
                <th>Nivel de Acceso</th>
                <th>Fuentes Consultadas</th>
                <th>Confianza %</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-monospace fw-semibold" style={{ color: '#c2410c' }}>{log.accion}</td>
                  <td className="text-dark fw-semibold">{log.recurso}</td>
                  <td>
                    <span className="badge bg-light border text-dark text-uppercase">
                      {log.nivel_conf_accedido}
                    </span>
                  </td>
                  <td>
                    <code className="text-primary" style={{ fontSize: '0.72rem' }}>
                      {JSON.stringify(log.fuentes_json)}
                    </code>
                  </td>
                  <td>
                    <span className="badge bg-success">{log.confianza_pct}%</span>
                  </td>
                  <td className="text-secondary">
                    {new Date(log.created_at).toLocaleString('es-MX')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
