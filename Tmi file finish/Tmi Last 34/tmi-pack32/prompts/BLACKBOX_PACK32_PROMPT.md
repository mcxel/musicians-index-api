# BLACKBOX_PACK32_PROMPT.md
## Pack 32 — Paste to Blackbox for Magazine + Scene + Systems Integration
### BerntoutGlobal XXL / The Musician's Index

---

```
BLACKBOX TASK: TMI Pack 32 Integration

Integrate Pack 32 scaffold into the Next.js 14 app router monorepo.

PROJECT PATH: C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\src\

CRITICAL RULES:
1. DELETE files before replacing — never append to existing files
2. Each page.tsx = ONE default export only
3. Maintain TMI visual identity: #0D0520 bg, Bebas Neue/Oswald/Inter fonts
4. "Stations" not "Channels" everywhere public-facing
5. Artist articles ALWAYS link to artist station page
6. Homepage is a magazine-first portal — primary CTA is Enter Magazine

STEP 1 — REPLACE HOMEPAGE
Source: pack32/magazine/homepage/page.tsx
Target: app/(main)/page.tsx  OR  app/page.tsx
Note: This is the complete TMI homepage with all 6 belts, magazine jump star,
      lobby wall, editorial belt, discovery belt, advertiser belt, mobile nav.
      DELETE existing homepage and replace completely.

STEP 2 — REPLACE MAGAZINE FRONT
Source: pack32/magazine/magazine/page.tsx
Target: app/magazine/page.tsx
Note: "Welcome to The Musician's Index Magazine" entry scene.
      Includes featured performer gateway + news billboard + section grid.

STEP 3 — ADD SYSTEM CONFIG FILES
Source: pack32/systems/design-tokens.ts
Target: src/config/design-tokens.ts

Source: pack32/systems/scene-registry.ts
Target: src/config/scene-registry.ts

Source: pack32/systems/bot-registry.ts
Target: src/config/bot-registry.ts

Source: pack32/systems/pipeline-registry.ts
Target: src/config/pipeline-registry.ts  (also copy to apps/api/src/config/)

Source: pack32/systems/component-inventory.ts
Target: src/config/component-inventory.ts

STEP 4 — ADD REMAINING MAGAZINE PAGES (if not in Pack 31)
Create these pages using the TMI dark style (consistent with magazine/page.tsx):
  app/magazine/news/page.tsx        → News billboard list
  app/magazine/interviews/page.tsx  → Interview archive
  app/magazine/reviews/page.tsx     → Review archive
  app/magazine/tutorials/page.tsx   → Tutorial archive
  app/magazine/trending/page.tsx    → Trending content
  app/magazine/local/page.tsx       → Local artists
  app/magazine/events/page.tsx      → Events editorial
  app/news/page.tsx                 → News hub
  app/news/[slug]/page.tsx          → News story detail

STEP 5 — ADD DOCS
Source: pack32/routes/MASTER_ROUTE_MAP.md
Target: docs/system/MASTER_ROUTE_MAP.md

Source: pack32/systems/chain-inventory.md
Target: docs/system/CHAIN_INVENTORY.md

STEP 6 — TEST
  Remove-Item -Recurse -Force .next
  pnpm dev

Test these URLs:
  http://localhost:3000/             → TMI homepage with all belts + magazine star
  http://localhost:3000/magazine     → "Welcome to The Musician's Index Magazine"
  http://localhost:3000/magazine/news → News page
  http://localhost:3000/articles/test → Article with station link

Visual check:
  Background must be #0D0520 (dark purple-black)
  Section headers must use Bebas Neue in gold
  Magazine jump star must glow on homepage
  "Welcome to The Musician's Index Magazine" must appear on /magazine
  No white backgrounds anywhere
```
