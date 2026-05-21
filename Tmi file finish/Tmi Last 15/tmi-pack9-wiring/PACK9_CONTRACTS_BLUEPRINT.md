# PACK9_CONTRACTS_BLUEPRINT.md
## TypeScript Contract Definitions for Every Pack 9 System
## → Copilot creates these files in packages/contracts/src/

---

## economy.ts
```typescript
// packages/contracts/src/economy.ts

export type UserTier = 'free' | 'bronze' | 'gold' | 'diamond' | 'signature';
export type ArtistTier = 'free' | 'bronze' | 'gold' | 'diamond' | 'signature';

export interface PointsBalance {
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lastActivity: Date;
  roomEntryTier: UserTier;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;           // positive = earned, negative = spent
  action: PointsAction;
  eventId?: string;
  createdAt: Date;
}

export type PointsAction =
  | 'watch_event'
  | 'react_event'
  | 'vote_poll'
  | 'tip_sent'
  | 'first_daily_event'
  | 'streak_7day'
  | 'referral'
  | 'attend_premiere'
  | 'world_concert'
  | 'complete_profile'
  | 'subscription_bonus'
  | 'seat_upgrade'
  | 'vip_box'
  | 'backstage_pass'
  | 'reaction_pack'
  | 'room_tier_upgrade';

export interface Subscription {
  id: string;
  userId: string;
  tier: UserTier;
  artistTier?: ArtistTier;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodEnd: Date;
  stripeSubscriptionId?: string;
  paypalSubscriptionId?: string;
  createdAt: Date;
}

export interface ArtistEarnings {
  artistId: string;
  pendingBalance: number;    // not yet paid out
  totalEarned: number;
  lastPayoutDate?: Date;
  lastPayoutAmount?: number;
  payoutMethod: 'stripe' | 'paypal' | 'ach';
  payoutAccountId?: string;  // masked
  breakdown: {
    tips: number;
    vipTickets: number;
    backstagePasses: number;
    replayAccess: number;
    sponsoredEvents: number;
  };
}

export interface Payout {
  id: string;
  artistId: string;
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  method: 'stripe' | 'paypal' | 'ach';
  scheduledDate: Date;
  processedDate?: Date;
  stripeTransferId?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'flat_discount' | 'percent_discount' | 'free_tier_upgrade' | 'points_bonus' | 'event_access';
  value: number;
  validTiers: UserTier[];
  maxUses: number;
  usedCount: number;
  expiresAt: Date;
  createdBy: string;   // Big Ace only
  active: boolean;
}
```

---

## social.ts
```typescript
// packages/contracts/src/social.ts

export interface Follow {
  id: string;
  fanId: string;
  artistId: string;
  createdAt: Date;
}

export interface FanClubMembership {
  id: string;
  fanId: string;
  artistId: string;
  tier: FanClubTier;
  joinedAt: Date;
  pointsAtJoin: number;
  foundingMember: boolean;
}

export type FanClubTier = 'open' | 'member' | 'inner_circle' | 'vip_member' | 'founding_member';

export interface WatchParty {
  id: string;
  hostFanId: string;
  eventId: string;
  inviteCode: string;
  memberIds: string[];
  maxSize: number;
  createdAt: Date;
  status: 'waiting' | 'active' | 'ended';
}

export interface SearchResult {
  id: string;
  type: 'artist' | 'article' | 'event' | 'room' | 'genre';
  name: string;
  description?: string;
  thumbnailUrl?: string;
  tier?: string;
  rankNumber?: number;
  quickAction: 'follow' | 'join' | 'read' | 'browse';
  slug?: string;
}

export interface DiscoveryFeedItem {
  artistId: string;
  rankNumber: number;
  momentumScore: number;
  genre: string[];
  recentEventAt?: Date;
  thumbnailUrl?: string;
  displayName: string;
  followerCount: number;
}
```

---

## notifications.ts
```typescript
// packages/contracts/src/notifications.ts

export type NotificationType =
  | 'artist_live'
  | 'event_starting_15min'
  | 'event_starting_1min'
  | 'new_article'
  | 'tip_received'
  | 'points_milestone'
  | 'tier_upgrade'
  | 'show_result'
  | 'monthly_idol_round'
  | 'payout_processed'
  | 'platform_announcement'
  | 'emergency_alert';

export type NotificationChannel = 'push' | 'email' | 'in_app';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
  juliusDelivery?: boolean;   // shows Julius animation
}

export interface NotificationPreferences {
  userId: string;
  push: Partial<Record<NotificationType, boolean>>;
  email: Partial<Record<NotificationType, boolean>>;
  quietHoursStart: number;   // 0-23 in user timezone
  quietHoursEnd: number;
  digestMode: boolean;
}
```

---

