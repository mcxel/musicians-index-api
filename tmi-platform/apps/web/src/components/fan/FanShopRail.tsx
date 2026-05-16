"use client";

type FanShopRailProps = {
  onAction: (action: string) => void;
};

const SECTIONS = [
  {
    title: "Shop",
    color: "#ffb84a",
    items: [
      { id: "shop-merch", label: "Merch Drop", icon: "👕", note: "5 items" },
      { id: "shop-beats", label: "Beat Store", icon: "🎵", note: "12 tracks" },
      { id: "shop-nft", label: "NFT Gallery", icon: "🖼️", note: "Limited" },
    ],
  },
  {
    title: "Cosmetics",
    color: "#5ad7ff",
    items: [
      { id: "cosmetics-skins", label: "Venue Skins", icon: "🎨", note: "3 new" },
      { id: "cosmetics-props", label: "Stage Props", icon: "🎪", note: "8 items" },
      { id: "cosmetics-emotes", label: "Emotes Pack", icon: "✨", note: "Gold only" },
    ],
  },
  {
    title: "Points",
    color: "#ff7b2f",
    items: [
      { id: "punpoints", label: "PunPoints", icon: "⭐", note: "Redeem" },
      { id: "billboard-fans", label: "Billboard Fan", icon: "📋", note: "Top fans" },
      { id: "upgrade", label: "Upgrade Tier", icon: "🚀", note: "Unlock more" },
    ],
  },
  {
    title: "Earn",
    color: "#62ecff",
    items: [
      { id: "watch & earn", label: "Watch & Earn", icon: "📺", note: "+25 FP" },
      { id: "sponsor-task", label: "Sponsor Task", icon: "💼", note: "3 active" },
      { id: "trivia-earn", label: "Trivia Bonus", icon: "🎯", note: "+50 FP" },
    ],
  },
];

export default function FanShopRail({ onAction }: FanShopRailProps) {
  return (
    <aside
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        borderRadius: 18,
        border: "1px solid rgba(255,120,45,0.28)",
        background: "rgba(6,14,30,0.94)",
        padding: 12,
        boxShadow: "inset 0 0 0 1px rgba(90,215,255,0.1)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#6ec8ef",
          fontWeight: 800,
          marginBottom: 2,
        }}
      >
        Right Rail
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title}>
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: section.color,
              fontWeight: 900,
              marginBottom: 6,
              paddingLeft: 2,
            }}
          >
            {section.title}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {section.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onAction(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "left",
                  borderRadius: 10,
                  border: `1px solid ${section.color}28`,
                  background: `${section.color}0c`,
                  color: "#d1edff",
                  fontSize: 12,
                  padding: "8px 10px",
                  cursor: "pointer",
                  boxShadow: `inset 0 0 0 1px ${section.color}14`,
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "#d9f2ff", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 10, color: section.color, fontWeight: 600 }}>{item.note}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
