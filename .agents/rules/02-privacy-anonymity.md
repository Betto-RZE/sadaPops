# Rule 02: Privacy, Anonymity & Aggregation Safeguards

## 1. Zero Personally Identifiable Information (PII)
- **Zero Input Fields:** Do NOT create text input fields for nicknames, user notes, comments, or personal descriptions during dalia registration.
- **Predefined Phrases Only:** If a user wants to select a quote for their dalia, provide a strict closed dropdown of 5-10 neutral civic phrases. Never permit custom user text.
- **Anonymous Sessions:** Identify users via an anonymous local UUID stored in `localStorage` or a non-trackable HTTP-only cookie (`useSesionAnonima`).

---

## 2. Municipal Map (Zoom 3) Anti-Reidentification Threshold
To prevent identifying individual participants in small rural or low-population municipalities:
- **Threshold Rule ($N=5$):** If the aggregate count of dalias in a specific municipality or zonal code is strictly less than 5, the backend MUST NOT return individual coordinate points for that municipality.
- **Fallback Action:** Aggregate the count directly into the parent state count (Zoom 2) or render a single state-level cluster badge.

### Python Backend Implementation Requirement:
```python
# backend/app/features/dalias/service.py
MIN_MUNICIPAL_AGGREGATION_THRESHOLD = 5

def sanitize_municipal_dalias(municipal_counts: list[MunicipalDaliaAggregate]) -> list[MunicipalDaliaAggregate]:
    sanitized = []
    for item in municipal_counts:
        if item.count < MIN_MUNICIPAL_AGGREGATION_THRESHOLD:
            # Re-assign count to state level aggregate
            item.municipality_id = None
            item.is_aggregated_to_state = True
        sanitized.append(item)
    return sanitized
```

---

## 3. Data Integrity & Neutrality
- The platform tracks that a user **informed themselves**, NEVER that a user voted for a specific party or candidate.
- Dalia popup cards MUST display only:
  - Aggregate topic explored (e.g., "Módulo completado: Dashboard CCPC")
  - Approximate timestamp (e.g., "Hace 2 horas")
  - General state/municipality (if count $\ge 5$)
