"""
Procesador e Ingestor Electoral de Puebla (2018 - 2024)
-------------------------------------------------------
Procesa las 5 pestañas exactas de 'data/electoral/Elecciones Puebla 2018 - 2024.xlsx':
  1. Diputaciones 2018 (Header row: 6)
  2. Diputaciones 2021 (Header row: 6)
  3. Diputaciones 2024 (Header row: 7)
  4. Gubernatura 2018 (Header row: 1)
  5. Gubernatura 2021 (Header row: 1)

Genera:
  - data/electoral/ingest_puebla_electoral_results.sql
  - nextjs-app/public/data/pue_electoral_results_cache.json
"""

import os
import sys
import json
from pathlib import Path
import pandas as pd
import numpy as np

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

STATE_ID_PUE = "21212121-2121-2121-2121-212121212121"
EXCEL_PATH = "data/electoral/Elecciones Puebla 2018 - 2024.xlsx"
GEOJSON_PATH = "nextjs-app/public/data/pue_municipios.geojson"
OUTPUT_SQL_PATH = "data/electoral/ingest_puebla_electoral_results.sql"
OUTPUT_CACHE_PATH = "nextjs-app/public/data/pue_electoral_results_cache.json"

CONFIGS = [
    {
        "sheet_name": "Diputaciones 2018",
        "header_row": 5,  # 0-indexed (Row 6)
        "election_year": 2018,
        "election_type": "diputaciones",
        "seccion_col": "SECCION",
        "distrito_col": "ID_DISTRITO",
        "ln_col": "LISTA_NOMINAL_CASILLA",
        "tv_col": "TOTAL_VOTOS_CALCULADOS",
        "pan_label": "PAN-PRD-MC",
        "opp_label": "MORENA-PT-PES",
        "pan_puro_col": "PAN",
        "pan_coalition_cols": ["PAN", "PRD", "MOVIMIENTO CIUDADANO", "PAN_PRD_MC", "PAN_PRD", "PAN_MC", "PRD_MC"],
        "opp_coalition_cols": ["MORENA", "PT", "ENCUENTRO SOCIAL", "PT_MORENA_PES", "PT_MORENA", "PT_PES", "MORENA_PES"],
        "mc_col": "MOVIMIENTO CIUDADANO",
    },
    {
        "sheet_name": "Diputaciones 2021",
        "header_row": 5,  # 0-indexed (Row 6)
        "election_year": 2021,
        "election_type": "diputaciones",
        "seccion_col": "SECCION",
        "distrito_col": "ID_DISTRITO",
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
        "sheet_name": "Diputaciones 2024",
        "header_row": 6,  # 0-indexed (Row 7)
        "election_year": 2024,
        "election_type": "diputaciones",
        "seccion_col": "SECCION",
        "distrito_col": "ID_DISTRITO_FEDERAL",
        "ln_col": "LISTA_NOMINAL",
        "tv_col": "TOTAL_VOTOS_CALCULADO",
        "pan_label": "PAN-PRI-PRD",
        "opp_label": "MORENA-PT-PVEM",
        "pan_puro_col": "PAN",
        "pan_coalition_cols": ["PAN", "PRI", "PRD", "PAN-PRI-PRD", "PAN-PRI", "PAN-PRD", "PRI-PRD"],
        "opp_coalition_cols": ["MORENA", "PT", "PVEM", "PVEM_PT_MORENA", "PVEM_PT", "PVEM_MORENA", "PT_MORENA"],
        "mc_col": "MC",
    },
    {
        "sheet_name": "Gubernatura 2018",
        "header_row": 0,  # 0-indexed (Row 1)
        "election_year": 2018,
        "election_type": "gubernatura",
        "seccion_col": "SECCION",
        "muni_col": "MUNICIPIO",
        "distrito_col": "DISTRITO LOCAL",
        "ln_col": None,  # Se cruza con Diputaciones 2018
        "tv_col": "TOTAL",
        "pan_label": "PAN-PRD-MC-PSI",
        "opp_label": "MORENA-PT-PES",
        "pan_puro_col": "PAN",
        "pan_coalition_cols": [
            "PAN", "PRD", "MC", "PCPP", "PSI",
            "PAN_PRD_MC_PCPP_PSI", "PAN_PRD_MC_PCPP", "PAN_PRD_MC_PSI", "PAN_PRD_PCPP_PSI", "PAN_MC_PCPP_PSI",
            "PRD_MC_PCPP_PSI", "PAN_PRD_MC", "PAN_PRD_PCPP", "PAN_PRD_PSI", "PAN_MC_PCPP", "PAN_MC_PSI",
            "PAN_PCPP_PSI", "PRD_MC_PCPP", "PRD_MC_PSI", "PRD_PCPP_PSI", "MC_PCPP_PSI", "PAN_PRD", "PAN_MC",
            "PAN_PCPP", "PAN_PSI", "PRD_MC", "PRD_PCPP", "PRD_PSI", "MC_PCPP", "MC_PSI", "PCPP_PSI"
        ],
        "opp_coalition_cols": ["MORENA", "PT", "PES", "PT_MORENA_PES", "PT_MORENA", "PT_PES", "MORENA_PES"],
        "mc_col": "MC",
    },
    {
        "sheet_name": "Gubernatura 2021",
        "header_row": 0,  # 0-indexed (Row 1)
        "election_year": 2021,
        "election_type": "gubernatura",
        "seccion_col": "SECCION",
        "muni_col": "MUNICIPIO",
        "distrito_col": "DISTRITO",
        "ln_col": None,  # Se cruza con Diputaciones 2021
        "tv_col": "TOTAL",
        "pan_label": "PAN-PRI-PRD-PSI",
        "opp_label": "MORENA-PT-PVEM-NA",
        "pan_puro_col": "PAN",
        "pan_coalition_cols": [
            "PAN", "PRI", "PRD", "PSI",
            "PAN_PRI_PRD_PSI", "PAN_PRI_PRD", "PAN_PRI_PSI", "PAN_PRD_PSI", "PRI_PRD_PSI",
            "PAN_PRI", "PAN_PRD", "PAN_PSI", "PRI_PRD", "PRI_PSI", "PRD_PSI"
        ],
        "opp_coalition_cols": [
            "MORENA", "PT", "PVEM", "NAP", "FXM",
            "PT_PVEM_MORENA_NAP_FXM", "PT_PVEM_MORENA_NAP", "PT_PVEM_MORENA_FXM", "PT_PVEM_NAP_FXM",
            "PT_MORENA_NAP_FXM", "PVEM_MORENA_NAP_FXM", "PT_PVEM_MORENA", "PT_PVEM_NAP", "PT_PVEM_FXM",
            "PT_MORENA_NAP", "PT_MORENA_FXM", "PT_NAP_FXM", "PVEM_MORENA_NAP", "PVEM_MORENA_FXM",
            "PVEM_NAP_FXM", "MORENA_NAP_FXM", "PT_PVEM", "PT_MORENA", "PT_NAP", "PT_FXM",
            "PVEM_MORENA", "PVEM_NAP", "PVEM_FXM", "MORENA_NAP", "MORENA_FXM", "NAP_FXM"
        ],
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
    print(" 🗳️ SentinelIQ — Procesador Electoral de Puebla (2018 - 2024)")
    print("==================================================================")

    if not os.path.exists(EXCEL_PATH):
        print(f"❌ Archivo no encontrado: {EXCEL_PATH}")
        return

    print(f"📂 Abriendo archivo Excel: {EXCEL_PATH}...")
    xl = pd.ExcelFile(EXCEL_PATH)

    # Cargar municipios de Puebla desde GeoJSON para enriquecer nombres
    muni_lookup = {}
    if os.path.exists(GEOJSON_PATH):
        with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
            geo = json.load(f)
            for idx, feat in enumerate(geo.get("features", [])):
                name = feat.get("properties", {}).get("nombre") or feat.get("properties", {}).get("NAME_2") or f"Municipio {idx+1}"
                muni_lookup[idx + 1] = name
    print(f"🗺️ Municipios catalogados desde GeoJSON: {len(muni_lookup)}")

    # Diccionario para almacenar la lista nominal por sección de los años 2018 y 2021
    ln_by_year_sec = {}
    all_processed = []

    # Estructura del master_cache para WebGIS
    master_cache = {
        "gubernatura": {"2021": {}, "2018": {}},
        "diputaciones": {"2024": {}, "2021": {}, "2018": {}},
        "municipios": {
            "gubernatura": {"2021": {}, "2018": {}},
            "diputaciones": {"2024": {}, "2021": {}, "2018": {}},
        },
        "distritos_locales": {
            "gubernatura": {"2021": {}, "2018": {}},
            "diputaciones": {"2024": {}, "2021": {}, "2018": {}},
        }
    }

    # Procesar primero Diputaciones para guardar listas nominales
    configs_ordered = sorted(CONFIGS, key=lambda c: 0 if c["election_type"] == "diputaciones" else 1)

    for cfg in configs_ordered:
        sname = cfg["sheet_name"]
        hrow = cfg["header_row"]
        year = cfg["election_year"]
        etype = cfg["election_type"]
        pan_label = cfg["pan_label"]
        opp_label = cfg["opp_label"]

        print(f"\n-------------------------------------------------------")
        print(f"📖 Procesando Pestaña: {sname} ({etype.upper()} {year})")
        print(f"-------------------------------------------------------")

        df = pd.read_excel(xl, sheet_name=sname, header=hrow)
        print(f"  • Casillas leídas: {len(df):,}")

        sec_col = cfg["seccion_col"]
        df = df[df[sec_col].notna()].copy()
        df["SECCION_INT"] = clean_numeric_series(df[sec_col]).astype(int)
        df = df[df["SECCION_INT"] > 0]

        pan_cols = [c for c in cfg["pan_coalition_cols"] if c in df.columns]
        opp_cols = [c for c in cfg["opp_coalition_cols"] if c in df.columns]
        pan_puro = cfg["pan_puro_col"] if cfg["pan_puro_col"] in df.columns else None
        mc_col = cfg["mc_col"] if cfg["mc_col"] in df.columns else None
        ln_col = cfg["ln_col"] if cfg["ln_col"] and cfg["ln_col"] in df.columns else None
        tv_col = cfg["tv_col"] if cfg["tv_col"] and cfg["tv_col"] in df.columns else None

        num_cols = set(pan_cols + opp_cols)
        if mc_col: num_cols.add(mc_col)
        if pan_puro: num_cols.add(pan_puro)
        if ln_col: num_cols.add(ln_col)
        if tv_col: num_cols.add(tv_col)

        for col in num_cols:
            df[col] = clean_numeric_series(df[col])

        agg_rules = {col: "sum" for col in num_cols}
        muni_col = cfg.get("muni_col")
        if muni_col and muni_col in df.columns:
            agg_rules[muni_col] = "first"
        dist_col = cfg.get("distrito_col")
        if dist_col and dist_col in df.columns:
            agg_rules[dist_col] = "first"

        grouped = df.groupby("SECCION_INT").agg(agg_rules).reset_index()
        print(f"  • Secciones electorales únicas agrupadas: {len(grouped):,}")

        grouped["VOTOS_PAN_ALIANZA"] = grouped[pan_cols].sum(axis=1)
        grouped["VOTOS_OPP_ALIANZA"] = grouped[opp_cols].sum(axis=1)
        grouped["VOTOS_PAN_PURO"] = grouped[pan_puro] if pan_puro and pan_puro in grouped.columns else grouped["VOTOS_PAN_ALIANZA"]
        grouped["VOTOS_MC"] = grouped[mc_col] if mc_col and mc_col in grouped.columns else 0

        if tv_col and tv_col in grouped.columns:
            grouped["TOTAL_VOTOS"] = grouped[tv_col]
        else:
            grouped["TOTAL_VOTOS"] = grouped["VOTOS_PAN_ALIANZA"] + grouped["VOTOS_OPP_ALIANZA"] + grouped["VOTOS_MC"]

        # Si tenemos lista nominal directamente
        if ln_col and ln_col in grouped.columns:
            grouped["LISTA_NOMINAL"] = grouped[ln_col]
            # Guardar en cache para la elección de gubernatura del mismo año
            for _, r in grouped.iterrows():
                ln_by_year_sec[(year, int(r["SECCION_INT"]))] = int(r["LISTA_NOMINAL"])
        else:
            # Buscar en el diccionario de lista nominal guardada
            grouped["LISTA_NOMINAL"] = grouped["SECCION_INT"].apply(
                lambda s: ln_by_year_sec.get((year, int(s)), 0)
            )

        grouped["PARTICIPACION_PCT"] = np.where(
            grouped["LISTA_NOMINAL"] > 0,
            (grouped["TOTAL_VOTOS"] / grouped["LISTA_NOMINAL"]) * 100,
            0.0
        ).round(2)

        # Determinar Ganador y Margen
        def calc_winner(r):
            v_pan = r["VOTOS_PAN_ALIANZA"]
            v_opp = r["VOTOS_OPP_ALIANZA"]
            v_mc = r["VOTOS_MC"]
            ranking = [
                (pan_label, v_pan),
                (opp_label, v_opp),
                ("MC", v_mc),
            ]
            ranking.sort(key=lambda x: x[1], reverse=True)
            w_p, w_v = ranking[0]
            s_p, s_v = ranking[1]
            tv = r["TOTAL_VOTOS"] if r["TOTAL_VOTOS"] > 0 else (w_v + s_v)
            w_pct = round((w_v / tv * 100), 2) if tv > 0 else 0.0
            s_pct = round((s_v / tv * 100), 2) if tv > 0 else 0.0
            margin = round(w_pct - s_pct, 2)
            return pd.Series([w_p, int(w_v), w_pct, s_p, int(s_v), s_pct, margin])

        win_cols = [
            "GANADOR_PARTIDO", "GANADOR_VOTOS", "GANADOR_PCT",
            "SEGUNDO_PARTIDO", "SEGUNDO_VOTOS", "SEGUNDO_PCT",
            "MARGEN_VICTORIA_PCT"
        ]
        grouped[win_cols] = grouped.apply(calc_winner, axis=1)
        grouped["ELECTION_YEAR"] = year
        grouped["ELECTION_TYPE"] = etype
        grouped["PAN_LABEL"] = pan_label
        grouped["OPP_LABEL"] = opp_label

        all_processed.append(grouped)

        # Llenar master_cache para WebGIS
        yr_str = str(year)
        mpio_acc = {}
        dist_acc = {}

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

            muni_val = str(r[muni_col]).strip() if muni_col and muni_col in r and pd.notna(r[muni_col]) else "Puebla"
            dist_val = int(r[dist_col]) if dist_col and dist_col in r and pd.notna(r[dist_col]) and str(r[dist_col]).isdigit() else 1

            item = {
                "election_year": year,
                "election_type": etype,
                "clave_seccion": sec,
                "clave_municipio": 1,
                "municipio_nombre": muni_val,
                "distrito_local": dist_val,
                "distrito_federal": dist_val,
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
                mpio_acc[muni_val] = {"ln": 0, "tv": 0, "pan": 0, "opp": 0, "mc": 0}
            mpio_acc[muni_val]["ln"] += ln
            mpio_acc[muni_val]["tv"] += tv
            mpio_acc[muni_val]["pan"] += v_pan
            mpio_acc[muni_val]["opp"] += v_opp
            mpio_acc[muni_val]["mc"] += v_mc

        # Calcular totales agregados por municipio
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

            if "municipios" in master_cache and etype in master_cache["municipios"] and yr_str in master_cache["municipios"][etype]:
                master_cache["municipios"][etype][yr_str][mun_name] = {
                    "election_year": year,
                    "election_type": etype,
                    "nombre": mun_name,
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

        # Resumen de la pestaña
        tot_pan = grouped["VOTOS_PAN_ALIANZA"].sum()
        tot_opp = grouped["VOTOS_OPP_ALIANZA"].sum()
        tot_mc = grouped["VOTOS_MC"].sum()
        tot_gral = grouped["TOTAL_VOTOS"].sum()
        print(f"  📊 RESULTADOS GENERALES PUEBLA ({sname}):")
        print(f"     • {pan_label}: {tot_pan:,.0f} votos ({(tot_pan/tot_gral*100 if tot_gral>0 else 0):.2f}%)")
        print(f"     • {opp_label}: {tot_opp:,.0f} votos ({(tot_opp/tot_gral*100 if tot_gral>0 else 0):.2f}%)")
        print(f"     • MC: {tot_mc:,.0f} votos ({(tot_mc/tot_gral*100 if tot_gral>0 else 0):.2f}%)")
        print(f"     • Total Votos: {tot_gral:,.0f} | Secciones: {len(grouped):,}")

    # Guardar Cache JSON para WebGIS
    print(f"\n💾 Guardando Cache JSON en: {OUTPUT_CACHE_PATH}...")
    with open(OUTPUT_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(master_cache, f, ensure_ascii=False)
    print("✅ Cache JSON WebGIS generado con éxito.")

    # Generar SQL de Inserción Masiva
    print(f"\n💾 Generando sentencias SQL en: {OUTPUT_SQL_PATH}...")
    total_sql_records = 0
    with open(OUTPUT_SQL_PATH, "w", encoding="utf-8") as f:
        f.write("-- ==============================================================================\n")
        f.write("-- Ingesta Masiva: Resultados Electorales Puebla (2018 - 2024)\n")
        f.write(f"-- State ID Puebla: {STATE_ID_PUE}\n")
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
    '{STATE_ID_PUE}', {year}, '{etype}', {sec}, 1,
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

    print(f"✅ Archivo SQL generado con {total_sql_records:,} registros electorales de Puebla.")
    print("🚀 Proceso completado exitosamente.")

if __name__ == "__main__":
    main()
