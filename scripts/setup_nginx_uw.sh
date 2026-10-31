#!/bin/bash
# ==============================================================================
# Tarea 13 — Script de Configuración Nginx + Certbot SSL para UrbanWatch
# Dominio: uw.sentineliq.com.mx (y alias cdmx.urbanwatch.mx)
# Frontend Vite/React: 127.0.0.1:3100
# Backend Rust Axum API: 127.0.0.1:8100
# ==============================================================================
set -e

DOMAIN="uw.sentineliq.com.mx"
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"

echo "🌐 Configurando Nginx Reverse Proxy para ${DOMAIN}..."

cat > "${NGINX_CONF}" <<EOF
server {
    listen 80;
    server_name uw.sentineliq.com.mx cdmx.urbanwatch.mx;

    client_max_body_size 50M;

    # API Backend en Rust (Axum :8100)
    location /api/ {
        proxy_pass http://127.0.0.1:8100/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 180s;
    }

    # Frontend Vite + React 18 (Plantilla Trezo :3101)
    location / {
        proxy_pass http://127.0.0.1:3101;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf "${NGINX_CONF}" "/etc/nginx/sites-enabled/${DOMAIN}"
nginx -t && systemctl reload nginx

if command -v certbot >/dev/null 2>&1; then
    echo "🔒 Emitiendo certificado SSL con Certbot para ${DOMAIN}..."
    certbot --nginx -d uw.sentineliq.com.mx --non-interactive --agree-tos -m admin@sentineliq.com.mx --redirect || true
fi

echo "✅ Nginx configurado para https://${DOMAIN}"
