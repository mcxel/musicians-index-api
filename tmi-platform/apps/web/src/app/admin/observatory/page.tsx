"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import HomeFeedObserver from "@/components/admin/HomeFeedObserver";

// ─── Simulated live data ────────────────────────────────────────────────────
const MOCK_BOTS = [
  { id: "b001", name: "Fan-Aria", role: "fan",       status: "streaming",  room: "Cypher Arena",    isBot: true },
  { id: "b002", name: "Fan-Dex",  role: "fan",       status: "browsing",   room: "Home 2",          isBot: true },
  { id: "b003", name: "Art-Nova", role: "artist",    status: "streaming",  room: "Live Stage 1",    isBot: true },
  { id: "b004", name: "Art-Rex",  role: "artist",    status: "working",    room: "Dashboard",       isBot: true },
  { id: "b005", name: "Sp-Zane",  role: "sponsor",   status: "browsing",   room: "Marketplace",     isBot: true },
  { id: "b006", name: "Fan-Kira", role: "fan",       status: "streaming",  room: "Battle Ring",     isBot: true },
  { id: "b007", name: "Fan-Leo",  role: "fan",       status: "idle",       room: "Home 3",          isBot: true },
  { id: "b008", name: "Art-Mox",  role: "artist",    status: "streaming",  room: "World Stage",     isBot: true },
  { id: "b009", name: "Adv-Rena", role: "advertiser",status: "working",   room: "Campaign Builder", isBot: true },
  { id: "b010", name: "Fan-Oryn", role: "fan",       status: "browsing",   room: "Charts",          isBot: true },
];

const TOP10_MOCK = [
  { rank: 1, name: "Nova Kane",   genre: "Hip Hop",  pts: 14200, trend: "up"   },
  { rank: 2, name: "Ari Volt",    genre: "R&B",      pts: 13800, trend: "same" },
  { rank: 3, name: "Rhyme Lane",  genre: "Hip Hop",  pts: 12400, trend: "up"   },
  { rank: 4, name: "Echo Vee",    genre: "Pop",      pts: 11900, trend: "down" },
  { rank: 5, name: "Lex Royal",   genre: "EDM",      pts: 11200, trend: "up"   },
];

const ROUTE_HEALTH = [
  { route: "/home/1",          status: "ok",   ms: 42  },
  { route: "/home/2",          status: "ok",   ms: 38  },
  { route: "/home/3",          status: "ok",   ms: 55  },
  { route: "/home/4",          status: "ok",   ms: 51  },
  { route: "/home/5",          status: "ok",   ms: 48  },
  { route: "/rooms/random",    status: "ok",   ms: 62  },
  { route: "/live/cypher",     status: "warn", ms: 198 },
  { route: "/marketplace",     status: "ok",   ms: 44  },
  { route: "/booking",         status: "ok",   ms: 39  },
  { route: "/rewards",         status: "ok",   ms: 41  },
];

const SPONSOR_ROTATIONS = [
  { slot: "Billboard Hero",   sponsor: "SoundWave Audio",   impressions: 4820, ctr: "3.2%" },
  { slot: "Lobby Wall",       sponsor: "BeatBox Pro",       impressions: 2910, ctr: "2.7%" },
  { slot: "Cypher Banner",    sponsor: "UrbanPulse Records", impressions: 1650, ctr: "4.1%" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────
function NeonCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-xl border border-cyan-500/30 bg-black/70 backdrop-blur-md p-5 shadow-[0_0_20px_rgba(0,255,255,0.08)] ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children, color = "cyan" }: { children: React.ReactNode; color?: "cyan" | "fuchsia" | "gold" | "green" }) {
  const colors: Record<string, string> = {
    cyan:    "text-cyan-400 border-cyan-500",
    fuchsia: "text-fuchsia-400 border-fuchsia-500",
    gold:    "text-yellow-400 border-yellow-500",
    green:   "text-emerald-400 border-emerald-500",
  };
  return (
    <h3 className={`text-xs font-black tracking-[0.3em] uppercase mb-4 pl-3 border-l-4 ${colors[color]}`}>
      {children}
    </h3>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    streaming: "bg-green-400 animate-pulse",
    working:   "bg-cyan-400",
    browsing:  "bg-yellow-400",
    idle:      "bg-zinc-500",
  };
  return <span className={`inline-block w-2 h-2 rounded-full mr-2 ${map[status] ?? "bg-zinc-500"}`} />;
}

