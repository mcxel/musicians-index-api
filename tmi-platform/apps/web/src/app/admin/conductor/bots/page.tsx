"use client";

import { useEffect, useState } from "react";

type BotTeam = {
  id: string;
  name: string;
  category: string;
  mission: string;
  qualityScore: number;
  agents: { id: string; handle: string; status: string }[];
  _count: { tasks: number; checkpoints: number };
};

const CATEGORY_ICON: Record<string, string> = {
  BUILD_ENGINEERING: "⚙️",
  DESIGN_CREATIVE: "🎨",
  ARCHITECTURE_SYSTEM: "🏗️",
  MAGAZINE_EDITORIAL: "📰",
  LIVE_GAME: "🎮",
  ECONOMY_REVENUE: "💰",
  SECURITY_SUPPORT: "🛡️",
  AI_ASSET: "🤖",
  NFT_CREATION: "🖼️",
  BEAT_PRODUCTION: "🎵",
  ANIMATION_CINEMA: "🎬",
  SOCIAL_COMMUNITY: "🌐",
  ANALYTICS_REPORTING: "📊",
};

const STATUS_DOT: Record<string, string> = {
  ACTIVE: "bg-green-400",
  ASSIGNED: "bg-blue-400",
  IDLE: "bg-white/30",
  PAUSED: "bg-yellow-400",
  ERROR: "bg-red-500",
  DECOMMISSIONED: "bg-white/10",
};

export default function ConductorBotsPage() {
  const [teams, setTeams] = useState<BotTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/conductor/bots")
      .then((r) => r.json())
      .then((d) => { setTeams(d.teams ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const r = await fetch("/api/conductor/seed", { method: "POST" });
      const d = await r.json();
      const created = d.seeded?.filter((s: any) => s.status === "created").length ?? 0;
      setSeedResult(`Seeded ${created} new team(s).`);
      // Reload
      const r2 = await fetch("/api/conductor/bots");
      const d2 = await r2.json();
      setTeams(d2.teams ?? []);
    } catch {
      setSeedResult("Seed failed. Check API.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <a href="/admin/conductor" className="text-white/30 text-xs hover:text-white/60 mb-1 block">← MC Command Center</a>
            <h1 className="text-2xl font-black">Bot Team Registry</h1>
            <p className="text-white/40 text-sm">{teams.length} registered teams · All report to Michael Charlie</p>
          </div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="text-xs px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50 transition-colors"
          >
            {seeding ? "Seeding..." : "Seed Default Teams"}
          </button>
        </div>

        {seedResult && (
          <div className="mb-4 rounded-lg border border-green-500/30 bg-green-950/20 p-3 text-green-300 text-xs">
            {seedResult}
          </div>
        )}

        {loading ? (
          <div className="text-white/40 text-sm">Loading bot registry...</div>
        ) : teams.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
            <div className="text-white/30 text-sm mb-3">No bot teams registered.</div>
            <button onClick={handleSeed} className="text-xs px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white">
              Seed Default Registry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team) => (
              <div key={team.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{CATEGORY_ICON[team.category] ?? "🤖"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-white">{team.name}</div>
                      <div className="text-xs text-white/30">Quality: {(team.qualityScore * 100).toFixed(0)}%</div>
                    </div>
                    <div className="text-xs text-white/40 mt-1 line-clamp-2">{team.mission}</div>
                    <div className="flex gap-3 mt-2 text-xs text-white/30">
                      <span>{team._count.tasks} tasks</span>
                      <span>{team._count.checkpoints} checkpoints</span>
                      <span>{team.agents.length} agents</span>
                    </div>
                    {team.agents.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {team.agents.slice(0, 6).map((agent) => (
                          <div key={agent.id} className="flex items-center gap-1 text-xs text-white/40">
                            <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[agent.status] ?? "bg-white/20"}`} />
                            {agent.handle}
                          </div>
                        ))}
                        {team.agents.length > 6 && (
                          <span className="text-xs text-white/20">+{team.agents.length - 6} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
