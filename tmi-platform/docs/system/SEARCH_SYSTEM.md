# SEARCH_SYSTEM.md
## Global Search — Everything Findable in One Bar
### BerntoutGlobal XXL / The Musician's Index

---

## WHAT IS SEARCHABLE

| Entity | Fields Indexed | Weight |
|---|---|---|
| Artists | handle, name, genre, city, bio | High |
| Producers | handle, name, genre, specialty | High |
| Venues | name, city, type | High |
| Rooms (live) | title, host, genre, type | Highest (live boost) |
| Events | title, venue, date, genre | High |
| Articles | title, body excerpt, tags | Medium |
| Beats (marketplace) | title, genre, BPM, producer | Medium |

---

## SEARCH ARCHITECTURE

```
User types query
     ↓
SearchBar (debounce 300ms)
     ↓
GET /api/search?q={query}&type={all|artists|rooms|events|articles}
     ↓
API: Postgres full-text search + Redis live room boost
     ↓
SearchResultsPanel renders grouped results
```

## LIVE ROOM BOOST

Active live rooms appear at top of results with LIVE badge.
Sort within live results: fewest viewers first (discovery-first).

## SEARCH RESULT GROUPS

```
LIVE NOW        → active rooms matching query (viewers_asc)
ARTISTS         → artist profiles
PRODUCERS       → producer profiles
EVENTS          → upcoming events
VENUES          → venue pages
ARTICLES        → magazine articles
BEATS           → beat marketplace listings
```

## KEYBOARD SHORTCUTS

- `/` (forward slash) — focus search bar from anywhere
- `Escape` — clear and close search
- `↑↓` — navigate results
- `Enter` — go to highlighted result

## ROUTE

`/search?q={query}&type={filter}` — full results page
Inline: GlobalSearchBar dropdown (first 8 results per group)
