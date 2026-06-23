"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getBeatById, listBeatCatalog, type BeatCatalogEntry } from "@/lib/beats/BeatStoreEngine";
import { resolveLicenseTerms, type BeatLicenseType } from "@/lib/beats/BeatLicenseResolver";

const LICENSE_TIERS: { key: BeatLicenseType; label: string; color: string }[] = [
  { key: "mp3-lease",        label: "Basic",     color: "rgba(255,255,255,0.6)" },
  { key: "wav-lease",        label: "Premium",   color: "#FFD700" },
  { key: "unlimited-lease",  label: "Unlimited", color: "#AA2DFF" },
  { key: "exclusive-rights", label: "Exclusive", color: "#FF2DAA" },
];

function PurchaseButton({
  beat,
  licenseType,
  color,
}: {
  beat: BeatCatalogEntry;
  licenseType: BeatLicenseType;
  color: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const terms = resolveLicenseTerms(licenseType);
  const priceCents = beat.licensePricing[licenseType];

  async function handleBuy() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/beats/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beatId: beat.beatId, licenseType, price: priceCents }),
        credentials: "include",
      });
      const data = await res.json() as { ok?: boolean; url?: string; error?: string };
      if (data.url) {
        router.push(data.url);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={() => void handleBuy()}
      disabled={loading}
      style={{
        display: "block",
        width: "100%",
        textAlign: "center",
        padding: "14px",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: "0.15em",
        color: loading ? "rgba(255,255,255,0.4)" : "#050510",
        background: loading ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg, ${color}, ${color}99)`,
        borderRadius: 10,
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        marginBottom: 12,
      }}
    >
      {loading ? "PROCESSING…" : `PURCHASE ${terms.label.toUpperCase()} — $${(priceCents / 100).toFixed(2)}`}
    </button>
  );
}

export default function BeatDetailPage() {
  const params = useParams();
  const raw = params?.beatId;
  const beatId = typeof raw === "string" ? raw : Array.isArray(raw) ? (raw[0] ?? "") : "";

  // Fetch from BeatStoreEngine (canonical registry — Rule 8)
  const beat = getBeatById(beatId);

  // Fallback to first available beat if slug not found
  const catalog = listBeatCatalog();
  const displayBeat = beat ?? catalog[0];

  const [selectedLicense, setSelectedLicense] = useState<BeatLicenseType>("mp3-lease");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const terms = resolveLicenseTerms(selectedLicense);
  const accentColor = LICENSE_TIERS.find((t) => t.key === selectedLicense)?.color ?? "#FFD700";

  function togglePreview() {
    if (!displayBeat) return;
    if (playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
      setPlaying(false);
      setProgress(0);
    } else {
      // Try real audio file
      if (audioRef.current && displayBeat.previewAudioUrl && displayBeat.previewAudioUrl !== "/previews/placeholder.mp3") {
        audioRef.current.src = displayBeat.previewAudioUrl;
        void audioRef.current.play().catch(() => {});
        audioRef.current.ontimeupdate = () => {
          if (!audioRef.current) return;
          const pct = (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100;
          setProgress(pct);
          if (pct >= 100) { setPlaying(false); setProgress(0); }
        };
      } else {
        // Simulate progress for watermark preview
        timerRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              if (timerRef.current) clearInterval(timerRef.current);
              setPlaying(false);
              return 0;
            }
            return prev + 0.5;
          });
        }, 100);
      }
      setPlaying(true);
    }
  }

  if (!displayBeat) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>No beats available yet.</div>
        <Link href="/beats/marketplace" style={{ marginTop: 20, display: "inline-block", color: "#FFD700", fontSize: 11 }}>← Beat Marketplace</Link>
      </main>
    );
  }

  const similar = catalog.filter((b) => b.beatId !== displayBeat.beatId && b.genre === displayBeat.genre).slice(0, 3);
  const fallbackSimilar = similar.length > 0 ? similar : catalog.filter((b) => b.beatId !== displayBeat.beatId).slice(0, 3);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <audio ref={audioRef} style={{ display: "none" }} />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 32, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          <Link href="/beats/marketplace" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Beat Marketplace</Link>
          <span>›</span>
          <span style={{ color: "#FFD700" }}>{displayBeat.genre}</span>
          <span>›</span>
          <span style={{ color: "#fff" }}>{displayBeat.title}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>

          {/* Left: artwork + audio player */}
          <div>
            <div style={{
              background: "linear-gradient(135deg, rgba(255,215,0,0.12), rgba(5,5,16,1))",
              border: "1px solid rgba(255,215,0,0.25)",
              borderRadius: 20,
              padding: "60px 0",
              textAlign: "center",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 72, marginBottom: 8 }}>🎵</div>
              <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800 }}>
                {displayBeat.genre.toUpperCase()} · {displayBeat.bpm} BPM
              </div>
            </div>

            {/* Audio player */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <button
                  onClick={togglePreview}
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: playing ? "#FFD700" : "rgba(255,215,0,0.15)",
                    border: "1px solid #FFD700",
                    color: playing ? "#050510" : "#FFD700",
                    fontSize: 18, cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {playing ? "⏸" : "▶"}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{displayBeat.title}</div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${progress}%`, height: "100%", background: "#FFD700", borderRadius: 2, transition: "width 0.1s linear" }} />
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                WATERMARKED PREVIEW — Purchase a license for the full track
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "BPM",   value: String(displayBeat.bpm),   color: "#FFD700" },
                { label: "GENRE", value: displayBeat.genre,         color: "#00FFFF" },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: info + licensing */}
          <div>
            {displayBeat.tags.includes("battle") && (
              <span style={{ fontSize: 8, fontWeight: 800, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.4)", borderRadius: 4, padding: "3px 10px", marginBottom: 12, display: "inline-block" }}>
                BATTLE READY
              </span>
            )}

            <h1 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, margin: "8px 0 4px" }}>{displayBeat.title}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>by</div>
              <Link href={`/profile/performer/${displayBeat.producerSlug}`} style={{ fontSize: 13, fontWeight: 700, color: "#FFD700", textDecoration: "none" }}>
                {displayBeat.producerName}
              </Link>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              <span style={{ fontSize: 9, color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 4, padding: "3px 8px" }}>{displayBeat.genre}</span>
              {displayBeat.tags.map((t) => (
                <span key={t} style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "3px 8px" }}>#{t}</span>
              ))}
            </div>

            {/* License selector */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 12 }}>SELECT LICENSE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {LICENSE_TIERS.map(({ key, label, color }) => {
                  const t = resolveLicenseTerms(key);
                  const priceCents = displayBeat.licensePricing[key];
                  const isSelected = selectedLicense === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedLicense(key)}
                      style={{
                        padding: "14px 16px",
                        background: isSelected ? `${color}10` : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isSelected ? color : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 10,
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: isSelected ? color : "#fff", marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{t.description}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{t.limitations[0]}</div>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: isSelected ? color : "rgba(255,255,255,0.5)", flexShrink: 0, marginLeft: 16 }}>
                        ${(priceCents / 100).toFixed(0)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Purchase CTA — calls real /api/beats/checkout */}
            <PurchaseButton beat={displayBeat} licenseType={selectedLicense} color={accentColor} />

            {/* Download preview */}
            <button
              onClick={togglePreview}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: 11,
                fontWeight: 700,
                color: "#FFD700",
                background: "transparent",
                border: "1px solid rgba(255,215,0,0.3)",
                borderRadius: 10,
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
            >
              {playing ? "⏸ STOP PREVIEW" : "▶ PLAY PREVIEW"}
            </button>
          </div>
        </div>

        {/* Similar beats */}
        {fallbackSimilar.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 20 }}>SIMILAR BEATS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
              {fallbackSimilar.map((b) => (
                <Link key={b.beatId} href={`/beats/marketplace/${b.beatId}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,215,0,0.12)", borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(255,215,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🎵</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.title}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{b.producerName} · {b.bpm} BPM</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#FFD700", flexShrink: 0 }}>
                      ${(b.licensePricing["mp3-lease"] / 100).toFixed(0)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
