"use client";

/**
 * FanAvatarCanister.tsx
 * Canonical 3D Fan Avatar Canister surface (Rule 26 + 28).
 * Pipeline: Authenticated Fan → AvatarGlbRegistry → Foundry GLB → AvatarViewer
 * When unbound: honest CANONICAL_AVATAR_NOT_BOUND diagnostic — never a production capsule.
 * Performers retain live camera/video presentation (no avatar ownership UI).
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  bindAvatarToSeat,
  startAvatarSeatBindingEngine,
  type AvatarSeatBinding,
} from "@/lib/avatar/AvatarSeatBindingEngine";
import {
  DEFAULT_FAN_AVATAR_GLB_SLOT,
  FOUNDRY_AVATAR_AUTHORITY,
  resolveAvatarViewportBinding,
  type AvatarGlbSlotId,
} from "@/lib/avatars/AvatarGlbRegistry";
import {
  AvatarViewer,
  preloadFoundryAvatarGlb,
  type AvatarExpressionId,
  type FoundryMorphCapability,
} from "@/components/3d/AvatarLobbyCanvas";

export type CanisterExpression = AvatarExpressionId;

export interface FanAvatarCanisterProps {
  pure3dAvatarOnly?: boolean;
  userId: string;
  displayName: string;
  role: string;
  avatarUrl?: string | null;
  faceScanActive?: boolean;
  roomId?: string;
  seatId?: string;
  tierColor?: string;
  /** Override default Fan GLB slot (must still be certified to mount mesh). */
  glbSlotId?: AvatarGlbSlotId;
  onSeatBound?: (binding: AvatarSeatBinding) => void;
  className?: string;
}

function UnboundAvatarViewport({
  tierColor,
  diagnostic,
  message,
  missingArtifact,
}: {
  tierColor: string;
  diagnostic: string;
  message: string;
  missingArtifact: string | null;
}) {
  return (
    <div
      data-avatar-binding={diagnostic}
      className="relative w-full h-full min-h-[160px] flex flex-col items-center justify-center gap-2 px-3"
      style={{
        background: `radial-gradient(ellipse at center, ${tierColor}12 0%, transparent 70%)`,
      }}
    >
      {/* Honest silhouette — not a finished mesh, not a glowing capsule */}
      <div
        aria-hidden
        style={{
          width: 56,
          height: 110,
          borderRadius: "28px 28px 18px 18px",
          border: `1.5px dashed ${tierColor}55`,
          background: "transparent",
          opacity: 0.55,
        }}
      />
      <span
        className="text-[9px] font-black uppercase tracking-widest text-center"
        style={{ color: "#FF2DAA" }}
      >
        {diagnostic}
      </span>
      <span className="text-[8px] text-white/45 text-center leading-snug max-w-[240px]">
        {message}
      </span>
      {missingArtifact && (
        <span className="text-[7px] font-mono text-white/30 text-center break-all max-w-[260px]">
          Missing: {missingArtifact}
        </span>
      )}
      <span className="text-[7px] text-cyan-400/50 uppercase tracking-wider">
        {FOUNDRY_AVATAR_AUTHORITY.rigVersion} · {FOUNDRY_AVATAR_AUTHORITY.recipeId}
      </span>
    </div>
  );
}

