"use client";

import { type PolicyId } from "@/lib/messaging/policyCatalog";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  rolesFromVenueCapabilities,
  primaryVenueHubRoute,
  VENUE_PROFESSIONAL_LABELS,
  type VenueProfessionalCapability,
} from "@/lib/auth/VenueProfessionalCapabilities";
import { getProfileFieldLabels } from "@/lib/auth/profileFieldLabels";
import SignupPolicyAcceptance, {
  AGE_REQUIRED_ERROR,
  POLICY_ACCEPTANCE_ERROR,
  allRequiredPoliciesAccepted,
  emptyPolicyChecks,
  isSignupAgeEligible,
} from "@/components/onboarding/SignupPolicyAcceptance";

// ---------------------------------------------------------------------------
// Single-surface signup: credentials + role on one screen, no mid-flow bounce
// ---------------------------------------------------------------------------

type AccountType = "FAN" | "PERFORMER" | "ADVERTISER" | "SPONSOR" | "VENUE_PROFESSIONAL";
type Step = "FORM" | "PROVISIONING" | "DONE";

const PERFORMER_SUBTYPES = [
  "Rapper", "Singer", "DJ", "Producer", "Comedian", "Dancer",
  "Musician", "Actor", "Band", "Magician", "Spoken Word", "Other",
];

const ACCOUNT_TYPES: Array<{
  type: AccountType; label: string; icon: string; color: string; tagline: string;
}> = [
  { type: "FAN",        icon: "🎧", color: "#00FFFF", label: "Fan",        tagline: "Fan, listener, community member" },
  { type: "PERFORMER",  icon: "🎤", color: "#FF2DAA", label: "Performer",  tagline: "Artist, producer, creator" },
  { type: "VENUE_PROFESSIONAL", icon: "🏟️", color: "#FF9500", label: "Venue / Promoter", tagline: "Venue operator, event promoter, ticketing" },
  { type: "ADVERTISER", icon: "📢", color: "#FFD700", label: "Advertiser", tagline: "Brand, agency, media buyer" },
  { type: "SPONSOR",    icon: "🏆", color: "#AA2DFF", label: "Sponsor",    tagline: "Sponsor contests & artists" },
];

const ROLE_MAP: Record<string, AccountType> = {
  performer: "PERFORMER", artist: "PERFORMER", musician: "PERFORMER",
  fan: "FAN", listener: "FAN",
  sponsor: "SPONSOR",
  advertiser: "ADVERTISER", brand: "ADVERTISER",
  venue: "VENUE_PROFESSIONAL",
  promoter: "VENUE_PROFESSIONAL",
};

