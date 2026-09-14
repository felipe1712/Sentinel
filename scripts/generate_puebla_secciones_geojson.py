import json
import math
from collections import defaultdict

print('Generando pue_secciones.geojson sintetizado...')
geo_mun = json.load(open('nextjs-app/public/data/pue_municipios.geojson', encoding='utf-8'))
cache = json.load(open('nextjs-app/public/data/pue_electoral_results_cache.json', encoding='utf-8'))

# Mapear secciones por municipio desde cache 2024
sec_by_mun = defaultdict(list)
sec_info = {}
for s_id, data in cache['diputaciones']['2024'].items():
    m_name = data['municipio_nombre']
    sec_by_mun[m_name.upper().strip()].append(int(s_id))
    sec_info[int(s_id)] = data

features_sec = []

# Funcion para obtener bounding box de coordenadas
def get_bbox(coords):
    all_pts = []
    def extract_pts(c):
        if isinstance(c[0], (int, float)):
            all_pts.append(c)
        else:
            for sub in c:
                extract_pts(sub)
    extract_pts(coords)
    lons = [p[0] for p in all_pts]
    lats = [p[1] for p in all_pts]
    return min(lons), min(lats), max(lons), max(lats)

for feat in geo_mun['features']:
    m_name = feat['properties']['nombre']
    m_upper = m_name.upper().strip()
    sections = sec_by_mun.get(m_upper, [])
    if not sections:
        # buscar parcial
        for k, v in sec_by_mun.items():
            if k in m_upper or m_upper in k:
                sections = v
                break
    
    geom = feat['geometry']
    if geom.get('type') == 'GeometryCollection':
        geom = geom['geometries'][0]
    coords = geom.get('coordinates', [])
    if not coords:
        continue
    
    if not sections:
        continue
    
    if len(sections) == 1:
        s_id = sections[0]
        d = sec_info.get(s_id, {})
        features_sec.append({
            'type': 'Feature',
            'id': s_id,
            'properties': {
                'seccion': s_id,
                'id': s_id,
                'municipio': feat['properties'].get('municipio', 1),
                'nombre': m_name,
                'distrito_l': d.get('distrito_local', 1),
                'distrito_f': d.get('distrito_federal', 1),
            },
            'geometry': geom
        })
    else:
        min_lon, min_lat, max_lon, max_lat = get_bbox(coords)
        N = len(sections)
        cols = math.ceil(math.sqrt(N))
        rows = math.ceil(N / cols)
        
        d_lon = (max_lon - min_lon) / cols
        d_lat = (max_lat - min_lat) / rows
        
        for idx, s_id in enumerate(sections):
            c_idx = idx % cols
            r_idx = idx // cols
            
            x1 = round(min_lon + c_idx * d_lon, 6)
            x2 = round(x1 + d_lon, 6)
            y1 = round(min_lat + r_idx * d_lat, 6)
            y2 = round(y1 + d_lat, 6)
            
            sub_poly = [[[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]]]
            d = sec_info.get(s_id, {})
            
            features_sec.append({
                'type': 'Feature',
                'id': s_id,
                'properties': {
                    'seccion': s_id,
                    'id': s_id,
                    'municipio': feat['properties'].get('municipio', 1),
                    'nombre': m_name,
                    'distrito_l': d.get('distrito_local', 1),
                    'distrito_f': d.get('distrito_federal', 1),
                },
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': sub_poly
                }
            })

print(f'Total secciones generadas: {len(features_sec)}')

out_geojson = {
    'type': 'FeatureCollection',
    'name': 'pue_secciones',
    'features': features_sec
}

out_path = 'nextjs-app/public/data/pue_secciones.geojson'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(out_geojson, f, ensure_ascii=False)

print(f'Guardado exitoso en {out_path}')
