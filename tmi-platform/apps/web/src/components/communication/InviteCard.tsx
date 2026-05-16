'use client';
// InviteCard.tsx — Room/battle/collab invite card — received on /invites
// Copilot wires: useInvites({ userId }) — fetches pending invites
// Proof: invites show, accept routes to room/event, decline removes invite
export function InviteCard({ inviteType, fromName, targetName, inviteId, onAccept, onDecline }: { inviteType: string; fromName: string; targetName?: string; inviteId: string; onAccept?: () => void; onDecline?: () => void }) {
  return (
    <div className="tmi-invite-card">
      <div className="tmi-invite-card__type">{inviteType.toUpperCase()} INVITE</div>
      <div className="tmi-invite-card__from">From: <strong>{fromName}</strong></div>
      {targetName && <div className="tmi-invite-card__target">To join: {targetName}</div>}
      <div className="tmi-invite-card__actions">
        <button className="tmi-btn-primary tmi-btn--sm" onClick={onAccept}>Accept</button>
        <button className="tmi-btn-ghost tmi-btn--sm" onClick={onDecline}>Decline</button>
      </div>
    </div>
  );
}
