-- =============================================================================
-- UrbanWatch — Seed Inicial de Colonias CDMX, Actores, Fuentes e Histórico 2016–2026
-- =============================================================================

-- 1. Colonias representativas en las 16 Alcaldías de CDMX (con polígonos GeoJSON reales)
INSERT INTO uwi_colonias (id, cve_colonia, nombre, alcaldia, cve_alcaldia, polygon, centroid_lat, centroid_lng, poblacion, nivel_riesgo)
VALUES
  (
    '11111111-0001-4000-a000-000000000001',
    '06-033',
    'MORELOS (TEPITO)',
    'Cuauhtémoc',
    '006',
    '{"type":"Polygon","coordinates":[[[-99.1325,19.4420],[-99.1195,19.4420],[-99.1195,19.4525],[-99.1325,19.4525],[-99.1325,19.4420]]]}'::jsonb,
    19.4472, -99.1260, 36850, 'critico'
  ),
  (
    '11111111-0002-4000-a000-000000000002',
    '06-009',
    'CENTRO HISTÓRICO',
    'Cuauhtémoc',
    '006',
    '{"type":"Polygon","coordinates":[[[-99.1460,19.4250],[-99.1240,19.4250],[-99.1240,19.4420],[-99.1460,19.4420],[-99.1460,19.4250]]]}'::jsonb,
    19.4335, -99.1350, 61200, 'critico'
  ),
  (
    '11111111-0003-4000-a000-000000000003',
    '06-014',
    'DOCTORES',
    'Cuauhtémoc',
    '006',
    '{"type":"Polygon","coordinates":[[[-99.1540,19.4100],[-99.1390,19.4100],[-99.1390,19.4250],[-99.1540,19.4250],[-99.1540,19.4100]]]}'::jsonb,
    19.4175, -99.1465, 44700, 'alto'
  ),
  (
    '11111111-0004-4000-a000-000000000004',
    '06-021',
    'GUERRERO',
    'Cuauhtémoc',
    '006',
    '{"type":"Polygon","coordinates":[[[-99.1510,19.4400],[-99.1360,19.4400],[-99.1360,19.4530],[-99.1510,19.4530],[-99.1510,19.4400]]]}'::jsonb,
    19.4465, -99.1435, 42100, 'critico'
  ),
  (
    '11111111-0005-4000-a000-000000000005',
    '06-047',
    'ROMA NORTE',
    'Cuauhtémoc',
    '006',
    '{"type":"Polygon","coordinates":[[[-99.1720,19.4130],[-99.1540,19.4130],[-99.1540,19.4250],[-99.1720,19.4250],[-99.1720,19.4130]]]}'::jsonb,
    19.4190, -99.1630, 29800, 'medio'
  ),
  (
    '11111111-0006-4000-a000-000000000006',
    '06-011',
    'CONDESA',
    'Cuauhtémoc',
    '006',
    '{"type":"Polygon","coordinates":[[[-99.1820,19.4080],[-99.1700,19.4080],[-99.1700,19.4190],[-99.1820,19.4190],[-99.1820,19.4080]]]}'::jsonb,
    19.4135, -99.1760, 18900, 'medio'
  ),
  (
    '11111111-0007-4000-a000-000000000007',
    '07-054',
    'DESARROLLO URBANO QUETZALCÓATL',
    'Iztapalapa',
    '007',
    '{"type":"Polygon","coordinates":[[[-99.0520,19.3180],[-99.0280,19.3180],[-99.0280,19.3380],[-99.0520,19.3380],[-99.0520,19.3180]]]}'::jsonb,
    19.3280, -99.0400, 68400, 'critico'
  ),
  (
    '11111111-0008-4000-a000-000000000008',
    '07-022',
    'CENTRAL DE ABASTO',
    'Iztapalapa',
    '007',
    '{"type":"Polygon","coordinates":[[[-99.1020,19.3660],[-99.0800,19.3660],[-99.0800,19.3830],[-99.1020,19.3830],[-99.1020,19.3660]]]}'::jsonb,
    19.3745, -99.0910, 15200, 'critico'
  ),
  (
    '11111111-0009-4000-a000-000000000009',
    '07-189',
    'SANTA CRUZ MEYEHUALCO',
    'Iztapalapa',
    '007',
    '{"type":"Polygon","coordinates":[[[-99.0500,19.3380],[-99.0260,19.3380],[-99.0260,19.3550],[-99.0500,19.3550],[-99.0500,19.3380]]]}'::jsonb,
    19.3465, -99.0380, 52100, 'alto'
  ),
  (
    '11111111-0010-4000-a000-000000000010',
    '05-032',
    'CUAUTEPEC DE MADERO',
    'Gustavo A. Madero',
    '005',
    '{"type":"Polygon","coordinates":[[[-99.1520,19.5280],[-99.1260,19.5280],[-99.1260,19.5550],[-99.1520,19.5550],[-99.1520,19.5280]]]}'::jsonb,
    19.5415, -99.1390, 49200, 'critico'
  ),
  (
    '11111111-0011-4000-a000-000000000011',
    '05-081',
    'LINDAVISTA',
    'Gustavo A. Madero',
    '005',
    '{"type":"Polygon","coordinates":[[[-99.1420,19.4830],[-99.1210,19.4830],[-99.1210,19.5010],[-99.1420,19.5010],[-99.1420,19.4830]]]}'::jsonb,
    19.4920, -99.1315, 31400, 'medio'
  ),
  (
    '11111111-0012-4000-a000-000000000012',
    '16-052',
    'POLANCO SECCIÓN III',
    'Miguel Hidalgo',
    '016',
    '{"type":"Polygon","coordinates":[[[-99.2060,19.4260],[-99.1860,19.4260],[-99.1860,19.4390],[-99.2060,19.4390],[-99.2060,19.4260]]]}'::jsonb,
    19.4325, -99.1960, 27800, 'medio'
  ),
  (
    '11111111-0013-4000-a000-000000000013',
    '16-071',
    'TACUBAYA',
    'Miguel Hidalgo',
    '016',
    '{"type":"Polygon","coordinates":[[[-99.1950,19.3960],[-99.1800,19.3960],[-99.1800,19.4080],[-99.1950,19.4080],[-99.1950,19.3960]]]}'::jsonb,
    19.4020, -99.1875, 24900, 'alto'
  ),
  (
    '11111111-0014-4000-a000-000000000014',
    '14-017',
    'DEL VALLE CENTRO',
    'Benito Juárez',
    '014',
    '{"type":"Polygon","coordinates":[[[-99.1760,19.3720],[-99.1580,19.3720],[-99.1580,19.3910],[-99.1760,19.3910],[-99.1760,19.3720]]]}'::jsonb,
    19.3815, -99.1670, 56300, 'bajo'
  ),
  (
    '11111111-0015-4000-a000-000000000015',
    '14-035',
    'NARVARTE PONIENTE',
    'Benito Juárez',
    '014',
    '{"type":"Polygon","coordinates":[[[-99.1640,19.3910],[-99.1480,19.3910],[-99.1480,19.4040],[-99.1640,19.4040],[-99.1640,19.3910]]]}'::jsonb,
    19.3975, -99.1560, 38100, 'medio'
  ),
  (
    '11111111-0016-4000-a000-000000000016',
    '03-064',
    'PEDREGAL DE SANTO DOMINGO',
    'Coyoacán',
    '003',
    '{"type":"Polygon","coordinates":[[[-99.1740,19.3180],[-99.1520,19.3180],[-99.1520,19.3360],[-99.1740,19.3360],[-99.1740,19.3180]]]}'::jsonb,
    19.3270, -99.1630, 74500, 'alto'
  ),
  (
    '11111111-0017-4000-a000-000000000017',
    '12-088',
    'SAN MIGUEL TOPILEJO',
    'Tlalpan',
    '012',
    '{"type":"Polygon","coordinates":[[[-99.1550,19.1900],[-99.1250,19.1900],[-99.1250,19.2180],[-99.1550,19.2180],[-99.1550,19.1900]]]}'::jsonb,
    19.2040, -99.1400, 34200, 'critico'
  ),
  (
    '11111111-0018-4000-a000-000000000018',
    '10-112',
    'SANTA FE',
    'Álvaro Obregón',
    '010',
    '{"type":"Polygon","coordinates":[[[-99.2720,19.3540],[-99.2420,19.3540],[-99.2420,19.3760],[-99.2720,19.3760],[-99.2720,19.3540]]]}'::jsonb,
    19.3650, -99.2570, 31900, 'bajo'
  ),
  (
    '11111111-0019-4000-a000-000000000019',
    '17-042',
    'MERCED BALBUENA',
    'Venustiano Carranza',
    '017',
    '{"type":"Polygon","coordinates":[[[-99.1240,19.4160],[-99.1080,19.4160],[-99.1080,19.4290],[-99.1240,19.4290],[-99.1240,19.4160]]]}'::jsonb,
    19.4225, -99.1160, 29400, 'alto'
  ),
  (
    '11111111-0020-4000-a000-000000000020',
    '11-029',
    'LA CONCHITA ZAPOTITLÁN',
    'Tláhuac',
    '011',
    '{"type":"Polygon","coordinates":[[[-99.0350,19.2880],[-99.0100,19.2880],[-99.0100,19.3080],[-99.0350,19.3080],[-99.0350,19.2880]]]}'::jsonb,
    19.2980, -99.0225, 38700, 'alto'
  ),
  (
    '11111111-0021-4000-a000-000000000021',
    '13-041',
    'SAN GREGORIO ATLAPULCO',
    'Xochimilco',
    '013',
    '{"type":"Polygon","coordinates":[[[-99.0680,19.2450],[-99.0420,19.2450],[-99.0420,19.2650],[-99.0680,19.2650],[-99.0680,19.2450]]]}'::jsonb,
    19.2550, -99.0550, 32500, 'alto'
  ),
  (
    '11111111-0022-4000-a000-000000000022',
    '02-018',
    'INDUSTRIAL VALLEJO',
    'Azcapotzalco',
    '002',
    '{"type":"Polygon","coordinates":[[[-99.1750,19.4820],[-99.1520,19.4820],[-99.1520,19.5040],[-99.1750,19.5040],[-99.1750,19.4820]]]}'::jsonb,
    19.4930, -99.1635, 19800, 'medio'
  ),
  (
    '11111111-0023-4000-a000-000000000023',
    '08-011',
    'AGRÍCOLA ORIENTAL',
    'Iztacalco',
    '008',
    '{"type":"Polygon","coordinates":[[[-99.0820,19.3920],[-99.0580,19.3920],[-99.0580,19.4120],[-99.0820,19.4120],[-99.0820,19.3920]]]}'::jsonb,
    19.4020, -99.0700, 81200, 'alto'
  ),
  (
    '11111111-0024-4000-a000-000000000024',
    '04-009',
    'CONTADERO',
    'Cuajimalpa de Morelos',
    '004',
    '{"type":"Polygon","coordinates":[[[-99.3020,19.3450],[-99.2750,19.3450],[-99.2750,19.3650],[-99.3020,19.3650],[-99.3020,19.3450]]]}'::jsonb,
    19.3550, -99.2885, 22400, 'bajo'
  ),
  (
    '11111111-0025-4000-a000-000000000025',
    '09-015',
    'SAN BERNABÉ OCOTEPEC',
    'La Magdalena Contreras',
    '009',
    '{"type":"Polygon","coordinates":[[[-99.2620,19.3050],[-99.2380,19.3050],[-99.2380,19.3250],[-99.2620,19.3250],[-99.2620,19.3050]]]}'::jsonb,
    19.3150, -99.2500, 29100, 'medio'
  ),
  (
    '11111111-0026-4000-a000-000000000026',
    '15-004',
    'VILLA MILPA ALTA',
    'Milpa Alta',
    '015',
    '{"type":"Polygon","coordinates":[[[-99.0350,19.1850],[-99.0100,19.1850],[-99.0100,19.2050],[-99.0350,19.2050],[-99.0350,19.1850]]]}'::jsonb,
    19.1950, -99.0225, 21300, 'bajo'
  )
