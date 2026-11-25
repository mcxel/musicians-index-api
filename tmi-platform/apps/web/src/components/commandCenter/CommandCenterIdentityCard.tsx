"use client";

/**
 * CommandCenterIdentityCard — left-rail bottom identity block.
 * Avatar, tier badge, Fans/Following and current room occupancy use real
 * profile and audience data. There is no real Fan XP/Level
 * progression system anywhere in the codebase yet (addHumanRankPoints is
 * performer-only, in-memory, non-persistent) — so unlike the reference
 * mockup's "LEVEL 87" bar, this shows an honest not-yet-tracked note
 * instead of a fabricated number (Rule 20).
 */

import { useEffect, useState } from "react";
import { singleFlightJson } from "@/lib/live/singleFlightPoll";
import { DiamondTierBadge, type TierLevel } from "@/components/profile/DiamondTierBadge";
import { useTheme } from "@/lib/design/ThemeEngine";

interface CommandCenterIdentityCardProps {
  userId: string;
  displayName: string;
  role: "fan" | "performer";
  roomId: string | null;
}

interface SelfProfile {
  avatarUrl: string | null;
  tier: string;
  followersCount: number;
  followingCount: number;
}

function mapSessionTier(raw: string | null | undefined): TierLevel {
  switch ((raw ?? "").toUpperCase()) {
    case "DIAMOND":
      return "diamond";
    case "PLATINUM":
    case "GOLD":
      return "gold";
    case "RUBY":
    case "SILVER":
      return "RUBY";
    default:
      return "free";
  }
}

export default function CommandCenterIdentityCard({ userId, displayName, role, roomId }: CommandCenterIdentityCardProps) {
  const theme = useTheme();
  const [profile, setProfile] = useState<SelfProfile | null>(null);
  const [occupancy, setOccupancy] = useState<{ roomId: string; count: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/profile/self", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!data.ok) return;
        setProfile({
          avatarUrl: data.profile.avatarUrl ?? null,
          // P0 Identity/Entitlement Integrity: trust whatever the server
          // resolved (see /api/profile/self, now DB-authoritative) — never
          // re-derive tier from role client-side (bf9024fd reverted).
          tier: data.profile.tier ?? "FREE",
          followersCount: data.profile.followersCount ?? 0,
          followingCount: data.profile.followingCount ?? 0,
        });
      } catch {
        /* honest fallback: card still shows name/role, no stats */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    let lastEventAt = 0;
    const onCount = (event: Event) => {
      const detail = (event as CustomEvent<{ roomId?: string; viewers?: number }>).detail;
      if (detail?.roomId !== roomId || !Number.isSafeInteger(detail.viewers) || (detail.viewers ?? -1) < 0) return;
      lastEventAt = Date.now();
      setOccupancy({ roomId, count: detail.viewers! });
    };
    window.addEventListener("tmi:watch-audience-count", onCount);

    const loadCount = async () => {
      const requestedAt = Date.now();
      try {
        const snapshot = await singleFlightJson(`audience:${roomId}:count`, async () => {
          try {
            const response = await fetch(`/api/live/audience?venue=${encodeURIComponent(roomId)}`, {
              credentials: "include",
              cache: "no-store",
            });
            if (!response.ok) return null;
            return (await response.json()) as { venueSlug?: string; humanPresent?: number };
          } catch {
            return null;
          }
        });
        if (!snapshot) return;
        if (!cancelled && lastEventAt <= requestedAt && snapshot.venueSlug === roomId &&
            Number.isSafeInteger(snapshot.humanPresent) && (snapshot.humanPresent ?? -1) >= 0) {
          setOccupancy({ roomId, count: snapshot.humanPresent! });
        }
      } catch {
        // Leave count unknown until the room publishes its next authoritative update.
      }
    };
    void loadCount();
    const refreshId = window.setInterval(() => {
      if (Date.now() - lastEventAt > 5000) void loadCount();
    }, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(refreshId);
      window.removeEventListener("tmi:watch-audience-count", onCount);
    };
  }, [roomId]);

  const initial = displayName?.trim()?.[0]?.toUpperCase() ?? "?";
  const inRoomCount = roomId && occupancy?.roomId === roomId ? occupancy.count.toLocaleString() : roomId ? "—" : "0";

  return (
    <div
      style={{
        marginTop: "auto",
        padding: "10px 12px",
        border: "1px solid rgba(178,136,255,0.24)",
        borderRadius: 6,
        background: "linear-gradient(145deg, rgba(19,26,42,0.96), rgba(12,18,29,0.98))",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {profile?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt={displayName}
            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: `1px solid ${theme.primary}55`, flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              flexShrink: 0,
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 900,
              color: "#050510",
            }}
          >
            {initial}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayName}
          </div>
          <DiamondTierBadge tier={mapSessionTier(profile?.tier)} />
        </div>
      </div>

      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>LEVEL —</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 4 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>{profile?.followersCount.toLocaleString() ?? "—"}</div>
            <div style={{ fontSize: 7, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>FANS</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>{profile?.followingCount.toLocaleString() ?? "—"}</div>
            <div style={{ fontSize: 7, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>FOLLOWING</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div data-testid="identity-in-room-count" style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>{inRoomCount}</div>
            <div style={{ fontSize: 7, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>IN ROOM</div>
          </div>
      </div>

      <div style={{ fontSize: 8, fontWeight: 800, color: theme.primary, letterSpacing: "0.08em" }}>
        {role === "performer" ? "PERFORMER" : "FAN"} · THEME {theme.name.toUpperCase()}
      </div>
    </div>
  );
}
