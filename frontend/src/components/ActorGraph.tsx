import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';

interface ActorGraphProps {
  elements: {
    nodes: any[];
    edges: any[];
  };
  onNodeSelect?: (nodeData: any) => void;
}

export const ActorGraph: React.FC<ActorGraphProps> = ({ elements, onNodeSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>('Unión Tepito');

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...(elements.nodes || []), ...(elements.edges || [])],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            label: 'data(label)',
            color: '#f8fafc',
            'font-size': '11px',
            'font-weight': 600,
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-outline-width': 2,
            'text-outline-color': '#0d0d0d',
            width: 34,
            height: 34,
            'border-width': 2,
            'border-color': '#ffffff33',
          },
        },
        {
          selector: 'node[category = "cartel"]',
          style: {
            width: 48,
            height: 48,
            'border-width': 3,
            'border-color': '#fca5a5',
          },
        },
        {
          selector: 'node[category = "banda_local"]',
          style: {
            width: 40,
            height: 40,
            'border-width': 2,
            'border-color': '#fdba74',
          },
        },
        {
          selector: 'node[category = "colonia"]',
          style: {
            shape: 'round-rectangle',
            width: 38,
            height: 28,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#475569',
            'target-arrow-color': '#FF6B35',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(label)',
            'font-size': '9px',
            color: '#94a3b8',
            'text-rotation': 'autorotate',
            'text-background-color': '#0d0d0d',
            'text-background-opacity': 0.85,
          },
        },
        {
          selector: '.highlighted',
          style: {
            'border-width': 4,
            'border-color': '#FF6B35',
            'line-color': '#FF6B35',
            'target-arrow-color': '#FF6B35',
            opacity: 1,
          },
        },
        {
          selector: '.faded',
          style: {
            opacity: 0.22,
          },
        },
      ],
      layout: {
        name: 'cose',
        padding: 40,
        animate: false,
      },
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const data = node.data();
      setSelectedLabel(data.label);
      onNodeSelect?.(data);

      cy.elements().removeClass('highlighted faded');
      const neighborhood = node.closedNeighborhood();
      cy.elements().not(neighborhood).addClass('faded');
      neighborhood.addClass('highlighted');
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('highlighted faded');
      }
    });

    cyRef.current = cy;
    return () => {
      cy.destroy();
    };
  }, [elements, onNodeSelect]);

  const highlightActor = (actorLabel: string) => {
    const cy = cyRef.current;
    if (!cy) return;
    const target = cy.nodes().filter((n) =>
      String(n.data('label')).toLowerCase().includes(actorLabel.toLowerCase())
    );
    if (target.length > 0) {
      cy.elements().removeClass('highlighted faded');
      const hood = target.closedNeighborhood();
      cy.elements().not(hood).addClass('faded');
      hood.addClass('highlighted');
      setSelectedLabel(target[0].data('label'));
      onNodeSelect?.(target[0].data());
    }
  };

  return (
    <div className="position-relative">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="small text-secondary">Filtro rápido de red:</span>
          {['Unión Tepito', 'Fuerza Anti-Unión', 'CJNG', 'Los Tanzanios', 'Los Rodolfos'].map(
            (name) => (
              <button
                key={name}
                type="button"
                className="btn btn-sm py-0 px-2"
                style={{
                  fontSize: '0.73rem',
                  background: selectedLabel.includes(name) ? '#FF6B35' : '#1b202c',
                  color: selectedLabel.includes(name) ? '#0d0d0d' : '#e2e8f0',
                  fontWeight: 600,
                }}
                onClick={() => highlightActor(name)}
              >
                {name}
              </button>
            )
          )}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary py-0 px-2"
            style={{ fontSize: '0.73rem' }}
            onClick={() => cyRef.current?.elements().removeClass('highlighted faded')}
          >
            Mostrar Todo
          </button>
        </div>

        {/* Leyenda de nodos OpenPlanter */}
        <div className="d-flex align-items-center gap-3 small">
          <span>
            <span style={{ color: '#EF4444' }}>●</span> Cártel
          </span>
          <span>
            <span style={{ color: '#FF6B35' }}>●</span> Banda Local
          </span>
          <span>
            <span style={{ color: '#3B82F6' }}>■</span> Colonia CDMX
          </span>
          <span>
            <span style={{ color: '#64748B' }}>●</span> Incidente
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 520,
          background: '#0f1219',
          border: '1px solid #252b3b',
          borderRadius: 12,
        }}
      />
    </div>
  );
};
