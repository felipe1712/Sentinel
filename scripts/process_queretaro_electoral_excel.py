"""
Procesador Maestro de Elecciones de Querétaro (2015, 2018, 2021 y 2024)
------------------------------------------------------------------------
Procesa:
  1. Elecciones Queretaro 15- 18.xlsx:
     - 'Gubernatura 2015' (Gubernatura 2015)
     - 'Diputados 2018' (Diputaciones Federales 2018)
  2. Resultados Querétaro 2021 y 2024.xlsx:
     - 'Querétaro 2021' (Gubernatura 2021)
     - 'Querétaro 2021' (Diputaciones Federales 2021)
     - 'Querétaro 2024' (Diputaciones Federales 2024)

Cruza cada sección con los Shapefiles oficiales del INE:
  - data/Queretaro/Shp-Qro/SECCION.shp (1,090 secciones)
  - data/Queretaro/Shp-Qro/MUNICIPIO.shp (18 municipios)

Genera:
  - data/electoral/ingest_queretaro_electoral_results.sql
  - nextjs-app/public/data/qro_electoral_results_cache.json
"""

import os
import sys
import json
import unicodedata
from pathlib import Path
import pandas as pd
import numpy as np

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

STATE_ID_QRO = "11111111-1111-1111-1111-111111111111"
BASE_DIR = Path(__file__).resolve().parent.parent
EXCEL_15_18_PATH = BASE_DIR / "data" / "Queretaro" / "electoral" / "Elecciones Queretaro 15- 18.xlsx"
EXCEL_21_24_PATH = BASE_DIR / "data" / "Queretaro" / "electoral" / "Resultados Querétaro 2021 y 2024.xlsx"
SHP_SECCION_PATH = BASE_DIR / "data" / "Queretaro" / "Shp-Qro" / "SECCION.shp"
OUTPUT_SQL_PATH = BASE_DIR / "data" / "electoral" / "ingest_queretaro_electoral_results.sql"
OUTPUT_CACHE_PATH = BASE_DIR / "nextjs-app" / "public" / "data" / "qro_electoral_results_cache.json"

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

ROMAN_TO_INT = {
    "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5,
    "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10,
    "XI": 11, "XII": 12, "XIII": 13, "XIV": 14, "XV": 15
}

def norm_text(s):
    if not s:
        return ""
    return ''.join(c for c in unicodedata.normalize('NFD', str(s).upper().strip()) if unicodedata.category(c) != 'Mn')

def clean_numeric_series(series: pd.Series) -> pd.Series:
    return pd.to_numeric(
        series.astype(str).str.replace(",", "").str.replace("'", "").str.replace("-", "0").str.strip(),
        errors="coerce"
    ).fillna(0)

def json_default_serializer(obj):
    if isinstance(obj, (np.integer, int)):
        return int(obj)
    elif isinstance(obj, (np.floating, float)):
        return float(obj)
    elif isinstance(obj, (np.ndarray, list)):
        return list(obj)
    return str(obj)

