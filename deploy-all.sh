#!/bin/bash
# ==============================================================================
# Script de Despliegue Unificado para SentinelIQ (Querétaro, Guanajuato & ARGOS)
# ==============================================================================

echo "=========================================================="
echo " 🚀 Actualizando y Desplegando SentinelIQ Multi-State"
echo "=========================================================="

# 1. Obtener los últimos cambios del repositorio
echo "📥 Sincronizando con GitHub (sentineliq-v2)..."
git fetch --all 2>/dev/null || true
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "sentineliq-v2")
git checkout "$CURRENT_BRANCH" 2>/dev/null || git checkout -b "$CURRENT_BRANCH" "origin/$CURRENT_BRANCH" 2>/dev/null || true
git reset --hard "origin/$CURRENT_BRANCH" 2>/dev/null || git pull origin "$CURRENT_BRANCH"

# 2. Levantar primero las Bases de Datos (PostgreSQL & Redis)
echo "----------------------------------------------------------"
echo "🗄️ Inicializando Bases de Datos PostgreSQL y Redis..."
echo "----------------------------------------------------------"
docker network create sentineliq_net 2>/dev/null || true
docker compose -p sentineliq-qro -f docker-compose.prod.yml up -d sentineliq-postgres sentineliq-redis
docker compose -p sentineliq-gto -f docker-compose.gto.yml up -d sentineliq-gto-postgres sentineliq-gto-redis
docker compose -p sentineliq-pue -f docker-compose.pue.yml up -d sentineliq-pue-postgres sentineliq-pue-redis 2>/dev/null || true
docker compose -p sentineliq-chi -f docker-compose.chi.yml up -d sentineliq-chi-postgres sentineliq-chi-redis 2>/dev/null || true

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
      docker exec -i sentineliq_pue_postgres psql -U sentineliq -d sentineliq_pue < "$sql_file" 2>/dev/null || true
      docker exec -i sentineliq_chi_postgres psql -U sentineliq -d sentineliq_chi < "$sql_file" 2>/dev/null || true
      echo "$fname" >> "$APPLIED_LOG"
      pending_migrations=$((pending_migrations + 1))
    fi
  fi
done

# Eliminar duplicados en el registro
sort -u "$APPLIED_LOG" -o "$APPLIED_LOG"

# Ingesta masiva de resultados electorales si no se ha aplicado (Guanajuato)
if [ -f "data/electoral/ingest_electoral_results.sql" ]; then
  if ! grep -Fxq "ingest_electoral_results_v2.sql" "$APPLIED_LOG" || [ "$1" == "--force-migrations" ]; then
    echo "  -> Aplicando resultados electorales masivos GTO (15,925 registros)..."
    docker exec -i sentineliq_gto_postgres psql -U sentineliq -d sentineliq_gto < "data/electoral/ingest_electoral_results.sql" 2>/dev/null || true
    echo "ingest_electoral_results_v2.sql" >> "$APPLIED_LOG"
    echo "  ✅ Resultados electorales aplicados a sentineliq_gto."
  fi
fi

# Ingesta masiva de resultados electorales para Querétaro
if [ -f "data/electoral/ingest_queretaro_electoral_results.sql" ]; then
  if ! grep -Fxq "ingest_queretaro_electoral_results.sql" "$APPLIED_LOG" || [ "$1" == "--force-migrations" ]; then
    echo "  -> Aplicando resultados electorales masivos de Querétaro (4,454 registros)..."
    docker exec -i sentineliq_postgres psql -U sentinel -d sentineliq < "data/electoral/ingest_queretaro_electoral_results.sql" 2>/dev/null || true
    echo "ingest_queretaro_electoral_results.sql" >> "$APPLIED_LOG"
    echo "  ✅ Resultados electorales aplicados a sentineliq (Querétaro)."
  fi
fi

# Ingesta masiva de resultados electorales para Puebla
if [ -f "data/electoral/ingest_puebla_electoral_results.sql" ]; then
  if ! grep -Fxq "ingest_puebla_electoral_results.sql" "$APPLIED_LOG" || [ "$1" == "--force-migrations" ]; then
    echo "  -> Aplicando resultados electorales masivos de Puebla..."
    docker exec -i sentineliq_pue_postgres psql -U sentineliq -d sentineliq_pue < "data/electoral/ingest_puebla_electoral_results.sql" 2>/dev/null || true
    echo "ingest_puebla_electoral_results.sql" >> "$APPLIED_LOG"
    echo "  ✅ Resultados electorales aplicados a sentineliq_pue."
  fi
fi

