"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BG = "#050510";
const ACCENT = "#AA2DFF";

const GENRES = ["All", "Hip-Hop", "Trap", "R&B", "Drill", "Afrobeats", "Lo-fi", "Pop", "Neo-Soul", "Dancehall"];

interface Beat {
  id: string; title: string; producer: string; genre: string;
  bpm: number; price: number; plays: number; key: string;
  tags: string[]; featured: boolean; priceId: string;
}

const BEATS: Beat[] = [
  { id: "b01", title: "Crown Protocol",     producer: "Krypt",       genre: "Hip-Hop",  bpm: 92,  price: 29.99, plays: 8420, key: "F# Min",  tags: ["dark","cinematic"],  featured: true,  priceId: "price_beat_crown_protocol"     },
  { id: "b02", title: "Midnight Surge",     producer: "Wavetek",     genre: "Trap",     bpm: 140, price: 24.99, plays: 5810, key: "G Min",   tags: ["hard","808s"],       featured: true,  priceId: "price_beat_midnight_surge"     },
  { id: "b03", title: "Velvet Frequency",   producer: "Nova Cipher", genre: "R&B",      bpm: 76,  price: 19.99, plays: 3290, key: "Bb Maj",  tags: ["smooth","melodic"],  featured: false, priceId: "price_beat_velvet_frequency"   },
  { id: "b04", title: "Lagos Avenue",       producer: "DJ Lumi",     genre: "Afrobeats",bpm: 104, price: 22.99, plays: 6740, key: "C Maj",   tags: ["afro","bounce"],     featured: true,  priceId: "price_beat_lagos_avenue"       },
  { id: "b05", title: "Steel Curtain",      producer: "Bar God",     genre: "Drill",    bpm: 144, price: 34.99, plays: 9200, key: "D Min",   tags: ["hard","gritty"],     featured: false, priceId: "price_beat_steel_curtain"      },
  { id: "b06", title: "Rain Garden",        producer: "FlowState.J", genre: "Lo-fi",    bpm: 82,  price: 9.99,  plays: 2140, key: "E Maj",   tags: ["chill","study"],     featured: false, priceId: "price_beat_rain_garden"        },
  { id: "b07", title: "Phantom Kick",       producer: "Krypt",       genre: "Trap",     bpm: 138, price: 27.99, plays: 7380, key: "A Min",   tags: ["808s","melodic"],    featured: false, priceId: "price_beat_phantom_kick"       },
  { id: "b08", title: "Gold Standard",      producer: "Wavetek",     genre: "Hip-Hop",  bpm: 88,  price: 32.99, plays: 4920, key: "Eb Maj",  tags: ["premium","bounce"],  featured: false, priceId: "price_beat_gold_standard"      },
  { id: "b09", title: "Night Ritual",       producer: "Nova Cipher", genre: "Neo-Soul", bpm: 70,  price: 18.99, plays: 1840, key: "F Min",   tags: ["soulful","dark"],    featured: false, priceId: "price_beat_night_ritual"       },
  { id: "b10", title: "Island Fire",        producer: "DJ Lumi",     genre: "Dancehall",bpm: 96,  price: 21.99, plays: 5630, key: "G Maj",   tags: ["vibes","dance"],     featured: true,  priceId: "price_beat_island_fire"        },
  { id: "b11", title: "Pressure Point",     producer: "Bar God",     genre: "Hip-Hop",  bpm: 95,  price: 29.99, plays: 6100, key: "C Min",   tags: ["hard","lyrical"],    featured: false, priceId: "price_beat_pressure_point"     },
  { id: "b12", title: "Neon Matrix",        producer: "FlowState.J", genre: "Pop",      bpm: 120, price: 16.99, plays: 3410, key: "D Maj",   tags: ["catchy","bright"],   featured: false, priceId: "price_beat_neon_matrix"        },
];

const SORT_OPTIONS = ["Popular", "Newest", "Price: Low", "Price: High", "BPM"];

