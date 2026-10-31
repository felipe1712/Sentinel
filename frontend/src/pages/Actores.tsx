import React, { useEffect, useState } from 'react';
import { uwApi } from '../services/api';
import { ActorGraph } from '../components/ActorGraph';
import { PRESENCIA_GRUPOS_ALCALDIA } from '../data/delictivosData';

export const Actores: React.FC = () => {
  const [graphData, setGraphData] = useState<any>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    uwApi.getActorGraph().then((res) => {
      setGraphData(res);
      const ut = res.nodes?.find((n: any) =>
        String(n.data?.label).toLowerCase().includes('unión tepito')
      );
      if (ut) setSelectedNode(ut.data);
    });
  }, []);

  return (
    <div>
      <div className="uw-card mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 text-light fw-bold">
              Grafo de Redes Criminales y Presencia por Alcaldía / Colonia (Cytoscape.js)
            </h5>
            <small className="text-secondary">
              Datos integrados de <code>presencia_grupos_alcaldia.csv</code> (FGJ vía Transparencia +
              Informes Sedena/Semar/CNI/DEA) · Haz clic en un nodo para iluminar su red operativa
            </small>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-xl-8">
          <div className="uw-card">
            <ActorGraph elements={graphData} onNodeSelect={setSelectedNode} />
          </div>
        </div>

        <div className="col-xl-4">
          <div className="uw-card h-100">
            <div className="uw-card-header">
              <h6 className="mb-0 text-light fw-bold">Ficha de Inteligencia del Nodo</h6>
            </div>
            {selectedNode ? (
              <div>
                <span
                  className="badge text-uppercase mb-2"
                  style={{ background: selectedNode.color || '#FF6B35', color: '#fff' }}
                >
                  {selectedNode.category}
                </span>
                <h4 className="text-light fw-bold mb-1">{selectedNode.label}</h4>
                {selectedNode.aliases?.length > 0 && (
                  <p className="small text-warning mb-2">
                    Aliases: {selectedNode.aliases.join(' · ')}
                  </p>
                )}
                {selectedNode.nivel_amenaza && (
                  <div className="mb-3">
                    <small className="text-secondary d-block mb-1">
                      Nivel de Amenaza Operativa: {selectedNode.nivel_amenaza} / 10
                    </small>
                    <div className="progress" style={{ height: 7, background: '#1e2433' }}>
                      <div
                        className="progress-bar bg-danger"
                        style={{ width: `${selectedNode.nivel_amenaza * 10}%` }}
                      />
                    </div>
                  </div>
                )}
                <p className="small text-secondary">
                  {selectedNode.descripcion ||
                    `Nodo georreferenciado en la red criminal de la Ciudad de México (${selectedNode.alcaldia || 'CDMX'}).`}
                </p>

                <div className="p-3 rounded-3 mt-3" style={{ background: '#11141c', border: '1px solid #262c3d' }}>
                  <small className="fw-bold text-uppercase d-block mb-2" style={{ color: '#FF6B35' }}>
                    Top Colonias en Índice de Señales FGJ
                  </small>
                  <ul className="small text-light mb-0 ps-3">
                    <li>MORELOS (TEPITO) — Cuauhtémoc (191 señales)</li>
                    <li>CENTRO HISTÓRICO — Cuauhtémoc (149 señales)</li>
                    <li>GUERRERO — Cuauhtémoc (77 señales)</li>
                    <li>AGRÍCOLA ORIENTAL — Iztacalco (63 señales)</li>
                    <li>STA. CRUZ MEYEHUALCO — Iztapalapa (60 señales)</li>
                    <li>DOCTORES — Cuauhtémoc (58 señales)</li>
                    <li>D.U. QUETZALCÓATL — Iztapalapa (57 señales)</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-secondary small">
                Selecciona cualquier nodo en el grafo para inspeccionar sus vínculos.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabla completa de presencia_grupos_alcaldia.csv */}
      <div className="uw-card">
        <div className="uw-card-header">
          <div>
            <h6 className="mb-0 text-light fw-bold">
              Matriz de Presencia de Grupos Criminales por Alcaldía (<code>presencia_grupos_alcaldia.csv</code>)
            </h6>
            <small className="text-secondary">
              Fuente 1: Infobae 21-may-2024 (grupos reconocidos por FGJ vía transparencia) · Fuente 2:
              Milenio/PolíticoMX 22-may-2025 (Sedena, Semar, CNI, DEA)
            </small>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-dark table-hover table-sm align-middle mb-0" style={{ fontSize: '0.77rem' }}>
            <thead>
              <tr className="text-secondary">
                <th>Alcaldía</th>
                <th>Grupos Locales Reconocidos FGJ</th>
                <th>Cárteles Atribuidos (Medios / Federal)</th>
                <th className="text-end text-danger">Carpetas Extorsión 2024</th>
                <th className="text-end text-info">Carpetas Narco 2024</th>
                <th>Nivel de Confianza</th>
              </tr>
            </thead>
            <tbody>
              {PRESENCIA_GRUPOS_ALCALDIA.map((row) => (
                <tr key={row.alcaldia}>
                  <td className="fw-bold text-light">{row.alcaldia}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {row.grupos_locales.map((g) => (
                        <span
                          key={g}
                          className="badge"
                          style={{
                            background: 'rgba(255, 107, 53, 0.16)',
                            color: '#fdba74',
                            border: '1px solid #FF6B35',
                          }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {row.carteles_medios.map((c) => (
                        <span
                          key={c}
                          className="badge"
                          style={{
                            background: 'rgba(239, 68, 68, 0.18)',
                            color: '#fca5a5',
                            border: '1px solid #ef4444',
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-end fw-bold text-danger">
                    {row.extorsion_cobro_carpetas_2024.toLocaleString()}
                  </td>
                  <td className="text-end fw-bold text-info">
                    {row.narcomenudeo_venta_carpetas_2024.toLocaleString()}
                  </td>
                  <td className="text-secondary small">{row.confianza}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
