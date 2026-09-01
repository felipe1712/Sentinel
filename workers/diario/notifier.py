"""
Envía resúmenes ejecutivos vía correo electrónico (SMTP) y Telegram (Bot API).
"""
import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx

logger = logging.getLogger("diario.notifier")

RUST_API = os.getenv('RUST_API_URL', 'http://sentineliq-rust-api:8080')
if RUST_API.endswith('/'):
    RUST_API = RUST_API[:-1]

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASS = os.getenv('SMTP_PASS')
SMTP_FROM = os.getenv('SMTP_FROM', 'diario@sentineliq.com.mx')

def check_and_notify(state_id: str, fecha: str):
    """
    Verifica si los 4 documentos están listos y envía notificaciones.
    """
    headers = {'Authorization': f'Bearer {os.getenv("SERVICE_TOKEN", "sentineliq_internal_service_token_2026")}'}
    try:
        with httpx.Client() as client:
            resp = client.get(
                f"{RUST_API}/diario/status/{state_id}/{fecha}",
                headers=headers,
                timeout=10.0
            )
            if resp.status_code == 200:
                status = resp.json()
                if status.get('all_ready'):
                    send_daily_digest(state_id, fecha, headers)
    except Exception as e:
        logger.error(f"Error verificando status para notificación diaria: {e}")

def send_daily_digest(state_id: str, fecha: str, headers: dict):
    """Envía el digest diario consolidado a todos en la lista de distribución"""
    try:
        with httpx.Client() as client:
            # Obtener lista de distribución del estado
            resp_lista = client.get(
                f"{RUST_API}/diario/lista-distribucion/{state_id}",
                headers=headers,
                timeout=10.0
            )
            lista = resp_lista.json() if resp_lista.status_code == 200 else []

            # Obtener resúmenes del día
            resp_res = client.get(
                f"{RUST_API}/diario/resumenes/{state_id}/{fecha}",
                headers=headers,
                timeout=10.0
            )
            resumenes = resp_res.json() if resp_res.status_code == 200 else []

        if not resumenes:
            logger.info(f"No hay resúmenes listos para enviar en la fecha {fecha}")
            return

        for destinatario in lista:
            if not destinatario.get('activo', True):
                continue

            if destinatario.get('recibe_email') and destinatario.get('email'):
                send_email_digest(destinatario, resumenes, fecha, state_id, headers)

            if destinatario.get('recibe_telegram') and destinatario.get('telegram_chat_id'):
                send_telegram_digest(destinatario, resumenes, fecha, state_id, headers)

    except Exception as e:
        logger.error(f"Error enviando digest diario: {e}", exc_info=True)

def format_telegram_message(resumenes: list, fecha: str) -> str:
    """Formatea el mensaje para Telegram (máx 4096 chars)"""
    msg = f"📰 *DIARIO SENTINELIQ — {fecha}*\n\n"

    doc_emojis = {
        'primeras_planas_nacional': '🇲🇽 *Primeras Planas Nacionales*',
        'primeras_planas_estatal':  '🏛 *Primeras Planas Guanajuato*',
        'sintesis_estatal':         '📋 *Síntesis Estatal*',
        'columnas_politicas':       '✍️ *Columnas Políticas*',
    }

    for r in resumenes:
        label = doc_emojis.get(r.get('document_type'), '📄 *Documento*')
        msg += f"{label}\n"
        msg += f"{r.get('mini_resumen', '')}\n\n"

    msg += "🔗 Ver análisis completo en https://gto.sentineliq.com.mx/diario"
    return msg[:4096]

def send_telegram_digest(destinatario: dict, resumenes: list, fecha: str, state_id: str, headers: dict):
    """Envía digest vía Bot API de Telegram"""
    chat_id = destinatario.get('telegram_chat_id')
    if not TELEGRAM_BOT_TOKEN or not chat_id:
        logger.warning(f"Telegram Bot Token o Chat ID no configurado para {destinatario.get('nombre')}")
        return

    text = format_telegram_message(resumenes, fecha)
    status = 'enviado'
    err_msg = None

    try:
        resp = httpx.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            json={'chat_id': chat_id, 'text': text, 'parse_mode': 'Markdown'},
            timeout=10.0
        )
        if resp.status_code != 200:
            status = 'error'
            err_msg = resp.text
    except Exception as e:
        status = 'error'
        err_msg = str(e)

    # Registrar en tabla diario_envios
    record_envio(state_id, fecha, 'telegram', chat_id, destinatario.get('nombre'), status, err_msg, headers)

