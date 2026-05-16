import { getCountry } from "@/lib/global/GlobalCountryRegistry";
import { getSpotlightByCountry } from "@/lib/global/CultureDiscoveryEngine";
import { getCountryHub } from "@/lib/global/CountryParityEngine";
import { getFlagEmoji } from "@/lib/global/FlagDisplayEngine";
import { getCountryBadge } from "@/lib/global/CountryIdentityEngine";
import Link from "next/link";

interface Props {
  params: Promise<{ country: string }>;
}

export default async function CountryMagazinePage({ params }: Props) {
  const { country } = await params;
  const countryCode = country.toUpperCase();
  const countryInfo = getCountry(countryCode);
  const spotlightEntry = getSpotlightByCountry(countryCode);
  const spotlights = spotlightEntry ? [spotlightEntry] : [];
  const hub = getCountryHub(countryCode);
  const badge = getCountryBadge(countryCode);
  const flag = getFlagEmoji(countryCode);
  const accent = badge?.accentColor ?? "#FF2DAA";

  return (
    <main className="min-h-screen" style={{ background: "#060410", color: "#fff" }}>
      <div className="px-6 pt-10 pb-6 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <Link href={`/global/${country}`} className="text-xs text-white/30 hover:text-white/60 mb-4 block">
            ← {flag} {countryInfo?.name ?? countryCode}
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: accent }}>
            TMI Magazine — {countryInfo?.name ?? countryCode}
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {hub?.articleCount ?? 0} features · {countryInfo?.primaryGenre ?? "Global Music"}
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {spotlights.length > 0 ? (
          spotlights.map(s => (
            <div key={s.countryCode} className="rounded-xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${accent}20` }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{s.flag}</span>
                <div>
                  <h2 className="text-lg font-bold text-white">{s.featuredArtist}</h2>
                  <p className="text-xs text-white/40">{s.genre} · {s.language} · {s.countryCode}</p>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-4">{s.description}</p>
              <div className="flex flex-wrap gap-2">
                {s.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ background: `${accent}15`, color: accent }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">{flag}</div>
            <p className="text-white/40">No magazine features yet for {countryInfo?.name ?? countryCode}.</p>
            <Link href="/magazine" className="mt-4 inline-block text-xs px-4 py-2 rounded-full" style={{ background: `${accent}15`, color: accent }}>
              Browse TMI Magazine →
            </Link>
          </div>
        )}
        <div className="pt-4 border-t border-white/5">
          <Link href="/magazine" className="text-sm text-white/40 hover:text-white/70">
            ← All TMI Magazine Issues
          </Link>
        </div>
      </div>
    </main>
  );
}
