import os
import csv
import json
import logging
from typing import List, Dict, Any, Tuple

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("electoral_importer")

CSV_HEADER = [
    "año", "tipo_eleccion", "clave_seccion", "clave_municipio", 
    "lista_nominal", "total_votos", 
    "pan", "morena", "pri", "mc", "pvem", "pt", "prd", "otros", "nulos"
]

def generate_csv_template(output_path: str = "scripts/plantilla_resultados_electorales.csv"):
    """Genera el archivo plantilla CSV con la estructura requerida."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    sample_rows = [
        CSV_HEADER,
        ["2024", "Gobernador", "1", "1", "2150", "1380", "680", "450", "110", "40", "30", "20", "10", "15", "25"],
        ["2024", "Gobernador", "2", "1", "1980", "1210", "590", "410", "95", "35", "25", "18", "8", "12", "17"],
        ["2021", "Alcaldia", "1", "1", "2050", "1150", "580", "360", "120", "25", "20", "15", "10", "10", "10"],
        ["2018", "Gobernador", "1", "1", "1920", "1240", "620", "280", "210", "15", "35", "20", "15", "20", "25"]
    ]
    with open(output_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(sample_rows)
    logger.info(f"✅ Plantilla CSV creada en: {output_path}")

def parse_electoral_csv(csv_path: str) -> List[Dict[str, Any]]:
    """Lee y procesa un archivo CSV de resultados electorales con cálculo automático de métricas."""
    if not os.path.exists(csv_path):
        logger.warning(f"Archivo no encontrado: {csv_path}")
        return []

    results = []
    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        
        # Normalizar nombres de columnas a minúsculas
        fieldnames = [c.strip().lower() for c in reader.fieldnames or []]
        
        for line_num, row in enumerate(reader, start=2):
            norm_row = {k.strip().lower(): v.strip() for k, v in row.items()}
            
            try:
                year = int(norm_row.get("año") or norm_row.get("anio") or norm_row.get("year") or 2024)
                election_type = norm_row.get("tipo_eleccion") or norm_row.get("eleccion") or "Gobernador"
                seccion = int(norm_row.get("clave_seccion") or norm_row.get("seccion") or 0)
                municipio = int(norm_row.get("clave_municipio") or norm_row.get("municipio") or 0)
                
                lista_nominal = int(norm_row.get("lista_nominal") or 0)
                total_votos = int(norm_row.get("total_votos") or 0)
                
                if seccion == 0:
                    continue
                
                # Partidos dinámicos
                party_votes = {}
                excluded_keys = {"año", "anio", "year", "tipo_eleccion", "eleccion", "clave_seccion", "seccion", "clave_municipio", "municipio", "lista_nominal", "total_votos"}
                for k, v in norm_row.items():
                    if k not in excluded_keys and v != "":
                        try:
                            party_votes[k.upper()] = int(float(v))
                        except ValueError:
                            pass
                
                # Recalcular total de votos si viene en 0
                if total_votos == 0 and party_votes:
                    total_votos = sum(party_votes.values())
                
                # Calcular ganador y segundo lugar
                sorted_parties = sorted(party_votes.items(), key=lambda x: x[1], reverse=True)
                ganador_partido = sorted_parties[0][0] if sorted_parties else "SIN_DATOS"
                ganador_votos = sorted_parties[0][1] if sorted_parties else 0
                ganador_pct = round((ganador_votos / total_votos * 100), 2) if total_votos > 0 else 0.0
                
                segundo_partido = sorted_parties[1][0] if len(sorted_parties) > 1 else None
                segundo_votos = sorted_parties[1][1] if len(sorted_parties) > 1 else 0
                segundo_pct = round((segundo_votos / total_votos * 100), 2) if total_votos > 0 else 0.0
                
                margen_pct = round(ganador_pct - segundo_pct, 2)
                participacion_pct = round((total_votos / lista_nominal * 100), 2) if lista_nominal > 0 else 0.0
                
                results.append({
                    "election_year": year,
                    "election_type": election_type,
                    "clave_seccion": seccion,
                    "clave_municipio": municipio,
                    "lista_nominal": lista_nominal,
                    "total_votos": total_votos,
                    "participacion_pct": participacion_pct,
                    "ganador_partido": ganador_partido,
                    "ganador_votos": ganador_votos,
                    "ganador_pct": ganador_pct,
                    "segundo_partido": segundo_partido,
                    "segundo_votos": segundo_votos,
                    "segundo_pct": segundo_pct,
                    "margen_victoria_pct": margen_pct,
                    "votos_partidos": party_votes
                })
            except Exception as e:
                logger.warning(f"Error en fila {line_num} de {csv_path}: {e}")
                
    logger.info(f"✅ Procesados {len(results)} registros de resultados electorales desde {csv_path}")
    return results

def build_electoral_cache(results: List[Dict[str, Any]], output_path: str = "nextjs-app/public/data/electoral_results_cache.json"):
    """Construye un índice estructurado por año -> clave_seccion para búsqueda ultrarrápida en cliente."""
    cache = {}
    for r in results:
        year_str = str(r["election_year"])
        seccion_str = str(r["clave_seccion"])
        if year_str not in cache:
            cache[year_str] = {}
        cache[year_str][seccion_str] = r
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)
    logger.info(f"✅ Caché de resultados electorales guardada en: {output_path}")

def main():
    logger.info("Iniciando procesador de resultados electorales...")
    generate_csv_template()
    
    # Procesar plantilla base de referencia
    sample_results = parse_electoral_csv("scripts/plantilla_resultados_electorales.csv")
    build_electoral_cache(sample_results)

if __name__ == "__main__":
    main()
