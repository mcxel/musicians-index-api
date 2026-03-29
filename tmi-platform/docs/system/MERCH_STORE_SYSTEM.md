# MERCH_STORE_SYSTEM.md
## Artist Merch Store — Physical and Digital Products
### BerntoutGlobal XXL / The Musician's Index

---

## CURRENT SCOPE (Phase 1 — Digital Only)

TMI Phase 1 handles digital products only:
- Beat licenses (handled by BEAT_MARKETPLACE_SYSTEM.md)
- Fan club exclusive content
- Digital downloads (unreleased tracks, samples, production templates)

Physical merch (T-shirts, etc.) is Phase 2 via Printful integration.

---

## DIGITAL PRODUCT TYPES

Artists can sell:
- Unreleased track downloads (MP3/WAV)
- Production sample packs
- Tutorial videos
- Exclusive song stems
- Personalized shoutout videos (time-based)
- Fan club exclusive content (via FAN_CLUB_SYSTEM.md)

---

## DIGITAL PRODUCT LISTING

```
Route: /dashboard/store (ARTIST)
Fields: title, description, price ($0.99 – $99.99), file upload, thumbnail
```

Purchase flow: Stripe PaymentIntent → on success → generate signed R2 download URL (24h expiry)

---

## PHASE 2: PHYSICAL MERCH (Post-Launch)

Phase 2 adds Printful integration:
- Artist uploads design
- Products: T-shirt, hoodie, poster, phone case
- Printful handles fulfillment/shipping
- Artist sets markup on Printful base price
- TMI takes 10% platform cut on physical sales

---

## ROUTES (Phase 1)

```
/store                    → platform store browser (all artists)
/store/[artistSlug]       → artist's store page
/store/[artistSlug]/[id]  → individual product
/dashboard/store          → artist store management (ARTIST auth)
```
