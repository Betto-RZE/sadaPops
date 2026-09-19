---
name: dalias-map-engine
description: Technical instructions for implementing, rendering, and testing the SVG Dalias map using react-simple-maps, d3-geo, and INEGI GeoJSON.
---

# Skill: Dalias Map Engine Implementation

## 1. Overview
This skill guides the AI agent through building the interactive map component (`apps/web/src/features/mapa-dalias/`). The map visualizes civic participation across Mexico using scalable dalia icons, supporting 3 levels of zoom (National $\to$ State $\to$ Municipal).

---

## 2. Dependencies & Setup
In `apps/web/package.json`:
- `react-simple-maps`: Vector map rendering
- `d3-geo`: Projection matrix & centroid calculations
- `d3-scale`: Scaling dalia size proportionally to aggregate counts
- `framer-motion`: Smooth SVG transitions on zoom & hover

---

## 3. Zoom Hierarchy Implementation

### Zoom Level 1: National (México Completo)
- **GeoJSON Source:** `public/geojson/mexico_estados.json`
- **Logic:** Render 1 main SVG dalia flower per state. Dalia radius `r` calculated via square root scaling:
  $$\text{radius} = \text{scaleSqrt}(count, [12, 48])$$
- **Hover/Click:** Displays tooltip with total registered dalias in state + "Haz clic para explorar municipios".

### Zoom Level 2: State Breakdown
- On state selection, update projection scale & center on state centroid:
  ```tsx
  <ComposableMap projection="geoMercator" projectionConfig={{ scale: 2400, center: stateCentroid }}>
    <ZoomableGroup zoom={zoomLevel} center={centerCoordinates}>
      <Geographies geography={selectedStateGeoJson}>
        {({ geographies }) => geographies.map((geo) => <Geography key={geo.rsmKey} geography={geo} />)}
      </Geographies>
    </ZoomableGroup>
  </ComposableMap>
  ```

### Zoom Level 3: Municipal / Zonal View
- Check anti-reidentification threshold rule ($N=5$) from Rule 02 (`02-privacy-anonymity.md`).
- If municipality count $< 5$, do not render discrete municipal dalia marker. Show aggregate toast message: *"Datos consolidados a nivel estatal para garantizar el anonimato de la comunidad"*.

---

## 4. Visual Styling Rules
- **Color Palette:** Primary deep violet (`#4C1D95`), dalia active petal gradient (`#8B5CF6` to `#EC4899`), background neutral dark/light theme.
- **Accessibility:** Must include button toggling tabular view component (`<TablaAccesibleDalias />`).
