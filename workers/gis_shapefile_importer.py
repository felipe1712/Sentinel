import os
import sys
import struct
import math
import json
import logging
from typing import List, Dict, Any, Tuple

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("gis_importer")

def utm14n_to_latlon(easting: float, northing: float) -> Tuple[float, float]:
    """Convierte coordenadas UTM Zona 14N (WGS84) a Longitud y Latitud en grados decimales (EPSG:4326)."""
    a = 6378137.0
    f = 1 / 298.257223563
    e = math.sqrt(2 * f - f * f)
    e1 = (1 - math.sqrt(1 - e * e)) / (1 + math.sqrt(1 - e * e))
    k0 = 0.9996
    lon0 = math.radians(-99.0) # Meridiano Central para Zona 14N
    
    x = easting - 500000.0
    y = northing
    
    M = y / k0
    mu = M / (a * (1 - e * e / 4 - 3 * e**4 / 64 - 5 * e**6 / 256))
    
    phi1 = mu + (3 * e1 / 2 - 27 * e1**3 / 32) * math.sin(2 * mu) + (21 * e1**2 / 16 - 55 * e1**4 / 32) * math.sin(4 * mu) + (151 * e1**3 / 96) * math.sin(6 * mu)
    
    N1 = a / math.sqrt(1 - e * e * math.sin(phi1)**2)
    T1 = math.tan(phi1)**2
    C1 = (e**2 / (1 - e**2)) * math.cos(phi1)**2
    R1 = a * (1 - e**2) / ((1 - e**2 * math.sin(phi1)**2)**1.5)
    D = x / (N1 * k0)
    
    lat = phi1 - (N1 * math.tan(phi1) / R1) * (D**2 / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1**2 - 9 * (e**2 / (1 - e**2))) * D**4 / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1**2 - 252 * (e**2 / (1 - e**2)) - 3 * C1**2) * D**6 / 720)
    lon = lon0 + (D - (1 + 2 * T1 + C1) * D**3 / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1**2 + 8 * (e**2 / (1 - e**2)) + 24 * T1**2) * D**5 / 120) / math.cos(phi1)
    
    return round(math.degrees(lon), 6), round(math.degrees(lat), 6)

def read_dbf(dbf_path: str) -> List[Dict[str, Any]]:
    """Lee la tabla de atributos DBF y extrae los registros como lista de diccionarios."""
    records = []
    with open(dbf_path, "rb") as f:
        header = f.read(32)
        num_records, header_len, record_len = struct.unpack("<IHH", header[4:12])
        
        fields = []
        while True:
            field_desc = f.read(32)
            if not field_desc or field_desc[0] == 0x0D:
                break
            name = field_desc[:11].replace(b"\x00", b"").decode("latin1").strip().lower()
            typ = chr(field_desc[11])
            flen = field_desc[16]
            fields.append((name, typ, flen))
            
        f.seek(header_len)
        for _ in range(num_records):
            rec_bytes = f.read(record_len)
            if not rec_bytes:
                break
            if rec_bytes[0] == 0x2A: # Eliminado
                continue
            offset = 1
            row = {}
            for name, typ, flen in fields:
                val_bytes = rec_bytes[offset:offset+flen]
                offset += flen
                val_str = val_bytes.decode("latin1", errors="ignore").strip()
                if typ == "N":
                    if "." in val_str:
                        row[name] = float(val_str) if val_str else 0.0
                    else:
                        row[name] = int(val_str) if val_str else 0
                else:
                    row[name] = val_str
            records.append(row)
    return records

