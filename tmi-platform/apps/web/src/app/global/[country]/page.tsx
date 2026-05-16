import { getCountry } from "@/lib/global/GlobalCountryRegistry";
import { getCountryActivity } from "@/lib/global/GlobalActivityEngine";
import { getCountryHub } from "@/lib/global/CountryParityEngine";
import { getCountryBadge } from "@/lib/global/CountryIdentityEngine";
import { getRoomsByCountry } from "@/lib/global/GlobalRoomDiscoveryEngine";
import { getSpotlightByCountry } from "@/lib/global/CultureDiscoveryEngine";
import { getLessonsForCountry } from "@/lib/global/CultureLearningEngine";
import { getFlagEmoji } from "@/lib/global/FlagDisplayEngine";
import Link from "next/link";

interface Props {
  params: Promise<{ country: string }>;
}

export default async function CountryHubPage({ params }: Props) {
  const { country } = await params;
  const countryCode = country.toUpperCase();

  const countryInfo = getCountry(countryCode);
  const activity = getCountryActivity(countryCode);
  const hub = getCountryHub(countryCode);
  const badge = getCountryBadge(countryCode);
  const rooms = getRoomsByCountry(countryCode).slice(0, 6);
  const spotlightEntry = getSpotlightByCountry(countryCode);
  const spotlights = spotlightEntry ? [spotlightEntry] : [];
  const lessons = getLessonsForCountry(countryCode);
  const flag = getFlagEmoji(countryCode);

  if (!countryInfo) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#060410", color: "#fff" }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🌐</div>
          <h1 className="text-xl font-bold mb-2">Country not found</h1>
          <p className="text-white/40 mb-6">"{countryCode}" isn't in the global registry yet.</p>
          <Link href="/global" className="text-cyan-400 text-sm hover:underline">← Back to Global Hub</Link>
        </div>
      </main>
    );
  }

  const accentColor = badge?.accentColor ?? "#00FFFF";

  return (
    <main className="min-h-screen" style={{ background: "#060410", color: "#fff" }}>
      {/* Hero */}
      <div className="px-6 pt-10 pb-8 border-b border-white/5" style={{ borderColor: `${accentColor}15` }}>
        <div className="max-w-4xl mx-auto">
          <Link href="/global" className="text-xs text-white/30 hover:text-white/60 mb-4 block">← Global Hub</Link>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-5xl">{flag}</span>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: accentColor }}>{countryInfo.name}</h1>
              <p className="text-sm text-white/50">{countryInfo.region} · {countryInfo.primaryGenre}</p>
            </div>
          </div>
          {activity && (
            <div className="flex flex-wrap gap-4 text-xs font-mono mt-4">
              <span style={{ color: "#00FF88" }}>{activity.activeRooms} rooms</span>
              <span style={{ color: "#00FFFF" }}>{activity.activeArtists} artists</span>
              <span style={{ color: "#AA2DFF" }}>{activity.activeFans} fans</span>
              <span style={{ color: "#FFD700" }}>{activity.activeBattles} battles</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
        {/* Sub-nav */}
        <nav className="flex gap-3 flex-wrap">
          {[
            { label: "Artists", href: `/global/${country}/artists` },
            { label: "Venues", href: `/global/${country}/venues` },
            { label: "Battles", href: `/global/${country}/battles` },
            { label: "Magazine", href: `/global/${country}/magazine` },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-full text-xs font-mono transition-all hover:scale-105"
              style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30`, color: accentColor }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Hub Stats */}
        {hub && (
          <section>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Platform Presence</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Artists", value: hub.artistCount },
                { label: "Venues", value: hub.venueCount },
                { label: "Battles", value: hub.battleCount },
                { label: "Magazine", value: hub.articleCount },
              ].map(stat => (
                <div key={stat.label} className="rounded-lg p-3 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="text-2xl font-bold" style={{ color: accentColor }}>{stat.value}</div>
                  <div className="text-xs text-white/40 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Genres */}
        {countryInfo.genres.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {countryInfo.genres.map(genre => (
                <span
                  key={genre}
                  className="px-3 py-1 rounded-full text-xs"
                  style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}25` }}
                >
                  {genre}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Live Rooms */}
        {rooms.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">🎙️ Live Rooms</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rooms.map(room => (
                <Link
                  key={room.roomId}
                  href={room.route}
                  className="rounded-lg p-3 flex items-center gap-3 transition-all hover:scale-[1.01]"
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${room.accentColor}20` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{room.title}</div>
                    <div className="text-xs text-white/40">{room.genre} · {room.activeUsers} live</div>
                  </div>
                  {room.isLive && <span className="text-xs text-green-400 shrink-0">● Live</span>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Culture Spotlights */}
        {spotlights.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">✨ Culture Spotlight</h2>
            {spotlights.slice(0, 2).map(s => (
              <div key={s.countryCode} className="rounded-lg p-4 mb-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{s.flag}</span>
                  <div>
                    <div className="font-semibold text-white">{s.featuredArtist}</div>
                    <div className="text-xs text-white/40">{s.genre} · {s.language}</div>
                  </div>
                </div>
                <p className="text-sm text-white/60">{s.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Culture Lessons */}
        {lessons.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">📚 Culture Lessons</h2>
            <div className="space-y-2">
              {lessons.map(lesson => (
                <div key={lesson.lessonId} className="rounded-lg p-4 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div>
                    <div className="text-sm font-semibold text-white">{lesson.title}</div>
                    <div className="text-xs text-white/40">{lesson.estimatedMinutes} min · {lesson.difficulty}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded" style={{ background: `${accentColor}15`, color: accentColor }}>
                    Start
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {badge && (
          <section>
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">🌐 Language</h2>
            <div className="rounded-lg p-4 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div>
                <div className="text-sm text-white">{badge.primaryLanguage}</div>
                {badge.genreNote && <div className="text-xs text-white/40 mt-0.5">{badge.genreNote}</div>}
              </div>
              <div className="flex gap-2 text-xs">
                {badge.translationAvailable && <span style={{ color: "#00FFFF" }}>✓ Translation</span>}
                {badge.captionAvailable && <span style={{ color: "#AA2DFF" }}>✓ Captions</span>}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
