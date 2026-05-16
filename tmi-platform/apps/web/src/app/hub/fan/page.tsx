import { PersonaSwitcher } from '@/components/hud/PersonaSwitcher';
import FanHubShell from "@/components/fan/FanHubShell";
import FanRewardsRail from "@/components/fan/FanRewardsRail";
import FanSocialRail from "@/components/fan/FanSocialRail";
import FanWalletRail from "@/components/fan/FanWalletRail";
import { SeasonPassProgress } from "@/components/fan/SeasonPassProgress";
import type { UserSeasonPass, SeasonPassReward } from "@/lib/gamification/SeasonPassEngine";
import Link from "next/link";

const SEED_BADGES = [
  { id: "b1", label: "Season 1 OG",     icon: "🏆", earnedAt: "Jan 2026" },
  { id: "b2", label: "10-Vote Streak",  icon: "🔥", earnedAt: "Feb 2026" },
  { id: "b3", label: "First Tip",       icon: "💎", earnedAt: "Mar 2026" },
  { id: "b4", label: "Cypher Watcher",  icon: "👁️", earnedAt: "Apr 2026" },
];

const SEED_REWARDS = [
  { id: "r1", label: "Backstage Pass",       description: "1hr exclusive post-show meet",  cost: 2000, redeemRoute: "/rewards/backstage-pass",  available: true  },
  { id: "r2", label: "Avatar Upgrade",       description: "Unlock platinum frame + glow",  cost: 800,  redeemRoute: "/rewards/avatar-upgrade",    available: true  },
  { id: "r3", label: "Season 2 Early Access", description: "7-day early ticket window",    cost: 1500, redeemRoute: "/rewards/early-access",      available: false },
];

const SEED_ARTISTS = [
  { slug: "nova-cipher",  displayName: "Nova Cipher",  rank: 1, accentColor: "#06b6d4" },
  { slug: "ari-volt",     displayName: "Ari Volt",     rank: 3, accentColor: "#a78bfa" },
  { slug: "flowstate-j",  displayName: "FlowState.J",  rank: 5, accentColor: "#f59e0b" },
  { slug: "yung-mako",    displayName: "Yung Mako",    rank: 9, accentColor: "#ec4899" },
];

const SEED_VOTED_BATTLES = [
  { id: "bv1", label: "Nova vs FlowState (Cypher)",    artistSlug: "nova-cipher", artistName: "Nova Cipher", outcome: "won"     as const, date: "May 1 2026"  },
  { id: "bv2", label: "Ari Volt vs Mako (Freestyle)",  artistSlug: "ari-volt",    artistName: "Ari Volt",    outcome: "pending" as const, date: "May 10 2026" },
  { id: "bv3", label: "Nova vs Phase Two (Rap)",        artistSlug: "nova-cipher", artistName: "Nova Cipher", outcome: "won"     as const, date: "Apr 28 2026" },
];

const SEED_TRANSACTIONS = [
  { id: "t1", label: "Tip to Nova Cipher",  amount: 5.00,  type: "debit"  as const, date: "May 2 2026"  },
  { id: "t2", label: "Watch & Earn",        amount: 2.50,  type: "credit" as const, date: "May 1 2026"  },
  { id: "t3", label: "Battle Vote Reward",  amount: 1.00,  type: "credit" as const, date: "Apr 30 2026" },
  { id: "t4", label: "Season Pass Bonus",   amount: 10.00, type: "credit" as const, date: "Apr 28 2026" },
];

const SEED_SEASON_PASS: UserSeasonPass = {
  userId: "demo-fan",
  seasonId: "season-2",
  tier: "VIP_PASS",
  xpEarned: 4200,
  xpGoal: 12000,
  claimedRewardIds: ["sp-emote-1"],
  activatedAtMs: Date.now() - 30 * 24 * 60 * 60 * 1000,
  expiresAtMs: Date.now() + 60 * 24 * 60 * 60 * 1000,
};

const CLAIMABLE_REWARDS: SeasonPassReward[] = [
  { id: "sp-avatar-1", title: "Gold VIP Skin", description: "Gold avatar skin for the season", requiredTier: "VIP_PASS", xpThreshold: 1000, type: "avatar_skin", claimable: true },
  { id: "sp-credit-1", title: "$10 TMI Store Credit", description: "Spend anywhere in the TMI store", requiredTier: "FAN_PASS", xpThreshold: 1500, type: "store_credit", claimable: true },
];

