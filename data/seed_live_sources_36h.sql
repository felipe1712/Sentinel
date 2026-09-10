-- ==============================================================================
-- SentinelIQ: Seed de Fuentes Vivas (Telegram, Redes Sociales, Oficiales)
-- y Eventos Dinámicos de las Últimas 36 Horas
-- ==============================================================================

-- 1. FUENTES VIVAS PARA GUANAJUATO (Clave INEGI 11)
INSERT INTO sources (id, state_id, type, identifier, name, credibility, active) VALUES
('77777777-7777-7777-7777-777777777711', '00000000-0000-0000-0000-000000000011', 'telegram', '@AlertaBajioOficial', 'Canal Alerta Bajío & Seguridad Operativa', 'no_verificado', true),
('77777777-7777-7777-7777-777777777712', '00000000-0000-0000-0000-000000000011', 'telegram', '@NoticiasGTO', 'Red de Corresponsales Noticias GTO en Vivo', 'verificado', true),
('77777777-7777-7777-7777-777777777713', '00000000-0000-0000-0000-000000000011', 'telegram', '@VialidadLeonGTO', 'Monitoreo Vial y Emergencias Metrópoli León', 'no_verificado', true),
('77777777-7777-7777-7777-777777777714', '00000000-0000-0000-0000-000000000011', 'social', '@FSPE_Gto', 'Fuerzas de Seguridad Pública del Estado (FSPE)', 'oficial', true),
('77777777-7777-7777-7777-777777777715', '00000000-0000-0000-0000-000000000011', 'social', '@PeriodismoBajio', 'Agencia Informativa & Periodismo Regional Bajío', 'verificado', true),
('77777777-7777-7777-7777-777777777716', '00000000-0000-0000-0000-000000000011', 'api_federal', 'PC_Estatal_GTO', 'Coordinación Estatal de Protección Civil GTO', 'oficial', true),
('77777777-7777-7777-7777-777777777717', '00000000-0000-0000-0000-000000000011', 'api_federal', 'CONAGUA_Lerma_Santiago', 'Servicio Hidrometeorológico y Cuencas CONAGUA', 'oficial', true)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, identifier = EXCLUDED.identifier, type = EXCLUDED.type, credibility = EXCLUDED.credibility;

-- 2. FUENTES VIVAS PARA QUERÉTARO (Clave INEGI 22)
INSERT INTO sources (id, state_id, type, identifier, name, credibility, active) VALUES
('77777777-7777-7777-7777-777777777721', '11111111-1111-1111-1111-111111111111', 'telegram', '@NoticiasQueretaroHoy', 'Canal Noticias Querétaro Hoy', 'verificado', true),
('77777777-7777-7777-7777-777777777722', '11111111-1111-1111-1111-111111111111', 'telegram', '@AlertaQroVial', 'Alerta Vial y Movilidad Urbana Querétaro', 'no_verificado', true),
('77777777-7777-7777-7777-777777777723', '11111111-1111-1111-1111-111111111111', 'social', '@POES_Qro', 'Policía Estatal Querétaro (PoEs)', 'oficial', true),
('77777777-7777-7777-7777-777777777724', '11111111-1111-1111-1111-111111111111', 'social', '@CIAS_Queretaro', 'Centro de Información y Análisis para la Seguridad (CIAS)', 'oficial', true)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, identifier = EXCLUDED.identifier, type = EXCLUDED.type, credibility = EXCLUDED.credibility;

