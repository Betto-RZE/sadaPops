# Rule 03: UI/UX Accessibility (WCAG 2.1 AA) & Inclusion

## 1. Screen Reader Alternative for Interactive Map
Interactive SVG zoom maps are inaccessible to screen reader users by default.
- **Rule:** Every map component (`features/mapa-dalias`) MUST render a visible toggle button: **"Ver en formato de tabla accesible"**.
- **Requirement:** The tabular route MUST present all state/municipal data in a standard semantic `<table>` with `<caption>`, `<th>` scope, ARIA labels, and full keyboard navigation.

```tsx
// Example Accessible Toggle Component
export function MapaContainer({ mapData }: { mapData: StateData[] }) {
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');

  return (
    <div>
      <div role="region" aria-label="Controles de visualización">
        <button 
          onClick={() => setViewMode(viewMode === 'map' ? 'table' : 'map')}
          className="px-4 py-2 bg-purple-900 text-white rounded-md focus:ring-2 focus:ring-purple-400"
        >
          {viewMode === 'map' ? 'Ver como tabla para lector de pantalla' : 'Ver mapa gráfico'}
        </button>
      </div>

      {viewMode === 'map' ? (
        <MapaSvgGraphic data={mapData} />
      ) : (
        <TablaAccesibleDalias data={mapData} />
      )}
    </div>
  );
}
```

---

## 2. Color Contrast & Colorblind Friendly Palettes
- **Contrast Ratio:** Text and interactive UI elements must achieve at least 4.5:1 contrast ratio against background (WCAG AA).
- **Multi-cue Indicator:** NEVER rely solely on color hue to convey meaning (e.g., in participation heatmaps or dalia sizes). Use shapes, patterns, numerical badges, or ARIA text descriptions alongside colors.

---

## 3. i18n Architecture (Spanish & Náhuatl)
- All user-facing UI text in `apps/web` MUST be externalized into translation dictionaries (`src/i18n/es.json` and `src/i18n/nah.json`).
- Náhuatl translation pilot covers core narrative titles, button labels, dashboard question headers, and AI assistant interface.
- Language selection must persist in session state and update HTML `lang` attribute dynamically (`lang="es"` vs `lang="nah"`).
