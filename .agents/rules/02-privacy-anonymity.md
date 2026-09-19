# Regla 02: Privacidad, Anonimato y Salvaguardas de Agregación

## 1. Cero Información de Identificación Personal (PII)
- **Cero Campos de Texto Libre:** NO crear campos de entrada de texto para apodos, notas de usuario, comentarios o descripciones personales durante el registro de la dalia.
- **Frases Predefinidas Únicamente:** Si un usuario desea elegir una frase para su dalia, proporcionar una lista desplegable cerrada de 5 a 10 frases cívicas neutrales. Nunca permitir texto personalizado escrito por el usuario.
- **Sesiones Anónimas:** Identificar a los usuarios mediante un UUID anónimo local almacenado en `localStorage` o en una cookie HTTP-only no rastreable (`useSesionAnonima`).

---

## 2. Umbral Anti-Reidentificación en el Mapa Municipal (Zoom 3)
Para evitar identificar participantes individuales en municipios pequeños o de baja población:
- **Regla del Umbral ($N=5$):** Si el conteo acumulado de dalias en un municipio o código zonal es estrictamente menor a 5, el backend NO DEBE retornar puntos de coordenadas individuales para ese municipio.
- **Acción de Respaldo:** Agregar el conteo directamente al conteo del estado padre (Zoom 2) o renderizar una insignia de grupo a nivel estatal.

### Requisito de Implementación en el Backend (Python):
```python
# backend/app/features/dalias/service.py
MIN_MUNICIPAL_AGGREGATION_THRESHOLD = 5

def sanitize_municipal_dalias(municipal_counts: list[MunicipalDaliaAggregate]) -> list[MunicipalDaliaAggregate]:
    sanitized = []
    for item in municipal_counts:
        if item.count < MIN_MUNICIPAL_AGGREGATION_THRESHOLD:
            # Reasignar el conteo al agregado del nivel estatal
            item.municipality_id = None
            item.is_aggregated_to_state = True
        sanitized.append(item)
    return sanitized
```

---

## 3. Integridad y Neutralidad de los Datos
- La plataforma registra que un usuario **se informó**, NUNCA que un usuario votó por un partido o candidato específico.
- Las tarjetas emergentes de dalia DEBEN mostrar únicamente:
  - Tema consultado agregado (ej. "Módulo completado: Dashboard CCPC")
  - Timestamp aproximado (ej. "Hace 2 horas")
  - Estado/Municipio general (si el conteo $\ge 5$)
