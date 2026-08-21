export type QueryAuditType =
  | "briefing"
  | "dossier"
  | "alerta"
  | "osint"
  | "narrativa"
  | "clasificacion";

export interface AuditSource {
  name: string;
  url: string;
  type: "federal" | "osint" | "telegram" | "world" | "interno";
  excerpt: string;
  credibility: "oficial" | "verificado" | "no_verificado";
  retrieved_at: string;
}

export function calculateConfidence(sources: AuditSource[]): number {
  if (!sources || sources.length === 0) return 0;

  let score = 0;
  let federalCount = 0;
  let internalCount = 0;

  for (const s of sources) {
    if (s.type === "federal" || s.credibility === "oficial") {
      if (federalCount < 2) {
        score += 25;
        federalCount++;
      }
    } else if (s.type === "interno" || s.credibility === "verificado") {
      if (internalCount < 2) {
        score += 15;
        internalCount++;
      }
    } else if (s.type === "osint") {
      score += 10;
    } else if (s.type === "telegram") {
      score += 5;
    } else if (s.type === "world") {
      score += 10;
    }
  }

  return Math.min(100, Math.max(0, score));
}

export function detectHallucinationRisk(
  sources: AuditSource[],
  confidence: number
): { flag: boolean; note: string | null } {
  if (!sources || sources.length === 0) {
    return { flag: true, note: "Sin fuentes verificadas respaldando la respuesta" };
  }

  if (confidence < 50) {
    return { flag: true, note: "Confianza insuficiente en las fuentes consultadas" };
  }

  const unverifiedOnly = sources.every((s) => s.credibility === "no_verificado");
  if (unverifiedOnly && confidence < 70) {
    return { flag: true, note: "Fuente no verificada como única referencia" };
  }

  return { flag: false, note: null };
}

export async function callClaudeWithAudit(params: {
  stateId: string;
  userId?: string;
  queryType: QueryAuditType;
  prompt: string;
  tools: string[];
  sources: AuditSource[];
  promptHandler: (promptText: string) => Promise<any>;
}) {
  const start = Date.now();

  const response = await params.promptHandler(params.prompt);

  const latency = Date.now() - start;
  const confidence = calculateConfidence(params.sources);
  const { flag, note } = detectHallucinationRisk(params.sources, confidence);

  const RUST_API = process.env.NEXT_PUBLIC_API_URL || "https://qro.sentineliq.com.mx/api";
  const SERVICE_TOKEN = process.env.SERVICE_TOKEN || "sentineliq_internal_service_token_2026";

  try {
    await fetch(`${RUST_API}/admin/query-audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_TOKEN}`,
        "X-Service-Token": SERVICE_TOKEN,
      },
      body: JSON.stringify({
        state_id: params.stateId,
        user_id: params.userId,
        query_type: params.queryType,
        prompt_text: params.prompt,
        model: "claude-sonnet-4-6",
        tools_used: params.tools,
        sources: params.sources,
        confidence_score: confidence,
        hallucination_flag: flag,
        hallucination_note: note,
        tokens_used: 450,
        latency_ms: latency,
        result_summary: typeof response === "string" ? response.slice(0, 300) : JSON.stringify(response).slice(0, 300),
      }),
    });
  } catch (err) {
    console.warn("Auditoría de consulta (best-effort) no se pudo enviar:", err);
  }

  return response;
}