-- 3. RAW EVENTS (EVIDENCIA CRUDA DE FUENTES) PARA GUANAJUATO (ÚLTIMAS 36 HORAS)
INSERT INTO raw_events (id, source_id, state_id, raw_text, ingested_at) VALUES
(
  '99999999-0000-0000-0000-000000000001',
  '77777777-7777-7777-7777-777777777711',
  '00000000-0000-0000-0000-000000000011',
  '⚠️ #URGENTE_CELAYA [Telegram @AlertaBajioOficial] Reportan fuerte movilización de corporaciones estatales y federales en el entronque de salida hacia Villagrán. Camión de transporte pesado detenido cruzado preventivamente. FSPE mantiene perímetro asegurado. Tráfico totalmente detenido en dirección poniente. Eviten la zona.',
  NOW() - INTERVAL '45 minutes'
),
(
  '99999999-0000-0000-0000-000000000002',
  '77777777-7777-7777-7777-777777777714',
  '00000000-0000-0000-0000-000000000011',
  '🚨 COMUNICADO OFICIAL [@FSPE_Gto en X]: En coordinación con la @GN_MEXICO_ y @SEDENAmx, personal de las Fuerzas de Seguridad Pública del Estado mantiene bajo control el tramo Celaya - Villagrán tras reporte de conato de bloqueo. Se restablece la circulación de manera paulatina. No se reportan personas lesionadas.',
  NOW() - INTERVAL '25 minutes'
),
(
  '99999999-0000-0000-0000-000000000003',
  '77777777-7777-7777-7777-777777777713',
  '00000000-0000-0000-0000-000000000011',
  '🚗💨 #ReporteVialLeon [Telegram @VialidadLeonGTO] Carambola sobre Blvd. Adolfo López Mateos a la altura de Poliforum León. 3 vehículos involucrados. Servicios de emergencia ya en sitio. Reducción a 1 carril central, fila vehicular alcanza la glorieta del Estadio León.',
  NOW() - INTERVAL '2 hours 15 minutes'
),
(
  '99999999-0000-0000-0000-000000000004',
  '77777777-7777-7777-7777-777777777716',
  '00000000-0000-0000-0000-000000000011',
  '🌧️ BOLETÍN PREVENTIVO [PC_Estatal_GTO]: Coordinación Estatal de Protección Civil informa: Por lluvias en zona serrana, la Presa de la Olla registra 88% de capacidad. Se inician maniobras preventivas de desfogue controlado. Niveles de Río Guanajuato estables en cauce. Se exhorta a la población a seguir recomendaciones oficiales.',
  NOW() - INTERVAL '4 hours 50 minutes'
),
(
  '99999999-0000-0000-0000-000000000005',
  '77777777-7777-7777-7777-777777777712',
  '00000000-0000-0000-0000-000000000011',
  '🔴 #IRAPUATO [Telegram @NoticiasGTO] Operativo de inspección sorpresa a centros nocturnos y establecimientos de giros negros en zona norte de Irapuato. Participan FSPE y fiscalización municipal. 2 clausuras preventivas por falta de permisos. Saldo blanco.',
  NOW() - INTERVAL '12 hours'
),
(
  '99999999-0000-0000-0000-000000000006',
  '77777777-7777-7777-7777-777777777715',
  '00000000-0000-0000-0000-000000000011',
  '📢 [@PeriodismoBajio en X] Sindicato del Clúster Automotriz y representantes empresariales en Guanajuato Puerto Interior (Silao) firman acuerdo preliminar de revisión salarial sin emplazamiento a huelga. Se pacta mesa de seguimiento mensual con la Secretaría de Economía.',
  NOW() - INTERVAL '16 hours'
),
(
  '99999999-0000-0000-0000-000000000007',
  '77777777-7777-7777-7777-777777777711',
  '00000000-0000-0000-0000-000000000011',
  '⚡ #SALAMANCA [Telegram @AlertaBajioOficial] Reporte ciudadano de conato de fuga en línea secundaria de ducto industrial en zona conurbada Salamanca - Juventino Rosas. Bomberos de Pemex y Protección Civil atendieron y controlaron sin afectación a comunidades.',
  NOW() - INTERVAL '22 hours'
),
(
  '99999999-0000-0000-0000-000000000008',
  '77777777-7777-7777-7777-777777777717',
  '00000000-0000-0000-0000-000000000011',
  '📊 INFORME HIDROLÓGICO [CONAGUA_Lerma_Santiago]: Balance de almacenamiento en cuencas de Guanajuato: Presa Solís en 74%, Presa Allende en 68%, Presa Purísima en 81%. Sin riesgo de desbordamiento en municipios de la cuenca baja.',
  NOW() - INTERVAL '28 hours'
)
ON CONFLICT (id) DO UPDATE SET raw_text = EXCLUDED.raw_text;

