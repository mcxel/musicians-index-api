
# FULL PRISMA SCHEMA — PACK 37

## 55+ New/Updated Models

### Auth & Identity
User, Session, Account

### Profiles  
Profile, FanProfile, Artist, ArtistMember

### Venue & Events
Venue, VenueManager, VenueSection, VenueRoom, VenueStaffAssignment,
Event, ArtistEvent, BookingRequest, TicketTier, Ticket

### Commerce
Product, Cart, CartItem, Order, OrderItem

### Economy
Wallet, Transaction, PointsLedger, EarningsRecord

### Content
Article, ArticleComment, ArticleLike, Tag, Issue

### Advertising
Sponsor, Advertiser, Campaign, AdCreative, Placement, Sponsorship, AnalyticsEvent

### Social
Conversation, ConversationMember, Message, Friendship, Follow, Notification

### Media
Upload, Playlist, Livestream

### Live/Games
Room, RoomMember, GameSession, GamePlayer, GameRound, AudienceVote, CrownRecord

### Economy Items
ItemDefinition, UserInventory, OwnedItem, AvatarLoadout

### Automation
Bot, BotTask, BotLog

### Safety/Admin
ModerationReport, ModerationActionRecord, AdminAuditLog, SupportTicket, FeatureFlag

### Cross-Device
DeviceLinkSession

### Rewards
Subscription, Discount, Referral, UserReward, UserBadge

## Migration Command
```bash
cd packages/db
pnpm prisma migrate dev --name pack37_full_schema
pnpm prisma generate
```

## IMPORTANT
- Append-only: never remove existing models
- All models include: createdAt, updatedAt, soft delete where appropriate
- All models include: status fields, visibility fields, ownership fields
- All financial models: requiresBigAce flag on anything touching real money
- Discovery law enforced: Room model indexed on viewer_count ASC
- Kid safety: ConversationMember.canSendMessage gates all message flows
