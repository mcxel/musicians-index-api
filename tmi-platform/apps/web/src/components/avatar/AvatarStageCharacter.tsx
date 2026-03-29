"use client";
// ============================================================
// AvatarStageCharacter
// TMI Platform — The Musicians Index
// ============================================================

import type { AvatarIdentity, AvatarPresenceState } from "@/systems/avatar";

export interface AvatarStageCharacterProps {
  identity: AvatarIdentity;
  presence: AvatarPresenceState;
  size?: "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  showTier?: boolean;
  className?: string;
}

export function AvatarStageCharacter({ identity, presence, size = "md", showName = true, showTier = false, className = "" }: AvatarStageCharacterProps) {
  const sizeMap = { sm: "w-12 h-12", md: "w-16 h-16", lg: "w-24 h-24", xl: "w-32 h-32" };

  return (
    <div
      className={`flex flex-col items-center gap-1 ${className}`}
      data-avatar-role="artist"
      data-zone="stage-mark"
    >
      <div className={`${sizeMap[size]} rounded-full bg-[#1a1a2e] border-2 border-[#ff6b35] flex items-center justify-center relative overflow-hidden`}>
        <span className="text-2xl">🎵</span>
        {presence.isReacting && (
          <div className="absolute inset-0 bg-[#ff6b35]/20 animate-pulse" />
        )}
      </div>
      {showName && (
        <span className="text-xs text-white font-medium truncate max-w-[80px]">{identity.displayName}</span>
      )}
      {showTier && (
        <span className="text-[10px] text-[#ff6b35] uppercase tracking-wide">{identity.tier}</span>
      )}
    </div>
  );
}

export default AvatarStageCharacter;
