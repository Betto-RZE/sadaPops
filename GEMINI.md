# GEMINI.md — Instructions for AI Agents

Welcome to **Mapa de Dalias y Participación Ciudadana**, a digital civic engagement platform built for **Reto 3: Comunicación y visualización con impacto público** (Hackathon INE).

This document serves as the master entry point and governance model for all AI Agents (Gemini, Antigravity, Claude, Cursor, Copilot) working in this codebase.

---

## 1. Project Overview & Core Mission

- **Objective:** Transform complex civic data from INE's CCPC (Cultura Cívica y Participación Ciudadana) into an engaging, accessible, and social-proof-driven interactive experience.
- **Visual Hook:** Interactive map of Mexico rendered with **dalias** (Mexico's national flower) as visual units of informed civic participation.
- **Core Navigation Flow:** Open/free navigation from landing across 3 content modules (**Narrativa**, **Dashboard CCPC**, **Modo Juego Pixel Art**). The action of "Agrega tu dalia" (registration) unlocks only after completing at least one module.
- **Monorepo Architecture:** Next.js 14+ (App Router) + TypeScript + Tailwind CSS for web, PixiJS/Kaplay for pixel art game, FastAPI + PostgreSQL for backend & persistence, Docker Compose for orchestration.

---

## 2. Directory & Monorepo Structure

Strict feature-first monorepo layout:

```
sadaPops/
├── apps/
│   └── web/                                # Next.js App Router (TypeScript, Tailwind, shadcn/ui)
│       ├── app/                            # Route handlers ONLY (imports from src/features)
│       │   ├── (narrativa)/page.tsx
│       │   ├── dashboard/page.tsx
│       │   ├── juego/page.tsx
│       │   ├── layout.tsx
│       │   └── api/                        # Route proxies if needed
│       ├── src/
│       │   ├── features/
│       │   │   ├── mapa-dalias/            # Zoom 1-3, interactive dalias, GeoJSON maps
│       │   │   ├── narrativa/              # Storytelling: problems -> mechanics -> reflection
│       │   │   ├── dashboard-ccpc/         # Question-oriented CCPC data visualizations
│       │   │   ├── juego/                  # Wrapper component for @mapa-dalias/game (ssr: false)
│       │   │   ├── registro/               # "Agrega tu dalia" & unlock condition logic
│       │   │   ├── asistente-ia/           # Floating persistent chatbot component
│       │   │   └── herramientas-oficiales/ # Official INE links (casillas, observadores, foráneos)
│       │   ├── shared/                     # Design tokens, base UI components, API client, hooks
│       │   └── i18n/                       # Spanish & Náhuatl localization files
│       └── package.json
│
├── packages/
│   ├── game/                               # TypeScript PixiJS/Kaplay game engine package
│   │   └── src/
│   │       ├── features/
│   │       │   ├── mitos/                  # Myth buster scene with CCPC data
│   │       │   └── simulador-voto/         # Interactive voting process emulator
│   │       └── shared/                     # Sprites, core engine canvas
│   └── types/                              # Shared TS Interfaces/Contracts (Web <-> Game <-> API)
│
├── backend/                                # FastAPI Python Backend
│   ├── app/
│   │   ├── features/
│   │   │   ├── dalias/                     # Registration, aggregate counts, Zoom thresholds
│   │   │   ├── dashboard/                  # CCPC questions & dynamic chart payload generators
│   │   │   ├── progreso/                   # Completion tracking per anonymous session
│   │   │   ├── asistente/                  # Acotado LLM endpoint (CCPC + editorial context)
│   │   │   └── ccpc/                       # Domain repository for processed CCPC tables
│   │   ├── core/                           # Config, DB session, CORS, security, deps
│   │   └── main.py
│   ├── etl/
│   │   └── ccpc_ingest.py                  # Offline ETL script parsing INE CCPC .zip -> Postgres
│   ├── migrations/                         # Alembic database migrations
│   ├── tests/                              # Pytest test suite mirroring features
│   ├── Dockerfile
│   └── pyproject.toml
│
├── infra/
│   └── docker-compose.yml                  # Local development environment setup
│
├── .agents/                                # Agent custom rules & skills
│   ├── rules/                              # Architectural, privacy & accessibility constraints
│   └── skills/                             # Workflow instructions for agent tasks
│
├── GEMINI.md                               # Root agent instructions (this file)
├── PROJECT_CONTEXT.md                      # Complete domain context & hackathon guidelines
├── WORKFLOW.md                             # 3-week MVP execution roadmap
└── propuesta-mapa-dalias.md                # Original hackathon proposal document
```

---

## 3. Strict Rules for AI Agents

1. **Monorepo Modularity:** Keep components inside their respective `features/` folders. Do NOT create global dump folders (`components/`, `utils/`) with mixed feature logic.
2. **Game Integration:** `packages/game` MUST be loaded client-side only in Next.js via dynamic imports with `ssr: false` (`features/juego/GameLoader.tsx`). Never attempt to render canvas or PixiJS on the server.
3. **Anonymity & Zero PII:** Never add free-text fields or nicknames for dalia registration. Use anonymous local session tokens (`useSesionAnonima`).
4. **Zoom 3 Anti-Reidentification Threshold:** On municipal/zonal map views, if a region has fewer than $N$ (default: 5) registered dalias, aggregate the count to the parent state level to protect user privacy in small communities.
5. **Accessibility First (WCAG 2.1 AA):** All maps MUST provide an equivalent narrated tabular/text route for screen readers. Contrast ratios must be AA compliant. Include i18n support for Náhuatl.
6. **No Fake Infrastructure:** Do NOT build custom casilla locators or observer registration forms. Always link directly to official INE portals.
7. **Scoped AI Assistant:** The backend chatbot endpoint MUST restrict prompts exclusively to CCPC dataset facts and editorial platform content. Refuse open political debate.

---

## 4. Key References & Documentation

- **Full Domain Context:** Read [`PROJECT_CONTEXT.md`](file:///c:/Users/betto/Documents/Hacks/INE/sadaPops/PROJECT_CONTEXT.md)
- **Sprint Roadmap & Tasks:** Read [`WORKFLOW.md`](file:///c:/Users/betto/Documents/Hacks/INE/sadaPops/WORKFLOW.md)
- **Specific Rules:** See files in [`.agents/rules/`](file:///c:/Users/betto/Documents/Hacks/INE/sadaPops/.agents/rules/)
- **Specialized Skills:** See skill guides in [`.agents/skills/`](file:///c:/Users/betto/Documents/Hacks/INE/sadaPops/.agents/skills/)
