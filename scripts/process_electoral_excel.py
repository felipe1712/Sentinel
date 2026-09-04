"""
Procesador e Ingestor Electoral de Guanajuato (2018 - 2024)
-----------------------------------------------------------
Procesa las 4 pestañas exactas del archivo 'Guanajuato 2018 - 2024.xlsx':
  1. Gubernatura 2018 (Header row: 6)
  2. Gubernatura 2024 ('Guanajuato 2018 - 2024', Header row: 6)
  3. Diputaciones 2018 ('Guanajuato Dip 2018', Header row: 5)
  4. Diputaciones 2024 ('Guanajuato Dip 2024', Header row: 6)

Aplica:
  - Agrupación precisa por SECCION (sumando todas las casillas B, C, E, S)
  - Sumatoria de Coaliciones Opción A (PAN + aliados + combinaciones)
  - Extracción de Voto Duro de PAN (solo logo PAN)
  - Votación de Alianza Opositora (MORENA y aliados)
  - Votación de Movimiento Ciudadano
  - Cálculo de Ganador, Segundo Lugar, Margen de Victoria (%) y Participación (%)
  - Generación de SQL masivo para tabla electoral_results en PostgreSQL
"""

import os
import sys
import json
from pathlib import Path
import pandas as pd
import numpy as np

# Forzar UTF-8 para consola de Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

STATE_ID_GTO = "00000000-0000-0000-0000-000000000011"
EXCEL_PATH = "data/electoral/Guanajuato 2018 - 2024.xlsx"

CONFIGS = [
    {
        "sheet_name": "Gubernatura 2018",
        "header_row": 6,
        "election_year": 2018,
        "election_type": "gubernatura",
        "seccion_col": "SECCION",
        "ln_col": "LISTA_NOMINAL",
        "tv_col": "TOTAL_VOTOS_CALCULADO",
        "pan_puro_col": "PAN",
        "pan_coalition_cols": ["PAN", "PRD", "MC", "PAN-PRD-MC", "PAN-PRD", "PAN-MC", "PRD-MC"],
        "opp_coalition_cols": ["MORENA", "PT", "PES", "MORENA-PT-PES", "MORENA-PT", "MORENA-PES", "PT-PES"],
        "mc_col": "MC",
    },
    {
        "sheet_name": "Guanajuato 2018 - 2024",
        "header_row": 6,
        "election_year": 2024,
        "election_type": "gubernatura",
        "seccion_col": "SECCION",
        "muni_col": "MUNICIPIO",
        "distrito_col": "ID_DISTRITO_LOCAL",
        "ln_col": "LISTA_NOMINAL",
        "tv_col": "TOTAL_VOTOS",
        "pan_puro_col": "PAN",
        "pan_coalition_cols": ["PAN", "PRI", "PRD", "PAN_PRI_PRD", "PAN_PRI", "PAN_PRD", "PRI_PRD"],
        "opp_coalition_cols": ["MORENA", "PT", "PVEM", "PVEM_PT_MORENA", "PVEM_PT", "PVEM_MORENA", "PT_MORENA"],
        "mc_col": "MC",
    },
    {
        "sheet_name": "Guanajuato Dip 2018",
        "header_row": 5,
        "election_year": 2018,
        "election_type": "diputaciones",
        "seccion_col": "SECCION",
        "distrito_col": "ID_DISTRITO",
        "ln_col": "LISTA_NOMINAL_CASILLA",
        "tv_col": "TOTAL_VOTOS_CALCULADOS",
        "pan_puro_col": "PAN",
        "pan_coalition_cols": ["PAN", "PRD", "MC", "PAN_PRD_MC", "PAN_PRD", "PAN_MC", "PRD_MC"],
        "opp_coalition_cols": ["MORENA", "PT", "PES", "PT_MORENA_PES", "PT_MORENA", "PT_PES", "MORENA_PES"],
        "mc_col": "MC",
    },
    {
        "sheet_name": "Guanajuato Dip 2024",
        "header_row": 6,
        "election_year": 2024,
        "election_type": "diputaciones",
        "seccion_col": "SECCION",
        "distrito_col": "ID_DISTRITO_FEDERAL",
        "ln_col": "LISTA_NOMINAL",
        "tv_col": "TOTAL_VOTOS_CALCULADO",
        "pan_puro_col": "PAN",
        "pan_coalition_cols": ["PAN", "PRI", "PRD", "PAN-PRI-PRD", "PAN-PRI", "PAN-PRD", "PRI-PRD"],
        "opp_coalition_cols": ["MORENA", "PT", "PVEM", "PVEM_PT_MORENA", "PVEM_PT", "PVEM_MORENA", "PT_MORENA"],
        "mc_col": "MC",
    },
]

