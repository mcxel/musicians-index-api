# PRISMA_SCHEMA_DELTA.md
## New Database Models — Add to packages/db/prisma/schema.prisma
### BerntoutGlobal XXL / The Musician's Index

These models extend the existing schema. Add them to the appropriate sections.
Run `npx prisma migrate dev --name pack25_delta` after adding.

---

```prisma
// ── NOTIFICATIONS ─────────────────────────────────────────

model Notification {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        String   // 'live_started' | 'battle_invite' | 'tip_received' | 'crown_earned' etc.
  title       String
  body        String
  href        String?
  isRead      Boolean  @default(false)
  metadata    Json?    // type-specific extra data
  createdAt   DateTime @default(now())

  @@index([userId, isRead])
  @@index([userId, createdAt])
}

model NotificationPreference {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      String  // notification type
  channel   String  // 'app' | 'push' | 'email'
  enabled   Boolean @default(true)

  @@unique([userId, type, channel])
}

// ── FEED ──────────────────────────────────────────────────

model FeedItem {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        String   // 'live_started' | 'battle_result' | 'beat_drop' | 'crown_change' etc.
  weight      Int      @default(5)
  entityId    String?
  entityType  String?
  data        Json
  createdAt   DateTime @default(now())
  expiresAt   DateTime

  @@index([userId, createdAt])
}

// ── WALLET & ECONOMY ──────────────────────────────────────

model Wallet {
  id               String       @id @default(cuid())
  userId           String       @unique
  user             User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  availableBalance Int          @default(0)  // in cents
  pendingBalance   Int          @default(0)  // in cents, 7-day hold
  lifetimeEarnings Int          @default(0)
  stripeAccountId  String?      // Stripe Connect account
  stripeOnboarded  Boolean      @default(false)
  fanCredits       Int          @default(0)
  transactions     Transaction[]
  payouts          Payout[]
}

model Transaction {
  id          String   @id @default(cuid())
  walletId    String
  wallet      Wallet   @relation(fields: [walletId], references: [id])
  type        String   // 'tip_in' | 'tip_out' | 'beat_sale' | 'booking_fee' | 'payout' | 'credit_purchase' | 'platform_fee'
  amount      Int      // in cents, positive = credit, negative = debit
  fee         Int      @default(0)  // Stripe/platform fee in cents
  netAmount   Int      // amount - fee
  status      String   // 'pending' | 'completed' | 'failed' | 'reversed'
  stripeId    String?
  referenceId String?  // tipId, beatLicenseId, bookingId, etc.
  note        String?
  createdAt   DateTime @default(now())

  @@index([walletId, createdAt])
}

model Payout {
  id              String   @id @default(cuid())
  walletId        String
  wallet          Wallet   @relation(fields: [walletId], references: [id])
  amount          Int      // in cents
  status          String   // 'queued' | 'processing' | 'paid' | 'failed'
  stripePayoutId  String?
  createdAt       DateTime @default(now())
  processedAt     DateTime?
  failureReason   String?
}

model Tip {
  id          String   @id @default(cuid())
  fromUserId  String
  toArtistId  String
  roomId      String?
  amount      Int      // in cents
  artistShare Int      // 70% of amount
  platformFee Int      // 30% of amount
  status      String   // 'pending' | 'held' | 'credited' | 'refunded'
  heldUntil   DateTime?
  stripeId    String
  createdAt   DateTime @default(now())

  @@index([toArtistId, createdAt])
  @@index([fromUserId, createdAt])
}

// ── FAN CLUBS ─────────────────────────────────────────────

model FanClub {
  id          String             @id @default(cuid())
  artistId    String             @unique
  description String?
  tiers       FanClubTier[]
  memberships FanClubMembership[]
  posts       FanClubPost[]
  createdAt   DateTime           @default(now())
}

model FanClubTier {
  id          String  @id @default(cuid())
  fanClubId   String
  fanClub     FanClub @relation(fields: [fanClubId], references: [id])
  name        String  // 'supporter' | 'vip' | 'platinum'
  priceMonthly Int    // in cents
  perks       String[] // list of perk descriptions
  stripePriceId String?
}

model FanClubMembership {
  id            String   @id @default(cuid())
  fanClubId     String
  fanClub       FanClub  @relation(fields: [fanClubId], references: [id])
  userId        String
  tier          String
  status        String   // 'active' | 'cancelled' | 'past_due'
  stripeSubId   String?
  startedAt     DateTime @default(now())
  cancelledAt   DateTime?

  @@unique([fanClubId, userId])
  @@index([fanClubId, tier])
}

model FanClubPost {
  id          String   @id @default(cuid())
  fanClubId   String
  fanClub     FanClub  @relation(fields: [fanClubId], references: [id])
  content     String
  mediaUrl    String?
  minTier     String   @default("supporter") // minimum tier to see
  createdAt   DateTime @default(now())
}

// ── BEAT MARKETPLACE ──────────────────────────────────────

model Beat {
  id           String       @id @default(cuid())
  producerId   String
  slug         String       @unique
  title        String
  genre        String
  bpm          Int
  key          String?
  tags         String[]
  previewUrl   String       // 30s tagged preview
  taggedUrl    String       // full tagged demo
  basicPrice   Int          // in cents
  premiumPrice Int          // in cents
  exclusivePrice Int?       // in cents, optional
  status       String       @default("draft")  // 'draft' | 'published' | 'unpublished'
  playCount    Int          @default(0)
  licenses     BeatLicense[]
  createdAt    DateTime     @default(now())

  @@index([genre, status])
  @@index([status, createdAt])
}

model BeatLicense {
  id          String   @id @default(cuid())
  beatId      String
  beat        Beat     @relation(fields: [beatId], references: [id])
  buyerId     String
  type        String   // 'basic' | 'premium' | 'exclusive'
  price       Int      // in cents, price at time of purchase
  stripeId    String
  downloadUrl String?  // clean wav/mp3 download URL
  createdAt   DateTime @default(now())

  @@unique([beatId, buyerId, type])  // one license type per beat per buyer
}

// ── COMPETITIONS & SEASONS ───────────────────────────────

model Season {
  id           String       @id @default(cuid())
  slug         String       @unique
  name         String       // 'Season 2026 Q1'
  status       String       // 'upcoming' | 'active' | 'finals_week' | 'closed'
  startDate    DateTime
  endDate      DateTime
  rankEntries  RankEntry[]
  competitions Competition[]
  awards       SeasonAward[]
  createdAt    DateTime     @default(now())
}

model Competition {
  id           String       @id @default(cuid())
  slug         String       @unique
  seasonId     String?
  season       Season?      @relation(fields: [seasonId], references: [id])
  name         String
  type         String       // 'solo_battle' | 'tag_team' | 'grand_cypher' | 'producer_showcase'
  bracketType  String       // 'single_elim' | 'double_elim' | 'round_robin'
  status       String       // 'upcoming' | 'open' | 'in_progress' | 'completed'
  maxEntrants  Int?
  registrations CompetitionRegistration[]
  battles      Battle[]
  createdAt    DateTime     @default(now())
}

model CompetitionRegistration {
  id            String      @id @default(cuid())
  competitionId String
  competition   Competition @relation(fields: [competitionId], references: [id])
  artistId      String
  seed          Int?
  status        String      // 'registered' | 'seeded' | 'eliminated' | 'champion'
  createdAt     DateTime    @default(now())

  @@unique([competitionId, artistId])
}

model Battle {
  id            String      @id @default(cuid())
  competitionId String?
  competition   Competition? @relation(fields: [competitionId], references: [id])
  roomId        String?
  artist1Id     String
  artist2Id     String
  winnerId      String?
  round         Int?
  status        String      // 'scheduled' | 'live' | 'completed'
  voteCount1    Int         @default(0)
  voteCount2    Int         @default(0)
  createdAt     DateTime    @default(now())
}

model RankEntry {
  id        String   @id @default(cuid())
  seasonId  String
  season    Season   @relation(fields: [seasonId], references: [id])
  artistId  String
  points    Int      @default(0)
  rank      Int?
  updatedAt DateTime @updatedAt

  @@unique([seasonId, artistId])
  @@index([seasonId, points])
}

model SeasonAward {
  id        String  @id @default(cuid())
  seasonId  String
  season    Season  @relation(fields: [seasonId], references: [id])
  artistId  String
  awardType String  // 'champion' | 'runner_up' | 'most_discovered' | 'best_producer' | 'top_venue'
  awardedAt DateTime @default(now())
}

// ── USER SETTINGS ─────────────────────────────────────────

model UserSettings {
  id                String  @id @default(cuid())
  userId            String  @unique
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  // Privacy
  profileVisibility String  @default("public")  // 'public' | 'followers' | 'private'
  showOnlineStatus  Boolean @default(true)
  allowMessages     String  @default("followers")  // 'all' | 'followers' | 'none'
  allowFriendRequests Boolean @default(true)
  // Notifications handled in NotificationPreference table
  // Display
  reducedMotion     Boolean @default(false)
  highContrast      Boolean @default(false)
  // Account
  deletionRequestedAt DateTime?
  deletionScheduledAt DateTime?  // 30 days after request
  exportRequestedAt   DateTime?
  exportDownloadUrl   String?
  exportExpiresAt     DateTime?
}

// ── MODERATION ────────────────────────────────────────────

model Report {
  id            String   @id @default(cuid())
  reporterId    String
  targetType    String   // 'user' | 'room' | 'article' | 'beat' | 'message' | 'chat'
  targetId      String
  category      String   // 'spam' | 'harassment' | 'copyright' | 'csam' | 'impersonation' | 'other'
  detail        String?
  status        String   @default("pending")  // 'pending' | 'reviewed' | 'actioned' | 'dismissed'
  severity      String   @default("p3")  // 'p0' | 'p1' | 'p2' | 'p3'
  reviewedBy    String?
  createdAt     DateTime @default(now())
  reviewedAt    DateTime?

  @@index([status, severity])
  @@index([targetType, targetId])
}

model ModerationAction {
  id          String   @id @default(cuid())
  targetUserId String
  actionType  String   // 'warn' | 'mute' | 'kick' | 'suspend' | 'ban'
  reason      String
  duration    Int?     // in hours, null = permanent
  performedBy String
  reportId    String?
  createdAt   DateTime @default(now())
  expiresAt   DateTime?

  @@index([targetUserId])
}

// ── FAMILY / KID ACCOUNTS ─────────────────────────────────

model FamilyAccount {
  id        String         @id @default(cuid())
  parentId  String         @unique
  parent    User           @relation(fields: [parentId], references: [id])
  children  ChildAccount[]
  createdAt DateTime       @default(now())
}

model ChildAccount {
  id               String        @id @default(cuid())
  familyAccountId  String
  familyAccount    FamilyAccount @relation(fields: [familyAccountId], references: [id])
  userId           String        @unique
  user             User          @relation(fields: [userId], references: [id])
  birthYear        Int
  performerStatus  String        @default("not_requested")  // 'not_requested' | 'pending_approval' | 'approved' | 'denied'
  // Parent permission flags
  canUploadMedia   Boolean       @default(false)
  canBePublic      Boolean       @default(false)
  canReceiveMessages Boolean     @default(false)  // kid-to-kid only if true
  canJoinEvents    Boolean       @default(false)
  canMakePurchases Boolean       @default(false)
  spendingLimitCents Int?
  parentApprovedAt DateTime?
  createdAt        DateTime      @default(now())
}

model ParentApproval {
  id          String   @id @default(cuid())
  parentId    String
  childId     String
  actionType  String   // 'performer_request' | 'purchase' | 'event_join' | 'message_enable' | 'media_upload'
  status      String   @default("pending")  // 'pending' | 'approved' | 'denied'
  requestData Json?
  createdAt   DateTime @default(now())
  decidedAt   DateTime?

  @@index([parentId, status])
  @@index([childId])
}

// ── BLOCK / MUTE ──────────────────────────────────────────

model UserBlock {
  id          String   @id @default(cuid())
  blockerId   String
  blockedId   String
  createdAt   DateTime @default(now())

  @@unique([blockerId, blockedId])
}

model UserMute {
  id        String   @id @default(cuid())
  muterId   String
  mutedId   String
  expiresAt DateTime?
  createdAt DateTime @default(now())

  @@unique([muterId, mutedId])
}

// ── PUSH SUBSCRIPTIONS ────────────────────────────────────

model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String   @unique
  p256dh    String
  auth      String
  platform  String   // 'web' | 'ios' | 'android'
  createdAt DateTime @default(now())

  @@index([userId])
}
```
