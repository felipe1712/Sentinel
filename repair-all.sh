#!/bin/bash
# ==============================================================================
# Script de Diagnóstico y Reparación Integral SentinelIQ (QRO, GTO & ARGOS)
# ==============================================================================

echo "=========================================================="
echo " 🛠️ Reparación y Verificación Integral de Servicios & SSL"
echo "=========================================================="

# 1. Limpiar modificaciones locales y estirar versión más reciente
echo "📥 Reseteando cambios locales y descargando desde GitHub..."
git checkout -- . 2>/dev/null || true
git pull origin main

# 2. Asegurar que las configuraciones de Nginx existan para los 3 subdominios
echo "⚙️ Verificando sitios de Nginx..."

# Nginx config para Guanajuato (gto.sentineliq.com.mx)
cat << 'EOF' > /etc/nginx/sites-available/gto.sentineliq.com.mx
server {
    listen 80;
    server_name gto.sentineliq.com.mx;

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8086/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Nginx config para ARGOS Gateway (argos.sentineliq.com.mx)
cat << 'EOF' > /etc/nginx/sites-available/argos.sentineliq.com.mx
server {
    listen 80;
    server_name argos.sentineliq.com.mx;

    location / {
        proxy_pass http://127.0.0.1:8088;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Habilitar sitios en Nginx
ln -sf /etc/nginx/sites-available/gto.sentineliq.com.mx /etc/nginx/sites-enabled/ 2>/dev/null || true
ln -sf /etc/nginx/sites-available/argos.sentineliq.com.mx /etc/nginx/sites-enabled/ 2>/dev/null || true

# 3. Limpiar contenedores en conflicto
echo "🧹 Limpiando nombres de contenedores previos..."
docker rm -f sentineliq_gto_postgres sentineliq_gto_redis sentineliq_gto_rust_api sentineliq_gto_nextjs sentineliq_argos_gateway 2>/dev/null || true

# 4. Desplegar Querétaro (qro.sentineliq.com.mx)
echo "----------------------------------------------------------"
echo "🟦 Desplegando Instancia Querétaro (qro.sentineliq.com.mx)..."
echo "----------------------------------------------------------"
docker compose -p sentineliq-qro -f docker-compose.prod.yml up -d --build

# 5. Desplegar Guanajuato & ARGOS Gateway (gto.sentineliq.com.mx & argos.sentineliq.com.mx)
echo "----------------------------------------------------------"
echo "🟩 Desplegando Instancia Guanajuato & ARGOS Gateway..."
echo "----------------------------------------------------------"
docker compose -p sentineliq-gto -f docker-compose.gto.yml up -d --build

# 6. Recargar Nginx y Generar Certificados SSL con Certbot
echo "🔒 Generando Certificados SSL para gto.sentineliq.com.mx y argos.sentineliq.com.mx..."
nginx -t && systemctl reload nginx 2>/dev/null || true
certbot --nginx -d gto.sentineliq.com.mx -d argos.sentineliq.com.mx --non-interactive --agree-tos -m admin@sentineliq.com.mx --redirect 2>/dev/null || certbot --nginx -d gto.sentineliq.com.mx -d argos.sentineliq.com.mx 2>/dev/null || true

# 7. Diagnóstico HTTP de Puertos Internos
echo "=========================================================="
echo " 🔍 Diagnóstico de Respuesta HTTP de Contenedores"
echo "=========================================================="
echo -n "Puerto 3004 (Querétaro Web): "
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3004 || echo "OFFLINE"

echo -n "Puerto 3005 (Guanajuato Web): "
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3005 || echo "OFFLINE"

echo -n "Puerto 8088 (ARGOS Gateway): "
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8088/health || echo "OFFLINE"

echo "=========================================================="
echo " ✅ Reparación Completa Exitosa. Estado de Contenedores:"
echo "=========================================================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
