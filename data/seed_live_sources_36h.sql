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
('77777777-7777-7777-7777-777777777724', '11111111-1111-1111-1111-111111111111', 'social', '@CIAS_Queretaro', 'Centro de Información y Análisis para la Seguridad (CIAS)', 'oficial', true),
('77777777-7777-7777-7777-777777777725', '11111111-1111-1111-1111-111111111111', 'api_federal', 'PC_Estatal_QRO', 'Coordinación Estatal de Protección Civil Querétaro', 'oficial', true),
('77777777-7777-7777-7777-777777777726', '11111111-1111-1111-1111-111111111111', 'api_federal', 'CEA_Queretaro', 'Comisión Estatal de Aguas Querétaro (CEA)', 'oficial', true),
('77777777-7777-7777-7777-777777777727', '11111111-1111-1111-1111-111111111111', 'social', '@RadarQueretaro', 'Radar Informativo & Clúster Querétaro', 'verificado', true)
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
),
-- RAW EVENTS PARA QUERÉTARO (Clave INEGI 22, Últimas 36 Horas)
(
  '99999999-0000-0000-0000-000000000021',
  '77777777-7777-7777-7777-777777777722',
  '11111111-1111-1111-1111-111111111111',
  '⚠️ #Paseo5DeFebrero [Telegram @AlertaQroVial] Tráiler averiado bloquea 2 carriles centrales a la altura de Av. Zaragoza dirección sur. Carga vehicular pesada desde La Obrera. Elementos de PoEs y auxilio vial abanderan zona.',
  NOW() - INTERVAL '50 minutes'
),
(
  '99999999-0000-0000-0000-000000000022',
  '77777777-7777-7777-7777-777777777723',
  '11111111-1111-1111-1111-111111111111',
  '🛡️ COMUNICADO OFICIAL [@POES_Qro en X]: Despliegue permanente del Operativo Escudo Centro en Autopista 57 tramo Querétaro - San Juan del Río. Filtros aleatorios de inspección preventiva operando sin novedades. Se reporta circulación continua.',
  NOW() - INTERVAL '2 hours'
),
(
  '99999999-0000-0000-0000-000000000023',
  '77777777-7777-7777-7777-777777777725',
  '11111111-1111-1111-1111-111111111111',
  '🌧️ REPORTE PREVENTIVO [PC_Estatal_QRO]: Coordinación Estatal de Protección Civil y Bomberos de El Marqués concluyen supervisión preventiva de bordos y drenes pluviales en zona de La Pradera y Zibatá tras chubascos nocturnos. Niveles al 40%, sin riesgos.',
  NOW() - INTERVAL '3 hours 40 minutes'
),
(
  '99999999-0000-0000-0000-000000000024',
  '77777777-7777-7777-7777-777777777724',
  '11111111-1111-1111-1111-111111111111',
  '🚨 [@CIAS_Queretaro en X]: Centro de Información y Análisis para la Seguridad (CQ-CIAS) coordinó con Policía Municipal de Corregidora cerco virtual por detección de placa con reporte vigente en Libramiento Surponiente. 1 unidad asegurada y conductor puesto a disposición.',
  NOW() - INTERVAL '7 hours 15 minutes'
),
(
  '99999999-0000-0000-0000-000000000025',
  '77777777-7777-7777-7777-777777777721',
  '11111111-1111-1111-1111-111111111111',
  '🔴 #SierraGorda [Telegram @NoticiasQueretaroHoy] Cuadrillas de la Comisión Estatal de Infraestructura (CEI) retiraron desprendimiento rocoso menor en carretera Jalpan - Pinal de Amoles km 138. Tránsito reabierto en ambos sentidos.',
  NOW() - INTERVAL '14 hours'
),
(
  '99999999-0000-0000-0000-000000000026',
  '77777777-7777-7777-7777-777777777726',
  '11111111-1111-1111-1111-111111111111',
  '💧 BOLETÍN CEA [CEA_Queretaro]: Comisión Estatal de Aguas informa avance del 82% en obras de interconexión del Acuaférico y monitoreo del Sistema Batán Agua para Todos. Suministro garantizado en la Zona Metropolitana.',
  NOW() - INTERVAL '19 hours'
),
(
  '99999999-0000-0000-0000-000000000027',
  '77777777-7777-7777-7777-777777777727',
  '11111111-1111-1111-1111-111111111111',
  '📢 [@RadarQueretaro en X]: Clúster Aeronáutico y SEDESU anuncian firma de convenio para centro de innovación y certificación aeroespacial en Parque Aeroespacial Colón. Inversión inicial de 45 MDD y 600 empleos directos.',
  NOW() - INTERVAL '26 hours'
),
(
  '99999999-0000-0000-0000-000000000028',
  '77777777-7777-7777-7777-777777777725',
  '11111111-1111-1111-1111-111111111111',
  '📊 INFORME ESTATAL [PC_Estatal_QRO]: Monitoreo hidrometeorológico de los 26 cuerpos de agua principales en Querétaro: Presa Jalpan 85%, Presa San Ildefonso 62%, Presa Constitución de 1917 58%. Estabilidad hídrica en cuencas.',
  NOW() - INTERVAL '31 hours'
)
ON CONFLICT (id) DO UPDATE SET raw_text = EXCLUDED.raw_text;

