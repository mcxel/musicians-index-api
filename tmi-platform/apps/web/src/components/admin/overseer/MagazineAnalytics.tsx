"use client";

/**
 * Rule 20: Issue 1 inventory only — no vanity views/shares/ad revenue.
 * In-Overseer Intelligence slot (scrubbed for Phase 5 soft-launch close).
 */

import MagazineAnalyticsPanel from "@/components/admin/MagazineAnalyticsPanel";

export default function MagazineAnalytics() {
  return (
    <div style={{ height: "100%", minHeight: 200, overflow: "auto", padding: 4 }}>
      <MagazineAnalyticsPanel />
    </div>
  );
}
