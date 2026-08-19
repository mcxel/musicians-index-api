"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { BattleFormatType } from "@/lib/competition/BattleFormatRulesEngine";
import { useAuth, resolveAuthPhase } from "@/lib/hooks/useAuth";

// Rule 21 amendment (2026-07-24): this is a Mini Battle - the same real
// EventOrchestrator/LobbyEvent pipeline the World events use, created by a
// qualified user instead of the platform. See POST /api/battles/mini.
const BATTLE_TYPES: { id: string; label: string; format: BattleFormatType }[] = [
  { id: "rapper", label: "Rapper vs Rapper", format: "rapper-vs-rapper" },
  { id: "singer", label: "Singer vs Singer", format: "singer-vs-singer" },
  { id: "acapella", label: "Acapella Only", format: "solo-vs-solo" },
  { id: "beatbox", label: "Beatbox Battle", format: "solo-vs-solo" },
  { id: "guitar", label: "Guitar Battle", format: "instrumentalist-vs-instrumentalist" },
  { id: "piano", label: "Piano Battle", format: "instrumentalist-vs-instrumentalist" },
  { id: "drums", label: "Drum Battle", format: "instrumentalist-vs-instrumentalist" },
  { id: "producer", label: "Producer vs Producer", format: "producer-vs-producer" },
  { id: "band", label: "Band vs Band", format: "band-vs-band" },
  { id: "dance", label: "Dance-Off", format: "dance-off" },
  { id: "comedy", label: "Comedian vs Comedian", format: "comedian-vs-comedian" },
  { id: "dirty-dozens", label: "Dirty Dozens", format: "dirty-dozens" },
  { id: "open", label: "Open Cypher (any # of performers)", format: "open-performer-challenge" },
];

const GENRES = ["Hip-Hop", "R&B", "Pop", "Jazz", "Blues", "Gospel", "Latin", "Reggae", "EDM", "Rock", "Country", "Freestyle Open"];

type SubmitState = "idle" | "submitting" | "auth_required" | "tier_gate" | "session_limit" | "error";

export default function CreateBattlePage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const authPhase = resolveAuthPhase(authLoading, isAuthenticated);
  const [form, setForm] = useState({ title: "", battleType: "", genre: "" });
  const [state, setState] = useState<SubmitState>("idle");
  const [gateMessage, setGateMessage] = useState<string | null>(null);

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const selected = BATTLE_TYPES.find(bt => bt.id === form.battleType);
    if (!selected) return;

    setState("submitting");
    setGateMessage(null);

    try {
      const res = await fetch("/api/battles/mini", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ format: selected.format, genreName: form.genre || undefined, title: form.title || undefined }),
      });
      const data = await res.json();

      if (res.status === 401) { setState("auth_required"); return; }
      if (res.status === 403 && data.error === "tier_gate") {
        setState("tier_gate");
        setGateMessage(data.upgradePrompt || data.reason || "Mini Battle creation requires Gold membership.");
        return;
      }
      if (res.status === 403 && data.error === "session_limit") {
        setState("session_limit");
        setGateMessage(data.upgradePrompt || data.reason || "You've reached your concurrent session limit.");
        return;
      }
      if (!res.ok || !data.success) { setState("error"); return; }

      router.push(data.joinUrl);
    } catch {
      setState("error");
    }
  }

  const input: React.CSSProperties = {
    width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff",
    fontSize: 13, outline: "none", boxSizing: "border-box",
  };
  const label: React.CSSProperties = { fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 };

  // Gate before the form ever renders — an unauthenticated visitor should
  // never be able to fill out battle type/genre/title only to be told
  // "sign in" after clicking submit (Rule 20). AUTH_LOADING renders neither
  // the form nor the sign-in prompt, avoiding a false-flash of either state.
  if (authPhase === "AUTH_LOADING") {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>Loading…</div>
      </main>
    );
  }

  const gatedState: SubmitState = authPhase === "UNAUTHENTICATED" ? "auth_required" : state;

  if (gatedState === "auth_required" || gatedState === "tier_gate" || gatedState === "session_limit" || gatedState === "error") {
    const copy = {
      auth_required: { icon: "🔒", title: "Sign In Required", body: "Sign in to create a Mini Battle.", cta: "Sign In", href: "/login" },
      tier_gate: { icon: "⭐", title: "Gold Membership Required", body: gateMessage || "Mini Battle creation requires Gold membership.", cta: "Upgrade", href: "/pricing" },
      session_limit: { icon: "⏳", title: "Session Limit Reached", body: gateMessage || "You've reached your concurrent Mini Battle limit.", cta: "View Your Battles", href: "/battles" },
      error: { icon: "⚠️", title: "Couldn't Create Battle", body: "Something went wrong creating your Mini Battle. Try again.", cta: "Retry", href: "" },
    }[gatedState];
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 420, padding: 24 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>{copy.icon}</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>{copy.title}</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>{copy.body}</p>
          {copy.href ? (
            <Link href={copy.href} style={{ fontSize: 10, fontWeight: 800, color: "#FF2DAA", textDecoration: "none", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, padding: "10px 22px" }}>{copy.cta}</Link>
          ) : (
            <button onClick={() => setState("idle")} style={{ fontSize: 10, fontWeight: 800, color: "#FF2DAA", background: "none", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, padding: "10px 22px", cursor: "pointer" }}>{copy.cta}</button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        <Link href="/battles" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← BATTLES
        </Link>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, margin: "24px 0 4px" }}>⭐ Create a Mini Battle</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>Instant, creator-hosted battle. Opens immediately on the Battle Wall.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <span style={label}>BATTLE TITLE (OPTIONAL)</span>
            <input style={input} placeholder="e.g. Wavetek vs Krypt" value={form.title} onChange={e => set("title", e.target.value)} />
          </div>

          <div>
            <span style={label}>BATTLE TYPE</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 8 }}>
              {BATTLE_TYPES.map(bt => (
                <button key={bt.id} type="button" onClick={() => set("battleType", bt.id)} style={{ padding: "10px 14px", textAlign: "left", background: form.battleType === bt.id ? "rgba(255,45,170,0.12)" : "rgba(255,255,255,0.02)", border: `1px solid ${form.battleType === bt.id ? "#FF2DAA" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, color: "#fff", fontSize: 11, cursor: "pointer" }}>
                  <div style={{ fontWeight: 700 }}>{bt.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span style={label}>GENRE</span>
            <select style={{ ...input }} value={form.genre} onChange={e => set("genre", e.target.value)}>
              <option value="">Select genre…</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <button type="submit" disabled={!form.battleType || state === "submitting"} style={{ padding: "14px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: !form.battleType ? "rgba(255,255,255,0.15)" : "linear-gradient(135deg,#FF2DAA,#AA2DFF)", borderRadius: 10, border: "none", cursor: !form.battleType || state === "submitting" ? "not-allowed" : "pointer", marginTop: 8 }}>
            {state === "submitting" ? "OPENING BATTLE…" : "⭐ GO LIVE NOW"}
          </button>
        </form>
      </div>
    </main>
  );
}
