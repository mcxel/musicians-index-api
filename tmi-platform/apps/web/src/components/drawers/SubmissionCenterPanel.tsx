"use client";

/**
 * SubmissionCenterPanel — Beat Locker Submission Center drawer.
 *
 * Four-step form: Audio Upload → Metadata → Eligibility → Rights & Splits.
 * On submit: calls POST /api/beats/submit (real multipart upload, real DB record).
 * No page reload. Instant confirmation with canonical Beat ID.
 *
 * Rule 20: no fake submission IDs, no placeholder status text.
 * Rule 26: only visible to beat_creator / admin role (gated in Operating Center).
 */

import { useCallback, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "upload" | "metadata" | "eligibility" | "rights" | "confirm";

type RoyaltySplit = { recipientName: string; percentage: number; role: string };

interface SubmitResult {
  canonicalId: string;
  beatDbId: string;
  status: string;
  message: string;
}

interface SubmissionCenterPanelProps {
  /** Producer account name for the default royalty split row. */
  producerName?: string;
  accentColor?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GENRE_OPTIONS = [
  "hip_hop", "trap", "boom_bap", "drill", "rnb", "pop", "edm",
  "afrobeats", "latin", "house", "rock", "gospel", "jazz", "country", "other",
];

const MOOD_OPTIONS = [
  "AGGRESSIVE", "DARK", "CLUB", "EMOTIONAL", "EPIC", "HAPPY",
  "SLOW", "MEDIUM", "HIGH", "WORKOUT", "ROMANTIC",
];

const POOL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "beat_battles",    label: "Beat Battles" },
  { value: "freestyle_battles", label: "Freestyle Battles" },
  { value: "cyphers",         label: "Cyphers" },
  { value: "dance_challenges", label: "Dance Challenges" },
  { value: "world_dance_parties", label: "World Dance Parties" },
  { value: "listening_rooms", label: "Listening Rooms" },
  { value: "radio_rotation",  label: "Radio Rotation" },
  { value: "practice_arena",  label: "Practice Arena" },
  { value: "marketplace",     label: "Beat Marketplace" },
];

const SPLIT_ROLES = ["primary_producer", "co_producer", "sample_clearance", "collaborator"];