ON CONFLICT (cve_colonia) DO NOTHING;

-- Sincronizar columna geom PostGIS desde polygon JSONB
UPDATE uwi_colonias
SET geom = ST_SetSRID(ST_GeomFromGeoJSON(polygon::text), 4326)
WHERE geom IS NULL;

-- 2. Fuentes registradas (R2: selección de motor + R4: niveles de confidencialidad)
INSERT INTO uwi_sources (id, nombre, tipo, url, browser_engine, nivel_conf, activo, last_checked)
VALUES
  ('22222222-0001-4000-a000-000000000001', 'E-Medios Monitoreo CDMX', 'emedios', 'https://www.e-medios.com', 'lightpanda', 'publico', true, NOW() - INTERVAL '1 hour'),
  ('22222222-0002-4000-a000-000000000002', 'Portal Datos Abiertos FGJ / SSC-CDMX', 'oficial', 'https://datos.cdmx.gob.mx', 'none', 'publico', true, NOW() - INTERVAL '3 hours'),
  ('22222222-0003-4000-a000-000000000003', 'Canal Telegram Denuncia Ciudadana CDMX (ARGOS)', 'telegram', 'https://t.me/s/c4jimenez_alertas', 'playwright', 'sensible', true, NOW() - INTERVAL '20 minutes'),
  ('22222222-0004-4000-a000-000000000004', 'Vigía DarkWeb — Foro Clandestino Tepito/Mercados', 'darkweb', 'http://cdmxplaza7x4onion.onion/threads', 'headlessx', 'reservado', true, NOW() - INTERVAL '2 hours'),
  ('22222222-0005-4000-a000-000000000005', 'Carga Manual de Informes Operativos (Word/PDF)', 'manual_word', NULL, 'none', 'publico', true, NOW() - INTERVAL '30 minutes'),
  ('22222222-0006-4000-a000-000000000006', 'OSINT Ciber-Exposición .cdmx.gob.mx', 'osint', 'https://ahmia.fi/search/?q=cdmx', 'headlessx', 'sensible', true, NOW() - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;

-- 3. Actores criminales en CDMX (para grafo Cytoscape.js)
INSERT INTO uwi_actores (id, nombre, aliases, tipo, colonias_activas, nivel_amenaza, descripcion, fuente_primera)
VALUES
  (
    '33333333-0001-4000-a000-000000000001',
    'Unión Tepito',
    ARRAY['La Unión', 'La U', 'Cártel de Tepito'],
    'cartel',
    ARRAY[
      '11111111-0001-4000-a000-000000000001'::uuid,
      '11111111-0002-4000-a000-000000000002'::uuid,
      '11111111-0004-4000-a000-000000000004'::uuid,
      '11111111-0005-4000-a000-000000000005'::uuid,
      '11111111-0006-4000-a000-000000000006'::uuid,
      '11111111-0012-4000-a000-000000000012'::uuid
    ],
    10,
    'Principal organización generadora de violencia en la zona centro y corredor Roma-Condesa-Polanco. Dedicada a extorsión (cobro de piso a comercios y centros nocturnos), narcomenudeo, secuestro exprés y homicidio.',
    'Reportes SSC-CDMX / E-Medios 2016-2026'
  ),
  (
    '33333333-0002-4000-a000-000000000002',
    'Fuerza Anti-Unión',
    ARRAY['Anti-Unión Tepito', 'La Rosa Nueva'],
    'cartel',
    ARRAY[
      '11111111-0004-4000-a000-000000000004'::uuid,
      '11111111-0002-4000-a000-000000000002'::uuid,
      '11111111-0019-4000-a000-000000000019'::uuid
    ],
    9,
    'Grupo antagónico directo de la Unión Tepito con fuerte presencia en Colonia Guerrero, Garibaldi, Centro Histórico y Venustiano Carranza.',
    'E-Medios / Inteligencia Policial CDMX'
  ),
  (
    '33333333-0003-4000-a000-000000000003',
    'CJNG (Célula Metropolitana)',
    ARRAY['Cártel Jalisco Nueva Generación CDMX', 'Las Cuatro Letras'],
    'cartel',
    ARRAY[
      '11111111-0010-4000-a000-000000000010'::uuid,
      '11111111-0007-4000-a000-000000000007'::uuid,
      '11111111-0017-4000-a000-000000000017'::uuid,
      '11111111-0012-4000-a000-000000000012'::uuid
    ],
    10,
    'Células operativas y alianzas con bandas locales en Gustavo A. Madero, Iztapalapa y corredor sur (Tlalpan). Suministro de armamento y trasiego.',
    'Informes Federales / Vigía DarkWeb'
  ),
  (
    '33333333-0004-4000-a000-000000000004',
    'Cártel de Tláhuac',
    ARRAY['Red de El Ojos', 'Célula Zapotitlán'],
    'cartel',
    ARRAY[
      '11111111-0020-4000-a000-000000000020'::uuid,
      '11111111-0007-4000-a000-000000000007'::uuid,
      '11111111-0021-4000-a000-000000000021'::uuid
    ],
    8,
    'Organización con control territorial en Tláhuac, oriente de Iztapalapa y zonas colindantes de Xochimilco.',
    'Histórico SSC-CDMX 2017-2026'
  ),
  (
    '33333333-0005-4000-a000-000000000005',
    'Los Rodolfos',
    ARRAY['Banda de Xochimilco-Tlalpan'],
    'banda_local',
    ARRAY[
      '11111111-0021-4000-a000-000000000021'::uuid,
      '11111111-0017-4000-a000-000000000017'::uuid,
      '11111111-0016-4000-a000-000000000016'::uuid
    ],
    8,
    'Grupo dedicado a extorsión de transporte público, tala clandestina y narcomenudeo en Xochimilco, Tlalpan y Coyoacán.',
    'E-Medios / FGJ-CDMX'
  ),
  (
    '33333333-0006-4000-a000-000000000006',
    'Los Tanzanios',
    ARRAY['Célula Oriente Iztapalapa-Iztacalco'],
    'banda_local',
    ARRAY[
      '11111111-0008-4000-a000-000000000008'::uuid,
      '11111111-0009-4000-a000-000000000009'::uuid,
      '11111111-0023-4000-a000-000000000023'::uuid
    ],
    8,
    'Banda activa en extorsión a transportistas y comerciantes en Central de Abasto, Santa Cruz Meyehualco y Agrícola Oriental.',
    'FGJ-CDMX / E-Medios'
  ),
  (
    '33333333-0007-4000-a000-000000000007',
    'Lenin Canchola / Malcriados 3AD',
    ARRAY['3AD', 'Tercera Acción Destructiva'],
    'banda_local',
    ARRAY[
      '11111111-0013-4000-a000-000000000013'::uuid,
      '11111111-0018-4000-a000-000000000018'::uuid,
      '11111111-0024-4000-a000-000000000024'::uuid
    ],
    8,
    'Estructura criminal en el poniente de CDMX (Álvaro Obregón, Cuajimalpa y Miguel Hidalgo) vinculada a cobro de piso a constructoras y comercios.',
    'Reportes de Inteligencia Poniente CDMX'
  )
ON CONFLICT (nombre) DO NOTHING;

-- 4. Incidentes históricos (2016-2025) y operativos (2026) — R3: fecha_incidente separada de created_at
INSERT INTO uwi_incidentes (
  colonia_id, alcaldia, tipo_incidente, subtipo, fuente_tipo, fuente_id, fuente_nombre,
  titulo, descripcion, fecha_incidente, hora_incidente, lat, lng, ubicacion_texto,
  nivel_conf, severidad, verificado, actores, victimas_count
)
VALUES
  -- 2016
  ('11111111-0001-4000-a000-000000000001', 'Cuauhtémoc', 'extorsion', 'Cobro de piso a locatarios', 'oficial', '22222222-0002-4000-a000-000000000002', 'Portal Datos Abiertos FGJ / SSC-CDMX',
   'Denuncia colectiva por cobro de piso en Eje 1 Norte', 'Comerciantes del corredor Eje 1 Norte y Jesús Carranza reportan exigencias semanales en efectivo bajo amenaza de incendio de puestos.',
   '2016-05-14', '14:20:00', 19.4468, -99.1271, 'Eje 1 Norte esq. Jesús Carranza, Col. Morelos', 'publico', 8, true, ARRAY['Unión Tepito'], 3),
  ('11111111-0003-4000-a000-000000000003', 'Cuauhtémoc', 'robo_vehiculo', 'Robo de autopartes y vehículo con violencia', 'oficial', '22222222-0002-4000-a000-000000000002', 'Portal Datos Abiertos FGJ / SSC-CDMX',
   'Desmantelamiento de bodega de autopartes robadas en Doctores', 'Operativo en inmediaciones de Dr. Vértiz asegura tres vehículos con reporte de robo activo.',
   '2016-10-22', '03:40:00', 19.4182, -99.1455, 'Dr. Barragán y Dr. Jiménez, Col. Doctores', 'publico', 6, true, ARRAY[]::text[], 1),

  -- 2017
  ('11111111-0020-4000-a000-000000000020', 'Tláhuac', 'presencia_criminal', 'Bloqueos y enfrentamiento armado', 'emedios', '22222222-0001-4000-a000-000000000001', 'E-Medios Monitoreo CDMX',
   'Operativo federal y narcobloqueos en Tláhuac', 'Fuerzas federales abaten a líder regional; células realizan bloqueos con unidades de transporte en Av. Tláhuac.',
   '2017-07-20', '13:15:00', 19.2985, -99.0218, 'Av. Tláhuac, Col. La Conchita Zapotitlán', 'publico', 10, true, ARRAY['Cártel de Tláhuac'], 8),
  ('11111111-0001-4000-a000-000000000001', 'Cuauhtémoc', 'homicidio', 'Ejecución directa por disputa de plaza', 'emedios', '22222222-0001-4000-a000-000000000001', 'E-Medios Monitoreo CDMX',
   'Ataque armado en calle Peralvillo deja dos fallecidos', 'Sujetos en motocicleta disparan de forma directa contra punto de venta en calle Peralvillo.',
   '2017-11-08', '22:10:00', 19.4485, -99.1252, 'Calle Peralvillo 55, Col. Morelos', 'publico', 9, true, ARRAY['Unión Tepito', 'Fuerza Anti-Unión'], 2),

  -- 2018
  ('11111111-0004-4000-a000-000000000004', 'Cuauhtémoc', 'homicidio', 'Ataque armado múltiple en Plaza Garibaldi', 'emedios', '22222222-0001-4000-a000-000000000001', 'E-Medios Monitoreo CDMX',
   'Comando armado perpetra ataque en inmediaciones de Garibaldi', 'Agresores vestidos de mariachi abren fuego contra integrantes de grupo rival en límite de Centro y Guerrero.',
   '2018-09-14', '21:50:00', 19.4408, -99.1392, 'Plaza Garibaldi / Honduras, Col. Guerrero', 'publico', 10, true, ARRAY['Unión Tepito', 'Fuerza Anti-Unión'], 6),
  ('11111111-0005-4000-a000-000000000005', 'Cuauhtémoc', 'extorsion', 'Cobro de piso a bares y restaurantes', 'emedios', '22222222-0001-4000-a000-000000000001', 'E-Medios Monitoreo CDMX',
   'Empresarios gastronómicos de Roma-Condesa denuncian extorsión sistemática', 'Células de cobro exigen cuotas mensuales de hasta 50 mil pesos por establecimiento en Álvaro Obregón y Orizaba.',
   '2018-04-19', '19:00:00', 19.4188, -99.1618, 'Av. Álvaro Obregón, Col. Roma Norte', 'publico', 8, true, ARRAY['Unión Tepito'], 4),

  -- 2019
  ('11111111-0001-4000-a000-000000000001', 'Cuauhtémoc', 'narcomenudeo', 'Cateo de túneles y laboratorio en Peralvillo 33', 'oficial', '22222222-0002-4000-a000-000000000002', 'Portal Datos Abiertos FGJ / SSC-CDMX',
   'Macrooperativo en vecindad de Peralvillo 33 asegura arsenal y narcóticos', 'Autoridades aseguran bodegas subterráneas, armas largas y toneladas de precursores químicos.',
   '2019-10-22', '05:30:00', 19.4491, -99.1280, 'Jesús Carranza y Peralvillo 33, Col. Morelos', 'publico', 10, true, ARRAY['Unión Tepito'], 0),
  ('11111111-0012-4000-a000-000000000012', 'Miguel Hidalgo', 'homicidio', 'Ejecución en plaza comercial de Polanco', 'emedios', '22222222-0001-4000-a000-000000000001', 'E-Medios Monitoreo CDMX',
   'Doble homicidio en restaurante de Plaza Miyana / Polanco', 'Ataque directo con armas cortas con silenciador contra objetivos vinculados a operaciones financieras ilícitas.',
   '2019-07-24', '17:15:00', 19.4368, -99.2015, 'Av. Ejército Nacional, Polanco', 'publico', 9, true, ARRAY['CJNG (Célula Metropolitana)'], 2),

  -- 2020
  ('11111111-0002-4000-a000-000000000002', 'Cuauhtémoc', 'secuestro', 'Privación ilegal y homicidio en Centro Histórico', 'oficial', '22222222-0002-4000-a000-000000000002', 'Portal Datos Abiertos FGJ / SSC-CDMX',
   'Intervención policial en República de Cuba tras reporte de secuestro', 'Detención de célula operativa dedicada a extorsión y privación ilegal de la libertad en predios del Centro Histórico.',
   '2020-11-01', '02:15:00', 19.4375, -99.1362, 'República de Cuba, Col. Centro Histórico', 'publico', 10, true, ARRAY['Unión Tepito'], 2),
  ('11111111-0010-4000-a000-000000000010', 'Gustavo A. Madero', 'homicidio', 'Balacera en zona alta de Cuautepec', 'emedios', '22222222-0001-4000-a000-000000000001', 'E-Medios Monitoreo CDMX',
   'Enfrentamiento entre grupos rivales en Cuautepec Barrio Alto', 'Disputa por puntos de distribución en la sierra de Guadalupe deja tres lesionados y dos fallecidos.',
   '2020-06-18', '23:40:00', 19.5432, -99.1381, 'Av. Venustiano Carranza, Cuautepec de Madero', 'publico', 9, true, ARRAY['CJNG (Célula Metropolitana)'], 5),

  -- 2021
  ('11111111-0007-4000-a000-000000000007', 'Iztapalapa', 'robo_transeunte', 'Asalto armado en paradero y microbús', 'oficial', '22222222-0002-4000-a000-000000000002', 'Portal Datos Abiertos FGJ / SSC-CDMX',
   'Banda de asaltantes de transporte público asegurada en Quetzalcóatl', 'Cámaras del C5 captan ruta de escape de tres sujetos armados tras asalto en Ermita Iztapalapa.',
   '2021-08-11', '06:45:00', 19.3292, -99.0394, 'Calz. Ermita Iztapalapa, Desarrollo Urbano Quetzalcóatl', 'publico', 7, true, ARRAY['Los Tanzanios'], 4),
  ('11111111-0021-4000-a000-000000000021', 'Xochimilco', 'extorsion', 'Extorsión a rutas de transporte y mercados', 'emedios', '22222222-0001-4000-a000-000000000001', 'E-Medios Monitoreo CDMX',
   'Detienen a operadores financieros de Los Rodolfos en Xochimilco', 'Operativo conjunto SSC-FGJ asegura armas de fuego, libretas de cobro de piso y dosis de narcóticos.',
   '2021-12-03', '11:20:00', 19.2561, -99.0542, 'Av. México, San Gregorio Atlapulco', 'publico', 8, true, ARRAY['Los Rodolfos'], 0),

  -- 2022
  ('11111111-0017-4000-a000-000000000017', 'Tlalpan', 'presencia_criminal', 'Enfrentamiento y casa de seguridad en Topilejo', 'oficial', '22222222-0002-4000-a000-000000000002', 'Portal Datos Abiertos FGJ / SSC-CDMX',
   'Enfrentamiento armado en carretera México-Cuernavaca km 28 (Topilejo)', 'Inteligencia de SSC-CDMX desarticula célula fortemente armada en San Miguel Topilejo; aseguran fusiles Barret .50 y rescatan a 4 víctimas de secuestro.',
   '2022-07-12', '14:30:00', 19.2052, -99.1412, 'Km 28 Carretera Federal México-Cuernavaca, San Miguel Topilejo', 'publico', 10, true, ARRAY['CJNG (Célula Metropolitana)'], 4),
  ('11111111-0013-4000-a000-000000000013', 'Miguel Hidalgo', 'extorsion', 'Cobro de piso y amenazas en zona de Tacubaya', 'emedios', '22222222-0001-4000-a000-000000000001', 'E-Medios Monitoreo CDMX',
   'Cae estructura operativa de Los Malcriados 3AD en Tacubaya', 'Exigían pagos quincenales a comerciantes del CETRAM Tacubaya y obras en construcción.',
   '2022-10-05', '16:10:00', 19.4025, -99.1870, 'Av. Jalisco esq. Parque Lira, Col. Tacubaya', 'publico', 8, true, ARRAY['Lenin Canchola / Malcriados 3AD'], 2),

  -- 2023
  ('11111111-0008-4000-a000-000000000008', 'Iztapalapa', 'extorsion', 'Extorsión a bodegueros de Central de Abasto', 'emedios', '22222222-0001-4000-a000-000000000001', 'E-Medios Monitoreo CDMX',
   'Desarticulan red de cobro de piso a distribuidores en Central de Abasto', 'Sujetos exigían cuotas por tonelada descargada en naves de frutas y legumbres bajo amenazas con arma de fuego.',
   '2023-05-19', '04:50:00', 19.3751, -99.0902, 'Pasillo I-J, Central de Abasto, Iztapalapa', 'publico', 8, true, ARRAY['Los Tanzanios'], 5),
  ('11111111-0016-4000-a000-000000000016', 'Coyoacán', 'narcomenudeo', 'Cateo de puntos de venta en Santo Domingo', 'oficial', '22222222-0002-4000-a000-000000000002', 'Portal Datos Abiertos FGJ / SSC-CDMX',
   'Tres inmuebles asegurados por narcomenudeo en Pedregal de Santo Domingo', 'Denuncias anónimas derivan en aseguramiento de 800 dosis y armas cortas en calle Papalotl.',
   '2023-09-27', '07:15:00', 19.3278, -99.1621, 'Calle Papalotl, Pedregal de Santo Domingo, Coyoacán', 'publico', 7, true, ARRAY['Los Rodolfos'], 0),

  -- 2024
  ('11111111-0002-4000-a000-000000000002', 'Cuauhtémoc', 'extorsion', 'Cobro de piso a importadores en Peña y Peña', 'emedios', '22222222-0001-4000-a000-000000000001', 'E-Medios Monitoreo CDMX',
   'Operativo contra extorsión en plazas comerciales de Peña y Peña y Izazaga', 'Comerciantes reportan bloqueo de accesos a bodegas por cobradores de la Unión Tepito.',
   '2024-03-14', '12:30:00', 19.4369, -99.1268, 'Manuel Doblado y Peña y Peña, Centro Histórico', 'publico', 9, true, ARRAY['Unión Tepito'], 3),
  ('11111111-0006-4000-a000-000000000006', 'Cuauhtémoc', 'robo_negocio', 'Robo de relojes de alta gama en terraza de Condesa', 'telegram', '22222222-0003-4000-a000-000000000003', 'Canal Telegram Denuncia Ciudadana CDMX (ARGOS)',
   'Banda dedicada al robo de relojes de lujo opera en corredor Tamaulipas-Ámsterdam', 'Dos sujetos a bordo de motocicleta de alto cilindraje amagan a comensales y huyen hacia Circuito Interior.',
   '2024-08-22', '20:15:00', 19.4128, -99.1754, 'Av. Tamaulipas esq. Michoacán, Col. Condesa', 'sensible', 7, true, ARRAY['Unión Tepito'], 2),
  ('11111111-0023-4000-a000-000000000023', 'Iztacalco', 'homicidio', 'Ataque armado en Rojo Gómez, Agrícola Oriental', 'emedios', '22222222-0001-4000-a000-000000000001', 'E-Medios Monitoreo CDMX',
   'Balacera en tianguis de Av. Javier Rojo Gómez deja detenidos y aseguramiento de armas', 'Elementos de inteligencia de SSC repelen agresión de cobradores de piso contra comerciantes.',
   '2024-01-02', '15:40:00', 19.4015, -99.0695, 'Av. Javier Rojo Gómez y Sur 16, Col. Agrícola Oriental', 'publico', 9, true, ARRAY['Los Tanzanios'], 7),

  -- 2025
  ('11111111-0001-4000-a000-000000000001', 'Cuauhtémoc', 'amenaza', 'Amenaza en foro oscuro contra empresas de custodia en Zona Centro', 'darkweb', '22222222-0004-4000-a000-000000000004', 'Vigía DarkWeb — Foro Clandestino Tepito/Mercados',
   'Filtración de rutas de traslado de mercancía y amenazas en foro .onion', 'Publicación detectada por HeadlessX ofrece datos de horarios de carga en bodegas de Eje 1 Norte y Merced.',
   '2025-05-10', '01:20:00', 19.4479, -99.1248, 'Corredor Eje 1 Norte - Aztecas, Col. Morelos', 'reservado', 9, true, ARRAY['Unión Tepito'], 0),
  ('11111111-0019-4000-a000-000000000019', 'Venustiano Carranza', 'extorsion', 'Extorsión a transportistas de carga en La Merced', 'manual_word', '22222222-0005-4000-a000-000000000005', 'Carga Manual de Informes Operativos (Word/PDF)',
   'Bitácora de seguridad privada: intercepción de unidades de reparto en Circunvalación', 'Custodios privados reportan retención ilegal de camionetas de abarrotes exigiendo pago de derecho de descarga.',
   '2025-09-18', '08:10:00', 19.4232, -99.1155, 'Anillo de Circunvalación, Merced Balbuena', 'publico', 8, true, ARRAY['Fuerza Anti-Unión'], 2),

  -- 2026 (Recientes / Operativos)
  ('11111111-0001-4000-a000-000000000001', 'Cuauhtémoc', 'extorsion', 'Cobro de piso con intimidación armada a bodegas textiles', 'emedios', '22222222-0001-4000-a000-000000000001', 'E-Medios Monitoreo CDMX',
   'Alerta operativa en Morelos: célula exige cuota extraordinaria a bodegas de importación', 'Tres sujetos a bordo de motonetas entregaron notas intimidatorias con número telefónico de contacto en calle Aztecas.',
   CURRENT_DATE - INTERVAL '2 days', '18:35:00', 19.4475, -99.1258, 'Calle Aztecas 42, Col. Morelos (Tepito)', 'publico', 9, true, ARRAY['Unión Tepito'], 1),
  ('11111111-0004-4000-a000-000000000004', 'Cuauhtémoc', 'homicidio', 'Agresión directa con arma de fuego en Eje 1 Poniente', 'telegram', '22222222-0003-4000-a000-000000000003', 'Canal Telegram Denuncia Ciudadana CDMX (ARGOS)',
   'Movilización de servicios de emergencia por disparos en calle Zarco, Col. Guerrero', 'Reporte en tiempo real vía ARGOS confirma acordonamiento policial tras ataque directo entre células antagónicas.',
   CURRENT_DATE - INTERVAL '1 day', '22:45:00', 19.4461, -99.1442, 'Calle Zarco y Magnolia, Col. Guerrero', 'sensible', 9, true, ARRAY['Fuerza Anti-Unión', 'Unión Tepito'], 1),
  ('11111111-0012-4000-a000-000000000012', 'Miguel Hidalgo', 'robo_negocio', 'Intento de intrusión a joyería y seguimiento de escoltas', 'darkweb', '22222222-0004-4000-a000-000000000004', 'Vigía DarkWeb — Foro Clandestino Tepito/Mercados',
   'Vigía detecta comercialización de placas clonadas y croquis de rutas en Polanco', 'Post indexado en foro oscuro detalla horarios de relevo de guardias privados en Av. Presidente Masaryk.',
   CURRENT_DATE, '04:15:00', 19.4322, -99.1952, 'Av. Presidente Masaryk, Polanco Sección III', 'reservado', 8, true, ARRAY['Unión Tepito', 'CJNG (Célula Metropolitana)'], 0),
  ('11111111-0007-4000-a000-000000000007', 'Iztapalapa', 'robo_vehiculo', 'Robo de unidad de carga con inhibidor GPS (Jammer)', 'oficial', '22222222-0002-4000-a000-000000000002', 'Portal Datos Abiertos FGJ / SSC-CDMX',
   'Intercepción de tractocamión con jammer activo en salida a Calz. Ignacio Zaragoza', 'C5 detecta pérdida de señal de telemetría; patrullas recuperan unidad en perímetro de Iztapalapa.',
   CURRENT_DATE - INTERVAL '3 days', '05:20:00', 19.3285, -99.0410, 'Eje 8 Sur Ermita Iztapalapa, Col. Quetzalcóatl', 'publico', 8, true, ARRAY['Los Tanzanios'], 1),
  ('11111111-0005-4000-a000-000000000005', 'Cuauhtémoc', 'extorsion', 'Intimidación a valet parking y seguridad privada nocturna', 'telegram', '22222222-0003-4000-a000-000000000003', 'Canal Telegram Denuncia Ciudadana CDMX (ARGOS)',
   'Reportan presencia de cobradores en corredor Álvaro Obregón - Insurgentes', 'Personal de seguridad privada de tres restaurantes activó botón de pánico tras amenazas verbales.',
   CURRENT_DATE, '00:40:00', 19.4192, -99.1635, 'Av. Álvaro Obregón 180, Col. Roma Norte', 'sensible', 7, true, ARRAY['Unión Tepito'], 0);

-- 5. Jobs de E-Medios de ejemplo (Lightpanda)
INSERT INTO uwi_emedios_jobs (id, fecha_inicio, fecha_fin, terminos, publicaciones, articulos_total, articulos_proc, articulos_ok, articulos_error, checkpoint, status, modo_ingesta, started_at, completed_at)
VALUES
  (
    '44444444-0001-4000-a000-000000000001',
    '2024-01-01', '2024-01-31',
    ARRAY['homicidio', 'extorsión', 'cobro de piso', 'Unión Tepito', 'balacera'],
    ARRAY['El Universal', 'La Jornada', 'Milenio', 'Excélsior', 'Reforma'],
    142, 142, 139, 3,
    '{"current_month":"2024-01-31","engine":"lightpanda","ram_mb":118}'::jsonb,
    'completo', 'historico',
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '14 minutes'
  ),
  (
    '44444444-0002-4000-a000-000000000002',
    CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE,
    ARRAY['extorsión', 'robo de vehículo', 'narcomenudeo', 'secuestro', 'CJNG'],
    ARRAY['El Universal', 'Milenio', 'Crónica', 'La Prensa'],
    48, 36, 36, 0,
    '{"current_month":"2026-10","engine":"lightpanda","ram_mb":121}'::jsonb,
    'corriendo', 'operativo',
    NOW() - INTERVAL '25 minutes', NULL
  )
ON CONFLICT (id) DO NOTHING;

-- 6. Artículos de E-Medios deduplicados con SHA-256 (R6)
INSERT INTO uwi_emedios_articulos (job_id, emedio_id, titulo, publicacion, fecha_pub, url_original, contenido_raw, hash_titulo, procesado)
VALUES
  (
    '44444444-0001-4000-a000-000000000001',
    'EM-20240102-01',
    'Balacera en tianguis de Av. Javier Rojo Gómez deja detenidos y aseguramiento de armas',
    'El Universal',
    '2024-01-02',
    'https://www.e-medios.com/notas/EM-20240102-01',
    'Elementos de inteligencia de la SSC-CDMX enfrentaron a presuntos extorsionadores vinculados a Los Tanzanios en la colonia Agrícola Oriental, alcaldía Iztacalco.',
    encode(digest('balacera en tianguis de av. javier rojo gómez deja detenidos y aseguramiento de armas|2024-01-02', 'sha256'), 'hex'),
    true
  ),
  (
    '44444444-0002-4000-a000-000000000002',
    'EM-20261026-09',
    'Alerta operativa en Morelos: célula exige cuota extraordinaria a bodegas de importación',
    'La Prensa',
    CURRENT_DATE - INTERVAL '2 days',
    'https://www.e-medios.com/notas/EM-20261026-09',
    'Comerciantes de la colonia Morelos en la alcaldía Cuauhtémoc denunciaron la entrega de mensajes intimidatorios por parte de integrantes de la Unión Tepito.',
    encode(digest('alerta operativa en morelos: célula exige cuota extraordinaria a bodegas de importación|' || (CURRENT_DATE - INTERVAL '2 days')::text, 'sha256'), 'hex'),
    true
  )
ON CONFLICT (hash_titulo) DO NOTHING;

-- 7. Sitios en la mira (Módulo Vigía — HeadlessX + PixelRAG)
INSERT INTO uwi_sitios_mira (id, url, tipo, nombre, descripcion, keywords, browser_engine, frecuencia_hrs, ultima_captura, ultimo_cambio, activo)
VALUES
  (
    '55555555-0001-4000-a000-000000000001',
    'http://cdmxplaza7x4onion.onion/threads/logistica-centro',
    'onion',
    'Foro Clandestino Logística & Mercados CDMX',
    'Foro en red Tor donde se filtran rutas de transporte de valores, placas clonadas y amenazas contra comercios en Cuauhtémoc y Miguel Hidalgo.',
    ARRAY['Unión Tepito', 'cobro de piso cdmx', 'Masaryk', 'Eje 1 Norte', 'jammer'],
    'headlessx',
    6,
    NOW() - INTERVAL '45 minutes',
    NOW() - INTERVAL '45 minutes',
    true
  ),
  (
    '55555555-0002-4000-a000-000000000002',
    'https://ahmia.fi/search/?q=cdmx+extorsion+plaza',
    'surface',
    'Monitor Ahmia — Índice Tor CDMX',
    'Rastreo continuo de nuevos dominios .onion indexados en Ahmia que mencionan colonias de CDMX o grupos criminales metropolitanos.',
    ARRAY['Unión Tepito', 'CJNG Ciudad de México', 'iztapalapa cartel', 'narcomenudeo tepito'],
    'headlessx',
    12,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '26 hours',
    true
  ),
  (
    '55555555-0003-4000-a000-000000000003',
    'http://mexmarket3v9onion.onion/listings/cdmx-credenciales',
    'marketplace',
    'DarkMarket Credenciales & Accesos .cdmx.gob.mx',
    'Monitoreo de exposición continua de credenciales institucionales, bases de datos vehiculares y cámaras.',
    ARRAY['cdmx.gob.mx', 'c5 cdmx', 'padron vehicular', 'escoltas'],
    'headlessx',
    12,
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 8. Capturas visuales indexadas en PixelRAG
INSERT INTO uwi_capturas (sitio_id, screenshot_path, pixelrag_index, contenido_texto, diff_pct, cambio_detectado, cambio_descripcion, created_at)
VALUES
  (
    '55555555-0001-4000-a000-000000000001',
    '/data/captures/55555555-0001-4000-a000-000000000001/cap_prev.png',
    '/data/pixelrag_indexes/55555555-0001-4000-a000-000000000001',
    'Thread #402: Horarios de descarga nocturna en Eje 1 Norte y calle Aztecas. Sin nuevos adjuntos.',
    4.2,
    false,
    'Cambio visual menor (4.2% <= umbral 15%). Solo actualización de contadores de vistas.',
    NOW() - INTERVAL '6 hours'
  ),
  (
    '55555555-0001-4000-a000-000000000001',
    '/data/captures/55555555-0001-4000-a000-000000000001/cap_latest.png',
    '/data/pixelrag_indexes/55555555-0001-4000-a000-000000000001',
    'ALERTA: Nuevo hilo publicado con fotografías de fachadas y croquis de relevo de guardias privados en Av. Presidente Masaryk (Polanco) y bodegas de Morelos.',
    28.6,
    true,
    'ALERTA PIXELRAG: Divergencia visual del 28.6% (>15%). Se detectó nuevo bloque de imágenes (croquis de vigilancia en Polanco y listado de placas).',
    NOW() - INTERVAL '45 minutes'
  ),
  (
    '55555555-0003-4000-a000-000000000003',
    '/data/captures/55555555-0003-4000-a000-000000000003/cap_latest.png',
    '/data/pixelrag_indexes/55555555-0003-4000-a000-000000000003',
    'Listing #891: Lote de inhibidores de señal de 16 bandas para transporte de carga en corredor Zaragoza-Puebla.',
    19.4,
    true,
    'ALERTA PIXELRAG: Divergencia visual del 19.4% (>15%). Nuevo listado de inhibidores GPS detectado.',
    NOW() - INTERVAL '1 hour'
  );

-- 9. Resúmenes ejecutivos de Claude + WorldMonitor MCP
INSERT INTO uwi_resumenes (id, tipo, fecha_ref, colonia_id, alcaldia, titulo, resumen, puntos_clave, nivel_alerta, tokens_usados, fuentes_count, worldmonitor_data)
VALUES
  (
    '66666666-0001-4000-a000-000000000001',
    'colonia',
    CURRENT_DATE,
    '11111111-0001-4000-a000-000000000001',
    'Cuauhtémoc',
    'Radiografía Ejecutiva: Colonia Morelos (Tepito) — Persistencia de Extorsión y Riesgo Logístico',
    'El análisis longitudinal (2016–2026) y la telemetría de las últimas 72 horas confirman a la Colonia Morelos como el nodo de mayor densidad de riesgo para operaciones de custodia y logística comercial en la Ciudad de México. Se observa una convergencia entre intimidación presencial a bodegas textiles en calle Aztecas (E-Medios) y la publicación de horarios de carga en foros Tor monitoreados por Vigía (HeadlessX/PixelRAG diff 28.6%). A nivel macro (WorldMonitor MCP), el patrón coincide con el incremento regional de extorsión al comercio mayorista de importación.',
    '["Incremento de exigencias de cuota extraordinaria en el cuadrante Eje 1 Norte - Aztecas - Peralvillo", "Correlación directa con amenazas detectadas en Dark Web (nivel reservado) sobre horarios de carga", "Disputa activa en el borde poniente con Colonia Guerrero (Fuerza Anti-Unión) eleva riesgo de fuego cruzado en horario nocturno (21:00–04:00)", "Recomendación para clientes de seguridad privada: escolta doble en traslados de mercancía y rotación inmediata de rutas en Eje 1 Norte"]'::jsonb,
    'emergencia',
    1840,
    12,
    '{"cii_mexico": 64.2, "trend": "elevated_urban_extortion", "tools_invoked": ["brief_area", "search_telemetry", "search_news"], "national_context": "Incremento del 14% en extorsión a corredores logísticos metropolitanos (CDMX-Edomex-Puebla)"}'::jsonb
  ),
  (
    '66666666-0002-4000-a000-000000000002',
    'colonia',
    CURRENT_DATE,
    '11111111-0012-4000-a000-000000000012',
    'Miguel Hidalgo',
    'Radiografía Ejecutiva: Polanco Sección III — Inteligencia Preventiva para Escoltas y Retail de Lujo',
    'Polanco mantiene un nivel de riesgo global Medio, pero presenta alertas focalizadas de alto impacto para servicios de protección ejecutiva y comercios de lujo en Av. Presidente Masaryk y Ejército Nacional. El módulo Vigía detectó hace 45 minutos un cambio visual del 28.6% en un foro oscuro con croquis de relevos de guardias privados.',
    '["Vigilancia hostil detectada sobre horarios de relevo de seguridad privada en corredor Masaryk", "Riesgo focalizado de robo de relojes de alta gama y seguimiento en motocicleta hacia Circuito Interior", "Recomendación: desfasar horarios de cambio de turno ±25 minutos y verificar placas de motocicletas en perímetro"]'::jsonb,
    'alerta',
    1520,
    8,
    '{"cii_mexico": 64.2, "trend": "targeted_luxury_retail_recon", "tools_invoked": ["brief_area", "entities_near"]}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- 10. Registro de Auditoría (R7: Trazabilidad completa de Claude API)
INSERT INTO uwi_audit (accion, recurso, ip_addr, nivel_conf_accedido, fuentes_json, tokens_usados, confianza_pct, created_at)
VALUES
  (
    'claude.classify_text',
    'uwi_emedios_articulos:EM-20261026-09',
    '127.0.0.1',
    'publico',
    '[{"tipo":"publico","id":"22222222-0001-4000-a000-000000000001","nombre":"E-Medios Monitoreo CDMX"}]'::jsonb,
    945,
    92,
    NOW() - INTERVAL '2 hours'
  ),
  (
    'claude.classify_text',
    'uwi_sitios_mira:55555555-0001-4000-a000-000000000001',
    '127.0.0.1',
    'reservado',
    '[{"tipo":"reservado","id":"22222222-0004-4000-a000-000000000004","nombre":"Vigía DarkWeb — Foro Clandestino Tepito/Mercados"}]'::jsonb,
    1180,
    88,
    NOW() - INTERVAL '45 minutes'
  ),
  (
    'claude.generar_resumen_worldmonitor',
    'uwi_colonias:11111111-0001-4000-a000-000000000001 (MORELOS)',
    '127.0.0.1',
    'reservado',
    '[{"tipo":"publico","id":"22222222-0001-4000-a000-000000000001"},{"tipo":"sensible","id":"22222222-0003-4000-a000-000000000003"},{"tipo":"reservado","id":"22222222-0004-4000-a000-000000000004"},{"tipo":"worldmonitor_mcp","tools":["brief_area","search_telemetry","search_news"]}]'::jsonb,
    1840,
    95,
    NOW() - INTERVAL '30 minutes'
  );