export default function FanAvatarCanister({
  userId,
  displayName,
  role,
  faceScanActive = true,
  roomId,
  seatId,
  tierColor = "#00FFFF",
  glbSlotId = DEFAULT_FAN_AVATAR_GLB_SLOT,
  onSeatBound,
  className = "",
}: FanAvatarCanisterProps) {
  const isFanRole = ["FAN", "USER", "SUPERADMIN", "ADMIN"].includes(role.toUpperCase());
  const [binding, setBinding] = useState<AvatarSeatBinding>(() =>
    startAvatarSeatBindingEngine(userId),
  );
  const [expression, setExpression] = useState<CanisterExpression>("neutral");
  const [morphCap, setMorphCap] = useState<FoundryMorphCapability | null>(null);

  const viewport = useMemo(() => resolveAvatarViewportBinding(glbSlotId), [glbSlotId]);
  const isBound = viewport.diagnostic === "OK" && Boolean(viewport.glbUrl);
  const motionOk = viewport.motionPackageSupported;
  // NEUTRAL always safe (all weights 0). SMILE only when post-sanitize deltas remain.
  const smileOk = Boolean(morphCap?.smileUsable);
  const facialDriverWired = morphCap !== null;

  const onMorphCapability = useCallback((cap: FoundryMorphCapability) => {
    setMorphCap(cap);
  }, []);

  // Start Foundry GLB fetch as soon as binding is OK — before/alongside Canvas mount —
  // so drawer remounts hit a ready (or in-flight) cache instead of a fresh hang.
  useEffect(() => {
    if (isBound && viewport.glbUrl) {
      setMorphCap(null);
      preloadFoundryAvatarGlb(viewport.glbUrl);
    }
  }, [isBound, viewport.glbUrl]);

  useEffect(() => {
    if (roomId && seatId) {
      const bound = bindAvatarToSeat(userId, seatId, roomId);
      setBinding(bound);
      onSeatBound?.(bound);
    }
  }, [userId, roomId, seatId, onSeatBound]);

  if (!isFanRole) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border border-[#FF2DAA]/40 bg-[#07030f] text-white ${className}`}
      >
        <span className="text-[9px] font-black text-[#FF2DAA] uppercase tracking-widest mb-1">
          PERFORMER PRESENTATION MODE
        </span>
        <span className="text-xs font-bold">{displayName}</span>
        <span className="text-[8px] text-white/40 mt-1">Real camera & stage video active</span>
      </div>
    );
  }

  const expressionHint = !isBound
    ? "Requires certified Foundry AvatarRig GLB"
    : !facialDriverWired
      ? "Probing Foundry morph targets…"
      : expression === "smile" && !smileOk
        ? morphCap?.reason ?? "Smile morph deltas unusable after sanitize"
        : expression === "hype" && motionOk && !morphCap?.hypeFacialUsable
          ? "HYPE = body motion bounce (jaw/eyeWide morphs unusable after sanitize)"
          : morphCap?.reason && !smileOk
            ? morphCap.reason
            : null;

  return (
    <div
      data-fan-avatar-canister={userId}
      data-avatar-binding={viewport.diagnostic}
      className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border bg-gradient-to-b from-[#0a0a1f] to-[#04040d] text-white overflow-hidden ${className}`}
      style={{
        borderColor: `${tierColor}44`,
        boxShadow: `0 0 20px ${tierColor}15`,
        minHeight: 280,
      }}
    >
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${isBound ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}
          />
          <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
            AVATAR CANISTER
          </span>
        </div>
        <span
          className="text-[8px] font-extrabold px-2 py-0.5 rounded border"
          style={{
            borderColor: isBound ? `${tierColor}55` : "#FF2DAA55",
            color: isBound ? tierColor : "#FF2DAA",
            background: isBound ? `${tierColor}10` : "#FF2DAA10",
          }}
        >
          {isBound
            ? faceScanActive
              ? "FACE SCAN BOUND"
              : "FOUNDRY BOUND"
            : "ASSET MISSING"}
        </span>
      </div>

      <div className="relative w-full flex items-center justify-center my-2" style={{ height: 220, minHeight: 220 }}>
        {isBound && viewport.glbUrl ? (
          <>
            <AvatarViewer
              active={true}
              color={tierColor}
              visorColor={tierColor}
              crown={tierColor === "#FFD700"}
              isPlaying={expression === "hype" && motionOk}
              isSeated={false}
              size={220}
              glbSlotId={viewport.slotId}
              glbUrl={viewport.glbUrl}
              certifiedOnly
              enableOrbit
              cameraFocus="body"
              expression={expression}
              onMorphCapability={onMorphCapability}
            />
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                border: `1px solid ${tierColor}30`,
                background: `radial-gradient(ellipse at center, ${tierColor}10 0%, transparent 70%)`,
              }}
            />
          </>
        ) : (
          <UnboundAvatarViewport
            tierColor={tierColor}
            diagnostic={viewport.diagnostic}
            message={viewport.message}
            missingArtifact={viewport.missingArtifact}
          />
        )}
      </div>

      <div className="flex flex-col items-center gap-1 z-10 mb-2 w-full">
        <div className="flex items-center gap-1">
          {(["neutral", "smile", "hype"] as const).map((expr) => {
            const disabled =
              !isBound ||
              (expr === "smile" && (!facialDriverWired || !smileOk)) ||
              (expr === "hype" && !motionOk);
            const partialHype =
              expr === "hype" && isBound && motionOk && !morphCap?.hypeFacialUsable;
            return (
              <button
                key={expr}
                type="button"
                disabled={disabled}
                title={
                  disabled
                    ? expressionHint ?? "Unavailable"
                    : partialHype
                      ? "Body motion bounce — jaw/eyeWide morphs unusable after sanitize"
                      : `Set expression: ${expr}`
                }
                onClick={() => {
                  if (!disabled) setExpression(expr);
                }}
                className={`text-[8px] font-black uppercase px-2.5 py-1 rounded transition-all ${
                  disabled
                    ? "bg-white/5 text-white/25 cursor-not-allowed opacity-60"
                    : expression === expr
                      ? "bg-cyan-400 text-black shadow-md"
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {expr}
              </button>
            );
          })}
        </div>
        {expressionHint && (
          <span className="text-[7px] text-amber-400/80 text-center px-2">{expressionHint}</span>
        )}
      </div>

      <div className="w-full flex items-center justify-between z-10 pt-2 border-t border-white/10">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-white/40 uppercase">SEAT BINDING</span>
          <span className="text-[9px] font-black text-white">
            {binding.seatId ? `Seat ${binding.seatId}` : "Unseated"}
          </span>
        </div>
        <Link
          href="/avatar/studio"
          className="text-[8px] font-black uppercase px-3 py-1.5 rounded-lg text-black bg-gradient-to-r from-cyan-400 to-emerald-400"
        >
          Decorate / Customize →
        </Link>
      </div>
    </div>
  );
}
