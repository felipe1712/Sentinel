import React from 'react';

interface AlertaBadgeProps {
  nivel: string;
  size?: 'sm' | 'md';
}

const COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  critico:    { bg: 'rgba(239, 68, 68, 0.16)',  border: '#EF4444', text: '#F87171', label: 'CRÍTICO' },
  emergencia: { bg: 'rgba(239, 68, 68, 0.16)',  border: '#EF4444', text: '#F87171', label: 'EMERGENCIA' },
  alto:       { bg: 'rgba(255, 107, 53, 0.18)', border: '#FF6B35', text: '#FF6B35', label: 'ALTO' },
  alerta:     { bg: 'rgba(255, 107, 53, 0.18)', border: '#FF6B35', text: '#FF6B35', label: 'ALERTA' },
  medio:      { bg: 'rgba(255, 179, 71, 0.16)', border: '#FFB347', text: '#FBBF24', label: 'MEDIO' },
  vigilancia: { bg: 'rgba(255, 179, 71, 0.16)', border: '#FFB347', text: '#FBBF24', label: 'VIGILANCIA' },
  bajo:       { bg: 'rgba(34, 197, 94, 0.14)',  border: '#22C55E', text: '#4ADE80', label: 'BAJO' },
  normal:     { bg: 'rgba(34, 197, 94, 0.14)',  border: '#22C55E', text: '#4ADE80', label: 'NORMAL' },
};

export const AlertaBadge: React.FC<AlertaBadgeProps> = ({ nivel, size = 'sm' }) => {
  const key = (nivel || 'bajo').toLowerCase();
  const cfg = COLORS[key] || COLORS.bajo;
  return (
    <span
      className="d-inline-flex align-items-center gap-1 rounded-pill fw-semibold"
      style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.text,
        padding: size === 'sm' ? '2px 10px' : '4px 14px',
        fontSize: size === 'sm' ? '0.72rem' : '0.82rem',
        letterSpacing: '0.4px',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: cfg.border,
          display: 'inline-block',
        }}
      />
      {cfg.label}
    </span>
  );
};
