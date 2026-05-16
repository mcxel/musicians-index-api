const lobbyQueue = new Map<string, string[]>();

export function enqueueLobbyUser(lobbyId: string, userId: string): number {
  const queue = lobbyQueue.get(lobbyId) ?? [];
  if (!queue.includes(userId)) queue.push(userId);
  lobbyQueue.set(lobbyId, queue);
  return queue.length;
}

export function dequeueLobbyUser(lobbyId: string): string | null {
  const queue = lobbyQueue.get(lobbyId) ?? [];
  const next = queue.shift() ?? null;
  lobbyQueue.set(lobbyId, queue);
  return next;
}

export function getLobbyQueue(lobbyId: string): string[] {
  return [...(lobbyQueue.get(lobbyId) ?? [])];
}
