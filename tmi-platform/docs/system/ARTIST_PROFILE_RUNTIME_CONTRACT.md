# ARTIST PROFILE RUNTIME CONTRACT
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED

---

## PURPOSE

Define the canonical runtime contract for `/artists/[slug]` as the artist hub surface.

---

## REQUIRED IDENTITY FIELDS

- `slug`
- `displayName`
- `avatarImage` or hero fallback
- `profileSummary`

---

## REQUIRED TIER / DIAMOND FIELDS

- `tierLabel`
- `diamondStatus`
- `featuredOrder` (future)
- `isVerified` (future)

Diamond status must take precedence over computed rank tiers when present.

---

## REQUIRED LINKAGE FIELDS

### Article linkage
- `profileArticleSlug`
- future recap/article references

### Booking entry
- booking entry status hook
- future venue/history summary hook

### Media locker hooks
- approved linked media count
- future preview source selector hook

### Stats / reputation hooks
- points summary
- battle record summary
- room/cypher participation summary
- sponsor surface summary

---

## PHASE BOUNDARY

Current scaffold supports:
- slug identity
- display fallback
- tier placeholder
- reserved surface panels

Current scaffold excludes:
- full booking logic
- full media locker logic
- sponsor logic
- editorial fetch wiring
- stats API wiring

---

## CONFORMANCE RULE

`/artists/[slug]` is the canonical artist hub route. Future artist-facing systems must attach here or explicitly declare why they do not.
