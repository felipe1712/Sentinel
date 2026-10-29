---
name: headlessx
description: Anti-detect browser scraping engine powered by Camoufox (C++ patched Firefox) with REST API and MCP on :38473. Use for dark web (.onion via Tor proxy), clandestine forums, and Cloudflare-protected sites in UrbanWatch Vigía.
---

# HeadlessX Skill — UrbanWatch Vigía

## Rules
1. Use ONLY when `uwi_sources.browser_engine = 'headlessx'` or for `.onion` / anti-bot sites in the Vigía module.
2. NEVER use HeadlessX for E-Medios batch scraping (use Lightpanda instead).
3. Required environment variables:
   - `HEADLESSX_URL` (default `http://localhost:38473`)
   - `HEADLESSX_API_KEY`
   - `TOR_PROXY` (default `socks5://127.0.0.1:9050` for `.onion` URLs)
4. Endpoint: `POST /api/operators/website/scrape` with header `x-api-key`.