def clean_numeric_series(series: pd.Series) -> pd.Series:
    """Convierte a numérico seguro, manejando strings con comas, texto o nulos"""
    return pd.to_numeric(
        series.astype(str).str.replace(",", "").str.replace("'", "").str.strip(),
        errors="coerce"
    ).fillna(0)

def process_one_sheet(xl: pd.ExcelFile, cfg: dict) -> pd.DataFrame:
    sname = cfg["sheet_name"]
    hrow = cfg["header_row"]
    year = cfg["election_year"]
    etype = cfg["election_type"]

    print(f"\n=======================================================")
    print(f"📖 Procesando: {sname} ({etype.upper()} {year})")
    print(f"=======================================================")

    df = pd.read_excel(xl, sheet_name=sname, header=hrow)
    print(f"  • Filas brutas (casillas): {len(df):,}")

    sec_col = cfg["seccion_col"]
    df = df[df[sec_col].notna()].copy()
    df["SECCION_INT"] = clean_numeric_series(df[sec_col]).astype(int)
    df = df[df["SECCION_INT"] > 0]
    print(f"  • Casillas válidas con sección: {len(df):,}")

    # Identificar columnas de partidos presentes en este DataFrame
    pan_cols = [c for c in cfg["pan_coalition_cols"] if c in df.columns]
    opp_cols = [c for c in cfg["opp_coalition_cols"] if c in df.columns]
    pan_puro = cfg["pan_puro_col"] if cfg["pan_puro_col"] in df.columns else None
    mc_col = cfg["mc_col"] if cfg["mc_col"] in df.columns else None
    ln_col = cfg["ln_col"] if cfg["ln_col"] in df.columns else None
    tv_col = cfg["tv_col"] if cfg["tv_col"] in df.columns else None

    # Identificar todas las columnas numéricas a limpiar y sumar
    numeric_cols_to_sum = set(pan_cols + opp_cols)
    if mc_col:
        numeric_cols_to_sum.add(mc_col)
    if pan_puro:
        numeric_cols_to_sum.add(pan_puro)
    if ln_col:
        numeric_cols_to_sum.add(ln_col)
    if tv_col:
        numeric_cols_to_sum.add(tv_col)

    # Limpiar columnas numéricas
    for col in numeric_cols_to_sum:
        if col in df.columns:
            df[col] = clean_numeric_series(df[col])

    # Construir dict de agregación
    agg_rules = {}
    for col in numeric_cols_to_sum:
        if col in df.columns:
            agg_rules[col] = "sum"

    muni_col = cfg.get("muni_col")
    if muni_col and muni_col in df.columns:
        agg_rules[muni_col] = "first"

    dist_col = cfg.get("distrito_col")
    if dist_col and dist_col in df.columns:
        agg_rules[dist_col] = "first"

    # GROUP BY SECCION_INT
    grouped = df.groupby("SECCION_INT").agg(agg_rules).reset_index()
    print(f"  • Secciones electorales únicas agrupadas: {len(grouped):,}")

    # Cálculos de votación
    grouped["VOTOS_PAN_ALIANZA"] = grouped[pan_cols].sum(axis=1)
    grouped["VOTOS_OPP_ALIANZA"] = grouped[opp_cols].sum(axis=1)
    grouped["VOTOS_PAN_PURO"] = grouped[pan_puro] if pan_puro and pan_puro in grouped.columns else grouped["VOTOS_PAN_ALIANZA"]
    grouped["VOTOS_MC"] = grouped[mc_col] if mc_col and mc_col in grouped.columns else 0

    if tv_col and tv_col in grouped.columns:
        grouped["TOTAL_VOTOS"] = grouped[tv_col]
    else:
        grouped["TOTAL_VOTOS"] = grouped["VOTOS_PAN_ALIANZA"] + grouped["VOTOS_OPP_ALIANZA"] + grouped["VOTOS_MC"]

    if ln_col and ln_col in grouped.columns:
        grouped["LISTA_NOMINAL"] = grouped[ln_col]
        grouped["PARTICIPACION_PCT"] = np.where(
            grouped["LISTA_NOMINAL"] > 0,
            (grouped["TOTAL_VOTOS"] / grouped["LISTA_NOMINAL"]) * 100,
            0.0
        ).round(2)
    else:
        grouped["LISTA_NOMINAL"] = 0
        grouped["PARTICIPACION_PCT"] = 0.0

    # Determinar ganador y segundo lugar por sección
    pan_label = "PAN-PRD-MC" if year == 2018 else "PAN-PRI-PRD"
    opp_label = "MORENA-PT-PES" if year == 2018 else "MORENA-PT-PVEM"

    def compute_winner(r):
        v_pan = r["VOTOS_PAN_ALIANZA"]
        v_opp = r["VOTOS_OPP_ALIANZA"]
        v_mc = r["VOTOS_MC"]

        ranking = [
            (pan_label, v_pan),
            (opp_label, v_opp),
            ("MC", v_mc),
        ]
        ranking.sort(key=lambda x: x[1], reverse=True)
        winner_p, winner_v = ranking[0]
        second_p, second_v = ranking[1]

        tv = r["TOTAL_VOTOS"] if r["TOTAL_VOTOS"] > 0 else (winner_v + second_v)
        w_pct = round((winner_v / tv * 100), 2) if tv > 0 else 0.0
        s_pct = round((second_v / tv * 100), 2) if tv > 0 else 0.0
        margin = round(w_pct - s_pct, 2)

        return pd.Series([winner_p, int(winner_v), w_pct, second_p, int(second_v), s_pct, margin])

    win_cols = [
        "GANADOR_PARTIDO", "GANADOR_VOTOS", "GANADOR_PCT",
        "SEGUNDO_PARTIDO", "SEGUNDO_VOTOS", "SEGUNDO_PCT",
        "MARGEN_VICTORIA_PCT"
    ]
    grouped[win_cols] = grouped.apply(compute_winner, axis=1)

    grouped["ELECTION_YEAR"] = year
    grouped["ELECTION_TYPE"] = etype
    grouped["STATE_ID"] = STATE_ID_GTO

    # Estadísticas ejecutivas de la pestaña
    tot_pan = grouped["VOTOS_PAN_ALIANZA"].sum()
    tot_opp = grouped["VOTOS_OPP_ALIANZA"].sum()
    tot_mc = grouped["VOTOS_MC"].sum()
    tot_gral = grouped["TOTAL_VOTOS"].sum()

    pan_wins = (grouped["GANADOR_PARTIDO"] == pan_label).sum()
    opp_wins = (grouped["GANADOR_PARTIDO"] == opp_label).sum()
    mc_wins = (grouped["GANADOR_PARTIDO"] == "MC").sum()

    print(f"\n  📊 RESULTADOS GENERALES DE {sname.upper()}:")
    print(f"     -> {pan_label}: {tot_pan:,.0f} votos ({(tot_pan/tot_gral*100):.2f}%) | {pan_wins:,} secciones ganadas")
    print(f"     -> {opp_label}: {tot_opp:,.0f} votos ({(tot_opp/tot_gral*100):.2f}%) | {opp_wins:,} secciones ganadas")
    print(f"     -> MC: {tot_mc:,.0f} votos ({(tot_mc/tot_gral*100):.2f}%) | {mc_wins:,} secciones ganadas")
    print(f"     -> Votos Totales: {tot_gral:,.0f} | Participación Promedio: {grouped['PARTICIPACION_PCT'].mean():.2f}%")

    return grouped

