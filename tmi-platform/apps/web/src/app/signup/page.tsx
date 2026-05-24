"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type AccountType = "FAN" | "PERFORMER" | "ADVERTISER" | "SPONSOR" | "VENUE" | "PROMOTER";
type Step = "TYPE" | "DETAILS" | "PROVISIONING" | "DONE";

const ACCOUNT_TYPES: Array<{
  type: AccountType; label: string; icon: string; color: string;
  tagline: string; perks: string[];
}> = [
  { type: "FAN",        icon: "🎧", color: "#00FFFF", label: "Fan",
    tagline: "Fan, listener, community member",
    perks: ["All live rooms", "Chat & react", "Earn points & rewards", "Vote in contests"] },
  { type: "PERFORMER",  icon: "🎤", color: "#FF2DAA", label: "Performer",
    tagline: "Performer, producer, creator",
    perks: ["Artist profile", "Beat Lab", "NFT Lab", "Cypher & battle rooms"] },
  { type: "PROMOTER",   icon: "🎫", color: "#38bdf8", label: "Promoter",
    tagline: "Event promoter, ticket seller",
    perks: ["Promoter profile", "Ticket sales", "Event management"] },
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
  const searchParams = useSearchParams();
  const [vipToken, setVipToken] = useState(searchParams?.get("token") ?? "");

  useEffect(() => {
    // Restore invite code from localStorage if URL doesn't have one
    if (!vipToken) {
      const saved = localStorage.getItem("tmi_invite_code") ?? "";
      if (saved) setVipToken(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [step, setStep] = useState<Step>("TYPE");
  const [accountType, setAccountType] = useState<AccountType>("FAN");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [provSteps, setProvSteps] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const sel = ACCOUNT_TYPES.find(t => t.type === accountType)!;

  async function handleSignup() {
    setError("");
    if (!form.name || !form.email || !form.password) { setError("All fields required."); return; }
    setStep("PROVISIONING");
    try {
      const regRes = await fetch("/api/auth/register", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: accountType, termsAccepted: true, inviteToken: vipToken || undefined }),
      });
      const regData = await regRes.json().catch(() => ({})) as { ok?: boolean; userId?: string; user?: { id?: string }; token?: string; error?: string };
      if (!regRes.ok || !regData.ok) {
        setError(regData.error ?? "Registration failed — please try again.");
        setStep("DETAILS");
        return;
      }
      const userId = regData.userId ?? regData.user?.id ?? `stub_${Date.now()}`;
      const provRes = await fetch("/api/auth/provision", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, accountType, vipToken: vipToken || undefined }),
      });
      const prov = await provRes.json() as { steps?: Array<{ step: string }> };
      setProvSteps((prov.steps ?? []).map((s) => s.step));
      localStorage.removeItem("tmi_invite_code"); // consumed — clear so next user starts fresh
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
        {vipToken && (
          <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", background: "rgba(255,213,0,0.08)", border: "1px solid rgba(255,213,0,0.35)", borderRadius: 20 }}>
            <span style={{ fontSize: 12 }}>💎</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", letterSpacing: "0.12em" }}>VIP INVITE DETECTED — DIAMOND ACCESS</span>
          </div>
        )}
      </motion.div>

      {/* Google one-tap CTA — shown before steps */}
      {step === "TYPE" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: 560, marginBottom: 16 }}>
          <a href={`/api/auth/google${vipToken ? `?token=${vipToken}` : ''}`}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "14px", fontSize: 12, fontWeight: 700, background: "#fff", border: "none", borderRadius: 9, color: "#050510", textDecoration: "none", cursor: "pointer", letterSpacing: "0.04em" }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>OR CREATE WITH EMAIL</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>
        </motion.div>
      )}

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

              {/* Orbit announcement */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ background: "linear-gradient(135deg, rgba(255,45,170,0.12), rgba(170,45,255,0.1))", border: "1.5px solid rgba(255,45,170,0.4)", borderRadius: 12, padding: "16px 18px", marginBottom: 16, textAlign: "left" }}
              >
                <div style={{ fontSize: 11, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.1em", marginBottom: 6 }}>🔥 YOU&apos;RE LIVE ON THE HOMEPAGE ORBIT</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                  Your profile is already rotating in the <strong style={{ color: "#fff" }}>Home #1 live orbit</strong>. Every visitor to the homepage can see you right now. Send your invite link and watch your rank climb.
                </div>
              </motion.div>

              {/* Invite link */}
              {(() => {
                const refSlug = encodeURIComponent(form.name.trim().replace(/\s+/g, ""));
                const inviteUrl = `https://themusiciansindex.com/join?ref=${refSlug}`;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 10, padding: "14px 16px", marginBottom: 18, textAlign: "left" }}
                  >
                    <div style={{ fontSize: 8, fontWeight: 800, color: "#FFD700", letterSpacing: "0.2em", marginBottom: 8 }}>⭐ YOUR INVITE LINK — EARN XP FOR EVERY SIGN-UP</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ flex: 1, fontSize: 10, color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {inviteUrl}
                      </div>
                      <button
                        onClick={() => { void navigator.clipboard.writeText(inviteUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
                        style={{ padding: "8px 14px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", background: copied ? "#00FF88" : "#FFD700", color: "#050510", border: "none", borderRadius: 6, cursor: "pointer", flexShrink: 0, transition: "background 200ms" }}
                      >
                        {copied ? "COPIED ✓" : "COPY"}
                      </button>
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,215,0,0.55)", marginTop: 6 }}>Launch bonus: 2× XP on all referrals — limited time</div>
                  </motion.div>
                );
              })()}

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

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link href="/home/1" style={{ padding: "13px 22px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", background: `linear-gradient(135deg, ${sel.color}, ${sel.color}88)`, color: "#050510", borderRadius: 7, textDecoration: "none", display: "block" }}>
                  🔥 SEE YOUR ORBIT POSITION →
                </Link>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <Link href="/dashboard" style={{ padding: "10px 18px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", background: "rgba(255,255,255,0.06)", color: "#fff", borderRadius: 6, textDecoration: "none" }}>GO TO DASHBOARD</Link>
                  <Link href={`/onboarding/${accountType.toLowerCase()}`} style={{ padding: "10px 18px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", borderRadius: 6, textDecoration: "none" }}>START TUTORIAL</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
