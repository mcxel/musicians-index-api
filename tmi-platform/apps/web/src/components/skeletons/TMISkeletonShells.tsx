"use client";

/**
 * TMISkeletonShells.tsx
 * Loading skeleton and shell system for The Musician's Index.
 *
 * Drop at: apps/web/src/components/skeletons/TMISkeletonShells.tsx
 *
 * Every skeleton matches the pixel layout of its real component
 * so there's ZERO layout shift when content loads.
 *
 * Exports:
 *  SkeletonPulse           — base animated shimmer block
 *  BillboardSkeleton       — live wall tile grid (matches TMIBillboardLiveWall)
 *  ProfileShellSkeleton    — performer/fan profile page
 *  ArticleCardSkeleton     — magazine bento card
 *  BeatCardSkeleton        — beat store row
 *  LobbyWallSkeleton       — live room lobby
 *  ArenaDeckSkeleton       — battles/cyphers list
 *  HomepageWidgetSkeleton  — homepage live widget grid
 *  NotifSkeleton           — notification item
 *  ChatSkeleton            — message thread
 *  LeaderboardSkeleton     — XP rank list
 *  AdminOverseerSkeleton   — admin dashboard
 *  AvatarSkeleton          — avatar creator
 *  TicketSkeleton          — ticket confirmation card
 */

import { type CSSProperties } from "react";

/* ─── Base pulse animation ───────────────────────────────────────────────── */
const PULSE_KEYFRAMES = `
  @keyframes skeletonPulse {
    0%   { opacity: 0.5; }
    50%  { opacity: 0.8; }
    100% { opacity: 0.5; }
  }
  @keyframes skeletonShimmer {
    0%   { background-position: -300px 0; }
    100% { background-position: 300px 0; }
  }
`;

const shimmerStyle: CSSProperties = {
  background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
  backgroundSize: "600px 100%",
  animation: "skeletonShimmer 1.6s infinite linear, skeletonPulse 2s ease-in-out infinite",
};

export function SkeletonPulse({
  w = "100%",
  h = "16px",
  r = "8px",
  className = "",
  style = {},
}: {
  w?: string; h?: string; r?: string; className?: string; style?: CSSProperties;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PULSE_KEYFRAMES }} />
      <div
        className={className}
        style={{ width: w, height: h, borderRadius: r, ...shimmerStyle, ...style }}
      />
    </>
  );
}

/* ─── Billboard skeleton ─────────────────────────────────────────────────── */
export function BillboardSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className="w-full p-3" style={{ background: "#05050c" }}>
      {/* Header */}
      <div className="px-1 pb-3 flex items-center justify-between">
        <div className="space-y-1">
          <SkeletonPulse w="120px" h="12px" r="6px" />
          <SkeletonPulse w="80px" h="8px" r="4px" />
        </div>
        <SkeletonPulse w="70px" h="20px" r="10px" />
      </div>
      {/* Genre strip */}
      <div className="flex gap-1.5 pb-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonPulse key={i} w="70px" h="28px" r="14px" style={{ flexShrink: 0 }} />
        ))}
      </div>
      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "6px" }}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonPulse key={i} h="0" style={{ paddingTop: "100%", borderRadius: "10px" }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Profile shell skeleton ─────────────────────────────────────────────── */
export function ProfileShellSkeleton() {
  return (
    <div className="w-full max-w-lg mx-auto p-4 space-y-4" style={{ background: "#05050c", minHeight: "100svh" }}>
      {/* Hero */}
      <SkeletonPulse h="200px" r="16px" />
      {/* Name + tier */}
      <div className="flex items-center gap-3">
        <SkeletonPulse w="56px" h="56px" r="50%" style={{ flexShrink: 0 }} />
        <div className="space-y-1.5 flex-1">
          <SkeletonPulse w="60%" h="14px" r="7px" />
          <SkeletonPulse w="30%" h="10px" r="5px" />
        </div>
        <SkeletonPulse w="70px" h="28px" r="14px" />
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {[0,1,2].map((i) => <SkeletonPulse key={i} h="60px" r="12px" />)}
      </div>
      {/* Tab strip */}
      <div className="flex gap-1.5">
        {[0,1,2,3].map((i) => <SkeletonPulse key={i} w="70px" h="28px" r="14px" />)}
      </div>
      {/* Content rows */}
      {[0,1,2,3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonPulse w="48px" h="48px" r="10px" style={{ flexShrink: 0 }} />
          <div className="flex-1 space-y-1.5">
            <SkeletonPulse h="12px" r="6px" />
            <SkeletonPulse w="50%" h="9px" r="5px" />
          </div>
          <SkeletonPulse w="50px" h="20px" r="10px" />
        </div>
      ))}
    </div>
  );
}

/* ─── Magazine bento card skeleton ───────────────────────────────────────── */
export function ArticleCardSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2 row-span-2" : "col-span-1 row-span-1"}>
      <SkeletonPulse h={wide ? "320px" : "160px"} r="12px" />
    </div>
  );
}

/* ─── Beat card skeleton ──────────────────────────────────────────────────── */
export function BeatCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5">
      <SkeletonPulse w="40px" h="40px" r="50%" style={{ flexShrink: 0 }} />
      <div className="flex-1 space-y-1.5">
        <SkeletonPulse w="55%" h="11px" r="6px" />
        <SkeletonPulse w="40%" h="8px" r="4px" />
      </div>
      <SkeletonPulse w="48px" h="28px" r="14px" />
    </div>
  );
}

