# TMI REPO EXTENSION RULESET

## 1. The Golden Rule
**Extend first. Create second. Replace never, unless explicitly required.**
Claude and Copilot must attach new capabilities to existing structures before generating new disconnected files.

## 2. File Decision Labels
Every new file or patch proposed must carry an explicit label:
- `[EXTEND]` - Modifying an existing system.
- `[CREATE]` - Justified new system generation.
- `[APPEND ONLY]` - Used strictly for `schema.prisma`.
- `[DO NOT TOUCH]` - Hardened core files (e.g., `middleware.ts`, `auth/*`).

## 3. Page Structure & Profile Growth
- **Homepage Behavior:** The homepage is a master hub consisting of stacked, rotating sections.
- **Artist & Fan Profiles:** Grow profiles downward in stacked sections first (Overview, Stats, Sponsors, Events, Replays, Rewards). 
- Only branch into nested sub-routes (e.g., `/artist/[slug]/charts`) when a section becomes too massive.

## 4. Route Hygiene
- Avoid one-off top-level routes.
- Keep things nested under established families: `/home`, `/magazine`, `/shows`, `/charts`, `/admin`, `/hub`, `/profile`.

## 5. No Duplicate Engines
- Do not create parallel article systems, duplicate chart systems, or standalone booking systems.
- Integrate with the existing Prisma schema and `app.module.ts` via safe module imports.

## 6. No Orphan Features
No feature may exist without:
1. A defined repository location
2. A module owner
3. A registry entry
4. Static fallback logic
5. Analytics tracking hooks
6. Admin/Conductor visibility

## 7. Appending Database Schema
- Open `packages/db/prisma/schema.prisma`.
- Paste new models AT THE VERY BOTTOM. Do not rewrite existing models.