---
name: ai-assistant-integration
description: Instrucciones para configurar el endpoint del asistente LLM cívico en FastAPI con acotamiento de contexto y soporte de idioma dual (es/nah).
---

# Skill: Integración del Asistente de IA Cívico Acotado

## 1. Visión General
El **Asistente de IA** es un componente de chatbot flotante y persistente (`apps/web/src/features/asistente-ia/`) alimentado por un endpoint en el backend de FastAPI (`backend/app/features/asistente/`).

Responde preguntas de los usuarios exclusivamente sobre datos concretos de la CCPC del INE y contenido editorial de la plataforma, cumpliendo estrictas pautas de neutralidad.

---

## 2. Arquitectura del Sistema de Acotamiento de Prompt

```python
# backend/app/features/asistente/service.py
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    session_id: str
    language: str = "es"  # "es" | "nah"

class ChatResponse(BaseModel):
    response: str
    sources: list[str]  # ej. ["CCPC INE 2024 Tabla 4", "Sección Narrativa 2"]

def build_system_prompt(language: str, context_docs: str) -> str:
    lang_instruction = "Responde en Español." if language == "es" else "Responde en lengua Náhuatl."
    
    return f"""
    Eres el Asistente Cívico del Mapa de Dalias (Hackathon INE).
    {lang_instruction}
    
    INFORMACIÓN DE CONTEXTO AUTORIZADA:
    {context_docs}
    
    REGLAS OBLIGATORIAS:
    1. Responde ÚNICAMENTE usando los datos de contexto provistos arriba.
    2. NUNCA des opiniones políticas, ni comentes sobre candidatos, partidos o ideologías.
    3. Si la respuesta no está en el contexto, contesta: "Solo poseo información sobre la Cultura Cívica (CCPC) del INE y el Mapa de Dalias."
    4. Sé conciso (máximo 3 oraciones).
    """
```

---

## 3. Especificaciones UI del Widget de Chat
- Botón flotante anclado en la esquina inferior derecha (`fixed bottom-6 right-6 z-50`).
- Modal desplegable que contiene el historial de mensajes + botones pill con preguntas sugeridas:
  - *"¿Qué grupo de edad vota más?"*
  - *"¿Cómo funciona el mapa de dalias?"*
  - *"¿Puedo votar si estoy fuera de mi ciudad?"*
- Animación de escritura dinámica y renderizado de Markdown para citar fuentes.
