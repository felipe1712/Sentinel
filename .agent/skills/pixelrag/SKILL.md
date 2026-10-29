---
name: pixelrag
description: Visual RAG indexing screenshots with Qwen3-VL-Embedding-2B and FAISS to detect visual changes (>15% diff threshold) across dark web and monitored sites in UrbanWatch Vigía.
---

# PixelRAG Skill — UrbanWatch Visual Change Detection

## Rules
1. Capture screenshots of monitored sites (`uwi_sitios_mira`) and store in `CAPTURES_PATH/{sitio_id}/`.
2. Index captures into `PIXELRAG_INDEX_DIR/{sitio_id}` and compute visual similarity / pixel diff against the previous capture.
3. Trigger `cambio_detectado = true` when visual change exceeds 15%.
