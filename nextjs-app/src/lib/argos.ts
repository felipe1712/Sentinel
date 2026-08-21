export interface SocialPost {
  argos_id: string;
  network: "telegram" | "twitter" | "instagram" | "tiktok" | "facebook" | "youtube";
  state_id: string;
  source_id: string;
  source_name: string;
  content: string;
  media_urls: string[];
  author: {
    id: string;
    handle: string;
    name: string;
    verified: boolean;
    followers: number;
  };
  location: {
    text: string | null;
    lat: number | null;
    lng: number | null;
    inferred: boolean;
  };
  published_at: string;
  engagement: {
    views: number;
    reactions: number;
    shares: number;
    comments: number;
  };
  raw: object;
}

export interface ArgosMonitor {
  id: string;
  state_id: string;
  network: string;
  channel_id: string;
  keywords: string[];
  active: boolean;
  posts_captured_today: number;
  relevance_rate: number;
  last_activity: string;
}

const ARGOS_URL = process.env.ARGOS_URL || "https://argos.sentineliq.com.mx";
const ARGOS_TOKEN = process.env.ARGOS_SERVICE_TOKEN || "sentineliq_argos_token_shared_sec_2026";

export async function fetchArgosFeed(stateId: string, since: string): Promise<SocialPost[]> {
  try {
    const res = await fetch(
      `${ARGOS_URL}/feed?state_id=${stateId}&since=${since}&limit=100`,
      {
        headers: { Authorization: `Bearer ${ARGOS_TOKEN}` },
        next: { revalidate: 0 },
      }
    );
    if (!res.ok) return [];
    return (await res.json()) as SocialPost[];
  } catch (err) {
    console.warn("No se pudo conectar a ARGOS Gateway:", err);
    return [];
  }
}

export async function registerMonitor(
  stateId: string,
  network: string,
  channelId: string,
  keywords: string[]
) {
  try {
    const res = await fetch(`${ARGOS_URL}/monitor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ARGOS_TOKEN}`,
      },
      body: JSON.stringify({ state_id: stateId, network, channel_id: channelId, keywords }),
    });
    return res.json();
  } catch (err) {
    console.error("Error registrando monitor en ARGOS:", err);
    return { ok: false };
  }
}

export async function deleteMonitor(monitorId: string) {
  try {
    const res = await fetch(`${ARGOS_URL}/monitor/${monitorId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${ARGOS_TOKEN}` },
    });
    return res.json();
  } catch (err) {
    console.error("Error desactivando monitor en ARGOS:", err);
    return { ok: false };
  }
}

export async function getArgosHealth() {
  try {
    const res = await fetch(`${ARGOS_URL}/health`, {
      headers: { Authorization: `Bearer ${ARGOS_TOKEN}` },
    });
    return res.json();
  } catch (err) {
    return { status: "offline", connectors: {} };
  }
}
