"""
Procesador e Ingestor Electoral Oficial de Chihuahua (2016 - 2024)
------------------------------------------------------------------
Procesa las 5 pestañas exactas del archivo oficial del INE:
  'data/Chihuahua/electoral/Elecciones Chihuahua 2018 - 2024.xlsx':
  1. Gubernatura 2016 (Header row: 4, 0-indexed)
  2. Gubernatura 2021 (Header row: 0, 0-indexed)
  3. Diputaciones 2018 (Header row: 5, 0-indexed)
  4. Diputaciones 2021 (Header row: 5, 0-indexed)
  5. Diputaciones 2024 (Header row: 6, 0-indexed)

Cruza y proyecta la información sobre los 3,311 secciones, 67 municipios,
22 distritos locales y 9 distritos federales de Chihuahua.

Genera:
  - nextjs-app/public/data/chi_electoral_results_cache.json
  - data/electoral/ingest_chihuahua_electoral_results.sql
"""

import os
import sys
import json
from pathlib import Path
import pandas as pd
import numpy as np
import unicodedata
import shapefile

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_DIR = Path(__file__).resolve().parent.parent
STATE_ID_CHI = "08080808-0808-0808-0808-080808080808"
EXCEL_PATH = BASE_DIR / "data" / "Chihuahua" / "electoral" / "Elecciones Chihuahua 2018 - 2024.xlsx"
SHP_DIR = BASE_DIR / "data" / "Chihuahua" / "Shp-files"
OUTPUT_CACHE_PATH = BASE_DIR / "nextjs-app" / "public" / "data" / "chi_electoral_results_cache.json"
OUTPUT_SQL_PATH = BASE_DIR / "data" / "electoral" / "ingest_chihuahua_electoral_results.sql"

OUTPUT_CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
OUTPUT_SQL_PATH.parent.mkdir(parents=True, exist_ok=True)

def norm_text(s):
    if not s:
        return ""
    return "".join(
        c for c in unicodedata.normalize("NFD", str(s).upper().strip())
        if unicodedata.category(c) != "Mn"
    )

def clean_numeric_series(series: pd.Series) -> pd.Series:
    return pd.to_numeric(
        series.astype(str).str.replace(",", "").str.replace("'", "").str.strip(),
        errors="coerce"
    ).fillna(0)

