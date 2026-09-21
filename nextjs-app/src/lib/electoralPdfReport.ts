import { getPartyColor, PARTY_COLORS } from "@/lib/gisColors";

export interface ElectoralPdfReportParams {
  territoryTitle: string;
  territorySubtitle: string;
  baseBoundary: string;
  modalYear: number;
  modalElectionType: string;
  stateShortName: string;
  winnerParty: string;
  winnerColor: string;
  activeResult: any;
  partyBreakdown: Array<{
    party: string;
    rawParty?: string;
    votes: number;
    pct: number;
    color: string;
    pureVotes?: number;
    allyVotes?: number;
  }>;
  trendYears: number[];
  trendData: Array<{
    year?: number;
    panVotes: number;
    morenaVotes: number;
    priVotes: number;
    mcVotes: number;
  }>;
  chartLayout: {
    width: number;
    height: number;
    paddingLeft: number;
    paddingRight: number;
    paddingBottom: number;
    gridTicks: Array<{ y: number; label: string }>;
    panPoints: Array<{ x: number; y: number; votes: number }>;
    morenaPoints: Array<{ x: number; y: number; votes: number }>;
    priPoints: Array<{ x: number; y: number; votes: number }>;
    mcPoints: Array<{ x: number; y: number; votes: number }>;
    panPathD: string;
    morenaPathD: string;
    priPathD: string;
    mcPathD: string;
    hasPri: boolean;
  };
  constituentSections: any[];
  historicalResults: Record<number, any>;
}

function renderEvolutionRow(label: string, color: string, votesArr: number[]): string {
  const f = votesArr[0] || 0;
  const l = votesArr[votesArr.length - 1] || 0;
  const d = l - f;
  const p = f > 0 ? ((d / f) * 100).toFixed(1) : "0.0";
  const diffFormatted = d >= 0 ? `+${d.toLocaleString()}` : d.toLocaleString();
  const pctFormatted = d >= 0 ? `+${p}%` : `${p}%`;
  const diffColor = d >= 0 ? "#16a34a" : "#dc2626";

  const cells = votesArr
    .map((v) => `<td style="padding: 6px 10px; text-align: right; font-weight: 600;">${(v || 0).toLocaleString()}</td>`)
    .join("");

  return `
    <tr>
      <td style="padding: 6px 10px; font-weight: bold; color: ${color};">${label}</td>
      ${cells}
      <td style="padding: 6px 10px; text-align: right; font-weight: bold; color: ${diffColor};">${diffFormatted}</td>
      <td style="padding: 6px 10px; text-align: right; font-weight: bold; color: ${diffColor};">${pctFormatted}</td>
    </tr>
  `;
}

