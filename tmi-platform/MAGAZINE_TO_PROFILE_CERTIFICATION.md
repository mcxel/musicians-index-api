# TMI Platform — Magazine to Profile Certification
Generated: 2026-06-14

The TMI Magazine is the discovery layer of the platform. This audit verifies two-way data routing between Magazine editorial content and the operational platform ecosystem.

## Two-Way Routing Certification

| Connection Path | Direction 1 (Magazine → Profile) | Direction 2 (Profile → Magazine) | Status |
|---|---|---|---|
| **Performer Articles** | Article links to `/performers/[slug]` | Profile links to featured articles | ✅ WIRED (Watch Live & Playlist CTAs added) |
| **Writer Articles** | Article author links to `/writer/[slug]` | Writer profile lists authored articles | ❌ NO |
| **Venue Articles** | Article links to `/venue/[slug]` | Venue profile highlights features | ❌ NO |
| **Sponsor Features** | Article links to `/sponsor/[slug]` | Sponsor profile lists active campaigns | ❌ NO |

## Ecosystem Cross-Linking Verification

| Ecosystem Layer | Integration Requirement | Current Runtime Status |
|---|---|---|
| **Magazine ↔ Live Room** | Live articles embed `MaskedVideoTile` / routing to active room | ⚠️ PARTIAL ("Watch Live" CTA buttons added) |
| **Magazine ↔ Playlist** | Articles embed `MediaPlayer` for featured tracks | ⚠️ PARTIAL ("Playlist" CTA buttons added) |
| **Magazine ↔ Memory Wall** | Article publication automatically generates a Memory | ❌ NO (`MemoryGeneratorService` missing) |
| **Magazine ↔ Arena** | Battle/Cypher recap articles route directly to `/arena` | ⚠️ PARTIAL (Hardcoded links exist) |

## Article Template Certification

| Template Type | Purpose | Wired to Platform Data? |
|---|---|---|
| **Template A** | Standard Feature (Artist/Performer) | ⚠️ Rendered statically via `NewsArticleModel.ts` |
| **Template B** | Split Spread | ❌ Not dynamically wired |
| **Template C** | Full Sponsor Page | ❌ Not dynamically wired to `AdCampaign` DB |
| **Template D** | News Stack | ⚠️ Rendered statically |
| **Template E** | Interview (Writer) | ❌ Not dynamically wired |

## Required Next Steps
1. Wire the `writerSlug` in `NewsArticleModel.ts` to generate dynamic links to Writer Hubs.
2. Update `ProfileLobbyRuntime` to fetch and display articles where `relatedPerformerSlug` matches the profile.

**Verdict:** The Magazine system currently functions as a static publication. It must be wired into the Live Routing Engine so it reacts to platform state (e.g., embedding live WebRTC feeds directly into articles).