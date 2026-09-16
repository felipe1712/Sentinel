-- ==============================================================================
-- Migración: Deduplicación y Limpieza de Eventos Repetidos en Base de Datos
-- ==============================================================================

-- 1. Eliminar eventos duplicados conservando únicamente el registro más reciente por título y estado
DELETE FROM events
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY state_id, title ORDER BY occurred_at DESC, id DESC) AS rnum
    FROM events
  ) t
  WHERE t.rnum > 1
);

-- 2. Limpieza de raw_events huérfanos que ya no estén vinculados a ningún evento
DELETE FROM raw_events
WHERE id NOT IN (
  SELECT raw_event_id FROM events WHERE raw_event_id IS NOT NULL
);