def read_shp_polygons(shp_path: str, max_records: int = None, simplify_step: int = 1) -> List[List[List[Tuple[float, float]]]]:
    """Lee las geometrías de polígonos de un archivo SHP y las reproyecta a coordenadas WGS84."""
    polygons = []
    with open(shp_path, "rb") as f:
        header = f.read(100)
        file_length_words, = struct.unpack(">I", header[24:28])
        shape_type, = struct.unpack("<I", header[32:36])
        
        count = 0
        while True:
            rec_hdr = f.read(8)
            if not rec_hdr:
                break
            rec_num, content_len_words = struct.unpack(">II", rec_hdr)
            content_bytes = f.read(content_len_words * 2)
            if not content_bytes:
                break
            
            stype, = struct.unpack("<I", content_bytes[:4])
            if stype == 0: # Null shape
                polygons.append([])
                continue
            
            if stype == 5: # Polygon
                num_parts, num_points = struct.unpack("<II", content_bytes[36:44])
                parts = struct.unpack(f"<{num_parts}I", content_bytes[44:44 + num_parts * 4])
                parts = list(parts) + [num_points]
                
                points_offset = 44 + num_parts * 4
                raw_points = struct.unpack(f"<{num_points * 2}d", content_bytes[points_offset:points_offset + num_points * 16])
                
                poly_parts = []
                for p_idx in range(num_parts):
                    p_start = parts[p_idx]
                    p_end = parts[p_idx + 1]
                    ring = []
                    
                    # Simplificación opcional para reducir tamaño de payload GeoJSON
                    step = simplify_step if (p_end - p_start) > 20 else 1
                    for pt_i in range(p_start, p_end, step):
                        easting = raw_points[pt_i * 2]
                        northing = raw_points[pt_i * 2 + 1]
                        lon, lat = utm14n_to_latlon(easting, northing)
                        ring.append([lon, lat])
                    
                    # Asegurar anillo cerrado
                    if ring and ring[0] != ring[-1]:
                        ring.append(ring[0])
                    if len(ring) >= 4:
                        poly_parts.append(ring)
                
                polygons.append(poly_parts)
            else:
                polygons.append([])
            
            count += 1
            if max_records and count >= max_records:
                break
                
    return polygons

def convert_shp_to_geojson(base_name: str, output_path: str, simplify_step: int = 1) -> Dict[str, Any]:
    """Genera un archivo GeoJSON estándar a partir del par .shp y .dbf."""
    shp_path = f"Sf-gto/{base_name}.shp"
    if not os.path.exists(shp_path):
        shp_path = f"Sf-gto/{base_name}.SHP"
    dbf_path = f"Sf-gto/{base_name}.dbf"
    if not os.path.exists(dbf_path):
        dbf_path = f"Sf-gto/{base_name}.DBF"
        
    logger.info(f"Procesando {base_name}: {shp_path} y {dbf_path}...")
    attributes = read_dbf(dbf_path)
    polygons = read_shp_polygons(shp_path, simplify_step=simplify_step)
    
    features = []
    for idx, (attr, poly) in enumerate(zip(attributes, polygons)):
        if not poly:
            continue
        
        # Estructurar geometría GeoJSON (Polygon o MultiPolygon)
        if len(poly) == 1:
            geom_type = "Polygon"
            coordinates = poly
        else:
            geom_type = "MultiPolygon"
            coordinates = [[ring] for ring in poly]
            
        feature = {
            "type": "Feature",
            "id": attr.get("seccion") or attr.get("municipio") or attr.get("distrito_l") or idx + 1,
            "properties": attr,
            "geometry": {
                "type": geom_type,
                "coordinates": coordinates
            }
        }
        features.append(feature)
        
    geojson = {
        "type": "FeatureCollection",
        "name": base_name,
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
        },
        "features": features
    }
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False)
        
    logger.info(f"✅ Generado GeoJSON para {base_name}: {len(features)} polígonos guardados en {output_path} ({os.path.getsize(output_path) / 1024 / 1024:.2f} MB)")
    return geojson

def main():
    logger.info("Iniciando procesamiento de Shapefiles del Marco Electoral de Guanajuato (Sf-gto)...")
    
    output_dir = "nextjs-app/public/data"
    
    # 1. Municipios (46)
    convert_shp_to_geojson("MUNICIPIO", f"{output_dir}/gto_municipios.geojson", simplify_step=1)
    
    # 2. Distritos Locales (22)
    convert_shp_to_geojson("DISTRITO_LOCAL", f"{output_dir}/gto_distritos_locales.geojson", simplify_step=1)
    
    # 3. Distritos Federales (15)
    convert_shp_to_geojson("DISTRITO_FEDERAL", f"{output_dir}/gto_distritos_federales.geojson", simplify_step=1)
    
    # 4. Secciones Electorales (~3,357) - Con paso de muestreo inteligente para máxima fluidez en WebGIS
    convert_shp_to_geojson("SECCION", f"{output_dir}/gto_secciones.geojson", simplify_step=2)
    
    logger.info("🎉 Procesamiento de geometrías electorales completado exitosamente.")

if __name__ == "__main__":
    main()
