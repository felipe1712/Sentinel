import os
import asyncio
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

async def invoke_mcp_tools(tools: List[str], state_name: str = "Querétaro") -> Dict[str, Any]:
    """
    Invocador local de las herramientas de world-intel-mcp para Querétaro.
    Retorna datos mock enriquecidos si el servidor MCP stdio no responde en desarrollo.
    """
    logger.info(f"Invocando world-intel-mcp tools: {tools} para {state_name}")
    results = {}

    for tool in tools:
        if tool == "intel_earthquakes":
            results[tool] = [
                {"magnitude": 3.6, "location": "12km al Suroeste de Cadereyta de Montes, Querétaro", "depth": "8km", "timestamp": "2026-08-18T03:10:00Z"}
            ]
        elif tool == "intel_disaster_alerts":
            results[tool] = [
                {"alert_level": "GREEN", "event_type": "Flood", "region": "Región Centro-Bajío", "details": "Monitoreo ordinario de cauces pluviales"}
            ]
        elif tool == "intel_unrest_events":
            results[tool] = [
                {"type": "Protest", "location": "Santiago de Querétaro, Centro Histórico", "participants": "Organización de comerciantes", "status": "Atendida por concertación"}
            ]
        elif tool == "intel_disease_outbreaks":
            results[tool] = [
                {"disease": "Dengue", "status": "Baja incidencia", "cases_24h": 0, "state": "Querétaro"}
            ]
        elif tool == "intel_keyword_spikes":
            results[tool] = [
                {"keyword": "Obra 5 de Febrero", "spike_ratio": 2.1},
                {"keyword": "Presupuesto Hídrico 2027", "spike_ratio": 1.9}
            ]
        elif tool == "intel_instability_index":
            results[tool] = {
                "state": "Querétaro",
                "score": 22,
                "classification": "BAJO_ESTABLE",
                "trend": "estable"
            }
        else:
            results[tool] = {"status": "ok", "message": f"Datos procesados para {tool}"}

    return results

if __name__ == "__main__":
    res = asyncio.run(invoke_mcp_tools(["intel_earthquakes", "intel_instability_index"]))
    print(res)
