#!/bin/bash
# ==============================================================================
# Script de Despliegue Unificado para SentinelIQ (Querétaro, Guanajuato & ARGOS)
# ==============================================================================

echo "=========================================================="
echo " 🚀 Actualizando y Desplegando SentinelIQ Multi-State"
echo "=========================================================="

# 1. Obtener los últimos cambios del repositorio
echo "📥 Descargando cambios desde GitHub (main)..."
git checkout -- . 2>/dev/null || true
git pull origin main

# 2. Recompilar y levantar Querétaro + ARGOS Gateway (qro.sentineliq.com.mx & argos.sentineliq.com.mx)
echo "----------------------------------------------------------"
echo "🟦 Desplegando Querétaro & ARGOS Gateway (:3004, :8085, :8088)..."
echo "----------------------------------------------------------"
docker compose -p sentineliq-qro -f docker-compose.prod.yml up -d --build --remove-orphans

# 3. Recompilar y levantar Guanajuato (gto.sentineliq.com.mx)
echo "----------------------------------------------------------"
echo "🟩 Desplegando Guanajuato (:3005, :8086)..."
echo "----------------------------------------------------------"
docker compose -p sentineliq-gto -f docker-compose.gto.yml up -d --build --remove-orphans

# 4. Reiniciar Nginx para refrescar proxies
echo "🔄 Recargando Nginx en servidor..."
systemctl reload nginx 2>/dev/null || true

# 5. Diagnóstico de Salud de los Servicios
echo "=========================================================="
echo " 🩺 Verificando Estado de Puertos Internos..."
echo "=========================================================="
curl -s -I http://127.0.0.1:3004 | head -n 1 && echo "  - Querétaro Next.js (:3004): OK" || echo "  - Querétaro Next.js (:3004): ERROR"
curl -s -I http://127.0.0.1:3005 | head -n 1 && echo "  - Guanajuato Next.js (:3005): OK" || echo "  - Guanajuato Next.js (:3005): ERROR"
curl -s -I http://127.0.0.1:8088/health | head -n 1 && echo "  - ARGOS Gateway (:8088): OK" || echo "  - ARGOS Gateway (:8088): ERROR"

echo "=========================================================="
echo " ✅ Despliegue Finalizado"
echo "=========================================================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
