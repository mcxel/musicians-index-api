"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type AccountType = "MEMBER" | "ARTIST" | "ADVERTISER" | "SPONSOR" | "VENUE";
type Step = "TYPE" | "DETAILS" | "PROVISIONING" | "DONE";

const ACCOUNT_TYPES: Array<{
  type: AccountType; label: string; icon: string; color: string;
  tagline: string; perks: string[];
}> = [
  { type: "MEMBER",     icon: "🎧", color: "#00FFFF", label: "Member",
    tagline: "Fan, listener, community member",
    perks: ["All live rooms", "Chat & react", "Earn points & rewards", "Vote in contests"] },
  { type: "ARTIST",     icon: "🎤", color: "#FF2DAA", label: "Artist",
    tagline: "Performer, producer, creator",
    perks: ["Artist profile", "Beat Lab", "NFT Lab", "Cypher & battle rooms"] },
  { type: "ADVERTISER", icon: "📢", color: "#FFD700", label: "Advertiser",
    tagline: "Brand, agency, media buyer",
    perks: ["Ad placement dashboard", "Campaign workspace", "Analytics & reporting"] },
  { type: "SPONSOR",    icon: "🏆", color: "#AA2DFF", label: "Sponsor",
    tagline: "Sponsor contests, battles & artists",
    perks: ["Reward contribution pipeline", "Contest linkage", "Fulfillment tracking"] },
  { type: "VENUE",      icon: "🏟️", color: "#FF9500", label: "Venue",
    tagline: "Venue owner, event organizer",
    perks: ["Venue profile", "Booking workspace", "Event calendar"] },
];

