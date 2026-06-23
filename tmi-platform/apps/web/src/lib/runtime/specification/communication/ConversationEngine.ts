export interface ConversationSummary {
  conversationId: string;
  title: string;
  participantIds: string[];
  unreadCount: number;
  updatedAtMs: number;
}

export interface ConversationEngine {
  listConversations(userId: string): Promise<ConversationSummary[]>;
  markConversationRead(conversationId: string, userId: string): Promise<void>;
}
