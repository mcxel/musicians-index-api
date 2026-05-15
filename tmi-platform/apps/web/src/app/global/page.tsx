export const dynamic = 'force-dynamic';

import { getLiveAcrossTheWorldFeed, getDiscoverNewMusicFeed } from "@/lib/global/GlobalFeedEngine";
import { getLiveCountries, getTotalActiveUsers } from "@/lib/global/GlobalActivityEngine";
import { getGlobalDiscoveryFeed } from "@/lib/global/CultureDiscoveryEngine";
import { getFeaturedRooms } from "@/lib/global/GlobalRoomDiscoveryEngine";
import WorldMusicMap from "@/components/global/WorldMusicMap";
import Link from "next/link";

export default function GlobalPage() {
  const sections = getLiveAcrossTheWorldFeed();
  const discover = getDiscoverNewMusicFeed();
  const liveCountries = getLiveCountries();
  const totalActive = getTotalActiveUsers();
  const cultureFeed = getGlobalDiscoveryFeed();
  const featuredRooms = getFeaturedRooms(6);

  return (
    <main className="min-h-screen" style={{ background: "#060410", color: "#fff" }}>
      {/* Header */}
      <div className="px-6 pt-10 pb-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold" style={{ color: "#00FFFF" }}>
              🌍 Global Music Hub
            </h1>
            <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: "rgba(0,255,136,0.1)", color: "#00FF88" }}>
              {totalActive.toLocaleString()} active worldwide
            </span>
          </div>
          <p className="text-sm text-white/50">Music without borders — {liveCountries.length} countries live right now</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* World Music Map */}
        <section>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Live Countries</h2>
          <WorldMusicMap countries={[]} onCountryClick={() => {}} />
        </section>

        {/* Feed Sections */}
        {sections.map(section => (
          <section key={section.sectionId}>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
              {section.icon} {section.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {section.items.slice(0, 6).map(item => (
                <Link
                  key={item.id}
                  href={item.route}
                  className="rounded-lg p-4 flex items-center gap-3 transition-all hover:scale-[1.01]"
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${item.accentColor ?? "#fff"}20` }}
                >
                  <span className="text-2xl shrink-0">{item.flag}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{item.title}</div>
                    {item.subtitle && <div className="text-xs text-white/40 truncate">{item.subtitle}</div>}
                  </div>
                  {item.isLive && (
                    <span className="ml-auto shrink-0 flex items-center gap-1 text-xs" style={{ color: "#00FF88" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Live
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* Discover New Music Cultures */}
        <section>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">🎵 Discover New Music Cultures</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {discover.slice(0, 6).map(item => (
              <Link
                key={item.id}
                href={item.route}
                className="rounded-lg p-4 transition-all hover:scale-[1.01]"
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${item.accentColor ?? "#fff"}20` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{item.flag}</span>
                  <span className="text-xs font-semibold" style={{ color: item.accentColor ?? "#00FFFF" }}>{item.title}</span>
                </div>
                <p className="text-xs text-white/50 line-clamp-2">{item.subtitle}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Culture Spotlights */}
        <section>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">✨ Culture Spotlights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cultureFeed.spotlights.slice(0, 4).map(s => (
              <Link
                key={s.countryCode}
                href={`/global/${s.countryCode.toLowerCase()}`}
                className="rounded-lg p-4 transition-all hover:scale-[1.01]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{s.flag}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{s.featuredArtist}</div>
                    <div className="text-xs text-white/40">{s.genre} · {s.language}</div>
                  </div>
                </div>
                <p className="text-xs text-white/50">{s.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Global Rooms */}
        {featuredRooms.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">🎙️ Featured Global Rooms</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {featuredRooms.map(room => (
                <Link
                  key={room.roomId}
                  href={room.route}
                  className="rounded-lg p-3 transition-all hover:scale-[1.01]"
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${room.accentColor}20` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{room.flag}</span>
                    <span className="text-sm font-semibold text-white truncate">{room.title}</span>
                  </div>
                  <div className="text-xs text-white/40">{room.genre} · {room.activeUsers} live</div>
                  {room.isLive && <span className="text-xs text-green-400 mt-1 block">● Live</span>}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
