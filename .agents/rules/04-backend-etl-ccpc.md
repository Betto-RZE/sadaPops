# Regla 04: Arquitectura del Backend y Pipeline ETL de la CCPC

## 1. Ingesta Offline de la CCPC (`backend/etl/ccpc_ingest.py`)
- **Regla:** El archivo oficial `.zip` de la CCPC del INE NUNCA debe parsearse durante las peticiones HTTP entrantes.
- **Proceso:** Ejecutar el script ETL offline `python etl/ccpc_ingest.py` durante la fase de instalación/build para extraer, limpiar, indexar y cargar los datos de los Excel/CSV originales en tablas estructuradas de PostgreSQL.
- **Esquemas de Datos Requeridos:**
  - `ccpc_participacion_estado`: Tasas de participación agregadas por estado, año de elección (2009-2024), género y grupo de edad.
  - `ccpc_participacion_edad`: Desglose por demografía de edad (jóvenes vs adultos vs adultos mayores).
  - `ccpc_referente_indigena`: Datos desglosados por marcadores de población indígena y afrodescendiente.

---

## 2. Especificaciones de Endpoints en FastAPI
- Usar esquemas de Pydantic v2 para todos los tipos de respuesta (`backend/app/features/*/schemas.py`).
- Implementar routers asíncronos (`async def`) para todas las consultas a la base de datos usando sesiones asíncronas de SQLAlchemy 2.0.
- Mantener un manejador global de excepciones en `backend/app/core/deps.py` que retorne payloads JSON de error estandarizados (`{"error": "string", "code": 400}`).

---

## 3. Endpoint Acotado del Asistente de IA (`backend/app/features/asistente/`)
- El endpoint `POST /api/v1/asistente/chat` acepta la cadena de prompt y el idioma opcional (`es` | `nah`).
- El System Prompt DEBE aplicar una restricción de dominio estricta:
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