def main():
    print("==================================================================")
    print(" 🗳️ SentinelIQ — Procesador Electoral de Chihuahua (2016 - 2024)")
    print("==================================================================")

    if not EXCEL_PATH.exists():
        print(f"❌ Archivo no encontrado: {EXCEL_PATH}")
        return

    # 1. Cargar catálogo de Municipios y Secciones desde Shapefiles INE
    print("🔍 Cargando catálogo cartográfico desde Shapefiles INE...")
    muni_sf = shapefile.Reader(str(SHP_DIR / "MUNICIPIO.shp"), encoding="latin1")
    muni_map = {}
    muni_name_to_id = {}
    for r in muni_sf.records():
        mid = int(r["municipio"])
        raw_name = str(r["nombre"]).strip().title()
        muni_map[mid] = raw_name
        muni_name_to_id[raw_name] = mid
        muni_name_to_id[raw_name.upper()] = mid
        muni_name_to_id[norm_text(raw_name)] = mid

    print(f"  • {len(muni_map)} municipios oficiales cargados.")

    sec_sf = shapefile.Reader(str(SHP_DIR / "SECCION.shp"), encoding="latin1")
    sec_to_mun = {}
    sec_to_mun_id = {}
    sec_to_dl = {}
    sec_to_df = {}

    for r in sec_sf.records():
        s = int(r["seccion"])
        mid = int(r["municipio"])
        sec_to_mun_id[s] = mid
        sec_to_mun[s] = muni_map.get(mid, f"Municipio {mid}")
        sec_to_dl[s] = int(r["distrito_l"])
        sec_to_df[s] = int(r["distrito_f"])

    print(f"  • {len(sec_to_mun):,} secciones vinculadas a municipios y distritos.")

    # 2. Inicializar Master Cache
    master_cache = {
        "gubernatura": {"2021": {}, "2016": {}},
        "diputaciones": {"2024": {}, "2021": {}, "2018": {}},
        "municipios": {
            "gubernatura": {"2021": {}, "2016": {}},
            "diputaciones": {"2024": {}, "2021": {}, "2018": {}},
        },
        "distritos_locales": {
            "gubernatura": {"2021": {}, "2016": {}},
            "diputaciones": {"2024": {}, "2021": {}, "2018": {}},
        },
        "distritos_federales": {
            "gubernatura": {"2021": {}, "2016": {}},
            "diputaciones": {"2024": {}, "2021": {}, "2018": {}},
        }
    }

    print(f"\n📂 Abriendo archivo Excel: {EXCEL_PATH}...")
    xl = pd.ExcelFile(EXCEL_PATH)
    all_processed_dfs = []

    # =========================================================================
    # ELECCIÓN 1: DIPUTACIONES 2018
    # =========================================================================
    print("\n-------------------------------------------------------")
    print("📖 Procesando: Diputaciones 2018")
    print("-------------------------------------------------------")
    df18 = pd.read_excel(xl, sheet_name="Diputaciones 2018", header=5)
    df18["SECCION_INT"] = clean_numeric_series(df18["SECCION"]).astype(int)
    df18 = df18[df18["SECCION_INT"] > 0].copy()

    pan_cols_18 = [c for c in ["PAN", "PRD", "MOVIMIENTO CIUDADANO", "PAN_PRD_MC", "PAN_PRD", "PAN_MC", "PRD_MC"] if c in df18.columns]
    mor_cols_18 = [c for c in ["MORENA", "PT", "ENCUENTRO SOCIAL", "PT_MORENA_PES", "PT_MORENA", "PT_PES", "MORENA_PES"] if c in df18.columns]
    pri_cols_18 = [c for c in ["PRI", "PVEM", "NUEVA ALIANZA", "PRI_PVEM_NA", "PRI_PVEM", "PRI_NA", "PVEM_NA"] if c in df18.columns]
    ind_cols_18 = [c for c in ["CAND_IND_01", "CAND_IND_02"] if c in df18.columns]

    for c in pan_cols_18 + mor_cols_18 + pri_cols_18 + ind_cols_18 + ["TOTAL_VOTOS_CALCULADOS", "LISTA_NOMINAL_CASILLA"]:
        if c in df18.columns:
            df18[c] = clean_numeric_series(df18[c])

    grp18 = df18.groupby("SECCION_INT").agg({
        **{c: "sum" for c in pan_cols_18 + mor_cols_18 + pri_cols_18 + ind_cols_18},
        "TOTAL_VOTOS_CALCULADOS": "sum",
        "LISTA_NOMINAL_CASILLA": "sum",
    }).reset_index()

    grp18["VOTOS_PAN"] = grp18[pan_cols_18].sum(axis=1)
    grp18["VOTOS_MORENA"] = grp18[mor_cols_18].sum(axis=1)
    grp18["VOTOS_PRI"] = grp18[pri_cols_18].sum(axis=1)
    grp18["VOTOS_MC"] = grp18["MOVIMIENTO CIUDADANO"] if "MOVIMIENTO CIUDADANO" in grp18.columns else 0
    grp18["VOTOS_IND"] = grp18[ind_cols_18].sum(axis=1) if ind_cols_18 else 0
    grp18["TOTAL_VOTOS"] = grp18["TOTAL_VOTOS_CALCULADOS"]
    grp18["LISTA_NOMINAL"] = grp18["LISTA_NOMINAL_CASILLA"]
    grp18["PARTICIPACION_PCT"] = np.where(
        grp18["LISTA_NOMINAL"] > 0,
        (grp18["TOTAL_VOTOS"] / grp18["LISTA_NOMINAL"] * 100).round(2),
        0.0
    )

    def calc_winner_18(r):
        cand = [
            ("PAN-PRD-MC", int(r["VOTOS_PAN"])),
            ("MORENA-PT-PES", int(r["VOTOS_MORENA"])),
            ("PRI-PVEM-NA", int(r["VOTOS_PRI"])),
            ("MC", int(r["VOTOS_MC"])),
            ("CAND_IND", int(r["VOTOS_IND"])),
        ]
        cand.sort(key=lambda x: x[1], reverse=True)
        wp, wv = cand[0]
        sp, sv = cand[1]
        tv = int(r["TOTAL_VOTOS"]) if r["TOTAL_VOTOS"] > 0 else (wv + sv)
        wpct = round((wv / tv * 100), 2) if tv > 0 else 0.0
        spct = round((sv / tv * 100), 2) if tv > 0 else 0.0
        mg = round(wpct - spct, 2)
        vpart = {
            "PAN-PRD-MC": int(r["VOTOS_PAN"]),
            "MORENA-PT-PES": int(r["VOTOS_MORENA"]),
            "PRI-PVEM-NA": int(r["VOTOS_PRI"]),
            "MC": int(r["VOTOS_MC"]),
            "CAND_IND": int(r["VOTOS_IND"]),
            "PAN_ALIANZA": int(r["VOTOS_PAN"]),
            "OPOSICION_ALIANZA": int(r["VOTOS_MORENA"]),
        }
        return pd.Series([wp, wv, wpct, sp, sv, spct, mg, json.dumps(vpart)])

    grp18[[
        "GANADOR_PARTIDO", "GANADOR_VOTOS", "GANADOR_PCT",
        "SEGUNDO_PARTIDO", "SEGUNDO_VOTOS", "SEGUNDO_PCT",
        "MARGEN_VICTORIA_PCT", "VOTOS_PARTIDOS_JSON"
    ]] = grp18.apply(calc_winner_18, axis=1)
    grp18["ELECTION_YEAR"] = 2018
    grp18["ELECTION_TYPE"] = "diputaciones"
    all_processed_dfs.append(grp18)
    print(f"  • Secciones agrupadas: {len(grp18):,} | Votos Totales: {grp18['TOTAL_VOTOS'].sum():,.0f}")

    # =========================================================================
    # ELECCIÓN 2: DIPUTACIONES 2021
    # =========================================================================
    print("\n-------------------------------------------------------")
    print("📖 Procesando: Diputaciones 2021")
    print("-------------------------------------------------------")
    df21d = pd.read_excel(xl, sheet_name="Diputaciones 2021", header=5)
    df21d["SECCION_INT"] = clean_numeric_series(df21d["SECCION"]).astype(int)
    df21d = df21d[df21d["SECCION_INT"] > 0].copy()

    pan_cols_21 = [c for c in ["PAN", "PRI", "PRD", "PAN-PRI-PRD", "PAN-PRI", "PAN-PRD", "PRI-PRD"] if c in df21d.columns]
    mor_cols_21 = [c for c in ["MORENA", "PT", "PVEM", "PVEM-PT-MORENA", "PVEM-PT", "PVEM-MORENA", "PT-MORENA"] if c in df21d.columns]
    mc_col_21 = "MC" if "MC" in df21d.columns else None

    for c in pan_cols_21 + mor_cols_21 + ([mc_col_21] if mc_col_21 else []) + ["TOTAL_VOTOS_CALCULADOS", "LISTA_NOMINAL_CASILLA"]:
        if c in df21d.columns:
            df21d[c] = clean_numeric_series(df21d[c])

    grp21d = df21d.groupby("SECCION_INT").agg({
        **{c: "sum" for c in pan_cols_21 + mor_cols_21 + ([mc_col_21] if mc_col_21 else [])},
        "TOTAL_VOTOS_CALCULADOS": "sum",
        "LISTA_NOMINAL_CASILLA": "sum",
    }).reset_index()

    grp21d["VOTOS_PAN"] = grp21d[pan_cols_21].sum(axis=1)
    grp21d["VOTOS_MORENA"] = grp21d[mor_cols_21].sum(axis=1)
    grp21d["VOTOS_MC"] = grp21d[mc_col_21] if mc_col_21 else 0
    grp21d["TOTAL_VOTOS"] = grp21d["TOTAL_VOTOS_CALCULADOS"]
    grp21d["LISTA_NOMINAL"] = grp21d["LISTA_NOMINAL_CASILLA"]
    grp21d["PARTICIPACION_PCT"] = np.where(
        grp21d["LISTA_NOMINAL"] > 0,
        (grp21d["TOTAL_VOTOS"] / grp21d["LISTA_NOMINAL"] * 100).round(2),
        0.0
    )

    def calc_winner_21d(r):
        cand = [
            ("PAN-PRI-PRD", int(r["VOTOS_PAN"])),
            ("MORENA-PT-PVEM", int(r["VOTOS_MORENA"])),
            ("MC", int(r["VOTOS_MC"])),
        ]
        cand.sort(key=lambda x: x[1], reverse=True)
        wp, wv = cand[0]
        sp, sv = cand[1]
        tv = int(r["TOTAL_VOTOS"]) if r["TOTAL_VOTOS"] > 0 else (wv + sv)
        wpct = round((wv / tv * 100), 2) if tv > 0 else 0.0
        spct = round((sv / tv * 100), 2) if tv > 0 else 0.0
        mg = round(wpct - spct, 2)
        vpart = {
            "PAN-PRI-PRD": int(r["VOTOS_PAN"]),
            "MORENA-PT-PVEM": int(r["VOTOS_MORENA"]),
            "MC": int(r["VOTOS_MC"]),
            "PAN_ALIANZA": int(r["VOTOS_PAN"]),
            "OPOSICION_ALIANZA": int(r["VOTOS_MORENA"]),
        }
        return pd.Series([wp, wv, wpct, sp, sv, spct, mg, json.dumps(vpart)])

    grp21d[[
        "GANADOR_PARTIDO", "GANADOR_VOTOS", "GANADOR_PCT",
        "SEGUNDO_PARTIDO", "SEGUNDO_VOTOS", "SEGUNDO_PCT",
        "MARGEN_VICTORIA_PCT", "VOTOS_PARTIDOS_JSON"
    ]] = grp21d.apply(calc_winner_21d, axis=1)
    grp21d["ELECTION_YEAR"] = 2021
    grp21d["ELECTION_TYPE"] = "diputaciones"
    all_processed_dfs.append(grp21d)
    print(f"  • Secciones agrupadas: {len(grp21d):,} | Votos Totales: {grp21d['TOTAL_VOTOS'].sum():,.0f}")

    # =========================================================================
    # ELECCIÓN 3: DIPUTACIONES 2024
    # =========================================================================
    print("\n-------------------------------------------------------")
    print("📖 Procesando: Diputaciones 2024")
    print("-------------------------------------------------------")
    df24 = pd.read_excel(xl, sheet_name="Diputaciones 2024", header=6)
    df24["SECCION_INT"] = clean_numeric_series(df24["SECCION"]).astype(int)
    df24 = df24[df24["SECCION_INT"] > 0].copy()

    pan_cols_24 = [c for c in ["PAN", "PRI", "PRD", "PAN-PRI-PRD", "PAN-PRI", "PAN-PRD", "PRI-PRD"] if c in df24.columns]
    mor_cols_24 = [c for c in ["MORENA", "PT", "PVEM", "PVEM_PT_MORENA", "PVEM_PT", "PVEM_MORENA", "PT_MORENA"] if c in df24.columns]
    mc_col_24 = "MC" if "MC" in df24.columns else None
    ind_cols_24 = [c for c in ["CI_01", "CI_02"] if c in df24.columns]

    for c in pan_cols_24 + mor_cols_24 + ind_cols_24 + ([mc_col_24] if mc_col_24 else []) + ["TOTAL_VOTOS_CALCULADO", "LISTA_NOMINAL"]:
        if c in df24.columns:
            df24[c] = clean_numeric_series(df24[c])

    grp24 = df24.groupby("SECCION_INT").agg({
        **{c: "sum" for c in pan_cols_24 + mor_cols_24 + ind_cols_24 + ([mc_col_24] if mc_col_24 else [])},
        "TOTAL_VOTOS_CALCULADO": "sum",
        "LISTA_NOMINAL": "sum",
    }).reset_index()

    grp24["VOTOS_PAN"] = grp24[pan_cols_24].sum(axis=1)
    grp24["VOTOS_MORENA"] = grp24[mor_cols_24].sum(axis=1)
    grp24["VOTOS_MC"] = grp24[mc_col_24] if mc_col_24 else 0
    grp24["VOTOS_IND"] = grp24[ind_cols_24].sum(axis=1) if ind_cols_24 else 0
    grp24["TOTAL_VOTOS"] = grp24["TOTAL_VOTOS_CALCULADO"]
    grp24["PARTICIPACION_PCT"] = np.where(
        grp24["LISTA_NOMINAL"] > 0,
        (grp24["TOTAL_VOTOS"] / grp24["LISTA_NOMINAL"] * 100).round(2),
        0.0
    )

    def calc_winner_24(r):
        cand = [
            ("MORENA-PT-PVEM", int(r["VOTOS_MORENA"])),
            ("PAN-PRI-PRD", int(r["VOTOS_PAN"])),
            ("MC", int(r["VOTOS_MC"])),
            ("CAND_IND", int(r["VOTOS_IND"])),
        ]
        cand.sort(key=lambda x: x[1], reverse=True)
        wp, wv = cand[0]
        sp, sv = cand[1]
        tv = int(r["TOTAL_VOTOS"]) if r["TOTAL_VOTOS"] > 0 else (wv + sv)
        wpct = round((wv / tv * 100), 2) if tv > 0 else 0.0
        spct = round((sv / tv * 100), 2) if tv > 0 else 0.0
        mg = round(wpct - spct, 2)
        vpart = {
            "MORENA-PT-PVEM": int(r["VOTOS_MORENA"]),
            "PAN-PRI-PRD": int(r["VOTOS_PAN"]),
            "MC": int(r["VOTOS_MC"]),
            "CAND_IND": int(r["VOTOS_IND"]),
            "PAN_ALIANZA": int(r["VOTOS_PAN"]),
            "OPOSICION_ALIANZA": int(r["VOTOS_MORENA"]),
        }
        return pd.Series([wp, wv, wpct, sp, sv, spct, mg, json.dumps(vpart)])

    grp24[[
        "GANADOR_PARTIDO", "GANADOR_VOTOS", "GANADOR_PCT",
        "SEGUNDO_PARTIDO", "SEGUNDO_VOTOS", "SEGUNDO_PCT",
        "MARGEN_VICTORIA_PCT", "VOTOS_PARTIDOS_JSON"
    ]] = grp24.apply(calc_winner_24, axis=1)
    grp24["ELECTION_YEAR"] = 2024
    grp24["ELECTION_TYPE"] = "diputaciones"
    all_processed_dfs.append(grp24)
    print(f"  • Secciones agrupadas: {len(grp24):,} | Votos Totales: {grp24['TOTAL_VOTOS'].sum():,.0f}")

    # =========================================================================
    # ELECCIÓN 4: GUBERNATURA 2021
    # =========================================================================
    print("\n-------------------------------------------------------")
    print("📖 Procesando: Gubernatura 2021")
    print("-------------------------------------------------------")
    df21g = pd.read_excel(xl, sheet_name="Gubernatura 2021", header=0)
    df21g["SECCION_INT"] = clean_numeric_series(df21g["SECCION"]).astype(int)
    df21g = df21g[df21g["SECCION_INT"] > 0].copy()

    # Detectar columnas exactas
    col_pan_prd = [c for c in df21g.columns if "PAN" in str(c) and "PRD" in str(c)][0]
    col_mor_pt = [c for c in df21g.columns if "PT" in str(c) and "MORENA" in str(c)][0]
    col_pri = "PRI"
    col_mc = "MC"

    for c in [col_pan_prd, col_mor_pt, col_pri, col_mc, "TOTAL VOTOS", "LISTA NOMINAL"]:
        if c in df21g.columns:
            df21g[c] = clean_numeric_series(df21g[c])

    grp21g = df21g.groupby("SECCION_INT").agg({
        col_pan_prd: "sum",
        col_mor_pt: "sum",
        col_pri: "sum",
        col_mc: "sum",
        "TOTAL VOTOS": "sum",
        "LISTA NOMINAL": "sum",
    }).reset_index()

    grp21g["VOTOS_PAN"] = grp21g[col_pan_prd]
    grp21g["VOTOS_MORENA"] = grp21g[col_mor_pt]
    grp21g["VOTOS_PRI"] = grp21g[col_pri]
    grp21g["VOTOS_MC"] = grp21g[col_mc]
    grp21g["TOTAL_VOTOS"] = grp21g["TOTAL VOTOS"]
    grp21g["LISTA_NOMINAL"] = grp21g["LISTA NOMINAL"]
    grp21g["PARTICIPACION_PCT"] = np.where(
        grp21g["LISTA_NOMINAL"] > 0,
        (grp21g["TOTAL_VOTOS"] / grp21g["LISTA_NOMINAL"] * 100).round(2),
        0.0
    )

    def calc_winner_21g(r):
        cand = [
            ("PAN-PRD", int(r["VOTOS_PAN"])),
            ("MORENA-PT-NACH", int(r["VOTOS_MORENA"])),
            ("PRI", int(r["VOTOS_PRI"])),
            ("MC", int(r["VOTOS_MC"])),
        ]
        cand.sort(key=lambda x: x[1], reverse=True)
        wp, wv = cand[0]
        sp, sv = cand[1]
        tv = int(r["TOTAL_VOTOS"]) if r["TOTAL_VOTOS"] > 0 else (wv + sv)
        wpct = round((wv / tv * 100), 2) if tv > 0 else 0.0
        spct = round((sv / tv * 100), 2) if tv > 0 else 0.0
        mg = round(wpct - spct, 2)
        vpart = {
            "PAN-PRD": int(r["VOTOS_PAN"]),
            "MORENA-PT-NACH": int(r["VOTOS_MORENA"]),
            "PRI": int(r["VOTOS_PRI"]),
            "MC": int(r["VOTOS_MC"]),
            "PAN_ALIANZA": int(r["VOTOS_PAN"]),
            "OPOSICION_ALIANZA": int(r["VOTOS_MORENA"]),
        }
        return pd.Series([wp, wv, wpct, sp, sv, spct, mg, json.dumps(vpart)])

    grp21g[[
        "GANADOR_PARTIDO", "GANADOR_VOTOS", "GANADOR_PCT",
        "SEGUNDO_PARTIDO", "SEGUNDO_VOTOS", "SEGUNDO_PCT",
        "MARGEN_VICTORIA_PCT", "VOTOS_PARTIDOS_JSON"
    ]] = grp21g.apply(calc_winner_21g, axis=1)
    grp21g["ELECTION_YEAR"] = 2021
    grp21g["ELECTION_TYPE"] = "gubernatura"
    all_processed_dfs.append(grp21g)
    print(f"  • Secciones agrupadas: {len(grp21g):,} | Votos Totales: {grp21g['TOTAL_VOTOS'].sum():,.0f}")

    # =========================================================================
    # ELECCIÓN 5: GUBERNATURA 2016
    # =========================================================================
    print("\n-------------------------------------------------------")
    print("📖 Procesando: Gubernatura 2016")
    print("-------------------------------------------------------")
    df16_raw = pd.read_excel(xl, sheet_name="Gubernatura 2016", header=None)
    df16 = df16_raw.iloc[4:].copy()
    df16["SECCION_INT"] = clean_numeric_series(df16[3]).astype(int)
    df16 = df16[df16["SECCION_INT"] > 0].copy()

    # Columnas 2016:
    # Col 5: Listado Nominal, Col 6: PAN, Col 7: PRI, Col 8: PRD, Col 9: PVEM, Col 10: PT, Col 11: MC, Col 12: PNA, Col 13: MORENA
    # Cols 14..24: Combinaciones PRI-PVEM-PT-PNA, Col 25: Jose Luis Barraza (Ind), Col 28: Total Votos
    pri_cols_16 = [7, 9, 10, 12] + list(range(14, 25))

    for col_idx in [5, 6, 8, 11, 13, 25, 28] + pri_cols_16:
        df16[col_idx] = clean_numeric_series(df16[col_idx])

    grp16 = df16.groupby("SECCION_INT").agg({
        6: "sum",   # PAN
        **{c: "sum" for c in pri_cols_16}, # PRI Alianza
        25: "sum",  # IND
        13: "sum",  # MORENA
        11: "sum",  # MC
        8: "sum",   # PRD
        28: "sum",  # TOTAL
        5: "sum",   # LISTA NOMINAL
    }).reset_index()

    grp16["VOTOS_PAN"] = grp16[6]
    grp16["VOTOS_PRI"] = grp16[pri_cols_16].sum(axis=1)
    grp16["VOTOS_IND"] = grp16[25]
    grp16["VOTOS_MORENA"] = grp16[13]
    grp16["VOTOS_MC"] = grp16[11]
    grp16["VOTOS_PRD"] = grp16[8]
    grp16["TOTAL_VOTOS"] = grp16[28]
    grp16["LISTA_NOMINAL"] = grp16[5]
    grp16["PARTICIPACION_PCT"] = np.where(
        grp16["LISTA_NOMINAL"] > 0,
        (grp16["TOTAL_VOTOS"] / grp16["LISTA_NOMINAL"] * 100).round(2),
        0.0
    )

    def calc_winner_16(r):
        cand = [
            ("PAN", int(r["VOTOS_PAN"])),
            ("PRI-PVEM-PT-PNA", int(r["VOTOS_PRI"])),
            ("INDEPENDIENTE", int(r["VOTOS_IND"])),
            ("MORENA", int(r["VOTOS_MORENA"])),
            ("MC", int(r["VOTOS_MC"])),
            ("PRD", int(r["VOTOS_PRD"])),
        ]
        cand.sort(key=lambda x: x[1], reverse=True)
        wp, wv = cand[0]
        sp, sv = cand[1]
        tv = int(r["TOTAL_VOTOS"]) if r["TOTAL_VOTOS"] > 0 else (wv + sv)
        wpct = round((wv / tv * 100), 2) if tv > 0 else 0.0
        spct = round((sv / tv * 100), 2) if tv > 0 else 0.0
        mg = round(wpct - spct, 2)
        vpart = {
            "PAN": int(r["VOTOS_PAN"]),
            "PRI-PVEM-PT-PNA": int(r["VOTOS_PRI"]),
            "INDEPENDIENTE": int(r["VOTOS_IND"]),
            "MORENA": int(r["VOTOS_MORENA"]),
            "MC": int(r["VOTOS_MC"]),
            "PRD": int(r["VOTOS_PRD"]),
            "PAN_ALIANZA": int(r["VOTOS_PAN"]),
            "OPOSICION_ALIANZA": int(r["VOTOS_PRI"]),
        }
        return pd.Series([wp, wv, wpct, sp, sv, spct, mg, json.dumps(vpart)])

    grp16[[
        "GANADOR_PARTIDO", "GANADOR_VOTOS", "GANADOR_PCT",
        "SEGUNDO_PARTIDO", "SEGUNDO_VOTOS", "SEGUNDO_PCT",
        "MARGEN_VICTORIA_PCT", "VOTOS_PARTIDOS_JSON"
    ]] = grp16.apply(calc_winner_16, axis=1)
    grp16["ELECTION_YEAR"] = 2016
    grp16["ELECTION_TYPE"] = "gubernatura"
    all_processed_dfs.append(grp16)
    print(f"  • Secciones agrupadas: {len(grp16):,} | Votos Totales: {grp16['TOTAL_VOTOS'].sum():,.0f}")

    # =========================================================================
    # CONSTRUCCIÓN DEL MASTER CACHE (SECCIONES, MUNICIPIOS, DISTRITOS)
    # =========================================================================
    print("\n-------------------------------------------------------")
    print("🧩 Agregando métricas y estructurando Master Cache...")
    print("-------------------------------------------------------")

    for df in all_processed_dfs:
        year = int(df["ELECTION_YEAR"].iloc[0])
        etype = str(df["ELECTION_TYPE"].iloc[0])
        yr_str = str(year)

        mpio_acc = {}
        dist_loc_acc = {}
        dist_fed_acc = {}

        for _, r in df.iterrows():
            sec = int(r["SECCION_INT"])
            sec_str = str(sec)
            ln = int(r["LISTA_NOMINAL"])
            tv = int(r["TOTAL_VOTOS"])
            part = float(r["PARTICIPACION_PCT"])
            wp = str(r["GANADOR_PARTIDO"])
            wv = int(r["GANADOR_VOTOS"])
            wpct = float(r["GANADOR_PCT"])
            sp = str(r["SEGUNDO_PARTIDO"])
            sv = int(r["SEGUNDO_VOTOS"])
            spct = float(r["SEGUNDO_PCT"])
            mg = float(r["MARGEN_VICTORIA_PCT"])
            vpart = json.loads(r["VOTOS_PARTIDOS_JSON"])

            mid = sec_to_mun_id.get(sec, 1)
            mun_name = sec_to_mun.get(sec, f"Municipio {mid}")
            dl = sec_to_dl.get(sec, 1)
            dfed = sec_to_df.get(sec, 1)

            item = {
                "election_year": year,
                "election_type": etype,
                "clave_seccion": sec,
                "clave_municipio": mid,
                "municipio_nombre": mun_name,
                "distrito_local": dl,
                "distrito_federal": dfed,
                "lista_nominal": ln,
                "total_votos": tv,
                "participacion_pct": part,
                "ganador_partido": wp,
                "ganador_votos": wv,
                "ganador_pct": wpct,
                "segundo_partido": sp,
                "segundo_votos": sv,
                "segundo_pct": spct,
                "margen_victoria_pct": mg,
                "votos_partidos": vpart,
            }

            master_cache[etype][yr_str][sec_str] = item

            # Acumulador por municipio
            if mid not in mpio_acc:
                mpio_acc[mid] = {
                    "nombre": mun_name,
                    "ln": 0,
                    "tv": 0,
                    "sec_count": 0,
                    "partidos": {}
                }
            mpio_acc[mid]["ln"] += ln
            mpio_acc[mid]["tv"] += tv
            mpio_acc[mid]["sec_count"] += 1
            for p, v in vpart.items():
                if not p.endswith("_ALIANZA"):
                    mpio_acc[mid]["partidos"][p] = mpio_acc[mid]["partidos"].get(p, 0) + v

            # Acumulador por distrito local
            dl_str = str(dl)
            if dl_str not in dist_loc_acc:
                dist_loc_acc[dl_str] = {
                    "dl": dl,
                    "nombre": f"Distrito Local {dl}",
                    "ln": 0,
                    "tv": 0,
                    "sec_count": 0,
                    "partidos": {}
                }
            dist_loc_acc[dl_str]["ln"] += ln
            dist_loc_acc[dl_str]["tv"] += tv
            dist_loc_acc[dl_str]["sec_count"] += 1
            for p, v in vpart.items():
                if not p.endswith("_ALIANZA"):
                    dist_loc_acc[dl_str]["partidos"][p] = dist_loc_acc[dl_str]["partidos"].get(p, 0) + v

            # Acumulador por distrito federal
            df_str = str(dfed)
            if df_str not in dist_fed_acc:
                dist_fed_acc[df_str] = {
                    "df": dfed,
                    "nombre": f"Distrito Federal {dfed}",
                    "ln": 0,
                    "tv": 0,
                    "sec_count": 0,
                    "partidos": {}
                }
            dist_fed_acc[df_str]["ln"] += ln
            dist_fed_acc[df_str]["tv"] += tv
            dist_fed_acc[df_str]["sec_count"] += 1
            for p, v in vpart.items():
                if not p.endswith("_ALIANZA"):
                    dist_fed_acc[df_str]["partidos"][p] = dist_fed_acc[df_str]["partidos"].get(p, 0) + v

        # Consolidar Municipios
        for mid, mdata in mpio_acc.items():
            tot = mdata["tv"]
            ln = mdata["ln"]
            m_part = round((tot / ln * 100), 2) if ln > 0 else 0.0

            cand = list(mdata["partidos"].items())
            cand.sort(key=lambda x: x[1], reverse=True)
            mw_p, mw_v = cand[0] if cand else ("SIN_DATOS", 0)
            ms_p, ms_v = cand[1] if len(cand) > 1 else ("SIN_DATOS", 0)

            mw_pct = round((mw_v / tot * 100), 2) if tot > 0 else 0.0
            ms_pct = round((ms_v / tot * 100), 2) if tot > 0 else 0.0
            mmg = round(mw_pct - ms_pct, 2)

            m_item = {
                "election_year": year,
                "election_type": etype,
                "clave_municipio": mid,
                "nombre": mdata["nombre"],
                "secciones_count": mdata["sec_count"],
                "lista_nominal": ln,
                "total_votos": tot,
                "participacion_pct": m_part,
                "ganador_partido": mw_p,
                "ganador_votos": mw_v,
                "ganador_pct": mw_pct,
                "segundo_partido": ms_p,
                "segundo_votos": ms_v,
                "segundo_pct": ms_pct,
                "margen_victoria_pct": mmg,
                "votos_partidos": mdata["partidos"],
            }

            mun_name = mdata["nombre"]
            master_cache["municipios"][etype][yr_str][mun_name] = m_item
            master_cache["municipios"][etype][yr_str][mun_name.upper()] = m_item
            master_cache["municipios"][etype][yr_str][norm_text(mun_name)] = m_item
            master_cache["municipios"][etype][yr_str][str(mid)] = m_item

        # Consolidar Distritos Locales
        for dl_str, dldata in dist_loc_acc.items():
            tot = dldata["tv"]
            ln = dldata["ln"]
            dl_part = round((tot / ln * 100), 2) if ln > 0 else 0.0

            cand = list(dldata["partidos"].items())
            cand.sort(key=lambda x: x[1], reverse=True)
            dw_p, dw_v = cand[0] if cand else ("SIN_DATOS", 0)
            ds_p, ds_v = cand[1] if len(cand) > 1 else ("SIN_DATOS", 0)

            dw_pct = round((dw_v / tot * 100), 2) if tot > 0 else 0.0
            ds_pct = round((ds_v / tot * 100), 2) if tot > 0 else 0.0

            dl_item = {
                "election_year": year,
                "election_type": etype,
                "distrito_local": dldata["dl"],
                "nombre": dldata["nombre"],
                "secciones_count": dldata["sec_count"],
                "lista_nominal": ln,
                "total_votos": tot,
                "participacion_pct": dl_part,
                "ganador_partido": dw_p,
                "ganador_votos": dw_v,
                "ganador_pct": dw_pct,
                "segundo_partido": ds_p,
                "segundo_votos": ds_v,
                "segundo_pct": ds_pct,
                "margen_victoria_pct": round(dw_pct - ds_pct, 2),
                "votos_partidos": dldata["partidos"],
            }
            master_cache["distritos_locales"][etype][yr_str][dl_str] = dl_item

        # Consolidar Distritos Federales
        for df_str, dfdata in dist_fed_acc.items():
            tot = dfdata["tv"]
            ln = dfdata["ln"]
            df_part = round((tot / ln * 100), 2) if ln > 0 else 0.0

            cand = list(dfdata["partidos"].items())
            cand.sort(key=lambda x: x[1], reverse=True)
            fw_p, fw_v = cand[0] if cand else ("SIN_DATOS", 0)
            fs_p, fs_v = cand[1] if len(cand) > 1 else ("SIN_DATOS", 0)

            fw_pct = round((fw_v / tot * 100), 2) if tot > 0 else 0.0
            fs_pct = round((fs_v / tot * 100), 2) if tot > 0 else 0.0

            df_item = {
                "election_year": year,
                "election_type": etype,
                "distrito_federal": dfdata["df"],
                "nombre": dfdata["nombre"],
                "secciones_count": dfdata["sec_count"],
                "lista_nominal": ln,
                "total_votos": tot,
                "participacion_pct": df_part,
                "ganador_partido": fw_p,
                "ganador_votos": fw_v,
                "ganador_pct": fw_pct,
                "segundo_partido": fs_p,
                "segundo_votos": fs_v,
                "segundo_pct": fs_pct,
                "margen_victoria_pct": round(fw_pct - fs_pct, 2),
                "votos_partidos": dfdata["partidos"],
            }
            master_cache["distritos_federales"][etype][yr_str][df_str] = df_item

        # Accesos directos de conveniencia a nivel raíz
        if etype == "diputaciones" and yr_str == "2024":
            master_cache["2024"] = master_cache["diputaciones"]["2024"]
        elif etype == "gubernatura" and yr_str == "2021":
            master_cache["2021"] = master_cache["gubernatura"]["2021"]
        elif etype == "diputaciones" and yr_str == "2018":
            master_cache["2018"] = master_cache["diputaciones"]["2018"]
        elif etype == "gubernatura" and yr_str == "2016":
            master_cache["2016"] = master_cache["gubernatura"]["2016"]

    # 3. Guardar Cache JSON para WebGIS
    print(f"\n💾 Guardando Cache JSON en: {OUTPUT_CACHE_PATH}...")
    with open(OUTPUT_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(master_cache, f, ensure_ascii=False)
    cache_size_mb = OUTPUT_CACHE_PATH.stat().st_size / (1024 * 1024)
    print(f"✅ Cache JSON WebGIS generado con éxito ({cache_size_mb:.2f} MB).")

    # 4. Generar Script SQL de Ingesta Masiva
    print(f"\n💾 Generando archivo SQL en: {OUTPUT_SQL_PATH}...")
    total_sql_records = 0
    with open(OUTPUT_SQL_PATH, "w", encoding="utf-8") as f:
        f.write("-- ==============================================================================\n")
        f.write("-- Ingesta Masiva: Resultados Electorales Oficiales de Chihuahua (2016 - 2024)\n")
        f.write(f"-- State ID Chihuahua: {STATE_ID_CHI}\n")
        f.write("-- ==============================================================================\n\n")

        for df in all_processed_dfs:
            year = int(df["ELECTION_YEAR"].iloc[0])
            etype = str(df["ELECTION_TYPE"].iloc[0])

            f.write(f"-- ------------------------------------------------------------------------\n")
            f.write(f"-- Proceso: {etype.upper()} {year} ({len(df):,} secciones electorales)\n")
            f.write(f"-- ------------------------------------------------------------------------\n")

            for _, r in df.iterrows():
                sec = int(r["SECCION_INT"])
                mid = sec_to_mun_id.get(sec, 1)
                ln = int(r["LISTA_NOMINAL"])
                tv = int(r["TOTAL_VOTOS"])
                part = float(r["PARTICIPACION_PCT"])
                g_partido = str(r["GANADOR_PARTIDO"]).replace("'", "''")
                g_votos = int(r["GANADOR_VOTOS"])
                g_pct = float(r["GANADOR_PCT"])
                s_partido = str(r["SEGUNDO_PARTIDO"]).replace("'", "''")
                s_votos = int(r["SEGUNDO_VOTOS"])
                s_pct = float(r["SEGUNDO_PCT"])
                margen = float(r["MARGEN_VICTORIA_PCT"])
                vpart_json = r["VOTOS_PARTIDOS_JSON"].replace("'", "''")

                sql = f"""INSERT INTO electoral_results (
    state_id, election_year, election_type, clave_seccion, clave_municipio,
    lista_nominal, total_votos, participacion_pct,
    ganador_partido, ganador_votos, ganador_pct,
    segundo_partido, segundo_votos, segundo_pct, margen_victoria_pct,
    votos_partidos
) VALUES (
    '{STATE_ID_CHI}', {year}, '{etype}', {sec}, {mid},
    {ln}, {tv}, {part},
    '{g_partido}', {g_votos}, {g_pct},
    '{s_partido}', {s_votos}, {s_pct}, {margen},
    '{vpart_json}'::jsonb
)
ON CONFLICT (state_id, election_year, election_type, clave_seccion) DO UPDATE
SET lista_nominal = EXCLUDED.lista_nominal,
    total_votos = EXCLUDED.total_votos,
    participacion_pct = EXCLUDED.participacion_pct,
    ganador_partido = EXCLUDED.ganador_partido,
    ganador_votos = EXCLUDED.ganador_votos,
    ganador_pct = EXCLUDED.ganador_pct,
    segundo_partido = EXCLUDED.segundo_partido,
    segundo_votos = EXCLUDED.segundo_votos,
    segundo_pct = EXCLUDED.segundo_pct,
    margen_victoria_pct = EXCLUDED.margen_victoria_pct,
    votos_partidos = EXCLUDED.votos_partidos;\n"""
                f.write(sql)
                total_sql_records += 1

    sql_size_mb = OUTPUT_SQL_PATH.stat().st_size / (1024 * 1024)
    print(f"✅ Archivo SQL generado con éxito: {total_sql_records:,} registros ({sql_size_mb:.2f} MB).")
    print("🚀 Proceso completado exitosamente.")

if __name__ == "__main__":
    main()
