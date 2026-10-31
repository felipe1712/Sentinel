import React from 'react';

interface AlertaBadgeProps {
  nivel: string;
  size?: 'sm' | 'md';
}

const COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  critico:    { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c', label: 'CRÍTICO' },
  emergencia: { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c', label: 'EMERGENCIA' },
  alto:       { bg: '#fff7ed', border: '#ea580c', text: '#c2410c', label: 'ALTO' },
  alerta:     { bg: '#fff7ed', border: '#ea580c', text: '#c2410c', label: 'ALERTA' },
  medio:      { bg: '#fffbeb', border: '#f59e0b', text: '#b45309', label: 'MEDIO' },
  vigilancia: { bg: '#fffbeb', border: '#f59e0b', text: '#b45309', label: 'VIGILANCIA' },
  bajo:       { bg: '#f0fdf4', border: '#22c55e', text: '#15803d', label: 'BAJO' },
  normal:     { bg: '#f0fdf4', border: '#22c55e', text: '#15803d', label: 'NORMAL' },
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
