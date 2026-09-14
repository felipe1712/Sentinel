import os
import json
import shapefile
import pyproj
from shapely.geometry import shape, mapping

SRC_DIR = r"data/ShapeF/Puebla"
OUT_DIR = r"nextjs-app/public/data"

transformer = pyproj.Transformer.from_crs("EPSG:32614", "EPSG:4326", always_xy=True)

def clean_name(name):
    if not name:
        return ""
    name = str(name).strip()
    name = name.replace("\ufffd", "Ñ").replace("CAADA", "CAÑADA").replace("CAAADA", "CAÑADA")
    return name

def transform_coords(coords):
    if isinstance(coords[0], (int, float)):
        lon, lat = transformer.transform(coords[0], coords[1])
        return [round(lon, 5), round(lat, 5)]
    return [transform_coords(sub) for sub in coords]

def process_geometry(geom, tolerance=0.00008):
    coords = transform_coords(geom["coordinates"])
    transformed_geom = {"type": geom["type"], "coordinates": coords}
    try:
        s_geom = shape(transformed_geom)
        if not s_geom.is_valid:
            s_geom = s_geom.buffer(0)
        s_sim = s_geom.simplify(tolerance, preserve_topology=True)
        return mapping(s_sim)
    except Exception:
        return transformed_geom

def convert_municipios():
    print("Convirtiendo MUNICIPIO.shp...")
    sf = shapefile.Reader(os.path.join(SRC_DIR, "MUNICIPIO.shp"), encoding="utf-8")
    features = []
    for sr in sf.shapeRecords():
        rec = sr.record.as_dict()
        geom = process_geometry(sr.shape.__geo_interface__, tolerance=0.00006)
        muni_id = int(rec["municipio"])
        muni_name = clean_name(rec["nombre"])
        features.append({
            "type": "Feature",
            "properties": {
                "id": muni_id,
                "municipio": muni_id,
                "nombre": muni_name,
                "entidad": 21
            },
            "geometry": geom
        })
    
    out_file = os.path.join(OUT_DIR, "pue_municipios.geojson")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": features}, f, separators=(",", ":"))
    print(f"  -> Guardado {out_file} ({len(features)} municipios, {os.path.getsize(out_file)/1024/1024:.2f} MB)")

def convert_distritos_locales():
    print("Convirtiendo DISTRITO_LOCAL.shp...")
    sf = shapefile.Reader(os.path.join(SRC_DIR, "DISTRITO_LOCAL.shp"), encoding="utf-8")
    features = []
    for sr in sf.shapeRecords():
        rec = sr.record.as_dict()
        geom = process_geometry(sr.shape.__geo_interface__, tolerance=0.00006)
        dl_id = int(rec["distrito_l"])
        features.append({
            "type": "Feature",
            "properties": {
                "id": dl_id,
                "distrito_l": dl_id,
                "nombre": f"Distrito Local {dl_id}",
                "entidad": 21
            },
            "geometry": geom
        })
    
    out_file = os.path.join(OUT_DIR, "pue_distritos_locales.geojson")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": features}, f, separators=(",", ":"))
    print(f"  -> Guardado {out_file} ({len(features)} distritos locales, {os.path.getsize(out_file)/1024/1024:.2f} MB)")

def convert_distritos_federales():
    print("Convirtiendo DISTRITO_FEDERAL.shp...")
    sf = shapefile.Reader(os.path.join(SRC_DIR, "DISTRITO_FEDERAL.shp"), encoding="utf-8")
    features = []
    for sr in sf.shapeRecords():
        rec = sr.record.as_dict()
        geom = process_geometry(sr.shape.__geo_interface__, tolerance=0.00006)
        df_id = int(rec["distrito_f"])
        features.append({
            "type": "Feature",
            "properties": {
                "id": df_id,
                "distrito_f": df_id,
                "nombre": f"Distrito Federal {df_id}",
                "entidad": 21
            },
            "geometry": geom
        })
    
    out_file = os.path.join(OUT_DIR, "pue_distritos_federales.geojson")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": features}, f, separators=(",", ":"))
    print(f"  -> Guardado {out_file} ({len(features)} distritos federales, {os.path.getsize(out_file)/1024/1024:.2f} MB)")

def convert_secciones():
    print("Convirtiendo SECCION.shp...")
    muni_sf = shapefile.Reader(os.path.join(SRC_DIR, "MUNICIPIO.shp"), encoding="utf-8")
    muni_map = {int(r["municipio"]): clean_name(r["nombre"]) for r in muni_sf.records()}

    sf = shapefile.Reader(os.path.join(SRC_DIR, "SECCION.shp"), encoding="utf-8")
    features = []
    for sr in sf.shapeRecords():
        rec = sr.record.as_dict()
        geom = process_geometry(sr.shape.__geo_interface__, tolerance=0.00008)
        sec_num = int(rec["seccion"])
        muni_num = int(rec["municipio"])
        dl_num = int(rec["distrito_l"])
        df_num = int(rec["distrito_f"])
        features.append({
            "type": "Feature",
            "properties": {
                "id": sec_num,
                "seccion": sec_num,
                "municipio": muni_num,
                "nombre": muni_map.get(muni_num, f"Municipio {muni_num}"),
                "distrito_l": dl_num,
                "distrito_f": df_num,
                "tipo": int(rec.get("tipo", 1)),
                "entidad": 21
            },
            "geometry": geom
        })
    
    out_file = os.path.join(OUT_DIR, "pue_secciones.geojson")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": features}, f, separators=(",", ":"))
    print(f"  -> Guardado {out_file} ({len(features)} secciones electorales, {os.path.getsize(out_file)/1024/1024:.2f} MB)")

if __name__ == "__main__":
    convert_municipios()
    convert_distritos_locales()
    convert_distritos_federales()
    convert_secciones()
    print("¡Conversión oficial y simplificación de geometrías de Puebla completada!")
