---
name: ccpc-etl-ingest
description: Step-by-step workflow for ingesting raw INE CCPC zip datasets into PostgreSQL tables using Python, pandas, and SQLAlchemy.
---

# Skill: CCPC ETL Ingestion & Data Transformation

## 1. Context & Purpose
The INE CCPC (Cultura Cívica y Participación Ciudadana) dataset provides official voter turnout and civic awareness metrics. It comes as a multi-year `.zip` containing raw Excel/CSV spreadsheets.

This skill provides the commands and logic to execute the offline ingestion pipeline into PostgreSQL.

---

## 2. Ingestion Commands

```bash
# Navigate to backend directory
cd backend

# Ensure virtual environment is active
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Run the ingestion script pointing to raw ZIP file
python etl/ccpc_ingest.py --file ../data/raw/ccpc_ine_official.zip --db-url $DATABASE_URL
```

---

## 3. Data Cleaning & Normalization Steps

1. **Header Normalization:** Standardize column names (lower_snake_case), convert encoding (UTF-8).
2. **Geographic Key Alignment:** Map state/municipality names to official INEGI 2-digit state codes (`cve_ent`) and 3-digit municipal codes (`cve_mun`).
3. **Age Demographic Bucketing:** Group age variables into standardized brackets:
   - `18-29` (Jóvenes - target primary)
   - `30-49` (Adultos jóvenes)
   - `50-64` (Adultos)
   - `65+` (Adultos mayores)
4. **Calculated Metrics:**
   - `porcentaje_participacion`: $(\text{votos\_emitidos} / \text{lista\_nominal}) \times 100$
   - `brecha_genero`: $\text{participacion\_mujeres} - \text{participacion\_hombres}$

---

## 4. Query Verification Checklist
After ingestion, verify dataset integrity:
```sql
-- Check state aggregate counts for 2024 election
SELECT cve_ent, estado, participacion_total 
FROM ccpc_participacion_estado 
WHERE anio_eleccion = 2024 
ORDER BY participacion_total DESC;

-- Check age group breakdown
SELECT grupo_edad, AVG(porcentaje_participacion) AS promedio_participacion
FROM ccpc_participacion_edad
GROUP BY grupo_edad;
```
