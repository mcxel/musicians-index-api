export interface DirectMessage {
  id: string;
  threadId: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  sentAt: string;
}

const messages: DirectMessage[] = [];

export function sendDirectMessage(fromUserId: string, toUserId: string, body: string): DirectMessage {
  const threadId = [fromUserId, toUserId].sort().join(":");
  const message: DirectMessage = {
    id: `${threadId}:${Date.now()}`,
    threadId,
    fromUserId,
    toUserId,
    body,
    sentAt: new Date().toISOString(),
  };
  messages.push(message);
  return message;
}

export function listThreadMessages(threadId: string): DirectMessage[] {
  return messages.filter((entry) => entry.threadId === threadId);
}
