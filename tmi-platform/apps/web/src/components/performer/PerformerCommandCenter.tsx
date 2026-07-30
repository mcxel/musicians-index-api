"use client";

import CommandCenterShell from "@/components/commandCenter/CommandCenterShell";

interface PerformerCommandCenterProps {
  performerId: string;
  displayName: string;
}

/** Shared Command Center chrome — performer drawer payloads (Rule 26). */
export default function PerformerCommandCenter({
  performerId,
  displayName,
}: PerformerCommandCenterProps) {
  return (
    <CommandCenterShell role="performer" userId={performerId} displayName={displayName} />
  );
}
