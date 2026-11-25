"use client";

/**
 * SubmissionsCanister — CANONICAL_WRAPPER (presentation router only).
 * Business authority remains:
 *   SubmissionManagementDrawer → SubmissionEngine → SubmissionEntitlementAuthority → JukeboxNumberAuthority
 * Fan → FanSubmissionCanister (consume-only / no creator POST — §11186 C).
 * Performer → PerformerSubmissionCanister (Stream&Win/Shuffle drawer + separate Beat Locker tab).
 * Admin → AdminSubmissionPanel.
 */

import FanSubmissionCanister from "@/components/canisters/FanSubmissionCanister";
import PerformerSubmissionCanister from "@/components/canisters/PerformerSubmissionCanister";
import AdminSubmissionPanel from "@/components/admin/AdminSubmissionPanel";

export type SubmissionsCanisterRole = "fan" | "performer" | "admin";

export interface SubmissionEntry {
  id: string;
  title: string;
  creatorName: string;
  category: string;
  status: string;
  priceCents?: number;
  submittedAt: number;
}

interface SubmissionsCanisterProps {
  role?: SubmissionsCanisterRole;
  userId?: string;
  displayName?: string;
  accentColor?: string;
  /** Stats → Submissions → Submit Beat */
  initialPerformerTab?: "destinations" | "beat_locker";
  /** @deprecated fake seed callback removed — kept optional for call-site compat */
  onSubmitNew?: (entry: Partial<SubmissionEntry>) => void;
}

export function SubmissionsCanister({
  role = "performer",
  userId = "",
  displayName = "Member",
  accentColor,
  initialPerformerTab,
}: SubmissionsCanisterProps) {
  if (role === "fan") {
    return (
      <FanSubmissionCanister
        userId={userId}
        displayName={displayName}
        accentColor={accentColor ?? "#FF2DAA"}
      />
    );
  }

  if (role === "admin") {
    return <AdminSubmissionPanel actorName={displayName || "BJM"} accentColor={accentColor ?? "#FFD700"} />;
  }

  return (
    <PerformerSubmissionCanister
      userId={userId}
      displayName={displayName}
      accentColor={accentColor ?? "#FFD700"}
      initialTab={initialPerformerTab}
    />
  );
}

export default SubmissionsCanister;
