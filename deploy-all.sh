#!/bin/bash
# ==============================================================================
# Script de Despliegue Unificado — UrbanWatch (uw.sentineliq.com.mx)
# Rama: Uwatch
# ==============================================================================
set -e

echo "=========================================================="
echo " 🚀 Desplegando UrbanWatch CDMX (uw.sentineliq.com.mx)"
echo "=========================================================="

# 1. Sincronizar rama Uwatch
git fetch origin Uwatch 2>/dev/null || true
git checkout Uwatch 2>/dev/null || true
git pull origin Uwatch 2>/dev/null || true

# 2. Levantar PostgreSQL + PostGIS y Redis
echo "🗄️ Inicializando PostgreSQL 15 + PostGIS y Redis 7..."
docker compose up -d postgres redis
sleep 4

# 3. Aplicar migraciones y seed de colonias / histórico CDMX
echo "🗺️ Aplicando esquema uwi_* y seed de colonias CDMX (2016–2026)..."
docker exec -i uwi_postgres psql -U urbanwatch -d urbanwatch_db < migrations/001_urbanwatch_schema.sql
docker exec -i uwi_postgres psql -U urbanwatch -d urbanwatch_db < migrations/002_seed_cdmx_data.sql

# 4. Levantar todos los servicios (Rust API, Python Workers, Celery, Lightpanda, HeadlessX, Frontend Vite)
echo "⚙️ Construyendo y levantando servicios de UrbanWatch..."
docker compose up -d --build

echo "=========================================================="
echo " ✅ UrbanWatch desplegado exitosamente:"
echo "    Frontend (Vite + React 18 Trezo): http://127.0.0.1:3100"
echo "    API Backend (Rust Axum + PostGIS): http://127.0.0.1:8100/api/health"
echo "    Workers Python (OCR/Claude/Vigía): http://127.0.0.1:8001/health"
echo "=========================================================="
