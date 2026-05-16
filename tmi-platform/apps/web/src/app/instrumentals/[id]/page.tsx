import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

const SEED: Record<string, { title: string; producer: string; genre: string; bpm: number; key: string; price: number; exclusivePrice: number; stems: boolean; battleReady: boolean; cypherReady: boolean; color: string; desc: string }> = {
  i1: { title: "The Code", producer: "FlowMaster", genre: "Hip-Hop", bpm: 93, key: "Dm", price: 49, exclusivePrice: 499, stems: true, battleReady: true, cypherReady: true, color: "#FF2DAA", desc: "Raw boom-bap with heavy 808s and crisp hi-hats. Built for battle rap." },
  i2: { title: "Solar Flare", producer: "Cold Spark", genre: "EDM", bpm: 132, key: "Am", price: 65, exclusivePrice: 799, stems: true, battleReady: false, cypherReady: false, color: "#00FFFF", desc: "Euphoric EDM progressive house. Full stems and arrangement included." },
  i3: { title: "Raw Steel", producer: "Bar God", genre: "Battle Rap", bpm: 88, key: "Bm", price: 39, exclusivePrice: 349, stems: false, battleReady: true, cypherReady: true, color: "#FFD700", desc: "Gritty battle beat. Classic head-nod tempo with hard-hitting kicks." },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const inst = SEED[id];
  if (!inst) return { title: "Not Found | TMI" };
  return { title: `${inst.title} — Instrumental | TMI`, description: inst.desc };
}

export default async function InstrumentalDetailPage({ params }: Props) {
  const { id } = await params;
  const inst = SEED[id];
  if (!inst) return notFound();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 24px 0" }}>
        <Link href="/instrumentals" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← INSTRUMENTALS
        </Link>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
          {/* Left: preview + info */}
          <div>
            <div style={{ background: `${inst.color}08`, border: `1px solid ${inst.color}20`, borderRadius: 16, padding: "48px 32px", textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎼</div>
              <div style={{ fontSize: 9, fontWeight: 800, color: inst.color, letterSpacing: "0.15em" }}>WATERMARKED PREVIEW</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <span style={{ fontSize: 9, color: inst.color, border: `1px solid ${inst.color}40`, borderRadius: 4, padding: "3px 8px" }}>{inst.genre}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "3px 8px" }}>{inst.bpm} BPM</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "3px 8px" }}>{inst.key}</span>
              {inst.stems && <span style={{ fontSize: 9, color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 4, padding: "3px 8px" }}>STEMS INCLUDED</span>}
              {inst.battleReady && <span style={{ fontSize: 9, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 4, padding: "3px 8px" }}>BATTLE READY</span>}
              {inst.cypherReady && <span style={{ fontSize: 9, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 4, padding: "3px 8px" }}>CYPHER READY</span>}
            </div>
          </div>

          {/* Right: purchase */}
          <div>
            <h1 style={{ fontSize: "clamp(1.4rem,3.5vw,2.2rem)", fontWeight: 900, marginBottom: 6 }}>{inst.title}</h1>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>by {inst.producer}</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 28 }}>{inst.desc}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Link href={`/checkout?item=${id}&price=${inst.price}&type=instrumental-lease`} style={{ display: "block", padding: "14px 0", textAlign: "center", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: inst.color, borderRadius: 10, textDecoration: "none" }}>
                LEASE — ${inst.price}
              </Link>
              <Link href={`/checkout?item=${id}&price=${inst.exclusivePrice}&type=instrumental-exclusive`} style={{ display: "block", padding: "14px 0", textAlign: "center", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: inst.color, border: `1px solid ${inst.color}60`, borderRadius: 10, textDecoration: "none" }}>
                EXCLUSIVE — ${inst.exclusivePrice}
              </Link>
              <Link href={`/auctions?type=instrumental&id=${id}`} style={{ display: "block", padding: "12px 0", textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, textDecoration: "none" }}>
                VIEW IN AUCTIONS
              </Link>
            </div>

            <div style={{ marginTop: 24, padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.7 }}>
              <div>✓ Instant vault unlock after payment</div>
              <div>✓ License PDF generated on purchase</div>
              <div>✓ Download link valid 24h · 3 download limit</div>
              <div>✓ Producer retains publishing rights on lease</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
