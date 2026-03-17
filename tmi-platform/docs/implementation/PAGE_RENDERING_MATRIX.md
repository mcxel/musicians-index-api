# Page Rendering Matrix

## Rendering policy
- Static shell for SEO and fast TTFB.
- Hybrid sections for personalized and frequently changing content.
- Live surfaces for room previews, counters, and motion portraits.

## Matrix
| Surface | Mode | Notes |
|---|---|---|
| Homepage cover | Hybrid + Live islands | 6-second portrait loops, live badges, sponsor slot |
| Homepage magazine spread | Hybrid | Articles + ad/sponsor blocks + poll and horoscope insert |
| Preview wall | Live | Continuous room preview cards, hover details, fast entry |
| Artist profile hub | Hybrid | Static frame + live metrics + points state |
| Artist article page | Hybrid | SEO static content + live ranking, sponsor, reactions |
| Contest and game pages | Live | Timers, votes, active room stats |
| Billboard pages | Hybrid | Scheduled snapshots + live movement indicators |
| Admin command pages | Live | Operational telemetry and controls |

## Guardrails
- Live islands must have a static fallback state.
- Motion auto-reduces for low-power devices.
- No page should depend on live fetch to render a first frame.
