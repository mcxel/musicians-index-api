'use client';
// GreenRoomShell.tsx — Performer prep area before backstage
// Copilot wires: useGreenRoom(userId, eventId)
// Proof: performer can review set, check equipment
export function GreenRoomShell({ userId, eventId }: { userId: string; eventId: string }) {
  return (
    <div className="tmi-green-room" data-user-id={userId} data-event-id={eventId}>
      <div className="tmi-green-room-header">Green Room</div>
      <div data-slot="set-review">Set Review</div>
      <div data-slot="equipment-check">Equipment Check</div>
      <div data-slot="notes">Personal Notes</div>
      <button className="tmi-btn-primary">Move to Backstage</button>
    </div>
  );
}
