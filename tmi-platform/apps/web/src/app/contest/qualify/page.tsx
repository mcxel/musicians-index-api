"use client";
import { useState } from "react";
import Link from "next/link";

const SPONSOR_TIERS = [
  { key: "local_RUBY", label: "Local RUBY", price: "$50", type: "local", color: "#cd7f32", slots: 5 },
  { key: "local_silver", label: "Local Silver", price: "$150", type: "local", color: "#aaa", slots: 3 },
  { key: "local_gold", label: "Local Gold", price: "$250", type: "local", color: "#ffd700", slots: 2 },
  { key: "major_RUBY", label: "Major RUBY", price: "$1,000", type: "major", color: "#cd7f32", slots: 5 },
  { key: "major_silver", label: "Major Silver", price: "$5,000", type: "major", color: "#aaa", slots: 3 },
  { key: "major_gold", label: "Major Gold", price: "$10,000", type: "major", color: "#ffd700", slots: 2 },
];

interface Sponsor { name: string; tier: string; confirmed: boolean; }

export default function QualifyPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([
    { name: "City Records", tier: "local_RUBY", confirmed: true },
    { name: "Mic Check Studios", tier: "local_gold", confirmed: true },
    { name: "Urban Style Co", tier: "local_silver", confirmed: false },
  ]);
  const [inviteName, setInviteName] = useState("");
  const [inviteTier, setInviteTier] = useState("local_RUBY");
  const [copied, setCopied] = useState(false);

  const localCount = sponsors.filter(s => s.tier.startsWith("local")).length;
  const majorCount = sponsors.filter(s => s.tier.startsWith("major")).length;
  const localPct = Math.min(100, (localCount / 10) * 100);
  const majorPct = Math.min(100, (majorCount / 10) * 100);
  const qualified = localCount >= 10 && majorCount >= 10;

  function addSponsor() {
    if (!inviteName.trim()) return;
    setSponsors(s => [...s, { name: inviteName.trim(), tier: inviteTier, confirmed: false }]);
    setInviteName("");
  }

  function confirmSponsor(i: number) {
    setSponsors(s => s.map((sp, idx) => idx === i ? { ...sp, confirmed: true } : sp));
  }

  function copyInviteLink() {
    navigator.clipboard.writeText(`${window.location.origin}/contest/sponsors?invite=YOUR_CODE`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#070a0f", color: "#fff", padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        <Link href="/contest" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textDecoration: "none", display: "block", marginBottom: 28 }}>← CONTEST HOME</Link>

        <div style={{ fontSize: 9, color: "#ff6b1a", fontWeight: 800, letterSpacing: "0.3em", marginBottom: 8 }}>GRAND PLATFORM CONTEST</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 6 }}>Qualification Dashboard</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>Secure 10 local + 10 major sponsors to advance to the Grand Stage.</p>

        {qualified && (
          <div style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.4)", borderRadius: 12, padding: "16px 20px", marginBottom: 28, display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 24 }}>🏆</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 14, color: "#00FF88" }}>FULLY QUALIFIED</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>You&apos;ve secured all 20 required sponsors. Check your email for next steps.</div>
            </div>
          </div>
        )}

        {/* Progress bars */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 36 }}>
          {[
            { label: "LOCAL SPONSORS", count: localCount, pct: localPct, color: "#ff6b1a" },
            { label: "MAJOR SPONSORS", count: majorCount, pct: majorPct, color: "#ffd700" },
          ].map(({ label, count, pct, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.15em" }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 900, color }}>{count}<span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/10</span></div>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.4s ease" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Sponsor list */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 12 }}>YOUR SPONSORS ({sponsors.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sponsors.map((sp, i) => {
              const tier = SPONSOR_TIERS.find(t => t.key === sp.tier);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: sp.confirmed ? "#00FF88" : "#FFD700", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{sp.name}</div>
                    <div style={{ fontSize: 10, color: tier?.color ?? "rgba(255,255,255,0.3)" }}>{tier?.label ?? sp.tier} · {tier?.price}</div>
                  </div>
                  {!sp.confirmed && (
                    <button onClick={() => confirmSponsor(i)} style={{ padding: "5px 12px", fontSize: 9, fontWeight: 800, color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 6, background: "transparent", cursor: "pointer" }}>CONFIRM</button>
                  )}
                  {sp.confirmed && <span style={{ fontSize: 9, color: "#00FF88", fontWeight: 800 }}>✓ CONFIRMED</span>}
                </div>
              );
            })}
            {sponsors.length === 0 && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", padding: "16px 0" }}>No sponsors yet. Add your first one below.</div>}
          </div>
        </div>

        {/* Add sponsor */}
        <div style={{ background: "rgba(255,107,26,0.05)", border: "1px solid rgba(255,107,26,0.2)", borderRadius: 12, padding: "20px 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: "#ff6b1a", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 14 }}>ADD A SPONSOR</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input value={inviteName} onChange={e => setInviteName(e.target.value)} onKeyDown={e => e.key === "Enter" && addSponsor()} placeholder="Sponsor name or business" style={{ flex: 1, minWidth: 180, padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "#fff", fontSize: 13 }} />
            <select value={inviteTier} onChange={e => setInviteTier(e.target.value)} style={{ padding: "9px 12px", background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "#fff", fontSize: 12 }}>
              {SPONSOR_TIERS.map(t => <option key={t.key} value={t.key}>{t.label} ({t.price})</option>)}
            </select>
            <button onClick={addSponsor} disabled={!inviteName.trim()} style={{ padding: "9px 20px", background: inviteName.trim() ? "#ff6b1a" : "rgba(255,255,255,0.08)", border: "none", borderRadius: 7, color: inviteName.trim() ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: 800, fontSize: 12, cursor: inviteName.trim() ? "pointer" : "not-allowed" }}>ADD</button>
          </div>
        </div>

        {/* Invite link */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 10 }}>
          <div style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Share your sponsor invite link to send sponsors directly to your package page.</div>
          <button onClick={copyInviteLink} style={{ padding: "8px 16px", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 7, color: "#00e5ff", fontSize: 10, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
            {copied ? "COPIED!" : "COPY LINK"}
          </button>
        </div>
      </div>
    </main>
  );
}