/* ─── Lobby wall skeleton ─────────────────────────────────────────────────── */
export function LobbyWallSkeleton() {
  return (
    <div className="w-full" style={{ background: "#05050c", minHeight: "100svh" }}>
      <SkeletonPulse h="200px" r="0" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          {[0,1,2,3].map((i) => <SkeletonPulse key={i} w="64px" h="28px" r="14px" />)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonPulse key={i} h="120px" r="12px" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Arena deck skeleton ─────────────────────────────────────────────────── */
export function ArenaDeckSkeleton() {
  return (
    <div className="p-4 space-y-3" style={{ background: "#05050c", minHeight: "100svh" }}>
      <div className="flex gap-1.5">
        {[0,1,2].map((i) => <SkeletonPulse key={i} w="80px" h="32px" r="16px" />)}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border border-white/5 rounded-xl p-4 space-y-2">
          <div className="flex justify-between">
            <SkeletonPulse w="45%" h="12px" r="6px" />
            <SkeletonPulse w="60px" h="20px" r="10px" />
          </div>
          <div className="flex gap-2">
            <SkeletonPulse w="80px" h="9px" r="4px" />
            <SkeletonPulse w="60px" h="9px" r="4px" />
          </div>
          <div className="flex gap-4 mt-1">
            <SkeletonPulse w="50%" h="8px" r="4px" />
            <SkeletonPulse w="30%" h="8px" r="4px" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Homepage widget skeleton ─────────────────────────────────────────────── */
export function HomepageWidgetSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPulse key={i} h="0" r="16px" style={{ paddingTop: "56.25%" /* 16:9 */ }} />
      ))}
    </div>
  );
}

/* ─── Chat skeleton ───────────────────────────────────────────────────────── */
export function ChatSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {[false, true, false, false, true].map((isMe, i) => (
        <div key={i} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
          {!isMe && <SkeletonPulse w="28px" h="28px" r="50%" style={{ flexShrink: 0 }} />}
          <div className={`space-y-1 max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
            <SkeletonPulse
              w={`${60 + (i * 17) % 30}%`} h="36px" r="12px"
              style={{ borderRadius: isMe ? "12px 12px 4px 12px" : "12px 12px 12px 4px" }}
            />
            <SkeletonPulse w="40px" h="7px" r="4px" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Leaderboard skeleton ─────────────────────────────────────────────────── */
export function LeaderboardSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-1 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/5">
          <SkeletonPulse w="28px" h="20px" r="4px" style={{ flexShrink: 0 }} />
          <SkeletonPulse w="32px" h="32px" r="50%" style={{ flexShrink: 0 }} />
          <div className="flex-1 space-y-1">
            <SkeletonPulse w={`${40 + (i * 13) % 30}%`} h="10px" r="5px" />
            <SkeletonPulse w="30%" h="8px" r="4px" />
          </div>
          <SkeletonPulse w="50px" h="20px" r="10px" />
        </div>
      ))}
    </div>
  );
}

/* ─── Admin overseer skeleton ──────────────────────────────────────────────── */
export function AdminOverseerSkeleton() {
  return (
    <div className="p-4 space-y-4" style={{ background: "#05050c", minHeight: "100svh" }}>
      {/* Tabs */}
      <div className="flex gap-1.5">
        {[0,1,2,3,4].map((i) => <SkeletonPulse key={i} w="80px" h="32px" r="8px" />)}
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[0,1,2,3].map((i) => <SkeletonPulse key={i} h="64px" r="12px" />)}
      </div>
      {/* Room grid */}
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonPulse key={i} h="160px" r="12px" />)}
      </div>
    </div>
  );
}

/* ─── Ticket skeleton ──────────────────────────────────────────────────────── */
export function TicketSkeleton() {
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden" style={{ maxWidth: 400 }}>
      <SkeletonPulse h="120px" r="0" />
      <div className="p-5 space-y-3">
        <SkeletonPulse w="70%" h="14px" r="7px" />
        <SkeletonPulse w="50%" h="10px" r="5px" />
        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <SkeletonPulse w="40%" h="8px" r="4px" />
            <SkeletonPulse w="60%" h="12px" r="6px" />
          </div>
          <div className="flex-1 space-y-1">
            <SkeletonPulse w="40%" h="8px" r="4px" />
            <SkeletonPulse w="60%" h="12px" r="6px" />
          </div>
        </div>
        <SkeletonPulse w="80px" h="80px" r="8px" style={{ margin: "0 auto" }} />
        <SkeletonPulse h="40px" r="12px" />
      </div>
    </div>
  );
}

/* ─── Notification item skeleton ─────────────────────────────────────────── */
export function NotifSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3 border-b border-white/5">
          <SkeletonPulse w="36px" h="36px" r="50%" style={{ flexShrink: 0 }} />
          <div className="flex-1 space-y-1.5">
            <SkeletonPulse w={`${50 + (i * 11) % 35}%`} h="10px" r="5px" />
            <SkeletonPulse w="35%" h="8px" r="4px" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Suspense wrapper (use around any component) ──────────────────────────── */
export function WithSkeleton<T>({
  loading,
  skeleton,
  children,
}: {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}) {
  return <>{loading ? skeleton : children}</>;
}
