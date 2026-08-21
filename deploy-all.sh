#!/bin/bash
# ==============================================================================
# Script de Despliegue Unificado para SentinelIQ (Querétaro & Guanajuato)
# ==============================================================================

echo "=========================================================="
echo " 🚀 Actualizando y Recompilando SentinelIQ Multi-State"
echo "=========================================================="

# 1. Obtener los últimos cambios del repositorio
echo "📥 Descargando cambios desde GitHub (main)..."
git pull origin main

# 2. Limpieza de contenedores de Guanajuato previos si existen conflictos
echo "🧹 Limpiando nombres de contenedores previos de Guanajuato..."
docker rm -f sentineliq_gto_postgres sentineliq_gto_redis sentineliq_gto_rust_api sentineliq_gto_nextjs 2>/dev/null || true

# 3. Recompilar y levantar Querétaro (qro.sentineliq.com.mx)
echo "----------------------------------------------------------"
echo "🟦 Actualizando Instancia Querétaro (qro.sentineliq.com.mx)..."
echo "----------------------------------------------------------"
docker compose -p sentineliq-qro -f docker-compose.prod.yml up -d --build

# 4. Recompilar y levantar Guanajuato (gto.sentineliq.com.mx)
echo "----------------------------------------------------------"
echo "🟩 Actualizando Instancia Guanajuato (gto.sentineliq.com.mx)..."
echo "----------------------------------------------------------"
docker compose -p sentineliq-gto -f docker-compose.gto.yml up -d --build

# 5. Estado Final de los Contenedores
echo "=========================================================="
echo " ✅ Despliegue Completo Exitoso para Ambos Estados"
echo "=========================================================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
