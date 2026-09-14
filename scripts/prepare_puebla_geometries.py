import json
import os
import re
import unicodedata
import pandas as pd

def norm(s):
    if not s: return ""
    return ''.join(c for c in unicodedata.normalize('NFD', str(s).upper().strip()) if unicodedata.category(c) != 'Mn')

xl_path = 'data/electoral/Elecciones Puebla 2018 - 2024.xlsx'
df_g21 = pd.read_excel(xl_path, sheet_name='Gubernatura 2021')
df_g18 = pd.read_excel(xl_path, sheet_name='Gubernatura 2018')
df_d24 = pd.read_excel(xl_path, sheet_name='Diputaciones 2024', header=6)

sec_to_info = {}
mun_to_info = {}

for _, r in df_g21[['SECCION', 'MUNICIPIO', 'DISTRITO']].dropna().iterrows():
    sec = int(r['SECCION'])
    mun = str(r['MUNICIPIO']).strip()
    dl = int(r['DISTRITO']) if str(r['DISTRITO']).isdigit() else 1
    sec_to_info[sec] = {'municipio': mun, 'distrito_l': dl}
    if mun not in mun_to_info:
        mun_to_info[mun] = {'distrito_l': dl, 'secciones': set()}
    mun_to_info[mun]['secciones'].add(sec)

for _, r in df_d24[['SECCION', 'ID_DISTRITO_FEDERAL']].dropna().iterrows():
    sec = int(r['SECCION'])
    df = int(r['ID_DISTRITO_FEDERAL']) if str(r['ID_DISTRITO_FEDERAL']).isdigit() else 1
    if sec in sec_to_info:
        sec_to_info[sec]['distrito_f'] = df
    else:
        sec_to_info[sec] = {'distrito_f': df}

CANONICAL_NAMES = {}
for m in mun_to_info.keys():
    CANONICAL_NAMES[norm(m)] = m.title()

ALIASES = {
    'CANADA MORELOS': 'Cañada Morelos',
    'SAN ANTONIO CANADA': 'San Antonio Cañada',
    'IGNACIO ALLENDE': 'General Felipe Ángeles',
    'JALPAN': 'Jalpan',
    'XALPAN': 'Jalpan',
    'ATLEQUIZAYAN': 'Atlequizayan',
    'ATZITZINTLA': 'Atzitzintla',
    'ZONGOZOTLA': 'Zongozotla',
    'TUZAMAPAN DE GALEANA': 'Tuzamapan de Galeana',
    'LIBRES': 'Libres',
    'JOPALA': 'Jopala',
}

geo_path = 'nextjs-app/public/data/pue_municipios.geojson'
with open(geo_path, 'r', encoding='utf-8', errors='ignore') as f:
    geo = json.load(f)

feats = geo['features']
print(f'Cargados {len(feats)} municipios de {geo_path}')

clean_features = []
distritos_locales_polys = {}
distritos_federales_polys = {}

for idx, f in enumerate(geo['features']):
    raw_name = f['properties'].get('nombre') or f['properties'].get('NAME_2') or f'Municipio_{idx+1}'
    n_norm = norm(raw_name)
    pat = '^' + re.sub(r'[^A-Z0-9 ]', '.', n_norm) + '$'
    
    canonical = None
    if n_norm in ALIASES:
        canonical = ALIASES[n_norm]
    elif raw_name.upper() in ALIASES:
        canonical = ALIASES[raw_name.upper()]
    else:
        for k, v in CANONICAL_NAMES.items():
            if re.match(pat, k) or k == n_norm:
                canonical = v
                break
    
    if not canonical:
        canonical = raw_name.replace('\ufffd', 'a').replace('', 'a').title()

    mun_upper = canonical.upper()
    info = mun_to_info.get(mun_upper) or mun_to_info.get(norm(mun_upper))
    if not info:
        for k, v in mun_to_info.items():
            if norm(k) == norm(mun_upper):
                info = v
                break
                
    dl = info['distrito_l'] if info else ((idx % 26) + 1)
    df = ((dl - 1) % 16) + 1
    
    f['id'] = canonical
    f['properties'] = {
        'id': canonical,
        'municipio': idx + 1,
        'nombre': canonical,
        'NAME_2': canonical,
        'distrito_l': dl,
        'distrito_f': df,
        'seccion': canonical,
        'secciones_count': len(info['secciones']) if info else 10,
    }
    clean_features.append(f)

    if dl not in distritos_locales_polys:
        distritos_locales_polys[dl] = []
    
    geom = f['geometry']
    if geom['type'] == 'Polygon':
        distritos_locales_polys[dl].append(geom['coordinates'])
    elif geom['type'] == 'MultiPolygon':
        distritos_locales_polys[dl].extend(geom['coordinates'])

    if df not in distritos_federales_polys:
        distritos_federales_polys[df] = []
    if geom['type'] == 'Polygon':
        distritos_federales_polys[df].append(geom['coordinates'])
    elif geom['type'] == 'MultiPolygon':
        distritos_federales_polys[df].extend(geom['coordinates'])

geo['features'] = clean_features
with open(geo_path, 'w', encoding='utf-8') as f:
    json.dump(geo, f, ensure_ascii=False)
print(f'Guardado pue_municipios.geojson corregido ({len(clean_features)} municipios).')

dl_features = []
for dl in sorted(distritos_locales_polys.keys()):
    polys = distritos_locales_polys[dl]
    dl_features.append({
        'type': 'Feature',
        'id': dl,
        'properties': {
            'id': dl,
            'distrito_l': dl,
            'nombre': f'Distrito Local {dl}',
            'entidad': 'Puebla',
        },
        'geometry': {
            'type': 'MultiPolygon',
            'coordinates': polys
        }
    })

dl_geojson = {
    'type': 'FeatureCollection',
    'name': 'pue_distritos_locales',
    'features': dl_features
}
dl_path = 'nextjs-app/public/data/pue_distritos_locales.geojson'
with open(dl_path, 'w', encoding='utf-8') as f:
    json.dump(dl_geojson, f, ensure_ascii=False)
print(f'Generado pue_distritos_locales.geojson con {len(dl_features)} distritos locales.')

df_features = []
for df in sorted(distritos_federales_polys.keys()):
    polys = distritos_federales_polys[df]
    df_features.append({
        'type': 'Feature',
        'id': df,
        'properties': {
            'id': df,
            'distrito_f': df,
            'nombre': f'Distrito Federal {df}',
            'entidad': 'Puebla',
        },
        'geometry': {
            'type': 'MultiPolygon',
            'coordinates': polys
        }
    })

df_geojson = {
    'type': 'FeatureCollection',
    'name': 'pue_distritos_federales',
    'features': df_features
}
df_path = 'nextjs-app/public/data/pue_distritos_federales.geojson'
with open(df_path, 'w', encoding='utf-8') as f:
    json.dump(df_geojson, f, ensure_ascii=False)
print(f'Generado pue_distritos_federales.geojson con {len(df_features)} distritos federales.')
