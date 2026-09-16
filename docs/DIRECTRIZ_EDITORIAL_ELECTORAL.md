# Directriz Técnica y Editorial de Neutralidad Institucional para Datos Electorales en SentinelIQ

**Versión:** 1.0  
**Ámbito de Aplicación:** Módulo WebGIS Electoral (`/gis-electoral`), Fichas Territoriales, Analítica de Swing, Base de Datos y Scripts de Ingesta.  
**Entidades Cubiertas:** Guanajuato, Puebla, Querétaro y subsecuentes incorporaciones a la plataforma.

---

## 1. Principio Rector: Neutralidad Institucional y Rigor Factual

SentinelIQ es una plataforma de inteligencia territorial y analítica de datos de nivel de Estado. No opera como un instrumento de campaña ni adopta la perspectiva de ninguna fuerza política en particular.

### Reglas Semánticas Obligatorias
1. **Erradicación del Término «Oposición»:**  
   Queda estrictamente prohibido clasificar a cualquier fuerza o coalición política como "la oposición" o "fuerza opositora", dado que la composición partidista varía según la entidad, el municipio y el orden de gobierno (federal, estatal o municipal).
2. **Erradicación de Términos de Disputa Bélica o de Campaña:**  
   No emplear adjetivos como: *"Bastión"*, *"Territorio Opositor"*, *"Cedido"*, *"Arrebatado"*, *"Territorio Recuperado"*.
3. **Descripción Estrictamente Factual:**  
   Todo resultado debe ser descrito en función del hecho verificable:  
   *«Ganado por [Partido / Coalición] en [Año]»*.

---

## 2. Nomenclatura Estándar de Fuerzas Políticas y Bloques

Tanto en la base de datos como en los elementos visuales de la interfaz de usuario:

| Bloque / Fuerza Política | Denominación en UI | Clave Interna / Siglas | Color Hex |
| :--- | :--- | :--- | :--- |
| **Bloque PAN y Aliados** | `Coalición PAN (PAN + Aliados)` | `PAN-PRI-PRD` o `PAN_ALIANZA` | `#0055B8` |
| **Bloque MORENA y Aliados** | `Coalición MORENA (MORENA + Aliados)` | `MORENA-PT-PVEM` o `MORENA_ALIANZA` | `#8a1b32` / `#70112C` |
| **Movimiento Ciudadano** | `Movimiento Ciudadano (MC)` | `MC` | `#FF8200` |
| **PRI (Competencia Individual)** | `Partido Revolucionario Institucional` | `PRI` | `#D92128` |
| **PVEM (Competencia Individual)** | `Partido Verde Ecologista` | `PVEM` | `#50B848` |
| **Sin Información / Sin Votos** | `Sin votación registrada` | `SIN_DATOS` | `#64748b` (Gris neutro) |

> Nota: Si en bases de datos históricas legadas existen claves como `OPOSICION_ALIANZA`, los componentes de presentación (React/Next.js) deben deserializarlas y mapearlas de forma transparente a **`Coalición MORENA (MORENA + Aliados)`**, garantizando que el usuario final jamás observe terminología sesgada.

---

## 3. Diagnóstico de Estabilidad Territorial (Histórico)

El cálculo comparativo entre procesos electorales debe apegarse estrictamente a la siguiente lógica:

```typescript
const r1 = historicalResults[year1]?.ganador_partido;
const r2 = historicalResults[year2]?.ganador_partido;

if (!r1 || !r2 || r1.includes("Sin") || r2.includes("Sin")) {
  return "Datos insuficientes para determinar comparativa histórica.";
}

if (r1 === r2) {
  // Continuidad
  return `Continuidad Electoral: Ganado por ${r2} en ambos ciclos (${year1} y ${year2}).`;
} else {
  // Alternancia
  return `Alternancia Electoral: Ganado por ${r1} en ${year1} y ganado por ${r2} en ${year2}.`;
}
```

* **Estilo Visual:** Utilizar tarjetas de alerta neutrales (`alert-secondary` para continuidad, `alert-info` para alternancia) con borde sobrio, sin semáforos punitivos (evitar rojos de peligro o verdes celebratorios asociados a partidos).

---

## 4. Escala Estadística de Competitividad Seccional

