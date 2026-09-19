---
name: ccpc-etl-ingest
description: Flujo de trabajo paso a paso para la ingesta de datasets zip de la CCPC del INE a tablas de PostgreSQL usando Python, pandas y SQLAlchemy.
---

# Skill: Ingesta ETL y Transformación de Datos CCPC

## 1. Contexto y Propósito
El dataset de la CCPC (Cultura Cívica y Participación Ciudadana) del INE proporciona métricas oficiales de participación electoral y cultura cívica. Se distribuye en un archivo `.zip` multianual que contiene hojas de cálculo originales en Excel/CSV.

Este skill proporciona los comandos y la lógica para ejecutar el pipeline de ingesta offline hacia PostgreSQL.

---

## 2. Comandos de Ingesta

```bash
# Navegar al directorio del backend
cd backend

# Asegurar que el entorno virtual esté activo
source .venv/bin/activate  # o .venv\Scripts\activate en Windows

# Ejecutar el script de ingesta apuntando al archivo ZIP original
python etl/ccpc_ingest.py --file ../data/raw/ccpc_ine_official.zip --db-url $DATABASE_URL
```

---

## 3. Pasos de Limpieza y Normalización de Datos

1. **Normalización de Encabezados:** Estandarizar nombres de columnas (`lower_snake_case`), convertir codificación a UTF-8.
2. **Alineación de Claves Geográficas:** Mapear nombres de estados/municipios con claves oficiales del INEGI de 2 dígitos (`cve_ent`) y 3 dígitos (`cve_mun`).
3. **Agrupación de Grupos de Edad:** Agrupar variables de edad en rangos estandarizados:
   - `18-29` (Jóvenes - objetivo primario)
   - `30-49` (Adultos jóvenes)
   - `50-64` (Adultos)
   - `65+` (Adultos mayores)
4. **Métricas Calculadas:**
   - `porcentaje_participacion`: $(\text{votos\_emitidos} / \text{lista\_nominal}) \times 100$
   - `brecha_genero`: $\text{participacion\_mujeres} - \text{participacion\_hombres}$

---

## 4. Checklist de Verificación de Consultas
Tras la ingesta, verificar la integridad de las tablas:
```sql
-- Verificar conteos agregados por estado para la elección 2024
SELECT cve_ent, estado, participacion_total 
FROM ccpc_participacion_estado 
WHERE anio_eleccion = 2024 
ORDER BY participacion_total DESC;

-- Verificar desglose por grupos de edad
SELECT grupo_edad, AVG(porcentaje_participacion) AS promedio_participacion
FROM ccpc_participacion_edad
GROUP BY grupo_edad;
```
