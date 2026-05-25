"use client";

/**
 * TMIAuthFlow.tsx
 * Complete authentication flow for The Musician's Index.
 *
 * Drop at: apps/web/src/components/auth/TMIAuthFlow.tsx
 *
 * Pages covered (all in one component with step state):
 *  - /auth/login         → Login with email+password or OAuth
 *  - /auth/signup        → Account creation
 *  - /auth/select-role   → Choose: Artist / Fan / Venue / Label
 *  - /auth/verify        → Email verification holding screen
 *  - /auth/onboarding    → Profile setup (name, genre, bio, avatar color)
 *  - /auth/reset         → Password reset
 *
 * Design: 1980s neon dark with animated background shapes
 * No external auth library dependencies — works with NextAuth
 */

import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type ChangeEvent,
} from "react";
import Link from "next/link";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type AuthStep = "login" | "signup" | "select_role" | "verify" | "onboarding" | "reset";
type UserRole = "artist" | "fan" | "venue" | "label";
type AuthError = { field?: string; message: string } | null;

interface AuthFormData {
  email: string;
  password: string;
  name: string;
  role: UserRole | null;
  genre: string;
  bio: string;
  accentColor: string;
  agreeTerms: boolean;
}

/* ─── Role definitions ─────────────────────────────────────────────────── */
const ROLES: { id: UserRole; label: string; desc: string; icon: string; color: string }[] = [
  { id: "artist",  label: "Artist / Performer", desc: "Go live, battle, release music, book venues", icon: "🎤", color: "#a855f7" },
  { id: "fan",     label: "Fan",                desc: "Watch live, tip, vote, build your avatar",   icon: "🔥", color: "#06b6d4" },
  { id: "venue",   label: "Venue Owner",        desc: "List your space, sell tickets, host events", icon: "🏟️", color: "#f59e0b" },
  { id: "label",   label: "Label / Manager",    desc: "Manage artists, run promotions, buy ad slots", icon: "🏷️", color: "#22c55e" },
];

/* ─── Neon accent colors ─────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "#06b6d4","#a855f7","#ec4899","#f59e0b","#22c55e",
  "#f97316","#ef4444","#8b5cf6","#14b8a6","#eab308",
];

/* ─── Input component ─────────────────────────────────────────────────────── */
function NeonInput({
  label, type = "text", name, value, onChange, error, placeholder, disabled,
}: {
  label: string; type?: string; name: string; value: string;
  onChange: (v: string) => void; error?: string; placeholder?: string; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5">{label}</label>
      <input
        type={type} name={name} value={value} placeholder={placeholder} disabled={disabled}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-white/5 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all placeholder:text-white/20 disabled:opacity-40"
        style={{
          border: `1.5px solid ${error ? "#ef444480" : focused ? "#06b6d4" : "rgba(255,255,255,0.1)"}`,
          boxShadow: focused ? "0 0 12px rgba(6,182,212,0.15)" : "none",
        }}
      />
      {error && <p className="mt-1 text-[9px] text-red-400">{error}</p>}
    </div>
  );
}

