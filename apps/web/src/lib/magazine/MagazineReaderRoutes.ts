/**
 * Magazine reader route barrel — CLIENT-SAFE URL helpers only.
 *
 * Server-only page index / crawl text: `@/lib/magazine/MagazineReaderServer`
 * Server-only article resolve: `@/lib/magazine/getArticleBySlug`
 *
 * Do not reintroduce Prisma / MagazineRotationEngine imports here — that
 * pulled pg into DiscoveryRail / home client chunks (webpack factory crash).
 */

export {
  MAGAZINE_CANONICAL_READER,
  MAGAZINE_DEFAULT_START_PAGE,
  magazineReaderArticleUrl,
  magazineReaderUrl,
} from "@/lib/magazine/MagazineReaderUrls";
