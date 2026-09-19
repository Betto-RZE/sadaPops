---
name: dalias-map-engine
description: Instrucciones técnicas para implementar, renderizar y probar el mapa de Dalias SVG usando react-simple-maps, d3-geo y GeoJSON del INEGI.
---

# Skill: Implementación del Motor del Mapa de Dalias

## 1. Visión General
Este skill guía al agente de IA para construir el componente del mapa interactivo (`apps/web/src/features/mapa-dalias/`). El mapa visualiza la participación cívica en todo México utilizando íconos escalables de dalias, soportando 3 niveles de zoom (Nacional $\to$ Estatal $\to$ Municipal).

---

## 2. Dependencias y Configuración
En `apps/web/package.json`:
- `react-simple-maps`: Renderizado de mapa vectorial
- `d3-geo`: Matriz de proyección y cálculo de centroides
- `d3-scale`: Escalamiento del tamaño de la dalia proporcional al conteo de registros
- `framer-motion`: Transiciones SVG suaves al hacer zoom y hover

---

## 3. Implementación de la Jerarquía de Zoom

### Nivel de Zoom 1: Nacional (México Completo)
- **Fuente GeoJSON:** `public/geojson/mexico_estados.json`
- **Lógica:** Renderizar 1 dalia SVG principal por estado. El radio `r` de la dalia se calcula mediante escalamiento de raíz cuadrada:
  $$\text{radio} = \text{scaleSqrt}(count, [12, 48])$$
- **Hover/Clic:** Muestra tooltip con el total de dalias registradas en el estado + "Haz clic para explorar municipios".

### Nivel de Zoom 2: Desglose Estatal
- Al seleccionar un estado, actualizar la escala de proyección y centrar en el centroide estatal:
  ```tsx
  <ComposableMap projection="geoMercator" projectionConfig={{ scale: 2400, center: stateCentroid }}>
    <ZoomableGroup zoom={zoomLevel} center={centerCoordinates}>
      <Geographies geography={selectedStateGeoJson}>
        {({ geographies }) => geographies.map((geo) => <Geography key={geo.rsmKey} geography={geo} />)}
      </Geographies>
    </ZoomableGroup>
  </ComposableMap>
  ```

### Nivel de Zoom 3: Vista Municipal / Zonal
- Verificar la regla del umbral anti-reidentificación ($N=5$) descrita en la Regla 02 (`02-privacy-anonymity.md`).
- Si el conteo del municipio es $< 5$, no renderizar marcador de dalia municipal discreto. Mostrar mensaje toast agregado: *"Datos consolidados a nivel estatal para garantizar el anonimato de la comunidad"*.

---

## 4. Reglas de Estilo Visual
- **Paleta de Colores:** Violeta profundo principal (`#4C1D95`), gradiente de pétalos activos de dalia (`#8B5CF6` a `#EC4899`), fondo neutral para tema oscuro/claro.
- **Accesibilidad:** Debe incluir botón para alternar al componente de vista tabular accesibles (`<TablaAccesibleDalias />`).
