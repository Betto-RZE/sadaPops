# SETUP.md — Guía de Inicialización Ultra Cómoda (Sin Configurar Python Local)

Esta guía explica el método **más rápido y cómodo** para levantar todo el proyecto localmente sin tener que configurar entornos virtuales de Python ni instalar librerías manualmente en tu sistema.

---

## 🚀 Inicialización en Solo 2 Pasos

```mermaid
flowchart TD
    A[Paso 1: docker compose up -d] -->|Levanta Postgres + FastAPI + Migraciones + ETL| B(Backend & BD Listos)
    C[Paso 2: pnpm install && pnpm dev] -->|Levanta Next.js + Vite Dev Server| D(Frontend & Juego Listos)
    B --- D
```

### Paso 1: Levantar el Backend y la Base de Datos con Docker (1 comando)
Docker se encarga automáticamente de instalar Python, las librerías, conectarse a PostgreSQL, ejecutar las migraciones de Alembic y correr el script ETL de datos iniciales sin que tengas que tocar nada de Python en tu máquina.

```bash
docker compose -f infra/docker-compose.yml up -d
```

*(¡Listo! El backend de FastAPI estará corriendo en `http://localhost:8000` con la base de datos totalmente configurada y poblada con datos).*

---

### Paso 2: Levantar el Frontend y el Motor del Juego (`pnpm dev`)
En tu terminal, instala las dependencias del monorepo y arranca el entorno de desarrollo (Next.js en `apps/web` y Vite dev server para `packages/game` ejecutándose en paralelo):

```bash
pnpm install
pnpm dev
```

*(¡Listo! Abre `http://localhost:3000` en tu navegador).*

---

## 🛠️ Verificación de Servicios Activos

- 🌐 **Frontend (Next.js App Router):** [`http://localhost:3000`](http://localhost:3000)
- 🎮 **Servidor de Dev del Juego (Vite):** [`http://localhost:5173`](http://localhost:5173) *(utilizado por Next.js para HMR rápido)*
- ⚡ **Backend (FastAPI Docs):** [`http://localhost:8000/docs`](http://localhost:8000/docs)
- 🟢 **Estado de Salud de la API:** [`http://localhost:8000/health`](http://localhost:8000/health)

---

## 📋 Comandos Frecuentes de Desarrollo

| Acción | Comando |
|---|---|
| Ver logs del backend en tiempo real | `docker compose -f infra/docker-compose.yml logs -f backend` |
| Reiniciar contenedores backend/db | `docker compose -f infra/docker-compose.yml restart` |
| Detener todos los contenedores | `docker compose -f infra/docker-compose.yml down` |
| Re-ejecutar ingesta ETL dentro del contenedor | `docker exec -it sada_pops_backend python etl/ccpc_ingest.py` |
| Ejecutar pruebas de backend en Docker | `docker exec -it sada_pops_backend pytest` |
| Compilar frontend para producción | `pnpm build` |

---

## ⚙️ Variables de Entorno (Preconfiguradas)

Para desarrollo local no necesitas configurar nada manualmente. Docker Compose y Next.js traen valores por defecto completamente funcionales:
- **Backend:** Conecta automáticamente a `postgresql+asyncpg://postgres:postgrespassword@postgres:5432/mapa_dalias_db` dentro de la red del contenedor.
- **Frontend:** Apunta automáticamente a `http://localhost:8000`.
