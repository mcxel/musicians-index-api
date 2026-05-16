export type GroupMessage = {
  id: string;
  groupId: string;
  userId: string;
  body: string;
  createdAt: string;
};

const groupMembers = new Map<string, Set<string>>();
const groupMessages = new Map<string, GroupMessage[]>();

export function joinGroup(groupId: string, userId: string): number {
  const members = groupMembers.get(groupId) ?? new Set<string>();
  members.add(userId);
  groupMembers.set(groupId, members);
  return members.size;
}

export function leaveGroup(groupId: string, userId: string): number {
  const members = groupMembers.get(groupId) ?? new Set<string>();
  members.delete(userId);
  groupMembers.set(groupId, members);
  return members.size;
}

export function listGroupMembers(groupId: string): string[] {
  return Array.from(groupMembers.get(groupId) ?? []);
}

export function sendGroupMessage(groupId: string, userId: string, body: string): GroupMessage {
  const entry: GroupMessage = {
    id: `${groupId}:${userId}:${Date.now()}`,
    groupId,
    userId,
    body,
    createdAt: new Date().toISOString(),
  };

  const messages = groupMessages.get(groupId) ?? [];
  groupMessages.set(groupId, [...messages, entry]);
  return entry;
}

export function listGroupMessages(groupId: string): GroupMessage[] {
  return groupMessages.get(groupId) ?? [];
}
