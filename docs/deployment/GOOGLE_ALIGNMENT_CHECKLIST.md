# Google Alignment Checklist (TMI)

Purpose: capture Google-recommended implementation areas and map them to TMI launch priorities.

## 1) Indexing Rules
- Keep public pages indexable: homepage, article pages, artist pages, chart pages, media kit, sponsor/advertiser pages.
- Keep private routes non-indexed: admin, dashboard, internal tools, API paths.
- Maintain `robots.ts` with explicit disallow list for private routes.

## 2) Sitemap Foundation
- Keep `sitemap.ts` with stable public routes only in Phase 1.
- Add dynamic article/artist/chart entries only after slug contracts are stable.
- Split to multiple sitemap files once content volume grows.

## 3) Canonical URL Contract
- Article URLs are slug-based (`/articles/[slug]`) and must remain stable.
- Add canonical metadata for public pages.
- Avoid exposing temporary ID routes in metadata.

## 4) Structured Data (JSON-LD)
- Article pages: `NewsArticle`.
- Artist pages: `MusicGroup` or `Person`/`MusicGroup` depending on profile model.
- Keep JSON-LD generator reusable and server-rendered.

## 5) Core Web Vitals
Targets:
- LCP < 2.5s
- CLS < 0.1
- INP < 200ms

Actions:
- Optimize images and lazy loading.
- Keep route bundles lean.
- Cache with CDN and revalidation strategy.

## 6) Mobile-First and Accessibility
- Validate homepage, auth, onboarding, dashboard shell, artist page, article page on mobile.
- Respect reduced-motion mode in avatar/live systems.
- Keep semantic headings, alt text, and keyboard support.

## 7) Analytics + Search Console
- Use GA4 via `@next/third-parties/google` and a single GA env variable.
- Verify domain in Google Search Console.
- Submit sitemap and monitor indexing/crawl coverage.

## 8) Metadata Consistency
- Lock `metadataBase` and canonical domain to TMI production domain.
- Keep Open Graph + Twitter metadata aligned to production URLs.

## 9) Internal Linking Graph
- Artist profile ↔ artist article page.
- Article ↔ related artist/poll/chart pages.
- Homepage ↔ charts/articles/discovery lanes.

## 10) Security and Trust Signals
- HTTPS enforced.
- Spam/fraud protections on forms and auth.
- No private route leakage to index.

## Implementation Order (to avoid drift)
1. Lock slug contracts (`/articles/[slug]`).
2. Then apply robots/sitemap/canonical/JSON-LD.
3. Then expand dynamic sitemap and advanced schema coverage.

## Done/Now Snapshot
- `app/robots.ts` present.
- `app/sitemap.ts` present (static foundation).
- Slug-based article route in progress/required for stable indexing contract.
- GA4 should be wired via Next third-parties component.
