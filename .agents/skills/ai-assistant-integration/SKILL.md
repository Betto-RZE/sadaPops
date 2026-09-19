---
name: ai-assistant-integration
description: Instructions for setting up the scoped civic LLM assistant endpoint in FastAPI with context grounding and dual language support (es/nah).
---

# Skill: Scoped Civic AI Assistant Integration

## 1. Overview
The **Asistente de IA** is a lightweight, persistent floating chatbot component (`apps/web/src/features/asistente-ia/`) powered by a FastAPI backend endpoint (`backend/app/features/asistente/`).

It answers user queries exclusively about INE CCPC data facts and platform editorial content, adhering to strict neutrality guidelines.

---

## 2. Prompt Grounding System Architecture

```python
# backend/app/features/asistente/service.py
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    session_id: str
    language: str = "es"  # "es" | "nah"

class ChatResponse(BaseModel):
    response: str
    sources: list[str]  # e.g., ["CCPC INE 2024 Table 4", "Sección Narrativa 2"]

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

## 3. Frontend Chat Widget UI Specs
- Floating button anchored to bottom right (`fixed bottom-6 right-6 z-50`).
- Expandable modal containing message log + quick suggested question pills:
  - *"¿Qué grupo de edad vota más?"*
  - *"¿Cómo funciona el mapa de dalias?"*
  - *"¿Puedo votar si estoy fuera de mi ciudad?"*
- Dynamic typing animation & Markdown rendering for citations.
