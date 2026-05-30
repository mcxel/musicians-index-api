"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import FollowButton from "./FollowButton";

export type SearchFilter = "all" | "performer" | "artist" | "fan" | "venue" | "sponsor";

interface UserResult {
  id: string;
  slug: string;
  name: string;
  role: string;
  genre?: string;
  followers?: number;
  isLive?: boolean;
  avatarColor?: string;
}

interface UserSearchPanelProps {
  placeholder?: string;
  filters?: SearchFilter[];
  onSelect?: (user: UserResult) => void;
  accent?: string;
  maxResults?: number;
  compact?: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  PERFORMER: "#FF2DAA", ARTIST: "#AA2DFF", FAN: "#00FFFF",
  VENUE: "#FFD700", SPONSOR: "#00FF88", ADVERTISER: "#FF9500",
};

const ROLE_ICONS: Record<string, string> = {
  PERFORMER: "🎤", ARTIST: "🎵", FAN: "👤",
  VENUE: "🏛️", SPONSOR: "💰", ADVERTISER: "📢",
};

export default function UserSearchPanel({
  placeholder = "Search performers, artists, or fans…",
  filters = ["all", "performer", "artist", "fan"],
  onSelect,
  accent = "#00FFFF",
  maxResults = 8,
  compact = false,
}: UserSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string, f: SearchFilter) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, role: f === "all" ? "" : f.toUpperCase(), limit: String(maxResults) });
      const res = await fetch(`/api/users/search?${params}`, { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { users?: UserResult[] };
        setResults(data.users ?? []);
      }
    } catch {
      // silently fail — offline or auth issue
    } finally {
      setLoading(false);
    }
  }, [maxResults]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void search(query, filter), 280);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, filter, search]);

  const BG = "#06080f";
  const BORDER = "rgba(255,255,255,0.07)";

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      {/* Search input */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          background: BG,
          border: `1px solid ${focused ? accent + "55" : BORDER}`,
          borderRadius: 10,
          padding: "0 12px",
          gap: 8,
          transition: "border-color 0.2s",
        }}
      >
        <span style={{ fontSize: 14, opacity: 0.4 }}>🔍</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          style={{
            flex: 1, padding: "10px 0", background: "none", border: "none",
            color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit",
          }}
        />
        {loading && (
          <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${accent}22`, borderTop: `2px solid ${accent}`, animation: "spin 0.7s linear infinite" }} />
        )}
        {query && (
          <button type="button" onClick={() => { setQuery(""); setResults([]); }}
            style={{ background: "none", border: "none", fontSize: 14, color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
            ✕
          </button>
        )}
      </div>

      {/* Filter chips */}
      {filters.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                padding: "4px 12px", borderRadius: 20,
                background: filter === f ? `${accent}22` : "rgba(255,255,255,0.04)",
                border: `1px solid ${filter === f ? accent + "55" : "rgba(255,255,255,0.08)"}`,
                color: filter === f ? accent : "rgba(255,255,255,0.45)",
                fontSize: 10, fontWeight: 700, cursor: "pointer",
                textTransform: "capitalize", letterSpacing: "0.06em",
                transition: "all 0.15s",
              }}
            >
              {ROLE_ICONS[f.toUpperCase()] ?? ""} {f}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {focused && results.length > 0 && (
        <div
          style={{
            marginTop: 6, background: BG, border: `1px solid ${BORDER}`,
            borderRadius: 10, overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {results.map((u, i) => {
            const roleColor = ROLE_COLORS[u.role] ?? "#aaa";
            const icon      = ROLE_ICONS[u.role] ?? "👤";
            return (
              <div
                key={u.id}
                onClick={() => onSelect?.(u)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", cursor: "pointer",
                  borderBottom: i < results.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: compact ? 32 : 38, height: compact ? 32 : 38, borderRadius: "50%",
                    background: u.avatarColor ?? `${roleColor}22`,
                    border: `1.5px solid ${roleColor}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: compact ? 14 : 16, flexShrink: 0,
                    position: "relative",
                  }}
                >
                  {icon}
                  {u.isLive && (
                    <div style={{
                      position: "absolute", bottom: -1, right: -1,
                      width: 10, height: 10, borderRadius: "50%",
                      background: "#cc0000", border: "1.5px solid #050812",
                    }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.name}
                    </span>
                    {u.isLive && (
                      <span style={{ fontSize: 7, fontWeight: 900, color: "#fff", background: "#cc0000", padding: "1px 5px", borderRadius: 3, letterSpacing: "0.1em", flexShrink: 0 }}>
                        LIVE
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 9, color: roleColor, fontWeight: 700, letterSpacing: "0.06em" }}>{u.role}</span>
                    {u.genre && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{u.genre}</span>}
                    {u.followers !== undefined && (
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
                        {u.followers >= 1000 ? `${(u.followers / 1000).toFixed(1)}K` : u.followers} followers
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!compact && (
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <FollowButton targetUserId={u.id} targetName={u.name} variant="pill" accent={accent} />
                    <Link
                      href={`/artists/${u.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.4)", textDecoration: "none",
                      }}
                    >
                      View
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {focused && query.length >= 2 && results.length === 0 && !loading && (
        <div style={{ marginTop: 6, padding: "16px", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
          No results for "{query}"
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