export default function SignupPage() {
  const [step, setStep] = useState<Step>("TYPE");
  const [accountType, setAccountType] = useState<AccountType>("MEMBER");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [provSteps, setProvSteps] = useState<string[]>([]);

  const sel = ACCOUNT_TYPES.find(t => t.type === accountType)!;

  async function handleSignup() {
    setError("");
    if (!form.name || !form.email || !form.password) { setError("All fields required."); return; }
    setStep("PROVISIONING");
    try {
      const regRes = await fetch("/api/auth/register", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: accountType }),
      });
      const regData = await regRes.json().catch(() => ({}));
      const userId = (regData as { id?: string }).id ?? `stub_${Date.now()}`;
      const provRes = await fetch("/api/auth/provision", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, accountType }),
      });
      const prov = await provRes.json();
      setProvSteps(
        ((prov as { steps?: Array<{ step: string }> }).steps ?? []).map((s: { step: string }) => s.step)
      );
      setStep("DONE");
    } catch {
      setError("Signup failed — please try again.");
      setStep("DETAILS");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050510", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#00FFFF", fontWeight: 800, marginBottom: 6 }}>THE MUSICIANS INDEX</div>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 3, color: "#fff" }}>CREATE ACCOUNT</div>
      </motion.div>

      <div style={{ width: "100%", maxWidth: 560 }}>
        <AnimatePresence mode="wait">

          {step === "TYPE" && (
            <motion.div key="type" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 14, textAlign: "center" }}>STEP 1 OF 2 — CHOOSE ACCOUNT TYPE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ACCOUNT_TYPES.map(t => (
                  <motion.button key={t.type} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setAccountType(t.type)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                      borderRadius: 9, cursor: "pointer", textAlign: "left",
                      background: accountType === t.type ? `${t.color}12` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${accountType === t.type ? t.color : "rgba(255,255,255,0.07)"}`,
                    }}
                  >
                    <span style={{ fontSize: 26, flexShrink: 0 }}>{t.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: accountType === t.type ? t.color : "#fff", marginBottom: 2 }}>{t.label}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{t.tagline}</div>
                    </div>
                    {accountType === t.type && <div style={{ fontSize: 8, color: t.color, fontWeight: 800, letterSpacing: "0.1em" }}>SELECTED ✓</div>}
                  </motion.button>
                ))}
              </div>
              <div style={{ margin: "14px 0", padding: "10px 14px", background: `${sel.color}08`, border: `1px solid ${sel.color}18`, borderRadius: 7 }}>
                <div style={{ fontSize: 7, letterSpacing: "0.15em", color: sel.color, fontWeight: 700, marginBottom: 6 }}>INCLUDES</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {sel.perks.map(p => <span key={p} style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "2px 8px" }}>{p}</span>)}
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setStep("DETAILS")}
                style={{ width: "100%", padding: "13px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: `linear-gradient(135deg, ${sel.color}, ${sel.color}AA)`, border: "none", borderRadius: 7, cursor: "pointer" }}
              >CONTINUE AS {sel.label.toUpperCase()} →</motion.button>
              <div style={{ textAlign: "center", marginTop: 14, fontSize: 10, color: "rgba(255,255,255,0.28)" }}>
                Already have an account? <Link href="/auth" style={{ color: "#00FFFF" }}>Sign in</Link>
              </div>
            </motion.div>
          )}

          {step === "DETAILS" && (
            <motion.div key="details" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <button onClick={() => setStep("TYPE")} style={{ background: "none", border: "none", color: "#00FFFF", cursor: "pointer", fontSize: 18 }}>←</button>
                <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)" }}>STEP 2 OF 2 — {sel.icon} {sel.label.toUpperCase()} DETAILS</div>
              </div>
              {([["name","Display Name","text","Your name or artist alias"],["email","Email Address","email","you@example.com"],["password","Password","password","8+ characters"]] as [keyof typeof form, string, string, string][]).map(([key, lbl, type, ph]) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", marginBottom: 5, fontWeight: 700 }}>{lbl.toUpperCase()}</label>
                  <input type={type} placeholder={ph} value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "11px 13px", fontSize: 13, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#fff", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}
              {error && <div style={{ color: "#FF3C3C", fontSize: 10, marginBottom: 10 }}>{error}</div>}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleSignup}
                style={{ width: "100%", padding: "13px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: `linear-gradient(135deg, ${sel.color}, ${sel.color}AA)`, border: "none", borderRadius: 7, cursor: "pointer" }}
              >CREATE {sel.label.toUpperCase()} ACCOUNT</motion.button>
            </motion.div>
          )}

          {step === "PROVISIONING" && (
            <motion.div key="prov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "48px 0" }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ fontSize: 48, display: "inline-block", marginBottom: 20 }}>⚙️</motion.div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFFF", marginBottom: 8 }}>BUILDING YOUR WORKSPACE</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Creating profile · wallet · inventory · bots...</div>
            </motion.div>
          )}

          {step === "DONE" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "20px 0" }}>
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6 }} style={{ fontSize: 52, marginBottom: 14 }}>✅</motion.div>
              <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: 2, color: "#00FF88", marginBottom: 8 }}>WORKSPACE READY</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Your {sel.label} account is live. Bots assigned. Inventory loaded.</div>
              {provSteps.length > 0 && (
                <div style={{ textAlign: "left", background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.12)", borderRadius: 7, padding: "10px 14px", marginBottom: 18 }}>
                  <div style={{ fontSize: 7, letterSpacing: "0.15em", color: "#00FF88", fontWeight: 700, marginBottom: 7 }}>PROVISION CHAIN</div>
                  {provSteps.map(s => (
                    <div key={s} style={{ display: "flex", gap: 8, fontSize: 9, color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>
                      <span style={{ color: "#00FF88" }}>✓</span><span>{s.replace(/_/g, " ")}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <Link href="/dashboard" style={{ padding: "11px 22px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", background: `linear-gradient(135deg, ${sel.color}, ${sel.color}88)`, color: "#050510", borderRadius: 6, textDecoration: "none" }}>GO TO DASHBOARD</Link>
                <Link href={`/onboarding/${accountType.toLowerCase()}`} style={{ padding: "11px 22px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", background: "rgba(255,255,255,0.06)", color: "#fff", borderRadius: 6, textDecoration: "none" }}>START TUTORIAL</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
