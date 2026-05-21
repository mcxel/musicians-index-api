# PACK29_REPO_FILE_PLACEMENT_MAP.md
## Exact Repo Placement — Every File from Pack 28, Zero Guessing
### BerntoutGlobal XXL / The Musician's Index

LEGEND: NEW=create | EDIT=extend existing | LOCKED=never touch | APPEND=add to bottom only

---

## packages/db/prisma/schema.prisma — APPEND ONLY

Append these model groups in order. Never delete or rename existing models.

```
Append Group A: Monetization
  Advertiser, AdvertiserProfile, AdCampaign, AdSlotReservation,
  AdCreative, AdImpression, AdClick, CampaignProposal,
  SponsorContract, SponsorLead, HouseAd, SlotInventory

Append Group B: Party Lobby
  Party, PartyMember, PartyMessage  (defined in PACK29_PRISMA_DATA_MODEL_MAP.md)

Append Group C: Games
  GameSession, GamePlayer  (defined in PACK29_PRISMA_DATA_MODEL_MAP.md)

Append Group D: Editorial
  Article, ArticleVersion, ArticleAdSlot, ArticleTemplate

Append Group E: Acquisition
  SalesCRMEntry, SalesNote, ProposalTemplate

Migration command after all appends:
  npx prisma migrate dev --name pack29_monetization_party_games
  npx prisma generate
```

---

## apps/api/src/ — NEW MODULES

Each module = new folder. Never touch existing modules.

```
apps/api/src/modules/monetization/
  monetization.module.ts          NEW  Root module — registers all ad services
  slot-registry.service.ts        NEW  Returns available/booked slots
  slot-reservation.service.ts     NEW  Reserve, hold, confirm, expire slots
  campaign.service.ts             NEW  Campaign CRUD + status transitions
  campaign.controller.ts          NEW  REST endpoints for campaigns
  ad-renderer.service.ts          NEW  Returns creative for a given slotId
  pricing.service.ts              NEW  Package + tier pricing logic
  analytics.service.ts            NEW  Impression/click tracking
  billing.service.ts              NEW  Invoice + Stripe campaign billing
  house-ad.service.ts             NEW  Fallback house ad selection

apps/api/src/modules/advertiser/
  advertiser.module.ts            NEW
  advertiser.controller.ts        NEW  /api/advertiser + /api/advertiser/dashboard
  advertiser.service.ts           NEW  Advertiser account management
  creative.service.ts             NEW  Creative upload + approval

apps/api/src/modules/sponsor/
  sponsor.module.ts               NEW
  sponsor.controller.ts           NEW  /api/sponsor endpoints
  sponsor.service.ts              NEW  Sponsor deal + contract management

apps/api/src/modules/sales-crm/
  sales-crm.module.ts             NEW
  lead.service.ts                 NEW  Lead lifecycle management
  proposal.service.ts             NEW  Proposal generation
  proposal.controller.ts          NEW  /api/admin/sales/proposals
  contract.service.ts             NEW  Contract approval

apps/api/src/modules/party-lobby/
  party-lobby.module.ts           NEW
  party-lobby.controller.ts       NEW  /api/party REST endpoints
  party-lobby.service.ts          NEW  Party CRUD + membership
  party-lobby.gateway.ts          NEW  WebSocket /ws/party namespace

apps/api/src/modules/games/
  games.module.ts                 NEW
  games.controller.ts             NEW  /api/games REST endpoints
  games.service.ts                NEW  Game session management
  games.gateway.ts                NEW  WebSocket /ws/game namespace

apps/api/src/modules/editorial/
  editorial.module.ts             NEW
  editorial.controller.ts         NEW  /api/editorial endpoints
  editorial.service.ts            NEW  Article CRUD + publish workflow
  article-ads.service.ts          NEW  Article slot selection + rendering

apps/api/src/modules/stream-win/
  stream-win.module.ts            NEW
  stream-win.controller.ts        NEW  /api/stream-win
  stream-win.service.ts           NEW  Score tracking + rewards

apps/api/src/modules/home-composition/
  home-composition.module.ts      NEW
  home-composition.controller.ts  NEW  /api/home/composition
  home-composition.service.ts     NEW  Belt assembly from all belt services

apps/api/src/bots/monetization/
  ad-placement.bot.ts             NEW  Fills open slots
  ad-rotation.bot.ts              NEW  Rotates inventory by rules
  brand-safety.bot.ts             NEW  Blocks bad combos
  ctr-optimizer.bot.ts            NEW  Promotes better creatives
  expiration.bot.ts               NEW  Removes ended campaigns
  house-ad-fallback.bot.ts        NEW  Swaps to house ads
  prospect-scout.bot.ts           NEW  Finds advertiser leads
  outreach.bot.ts                 NEW  Sends qualified outreach
  proposal.bot.ts                 NEW  Generates proposals
  renewal.bot.ts                  NEW  Flags campaigns nearing end
  party-match.bot.ts              NEW  Suggests destinations for parties
  cover-generator.bot.ts          NEW  Assembles weekly TMI cover
```

