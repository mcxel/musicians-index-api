export type MessagingThreadParticipant = {
  userId: string;
  displayName: string;
  avatarUrl: string;
  role: string;
};

/** Counterparty in a thread — excludes the signed-in user when possible. */
export function peerThreadParticipant(
  participants: MessagingThreadParticipant[],
  selfId: string,
): MessagingThreadParticipant | undefined {
  return participants.find((p) => p.userId && p.userId !== selfId) ?? participants[0];
}
