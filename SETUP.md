# SETUP.md — Guía de Configuración e Inicialización Local

Este documento guía a cualquier desarrollador o agente de IA paso a paso para configurar, instalar e iniciar el entorno de desarrollo local para el proyecto **Mapa de Dalias y Participación Ciudadana**.

---

## 1. Prerrequisitos del Sistema

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas en tu sistema:

- **Node.js:** v18.17.0 o superior (recomendado v20+ LTS).
- **pnpm:** v8.0.0 o superior (`npm install -g pnpm` o `corepack enable`).
- **Python:** v3.11 o superior.
- **Docker & Docker Compose:** Para la base de datos PostgreSQL local y contenedores.
- **Git:** Para control de versiones.

---

## 2. Variables de Entorno y Configuración Inicial

### 2.1 Backend (`backend/.env`)
Crea el archivo `backend/.env` copiándolo desde `backend/.env.example` (o usando los valores por defecto locales):

```env
# Entorno
ENV=development
PROJECT_NAME="Mapa de Dalias API (Dev)"
LOG_LEVEL=debug

# Base de Datos PostgreSQL Local (Docker)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/mapa_dalias_db

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]

# Asistente de IA (Opcional en desarrollo local)
LLM_API_KEY=mock_dev_key
LLM_MODEL=gemini-1.5-flash
```

### 2.2 Frontend (`apps/web/.env.local`)
Crea el archivo `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENV=development
```

---

## 3. Instalación Paso a Paso

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/Betto-RZE/sadaPops.git
cd sadaPops
```

---

### Paso 2: Instalar Dependencias del Monorepo Node.js
Ejecuta `pnpm install` en la raíz del proyecto para instalar las dependencias de `apps/web`, `packages/game` y `packages/types`:
```bash
pnpm install
```

---

### Paso 3: Configurar el Entorno Virtual de Python (Backend)
Navega a la carpeta `backend/` y crea el entorno virtual de Python:

```bash
cd backend

# En Linux/macOS:
python3 -m venv .venv
source .venv/bin/activate

# En Windows (PowerShell):
python -m venv .venv
.venv\Scripts\Activate.ps1

# Instalar dependencias de Python
pip install -e .
# o si usas pip install directo:
pip install -r pyproject.toml
```

---

### Paso 4: Iniciar la Base de Datos PostgreSQL con Docker
Regresa a la raíz o utiliza Docker Compose desde `infra/`:

```bash
# Iniciar contenedor de PostgreSQL en segundo plano
docker compose -f infra/docker-compose.yml up -d postgres
```

---

### Paso 5: Ejecutar Migraciones de Base de Datos
Con la base de datos activa y el entorno de Python habilitado, ejecuta las migraciones de Alembic para crear las tablas:

```bash
cd backend
alembic upgrade head
```

---

### Paso 6: Cargar Datos de Prueba o Ingesta ETL de la CCPC
Para poblar la base de datos local con los datos oficiales de la CCPC del INE:

```bash
cd backend
python etl/ccpc_ingest.py --file ../data/raw/ccpc_ine_official.zip
```
*(Nota: Si no cuentas con el zip oficial completo durante la instalación inicial, el script generará automáticamente datos de prueba / mock data para desarrollo).*

---

## 4. Ejecución del Proyecto en Desarrollo

Tienes dos alternativas para arrancar la aplicación localmente:

### Opción A: Modo Híbrido (Recomendado para iteración rápida)

1. **Backend (Terminal 1):**
   ```bash
   cd backend
   source .venv/bin/activate  # o .venv\Scripts\Activate.ps1
   uvicorn app.main:app --reload --port 8000
   ```
2. **Frontend + Juego (Terminal 2):**
   ```bash
   # Desde la raíz del proyecto
   pnpm --filter web dev
   ```

### Opción B: Todo mediante Docker Compose
```bash
docker compose -f infra/docker-compose.yml up --build
```

---

## 5. Verificación del Entorno Local

Una vez iniciados los servicios, abre tu navegador y verifica las siguientes URLs:

- **Frontend Web:** [`http://localhost:3000`](http://localhost:3000) (Debe mostrar la Landing con el Mapa de Dalias en Zoom 1).
- **Documentación de la API (OpenAPI / Swagger):** [`http://localhost:8000/docs`](http://localhost:8000/docs) (Debe listar todos los endpoints de FastAPI).
- **Endpoint de Salud Backend:** [`http://localhost:8000/health`](http://localhost:8000/health) (Respuesta esperada: `{"status": "ok"}`).

---

## 6. Cheat Sheet de Comandos Frecuentes

| Acción | Comando |
|---|---|
| Iniciar todo el frontend en desarrollo | `pnpm --filter web dev` |
| Compilar todo el monorepo | `pnpm build` |
| Iniciar servidor de backend FastAPI | `cd backend && uvicorn app.main:app --reload` |
| Crear nueva migración de base de datos | `cd backend && alembic revision --autogenerate -m "descripcion"` |
| Ejecutar pruebas unitarias de backend | `cd backend && pytest` |
| Ejecutar linter de frontend | `pnpm --filter web lint` |
