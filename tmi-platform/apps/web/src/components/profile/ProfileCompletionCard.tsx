'use client';
// ProfileCompletionCard.tsx — Profile completion progress with action items
// Copilot wires: useProfileCompletion(userId) — returns pct and missing items
// Proof: percentage is correct, action items are actionable
export function ProfileCompletionCard({ userId }: { userId: string }) {
  return (
    <div className="tmi-profile-completion">
      <div className="tmi-profile-completion__header">Profile Strength</div>
      <div className="tmi-profile-completion__bar">
        <div className="tmi-profile-completion__fill" style={{ width:'60%' }} />
      </div>
      <div className="tmi-profile-completion__pct" data-slot="pct">60%</div>
      <div className="tmi-profile-completion__actions" data-slot="missing-items">
        {/* Copilot maps: add photo, link music, add bio, link social */}
      </div>
    </div>
  );
}
