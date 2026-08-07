"use client";

/**
 * Compact Beat Locker submit — small panel inside Stage Door / submission box.
 * Fields: beat name · broadcast tag · price (required for marketplace) · submit.
 */

import { useState } from "react";
import {
  assignBeatToCompetition,
  submitBeat,
} from "@/lib/beats/BeatLockerClient";
import { DEFAULT_LICENSE_PRICES } from "@/lib/beats/BeatStoreCommerceEngine";
import { getBeatFeeLabel } from "@/lib/beats/BeatPurchaseInterestEngine";

type Props = {
  accentColor?: string;
  onClose?: () => void;
  defaultBroadcastTag?: string;
};

export default function BeatLockerCompactSubmit({
  accentColor = "#00FFFF",
  onClose,
  defaultBroadcastTag = "",
}: Props) {
  const [title, setTitle] = useState("");
  const [broadcastTag, setBroadcastTag] = useState(defaultBroadcastTag);
  const [priceDollars, setPriceDollars] = useState(
    (DEFAULT_LICENSE_PRICES.non_exclusive / 100).toFixed(2),
  );
  const [previewUrl, setPreviewUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    const cents = Math.round(parseFloat(priceDollars) * 100);
    if (!title.trim()) {
      setError("Beat name is required.");
      setBusy(false);
      return;
    }
    if (!broadcastTag.trim()) {
      setError("Broadcast tag is required — this is what shows on air.");
      setBusy(false);
      return;
    }
    if (!Number.isFinite(cents) || cents < 99) {
      setError("Set your marketplace price (min $0.99).");
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
        genre: "Hip-Hop",
        bpm: 120,
        broadcastTag: broadcastTag.trim(),
        producerName: broadcastTag.trim(),
        previewUrl: previewUrl.trim() || undefined,
        basicPrice: cents,
        listForSale: true,
        stashScope: "personal",
      },
      { file },
    );

    if (!result.ok || !result.beat) {
      setError(result.error ?? "Submit failed");
      setBusy(false);
      return;
    }

    const assign = await assignBeatToCompetition(result.beat.id, "battle", "open-queue");
    setMessage(
      `"${result.beat.title}" in Beat Locker · on-air tag "${broadcastTag.trim()}" · $${(cents / 100).toFixed(2)} marketplace. ` +
        (assign.ok ? "Routed toward competition vault." : `Vault route: ${assign.error ?? "pending"}.`) +
        ` Fee: ${getBeatFeeLabel()}.`,
    );
    setTitle("");
    setPreviewUrl("");
    setFile(null);
    setBusy(false);
  };

  const field: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 6,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#fff",
    fontSize: 13,
    boxSizing: "border-box",
  };

  return (
    <div
      data-beat-locker-compact
      style={{
        marginTop: 12,
        padding: 14,
        borderRadius: 10,
        background: "rgba(0,255,255,0.04)",
        border: `1px solid ${accentColor}44`,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.18em",
          color: accentColor,
          marginBottom: 8,
        }}
      >
        BEAT LOCKER · COMPACT SUBMIT
      </div>
      <p style={{ margin: "0 0 10px", fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
        Beat name + broadcast tag (on-air credit) + your price. Submission Vault → Marketplace inventory.
        Competition vault assign is separate. Price never appears on the stage tag.
      </p>
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Beat name"
          style={field}
          required
          maxLength={80}
        />
        <input
          value={broadcastTag}
          onChange={(e) => setBroadcastTag(e.target.value)}
          placeholder="Broadcast tag / seller display name"
          style={field}
          required
          maxLength={48}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>$</span>
          <input
            type="number"
            min={0.99}
            step={0.01}
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
            placeholder="Price"
            style={{ ...field, flex: 1 }}
            required
          />
        </div>
        <input
          value={previewUrl}
          onChange={(e) => setPreviewUrl(e.target.value)}
          placeholder="Preview URL (or choose file)"
          style={field}
        />
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="submit"
            disabled={busy}
            style={{
              padding: "9px 16px",
              borderRadius: 6,
              border: "none",
              background: accentColor,
              color: "#050310",
              fontSize: 11,
              fontWeight: 900,
              cursor: busy ? "wait" : "pointer",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "SUBMITTING…" : "SUBMIT TO BEAT LOCKER"}
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 12px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "transparent",
                color: "rgba(255,255,255,0.6)",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          ) : null}
        </div>
      </form>
      {error ? <p style={{ margin: "8px 0 0", fontSize: 12, color: "#FF6B9A" }}>{error}</p> : null}
      {message ? <p style={{ margin: "8px 0 0", fontSize: 12, color: "#00FF88" }}>{message}</p> : null}
    </div>
  );
}
