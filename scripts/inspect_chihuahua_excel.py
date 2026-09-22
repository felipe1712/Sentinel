import openpyxl
from pathlib import Path
import json

xl_path = Path('data/Chihuahua/electoral/Elecciones Chihuahua 2018 - 2024.xlsx')
wb = openpyxl.load_workbook(xl_path, data_only=True)

print("=== SHEETS IN WORKBOOK ===")
print(wb.sheetnames)

for sheet in wb.sheetnames:
    ws = wb[sheet]
    print(f"\n========================================================")
    print(f"ANALYZING SHEET: {sheet} (max_row={ws.max_row}, max_col={ws.max_column})")
    print(f"========================================================")
    
    # Print first 10 rows
    for r_idx in range(1, min(12, ws.max_row + 1)):
        row_vals = [ws.cell(r_idx, c_idx).value for c_idx in range(1, min(45, ws.max_column + 1))]
        # filter trailing None
        while row_vals and row_vals[-1] is None:
            row_vals.pop()
        print(f"Row {r_idx:2d}: {row_vals[:12]}")
