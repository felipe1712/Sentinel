-- ==============================================================================
-- SentinelIQ: Seed de Fuentes Vivas, Eventos 36h y Gabinete para PUEBLA
-- Estado: Estado de Puebla (Clave INEGI 21)
-- State ID: 21212121-2121-2121-2121-212121212121
-- ==============================================================================

-- 1. FUENTES VIVAS PARA PUEBLA (Clave INEGI 21)
INSERT INTO sources (id, state_id, type, identifier, name, credibility, active) VALUES
('77777777-7777-7777-7777-777777777731', '21212121-2121-2121-2121-212121212121', 'telegram', '@AlertaPueblaSeguridad', 'Canal Alerta Puebla Seguridad & Vigilancia', 'no_verificado', true),
('77777777-7777-7777-7777-777777777732', '21212121-2121-2121-2121-212121212121', 'telegram', '@TraficoPueblaEnVivo', 'Tráfico Puebla y Movilidad Metropolitana', 'verificado', true),
('77777777-7777-7777-7777-777777777733', '21212121-2121-2121-2121-212121212121', 'social', '@SSPGobPue', 'Secretaría de Seguridad Pública del Estado de Puebla', 'oficial', true),
('77777777-7777-7777-7777-777777777734', '21212121-2121-2121-2121-212121212121', 'social', '@CentralPuebla', 'Periódico Central Puebla — Cobertura Estatal', 'verificado', true),
('77777777-7777-7777-7777-777777777735', '21212121-2121-2121-2121-212121212121', 'social', '@ElSoldePuebla', 'El Sol de Puebla — OEM Periodismo Regional', 'verificado', true),
('77777777-7777-7777-7777-777777777736', '21212121-2121-2121-2121-212121212121', 'api_federal', 'PC_Estatal_PUE', 'Coordinación General de Protección Civil Puebla', 'oficial', true),
('77777777-7777-7777-7777-777777777737', '21212121-2121-2121-2121-212121212121', 'api_federal', 'CONAGUA_Balsas_PUE', 'Organismo de Cuenca Balsas - CONAGUA', 'oficial', true)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, identifier = EXCLUDED.identifier, type = EXCLUDED.type, credibility = EXCLUDED.credibility;

