# Regla 01: Arquitectura Monorepo y Basada en Features

## 1. Estructura de Carpetas Basada en Features
Todo el código en `apps/web` y `backend` DEBE agruparse por módulo funcional (*feature*) en lugar de por capa técnica.

### Aplicación Web (`apps/web/src/features/`):
- `mapa-dalias/`: Niveles de zoom 1-3, mapa SVG interactivo, tarjetas emergentes de dalias, manejadores de GeoJSON.
- `narrativa/`: Componentes de narrativa secuencial, copys, sección narrativa de electores foráneos.
- `dashboard-ccpc/`: Selector de preguntas, selector dinámico de gráficas (barras, líneas, mapa de calor), tarjetas de contexto.
- `juego/`: Componente wrapper `GameLoader.tsx` que monta `@mapa-dalias/game`.
- `registro/`: CTA "Agrega tu dalia", rastreador del estado de desbloqueo, cliente API de registro con token de sesión.
- `asistente-ia/`: Widget de chat flotante persistente, renderizador de markdown, selector de idioma.
- `herramientas-oficiales/`: Tarjetas de enlaces externos del INE y popups contextuales.

### Aplicación Backend (`backend/app/features/`):
- `dalias/`: Endpoints para conteos de dalias, agregados estatales/municipales, manejador de registro.
- `dashboard/`: Endpoints que retornan datos estructurados y tipos de gráficas recomendadas para preguntas CCPC.
- `progreso/`: Rastreador de finalización de módulos por sesión anónima.
- `asistente/`: Ruta FastAPI que maneja consultas de LLM acotadas (CCPC + contexto editorial).
- `ccpc/`: Repositorio de dominio para consultar tablas SQL de la CCPC procesadas.

---

## 2. Restricción de Carga del Juego Exclusiva en el Cliente
El motor del juego en pixel art en `packages/game` depende de APIs de Canvas del navegador (PixiJS/Kaplay).
- **Regla:** NUNCA importar `packages/game` directamente en Server Components o en el nivel superior de Client Components.
- **Implementación:** Usar siempre importación dinámica de Next.js con `ssr: false` dentro de `apps/web/src/features/juego/GameLoader.tsx`:

```tsx
// apps/web/src/features/juego/GameLoader.tsx
'use client';
import dynamic from 'next/dynamic';

const CanvasGame = dynamic(
  () => import('@mapa-dalias/game').then((mod) => mod.PixiGameCanvas),
  { ssr: false, loading: () => <div className="game-skeleton">Cargando juego...</div> }
);

export function GameLoader() {
  return <CanvasGame />;
}
```

---

## 3. Paquete de Tipos Compartidos (`packages/types/`)
- Web y Backend DEBEN cumplir con los contratos e interfaces definidos en TypeScript / Pydantic.
- Definir los tipos de petición y respuesta de la API en `packages/types/src/index.ts` y exportarlos para el consumo del frontend.
