import os
import jinja2
from weasyprint import HTML

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte Ejecutivo SentinelIQ</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #1b365d; }
        .header { text-align: center; border-bottom: 2px solid #1b365d; padding-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; color: #1b365d; }
        .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
        .section { margin-top: 30px; }
        .section-title { font-size: 18px; font-weight: bold; background: #f0f4f8; padding: 8px; border-left: 4px solid #1b365d; }
        .content { margin-top: 10px; line-height: 1.6; }
        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">SENTINEL IQ — INTELIGENCIA EJECUTIVA</div>
        <div class="subtitle">Despacho del Gobernador · Estado de Jalisco</div>
    </div>
    
    <div class="section">
        <div class="section-title">RESUMEN EJECUTIVO</div>
        <div class="content">
            <p>{{ summary }}</p>
        </div>
    </div>

    <div class="footer">
        Documento Confidencial de Uso Exclusivo Gubernamental · Generado por SentinelIQ
    </div>
</body>
</html>
"""

def generate_pdf_report(output_path: str, summary: str):
    template = jinja2.Template(HTML_TEMPLATE)
    rendered_html = template.render(summary=summary)
    HTML(string=rendered_html).write_pdf(output_path)
    print(f"Reporte PDF generado exitosamente en: {output_path}")

if __name__ == "__main__":
    generate_pdf_report("sample_report.pdf", "Resumen ejecutivo de prueba para el Gobernador del Estado.")
