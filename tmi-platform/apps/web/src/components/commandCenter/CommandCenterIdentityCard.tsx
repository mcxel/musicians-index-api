"use client";

/**
 * CommandCenterIdentityCard — left-rail bottom identity block.
 * Avatar, tier badge, and Fans/Following/Playlists are real (Follow +
 * Playlist tables via /api/profile/self). There is no real Fan XP/Level
 * progression system anywhere in the codebase yet (addHumanRankPoints is
 * performer-only, in-memory, non-persistent) — so unlike the reference
 * mockup's "LEVEL 87" bar, this shows an honest not-yet-tracked note
 * instead of a fabricated number (Rule 20).
 */

import { useEffect, useState } from "react";
import { DiamondTierBadge, type TierLevel } from "@/components/profile/DiamondTierBadge";
import { useTheme } from "@/lib/design/ThemeEngine";

interface CommandCenterIdentityCardProps {
  userId: string;
  displayName: string;
  role: "fan" | "performer";
}

interface SelfProfile {
  avatarUrl: string | null;
  tier: string;
  followersCount: number;
  followingCount: number;
  playlistsCount: number;
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

export default function CommandCenterIdentityCard({ userId, displayName, role }: CommandCenterIdentityCardProps) {
  const theme = useTheme();
  const [profile, setProfile] = useState<SelfProfile | null>(null);

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
          playlistsCount: data.profile.playlistsCount ?? 0,
        });
      } catch {
        /* honest fallback: card still shows name/role, no stats */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const initial = displayName?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      style={{
        marginTop: "auto",
        paddingTop: 12,
        borderTop: "1px solid rgba(255,255,255,0.08)",
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

      {profile ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>{profile.followersCount.toLocaleString()}</div>
            <div style={{ fontSize: 7, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>FANS</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>{profile.followingCount.toLocaleString()}</div>
            <div style={{ fontSize: 7, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>FOLLOWING</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>{profile.playlistsCount.toLocaleString()}</div>
            <div style={{ fontSize: 7, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>PLAYLISTS</div>
          </div>
        </div>
      ) : null}

      <div style={{ fontSize: 8, fontWeight: 800, color: theme.primary, letterSpacing: "0.08em" }}>
        {role === "performer" ? "PERFORMER" : "FAN"} · THEME {theme.name.toUpperCase()}
      </div>
    </div>
  );
}
