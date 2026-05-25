/**
 * TMIAutoLobbyRouter.ts + TMILobbyAccessGate.tsx
 * Auto-lobby discovery and access control for The Musician's Index.
 *
 * TMIAutoLobbyRouter:
 *   When a user doesn't know what to join, this engine finds the best
 *   active lobby matching their genre/style preference.
 *
 * TMILobbyAccessGate (React component):
 *   Middleware that checks user tier/role before allowing entry.
 *   Handles: PUBLIC / PRIVATE / INVITE_ONLY / DIAMOND_SURF / PAID_ENTRY
 *
 * Drop at:
 *   apps/web/src/lib/routing/TMIAutoLobbyRouter.ts
 *   apps/web/src/components/layout/TMILobbyAccessGate.tsx
 */

/* ═══════════════════════════════════════════════════════════
   PART 1: TMIAutoLobbyRouter (pure TypeScript, no UI)
   ═══════════════════════════════════════════════════════════ */

import type { LobbyGenre, LiveFeedItem, LobbyPrivacy, PerformerTier } from "../components/billboard/TMIBillboardLiveWall";

export interface RouterOptions {
  genre?: LobbyGenre;
  userTier: PerformerTier;
  excludeRoomIds?: string[];
  preferLive?: boolean;
  preferPaid?: boolean;   // false = skip paid lobbies for free users
}

export interface RouterResult {
  found: boolean;
  lobby?: LiveFeedItem;
  reason?: string;        // why this lobby was chosen
  alternativeCount: number;
}

export class TMIAutoLobbyRouter {
  private registry: LiveFeedItem[] = [];

  /** Update the live lobby registry (call every ~5 seconds from your socket) */
  updateRegistry(lobbies: LiveFeedItem[]): void {
    this.registry = lobbies;
  }

  /** Find the best lobby for a user */
  findLobby(opts: RouterOptions): RouterResult {
    const {
      genre = "all",
      userTier,
      excludeRoomIds = [],
      preferLive = true,
      preferPaid = false,
    } = opts;

    const isDiamond = userTier === "diamond";

    // Filter by genre
    let candidates = genre === "all"
      ? [...this.registry]
      : this.registry.filter((l) => l.genre === genre);

    // Exclude already-visited rooms
    candidates = candidates.filter((l) => !excludeRoomIds.includes(l.roomId));

    // Access filter
    candidates = candidates.filter((l) => {
      if (l.privacy === "PRIVATE") return false;
      if (l.privacy === "INVITE_ONLY") return false;
      if (l.privacy === "PAID_ENTRY" && !preferPaid && userTier !== "diamond") return false;
      if (l.privacy === "DIAMOND_SURF" && !isDiamond) return false;
      return true;
    });

    if (candidates.length === 0) {
      return { found: false, reason: "No matching lobbies available", alternativeCount: 0 };
    }

    // Score and sort
    const scored = candidates.map((l) => ({
      lobby: l,
      score: this.routerScore(l, preferLive),
    }));
    scored.sort((a, b) => b.score - a.score);

    const winner = scored[0].lobby;
    return {
      found: true,
      lobby: winner,
      reason: this.describeReason(winner),
      alternativeCount: scored.length - 1,
    };
  }

  /** Find random lobby in genre (for "surprise me" button) */
  findRandomLobby(opts: Omit<RouterOptions, "genre"> & { genre?: LobbyGenre }): RouterResult {
    const result = this.findLobby(opts);
    if (!result.found || !result.lobby) return result;

    // Pick random from top 5
    const { genre = "all", userTier, excludeRoomIds = [] } = opts;
    const candidates = this.registry
      .filter((l) => (genre === "all" || l.genre === genre) && !excludeRoomIds.includes(l.roomId))
      .filter((l) => l.privacy === "PUBLIC" || (l.privacy === "DIAMOND_SURF" && userTier === "diamond"));

    if (candidates.length === 0) return result;
    const pick = candidates[Math.floor(Math.random() * Math.min(candidates.length, 5))];
    return {
      found: true,
      lobby: pick,
      reason: "Random pick — enjoy!",
      alternativeCount: candidates.length - 1,
    };
  }

  private routerScore(lobby: LiveFeedItem, preferLive: boolean): number {
    let score = 0;
    if (lobby.isLive && preferLive) score += 50;
    score += lobby.viewers * 0.5;
    score += lobby.tips * 1;
    score += lobby.activityLevel * 2;
    // Prefer accessible lobbies
    if (lobby.privacy === "PUBLIC") score += 10;
    return score;
  }

  private describeReason(lobby: LiveFeedItem): string {
    if (lobby.viewers > 100) return "🔥 High viewer count";
    if (lobby.isLive) return "📡 Currently live";
    if (lobby.tips > 50) return "💰 High tip activity";
    return "✨ Active room";
  }
}

/* ═══════════════════════════════════════════════════════════
   PART 2: TMILobbyAccessGate (React component)
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

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
  children: ReactNode;              // the actual lobby content
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
  userRole,
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
    // In production: POST /api/lobby/verify-token
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

        {/* Event preview */}
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

        {/* Gate: not authenticated */}
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

        {/* Gate: invite token */}
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

        {/* Gate: Diamond required */}
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
              ◈ Upgrade to Diamond
            </Link>
            <p className="text-[9px] text-white/30">
              Includes access to all Diamond Surf rooms
            </p>
          </div>
        )}

        {/* Gate: paid entry */}
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

        {/* Gate: private */}
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

/* ─── Auto-join UI hook ───────────────────────────────────────────────────── */
import { useState as _useState } from "react";

export function useAutoLobby(feeds: LiveFeedItem[], userTier: PerformerTier) {
  const [router] = _useState(() => {
    const r = new TMIAutoLobbyRouter();
    r.updateRegistry(feeds);
    return r;
  });

  function joinAuto(genre: LobbyGenre = "all"): RouterResult {
    return router.findLobby({ genre, userTier });
  }

  function joinRandom(genre: LobbyGenre = "all"): RouterResult {
    return router.findRandomLobby({ genre, userTier });
  }

  return { joinAuto, joinRandom };
}
