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

      {/* Audit Log R7 */}
      <div className="uw-card">
        <div className="uw-card-header">
          <div>
            <h6 className="mb-0 text-light fw-bold">
              Audit Log de Trazabilidad Claude API (Regla R7 — <code>uwi_audit</code>)
            </h6>
            <small className="text-secondary">
              Registro inmutable de fuentes consultadas, tokens consumidos, nivel de confianza (0–100%) y
              nivel de confidencialidad accedido
            </small>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle small mb-0">
            <thead>
              <tr className="text-secondary">
                <th>Acción</th>
                <th>Recurso</th>
                <th>Nivel Conf (R4)</th>
                <th>Fuentes Consultadas</th>
                <th>Tokens</th>
                <th>Confianza %</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-monospace text-warning">{log.accion}</td>
                  <td className="text-light fw-semibold">{log.recurso}</td>
                  <td>
                    <span className="badge bg-dark border border-secondary text-uppercase">
                      {log.nivel_conf_accedido}
                    </span>
                  </td>
                  <td>
                    <code className="text-info" style={{ fontSize: '0.72rem' }}>
                      {JSON.stringify(log.fuentes_json)}
                    </code>
                  </td>
                  <td>{log.tokens_usados}</td>
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
