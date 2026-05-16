'use client';
// RequestQueuePanel.tsx — Pending requests: bookings, collabs, mic requests
// Copilot wires: useRequests(userId, { status:'pending' })
// Proof: pending requests load, respond actions work
export function RequestQueuePanel({ userId }: { userId: string }) {
  return (
    <div className="tmi-request-queue">
      <div className="tmi-request-queue__header">Pending Requests</div>
      <div className="tmi-request-queue__list" data-slot="requests">
        {/* Copilot maps request cards with accept/decline */}
      </div>
    </div>
  );
}