## moderation.ts
```typescript
// packages/contracts/src/moderation.ts

export type ReportReason =
  | 'hate_speech'
  | 'spam'
  | 'explicit_content'
  | 'harassment'
  | 'misinformation'
  | 'other';

export type ModerationAction =
  | 'auto_mute'
  | 'content_removed'
  | 'account_warned'
  | 'account_suspended'
  | 'account_banned'
  | 'cleared';

export interface ModerationReport {
  id: string;
  reporterId: string;
  targetType: 'message' | 'profile' | 'content' | 'event';
  targetId: string;
  reason: ReportReason;
  note?: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  action?: ModerationAction;
  reviewedBy?: string;
  createdAt: Date;
  reviewedAt?: Date;
}

export interface FraudFlag {
  id: string;
  userId?: string;
  ipAddress?: string;
  flagType: 'fake_view' | 'fake_tip' | 'fake_follow' | 'bot_behavior' | 'payment_fraud';
  confidence: 'low' | 'medium' | 'high';
  status: 'pending' | 'confirmed' | 'cleared';
  escrowAmount?: number;
  createdAt: Date;
  resolvedAt?: Date;
}
```

---

## artist-tools.ts
```typescript
// packages/contracts/src/artist-tools.ts

export interface ScheduledEvent {
  id: string;
  artistId: string;
  eventType: 'live_stream' | 'cypher' | 'battle' | 'premiere' | 'concert';
  title: string;
  scheduledAt: Date;
  venue: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  calendarPriority: 'P1' | 'P2' | 'P3' | 'P4';
  conflictChecked: boolean;
}

export interface ArtistClip {
  id: string;
  artistId: string;
  eventId: string;
  triggerType: 'crowd_peak' | 'big_tip' | 'winner' | 'tier_upgrade' | 'spotlight' | 'reaction_spike' | 'fan_request';
  startTimestamp: number;   // seconds into stream
  endTimestamp: number;
  duration: number;
  status: 'pending_review' | 'approved' | 'rejected' | 'shared';
  fanRequestedBy?: string;
  approvedAt?: Date;
  shareUrls?: Record<string, string>;
  brandedUrl?: string;
}

export interface SeasonRound {
  id: string;
  seasonNumber: number;
  roundNumber: number;        // 1-4
  genre: string;
  startDate: Date;
  endDate: Date;
  competitorIds: string[];
  advancingIds: string[];
  status: 'upcoming' | 'active' | 'completed';
  hostIds: string[];
}

export interface ArtistAnalytics {
  artistId: string;
  period: 'day' | 'week' | 'month' | 'all_time';
  followers: number;
  newFollowers: number;
  eventsHosted: number;
  avgViewers: number;
  peakViewers: number;
  totalTips: number;
  totalEarnings: number;
  articleViews: number;
  repeatViewerRate: number;
  followerTierBreakdown: Record<string, number>;
}
```

---

## onboarding.ts
```typescript
// packages/contracts/src/onboarding.ts

export type OnboardingStep =
  | 'registration'
  | 'profile_setup'
  | 'index_registration'
  | 'first_article'
  | 'venue_unlock'
  | 'billing'
  | 'tutorial'
  | 'first_live_prompt';

export type FanOnboardingStep =
  | 'registration'
  | 'genre_selection'
  | 'first_event'
  | 'seat_assigned'
  | 'upgrade_prompt'
  | 'profile_optional';

export interface OnboardingProgress {
  userId: string;
  userType: 'artist' | 'fan';
  completedSteps: string[];
  currentStep: string;
  percentComplete: number;
  startedAt: Date;
  completedAt?: Date;
  skipCount: number;
}

export interface OnboardingStepConfig {
  stepId: string;
  title: string;
  required: boolean;
  pointsReward: number;
  timeoutHours?: number;
  reminderSchedule: number[];  // hours after start to send reminder
}
```

---

## sponsor.ts
```typescript
// packages/contracts/src/sponsor.ts

export type SponsorPlacementType =
  | 'event_presenting'
  | 'lower_third'
  | 'intro_bumper'
  | 'outro_bumper'
  | 'venue_side_screen'
  | 'magazine_ad'
  | 'vip_lounge_branding'
  | 'season_title';

export interface SponsorCampaign {
  id: string;
  brandName: string;
  placementType: SponsorPlacementType;
  assetUrl: string;
  ctaUrl?: string;
  impressionsTarget: number;
  impressionsActual: number;
  clicks: number;
  ctr: number;
  status: 'pending_approval' | 'active' | 'paused' | 'completed';
  approvedBy?: string;    // Big Ace only
  startDate: Date;
  endDate: Date;
}

export interface SponsorSlot {
  slotId: string;
  eventId?: string;
  venueId?: string;
  magazinePageId?: string;
  placementType: SponsorPlacementType;
  activeCampaignId?: string;
  visible: boolean;
}
```

---

## integrity.ts
```typescript
// packages/contracts/src/integrity.ts

export type EmergencyLevel = 'emergency' | 'announcement' | 'event_broadcast';

export interface EmergencyBroadcast {
  id: string;
  level: EmergencyLevel;
  title: string;
  body: string;
  triggeredBy: string;   // Big Ace only for emergency/announcement
  targetEventId?: string;  // for event_broadcast only
  dismissable: boolean;
  active: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface WaitlistEntry {
  id: string;
  fanId: string;
  eventId: string;
  venueId: string;
  queuePosition: number;
  notifiedAt?: Date;
  claimWindowSeconds: number;
  status: 'waiting' | 'offered' | 'claimed' | 'expired';
  overflowVenueId?: string;   // where they went while waiting
}
```

---

*Pack 9 Contracts Blueprint v1.0 — BerntoutGlobal XXL*
