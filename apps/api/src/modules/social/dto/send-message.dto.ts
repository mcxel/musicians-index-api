// apps/api/src/modules/social/dto/send-message.dto.ts
export class SendMessageDto {
  readonly conversationId: string;
  readonly senderId: string;
  readonly content: string;
}