def send_email_digest(destinatario: dict, resumenes: list, fecha: str, state_id: str, headers: dict):
    """Envía digest vía SMTP como HTML"""
    email_to = destinatario.get('email')
    if not SMTP_HOST or not email_to:
        logger.warning(f"SMTP Host o Email no configurado para {destinatario.get('nombre')}")
        return

    html = build_email_html(resumenes, fecha)
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f"📰 Diario Ejecutivo SentinelIQ — {fecha}"
    msg['From'] = SMTP_FROM
    msg['To'] = email_to
    msg.attach(MIMEText(html, 'html', 'utf-8'))

    status = 'enviado'
    err_msg = None

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            if SMTP_USER and SMTP_PASS:
                server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
    except Exception as e:
        status = 'error'
        err_msg = str(e)
        logger.error(f"Error enviando email a {email_to}: {e}")

    # Registrar en tabla diario_envios
    record_envio(state_id, fecha, 'email', email_to, destinatario.get('nombre'), status, err_msg, headers)

def record_envio(state_id: str, fecha: str, tipo: str, destinatario: str, nombre: str, status: str, err: str | None, headers: dict):
    try:
        with httpx.Client() as client:
            client.post(
                f"{RUST_API}/diario/envios",
                json={
                    'state_id': state_id,
                    'fecha': fecha,
                    'tipo': tipo,
                    'destinatario': destinatario,
                    'nombre_destino': nombre,
                    'status': status,
                    'error_message': err
                },
                headers=headers,
                timeout=5.0
            )
    except Exception as e:
        logger.error(f"Error registrando envío en BD: {e}")

def build_email_html(resumenes: list, fecha: str) -> str:
    """Genera HTML del email ejecutivo — limpio, compatible con clientes de correo gobierno"""
    rows = ""
    doc_names = {
        'primeras_planas_nacional': '🇲🇽 Primeras Planas Nacionales',
        'primeras_planas_estatal':  '🏛 Primeras Planas Guanajuato',
        'sintesis_estatal':         '📋 Síntesis Estatal Oficial',
        'columnas_politicas':       '✍️ Columnas Políticas de Guanajuato',
    }

    for r in resumenes:
        name = doc_names.get(r.get('document_type'), 'Documento de Prensa')
        puntos = ''.join(
            f"<li style='margin: 4px 0;'>{p}</li>"
            for p in r.get('puntos_clave', [])
        )
        rows += f"""
        <tr>
          <td colspan="2" style="background:#1e293b; color:#ffffff; padding:12px 16px; font-size:14px; font-weight:bold;">
            {name}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:14px 16px; font-size:13px; color:#1e293b; line-height:1.6; background:#ffffff;">
            {r.get('resumen_ejecutivo', '')}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:0 16px 14px; font-size:12px; background:#f8fafc;">
            <strong style="color:#475569; display:block; margin-bottom:6px;">PUNTOS CLAVE:</strong>
            <ul style="margin:0; padding-left:20px; color:#334155;">{puntos}</ul>
          </td>
        </tr>
        """

    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background:#f1f5f9; margin:0; padding:24px;">
<table width="620" style="background:#ffffff; border-radius:8px; overflow:hidden; margin:0 auto; border:1px solid #cbd5e1;" cellpadding="0" cellspacing="0">
  <tr>
    <td colspan="2" style="background:#1d4ed8; color:#ffffff; padding:18px 22px;">
      <div style="font-size:18px; font-weight:bold;">📰 Diario Ejecutivo SentinelIQ</div>
      <div style="font-size:13px; opacity:0.9; margin-top:2px;">{fecha} — Monitoreo Matutino de Prensa · Guanajuato</div>
    </td>
  </tr>
  {rows}
  <tr>
    <td colspan="2" style="padding:14px 20px; font-size:11px; color:#64748b; border-top:1px solid #e2e8f0; text-align:center; background:#ffffff;">
      Generado automáticamente por SentinelIQ · <a href="https://gto.sentineliq.com.mx/diario" style="color:#1d4ed8; text-decoration:none; font-weight:bold;">gto.sentineliq.com.mx/diario</a>
    </td>
  </tr>
</table>
</body></html>"""
