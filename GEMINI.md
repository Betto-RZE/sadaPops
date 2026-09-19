# GEMINI.md — Instrucciones para Agentes de IA

Bienvenido a **Mapa de Dalias y Participación Ciudadana**, una plataforma digital de participación cívica construida para el **Reto 3: Comunicación y visualización con impacto público** (Hackathon INE).

Este documento sirve como el punto de entrada maestro y modelo de gobernanza para todos los Agentes de IA (Gemini, Antigravity, Claude, Cursor, Copilot) que trabajen en este código.

---

## 1. Visión General del Proyecto y Misión Central

- **Objetivo:** Transformar datos complejos de la CCPC (Cultura Cívica y Participación Ciudadana) del INE en una experiencia interactiva atractiva, accesible y guiada por prueba social.
- **Gancho Visual:** Mapa interactivo de México representado con **dalias** (flor nacional de México) como unidades visuales de participación cívica informada.
- **Flujo de Navegación Principal:** Navegación libre y abierta desde la landing a través de 3 módulos de contenido (**Narrativa**, **Dashboard CCPC**, **Modo Juego Pixel Art**). La acción de "Agrega tu dalia" (registro) se desbloquea únicamente al completar al menos un módulo.
- **Arquitectura Monorepo:** Next.js 14+ (App Router) + TypeScript + Tailwind CSS para web, PixiJS/Kaplay para el juego pixel art, FastAPI + PostgreSQL para backend y persistencia, Docker Compose para orquestación.

---

## 2. Estructura del Monorepo y Directorios

Organización estricta basada en *features*:

```
sadaPops/
├── apps/
│   └── web/                                # Next.js App Router (TypeScript, Tailwind, shadcn/ui)
│       ├── app/                            # Route handlers ÚNICAMENTE (importan desde src/features)
│       │   ├── (narrativa)/page.tsx
│       │   ├── dashboard/page.tsx
│       │   ├── juego/page.tsx
│       │   ├── layout.tsx
│       │   └── api/                        # Route proxies si aplica
│       ├── src/
│       │   ├── features/
│       │   │   ├── mapa-dalias/            # Zoom 1-3, dalias interactivas, mapas GeoJSON
│       │   │   ├── narrativa/              # Storytelling: problemas -> mecanismo -> reflexión
│       │   │   ├── dashboard-ccpc/         # Visualizaciones de datos CCPC orientadas a preguntas
│       │   │   ├── juego/                  # Componente wrapper para @mapa-dalias/game (ssr: false)
│       │   │   ├── registro/               # "Agrega tu dalia" y lógica de desbloqueo
│       │   │   ├── asistente-ia/           # Componente chatbot flotante y persistente
│       │   │   └── herramientas-oficiales/ # Enlaces oficiales INE (casillas, observadores, foráneos)
│       │   ├── shared/                     # Design tokens, componentes UI base, cliente API, hooks
│       │   └── i18n/                       # Archivos de localización en Español y Náhuatl
│       └── package.json
│
├── packages/
│   ├── game/                               # Paquete motor de juego TypeScript PixiJS/Kaplay
│   │   └── src/
│   │       ├── features/
│   │       │   ├── mitos/                  # Escena desmentir mitos con datos CCPC
│   │       │   └── simulador-voto/         # Emulador interactivo del proceso de votación
│   │       └── shared/                     # Sprites, canvas base del motor
│   └── types/                              # Interfaces/Contratos TS compartidos (Web <-> Juego <-> API)
│
├── backend/                                # Backend en Python FastAPI
│   ├── app/
│   │   ├── features/
│   │   │   ├── dalias/                     # Registro, conteos agregados, umbrales de Zoom
│   │   │   ├── dashboard/                  # Preguntas CCPC y generadores de payload de gráficas dinámicas
│   │   │   ├── progreso/                   # Tracking de progreso por sesión anónima
│   │   │   ├── asistente/                  # Endpoint acotado de LLM (CCPC + contexto editorial)
│   │   │   └── ccpc/                       # Repositorio de dominio para tablas procesadas CCPC
│   │   ├── core/                           # Config, sesión DB, CORS, seguridad, dependencias
│   │   └── main.py
│   ├── etl/
│   │   └── ccpc_ingest.py                  # Script ETL offline para parsear .zip CCPC INE -> Postgres
│   ├── migrations/                         # Migraciones de base de datos Alembic
│   ├── tests/                              # Suite de pruebas Pytest espejo de features
│   ├── Dockerfile
│   └── pyproject.toml
│
├── infra/
│   └── docker-compose.yml                  # Configuración de entorno de desarrollo local
│
├── docs/                                   # Documentación organizada del proyecto
│   ├── PROJECT_CONTEXT.md
│   ├── SETUP.md
│   ├── WORKFLOW.md
│   ├── PLAN_DE_DESARROLLO.md
│   ├── DEPLOY.md
│   └── propuesta-mapa-dalias.md
│
├── .agents/                                # Reglas y skills personalizadas para el agente
│   ├── rules/                              # Restricciones arquitectónicas, privacidad y accesibilidad
│   └── skills/                             # Instrucciones de flujo para tareas del agente
│
├── GEMINI.md                               # Instrucciones raíz para el agente (este archivo)
└── README.md                               # Documentación principal para el repositorio
```

