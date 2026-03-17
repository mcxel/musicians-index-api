# deploy/runtime.Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy your runtime file(s)
# Adjust if api_server.py lives elsewhere
COPY api_server.py /app/api_server.py

RUN pip install --no-cache-dir flask redis psutil

ENV PYTHONUNBUFFERED=1
ENV PORT=8080

EXPOSE 8080

CMD ["python", "api_server.py"]
