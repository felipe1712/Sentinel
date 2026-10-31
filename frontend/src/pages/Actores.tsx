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
            <h5 className="mb-0 text-dark fw-bold">
              Grafo de Redes Criminales y Presencia por Alcaldía y Colonia
            </h5>
            <small className="text-secondary">
              Vínculos territoriales documentados en informes oficiales y fuentes abiertas · Haz clic en un nodo para iluminar su red operativa
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
              <h6 className="mb-0 text-dark fw-bold">Ficha de Inteligencia del Nodo</h6>
            </div>
            {selectedNode ? (
              <div>
                <span
                  className="badge text-uppercase mb-2"
                  style={{ background: selectedNode.color || '#ea580c', color: '#fff' }}
                >
                  {selectedNode.category}
                </span>
                <h4 className="text-dark fw-bold mb-1">{selectedNode.label}</h4>
                {selectedNode.aliases?.length > 0 && (
                  <p className="small fw-semibold mb-2" style={{ color: '#c2410c' }}>
                    Aliases: {selectedNode.aliases.join(' · ')}
                  </p>
                )}
                {selectedNode.nivel_amenaza && (
                  <div className="mb-3">
                    <small className="text-secondary d-block mb-1">
                      Nivel de Amenaza Operativa: {selectedNode.nivel_amenaza} / 10
                    </small>
                    <div className="progress" style={{ height: 7, background: '#e2e8f0' }}>
                      <div
                        className="progress-bar bg-danger"
                        style={{ width: `${selectedNode.nivel_amenaza * 10}%` }}
                      />
                    </div>
                  </div>
                )}
                <p className="small text-secondary">
                  {selectedNode.descripcion ||
                    `Nodo georreferenciado en la red criminal de la Ciudad de México.`}
                </p>

                <div className="p-3 rounded-3 mt-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <small className="fw-bold text-uppercase d-block mb-2" style={{ color: '#ea580c' }}>
                    Principales Colonias por Índice de Señales FGJ
                  </small>
                  <ul className="small text-dark mb-0 ps-3">
                    <li>MORELOS (TEPITO) — Cuauhtémoc · 191 señales</li>
                    <li>CENTRO HISTÓRICO — Cuauhtémoc · 149 señales</li>
                    <li>GUERRERO — Cuauhtémoc · 77 señales</li>
                    <li>AGRÍCOLA ORIENTAL — Iztacalco · 63 señales</li>
                    <li>STA. CRUZ MEYEHUALCO — Iztapalapa · 60 señales</li>
                    <li>DOCTORES — Cuauhtémoc · 58 señales</li>
                    <li>D.U. QUETZALCÓATL — Iztapalapa · 57 señales</li>
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

      {/* Tabla de presencia de grupos por alcaldía */}
      <div className="uw-card">
        <div className="uw-card-header">
          <div>
            <h6 className="mb-0 text-dark fw-bold">
              Matriz de Presencia de Grupos Criminales por Alcaldía
            </h6>
            <small className="text-secondary">
              Cruce de información oficial FGJ vía transparencia e informes de inteligencia federal
            </small>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover table-sm align-middle mb-0" style={{ fontSize: '0.77rem' }}>
            <thead className="table-light">
              <tr className="text-secondary">
                <th>Alcaldía</th>
                <th>Grupos Locales Reconocidos FGJ</th>
                <th>Cárteles Atribuidos</th>
                <th className="text-end text-danger">Carpetas Extorsión 2024</th>
                <th className="text-end text-primary">Carpetas Narco 2024</th>
                <th>Nivel de Confianza</th>
              </tr>
            </thead>
            <tbody>
              {PRESENCIA_GRUPOS_ALCALDIA.map((row) => (
                <tr key={row.alcaldia}>
                  <td className="fw-bold text-dark">{row.alcaldia}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {row.grupos_locales.map((g) => (
                        <span
                          key={g}
                          className="badge"
                          style={{
                            background: '#fff7ed',
                            color: '#c2410c',
                            border: '1px solid #fed7aa',
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
                            background: '#fef2f2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
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
                  <td className="text-end fw-bold text-primary">
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
