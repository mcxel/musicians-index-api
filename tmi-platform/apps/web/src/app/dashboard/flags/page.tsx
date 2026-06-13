"use client";
import { useState } from "react";
import Link from "next/link";
import { CURRENT_PHASE, PHASE_1_BOTS, PHASE_1_FLAGS, PHASE_1_ACTIVE_ROOMS } from "@/lib/bots/Phase1LaunchConfig";

const ACCENT = "#F472B6";

type FlagKey = string;
interface Flag { key: FlagKey; label: string; desc: string; value: boolean; category: string; }

const FLAGS: Flag[] = [
  { key: "signupEnabled",          label: "Signup Enabled",         desc: "Allow new user registrations",          value: PHASE_1_FLAGS.signupEnabled,          category: "AUTH"     },
  { key: "allRolesEnabled",        label: "All Roles",              desc: "Enable all 8 role types at signup",     value: PHASE_1_FLAGS.allRolesEnabled,        category: "AUTH"     },
  { key: "paymentsEnabled",        label: "Payments",               desc: "Stripe checkout + subscriptions live",  value: PHASE_1_FLAGS.paymentsEnabled,        category: "REVENUE"  },
  { key: "ticketPrintingEnabled",  label: "Ticket Printing",        desc: "Thermal ticket print for venues",       value: PHASE_1_FLAGS.ticketPrintingEnabled,  category: "REVENUE"  },
  { key: "nftMintingEnabled",      label: "NFT Minting",            desc: "Artists can mint NFTs from beats",      value: PHASE_1_FLAGS.nftMintingEnabled,      category: "WEB3"     },
  { key: "beatAuctionEnabled",     label: "Beat Auction",           desc: "Live beat auction during shows",        value: PHASE_1_FLAGS.beatAuctionEnabled,     category: "WEB3"     },
  { key: "welcomeBot",             label: "Welcome Bot",            desc: "Auto-greet new users in rooms",         value: PHASE_1_BOTS.welcomeBot,              category: "BOTS"     },
  { key: "ghostForceDrip",         label: "Ghost Force Drip",       desc: "Ghost audience presence in Phase 1",   value: PHASE_1_BOTS.ghostForceDrip,          category: "BOTS"     },
  { key: "silentModeration",       label: "Silent Moderation",      desc: "Auto-flag without visible action",      value: PHASE_1_BOTS.silentModeration,        category: "BOTS"     },
  { key: "loggingSentinel",        label: "Logging Sentinel",       desc: "Bot that watches uptime + errors",      value: PHASE_1_BOTS.loggingSentinel,         category: "BOTS"     },
  { key: "fullBotSwarm",           label: "Full Bot Swarm",         desc: "All 62 bots active (Phase 2+)",         value: PHASE_1_BOTS.fullBotSwarm,            category: "BOTS"     },
  { key: "populationSimulator",    label: "Population Simulator",   desc: "Simulate large audience presence",      value: PHASE_1_BOTS.populationSimulator,     category: "BOTS"     },
];

const CAT_COLOR: Record<string, string> = { AUTH: "#00FFFF", REVENUE: "#34D399", WEB3: "#AA2DFF", BOTS: "#FF9500" };

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>(FLAGS);
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  function toggle(key: FlagKey) {
    setFlags(prev => prev.map(f => f.key === key ? { ...f, value: !f.value } : f));
    const flag = flags.find(f => f.key === key);
    showToast(`${flag?.label} → ${flag?.value ? "OFF" : "ON"}`);
  }

  const categories = [...new Set(flags.map(f => f.category))];
  const enabledCount = flags.filter(f => f.value).length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(244,114,182,0.25)", padding: "11px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>ADMIN — FEATURE FLAGS</div>
          <div style={{ fontSize: 14, fontWeight: 900 }}>🚩 Phase Control · <span style={{ color: "#FF9500", fontSize: 12 }}>{CURRENT_PHASE}</span> · {enabledCount}/{flags.length} enabled</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => showToast("Changes saved (env update required for prod)")} style={{ fontSize: 10, fontWeight: 800, color: "#000", background: ACCENT, border: "none", padding: "6px 16px", borderRadius: 6, cursor: "pointer" }}>SAVE</button>
          <Link href="/dashboard/admin" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>← Admin</Link>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
        {toast && <div style={{ marginBottom: 14, padding: "10px 16px", background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.25)", borderRadius: 8, fontSize: 12, color: ACCENT }}>{toast}</div>}

        {/* Active rooms */}
        <div style={{ background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.12)", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: "#00FFFF", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 8 }}>PHASE 1 ACTIVE ROOMS</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PHASE_1_ACTIVE_ROOMS.map(r => (
              <Link key={r} href={`/live/rooms/${r}`} style={{ padding: "5px 14px", background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#00FFFF", textDecoration: "none" }}>🟢 {r}</Link>
            ))}
          </div>
        </div>

        {categories.map(cat => {
          const catFlags = flags.filter(f => f.category === cat);
          const cc = CAT_COLOR[cat] ?? "#888";
          return (
            <div key={cat} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: cc, fontWeight: 800, letterSpacing: "0.2em", marginBottom: 10 }}>{cat} FLAGS</div>
              <div style={{ display: "grid", gap: 8 }}>
                {catFlags.map(f => (
                  <div key={f.key} style={{ background: f.value ? `${cc}06` : "rgba(255,255,255,0.02)", border: `1px solid ${f.value ? cc + "25" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{f.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{f.desc}</div>
                    </div>
                    <button onClick={() => toggle(f.key)} style={{ padding: "7px 18px", fontWeight: 900, fontSize: 10, letterSpacing: "0.08em", borderRadius: 20, border: "none", cursor: "pointer", background: f.value ? cc : "rgba(255,255,255,0.07)", color: f.value ? "#000" : "rgba(255,255,255,0.4)", transition: "all 0.15s" }}>
                      {f.value ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div style={{ background: "rgba(255,149,0,0.05)", border: "1px solid rgba(255,149,0,0.15)", borderRadius: 10, padding: "12px 16px", fontSize: 11, color: "rgba(255,149,0,0.7)" }}>
          ⚠️ Toggling flags here is visual only. To persist changes, update <code style={{ color: "#FF9500" }}>Phase1LaunchConfig.ts</code> and redeploy.
        </div>
      </div>
    </main>
  );
}