-- 4. EVENTOS PROCESADOS ASOCIADOS A FUENTES Y TEXTOS CRUDOS (GUANAJUATO Y QUERÉTARO, ÚLTIMAS 36H)
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
),
-- EVENTOS PARA QUERÉTARO (Clave INEGI 22, Últimas 36 Horas)
(
  '88888888-0000-0000-0000-000000000021',
  '11111111-1111-1111-1111-111111111111',
  '77777777-7777-7777-7777-777777777722',
  '99999999-0000-0000-0000-000000000021',
  'seguridad',
  'critico',
  'Incidente de Tráfico Mayor y Cierre Parcial en Paseo 5 de Febrero',
  'Unidad de carga averiada genera reducción a un carril central en el cruce con Av. Zaragoza.',
  'Detección en tiempo real vía Telegram 18 minutos antes del despacho vial de PoEs. Abanderamiento oportuno.',
  8,
  'Paseo 5 de Febrero y Av. Zaragoza',
  20.5888,
  -100.3899,
  'Santiago de Querétaro',
  'escalado',
  NOW() - INTERVAL '50 minutes'
),
(
  '88888888-0000-0000-0000-000000000022',
  '11111111-1111-1111-1111-111111111111',
  '77777777-7777-7777-7777-777777777723',
  '99999999-0000-0000-0000-000000000022',
  'seguridad',
  'alto',
  'Blindaje Territorial Operativo Escudo Centro en Autopista 57',
  'Filtros de control e inspección preventiva desplegados por Policía Estatal en tramo San Juan del Río.',
  'Acción coordinada de disuasión interinstitucional. Saldo blanco sin detenciones de alto impacto.',
  7,
  'Autopista México - Querétaro (57) KM 160',
  20.3889,
  -99.9961,
  'San Juan del Río',
  'revisado',
  NOW() - INTERVAL '2 hours'
),
(
  '88888888-0000-0000-0000-000000000023',
  '11111111-1111-1111-1111-111111111111',
  '77777777-7777-7777-7777-777777777725',
  '99999999-0000-0000-0000-000000000023',
  'proteccion_civil',
  'medio',
  'Supervisión y Balance de Drenes Pluviales en Zona La Pradera y Zibatá',
  'Inspección de cauces pluviales por Protección Civil El Marqués tras chubascos locales.',
  'Capacidad operativa al 40%. Sin reporte de encharcamientos mayores en áreas residenciales e industriales.',
  6,
  'Corredor La Pradera - Zibatá',
  20.6550,
  -100.3320,
  'El Marqués',
  'revisado',
  NOW() - INTERVAL '3 hours 40 minutes'
),
(
  '88888888-0000-0000-0000-000000000024',
  '11111111-1111-1111-1111-111111111111',
  '77777777-7777-7777-7777-777777777724',
  '99999999-0000-0000-0000-000000000024',
  'seguridad',
  'alto',
  'Cerco Virtual Efectivo y Aseguramiento Vehicular en Libramiento Surponiente',
  'Sistema de cámaras LPR del CQ-CIAS detectó vehículo foráneo con reporte y guió patrullas de Corregidora.',
  'Respuesta de intercepción en 4 minutos. Demostración de efectividad del sistema de videovigilancia estatal.',
  8,
  'Libramiento Surponiente KM 12',
  20.5310,
  -100.4430,
  'Corregidora',
  'revisado',
  NOW() - INTERVAL '7 hours 15 minutes'
),
(
  '88888888-0000-0000-0000-000000000025',
  '11111111-1111-1111-1111-111111111111',
  '77777777-7777-7777-7777-777777777721',
  '99999999-0000-0000-0000-000000000025',
  'proteccion_civil',
  'medio',
  'Despeje Vial y Retiro de Material Rocoso en Carretera Serrana Jalpan',
  'Cuadrillas de la CEI atendieron reporte de rodamiento menor en tramo Jalpan - Pinal de Amoles.',
  'Afectación temporal resuelta sin víctimas ni daños a vehículos.',
  5,
  'Carretera Federal 120 KM 138',
  21.2180,
  -99.4710,
  'Jalpan de Serra',
  'revisado',
  NOW() - INTERVAL '14 hours'
),
(
  '88888888-0000-0000-0000-000000000026',
  '11111111-1111-1111-1111-111111111111',
  '77777777-7777-7777-7777-777777777726',
  '99999999-0000-0000-0000-000000000026',
  'politico',
  'medio',
  'Monitoreo y Avance Técnico del Proyecto Hídrico Sistema El Batán',
  'Comisión Estatal de Aguas reporta 82% en obras de refuerzo de red hidráulica metropolitana.',
  'Gobernabilidad sustentable garantizada. Fortalecimiento de la narrativa de certeza hídrica para el estado.',
  7,
  'Presa El Batán y Planta Potabilizadora',
  20.5050,
  -100.4120,
  'Corregidora',
  'revisado',
  NOW() - INTERVAL '19 hours'
),
(
  '88888888-0000-0000-0000-000000000027',
  '11111111-1111-1111-1111-111111111111',
  '77777777-7777-7777-7777-777777777727',
  '99999999-0000-0000-0000-000000000027',
  'economia',
  'informativo',
  'Inversión Estratégica de 45 MDD para Innovación Aeroespacial en Colón',
  'SEDESU y Clúster Aeronáutico consolidan centro de ingeniería avanzada con 600 plazas.',
  'Impacto positivo directo en atracción de inversión de alta tecnología en el corredor del AIQ.',
  6,
  'Parque Aeroespacial Querétaro, Colón',
  20.6180,
  -100.1870,
  'Colón',
  'revisado',
  NOW() - INTERVAL '26 hours'
),
(
  '88888888-0000-0000-0000-000000000028',
  '11111111-1111-1111-1111-111111111111',
  '77777777-7777-7777-7777-777777777725',
  '99999999-0000-0000-0000-000000000028',
  'proteccion_civil',
  'informativo',
  'Estabilidad Hidrológica General en las 26 Presas de Querétaro',
  'Protección Civil Estatal reporta niveles seguros entre 58% y 85% tras monitoreo serrano y semidesierto.',
  'Monitoreo preventivo rutinario sin riesgo para zonas pobladas en cuencas de Querétaro.',
  4,
  'Presa Jalpan y Presa San Ildefonso',
  20.1500,
  -100.0200,
  'Amealco de Bonfil',
  'revisado',
  NOW() - INTERVAL '31 hours'
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
-- 5.1 GUANAJUATO (Clave INEGI 11)
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

-- 5.2 QUERÉTARO (Clave INEGI 22)
INSERT INTO cabinet_snapshots (state_id, semaforos, key_points, alert_level, created_at) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '{
    "seguridad": {"nivel": "OPERACIÓN NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Filtros Escudo Centro activos en Autopista 57; cerco virtual CIAS efectivo."},
    "proteccion_civil": {"nivel": "VIGILANCIA", "color": "warning", "tendencia": "estable", "mensaje": "Monitoreo preventivo de drenes en El Marqués; presas al 68% de capacidad media."},
    "gobernabilidad": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Convenio aeroespacial en Colón y consenso interinstitucional en Sistema Batán."},
    "salud": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Red hospitalaria SESEQ con 96% de suficiencia de insumos y atención regular."},
    "finanzas": {"nivel": "NORMAL", "color": "success", "tendencia": "estable", "mensaje": "Disciplina financiera y avance de obras de Paseo 5 de Febrero en orden."}
  }',
  '[
    {"id": 1, "titulo": "Fluidez y Control en Paseo 5 de Febrero", "impacto": "Alto", "atencion": "Inmediata", "descripcion": "Intervención ágil tras avería vehicular con auxilio de PoEs y movilidad."},
    {"id": 2, "titulo": "Despliegue Escudo Centro en Autopista 57", "impacto": "Alto", "atencion": "Programada", "descripcion": "Blindaje preventivo en límites con Edomex y San Juan del Río en coordinación con GN."},
    {"id": 3, "titulo": "Consolidación Hídrica Sistema Batán", "impacto": "Medio", "atencion": "Estratégica", "descripcion": "Avance del 82% en redes de interconexión metropolitana con CEA y CONAGUA."}
  ]',
  'VERDE',
  NOW()
) ON CONFLICT DO NOTHING;
