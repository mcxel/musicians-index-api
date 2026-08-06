"use client";

/**
 * BatchIngestPanel — Marcel's batch beat catalog ingestion tool.
 *
 * Allows multi-file selection (or folder), previews each file with editable
 * metadata, performs client-side duplicate detection, then submits sequentially
 * to POST /api/beats/submit — one beat per request, one batch session token
 * shared across all files.
 *
 * Rules:
 * - Rule 19: beat system — nothing publishes automatically; creates DRAFT/PENDING records only
 * - Rule 20: no fake data — each file must actually upload and succeed via real API call
 * - Rule 26: only accessible to beat_creator / admin (gated upstream in Operating Center)
 * - AGENTS.md Rule 1: only Marcel's account or admin role may see this panel
 *
 * Props:
 *   producerAccountId:   string            — Marcel's account ID (pre-populated from session)
 *   defaultRoyaltySplits: RoyaltySplitInput[] — e.g. [{ recipientName: "Marcel & Creech", percentage: 100, role: "primary_producer" }]
 */

import { useCallback, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoyaltySplitInput {
  recipientName: string;
  percentage: number;
  role: string;
}

interface BatchRow {
  file: File;
  displayName: string;
  genre: string;
  estimatedBpm: string;
  musicalKey: string;
  eligiblePools: string[];
  competitionEligible: boolean;
  /** Client-side duplicate flag */
  dupWarning: string | null;
  /** Submission state */
  submitting: boolean;
  success: boolean;
  canonicalId: string | null;
  error: string | null;
  /** SHA-256 hex — computed lazily */
  sha256: string | null;
}

interface BatchIngestPanelProps {
  producerAccountId: string;
  defaultRoyaltySplits?: RoyaltySplitInput[];
  accentColor?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_EXTENSIONS = new Set([".mp3", ".wav", ".aiff", ".aif", ".flac"]);

const GENRE_LIST = [
  "hip_hop", "trap", "boom_bap", "drill", "rnb", "pop", "edm",
  "afrobeats", "latin", "house", "rock", "gospel", "jazz", "country", "other",
];

const POOL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "beat_battles",       label: "Beat Battles" },
  { value: "freestyle_battles",  label: "Freestyle" },
  { value: "cyphers",            label: "Cyphers" },
  { value: "dance_challenges",   label: "Dance Challenges" },
  { value: "world_dance_parties",label: "Dance Parties" },
  { value: "listening_rooms",    label: "Listening Rooms" },
  { value: "radio_rotation",     label: "Radio Rotation" },
  { value: "marketplace",        label: "Marketplace" },
];

