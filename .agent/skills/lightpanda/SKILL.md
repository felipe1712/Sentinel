---
name: lightpanda
description: Ultra-fast Zig headless browser with CDP compatibility on ws://localhost:9222. Use for E-Medios batch scraping and open surface media in CDMX, with automatic fallback to Playwright.
---

# Lightpanda Skill — UrbanWatch E-Medios & Open Media

## Rules
1. Use when `uwi_sources.browser_engine = 'lightpanda'` (E-Medios and open CDMX news sites).
2. NEVER use Lightpanda for `.onion` sites.
3. Connect via Playwright CDP: `await p.chromium.connect_over_cdp(LIGHTPANDA_CDP_URL, timeout=5000)` with automatic fallback to `p.chromium.launch(headless=True)`.
4. Required environment variable: `LIGHTPANDA_CDP_URL=ws://localhost:9222`.
