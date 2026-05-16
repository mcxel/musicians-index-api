import { getCountry } from "@/lib/global/GlobalCountryRegistry";
import { getCountryHub } from "@/lib/global/CountryParityEngine";
import { getRoomsByCountry } from "@/lib/global/GlobalRoomDiscoveryEngine";
import { getFlagEmoji } from "@/lib/global/FlagDisplayEngine";
import { getCountryBadge } from "@/lib/global/CountryIdentityEngine";
import Link from "next/link";

interface Props {
  params: Promise<{ country: string }>;
}

export default async function CountryVenuesPage({ params }: Props) {
  const { country } = await params;
  const countryCode = country.toUpperCase();
  const countryInfo = getCountry(countryCode);
  const hub = getCountryHub(countryCode);
  const rooms = getRoomsByCountry(countryCode);
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
          <h1 className="text-2xl font-bold" style={{ color: accent }}>Venues in {countryInfo?.name ?? countryCode}</h1>
          <p className="text-sm text-white/40 mt-1">{hub?.venueCount ?? 0} venues · {rooms.length} live rooms</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rooms.map(room => (
            <Link
              key={room.roomId}
              href={room.route}
              className="rounded-lg p-4 transition-all hover:scale-[1.01]"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${room.accentColor}20` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{room.flag}</span>
                <span className="text-sm font-semibold text-white">{room.title}</span>
                {room.isLive && <span className="ml-auto text-xs text-green-400">● Live</span>}
              </div>
              <div className="text-xs text-white/40">{room.genre} · {room.language} · {room.activeUsers} listeners</div>
            </Link>
          ))}
        </div>
        {rooms.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/40">No live venues in {countryInfo?.name ?? countryCode} right now.</p>
          </div>
        )}
      </div>
    </main>
  );
}
