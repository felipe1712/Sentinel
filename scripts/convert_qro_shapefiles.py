"""
Conversor de Shapefiles Oficiales del INE de Querétaro a GeoJSON (WGS84)
-------------------------------------------------------------------------
Lee los shapefiles en UTM Zona 14N (EPSG:32614) desde:
  data/Queretaro/Shp-Qro/

Reproyecta a WGS84 (EPSG:4326) y genera los archivos GeoJSON optimizados en:
  nextjs-app/public/data/
    - qro_secciones.geojson (1,090 secciones)
    - qro_municipios.geojson (18 municipios)
    - qro_distritos_locales.geojson (15 distritos locales)
    - qro_distritos_federales.geojson (6 distritos federales)
    - qro_colonias.geojson (4,312 colonias)
"""

import os
import sys
import json
from pathlib import Path
import shapefile
import pyproj
from shapely.geometry import shape, mapping
from shapely.ops import transform

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_DIR = Path(__file__).resolve().parent.parent
SHP_DIR = BASE_DIR / "data" / "Queretaro" / "Shp-Qro"
OUTPUT_DIR = BASE_DIR / "nextjs-app" / "public" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MUNICIPIOS_DICT = {
    1: "Amealco de Bonfil",
    2: "Arroyo Seco",
    3: "Cadereyta de Montes",
    4: "Colón",
    5: "Corregidora",
    6: "Ezequiel Montes",
    7: "Huimilpan",
    8: "Jalpan de Serra",
    9: "Landa de Matamoros",
    10: "El Marqués",
    11: "Pedro Escobedo",
    12: "Peñamiller",
    13: "Pinal de Amoles",
    14: "Querétaro",
    15: "San Joaquín",
    16: "San Juan del Río",
    17: "Tequisquiapan",
    18: "Tolimán",
}

transformer = pyproj.Transformer.from_crs("EPSG:32614", "EPSG:4326", always_xy=True)

def reproject_geom(geom, tolerance=0.00003):
    sh_geom = shape(geom)
    reproj = transform(transformer.transform, sh_geom)
    if tolerance > 0 and reproj.geom_type in ("Polygon", "MultiPolygon"):
        reproj = reproj.simplify(tolerance, preserve_topology=True)
    return mapping(reproj)

def convert_secciones():
    shp_path = SHP_DIR / "SECCION.shp"
    out_path = OUTPUT_DIR / "qro_secciones.geojson"
    print(f"-> Convirtiendo Secciones Electorales ({shp_path.name})...")
    
    sf = shapefile.Reader(str(shp_path), encoding="latin1")
    features = []
    
    for sr in sf.shapeRecords():
        if not sr.shape.points:
            continue
        rec = sr.record.as_dict()
        sec_num = int(rec.get("seccion") or 0)
        mun_num = int(rec.get("municipio") or 0)
        dl_num = int(rec.get("distrito_l") or 0)
        df_num = int(rec.get("distrito_f") or 0)
        tipo = int(rec.get("tipo") or 0)
        
        mun_nombre = MUNICIPIOS_DICT.get(mun_num, f"Municipio {mun_num}")
        
        geom_wgs84 = reproject_geom(sr.shape.__geo_interface__, tolerance=0.00004)
        
        props = {
            "id": sec_num,
            "seccion": sec_num,
            "municipio": mun_num,
            "nombre_municipio": mun_nombre,
            "distrito_l": dl_num,
            "distrito_f": df_num,
            "tipo_seccion": "Urbana" if tipo == 1 else "Rural" if tipo == 2 else "Mixta",
            "clave_entidad": 22
        }
        
        features.append({
            "type": "Feature",
            "id": sec_num,
            "properties": props,
            "geometry": geom_wgs84
        })
        
    geojson = {
        "type": "FeatureCollection",
        "name": "qro_secciones_electorales_ine",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": features
    }
    
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False)
        
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"   ✅ {len(features)} secciones exportadas a {out_path.name} ({size_mb:.2f} MB)")

def convert_municipios():
    shp_path = SHP_DIR / "MUNICIPIO.shp"
    out_path = OUTPUT_DIR / "qro_municipios.geojson"
    print(f"-> Convirtiendo Municipios ({shp_path.name})...")
    
    sf = shapefile.Reader(str(shp_path), encoding="latin1")
    features = []
    
    for sr in sf.shapeRecords():
        if not sr.shape.points:
            continue
        rec = sr.record.as_dict()
        mun_num = int(rec.get("municipio") or 0)
        nombre = str(rec.get("nombre") or "").strip().title()
        if mun_num in MUNICIPIOS_DICT:
            nombre = MUNICIPIOS_DICT[mun_num]
            
        geom_wgs84 = reproject_geom(sr.shape.__geo_interface__, tolerance=0.00005)
        
        props = {
            "id": mun_num,
            "municipio": mun_num,
            "nombre": nombre,
            "cve_mun": f"{mun_num:03d}",
            "clave_entidad": 22
        }
        
        features.append({
            "type": "Feature",
            "id": mun_num,
            "properties": props,
            "geometry": geom_wgs84
        })
        
    geojson = {
        "type": "FeatureCollection",
        "name": "qro_municipios_ine",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": features
    }
    
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False)
        
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"   ✅ {len(features)} municipios exportados a {out_path.name} ({size_mb:.2f} MB)")

