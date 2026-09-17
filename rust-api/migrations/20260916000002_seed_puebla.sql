-- ==============================================================================
-- SentinelIQ: Migración y Seed Oficial para el ESTADO DE PUEBLA (Clave INEGI 21)
-- State ID: 21212121-2121-2121-2121-212121212121
-- ==============================================================================

-- 0. REGISTRO DEL ESTADO DE PUEBLA (Clave INEGI 21)
INSERT INTO states (id, name, clave_inegi, polygon, nombre_dependencia, color_primario)
VALUES (
  '21212121-2121-2121-2121-212121212121',
  'Estado de Puebla',
  '21',
  '{"type": "Polygon", "coordinates": [[[-98.7, 18.0], [-96.7, 18.0], [-96.7, 20.8], [-98.7, 20.8], [-98.7, 18.0]]]}',
  'Despacho del Gobernador del Estado de Puebla',
  '#6a1b9a'
) ON CONFLICT (clave_inegi) DO UPDATE
SET name = EXCLUDED.name, nombre_dependencia = EXCLUDED.nombre_dependencia, color_primario = EXCLUDED.color_primario;

-- 0.1 USUARIOS INICIALES PARA PUEBLA
INSERT INTO users (id, state_id, email, hashed_pwd, role, name, cargo, active) VALUES
(
  '21212121-0000-0000-0000-000000000001',
  '21212121-2121-2121-2121-212121212121',
  'admin.ti@puebla.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'superadmin',
  'Ing. Alejandro Ceballos',
  'Superadministrador de Plataforma Puebla',
  true
),
(
  '21212121-0000-0000-0000-000000000002',
  '21212121-2121-2121-2121-212121212121',
  'gobernador@puebla.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'gobernador',
  'Alejandro Armenta Mier',
  'Gobernador Constitucional del Estado de Puebla',
  true
),
(
  '21212121-0000-0000-0000-000000000003',
  '21212121-2121-2121-2121-212121212121',
  'gobernacion@puebla.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'jefe_oficina',
  'Mtro. Javier Aquino Limón',
  'Secretario de Gobernación del Estado de Puebla',
  true
),
(
  '21212121-0000-0000-0000-000000000004',
  '21212121-2121-2121-2121-212121212121',
  'analista.inteligencia@puebla.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'analista',
  'Lic. Mariana Domínguez',
  'Analista Senior de Inteligencia Situacional',
  true
)
ON CONFLICT (email) DO UPDATE
SET state_id = EXCLUDED.state_id, role = EXCLUDED.role, name = EXCLUDED.name, cargo = EXCLUDED.cargo;

-- 1. FUENTES VIVAS PARA PUEBLA (Clave INEGI 21)
INSERT INTO sources (id, state_id, type, identifier, name, credibility, active) VALUES
('77777777-7777-7777-7777-777777777731', '21212121-2121-2121-2121-212121212121', 'telegram', '@AlertaPueblaSeguridad', 'Canal Alerta Puebla Seguridad & Vigilancia', 'no_verificado', true),
('77777777-7777-7777-7777-777777777732', '21212121-2121-2121-2121-212121212121', 'telegram', '@TraficoPueblaEnVivo', 'Tráfico Puebla y Movilidad Metropolitana', 'verificado', true),
('77777777-7777-7777-7777-777777777733', '21212121-2121-2121-2121-212121212121', 'social', '@SSPGobPue', 'Secretaría de Seguridad Pública del Estado de Puebla', 'oficial', true),
('77777777-7777-7777-7777-777777777734', '21212121-2121-2121-2121-212121212121', 'social', '@CentralPuebla', 'Periódico Central Puebla — Cobertura Estatal', 'verificado', true),
('77777777-7777-7777-7777-777777777735', '21212121-2121-2121-2121-212121212121', 'social', '@ElSoldePuebla', 'El Sol de Puebla — OEM Periodismo Regional', 'verificado', true),
('77777777-7777-7777-7777-777777777736', '21212121-2121-2121-2121-212121212121', 'api_federal', 'PC_Estatal_PUE', 'Coordinación General de Protección Civil Puebla', 'oficial', true),
('77777777-7777-7777-7777-777777777737', '21212121-2121-2121-2121-212121212121', 'api_federal', 'CONAGUA_Balsas_PUE', 'Organismo de Cuenca Balsas - CONAGUA', 'oficial', true),
('77777777-7777-7777-7777-777777777738', '21212121-2121-2121-2121-212121212121', 'gdelt', '@gdelt_prensa', 'GDELT 2.0 Prensa y Monitoreo Territorial Puebla', 'verificado', true),
('77777777-7777-7777-7777-777777777739', '21212121-2121-2121-2121-212121212121', 'data365_twitter', '@data365_twitter', 'Data365 Redes Sociales Puebla', 'verificado', true)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, identifier = EXCLUDED.identifier, type = EXCLUDED.type, credibility = EXCLUDED.credibility;

-- 2. SNAPSHOT DE GABINETE PARA PUEBLA (Clave INEGI 21)
INSERT INTO cabinet_snapshots (state_id, semaforos, key_points, alert_level, created_at) VALUES (
  '21212121-2121-2121-2121-212121212121',
  '{
    "seguridad": {"nivel": "OPERACIÓN NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Blindaje logístico en México-Puebla; patrullaje metropolitano Angelópolis sin incidentes."},
    "proteccion_civil": {"nivel": "VIGILANCIA", "color": "warning", "tendencia": "estable", "mensaje": "Popocatépetl en Amarillo Fase 2; presas Valsequillo y Necaxa con 74% de almacenamiento."},
    "gobernabilidad": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Mesa de diálogo pacífica en Tehuacán; coordinación efectiva con los 217 municipios."},
    "salud": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Red de hospitales del sector salud Puebla con abasto regular y atención en 97%."},
    "finanzas": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Plan estatal de inversión en infraestructura hídrica y carreteras dentro de calendario."}
  }',
  '[
    {"id": 1, "titulo": "Operativo de Paz Metropolitano", "impacto": "Alto", "atencion": "Inmediata", "descripcion": "Vigilancia reforzada y filtros de seguridad en corredores industriales y turísticos."},
    {"id": 2, "titulo": "Inspección Logística México - Puebla", "impacto": "Alto", "atencion": "Programada", "descripcion": "Monitoreo preventivo del transporte de carga en tramo Texmelucan con Guardia Nacional."},
    {"id": 3, "titulo": "Seguimiento a Mesas de Diálogo Comunitario", "impacto": "Medio", "atencion": "Estratégica", "descripcion": "Atención directa de Segob a comités agrarios en Tehuacán y Serdán."}
  ]',
  'NORMAL',
  NOW()
) ON CONFLICT DO NOTHING;