const COLLECTIBLES = [
  { id: "c1", title: "Nova Cipher S1 Card",    rarity: "Legendary", route: "/collectibles/nova-cipher-s1-card",   accent: "#f59e0b" },
  { id: "c2", title: "Cypher Arena Mint #003", rarity: "Rare",      route: "/collectibles/cypher-arena-mint-003", accent: "#a78bfa" },
  { id: "c3", title: "FlowState Battle Clip",  rarity: "Common",    route: "/collectibles/flowstate-battle-clip", accent: "#06b6d4" },
];

const MAGAZINE_ARTICLES = [
  { title: "Nova Cipher: The 8-Streak Story",  route: "/magazine/articles/nova-cipher-rise",  thumb: "🎤" },
  { title: "TMI Season 2 Preview",             route: "/magazine/articles/season-2-preview",  thumb: "📰" },
  { title: "Cypher Culture Deep Dive",         route: "/magazine/articles/cypher-culture",    thumb: "🎧" },
  { title: "AI in Live Music — New Era",        route: "/magazine/articles/ai-in-live-music", thumb: "🤖" },
];

const BACKSTAGE_UNLOCKS = [
  { label: "Rehearsal Footage — Nova Cipher",  locked: false, route: "/backstage/nova-cipher-rehearsal" },
  { label: "Meet & Greet Access",              locked: false, route: "/backstage/meet-greet"            },
  { label: "Producer Session Replay",          locked: true,  route: "/backstage/producer-session"      },
  { label: "Season 2 First Look",              locked: true,  route: "/backstage/season-2-first-look"   },
];

const UPCOMING_SHOWS = [
  { label: "Nova Cipher LIVE",       time: "Tonight · 9:00 PM ET", route: "/shows/nova-cipher-live",  accent: "#06b6d4" },
  { label: "Cypher Arena Open",      time: "May 12 · 7:00 PM ET",  route: "/shows/cypher-arena-open", accent: "#a78bfa" },
  { label: "Season 2 Finals",        time: "May 20 · 8:00 PM ET",  route: "/shows/season-2-finals",   accent: "#f59e0b" },
];

const CYPHER_WATCHLIST = [
  { title: "Open Cypher — Fri Night",     status: "live",   viewers: 1240, route: "/cypher/open-fri-night"   },
  { title: "TMI Season 2 Qualifier",      status: "soon",   viewers: 870,  route: "/cypher/s2-qualifier"     },
  { title: "Freestyle Underground Vol 7", status: "replay", viewers: 6100, route: "/cypher/underground-vol7" },
];

const QUESTS = [
  { label: "Watch 3 Lives this week",   progress: 2, max: 3, reward: "250 pts",      accent: "#06b6d4" },
  { label: "Vote in 5 battles",         progress: 3, max: 5, reward: "500 pts",      accent: "#a78bfa" },
  { label: "Send a tip to a performer", progress: 1, max: 1, reward: "Badge",        accent: "#22c55e" },
  { label: "Invite a friend to TMI",    progress: 0, max: 1, reward: "Backstage Access", accent: "#f59e0b" },
];

