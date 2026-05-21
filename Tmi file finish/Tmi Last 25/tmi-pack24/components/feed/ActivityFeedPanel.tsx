'use client';
// ActivityFeedPanel.tsx — Personalized activity feed
// Copilot wires: useActivityFeed(userId, { limit:20 })
// Proof: feed loads, pull-to-refresh works, stale items collapse
export function ActivityFeedPanel({ userId }: { userId: string }) {
  return (
    <div className="tmi-activity-feed" aria-label="Activity feed">
      <div className="tmi-activity-feed__header">
        <span className="tmi-section-label">What's Happening</span>
        <button className="tmi-btn-ghost tmi-btn--sm" aria-label="Refresh feed">↻</button>
      </div>
      <div className="tmi-activity-feed__items" data-slot="feed-items">
        {/* Copilot maps feed cards by type */}
      </div>
      <button className="tmi-btn-ghost tmi-activity-feed__load-more">Load Earlier</button>
    </div>
  );
}
