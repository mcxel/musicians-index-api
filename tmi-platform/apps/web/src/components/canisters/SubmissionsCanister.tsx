"use client";

/**
 * SubmissionsCanister — role-aware router (Rule 26).
 * Fan → FanSubmissionCanister (no BeatLocker).
 * Performer / Admin → BeatLocker + competition destinations.
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
  /** @deprecated fake seed callback removed — kept optional for call-site compat */
  onSubmitNew?: (entry: Partial<SubmissionEntry>) => void;
}

export function SubmissionsCanister({
  role = "performer",
  userId = "",
  displayName = "Member",
  accentColor,
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
    />
  );
}

export default SubmissionsCanister;
