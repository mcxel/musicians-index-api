"use client";

/**
 * TMIProfileShell.tsx
 * Universal role-aware profile hub shell for The Musician's Index.
 *
 * Supports roles: artist | performer | fan | sponsor | advertiser | venue | promoter
 * Features: avatar with online indicator, stat grid, tab navigation, feed wall,
 * follow/tip/book CTAs, subscription tier badge, media wall, NFT showcase.
 */

import { useState } from "react";
import Link from "next/link";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type ProfileRole =
  | "artist"
  | "performer"
  | "fan"
  | "sponsor"
  | "advertiser"
  | "venue"
  | "promoter";

export type SubscriptionTier = "Free" | "Silver" | "Gold" | "Platinum" | "Diamond";

export interface ProfileData {
  id: string;
  slug: string;
  displayName: string;
  username: string;
  role: ProfileRole;
  bio: string;
  location: string;
  genre?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  tier: SubscriptionTier;
  isOnline: boolean;
  isVerified: boolean;
  stats: ProfileStats;
  socialLinks?: { platform: string; url: string }[];
  featuredTracks?: FeaturedTrack[];
  recentActivity?: ActivityItem[];
}

interface ProfileStats {
  followers: number;
  following: number;
  streams?: number;
  battles?: number;
  wins?: number;
  xp?: number;
  shows?: number;
  events?: number;
  sponsorships?: number;
  tipReceived?: number;
}

interface FeaturedTrack {
  id: string;
  title: string;
  duration: string;
  plays: number;
  coverColor: string;
}

interface ActivityItem {
  id: string;
  type: "battle" | "cypher" | "challenge" | "track" | "achievement" | "follow" | "tip";
  text: string;
  timestamp: string;
  link?: string;
}

interface ProfileShellProps {
  profile: ProfileData;
  isOwnProfile?: boolean;
  onFollow?: () => void;
  onTip?: () => void;
  onBook?: () => void;
  onMessage?: () => void;
}

/* ─── Tier config ────────────────────────────────────────────────────────── */
const TIER_CONFIG: Record<SubscriptionTier, { color: string; bg: string; icon: string }> = {
  Free:     { color: "#94a3b8", bg: "#1e293b", icon: "○" },
  Silver:   { color: "#cbd5e1", bg: "#1e293b", icon: "◈" },
  Gold:     { color: "#fbbf24", bg: "#292013", icon: "◆" },
  Platinum: { color: "#e2e8f0", bg: "#1a1a2e", icon: "✦" },
  Diamond:  { color: "#38bdf8", bg: "#0c1a2e", icon: "◈" },
};

const ROLE_ACCENT: Record<ProfileRole, string> = {
  artist:     "#06b6d4",
  performer:  "#a855f7",
  fan:        "#f59e0b",
  sponsor:    "#22c55e",
  advertiser: "#f97316",
  venue:      "#ef4444",
  promoter:   "#ec4899",
};

/* ─── Stat display ───────────────────────────────────────────────────────── */
function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-base font-black text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      <span className="text-[9px] text-white/40 uppercase tracking-wider">{label}</span>
    </div>
  );
}

