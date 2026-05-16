import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Instruments | TMI" };

const FAMILIES = [
  { family: "String", count: 12, instruments: ["Guitar", "Bass", "Violin", "Cello", "Sitar", "Oud", "Kora", "Erhu", "Guzheng", "Shamisen", "Balalaika", "Banjo"] },
  { family: "Percussion", count: 8, instruments: ["Drums", "Tabla", "Djembe", "Taiko", "Steel Pan", "Xylophone", "Marimba", "Bongos"] },
  { family: "Wind", count: 9, instruments: ["Trumpet", "Saxophone", "Flute", "Harmonica", "Bagpipes", "Pan Flute", "Didgeridoo", "Accordion", "Clarinet"] },
  { family: "Keys", count: 4, instruments: ["Piano", "Keyboard", "Organ", "Synthesizer"] },
  { family: "Electronic", count: 6, instruments: ["Turntables / DJ", "MPC / Sampler", "Drum Machine", "Sequencer", "Modular Synth", "Vocoder"] },
  { family: "Vocal / Beatbox", count: 2, instruments: ["Beatbox", "Vocal Technique"] },
];

export default function AdminInstrumentsPage() {
  const total = FAMILIES.reduce((a, f) => a + f.count, 0);
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#00FFFF", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Instrument Registry</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{total} instruments registered across {FAMILIES.length} families — global coverage</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 16 }}>
          {FAMILIES.map(f => (
            <div key={f.family} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,255,255,0.1)", borderRadius: 12, padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{f.family}</div>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#00FFFF" }}>{f.count}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {f.instruments.map(inst => (
                  <span key={inst} style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "3px 8px" }}>{inst}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
