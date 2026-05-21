# PACK 44 — SEARCH + RECOMMENDATIONS

## Files: 2
- `search/search.engine.ts` — Meilisearch configs for 5 indexes (artists, articles, events, venues, items) with searchable/filterable/sortable attributes per index
- `recommendations/recommendation.engine.ts` — 9 recommendation strategies, discovery-first room sort (Platform Law #1), local sponsor matching scoring function

## Key Systems
- `sortRoomsDiscoveryFirst()` — 0-viewer rooms rank FIRST (Platform Law #1 enforced in recommendations)
- `matchLocalSponsor()` — Scores artist+sponsor city+genre match for local sponsor loop
- Multi-entity search with relevance ranking per entity type
