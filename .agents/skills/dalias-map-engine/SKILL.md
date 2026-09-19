---
name: dalias-map-engine
description: Instrucciones técnicas detalladas para implementar, renderizar y probar el mapa de Dalias SVG usando react-simple-maps, d3-geo y GeoJSON del INEGI.
---

# Skill: Implementación del Motor del Mapa de Dalias (Core Feature #1)

## 1. Visión General
El **Mapa de Dalias** es la pieza central y el gancho de prueba social de la plataforma. Visualiza la participación cívica en todo México utilizando íconos escalables de dalias (flor nacional), soportando 3 niveles de zoom (Nacional $\to$ Estatal $\to$ Municipal).

---

## 2. Dependencias y Configuración
En `apps/web/package.json`:
- `react-simple-maps`: Renderizado de mapa vectorial.
- `d3-geo`: Matriz de proyección `geoMercator` y centroides.
- `d3-scale`: Escalamiento de raíz cuadrada `scaleSqrt` para el tamaño de pétalos de dalia.
- `framer-motion`: Transiciones de zoom y cámara.

---

## 3. Especificación Técnica por Niveles de Zoom

### Nivel de Zoom 1: Nacional (México Completo)
- **Fuente GeoJSON:** `public/geojson/mexico_estados.json` (INEGI).
- **Proyección:** `geoMercator` con centroide en `[-102.5528, 23.6345]` y escala `1000`.
- **Cálculo del Radio SVG:**
  $$\text{radio} = \text{d3.scaleSqrt}(\text{registros\_estado}, [16, 52])$$
- **Hover/Clic:** Muestra tooltip con el total de dalias registradas en el estado. Al hacer clic, anima la cámara hacia el centroide del estado con escala `2400`.

### Nivel de Zoom 2: Desglose Estatal
- La dalia del estado se descompone en dalias regionales.
- GeoJSON: `public/geojson/mexico_municipios.json` filtrado por `cve_ent` del estado seleccionado.

### Nivel de Zoom 3: Vista Municipal / Zonal
- **Umbral Anti-Reidentificación ($N=5$):**
  - Si un municipio tiene $< 5$ dalias registradas, el backend envía `is_aggregated_to_state: true`.
  - El mapa **no renderiza pines individuales** en ese municipio y suma la cantidad al acumulado del Zoom 2.
- **Tarjeta emergente (`DaliaCard`):** Muestra el tema consultado y un timestamp relativo anónimo. Cero campos de texto libre o nicknames.

---

## 4. Accesibilidad WCAG 2.1 AA
- Botón fijado sobre el mapa: **"Ver en formato de tabla accesible"**.
- Renderiza el componente `<TablaAccesibleDalias />` con marcado semántico `<table>` y navegación 100% por teclado.