export default function BeatsPage() {
  const router = useRouter();
  const [activeGenre, setActiveGenre] = useState("All");
  const [sort, setSort]               = useState("Popular");
  const [playing, setPlaying]         = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [cart, setCart]               = useState<Set<string>>(new Set());

  let displayed = BEATS.filter(b =>
    (activeGenre === "All" || b.genre === activeGenre) &&
    (search === "" || b.title.toLowerCase().includes(search.toLowerCase()) || b.producer.toLowerCase().includes(search.toLowerCase()))
  );

  if (sort === "Popular")      displayed = [...displayed].sort((a, b) => b.plays - a.plays);
  else if (sort === "Price: Low")  displayed = [...displayed].sort((a, b) => a.price - b.price);
  else if (sort === "Price: High") displayed = [...displayed].sort((a, b) => b.price - a.price);
  else if (sort === "BPM")     displayed = [...displayed].sort((a, b) => b.bpm - a.bpm);

  const featured = BEATS.filter(b => b.featured);

  function buyBeat(beat: Beat) {
    router.push(`/api/stripe/checkout?priceId=${beat.priceId}&mode=payment&name=${encodeURIComponent(beat.title)}`);
  }

  function toggleCart(id: string) {
    setCart(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 100 }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .beat-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(170,45,255,0.15)}
        .beat-card{transition:transform .2s,box-shadow .2s}
      `}</style>

      {/* Nav */}
      <nav style={{ background: "rgba(0,0,0,0.85)", borderBottom: `1px solid ${ACCENT}22`, padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: ACCENT, textDecoration: "none", letterSpacing: "0.12em", flexShrink: 0 }}>TMI</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>Beat Marketplace</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
          <Link href="/beats/submit"   style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Submit Beat</Link>
          <Link href="/beat-vault"     style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Vault</Link>
          <Link href="/hub/performer"  style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Producer Hub</Link>
          {cart.size > 0 && (
            <Link href="/checkout" style={{ padding: "5px 14px", borderRadius: 6, background: ACCENT, color: "#fff", fontSize: 10, fontWeight: 900, textDecoration: "none" }}>🛒 {cart.size} Beat{cart.size > 1 ? "s" : ""}</Link>
          )}
        </div>
      </nav>

      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(circle at 35% 20%, ${ACCENT}07, transparent 55%)`, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "36px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: ACCENT, fontWeight: 900, marginBottom: 6 }}>PRODUCER MARKETPLACE</div>
          <h1 style={{ fontSize: "clamp(26px,5vw,48px)", fontWeight: 900, margin: "0 0 8px" }}>Beat Marketplace</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0 }}>Exclusive beats from TMI producers. License instantly. Download stems. Go legendary.</p>
        </div>

        {/* Featured row */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800, marginBottom: 14 }}>⭐ FEATURED BEATS</div>
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
            {featured.map(b => (
              <div key={b.id} style={{ minWidth: 200, padding: "16px", background: `linear-gradient(135deg, ${ACCENT}12, rgba(5,5,16,0.9))`, border: `1px solid ${ACCENT}30`, borderRadius: 14, flexShrink: 0 }}>
                <div style={{ height: 64, background: `${ACCENT}18`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 10 }}>🎶</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{b.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{b.producer} · {b.bpm} BPM</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: ACCENT }}>${b.price}</span>
                  <button onClick={() => buyBeat(b)} style={{ padding: "5px 12px", borderRadius: 6, background: ACCENT, color: "#fff", border: "none", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>BUY</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search + Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search beats, producers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: "10px 16px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none" }}
          />
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: "10px 14px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 12, outline: "none", cursor: "pointer" }}>
            {SORT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Genre filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {GENRES.map((g) => (
            <button key={g} onClick={() => setActiveGenre(g)} style={{ padding: "6px 14px", borderRadius: 20, background: activeGenre === g ? ACCENT : "rgba(255,255,255,0.05)", border: `1px solid ${activeGenre === g ? ACCENT : "rgba(255,255,255,0.1)"}`, color: activeGenre === g ? "#fff" : "rgba(255,255,255,0.6)", fontSize: 11, cursor: "pointer", fontWeight: 600, transition: "all .15s" }}>
              {g}
            </button>
          ))}
        </div>

        {/* Beat grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14 }}>
          {displayed.length === 0 && (
            <div style={{ gridColumn: "1/-1", padding: "48px 24px", textAlign: "center", background: `${ACCENT}06`, border: `1px solid ${ACCENT}18`, borderRadius: 14, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
              No beats found matching your filters.
            </div>
          )}
          {displayed.map((b) => (
            <div key={b.id} className="beat-card" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}18`, borderRadius: 16, padding: "20px", position: "relative", overflow: "hidden" }}>
              {b.featured && <div style={{ position: "absolute", top: 12, right: 12, fontSize: 7, fontWeight: 900, letterSpacing: "0.1em", color: "#FFD700", background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 4, padding: "2px 6px" }}>FEATURED</div>}
              <div style={{ width: "100%", height: 80, background: playing === b.id ? `linear-gradient(135deg, ${ACCENT}35, rgba(255,45,170,0.2))` : `linear-gradient(135deg, ${ACCENT}12, rgba(255,45,170,0.06))`, borderRadius: 10, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, cursor: "pointer", transition: "background .2s" }}
                onClick={() => setPlaying(playing === b.id ? null : b.id)}>
                {playing === b.id ? "⏸" : "▶"}
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4, color: "#fff" }}>{b.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>{b.producer} · {b.genre} · {b.bpm} BPM · {b.key}</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
                {b.tags.map(t => <span key={t} style={{ fontSize: 8, padding: "2px 8px", borderRadius: 10, background: `${ACCENT}12`, border: `1px solid ${ACCENT}25`, color: ACCENT, fontWeight: 700 }}>{t}</span>)}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>👁 {b.plays.toLocaleString()} plays</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 900, fontSize: 18, color: ACCENT }}>${b.price}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => toggleCart(b.id)} style={{ padding: "7px 12px", borderRadius: 7, background: cart.has(b.id) ? "rgba(0,255,136,0.15)" : "rgba(255,255,255,0.05)", border: cart.has(b.id) ? "1px solid #00FF8840" : "1px solid rgba(255,255,255,0.12)", color: cart.has(b.id) ? "#00FF88" : "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                    {cart.has(b.id) ? "✓ Added" : "+ Cart"}
                  </button>
                  <button onClick={() => buyBeat(b)} style={{ padding: "7px 16px", borderRadius: 7, background: ACCENT, color: "#fff", border: "none", fontSize: 11, cursor: "pointer", fontWeight: 800 }}>BUY NOW</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 40, padding: "24px 28px", background: `linear-gradient(135deg, ${ACCENT}0C, rgba(255,45,170,0.06))`, border: `1px solid ${ACCENT}20`, borderRadius: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 900, marginBottom: 4 }}>🎛️ PRODUCERS</div>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>Sell Your Beats on TMI</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Upload, price, and earn royalties on every sale. Keep 85% of every beat.</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/beats/submit" style={{ padding: "11px 24px", borderRadius: 9, background: ACCENT, color: "#fff", fontSize: 11, fontWeight: 900, textDecoration: "none" }}>SUBMIT BEAT</Link>
            <Link href="/hub/performer" style={{ padding: "11px 20px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>PRODUCER HUB</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
