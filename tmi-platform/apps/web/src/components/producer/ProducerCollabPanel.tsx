'use client';
// ProducerCollabPanel.tsx — Collab history and active collab requests
// Copilot wires: useProducerCollabs(producerId)
// Proof: collab history loads, invites can be sent
export function ProducerCollabPanel({ producerId }: { producerId: string }) {
  return (
    <div className="tmi-producer-collab">
      <div className="tmi-producer-collab__header">Collaborations</div>
      <div className="tmi-producer-collab__list" data-slot="collabs">
        {/* Copilot maps collab history */}
      </div>
      <button className="tmi-btn-primary tmi-btn--sm">Invite Artist to Collab</button>
    </div>
  );
}
