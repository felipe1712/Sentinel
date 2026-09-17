"""
SentinelIQ Workers Multi-Daemon Supervisor
==========================================
Inicia y supervisa concurrentemente:
1. Briefing Generator (`briefing_generator.py`)
2. Data365 Territorial Ingestor (`data365_scheduler.py`)
3. GDELT 2.0 Ingestor (`gdelt_scheduler.py`)
"""

import sys
import subprocess
import time
import signal
import logging

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [Supervisor] %(message)s")
logger = logging.getLogger("supervisor")

SERVICES = [
    ("Briefing Generator", [sys.executable, "-u", "briefing_generator.py"]),
    ("Data365 Scheduler", [sys.executable, "-u", "data365_scheduler.py"]),
    ("GDELT Scheduler", [sys.executable, "-u", "gdelt_scheduler.py"]),
    ("Twitter Ingestor", [sys.executable, "-u", "twitter_ingestor.py"]),
]

def main():
    processes = []
    
    def cleanup(signum, frame):
        logger.info("Señal de terminación recibida. Deteniendo servicios hijos...")
        for name, p in processes:
            logger.info(f"Deteniendo {name}...")
            p.terminate()
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    logger.info("Iniciando servicios de inteligencia territorial...")
    for name, cmd in SERVICES:
        logger.info(f"Lanzando {name}: {' '.join(cmd)}")
        p = subprocess.Popen(cmd)
        processes.append((name, p))

    logger.info("Todos los servicios lanzados con éxito. Supervisando salud...")
    
    while True:
        time.sleep(10)
        for i, (name, p) in enumerate(processes):
            poll = p.poll()
            if poll is not None:
                logger.warning(f"Servicio {name} terminó con código {poll}. Reiniciando en 5 segundos...")
                time.sleep(5)
                cmd = SERVICES[i][1]
                new_p = subprocess.Popen(cmd)
                processes[i] = (name, new_p)

if __name__ == "__main__":
    main()
