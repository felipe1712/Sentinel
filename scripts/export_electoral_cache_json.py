"""
Generador de Cache JSON WebGIS Electoral de Guanajuato
-------------------------------------------------------
Lee 'data/electoral/Guanajuato 2018 - 2024.xlsx', cruza con 'gto_secciones.geojson',
calcula los totales por sección, distrito local, distrito federal y municipio,
y genera 'nextjs-app/public/data/electoral_results_cache.json'
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

EXCEL_PATH = "data/electoral/Guanajuato 2018 - 2024.xlsx"
GEOJSON_PATH = "nextjs-app/public/data/gto_secciones.geojson"
OUTPUT_JSON_PATH = "nextjs-app/public/data/electoral_results_cache.json"

MUNICIPIOS_GTO = {
    1: "Abasolo", 2: "Acámbaro", 3: "San Miguel de Allende", 4: "Apaseo el Alto",
    5: "Apaseo el Grande", 6: "Atarjea", 7: "Celaya", 8: "Manuel Doblado",
    9: "Comonfort", 10: "Coroneo", 11: "Cortazar", 12: "Cuerámaro",
    13: "Doctor Mora", 14: "Dolores Hidalgo C.I.N.", 15: "Guanajuato",
    16: "Huanímaro", 17: "Irapuato", 18: "Jaral del Progreso", 19: "Jerécuaro",
    20: "León", 21: "Moroleón", 22: "Ocampo", 23: "Pénjamo", 24: "Pueblo Nuevo",
    25: "Purísima del Rincón", 26: "Romita", 27: "Salamanca", 28: "Salvatierra",
    29: "San Diego de la Unión", 30: "San Felipe", 31: "San Francisco del Rincón",
    32: "San José Iturbide", 33: "San Luis de la Paz", 34: "Santa Catarina",
    35: "Santa Cruz de Juventino Rosas", 36: "Santiago Maravatío",
    37: "Silao de la Victoria", 38: "Tarandacuao", 39: "Tarimoro", 40: "Tierra Blanca",
    41: "Uriangato", 42: "Valle de Santiago", 43: "Victoria", 44: "Villagrán",
    45: "Xichú", 46: "Yuriria"
}

CONFIGS = [
    {
        "sheet_name": "Guanajuato 2018 - 2024",
        "header_row": 6,
        "election_year": "2024",
        "election_type": "gubernatura",
        "seccion_col": "SECCION",
        "ln_col": "LISTA_NOMINAL",
        "tv_col": "TOTAL_VOTOS",
        "pan_label": "PAN-PRI-PRD",
        "opp_label": "MORENA-PT-PVEM",
        "pan_cols": ["PAN", "PRI", "PRD", "PAN_PRI_PRD", "PAN_PRI", "PAN_PRD", "PRI_PRD"],
        "opp_cols": ["MORENA", "PT", "PVEM", "PVEM_PT_MORENA", "PVEM_PT", "PVEM_MORENA", "PT_MORENA"],
        "mc_col": "MC",
    },
    {
        "sheet_name": "Gubernatura 2018",
        "header_row": 6,
        "election_year": "2018",
        "election_type": "gubernatura",
        "seccion_col": "SECCION",
        "ln_col": "LISTA_NOMINAL",
        "tv_col": "TOTAL_VOTOS_CALCULADO",
        "pan_label": "PAN-PRD-MC",
        "opp_label": "MORENA-PT-PES",
        "pan_cols": ["PAN", "PRD", "MC", "PAN-PRD-MC", "PAN-PRD", "PAN-MC", "PRD-MC"],
        "opp_cols": ["MORENA", "PT", "PES", "MORENA-PT-PES", "MORENA-PT", "MORENA-PES", "PT-PES"],
        "mc_col": "MC",
    },
    {
        "sheet_name": "Guanajuato Dip 2024",
        "header_row": 6,
        "election_year": "2024",
        "election_type": "diputaciones",
        "seccion_col": "SECCION",
        "ln_col": "LISTA_NOMINAL",
        "tv_col": "TOTAL_VOTOS_CALCULADO",
        "pan_label": "PAN-PRI-PRD",
        "opp_label": "MORENA-PT-PVEM",
        "pan_cols": ["PAN", "PRI", "PRD", "PAN-PRI-PRD", "PAN-PRI", "PAN-PRD", "PRI-PRD"],
        "opp_cols": ["MORENA", "PT", "PVEM", "PVEM_PT_MORENA", "PVEM_PT", "PVEM_MORENA", "PT_MORENA"],
        "mc_col": "MC",
    },
    {
        "sheet_name": "Guanajuato Dip 2018",
        "header_row": 5,
        "election_year": "2018",
        "election_type": "diputaciones",
        "seccion_col": "SECCION",
        "ln_col": "LISTA_NOMINAL_CASILLA",
        "tv_col": "TOTAL_VOTOS_CALCULADOS",
        "pan_label": "PAN-PRD-MC",
        "opp_label": "MORENA-PT-PES",
        "pan_cols": ["PAN", "PRD", "MC", "PAN_PRD_MC", "PAN_PRD", "PAN_MC", "PRD_MC"],
        "opp_cols": ["MORENA", "PT", "PES", "PT_MORENA_PES", "PT_MORENA", "PT_PES", "MORENA_PES"],
        "mc_col": "MC",
    },
]

def clean_numeric(s: pd.Series) -> pd.Series:
    return pd.to_numeric(
        s.astype(str).str.replace(",", "").str.replace("'", "").str.strip(),
        errors="coerce"
    ).fillna(0)

def main():
    print("==================================================================")
    print(" 🚀 Generando Cache JSON Completo para WebGIS (Secciones y Distritos)")
    print("==================================================================")

    # 1. Cargar mapeo de secciones desde GeoJSON
    with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
        geo = json.load(f)

    sec_territory = {}
    for feat in geo["features"]:
        p = feat["properties"]
        sec = int(p.get("seccion") or p.get("id") or 0)
        if sec > 0:
            sec_territory[sec] = {
                "municipio": int(p.get("municipio") or 0),
                "distrito_l": int(p.get("distrito_l") or 0),
                "distrito_f": int(p.get("distrito_f") or 0),
            }

    xl = pd.ExcelFile(EXCEL_PATH)
    master_cache = {
        "gubernatura": {"2024": {}, "2018": {}},
        "diputaciones": {"2024": {}, "2018": {}},
        # Nivel agregado por Distritos y Municipios
        "distritos_locales": {
            "gubernatura": {"2024": {}, "2018": {}},
            "diputaciones": {"2024": {}, "2018": {}},
        },
        "distritos_federales": {
            "gubernatura": {"2024": {}, "2018": {}},
            "diputaciones": {"2024": {}, "2018": {}},
        },
        "municipios": {
            "gubernatura": {"2024": {}, "2018": {}},
            "diputaciones": {"2024": {}, "2018": {}},
        }
    }

    for cfg in CONFIGS:
        sname = cfg["sheet_name"]
        hrow = cfg["header_row"]
        year = cfg["election_year"]
        etype = cfg["election_type"]
        pan_label = cfg["pan_label"]
        opp_label = cfg["opp_label"]

        print(f"\nProcesando {sname} ({etype} {year})...")
        df = pd.read_excel(xl, sheet_name=sname, header=hrow)

        sec_col = cfg["seccion_col"]
        df = df[df[sec_col].notna()].copy()
        df["SECCION_INT"] = clean_numeric(df[sec_col]).astype(int)
        df = df[df["SECCION_INT"] > 0]

        pan_cols = [c for c in cfg["pan_cols"] if c in df.columns]
        opp_cols = [c for c in cfg["opp_cols"] if c in df.columns]
        mc_col = cfg["mc_col"] if cfg["mc_col"] in df.columns else None
        ln_col = cfg["ln_col"] if cfg["ln_col"] in df.columns else None
        tv_col = cfg["tv_col"] if cfg["tv_col"] in df.columns else None

        num_cols = set(pan_cols + opp_cols)
        if mc_col: num_cols.add(mc_col)
        if ln_col: num_cols.add(ln_col)
        if tv_col: num_cols.add(tv_col)

        for c in num_cols:
            df[c] = clean_numeric(df[c])

        # Agregar por Sección
        agg_rules = {c: "sum" for c in num_cols}
        grouped = df.groupby("SECCION_INT").agg(agg_rules).reset_index()

        grouped["V_PAN"] = grouped[pan_cols].sum(axis=1)
        grouped["V_OPP"] = grouped[opp_cols].sum(axis=1)
        grouped["V_MC"] = grouped[mc_col] if mc_col and mc_col in grouped.columns else 0

        if tv_col and tv_col in grouped.columns:
            grouped["TV"] = grouped[tv_col]
        else:
            grouped["TV"] = grouped["V_PAN"] + grouped["V_OPP"] + grouped["V_MC"]

        if ln_col and ln_col in grouped.columns:
            grouped["LN"] = grouped[ln_col]
        else:
            grouped["LN"] = 0

        # Acumuladores de Distrito y Municipio
        dl_acc = {}
        df_acc = {}
        mpio_acc = {}

        for _, r in grouped.iterrows():
            sec = int(r["SECCION_INT"])
            v_pan = int(r["V_PAN"])
            v_opp = int(r["V_OPP"])
            v_mc = int(r["V_MC"])
            tv = int(r["TV"])
            ln = int(r["LN"])
            part_pct = round((tv / ln * 100), 2) if ln > 0 else 0.0

            ranking = [(pan_label, v_pan), (opp_label, v_opp), ("MC", v_mc)]
            ranking.sort(key=lambda x: x[1], reverse=True)
            w_p, w_v = ranking[0]
            s_p, s_v = ranking[1]

            tot = tv if tv > 0 else (w_v + s_v)
            w_pct = round((w_v / tot * 100), 2) if tot > 0 else 0.0
            s_pct = round((s_v / tot * 100), 2) if tot > 0 else 0.0
            margin = round(w_pct - s_pct, 2)

            terr = sec_territory.get(sec, {"municipio": 1, "distrito_l": 1, "distrito_f": 1})
            mpio_id = terr["municipio"]
            dl_id = terr["distrito_l"]
            df_id = terr["distrito_f"]
            mpio_nombre = MUNICIPIOS_GTO.get(mpio_id, f"Municipio {mpio_id}")

            sec_item = {
                "election_year": int(year),
                "election_type": etype,
                "clave_seccion": sec,
                "clave_municipio": mpio_id,
                "municipio_nombre": mpio_nombre,
                "distrito_local": dl_id,
                "distrito_federal": df_id,
                "lista_nominal": ln,
                "total_votos": tv,
                "participacion_pct": part_pct,
                "ganador_partido": w_p,
                "ganador_votos": w_v,
                "ganador_pct": w_pct,
                "segundo_partido": s_p,
                "segundo_votos": s_v,
                "segundo_pct": s_pct,
                "margen_victoria_pct": margin,
                "votos_partidos": {
                    pan_label: v_pan,
                    opp_label: v_opp,
                    "MC": v_mc
                }
            }

            master_cache[etype][year][str(sec)] = sec_item

            # Acumular en Distrito Local
            if dl_id > 0:
                if dl_id not in dl_acc: dl_acc[dl_id] = {"pan": 0, "opp": 0, "mc": 0, "tv": 0, "ln": 0, "sec_count": 0}
                dl_acc[dl_id]["pan"] += v_pan
                dl_acc[dl_id]["opp"] += v_opp
                dl_acc[dl_id]["mc"] += v_mc
                dl_acc[dl_id]["tv"] += tv
                dl_acc[dl_id]["ln"] += ln
                dl_acc[dl_id]["sec_count"] += 1

            # Acumular en Distrito Federal
            if df_id > 0:
                if df_id not in df_acc: df_acc[df_id] = {"pan": 0, "opp": 0, "mc": 0, "tv": 0, "ln": 0, "sec_count": 0}
                df_acc[df_id]["pan"] += v_pan
                df_acc[df_id]["opp"] += v_opp
                df_acc[df_id]["mc"] += v_mc
                df_acc[df_id]["tv"] += tv
                df_acc[df_id]["ln"] += ln
                df_acc[df_id]["sec_count"] += 1

            # Acumular en Municipio
            if mpio_id > 0:
                if mpio_id not in mpio_acc: mpio_acc[mpio_id] = {"pan": 0, "opp": 0, "mc": 0, "tv": 0, "ln": 0, "sec_count": 0}
                mpio_acc[mpio_id]["pan"] += v_pan
                mpio_acc[mpio_id]["opp"] += v_opp
                mpio_acc[mpio_id]["mc"] += v_mc
                mpio_acc[mpio_id]["tv"] += tv
                mpio_acc[mpio_id]["ln"] += ln
                mpio_acc[mpio_id]["sec_count"] += 1

        # Consolidar agregados de Distrito Local
        for d_id, acc in dl_acc.items():
            t_pan, t_opp, t_mc = acc["pan"], acc["opp"], acc["mc"]
            t_tv, t_ln = acc["tv"], acc["ln"]
            rk = [(pan_label, t_pan), (opp_label, t_opp), ("MC", t_mc)]
            rk.sort(key=lambda x: x[1], reverse=True)
            wp, wv = rk[0]
            sp, sv = rk[1]
            tot = t_tv if t_tv > 0 else (wv + sv)
            wpct = round((wv / tot * 100), 2) if tot > 0 else 0.0
            spct = round((sv / tot * 100), 2) if tot > 0 else 0.0
            mg = round(wpct - spct, 2)
            part = round((t_tv / t_ln * 100), 2) if t_ln > 0 else 0.0

            master_cache["distritos_locales"][etype][year][str(d_id)] = {
                "distrito_id": d_id,
                "tipo_distrito": "local",
                "secciones_count": acc["sec_count"],
                "ganador_partido": wp,
                "ganador_votos": wv,
                "ganador_pct": wpct,
                "segundo_partido": sp,
                "segundo_votos": sv,
                "segundo_pct": spct,
                "margen_victoria_pct": mg,
                "total_votos": t_tv,
                "lista_nominal": t_ln,
                "participacion_pct": part,
                "votos_partidos": {pan_label: t_pan, opp_label: t_opp, "MC": t_mc}
            }

        # Consolidar agregados de Distrito Federal
        for d_id, acc in df_acc.items():
            t_pan, t_opp, t_mc = acc["pan"], acc["opp"], acc["mc"]
            t_tv, t_ln = acc["tv"], acc["ln"]
            rk = [(pan_label, t_pan), (opp_label, t_opp), ("MC", t_mc)]
            rk.sort(key=lambda x: x[1], reverse=True)
            wp, wv = rk[0]
            sp, sv = rk[1]
            tot = t_tv if t_tv > 0 else (wv + sv)
            wpct = round((wv / tot * 100), 2) if tot > 0 else 0.0
            spct = round((sv / tot * 100), 2) if tot > 0 else 0.0
            mg = round(wpct - spct, 2)
            part = round((t_tv / t_ln * 100), 2) if t_ln > 0 else 0.0

            master_cache["distritos_federales"][etype][year][str(d_id)] = {
                "distrito_id": d_id,
                "tipo_distrito": "federal",
                "secciones_count": acc["sec_count"],
                "ganador_partido": wp,
                "ganador_votos": wv,
                "ganador_pct": wpct,
                "segundo_partido": sp,
                "segundo_votos": sv,
                "segundo_pct": spct,
                "margen_victoria_pct": mg,
                "total_votos": t_tv,
                "lista_nominal": t_ln,
                "participacion_pct": part,
                "votos_partidos": {pan_label: t_pan, opp_label: t_opp, "MC": t_mc}
            }

        # Consolidar agregados de Municipios
        for m_id, acc in mpio_acc.items():
            t_pan, t_opp, t_mc = acc["pan"], acc["opp"], acc["mc"]
            t_tv, t_ln = acc["tv"], acc["ln"]
            rk = [(pan_label, t_pan), (opp_label, t_opp), ("MC", t_mc)]
            rk.sort(key=lambda x: x[1], reverse=True)
            wp, wv = rk[0]
            sp, sv = rk[1]
            tot = t_tv if t_tv > 0 else (wv + sv)
            wpct = round((wv / tot * 100), 2) if tot > 0 else 0.0
            spct = round((sv / tot * 100), 2) if tot > 0 else 0.0
            mg = round(wpct - spct, 2)
            part = round((t_tv / t_ln * 100), 2) if t_ln > 0 else 0.0

            master_cache["municipios"][etype][year][str(m_id)] = {
                "clave_municipio": m_id,
                "nombre": MUNICIPIOS_GTO.get(m_id, f"Municipio {m_id}"),
                "secciones_count": acc["sec_count"],
                "ganador_partido": wp,
                "ganador_votos": wv,
                "ganador_pct": wpct,
                "segundo_partido": sp,
                "segundo_votos": sv,
                "segundo_pct": spct,
                "margen_victoria_pct": mg,
                "total_votos": t_tv,
                "lista_nominal": t_ln,
                "participacion_pct": part,
                "votos_partidos": {pan_label: t_pan, opp_label: t_opp, "MC": t_mc}
            }

        print(f"  -> {len(master_cache[etype][year])} secciones indexadas")
        print(f"  -> {len(dl_acc)} distritos locales y {len(df_acc)} distritos federales agregados")
        print(f"  -> {len(mpio_acc)} municipios agregados")

    # Compatibilidad hacia atrás: poblar master_cache["2024"] y master_cache["2018"] con gubernatura por defecto
    master_cache["2024"] = master_cache["gubernatura"]["2024"]
    master_cache["2018"] = master_cache["gubernatura"]["2018"]

    # Guardar en JSON
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(master_cache, f, ensure_ascii=False)

    fsize_mb = os.path.getsize(OUTPUT_JSON_PATH) / (1024 * 1024)
    print(f"\n✅ Cache generado exitosamente en: {OUTPUT_JSON_PATH} ({fsize_mb:.2f} MB)")

if __name__ == "__main__":
    main()