En las tablas de secciones y matrices territoriales, el nivel de competitividad se calcula exclusivamente con base en el **Margen de Victoria** (M = % Ganador - % Segundo Lugar):

| Rango de Margen (M) | Clasificación Técnica | Badge en Interfaz |
| :--- | :--- | :--- |
| **M >= 15.0%** | Ventaja Amplia | `<span className="badge bg-success">Consolidada</span>` |
| **5.0% <= M < 15.0%** | Ventaja Media | `<span className="badge bg-info text-dark">Ventaja Moderada</span>` |
| **M < 5.0%** | Competencia Cerrada | `<span className="badge bg-warning text-dark">Disputada</span>` |

*(Sustituye formalmente el uso previo de "Bastión" y "Favorable").*

---

## 5. Protocolo de Calidad de Datos: Cómputos Distritales vs. PREP

1. **Riesgo Identificado (Casillas en Recuento Distrital):**  
   Los datos preliminares emitidos durante la noche de la jornada (PREP) registran en 0 las casillas canalizadas a sede distrital para recuento voto por voto (`Recuento (Para recuento-SRA)`).  
2. **Obligatoriedad de Cómputos Definitivos:**  
   Para la ingesta de cualquier estado (Guanajuato, Puebla, Querétaro, etc.), es requisito obligatorio procesar los **Cómputos Distritales Oficiales** del INE / OPLE (`DIP_FED_XXXX.csv` o equivalentes distritales consolidados).
3. **Manejo de Nulos / Casillas No Instaladas:**  
   Si una sección no cuenta con votos emitidos comprobables:
   - Total de votos: `0`.
   - Ganador: `"Sin votación registrada"`.
   - Color asignado: `#64748b` (gris pizarra).
   - Queda estrictamente prohibido aplicar fallbacks que adjudiquen la sección al partido gobernante o pinten el polígono de azul u otro color partidista.

---

## 6. Desacoplamiento Multiestatal y Configuración por Entidad

Ningún componente de la interfaz debe contener nombres de estado, número de secciones ni calendarios electorales fijos en su código fuente:

### A. Metadatos de la Entidad
Utilizar siempre la configuración inyectada por `getStateConfig()`:
* Nombre Completo: `{stateCfg.name}` (ej. *Estado de Querétaro*).
* Nombre Corto: `{stateCfg.shortName}` (ej. *Querétaro*).
* Total de Municipios: `{municipiosList.length || stateCfg.totalMunicipios}`.
* Pie de Página Modal: `Análisis electoral SentinelIQ · INE ${stateCfg.shortName}`.

### B. Matriz de Ciclos Electorales por Entidad

| Entidad | Clave | Total Secciones | Gubernatura | Diputaciones |
| :--- | :--- | :--- | :--- | :--- |
| **Guanajuato** | `gto` | 3,357 | 2018, 2024 | 2018, 2021, 2024 |
| **Puebla** | `pue` | 2,849 | 2018, 2021 (Ext.) | 2018, 2021, 2024 |
| **Querétaro** | `qro` | 922 | 2015, 2021 | 2018, 2021, 2024 |
| **Estados Futuros** | `*` | *Catálogo INE* | *Ciclo Local Constitucional* | 2018, 2021, 2024 |

---

## 7. Checklist para Incorporación de Nuevos Estados

Al agregar un nuevo estado (ej. Querétaro o futuros despliegues):

- [ ] **1. Shapefile / GeoJSON:** Cargar límites seccionales y municipales simplificados en `public/data/{key}_secciones.geojson` y `public/data/{key}_municipios.geojson`.
- [ ] **2. Cómputos Distritales:** Generar el archivo de caché `{key}_electoral_results_cache.json` utilizando cómputos distritales finales del INE (incluyendo casillas recountadas).
- [ ] **3. Registro en `stateConfig.ts`:** Añadir la entrada con centro geográfico, clave INEGI, regiones operativas y catálogo de municipios.
- [ ] **4. Auditoría Editorial:** Verificar que ningún rótulo, leyenda o tooltip incluya palabras como *"oposición"* o *"bastión"*.
- [ ] **5. Verificación de Votos Cero:** Comprobar que secciones sin casillas se muestren en gris `#64748b` con la leyenda *"Sin votación registrada"*.
