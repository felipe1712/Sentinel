"""
Procesador e Ingestor Electoral de Querétaro (2021 y 2024)
---------------------------------------------------------
Procesa las pestañas oficiales de 'data/Queretaro/electoral/Resultados Querétaro 2021 y 2024.xlsx':
  1. 'Querétaro 2021' (Gubernatura / Elección Concurrente 2021)
  2. 'Querétaro 2024' (Diputaciones Federales / Elección Federal 2024)

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
from pathlib import Path
import pandas as pd
import numpy as np
import unicodedata

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

STATE_ID_QRO = "11111111-1111-1111-1111-111111111111"
BASE_DIR = Path(__file__).resolve().parent.parent
EXCEL_PATH = BASE_DIR / "data" / "Queretaro" / "electoral" / "Resultados Querétaro 2021 y 2024.xlsx"
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

ALIASES = {
    "SANTIAGO DE QUERETARO": "Querétaro",
    "SANTIAGO DE QUERÉTARO": "Querétaro",
    "QUERETARO": "Querétaro",
    "EL MARQUES": "El Marqués",
    "COLON": "Colón",
    "PENAMILLER": "Peñamiller",
    "PEÑAMILLER": "Peñamiller",
    "SAN JOAQUIN": "San Joaquín",
    "SAN JUAN DEL RIO": "San Juan del Río",
    "TOLIMAN": "Tolimán",
}

def norm_text(s):
    if not s:
        return ""
    return ''.join(c for c in unicodedata.normalize('NFD', str(s).upper().strip()) if unicodedata.category(c) != 'Mn')

CONFIGS = [
    {
        "sheet_name": "Querétaro 2021",
        "header_row": 2,  # 0-indexed (Row 3)
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
        "header_row": 2,  # 0-indexed (Row 3)
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
        "header_row": 0,  # 0-indexed (Row 1)
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

def clean_numeric_series(series: pd.Series) -> pd.Series:
    return pd.to_numeric(
        series.astype(str).str.replace(",", "").str.replace("'", "").str.strip(),
        errors="coerce"
    ).fillna(0)

def main():
    print("==================================================================")
    print(" 🗳️ SentinelIQ — Procesador Electoral de Querétaro (2021 y 2024)")
    print("==================================================================")

    if not EXCEL_PATH.exists():
        print(f"❌ Archivo no encontrado: {EXCEL_PATH}")
        return

    print(f"📂 Abriendo archivo Excel: {EXCEL_PATH.name}...")
    xl = pd.ExcelFile(str(EXCEL_PATH))

    # Cargar lookups territoriales desde SECCION.shp
    sec_to_mun = {}
    sec_to_mun_id = {}
    sec_to_dl = {}
    sec_to_df = {}
    muni_name_to_id = {}

    for mid, mname in MUNICIPIOS_DICT.items():
        muni_name_to_id[mname] = mid
        muni_name_to_id[mname.upper()] = mid
        muni_name_to_id[norm_text(mname)] = mid

    muni_name_to_id["SANTIAGO DE QUERETARO"] = 14
    muni_name_to_id["SANTIAGO DE QUERÉTARO"] = 14

    print("🔍 Cargando catálogo cartográfico seccional desde Shapefiles INE...")
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
        print(f"  • {len(sec_to_mun)} secciones catalogadas desde SECCION.shp")

    # Estructura del master_cache para WebGIS
    master_cache = {
        "gubernatura": {"2021": {}},
        "diputaciones": {"2021": {}, "2024": {}},
        "municipios": {
            "gubernatura": {"2021": {}},
            "diputaciones": {"2021": {}, "2024": {}},
        },
        "distritos_locales": {
            "gubernatura": {"2021": {}},
            "diputaciones": {"2021": {}, "2024": {}},
        },
        "distritos_federales": {
            "gubernatura": {"2021": {}},
            "diputaciones": {"2021": {}, "2024": {}},
        }
    }

    all_processed = []

    # Cache de hojas leídas para no re-leer el Excel
    loaded_sheets = {}

    for cfg in CONFIGS:
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
            loaded_sheets[cache_key] = xl.parse(sname, header=hrow)
        raw_df = loaded_sheets[cache_key].copy()

        sec_col = cfg["seccion_col"]
        ln_col = cfg["ln_col"]
        tv_col = cfg["tv_col"]

        # Limpiar SECCION
        raw_df = raw_df[raw_df[sec_col].notna()]
        raw_df["SECCION_INT"] = pd.to_numeric(raw_df[sec_col], errors="coerce").fillna(0).astype(int)
        raw_df = raw_df[raw_df["SECCION_INT"] > 0]

        # Limpiar numéricos
        raw_df["LISTA_NOMINAL"] = clean_numeric_series(raw_df[ln_col])
        raw_df["TOTAL_VOTOS"] = clean_numeric_series(raw_df[tv_col])

        # Calcular votos coalición PAN
        avail_pan_cols = [c for c in pan_cols if c in raw_df.columns]
        for c in avail_pan_cols:
            raw_df[c] = clean_numeric_series(raw_df[c])
        raw_df["VOTOS_PAN_ALIANZA"] = raw_df[avail_pan_cols].sum(axis=1)

        raw_df["VOTOS_PAN_PURO"] = clean_numeric_series(raw_df[pan_puro_col]) if pan_puro_col in raw_df.columns else raw_df["VOTOS_PAN_ALIANZA"]

        # Calcular votos coalición MORENA
        avail_opp_cols = [c for c in opp_cols if c in raw_df.columns]
        for c in avail_opp_cols:
            raw_df[c] = clean_numeric_series(raw_df[c])
        raw_df["VOTOS_OPP_ALIANZA"] = raw_df[avail_opp_cols].sum(axis=1)

        # MC
        if mc_col in raw_df.columns:
            raw_df["VOTOS_MC"] = clean_numeric_series(raw_df[mc_col])
        else:
            raw_df["VOTOS_MC"] = 0

        # Agrupar a nivel sección
        agg_dict = {
            "LISTA_NOMINAL": "sum",
            "TOTAL_VOTOS": "sum",
            "VOTOS_PAN_ALIANZA": "sum",
            "VOTOS_PAN_PURO": "sum",
            "VOTOS_OPP_ALIANZA": "sum",
            "VOTOS_MC": "sum",
        }

        grouped = raw_df.groupby("SECCION_INT", as_index=False).agg(agg_dict)

        # Determinar Ganador, Segundo y Métricas
        winners = []
        winner_votes = []
        winner_pcts = []
        seconds = []
        second_votes = []
        second_pcts = []
        margins = []
        part_pcts = []

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

        all_processed.append(grouped)

        # Llenar master_cache para WebGIS
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

            # Resolver Municipio, Distritos desde cartografía INE
            muni_val = sec_to_mun.get(sec, "Querétaro")
            muni_id = sec_to_mun_id.get(sec, 14)
            dl_val = sec_to_dl.get(sec, 1)
            df_val = sec_to_df.get(sec, 1)

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

            if etype in master_cache and yr_str in master_cache[etype]:
                master_cache[etype][yr_str][sec_str] = item

            # Acumular por municipio
            if muni_val not in mpio_acc:
                mpio_acc[muni_val] = {"id": muni_id, "ln": 0, "tv": 0, "pan": 0, "opp": 0, "mc": 0, "sec_count": 0}
            mpio_acc[muni_val]["ln"] += ln
            mpio_acc[muni_val]["tv"] += tv
            mpio_acc[muni_val]["pan"] += v_pan
            mpio_acc[muni_val]["opp"] += v_opp
            mpio_acc[muni_val]["mc"] += v_mc
            mpio_acc[muni_val]["sec_count"] += 1

            # Acumular por distrito local
            dl_str = str(dl_val)
            if dl_str not in dist_loc_acc:
                dist_loc_acc[dl_str] = {"ln": 0, "tv": 0, "pan": 0, "opp": 0, "mc": 0, "sec_count": 0}
            dist_loc_acc[dl_str]["ln"] += ln
            dist_loc_acc[dl_str]["tv"] += tv
            dist_loc_acc[dl_str]["pan"] += v_pan
            dist_loc_acc[dl_str]["opp"] += v_opp
            dist_loc_acc[dl_str]["mc"] += v_mc
            dist_loc_acc[dl_str]["sec_count"] += 1

            # Acumular por distrito federal
            df_str = str(df_val)
            if df_str not in dist_fed_acc:
                dist_fed_acc[df_str] = {"ln": 0, "tv": 0, "pan": 0, "opp": 0, "mc": 0, "sec_count": 0}
            dist_fed_acc[df_str]["ln"] += ln
            dist_fed_acc[df_str]["tv"] += tv
            dist_fed_acc[df_str]["pan"] += v_pan
            dist_fed_acc[df_str]["opp"] += v_opp
            dist_fed_acc[df_str]["mc"] += v_mc
            dist_fed_acc[df_str]["sec_count"] += 1

        # Totales agregados por municipio
        for mun_name, stats in mpio_acc.items():
            tot = stats["tv"]
            r_pan = stats["pan"]
            r_opp = stats["opp"]
            r_mc = stats["mc"]

            ranking = [(pan_label, r_pan), (opp_label, r_opp), ("MC", r_mc)]
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
                "votos_partidos": {
                    pan_label: r_pan,
                    opp_label: r_opp,
                    "MC": r_mc
                }
            }

            if "municipios" in master_cache and etype in master_cache["municipios"] and yr_str in master_cache["municipios"][etype]:
                master_cache["municipios"][etype][yr_str][mun_name] = m_item
                master_cache["municipios"][etype][yr_str][norm_text(mun_name)] = m_item
                master_cache["municipios"][etype][yr_str][mun_name.upper()] = m_item
                master_cache["municipios"][etype][yr_str][str(stats["id"])] = m_item
                if mun_name == "Querétaro":
                    master_cache["municipios"][etype][yr_str]["Santiago de Querétaro"] = m_item
                    master_cache["municipios"][etype][yr_str]["SANTIAGO DE QUERETARO"] = m_item

        # Totales agregados por distrito local
        for dl_str, stats in dist_loc_acc.items():
            tot = stats["tv"]
            r_pan = stats["pan"]
            r_opp = stats["opp"]
            r_mc = stats["mc"]

            ranking = [(pan_label, r_pan), (opp_label, r_opp), ("MC", r_mc)]
            ranking.sort(key=lambda x: x[1], reverse=True)
            mw_p, mw_v = ranking[0]
            ms_p, ms_v = ranking[1]

            m_wpct = round((mw_v / tot * 100), 2) if tot > 0 else 0.0
            m_spct = round((ms_v / tot * 100), 2) if tot > 0 else 0.0
            m_part = round((tot / stats["ln"] * 100), 2) if stats["ln"] > 0 else 0.0

            dl_item = {
                "election_year": year,
                "election_type": etype,
                "distrito_local": int(dl_str),
                "nombre": f"Distrito Local {dl_str}",
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
                "votos_partidos": {
                    pan_label: r_pan,
                    opp_label: r_opp,
                    "MC": r_mc
                }
            }
            if "distritos_locales" in master_cache and etype in master_cache["distritos_locales"] and yr_str in master_cache["distritos_locales"][etype]:
                master_cache["distritos_locales"][etype][yr_str][dl_str] = dl_item

        # Totales agregados por distrito federal
        for df_str, stats in dist_fed_acc.items():
            tot = stats["tv"]
            r_pan = stats["pan"]
            r_opp = stats["opp"]
            r_mc = stats["mc"]

            ranking = [(pan_label, r_pan), (opp_label, r_opp), ("MC", r_mc)]
            ranking.sort(key=lambda x: x[1], reverse=True)
            mw_p, mw_v = ranking[0]
            ms_p, ms_v = ranking[1]

            m_wpct = round((mw_v / tot * 100), 2) if tot > 0 else 0.0
            m_spct = round((ms_v / tot * 100), 2) if tot > 0 else 0.0
            m_part = round((tot / stats["ln"] * 100), 2) if stats["ln"] > 0 else 0.0

            df_item = {
                "election_year": year,
                "election_type": etype,
                "distrito_federal": int(df_str),
                "nombre": f"Distrito Federal {df_str}",
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
                "votos_partidos": {
                    pan_label: r_pan,
                    opp_label: r_opp,
                    "MC": r_mc
                }
            }
            if "distritos_federales" in master_cache and etype in master_cache["distritos_federales"] and yr_str in master_cache["distritos_federales"][etype]:
                master_cache["distritos_federales"][etype][yr_str][df_str] = df_item

        # Accesos directos de conveniencia a nivel raíz por año
        if etype == "diputaciones" and yr_str == "2024":
            master_cache["2024"] = master_cache["diputaciones"]["2024"]
        elif yr_str not in master_cache:
            master_cache[yr_str] = master_cache[etype][yr_str]

        tot_pan = grouped["VOTOS_PAN_ALIANZA"].sum()
        tot_opp = grouped["VOTOS_OPP_ALIANZA"].sum()
        tot_mc = grouped["VOTOS_MC"].sum()
        tot_gral = grouped["TOTAL_VOTOS"].sum()
        print(f"  📊 RESULTADOS QUERÉTARO ({sname} - {etype} {year}):")
        print(f"     • {pan_label}: {tot_pan:,.0f} votos ({(tot_pan/tot_gral*100 if tot_gral>0 else 0):.2f}%)")
        print(f"     • {opp_label}: {tot_opp:,.0f} votos ({(tot_opp/tot_gral*100 if tot_gral>0 else 0):.2f}%)")
        print(f"     • MC: {tot_mc:,.0f} votos ({(tot_mc/tot_gral*100 if tot_gral>0 else 0):.2f}%)")
        print(f"     • Total Votos: {tot_gral:,.0f} | Secciones: {len(grouped):,} | Municipios: {len(mpio_acc):,}")

    # Guardar Cache JSON para WebGIS
    print(f"\n💾 Guardando Cache JSON en: {OUTPUT_CACHE_PATH}...")
    with open(OUTPUT_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(master_cache, f, ensure_ascii=False)
    cache_size_mb = os.path.getsize(OUTPUT_CACHE_PATH) / (1024 * 1024)
    print(f"✅ Cache JSON WebGIS generado con éxito ({cache_size_mb:.2f} MB).")

    # Generar SQL de Inserción Masiva
    print(f"\n💾 Generando sentencias SQL en: {OUTPUT_SQL_PATH}...")
    total_sql_records = 0
    with open(OUTPUT_SQL_PATH, "w", encoding="utf-8") as f:
        f.write("-- ==============================================================================\n")
        f.write("-- Ingesta Masiva: Resultados Electorales Querétaro (2021 y 2024)\n")
        f.write(f"-- State ID Querétaro: {STATE_ID_QRO}\n")
        f.write("-- ==============================================================================\n\n")

        for df in all_processed:
            year = df["ELECTION_YEAR"].iloc[0]
            etype = df["ELECTION_TYPE"].iloc[0]
            pan_label = df["PAN_LABEL"].iloc[0]
            opp_label = df["OPP_LABEL"].iloc[0]

            f.write(f"-- ------------------------------------------------------------------------\n")
            f.write(f"-- Proceso: {etype.upper()} {year} ({len(df):,} secciones)\n")
            f.write(f"-- ------------------------------------------------------------------------\n")

            for _, r in df.iterrows():
                sec = int(r["SECCION_INT"])
                muni_id = sec_to_mun_id.get(sec, 14)
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

                v_pan = int(r["VOTOS_PAN_ALIANZA"])
                v_pan_puro = int(r["VOTOS_PAN_PURO"])
                v_opp = int(r["VOTOS_OPP_ALIANZA"])
                v_mc = int(r["VOTOS_MC"])

                partidos_json = json.dumps({
                    pan_label: v_pan,
                    "PAN_PURO": v_pan_puro,
                    opp_label: v_opp,
                    "MC": v_mc
                })

                sql = f"""INSERT INTO electoral_results (
    state_id, election_year, election_type, clave_seccion, clave_municipio,
    lista_nominal, total_votos, participacion_pct,
    ganador_partido, ganador_votos, ganador_pct,
    segundo_partido, segundo_votos, segundo_pct, margen_victoria_pct,
    votos_partidos
) VALUES (
    '{STATE_ID_QRO}', {year}, '{etype}', {sec}, {muni_id},
    {ln}, {tv}, {part},
    '{g_partido}', {g_votos}, {g_pct},
    '{s_partido}', {s_votos}, {s_pct}, {margen},
    '{partidos_json}'::jsonb
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

    print(f"✅ Archivo SQL generado con {total_sql_records:,} registros electorales de Querétaro.")
    print("🚀 Proceso completado exitosamente.")

if __name__ == "__main__":
    main()
