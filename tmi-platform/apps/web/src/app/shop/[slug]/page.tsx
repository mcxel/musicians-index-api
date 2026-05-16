import { notFound } from "next/navigation";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

const PRODUCTS: Record<string, {
  name: string; type: string; price: number; icon: string;
  color: string; desc: string; creator: string; tags: string[];
}> = {
  "flame-emote-pack": { name: "Flame Emote Pack", type: "EMOTE", price: 4.99, icon: "🔥", color: "#FF2DAA", desc: "6 fire-themed reaction emotes for live rooms. Animate your presence in battles, cyphers, and concerts.", creator: "TMI Design", tags: ["emote", "animated", "fire"] },
  "neon-bass-avatar-skin": { name: "Neon Bass Avatar Skin", type: "SKIN", price: 9.99, icon: "🎸", color: "#00FFFF", desc: "A sleek neon-bass skin for your TMI avatar. Glows in room lighting with reactive pulse animation.", creator: "PixelForge Studio", tags: ["avatar", "skin", "neon"] },
  "gold-mic-prop": { name: "Gold Mic Stage Prop", type: "PROP", price: 6.99, icon: "🎤", color: "#FFD700", desc: "A gold microphone prop for your avatar stage presence. Works in all room types.", creator: "TMI Design", tags: ["prop", "stage", "gold"] },
  "galaxy-background": { name: "Galaxy Room Background", type: "BACKGROUND", price: 3.99, icon: "🌌", color: "#AA2DFF", desc: "Deep-space galaxy background for your profile and room presence. Dynamic star-field animation.", creator: "CosmicArts", tags: ["background", "space", "animated"] },
  "crown-collectible": { name: "Crown Season Collectible", type: "COLLECTIBLE", price: 29.99, icon: "👑", color: "#FFD700", desc: "Limited-edition Crown Season collectible from TMI Issue 1. Only 500 ever minted.", creator: "TMI Limited", tags: ["collectible", "limited", "season-1"] },
};

export async function generateStaticParams() {
  return Object.keys(PRODUCTS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = PRODUCTS[slug];
  if (!product) return { title: "Product Not Found | TMI Shop" };
  return { title: `${product.name} | TMI Shop`, description: product.desc };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = PRODUCTS[slug];
  if (!product) return notFound();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 24px 0" }}>
        <Link href="/shop" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← SHOP
        </Link>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 40, alignItems: "start" }}>
        {/* Product display */}
        <div>
          <div style={{ background: `linear-gradient(145deg,${product.color}10,transparent)`, border: `1px solid ${product.color}20`, borderRadius: 20, padding: "60px 40px", textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 80 }}>{product.icon}</div>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>{product.name}</h1>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: product.color, marginBottom: 16 }}>{product.type}</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 20 }}>{product.desc}</p>

          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
            By <strong style={{ color: "rgba(255,255,255,0.5)" }}>{product.creator}</strong>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {product.tags.map(tag => (
              <span key={tag} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "3px 8px" }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Purchase panel */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, position: "sticky", top: 80 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>PRICE</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: product.color, marginBottom: 24 }}>
            ${product.price.toFixed(2)}
          </div>

          <Link href="/cart" style={{ display: "block", textAlign: "center", padding: "13px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: `linear-gradient(135deg,${product.color},${product.color}99)`, borderRadius: 10, textDecoration: "none", marginBottom: 10 }}>
            ADD TO CART
          </Link>
          <Link href="/checkout" style={{ display: "block", textAlign: "center", padding: "13px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: product.color, border: `1px solid ${product.color}40`, borderRadius: 10, textDecoration: "none" }}>
            BUY NOW
          </Link>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: "🔒", text: "Secured by Stripe" },
              { icon: "⚡", text: "Instant delivery to your account" },
              { icon: "♾️", text: "Permanent — never expires" },
            ].map(item => (
              <div key={item.text} style={{ display: "flex", gap: 8, fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                <span>{item.icon}</span><span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