export default function FanHubPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#07071a", color: "#e2e8f0", minHeight: "100vh" }}>

      {/* Persona switcher bar */}
      <div style={{ background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,45,170,0.12)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#FF2DAA', textTransform: 'uppercase' }}>Fan Hub</span>
        <PersonaSwitcher currentRole="fan" compact />
      </div>

      {/* Primary Hub Shell — live stage, avatar, reactions, tip, playlist, HUD */}
      <FanHubShell
        fanSlug="demo-fan"
        displayName="Fan"
        tier="gold-platinum"
        tagline="Gold tier member · 3 seasons · TMI OG"
        startingPoints={4200}
      />

      {/* Extended Hub Sections */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px 48px" }}>

        {/* Show Countdowns */}
        <section style={{ marginBottom: 32, marginTop: 32 }}>
          <SectionLabel>Upcoming Shows</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {UPCOMING_SHOWS.map(show => (
              <Link key={show.label} href={show.route} style={{ textDecoration: "none" }}>
                <div style={{ background: "#0f0f1a", border: `1px solid ${show.accent}44`, borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: show.accent }}>{show.label}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{show.time}</div>
                  <div style={{ fontSize: 11, color: show.accent, marginTop: 8, fontWeight: 600 }}>Set Reminder →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Season Pass Progress */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Season Pass</SectionLabel>
          <SeasonPassProgress pass={SEED_SEASON_PASS} claimableRewards={CLAIMABLE_REWARDS} />
        </section>

        {/* Collectible Showcase */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Collectibles</SectionLabel>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {COLLECTIBLES.map(c => (
              <Link key={c.id} href={c.route} style={{ textDecoration: "none", flexShrink: 0 }}>
                <div style={{ width: 160, background: "#0f0f1a", border: `1px solid ${c.accent}55`, borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎴</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{c.title}</div>
                  <div style={{ fontSize: 10, color: c.accent, marginTop: 4, fontWeight: 600 }}>{c.rarity}</div>
                </div>
              </Link>
            ))}
            <Link href="/collectibles" style={{ textDecoration: "none", flexShrink: 0 }}>
              <div style={{ width: 140, background: "#0f0f1a", border: "1px solid #1e1e3a", borderRadius: 12, padding: "16px 14px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 120 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>+</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>View All</div>
              </div>
            </Link>
          </div>
        </section>

        {/* Active Quests */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Active Quests</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {QUESTS.map(quest => (
              <div key={quest.label} style={{ background: "#0f0f1a", border: `1px solid ${quest.accent}33`, borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>{quest.label}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#64748b" }}>{quest.progress}/{quest.max}</span>
                  <span style={{ fontSize: 11, color: quest.accent, fontWeight: 700 }}>{quest.reward}</span>
                </div>
                <div style={{ background: "#1a1a2e", borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, (quest.progress / quest.max) * 100)}%`, height: "100%", background: quest.accent }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cypher Watchlist */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Cypher Watchlist</SectionLabel>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {CYPHER_WATCHLIST.map(cypher => (
              <Link key={cypher.title} href={cypher.route} style={{ textDecoration: "none", flexShrink: 0 }}>
                <div style={{ width: 220, background: "#0f0f1a", border: cypher.status === "live" ? "1px solid #ef444466" : "1px solid #1e1e3a", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 9, color: cypher.status === "live" ? "#ef4444" : cypher.status === "soon" ? "#f59e0b" : "#64748b", fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>
                    {cypher.status.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{cypher.title}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{cypher.viewers.toLocaleString()} viewers</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Performer Favorites + Vote History */}
        <FanSocialRail followedArtists={SEED_ARTISTS} votedBattles={SEED_VOTED_BATTLES} fanSlug="demo-fan" />

        {/* Magazine Wall */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Magazine Wall</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {MAGAZINE_ARTICLES.map(article => (
              <Link key={article.title} href={article.route} style={{ textDecoration: "none" }}>
                <div style={{ background: "#0f0f1a", border: "1px solid #1e1e3a", borderRadius: 12, padding: "16px" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{article.thumb}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.4 }}>{article.title}</div>
                  <div style={{ fontSize: 11, color: "#06b6d4", marginTop: 8 }}>Read →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Backstage Unlocks */}
        <section style={{ marginBottom: 32 }}>
          <SectionLabel>Backstage Unlocks</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BACKSTAGE_UNLOCKS.map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f0f1a", border: `1px solid ${item.locked ? "#1e1e3a" : "#06b6d444"}`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{item.locked ? "🔒" : "🎬"}</span>
                  <span style={{ fontSize: 13, color: item.locked ? "#475569" : "#e2e8f0" }}>{item.label}</span>
                </div>
                {!item.locked ? (
                  <Link href={item.route} style={{ fontSize: 12, color: "#06b6d4", textDecoration: "none", fontWeight: 600 }}>Watch →</Link>
                ) : (
                  <span style={{ fontSize: 11, color: "#64748b" }}>Gold+ required</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Loyalty Rewards */}
        <FanRewardsRail badges={SEED_BADGES} rewards={SEED_REWARDS} currentStreak={7} totalVotesCast={34} fanSlug="demo-fan" />

        {/* Wallet */}
        <FanWalletRail tipBalance={42.50} voteCredits={18} transactions={SEED_TRANSACTIONS} fanSlug="demo-fan" />

      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
      {children}
    </div>
  );
}
