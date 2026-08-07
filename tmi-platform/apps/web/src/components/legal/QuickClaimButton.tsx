"use client";

/**
 * CLAIM MY WORK — visible on songs/videos/beats/media.
 * Does not instantly transfer ownership or delete content.
 */

import { useEffect, useState, type CSSProperties } from "react";

type ClaimType = {
  type: string;
  label: string;
};

type ClaimResult = {
  claimId: string;
  outcome: string;
  ownershipTransferred: false;
  contentDeleted: false;
  notes?: string[];
};

export default function QuickClaimButton({
  assetId,
  assetKind = "MEDIA",
  claimantUserId,
  contentRef,
  isOriginalUploader = false,
  compact = false,
}: {
  assetId: string;
  assetKind?: "SONG" | "VIDEO" | "BEAT" | "MEDIA";
  /** Session user id — required to file. */
  claimantUserId?: string;
  contentRef?: string;
  isOriginalUploader?: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [types, setTypes] = useState<ClaimType[]>([]);
  const [claimType, setClaimType] = useState("CREATED");
  const [statement, setStatement] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/legal/rights/quick-claim", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (r.ok && Array.isArray(data.types)) {
          setTypes(data.types as ClaimType[]);
        }
      })
      .catch(() => undefined);
  }, [open]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const r = await fetch("/api/legal/rights/quick-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          assetId,
          assetKind,
          claimantUserId: claimantUserId || undefined,
          claimType,
          statement,
          contentRef,
          isOriginalUploader,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
      const claim = data.claim as ClaimResult;
      setMsg(
        `${claim.claimId} → ${claim.outcome}. Ownership not transferred. Content not deleted.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="quick-claim-button" style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={claimBtn}
        title="Claim my work — does not instantly transfer ownership or delete content"
      >
        {compact ? "CLAIM" : "CLAIM MY WORK"}
      </button>

      {open ? (
        <div style={panel}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", color: "#FF6B1A" }}>
            QUICK CLAIM · NO INSTANT OWNERSHIP TRANSFER
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
            Asset {assetId} ({assetKind}). Claiming preserves evidence and opens review — it does not
            delete content or seize ownership.
          </div>
          <label style={label}>
            Claim type
            <select
              value={claimType}
              onChange={(e) => setClaimType(e.target.value)}
              style={input}
            >
              {(types.length
                ? types
                : [
                    { type: "CREATED", label: "I created this work" },
                    { type: "OWN_MASTER", label: "I own the master" },
                    { type: "UNAUTHORIZED_UPLOAD", label: "Unauthorized upload of my work" },
                  ]
              ).map((t) => (
                <option key={t.type} value={t.type}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label style={label}>
            Statement
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              rows={3}
              placeholder='Describe your rights. "No Copyright Intended" is not accepted.'
              style={{ ...input, resize: "vertical" }}
            />
          </label>
          <button type="button" disabled={busy || !assetId} onClick={submit} style={claimBtn}>
            {busy ? "Filing…" : "File Quick Claim"}
          </button>
          {msg ? <div style={{ fontSize: 11, color: "#00FF88" }}>{msg}</div> : null}
          {error ? <div style={{ fontSize: 11, color: "#FF8A8A" }}>{error}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

const claimBtn: CSSProperties = {
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#FF6B1A",
  border: "1px solid rgba(255,107,26,0.5)",
  borderRadius: 8,
  padding: "7px 12px",
  background: "rgba(255,107,26,0.12)",
  cursor: "pointer",
};

const panel: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  minWidth: 280,
  maxWidth: 360,
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(255,107,26,0.35)",
  background: "rgba(5,5,16,0.95)",
};

const label: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 11,
  fontWeight: 700,
  color: "rgba(255,255,255,0.7)",
};

const input: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  padding: "8px 10px",
  color: "#fff",
  fontSize: 12,
};