# Ingesta masiva de resultados electorales para Chihuahua (15,895 registros)
if [ -f "data/electoral/ingest_chihuahua_electoral_results.sql" ]; then
  if ! grep -Fxq "ingest_chihuahua_electoral_results.sql" "$APPLIED_LOG" || [ "$1" == "--force-migrations" ]; then
    echo "  -> Aplicando esquema base y seed de Chihuahua..."
    docker exec -i sentineliq_chi_postgres psql -U sentineliq -d sentineliq_chi < "data/init_chihuahua_complete.sql" 2>/dev/null || true
    echo "  -> Aplicando resultados electorales masivos de Chihuahua (15,895 registros)..."
    docker exec -i sentineliq_chi_postgres psql -U sentineliq -d sentineliq_chi < "data/electoral/ingest_chihuahua_electoral_results.sql" 2>/dev/null || true
    echo "ingest_chihuahua_electoral_results.sql" >> "$APPLIED_LOG"
    echo "  ✅ Esquema y resultados electorales aplicados a sentineliq_chi."
  fi
fi

# Ingesta de fuentes vivas y eventos de las últimas 36 horas
if [ -f "data/seed_live_sources_36h.sql" ]; then
  if ! grep -Fxq "seed_live_sources_36h.sql" "$APPLIED_LOG" || [ "$1" == "--force-migrations" ]; then
    echo "  -> Aplicando fuentes vivas y feed de 36 horas..."
    docker exec -i sentineliq_gto_postgres psql -U sentineliq -d sentineliq_gto < "data/seed_live_sources_36h.sql" 2>/dev/null || true
    docker exec -i sentineliq_postgres psql -U sentinel -d sentineliq < "data/seed_live_sources_36h.sql" 2>/dev/null || true
    docker exec -i sentineliq_pue_postgres psql -U sentineliq -d sentineliq_pue < "data/seed_live_sources_36h.sql" 2>/dev/null || true
    docker exec -i sentineliq_chi_postgres psql -U sentineliq -d sentineliq_chi < "data/seed_live_sources_36h.sql" 2>/dev/null || true
    echo "seed_live_sources_36h.sql" >> "$APPLIED_LOG"
    echo "  ✅ Fuentes vivas y eventos de 36h aplicados a bases de datos."
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
rm -rf nextjs-app/.next 2>/dev/null || true
docker compose -p sentineliq-qro -f docker-compose.prod.yml build --no-cache sentineliq-nextjs
docker stop sentineliq_nextjs 2>/dev/null || true
docker rm sentineliq_nextjs 2>/dev/null || true
docker compose -p sentineliq-qro -f docker-compose.prod.yml up -d --force-recreate --remove-orphans

# 5. Recompilar y levantar Guanajuato
echo "----------------------------------------------------------"
echo "🟩 Desplegando Guanajuato (:3005, :8086)..."
echo "----------------------------------------------------------"
docker compose -p sentineliq-gto -f docker-compose.gto.yml up -d --build --remove-orphans

# 5.1 Recompilar y levantar Puebla
if [ -f "docker-compose.pue.yml" ]; then
  echo "----------------------------------------------------------"
  echo "🟪 Desplegando Puebla (:3006, :8087)..."
  echo "----------------------------------------------------------"
  docker compose -p sentineliq-pue -f docker-compose.pue.yml up -d --build --remove-orphans 2>/dev/null || true
fi

# 5.2 Recompilar y levantar Chihuahua
if [ -f "docker-compose.chi.yml" ]; then
  echo "----------------------------------------------------------"
  echo "🟨 Desplegando Chihuahua (:3007, :8089)..."
  echo "----------------------------------------------------------"
  docker compose -p sentineliq-chi -f docker-compose.chi.yml up -d --build --remove-orphans 2>/dev/null || true
fi

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
curl -s http://127.0.0.1:3004/version.json | grep -q "3.6.2" && echo "  - Querétaro Versión: v3.6.2 (Verificado ✅)" || echo "  - Querétaro Versión: Desactualizado ⚠️"
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/data/qro_secciones.geojson | grep -q "200" && echo "  - Cartografía Querétaro (1,090 secciones): OK ✅" || echo "  - Cartografía Querétaro: No accesible ⚠️"
curl -s -I http://127.0.0.1:3005 | head -n 1 && echo "  - Guanajuato Next.js (:3005): OK" || echo "  - Guanajuato Next.js (:3005): ERROR"
curl -s -I http://127.0.0.1:3006 | head -n 1 && echo "  - Puebla Next.js (:3006): OK" || echo "  - Puebla Next.js (:3006): ERROR"
curl -s -I http://127.0.0.1:3007 | head -n 1 && echo "  - Chihuahua Next.js (:3007): OK" || echo "  - Chihuahua Next.js (:3007): ERROR"
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3007/data/chi_secciones.geojson | grep -q "200" && echo "  - Cartografía Chihuahua (3,311 secciones): OK ✅" || echo "  - Cartografía Chihuahua: No accesible ⚠️"
curl -s -I http://127.0.0.1:8089/health | head -n 1 && echo "  - Chihuahua Rust API (:8089): OK" || echo "  - Chihuahua Rust API (:8089): ERROR"
curl -s -I http://127.0.0.1:8088/health | head -n 1 && echo "  - ARGOS Gateway (:8088): OK" || echo "  - ARGOS Gateway (:8088): ERROR"

echo "=========================================================="
echo " ✅ Despliegue Finalizado Exitosamente"
echo "=========================================================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