/* ─── Main auth component ─────────────────────────────────────────────────── */
export default function TMIAuthFlow({
  defaultStep = "login",
  redirectUrl = "/home/5",
  onAuthSuccess,
}: {
  defaultStep?: AuthStep;
  redirectUrl?: string;
  onAuthSuccess?: (userId: string, role: UserRole) => void;
}) {
  const [step,     setStep]     = useState<AuthStep>(defaultStep);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<AuthError>(null);
  const [showPwd,  setShowPwd]  = useState(false);
  const [form,     setForm]     = useState<AuthFormData>({
    email: "", password: "", name: "", role: null,
    genre: "", bio: "", accentColor: "#06b6d4", agreeTerms: false,
  });

  function update(key: keyof AuthFormData, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  /* ── Login ── */
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!form.email.includes("@")) return setError({ field: "email", message: "Valid email required" });
    if (form.password.length < 6)   return setError({ field: "password", message: "Password too short" });
    setLoading(true);
    try {
      // Wire to NextAuth: await signIn("credentials", { email, password, redirect: false })
      await new Promise((r) => setTimeout(r, 900)); // simulated
      onAuthSuccess?.("user-001", "fan");
    } catch {
      setError({ message: "Invalid email or password" });
    } finally { setLoading(false); }
  }

  /* ── Signup ── */
  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    if (!form.email.includes("@")) return setError({ field: "email", message: "Valid email required" });
    if (form.password.length < 8)  return setError({ field: "password", message: "Password must be at least 8 characters" });
    if (!form.agreeTerms)          return setError({ message: "You must agree to the Terms of Service" });
    setLoading(true);
    try {
      // POST /api/auth/signup
      await new Promise((r) => setTimeout(r, 1000));
      setStep("select_role");
    } catch {
      setError({ message: "Email already in use" });
    } finally { setLoading(false); }
  }

  /* ── Select role ── */
  async function handleRoleSelect(role: UserRole) {
    update("role", role);
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setStep("verify");
    } finally { setLoading(false); }
  }

  /* ── Onboarding ── */
  async function handleOnboarding(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setError({ field: "name", message: "Name is required" });
    setLoading(true);
    try {
      // PATCH /api/user/profile
      await new Promise((r) => setTimeout(r, 800));
      onAuthSuccess?.("user-001", form.role ?? "fan");
    } finally { setLoading(false); }
  }

  /* ── Password reset ── */
  async function handleReset(e: FormEvent) {
    e.preventDefault();
    if (!form.email.includes("@")) return setError({ field: "email", message: "Valid email required" });
    setLoading(true);
    try {
      // POST /api/auth/reset
      await new Promise((r) => setTimeout(r, 700));
      setError({ message: "✓ Check your email for a reset link" });
    } finally { setLoading(false); }
  }

  const GENRES = ["Hip-Hop","R&B","Pop","Rock","Electronic","Jazz","Gospel","Reggae","Latin","Country","Classical","Other"];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "radial-gradient(circle at 30% 30%, #07031a 0%, #05050c 70%)" }}
    >
      {/* Ambient shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { c:"#a855f7", x:"5%",  y:"10%", s:"300px", d:"18s" },
          { c:"#06b6d4", x:"70%", y:"60%", s:"250px", d:"22s" },
          { c:"#ec4899", x:"40%", y:"85%", s:"200px", d:"16s" },
        ].map((b,i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              left:b.x, top:b.y, width:b.s, height:b.s,
              background:`radial-gradient(circle, ${b.c}15 0%, transparent 70%)`,
              animation:`ambientFloat${i+1} ${b.d} ease-in-out infinite alternate`,
            }} />
        ))}
        <style>{`
          @keyframes ambientFloat1 { from{transform:translate(0,0)} to{transform:translate(5%,8%)} }
          @keyframes ambientFloat2 { from{transform:translate(0,0)} to{transform:translate(-6%,5%)} }
          @keyframes ambientFloat3 { from{transform:translate(0,0)} to{transform:translate(4%,-6%)} }
        `}</style>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-1">The Musician's Index</p>
          <div className="w-12 h-0.5 mx-auto bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-500 rounded-full" />
        </div>

        <div
          className="bg-[#0c0c18] rounded-2xl p-6 space-y-4"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* ── LOGIN ── */}
          {step === "login" && (
            <>
              <h1 className="text-lg font-black text-white">Sign In</h1>
              <form onSubmit={handleLogin} className="space-y-3">
                <NeonInput label="Email" name="email" value={form.email} type="email"
                  onChange={(v) => update("email", v)}
                  error={error?.field === "email" ? error.message : undefined}
                  placeholder="your@email.com" />
                <div className="relative">
                  <NeonInput label="Password" name="password" value={form.password}
                    type={showPwd ? "text" : "password"}
                    onChange={(v) => update("password", v)}
                    error={error?.field === "password" ? error.message : undefined}
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3 top-8 text-[9px] text-white/30 hover:text-white/60">
                    {showPwd ? "Hide" : "Show"}
                  </button>
                </div>
                {error && !error.field && <p className="text-[10px] text-red-400">{error.message}</p>}
                <button type="submit" disabled={loading}
                  className="w-full py-3 font-black text-[11px] uppercase tracking-wider rounded-xl text-black bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 transition-all active:scale-95">
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
              <div className="flex justify-between text-[9px]">
                <button onClick={() => setStep("reset")} className="text-white/30 hover:text-white/60">Forgot password?</button>
                <button onClick={() => setStep("signup")} className="text-cyan-400 font-bold hover:text-cyan-300">Create account →</button>
              </div>
            </>
          )}

          {/* ── SIGNUP ── */}
          {step === "signup" && (
            <>
              <h1 className="text-lg font-black text-white">Create Account</h1>
              <form onSubmit={handleSignup} className="space-y-3">
                <NeonInput label="Email" name="email" value={form.email} type="email"
                  onChange={(v) => update("email", v)}
                  error={error?.field === "email" ? error.message : undefined}
                  placeholder="your@email.com" />
                <NeonInput label="Password (8+ characters)" name="password" value={form.password}
                  type="password" onChange={(v) => update("password", v)}
                  error={error?.field === "password" ? error.message : undefined}
                  placeholder="Create a strong password" />
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.agreeTerms}
                    onChange={(e) => update("agreeTerms", e.target.checked)}
                    className="mt-0.5 accent-cyan-500" />
                  <span className="text-[9px] text-white/40 leading-relaxed">
                    I agree to the <Link href="/terms" className="text-cyan-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                {error && !error.field && <p className="text-[10px] text-red-400">{error.message}</p>}
                <button type="submit" disabled={loading}
                  className="w-full py-3 font-black text-[11px] uppercase tracking-wider rounded-xl text-black bg-purple-500 hover:bg-purple-400 disabled:opacity-50 transition-all active:scale-95">
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </form>
              <button onClick={() => setStep("login")} className="block text-center w-full text-[9px] text-white/30 hover:text-white/60">← Back to sign in</button>
            </>
          )}

          {/* ── SELECT ROLE ── */}
          {step === "select_role" && (
            <>
              <h1 className="text-lg font-black text-white">I am a…</h1>
              <p className="text-[10px] text-white/40">Choose your role. You can change this later.</p>
              <div className="space-y-2">
                {ROLES.map((role) => (
                  <button key={role.id} onClick={() => handleRoleSelect(role.id)} disabled={loading}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-white/10 hover:border-white/20 transition-all text-left group disabled:opacity-50"
                    style={{ background: form.role === role.id ? role.color + "15" : undefined }}>
                    <span className="text-2xl">{role.icon}</span>
                    <div>
                      <p className="text-[11px] font-black text-white">{role.label}</p>
                      <p className="text-[8px] text-white/40">{role.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── VERIFY EMAIL ── */}
          {step === "verify" && (
            <div className="text-center space-y-4 py-4">
              <div className="text-5xl">📬</div>
              <h1 className="text-lg font-black text-white">Check Your Email</h1>
              <p className="text-[11px] text-white/50 leading-relaxed">We sent a verification link to <strong className="text-white">{form.email}</strong>. Click it to activate your account.</p>
              <button onClick={() => setStep("onboarding")} className="text-[9px] text-cyan-400 hover:text-cyan-300">
                I verified my email — continue →
              </button>
            </div>
          )}

          {/* ── ONBOARDING ── */}
          {step === "onboarding" && (
            <>
              <h1 className="text-lg font-black text-white">Set Up Your Profile</h1>
              <form onSubmit={handleOnboarding} className="space-y-3">
                <NeonInput label="Display Name" name="name" value={form.name}
                  onChange={(v) => update("name", v)}
                  error={error?.field === "name" ? error.message : undefined}
                  placeholder="How others see you" />
                {(form.role === "artist" || form.role === "label") && (
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5">Primary Genre</label>
                    <select value={form.genre} onChange={(e) => update("genre", e.target.value)}
                      className="w-full bg-white/5 text-white text-sm px-4 py-3 rounded-xl outline-none border border-white/10 focus:border-cyan-500">
                      <option value="">Select genre</option>
                      {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5">Profile Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {AVATAR_COLORS.map((c) => (
                      <button key={c} type="button" onClick={() => update("accentColor", c)}
                        className="w-7 h-7 rounded-full transition-all active:scale-90"
                        style={{ background: c, outline: form.accentColor === c ? `3px solid ${c}` : "none", outlineOffset: "2px" }} />
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 font-black text-[11px] uppercase tracking-wider rounded-xl text-black transition-all active:scale-95"
                  style={{ background: form.accentColor }}>
                  {loading ? "Saving..." : "Enter the Platform →"}
                </button>
              </form>
            </>
          )}

          {/* ── PASSWORD RESET ── */}
          {step === "reset" && (
            <>
              <h1 className="text-lg font-black text-white">Reset Password</h1>
              <form onSubmit={handleReset} className="space-y-3">
                <NeonInput label="Email" name="email" value={form.email} type="email"
                  onChange={(v) => update("email", v)}
                  error={error?.field === "email" ? error.message : undefined}
                  placeholder="your@email.com" />
                {error && !error.field && (
                  <p className={`text-[10px] ${error.message.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
                    {error.message}
                  </p>
                )}
                <button type="submit" disabled={loading}
                  className="w-full py-3 font-black text-[11px] uppercase tracking-wider rounded-xl text-black bg-cyan-500 disabled:opacity-50 transition-all active:scale-95">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <button onClick={() => setStep("login")} className="block text-center w-full text-[9px] text-white/30 hover:text-white/60">← Back to sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
