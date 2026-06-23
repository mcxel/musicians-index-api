export interface GroupChatInput {
  groupId: string;
  senderId: string;
  body: string;
}

export interface GroupChatEngine {
  sendGroupMessage(input: GroupChatInput): Promise<{ messageId: string }>;
  addParticipant(groupId: string, userId: string): Promise<void>;
}
