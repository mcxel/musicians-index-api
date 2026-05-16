'use client';
// ProducerInvitePanel.tsx — Invite an artist to join producer's room
// Copilot wires: useSendInvite(type:'producer_collab')
// Proof: invite sends, artist receives notification
export function ProducerInvitePanel({ producerId }: { producerId: string }) {
  return (
    <div className="tmi-producer-invite">
      <div className="tmi-producer-invite__header">Invite Artists</div>
      <div className="tmi-producer-invite__search" data-slot="artist-search">
        <input className="tmi-input" placeholder="Search artists by handle..." />
      </div>
      <button className="tmi-btn-primary">Send Invite</button>
    </div>
  );
}
