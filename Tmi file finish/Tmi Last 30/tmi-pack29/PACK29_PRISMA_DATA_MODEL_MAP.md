# PACK29_PRISMA_DATA_MODEL_MAP.md
## Exact Prisma Models — All New Models for Pack 28+29 Systems
### BerntoutGlobal XXL / The Musician's Index

Append these models to packages/db/prisma/schema.prisma in the order shown.
All models from Pack 25 are already defined. This adds the remaining systems.

---

## MONETIZATION / ADVERTISING MODELS

```prisma
enum CampaignStatus {
  DRAFT
  PENDING_REVIEW
  APPROVED
  ACTIVE
  PAUSED
  COMPLETED
  REJECTED
  CANCELLED
}

enum SlotReservationStatus {
  TENTATIVE     // bot-reserved, pending payment
  CONFIRMED     // payment received
  ACTIVE        // currently running
  EXPIRED       // never paid
  RELEASED      // cancelled by advertiser
  COMPLETED     // ran its full duration
}

enum LeadStatus {
  DISCOVERED
  CONTACTED
  QUALIFIED
  PROPOSAL_SENT
  NEGOTIATING
  RESERVED
  APPROVED
  PAID
  ACTIVE
  COMPLETED
  RENEWAL_DUE
  LOST
}

enum ProposalStatus {
  DRAFT
  SENT
  VIEWED
  ACCEPTED
  DECLINED
  EXPIRED
  REVISED
}

model Advertiser {
  id              String   @id @default(cuid())
  userId          String?  @unique  // null if bot-created lead, set on account creation
  companyName     String
  contactName     String?
  contactEmail    String
  contactPhone    String?
  website         String?
  category        String   // music_gear, venues, fashion, food, tech, local, other
  isVerified      Boolean  @default(false)
  isBanned        Boolean  @default(false)
  monthlyBudget   Int?     // in cents, self-reported
  stripeCustomerId String?
  campaigns       AdCampaign[]
  creatives       AdCreative[]
  crmEntry        SalesCRMEntry?
  createdAt       DateTime @default(now())

  @@index([contactEmail])
  @@index([category])
}

model AdCampaign {
  id              String          @id @default(cuid())
  advertiserId    String
  advertiser      Advertiser      @relation(fields: [advertiserId], references: [id])
  name            String
  status          CampaignStatus  @default(DRAFT)
  packageTier     String          // 'starter'|'basic'|'standard'|'premium'|'takeover'
  surfaces        String[]        // ['homepage','articles','games','shows','rooms']
  startDate       DateTime?
  endDate         DateTime?
  budgetCents     Int             // total campaign budget
  spentCents      Int             @default(0)
  stripePaymentId String?
  reservations    AdSlotReservation[]
  creatives       AdCreative[]
  impressions     Int             @default(0)
  clicks          Int             @default(0)
  rejectionReason String?
  approvedBy      String?
  approvedAt      DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([advertiserId, status])
  @@index([status, startDate])
}

model AdSlotReservation {
  id            String                @id @default(cuid())
  campaignId    String
  campaign      AdCampaign            @relation(fields: [campaignId], references: [id])
  slotId        String                // e.g. 'HOME_ADV_TILE_1', 'ART_INLINE_1'
  surfaceType   String                // 'homepage'|'article'|'game'|'show'|'room'
  status        SlotReservationStatus @default(TENTATIVE)
  startDate     DateTime
  endDate       DateTime
  priceCents    Int
  heldUntil     DateTime?             // tentative hold expiry (24h)
  creativeId    String?
  creative      AdCreative?           @relation(fields: [creativeId], references: [id])
  targetingJson Json?                 // { genre, geo, device, ageGroup }
  createdAt     DateTime              @default(now())

  @@index([slotId, status])
  @@index([slotId, startDate, endDate])
}

model AdCreative {
  id             String     @id @default(cuid())
  advertiserId   String
  advertiser     Advertiser @relation(fields: [advertiserId], references: [id])
  campaignId     String?
  campaign       AdCampaign? @relation(fields: [campaignId], references: [id])
  type           String     // 'image'|'video'|'text_tile'
  status         String     // 'pending_review'|'approved'|'rejected'
  imageUrl       String?
  videoUrl       String?
  headline       String?    // max 40 chars
  bodyText       String?    // max 100 chars
  ctaLabel       String?    // max 20 chars
  ctaUrl         String?
  brandName      String
  rejectionNote  String?
  reviewedBy     String?
  reservations   AdSlotReservation[]
  createdAt      DateTime   @default(now())
}

model AdImpression {
  id          String   @id @default(cuid())
  slotId      String
  campaignId  String
  userId      String?
  sessionId   String?
  surface     String
  device      String   // 'mobile'|'desktop'|'tablet'
  geo         String?
  createdAt   DateTime @default(now())

  @@index([campaignId, createdAt])
  @@index([slotId, createdAt])
}

model AdClick {
  id          String   @id @default(cuid())
  slotId      String
  campaignId  String
  userId      String?
  sessionId   String?
  surface     String
  createdAt   DateTime @default(now())

  @@index([campaignId, createdAt])
}

model HouseAd {
  id          String   @id @default(cuid())
  type        String   // 'subscription_upsell'|'booking_promo'|'beat_drop'|'fan_credits'|'merch'|'advertise_here'
  headline    String
  bodyText    String?
  ctaLabel    String
  ctaUrl      String
  imageUrl    String?
  priority    Int      @default(5)   // lower = higher priority
  isActive    Boolean  @default(true)
  surfaces    String[] // which surfaces this can appear on
  createdAt   DateTime @default(now())
}
```

