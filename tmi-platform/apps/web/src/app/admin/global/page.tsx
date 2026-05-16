import { getLiveCountries, getTotalActiveUsers } from "@/lib/global/GlobalActivityEngine";
import { getAllHubs, getParityScore } from "@/lib/global/CountryParityEngine";
import { getTranslationBotStats } from "@/lib/bots/TranslationBotEngine";
import { getDiscoveryBotStats } from "@/lib/bots/GlobalDiscoveryBotEngine";
import { getFlagEmoji } from "@/lib/global/FlagDisplayEngine";
import Link from "next/link";

export default function AdminGlobalPage() {
  const liveCountries = getLiveCountries();
  const totalActive = getTotalActiveUsers();
  const hubs = getAllHubs();
  const translationStats = getTranslationBotStats();
  const discoveryStats = getDiscoveryBotStats();

  return (
    <main className="min-h-screen" style={{ background: "#060410", color: "#fff" }}>
      <div className="px-6 pt-10 pb-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <Link href="/admin" className="text-xs text-white/30 hover:text-white/60 mb-4 block">← Admin</Link>
          <h1 className="text-2xl font-bold" style={{ color: "#00FFFF" }}>Global System Admin</h1>
          <p className="text-sm text-white/40 mt-1">Monitor global presence, language coverage, and country parity</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Countries Live", value: liveCountries.length, color: "#00FF88" },
            { label: "Total Active", value: totalActive.toLocaleString(), color: "#00FFFF" },
            { label: "Translation Bots", value: translationStats.totalSessions, color: "#AA2DFF" },
            { label: "Discovery Recs", value: discoveryStats.totalRecommendations, color: "#FFD700" },
          ].map(stat => (
            <div key={stat.label} className="rounded-lg p-4 text-center" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${stat.color}20` }}>
              <div className="text-2xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Admin Sub-nav */}
        <nav className="flex gap-3 flex-wrap">
          {[
            { label: "Languages", href: "/admin/global/languages" },
            { label: "Countries", href: "/admin/global/countries" },
            { label: "Captions", href: "/admin/global/captions" },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg text-sm font-mono transition-all hover:scale-105"
              style={{ background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.2)", color: "#00FFFF" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Country Parity Table */}
        <section>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Country Parity Scores</h2>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <th className="text-left px-4 py-3 text-xs text-white/40 font-normal">Country</th>
                  <th className="text-left px-4 py-3 text-xs text-white/40 font-normal">Genre</th>
                  <th className="text-right px-4 py-3 text-xs text-white/40 font-normal">Parity %</th>
                  <th className="text-right px-4 py-3 text-xs text-white/40 font-normal">Artists</th>
                  <th className="text-right px-4 py-3 text-xs text-white/40 font-normal">Venues</th>
                </tr>
              </thead>
              <tbody>
                {hubs.map(hub => {
                  const parity = getParityScore(hub.countryCode);
                  const flag = getFlagEmoji(hub.countryCode);
                  const color = parity.parityPercent >= 80 ? "#00FF88" : parity.parityPercent >= 50 ? "#FFD700" : "#FF6B35";
                  return (
                    <tr key={hub.countryCode} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <Link href={`/admin/global/countries`} className="flex items-center gap-2 hover:text-cyan-400">
                          <span>{flag}</span>
                          <span className="text-white">{hub.countryCode}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-white/50">{hub.featuredGenre}</td>
                      <td className="px-4 py-3 text-right font-mono" style={{ color }}>{parity.parityPercent}%</td>
                      <td className="px-4 py-3 text-right text-white/60">{hub.artistCount}</td>
                      <td className="px-4 py-3 text-right text-white/60">{hub.venueCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bot Stats */}
        <section>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Global Bot Activity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,255,255,0.15)" }}>
              <div className="text-xs text-white/40 mb-2">Translation Bot</div>
              <div className="text-2xl font-bold text-cyan-400">{translationStats.totalTranslations}</div>
              <div className="text-xs text-white/30 mt-1">translations · {translationStats.totalCaptions} captions</div>
            </div>
            <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(170,45,255,0.15)" }}>
              <div className="text-xs text-white/40 mb-2">Discovery Bot</div>
              <div className="text-2xl font-bold" style={{ color: "#AA2DFF" }}>{discoveryStats.totalRecommendations}</div>
              <div className="text-xs text-white/30 mt-1">recommendations · {discoveryStats.seededRooms} rooms seeded</div>
            </div>
            <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,255,136,0.15)" }}>
              <div className="text-xs text-white/40 mb-2">Global Presence</div>
              <div className="text-2xl font-bold text-green-400">{liveCountries.length}</div>
              <div className="text-xs text-white/30 mt-1">countries · {totalActive} users active</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
