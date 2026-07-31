"use client";

/**
 * AdminSubmissionPanel — BJM / Overseer Beat Locker entry.
 * Same runtime as performer submit (admin-submit API) + competition assign.
 * Analytics: real locker counts only — never invented revenue.
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import DrawerBezelChrome from "@/components/drawers/DrawerBezelChrome";
import { buildSubmissionPreview } from "@/engines/performance/BeatSubmissionRouter";
import {
  assignBeatToCompetition,
  BEAT_GENRES,
  creatorCreditLabel,
  listBeats,
  submitBeat,
  type BeatCompetitionTarget,
  type BeatLockerRecord,
} from "@/lib/beats/BeatLockerClient";
import { DEFAULT_LICENSE_PRICES } from "@/lib/beats/BeatStoreCommerceEngine";

const DESTINATIONS: { id: BeatCompetitionTarget | "radio" | "wdp"; label: string; href?: string }[] = [
  { id: "battle", label: "Battle vault" },
  { id: "cypher", label: "Cypher vault" },
  { id: "challenge", label: "Challenge vault" },
  { id: "game-show", label: "Name That Tune / game show" },
  { id: "monthly-idol", label: "Monthly Idol" },
  { id: "tournament", label: "Tournament" },
  { id: "wdp", label: "World Dance Party (open room)", href: "/rooms/world-dance-party" },
  { id: "radio", label: "Stream & Win Radio (deferred route)", href: "/submit" },
];

interface AdminSubmissionPanelProps {
  actorName?: string;
  accentColor?: string;
}

export default function AdminSubmissionPanel({
  actorName = "BJM",
  accentColor = "#FFD700",
}: AdminSubmissionPanelProps) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Hip-Hop");
  const [bpm, setBpm] = useState(120);
  const [key, setKey] = useState("");
  const [tags, setTags] = useState("admin-stash");
  const [previewUrl, setPreviewUrl] = useState("");
  const [stashScope, setStashScope] = useState<"platform" | "personal">("platform");
  const [dest, setDest] = useState<(typeof DESTINATIONS)[number]["id"]>("battle");
  const [targetId, setTargetId] = useState("admin-open-queue");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [beats, setBeats] = useState<BeatLockerRecord[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  const preview = buildSubmissionPreview(
    genre,
    tags.split(",").map((t) => t.trim()).filter(Boolean),
    true,
    true,
  );

  const refresh = useCallback(async () => {
    setLoadState("loading");
    const result = await listBeats();
    if (!result.ok) {
      setBeats([]);
      setLoadState("error");
      return;
    }
    setBeats(result.beats);
    setLoadState("ready");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (!title.trim()) {
      setError("Title is required.");
      setBusy(false);
      return;
    }
    if (!previewUrl.trim()) {
      setError("Admin submit requires a previewUrl (audio URL).");
      setBusy(false);
      return;
    }

    const result = await submitBeat(
      {
        title: title.trim(),
        genre,
        bpm,
        key: key || undefined,
        tags: `${tags},${stashScope === "platform" ? "platform-catalog" : "personal-stash"}`,
        producerName: actorName,
        previewUrl: previewUrl.trim(),
        basicPrice: DEFAULT_LICENSE_PRICES.non_exclusive,
        stashScope,
      },
      { admin: true },
    );

    if (!result.ok || !result.beat) {
      setError(result.error ?? "Admin submit failed (need ADMIN session).");
      setBusy(false);
      return;
    }

    let routeNote = "";
    if (dest === "radio" || dest === "wdp") {
      const d = DESTINATIONS.find((x) => x.id === dest);
      routeNote = d?.href
        ? ` Open ${d.label}: ${d.href}. Competition assign skipped for this dest.`
        : " Destination link unavailable.";
    } else {
      const assign = await assignBeatToCompetition(
        result.beat.id,
        dest,
        targetId.trim() || "admin-open-queue",
      );
      routeNote = assign.ok
        ? ` Routed to ${dest} competition vault.`
        : ` Assign pending: ${assign.error ?? "failed"}.`;
    }

    setMessage(
      `Uploaded "${result.beat.title}" (${stashScope}). ${creatorCreditLabel(result.beat)}.${routeNote} Auction settlement: not live yet.`,
    );
    setTitle("");
    setBusy(false);
    void refresh();
  };

  const published = beats.filter((b) => b.status === "published").length;
  const drafts = beats.filter((b) => b.status === "draft").length;
  const adminOwned = beats.filter((b) => b.adminSubmitted).length;

  return (
    <DrawerBezelChrome variant="gold" seriesLabel="Admin · Beat Locker Submissions" accentColor={accentColor}>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", fontWeight: 800, color: accentColor }}>
            BJM UPLOAD · PLATFORM vs PERSONAL STASH · REAL COUNTS ONLY
          </div>
          <div style={{ display: "flex", gap: 8, fontSize: 10, fontWeight: 800 }}>
            <span style={{ color: "#00FFFF" }}>Locker {beats.length}</span>
            <span style={{ color: "#00FF88" }}>Published {published}</span>
            <span style={{ color: "#FFD700" }}>Draft {drafts}</span>
            <span style={{ color: "#AA2DFF" }}>Admin {adminOwned}</span>
          </div>
        </div>

        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
          Revenue / auction totals: no live settlement data — marketplace purchases show only after real Stripe checkout.
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Beat title"
            style={fieldStyle}
            required
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select value={genre} onChange={(e) => setGenre(e.target.value)} style={{ ...fieldStyle, flex: 1 }}>
              {BEAT_GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={60}
              max={220}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value) || 120)}
              style={{ ...fieldStyle, width: 88 }}
            />
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Key"
              style={{ ...fieldStyle, width: 72 }}
            />
          </div>
          <input
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            placeholder="Audio preview URL (required for admin-submit)"
            style={fieldStyle}
            required
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags"
            style={fieldStyle}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              value={stashScope}
              onChange={(e) => setStashScope(e.target.value as "platform" | "personal")}
              style={{ ...fieldStyle, flex: 1 }}
            >
              <option value="platform">Platform catalog (admin-submitted)</option>
              <option value="personal">Personal stash tag</option>
            </select>
            <select
              value={dest}
              onChange={(e) => setDest(e.target.value as typeof dest)}
              style={{ ...fieldStyle, flex: 1 }}
            >
              {DESTINATIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            <input
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="Target id"
              style={{ ...fieldStyle, flex: 1 }}
            />
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{preview.poolSummary}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="submit" disabled={busy} style={btnStyle(accentColor)}>
              {busy ? "UPLOADING…" : "UPLOAD BEAT"}
            </button>
            <Link href="/admin/beat-locker" style={linkStyle("#00FFFF")}>
              Beat Locker board →
            </Link>
            <Link href="/admin/beats" style={linkStyle(accentColor)}>
              Beat management →
            </Link>
            <Link href="/beats" style={linkStyle("#00FF88")}>
              Marketplace →
            </Link>
          </div>
        </form>

        {error ? <p style={{ margin: 0, fontSize: 11, color: "#FF6B9A" }}>{error}</p> : null}
        {message ? <p style={{ margin: 0, fontSize: 11, color: "#00FF88" }}>{message}</p> : null}

        {loadState === "loading" ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Loading Beat Locker…</div>
        ) : null}
        {loadState === "error" ? (
          <div style={{ fontSize: 11, color: "#FFD700" }}>
            Unable to load beats. Check DB / session — showing empty locker.
          </div>
        ) : null}
        {loadState === "ready" && beats.length === 0 ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            Beat Locker is empty. Upload above for BJM tomorrow path.
          </div>
        ) : null}
        {beats.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }}>
            {beats.slice(0, 25).map((b) => (
              <div
                key={b.id}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{b.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                  {b.genre} · {b.bpm} BPM · {b.status} ·{" "}
                  {b.adminSubmitted ? "platform-admin" : "producer"} · {creatorCreditLabel(b)}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </DrawerBezelChrome>
  );
}

const fieldStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 6,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  fontSize: 11,
};

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    background: color,
    color: "#050310",
    fontSize: 10,
    fontWeight: 900,
    cursor: "pointer",
  };
}

function linkStyle(color: string): React.CSSProperties {
  return { fontSize: 10, fontWeight: 800, color, textDecoration: "none" };
}
