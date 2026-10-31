import React, { useEffect, useState } from 'react';
import { SkillsStatus } from '../components/SkillsStatus';
import { uwApi } from '../services/api';

function formatAccion(accion: string): string {
  const a = (accion || '').toLowerCase();
  if (a.includes('generar_resumen')) return 'Generación de Síntesis Ejecutiva';
  if (a.includes('classify_text') || a.includes('clasificar')) return 'Clasificación de Incidente';
  if (a.includes('capture') || a.includes('vigia')) return 'Captura de Monitoreo Visual';
  if (a.includes('emedios') || a.includes('scrape')) return 'Recolección de Medios';
  return accion.replace(/_/g, ' ');
}

function formatRecurso(recurso: string): string {
  if (!recurso) return 'Registro general';
  if (recurso.includes('11111111-0001')) return 'Colonia: MORELOS (TEPITO)';
  if (recurso.includes('11111111-0002')) return 'Colonia: CENTRO HISTÓRICO';
  if (recurso.includes('11111111-0003')) return 'Colonia: DOCTORES';
  if (recurso.includes('11111111-0007')) return 'Colonia: POLANCO SECCIÓN III';
  if (recurso.startsWith('uwi_colonias:')) {
    const val = recurso.split(':')[1] || '';
    return val.length > 24 ? 'Análisis de Colonia CDMX' : `Colonia: ${val}`;
  }
  if (recurso.startsWith('uwi_resumenes:')) {
    return 'Síntesis Ejecutiva de Colonia';
  }
  if (recurso.startsWith('uwi_sitios_mira:')) {
    return recurso.replace('uwi_sitios_mira:', 'Monitoreo: ');
  }
  if (recurso.startsWith('uwi_emedios_articulos:')) {
    return recurso.replace('uwi_emedios_articulos:', 'Boletín de Prensa ');
  }
  if (recurso.startsWith('source:')) {
    return 'Documento Operativo';
  }
  return recurso;
}

function extractFuentesBadges(fuentesJson: any): string[] {
  const arr = Array.isArray(fuentesJson)
    ? fuentesJson
    : typeof fuentesJson === 'string'
    ? (() => {
        try {
          return JSON.parse(fuentesJson);
        } catch {
          return [];
        }
      })()
    : [];

  const labels: string[] = [];
  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;
    if (item.nombre) {
      const cleanName = String(item.nombre)
        .replace(/HeadlessX|Camoufox|Lightpanda|Claude|WorldMonitor/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      labels.push(cleanName || 'Fuente Verificada');
    } else if (item.tipo === 'worldmonitor_mcp') {
      labels.push('Indicadores Regionales');
    } else if (item.tipo === 'publico') {
      labels.push('Fuente Pública Oficial');
    } else if (item.tipo === 'sensible') {
      labels.push('Fuente Operativa Sensible');
    } else if (item.tipo === 'reservado') {
      labels.push('Inteligencia Reservada');
    }
  }
  return labels.length > 0 ? Array.from(new Set(labels)) : ['Fuentes Oficiales CDMX'];
}

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
          <table
            className="table table-hover align-middle small mb-0"
            style={{ minWidth: 680 }}
          >
            <thead className="table-light">
              <tr className="text-secondary">
                <th>Acción</th>
                <th>Objetivo / Recurso</th>
                <th>Nivel de Acceso</th>
                <th>Fuentes Consultadas</th>
                <th>Confianza</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => {
                const fuentes = extractFuentesBadges(log.fuentes_json);
                return (
                  <tr key={log.id}>
                    <td className="fw-semibold text-nowrap" style={{ color: '#c2410c' }}>
                      {formatAccion(log.accion)}
                    </td>
                    <td className="text-dark fw-semibold text-nowrap">
                      {formatRecurso(log.recurso)}
                    </td>
                    <td className="text-nowrap">
                      <span className="badge bg-light border text-dark text-uppercase">
                        {log.nivel_conf_accedido}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {fuentes.map((f, idx) => (
                          <span
                            key={idx}
                            className="badge bg-primary-subtle text-primary border border-primary-subtle fw-normal"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-nowrap">
                      <span className="badge bg-success">{log.confianza_pct}%</span>
                    </td>
                    <td className="text-secondary text-nowrap">
                      {new Date(log.created_at).toLocaleString('es-MX')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