// ─── Main Observatory Page ───────────────────────────────────────────────────
export default function ObservatoryPage() {
  const [tick, setTick] = useState(0);

  // Tick every 5s to simulate live data refresh
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const streaming  = MOCK_BOTS.filter((b) => b.status === "streaming").length;
  const working    = MOCK_BOTS.filter((b) => b.status === "working").length;
  const browsing   = MOCK_BOTS.filter((b) => b.status === "browsing").length;
  const idle       = MOCK_BOTS.filter((b) => b.status === "idle").length;
  const warnRoutes = ROUTE_HEALTH.filter((r) => r.status !== "ok").length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans">
      <div className="mb-6">
        <HomeFeedObserver title="Observatory Feed Observer" />
      </div>

      {/* ── Header ── */}
      <header className="mb-8 flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <p className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-400/70 mb-1">TMI Admin</p>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-cyan-400 drop-shadow-[0_0_18px_rgba(0,255,255,0.4)]">
            Observatory
          </h1>
          <p className="text-zinc-500 text-xs mt-1 tracking-widest uppercase">Live world pulse · synthetic population · route health</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/40 px-4 py-2 rounded-full text-xs font-bold text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            SIMULATION ACTIVE
          </div>
          <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/40 px-4 py-2 rounded-full text-xs font-bold text-cyan-400">
            {warnRoutes > 0 ? (
              <><span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />{warnRoutes} ROUTE WARN</>
            ) : (
              <><span className="w-2 h-2 rounded-full bg-cyan-400" />ALL ROUTES OK</>
            )}
          </div>
        </div>
      </header>

      {/* ── Stat Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Streaming",  val: streaming,        color: "text-green-400"   },
          { label: "Working",    val: working,          color: "text-cyan-400"    },
          { label: "Browsing",   val: browsing,         color: "text-yellow-400"  },
          { label: "Idle",       val: idle,             color: "text-zinc-500"    },
        ].map((s) => (
          <NeonCard key={s.label} className="text-center">
            <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-[10px] text-zinc-500 tracking-widest uppercase mt-1">{s.label} Bots</p>
          </NeonCard>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Lobby Wall / Bot Feed – 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          <NeonCard>
            <SectionTitle color="cyan">Live Lobby Wall · Bot Population Feed</SectionTitle>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {MOCK_BOTS.map((bot) => (
                <div key={bot.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-xs border border-white/5 hover:border-cyan-400/30 transition">
                  <span className="flex items-center gap-2 font-bold text-white">
                    <StatusDot status={bot.status} />
                    {bot.name}
                    <span className="text-zinc-500 font-normal">({bot.role})</span>
                  </span>
                  <span className="text-zinc-400">{bot.room}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    bot.status === "streaming" ? "bg-green-500/20 text-green-400" :
                    bot.status === "working"   ? "bg-cyan-500/20 text-cyan-400"   :
                    bot.status === "browsing"  ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-zinc-700 text-zinc-400"
                  }`}>{bot.status.toUpperCase()}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-600 mt-3 tracking-widest">Refreshed every 5s · tick #{tick}</p>
          </NeonCard>

          {/* Sponsor Rotation Heatmap */}
          <NeonCard>
            <SectionTitle color="gold">Sponsor Rotation · Impressions</SectionTitle>
            <div className="space-y-3">
              {SPONSOR_ROTATIONS.map((s) => (
                <div key={s.slot} className="flex items-center justify-between text-xs bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-4 py-3">
                  <div>
                    <p className="font-bold text-white">{s.sponsor}</p>
                    <p className="text-zinc-500">{s.slot}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-black">{s.impressions.toLocaleString()} impr.</p>
                    <p className="text-zinc-400">CTR {s.ctr}</p>
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>
        </div>

        {/* Right sidebar – 4 cols */}
        <div className="lg:col-span-4 space-y-6">

          {/* Top 10 Pressure */}
          <NeonCard>
            <SectionTitle color="fuchsia">Top 10 Rotation Pressure</SectionTitle>
            <ol className="space-y-2">
              {TOP10_MOCK.map((a) => (
                <li key={a.rank} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                  <span className="flex items-center gap-2">
                    <span className="text-zinc-500 w-4">#{a.rank}</span>
                    <Link href={`/artists/${a.name.toLowerCase().replace(" ", "-")}`} className="font-bold text-white hover:text-cyan-400 transition">{a.name}</Link>
                    <span className="text-[9px] text-zinc-500 uppercase">{a.genre}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-fuchsia-400 font-black">{a.pts.toLocaleString()}</span>
                    <span className={`text-[10px] ${a.trend === "up" ? "text-green-400" : a.trend === "down" ? "text-red-400" : "text-zinc-500"}`}>
                      {a.trend === "up" ? "▲" : a.trend === "down" ? "▼" : "—"}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </NeonCard>

          {/* Route Health */}
          <NeonCard>
            <SectionTitle color="green">Route Health</SectionTitle>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {ROUTE_HEALTH.map((r) => (
                <div key={r.route} className="flex items-center justify-between text-xs px-2 py-1.5 rounded border border-white/5">
                  <span className="font-mono text-zinc-300">{r.route}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">{r.ms}ms</span>
                    <span className={`w-2 h-2 rounded-full ${r.status === "ok" ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`} />
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>

          {/* Quick Nav */}
          <NeonCard>
            <SectionTitle>Admin Quick Nav</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["/admin/rankings",     "Rankings"],
                ["/admin/sponsors",     "Sponsors"],
                ["/admin/rooms",        "Rooms"],
                ["/admin/moderation",   "Moderation"],
                ["/admin/route-health", "Routes"],
                ["/admin/simulation",   "Simulation"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-bold text-zinc-300 hover:border-cyan-400/50 hover:text-cyan-400 transition text-center">
                  {label}
                </Link>
              ))}
            </div>
          </NeonCard>
        </div>
      </div>
    </div>
  );
}