---

## SPONSOR MODELS

```prisma
enum SponsorContractStatus {
  DRAFT
  NEGOTIATING
  PENDING_SIGNATURE
  ACTIVE
  COMPLETED
  CANCELLED
}

model SponsorLead {
  id              String     @id @default(cuid())
  companyName     String
  contactEmail    String
  contactName     String?
  budget          String?    // 'under_500'|'500_1000'|'1000_5000'|'5000_plus'
  interest        String?    // what surface/product they're interested in
  status          LeadStatus @default(DISCOVERED)
  assignedBotId   String?
  crmEntry        SalesCRMEntry?
  createdAt       DateTime   @default(now())
}

model SponsorContract {
  id              String                @id @default(cuid())
  sponsorName     String
  sponsorEmail    String
  slotId          String                // e.g. 'HOME_EDITORIAL_SPONSOR_STRIP'
  surfaceType     String
  priceCents      Int
  startDate       DateTime
  endDate         DateTime
  isExclusive     Boolean               @default(false)
  exclusivityNote String?
  status          SponsorContractStatus @default(DRAFT)
  signedAt        DateTime?
  approvedBy      String?               // must be Big Ace for exclusivity deals
  customTerms     String?
  stripeInvoiceId String?
  createdAt       DateTime              @default(now())
}
```

---

## SALES CRM MODELS

```prisma
model SalesCRMEntry {
  id              String     @id @default(cuid())
  advertiserId    String?    @unique
  advertiser      Advertiser? @relation(fields: [advertiserId], references: [id])
  leadId          String?    @unique
  sponsorLead     SponsorLead? @relation(fields: [leadId], references: [id])
  status          LeadStatus @default(DISCOVERED)
  source          String     // 'bot_discovered'|'inbound_form'|'referral'|'cold_outreach'
  notes           SalesNote[]
  proposals       CampaignProposal[]
  assignedTo      String?    // userId of sales person or bot id
  lastContactAt   DateTime?
  nextFollowUpAt  DateTime?
  estimatedValue  Int?       // in cents, projected campaign value
  wonLostReason   String?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}

model SalesNote {
  id          String       @id @default(cuid())
  crmEntryId  String
  crmEntry    SalesCRMEntry @relation(fields: [crmEntryId], references: [id])
  authorId    String       // userId or bot id
  content     String
  isBot       Boolean      @default(false)
  createdAt   DateTime     @default(now())
}

model CampaignProposal {
  id              String         @id @default(cuid())
  crmEntryId      String
  crmEntry        SalesCRMEntry  @relation(fields: [crmEntryId], references: [id])
  status          ProposalStatus @default(DRAFT)
  recommendedTier String
  recommendedSlots String[]
  estimatedReach  Int?
  proposedPriceCents Int
  discountPct     Int            @default(0)  // only bots can apply up to 10% without approval
  customTerms     String?        // requires human approval if set
  sentAt          DateTime?
  viewedAt        DateTime?
  expiresAt       DateTime?
  createdByBot    Boolean        @default(false)
  approvedBy      String?        // required if discount > 10% or custom terms present
  createdAt       DateTime       @default(now())
}
```

---

## PARTY LOBBY MODELS

