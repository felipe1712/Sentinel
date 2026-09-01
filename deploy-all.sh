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

# 2. Levantar primero las Bases de Datos (PostgreSQL & Redis)
echo "----------------------------------------------------------"
echo "🗄️ Inicializando Bases de Datos PostgreSQL y Redis..."
echo "----------------------------------------------------------"
docker compose -p sentineliq-qro -f docker-compose.prod.yml up -d sentineliq-postgres sentineliq-redis
docker compose -p sentineliq-gto -f docker-compose.gto.yml up -d sentineliq-gto-postgres sentineliq-gto-redis

echo "⏳ Esperando 5 segundos a que PostgreSQL acepte conexiones..."
sleep 5

# 3. Aplicar Migraciones SQL en PostgreSQL automáticamente
echo "----------------------------------------------------------"
echo "🗄️ Actualizando esquemas de Base de Datos PostgreSQL..."
echo "----------------------------------------------------------"
for sql_file in rust-api/migrations/*.sql; do
  if [ -f "$sql_file" ]; then
    echo "  -> Aplicando migración: $(basename "$sql_file")"
    docker exec -i sentineliq_postgres psql -U sentinel -d sentineliq < "$sql_file" 2>/dev/null || true
    docker exec -i sentineliq_gto_postgres psql -U sentineliq -d sentineliq_gto < "$sql_file" 2>/dev/null || true
  fi
done

# 4. Recompilar y levantar Querétaro + ARGOS Gateway
echo "----------------------------------------------------------"
echo "🟦 Desplegando Querétaro & ARGOS Gateway (:3004, :8085, :8088)..."
echo "----------------------------------------------------------"
docker compose -p sentineliq-qro -f docker-compose.prod.yml up -d --build --remove-orphans

# 5. Recompilar y levantar Guanajuato
echo "----------------------------------------------------------"
echo "🟩 Desplegando Guanajuato (:3005, :8086)..."
echo "----------------------------------------------------------"
docker compose -p sentineliq-gto -f docker-compose.gto.yml up -d --build --remove-orphans

# 6. Reiniciar Nginx para refrescar proxies
echo "🔄 Recargando Nginx en servidor..."
systemctl reload nginx 2>/dev/null || true

# 7. Diagnóstico de Salud de los Servicios
echo "=========================================================="
echo " 🩺 Verificando Estado de Puertos Internos..."
echo "=========================================================="
sleep 3
curl -s -I http://127.0.0.1:3004 | head -n 1 && echo "  - Querétaro Next.js (:3004): OK" || echo "  - Querétaro Next.js (:3004): ERROR"
curl -s -I http://127.0.0.1:3005 | head -n 1 && echo "  - Guanajuato Next.js (:3005): OK" || echo "  - Guanajuato Next.js (:3005): ERROR"
curl -s -I http://127.0.0.1:8088/health | head -n 1 && echo "  - ARGOS Gateway (:8088): OK" || echo "  - ARGOS Gateway (:8088): ERROR"

echo "=========================================================="
echo " ✅ Despliegue y Migraciones Finalizadas Exitosamente"
echo "=========================================================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
