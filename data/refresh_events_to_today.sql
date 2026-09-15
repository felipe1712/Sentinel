-- ==============================================================================
-- SentinelIQ: Actualizar Eventos y Fuentes Vivas a la Fecha de Hoy (Últimas 24h)
-- ==============================================================================

-- 1. Actualizar eventos procesados distribuyéndolos en las últimas 20 horas de hoy
UPDATE events 
SET occurred_at = NOW() - (RANDOM() * INTERVAL '20 hours'),
    created_at = NOW() - (RANDOM() * INTERVAL '20 hours');

-- 2. Actualizar eventos crudos correspondientes
UPDATE raw_events 
SET ingested_at = NOW() - (RANDOM() * INTERVAL '20 hours');

-- 3. Marcar fuentes como activas y recién sincronizadas
UPDATE sources
SET last_checked = NOW(),
    active = true;

-- 4. Actualizar snapshots de gabinete
UPDATE cabinet_snapshots
SET created_at = NOW();

SELECT '✅ Eventos actualizados exitosamente a la fecha actual.' AS resultado;
