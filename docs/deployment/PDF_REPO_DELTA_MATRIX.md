# PDF → Repo Delta Matrix (Grounded Pass)

Purpose: compare extracted PDF requirements against current repo/docs state before proceeding to Artist Profile → Article Auto-Create implementation.

## Source Reality Check
- `The Musician's Index Magazine images.pdf` extraction produced page markers but no readable embedded text (image-heavy PDF). A full fidelity pass requires OCR.
- `tmi add on.pdf` extraction is text-rich and was used for evidence mapping in this matrix.

## Matrix

| Area | PDF Requirement (evidence) | Current Repo State | Status | Exact Delta Needed |
|---|---|---|---|---|
| Execution order lock | Preserve phased execution and avoid drift (`tmi add on.txt`, p.768: “extend first, create second”; p.768: “avoid duplicates if existing article routing already exists”) | `docs/deployment/MASTER_EXECUTION_ORDER.md` already enforces phased gates and non-drift rule | ✅ aligned | Keep current order as source of truth; no scope jump before Phase C proof |
| Google indexing for chart/article lanes | Google-readable pages + structured data/schema for chart/article indexing (`tmi add on.txt`, p.551-554) | `docs/deployment/GOOGLE_ALIGNMENT_CHECKLIST.md` captures schema, canonical, robots/sitemap, CWV, GA4 | ✅ aligned at doc level | Implement checklist items in code lanes still missing (dynamic sitemap, canonical metadata coverage, chart schema lane) |
| Robots + sitemap foundation | Public crawlable + private disallow + sitemap (`GOOGLE_ALIGNMENT_CHECKLIST`) and Google crawl intent from PDF (`tmi add on.txt`, p.551-554) | `apps/web/src/app/robots.ts` and `apps/web/src/app/sitemap.ts` exist | 🟡 partial | Expand sitemap from static to dynamic article/artist/chart entries once slug contracts are frozen |
| Article slug lane | Editorial route should be slug-based and stable (`tmi add on.txt`, p.768 suggested `/magazine/article/[slug]`) | `apps/web/src/app/articles/[slug]/page.tsx` exists and fetches slug endpoint; API has `GET /editorial/articles/slug/:slug` published-only | ✅ aligned (contract) | Decide canonical route family (`/articles/[slug]` vs `/magazine/article/[slug]`) and lock redirects to avoid split indexing |
| JSON-LD on article pages | Structured data/schema required for Google indexing (`tmi add on.txt`, p.551-554) | `apps/web/src/app/articles/[slug]/page.tsx` emits `NewsArticle` JSON-LD via `components/seo/StructuredData.tsx` | ✅ aligned (baseline) | Add page-level canonical metadata generation and expand structured fields (publisher/logo/image) |
| Legacy ID article route handling | Avoid duplicate paths when route exists (`tmi add on.txt`, p.768) | `apps/web/src/app/articles/[articleId]/` folder exists but no handler file | ❌ gap | Add redirect/handler for legacy ID routes or remove empty route folder to prevent drift/confusion |
| Onboarding breadth | Guided onboarding for major user types fan/artist/producer/sponsor/mod/admin (`tmi add on.txt`, p.688 + p.493) | Current onboarding pages only for fan + artist (`/onboarding/fan`, `/onboarding/artist`) | ❌ gap | Add phased onboarding stubs/flows for sponsor, moderator, admin-safe surfaces, and producer-family roles (or explicitly defer in docs) |
| Artist profile as main hub | Artist profile should be central hub with optional nested sections (`tmi add on.txt`, p.766 + p.773) | No implemented `app/artist/[slug]` route in current `tmi-platform/apps/web/src/app` tree | ❌ gap | Create/extend artist profile route + sections; add minimal nested sub-routes only where needed |
| Artist signup → profile article auto-create | Phase C proof requires artist signup auto-creates article slug page and dashboard link (`MASTER_EXECUTION_ORDER.md`) | `users.service.ts` upserts `artistProfile`, but does not auto-create editorial article on onboarding completion; artist dashboard has no article link | ❌ critical gap | Add transactional chain on artist onboarding completion: ensure artist slug, create published-or-draft profile article, persist relation, expose dashboard link |
| Sponsor lifecycle requirement | Sponsor lifecycle join→verify→package→placement→ROI→renew (`tmi add on.txt`, p.482 + p.450) | Contest/sponsor components exist, but execution doc Phase E is intake-focused | 🟡 partial | Add explicit Sponsor Lifecycle matrix/checklist doc + admin lifecycle states to phase proof |
| Booking/ticketing integration | Booking/ticketing must connect venue+sponsor+rewards+recap+archive (`tmi add on.txt`, p.22141) | Not represented in current launch proof docs as mandatory pre-Phase C item | 🔵 deferred | Keep out of current critical path; add as post-Phase-F expansion gate to prevent scope creep |

## Conflicts to Resolve Before Implementation
1. **Route-family conflict risk**: PDF repeatedly suggests `/magazine/article/[slug]`; repo currently uses `/articles/[slug]`. Choose one canonical family and map permanent redirects.
2. **Phase C proof mismatch**: Docs require auto-create artist article, but code does not implement it yet.
3. **Onboarding scope mismatch**: PDF expects many role-specific onboarding paths; repo currently only supports fan/artist.
4. **Image-PDF blind spot**: one source PDF is image-based and not text-parsed; OCR pass is required to claim full-source parity.

## Recommended Next Order (Strict)
1. Lock canonical article route family and redirect rules.
2. Implement Phase C critical path only: artist onboarding completion → profile/article auto-create → dashboard link proof.
3. Add dynamic sitemap entries for stable slugs (articles + artists), then canonical metadata normalization.
4. Extend onboarding matrix docs to explicitly mark supported-now vs deferred roles.
5. Run OCR on the image-based PDF and perform a second delta pass before Phase D/F expansion.

## Evidence Anchors (from extracted text)
- Google SEO/chart indexing requirements: `temp_cleanup/pdf_extracts/tmi add on.txt` p.551-554
- Onboarding/support/help layer: `temp_cleanup/pdf_extracts/tmi add on.txt` p.688-689
- Sponsor lifecycle chain: `temp_cleanup/pdf_extracts/tmi add on.txt` p.482 and p.450
- Artist hub + route patterns + article editorial-first rule: `temp_cleanup/pdf_extracts/tmi add on.txt` p.766-768 and p.773-774
- Booking/ticketing connected-chain rule: `temp_cleanup/pdf_extracts/tmi add on.txt` around p.758 equivalent chain references
