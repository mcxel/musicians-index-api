"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// ── Beat data registry (mirrors beats/marketplace/page.tsx) ───────────────────

const BEATS = [
  { id: "b1", title: "Midnight Bars", producer: "Wavetek", genre: "Hip-Hop", bpm: 140, key: "Cm", basicPrice: 29, premiumPrice: 59, exclusivePrice: 499, plays: 4200, tags: ["dark", "trap", "808s"], battleReady: true, description: "Dark trap production with heavy 808s and atmospheric layers. Perfect for hard-hitting rap performances.", duration: "3:24", color: "#FF2DAA" },
  { id: "b2", title: "Neon Circuit", producer: "Producer 88", genre: "EDM", bpm: 128, key: "Am", basicPrice: 35, premiumPrice: 79, exclusivePrice: 599, plays: 2800, tags: ["synth", "electronic", "build"], battleReady: false, description: "High-energy EDM build with neon synth stabs and driving percussion. Designed for stadium-sized energy.", duration: "4:02", color: "#00FFFF" },
  { id: "b3", title: "Gold Standard", producer: "FlowMaster", genre: "Trap", bpm: 145, key: "Gm", basicPrice: 29, premiumPrice: 59, exclusivePrice: 399, plays: 5600, tags: ["gold", "hard", "drums"], battleReady: true, description: "Hard trap knocks with layered hi-hat rolls and a commanding low end. The gold standard for cypher sessions.", duration: "2:58", color: "#FFD700" },
  { id: "b4", title: "Soul Splice", producer: "Krypt", genre: "R&B", bpm: 88, key: "Eb", basicPrice: 39, premiumPrice: 89, exclusivePrice: 699, plays: 3100, tags: ["soul", "smooth", "melody"], battleReady: false, description: "Smooth R&B with vintage soul samples and silky chord progressions. Ideal for emotive vocal performances.", duration: "3:47", color: "#AA2DFF" },
  { id: "b5", title: "Battle Code", producer: "Verse Knight", genre: "Hip-Hop", bpm: 95, key: "Dm", basicPrice: 29, premiumPrice: 59, exclusivePrice: 499, plays: 7800, tags: ["battle", "raw", "boom-bap"], battleReady: true, description: "Classic boom-bap energy with raw drums and a gritty sample chop. Made for battle stages and cyphers.", duration: "2:41", color: "#00FF88" },
  { id: "b6", title: "Frequency", producer: "Cold Spark", genre: "Instrumental", bpm: 110, key: "F", basicPrice: 45, premiumPrice: 99, exclusivePrice: 799, plays: 1900, tags: ["cinematic", "build", "epic"], battleReady: false, description: "Cinematic instrumental with orchestral build-ups and atmospheric textures. For epic storytelling.", duration: "5:12", color: "#FF9500" },
];

const SIMILAR_BEATS = [
  { id: "b1", title: "Midnight Bars", producer: "Wavetek", genre: "Hip-Hop", bpm: 140, price: 29, color: "#FF2DAA" },
  { id: "b3", title: "Gold Standard", producer: "FlowMaster", genre: "Trap", bpm: 145, price: 29, color: "#FFD700" },
  { id: "b5", title: "Battle Code", producer: "Verse Knight", genre: "Hip-Hop", bpm: 95, price: 29, color: "#00FF88" },
];

type LicenseId = "basic" | "premium" | "exclusive";

const LICENSE_INFO: Record<LicenseId, { label: string; desc: string; uses: string }> = {
  basic:     { label: "Basic",     desc: "Non-commercial use, streaming only",          uses: "Up to 500k streams" },
  premium:   { label: "Premium",   desc: "Commercial use, all platforms, live shows",   uses: "Unlimited streams" },
  exclusive: { label: "Exclusive", desc: "Full ownership — beat removed from store",    uses: "Yours forever" },
};

