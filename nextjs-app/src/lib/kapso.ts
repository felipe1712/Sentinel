/**
 * SentinelIQ - Cliente de Integración WhatsApp vía Kapso API
 * Documentación oficial: https://docs.kapso.ai/docs/introduction
 *
 * Proxy Meta Cloud API v24.0:
 * Endpoint: https://api.kapso.ai/meta/whatsapp/v24.0/{phone_number_id}/messages
 * Header: X-API-Key: <KAPSO_API_KEY>
 */

export interface KapsoConfig {
  apiKey: string;
  phoneNumberId: string;
  defaultRecipient?: string;
}

export interface SendTextMessageParams {
  to: string;
  body: string;
  previewUrl?: boolean;
}

export interface SendDocumentMessageParams {
  to: string;
  documentUrl: string;
  filename: string;
  caption?: string;
}

export interface KapsoApiResponse {
  messaging_product?: string;
  contacts?: Array<{ input: string; wa_id: string }>;
  messages?: Array<{ id: string }>;
  error?: {
    message: string;
    type: string;
    code: number;
    fbtrace_id?: string;
  };
}

/**
 * Obtiene la configuración de Kapso desde variables de entorno o LocalStorage
 */
export function getKapsoConfig(): KapsoConfig {
  let apiKey = process.env.NEXT_PUBLIC_KAPSO_API_KEY || "";
  let phoneNumberId = process.env.NEXT_PUBLIC_KAPSO_PHONE_NUMBER_ID || "";
  let defaultRecipient = process.env.NEXT_PUBLIC_KAPSO_DEFAULT_PHONE || "";

  if (typeof window !== "undefined") {
    const localKey = localStorage.getItem("sentineliq_kapso_api_key");
    const localPhoneId = localStorage.getItem("sentineliq_kapso_phone_id");
    const localRecipient = localStorage.getItem("sentineliq_kapso_default_recipient");

    if (localKey) apiKey = localKey;
    if (localPhoneId) phoneNumberId = localPhoneId;
    if (localRecipient) defaultRecipient = localRecipient;
  }

  return { apiKey, phoneNumberId, defaultRecipient };
}

/**
 * Guarda la configuración de Kapso en LocalStorage para el estado activo
 */
export function saveKapsoConfig(cfg: KapsoConfig): void {
  if (typeof window === "undefined") return;
  if (cfg.apiKey) localStorage.setItem("sentineliq_kapso_api_key", cfg.apiKey);
  if (cfg.phoneNumberId) localStorage.setItem("sentineliq_kapso_phone_id", cfg.phoneNumberId);
  if (cfg.defaultRecipient) localStorage.setItem("sentineliq_kapso_default_recipient", cfg.defaultRecipient);
}

/**
 * Limpia y normaliza el número de teléfono (E.164, sin +, sin espacios ni guiones)
 * Ejemplo: "+52 1 477 123 4567" -> "5214771234567" o "524771234567"
 */
export function normalizePhoneNumber(phone: string): string {
  let cleaned = (phone || "").replace(/[^0-9]/g, "");
  // Si tiene 10 dígitos (número estándar mexicano), anteponer 52
  if (cleaned.length === 10) {
    cleaned = `52${cleaned}`;
  }
  return cleaned;
}

/**
 * Envía un mensaje de texto por WhatsApp a través de Kapso
 */
export async function sendKapsoTextMessage(
  params: SendTextMessageParams,
  configOverride?: Partial<KapsoConfig>
): Promise<{ success: boolean; data?: KapsoApiResponse; error?: string }> {
  const cfg = { ...getKapsoConfig(), ...configOverride };

  if (!cfg.apiKey) {
    return { success: false, error: "API Key de Kapso no configurada." };
  }
  if (!cfg.phoneNumberId) {
    return { success: false, error: "Phone Number ID de Kapso no configurado." };
  }

  const normalizedTo = normalizePhoneNumber(params.to || cfg.defaultRecipient || "");
  if (!normalizedTo) {
    return { success: false, error: "Número de teléfono destino no válido." };
  }

  const endpoint = `https://api.kapso.ai/meta/whatsapp/v24.0/${cfg.phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalizedTo,
    type: "text",
    text: {
      preview_url: params.previewUrl ?? false,
      body: params.body,
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": cfg.apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data: KapsoApiResponse = await res.json();

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || `Error HTTP ${res.status}: ${res.statusText}`,
        data,
      };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Error de conexión con la API de Kapso.",
    };
  }
}

/**
 * Envía un documento (ej. Briefing Ejecutivo en PDF) a través de Kapso
 */
export async function sendKapsoDocumentMessage(
  params: SendDocumentMessageParams,
  configOverride?: Partial<KapsoConfig>
): Promise<{ success: boolean; data?: KapsoApiResponse; error?: string }> {
  const cfg = { ...getKapsoConfig(), ...configOverride };

  if (!cfg.apiKey || !cfg.phoneNumberId) {
    return { success: false, error: "Credenciales de Kapso no configuradas." };
  }

  const normalizedTo = normalizePhoneNumber(params.to || cfg.defaultRecipient || "");
  if (!normalizedTo) {
    return { success: false, error: "Número de teléfono destino no válido." };
  }

  const endpoint = `https://api.kapso.ai/meta/whatsapp/v24.0/${cfg.phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalizedTo,
    type: "document",
    document: {
      link: params.documentUrl,
      filename: params.filename,
      caption: params.caption || undefined,
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": cfg.apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data: KapsoApiResponse = await res.json();

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || `Error HTTP ${res.status}: ${res.statusText}`,
        data,
      };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Error de conexión al enviar documento por Kapso.",
    };
  }
}

/**
 * Verifica la conectividad con Kapso enviando un mensaje de prueba
 */
export async function testKapsoConnection(
  apiKey: string,
  phoneNumberId: string,
  testPhone: string
): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !phoneNumberId) {
    return { success: false, message: "Debe ingresar API Key y Phone Number ID." };
  }

  const normalizedTo = normalizePhoneNumber(testPhone);
  if (!normalizedTo) {
    return { success: false, message: "Debe ingresar un número de WhatsApp de prueba válido." };
  }

  const result = await sendKapsoTextMessage(
    {
      to: normalizedTo,
      body: "🛡️ *SentinelIQ Sovereign Intelligence*\n\nConexión exitosa con la API de WhatsApp de Kapso. El canal de alertas ejecutivas está operativo.",
    },
    { apiKey, phoneNumberId }
  );

  if (result.success) {
    return {
      success: true,
      message: `Mensaje de prueba entregado exitosamente a +${normalizedTo}. Message ID: ${result.data?.messages?.[0]?.id || "OK"}`,
    };
  } else {
    return {
      success: false,
      message: `Error al probar Kapso: ${result.error}`,
    };
  }
}
