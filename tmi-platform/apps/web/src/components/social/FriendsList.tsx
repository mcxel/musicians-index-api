"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import FollowButton from "./FollowButton";

export interface Friend {
  id: string;
  name: string;
  slug: string;
  role: string;
  isOnline: boolean;
  isLive?: boolean;
  liveRoomId?: string;
  genre?: string;
  followers?: number;
  avatarEmoji?: string;
  mutualFriends?: number;
}

interface FriendsListProps {
  friends: Friend[];
  pending?: Friend[];
  onMessage?: (friend: Friend) => void;
  onInvite?: () => void;
  accent?: string;
  compact?: boolean;
  showInviteButton?: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  PERFORMER: "#FF2DAA", ARTIST: "#AA2DFF", FAN: "#00FFFF",
  VENUE: "#FFD700", SPONSOR: "#00FF88",
};

type Tab = "online" | "all" | "requests";

export default function FriendsList({
  friends,
  pending = [],
  onMessage,
  onInvite,
  accent = "#00FFFF",
  compact = false,
  showInviteButton = true,
}: FriendsListProps) {
  const [tab, setTab] = useState<Tab>("online");
  const [search, setSearch] = useState("");

  const online  = friends.filter((f) => f.isOnline);
  const all     = friends;
  const display = tab === "online" ? online : tab === "all" ? all : pending;
  const filtered = search
    ? display.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : display;

  const BG = "#06080f";
  const BORDER = "rgba(255,255,255,0.07)";

  const acceptRequest = useCallback(async (friendId: string) => {
    await fetch("/api/social/friends/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ fromUserId: friendId }),
    });
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 2 }}>
          {(["online", "all", "requests"] as Tab[]).map((t) => {
            const count = t === "online" ? online.length : t === "all" ? all.length : pending.length;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  padding: "5px 12px", borderRadius: 8,
                  background: tab === t ? `${accent}22` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${tab === t ? accent + "44" : "rgba(255,255,255,0.07)"}`,
                  color: tab === t ? accent : "rgba(255,255,255,0.4)",
                  fontSize: 10, fontWeight: 700, cursor: "pointer",
                  textTransform: "capitalize", letterSpacing: "0.04em",
                }}
              >
                {t}
                {count > 0 && <span style={{ marginLeft: 4, opacity: 0.6 }}>({count})</span>}
              </button>
            );
          })}
        </div>
        {showInviteButton && (
          <button
            type="button"
            onClick={onInvite}
            style={{ padding: "5px 12px", background: `${accent}18`, border: `1px solid ${accent}44`, borderRadius: 8, cursor: "pointer", fontSize: 10, fontWeight: 800, color: accent, letterSpacing: "0.06em" }}
          >
            + Invite
          </button>
        )}
      </div>

      {/* Search */}
      {!compact && friends.length > 5 && (
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search friends…"
          style={{ width: "100%", padding: "8px 12px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box" }}
        />
      )}

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            {tab === "online" ? "No friends online right now." : tab === "requests" ? "No pending requests." : "No friends yet."}
          </div>
        ) : filtered.map((f) => {
          const roleColor = ROLE_COLORS[f.role] ?? "#888";
          return (
            <div
              key={f.id}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: 9,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: compact ? 30 : 36, height: compact ? 30 : 36, borderRadius: "50%", background: `${roleColor}18`, border: `1.5px solid ${roleColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: compact ? 13 : 16 }}>
                  {f.avatarEmoji ?? "👤"}
                </div>
                <div style={{ position: "absolute", bottom: -1, right: -1, width: 9, height: 9, borderRadius: "50%", background: f.isOnline ? "#00FF88" : "#333", border: "1.5px solid #06080f" }} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 1 }}>
                  <span style={{ fontSize: compact ? 11 : 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  {f.isLive && (
                    <span style={{ fontSize: 7, fontWeight: 900, background: "#cc0000", color: "#fff", padding: "1px 5px", borderRadius: 3, letterSpacing: "0.1em", flexShrink: 0 }}>LIVE</span>
                  )}
                </div>
                {!compact && (
                  <div style={{ fontSize: 9, color: roleColor, fontWeight: 700, letterSpacing: "0.06em" }}>
                    {f.role}{f.genre ? ` · ${f.genre}` : ""}
                    {f.mutualFriends ? ` · ${f.mutualFriends} mutual` : ""}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {tab === "requests" ? (
                  <>
                    <button type="button" onClick={() => void acceptRequest(f.id)}
                      style={{ padding: "4px 10px", background: "#00FF8822", border: "1px solid #00FF8855", borderRadius: 6, cursor: "pointer", fontSize: 9, fontWeight: 800, color: "#00FF88" }}>
                      Accept
                    </button>
                    <button type="button"
                      style={{ padding: "4px 8px", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 6, cursor: "pointer", fontSize: 9, fontWeight: 800, color: "#ff6666" }}>
                      Decline
                    </button>
                  </>
                ) : (
                  <>
                    {onMessage && (
                      <button type="button" onClick={() => onMessage(f)}
                        style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        💬
                      </button>
                    )}
                    {f.isLive && f.liveRoomId ? (
                      <Link href={`/live/rooms/${f.liveRoomId}`}
                        style={{ padding: "4px 10px", background: "#cc000022", border: "1px solid #cc000044", borderRadius: 6, fontSize: 9, fontWeight: 800, color: "#ff4444", textDecoration: "none", display: "flex", alignItems: "center" }}>
                        Join Live
                      </Link>
                    ) : (
                      <Link href={`/artists/${f.slug}`}
                        style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                        👁
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
