"use client";

/**
 * FanAvatarCanister.tsx
 * Canonical 3D Fan Avatar Canister surface.
 * Pipeline: Authenticated Fan → Canonical Identity → Face Scan Binding → Avatar DNA → 3D Canister → Seat Assignment
 * Invariant: Fan avatars only; Performers retain live camera/video presentation.
 */

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { bindAvatarToSeat, startAvatarSeatBindingEngine, type AvatarSeatBinding } from "@/lib/avatar/AvatarSeatBindingEngine";

const AvatarViewer = dynamic(
  () => import("@/components/3d/AvatarLobbyCanvas").then((mod) => mod.AvatarViewer),
  { ssr: false }
);

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
  onSeatBound?: (binding: AvatarSeatBinding) => void;
  className?: string;
}

export default function FanAvatarCanister({
  userId,
  displayName,
  role,
  avatarUrl,
  faceScanActive = true,
  roomId,
  seatId,
  tierColor = "#00FFFF",
  onSeatBound,
  className = "",
}: FanAvatarCanisterProps) {
  const isFanRole = ["FAN", "USER", "SUPERADMIN", "ADMIN"].includes(role.toUpperCase());
  const [binding, setBinding] = useState<AvatarSeatBinding>(() => startAvatarSeatBindingEngine(userId));
  const [expression, setExpression] = useState<"neutral" | "smile" | "hype">("neutral");

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

  return (
    <div
      data-fan-avatar-canister={userId}
      className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border bg-gradient-to-b from-[#0a0a1f] to-[#04040d] text-white overflow-hidden ${className}`}
      style={{
        borderColor: `${tierColor}44`,
        boxShadow: `0 0 20px ${tierColor}15`,
        minHeight: 280,
      }}
    >
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
            AVATAR CANISTER
          </span>
        </div>
        <span
          className="text-[8px] font-extrabold px-2 py-0.5 rounded border"
          style={{ borderColor: `${tierColor}55`, color: tierColor, background: `${tierColor}10` }}
        >
          {faceScanActive ? "FACE SCAN BOUND" : "GENERIC DNA"}
        </span>
      </div>

      <div className="relative w-full flex-1 flex items-center justify-center my-2 min-h-[160px]">
        <AvatarViewer
          active={true}
          color={tierColor}
          visorColor={tierColor}
          crown={tierColor === "#FFD700"}
          isPlaying={expression === "hype"}
          size={140}
        />
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            border: `1px solid ${tierColor}30`,
            background: `radial-gradient(ellipse at center, ${tierColor}10 0%, transparent 70%)`,
          }}
        />
      </div>

      <div className="flex items-center gap-1 z-10 mb-2">
        {(["neutral", "smile", "hype"] as const).map((expr) => (
          <button
            key={expr}
            onClick={() => setExpression(expr)}
            className={`text-[8px] font-black uppercase px-2.5 py-1 rounded transition-all ${
              expression === expr
                ? "bg-cyan-400 text-black shadow-md"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            {expr}
          </button>
        ))}
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
          Avatar Studio →
        </Link>
      </div>
    </div>
  );
}
