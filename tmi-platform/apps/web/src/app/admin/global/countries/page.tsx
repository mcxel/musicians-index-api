import { getAllCountries } from "@/lib/global/GlobalCountryRegistry";
import { getLiveCountries } from "@/lib/global/GlobalActivityEngine";
import { getParityScore } from "@/lib/global/CountryParityEngine";
import { getFlagEmoji } from "@/lib/global/FlagDisplayEngine";
import Link from "next/link";

export default function AdminGlobalCountriesPage() {
  const allCountries = getAllCountries();
  const liveCountriesData = getLiveCountries();
  const liveSet = new Set(liveCountriesData.map(c => c.countryCode));

  return (
    <main className="min-h-screen" style={{ background: "#060410", color: "#fff" }}>
      <div className="px-6 pt-10 pb-6 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <Link href="/admin/global" className="text-xs text-white/30 hover:text-white/60 mb-4 block">← Global Admin</Link>
          <h1 className="text-2xl font-bold" style={{ color: "#00FFFF" }}>Countries Registry</h1>
          <p className="text-sm text-white/40 mt-1">
            {allCountries.length} registered · {liveSet.size} live now
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allCountries.map(country => {
            const isLive = liveSet.has(country.countryCode);
            const parity = getParityScore(country.countryCode);
            const flag = getFlagEmoji(country.countryCode);
            const parityColor = parity.parityPercent >= 80 ? "#00FF88" : parity.parityPercent >= 50 ? "#FFD700" : "#FF6B35";

            return (
              <Link
                key={country.countryCode}
                href={`/global/${country.countryCode.toLowerCase()}`}
                className="rounded-lg p-4 flex items-start gap-3 transition-all hover:scale-[1.01]"
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,${isLive ? "0.12" : "0.05"})` }}
              >
                <span className="text-2xl">{flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{country.name}</span>
                    {isLive && <span className="text-xs text-green-400">● Live</span>}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">{country.region} · {country.primaryGenre}</div>
                  <div className="text-xs mt-1" style={{ color: parityColor }}>Parity: {parity.parityPercent}%</div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {country.languages.slice(0, 3).map(l => (
                      <span key={l} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(0,255,255,0.08)", color: "#00FFFF" }}>{l}</span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