-- 2. RAW EVENTS (EVIDENCIA CRUDA DE FUENTES) PARA PUEBLA (ÚLTIMAS 36 HORAS)
INSERT INTO raw_events (id, source_id, state_id, raw_text, ingested_at) VALUES
(
  '99999999-0000-0000-0000-000000000031',
  '77777777-7777-7777-7777-777777777731',
  '21212121-2121-2121-2121-212121212121',
  '⚠️ #ALERTA_TEXMELUCAN [Telegram @AlertaPueblaSeguridad] Reportan operativo preventivo coordinado sobre la Autopista México-Puebla altura caseta de San Martín Texmelucan. Guardia Nacional y Policía Estatal inspeccionan transportes de carga. Circulación con reducción de carril lateral, avance fluido.',
  NOW() - INTERVAL '35 minutes'
),
(
  '99999999-0000-0000-0000-000000000032',
  '77777777-7777-7777-7777-777777777733',
  '21212121-2121-2121-2121-212121212121',
  '🚨 COMUNICADO OFICIAL [@SSPGobPue en X]: Concluye con saldo blanco el despliegue metropolitano Angelópolis en Puebla Capital, San Pedro Cholula y San Andrés Cholula. Se reforzó el patrullaje preventivo en centros comerciales, plazas y corredores turísticos.',
  NOW() - INTERVAL '1 hour 15 minutes'
),
(
  '99999999-0000-0000-0000-000000000033',
  '77777777-7777-7777-7777-777777777732',
  '21212121-2121-2121-2121-212121212121',
  '🚗 #TraficoPuebla [Telegram @TraficoPueblaEnVivo] Cierre preventivo por obras de modernización en Periférico Ecológico a la altura de Cuautlancingo. Vías alternas habilitadas sobre Recta a Cholula y Forjadores. Tráfico moderado.',
  NOW() - INTERVAL '3 hours 10 minutes'
),
(
  '99999999-0000-0000-0000-000000000034',
  '77777777-7777-7777-7777-777777777736',
  '21212121-2121-2121-2121-212121212121',
  '🌋 MONITOREO VOLCÁNICO [PC_Estatal_PUE]: Coordinación General de Protección Civil informa semáforo volcánico del Popocatépetl se mantiene en Amarillo Fase 2. Emisiones leves de vapor y ceniza con dispersión hacia el noreste sin afectación a la zona metropolitana de Puebla.',
  NOW() - INTERVAL '5 hours 40 minutes'
),
(
  '99999999-0000-0000-0000-000000000035',
  '77777777-7777-7777-7777-777777777734',
  '21212121-2121-2121-2121-212121212121',
  '📰 NOTA CENTRAL [@CentralPuebla]: Mesa de diálogo pacífica en Tehuacán: Gobierno del Estado atiende peticiones de comités de agua y agricultores del Valle de Tehuacán. Se pacta mesa técnica para el próximo lunes con Conagua y Gobernación.',
  NOW() - INTERVAL '11 hours 20 minutes'
),
(
  '99999999-0000-0000-0000-000000000036',
  '77777777-7777-7777-7777-777777777735',
  '21212121-2121-2121-2121-212121212121',
  '📈 ECONOMÍA REGIONAL [@ElSoldePuebla]: Reportan ocupación hotelera del 82% en Atlixco y Pueblos Mágicos de la Sierra Norte (Zacatlán y Chignahuapan) de cara a la temporada turística. Alta derrama económica.',
  NOW() - INTERVAL '18 hours 30 minutes'
),
(
  '99999999-0000-0000-0000-000000000037',
  '77777777-7777-7777-7777-777777777731',
  '21212121-2121-2121-2121-212121212121',
  '🌲 REPORTE SIERRA NORTE [Telegram @AlertaPueblaSeguridad]: Tránsito fluido y supervisión carretera en el tramo Huauchinango - Xicotepec. Brigadas de Protección Civil retiran escombros menores tras lluvia matutina sin mayores incidentes.',
  NOW() - INTERVAL '24 hours 15 minutes'
),
(
  '99999999-0000-0000-0000-000000000038',
  '77777777-7777-7777-7777-777777777737',
  '21212121-2121-2121-2121-212121212121',
  '💧 BALANCE HÍDRICO PUEBLA [CONAGUA_Balsas_PUE]: Presas del sistema Necaxa y Valsequillo mantienen niveles óptimos con 72% y 76% de almacenamiento. Abasto garantizado para distritos de riego en Tecamachalco y Tepeaca.',
  NOW() - INTERVAL '30 hours'
)
ON CONFLICT (id) DO UPDATE 
SET raw_text = EXCLUDED.raw_text, ingested_at = EXCLUDED.ingested_at;