---

## 3. Reglas Estrictas para Agentes de IA

1. **Modularidad Monorepo:** Mantener componentes dentro de sus respectivas carpetas `features/`. NO crear carpetas globales mixtas (`components/`, `utils/`) con lógica de distintas características.
2. **Integración del Juego:** `packages/game` DEBE cargarse del lado del cliente en Next.js mediante importaciones dinámicas con `ssr: false` (`features/juego/GameLoader.tsx`). Nunca intentar renderizar PixiJS o canvas en el servidor.
3. **Anonimato y Cero PII:** Nunca agregar campos de texto libre o nicknames para el registro de dalia. Usar tokens de sesión anónima local (`useSesionAnonima`).
4. **Umbral Anti-Reidentificación en Zoom 3:** En vistas municipales/zonales del mapa, si una región tiene menos de $N$ (por defecto: 5) dalias registradas, agregar el conteo al nivel estatal superior para proteger la privacidad del usuario en comunidades pequeñas.
5. **Accesibilidad Primero (WCAG 2.1 AA):** Todos los mapas DEBEN ofrecer una ruta narrativa/tabular equivalente para lectores de pantalla. Los ratios de contraste deben cumplir WCAG AA. Incluir soporte i18n para Náhuatl.
6. **Sin Infraestructura Ficticia:** NO construir ubicadores de casillas ni formularios de registro de observadores propios. Enlazar siempre directamente a portales oficiales del INE.
7. **Asistente de IA Acotado:** El endpoint del chatbot en el backend DEBE restringir los prompts exclusivamente a datos objetivos del dataset CCPC y contenido editorial de la plataforma. Rechazar debate político abierto.

---

## 4. Referencias Clave y Documentación

- **Documentación Principal (README):** Leer [`README.md`](file:///c:/Users/betto/Documents/Hacks/INE/sadaPops/README.md)
- **Guía de Configuración Inicial (Setup):** Leer [`docs/SETUP.md`](file:///c:/Users/betto/Documents/Hacks/INE/sadaPops/docs/SETUP.md)
- **Contexto Completo de Dominio:** Leer [`docs/PROJECT_CONTEXT.md`](file:///c:/Users/betto/Documents/Hacks/INE/sadaPops/docs/PROJECT_CONTEXT.md)
- **Hoja de Ruta y Tareas:** Leer [`docs/WORKFLOW.md`](file:///c:/Users/betto/Documents/Hacks/INE/sadaPops/docs/WORKFLOW.md)
- **Plan de Desarrollo Detallado por Equipo:** Leer [`docs/PLAN_DE_DESARROLLO.md`](file:///c:/Users/betto/Documents/Hacks/INE/sadaPops/docs/PLAN_DE_DESARROLLO.md)
- **Guía de Despliegue en Producción:** Leer [`docs/DEPLOY.md`](file:///c:/Users/betto/Documents/Hacks/INE/sadaPops/docs/DEPLOY.md)
- **Reglas Específicas:** Ver archivos en [`.agents/rules/`](file:///c:/Users/betto/Documents/Hacks/INE/sadaPops/.agents/rules/)
- **Skills Especializados:** Ver guías en [`.agents/skills/`](file:///c:/Users/betto/Documents/Hacks/INE/sadaPops/.agents/skills/)