def main():
    print("==================================================================")
    print(" 🗳️ SentinelIQ — Procesador Electoral de Guanajuato (4 Pestañas)")
    print("==================================================================")

    if not os.path.exists(EXCEL_PATH):
        print(f"❌ Archivo no encontrado: {EXCEL_PATH}")
        return

    xl = pd.ExcelFile(EXCEL_PATH)
    print(f"📂 Archivo cargado: {EXCEL_PATH}")
    print(f"📋 Pestañas del archivo: {xl.sheet_names}")

    all_processed = []
    for cfg in CONFIGS:
        if cfg["sheet_name"] in xl.sheet_names:
            proc_df = process_one_sheet(xl, cfg)
            all_processed.append(proc_df)
        else:
            print(f"⚠️ Pestaña '{cfg['sheet_name']}' no encontrada en el archivo.")

    # Generar SQL de Inserción Masiva
    output_sql = "data/electoral/ingest_electoral_results.sql"
    print(f"\n💾 Generando sentencias SQL en: {output_sql}...")

    with open(output_sql, "w", encoding="utf-8") as f:
        f.write("-- ==============================================================================\n")
        f.write("-- Ingesta Masiva: Resultados Electorales Guanajuato (2018 - 2024)\n")
        f.write("-- ==============================================================================\n\n")

        total_records = 0
        for df in all_processed:
            year = df["ELECTION_YEAR"].iloc[0]
            etype = df["ELECTION_TYPE"].iloc[0]
            f.write(f"-- ------------------------------------------------------------------------\n")
            f.write(f"-- Proceso: {etype.upper()} {year} ({len(df)} secciones)\n")
            f.write(f"-- ------------------------------------------------------------------------\n")

            for _, r in df.iterrows():
                sec = int(r["SECCION_INT"])
                ln = int(r["LISTA_NOMINAL"])
                tv = int(r["TOTAL_VOTOS"])
                part = float(r["PARTICIPACION_PCT"])
                g_partido = str(r["GANADOR_PARTIDO"])
                g_votos = int(r["GANADOR_VOTOS"])
                g_pct = float(r["GANADOR_PCT"])
                s_partido = str(r["SEGUNDO_PARTIDO"])
                s_votos = int(r["SEGUNDO_VOTOS"])
                s_pct = float(r["SEGUNDO_PCT"])
                margen = float(r["MARGEN_VICTORIA_PCT"])

                v_pan_ali = int(r["VOTOS_PAN_ALIANZA"])
                v_pan_puro = int(r["VOTOS_PAN_PURO"])
                v_opp_ali = int(r["VOTOS_OPP_ALIANZA"])
                v_mc = int(r["VOTOS_MC"])

                partidos_json = json.dumps({
                    "PAN_ALIANZA": v_pan_ali,
                    "PAN_PURO": v_pan_puro,
                    "OPOSICION_ALIANZA": v_opp_ali,
                    "MC": v_mc
                })

                sql = f"""INSERT INTO electoral_results (
    state_id, election_year, election_type, clave_seccion, clave_municipio,
    lista_nominal, total_votos, participacion_pct,
    ganador_partido, ganador_votos, ganador_pct,
    segundo_partido, segundo_votos, segundo_pct, margen_victoria_pct,
    votos_partidos
) VALUES (
    '{STATE_ID_GTO}', {year}, '{etype}', {sec}, 1,
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
                total_records += 1

        print(f"✅ Archivo SQL generado con {total_records:,} registros de secciones electorales.")
        print(f"📁 Ruta: {output_sql}")

if __name__ == "__main__":
    main()
