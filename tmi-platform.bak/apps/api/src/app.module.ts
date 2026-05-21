import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { HealthModule } from "./modules/health/health.module";
import { TicketsModule } from "./modules/tickets/tickets.module";
import { AuthModule } from "./modules/auth/auth.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { UsersModule } from "./modules/users/users.module";
import { ContestModule } from "./modules/contest/contest.module";
import { EmailModule } from "./modules/email/email.module";
import { EditorialModule } from "./modules/editorial/editorial.module";
import { PresenceModule } from "./modules/presence/presence.module";
import { SearchModule } from "./modules/search/search.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { FeedModule } from "./modules/feed/feed.module";
import { TipsModule } from "./modules/tips/tips.module";
import { WalletModule } from "./modules/wallet/wallet.module";
import { CreditsModule } from "./modules/credits/credits.module";
import { RewardsModule } from "./modules/rewards/rewards.module";
import { MediaModule } from "./modules/media/media.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { AvatarModule } from "./modules/avatar/avatar.module";
import { BookingModule } from "./modules/booking/booking.module";
import { BotsModule } from "./modules/bots/bots.module";
import { ModerationModule } from "./modules/moderation/moderation.module";
import { ProfileModule } from "./modules/profile/profile.module";
import { RoomsModule } from "./modules/rooms/rooms.module";
import { SponsorsModule } from "./modules/sponsors/sponsors.module";
// New modules — gap closure phase
import { LobbyModule } from "./modules/lobby/lobby.module";
import { PartyModule } from "./modules/party/party.module";
import { JuliusModule } from "./modules/julius/julius.module";
import { EventsModule } from "./modules/events/events.module";
import { StoreModule } from "./modules/store/store.module";
import { FriendsModule } from "./modules/friends/friends.module";
import { MessagesModule } from "./modules/messages/messages.module";
import { AchievementsModule } from "./modules/achievements/achievements.module";
import { ChatModule } from "./modules/chat/chat.module";
import { VenueBookingModule } from "./modules/venue-booking/venue-booking.module";
import { EconomyModule } from "./modules/economy/economy.module";

@Module({
  imports: [
    // BullMQ — global Redis connection (lazyConnect so API boots without Redis locally)
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? '127.0.0.1',
        port: Number(process.env.REDIS_PORT ?? 6379),
        // Allow API to start even when Redis is not available locally
        lazyConnect: true,
        enableOfflineQueue: true,
        maxRetriesPerRequest: null,
      },
    }),

    // Core infrastructure
    PrismaModule,
    HealthModule,
    AuthModule,
    EmailModule,

    // Users & Profiles
    UsersModule,
    ProfileModule,
    AvatarModule,

    // Content & Editorial
    EditorialModule,
    FeedModule,
    SearchModule,

    // Social & Presence
    PresenceModule,
    NotificationsModule,
    ModerationModule,

    // Social Graph
    FriendsModule,
    MessagesModule,

    // Live World — Rooms, Lobbies, Parties
    RoomsModule,
    LobbyModule,
    PartyModule,

    // Real-time Chat Gateway
    ChatModule,

    // Julius AI System
    JuliusModule,

    // Events & Tickets
    EventsModule,
    TicketsModule,

    // Economy & Payments
    WalletModule,
    CreditsModule,
    TipsModule,
    RewardsModule,
    EconomyModule,

    // Store
    StoreModule,

    // Media & Streaming
    MediaModule,

    // Booking & Venue Discovery
    BookingModule,
    VenueBookingModule,

    // Contests & Competitions
    ContestModule,

    // Achievements
    AchievementsModule,

    // Sponsors & Ads
    SponsorsModule,

    // Bots & Automation
    BotsModule,

    // Analytics
    AnalyticsModule,

    // Admin
    AdminModule,
  ],
})
export class AppModule {}
