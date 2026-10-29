import React, { useEffect, useState } from 'react';
import { uwApi } from '../services/api';
import { ActorGraph } from '../components/ActorGraph';

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
              Grafo de Redes Criminales y Presencia por Colonia (Cytoscape.js)
            </h5>
            <small className="text-secondary">
              Metodología Claude-OSINT (<code>osint-methodology</code> + <code>offensive-osint</code>) ·
              Haz clic en un nodo (ej. Unión Tepito) para iluminar las colonias donde opera
            </small>
          </div>
        </div>
      </div>

      <div className="row g-3">
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
                    Colonias con Presencia Documentada
                  </small>
                  <ul className="small text-light mb-0 ps-3">
                    <li>MORELOS (TEPITO) — Cuauhtémoc (Crítico)</li>
                    <li>CENTRO HISTÓRICO — Cuauhtémoc (Crítico)</li>
                    <li>GUERRERO — Cuauhtémoc (Crítico)</li>
                    <li>ROMA NORTE / CONDESA — Cuauhtémoc (Medio)</li>
                    <li>POLANCO SECCIÓN III — Miguel Hidalgo (Medio)</li>
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
    </div>
  );
};
