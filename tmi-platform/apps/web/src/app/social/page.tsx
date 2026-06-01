"use client";

import { useState } from "react";
import Link from "next/link";

const FEED = [
  { id: "p1", user: "Wavetek",     avatar: "🎤", badge: "PERFORMER", color: "#FF2DAA", time: "2m ago",  text: "Just dropped a new beat pack — 12 exclusive tracks, stems included. Auction live now! 🎛️ #NewDrop #TMI",              likes: 214, comments: 38, reposts: 17, media: "🖼️" },
  { id: "p2", user: "Nova Cipher", avatar: "👑", badge: "CROWN",     color: "#FFD700", time: "8m ago",  text: "Monday Cypher was FIRE tonight. @BarGod went crazy on that last round. Come through next week 💥 #Cypher #Live",    likes: 532, comments: 91, reposts: 44, media: null },
  { id: "p3", user: "FanGirl_M",   avatar: "🎧", badge: "FAN",       color: "#00FFFF", time: "14m ago", text: "The World Concert was everything 🌐 Bought my VIP ticket from auction and it was SO worth it. Front row! 🙌",        likes: 88,  comments: 12, reposts: 5,  media: "📷" },
  { id: "p4", user: "Krypt",       avatar: "🔥", badge: "ARTIST",    color: "#AA2DFF", time: "22m ago", text: "New NFT drop coming midnight. 1-of-1 signed piece. Bidding opens in the Auction House. Set your alarm 🖼️👀",        likes: 377, comments: 54, reposts: 28, media: "🖼️" },
  { id: "p5", user: "Bar God",     avatar: "⚔️", badge: "PERFORMER", color: "#FF6B35", time: "35m ago", text: "Who wants the smoke at the next Battle? DM me. I'm ranked #2 right now and I'm coming for that Crown 👑⚔️",         likes: 649, comments: 127, reposts: 82, media: null },
  { id: "p6", user: "TMI Events",  avatar: "🏟️", badge: "VENUE",     color: "#00FF88", time: "1h ago",  text: "Venue availability for June is filling fast. Book your date in the Venue Hub now before it's gone. #VenueLife 🎪",   likes: 103, comments: 22, reposts: 9,  media: null },
];

const TABS = ["FOR YOU", "FOLLOWING", "BATTLES", "LIVE NOW"] as const;
type Tab = typeof TABS[number];

const BADGE_COLOR: Record<string, string> = {
  PERFORMER: "#FF2DAA",
  CROWN:     "#FFD700",
  FAN:       "#00FFFF",
  ARTIST:    "#AA2DFF",
  VENUE:     "#00FF88",
};

export default function SocialPage() {
  const [tab, setTab] = useState<Tab>("FOR YOU");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [newPost, setNewPost] = useState("");

  function toggleLike(id: string) {
    setLikedPosts(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ position: "sticky", top: 0, background: "rgba(5,5,16,0.94)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "10px 20px", display: "flex", gap: 16, alignItems: "center", backdropFilter: "blur(14px)", zIndex: 50 }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#00FFFF", textDecoration: "none", letterSpacing: "0.14em" }}>TMI</Link>
        <span style={{ fontSize: 11, fontWeight: 700 }}>SOCIAL</span>
        <Link href="/messages" style={{ marginLeft: "auto", fontSize: 11, color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>💬 Messages</Link>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px" }}>

        {/* Compose */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px", marginBottom: 18 }}>
          <textarea
            placeholder="What's happening in the arena? #TMI"
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            rows={3}
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, resize: "none", fontFamily: "'Inter', sans-serif" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <div style={{ display: "flex", gap: 12 }}>
              {["📷", "🎵", "📡", "🏷️"].map(icon => (
                <button key={icon} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "rgba(255,255,255,0.4)" }}>{icon}</button>
              ))}
            </div>
            <button
              disabled={!newPost.trim()}
              style={{ padding: "8px 20px", borderRadius: 20, border: "none", background: newPost.trim() ? "#00FFFF" : "rgba(255,255,255,0.1)", color: newPost.trim() ? "#000" : "rgba(255,255,255,0.3)", fontWeight: 900, fontSize: 11, cursor: newPost.trim() ? "pointer" : "not-allowed", letterSpacing: "0.08em" }}
            >
              POST
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "9px 0", background: "none", border: "none", cursor: "pointer", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: tab === t ? "#00FFFF" : "rgba(255,255,255,0.35)", borderBottom: tab === t ? "2px solid #00FFFF" : "2px solid transparent", transition: "color 0.15s" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FEED.map(post => (
            <div key={post.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px" }}>
              {/* Header */}
              <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${post.color}22`, border: `1.5px solid ${post.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{post.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Link href={`/performer/${post.user.toLowerCase().replace(" ", "-")}`} style={{ fontWeight: 800, fontSize: 13, color: "#fff", textDecoration: "none" }}>{post.user}</Link>
                    <span style={{ fontSize: 7, fontWeight: 900, color: BADGE_COLOR[post.badge] ?? "#fff", background: `${BADGE_COLOR[post.badge] ?? "#fff"}18`, padding: "2px 7px", borderRadius: 10, letterSpacing: "0.1em" }}>{post.badge}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{post.time}</div>
                </div>
              </div>

              {/* Content */}
              <p style={{ margin: "0 0 12px", fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.85)" }}>{post.text}</p>
              {post.media && (
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, height: 140, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, marginBottom: 12 }}>{post.media}</div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 20 }}>
                <button onClick={() => toggleLike(post.id)} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: likedPosts.has(post.id) ? "#FF2DAA" : "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 700 }}>
                  ❤️ {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                </button>
                <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 12 }}>💬 {post.comments}</button>
                <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 12 }}>🔁 {post.reposts}</button>
                <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 12, marginLeft: "auto" }}>⤴️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