-- 3. PROCESSED EVENTS (INTELIGENCIA Y ALERTAS EJECUTIVAS) PARA PUEBLA
INSERT INTO processed_events (
  id, state_id, source_id, raw_event_id, category, severity, title, summary,
  ai_summary, political_relevance, location, lat, lng, municipio, status, occurred_at
) VALUES
(
  '88888888-0000-0000-0000-000000000031',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777731',
  '99999999-0000-0000-0000-000000000031',
  'seguridad',
  'alto',
  'Blindaje Logístico en Caseta Autopista México-Puebla (San Martín Texmelucan)',
  'Inspección y patrullaje conjunto de Guardia Nacional y SSP en acceso industrial de Texmelucan.',
  'Operativo preventivo que garantiza libre tránsito y disuasión de robo al autotransporte en el arco poniente.',
  8,
  'Caseta San Martín Texmelucan KM 92',
  19.2844,
  -98.4344,
  'San Martín Texmelucan',
  'escalado',
  NOW() - INTERVAL '35 minutes'
),
(
  '88888888-0000-0000-0000-000000000032',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777733',
  '99999999-0000-0000-0000-000000000032',
  'seguridad',
  'medio',
  'Operativo Interinstitucional de Vigilancia Metropolitana Angelópolis',
  'Conclusión con saldo blanco de patrullajes en Puebla Capital y las Cholulas.',
  'Presencia disuasiva coordinada que eleva percepción de seguridad en zonas de alta afluencia comercial.',
  7,
  'Zona Angelópolis y Centro Histórico de Puebla',
  19.0414,
  -98.2063,
  'Puebla Capital',
  'revisado',
  NOW() - INTERVAL '1 hour 15 minutes'
),
(
  '88888888-0000-0000-0000-000000000033',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777732',
  '99999999-0000-0000-0000-000000000033',
  'movilidad',
  'medio',
  'Obras Viales y Desvíos Preventivos en Periférico Ecológico (Cuautlancingo)',
  'Modernización de superficie de rodamiento y habilitación de rutas de desfogue.',
  'Gestión vial coordinada entre Secretaría de Movilidad y ayuntamientos conurbados.',
  5,
  'Periférico Ecológico y Cruce Forjadores',
  19.0800,
  -98.2700,
  'Cuautlancingo',
  'revisado',
  NOW() - INTERVAL '3 hours 10 minutes'
),
(
  '88888888-0000-0000-0000-000000000034',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777736',
  '99999999-0000-0000-0000-000000000034',
  'proteccion_civil',
  'medio',
  'Vigilancia Permanente Popocatépetl en Amarillo Fase 2',
  'Monitoreo sismológico y de emisiones volcánicas; sin caída de ceniza en zona urbana.',
  'Protocolo estatal de Protección Civil activo para comunidades aledañas al coloso.',
  7,
  'Sector Paso de Cortés y Faldas del Popocatépetl',
  19.0228,
  -98.6278,
  'Atlixco',
  'revisado',
  NOW() - INTERVAL '5 hours 40 minutes'
),
(
  '88888888-0000-0000-0000-000000000035',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777734',
  '99999999-0000-0000-0000-000000000035',
  'politico',
  'medio',
  'Acuerdos de Gobernabilidad y Diálogo Social en Tehuacán',
  'Instalación de mesa de trabajo pacífica con sectores productivos y comités ejidales.',
  'Contención anticipada de inconformidades agrarias gracias a mediación de Segob Puebla.',
  6,
  'Palacio Municipal de Tehuacán',
  18.4633,
  -97.3917,
  'Tehuacán',
  'revisado',
  NOW() - INTERVAL '11 hours 20 minutes'
),
(
  '88888888-0000-0000-0000-000000000036',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777735',
  '99999999-0000-0000-0000-000000000036',
  'economia',
  'informativo',
  'Dinamismo Turístico y Repunte Hotelero en Pueblos Mágicos de Puebla',
  'Cifras positivas de ocupación en Atlixco, Zacatlán y Chignahuapan.',
  'Impacto favorable en empleo y reactivación de servicios en la Sierra Norte.',
  4,
  'Corredor Turístico Zacatlán - Chignahuapan',
  19.9322,
  -97.9606,
  'Zacatlán',
  'revisado',
  NOW() - INTERVAL '18 hours 30 minutes'
),
(
  '88888888-0000-0000-0000-000000000037',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777731',
  '99999999-0000-0000-0000-000000000037',
  'proteccion_civil',
  'medio',
  'Mantenimiento y Despeje Preventivo Carretero en Sierra Norte (Huauchinango)',
  'Retiro ágil de desprendimientos menores en carretera federal México-Tuxpan.',
  'Mantenimiento preventivo que preserva conectividad intermunicipal en la sierra.',
  5,
  'Tramo Carretero Huauchinango - Xicotepec',
  20.1764,
  -98.0531,
  'Huauchinango',
  'revisado',
  NOW() - INTERVAL '24 hours 15 minutes'
),
(
  '88888888-0000-0000-0000-000000000038',
  '21212121-2121-2121-2121-212121212121',
  '77777777-7777-7777-7777-777777777737',
  '99999999-0000-0000-0000-000000000038',
  'economia',
  'informativo',
  'Almacenamiento Óptimo en Presas del Sistema Necaxa y Valsequillo',
  'Reporte federal de Conagua garantiza agua de riego para Serdán y Tepeaca.',
  'Seguridad hídrica consolidada para el ciclo agropecuario del valle poblano.',
  4,
  'Presa Manuel Ávila Camacho (Valsequillo)',
  18.9167,
  -98.1833,
  'Tepeaca',
  'revisado',
  NOW() - INTERVAL '30 hours'
)
ON CONFLICT (id) DO UPDATE 
SET state_id = EXCLUDED.state_id,
  source_id = EXCLUDED.source_id,
  raw_event_id = EXCLUDED.raw_event_id,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  ai_summary = EXCLUDED.ai_summary,
  severity = EXCLUDED.severity,
  political_relevance = EXCLUDED.political_relevance,
  occurred_at = EXCLUDED.occurred_at;

-- 4. SNAPSHOT DE GABINETE PARA PUEBLA (Clave INEGI 21)
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
  'VERDE',
  NOW()
) ON CONFLICT DO NOTHING;
