"use client";

type SeasonReward = {
  title: string;
  description: string;
  level: number;
  accentColor: string;
};

type SeasonRewardListProps = {
  rewards: SeasonReward[];
  selectedInstrument: string;
};

export default function SeasonRewardList({ rewards, selectedInstrument }: SeasonRewardListProps) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#00FFFF", textTransform: "uppercase" }}>
        Reward List
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {rewards.map((reward) => (
          <article key={reward.title} style={{ borderRadius: 14, border: `1px solid ${reward.accentColor}30`, background: `${reward.accentColor}10`, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>{reward.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 4, lineHeight: 1.45 }}>{reward.description}</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 900, color: reward.accentColor }}>L{reward.level}</div>
            </div>
          </article>
        ))}
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
        Active instrument: <span style={{ color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>{selectedInstrument}</span>
      </div>
    </section>
  );
}