const STEP_ORDER: Step[] = ["upload", "metadata", "eligibility", "rights", "confirm"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubmissionCenterPanel({
  producerName = "Producer",
  accentColor = "#FF6B1A",
}: SubmissionCenterPanelProps) {
  const [step, setStep] = useState<Step>("upload");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  // Step 1: Audio file
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Metadata
  const [displayName, setDisplayName] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [estimatedBpm, setEstimatedBpm] = useState("");
  const [musicalKey, setMusicalKey] = useState("");
  const [energyLevel, setEnergyLevel] = useState("");
  const [licenseType, setLicenseType] = useState("STANDARD");

  // Step 3: Eligibility
  const [selectedPools, setSelectedPools] = useState<string[]>([]);
  const [competitionEligible, setCompetitionEligible] = useState(false);

  // Step 4: Rights + splits
  const [splits, setSplits] = useState<RoyaltySplit[]>([
    { recipientName: producerName, percentage: 100, role: "primary_producer" },
  ]);
  const [rightsAccepted, setRightsAccepted] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const stepIndex = STEP_ORDER.indexOf(step);
  const ac = accentColor;

  const toggleChip = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const splitsTotal = splits.reduce((s, r) => s + (r.percentage || 0), 0);

  const canProceedToMetadata = audioFile !== null;
  const canProceedToEligibility =
    displayName.trim().length > 0 && selectedGenres.length > 0;
  const canProceedToRights = selectedPools.length > 0;
  const canSubmit =
    rightsAccepted &&
    Math.abs(splitsTotal - 100) < 0.01 &&
    splits.every((s) => s.recipientName.trim().length > 0);

  const updateSplit = (i: number, field: keyof RoyaltySplit, value: string | number) => {
    setSplits((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const handleSubmit = useCallback(async () => {
    if (!audioFile || !canSubmit) return;
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.append("audio", audioFile);
    fd.append("displayName", displayName.trim());
    fd.append("genreJson", JSON.stringify(selectedGenres));
    fd.append("moodJson", JSON.stringify(selectedMoods));
    fd.append("eligiblePoolsJson", JSON.stringify(selectedPools));
    fd.append("competitionEligible", competitionEligible ? "true" : "false");
    fd.append("licenseType", licenseType);
    fd.append("royaltySplitsJson", JSON.stringify(splits));
    fd.append("rightsDeclarationAccepted", "true");
    if (estimatedBpm) fd.append("estimatedBpm", estimatedBpm);
    if (musicalKey)   fd.append("musicalKey", musicalKey);
    if (energyLevel)  fd.append("energyLevel", energyLevel);

    try {
      const res = await fetch("/api/beats/submit", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setError(json.details ?? json.error ?? "Submission failed. Please retry.");
        setSubmitting(false);
        return;
      }
      setResult(json as SubmitResult);
      setStep("confirm");
    } catch {
      setError("Network error. Check connection and retry.");
    } finally {
      setSubmitting(false);
    }
  }, [audioFile, canSubmit, displayName, selectedGenres, selectedMoods, selectedPools,
      competitionEligible, licenseType, splits, estimatedBpm, musicalKey, energyLevel]);

  const resetForm = () => {
    setStep("upload");
    setAudioFile(null);
    setDisplayName("");
    setSelectedGenres([]);
    setSelectedMoods([]);
    setEstimatedBpm("");
    setMusicalKey("");
    setEnergyLevel("");
    setLicenseType("STANDARD");
    setSelectedPools([]);
    setCompetitionEligible(false);
    setSplits([{ recipientName: producerName, percentage: 100, role: "primary_producer" }]);
    setRightsAccepted(false);
    setResult(null);
    setError(null);
  };

  // ── Styles ─────────────────────────────────────────────────────────────────

  const s = {
    root: {
      display: "flex",
      flexDirection: "column" as const,
      gap: 0,
      background: "#0a0614",
      minHeight: "100%",
      color: "#fff",
      fontFamily: "inherit",
    },
    header: {
      padding: "16px 20px 12px",
      borderBottom: "1px solid rgba(255,107,26,0.18)",
    },
    title: {
      fontSize: 11,
      fontWeight: 900,
      letterSpacing: "0.14em",
      color: ac,
      margin: 0,
    },
    steps: {
      display: "flex",
      gap: 4,
      padding: "10px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    stepDot: (active: boolean, done: boolean) => ({
      height: 4,
      flex: 1,
      borderRadius: 2,
      background: done ? ac : active ? "rgba(255,107,26,0.5)" : "rgba(255,255,255,0.1)",
    }),
    body: { padding: "16px 20px", flex: 1, display: "flex", flexDirection: "column" as const, gap: 14 },
    label: { fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", marginBottom: 6, display: "block" },
    input: {
      width: "100%",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 6,
      padding: "8px 10px",
      color: "#fff",
      fontSize: 13,
      outline: "none",
      boxSizing: "border-box" as const,
    },
    chipRow: { display: "flex", flexWrap: "wrap" as const, gap: 6 },
    chip: (active: boolean) => ({
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: "0.06em",
      padding: "4px 10px",
      borderRadius: 20,
      cursor: "pointer",
      border: `1px solid ${active ? ac : "rgba(255,255,255,0.15)"}`,
      background: active ? `${ac}20` : "transparent",
      color: active ? ac : "rgba(255,255,255,0.5)",
    }),
    footer: {
      padding: "12px 20px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    btnPrimary: (disabled: boolean) => ({
      padding: "9px 20px",
      background: disabled ? "rgba(255,107,26,0.3)" : ac,
      color: disabled ? "rgba(255,255,255,0.4)" : "#000",
      border: "none",
      borderRadius: 6,
      fontSize: 10,
      fontWeight: 900,
      letterSpacing: "0.1em",
      cursor: disabled ? "not-allowed" : "pointer",
    }),
    btnGhost: {
      padding: "9px 16px",
      background: "transparent",
      color: "rgba(255,255,255,0.4)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 6,
      fontSize: 10,
      fontWeight: 700,
      cursor: "pointer",
    },
  };

  const StepDots = () => (
    <div style={s.steps}>
      {STEP_ORDER.filter((s) => s !== "confirm").map((st, i) => (
        <div key={st} style={s.stepDot(st === step, i < stepIndex)} />
      ))}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  if (step === "confirm" && result) {
    return (
      <div style={s.root}>
        <div style={s.header}>
          <p style={s.title}>SUBMISSION CENTER</p>
        </div>
        <div style={{ ...s.body, alignItems: "center", textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>✓</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: ac }}>Beat Received</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
            {result.message}
          </div>
          <div style={{
            background: "rgba(255,107,26,0.1)",
            border: `1px solid ${ac}40`,
            borderRadius: 8,
            padding: "12px 16px",
            width: "100%",
            textAlign: "left",
          }}>
            <div style={s.label}>CANONICAL ID (PERMANENT)</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: ac, letterSpacing: "0.08em" }}>
              {result.canonicalId}
            </div>
            <div style={{ ...s.label, marginTop: 10 }}>STATUS</div>
            <div style={{ fontSize: 11, color: "#FFD700" }}>
              {result.status.replace("_", " ")}
            </div>
          </div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
            Technical certification has been queued. You will be notified when a reviewer
            is assigned. Your canonical ID is permanent — save it for reference.
          </p>
        </div>
        <div style={s.footer}>
          <button style={s.btnGhost} onClick={resetForm}>SUBMIT ANOTHER</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <p style={s.title}>
          SUBMISSION CENTER
          {step !== "upload" && ` — ${step.toUpperCase()}`}
        </p>
      </div>
      <StepDots />

      {/* ── Step 1: Upload ── */}
      {step === "upload" && (
        <>
          <div style={s.body}>
            <div>
              <span style={s.label}>AUDIO FILE</span>
              <div
                style={{
                  border: `2px dashed ${audioFile ? ac : "rgba(255,255,255,0.15)"}`,
                  borderRadius: 8,
                  padding: "24px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: audioFile ? `${ac}08` : "transparent",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {audioFile ? (
                  <>
                    <div style={{ fontSize: 20 }}>🎵</div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: ac, marginTop: 6 }}>
                      {audioFile.name}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                      {(audioFile.size / 1048576).toFixed(1)} MB
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 20 }}>⬆</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
                      Drop audio file or click to browse
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                      MP3 · WAV · AIFF · FLAC · Max 100 MB
                    </div>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.aiff,.aif,.flac,audio/*"
                style={{ display: "none" }}
                onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <div style={s.footer}>
            <span />
            <button
              style={s.btnPrimary(!canProceedToMetadata)}
              disabled={!canProceedToMetadata}
              onClick={() => setStep("metadata")}
            >
              NEXT: METADATA →
            </button>
          </div>
        </>
      )}

      {/* ── Step 2: Metadata ── */}
      {step === "metadata" && (
        <>
          <div style={{ ...s.body, overflowY: "auto", maxHeight: "calc(100vh - 180px)" }}>
            <div>
              <span style={s.label}>BEAT TITLE *</span>
              <input
                style={s.input}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Midnight Grind"
                maxLength={80}
              />
            </div>
            <div>
              <span style={s.label}>GENRE * (select one or more)</span>
              <div style={s.chipRow}>
                {GENRE_OPTIONS.map((g) => (
                  <span
                    key={g}
                    style={s.chip(selectedGenres.includes(g))}
                    onClick={() => toggleChip(selectedGenres, g, setSelectedGenres)}
                  >
                    {g.replace("_", " ").toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span style={s.label}>MOOD / ENERGY</span>
              <div style={s.chipRow}>
                {MOOD_OPTIONS.map((m) => (
                  <span
                    key={m}
                    style={s.chip(selectedMoods.includes(m))}
                    onClick={() => toggleChip(selectedMoods, m, setSelectedMoods)}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <span style={s.label}>EST. BPM</span>
                <input
                  style={s.input}
                  type="number"
                  value={estimatedBpm}
                  onChange={(e) => setEstimatedBpm(e.target.value)}
                  placeholder="120"
                  min={40}
                  max={250}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span style={s.label}>MUSICAL KEY</span>
                <input
                  style={s.input}
                  value={musicalKey}
                  onChange={(e) => setMusicalKey(e.target.value)}
                  placeholder="F# minor"
                  maxLength={20}
                />
              </div>
            </div>
            <div>
              <span style={s.label}>LICENSE TYPE</span>
              <select
                style={{ ...s.input, cursor: "pointer" }}
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
              >
                <option value="STANDARD">Standard</option>
                <option value="LIMITED">Limited</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="EXCLUSIVE">Exclusive</option>
                <option value="LIVE_AUCTION">Live Auction</option>
              </select>
            </div>
          </div>
          <div style={s.footer}>
            <button style={s.btnGhost} onClick={() => setStep("upload")}>← BACK</button>
            <button
              style={s.btnPrimary(!canProceedToEligibility)}
              disabled={!canProceedToEligibility}
              onClick={() => setStep("eligibility")}
            >
              NEXT: ELIGIBILITY →
            </button>
          </div>
        </>
      )}

      {/* ── Step 3: Eligibility / Placement Pools ── */}
      {step === "eligibility" && (
        <>
          <div style={s.body}>
            <div>
              <span style={s.label}>WHERE CAN THIS BEAT BE USED? * (select all that apply)</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {POOL_OPTIONS.map(({ value, label }) => (
                  <label
                    key={value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                      fontSize: 12,
                      color: selectedPools.includes(value) ? "#fff" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPools.includes(value)}
                      onChange={() => toggleChip(selectedPools, value, setSelectedPools)}
                      style={{ accentColor: ac, width: 14, height: 14 }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                paddingTop: 8,
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <input
                type="checkbox"
                checked={competitionEligible}
                onChange={(e) => setCompetitionEligible(e.target.checked)}
                style={{ accentColor: ac, width: 14, height: 14 }}
              />
              <span>
                <strong>Competition Eligible</strong>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>
                  {" "}— allows use in ranked Battles, Cyphers, and Championships
                </span>
              </span>
            </label>
          </div>
          <div style={s.footer}>
            <button style={s.btnGhost} onClick={() => setStep("metadata")}>← BACK</button>
            <button
              style={s.btnPrimary(!canProceedToRights)}
              disabled={!canProceedToRights}
              onClick={() => setStep("rights")}
            >
              NEXT: RIGHTS →
            </button>
          </div>
        </>
      )}

      {/* ── Step 4: Rights & Splits ── */}
      {step === "rights" && (
        <>
          <div style={{ ...s.body, overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
            <div>
              <span style={s.label}>ROYALTY SPLITS (must total 100%)</span>
              {splits.map((split, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 60px 120px auto",
                    gap: 6,
                    marginBottom: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    style={s.input}
                    value={split.recipientName}
                    onChange={(e) => updateSplit(i, "recipientName", e.target.value)}
                    placeholder="Name"
                  />
                  <input
                    style={{ ...s.input, textAlign: "center" }}
                    type="number"
                    value={split.percentage}
                    onChange={(e) => updateSplit(i, "percentage", parseFloat(e.target.value) || 0)}
                    min={0}
                    max={100}
                    step={0.5}
                  />
                  <select
                    style={{ ...s.input, fontSize: 10, cursor: "pointer" }}
                    value={split.role}
                    onChange={(e) => updateSplit(i, "role", e.target.value)}
                  >
                    {SPLIT_ROLES.map((r) => (
                      <option key={r} value={r}>{r.replace("_", " ")}</option>
                    ))}
                  </select>
                  {splits.length > 1 && (
                    <button
                      style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14 }}
                      onClick={() => setSplits((prev) => prev.filter((_, j) => j !== i))}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <span style={{ fontSize: 10, color: Math.abs(splitsTotal - 100) < 0.01 ? "#00FF00" : "#FF4444" }}>
                  Total: {splitsTotal.toFixed(1)}%
                  {Math.abs(splitsTotal - 100) < 0.01 ? " ✓" : " (must equal 100%)"}
                </span>
                <button
                  style={{ ...s.btnGhost, padding: "5px 10px", fontSize: 9 }}
                  onClick={() => setSplits((prev) => [...prev, { recipientName: "", percentage: 0, role: "co_producer" }])}
                >
                  + ADD SPLIT
                </button>
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
              <span style={s.label}>RIGHTS DECLARATION</span>
              <label style={{ display: "flex", gap: 10, cursor: "pointer", alignItems: "flex-start" }}>
                <input
                  type="checkbox"
                  checked={rightsAccepted}
                  onChange={(e) => setRightsAccepted(e.target.checked)}
                  style={{ accentColor: ac, marginTop: 2, flexShrink: 0 }}
                />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                  I confirm I own or control the rights to this instrumental. I grant TMI a
                  non-exclusive license to use it on the platform per the{" "}
                  <a href="/terms/beats" style={{ color: ac }} target="_blank" rel="noreferrer">
                    Beat Creator Terms
                  </a>
                  . I have not sampled copyrighted material without clearance.
                </span>
              </label>
            </div>
            {error && (
              <div style={{
                background: "rgba(255,68,68,0.1)",
                border: "1px solid rgba(255,68,68,0.3)",
                borderRadius: 6,
                padding: "10px 12px",
                fontSize: 11,
                color: "#FF8888",
              }}>
                {error}
              </div>
            )}
          </div>
          <div style={s.footer}>
            <button style={s.btnGhost} onClick={() => { setError(null); setStep("eligibility"); }}>← BACK</button>
            <button
              style={s.btnPrimary(!canSubmit || submitting)}
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "UPLOADING…" : "SUBMIT BEAT →"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
