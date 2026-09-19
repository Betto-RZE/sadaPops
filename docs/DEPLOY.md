# DEPLOY.md — Guía de Despliegue y Producción (Hackathon INE)

Este documento detalla el procedimiento paso a paso para desplegar en producción la plataforma **Mapa de Dalias y Participación Ciudadana** utilizando la capa gratuita (*Free Tier*) recomendada de proveedores en la nube.

---

## 1. Arquitectura de Despliegue (Un Solo Dominio)

Para un sprint de hackathon de 3 semanas con un equipo de 4 desarrolladores, la arquitectura se diseña para **minimizar costos y eliminar problemas de CORS/Sesión**:

```mermaid
flowchart LR
    subgraph Frontend [Vercel - Free Tier]
        NextJS[Apps/Web - Next.js App Router]
        GamePkg[Packages/Game - Dynamic ssr:false]
        NextJS --- GamePkg
    end

    subgraph Backend [Google Cloud Run - Free Tier]
        FastAPI[FastAPI Container - Dockerfile]
        ETL[ETL Pipeline - Ingesta CCPC]
    end

    subgraph Database [Neon PostgreSQL - Free Tier]
        Postgres[(PostgreSQL Serverless)]
    end

    User[Usuario / Jurado INE] --> NextJS
    NextJS -->|HTTPS / API Requests| FastAPI
    FastAPI --> Postgres
    ETL --> Postgres
```

### Componentes y Proveedores Recomendados:

| Componente | Proveedor Recomendado | Razón / Capa Gratuita |
|---|---|---|
| **Frontend + Juego** | **Vercel** | Gratis para proyectos hobby. Compila Next.js y `@mapa-dalias/game` en un solo build de producción. |
| **Backend API** | **Google Cloud Run** | 2M peticiones/mes gratis, 180,000 vCPU-seg. No se desactiva por inactividad. |
| **Base de Datos** | **Neon PostgreSQL** | 0.5 GB de almacenamiento gratis. Escala a cero y despierta automáticamente con la siguiente consulta. |
| **Alternativa Backend** | Render Free | Pausa tras 15 min de inactividad (cold start de 30-60s). Usar solo como respaldo. |

---

## 2. Variables de Entorno Requeridas

### 2.1 Backend (`backend/.env.production`)
```env
# Configuración del Sistema
ENV=production
PROJECT_NAME="Mapa de Dalias API"
LOG_LEVEL=info

# Base de Datos PostgreSQL (Neon)
DATABASE_URL=postgresql+asyncpg://user:password@ep-cool-flower-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

# CORS
CORS_ORIGINS=["https://mapa-dalias.vercel.app", "http://localhost:3000"]

# Asistente de IA (LLM Provider)
LLM_API_KEY=tu_api_key_de_gemini_o_openai
LLM_MODEL=gemini-1.5-flash
```

### 2.2 Frontend (`apps/web/.env.production`)
```env
# URL de la API del Backend (Cloud Run)
NEXT_PUBLIC_API_URL=https://mapa-dalias-backend-xyz-uc.a.run.app

# Identificador de Entorno
NEXT_PUBLIC_ENV=production
```

---

## 3. Paso a Paso del Despliegue

### Paso 1: Configurar la Base de Datos en Neon PostgreSQL
1. Crea una cuenta gratuita en [Neon.tech](https://neon.tech).
2. Crea un nuevo proyecto llamado `mapa-dalias-db`.
3. Copia la cadena de conexión en formato `postgresql://...` y guárdala como `DATABASE_URL`.
4. Ejecuta las migraciones de base de datos Alembic desde tu entorno local conectándote a Neon:
   ```bash
   cd backend
   DATABASE_URL="postgresql+asyncpg://..." alembic upgrade head
   ```

---

### Paso 2: Ejecutar la Ingesta de Datos de la CCPC (ETL)
Carga los datos oficiales del INE procesados a la base de datos en producción:
```bash
cd backend
DATABASE_URL="postgresql+asyncpg://..." python etl/ccpc_ingest.py --file ../data/raw/ccpc_ine_official.zip
```

---

### Paso 3: Desplegar el Backend en Google Cloud Run

#### Opción A: Despliegue desde Google Cloud CLI (Recomendado)
1. Instala e inicia sesión en [Google Cloud CLI](https://cloud.google.com/sdk).
2. Autentícate y selecciona tu proyecto de GCP:
   ```bash
   gcloud auth login
   gcloud config set project tu-proyecto-gcp
   ```
3. Construye y despliega el contenedor Docker directamente desde el directorio `backend`:
   ```bash
   cd backend
   gcloud run deploy mapa-dalias-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars DATABASE_URL="postgresql+asyncpg://...",LLM_API_KEY="tu_key"
   ```
4. Guarda la URL pública generada (ej. `https://mapa-dalias-backend-xyz-uc.a.run.app`).

---

### Paso 4: Desplegar el Frontend en Vercel

1. Conecta el repositorio de GitHub `Betto-RZE/sadaPops` en [Vercel](https://vercel.com).
2. Configura los parámetros del proyecto en Vercel:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web` (o deja la raíz si utilizas la detección automática de Turborepo).
   - **Build Command:** `pnpm build`
   - **Output Directory:** `.next`
3. Agrega las variables de entorno en el panel de Vercel:
   - `NEXT_PUBLIC_API_URL` = `https://mapa-dalias-backend-xyz-uc.a.run.app`
4. Haz clic en **Deploy**. Vercel compilará automáticamente tanto el cliente de Next.js como el paquete `@mapa-dalias/game` integrado.

---

## 4. Verificación de Salud en Producción (Checklist)

Una vez completados los despliegues, ejecuta la siguiente lista de verificación:

- [ ] **Endpoint de Salud:** Visita `https://tu-backend.a.run.app/health` y confirma respuesta `{"status": "ok"}`.
- [ ] **CORS:** Verifica en la consola del navegador que `apps/web` en Vercel pueda consumir `/api/v1/dalias/aggregate` sin errores de política de origen cruzado.
- [ ] **Mapa de Dalias (Zoom 1-3):** Confirma que los mapas GeoJSON carguen correctamente y que el umbral $N=5$ consolide los datos de municipios pequeños.
- [ ] **Juego Pixel Art:** Accede a la ruta `/juego` y confirma que el canvas de PixiJS se monte sin errores de SSR (Server-Side Rendering).
- [ ] **Asistente de IA:** Envía una pregunta en el chat y valida que la respuesta provenga de los datos de la CCPC sin desviarse del dominio cívico.
- [ ] **Tabla Accesible WCAG:** Haz clic en "Ver como tabla para lector de pantalla" en el mapa y verifica que la tabla semántica muestre los datos correctamente.

---

## 5. Estrategia de Respaldo y Contingencia

- **Si Neon escala a cero (primer request tarda ~1-2s):** El cliente API del frontend debe tener reintentos automáticos (*retries*) con *backoff* exponencial para evitar fallos visibles en la UI durante el primer segundo.
- **Si el jurado prueba la app sin conexión a internet rápida:** Asegúrate de que los mapas GeoJSON vivan dentro de `apps/web/public/geojson/` para que Vercel los sirva desde la CDN Edge a máxima velocidad sin depender de APIs de mapas externas.
