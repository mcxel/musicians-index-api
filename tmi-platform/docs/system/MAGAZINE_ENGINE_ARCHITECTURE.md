# MAGAZINE_ENGINE_ARCHITECTURE.md
# Magazine / Articles System — Engine Architecture
# Visual authority: PDF pages 4–8 (spreads), page 20 (archive)
# Repo paths: apps/web/src/app/articles/, apps/api/src/modules/editorial/

## What Is The Magazine Engine

TMI publishes in issues (like a real magazine).
Each issue is a collection of articles/spreads in a horizontal page-flip reader.
The homepage magazine belt shows the latest issue preview.
Archive shows all past issues.

This is NOT a generic blog. It is a magazine product with spread-based layout.

---

## Core Concepts

| Concept | Description |
|---------|-------------|
| Issue | A titled release (e.g., "Issue 12 — March 2026") containing multiple articles |
| Article | A single editorial piece — can span 1 or 2-page spreads |
| Spread | A two-page layout within the reader (left page + right page) |
| Reader | The horizontal page-flip interface (Swiper, or custom CSS transform) |
| Article Card | Thumbnail tile used in belts/archive — not the full reader |

---

## Issue / Article Data Model

### DB Models Needed

```prisma
model Issue {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  coverImage  String?
  publishedAt DateTime?
  isLive      Boolean   @default(false)
  order       Int       // issue number / sequence
  articles    Article[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Article model already exists — add spread fields:
// spreadLayout  String?  @default("single")  // "single" | "double"
// issueId       String?
// issue         Issue?  @relation(...)
// pageNumber    Int?
// spreadLeft    String? @db.Text  // HTML/MDX for left page
// spreadRight   String? @db.Text  // HTML/MDX for right page (if double)
```

---

## Engine Architecture

```
MagazineEngine
├── IssueLoader           — fetch current issue + articles, ordered by pageNumber
├── SpreadRenderer        — renders single or double-spread layout
├── MagazineReader        — horizontal flip UI, keyboard/swipe navigation
├── ArticleCard           — thumbnail card for belts and archive
├── IssueGrid             — archive grid of past issues
└── MagazineBeltPreview   — 3-tile homepage belt preview
```

---

## Reader Behavior

- Navigation: left/right arrow, swipe (mobile), keyboard ←→
- URL updates per spread: `/articles/[issueSlug]?page=3` (shareable)
- Stream & Win audio: render in magazine reader without re-mount
- Article pages inherit artist/tier identity (Diamond = gold accent, etc.)
- Loading state: skeleton page spread (not spinner)
- Empty state: "No articles yet in this issue"
- Error state: "Could not load this issue — try again"
- Fallback: fall back to article list view if spread renderer fails

---

## API Routes Needed

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/editorial/issues` | List all live issues |
| GET | `/api/editorial/issues/:slug` | Get single issue + articles |
| GET | `/api/editorial/issues/latest` | Get the current live issue |
| GET | `/api/editorial/articles/:slug` | Get single article |
| POST | `/api/editorial/issues` | Create issue (Admin/Staff only) |
| PATCH | `/api/editorial/issues/:id` | Update issue |
| POST | `/api/editorial/articles` | Create article |
| PATCH | `/api/editorial/articles/:id` | Update article |

---

## Frontend Routes

| Route | Description |
|-------|-------------|
| `/articles` | Article listing / issue grid |
| `/articles/[slug]` | Individual article or magazine reader (auto-detect) |
| `/archive` | Full archive of past issues |
| `/magazine` | Alias → redirects to latest issue reader |

---

## Files To Create / Edit

| File | Action |
|------|--------|
| `packages/db/prisma/schema.prisma` | EDIT — add Issue model, spread fields to Article |
| `apps/api/src/modules/editorial/issues.controller.ts` | CREATE |
| `apps/api/src/modules/editorial/issues.service.ts` | CREATE |
| `apps/web/src/systems/magazine/MagazineEngine.ts` | CREATE |
| `apps/web/src/systems/magazine/IssueLoader.ts` | CREATE |
| `apps/web/src/systems/magazine/SpreadRenderer.tsx` | CREATE |
| `apps/web/src/components/magazine/MagazineReader.tsx` | CREATE |
| `apps/web/src/components/magazine/ArticleCard.tsx` | CREATE OR EDIT |
| `apps/web/src/components/magazine/IssueGrid.tsx` | CREATE |
| `apps/web/src/app/articles/[slug]/page.tsx` | EDIT — integrate reader |
| `apps/web/src/app/archive/page.tsx` | CREATE |

---

## Visual Rules (from PDFs pages 4–8)

- Reader background: near-black
- Spread border: subtle neon edge strip
- Typography: large editorial display type on left page, body on right
- Artist identity: artist color/tier propagates into article backgrounds
- Page number: corner label (TMI styled)
- Cover tile in archive: shows issue title, date, cover image - sharp corners
