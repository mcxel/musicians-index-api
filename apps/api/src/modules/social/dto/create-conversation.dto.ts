// apps/api/src/modules/social/dto/create-conversation.dto.ts
export class CreateConversationDto {
  readonly memberIds: string[];
  readonly name?: string;
}