export default function BeatDetailPage() {
  const params = useParams();
  const raw = params?.beatId;
  const beatId = typeof raw === "string" ? raw : Array.isArray(raw) ? (raw[0] ?? "") : "";
  const beat = BEATS.find((b) => b.id === beatId) ?? BEATS[0];

  const [selectedLicense, setSelectedLicense] = useState<LicenseId>("basic");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const licensePrice: Record<LicenseId, number> = {
    basic: beat.basicPrice,
    premium: beat.premiumPrice,
    exclusive: beat.exclusivePrice,
  };

  function togglePreview() {
    setPlaying((p) => {
      if (!p) {
        // Simulate playback progress since we don't have a real audio file
        const timer = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) { clearInterval(timer); setPlaying(false); return 0; }
            return prev + 0.5;
          });
        }, 100);
      } else {
        setProgress(0);
      }
      return !p;
    });
  }

  const similar = SIMILAR_BEATS.filter((b) => b.id !== beat.id).slice(0, 3);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      {/* Hidden audio element for future real preview */}
      <audio ref={audioRef} style={{ display: "none" }} />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 32, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          <Link href="/beats/marketplace" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Beat Marketplace</Link>
          <span>›</span>
          <span style={{ color: beat.color }}>{beat.genre}</span>
          <span>›</span>
          <span style={{ color: "#fff" }}>{beat.title}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>

          {/* Left: artwork + audio player */}
          <div>
            {/* Artwork */}
            <div style={{
              background: `linear-gradient(135deg, ${beat.color}20, rgba(5,5,16,1))`,
              border: `1px solid ${beat.color}30`,
              borderRadius: 20,
              padding: "60px 0",
              textAlign: "center",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 72, marginBottom: 8 }}>🎵</div>
              <div style={{ fontSize: 9, letterSpacing: "0.3em", color: beat.color, fontWeight: 800 }}>
                {beat.genre.toUpperCase()} · {beat.bpm} BPM · {beat.key}
              </div>
            </div>

            {/* Audio player */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <button
                  onClick={togglePreview}
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: playing ? beat.color : `${beat.color}30`,
                    border: `1px solid ${beat.color}`,
                    color: playing ? "#050510" : beat.color,
                    fontSize: 18, cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {playing ? "⏸" : "▶"}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{beat.title}</div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${progress}%`, height: "100%", background: beat.color, borderRadius: 2, transition: "width 0.1s linear" }} />
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{beat.duration}</span>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                WATERMARKED PREVIEW — Purchase a license for full track
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "PLAYS", value: beat.plays.toLocaleString(), color: beat.color },
                { label: "BPM", value: String(beat.bpm), color: "#00FFFF" },
                { label: "KEY", value: beat.key, color: "#AA2DFF" },
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
            {beat.battleReady && (
              <span style={{ fontSize: 8, fontWeight: 800, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.4)", borderRadius: 4, padding: "3px 10px", marginBottom: 12, display: "inline-block" }}>
                ⚔ BATTLE READY
              </span>
            )}

            <h1 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, margin: "8px 0 4px" }}>{beat.title}</h1>

            {/* Producer */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>by</div>
              <Link href={`/profile/${beat.producer.toLowerCase().replace(/ /g, "-")}`} style={{ fontSize: 13, fontWeight: 700, color: beat.color, textDecoration: "none" }}>
                {beat.producer}
              </Link>
            </div>

            {/* Tags */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              <span style={{ fontSize: 9, color: beat.color, border: `1px solid ${beat.color}40`, borderRadius: 4, padding: "3px 8px" }}>{beat.genre}</span>
              {beat.tags.map((t) => (
                <span key={t} style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "3px 8px" }}>#{t}</span>
              ))}
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 24 }}>
              {beat.description}
            </p>

            {/* License selector */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 12 }}>SELECT LICENSE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(["basic", "premium", "exclusive"] as LicenseId[]).map((lid) => {
                  const li = LICENSE_INFO[lid];
                  const price = licensePrice[lid];
                  const isSelected = selectedLicense === lid;
                  const accentColor = lid === "basic" ? "rgba(255,255,255,0.5)" : lid === "premium" ? "#FFD700" : "#FF2DAA";
                  return (
                    <button
                      key={lid}
                      onClick={() => setSelectedLicense(lid)}
                      style={{
                        padding: "14px 16px",
                        background: isSelected ? `${accentColor}10` : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isSelected ? accentColor : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 10,
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: isSelected ? accentColor : "#fff", marginBottom: 2 }}>{li.label}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{li.desc}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{li.uses}</div>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: isSelected ? accentColor : "rgba(255,255,255,0.5)", flexShrink: 0, marginLeft: 16 }}>
                        ${price}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Purchase CTA */}
            <Link
              href={`/api/stripe/checkout?priceId=price_beat_${selectedLicense}&mode=payment&beatId=${beat.id}`}
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.15em",
                color: "#050510",
                background: `linear-gradient(135deg, ${beat.color}, ${beat.color}99)`,
                borderRadius: 10,
                textDecoration: "none",
                marginBottom: 12,
              }}
            >
              PURCHASE {LICENSE_INFO[selectedLicense].label.toUpperCase()} LICENSE — ${licensePrice[selectedLicense]}
            </Link>

            {/* Download preview */}
            <button
              onClick={togglePreview}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: 11,
                fontWeight: 700,
                color: beat.color,
                background: "transparent",
                border: `1px solid ${beat.color}40`,
                borderRadius: 10,
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
            >
              {playing ? "⏸ STOP PREVIEW" : "▶ DOWNLOAD PREVIEW"}
            </button>
          </div>
        </div>

        {/* Similar beats */}
        {similar.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 20 }}>SIMILAR BEATS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
              {similar.map((b) => (
                <Link key={b.id} href={`/beats/marketplace/${b.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${b.color}18`, borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `${b.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🎵</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.title}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{b.producer} · {b.bpm} BPM</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: b.color, flexShrink: 0 }}>${b.price}</div>
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
