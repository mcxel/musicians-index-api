"use client";

/**
 * AccountCommandMenu — universal account control point adapter.
 * Delegates exclusively to UniversalAccountIdentityControl (Rule 31)
 * ensuring 100% convergence across all legacy and current mounts.
 */

import type { ReactNode } from "react";
import type { TierLevel } from "@/components/profile/DiamondTierBadge";
import UniversalAccountIdentityControl from "@/components/account/UniversalAccountIdentityControl";

export interface AccountCommandMenuProps {
  userId?: string;
  displayName?: string;
  avatarUrl?: string | null;
  tier?: TierLevel;
  accentColor?: string;
  compact?: boolean;
  trigger?: ReactNode;
}

export default function AccountCommandMenu({
  displayName = "Account",
  avatarUrl,
  compact = true,
}: AccountCommandMenuProps) {
  return (
    <UniversalAccountIdentityControl
      fallbackDisplayName={displayName}
      fallbackAvatarUrl={avatarUrl}
      compact={compact}
    />
  );
}