---

## apps/api/src/ — EDIT EXISTING (smallest patch)

```
apps/api/src/main.ts              EDIT  Register new modules (append to imports array)
apps/api/src/app.module.ts        EDIT  Add: MonetizationModule, PartyLobbyModule,
                                         GamesModule, EditorialModule, HomeCompositionModule
```

---

## apps/web/src/ — NEW FILES

```
apps/web/src/app/(main)/page.tsx          EDIT  Replace stub with HomeSectionRenderer
apps/web/src/app/(main)/layout.tsx        LOCKED  Provider chain — never touch

apps/web/src/app/party/
  page.tsx                               NEW  Party browser
  create/page.tsx                        NEW  Create party
  [partyId]/page.tsx                     NEW  Party lobby screen
  [partyId]/invite/page.tsx              NEW  Invite link page

apps/web/src/app/games/
  page.tsx                               NEW  Game browser
  [type]/page.tsx                        NEW  Game type lobby (trivia, name-that-tune, etc.)
  [type]/[sessionId]/page.tsx            NEW  Active game session

apps/web/src/app/advertise/
  page.tsx                               NEW  Advertiser overview
  packages/page.tsx                      NEW  Pricing packages
  pricing/page.tsx                       NEW  Full slot pricing table
  homepage/page.tsx                      NEW  Homepage ad products
  articles/page.tsx                      NEW  Article ad products
  shows/page.tsx                         NEW  Show/live ad products
  games/page.tsx                         NEW  Game ad products
  rooms/page.tsx                         NEW  Room ad products
  creative-specs/page.tsx                NEW  Creative spec sheet

apps/web/src/app/sponsor/
  page.tsx                               NEW  Sponsor overview
  presented-by/page.tsx                  NEW  "Presented by" product
  season/page.tsx                        NEW  Season sponsor product
  contact/page.tsx                       NEW  Sponsor contact form

apps/web/src/app/editorial/
  page.tsx                               NEW  Magazine article homepage
  [slug]/page.tsx                        NEW  Article page
  category/[cat]/page.tsx               NEW  Category page

apps/web/src/app/dashboard/advertiser/
  page.tsx                               NEW  Campaign overview
  campaigns/page.tsx                     NEW  All campaigns
  campaigns/new/page.tsx                 NEW  Create campaign
  creatives/page.tsx                     NEW  Creative assets
  billing/page.tsx                       NEW  Billing + invoices
  analytics/page.tsx                     NEW  Performance data

apps/web/src/app/admin/homepage/
  page.tsx                               NEW  Belt editor
apps/web/src/app/admin/advertisers/
  page.tsx                               NEW  Advertiser list
apps/web/src/app/admin/campaigns/
  page.tsx                               NEW  All campaigns
  approvals/page.tsx                     NEW  Creative approval queue
apps/web/src/app/admin/slots/
  page.tsx                               NEW  Slot inventory
apps/web/src/app/admin/sales/
  page.tsx                               NEW  Sales CRM
  leads/page.tsx                         NEW  Lead pipeline
  proposals/page.tsx                     NEW  Proposal list
  contracts/page.tsx                     NEW  Contract management
apps/web/src/app/admin/house-ads/
  page.tsx                               NEW  House ad manager

apps/web/src/components/tmi-design/
  TMILogo.tsx                            NEW
  TMIBeltHeader.tsx                      NEW
  TMILiveBadge.tsx                       NEW
  TMIRankOverlay.tsx                     NEW
  TMICountdownTimer.tsx                  NEW
  TMIStarCTA.tsx                         NEW
  TMIGenreHoneycomb.tsx                  NEW
  TMIGlowCard.tsx                        NEW
  TMIGoldCard.tsx                        NEW
  TMICrownBadge.tsx                      NEW
  TMIAdDisclosure.tsx                    NEW
  TMILightningBolt.tsx                   NEW

apps/web/src/components/home/belts/
  BeltCover.tsx                          NEW
  BeltLiveWorld.tsx                      NEW
  BeltEditorial.tsx                      NEW
  BeltDiscovery.tsx                      NEW
  BeltMarketplace.tsx                    NEW
  BeltTrends.tsx                         NEW
  BeltAdvertiser.tsx                     NEW
  BeltPartyTeaser.tsx                    NEW
  HomeSectionRenderer.tsx               NEW  Renders belt array from API

apps/web/src/components/monetization/
  AdRenderer.tsx                         NEW  Universal slot renderer
  SponsorStrip.tsx                       NEW
  HouseAdFallback.tsx                    NEW
  AdDisclosureLabel.tsx                  NEW
  AdWidgetCard.tsx                       NEW
  AdCountdownSponsor.tsx                 NEW
  AdLowerThird.tsx                       NEW
  AdStickyMobile.tsx                     NEW

apps/web/src/components/party-lobby/
  PartyLobbyShell.tsx                    NEW
  PartyLobbyMini.tsx                     NEW  Compact in-destination bar
  PartyMemberRail.tsx                    NEW
  PartyChatPanel.tsx                     NEW
  PartyVideoTiles.tsx                    NEW
  PartyDestinationPicker.tsx             NEW
  PartyReadyPanel.tsx                    NEW

apps/web/src/components/games/
  GameLobbyShell.tsx                     NEW
  GameActiveShell.tsx                    NEW
  GameScoreBoard.tsx                     NEW
  GameTimerCircle.tsx                    NEW
  GameQuestionCard.tsx                   NEW
  GameEndScreen.tsx                      NEW

apps/web/src/components/scenes/
  SceneNeonClub.tsx                      NEW
  SceneRooftopCity.tsx                   NEW
  SceneStudioGold.tsx                    NEW
  SceneConcertArena.tsx                  NEW
  SceneUndergroundCypher.tsx             NEW
  SceneVirtualGrid.tsx                   NEW
  SceneThemeConfig.ts                    NEW
```

---

## LOCKED FILES — NEVER TOUCH

```
apps/web/src/app/(main)/layout.tsx           Root provider chain
apps/web/src/app/(auth)/register/page.tsx    Working registration
apps/web/src/app/(auth)/login/page.tsx       Working login
apps/web/src/app/onboarding/page.tsx         Working onboarding
apps/web/src/app/streamwin/page.tsx          Stream & Win wired
packages/hud-runtime/src/                   HUD runtime — locked
packages/hud-theme/src/                     Theme tokens — locked
apps/web/src/features/rooms/RoomInfrastructureProvider.tsx
apps/web/src/features/live/SharedStageProvider.tsx
apps/web/src/features/live/StageQueueProvider.tsx
```

---

## RISKY FILES — SMALLEST PATCH ONLY

```
apps/api/src/main.ts              Add module registrations only, nothing else
apps/api/src/app.module.ts        Append to imports array only
packages/db/prisma/schema.prisma  Append new models only, never touch existing
apps/web/src/app/middleware.ts    Append child route blocking only
```
