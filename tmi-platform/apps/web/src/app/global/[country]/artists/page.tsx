import { getCountry } from "@/lib/global/GlobalCountryRegistry";
import { getArtistsByCountry } from "@/lib/global/CountryIdentityEngine";
import { getFlagEmoji } from "@/lib/global/FlagDisplayEngine";
import { getCountryBadge } from "@/lib/global/CountryIdentityEngine";
import Link from "next/link";

interface Props {
  params: Promise<{ country: string }>;
}

export default async function CountryArtistsPage({ params }: Props) {
  const { country } = await params;
  const countryCode = country.toUpperCase();
  const countryInfo = getCountry(countryCode);
  const artists = getArtistsByCountry(countryCode);
  const badge = getCountryBadge(countryCode);
  const flag = getFlagEmoji(countryCode);
  const accent = badge?.accentColor ?? "#00FFFF";

  return (
    <main className="min-h-screen" style={{ background: "#060410", color: "#fff" }}>
      <div className="px-6 pt-10 pb-6 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <Link href={`/global/${country}`} className="text-xs text-white/30 hover:text-white/60 mb-4 block">
            ← {flag} {countryInfo?.name ?? countryCode}
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: accent }}>Artists from {countryInfo?.name ?? countryCode}</h1>
          <p className="text-sm text-white/40 mt-1">{artists.length} registered · {countryInfo?.primaryGenre ?? "Global"}</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {artists.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">{flag}</div>
            <p className="text-white/40">No artists registered from {countryInfo?.name ?? countryCode} yet.</p>
            <Link href="/onboarding/artist" className="mt-4 inline-block text-xs px-4 py-2 rounded-full" style={{ background: `${accent}15`, color: accent }}>
              Be the first →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {artists.map(a => (
              <Link
                key={a.artistId}
                href={`/artists/${a.artistId}`}
                className="rounded-lg p-4 flex items-center gap-3 transition-all hover:scale-[1.01]"
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${accent}20` }}
              >
                <span className="text-xl">{flag}</span>
                <div>
                  <div className="text-sm font-semibold text-white">{a.artistId}</div>
                  <div className="text-xs text-white/40">{a.badge.genreNote ?? countryInfo?.primaryGenre}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
