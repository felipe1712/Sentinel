-- Seed Estado de Querétaro (Clave INEGI 22)
INSERT INTO states (id, name, clave_inegi, polygon, nombre_dependencia, color_primario)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Querétaro',
  '22',
  '{"type": "Polygon", "coordinates": [[[-100.6, 20.0], [-99.0, 20.0], [-99.0, 21.7], [-100.6, 21.7], [-100.6, 20.0]]]}',
  'Despacho del Gobernador del Estado de Querétaro',
  '#002b49'
) ON CONFLICT (clave_inegi) DO NOTHING;

-- Seed Usuarios para Querétaro
-- Contraseña por defecto para desarrollo: password123 (hash bcrypt)
INSERT INTO users (id, state_id, email, hashed_pwd, role, name, cargo) VALUES
(
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'admin@sentineliq.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W', -- password123
  'superadmin',
  'Administrador del Sistema',
  'Superadministrador SentinelIQ'
),
(
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'jefe.oficina@queretaro.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'jefe_oficina',
  'Mtro. Alejandro Morales',
  'Jefe de la Oficina del Gobernador'
),
(
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'asesor.politico@queretaro.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'asesor',
  'Dra. Sofia Ramos',
  'Asesora Senior de Estrategia Política'
),
(
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  'analista.fuentes@queretaro.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'analista',
  'Lic. Carlos Mendoza',
  'Analista de Fuentes y Procesamiento'
),
(
  '66666666-6666-6666-6666-666666666666',
  '11111111-1111-1111-1111-111111111111',
  'gobernador@queretaro.gob.mx',
  '$2b$12$K89938/i/XW.S8T0tTfKEO88O1Tf4qR543.W2b4yQ6Q4s/s.K/16W',
  'gobernador',
  'Gobernador Constitucional del Estado de Querétaro',
  'Titular del Poder Ejecutivo Estatal'
) ON CONFLICT (email) DO NOTHING;

-- Seed Fuentes Ejemplo Querétaro
INSERT INTO sources (id, state_id, type, identifier, name, credibility) VALUES
('77777777-7777-7777-7777-777777777771', '11111111-1111-1111-1111-111111111111', 'telegram', '@NoticiasQueretaroHoy', 'Canal Noticias Querétaro Hoy', 'verificado'),
('77777777-7777-7777-7777-777777777772', '11111111-1111-1111-1111-111111111111', 'api_federal', 'CENAPRED_RSS', 'Alerta Sismológica SSN/CENAPRED', 'oficial'),
('77777777-7777-7777-7777-777777777773', '11111111-1111-1111-1111-111111111111', 'api_federal', 'CONAGUA_SMN', 'Servicio Meteorológico Nacional', 'oficial')
ON CONFLICT DO NOTHING;

-- Seed Eventos Iniciales Ejemplo Querétaro
INSERT INTO events (id, state_id, category, severity, title, summary, ai_summary, political_relevance, location_text, lat, lng, municipio, status, occurred_at) VALUES
(
  '88888888-8888-8888-8888-888888888881',
  '11111111-1111-1111-1111-111111111111',
  'seguridad',
  'critico',
  'Incidente de tráfico y cierre parcial en Paseo 5 de Febrero y Av. Zaragoza',
  'Reporte de percance vial y congestionamiento relevante en la arteria principal de la capital.',
  'Incidente con alto impacto en la movilidad urbana de la ZMQ. Se requiere reporte de avances del operativo vial antes de las 14:00 hrs.',
  9,
  'Santiago de Querétaro, Centro',
  20.5888,
  -100.3899,
  'Santiago de Querétaro',
  'escalado',
  NOW() - INTERVAL '2 hours'
),
(
  '88888888-8888-8888-8888-888888888882',
  '11111111-1111-1111-1111-111111111111',
  'proteccion_civil',
  'alto',
  'Monitoreo por desbordamiento menor en dren pluvial de El Marqués',
  'Protección Civil atiende encharcamientos en fraccionamientos de la zona conurbada.',
  'Afectación moderada a vialidades secundarias en El Marqués. Sin lesionados. Oportunidad para destacar intervención oportuna del estado.',
  6,
  'El Marqués, Zona Conurbada',
  20.6500,
  -100.2800,
  'El Marqués',
  'revisado',
  NOW() - INTERVAL '5 hours'
),
(
  '88888888-8888-8888-8888-888888888883',
  '11111111-1111-1111-1111-111111111111',
  'politico',
  'medio',
  'Conferencia de prensa en el Congreso del Estado sobre asignación presupuestal',
  'Diputados locales presentan observaciones al proyecto de infraestructura regional y agua.',
  'Presión legislativa ordinaria. Se sugiere reunión de trabajo con la Comisión de Hacienda y Presupuesto.',
  8,
  'Congreso del Estado, Santiago de Querétaro',
  20.5920,
  -100.3920,
  'Santiago de Querétaro',
  'nuevo',
  NOW() - INTERVAL '8 hours'
)
ON CONFLICT DO NOTHING;

-- Seed Cabinet Snapshot Inicial Querétaro
INSERT INTO cabinet_snapshots (state_id, semaforos, key_points, alert_level) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '{
    "seguridad": {"nivel": "ALERTA", "color": "danger", "tendencia": "subiendo", "mensaje": "Congestión y operativo en 5 de Febrero"},
    "proteccion_civil": {"nivel": "VIGILANCIA", "color": "warning", "tendencia": "estable", "mensaje": "Monitoreo pluvial en El Marqués y San Juan del Río"},
    "gobernabilidad": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Mesa de diálogo parlamentaria activa"},
    "salud": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Indicadores epidemiológicos estables"},
    "finanzas": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Seguimiento a proyectos de financiamiento hídrico"}
  }',
  '[
    {"id": 1, "titulo": "Operativo de Movilidad en ZMQ", "impacto": "Alto", "atencion": "Inmediata", "descripcion": "Coordinación entre Policía PoEs y Tránsito Municipal en Bernardo Quintana y 5 de Febrero."},
    {"id": 2, "titulo": "Sesión del Gabinete de Agua y Energía", "impacto": "Medio", "atencion": "Programada", "descripcion": "Revisión del avance del Sistema Batán Agua para Todos a las 17:00 hrs."},
    {"id": 3, "titulo": "Visita Ejecutiva a San Juan del Río", "impacto": "Alto", "atencion": "Estratégica", "descripcion": "Evaluación de dossier municipal para gira de trabajo en la zona sur mañana."}
  ]',
  'ALERTA'
) ON CONFLICT DO NOTHING;
