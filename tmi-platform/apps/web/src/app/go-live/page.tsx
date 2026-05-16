"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = "setup" | "configure" | "preview" | "live";

export default function GoLivePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("setup");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"CONCERT" | "CYPHER" | "BATTLE" | "SESSION">("CONCERT");
  const [ticketed, setTicketed] = useState(false);
  const [price, setPrice] = useState("0");

  const TYPE_COLOR: Record<string, string> = {
    CONCERT: "#FF2DAA", CYPHER: "#00FFFF", BATTLE: "#FFD700", SESSION: "#00FF88",
  };
  const steps: Step[] = ["setup", "configure", "preview", "live"];

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
        <Link href="/hub" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← HUB
        </Link>

        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 4 }}>Go Live</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>
          Start a room, concert, battle, or session. Your audience is waiting.
        </p>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 900, background: step === s ? "#00FF88" : steps.indexOf(step) > i ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.06)", color: step === s ? "#050510" : "rgba(255,255,255,0.4)" }}>
                {i + 1}
              </div>
              {i < 3 && <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.08)" }} />}
            </div>
          ))}
          <div style={{ marginLeft: 16, fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            {step}
          </div>
        </div>

        {step === "setup" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 10 }}>STREAM TYPE</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["CONCERT", "CYPHER", "BATTLE", "SESSION"] as const).map(t => (
                  <button key={t} onClick={() => setType(t)} style={{ padding: "8px 18px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: type === t ? "#050510" : TYPE_COLOR[t], background: type === t ? TYPE_COLOR[t] : "transparent", border: `1px solid ${TYPE_COLOR[t]}50`, borderRadius: 6, cursor: "pointer" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>STREAM TITLE</div>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Friday Night Session" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <button onClick={() => title && setStep("configure")} disabled={!title} style={{ padding: "13px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: !title ? "rgba(0,255,136,0.2)" : "linear-gradient(135deg,#00FF88,#00AA88)", borderRadius: 10, border: "none", cursor: !title ? "not-allowed" : "pointer" }}>
              CONTINUE →
            </button>
          </div>
        )}

        {step === "configure" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: 4 }}>{type}</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
            </div>
            <div>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 10 }}>ACCESS</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setTicketed(false)} style={{ flex: 1, padding: "10px 0", fontSize: 10, fontWeight: 800, color: !ticketed ? "#050510" : "rgba(255,255,255,0.4)", background: !ticketed ? "#00FF88" : "transparent", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8, cursor: "pointer" }}>FREE</button>
                <button onClick={() => setTicketed(true)} style={{ flex: 1, padding: "10px 0", fontSize: 10, fontWeight: 800, color: ticketed ? "#050510" : "rgba(255,215,0,0.7)", background: ticketed ? "#FFD700" : "transparent", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, cursor: "pointer" }}>TICKETED</button>
              </div>
            </div>
            {ticketed && (
              <div>
                <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>TICKET PRICE ($)</div>
                <input type="number" min="1" value={price} onChange={e => setPrice(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep("setup")} style={{ flex: 1, padding: "12px 0", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, cursor: "pointer" }}>← BACK</button>
              <button onClick={() => setStep("preview")} style={{ flex: 2, padding: "12px 0", fontSize: 10, fontWeight: 800, color: "#050510", background: "linear-gradient(135deg,#00FF88,#00AA88)", borderRadius: 10, border: "none", cursor: "pointer" }}>PREVIEW →</button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 16, padding: "28px 24px" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00FF88", fontWeight: 700, marginBottom: 12 }}>STREAM PREVIEW</div>
              <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>{type} · {ticketed ? `$${price} per ticket` : "FREE"}</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, color: "rgba(0,255,136,0.7)" }}>🎙️ Mic: Ready</span>
                <span style={{ fontSize: 10, color: "rgba(0,255,136,0.7)" }}>📹 Camera: Ready</span>
                <span style={{ fontSize: 10, color: "rgba(0,255,136,0.7)" }}>🔊 Audio: Ready</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep("configure")} style={{ flex: 1, padding: "12px 0", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.4)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, cursor: "pointer" }}>← EDIT</button>
              <button onClick={() => { setStep("live"); setTimeout(() => router.push("/live/world"), 2000); }} style={{ flex: 2, padding: "12px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#00FF88,#00AA88)", borderRadius: 10, border: "none", cursor: "pointer" }}>
                🔴 GO LIVE NOW
              </button>
            </div>
          </div>
        )}

        {step === "live" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔴</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#00FF88", marginBottom: 10 }}>You&apos;re Live!</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              <strong style={{ color: "#fff" }}>{title}</strong> is now streaming. Redirecting to your room...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
