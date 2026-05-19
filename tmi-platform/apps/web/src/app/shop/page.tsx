'use client';
import { useState } from "react";
import Link from "next/link";
import { useGamificationEngine } from "@/hooks/useGamificationEngine";

const CATEGORIES = [
  { label: "Emotes",       icon: "😄", href: "/emotes",       count: 64,  color: "#FF2DAA", desc: "React in rooms with style"          },
  { label: "Clothing",     icon: "👕", href: "/clothing",     count: 120, color: "#00FFFF", desc: "Outfit your avatar"                 },
  { label: "Props",        icon: "🎸", href: "/props",        count: 48,  color: "#FFD700", desc: "Stage props and accessories"        },
  { label: "Backgrounds",  icon: "🌄", href: "/avatar/shop",  count: 32,  color: "#AA2DFF", desc: "Profile & room backgrounds"         },
  { label: "Skins",        icon: "🎨", href: "/avatar/shop",  count: 18,  color: "#00FF88", desc: "Special avatar skins"               },
  { label: "Collectibles", icon: "💎", href: "/nft-lab",      count: 24,  color: "#FF9500", desc: "Limited-edition digital items"      },
];

const FEATURED = [
  { name: "Neon Vibe Bundle",     type: "Bundle",   credits: 1499, color: "#00FFFF", icon: "🎧", hot: true  },
  { name: "Cypher King Emote",    type: "Emote",    credits: 199,  color: "#FF2DAA", icon: "🎤", hot: true  },
  { name: "Gold Mic Prop",        type: "Prop",     credits: 299,  color: "#FFD700", icon: "🎙️", hot: false },
  { name: "Afro Culture Skin",    type: "Skin",     credits: 799,  color: "#00FF88", icon: "🌍", hot: true  },
  { name: "Wavetek Drip Set",     type: "Clothing", credits: 999,  color: "#FF2DAA", icon: "👟", hot: false },
  { name: "TMI Stage Background", type: "BG",       credits: 399,  color: "#AA2DFF", icon: "🌠", hot: false },
];

interface ShortfallNotice { type: 'shortfall'; item: string; short: number }
interface SuccessNotice  { type: 'success';   item: string }
type ShopNotice = ShortfallNotice | SuccessNotice | null;

export default function ShopPage() {
  const { walletCredits, spendCredits, trackAction } = useGamificationEngine();
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<ShopNotice>(null);

  function handleBuy(name: string, credits: number) {
    if (owned.has(name)) return;
    if (walletCredits < credits) {
      setNotice({ type: 'shortfall', item: name, short: credits - walletCredits });
      setTimeout(() => setNotice(null), 5000);
      return;
    }
    spendCredits(credits);
    trackAction('READ_ARTICLE');
    setOwned(prev => new Set([...prev, name]));
    setNotice({ type: 'success', item: name });
    setTimeout(() => setNotice(null), 3000);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      {notice?.type === 'shortfall' && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#0a0a1a", border: "1px solid #FF2DAA55", borderRadius: 12, padding: "14px 20px", display: "flex", flexDirection: "column", gap: 8, alignItems: "center", minWidth: 280 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>
            ⚡ You&apos;re <span style={{ color: "#FF2DAA" }}>{notice.short} credits short</span> for {notice.item}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/articles" style={{ padding: "5px 12px", background: "#FF2DAA22", border: "1px solid #FF2DAA44", borderRadius: 6, color: "#FF2DAA", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textDecoration: "none" }}>READ ARTICLE +XP</Link>
            <Link href="/live-stage" style={{ padding: "5px 12px", background: "#00FF8822", border: "1px solid #00FF8844", borderRadius: 6, color: "#00FF88", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textDecoration: "none" }}>JOIN STAGE +10cr</Link>
          </div>
        </div>
      )}
      {notice?.type === 'success' && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#0a0a1a", border: "1px solid #00FF8844", borderRadius: 10, padding: "12px 24px", fontSize: 11, color: "#00FF88", fontWeight: 700, whiteSpace: "nowrap" }}>
          ✓ {notice.item} added to your inventory
        </div>
      )}

      <section style={{ textAlign: "center", padding: "56px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 10 }}>TMI SHOP</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 12 }}>The Shop</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 440, margin: "0 auto" }}>
          Emotes, outfits, props, skins, and exclusive drops. Show the world who you are.
        </p>
        <div style={{ display: "inline-flex", gap: 16, marginTop: 16, padding: "10px 20px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 30 }}>
          <span style={{ fontSize: 11, color: "#00FF88", fontWeight: 800 }}>{walletCredits.toLocaleString()} TM Credits</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>·</span>
          <Link href="/season-pass" style={{ fontSize: 10, color: "#FFD700", textDecoration: "none" }}>Earn more →</Link>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 0", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10 }}>
        {CATEGORIES.map(c => (
          <Link key={c.label} href={c.href} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${c.color}20`, borderRadius: 12, padding: "18px 14px", textAlign: "center" }}>
              <span style={{ fontSize: 28 }}>{c.icon}</span>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginTop: 10 }}>{c.label}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{c.count} items</div>
              <div style={{ fontSize: 8, color: c.color, marginTop: 3 }}>{c.desc}</div>
            </div>
          </Link>
        ))}
      </section>

      <section style={{ maxWidth: 900, margin: "36px auto 0", padding: "0 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 18 }}>FEATURED ITEMS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
          {FEATURED.map(item => {
            const isOwned = owned.has(item.name);
            const canAfford = walletCredits >= item.credits;
            return (
              <div key={item.name} style={{ position: "relative", background: "rgba(255,255,255,0.02)", border: `1px solid ${isOwned ? item.color + "55" : item.color + "20"}`, borderRadius: 12, padding: "18px 16px" }}>
                {item.hot && !isOwned && (
                  <div style={{ position: "absolute", top: -9, right: 12, background: "#FF2DAA", color: "#050510", fontSize: 6, fontWeight: 900, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 10 }}>HOT</div>
                )}
                {isOwned && (
                  <div style={{ position: "absolute", top: -9, right: 12, background: "#00FF88", color: "#050510", fontSize: 6, fontWeight: 900, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 10 }}>OWNED</div>
                )}
                <div style={{ width: 48, height: 48, background: `${item.color}15`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: 7, fontWeight: 700, color: item.color, letterSpacing: "0.08em", marginBottom: 4 }}>{item.type.toUpperCase()}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{item.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: item.color }}>{item.credits.toLocaleString()} cr</span>
                  <button
                    onClick={() => handleBuy(item.name, item.credits)}
                    disabled={isOwned}
                    style={{
                      fontSize: 8, fontWeight: 800,
                      color: isOwned ? "#444" : "#050510",
                      background: isOwned ? "#1a1a2e" : canAfford ? item.color : "rgba(255,255,255,0.1)",
                      borderRadius: 5, padding: "6px 12px", border: "none", cursor: isOwned ? "default" : "pointer",
                    }}
                  >
                    {isOwned ? "✓ OWNED" : canAfford ? "BUY" : "EARN MORE"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ textAlign: "center", marginTop: 40 }}>
        <Link href="/season-pass" style={{ display: "inline-block", padding: "11px 26px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#FF2DAA", borderRadius: 7, textDecoration: "none" }}>
          EARN MORE CREDITS VIA SEASON PASS →
        </Link>
      </section>
    </main>
  );
}
