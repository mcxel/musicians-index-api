# MAGAZINE AD PAGE — TEMPORARY PRESENTATION LAW
2026-09-19

Marcel confirms the supplied advertising-gallery screenshot is **TEMPORARY REFERENCE ONLY**.

## Functional behavior to establish (now)

- dense ad browsing
- multiple ad sizes
- mixed image/video creative
- placement selection
- advertiser identity
- scrolling gallery
- preview
- purchasing/activation path

## Do NOT

- freeze that screenshot's visual design as canonical TMI Magazine styling
- clone Facebook or pictured businesses
- rebuild commerce when Magazine visuals are later upgraded

## Architecture

```
PERMANENT BUSINESS/MEDIA AUTHORITIES
        ↓
REUSABLE MAGAZINE AD DATA MODEL
        ↓
TEMPORARY MARKETPLACE PRESENTATION
```

Later:

```
SAME AUTHORITIES + SAME DATA
        ↓
FINAL FUTURISTIC TMI MAGAZINE EXPERIENCE
```

## PERMANENT

- advertiser identity
- campaign IDs
- creative/media IDs
- secure submission
- approval/moderation
- inventory
- placement IDs
- pricing
- purchase/entitlement state
- analytics
- Living Media Player integration
- Administration inspection

## TEMPORARY / REPLACEABLE

- gallery composition
- card appearance
- spacing
- column treatment
- placement-browser styling
- other interim presentation details

## Classification (exit report)

`FUNCTIONALLY_READY_TEMPORARY_PRESENTATION`

**Not:** `FINAL_VISUAL_COMPLETE` · `PHYSICAL_GREEN`

## Pricing note

- `$0.99/day` advertising entry (`AD_ENTRY_DAY_099`) remains applicable where that product applies
- Premium Magazine placements retain their own truthful prices

## Push / Deploy

- **PUSH AUTHORIZED** (Sponsor + Advertiser + Admin slice including temporary Magazine ad marketplace)
- **DEPLOY NOT AUTHORIZED**

Canonical data: `MagazineAdMarketplaceDataModel.ts`  
Temporary UI: `MagazineAdMarketplaceTemporaryPresentation.tsx`  
Route: `/magazine/advertise`
