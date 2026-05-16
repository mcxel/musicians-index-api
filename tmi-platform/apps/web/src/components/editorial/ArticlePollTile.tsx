type PollChoice = {
  label: string;
  percent: number;
};

type ArticlePollTileProps = {
  question: string;
  choices: PollChoice[];
  accent: string;
};

export default function ArticlePollTile({ question, choices, accent }: ArticlePollTileProps) {
  return (
    <section
      style={{
        borderRadius: 14,
        border: `1px solid ${accent}55`,
        background: `linear-gradient(160deg, ${accent}18, rgba(255,255,255,0.1), rgba(255,255,255,0.03))`,
        padding: "14px 14px 12px",
      }}
    >
      <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>Live Poll</div>
      <h3 style={{ margin: "0 0 10px", fontSize: 14, lineHeight: 1.25 }}>{question}</h3>
      <div style={{ display: "grid", gap: 8 }}>
        {choices.map((choice) => (
          <div key={choice.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4, color: "rgba(255,255,255,0.8)" }}>
              <span>{choice.label}</span>
              <span style={{ color: accent, fontWeight: 800 }}>{choice.percent}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${choice.percent}%`,
                  height: "100%",
                  borderRadius: 99,
                  background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.95))`,
                  animation: "pollGrow 1.4s ease-out",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
