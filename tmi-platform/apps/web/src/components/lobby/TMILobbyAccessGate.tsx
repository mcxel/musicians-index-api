"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { LobbyGenre, LobbyPrivacy, PerformerTier } from "@/components/billboard/TMIBillboardLiveWall";

export interface AccessGateProps {
  lobby: {
    roomId: string;
    performerName: string;
    privacy: LobbyPrivacy;
    entryPriceUsd?: number;
    inviteToken?: string;
    genre: LobbyGenre;
  };
  userTier: PerformerTier;
  userRole?: string;
  isAuthenticated: boolean;
  children: ReactNode;
  onAccessDenied?: (reason: string) => void;
}

type AccessState =
  | "granted"
  | "unauthenticated"
  | "token_required"
  | "diamond_required"
  | "payment_required"
  | "private";

function checkAccess(
  privacy: LobbyPrivacy,
  userTier: PerformerTier,
  isAuthenticated: boolean
): AccessState {
  if (!isAuthenticated) return "unauthenticated";
  if (privacy === "PUBLIC") return "granted";
  if (privacy === "PRIVATE") return "private";
  if (privacy === "INVITE_ONLY") return "token_required";
  if (privacy === "DIAMOND_SURF") {
    return userTier === "diamond" ? "granted" : "diamond_required";
  }
  if (privacy === "PAID_ENTRY") {
    return userTier === "diamond" ? "granted" : "payment_required";
  }
  return "granted";
}

export function TMILobbyAccessGate({
  lobby,
  userTier,
  isAuthenticated,
  children,
  onAccessDenied,
}: AccessGateProps) {
  const [enteredToken, setEnteredToken] = useState("");
  const [tokenError,   setTokenError]   = useState(false);
  const [accessState,  setAccessState]  = useState<AccessState>(
    () => checkAccess(lobby.privacy, userTier, isAuthenticated)
  );

  function tryToken() {
    if (enteredToken === lobby.inviteToken) {
      setAccessState("granted");
    } else {
      setTokenError(true);
      setTimeout(() => setTokenError(false), 2000);
    }
  }

  if (accessState === "granted") {
    return <>{children}</>;
  }

  const accentColors: Record<AccessState, string> = {
    granted:          "#22c55e",
    unauthenticated:  "#06b6d4",
    token_required:   "#a855f7",
    diamond_required: "#38bdf8",
    payment_required: "#fbbf24",
    private:          "#6b7280",
  };
  const accent = accentColors[accessState];

  return (
    <div className="min-h-screen bg-[#05050c] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">

        <div
          className="border rounded-2xl p-5 text-center space-y-2"
          style={{ borderColor: accent + "40", background: accent + "08" }}
        >
          <span className="text-4xl">
            {lobby.genre === "battle" ? "⚔️" : lobby.genre === "concert" ? "🎵" : "🎤"}
          </span>
          <h2 className="text-lg font-black text-white">{lobby.performerName}</h2>
          <p className="text-[10px]" style={{ color: accent }}>
            {lobby.genre.toUpperCase()} · {lobby.privacy.replace("_", " ")}
          </p>
        </div>

        {accessState === "unauthenticated" && (
          <div className="space-y-3 text-center">
            <p className="text-white/50 text-sm">Sign in to join this room</p>
            <Link
              href={`/auth?next=/live/rooms/${lobby.roomId}`}
              className="block w-full py-3 text-[11px] font-black uppercase tracking-wider text-black rounded-xl text-center"
              style={{ background: accent }}
            >
              Sign In to Enter
            </Link>
          </div>
        )}

        {accessState === "token_required" && (
          <div className="space-y-3">
            <p className="text-white/50 text-sm text-center">
              This room is invite-only. Enter your access code.
            </p>
            <input
              value={enteredToken}
              onChange={(e) => setEnteredToken(e.target.value)}
              placeholder="VIP-XXXX-2026"
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white outline-none ${
                tokenError ? "border-red-500" : "border-white/20 focus:border-purple-400"
              }`}
            />
            {tokenError && (
              <p className="text-red-400 text-[9px] text-center">Invalid code — try again</p>
            )}
            <button
              onClick={tryToken}
              className="w-full py-3 text-[11px] font-black uppercase tracking-wider text-white rounded-xl"
              style={{ background: "#a855f7" }}
            >
              Enter
            </button>
          </div>
        )}

        {accessState === "diamond_required" && (
          <div className="space-y-3 text-center">
            <p className="text-white/50 text-sm">
              Diamond members can surf this room with their subscription.
            </p>
            <Link
              href="/settings/billing?plan=diamond"
              className="block w-full py-3 text-[11px] font-black uppercase tracking-wider text-black rounded-xl"
              style={{ background: "#38bdf8" }}
            >
              Upgrade to Diamond
            </Link>
            <p className="text-[9px] text-white/30">
              Includes access to all Diamond Surf rooms
            </p>
          </div>
        )}

        {accessState === "payment_required" && (
          <div className="space-y-3 text-center">
            <p className="text-white/50 text-sm">
              This is a paid concert event.
            </p>
            <div className="text-3xl font-black" style={{ color: "#fbbf24" }}>
              ${lobby.entryPriceUsd?.toFixed(2) ?? "5.00"}
            </div>
            <Link
              href={`/tickets/purchase?room=${lobby.roomId}&price=${lobby.entryPriceUsd}`}
              className="block w-full py-3 text-[11px] font-black uppercase tracking-wider text-black rounded-xl"
              style={{ background: "#fbbf24" }}
            >
              Buy Ticket
            </Link>
            <Link
              href="/settings/billing?plan=diamond"
              className="block text-[9px] text-white/30 hover:text-white/50"
            >
              Diamond subscribers enter free →
            </Link>
          </div>
        )}

        {accessState === "private" && (
          <div className="text-center space-y-3">
            <p className="text-white/40 text-sm">This room is private.</p>
            <Link href="/home/5" className="text-[9px] text-white/30 hover:text-white/50 uppercase tracking-wider">
              ← Back to Stage 5
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default TMILobbyAccessGate;
