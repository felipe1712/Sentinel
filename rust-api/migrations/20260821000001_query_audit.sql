-- Migration for Query Audit System
CREATE TABLE IF NOT EXISTS query_audit (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id         UUID NOT NULL,
  user_id          UUID,
  query_type       VARCHAR(20) NOT NULL CHECK (query_type IN
                   ('briefing','dossier','alerta','osint','narrativa','clasificacion')),
  prompt_text      TEXT NOT NULL,
  model            VARCHAR(100) DEFAULT 'claude-sonnet-4-6',
  tools_used       TEXT[] DEFAULT '{}',
  sources          JSONB NOT NULL DEFAULT '[]',
  confidence_score INTEGER DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
  hallucination_flag    BOOLEAN DEFAULT false,
  hallucination_note    TEXT,
  tokens_used      INTEGER DEFAULT 0,
  latency_ms       INTEGER DEFAULT 0,
  result_summary   TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_audit_state ON query_audit(state_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_audit_type  ON query_audit(state_id, query_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_audit_flag  ON query_audit(state_id, hallucination_flag) WHERE hallucination_flag = true;