```prisma
enum PartyPresenceStatus {
  IN_LOBBY
  IN_ROOM
  IN_GAME
  IN_SHOW
  IN_CONTEST
  AWAY
  DISCONNECTED
}

model Party {
  id          String        @id @default(cuid())
  name        String?
  hostId      String
  isPublic    Boolean       @default(false)
  inviteCode  String        @unique @default(cuid())
  status      String        @default("active")  // 'active'|'disbanded'
  themeScene  String?       // optional scene override for party lobby BG
  members     PartyMember[]
  messages    PartyMessage[]
  createdAt   DateTime      @default(now())
  disbandedAt DateTime?
  expiresAt   DateTime?     // auto-disband if empty > 60 min

  @@index([status, createdAt])
}

model PartyMember {
  id              String              @id @default(cuid())
  partyId         String
  party           Party               @relation(fields: [partyId], references: [id], onDelete: Cascade)
  userId          String
  role            String              @default("member")  // 'host'|'co-host'|'member'
  presenceStatus  PartyPresenceStatus @default(IN_LOBBY)
  destinationId   String?
  destinationType String?             // 'room'|'game'|'show'|'contest'
  isReady         Boolean             @default(false)
  videoEnabled    Boolean             @default(false)
  micEnabled      Boolean             @default(true)
  lastSeenAt      DateTime            @default(now())
  joinedAt        DateTime            @default(now())

  @@unique([partyId, userId])
  @@index([partyId, presenceStatus])
}

model PartyMessage {
  id        String   @id @default(cuid())
  partyId   String
  party     Party    @relation(fields: [partyId], references: [id], onDelete: Cascade)
  userId    String
  content   String
  type      String   @default("text")  // 'text'|'reaction'|'system'
  createdAt DateTime @default(now())

  @@index([partyId, createdAt])
}
```

---

## GAME MODELS

```prisma
enum GameSessionStatus {
  LOBBY         // pre-game, players joining
  COUNTDOWN     // 3-2-1 before start
  ACTIVE        // round in progress
  INTERMISSION  // between rounds
  ENDED         // game over
}

model GameSession {
  id            String            @id @default(cuid())
  gameType      String            // 'trivia'|'name_that_tune'|'deal_or_feud'|'beat_challenge'|'lyric_cipher'
  roomId        String?
  status        GameSessionStatus @default(LOBBY)
  hostId        String
  maxPlayers    Int               @default(8)
  currentRound  Int               @default(0)
  totalRounds   Int               @default(10)
  sponsorId     String?           // linked campaign/reservation
  seasonId      String?
  isRanked      Boolean           @default(false)  // counts for season points
  players       GamePlayer[]
  startedAt     DateTime?
  endedAt       DateTime?
  winnerUserId  String?
  createdAt     DateTime          @default(now())

  @@index([status, gameType])
  @@index([roomId])
}

model GamePlayer {
  id            String      @id @default(cuid())
  sessionId     String
  session       GameSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  userId        String
  score         Int         @default(0)
  placement     Int?
  isEliminated  Boolean     @default(false)
  joinedAt      DateTime    @default(now())

  @@unique([sessionId, userId])
  @@index([sessionId, score])
}
```

---

## EDITORIAL MODELS

```prisma
enum ArticleStatus {
  DRAFT
  IN_REVIEW
  APPROVED
  PUBLISHED
  UNPUBLISHED
  ARCHIVED
}

model Article {
  id              String        @id @default(cuid())
  slug            String        @unique
  authorId        String
  title           String
  subtitle        String?
  bodyMd          String        // markdown body
  coverImageUrl   String?
  category        String        // 'music_news'|'tabloid'|'interview'|'studio_recap'|'local'|'science'
  tags            String[]
  status          ArticleStatus @default(DRAFT)
  isSponsored     Boolean       @default(false)
  sponsorName     String?
  sponsorUrl      String?
  templateId      String?       // A/B/C/D/E template
  viewCount       Int           @default(0)
  adSlots         ArticleAdSlot[]
  publishedAt     DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([status, publishedAt])
  @@index([category, status])
}

model ArticleAdSlot {
  id              String              @id @default(cuid())
  articleId       String
  article         Article             @relation(fields: [articleId], references: [id])
  slotId          String              // e.g. 'ART_INLINE_1'
  reservationId   String?
  reservation     AdSlotReservation?  @relation(fields: [reservationId], references: [id])
  isActive        Boolean             @default(true)
  createdAt       DateTime            @default(now())

  @@unique([articleId, slotId])
}
```

---

## STREAM & WIN MODEL

```prisma
model StreamWinScore {
  id              String   @id @default(cuid())
  userId          String   @unique
  weeklyScore     Int      @default(0)
  lifetimeScore   Int      @default(0)
  currentStreak   Int      @default(0)
  lastEventAt     DateTime?
  updatedAt       DateTime @updatedAt
}

model StreamWinEvent {
  id        String   @id @default(cuid())
  userId    String
  eventType String   // 'stream_listen'|'room_join'|'show_attend'|'game_play'|'daily_login'|'follow_artist'
  points    Int
  createdAt DateTime @default(now())

  @@index([userId, createdAt])
}
```
