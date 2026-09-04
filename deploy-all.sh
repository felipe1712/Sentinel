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

echo "⏳ Verificando disponibilidad de bases de datos..."
sleep 3

# 3. Aplicar Migraciones SQL SOLO SI HAY ARCHIVOS NUEVOS O NO APLICADOS
echo "----------------------------------------------------------"
echo "🗄️ Verificando esquemas de Base de Datos PostgreSQL..."
echo "----------------------------------------------------------"
APPLIED_LOG=".applied_migrations"
touch "$APPLIED_LOG"

pending_migrations=0
for sql_file in rust-api/migrations/*.sql; do
  if [ -f "$sql_file" ]; then
    fname=$(basename "$sql_file")
    if ! grep -Fxq "$fname" "$APPLIED_LOG" || [ "$1" == "--force-migrations" ]; then
      echo "  -> Aplicando nueva migración: $fname"
      docker exec -i sentineliq_postgres psql -U sentinel -d sentineliq < "$sql_file" 2>/dev/null || true
      docker exec -i sentineliq_gto_postgres psql -U sentineliq -d sentineliq_gto < "$sql_file" 2>/dev/null || true
      echo "$fname" >> "$APPLIED_LOG"
      pending_migrations=$((pending_migrations + 1))
    fi
  fi
done

# Eliminar duplicados en el registro
sort -u "$APPLIED_LOG" -o "$APPLIED_LOG"

# Ingesta masiva de resultados electorales si no se ha aplicado
if [ -f "data/electoral/ingest_electoral_results.sql" ]; then
  if ! grep -Fxq "ingest_electoral_results.sql" "$APPLIED_LOG" || [ "$1" == "--force-migrations" ]; then
    echo "  -> Aplicando resultados electorales masivos (12,766 registros)..."
    docker exec -i sentineliq_gto_postgres psql -U sentineliq -d sentineliq_gto < "data/electoral/ingest_electoral_results.sql" 2>/dev/null || true
    echo "ingest_electoral_results.sql" >> "$APPLIED_LOG"
    echo "  ✅ Resultados electorales aplicados a sentineliq_gto."
  fi
fi

if [ $pending_migrations -eq 0 ]; then
  echo "  ✅ Esquemas de Base de Datos al día (sin migraciones pendientes)."
else
  echo "  ✅ $pending_migrations nueva(s) migración(es) aplicada(s) exitosamente."
fi

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

# 6. Configurar Nginx para permitir subida de archivos grandes (PDFs de 16MB a 100MB)
echo "📁 Verificando configuración de subida (client_max_body_size 100M) en Nginx..."
if [ -d /etc/nginx/conf.d ]; then
  echo "client_max_body_size 100M;" > /etc/nginx/conf.d/upload_limits.conf 2>/dev/null || true
fi
if [ -f /etc/nginx/nginx.conf ]; then
  sed -i 's/client_max_body_size [0-9]*[a-zA-Z]*;/client_max_body_size 100M;/g' /etc/nginx/nginx.conf 2>/dev/null || true
fi
systemctl reload nginx 2>/dev/null || true

# 7. Diagnóstico de Salud de los Servicios
echo "=========================================================="
echo " 🩺 Verificando Estado de Puertos Internos..."
echo "=========================================================="
sleep 2
curl -s -I http://127.0.0.1:3004 | head -n 1 && echo "  - Querétaro Next.js (:3004): OK" || echo "  - Querétaro Next.js (:3004): ERROR"
curl -s -I http://127.0.0.1:3005 | head -n 1 && echo "  - Guanajuato Next.js (:3005): OK" || echo "  - Guanajuato Next.js (:3005): ERROR"
curl -s -I http://127.0.0.1:8088/health | head -n 1 && echo "  - ARGOS Gateway (:8088): OK" || echo "  - ARGOS Gateway (:8088): ERROR"

echo "=========================================================="
echo " ✅ Despliegue Finalizado Exitosamente"
echo "=========================================================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
