// apps/api/src/modules/social/dto/respond-friend-request.dto.ts
export class RespondFriendRequestDto {
  readonly requestId: string;
  readonly response: 'accept' | 'decline';
}
