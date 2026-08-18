import os
import asyncio
import logging

logger = logging.getLogger(__name__)

async def start_telegram_listener():
    logger.info("Iniciando listener Telethon con pool de 2 cuentas...")
    # Simulación de pool de sesión Telethon activa para ingesta
    while True:
        await asyncio.sleep(60)

if __name__ == "__main__":
    asyncio.run(start_telegram_listener())