const DEFAULT_POOLS = ["beat_battles", "freestyle_battles", "cyphers", "marketplace"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileExt(name: string) {
  return name.slice(name.lastIndexOf(".")).toLowerCase();
}

function baseNameWithoutExt(name: string) {
  return name.slice(0, name.lastIndexOf(".")) || name;
}

async function sha256hex(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hashBuf = await window.crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function genBatchToken(): string {
  const arr = new Uint8Array(4);
  window.crypto.getRandomValues(arr);
  return "batch_" + Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BatchIngestPanel({
  producerAccountId,
  defaultRoyaltySplits,
  accentColor = "#FF6B1A",
}: BatchIngestPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [batchToken] = useState(genBatchToken);
  const [running, setRunning] = useState(false);
  const [globalPools, setGlobalPools] = useState<string[]>(DEFAULT_POOLS);
  const [globalCompetition, setGlobalCompetition] = useState(false);

  const ac = accentColor;

  const royaltySplits: RoyaltySplitInput[] = defaultRoyaltySplits ?? [
    { recipientName: "Marcel & Creech", percentage: 100, role: "primary_producer" },
  ];

  // ── File ingestion ─────────────────────────────────────────────────────────

  const ingestFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const incoming: BatchRow[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      const ext = fileExt(f.name);
      if (!ALLOWED_EXTENSIONS.has(ext)) continue;

      incoming.push({
        file: f,
        displayName: baseNameWithoutExt(f.name),
        genre: "hip_hop",
        estimatedBpm: "",
        musicalKey: "",
        eligiblePools: [...globalPools],
        competitionEligible: globalCompetition,
        dupWarning: null,
        submitting: false,
        success: false,
        canonicalId: null,
        error: null,
        sha256: null,
      });
    }

    setRows((prev) => {
      const combined = [...prev, ...incoming];
      // Detect same filename among new + existing
      const seen = new Map<string, number>();
      return combined.map((r) => {
        const key = r.file.name.toLowerCase();
        const count = (seen.get(key) ?? 0) + 1;
        seen.set(key, count);
        return { ...r, dupWarning: count > 1 ? `Duplicate filename: ${r.file.name}` : null };
      });
    });
  }, [globalPools, globalCompetition]);

  // ── Apply global pools to all pending rows ─────────────────────────────────

  const applyGlobalPools = () => {
    setRows((prev) =>
      prev.map((r) =>
        !r.success && !r.submitting
          ? { ...r, eligiblePools: [...globalPools], competitionEligible: globalCompetition }
          : r
      )
    );
  };

  // ── Row update helper ──────────────────────────────────────────────────────

  const updateRow = (i: number, patch: Partial<BatchRow>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ── Sequential submission ──────────────────────────────────────────────────

  const runBatch = useCallback(async () => {
    const pending = rows.filter((r) => !r.success && !r.submitting);
    if (pending.length === 0) return;

    setRunning(true);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.success || row.submitting) continue;

      // Compute SHA-256 if not done
      let hash = row.sha256;
      if (!hash) {
        try {
          hash = await sha256hex(row.file);
        } catch {
          hash = "";
        }
      }

      updateRow(i, { submitting: true, error: null, sha256: hash });

      const fd = new FormData();
      fd.append("audio", row.file);
      fd.append("displayName", row.displayName.trim() || baseNameWithoutExt(row.file.name));
      fd.append("genreJson", JSON.stringify([row.genre]));
      fd.append("eligiblePoolsJson", JSON.stringify(row.eligiblePools));
      fd.append("competitionEligible", row.competitionEligible ? "true" : "false");
      fd.append("royaltySplitsJson", JSON.stringify(royaltySplits));
      fd.append("rightsDeclarationAccepted", "true");
      fd.append("batchIngestSession", batchToken);
      if (row.estimatedBpm) fd.append("estimatedBpm", row.estimatedBpm);
      if (row.musicalKey)   fd.append("musicalKey", row.musicalKey);
      // Default license for batch: STANDARD
      fd.append("licenseType", "STANDARD");

      try {
        const res = await fetch("/api/beats/submit", { method: "POST", body: fd });
        const json = await res.json();

        if (!res.ok) {
          updateRow(i, {
            submitting: false,
            error: json.details ?? json.error ?? "Submission failed",
          });
        } else {
          updateRow(i, {
            submitting: false,
            success: true,
            canonicalId: json.canonicalId,
            error: null,
          });
        }
      } catch (e) {
        updateRow(i, { submitting: false, error: "Network error" });
      }
    }

    setRunning(false);
  }, [rows, batchToken, royaltySplits]);

  // ── Derived stats ──────────────────────────────────────────────────────────

  const successCount = rows.filter((r) => r.success).length;
  const errorCount = rows.filter((r) => r.error !== null).length;
  const pendingCount = rows.filter((r) => !r.success && !r.submitting && r.error === null).length;

  // ── Styles ─────────────────────────────────────────────────────────────────

  const s = {
    root: { display: "flex", flexDirection: "column" as const, background: "#0a0614", minHeight: "100%", color: "#fff" },
    header: { padding: "14px 20px 10px", borderBottom: "1px solid rgba(255,107,26,0.18)" },
    title: { fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: ac, margin: 0 },
    section: { padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
    label: { fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 6, display: "block" },
    input: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 5, padding: "6px 8px", color: "#fff", fontSize: 11, outline: "none", boxSizing: "border-box" as const },
    chipRow: { display: "flex", flexWrap: "wrap" as const, gap: 4 },
    chip: (active: boolean) => ({
      fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 10, cursor: "pointer",
      border: `1px solid ${active ? ac : "rgba(255,255,255,0.12)"}`,
      background: active ? `${ac}20` : "transparent",
      color: active ? ac : "rgba(255,255,255,0.4)",
    }),
    btn: (variant: "primary" | "ghost" | "danger", disabled = false) => ({
      padding: "7px 14px", borderRadius: 5, border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: 9, fontWeight: 900, letterSpacing: "0.08em",
      background: disabled
        ? "rgba(255,255,255,0.05)"
        : variant === "primary" ? ac
        : variant === "danger" ? "#FF4444"
        : "rgba(255,255,255,0.08)",
      color: disabled
        ? "rgba(255,255,255,0.3)"
        : variant === "primary" ? "#000"
        : "#fff",
    }),
    tableHeader: {
      display: "grid",
      gridTemplateColumns: "30px 1fr 90px 60px 70px auto 70px",
      gap: 6,
      fontSize: 8,
      fontWeight: 900,
      letterSpacing: "0.1em",
      color: "rgba(255,255,255,0.3)",
      padding: "8px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
  };

  return (
    <div style={s.root}>
      <div style={s.header}>
        <p style={s.title}>BATCH INGEST — {batchToken}</p>
        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>
          {rows.length} files · {successCount} submitted · {errorCount} errors · {pendingCount} pending
        </p>
      </div>

      {/* ── Drop zone buttons ── */}
      <div style={s.section}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button style={s.btn("ghost")} onClick={() => fileInputRef.current?.click()}>
            + SELECT FILES
          </button>
          <button style={s.btn("ghost")} onClick={() => folderInputRef.current?.click()}>
            + SELECT FOLDER
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.aiff,.aif,.flac,audio/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => ingestFiles(e.target.files)}
          />
          <input
            ref={folderInputRef}
            type="file"
            /* @ts-expect-error — webkitdirectory is non-standard but widely supported */
            webkitdirectory="true"
            multiple
            style={{ display: "none" }}
            onChange={(e) => ingestFiles(e.target.files)}
          />
        </div>

        {/* Global pool / competition defaults */}
        <div style={{ marginBottom: 8 }}>
          <span style={s.label}>DEFAULT PLACEMENT POOLS (applies to all new rows)</span>
          <div style={s.chipRow}>
            {POOL_OPTIONS.map(({ value, label }) => (
              <span
                key={value}
                style={s.chip(globalPools.includes(value))}
                onClick={() => setGlobalPools((prev) =>
                  prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
            <input
              type="checkbox"
              checked={globalCompetition}
              onChange={(e) => setGlobalCompetition(e.target.checked)}
              style={{ accentColor: ac }}
            />
            Competition Eligible (global default)
          </label>
          <button style={s.btn("ghost")} onClick={applyGlobalPools}>
            APPLY TO ALL PENDING
          </button>
        </div>
      </div>

      {/* ── Table header ── */}
      {rows.length > 0 && (
        <div style={s.tableHeader}>
          <span>#</span>
          <span>TITLE / FILENAME</span>
          <span>GENRE</span>
          <span>BPM</span>
          <span>KEY</span>
          <span>STATUS</span>
          <span />
        </div>
      )}

      {/* ── Rows ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {rows.length === 0 && (
          <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            No files selected. Click "Select Files" or "Select Folder" above.
            <br />
            Accepted formats: MP3, WAV, AIFF, FLAC · Max 100 MB per file.
          </div>
        )}

        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "30px 1fr 90px 60px 70px auto 70px",
              gap: 6,
              padding: "6px 20px",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              background: row.success
                ? "rgba(0,255,136,0.04)"
                : row.error
                ? "rgba(255,68,68,0.05)"
                : row.dupWarning
                ? "rgba(255,215,0,0.04)"
                : "transparent",
            }}
          >
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{i + 1}</span>

            {/* Title / filename */}
            <div style={{ minWidth: 0 }}>
              <input
                style={{ ...s.input, width: "100%", fontSize: 11 }}
                value={row.displayName}
                disabled={row.success || row.submitting}
                onChange={(e) => updateRow(i, { displayName: e.target.value })}
                placeholder={baseNameWithoutExt(row.file.name)}
              />
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {row.file.name}
                {row.dupWarning && <span style={{ color: "#FFD700", marginLeft: 6 }}>⚠ dup</span>}
              </div>
            </div>

            {/* Genre */}
            <select
              style={{ ...s.input, width: "100%", cursor: "pointer" }}
              value={row.genre}
              disabled={row.success || row.submitting}
              onChange={(e) => updateRow(i, { genre: e.target.value })}
            >
              {GENRE_LIST.map((g) => (
                <option key={g} value={g}>{g.replace("_", " ")}</option>
              ))}
            </select>

            {/* BPM */}
            <input
              style={{ ...s.input, width: "100%", textAlign: "center" }}
              type="number"
              value={row.estimatedBpm}
              disabled={row.success || row.submitting}
              onChange={(e) => updateRow(i, { estimatedBpm: e.target.value })}
              placeholder="BPM"
              min={40} max={250}
            />

            {/* Key */}
            <input
              style={{ ...s.input, width: "100%" }}
              value={row.musicalKey}
              disabled={row.success || row.submitting}
              onChange={(e) => updateRow(i, { musicalKey: e.target.value })}
              placeholder="Key"
              maxLength={20}
            />

            {/* Status indicator */}
            <div style={{ fontSize: 9, fontWeight: 900, whiteSpace: "nowrap" }}>
              {row.submitting && <span style={{ color: "#FFD700" }}>UPLOADING…</span>}
              {row.success && <span style={{ color: "#00FF88" }}>✓ {row.canonicalId}</span>}
              {row.error && (
                <span style={{ color: "#FF4444" }} title={row.error}>✗ {row.error.slice(0, 24)}</span>
              )}
              {!row.submitting && !row.success && !row.error && (
                <span style={{ color: "rgba(255,255,255,0.3)" }}>PENDING</span>
              )}
            </div>

            {/* Remove */}
            {!row.success && !row.submitting && (
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", fontSize: 14 }}
                onClick={() => removeRow(i)}
                title="Remove"
              >
                ×
              </button>
            )}
            {(row.success || row.submitting) && <span />}
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      {rows.length > 0 && (
        <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
            {pendingCount} to submit · {successCount} done
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={s.btn("danger", running || successCount === rows.length)}
              disabled={running || successCount === rows.length}
              onClick={() => setRows((prev) => prev.filter((r) => r.success))}
            >
              CLEAR PENDING
            </button>
            <button
              style={s.btn("primary", running || pendingCount === 0)}
              disabled={running || pendingCount === 0}
              onClick={runBatch}
            >
              {running ? `INGESTING… (${successCount}/${rows.length})` : `SUBMIT ${pendingCount} BEATS`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
