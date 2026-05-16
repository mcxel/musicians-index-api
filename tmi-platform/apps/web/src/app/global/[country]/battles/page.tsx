import { getCountry } from "@/lib/global/GlobalCountryRegistry";
import { getCountryActivity } from "@/lib/global/GlobalActivityEngine";
import { getCountryHub } from "@/lib/global/CountryParityEngine";
import { getFlagEmoji } from "@/lib/global/FlagDisplayEngine";
import { getCountryBadge } from "@/lib/global/CountryIdentityEngine";
import Link from "next/link";

interface Props {
  params: Promise<{ country: string }>;
}

export default async function CountryBattlesPage({ params }: Props) {
  const { country } = await params;
  const countryCode = country.toUpperCase();
  const countryInfo = getCountry(countryCode);
  const activity = getCountryActivity(countryCode);
  const hub = getCountryHub(countryCode);
  const badge = getCountryBadge(countryCode);
  const flag = getFlagEmoji(countryCode);
  const accent = badge?.accentColor ?? "#FF6B35";

  return (
    <main className="min-h-screen" style={{ background: "#060410", color: "#fff" }}>
      <div className="px-6 pt-10 pb-6 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <Link href={`/global/${country}`} className="text-xs text-white/30 hover:text-white/60 mb-4 block">
            ← {flag} {countryInfo?.name ?? countryCode}
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: accent }}>Battles — {countryInfo?.name ?? countryCode}</h1>
          <p className="text-sm text-white/40 mt-1">
            {activity?.activeBattles ?? 0} active battles · {hub?.battleCount ?? 0} total registered
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="rounded-lg p-6 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,107,53,0.2)" }}>
          <div className="text-4xl mb-4">⚔️</div>
          <h2 className="text-lg font-bold text-white mb-2">
            {activity?.activeBattles ?? 0} Battles Active in {countryInfo?.name ?? countryCode}
          </h2>
          <p className="text-sm text-white/40 mb-6">
            {countryInfo?.primaryGenre} artists are competing right now
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/battles"
              className="px-6 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{ background: `${accent}20`, border: `1px solid ${accent}40`, color: accent }}
            >
              View All Battles
            </Link>
            <Link
              href="/battles/create"
              className="px-6 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{ background: accent, color: "#000" }}
            >
              Start a Battle
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
