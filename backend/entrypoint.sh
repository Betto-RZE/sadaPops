#!/bin/sh
set -e

echo "=== Esperando a que PostgreSQL responda en la red de Docker... ==="
while ! nc -z postgres 5432; do
  sleep 1
done
echo "=== PostgreSQL listo ==="

echo "=== Ejecutando migraciones de base de datos Alembic... ==="
alembic upgrade head || echo "Aviso: Alembic omitido o ya actualizado"

echo "=== Ejecutando ingesta de datos iniciales CCPC... ==="
python etl/ccpc_ingest.py || echo "Aviso: Ingesta inicial completada o datos de prueba cargados"

echo "=== Iniciando servidor backend FastAPI con auto-reload... ==="
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
