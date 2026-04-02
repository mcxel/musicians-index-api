// apps/api/src/modules/social/social.module.ts
import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { PresenceGateway } from './presence.gateway';
import { SocialGateway } from './social.gateway';

@Module({
  controllers: [FriendsController, ConversationsController, MessagesController],
  providers: [
    FriendsService,
    ConversationsService,
    MessagesService,
    PresenceGateway,
    SocialGateway,
  ],
})
export class SocialModule {}
