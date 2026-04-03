"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";

const DRUM_KITS = ["808 South", "Trap Titans", "Boom Bap Classic", "Lo-Fi Chill", "EDM Puncher", "R&B Groove"];
const SAMPLE_PACKS = ["Melody Vault 1", "Soul Chops 44", "Piano Series V3", "String Runs 7", "Bell Tones 12", "Guitar Loop S5"];
const LOOP_PACKS = ["One Shot Vol 1", "Chop Kit 3000", "Vinyl Crates 2", "City Jazz Cuts", "Dark Trap Loops", "Lo-Fi Dreams"];
const BPM_MARKS = [70, 80, 90, 100, 120, 140, 160, 180];
const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SCALES = ["Major", "Minor", "Pentatonic Minor", "Blues Minor", "Chromatic", "Dorian"];

export default function BeatLabCreatePage() {
  const [bpm, setBpm] = useState(140);
  const [keyNote, setKeyNote] = useState("A");
  const [scale, setScale] = useState("Minor");
  const [selectedKit, setSelectedKit] = useState(DRUM_KITS[0]);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [selectedLoop, setSelectedLoop] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState(false);
  const [step, setStep] = useState<"build" | "preview" | "pricing">("build");

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

          {/* Top bar */}
          <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid rgba(255,45,170,0.15)", display: "flex", alignItems: "center", gap: 20 }}>
            <Link href="/beat-lab" style={{ color: "#FF2DAA", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>← BEAT LAB</Link>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, letterSpacing: 4, color: "#FF2DAA", fontWeight: 800, marginBottom: 3 }}>NEW BEAT</div>
              <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: 3, margin: 0 }}>BEAT FORGE</h1>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {["build", "preview", "pricing"].map(s => (
                <button key={s} onClick={() => setStep(s as any)} style={{
                  padding: "7px 18px", borderRadius: 20, border: "1px solid rgba(255,45,170,0.3)",
                  background: step === s ? "rgba(255,45,170,0.2)" : "transparent",
                  color: step === s ? "#FF2DAA" : "#666", fontWeight: 700, fontSize: 10,
                  letterSpacing: 2, cursor: "pointer", textTransform: "uppercase",
                }}>{s}</button>
              ))}
            </div>
          </div>

          {step === "build" && (
            <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>

              {/* BPM + Key Section */}
              <div style={{ background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.15)", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#00FFFF", fontWeight: 800, marginBottom: 16 }}>TEMPO + KEY</div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#aaa" }}>BPM</span>
                    <span style={{ fontSize: 28, fontWeight: 900, color: "#00FFFF" }}>{bpm}</span>
                  </div>
                  <input type="range" min={60} max={200} value={bpm} onChange={e => setBpm(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#00FFFF" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    {BPM_MARKS.map(m => <span key={m} style={{ fontSize: 8, color: "#333" }}>{m}</span>)}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: "#aaa", marginBottom: 8 }}>KEY</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {KEYS.map(k => (
                      <button key={k} onClick={() => setKeyNote(k)} style={{
                        padding: "5px 10px", borderRadius: 6, cursor: "pointer",
                        background: keyNote === k ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${keyNote === k ? "#00FFFF" : "rgba(255,255,255,0.1)"}`,
                        color: keyNote === k ? "#00FFFF" : "#aaa", fontWeight: 700, fontSize: 10,
                      }}>{k}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: "#aaa", marginBottom: 8 }}>SCALE</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {SCALES.map(sc => (
                      <button key={sc} onClick={() => setScale(sc)} style={{
                        padding: "6px 12px", borderRadius: 6, cursor: "pointer", textAlign: "left",
                        background: scale === sc ? "rgba(0,255,255,0.15)" : "transparent",
                        border: `1px solid ${scale === sc ? "#00FFFF" : "rgba(255,255,255,0.07)"}`,
                        color: scale === sc ? "#00FFFF" : "#888", fontSize: 11,
                      }}>{sc}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drum Kit */}
              <div style={{ background: "rgba(255,45,170,0.04)", border: "1px solid rgba(255,45,170,0.15)", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#FF2DAA", fontWeight: 800, marginBottom: 16 }}>DRUM KITS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                  {DRUM_KITS.map(kit => (
                    <button key={kit} onClick={() => setSelectedKit(kit)} style={{
                      padding: "10px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                      background: selectedKit === kit ? "rgba(255,45,170,0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selectedKit === kit ? "#FF2DAA" : "rgba(255,255,255,0.08)"}`,
                      color: selectedKit === kit ? "#FF2DAA" : "#aaa", fontSize: 12, fontWeight: selectedKit === kit ? 700 : 400,
                    }}>🥁 {kit}</button>
                  ))}
                </div>

                {/* Pad grid */}
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#aaa", marginBottom: 10 }}>PAD GRID</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                  {["KICK", "SNARE", "HH", "OPEN HH", "CLAP", "RIDE", "PERC 1", "PERC 2"].map(pad => (
                    <motion.button key={pad} whileTap={{ scale: 0.88, background: "rgba(255,45,170,0.4)" }} style={{
                      aspectRatio: "1", borderRadius: 8, cursor: "pointer",
                      background: "rgba(255,45,170,0.08)",
                      border: "1px solid rgba(255,45,170,0.2)",
                      color: "#FF2DAA", fontSize: 7, fontWeight: 800, letterSpacing: 1,
                    }}>{pad}</motion.button>
                  ))}
                </div>
              </div>

              {/* Samples + Loops */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "rgba(170,45,255,0.04)", border: "1px solid rgba(170,45,255,0.15)", borderRadius: 12, padding: 20, flex: 1 }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, color: "#AA2DFF", fontWeight: 800, marginBottom: 14 }}>SAMPLE PACKS</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {SAMPLE_PACKS.map(sp => (
                      <button key={sp} onClick={() => setSelectedSample(sp)} style={{
                        padding: "8px 12px", borderRadius: 6, cursor: "pointer", textAlign: "left",
                        background: selectedSample === sp ? "rgba(170,45,255,0.15)" : "transparent",
                        border: `1px solid ${selectedSample === sp ? "#AA2DFF" : "rgba(255,255,255,0.07)"}`,
                        color: selectedSample === sp ? "#AA2DFF" : "#888", fontSize: 11,
                      }}>🎼 {sp}</button>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 12, padding: 20, flex: 1 }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 14 }}>LOOP PACKS</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {LOOP_PACKS.map(lp => (
                      <button key={lp} onClick={() => setSelectedLoop(lp)} style={{
                        padding: "8px 12px", borderRadius: 6, cursor: "pointer", textAlign: "left",
                        background: selectedLoop === lp ? "rgba(255,215,0,0.15)" : "transparent",
                        border: `1px solid ${selectedLoop === lp ? "#FFD700" : "rgba(255,255,255,0.07)"}`,
                        color: selectedLoop === lp ? "#FFD700" : "#888", fontSize: 11,
                      }}>🔄 {lp}</button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {step === "pricing" && (
            <div style={{ padding: "32px", maxWidth: 500 }}>
              <div style={{ fontSize: 9, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 20 }}>PRICING + RIGHTS</div>
              {[
                { label: "NON-EXCLUSIVE LEASE", price: "$29", desc: "Buyer gets limited use, you keep rights, can sell again" },
                { label: "EXCLUSIVE LEASE", price: "$149", desc: "Buyer gets near-full rights, you keep writer credit" },
                { label: "EXCLUSIVE BUYOUT", price: "$499", desc: "Buyer owns it fully — no further sales" },
                { label: "FREE DOWNLOAD", price: "$0", desc: "Promotional only — no commercial use" },
              ].map(opt => (
                <div key={opt.label} style={{
                  padding: 16, borderRadius: 10, marginBottom: 10,
                  background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.15)", cursor: "pointer",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#FFD700" }}>{opt.label}</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: "#FFD700" }}>{opt.price}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#888", margin: "6px 0 0", lineHeight: 1.5 }}>{opt.desc}</p>
                </div>
              ))}
              <motion.button whileTap={{ scale: 0.97 }} style={{
                marginTop: 20, width: "100%", padding: "14px 0", borderRadius: 10,
                background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)", border: "none",
                color: "#fff", fontWeight: 900, fontSize: 13, letterSpacing: 3, cursor: "pointer",
              }}>
                PUBLISH BEAT →
              </motion.button>
            </div>
          )}

        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