def main():
    print("==================================================================")
    print(" 🗳️ SentinelIQ — Procesador Maestro Electoral de Querétaro")
    print("    (2015, 2018, 2021 y 2024)")
    print("==================================================================")

    # 1. Catálogo seccional desde Shapefiles INE
    sec_to_mun = {}
    sec_to_mun_id = {}
    sec_to_dl = {}
    sec_to_df = {}
    mun_name_norm_to_id = {norm_text(v): k for k, v in MUNICIPIOS_DICT.items()}
    mun_name_norm_to_id["SANTIAGO DE QUERETARO"] = 14
    mun_name_norm_to_id["QUERETARO"] = 14

    if SHP_SECCION_PATH.exists():
        import shapefile
        sf = shapefile.Reader(str(SHP_SECCION_PATH), encoding="latin1")
        for r in sf.records():
            rec = r.as_dict()
            s = int(rec.get("seccion") or 0)
            mid = int(rec.get("municipio") or 0)
            dl = int(rec.get("distrito_l") or 0)
            df_val = int(rec.get("distrito_f") or 0)

            sec_to_mun[s] = MUNICIPIOS_DICT.get(mid, f"Municipio {mid}")
            sec_to_mun_id[s] = mid
            sec_to_dl[s] = dl
            sec_to_df[s] = df_val
        print(f"🗺️  {len(sec_to_mun)} secciones cargadas desde SECCION.shp")

    master_cache = {
        "gubernatura": {"2015": {}, "2021": {}},
        "diputaciones": {"2018": {}, "2021": {}, "2024": {}},
        "municipios": {
            "gubernatura": {"2015": {}, "2021": {}},
            "diputaciones": {"2018": {}, "2021": {}, "2024": {}},
        },
        "distritos_locales": {
            "gubernatura": {"2015": {}, "2021": {}},
            "diputaciones": {"2018": {}, "2021": {}, "2024": {}},
        },
        "distritos_federales": {
            "gubernatura": {"2015": {}, "2021": {}},
            "diputaciones": {"2018": {}, "2021": {}, "2024": {}},
        }
    }

    # =========================================================================
    # 2. PROCESAR: GUBERNATURA 2015
    # =========================================================================
    print("\n⚙️ Procesando GUBERNATURA 2015...")
    import openpyxl
    wb15_18 = openpyxl.load_workbook(str(EXCEL_15_18_PATH), data_only=True)
    ws15 = wb15_18["Gubernatura 2015"]
    header15 = [ws15.cell(1, c).value for c in range(1, ws15.max_column + 1)]

    rows_15 = []
    sec15_to_mun_id = {}
    sec15_to_dl = {}
    cur_dl = 1
    cur_mun_id = 14

    for r in range(2, ws15.max_row + 1):
        c1 = ws15.cell(r, 1).value
        if c1 is None:
            continue
        c1_str = str(c1).strip()
        if "DISTRITO" in c1_str.upper():
            parts = c1_str.replace("–", "-").replace("—", "-").split("-")
            dl_str = parts[0].replace("DISTRITO", "").strip().upper()
            cur_dl = ROMAN_TO_INT.get(dl_str, cur_dl)
            m_name_raw = parts[-1].strip()
            cur_mun_id = mun_name_norm_to_id.get(norm_text(m_name_raw), cur_mun_id)
        elif c1_str.isdigit():
            sec = int(c1_str)
            sec15_to_mun_id[sec] = cur_mun_id
            sec15_to_dl[sec] = cur_dl
            row_data = [ws15.cell(r, c).value for c in range(2, ws15.max_column + 1)]
            rows_15.append([sec, cur_dl, cur_mun_id] + row_data)

    df_15 = pd.DataFrame(rows_15, columns=["SECCION", "DISTRITO_LOCAL_SRC", "MUNICIPIO_ID_SRC"] + header15[1:])
    for c in header15[1:]:
        df_15[c] = clean_numeric_series(df_15[c])

    pri_cols_15 = [
        "PRI", "PVEM", "Nueva alianza (NA)", "PT",
        "PRI-NA-PVEM-PT", "PRI-NA-PVEM", "PRI-PVEM-PT", "PRI-NA-PT", "NA-PVEM-PT",
        "PRI-NA", "PRI-PVEM", "PRI-PT", "NA-PVEM", "NA-PT", "PVEM-PT"
    ]
    df_15["VOTOS_PAN"] = df_15["PAN"]
    df_15["VOTOS_PRI_COL"] = df_15[[c for c in pri_cols_15 if c in df_15.columns]].sum(axis=1)
    df_15["VOTOS_MORENA"] = df_15["Morena"]
    df_15["VOTOS_PRD"] = df_15["PRD"]
    df_15["VOTOS_MC"] = df_15["Movimiento Ciudadano"]
    df_15["TOTAL_VOTOS"] = df_15[header15[1:]].sum(axis=1)
    df_15["LISTA_NOMINAL"] = 0  # No disponible a nivel casilla en esta sábana de 2015

    winners_15, w_votes_15, w_pcts_15 = [], [], []
    sec_15, s_votes_15, s_pcts_15 = [], [], []
    margins_15 = []

    for _, r in df_15.iterrows():
        tv = r["TOTAL_VOTOS"]
        cand_list = [
            ("PAN", r["VOTOS_PAN"]),
            ("PRI-PVEM-NA-PT", r["VOTOS_PRI_COL"]),
            ("MORENA", r["VOTOS_MORENA"]),
            ("PRD", r["VOTOS_PRD"]),
            ("MC", r["VOTOS_MC"]),
        ]
        cand_list.sort(key=lambda x: x[1], reverse=True)
        wp, wv = cand_list[0]
        sp, sv = cand_list[1]
        wpct = round((wv / tv * 100), 2) if tv > 0 else 0.0
        spct = round((sv / tv * 100), 2) if tv > 0 else 0.0
        mg = round(wpct - spct, 2)

        winners_15.append(wp)
        w_votes_15.append(wv)
        w_pcts_15.append(wpct)
        sec_15.append(sp)
        s_votes_15.append(sv)
        s_pcts_15.append(spct)
        margins_15.append(mg)

    df_15["GANADOR_PARTIDO"] = winners_15
    df_15["GANADOR_VOTOS"] = w_votes_15
    df_15["GANADOR_PCT"] = w_pcts_15
    df_15["SEGUNDO_PARTIDO"] = sec_15
    df_15["SEGUNDO_VOTOS"] = s_votes_15
    df_15["SEGUNDO_PCT"] = s_pcts_15
    df_15["MARGEN_VICTORIA_PCT"] = margins_15
    df_15["PARTICIPACION_PCT"] = 0.0
    df_15["ELECTION_YEAR"] = 2015
    df_15["ELECTION_TYPE"] = "gubernatura"
    df_15["SECCION_INT"] = df_15["SECCION"]

    print(f"  • {len(df_15)} secciones calculadas para Gubernatura 2015.")
    print(f"  • Votos PAN: {df_15['VOTOS_PAN'].sum():,.0f} | PRI-Col: {df_15['VOTOS_PRI_COL'].sum():,.0f} | Total: {df_15['TOTAL_VOTOS'].sum():,.0f}")

    # =========================================================================
    # 3. PROCESAR: DIPUTADOS 2018 (Casilla -> Sección)
    # =========================================================================
    print("\n⚙️ Procesando DIPUTACIONES 2018...")
    df_18_raw = pd.read_excel(str(EXCEL_15_18_PATH), sheet_name="Diputados 2018", skiprows=5)
    for col in df_18_raw.columns:
        if col not in ["CLAVE_CASILLA", "CLAVE_ACTA", "ID_ESTADO", "NOMBRE_ESTADO", "NOMBRE_DISTRITO", "ID_CASILLA", "TIPO_CASILLA", "CASILLA", "OBSERVACIONES", "MECANISMOS_TRASLADO", "FECHA_HORA"]:
            df_18_raw[col] = clean_numeric_series(df_18_raw[col])

    pan_col_18 = ["PAN", "PRD", "MOVIMIENTO CIUDADANO", "PAN_PRD_MC", "PAN_PRD", "PAN_MC", "PRD_MC"]
    mor_col_18 = ["MORENA", "PT", "ENCUENTRO SOCIAL", "PT_MORENA_PES", "PT_MORENA", "PT_PES", "MORENA_PES"]
    pri_col_18 = ["PRI", "PRI_PVEM_NA", "PRI_PVEM", "PRI_NA"]
    pve_col_18 = ["PVEM", "PVEM_NA"]
    na_col_18 = ["NUEVA ALIANZA"]

    df_18_raw["VOTOS_PAN_PRD_MC"] = df_18_raw[[c for c in pan_col_18 if c in df_18_raw.columns]].sum(axis=1)
    df_18_raw["VOTOS_MORENA_PT_PES"] = df_18_raw[[c for c in mor_col_18 if c in df_18_raw.columns]].sum(axis=1)
    df_18_raw["VOTOS_PRI"] = df_18_raw[[c for c in pri_col_18 if c in df_18_raw.columns]].sum(axis=1)
    df_18_raw["VOTOS_PVEM"] = df_18_raw[[c for c in pve_col_18 if c in df_18_raw.columns]].sum(axis=1)
    df_18_raw["VOTOS_NA"] = df_18_raw[[c for c in na_col_18 if c in df_18_raw.columns]].sum(axis=1)
    df_18_raw["VOTOS_PAN_PURO"] = df_18_raw["PAN"]
    df_18_raw["VOTOS_MC_PURO"] = df_18_raw["MOVIMIENTO CIUDADANO"]

    df_18_sec = df_18_raw.groupby("SECCION").agg({
        "ID_DISTRITO": "first",
        "NOMBRE_DISTRITO": "first",
        "LISTA_NOMINAL_CASILLA": "sum",
        "TOTAL_VOTOS_CALCULADOS": "sum",
        "VOTOS_PAN_PRD_MC": "sum",
        "VOTOS_PAN_PURO": "sum",
        "VOTOS_MORENA_PT_PES": "sum",
        "VOTOS_PRI": "sum",
        "VOTOS_PVEM": "sum",
        "VOTOS_NA": "sum",
        "VOTOS_MC_PURO": "sum",
        "VN": "sum",
        "CNR": "sum",
    }).reset_index()

    df_18_sec.rename(columns={
        "LISTA_NOMINAL_CASILLA": "LISTA_NOMINAL",
        "TOTAL_VOTOS_CALCULADOS": "TOTAL_VOTOS",
    }, inplace=True)

    winners_18, w_votes_18, w_pcts_18 = [], [], []
    sec_18, s_votes_18, s_pcts_18 = [], [], []
    margins_18, parts_18 = [], []

    for _, r in df_18_sec.iterrows():
        tv = r["TOTAL_VOTOS"]
        ln = r["LISTA_NOMINAL"]
        cand_list = [
            ("PAN-PRD-MC", r["VOTOS_PAN_PRD_MC"]),
            ("MORENA-PT-PES", r["VOTOS_MORENA_PT_PES"]),
            ("PRI", r["VOTOS_PRI"]),
            ("PVEM", r["VOTOS_PVEM"]),
            ("NUEVA ALIANZA", r["VOTOS_NA"]),
        ]
        cand_list.sort(key=lambda x: x[1], reverse=True)
        wp, wv = cand_list[0]
        sp, sv = cand_list[1]
        wpct = round((wv / tv * 100), 2) if tv > 0 else 0.0
        spct = round((sv / tv * 100), 2) if tv > 0 else 0.0
        mg = round(wpct - spct, 2)
        part = round((tv / ln * 100), 2) if ln > 0 else 0.0

        winners_18.append(wp)
        w_votes_18.append(wv)
        w_pcts_18.append(wpct)
        sec_18.append(sp)
        s_votes_18.append(sv)
        s_pcts_18.append(spct)
        margins_18.append(mg)
        parts_18.append(part)

    df_18_sec["GANADOR_PARTIDO"] = winners_18
    df_18_sec["GANADOR_VOTOS"] = w_votes_18
    df_18_sec["GANADOR_PCT"] = w_pcts_18
    df_18_sec["SEGUNDO_PARTIDO"] = sec_18
    df_18_sec["SEGUNDO_VOTOS"] = s_votes_18
    df_18_sec["SEGUNDO_PCT"] = s_pcts_18
    df_18_sec["MARGEN_VICTORIA_PCT"] = margins_18
    df_18_sec["PARTICIPACION_PCT"] = parts_18
    df_18_sec["ELECTION_YEAR"] = 2018
    df_18_sec["ELECTION_TYPE"] = "diputaciones"
    df_18_sec["SECCION_INT"] = df_18_sec["SECCION"]

    print(f"  • {len(df_18_sec)} secciones calculadas para Diputaciones 2018.")
    print(f"  • Votos PAN-Frente: {df_18_sec['VOTOS_PAN_PRD_MC'].sum():,.0f} | MORENA-JHH: {df_18_sec['VOTOS_MORENA_PT_PES'].sum():,.0f} | Total: {df_18_sec['TOTAL_VOTOS'].sum():,.0f}")

    sec18_to_df = df_18_sec.set_index("SECCION_INT")["ID_DISTRITO"].to_dict()

    # =========================================================================
    # 4. PROCESAR: ELECCIONES 2021 Y 2024
    # =========================================================================
    xl21_24 = pd.ExcelFile(str(EXCEL_21_24_PATH))
    configs_21_24 = [
        {
            "sheet_name": "Querétaro 2021",
            "header_row": 2,
            "election_year": 2021,
            "election_type": "gubernatura",
            "seccion_col": "SECCION",
            "ln_col": "LISTA_NOMINAL_CASILLA",
            "tv_col": "TOTAL_VOTOS_CALCULADOS",
            "pan_label": "PAN-PRI-PRD",
            "opp_label": "MORENA-PT-PVEM",
            "pan_puro_col": "PAN",
            "pan_coalition_cols": ["PAN", "PRI", "PRD", "PAN-PRI-PRD", "PAN-PRI", "PAN-PRD", "PRI-PRD"],
            "opp_coalition_cols": ["MORENA", "PT", "PVEM", "PVEM-PT-MORENA", "PVEM-PT", "PVEM-MORENA", "PT-MORENA"],
            "mc_col": "MC",
        },
        {
            "sheet_name": "Querétaro 2021",
            "header_row": 2,
            "election_year": 2021,
            "election_type": "diputaciones",
            "seccion_col": "SECCION",
            "ln_col": "LISTA_NOMINAL_CASILLA",
            "tv_col": "TOTAL_VOTOS_CALCULADOS",
            "pan_label": "PAN-PRI-PRD",
            "opp_label": "MORENA-PT-PVEM",
            "pan_puro_col": "PAN",
            "pan_coalition_cols": ["PAN", "PRI", "PRD", "PAN-PRI-PRD", "PAN-PRI", "PAN-PRD", "PRI-PRD"],
            "opp_coalition_cols": ["MORENA", "PT", "PVEM", "PVEM-PT-MORENA", "PVEM-PT", "PVEM-MORENA", "PT-MORENA"],
            "mc_col": "MC",
        },
        {
            "sheet_name": "Querétaro 2024",
            "header_row": 0,
            "election_year": 2024,
            "election_type": "diputaciones",
            "seccion_col": "SECCION",
            "ln_col": "LISTA_NOMINAL",
            "tv_col": "TOTAL_VOTOS_CALCULADOS",
            "pan_label": "PAN-PRI-PRD",
            "opp_label": "MORENA-PT-PVEM",
            "pan_puro_col": "PAN",
            "pan_coalition_cols": ["PAN", "PRI", "PRD", "PAN_PRI_PRD", "PAN_PRI", "PAN_PRD", "PRI_PRD"],
            "opp_coalition_cols": ["MORENA", "PT", "PVEM", "PVEM_PT_MORENA", "PVEM_PT", "PVEM_MORENA", "PT_MORENA"],
            "mc_col": "MC",
        }
    ]

    loaded_sheets = {}
    dfs_21_24 = []

    for cfg in configs_21_24:
        sname = cfg["sheet_name"]
        hrow = cfg["header_row"]
        year = cfg["election_year"]
        etype = cfg["election_type"]
        pan_label = cfg["pan_label"]
        opp_label = cfg["opp_label"]
        pan_puro_col = cfg["pan_puro_col"]
        pan_cols = cfg["pan_coalition_cols"]
        opp_cols = cfg["opp_coalition_cols"]
        mc_col = cfg["mc_col"]

        print(f"\n⚙️ Procesando pestaña: '{sname}' ({etype.upper()} {year})...")
        cache_key = f"{sname}_{hrow}"
        if cache_key not in loaded_sheets:
            loaded_sheets[cache_key] = xl21_24.parse(sname, header=hrow)
        raw_df = loaded_sheets[cache_key].copy()

        sec_col = cfg["seccion_col"]
        ln_col = cfg["ln_col"]
        tv_col = cfg["tv_col"]

        raw_df = raw_df[raw_df[sec_col].notna()]
        raw_df["SECCION_INT"] = pd.to_numeric(raw_df[sec_col], errors="coerce").fillna(0).astype(int)
        raw_df = raw_df[raw_df["SECCION_INT"] > 0]

        raw_df["LISTA_NOMINAL"] = clean_numeric_series(raw_df[ln_col])
        raw_df["TOTAL_VOTOS"] = clean_numeric_series(raw_df[tv_col])

        avail_pan = [c for c in pan_cols if c in raw_df.columns]
        for c in avail_pan:
            raw_df[c] = clean_numeric_series(raw_df[c])
        raw_df["VOTOS_PAN_ALIANZA"] = raw_df[avail_pan].sum(axis=1)
        raw_df["VOTOS_PAN_PURO"] = clean_numeric_series(raw_df[pan_puro_col]) if pan_puro_col in raw_df.columns else raw_df["VOTOS_PAN_ALIANZA"]

        avail_opp = [c for c in opp_cols if c in raw_df.columns]
        for c in avail_opp:
            raw_df[c] = clean_numeric_series(raw_df[c])
        raw_df["VOTOS_OPP_ALIANZA"] = raw_df[avail_opp].sum(axis=1)

        raw_df["VOTOS_MC"] = clean_numeric_series(raw_df[mc_col]) if mc_col in raw_df.columns else 0

        grouped = raw_df.groupby("SECCION_INT", as_index=False).agg({
            "LISTA_NOMINAL": "sum",
            "TOTAL_VOTOS": "sum",
            "VOTOS_PAN_ALIANZA": "sum",
            "VOTOS_PAN_PURO": "sum",
            "VOTOS_OPP_ALIANZA": "sum",
            "VOTOS_MC": "sum",
        })

        winners, winner_votes, winner_pcts = [], [], []
        seconds, second_votes, second_pcts = [], [], []
        margins, part_pcts = [], []

        for _, r in grouped.iterrows():
            tv = r["TOTAL_VOTOS"]
            ln = r["LISTA_NOMINAL"]
            v_pan = r["VOTOS_PAN_ALIANZA"]
            v_opp = r["VOTOS_OPP_ALIANZA"]
            v_mc = r["VOTOS_MC"]

            part = round((tv / ln * 100), 2) if ln > 0 else 0.0
            part_pcts.append(part)

            ranking = [(pan_label, v_pan), (opp_label, v_opp), ("MC", v_mc)]
            ranking.sort(key=lambda x: x[1], reverse=True)

            w_p, w_v = ranking[0]
            s_p, s_v = ranking[1]

            w_pct = round((w_v / tv * 100), 2) if tv > 0 else 0.0
            s_pct = round((s_v / tv * 100), 2) if tv > 0 else 0.0
            mg = round(w_pct - s_pct, 2)

            winners.append(w_p)
            winner_votes.append(w_v)
            winner_pcts.append(w_pct)
            seconds.append(s_p)
            second_votes.append(s_v)
            second_pcts.append(s_pct)
            margins.append(mg)

        grouped["GANADOR_PARTIDO"] = winners
        grouped["GANADOR_VOTOS"] = winner_votes
        grouped["GANADOR_PCT"] = winner_pcts
        grouped["SEGUNDO_PARTIDO"] = seconds
        grouped["SEGUNDO_VOTOS"] = second_votes
        grouped["SEGUNDO_PCT"] = second_pcts
        grouped["MARGEN_VICTORIA_PCT"] = margins
        grouped["PARTICIPACION_PCT"] = part_pcts

        grouped["ELECTION_YEAR"] = year
        grouped["ELECTION_TYPE"] = etype
        grouped["PAN_LABEL"] = pan_label
        grouped["OPP_LABEL"] = opp_label

        dfs_21_24.append(grouped)

    # =========================================================================
    # 5. INTEGRACIÓN UNIFICADA DE TODAS LAS ELECCIONES EN EL MASTER_CACHE
    # =========================================================================
    print("\n📦 Integrando todos los ciclos electorales al Master Cache y SQL...")

    def resolve_territory(sec: int):
        if sec in sec_to_mun_id:
            return sec_to_mun_id[sec], sec_to_mun[sec], sec_to_dl[sec], sec_to_df[sec]
        if sec in sec15_to_mun_id:
            m_id = sec15_to_mun_id[sec]
            dl = sec15_to_dl.get(sec, 1)
            df_val = int(sec18_to_df.get(sec, 1))
            return m_id, MUNICIPIOS_DICT.get(m_id, f"Municipio {m_id}"), dl, df_val
        if sec == 685:
            return 18, MUNICIPIOS_DICT[18], 13, 1
        return 14, MUNICIPIOS_DICT[14], 1, 1

    # --- A. Procesar Gubernatura 2015 en Cache ---
    g15_mpio_acc = {}
    g15_dl_acc = {}
    g15_df_acc = {}

    for _, r in df_15.iterrows():
        sec = int(r["SECCION_INT"])
        sec_str = str(sec)
        ln = int(r["LISTA_NOMINAL"])
        tv = int(r["TOTAL_VOTOS"])
        wp = str(r["GANADOR_PARTIDO"])
        wv = int(r["GANADOR_VOTOS"])
        wpct = float(r["GANADOR_PCT"])
        sp = str(r["SEGUNDO_PARTIDO"])
        sv = int(r["SEGUNDO_VOTOS"])
        spct = float(r["SEGUNDO_PCT"])
        mg = float(r["MARGEN_VICTORIA_PCT"])
        v_pan = int(r["VOTOS_PAN"])
        v_pri = int(r["VOTOS_PRI_COL"])
        v_mor = int(r["VOTOS_MORENA"])
        v_prd = int(r["VOTOS_PRD"])
        v_mc = int(r["VOTOS_MC"])

        muni_id, muni_val, dl_val, df_val = resolve_territory(sec)

        item = {
            "election_year": 2015,
            "election_type": "gubernatura",
            "clave_seccion": sec,
            "clave_municipio": muni_id,
            "municipio_nombre": muni_val,
            "distrito_local": dl_val,
            "distrito_federal": df_val,
            "lista_nominal": ln,
            "total_votos": tv,
            "participacion_pct": 0.0,
            "ganador_partido": wp,
            "ganador_votos": wv,
            "ganador_pct": wpct,
            "segundo_partido": sp,
            "segundo_votos": sv,
            "segundo_pct": spct,
            "margen_victoria_pct": mg,
            "votos_partidos": {
                "PAN": v_pan,
                "PAN_PURO": v_pan,
                "PRI-PVEM-NA-PT": v_pri,
                "MORENA": v_mor,
                "PRD": v_prd,
                "MC": v_mc
            }
        }
        master_cache["gubernatura"]["2015"][sec_str] = item

        if muni_val not in g15_mpio_acc:
            g15_mpio_acc[muni_val] = {"id": muni_id, "ln": 0, "tv": 0, "pan": 0, "pri": 0, "mor": 0, "prd": 0, "mc": 0, "sec_count": 0}
        g15_mpio_acc[muni_val]["ln"] += ln
        g15_mpio_acc[muni_val]["tv"] += tv
        g15_mpio_acc[muni_val]["pan"] += v_pan
        g15_mpio_acc[muni_val]["pri"] += v_pri
        g15_mpio_acc[muni_val]["mor"] += v_mor
        g15_mpio_acc[muni_val]["prd"] += v_prd
        g15_mpio_acc[muni_val]["mc"] += v_mc
        g15_mpio_acc[muni_val]["sec_count"] += 1

        dl_str = str(dl_val)
        if dl_str not in g15_dl_acc:
            g15_dl_acc[dl_str] = {"ln": 0, "tv": 0, "pan": 0, "pri": 0, "mor": 0, "prd": 0, "mc": 0, "sec_count": 0}
        g15_dl_acc[dl_str]["ln"] += ln
        g15_dl_acc[dl_str]["tv"] += tv
        g15_dl_acc[dl_str]["pan"] += v_pan
        g15_dl_acc[dl_str]["pri"] += v_pri
        g15_dl_acc[dl_str]["mor"] += v_mor
        g15_dl_acc[dl_str]["prd"] += v_prd
        g15_dl_acc[dl_str]["mc"] += v_mc
        g15_dl_acc[dl_str]["sec_count"] += 1

        df_str = str(df_val)
        if df_str not in g15_df_acc:
            g15_df_acc[df_str] = {"ln": 0, "tv": 0, "pan": 0, "pri": 0, "mor": 0, "prd": 0, "mc": 0, "sec_count": 0}
        g15_df_acc[df_str]["ln"] += ln
        g15_df_acc[df_str]["tv"] += tv
        g15_df_acc[df_str]["pan"] += v_pan
        g15_df_acc[df_str]["pri"] += v_pri
        g15_df_acc[df_str]["mor"] += v_mor
        g15_df_acc[df_str]["prd"] += v_prd
        g15_df_acc[df_str]["mc"] += v_mc
        g15_df_acc[df_str]["sec_count"] += 1

    for mun_name, stats in g15_mpio_acc.items():
        tot = stats["tv"]
        cand_list = [
            ("PAN", stats["pan"]),
            ("PRI-PVEM-NA-PT", stats["pri"]),
            ("MORENA", stats["mor"]),
            ("PRD", stats["prd"]),
            ("MC", stats["mc"])
        ]
        cand_list.sort(key=lambda x: x[1], reverse=True)
        mwp, mwv = cand_list[0]
        msp, msv = cand_list[1]
        m_wpct = round((mwv / tot * 100), 2) if tot > 0 else 0.0
        m_spct = round((msv / tot * 100), 2) if tot > 0 else 0.0
        m_item = {
            "election_year": 2015,
            "election_type": "gubernatura",
            "clave_municipio": stats["id"],
            "nombre": mun_name,
            "secciones_count": stats["sec_count"],
            "lista_nominal": stats["ln"],
            "total_votos": tot,
            "participacion_pct": 0.0,
            "ganador_partido": mwp,
            "ganador_votos": mwv,
            "ganador_pct": m_wpct,
            "segundo_partido": msp,
            "segundo_votos": msv,
            "segundo_pct": m_spct,
            "margen_victoria_pct": round(m_wpct - m_spct, 2),
            "votos_partidos": {
                "PAN": stats["pan"],
                "PAN_PURO": stats["pan"],
                "PRI-PVEM-NA-PT": stats["pri"],
                "MORENA": stats["mor"],
                "PRD": stats["prd"],
                "MC": stats["mc"]
            }
        }
        master_cache["municipios"]["gubernatura"]["2015"][mun_name] = m_item
        master_cache["municipios"]["gubernatura"]["2015"][norm_text(mun_name)] = m_item
        master_cache["municipios"]["gubernatura"]["2015"][mun_name.upper()] = m_item
        master_cache["municipios"]["gubernatura"]["2015"][str(stats["id"])] = m_item
        if mun_name == "Querétaro":
            master_cache["municipios"]["gubernatura"]["2015"]["Santiago de Querétaro"] = m_item
            master_cache["municipios"]["gubernatura"]["2015"]["SANTIAGO DE QUERETARO"] = m_item

    for dl_str, stats in g15_dl_acc.items():
        tot = stats["tv"]
        cand_list = [("PAN", stats["pan"]), ("PRI-PVEM-NA-PT", stats["pri"]), ("MORENA", stats["mor"])]
        cand_list.sort(key=lambda x: x[1], reverse=True)
        mwp, mwv = cand_list[0]
        msp, msv = cand_list[1]
        dl_item = {
            "election_year": 2015,
            "election_type": "gubernatura",
            "distrito_local": int(dl_str),
            "nombre": f"Distrito Local {dl_str}",
            "secciones_count": stats["sec_count"],
            "lista_nominal": stats["ln"],
            "total_votos": tot,
            "participacion_pct": 0.0,
            "ganador_partido": mwp,
            "ganador_votos": mwv,
            "ganador_pct": round((mwv / tot * 100), 2) if tot > 0 else 0.0,
            "segundo_partido": msp,
            "segundo_votos": msv,
            "segundo_pct": round((msv / tot * 100), 2) if tot > 0 else 0.0,
            "margen_victoria_pct": round(((mwv - msv) / tot * 100), 2) if tot > 0 else 0.0,
            "votos_partidos": {"PAN": stats["pan"], "PRI-PVEM-NA-PT": stats["pri"], "MORENA": stats["mor"]}
        }
        master_cache["distritos_locales"]["gubernatura"]["2015"][dl_str] = dl_item

    for df_str, stats in g15_df_acc.items():
        tot = stats["tv"]
        cand_list = [("PAN", stats["pan"]), ("PRI-PVEM-NA-PT", stats["pri"]), ("MORENA", stats["mor"])]
        cand_list.sort(key=lambda x: x[1], reverse=True)
        mwp, mwv = cand_list[0]
        msp, msv = cand_list[1]
        df_item = {
            "election_year": 2015,
            "election_type": "gubernatura",
            "distrito_federal": int(df_str),
            "nombre": f"Distrito Federal {df_str}",
            "secciones_count": stats["sec_count"],
            "lista_nominal": stats["ln"],
            "total_votos": tot,
            "participacion_pct": 0.0,
            "ganador_partido": mwp,
            "ganador_votos": mwv,
            "ganador_pct": round((mwv / tot * 100), 2) if tot > 0 else 0.0,
            "segundo_partido": msp,
            "segundo_votos": msv,
            "segundo_pct": round((msv / tot * 100), 2) if tot > 0 else 0.0,
            "margen_victoria_pct": round(((mwv - msv) / tot * 100), 2) if tot > 0 else 0.0,
            "votos_partidos": {"PAN": stats["pan"], "PRI-PVEM-NA-PT": stats["pri"], "MORENA": stats["mor"]}
        }
        master_cache["distritos_federales"]["gubernatura"]["2015"][df_str] = df_item

    # --- B. Procesar Diputaciones 2018 en Cache ---
    d18_mpio_acc = {}
    d18_dl_acc = {}
    d18_df_acc = {}

    for _, r in df_18_sec.iterrows():
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
        v_pan_col = int(r["VOTOS_PAN_PRD_MC"])
        v_pan_puro = int(r["VOTOS_PAN_PURO"])
        v_mor_col = int(r["VOTOS_MORENA_PT_PES"])
        v_pri = int(r["VOTOS_PRI"])
        v_pve = int(r["VOTOS_PVEM"])
        v_na = int(r["VOTOS_NA"])
        v_mc = int(r["VOTOS_MC_PURO"])

        muni_id, muni_val, dl_val, df_val = resolve_territory(sec)
        if pd.notna(r.get("ID_DISTRITO")):
            df_val = int(r["ID_DISTRITO"])

        item = {
            "election_year": 2018,
            "election_type": "diputaciones",
            "clave_seccion": sec,
            "clave_municipio": muni_id,
            "municipio_nombre": muni_val,
            "distrito_local": dl_val,
            "distrito_federal": df_val,
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
            "votos_partidos": {
                "PAN-PRD-MC": v_pan_col,
                "PAN_PURO": v_pan_puro,
                "MORENA-PT-PES": v_mor_col,
                "PRI": v_pri,
                "PVEM": v_pve,
                "NUEVA ALIANZA": v_na,
                "MC": v_mc
            }
        }
        master_cache["diputaciones"]["2018"][sec_str] = item

        if muni_val not in d18_mpio_acc:
            d18_mpio_acc[muni_val] = {"id": muni_id, "ln": 0, "tv": 0, "pan": 0, "mor": 0, "pri": 0, "pve": 0, "na": 0, "mc": 0, "sec_count": 0}
        d18_mpio_acc[muni_val]["ln"] += ln
        d18_mpio_acc[muni_val]["tv"] += tv
        d18_mpio_acc[muni_val]["pan"] += v_pan_col
        d18_mpio_acc[muni_val]["mor"] += v_mor_col
        d18_mpio_acc[muni_val]["pri"] += v_pri
        d18_mpio_acc[muni_val]["pve"] += v_pve
        d18_mpio_acc[muni_val]["na"] += v_na
        d18_mpio_acc[muni_val]["mc"] += v_mc
        d18_mpio_acc[muni_val]["sec_count"] += 1

        dl_str = str(dl_val)
        if dl_str not in d18_dl_acc:
            d18_dl_acc[dl_str] = {"ln": 0, "tv": 0, "pan": 0, "mor": 0, "pri": 0, "pve": 0, "na": 0, "mc": 0, "sec_count": 0}
        d18_dl_acc[dl_str]["ln"] += ln
        d18_dl_acc[dl_str]["tv"] += tv
        d18_dl_acc[dl_str]["pan"] += v_pan_col
        d18_dl_acc[dl_str]["mor"] += v_mor_col
        d18_dl_acc[dl_str]["pri"] += v_pri
        d18_dl_acc[dl_str]["pve"] += v_pve
        d18_dl_acc[dl_str]["na"] += v_na
        d18_dl_acc[dl_str]["mc"] += v_mc
        d18_dl_acc[dl_str]["sec_count"] += 1

        df_str = str(df_val)
        if df_str not in d18_df_acc:
            d18_df_acc[df_str] = {"ln": 0, "tv": 0, "pan": 0, "mor": 0, "pri": 0, "pve": 0, "na": 0, "mc": 0, "sec_count": 0}
        d18_df_acc[df_str]["ln"] += ln
        d18_df_acc[df_str]["tv"] += tv
        d18_df_acc[df_str]["pan"] += v_pan_col
        d18_df_acc[df_str]["mor"] += v_mor_col
        d18_df_acc[df_str]["pri"] += v_pri
        d18_df_acc[df_str]["pve"] += v_pve
        d18_df_acc[df_str]["na"] += v_na
        d18_df_acc[df_str]["mc"] += v_mc
        d18_df_acc[df_str]["sec_count"] += 1

    for mun_name, stats in d18_mpio_acc.items():
        tot = stats["tv"]
        cand_list = [
            ("PAN-PRD-MC", stats["pan"]),
            ("MORENA-PT-PES", stats["mor"]),
            ("PRI", stats["pri"]),
            ("PVEM", stats["pve"]),
            ("NUEVA ALIANZA", stats["na"])
        ]
        cand_list.sort(key=lambda x: x[1], reverse=True)
        mwp, mwv = cand_list[0]
        msp, msv = cand_list[1]
        m_wpct = round((mwv / tot * 100), 2) if tot > 0 else 0.0
        m_spct = round((msv / tot * 100), 2) if tot > 0 else 0.0
        m_part = round((tot / stats["ln"] * 100), 2) if stats["ln"] > 0 else 0.0
        m_item = {
            "election_year": 2018,
            "election_type": "diputaciones",
            "clave_municipio": stats["id"],
            "nombre": mun_name,
            "secciones_count": stats["sec_count"],
            "lista_nominal": stats["ln"],
            "total_votos": tot,
            "participacion_pct": m_part,
            "ganador_partido": mwp,
            "ganador_votos": mwv,
            "ganador_pct": m_wpct,
            "segundo_partido": msp,
            "segundo_votos": msv,
            "segundo_pct": m_spct,
            "margen_victoria_pct": round(m_wpct - m_spct, 2),
            "votos_partidos": {
                "PAN-PRD-MC": stats["pan"],
                "MORENA-PT-PES": stats["mor"],
                "PRI": stats["pri"],
                "PVEM": stats["pve"],
                "NUEVA ALIANZA": stats["na"],
                "MC": stats["mc"]
            }
        }
        master_cache["municipios"]["diputaciones"]["2018"][mun_name] = m_item
        master_cache["municipios"]["diputaciones"]["2018"][norm_text(mun_name)] = m_item
        master_cache["municipios"]["diputaciones"]["2018"][mun_name.upper()] = m_item
        master_cache["municipios"]["diputaciones"]["2018"][str(stats["id"])] = m_item
        if mun_name == "Querétaro":
            master_cache["municipios"]["diputaciones"]["2018"]["Santiago de Querétaro"] = m_item
            master_cache["municipios"]["diputaciones"]["2018"]["SANTIAGO DE QUERETARO"] = m_item

    for dl_str, stats in d18_dl_acc.items():
        tot = stats["tv"]
        cand_list = [("PAN-PRD-MC", stats["pan"]), ("MORENA-PT-PES", stats["mor"]), ("PRI", stats["pri"])]
        cand_list.sort(key=lambda x: x[1], reverse=True)
        mwp, mwv = cand_list[0]
        msp, msv = cand_list[1]
        dl_item = {
            "election_year": 2018,
            "election_type": "diputaciones",
            "distrito_local": int(dl_str),
            "nombre": f"Distrito Local {dl_str}",
            "secciones_count": stats["sec_count"],
            "lista_nominal": stats["ln"],
            "total_votos": tot,
            "participacion_pct": round((tot / stats["ln"] * 100), 2) if stats["ln"] > 0 else 0.0,
            "ganador_partido": mwp,
            "ganador_votos": mwv,
            "ganador_pct": round((mwv / tot * 100), 2) if tot > 0 else 0.0,
            "segundo_partido": msp,
            "segundo_votos": msv,
            "segundo_pct": round((msv / tot * 100), 2) if tot > 0 else 0.0,
            "margen_victoria_pct": round(((mwv - msv) / tot * 100), 2) if tot > 0 else 0.0,
            "votos_partidos": {"PAN-PRD-MC": stats["pan"], "MORENA-PT-PES": stats["mor"], "PRI": stats["pri"]}
        }
        master_cache["distritos_locales"]["diputaciones"]["2018"][dl_str] = dl_item

    for df_str, stats in d18_df_acc.items():
        tot = stats["tv"]
        cand_list = [("PAN-PRD-MC", stats["pan"]), ("MORENA-PT-PES", stats["mor"]), ("PRI", stats["pri"])]
        cand_list.sort(key=lambda x: x[1], reverse=True)
        mwp, mwv = cand_list[0]
        msp, msv = cand_list[1]
        df_item = {
            "election_year": 2018,
            "election_type": "diputaciones",
            "distrito_federal": int(df_str),
            "nombre": f"Distrito Federal {df_str}",
            "secciones_count": stats["sec_count"],
            "lista_nominal": stats["ln"],
            "total_votos": tot,
            "participacion_pct": round((tot / stats["ln"] * 100), 2) if stats["ln"] > 0 else 0.0,
            "ganador_partido": mwp,
            "ganador_votos": mwv,
            "ganador_pct": round((mwv / tot * 100), 2) if tot > 0 else 0.0,
            "segundo_partido": msp,
            "segundo_votos": msv,
            "segundo_pct": round((msv / tot * 100), 2) if tot > 0 else 0.0,
            "margen_victoria_pct": round(((mwv - msv) / tot * 100), 2) if tot > 0 else 0.0,
            "votos_partidos": {"PAN-PRD-MC": stats["pan"], "MORENA-PT-PES": stats["mor"], "PRI": stats["pri"]}
        }
        master_cache["distritos_federales"]["diputaciones"]["2018"][df_str] = df_item

    # --- C. Procesar Elecciones 2021 y 2024 en Cache ---
    for grouped in dfs_21_24:
        year = grouped["ELECTION_YEAR"].iloc[0]
        etype = grouped["ELECTION_TYPE"].iloc[0]
        pan_label = grouped["PAN_LABEL"].iloc[0]
        opp_label = grouped["OPP_LABEL"].iloc[0]
        yr_str = str(year)

        mpio_acc = {}
        dist_loc_acc = {}
        dist_fed_acc = {}

        for _, r in grouped.iterrows():
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
            v_pan = int(r["VOTOS_PAN_ALIANZA"])
            v_opp = int(r["VOTOS_OPP_ALIANZA"])
            v_mc = int(r["VOTOS_MC"])

            muni_id, muni_val, dl_val, df_val = resolve_territory(sec)

            item = {
                "election_year": year,
                "election_type": etype,
                "clave_seccion": sec,
                "clave_municipio": muni_id,
                "municipio_nombre": muni_val,
                "distrito_local": dl_val,
                "distrito_federal": df_val,
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
                "votos_partidos": {
                    pan_label: v_pan,
                    opp_label: v_opp,
                    "MC": v_mc
                }
            }
            master_cache[etype][yr_str][sec_str] = item

            if muni_val not in mpio_acc:
                mpio_acc[muni_val] = {"id": muni_id, "ln": 0, "tv": 0, "pan": 0, "opp": 0, "mc": 0, "sec_count": 0}
            mpio_acc[muni_val]["ln"] += ln
            mpio_acc[muni_val]["tv"] += tv
            mpio_acc[muni_val]["pan"] += v_pan
            mpio_acc[muni_val]["opp"] += v_opp
            mpio_acc[muni_val]["mc"] += v_mc
            mpio_acc[muni_val]["sec_count"] += 1

            dl_str = str(dl_val)
            if dl_str not in dist_loc_acc:
                dist_loc_acc[dl_str] = {"ln": 0, "tv": 0, "pan": 0, "opp": 0, "mc": 0, "sec_count": 0}
            dist_loc_acc[dl_str]["ln"] += ln
            dist_loc_acc[dl_str]["tv"] += tv
            dist_loc_acc[dl_str]["pan"] += v_pan
            dist_loc_acc[dl_str]["opp"] += v_opp
            dist_loc_acc[dl_str]["mc"] += v_mc
            dist_loc_acc[dl_str]["sec_count"] += 1

            df_str = str(df_val)
            if df_str not in dist_fed_acc:
                dist_fed_acc[df_str] = {"ln": 0, "tv": 0, "pan": 0, "opp": 0, "mc": 0, "sec_count": 0}
            dist_fed_acc[df_str]["ln"] += ln
            dist_fed_acc[df_str]["tv"] += tv
            dist_fed_acc[df_str]["pan"] += v_pan
            dist_fed_acc[df_str]["opp"] += v_opp
            dist_fed_acc[df_str]["mc"] += v_mc
            dist_fed_acc[df_str]["sec_count"] += 1

        for mun_name, stats in mpio_acc.items():
            tot = stats["tv"]
            ranking = [(pan_label, stats["pan"]), (opp_label, stats["opp"]), ("MC", stats["mc"])]
            ranking.sort(key=lambda x: x[1], reverse=True)
            mw_p, mw_v = ranking[0]
            ms_p, ms_v = ranking[1]
            m_wpct = round((mw_v / tot * 100), 2) if tot > 0 else 0.0
            m_spct = round((ms_v / tot * 100), 2) if tot > 0 else 0.0
            m_part = round((tot / stats["ln"] * 100), 2) if stats["ln"] > 0 else 0.0
            m_item = {
                "election_year": year,
                "election_type": etype,
                "clave_municipio": stats["id"],
                "nombre": mun_name,
                "secciones_count": stats["sec_count"],
                "lista_nominal": stats["ln"],
                "total_votos": tot,
                "participacion_pct": m_part,
                "ganador_partido": mw_p,
                "ganador_votos": mw_v,
                "ganador_pct": m_wpct,
                "segundo_partido": ms_p,
                "segundo_votos": ms_v,
                "segundo_pct": m_spct,
                "margen_victoria_pct": round(m_wpct - m_spct, 2),
                "votos_partidos": {pan_label: stats["pan"], opp_label: stats["opp"], "MC": stats["mc"]}
            }
            master_cache["municipios"][etype][yr_str][mun_name] = m_item
            master_cache["municipios"][etype][yr_str][norm_text(mun_name)] = m_item
            master_cache["municipios"][etype][yr_str][mun_name.upper()] = m_item
            master_cache["municipios"][etype][yr_str][str(stats["id"])] = m_item
            if mun_name == "Querétaro":
                master_cache["municipios"][etype][yr_str]["Santiago de Querétaro"] = m_item
                master_cache["municipios"][etype][yr_str]["SANTIAGO DE QUERETARO"] = m_item

        for dl_str, stats in dist_loc_acc.items():
            tot = stats["tv"]
            ranking = [(pan_label, stats["pan"]), (opp_label, stats["opp"]), ("MC", stats["mc"])]
            ranking.sort(key=lambda x: x[1], reverse=True)
            mw_p, mw_v = ranking[0]
            ms_p, ms_v = ranking[1]
            dl_item = {
                "election_year": year,
                "election_type": etype,
                "distrito_local": int(dl_str),
                "nombre": f"Distrito Local {dl_str}",
                "secciones_count": stats["sec_count"],
                "lista_nominal": stats["ln"],
                "total_votos": tot,
                "participacion_pct": round((tot / stats["ln"] * 100), 2) if stats["ln"] > 0 else 0.0,
                "ganador_partido": mw_p,
                "ganador_votos": mw_v,
                "ganador_pct": round((mwv / tot * 100), 2) if tot > 0 else 0.0,
                "segundo_partido": ms_p,
                "segundo_votos": ms_v,
                "segundo_pct": round((msv / tot * 100), 2) if tot > 0 else 0.0,
                "margen_victoria_pct": round(((mw_v - ms_v) / tot * 100), 2) if tot > 0 else 0.0,
                "votos_partidos": {pan_label: stats["pan"], opp_label: stats["opp"], "MC": stats["mc"]}
            }
            master_cache["distritos_locales"][etype][yr_str][dl_str] = dl_item

        for df_str, stats in dist_fed_acc.items():
            tot = stats["tv"]
            ranking = [(pan_label, stats["pan"]), (opp_label, stats["opp"]), ("MC", stats["mc"])]
            ranking.sort(key=lambda x: x[1], reverse=True)
            mw_p, mw_v = ranking[0]
            ms_p, ms_v = ranking[1]
            df_item = {
                "election_year": year,
                "election_type": etype,
                "distrito_federal": int(df_str),
                "nombre": f"Distrito Federal {df_str}",
                "secciones_count": stats["sec_count"],
                "lista_nominal": stats["ln"],
                "total_votos": tot,
                "participacion_pct": round((tot / stats["ln"] * 100), 2) if stats["ln"] > 0 else 0.0,
                "ganador_partido": mw_p,
                "ganador_votos": mw_v,
                "ganador_pct": round((mw_v / tot * 100), 2) if tot > 0 else 0.0,
                "segundo_partido": ms_p,
                "segundo_votos": ms_v,
                "segundo_pct": round((ms_v / tot * 100), 2) if tot > 0 else 0.0,
                "margen_victoria_pct": round(((mw_v - ms_v) / tot * 100), 2) if tot > 0 else 0.0,
                "votos_partidos": {pan_label: stats["pan"], opp_label: stats["opp"], "MC": stats["mc"]}
            }
            master_cache["distritos_federales"][etype][yr_str][df_str] = df_item

    # Shortcuts en la raíz para comparativas directas y Swing
    master_cache["2015"] = master_cache["gubernatura"]["2015"]
    master_cache["2018"] = master_cache["diputaciones"]["2018"]
    master_cache["2021"] = master_cache["gubernatura"]["2021"]
    master_cache["2024"] = master_cache["diputaciones"]["2024"]

    # =========================================================================
    # 6. GUARDAR CACHE JSON
    # =========================================================================
    print(f"\n💾 Guardando Cache JSON en: {OUTPUT_CACHE_PATH}...")
    with open(OUTPUT_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(master_cache, f, ensure_ascii=False, default=json_default_serializer)
    cache_size_mb = os.path.getsize(OUTPUT_CACHE_PATH) / (1024 * 1024)
    print(f"✅ Cache JSON WebGIS generado con éxito ({cache_size_mb:.2f} MB).")

    # =========================================================================
    # 7. GENERAR SQL COMPLETO PARA BASE DE DATOS POSTGRESQL
    # =========================================================================
    print(f"\n💾 Generando sentencias SQL en: {OUTPUT_SQL_PATH}...")
    total_sql_records = 0
    with open(OUTPUT_SQL_PATH, "w", encoding="utf-8") as f:
        f.write("-- ==============================================================================\n")
        f.write("-- Ingesta Masiva Oficial: Resultados Electorales Querétaro (2015, 2018, 2021, 2024)\n")
        f.write(f"-- State ID Querétaro: {STATE_ID_QRO}\n")
        f.write("-- ==============================================================================\n\n")

        # 1. Gubernatura 2015
        f.write("-- ------------------------------------------------------------------------\n")
        f.write(f"-- Proceso: GUBERNATURA 2015 ({len(df_15):,} secciones)\n")
        f.write("-- ------------------------------------------------------------------------\n")
        for _, r in df_15.iterrows():
            sec = int(r["SECCION_INT"])
            muni_id, _, _, _ = resolve_territory(sec)
            ln = int(r["LISTA_NOMINAL"])
            tv = int(r["TOTAL_VOTOS"])
            part = float(r["PARTICIPACION_PCT"])
            gp = str(r["GANADOR_PARTIDO"]).replace("'", "''")
            gv = int(r["GANADOR_VOTOS"])
            gpct = float(r["GANADOR_PCT"])
            sp = str(r["SEGUNDO_PARTIDO"]).replace("'", "''")
            sv = int(r["SEGUNDO_VOTOS"])
            spct = float(r["SEGUNDO_PCT"])
            mg = float(r["MARGEN_VICTORIA_PCT"])
            vp_json = json.dumps({
                "PAN": int(r["VOTOS_PAN"]),
                "PAN_PURO": int(r["VOTOS_PAN"]),
                "PRI-PVEM-NA-PT": int(r["VOTOS_PRI_COL"]),
                "MORENA": int(r["VOTOS_MORENA"]),
                "PRD": int(r["VOTOS_PRD"]),
                "MC": int(r["VOTOS_MC"])
            })
            f.write(f"""INSERT INTO electoral_results (
    state_id, election_year, election_type, clave_seccion, clave_municipio,
    lista_nominal, total_votos, participacion_pct,
    ganador_partido, ganador_votos, ganador_pct,
    segundo_partido, segundo_votos, segundo_pct, margen_victoria_pct,
    votos_partidos
) VALUES (
    '{STATE_ID_QRO}', 2015, 'gubernatura', {sec}, {muni_id},
    {ln}, {tv}, {part},
    '{gp}', {gv}, {gpct},
    '{sp}', {sv}, {spct}, {mg},
    '{vp_json}'::jsonb
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
    votos_partidos = EXCLUDED.votos_partidos;\n""")
            total_sql_records += 1

        # 2. Diputaciones 2018
        f.write("\n-- ------------------------------------------------------------------------\n")
        f.write(f"-- Proceso: DIPUTACIONES 2018 ({len(df_18_sec):,} secciones)\n")
        f.write("-- ------------------------------------------------------------------------\n")
        for _, r in df_18_sec.iterrows():
            sec = int(r["SECCION_INT"])
            muni_id, _, _, _ = resolve_territory(sec)
            ln = int(r["LISTA_NOMINAL"])
            tv = int(r["TOTAL_VOTOS"])
            part = float(r["PARTICIPACION_PCT"])
            gp = str(r["GANADOR_PARTIDO"]).replace("'", "''")
            gv = int(r["GANADOR_VOTOS"])
            gpct = float(r["GANADOR_PCT"])
            sp = str(r["SEGUNDO_PARTIDO"]).replace("'", "''")
            sv = int(r["SEGUNDO_VOTOS"])
            spct = float(r["SEGUNDO_PCT"])
            mg = float(r["MARGEN_VICTORIA_PCT"])
            vp_json = json.dumps({
                "PAN-PRD-MC": int(r["VOTOS_PAN_PRD_MC"]),
                "PAN_PURO": int(r["VOTOS_PAN_PURO"]),
                "MORENA-PT-PES": int(r["VOTOS_MORENA_PT_PES"]),
                "PRI": int(r["VOTOS_PRI"]),
                "PVEM": int(r["VOTOS_PVEM"]),
                "NUEVA ALIANZA": int(r["VOTOS_NA"]),
                "MC": int(r["VOTOS_MC_PURO"])
            })
            f.write(f"""INSERT INTO electoral_results (
    state_id, election_year, election_type, clave_seccion, clave_municipio,
    lista_nominal, total_votos, participacion_pct,
    ganador_partido, ganador_votos, ganador_pct,
    segundo_partido, segundo_votos, segundo_pct, margen_victoria_pct,
    votos_partidos
) VALUES (
    '{STATE_ID_QRO}', 2018, 'diputaciones', {sec}, {muni_id},
    {ln}, {tv}, {part},
    '{gp}', {gv}, {gpct},
    '{sp}', {sv}, {spct}, {mg},
    '{vp_json}'::jsonb
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
    votos_partidos = EXCLUDED.votos_partidos;\n""")
            total_sql_records += 1

        # 3. 2021 y 2024
        for df in dfs_21_24:
            year = df["ELECTION_YEAR"].iloc[0]
            etype = df["ELECTION_TYPE"].iloc[0]
            pan_label = df["PAN_LABEL"].iloc[0]
            opp_label = df["OPP_LABEL"].iloc[0]

            f.write(f"\n-- ------------------------------------------------------------------------\n")
            f.write(f"-- Proceso: {etype.upper()} {year} ({len(df):,} secciones)\n")
            f.write(f"-- ------------------------------------------------------------------------\n")

            for _, r in df.iterrows():
                sec = int(r["SECCION_INT"])
                muni_id, _, _, _ = resolve_territory(sec)
                ln = int(r["LISTA_NOMINAL"])
                tv = int(r["TOTAL_VOTOS"])
                part = float(r["PARTICIPACION_PCT"])
                gp = str(r["GANADOR_PARTIDO"]).replace("'", "''")
                gv = int(r["GANADOR_VOTOS"])
                gpct = float(r["GANADOR_PCT"])
                sp = str(r["SEGUNDO_PARTIDO"]).replace("'", "''")
                sv = int(r["SEGUNDO_VOTOS"])
                spct = float(r["SEGUNDO_PCT"])
                mg = float(r["MARGEN_VICTORIA_PCT"])
                vp_json = json.dumps({
                    pan_label: int(r["VOTOS_PAN_ALIANZA"]),
                    "PAN_PURO": int(r["VOTOS_PAN_PURO"]),
                    opp_label: int(r["VOTOS_OPP_ALIANZA"]),
                    "MC": int(r["VOTOS_MC"])
                })
                f.write(f"""INSERT INTO electoral_results (
    state_id, election_year, election_type, clave_seccion, clave_municipio,
    lista_nominal, total_votos, participacion_pct,
    ganador_partido, ganador_votos, ganador_pct,
    segundo_partido, segundo_votos, segundo_pct, margen_victoria_pct,
    votos_partidos
) VALUES (
    '{STATE_ID_QRO}', {year}, '{etype}', {sec}, {muni_id},
    {ln}, {tv}, {part},
    '{gp}', {gv}, {gpct},
    '{sp}', {sv}, {spct}, {mg},
    '{vp_json}'::jsonb
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
    votos_partidos = EXCLUDED.votos_partidos;\n""")
                total_sql_records += 1

    print(f"✅ Archivo SQL generado con {total_sql_records:,} registros electorales de Querétaro.")
    print("🚀 Proceso electoral maestro completado exitosamente.")

if __name__ == "__main__":
    main()
