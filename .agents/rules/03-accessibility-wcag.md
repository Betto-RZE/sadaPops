# Regla 03: Accesibilidad UI/UX (WCAG 2.1 AA) e Inclusión

## 1. Alternativa para Lector de Pantalla en Mapa Interactivo
Los mapas SVG interactivos con zoom son inaccesibles por defecto para usuarios de lectores de pantalla.
- **Regla:** Cada componente de mapa (`features/mapa-dalias`) DEBE incluir un botón visible: **"Ver en formato de tabla accesible"**.
- **Requisito:** La ruta tabular DEBE presentar todos los datos estatales/municipales en una tabla semántica estándar `<table>` con `<caption>`, alcance `<th>`, etiquetas ARIA y navegación completa por teclado.

```tsx
// Ejemplo de Componente con Alternativa Accesible
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

## 2. Contraste de Color y Paletas Apta para Daltonismo
- **Ratio de Contraste:** El texto y los elementos de UI interactivos deben alcanzar un ratio de contraste de al menos 4.5:1 respecto al fondo (WCAG AA).
- **Indicadores Multicriterio:** NUNCA depender únicamente del tono de color para transmitir significado (ej. en mapas de calor de participación o tamaño de dalias). Usar formas, patrones, insignias numéricas o descripciones en texto ARIA junto con los colores.

---

## 3. Arquitectura i18n (Español y Náhuatl)
- Todo el texto de interfaz visible para el usuario en `apps/web` DEBE estar externalizado en diccionarios de traducción (`src/i18n/es.json` y `src/i18n/nah.json`).
- El piloto de traducción en Náhuatl cubre los títulos principales de la narrativa, botones, encabezados de preguntas del dashboard e interfaz del asistente de IA.
- La selección de idioma debe persistir en la sesión y actualizar dinámicamente el atributo `lang` del HTML (`lang="es"` vs `lang="nah"`).
