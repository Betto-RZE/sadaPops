FROM python:3.11-slim

WORKDIR /app

# Install system dependencies & netcat for entrypoint healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    netcat-openbsd \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency requirements
COPY pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir fastapi uvicorn asyncpg sqlalchemy alembic pandas pydantic pydantic-settings python-dotenv pytest httpx

# Copy application source
COPY . .

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
