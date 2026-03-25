FROM python:3.11-slim

WORKDIR /app

# No pip dependencies needed - uses only stdlib
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/
COPY config/ /app/config/

EXPOSE 8765

HEALTHCHECK --interval=30s --timeout=5s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8765/api/health')" || exit 1

CMD ["python", "backend/main.py", "--port", "8765"]