const ONBOARDING_ROUTE: Record<AccountType, string> = {
  FAN:        "/onboarding/fan",
  PERFORMER:  "/onboarding/performer",
  VENUE_PROFESSIONAL: "/onboarding/venue",
  ADVERTISER: "/onboarding/advertiser",
  SPONSOR:    "/onboarding/sponsor",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px", fontSize: 13,
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6, color: "#fff", outline: "none", boxSizing: "border-box",
};

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vipTokenParam = searchParams?.get("token") ?? "";
  const refToken = searchParams?.get("ref") ?? "";
  const roleParam = searchParams?.get("role")?.toLowerCase() ?? "";

  const [vipToken, setVipToken] = useState(vipTokenParam);
  const [step, setStep] = useState<Step>("FORM");
  const [selectedRole, setSelectedRole] = useState<AccountType>(ROLE_MAP[roleParam] ?? "FAN");
  const [performerSubtypes, setPerformerSubtypes] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", dob: "" });
  const [policyChecks, setPolicyChecks] = useState<Record<PolicyId, boolean>>(emptyPolicyChecks);
  const [venueCapabilities, setVenueCapabilities] = useState<VenueProfessionalCapability[]>(["VENUE_OPERATOR"]);
  const [venueProfile, setVenueProfile] = useState({
    venueName: "",
    address: "",
    city: "",
    state: "",
    capacity: "",
    venueType: "",
    bookingContact: "",
    payoutPreference: "",
    promoterCompany: "",
    promoterFocus: "",
  });
  const [error, setError] = useState("");
  const [provSteps, setProvSteps] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then(r => r.json())
      .then((d: { authenticated?: boolean; user?: { role?: string } }) => {
        if (active && d?.authenticated) {
          router.replace(d.user?.role === "performer" ? "/hub/performer" : "/home/1");
        }
      })
      .catch(() => {});

    if (!vipToken) {
      const saved = localStorage.getItem("tmi_invite_code") ?? "";
      if (saved) setVipToken(saved);
    }

    return () => { active = false; };
  }, [router, vipToken]);

  const sel = ACCOUNT_TYPES.find(t => t.type === selectedRole)!;

  async function handleSignup() {
    setError("");
    if (!form.name || !form.email || !form.password) { setError("Name, email and password are required."); return; }
    if (!form.dob) { setError("Date of birth is required."); return; }
    if (!isSignupAgeEligible(form.dob)) { setError(AGE_REQUIRED_ERROR); return; }
    if (!allRequiredPoliciesAccepted(policyChecks)) {
      setError(POLICY_ACCEPTANCE_ERROR);
      return;
    }
    if (selectedRole === "PERFORMER" && performerSubtypes.length === 0) {
      setError("Please select at least one performer type."); return;
    }
    if (selectedRole === "VENUE_PROFESSIONAL" && venueCapabilities.length === 0) {
      setError("Select at least one venue or promoter capability."); return;
    }
    setStep("PROVISIONING");
    try {
      const provisionRoles =
        selectedRole === "VENUE_PROFESSIONAL"
          ? rolesFromVenueCapabilities(venueCapabilities)
          : [selectedRole];

      const regRes = await fetch("/api/auth/register", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, password: form.password,
          dob: form.dob,
          dateOfBirth: form.dob,
          role: provisionRoles[0],
          roles: provisionRoles,
          termsAccepted: policyChecks.TOS,
          originalityAccepted: policyChecks.COMMUNITY_GUIDELINES,
          inviteToken: vipToken || undefined,
          ref: refToken || undefined,
          performerTypes: selectedRole === "PERFORMER" ? performerSubtypes : undefined,
        }),
      });
      const regData = await regRes.json().catch(() => ({})) as {
        ok?: boolean; userId?: string; user?: { id?: string }; error?: string;
      };
      if (!regRes.ok || !regData.ok) {
        setError(regData.error ?? "Registration failed — please try again.");
        setStep("FORM"); return;
      }
      const userId = regData.userId ?? regData.user?.id;
      if (!userId) {
        setError("Registration succeeded but no user ID was returned — please sign in.");
        setStep("FORM"); return;
      }
      const provRes = await fetch("/api/auth/provision", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, roles: provisionRoles, vipToken: vipToken || undefined }),
      });
      const prov = await provRes.json() as {
        ok?: boolean; steps?: Array<{ step: string }>; error?: string;
      };
      setProvSteps((prov.steps ?? []).map(s => s.step));
      if (!provRes.ok || prov.ok === false) {
        setError(prov.error ?? "Account created but provisioning failed — contact support.");
        setStep("FORM"); return;
      }

      if (selectedRole === "VENUE_PROFESSIONAL") {
        await fetch("/api/account/capabilities", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            venueProfessional: {
              ...venueProfile,
              venueName: venueProfile.venueName || form.name,
              capabilities: venueCapabilities,
            },
          }),
        });
      }

      localStorage.removeItem("tmi_invite_code");
      setStep("DONE");
    } catch {
      setError("Signup failed — please try again.");
      setStep("FORM");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050510", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "40px 20px" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28, textAlign: "center" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#00FFFF", fontWeight: 800, marginBottom: 6 }}>THE MUSICIANS INDEX</div>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 3, color: "#fff" }}>CREATE ACCOUNT</div>
        {vipToken && (
          <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", background: "rgba(255,213,0,0.08)", border: "1px solid rgba(255,213,0,0.35)", borderRadius: 20 }}>
            <span style={{ fontSize: 12 }}>💎</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", letterSpacing: "0.12em" }}>VIP INVITE DETECTED — DIAMOND ACCESS</span>
          </div>
        )}
      </motion.div>

      <div style={{ width: "100%", maxWidth: 540 }}>
        <AnimatePresence mode="wait">

          {/* ── FORM ───────────────────────────────────────────────────── */}
          {step === "FORM" && (
            <motion.div key="form" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>

              {/* Google */}
              <a
                href={`/api/auth/google${vipToken ? `?token=${vipToken}` : ""}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "13px", fontSize: 12, fontWeight: 700, background: "#fff", borderRadius: 9, color: "#050510", textDecoration: "none", letterSpacing: "0.04em" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </a>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>OR CREATE WITH EMAIL</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              </div>

              {/* ── Credential fields ── */}
              {/* Name field — label and placeholder update as the user picks their role */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", marginBottom: 5, fontWeight: 700 }}>
                  {getProfileFieldLabels(selectedRole).identityName.label}
                </label>
                <input
                  type="text"
                  placeholder={getProfileFieldLabels(selectedRole).identityName.placeholder}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  autoComplete="name"
                  style={inputStyle}
                />
              </div>
              {(["email", "password"] as const).map((key) => {
                const meta: Record<string, [string, string, string]> = {
                  email:    ["EMAIL ADDRESS",   "email",    "you@example.com"],
                  password: ["CREATE PASSWORD", "password", "8+ characters"],
                };
                const [lbl, type, ph] = meta[key]!;
                return (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", marginBottom: 5, fontWeight: 700 }}>{lbl}</label>
                    <input
                      type={type} placeholder={ph} value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      autoComplete={key === "password" ? "new-password" : key}
                      style={inputStyle}
                    />
                  </div>
                );
              })}

              {/* Date of birth */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", marginBottom: 5, fontWeight: 700 }}>DATE OF BIRTH</label>
                <input
                  type="date" value={form.dob}
                  onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split("T")[0]}
                  style={{ ...inputStyle, colorScheme: "dark" }}
                />
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>You must be 16 or older. Date of birth is used for account safety and age-gating.</div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <SignupPolicyAcceptance checks={policyChecks} onChange={setPolicyChecks} />
              </div>

              {/* ── Role selection ── */}
              <div style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 10, fontWeight: 700 }}>WHAT ARE YOU JOINING TMI AS?</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                {ACCOUNT_TYPES.map(t => {
                  const active = selectedRole === t.type;
                  return (
                    <div key={t.type}>
                      <motion.button
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedRole(t.type)}
                        style={{
                          display: "flex", alignItems: "center", gap: 12, width: "100%",
                          padding: "10px 14px", borderRadius: active && (t.type === "PERFORMER" || t.type === "VENUE_PROFESSIONAL") ? "8px 8px 0 0" : 8,
                          cursor: "pointer", textAlign: "left",
                          background: active ? `${t.color}14` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${active ? t.color : "rgba(255,255,255,0.07)"}`,
                          borderBottom: active && (t.type === "PERFORMER" || t.type === "VENUE_PROFESSIONAL") ? `1px solid ${t.color}40` : undefined,
                        }}
                      >
                        <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: active ? t.color : "#fff" }}>{t.label}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)" }}>{t.tagline}</div>
                        </div>
                        <div style={{ fontSize: 14, color: active ? t.color : "rgba(255,255,255,0.2)" }}>{active ? "●" : "○"}</div>
                      </motion.button>

                      {/* Performer subtype expander — only when PERFORMER is selected */}
                      <AnimatePresence>
                        {active && t.type === "PERFORMER" && (
                          <motion.div
                            key="subtypes"
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: "hidden", background: "rgba(255,45,170,0.06)", border: `1px solid ${t.color}40`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: "12px 14px" }}
                          >
                            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", marginBottom: 8, fontWeight: 700 }}>WHAT KIND OF PERFORMER? (SELECT ALL THAT APPLY)</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {PERFORMER_SUBTYPES.map(pt => {
                                const chosen = performerSubtypes.includes(pt);
                                return (
                                  <button
                                    key={pt} type="button"
                                    onClick={() => setPerformerSubtypes(prev => chosen ? prev.filter(x => x !== pt) : [...prev, pt])}
                                    style={{
                                      padding: "7px 13px", borderRadius: 18, fontSize: 10, fontWeight: 700, cursor: "pointer",
                                      background: chosen ? `${t.color}22` : "rgba(255,255,255,0.04)",
                                      border: `1px solid ${chosen ? t.color : "rgba(255,255,255,0.1)"}`,
                                      color: chosen ? t.color : "rgba(255,255,255,0.55)",
                                    }}
                                  >
                                    {chosen ? "✓ " : ""}{pt}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {active && t.type === "VENUE_PROFESSIONAL" && (
                          <motion.div
                            key="venue-pro"
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: "hidden", background: "rgba(255,149,0,0.06)", border: `1px solid ${t.color}40`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: "12px 14px" }}
                          >
                            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", marginBottom: 8, fontWeight: 700 }}>CAPABILITIES (SELECT ALL THAT APPLY)</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                              {(Object.keys(VENUE_PROFESSIONAL_LABELS) as VenueProfessionalCapability[]).map((cap) => {
                                const chosen = venueCapabilities.includes(cap);
                                return (
                                  <button
                                    key={cap} type="button"
                                    onClick={() => setVenueCapabilities(prev => chosen ? prev.filter(x => x !== cap) : [...prev, cap])}
                                    style={{
                                      padding: "7px 13px", borderRadius: 18, fontSize: 10, fontWeight: 700, cursor: "pointer",
                                      background: chosen ? `${t.color}22` : "rgba(255,255,255,0.04)",
                                      border: `1px solid ${chosen ? t.color : "rgba(255,255,255,0.1)"}`,
                                      color: chosen ? t.color : "rgba(255,255,255,0.55)",
                                    }}
                                  >
                                    {chosen ? "✓ " : ""}{VENUE_PROFESSIONAL_LABELS[cap]}
                                  </button>
                                );
                              })}
                            </div>
                            <div style={{ display: "grid", gap: 8 }}>
                              {[
                                ["Venue / Business Name", "venueName"],
                                ["Address", "address"],
                                ["City", "city"],
                                ["State / Region", "state"],
                                ["Capacity", "capacity"],
                                ["Venue Type", "venueType"],
                                ["Booking Contact", "bookingContact"],
                                ["Payout Preference", "payoutPreference"],
                              ].map(([label, key]) => (
                                <div key={key}>
                                  <label style={{ display: "block", fontSize: 8, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{label}</label>
                                  <input
                                    value={(venueProfile as Record<string, string>)[key]}
                                    onChange={e => setVenueProfile(p => ({ ...p, [key]: e.target.value }))}
                                    style={inputStyle}
                                  />
                                </div>
                              ))}
                              {venueCapabilities.includes("PROMOTER") && (
                                <>
                                  <div>
                                    <label style={{ display: "block", fontSize: 8, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Promoter Company</label>
                                    <input value={venueProfile.promoterCompany} onChange={e => setVenueProfile(p => ({ ...p, promoterCompany: e.target.value }))} style={inputStyle} />
                                  </div>
                                  <div>
                                    <label style={{ display: "block", fontSize: 8, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Promoter Focus / Genres</label>
                                    <input value={venueProfile.promoterFocus} onChange={e => setVenueProfile(p => ({ ...p, promoterFocus: e.target.value }))} style={inputStyle} />
                                  </div>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {error && (
                <div style={{ color: "#FF3C3C", fontSize: 10, marginBottom: 12, padding: "8px 12px", background: "rgba(255,60,60,0.08)", borderRadius: 6, border: "1px solid rgba(255,60,60,0.2)" }}>
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleSignup}
                style={{ width: "100%", padding: "14px", fontSize: 12, fontWeight: 900, letterSpacing: "0.18em", color: "#050510", background: `linear-gradient(135deg, ${sel.color}, ${sel.color}AA)`, border: "none", borderRadius: 8, cursor: "pointer", marginBottom: 14 }}
              >
                {sel.icon} CREATE {sel.label.toUpperCase()} ACCOUNT
              </motion.button>

              <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.28)" }}>
                Already have an account?{" "}
                <Link href="/auth" style={{ color: "#00FFFF" }}>Sign in</Link>
                {" · "}
                <Link href="/signup/teen" style={{ color: "rgba(255,255,255,0.3)" }}>Under 16?</Link>
              </div>
            </motion.div>
          )}

          {/* ── PROVISIONING ───────────────────────────────────────────── */}
          {step === "PROVISIONING" && (
            <motion.div key="prov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "60px 0" }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ fontSize: 48, display: "inline-block", marginBottom: 20 }}>⚙️</motion.div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFFF", marginBottom: 8 }}>BUILDING YOUR WORKSPACE</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Creating profile · wallet · inventory · bots...</div>
            </motion.div>
          )}

          {/* ── DONE ───────────────────────────────────────────────────── */}
          {step === "DONE" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "20px 0" }}>
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6 }} style={{ fontSize: 52, marginBottom: 14 }}>✅</motion.div>
              <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: 2, color: "#00FF88", marginBottom: 8 }}>WORKSPACE READY</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
                Your {sel.label} account is live. Bots assigned. Inventory loaded.
              </div>

              {selectedRole === "PERFORMER" ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  style={{ background: "linear-gradient(135deg, rgba(255,45,170,0.12), rgba(170,45,255,0.06))", border: "1.5px solid rgba(255,45,170,0.4)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, textAlign: "left" }}
                >
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.1em", marginBottom: 6 }}>📸 ADD YOUR PHOTO — APPEAR IN THE MAGAZINE</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginBottom: 12 }}>
                    Your real performer photo + bio places you in the <strong style={{ color: "#fff" }}>TMI Magazine</strong> next to your official artist ranking number.
                  </div>
                  <Link href="/onboarding/performer"
                    style={{ display: "inline-block", padding: "9px 20px", background: "#FF2DAA", color: "#fff", fontWeight: 900, fontSize: 10, letterSpacing: "0.1em", borderRadius: 8, textDecoration: "none" }}>
                    📸 SET UP MY PERFORMER PROFILE →
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  style={{ background: "linear-gradient(135deg, rgba(170,45,255,0.12), rgba(0,255,255,0.06))", border: "1.5px solid rgba(170,45,255,0.4)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, textAlign: "left" }}
                >
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#AA2DFF", letterSpacing: "0.1em", marginBottom: 6 }}>🎭 CREATE YOUR AVATAR — APPEAR IN THE AUDIENCE</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginBottom: 12 }}>
                    Your avatar takes a seat in the <strong style={{ color: "#fff" }}>3D audience</strong> every time you watch a live performance.
                  </div>
                  <Link href="/settings/avatar"
                    style={{ display: "inline-block", padding: "9px 20px", background: "#AA2DFF", color: "#fff", fontWeight: 900, fontSize: 10, letterSpacing: "0.1em", borderRadius: 8, textDecoration: "none" }}>
                    🎭 CREATE MY AVATAR →
                  </Link>
                </motion.div>
              )}

              {/* Invite link */}
              {(() => {
                const refSlug = encodeURIComponent(form.name.trim().replace(/\s+/g, ""));
                const inviteUrl = `https://themusiciansindex.com/join?ref=${refSlug}`;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
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

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                {/* router.replace keeps Back button from bouncing user back to signup */}
                <button
                  onClick={() => router.replace(
                    selectedRole === "VENUE_PROFESSIONAL"
                      ? primaryVenueHubRoute(venueCapabilities)
                      : ONBOARDING_ROUTE[selectedRole],
                  )}
                  style={{ width: "100%", padding: "14px 22px", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", background: `linear-gradient(135deg, ${sel.color}, ${sel.color}88)`, color: "#050510", border: "none", borderRadius: 8, cursor: "pointer", marginBottom: 8 }}
                >
                  {sel.icon} FINISH SETTING UP YOUR PROFILE →
                </button>
                <Link href="/dashboard" style={{ display: "block", padding: "10px 18px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", borderRadius: 6, textDecoration: "none", textAlign: "center" }}>
                  SKIP — GO TO DASHBOARD
                </Link>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#050510", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#00FFFF", fontSize: 11, letterSpacing: "0.3em", fontWeight: 700 }}>LOADING...</span>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
