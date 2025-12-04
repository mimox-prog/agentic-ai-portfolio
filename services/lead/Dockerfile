# Dockerfile
FROM python:3.11-slim
WORKDIR /app

# system deps for common packages
RUN apt-get update && apt-get install -y build-essential curl && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml poetry.lock* /app/
# If using requirements.txt, copy that instead
COPY requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

ENV PORT=8000
EXPOSE 8000

CMD ["uvicorn", "services.lead.app:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