/* ─── Activity feed item ─────────────────────────────────────────────────── */
function ActivityRow({ item }: { item: ActivityItem }) {
  const icons: Record<ActivityItem["type"], string> = {
    battle: "⚔️", cypher: "🎤", challenge: "🏆", track: "🎵",
    achievement: "🎖️", follow: "👤", tip: "💰",
  };
  return (
    <div className="flex items-start gap-2 py-2 border-b border-white/5 last:border-0">
      <span className="text-base flex-shrink-0">{icons[item.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/80 leading-snug">{item.text}</p>
        <p className="text-[9px] text-white/30 mt-0.5">{item.timestamp}</p>
      </div>
      {item.link && (
        <Link href={item.link} className="text-[9px] text-cyan-400 font-bold flex-shrink-0 hover:underline">
          View →
        </Link>
      )}
    </div>
  );
}

/* ─── Featured track row ─────────────────────────────────────────────────── */
function TrackRow({ track, accent }: { track: FeaturedTrack; accent: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <button
        onClick={() => setPlaying((v) => !v)}
        className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center transition-transform active:scale-95"
        style={{ background: track.coverColor + "30" }}
      >
        <span style={{ color: track.coverColor }} className="text-base">
          {playing ? "⏸" : "▶"}
        </span>
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate">{track.title}</p>
        <p className="text-[9px] text-white/30">{track.duration} · {track.plays.toLocaleString()} plays</p>
      </div>
      <button className="text-[9px] text-white/30 hover:text-white transition-colors px-1">•••</button>
    </div>
  );
}

/* ─── Main Shell ─────────────────────────────────────────────────────────── */
export default function TMIProfileShell({
  profile,
  isOwnProfile = false,
  onFollow,
  onTip,
  onBook,
  onMessage,
}: ProfileShellProps) {
  const [activeTab, setActiveTab] = useState<"feed" | "tracks" | "stats" | "nfts">("feed");
  const [following, setFollowing] = useState(false);
  const accent = ROLE_ACCENT[profile.role];
  const tier = TIER_CONFIG[profile.tier];

  const tabs = [
    { id: "feed" as const, label: "Activity" },
    ...(profile.featuredTracks?.length ? [{ id: "tracks" as const, label: "Music" }] : []),
    { id: "stats" as const, label: "Stats" },
    { id: "nfts" as const, label: "NFTs" },
  ];

  return (
    <div className="min-h-screen bg-[#05050c] text-white max-w-md mx-auto md:max-w-2xl">

      {/* ── BANNER ── */}
      <div
        className="relative h-36 w-full overflow-hidden"
        style={{
          background: profile.bannerUrl
            ? `url(${profile.bannerUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${accent}22 0%, #05050c 100%)`,
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#05050c]" />

        {/* Role label */}
        <div
          className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest"
          style={{ background: accent + "22", color: accent, border: `1px solid ${accent}44` }}
        >
          {profile.role}
        </div>

        {/* Back */}
        <Link href="/hub" className="absolute top-3 left-3 text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest">
          ← Hub
        </Link>
      </div>

      {/* ── AVATAR + HEADER ── */}
      <div className="px-4 -mt-10 relative z-10">
        <div className="flex items-end justify-between mb-3">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl border-2 flex items-center justify-center font-black text-2xl"
              style={{
                borderColor: accent,
                background: profile.avatarUrl
                  ? `url(${profile.avatarUrl}) center/cover`
                  : accent + "20",
                color: accent,
              }}
            >
              {!profile.avatarUrl && profile.displayName.charAt(0)}
            </div>
            {/* Online dot */}
            <span
              className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-[#05050c] ${
                profile.isOnline ? "bg-green-500" : "bg-gray-600"
              }`}
            />
          </div>

          {/* CTAs */}
          <div className="flex gap-1.5">
            {!isOwnProfile ? (
              <>
                <button
                  onClick={() => { setFollowing((v) => !v); onFollow?.(); }}
                  className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-wider transition-all ${
                    following
                      ? "bg-white/10 border-white/20 text-white/60"
                      : "text-black border-transparent"
                  }`}
                  style={!following ? { background: accent } : {}}
                >
                  {following ? "Following" : "Follow"}
                </button>
                {onMessage && (
                  <button
                    onClick={onMessage}
                    className="text-[10px] font-black px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 text-white/70 uppercase tracking-wider hover:bg-white/10 transition-colors"
                  >
                    Message
                  </button>
                )}
                {onTip && (
                  <button
                    onClick={onTip}
                    className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-black uppercase tracking-wider transition-colors"
                  >
                    Tip
                  </button>
                )}
                {(profile.role === "venue" || profile.role === "promoter") && onBook && (
                  <button
                    onClick={onBook}
                    className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-black uppercase tracking-wider transition-colors"
                  >
                    Book
                  </button>
                )}
              </>
            ) : (
              <Link
                href="/settings/profile"
                className="text-[10px] font-black px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 text-white/70 uppercase tracking-wider hover:bg-white/10 transition-colors"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* Name + handle + tier */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black">{profile.displayName}</h1>
            {profile.isVerified && (
              <span style={{ color: accent }} className="text-base">✓</span>
            )}
            <div
              className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded"
              style={{ background: tier.bg, color: tier.color }}
            >
              <span>{tier.icon}</span>
              <span>{profile.tier}</span>
            </div>
          </div>
          <p className="text-white/40 text-xs">@{profile.username} · {profile.location}</p>
          {profile.genre && (
            <p className="text-[10px] font-bold mt-0.5" style={{ color: accent }}>{profile.genre}</p>
          )}
          <p className="text-xs text-white/60 mt-2 leading-relaxed">{profile.bio}</p>
        </div>

        {/* Social links */}
        {profile.socialLinks?.length ? (
          <div className="flex gap-2 mb-3 flex-wrap">
            {profile.socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] bg-white/5 border border-white/10 text-white/50 hover:text-white px-2 py-1 rounded uppercase font-bold tracking-wider transition-colors"
              >
                {link.platform}
              </a>
            ))}
          </div>
        ) : null}

        {/* Stats row */}
        <div className="flex justify-around border border-white/10 rounded-xl bg-white/3 py-3 mb-5">
          <StatBox label="Followers" value={profile.stats.followers} />
          <div className="w-px bg-white/10" />
          <StatBox label="Following" value={profile.stats.following} />
          {profile.stats.streams !== undefined && (
            <>
              <div className="w-px bg-white/10" />
              <StatBox label="Streams" value={profile.stats.streams} />
            </>
          )}
          {profile.stats.xp !== undefined && (
            <>
              <div className="w-px bg-white/10" />
              <StatBox label="XP" value={profile.stats.xp} />
            </>
          )}
          {profile.stats.wins !== undefined && (
            <>
              <div className="w-px bg-white/10" />
              <StatBox label="Wins" value={profile.stats.wins} />
            </>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="px-4">
        <div className="flex gap-1 border-b border-white/10 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all -mb-px ${
                activeTab === tab.id
                  ? "border-current"
                  : "border-transparent text-white/40 hover:text-white/60"
              }`}
              style={activeTab === tab.id ? { color: accent, borderColor: accent } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        {activeTab === "feed" && (
          <div>
            {profile.recentActivity?.length ? (
              profile.recentActivity.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))
            ) : (
              <div className="text-center text-white/30 text-sm py-12">
                No activity yet.
              </div>
            )}
          </div>
        )}

        {/* Tracks */}
        {activeTab === "tracks" && (
          <div>
            {profile.featuredTracks?.length ? (
              profile.featuredTracks.map((t) => (
                <TrackRow key={t.id} track={t} accent={accent} />
              ))
            ) : (
              <div className="text-center text-white/30 text-sm py-12">No tracks uploaded yet.</div>
            )}
            {isOwnProfile && (
              <Link
                href="/artist/upload"
                className="mt-4 block w-full text-center py-2.5 border border-dashed border-white/20 rounded-xl text-xs font-black text-white/40 hover:border-white/40 hover:text-white/60 transition-colors uppercase tracking-wider"
              >
                + Upload Track
              </Link>
            )}
          </div>
        )}

        {/* Stats panel */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {Object.entries(profile.stats).map(([key, val]) => (
              <div
                key={key}
                className="border border-white/10 bg-white/3 rounded-xl p-4 flex flex-col gap-1"
              >
                <span className="text-xl font-black text-white">
                  {typeof val === "number" ? val.toLocaleString() : val}
                </span>
                <span className="text-[9px] text-white/40 uppercase tracking-wider">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* NFTs panel */}
        {activeTab === "nfts" && (
          <div className="text-center py-12 space-y-3">
            <p className="text-4xl">🎴</p>
            <p className="text-white/40 text-sm">NFT collection coming soon</p>
            {isOwnProfile && (
              <Link
                href="/artist/nfts/mint"
                className="inline-block text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-wider border border-white/20 text-white/50 hover:border-white/40 transition-colors"
              >
                Mint Your First NFT
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Default demo data export for quick testing ────────────────────────── */
export const DEMO_ARTIST_PROFILE: ProfileData = {
  id: "usr_001",
  slug: "kreach",
  displayName: "Kreach",
  username: "kreach_tmi",
  role: "artist",
  bio: "Hip-hop artist from Atlanta. Diamond tier performer. Battle champion Season 2. Building the future of live music one cypher at a time.",
  location: "Atlanta, GA",
  genre: "Hip-Hop / Trap",
  tier: "Diamond",
  isOnline: true,
  isVerified: true,
  stats: { followers: 12480, following: 340, streams: 88200, battles: 47, wins: 38, xp: 124000 },
  featuredTracks: [
    { id: "t1", title: "Crown Season", duration: "3:22", plays: 42100, coverColor: "#06b6d4" },
    { id: "t2", title: "Mirror Language", duration: "2:58", plays: 28700, coverColor: "#a855f7" },
    { id: "t3", title: "Frequencies", duration: "4:01", plays: 17350, coverColor: "#f59e0b" },
  ],
  recentActivity: [
    { id: "a1", type: "battle", text: "Won battle vs Savage in Room R-101", timestamp: "2h ago", link: "/live/rooms/R-101" },
    { id: "a2", type: "achievement", text: 'Earned "Diamond Streak" badge — 10 wins in a row', timestamp: "1d ago" },
    { id: "a3", type: "track", text: "Uploaded new track: Crown Season", timestamp: "3d ago" },
    { id: "a4", type: "cypher", text: "Performed in Cipher Kings Circle", timestamp: "5d ago", link: "/live/rooms/CY-01" },
  ],
  socialLinks: [
    { platform: "Spotify", url: "https://spotify.com" },
    { platform: "Instagram", url: "https://instagram.com" },
    { platform: "SoundCloud", url: "https://soundcloud.com" },
  ],
};
