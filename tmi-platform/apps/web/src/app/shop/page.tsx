import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TMI Shop | TMI",
  description: "The official TMI shop. Emotes, clothing, props, avatars, and exclusive collectibles.",
};

const CATEGORIES = [
  { label: "Emotes",       icon: "😄", href: "/emotes",       count: 64,  color: "#FF2DAA", desc: "React in rooms with style"          },
  { label: "Clothing",     icon: "👕", href: "/clothing",     count: 120, color: "#00FFFF", desc: "Outfit your avatar"                 },
  { label: "Props",        icon: "🎸", href: "/props",        count: 48,  color: "#FFD700", desc: "Stage props and accessories"        },
  { label: "Backgrounds",  icon: "🌄", href: "/avatar/shop",  count: 32,  color: "#AA2DFF", desc: "Profile & room backgrounds"         },
  { label: "Skins",        icon: "🎨", href: "/avatar/shop",  count: 18,  color: "#00FF88", desc: "Special avatar skins"               },
  { label: "Collectibles", icon: "💎", href: "/nft-lab",      count: 24,  color: "#FF9500", desc: "Limited-edition digital items"      },
];

const FEATURED = [
  { name: "Neon Vibe Bundle",    type: "Bundle",  price: "$14.99",  priceId: "price_shop_neon_bundle",  color: "#00FFFF", icon: "🎧", hot: true  },
  { name: "Cypher King Emote",   type: "Emote",   price: "$1.99",   priceId: "price_shop_cypher_emote", color: "#FF2DAA", icon: "🎤", hot: true  },
  { name: "Gold Mic Prop",       type: "Prop",    price: "$2.99",   priceId: "price_shop_gold_mic",     color: "#FFD700", icon: "🎙️", hot: false },
  { name: "Afro Culture Skin",   type: "Skin",    price: "$7.99",   priceId: "price_shop_afro_skin",    color: "#00FF88", icon: "🌍", hot: true  },
  { name: "Wavetek Drip Set",    type: "Clothing",price: "$9.99",   priceId: "price_shop_wavetek_drip", color: "#FF2DAA", icon: "👟", hot: false },
  { name: "TMI Stage Background",type: "BG",      price: "$3.99",   priceId: "price_shop_stage_bg",     color: "#AA2DFF", icon: "🌠", hot: false },
];

export default function ShopPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "56px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 10 }}>TMI SHOP</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 12 }}>The Shop</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 440, margin: "0 auto" }}>
          Emotes, outfits, props, skins, and exclusive drops. Show the world who you are.
        </p>
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
          {FEATURED.map(item => (
            <div key={item.name} style={{ position: "relative", background: "rgba(255,255,255,0.02)", border: `1px solid ${item.color}20`, borderRadius: 12, padding: "18px 16px" }}>
              {item.hot && (
                <div style={{ position: "absolute", top: -9, right: 12, background: "#FF2DAA", color: "#050510", fontSize: 6, fontWeight: 900, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 10 }}>HOT</div>
              )}
              <div style={{ width: 48, height: 48, background: `${item.color}15`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontSize: 7, fontWeight: 700, color: item.color, letterSpacing: "0.08em", marginBottom: 4 }}>{item.type.toUpperCase()}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{item.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: item.color }}>{item.price}</span>
                <Link href={`/api/stripe/checkout?priceId=${item.priceId}&mode=payment`} style={{ fontSize: 8, fontWeight: 800, color: "#050510", background: item.color, borderRadius: 5, padding: "6px 12px", textDecoration: "none" }}>BUY</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: "center", marginTop: 40 }}>
        <Link href="/credits" style={{ display: "inline-block", padding: "11px 26px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#FF2DAA", borderRadius: 7, textDecoration: "none" }}>
          BUY CREDITS TO SPEND IN SHOP →
        </Link>
      </section>
    </main>
  );
}
