"use client";

export type SeasonInstrument = "guitar" | "drums" | "sax" | "piano" | "synth";

type InstrumentProgressionProps = {
  value: SeasonInstrument;
  onChange: (value: SeasonInstrument) => void;
};

const INSTRUMENTS: { id: SeasonInstrument; label: string; emoji: string; color: string }[] = [
  { id: "guitar", label: "Guitar", emoji: "🎸", color: "#FF2DAA" },
  { id: "drums", label: "Drums", emoji: "🥁", color: "#00FFFF" },
  { id: "sax", label: "Sax", emoji: "🎷", color: "#FFD700" },
  { id: "piano", label: "Piano", emoji: "🎹", color: "#AA2DFF" },
  { id: "synth", label: "Synth", emoji: "🎛️", color: "#00FF88" },
];

export default function InstrumentProgression({ value, onChange }: InstrumentProgressionProps) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#FFD700", textTransform: "uppercase" }}>
        Instrument Selector
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {INSTRUMENTS.map((instrument) => {
          const active = instrument.id === value;
          return (
            <button
              key={instrument.id}
              type="button"
              onClick={() => onChange(instrument.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                borderRadius: 14,
                border: `1px solid ${active ? instrument.color : "rgba(255,255,255,0.08)"}`,
                background: active ? `${instrument.color}14` : "rgba(255,255,255,0.03)",
                color: "#fff",
                padding: "12px 14px",
                cursor: "pointer",
              }}
            >
              <span>{instrument.emoji} {instrument.label}</span>
              <span style={{ fontSize: 9, color: active ? instrument.color : "rgba(255,255,255,0.35)", letterSpacing: "0.16em" }}>
                {active ? "ACTIVE" : "SELECT"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}