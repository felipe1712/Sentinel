"""
Conversor de Shapefiles Oficiales del INE de Chihuahua a GeoJSON (WGS84)
-------------------------------------------------------------------------
Lee los shapefiles en UTM Zona 13N (EPSG:32613) desde:
  data/Chihuahua/Shp-files/

Reproyecta a WGS84 (EPSG:4326) y genera los archivos GeoJSON optimizados en:
  nextjs-app/public/data/
    - chi_secciones.geojson (3,311 secciones)
    - chi_municipios.geojson (67 municipios)
    - chi_distritos_locales.geojson (22 distritos locales)
    - chi_distritos_federales.geojson (9 distritos federales)
    - chi_colonias.geojson (3,594 colonias)
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
SHP_DIR = BASE_DIR / "data" / "Chihuahua" / "Shp-files"
OUTPUT_DIR = BASE_DIR / "nextjs-app" / "public" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Cargar catálogo canónico de municipios de Chihuahua
sf_mun = shapefile.Reader(str(SHP_DIR / "MUNICIPIO"), encoding="latin1")
MUNICIPIOS_DICT = {}
for r in sf_mun.records():
    mun_id = int(r["municipio"])
    raw_name = str(r["nombre"]).strip()
    # Limpiar formato de mayúsculas a Title Case preservando acentos
    MUNICIPIOS_DICT[mun_id] = raw_name.title()

transformer = pyproj.Transformer.from_crs("EPSG:32613", "EPSG:4326", always_xy=True)

def reproject_geom(geom, tolerance=0.00004):
    sh_geom = shape(geom)
    reproj = transform(transformer.transform, sh_geom)
    if tolerance > 0 and reproj.geom_type in ("Polygon", "MultiPolygon"):
        reproj = reproj.simplify(tolerance, preserve_topology=True)
    return mapping(reproj)

def convert_secciones():
    shp_path = SHP_DIR / "SECCION.shp"
    out_path = OUTPUT_DIR / "chi_secciones.geojson"
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
            "clave_entidad": 8,
            "entidad": 8
        }
        
        features.append({
            "type": "Feature",
            "id": sec_num,
            "properties": props,
            "geometry": geom_wgs84
        })
        
    geojson = {
        "type": "FeatureCollection",
        "name": "chi_secciones_electorales_ine",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": features
    }
    
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False)
        
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"   [OK] {len(features)} secciones exportadas a {out_path.name} ({size_mb:.2f} MB)")

def convert_municipios():
    shp_path = SHP_DIR / "MUNICIPIO.shp"
    out_path = OUTPUT_DIR / "chi_municipios.geojson"
    print(f"-> Convirtiendo Municipios ({shp_path.name})...")
    
    sf = shapefile.Reader(str(shp_path), encoding="latin1")
    features = []
    
    for sr in sf.shapeRecords():
        if not sr.shape.points:
            continue
        rec = sr.record.as_dict()
        mun_num = int(rec.get("municipio") or 0)
        nombre = MUNICIPIOS_DICT.get(mun_num, str(rec.get("nombre") or "").strip().title())
        
        geom_wgs84 = reproject_geom(sr.shape.__geo_interface__, tolerance=0.00005)
        
        props = {
            "id": nombre,
            "municipio": mun_num,
            "nombre": nombre,
            "NAME_2": nombre,
            "cve_mun": f"{mun_num:03d}",
            "clave_entidad": 8,
            "entidad": 8
        }
        
        features.append({
            "type": "Feature",
            "id": nombre,
            "properties": props,
            "geometry": geom_wgs84
        })
        
    geojson = {
        "type": "FeatureCollection",
        "name": "chi_municipios_ine",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": features
    }
    
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False)
        
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"   [OK] {len(features)} municipios exportados a {out_path.name} ({size_mb:.2f} MB)")

def convert_distritos_locales():
    shp_path = SHP_DIR / "DISTRITO_LOCAL.shp"
    out_path = OUTPUT_DIR / "chi_distritos_locales.geojson"
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
            "clave_entidad": 8,
            "entidad": 8
        }
        
        features.append({
            "type": "Feature",
            "id": dl_num,
            "properties": props,
            "geometry": geom_wgs84
        })
        
    geojson = {
        "type": "FeatureCollection",
        "name": "chi_distritos_locales_ine",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": features
    }
    
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False)
        
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"   [OK] {len(features)} distritos locales exportados a {out_path.name} ({size_mb:.2f} MB)")

def convert_distritos_federales():
    shp_path = SHP_DIR / "DISTRITO_FEDERAL.shp"
    out_path = OUTPUT_DIR / "chi_distritos_federales.geojson"
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
            "clave_entidad": 8,
            "entidad": 8
        }
        
        features.append({
            "type": "Feature",
            "id": df_num,
            "properties": props,
            "geometry": geom_wgs84
        })
        
    geojson = {
        "type": "FeatureCollection",
        "name": "chi_distritos_federales_ine",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": features
    }
    
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False)
        
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"   [OK] {len(features)} distritos federales exportados a {out_path.name} ({size_mb:.2f} MB)")

def convert_colonias():
    shp_path = SHP_DIR / "COLONIA.shp"
    out_path = OUTPUT_DIR / "chi_colonias.geojson"
    print(f"-> Convirtiendo Colonias ({shp_path.name})...")
    
    sf = shapefile.Reader(str(shp_path), encoding="latin1")
    features = []
    
    for sr in sf.shapeRecords():
        if not sr.shape.points:
            continue
        rec = sr.record.as_dict()
        col_id = int(rec.get("ID") or 0)
        mun_num = int(rec.get("MUNICIPIO") or 0)
        nombre = str(rec.get("NOMBRE") or "").strip().title()
        cp = str(rec.get("CP") or "").strip()
        
        geom_wgs84 = reproject_geom(sr.shape.__geo_interface__, tolerance=0.00005)
        
        props = {
            "id": col_id,
            "nombre": nombre,
            "municipio": mun_num,
            "nombre_municipio": MUNICIPIOS_DICT.get(mun_num, ""),
            "cp": cp,
            "clave_entidad": 8
        }
        
        features.append({
            "type": "Feature",
            "id": col_id,
            "properties": props,
            "geometry": geom_wgs84
        })
        
    geojson = {
        "type": "FeatureCollection",
        "name": "chi_colonias_ine",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": features
    }
    
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False)
        
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"   [OK] {len(features)} colonias exportadas a {out_path.name} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    print("Iniciando conversion de Shapefiles INE de Chihuahua a GeoJSON WGS84...")
    convert_secciones()
    convert_municipios()
    convert_distritos_locales()
    convert_distritos_federales()
    convert_colonias()
    print("Conversion finalizada exitosamente.")
