import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity Feed | TMI",
  description: "Your TMI activity feed — new beats, live rooms, contest updates, and artist activity.",
};

const FEED_ITEMS = [
  { type: "ROOM_LIVE",   icon: "🔴", actor: "Neon Vibe",     text: "just went live in The Neon Church",           sub: "4,200 watching",        color: "#00FFFF", href: "/lobbies/neon-church",     time: "now"     },
  { type: "TIP",         icon: "💸", actor: "@fan2",          text: "tipped you 500 credits",                      sub: "= $5.00 to your wallet", color: "#00FF88", href: "/wallet",                time: "2m ago"  },
  { type: "CONTEST",     icon: "🏆", actor: "Grand Contest",  text: "Ep.12 is live — submit your entry now!",      sub: "Ends in 4 hours",        color: "#FFD700", href: "/contests",              time: "4h ago"  },
  { type: "BEAT_DROP",   icon: "🎵", actor: "Krypt",          text: "dropped a new beat: 'Cipher Code'",           sub: "Boom Bap · 88 BPM",      color: "#AA2DFF", href: "/beats/cipher-code",     time: "5h ago"  },
  { type: "ACHIEVEMENT", icon: "⭐", actor: "You",            text: "unlocked the 7-Day Streak achievement!",       sub: "+250 XP",                color: "#FFD700", href: "/achievements",          time: "1d ago"  },
  { type: "FOLLOW",      icon: "👥", actor: "@neonlistener",  text: "followed you",                                sub: "You now have 12,400 fans",color: "#FF2DAA", href: "/profile",               time: "1d ago"  },
  { type: "MAGAZINE",    icon: "📰", actor: "TMI Editorial",  text: "published Issue 1 — April 2026",              sub: "10 articles inside",     color: "#FF2DAA", href: "/magazine",              time: "2d ago"  },
  { type: "BEAT_SALE",   icon: "💵", actor: "Beat sale",      text: "'Electric Sky' was licensed — Basic",         sub: "+$29.99 to your wallet", color: "#00FF88", href: "/wallet",                time: "2d ago"  },
  { type: "FAN_CLUB",    icon: "🎉", actor: "Your fan club",  text: "hit 4,200 members",                           sub: "Milestone reached",      color: "#FF2DAA", href: "/fan-club",              time: "3d ago"  },
  { type: "GIVEAWAY",    icon: "🎁", actor: "Monday Stage",   text: "giveaway is open — 3 Season Passes up for grabs", sub: "Enter before Apr 21", color: "#AA2DFF", href: "/giveaway/monday-stage-apr21", time: "3d ago" },
];

const TYPE_BG: Record<string, string> = {
  ROOM_LIVE: "#FF5555", TIP: "#00FF88", CONTEST: "#FFD700", BEAT_DROP: "#AA2DFF",
  ACHIEVEMENT: "#FFD700", FOLLOW: "#FF2DAA", MAGAZINE: "#FF2DAA", BEAT_SALE: "#00FF88",
  FAN_CLUB: "#FF2DAA", GIVEAWAY: "#AA2DFF",
};

export default function FeedPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "40px 24px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 8 }}>YOUR FEED</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Activity</h1>
      </section>

      <section style={{ maxWidth: 680, margin: "0 auto", padding: "24px 24px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FEED_ITEMS.map((item, i) => (
            <Link key={i} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "rgba(255,255,255,0.02)", border: `1px solid ${item.color}15`, borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ width: 36, height: 36, background: `${TYPE_BG[item.type] || item.color}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
                    <span style={{ fontWeight: 700, color: item.color }}>{item.actor}</span>
                    {" "}{item.text}
                  </div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{item.sub}</div>
                </div>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>{item.time}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ textAlign: "center", marginTop: 32 }}>
        <Link href="/explore" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>Explore more →</Link>
      </section>
    </main>
  );
}
