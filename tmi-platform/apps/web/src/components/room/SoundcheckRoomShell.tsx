'use client';
// SoundcheckRoomShell.tsx — Quick pre-live audio/video verification
// Copilot wires: useSoundcheck(userId, eventId)
// Proof: mic + video + beat preview all testable
export function SoundcheckRoomShell({ userId, eventId }: { userId: string; eventId: string }) {
  return (
    <div className="tmi-soundcheck" data-user-id={userId} data-event-id={eventId}>
      <div className="tmi-soundcheck-header">Soundcheck</div>
      <div className="tmi-soundcheck-grid">
        <div data-slot="mic-test"><button className="tmi-btn-ghost">Test Mic</button></div>
        <div data-slot="video-test"><button className="tmi-btn-ghost">Test Video</button></div>
        <div data-slot="beat-test"><button className="tmi-btn-ghost">Test Beat Preview</button></div>
      </div>
      <button className="tmi-btn-primary">All Good — Ready</button>
    </div>
  );
}
