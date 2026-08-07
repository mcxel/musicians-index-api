"use client";

/**
 * PerformerSubmissionCanister — BeatLocker + competition destinations.
 * Uses /api/beats/submit + assign. Marketplace list/sale hooks stay separate (Rule 19).
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
import {
  buildBeatDropInventory,
} from "@/lib/beats/BeatInventoryEngine";
import { DEFAULT_LICENSE_PRICES } from "@/lib/beats/BeatStoreCommerceEngine";

interface PerformerSubmissionCanisterProps {
  userId: string;
  displayName?: string;
  accentColor?: string;
}

const DESTINATIONS: { id: BeatCompetitionTarget; label: string }[] = [
  { id: "battle", label: "Battle vault" },
  { id: "cypher", label: "Cypher vault" },
  { id: "challenge", label: "Challenge vault" },
  { id: "game-show", label: "Game show (Name That Tune path)" },
  { id: "monthly-idol", label: "Monthly Idol" },
  { id: "tournament", label: "Tournament" },
];

export default function PerformerSubmissionCanister({
  userId,
  displayName = "Performer",
  accentColor = "#FFD700",
}: PerformerSubmissionCanisterProps) {
  const [title, setTitle] = useState("");
  const [broadcastTag, setBroadcastTag] = useState(displayName);
  const [genre, setGenre] = useState<string>("Hip-Hop");
  const [bpm, setBpm] = useState(120);
  const [key, setKey] = useState("");
  const [tags, setTags] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [targetType, setTargetType] = useState<BeatCompetitionTarget>("battle");
  const [targetId, setTargetId] = useState("open-queue");
  const [listForSale, setListForSale] = useState(true);
  const [basicPrice, setBasicPrice] = useState(DEFAULT_LICENSE_PRICES.non_exclusive);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [beats, setBeats] = useState<BeatLockerRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const preview = buildSubmissionPreview(
    genre,
    tags.split(",").map((t) => t.trim()).filter(Boolean),
    true,
    true,
  );

  const refresh = useCallback(async () => {
    const result = await listBeats({ mine: true });
    if (!result.ok) {
      setLoadError(result.error ?? "Could not load Beat Locker");
      setBeats([]);
      return;
    }
    setLoadError(null);
    setBeats(result.beats);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (!userId || userId === "anonymous") {
      setError("Log in as a Performer to upload to Beat Locker.");
      setBusy(false);
      return;
    }
    if (!title.trim()) {
      setError("Beat name is required.");
      setBusy(false);
      return;
    }
    if (!broadcastTag.trim()) {
      setError("Broadcast tag is required — exactly what shows on air.");
      setBusy(false);
      return;
    }
    if (listForSale && (!Number.isFinite(basicPrice) || basicPrice < 99)) {
      setError("Marketplace path requires your price (min $0.99).");
      setBusy(false);
      return;
    }
    if (!file && !previewUrl.trim()) {
      setError("Add an audio file or preview URL.");
      setBusy(false);
      return;
    }

    const result = await submitBeat(
      {
        title: title.trim(),
        genre,
        bpm,
        key: key || undefined,
        tags,
        broadcastTag: broadcastTag.trim(),
        producerName: broadcastTag.trim(),
        previewUrl: previewUrl.trim() || undefined,
        basicPrice: listForSale ? basicPrice : DEFAULT_LICENSE_PRICES.non_exclusive,
        listForSale,
        stashScope: "personal",
      },
      { file },
    );

    if (!result.ok || !result.beat) {
      setError(result.error ?? "Submit failed");
      setBusy(false);
      return;
    }

    const assign = await assignBeatToCompetition(result.beat.id, targetType, targetId.trim() || "open-queue");
    const credit = creatorCreditLabel(result.beat);

    let saleNote = "";
    if (listForSale) {
      // Marketplace hook only — does not invent a completed sale/auction (Rule 20).
      const inv = buildBeatDropInventory(result.beat.id, {
        non_exclusive: basicPrice,
        exclusive: DEFAULT_LICENSE_PRICES.exclusive,
        stems: DEFAULT_LICENSE_PRICES.stems,
        unlimited: DEFAULT_LICENSE_PRICES.unlimited,
      });
      saleNote = inv.hasAvailability
        ? ` Marketplace listing ready at $${(basicPrice / 100).toFixed(2)} (non-exclusive). Auction: not live yet.`
        : " Marketplace inventory unavailable.";
    }

    setMessage(
      `Beat Locker: "${result.beat.title}" saved (${result.beat.status ?? "draft"}). ` +
        (assign.ok
          ? `Routed toward ${targetType} competition vault.`
          : `Competition route pending: ${assign.error ?? "assign failed"}.`) +
        ` ${credit}.${saleNote}`,
    );
    setTitle("");
    setPreviewUrl("");
    setFile(null);
    setBusy(false);
    void refresh();
  };

  return (
    <DrawerBezelChrome variant="chrome" seriesLabel="Performer · Beat Locker" accentColor={accentColor}>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.18em", fontWeight: 800, color: accentColor }}>
          BEAT LOCKER → COMPETITION VAULT · MARKETPLACE SEPARATE
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Beat name"
            style={fieldStyle}
            required
          />
          <input
            value={broadcastTag}
            onChange={(e) => setBroadcastTag(e.target.value)}
            placeholder="Broadcast tag / seller display name (on air)"
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
              title="BPM"
            />
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Key"
              style={{ ...fieldStyle, width: 72 }}
            />
          </div>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma-separated)"
            style={fieldStyle}
          />
          <input
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            placeholder="Preview URL (or choose file)"
            style={fieldStyle}
          />
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as BeatCompetitionTarget)}
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
              placeholder="Target room / queue id"
              style={{ ...fieldStyle, flex: 1 }}
            />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
            <input
              type="checkbox"
              checked={listForSale}
              onChange={(e) => setListForSale(e.target.checked)}
            />
            List for marketplace (your price required — fee via SPLIT_PRESETS.beat)
          </label>
          {listForSale ? (
            <input
              type="number"
              min={99}
              value={basicPrice}
              onChange={(e) => setBasicPrice(Number(e.target.value) || 2999)}
              style={fieldStyle}
              title="Your price in cents"
              required
              placeholder="Price (cents)"
            />
          ) : null}

          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{preview.poolSummary}</div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <button type="submit" disabled={busy} style={btnStyle(accentColor)}>
              {busy ? "UPLOADING…" : "UPLOAD TO BEAT LOCKER"}
            </button>
            <Link href="/beats" style={linkStyle("#00FFFF")}>
              Marketplace →
            </Link>
            <Link href="/admin/beat-locker" style={linkStyle(accentColor)}>
              Admin Beat Locker →
            </Link>
          </div>
        </form>

        {error ? <p style={{ margin: 0, fontSize: 11, color: "#FF6B9A" }}>{error}</p> : null}
        {message ? <p style={{ margin: 0, fontSize: 11, color: "#00FF88" }}>{message}</p> : null}
        {loadError ? <p style={{ margin: 0, fontSize: 11, color: "#FFD700" }}>{loadError}</p> : null}

        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: "rgba(255,255,255,0.45)" }}>
          YOUR LOCKER ({beats.length})
        </div>
        {beats.length === 0 ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            No beats in your locker yet. Upload above to start.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
            {beats.map((b) => (
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
                  {b.genre} · {b.bpm} BPM · {b.status ?? "—"} · {creatorCreditLabel(b)}
                </div>
              </div>
            ))}
          </div>
        )}
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
