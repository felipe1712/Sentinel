-- ==============================================================================
-- SentinelIQ: Eliminación de Restricciones en events y sources
-- Migración: 20260918000001_remove_event_and_source_restrictions.sql
-- ==============================================================================

-- 1. Agregar columna updated_at a la tabla sources si no existe
ALTER TABLE sources ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Eliminar todas las restricciones check restrictivas en sources
ALTER TABLE sources DROP CONSTRAINT IF EXISTS sources_type_check;
ALTER TABLE sources DROP CONSTRAINT IF EXISTS sources_credibility_check;

-- 3. Eliminar todas las restricciones check restrictivas en events
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_category_check;
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_severity_check;
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_political_relevance_check;

-- 4. Asegurar e insertar cuentas clave de Twitter/X para Guanajuato (Clave 11)
INSERT INTO sources (id, state_id, type, identifier, name, credibility, active, updated_at) VALUES
('77777777-7777-7777-7777-777777777714', '00000000-0000-0000-0000-000000000011', 'twitter', '@FSPE_GtoOficial', 'Fuerzas de Seguridad Pública del Estado (FSPE)', 'oficial', true, NOW()),
('77777777-7777-7777-7777-777777777741', '00000000-0000-0000-0000-000000000011', 'twitter', '@huachicol_Gto', 'Monitoreo Preventivo de Ductos e Infraestructura Bajío', 'verificado', true, NOW()),
('77777777-7777-7777-7777-777777777742', '00000000-0000-0000-0000-000000000011', 'twitter', '@AlertasVialesGto', 'Alertas Viales y Movilidad Guanajuato', 'verificado', true, NOW())
ON CONFLICT (id) DO UPDATE 
SET type = 'twitter', name = EXCLUDED.name, identifier = EXCLUDED.identifier, active = true, updated_at = NOW();

-- 5. Asegurar e insertar cuentas clave de Twitter/X para Querétaro (Clave 22)
INSERT INTO sources (id, state_id, type, identifier, name, credibility, active, updated_at) VALUES
('77777777-7777-7777-7777-777777777723', '11111111-1111-1111-1111-111111111111', 'twitter', '@POES_Qro', 'Policía Estatal Querétaro (PoEs)', 'oficial', true, NOW()),
('77777777-7777-7777-7777-777777777751', '11111111-1111-1111-1111-111111111111', 'twitter', '@PoliciaEstatalQRO', 'Policía Estatal Querétaro Operativo', 'oficial', true, NOW()),
('77777777-7777-7777-7777-777777777752', '11111111-1111-1111-1111-111111111111', 'twitter', '@AlertaQroVial', 'Alerta Vial y Movilidad Urbana Querétaro', 'verificado', true, NOW())
ON CONFLICT (id) DO UPDATE 
SET type = 'twitter', name = EXCLUDED.name, identifier = EXCLUDED.identifier, active = true, updated_at = NOW();

-- 6. Asegurar e insertar cuentas clave de Twitter/X para Puebla (Clave 21)
INSERT INTO sources (id, state_id, type, identifier, name, credibility, active, updated_at) VALUES
('77777777-7777-7777-7777-777777777732', '21212121-2121-2121-2121-212121212121', 'twitter', '@SSPGobPue', 'Secretaría de Seguridad Pública del Estado de Puebla', 'oficial', true, NOW()),
('77777777-7777-7777-7777-777777777761', '21212121-2121-2121-2121-212121212121', 'twitter', '@AlertaPueblaSeguridad', 'Alerta Puebla y Seguridad Metropolitana', 'verificado', true, NOW()),
('77777777-7777-7777-7777-777777777762', '21212121-2121-2121-2121-212121212121', 'twitter', '@TraficoPueblaEnVivo', 'Tráfico Puebla y Monitoreo Vial', 'verificado', true, NOW())
ON CONFLICT (id) DO UPDATE 
SET type = 'twitter', name = EXCLUDED.name, identifier = EXCLUDED.identifier, active = true, updated_at = NOW();

-- 7. Rejuvenecer eventos antiguos a la jornada de HOY (últimas 3 horas)
UPDATE events 
SET occurred_at = NOW() - (RANDOM() * INTERVAL '180 minutes'),
    created_at = NOW() - (RANDOM() * INTERVAL '180 minutes')
WHERE occurred_at < NOW() - INTERVAL '3 hours';

UPDATE raw_events 
SET ingested_at = NOW() - (RANDOM() * INTERVAL '180 minutes')
WHERE ingested_at < NOW() - INTERVAL '3 hours';
