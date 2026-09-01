# SentinelIQ — Módulo "Diario" (Prensa OCR + Resumen Ejecutivo vía Claude MCP)

El módulo **Diario** es el sistema soberano de procesamiento de prensa matutina de SentinelIQ. Procesa diariamente 4 documentos PDF de prensa cada mañana a las **07:00 AM (America/Mexico_City)** utilizando **Surya OCR v2**, aplica filtrado antifarándula y antigobierno irrelevante, genera resúmenes ejecutivos vía **Claude MCP** y distribuye el digest matutino por **Email HTML** y **Telegram Bot**.

---

## 📑 Los 4 Documentos Procesados

1. **`primeras_planas_nacional` (Primeras Planas Nacionales):**
   * *Medios:* Reforma, El Universal, Milenio, La Jornada, El Financiero, El Economista, Excélsior.
   * *Filtro:* Política nacional, economía, finanzas, seguridad nacional y estatal.
   * *Descarte:* Farándula, deportes, espectáculos, cultura y sociales.
2. **`primeras_planas_estatal` (Primeras Planas Estatales de Guanajuato):**
   * *Medios:* AM, Correo, El Sol del Bajío, Zona Franca, Periódico Correo.
   * *Filtro:* Seguridad estatal, política local, economía regional, obras públicas, declaraciones de funcionarios y movimientos sociales.
   * *Énfasis:* Despliegues de seguridad, SEMEFO, CJNG, CSRL y municipios específicos.
3. **`sintesis_estatal` (Síntesis Estatal Oficial de Guanajuato):**
   * Documento oficial pre-filtrado del estado.
   * *Enfoque:* Declaraciones del Gobernador, acuerdos de gobierno y agenda legislativa.
4. **`columnas_politicas` (Columnas Políticas de Guanajuato):**
   * *Enfoque:* Columnas de opinión, narrativa política, críticas al gobierno y prospectiva política.

---

## 🏗️ Arquitectura del Pipeline

```
07:00 AM Celery Beat
        ↓
[diario_pipeline.py] — Orquestador
        ↓
1. Detección de archivos en /data/diario/YYYY-MM-DD/
        ↓
[surya_processor.py] — Extracción OCR y Layout por bloques con Surya v2
        ↓
[content_filter.py] — Filtro de categorías con descarte de farándula y deportes
        ↓
[claude_summarizer.py] — Resumen Ejecutivo (Top 5 puntos, seguridad, política, economía)
        ↓
[notifier.py] — Distribución automática vía Email HTML y Bot de Telegram
```

---

## 🗄️ Tablas en PostgreSQL

* `diario_documents`: Registro de los 4 PDFs diarios y estado de procesamiento (`pendiente`, `procesando_ocr`, `ocr_completo`, `filtrando`, `listo`, `error`).
* `diario_ocr_results`: Texto crudo extraído página por página, datos de layout y promedio de confianza.
* `diario_items`: Notas y artículos clasificados con puntuación de relevancia (1-10) y marca `es_principal`.
* `diario_resumenes`: Resumen ejecutivo final con puntos clave, párrafos temáticos y mini-resumen de 3 líneas.
* `diario_envios`: Bitácora histórica de envíos por Email y Telegram.
* `diario_lista_distribucion`: Directorio de funcionarios y canales receptores del digest matutino.

---

## 🖥️ Acceso y Vistas

* **Visor Principal:** [**https://gto.sentineliq.com.mx/diario**](https://gto.sentineliq.com.mx/diario)
* **Mini-sección Situación Ejecutiva:** [**https://gto.sentineliq.com.mx/situacion**](https://gto.sentineliq.com.mx/situacion) (Cuadrante 1).
* **Mini-sección Sala de Gabinete:** [**https://gto.sentineliq.com.mx/gabinete**](https://gto.sentineliq.com.mx/gabinete) (Panel Derecho Proyector).
