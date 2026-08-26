# Guía de Operación: Módulo WebGIS Político-Electoral (`gis-electoral`)

Este documento detalla la arquitectura, importación de polígonos, carga de resultados electorales y gestión de capas en tiempo real para el módulo **WebGIS Político-Electoral** de SentinelIQ Guanajuato (`gto.sentineliq.com.mx/gis-electoral`).

---

## 🗺️ 1. Capa Base Geográfica (Shapefiles del INE)

Los archivos originales se encuentran en el directorio [`Sf-gto/`](file:///c:/Users/DELL/Documents/SentinelIQ/Sf-gto).

### Polígonos Procesados:
* **Secciones Electorales:** `Sf-gto/SECCION.shp` (3,357 secciones de Guanajuato).
* **Municipios:** `Sf-gto/MUNICIPIO.shp` (46 municipios).
* **Distritos Locales:** `Sf-gto/DISTRITO_LOCAL.shp` (22 distritos locales).
* **Distritos Federales:** `Sf-gto/DISTRITO_FEDERAL.shp` (15 distritos federales).

### Script de Ingesta y Conversión:
```bash
python workers/gis_shapefile_importer.py
```
> Convierte automáticamente las coordenadas desde **UTM Zona 14N (EPSG:32614)** hacia **WGS 84 (EPSG:4326)** y genera los archivos GeoJSON optimizados en `nextjs-app/public/data/`.

---

## 📊 2. Carga de Resultados Electorales (CSV)

El sistema procesa cualquier proceso electoral (2018, 2021, 2024 o futuros) sin inventar ni simular datos.

### Estructura de Columnas Requerida:
```csv
año,tipo_eleccion,clave_seccion,clave_municipio,lista_nominal,total_votos,pan,morena,pri,mc,pvem,pt,prd,otros,nulos
2024,Gobernador,1,1,2150,1380,680,450,110,40,30,20,10,15,25
2024,Gobernador,2,1,1980,1210,590,410,95,35,25,18,8,12,17
```

### Formas de Cargar Resultados:
1. **Desde la Interfaz Web:**  
   Entra a [**https://gto.sentineliq.com.mx/gis-electoral**](https://gto.sentineliq.com.mx/gis-electoral), haz clic en **`Cargar Resultados CSV`**, arrastra tu archivo `.csv` y presiona **Aplicar al Mapa WebGIS**.
2. **Desde la Terminal con Python:**
   ```bash
   python workers/gis_electoral_importer.py
   ```

---

## 🚨 3. Capas de Eventos en Tiempo Real

Las capas dinámicas permiten correlacionar eventos sobre el mapa electoral:
* 🚨 **Incidentes de Seguridad** (`seguridad`): Operativos, bloqueos, alertas C4.
* 🌧️ **Protección Civil** (`proteccion_civil`): Lluvias, crecidas de ríos, contingencias.
* 🚗 **Tránsito & Vialidad** (`vialidad`): Afectaciones carreteras, obras.
* 🏛️ **Agenda Política** (`agenda_politica`): Giras, mítines, eventos de gobierno.

---

## 🛠️ 4. Visualizaciones Disponibles (Choropleth)

* **🏆 Partido / Coalición Ganador:** Colores oficiales (PAN Azul, MORENA Guinda, PRI Tricolor, MC Naranja, PVEM Verde).
* **📊 % de Votación del Ganador:** Intensidad del color según el porcentaje obtenido.
* **🗳️ % de Participación:** Semáforo de participación ciudadana (Lista nominal vs Votos emitidos).
* **⚔️ Margen de Victoria:** Competitividad electoral (Zonas bastión vs Zonas altamente disputadas).
* **🔄 Swing / Alternancia:** Comparativa entre dos procesos electorales (ej. 2021 vs 2024).
