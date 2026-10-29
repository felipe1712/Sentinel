---
name: worldmonitor-mcp
description: Global intelligence MCP server (https://worldmonitor.app/mcp) providing 40+ geopolitical, cyber, and regional instability layers. Used by Claude when generating UrbanWatch executive summaries.
---

# WorldMonitor MCP Skill — UrbanWatch Executive Intelligence

## Rules
1. Invoke WorldMonitor MCP tools (`search_telemetry`, `search_news`, `brief_area`, `entities_near`) when generating executive summaries (`/api/resumenes/generar`) for colonias or alcaldías.
2. Limit to 3-5 calls per analysis to control token consumption.
3. Required environment variable: `WORLDMONITOR_KEY`.