-- 4. EVENTOS PROCESADOS ASOCIADOS A FUENTES Y TEXTOS CRUDOS (GUANAJUATO, ÚLTIMAS 36H)
-- Todas las filas tienen exactamente 16 columnas
INSERT INTO events (id, state_id, source_id, raw_event_id, category, severity, title, summary, ai_summary, political_relevance, location_text, lat, lng, municipio, status, occurred_at) VALUES
(
  '88888888-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000011',
  '77777777-7777-7777-7777-777777777711',
  '99999999-0000-0000-0000-000000000001',
  'seguridad',
  'critico',
  'Despliegue Operativo y Contención Vial en Salida Celaya - Villagrán',
  'Canal de Telegram ciudadano reporta cierre preventivo y presencia de fuerzas federales y estatales.',
  'Detección temprana vía Telegram 23 minutos antes del boletín de confirmación oficial. Se recomienda mantener monitoreo sobre la reacción en redes ciudadanas.',
  9,
  'Carretera Libre Celaya - Villagrán KM 8',
  20.5235,
  -100.8140,
  'Celaya',
  'escalado',
  NOW() - INTERVAL '45 minutes'
),
(
  '88888888-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000011',
  '77777777-7777-7777-7777-777777777714',
  '99999999-0000-0000-0000-000000000002',
  'seguridad',
  'alto',
  'Confirmación Oficial FSPE: Tramo Celaya Controlado y Reanudación de Tránsito',
  'Comunicado de vocería FSPE vía X confirma reapertura de carriles tras conato de bloqueo sin heridos.',
  'Cierre favorable del incidente. La narrativa institucional mitigó rumores de enfrentamiento activo.',
  7,
  'Entronque Carretero Celaya',
  20.5280,
  -100.8200,
  'Celaya',
  'revisado',
  NOW() - INTERVAL '25 minutes'
),
(
  '88888888-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000011',
  '77777777-7777-7777-7777-777777777713',
  '99999999-0000-0000-0000-000000000003',
  'proteccion_civil',
  'medio',
  'Incidente Vial Múltiple en Adolfo López Mateos (Poliforum León)',
  'Reporte en vivo en canal de movilidad ciudadana indica colisión de 3 unidades con reducción a un carril.',
  'Impacto focalizado en movilidad metropolitana en hora pico. Se coordinó aviso de vías alternas.',
  5,
  'Blvd. Adolfo López Mateos frente a Poliforum León',
  21.1150,
  -101.6540,
  'León',
  'revisado',
  NOW() - INTERVAL '2 hours 15 minutes'
),
(
  '88888888-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000011',
  '77777777-7777-7777-7777-777777777716',
  '99999999-0000-0000-0000-000000000004',
  'proteccion_civil',
  'alto',
  'Desfogue Controlado y Monitoreo de Capacidad en Presa de la Olla',
  'Alerta de Protección Civil Estatal por nivel de 88% en presa capitalina tras precipitaciones serranas.',
  'Medida operativa preventiva. Se activó protocolo de comunicación preventiva para evitar alarma en centro histórico.',
  8,
  'Presa de la Olla, Paseo de la Presa, Guanajuato Capital',
  21.0090,
  -101.2460,
  'Guanajuato',
  'escalado',
  NOW() - INTERVAL '4 hours 50 minutes'
),
(
  '88888888-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000011',
  '77777777-7777-7777-7777-777777777712',
  '99999999-0000-0000-0000-000000000005',
  'seguridad',
  'medio',
  'Operativo Nocturno Interinstitucional de Fiscalización en Zona Norte de Irapuato',
  'Reporte de corresponsalía en Telegram sobre inspecciones y 2 clausuras de centros nocturnos.',
  'Operativo coordinado entre FSPE y municipio sin incidentes de resistencia civil.',
  6,
  'Paseo Irapuato y Blvd. a Villas',
  20.6780,
  -101.3540,
  'Irapuato',
  'revisado',
  NOW() - INTERVAL '12 hours'
),
(
  '88888888-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000011',
  '77777777-7777-7777-7777-777777777715',
  '99999999-0000-0000-0000-000000000006',
  'politico',
  'medio',
  'Acuerdo Laboral y Distensión Sindical en Clúster Automotriz Puerto Interior',
  'Publicación periodística en X sobre firma de pacto salarial entre sindicato y sector manufactura.',
  'Gobernabilidad económica asegurada en el corredor industrial Silao. Saldo altamente positivo.',
  7,
  'Guanajuato Puerto Interior, Silao',
  20.9700,
  -101.5200,
  'Silao',
  'revisado',
  NOW() - INTERVAL '16 hours'
),
(
  '88888888-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000011',
  '77777777-7777-7777-7777-777777777711',
  '99999999-0000-0000-0000-000000000007',
  'proteccion_civil',
  'medio',
  'Atención Oportuna a Conato de Fuga en Ducto Industrial Salamanca',
  'Canal Telegram Alerta Bajío alertó de maniobras de Pemex y PC en ducto secundario.',
  'Sin afectación a colonias circundantes. Incidente cerrado en menos de 90 minutos.',
  6,
  'Carretera Salamanca - Juventino Rosas KM 3',
  20.5730,
  -101.1960,
  'Salamanca',
  'revisado',
  NOW() - INTERVAL '22 hours'
),
(
  '88888888-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000011',
  '77777777-7777-7777-7777-777777777717',
  '99999999-0000-0000-0000-000000000008',
  'economia',
  'informativo',
  'Balance Hídrico Favorable en Cuencas y Presas de Guanajuato',
  'Boletín de monitoreo federal CONAGUA reporta presas principales entre 68% y 81% de capacidad.',
  'Certeza para ciclos de riego y suministro hídrico en corredor central.',
  4,
  'Presa Solís y Presa Allende',
  20.0800,
  -100.7000,
  'Acámbaro',
  'revisado',
  NOW() - INTERVAL '28 hours'
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

-- 5. SNAPSHOT DE GABINETE VINCULADO AL ESTADO REAL DE LAS FUENTES
INSERT INTO cabinet_snapshots (state_id, semaforos, key_points, alert_level, created_at) VALUES (
  '00000000-0000-0000-0000-000000000011',
  '{
    "seguridad": {"nivel": "ALERTA PREVENTIVA", "color": "danger", "tendencia": "bajando", "mensaje": "Contención efectiva en Celaya; vigilancia permanente en accesos."},
    "proteccion_civil": {"nivel": "VIGILANCIA", "color": "warning", "tendencia": "estable", "mensaje": "Desfogue controlado en Presa de la Olla; presas estatales en 74% promedio."},
    "gobernabilidad": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Pacto laboral formalizado en Clúster Automotriz Puerto Interior (Silao)."},
    "salud": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Red hospitalaria estatal operando al 95% de capacidad ordinaria."},
    "finanzas": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Ejecución presupuestal de obras estratégicas 2026 dentro de programa."}
  }',
  '[
    {"id": 1, "titulo": "Contención en Corredor Celaya - Villagrán", "impacto": "Alto", "atencion": "Inmediata", "descripcion": "Monitoreo continuo tras alerta ciudadana en Telegram y confirmación de reapertura por FSPE."},
    {"id": 2, "titulo": "Protocolo Preventivo en Presa de la Olla", "impacto": "Alto", "atencion": "Programada", "descripcion": "Revisión técnica de niveles pluviales con Protección Civil Municipal y Estatal."},
    {"id": 3, "titulo": "Seguimiento a Acuerdos de Puerto Interior", "impacto": "Medio", "atencion": "Estratégica", "descripcion": "Consolidación del diálogo entre Secretaría de Gobierno y representaciones laborales."}
  ]',
  'ALERTA',
  NOW()
) ON CONFLICT DO NOTHING;
