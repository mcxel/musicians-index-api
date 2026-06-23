export interface DirectMessageInput {
  recipientId: string;
  senderId: string;
  body: string;
}

export interface DirectMessageEngine {
  sendDirectMessage(input: DirectMessageInput): Promise<{ messageId: string }>;
}
