import { Module } from "@nestjs/common";
import { HealthModule } from "./modules/health/health.module";
import { TicketsModule } from "./modules/tickets/tickets.module";
import { AuthModule } from "./modules/auth/auth.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { UsersModule } from "./modules/users/users.module";
import { ContestModule } from "./modules/contest/contest.module";
import { EmailModule } from "./modules/email/email.module";
import { EditorialModule } from "./modules/editorial/editorial.module";
import { PresenceModule } from "./modules/presence/presence.module";

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    TicketsModule,
    AuthModule,
    UsersModule,
    ContestModule,
    EmailModule,
    EditorialModule,
    PresenceModule,
  ],
})
export class AppModule {}
