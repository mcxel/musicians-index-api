"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FollowButton from "@/components/social/FollowButton";

type SearchResultKind = "profile" | "live_room" | "article" | "track";

interface UnifiedSearchResult {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle?: string;
  href: string;
  imageUrl?: string | null;
  previewUrl?: string | null;
  audioUrl?: string | null;
  isLive?: boolean;
  viewerCount?: number;
  role?: string;
  verified?: boolean;
}

type SearchTab = "performers" | "fans";

interface SearchGrouped {
  profiles?: UnifiedSearchResult[];
  liveRooms?: UnifiedSearchResult[];
  articles?: UnifiedSearchResult[];
  tracks?: UnifiedSearchResult[];
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [tab, setTab] = useState<SearchTab>("performers");
  const [grouped, setGrouped] = useState<SearchGrouped>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionRole, setSessionRole] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

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
      .then((d: { grouped?: SearchGrouped; error?: string }) => {
        if (d.error) setError(d.error);
        setGrouped(d.grouped ?? {});
      })
      .catch(() => setError("Search failed. Try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => runSearch(query, tab), 250);
    return () => clearTimeout(t);
  }, [query, tab, runSearch]);

  const totalCount =
    (grouped.profiles?.length ?? 0) +
    (grouped.liveRooms?.length ?? 0) +
    (grouped.articles?.length ?? 0) +
    (grouped.tracks?.length ?? 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "40px 24px 20px", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 16 }}>SEARCH TMI</div>

        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === "performers" ? "Search performers, rooms, tracks, articles…" : "Search fans…"}
            autoFocus
            style={{ width: "100%", padding: "14px 20px", paddingLeft: 48, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "rgba(255,255,255,0.3)" }}>🔍</span>
          {query && <span onClick={() => setQuery("")} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>✕</span>}
        </div>

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

        {!loading && !error && totalCount === 0 && (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
            {query ? `No results found for "${query}".` : "Enter a search term to discover performers, live rooms, tracks, and articles."}
          </div>
        )}

        {!loading && !error && (grouped.liveRooms?.length ?? 0) > 0 && tab === "performers" ? (
          <ResultSection label="LIVE NOW">
            {grouped.liveRooms!.map((r) => (
              <LiveRoomResult key={r.id} result={r} />
            ))}
          </ResultSection>
        ) : null}

        {!loading && !error && (grouped.profiles?.length ?? 0) > 0 ? (
          <ResultSection label={tab === "fans" ? "FANS" : "PROFILES"}>
            {grouped.profiles!.map((r) => (
              <ProfileResult key={r.id} result={r} sessionUserId={sessionUserId} tab={tab} />
            ))}
          </ResultSection>
        ) : null}

        {!loading && !error && (grouped.tracks?.length ?? 0) > 0 && tab === "performers" ? (
          <ResultSection label="TRACKS">
            {grouped.tracks!.map((r) => (
              <TrackResult key={r.id} result={r} />
            ))}
          </ResultSection>
        ) : null}

        {!loading && !error && (grouped.articles?.length ?? 0) > 0 && tab === "performers" ? (
          <ResultSection label="MAGAZINE">
            {grouped.articles!.map((r) => (
              <ArticleResult key={r.id} result={r} />
            ))}
          </ResultSection>
        ) : null}
      </section>
    </main>
  );
}

function ResultSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#00FFFF", marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function ProfileResult({ result, sessionUserId, tab }: { result: UnifiedSearchResult; sessionUserId: string | null; tab: SearchTab }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px" }}>
      <Link href={result.href} style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, textDecoration: "none", color: "inherit", minWidth: 0 }}>
        <Avatar imageUrl={result.imageUrl} fallback="👤" />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
            {result.title}
            {result.verified && <span style={{ fontSize: 9, color: "#00FFFF" }}>✓</span>}
            {result.isLive && <span style={{ fontSize: 7, fontWeight: 900, color: "#FF2DAA", background: "#FF2DAA15", border: "1px solid #FF2DAA30", borderRadius: 3, padding: "1px 5px" }}>LIVE</span>}
          </div>
          {result.subtitle ? <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{result.subtitle}</div> : null}
        </div>
      </Link>
      {tab === "performers" && sessionUserId && !result.id.startsWith("registry-") && sessionUserId !== result.id && (
        <FollowButton targetUserId={result.id} targetName={result.title} variant="icon" accent="#FF2DAA" />
      )}
    </div>
  );
}

function LiveRoomResult({ result }: { result: UnifiedSearchResult }) {
  const preview = result.previewUrl?.trim() || result.imageUrl?.trim() || "";
  return (
    <Link href={result.href} style={{ display: "block", textDecoration: "none", color: "inherit", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ position: "relative", height: 120, background: "#0a0614" }}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.25)", fontSize: 11 }}>Live room preview</div>
        )}
        {result.isLive ? (
          <span style={{ position: "absolute", top: 8, left: 8, fontSize: 7, fontWeight: 900, color: "#fff", background: "#FF2DAA", borderRadius: 4, padding: "2px 6px" }}>● LIVE{result.viewerCount ? ` · ${result.viewerCount}` : ""}</span>
        ) : null}
      </div>
      <div style={{ padding: "10px 14px" }}>
        <div style={{ fontSize: 12, fontWeight: 700 }}>{result.title}</div>
        {result.subtitle ? <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{result.subtitle}</div> : null}
      </div>
    </Link>
  );
}

function TrackResult({ result }: { result: UnifiedSearchResult }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px" }}>
      <Avatar imageUrl={result.imageUrl} fallback="🎵" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700 }}>{result.title}</div>
        {result.subtitle ? <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{result.subtitle}</div> : null}
        {result.audioUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <audio controls preload="none" src={result.audioUrl} style={{ width: "100%", marginTop: 8, height: 32 }} />
        ) : null}
      </div>
      <Link href={result.href} style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", textDecoration: "none", whiteSpace: "nowrap" }}>PROFILE →</Link>
    </div>
  );
}

function ArticleResult({ result }: { result: UnifiedSearchResult }) {
  return (
    <Link href={result.href} style={{ display: "block", textDecoration: "none", color: "inherit", background: "linear-gradient(135deg, rgba(170,45,255,0.12), rgba(5,5,16,0.9))", border: "1px solid rgba(170,45,255,0.25)", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.16em", color: "#AA2DFF", marginBottom: 6 }}>MAGAZINE</div>
      <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.3 }}>{result.title}</div>
      {result.subtitle ? <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 6, lineHeight: 1.4 }}>{result.subtitle}</div> : null}
    </Link>
  );
}

function Avatar({ imageUrl, fallback }: { imageUrl?: string | null; fallback: string }) {
  return (
    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.08)", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : fallback}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 40 }}>Loading search…</main>}>
      <SearchPageContent />
    </Suspense>
  );
}