def convert_distritos_locales():
    shp_path = SHP_DIR / "DISTRITO_LOCAL.shp"
    out_path = OUTPUT_DIR / "qro_distritos_locales.geojson"
    print(f"-> Convirtiendo Distritos Locales ({shp_path.name})...")
    
    sf = shapefile.Reader(str(shp_path), encoding="latin1")
    features = []
    
    for sr in sf.shapeRecords():
        if not sr.shape.points:
            continue
        rec = sr.record.as_dict()
        dl_num = int(rec.get("distrito_l") or 0)
        
        geom_wgs84 = reproject_geom(sr.shape.__geo_interface__, tolerance=0.00005)
        
        props = {
            "id": dl_num,
            "distrito_l": dl_num,
            "nombre": f"Distrito Local {dl_num}",
            "clave_entidad": 22
        }
        
        features.append({
            "type": "Feature",
            "id": dl_num,
            "properties": props,
            "geometry": geom_wgs84
        })
        
    geojson = {
        "type": "FeatureCollection",
        "name": "qro_distritos_locales_ine",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": features
    }
    
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False)
        
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"   ✅ {len(features)} distritos locales exportados a {out_path.name} ({size_mb:.2f} MB)")

def convert_distritos_federales():
    shp_path = SHP_DIR / "DISTRITO_FEDERAL.shp"
    out_path = OUTPUT_DIR / "qro_distritos_federales.geojson"
    print(f"-> Convirtiendo Distritos Federales ({shp_path.name})...")
    
    sf = shapefile.Reader(str(shp_path), encoding="latin1")
    features = []
    
    for sr in sf.shapeRecords():
        if not sr.shape.points:
            continue
        rec = sr.record.as_dict()
        df_num = int(rec.get("distrito_f") or 0)
        
        geom_wgs84 = reproject_geom(sr.shape.__geo_interface__, tolerance=0.00005)
        
        props = {
            "id": df_num,
            "distrito_f": df_num,
            "nombre": f"Distrito Federal {df_num}",
            "clave_entidad": 22
        }
        
        features.append({
            "type": "Feature",
            "id": df_num,
            "properties": props,
            "geometry": geom_wgs84
        })
        
    geojson = {
        "type": "FeatureCollection",
        "name": "qro_distritos_federales_ine",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": features
    }
    
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False)
        
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"   ✅ {len(features)} distritos federales exportados a {out_path.name} ({size_mb:.2f} MB)")

def convert_colonias():
    shp_path = SHP_DIR / "COLONIA.shp"
    out_path = OUTPUT_DIR / "qro_colonias.geojson"
    print(f"-> Convirtiendo Colonias ({shp_path.name})...")
    
    sf = shapefile.Reader(str(shp_path), encoding="latin1")
    features = []
    
    for sr in sf.shapeRecords():
        if not sr.shape.points:
            continue
        rec = sr.record.as_dict()
        cid = int(rec.get("ID") or 0)
        mun_num = int(rec.get("MUNICIPIO") or 0)
        nombre = str(rec.get("NOMBRE") or "").strip().title()
        cp = str(rec.get("CP") or "").strip()
        
        geom_wgs84 = reproject_geom(sr.shape.__geo_interface__, tolerance=0.00006)
        
        props = {
            "id": cid,
            "nombre": nombre,
            "cp": cp,
            "municipio": mun_num,
            "nombre_municipio": MUNICIPIOS_DICT.get(mun_num, "")
        }
        
        features.append({
            "type": "Feature",
            "id": cid,
            "properties": props,
            "geometry": geom_wgs84
        })
        
    geojson = {
        "type": "FeatureCollection",
        "name": "qro_colonias_ine",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": features
    }
    
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False)
        
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"   ✅ {len(features)} colonias exportadas a {out_path.name} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    print("=========================================================")
    print(" Invocando Conversor Cartográfico para Querétaro (WGS84)")
    print("=========================================================")
    convert_secciones()
    convert_municipios()
    convert_distritos_locales()
    convert_distritos_federales()
    convert_colonias()
    print("✨ Todas las capas geográficas convertidas exitosamente.")
