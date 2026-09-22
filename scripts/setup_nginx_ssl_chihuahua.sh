#!/bin/bash
# ==============================================================================
# SentinelIQ: Configuración Nginx Reverse Proxy + SSL Certbot para Chihuahua
# Dominio: chi.sentineliq.com.mx
# Puerto Web: 3007 | Puerto API: 8089
# ==============================================================================

set -e

echo "=========================================================="
echo " 🌐 Configurando Nginx Reverse Proxy para Chihuahua"
echo " Dominio: chi.sentineliq.com.mx"
echo "=========================================================="

# 1. Crear configuración de Nginx en sites-available
cat << 'EOF' > /etc/nginx/sites-available/chi.sentineliq.com.mx
server {
    listen 80;
    server_name chi.sentineliq.com.mx;

    client_max_body_size 100M;

    # Frontend Next.js (Puerto 3007)
    location / {
        proxy_pass http://127.0.0.1:3007;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Backend Rust (Puerto 8089)
    location /api/ {
        proxy_pass http://127.0.0.1:8089/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
EOF

# 2. Habilitar el sitio en sites-enabled
ln -sf /etc/nginx/sites-available/chi.sentineliq.com.mx /etc/nginx/sites-enabled/

# 3. Validar sintaxis y recargar Nginx
echo "🔍 Validando configuración de Nginx..."
nginx -t
systemctl reload nginx
echo "✅ Nginx recargado con el sitio chi.sentineliq.com.mx activo en HTTP."

# 4. Obtener e instalar certificado SSL con Certbot
echo "🔒 Generando certificado SSL gratuito con Let's Encrypt / Certbot..."
certbot --nginx -d chi.sentineliq.com.mx --non-interactive --agree-tos -m admin@sentineliq.com.mx --redirect || {
    echo "⚠️ Certbot con --redirect falló o ya existe; reintentando sin forzar redirect..."
    certbot --nginx -d chi.sentineliq.com.mx --non-interactive --agree-tos -m admin@sentineliq.com.mx
}

# 5. Recarga final de Nginx
systemctl reload nginx

echo "=========================================================="
echo " 🎉 ¡Certificado SSL y Nginx configurados exitosamente!"
echo " URL: https://chi.sentineliq.com.mx"
echo "=========================================================="
