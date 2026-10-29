"""
Configuración de Celery 5 + Redis 7 para UrbanWatch.
Colas: default, emedios (Lightpanda), vigia (HeadlessX + PixelRAG).
"""
import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/1")

celery_app = Celery(
    "urbanwatch_workers",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "workers.vigia.dark_web_worker",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Mexico_City",
    enable_utc=True,
    task_routes={
        "vigia.*": {"queue": "vigia"},
        "emedios.*": {"queue": "emedios"},
    },
)