export function generateElectoralPdfReportHtml(data: ElectoralPdfReportParams): string {
  const {
    territoryTitle,
    territorySubtitle,
    baseBoundary,
    modalYear,
    modalElectionType,
    stateShortName,
    winnerParty,
    winnerColor,
    activeResult,
    partyBreakdown,
    trendYears,
    trendData,
    chartLayout,
    constituentSections,
    historicalResults,
  } = data;

  const reportDate = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const winnerBg = winnerColor;
  const panColor = PARTY_COLORS["PAN"] || "#0055B8";
  const morenaColor = PARTY_COLORS["MORENA"] || "#70112C";
  const priColor = PARTY_COLORS["PRI"] || "#D92128";
  const mcColor = PARTY_COLORS["MC"] || "#FF8200";

  // SVG de Tendencia
  const svgGridLines = chartLayout.gridTicks
    .map(
      (t) => `
      <line x1="${chartLayout.paddingLeft}" y1="${t.y}" x2="${chartLayout.width - chartLayout.paddingRight}" y2="${t.y}" stroke="#e2e8f0" stroke-dasharray="3 3" stroke-width="1" />
      <text x="${chartLayout.paddingLeft - 8}" y="${t.y + 4}" text-anchor="end" font-size="10" fill="#64748b" font-family="sans-serif">${t.label}</text>
    `
    )
    .join("");

  const svgXLabels = trendYears
    .map((yr, idx) => {
      const x = chartLayout.panPoints[idx]?.x || chartLayout.paddingLeft;
      const y = chartLayout.height - chartLayout.paddingBottom + 18;
      return `<text x="${x}" y="${y}" text-anchor="middle" font-size="11" font-weight="bold" fill="#334155" font-family="sans-serif">${yr}</text>`;
    })
    .join("");

  const svgPanNodes = chartLayout.panPoints
    .map((pt, idx) => {
      const isHigher = pt.votes >= (chartLayout.morenaPoints[idx]?.votes || 0);
      const bY = isHigher ? pt.y - 12 : pt.y + 16;
      return `
        <circle cx="${pt.x}" cy="${pt.y}" r="5" fill="${panColor}" stroke="#ffffff" stroke-width="2" />
        <rect x="${pt.x - 26}" y="${bY - 9}" width="52" height="14" rx="3" fill="${panColor}" />
        <text x="${pt.x}" y="${bY + 2}" text-anchor="middle" font-size="9" font-weight="bold" fill="#ffffff" font-family="sans-serif">${pt.votes.toLocaleString()}</text>
      `;
    })
    .join("");

  const svgMorenaNodes = chartLayout.morenaPoints
    .map((pt, idx) => {
      const isHigher = pt.votes > (chartLayout.panPoints[idx]?.votes || 0);
      const bY = isHigher ? pt.y - 12 : pt.y + 16;
      return `
        <circle cx="${pt.x}" cy="${pt.y}" r="5" fill="${morenaColor}" stroke="#ffffff" stroke-width="2" />
        <rect x="${pt.x - 26}" y="${bY - 9}" width="52" height="14" rx="3" fill="${morenaColor}" />
        <text x="${pt.x}" y="${bY + 2}" text-anchor="middle" font-size="9" font-weight="bold" fill="#ffffff" font-family="sans-serif">${pt.votes.toLocaleString()}</text>
      `;
    })
    .join("");

  const svgPriNodes = chartLayout.hasPri
    ? chartLayout.priPoints
        .map(
          (pt) => `
        <circle cx="${pt.x}" cy="${pt.y}" r="4.5" fill="${priColor}" stroke="#ffffff" stroke-width="1.5" />
        ${pt.votes > 0 ? `<text x="${pt.x}" y="${pt.y - 8}" text-anchor="middle" font-size="8.5" font-weight="bold" fill="${priColor}" font-family="sans-serif">${pt.votes.toLocaleString()}</text>` : ""}
      `
        )
        .join("")
    : "";

  const svgMcNodes = chartLayout.mcPoints
    .map(
      (pt) => `
      <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="${mcColor}" stroke="#ffffff" stroke-width="1.5" />
      <text x="${pt.x}" y="${pt.y + 12}" text-anchor="middle" font-size="8" font-weight="bold" fill="${mcColor}" font-family="sans-serif">${pt.votes > 0 ? pt.votes.toLocaleString() : "0"}</text>
    `
    )
    .join("");

  const svgTrendChart = `
    <svg viewBox="0 0 ${chartLayout.width} ${chartLayout.height}" style="width: 100%; max-width: 650px; height: auto; display: block; margin: 10px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      ${svgGridLines}
      <line x1="${chartLayout.paddingLeft}" y1="${chartLayout.height - chartLayout.paddingBottom}" x2="${chartLayout.width - chartLayout.paddingRight}" y2="${chartLayout.height - chartLayout.paddingBottom}" stroke="#94a3b8" stroke-width="1.5" />
      <path d="${chartLayout.panPathD}" fill="none" stroke="${panColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <path d="${chartLayout.morenaPathD}" fill="none" stroke="${morenaColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      ${chartLayout.hasPri ? `<path d="${chartLayout.priPathD}" fill="none" stroke="${priColor}" stroke-width="2.5" stroke-dasharray="4 2" stroke-linecap="round" stroke-linejoin="round" />` : ""}
      <path d="${chartLayout.mcPathD}" fill="none" stroke="${mcColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      ${svgPanNodes}
      ${svgMorenaNodes}
      ${svgPriNodes}
      ${svgMcNodes}
      ${svgXLabels}
    </svg>
  `;

  // Desglose de partidos
  const partyRowsHtml = partyBreakdown
    .map((p) => {
      const hasSub = p.pureVotes !== undefined && p.allyVotes !== undefined && p.allyVotes > 0;
      return `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 4px; color: #1e293b;">
            <span style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${p.color};"></span>
              ${p.party}
            </span>
            <span>${p.votes.toLocaleString()} votos (${p.pct}%)</span>
          </div>
          <div style="background: #e2e8f0; height: 10px; border-radius: 5px; overflow: hidden;">
            <div style="background-color: ${p.color}; width: ${Math.min(100, p.pct)}%; height: 100%;"></div>
          </div>
          ${
            hasSub
              ? `
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 3px;">
              <span>Voto Puro: <strong>${p.pureVotes?.toLocaleString()}</strong></span>
              <span>Aporte Aliados: <strong>${p.allyVotes?.toLocaleString()}</strong></span>
            </div>
          `
              : ""
          }
        </div>
      `;
    })
    .join("");

  // Filas de la tabla de evolución
  const panVotesArr = trendYears.map((_, idx) => trendData[idx]?.panVotes || 0);
  const morenaVotesArr = trendYears.map((_, idx) => trendData[idx]?.morenaVotes || 0);
  const priVotesArr = trendYears.map((_, idx) => trendData[idx]?.priVotes || 0);
  const mcVotesArr = trendYears.map((_, idx) => trendData[idx]?.mcVotes || 0);

  const evolutionPanRow = renderEvolutionRow("PAN / Coalición PAN", panColor, panVotesArr);
  const evolutionMorenaRow = renderEvolutionRow("MORENA / Coalición MORENA", morenaColor, morenaVotesArr);
  const evolutionPriRow = chartLayout.hasPri ? renderEvolutionRow("PRI / Coalición PRI", priColor, priVotesArr) : "";
  const evolutionMcRow = renderEvolutionRow("Movimiento Ciudadano", mcColor, mcVotesArr);

  // Tabla de secciones constitutivas
  let sectionsSectionHtml = "";
  if (constituentSections && constituentSections.length > 0) {
    const rows = constituentSections
      .map((s, idx) => {
        const isWinPan = Boolean(s.ganador_partido?.includes("PAN"));
        const mg = Number(s.margen_victoria_pct || 0);
        let badgeBg = "#fee2e2";
        let badgeColor = "#991b1b";
        let badgeText = "Oposición";
        if (isWinPan && mg >= 15) {
          badgeBg = "#dcfce7";
          badgeColor = "#166534";
          badgeText = "Bastión Azul";
        } else if (isWinPan && mg < 15) {
          badgeBg = "#fef9c3";
          badgeColor = "#854d0e";
          badgeText = "Competido Azul";
        }
        const pCol = getPartyColor(s.ganador_partido);
        return `
          <tr style="${idx % 2 === 1 ? "background-color: #f8fafc;" : ""}">
            <td style="padding: 5px 8px; text-align: center; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${s.seccion}</td>
            <td style="padding: 5px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${s.municipio_nombre || territoryTitle}</td>
            <td style="padding: 5px 8px; text-align: right; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${Number(s.lista_nominal || 0).toLocaleString()}</td>
            <td style="padding: 5px 8px; text-align: right; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 600;">${Number(s.total_votos || 0).toLocaleString()}</td>
            <td style="padding: 5px 8px; text-align: right; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${s.participacion_pct || 0}%</td>
            <td style="padding: 5px 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">
              <span style="background-color: ${pCol}; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; display: inline-block;">${s.ganador_partido || "Sin datos"}</span>
            </td>
            <td style="padding: 5px 8px; text-align: right; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 600;">${Number(s.ganador_votos || 0).toLocaleString()}</td>
            <td style="padding: 5px 8px; text-align: right; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: bold;">${s.ganador_pct || 0}%</td>
            <td style="padding: 5px 8px; text-align: right; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: bold; color: #0055b8;">+${mg}%</td>
            <td style="padding: 5px 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">
              <span style="background-color: ${badgeBg}; color: ${badgeColor}; padding: 2px 6px; border-radius: 4px; font-size: 9.5px; font-weight: bold; display: inline-block;">${badgeText}</span>
            </td>
          </tr>
        `;
      })
      .join("");

    sectionsSectionHtml = `
      <div style="margin-top: 24px; page-break-before: auto;">
        <div style="border-bottom: 2px solid #0f172a; padding-bottom: 4px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
          <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin: 0;">Matriz de Secciones Electorales</h3>
          <span style="font-size: 11px; color: #64748b; font-weight: bold;">Total: ${constituentSections.length} secciones constitutivas</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px;">
          <thead>
            <tr style="background-color: #0f172a; color: #ffffff;">
              <th style="padding: 6px 8px; text-align: center; font-size: 10px; text-transform: uppercase;">Sección</th>
              <th style="padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase;">Municipio</th>
              <th style="padding: 6px 8px; text-align: right; font-size: 10px; text-transform: uppercase;">L. Nominal</th>
              <th style="padding: 6px 8px; text-align: right; font-size: 10px; text-transform: uppercase;">Votos Totales</th>
              <th style="padding: 6px 8px; text-align: right; font-size: 10px; text-transform: uppercase;">Part. %</th>
              <th style="padding: 6px 8px; text-align: center; font-size: 10px; text-transform: uppercase;">Ganador</th>
              <th style="padding: 6px 8px; text-align: right; font-size: 10px; text-transform: uppercase;">Votos Ganador</th>
              <th style="padding: 6px 8px; text-align: right; font-size: 10px; text-transform: uppercase;">% Ganador</th>
              <th style="padding: 6px 8px; text-align: right; font-size: 10px; text-transform: uppercase;">Margen</th>
              <th style="padding: 6px 8px; text-align: center; font-size: 10px; text-transform: uppercase;">Diagnóstico</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  // Diagnóstico de continuidad / alternancia
  const baseTrendYr = trendYears[0];
  const lastTrendYr = trendYears[trendYears.length - 1];
  const winBase = historicalResults?.[baseTrendYr]?.ganador_partido;
  const winLast = historicalResults?.[lastTrendYr]?.ganador_partido;
  let diagText = "Datos insuficientes para determinar alternancia histórica.";
  if (winBase && winLast && winBase !== "Sin datos" && winLast !== "Sin datos") {
    if (winBase === winLast) {
      diagText = `CONTINUIDAD POLÍTICA: Retenido por ${winLast} en ambos ciclos analizados (${baseTrendYr} y ${lastTrendYr}).`;
    } else {
      diagText = `ALTERNANCIA POLÍTICA: Cambio de preferencia electoral. En ${baseTrendYr} triunfo de ${winBase} hacia ${winLast} en ${lastTrendYr}.`;
    }
  }

  const docTitle = `Reporte_Electoral_${territoryTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}_${modalYear}`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${docTitle}</title>
  <style>
    @page {
      size: letter portrait;
      margin: 12mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background-color: #ffffff;
      font-size: 12px;
      line-height: 1.4;
    }
    .no-print {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f172a;
      color: #ffffff;
      padding: 10px 20px;
      position: sticky;
      top: 0;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    }
    .btn-action {
      background: #dc2626;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-action:hover {
      background: #b91c1c;
    }
    .btn-secondary {
      background: #334155;
      color: #ffffff;
      border: none;
      padding: 8px 14px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-secondary:hover {
      background: #1e293b;
    }
    .btn-close-view {
      background: #475569;
      color: #ffffff;
      border: none;
      padding: 8px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      padding: 16px 20px;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      .container {
        padding: 0;
        max-width: 100%;
      }
      tr {
        page-break-inside: avoid;
      }
      .card-box {
        page-break-inside: avoid;
      }
    }
    .card-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 16px;
      background: #ffffff;
    }
  </style>
  <script src="/js/html2pdf.bundle.min.js"></script>
  <script>
    if (typeof html2pdf === 'undefined') {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      document.head.appendChild(s);
    }
  </script>
</head>
<body>
  <div class="no-print">
    <div style="font-weight: bold; font-size: 13px; display: flex; align-items: center; gap: 10px;">
      <span>SENTINELIQ | Reporte Ejecutivo Territorial</span>
      <span id="download-status" style="font-size: 11px; padding: 3px 8px; border-radius: 4px; background: rgba(255,255,255,0.15); color: #cbd5e1; font-weight: normal;">
        Descargando PDF en automático...
      </span>
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="btn-action" onclick="downloadPdfDirect();">
        Descargar PDF
      </button>
      <button class="btn-secondary" onclick="window.print();">
        Imprimir
      </button>
      <button class="btn-close-view" onclick="window.close();">
        Cerrar
      </button>
    </div>
  </div>

  <div id="report-container" class="container">
    <!-- Header Institucional -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 16px;">
      <div>
        <div style="font-size: 18px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a;">SENTINEL<span style="color: #0055b8;">IQ</span></div>
        <div style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Sistema Electoral y Territorial · INE ${stateShortName}</div>
      </div>
      <div style="text-align: right; font-size: 11px; color: #64748b;">
        <div><strong>Emisión:</strong> ${reportDate}</div>
        <div><strong>Capa:</strong> ${baseBoundary.replace("_", " ").toUpperCase()}</div>
      </div>
    </div>

    <!-- Banner del Territorio -->
    <div style="background: linear-gradient(135deg, ${winnerBg} 0%, #0f172a 120%); color: #ffffff; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="background: rgba(255,255,255,0.25); padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase;">
            ${baseBoundary.replace("_", " ")} · ${stateShortName}
          </span>
          <h1 style="font-size: 20px; font-weight: 900; margin: 6px 0 2px 0;">${territoryTitle}</h1>
          <div style="font-size: 12px; opacity: 0.85;">${territorySubtitle} · Elección de ${modalElectionType.toUpperCase()} ${modalYear}</div>
        </div>
        <div style="text-align: right; background: rgba(0,0,0,0.2); padding: 8px 14px; border-radius: 8px;">
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85;">Partido Ganador</div>
          <div style="font-size: 16px; font-weight: 900;">${winnerParty}</div>
          <div style="font-size: 12px; font-weight: bold;">${activeResult?.ganador_pct || 0}% de los votos</div>
        </div>
      </div>
    </div>

    <!-- Resumen Ejecutivo (KPI Cards) -->
    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 16px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center;">
        <span style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block;">Total Votos</span>
        <span style="font-size: 15px; font-weight: 800; color: #0f172a;">${Number(activeResult?.total_votos || 0).toLocaleString()}</span>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center;">
        <span style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block;">Lista Nominal</span>
        <span style="font-size: 15px; font-weight: 800; color: #0f172a;">${Number(activeResult?.lista_nominal || 0).toLocaleString()}</span>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center;">
        <span style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block;">Participación</span>
        <span style="font-size: 15px; font-weight: 800; color: #0f172a;">${activeResult?.participacion_pct || 0}%</span>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center;">
        <span style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block;">Votos Ganador</span>
        <span style="font-size: 15px; font-weight: 800; color: ${winnerBg};">${Number(activeResult?.ganador_votos || 0).toLocaleString()}</span>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center;">
        <span style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block;">Margen Vic.</span>
        <span style="font-size: 15px; font-weight: 800; color: #0055b8;">+${activeResult?.margen_victoria_pct || 0}%</span>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center;">
        <span style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block;">2do Lugar</span>
        <span style="font-size: 13px; font-weight: 800; color: #475569; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${activeResult?.segundo_partido || "N/A"}</span>
        <span style="font-size: 10px; color: #64748b;">${activeResult?.segundo_pct || 0}%</span>
      </div>
    </div>

    <!-- Desglose por Partidos y Coaliciones -->
    <div class="card-box">
      <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
        Desglose de Resultados Electorales (${modalElectionType.toUpperCase()} ${modalYear})
      </div>
      ${partyRowsHtml}
    </div>

    <!-- Tendencia Histórica y Gráfica SVG -->
    <div class="card-box">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;">
        <span style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase;">
          Evolución y Tendencia Electoral (${trendYears.join(" - ")})
        </span>
        <div style="display: flex; gap: 12px; font-size: 10px; font-weight: bold;">
          <span style="display: flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 3px; background: ${panColor}; display: inline-block;"></span> PAN
          </span>
          <span style="display: flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 3px; background: ${morenaColor}; display: inline-block;"></span> MORENA
          </span>
          ${
            chartLayout.hasPri
              ? `
            <span style="display: flex; align-items: center; gap: 4px;">
              <span style="width: 10px; height: 3px; background: ${priColor}; display: inline-block;"></span> PRI
            </span>
          `
              : ""
          }
          <span style="display: flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 3px; background: ${mcColor}; display: inline-block;"></span> MC
          </span>
        </div>
      </div>

      <!-- Gráfica Vectorial SVG -->
      ${svgTrendChart}

      <!-- Tabla Comparativa de Ciclos -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 11px;">
        <thead>
          <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
            <th style="padding: 6px 10px; text-align: left;">Fuerza Política</th>
            ${trendYears.map((yr) => `<th style="padding: 6px 10px; text-align: right;">Ciclo ${yr}</th>`).join("")}
            <th style="padding: 6px 10px; text-align: right;">Dif. Votos (Δ)</th>
            <th style="padding: 6px 10px; text-align: right;">Var. % (Δ%)</th>
          </tr>
        </thead>
        <tbody>
          ${evolutionPanRow}
          ${evolutionMorenaRow}
          ${evolutionPriRow}
          ${evolutionMcRow}
        </tbody>
      </table>

      <!-- Diagnóstico Político -->
      <div style="margin-top: 12px; padding: 8px 12px; background: #f8fafc; border-left: 3px solid #0055b8; border-radius: 4px; font-size: 11px; font-weight: bold; color: #1e293b;">
        ${diagText}
      </div>
    </div>

    <!-- Matriz de Secciones Electorales (Municipios / Distritos) -->
    ${sectionsSectionHtml}

    <!-- Footer del Documento -->
    <div style="margin-top: 24px; padding-top: 10px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
      <span>SentinelIQ · Plataforma de Análisis Político y Monitoreo Estratégico</span>
      <span>Documento Confidencial · Prohibida su reproducción no autorizada</span>
    </div>
  </div>

  <script>
    function downloadPdfDirect() {
      var statusEl = document.getElementById('download-status');
      if (statusEl) {
        statusEl.innerHTML = '⏳ Generando archivo PDF...';
        statusEl.style.color = '#fef08a';
      }
      var element = document.getElementById('report-container');
      if (!element) return;

      if (typeof html2pdf !== 'undefined') {
        var opt = {
          margin: [8, 8, 8, 8],
          filename: '${docTitle}.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
          jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        html2pdf().set(opt).from(element).save()
          .then(function() {
            if (statusEl) {
              statusEl.innerHTML = '✅ Descarga completada';
              statusEl.style.color = '#86efac';
            }
          })
          .catch(function(err) {
            console.error('Error al generar PDF directo:', err);
            if (statusEl) statusEl.innerHTML = '⚠️ Abriendo diálogo de impresión...';
            window.print();
          });
      } else {
        window.print();
      }
    }

    window.addEventListener('load', function() {
      setTimeout(function() {
        downloadPdfDirect();
      }, 700);
    });
  <\/script>
</body>
</html>`;
}

export function openElectoralPdfReport(data: ElectoralPdfReportParams): void {
  if (typeof window === "undefined") return;

  const printWin = window.open("", "_blank");
  if (!printWin) {
    alert("Por favor permita ventanas emergentes (pop-ups) en su navegador para visualizar y guardar el Reporte PDF.");
    return;
  }

  const html = generateElectoralPdfReportHtml(data);
  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();
}
