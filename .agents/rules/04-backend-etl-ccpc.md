# Rule 04: Backend Architecture & CCPC ETL Pipeline

## 1. Offline CCPC Ingestion (`backend/etl/ccpc_ingest.py`)
- **Rule:** The raw official INE CCPC `.zip` file must NEVER be parsed on incoming HTTP requests.
- **Process:** Run the offline ETL script `python etl/ccpc_ingest.py` during build/setup to extract, clean, index, and load raw CSV/XLS data into structured PostgreSQL tables.
- **Data Schemas Required:**
  - `ccpc_participacion_estado`: Participation rates aggregated by state, election year (2009-2024), gender, age group.
  - `ccpc_participacion_edad`: Breakdown by age demographics (youth vs adults vs seniors).
  - `ccpc_referente_indigena`: Data sliced by indigenous and afro-descendant population markers.

---

## 2. FastAPI Endpoint Specifications
- Use Pydantic v2 schemas for all response types (`backend/app/features/*/schemas.py`).
- Implement async routers (`async def`) for all database queries using SQLAlchemy 2.0 async sessions.
- Maintain global exception handler in `backend/app/core/deps.py` returning standard JSON error payloads (`{"error": "string", "code": 400}`).

---

## 3. Scoped AI Assistant Endpoint (`backend/app/features/asistente/`)
- Endpoint `POST /api/v1/asistente/chat` accepts prompt string & optional language (`es` | `nah`).
- System Prompt MUST enforce strict domain boundary:
  ```python
  SYSTEM_PROMPT = """
  Eres el Asistente Cívico del Mapa de Dalias (Hackathon INE).
  Tu ÚNICO propósito es explicar datos de la CCPC (Cultura Cívica y Participación Ciudadana) y responder dudas sobre el contenido editorial de la plataforma.
  REGLAS ESTRICTAS:
  1. NUNCA emitir opiniones políticas, electorales, ni sobre partidos o candidatos.
  2. Responder con datos concretos de la base de datos CCPC procesada.
  3. Si la pregunta está fuera del dominio cívico/CCPC, responder cortésmente: "Solo puedo responder dudas sobre los datos cívicos del INE y el Mapa de Dalias."
  """
  ```
