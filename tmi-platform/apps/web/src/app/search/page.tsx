"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import FollowButton from "@/components/social/FollowButton";

/**
 * Real search — was a client-side filter over 6 hardcoded fake artists/
 * rooms/beats/articles. Now queries /api/search, which hits the real User/
 * ArtistProfile/UserProfile tables. Role rule: fans can search fans or
 * performers; performers (and everyone else) can search performers only —
 * matches the platform's Booking Department policy (no direct
 * performer→fan discovery) and the fact that fan search requires a signed-
 * in fan session (checked server-side too, this is not just a UI gate).
 */

interface SearchResult {
  id: string;
  name: string;
  role: string;
  tier: string;
  isLive: boolean;
  avatarUrl: string | null;
  location: string | null;
  genre: string | null;
  verified: boolean;
  followers: number;
  profileRoute: string;
}

type SearchTab = "performers" | "fans";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SearchTab>("performers");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionRole, setSessionRole] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { authenticated: boolean; user?: { id?: string; role?: string } }) => {
        if (d.authenticated) {
          setSessionRole((d.user?.role ?? "").toUpperCase());
          setSessionUserId(d.user?.id ?? null);
        }
      })
      .catch(() => {});
  }, []);

  const canSearchFans = sessionRole === "FAN";

  const runSearch = useCallback((q: string, t: SearchTab) => {
    setLoading(true);
    setError(null);
    fetch(`/api/search?q=${encodeURIComponent(q)}&type=${t}`, { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { results?: SearchResult[]; error?: string }) => {
        if (d.error) setError(d.error);
        setResults(d.results ?? []);
      })
      .catch(() => setError("Search failed. Try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => runSearch(query, tab), 250);
    return () => clearTimeout(t);
  }, [query, tab, runSearch]);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "40px 24px 20px", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 16 }}>SEARCH TMI</div>

        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === "performers" ? "Search performers…" : "Search fans…"}
            autoFocus
            style={{ width: "100%", padding: "14px 20px", paddingLeft: 48, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "rgba(255,255,255,0.3)" }}>🔍</span>
          {query && <span onClick={() => setQuery("")} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>✕</span>}
        </div>

        {/* Tabs — Fans tab only shown to signed-in fans, matching server-side rule */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            onClick={() => setTab("performers")}
            style={{ fontSize: 10, fontWeight: 800, padding: "6px 16px", borderRadius: 20, cursor: "pointer", background: tab === "performers" ? "#00FFFF22" : "rgba(255,255,255,0.05)", border: `1px solid ${tab === "performers" ? "#00FFFF55" : "rgba(255,255,255,0.1)"}`, color: tab === "performers" ? "#00FFFF" : "rgba(255,255,255,0.5)" }}
          >
            PERFORMERS
          </button>
          {canSearchFans && (
            <button
              onClick={() => setTab("fans")}
              style={{ fontSize: 10, fontWeight: 800, padding: "6px 16px", borderRadius: 20, cursor: "pointer", background: tab === "fans" ? "#AA2DFF22" : "rgba(255,255,255,0.05)", border: `1px solid ${tab === "fans" ? "#AA2DFF55" : "rgba(255,255,255,0.1)"}`, color: tab === "fans" ? "#AA2DFF" : "rgba(255,255,255,0.5)" }}
            >
              FANS
            </button>
          )}
        </div>
        {!canSearchFans && sessionRole && sessionRole !== "FAN" && (
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
            Signed in as {sessionRole.toLowerCase()} — fan search is fan-to-fan only.
          </div>
        )}
      </section>

      <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
        {loading && <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, padding: "16px 0" }}>Searching…</div>}

        {!loading && error && (
          <div style={{ color: "#FF8FBE", fontSize: 12, padding: "16px 0" }}>{error}</div>
        )}

        {!loading && !error && results.length === 0 && (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
            {query ? `No ${tab} found for "${query}".` : `No ${tab} to show yet.`}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {results.map((r) => (
              <div key={r.id} style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px" }}>
                <Link href={r.profileRoute} style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, textDecoration: "none", color: "inherit", minWidth: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.08)", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                    {r.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : "👤"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                      {r.name}
                      {r.verified && <span style={{ fontSize: 9, color: "#00FFFF" }}>✓</span>}
                      {r.isLive && <span style={{ fontSize: 7, fontWeight: 900, color: "#FF2DAA", background: "#FF2DAA15", border: "1px solid #FF2DAA30", borderRadius: 3, padding: "1px 5px" }}>LIVE</span>}
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                      {[r.genre, r.location].filter(Boolean).join(" · ") || r.tier}
                    </div>
                  </div>
                </Link>
                {tab === "performers" && sessionUserId && sessionUserId !== r.id && (
                  <FollowButton targetUserId={r.id} targetName={r.name} variant="icon" accent="#FF2DAA" />
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
