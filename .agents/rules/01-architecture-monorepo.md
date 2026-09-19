# Rule 01: Monorepo & Feature-First Architecture

## 1. Feature-First Folder Structure
All code in `apps/web` and `backend` MUST be grouped by feature module rather than technical layer.

### Web App (`apps/web/src/features/`):
- `mapa-dalias/`: Zoom levels 1-3, interactive SVG map, dalia card popups, GeoJSON handlers.
- `narrativa/`: Sequential storytelling components, copy, foreign voter narrative section.
- `dashboard-ccpc/`: Question selector, dynamic chart selector (bar, line, heatmap), context cards.
- `juego/`: Wrapper component `GameLoader.tsx` mounting `@mapa-dalias/game`.
- `registro/`: "Agrega tu dalia" CTA, unlock status tracker, session token registration API client.
- `asistente-ia/`: Persistent floating chat widget, markdown renderer, language switcher.
- `herramientas-oficiales/`: INE external link cards & contextual popups.

### Backend App (`backend/app/features/`):
- `dalias/`: Endpoints for dalia counts, state/municipal aggregates, registration handler.
- `dashboard/`: Endpoints returning structured data & recommended chart types for CCPC questions.
- `progreso/`: Anonymous session completion tracker for modules.
- `asistente/`: FastAPI route handling scoped LLM queries (CCPC + editorial context).
- `ccpc/`: Domain repository for querying ingested CCPC SQL tables.

---

## 2. Client-Side Only Game Loading Constraint
The pixel art game engine in `packages/game` relies on browser Canvas APIs (PixiJS/Kaplay).
- **Rule:** NEVER import `packages/game` directly in server components or at top level in client components.
- **Implementation:** Always use Next.js dynamic import with `ssr: false` inside `apps/web/src/features/juego/GameLoader.tsx`:

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

## 3. Shared Types Package (`packages/types/`)
- Web and Backend MUST conform to shared Pydantic/TypeScript contract interfaces.
- Define API request/response types in `packages/types/src/index.ts` and export for frontend consumption.
